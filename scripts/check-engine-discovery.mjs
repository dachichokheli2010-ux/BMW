import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {parseHTML} from 'linkedom';
import {engineRecords,getEngineRecord} from '../public/explorer-data.js';
import {searchEngines,engineLayoutKey,mountEngineDirectory} from '../public/engine-directory.js';
import {setLanguage,translatePage,t,hasTranslation} from '../public/preferences.js';

registerHooks({resolve(specifier,context,next){return next(specifier==='three'?new URL('../public/vendor/three.module.min.js',import.meta.url).href:specifier,context);}});
const {mountEngineLab,ENGINE_LAB_TOURS,ENGINE_LAB_STROKES,ENGINE_LAB_PARTS}=await import('../public/engine-lab.js');

function fixture(){
 const {window,document}=parseHTML('<html lang="en"><head></head><body><main></main></body></html>');
 Object.assign(globalThis,{window,document,Element:window.Element,HTMLElement:window.HTMLElement,HTMLImageElement:window.HTMLImageElement,CustomEvent:window.CustomEvent,requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{}});
 window.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
 Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){return this.querySelector('option[selected]')?.value||this.querySelector('option')?.value||'';},set(value){for(const option of this.querySelectorAll('option')){if(option.value===String(value))option.setAttribute('selected','');else option.removeAttribute('selected');}}});
 return {window,document,host:document.querySelector('main')};
}

assert.equal(engineLayoutKey(getEngineRecord('b58')),'inline-six');
assert.equal(engineLayoutKey(getEngineRecord('B38 + eDrive')),'inline-three');
assert.equal(engineLayoutKey(getEngineRecord('edrive')),'electric');
assert.ok(searchEngines('straight 6').some(record=>record.code==='B58'));
assert.ok(searchEngines('V-8','m','v8').some(record=>record.code==='S65'));
assert.ok(searchEngines('','hybrid','v8').every(record=>record.kind==='hybrid'&&engineLayoutKey(record)==='v8'));
assert.ok(searchEngines('','all','inline-four').length>1);
assert.deepEqual(searchEngines('','electric','v8'),[]);

let {host,window,document}=fixture();
const directory=mountEngineDirectory(host),click=selector=>{const button=host.querySelector(selector);assert.ok(button,selector);assert.equal(button.disabled,false,selector+' enabled');button.click();};
assert.equal(host.querySelector('.ed-starter'),null,'The former starter does not duplicate the new discovery paths');
assert.ok(host.querySelector('[data-ed-search]'));
assert.equal(host.querySelectorAll('.ed-card').length,engineRecords.length);
click('[data-ed-topic="inline-six"]');
assert.equal(host.querySelector('[data-ed-layout]').value,'inline-six');
assert.ok([...host.querySelectorAll('.ed-card')].every(card=>engineLayoutKey(getEngineRecord(card.getAttribute('href').split('/').at(-1)))==='inline-six'));
click('[data-ed-reset]');
click('[data-ed-grid] [data-ed-compare="b58"]');
assert.equal(host.querySelector('[data-ed-compare-panel]').hidden,false);
click('[data-ed-grid] [data-ed-compare="s65"]');
assert.equal(host.querySelectorAll('[data-ed-compare-panel] thead th').length,3);
assert.equal(host.querySelector('[data-ed-grid] [data-ed-compare="s58"]').disabled,true,'Only two families can be shortlisted');
assert.match(host.querySelector('[data-ed-compare-panel]').textContent,/do not establish full family ranges/);
const search=host.querySelector('[data-ed-search]');search.value='S58';search.dispatchEvent(new window.Event('input'));
assert.equal(host.querySelectorAll('.ed-card').length,1);
assert.equal(host.querySelectorAll('[data-ed-compare-panel] thead th').length,3,'Filtering does not discard selected families');
click('[data-ed-compare-panel] [data-ed-compare="b58"]');
assert.equal(host.querySelector('[data-ed-grid] [data-ed-compare="s58"]').disabled,false);
click('[data-ed-clear-compare]');assert.equal(host.querySelector('[data-ed-compare-panel]').hidden,true);
directory.destroy();host.replaceChildren();

