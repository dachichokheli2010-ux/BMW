import {catalogMeta} from './catalog-meta.js';
import {REWARD_POLICY,FIRST_LESSON_AWARD,rewardPreview,creditReward} from '../public/academy-rewards.js';
import {achievementProgress} from '../public/academy-achievements.js';

// These are bounds for imported personal learning records. The browser still
// supplies quiz answers; this does not establish scores for public rankings.
const lessons=new Map(catalogMeta.lessons.map(lesson=>[lesson.id,lesson]));
const models=new Set(catalogMeta.models.map(model=>model.id));
export const academyRewardMetadata=Object.freeze({
  checkpointIds:['basics-checkpoint','basics-finale'],
  advancedIds:catalogMeta.lessons.filter(lesson=>lesson.topic==='mechanic').map(lesson=>lesson.id),
  unitMembers:catalogMeta.unitMembers
});
const validDay=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
const hasAttempt=(state,id)=>Number.isSafeInteger(state.attempts?.[id]?.total)&&state.attempts[id].total>0;
function lessonEvidence(state,id,latestDay){
  const item=state.completed?.[id];
  if(!item||item.migrated||!validDay(item.day)||item.day>latestDay)return false;
  const published=lessons.get(id);
  if(published)return published.questions.every(questionId=>hasAttempt(state,questionId));
  if(!id.startsWith('explore-')||!models.has(id.slice(8)))return false;
  return ['generation','scope'].every(suffix=>hasAttempt(state,id+'-'+suffix))&&(hasAttempt(state,id+'-engine')||hasAttempt(state,id+'-drive'));
}
function receipt(state,key,latestDay){
  if(key===FIRST_LESSON_AWARD){
    return state.awards.some(award=>award.startsWith('lesson:')&&lessonEvidence(state,award.slice(7),latestDay))?{xp:REWARD_POLICY.firstLesson,credits:0}:null;
  }
  const split=key.indexOf(':'),kind=key.slice(0,split),id=key.slice(split+1);
  if(kind==='lesson'){
    if(!lessonEvidence(state,id,latestDay))return null;
    const lesson={boss:academyRewardMetadata.checkpointIds.includes(id),advanced:academyRewardMetadata.advancedIds.includes(id)},completion=state.completed[id];
    return {xp:rewardPreview(lesson,{perfect:completion.accuracy===100}),credits:completion.rewardVersion===2?creditReward(lesson,{accuracy:completion.accuracy}):5};
  }
  if(kind==='unit'){
    const members=academyRewardMetadata.unitMembers[id];
    return members?.length&&members.every(lessonId=>state.completed?.[lessonId])?{xp:REWARD_POLICY.unit,credits:0}:null;
  }
  if(!['daily','review'].includes(kind)||!validDay(id)||id>latestDay)return null;
  const count=Object.values(state.attempts||{}).filter(item=>item.total>0).length;
  const activity=state.activity.some(item=>item.kind===kind&&(kind==='daily'?item.lessonId==='daily-'+id:item.day===id)&&state.days.includes(item.day));
  // Activity is a bounded 500-entry history. Older valid daily records survive
  // that truncation through their unique award and learning-day records.
  if((!activity&&!state.days.includes(id))||count<(kind==='daily'?3:1))return null;
  const evidence=state.activity.find(item=>item.kind===kind&&(kind==='daily'?item.lessonId==='daily-'+id:item.day===id));
  return {xp:kind==='daily'?Math.max(30,REWARD_POLICY.daily):REWARD_POLICY.review,credits:evidence?.rewardVersion===2?creditReward(null,{kind,accuracy:evidence.accuracy}):kind==='daily'?5:2};
}
function reset(state){
  return state===null||state.xp===0&&state.credits===0&&['completed','attempts','review','achievements'].every(key=>Object.keys(state[key]||{}).length===0)&&['days','awards','unlocked','activity'].every(key=>(state[key]||[]).length===0);
}
const fail=error=>({ok:false,error});

// Receipt IDs are kept privately with the garage JSON. Forgetting an award in
// an older browser snapshot must not make it payable a second time. A full
// Academy reset clears both points and receipts; no database migration needed.
export function validateAcademyTransition(next,previous=null,storedLedger=null,{now=Date.now()}={}){
  if(reset(next))return {ok:true,ledger:{version:1,seen:[]}};
  const latestDay=new Date(now+86400000).toISOString().slice(0,10);
  const seen=new Set([
    ...(storedLedger?.version===1&&Array.isArray(storedLedger.seen)?storedLedger.seen.filter(key=>typeof key==='string'):[]),
    ...(previous?.awards||[]),
    ...Object.keys(previous?.completed||{}).map(id=>'lesson:'+id)
  ]);
  let xpBudget=Number(previous?.xp)||0,creditBudget=Number(previous?.credits)||0;
  for(const key of next.awards){
    if(seen.has(key))continue;
    const reward=receipt(next,key,latestDay);
    if(!reward)return fail('Academy reward records do not match the completed activities. Your saved progress has not changed.');
    xpBudget+=reward.xp;creditBudget+=reward.credits;seen.add(key);
  }
  if(next.xp>xpBudget||next.credits>creditBudget)return fail('Academy XP or credits exceed the rewards for these activities. Your saved progress has not changed.');
  const earned=new Set(achievementProgress(next).filter(badge=>badge.earned).map(badge=>badge.id));
  if(Object.keys(next.achievements||{}).some(id=>!earned.has(id)))return fail('An Academy achievement has not met its learning requirements. Your saved progress has not changed.');
  if(seen.size>50000)return fail('This learning history is too large to save. Export a backup before resetting Academy progress.');
  return {ok:true,ledger:{version:1,seen:[...seen]}};
}
