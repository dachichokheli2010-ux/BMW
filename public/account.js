import {account as defaultAccount} from './account-sync.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const personIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 21v-2.5a7.5 7.5 0 0 1 15 0V21"/></svg>';
const arrow='<span aria-hidden="true">↗</span>';
let mounted=0;
function stylesheet(){const href=new URL('./account.css',import.meta.url).href;if(![...document.querySelectorAll('link[rel="stylesheet"]')].some(link=>link.href===href)){const link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.append(link);}}
function nativePath(value,kind){try{const url=new URL(value,location.origin);return url.origin===location.origin&&url.pathname==='/'+kind+'-with-chatgpt'?url.pathname+url.search:'/'+kind+'-with-chatgpt?return_to=%2Faccount';}catch{return '/'+kind+'-with-chatgpt?return_to=%2Faccount';}}
function hasGuest(summary){return summary.favorites+summary.builds+summary.lessons>0||summary.xp>0;}
function busyStatus(status){return ['loading','syncing'].includes(status);}

export function mountAccountButton(container,{accountController=defaultAccount}={}){
  if(typeof container==='string')container=document.querySelector(container);if(!container)return {destroy(){}};
  stylesheet();const link=document.createElement('a');link.className='account-header-link';link.href='/account';link.innerHTML=personIcon+'<span>Sign in</span><i aria-hidden="true"></i>';container.append(link);
  const unsubscribe=accountController.subscribe(state=>{const label=state.user?state.user.name?.split(' ')[0]||'Account':'Sign in';link.querySelector('span').textContent=label;link.setAttribute('aria-label',state.user?'Open your account · '+state.message:'Sign in or create an account');link.dataset.status=state.status;if(location.pathname==='/account')link.setAttribute('aria-current','page');});
  return {destroy(){unsubscribe();link.remove();}};
}

