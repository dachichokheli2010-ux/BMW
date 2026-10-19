import {models,credits} from './models.js';
import {additionalModels,electricModels,newCredits} from './new-models.js';
import {extendedModels,extendedElectricModels} from './extended-models.js';
import {nextModels,nextElectricModels,photoUpgrades} from './next-models.js';
import {electricModelVariants} from './electric-model-variants.js';
import {galleries} from './galleries.js';
import {exactViews} from './exact-views.js';
import {modelPhotoDimensions} from './model-photo-dimensions.js';
import {engineReferenceAssets} from './engine-reference-assets.js';

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
// Family references are useful photographs, with their actual subject stated.
// They are never upgraded to an exact vehicle/revision match by sharing a code.
const referenceRows=[
 ['N55','images/n55.webp','N55 in a 2013 X5 xDrive35i. Engine-family reference; covers and installation differ across applications.'],
 ['S65','images/s65.webp','S65 V8 reference. The regular 4.0-litre M3 and 4.4-litre GTS are different revisions.'],
 ['S63','images/s63.webp','S63 V8 in an M5. Engine-family reference; individual M5, M6, M8 and X M installations differ.'],
 ['S63TU','images/s63.webp','Related S63-family V8 in a later M5. This is a family reference, not a photograph verified as the F10 S63TU installation.'],
 ['S54','images/s54-ref.webp','S54B32 naturally aspirated straight-six. Family reference; model-specific intake and engine-bay details differ.'],
 ['S54B32','images/s54-ref.webp','S54B32 straight-six reference. This photograph is not verified as a Z4 M engine-bay installation.'],
 ['S85','images/s85-ref.webp','S85 V10 engine-family reference. The M5 and M6 have different engine-bay packaging.'],
 ['S55','images/s55-ref.webp','S55 in an M4. Family reference; M2 Competition, CS and GTS versions have different equipment and ratings.'],
 ['S58','images/s58-ref.webp','S58 straight-six engine-family reference. Output and installation remain specific to each car.'],
 ['S62','images/new/s62-engine.webp','S62 V8 engine-family reference.'],
 ['M54','images/new/m54-b25-family.webp','M54B25 engine pictured. This is an M54-family reference, not the 3.0-litre M54B30 specification in the 330i and 530i records.'],
 ['N54','images/new/n54-engine.webp','N54 twin-turbo straight-six. Family reference; covers and installation can differ.'],
 ['B48','images/new/b48-family.webp','B48 four-cylinder engine-family reference. Longitudinal and transverse installations differ.'],
 ['B46','images/new/b48-family.webp','Related B48-family four-cylinder pictured. The selected B46 emissions variant and its installation are not established by this photograph.'],
 ['B58','images/local/b58-engine.webp','B58 straight-six engine-family reference. Covers, revisions and vehicle installations differ.']
];
const newReferenceRows=[
 ['S14','s14','S14 in a 1988 E30 M3. Family reference; the Sport Evolution has a different displacement.'],
 ['M88','m88','M88 museum display in Munich. The foreground engine is the M88 reference; this is not an installed M1 engine-bay photograph.'],
 ['M88/3','m88-3','M88/3 museum engine, exhaust side. Installation differs between the M5 and M635CSi.'],
 ['S50B30','s50-b32','S50B32 museum engine pictured. Related S50-family reference; this is not the 3.0-litre S50B30 revision.'],
 ['S50B32','s50-b32','S50B32 museum engine in Munich. Family reference rather than a Z3 M engine-bay photograph.'],
 ['S38B36','s38-b36','S38B36 in an E34 M5 3.6. Photographed vehicle year and equipment may differ.'],
 ['M10 / turbo','m10-turbo','BMW 2002 turbo engine bay. Photographed year and individual vehicle specification are not established.'],
 ['S70','s70','S70B56 V12 in a BMW 850CSi. Vehicle year and market are not established by the photograph.'],
 ['M73','m73','M73 V12 in an E38 750iL Individual. Individual equipment and year may differ.'],
 ['M30','m30','M30 museum engine with a carburettor intake. Family reference; the selected 3.0 CSL uses a different fuel-system specification.'],
 ['M20','m20','M20 museum engine. Family reference; the photographed revision is not identified as the 323i’s 2.3-litre engine.'],
 ['S68 + eDrive','s68','S68 combustion engine in an XM. This shows the V8, not the electric motor or every installation of the M Hybrid system.'],
 ['B38 + eDrive','b38','B38-family three-cylinder in a MINI Cooper. Related engine reference; this is not the i8’s rear-mounted installation or its electric motor.'],
 ['N63','n63','N63 technical-update V8 in a BMW F10 550i. Family reference; the M850i uses a later revision and different installation.'],
 ['eDrive','i3-drive','BMW i3 electric drive unit shown in 2013. System reference: later i4, i5, i7 and iX drive units have different generations, motors and installation.']
];
export const enginePhotoReferences=Object.freeze(Object.fromEntries([
 ...referenceRows.map(([code,src,caption])=>[code,{src,credit:engineAssetCredits[src],caption}]),
 ...newReferenceRows.filter(([,key])=>engineReferenceAssets[key]).map(([code,key,caption])=>[code,{...engineReferenceAssets[key],caption}])
].map(([code,photo])=>[code,Object.freeze({...photo,referenceCode:code,angle:code==='eDrive'?'Electric drive-unit reference':code.includes('+')?'Combustion engine reference':'Engine-family reference',matchStatus:'engine-family-reference'})])));
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
// These three Commons descriptions explicitly permit reuse with attribution.
// They are an allowlist, not acceptance of any image labelled "Attribution".
const checkedAttributionPages=new Map([
 ['/wiki/File:BMW_530i_(E60)_Facelift_20090615_front.JPG','M 93'],
 ['/wiki/File:BMW_530i_(E60)_Facelift_20090615_rear.JPG','M 93'],
 ['/wiki/File:BMW_M3_E30_front_20090514.jpg','Rudolf Stricker']
]);
export function photoRightsStatus(photo){
  const credit=photo?.credit;
  if(!credit||!credit.author||!credit.license||!https(credit.page))return 'missing-provenance';
  let host;try{host=new URL(credit.page).hostname;}catch{return 'missing-provenance';}
  if(host!=='commons.wikimedia.org')return 'permission-unverified';
  const attribution=/^Attribution(?:-only)?(?:\s|$)/.test(credit.license)&&checkedAttributionPages.get(decodeURIComponent(new URL(credit.page).pathname))===credit.author;
  if(!/^(?:CC BY(?:-SA)?\s|CC0\b|Public domain\b)/i.test(credit.license)&&!attribution)return 'license-unverified';
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
  const exact=matchedEngineModelIds.includes(model.id)&&raw.engine?{src:raw.engine,angle:raw.engineAngle||'Engine',caption:raw.imageNote||'',credit:engineAssetCredits[raw.engine],matchStatus:'model-engine-reference'}:null;
  return [exact,enginePhotoReferences[model.code]].filter(Boolean);
}
function unique(photos){return photos.filter((photo,index)=>photo.src&&photos.findIndex(other=>other.src===photo.src)===index);}
function reasonFor(photo,mode,model){
  const rights=photoRightsStatus(photo);
  if(rights!=='licensed')return rights;
  if(!/^images\/[A-Za-z0-9_./-]+\.webp$/.test(photo.src||''))return 'local-optimized-asset-unavailable';
  if(mode==='engine'&&photo.referenceCode===model.code&&enginePhotoReferences[model.code]?.src===photo.src)return null;
  if(mode==='engine'&&!matchedEngineModelIds.includes(model.id))return 'engine-application-unverified';
  // Extra family-gallery photos do not establish the selected engine revision.
  if(mode==='engine'&&photo.src!==sourceModel(model).engine)return 'engine-application-unverified';
  return null;
}

