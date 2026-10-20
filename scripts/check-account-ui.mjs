import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {accountDestination,nativeAccountPath} from '../public/account-routing.js';
import {apiErrorMessage} from '../public/api-message.js';

const {window,document}=parseHTML('<html lang="en"><head></head><body><main id="fixture"></main></body></html>');
Object.assign(globalThis,{window,document,location:new URL('https://apex.test/account'),localStorage:{getItem:()=>null,setItem(){}},CustomEvent:window.CustomEvent,MutationObserver:window.MutationObserver,matchMedia:()=>({matches:false,addEventListener(){}})});
let focused=document.body;
Object.defineProperty(document,'activeElement',{get:()=>focused});
window.HTMLElement.prototype.focus=function(){focused=this;};
Object.defineProperty(window.HTMLElement.prototype,'elements',{configurable:true,get(){return Object.fromEntries([...this.querySelectorAll('[name]')].map(input=>[input.name,input]));}});
// linkedom intentionally omits browser form serialization and validity APIs.
globalThis.FormData=class extends Map {constructor(form){super([...form.querySelectorAll('[name]')].map(input=>[input.name,input.value]));}};
Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){return this.querySelector('option[selected]')?.value||this.querySelector('option')?.value||'';},set(value){for(const option of this.querySelectorAll('option'))option.toggleAttribute('selected',option.value===value);}});
const {mountAccount}=await import('../public/account.js');
const {mountHeaderAccount}=await import('../public/header-account.js');
const {setLanguage}=await import('../public/preferences.js');
let checks=0;
const check=(actual,expected,message)=>{assert.deepEqual(actual,expected,message);checks++;};
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
const admin={id:'owner',name:'Models',email:'owner@example.test',language:'en',isAdmin:true,role:'admin'};
const member={...admin,id:'member',name:'Member',isAdmin:false,role:'member'};
function controller({user=null,capabilities={},adminAccess={},loginUser=admin}={}){
 const summary={favorites:0,builds:0,lessons:0,xp:0};let snapshot={user,provider:'password',capabilities,adminAccess,status:user?'synced':'guest',message:'Ready',summary,guestSummary:summary,ready:true},listener=()=>{};
 return {getSnapshot:()=>snapshot,subscribe(fn){listener=fn;fn(snapshot);return()=>{};},emit(user){snapshot={...snapshot,user};listener(snapshot);},async login(){snapshot={...snapshot,user:loginUser};listener(snapshot);return snapshot;},async logout(){snapshot={...snapshot,user:null};listener(snapshot);},async signup(){return {...snapshot,message:'Your account is ready. Sign in to continue.'};}};
}
function fixture(options={}){const host=document.createElement('div');document.querySelector('#fixture').append(host);const paths=[],account=options.accountController||controller(),instance=mountAccount(host,{...options,accountController:account,navigate:path=>paths.push(path)});return {host,paths,account,close(){instance.destroy();host.remove();}};}
function submitLogin(f){const form=f.host.querySelector('[data-account-auth]'),email=form.querySelector('[name=email]'),password=form.querySelector('[name=password]');email.value='owner@example.test';password.value='correct password';Object.defineProperty(email,'validity',{value:{valid:true}});Object.defineProperty(form,'elements',{value:{email,password}});form.dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));}

