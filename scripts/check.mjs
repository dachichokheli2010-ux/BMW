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
import {estimateBuild,syntheticDynoPoint} from '../public/garage.js';
import {EngineCore} from '../public/engine-core.js';

let checks=0;
function check(name,fn){fn();checks++;console.log('PASS '+name);}
check('Application JavaScript parses',()=>{
  for(const directory of ['public','scripts','worker'])for(const filename of fs.readdirSync(directory)){
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
  assert.ok(allElectricModels.length>0);
});
check('Expanded data retains exact launch configurations and units',()=>{
  const m=allModels.find(m=>m.id==='f10-m5');assert.equal(m.powerUnit,'PS');assert.equal(m.acceleration100,4.4);assert.equal(m.weightKg,1870);assert.equal(m.verified.weightEU,1945);
  assert.equal(allModels.find(m=>m.id==='e92').transmission,'6-speed manual');
  const unknown=enrichModel({id:'unverified',source:'https://example.com',power:100,powerUnit:'hp'});assert.equal(unknown.weightKg,undefined);assert.equal(unknown.source,'https://example.com');
  for(const facts of Object.values(verifiedSpecs)){assert.ok(facts.specification);assert.ok(facts.sources.every(s=>s.url.startsWith('https://www.press.bmwgroup.com/')));}
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
  assert.ok(systemComponents.length>=16);assert.ok(systemComponents.every(p=>p.sources.length&&p.connections.length>=2&&p.symptoms&&p.location));
  assert.ok(partCatalog.every(p=>p.photo.license&&p.photo.author&&fs.existsSync('public/'+p.photo.src)));
});
check('Engine synthesis produces finite distinct family waveforms',()=>{
  const samples=[];
  for(const code of ['S63','N55','S65']){
    const core=new EngineCore(48000);core.configure({code,cylinders:code==='N55'?6:8,turbos:code==='S65'?0:code==='S63'?2:1,maxRPM:7200});core.update({rpm:4500,load:.7,running:true,gear:1});
    const output=Array.from({length:5},()=>new Float32Array(512));for(let i=0;i<15;i++)core.render(output);
    assert.ok(output.every(channel=>channel.every(Number.isFinite)));assert.ok(output[0].some(v=>Math.abs(v)>.001));samples.push([...output[1]].slice(0,10));
  }
  assert.notDeepEqual(samples[0],samples[1]);assert.notDeepEqual(samples[0],samples[2]);
});
console.log(`All ${checks} verification groups passed.`);
