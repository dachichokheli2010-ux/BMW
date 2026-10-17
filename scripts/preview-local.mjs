// Local preview. Hosted authentication and database remain separate.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {Readable} from 'node:stream';
import {fileURLToPath} from 'node:url';
import {chatRoute} from '../worker/chat.js';
const root=fileURLToPath(new URL('../public/',import.meta.url));
const aliases={'/':'index.html','/parts':'parts.html','/parts/':'parts.html','/electric':'electric.html','/electric/':'electric.html','/about':'about.html','/about/':'about.html'};
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json'};
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/chat'){
   const requestUrl=new URL(req.url,`http://${req.headers.host||'localhost'}`);
   const request=req.method==='GET'||req.method==='HEAD'
    ?new Request(requestUrl,{method:req.method,headers:req.headers})
    :new Request(requestUrl,{method:req.method,headers:req.headers,body:Readable.toWeb(req),duplex:'half'});
   const response=await chatRoute(request,{
    OPENROUTER_API_KEY:process.env.OPENROUTER_API_KEY,
    OPENROUTER_MODEL:process.env.OPENROUTER_MODEL,
    OPENAI_API_KEY:process.env.OPENAI_API_KEY,
    OPENAI_MODEL:process.env.OPENAI_MODEL
   });
   res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
  }
  if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Cloud accounts and garage storage are not connected in this local preview.'}));return;}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end('Method not allowed');return;}
  const relative=aliases[url.pathname]||decodeURIComponent(url.pathname).replace(/^\/+/, '');
  let file=path.resolve(root,relative);
  if(!file.startsWith(root)){res.writeHead(403);res.end('Forbidden');return;}
  try{await fs.access(file);}catch{if(file.endsWith('.jpg'))file=file.slice(0,-4)+'.webp';}
  const bytes=await fs.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(3000,'127.0.0.1',()=>console.log('BMW site running at http://localhost:3000 — press Ctrl+C to stop.'));
