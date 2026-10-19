import assert from 'node:assert/strict';
import {academyLessons,academyReferenceData as data} from '../public/academy.js';
import {createCurriculum} from '../public/academy-content.js';
import {allModels} from '../public/catalog.js';
import {partCatalog} from '../public/parts.js';
import {emptyProgress,beginSession,recordAnswer,finishSession} from '../public/academy-state.js';
import {createLessonDraft,restoreLessonDraft} from '../public/academy-session.js';
import {lessonTeaching} from '../public/academy-teaching.js';
import {getGlossaryEntry,searchGlossary,glossaryEntries} from '../public/academy-glossary.js';
const {lessons,units}=createCurriculum(academyLessons,data.sources,partCatalog,allModels,data.scenarios);
const day='2026-10-19',owner='local:driver';
const lesson=lessons.find(item=>item.id==='first-engine'),state=emptyProgress(),session=beginSession(lesson,{day});
const q=lesson.questions[0];
recordAnswer(state,session,q,(q.correct+1)%q.answers.length,day);
recordAnswer(state,session,q,q.correct,day);
const source={owner,session,stage:'question',step:0,questionIndex:0,answer:q.correct,answerState:true,orderSelection:[],matches:{},selectedMatch:null};
const serialized=JSON.parse(JSON.stringify(createLessonDraft(source)));
const resumed=restoreLessonDraft(serialized,lesson,{owner,day});
assert.ok(resumed);assert.equal(resumed.answerState,true);assert.equal(resumed.session.first[q.id],false);
assert.equal(state.xp,0);assert.equal(recordAnswer(state,resumed.session,q,q.correct,day),null,'A refresh cannot count a resolved answer twice');
for(const current of lesson.questions.slice(1))recordAnswer(state,resumed.session,current,current.correct,day);
const result=finishSession(state,resumed.session,lesson,units,day);
assert.equal(result.accuracy,67);assert.equal(result.xp,50,'First-attempt mistakes survive a reload');
assert.equal(finishSession(state,resumed.session,lesson,units,day),null);
assert.equal(restoreLessonDraft(serialized,lesson,{owner:'another-account',day}),null);
assert.equal(restoreLessonDraft({...serialized,questionIndex:2},lesson,{owner,day}),null,'Cannot skip unresolved questions through a draft');
assert.equal(restoreLessonDraft({...serialized,session:{...serialized.session,questionIds:['fake']}},lesson,{owner,day}),null);
assert.equal(restoreLessonDraft({...serialized,answer:(q.correct+1)%q.answers.length},lesson,{owner,day}),null,'A resolved response must still match the published answer');
for(const item of lessons){const teaching=lessonTeaching(item,allModels);assert.equal(teaching.objectives.length,3);for(const id of teaching.terms)assert.ok(getGlossaryEntry(id),'Published key term must exist: '+id);for(const model of teaching.examples)assert.ok(model.source);}
for(const language of ['en','ka','ru']){
  assert.equal(searchGlossary('',{language}).length,18);
  for(const entry of glossaryEntries){const localized=getGlossaryEntry(entry.id,language);assert.ok(localized.name&&localized.summary&&localized.detail);for(const id of entry.lessonIds)assert.ok(lessons.some(lesson=>lesson.id===id));for(const id of entry.modelIds)assert.ok(allModels.some(model=>model.id===id));}
}
assert.ok(searchGlossary('კრუტი').length===0,'Unrelated terms do not silently select an entry');
assert.ok(searchGlossary('Valvetronic',{language:'ka'}).some(entry=>entry.id==='valvetronic'));
console.log('PASS Academy recovery, first-attempt scoring, account-scoped drafts, glossary languages and lesson links.');
