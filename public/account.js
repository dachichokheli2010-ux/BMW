import {account as defaultAccount} from './account-sync.js';
import {t,getLanguage,setLanguage,translatePage} from './preferences.js';
import {mountHeaderAccount} from './header-account.js';
import {accountLinkFlow,accountFieldError,recoveryMarkup} from './account-recovery-ui.js';
import {apiErrorMessage} from './api-message.js';
import {accountDestination,nativeAccountPath} from './account-routing.js';
import './account-translations.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const personIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 21v-2.5a7.5 7.5 0 0 1 15 0V21"/></svg>';
const arrow='<span aria-hidden="true">↗</span>';
let mounted=0;
function stylesheet(){const href=new URL('./account.css',import.meta.url).href;if(![...document.querySelectorAll('link[rel="stylesheet"]')].some(link=>link.href===href)){const link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.append(link);}}
function nativePath(value,kind,returnTo=''){return nativeAccountPath(value,kind,{origin:location.origin,returnTo});}
function hasGuest(summary){return summary.favorites+summary.builds+summary.lessons>0||summary.xp>0;}
function busyStatus(status){return ['loading','syncing'].includes(status);}

export function mountAccountButton(container,{accountController=defaultAccount}={}){
 if(typeof container==='string')container=document.querySelector(container);if(!container)return {destroy(){}};stylesheet();return mountHeaderAccount(container,{accountController});
}

