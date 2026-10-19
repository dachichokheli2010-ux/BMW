import {allModels} from './catalog.js';

// A separate index over the retained catalogue. Family pages never turn the
// specification of one car into a universal specification of its engine.
export const EXPLORER_SCHEMA_VERSION=1;
export const researchDate='2026-10-20';
export const carURL=id=>'/cars/'+encodeURIComponent(typeof id==='object'?id.id:id);
export const engineId=code=>String(code).toLowerCase().replace(/\+/g,' plus ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const engineURL=code=>'/engines/'+(typeof code==='object'?code.id:engineId(code));

const unknown=(id,label,note)=>({id,label,status:'unavailable',value:null,unit:null,sources:[],note});
const source=(url,title,locator)=>({url,title,locator,checked:researchDate});
const legends=source('https://www.bmw-m.com/en/topics/magazine-article-pool/bmw-m-engines.html','BMW M: legendary engines','S58 technical data');
const s58Detail=source('https://www.bmw-m.com/en/topics/magazine-article-pool/bmw-m-s58-engine-red-bull-driftbrothers.html','BMW M: S58 technical comparison','Series engine column; modified drift-car figures are excluded');
const b58Award=source('https://www.press.bmwgroup.com/usa/article/detail/T0304716EN_US/bmw-382-hp-b58-twinpower-turbo-3-0-liter-inline-six-cylinder-engine-named-2020-wards-10-best-engine-and-powertrain-award-winner','BMW USA: B58 engine award, January 2020','2020 US application description');
const b58Photo=source('https://www.press.bmwgroup.com/global/photo/search/B58/?forceSitePreference=DESKTOP','BMW PressClub: B58 technical image index','B58 six-cylinder engine captions');

const intros={
  N55:['One turbo, two exhaust paths.','Start with the difference between a twin-scroll turbo and two separate turbochargers.'],
  S65:['The M3 with a V8 voice.','Compare the ordinary M3 and the GTS separately: sharing a family name does not mean sharing every specification.'],
  S63:['The M V8 across very different cars.','Open a car below to see its exact output, market and generation. A family name alone does not identify the revision.'],
  S54:['The straight-six before the turbo era.','Explore the E46 M3, CSL and Z4 M applications without treating their individual specifications as interchangeable.'],
  S85:['Ten cylinders, one memorable chapter.','The retained catalogue connects this engine to the E60 M5 and E63 M6. Start with their individual factory references.'],
  S55:['A turbocharged M chapter.','Follow the family from the M3 and M4 to the M2 Competition, then compare the special editions.'],
  S58:['A straight-six built for M.','Two turbochargers help this engine breathe. Its output depends on the model and specification, so compare the applications below.'],
  S62:['The engine behind the E39 M5.','Start with the linked M5 record to keep its engine, vehicle and market context together.'],
  M54:['The everyday straight-six.','The 330i and 530i records show how an engine family can appear in different sizes of car.'],
  N54:['The twin-turbo learning stop.','Use the 335i and 1 Series M applications to explore the difference between a shared engine family and a complete vehicle.'],
  S63TU:['An update deserves its own record.','The F10 M5 entry retains its S63TU code. A later S63 photograph is not substituted for its engine.'],
  B48:['Four cylinders, many applications.','Compare each application before comparing outputs: emissions equipment, installation and market can differ.'],
  B46:['Keep the emissions variant attached.','These retained US records use the B46 label. The related B48 label is not silently substituted.'],
  B58:['The modern straight-six.','BMW identifies B58 as a turbocharged six-cylinder engine. The table below keeps each car’s published output and units.'],
  M88:['Begin with the M1.','This is the catalogue’s M1 engine label. The M88/3 application has its own directory entry.'],
  S14:['A small-engine M icon.','Explore the original M3 and its Sport Evolution separately. Special editions need their own facts.'],
  S50B30:['The E36 M3 3.0 record.','The code’s detail matters. The S50B32 applications are indexed separately.'],
  'M88/3':['A code shared by two classics.','Follow the retained M5 and M635CSi references to see the engine in two different kinds of BMW.'],
  S38B36:['A specific E34 M5 chapter.','This record represents the catalogue’s 3.6 specification. Other S38 revisions still need their own records.'],
  'S68 + eDrive':['A combustion engine and electric help.','The power shown for a hybrid car can describe the combined system. It must not be relabelled as combustion-engine output.'],
  S50B32:['The Z3 M engine record.','Roadster and Coupé applications share this catalogue label. Other market versions need separate verification.'],
  S54B32:['A precise Z4 M engine label.','This exact label is preserved alongside the broader S54 record. It does not establish that every S54 application is identical.'],
  N63:['The 8 Series V8 application.','Begin with the M850i reference. Its engine family label does not make it the same specification as an M8.'],
  'B38 + eDrive':['The i8’s two sources of propulsion.','Keep the petrol engine, electric motor and combined-system output separate when reading this hybrid’s figures.'],
  'M10 / turbo':['The 2002 turbo chapter.','Start with the retained 2002 turbo record. Broader M10 production and other applications still require research.'],
  S70:['The 850CSi engine label.','This catalogue entry describes the 850CSi. It is not a specification for the differently coded McLaren F1 engine.'],
  M73:['The large-saloon chapter.','Follow the 750iL reference to see how the catalogue attaches an engine to a particular vehicle.'],
  M30:['The classic CSL connection.','Start with the 3.0 CSL record. A broad engine-family name cannot establish the displacement of every revision.'],
  M20:['The early 3 Series connection.','The 323i is the application retained here. More M20-powered generations remain to be researched.'],
  eDrive:['Electric drive, many different systems.','eDrive is an umbrella name. These cars do not share one universal motor, battery, layout or power figure.']
};

const extraCarDefinitions=[
  ['productionNumbers','Production quantity'],['originalPrice','Original price and currency'],
  ['factory','Factory and country'],['designer','Designer'],['rivals','Contemporary rivals'],
  ['bestFor','Who this car suits'],['cons','Trade-offs'],['factoryColors','Factory paint colours']
];

export const carRecords=allModels.map(model=>({
  id:model.id,name:model.name,url:carURL(model.id),engineId:engineId(model.code),
  fields:[...model.profile.sections.flatMap(section=>section.fields),...extraCarDefinitions.map(([id,label])=>unknown(id,label,'A matching model, year and market reference has not yet been checked.'))],
  photos:model.profile.photos,context:model.profile.context
}));

export const engineRecords=[...new Set(allModels.map(model=>model.code))].map(code=>{
  const applications=allModels.filter(model=>model.code===code),id=engineId(code),electric=code==='eDrive',hybrid=code.includes('+');
  const [tagline,overview]=intros[code];
  const inherited=(fieldId,label)=>{
    const entries=applications.map(model=>({modelId:model.id,field:model.profile.sections.flatMap(section=>section.fields).find(field=>field.id===fieldId)})).filter(entry=>entry.field&&entry.field.value!==null);
    if(!entries.length)return unknown(fieldId,label,'No matching engine-family datum has been verified. See the individual applications.');
    return {id:fieldId,label,status:'source-linked',value:entries.map(({modelId,field})=>({modelId,value:field.value,unit:field.unit,status:field.status})),unit:null,
      sources:[...new Map(entries.flatMap(({field})=>field.sources).map(item=>[item.url,item])).values()],
      note:'Application-specific catalogue values, not an engine-family range. Source-linked entries still need datum-level checking.'};
  };
  const fields=[inherited('engineLayout','Layout'),electric?{...unknown('displacement','Displacement','Electric motors have no combustion displacement. Motor output, battery energy and range belong to each vehicle.'),status:'not-applicable'}:inherited('displacement','Displacement'),
    inherited('induction','Induction'),inherited('power',hybrid?'Combined vehicle output by application':'Output by application'),
    unknown('productionYears','Engine production years','The source years below identify vehicle specifications, not engine production start or end dates.'),
    unknown('strengths','Verified strengths','Design explanations are available in the linked car records; a sourced engine-family ownership assessment is still missing.'),
    unknown('weaknesses','Known weaknesses','No blanket reliability claim is published without a matching revision and a checked technical reference.'),
    unknown('funFact','Engine fact','A separately sourced engine fact has not yet been added.')];
  const setFact=(key,value,sources,note)=>Object.assign(fields.find(field=>field.id===key),{status:'cross-checked',value,unit:key==='displacement'?'cm³':null,sources,note});
  if(code==='S58'){
    setFact('engineLayout','Inline-six',[legends,s58Detail],'Both BMW M references describe the S58 series engine.');
    setFact('displacement',2993,[legends,s58Detail],'Engine-family displacement; output remains specific to each application.');
    setFact('induction','Two turbochargers',[legends,s58Detail],'Refers to the series engine in the cited references.');
    setFact('funFact','BMW M describes a closed-deck crankcase and a forged crankshaft.',[legends,s58Detail],'Construction features, not a guarantee about modified-engine durability.');
  }
  if(code==='B58')setFact('engineLayout','Inline-six',[b58Award,b58Photo],'Two BMW references identify the B58 six-cylinder family.');
  const photos=[...new Map(applications.flatMap(model=>model.approvedPhotos.engine.map(photo=>({...photo,modelId:model.id}))).map(photo=>[photo.src,photo])).values()];
  return {id,code,name:electric?'BMW electric drive systems':'BMW '+code,kind:electric?'electric':hybrid?'hybrid':code.startsWith('S')||code.startsWith('M88')?'m':'petrol',tagline,overview,
    editorialStatus:'editorial-guide',fields,photos,photoStatus:photos.length?'available':'unavailable',searchTerms:applications.flatMap(model=>[model.layout,model.shortLayout]).filter(Boolean),
    photoNote:photos.length?'Photographs retain their identified application. They are not evidence that every revision looks identical.':'A positively identified, licensed engine or drive-unit photograph is still missing.',
    applications:applications.map(model=>({id:model.id,name:model.name,url:carURL(model.id),generation:model.generation,market:model.market||'Market not recorded',specificationYear:model.profile.context.modelYear,power:model.power,powerUnit:model.powerUnit,powertrain:model.powertrain,source:model.source})),
    sources:[...new Map([...fields.flatMap(field=>field.sources),...applications.filter(model=>model.source).map(model=>({url:model.source,title:model.name+' factory reference'}))].map(item=>[item.url,item])).values()],
    url:engineURL({id})};
});

export const getEngineRecord=value=>engineRecords.find(engine=>engine.id===String(value).toLowerCase()||engine.code.toLowerCase()===String(value).toLowerCase())||null;

const currentSource='https://www.bmw.de/de/neufahrzeuge.html';
// Dated discovery checklist, not a claim of a complete world-market inventory.
// The German market includes both orderable and announced/coming-soon vehicles.
const lineupRows=[
  ['1 Series','Current hatchback','f40-m135i','Older F40 reference only'],
  ['2 Series','Coupé / Gran Coupé / Active Tourer','g42-230i,f44-m235i-gc','Coupé represented; current Gran Coupé and Active Tourer missing'],
  ['3 Series','New generation / Touring','g20-330i','Earlier saloon only; new generation and non-M Touring missing'],
  ['4 Series','Coupé / Convertible / Gran Coupé','g22-430i','Coupé only; other current body styles missing'],
  ['5 Series','Saloon / Touring','g30-530i','Older combustion saloon; current non-M records missing'],
  ['7 Series','Updated saloon','g11-740i','Older combustion saloon; current specification missing'],
  ['X1 / X2','Current combustion and hybrid models','x1,f39-x2','Earlier combustion generations only'],
  ['X3 / X4','Current X3; X4 market availability varies','f25,x4','Current X3 missing; older X4 reference requires market check'],
  ['X5 / X6 / X7','New X5; existing X6 and X7 families','f15,x6,x7','New X5 missing; current X6/X7 variants need checking'],
  ['XM','XM Label','g09-xm','Earlier XM; Label specification missing'],
  ['Z4','Roadster','g29-z4','Earlier source specification; current variants need checking'],
  ['iX1 / iX2','Electric compact SUVs','u11-ix1,u10-ix2','Family represented; current specification not established'],
  ['i3','Neue Klasse saloon','i3','Retained I01 hatchback is a different vehicle; new saloon missing'],
  ['i4 / i5 / i7','Electric saloons and Touring','i4,g60-i5,g70-i7','Earlier saloons retained; current i4 M60, i7 update and i5 Touring missing'],
  ['iX','Updated SUV and M70','ix,i20-ix-m60','Earlier xDrive50/M60; current update and M70 missing'],
  ['iX3','Neue Klasse SUV and M60','ix3','Retained G08 is an older generation; Neue Klasse missing'],
  ['iX4','New electric SUV coupé','','New family missing'],
  ['iX5','New electric SUV','','New family missing'],
  ['M2 / M3 / M4','Current M cars and special editions','g87-m2,g80,g81-m3-touring,g82-m4','Families represented; newest variants and technical updates missing'],
  ['M5','Hybrid saloon / Touring','g90-m5,g99-m5-touring','Launch references retained; current specification needs checking']
];
export const currentLineupCoverage=lineupRows.map(([family,scope,ids,gap])=>({family,scope,modelIds:ids?ids.split(','):[],status:'partial-or-missing',gap,source:currentSource,checked:researchDate}));
export const lineupResearchSources=[
  {url:currentSource,title:'BMW Germany: all models',checked:researchDate,scope:'Market-specific discovery; includes coming-soon models'},
  {url:'https://www.press.bmwgroup.com/global/article/detail/T0460993EN/the-new-bmw-3-series',title:'BMW PressClub: new 3 Series, 30 September 2026',checked:researchDate,scope:'Generation update discovery'},
  {url:'https://www.bmwgroup.com/en/news/general/2026/the-new-bmw-x5.html',title:'BMW Group: new X5',checked:researchDate,scope:'New X5 and iX5 production plans'},
  {url:'https://www.bmw.de/de/neufahrzeuge/3er/limousine/bmw-i3-limousine.html',title:'BMW Germany: i3 saloon (NA0)',checked:researchDate,scope:'Different vehicle from retained I01 i3'},
  {url:'https://www.bmw.de/de/neufahrzeuge/x/ix3/bmw-ix3.html',title:'BMW Germany: iX3 (NA5)',checked:researchDate,scope:'Different generation from retained G08 iX3'}
];

export const heritageCoverage=[
  {group:'1 Series',missing:'E81/E87 ordinary models, E82/E88 ordinary models, F20/F21, current generation'},
  {group:'2 Series',missing:'Active Tourer and Gran Tourer generations, Convertible, current Gran Coupé'},
  {group:'3 Series',missing:'Ordinary E30/E36/E90/F30 generations, non-M Touring and Convertible, current generation'},
  {group:'4 Series',missing:'Convertible and non-electric Gran Coupé generations'},
  {group:'5 Series',missing:'Ordinary E12/E28/E34/E39/G60 and Touring generations'},
  {group:'6 / 7 / 8 Series',missing:'Ordinary classic 6 Series; most 7 Series generations; ordinary E31 and later body-style variants'},
  {group:'X1–X7 and XM',missing:'Most generation/engine/body combinations; diesel and plug-in hybrid variants'},
  {group:'Z cars',missing:'Z1, ordinary Z3 and older Z4 generations, Z8'},
  {group:'Classics and oddities',missing:'Isetta, 507, 328, 503, 700, 1500–2000 Neue Klasse, ordinary 02 models'},
  {group:'Special editions',missing:'A complete CS/CSL/GTS/Competition inventory and market-specific editions'}
];

function reviewFields(kind,record){return record.fields.flatMap(field=>{
  if(field.status==='not-applicable')return [];
  const issues=[];
  if(field.status==='unavailable')issues.push('missing-field');
  else if(field.status==='source-linked')issues.push('datum-not-cross-checked');
  else if(field.status==='verified'&&new Set(field.sources.map(item=>item.url)).size<2)issues.push('second-source-required');
  return issues.map(reason=>({kind,id:record.id,name:record.name,field:field.id,label:field.label,reason,note:field.note,sources:field.sources.map(item=>item.url)}));
});}

export function createExplorerAudit({parts=[]}={}){
  const needsReview=[...carRecords.flatMap(record=>reviewFields('car',record)),...engineRecords.flatMap(record=>reviewFields('engine',record))];
  const missingImages=[...carRecords.flatMap(record=>record.photos.filter(slot=>slot.required&&slot.status==='unavailable').map(slot=>({kind:'car',id:record.id,name:record.name,slot:slot.slot,reason:slot.reason,search:'https://commons.wikimedia.org/w/index.php?search='+encodeURIComponent(record.name+' '+slot.label)+'&title=Special:MediaSearch&type=image'}))),
    ...engineRecords.filter(record=>!record.photos.length).map(record=>({kind:'engine',id:record.id,name:record.name,slot:'engine',reason:record.photoNote,search:'https://commons.wikimedia.org/w/index.php?search='+encodeURIComponent('BMW '+record.code+' engine')+'&title=Special:MediaSearch&type=image'}))];
  for(const part of parts){
    if(part.fields)needsReview.push(...reviewFields('part',{...part,fields:Array.isArray(part.fields)?part.fields:Object.entries(part.fields).map(([id,field])=>({id,...field}))}));
    if(!part.photo?.src||part.photo?.status==='unavailable'||part.imageStatus==='generic-reference-photo')missingImages.push({kind:'part',id:part.id,name:part.name,slot:'part',reason:part.imageStatus==='generic-reference-photo'?'A generic component reference is displayed; an identified BMW component photograph is still missing.':'A matching licensed part photograph is not recorded.',search:'https://commons.wikimedia.org/w/index.php?search='+encodeURIComponent('BMW '+part.name)+'&title=Special:MediaSearch&type=image'});
  }
  const missing=kind=>needsReview.filter(item=>item.kind===kind&&item.reason==='missing-field').length;
  return {schemaVersion:EXPLORER_SCHEMA_VERSION,checked:researchDate,scope:'The retained 93-car catalogue, its engine index and the supplied parts registry. This audit measures gaps; placeholders never count as complete content.',
    policy:{crossCheck:'Two distinct source documents are required for cross-checked fields. Two BMW documents are two references, not independent publishers.',unknown:'Null means not verified. User-visible unavailable labels do not make a factual field complete.',engine:'Application-specific power and displacement are not pooled into a family specification.',current:'Current model discovery uses BMW Germany and selected BMW Group releases. It is not a complete worldwide variant inventory.'},
    totals:{cars:carRecords.length,engines:engineRecords.length,parts:parts.length,missingCarFields:missing('car'),missingEngineFields:missing('engine'),missingPartFields:missing('part'),needsReview:needsReview.length,missingImages:missingImages.length,lineupGaps:currentLineupCoverage.filter(row=>row.status!=='complete').length,complete:needsReview.length===0&&missingImages.length===0&&currentLineupCoverage.every(row=>row.status==='complete')},
    needsReview,missingImages,currentLineupCoverage,heritageCoverage,lineupResearchSources};
}
