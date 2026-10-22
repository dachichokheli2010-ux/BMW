import {account} from './account-sync.js';
import {escapeHTML as e,loadStyle} from './experience-common.js';
import {GARAGE_ECONOMY,garageGameKey,getGarageGame,garageClubActive,buyGarageClub} from './garage-game-state.js';
import {icon} from './icons.js';
import {motronMark} from './brand-mark.js';
import {t,getLanguage} from './preferences.js';
import './garage-economy-translations.js';
import './club-membership-translations.js';

const utcDay=()=>new Date().toISOString().slice(0,10);
const identity=session=>session?.user?.id==null?null:String(session.user.id);
const copy=(key,vars)=>e(t(key,vars));
const item=(name,label,vars)=>`<li><span class="cm-perk-icon">${icon(name)}</span><span>${copy(label,vars)}</span></li>`;

export function mountClubMembership(container,{accountController=account}={}){
  if(typeof container==='string')container=document.querySelector(container);
  if(!container)throw new Error('Club membership needs a container.');
  loadStyle('./club-membership.css');
  const doc=container.ownerDocument||document,win=doc.defaultView||globalThis.window,cleanups=[];
  let session=accountController.getSnapshot?.()||{user:null},userId=identity(session),destroyed=false,busy=false,timer=null,signature='',notice=null;
  const on=(target,name,listener)=>{target?.addEventListener(name,listener);cleanups.push(()=>target?.removeEventListener(name,listener));};
  function focusedKey(){return doc.activeElement?.closest?.('[data-club-focus]')?.dataset.clubFocus;}
  function restoreFocus(key){if(!key)return;[...container.querySelectorAll('[data-club-focus]')].find(node=>node.dataset.clubFocus===key)?.focus?.({preventScroll:true});}
  function schedule(){
    clearTimeout(timer);if(destroyed)return;
    const now=new Date(),next=Date.parse(now.toISOString().slice(0,10)+'T00:00:00Z')+86400000;
    timer=setTimeout(()=>{timer=null;refresh();},Math.max(50,next-now.getTime()+50));timer.unref?.();
  }
  function renderNotice(){
    const node=container.querySelector('[data-club-notice]');if(!node)return;
    node.textContent=notice?t(notice.key,notice.vars):'';node.hidden=!notice;
    node.classList.toggle('is-error',Boolean(notice?.error));node.setAttribute('role',notice?.error?'alert':'status');
  }
  function announce(key,vars={},error=false){notice={key,vars,error};renderNotice();}
  function renderShell(){
    const focused=focusedKey(),open=new Set([...container.querySelectorAll('[data-club-faq][open]')].map(node=>node.dataset.clubFaq));
    container.innerHTML=`<section class="club-membership" aria-labelledby="club-membership-title"><header class="cm-hero"><div class="cm-hero-copy"><span class="cm-kicker">${copy('Motron Club')}</span><h1 id="club-membership-title">${copy('A garage that feels like you.')}</h1><p>${copy('Keep exploring for free. Use earned Garage coins to give your collection a personal finish.')}</p><span class="cm-promise">${icon('check')}${copy('No payments. No automatic renewal.')}</span></div><div class="cm-visual" aria-hidden="true"><div class="cm-orbit"></div><div class="cm-pass"><span class="cm-pass-brand">${motronMark()}MOTRON</span><strong>Club<span>.</span></strong><span>${copy('Your garage. Your style.')}</span><div class="cm-pass-icons">${icon('garage')}${icon('star')}${icon('wheel')}</div></div><span class="cm-bonus">${icon('plus')}<strong>${GARAGE_ECONOMY.clubBonus}</strong></span></div></header><section class="cm-summary" data-club-summary aria-label="${copy('YOUR MEMBERSHIP')}"></section><p class="cm-notice" data-club-notice tabindex="-1" role="status" aria-live="polite" hidden></p><div class="cm-plans"><article class="cm-plan cm-plan-free"><span class="cm-kicker">${copy('FOR EVERY DRIVER')}</span><h2>${copy('Free')}</h2><p class="cm-plan-price">${copy('Always open')}</p><ul class="cm-perks">${item('engine','Explore every car, lesson and card battle')}${item('quiz','Earn coins by learning and collecting cars')}${item('garage','Name your garage and choose a showcase car')}</ul><a class="cm-button cm-secondary" href="/my-garage?view=collection" data-club-focus="free-showcase">${copy('Start your showcase')}${icon('next')}</a></article><article class="cm-plan cm-plan-club"><span class="cm-kicker">${copy('MADE FOR YOUR COLLECTION')}</span><h2>Club</h2><p class="cm-plan-price"><strong>${GARAGE_ECONOMY.clubCost}</strong><span>${copy('Garage coins')}<small>${copy('for {days} UTC days',{days:GARAGE_ECONOMY.clubDays})}</small></span></p><p class="cm-includes">${copy('Everything in Free, plus')}</p><ul class="cm-perks">${item('plus','+{coins} coins with each daily garage claim',{coins:GARAGE_ECONOMY.clubBonus})}${item('star','Ice and Ember card frames')}${item('user','A personal showcase subtitle')}${item('garage','Ice, Ember and Heritage banner tones')}</ul><div data-club-action></div><p class="cm-plan-fine">${copy('No payments. No automatic renewal.')}</p></article></div><p class="cm-timing">${icon('clock')}<span>${copy('Club starts today. It covers today and the next six UTC days.')}</span></p><section class="cm-backup"><span class="cm-backup-icon">${icon('garage')}</span><div><h2>${copy('Keep your progress close.')}</h2><p>${copy('Garage coins, Club passes and showcase choices are browser progress, kept separately for each account or guest. They do not sync across devices. Export a garage backup to keep a copy.')}</p><a href="/my-garage?view=collection" data-club-focus="backups">${copy('Open collection & backups')}${icon('next')}</a></div></section><section class="cm-faq" aria-labelledby="club-faq-title"><h2 id="club-faq-title">${copy('Questions, answered.')}</h2>${[['coins','How do I earn Garage coins?','Learn and play for quiz coins, then collect daily income from your owned cars. Rarer cars earn more. Visit your garage for the rates and daily caps.'],['renew','Does Club renew automatically?','No. Each activation spends earned coins once and covers seven UTC days. Activate before collecting today’s income to receive today’s Club bonus. There are no payments or cash purchases.'],['expiry','What happens when Club ends?','Your cars, coins, garage name, showcase car and permanent foil finishes stay yours. Club frames and subtitles pause, and your banner returns to Ice. Saved style choices return when you activate Club again.']].map(([id,title,body])=>`<details data-club-faq="${id}" ${open.has(id)?'open':''}><summary data-club-focus="faq-${id}">${copy(title)}</summary><p>${copy(body)}</p></details>`).join('')}</section></section>`;
    signature='';renderNotice();refresh();restoreFocus(focused);
  }
  function refresh(){
    if(destroyed||busy)return;
    session=accountController.getSnapshot?.()||session;
    const nextId=identity(session);if(nextId!==userId){userId=nextId;notice=null;renderNotice();}
    const state=getGarageGame({userId}),today=utcDay(),active=garageClubActive(state,today),checking=session.status==='loading'&&session.ready===false;
    const nextSignature=JSON.stringify([userId,state.coins,state.clubPass,today,getLanguage(),checking]);
    schedule();if(nextSignature===signature)return;signature=nextSignature;
    const focused=focusedKey(),expired=Boolean(state.clubPass&&state.clubPass.end<today),days=active?Math.max(0,Math.round((Date.parse(state.clubPass.end)-Date.parse(today))/86400000)+1):0;
    const status=active?'Club active':expired?'Club expired':'Free garage';
    container.querySelector('[data-club-summary]').innerHTML=`<div class="cm-summary-top"><span class="cm-kicker">${copy('YOUR MEMBERSHIP')}</span><span>${copy(userId===null?'Guest progress on this browser':'Account progress on this browser')}</span></div><dl class="cm-metrics"><div><dt>${copy('Your Garage coins')}</dt><dd data-club-balance>${state.coins}</dd></div><div><dt>${copy('Current plan')}</dt><dd class="cm-status ${active?'is-active':''}" data-club-status>${copy(status)}</dd>${active?`<small data-club-days="${days}">${copy(days===1?'1 UTC day remaining':'{count} UTC days remaining',{count:days})}</small>`:''}</div><div><dt>${copy('Pass valid through')}</dt><dd class="cm-expiry">${state.clubPass?`<time datetime="${e(state.clubPass.end)}T23:59:59Z" data-club-expiry>${copy(active?'Through {date} · UTC':'Ended {date} · UTC',{date:state.clubPass.end})}</time>`:copy('No pass yet')}</dd></div></dl>`;
    const shortfall=Math.max(0,GARAGE_ECONOMY.clubCost-state.coins);
    const action=checking?`<button type="button" class="cm-button cm-primary" data-club-focus="main-action" disabled>${copy('Checking your garage…')}</button>`:active?`<a class="cm-button cm-primary" data-club-focus="main-action" href="/my-garage?view=club">${copy('Style my garage')}${icon('next')}</a><p class="cm-action-detail">${copy('Club is active through {date} UTC. Your next renewal is your choice.',{date:state.clubPass.end})}</p>`:shortfall?`<a class="cm-button cm-primary" data-club-focus="main-action" href="/play">${copy('Earn {coins} more coins to join',{coins:shortfall})}${icon('next')}</a><p class="cm-action-detail">${copy('Your balance needs {coins} more coins to activate Club.',{coins:shortfall})}</p>`:`<button type="button" class="cm-button cm-primary" data-club-activate data-club-focus="main-action">${copy('Activate Club · {coins} coins',{coins:GARAGE_ECONOMY.clubCost})}${icon('next')}</button><p class="cm-action-detail">${copy('Join before today’s garage claim to include today’s +{coins} bonus.',{coins:GARAGE_ECONOMY.clubBonus})}</p>`;
    container.querySelector('[data-club-action]').innerHTML=action;restoreFocus(focused);
  }
  function activate(event){
    const button=event.target.closest('[data-club-activate]');if(!button||button.disabled||destroyed||busy)return;
    const latest=accountController.getSnapshot?.()||session;
    if(identity(latest)!==userId){refresh();announce('Your account changed. Review this garage’s balance before activating Club.',{},true);return;}
    if(latest.status==='loading'&&latest.ready===false){refresh();return;}
    busy=true;button.disabled=true;
    let result;try{result=buyGarageClub({userId});}catch{result={ok:false,message:'Could not save Club. Your coins were not spent.'};}
    busy=false;signature='';refresh();
    if(result.ok)announce('Club activated. Your pass runs through {date} UTC.',{date:result.state.clubPass.end});
    else announce(result.message||'Could not save Club. Your coins were not spent.',{},true);
    container.querySelector('[data-club-notice]')?.focus?.({preventScroll:true});
  }
  on(container,'click',activate);
  on(win,'storage',event=>{if(event.key===null||event.key===garageGameKey(userId))refresh();});
  on(win,'apex:garagegame',event=>{if(!event.detail?.key||event.detail.key===garageGameKey(userId))refresh();});
  on(win,'apex:languagechange',()=>{if(!destroyed)renderShell();});
  on(win,'pageshow',refresh);on(win,'focus',refresh);
  on(doc,'visibilitychange',()=>{if(!doc.hidden)refresh();});
  renderShell();
  const unsubscribe=accountController.subscribe?.(snapshot=>{if(destroyed)return;session=snapshot;refresh();})||(()=>{});
  return {refresh,destroy(){if(destroyed)return;destroyed=true;clearTimeout(timer);unsubscribe();for(const cleanup of cleanups)cleanup();container.replaceChildren();}};
}
