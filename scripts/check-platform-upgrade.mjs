import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parseHTML} from 'linkedom';
import {registerHooks} from 'node:module';

const cases=['/','/models','/electric','/about','/photos','/parts','/cars/f10-m5','/cars/f92-m8','/cars/i4','/engines','/engines/s65','/engines/s70','/engines/edrive','/engines/unknown-engine','/start','/learn','/lessons/first-engine','/play','/play?mode=practice','/my-garage','/tuning-garage','/engine-lab','/generation-guides','/compare','/account','/parts/turbocharger','/glossary','/glossary/torque','/badges','/badges/answers-1','/questions/car-f10-code'];
cases.push('/community','/friends','/submit-car','/garage/test-token','/community/cars/test-car','/questions/academy-part-turbocharger-photo');
const route=process.argv[process.argv.indexOf('--route')+1];
if(!process.argv.includes('--route')){
  for(const path of cases){
    const result=spawnSync(process.execPath,[fileURLToPath(import.meta.url),'--route',path],{encoding:'utf8',timeout:20000});
    assert.equal(result.status,0,`${path} platform mount failed:\n${result.stdout||''}${result.stderr||''}`);
    console.log('PASS Platform integration: '+path);
  }
  console.log(`Platform upgrade checks passed for ${cases.length} complete HTML shells and actual lazy imports.`);
}else{
  // Honour the browser shell's Three.js import map in this Node-only fixture.
  registerHooks({resolve(specifier,context,nextResolve){return nextResolve(specifier==='three'?new URL('../public/vendor/three.module.min.js',import.meta.url).href:specifier,context);}});
  const {resolvePage}=await import('../public/routes.js');
  const routeURL=new URL(route,'http://localhost:4173');
  const shell=resolvePage(routeURL.pathname);assert.ok(shell,'Every public route resolves to an HTML shell');
  const {document,window}=parseHTML(await fs.readFile(new URL('../public/'+shell,import.meta.url),'utf8'));
  const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
  Object.assign(globalThis,{window,document,location:routeURL,localStorage:storage,HTMLImageElement:window.HTMLImageElement,HTMLElement:window.HTMLElement,Element:window.Element,MutationObserver:window.MutationObserver,CustomEvent:window.CustomEvent});
  Object.defineProperty(document,'baseURI',{get:()=>routeURL.href});
  const media=()=>({matches:false,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}});
  globalThis.matchMedia=window.matchMedia=media;globalThis.requestAnimationFrame=window.requestAnimationFrame=fn=>setTimeout(fn,0);globalThis.cancelAnimationFrame=window.cancelAnimationFrame=clearTimeout;
  window.scrollTo=()=>{};window.HTMLElement.prototype.scrollIntoView=()=>{};
  // linkedom deliberately omits the native select setter and dialog methods.
  // Supply their browser contracts so actual product modules run unchanged.
  Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){return this.querySelector('option[selected]')?.value??this.querySelector('option')?.value??'';},set(value){for(const option of this.querySelectorAll('option'))option.selected=option.value===String(value);}});
  window.HTMLElement.prototype.showModal=function(){this.open=true;};window.HTMLElement.prototype.close=function(){this.open=false;this.dispatchEvent(new window.Event('close'));};
  globalThis.fetch=async()=>new Response(JSON.stringify({user:null,provider:'password'}),{status:200,headers:{'content-type':'application/json'}});
  const errors=[],originalError=console.error;console.error=(...args)=>errors.push(args.map(value=>value instanceof Error?value.stack:String(value)).join(' '));
  process.on('unhandledRejection',error=>{process.stderr.write(String(error.stack||error)+'\n');process.exit(1);});
  const {allModels}=await import('../public/catalog.js'),{account}=await import('../public/account-sync.js'),{mountPlatform}=await import('../public/platform.js');
  await account.start();
  const current=routeURL.pathname.startsWith('/cars/')?allModels.find(model=>model.id===routeURL.pathname.split('/')[2]):null;
  if(process.env.APEX_DEBUG_ROUTE)console.log('Route: before mount');
  const platform=mountPlatform({catalog:allModels,getCurrent:()=>current,selectModel(){},showCollection(){},openPart(){},compareModels(){},mountComparison(){return {destroy(){}};},dialog(){},toast(){}});
  const deadline=Date.now()+5000;
  if(process.env.APEX_DEBUG_ROUTE)console.log('Route: after mount');
  while(document.querySelector('.workspace-loading')&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,20));
  await new Promise(resolve=>setTimeout(resolve,60));
  if(process.env.APEX_DEBUG_ROUTE)console.log('Route: imports settled',errors);
  assert.equal(document.querySelector('.destination-error'),null,'A lazy destination must mount without its error state');
  assert.equal(document.querySelector('.workspace-loading'),null,'The requested destination must finish loading');
  assert.ok(!document.body.textContent.includes('[object Object]'),'Page text must not stringify objects');
  if(routeURL.pathname==='/engine-lab'){
    assert.ok(document.querySelector('.el-no-webgl'),'A DOM without a GPU must receive the usable component guide');
    assert.ok(errors.every(error=>error.startsWith('THREE.WebGLRenderer:')),'Only the expected no-WebGL renderer diagnostic is allowed: '+errors.join('\n'));
  }else assert.deepEqual(errors,[],'Platform and all imported modules should have no console or unhandled errors');
  assert.equal(document.querySelectorAll('.site-header nav a').length,6);
  assert.ok(document.querySelector('.header-xp')&&document.querySelector('.header-units'));
  assert.equal(document.querySelector('.detail-mode-toggle'),null,'The removed Easy/Nerd control must not return');
  assert.equal(document.documentElement.dataset.detail,undefined,'No global detail mode should alter page layout');
  assert.ok(document.querySelector('link[rel="canonical"]'));
  assert.equal(document.querySelector('.footer-brand small').textContent,'Unofficial fan site. Not affiliated with BMW AG. BMW names and trademarks belong to BMW AG.');
  if(routeURL.pathname==='/')assert.ok(document.querySelector('#start-here [data-welcome]'),'Home immediately offers beginner onboarding');
  if(routeURL.pathname==='/models')assert.equal(document.querySelector('#collection').hidden,false);
  if(current){assert.ok(document.querySelector('.car-story'));assert.ok(document.querySelector('.model-profile'));assert.ok(document.querySelector('#vehicle-schema'));assert.ok(document.querySelector('.engineering-detail-actions a[href^="/engines/"]'));}
  if(routeURL.pathname==='/engines')assert.equal(document.querySelectorAll('.ed-card').length,30);
  if(routeURL.pathname==='/engines/s65')assert.ok(document.querySelector('.ed-detail-photo'));
  if(['/engines','/engines/s65','/play','/parts/turbocharger'].includes(routeURL.pathname)){
    assert.equal(document.querySelector('.destination-heading'),null,'A destination with its own introduction should not repeat a shell title');
    assert.equal(document.querySelectorAll('#destination h1').length,1,'The destination has one primary title');
  }
  if(routeURL.pathname==='/engines/s65')assert.equal(document.querySelector('[data-destination-crumb]').textContent,'S65');
  if(routeURL.pathname==='/start')assert.ok(document.querySelector('.tool-card'));
  if(routeURL.pathname==='/play'){
    assert.ok(document.querySelector('.play-shell'));
    if(routeURL.search)assert.ok(document.querySelector('.play-rules'),'Onboarding mode links open the specified how-to screen');
    else assert.equal(document.querySelectorAll('[data-play-mode]').length,17);
  }
  if(routeURL.pathname==='/my-garage')assert.ok(document.querySelector('.garage-hub')&&document.querySelector('.personal-garage'),'The new hub and existing saved garage must both survive integration');
  if(['/community','/friends','/submit-car','/admin'].includes(routeURL.pathname)||routeURL.pathname.startsWith('/garage/')||routeURL.pathname.startsWith('/community/cars/')){
    assert.ok(document.querySelector('.community-page'),'Community destinations mount their actual module');
    assert.equal(document.querySelectorAll('#destination h1').length,1,'Community pages have one primary heading');
    assert.equal(document.querySelector('.destination-heading'),null,'The community introduction replaces the shell heading');
    if(routeURL.pathname!=='/community'&&!routeURL.pathname.startsWith('/community/cars/'))assert.equal(document.querySelector('meta[name="robots"]').content,'noindex,nofollow','Private account and shared-token routes stay out of search indexing');
  }
  if(routeURL.pathname.startsWith('/parts/'))assert.ok(document.querySelector('.pe-detail'),'Part deep links open the encyclopedia detail');
  if(routeURL.pathname.startsWith('/glossary/'))assert.ok(document.querySelector('.reference-page').textContent.includes('Torque'));
  if(routeURL.pathname==='/glossary/torque'){
    const {setLanguage}=await import('../public/preferences.js'),{getGlossaryEntry}=await import('../public/academy-glossary.js');
    for(const language of ['ka','ru','en']){
      setLanguage(language,false);
      assert.equal(document.querySelector('.reference-page .reference-lead')?.textContent,getGlossaryEntry('torque',language).summary,'Glossary deep links update definitions when the language changes');
    }
  }
  if(routeURL.pathname.startsWith('/badges/'))assert.ok(document.querySelector('.reference-page').textContent.includes('Answers explored'));
  if(routeURL.pathname.startsWith('/questions/'))assert.ok(document.querySelector('.knowledge-answer'));
  if(routeURL.pathname==='/questions/academy-part-turbocharger-photo'){
    assert.equal(document.querySelector('.knowledge-photo')?.getAttribute('src'),'/images/parts/turbocharger.webp','Photo reference cards use the question bank photo object');
    assert.equal(document.querySelector('.knowledge-answer h3')?.textContent,'Turbocharger','The explanation identifies the correct answer');
    assert.ok(document.querySelector('.knowledge-answer a[href="https://commons.wikimedia.org/wiki/File:Turbocharger_3.jpg"]'),'Reference cards retain photo attribution');
    assert.ok(document.querySelector('.knowledge-answer a[href*="garrettmotion.com"]'),'Reference cards expose their factual source');
  }
  if(routeURL.pathname==='/lessons/first-engine'){
    if(process.env.APEX_DEBUG_QUIZ)console.log('Academy scroll regression: mounted');
    const {academyLessons,academyReferenceData}=await import('../public/academy.js'),{createCurriculum}=await import('../public/academy-content.js'),{partCatalog}=await import('../public/parts.js');
    const lesson=createCurriculum(academyLessons,academyReferenceData.sources,partCatalog,allModels,academyReferenceData.scenarios).lessons.find(item=>item.id==='first-engine');
    document.querySelector('[data-ac="start-questions"]').click();if(process.env.APEX_DEBUG_QUIZ)console.log('Academy scroll regression: started');
    document.querySelector('[data-ac="answer"][data-value="'+lesson.questions[0].correct+'"]').click();
    document.querySelector('[data-ac="check"]').click();if(process.env.APEX_DEBUG_QUIZ)console.log('Academy scroll regression: checked');assert.ok(document.querySelector('[data-ac="question-next"]'));
    const calls=[];window.innerHeight=780;window.scrollY=2200;window.scrollTo=options=>calls.push(options);
    window.HTMLElement.prototype.getBoundingClientRect=function(){return this.matches('.site-header')?{top:14,bottom:82,height:68}:{top:-850,bottom:-790,height:60};};
    document.querySelector('[data-ac="question-next"]').click();assert.equal(calls.at(-1).top,1252,'Academy Continue reveals the next question below the floating header');assert.equal(calls.at(-1).behavior,'smooth');
  }
  platform.destroy();account.destroy();console.error=originalError;
}
