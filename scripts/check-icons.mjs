import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {icon,iconNames,mountIcons} from '../public/icons.js';
import {registerTranslations,setLanguage} from '../public/preferences.js';

const required=['external','next','back','engine','piston','spark','turbo','gearbox','brake','wheel','suspension','exhaust','radiator','battery','steering','key','speedometer','tachometer','oil','headlight','charging','favorite','compare','share','garage','search','filter','language','user','quiz','sound','check','star','close','loading','offline'];
for(const name of required){assert.ok(iconNames.includes(name),name);const svg=icon(name);assert.match(svg,/viewBox="0 0 24 24"/);assert.match(svg,/stroke-width="1.5"/);assert.match(svg,/stroke="currentColor"/);assert.match(svg,/stroke-linecap="round"/);assert.match(svg,/stroke-linejoin="round"/);assert.match(svg,/aria-hidden="true"/);}
assert.throws(()=>icon('unpublished-icon'));assert.match(icon('engine',{label:'A "label" <script>'}),/aria-label="A &quot;label&quot; &lt;script&gt;"/);

registerTranslations([['Open source ↗','წყაროს გახსნა ↗','Открыть источник ↗']]);
const {document,window}=parseHTML('<!doctype html><html><body><button id="source">Open source ↗</button><button id="close">×</button><p id="dimensions">400 × 36 mm − 10</p><code>→ 🏆</code><select><option>Next →</option></select><div class="search-empty"><h2>No matches</h2></div><span class="loading-orbit"></span></body></html>');
const queue=[];window.requestAnimationFrame=callback=>{queue.push(callback);return queue.length;};
const ui=mountIcons(document);
assert.equal(document.querySelector('#source [data-apex-icon]').dataset.apexIcon,'external');assert.equal(document.querySelector('#close').getAttribute('aria-label'),'Close');assert.equal(document.querySelector('#close [data-apex-icon]').dataset.apexIcon,'close');assert.equal(document.querySelector('#dimensions').textContent,'400 × 36 mm − 10');assert.equal(document.querySelector('code').textContent,'→ 🏆');assert.equal(document.querySelector('option').textContent,'Next →');
assert.equal(document.querySelectorAll('[data-apex-empty]').length,1);assert.equal(document.querySelectorAll('[data-apex-loader]').length,1);
const initial=document.body.innerHTML;ui.refresh();assert.equal(document.body.innerHTML,initial,'Decoration must be idempotent.');
for(const [language,expected]of [['ka','წყაროს გახსნა'],['ru','Открыть источник'],['en','Open source']]){setLanguage(language,false);window.dispatchEvent(new window.Event('apex:languagechange'));assert.match(document.querySelector('#source').textContent,new RegExp(expected));assert.equal(document.querySelectorAll('#source [data-apex-icon]').length,1);}
const child=document.createElement('button');child.textContent='🏆';document.body.append(child);await Promise.resolve();await Promise.resolve();assert.ok(queue.length<=1);while(queue.length)queue.shift()();await Promise.resolve();await Promise.resolve();assert.equal(queue.length,0,'Our own replacement must not create an observer loop.');assert.ok(child.querySelector('[data-apex-icon="quiz"]'));assert.ok(child.getAttribute('aria-label'));
ui.destroy();setLanguage('en',false);
console.log(`Icons: ${iconNames.length} original SVG symbols; translation, numeric/source preservation, accessibility and mutation-loop checks passed.`);
