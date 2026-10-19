import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseHTML} from 'linkedom';
import {allModels} from '../public/catalog.js';
import {account} from '../public/account-sync.js';
import {decodeBMWName,rankBMWMatches,mountGuideTools} from '../public/guide-tools.js';
import {emptyHub,validateHub,garageSummary,dailyCar,mountGarageHub} from '../public/garage-hub.js';
import {mountExperience} from '../public/experience.js';
import {mountPlatform} from '../public/platform.js';
import {encyclopediaParts} from '../public/parts-encyclopedia-data.js';
import {resolvePage} from '../public/routes.js';

class MemoryStorage{
  map=new Map();getItem(key){return this.map.get(key)??null;}setItem(key,value){this.map.set(key,String(value));}removeItem(key){this.map.delete(key);}clear(){this.map.clear();}
}
const originalAccount={getSnapshot:account.getSnapshot,subscribe:account.subscribe};
let snapshot={user:null,status:'guest',provider:'password',message:'Guest garage',guestSummary:{favorites:0,builds:0,lessons:0,xp:0}},listeners=new Set();
account.getSnapshot=()=>snapshot;account.subscribe=callback=>{listeners.add(callback);callback(snapshot);return()=>listeners.delete(callback);};
const setUser=user=>{snapshot={...snapshot,user,status:user?'synced':'guest'};for(const callback of listeners)callback(snapshot);};
const indexHTML=fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
let groups=0;
async function check(label,callback){await callback();groups++;console.log('PASS Experience: '+label);}

function fixture(pathname='/start',storage=new MemoryStorage()){
  const {window,document}=parseHTML(indexHTML),location=new URL(pathname,'http://localhost:3000');
  Object.assign(globalThis,{window,document,location,localStorage:storage,MutationObserver:window.MutationObserver,HTMLElement:window.HTMLElement,HTMLImageElement:window.HTMLImageElement,CustomEvent:window.CustomEvent,Event:window.Event});
  // page-entry.js runs before mountPlatform in the actual app entry point.
  document.documentElement.dataset.route=location.pathname.slice(1)||'home';
  const selectPrototype=window.HTMLSelectElement.prototype;
  Object.defineProperty(selectPrototype,'value',{configurable:true,get(){const options=[...this.querySelectorAll('option')];return (options.find(option=>option.hasAttribute('selected'))||options[0])?.getAttribute('value')||'';},set(value){for(const option of this.querySelectorAll('option')){if(option.getAttribute('value')===String(value))option.setAttribute('selected','');else option.removeAttribute('selected');}}});
  if(!window.HTMLElement.prototype.showModal)window.HTMLElement.prototype.showModal=function(){this.open=true;this.setAttribute('open','');};
  if(!window.HTMLElement.prototype.close)window.HTMLElement.prototype.close=function(){this.open=false;this.removeAttribute('open');};
  if(!window.HTMLElement.prototype.scrollIntoView)window.HTMLElement.prototype.scrollIntoView=function(){};
  if(!window.HTMLElement.prototype.getBoundingClientRect)window.HTMLElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:1280,height:80,right:1280,bottom:80});
  globalThis.matchMedia=query=>({matches:query.includes('prefers-reduced-motion'),media:query,addEventListener(){},removeEventListener(){}});
  globalThis.requestAnimationFrame=callback=>{callback(0);return 0;};globalThis.cancelAnimationFrame=()=>{};window.scrollTo=()=>{};window.scrollY=0;
  globalThis.history={state:null,replaceState(_state,_title,url){location.href=new URL(url,location).href;},pushState(_state,_title,url){location.href=new URL(url,location).href;}};
  globalThis.FormData=class {
    values=[];constructor(form){for(const input of form.querySelectorAll('input,select,textarea')){if(!input.name||input.disabled||['submit','button','file'].includes(input.type))continue;if(['checkbox','radio'].includes(input.type)&&!input.checked&&!input.hasAttribute('checked'))continue;this.values.push([input.name,input.value||'']);}}
    get(name){return this.values.find(([key])=>key===name)?.[1]??null;}getAll(name){return this.values.filter(([key])=>key===name).map(([,value])=>value);}[Symbol.iterator](){return this.values[Symbol.iterator]();}
  };
  const host=document.createElement('section');document.querySelector('main').append(host);
  return {window,document,location,storage,host};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function settle(predicate){for(let count=0;count<30;count++){if(predicate())return;await tick();}assert.ok(predicate(),'Dynamic page failed to mount.');}

