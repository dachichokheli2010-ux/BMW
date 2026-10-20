import assert from 'node:assert/strict';
import fs from 'node:fs';
import {academyLessons,academyReferenceData} from '../public/academy.js';
import {allModels} from '../public/catalog.js';
import {partCatalog} from '../public/parts.js';
import {createCurriculum} from '../public/academy-content.js';
import {lessonTeaching} from '../public/academy-teaching.js';
import {createMChallenges,mRecognitionModels,shuffled} from '../public/academy-recognition.js';
import {emptyProgress,restoreProgress,localDay,beginSession,restoreSession,recordAnswer,finishSession,currentStreak,mastery,dueQuestions,daySeed,levelProgress,validateAnswer} from '../public/academy-state.js';
import {REWARD_POLICY,CREDIT_POLICY,lessonReward,rewardPreview,creditReward} from '../public/academy-rewards.js';
import {achievementProgress,reconcileAchievements} from '../public/academy-achievements.js';
import {validateAcademy} from '../server/validation.js';
import {validateAcademyTransition} from '../server/academy-policy.js';

const {lessons,units}=createCurriculum(academyLessons,academyReferenceData.sources,partCatalog,allModels,academyReferenceData.scenarios);
const answerFor=q=>q.type==='order'?[...q.correct]:q.type==='match'?Object.fromEntries(q.pairs.map((_,i)=>[i,i])):q.correct;
const complete=(state,lesson,day,kind='lesson')=>{const session=beginSession(lesson,{day,kind});for(const q of lesson.questions)assert.equal(recordAnswer(state,session,q,answerFor(q),day).correct,true);return {session,result:finishSession(state,session,lesson,units,day)};};

assert.equal(academyLessons.length,10,'Legacy lessons and the two new beginner lessons are present');
assert.equal(units[0].lessons.length,12,'Complete beginner course plus two checkpoints');
assert.ok(units.find(unit=>unit.id==='powertrains').lessons.includes('engine-codes'));
assert.ok(units.find(unit=>unit.id==='powertrains').lessons.includes('drivetrain-layouts'));
assert.ok(units.find(unit=>unit.id==='powertrains').lessons.includes('m-performance'));
for(const id of ['drivetrain-layouts','m-performance']){
  const teaching=lessonTeaching(lessons.find(lesson=>lesson.id===id),allModels);
  assert.deepEqual(teaching.examples.map(model=>model.id),['f10-m5','g80-m3-cs']);
  assert.ok(teaching.terms.length);
}
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
assert.equal(result.xp,50);assert.equal(result.firstBonus,30);assert.equal(result.accuracy,67);assert.equal(result.streak,1);
assert.equal(result.credits,0,'Correcting mistakes teaches the lesson but cannot convert a low first-attempt score into credits');
assert.deepEqual(state.achievements['first-ignition'],{day},'The first badge stores the actual completion date');
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
assert.deepEqual(restoreProgress({version:2,days:['2026-02-31']}).days,[],'Impossible calendar dates cannot become streak evidence');
state.selectedPath='engines';assert.equal(restoreProgress(state).selectedPath,'engines');
assert.equal(restoreProgress({...state,selectedPath:'invented'}).selectedPath,'basics');
assert.equal(currentStreak({...emptyProgress(),days:['2026-10-16','2026-10-17','2026-10-18']},day),3);
assert.equal(currentStreak({...emptyProgress(),days:['2026-10-17']},day),1,'Yesterday remains active before today’s completion');
assert.equal(currentStreak({...emptyProgress(),days:['2026-10-16']},day),0,'A missing calendar day resets the current streak');
assert.equal(currentStreak({...emptyProgress(),days:['2026-03-07','2026-03-08','2026-03-09']},'2026-03-09'),3,'Calendar counting is independent of daylight-saving hours');
assert.equal(localDay(new Date(2026,9,18,23,59)),'2026-10-18');
assert.equal(localDay(new Date(2026,9,19,0,0)),'2026-10-19');
assert.equal(daySeed(day),daySeed(day));assert.notEqual(daySeed(day),daySeed('2026-10-19'));
assert.equal(levelProgress(0).level,1);assert.equal(levelProgress(75).level,2);

const rewardState=emptyProgress(),daily={...lesson,id:'daily-'+day};
const dailyResult=complete(rewardState,daily,day,'daily').result;
assert.equal(dailyResult.xp,25);assert.equal(dailyResult.credits,1);
assert.equal(complete(rewardState,daily,day,'daily').result.xp,0,'Daily completion rewards once per local day');
assert.equal(complete(rewardState,{...lesson,id:'review-'+day},day,'review').result.credits,0,'Reviews build knowledge and XP without farming credits');
const unitState=emptyProgress(),firstUnit=units[0];
for(const id of firstUnit.lessons){const l=lessons.find(v=>v.id===id);complete(unitState,l,day);}
assert.ok(unitState.awards.includes('unit:basics'));
assert.equal(unitState.activity.at(-1).xp,165,'Final perfect checkpoint includes the single 100 XP unit bonus');
assert.equal(complete(unitState,lesson,day).result.xp,0,'Unit completion bonus cannot be farmed');

