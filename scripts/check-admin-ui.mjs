import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {resolvePage} from '../public/routes.js';

const {window,document}=parseHTML('<html lang="en"><head></head><body><main id="fixture"></main></body></html>');
Object.assign(globalThis,{window,document,location:new URL('https://apex.test/admin')});
let visibility='visible';Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>visibility});
function visible(value){visibility=value;document.dispatchEvent(new window.Event('visibilitychange'));}
let focused=null;window.HTMLElement.prototype.focus=function(){focused=this;};
Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){return this.querySelector('option[selected]')?.value||this.querySelector('option')?.value||'';},set(value){for(const option of this.querySelectorAll('option'))option.toggleAttribute('selected',option.value===value);}});
const {mountAdmin}=await import('../public/admin.js');
let checks=0;const check=(value,message)=>{assert.ok(value,message);checks++;};
const tick=()=>new Promise(resolve=>setTimeout(resolve,8));
const signedOut={configured:true,user:null,csrfToken:null},signedIn={configured:true,user:{id:'private-owner',name:'Administrator'},csrfToken:'private-csrf'};
const car={id:'car-1',status:'pending',title:'A Sunday E46',model:'BMW M3',year:2003,engine:'S54',transmission:'Manual',description:'An owner story.',evidence:'Private ownership evidence <script>unsafe()</script>',photos:[{id:'photo-1',caption:'Engine view',url:'/api/community/car-photo?id=photo-1'}],author:{displayName:'Original owner'}};
const baseline={stats:{pending:1,approved:1,drivers:2,accounts:4,sharedGarages:1,friendships:1,creditsEarned:55,creditsSpent:50},pending:[car],submissions:[car,{...car,id:'reviewed-1',title:'Weekend touring',status:'approved'}],recentActivity:[{action:'car.submitted',note:'Awaiting evidence review',createdAt:'2026-01-10T10:00:00Z'}]};
function fixture({session=signedOut,handlers={}}={}){
 const host=document.createElement('div');document.querySelector('#fixture').append(host);const calls=[];
 const fetchImpl=async(path,options={})=>{const call={path,options,body:options.body?JSON.parse(options.body):null};calls.push(call);const handler=handlers[`${options.method||'GET'} ${path}`]||handlers[path];const result=handler?(typeof handler==='function'?await handler(call):handler):path==='/api/admin/session'?session:path==='/api/admin/community'?structuredClone(baseline):null;if(result instanceof Response)return result;if(!result)throw new Error('Unexpected request '+path);return new Response(JSON.stringify(result));};
 const instance=mountAdmin(host,{fetchImpl});return {host,calls,instance,close(){instance.destroy();host.remove();}};
}
function submit(form,submitter){const event=new window.Event('submit',{bubbles:true,cancelable:true});if(submitter)Object.defineProperty(event,'submitter',{value:submitter});form.dispatchEvent(event);}
function credentials(f){const form=f.host.querySelector('[data-admin-login]');form.querySelector('[name=email]').value='owner@example.test';form.querySelector('[name=password]').value='a correct secret';return form;}

