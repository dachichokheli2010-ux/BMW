import {normalizeEmail} from './validation.js';
import {randomToken,tokenHash,timingSafeEqual,verifyPassword} from './passwords.js';
import {environmentValue} from './environment-values.js';

export const ADMIN_AUTH_PATHS=new Set(['/api/admin/session','/api/admin/login','/api/admin/logout']);
const SESSION_MS=8*60*60*1000;
const PRINCIPAL_ID='administrator:owner';
const passwordRecord=/^pbkdf2-sha256\$600000\$[a-f0-9]{32}\$[a-f0-9]{64}$/;
const validToken=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{43}$/.test(value);
const only=(body,keys)=>body&&typeof body==='object'&&!Array.isArray(body)&&Object.keys(body).every(key=>keys.includes(key));

export function adminConfiguration(env={}){
 const email=normalizeEmail(environmentValue(env.ADMIN_LOGIN_EMAIL)),passwordHash=environmentValue(env.ADMIN_PASSWORD_HASH);
 return email&&typeof passwordHash==='string'&&passwordRecord.test(passwordHash)?{email,passwordHash}:null;
}
const secure=request=>new URL(request.url).protocol==='https:';
const cookieName=request=>secure(request)?'__Host-bmw_admin':'bmw_admin';
const setCookie=(request,token,active=true)=>`${cookieName(request)}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${active?SESSION_MS/1000:0}${secure(request)?'; Secure':''}`;
function readCookie(request){
 const prefix=cookieName(request)+'=',value=(request.headers.get('Cookie')||'').split(';').map(part=>part.trim()).find(part=>part.startsWith(prefix))?.slice(prefix.length);
 return typeof value==='string'&&/^[A-Za-z0-9_-]{43}$/.test(value)?value:null;
}
// The namespace prevents public account cookies from being accepted here (and
// vice versa). Including the active credential record revokes every old admin
// session as soon as either server credential changes.
const sessionHash=(config,token)=>tokenHash('bmw-admin\0'+config.email+'\0'+config.passwordHash+'\0'+token).then(hash=>'admin:'+hash);
export async function getAdminSession(request,env){
 const config=adminConfiguration(env),token=readCookie(request);if(!config||!token)return null;
 const hash=await sessionHash(config,token);
 const row=await env.DB.prepare("SELECT sessions.csrf_token,sessions.token_hash FROM sessions INNER JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.user_id = ? AND users.provider = 'administrator' AND sessions.expires_at > ?").bind(hash,PRINCIPAL_ID,Date.now()).first();
 return row&&validToken(row.csrf_token)&&row.token_hash===hash?{user:{id:PRINCIPAL_ID,name:'Administrator'},csrfToken:row.csrf_token,tokenHash:row.token_hash}:null;
}
export async function handleAdminAuth(request,env,{ApiError,readJSON,requireCSRF,limit,json}){
 const path=new URL(request.url).pathname,method=request.method,config=adminConfiguration(env),configured=Boolean(config);
 const snapshot=session=>({configured,user:session?.user||null,csrfToken:session?.csrfToken||null});
 const allowed=path==='/api/admin/session'?'GET':'POST';
 if(method!==allowed)return json({error:'Method not allowed.'},405,{Allow:allowed});
 const session=await getAdminSession(request,env);
 if(path==='/api/admin/session')return json(snapshot(session));
 if(path==='/api/admin/logout'){
  if(session){requireCSRF(request,session);await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(session.tokenHash).run();}
  return json(snapshot(null),200,{'Set-Cookie':setCookie(request,'',false)});
 }
 if(!configured)throw new ApiError('Administrator sign-in is not configured for this deployment.',503,'ADMIN_UNAVAILABLE');
 await limit(env,'admin-login-ip:'+(env.CLIENT_IP||'unknown'),10,15*60*1000);
 const body=await readJSON(request,2048),email=normalizeEmail(body?.email);
 if(!only(body,['email','password'])||!email||typeof body.password!=='string'||body.password.length<1||body.password.length>128)throw new ApiError('Email or password is incorrect.',401,'INVALID_ADMIN_LOGIN');
 await limit(env,'admin-login-email:'+email,10,15*60*1000);
 const matchesPassword=await verifyPassword(body.password,config.passwordHash);
 if(!timingSafeEqual(email,config.email)||!matchesPassword)throw new ApiError('Email or password is incorrect.',401,'INVALID_ADMIN_LOGIN');
 const token=randomToken(),csrfToken=randomToken(),hash=await sessionHash(config,token),now=Date.now();
 // A separate, non-login principal is used solely for existing moderation audit
 // foreign keys. It has no public email/password and cannot sign in as a member.
 await env.DB.batch([
  env.DB.prepare("INSERT INTO users (id,provider,email,name,password_hash,created_at,updated_at) VALUES (?,'administrator',NULL,'Administrator',NULL,?,?) ON CONFLICT(id) DO NOTHING").bind(PRINCIPAL_ID,now,now),
  env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now),
  env.DB.prepare('DELETE FROM auth_limits WHERE expires_at <= ?').bind(now),
  ...(session?[env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(session.tokenHash)]:[]),
  env.DB.prepare('INSERT INTO sessions (token_hash,user_id,csrf_token,created_at,expires_at) VALUES (?,?,?,?,?)').bind(hash,PRINCIPAL_ID,csrfToken,now,now+SESSION_MS),
  // Always retain this login, including clock changes or same-millisecond ties.
  env.DB.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash <> ? AND token_hash NOT IN (SELECT token_hash FROM sessions WHERE user_id = ? AND token_hash <> ? ORDER BY created_at DESC,token_hash DESC LIMIT 4)').bind(PRINCIPAL_ID,hash,PRINCIPAL_ID,hash)
 ]);
 return json(snapshot({user:{id:PRINCIPAL_ID,name:'Administrator'},csrfToken}),200,{'Set-Cookie':setCookie(request,token)});
}
