import {environmentValue} from './environment-values.js';
import {tokenHash,timingSafeEqual} from './passwords.js';
import {readCollectorMembership,upsertCollectorEntitlement} from './collector-api.js';

export const MEMBERSHIP_PATHS=new Set(['/api/membership','/api/membership/checkout','/api/membership/portal','/api/membership/webhook']);
export const MEMBERSHIP_ENV_KEYS=['COLLECTOR_PAYMENTS_ENABLED','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_COLLECTOR_MONTHLY_PRICE','STRIPE_COLLECTOR_ANNUAL_PRICE'];
const planned={monthly:{amount:400,currency:'usd'},annual:{amount:3600,currency:'usd'}};
const priceCache=new Map();
const stripeId=(value,prefix)=>typeof value==='string'&&new RegExp('^'+prefix+'_[A-Za-z0-9_]+$').test(value);
const idOf=value=>typeof value==='string'?value:value?.id;
const nonterminal=new Set(['active','trialing','past_due','unpaid','incomplete','paused']);
export function membershipEnvironment(environment){return Object.fromEntries(MEMBERSHIP_ENV_KEYS.map(key=>[key,environmentValue(environment[key])]));}
function configuration(env,{allowPaused=false}={}){
 const key=environmentValue(env.STRIPE_SECRET_KEY),webhook=environmentValue(env.STRIPE_WEBHOOK_SECRET),monthly=environmentValue(env.STRIPE_COLLECTOR_MONTHLY_PRICE),annual=environmentValue(env.STRIPE_COLLECTOR_ANNUAL_PRICE);
 let origin;try{const value=new URL(environmentValue(env.PUBLIC_ORIGIN));if(value.protocol==='https:'&&value.username===''&&value.password===''&&value.pathname==='/'&&!value.search&&!value.hash)origin=value.origin;}catch{}
 return (allowPaused||environmentValue(env.COLLECTOR_PAYMENTS_ENABLED)==='true')&&/^sk_(live|test)_[A-Za-z0-9_]+$/.test(key||'')&&/^whsec_[A-Za-z0-9_]+$/.test(webhook||'')&&stripeId(monthly,'price')&&stripeId(annual,'price')&&monthly!==annual&&origin?{key,webhook,monthly,annual,origin,testMode:key.startsWith('sk_test_')}:null;
}
async function stripe(env,config,path,{method='GET',fields,key}={}){
 const headers={Authorization:'Bearer '+config.key,'Stripe-Version':'2025-06-30.basil'};
 if(fields)headers['Content-Type']='application/x-www-form-urlencoded';if(key)headers['Idempotency-Key']=key;
 const response=await (env.MEMBERSHIP_FETCH||fetch)('https://api.stripe.com/v1/'+path,{method,headers,signal:AbortSignal.timeout(12000),...(fields?{body:new URLSearchParams(fields).toString()}:{})});
 let result;try{result=await response.json();}catch{throw new Error('BILLING_PROVIDER_UNAVAILABLE');}
 if(!response.ok||!result||typeof result!=='object')throw new Error('BILLING_PROVIDER_UNAVAILABLE');
 return result;
}
async function prices(env,config){
 const cacheKey=config.key+'|'+config.monthly+'|'+config.annual,cache=priceCache.get(cacheKey);if(!env.MEMBERSHIP_FETCH&&cache?.until>Date.now())return cache.value;
 const records=await Promise.all(['monthly','annual'].map(interval=>stripe(env,config,'prices/'+config[interval]))),value={};
 for(let i=0;i<records.length;i++){
  const interval=i?'annual':'monthly',record=records[i];
  if(record.id!==config[interval]||record.active!==true||record.currency!=='usd'||!Number.isSafeInteger(record.unit_amount)||record.unit_amount<=0||record.unit_amount>1000000||record.type!=='recurring'||record.recurring?.interval!==(i?'year':'month')||record.recurring?.interval_count!==1||Boolean(record.livemode)===config.testMode)throw new Error('BILLING_PRICE_INVALID');
  value[interval]={amount:record.unit_amount,currency:record.currency};
 }
 if(!env.MEMBERSHIP_FETCH){if(priceCache.size>10)priceCache.clear();priceCache.set(cacheKey,{until:Date.now()+60000,value});}return value;
}
function safeProviderURL(value,host){try{const url=new URL(value);return url.protocol==='https:'&&url.hostname===host&&!url.username&&!url.password?url.href:null;}catch{return null;}}
async function customer(env,config,user){
 let row=await env.DB.prepare('SELECT customer_id FROM collector_customers WHERE user_id = ?').bind(user.id).first();if(row)return row.customer_id;
 const created=await stripe(env,config,'customers',{method:'POST',key:'collector-customer-'+await tokenHash(user.id),fields:{email:user.email,name:user.name,'metadata[motron_user_id]':user.id}});
 if(!stripeId(created.id,'cus'))throw new Error('BILLING_CUSTOMER_INVALID');
 await env.DB.prepare('INSERT INTO collector_customers (user_id,customer_id,created_at) VALUES (?,?,?) ON CONFLICT(user_id) DO NOTHING').bind(user.id,created.id,Date.now()).run();
 row=await env.DB.prepare('SELECT customer_id FROM collector_customers WHERE user_id = ?').bind(user.id).first();return row.customer_id;
}
export async function handleMembership(request,env,context){
 const {session,ApiError,readJSON,requireCSRF,authRequired,limit,json,sessionHeaders}=context,path=new URL(request.url).pathname,method=request.method;
 if(path==='/api/membership'){
  if(method!=='GET')return json({error:'Method not allowed.'},405,{Allow:'GET'});
  const membership=await readCollectorMembership(env,session?.user?.id||null),mapping=session?await env.DB.prepare('SELECT customer_id FROM collector_customers WHERE user_id = ?').bind(session.user.id).first():null;
  let config=configuration(env),plans=planned;try{if(config)plans=await prices(env,config);}catch{config=null;}
  return json({configured:!!config,billingAvailable:!!configuration(env,{allowPaused:true}),testMode:!!config?.testMode,plans,membership:{...membership,hasCustomer:!!mapping}},200,sessionHeaders(session));
 }
 if(!['/api/membership/checkout','/api/membership/portal'].includes(path))return json({error:'Not found.'},404);
 if(method!=='POST')return json({error:'Method not allowed.'},405,{Allow:'POST'});
 authRequired(session);requireCSRF(request,session);
 const body=await readJSON(request,1024),config=configuration(env,{allowPaused:path.endsWith('/portal')});
 if(!body||Array.isArray(body)||typeof body!=='object'||Object.keys(body).some(key=>path.endsWith('/checkout')?key!=='interval':true))throw new ApiError('Invalid membership request.',400);
 if(!config)throw new ApiError('Membership payments are not open yet. The free build planner is available now.',503,'MEMBERSHIP_NOT_CONFIGURED');
 await limit(env,'membership:'+session.user.id,12,15*60*1000);
 try{
  if(path.endsWith('/portal')){
   const row=await env.DB.prepare('SELECT customer_id FROM collector_customers WHERE user_id = ?').bind(session.user.id).first();if(!row)throw new ApiError('This account has no billing profile yet.',404);
   const portal=await stripe(env,config,'billing_portal/sessions',{method:'POST',fields:{customer:row.customer_id,return_url:config.origin+'/club'}}),url=safeProviderURL(portal.url,'billing.stripe.com');if(!url)throw new Error('BILLING_URL_INVALID');return json({url});
  }
  if(!['monthly','annual'].includes(body.interval))throw new ApiError('Choose monthly or annual billing.',400);
  await prices(env,config);
  const customerId=await customer(env,config,session.user),subscriptions=await stripe(env,config,'subscriptions?'+new URLSearchParams({customer:customerId,status:'all',limit:'100'}));
  if(!Array.isArray(subscriptions.data)||subscriptions.has_more)throw new Error('BILLING_SUBSCRIPTIONS_INVALID');
  if(subscriptions.data.some(subscription=>nonterminal.has(subscription.status)))throw new ApiError('You already have a subscription or payment in progress. Use Manage billing to review it.',409,'MEMBERSHIP_EXISTS');
  const now=Date.now(),requestKey=crypto.randomUUID(),expiresAt=Math.floor(now/1000+31*60)*1000;
  await env.DB.prepare("INSERT INTO collector_checkouts (user_id,price_id,interval_key,request_key,session_id,url,expires_at) VALUES (?,?,?,?,'','',?) ON CONFLICT(user_id) DO UPDATE SET price_id = excluded.price_id, interval_key = excluded.interval_key, request_key = excluded.request_key, session_id = '', url = '', expires_at = excluded.expires_at WHERE collector_checkouts.expires_at <= ?").bind(session.user.id,config[body.interval],body.interval,requestKey,expiresAt,now).run();
  const checkout=await env.DB.prepare('SELECT * FROM collector_checkouts WHERE user_id = ?').bind(session.user.id).first();
  if(checkout.interval_key!==body.interval||checkout.price_id!==config[body.interval])throw new ApiError('You already opened checkout with another billing period. Finish that checkout or wait 31 minutes before choosing a different period.',409,'CHECKOUT_IN_PROGRESS');
  if(checkout.url){const url=safeProviderURL(checkout.url,'checkout.stripe.com');if(!url)throw new Error('BILLING_URL_INVALID');return json({url});}
  const created=await stripe(env,config,'checkout/sessions',{method:'POST',key:'collector-checkout-'+checkout.request_key,fields:{mode:'subscription',customer:customerId,client_reference_id:session.user.id,'line_items[0][price]':checkout.price_id,'line_items[0][quantity]':'1','subscription_data[metadata][motron_user_id]':session.user.id,'subscription_data[metadata][motron_plan]':'collector',success_url:config.origin+'/club?checkout=success',cancel_url:config.origin+'/club?checkout=cancelled',expires_at:String(Math.floor(checkout.expires_at/1000))}});
  const url=safeProviderURL(created.url,'checkout.stripe.com');if(!url||!stripeId(created.id,'cs'))throw new Error('BILLING_URL_INVALID');
  await env.DB.prepare('UPDATE collector_checkouts SET session_id = ?, url = ? WHERE user_id = ? AND request_key = ?').bind(created.id,url,session.user.id,checkout.request_key).run();
  return json({url});
 }catch(error){if(error instanceof ApiError)throw error;throw new ApiError('Billing is temporarily unavailable. No membership was activated. Please try again.',503,'BILLING_UNAVAILABLE');}
}
export async function verifyMembershipSignature(raw,header,secret,{now=Date.now()}={}){
 if(typeof header!=='string'||header.length>2048)return false;
 const parts=header.split(','),timestamps=parts.filter(part=>part.startsWith('t=')).map(part=>part.slice(2)),signatures=parts.filter(part=>part.startsWith('v1=')).map(part=>part.slice(3));
 if(timestamps.length!==1||!/^\d{10}$/.test(timestamps[0])||Math.abs(now/1000-Number(timestamps[0]))>300)return false;
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const signature=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(timestamps[0]+'.'+raw)),hex=Array.from(new Uint8Array(signature),byte=>byte.toString(16).padStart(2,'0')).join('');
 return signatures.some(value=>/^[a-f0-9]{64}$/.test(value)&&timingSafeEqual(value,hex));
}
async function rawWebhook(request,ApiError){
 const reader=request.body?.getReader();if(!reader)throw new ApiError('Missing event.',400);const chunks=[];let length=0;
 try{for(;;){const {value,done}=await reader.read();if(done)break;length+=value.byteLength;if(length>131072){await reader.cancel();throw new ApiError('Event is too large.',413);}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{throw new ApiError('Invalid event.',400);}
}
export async function handleMembershipWebhook(request,env,{ApiError,json}){
 if(request.method!=='POST')return json({error:'Method not allowed.'},405,{Allow:'POST'});
 const config=configuration(env,{allowPaused:true});if(!config)return json({error:'Membership payments are not configured.'},503);
 const raw=await rawWebhook(request,ApiError);if(!await verifyMembershipSignature(raw,request.headers.get('Stripe-Signature'),config.webhook))throw new ApiError('Invalid event signature.',400);
 let event;try{event=JSON.parse(raw);}catch{throw new ApiError('Invalid event.',400);}
 if(!stripeId(event?.id,'evt')||!Number.isSafeInteger(event.created)||event.created<0||typeof event.livemode!=='boolean'||event.livemode===config.testMode)throw new ApiError('Invalid event.',400);
 const duplicate=await env.DB.prepare('SELECT id FROM collector_billing_events WHERE id = ?').bind(event.id).first();if(duplicate)return json({received:true});
 if(!['checkout.session.completed','customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'].includes(event.type))return json({received:true,ignored:true});
 try{
  let subscriptionId=idOf(event.data?.object?.id);
  if(event.type==='checkout.session.completed'){
   if(!stripeId(subscriptionId,'cs'))throw new ApiError('Invalid checkout event.',400);
   const checkout=await stripe(env,config,'checkout/sessions/'+subscriptionId);if(checkout.mode!=='subscription')return json({received:true,ignored:true});subscriptionId=idOf(checkout.subscription);
  }
  if(!stripeId(subscriptionId,'sub'))throw new ApiError('Invalid subscription event.',400);
  // Retrieve current provider state: event deliveries can be duplicated or arrive out of order.
  const subscription=await stripe(env,config,'subscriptions/'+subscriptionId),customerId=idOf(subscription.customer),items=subscription.items?.data;
  if(subscription.id!==subscriptionId||!stripeId(customerId,'cus')||typeof subscription.livemode!=='boolean'||subscription.livemode===config.testMode)return json({received:true,ignored:true});
  const owner=await env.DB.prepare('SELECT user_id FROM collector_customers WHERE customer_id = ?').bind(customerId).first();if(!owner)return json({received:true,ignored:true});
  const item=Array.isArray(items)&&items.length===1&&!subscription.items.has_more?items[0]:null;
  let priceId=idOf(item?.price),periodEnd=item?.current_period_end??subscription.current_period_end,status=subscription.status;
  if(![config.monthly,config.annual].includes(priceId)||!Number.isSafeInteger(periodEnd)||periodEnd<=0){
   // A previously eligible subscription can be edited in the provider dashboard.
   // Losing its Collector price must revoke its existing grant immediately.
   const previous=await env.DB.prepare('SELECT subscription_id,price_id,current_period_end FROM collector_entitlements WHERE user_id = ?').bind(owner.user_id).first();
   if(previous?.subscription_id!==subscriptionId)return json({received:true,ignored:true});
   priceId=previous.price_id;periodEnd=Number(previous.current_period_end)/1000;status='canceled';
  }
  const membership=await upsertCollectorEntitlement(env,{userId:owner.user_id,customerId,subscriptionId,priceId,status,currentPeriodEnd:Math.round(periodEnd*1000),cancelAtPeriodEnd:subscription.cancel_at_period_end===true,eventCreated:event.created*1000,eventId:event.id});
  if(membership?.updated)await env.DB.prepare('UPDATE collector_checkouts SET expires_at = ? WHERE user_id = ?').bind(0,owner.user_id).run();
  return json({received:true});
 }catch(error){if(error instanceof ApiError)throw error;return json({error:'Event processing is temporarily unavailable. Retry this event.'},503);}
}
