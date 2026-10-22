import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseHTML} from 'linkedom';
import {mountClubMembership} from '../public/club-membership.js';
import {emptyGarageGame,getGarageGame,garageGameKey,GARAGE_ECONOMY} from '../public/garage-game-state.js';
import {setLanguage,hasTranslation} from '../public/preferences.js';
import {clubMembershipTranslationEntries} from '../public/club-membership-translations.js';

let checks=0;
const check=(condition,message)=>{assert.ok(condition,message);checks++;};
class MemoryStorage {
  values=new Map();writes=0;rejectWrites=false;
  getItem(key){return this.values.get(key)??null;}
  setItem(key,value){if(this.rejectWrites)throw Error('Storage blocked');this.writes++;this.values.set(key,String(value));}
}
const NativeDate=Date,nativeSetTimeout=setTimeout,nativeClearTimeout=clearTimeout;
let now='2026-10-22T10:00:00Z',timerId=0;const timers=new Map();
globalThis.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[now]));}static now(){return new NativeDate(now).getTime();}};
globalThis.setTimeout=(callback,delay)=>{const id=++timerId;timers.set(id,{callback,delay});return id;};
globalThis.clearTimeout=id=>timers.delete(id);

function fixture({userId='driver-a',coins=50,pass=null,ready=true}={}){
  const {document,window}=parseHTML('<html><head></head><body><main></main></body></html>');
  const storage=new MemoryStorage(),listeners=new Set();let active=document.body,snapshot={user:userId===null?null:{id:userId},status:ready?'synced':'loading',ready};
  Object.defineProperty(document,'activeElement',{get:()=>active});
  window.HTMLElement.prototype.focus=function(){active=this;};
  Object.assign(globalThis,{document,window,CustomEvent:window.CustomEvent,MutationObserver:window.MutationObserver,localStorage:storage});
  const controller={getSnapshot:()=>snapshot,subscribe(listener){listeners.add(listener);listener(snapshot);return()=>listeners.delete(listener);}};
  const seed=(id,amount,clubPass=null)=>storage.setItem(garageGameKey(id),JSON.stringify({...emptyGarageGame(),coins:amount,earned:amount,clubPass,legacyMigrated:true}));
  seed(userId,coins,pass);
  setLanguage('en');
  const host=document.querySelector('main'),view=mountClubMembership(host,{accountController:controller});
  const emitStorage=key=>{const event=new window.Event('storage');event.key=key;window.dispatchEvent(event);};
  const emitGarage=key=>window.dispatchEvent(new window.CustomEvent('apex:garagegame',{detail:{key}}));
  const setUser=(id,{notify=true,nextReady=true}={})=>{snapshot={user:id===null?null:{id},ready:nextReady,status:nextReady?'synced':'loading'};if(notify)for(const listener of listeners)listener(snapshot);};
  return {host,view,window,document,storage,seed,emitStorage,emitGarage,setUser,listeners,controller,get active(){return active;}};
}
const getState=(f,userId='driver-a')=>getGarageGame({userId,storage:f.storage});

