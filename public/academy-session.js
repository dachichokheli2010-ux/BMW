import {restoreSession,validateAnswer,localDay} from './academy-state.js';
// An unfinished round is device-local and scoped to the current account. Stored
// data can select published questions, but cannot replace their text or answers.
export function restoreLessonDraft(value,lesson,{owner='guest',day=localDay()}={}){
  if(!value||value.version!==1||value.owner!==owner||!['intro','question'].includes(value.stage))return null;
  const session=restoreSession(value.session,lesson,{day});if(!session)return null;
  const max=lesson.questions.length-1,index=value.questionIndex;
  if(!Number.isInteger(index)||index<0||index>max||!Number.isInteger(value.step)||value.step<0||value.step>=Math.max(1,lesson.steps?.length||0))return null;
  if(session.questionIds.slice(0,index).some(id=>!session.resolved.includes(id))||session.questionIds.slice(index+1).some(id=>Object.hasOwn(session.first,id)))return null;
  if(value.stage==='intro'&&(index!==0||session.resolved.length||Object.keys(session.first).length))return null;
  const q=lesson.questions[index];
  let answer=null,orderSelection=[],matches={},selectedMatch=null;
  if(q.type==='choice'&&Number.isInteger(value.answer)&&value.answer>=0&&value.answer<q.answers.length)answer=value.answer;
  if(q.type==='order'&&Array.isArray(value.orderSelection)&&new Set(value.orderSelection).size===value.orderSelection.length&&value.orderSelection.every(id=>q.items.some(item=>item.id===id)))orderSelection=[...value.orderSelection];
  if(q.type==='match'&&value.matches&&typeof value.matches==='object'&&!Array.isArray(value.matches)){
    const pairs=Object.entries(value.matches);if(pairs.length<=q.pairs.length&&pairs.every(([key,item])=>/^\d+$/.test(key)&&Number(key)<q.pairs.length&&Number.isInteger(item)&&item>=0&&item<q.pairs.length)&&new Set(pairs.map(([,item])=>item)).size===pairs.length)matches=Object.fromEntries(pairs);
    if(Number.isInteger(value.selectedMatch)&&value.selectedMatch>=0&&value.selectedMatch<q.pairs.length)selectedMatch=value.selectedMatch;
  }
  const checked=q.type==='choice'?answer:q.type==='order'?orderSelection:matches;
  const resolved=session.resolved.includes(q.id);
  const answerState=resolved?true:value.answerState===false&&Object.hasOwn(session.first,q.id)?false:null;
  if(resolved&&!validateAnswer(q,checked))return null;
  return {version:1,owner,session,stage:value.stage,step:value.step,questionIndex:index,answer,answerState,orderSelection,matches,selectedMatch};
}
export function createLessonDraft(value){
  const {owner,session,stage,step,questionIndex,answer,answerState,orderSelection,matches,selectedMatch}=value;
  return {version:1,owner,session:structuredClone(session),stage,step,questionIndex,answer,answerState,orderSelection:[...orderSelection],matches:{...matches},selectedMatch};
}