let selected=[];const warnings=[],previousWarn=console.warn;console.warn=(...args)=>warnings.push(args);
const lab=mountEngineLab(host,{onSelect:part=>selected.push(part.id)});console.warn=previousWarn;
assert.equal(lab.ready,false,'The fixture intentionally provides no WebGL context');
assert.ok(host.querySelector('.el-no-webgl'));
assert.equal(host.querySelectorAll('.el-intro h1').length,1);
assert.equal(host.querySelector('.el-fallback').hidden,false);
assert.ok([...host.querySelectorAll('[data-camera]')].every(button=>button.disabled),'Unavailable 3D camera controls stay disabled');
assert.ok(host.querySelector('.el-workspace').nextElementSibling.classList.contains('el-cycle-lesson'),'The actual viewer appears before the optional stroke lesson');
const partIds=new Set(ENGINE_LAB_PARTS.map(part=>part.id));
for(const tour of ENGINE_LAB_TOURS){
 assert.ok(tour.steps.every(step=>partIds.has(step.part)));
 click(`[data-tour="${tour.id}"]`);
 assert.equal(selected.at(-1),tour.steps[0].part);
 assert.equal(host.querySelector('[data-tour-prev]').disabled,true);
 for(let index=1;index<tour.steps.length;index++){
  click('[data-tour-next]');assert.equal(selected.at(-1),tour.steps[index].part);
  assert.equal(host.querySelector('select[aria-label="Show an educational fluid flow path"]').value,tour.steps[index].flow);
 }
 assert.equal(host.querySelector('[data-tour-next]').disabled,true);
 click('[data-tour-prev]');assert.equal(selected.at(-1),tour.steps.at(-2).part);
}
click('[data-tour-exit]');assert.equal(host.querySelector('.el-tour-current').hidden,true);
click('[data-tour="boost"]');click('.el-parts [data-part="block"]');assert.equal(host.querySelector('.el-tour-current').hidden,true,'Manual part selection leaves the guided sequence');
assert.equal(lab.selectTour('missing'),false);
for(let index=0;index<ENGINE_LAB_STROKES.length;index++){
 click(`button[data-stroke="${index}"]`);
 assert.equal(host.querySelector('.engine-lab').dataset.stroke,String(index));
 assert.equal(host.querySelector('.el-stroke-name').textContent,ENGINE_LAB_STROKES[index].name);
 assert.equal(host.querySelector(`button[data-stroke="${index}"]`).getAttribute('aria-pressed'),'true');
}
assert.equal(lab.stepStroke(4),false);assert.equal(lab.stepStroke(-1),false);
for(const locale of ['ka','ru']){
 setLanguage(locale,false);translatePage();
 assert.equal(host.querySelector('.el-stroke-name').textContent,t('Exhaust stroke'));
 for(const tour of ENGINE_LAB_TOURS){assert.ok(hasTranslation(tour.name,locale));assert.ok(hasTranslation(tour.intro,locale));for(const step of tour.steps)assert.ok(hasTranslation(step.title,locale));}
 for(const stroke of ENGINE_LAB_STROKES){assert.ok(hasTranslation(stroke.text,locale));assert.ok(hasTranslation(stroke.movement,locale));}
 for(const label of ['Every layout','Cylinder layout','Clear comparison','Retained displacement values','Choose one more engine below to compare two families.'])assert.ok(hasTranslation(label,locale));
}
setLanguage('en',false);lab.reset();assert.equal(host.querySelector('.engine-lab').dataset.stroke,'0');assert.equal(host.querySelector('.el-tour-current').hidden,true);
lab.destroy();assert.equal(host.children.length,0);assert.equal(lab.selectTour('motion'),false);assert.equal(lab.stepStroke(0),false);
console.log('Engine discovery passed: layout and alias search, bounded comparison, filter persistence, all guided paths, manual four-stroke steps, no-WebGL accessibility, bilingual copy, reset and disposal.');
