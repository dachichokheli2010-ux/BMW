import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parseHTML} from 'linkedom';

const cases=['/','/models','/cars/f10-m5','/engines','/engines/s65','/start','/play','/play?mode=practice','/my-garage','/parts/turbocharger','/glossary/torque','/badges/answers-1','/questions/car-f10-code'];
const route=process.argv[process.argv.indexOf('--route')+1];
if(!process.argv.includes('--route')){
  for(const path of cases){
    const result=spawnSync(process.execPath,[fileURLToPath(import.meta.url),'--route',path],{encoding:'utf8',timeout:20000});
    assert.equal(result.status,0,`${path} platform mount failed:\n${result.stdout||''}${result.stderr||''}`);
    console.log('PASS Platform integration: '+path);
  }
  console.log(`Platform upgrade checks passed for ${cases.length} complete HTML shells and actual lazy imports.`);
}else{
  const {resolvePage}=await import('../public/routes.js');
  const routeURL=new URL(route,'http://localhost:4173');
  const shell=resolvePage(routeURL.pathname);assert.ok(shell,'Every public route resolves to an HTML shell');
  const {document,window}=parseHTML(await fs.readFile(new URL('../public/'+shell,import.meta.url),'utf8'));
  const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
  Object.assign(globalThis,{window,document,location:routeURL,localStorage:storage,HTMLImageElement:window.HTMLImageElement,HTMLElement:window.HTMLElement,MutationObserver:window.MutationObserver,CustomEvent:window.CustomEvent});
  Object.defineProperty(document,'baseURI',{get:()=>routeURL.href});
  const media=()=>({matches:false,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}});
  globalThis.matchMedia=window.matchMedia=media;globalThis.requestAnimationFrame=window.requestAnimationFrame=fn=>setTimeout(fn,0);
  window.scrollTo=()=>{};window.HTMLElement.prototype.scrollIntoView=()=>{};
  // linkedom deliberately omits the native select setter and dialog methods.
  // Supply their browser contracts so actual product modules run unchanged.
  Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){return this.querySelector('option[selected]')?.value??this.querySelector('option')?.value??'';},set(value){for(const option of this.querySelectorAll('option'))option.selected=option.value===String(value);}});
  window.HTMLElement.prototype.showModal=function(){this.open=true;};window.HTMLElement.prototype.close=function(){this.open=false;this.dispatchEvent(new window.Event('close'));};
  globalThis.fetch=async()=>new Response(JSON.stringify({user:null,provider:'password'}),{status:200,headers:{'content-type':'application/json'}});
  const errors=[],originalError=console.error;console.error=(...args)=>errors.push(args.map(value=>value instanceof Error?value.stack:String(value)).join(' '));
  process.on('unhandledRejection',error=>errors.push(String(error)));
  const {allModels}=await import('../public/catalog.js'),{account}=await import('../public/account-sync.js'),{mountPlatform}=await import('../public/platform.js');
  await account.start();
  const current=routeURL.pathname.startsWith('/cars/')?allModels.find(model=>model.id===routeURL.pathname.split('/')[2]):null;
  const platform=mountPlatform({catalog:allModels,getCurrent:()=>current,selectModel(){},showCollection(){},openPart(){},compareModels(){},mountComparison(){return {destroy(){}};},dialog(){},toast(){}});
  const deadline=Date.now()+5000;
  while(document.querySelector('.workspace-loading')&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,20));
  await new Promise(resolve=>setTimeout(resolve,60));
  assert.equal(document.querySelector('.destination-error'),null,'A lazy destination must mount without its error state');
  assert.equal(document.querySelector('.workspace-loading'),null,'The requested destination must finish loading');
  assert.deepEqual(errors,[],'Platform and all imported modules should have no console or unhandled errors');
  assert.equal(document.querySelectorAll('.site-header nav a').length,6);
  assert.ok(document.querySelector('.header-xp')&&document.querySelector('.header-units')&&document.querySelector('.detail-mode-toggle'));
  assert.ok(document.querySelector('link[rel="canonical"]'));
  assert.equal(document.querySelector('.footer-brand small').textContent,'Unofficial fan site. Not affiliated with BMW AG. BMW names and trademarks belong to BMW AG.');
  if(routeURL.pathname==='/')assert.ok(document.querySelector('#start-here [data-welcome]'),'Home immediately offers beginner onboarding');
  if(routeURL.pathname==='/models')assert.equal(document.querySelector('#collection').hidden,false);
  if(current){assert.ok(document.querySelector('.model-profile'));assert.ok(document.querySelector('#vehicle-schema'));assert.ok(document.querySelector('.engineering-detail-actions a[href="/engines/s63tu"]'));}
  if(routeURL.pathname==='/engines')assert.equal(document.querySelectorAll('.ed-card').length,30);
  if(routeURL.pathname==='/engines/s65')assert.ok(document.querySelector('.ed-detail-photo'));
  if(routeURL.pathname==='/start')assert.ok(document.querySelector('.tool-card'));
  if(routeURL.pathname==='/play'){
    assert.ok(document.querySelector('.play-shell'));
    if(routeURL.search)assert.ok(document.querySelector('.play-rules'),'Onboarding mode links open the specified how-to screen');
    else assert.equal(document.querySelectorAll('[data-play-mode]').length,17);
  }
  if(routeURL.pathname==='/my-garage')assert.ok(document.querySelector('.garage-hub')&&document.querySelector('.personal-garage'),'The new hub and existing saved garage must both survive integration');
  if(routeURL.pathname.startsWith('/parts/'))assert.ok(document.querySelector('.pe-detail'),'Part deep links open the encyclopedia detail');
  if(routeURL.pathname.startsWith('/glossary/'))assert.ok(document.querySelector('.reference-page').textContent.includes('Torque'));
  if(routeURL.pathname.startsWith('/badges/'))assert.ok(document.querySelector('.reference-page').textContent.includes('Answers explored'));
  if(routeURL.pathname.startsWith('/questions/'))assert.ok(document.querySelector('.knowledge-answer'));
  platform.destroy();account.destroy();console.error=originalError;
}
