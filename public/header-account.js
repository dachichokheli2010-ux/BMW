import {t} from './preferences.js';
import './favorites-translations.js';
import './account-translations.js';
import {icon} from './icons.js';
import {apiErrorMessage} from './api-message.js';

let instances=0;
export function mountHeaderAccount(container,{accountController}){
 const abort=new AbortController(),signal=abort.signal,id='header-user-'+(++instances);
 const shell=document.createElement('div');shell.className='header-account';
 shell.innerHTML=`<button type="button" class="account-header-link" aria-haspopup="true" aria-controls="${id}" aria-expanded="false">${icon('user')}<span></span></button><div class="header-user-menu" id="${id}" hidden><a href="/account">${icon('user')}<span>${t('Account profile')}</span></a><a href="/models?collection=saved">${icon('favorite')}<span>${t('Favorites')}</span></a><a href="/my-garage">${icon('garage')}<span>${t('My garage')}</span></a><a href="/learn?tab=profile">${icon('quiz')}<span>${t('Quiz progress')}</span></a><button type="button" data-header-signout>${icon('external')}<span>${t('Sign out')}</span></button><p class="sr-only" role="status"></p></div>`;
 container.append(shell);const button=shell.querySelector('.account-header-link'),menu=shell.querySelector('.header-user-menu');let state=accountController.getSnapshot();
 function close(restore=false){menu.hidden=true;button.setAttribute('aria-expanded','false');if(restore)button.focus();}
 function render(){
  const name=state.user?.name?.split(' ')[0]||t('Account');button.querySelector('span').textContent=state.user?name:t('Sign in');button.querySelector('span').toggleAttribute('data-no-i18n',!!state.user);
  button.setAttribute('aria-label',t(state.user?'Open user menu':'Sign in or create an account'));button.dataset.status=state.status;
  if(!state.user)close();
 }
 const focusFirst=()=>menu.querySelector('a:not([hidden]),button:not([hidden])')?.focus();
 button.addEventListener('click',()=>{if(!state.user){location.href='/account';return;}menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden)focusFirst();},{signal});
 shell.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close(true);}if(event.key==='ArrowDown'&&event.target===button&&state.user){event.preventDefault();menu.hidden=false;button.setAttribute('aria-expanded','true');focusFirst();}else if(!menu.hidden&&['ArrowDown','ArrowUp','Home','End'].includes(event.key)){const items=[...menu.querySelectorAll('a:not([hidden]),button:not([hidden]):not([disabled])')],index=items.indexOf(event.target);if(index<0)return;event.preventDefault();items[event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();}},{signal});
 document.addEventListener('pointerdown',event=>{if(!shell.contains(event.target))close();},{signal});
 shell.addEventListener('focusout',event=>{if(!shell.contains(event.relatedTarget))close();},{signal});
 shell.querySelector('[data-header-signout]').addEventListener('click',async event=>{const control=event.currentTarget;if(control.disabled)return;control.disabled=true;try{await accountController.logout();close();}catch(error){shell.querySelector('[role=status]').textContent=t(apiErrorMessage(error));}finally{control.disabled=false;}},{signal});
 const unsubscribe=accountController.subscribe(next=>{state=next;render();});window.addEventListener('apex:languagechange',render,{signal});
 return {destroy(){unsubscribe();abort.abort();shell.remove();}};
}
