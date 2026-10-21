import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {mountNavigation} from '../public/navigation.js';

// Test controller behavior at the same widths used by the final CSS cascade.
// CSS geometry and browser-native modality still need real-browser visual QA.
const {document,window}=parseHTML('<html><body style="top:7px"><header class="site-header"><a class="brand" href="/">Motron</a><div class="header-tools"><div class="apex-select"><select id="language-select"><option>English</option></select></div><button id="theme-toggle">Theme</button></div></header><main></main></body></html>');
const location=new URL('https://apex.example/models');
let width=390,active=document.body,searches=0,reducedMotion=true;
const queries=[],scrolls=[];
const mobileQuery=query=>({media:query,matches:query.includes('reduced-motion')?reducedMotion:width<=1280,listeners:new Set(),addEventListener(_type,fn){this.listeners.add(fn);},removeEventListener(_type,fn){this.listeners.delete(fn);}});
Object.assign(globalThis,{document,window,location,matchMedia:query=>{const media=mobileQuery(query);queries.push(media);return media;}});
Object.defineProperty(document,'activeElement',{get:()=>active});
window.scrollY=640;window.scrollTo=value=>scrolls.push(value);
window.HTMLElement.prototype.focus=function(){active=this;};
window.HTMLElement.prototype.getClientRects=function(){return this.classList.contains('mobile-menu-toggle')&&width>1280?[]:[{}];};
window.HTMLElement.prototype.showModal=function(){this.open=true;this.setAttribute('open','');};
// Real dialogs queue their close event; model that ordering explicitly.
window.HTMLElement.prototype.close=function(){this.open=false;this.removeAttribute('open');queueMicrotask(()=>this.dispatchEvent(new window.Event('close')));};
function resize(value){width=value;for(const query of queries){const matches=query.media.includes('reduced-motion')?reducedMotion:width<=1280;if(query.matches!==matches){query.matches=matches;for(const listener of query.listeners)listener();}}}
const navigation=mountNavigation({openSearch(){searches++;}});
const trigger=document.querySelector('.mobile-menu-toggle'),menu=document.querySelector('.mobile-navigation'),language=document.querySelector('.apex-select'),theme=document.querySelector('#theme-toggle');
const open=()=>{trigger.focus();trigger.click();};
const selected=()=>[...menu.querySelectorAll('[aria-current="page"]')].map(link=>link.getAttribute('href'));

for(const mobileWidth of [320,360,390,667,844,1100,1120,1121,1200,1280]){
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
for(const desktopWidth of [1281,1366,1440]){
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
// A touch can arrive again while the close animation is pending. It must not
// launch two overlays, or resurrect search after the owning page is destroyed.
reducedMotion=false;resize(390);open();
menu.querySelector('.mn-search').click();menu.querySelector('.mn-search').click();
assert.equal(menu.open,true);assert.equal(menu.classList.contains('is-closing'),true);
await navigation.close(true);await Promise.resolve();await Promise.resolve();
assert.equal(searches,2,'Repeated taps during animated dismissal open search exactly once');
open();menu.querySelector('.mn-search').click();navigation.destroy();
assert.equal(document.body.classList.contains('navigation-open'),false);assert.equal(document.querySelector('.mobile-navigation'),null);assert.equal(document.querySelector('.header-tools').contains(language),true);
await Promise.resolve();await Promise.resolve();
assert.equal(searches,2,'Destroying the menu cancels a pending search launch');
trigger.click();navigation.destroy();assert.equal(menu.open,false,'A disposed controller cannot reopen from a retained trigger');
await Promise.resolve();

for(const filename of ['index.html','electric.html','parts.html','about.html']){
  const {document:page}=parseHTML(await fs.readFile(new URL('../public/'+filename,import.meta.url),'utf8'));
  const sheets=[...page.querySelectorAll('link[rel=stylesheet]')].map(link=>link.getAttribute('href'));
  assert.ok(sheets.indexOf('liquid-glass.css')>sheets.indexOf('header-upgrade.css'),filename+' preserves the final responsive header cascade');
}
const helperStyles=await fs.readFile(new URL('../public/site-helper.css',import.meta.url),'utf8');
assert.ok(helperStyles.includes('@media(max-width:760px){body:has(.account-page) .site-helper-trigger{display:none}}'),'The floating helper must not cover the account page on mobile');
const glassStyles=await fs.readFile(new URL('../public/liquid-glass.css',import.meta.url),'utf8');
const mobileStyles=await fs.readFile(new URL('../public/mobile.css',import.meta.url),'utf8');
assert.match(mobileStyles,/@media\(max-width:1280px\)\{\s*body\.navigation-open\{position:fixed/,'Scroll locking uses the same 1280px breakpoint as the controller and final header');
assert.match(glassStyles,/padding-left: max\(var\(--page-pad\), env\(safe-area-inset-left/,'Landscape content respects the left display cutout');
assert.match(glassStyles,/padding-right: max\(var\(--page-pad\), env\(safe-area-inset-right/,'Landscape content respects the right display cutout');
assert.match(glassStyles,/\.hero \.hero-kicker > span:not\(\.live-dot\) \{[^}]*min-width: 0;[^}]*white-space: normal;[^}]*overflow-wrap: anywhere;/,'The narrow hero eyebrow can shrink and wrap independently of its decorative dot');
assert.match(glassStyles,/max-height: min\(90dvh, calc\(100dvh - max\(8px,env\(safe-area-inset-top,0px\)\) - max\(8px,env\(safe-area-inset-bottom,0px\)\)\)\)/,'The phone menu fits between both vertical safe areas in a short viewport');
assert.ok(glassStyles.includes('body:has(.account-page) .glass-bottom-nav { display: none; }'),'The fixed quick navigation must not cover account controls on mobile');
assert.ok(glassStyles.includes('body:has(.motron-learn .ac-player) .glass-bottom-nav { display: none; }'),'The fixed quick navigation must not cover the active Motron lesson action bar on mobile');
console.log('PASS Responsive navigation: 320/360/390/667/844/1100/1120/1121/1200/1280px controls, desktop restoration, queued close/reopen, focus, scroll lock, history routes, animated search deduplication/cancellation, safe-area CSS contracts and all four page style orders (DOM simulation; browser geometry not measured).');
