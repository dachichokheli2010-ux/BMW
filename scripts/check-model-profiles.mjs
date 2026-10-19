import assert from 'node:assert/strict';
import fs from 'node:fs';
import {allModels,allElectricModels} from '../public/catalog.js';
import {buildModelProfile,PROFILE_SCHEMA_VERSION,profileFieldDefinitions,profileSections,verifiedProfileExtensions} from '../public/model-profiles.js';
import {modelPhotos,auditModelPhotos,photoRightsStatus,matchedEngineModelIds,requiredPhotoSlots} from '../public/model-photo-policy.js';
import {responsivePhotoData} from '../public/responsive-photo-data.js';
import {responsivePhotoAttributes,photoBlurStyle} from '../public/responsive-photos.js';
import {storyFor} from '../public/car-stories.js';
import {renderModelProfile} from '../public/model-profile-ui.js';
import {parseHTML} from 'linkedom';

let groups=0;
function check(label,callback){callback();groups++;console.log('PASS Profiles: '+label);}
const flatten=profile=>profile.sections.flatMap(section=>section.fields);
const fieldsOf=model=>Object.fromEntries(flatten(model.profile||buildModelProfile(model)).map(field=>[field.id,field]));
const known=new Map(allModels.map(model=>[model.id,model]));
const sourceURL=value=>{assert.equal(new URL(value).protocol,'https:');};

check('every catalog model has the same complete, explicit profile schema',()=>{
  assert.equal(allModels.length,93);assert.equal(allElectricModels.length,16);
  assert.equal(new Set(profileFieldDefinitions.map(field=>field.id)).size,profileFieldDefinitions.length);
  assert.equal(new Set(profileSections.map(section=>section.id)).size,profileSections.length);
  for(const model of allModels){
    const profile=model.profile;assert.ok(profile,model.id);assert.equal(profile.id,model.id);assert.equal(profile.schemaVersion,PROFILE_SCHEMA_VERSION);
    assert.deepEqual(profile.sections.map(section=>section.id),profileSections.map(section=>section.id));
    assert.deepEqual(flatten(profile).map(field=>field.id),profileFieldDefinitions.map(field=>field.id));
    for(const section of profile.sections)assert.ok(section.label&&section.fields.length,model.id+': no empty section');
    const counts={verified:0,sourceLinked:0,unavailable:0,notApplicable:0},keys={'verified':'verified','source-linked':'sourceLinked',unavailable:'unavailable','not-applicable':'notApplicable'};
    for(const field of flatten(profile)){assert.ok(Object.hasOwn(keys,field.status),model.id+': '+field.id);counts[keys[field.status]]++;}
    assert.deepEqual(profile.summary,{total:profileFieldDefinitions.length,...counts});
  }
});

check('published values retain sources, scope, units and explicit uncertainty',()=>{
  const dimensional=new Set(['displacement','power','torque','redline','combustionPower','batteryCapacity','weight','dimensions','wheelbase','fuelTank','acceleration100','topSpeed','fuelConsumption','co2','energyConsumption','electricRange']);
  for(const model of allModels)for(const field of flatten(model.profile)){
    assert.ok(field.label&&field.section);
    if(['unavailable','not-applicable'].includes(field.status)){assert.equal(field.value,null,model.id+': no guessed '+field.id);assert.ok(field.note);continue;}
    assert.notEqual(field.value,null);assert.notEqual(field.value,undefined);assert.notEqual(field.value,'');assert.ok(field.sources.length,model.id+': '+field.id+' has no source');
    if(dimensional.has(field.id))assert.ok(field.unit,model.id+': missing unit for '+field.id);
    for(const source of field.sources){sourceURL(source.url);assert.ok(source.title);assert.ok(['specification','unknown'].includes(source.yearType));if(source.yearType==='unknown')assert.equal(source.year,null);else assert.ok(Number.isInteger(source.year)&&source.year>=1886&&source.year<=2100);}
    if(field.status==='source-linked'){assert.ok(field.note,model.id+': inherited value needs uncertainty');assert.equal(field.sources[0].url,model.source);}
  }
  for(const model of allModels){assert.equal(model.profile.context.market,model.market||null);assert.equal(fieldsOf(model).power.value,Number(model.power));assert.equal(fieldsOf(model).power.unit,model.powerUnit);}
});

