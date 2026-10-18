import {hashPassword,verifyPassword,randomToken,tokenHash,timingSafeEqual} from './passwords.js';
import {validName,normalizeEmail,validPassword,emptyGarage,validateGarage} from './validation.js';

const SESSION_MS=7*24*60*60*1000;
const AUTH_PATHS=new Set(['/api/auth/session','/api/auth/signup','/api/auth/login','/api/auth/logout','/api/account/profile','/api/garage']);
const json=(body,status=200,headers={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store','Pragma':'no-cache','X-Content-Type-Options':'nosniff','Vary':'Cookie',...headers}});
class ApiError extends Error {constructor(message,status=400){super(message);this.status=status;}}
const only=(body,keys)=>body&&typeof body==='object'&&!Array.isArray(body)&&Object.keys(body).every(key=>keys.includes(key));
const viewUser=row=>({id:row.id,email:row.email,name:row.name,createdAt:new Date(row.created_at).toISOString()});
const hosted=env=>env.AUTH_PROVIDER==='chatgpt';
const providerInfo=env=>hosted(env)?{provider:'chatgpt',signInUrl:'/signin-with-chatgpt?return_to=%2Faccount',signOutUrl:'/signout-with-chatgpt?return_to=%2Faccount'}:{provider:'password'};
function cookieName(request){return new URL(request.url).protocol==='https:'?'__Host-bmw_session':'bmw_session';}
function setCookie(request,token,expires=true){return `${cookieName(request)}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${expires?SESSION_MS/1000:0}${new URL(request.url).protocol==='https:'?'; Secure':''}`;}
function readCookie(request){
  const name=cookieName(request)+'=';
  const value=(request.headers.get('Cookie')||'').split(';').map(part=>part.trim()).find(part=>part.startsWith(name))?.slice(name.length);
  return typeof value==='string'&&/^[A-Za-z0-9_-]{43}$/.test(value)?value:null;
}
function requireOrigin(request){
  const origin=request.headers.get('Origin'),site=request.headers.get('Sec-Fetch-Site');
  if(site==='cross-site'||site==='same-site'||origin&&origin!==new URL(request.url).origin||!origin&&site!=='same-origin')throw new ApiError('Open this site directly before making changes.',403);
}
async function readJSON(request,max=16384){
  if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type')||''))throw new ApiError('Use application/json for this request.',415);
  const size=request.headers.get('Content-Length');
  if(size!==null&&(!/^\d+$/.test(size)||Number(size)>max))throw new ApiError('The request is too large.',413);
  const reader=request.body?.getReader();if(!reader)throw new ApiError('A JSON request body is required.');
  let length=0;const chunks=[];
  try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>max){await reader.cancel();throw new ApiError('The request is too large.',413);}chunks.push(value);}}finally{reader.releaseLock();}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{throw new ApiError('The request must contain valid JSON.');}
}
async function limit(env,key,maximum,window){
  const now=Date.now(),hashed=await tokenHash(key);
  const row=await env.DB.prepare('INSERT INTO auth_limits (key, attempts, window_start, expires_at) VALUES (?, 1, ?, ?) ON CONFLICT(key) DO UPDATE SET attempts = CASE WHEN auth_limits.expires_at <= ? THEN 1 ELSE auth_limits.attempts + 1 END, window_start = CASE WHEN auth_limits.expires_at <= ? THEN ? ELSE auth_limits.window_start END, expires_at = CASE WHEN auth_limits.expires_at <= ? THEN ? ELSE auth_limits.expires_at END RETURNING attempts, expires_at').bind(hashed,now,now+window,now,now,now,now,now+window).first();
  if(row.attempts>maximum)throw new ApiError('Too many attempts. Please try again in a few minutes.',429);
}
async function cleanExpired(env){const now=Date.now();await env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now).run();await env.DB.prepare('DELETE FROM auth_limits WHERE expires_at <= ?').bind(now).run();}
async function createSession(request,env,userId){
  const token=randomToken(),csrfToken=randomToken(),hash=await tokenHash(token),now=Date.now();
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, csrf_token, created_at, expires_at) VALUES (?, ?, ?, ?, ?)').bind(hash,userId,csrfToken,now,now+SESSION_MS).run();
  await env.DB.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash NOT IN (SELECT token_hash FROM sessions WHERE user_id = ? ORDER BY created_at DESC, token_hash DESC LIMIT 10)').bind(userId,userId).run();
  return {csrfToken,tokenHash:hash,cookie:setCookie(request,token)};
}
async function getSession(request,env){
  const token=readCookie(request);let session=null;
  if(token)session=await env.DB.prepare('SELECT users.*, sessions.csrf_token, sessions.token_hash FROM sessions INNER JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > ?').bind(await tokenHash(token),Date.now()).first();
  if(!hosted(env))return session&&session.provider==='password'?{user:viewUser(session),csrfToken:session.csrf_token,tokenHash:session.token_hash}:null;
  // Only the Sites gateway supplies these headers. The local server always uses
  // password mode and never treats an oai-* request header as authentication.
  const externalId=request.headers.get('oai-authenticated-user-id'),email=normalizeEmail(request.headers.get('oai-authenticated-user-email'));
  if(!externalId||externalId.length>512||!email)return null;
  const id='chatgpt:'+await tokenHash(externalId);
  if(session?.provider==='chatgpt'&&session.id===id)return {user:{...viewUser(session),email},csrfToken:session.csrf_token,tokenHash:session.token_hash};
  let name=email.split('@')[0];
  if(request.headers.get('oai-authenticated-user-full-name-encoding')==='percent-encoded-utf-8'){
    try{const decoded=decodeURIComponent(request.headers.get('oai-authenticated-user-full-name')||'');if(validName(decoded))name=decoded.trim();}catch{}
  }
  name=validName(name)?name:'BMW driver';
  const now=Date.now();
  // Platform and local accounts have separate identities; never link by email.
  // Platform email is supplied live and is intentionally not a unique DB key.
  await env.DB.prepare("INSERT INTO users (id, provider, email, name, password_hash, created_at, updated_at) VALUES (?, 'chatgpt', NULL, ?, NULL, ?, ?) ON CONFLICT(id) DO NOTHING").bind(id,name,now,now).run();
  const user=await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  const appSession=await createSession(request,env,id);
  return {user:{...viewUser(user),email},...appSession};
}
function authRequired(session){if(!session)throw new ApiError('Sign in to access your garage.',401);}
function requireCSRF(request,session){authRequired(session);if(!timingSafeEqual(request.headers.get('X-CSRF-Token')||'',session.csrfToken))throw new ApiError('Your session changed. Refresh this page before saving.',403);}
const sessionHeaders=session=>session?.cookie?{'Set-Cookie':session.cookie}:{};
async function garageSnapshot(env,userId){
  const row=await env.DB.prepare('SELECT state, revision, updated_at FROM user_garages WHERE user_id = ?').bind(userId).first();
  return row?{state:JSON.parse(row.state),revision:row.revision,updatedAt:new Date(row.updated_at).toISOString()}:{state:emptyGarage(),revision:0,updatedAt:null};
}

