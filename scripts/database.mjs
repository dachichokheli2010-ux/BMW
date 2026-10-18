import {createPostgresDatabase,databaseURL} from '../server/postgres-db.js';
const mode=process.argv[2]||'check';
if(!['check','migrate'].includes(mode))throw new Error('Use database.mjs check or migrate.');
const connection=databaseURL();
if(!connection){console.error('No database connection found. Set DATABASE_URL in .env.local or the server environment.');process.exitCode=1;}
else{
 try{
  const database=await createPostgresDatabase(connection,{initialize:false});
  if(mode==='migrate')await database.initialize();
  const tables=await database.inspect();
  const ready=Object.values(tables).every(table=>!table.missing.length);
  console.log(JSON.stringify({provider:'Neon PostgreSQL',schema:'apex',ready,mode,tables},null,2));
  if(!ready){console.error('App tables are missing. Run npm run db:migrate; it preserves your public tables.');process.exitCode=1;}
 }catch(error){
  console.error('Database '+mode+' failed. Diagnostic: '+String(error.code||error.name||'unknown')+'. Check the Neon connection, database role permissions, and network access.');process.exitCode=1;
 }
}
