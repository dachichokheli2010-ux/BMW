import {auditModelPhotos} from './model-photo-policy.js';
import {storyFor} from './car-stories.js';

/** @typedef {'verified'|'source-linked'|'unavailable'|'not-applicable'} ProfileStatus */
/**
 * @typedef {Object} ProfileSource
 * @property {string} url
 * @property {string} title
 * @property {number|null} year Identified specification year; never inferred from a chassis code.
 * @property {'specification'|'unknown'} yearType
 * @property {string|null} [locator] Document page, table or section identifying the datum.
 */
/**
 * @typedef {Object} ProfileField
 * @property {string} id
 * @property {string} label
 * @property {string} section
 * @property {ProfileStatus} status
 * @property {string|number|string[]|null} value Null for unavailable or inapplicable data.
 * @property {string|null} unit Original factory unit; horsepower conventions remain distinct.
 * @property {ProfileSource[]} sources
 * @property {string|null} note
 */
/**
 * @typedef {Object} ProfilePhotoSlot
 * @property {string} slot
 * @property {string} label
 * @property {boolean} required
 * @property {'available'|'unavailable'} status
 * @property {Object|null} photo Approved photo with src, intrinsic dimensions and credit.
 * @property {string|null} reason
 */
/**
 * @typedef {Object} ModelProfile
 * @property {string} id
 * @property {number} schemaVersion
 * @property {{market:string|null,modelYear:number|null,specification:string|null}} context
 * @property {{id:string,label:string,fields:ProfileField[]}[]} sections
 * @property {ProfilePhotoSlot[]} photos
 * @property {{total:number,verified:number,sourceLinked:number,unavailable:number,notApplicable:number}} summary Field counts only.
 */

