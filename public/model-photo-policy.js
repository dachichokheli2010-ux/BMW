import {models,credits} from './models.js';
import {additionalModels,electricModels,newCredits} from './new-models.js';
import {extendedModels,extendedElectricModels} from './extended-models.js';
import {nextModels,nextElectricModels,photoUpgrades} from './next-models.js';
import {electricModelVariants} from './electric-model-variants.js';
import {galleries} from './galleries.js';
import {exactViews} from './exact-views.js';
import {modelPhotoDimensions} from './model-photo-dimensions.js';

// These are the existing catalogue's inspected Commons references. A credit is
// evidence of the recorded license, not a claim that a manufacturer owns a photo.
// Manufacturer pages with no applicable permission are retained in the audit,
// but never passed to the public gallery.
const originalCredits={f10:0,e92:2,f90:4,f22:6,f32:7,f13:8,f25:9,f15:10,e46:11,e60:12,f80:13,f82:14,g80:15,e39:20,'e46-330i':21,'e60-530i':22,'e90-335i':23,'e92-335i':24,'g20-330i':28,'f10-m5':29};
const originals=new Map([...models,...additionalModels,...extendedModels,...nextModels,...electricModels,...extendedElectricModels,...nextElectricModels].map(model=>[model.id,model]));
const variantReferences=new Map(electricModelVariants.map(model=>[model.id,model.photoBase]));
const engineCredits={
  e92:credits[3],f90:credits[5],e60:credits[17],f82:credits[18],e39:credits[25],'e92-335i':credits[26]
};
const engineAssetCredits={
  'images/n55.webp':credits[1],'images/s65.webp':credits[3],'images/s63.webp':credits[5],
  'images/s54-ref.webp':credits[16],'images/s85-ref.webp':credits[17],'images/s55-ref.webp':credits[18],
  'images/s58-ref.webp':credits[19],'images/new/s62-engine.webp':credits[25],
  'images/new/n54-engine.webp':credits[26],'images/new/m54-b25-family.webp':credits[27],
  'images/new/b48-family.webp':credits[30],'images/local/b58-engine.webp':newCredits[4]
};
// Positive model/engine matches only. Do not generalize this to every vehicle
// sharing a family code: M54B25 is not M54B30, and F90 S63 is not F10 S63TU.
export const matchedEngineModelIds=Object.freeze(Object.keys(engineCredits));
export const requiredPhotoSlots=Object.freeze([
  {slot:'hero',label:'Front three-quarter exterior'},
  {slot:'side',label:'Side exterior'},
  {slot:'rear',label:'Rear exterior'},
  {slot:'front',label:'Straight front exterior'},
  {slot:'dashboard',label:'Dashboard'},
  {slot:'seats',label:'Seats'},
  {slot:'engine',label:'Engine or electric powertrain'},
  {slot:'detail',label:'Wheel or detail',required:false}
]);

const https=value=>{try{return new URL(value).protocol==='https:';}catch{return false;}};
export function photoRightsStatus(photo){
  const credit=photo?.credit;
  if(!credit||!credit.author||!credit.license||!https(credit.page))return 'missing-provenance';
  let host;try{host=new URL(credit.page).hostname;}catch{return 'missing-provenance';}
  if(host!=='commons.wikimedia.org')return 'permission-unverified';
  if(!/^(?:CC BY(?:-SA)?\s|CC0\b|Public domain\b)/i.test(credit.license))return 'license-unverified';
  if(!credit.url)return 'missing-provenance';
  return 'licensed';
}

