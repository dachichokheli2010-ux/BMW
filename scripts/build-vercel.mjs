import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const project=fileURLToPath(new URL('../',import.meta.url));
const source=path.join(project,'public');
export const output=path.join(project,'dist','vercel');

// This output is independent of the Worker bundle in dist/server. Never follow
// a symlink when replacing the generated directory.
for(const directory of [path.join(project,'dist'),output]){
  if((await fs.lstat(directory).catch(error=>error.code==='ENOENT'?null:Promise.reject(error)))?.isSymbolicLink())throw new Error('Vercel build output must remain inside this project.');
}
if(path.relative(project,output)!==path.join('dist','vercel'))throw new Error('Invalid Vercel output directory.');
await fs.rm(output,{recursive:true,force:true});
await fs.mkdir(output,{recursive:true});

const files=[];
async function collect(directory){
  for(const entry of await fs.readdir(directory,{withFileTypes:true})){
    const filename=path.join(directory,entry.name);
    const relative=path.relative(source,filename).split(path.sep).join('/');
    // Match the Worker build and .vercelignore: retain research on disk, while
    // publishing only the approved runtime photo set.
    if(/^images\/official-(?:heritage|modern)(?:\/|$)/.test(relative)||relative==='images/next/hero.webp'||entry.name==='_candidates')continue;
    if(entry.isSymbolicLink())throw new Error(`Public assets cannot be symbolic links: ${relative}`);
    if(entry.isDirectory())await collect(filename);
    else if(entry.isFile())files.push({relative,filename});
  }
}
await collect(source);
files.sort((a,b)=>a.relative.localeCompare(b.relative,'en'));

// One directory versions the complete module graph. Relative static imports,
// side-effect imports, dynamic imports, CSS @imports and import.meta.url-based
// lazy styles all resolve inside the same release without rewriting JS source.
const versioned=new Set(files.filter(file=>/\.(?:js|css|json|woff2?)$/i.test(file.relative)).map(file=>file.relative));
const hash=createHash('sha256');
for(const file of files.filter(file=>versioned.has(file.relative)||file.relative.endsWith('.html'))){
  hash.update(file.relative+'\0');hash.update(await fs.readFile(file.filename));hash.update('\0');
}
const version=hash.digest('hex').slice(0,16),prefix=`/_apex/${version}/`;

function releaseURL(value){
  if(/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\?)/i.test(value))return value;
  const url=new URL(value,'https://apex.invalid/');
  const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '');
  return versioned.has(relative)?prefix+relative+url.search+url.hash:value;
}
function releaseHTML(html){
  const tags=html.replace(/\b(src|href)(\s*=\s*)(["'])([^"']+)\3/g,(match,name,separator,quote,value)=>name+separator+quote+releaseURL(value)+quote);
  return tags.replace(/(<script\b[^>]*\btype\s*=\s*["']importmap["'][^>]*>)([\s\S]*?)(<\/script\s*>)/gi,(match,start,json,end)=>{
    const map=JSON.parse(json);
    if(map.imports)for(const name of Object.keys(map.imports))map.imports[name]=releaseURL(map.imports[name]);
    if(map.scopes)for(const entries of Object.values(map.scopes))for(const name of Object.keys(entries))entries[name]=releaseURL(entries[name]);
    return start+JSON.stringify(map)+end;
  });
}

for(const file of files){
  const destination=path.join(output,file.relative);
  await fs.mkdir(path.dirname(destination),{recursive:true});
  if(file.relative.endsWith('.html'))await fs.writeFile(destination,releaseHTML(await fs.readFile(file.filename,'utf8')));
  else await fs.copyFile(file.filename,destination);
  if(versioned.has(file.relative)){
    const releaseFile=path.join(output,'_apex',version,file.relative);
    await fs.mkdir(path.dirname(releaseFile),{recursive:true});
    await fs.copyFile(file.filename,releaseFile);
  }
}
await fs.writeFile(path.join(output,'release.json'),JSON.stringify({version,assetPrefix:prefix,files:files.length,versionedAssets:versioned.size},null,2)+'\n');
console.log(`Built Vercel release ${version}: ${files.length} approved assets, ${versioned.size} versioned modules/styles/data files.`);