export const PROFILE_SCHEMA_VERSION=1;
const f10TechnicalSource={url:'https://www.press.bmwgroup.com/global/article/attachment/T0122682EN/178942',title:'BMW M5 technical specifications valid October 2011',year:2011,yearType:'specification'};
const f10LaunchSource={url:'https://www.press.bmwgroup.com/usa/article/detail/T0114798EN_US/introducing-the-all-new-5th-generation-bmw-m5',title:'BMW M5 launch release, 22 June 2011',year:2011,yearType:'specification'};
const m8Source=(convertible,locator)=>({url:'https://www.press.bmwgroup.com/global/article/attachment/T0296150EN/'+(convertible?'430871':'430870'),title:'BMW M8 Competition '+(convertible?'Convertible':'Coupé')+' specifications · June 2019',year:2019,yearType:'specification',locator});
const m8Extras=convertible=>({
  fuelTank:{value:68,unit:'L',sources:[m8Source(convertible,'page 3, body / fuel tank')]},
  fuelConsumption:{value:convertible?'10.8–10.6':'10.6–10.5',unit:'L/100 km',sources:[m8Source(convertible,'page 4, combined ECE consumption and footnote')],note:'2019 NEDC-equivalent values translated from WLTP, not current WLTP figures. Range reflects configuration.'},
  co2:{value:convertible?'246–241':'242–238',unit:'g/km',sources:[m8Source(convertible,'page 4, CO₂ and test-cycle footnote')],note:'2019 NEDC-equivalent combined values; configuration-dependent.'},
  suspension:{value:'Adaptive dampers; double-wishbone front axle and five-link rear axle.',sources:[m8Source(convertible,'page 3, driving dynamics / suspension')]},
  brakes:{value:'Ventilated M compound discs; six-piston front fixed calipers and single-piston rear floating calipers.',sources:[m8Source(convertible,'page 3, brakes')]},
  wheelsTires:{value:'Front 275/35 ZR20 on 9.5J × 20; rear 285/35 ZR20 on 10.5J × 20.',sources:[m8Source(convertible,'page 3, Competition tyres and rims')]},
  specialFeatures:{value:'Active M Differential and M xDrive.',sources:[m8Source(convertible,'page 4, power transfer')]}
});
// Individually checked against the named columns/pages. These additions do not
// widen the existing catalogue's launch configuration to other years/markets.
export const verifiedProfileExtensions=Object.freeze({
  'f92-m8':Object.freeze(m8Extras(false)),
  'f91-m8-convertible':Object.freeze(m8Extras(true)),
  'f10-m5':Object.freeze({
    fuelTank:{value:80,unit:'L',sources:[{...f10TechnicalSource,locator:'page 1, tank capacity'}]},
    fuelConsumption:{value:9.9,unit:'L/100 km',sources:[{...f10TechnicalSource,locator:'page 2, combined consumption'}],note:'Combined EU test cycle reported in 2011; not WLTP. Figures from different cycles are not directly comparable.'},
    co2:{value:232,unit:'g/km',sources:[{...f10TechnicalSource,locator:'page 2, CO₂ emissions'}],note:'Combined emissions for the 2011 European specification and its contemporary test cycle.'},
    suspension:{value:'Front: double-track-control-arm axle. Rear: Integral-V multi-arm axle.',sources:[{...f10TechnicalSource,locator:'page 1, chassis'}]},
    brakes:{value:'Ventilated discs: front 400 × 36; rear 396 × 24.',unit:'mm',sources:[{...f10TechnicalSource,locator:'page 1, brakes'}]},
    wheelsTires:{value:'Front: 9J × 19 wheels, 265/40 R19 102Y tyres. Rear: 10J × 19 wheels, 295/35 R19 104Y tyres.',sources:[{...f10TechnicalSource,locator:'page 1, tyres and rims'}]},
    history:{value:'BMW announced the fifth-generation M5 in June 2011. This profile describes the 2011 European launch specification.',sources:[{...f10LaunchSource,locator:'introduction'}]},
    funFacts:{value:'The two turbochargers sit between the V8’s cylinder banks, an arrangement often called a hot-V.',sources:[{...f10LaunchSource,locator:'V8 engine and turbocharger arrangement'}]},
    specialFeatures:{value:'Active M Differential.',sources:[{...f10LaunchSource,locator:'Active M Differential'}]}
  })
});
export const profileSections=Object.freeze([
  {id:'overview',label:'Overview and history'},
  {id:'powertrain',label:'Engine and powertrain'},
  {id:'vehicle',label:'Transmission and dimensions'},
  {id:'performance',label:'Performance and efficiency'},
  {id:'chassis',label:'Chassis and equipment'},
  {id:'ownership',label:'Ownership and buying'},
  {id:'context',label:'Why this car matters'},
  {id:'related',label:'Related models and generations'}
]);
export const profileFieldDefinitions=Object.freeze([
  ['overview','Overview','overview'],['history','History','overview'],['productionYears','Production years','overview'],
  ['market','Market and specification','overview'],['modelYear','Specification year','overview'],['bodyStyles','Body style represented','overview'],
  ['engineCode','Engine code','powertrain'],['engineLayout','Engine layout','powertrain'],['displacement','Displacement','powertrain'],
  ['induction','Induction','powertrain'],['power','Rated power','powertrain'],['torque','Rated torque','powertrain'],['redline','Redline','powertrain'],
  ['combustionPower','Combustion engine power','powertrain'],['batteryCapacity','Usable battery energy','powertrain'],
  ['gearboxOptions','Gearbox options','vehicle'],['drivetrain','Drivetrain','vehicle'],['weight','Weight','vehicle'],['dimensions','Length × width × height','vehicle'],['wheelbase','Wheelbase','vehicle'],['fuelTank','Fuel tank','vehicle'],
  ['acceleration100','0–100 km/h','performance'],['topSpeed','Top speed','performance'],['fuelConsumption','Fuel consumption','performance'],['co2','CO₂ emissions','performance'],
  ['energyConsumption','Electric energy consumption','performance'],['electricRange','Electric range','performance'],['charging','Charging','performance'],
  ['suspension','Suspension','chassis'],['brakes','Brakes','chassis'],['wheelsTires','Wheels and tyres','chassis'],['specialFeatures','Special features','chassis'],
  ['strengths','Known strengths','ownership'],['knownIssues','Known issues','ownership'],['buyingTips','Buying tips','ownership'],['maintenance','Maintenance notes','ownership'],
  ['funFacts','Fun facts','context'],['whyItMatters','Why this car matters','context'],
  ['relatedModels','Related models','related'],['previousGeneration','Previous generation','related'],['nextGeneration','Next generation','related']
].map(([id,label,section])=>Object.freeze({id,label,section})));

