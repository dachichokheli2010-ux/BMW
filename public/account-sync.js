// The four existing browser stores are a projection of either the guest garage
// or the verified current account. Authentication tokens never go in storage.
import {apiErrorMessage} from './api-message.js';
export const ACCOUNT_KEYS = Object.freeze({favorites:'apex-favorites',builds:'apex-garage-builds-v1',academy:'bmw-academy-state-v2',legacyProgress:'bmw-academy-progress-v1'});
const GUEST_KEY = 'apex-guest-garage-v1', CACHE_KEY = 'apex-account-cache-v1', OWNER_KEY = 'apex-garage-owner-v1';
const empty = () => ({favorites:[],builds:[],academy:null,legacyProgress:{}});
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const copy = value => JSON.parse(JSON.stringify(value));
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const validGarageSnapshot=value=>record(value)&&Number.isSafeInteger(value.revision)&&value.revision>=0&&record(value.state)&&Array.isArray(value.state.favorites)&&value.state.favorites.every(id=>typeof id==='string')&&Array.isArray(value.state.builds)&&value.state.builds.every(record)&&(value.state.academy===null||record(value.state.academy)&&value.state.academy.version===2)&&record(value.state.legacyProgress)&&(value.updatedAt===null||typeof value.updatedAt==='string'&&!Number.isNaN(Date.parse(value.updatedAt)));
function requireGarageSnapshot(value){if(!validGarageSnapshot(value))throw new Error('The account service returned incomplete garage data. Your saved copy has been preserved.');return value;}
function cleanState(value) {
  return {favorites:Array.isArray(value?.favorites) ? [...new Set(value.favorites.filter(id=>typeof id==='string'))].slice(0,1000) : [],builds:Array.isArray(value?.builds) ? value.builds.filter(record).slice(0,20) : [],academy:record(value?.academy)&&value.academy.version===2 ? value.academy : null,legacyProgress:record(value?.legacyProgress) ? value.legacyProgress : {}};
}
export function summarizeGarage(state) {
  state = cleanState(state);
  return {favorites:state.favorites.length,builds:state.builds.length,lessons:Object.keys(state.academy?.completed||{}).length,xp:Number(state.academy?.xp)||0};
}
export function accountStorageMessage(snapshot) {
  if(snapshot.storageAvailable===false)return 'Browser storage is unavailable. Local changes may not be saved.';
  if(!snapshot.user)return 'Guest data is saved in this browser. Sign in to sync across devices.';
  if(snapshot.status==='synced')return 'Saved to your Motron account. Changes sync across your devices.';
  if(snapshot.status==='pending'||snapshot.status==='syncing')return 'Saving to your Motron account. A copy stays on this browser.';
  if(snapshot.status==='conflict')return 'Saved on this device. Resolve the sync conflict in Account.';
  if(snapshot.status==='offline')return 'Saved on this device. Account sync is waiting to reconnect.';
  return 'Account sync needs attention. Open Account to review it.';
}
/** Explicit guest import combines collections without awarding duplicate XP. */
export function mergeGuestGarage(current,guest) {
  current=cleanState(current); guest=cleanState(guest);
  let academy=current.academy ? copy(current.academy) : guest.academy ? copy(guest.academy) : null;
  if(current.academy&&guest.academy){
    const a=current.academy,b=guest.academy;
    academy={...copy(b),...copy(a),xp:Math.max(Number(a.xp)||0,Number(b.xp)||0),credits:Math.max(Number(a.credits)||0,Number(b.credits)||0),completed:{...b.completed,...a.completed},attempts:{...b.attempts,...a.attempts},review:{...b.review,...a.review}};
    for(const key of ['days','awards','unlocked'])academy[key]=[...new Set([...(a[key]||[]),...(b[key]||[])])];
    academy.activity=[...new Map([...(b.activity||[]),...(a.activity||[])].map(item=>[JSON.stringify(item),item])).values()].slice(-500);
    academy.selectedPath=a.selectedPath||b.selectedPath||'basics';
    academy.achievements={...copy(b.achievements||{}),...copy(a.achievements||{})};
    for(const id of Object.keys(academy.achievements)){
      const dates=[a.achievements?.[id]?.day,b.achievements?.[id]?.day].filter(day=>typeof day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(day)).sort();
      academy.achievements[id]={day:dates[0]||null};
    }
    for(const [id,attempt] of Object.entries(b.attempts||{}))if(a.attempts?.[id])academy.attempts[id]={...a.attempts[id],right:Math.max(Number(a.attempts[id].right)||0,Number(attempt.right)||0),total:Math.max(Number(a.attempts[id].total)||0,Number(attempt.total)||0)};
  }
  const builds=[...new Map([...current.builds,...guest.builds].map(build=>[build.id,build])).values()].slice(0,20);
  // Prefer account builds when an imported snapshot has the same identifier.
  for(let i=0;i<builds.length;i++)builds[i]=current.builds.find(build=>build.id===builds[i].id)||builds[i];
  return cleanState({favorites:[...current.favorites,...guest.favorites],builds,academy,legacyProgress:{...guest.legacyProgress,...current.legacyProgress}});
}

