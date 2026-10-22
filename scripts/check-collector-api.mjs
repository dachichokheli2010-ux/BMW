import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {createLocalDatabase} from '../server/local-db.mjs';
import {createPostgresAdapter,initializePostgres} from '../server/postgres-db.js';
import {handleApi} from '../server/api.js';
import {emptyCollectorWorkspace,validateCollectorWorkspace,readCollectorMembership,upsertCollectorEntitlement} from '../server/collector-api.js';
import {randomToken,tokenHash} from '../server/passwords.js';

const origin='https://collector.test',route='/api/collector/workspace',now=Date.now();
let checks=0;const check=(value,message)=>{assert.ok(value,message);checks++;};
const project=(id='project-one')=>({id,modelId:'f10-m5',title:'My M5 research',kind:'build',engineCode:'S63TU',currency:'GEL',budget:12000,notes:'A private, user-entered plan.',items:[{id:'part-one',kind:'service',label:'Inspection',estimated:250,actual:220,status:'done',url:'https://example.test/source',notes:'My estimate, not a market quote.'}],milestones:[{id:'milestone-one',label:'Read the exact service schedule',done:true}],snapshots:[]});
const checkpoint=index=>({id:'snapshot-'+index,name:'Budget checkpoint '+index,createdAt:new Date(now).toISOString(),budget:12000,estimated:250,actual:220,notes:'My saved totals.'});