const positive=value=>Number.isFinite(Number(value))&&Number(value)>0?Number(value):null;
const present=value=>value!==undefined&&value!==null&&value!==''&&(!Array.isArray(value)||value.length>0);
const validYear=value=>Number.isInteger(value)&&value>=1886&&value<=2100?value:null;
const validURL=value=>{try{return new URL(value).protocol==='https:';}catch{return false;}};

function sourceRecord(source,year){
  if(typeof source==='string')source={url:source};
  return {url:source.url,title:source.title||source.label||'BMW factory reference',year:validYear(year),yearType:validYear(year)?'specification':'unknown',locator:source.locator||null};
}
function sourceList(model,{verified=false}={}){
  const year=verified?model.verified?.modelYear:model.modelYear;
  const candidates=verified?model.verified?.sources||[]:model.source?[model.source]:[];
  return candidates.filter(source=>validURL(typeof source==='string'?source:source.url)).map(source=>sourceRecord(source,year));
}

/**
 * Explicit profile slots sit beside the original catalogue values. A legacy
 * umbrella reference remains "source-linked"; presence is never verification.
 * Specification years are not publication years or production-year ranges.
 * @param {Record<string, *>} model Existing catalogue record; never mutated.
 * @returns {ModelProfile}
 */
export function buildModelProfile(model){
  const verified=model.verified||{},electric=model.powertrain==='Electric',hybrid=model.powertrain==='Plug-in hybrid';
  const story=storyFor(model),editorialNote='APEX editorial guide. The linked factory reference describes the vehicle; this is guidance for exploring it, not a reliability study or a service interval.';
  const statedDisplacement=model.description?.match(/\b([1-9][\d,]*)\s*cm[³3]/),linkedDisplacement=statedDisplacement?positive(statedDisplacement[1].replaceAll(',','')):null;
  const statedUsableBattery=(electric||hybrid)&&model.induction?.match(/\b(\d+(?:\.\d+)?)\s*kWh\s+usable\b/i);
  const specificationYear=validYear(verified.modelYear)||validYear(model.modelYear);
  const values={
    overview:{value:model.description},history:{value:story?.story,note:editorialNote},funFacts:{value:story?.facts,note:editorialNote},whyItMatters:{value:story?.tagline,note:editorialNote},strengths:{value:story?.bestFor,note:editorialNote},buyingTips:{value:story?.tradeOff,note:editorialNote},maintenance:{value:story?(electric?'Check high-voltage service records, battery-condition evidence and charging operation. Use the BMW service schedule for the actual VIN and market.':hybrid?'Check service records for both the combustion and high-voltage systems, including charging operation. Use the BMW service schedule for the actual VIN and market.':'Match the engine code and VIN to the correct BMW service schedule. Ask for dated maintenance records and an independent inspection before buying.'):null,note:editorialNote},relatedModels:{value:model.relatedModelNames,note:'Other catalogue applications of the same recorded engine or drive-family label; they do not necessarily share a specification.'},market:{value:model.market},modelYear:{value:specificationYear,verified:!!validYear(verified.modelYear)},bodyStyles:{value:model.body,note:'The body style of this catalogue example; not a complete list of production body styles.'},
    engineCode:{value:model.code},engineLayout:{value:model.layout},displacement:{value:positive(verified.displacementCc)||linkedDisplacement,unit:'cm³',verified:!!positive(verified.displacementCc)},induction:{value:model.induction},
    power:{value:positive(model.power),unit:model.powerUnit,verified:verified.powerPS===Number(model.power)&&model.powerUnit==='PS'||verified.powerHp===Number(model.power)&&model.powerUnit==='hp'||verified.powerKw===Number(model.power)&&model.powerUnit==='kW',note:model.powerScope||model.hybridNote||null},
    torque:{value:positive(model.torque),unit:model.torqueUnit,verified:verified.torqueNm===Number(model.torque)&&model.torqueUnit==='Nm'||verified.torqueLbFt===Number(model.torque)&&model.torqueUnit==='lb-ft',note:hybrid?'Combined system torque where the catalogue identifies a hybrid system rating.':null},
    redline:{value:positive(verified.maxRPM)||positive(model.maxRPM),unit:'rpm',verified:!!positive(verified.maxRPM)},
    combustionPower:{value:positive(model.enginePower),unit:model.enginePowerUnit,note:'Engine-only rating, separate from combined hybrid system power.'},
    batteryCapacity:{value:positive(model.batteryNet)||positive(statedUsableBattery?.[1]),unit:'kWh'},
    gearboxOptions:{value:verified.transmission||model.transmission||(electric&&story?'Single-speed fixed-ratio electric drive':null),verified:!!verified.transmission,note:verified.transmissionAlternatives?.length?verified.transmissionAlternatives.map(item=>item.transmission).join('; '):null},
    drivetrain:{value:verified.drivetrain||model.drivetrain||(electric&&story?model.layout:null),verified:!!verified.drivetrain},
    weight:{value:positive(verified.weightKg)||positive(model.weightKg),unit:'kg',verified:!!positive(verified.weightKg),note:verified.weightConvention||model.weightConvention||null},
    dimensions:{value:[verified.lengthMm,verified.widthMm,verified.heightMm].every(positive)?`${verified.lengthMm} × ${verified.widthMm} × ${verified.heightMm}`:verified.dimensionsIn?`${verified.dimensionsIn.length} × ${verified.dimensionsIn.width} × ${verified.dimensionsIn.height}`:null,unit:verified.dimensionsIn?'in':'mm',verified:true,note:verified.dimensionNote||null},
    wheelbase:{value:positive(verified.wheelbaseMm)||positive(verified.dimensionsIn?.wheelbase),unit:verified.dimensionsIn?'in':'mm',verified:true},
    acceleration100:{value:positive(verified.acceleration100)||positive(model.acceleration100),unit:'s',verified:!!positive(verified.acceleration100),note:verified.acceleration60Mph&&!verified.acceleration100?'This source publishes 0–60 mph; it is not relabelled as 0–100 km/h.':null},
    topSpeed:{value:positive(verified.topSpeed)||positive(verified.topSpeedMph)||positive(model.topSpeed),unit:verified.topSpeedMph?'mph':'km/h',verified:!!positive(verified.topSpeed)||!!positive(verified.topSpeedMph),note:verified.topSpeedNote||null}
  };
  const combustionOnly=new Set(['engineCode','displacement','induction','redline','fuelTank','fuelConsumption','combustionPower']);
  const electricOnly=new Set(['batteryCapacity','energyConsumption','electricRange','charging']);
  const fields=profileFieldDefinitions.map(definition=>{
    const extension=verifiedProfileExtensions[model.id]?.[definition.id];
    const entry=extension?{...extension,verified:true}:values[definition.id]||{},inapplicable=electric&&combustionOnly.has(definition.id)||!electric&&!hybrid&&electricOnly.has(definition.id)||!hybrid&&definition.id==='combustionPower';
    const hasValue=present(entry.value),sources=hasValue?entry.sources||sourceList(model,{verified:!!entry.verified}):[];
    const status=inapplicable?'not-applicable':hasValue&&sources.length?(entry.verified?'verified':'source-linked'):'unavailable';
    return {...definition,label:electric&&definition.id==='engineLayout'?'Motor and drive layout':definition.label,status,value:status==='verified'||status==='source-linked'?entry.value:null,unit:entry.unit||null,sources:status==='not-applicable'?[]:sources,
      note:entry.note||(status==='source-linked'?'Existing catalogue value with an umbrella factory reference; this datum has not been independently reverified.':status==='unavailable'?'Not available: a matching, verified source has not been recorded.':status==='not-applicable'?'Not applicable to this powertrain.':null)};
  });
  const summary={total:fields.length,verified:0,sourceLinked:0,unavailable:0,notApplicable:0};
  const countKeys={'verified':'verified','source-linked':'sourceLinked','unavailable':'unavailable','not-applicable':'notApplicable'};
  for(const field of fields)summary[countKeys[field.status]]++;
  return {id:model.id,schemaVersion:PROFILE_SCHEMA_VERSION,context:{market:model.market||null,modelYear:specificationYear,specification:verified.specification||null},
    sections:profileSections.map(section=>({...section,fields:fields.filter(field=>field.section===section.id)})),photos:auditModelPhotos(model).slots,summary};
}
