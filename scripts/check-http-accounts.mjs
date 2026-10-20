import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
import {createLocalDatabase} from '../server/local-db.mjs';
import {hashPassword,randomToken} from '../server/passwords.js';
import {emptyGarage} from '../server/validation.js';

// Exercise the real HTTP adapter and persistent storage in an isolated database.
// Existing local/production accounts, environment files and credentials are unused.
const root=fileURLToPath(new URL('../',import.meta.url));
const directory=await fs.mkdtemp(path.join(os.tmpdir(),'bmw-http-'));
const filename=path.join(directory,'accounts.sqlite'),id='local:'+crypto.randomUUID();
const password=randomToken(),email='http-admin@example.test',adminPassword=randomToken();
let child,database,checks=0;
const check=(actual,expected,message)=>{assert.deepEqual(actual,expected,message);checks++;};
const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');
const port=listener.address().port;await new Promise(resolve=>listener.close(resolve));
const origin='http://127.0.0.1:'+port;
const environment={...process.env,PORT:String(port),HOST:'127.0.0.1',DATABASE_PATH:filename,ADMIN_USER_IDS:id,ADMIN_LOGIN_EMAIL:email,ADMIN_PASSWORD_HASH:await hashPassword(adminPassword)};
for(const key of ['DATABASE_URL','POSTGRES_URL','NEON_DATABASE_URL','DATABASE_URL_UNPOOLED','POSTGRES_URL_NON_POOLING','PUBLIC_ORIGIN','RESEND_API_KEY','ACCOUNT_MAIL_FROM','ADMIN_EMAILS'])delete environment[key];
async function stop(){
  if(!child)return;
  const active=child;child=null;
  if(active.exitCode===null){const ended=once(active,'exit');active.kill();await ended;}
}
async function start(){
  child=spawn(process.execPath,['scripts/preview-local.mjs'],{cwd:root,env:environment,stdio:['ignore','pipe','pipe'],windowsHide:true});
  let ready=false;child.stdout.on('data',chunk=>{if(chunk.toString().includes('BMW Garage running'))ready=true;});
  // Never forward request diagnostics or credentials into test output.
  child.stderr.resume();
  const deadline=Date.now()+10000;
  while(!ready&&child.exitCode===null&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,25));
  assert.ok(ready,'The isolated preview must start');
}
async function request(route,{method='GET',body,cookie,csrf}={}){
  const response=await fetch(origin+route,{method,headers:{Accept:'application/json',...(body?{'Content-Type':'application/json',Origin:origin}:{}),...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CSRF-Token':csrf}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(10000)});
  return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0],cache:response.headers.get('cache-control')};
}
async function checkAdminShell(response,label,{head=false}={}){
  check(response.status,200,label+' resolves the private shell');
  check(response.headers.get('Cache-Control'),'private, no-store',label+' is never stored in browser or intermediary caches');
  check(response.headers.get('X-Robots-Tag'),'noindex, nofollow, noarchive',label+' opts out of discovery and archives');
  check(response.headers.get('X-Frame-Options'),'DENY',label+' cannot be embedded in another page');
  check(response.headers.get('Content-Security-Policy'),"frame-ancestors 'none'",label+' blocks framing with CSP');
  check(response.headers.get('Referrer-Policy'),'same-origin',label+' limits referrer disclosure');
  const html=await response.text();
  check(head?html==='':html.includes('data-admin-root'),true,label+' returns only the expected private shell');
}
try{
  database=await createLocalDatabase(filename);
  const now=Date.now();
  await database.prepare("INSERT INTO users (id,provider,email,name,password_hash,created_at,updated_at) VALUES (?,'password',?,'HTTP admin',?,?,?)").bind(id,email,await hashPassword(password),now,now).run();
  await database.close();database=null;
  await start();
  for(const route of ['/admin','/admin/','/admin.html']){
    await checkAdminShell(await fetch(origin+route),route+' over HTTP');
    await checkAdminShell(await fetch(origin+route,{method:'HEAD'}),route+' HEAD over HTTP',{head:true});
  }
  // Run the unmodified Worker fetch implementation with minimal in-memory
  // assets, so static header/routing checks do not depend on a prior build.
  const assets={assets:{'/admin.html':{type:'text/html; charset=utf-8',body:'<main data-admin-root></main>'},'/404.html':{type:'text/html; charset=utf-8',body:'Not found'}}};
  const assetModule='data:text/javascript;base64,'+Buffer.from('export const assets='+JSON.stringify(assets.assets)+';').toString('base64');
  const workerSource=(await fs.readFile(new URL('../worker/index.js',import.meta.url),'utf8')).replace("'../server/api.js'",JSON.stringify(new URL('../server/api.js',import.meta.url).href)).replace("'./routes.js'",JSON.stringify(new URL('../public/routes.js',import.meta.url).href)).replace("'./assets.js'",JSON.stringify(assetModule));
  const worker=(await import('data:text/javascript;base64,'+Buffer.from(workerSource).toString('base64'))).default;
  for(const route of ['/admin','/admin/','/admin.html']){
    await checkAdminShell(await worker.fetch(new Request('https://worker.test'+route),{}),route+' via Worker');
    await checkAdminShell(await worker.fetch(new Request('https://worker.test'+route,{method:'HEAD'}),{}),route+' HEAD via Worker',{head:true});
  }
  const guest=await request('/api/auth/session');check(guest.status,200,'Guest session is JSON');check(guest.data.user,null,'Signed-out requests have no identity');check(guest.cache,'no-store','Session responses never cache');
  check((await request('/api/admin/community')).status,401,'Anonymous requests cannot inspect admin records');
  const login=await request('/api/auth/login',{method:'POST',body:{email,password}});
  check(login.status,200,'Owner can sign in over HTTP');check(login.data.user.isAdmin,false,'Public accounts cannot grant administrator access');check(login.data.redirectTo,'/account','Public login points to the account');
  assert.ok(login.cookie&&login.data.csrfToken,'Login issues a real cookie and CSRF token');checks++;
  const auth={cookie:login.cookie,csrf:login.data.csrfToken};
  check((await request('/api/admin/community',auth)).status,401,'Public login cannot enter the actual admin endpoint');
  const adminLogin=await request('/api/admin/login',{method:'POST',body:{email:email.toUpperCase(),password:adminPassword}});
  check(adminLogin.status,200,'Dedicated owner sign-in works over real HTTP');
  assert.ok(adminLogin.cookie?.startsWith('bmw_admin=')&&adminLogin.data.csrfToken,'Private login issues a separate cookie and CSRF token');checks++;
  const adminAuth={cookie:adminLogin.cookie,csrf:adminLogin.data.csrfToken};
  check((await request('/api/admin/community',adminAuth)).status,200,'Private owner can enter the admin endpoint');
  const garage=await request('/api/garage',auth),state={...emptyGarage(),favorites:['f10-m5']};
  check((await request('/api/garage',{...auth,csrf:undefined,method:'PUT',body:{state,revision:garage.data.revision}})).status,403,'Writes still require CSRF');
  check((await request('/api/garage',{...auth,method:'PUT',body:{state,revision:garage.data.revision}})).status,200,'Owner favorites persist through the HTTP adapter');
  check((await request('/api/garage',{...auth,method:'PUT',body:{state,revision:garage.data.revision}})).status,409,'Stale saves cannot overwrite current data');
  const profile=await request('/api/account/profile',{...auth,method:'PUT',body:{language:'ka'}});
  check(profile.status,200,'Language updates work over HTTP');check(profile.data.user.isAdmin,false,'Profile updates remain public member data');
  await stop();await start();
  check((await request('/api/garage',auth)).data.state.favorites,['f10-m5'],'Saved data survives a real server restart');
  const renewed=await request('/api/auth/session',auth);check(renewed.data.user.language,'ka','Language survives restart');check(renewed.data.user.isAdmin,false,'Public session stays a member after restart');
  check((await request('/api/admin/community',adminAuth)).status,200,'Private administrator cookie survives a server restart');
  check((await request('/api/auth/logout',{...auth,method:'POST',body:{}})).status,200,'Owner can sign out');
  check((await request('/api/admin/community',adminAuth)).status,200,'Public sign-out preserves the independent admin session');
  check((await request('/api/admin/logout',{...adminAuth,method:'POST',body:{}})).status,200,'Private administrator can sign out separately');
  await stop();await start();
  check((await request('/api/admin/community',auth)).status,401,'Revoked sessions stay revoked after restart');
  check((await request('/api/admin/community',adminAuth)).status,401,'Revoked admin sessions stay revoked after restart');
  console.log(`HTTP accounts: ${checks} checks passed (private shells and frame protection, Worker routing, isolated cookies, CSRF, save conflicts, persistence and logout).`);
}finally{
  await stop();await database?.close();
  const resolved=path.resolve(directory),temporaryRoot=path.resolve(os.tmpdir());
  assert.equal(path.dirname(resolved),temporaryRoot,'Cleanup stays within the temporary directory');
  assert.ok(path.basename(resolved).startsWith('bmw-http-'),'Cleanup only removes the test directory');
  await fs.rm(resolved,{recursive:true,force:true});
}
