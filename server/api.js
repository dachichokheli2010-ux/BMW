import {hashPassword,verifyPassword,randomToken,tokenHash,timingSafeEqual} from './passwords.js';
import {validName,normalizeEmail,validPassword,emptyGarage,validateGarage} from './validation.js';
import {validateAcademyTransition} from './academy-policy.js';
import {accountMailConfigured,sendAccountMail} from './account-mail.js';
import {COMMUNITY_PATHS,handleCommunity} from './community-api.js';
import {administratorUser} from './admin-policy.js';
import {ADMIN_AUTH_PATHS,getAdminSession,handleAdminAuth} from './admin-auth.js';
import {handleAdminAccounts} from './admin-accounts.js';
import {handleSiteAsk} from './site-helper.js';

const SESSION_MS=7*24*60*60*1000;
export const AUTH_PATHS=new Set(['/api/auth/session','/api/auth/signup','/api/auth/login','/api/auth/logout','/api/auth/forgot-password','/api/auth/reset-password','/api/auth/verify-email','/api/auth/resend-verification','/api/account/profile','/api/garage','/api/admin/accounts',...COMMUNITY_PATHS,...ADMIN_AUTH_PATHS]);
const json=(body,status=200,headers={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store','Pragma':'no-cache','X-Content-Type-Options':'nosniff','Vary':'Cookie',...headers}});
class ApiError extends Error {constructor(message,status=400,code){super(message);this.status=status;this.code=code;}}
const only=(body,keys)=>body&&typeof body==='object'&&!Array.isArray(body)&&Object.keys(body).every(key=>keys.includes(key));
const viewUser=row=>({id:row.id,email:row.email,name:row.name,createdAt:new Date(row.created_at).toISOString(),emailVerified:row.provider==='chatgpt'||Boolean(row.email_verified_at),language:row.language||null});
const hosted=env=>env.AUTH_PROVIDER==='chatgpt';
const providerInfo=env=>({...(hosted(env)?{provider:'chatgpt',signInUrl:'/signin-with-chatgpt?return_to=%2Faccount',signOutUrl:'/signout-with-chatgpt?return_to=%2Faccount'}:{provider:'password'}),capabilities:{passwordRecovery:!hosted(env)&&accountMailConfigured(env),emailVerification:!hosted(env)&&accountMailConfigured(env),mailConfigured:!hosted(env)&&accountMailConfigured(env)}});
const validAccountToken=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{43}$/.test(value);
const validLanguage=value=>value===undefined||['en','ka','ru'].includes(value);
const tokenMessage='This link is invalid or has expired. Request a new link and try again.';
const recoveryMessage='If this address belongs to an account, check your inbox for recovery instructions.';
const signupMessage='If this address can be registered, your account is ready. Sign in to continue.';
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
  if(row.attempts>maximum){const error=new ApiError('Too many attempts. Please try again in a few minutes.',429);error.retryAfter=Math.max(1,Math.ceil((row.expires_at-now)/1000));throw error;}
}
async function cleanExpired(env){const now=Date.now();await env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now).run();await env.DB.prepare('DELETE FROM auth_limits WHERE expires_at <= ?').bind(now).run();await env.DB.prepare('DELETE FROM account_tokens WHERE expires_at <= ?').bind(now).run();}
async function issueAccountToken(env,user,purpose,language){
  const token=randomToken(),hash=await tokenHash(token),now=Date.now(),expiry=purpose==='reset'?30*60*1000:24*60*60*1000;
  await env.DB.batch([
    env.DB.prepare('DELETE FROM account_tokens WHERE user_id = ? AND purpose = ?').bind(user.id,purpose),
    env.DB.prepare('INSERT INTO account_tokens (token_hash,user_id,purpose,created_at,expires_at) VALUES (?,?,?,?,?)').bind(hash,user.id,purpose,now,now+expiry)
  ]);
  try{await sendAccountMail(env,{to:user.email,purpose,token,language,idempotencyKey:'account-'+hash});}
  catch{
    await env.DB.prepare('DELETE FROM account_tokens WHERE token_hash = ?').bind(hash).run();
    // Public recovery/signup responses stay identical for known and unknown mail.
    console.error('Account email could not be delivered.');
  }
}
async function applyAccountToken(env,token,purpose,password){
  const hash=await tokenHash(token),claim=await tokenHash(randomToken()),now=Date.now();
  const owner='SELECT user_id FROM account_tokens WHERE token_hash = ?';
  // Claim and effects share one transaction. A failed write restores the original
  // link; another request can neither consume it twice nor observe this marker.
  const statements=[env.DB.prepare("UPDATE account_tokens SET token_hash = ? WHERE token_hash = ? AND purpose = ? AND expires_at > ? AND EXISTS (SELECT 1 FROM users WHERE users.id = account_tokens.user_id AND users.provider = 'password') RETURNING user_id").bind(claim,hash,purpose,now)];
  if(purpose==='reset')statements.push(
    env.DB.prepare(`UPDATE users SET password_hash = ?, updated_at = ? WHERE id = (${owner}) AND provider = 'password'`).bind(password,now,claim),
    env.DB.prepare(`DELETE FROM sessions WHERE user_id = (${owner})`).bind(claim)
  );
  statements.push(
    env.DB.prepare(`INSERT INTO user_verifications (user_id,verified_at) SELECT user_id,? FROM account_tokens WHERE token_hash = ? ON CONFLICT(user_id) DO UPDATE SET verified_at = excluded.verified_at`).bind(now,claim),
    env.DB.prepare(purpose==='reset'?`DELETE FROM account_tokens WHERE user_id = (${owner})`:'DELETE FROM account_tokens WHERE token_hash = ?').bind(claim)
  );
  const results=await env.DB.batch(statements);
  return results[0]?.results?.[0]||null;
}
async function createSession(request,env,userId,previousTokenHash=null){
  const token=randomToken(),csrfToken=randomToken(),hash=await tokenHash(token),now=Date.now();
  // A failed replacement must leave the prior session usable for retry.
  await env.DB.batch([
    ...(previousTokenHash?[env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(previousTokenHash)]:[]),
    env.DB.prepare('INSERT INTO sessions (token_hash, user_id, csrf_token, created_at, expires_at) VALUES (?, ?, ?, ?, ?)').bind(hash,userId,csrfToken,now,now+SESSION_MS),
    env.DB.prepare('INSERT INTO user_login_activity (user_id,sign_in_count,last_signed_in_at) VALUES (?,1,?) ON CONFLICT(user_id) DO UPDATE SET sign_in_count = user_login_activity.sign_in_count + 1, last_signed_in_at = CASE WHEN user_login_activity.last_signed_in_at > excluded.last_signed_in_at THEN user_login_activity.last_signed_in_at ELSE excluded.last_signed_in_at END').bind(userId,now),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash <> ? AND token_hash NOT IN (SELECT token_hash FROM sessions WHERE user_id = ? AND token_hash <> ? ORDER BY created_at DESC, token_hash DESC LIMIT 9)').bind(userId,hash,userId,hash)
  ]);
  return {csrfToken,tokenHash:hash,cookie:setCookie(request,token)};
}
async function getSession(request,env){
  const token=readCookie(request);let session=null;
  if(token)session=await env.DB.prepare('SELECT users.*, user_verifications.verified_at AS email_verified_at, user_preferences.language, sessions.csrf_token, sessions.token_hash FROM sessions INNER JOIN users ON users.id = sessions.user_id LEFT JOIN user_verifications ON user_verifications.user_id = users.id LEFT JOIN user_preferences ON user_preferences.user_id = users.id WHERE sessions.token_hash = ? AND sessions.expires_at > ?').bind(await tokenHash(token),Date.now()).first();
  if(session&&!validAccountToken(session.csrf_token))session=null;
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
  const user=await env.DB.prepare('SELECT users.*, user_preferences.language FROM users LEFT JOIN user_preferences ON user_preferences.user_id = users.id WHERE users.id = ?').bind(id).first();
  const appSession=await createSession(request,env,id);
  return {user:{...viewUser(user),email},...appSession};
}
function authRequired(session){if(!session)throw new ApiError('Sign in to access your garage.',401);}
function requireCSRF(request,session){authRequired(session);if(!timingSafeEqual(request.headers.get('X-CSRF-Token')||'',session.csrfToken))throw new ApiError('Your session changed. Refresh this page before saving.',403);}
const sessionHeaders=session=>session?.cookie?{'Set-Cookie':session.cookie}:{};
async function garageSnapshot(env,userId,{internal=false}={}){
  const row=await env.DB.prepare('SELECT state, revision, updated_at FROM user_garages WHERE user_id = ?').bind(userId).first();
  if(!row)return {state:emptyGarage(),revision:0,updatedAt:null,...(internal?{receiptLedger:null}:{})};
  const {_academyReceipts:receiptLedger,...state}=JSON.parse(row.state);
  return {state,revision:row.revision,updatedAt:new Date(row.updated_at).toISOString(),...(internal?{receiptLedger}:{} )};
}