check('exact launch configurations keep PS, hp, mph and mass conventions separate',()=>{
  const f10=fieldsOf(known.get('f10-m5')),g80=fieldsOf(known.get('g80')),e92=fieldsOf(known.get('e92'));
  assert.equal(f10.power.value,560);assert.equal(f10.power.unit,'PS');assert.equal(f10.weight.value,1870);assert.match(f10.weight.note,/DIN/);assert.equal(f10.acceleration100.value,4.4);
  assert.equal(e92.power.value,420);assert.equal(e92.power.unit,'PS');assert.equal(e92.acceleration100.value,4.8);
  assert.equal(g80.acceleration100.value,null);assert.equal(g80.acceleration100.status,'unavailable');assert.match(g80.acceleration100.note,/0–60 mph/);
  assert.equal(g80.topSpeed.unit,'mph');assert.equal(g80.dimensions.unit,'in');assert.equal(known.get('g80').profile.context.modelYear,2021);
  assert.equal(fieldsOf(known.get('f90')).weight.status,'unavailable','Do not borrow F10 mass for F90');
  for(const [modelId,extensions]of Object.entries(verifiedProfileExtensions))for(const [fieldId,expected]of Object.entries(extensions)){
    const actual=fieldsOf(known.get(modelId))[fieldId];assert.equal(actual.status,'verified');assert.deepEqual(actual.value,expected.value);assert.deepEqual(actual.sources,expected.sources);
    assert.ok(actual.sources.every(source=>source.locator),'New checked facts need a precise locator');
  }
  assert.equal(f10.fuelTank.value,80);assert.equal(f10.fuelConsumption.value,9.9);assert.match(f10.fuelConsumption.note,/not WLTP/);assert.equal(f10.co2.value,232);
});

check('missing measurements and years stay unavailable; factories are not inferred from chassis',()=>{
  const original={id:'unknown-generation-example',generation:'M SERIES / F10',code:'S63TU',power:560,powerUnit:'PS',market:'Unverified market',source:'https://example.com/reference',description:'Existing text.'};
  const before=JSON.stringify(original),profile=buildModelProfile(original),fields=Object.fromEntries(flatten(profile).map(field=>[field.id,field]));
  assert.equal(JSON.stringify(original),before,'Profile construction must not mutate source data');assert.deepEqual(buildModelProfile(original),profile);
  for(const id of ['productionYears','history','displacement','weight','dimensions','fuelTank','acceleration100','knownIssues','maintenance','previousGeneration','nextGeneration']){assert.equal(fields[id].status,'unavailable',id);assert.equal(fields[id].value,null,id);}
  assert.equal(fields.power.status,'source-linked');assert.equal(profile.context.modelYear,null);assert.equal(fields.power.sources[0].year,null);assert.equal(fields.power.sources[0].yearType,'unknown');
  const unreferenced=buildModelProfile({...original,source:undefined});assert.ok(flatten(unreferenced).every(field=>field.value===null),'No published fact may use a fabricated source');
  const linkedYear=fieldsOf({...original,modelYear:2011});assert.equal(linkedYear.modelYear.status,'source-linked');assert.equal(linkedYear.modelYear.sources[0].yearType,'specification');
});

check('electric variants preserve their own powertrain rather than inheriting xDrive facts',()=>{
  for(const id of ['u11-ix1-edrive20','u10-ix2-edrive20']){
    const model=known.get(id),fields=fieldsOf(model);assert.equal(model.powertrain,'Electric');assert.doesNotMatch(model.layout,/all-wheel|AWD/i);assert.equal(fields.drivetrain.status,'source-linked');assert.equal(fields.drivetrain.value,'Front-wheel drive');
    for(const field of ['displacement','redline','fuelTank','fuelConsumption','combustionPower'])assert.equal(fields[field].status,'not-applicable',id+': '+field);
  }
  for(const model of allElectricModels){assert.equal(fieldsOf(model).engineCode.status,'not-applicable');assert.equal(fieldsOf(model).fuelTank.value,null);}
});

