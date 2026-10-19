import {allModels} from './catalog.js';
import {account} from './account-sync.js';
import {focusLearningTarget,revealLearningFeedback} from './learning-navigation.js';
import {createQuestionBank,PLAY_MODES,PLAY_BADGES,utcDay,seededShuffle,poolForMode,dailyQuestionIds,unlockedBadges,badgeValue,arcadeLevel,answerCorrect,scoreAnswer,shareResult} from './play-data.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const number=value=>Number.isFinite(value)&&value>=0?Math.floor(value):0;
const dayPattern=/^\d{4}-\d{2}-\d{2}$/;
const numericFields=['xp','answers','correct','rounds','bestCombo','perfect','studied','reviewed'];
export const playStorageKey=userId=>'apex-play-v1:'+(userId===null||userId===undefined?'guest':'account:'+encodeURIComponent(String(userId)));
export function emptyPlayState(){return {version:1,xp:0,answers:0,correct:0,rounds:0,bestCombo:0,perfect:0,studied:0,reviewed:0,days:[],mistakes:[],daily:{},modes:{},scores:[],decks:{}};}
export function restorePlayState(value,bank){
  const state=emptyPlayState();if(!value||value.version!==1)return state;
  const ids=new Set(bank.map(question=>question.id));
  for(const field of numericFields)state[field]=number(value[field]);
  state.correct=Math.min(state.correct,state.answers);
  state.days=[...new Set((Array.isArray(value.days)?value.days:[]).filter(day=>typeof day==='string'&&dayPattern.test(day)&&Number.isFinite(Date.parse(day+'T00:00:00Z'))))].sort();
  state.mistakes=[...new Set((Array.isArray(value.mistakes)?value.mistakes:[]).filter(id=>ids.has(id)))];
  for(const mode of PLAY_MODES)state.modes[mode.id]=number(value.modes?.[mode.id]);
  state.scores=(Array.isArray(value.scores)?value.scores:[]).filter(score=>score&&PLAY_MODES.some(mode=>mode.id===score.mode)&&Number.isFinite(score.points)&&score.points>=0&&typeof score.day==='string'&&dayPattern.test(score.day)).slice(-50).map(score=>({mode:score.mode,points:number(score.points),right:number(score.right),total:number(score.total),day:score.day}));
  if(value.decks&&typeof value.decks==='object')for(const [key,deck] of Object.entries(value.decks)){if(/^[a-z-]+:(all|[1-4])$/.test(key)&&Array.isArray(deck))state.decks[key]=[...new Set(deck.filter(id=>ids.has(id)))];}
  if(value.daily&&typeof value.daily==='object')for(const [day,daily] of Object.entries(value.daily)){
    if(!dayPattern.test(day)||!daily||!Array.isArray(daily.ids))continue;
    const expected=dailyQuestionIds(bank,day);if(expected.length!==daily.ids.length||!expected.every((id,index)=>id===daily.ids[index]))continue;
    const results=Array.isArray(daily.results)?daily.results:[];
    if(results.length>expected.length||!results.every((result,index)=>result&&result.id===expected[index]&&typeof result.correct==='boolean'&&typeof result.skipped==='boolean'&&Number.isFinite(result.points)&&result.points>=0))continue;
    if(daily.completed&&results.length!==expected.length)continue;
    const totalPoints=results.reduce((total,result)=>total+number(result.points),0);
    const pending=daily.pending&&daily.pending.id===expected[results.length]?{id:daily.pending.id,hintDebt:Math.min(100,number(daily.pending.hintDebt)),usedHints:(Array.isArray(daily.pending.usedHints)?daily.pending.usedHints:[]).filter(hint=>['fifty','letter'].includes(hint)),questionAt:Number.isFinite(daily.pending.questionAt)?daily.pending.questionAt:Date.now()}:null;
    state.daily[day]={ids:expected,results:results.map(result=>({id:result.id,correct:result.correct,skipped:result.skipped,points:number(result.points)})),score:Math.min(totalPoints,number(daily.score)),completed:!!daily.completed,combo:number(daily.combo),startedAt:Number.isFinite(daily.startedAt)?daily.startedAt:Date.now(),pending};
  }
  return state;
}
export function takeQuestions(state,pool,key,count,seed=String(Math.random())){
  const available=new Set(pool.map(question=>question.id));if(!available.size)return [];
  let deck=(state.decks[key]||[]).filter(id=>available.has(id));
  if(!deck.length)deck=seededShuffle([...available],seed);
  // A short final round finishes the current pool before a fresh shuffle.
  const selected=deck.splice(0,Math.min(count,deck.length));state.decks[key]=deck;return selected;
}
export function playStreak(days,day=utcDay()){
  const sorted=[...new Set(days)].filter(value=>value<=day).sort();
  if(!sorted.length||(Date.parse(day)-Date.parse(sorted.at(-1)))/86400000>1)return 0;
  let streak=1;for(let i=sorted.length-1;i>0;i--){if(Date.parse(sorted[i])-Date.parse(sorted[i-1])!==86400000)break;streak++;}return streak;
}
const answerText=question=>question.type==='order'?question.items.map(item=>item.text).join(' → '):question.pairs?question.pairs.map(pair=>pair.join(' → ')).join(' · '):question.answers[question.correct];
function addDay(state,day){if(!state.days.includes(day)){state.days.push(day);state.days.sort();}}