check(accountDestination(admin),'/admin','Server-authorized administrators go straight to admin');
check(accountDestination(member,'/friends?tab=incoming#requests'),'/friends?tab=incoming#requests','Internal post-login destinations retain query and anchor');
for(const value of ['https://evil.test','//evil.test','/\\evil.test','/api/auth/logout','/account?return_to=/admin','/signin-with-chatgpt','/friends\n'])check(accountDestination(member,value),'','External, control and auth-loop destinations are rejected');
check(accountDestination(null,'/admin'),'','Guests never navigate based on a return target');
check(apiErrorMessage({error:{message:'The database needs a moment.'}}),'The database needs a moment.');
check(apiErrorMessage({error:{code:'OFFLINE'}},'Please try again.'),'Please try again.');
check(apiErrorMessage({error:' [object Object] '},'Please try again.'),'Please try again.');
const native=new URL(nativeAccountPath('https://evil.test/signin-with-chatgpt','signin',{origin:'https://apex.test',returnTo:'/friends'}),'https://apex.test');
check(native.origin,'https://apex.test','Hosted sign-in stays on the app origin');check(native.pathname,'/signin-with-chatgpt');
const nativeReturn=new URL(native.searchParams.get('return_to'),'https://apex.test');check(nativeReturn.searchParams.get('after_signin'),'1','Native login preserves an explicit post-sign-in marker');check(nativeReturn.searchParams.get('return_to'),'/friends','Native login retains a member destination');

{
 const f=fixture();submitLogin(f);await tick();check(f.paths,['/admin'],'Submitting the actual login form opens admin once');check(f.host.querySelector('[data-account-admin]').getAttribute('href'),'/admin','Admin profile also exposes a persistent workspace link');f.close();
}
{
 const f=fixture({accountController:controller({loginUser:member})});submitLogin(f);await tick();check(f.paths,[],'Member login stays on the account profile');check(f.host.querySelector('[data-account-admin]'),null,'Members do not receive administrator controls');f.close();
}
{
 globalThis.location=new URL('https://apex.test/account?return_to=%2Ffriends');const f=fixture({accountController:controller({loginUser:member})});submitLogin(f);await tick();check(f.paths,['/friends'],'A login gate returns members to their requested task once');f.close();globalThis.location=new URL('https://apex.test/account');
}
{
 const f=fixture({accountController:controller({user:admin})});check(f.paths,[],'Admins can still visit their account settings');check(f.host.querySelector('.account-profile-links a').getAttribute('href'),'/models?collection=saved','Profile favorites use the supported catalog route');setLanguage('ru');check(f.host.querySelector('[data-account-name]').textContent,'Models','A member-supplied name is preserved across language changes');setLanguage('en');f.close();
}
{
 globalThis.location=new URL('https://apex.test/account?after_signin=1');const f=fixture({accountController:controller({user:admin})});check(f.paths,['/admin'],'A completed native login sends the administrator into admin');f.close();globalThis.location=new URL('https://apex.test/account');
}
{
 const f=fixture({accountController:controller({capabilities:{passwordRecovery:false}})});f.host.querySelector('[data-account-mode=forgot]').click();check(f.host.querySelector('[data-account-recovery] button[type=submit]').disabled,true,'Unavailable mail cannot become enabled by the general render pass');f.close();
}
{
 const f=fixture({accountController:controller({user:member,adminAccess:{verificationRequired:true},capabilities:{emailVerification:false}})});check(f.host.querySelector('[data-account-admin-verification]').textContent.includes('Email delivery is unavailable'),true,'A configured owner receives an actionable verification status');f.close();
}
{
 const host=document.createElement('div');document.querySelector('#fixture').append(host);const account=controller({user:admin}),instance=mountHeaderAccount(host,{accountController:account});check(host.querySelector('[data-header-admin]').getAttribute('href'),'/admin','Header exposes administrator access');host.querySelector('.account-header-link').click();check(focused,host.querySelector('[data-header-admin]'),'Opening the user menu focuses admin first');const event=new window.Event('keydown',{bubbles:true,cancelable:true});event.key='End';focused.dispatchEvent(event);check(focused,host.querySelector('[data-header-signout]'),'Menu keyboard navigation reaches the last control');account.emit(member);check(host.querySelector('[data-header-admin]'),null,'Removing a role immediately removes its admin entry');instance.destroy();host.remove();
}
console.log(`Account UI: ${checks} login, administrator access, return paths, mail availability, translations, error and keyboard checks passed.`);
