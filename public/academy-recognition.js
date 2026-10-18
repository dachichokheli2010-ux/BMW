// Real, credited catalog photos. Questions identify the model family or generation,
// never a special trim that the exterior photograph alone cannot establish.
export const mRecognitionModels=['f87-m2','g87-m2','f80','g80','f82','g82-m4','f10-m5','f90','f13-m6','f92-m8'];
export function shuffled(items,seed=''){
  const result=[...items];let value=[...String(seed)].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,2166136261);
  for(let i=result.length-1;i>0;i--){value=(Math.imul(value,1664525)+1013904223)>>>0;const j=value%(i+1);[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function createMChallenges(catalog){
  const models=mRecognitionModels.map(id=>catalog.find(model=>model.id===id)).filter(model=>model?.car&&model.carCredit&&model.source);
  const generation=model=>model.generation.split('/').at(-1).trim();
  const family=model=>model.name.match(/\bM[234568]\b/)?.[0];
  const photo=model=>({src:model.car,caption:model.name+' · '+generation(model),author:model.carCredit.author,license:model.carCredit.license,page:model.carCredit.page,changes:model.carCredit.changes});
  const visualClues={
    'f87-m2':'Look for the short two-door body, separate horizontal kidney grilles and curved lower bumper openings.',
    'g87-m2':'Look for the short two-door body, squared-off lower air openings and wide, rectangular kidney grilles.',
    f80:'Look for four doors, a compact sedan roofline and two low, horizontal kidney grilles.',
    g80:'Look for four doors and the very tall vertical kidney grilles. Compare this nose with the lower grille of the F80.',
    f82:'Look for two long doors and a sloping coupé roof, with low, horizontal kidney grilles.',
    'g82-m4':'Look for the two-door coupé roofline and tall vertical kidney grilles. Door count helps separate it from the G80 sedan.',
    'f10-m5':'Look for the long four-door sedan body, broad horizontal kidney grilles and large lower bumper openings.',
    f90:'Look for the large four-door sedan body and sharp, angular light outlines beside wide horizontal kidney grilles.',
    'f13-m6':'Look for a low, broad nose, swept-back headlights and a wide central lower air opening.',
    'f92-m8':'Look for the long two-door coupé body, narrow swept headlights and wide, angular kidney grilles.'
  };
  const cues=model=>visualClues[model.id]||'Compare the roofline, grille and headlight shapes. Use the complete car, not a single badge.';
  function question(model,mode){
    const gen=generation(model),name=family(model),id='m-'+mode+'-'+model.id;
    const alternatives=mode==='family'?['M2','M3','M4','M5','M6','M8'].filter(value=>value!==name):models.filter(value=>value.id!==model.id).sort((a,b)=>Number(family(b)===name)-Number(family(a)===name)).map(value=>generation(value));
    const correct=mode==='family'?name:gen,answers=shuffled([correct,...[...new Set(alternatives)].slice(0,3)],id);
    return {id,type:'choice',recognition:true,modelId:model.id,photo:photo(model),prompt:mode==='family'?'Which BMW M model is this?':'Which generation is this BMW '+name+'?',answers,correct:answers.indexOf(correct),hint:cues(model),explanation:'This is the BMW '+name+' · '+gen+'. '+cues(model)+' The source identifies the pictured catalog car as '+model.name+'.',explore:'/models?model='+encodeURIComponent(model.id)};
  }
  const packs=[
    {id:'m-models',title:'Name that M.',subtitle:'Start with the model',intro:'M2, M3, M4, M5, M6 or M8? Identify six real BMW M cars from their photographs. Study the shape, then tap your answer.',mode:'family',ids:['f87-m2','f80','f82','f10-m5','f13-m6','f92-m8'],difficulty:'ROOKIE',cover:'f82'},
    {id:'m-generations',title:'Know the generation.',subtitle:'Look beyond the badge',intro:'Same M family. A different generation. Compare the grille, lights, body shape and proportions in eight real photographs.',mode:'generation',ids:['f87-m2','g87-m2','f80','g80','f82','g82-m4','f10-m5','f90'],difficulty:'ENTHUSIAST',cover:'g80'},
    {id:'m-mixed',title:'The M recognition test.',subtitle:'Put it all together',intro:'A mixed round of model and generation questions. Six photographs, no timer. Hints are available whenever you need a closer look.',mode:'mixed',ids:['g87-m2','f90','g80','g82-m4','f92-m8','f13-m6'],difficulty:'MIXED ROUND',cover:'g87-m2'}
  ];
  return packs.map(pack=>{
    const selected=pack.ids.map(id=>models.find(model=>model.id===id)).filter(Boolean);
    return {id:pack.id,title:pack.title,subtitle:pack.subtitle,difficulty:pack.difficulty,recognition:true,topic:'models',duration:'3 min',intro:pack.intro,detail:[],steps:[],visual:'photo',cover:photo(models.find(model=>model.id===pack.cover)||models[0]),sources:selected.map(model=>({label:'BMW · '+model.name+' '+generation(model),url:model.source})),questions:selected.map((model,i)=>({...question(model,pack.mode==='mixed'?(i%2?'generation':'family'):pack.mode),id:pack.id+'-'+model.id,sourceRefs:[{label:'BMW · documented model',url:model.source}]}))};
  });
}
