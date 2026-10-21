import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {createLocalDatabase} from '../server/local-db.mjs';
import {initializePostgres,createPostgresAdapter} from '../server/postgres-db.js';
import {handleApi} from '../server/api.js';
import {hashPassword,verifyPassword,randomToken,tokenHash} from '../server/passwords.js';

let checks=0;
const check=(value,message)=>{assert.ok(value,message);checks++;};
const sqlite=await createLocalDatabase(':memory:'),pg=new PGlite();
const query=async(sql,values=[])=>{const result=await pg.query(sql,values);return {rows:result.rows,rowCount:result.affectedRows??result.rows.length};};
const transaction=statements=>pg.transaction(async tx=>{const results=[];for(const [sql,values]of statements)results.push(await tx.query(sql,values));return results;});
await initializePostgres(query,transaction);
async function suite(DB,label){
 const origin='https://private.garage.test',password=randomToken(),email='private-owner@example.test';
 const env={DB,AUTH_PROVIDER:'password',CLIENT_IP:label,ADMIN_LOGIN_EMAIL:email,ADMIN_PASSWORD_HASH:await hashPassword(password),ADMIN_EMAILS:email};
 async function call(route,{method='GET',body,cookie,csrf,headers={}}={}){
  const response=await handleApi(new Request(origin+route,{method,headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CSRF-Token':csrf}:{}),...headers},...(body===undefined?{}:{body:JSON.stringify(body)})}),env);
  return {status:response.status,data:await response.json(),cookie:response.headers.get('Set-Cookie')?.split(';')[0],headers:response.headers};
 }
 const guest=await call('/api/admin/session');
 check(guest.status===200&&guest.data.configured&&guest.data.user===null&&guest.data.csrfToken===null,label+' guest sees a signed-out private workspace');
 check(!JSON.stringify(guest.data).includes(email)&&!JSON.stringify(guest.data).includes('pbkdf2'),label+' private configuration stays server-only');
 check(guest.headers.get('Cache-Control')==='no-store',label+' private session is never cached');
 check((await call('/api/admin/community')).status===401,label+' anonymous requests cannot inspect moderation');
 check((await call('/api/admin/login',{method:'POST',body:{email,password},headers:{Origin:'https://attacker.test'}})).status===403,label+' cross-origin login rejected');
 check((await call('/api/admin/login',{method:'POST',body:{email,password},headers:{Origin:'','Sec-Fetch-Site':'same-site'}})).status===403,label+' same-site login without exact origin rejected');
 check((await call('/api/admin/login',{method:'POST',body:{email,password},headers:{'Content-Type':'text/plain'}})).status===415,label+' login requires JSON');
 check((await call('/api/admin/login',{method:'POST',body:{email,password:'x'.repeat(2100)}})).status===413,label+' oversized credential bodies rejected');
 const wrongPassword=await call('/api/admin/login',{method:'POST',body:{email,password:randomToken()}});
 const wrongEmail=await call('/api/admin/login',{method:'POST',body:{email:'someone-else@example.test',password}});
 check(wrongPassword.status===401&&wrongEmail.status===401&&JSON.stringify(wrongPassword.data)===JSON.stringify(wrongEmail.data),label+' wrong email and password have the same generic failure');
 const login=await call('/api/admin/login',{method:'POST',body:{email:email.toUpperCase(),password}});
 check(login.status===200&&login.data.user.name==='Administrator'&&login.data.csrfToken.length===43,label+' case-insensitive dedicated login succeeds');
 const cookie=login.cookie,csrf=login.data.csrfToken;
 check(cookie.startsWith('__Host-bmw_admin=')&&['HttpOnly','SameSite=Strict','Secure','Path=/','Max-Age=28800'].every(part=>login.headers.get('Set-Cookie').includes(part)),label+' administrator cookie is dedicated, strict and expires after eight hours');
 check(!JSON.stringify(login.data).includes(email)&&!JSON.stringify(login.data).includes(password),label+' login response excludes credentials');
 check((await call('/api/admin/session',{cookie})).data.csrfToken===csrf,label+' dedicated session round-trips');
 check((await call('/api/admin/community',{cookie})).status===200,label+' dedicated cookie unlocks private moderation');
 check((await call('/api/garage',{cookie})).status===401&&(await call('/api/auth/session',{cookie})).data.user===null,label+' admin session cannot sign in to a public account');
 const token=cookie.split('=')[1];
 check((await call('/api/admin/session',{cookie:'__Host-bmw_session='+token})).data.user===null,label+' public cookie name cannot be used as the administrator cookie');
 const stored=await DB.prepare('SELECT token_hash,user_id,expires_at FROM sessions WHERE user_id = ?').bind(login.data.user.id).first();
 check(stored.token_hash.startsWith('admin:')&&!stored.token_hash.includes(token)&&stored.expires_at<=Date.now()+8*60*60*1000,label+' admin tokens are hashed in an isolated namespace');
 const principal=await DB.prepare('SELECT email,password_hash,provider FROM users WHERE id = ?').bind(login.data.user.id).first();
 check(principal.provider==='administrator'&&principal.email===null&&principal.password_hash===null,label+' moderation audit principal has no public login credentials');
 await DB.prepare('UPDATE sessions SET csrf_token = ? WHERE token_hash = ?').bind('',stored.token_hash).run();
 check((await call('/api/admin/session',{cookie})).data.user===null&&(await call('/api/admin/community',{cookie})).status===401,label+' incomplete administrator session records fail closed instead of accepting an empty CSRF token');
 await DB.prepare('UPDATE sessions SET csrf_token = ? WHERE token_hash = ?').bind(csrf,stored.token_hash).run();
 const sessionCount=(await DB.prepare('SELECT COUNT(*) AS count FROM sessions WHERE user_id = ?').bind(login.data.user.id).first()).count;
 const insertFailure={...DB,prepare(sql){return /^INSERT INTO sessions\b/.test(sql)?{bind:()=>DB.prepare('INSERT INTO sessions (token_hash,user_id,csrf_token,created_at,expires_at) VALUES (?,?,?,?,?)').bind(randomToken(),'missing-admin-session-principal',randomToken(),Date.now(),Date.now()+1000)}:DB.prepare(sql);}};
 env.DB=insertFailure;
 try{check((await call('/api/admin/login',{method:'POST',body:{email,password},cookie})).status===503,label+' failed administrator replacement reports a retryable storage failure');}finally{env.DB=DB;}
 check((await call('/api/admin/session',{cookie})).data.csrfToken===csrf&&(await DB.prepare('SELECT COUNT(*) AS count FROM sessions WHERE user_id = ?').bind(login.data.user.id).first()).count===sessionCount,label+' failed replacement rolls back revocation and leaves the current administrator session usable');
 const publicPassword=randomToken();
 await call('/api/auth/signup',{method:'POST',body:{name:'Public owner',email,password:publicPassword}});
 const publicLogin=await call('/api/auth/login',{method:'POST',body:{email,password:publicPassword}});
 env.ADMIN_USER_IDS=publicLogin.data.user.id;
 check(publicLogin.data.user.isAdmin===false&&publicLogin.data.redirectTo==='/account',label+' public owner login never enters the private admin workspace');
 check((await call('/api/admin/community',{cookie:publicLogin.cookie})).status===401,label+' legacy owner allowlists cannot authorize private administration');
 check((await call('/api/admin/session',{cookie:'__Host-bmw_admin='+publicLogin.cookie.split('=')[1]})).data.user===null,label+' public session tokens cannot be replayed as administrator tokens');
 const both=cookie+'; '+publicLogin.cookie;
 check((await call('/api/admin/session',{cookie:both})).data.user!==null&&(await call('/api/auth/session',{cookie:both})).data.user.id===publicLogin.data.user.id,label+' independent public and administrator sessions coexist');
 check((await call('/api/admin/accounts')).status===401&&(await call('/api/admin/accounts',{cookie:publicLogin.cookie})).status===401,label+' account directory requires the independent administrator cookie');
 const directory=await call('/api/admin/accounts?view=accounts',{cookie});
 const directoryUser=directory.data.accounts.find(item=>item.id===publicLogin.data.user.id);
 check(directory.status===200&&directory.headers.get('Cache-Control')==='no-store'&&directory.data.stats.accounts===1,label+' account analytics exclude the internal administrator principal and never cache');
 check(directoryUser?.name==='Public owner'&&directoryUser.email===email&&directoryUser.passwordConfigured===true&&directoryUser.signInCount===1&&directoryUser.activeSessions===1&&Number.isFinite(Date.parse(directoryUser.lastSignedInAt)),label+' directory reports actual successful member login metadata');
 check(directory.data.stats.activeAccounts===1&&directory.data.stats.signedInToday===1&&directory.data.stats.totalTrackedSignIns===1&&directory.data.recentSignIns[0].id===publicLogin.data.user.id,label+' account analytics aggregate successful logins and current sessions');
 const directoryJSON=JSON.stringify(directory.data);check(!['password_hash','token_hash','csrf_token',publicPassword,password,csrf,token].some(secret=>directoryJSON.includes(secret)),label+' directory exposes no passwords, stored hashes or bearer/CSRF tokens');
 const activityBefore=(await DB.prepare('SELECT sign_in_count FROM user_login_activity WHERE user_id = ?').bind(publicLogin.data.user.id).first()).sign_in_count;
 await call('/api/auth/login',{method:'POST',body:{email,password:randomToken()}});
 check((await DB.prepare('SELECT sign_in_count FROM user_login_activity WHERE user_id = ?').bind(publicLogin.data.user.id).first()).sign_in_count===activityBefore,label+' failed sign-in does not inflate successful-login analytics');
 const directoryFixtures=Array.from({length:22},(_,index)=>({id:'local:'+crypto.randomUUID(),name:index===17?'Directory 100%_ target':'Directory person '+index,email:'directory-'+index+'-'+label.toLowerCase()+'@example.test'}));
 await DB.batch(directoryFixtures.map(item=>DB.prepare("INSERT INTO users (id,provider,email,name,password_hash,created_at,updated_at) VALUES (?,'password',?,?,NULL,?,?)").bind(item.id,item.email,item.name,Date.now(),Date.now())));
 const pages=await call('/api/admin/accounts?pageSize=5',{cookie}),directoryIds=new Set();
 for(let page=1;page<=pages.data.pagination.totalPages;page++){const result=await call('/api/admin/accounts?pageSize=5&page='+page,{cookie});for(const item of result.data.accounts){check(!directoryIds.has(item.id),label+' account pagination has deterministic unique rows');directoryIds.add(item.id);}}
 check(directoryIds.size===23&&pages.data.pagination.total===23&&pages.data.pagination.hasNext,label+' paginated directory reaches every registered user');
 const accountSearch=await call('/api/admin/accounts?q='+encodeURIComponent('100%_'),{cookie});check(accountSearch.data.pagination.total===1&&accountSearch.data.accounts[0].name==='Directory 100%_ target',label+' account search escapes SQL wildcard characters literally');
 const untracked=await call('/api/admin/accounts?status=never-signed-in',{cookie});check(untracked.data.pagination.total===22&&untracked.data.accounts.every(item=>item.lastSignedInAt===null&&item.signInCount===0&&item.passwordConfigured===false),label+' older or registration-only accounts do not receive fabricated login events');
 const activeDirectory=await call('/api/admin/accounts?status=active&sort=last-signin',{cookie});check(activeDirectory.data.accounts.length===1&&activeDirectory.data.accounts[0].id===publicLogin.data.user.id,label+' active filter returns accounts with unexpired member sessions');
 const emptyDirectory=await call('/api/admin/accounts?q=nonexistent-account&page=99',{cookie});check(emptyDirectory.data.pagination.page===1&&emptyDirectory.data.pagination.totalPages===1&&emptyDirectory.data.accounts.length===0,label+' empty account search retains usable pagination');
 for(const query of ['page=0','pageSize=101','sort=untrusted','status=untrusted','view=untrusted'])check((await call('/api/admin/accounts?'+query,{cookie})).status===400,label+' malformed directory filters are rejected');
 check((await call('/api/admin/accounts',{cookie,method:'POST',body:{},csrf})).status===405,label+' account analytics are read-only');
 env.AUTH_PROVIDER='chatgpt';
 try{
  const gateway={'oai-authenticated-user-id':'platform-directory-fixture','oai-authenticated-user-email':'platform-directory@example.test'},platform=await call('/api/auth/session',{headers:gateway});
  await call('/api/auth/session',{cookie:platform.cookie,headers:gateway});
  const hostedDirectory=await call('/api/admin/accounts?q=platform-directory',{cookie}),entry=hostedDirectory.data.accounts[0];
  check(hostedDirectory.data.pagination.total===1&&entry.provider==='chatgpt'&&entry.email===null&&entry.emailVerified===true&&entry.passwordConfigured===false&&entry.signInCount===1,label+' hosted accounts report provider-managed access without storing gateway email or counting session reads as new logins');
 }finally{env.AUTH_PROVIDER='password';}
 await DB.prepare('UPDATE sessions SET expires_at = ? WHERE token_hash = ?').bind(Date.now()-1,stored.token_hash).run();
 check((await call('/api/admin/session',{cookie})).data.user===null&&(await call('/api/admin/community',{cookie})).status===401,label+' expired administrator cookies cannot access private records');
 await DB.prepare('UPDATE sessions SET expires_at = ? WHERE token_hash = ?').bind(stored.expires_at,stored.token_hash).run();
 check((await call('/api/admin/logout',{method:'POST',body:{},cookie})).status===403,label+' administrator logout requires its own CSRF token');
 check((await call('/api/admin/logout',{method:'POST',body:{},cookie,csrf:publicLogin.data.csrfToken})).status===403,label+' a public CSRF token cannot mutate the administrator session');
 const originalHash=env.ADMIN_PASSWORD_HASH;
 env.ADMIN_PASSWORD_HASH=await hashPassword(randomToken());
 check((await call('/api/admin/session',{cookie})).data.user===null&&(await call('/api/admin/community',{cookie})).status===401,label+' changing server credentials immediately invalidates old admin tokens');
 env.ADMIN_PASSWORD_HASH=originalHash;
 delete env.ADMIN_LOGIN_EMAIL;
 const missing=await call('/api/admin/login',{method:'POST',body:{email,password}});
 check(missing.status===503&&missing.data.code==='ADMIN_UNAVAILABLE'&&!JSON.stringify(missing.data).includes(email),label+' missing setup produces a generic unavailable message');
 check((await call('/api/admin/session',{cookie})).data.user===null,label+' removing server configuration disables existing administrator sessions');
 env.ADMIN_LOGIN_EMAIL=email;
 check((await call('/api/admin/logout',{method:'POST',body:{},cookie:both,csrf})).status===200,label+' authenticated administrator logout succeeds');
 check((await call('/api/admin/session',{cookie})).data.user===null,label+' revoked administrator token stays revoked');
 check((await call('/api/auth/session',{cookie:publicLogin.cookie})).data.user.id===publicLogin.data.user.id,label+' administrator logout preserves the public account session');
 check((await call('/api/admin/logout',{method:'POST',body:{}})).status===200,label+' signed-out logout is safely idempotent');
 const actualNow=Date.now,frozenNow=actualNow();Date.now=()=>frozenNow;
 try{
  for(let i=0;i<5;i++)await DB.prepare('INSERT INTO sessions (token_hash,user_id,csrf_token,created_at,expires_at) VALUES (?,?,?,?,?)').bind('admin:'+'f'.repeat(63)+i,login.data.user.id,randomToken(),frozenNow,frozenNow+28800000).run();
  const cappedLogin=await call('/api/admin/login',{method:'POST',body:{email,password}});
  check(cappedLogin.status===200&&(await call('/api/admin/session',{cookie:cappedLogin.cookie})).data.csrfToken===cappedLogin.data.csrfToken,label+' tied session timestamps cannot prune the session just issued by login');
  check((await DB.prepare('SELECT COUNT(*) AS count FROM sessions WHERE user_id = ?').bind(login.data.user.id).first()).count===5,label+' administrator session retention still enforces its five-session bound');
 }finally{Date.now=actualNow;}
 // Recovery and verification must remain retryable after a database failure,
 // while concurrent successful requests still get only one use of the link.
 const newPassword=randomToken(),resetToken=randomToken(),resetHash=await tokenHash(resetToken),publicId=publicLogin.data.user.id;
 await DB.prepare('INSERT INTO account_tokens (token_hash,user_id,purpose,created_at,expires_at) VALUES (?,?,?,?,?)').bind(resetHash,publicId,'reset',Date.now(),Date.now()+1800000).run();
 const tokenFailure={...DB,prepare(sql){return /^(UPDATE users SET password_hash|INSERT INTO user_verifications)\b/.test(sql)?{bind:()=>DB.prepare('INSERT INTO user_verifications (user_id,verified_at) VALUES (?,?)').bind('missing-token-operation-principal',Date.now())}:DB.prepare(sql);}};
 env.DB=tokenFailure;
 try{check((await call('/api/auth/reset-password',{method:'POST',body:{token:resetToken,password:newPassword}})).status===503,label+' failed password reset reports storage failure');}finally{env.DB=DB;}
 check(Boolean(await DB.prepare('SELECT token_hash FROM account_tokens WHERE token_hash = ?').bind(resetHash).first())&&(await call('/api/auth/session',{cookie:publicLogin.cookie})).data.user?.id===publicId,label+' failed reset preserves both its original link and existing member session');
 const resets=await Promise.all([call('/api/auth/reset-password',{method:'POST',body:{token:resetToken,password:newPassword}}),call('/api/auth/reset-password',{method:'POST',body:{token:resetToken,password:newPassword}})]);
 check(resets.map(result=>result.status).sort().join(',')==='200,400',label+' concurrent reset claims consume the valid link exactly once');
 check((await call('/api/auth/session',{cookie:publicLogin.cookie})).data.user===null&&await verifyPassword(newPassword,(await DB.prepare('SELECT password_hash FROM users WHERE id = ?').bind(publicId).first()).password_hash),label+' successful reset commits the password and revokes old sessions together');
 const verifyToken=randomToken(),verifyHash=await tokenHash(verifyToken);await DB.prepare('DELETE FROM user_verifications WHERE user_id = ?').bind(publicId).run();
 await DB.prepare('INSERT INTO account_tokens (token_hash,user_id,purpose,created_at,expires_at) VALUES (?,?,?,?,?)').bind(verifyHash,publicId,'verify',Date.now(),Date.now()+1800000).run();
 env.DB=tokenFailure;
 try{check((await call('/api/auth/verify-email',{method:'POST',body:{token:verifyToken}})).status===503,label+' failed verification reports storage failure');}finally{env.DB=DB;}
 check(Boolean(await DB.prepare('SELECT token_hash FROM account_tokens WHERE token_hash = ?').bind(verifyHash).first())&&!await DB.prepare('SELECT user_id FROM user_verifications WHERE user_id = ?').bind(publicId).first(),label+' verification failure preserves its link without partially marking the account verified');
 const verifications=await Promise.all([call('/api/auth/verify-email',{method:'POST',body:{token:verifyToken}}),call('/api/auth/verify-email',{method:'POST',body:{token:verifyToken}})]);
 check(verifications.map(result=>result.status).sort().join(',')==='200,400'&&Boolean(await DB.prepare('SELECT user_id FROM user_verifications WHERE user_id = ?').bind(publicId).first()),label+' concurrent verification retries commit once and reject link reuse');
 env.CLIENT_IP=label+'-rate-limit';
 for(let attempt=0;attempt<10;attempt++)check((await call('/api/admin/login',{method:'POST',body:{email:'invalid-bruteforce@example.test',password:'incorrect'}})).status===401,label+' bounded unsuccessful login');
 const limited=await call('/api/admin/login',{method:'POST',body:{email,password}});
 check(limited.status===429&&Number(limited.headers.get('Retry-After'))>0&&Number(limited.headers.get('Retry-After'))<=900,label+' repeated login attempts are rate limited for the remaining window');
 const rateRow=await DB.prepare('SELECT expires_at FROM auth_limits WHERE key = ?').bind(await tokenHash('admin-login-ip:'+env.CLIENT_IP)).first();Date.now=()=>rateRow.expires_at-1500;
 try{const nearlyReady=await call('/api/admin/login',{method:'POST',body:{email,password}});check(nearlyReady.status===429&&nearlyReady.headers.get('Retry-After')==='2',label+' retry delay reflects the remaining limit window rather than restarting fifteen minutes');}finally{Date.now=actualNow;}
 check((await call('/api/admin/login')).status===405&&(await call('/api/admin/session',{method:'POST',body:{}})).status===405,label+' dedicated authentication methods are enforced');
}
try{
 await suite(sqlite,'SQLite');
 await suite(createPostgresAdapter(query,transaction),'PostgreSQL');
 console.log(`Private admin: ${checks} checks passed (SQLite/PostgreSQL, isolated cookies, credentials, CSRF, rate limits, rotation and member boundaries).`);
}finally{sqlite.close();await pg.close();}
