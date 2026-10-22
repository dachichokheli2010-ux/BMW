import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {parseHTML} from 'linkedom';
import {allModels} from '../public/catalog.js';
import {engineRecords,carRecords,getEngineRecord,engineURL,carURL,createExplorerAudit,currentLineupCoverage} from '../public/explorer-data.js';
import {searchEngines,renderEngineDirectoryPage,mountEngineDirectory} from '../public/engine-directory.js';
import {validateExplorerRegistry,normalizePartsForAudit,loadAuditParts} from './check-completeness.mjs';

let groups=0;
function check(name,fn){fn();groups++;console.log('PASS Explorer: '+name);}
const before=JSON.stringify(allModels);
const parts=await loadAuditParts();

check('all retained cars have unique clean URLs and an exact engine-code destination',()=>{
  assert.equal(carRecords.length,93);assert.equal(engineRecords.length,30);
  assert.equal(new Set(carRecords.map(record=>record.url)).size,93);
  assert.equal(new Set(engineRecords.map(record=>record.url)).size,30);
  for(const model of allModels){
    const record=carRecords.find(record=>record.id===model.id),engine=getEngineRecord(model.code);
    assert.ok(record&&engine);assert.equal(record.engineId,engine.id);assert.equal(record.url,carURL(model.id));
    assert.equal(engineURL(model.code),engine.url);assert.ok(engine.applications.some(item=>item.id===model.id));
    for(const field of model.profile.sections.flatMap(section=>section.fields))assert.deepEqual(record.fields.find(item=>item.id===field.id),field);
  }
  for(const record of engineRecords){assert.ok(record.fields.find(field=>field.id==='funFact').value,record.code+' needs an engine fact');assert.ok(record.fields.find(field=>field.id==='strengths').value,record.code+' needs a design guide');assert.ok(parts.some(part=>part.id===record.relatedPart),record.code+' has a real connected part');}
  assert.notEqual(engineURL('S63'),engineURL('S63TU'));
  assert.notEqual(engineURL('M88'),engineURL('M88/3'));
  assert.notEqual(engineURL('S54'),engineURL('S54B32'));
});

check('application power and EV identity cannot become a guessed universal engine specification',()=>{
  const s58=getEngineRecord('S58'),s65=getEngineRecord('S65'),hybrid=getEngineRecord('S68 + eDrive'),electric=getEngineRecord('eDrive');
  const g80=s58.applications.find(item=>item.id==='g80'),e92=s65.applications.find(item=>item.id==='e92');
  assert.equal(g80.power,503);assert.equal(g80.powerUnit,'hp');assert.equal(e92.power,420);assert.equal(e92.powerUnit,'PS');
  assert.match(hybrid.fields.find(field=>field.id==='power').label,/Combined vehicle/);
  assert.equal(electric.applications.length,16);assert.ok(electric.applications.every(item=>item.powertrain==='Electric'));
  const displacement=electric.fields.find(field=>field.id==='displacement');assert.equal(displacement.status,'not-applicable');assert.equal(displacement.value,null);
  for(const record of engineRecords)assert.equal(record.fields.find(field=>field.id==='productionYears').value,null);
  assert.equal(getEngineRecord('S63TU').photoStatus,'available');assert.equal(getEngineRecord('S63TU').photos[0].matchStatus,'engine-family-reference');assert.ok(getEngineRecord('S63').photos.length);
});

check('evidence validation catches fabricated values, false cross-checks and unknown applications',()=>{
  assert.deepEqual(validateExplorerRegistry({parts}),[]);
  const s58=structuredClone(getEngineRecord('s58'));s58.fields.find(field=>field.id==='displacement').sources.length=1;
  assert.ok(validateExplorerRegistry({engines:[s58]}).some(error=>error.includes('two distinct source')));
  const unknown=structuredClone(getEngineRecord('n55'));unknown.fields.find(field=>field.id==='weaknesses').value='A guessed issue';
  assert.ok(validateExplorerRegistry({engines:[unknown]}).some(error=>error.includes('guessed value')));
  const badApplication=structuredClone(getEngineRecord('b58'));badApplication.applications.push({id:'fabricated-car'});
  assert.ok(validateExplorerRegistry({engines:[badApplication]}).some(error=>error.includes('unknown application')));
});

