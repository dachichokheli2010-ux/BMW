import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {initializePostgres,createPostgresAdapter,postgresSQL,postgresSchemaStatements,databaseURL,validateDatabaseURL} from '../server/postgres-db.js';
import {handleApi} from '../server/api.js';
import {createVercelHandler} from '../server/vercel-api.js';
import {emptyGarage} from '../server/validation.js';

let checks=0;
const check=(condition,message)=>{assert.ok(condition,message);checks++;};
assert.equal(postgresSQL("SELECT '?' AS literal, users.* FROM users WHERE email = ? -- ?\nAND name = ?"),"SELECT '?' AS literal, users.* FROM apex.users WHERE email = $1 -- ?\nAND name = $2");checks++;
assert.equal(postgresSQL('SELECT $$?$$, ? /* ? */'), 'SELECT $$?$$, $1 /* ? */');checks++;
assert.equal(databaseURL({DATABASE_URL:'postgresql://test:secret@primary.neon.tech/db',POSTGRES_URL:'other'}),'postgresql://test:secret@primary.neon.tech/db');checks++;
assert.throws(()=>validateDatabaseURL('not-a-connection'));checks++;
const database=new PGlite(),legacy=new PGlite();
const runner=pg=>async(sql,values=[])=>{const result=await pg.query(sql,values);return {rows:result.rows,rowCount:result.affectedRows??result.rows.length};};
const transact=pg=>async statements=>pg.transaction(async tx=>{for(const [sql,values]of statements)await tx.query(sql,values);});
try{
 await database.exec("CREATE TABLE public.users (id UUID PRIMARY KEY,email TEXT); INSERT INTO public.users VALUES ('11111111-1111-1111-1111-111111111111','existing@example.com');");
 for(const table of ['lessons','questions','user_progress','user_stats','achievements','user_achievements'])await database.exec(`CREATE TABLE public.${table}(id INTEGER PRIMARY KEY)`);
 const query=runner(database),DB=createPostgresAdapter(query);
 await initializePostgres(query,transact(database));
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
 cookie=signed.response.headers.getSetCookie()[0].split(';')[0];csrf=signed.data.csrfToken;
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
 await initializePostgres(runner(legacy),transact(legacy));
 check((await legacy.query('SELECT count(*)::int AS count FROM apex.users')).rows[0].count===1,'Existing compatible app accounts are retained.');
 check((await legacy.query('SELECT revision FROM apex.user_garages')).rows[0].revision===3,'Prior garage saves retain their revision.');
 await initializePostgres(runner(legacy),transact(legacy));
 check((await legacy.query('SELECT count(*)::int AS count FROM public.users')).rows[0].count===1,'Repeat migration leaves original accounts untouched.');
 console.log(`PostgreSQL: ${checks} checks passed (real SQL, seven-table preservation, auth, saves, migration and API routes).`);
}finally{await database.close();await legacy.close();}
