import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseHTML} from 'linkedom';
import {pageRoutes,resolvePage} from '../public/routes.js';
import {allModels} from '../public/catalog.js';
import {engineRecords,carRecords} from '../public/explorer-data.js';
import {encyclopediaParts} from '../public/parts-encyclopedia-data.js';
import {createQuestionBank} from '../public/play-data.js';
import {responsivePhotoData} from '../public/responsive-photo-data.js';

const project=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(project,'dist','vercel');
const config=JSON.parse(await fs.readFile(path.join(project,'vercel.json'),'utf8'));
const release=JSON.parse(await fs.readFile(path.join(output,'release.json'),'utf8'));
assert.equal(config.outputDirectory,'dist/vercel');
assert.match(release.assetPrefix,/^\/_apex\/[a-f0-9]{16}\/$/);

const origin='https://apex.invalid';
let references=0,modules=0,styles=0;
const queue=[],seen=new Set();
const published=new Set();
async function inventory(directory){
  for(const entry of await fs.readdir(directory,{withFileTypes:true})){
    const filename=path.join(directory,entry.name);
    if(entry.isDirectory())await inventory(filename);
    else if(entry.isFile())published.add(path.relative(output,filename).split(path.sep).join('/'));
  }
}
await inventory(output);
// Keep this framework-free project within its 12-function deployment budget.
// Community endpoints share api/[...path].js rather than creating 12 functions.
async function apiEntries(directory){let files=[];for(const entry of await fs.readdir(directory,{withFileTypes:true})){const filename=path.join(directory,entry.name);if(entry.isDirectory())files.push(...await apiEntries(filename));else if(/\.[cm]?[jt]s$/.test(entry.name))files.push(filename);}return files;}
const functions=await apiEntries(path.join(project,'api'));
assert.ok(functions.length<=12,'Too many Vercel function entry points; consolidate routes in the existing catch-all API.');
async function existing(url,label){
  assert.equal(url.origin,origin,label+' must stay on this origin');
  const relative=decodeURIComponent(url.pathname).replace(/^\//,'');
  const filename=path.resolve(output,relative);
  assert.ok(!path.relative(output,filename).startsWith('..'),label+' must stay inside output');
  // Windows accepts wrong filename case; Vercel's Linux filesystem does not.
  assert.ok(published.has(relative),`${label} is missing or has incorrect filename case in Vercel output: ${url.pathname}`);
  references++;return filename;
}
function enqueue(specifier,base,label){
  if(!specifier.startsWith('.')&&!specifier.startsWith('/'))return;
  const url=new URL(specifier,base);
  assert.ok(url.pathname.startsWith(release.assetPrefix),`${label} escaped the release: ${url.pathname}`);
  queue.push({url,label});
}
for(const shell of new Set([...Object.values(pageRoutes),'404.html'])){
  const html=await fs.readFile(path.join(output,shell),'utf8'),{document}=parseHTML(html);
  if(shell!=='404.html')assert.equal(document.querySelector('base')?.getAttribute('href'),'/',shell+' must keep deep-link image/navigation paths rooted');
  for(const node of document.querySelectorAll('script[src],link[rel="stylesheet"][href]')){
    const value=node.getAttribute('src')||node.getAttribute('href');
    if(/^(https?:)?\/\//.test(value))continue;
    enqueue(value,origin+'/',shell+' entry asset');
  }
  for(const node of document.querySelectorAll('script[type="importmap"]')){
    const map=JSON.parse(node.textContent);
    for(const value of Object.values(map.imports||{}))enqueue(value,origin+'/',shell+' import map');
  }
  for(const node of document.querySelectorAll('img[src]')){
    const value=node.getAttribute('src');
    if(value&&!/^(?:https?:|data:|blob:)/.test(value))await existing(new URL(value,origin+'/'),shell+' image');
  }
}

// The local preview has a legacy .jpg-to-.webp fallback. Vercel's static CDN
// does not; validate the real image path and exact case for every runtime photo.
const images=new Set(['images/photo-unavailable.svg']);
function collectImages(value){
  if(typeof value==='string'&&/^\/?images\/[^?#]+$/i.test(value))images.add(value.replace(/^\//,''));
  else if(Array.isArray(value))value.forEach(collectImages);
  else if(value&&typeof value==='object')Object.values(value).forEach(collectImages);
}
collectImages(allModels.map(model=>({car:model.car,engine:model.engine,views:model.views,photos:model.approvedPhotos})));
collectImages(engineRecords.map(record=>record.photos));collectImages(carRecords.map(record=>record.photos));
collectImages(encyclopediaParts.map(part=>part.photo));collectImages(createQuestionBank().map(question=>question.photo));
for(const image of [...images])collectImages(responsivePhotoData[image]?.variants);
for(const image of images)await existing(new URL('/'+image,origin),'Runtime image');
while(queue.length){
  const {url,label}=queue.shift();if(seen.has(url.href))continue;seen.add(url.href);
  const filename=await existing(url,label),source=await fs.readFile(filename,'utf8');
  if(url.pathname.endsWith('.js')){
    modules++;
    // Covers static imports/re-exports, side-effect imports and dynamic imports.
    for(const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["']([^"']+)["']/g))enqueue(match[1],url.href,url.pathname+' import');
    for(const match of source.matchAll(/new URL\(\s*["']([^"']+\.(?:css|js|json))["']\s*,\s*import\.meta\.url\s*\)/g))enqueue(match[1],url.href,url.pathname+' URL');
    for(const match of source.matchAll(/\bloadStyle\(\s*["']([^"']+)["']/g))enqueue(match[1],url.href,url.pathname+' lazy stylesheet');
  }else if(url.pathname.endsWith('.css')){
    styles++;
    for(const match of source.matchAll(/@import\s*(?:url\(\s*)?["']([^"']+)["']/g))enqueue(match[1],url.href,url.pathname+' CSS import');
  }
}

// Every known route must land on the same HTML shell in Vercel and local
// preview. This catches nested engine/part pages that otherwise work locally.
const manifest=JSON.parse(await fs.readFile(path.join(output,'discovery-manifest.json'),'utf8'));
const routes=new Set([...manifest.paths,...Object.keys(pageRoutes),'/garage/'+'x'.repeat(43),'/community/cars/00000000-0000-0000-0000-000000000000']);
for(const url of routes){
  const route=new URL(url,origin).pathname;
  const shell=resolvePage(route);assert.ok(shell,'Unknown discovery route '+route);
  if(route==='/')continue;
  const rewrite=config.rewrites.find(rule=>route===rule.source.replace('/:path*','')||route.startsWith(rule.source.replace(':path*','')));
  assert.equal(rewrite?.destination,'/'+shell,'Vercel deep-link shell differs for '+route);
}
const globalHeaders=config.headers.find(rule=>rule.source==='/(.*)')?.headers||[];
assert.ok(globalHeaders.some(header=>header.key==='Cache-Control'&&header.value.includes('must-revalidate')),'HTML and unversioned assets must revalidate');
assert.ok(config.headers.some(rule=>rule.source.startsWith('/_apex/')&&rule.headers.some(header=>header.key==='Cache-Control'&&header.value.includes('immutable'))),'Release assets must be immutable');
assert.ok(config.headers.some(rule=>rule.source==='/api/:path*'&&rule.headers.some(header=>header.key==='Cache-Control'&&header.value==='private, no-store')),'Account API responses must never inherit the static asset caching policy');
assert.equal(await fs.stat(path.join(output,'images','next','hero.webp')).catch(()=>null),null,'Unapproved hero must not publish');
console.log(`Vercel release checks passed: ${modules} modules, ${styles} stylesheets, ${images.size} images, ${references} asset references and ${manifest.paths.length} deep links.`);