async function verify(DB,label){
 const env={DB,AUTH_PROVIDER:'password',CLIENT_IP:'collector-'+label};
 const principal=async(name)=>{
  const id='local:'+label+'-'+name,token=randomToken(),csrf=randomToken();
  await DB.prepare("INSERT INTO users (id,provider,email,name,password_hash,created_at,updated_at) VALUES (?,'password',?,?,'fixture',?,?)").bind(id,label+'-'+name+'@example.test',name,now,now).run();
  await DB.prepare('INSERT INTO sessions (token_hash,user_id,csrf_token,created_at,expires_at) VALUES (?,?,?,?,?)').bind(await tokenHash(token),id,csrf,now,now+86400000).run();
  return {id,cookie:'__Host-bmw_session='+token,csrf};
 };
 const alice=await principal('alice'),bob=await principal('bob');
 async function call({method='GET',body,account=alice,headers={},path=route,environment=env}={}){
  const response=await handleApi(new Request(origin+path,{method,headers:{...(method==='GET'?{}:{Origin:origin,'Content-Type':'application/json'}),...(account?{Cookie:account.cookie,'X-CSRF-Token':account.csrf}:{}),...headers},body:body===undefined?undefined:typeof body==='string'?body:JSON.stringify(body)}),environment);
  return {response,data:await response.json(),status:response.status};
 }
 const read=()=>call(),save=async(state,extra={})=>call({method:'PUT',body:{state,revision:(await read()).data.revision},...extra});
 check((await call({account:null})).status===401,label+' anonymous workspace denied');
 const initial=await read();check(initial.data.revision===0&&initial.data.membership.plan==='free'&&initial.data.membership.projectLimit===1&&initial.data.membership.snapshotLimit===3,label+' starts free from server authority');
 assert.deepEqual(initial.data.state,emptyCollectorWorkspace());checks++;
 check(initial.response.headers.get('cache-control')==='no-store',label+' private responses cannot be cached');
 check((await call({method:'POST',body:{}})).status===405,label+' only GET and PUT accepted');
 const state={version:1,activeProjectId:'project-one',projects:[project()]};
 check((await call({method:'PUT',body:{state,revision:0},headers:{'X-CSRF-Token':''}})).status===403,label+' CSRF required');
 check((await call({method:'PUT',body:{state,revision:0},headers:{'X-CSRF-Token':bob.csrf}})).status===403,label+' another account token cannot authorize a write');
 check((await call({method:'PUT',body:{state,revision:0},headers:{Origin:'https://attacker.test'}})).status===403,label+' cross-origin save blocked');
 check((await call({method:'PUT',body:{state,revision:0},headers:{Origin:'','Sec-Fetch-Site':'same-site'}})).status===403,label+' same-site is not same-origin');
 check((await call({method:'PUT',body:{state,revision:0,userId:bob.id}})).status===400,label+' body cannot select another owner');
 check((await call({method:'PUT',body:{state,revision:0,membership:{active:true}}})).status===400,label+' body cannot grant membership');
 check((await call({method:'PUT',body:'{bad json'})).status===400,label+' invalid JSON rejected');
 check((await call({method:'PUT',body:{state,revision:0},headers:{'Content-Type':'text/plain'}})).status===415,label+' JSON media type enforced');
 check((await call({method:'PUT',body:'x'.repeat(1024*1024+1)})).status===413,label+' streamed byte limit enforced');
 const first=await save(state);check(first.status===200&&first.data.revision===1,label+' first project saves on the server');
 assert.deepEqual((await read()).data.state,state);checks++;
 check((await call({account:bob})).data.state.projects.length===0,label+' another user cannot read private projects');
 check((await call({path:route+'?userId='+encodeURIComponent(bob.id)})).data.state.projects[0].title===state.projects[0].title,label+' query cannot switch principal');
 check((await call({path:'/api/collector/entitlements'})).status===404,label+' no client entitlement endpoint exists');
 check((await call({method:'PUT',body:{state,revision:0}})).status===409,label+' stale revision rejected');
 const parallel=await Promise.all([call({method:'PUT',body:{state:{...state,projects:[{...project(),notes:'Tab A'}]},revision:1}}),call({method:'PUT',body:{state:{...state,projects:[{...project(),notes:'Tab B'}]},revision:1}})]);
 assert.deepEqual(parallel.map(value=>value.status).sort(),[200,409]);checks++;
 check(parallel.find(value=>value.status===409).data.code==='REVISION_CONFLICT',label+' concurrent overwrite returns a reviewable snapshot');
 const forged={...state,projects:[project(),project('project-two')]};
 check((await save(forged,{headers:{'X-Collector-Plan':'collector'}})).status===403,label+' browser headers cannot grant extra projects');
 const snapshots={...state,projects:[{...project(),snapshots:Array.from({length:4},(_,index)=>checkpoint(index))}]};
 check((await save(snapshots)).status===403,label+' free checkpoint allowance enforced');
 const basic={...state,projects:[{...project(),snapshots:Array.from({length:3},(_,index)=>checkpoint(index))}]};
 check((await save(basic)).status===200,label+' free cost tracking, notes, milestones and three checkpoints work');
 for(const invalid of [
  {...state,activeProjectId:'not-owned'},
  {...state,projects:[{...project(),modelId:'not-in-catalog'}]},
  {...state,projects:[{...project(),budget:-1}]},
  {...state,projects:[{...project(),premium:true}]},
  {...state,projects:[{...project(),items:[{...project().items[0],url:'javascript:alert(1)'}]}]},
  {...state,projects:[{...project(),items:[project().items[0],project().items[0]]}]},
  {...state,projects:[{...project(),snapshots:[{...checkpoint(1),createdAt:'2026-02-31T00:00:00.000Z'}]}]},
 ])check((await save(invalid)).status===400,label+' invalid IDs, amounts, links, authority fields or records cannot be saved');
 const beforeFailure=await read(),failing={...env,DB:{...DB,prepare(sql){const statement=DB.prepare(sql);return sql.startsWith('UPDATE collector_workspaces')?{bind:()=>({run:async()=>{throw new Error('fixture failure');}})}:statement;}}};
 check((await save(state,{environment:failing})).status===503,label+' failed database write is retryable');
 check((await read()).data.revision===beforeFailure.data.revision,label+' failed save cannot replace existing data');
 check((await DB.prepare('SELECT state FROM user_garages WHERE user_id = ?').bind(alice.id).first())===null,label+' planner never changes account garage snapshots');

 await DB.prepare('INSERT INTO collector_customers (user_id,customer_id,created_at) VALUES (?,?,?)').bind(alice.id,'cus_'+label+'_alice',now).run();
 await DB.prepare('INSERT INTO collector_customers (user_id,customer_id,created_at) VALUES (?,?,?)').bind(bob.id,'cus_'+label+'_bob',now).run();
 const entitlement={userId:alice.id,customerId:'cus_'+label+'_alice',subscriptionId:'sub_'+label+'_one',priceId:'price_'+label+'_monthly',status:'active',currentPeriodEnd:now+86400000,cancelAtPeriodEnd:true,eventCreated:now-5000,eventId:'evt_'+label+'_active'};
 await assert.rejects(upsertCollectorEntitlement(env,{...entitlement,customerId:'cus_'+label+'_bob'}),/trusted account/);checks++;
 const paid=await upsertCollectorEntitlement(env,entitlement);check(paid.updated&&!paid.duplicate,label+' verified entitlement and event receipt commit together');
 const membership=await readCollectorMembership(env,alice.id);check(membership.active&&membership.plan==='collector'&&membership.projectLimit===20&&membership.snapshotLimit===50&&membership.cancelAtPeriodEnd,label+' paid limits follow provider-backed active period');
 check(!(await readCollectorMembership(env,alice.id,{now:now+86400001})).active,label+' entitlement expires by authoritative period end');
 check((await read()).data.membership.plan==='collector',label+' workspace reads current server entitlement');
 const duplicate=await upsertCollectorEntitlement(env,{...entitlement,status:'canceled'});check(duplicate.duplicate&&!duplicate.updated&&(await readCollectorMembership(env,alice.id)).active,label+' event replay cannot change an entitlement');
 const stale=await upsertCollectorEntitlement(env,{...entitlement,eventId:'evt_'+label+'_stale',eventCreated:now-10000,status:'canceled'});check(!stale.updated&&!stale.duplicate&&(await readCollectorMembership(env,alice.id)).active,label+' out-of-order provider event cannot revoke a newer period');
 check(Boolean(await DB.prepare('SELECT id FROM collector_billing_events WHERE id = ?').bind('evt_'+label+'_stale').first()),label+' ignored stale events get replay receipts');
 const rollbackEnv={...env,DB:{...DB,prepare(sql){const statement=DB.prepare(sql);return sql.startsWith('UPDATE collector_billing_events SET processed_at')?{bind:(...values)=>statement.bind(null,values[1],values[2])}:statement;}}};
 await assert.rejects(upsertCollectorEntitlement(rollbackEnv,{...entitlement,eventId:'evt_'+label+'_rollback',eventCreated:now-1000,status:'canceled'}));checks++;
 check((await readCollectorMembership(env,alice.id)).active&&!await DB.prepare('SELECT id FROM collector_billing_events WHERE id = ?').bind('evt_'+label+'_rollback').first(),label+' receipt failure rolls back the entitlement update');
 const many={version:1,activeProjectId:'project-one',projects:[{...project(),snapshots:Array.from({length:50},(_,index)=>checkpoint(index))},...Array.from({length:19},(_,index)=>project('project-'+(index+2)))]};
 check((await save(many)).status===200,label+' Collector retains 20 projects and 50 budget checkpoints');
 const downgraded=await upsertCollectorEntitlement(env,{...entitlement,status:'canceled',currentPeriodEnd:now-1,eventCreated:now,eventId:'evt_'+label+'_canceled'});check(downgraded.updated,label+' provider cancellation changes server access');
 const afterDowngrade=await read();check(afterDowngrade.data.state.projects.length===20&&!afterDowngrade.data.membership.active,label+' downgrade retains private project data');
 many.projects[0].notes='Edited after cancellation';many.projects[0].snapshots[0].notes='Retained checkpoint remains editable';
 check((await save(many)).status===200,label+' existing excess projects and checkpoints stay editable');
 const replaced=structuredClone(many);replaced.projects[1].id='new-after-downgrade';check((await save(replaced)).status===403,label+' replacing a retained project cannot bypass the free creation limit');
 const replacedCheckpoint=structuredClone(many);replacedCheckpoint.projects[0].snapshots[0].id='new-after-downgrade';check((await save(replacedCheckpoint)).status===403,label+' replacing retained checkpoint IDs cannot bypass the free limit');
 check((await save(emptyCollectorWorkspace())).status===200,label+' users can remove all records after cancellation');
 await DB.prepare('DELETE FROM users WHERE id = ?').bind(alice.id).run();
 check(!await DB.prepare('SELECT user_id FROM collector_workspaces WHERE user_id = ?').bind(alice.id).first()&&!await DB.prepare('SELECT user_id FROM collector_entitlements WHERE user_id = ?').bind(alice.id).first()&&!await DB.prepare('SELECT user_id FROM collector_customers WHERE user_id = ?').bind(alice.id).first(),label+' deleting an account removes private planner and membership records');
}

const sqlite=await createLocalDatabase(':memory:');
try{await verify(sqlite,'sqlite');}finally{sqlite.close();}
const pg=new PGlite();
try{
 const query=async(sql,values=[])=>{const result=await pg.query(sql,values);return {rows:result.rows,rowCount:result.affectedRows??result.rows.length};};
 const transaction=async statements=>pg.transaction(async tx=>{const result=[];for(const [sql,values]of statements)result.push(await tx.query(sql,values));return result;});
 await initializePostgres(query,transaction);
 await verify(createPostgresAdapter(query,transaction),'postgres');
}finally{await pg.close();}
check(validateCollectorWorkspace({version:1,projects:[project()]}).projects[0].currency==='GEL','validator preserves explicit currency');
check(validateCollectorWorkspace({version:1,projects:[{id:'minimal',title:'My first project'}]}).projects[0].kind==='build','optional editor fields receive safe defaults');
console.log(`Collector API: ${checks} checks passed across SQLite and PostgreSQL (privacy, CSRF, revision races, cost validation, paid limits, downgrade retention, verified entitlement replay/order and atomic receipts).`);
