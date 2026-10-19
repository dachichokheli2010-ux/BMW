const validDay=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
const completedDay=(state,ids)=>ids.every(id=>validDay(state.completed?.[id]?.day))?ids.map(id=>state.completed[id].day).sort().at(-1):null;
const engineIds=['engine-n54','engine-n55','engine-b58','engine-s63'];
const diagnosticIds=['diagnosis-cooling-flow','diagnosis-boost-path','diagnosis-signal-plausibility'];
const collectibleIds=['f10-m5','f80','g80','f82'];
function streakEvidence(state){
  let current=0,best=0,previous=null,day=null;
  for(const item of [...new Set((state.days||[]).filter(validDay))].sort()){
    const value=Date.parse(item+'T12:00:00Z')/86400000;
    current=previous!==null&&value-previous===1?current+1:1;
    best=Math.max(best,current);if(current===7&&day===null)day=item;previous=value;
  }
  return {value:best,day};
}

export const ACHIEVEMENTS = Object.freeze([
  {id:'first-ignition',name:'First ignition',description:'Complete your first lesson.',max:1,icon:'01'},
  {id:'parts-rookie',name:'Parts rookie',description:'Correctly identify 25 component photographs.',max:25,icon:'◇'},
  {id:'engine-enthusiast',name:'Engine enthusiast',description:'Complete the four documented engine-family lessons.',max:4,icon:'◎'},
  {id:'perfect-mechanic',name:'Perfect mechanic',description:'Finish 10 lessons with no first-attempt errors.',max:10,icon:'✧'},
  {id:'bmw-collector',name:'BMW collector',description:'Unlock all four reference cards.',max:4,icon:'▱'},
  {id:'seven-day-driver',name:'Seven-day driver',description:'Reach a seven-day learning streak.',max:7,icon:'♨'},
  {id:'turbo-master',name:'Turbo master',description:'Complete Air under pressure.',max:1,icon:'↗'},
  {id:'diagnostic-specialist',name:'Diagnostic specialist',description:'Complete all three simulated diagnostic cases.',max:3,icon:'⚒'}
]);

export function achievementProgress(state){
  const entries=Object.entries(state.completed||{}),perfect=entries.filter(([,item])=>item?.accuracy===100),streak=streakEvidence(state);
  const completionDates=entries.map(([,item])=>item?.day),perfectDates=perfect.map(([,item])=>item.day);
  const values={
    'first-ignition':{value:entries.length,day:completionDates.length&&completionDates.every(validDay)?completionDates.sort()[0]:null},
    'parts-rookie':{value:Object.entries(state.attempts||{}).filter(([id])=>id.startsWith('part-')&&id.endsWith('-photo')).reduce((sum,[,item])=>sum+(Number(item?.right)||0),0),day:null},
    'engine-enthusiast':{value:engineIds.filter(id=>state.completed?.[id]).length,day:completedDay(state,engineIds)},
    'perfect-mechanic':{value:perfect.length,day:perfectDates.length>=10&&perfectDates.every(validDay)?perfectDates.sort()[9]:null},
    'bmw-collector':{value:collectibleIds.filter(id=>state.unlocked?.includes(id)).length,day:null},
    'seven-day-driver':streak,
    'turbo-master':{value:state.completed?.turbocharging?1:0,day:validDay(state.completed?.turbocharging?.day)?state.completed.turbocharging.day:null},
    'diagnostic-specialist':{value:diagnosticIds.filter(id=>state.completed?.[id]).length,day:completedDay(state,diagnosticIds)}
  };
  return ACHIEVEMENTS.map(definition=>({...definition,...values[definition.id],earned:values[definition.id].value>=definition.max,unlockedAt:state.achievements?.[definition.id]?.day??null}));
}

// A date recovered from old evidence is used only when that evidence identifies
// the day. Unknown historical dates stay null instead of becoming today's date.
export function reconcileAchievements(state,{day=null}={}){
  const prior=state.achievements&&typeof state.achievements==='object'&&!Array.isArray(state.achievements)?state.achievements:{},next={},earned=[];
  for(const badge of achievementProgress(state)){
    if(!badge.earned)continue;
    if(Object.hasOwn(prior,badge.id))next[badge.id]={day:validDay(prior[badge.id]?.day)?prior[badge.id].day:badge.day};
    else{next[badge.id]={day:badge.day||(validDay(day)?day:null)};earned.push(badge.id);}
  }
  state.achievements=next;
  return earned;
}
