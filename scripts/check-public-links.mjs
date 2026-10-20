import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {allModels} from '../public/catalog.js';
import {engineRecords,carRecords} from '../public/explorer-data.js';
import {encyclopediaParts} from '../public/parts-encyclopedia-data.js';
import {createQuestionBank} from '../public/play-data.js';
import {responsivePhotoData} from '../public/responsive-photo-data.js';
import {resolvePage} from '../public/routes.js';

const originIndex=process.argv.indexOf('--origin');
const origin=new URL(originIndex>=0?process.argv[originIndex+1]:'http://127.0.0.1:3000').origin;
const manifest=JSON.parse(await fs.readFile(new URL('../public/discovery-manifest.json',import.meta.url),'utf8'));
const images=new Set(['/images/photo-unavailable.svg']),assets=new Set();
function collect(value){
  if(typeof value==='string'&&/^\/?images\/[^?#]+$/i.test(value))images.add('/'+value.replace(/^\//,''));
  else if(Array.isArray(value))value.forEach(collect);
  else if(value&&typeof value==='object')Object.values(value).forEach(collect);
}
collect(allModels.map(model=>({car:model.car,engine:model.engine,views:model.views,photos:model.approvedPhotos})));
collect(engineRecords.map(record=>record.photos));collect(carRecords.map(record=>record.photos));
collect(encyclopediaParts.map(part=>part.photo));collect(createQuestionBank().map(question=>question.photo));
for(const path of [...images])collect(responsivePhotoData[path.slice(1)]?.variants);
for(const name of ['index.html','parts.html','electric.html','about.html','admin.html']){
  const shell=await fs.readFile(new URL('../public/'+name,import.meta.url),'utf8');
  for(const match of shell.matchAll(/(?:src|href)="([^"?#]+\.(?:js|css|webp|avif|jpg|jpeg|png|svg|woff2))"/g)){
    if(/^(?:https?:|data:|#)/.test(match[1]))continue;
    const path=new URL(match[1],origin+'/').pathname;
    if(/\.(?:webp|avif|jpg|jpeg|png|svg)$/.test(path))images.add(path);else assets.add(path);
  }
}
for(const file of ['play.js','play-data.js','play.css','engine-directory.js','engine-directory.css','parts-encyclopedia.js','parts-encyclopedia-data.js','parts-encyclopedia.css','guide-tools.js','experience.js','experience.css','reference-pages.js','garage-hub.js','platform.js'])assets.add('/'+file);
const privatePages=['/admin'];
assert.ok(!manifest.paths.some(path=>/^\/admin(?:\/|$)/.test(path)),'Private administration must stay out of discovery');
const rows=[...[...manifest.paths,...privatePages].map(path=>({path,kind:'page'})),...[...images].sort().map(path=>({path,kind:'image'})),...[...assets].sort().map(path=>({path,kind:'asset'}))];
let next=0;const results=[];
async function worker(){
  while(next<rows.length){
    const row=rows[next++];
    try{
      const response=await fetch(origin+row.path,{method:'HEAD',signal:AbortSignal.timeout(10000)}),type=response.headers.get('content-type')||'';
      const correctType=row.kind==='page'?type.startsWith('text/html'):row.kind==='image'?type.startsWith('image/'):!type.startsWith('text/html');
      const resolved=row.kind!=='page'||!!resolvePage(new URL(row.path,origin).pathname);
      results.push({...row,status:response.status,type,passed:response.ok&&correctType&&resolved});
    }catch(error){results.push({...row,status:null,passed:false,error:error.message});}
  }
}
await Promise.all(Array.from({length:16},()=>worker()));
const failures=results.filter(result=>!result.passed),report={origin,checkedAt:new Date().toISOString(),method:'HEAD',pages:manifest.paths.length,privatePages:privatePages.length,images:images.size,assets:assets.size,total:rows.length,passed:results.filter(result=>result.passed).length,failures};
await fs.mkdir(new URL('../reports/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('../reports/public-http-qa.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
const lines=['# Public route and image HTTP check','',`Checked ${report.total} local URLs against ${origin} using HEAD requests and response content types.`,`- Discovery pages: ${report.pages}`,`- Private entry pages: ${report.privatePages}`,`- Referenced images, including responsive variants: ${report.images}`,`- Entry stylesheets and scripts: ${report.assets}`,`- Passed: ${report.passed}`,`- Failed: ${failures.length}`,'','This check verifies route availability and asset responses. Interactive mounting is covered separately by check-platform-upgrade.mjs and check-play.mjs. Missing photographs explicitly listed in the content manifest remain research gaps, rather than broken image requests.'];
if(failures.length)lines.push('','Failures:',...failures.map(row=>`- ${row.path}: ${row.status??row.error} (${row.type||'no response type'})`));
await fs.writeFile(new URL('../reports/public-http-qa.md',import.meta.url),lines.join('\n')+'\n');
if(failures.length)console.error(failures.slice(0,25));
assert.equal(failures.length,0,`Public HTTP check failed for ${failures.length} URLs; see reports/public-http-qa.json`);
console.log(`Public HTTP checks passed: ${report.pages} pages, ${report.images} images and ${report.assets} entry assets (${report.total} URLs).`);