try{
  {
    const f=fixture();
    check(f.host.querySelectorAll('.cm-plan').length===2,'Free and Club comparison cards mount.');
    check(f.host.querySelector('[data-club-balance]').textContent==='50','Current account balance is visible.');
    check(f.host.querySelector('[data-club-status]').textContent==='Free garage','A driver without a pass sees the free plan.');
    check(f.host.querySelector('.cm-plan-free a').getAttribute('href')==='/my-garage?view=collection','Free showcase creation links to the collection.');
    check(f.host.querySelectorAll('[data-club-faq]').length===3,'FAQ uses three native disclosure controls.');
    const faq=f.host.querySelector('[data-club-faq=renew]');faq.setAttribute('open','');
    const button=f.host.querySelector('[data-club-activate]'),writes=f.storage.writes;
    button.focus();button.click();
    const state=getState(f);
    check(state.coins===15&&state.spent===GARAGE_ECONOMY.clubCost,'The mounted action purchases the actual Club pass once.');
    check(state.clubPass.start==='2026-10-22'&&state.clubPass.end==='2026-10-28','Activation covers today plus the next six UTC days.');
    check(f.storage.writes===writes+1,'One activation produces one saved debit.');
    check(f.host.querySelector('[data-club-status]').textContent==='Club active','The status updates after successful persistence.');
    check(f.host.querySelector('[data-club-days]').dataset.clubDays==='7','Remaining days include today.');
    check(f.host.querySelector('[data-club-expiry]').getAttribute('datetime')==='2026-10-28T23:59:59Z','Expiry specifies the final UTC day.');
    check(f.host.querySelector('[data-club-action] a').getAttribute('href')==='/my-garage?view=club','An active member can open garage styling.');
    check(f.host.querySelector('[data-club-notice]').textContent.includes('2026-10-28'),'Successful activation announces its saved expiry.');
    check(f.active===f.host.querySelector('[data-club-notice]'),'Activation moves focus to the result message.');
    check(f.host.querySelector('[data-club-faq=renew]')===faq&&faq.hasAttribute('open'),'Purchases preserve open FAQ state and its DOM.');
    button.click();f.emitGarage(garageGameKey('driver-a'));f.emitStorage(garageGameKey('driver-a'));
    check(getState(f).coins===15&&f.storage.writes===writes+1,'Stale or repeat clicks and refreshes cannot debit the pass twice.');
    f.seed('driver-b',2);f.setUser('driver-b');
    check(f.host.querySelector('[data-club-balance]').textContent==='2'&&f.host.querySelector('[data-club-status]').textContent==='Free garage','Switching accounts replaces balance and membership.');
    check(f.host.querySelector('[data-club-notice]').hidden,'The former account’s success notice is cleared.');
    check(f.host.querySelector('[data-club-action] a').getAttribute('href')==='/play','A low balance has a useful route to earn coins.');
    f.seed('driver-a',200);f.emitStorage(garageGameKey('driver-a'));
    check(f.host.querySelector('[data-club-balance]').textContent==='2','Another account’s storage update cannot leak its balance.');
    f.seed('driver-b',40);f.emitStorage(garageGameKey('driver-b'));
    check(f.host.querySelector('[data-club-balance]').textContent==='40'&&Boolean(f.host.querySelector('[data-club-activate]')),'Cross-tab earnings update the current purchase action.');
    f.seed('driver-b',32);f.emitGarage(garageGameKey('driver-b'));
    check(f.host.querySelector('[data-club-balance]').textContent==='32'&&f.host.querySelector('[data-club-action]').textContent.includes('3'),'Garage earnings events refresh the current shortfall.');
    f.seed(null,9);f.setUser(null);
    check(f.host.querySelector('[data-club-balance]').textContent==='9'&&f.host.querySelector('[data-club-summary]').textContent.includes('Guest'),'Guest progress is isolated from signed-in accounts.');
    const beforeDestroyTimers=timers.size;f.view.destroy();
    check(f.listeners.size===0&&timers.size===beforeDestroyTimers-1,'Destroy unsubscribes from the account and clears the midnight timer.');
    f.emitGarage(garageGameKey(null));f.emitStorage(null);f.window.dispatchEvent(new f.window.Event('pageshow'));f.document.dispatchEvent(new f.window.Event('visibilitychange'));f.setUser('driver-a');
    check(f.host.children.length===0,'Destroyed views ignore account, storage and resume events.');
  }
  {
    const f=fixture();f.seed('driver-b',80);const oldButton=f.host.querySelector('[data-club-activate]');f.setUser('driver-b',{notify:false});oldButton.click();
    check(getState(f).coins===50&&getState(f,'driver-b').coins===80,'An identity change between render and click prevents spending either account’s coins.');
    check(f.host.querySelector('[data-club-balance]').textContent==='80'&&f.host.querySelector('[data-club-notice]').textContent.includes('account changed'),'The stale action asks the user to review the newly current balance.');
    f.view.destroy();
  }
  {
    const f=fixture();f.storage.rejectWrites=true;f.host.querySelector('[data-club-activate]').click();
    check(getState(f).coins===50&&getState(f).clubPass===null,'A failed browser save cannot debit coins or create a pass.');
    check(f.host.querySelector('[data-club-notice]').getAttribute('role')==='alert'&&f.host.querySelector('[data-club-notice]').textContent.includes('not spent'),'A failed save has an accessible, truthful error.');
    check(Boolean(f.host.querySelector('[data-club-activate]'))&&!f.host.querySelector('[data-club-activate]').disabled,'A failed save leaves activation available for retry.');
    f.storage.rejectWrites=false;f.host.querySelector('[data-club-activate]').click();
    check(getState(f).coins===15&&Boolean(getState(f).clubPass),'A successful retry spends only one pass price.');
    f.view.destroy();
  }
  {
    const f=fixture({ready:false});
    check(!f.host.querySelector('[data-club-activate]')&&f.host.querySelector('[data-club-action] button').disabled,'Activation is unavailable while account identity is being checked.');
    f.setUser('driver-a');check(Boolean(f.host.querySelector('[data-club-activate]')),'Identity verification enables activation using the loaded balance.');f.view.destroy();
  }
  {
    now='2026-10-28T23:59:50Z';const f=fixture({coins:80,pass:{start:'2026-10-22',end:'2026-10-28'}});
    check(f.host.querySelector('[data-club-days]').dataset.clubDays==='1','The final day is still active.');
    const faq=f.host.querySelector('[data-club-faq=expiry]');faq.setAttribute('open','');
    const action=f.host.querySelector('[data-club-focus=main-action]');action.focus();
    const [id,timer]=[...timers][0];check(timer.delay>0&&timer.delay<=10100,'A refresh is scheduled at the UTC boundary.');
    now='2026-10-29T00:00:01Z';timers.delete(id);timer.callback();
    check(f.host.querySelector('[data-club-status]').textContent==='Club expired'&&Boolean(f.host.querySelector('[data-club-activate]')),'Midnight expiry changes styling access to manual renewal.');
    check(getState(f).coins===80,'Expiry cannot renew or charge automatically.');
    check(f.host.querySelector('[data-club-faq=expiry]')===faq&&faq.hasAttribute('open'),'A midnight update preserves FAQ state.');
    check(f.active===f.host.querySelector('[data-club-activate]'),'Focus stays on the corresponding action when expiry changes its element.');
    f.host.querySelector('[data-club-activate]').click();check(getState(f).coins===45&&getState(f).clubPass.end==='2026-11-04','An expired pass can be manually reactivated at the same price.');
    now='2026-11-06T12:00:00Z';f.document.dispatchEvent(new f.window.Event('visibilitychange'));
    check(f.host.querySelector('[data-club-status]').textContent==='Club expired','Resuming a background tab refreshes a missed expiry.');
    f.view.destroy();now='2026-10-22T10:00:00Z';
  }
  {
    const f=fixture({coins:4}),faq=f.host.querySelector('[data-club-faq=coins]');faq.setAttribute('open','');faq.querySelector('summary').focus();
    for(const language of ['ka','ru']){
      setLanguage(language);
      check(!/A garage that feels|Current plan|Free garage|Earn \d+|How do I earn/.test(f.host.textContent),'The mounted page switches all core UI copy into '+language+'.');
      check(f.host.querySelector('[data-club-action]').textContent.includes('31'),'Localized action keeps the numeric coin shortfall.');
      check(f.host.querySelector('[data-club-faq=coins]').hasAttribute('open'),'Changing language preserves an open FAQ.');
      check(f.active===f.host.querySelector('[data-club-faq=coins] summary'),'Changing language keeps focus on the matching FAQ.');
      for(const [key]of clubMembershipTranslationEntries)check(hasTranslation(key,language),'A complete authored '+language+' translation exists for '+key);
    }
    setLanguage('en');check(f.host.querySelector('h1').textContent==='A garage that feels like you.','Returning to English restores original copy.');f.view.destroy();
  }
  const css=fs.readFileSync(new URL('../public/club-membership.css',import.meta.url),'utf8');
  check(/\.club-membership\s*>\s*\.cm-hero\s*\{[^}]*position:\s*static/.test(css),'The page hero explicitly resets legacy fixed-header styles.');
  check(/@media\s*\(max-width:\s*760px\)/.test(css)&&/\.cm-plans\s*\{\s*grid-template-columns:\s*1fr/.test(css),'Plan cards have a single-column mobile layout.');
  check(/prefers-reduced-motion/.test(css),'Decorative transitions respect reduced motion.');
  check(timers.size===0,'All destroyed Club pages leave no timers behind.');
}finally{
  globalThis.Date=NativeDate;globalThis.setTimeout=nativeSetTimeout;globalThis.clearTimeout=nativeClearTimeout;
}
console.log(`Club membership: ${checks} checks passed (mounted purchases, account isolation, identity races, expiry, retries, low balance, translations, focus, FAQ state, timers and cleanup).`);
