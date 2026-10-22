import assert from 'node:assert/strict';
import {createLocalDatabase} from '../server/local-db.mjs';
import {handleApi} from '../server/api.js';
import {randomToken,tokenHash} from '../server/passwords.js';
import {verifyMembershipSignature,membershipEnvironment} from '../server/membership-api.js';

const DB=await createLocalDatabase(':memory:'),origin='https://garage.example.test',now=Date.now(),token=randomToken(),csrf=randomToken();let checks=0;
const check=(value,message)=>{assert.ok(value,message);checks++;};
const env={DB,AUTH_PROVIDER:'password',PUBLIC_ORIGIN:origin,CLIENT_IP:'membership-test'};
await DB.prepare("INSERT INTO users (id,provider,email,name,password_hash,created_at,updated_at) VALUES (?,'password',?,?,NULL,?,?)").bind('member-1','member@example.test','Member',now,now).run();
await DB.prepare('INSERT INTO sessions (token_hash,user_id,csrf_token,created_at,expires_at) VALUES (?,?,?,?,?)').bind(await tokenHash(token),'member-1',csrf,now,now+3600000).run();
const auth={Cookie:'__Host-bmw_session='+token,'X-CSRF-Token':csrf};
async function call(path,{method='GET',body,headers={},signed=true,environment=env}={}){
 const response=await handleApi(new Request(origin+path,{method,headers:{...(method==='GET'?{}:{Origin:origin,'Content-Type':'application/json'}),...(signed?auth:{}),...headers},...(body===undefined?{}:{body:JSON.stringify(body)})}),environment);
 return {status:response.status,data:await response.json(),headers:response.headers};
}
let subscription={id:'sub_collector',customer:'cus_member',livemode:false,status:'active',cancel_at_period_end:false,items:{data:[{price:{id:'price_monthly'},current_period_end:Math.floor(now/1000)+2592000}],has_more:false}},subscriptions=[],providerCalls=[];
async function provider(url,options={}){
 const parsed=new URL(url),path=parsed.pathname,fields=new URLSearchParams(options.body||'');providerCalls.push({path,method:options.method||'GET',fields,key:options.headers?.['Idempotency-Key']});
 if(path.startsWith('/v1/prices/')){const annual=path.endsWith('price_annual');return Response.json({id:annual?'price_annual':'price_monthly',active:true,currency:'usd',unit_amount:annual?3600:400,type:'recurring',livemode:false,recurring:{interval:annual?'year':'month',interval_count:1}});}
 if(path==='/v1/customers')return Response.json({id:'cus_member'});
 if(path==='/v1/subscriptions')return Response.json({data:subscriptions,has_more:false});
 if(path==='/v1/checkout/sessions')return Response.json({id:'cs_test_open',url:'https://checkout.stripe.com/c/pay/cs_test_open'});
 if(path==='/v1/billing_portal/sessions')return Response.json({url:'https://billing.stripe.com/p/session/test'});
 if(path==='/v1/checkout/sessions/cs_test_open')return Response.json({id:'cs_test_open',mode:'subscription',subscription:'sub_collector'});
 if(path==='/v1/subscriptions/sub_collector')return Response.json(subscription);
 return Response.json({error:{message:'Provider fixture missing'}},{status:400});
}
Object.assign(env,{COLLECTOR_PAYMENTS_ENABLED:'false',STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:'whsec_fixture',STRIPE_COLLECTOR_MONTHLY_PRICE:'price_monthly',STRIPE_COLLECTOR_ANNUAL_PRICE:'price_annual',MEMBERSHIP_FETCH:provider});
async function signedEvent(event,{header,body,environment=env,timestamp=Math.floor(Date.now()/1000)}={}){
 const raw=body??JSON.stringify(event),key=await crypto.subtle.importKey('raw',new TextEncoder().encode('whsec_fixture'),{name:'HMAC',hash:'SHA-256'},false,['sign']),bytes=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(timestamp+'.'+raw)),hex=Buffer.from(bytes).toString('hex');
 const response=await handleApi(new Request(origin+'/api/membership/webhook',{method:'POST',headers:{'Stripe-Signature':header??`t=${timestamp},v1=${hex}`},body:raw}),environment);return {status:response.status,data:await response.json()};
}
try{
 let result=await call('/api/membership',{signed:false});check(result.status===200&&!result.data.configured&&result.data.membership.plan==='free','Guest membership is free and disabled by default');check(result.headers.get('cache-control')==='no-store','Membership is never publicly cached');
 check((await call('/api/membership/checkout',{method:'POST',body:{interval:'monthly'},signed:false})).status===401,'Checkout requires an authenticated account');
 check((await call('/api/membership/checkout',{method:'POST',body:{interval:'monthly'},headers:{'X-CSRF-Token':''}})).status===403,'Checkout requires the current CSRF token');
 check((await call('/api/membership/checkout',{method:'POST',body:{interval:'monthly'}})).status===503,'Disabled payments cannot create checkout');
 check(providerCalls.length===0,'Disabled checkout makes no provider calls');
 env.COLLECTOR_PAYMENTS_ENABLED='true';result=await call('/api/membership');
 check(result.data.configured&&result.data.testMode&&result.data.plans.monthly.amount===400,'Configured pricing is retrieved from the provider with test mode visible');
 check(!JSON.stringify(result.data).includes('fixture'),'Public response contains no billing credentials');
 check((await call('/api/membership',{method:'POST',body:{}})).status===405,'Membership summary is read only');
 check((await call('/api/membership/checkout',{method:'POST',body:{interval:'lifetime'}})).status===400,'Unknown billing interval rejected');
 check((await call('/api/membership/checkout',{method:'POST',body:{interval:'monthly',userId:'other'}})).status===400,'Checkout does not accept a client-selected owner');
 check((await call('/api/membership/checkout',{method:'POST',body:{interval:'monthly'},headers:{Origin:'https://evil.example'}})).status===403,'Cross-origin checkout rejected');
 const [first,second]=await Promise.all([call('/api/membership/checkout',{method:'POST',body:{interval:'monthly'}}),call('/api/membership/checkout',{method:'POST',body:{interval:'monthly'}})]);
 check(first.status===200&&second.status===200&&first.data.url===second.data.url,'Concurrent checkout requests reuse one provider session');
 const checkoutCalls=providerCalls.filter(call=>call.path==='/v1/checkout/sessions');check(new Set(checkoutCalls.map(call=>call.key)).size===1,'Concurrent requests share a durable provider idempotency key');
 check(checkoutCalls.every(call=>call.fields.get('customer')==='cus_member'&&call.fields.get('line_items[0][price]')==='price_monthly'&&call.fields.get('success_url')===origin+'/club?checkout=success'),'Checkout uses server-owned customer, price and return URL');
 check((await DB.prepare('SELECT customer_id FROM collector_customers WHERE user_id = ?').bind('member-1').first()).customer_id==='cus_member','Billing customer is bound to the authenticated user');
 check((await call('/api/membership/checkout',{method:'POST',body:{interval:'annual'}})).status===409,'A different interval cannot create a competing pending checkout');
 check((await call('/api/membership/portal',{method:'POST',body:{}})).data.url.startsWith('https://billing.stripe.com/'),'Billing portal uses the account-owned customer');
 subscriptions=[{status:'past_due'}];check((await call('/api/membership/checkout',{method:'POST',body:{interval:'monthly'}})).status===409,'Existing unpaid subscription directs the customer to manage billing');subscriptions=[];
 const event={id:'evt_active',type:'customer.subscription.updated',created:Math.floor(now/1000),livemode:false,data:{object:{id:'sub_collector'}}};
 check((await signedEvent(event,{header:'t=0,v1=bad'})).status===400,'Unsigned or forged events rejected');
 check((await signedEvent(event,{timestamp:Math.floor(Date.now()/1000)-301})).status===400,'Old webhook signatures rejected');
 check((await signedEvent(event,{body:'x'.repeat(131073)})).status===413,'Webhook body is bounded before parsing');
 check((await signedEvent({...event,livemode:true})).status===400,'Live and test events cannot cross environments');
 check((await signedEvent(event)).status===200,'Authentic webhook succeeds without browser origin or session');
 result=await call('/api/membership');check(result.data.membership.active&&result.data.membership.projectLimit===20&&result.data.membership.snapshotLimit===50,'Verified payment grants server-owned Collector access');
 const before=providerCalls.length;check((await signedEvent(event)).status===200&&providerCalls.length===before,'Duplicate events are durably acknowledged without provider work');
 const stored=await DB.prepare('SELECT * FROM collector_entitlements WHERE user_id = ?').bind('member-1').first();check(stored.subscription_id==='sub_collector'&&stored.customer_id==='cus_member','Entitlement records verified subscription ownership');
 subscription={...subscription,cancel_at_period_end:true};check((await signedEvent({...event,id:'evt_cancelpending',created:event.created+1})).status===200,'Scheduled cancellation processed');
 result=await call('/api/membership');check(result.data.membership.active&&result.data.membership.cancelAtPeriodEnd,'Scheduled cancellation retains access through the paid period');
 subscription={...subscription,status:'canceled'};check((await signedEvent({...event,id:'evt_canceled',created:event.created+2})).status===200,'Cancellation processed');result=await call('/api/membership');check(!result.data.membership.active&&result.data.membership.projectLimit===1,'Canceled subscriptions return to free limits');
 subscription={...subscription,status:'active',customer:'cus_member'};await signedEvent({...event,id:'evt_reactivated',created:event.created+3});
 subscription={...subscription,customer:'cus_unknown'};check((await signedEvent({...event,id:'evt_unknownowner',created:event.created+4})).data.ignored===true,'Unknown customer cannot grant access');
 subscription={...subscription,customer:'cus_member',items:{data:[{price:{id:'price_unrelated'},current_period_end:Math.floor(now/1000)+200000}],has_more:false}};check((await signedEvent({...event,id:'evt_wrongprice',created:event.created+5})).status===200,'An unrelated product change is processed');check(!(await call('/api/membership')).data.membership.active,'Removing the Collector price revokes the old subscription grant');
 subscription={...subscription,status:'active',items:{data:[{price:{id:'price_monthly'},current_period_end:Math.floor(now/1000)+200000}],has_more:false}};await signedEvent({...event,id:'evt_back',created:event.created+6});env.COLLECTOR_PAYMENTS_ENABLED='false';
 check((await call('/api/membership/portal',{method:'POST',body:{}})).status===200,'Members can manage billing while new checkout is paused');
 subscription={...subscription,status:'canceled'};check((await signedEvent({...event,id:'evt_pausedcancel',created:event.created+7})).status===200&&!(await call('/api/membership')).data.membership.active,'Cancellation webhooks remain active while checkout is paused');env.COLLECTOR_PAYMENTS_ENABLED='true';
 check((await signedEvent({...event,id:'evt_ignored',type:'payment_intent.succeeded'})).data.ignored===true,'Unrelated event types are safely acknowledged');
 const badPrice={...env,MEMBERSHIP_FETCH:async()=>Response.json({id:'price_monthly',active:true,currency:'eur',unit_amount:400})};check(!(await call('/api/membership',{environment:badPrice})).data.configured,'Invalid live price data closes payments');
 await DB.prepare('DELETE FROM auth_limits').run();check((await call('/api/membership/checkout',{method:'POST',body:{interval:'monthly'},environment:badPrice})).status===503,'Invalid price data cannot enter checkout');
 check(!(await call('/api/membership',{environment:{...env,PUBLIC_ORIGIN:'http://insecure.example'}})).data.configured,'Live configuration requires an explicit HTTPS public origin');
 check(membershipEnvironment({STRIPE_SECRET_KEY:' "sk_test_hidden" ',PRIVATE_OTHER:'hidden'}).STRIPE_SECRET_KEY==='sk_test_hidden','Server env normalization preserves credential values without exposing unrelated secrets');
 check(!await verifyMembershipSignature('{}','t=1234567890,t=1234567890,v1='+'a'.repeat(64),'whsec_fixture'),'Ambiguous signature timestamps rejected');
 console.log(`Membership API: ${checks} checks passed (authenticated checkout, provider pricing, duplicate prevention, signed webhooks, cancellation and ownership).`);
}finally{DB.close();}
