import {models,credits} from './models.js';
import {additionalModels,electricModels} from './new-models.js';
import {extendedModels,extendedElectricModels} from './extended-models.js';
import {nextModels,nextElectricModels,photoUpgrades} from './next-models.js';
import {officialModern,officialModernCredits} from './official-modern.js';
import {officialHeritage,officialHeritageCredits} from './official-heritage.js';
import {enrichModel} from './verified-specs.js';

const originalCredits={f10:0,e92:2,f90:4,f22:6,f32:7,f13:8,f25:9,f15:10,e46:11,e60:12,f80:13,f82:14,g80:15,e39:20,'e46-330i':21,'e60-530i':22,'e90-335i':23,'e92-335i':24,'g20-330i':28,'f10-m5':29};
const electricIds=new Set([...electricModels,...extendedElectricModels,...nextElectricModels].map(model=>model.id));
const official={...officialHeritage,...officialModern};
export const allModels=[...models,...additionalModels,...extendedModels,...nextModels,...electricModels,...extendedElectricModels,...nextElectricModels].map(original=>{
  const model={...original,carCredit:original.carCredit||credits[originalCredits[original.id]],...photoUpgrades[original.id]};
  if(official[model.id]){
    Object.assign(model,official[model.id]);
    model.views=official[model.id].views||[];
    model.officialGallery=true;
  }
  if(!model.powertrain)model.powertrain=electricIds.has(model.id)?'Electric':model.hybridNote?'Plug-in hybrid':'Petrol';
  return enrichModel(model);
});
export const allElectricModels=allModels.filter(model=>electricIds.has(model.id));
export const officialCredits=[...new Map([...officialModernCredits,...officialHeritageCredits].map(credit=>[credit.original||credit.page,credit])).values()];
