import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const project=fileURLToPath(new URL('../',import.meta.url));
const rules=(await fs.readFile(path.join(project,'.vercelignore'),'utf8')).split(/\r?\n/).map(line=>line.trim()).filter(line=>line&&!line.startsWith('#'));
function included(filename){
 let allowed=true;
 for(const raw of rules){
  const negate=raw.startsWith('!'),pattern=(negate?raw.slice(1):raw).replace(/^\//,'').replace(/\/$/,'');
  const candidates=pattern.includes('/')?[filename]:filename.split('/').map((_,index,parts)=>parts.slice(0,index+1).join('/'));
  if(candidates.some(value=>path.matchesGlob(value,pattern)||!pattern.includes('/')&&path.matchesGlob(path.posix.basename(value),pattern))||path.matchesGlob(filename,pattern+'/**'))allowed=negate;
 }
 return allowed;
}
assert.ok(included('.env.example'),'The build validates the public environment template; .vercelignore must include it.');
for(const filename of ['.env','.env.local','.env.production','.env.production.local','.data/account.sqlite','.data/account.sqlite-wal','backups/account.sqlite','backups/account.sqlite-shm'])assert.equal(included(filename),false,'Private state must remain excluded: '+filename);
for(const filename of ['public/images/official-modern/example.webp','public/images/official-heritage/example.webp','public/images/cars/_candidates/example.webp','public/images/next/hero.webp'])assert.equal(included(filename),false,'Unapproved media must remain excluded: '+filename);

// Exercise the actual build check using the source inputs an upload retains.
// No local env file, database or unapproved image enters this temporary tree.
const fixture=await fs.mkdtemp(path.join(os.tmpdir(),'motron-vercel-inputs-'));
let files=0;
async function collect(relative){
 const source=path.join(project,relative),entry=await fs.lstat(source);
 if(!included(relative))return;
 assert.equal(entry.isSymbolicLink(),false,'Build source must not use a symlink: '+relative);
 const destination=path.join(fixture,relative);
 if(entry.isDirectory()){
  await fs.mkdir(destination,{recursive:true});
  for(const name of await fs.readdir(source))await collect(path.posix.join(relative,name));
 }else if(entry.isFile()&&(relative==='.env.example'||/\.(?:html|m?js|css|svg|json)$/.test(relative))){
  await fs.mkdir(path.dirname(destination),{recursive:true});
  await fs.copyFile(source,destination);files++;
 }
}
try{
 for(const relative of ['public','server','scripts','package.json','package-lock.json','.env.example'])await collect(relative);
 await fs.symlink(path.join(project,'node_modules'),path.join(fixture,'node_modules'),process.platform==='win32'?'junction':'dir');
 const template=path.join(fixture,'.env.example');
 await fs.unlink(template);
 const excluded=spawnSync(process.execPath,['scripts/check-brand.mjs'],{cwd:fixture,encoding:'utf8',timeout:30000});
 assert.notEqual(excluded.status,0,'The old upload filter must reproduce the missing-template build failure.');
 assert.match(excluded.stderr,/ENOENT/,'The old filter fails because a build input is absent.');
 assert.ok(excluded.stderr.includes('.env.example'),'The reproduced failure names the environment template.');
 await fs.copyFile(path.join(project,'.env.example'),template);
 const result=spawnSync(process.execPath,['scripts/check-brand.mjs'],{cwd:fixture,encoding:'utf8',timeout:30000});
 assert.equal(result.status,0,'The branding build check must run on retained Vercel inputs:\n'+(result.stderr||result.error?.message||result.stdout));
 console.log(`Vercel source inputs: ${files} retained files passed the actual branding check; private env/state and unapproved media remain excluded.`);
}finally{
 const modules=path.join(fixture,'node_modules');
 if((await fs.lstat(modules).catch(error=>error.code==='ENOENT'?null:Promise.reject(error)))?.isSymbolicLink())await fs.unlink(modules);
 assert.equal(path.dirname(path.resolve(fixture)),path.resolve(os.tmpdir()));
 assert.ok(path.basename(fixture).startsWith('motron-vercel-inputs-'));
 await fs.rm(fixture,{recursive:true,force:true});
}
