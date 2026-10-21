import {allModels} from './catalog.js';
import {academyLessons,academyReferenceData} from './academy.js';
import {createCurriculum} from './academy-content.js';
import {partCatalog} from './parts.js';

// Questions retain the catalogue's application and units. Unsupported numbers
// are never filled in, converted, or inferred from a generation or engine code.
export const utcDay=(date=new Date())=>date.toISOString().slice(0,10);
export function seededShuffle(items,seed=''){
  const result=[...items];let value=2166136261;
  for(const char of String(seed)){value^=char.charCodeAt(0);value=Math.imul(value,16777619)>>>0;}
  for(let i=result.length-1;i>0;i--){value=(Math.imul(value,1664525)+1013904223)>>>0;const j=value%(i+1);[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
const unique=items=>[...new Set(items.filter(value=>value!==null&&value!==undefined&&value!==''))];
const generation=model=>model.generation.split(' / ').at(-1).trim();
const context=model=>`${model.name} · ${generation(model)}${model.market?' · '+model.market:''}`;
const references=model=>unique([model.source,...(model.verified?.sources||[]).map(source=>source.url||source)]).map(url=>({label:'BMW specification reference',url}));
function choice(id,prompt,answer,alternatives,extra={}){
  const answers=seededShuffle([String(answer),...unique(alternatives.map(String)).filter(value=>value!==String(answer)).slice(0,3)],id);
  if(answers.length<2)return null;
  return {id,type:'choice',prompt,answers,correct:answers.indexOf(String(answer)),difficulty:2,...extra};
}

export const PLAY_MODES=Object.freeze([
  {id:'practice',name:'Practice',icon:'◎',tag:'START HERE',description:'Ten questions, no clock. Understand the why.',rules:'Select an answer, then press Check answer. Read the explanation before continuing. Hints are free. Ten questions make a round.',count:10},
  {id:'daily',name:'Daily Challenge',icon:'◈',tag:'SAME FOR EVERYONE',description:'One shared ten-question challenge each UTC day.',rules:'The same ten questions and answer order for every player on the same UTC date. You have one scored entry a day. Leaving saves your place. The day resets at 00:00 UTC.',count:10},
  {id:'sprint',name:'60-second Sprint',icon:'↗',tag:'BEAT THE CLOCK',description:'How much can you learn in one minute?',rules:'Answer as many questions as you can before the 60-second clock ends. Reading explanations uses clock time. Faster correct answers earn a bonus.',count:500},
  {id:'survival',name:'Three-life Survival',icon:'♡',tag:'THREE LIVES',description:'Keep learning until your three lives run out.',rules:'A wrong answer or skip costs one life. Correct answers keep the round alive. The round ends when all three lives are used or you finish the pool.',count:500},
  {id:'endless',name:'Endless',icon:'∞',tag:'YOUR OWN PACE',description:'Keep going. Finish whenever you want.',rules:'There is no timer or life limit. Finish the round using Finish & save. Questions do not repeat until the selected pool is exhausted.',count:500},
  {id:'flashcards',name:'Study cards',icon:'▤',tag:'NO PRESSURE',description:'Think, flip, then say whether you knew it.',rules:'Read the prompt and think of an answer. Flip the card for its explanation. Mark Knew it or Study again. Study cards build study progress, not scored accuracy or XP.',count:10},
  {id:'versus',name:'Pass & play',icon:'⇄',tag:'TWO PLAYERS',description:'Two drivers, one device. Take turns.',rules:'Player 1 and Player 2 alternate through ten questions. A handover screen hides the next question until the next player is ready. Highest score wins.',count:10},
  {id:'mistakes',name:'Retry my mistakes',icon:'↺',tag:'GET COMFORTABLE',description:'Return to questions that need another look.',rules:'Only your unresolved mistakes appear. A correct answer clears that question from the list. Read its explanation whenever you need a reminder. Hints are free.',count:10},
  {id:'cars',name:'Name that BMW',icon:'▰',tag:'REAL PHOTOS',description:'Recognize a model or generation from a credited photo.',rules:'Look at the complete car photograph. Compare the roofline, grille and lights, then choose the model or generation. Photos identify documented examples, not every trim.',count:10},
  {id:'engines',name:'Engine detective',icon:'⚙',tag:'ENGINE FAMILIES',description:'Connect engine codes, layouts and applications.',rules:'Answer engine and powertrain questions using the exact model and specification shown. An engine family does not establish parts fitment.',count:10},
  {id:'parts',name:'Name that part',icon:'◇',tag:'UNDER THE SKIN',description:'Identify real photographed components and their jobs.',rules:'Use the photograph or function to identify a component. Some pictures are generic references; their captions identify the photographed hardware after your answer.',count:10},
  {id:'match',name:'Match the job',icon:'⤧',tag:'MAKE CONNECTIONS',description:'Pair a component or quantity with what it does.',rules:'For each item, choose its matching job from the dropdown. Each job is used once. Check the full set when you are ready.',count:5},
  {id:'timeline',name:'Timeline sort',icon:'↦',tag:'THROUGH THE YEARS',description:'Put documented BMW milestones in time order.',rules:'Select milestones from earliest to latest. Tap a selected milestone to remove it or use Undo. Check the sequence when all places are filled.',count:4},
  {id:'memory',name:'Memory garage',icon:'▦',tag:'FIND THE PAIRS',description:'Turn over tiles and remember each part and job.',rules:'Turn over two cards. A part and its matching job stay face up; a mismatch turns back over. Find every pair. Extra flips reduce the round score.',count:3},
  {id:'build-engine',name:'Build the engine path',icon:'⚒',tag:'PUT IT TOGETHER',description:'Assemble the four strokes and energy paths.',rules:'Tap the stages in the order they happen. Tap a selected stage to remove it, or use Undo. Keyboard and touch controls work without dragging.',count:5},
  {id:'higher-lower',name:'Higher or lower',icon:'↕',tag:'MATCHED UNITS',description:'Compare published power and acceleration figures.',rules:'Compare the two exact factory configurations. Power comparisons use the same original unit. Acceleration compares time: a smaller time means quicker.',count:10},
  {id:'true-false',name:'True or false',icon:'✓',tag:'FACT CHECK',description:'Test model facts against their documented applications.',rules:'Decide whether the statement matches the specified catalogue example. A short explanation and the factory reference appear after every answer.',count:10}
]);

export function createQuestionBank(catalog=allModels){
  const bank=[],add=question=>{if(question)bank.push(question);};
  const models=catalog.filter(model=>model.source&&model.generation&&model.name);
  const fields=[
    ['generation','Which generation or chassis code identifies this example?',generation,'models',1],
    ['code','Which engine or electric-drive family is recorded for this example?',model=>model.code,'engines',2],
    ['body','Which body style represents this catalogue example?',model=>model.body,'models',1],
    ['powertrain','Which powertrain category does this example use?',model=>model.powertrain,'engines',1],
    ['layout','Which cylinder or electric-drive layout is recorded?',model=>model.layout,'engines',2],
    ['induction','Which induction or battery description belongs to this example?',model=>model.induction,'engines',3],
  ];
  for(const model of models){
    const common={modelId:model.id,assessmentKind:'reference',sourceGroup:model.id,learnURL:'/models?model='+encodeURIComponent(model.id),sources:references(model),context:context(model),sourceStatus:model.verified?'factory-specification':'catalogue-source-linked'};
    for(const [field,prompt,read,topic,difficulty] of fields){
      const answer=read(model);if(!answer)continue;
      const peers=seededShuffle(models,'peers:'+model.id+':'+field).sort((a,b)=>Number(b.powertrain===model.powertrain)-Number(a.powertrain===model.powertrain)||Number(b.layout===model.layout)-Number(a.layout===model.layout));
      add(choice('car-'+model.id+'-'+field,`${context(model)}: ${prompt}`,answer,peers.map(read),{...common,topic,difficulty,explanation:`For this specific catalogue application, ${answer} is the recorded ${field==='code'?'engine / drive family':field}. ${field==='generation'?'One generation can contain several engines and trims.':field==='body'?'This describes the pictured catalogue example, not every body produced in that generation.':`The scope is ${model.market||'the application shown'}, rather than every BMW with the same model badge.`}`}));
    }
    // A false statement uses another existing family, never a fabricated code.
    const other=models.find(value=>value.code&&value.code!==model.code);
    if(model.code&&other){const truth=seededShuffle([true,false],model.id)[0],code=truth?model.code:other.code;add(choice('tf-'+model.id,`${context(model)} uses the ${code} engine / drive family. True or false?`,truth?'True':'False',[truth?'False':'True'],{...common,topic:'true-false',difficulty:1,explanation:`This exact application records ${model.code}. A badge or generation alone does not establish every vehicle's engine.`}));}
    // Numerical questions use only the separately documented factory record.
    if(model.verified){
      for(const [field,label,unit] of [['powerKw','rated power','kW'],['powerPS','metric horsepower','PS'],['torqueNm','peak torque','Nm'],['acceleration100','0–100 km/h time','seconds'],['weightKg','documented unladen mass','kg'],['modelYear','specification year','']]){
        const value=model.verified[field];if(!Number.isFinite(value))continue;
        const values=models.filter(item=>Number.isFinite(item.verified?.[field])).sort((a,b)=>Math.abs(a.verified[field]-value)-Math.abs(b.verified[field]-value)).map(item=>`${item.verified[field]}${unit?' '+unit:''}`);
        const answer=`${value}${unit?' '+unit:''}`;
        add(choice('spec-'+model.id+'-'+field,`${model.verified.specification||context(model)}: what is the ${label}?`,answer,values,{...common,topic:field==='modelYear'?'history':'specs',difficulty:4,explanation:`The matching factory specification records ${answer}. ${field==='weightKg'?(model.verified.weightConvention||'Use the stated mass convention when comparing vehicles.'):field==='powerPS'?'PS is metric horsepower; it is not the same unit as mechanical hp.':'Keep the model, year, market and equipment scope attached to this figure.'}`}));
      }
    }
  }
  const curriculum=createCurriculum(academyLessons,academyReferenceData.sources,partCatalog,allModels,academyReferenceData.scenarios);
  const seen=new Set();
  for(const lesson of curriculum.lessons){
    for(const question of lesson.questions){
      const fingerprint=JSON.stringify([question.prompt,question.answers,question.pairs,question.items]);if(seen.has(fingerprint))continue;seen.add(fingerprint);
      add({...question,id:'academy-'+question.id,sourceGroup:lesson.id,assessmentKind:'understanding',topic:lesson.topic,difficulty:lesson.advanced?4:2,context:lesson.title,prompt:question.recognition?question.prompt:`${lesson.title}: ${question.prompt}`,sources:question.sourceRefs||lesson.sources,learnURL:question.explore||'/learn?lesson='+encodeURIComponent(lesson.id),sourceStatus:'sourced-lesson',recognition:!!question.recognition});
    }
  }
  const milestones=academyReferenceData.mTimeline;
  for(let i=0;i<milestones.length;i++){
    const item=milestones[i];
    add(choice('year-'+item.year+'-'+i,`In which year: ${item.title.toLowerCase()}?`,item.year,milestones.map(entry=>entry.year),{topic:'history',difficulty:3,sources:[{label:item.source[0],url:item.source[1]}],learnURL:'/learn?tab=history',explanation:`${item.year}: ${item.text}`}));
    const selected=milestones.slice(i,i+4);if(selected.length<3)continue;
    add({id:'timeline-'+i,type:'order',topic:'timeline',difficulty:3,prompt:'Put these BMW M milestones in order, earliest first.',items:selected.map((entry,index)=>({id:index,text:entry.title})),correct:selected.map((_,index)=>index),explanation:selected.map(entry=>`${entry.year}: ${entry.title}`).join(' → '),sources:selected.map(entry=>({label:entry.source[0],url:entry.source[1]})),learnURL:'/learn?tab=history'});
  }
  for(let i=0;i<partCatalog.length;i++){
    const selected=Array.from({length:3},(_,index)=>partCatalog[(i+index)%partCatalog.length]);
    for(const type of ['match','memory'])add({id:type+'-parts-'+i,type,topic:'parts',difficulty:2,prompt:type==='memory'?'Find each component and its job.':'Match each component to its job.',pairs:selected.map(part=>[part.name,part.summary]),explanation:selected.map(part=>`${part.name}: ${part.summary}`).join(' '),sources:selected.flatMap(part=>part.sources),learnURL:'/parts',context:'Component roles'});
  }
  const numeric=models.filter(model=>Number.isFinite(model.verified?.powerPS));
  for(let i=0;i<numeric.length;i++)for(let j=i+1;j<numeric.length;j++){
    const a=numeric[i],b=numeric[j];
    for(const [field,label,unit] of [['powerPS','a higher metric power rating','PS'],['acceleration100','a longer 0–100 km/h time','s']]){
      const av=a.verified[field],bv=b.verified[field];if(!Number.isFinite(av)||!Number.isFinite(bv)||av===bv)continue;
      add(choice(`compare-${a.id}-${b.id}-${field}`,`Which factory configuration has ${label}?`,context(av>bv?a:b),[context(av>bv?b:a)],{topic:'higher-lower',difficulty:3,explanation:`${context(a)}: ${av} ${unit}. ${context(b)}: ${bv} ${unit}. ${field==='powerPS'?'Both values use PS, so this comparison does not mix horsepower conventions.':'Lower acceleration time means quicker, not slower.'}`,sources:[...references(a),...references(b)],learnURL:'/compare?compare='+encodeURIComponent(a.id+','+b.id)}));
    }
  }
  return bank.map(question=>({...question,id:question.id.toLowerCase()}));
}

export function poolForMode(bank,mode,difficulty='all',mistakes=[]){
  let pool=bank.filter(question=>difficulty==='all'||question.difficulty===Number(difficulty));
  if(mode==='daily')return bank.filter(question=>question.type==='choice'&&!question.photo&&question.assessmentKind==='understanding');
  if(mode==='cars')return pool.filter(question=>question.recognition&&question.photo);
  if(mode==='parts')return pool.filter(question=>question.topic==='parts'&&question.type==='choice');
  if(mode==='engines'){const engines=pool.filter(question=>question.topic==='engines'&&question.type==='choice');const applied=engines.filter(question=>question.assessmentKind==='understanding');return applied.length?applied:engines;}
  if(mode==='match')return pool.filter(question=>question.type==='match');
  if(mode==='memory')return pool.filter(question=>question.type==='memory');
  if(mode==='timeline')return pool.filter(question=>question.topic==='timeline');
  if(mode==='build-engine')return pool.filter(question=>question.type==='order'&&question.topic!=='timeline');
  if(mode==='higher-lower'||mode==='true-false')return pool.filter(question=>question.topic===mode);
  if(mode==='mistakes')return bank.filter(question=>mistakes.includes(question.id));
  return pool.filter(question=>question.type==='choice'&&question.assessmentKind==='understanding');
}
export function dailyQuestionIds(bank,day=utcDay()){
  // Start with different lessons so a daily round tests several concepts.
  const ordered=seededShuffle(poolForMode(bank,'daily').sort((a,b)=>a.id.localeCompare(b.id)),'apex-daily-v2:'+day),groups=new Set(),selected=[];
  for(const question of ordered){const group=question.sourceGroup||question.id;if(groups.has(group))continue;groups.add(group);selected.push(question.id);if(selected.length===10)return selected;}
  return [...selected,...ordered.filter(question=>!selected.includes(question.id)).map(question=>question.id)].slice(0,10);
}

const milestones=[1,5,10,25,50,100,250,500];
const badges=[];
for(const [metric,label,values] of [
  ['answers','Answers explored',milestones],['correct','Correct answers',milestones],['xp','Arcade XP',[100,250,500,1000,2500,5000,10000,25000]],
  ['rounds','Rounds completed',[1,5,10,25,50,100]],['bestCombo','Answer streak',[3,5,10,15,20]],['days','Days of play',[1,3,7,14,30]],
  ['daily','Daily challenges',[1,3,7,14,30]],['perfect','Perfect rounds',[1,3,10]],['studied','Study cards',[10,50,100]],['reviewed','Mistakes mastered',[1,10,25]]
])for(const target of values)badges.push({id:metric.toLowerCase()+'-'+target,name:label+' · '+target,description:`Reach ${target.toLocaleString('en')} ${label.toLowerCase()}.`,metric,target});
for(const mode of PLAY_MODES)badges.push({id:'mode-'+mode.id,name:mode.name+' finisher',description:'Complete a round of '+mode.name+'.',metric:'mode:'+mode.id,target:1});
export const PLAY_BADGES=Object.freeze(badges.map(Object.freeze));
export function badgeValue(state,metric){
  if(metric.startsWith('mode:'))return state.modes?.[metric.slice(5)]||0;
  if(metric==='days')return state.days?.length||0;
  if(metric==='daily')return Object.values(state.daily||{}).filter(day=>day.completed).length;
  return Number(state[metric])||0;
}
export function unlockedBadges(state){return PLAY_BADGES.filter(badge=>badgeValue(state,badge.metric)>=badge.target);}
export function arcadeLevel(xp=0){
  const names=['Isetta','2002','E30','E46','M3 GTR','M1 Procar','V12 LMR'];
  const level=Math.max(1,Math.floor(Math.sqrt(Math.max(0,xp)/100))+1),start=100*(level-1)**2,next=100*level**2;
  return {level,name:names[Math.min(names.length-1,Math.floor((level-1)/2))],start,next,percent:Math.min(100,Math.round((xp-start)/(next-start)*100))};
}
export function answerCorrect(question,answer){
  if(question.type==='order')return Array.isArray(answer)&&answer.length===question.correct.length&&answer.every((value,index)=>value===question.correct[index]);
  if(question.type==='match'||question.type==='memory')return answer&&Object.keys(answer).length===question.pairs.length&&question.pairs.every((_,index)=>Number(answer[index])===index);
  return Number.isInteger(answer)&&answer===question.correct;
}
export function scoreAnswer({correct,elapsed=0,combo=0,hintCost=0}={}){
  if(!correct)return 0;
  const base=100,speed=Math.max(0,50-Math.floor(Math.max(0,elapsed)/1000)*5),multiplier=1+Math.min(5,Math.floor(combo/3))*.2;
  return Math.max(0,Math.round((base+speed)*multiplier)-hintCost);
}
export function shareResult(round,day=utcDay()){
  const squares=round.results.map(result=>result.skipped?'⬜':result.correct?'🟦':'🟥').join('');
  return `Motron BMW ${round.mode==='daily'?'Daily '+day:PLAY_MODES.find(mode=>mode.id===round.mode)?.name||'Play'}\n${squares}\n${round.results.filter(result=>result.correct).length}/${round.results.length} · ${round.score} points\n${globalThis.location?.origin||''}/play`;
}