// Portable Fetch API entry point. Unowned routes return null so the existing
// platform garage endpoint and static-asset router can continue to handle them.
export async function handleApi(request,env={}){
  const pathname=new URL(request.url).pathname;
  if(pathname==='/api/ask')return handleSiteAsk(request);
  if(!AUTH_PATHS.has(pathname))return pathname.startsWith('/api/auth/')||pathname.startsWith('/api/account/')||pathname.startsWith('/api/admin/')?json({error:'Not found.'},404):null;
  if(!env.DB)return json({error:'Account storage is unavailable. Please try again later.'},503);
  let session;
  try{
    const method=request.method,write=['POST','PUT','PATCH','DELETE'].includes(method);
    if(write)requireOrigin(request);
    if(ADMIN_AUTH_PATHS.has(pathname))return await handleAdminAuth(request,env,{ApiError,readJSON,requireCSRF,limit,json});
    const adminRoute=pathname.startsWith('/api/admin/');
    const adminSession=adminRoute||pathname==='/api/community/car-photo'?await getAdminSession(request,env):null;
    session=adminRoute?adminSession:await getSession(request,env);
    if(session)session.user=administratorUser(env,session.user);
    if(pathname==='/api/admin/accounts')return await handleAdminAccounts(request,env,{adminSession,ApiError,json});
    if(COMMUNITY_PATHS.has(pathname))return await handleCommunity(request,env,{session,adminSession,ApiError,readJSON,requireCSRF,authRequired,limit,json,sessionHeaders});
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
      if(!only(body,signup?['email','password','name','language']:['email','password'])||!email||!validPassword(body.password)||signup&&(!validName(body.name)||!validLanguage(body.language)))throw new ApiError(signup?'Enter a valid email, a 1–32 character name and a password with 12–128 characters.':'Enter a valid email and a password with 12–128 characters.');
      await limit(env,'auth-email:'+email,12,15*60*1000);
      if(signup)await limit(env,'signup-ip:'+ip,10,60*60*1000);
      await cleanExpired(env);
      let user;
      if(signup){
        // Hash even on duplicates, to avoid an inexpensive account-existence probe.
        const password=await hashPassword(body.password);
        const now=Date.now(),id='local:'+crypto.randomUUID();
        await env.DB.prepare("INSERT INTO users (id, provider, email, name, password_hash, created_at, updated_at) VALUES (?, 'password', ?, ?, ?, ?, ?) ON CONFLICT(email) DO NOTHING").bind(id,email,body.name.trim(),password,now,now).run();
        user=await env.DB.prepare("SELECT users.*, user_verifications.verified_at AS email_verified_at, user_preferences.language FROM users LEFT JOIN user_verifications ON user_verifications.user_id = users.id LEFT JOIN user_preferences ON user_preferences.user_id = users.id WHERE users.email = ? AND users.provider = 'password'").bind(email).first();
        if(user?.id===id&&body.language){await env.DB.prepare('INSERT INTO user_preferences (user_id,language) VALUES (?,?) ON CONFLICT(user_id) DO NOTHING').bind(id,body.language).run();user.language=body.language;}
        if(user&&!user.email_verified_at&&accountMailConfigured(env))await issueAccountToken(env,user,'verify',body.language);
        // A creation-only session would expose account existence. Both new and
        // existing addresses receive the same response and then sign in normally.
        return json({user:null,csrfToken:null,message:signupMessage,code:'SIGNUP_ACCEPTED',...info},201);
      }else{
        user=await env.DB.prepare("SELECT users.*, user_verifications.verified_at AS email_verified_at, user_preferences.language FROM users LEFT JOIN user_verifications ON user_verifications.user_id = users.id LEFT JOIN user_preferences ON user_preferences.user_id = users.id WHERE users.email = ? AND users.provider = 'password'").bind(email).first();
        if(!await verifyPassword(body.password,user?.password_hash))throw new ApiError('Email or password is incorrect.',401);
      }
      const fresh=await createSession(request,env,user.id,session?.tokenHash);
      const signedInUser=administratorUser(env,viewUser(user));
      return json({user:signedInUser,csrfToken:fresh.csrfToken,...info,redirectTo:'/account'},200,sessionHeaders(fresh));
    }
    if(pathname==='/api/auth/forgot-password'){
      if(method!=='POST')return json({error:'Method not allowed.'},405,{Allow:'POST'});
      if(hosted(env))return json({error:'Use Sign in with ChatGPT to continue.',...info},403);
      await limit(env,'recovery-ip:'+(env.CLIENT_IP||'local'),15,15*60*1000);
      const body=await readJSON(request),email=normalizeEmail(body?.email);
      if(!only(body,['email','language'])||!email||!validLanguage(body.language))throw new ApiError('Enter a valid email address.',400,'INVALID_EMAIL');
      await limit(env,'recovery-email:'+email,3,15*60*1000);
      if(!accountMailConfigured(env))throw new ApiError('Password recovery email is not configured for this deployment.',503,'MAIL_UNAVAILABLE');
      await cleanExpired(env);
      const user=await env.DB.prepare("SELECT id,email FROM users WHERE email = ? AND provider = 'password'").bind(email).first();
      if(user)await issueAccountToken(env,user,'reset',body.language);
      return json({message:recoveryMessage,code:'RECOVERY_ACCEPTED'},202);
    }
    if(pathname==='/api/auth/reset-password'){
      if(method!=='POST')return json({error:'Method not allowed.'},405,{Allow:'POST'});
      if(hosted(env))return json({error:'Use Sign in with ChatGPT to continue.',...info},403);
      await limit(env,'reset-ip:'+(env.CLIENT_IP||'local'),15,15*60*1000);
      const body=await readJSON(request);
      if(!only(body,['token','password'])||!validAccountToken(body?.token)||!validPassword(body.password))throw new ApiError('Use a valid reset link and a password with 12–128 characters.',400,'INVALID_RESET');
      const password=await hashPassword(body.password),claimed=await applyAccountToken(env,body.token,'reset',password);
      if(!claimed)throw new ApiError(tokenMessage,400,'INVALID_TOKEN');
      return json({user:null,csrfToken:null,message:'Password updated. Sign in with your new password.',code:'PASSWORD_RESET'},200,{'Set-Cookie':setCookie(request,'',false)});
    }
    if(pathname==='/api/auth/verify-email'){
      if(method!=='POST')return json({error:'Method not allowed.'},405,{Allow:'POST'});
      if(hosted(env))return json({error:'Use Sign in with ChatGPT to continue.',...info},403);
      await limit(env,'verify-ip:'+(env.CLIENT_IP||'local'),30,15*60*1000);
      const body=await readJSON(request);
      if(!only(body,['token'])||!validAccountToken(body?.token))throw new ApiError(tokenMessage,400,'INVALID_TOKEN');
      const claimed=await applyAccountToken(env,body.token,'verify');
      if(!claimed)throw new ApiError(tokenMessage,400,'INVALID_TOKEN');
      const verifiedUser=session?.user.id===claimed.user_id?administratorUser(env,{...session.user,emailVerified:true}):null;
      return json({message:'Email verified. You can continue to your account.',code:'EMAIL_VERIFIED',...(verifiedUser?{user:verifiedUser}:{})},200,sessionHeaders(session));
    }
    if(pathname==='/api/auth/logout'){
      if(method!=='POST')return json({error:'Method not allowed.'},405,{Allow:'POST'});
      requireCSRF(request,session);
      await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(session.tokenHash).run();
      return json({user:null,csrfToken:null,...info},200,{'Set-Cookie':setCookie(request,'',false)});
    }
    authRequired(session);
    if(pathname==='/api/auth/resend-verification'){
      if(method!=='POST')return json({error:'Method not allowed.'},405,{Allow:'POST'});
      requireCSRF(request,session);
      if(hosted(env))return json({error:'Your provider verifies your email address.',...info},403);
      await limit(env,'verify-user:'+session.user.id,3,15*60*1000);
      const body=await readJSON(request);
      if(!only(body,['language'])||!validLanguage(body?.language))throw new ApiError('Choose a supported language.',400,'INVALID_LANGUAGE');
      if(!accountMailConfigured(env))throw new ApiError('Email verification is not configured for this deployment.',503,'MAIL_UNAVAILABLE');
      if(!session.user.emailVerified)await issueAccountToken(env,session.user,'verify',body.language);
      return json({message:'If verification is needed, check your inbox for instructions.',code:'VERIFICATION_ACCEPTED'},202,sessionHeaders(session));
    }
    if(pathname==='/api/account/profile'){
      if(method==='GET')return json({user:session.user,...info},200,sessionHeaders(session));
      if(method!=='PUT')return json({error:'Method not allowed.'},405,{Allow:'GET, PUT'});
      requireCSRF(request,session);await limit(env,'profile:'+session.user.id,30,60000);
      const body=await readJSON(request);
      if(!only(body,['name','language'])||!Object.keys(body).length||Object.hasOwn(body,'name')&&!validName(body.name)||Object.hasOwn(body,'language')&&!['en','ka','ru'].includes(body.language))throw new ApiError('Choose a name with 1–32 characters and a supported language.',400,'INVALID_PROFILE');
      const name=Object.hasOwn(body,'name')?body.name.trim():session.user.name;
      const statements=[env.DB.prepare('UPDATE users SET name = ?, updated_at = ? WHERE id = ?').bind(name,Date.now(),session.user.id)];
      if(Object.hasOwn(body,'language'))statements.push(env.DB.prepare('INSERT INTO user_preferences (user_id,language) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET language = excluded.language').bind(session.user.id,body.language));
      await env.DB.batch(statements);
      return json({user:{...session.user,name,...(Object.hasOwn(body,'language')?{language:body.language}:{})},...info},200,sessionHeaders(session));
    }
    if(pathname==='/api/garage'){
      if(method==='GET')return json(await garageSnapshot(env,session.user.id),200,sessionHeaders(session));
      if(method!=='PUT')return json({error:'Method not allowed.'},405,{Allow:'GET, PUT'});
      requireCSRF(request,session);await limit(env,'garage:'+session.user.id,120,60000);
      const body=await readJSON(request,256*1024),state=validateGarage(body?.state);
      if(!only(body,['state','revision'])||!state||!Number.isSafeInteger(body.revision)||body.revision<0)throw new ApiError('Invalid garage data. Your current input has been preserved.');
      const current=await garageSnapshot(env,session.user.id,{internal:true});
      if(body.revision!==current.revision){const {receiptLedger,...publicSnapshot}=current;return json({error:'Your garage changed in another tab or device. Review the latest save before replacing it.',...publicSnapshot},409,sessionHeaders(session));}
      const rewards=validateAcademyTransition(state.academy,current.state.academy,current.receiptLedger);
      if(!rewards.ok)throw new ApiError(rewards.error);
      const serialized=JSON.stringify({...state,_academyReceipts:rewards.ledger}),now=Date.now();
      const result=body.revision===0?await env.DB.prepare('INSERT INTO user_garages (user_id, state, revision, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(user_id) DO NOTHING').bind(session.user.id,serialized,now).run():await env.DB.prepare('UPDATE user_garages SET state = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ?').bind(serialized,now,session.user.id,body.revision).run();
      if(!result.meta?.changes)return json({error:'Your garage changed in another tab or device. Review the latest save before replacing it.',...await garageSnapshot(env,session.user.id)},409,sessionHeaders(session));
      return json({state,revision:body.revision+1,updatedAt:new Date(now).toISOString()},200,sessionHeaders(session));
    }
  }catch(error){
    if(error instanceof ApiError)return json({error:error.message,...(error.code?{code:error.code}:{})},error.status,{...sessionHeaders(session),...(error.status===429?{'Retry-After':String(error.retryAfter||900)}:{})});
    console.error('BMW account operation failed.');
    return json({error:'Account storage is temporarily unavailable. Your current input has been preserved.'},503,sessionHeaders(session));
  }
  return null;
}