function imageDimensions(filename){
  const bytes=Buffer.isBuffer(filename)?filename:fs.readFileSync(filename);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
  for(let offset=12;offset+8<=bytes.length;){const type=bytes.toString('ascii',offset,offset+4),size=bytes.readUInt32LE(offset+4),start=offset+8;
    if(type==='VP8X')return {width:bytes.readUIntLE(start+4,3)+1,height:bytes.readUIntLE(start+7,3)+1};
    if(type==='VP8L'){const data=bytes.readUInt32LE(start+1);return {width:(data&0x3fff)+1,height:((data>>>14)&0x3fff)+1};}
    if(type==='VP8 ')return {width:bytes.readUInt16LE(start+6)&0x3fff,height:bytes.readUInt16LE(start+8)&0x3fff};
    offset=start+size+(size%2);
  }throw new Error('No WebP image dimensions found: '+filename);
}

check('every displayed photo has recorded reusable rights and actual intrinsic dimensions',()=>{
  const checked=new Set();
  for(const model of allModels)for(const mode of ['car','engine'])for(const photo of modelPhotos(model,{mode})){
    assert.equal(photoRightsStatus(photo),'licensed');assert.equal(new URL(photo.credit.page).hostname,'commons.wikimedia.org');assert.ok(photo.credit.author&&photo.credit.license&&photo.credit.url);
    assert.doesNotMatch(photo.credit.license,/all rights reserved|permission required/i);assert.match(photo.src,/^images\/[\w./-]+\.webp$/);assert.ok(fs.existsSync('public/'+photo.src));
    assert.ok(Number.isInteger(photo.width)&&photo.width>0&&Number.isInteger(photo.height)&&photo.height>0,photo.src);
    if(!checked.has(photo.src)){assert.deepEqual({width:photo.width,height:photo.height},imageDimensions('public/'+photo.src),photo.src);checked.add(photo.src);}
    assert.equal(photo.rightsStatus,'licensed');if(mode==='engine'){assert.ok(['model-engine-reference','engine-family-reference'].includes(photo.matchStatus));if(photo.matchStatus==='engine-family-reference'){assert.equal(photo.referenceCode,model.code);assert.ok(photo.caption.length>20);}}else assert.equal(photo.matchStatus,'generation-body-reference');
  }
  assert.ok(checked.size>0);
  const photo={credit:{author:'Example',license:'CC BY-SA 4.0',page:'https://commons.wikimedia.org/wiki/File:Example.webp',url:'https://creativecommons.org/licenses/by-sa/4.0'}};
  assert.notEqual(photoRightsStatus({...photo,credit:{...photo.credit,page:'https://www.press.bmwgroup.com/example'}}),'licensed');
  assert.notEqual(photoRightsStatus({...photo,credit:{...photo.credit,page:'https://commons.wikimedia.org.attacker.example/file'}}),'licensed');
  assert.notEqual(photoRightsStatus({...photo,credit:{...photo.credit,license:'All rights reserved'}}),'licensed');
  assert.notEqual(photoRightsStatus({...photo,credit:{...photo.credit,author:''}}),'licensed');
  assert.notEqual(photoRightsStatus({...photo,credit:{...photo.credit,author:'M 93',license:'Attribution'}}),'licensed','An unchecked attribution-only page must remain unapproved');
});

check('every car has an individual story and missing research remains inspectable without empty photo tiles',()=>{
  const stories=new Set();
  for(const model of allModels){
    const story=storyFor(model);assert.ok(story?.story&&story.bestFor&&story.tradeOff,model.id);assert.ok(story.facts.length>=2);assert.equal(story.source,model.source);assert.ok(!stories.has(story.story));stories.add(story.story);
    const {document}=parseHTML(renderModelProfile(model));assert.ok(document.querySelector('.car-story h2'));assert.equal(document.querySelectorAll('.car-facts > p').length,2);
    assert.equal(document.querySelectorAll('.profile-photo-placeholder').length,0);assert.equal(document.querySelector('.profile-research')?.hasAttribute('open'),false);
    for(const image of document.querySelectorAll('.profile-photo-slot img'))assert.ok(image.getAttribute('width')&&image.getAttribute('height'));
    assert.equal(document.querySelectorAll('[data-profile-field]').length,flatten(model.profile).filter(field=>field.status!=='not-applicable').length);
  }
});

