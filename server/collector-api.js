import {catalogMeta} from './catalog-meta.js';

export const COLLECTOR_PATHS=new Set(['/api/collector/workspace']);
export const COLLECTOR_LIMITS=Object.freeze({freeProjects:1,paidProjects:20,freeSnapshots:3,paidSnapshots:50,items:200,milestones:100,bodyBytes:1024*1024});
const modelIds=new Set(catalogMeta.models.map(model=>model.id));
const object=value=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
const only=(value,keys)=>object(value)&&Object.keys(value).every(key=>keys.includes(key));
const safeId=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(value);
const text=(value,max,required=false)=>typeof value==='string'&&value.length<=max&&(!required||value.trim().length>0)&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
const money=(value,max=100000000)=>value===null||typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=max;
const list=(value,maximum)=>Array.isArray(value)&&value.length<=maximum;
const unique=values=>new Set(values.map(value=>value.id)).size===values.length;
const iso=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value;
const safeURL=value=>{if(value==='')return true;if(!text(value,2048))return false;try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password;}catch{return false;}};
export const emptyCollectorWorkspace=()=>({version:1,activeProjectId:null,projects:[]});

/** Plain private planner records. No client field can carry a paid entitlement. */
export function validateCollectorWorkspace(value){
 if(!only(value,['version','activeProjectId','projects'])||value.version!==1||!list(value.projects,COLLECTOR_LIMITS.paidProjects))return null;
 const projects=[];
 for(const entry of value.projects){
  if(!only(entry,['id','modelId','title','kind','engineCode','currency','budget','notes','items','milestones','snapshots'])||!safeId(entry.id)||!text(entry.title,80,true))return null;
  const project={id:entry.id,modelId:entry.modelId??null,title:entry.title.trim(),kind:entry.kind??'build',engineCode:entry.engineCode??'',currency:entry.currency??'USD',budget:entry.budget??null,notes:entry.notes??'',items:entry.items??[],milestones:entry.milestones??[],snapshots:entry.snapshots??[]};
  if(project.modelId!==null&&!modelIds.has(project.modelId)||!['collection','build','research'].includes(project.kind)||!text(project.engineCode,80)||!['USD','EUR','GEL','GBP'].includes(project.currency)||!money(project.budget)||!text(project.notes,5000)||!list(project.items,COLLECTOR_LIMITS.items)||!list(project.milestones,COLLECTOR_LIMITS.milestones)||!list(project.snapshots,COLLECTOR_LIMITS.paidSnapshots))return null;
  const items=[];
  for(const entry of project.items){
   if(!only(entry,['id','kind','label','estimated','actual','status','url','notes'])||!safeId(entry.id)||!text(entry.label,120,true))return null;
   const item={id:entry.id,kind:entry.kind??'other',label:entry.label.trim(),estimated:entry.estimated??null,actual:entry.actual??null,status:entry.status??'planned',url:entry.url??'',notes:entry.notes??''};
   if(!['part','service','other'].includes(item.kind)||!['planned','ordered','done'].includes(item.status)||!money(item.estimated)||!money(item.actual)||!safeURL(item.url)||!text(item.notes,1000))return null;
   items.push(item);
  }
  const milestones=[];
  for(const entry of project.milestones){
   if(!only(entry,['id','label','done'])||!safeId(entry.id)||!text(entry.label,160,true)||typeof entry.done!=='boolean')return null;
   milestones.push({id:entry.id,label:entry.label.trim(),done:entry.done});
  }
  const snapshots=[];
  for(const entry of project.snapshots){
   if(!only(entry,['id','name','createdAt','budget','estimated','actual','notes'])||!safeId(entry.id)||!text(entry.name,80,true)||!iso(entry.createdAt)||!money(entry.budget??null)||!money(entry.estimated,20000000000)||entry.estimated===null||!money(entry.actual,20000000000)||entry.actual===null||!text(entry.notes??'',1000))return null;
   snapshots.push({id:entry.id,name:entry.name.trim(),createdAt:entry.createdAt,budget:entry.budget??null,estimated:entry.estimated,actual:entry.actual,notes:entry.notes??''});
  }
  if(!unique(items)||!unique(milestones)||!unique(snapshots))return null;
  projects.push({...project,items,milestones,snapshots});
 }
 const activeProjectId=value.activeProjectId??null;
 if(!unique(projects)||activeProjectId!==null&&!projects.some(project=>project.id===activeProjectId))return null;
 return {version:1,activeProjectId,projects};
}