/** Reusable local photographs; exact applications and family references stay distinct. */
export function modelPhotos(model,{mode='car'}={}){
  if(!model)return [];
  if(model.approvedPhotos)return model.approvedPhotos[mode]||[];
  const candidates=mode==='engine'?engineCandidates(model):exteriorCandidates(model);
  return unique(candidates).filter(photo=>!reasonFor(photo,mode,model)).map(photo=>({...photo,
    credit:photo.src==='images/new/e60-530i.webp'?{...photo.credit,label:'BMW 530i E60 facelift, front view (2009)',url:photo.credit.page}:photo.credit,
    caption:photo.src==='images/new/e60-530i.webp'?'Facelift E60 530i photographed in 2009. Generation/body reference; its engine, year and equipment differ from the early M54 specification on this page.':mode==='car'&&variantReferences.has(model.id)?model.photoNote||photo.caption:photo.caption,
    ...modelPhotoDimensions[photo.src],
    rightsStatus:'licensed',matchStatus:mode==='engine'?photo.matchStatus:'generation-body-reference'
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
    return {slot,label,required,status:photo?'available':'unavailable',photo:photo||null,referenceOnly:slot==='engine'&&!!photo&&photo.matchStatus!=='model-engine-reference',
      reason:photo?null:slot==='detail'?'No matching, licensed detail photograph has been identified.':slot==='engine'?'No verified photograph of the selected model’s engine or powertrain is available.':'No matching, licensed photograph with this view identified is available.'};
  });
  return {slots,approved,engine,rejected,issues:rejected.map(photo=>`${photo.src}: ${photo.reason}`)};
}
