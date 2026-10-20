import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {AUTH_PATHS} from '../server/api.js';
import {createRoutedVercelHandler} from '../server/vercel-router.js';

const origin='https://garage.test',database={},calls=[];
const handler=createRoutedVercelHandler({environment:{DATABASE_URL:'postgresql://test:test@db.invalid/test'},connect:async()=>database,api:async(request,env)=>{
  calls.push({url:new URL(request.url),method:request.method,origin:request.headers.get('origin'),cookie:request.headers.get('cookie'),csrf:request.headers.get('x-csrf-token'),body:['GET','HEAD'].includes(request.method)?null:await request.json(),database:env.DB});
  return Response.json({reached:true});
}});
let checks=0;
for(const route of [...AUTH_PATHS].filter(path=>/^\/api\/(?:admin|community)(?:\/|$)/.test(path))){
  const query=new URLSearchParams({__apex_route:route.slice(5),id:'photo-123',token:'shared-link'});
  const response=await handler(new Request(origin+'/api/router?'+query));
  assert.equal(response.status,200,route+' reaches the shared function');
  const call=calls.at(-1);assert.equal(call.url.pathname,route);assert.equal(call.url.searchParams.get('id'),'photo-123');assert.equal(call.url.searchParams.get('token'),'shared-link');assert.equal(call.url.searchParams.has('__apex_route'),false);assert.equal(call.database,database);checks++;
}
const credentials={email:'owner@example.test',password:'test-only-password'};
await handler(new Request(origin+'/api/router?__apex_route=admin/login',{method:'POST',headers:{Origin:origin,Cookie:'bmw_admin=test-token','X-CSRF-Token':'csrf-token','Content-Type':'application/json'},body:JSON.stringify(credentials)}));
assert.deepEqual(calls.at(-1).body,credentials);assert.equal(calls.at(-1).method,'POST');assert.equal(calls.at(-1).origin,origin);assert.equal(calls.at(-1).cookie,'bmw_admin=test-token');assert.equal(calls.at(-1).csrf,'csrf-token');checks++;
assert.equal((await handler(new Request(origin+'/api/admin/session'))).status,200);checks++;
for(const path of ['/api/router','/api/router?__apex_route=admin/login&__apex_route=admin/session','/api/router?__apex_route=https://evil.test','/api/router?__apex_route=admin/../auth/login','/api/router?__apex_route=admin/unknown','/api/router?__apex_route=auth/login']){
  const before=calls.length,response=await handler(new Request(origin+path));assert.equal(response.status,404);assert.equal(calls.length,before);assert.equal(response.headers.get('cache-control'),'no-store');checks++;
}
const config=JSON.parse(await fs.readFile(new URL('../vercel.json',import.meta.url),'utf8'));
assert.ok(config.rewrites.some(rule=>rule.source==='/api/admin/:action'&&rule.destination==='/api/router?__apex_route=admin/:action'));
assert.ok(config.rewrites.some(rule=>rule.source==='/api/community/:path*'&&rule.destination==='/api/router?__apex_route=community/:path*'));checks+=2;
console.log(`Vercel API routing: ${checks} checks passed (all nested routes, private mutations, query preservation and invalid targets).`);
