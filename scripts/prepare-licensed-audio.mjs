import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';

const recordings=[
  {id:'m57',file:'M57.ogg',name:'BMW M57',family:'Inline-six diesel',kind:'Engine recording',note:'An M57 engine recording. The exact vehicle, exhaust and individual operating phases are not documented.'},
  {id:'s14',file:'S14.ogg',name:'BMW S14',family:'Inline-four petrol',kind:'Engine recording',note:'Recorded at Bimmerfest 2018. Use it as an S14 reference, not a recording of every E30 trim.'},
  {id:'m70',file:'M70.ogg',name:'BMW M70',family:'V12 petrol',kind:'Engine recording',note:'Recorded at Bimmerfest 2018. Microphone position and the individual vehicle affect the sound.'},
  {id:'m3-gt2',file:'BMW M3 GT2 (2010).ogg',name:'BMW M3 GT2',family:'Racing V8',kind:'Pull-away',note:'A race car accelerating from the Goodwood hillclimb start in 2010. This is not a standard road-going M3 exhaust.'},
  {id:'v12-lmr',file:'BMW V12 LMR (1999).ogg',name:'BMW V12 LMR',family:'Racing V12',kind:'Pull-away',note:'Recorded at the Goodwood hillclimb start in 2009. This race-car recording is separate from road-car engine examples.'},
  {id:'328',file:'BMW 328 Mille Miglia Touring Coupe (1939) static.ogg',name:'BMW 328 Mille Miglia Touring Coupé',family:'Historic inline-six',kind:'Stationary',note:'A stationary paddock recording at Goodwood in 2010. Background event noise remains in the original.'},
];
const url=new URL('https://commons.wikimedia.org/w/api.php');url.search=new URLSearchParams({action:'query',format:'json',titles:recordings.map(item=>'File:'+item.file).join('|'),prop:'imageinfo',iiprop:'url|size|extmetadata'});
const data=await(await fetch(url)).json(),pages=Object.values(data.query.pages);
async function download(url){for(let attempt=0;attempt<4;attempt++){await new Promise(resolve=>setTimeout(resolve,1200+attempt*1800));const response=await fetch(url,{headers:{'User-Agent':'APEXLearning/1.0 (educational audio attribution research)'}});if(response.status===429){const retry=Number(response.headers.get('Retry-After'))||600;if(retry<=10){await new Promise(resolve=>setTimeout(resolve,retry*1000));continue;}throw new Error('Media host rate limit; retry after '+retry+' seconds.');}if(response.status>=500)continue;return response;}throw new Error('Media host is temporarily unavailable.');}
await fs.mkdir('public/audio',{recursive:true});
const prepared=[],existingOnly=process.argv.includes('--existing');
for(const item of recordings){
  const info=pages.find(page=>page.title==='File:'+item.file)?.imageinfo?.[0],meta=info?.extmetadata;
  if(!/^CC BY-SA [34]\.0$/.test(meta?.LicenseShortName?.value||''))throw new Error('Review reuse rights for '+item.file);
  const original=info.url.split('?')[0];let bytes=new Uint8Array(await fs.readFile('public/audio/'+item.id+'.ogg').catch(()=>[]));if(bytes.length!==info.size){if(existingOnly)continue;const response=await download(original);if(!response.ok)throw new Error('Download failed: '+item.id+' ('+response.status+')');bytes=new Uint8Array(await response.arrayBuffer());}if(bytes.length!==info.size||new TextDecoder().decode(bytes.slice(0,4))!=='OggS')throw new Error('Invalid original audio: '+item.id);
  await fs.writeFile('public/audio/'+item.id+'.ogg',bytes);
  Object.assign(item,{src:'/audio/'+item.id+'.ogg',source:original,page:'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(item.file.replace(/ /g,'_')),author:meta.Artist.value.replace(/<[^>]*>/g,''),license:meta.LicenseShortName.value,licenseURL:meta.LicenseUrl.value,changes:'Original Ogg file unchanged.',sha256:createHash('sha256').update(bytes).digest('hex')});
  const pieces=new URL(original).pathname.split('/'),derivative='https://upload.wikimedia.org/wikipedia/commons/transcoded/'+pieces.slice(-3).join('/')+'/'+pieces.at(-1)+'.mp3';
  const existingMP3=await fs.readFile('public/audio/'+item.id+'.mp3').catch(()=>null);let compressed=existingMP3;if(!compressed&&!existingOnly){const mp3=await download(derivative);if(mp3.ok){compressed=new Uint8Array(await mp3.arrayBuffer());await fs.writeFile('public/audio/'+item.id+'.mp3',compressed);}}if(compressed){item.mp3='/audio/'+item.id+'.mp3';item.mp3Source=derivative;item.changes+=' MP3 supplied by Wikimedia’s transcode service.';}
  prepared.push(item);
  console.log('Prepared '+item.name+' · '+item.license+' · '+bytes.length+' bytes');
}
await fs.writeFile('public/licensed-audio.js','// Rights and exact identity checked against the linked creator file pages.\nexport const licensedAudio='+JSON.stringify(prepared,null,2)+';\n');