export async function readCollectorMembership(env,userId,{now=Date.now()}={}){
 const row=await env.DB.prepare('SELECT status,current_period_end,cancel_at_period_end FROM collector_entitlements WHERE user_id = ?').bind(userId).first();
 const end=Number(row?.current_period_end),active=Boolean(row&&['active','trialing'].includes(row.status)&&Number.isFinite(end)&&end>now);
 return {plan:active?'collector':'free',active,status:row?.status||'free',expiresAt:Number.isFinite(end)&&end>0?new Date(end).toISOString():null,cancelAtPeriodEnd:row?.cancel_at_period_end===1,projectLimit:active?COLLECTOR_LIMITS.paidProjects:COLLECTOR_LIMITS.freeProjects,snapshotLimit:active?COLLECTOR_LIMITS.paidSnapshots:COLLECTOR_LIMITS.freeSnapshots};
}

/** Only a verified provider webhook may call this server-only helper. */
export async function upsertCollectorEntitlement(env,value,{now=Date.now()}={}){
 const {userId,customerId,subscriptionId,priceId,status,currentPeriodEnd,cancelAtPeriodEnd=false,eventCreated,eventId}=value||{};
 const providerId=(id,prefix)=>typeof id==='string'&&id.startsWith(prefix)&&/^[A-Za-z0-9_]{3,255}$/.test(id);
 if(!text(userId,128,true)||!providerId(customerId,'cus_')||!providerId(subscriptionId,'sub_')||!providerId(priceId,'price_')||!providerId(eventId,'evt_')||!['active','trialing','past_due','canceled','unpaid','paused','incomplete','incomplete_expired'].includes(status)||!Number.isSafeInteger(currentPeriodEnd)||currentPeriodEnd<0||currentPeriodEnd>8640000000000000||typeof cancelAtPeriodEnd!=='boolean'||!Number.isSafeInteger(eventCreated)||eventCreated<0)throw new TypeError('Invalid provider entitlement record.');
 const owner=await env.DB.prepare('SELECT user_id FROM collector_customers WHERE customer_id = ?').bind(customerId).first();
 if(owner?.user_id!==userId)throw new Error('A trusted account/customer mapping is required.');
 const duplicate=Boolean(await env.DB.prepare('SELECT id FROM collector_billing_events WHERE id = ?').bind(eventId).first());
 if(duplicate)return {updated:false,duplicate:true};
 const nonce=new Uint32Array(2);crypto.getRandomValues(nonce);const claimMarker=-(nonce[0]*65536+(nonce[1]&65535)+1);
 // Customer ownership, provider event ordering and receipt persistence are checked
 // in the same transaction. Billing events never appear in public garage backups.
 const result=await env.DB.batch([
  env.DB.prepare('INSERT INTO collector_billing_events (id,created_at,processed_at) VALUES (?,?,?) ON CONFLICT(id) DO NOTHING').bind(eventId,eventCreated,claimMarker),
  env.DB.prepare("INSERT INTO collector_entitlements (user_id,provider,customer_id,subscription_id,price_id,status,current_period_end,cancel_at_period_end,last_event_created,last_event_id,updated_at) SELECT ?,'stripe',?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM collector_customers WHERE user_id = ? AND customer_id = ?) AND EXISTS (SELECT 1 FROM collector_billing_events WHERE id = ? AND processed_at = ?) ON CONFLICT(user_id) DO UPDATE SET customer_id = excluded.customer_id, subscription_id = excluded.subscription_id, price_id = excluded.price_id, status = excluded.status, current_period_end = excluded.current_period_end, cancel_at_period_end = excluded.cancel_at_period_end, last_event_created = excluded.last_event_created, last_event_id = excluded.last_event_id, updated_at = excluded.updated_at WHERE collector_entitlements.customer_id = excluded.customer_id AND collector_entitlements.last_event_created <= excluded.last_event_created AND (collector_entitlements.subscription_id = excluded.subscription_id OR collector_entitlements.status IN ('canceled','incomplete_expired','unpaid') OR collector_entitlements.current_period_end <= ?)").bind(userId,customerId,subscriptionId,priceId,status,currentPeriodEnd,cancelAtPeriodEnd?1:0,eventCreated,eventId,now,userId,customerId,eventId,claimMarker,now),
  env.DB.prepare('UPDATE collector_billing_events SET processed_at = ? WHERE id = ? AND processed_at = ?').bind(now,eventId,claimMarker),
 ]);
 return {updated:Boolean(result[1]?.meta?.changes),duplicate:!result[0]?.meta?.changes};
}