export function mountAccount(container,{accountController=defaultAccount}={}){
  if(typeof container==='string')container=document.querySelector(container);if(!container)throw new Error('Account needs a container.');
  stylesheet();const uid='account-'+(++mounted),abort=new AbortController();let mode=new URLSearchParams(location.search).get('mode')==='signup'?'signup':'login',state=accountController.getSnapshot(),submitting=false,notice='',noticeError=false,renderKey='',destroyed=false;
  container.classList.add('account-page');
  container.innerHTML=`<div class="account-shell"><aside class="account-story"><span class="account-kicker">APEX / YOUR ACCOUNT</span><h1>Your curiosity.<br>Your collection.<br><em>Everywhere.</em></h1><p>A place for the BMWs you love and everything you learn along the way.</p><div class="account-road" aria-hidden="true"><svg viewBox="0 0 500 225" fill="none"><path d="M-30 198C90 198 54 40 189 40s128 150 229 100 35-106 120-106" class="account-road-bed"/><path d="M-30 198C90 198 54 40 189 40s128 150 229 100 35-106 120-106" class="account-road-line"/><circle cx="189" cy="40" r="9"/><circle cx="363" cy="151" r="9"/></svg><span class="account-road-chip">Built around you <i>↗</i></span><div class="account-stripes"><i></i><i></i><i></i></div></div><div class="account-benefits"><div><span>01</span><p><strong>A garage that goes with you.</strong>Saved BMWs and tuning builds, ready on your next device.</p></div><div><span>02</span><p><strong>Pick up your learning.</strong>Completed lessons, XP, and progress stay together.</p></div><div><span>03</span><p><strong>Your guest garage is safe.</strong>Choose what to bring into your account after signing in.</p></div></div><a class="account-guest-link" href="/models">Keep exploring as a guest ${arrow}</a></aside><section class="account-card" aria-label="Your account"><div data-account-content></div><p class="account-notice" data-account-notice role="status" aria-live="polite" hidden></p></section></div>`;
  const content=container.querySelector('[data-account-content]'),noticeNode=container.querySelector('[data-account-notice]');
  function showNotice(text,error=false){notice=text;noticeError=error;noticeNode.textContent=notice;noticeNode.hidden=!notice;noticeNode.classList.toggle('is-error',noticeError);}
  function statusMarkup(){return `<div class="account-sync" data-account-sync data-status="${esc(state.status)}"><span class="account-sync-dot" aria-hidden="true"></span><p data-account-status>${esc(state.message)}</p>${['offline','error','expired'].includes(state.status)?'<button type="button" data-account-action="retry">Try again</button>':''}</div>`;}
  function renderAuth(){
    const signup=mode==='signup';
    if(state.provider==='chatgpt'){
      content.innerHTML=`<span class="account-kicker">ONE ACCOUNT. A WORLD TO EXPLORE.</span><h2>Make yourself<br>at home.</h2><p class="account-card-intro">Sign in with your ChatGPT account to keep your garage and learning progress together.</p><a class="account-primary account-native" href="${esc(nativePath(state.signInUrl,'signin'))}" target="_top">Sign in with ChatGPT ${arrow}</a><p class="account-form-note">Use the account you already have. Your guest garage stays separate until you choose to import it.</p>${statusMarkup()}<a class="account-local-link" href="/learn">Explore the academy first ${arrow}</a>`;return;
    }
    content.innerHTML=`<div class="account-tabs" role="tablist" aria-label="Account access"><button type="button" role="tab" id="${uid}-login-tab" aria-controls="${uid}-form" aria-selected="${!signup}" tabindex="${signup?-1:0}" data-account-mode="login">Sign in</button><button type="button" role="tab" id="${uid}-signup-tab" aria-controls="${uid}-form" aria-selected="${signup}" tabindex="${signup?0:-1}" data-account-mode="signup">Create account</button></div><div id="${uid}-form" role="tabpanel" aria-labelledby="${uid}-${mode}-tab"><span class="account-kicker">${signup?'START YOUR NEXT CHAPTER':'GOOD TO SEE YOU AGAIN'}</span><h2>${signup?'A space of<br>your own.':'Welcome<br>back.'}</h2><p class="account-card-intro">${signup?'Build your collection. Keep your progress. Follow your curiosity.':'Your garage and next lesson are waiting for you.'}</p><form data-account-auth novalidate>${signup?`<label for="${uid}-name">Your name<input id="${uid}-name" name="name" autocomplete="name" maxlength="32" required placeholder="What should we call you?"></label>`:''}<label for="${uid}-email">Email address<input id="${uid}-email" name="email" type="email" autocomplete="email" maxlength="254" required placeholder="you@example.com" autocapitalize="none" spellcheck="false"></label><label for="${uid}-password">Password<span class="account-password"><input id="${uid}-password" name="password" type="password" autocomplete="${signup?'new-password':'current-password'}" minlength="${signup?12:1}" maxlength="128" required aria-describedby="${uid}-password-note"><button type="button" data-account-action="password" aria-label="Show password" aria-pressed="false">Show</button></span></label><p class="account-password-note" id="${uid}-password-note">${signup?'Use at least 12 characters. A memorable passphrase works well.':'Use the password you chose when creating your account.'}</p><p class="account-form-error" data-account-form-error role="alert" hidden></p><button type="submit" class="account-primary">${signup?'Create my account':'Sign in'} ${arrow}</button></form><p class="account-form-note">${signup?'Your email is used to sign in. Your guest data is only imported when you choose.':'Your session stays signed in on this browser. Sign out when using a shared device.'}</p><p class="account-mode-copy">${signup?'Already part of the garage?':'First time here?'} <button type="button" data-account-mode="${signup?'login':'signup'}">${signup?'Sign in':'Create an account'}</button></p></div>${statusMarkup()}`;
  }
  function renderProfile(){
    const summary=state.summary,guest=state.guestSummary;
    content.innerHTML=`<div class="account-profile-top"><span class="account-avatar" aria-hidden="true">${esc((state.user.name||'D').charAt(0).toUpperCase())}</span><span class="account-kicker">YOUR APEX ACCOUNT</span><h2>Good to have<br>you, <span data-account-name>${esc(state.user.name||'driver')}</span>.</h2>${state.user.email?`<p class="account-email">${esc(state.user.email)}</p>`:''}</div>${statusMarkup()}<div class="account-stats" aria-label="Your saved account data"><div><strong data-account-count="favorites">${summary.favorites}</strong><span>Saved BMWs</span></div><div><strong data-account-count="builds">${summary.builds}</strong><span>Tuning builds</span></div><div><strong data-account-count="lessons">${summary.lessons}</strong><span>Lessons complete</span></div></div><div class="account-conflict" data-account-conflict ${state.conflict?'':'hidden'}><h3>Two versions. Your choice.</h3><p>Another device saved a different garage. This device’s changes are held until you choose a version. Replacing a version affects favorites, builds, and learning together.</p><div><button type="button" data-account-action="cloud">Use account version</button><button type="button" data-account-action="local">Save this device’s version</button></div></div>${hasGuest(guest)?`<section class="account-import"><span class="account-kicker">BRING YOUR IDEAS WITH YOU</span><h3>Your guest garage is still here.</h3><p>${guest.favorites} saved BMWs · ${guest.builds} builds · ${guest.lessons} completed lessons</p><details><summary>What gets imported?</summary><p>Favorites and builds are combined, up to 20 builds. Existing account builds take priority. Completed lessons are kept from both garages; XP and credits use the higher total to avoid counting rewards twice. Your guest copy stays on this browser.</p></details><button type="button" data-account-action="import" ${state.conflict?'disabled':''}>Import guest garage ${arrow}</button></section>`:'<p class="account-clean-note">Your guest garage is separate. Signing out brings you back to your guest data on this browser.</p>'}<a class="account-primary" href="/my-garage">Open my garage ${arrow}</a><div class="account-profile-footer">${state.provider==='password'?'<button type="button" data-account-action="rename">Edit name</button>':'<span>Connected with ChatGPT</span>'}${state.provider==='chatgpt'?`<a href="${esc(nativePath(state.signOutUrl,'signout'))}" target="_top">Sign out ${arrow}</a>`:'<button type="button" data-account-action="logout">Sign out ↗</button>'}</div><form class="account-name-form" data-account-name-form hidden><label for="${uid}-profile-name">Your name<input id="${uid}-profile-name" name="name" value="${esc(state.user.name)}" maxlength="32" autocomplete="name" required></label><button type="submit">Save name</button></form>`;
  }
  function render(force=false){
    if(destroyed)return;
    const key=[state.user?.id||'',state.provider,mode,hasGuest(state.guestSummary)].join('|');
    if(force||key!==renderKey){renderKey=key;state.user?renderProfile():renderAuth();}
    else{
      const sync=content.querySelector('[data-account-sync]');if(sync){const wrapper=document.createElement('div');wrapper.innerHTML=statusMarkup();sync.replaceWith(wrapper.firstElementChild);}
      for(const node of content.querySelectorAll('[data-account-count]'))node.textContent=state.summary[node.dataset.accountCount];
      const conflictPanel=content.querySelector('[data-account-conflict]');if(conflictPanel)conflictPanel.hidden=!state.conflict;
      const importButton=content.querySelector('[data-account-action="import"]');if(importButton)importButton.disabled=state.conflict||submitting;
      const name=content.querySelector('[data-account-name]');if(name)name.textContent=state.user?.name||'driver';
    }
    container.setAttribute('aria-busy',String(submitting));
    for(const button of content.querySelectorAll('form button[type="submit"], [data-account-action="logout"], [data-account-action="cloud"], [data-account-action="local"]'))button.disabled=submitting;
  }
  async function action(callback,success){
    if(submitting)return;submitting=true;showNotice('');render();
    try{await callback();if(success)showNotice(success);}
    catch(error){showNotice(error.message||'This request could not be completed. Please try again.',true);}
    finally{submitting=false;state=accountController.getSnapshot();render();}
  }
  container.addEventListener('click',event=>{
    const tab=event.target.closest('[data-account-mode]');if(tab&&!submitting){mode=tab.dataset.accountMode;showNotice('');render(true);content.querySelector(`[data-account-mode="${mode}"][role="tab"]`)?.focus();return;}
    const target=event.target.closest('[data-account-action]');if(!target)return;const kind=target.dataset.accountAction;
    if(kind==='password'){const input=content.querySelector('input[name="password"]'),show=input.type==='password';input.type=show?'text':'password';target.textContent=show?'Hide':'Show';target.setAttribute('aria-label',show?'Hide password':'Show password');target.setAttribute('aria-pressed',String(show));}
    if(kind==='retry')void action(()=>accountController.retry());
    if(kind==='logout')void action(()=>accountController.logout());
    if(kind==='import')void action(()=>accountController.importGuest());
    if(kind==='cloud'||kind==='local')void action(()=>accountController.resolveConflict(kind));
    if(kind==='rename'){const form=content.querySelector('[data-account-name-form]');form.hidden=!form.hidden;if(!form.hidden)form.querySelector('input').focus();}
  },{signal:abort.signal});
  container.addEventListener('keydown',event=>{const tab=event.target.closest('[role="tab"][data-account-mode]');if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();mode=event.key==='Home'?'login':event.key==='End'?'signup':mode==='login'?'signup':'login';render(true);content.querySelector(`[data-account-mode="${mode}"][role="tab"]`)?.focus();}},{signal:abort.signal});
  container.addEventListener('submit',event=>{
    const form=event.target;if(!form.matches('[data-account-auth],[data-account-name-form]'))return;event.preventDefault();if(submitting)return;
    const values=new FormData(form),name=String(values.get('name')||'').trim();
    if(form.matches('[data-account-name-form]')){if(!name){showNotice('Enter your name.',true);form.querySelector('input').focus();return;}void action(()=>accountController.updateName(name),'Your name has been updated.');return;}
    const email=String(values.get('email')||'').trim(),password=String(values.get('password')||''),error=content.querySelector('[data-account-form-error]');
    error.hidden=true;for(const input of form.querySelectorAll('input'))input.removeAttribute('aria-invalid');
    let invalid,message;
    if(mode==='signup'&&!name){invalid=form.elements.name;message='Enter your name to create an account.';}
    else if(!email||!form.elements.email.validity.valid){invalid=form.elements.email;message='Enter a valid email address.';}
    else if(!password||mode==='signup'&&password.length<12||password.length>128){invalid=form.elements.password;message=mode==='signup'?'Use a password between 12 and 128 characters.':'Enter your password.';}
    if(invalid){error.textContent=message;error.hidden=false;invalid.setAttribute('aria-invalid','true');invalid.focus();return;}
    void action(()=>mode==='signup'?accountController.signup({name,email,password}):accountController.login({email,password}));
  },{signal:abort.signal});
  const unsubscribe=accountController.subscribe(next=>{state=next;render();});render();
  return {destroy(){destroyed=true;unsubscribe();abort.abort();container.replaceChildren();container.classList.remove('account-page');}};
}