check(resolvePage('/admin')==='admin.html'&&resolvePage('/admin/')==='admin.html','Private URL uses a standalone HTML shell');
const html=await fs.readFile(new URL('../public/admin.html',import.meta.url),'utf8');
check(html.includes('noindex,nofollow,noarchive'),'Admin shell opts out of indexing and archiving');
check(!/app\.js|platform\.js|account-sync\.js/.test(html),'Private shell does not mount the public application');
const manifest=await fs.readFile(new URL('../public/discovery-manifest.json',import.meta.url),'utf8');
check(!manifest.includes('/admin'),'Private administration is absent from public discovery');
const {createSearchIndex}=await import('../public/smart-search.js');
check(!JSON.stringify(createSearchIndex()).includes('/admin'),'Private administration is absent from public search');
{
 const f=fixture();await f.instance.ready;check(f.host.querySelector('[data-admin-login]'),'Guests receive only the owner login');check(!f.host.querySelector('[data-admin-moderation]'),'Guest page contains no private car data');check(!f.calls.some(call=>call.path==='/api/admin/community'),'Guest login never requests protected dashboard data');check(!f.host.querySelector('a[href^="/account"],a[href^="/signup"]'),'Private sign-in has no public account or signup detour');check(!f.host.querySelector('[name=email]').value&&!f.host.querySelector('[name=password]').value,'Admin credentials are never prefilled');f.close();
}
{
 const f=fixture({session:{...signedOut,configured:false}});await f.instance.ready;check(f.host.querySelector('[type=submit]').disabled,'Unconfigured login is disabled');check(f.host.querySelector('[data-admin-action=session]'),'Missing configuration has a retry control');f.close();
}
{
 const f=fixture({handlers:{'POST /api/admin/login':signedIn}});await f.instance.ready;submit(credentials(f));await tick();check(f.host.querySelector('[data-admin-moderation]'),'Successful dedicated login immediately opens the owner dashboard');check(f.host.querySelectorAll('.admin-metric').length===8,'Dashboard exposes eight real community counters');const call=f.calls.find(call=>call.path==='/api/admin/login');assert.deepEqual(call.body,{email:'owner@example.test',password:'a correct secret'});checks++;check(call.options.credentials==='same-origin'&&call.options.cache==='no-store','Private requests use same-origin cookies and bypass cache');check(!f.calls.some(call=>call.path.startsWith('/api/auth/')),'Dedicated login never uses public account authentication');f.close();
}
{
 const f=fixture({handlers:{'POST /api/admin/login':new Response(JSON.stringify({error:{message:'The email or password is incorrect.'}}),{status:401})}});await f.instance.ready;submit(credentials(f));await tick();check(f.host.querySelector('[data-admin-login]'),'Wrong credentials keep the login gate');check(f.host.querySelector('[data-admin-notice]').textContent==='The email or password is incorrect.','Structured login errors remain readable');check(f.host.querySelector('[name=password]').value==='','Failed login clears the password');check(focused===f.host.querySelector('[name=password]'),'Failed login focuses the password after controls are enabled');check(!f.calls.some(call=>call.path==='/api/admin/community'),'Wrong credentials cannot request protected data');f.close();
}
{
 const f=fixture({session:signedIn});await f.instance.ready;check(f.host.textContent.includes('Private ownership evidence <script>unsafe()</script>'),'Evidence remains readable text');check(!f.host.querySelector('script'),'Owner evidence cannot inject markup');check(f.host.querySelector('.admin-photo a').getAttribute('rel').includes('noopener'),'Full-size photos protect the owner tab');f.host.querySelector('[data-admin-tab=history]').click();check(f.host.querySelector('.admin-history details'),'Previously reviewed cars can be inspected');check(!f.host.querySelector('.admin-history [value=approve]'),'Published cars cannot be approved twice');check(f.host.querySelector('.admin-history [value=reject]'),'Published cars can be removed for corrections');const search=f.host.querySelector('[data-admin-search]');search.value='missing';search.dispatchEvent(new window.Event('input',{bubbles:true}));check(!f.host.querySelector('.admin-history details'),'History search filters reviewed records');f.host.querySelector('[data-admin-tab=activity]').click();check(f.host.textContent.includes('Awaiting evidence review'),'Activity shows server-recorded events');f.close();
}
{
 let decision=null;const f=fixture({session:signedIn,handlers:{'POST /api/admin/moderation':call=>{decision=call;return {submission:{...car,status:'rejected'}};}}});await f.instance.ready;const form=f.host.querySelector('[data-admin-moderation]'),note=form.querySelector('[name=note]');note.value='Short';submit(form,form.querySelector('[value=reject]'));await tick();check(!decision,'Requesting changes requires an actionable reason');check(focused===note,'An incomplete decision focuses its note');note.value='Please upload a clear engine photograph.';submit(form,form.querySelector('[value=reject]'));await tick();assert.deepEqual(decision.body,{id:'car-1',action:'reject',note:'Please upload a clear engine photograph.'});checks++;check(decision.options.headers['X-CSRF-Token']==='private-csrf','Moderation uses the dedicated session CSRF token');check(f.calls.filter(call=>call.path==='/api/admin/session').length===2,'A decision verifies the dedicated session before writing');f.close();
}
{
 const f=fixture({session:signedIn,handlers:{'POST /api/admin/moderation':new Response(JSON.stringify({error:'Database is reconnecting.'}),{status:503})}});await f.instance.ready;const form=f.host.querySelector('[data-admin-moderation]'),note=form.querySelector('[name=note]');note.value='Keep this reviewer note.';submit(form,form.querySelector('[value=reject]'));await tick();check(note.isConnected&&note.value==='Keep this reviewer note.','Failed decisions preserve the reviewer note');check(!note.disabled,'Failed decisions release disabled form controls');f.close();
}
{
 const f=fixture({session:signedIn,handlers:{'POST /api/admin/moderation':{submission:{...car,status:'approved'}},'/api/admin/community':call=>f.calls.filter(item=>item.path==='/api/admin/community').length===1?baseline:new Response(JSON.stringify({error:'Refresh unavailable.'}),{status:503})}});await f.instance.ready;const form=f.host.querySelector('[data-admin-moderation]');submit(form,form.querySelector('[value=approve]'));await tick();check(f.host.querySelector('[data-admin-notice]').textContent.includes('decision was saved'),'Confirmed decisions survive follow-up refresh failures');check(!f.host.querySelector('[data-admin-moderation][data-id="car-1"]'),'A confirmed decision cannot immediately be sent twice');f.close();
}
{
 let expired=false;const f=fixture({handlers:{'/api/admin/session':()=>expired?signedOut:signedIn}});await f.instance.ready;expired=true;const form=f.host.querySelector('[data-admin-moderation]');submit(form,form.querySelector('[value=approve]'));await tick();check(f.host.querySelector('[data-admin-login]'),'An expired session returns to the dedicated login gate');check(!f.host.textContent.includes('Private ownership evidence'),'Expired sessions clear private evidence from the DOM');check(!f.calls.some(call=>call.path==='/api/admin/moderation'),'An expired session never sends moderation');f.close();
}
{
 let sessionReads=0;const f=fixture({handlers:{'/api/admin/session':()=>({...signedIn,csrfToken:++sessionReads>1?'rotated-csrf':'private-csrf'}),'POST /api/admin/logout':signedOut}});await f.instance.ready;f.host.querySelector('[data-admin-action=logout]').click();await tick();check(f.host.querySelector('[data-admin-login]'),'Signing out restores the login gate');check(!f.host.textContent.includes('Private ownership evidence'),'Signing out removes private car evidence');const call=f.calls.find(call=>call.path==='/api/admin/logout');check(call.options.headers['X-CSRF-Token']==='rotated-csrf','Sign-out refreshes CSRF after another tab rotates the administrator session');f.close();
}
{
 let finish;const pending=new Promise(resolve=>finish=resolve);const f=fixture({handlers:{'/api/admin/session':()=>pending}});await tick();f.instance.destroy();finish(signedIn);await f.instance.ready;check(!f.host.querySelector('[data-admin-moderation]'),'Late requests cannot mount private content after destruction');check(!f.calls.some(call=>call.path==='/api/admin/community'),'Destroyed admin pages do not start protected follow-up requests');f.host.remove();
}
{
 let reads=0;const f=fixture({session:signedIn,handlers:{'/api/admin/community':()=>++reads===1?baseline:new Response('Expired',{status:401})}});await f.instance.ready;f.host.querySelector('[data-admin-action=refresh]').click();await tick();check(f.host.querySelector('[data-admin-login]'),'Non-JSON unauthorized responses restore the login gate');check(!f.host.textContent.includes('Private ownership evidence'),'Non-JSON unauthorized responses clear private evidence');f.close();
}
{
 const f=fixture({session:signedIn,handlers:{'/api/admin/community':{}}});await f.instance.ready;check(!f.host.querySelector('.admin-metric'),'An incomplete dashboard is never misrepresented as empty totals');check(f.host.querySelector('[data-admin-notice]').textContent.includes('incomplete'),'Malformed dashboard data explains the recovery action');check(f.host.querySelector('[data-admin-action=refresh]'),'A malformed dashboard retains an authenticated retry control');f.close();
}
{
 const f=fixture({session:{...signedIn,csrfToken:null}});await f.instance.ready;check(f.host.querySelector('[data-admin-login]'),'Malformed sessions fail closed to the login gate');check(!f.calls.some(call=>call.path==='/api/admin/community'),'Malformed sessions never request private evidence');f.close();
}
for(const payload of [{error:{code:'OFFLINE'}},null]){
 const f=fixture({handlers:{'/api/admin/session':new Response(JSON.stringify(payload),{status:503})}});await f.instance.ready;check(!f.host.textContent.includes('[object Object]'),'Private errors never render object coercions');check(f.host.querySelector('[data-admin-login]'),'Session outages leave a usable sign-in gate');f.close();
}
{
 let reviewed=false;const second={...car,id:'car-2',title:'A second BMW'},payload=()=>({...baseline,pending:reviewed?[second]:[car,second],submissions:reviewed?[{...car,status:'approved'},second]:[car,second]});const f=fixture({session:signedIn,handlers:{'/api/admin/community':payload,'POST /api/admin/moderation':()=>{reviewed=true;return {submission:{...car,status:'approved'}};}}});await f.instance.ready;let note=f.host.querySelector('[data-id="car-2"] [name=note]');note.value='Keep this unsent note <strong>as text</strong>.';note.dispatchEvent(new window.Event('input',{bubbles:true}));const first=f.host.querySelector('[data-id="car-1"]');submit(first,first.querySelector('[value=approve]'));await tick();check(f.host.querySelector('[data-id="car-2"] [name=note]').value===note.value,'Reviewing one car preserves other unsent reviewer notes');f.host.querySelector('[data-admin-tab=history]').click();f.host.querySelector('[data-admin-tab=queue]').click();check(f.host.querySelector('[data-id="car-2"] [name=note]').value===note.value,'Changing sections preserves reviewer drafts');f.host.querySelector('[data-admin-action=refresh]').click();await tick();check(f.host.querySelector('[data-id="car-2"] [name=note]').value===note.value,'Refreshing preserves reviewer drafts');check(!f.host.querySelector('textarea strong'),'Preserved notes cannot inject HTML');f.close();
}
{
 const f=fixture({session:signedIn});await f.instance.ready;f.host.querySelector('[data-admin-tab=history]').click();const draft='\nKeep this published-car note <strong>exactly</strong>.';let note=f.host.querySelector('[data-id="reviewed-1"] [name=note]');note.value=draft;note.dispatchEvent(new window.Event('input',{bubbles:true}));const filter=f.host.querySelector('[data-admin-filter]');filter.value='rejected';filter.dispatchEvent(new window.Event('change',{bubbles:true}));check(!f.host.querySelector('[name=note]'),'History filter can temporarily remove the drafted record');filter.value='approved';filter.dispatchEvent(new window.Event('change',{bubbles:true}));check(f.host.querySelector('[data-id="reviewed-1"] [name=note]').value===draft,'Filtering preserves exact published-car reviewer drafts, including leading newlines and HTML characters');const search=f.host.querySelector('[data-admin-search]');search.value='missing';search.dispatchEvent(new window.Event('input',{bubbles:true}));search.value='Weekend';search.dispatchEvent(new window.Event('input',{bubbles:true}));check(f.host.querySelector('[data-id="reviewed-1"] [name=note]').value===draft,'Searching away from and back to a reviewed car preserves its draft');check(!f.host.querySelector('textarea strong'),'Restoring filtered drafts never creates markup');f.close();
}
{
 let reads=0,finish;const resumeSession=new Promise(resolve=>finish=resolve);const f=fixture({handlers:{'/api/admin/session':()=>++reads===1?signedIn:resumeSession}});await f.instance.ready;const note=f.host.querySelector('[name=note]');note.value='Preserve this private reviewer draft.';note.dispatchEvent(new window.Event('input',{bubbles:true}));visible('hidden');check(!f.host.textContent.includes('Private ownership evidence'),'Hiding the page immediately removes private evidence');visible('visible');await tick();check(!f.host.querySelector('[data-admin-moderation]'),'Returning to a page waits for fresh session verification');finish(signedIn);await tick();check(f.host.querySelector('[name=note]').value===note.value,'Verified return restores the same owner’s reviewer draft');check(!f.calls.some(call=>call.path==='/api/admin/moderation'),'Restoring a page never automatically submits a review');f.close();
}
{
 let signedInElsewhere=true;const f=fixture({handlers:{'/api/admin/session':()=>signedInElsewhere?signedIn:signedOut}});await f.instance.ready;window.dispatchEvent(new window.Event('pagehide'));check(!f.host.textContent.includes('Private ownership evidence'),'Pagehide redacts private data before browser caching');signedInElsewhere=false;window.dispatchEvent(new window.Event('pageshow'));await tick();check(f.host.querySelector('[data-admin-login]'),'Restoring a page respects sign-out in another tab');check(!f.host.querySelector('[name=note]'),'Restored signed-out pages contain no reviewer notes');f.close();
}
{
 let finish,loginFinished=false;const pendingLogin=new Promise(resolve=>finish=resolve);const f=fixture({handlers:{'/api/admin/session':()=>loginFinished?signedIn:signedOut,'POST /api/admin/login':()=>pendingLogin}});await f.instance.ready;submit(credentials(f));await tick();visible('hidden');finish(signedIn);loginFinished=true;await tick();check(!f.host.querySelector('[data-admin-moderation]'),'An in-flight login cannot reveal evidence while the page is hidden');visible('visible');await tick();check(f.host.querySelector('[data-admin-moderation]'),'A completed hidden login resumes only after fresh session verification');check(f.calls.filter(call=>call.path==='/api/admin/login').length===1,'Lifecycle restoration never replays login');f.close();
}
console.log(`Private admin UI: ${checks} authentication, session isolation, discovery, moderation, privacy, recovery, search and cleanup checks passed.`);
