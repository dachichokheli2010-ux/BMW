import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {mountNavigation} from '../public/navigation.js';

// Test controller behavior at the same widths used by the final CSS cascade.
// CSS geometry and browser-native modality still need real-browser visual QA.
const {document,window}=parseHTML('<html><body style="top:7px"><header class="site-header"><a class="brand" href="/">APEX</a><div class="header-tools"><div class="apex-select"><select id="language-select"><option>English</option></select></div><button id="theme-toggle">Theme</button></div></header><main></main></body></html>');
const location=new URL('https://apex.example/models');
let width=390,active=document.body,searches=0;
const queries=[],scrolls=[];
const mobileQuery=query=>({media:query,matches:query.includes('reduced-motion')||width<=1120,listeners:new Set(),addEventListener(_type,fn){this.listeners.add(fn);},removeEventListener(_type,fn){this.listeners.delete(fn);}});
Object.assign(globalThis,{document,window,location,matchMedia:query=>{const media=mobileQuery(query);queries.push(media);return media;}});
Object.defineProperty(document,'activeElement',{get:()=>active});
window.scrollY=640;window.scrollTo=value=>scrolls.push(value);
window.HTMLElement.prototype.focus=function(){active=this;};
window.HTMLElement.prototype.getClientRects=function(){return this.classList.contains('mobile-menu-toggle')&&width>1120?[]:[{}];};
window.HTMLElement.prototype.showModal=function(){this.open=true;this.setAttribute('open','');};
// Real dialogs queue their close event; model that ordering explicitly.
window.HTMLElement.prototype.close=function(){this.open=false;this.removeAttribute('open');queueMicrotask(()=>this.dispatchEvent(new window.Event('close')));};
function resize(value){width=value;for(const query of queries){const matches=query.media.includes('reduced-motion')||width<=1120;if(query.matches!==matches){query.matches=matches;for(const listener of query.listeners)listener();}}}
const navigation=mountNavigation({openSearch(){searches++;}});
const trigger=document.querySelector('.mobile-menu-toggle'),menu=document.querySelector('.mobile-navigation'),language=document.querySelector('.apex-select'),theme=document.querySelector('#theme-toggle');
const open=()=>{trigger.focus();trigger.click();};
const selected=()=>[...menu.querySelectorAll('[aria-current="page"]')].map(link=>link.getAttribute('href'));

for(const mobileWidth of [320,390,1120]){
  resize(mobileWidth);assert.equal(language.closest('.mobile-navigation'),menu);assert.equal(theme.closest('.mobile-navigation'),menu);
  open();assert.equal(menu.open,true);assert.equal(trigger.getAttribute('aria-expanded'),'true');
  assert.equal(document.body.style.top,'-640px');assert.equal(active,menu.querySelector('[data-menu-close]'));
  menu.querySelector('[data-menu-close]').click();
  assert.equal(menu.open,false);assert.equal(document.body.classList.contains('navigation-open'),false);
  assert.equal(document.body.style.top,'7px');assert.deepEqual(scrolls.at(-1),{top:640,behavior:'instant'});assert.equal(active,trigger);
  await Promise.resolve();
}
open();navigation.close(true);open();await Promise.resolve();
assert.equal(menu.open,true,'A queued close event cannot unlock a reopened menu');
assert.equal(document.body.classList.contains('navigation-open'),true);
for(const desktopWidth of [1121,1200,1440]){
  resize(desktopWidth);assert.equal(menu.open,false);assert.equal(document.body.classList.contains('navigation-open'),false);
  assert.equal(language.closest('.header-tools'),document.querySelector('.header-tools'),'Resizing restores the entire enhanced language control');
  assert.equal(theme.closest('.header-tools'),document.querySelector('.header-tools'));
}
resize(390);
for(const [path,href] of [['/cars/f10-m5','/models'],['/engines/s63','/engines'],['/parts/turbocharger','/parts'],['/lessons/turbocharging','/learn'],['/glossary','/learn'],['/glossary/turbocharger','/learn'],['/badges','/play'],['/badges/first-lap','/play'],['/community/cars/owner-car','/community'],['/garage/shared-owner','/my-garage'],['/generation-guides','/generation-guides'],['/account','/account'],['/login','/account'],['/signup','/account']]){
  location.pathname=path;window.dispatchEvent(new window.Event('popstate'));assert.deepEqual(selected(),[href],path+' selects its current destination');
}
open();menu.querySelector('.mn-search').click();await Promise.resolve();await Promise.resolve();
assert.equal(menu.open,false);assert.equal(searches,1,'Menu search dismisses its modal before opening search');
open();navigation.destroy();assert.equal(document.body.classList.contains('navigation-open'),false);assert.equal(document.querySelector('.mobile-navigation'),null);assert.equal(document.querySelector('.header-tools').contains(language),true);
await Promise.resolve();

for(const filename of ['index.html','electric.html','parts.html','about.html']){
  const {document:page}=parseHTML(await fs.readFile(new URL('../public/'+filename,import.meta.url),'utf8'));
  const sheets=[...page.querySelectorAll('link[rel=stylesheet]')].map(link=>link.getAttribute('href'));
  assert.ok(sheets.indexOf('liquid-glass.css')>sheets.indexOf('header-upgrade.css'),filename+' preserves the final responsive header cascade');
}
console.log('PASS Responsive navigation: 320/390/1120px controls, 1121/1200/1440px restoration, queued close/reopen, focus, scroll lock, history routes, menu search, cleanup and all four page style orders (DOM simulation).');
