import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {encyclopediaParts,partsImageManifest} from '../public/parts-encyclopedia-data.js';
import {mountPartsEncyclopedia} from '../public/parts-encyclopedia.js';

// Catch accidental Windows legacy-codepage decoding before it reaches the UI.
const ownedFiles=['public/parts-encyclopedia.js','public/parts-encyclopedia-data.js','public/parts-encyclopedia.css','scripts/check-parts-encyclopedia.mjs','public/parts-image-manifest.json','reports/parts-image-manifest.json'];
for(const file of ownedFiles){
  const text=await fs.readFile(new URL(`../${file}`,import.meta.url),'utf8');
  assert.doesNotMatch(text,/\u00c3[\u0080-\u00ff\u0100-\u2040]|\u00c2[\u0080-\u00bf]|\u00e2[\u0080-\u00bf\u2010-\u203a]|\ufffd/,`${file}: corrupted UTF-8 text`);
}

const ids=new Set(encyclopediaParts.map(part=>part.id));
assert.ok(encyclopediaParts.length>=150,'At least 150 distinct component guides');
assert.equal(ids.size,encyclopediaParts.length,'Part IDs must be unique');
const required=['id','name','system','summary','analogy','location','technical','symptoms','bmwFact','zone','usedIn','lifespan','cost','url','verification'];
for(const part of encyclopediaParts){
  for(const field of required)assert.ok(typeof part[field]==='string'&&part[field].trim(),`${part.id}: missing ${field}`);
  assert.equal(part.url,`/parts/${part.id}`);
  assert.match(part.id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(part.sources.length>0&&part.sources.every(source=>new URL(source.url).protocol==='https:'));
  assert.ok(part.related.length>=2&&part.related.every(id=>ids.has(id)&&id!==part.id));
  assert.equal(new Set(part.related).size,part.related.length,`${part.id}: duplicate related guides`);
  if(part.photo)await fs.access(new URL(`../public/${part.photo.src}`,import.meta.url));
  else assert.equal(part.imageStatus,'educational-diagram');
}
assert.equal(new Set(encyclopediaParts.map(part=>part.technical)).size,encyclopediaParts.length,'Each technical explanation is distinct');
assert.equal(new Set(encyclopediaParts.map(part=>part.analogy)).size,encyclopediaParts.length,'Each analogy is distinct');
assert.equal(partsImageManifest.length,encyclopediaParts.length);
for(const image of partsImageManifest){assert.ok(ids.has(image.id));assert.ok(new URL(image.suggestedSearch).hostname==='commons.wikimedia.org');}

const {window,document}=parseHTML('<html><body><main id="mount"></main></body></html>');
globalThis.window=window;globalThis.document=document;
// Linkedom exposes a read-only select.value; emulate the browser setter for UI events.
const selectValue=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value');
Object.defineProperty(window.HTMLSelectElement.prototype,'value',{...selectValue,set(value){for(const option of this.querySelectorAll('option'))option.selected=option.getAttribute('value')===value;}});
let reduced=false,intervalCallback=null,intervals=0,clears=0;
window.matchMedia=()=>({get matches(){return reduced;},addEventListener(){},removeEventListener(){}});
window.setInterval=callback=>{intervalCallback=callback;intervals++;return intervals;};
window.clearInterval=()=>{intervalCallback=null;clears++;};
const click=element=>{assert.ok(element);element.dispatchEvent(new window.Event('click',{bubbles:true}));};
const control=mountPartsEncyclopedia(document.querySelector('#mount'));
assert.equal(document.querySelectorAll('.pe-card').length,24,'Initial batch is bounded');
assert.equal(document.querySelector('[data-pe-count]').textContent,'182 parts');
click(document.querySelector('[data-pe-more]'));
assert.equal(document.querySelectorAll('.pe-card').length,48);
const search=document.querySelector('[data-pe-search]');search.value='VANOS';search.dispatchEvent(new window.Event('input',{bubbles:true}));
assert.ok(document.querySelectorAll('.pe-card').length>0);
assert.ok(document.querySelector('[data-pe-grid]').textContent.includes('VANOS'));
search.value='unfindable-component-xyz';search.dispatchEvent(new window.Event('input',{bubbles:true}));
assert.ok(document.querySelector('.pe-empty'));
click(document.querySelector('[data-pe-reset]'));
assert.equal(document.querySelectorAll('.pe-card').length,24);
const category=document.querySelector('[data-pe-system]');category.value='Electric drive & charging';category.dispatchEvent(new window.Event('change',{bubbles:true}));
assert.equal(document.querySelectorAll('.pe-card').length,17,'System selection narrows the registry');
assert.ok([...document.querySelectorAll('.pe-card-copy .eyebrow')].every(element=>element.textContent==='Electric drive & charging'));
click(document.querySelector('[data-pe-reset]'));
for(const scene of ['engine','underbody','cabin']){
  click(document.querySelector(`[data-pe-scene="${scene}"]`));
  assert.equal(document.querySelectorAll('.pe-hotspot').length,6);
  for(const link of document.querySelectorAll('.pe-hotspot'))assert.ok(ids.has(link.getAttribute('href').split('/').pop()));
}
click(document.querySelector('[data-pe-stroke="2"]'));
assert.match(document.querySelector('[data-pe-stroke-copy]').textContent,/Power/);
click(document.querySelector('[data-pe-play]'));assert.ok(intervalCallback);intervalCallback();
assert.equal(document.querySelector('[data-pe-stroke="3"]').getAttribute('aria-pressed'),'true');
click(document.querySelector('[data-pe-play]'));assert.equal(intervalCallback,null);assert.ok(clears>0);
const photo=document.querySelector('img[data-pe-photo]');photo.dispatchEvent(new window.Event('error'));assert.equal(photo.hidden,true);assert.equal(photo.nextElementSibling.hidden,false);
for(const part of encyclopediaParts){assert.equal(control.open(part.id),true);assert.equal(document.querySelector('.pe-detail h1').textContent,part.name);assert.ok(document.querySelector('.pe-related-grid a'));}
assert.equal(control.open('missing-component'),false);assert.ok(document.querySelector('a[href="/parts"]'));
control.render();reduced=true;const before=intervals;click(document.querySelector('[data-pe-play]'));assert.equal(intervals,before,'Reduced motion never starts autoplay');assert.equal(document.querySelector('[data-pe-stroke="1"]').getAttribute('aria-pressed'),'true');
control.destroy();assert.equal(document.querySelector('.parts-encyclopedia'),null);

if(process.argv.includes('--write')){
  const manifest={generatedAt:'2026-10-20',scope:'Exact BMW photography coverage; generic references remain explicitly labeled.',summary:{parts:encyclopediaParts.length,identifiedBmwReferences:1,genericReferences:7,educationalDiagrams:174,missingExactBmwPhotos:181},items:partsImageManifest};
  await Promise.all(['../public/parts-image-manifest.json','../reports/parts-image-manifest.json'].map(path=>fs.writeFile(new URL(path,import.meta.url),JSON.stringify(manifest,null,2)+'\n')));
}
console.log(`Parts encyclopedia: ${encyclopediaParts.length} complete learning records; search, filtering, all detail pages, photo fallback, X-ray links and reduced-motion controls passed.`);
console.log('Photography: 1 identified BMW reference, 7 generic references, 174 educational diagrams; 181 exact BMW component photos still required.');
