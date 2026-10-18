import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {allModels,allElectricModels} from '../public/catalog.js';
import {verifiedSpecs,enrichModel} from '../public/verified-specs.js';
import {partCatalog} from '../public/parts.js';
import {systemComponents} from '../public/system-guide.js';
import {academyLessons} from '../public/academy.js';
import {createSearchIndex,searchIndex,comparisonFromQuery} from '../public/smart-search.js';
import {estimateBuild,syntheticDynoPoint,validateBuildImport,garageDefaults} from '../public/garage.js';
import {readPersonalGarage} from '../public/personal-garage.js';

import {resolvePage,canonicalPageURL} from '../public/routes.js';
import {convertedPower,convertedTorque} from '../public/comparison.js';

let checks=0;
function check(name,fn){fn();checks++;console.log('PASS '+name);}
check('Dedicated pages and legacy deep links resolve without losing context',()=>{
  for(const route of ['/models','/learn','/compare','/engine-lab','/tuning-garage','/my-garage']) {
    assert.equal(resolvePage(route),'index.html');assert.equal(resolvePage(route+'/'),'index.html');
  }
  assert.equal(resolvePage('/unknown'),null);
  assert.equal(canonicalPageURL('/?model=f10-m5&view=engine&part=2'),'/models?model=f10-m5&view=engine&part=2');
  assert.equal(canonicalPageURL('/?collection=m#collection'),'/models?collection=m');
  assert.equal(canonicalPageURL('/?lesson=cooling&level=advanced#academy'),'/learn?lesson=cooling&level=advanced');
  assert.equal(canonicalPageURL('/?garage=f10-m5&build=saved-1#tuning-garage'),'/tuning-garage?garage=f10-m5&build=saved-1');
  assert.equal(canonicalPageURL('/?compare=g80,g82-m4&units=metric'),'/compare?compare=g80,g82-m4&units=metric');
  assert.equal(canonicalPageURL('/learn/'),'/learn');
  assert.equal(canonicalPageURL('/#engine-lab'),'/engine-lab');
  assert.equal(canonicalPageURL('/electric?model=i3'),'/electric?model=i3');
});
check('Comparison units retain real horsepower definitions and missing data',()=>{
  const m5=allModels.find(m=>m.id==='f10-m5');
  assert.equal(convertedPower(m5).value,560);
  assert.ok(Math.abs(convertedPower(m5,'imperial').value-552.339)<.01);
  assert.ok(Math.abs(convertedTorque(m5,'imperial').value-501.542)<.01);
  assert.equal(convertedPower({power:null,powerUnit:'PS'}),null);
  assert.equal(convertedPower({power:500,powerUnit:'unknown'}),null);
  assert.equal(convertedTorque({torque:0,torqueUnit:'Nm'}),null);
});
check('Application JavaScript parses',()=>{
  for(const directory of ['public','scripts','worker','server','api'])for(const filename of fs.readdirSync(directory)){
    if(!/\.(?:mjs|js)$/.test(filename))continue;
    const file=path.join(directory,filename), result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
    assert.equal(result.status,0,`${file}: ${result.stderr}`);
    assert.doesNotMatch(fs.readFileSync(file,'utf8'),/<\/(?:option|div|span|button|select)\s+[A-Za-z][^>]*>/,`${file}: malformed template closing tag`);
  }
});
check('Catalog identities and local vehicle/engine photos are intact',()=>{
  assert.equal(new Set(allModels.map(m=>m.id)).size,allModels.length);
  assert.ok(allModels.length>=89);
  for(const m of allModels){assert.match(m.source,/^https:\/\//);assert.ok(m.parts.length,m.id);for(const photo of [m.car,m.engine].filter(Boolean))assert.ok(fs.existsSync('public/'+photo)||fs.existsSync('public/'+photo.replace(/\.jpg$/,'.webp')),`${m.id}: ${photo}`);}
  assert.equal(allModels.length,93);assert.equal(allElectricModels.length,16);
  for(const id of ['i4-edrive35','i4-xdrive40','u11-ix1-edrive20','u10-ix2-edrive20'])assert.ok(allElectricModels.some(model=>model.id===id),`${id} is catalogued as electric.`);
});
check('Expanded data retains exact launch configurations and units',()=>{
  const m=allModels.find(m=>m.id==='f10-m5');assert.equal(m.powerUnit,'PS');assert.equal(m.acceleration100,4.4);assert.equal(m.weightKg,1870);assert.equal(m.verified.weightEU,1945);
  assert.equal(allModels.find(m=>m.id==='e92').transmission,'6-speed manual');
  const unknown=enrichModel({id:'unverified',source:'https://example.com',power:100,powerUnit:'hp'});assert.equal(unknown.weightKg,undefined);assert.equal(unknown.source,'https://example.com');
  for(const facts of Object.values(verifiedSpecs)){assert.ok(facts.specification);assert.ok(facts.sources.every(s=>s.url.startsWith('https://www.press.bmwgroup.com/')));}
  assert.equal(Object.keys(verifiedSpecs).length,8);
  assert.equal(verifiedSpecs.g80.acceleration100,undefined);assert.equal(verifiedSpecs.g80.acceleration60Mph,3.8);
  for(const [id,facts] of Object.entries(verifiedSpecs)){const vehicle=allModels.find(m=>m.id===id);assert.ok(vehicle,id);if(vehicle.powerUnit==='PS')assert.equal(facts.powerPS,vehicle.power,id);if(vehicle.powerUnit==='hp')assert.equal(facts.powerHp,vehicle.power,id);}
});
check('Build imports validate inputs and discard supplied performance claims',()=>{
  const valid={version:1,modelId:'f10-m5',name:'Imported road build',config:{...garageDefaults,ecu:'1'},hypothetical:{powerPS:99999}};
  const [record]=validateBuildImport(valid,allModels);assert.equal(record.hypothetical,undefined);assert.equal(record.config.ecu,'1');
  assert.throws(()=>validateBuildImport({...valid,modelId:'not-a-BMW'},allModels));
  assert.throws(()=>validateBuildImport({...valid,config:{...garageDefaults,ecu:'999'}},allModels));
  assert.throws(()=>validateBuildImport({...valid,modelId:'e92',config:{...garageDefaults,turbo:'1'}},allModels));
  assert.throws(()=>validateBuildImport([valid,{...valid,name:''}],allModels));
});
check('Personal garage reads valid progress and saved models without changing storage',()=>{
  const records={'apex-favorites':JSON.stringify(['f10-m5','f10-m5','not-a-BMW']),'bmw-academy-progress-v1':JSON.stringify({'combustion:beginner':true,'fake:advanced':true})};
  const state=readPersonalGarage(allModels,{getItem:key=>records[key]??null,setItem:()=>{throw new Error('Read must not write');}});
  assert.deepEqual(state.favorites,['f10-m5']);assert.equal(Object.keys(state.progress).length,1);
  const corrupt=readPersonalGarage(allModels,{getItem:()=>'{broken'});assert.deepEqual(corrupt.favorites,[]);
});
check('My garage shares the new academy completion and next lesson',()=>{
  const records={'bmw-academy-state-v2':JSON.stringify({version:2,xp:25,credits:5,completed:{'first-engine':{day:'2026-10-18',accuracy:100,topic:'basics'},unknown:{day:'2026-10-18'}},days:['2026-10-18']})};
  const state=readPersonalGarage(allModels,{getItem:key=>records[key]??null,setItem:()=>{throw new Error('Read must not write');}});
  assert.equal(state.academy.completed,1);assert.equal(state.academy.total,34);assert.equal(state.academy.xp,25);
  assert.ok(state.academy.next);assert.notEqual(state.academy.next.id,'first-engine');
});
check('Search resolves chassis, engine, natural questions and comparisons',()=>{
  const index=createSearchIndex(allModels,[...partCatalog,...systemComponents]);
  assert.ok(searchIndex(index,'BMW F10 M5').some(r=>r.id==='f10-m5'));
  assert.ok(searchIndex(index,'S63 engine').some(r=>r.id==='engine-lab'));
  assert.ok(searchIndex(index,'What does an intercooler do?').some(r=>r.id==='intercooler'));
  assert.ok(searchIndex(index,'N54 vs N55').some(r=>r.id==='engine-codes'));
  assert.ok(searchIndex(index,'cooling','Lessons').every(r=>r.category==='Lessons'));
  assert.equal(searchIndex(index,'nonexistent-zzzzz').length,0);
  const pair=comparisonFromQuery(allModels,'N54 vs N55');assert.equal(pair.length,2);assert.match(allModels.find(m=>m.id===pair[0]).code,/N54/);assert.match(allModels.find(m=>m.id===pair[1]).code,/N55/);
});
check('Tuning estimates preserve factory reset and physical power/torque units',()=>{
  const model=allModels.find(m=>m.id==='f10-m5'),stock=estimateBuild(model),modified=estimateBuild(model,{ecu:'1'});
  assert.equal(stock.gainPercent,0);assert.equal(stock.powerPS,560);assert.ok(modified.powerPS>stock.powerPS);
  const chassis=estimateBuild(model,{wheels:'bronze',brakes:'track',suspension:'track'});assert.equal(chassis.powerPS,stock.powerPS);
  const point=syntheticDynoPoint(model,4000);assert.ok(Math.abs(point.powerPS*735.49875-point.torqueNm*4000*2*Math.PI/60)<.0001);
  assert.equal(estimateBuild(allModels.find(m=>m.id==='f90')).mass,null);
});
check('Educational content is linked, sourced and uniquely identified',()=>{
  assert.equal(academyLessons.length,8);assert.equal(new Set(academyLessons.map(l=>l.id)).size,8);
  assert.ok(systemComponents.length>=26);assert.equal(new Set(systemComponents.map(p=>p.id)).size,systemComponents.length);assert.ok(systemComponents.every(p=>p.sources.length&&p.connections.length>=2&&p.symptoms&&p.location));
  assert.ok(partCatalog.every(p=>p.photo.license&&p.photo.author&&fs.existsSync('public/'+p.photo.src)));
});
console.log(`All ${checks} verification groups passed.`);