try{
  await check('the name decoder distinguishes the model family, performance tier and drive designation',()=>{
    const m=decodeBMWName('BMW M340i');assert.deepEqual(m.map(row=>row.token),['M','3','40','i']);assert.match(m[0].text,/M Performance/);assert.match(m[2].text,/not a reliable engine-size/);
    const x=decodeBMWName('X5 xDrive40i');assert.deepEqual(x.map(row=>row.token),['X5','xDrive','40','i']);assert.match(x[1].text,/all-wheel drive/);
    const ev=decodeBMWName('i4 eDrive40');assert.deepEqual(ev.map(row=>row.token),['i4','eDrive','40']);assert.match(ev[1].text,/does not by itself prove the number of motors/);
    assert.deepEqual(decodeBMWName(''),[]);assert.deepEqual(decodeBMWName('M'.repeat(61)),[]);
  });

  await check('finder filters respect powertrain and body style while retaining honest budget wording',()=>{
    const electric=rankBMWMatches(allModels,{fuel:'electric',vibe:'electric'});assert.ok(electric.length);assert.ok(electric.every(match=>match.car.powertrain==='Electric'));
    const hybrid=rankBMWMatches(allModels,{fuel:'hybrid'});assert.ok(hybrid.length);assert.ok(hybrid.every(match=>/hybrid/i.test(match.car.powertrain)));
    const roadsters=rankBMWMatches(allModels,{body:'open',fuel:'petrol'});assert.ok(roadsters.length);assert.ok(roadsters.every(match=>/roadster|convertible|z[1348]/i.test(match.car.name+' '+match.car.generation)));
    assert.deepEqual(rankBMWMatches([]),[]);assert.ok(electric.every(match=>match.reasons.length));
    const {host,window}=fixture();const instance=mountGuideTools(host,{catalog:allModels});host.querySelector('[data-finder] [name=budget]').value='35000';host.querySelector('[data-finder] [name=fuel]').value='electric';host.querySelector('[data-finder]').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
    assert.match(host.querySelector('[data-matches]').textContent,/Current prices are not verified/);assert.ok(host.querySelectorAll('.match-results>a').length);instance.destroy();
  });

  await check('three onboarding taps save a scoped preference and recommend working destinations',()=>{
    setUser(null);const {host,storage}=fixture('/');storage.setItem('apex-favorites','["e92"]');const instance=mountGuideTools(host,{catalog:allModels,onboarding:true});
    host.querySelector('[data-welcome=new]').click();assert.match(host.textContent,/2 \/ 3/);host.querySelector('[data-welcome=electric]').click();assert.match(host.textContent,/3 \/ 3/);host.querySelector('[data-welcome=play]').click();
    assert.deepEqual(JSON.parse(storage.getItem('apex-welcome-v1:guest')),{level:'new',vibe:'electric',goal:'play'});assert.equal(document.documentElement.dataset.detail,undefined);
    const destinations=[...host.querySelectorAll('.welcome-options>a')].map(link=>link.getAttribute('href'));assert.ok(destinations.includes('/learn?lesson=electrification'));assert.ok(destinations.includes('/play?mode=practice'));assert.ok(destinations.some(link=>link.startsWith('/cars/')));
    assert.equal(storage.getItem('apex-favorites'),'["e92"]');instance.destroy();
    const remount=mountGuideTools(host,{catalog:allModels,onboarding:true});assert.ok(host.querySelector('[data-restart]'));remount.destroy();
  });

  await check('garage import validates actual catalogue IDs, numeric valuations and service records',()=>{
    const service={carId:'e92',part:'oil-filter',mileage:100000,cost:120,date:'2026-10-01',note:'Oil & filter checked',due:'2027-10-01'};
    const result=validateHub({...emptyHub(),cards:['e92','fake-car','e92'],values:{e92:25000,'fake-car':1,f90:-2},services:[service,{...service,carId:'fake-car'},{...service,cost:Infinity}],paint:'<img src=x>',wheel:'unknown',password:'must not persist'},allModels);
    assert.deepEqual(result.cards,['e92']);assert.deepEqual(result.values,{e92:25000});assert.deepEqual(result.services,[service]);assert.equal(result.paint,'Alpine White');assert.equal(result.wheel,'silver');assert.equal(Object.hasOwn(result,'password'),false);
    assert.throws(()=>validateHub({cards:[]},allModels),/not an APEX collection/);assert.throws(()=>validateHub({...emptyHub(),services:Array(1001).fill(service)},allModels),/1,000/);
  });

  await check('garage totals convert PS and kW to mechanical hp and average only available sprint figures',()=>{
    const e92=allModels.find(car=>car.id==='e92'),f10=allModels.find(car=>car.id==='f10-m5'),g80=allModels.find(car=>car.id==='g80');
    const summary=garageSummary([e92,f10,g80],{e92:0,'f10-m5':50000});assert.equal(summary.hp,Math.round((420+560)*0.9863200706+503));assert.equal(summary.powerCount,3);assert.equal(summary.value,50000);assert.equal(summary.valued,2);assert.equal(summary.accelerationCount,2);assert.equal(summary.acceleration,(4.8+4.4)/2);
    assert.equal(garageSummary([{...e92,power:100,powerUnit:'kW'}]).hp,134);assert.equal(garageSummary([{...e92,powerUnit:'unknown'}]).powerCount,0);assert.equal(garageSummary([]).acceleration,null);
    assert.equal(dailyCar(allModels,'2026-10-20').id,dailyCar([...allModels].reverse(),'2026-10-20').id);
  });

  await check('daily claims and color-studio changes persist without clobbering existing favorites',()=>{
    setUser(null);const {host,storage}=fixture('/my-garage');const favorites='["e92","f10-m5"]';storage.setItem('apex-favorites',favorites);const instance=mountGarageHub(host,{catalog:allModels});
    host.querySelector('[data-claim]').click();const first=JSON.parse(storage.getItem('apex-collection-v1:guest'));assert.equal(first.cards.length,1);assert.equal(first.claimedDays.length,1);assert.equal(host.querySelector('[data-claim]').disabled,true);host.querySelector('[data-claim]').click();assert.equal(JSON.parse(storage.getItem('apex-collection-v1:guest')).cards.length,1);
    host.querySelector('[data-hub-tab=studio]').click();host.querySelector('[data-paint="Interlagos Blue"]').click();assert.equal(host.querySelector('[data-paint="Interlagos Blue"]').getAttribute('aria-pressed'),'true');assert.match(host.querySelector('.paint-preview svg').getAttribute('aria-label'),/Interlagos Blue/);
    host.querySelector('[data-wheel=bronze]').click();const final=JSON.parse(storage.getItem('apex-collection-v1:guest'));assert.equal(final.paint,'Interlagos Blue');assert.equal(final.wheel,'bronze');assert.equal(storage.getItem('apex-favorites'),favorites);instance.destroy();
  });

  await check('account changes keep collection cards and personal valuations in separate browser keys',()=>{
    const {host,storage}=fixture('/my-garage');setUser({id:'alice',name:'Alice'});const alice={...emptyHub(),cards:['e92'],values:{e92:42000}},bob={...emptyHub(),cards:['f10-m5'],values:{'f10-m5':36000}};storage.setItem('apex-collection-v1:alice',JSON.stringify(alice));storage.setItem('apex-collection-v1:bob',JSON.stringify(bob));storage.setItem('apex-favorites','[]');
    const instance=mountGarageHub(host,{catalog:allModels});assert.match(host.querySelector('.collectible-grid').textContent,/BMW M3/);assert.ok(host.querySelector('[data-value=e92]'));
    setUser({id:'bob',name:'Bob'});assert.ok(host.querySelector('[data-value="f10-m5"]'));assert.equal(host.querySelector('[data-value=e92]'),null);assert.deepEqual(JSON.parse(storage.getItem('apex-collection-v1:alice')),alice);assert.deepEqual(JSON.parse(storage.getItem('apex-collection-v1:bob')),bob);instance.destroy();setUser(null);
  });

  await check('unit controls update real PS-based car readings without a global detail mode',()=>{
    const {document,window,storage}=fixture('/cars/f10-m5');const model=allModels.find(car=>car.id==='f10-m5');const details=document.createElement('details');details.className='profile-data-group';document.querySelector('main').append(details);const instance=mountExperience({catalog:allModels,getCurrent:()=>model});
    assert.equal(document.querySelector('.detail-mode-toggle'),null);assert.equal(document.documentElement.dataset.detail,undefined);assert.ok(!details.open);details.open=true;window.dispatchEvent(new window.CustomEvent('apex:modelselected'));assert.equal(details.open,true,'Refreshing a model must not force manually opened specifications closed');
    assert.match(document.querySelector('.friendly-readings').textContent,/552 hp/);const power=document.querySelector('[data-unit=power]');power.value='kw';power.dispatchEvent(new window.Event('change'));assert.match(document.querySelector('.friendly-readings').textContent,/412 kW/);
    const speed=document.querySelector('[data-unit=speed]');speed.value='mph';speed.dispatchEvent(new window.Event('change'));assert.match(document.querySelector('.friendly-readings').textContent,/155 mph/);assert.match(document.querySelector('.friendly-readings').textContent,/0–62.1 mph/);assert.equal(JSON.parse(storage.getItem('apex-display-units')).power,'kw');assert.ok(document.querySelector('.glass-bottom-nav a[href="/play"]'));
    const fuel=document.querySelector('[data-unit=fuel]');fuel.value='mpg';fuel.dispatchEvent(new window.Event('change'));assert.match(document.querySelector('.friendly-readings').textContent,/23\.8 mpg \(US\)/);instance.destroy();
  });

  await check('platform mounts a clean engine URL with the correct destination and source-bound cars',async()=>{
    const {document,storage}=fixture('/engines/s58');const favorites='["e92"]';storage.setItem('apex-favorites',favorites);const instance=mountPlatform({catalog:allModels,getCurrent:()=>null,selectModel(){},showCollection(){},openPart(){},compareModels(){},mountComparison(){return {destroy(){}};},dialog(){},toast(){}});
    await settle(()=>document.querySelector('.ed-applications'));
    assert.equal(resolvePage('/engines/s58'),'index.html');assert.equal(document.documentElement.dataset.route,'engines/s58');assert.ok(document.querySelector('.site-header a[href="/engines"][aria-current=page]'));assert.equal(document.querySelector('.ed-detail h1').textContent,'S58');assert.ok(document.querySelector('.ed-applications a[href="/cars/g80"]'));assert.equal(storage.getItem('apex-favorites'),favorites);assert.equal(document.querySelector('.destination-error'),null);instance.destroy();
  });

  await check('maintenance reminders link to real encyclopedia destinations',()=>{
    const {host,storage}=fixture('/my-garage');const services=['battery','inspection'].map(part=>({carId:'e92',part,mileage:120000,cost:0,date:'2025-01-01',due:'2025-02-01',note:'Reminder'}));storage.setItem('apex-collection-v1:guest',JSON.stringify({...emptyHub(),services}));const instance=mountGarageHub(host,{catalog:allModels});host.querySelector('[data-hub-tab=care]').click();
    for(const link of host.querySelectorAll('.care-reminders a,.service-list a')){const url=link.getAttribute('href');assert.ok(url==='/parts'||encyclopediaParts.some(part=>part.url===url),'Unknown maintenance destination '+url);}instance.destroy();
  });
  console.log(`Experience: ${groups} integration groups passed (DOM simulation; no real-browser or visual audit claimed).`);
}finally{
  account.getSnapshot=originalAccount.getSnapshot;account.subscribe=originalAccount.subscribe;listeners.clear();
}