assert.ok(Object.isFrozen(REWARD_POLICY));
assert.equal(lessonReward(lesson),20);assert.equal(rewardPreview(lesson,{perfect:true,firstLesson:true}),65);
assert.equal(complete(emptyProgress(),lesson,day).result.xp,65,'The first perfect lesson earns each configured reward once');
assert.ok(Object.isFrozen(CREDIT_POLICY));
for(const [accuracy,expected]of [[0,0],[79,0],[80,2],[99,2],[100,3]])assert.equal(creditReward(lesson,{accuracy}),expected);
assert.equal(creditReward({...lesson,boss:true},{accuracy:80}),4);
assert.equal(creditReward(lesson,{kind:'daily',accuracy:79}),0);
const perfectProgress=emptyProgress();assert.equal(complete(perfectProgress,lesson,day).result.credits,3);
assert.ok(validateAcademy(perfectProgress));
assert.ok(validateAcademyTransition(perfectProgress,null,null,{now:Date.parse(day+'T12:00:00Z')}).ok);
assert.equal(validateAcademyTransition({...perfectProgress,credits:4},null,null,{now:Date.parse(day+'T12:00:00Z')}).ok,false,'New-policy receipts reject an inflated credit amount');
assert.equal(complete(perfectProgress,lesson,day).result.credits,0,'A perfect replay cannot farm credits');
const historical=restoreProgress({...emptyProgress(),xp:25,completed:{'first-engine':{day:'2026-10-15',accuracy:100,topic:'basics'}},awards:['lesson:first-engine']});
assert.equal(historical.xp,25,'Restoring progress never reprices historical rewards');
assert.equal(complete(historical,lesson,day).result.xp,0,'Old-policy lesson rewards cannot be earned again');
assert.equal(complete(historical,lessons.find(item=>item.id==='torque'),day).result.firstBonus,0,'Existing learners cannot earn a new first-lesson bonus');
assert.deepEqual(historical.achievements['first-ignition'],{day:'2026-10-15'});
const migrated=restoreProgress({...emptyProgress(),completed:{combustion:{day:null,accuracy:null,topic:'basics',migrated:true}}});
assert.deepEqual(migrated.achievements['first-ignition'],{day:null},'Unknown historical badge dates remain unknown');
reconcileAchievements(migrated,{day});assert.deepEqual(migrated.achievements['first-ignition'],{day:null},'Reconciliation does not invent an unlock date');
const badges={...emptyProgress(),days:['2026-10-10','2026-10-11','2026-10-12','2026-10-13','2026-10-14','2026-10-15','2026-10-16','2026-10-18']};
reconcileAchievements(badges);assert.deepEqual(badges.achievements['seven-day-driver'],{day:'2026-10-16'},'The streak badge preserves the first seven-day milestone');
assert.equal(achievementProgress(badges).find(badge=>badge.id==='seven-day-driver').earned,true);

const resumed=beginSession(lesson,{day});recordAnswer(emptyProgress(),resumed,first,first.correct,day);
assert.deepEqual(restoreSession(JSON.parse(JSON.stringify(resumed)),lesson,{day}),resumed,'First attempts and resolved questions survive a quiz refresh');
const revisedLesson={...lesson,questions:lesson.questions.map(q=>({...q,assessmentVersion:2}))};
const oldPending=structuredClone(resumed);delete oldPending.assessmentVersion;
assert.equal(restoreSession(oldPending,revisedLesson,{day}),null,'A new question version invalidates unfinished old answers');
const revisedSession=beginSession(revisedLesson,{day});assert.equal(restoreSession(revisedSession,revisedLesson,{day}).assessmentVersion,2);
assert.equal(restoreSession({...resumed,questionIds:[...resumed.questionIds].reverse()},lesson,{day}),null,'A changed published question set cannot resume stale answers');
assert.equal(restoreSession({...resumed,resolved:[first.id,first.id]},lesson,{day}),null);
assert.equal(restoreSession({...resumed,first:{[first.id]:'true'}},lesson,{day}),null);
const midnight=emptyProgress(),lateSession=beginSession(daily,{kind:'daily',day});
for(const question of daily.questions)recordAnswer(midnight,lateSession,question,answerFor(question),'2026-10-19');
assert.equal(finishSession(midnight,lateSession,daily,units,'2026-10-19').xp,25);
assert.ok(midnight.awards.includes('daily:'+day),'A midnight crossing rewards the original daily challenge once');
assert.equal(midnight.activity.at(-1).day,'2026-10-19');
assert.ok(validateAcademy(midnight),'A daily round completed after midnight remains safe to sync');
assert.equal(validateAcademy({...midnight,selectedPath:'unknown'}),false);
assert.equal(validateAcademy({...midnight,achievements:{'invented-badge':{day}}}),false);
assert.equal(validateAcademy({...midnight,achievements:{'first-ignition':{day:'2026-02-31'}}}),false);
const oldSnapshot=structuredClone(historical);delete oldSnapshot.selectedPath;delete oldSnapshot.achievements;
assert.ok(validateAcademy(oldSnapshot),'Existing version-2 account snapshots remain supported');
console.log(`PASS Academy: ${lessons.length} sourced lessons, ${questionIds.size} validated questions; configured rewards, historical compatibility, achievements, resume validation, midnight completion, streaks and review scheduling.`);
