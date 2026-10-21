import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {Worker} from 'node:worker_threads';
import {PGlite} from '@electric-sql/pglite';
import {initializePostgres,inspectPostgres,createPostgresAdapter,postgresSQL,postgresSchemaStatements,databaseURL,validateDatabaseURL} from '../server/postgres-db.js';
import {handleApi} from '../server/api.js';
import {createVercelHandler} from '../server/vercel-api.js';
import {emptyGarage} from '../server/validation.js';
import {createLocalDatabase} from '../server/local-db.mjs';
import {hashPassword} from '../server/passwords.js';

let checks=0;
const check=(condition,message)=>{assert.ok(condition,message);checks++;};
assert.equal(postgresSQL("SELECT '?' AS literal, users.* FROM users WHERE email = ? -- ?\nAND name = ?"),"SELECT '?' AS literal, users.* FROM apex.users WHERE email = $1 -- ?\nAND name = $2");checks++;
assert.equal(postgresSQL('SELECT $$?$$, ? /* ? */'), 'SELECT $$?$$, $1 /* ? */');checks++;
assert.equal(databaseURL({DATABASE_URL:'postgresql://test:secret@primary.neon.tech/db',POSTGRES_URL:'other'}),'postgresql://test:secret@primary.neon.tech/db');checks++;
for(const key of ['DATABASE_URL','POSTGRES_URL','NEON_DATABASE_URL','DATABASE_URL_UNPOOLED','POSTGRES_URL_NON_POOLING']){
 check(databaseURL({[key]:'  "postgresql://test:secret@db.invalid/test"\r\n'})==='postgresql://test:secret@db.invalid/test',key+' accepts a quoted hosting value without exposing or changing the connection string.');
}
check(databaseURL({DATABASE_URL:' \r\n',POSTGRES_URL:'postgresql://test:secret@db.invalid/test'})==='postgresql://test:secret@db.invalid/test','An empty primary value does not mask a connected integration alias.');
assert.throws(()=>validateDatabaseURL('not-a-connection'));checks++;
const runner=pg=>async(sql,values=[])=>{const result=await pg.query(sql,values);return {rows:result.rows,rowCount:result.affectedRows??result.rows.length};};
const transact=pg=>async statements=>pg.transaction(async tx=>{const results=[];for(const [sql,values]of statements)results.push(await tx.query(sql,values));return results;});
async function adapterChecks(DB,label,table='adapter_checks'){
 await DB.prepare(`CREATE TABLE ${table} (id TEXT PRIMARY KEY,value INTEGER NOT NULL CHECK(value >= 0))`).run();
 const saved=await DB.batch([DB.prepare(`INSERT INTO ${table} (id,value) VALUES (?,?) RETURNING id,value`).bind('first',1),DB.prepare(`UPDATE ${table} SET value = value + 1 WHERE id = ? RETURNING value`).bind('first'),DB.prepare(`SELECT value FROM ${table} WHERE id = ?`).bind('first')]);
 check(saved[0].results[0].id==='first'&&saved[0].meta.changes===1,label+' batch retains INSERT RETURNING rows and affected counts.');
 check(saved[1].results[0].value===2&&saved[1].meta.changes===1,label+' batch retains UPDATE RETURNING rows and affected counts.');
 check(saved[2].results[0].value===2,label+' batch returns SELECT rows.');
 await assert.rejects(DB.batch([DB.prepare(`INSERT INTO ${table} (id,value) VALUES (?,?)`).bind('rollback',1),DB.prepare(`UPDATE ${table} SET value = -1 WHERE id = ?`).bind('first')]));checks++;
 check(!(await DB.prepare(`SELECT id FROM ${table} WHERE id = ?`).bind('rollback').first())&&(await DB.prepare(`SELECT value FROM ${table} WHERE id = ?`).bind('first').first()).value===2,label+' a failed batch rolls every write back.');
}
async function localChecks(){
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'apex-local-migrations-')),filename=path.join(directory,'concurrent.sqlite'),gate=new SharedArrayBuffer(4),workers=[];let local;
 const source=`import {parentPort,workerData} from 'node:worker_threads';const {createLocalDatabase}=await import(workerData.module);parentPort.postMessage('ready');Atomics.wait(new Int32Array(workerData.gate),0,0);try{const DB=await createLocalDatabase(workerData.filename);await DB.prepare('INSERT INTO users (id,provider,name,created_at,updated_at) VALUES (?,?,?,?,?)').bind('local:worker-'+workerData.index,'password','Worker '+workerData.index,1,1).run();DB.close();parentPort.postMessage({ok:true});}catch(error){parentPort.postMessage({ok:false,message:error.code});}`;
 try{
  const ready=[],finished=[];
  for(let index=0;index<6;index++){
   const worker=new Worker(source,{eval:true,execArgv:['--input-type=module','--disable-warning=ExperimentalWarning'],workerData:{module:new URL('../server/local-db.mjs',import.meta.url).href,filename,gate,index}});workers.push(worker);let announce;
   ready.push(new Promise((resolve,reject)=>{announce=resolve;worker.once('error',reject);}));finished.push(new Promise((resolve,reject)=>{worker.on('message',value=>value==='ready'?announce():resolve(value));worker.once('error',reject);}));
  }
  await Promise.all(ready);Atomics.store(new Int32Array(gate),0,1);Atomics.notify(new Int32Array(gate),0);
  check((await Promise.all(finished)).every(result=>result.ok),'Concurrent local startup waits for WAL and applies each migration once.');
  local=await createLocalDatabase(filename);
  check((await local.prepare('SELECT count(*) AS count FROM users').first()).count===6,'Concurrent local startup preserves every process’s saved account.');
  const files=(await fs.readdir(new URL('../drizzle/',import.meta.url))).filter(name=>/^\d+_[a-z0-9_]+\.sql$/i.test(name));
  check((await local.prepare('SELECT count(*) AS count FROM _bmw_migrations').first()).count===files.length,'Local migration receipts contain one entry per migration.');
  await adapterChecks(local,'SQLite');
  const selected=await local.batch([local.prepare('SELECT value FROM adapter_checks')]);check(selected[0].meta.changes===0,'A SQLite SELECT must not inherit a previous statement’s affected-row count.');
  await assert.rejects(local.prepare('INSERT INTO sessions (token_hash,user_id,csrf_token,created_at,expires_at) VALUES (?,?,?,?,?)').bind('orphan','missing','csrf',1,2).run());checks++;
 }finally{local?.close();await Promise.all(workers.map(worker=>worker.terminate()));assert.equal(path.dirname(path.resolve(directory)),path.resolve(os.tmpdir()));await fs.rm(directory,{recursive:true,force:true});}
}
await localChecks();
const database=new PGlite(),legacy=new PGlite(),manual=new PGlite();
try{
 await manual.exec(await fs.readFile(new URL('../sql/neon-accounts.sql',import.meta.url),'utf8'));
 check(Object.values(await inspectPostgres(runner(manual))).every(table=>table.missing.length===0),'Manual Neon setup creates the complete auth, recovery and community schema.');
 await database.exec("CREATE TABLE public.users (id UUID PRIMARY KEY,email TEXT); INSERT INTO public.users VALUES ('11111111-1111-1111-1111-111111111111','existing@example.com');");
 for(const table of ['lessons','questions','user_progress','user_stats','achievements','user_achievements'])await database.exec(`CREATE TABLE public.${table}(id INTEGER PRIMARY KEY)`);
 const query=runner(database),DB=createPostgresAdapter(query,transact(database));
 await initializePostgres(query,transact(database));
 await adapterChecks(DB,'PostgreSQL','apex.adapter_checks');
 check((await database.query('SELECT email FROM public.users')).rows[0].email==='existing@example.com','Manually created users and learning tables survive initialization.');
 check((await database.query("SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'")).rows[0].count===7,'All seven public tables remain.');
 let cookie='',csrf='';
 const env={DB,AUTH_PROVIDER:'password',CLIENT_IP:'postgres-test'};
 async function call(path,{method='GET',body,token=csrf,session=cookie}={}){
  const headers={Origin:'https://garage.test','Content-Type':'application/json'};if(session)headers.Cookie=session;if(token)headers['X-CSRF-Token']=token;
  const response=await handleApi(new Request('https://garage.test'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)}),env);
  return {response,data:await response.json()};
 }
 const signed=await call('/api/auth/signup',{method:'POST',body:{name:'Test driver',email:'postgres@example.com',password:'a long test passphrase'}});
 check(signed.response.status===201,'Signup executes on PostgreSQL with a conflicting public.users schema.');
 check(signed.data.user===null&&signed.data.csrfToken===null&&!signed.response.headers.getSetCookie().length,'PostgreSQL registration preserves the account-existence protection and creates no session.');
 const firstLogin=await call('/api/auth/login',{method:'POST',body:{email:'postgres@example.com',password:'a long test passphrase'}});
 check(firstLogin.response.status===200,'Explicit login creates the PostgreSQL session after registration.');
 cookie=firstLogin.response.headers.getSetCookie()[0].split(';')[0];csrf=firstLogin.data.csrfToken;
 const state={...emptyGarage(),favorites:['f10-m5']};
 const saved=await call('/api/garage',{method:'PUT',body:{state,revision:0}});
 check(saved.response.status===200&&saved.data.revision===1,'Garage INSERT returns correct PostgreSQL affected-row count.');
 const changed=await call('/api/garage',{method:'PUT',body:{state:{...state,favorites:['e92']},revision:1}});
 check(changed.response.status===200&&changed.data.revision===2,'Garage UPDATE uses bound PostgreSQL parameters.');
 check((await call('/api/garage',{method:'PUT',body:{state,revision:1}})).response.status===409,'Revision conflicts do not overwrite account data.');
 const login=await call('/api/auth/login',{method:'POST',body:{email:'POSTGRES@EXAMPLE.COM',password:'a long test passphrase'}});
 check(login.response.status===200,'Case-normalized email login works without SQLite collations.');
 cookie=login.response.headers.getSetCookie()[0].split(';')[0];csrf=login.data.csrfToken;
 check((await call('/api/garage')).data.state.favorites[0]==='e92','Login recovers the saved account garage.');
 check((await call('/api/auth/logout',{method:'POST',body:{}})).response.status===200,'Logout revokes a PostgreSQL session.');
 check((await call('/api/garage')).response.status===401,'A revoked session cannot read private garage data.');
 const handler=createVercelHandler({environment:{DATABASE_URL:'postgresql://test:secret@test.neon.tech/db'},connect:async()=>DB});
 check((await handler(new Request('https://garage.test/api/auth/session'))).status===200,'Nested serverless session route reaches the account API.');
 for(const route of ['auth/session','auth/signup','auth/login','auth/logout','account/profile','garage']){
  await fs.access(new URL('../api/'+route+'.js',import.meta.url));checks++;
 }
 // Older versions created matching app tables in public. Copy compatible data
 // once without changing that source or replacing an existing apex record.
 for(const sql of postgresSchemaStatements.filter(sql=>!sql.startsWith('CREATE SCHEMA')))await legacy.exec(sql.replaceAll('apex.','public.'));
 const oldHash=(await database.query('SELECT password_hash FROM apex.users')).rows[0].password_hash;
 await legacy.query("INSERT INTO public.users VALUES ('local:legacy','password','legacy@example.com','Legacy driver',$1,1,1)",[oldHash]);
 await legacy.query("INSERT INTO public.user_garages VALUES ('local:legacy',$1,3,1)",[JSON.stringify(state)]);
 await legacy.query("INSERT INTO public.user_verifications VALUES ('local:legacy',1)");
 await legacy.query("INSERT INTO public.user_preferences VALUES ('local:legacy','ka')");
 await legacy.query("INSERT INTO public.sessions VALUES ('legacy-revoked-token','local:legacy','legacy-csrf',1,$1)",[Date.now()+86400000]);
 await legacy.query("INSERT INTO public.account_tokens VALUES ('legacy-used-reset','local:legacy','reset',1,$1)",[Date.now()+86400000]);
 await initializePostgres(runner(legacy),transact(legacy));
 check((await legacy.query('SELECT count(*)::int AS count FROM apex.users')).rows[0].count===1,'Existing compatible app accounts are retained.');
 check((await legacy.query('SELECT revision FROM apex.user_garages')).rows[0].revision===3,'Prior garage saves retain their revision.');
 check((await legacy.query('SELECT verified_at FROM apex.user_verifications')).rows[0].verified_at===1,'Existing verified email ownership survives the schema migration.');
 check((await legacy.query('SELECT language FROM apex.user_preferences')).rows[0].language==='ka','Existing language preference survives the schema migration.');
 check((await legacy.query('SELECT count(*)::int AS count FROM apex.sessions')).rows[0].count===0,'Legacy sessions are not resurrected after logout or a password reset.');
 check((await legacy.query('SELECT count(*)::int AS count FROM apex.account_tokens')).rows[0].count===0,'Legacy recovery links cannot be replayed after migration.');
 await initializePostgres(runner(legacy),transact(legacy));
 check((await legacy.query('SELECT count(*)::int AS count FROM public.users')).rows[0].count===1,'Repeat migration leaves original accounts untouched.');
 check((await legacy.query('SELECT count(*)::int AS count FROM apex.sessions')).rows[0].count===0,'Repeated cold-start initialization cannot revive legacy sessions.');
 await legacy.query("DELETE FROM apex.users WHERE id='local:legacy'");await initializePostgres(runner(legacy),transact(legacy));
 check((await legacy.query('SELECT count(*)::int AS count FROM apex.users')).rows[0].count===0,'A completed public import cannot resurrect an account removed from the private schema.');
 check((await legacy.query('SELECT count(*)::int AS count FROM public.users')).rows[0].count===1,'One-time import leaves all legacy source rows in place.');
 await manual.exec("CREATE TABLE public.users (id TEXT PRIMARY KEY,provider INTEGER,email TEXT,name TEXT,password_hash TEXT,created_at DOUBLE PRECISION,updated_at DOUBLE PRECISION);INSERT INTO public.users VALUES ('local:unrelated',7,'unrelated@example.test','Unrelated row',NULL,1,1)");
 await initializePostgres(runner(manual),transact(manual));
 check((await manual.query('SELECT provider FROM public.users')).rows[0].provider===7,'Lookalike public tables with incompatible types are preserved and ignored.');
 check((await manual.query('SELECT count(*)::int AS count FROM apex.schema_migrations')).rows[0].count===0,'An unrelated source does not receive a completed legacy-import receipt.');
 await manual.exec('DROP INDEX apex.sessions_expiry_idx');
 await initializePostgres(runner(manual),transact(manual),{applySchema:true});
 check((await manual.query("SELECT count(*)::int AS count FROM pg_indexes WHERE schemaname='apex' AND indexname='sessions_expiry_idx'")).rows[0].count===1,'An explicit schema migration still reapplies missing indexes when all required columns already exist.');
 // Production roles often have row privileges after an owner provisions the
 // schema, without permission to recreate it on each serverless cold start.
 const runtimeQuery=runner(manual),runtimeTransaction=transact(manual),runtimeDB=createPostgresAdapter(runtimeQuery,runtimeTransaction);
 await manual.exec('CREATE ROLE motron_runtime; GRANT USAGE ON SCHEMA apex TO motron_runtime; GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA apex TO motron_runtime; SET ROLE motron_runtime;');
 try{
  await assert.rejects(manual.exec('CREATE SCHEMA IF NOT EXISTS apex'),error=>error.code==='42501');checks++;
  const runtimeReport=await initializePostgres(runtimeQuery,runtimeTransaction);
  check(Object.values(runtimeReport).every(table=>table.missing.length===0),'A provisioned schema initializes with row privileges and no CREATE permission.');
  const ownerPassword='a test-only runtime passphrase',ownerEmail='runtime-owner@example.test',ownerHash=await hashPassword(ownerPassword);
  const runtimeHandler=createVercelHandler({environment:{POSTGRES_URL:'  "postgresql://runtime:test@db.invalid/test"\n',ADMIN_LOGIN_EMAIL:' "'+ownerEmail+'" ',ADMIN_PASSWORD_HASH:" '"+ownerHash+"'\n"},connect:async()=>{await initializePostgres(runtimeQuery,runtimeTransaction);return runtimeDB;}});
  const runtimeLogin=await runtimeHandler(new Request('https://runtime.test/api/admin/login',{method:'POST',headers:{Origin:'https://runtime.test','Content-Type':'application/json'},body:JSON.stringify({email:ownerEmail,password:ownerPassword})}));
  const runtimeSession=await runtimeLogin.json(),runtimeCookie=runtimeLogin.headers.get('Set-Cookie')?.split(';')[0];
  check(runtimeLogin.status===200&&runtimeSession.user.id==='administrator:owner'&&runtimeCookie?.startsWith('__Host-bmw_admin='),'The Vercel adapter signs an administrator in using a provisioned data-only PostgreSQL role.');
  const restored=await runtimeHandler(new Request('https://runtime.test/api/admin/session',{headers:{Cookie:runtimeCookie}}));
  check(restored.status===200&&(await restored.json()).csrfToken===runtimeSession.csrfToken,'A later Vercel request recovers the administrator session from PostgreSQL.');
  const accounts=await runtimeHandler(new Request('https://runtime.test/api/admin/accounts',{headers:{Cookie:runtimeCookie}}));
  check(accounts.status===200&&(await accounts.json()).stats.accounts===0,'The data-only role reaches protected account analytics without exposing the internal administrator.');
 }finally{await manual.exec('RESET ROLE');}
 console.log(`Database adapters: ${checks} checks passed (concurrent SQLite startup, batch rows/rollback, real PostgreSQL, seven-table preservation, auth, saves and one-time legacy imports).`);
}finally{await database.close();await legacy.close();await manual.close();}
