import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseHTML} from 'linkedom';
import {mountClubMembership} from '../public/club-membership.js';
import {setLanguage,hasTranslation} from '../public/preferences.js';
import {clubMembershipTranslationEntries} from '../public/club-membership-translations.js';
let checks=0;const check=(v,m)=>{assert.ok(v,m);checks++;};
const base=(extra={})=>({configured:false,membership:{plan:'free',active:false,status:'free',expiresAt:null,hasCustomer:false},plans:{monthly:{amount:400,currency:'usd'},annual:{amount:3600,currency:'usd'}},...extra});
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function fixture({payload=base(),userId='driver-a',readFailure=false,fallback=false}={}){
 const {document,window}=parseHTML('<html><head></head><body><main></main></body></html>');let active=document.body,snapshot={user:userId===null?null:{id:userId},status:'synced',ready:true},current=payload,fail=readFailure,checkoutFailure=false,portalFailure=false,checkoutURL='https://checkout.stripe.com/c/pay/test_session',portalURL='https://billing.stripe.com/p/session/test',deferred=null;
 const listeners=new Set(),calls={read:0,checkout:[],portal:0,fetch:[],redirect:[]};
 Object.defineProperty(document,'activeElement',{get:()=>active});window.HTMLElement.prototype.focus=function(){active=this;};
 Object.assign(globalThis,{document,window,CustomEvent:window.CustomEvent,MutationObserver:window.MutationObserver,localStorage:{getItem:()=>null,setItem(){}}});setLanguage('en');
 const controller={getSnapshot:()=>snapshot,subscribe(fn){listeners.add(fn);fn(snapshot);return()=>listeners.delete(fn);},async getMembership(){calls.read++;if(fail)throw Error('Failed');return structuredClone(current);},async startMembershipCheckout(interval){calls.checkout.push(interval);if(checkoutFailure)throw Error('Failed');return deferred?deferred:{url:checkoutURL};},async openMembershipPortal(){calls.portal++;if(portalFailure)throw Error('Failed');return {url:portalURL};}};
 if(fallback)delete controller.getMembership;
 const host=document.querySelector('main'),view=mountClubMembership(host,{accountController:controller,navigate:url=>calls.redirect.push(url),fetchImpl:async(url,options)=>{calls.fetch.push({url,options});if(fail)throw Error('Failed');return Response.json(current);}});await view.ready;
 return {host,view,document,window,controller,calls,listeners,get active(){return active;},setPayload(v){current=v;},failRead(v){fail=v;},failCheckout(v){checkoutFailure=v;},failPortal(v){portalFailure=v;},setCheckoutURL(v){checkoutURL=v;},setPortalURL(v){portalURL=v;},deferCheckout(v){deferred=v;},setUser(id,{notify=true,ready=true}={}){snapshot={user:id===null?null:{id},status:ready?'synced':'loading',ready};if(notify)for(const fn of listeners)fn(snapshot);},async click(selector){const b=host.querySelector(selector);check(Boolean(b),'Control exists: '+selector);b.click();await tick();}};
}
{
 const f=await fixture();
 check(f.host.querySelectorAll('.cm-plan').length===2,'Free and paid membership plans mount.');
 check(f.host.textContent.includes('Membership payments are not open yet'),'Unconfigured payments are explicitly unavailable.');
 check(f.host.querySelector('[data-club-price]').textContent.includes('Planned price')&&f.host.querySelector('[data-club-amount]').textContent==='$4','The planned monthly price is labeled.');
 check(!f.host.querySelector('[data-club-checkout]')&&!f.host.querySelector('[data-club-portal]'),'Unavailable payments cannot be opened.');
 check(f.host.querySelector('[data-club-action] a').getAttribute('href')==='/my-garage?view=planner','The primary unavailable-payment action opens the real free planner.');
 await f.click('[data-club-interval=annual]');
 check(f.host.querySelector('[data-club-amount]').textContent==='$36'&&f.host.querySelector('.cm-savings').textContent.includes('25%'),'Planned annual pricing and calculated savings are accurate.');
 check(f.calls.checkout.length===0&&f.calls.portal===0,'Exploring prices creates no checkout or payment.');
 check(f.host.querySelector('[data-club-project-limit]').textContent==='1'&&f.host.querySelector('[data-club-history-limit]').textContent==='3','Free account limits are explicit.');
 check(f.host.querySelector('.cm-plan-free').textContent.includes('notes')&&f.host.querySelector('.cm-plan-free').textContent.includes('JSON'),'Notes, cost planning and useful exports are included in Free.');
 check(f.host.querySelector('.cm-plan-club').textContent.includes('20 cloud')&&f.host.querySelector('.cm-plan-club').textContent.includes('50 budget'),'Paid capacity reflects actual server limits.');
 const faq=f.host.querySelector('[data-club-faq=history]');faq.setAttribute('open','');await f.view.refresh();
 check(f.host.querySelector('[data-club-faq=history]')===faq&&faq.hasAttribute('open'),'Membership refresh preserves FAQ state.');f.view.destroy();check(f.listeners.size===0,'Destroy unsubscribes from the account.');
}
{
 const f=await fixture({payload:base({configured:true,plans:{monthly:{amount:650,currency:'usd'},annual:{amount:6000,currency:'usd'}}})});
 check(f.host.querySelector('[data-club-amount]').textContent==='$6.50'&&!f.host.querySelector('[data-club-price]').textContent.includes('Planned'),'Configured prices come from the provider response.');
 await f.click('[data-club-interval=annual]');check(f.host.querySelector('[data-club-amount]').textContent==='$60','Actual yearly pricing replaces proposed pricing.');
 await f.click('[data-club-checkout]');check(f.calls.checkout.length===1&&f.calls.checkout[0]==='annual','Checkout receives the selected interval.');
 check(f.calls.redirect[0]==='https://checkout.stripe.com/c/pay/test_session','Successful checkout navigates to the returned secure provider URL.');
 check(f.host.querySelector('[data-club-status]').textContent==='Free planner','Opening checkout does not locally grant paid membership.');
 f.failCheckout(true);await f.click('[data-club-checkout]');check(f.host.querySelector('[data-club-notice]').getAttribute('role')==='alert','Failed checkout is accessible and retryable.');
 check(!f.host.querySelector('[data-club-checkout]').disabled,'Failed checkout unlocks its retry action.');
 f.failCheckout(false);f.setCheckoutURL('javascript:alert(1)');const redirects=f.calls.redirect.length;await f.click('[data-club-checkout]');check(f.calls.redirect.length===redirects,'Malformed or non-provider redirects are rejected.');
 let resolve;f.deferCheckout(new Promise(r=>resolve=r));const b=f.host.querySelector('[data-club-checkout]');b.click();b.click();await tick();check(f.host.querySelector('[data-club-checkout]').disabled,'A pending checkout prevents duplicate clicks.');
 const before=f.calls.redirect.length;f.setUser('driver-b');resolve({url:'https://checkout.stripe.com/c/pay/previous_account'});await tick();await f.view.refresh();
 check(f.calls.redirect.length===before,'An old account’s checkout response cannot navigate the new session.');f.view.destroy();
}
{
 const f=await fixture({payload:base({configured:true,testMode:true})});check(f.host.textContent.includes('Test payments only'),'Test billing is clearly labeled.');check(f.host.querySelector('[data-club-checkout]').textContent.includes('Test checkout'),'The test action cannot be mistaken for a real purchase.');f.view.destroy();
}
{
 const f=await fixture({payload:base({configured:true}),userId:null});check(!f.host.querySelector('[data-club-checkout]')&&f.host.querySelector('[data-club-action] a').getAttribute('href').includes('/account?'),'Guests must sign in before starting paid checkout.');f.view.destroy();
}
{
 const payload=base({configured:true,membership:{plan:'collector',active:true,status:'active',expiresAt:'2099-01-02T10:00:00Z',hasCustomer:true,cancelAtPeriodEnd:true}}),f=await fixture({payload});
 check(f.host.querySelector('[data-club-status]').textContent==='Collector Plus active'&&f.host.querySelector('[data-club-project-limit]').textContent==='20'&&f.host.querySelector('[data-club-history-limit]').textContent==='50','The server’s active membership unlocks displayed paid limits.');
 check(!f.host.querySelector('[data-club-checkout]')&&f.host.querySelector('[data-club-expiry]').textContent.includes('Renewal is canceled'),'Active membership shows its confirmed cancellation state.');
 await f.click('[data-club-portal]');check(f.calls.portal===1&&f.calls.redirect[0].startsWith('https://billing.stripe.com/'),'Billing management opens the account provider portal.');f.failPortal(true);await f.click('[data-club-portal]');check(f.host.querySelector('[data-club-notice]').textContent.includes('Try again'),'Portal failures are useful and retryable.');
 f.setPayload(base({configured:true}));f.setUser('other');await f.view.refresh();check(f.host.querySelector('[data-club-status]').textContent==='Free planner','Account switching cannot retain another account’s paid plan.');f.view.destroy();
}
{
 const f=await fixture({payload:base({configured:true,plans:{monthly:{amount:400,currency:'usd'},annual:{amount:'3600',currency:'usd'}}})});
 check(!f.host.querySelector('[data-club-checkout]')&&f.host.textContent.includes('Current membership pricing is unavailable.'),'Malformed live pricing fails closed.');check(!f.host.querySelector('[data-club-amount]'),'Planned pricing never substitutes for unverified live prices.');f.view.destroy();
}
{
 const f=await fixture({readFailure:true,fallback:true});check(f.host.textContent.includes('Membership details are unavailable.')&&f.host.querySelector('[data-club-action] a').getAttribute('href').includes('planner'),'Network failure leaves the free planner available.');
 f.failRead(false);await f.click('[data-club-retry]');await f.view.refresh();check(f.host.textContent.includes('Membership payments are not open yet'),'Retry recovers from an unavailable membership service.');check(f.calls.fetch.every(c=>c.url==='/api/membership'&&!c.options.method),'The fallback performs read-only authenticated membership requests.');f.view.destroy();
}
{
 const f=await fixture({payload:base({configured:true})});f.setUser('driver-b',{notify:false});await f.click('[data-club-checkout]');check(f.calls.checkout.length===0&&f.host.querySelector('[data-club-notice]').textContent.includes('account changed'),'A stale account button cannot begin checkout.');f.view.destroy();
}
{
 const f=await fixture(),faq=f.host.querySelector('[data-club-faq=free]');faq.setAttribute('open','');faq.querySelector('summary').focus();
 for(const language of ['ka','ru']){setLanguage(language);check(!/Budget every part|Current plan|Planned price|payments are not open|Try the build/.test(f.host.textContent),'Core membership UI switches to '+language+'.');check(f.host.querySelector('[data-club-faq=free]').hasAttribute('open')&&f.active===f.host.querySelector('[data-club-faq=free] summary'),'Locale changes preserve FAQ and focus.');for(const [key]of clubMembershipTranslationEntries)check(hasTranslation(key,language),'Complete '+language+' copy: '+key);}
 setLanguage('en');f.view.destroy();f.window.dispatchEvent(new f.window.Event('pageshow'));f.document.dispatchEvent(new f.window.Event('visibilitychange'));check(f.host.children.length===0,'Destroyed pages ignore resume and locale events.');
}
{
 let resolve;const f=await fixture({payload:base({configured:true})});f.deferCheckout(new Promise(r=>resolve=r));f.host.querySelector('[data-club-checkout]').click();f.view.destroy();resolve({url:'https://checkout.stripe.com/c/pay/closed'});await tick();check(f.calls.redirect.length===0,'Destroyed pages cannot redirect when pending checkout completes.');
}
const source=fs.readFileSync(new URL('../public/club-membership.js',import.meta.url),'utf8'),css=fs.readFileSync(new URL('../public/club-membership.css',import.meta.url),'utf8');
check(!/buyGarageClub|getGarageGame|localStorage/.test(source),'Paid membership has no local currency purchase or entitlement flags.');
check(/position:\s*static/.test(css)&&/overflow:\s*clip/.test(css),'The scoped hero reset and decorative clipping remain in place.');
check(/prefers-reduced-motion/.test(css),'Reduced motion remains supported.');
console.log(`Collector Plus: ${checks} checks passed (planned/live pricing, billing gates, provider redirects, account races, failed requests, free tools, translations, focus and cleanup).`);
