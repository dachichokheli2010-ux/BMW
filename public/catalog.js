import {models,credits} from './models.js';
import {additionalModels,electricModels} from './new-models.js';
import {extendedModels,extendedElectricModels} from './extended-models.js';
import {nextModels,nextElectricModels,photoUpgrades} from './next-models.js';
import {officialModern,officialModernCredits} from './official-modern.js';
import {officialHeritage,officialHeritageCredits} from './official-heritage.js';
import {electricModelVariants} from './electric-model-variants.js';
import {enrichModel} from './verified-specs.js';
import {buildModelProfile} from './model-profiles.js';
import {auditModelPhotos} from './model-photo-policy.js';

const originalCredits={f10:0,e92:2,f90:4,f22:6,f32:7,f13:8,f25:9,f15:10,e46:11,e60:12,f80:13,f82:14,g80:15,e39:20,'e46-330i':21,'e60-530i':22,'e90-335i':23,'e92-335i':24,'g20-330i':28,'f10-m5':29};
const electricIds=new Set([...electricModels,...extendedElectricModels,...nextElectricModels,...electricModelVariants].map(model=>model.id));
const official={...officialHeritage,...officialModern};
const existingModels=[...models,...additionalModels,...extendedModels,...nextModels,...electricModels,...extendedElectricModels,...nextElectricModels].map(original=>{
  const model={...original,carCredit:original.carCredit||credits[originalCredits[original.id]],...photoUpgrades[original.id]};
  if(official[model.id]){
    Object.assign(model,official[model.id]);
    model.views=official[model.id].views||[];
    model.officialGallery=true;
  }
  if(!model.powertrain)model.powertrain=electricIds.has(model.id)?'Electric':model.hybridNote?'Plug-in hybrid':'Petrol';
  return enrichModel(model);
});
const modelById=new Map(existingModels.map(model=>[model.id,model]));
const addedElectricModels=electricModelVariants.map(({photoBase,...variant})=>{
  const reference=modelById.get(photoBase);
  if(!reference)throw new Error(`Missing photo reference for ${variant.id}.`);
  // Only photography is shared. Copying a whole xDrive30 record used to give
  // single-motor eDrive20 variants an AWD drivetrain and a 230 kW boost note.
  const {photoNote,...details}=variant;
  return enrichModel({...details,photoNote,car:reference.car,carCredit:reference.carCredit,width:reference.width,height:reference.height,views:(reference.views||[]).map(view=>({...view,caption:photoNote})),powertrain:'Electric'});
});
export const allModels=[...existingModels,...addedElectricModels].map(model=>{
  const photoReview=auditModelPhotos(model),profile=buildModelProfile(model),hero=photoReview.approved[0],engine=photoReview.engine[0];
  return {...model,profile,photoReview,approvedPhotos:{car:photoReview.approved,engine:photoReview.engine},
    car:hero?.src||'images/photo-unavailable.svg',carCredit:hero?.credit||null,
    width:hero?.width,height:hero?.height,photoAngle:hero?.angle,photoNote:hero?.caption||'No matching, licensed exterior photograph is available.',
    engine:engine?.src||null,imageNote:engine?.caption||'No verified photograph of the selected model’s engine or powertrain is available.',
    views:photoReview.approved.slice(1),officialGallery:true};
});
export const allElectricModels=allModels.filter(model=>electricIds.has(model.id));
export const officialCredits=[...new Map([...officialModernCredits,...officialHeritageCredits].map(credit=>[credit.original||credit.page,credit])).values()];
