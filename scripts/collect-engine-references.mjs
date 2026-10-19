import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';

// The file descriptions and licenses were checked on Wikimedia Commons.
// Only downloads these explicitly selected files; never a general image scrape.
const rows=[
 ['s14','BMW S14 Engine.jpg','Sbscottw','CC BY-SA 4.0','by-sa/4.0'],
 ['m88','BMW M88 engine in BMW-Museum in Munich, Bayern.JPG','Jiří Sedláček','CC BY-SA 4.0','by-sa/4.0'],
 ['m88-3','BMW M88 3 Auspuffseite.JPG','Micham6','CC BY-SA 3.0','by-sa/3.0'],
 ['s50-b32','BMW S50 B32 engine in BMW-Museum in Munich, Bayern.JPG','Jiří Sedláček','CC BY-SA 4.0','by-sa/4.0'],
 ['s38-b36','E34M5S38B36.JPG','M536','CC BY-SA 3.0','by-sa/3.0'],
 ['m10-turbo','BMW 2002 turbo engine TCE.jpg','Stahlkocher','CC BY-SA 3.0','by-sa/3.0'],
 ['s70','Moteur barba.jpg','Barbatoss','CC BY 3.0','by/3.0'],
 ['m73','BMW 750iL Individual - Flickr - The Car Spy (21).jpg','The Car Spy','CC BY 2.0','by/2.0'],
 ['m30','BMW M30 2018.jpg','Wikisympathisant','CC BY-SA 4.0','by-sa/4.0'],
 ['m20','BMW M20 Engine.JPG','Tor635','CC BY-SA 3.0','by-sa/3.0'],
 ['s68','S68 XM.jpg','Pixelatedfacealex','CC BY-SA 4.0','by-sa/4.0'],
 ['b38','Mini Cooper engine - Tokyo Motor Show 2013.jpg','Loadbeta','CC0 1.0','publicdomain/zero/1.0'],
 ['n63','BMW N63 (TÜ).jpg','Dr.DOHC','CC BY-SA 4.0','by-sa/4.0'],
 ['i3-drive','BMW-i3-Electric Drive unit2.JPG','RudolfSimon','CC BY-SA 3.0','by-sa/3.0']
];
await fs.mkdir('public/images/engine-references',{recursive:true});
const manifest={};
for(const [id,title,author,license,licensePath]of rows){
 const name=title.replaceAll(' ','_'),hash=crypto.createHash('md5').update(name).digest('hex');
 const original=`https://upload.wikimedia.org/wikipedia/commons/${hash[0]}/${hash.slice(0,2)}/${encodeURIComponent(name)}`;
 const src=`images/engine-references/${id}.webp`,path='public/'+src;
 let downloaded=false;
 try{
  try{await fs.access(path);}catch{
   const response=await fetch(original,{headers:{'User-Agent':'APEX-BMW-Education/1.0 (credited engine reference research)'},signal:AbortSignal.timeout(30000)});
   if(!response.ok)throw new Error('HTTP '+response.status+(response.headers.get('retry-after')?' · Retry-After: '+response.headers.get('retry-after'):''));
   await sharp(Buffer.from(await response.arrayBuffer())).rotate().resize({width:1600,withoutEnlargement:true}).webp({quality:84,effort:5}).toFile(path);
   downloaded=true;
  }
  const {width,height}=await sharp(path).metadata();
  manifest[id]={src,width,height,credit:{label:title,author,license,page:'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(name),url:licensePath.startsWith('publicdomain')?'https://creativecommons.org/'+licensePath+'/':'https://creativecommons.org/licenses/'+licensePath+'/',original,changes:'Resized and converted to WebP; no subject changes.'}};
  await fs.writeFile('public/engine-reference-assets.js','// Commons file descriptions and reusable licenses checked 20 October 2026.\nexport const engineReferenceAssets='+JSON.stringify(manifest,null,2)+';\n');
  console.log(id+': '+width+' × '+height);
  if(downloaded)await new Promise(resolve=>setTimeout(resolve,6000));
 }catch(error){throw new Error(id+': '+error.message);}
}
await fs.writeFile('public/engine-reference-assets.js','// Commons file descriptions and reusable licenses checked 20 October 2026.\nexport const engineReferenceAssets='+JSON.stringify(manifest,null,2)+';\n');
await fs.writeFile('reports/engine-photo-research.json',JSON.stringify({checked:'2026-10-20',assets:manifest},null,2)+'\n');