export function mountAccount(container,{accountController=defaultAccount,navigate=path=>location.assign(path)}={}){
  if(typeof container==='string')container=document.querySelector(container);if(!container)throw new Error('Account needs a container.');
  stylesheet();const uid='account-'+(++mounted),abort=new AbortController();let mode=new URLSearchParams(location.search).get('mode')==='signup'?'signup':'login',state=accountController.getSnapshot(),submitting=false,notice='',noticeError=false,renderKey='',destroyed=false;
  const linkFlow=accountLinkFlow(location.hash);if(linkFlow?.mode==='reset')mode='reset';if(linkFlow)history.replaceState(history.state,'',location.pathname+location.search);
  const returnTo=new URLSearchParams(location.search).get('return_to')||'',afterSignin=new URLSearchParams(location.search).get('after_signin')==='1';let navigating=false;
  function continueSignedIn(){const destination=accountDestination(state.user,returnTo);if(destination&&!navigating&&!destroyed){navigating=true;navigate(destination);}}
  container.classList.add('account-page');
  container.innerHTML=`<div class="account-shell"><aside class="account-story"><span class="account-kicker">APEX / YOUR ACCOUNT</span><h1>Your curiosity.<br>Your collection.<br><em>Everywhere.</em></h1><p>A place for the BMWs you love and everything you learn along the way.</p><div class="account-road" aria-hidden="true"><svg viewBox="0 0 500 225" fill="none"><path d="M-30 198C90 198 54 40 189 40s128 150 229 100 35-106 120-106" class="account-road-bed"/><path d="M-30 198C90 198 54 40 189 40s128 150 229 100 35-106 120-106" class="account-road-line"/><circle cx="189" cy="40" r="9"/><circle cx="363" cy="151" r="9"/></svg><span class="account-road-chip">Built around you <i>↗</i></span><div class="account-stripes"><i></i><i></i><i></i></div></div><div class="account-benefits"><div><span>01</span><p><strong>A garage that goes with you.</strong>Saved BMWs and tuning builds, ready on your next device.</p></div><div><span>02</span><p><strong>Pick up your learning.</strong>Completed lessons, XP, and progress stay together.</p></div><div><span>03</span><p><strong>Your guest garage is safe.</strong>Choose what to bring into your account after signing in.</p></div></div><a class="account-guest-link" href="/models">Keep exploring as a guest ${arrow}</a></aside><section class="account-card" aria-label="Your account"><div data-account-content></div><p class="account-notice" data-account-notice role="status" aria-live="polite" hidden></p></section></div>`;
  const content=container.querySelector('[data-account-content]'),noticeNode=container.querySelector('[data-account-notice]');
  function showNotice(text,error=false){notice=text;noticeError=error;noticeNode.textContent=notice;noticeNode.hidden=!notice;noticeNode.classList.toggle('is-error',noticeError);}
  function statusMarkup(){return `<div class="account-sync" data-account-sync data-status="${esc(state.status)}"><span class="account-sync-dot" aria-hidden="true"></span><p data-account-status>${esc(state.message)}</p>${['offline','error','expired'].includes(state.status)?'<button type="button" data-account-action="retry">Try again</button>':''}</div>`;}
  function renderAuth(){
    if(mode==='forgot'||mode==='reset'){content.innerHTML=recoveryMarkup(mode,uid,{available:state.capabilities?.passwordRecovery!==false});return;}
    const signup=mode==='signup';
    if(state.provider==='chatgpt'){
      content.innerHTML=`<span class="account-kicker">ONE ACCOUNT. A WORLD TO EXPLORE.</span><h2>Make yourself<br>at home.</h2><p class="account-card-intro">Sign in with your ChatGPT account to keep your garage and learning progress together.</p><a class="account-primary account-native" href="${esc(nativePath(state.signInUrl,'signin',returnTo))}" target="_top">Sign in with ChatGPT ${arrow}</a><p class="account-form-note">Use the account you already have. Your guest garage stays separate until you choose to import it.</p>${statusMarkup()}<a class="account-local-link" href="/learn">Explore the academy first ${arrow}</a>`;return;
    }
    content.innerHTML=`<div class="account-tabs" role="tablist" aria-label="Account access"><button type="button" role="tab" id="${uid}-login-tab" aria-controls="${uid}-form" aria-selected="${!signup}" tabindex="${signup?-1:0}" data-account-mode="login">Sign in</button><button type="button" role="tab" id="${uid}-signup-tab" aria-controls="${uid}-form" aria-selected="${signup}" tabindex="${signup?0:-1}" data-account-mode="signup">Create account</button></div><div id="${uid}-form" role="tabpanel" aria-labelledby="${uid}-${mode}-tab"><span class="account-kicker">${signup?'START YOUR NEXT CHAPTER':'GOOD TO SEE YOU AGAIN'}</span><h2>${signup?'A space of<br>your own.':'Welcome<br>back.'}</h2><p class="account-card-intro">${signup?'Build your collection. Keep your progress. Follow your curiosity.':'Your garage and next lesson are waiting for you.'}</p><form data-account-auth novalidate>${signup?`<label for="${uid}-name">Your name<input id="${uid}-name" name="name" type="text" autocomplete="name" maxlength="32" required placeholder="What should we call you?"></label>`:''}<label for="${uid}-email">Email address<input id="${uid}-email" name="email" type="email" autocomplete="email" maxlength="254" required placeholder="you@example.com" autocapitalize="none" spellcheck="false"></label><label for="${uid}-password">Password<span class="account-password"><input id="${uid}-password" name="password" type="password" autocomplete="${signup?'new-password':'current-password'}" minlength="${signup?12:1}" maxlength="128" required aria-describedby="${uid}-password-note"><button type="button" data-account-action="password" aria-label="Show password" aria-pressed="false">Show</button></span></label><p class="account-password-note" id="${uid}-password-note">${signup?'Use at least 12 characters. A memorable passphrase works well.':'Use the password you chose when creating your account.'}</p>${!signup?'<button type="button" class="account-text-link" data-account-mode="forgot">Forgot password?</button>':''}<p class="account-form-error" data-account-form-error role="alert" hidden></p><button type="submit" class="account-primary">${signup?'Create my account':'Sign in'} ${arrow}</button></form><p class="account-form-note">${signup?'Your email is used to sign in. Your guest data is only imported when you choose.':'Your session stays signed in on this browser. Sign out when using a shared device.'}</p><p class="account-mode-copy">${signup?'Already part of the garage?':'First time here?'} <button type="button" data-account-mode="${signup?'login':'signup'}">${signup?'Sign in':'Create an account'}</button></p></div>${statusMarkup()}`;
  }
  function renderProfile(){
    const summary=state.summary,guest=state.guestSummary;
    content.innerHTML=`<div class="account-profile-top"><span class="account-avatar" aria-hidden="true">${esc((state.user.name||'D').charAt(0).toUpperCase())}</span><span class="account-kicker">YOUR APEX ACCOUNT</span><h2>Good to have<br>you, <span data-account-name>${esc(state.user.name||'driver')}</span>.</h2>${state.user.email?`<p class="account-email">${esc(state.user.email)}</p>`:''}</div>${statusMarkup()}${state.provider==='password'?`<section class="account-verification"><h3>Email verification</h3><p>${state.user.emailVerified?'Email verified':'Your email has not been verified yet.'}</p>${!state.user.emailVerified?state.capabilities?.emailVerification?'<button type="button" data-account-action="verify">Send verification email</button>':'<p>Email verification is temporarily unavailable.</p>':''}</section>`:''}<div class="account-stats" aria-label="Your saved account data"><div><strong data-account-count="favorites">${summary.favorites}</strong><span>Saved BMWs</span></div><div><strong data-account-count="builds">${summary.builds}</strong><span>Tuning builds</span></div><div><strong data-account-count="lessons">${summary.lessons}</strong><span>Lessons complete</span></div></div><div class="account-conflict" data-account-conflict ${state.conflict?'':'hidden'}><h3>Two versions. Your choice.</h3><p>Another device saved a different garage. This device’s changes are held until you choose a version. Replacing a version affects favorites, builds, and learning together.</p><div><button type="button" data-account-action="cloud">Use account version</button><button type="button" data-account-action="local">Save this device’s version</button></div></div>${hasGuest(guest)?`<section class="account-import"><span class="account-kicker">BRING YOUR IDEAS WITH YOU</span><h3>Your guest garage is still here.</h3><p>${guest.favorites} saved BMWs · ${guest.builds} builds · ${guest.lessons} completed lessons</p><details><summary>What gets imported?</summary><p>Favorites and builds are combined, up to 20 builds. Existing account builds take priority. Completed lessons are kept from both garages; XP and credits use the higher total to avoid counting rewards twice. Your guest copy stays on this browser.</p></details><button type="button" data-account-action="import" ${state.conflict?'disabled':''}>Import guest garage ${arrow}</button></section>`:'<p class="account-clean-note">Your guest garage is separate. Signing out brings you back to your guest data on this browser.</p>'}<div class="account-profile-links"><a href="/models?collection=saved">Favorites</a><a href="/learn?tab=profile">Quiz progress</a><label>Language preference<select data-account-language><option value="en">English</option><option value="ka">&#4325;&#4304;&#4320;&#4311;&#4323;&#4314;&#4312;</option><option value="ru">&#1056;&#1091;&#1089;&#1089;&#1082;&#1080;&#1081;</option></select></label></div><a class="account-primary" href="/my-garage">Open my garage ${arrow}</a><div class="account-profile-footer">${state.provider==='password'?'<button type="button" data-account-action="rename">Edit name</button>':'<span>Connected with ChatGPT</span>'}${state.provider==='chatgpt'?`<a href="${esc(nativePath(state.signOutUrl,'signout'))}" target="_top">Sign out ${arrow}</a>`:'<button type="button" data-account-action="logout">Sign out ↗</button>'}</div><form class="account-name-form" data-account-name-form hidden><label for="${uid}-profile-name">Your name<input id="${uid}-profile-name" name="name" type="text" value="${esc(state.user.name)}" maxlength="32" autocomplete="name" required></label><button type="submit">Save name</button></form>`;
  }
  function render(force=false){
    if(destroyed)return;
    const key=[state.user?.id||'',state.provider,mode,hasGuest(state.guestSummary),state.user?.emailVerified,state.user?.language].join('|');
    if(force||key!==renderKey){renderKey=key;state.user?renderProfile():renderAuth();}
    else{
      const sync=content.querySelector('[data-account-sync]');if(sync){const wrapper=document.createElement('div');wrapper.innerHTML=statusMarkup();sync.replaceWith(wrapper.firstElementChild);}
      for(const node of content.querySelectorAll('[data-account-count]'))node.textContent=state.summary[node.dataset.accountCount];
      const conflictPanel=content.querySelector('[data-account-conflict]');if(conflictPanel)conflictPanel.hidden=!state.conflict;
      const importButton=content.querySelector('[data-account-action="import"]');if(importButton)importButton.disabled=state.conflict||submitting;
      const name=content.querySelector('[data-account-name]');if(name)name.textContent=state.user?.name||'driver';
    }
    const languageSelect=content.querySelector('[data-account-language]');if(languageSelect)languageSelect.value=state.user?.language||getLanguage();
    if(state.user){
      content.querySelector('[data-account-name]')?.setAttribute('data-no-i18n','');content.querySelector('.account-email')?.setAttribute('data-no-i18n','');
    }
    translatePage();
    container.setAttribute('aria-busy',String(submitting));
    for(const button of content.querySelectorAll('form button[type="submit"], [data-account-action="logout"], [data-account-action="cloud"], [data-account-action="local"]'))button.disabled=submitting||!!button.closest('[data-account-recovery="forgot"]')&&state.capabilities?.passwordRecovery===false;
  }
  async function action(callback,success){
    if(submitting)return;submitting=true;showNotice('');render();
    try{await callback();if(success)showNotice(success);}
    catch(error){showNotice(apiErrorMessage(error),true);}
    finally{submitting=false;state=accountController.getSnapshot();render();}
  }
  container.addEventListener('click',event=>{
    const tab=event.target.closest('[data-account-mode]');if(tab&&!submitting){mode=tab.dataset.accountMode;showNotice('');render(true);content.querySelector(`[data-account-mode="${mode}"][role="tab"]`)?.focus();return;}
    const target=event.target.closest('[data-account-action]');if(!target)return;const kind=target.dataset.accountAction;
    if(kind==='password'){const input=content.querySelector('input[name="password"]'),show=input.type==='password';input.type=show?'text':'password';target.textContent=t(show?'Hide':'Show');target.setAttribute('aria-label',t(show?'Hide password':'Show password'));target.setAttribute('aria-pressed',String(show));}
    if(kind==='retry')void action(()=>accountController.retry());
    if(kind==='logout')void action(()=>accountController.logout());
    if(kind==='import')void action(()=>accountController.importGuest());
    if(kind==='cloud'||kind==='local')void action(()=>accountController.resolveConflict(kind));
    if(kind==='verify')void action(()=>accountController.resendVerification(getLanguage()),'If a verification email can be sent, it will arrive shortly.');
    if(kind==='rename'){const form=content.querySelector('[data-account-name-form]');form.hidden=!form.hidden;if(!form.hidden)form.querySelector('input').focus();}
  },{signal:abort.signal});
  container.addEventListener('keydown',event=>{const tab=event.target.closest('[role="tab"][data-account-mode]');if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();mode=event.key==='Home'?'login':event.key==='End'?'signup':mode==='login'?'signup':'login';render(true);content.querySelector(`[data-account-mode="${mode}"][role="tab"]`)?.focus();}},{signal:abort.signal});
  container.addEventListener('submit',event=>{
    const form=event.target;if(!form.matches('[data-account-auth],[data-account-name-form],[data-account-recovery]'))return;event.preventDefault();if(submitting)return;
    const values=new FormData(form),name=String(values.get('name')||'').trim();
    if(form.matches('[data-account-recovery]')){
      const kind=form.dataset.accountRecovery,email=String(values.get('email')||''),password=String(values.get('password')||''),confirm=String(values.get('confirm')||'');
      const inputs=[...form.querySelectorAll('input')];let invalid=null;
      for(const input of inputs){const message=accountFieldError(input.name,input.value,{signup:true,password});showFieldError(input,message);if(message&&!invalid)invalid=input;}
      if(invalid){invalid.focus();return;}
      if(kind==='reset'&&!linkFlow?.token){showNotice(t('This reset link is invalid or has expired. Request a new link.'),true);return;}
      void action(async()=>{const result=kind==='forgot'?await accountController.forgotPassword(email,getLanguage()):await accountController.resetPassword(linkFlow.token,password);mode='login';render(true);showNotice(t(result.message));});return;
    }
    if(form.matches('[data-account-name-form]')){if(!name){showNotice('Enter your name.',true);form.querySelector('input').focus();return;}void action(()=>accountController.updateName(name),'Your name has been updated.');return;}
    const email=String(values.get('email')||'').trim(),password=String(values.get('password')||''),error=content.querySelector('[data-account-form-error]');
    error.hidden=true;for(const input of form.querySelectorAll('input'))input.removeAttribute('aria-invalid');
    let invalid,message;
    if(mode==='signup'&&!name){invalid=form.elements.name;message='Enter your name to create an account.';}
    else if(!email||!form.elements.email.validity.valid){invalid=form.elements.email;message='Enter a valid email address.';}
    else if(!password||mode==='signup'&&password.length<12||password.length>128){invalid=form.elements.password;message=mode==='signup'?'Use a password between 12 and 128 characters.':'Enter your password.';}
    if(invalid){error.textContent=message;error.hidden=false;invalid.setAttribute('aria-invalid','true');invalid.focus();return;}
    void action(async()=>{if(mode==='signup'){const result=await accountController.signup({name,email,password,language:getLanguage()});mode='login';render(true);showNotice(t(result.message));}else{await accountController.login({email,password});state=accountController.getSnapshot();const preferred=state.user?.language;if(preferred)setLanguage(preferred);continueSignedIn();}});
  },{signal:abort.signal});
  function showFieldError(input,message){
    const label=input.closest('label');if(!label)return;let error=label.querySelector('.account-field-error');
    if(!error){error=document.createElement('small');error.className='account-field-error';error.id=input.id+'-error';error.setAttribute('aria-live','polite');label.append(error);}
    error.textContent=message?t(message):'';error.hidden=!message;input.setAttribute('aria-invalid',String(!!message));
    const ids=(input.getAttribute('aria-describedby')||'').split(' ').filter(id=>id&&id!==error.id);if(message)ids.push(error.id);if(ids.length)input.setAttribute('aria-describedby',ids.join(' '));else input.removeAttribute('aria-describedby');
  }
  container.addEventListener('input',event=>{const input=event.target;if(!input.matches('input[name=name],input[name=email],input[name=password],input[name=confirm]'))return;const form=input.form;showFieldError(input,accountFieldError(input.name,input.value,{signup:mode==='signup'||mode==='reset',password:form.elements.password?.value}));},{signal:abort.signal});
  container.addEventListener('change',event=>{if(event.target.matches('[data-account-language]')){const language=event.target.value;void action(async()=>{await accountController.updateLanguage(language);setLanguage(language);},'Language preference saved.');}},{signal:abort.signal});
  window.addEventListener('apex:languagechange',()=>{const form=content.querySelector('form'),values=form?Object.fromEntries(new FormData(form)):null;render(true);if(values)for(const [name,value]of Object.entries(values)){const input=content.querySelector('form')?.elements[name];if(input)input.value=value;}},{signal:abort.signal});
  if(linkFlow?.mode==='verify')queueMicrotask(()=>void action(()=>accountController.verifyEmail(linkFlow.token),'Your email has been verified.'));
  const unsubscribe=accountController.subscribe(next=>{state=next;render();if((returnTo||afterSignin)&&state.ready&&state.user&&!linkFlow)continueSignedIn();});render();
  return {destroy(){destroyed=true;unsubscribe();abort.abort();container.replaceChildren();container.classList.remove('account-page');}};
}