async function snapshot(env,userId){
 const row=await env.DB.prepare('SELECT state,revision,updated_at FROM collector_workspaces WHERE user_id = ?').bind(userId).first();
 const state=row?validateCollectorWorkspace(JSON.parse(row.state)):emptyCollectorWorkspace();
 if(!state)throw new Error('Stored Collector workspace is invalid.');
 return {state,revision:row?Number(row.revision):0,updatedAt:row?new Date(Number(row.updated_at)).toISOString():null,membership:await readCollectorMembership(env,userId)};
}
function additionsAllowed(incoming,current,membership){
 const previous=new Map(current.projects.map(project=>[project.id,project]));
 if(incoming.projects.length>membership.projectLimit&&incoming.projects.some(project=>!previous.has(project.id)))return false;
 for(const project of incoming.projects){
  const retained=new Set(previous.get(project.id)?.snapshots.map(item=>item.id)||[]);
  if(project.snapshots.length>membership.snapshotLimit&&project.snapshots.some(item=>!retained.has(item.id)))return false;
 }
 return true;
}

export async function handleCollector(request,env,{session,ApiError,readJSON,requireCSRF,authRequired,limit,json,sessionHeaders}){
 authRequired(session);
 const respond=(body,status=200,headers={})=>json(body,status,{...sessionHeaders(session),...headers});
 if(request.method==='GET')return respond(await snapshot(env,session.user.id));
 if(request.method!=='PUT')return respond({error:'Method not allowed.'},405,{Allow:'GET, PUT'});
 requireCSRF(request,session);await limit(env,'collector-workspace:'+session.user.id,120,60000);
 const body=await readJSON(request,COLLECTOR_LIMITS.bodyBytes),state=validateCollectorWorkspace(body?.state);
 if(!only(body,['state','revision'])||!state||!Number.isSafeInteger(body.revision)||body.revision<0||body.revision>=2147483647)throw new ApiError('Check your project titles, amounts, links and records before saving.',400,'INVALID_COLLECTOR_DATA');
 const current=await snapshot(env,session.user.id);
 const conflict=async()=>respond({error:'Your workspace changed in another tab or device. Review the latest save before replacing it.',code:'REVISION_CONFLICT',...await snapshot(env,session.user.id)},409);
 if(body.revision!==current.revision)return conflict();
 if(!additionsAllowed(state,current.state,current.membership))return respond({error:'Collector adds room for more projects and budget checkpoints. Your existing records remain available to edit, export or remove.',code:'COLLECTOR_LIMIT',membership:current.membership},403);
 const serialized=JSON.stringify(state),now=Date.now();
 const result=body.revision===0?await env.DB.prepare('INSERT INTO collector_workspaces (user_id,state,revision,updated_at) VALUES (?,?,1,?) ON CONFLICT(user_id) DO NOTHING').bind(session.user.id,serialized,now).run():await env.DB.prepare('UPDATE collector_workspaces SET state = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ?').bind(serialized,now,session.user.id,body.revision).run();
 if(!result.meta?.changes)return conflict();
 return respond({state,revision:body.revision+1,updatedAt:new Date(now).toISOString(),membership:current.membership});
}