export function createAccountController({fetchImpl=(...args)=>fetch(...args),storage,eventTarget=globalThis.window,timeout=15000}={}) {
  if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}
  let user=null,provider='password',signInUrl='',signOutUrl='',csrfToken=null,status='loading',message='Checking your account…',revision=0,updatedAt=null,conflict=null,capabilities={},adminAccess={},remoteKnown=false;
  let started=false,ready=false,starting=null,writing=false,authenticating=false,applying=false,dirty=false,debounce,retryTimer,stopped=false,identity=0,storageOK=true,opening=null,sessionRefreshPending=false;
  let current=empty(),base=empty(),listeners=new Set();
  function get(key){try{return storage?.getItem(key)??null;}catch{storageOK=false;return null;}}
  function put(key,value){try{if(!storage)throw new Error();if(value===null)storage.removeItem(key);else storage.setItem(key,JSON.stringify(value));return true;}catch{storageOK=false;return false;}}
  function parsed(key){try{return JSON.parse(get(key)||'null');}catch{return null;}}
  function localState(){const result={};for(const [field,key]of Object.entries(ACCOUNT_KEYS))result[field]=parsed(key);return cleanState(result);}
  function guestState(){return cleanState(parsed(GUEST_KEY)||empty());}
  function snapshot(){return {user:user?{...user}:null,provider,signInUrl,signOutUrl,capabilities:{...capabilities},adminAccess:{...adminAccess},status,message,revision,updatedAt,dirty,storageAvailable:storageOK,conflict:!!conflict,summary:summarizeGarage(user?current:localState()),guestSummary:summarizeGarage(user?guestState():localState()),ready};}
  function announce(){const detail=snapshot();for(const fn of listeners)fn(detail);eventTarget?.dispatchEvent(new CustomEvent('apex:accountchange',{detail}));}
  function setStatus(next,text){status=next;message=text;announce();}
  function cache(){if(user)put(CACHE_KEY,{userId:String(user.id),revision,state:current,base,dirty,updatedAt,remoteKnown,conflict});}
  function project(state,reason,{notify=true}={}){
    applying=true;
    for(const [field,key]of Object.entries(ACCOUNT_KEYS)){
      const oldValue=get(key),value=state[field],newValue=value===null?null:JSON.stringify(value);
      if(newValue===null)put(key,null);else put(key,value);
      if(notify&&oldValue!==newValue){try{eventTarget?.dispatchEvent(new StorageEvent('storage',{key,oldValue,newValue}));}catch{/* Non-browser test environments. */}}
    }
    applying=false;
    if(notify){eventTarget?.dispatchEvent(new CustomEvent('apex:favoriteschange',{detail:{source:'account'}}));eventTarget?.dispatchEvent(new CustomEvent('apex:accountprojection',{detail:{reason}}));}
  }
  function restoreGuest(reason,notify=true){put(OWNER_KEY,null);project(guestState(),reason,{notify});}
  function persistGuest(){if(!get(OWNER_KEY))put(GUEST_KEY,localState());}
  async function request(path,{method='GET',body}={}){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout),requestIdentity=identity;
    try{
      const headers={'Accept':'application/json'};if(body!==undefined)headers['Content-Type']='application/json';if(csrfToken)headers['X-CSRF-Token']=csrfToken;
      const response=await fetchImpl(path,{method,credentials:'same-origin',cache:'no-store',headers,signal:controller.signal,...(body!==undefined?{body:JSON.stringify(body)}:{})});
      let data;try{data=await response.json();}catch{throw Object.assign(new Error('The account service is unavailable. Please try again.'),{status:response.status});}
      if(!response.ok){const error=new Error(apiErrorMessage(data));error.status=response.status;error.data=data;throw error;}
      if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('The account service is unavailable. Please try again.');
      return data;
    }catch(error){if(error.status===401&&requestIdentity===identity&&user&&['/api/auth/session','/api/auth/logout','/api/auth/resend-verification','/api/account/profile','/api/garage','/api/collector/workspace','/api/membership','/api/membership/checkout','/api/membership/portal'].includes(path)){requireGuest('session-expired',{preserveCache:true});ready=true;setStatus('expired','Your session ended. Sign in again to sync.');}if(error.name==='AbortError')throw new Error('The account service took too long to respond. Please try again.');throw error;}
    finally{clearTimeout(timer);}
  }
  function normalizeSession(data){provider=data.provider||'password';signInUrl=data.signInUrl||'';signOutUrl=data.signOutUrl||'';csrfToken=data.csrfToken||null;capabilities=data.capabilities||capabilities;adminAccess=data.adminAccess||{};}
  function requireGuest(reason,{preserveCache=false,notify=true}={}){
    const hadUser=!!user;identity++;user=null;csrfToken=null;dirty=false;conflict=null;current=empty();base=empty();revision=0;updatedAt=null;adminAccess={};remoteKnown=false;opening=null;
    clearTimeout(debounce);clearTimeout(retryTimer);
    if(get(OWNER_KEY))restoreGuest(reason,notify);
    else if(hadUser&&notify)eventTarget?.dispatchEvent(new CustomEvent('apex:accountprojection',{detail:{reason}}));
    if(!preserveCache)put(CACHE_KEY,null);
  }
  async function openSession(data,{initial=false}={}){
    normalizeSession(data);
    if(!data.user){requireGuest('session-ended',{preserveCache:true,notify:!initial});ready=true;setStatus('guest','Guest mode · saved in this browser.');return;}
    persistGuest();const previous=parsed(CACHE_KEY);
    if(get(OWNER_KEY)&&get(OWNER_KEY)!==JSON.stringify(String(data.user.id)))restoreGuest('account-changed',!initial);
    user=data.user;const generation=++identity;ready=false;dirty=false;conflict=null;current=empty();base=empty();remoteKnown=false;
    const load={owned:get(OWNER_KEY)===JSON.stringify(String(user.id)),before:localState(),edited:null};opening=load;
    function applyOpeningEdits(remote){if(!load.owned||!load.edited)return;for(const field of Object.keys(ACCOUNT_KEYS)){if(same(load.before[field],load.edited[field]))continue;if(remote&&!same(load.before[field],remote.state[field])&&!same(load.edited[field],remote.state[field]))conflict=remote;current[field]=copy(load.edited[field]);dirty=true;}}
    // A prior account's data is cleared before any account API can fail.
    if(previous&&String(previous.userId)!==String(user.id))put(CACHE_KEY,null);
    setStatus('syncing','Opening your account garage…');
    try{
      const remote=requireGarageSnapshot(await request('/api/garage'));if(generation!==identity)return;
      if(previous&&String(previous.userId)===String(user.id)&&previous.dirty){
        current=cleanState(previous.state);base=cleanState(previous.base);revision=previous.revision||0;updatedAt=previous.updatedAt||null;dirty=true;
        if(previous.remoteKnown!==true||previous.conflict||remote.revision!==revision)conflict=remote;
      }else{current=cleanState(remote.state);base=copy(current);revision=remote.revision;updatedAt=remote.updatedAt;}
      applyOpeningEdits(remote);remoteKnown=!conflict||previous?.remoteKnown===true;put(OWNER_KEY,String(user.id));project(current,'signed-in',{notify:!initial});cache();ready=true;
      if(conflict)setStatus('conflict','Your account changed on another device. Choose which version to keep.');
      else if(dirty){setStatus('pending','Your changes are waiting to sync.');schedule(0);}
      else setStatus('synced','Your garage is up to date.');
    }catch(error){
      if(generation!==identity)return;ready=true;
      if(error.status===401){requireGuest('session-expired',{preserveCache:true,notify:!initial});setStatus('expired','Your session ended. Sign in again to sync.');return;}
      if(previous&&String(previous.userId)===String(user.id)){
        current=cleanState(previous.state);base=cleanState(previous.base);revision=previous.revision||0;updatedAt=previous.updatedAt||null;dirty=!!previous.dirty;remoteKnown=previous.remoteKnown===true;conflict=validGarageSnapshot(previous.conflict)?previous.conflict:null;applyOpeningEdits();put(OWNER_KEY,String(user.id));project(current,'account-offline',{notify:!initial});cache();
      }else{current=load.owned?cleanState(load.before):empty();applyOpeningEdits();put(OWNER_KEY,String(user.id));project(current,'account-unavailable',{notify:!initial});cache();}
      setStatus('offline','Could not reach your saved garage. '+(previous&&String(previous.userId)===String(user.id)?'Your last account copy is available.':'Retry before making account changes.'));
    }finally{if(opening===load)opening=null;}
  }
  function schedule(delay=650){clearTimeout(debounce);if(!stopped)debounce=setTimeout(()=>void flush(),delay);}
  function changed(){
    if(applying)return;if(!ready){if(!get(OWNER_KEY))persistGuest();else if(opening?.owned&&get(OWNER_KEY)===JSON.stringify(String(user?.id)))opening.edited=localState();return;}
    if(!user){persistGuest();announce();return;}
    if(get(OWNER_KEY)!==JSON.stringify(String(user.id)))return;
    const next=localState();if(same(next,current))return;current=next;dirty=true;cache();
    if(!remoteKnown)setStatus('offline','Changes are saved on this device. Reconnect before choosing how to sync your account garage.');
    else if(conflict)setStatus('conflict','Your account changed on another device. Choose which version to keep.');
    else{setStatus('pending','Saving your changes…');schedule();}
  }
  async function flush(){
    if(!user||!remoteKnown||!dirty||writing||conflict||stopped)return;
    writing=true;const generation=identity,sending=copy(current);setStatus('syncing','Saving your garage…');
    try{
      const result=requireGarageSnapshot(await request('/api/garage',{method:'PUT',body:{state:sending,revision}}));if(generation!==identity)return;
      revision=result.revision;updatedAt=result.updatedAt;base=cleanState(result.state);dirty=!same(current,sending);
      if(!dirty){current=copy(base);if(!same(current,sending))project(current,'account-normalized');}cache();setStatus(dirty?'pending':'synced',dirty?'Saving your latest changes…':'Your garage is up to date.');
      if(dirty)schedule(0);
    }catch(error){
      if(generation!==identity)return;
      if(error.status===409&&validGarageSnapshot(error.data)){
        if(same(cleanState(error.data.state),current)){revision=error.data.revision;updatedAt=error.data.updatedAt;base=copy(current);dirty=false;cache();setStatus('synced','Your garage is up to date.');}
        else{conflict=error.data;cache();setStatus('conflict','Your account changed on another device. Review the two versions in Account.');}
      }
      else if(error.status===401){requireGuest('session-expired',{preserveCache:true});setStatus('expired','Your session ended. Sign in again to sync.');}
      else if(error.status===400||error.status===409||error.status===413){setStatus('error',error.message);}
      else{cache();setStatus('offline','Changes are saved on this device. Waiting for the account service to reconnect.');clearTimeout(retryTimer);retryTimer=setTimeout(()=>void flush(),15000);}
    }finally{writing=false;if(sessionRefreshPending&&!stopped)void retry();else if(generation!==identity&&ready&&dirty&&remoteKnown&&!conflict&&!stopped)schedule(0);}
  }
  async function retry(){
    if(authenticating||writing||stopped)return;sessionRefreshPending=false;
    setStatus('loading','Reconnecting to your account…');
    const generation=identity;try{const data=await request('/api/auth/session');if(generation===identity)await openSession(data);}catch(error){if(generation===identity)setStatus('offline',error.message||'The account service is unavailable. You can keep exploring and try again.');}
  }
  async function authenticate(mode,fields){
    if(authenticating)throw new Error('Please wait for the current request.');
    if(provider==='chatgpt')throw new Error('Use Sign in with ChatGPT to continue.');
    authenticating=true;
    try{
      persistGuest();const data=await request('/api/auth/'+(mode==='signup'?'signup':'login'),{method:'POST',body:fields});
      if(mode==='signup'&&!data.user){normalizeSession(data);ready=true;setStatus('guest',data.message||'If this address can be registered, your account is ready. Sign in to continue.');return snapshot();}
      await openSession(data);
      // Favorites are a shortlist, so merge them at sign-in. Importing builds
      // and learning rewards remains an explicit, independently validated action.
      const guestFavorites=guestState().favorites;
      if(user&&!conflict&&guestFavorites.some(id=>!current.favorites.includes(id))){
        current={...current,favorites:[...new Set([...current.favorites,...guestFavorites])]};dirty=true;project(current,'favorites-merged');cache();await flush();
      }
      return snapshot();
    }
    finally{authenticating=false;if(sessionRefreshPending&&!stopped)void retry();}
  }
  async function logout(){
    if(provider==='chatgpt'){if(signOutUrl)globalThis.location.assign(signOutUrl);return;}
    // Failed logout leaves the account open, so the UI never implies the cookie was cleared.
    changed();await request('/api/auth/logout',{method:'POST',body:{}});requireGuest('signed-out',{preserveCache:dirty});ready=true;setStatus('guest','Signed out. Your guest garage has been restored.');
  }
  async function importGuest(){
    if(!user)throw new Error('Sign in first to import your guest garage.');
    if(conflict)throw new Error('Resolve the sync conflict before importing.');
    current=mergeGuestGarage(current,guestState());dirty=true;project(current,'guest-import');cache();setStatus(remoteKnown?'pending':'offline',remoteKnown?'Saving your imported garage…':'Changes are saved on this device. Reconnect before choosing how to sync your account garage.');await flush();
    return snapshot();
  }
  async function resolveConflict(choice){
    if(!['cloud','local'].includes(choice))throw new Error('Choose the account version or this device’s version.');
    if(!user||!conflict)return;const remote=conflict;conflict=null;remoteKnown=true;revision=remote.revision;updatedAt=remote.updatedAt;base=cleanState(remote.state);
    if(choice==='cloud'){current=copy(base);dirty=false;project(current,'use-cloud');cache();setStatus('synced','The account version is now open on this device.');}
    else if(choice==='local'){dirty=true;cache();await flush();}
    else throw new Error('Choose the account version or this device’s version.');
  }
  async function updateName(name){const generation=identity,result=await request('/api/account/profile',{method:'PUT',body:{name}});if(generation!==identity)return snapshot();user=result.user;adminAccess=result.adminAccess||adminAccess;announce();return snapshot();}
  async function updateLanguage(language){const generation=identity,result=await request('/api/account/profile',{method:'PUT',body:{language}});if(generation!==identity)return snapshot();user=result.user;adminAccess=result.adminAccess||adminAccess;announce();return snapshot();}
  async function getCollectorWorkspace(){return request('/api/collector/workspace');}
  async function saveCollectorWorkspace(revision,state){return request('/api/collector/workspace',{method:'PUT',body:{revision,state}});}
  async function getMembership(){return request('/api/membership');}
  async function startMembershipCheckout(interval){return request('/api/membership/checkout',{method:'POST',body:{interval}});}
  async function openMembershipPortal(){return request('/api/membership/portal',{method:'POST',body:{}});}
  async function forgotPassword(email,language){return request('/api/auth/forgot-password',{method:'POST',body:{email,language}});}
  async function resetPassword(token,password){const result=await request('/api/auth/reset-password',{method:'POST',body:{token,password}});requireGuest('password-reset');setStatus('guest',result.message||'Your password has been reset. Sign in with your new password.');return result;}
  async function verifyEmail(token){const result=await request('/api/auth/verify-email',{method:'POST',body:{token}});if(user)await retry();return result;}
  async function resendVerification(language){return request('/api/auth/resend-verification',{method:'POST',body:{language}});}
  function refreshStorageSession(){
    // Invalidate in-flight responses immediately. A busy writer must not apply
    // its old account snapshot over another tab's newly opened projection.
    const invalidate=!sessionRefreshPending;sessionRefreshPending=true;
    if(invalidate){identity++;opening=null;ready=false;setStatus('loading','Checking the account opened in another tab…');}
    clearTimeout(debounce);clearTimeout(retryTimer);
    if(!authenticating&&!writing&&!stopped)void retry();
  }
  function handleStorage(event){
    if(applying)return;
    if(event.key===null||event.key===OWNER_KEY){refreshStorageSession();return;}
    if(event.key===OWNER_KEY||event.key===CACHE_KEY){
      // Another tab can change the authenticated browser session. Verify the
      // session instead of ever uploading a projection under the wrong user.
      const owner=get(OWNER_KEY);if(!ready||user&&owner!==JSON.stringify(String(user.id))||!user&&owner){refreshStorageSession();return;}
      if(event.key===CACHE_KEY&&user){const latest=parsed(CACHE_KEY);if(latest&&String(latest.userId)===String(user.id)){current=cleanState(latest.state);base=cleanState(latest.base);revision=latest.revision;dirty=!!latest.dirty;remoteKnown=latest.remoteKnown===true;conflict=validGarageSnapshot(latest.conflict)?latest.conflict:null;updatedAt=latest.updatedAt;announce();if(dirty&&!conflict&&remoteKnown)schedule();}}
      return;
    }
    if(!ready)return;
    if(Object.values(ACCOUNT_KEYS).includes(event.key))changed();
  }
  const localEvents=['apex:localchange','apex:favoriteschange','apex:garagechange','apex:progress'];
  function online(){if(user&&dirty&&!conflict&&remoteKnown)void flush();else if(status==='offline')void retry();}
  function pageHidden(){if(globalThis.document?.visibilityState==='hidden'){changed();void flush();}}
  async function start(){
    if(starting)return starting;if(started)return snapshot();started=true;
    localEvents.forEach(event=>eventTarget?.addEventListener(event,changed));eventTarget?.addEventListener('storage',handleStorage);eventTarget?.addEventListener('online',online);globalThis.document?.addEventListener('visibilitychange',pageHidden);
    const generation=identity;starting=(async()=>{try{const data=await request('/api/auth/session');if(generation===identity)await openSession(data,{initial:true});}catch(error){if(generation===identity){requireGuest('account-unavailable',{preserveCache:true,notify:false});ready=true;setStatus('offline',error.message||'Account service unavailable. Exploring as a guest; your guest data stays in this browser.');}}return snapshot();})();
    return starting;
  }
  return {start,retry,login:fields=>authenticate('login',fields),signup:fields=>authenticate('signup',fields),logout,importGuest,resolveConflict,updateName,updateLanguage,forgotPassword,resetPassword,verifyEmail,resendVerification,getCollectorWorkspace,saveCollectorWorkspace,getMembership,startMembershipCheckout,openMembershipPortal,flush,getSnapshot:snapshot,subscribe(fn){listeners.add(fn);fn(snapshot());return()=>listeners.delete(fn);},destroy(){stopped=true;identity++;clearTimeout(debounce);clearTimeout(retryTimer);localEvents.forEach(event=>eventTarget?.removeEventListener(event,changed));eventTarget?.removeEventListener('storage',handleStorage);eventTarget?.removeEventListener('online',online);globalThis.document?.removeEventListener('visibilitychange',pageHidden);listeners.clear();}};
}
export const account = createAccountController();
