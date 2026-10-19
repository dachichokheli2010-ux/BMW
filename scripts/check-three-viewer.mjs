import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {allModels} from '../public/catalog.js';
import {threeModels} from '../public/three-models.js';
import {mountThreeViewer} from '../public/three-viewer.js';

assert.equal(Object.keys(threeModels).length,12);
for(const [id,model]of Object.entries(threeModels)){
 assert.ok(allModels.some(car=>car.id===id),id);
 assert.match(model.uid,/^[a-f\d]{32}$/);assert.equal(new URL(model.embed).hostname,'sketchfab.com');
 assert.equal(new URL(model.embed).pathname,'/models/'+model.uid+'/embed');
 assert.equal(new URL(model.source).hostname,'sketchfab.com');assert.ok(model.author&&model.authorUrl&&model.note&&model.thumbnail);
}
const {document,window}=parseHTML('<div id="player"></div><div id="entry"></div><button id="load"></button><button id="retry"></button><p id="status"></p>');
const $=id=>document.getElementById(id),callbacks=new Map();let next=0,active=true,model=threeModels['f92-m8'];
const viewer=mountThreeViewer({player:$('player'),entry:$('entry'),button:$('load'),retry:$('retry'),status:$('status'),getModel:()=>model,isActive:()=>active,setTimer:fn=>{callbacks.set(++next,fn);return next;},clearTimer:id=>callbacks.delete(id)});
assert.equal($('player').querySelector('iframe'),null,'A page visit never auto-loads a third-party viewer');
$('load').click();let frame=$('player').querySelector('iframe');assert.ok(frame);assert.equal($('player').getAttribute('aria-busy'),'true');assert.equal($('entry').hidden,true);assert.equal(callbacks.size,1);
frame.dispatchEvent(new window.Event('load'));assert.equal(callbacks.size,0);assert.equal($('status').hidden,true);assert.equal($('player').getAttribute('aria-busy'),'false');
$('retry').click();frame=$('player').querySelector('iframe');assert.equal($('player').querySelectorAll('iframe').length,1);const [timeout,callback]=callbacks.entries().next().value;callbacks.delete(timeout);callback();assert.match($('status').textContent,/Still loading/);assert.equal($('status').hidden,false);
viewer.clear();assert.equal($('player').querySelector('iframe'),null);assert.equal($('entry').hidden,false);assert.equal($('retry').hidden,true);assert.equal(callbacks.size,0);
$('load').click();frame=$('player').querySelector('iframe');frame.dispatchEvent(new window.Event('error'));assert.equal($('entry').hidden,false);assert.match($('status').textContent,/could not load/);assert.equal(callbacks.size,0);
viewer.clear();active=false;assert.equal(viewer.load(),false);active=true;model=null;assert.equal(viewer.load(),false);
viewer.destroy();console.log('PASS 3D viewer: 12 credited models, click-to-load, ready, timeout, retry, error and disposal.');
