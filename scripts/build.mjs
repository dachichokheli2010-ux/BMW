import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const project=fs.realpathSync('.');
const output=path.join(project,'dist');
if(path.relative(project,output)!=='dist'||fs.lstatSync(output,{throwIfNoEntry:false})?.isSymbolicLink())throw new Error('Build output must be the project’s own dist directory.');
fs.rmSync(output,{recursive:true,force:true});
const assets={};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.png':'image/png','.avif':'image/avif','.gif':'image/gif','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2'};
const binaryTypes=new Set(['.jpg','.jpeg','.webp','.png','.avif','.gif','.ico','.woff','.woff2']);
function collect(directory){
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
    const filename=path.join(directory,entry.name);
    const relativeAsset=path.relative('public',filename).split(path.sep).join('/');
    // Manufacturer website downloads and the retired Unsplash hero have no
    // confirmed permission within this project's requested image policy.
    if(/^images\/official-(?:heritage|modern)(?:\/|$)/.test(relativeAsset)||relativeAsset==='images/next/hero.webp')continue;
    // Keep source research on disk; unused contact sheets and rejected candidates
    // are not runtime assets and otherwise add hundreds of Worker entries.
    if(entry.isDirectory()){if(entry.name!=='_candidates')collect(filename);continue;}
    const extension=path.extname(filename),binary=binaryTypes.has(extension);
    const key='/'+path.relative('public',filename).split(path.sep).join('/');
    assets[key]={body:fs.readFileSync(filename,binary?undefined:'utf8').toString(binary?'base64':undefined),encoding:binary?'base64':'utf8',type:types[extension]||'text/plain; charset=utf-8'};
  }
}
collect('public');
const version=createHash('sha256').update(Object.entries(assets).filter(([name])=>/\.(js|css|html)$/.test(name)).map(([name,asset])=>name+asset.body).sort().join('')).digest('hex').slice(0,16);
for(const [name,asset] of Object.entries(assets)){
  if(name.endsWith('.js'))asset.body=asset.body.replace(/(from\s*['"])(\.\/[^'"]+\.js)(['"])/g,`$1$2?v=${version}$3`);
  if(name.endsWith('.html'))asset.body=asset.body.replace(/((?:src|href)=["])([^"]+\.(?:js|css))(["])/g,`$1$2?v=${version}$3`);
}

// Keep generated modules below the source repository’s per-object size limit.
// The Worker receives the same asset map; photographs stay local and unchanged.
const server=path.join(output,'server');
fs.mkdirSync(server,{recursive:true});
const chunkLimit=4*1024*1024,chunks=[];
let current=[],currentBytes=32;
function flush(){if(!current.length)return;const filename=`assets-${String(chunks.length).padStart(2,'0')}.js`;fs.writeFileSync(path.join(server,filename),'export const assets={'+current.join(',')+'};\n');chunks.push(filename);current=[];currentBytes=32;}
for(const [name,asset] of Object.entries(assets).sort(([a],[b])=>a<b?-1:a>b?1:0)){
  const entry=JSON.stringify(name)+':'+JSON.stringify(asset),bytes=Buffer.byteLength(entry,'utf8')+1;
  if(bytes+32>chunkLimit)throw new Error(`Asset ${name} exceeds the build module limit; optimize it before building.`);
  if(currentBytes+bytes>chunkLimit)flush();
  current.push(entry);currentBytes+=bytes;
}
flush();
fs.writeFileSync(path.join(server,'assets.js'),chunks.map((filename,index)=>`import {assets as block${index}} from './${filename}';`).join('\n')+'\nexport const assets={'+chunks.map((_,index)=>'...block'+index).join(',')+'};\n');
fs.writeFileSync(path.join(server,'index.js'),fs.readFileSync('worker/index.js','utf8').replace("'../server/api.js'","'./backend/api.js'"));
fs.copyFileSync('public/routes.js',path.join(server,'routes.js'));
fs.mkdirSync(path.join(server,'backend'),{recursive:true});
for(const filename of ['api.js','passwords.js','validation.js','catalog-meta.js','academy-policy.js','account-mail.js','admin-policy.js','admin-auth.js','community-api.js','community-questions.js','community-photos.js'])fs.copyFileSync(path.join('server',filename),path.join(server,'backend',filename));
// Shared reward definitions stay identical in browser, Node and Worker runtimes.
fs.mkdirSync(path.join(server,'public'),{recursive:true});
for(const filename of ['academy-rewards.js','academy-achievements.js'])fs.copyFileSync(path.join('public',filename),path.join(server,'public',filename));
// Validate the packaged API graph, so a missing mail/community dependency fails
// the build instead of taking authentication down only after deployment.
await import(pathToFileURL(path.join(server,'backend','api.js')).href);
console.log(`Built ${Object.keys(assets).length} locally served assets in ${chunks.length} modules with the authenticated garage API.`);
