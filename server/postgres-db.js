import {neon} from '@neondatabase/serverless';
import {communitySchemaStatements,communityTableNames} from './community-schema.js';

// App-owned tables live separately from any tables created in Neon SQL Editor.
export const POSTGRES_SCHEMA='apex';
export const postgresSchemaStatements=[
 'CREATE SCHEMA IF NOT EXISTS apex',
 `CREATE TABLE IF NOT EXISTS apex.users (id TEXT PRIMARY KEY, provider TEXT NOT NULL, email TEXT UNIQUE, name TEXT NOT NULL, password_hash TEXT, created_at DOUBLE PRECISION NOT NULL, updated_at DOUBLE PRECISION NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS apex.sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES apex.users(id) ON DELETE CASCADE, csrf_token TEXT NOT NULL, created_at DOUBLE PRECISION NOT NULL, expires_at DOUBLE PRECISION NOT NULL)`,
 'CREATE INDEX IF NOT EXISTS sessions_user_idx ON apex.sessions(user_id)',
 'CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON apex.sessions(expires_at)',
 `CREATE TABLE IF NOT EXISTS apex.auth_limits (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, window_start DOUBLE PRECISION NOT NULL, expires_at DOUBLE PRECISION NOT NULL)`,
 'CREATE INDEX IF NOT EXISTS auth_limits_expiry_idx ON apex.auth_limits(expires_at)',
 `CREATE TABLE IF NOT EXISTS apex.user_garages (user_id TEXT PRIMARY KEY REFERENCES apex.users(id) ON DELETE CASCADE, state TEXT NOT NULL, revision INTEGER NOT NULL, updated_at DOUBLE PRECISION NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS apex.account_tokens (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES apex.users(id) ON DELETE CASCADE, purpose TEXT NOT NULL CHECK (purpose IN ('reset','verify')), created_at DOUBLE PRECISION NOT NULL, expires_at DOUBLE PRECISION NOT NULL)`,
 'CREATE INDEX IF NOT EXISTS account_tokens_user_idx ON apex.account_tokens(user_id,purpose)',
 'CREATE INDEX IF NOT EXISTS account_tokens_expiry_idx ON apex.account_tokens(expires_at)',
 `CREATE TABLE IF NOT EXISTS apex.user_verifications (user_id TEXT PRIMARY KEY REFERENCES apex.users(id) ON DELETE CASCADE, verified_at DOUBLE PRECISION NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS apex.user_preferences (user_id TEXT PRIMARY KEY REFERENCES apex.users(id) ON DELETE CASCADE, language TEXT NOT NULL CHECK (language IN ('en','ka','ru')))`
];
postgresSchemaStatements.push(...communitySchemaStatements.map(sql=>sql.replace(/(CREATE TABLE IF NOT EXISTS |REFERENCES | ON )(community_[a-z_]+|users)(?=\s|\()/g,'$1apex.$2')));
const tableNames=new Set(['users','sessions','auth_limits','user_garages','account_tokens','user_verifications','user_preferences',...communityTableNames]);
const required={users:['id','provider','email','name','password_hash','created_at','updated_at'],sessions:['token_hash','user_id','csrf_token','created_at','expires_at'],auth_limits:['key','attempts','window_start','expires_at'],user_garages:['user_id','state','revision','updated_at'],account_tokens:['token_hash','user_id','purpose','created_at','expires_at'],user_verifications:['user_id','verified_at'],user_preferences:['user_id','language']};
Object.assign(required,{
 community_profiles:['user_id','handle','display_name','bio','created_at','updated_at'],
 community_friends:['id','requester_id','recipient_id','pair_key','status','created_at','updated_at'],
 community_shares:['user_id','token','created_at'],
 community_wallets:['user_id','balance','last_operation','updated_at'],
 community_credit_ledger:['id','user_id','amount','reason','source_key','created_at'],
 community_challenges:['id','user_id','question_id','created_at','expires_at'],
 community_cars:['id','user_id','title','model','year','engine','transmission','horsepower','description','modifications','evidence','status','moderation_note','moderated_by','submitted_at','reviewed_at','credit_spent','created_at','updated_at'],
 community_photos:['id','car_id','mime','data','width','height','caption','position'],
 community_audit:['id','actor_id','action','car_id','note','created_at']
});
const numericTypes=new Set(['integer','bigint','double precision','real','numeric']);
const clients=new Map();

export function databaseURL(environment=process.env){
 for(const key of ['DATABASE_URL','POSTGRES_URL','NEON_DATABASE_URL','DATABASE_URL_UNPOOLED','POSTGRES_URL_NON_POOLING']){
  const value=environment[key]?.trim();if(value)return value;
 }
 return null;
}
export function validateDatabaseURL(value){
 try{const url=new URL(value);if(!['postgres:','postgresql:'].includes(url.protocol)||!url.username||!url.hostname||url.pathname.length<2)throw new Error();return value;}catch{throw new Error('DATABASE_URL must be the full PostgreSQL connection string from Neon.');}
}

// Translate placeholders and known table references outside literals/comments.
// Values are always supplied separately; they never become part of SQL text.
export function postgresSQL(sql){
 let result='',i=0,index=0,previous='';
 while(i<sql.length){
  const char=sql[i],next=sql[i+1];
  if(char==="'"||char==='"'){
   const quote=char,start=i++;while(i<sql.length){if(sql[i]===quote){i++;if(sql[i]===quote){i++;continue;}break;}i++;}result+=sql.slice(start,i);continue;
  }
  if(char==='-'&&next==='-'){const end=sql.indexOf('\n',i);if(end<0){result+=sql.slice(i);break;}result+=sql.slice(i,end+1);i=end+1;continue;}
  if(char==='/'&&next==='*'){const end=sql.indexOf('*/',i+2);if(end<0)throw new Error('Unclosed SQL comment.');result+=sql.slice(i,end+2);i=end+2;continue;}
  if(char==='$'){
   const tag=/^(?:\$[A-Za-z_][A-Za-z0-9_]*\$|\$\$)/.exec(sql.slice(i))?.[0];
   if(tag){const end=sql.indexOf(tag,i+tag.length);if(end<0)throw new Error('Unclosed SQL literal.');result+=sql.slice(i,end+tag.length);i=end+tag.length;continue;}
  }
  if(char==='?'){result+='$'+(++index);i++;continue;}
  if(/[A-Za-z_]/.test(char)){
   const token=/^[A-Za-z_][A-Za-z0-9_]*/.exec(sql.slice(i))[0];
   result+=tableNames.has(token)&&['FROM','JOIN','INTO','UPDATE'].includes(previous)?'apex.'+token:token;
   previous=token.toUpperCase();i+=token.length;continue;
  }
  result+=char;i++;
 }
 return result;
}
export function createPostgresAdapter(query,transaction){
 const statements=new WeakMap();
 const prepare=(sql,values=[])=>{
 const prepared={
  bind(...next){return prepare(sql,next);},
  async first(column){const result=await query(postgresSQL(sql),values);const row=result.rows[0]||null;return column&&row?row[column]:row;},
  async all(){const result=await query(postgresSQL(sql),values);return {results:result.rows,success:true};},
  async run(){const result=await query(postgresSQL(sql),values);return {results:result.rows,success:true,meta:{changes:Number(result.rowCount??result.affectedRows??0)}};}
 };
 statements.set(prepared,[postgresSQL(sql),values]);return prepared;
 };
 return {prepare,async batch(batch){
  if(!transaction)throw new Error('Atomic account operations require a database transaction.');
  return transaction(batch.map(prepared=>{const entry=statements.get(prepared);if(!entry)throw new Error('Batch statements must belong to this database.');return entry;}));
 },close:async()=>{}};
}
const columnsQuery="SELECT table_name,column_name,data_type FROM information_schema.columns WHERE table_schema = $1 AND table_name IN ("+Object.keys(required).map(table=>"'"+table+"'").join(',')+")";
export async function inspectPostgres(query){
 const result=await query(columnsQuery,['apex']);
 return Object.fromEntries(Object.keys(required).map(table=>[table,{columns:result.rows.filter(row=>row.table_name===table).map(row=>row.column_name),missing:required[table].filter(column=>!result.rows.some(row=>row.table_name===table&&row.column_name===column))}]));
}
export async function initializePostgres(query,transaction){
 const statements=[['SELECT pg_advisory_xact_lock(7491832)',[]],...postgresSchemaStatements.map(sql=>[sql,[]])];
 if(transaction)await transaction(statements);else for(const [sql,values]of statements)await query(sql,values);
 const report=await inspectPostgres(query);
 if(Object.values(report).some(table=>table.missing.length))throw new Error('The apex database schema is incomplete. Run npm run db:check to inspect it.');
 // Preserve accounts from the prior app schema, if it is actually that schema.
 // Manually-created public tables with different columns are left untouched.
 const legacy=(await query(columnsQuery,['public'])).rows;
 const compatible=table=>required[table].every(column=>legacy.some(row=>row.table_name===table&&row.column_name===column))&&legacy.filter(row=>row.table_name===table&&['created_at','updated_at','expires_at','verified_at'].includes(row.column_name)).every(row=>numericTypes.has(row.data_type));
 if(compatible('users')){
  const migrate=[[`INSERT INTO apex.users (id,provider,email,name,password_hash,created_at,updated_at) SELECT id::text,provider,email,name,password_hash,created_at,updated_at FROM public.users WHERE id::text ~ '^(local:|chatgpt:)' AND provider IN ('password','chatgpt') AND name IS NOT NULL ON CONFLICT DO NOTHING`,[]]];
  if(compatible('user_garages'))migrate.push([`INSERT INTO apex.user_garages (user_id,state,revision,updated_at) SELECT user_id::text,state::text,revision,updated_at FROM public.user_garages WHERE EXISTS (SELECT 1 FROM apex.users WHERE id=public.user_garages.user_id::text) ON CONFLICT DO NOTHING`,[]]);
  if(compatible('user_verifications'))migrate.push([`INSERT INTO apex.user_verifications (user_id,verified_at) SELECT user_id::text,verified_at FROM public.user_verifications WHERE EXISTS (SELECT 1 FROM apex.users WHERE id=public.user_verifications.user_id::text) ON CONFLICT DO NOTHING`,[]]);
  if(compatible('user_preferences'))migrate.push([`INSERT INTO apex.user_preferences (user_id,language) SELECT user_id::text,language FROM public.user_preferences WHERE language IN ('en','ka','ru') AND EXISTS (SELECT 1 FROM apex.users WHERE id=public.user_preferences.user_id::text) ON CONFLICT DO NOTHING`,[]]);
  // Sessions and account recovery tokens are deliberately not copied. Re-copying
  // a legacy token on a later cold start would resurrect a revoked session or
  // let an already-used recovery link run again. Owners sign in to the new schema.
  if(transaction)await transaction(migrate);else for(const [sql,values]of migrate)await query(sql,values);
 }
 return report;
}
export async function createPostgresDatabase(connectionString,{initialize=true}={}){
 validateDatabaseURL(connectionString);
 let client=clients.get(connectionString);
 if(!client){
  const sql=neon(connectionString);
  const query=(text,values=[])=>sql.query(text,values,{fullResults:true,fetchOptions:{signal:AbortSignal.timeout(12000)}});
  const transaction=statements=>sql.transaction(statements.map(([text,values])=>sql.query(text,values)),{fullResults:true,fetchOptions:{signal:AbortSignal.timeout(12000)}});
  client={query,transaction,ready:null};clients.set(connectionString,client);
 }
 if(initialize){
  if(!client.ready)client.ready=initializePostgres(client.query,client.transaction).catch(error=>{client.ready=null;throw error;});
  await client.ready;
 }
 return {...createPostgresAdapter(client.query,client.transaction),inspect:()=>inspectPostgres(client.query),initialize:()=>initializePostgres(client.query,client.transaction)};
}