check('all required views are explicit and engine-family references retain their scope',()=>{
  const expected=['hero','side','rear','front','dashboard','seats','engine','detail'];assert.deepEqual(requiredPhotoSlots.map(item=>item.slot),expected);
  for(const model of allModels){
    const review=auditModelPhotos(model);assert.deepEqual(review.slots.map(item=>item.slot),expected);assert.deepEqual(model.profile.photos,review.slots);
    for(const slot of review.slots){assert.ok(slot.label);if(slot.status==='unavailable'){assert.equal(slot.photo,null);assert.ok(slot.reason);}else{assert.equal(slot.status,'available');assert.ok(slot.photo);assert.equal(photoRightsStatus(slot.photo),'licensed');}}
    const engine=modelPhotos(model,{mode:'engine'});
    assert.ok(engine.length,model.id+' has an identified engine or drive-system reference');
    if(!matchedEngineModelIds.includes(model.id))for(const photo of engine)assert.equal(photo.matchStatus,'engine-family-reference',model.id);
    if(engine.length)assert.equal(model.engine,engine[0].src);
    assert.equal(model.car,review.approved[0]?.src||'images/photo-unavailable.svg');
    for(const rejected of review.rejected)assert.ok(rejected.src&&rejected.reason);
  }
  const f10Photo=modelPhotos(known.get('f10-m5'),{mode:'engine'})[0];assert.equal(f10Photo.matchStatus,'engine-family-reference');assert.match(f10Photo.caption,/not a photograph verified as the F10/);assert.equal(auditModelPhotos(known.get('f10-m5')).slots.find(slot=>slot.slot==='engine').referenceOnly,true);
  const m54=modelPhotos(known.get('e46-330i'),{mode:'engine'})[0];assert.match(m54.caption,/M54B25/);assert.match(m54.caption,/not the 3.0-litre M54B30/);
  const interior={id:'synthetic-interior-reference',views:[{src:'images/angles/e92-0.webp',angle:'Interior',credit:{author:'Example',license:'CC BY-SA 4.0',page:'https://commons.wikimedia.org/wiki/File:Example.webp',url:'https://creativecommons.org/licenses/by-sa/4.0'}}]};
  const slots=auditModelPhotos(interior).slots;assert.equal(slots.find(slot=>slot.slot==='dashboard').status,'unavailable');assert.equal(slots.find(slot=>slot.slot==='seats').status,'unavailable');
});

check('responsive variants preserve image identity, proportions and dimensioned blur previews',()=>{
  const photos=[...new Map(allModels.flatMap(model=>[...modelPhotos(model),...modelPhotos(model,{mode:'engine'})]).map(photo=>[photo.src,photo])).values()];
  for(const photo of photos){
    const data=responsivePhotoData[photo.src];assert.ok(data,photo.src+': responsive data missing');assert.deepEqual({width:data.width,height:data.height},{width:photo.width,height:photo.height});
    assert.ok(data.variants.some(variant=>variant.src===photo.src&&variant.width===photo.width),'Original image must remain in srcset');
    let previousWidth=0;
    for(const variant of data.variants){assert.ok(variant.width>previousWidth&&variant.width<=data.width);previousWidth=variant.width;assert.ok(Math.abs(variant.height-data.height*variant.width/data.width)<=1);assert.deepEqual(imageDimensions('public/'+variant.src),{width:variant.width,height:variant.height});}
    assert.match(data.placeholder,/^data:image\/webp;base64,/);const tiny=imageDimensions(Buffer.from(data.placeholder.split(',')[1],'base64'));assert.ok(tiny.width<=32&&tiny.height>0);
    const attributes=responsivePhotoAttributes(photo,'110px');assert.ok(attributes.includes(`width="${photo.width}"`));assert.ok(attributes.includes(`height="${photo.height}"`));assert.ok(attributes.includes('srcset="'));assert.ok(attributes.includes('sizes="110px"'));assert.ok(photoBlurStyle(photo.src).includes(data.placeholder));
  }
});

console.log(`Model profiles: ${groups} verification groups passed for ${allModels.length} models.`);
