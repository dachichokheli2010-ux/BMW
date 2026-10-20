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
const password=randomToken(),email='http-admin@example.test';
let child,database,checks=0;
const check=(actual,expected,message)=>{assert.deepEqual(actual,expected,message);checks++;};
const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');
const port=listener.address().port;await new Promise(resolve=>listener.close(resolve));
const origin='http://127.0.0.1:'+port;
const environment={...process.env,PORT:String(port),HOST:'127.0.0.1',DATABASE_PATH:filename,ADMIN_USER_IDS:id};
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
try{
  database=await createLocalDatabase(filename);
  const now=Date.now();
  await database.prepare("INSERT INTO users (id,provider,email,name,password_hash,created_at,updated_at) VALUES (?,'password',?,'HTTP admin',?,?,?)").bind(id,email,await hashPassword(password),now,now).run();
  await database.close();database=null;
  await start();
  const guest=await request('/api/auth/session');check(guest.status,200,'Guest session is JSON');check(guest.data.user,null,'Signed-out requests have no identity');check(guest.cache,'no-store','Session responses never cache');
  check((await request('/api/admin/community')).status,401,'Anonymous requests cannot inspect admin records');
  const login=await request('/api/auth/login',{method:'POST',body:{email,password}});
  check(login.status,200,'Owner can sign in over HTTP');check(login.data.user.isAdmin,true,'Configured immutable owner ID grants admin');check(login.data.redirectTo,'/admin','Admin login points directly to the workspace');
  assert.ok(login.cookie&&login.data.csrfToken,'Login issues a real cookie and CSRF token');checks++;
  const auth={cookie:login.cookie,csrf:login.data.csrfToken};
  check((await request('/api/admin/community',auth)).status,200,'Owner can enter the actual admin endpoint');
  const garage=await request('/api/garage',auth),state={...emptyGarage(),favorites:['f10-m5']};
  check((await request('/api/garage',{...auth,csrf:undefined,method:'PUT',body:{state,revision:garage.data.revision}})).status,403,'Writes still require CSRF');
  check((await request('/api/garage',{...auth,method:'PUT',body:{state,revision:garage.data.revision}})).status,200,'Owner favorites persist through the HTTP adapter');
  check((await request('/api/garage',{...auth,method:'PUT',body:{state,revision:garage.data.revision}})).status,409,'Stale saves cannot overwrite current data');
  const profile=await request('/api/account/profile',{...auth,method:'PUT',body:{language:'ka'}});
  check(profile.status,200,'Language updates work over HTTP');check(profile.data.user.isAdmin,true,'Profile updates retain admin role');
  await stop();await start();
  check((await request('/api/garage',auth)).data.state.favorites,['f10-m5'],'Saved data survives a real server restart');
  const renewed=await request('/api/auth/session',auth);check(renewed.data.user.language,'ka','Language survives restart');check(renewed.data.user.isAdmin,true,'Owner role survives restart');
  check((await request('/api/auth/logout',{...auth,method:'POST',body:{}})).status,200,'Owner can sign out');
  await stop();await start();
  check((await request('/api/admin/community',auth)).status,401,'Revoked sessions stay revoked after restart');
  console.log(`HTTP accounts: ${checks} checks passed (real cookies, admin, CSRF, save conflicts, language, persistence and logout).`);
}finally{
  await stop();await database?.close();
  const resolved=path.resolve(directory),temporaryRoot=path.resolve(os.tmpdir());
  assert.equal(path.dirname(resolved),temporaryRoot,'Cleanup stays within the temporary directory');
  assert.ok(path.basename(resolved).startsWith('bmw-http-'),'Cleanup only removes the test directory');
  await fs.rm(resolved,{recursive:true,force:true});
}
