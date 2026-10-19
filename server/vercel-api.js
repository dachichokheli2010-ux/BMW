import {handleApi,AUTH_PATHS} from './api.js';
import {createPostgresDatabase,databaseURL} from './postgres-db.js';

const json=(body,status)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function createVercelHandler({environment=process.env,connect=createPostgresDatabase,api=handleApi}={}){
 return async request=>{
  if(!AUTH_PATHS.has(new URL(request.url).pathname))return json({error:'Not found.'},404);
  const connectionString=databaseURL(environment);
  if(!connectionString)return json({error:'Account sign-in is not configured yet. Connect a Neon Postgres database and set DATABASE_URL for this deployment.'},503);
  try{
   const database=await connect(connectionString);
   return await api(request,{DB:database,AUTH_PROVIDER:'password',PUBLIC_ORIGIN:environment.PUBLIC_ORIGIN,RESEND_API_KEY:environment.RESEND_API_KEY,ACCOUNT_MAIL_FROM:environment.ACCOUNT_MAIL_FROM,ADMIN_EMAILS:environment.ADMIN_EMAILS,ADMIN_USER_IDS:environment.ADMIN_USER_IDS,CLIENT_IP:request.headers.get('x-real-ip')||request.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown'})||json({error:'Not found.'},404);
  }catch(error){
   // Log a diagnostic code, never the connection string, SQL values or passwords.
   console.error('Account database unavailable.',String(error.code||error.name||'unknown'));
   return json({error:'Account storage is temporarily unavailable. Your guest data is still saved in this browser.'},503);
  }
 };
}
export default {fetch:createVercelHandler()};