export function mountPlay(container,{catalog=allModels,storage:providedStorage,accountController=account}={}){
  if(typeof container==='string')container=document.querySelector(container);
  if(!container)throw new Error('A Play container is required.');
  const doc=container.ownerDocument,win=doc.defaultView||globalThis.window,bank=createQuestionBank(catalog),byId=new Map(bank.map(question=>[question.id,question]));
  let storage;try{storage=providedStorage??globalThis.localStorage;}catch{storage=null;}
  const requestedMode=new URLSearchParams(win.location?.search||globalThis.location?.search||'').get('mode');
  let snapshot=accountController.getSnapshot(),owner=playStorageKey(snapshot.user?.id),state,screen=PLAY_MODES.some(mode=>mode.id===requestedMode)?'rules':'home',selectedMode=PLAY_MODES.some(mode=>mode.id===requestedMode)?requestedMode:'practice',difficulty='all',round=null,notice='',storageOK=!!storage,disposed=false,timer=null,memoryTimer=null;
  const controller=new win.AbortController(),signal=controller.signal;
  function read(){try{state=restorePlayState(JSON.parse(storage?.getItem(owner)||'null'),bank);}catch{state=emptyPlayState();storageOK=false;}}
  function save(){try{if(!storage)throw new Error();storage.setItem(owner,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}win.dispatchEvent(new win.CustomEvent('apex:playprogress',{detail:{xp:state.xp,level:arcadeLevel(state.xp),owner}}));}
  function stopClock(){if(timer!==null){win.clearInterval(timer);timer=null;}if(memoryTimer!==null){win.clearTimeout(memoryTimer);memoryTimer=null;}}
  function focusHeading(){focusLearningTarget(container.querySelector('[data-play-focus]'));}
  function render(){
    if(disposed)return;
    const savedScroll=win.scrollY||0;
    const level=arcadeLevel(state.xp);
    container.innerHTML=`<div class="play-shell"><div class="play-topline"><a href="/learn">← BMW Academy</a><span>LOCAL ARCADE · ${esc(snapshot.user?'YOUR ACCOUNT ON THIS DEVICE':'GUEST ON THIS DEVICE')}</span></div><div class="play-identity"><div><span class="play-eyebrow">APEX / THE LEARNING ARCADE</span><h1>Small games.<br><em>Big BMW energy.</em></h1><p>Learn one thing. Try another. Find your next favourite BMW.</p></div><div class="play-level"><span>LEVEL ${level.level} · ${esc(level.name)}</span><strong>${state.xp.toLocaleString('en')} <small>XP</small></strong><progress value="${level.percent}" max="100" aria-label="Progress to next Arcade level">${level.percent}%</progress><small>${level.next-state.xp} XP to the next level</small></div></div>${!storageOK?'<p class="play-notice" role="status">Browser storage is unavailable. You can play, but progress may disappear when this page closes.</p>':''}${notice?`<p class="play-notice" role="status">${esc(notice)}</p>`:''}<div class="play-stage">${screen==='home'?home():screen==='rules'?rules():screen==='results'?results():screen==='badges'?badges():screen==='handover'?handover():questionView()}</div></div>`;
    win.scrollTo?.({top:savedScroll,behavior:'instant'});
    container.querySelectorAll('img').forEach(image=>image.addEventListener('error',()=>{const fallback=doc.createElement('p');fallback.className='play-photo-unavailable';fallback.textContent='The photo could not load. Use Skip to move on without a wrong answer.';image.replaceWith(fallback);if(round)round.photoUnavailable=true;},{once:true}));
  }
  function home(){
    const unlocked=unlockedBadges(state),daily=state.daily[utcDay()];
    return `<div class="play-stats"><span><strong>${bank.length}</strong> sourced questions</span><span><strong>${playStreak(state.days)}</strong> day streak</span><span><strong>${state.correct}</strong> correct answers</span><button data-play-action="badges"><strong>${unlocked.length}/${PLAY_BADGES.length}</strong> badges ↗</button></div><aside class="play-community-credit"><div><span class="play-eyebrow">PLAY. LEARN. SHARE YOUR BMW.</span><h2>A challenge with a purpose.</h2><p>Earn community credits with verified questions and unlock an owner-car submission. Arcade XP stays your personal score.</p></div><a class="play-link" href="/community#earn-credits">Earn community credits ↗</a></aside><div class="play-section-title"><div><span class="play-eyebrow">YOUR NEXT TEN MINUTES</span><h2 data-play-focus tabindex="-1">Choose your kind of fun.</h2></div><p>New here? Practice is a comfortable first lap.</p></div><div class="play-mode-grid">${PLAY_MODES.map(mode=>`<button class="play-mode ${mode.id==='practice'?'play-mode-featured':''}" data-play-mode="${mode.id}"><span class="play-mode-icon" aria-hidden="true">${mode.icon}</span><span class="play-eyebrow">${mode.tag}</span><strong>${esc(mode.name)}</strong><span>${esc(mode.description)}</span><small>${mode.id==='daily'?(daily?.completed?'✓ Completed today':daily?'↺ Continue today':utcDay()+' · UTC'):mode.id==='mistakes'?state.mistakes.length+' questions to revisit':'How to play →'}</small></button>`).join('')}</div><div class="play-lower"><section><span class="play-eyebrow">PERSONAL BESTS · THIS DEVICE</span><h2>Your recent laps</h2>${state.scores.length?`<ol class="play-scores">${[...state.scores].sort((a,b)=>b.points-a.points).slice(0,5).map(score=>`<li><span>${esc(PLAY_MODES.find(mode=>mode.id===score.mode)?.name)}<small>${esc(score.day)} · ${score.right}/${score.total}</small></span><strong>${score.points.toLocaleString('en')} pts</strong></li>`).join('')}</ol>`:'<p>Your first finished round will appear here. A little curiosity is all you need.</p>'}</section><section><span class="play-eyebrow">A GOOD PLACE TO GET CURIOUS</span><h2>Every answer goes somewhere.</h2><p>Questions link to the exact BMW application or lesson. Read an explanation after every answer, then follow the subject into the Academy.</p><a class="play-link" href="/learn?lesson=first-engine">Start with how an engine works ↗</a><p class="play-fine">Arcade progress is separate from Academy rewards. It stays in this browser and switches with your signed-in account. Local scores are personal, and do not sync to the server.</p></section></div>`;
  }
  function rules(){
    const mode=PLAY_MODES.find(mode=>mode.id===selectedMode),daily=state.daily[utcDay()],pool=poolForMode(bank,selectedMode,difficulty,state.mistakes),fixed=['daily','mistakes','memory','match','timeline','build-engine','cars','parts','higher-lower','true-false'].includes(selectedMode),locked=selectedMode==='daily'&&daily?.completed;
    return `<section class="play-rules"><button class="play-text-button" data-play-action="home">← All games</button><span class="play-mode-icon">${mode.icon}</span><span class="play-eyebrow">HOW TO PLAY</span><h2 data-play-focus tabindex="-1">${esc(mode.name)}</h2><p class="play-lead">${esc(mode.rules)}</p>${mode.id==='daily'?`<p class="play-fine">Daily challenge streak: <strong>${playStreak(Object.keys(state.daily).filter(day=>state.daily[day].completed))} days</strong> &middot; resets at 00:00 UTC.</p>`:''}<div class="play-rules-grid"><div><strong>Make it a learning loop.</strong><p>Answer → read why → explore more. A wrong answer is a useful place to start.</p></div><div><strong>${selectedMode==='flashcards'?'Study, at your pace.':'How points work'}</strong><p>${selectedMode==='flashcards'?'Flip before marking each card. No score, XP or correct-answer badges are awarded for self-assessment.':'Correct = 100 base points + up to 50 for speed. Every three correct answers increase your multiplier by 0.2, up to 2×. XP is 10 per correct answer.'}</p></div><div><strong>Hints ${['practice','mistakes','flashcards'].includes(selectedMode)?'are free here':'have a price'}</strong><p>${['practice','mistakes','flashcards'].includes(selectedMode)?'Use 50/50, the first letter or skip freely. A skipped card receives no points.':'50/50 costs 30 points, a first letter costs 15, and skip costs 25. Costs reduce the current round score, which cannot go below zero.'} Hints are used once per question.</p></div></div>${!fixed?`<label class="play-difficulty">Question difficulty <select data-play-difficulty><option value="all" ${difficulty==='all'?'selected':''}>Mixed · all levels</option>${[['1','Easy · first steps'],['2','Medium · connections'],['3','Hard · look closer'],['4','Expert · exact factory specs']].map(([value,label])=>`<option value="${value}" ${difficulty===value?'selected':''}>${label}</option>`).join('')}</select></label>`:''}<p class="play-fine">${pool.length} questions in this pool. Questions shuffle without repeating until the pool is used. ${selectedMode==='daily'?'Daily difficulty and question order are fixed for everyone.':''}</p>${locked?'<p class="play-notice">You completed today’s challenge. Your next Daily starts at 00:00 UTC.</p>':!pool.length?'<p class="play-notice">There are no questions here yet. Try Practice or finish another round to find something to review.</p>':''}<div class="play-actions"><button class="play-primary" data-play-action="start" ${!pool.length||!snapshot.ready?'disabled':''}>${locked?'View today’s result':selectedMode==='daily'&&daily?'Continue challenge':'Let’s play →'}</button><a href="/learn">Study first ↗</a></div>${!snapshot.ready?'<p role="status">Opening the progress for your current account…</p>':''}</section>`;
  }
  function begin(){
    const mode=PLAY_MODES.find(mode=>mode.id===selectedMode),day=utcDay(),daily=state.daily[day];
    notice='';stopClock();
    if(selectedMode==='daily'&&daily){
      round={mode:selectedMode,day,ids:[...daily.ids],results:daily.results.map(result=>({...result})),score:daily.score,combo:daily.combo,startedAt:daily.startedAt,index:daily.results.length,playerScores:[0,0],lives:3,finished:daily.completed};
      if(daily.completed){screen='results';render();focusHeading();return;}
    }else{
      const pool=poolForMode(bank,selectedMode,difficulty,state.mistakes),ids=selectedMode==='daily'?dailyQuestionIds(bank,day):takeQuestions(state,pool,selectedMode+':'+difficulty,mode.count);
      if(!ids.length){notice='That pool is empty. Choose another game or difficulty.';render();return;}
      round={mode:selectedMode,day,ids,index:0,results:[],score:0,combo:0,startedAt:Date.now(),playerScores:[0,0],lives:3,finished:false};
      persistDaily();save();
    }
    resetQuestion();
    if(selectedMode==='daily'&&daily?.pending&&daily.pending.id===round.ids[round.index]){
      round.hintDebt=daily.pending.hintDebt;round.usedHints=[...daily.pending.usedHints];round.questionAt=daily.pending.questionAt;
      const question=byId.get(round.ids[round.index]);
      if(round.usedHints.includes('fifty'))round.hidden=seededShuffle(question.answers.map((_,index)=>index).filter(index=>index!==question.correct),question.id+':hint').slice(0,Math.max(1,question.answers.length-2));
      if(round.usedHints.includes('letter'))round.hintText='The answer starts with “'+String(question.answers[question.correct]).trim()[0]+'”.';
    }
    if(round.index>=round.ids.length){finish();return;}
    screen=selectedMode==='versus'?'handover':'question';
    if(selectedMode==='sprint'){round.endsAt=Date.now()+60000;timer=win.setInterval(()=>{const remaining=Math.max(0,Math.ceil((round.endsAt-Date.now())/1000)),clock=container.querySelector('[data-play-clock]');if(clock)clock.textContent=remaining+'s';if(!remaining)finish();},250);}
    render();focusHeading();
  }
  function resetQuestion(){round.questionAt=Date.now();round.answer=null;round.order=[];round.matches={};round.hidden=[];round.usedHints=[];round.hintDebt=0;round.hintText='';round.feedback=null;round.flipped=false;round.photoUnavailable=false;round.memoryOpen=[];round.memoryMatched=[];round.memoryFlips=0;round.memoryBusy=false;}
  function persistDaily(){if(round?.mode==='daily')state.daily[round.day]={ids:[...round.ids],results:round.results.map(result=>({...result})),score:round.score,combo:round.combo,startedAt:round.startedAt,completed:round.finished,pending:round.feedback?null:{id:round.ids[round.index],hintDebt:round.hintDebt||0,usedHints:[...(round.usedHints||[])],questionAt:round.questionAt||Date.now()}};}
  function handover(){const player=round.index%2+1;return `<section class="play-handover"><span class="play-eyebrow">PASS THE DEVICE</span><h2 data-play-focus tabindex="-1">Player ${player}, your turn.</h2><p>Player 1: ${round.playerScores[0]} pts · Player 2: ${round.playerScores[1]} pts</p><p>Take a breath. Your next question is ready.</p><button class="play-primary" data-play-action="ready">I’m Player ${player} · ready →</button><button class="play-text-button" data-play-action="finish">Finish & save</button></section>`;}
  function questionView(){
    if(!round)return '';
    const question=byId.get(round.ids[round.index]);if(!question)return '';
    const flash=round.mode==='flashcards',answered=!!round.feedback,mode=PLAY_MODES.find(mode=>mode.id===round.mode),left=round.ids.length-round.index,photo=question.photo;
    return `<section class="play-question" data-play-question="${esc(question.id)}"><div class="play-question-bar"><button class="play-text-button" data-play-action="finish">${round.mode==='daily'?'Save & leave':'Finish & save'}</button><span>${esc(mode.name)} · ${round.index+1}/${round.ids.length}${round.mode==='versus'?' · Player '+(round.index%2+1):''}</span><strong>${round.mode==='sprint'?`<span data-play-clock aria-label="Seconds remaining">${Math.max(0,Math.ceil((round.endsAt-Date.now())/1000))}s</span>`:round.mode==='survival'?'♡'.repeat(round.lives)+' · ':''}${round.score} pts</strong></div><progress class="play-round-progress" max="${round.ids.length}" value="${round.index}" aria-label="Round progress">${round.index}/${round.ids.length}</progress><div class="play-question-body"><span class="play-eyebrow">${esc(question.topic||'BMW KNOWLEDGE')}${round.combo>1?' · '+round.combo+' IN A ROW':''}</span><h2 data-play-focus tabindex="-1">${esc(question.prompt)}</h2>${photo?`<figure class="play-question-photo"><img src="${esc(photo.src)}" alt="${answered||round.flipped?esc(photo.caption):'Component or BMW identification photograph'}" decoding="async" draggable="false">${answered||round.flipped?`<figcaption>${esc(photo.caption)} · Photo: <a href="${esc(photo.page)}" target="_blank" rel="noopener noreferrer">${esc(photo.author||'Source')} · ${esc(photo.license||'See source')}</a></figcaption>`:`<figcaption>Photo: <a href="${esc(photo.page)}" target="_blank" rel="noopener noreferrer">${esc(photo.author||'Source')} &middot; ${esc(photo.license||'See source')}</a>. Photo identity appears with the explanation.</figcaption>`}</figure>`:''}${flash?flashcard(question):question.type==='order'?orderView(question):question.type==='match'?matchView(question):question.type==='memory'?memoryView(question):choiceView(question)}${round.hintText?`<p class="play-hint-text" role="status">${esc(round.hintText)}</p>`:''}${!answered&&!flash&&question.type!=='memory'?hints(question):''}${answered?feedback(question):''}</div></section>`;
  }
  function choiceView(question){return `<div class="play-answer-grid">${question.answers.map((answer,index)=>`<button data-play-answer="${index}" ${round.feedback||round.hidden.includes(index)?'disabled':''} class="play-answer ${round.hidden.includes(index)?'play-hidden-choice':''} ${round.feedback&&index===question.correct?'play-correct':round.feedback&&index===round.answer?'play-wrong':''}"><span>${String.fromCharCode(65+index)}</span>${esc(answer)}${round.feedback&&index===question.correct?'<strong aria-label="Correct answer">✓</strong>':''}</button>`).join('')}</div>`;}
  function flashcard(question){return `<div class="play-flashcard">${round.flipped?`<span class="play-eyebrow">THE CONNECTION</span><strong>${esc(answerText(question))}</strong><p>${esc(question.explanation)}</p><a href="${esc(question.learnURL)}">Learn more ↗</a><div class="play-actions"><button class="play-primary" data-play-study="yes">Knew it</button><button class="play-secondary" data-play-study="no">Study again</button></div>`:'<p>Think of the answer before you turn the card over.</p><button class="play-primary" data-play-action="flip">Flip card ↻</button>'}</div>`;}
  function orderView(question){
    const options=seededShuffle(question.items,question.id+':display'),answered=!!round.feedback;
    return `<p class="play-fine">Tap the items in order. You can remove a choice and try again before checking.</p><ol class="play-order-slots">${round.order.map((id,index)=>`<li><button data-play-remove="${index}" ${answered?'disabled':''}><span>${index+1}</span>${esc(question.items.find(item=>item.id===id)?.text)} <small>× Remove</small></button></li>`).join('')}${Array.from({length:question.items.length-round.order.length},(_,index)=>`<li class="play-order-empty">${round.order.length+index+1}. Choose the next step</li>`).join('')}</ol><div class="play-order-options">${options.map(item=>`<button class="play-secondary" data-play-order="${item.id}" ${answered||round.order.includes(item.id)?'disabled':''}>${esc(item.text)}</button>`).join('')}</div><div class="play-actions"><button class="play-primary" data-play-action="check" ${answered||round.order.length!==question.items.length?'disabled':''}>Check sequence</button><button class="play-text-button" data-play-action="undo" ${answered||!round.order.length?'disabled':''}>Undo last</button></div>`;
  }
  function matchView(question){
    const options=seededShuffle(question.pairs.map((pair,index)=>({text:pair[1],index})),question.id);
    return `<div class="play-matches">${question.pairs.map((pair,index)=>`<label><strong>${esc(pair[0])}</strong><select data-play-match="${index}" ${round.feedback?'disabled':''} aria-label="Job for ${esc(pair[0])}"><option value="">Choose its job</option>${options.map(option=>`<option value="${option.index}" ${String(round.matches[index])===String(option.index)?'selected':''}>${esc(option.text)}</option>`).join('')}</select></label>`).join('')}</div><button class="play-primary" data-play-action="check" ${round.feedback||Object.keys(round.matches).length!==question.pairs.length?'disabled':''}>Check connections</button>`;
  }
  function memoryView(question){
    const tiles=seededShuffle(question.pairs.flatMap((pair,index)=>pair.map((text,side)=>({id:index+'-'+side,index,text,side}))),question.id);
    return `<p class="play-fine">${round.memoryFlips} flips · ${round.memoryMatched.length}/${question.pairs.length} pairs found</p><div class="play-memory-grid">${tiles.map((tile,index)=>{const visible=round.memoryOpen.includes(tile.id)||round.memoryMatched.includes(tile.index);return `<button data-play-memory="${tile.id}" class="play-memory-tile ${visible?'play-memory-revealed':''}" ${round.feedback||visible||round.memoryBusy?'disabled':''} aria-label="${visible?esc(tile.text):'Turn over card '+(index+1)}">${visible?esc(tile.text):'<span aria-hidden="true">'+String(index+1).padStart(2,'0')+'</span><small>Turn over</small>'}</button>`;}).join('')}</div>`;
  }
  function hints(question){const free=['practice','mistakes'].includes(round.mode),choice=question.type==='choice';return `<div class="play-hints"><span>Need a nudge?</span>${choice&&question.answers.length>2?`<button data-play-hint="fifty" ${round.usedHints.includes('fifty')?'disabled':''}>50/50 ${free?'· free':'−30'}</button>`:''}${choice?`<button data-play-hint="letter" ${round.usedHints.includes('letter')?'disabled':''}>First letter ${free?'· free':'−15'}</button>`:''}<button data-play-hint="skip">Skip ${free?'· free':'−25'}</button></div>`;}
  function feedback(question){return `<section class="play-feedback ${round.feedback.correct?'is-correct':'is-review'}" role="status"><span class="play-eyebrow">${round.feedback.skipped?'SAVED FOR ANOTHER LOOK':round.feedback.correct?'THAT CONNECTION CLICKED':'A GOOD THING TO LEARN'}</span><h3>${round.feedback.skipped?'Let’s look at the answer.':round.feedback.correct?'You’ve got it.':'Here’s the connection.'}</h3>${!round.feedback.correct?`<strong>${esc(answerText(question))}</strong>`:''}<p>${esc(question.explanation)}</p><div class="play-feedback-links"><a href="${esc(question.learnURL||'/learn')}">Learn more ↗</a>${question.sources?.[0]?`<a href="${esc(question.sources[0].url)}" target="_blank" rel="noopener noreferrer">Read the source ↗</a>`:''}</div><button class="play-primary" data-play-action="next">${round.index===round.ids.length-1?'See my result':round.mode==='versus'?'Pass to the next player':'Next connection →'}</button></section>`;}
  function applyAnswer(answer,{skipped=false,photoSkip=false}={}){
    if(!round||round.feedback||round.finished||owner!==playStorageKey(accountController.getSnapshot().user?.id))return;
    if(round.mode==='sprint'&&Date.now()>=round.endsAt){finish();return;}
    const question=byId.get(round.ids[round.index]),correct=!skipped&&answerCorrect(question,answer),elapsed=Date.now()-round.questionAt;
    const points=scoreAnswer({correct,elapsed,combo:round.combo,hintCost:round.hintDebt});
    round.answer=answer;round.feedback={correct,skipped};round.combo=correct?round.combo+1:0;round.score+=points;
    if(round.mode==='versus')round.playerScores[round.index%2]+=points;
    if(round.mode==='survival'&&!correct&&!photoSkip)round.lives--;
    const result={id:question.id,correct,skipped,points};round.results.push(result);
    if(!photoSkip){state.answers++;if(correct){state.correct++;state.xp+=10;if(state.mistakes.includes(question.id)){state.mistakes=state.mistakes.filter(id=>id!==question.id);state.reviewed++;}}else if(!state.mistakes.includes(question.id))state.mistakes.push(question.id);}
    state.bestCombo=Math.max(state.bestCombo,round.combo);addDay(state,utcDay());persistDaily();save();render();revealLearningFeedback(container.querySelector('.play-feedback'));
  }
  function next(){
    if(!round?.feedback)return;
    if(round.lives<=0){finish();return;}
    if(round.index>=round.ids.length-1){
      if(['sprint','survival','endless'].includes(round.mode)){
        const extra=takeQuestions(state,poolForMode(bank,round.mode,difficulty,state.mistakes),round.mode+':'+difficulty,500);
        if(extra.length){round.ids.push(...extra);save();}else{finish();return;}
      }else{finish();return;}
    }
    round.index++;resetQuestion();screen=round.mode==='versus'?'handover':'question';render();focusHeading();
  }
  function finish(){
    if(!round)return;
    stopClock();
    if(round.mode==='daily'&&round.results.length<round.ids.length){persistDaily();save();round=null;screen='home';notice='Your Daily is saved. Continue it any time today.';render();focusHeading();return;}
    if(!round.finished&&round.results.length){
      round.finished=true;state.rounds++;state.modes[round.mode]=(state.modes[round.mode]||0)+1;
      const right=round.results.filter(result=>result.correct).length;
      if(right===round.results.length&&round.results.length>=3&&round.mode!=='flashcards')state.perfect++;
      addDay(state,utcDay());
      if(round.mode!=='flashcards')state.scores.push({mode:round.mode,points:round.score,right,total:round.results.length,day:round.day});
      state.scores=state.scores.slice(-50);persistDaily();save();
    }
    screen='results';render();focusHeading();
  }
  function results(){
    if(!round)return '';
    const right=round.results.filter(result=>result.correct).length,mode=PLAY_MODES.find(mode=>mode.id===round.mode),study=round.mode==='flashcards';
    return `<section class="play-result"><span class="play-eyebrow">${esc(mode.name)} · ${esc(round.day)}</span><h2 data-play-focus tabindex="-1">${study?'A few more connections.':right===round.results.length&&right?'A clean lap.':right?'Curiosity looks good on you.':'Every expert started here.'}</h2><div class="play-result-number">${study?round.results.length:round.score.toLocaleString('en')}<small>${study?'cards explored':'points earned'}</small></div><p>${study?'Self-assessment helps you choose what to revisit.':`${right} correct out of ${round.results.length} answered · ${right*10} XP from these answers`}</p>${round.mode==='versus'?`<p class="play-versus-result">Player 1: ${round.playerScores[0]} · Player 2: ${round.playerScores[1]}<br><strong>${round.playerScores[0]===round.playerScores[1]?'A shared victory.':`Player ${round.playerScores[0]>round.playerScores[1]?1:2} takes this round.`}</strong></p>`:''}<div class="play-emoji-result" aria-label="${right} correct and ${round.results.length-right} to review">${round.results.map(result=>result.skipped?'⬜':result.correct?'🟦':'🟥').join('')}</div><div class="play-actions"><button class="play-primary" data-play-action="home">Choose another game →</button><button class="play-secondary" data-play-action="share">Copy result</button><button class="play-text-button" data-play-action="review">Retry my mistakes (${state.mistakes.length})</button></div><details class="play-result-review"><summary>Review the answers</summary>${round.results.map(result=>{const question=byId.get(result.id);return `<article><strong>${result.correct?'✓':'↺'} ${esc(question.prompt)}</strong><p>${esc(answerText(question))}</p><p>${esc(question.explanation)}</p><a href="/questions/${encodeURIComponent(question.id)}">Keep this question</a> &middot; <a href="${esc(question.learnURL||'/learn')}">Learn more ↗</a></article>`;}).join('')}</details><p class="play-fine">${unlockedBadges(state).length} badges unlocked · Progress saved ${snapshot.user?'for your account on this device':'for this guest on this device'}.</p></section>`;
  }
  function badges(){const unlocked=new Set(unlockedBadges(state).map(badge=>badge.id));return `<section><button class="play-text-button" data-play-action="home">← All games</button><span class="play-eyebrow">LITTLE MILESTONES. REAL PROGRESS.</span><h2 data-play-focus tabindex="-1">Your badge garage.</h2><p>${unlocked.size} of ${PLAY_BADGES.length} unlocked. Every badge has a reachable goal.</p><div class="play-badge-grid">${PLAY_BADGES.map(badge=>`<article class="play-badge ${unlocked.has(badge.id)?'is-unlocked':''}"><span aria-hidden="true">${unlocked.has(badge.id)?'◆':'◇'}</span><h3><a href="/badges/${esc(badge.id)}">${esc(badge.name)}</a></h3><p>${esc(badge.description)}</p><progress max="${badge.target}" value="${Math.min(badge.target,badgeValue(state,badge.metric))}" aria-label="${esc(badge.name)} progress"></progress><small>${unlocked.has(badge.id)?'✓ Unlocked':Math.min(badge.target,badgeValue(state,badge.metric))+' / '+badge.target}</small></article>`).join('')}</div></section>`;}
  function hint(type){
    if(!round||round.feedback||round.usedHints.includes(type))return;
    const question=byId.get(round.ids[round.index]),free=['practice','mistakes'].includes(round.mode)||round.photoUnavailable;
    const cost=free?0:({fifty:30,letter:15,skip:25}[type]||0);
    if(type!=='skip'&&question.type!=='choice')return;
    round.usedHints.push(type);
    const balance=round.mode==='versus'?round.playerScores[round.index%2]:round.score,paid=Math.min(balance,cost);
    round.score=Math.max(0,round.score-paid);round.hintDebt+=cost-paid;
    if(round.mode==='versus')round.playerScores[round.index%2]-=paid;
    if(type==='skip'){applyAnswer(null,{skipped:true,photoSkip:round.photoUnavailable});return;}
    if(type==='fifty')round.hidden=seededShuffle(question.answers.map((_,index)=>index).filter(index=>index!==question.correct),question.id+':hint').slice(0,Math.max(1,question.answers.length-2));
    else round.hintText='The answer starts with “'+String(question.answers[question.correct]).trim()[0]+'”.';
    persistDaily();save();render();
  }
  function study(knew){
    if(!round?.flipped||round.feedback||round.finished)return;
    const question=byId.get(round.ids[round.index]);state.studied++;addDay(state,utcDay());
    if(!knew&&!state.mistakes.includes(question.id))state.mistakes.push(question.id);
    round.results.push({id:question.id,correct:knew,skipped:false,points:0});round.feedback={correct:knew,skipped:false};save();next();
  }
  function turnMemory(id){
    if(!round||round.feedback||round.memoryBusy||round.memoryOpen.includes(id))return;
    const question=byId.get(round.ids[round.index]);if(question.type!=='memory'||!/^\d+-[01]$/.test(id))return;
    const index=Number(id.split('-')[0]);if(index>=question.pairs.length||round.memoryMatched.includes(index))return;
    round.memoryOpen.push(id);round.memoryFlips++;
    if(round.memoryOpen.length===2){
      const [first,second]=round.memoryOpen;
      if(first.split('-')[0]===second.split('-')[0]){
        round.memoryMatched.push(index);round.memoryOpen=[];
        if(round.memoryMatched.length===question.pairs.length){round.hintDebt+=Math.max(0,round.memoryFlips-question.pairs.length*2)*5;applyAnswer(Object.fromEntries(question.pairs.map((_,index)=>[index,index])));return;}
      }else{round.memoryBusy=true;memoryTimer=win.setTimeout(()=>{memoryTimer=null;if(!round||disposed)return;round.memoryOpen=[];round.memoryBusy=false;render();},1100);}
    }
    render();
  }
  const onClick=event=>{
    if(disposed)return;
    const modeButton=event.target.closest('[data-play-mode]');if(modeButton){selectedMode=modeButton.dataset.playMode;difficulty='all';screen='rules';notice='';render();focusHeading();return;}
    const answerButton=event.target.closest('[data-play-answer]');if(answerButton){applyAnswer(Number(answerButton.dataset.playAnswer));return;}
    const hintButton=event.target.closest('[data-play-hint]');if(hintButton){hint(hintButton.dataset.playHint);return;}
    const studyButton=event.target.closest('[data-play-study]');if(studyButton){study(studyButton.dataset.playStudy==='yes');return;}
    const orderButton=event.target.closest('[data-play-order]');if(orderButton&&round&&!round.feedback){const id=Number(orderButton.dataset.playOrder);if(!round.order.includes(id)){round.order.push(id);render();}return;}
    const removeButton=event.target.closest('[data-play-remove]');if(removeButton&&round&&!round.feedback){round.order.splice(Number(removeButton.dataset.playRemove),1);render();return;}
    const memoryButton=event.target.closest('[data-play-memory]');if(memoryButton){turnMemory(memoryButton.dataset.playMemory);return;}
    const action=event.target.closest('[data-play-action]')?.dataset.playAction;
    if(action==='home'){stopClock();screen='home';round=null;notice='';render();focusHeading();}
    if(action==='badges'){screen='badges';render();focusHeading();}
    if(action==='start')begin();
    if(action==='ready'){screen='question';round.questionAt=Date.now();render();focusHeading();}
    if(action==='finish')finish();
    if(action==='next')next();
    if(action==='flip'&&round){round.flipped=true;render();}
    if(action==='undo'&&round&&!round.feedback){round.order.pop();render();}
    if(action==='check'&&round)applyAnswer(byId.get(round.ids[round.index]).type==='order'?round.order:round.matches);
    if(action==='review'){round=null;selectedMode='mistakes';screen='rules';render();focusHeading();}
    if(action==='share'&&round){
      const text=shareResult(round,round.day);
      const copied=()=>{notice='Result copied. Share your learning lap wherever you like.';render();};
      if(win.navigator.clipboard?.writeText)win.navigator.clipboard.writeText(text).then(copied).catch(()=>{notice='Copy the result below.';render();const area=doc.createElement('textarea');area.value=text;area.setAttribute('aria-label','Shareable result');container.querySelector('.play-result').append(area);area.select();});
      else{notice='Copy the result below.';render();const area=doc.createElement('textarea');area.value=text;area.setAttribute('aria-label','Shareable result');container.querySelector('.play-result').append(area);area.select();}
    }
  };
  const onChange=event=>{
    if(disposed)return;
    if(event.target.matches('[data-play-difficulty]')){difficulty=event.target.value;render();}
    if(event.target.matches('[data-play-match]')&&round&&!round.feedback){const index=Number(event.target.dataset.playMatch);if(event.target.value==='')delete round.matches[index];else round.matches[index]=Number(event.target.value);const check=container.querySelector('[data-play-action="check"]');if(check)check.disabled=Object.keys(round.matches).length!==byId.get(round.ids[round.index]).pairs.length;}
  };
  const onPageHide=()=>{if(!disposed){persistDaily();save();}};
  const onStorage=event=>{if(disposed||event.key!==owner)return;stopClock();round=null;screen='home';read();notice='Arcade progress updated from another tab.';render();};
  container.addEventListener('click',onClick,{signal});container.addEventListener('change',onChange,{signal});
  win.addEventListener('pagehide',onPageHide,{signal});win.addEventListener('storage',onStorage,{signal});
  read();
  const unsubscribe=accountController.subscribe(nextSnapshot=>{
    const nextOwner=playStorageKey(nextSnapshot.user?.id);snapshot=nextSnapshot;
    if(nextOwner!==owner){stopClock();round=null;screen='home';owner=nextOwner;read();notice='Your Arcade now shows progress for '+(nextSnapshot.user?'this account on this device.':'the guest on this device.');}
    render();
  });
  render();
  return {refresh(){if(!disposed)render();},destroy(){if(disposed)return;disposed=true;stopClock();persistDaily();save();unsubscribe();controller.abort();container.removeEventListener('click',onClick);container.removeEventListener('change',onChange);win.removeEventListener('pagehide',onPageHide);win.removeEventListener('storage',onStorage);container.replaceChildren();}};
}