function sourceModel(model){return originals.get(variantReferences.get(model.id)||model.id)||model;}
function exteriorCandidates(model){
  const raw=sourceModel(model),baseId=raw.id,upgrade=photoUpgrades[baseId];
  const caption=model.photoNote||raw.photoNote||'Generation and body-style reference; photographed year, market and trim may differ.';
  const hero=(entry,credit,fallbackCaption)=>entry?.car?{src:entry.car,angle:entry.photoAngle||'Exterior reference',caption:entry.photoNote||fallbackCaption,credit:entry.carCredit||credit,width:entry.width,height:entry.height}:null;
  return [
    hero(model,null,caption),
    hero(upgrade,null,caption),
    hero(raw,credits[originalCredits[baseId]],caption),
    ...(model.views||[]),...(upgrade?.views||[]),...(raw.views||[]),
    ...(exactViews[baseId]||[]),...(galleries.cars[baseId]||[])
  ].filter(Boolean);
}
function engineCandidates(model){
  const raw=sourceModel(model);
  if(!raw.engine)return [];
  return [{src:raw.engine,angle:raw.engineAngle||'Engine',caption:raw.imageNote||'',credit:engineAssetCredits[raw.engine]},...(galleries.engines[raw.code]||[])];
}
function unique(photos){return photos.filter((photo,index)=>photo.src&&photos.findIndex(other=>other.src===photo.src)===index);}
function reasonFor(photo,mode,model){
  const rights=photoRightsStatus(photo);
  if(rights!=='licensed')return rights;
  if(!/^images\/[A-Za-z0-9_./-]+\.webp$/.test(photo.src||''))return 'local-optimized-asset-unavailable';
  if(mode==='engine'&&!matchedEngineModelIds.includes(model.id))return 'engine-application-unverified';
  // Extra family-gallery photos do not establish the selected engine revision.
  if(mode==='engine'&&photo.src!==sourceModel(model).engine)return 'engine-application-unverified';
  return null;
}

/** Only recorded reusable, local images with the selected generation/body match. */
export function modelPhotos(model,{mode='car'}={}){
  if(!model)return [];
  if(model.approvedPhotos)return model.approvedPhotos[mode]||[];
  const candidates=mode==='engine'?engineCandidates(model):exteriorCandidates(model);
  return unique(candidates).filter(photo=>!reasonFor(photo,mode,model)).map(photo=>({...photo,
    caption:variantReferences.has(model.id)?model.photoNote||photo.caption:photo.caption,
    ...modelPhotoDimensions[photo.src],
    rightsStatus:'licensed',matchStatus:mode==='engine'?'model-engine-reference':'generation-body-reference'
  }));
}

const slotMatches={
  hero:photo=>/front three-quarter|front 3\/4/i.test(photo.angle||''),
  side:photo=>/side|profile/i.test(photo.angle||''),
  rear:photo=>/rear/i.test(photo.angle||''),
  front:photo=>/straight front|front view/i.test(photo.angle||''),
  dashboard:photo=>/dashboard|instrument panel|cockpit/i.test(photo.angle||''),
  seats:photo=>/seats|seating/i.test(photo.angle||''),
  detail:photo=>/wheel|detail/i.test(photo.angle||'')
};

export function auditModelPhotos(model){
  if(model.photoReview)return model.photoReview;
  const approved=modelPhotos(model),engine=modelPhotos(model,{mode:'engine'});
  const rejected=['car','engine'].flatMap(mode=>unique(mode==='engine'?engineCandidates(model):exteriorCandidates(model)).flatMap(photo=>{
    const reason=reasonFor(photo,mode,model);return reason?[{src:photo.src,mode,reason,credit:photo.credit||null}]:[];
  }));
  const slots=requiredPhotoSlots.map(({slot,label,required=true})=>{
    const photo=slot==='engine'?engine[0]:approved.find(slotMatches[slot]);
    return {slot,label,required,status:photo?'available':'unavailable',photo:photo||null,
      reason:photo?null:slot==='detail'?'No matching, licensed detail photograph has been identified.':slot==='engine'?'No verified photograph of the selected model’s engine or powertrain is available.':'No matching, licensed photograph with this view identified is available.'};
  });
  return {slots,approved,engine,rejected,issues:rejected.map(photo=>`${photo.src}: ${photo.reason}`)};
}
