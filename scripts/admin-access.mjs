import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import {createPostgresDatabase,databaseURL} from '../server/postgres-db.js';
import {administratorAccess} from '../server/admin-policy.js';

// Read only. Look up explicitly configured owners, never enumerate accounts or
// print names, email addresses, password hashes, sessions or connection strings.
const entries=value=>(value||'').split(',').map(item=>item.trim()).filter(Boolean);
const ids=entries(process.env.ADMIN_USER_IDS),emails=entries(process.env.ADMIN_EMAILS).map(email=>email.toLowerCase());
let database;
try{
  if(!ids.length&&!emails.length)throw Object.assign(new Error(),{code:'NO_ADMIN_CONFIG'});
  const connection=databaseURL();
  const provider=connection?'PostgreSQL':'SQLite';
  if(connection)database=await createPostgresDatabase(connection,{initialize:false});
  else{
    const root=fileURLToPath(new URL('../',import.meta.url));
    const local=new DatabaseSync(path.resolve(root,process.env.DATABASE_PATH||'.data/bmw-garage.sqlite'),{readOnly:true});
    database={prepare:sql=>({bind:(...values)=>({all:async()=>({results:local.prepare(sql).all(...values)})})}),close:async()=>local.close()};
  }
  const predicates=[],values=[];
  if(ids.length){predicates.push('users.id IN ('+ids.map(()=>'?').join(',')+')');values.push(...ids);}
  if(emails.length){predicates.push('LOWER(users.email) IN ('+emails.map(()=>'?').join(',')+')');values.push(...emails);}
  const {results}=await database.prepare('SELECT users.id, users.email, users.provider, user_verifications.verified_at FROM users LEFT JOIN user_verifications ON user_verifications.user_id = users.id WHERE '+predicates.join(' OR ')).bind(...values).all();
  const accounts=results.map(row=>{
    const access=administratorAccess(process.env,{id:row.id,email:row.email,emailVerified:row.provider==='chatgpt'||Boolean(row.verified_at)});
    return {id:row.id,isAdmin:access.isAdmin,verificationRequired:access.verificationRequired};
  });
  console.log(JSON.stringify({provider,readOnly:true,matchedAccounts:accounts.length,accounts},null,2));
  if(!accounts.length){console.error('No configured owner account exists in this database. Check that you are inspecting the same database as the deployment.');process.exitCode=1;}
  else if(accounts.some(account=>account.verificationRequired)){
    console.error('Owner email verification is pending. Configure mail delivery, or pin the matching existing account ID in the server ADMIN_USER_IDS setting. Local and deployed databases can have different IDs.');
    process.exitCode=1;
  }
}catch(error){
  const code=String(error.code||error.name||'unknown');
  console.error(code==='NO_ADMIN_CONFIG'?'Set ADMIN_EMAILS or ADMIN_USER_IDS in the server environment before checking owner access.':'Admin access check failed ('+code+'). Check the database connection and run migrations if the account tables are missing.');
  process.exitCode=1;
}finally{await database?.close();}
