import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolvePage} from '../public/routes.js';
import {handleApi} from '../server/api.js';
import {createLocalDatabase} from '../server/local-db.mjs';
import {createPostgresDatabase,databaseURL} from '../server/postgres-db.js';

const project=fileURLToPath(new URL('../',import.meta.url));
const root=path.join(project,'public');
const port=Number(process.env.PORT)||3000,host=process.env.HOST||'127.0.0.1';
const configuredOrigin=process.env.PUBLIC_ORIGIN?new URL(process.env.PUBLIC_ORIGIN).origin:null;
if(configuredOrigin&&!/^https?:/.test(configuredOrigin))throw new Error('PUBLIC_ORIGIN must be an HTTP or HTTPS origin.');
const neonConnection=databaseURL();
let database=neonConnection?null:await createLocalDatabase(path.resolve(project,process.env.DATABASE_PATH||'.data/bmw-garage.sqlite'));
const env={AUTH_PROVIDER:'password'};
const maxBodyBytes=1024*1024;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json'};
function securityHeaders(res){res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','SAMEORIGIN');}
function fail(res,status,message){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify({error:message}));}
async function apiRequest(req,res,url){
 const headers=new Headers();
 for(const [name,value] of Object.entries(req.headers)){
  // Hosted identity is supplied only by Sites, never by a local client.
  if(name.startsWith('oai-')||value===undefined)continue;
  headers.set(name,Array.isArray(value)?value.join(', '):value);
 }
 let body;
 if(!['GET','HEAD'].includes(req.method)){
  const chunks=[];let length=0;
  for await(const chunk of req){length+=chunk.length;if(length>maxBodyBytes){fail(res,413,'Request body is too large.');return;}chunks.push(chunk);}
  body=Buffer.concat(chunks);
 }
 const request=new Request(url,{method:req.method,headers,body});
 if(!database)database=await createPostgresDatabase(neonConnection);
 const response=await handleApi(request,{...env,DB:database,CLIENT_IP:req.socket.remoteAddress||'local'});
 if(!response){fail(res,404,'API route not found.');return;}
 res.statusCode=response.status;
 for(const [name,value] of response.headers)if(name!=='set-cookie')res.setHeader(name,value);
 const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);
 res.end(req.method==='HEAD'?undefined:Buffer.from(await response.arrayBuffer()));
}
const server=http.createServer(async(req,res)=>{
 securityHeaders(res);
 try{
  const url=new URL(req.url,configuredOrigin||`http://${req.headers.host||'localhost:'+port}`);
  if(!configuredOrigin&&!['localhost','127.0.0.1','[::1]',host].includes(url.hostname)){fail(res,400,'Unrecognized host. Set PUBLIC_ORIGIN for a public deployment.');return;}
  if(url.pathname.startsWith('/api/')){await apiRequest(req,res,url);return;}
  if(!['GET','HEAD'].includes(req.method)){fail(res,405,'Method not allowed.');return;}
  const relative=resolvePage(url.pathname)||decodeURIComponent(url.pathname).replace(/^\/+/, '');
  let file=path.resolve(root,relative);
  const within=path.relative(root,file);
  if(within.startsWith('..')||path.isAbsolute(within)){fail(res,403,'Forbidden.');return;}
  try{await fs.access(file);}catch{if(file.endsWith('.jpg'))file=file.slice(0,-4)+'.webp';}
  const bytes=await fs.readFile(file);
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
  res.end(req.method==='HEAD'?undefined:bytes);
 }catch(error){
  if(res.headersSent){res.end();return;}
  if(error.code==='ENOENT'||error.code==='EISDIR'){res.writeHead(404);res.end('Not found');return;}
  if(error instanceof URIError||error instanceof TypeError){fail(res,400,'Invalid request.');return;}
  console.error('Server request failed:',error.name);
  fail(res,503,'The server could not complete this request. Please try again.');
 }
});
server.requestTimeout=30000;server.headersTimeout=15000;
server.listen(port,host,()=>console.log(`BMW Garage running at http://${host==='0.0.0.0'?'localhost':host}:${port} — ${neonConnection?'Neon PostgreSQL configured':'local SQLite storage'}.`));
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{server.close(async()=>{await database?.close();process.exit(0);});server.closeIdleConnections();});