check('the audit lists genuine field/photo gaps and recognises missing current generations',()=>{
  const report=createExplorerAudit({parts});assert.deepEqual(createExplorerAudit({parts}),report);assert.equal(report.totals.complete,false);
  assert.ok(report.needsReview.some(item=>item.kind==='car'&&item.field==='designer'&&item.reason==='missing-field'));
  assert.ok(report.needsReview.some(item=>item.kind==='car'&&item.id==='e92'&&item.reason==='second-source-required'));
  assert.ok(report.missingImages.some(item=>item.kind==='car'&&item.id==='f10-m5'&&item.slot==='engine'));
  assert.ok(engineRecords.every(record=>record.photos.length),'Every indexed engine/drive entry has a credited photograph');
  assert.equal(getEngineRecord('edrive').photos[0].referenceCode,'eDrive');assert.match(getEngineRecord('edrive').photos[0].caption,/BMW i3.*2013/);
  assert.ok(report.missingImages.every(item=>new URL(item.search).hostname==='commons.wikimedia.org'));
  assert.match(currentLineupCoverage.find(row=>row.family==='i3').gap,/different vehicle/);
  assert.match(currentLineupCoverage.find(row=>row.family==='iX3').gap,/older generation/);
  const part=normalizePartsForAudit([{id:'example',name:'Example',summary:'A description.',sources:[{url:'https://example.com/fact'}]}])[0];
  assert.equal(part.fields.find(field=>field.id==='summary').status,'source-linked');assert.equal(part.fields.find(field=>field.id==='cost').value,null);
});

check('engine discovery supports beginner searches and leaves a useful empty state',()=>{
  assert.ok(searchEngines('V8','m').some(record=>record.code==='S65'));
  assert.ok(searchEngines('E46').some(record=>record.code==='S54'));
  assert.ok(searchEngines('Z4 M40i').some(record=>record.code==='B58'));
  assert.deepEqual(searchEngines('nothing-like-a-real-code'),[]);
  assert.deepEqual(searchEngines('','electric').map(record=>record.code),['eDrive']);
  const {document,window}=parseHTML('<html><body><main></main></body></html>');
  globalThis.HTMLImageElement=window.HTMLImageElement;
  const container=document.querySelector('main'),cleanup=mountEngineDirectory(container);
  assert.equal(typeof cleanup.destroy,'function','The platform lifecycle must be able to dispose an engine page.');
  // linkedom has a getter-only select.value; browsers provide the setter.
  Object.defineProperty(container.querySelector('[data-ed-kind]'),'value',{value:'all',writable:true});
  Object.defineProperty(container.querySelector('[data-ed-layout]'),'value',{value:'all',writable:true});
  assert.equal(container.querySelectorAll('.ed-card').length,30);
  const input=container.querySelector('[data-ed-search]');input.value='S58';input.dispatchEvent(new window.Event('input'));
  assert.equal(container.querySelectorAll('.ed-card').length,1);assert.equal(container.querySelector('.ed-card').getAttribute('href'),'/engines/s58');
  input.value='no-such-family';input.dispatchEvent(new window.Event('input'));assert.equal(container.querySelector('[data-ed-empty]').hidden,false);
  container.querySelector('[data-ed-reset]').click();assert.equal(container.querySelectorAll('.ed-card').length,30);cleanup();
});

check('detail pages retain real credits and root-relative responsive image URLs',()=>{
  const {document}=parseHTML(renderEngineDirectoryPage('s65'));
  const image=document.querySelector('.ed-detail-photo img');assert.ok(image);assert.ok(image.getAttribute('src').startsWith('/images/'));
  for(const candidate of image.getAttribute('srcset').split(', '))assert.ok(candidate.startsWith('/images/'));
  assert.ok(document.querySelector('figcaption a').getAttribute('href').startsWith('https://commons.wikimedia.org/'));
  const links=[...document.querySelectorAll('tbody th a')].map(link=>link.getAttribute('href'));assert.ok(links.includes('/cars/e92'));
  assert.match(renderEngineDirectoryPage('edrive'),/BMW i3 electric drive unit/);assert.doesNotMatch(renderEngineDirectoryPage('edrive'),/Drive-unit photo being researched/);
  assert.match(renderEngineDirectoryPage('unknown-engine'),/Browse all engines/);
  assert.doesNotMatch(renderEngineDirectoryPage('<script>'),/<script>/);
});

check('strict completeness fails while the factual gaps remain, and indexing mutates no catalogue values',()=>{
  const result=spawnSync(process.execPath,['scripts/check-completeness.mjs','--strict'],{encoding:'utf8'});
  assert.equal(result.status,1);assert.match(result.stdout,/Content incomplete/);assert.equal(result.stderr,'');
  assert.equal(JSON.stringify(allModels),before);
});

console.log(`Explorer data: ${groups} verification groups passed.`);
