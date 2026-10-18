import assert from 'node:assert/strict';
import fs from 'node:fs';
import {academyLessons,academyReferenceData} from '../public/academy.js';
import {allModels} from '../public/catalog.js';
import {partCatalog} from '../public/parts.js';
import {createCurriculum} from '../public/academy-content.js';
import {createMChallenges,mRecognitionModels,shuffled} from '../public/academy-recognition.js';
import {emptyProgress,restoreProgress,localDay,beginSession,recordAnswer,finishSession,currentStreak,mastery,dueQuestions,daySeed,levelProgress,validateAnswer} from '../public/academy-state.js';

const {lessons,units}=createCurriculum(academyLessons,academyReferenceData.sources,partCatalog,allModels,academyReferenceData.scenarios);
const answerFor=q=>q.type==='order'?[...q.correct]:q.type==='match'?Object.fromEntries(q.pairs.map((_,i)=>[i,i])):q.correct;
const complete=(state,lesson,day,kind='lesson')=>{const session=beginSession(lesson,{day,kind});for(const q of lesson.questions)assert.equal(recordAnswer(state,session,q,answerFor(q),day).correct,true);return {session,result:finishSession(state,session,lesson,units,day)};};

assert.equal(academyLessons.length,8,'Legacy learning/search exports remain intact');
assert.equal(units[0].lessons.length,12,'Complete beginner course plus two checkpoints');
assert.equal(new Set(lessons.map(l=>l.id)).size,lessons.length);
const questionIds=new Set();
for(const lesson of lessons){
  assert.ok(lesson.sources.length,lesson.id+' needs a reference');
  assert.ok(lesson.questions.length>=3,lesson.id+' needs a completed activity');
  for(const source of lesson.sources)assert.match(source.url,/^https:\/\//);
  if(lesson.photo?.src&&!/^https?:/.test(lesson.photo.src))assert.ok(fs.existsSync('public/'+lesson.photo.src));
  for(const q of lesson.questions){
    assert.ok(!questionIds.has(q.id),'Question IDs must be stable and unique: '+q.id);questionIds.add(q.id);
    assert.equal(validateAnswer(q,answerFor(q)),true,q.id);
    if(q.type==='choice'){assert.ok(q.answers.length>=3);assert.equal(validateAnswer(q,(q.correct+1)%q.answers.length),false);assert.equal(validateAnswer(q,String(q.correct)),false);}
    if(q.type==='order')assert.equal(validateAnswer(q,[...q.correct].reverse()),false);
    if(q.type==='match')assert.equal(validateAnswer(q,{...answerFor(q),0:1}),false);
  }
}
for(const unit of units)for(const id of unit.lessons)assert.ok(lessons.some(l=>l.id===id),id);
const rounds=createMChallenges(allModels);
assert.equal(rounds.length,3);assert.equal(rounds.flatMap(l=>l.questions).length,20);
assert.equal(mRecognitionModels.length,10);
for(const round of rounds)for(const q of round.questions){
  const model=allModels.find(m=>m.id===q.modelId);
  assert.match(model.generation,/^M SERIES/,'Recognition excludes M Sport trims');
  assert.equal(new Set(q.answers).size,4,'Photo answers must be unambiguous');
  assert.equal(q.answers[q.correct],q.prompt.includes('generation')?model.generation.split('/').at(-1).trim():model.name.match(/\bM[234568]\b/)[0]);
  assert.ok(fs.existsSync('public/'+q.photo.src));assert.ok(q.photo.author&&q.photo.license&&q.photo.page);
  assert.ok(q.hint&&q.explanation&&q.sourceRefs.length);
}
assert.deepEqual(shuffled([0,1,2,3],'same'),shuffled([0,1,2,3],'same'),'Puzzle order stays stable between taps');
assert.deepEqual([...shuffled([0,1,2,3],'other')].sort(),[0,1,2,3]);
for(const id of ['puzzle-sequences','puzzle-connections','puzzle-parts'])assert.equal(lessons.find(l=>l.id===id).questions.length,4);

const day='2026-10-18',lesson=lessons.find(l=>l.id==='first-engine'),state=emptyProgress(),session=beginSession(lesson,{day});
assert.equal(finishSession(state,session,lesson,units,day),null,'An incomplete activity cannot award XP');
const first=lesson.questions[0];
assert.equal(recordAnswer(state,session,first,(first.correct+1)%first.answers.length,day).correct,false);
assert.equal(state.xp,0,'Answer clicks do not award XP');
assert.equal(recordAnswer(state,session,first,first.correct,day).correct,true);
assert.equal(recordAnswer(state,session,first,first.correct,day),null,'Resolved answers cannot be resubmitted');
for(const q of lesson.questions.slice(1))recordAnswer(state,session,q,answerFor(q),day);
const result=finishSession(state,session,lesson,units,day);
assert.equal(result.xp,15);assert.equal(result.accuracy,67);assert.equal(result.streak,1);
assert.equal(mastery(state,'basics'),67,'Correcting a mistake cannot rewrite first-attempt accuracy');
assert.equal(finishSession(state,session,lesson,units,day),null);
assert.equal(complete(state,lesson,day).result.xp,0,'Replaying cannot farm rewards');
assert.equal(state.days.length,1,'Duplicate activities count as one learning day');
assert.equal(state.review[first.id].due,'2026-10-21','A later successful practice advances the review interval');
assert.ok(!dueQuestions(state,'2026-10-20').includes(first.id));
assert.ok(dueQuestions(state,'2026-10-21').includes(first.id));

const roundtrip=restoreProgress(JSON.parse(JSON.stringify(state)));
assert.deepEqual(roundtrip,state,'Guest XP, attempts, queue and history survive persistence');
assert.equal(restoreProgress({version:2,xp:-5,credits:NaN,days:['bad']}).xp,0);
assert.equal(restoreProgress(null).xp,0);
assert.equal(currentStreak({...emptyProgress(),days:['2026-10-16','2026-10-17','2026-10-18']},day),3);
assert.equal(currentStreak({...emptyProgress(),days:['2026-10-17']},day),1,'Yesterday remains active before today’s completion');
assert.equal(currentStreak({...emptyProgress(),days:['2026-10-16']},day),0,'A missing calendar day resets the current streak');
assert.equal(currentStreak({...emptyProgress(),days:['2026-03-07','2026-03-08','2026-03-09']},'2026-03-09'),3,'Calendar counting is independent of daylight-saving hours');
assert.equal(localDay(new Date(2026,9,18,23,59)),'2026-10-18');
assert.equal(localDay(new Date(2026,9,19,0,0)),'2026-10-19');
assert.equal(daySeed(day),daySeed(day));assert.notEqual(daySeed(day),daySeed('2026-10-19'));
assert.equal(levelProgress(0).level,1);assert.equal(levelProgress(75).level,2);

const rewardState=emptyProgress(),daily={...lesson,id:'daily-'+day};
assert.equal(complete(rewardState,daily,day,'daily').result.xp,30);
assert.equal(complete(rewardState,daily,day,'daily').result.xp,0,'Daily completion rewards once per local day');
const unitState=emptyProgress(),firstUnit=units[0];
for(const id of firstUnit.lessons){const l=lessons.find(v=>v.id===id);complete(unitState,l,day);}
assert.ok(unitState.awards.includes('unit:basics'));
assert.equal(unitState.activity.at(-1).xp,160,'Final perfect checkpoint includes the single 100 XP unit bonus');
assert.equal(complete(unitState,lesson,day).result.xp,0,'Unit completion bonus cannot be farmed');
console.log(`PASS Academy: ${lessons.length} sourced lessons, ${questionIds.size} validated questions; rewards, retries, persistence, streaks and review scheduling.`);