// Portable Fetch API entry point. Unowned routes return null so the existing
// platform garage endpoint and static-asset router can continue to handle them.
export async function handleApi(request,env={}){
  const pathname=new URL(request.url).pathname;
  if(!AUTH_PATHS.has(pathname))return pathname.startsWith('/api/auth/')||pathname.startsWith('/api/account/')?json({error:'Not found.'},404):null;
  if(!env.DB)return json({error:'Account storage is unavailable. Please try again later.'},503);
  let session;
  try{
    const method=request.method,write=['POST','PUT','PATCH','DELETE'].includes(method);
    if(write)requireOrigin(request);
    session=await getSession(request,env);
    const info=providerInfo(env);
    if(pathname==='/api/auth/session'){
      if(method!=='GET')return json({error:'Method not allowed.'},405,{Allow:'GET'});
      return json({user:session?.user||null,csrfToken:session?.csrfToken||null,...info},200,sessionHeaders(session));
    }
    if(pathname==='/api/auth/signup'||pathname==='/api/auth/login'){
      if(method!=='POST')return json({error:'Method not allowed.'},405,{Allow:'POST'});
      if(hosted(env))return json({error:'Use Sign in with ChatGPT to continue.',...info},403);
      const ip=env.CLIENT_IP||'local',signup=pathname.endsWith('/signup');
      await limit(env,'auth-ip:'+ip,30,15*60*1000);
      const body=await readJSON(request);
      const email=normalizeEmail(body?.email);
      if(!only(body,signup?['email','password','name']:['email','password'])||!email||!validPassword(body.password)||signup&&!validName(body.name))throw new ApiError(signup?'Enter a valid email, a 1–32 character name and a password with 12–128 characters.':'Enter a valid email and a password with 12–128 characters.');
      await limit(env,'auth-email:'+email,12,15*60*1000);
      if(signup)await limit(env,'signup-ip:'+ip,10,60*60*1000);
      await cleanExpired(env);
      let user;
      if(signup){
        const existing=await env.DB.prepare("SELECT id FROM users WHERE email = ? AND provider = 'password'").bind(email).first();
        // Hash even on duplicates, to avoid an inexpensive account-existence probe.
        const password=await hashPassword(body.password);
        if(existing)throw new ApiError('Unable to create this account. Try signing in or use another email.',409);
        const now=Date.now(),id='local:'+crypto.randomUUID();
        const created=await env.DB.prepare("INSERT INTO users (id, provider, email, name, password_hash, created_at, updated_at) VALUES (?, 'password', ?, ?, ?, ?, ?) ON CONFLICT(email) DO NOTHING").bind(id,email,body.name.trim(),password,now,now).run();
        if(!created.meta?.changes)throw new ApiError('Unable to create this account. Try signing in or use another email.',409);
        user=await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
      }else{
        user=await env.DB.prepare("SELECT * FROM users WHERE email = ? AND provider = 'password'").bind(email).first();
        if(!await verifyPassword(body.password,user?.password_hash))throw new ApiError('Email or password is incorrect.',401);
      }
      if(session?.tokenHash)await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(session.tokenHash).run();
      const fresh=await createSession(request,env,user.id);
      return json({user:viewUser(user),csrfToken:fresh.csrfToken,...info},signup?201:200,sessionHeaders(fresh));
    }
    if(pathname==='/api/auth/logout'){
      if(method!=='POST')return json({error:'Method not allowed.'},405,{Allow:'POST'});
      requireCSRF(request,session);
      await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(session.tokenHash).run();
      return json({user:null,csrfToken:null,...info},200,{'Set-Cookie':setCookie(request,'',false)});
    }
    authRequired(session);
    if(pathname==='/api/account/profile'){
      if(method==='GET')return json({user:session.user,...info},200,sessionHeaders(session));
      if(method!=='PUT')return json({error:'Method not allowed.'},405,{Allow:'GET, PUT'});
      requireCSRF(request,session);await limit(env,'profile:'+session.user.id,30,60000);
      const body=await readJSON(request);
      if(!only(body,['name'])||!validName(body.name))throw new ApiError('Choose a name with 1–32 characters.');
      await env.DB.prepare('UPDATE users SET name = ?, updated_at = ? WHERE id = ?').bind(body.name.trim(),Date.now(),session.user.id).run();
      return json({user:{...session.user,name:body.name.trim()}},200,sessionHeaders(session));
    }
    if(pathname==='/api/garage'){
      if(method==='GET')return json(await garageSnapshot(env,session.user.id),200,sessionHeaders(session));
      if(method!=='PUT')return json({error:'Method not allowed.'},405,{Allow:'GET, PUT'});
      requireCSRF(request,session);await limit(env,'garage:'+session.user.id,120,60000);
      const body=await readJSON(request,256*1024),state=validateGarage(body?.state);
      if(!only(body,['state','revision'])||!state||!Number.isSafeInteger(body.revision)||body.revision<0)throw new ApiError('Invalid garage data. Your current input has been preserved.');
      const serialized=JSON.stringify(state),now=Date.now();
      const result=body.revision===0?await env.DB.prepare('INSERT INTO user_garages (user_id, state, revision, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(user_id) DO NOTHING').bind(session.user.id,serialized,now).run():await env.DB.prepare('UPDATE user_garages SET state = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ?').bind(serialized,now,session.user.id,body.revision).run();
      if(!result.meta?.changes)return json({error:'Your garage changed in another tab or device. Review the latest save before replacing it.',...await garageSnapshot(env,session.user.id)},409,sessionHeaders(session));
      return json({state,revision:body.revision+1,updatedAt:new Date(now).toISOString()},200,sessionHeaders(session));
    }
  }catch(error){
    if(error instanceof ApiError)return json({error:error.message},error.status,{...sessionHeaders(session),...(error.status===429?{'Retry-After':'900'}:{})});
    console.error('BMW account operation failed.');
    return json({error:'Account storage is temporarily unavailable. Your current input has been preserved.'},503,sessionHeaders(session));
  }
  return null;
}
