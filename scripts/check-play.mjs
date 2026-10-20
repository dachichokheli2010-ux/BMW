import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseHTML} from 'linkedom';
import {allModels} from '../public/catalog.js';
import {createQuestionBank,PLAY_MODES,PLAY_BADGES,poolForMode,dailyQuestionIds,seededShuffle,answerCorrect,scoreAnswer,unlockedBadges,utcDay,shareResult} from '../public/play-data.js';
import {mountPlay,emptyPlayState,restorePlayState,takeQuestions,playStorageKey,playStreak} from '../public/play.js';

const bank=createQuestionBank(),byId=new Map(bank.map(question=>[question.id,question]));
assert.ok(bank.length>=500,`Only ${bank.length} questions`);
assert.equal(byId.size,bank.length,'Question IDs must be unique');
assert.ok(PLAY_MODES.length>=8);assert.ok(PLAY_BADGES.length>=50);
assert.equal(new Set(PLAY_BADGES.map(badge=>badge.id)).size,PLAY_BADGES.length);
for(const question of bank){
  assert.ok(question.prompt?.trim()&&question.explanation?.trim()&&question.learnURL?.startsWith('/'),question.id+' has a complete learning loop');
  assert.ok(question.sources?.length&&question.sources.every(source=>/^https:\/\//.test(source.url)),question.id+' has primary references');
  assert.ok([1,2,3,4].includes(question.difficulty));
  if(question.type==='choice'){
    assert.ok(question.answers.length>=2&&question.answers.length<=4,question.id);
    assert.equal(new Set(question.answers).size,question.answers.length,question.id+' has distinct choices');
    assert.ok(Number.isInteger(question.correct)&&question.correct>=0&&question.correct<question.answers.length);
    assert.equal(answerCorrect(question,question.correct),true);assert.equal(answerCorrect(question,-1),false);
  }else if(question.type==='order'){
    assert.equal(new Set(question.correct).size,question.items.length);
    assert.equal(answerCorrect(question,question.correct),true);assert.equal(answerCorrect(question,[]),false);
  }else{
    assert.ok(question.pairs?.length>=2);
    assert.equal(answerCorrect(question,Object.fromEntries(question.pairs.map((_,index)=>[index,index]))),true);
    assert.equal(answerCorrect(question,{}),false);
  }
  if(question.photo){assert.ok(fs.existsSync(new URL('../public/'+question.photo.src,import.meta.url)),question.id+' photograph exists');assert.ok(question.photo.page&&question.photo.author&&question.photo.license,question.id+' photo is credited');}
  if(question.id.startsWith('spec-'))assert.ok(allModels.find(model=>model.id===question.modelId)?.verified,'Numerical recall needs the separate factory record');
}
for(const mode of PLAY_MODES.filter(mode=>mode.id!=='mistakes'))assert.ok(poolForMode(bank,mode.id).length,mode.name+' must have real playable content');
assert.equal(unlockedBadges(emptyPlayState()).length,0,'No empty account starts with an earned badge');
assert.ok(unlockedBadges({...emptyPlayState(),answers:1}).some(badge=>badge.id==='answers-1'));
assert.notEqual(playStorageKey('account-a'),playStorageKey('account-b'));assert.notEqual(playStorageKey('guest'),playStorageKey(null));
assert.equal(utcDay(new Date('2026-10-20T23:59:59Z')),'2026-10-20');
assert.deepEqual(dailyQuestionIds(bank,'2026-10-20'),dailyQuestionIds([...bank].reverse(),'2026-10-20'),'Every player gets identical daily order regardless of catalogue order');
assert.notDeepEqual(dailyQuestionIds(bank,'2026-10-20'),dailyQuestionIds(bank,'2026-10-21'));
assert.equal(new Set(dailyQuestionIds(bank,'2026-10-20')).size,10);
for(const mode of ['practice','daily','engines'])assert.ok(poolForMode(bank,mode).every(question=>question.assessmentKind==='understanding'),mode+' prioritizes applied learning rather than catalogue recall');
assert.equal(new Set(dailyQuestionIds(bank,'2026-10-20').map(id=>byId.get(id).sourceGroup)).size,10,'Daily covers ten different lessons');
const publishedDeck=bank.filter(question=>question.type==='choice').slice(0,10).map(question=>question.id);
assert.deepEqual(restorePlayState({...emptyPlayState(),daily:{'2026-10-19':{ids:publishedDeck,results:[{id:publishedDeck[0],correct:true,skipped:false,points:100}],score:100,completed:false}}},bank).daily['2026-10-19'].ids,publishedDeck,'Previously published daily progress survives a question-selection update');
assert.deepEqual(seededShuffle([1,2,3,4],'test'),seededShuffle([1,2,3,4],'test'));
const deckState=emptyPlayState(),smallPool=bank.slice(0,13),first=takeQuestions(deckState,smallPool,'practice:all',10,'a'),last=takeQuestions(deckState,smallPool,'practice:all',10,'b');
assert.equal(first.length,10);assert.equal(last.length,3);assert.equal(new Set([...first,...last]).size,13,'No repeats before the pool is exhausted');
assert.equal(takeQuestions(deckState,smallPool,'practice:all',10,'c').length,10);
assert.equal(scoreAnswer({correct:false}),0);assert.equal(scoreAnswer({correct:true,elapsed:0}),150);assert.equal(scoreAnswer({correct:true,elapsed:0,hintCost:30}),120);
assert.ok(scoreAnswer({correct:true,elapsed:1000})>scoreAnswer({correct:true,elapsed:20000}));
assert.ok(scoreAnswer({correct:true,combo:3})>scoreAnswer({correct:true,combo:0}));
assert.equal(playStreak(['2026-10-18','2026-10-19'],'2026-10-20'),2);assert.equal(playStreak(['2026-10-18'],'2026-10-20'),0);
assert.equal(restorePlayState({version:1,correct:999,answers:1,mistakes:['bogus'],daily:{'2026-10-20':{ids:['bogus'],completed:true}}},bank).correct,1);

const {document,window}=parseHTML('<!doctype html><html><body><main></main></body></html>');
const container=document.querySelector('main'),values=new Map();
let questionTop=120;const scrollCalls=[];window.innerHeight=780;window.scrollY=0;
window.scrollTo=options=>{scrollCalls.push(options);window.scrollY=options.top;};
window.HTMLElement.prototype.getBoundingClientRect=function(){return {top:questionTop,bottom:questionTop+60,height:60};};
const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
let snapshot={ready:true,user:null},listeners=new Set();
const account={getSnapshot:()=>snapshot,subscribe(fn){listeners.add(fn);fn(snapshot);return()=>listeners.delete(fn);}};
const changeOwner=id=>{snapshot={ready:true,user:id?{id}:null};for(const listener of listeners)listener(snapshot);};
const saved=()=>JSON.parse(values.get(playStorageKey(snapshot.user?.id))||'null');
const click=selector=>{const target=container.querySelector(selector);assert.ok(target,'Missing UI control: '+selector);assert.equal(target.disabled,false,'Control should be enabled: '+selector);target.click();};
const currentQuestion=()=>byId.get(container.querySelector('[data-play-question]')?.dataset.playQuestion);
let instance=mountPlay(container,{storage,accountController:account});
function start(mode){if(!container.querySelector('[data-play-mode]'))click('[data-play-action="home"]');click(`[data-play-mode="${mode}"]`);assert.ok(container.textContent.includes('HOW TO PLAY'));click('[data-play-action="start"]');if(container.querySelector('[data-play-action="ready"]'))click('[data-play-action="ready"]');}
function answer(right=true){
  const question=currentQuestion();assert.ok(question);
  if(question.type==='choice'){click(`[data-play-answer="${right?question.correct:(question.correct+1)%question.answers.length}"]`);assert.ok(!container.querySelector('.play-feedback'),'Selection is reversible until confirmed');click('[data-play-action="check"]');}
  else if(question.type==='order'){for(const id of (right?question.correct:[...question.correct].reverse()))click(`[data-play-order="${id}"]`);click('[data-play-action="check"]');}
  else if(question.type==='match'){
    for(let index=0;index<question.pairs.length;index++){const select=container.querySelector(`[data-play-match="${index}"]`);Object.defineProperty(select,'value',{value:String(right?index:(index+1)%question.pairs.length),writable:true});select.dispatchEvent(new window.Event('change',{bubbles:true}));}
    click('[data-play-action="check"]');
  }else for(let index=0;index<question.pairs.length;index++){click(`[data-play-memory="${index}-0"]`);click(`[data-play-memory="${index}-1"]`);}
  assert.ok(container.querySelector('.play-feedback'),'Every submitted answer includes an explanation');
}
start('practice');answer(false);const mistake=currentQuestion().id;assert.ok(saved().mistakes.includes(mistake));
questionTop=-850;window.scrollY=2200;scrollCalls.length=0;click('[data-play-action="next"]');
assert.notEqual(currentQuestion().id,mistake);assert.equal(scrollCalls.at(-1).top,1334,'Next brings an offscreen new question back into view');assert.equal(scrollCalls.at(-1).behavior,'smooth');
questionTop=120;click('[data-play-action="finish"]');
start('mistakes');assert.equal(currentQuestion().id,mistake);answer();click('[data-play-action="next"]');assert.equal(saved().mistakes.includes(mistake),false);assert.equal(saved().reviewed,1);
for(const mode of ['cars','engines','parts','match','timeline','memory','build-engine','higher-lower','true-false','endless']){
  start(mode);answer();click('[data-play-action="finish"]');assert.ok(container.querySelector('.play-result'),mode+' finishes with a real result');
}
start('survival');for(let i=0;i<3;i++){answer(false);click('[data-play-action="next"]');}assert.ok(container.querySelector('.play-result'),'Three wrong answers end Survival');
const priorXP=saved().xp;start('flashcards');click('[data-play-action="flip"]');click('[data-play-study="yes"]');click('[data-play-action="finish"]');assert.equal(saved().xp,priorXP,'Self-reported study must not award correct-answer XP');assert.equal(saved().studied,1);
start('versus');answer();click('[data-play-action="next"]');assert.ok(container.querySelector('.play-handover'));assert.ok(container.textContent.includes('Player 2, your turn.'));click('[data-play-action="ready"]');answer();click('[data-play-action="finish"]');assert.ok(container.querySelector('.play-versus-result'));
start('sprint');answer();click('[data-play-action="finish"]');assert.ok(container.querySelector('.play-result'));

// Daily is deterministic, resumes at the next unresolved question and rewards
// completion once. Hints are paid even when used before the first scored answer.
start('daily');const firstDaily=currentQuestion(),before=saved().xp;click('[data-play-hint="letter"]');answer();assert.ok(saved().daily[utcDay()].score<=135,'First-question hints really cost points');click('[data-play-action="finish"]');assert.ok(container.querySelector('[data-play-mode="daily"]'));
instance.destroy();instance=mountPlay(container,{storage,accountController:account});start('daily');assert.notEqual(currentQuestion().id,firstDaily.id,'Reload cannot reward the first daily question again');
while(container.querySelector('[data-play-question]')){answer();click('[data-play-action="next"]');}
assert.ok(saved().daily[utcDay()].completed);assert.equal(saved().xp,before+100);const dailyXP=saved().xp,rounds=saved().rounds;
start('daily');assert.ok(container.querySelector('.play-result'));assert.equal(saved().xp,dailyXP);assert.equal(saved().rounds,rounds);
assert.match(shareResult({mode:'daily',results:[{correct:true},{correct:false}],score:200},'2026-10-20'),/\u{1F7E6}\u{1F7E5}/u);
const guestProgress=values.get(playStorageKey(null));changeOwner('driver-a');assert.ok(container.textContent.includes('0 XP'));start('practice');answer();click('[data-play-action="finish"]');assert.ok(saved().xp>0);changeOwner('driver-b');assert.equal(saved(),null);assert.ok(container.textContent.includes('0 XP'));changeOwner(null);assert.deepEqual(JSON.parse(values.get(playStorageKey(null))),JSON.parse(guestProgress),'Switching accounts must preserve the guest progress');
instance.destroy();assert.equal(listeners.size,0,'Unmount releases its account subscription');
console.log(`Play checks passed: ${bank.length} sourced questions, ${PLAY_MODES.length} modes, ${PLAY_BADGES.length} reachable badges; rules, gameplay, daily resume, scoring and account isolation verified.`);

