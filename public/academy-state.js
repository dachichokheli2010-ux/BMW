import {REWARD_POLICY,CREDIT_POLICY,FIRST_LESSON_AWARD,rewardPreview,creditReward} from './academy-rewards.js';
import {reconcileAchievements} from './academy-achievements.js';
// Guest progress is local to this browser. Rewards are issued only by a completed session.
export const localDay = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const dayNumber = day => Date.parse(day+'T12:00:00Z') / 86400000;
const validDay=day=>typeof day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(day)&&Number.isFinite(dayNumber(day))&&new Date(day+'T12:00:00Z').toISOString().slice(0,10)===day;
export const LEARNING_PATHS=Object.freeze(['basics','powertrains','parts','models','engines','systems','mechanic']);
export function emptyProgress(){return {version:2,xp:0,credits:0,completed:{},attempts:{},review:{},days:[],awards:[],unlocked:[],activity:[],name:'Guest driver',selectedPath:'basics',achievements:{}};}
export function restoreProgress(value){
  const clean=emptyProgress();
  if(!value || typeof value!=='object' || value.version!==2)return clean;
  for(const key of ['xp','credits'])clean[key]=Number.isFinite(value[key])&&value[key]>=0?Math.floor(value[key]):0;
  for(const key of ['completed','attempts','review'])if(value[key]&&typeof value[key]==='object'&&!Array.isArray(value[key]))clean[key]={...value[key]};
  for(const key of ['days','awards','unlocked'])if(Array.isArray(value[key]))clean[key]=[...new Set(value[key].filter(v=>typeof v==='string'))];
  clean.days=clean.days.filter(validDay).sort();
  clean.activity=Array.isArray(value.activity)?value.activity.filter(v=>v&&typeof v.day==='string'&&Number.isFinite(v.xp)).slice(-500):[];
  clean.name=typeof value.name==='string'?value.name.trim().slice(0,32)||clean.name:clean.name;
  if(LEARNING_PATHS.includes(value.selectedPath))clean.selectedPath=value.selectedPath;
  if(value.achievements&&typeof value.achievements==='object'&&!Array.isArray(value.achievements))clean.achievements=value.achievements;
  reconcileAchievements(clean);
  return clean;
}
export function validateAnswer(question, answer){
  if(!question)return false;
  if(question.type==='order')return Array.isArray(answer)&&answer.length===question.correct.length&&answer.every((id,i)=>id===question.correct[i]);
  if(question.type==='match')return answer&&typeof answer==='object'&&question.pairs.every((_,i)=>answer[i]===i)&&Object.keys(answer).length===question.pairs.length;
  return Number.isInteger(answer)&&answer===question.correct;
}
const assessmentVersion=lesson=>Math.max(1,Number(lesson?.assessmentVersion)||1,...(lesson?.questions||[]).map(question=>Number(question.assessmentVersion)||1));
export function beginSession(lesson,{kind='lesson',day=localDay()}={}){
  return {lessonId:lesson.id,topic:lesson.topic,kind,day,assessmentVersion:assessmentVersion(lesson),questionIds:lesson.questions.map(q=>q.id),first:{},resolved:[],completed:false};
}
// Resume only the exact published question set. No answers, question content or
// reward amounts from browser storage become part of the lesson definition.
export function restoreSession(value,lesson,{day=localDay()}={}){
  if(!value||typeof value!=='object'||!lesson||value.completed!==false||value.lessonId!==lesson.id||value.topic!==lesson.topic||!['lesson','daily','review'].includes(value.kind)||!validDay(value.day)||value.day>day)return null;
  if((value.assessmentVersion??1)!==assessmentVersion(lesson))return null;
  const ids=lesson.questions.map(question=>question.id);
  if(!Array.isArray(value.questionIds)||value.questionIds.length!==ids.length||!value.questionIds.every((id,index)=>id===ids[index]))return null;
  if(!value.first||typeof value.first!=='object'||Array.isArray(value.first)||!Object.entries(value.first).every(([id,correct])=>ids.includes(id)&&typeof correct==='boolean'))return null;
  if(!Array.isArray(value.resolved)||new Set(value.resolved).size!==value.resolved.length||!value.resolved.every(id=>ids.includes(id)&&Object.hasOwn(value.first,id)))return null;
  if(value.kind!=='lesson'&&value.lessonId!==value.kind+'-'+value.day)return null;
  return {lessonId:lesson.id,topic:lesson.topic,kind:value.kind,day:value.day,assessmentVersion:assessmentVersion(lesson),questionIds:ids,first:{...value.first},resolved:[...value.resolved],completed:false};
}
export function recordAnswer(state,session,question,answer,day=localDay()){
  if(session.completed||!session.questionIds.includes(question.id)||session.resolved.includes(question.id))return null;
  const correct=validateAnswer(question,answer),first=!Object.hasOwn(session.first,question.id);
  if(first){
    session.first[question.id]=correct;
    const prior=state.attempts[question.id]||{right:0,total:0,topic:question.sourceTopic||session.topic};
    state.attempts[question.id]={right:(Number(prior.right)||0)+(correct?1:0),total:(Number(prior.total)||0)+1,topic:question.sourceTopic||session.topic,lastDay:day};
  }
  if(correct){
    session.resolved.push(question.id);
    const prior=state.review[question.id];
    if(prior){const stage=session.first[question.id]===false?0:Math.min(4,(Number(prior.stage)||0)+1),next=new Date((dayNumber(day)+[1,3,7,14,30][stage])*86400000);state.review[question.id]={topic:question.sourceTopic||session.topic,stage,due:next.toISOString().slice(0,10)};}
  }else state.review[question.id]={topic:question.sourceTopic||session.topic,stage:0,due:day};
  return {correct,first};
}
export function levelProgress(xp){
  const threshold=level=>Math.round(75*Math.pow(level-1,1.5));
  let level=1;while(level<100&&xp>=threshold(level+1))level++;
  const current=threshold(level),next=threshold(level+1);
  const names=[[100,'Academy Legend'],[75,'BMW Scholar'],[50,'Automotive Master'],[35,'Performance Expert'],[20,'Engine Specialist'],[10,'Automotive Learner'],[5,'Car Enthusiast'],[1,'Beginner']];
  return {level,title:names.find(([minimum])=>level>=minimum)[1],current,next,percent:level===100?100:Math.min(100,Math.round((xp-current)/(next-current)*100))};
}
export function currentStreak(state,day=localDay()){
  const days=[...new Set(state.days)].sort().filter(value=>value<=day);
  if(!days.length || dayNumber(day)-dayNumber(days.at(-1))>1)return 0;
  let streak=1;for(let i=days.length-1;i>0;i--){if(dayNumber(days[i])-dayNumber(days[i-1])!==1)break;streak++;}return streak;
}
export function longestStreak(state){
  const days=[...new Set(state.days)].sort();let best=0,current=0;
  for(let i=0;i<days.length;i++){current=i>0&&dayNumber(days[i])-dayNumber(days[i-1])===1?current+1:1;best=Math.max(best,current);}return best;
}
export function finishSession(state,session,lesson,units=[],day=localDay()){
  if(!restoreSession(session,lesson,{day})||!session.questionIds.length||Object.keys(session.first).length!==session.questionIds.length||!session.questionIds.every(id=>session.resolved.includes(id)))return null;
  session.completed=true;
  const correct=Object.values(session.first).filter(Boolean).length,accuracy=Math.round(correct/session.questionIds.length*100),awardKey=session.kind==='daily'?'daily:'+session.day:session.kind==='review'?'review:'+day:'lesson:'+lesson.id;
  let xp=0,credits=0,unitBonus=0,firstBonus=0;
  const already=state.awards.includes(awardKey)||(session.kind==='lesson'&&Object.hasOwn(state.completed,lesson.id));
  if(!already){
    const firstLesson=session.kind==='lesson'&&Object.keys(state.completed).length===0&&!state.awards.includes(FIRST_LESSON_AWARD);
    firstBonus=firstLesson?REWARD_POLICY.firstLesson:0;
    xp=rewardPreview(lesson,{kind:session.kind,perfect:accuracy===100,firstLesson});credits=creditReward(lesson,{kind:session.kind,accuracy});
    state.awards.push(awardKey);
    if(firstLesson)state.awards.push(FIRST_LESSON_AWARD);
    if(session.kind==='lesson')state.completed[lesson.id]={day,accuracy,topic:lesson.topic,rewardVersion:CREDIT_POLICY.version};
    for(const unit of units){if(unit.lessons.length&&unit.lessons.every(id=>state.completed[id])&&!state.awards.includes('unit:'+unit.id)){state.awards.push('unit:'+unit.id);unitBonus+=REWARD_POLICY.unit;}}
    xp+=unitBonus;state.xp+=xp;state.credits+=credits;
  }
  if(!state.days.includes(day))state.days.push(day);state.days.sort();
  state.activity.push({day,xp,lessonId:lesson.id,kind:session.kind,accuracy,rewardVersion:CREDIT_POLICY.version});state.activity=state.activity.slice(-500);
  const newAchievements=reconcileAchievements(state,{day});
  return {xp,credits,accuracy,unitBonus,firstBonus,newAchievements,already,level:levelProgress(state.xp),streak:currentStreak(state,day)};
}
export function mastery(state,topic){
  const attempts=Object.values(state.attempts).filter(value=>value.topic===topic&&value.total>0);
  if(!attempts.length)return null;
  const total=attempts.reduce((sum,value)=>sum+value.total,0),right=attempts.reduce((sum,value)=>sum+value.right,0);
  return Math.round(right/total*100);
}
export function dueQuestions(state,day=localDay()){return Object.keys(state.review).filter(id=>state.review[id]?.due<=day);}
export function daySeed(day=localDay()){return [...day].reduce((seed,char)=>(seed*31+char.charCodeAt(0))>>>0,7);}
