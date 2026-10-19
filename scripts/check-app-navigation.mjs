import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {parseHTML} from 'linkedom';

// Execute the actual app entry point, including collection/gallery bootstrapping.
// This exercises browser contracts in a DOM simulation; it does not measure CSS.
const {document,window}=parseHTML(await fs.readFile(new URL('../public/index.html',import.meta.url),'utf8'));
const location=new URL('http://localhost:4173/models'),values=new Map();
const copied=[];
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{async writeText(value){copied.push(value);}}}});
const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
Object.assign(globalThis,{window,document,location,localStorage:storage,HTMLImageElement:window.HTMLImageElement,HTMLElement:window.HTMLElement,MutationObserver:window.MutationObserver,CustomEvent:window.CustomEvent,innerWidth:1280,innerHeight:900});
Object.defineProperty(document,'baseURI',{get:()=>location.origin+'/'});
const media=query=>({matches:false,media:query,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}});
globalThis.matchMedia=window.matchMedia=media;
globalThis.requestAnimationFrame=window.requestAnimationFrame=fn=>setTimeout(()=>fn(0),0);
globalThis.cancelAnimationFrame=window.cancelAnimationFrame=clearTimeout;
window.scrollTo=()=>{};window.scrollY=0;
window.HTMLElement.prototype.scrollIntoView=function(){};
window.HTMLElement.prototype.getBoundingClientRect=function(){return {left:0,top:0,width:1280,height:80,right:1280,bottom:80};};
window.HTMLElement.prototype.showModal=function(){this.open=true;this.setAttribute('open','');};
window.HTMLElement.prototype.close=function(){this.open=false;this.removeAttribute('open');this.dispatchEvent(new window.Event('close'));};
Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){return this.querySelector('option[selected]')?.value??this.querySelector('option')?.value??'';},set(value){for(const option of this.querySelectorAll('option')){if(option.value===String(value))option.setAttribute('selected','');else option.removeAttribute('selected');}}});
Object.defineProperty(window.HTMLSelectElement.prototype,'selectedOptions',{configurable:true,get(){return [...this.querySelectorAll('option')].filter(option=>option.value===this.value);}});
globalThis.history=window.history={state:null,replaceState(state,_title,url){this.state=state;location.href=new URL(url,location).href;},pushState(state,_title,url){this.state=state;location.href=new URL(url,location).href;}};
globalThis.Image=class {
  constructor(){return document.createElement('img');}
};
globalThis.fetch=async()=>new Response(JSON.stringify({user:null,provider:'password'}),{status:200,headers:{'content-type':'application/json'}});
const errors=[],originalError=console.error;
console.error=(...args)=>errors.push(args.map(String).join(' '));
process.on('unhandledRejection',error=>errors.push(String(error)));
const {account}=await import('../public/account-sync.js');

try{
  await import('../public/app.js');
  assert.equal(document.querySelector('#collection').hidden,false);
  assert.equal(document.querySelector('#explorer').hidden,true);
  assert.ok(document.querySelectorAll('#models [data-model]').length>0,'Collection renders actual catalog models');
  document.querySelector('#models [data-compare]').click();
  assert.equal(document.querySelector('#compare-tray').hidden,false);
  const model=document.querySelector('#modelselect');
  model.value='f10-m5';model.dispatchEvent(new window.Event('change'));
  assert.equal(location.pathname,'/cars/f10-m5');
  assert.equal(document.querySelector('#compare-tray').hidden,true,'Collection comparison tray must not obscure a car detail');
  assert.equal(document.querySelector('#collection').hidden,true);
  assert.equal(document.querySelector('#explorer').hidden,false);
  document.querySelector('#engineview').click();
  assert.equal(location.search,'?view=engine','Selecting the engine retains a shareable engine URL');
  const part=document.querySelector('[data-part="1"]');assert.ok(part);part.click();
  const title=document.querySelector('#parttitle').textContent;
  assert.equal(new URLSearchParams(location.search).get('part'),'1');
  assert.equal(part.getAttribute('aria-pressed'),'true');
  const deepLink=location.href;
  await document.querySelector('#detail-share').onclick();
  assert.equal(copied.at(-1),deepLink,'Sharing a car retains the current engine and component');
  location.href='http://localhost:4173/models';window.dispatchEvent(new window.Event('popstate'));
  assert.equal(document.querySelector('#collection').hidden,false);
  assert.equal(document.documentElement.dataset.route,'models');
  location.href=deepLink;window.dispatchEvent(new window.Event('popstate'));
  assert.equal(document.querySelector('#enginedetails').hidden,false);
  assert.equal(document.querySelector('#parttitle').textContent,title,'Forward navigation restores the selected component');
  assert.equal(document.querySelector('[data-part="1"]').getAttribute('aria-pressed'),'true');
  document.querySelector('#carview').click();
  assert.equal(location.search,'','Exterior view removes stale engine/component parameters');
  const {resolvePage}=await import('../public/routes.js');
  for(const link of document.querySelectorAll('.header-user-menu a[href]'))assert.ok(resolvePage(new URL(link.getAttribute('href'),location.href).pathname),'Account-menu links must resolve to real pages: '+link.getAttribute('href'));
  await new Promise(resolve=>setTimeout(resolve,80));
  assert.deepEqual(errors,[],'Actual app entry point and navigation should not throw');
  console.log('PASS App navigation: collection, gallery view URLs, component selection, Back/Forward restoration (DOM simulation).');
}finally{
  account.destroy();console.error=originalError;
  window.dispatchEvent(new window.Event('pagehide'));
}
