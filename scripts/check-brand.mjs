import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {parseHTML} from 'linkedom';
import {MOTRON_MARK_PATH} from '../public/brand-mark.js';
import {personalityCardSVG} from '../public/personality-quiz.js';
import {sendAccountMail} from '../server/account-mail.js';
import {ACCOUNT_KEYS} from '../public/account-sync.js';
import {garageGameKey} from '../public/garage-game-state.js';

let checks=0;const check=(value,message)=>{assert.ok(value,message);checks++;};
const formerBrand=/\b(?:APEX|Apex|CHOKH|Chokh)\b/;
const scan=async directory=>{for(const entry of await fs.readdir(directory,{withFileTypes:true})){if(['vendor','_candidates'].includes(entry.name))continue;const filename=path.join(directory,entry.name);if(entry.isDirectory()){await scan(filename);continue;}if(!/\.(?:html|js|css|svg|json)$/.test(filename))continue;const source=await fs.readFile(filename,'utf8');check(!formerBrand.test(source),'Former visible product brand in '+filename);}};
await scan('public');await scan('server');
const environmentExample=await fs.readFile('.env.example','utf8');
check(!formerBrand.test(environmentExample)&&/^# ACCOUNT_MAIL_FROM=Motron <accounts@your-verified-domain\.example>$/m.test(environmentExample),'Deployment setup example uses the Motron sender name');
const previewSource=await fs.readFile('scripts/preview-local.mjs','utf8');
check(previewSource.includes('Motron running at')&&!previewSource.includes('BMW Garage running at'),'Local preview banner identifies Motron');
for(const name of ['index','about','electric','parts','404','admin']){
 const source=await fs.readFile('public/'+name+'.html','utf8'),{document}=parseHTML(source);
 check(document.title.includes('Motron'),name+' has the new product title');
 check(document.querySelector('link[rel=icon]')?.getAttribute('href')==='/favicon.svg',name+' uses the Motron favicon');
 if(['index','about','electric','parts'].includes(name)){
  check(document.querySelector('.brand-name')?.textContent.startsWith('MOTRON'),name+' has the new wordmark');
  check(document.querySelector('.apex-symbol path')?.getAttribute('d')===MOTRON_MARK_PATH,name+' uses the original M monogram');
  check(!document.querySelector('link[href="academy.css"]'),name+' does not eagerly load the retired Academy layout');
  check(document.querySelector('.brand')?.getAttribute('aria-label')==='Motron BMW Explorer home',name+' exposes the new accessible brand name');
 }
}
const favicon=await fs.readFile('public/favicon.svg','utf8');check(favicon.includes(MOTRON_MARK_PATH)&&favicon.includes('<title>Motron</title>'),'Favicon uses the same M monogram and accessible product name');
const card=personalityCardSVG('performance',{modelName:'BMW M3'});check(card.includes('MOTRON')&&card.includes(MOTRON_MARK_PATH)&&card.includes('BMW M3'),'Downloadable personality card keeps BMW identity and carries the new original brand mark');
const {window,document}=parseHTML('<html><head></head><body><main></main></body></html>');
Object.assign(globalThis,{window,document,location:new URL('https://existing-domain.test/models')});
const {mountAdmin}=await import('../public/admin.js');const admin=mountAdmin(document.querySelector('main'),{fetchImpl:async()=>Response.json({configured:true,user:null,csrfToken:null})});await admin.ready;
check(document.querySelector('.admin-brand path')?.getAttribute('d')===MOTRON_MARK_PATH&&document.querySelector('.admin-brand')?.textContent.includes('MOTRON'),'Private administrator shell uses the same new identity');admin.destroy();
const {updateSEO}=await import('../public/seo.js');document.title='Motron — BMW Explorer';updateSEO();check(document.querySelector('meta[property="og:site_name"]')?.content==='Motron'&&document.querySelector('meta[name="application-name"]')?.content==='Motron','Social and application metadata name Motron');
const mail=[];for(const language of ['en','ka','ru'])await sendAccountMail({PUBLIC_ORIGIN:'https://existing-domain.test',MAILER:{send:async message=>mail.push(message)}},{to:'fixture@example.test',purpose:'verify',token:'fixture-token',language,idempotencyKey:'fixture-'+language});
check(mail.length===3&&mail.every(message=>message.subject.includes('Motron')&&message.text.includes('Motron')&&!formerBrand.test(message.subject+message.text)),'Account emails use Motron in every supported language');
// Product identity changes must not split saved garages or authentication data.
assert.equal(ACCOUNT_KEYS.favorites,'apex-favorites');assert.equal(ACCOUNT_KEYS.builds,'apex-garage-builds-v1');assert.equal(garageGameKey(null),'apex-garage-game-v1:guest');checks+=3;
const personal=await fs.readFile('public/personal-garage.js','utf8'),game=await fs.readFile('public/garage-hub.js','utf8'),auth=await fs.readFile('server/admin-auth.js','utf8'),api=await fs.readFile('server/api.js','utf8');
check(personal.includes("schema:'apex.personal-backup'")&&game.includes("schema:'apex.collection'"),'Existing backup format identifiers stay compatible');
check(auth.includes('__Host-bmw_admin')&&api.includes('__Host-bmw_session'),'Existing private and public cookie names stay compatible');
const pkg=JSON.parse(await fs.readFile('package.json','utf8')),lock=JSON.parse(await fs.readFile('package-lock.json','utf8'));check(pkg.name==='motron-bmw-explorer'&&lock.name===pkg.name&&lock.packages[''].name===pkg.name,'Package metadata consistently identifies Motron');
console.log(`Motron branding: ${checks} runtime, logo, metadata, email, translation and compatibility checks passed.`);
