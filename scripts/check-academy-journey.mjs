import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';

const {window,document}=parseHTML('<html lang="en"><head></head><body><main class="destination-page"><div id="academy"></div></main></body></html>');
const makeStorage=()=>{const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};};
Object.assign(globalThis,{window,document,location:new URL('http://localhost:4173/learn'),localStorage:makeStorage(),sessionStorage:makeStorage(),HTMLElement:window.HTMLElement,Element:window.Element,MutationObserver:window.MutationObserver,CustomEvent:window.CustomEvent});
window.scrollTo=()=>{};window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
const {mountAcademy,academyLessons,academyReferenceData}=await import('../public/academy.js');
const {createCurriculum}=await import('../public/academy-content.js');
const {allModels}=await import('../public/catalog.js');
const {partCatalog}=await import('../public/parts.js');
const {academyLearningInterfaceTranslations}=await import('../public/academy-learning-translations.js');
const {academyTranslationCoverage}=await import('../public/academy-translations.js');
const {setLanguage,t}=await import('../public/preferences.js');
const {account}=await import('../public/account-sync.js');
const {lessons,units}=createCurriculum(academyLessons,academyReferenceData.sources,partCatalog,allModels,academyReferenceData.scenarios);
let root=document.querySelector('#academy');
// linkedom does not remove listeners through AbortSignal. A real remount gets
// a fresh host, while both storage objects retain the browser's saved session.
const replaceHost=()=>{const next=document.createElement('div');root.replaceWith(next);root=next;};
const click=(action,value)=>{const button=root.querySelector('[data-ac="'+action+'"]'+(value===undefined?'':'[data-value="'+value+'"]'));assert.ok(button,`Missing action ${action} ${value??''}`);assert.equal(button.disabled,false,`Disabled action ${action}`);button.click();};
const answerQuestion=question=>{
  if(question.type==='choice')click('answer',question.correct);
  if(question.type==='order')for(const item of question.items)click('order',item.id);
  if(question.type==='match')for(let i=0;i<question.pairs.length;i++){click('match-left',i);click('match-right',i);}
  click('check');assert.ok(root.querySelector('.ac-feedback.is-correct'),'A correct response reveals its explanation');
};
let academy=mountAcademy(root,{storageKey:'journey-fixture'});
assert.equal(root.querySelectorAll('.ac-journey li').length,units[0].lessons.length);
assert.ok(root.querySelector('.ac-next-lesson'));
assert.equal(root.querySelector('.ac-journey li:nth-child(2) button').disabled,true,'Learning path marks the prerequisite clearly');
assert.equal(root.querySelector('.ac-road'),null,'Lesson names are readable cards instead of floating road labels');
click('lesson',units[0].lessons[0]);
const first=lessons.find(lesson=>lesson.id===units[0].lessons[0]);
assert.equal(root.querySelector('.ac-player').dataset.stage,'intro');
assert.ok(root.querySelector('.ac-earned-rewards').textContent.includes('80%'));
assert.ok(root.querySelector('details.ac-objectives-panel summary'));
assert.ok(root.querySelector('.ac-lesson-meta').textContent.includes(first.questions.length+' questions'));
click('start-questions');
const question=first.questions[0];assert.equal(question.type,'choice');
assert.equal(root.querySelector('[data-ac="check"]').disabled,true);
click('answer',(question.correct+1)%question.answers.length);click('check');
assert.ok(root.querySelector('.ac-feedback.is-incorrect'));
assert.equal(root.querySelector('[data-ac="question-next"]'),null,'A wrong answer cannot skip the question');
assert.equal(root.querySelector('.ac-first-attempt').textContent,'First answers: 0 / 1');
answerQuestion(question);
assert.equal(root.querySelector('.ac-first-attempt').textContent,'First answers: 0 / 1','Retries preserve the first-answer score');
for(let i=1;i<first.questions.length;i++){click('question-next');answerQuestion(first.questions[i]);}
click('finish');
assert.ok(root.querySelector('.ac-results'));
assert.ok(root.querySelector('.ac-result-review').textContent.includes(question.explanation),'Results let the learner revisit the actual missed concept');
assert.equal(root.querySelector('.ac-result-actions .ac-primary').dataset.value,units[0].lessons[1],'Completion recommends the next unfinished lesson');
click('exit');
assert.equal(root.querySelector('.ac-journey li:nth-child(2) button').disabled,false,'Completing a lesson unlocks the next card');
const orderLesson=lessons.find(lesson=>lesson.questions[0]?.type==='order');
academy.openLesson(orderLesson.id);click('start-questions');
const sequence=orderLesson.questions[0];click('order',sequence.items[0].id);click('order',sequence.items[1].id);click('order-undo');
assert.equal(root.querySelectorAll('.ac-order-slots .is-filled').length,1);
academy.destroy();replaceHost();academy=mountAcademy(root,{storageKey:'journey-fixture'});
assert.ok(root.querySelector('.ac-resume-card'),'Leaving a lesson offers a recoverable draft');click('resume');
assert.equal(root.querySelectorAll('.ac-order-slots .is-filled').length,1,'The selected sequence survives a remount');
click('order-remove',0);answerQuestion(sequence);
const matchLesson=lessons.find(lesson=>lesson.questions[0]?.type==='match');
academy.openLesson(matchLesson.id);click('start-questions');
const match=matchLesson.questions[0];click('match-left',0);click('match-right',1);click('match-left',1);click('match-right',1);
assert.equal(root.querySelectorAll('[data-ac="match-left"].is-matched').length,1,'Moving a role removes its previous pairing');
click('clear-answer');answerQuestion(match);
for(const language of ['ka','ru','en']){
  setLanguage(language,false);assert.equal(root.querySelector('[data-ac="question-next"]')?.textContent.trim().replace(/\s*→$/,''),t('Continue'));
}
assert.deepEqual(academyTranslationCoverage(academyLearningInterfaceTranslations.map(([english])=>english)).missing,[],'Every new learning interface string has Georgian and Russian copy');
academy.destroy();replaceHost();academy=mountAcademy(root,{initialTab:'models',storageKey:'tab-fixture'});
assert.ok(root.querySelector('.ac-challenge-grid'),'An explicit initial tab opens its requested Academy section');
academy.destroy();account.destroy();
console.log('PASS Academy journey: progress cards, prerequisite unlocks, first-answer scoring, explanations, sequence recovery, matching corrections, language switching and initial tabs.');
