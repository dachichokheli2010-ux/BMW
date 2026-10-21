import {t} from './preferences.js';
import './account-translations.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/** Tokens are consumed from URL fragments, which are not sent as HTTP referrers. */
export function accountLinkFlow(hash){
 const params=new URLSearchParams(String(hash||'').replace(/^#/,''));
 for(const mode of ['reset','verify']){const token=params.get(mode);if(token&&/^[A-Za-z0-9_-]{32,256}$/.test(token))return {mode,token};}
 return null;
}
export function accountFieldError(name,value,{signup=false,confirm,password}={}){
 if(name==='name'&&(!value.trim()||value.trim().length>32||/[\u0000-\u001f\u007f]/.test(value)))return 'Use a name between 1 and 32 characters.';
 if(name==='email'&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value.trim()))return 'Enter a valid email address.';
 if(name==='password'&&(!value||value.length>128||signup&&value.length<12))return signup?'Use a password between 12 and 128 characters.':'Enter your password.';
 if(name==='confirm'&&value!==password)return 'The passwords do not match.';
 return '';
}
export function recoveryMarkup(mode,uid,{available=true}={}){
 const reset=mode==='reset';
 return `<span class="account-kicker">Motron / ${esc(t('Your account'))}</span><h2>${esc(t(reset?'Choose a new password.':'Reset your password.'))}</h2><p class="account-card-intro">${esc(t(reset?'Use a new passphrase that you do not use on another website.':'Enter your email. If an account can receive a reset link, we will send one.'))}</p>${!reset&&!available?`<p class="account-form-note">${esc(t('Password recovery is temporarily unavailable. Please try again later.'))}</p>`:''}<form data-account-recovery="${reset?'reset':'forgot'}" novalidate>${reset?`<label for="${uid}-new-password">${esc(t('New password'))}<span class="account-password"><input type="password" id="${uid}-new-password" name="password" autocomplete="new-password" minlength="12" maxlength="128" required><button type="button" data-account-action="password" aria-label="${esc(t('Show password'))}" aria-pressed="false">${esc(t('Show'))}</button></span></label><label for="${uid}-confirm">${esc(t('Confirm password'))}<input type="password" id="${uid}-confirm" name="confirm" autocomplete="new-password" minlength="12" maxlength="128" required></label>`:`<label for="${uid}-recovery-email">${esc(t('Email address'))}<input type="email" id="${uid}-recovery-email" name="email" autocomplete="email" maxlength="254" autocapitalize="none" spellcheck="false" required placeholder="you@example.com"></label>`}<p class="account-form-error" data-account-form-error role="alert" hidden></p><button type="submit" class="account-primary" ${!reset&&!available?'disabled':''}>${esc(t(reset?'Save new password':'Send reset link'))}</button></form><button type="button" class="account-text-link" data-account-mode="login">${esc(t('Back to sign in'))}</button>`;
}
