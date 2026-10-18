import {handleApi} from '../server/api.js';
import {createPostgresDatabase} from '../server/postgres-db.js';

const json=(body,status)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});

async function handleRequest(request){
  const connectionString=process.env.DATABASE_URL||process.env.DATABASE_URL_UNPOOLED||process.env.POSTGRES_URL||process.env.POSTGRES_URL_NON_POOLING;
  if(!connectionString)return json({error:'Account sign-in is not configured yet. Connect a Neon Postgres database to this Vercel project, then redeploy.'},503);
  let database;
  try{
    database=await createPostgresDatabase(connectionString);
    const response=await handleApi(request,{
      DB:database,
      AUTH_PROVIDER:'password',
      CLIENT_IP:request.headers.get('x-real-ip')||request.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown'
    });
    return response||json({error:'Not found.'},404);
  }catch(error){
    console.error('Vercel account API failed.');
    return json({error:'Account storage is temporarily unavailable. Your guest data is still saved in this browser.'},503);
  }finally{
    if(database)try{await database.close();}catch{console.error('Vercel account database connection could not be closed cleanly.');}
  }
}

export default {fetch:handleRequest};
