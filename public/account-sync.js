// The four existing browser stores are a projection of either the guest garage
// or the verified current account. Authentication tokens never go in storage.
export const ACCOUNT_KEYS = Object.freeze({favorites:'apex-favorites',builds:'apex-garage-builds-v1',academy:'bmw-academy-state-v2',legacyProgress:'bmw-academy-progress-v1'});
const GUEST_KEY = 'apex-guest-garage-v1', CACHE_KEY = 'apex-account-cache-v1', OWNER_KEY = 'apex-garage-owner-v1';
const empty = () => ({favorites:[],builds:[],academy:null,legacyProgress:{}});
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const copy = value => JSON.parse(JSON.stringify(value));
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
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
  if(snapshot.status==='synced')return 'Saved to your APEX account. Changes sync across your devices.';
  if(snapshot.status==='pending'||snapshot.status==='syncing')return 'Saving to your APEX account. A copy stays on this browser.';
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
    for(const [id,attempt] of Object.entries(b.attempts||{}))if(a.attempts?.[id])academy.attempts[id]={...a.attempts[id],right:Math.max(Number(a.attempts[id].right)||0,Number(attempt.right)||0),total:Math.max(Number(a.attempts[id].total)||0,Number(attempt.total)||0)};
  }
  const builds=[...new Map([...current.builds,...guest.builds].map(build=>[build.id,build])).values()].slice(0,20);
  // Prefer account builds when an imported snapshot has the same identifier.
  for(let i=0;i<builds.length;i++)builds[i]=current.builds.find(build=>build.id===builds[i].id)||builds[i];
  return cleanState({favorites:[...current.favorites,...guest.favorites],builds,academy,legacyProgress:{...guest.legacyProgress,...current.legacyProgress}});
}

export function createAccountController({fetchImpl=(...args)=>fetch(...args),storage,eventTarget=globalThis.window,timeout=5000}={}) {
  if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}
  let user=null,provider='password',signInUrl='',signOutUrl='',csrfToken=null,status='loading',message='Checking your account…',revision=0,updatedAt=null,conflict=null;
  let started=false,ready=false,starting=null,writing=false,authenticating=false,applying=false,dirty=false,debounce,retryTimer,stopped=false,identity=0,storageOK=true;
  let current=empty(),base=empty(),listeners=new Set();
  function get(key){try{return storage?.getItem(key)??null;}catch{storageOK=false;return null;}}
  function put(key,value){try{if(!storage)throw new Error();if(value===null)storage.removeItem(key);else storage.setItem(key,JSON.stringify(value));return true;}catch{storageOK=false;return false;}}
  function parsed(key){try{return JSON.parse(get(key)||'null');}catch{return null;}}
  function localState(){const result={};for(const [field,key]of Object.entries(ACCOUNT_KEYS))result[field]=parsed(key);return cleanState(result);}
  function guestState(){return cleanState(parsed(GUEST_KEY)||empty());}
  function snapshot(){return {user:user?{...user}:null,provider,signInUrl,signOutUrl,status,message,revision,updatedAt,dirty,storageAvailable:storageOK,conflict:!!conflict,summary:summarizeGarage(user?current:localState()),guestSummary:summarizeGarage(user?guestState():localState()),ready};}
  function announce(){const detail=snapshot();for(const fn of listeners)fn(detail);eventTarget?.dispatchEvent(new CustomEvent('apex:accountchange',{detail}));}
  function setStatus(next,text){status=next;message=text;announce();}
  function cache(){if(user)put(CACHE_KEY,{userId:String(user.id),revision,state:current,base,dirty,updatedAt});}
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
  function restoreGuest(reason,notify=true){project(guestState(),reason,{notify});put(OWNER_KEY,null);}
  function persistGuest(){if(!get(OWNER_KEY))put(GUEST_KEY,localState());}
  async function request(path,{method='GET',body}={}){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
    try{
      const headers={'Accept':'application/json'};if(body!==undefined)headers['Content-Type']='application/json';if(csrfToken)headers['X-CSRF-Token']=csrfToken;
      const response=await fetchImpl(path,{method,credentials:'same-origin',cache:'no-store',headers,signal:controller.signal,...(body!==undefined?{body:JSON.stringify(body)}:{})});
      let data;try{data=await response.json();}catch{throw new Error('The account service is unavailable. Please try again.');}
      if(!response.ok){const error=new Error(data.error||'Your request could not be completed.');error.status=response.status;error.data=data;throw error;}
      return data;
    }catch(error){if(error.name==='AbortError')throw new Error('The account service took too long to respond. Please try again.');throw error;}
    finally{clearTimeout(timer);}
  }
  function normalizeSession(data){provider=data.provider||'password';signInUrl=data.signInUrl||'';signOutUrl=data.signOutUrl||'';csrfToken=data.csrfToken||null;}
  function requireGuest(reason,{preserveCache=false,notify=true}={}){
    const hadUser=!!user;identity++;user=null;csrfToken=null;dirty=false;conflict=null;current=empty();base=empty();revision=0;updatedAt=null;
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
    user=data.user;const generation=++identity;dirty=false;conflict=null;current=empty();base=empty();
    // A prior account's data is cleared before any account API can fail.
    if(previous&&String(previous.userId)!==String(user.id))put(CACHE_KEY,null);
    setStatus('syncing','Opening your account garage…');
    try{
      const remote=await request('/api/garage');if(generation!==identity)return;
      if(previous&&String(previous.userId)===String(user.id)&&previous.dirty){
        current=cleanState(previous.state);base=cleanState(previous.base);revision=previous.revision||0;updatedAt=previous.updatedAt||null;dirty=true;
        if(remote.revision!==revision)conflict=remote;
      }else{current=cleanState(remote.state);base=copy(current);revision=remote.revision;updatedAt=remote.updatedAt;}
      put(OWNER_KEY,String(user.id));project(current,'signed-in',{notify:!initial});cache();ready=true;
      if(conflict)setStatus('conflict','Your account changed on another device. Choose which version to keep.');
      else if(dirty){setStatus('pending','Your changes are waiting to sync.');schedule(0);}
      else setStatus('synced','Your garage is up to date.');
    }catch(error){
      if(generation!==identity)return;ready=true;
      if(error.status===401){requireGuest('session-expired',{preserveCache:true,notify:!initial});setStatus('expired','Your session ended. Sign in again to sync.');return;}
      if(previous&&String(previous.userId)===String(user.id)){
        current=cleanState(previous.state);base=cleanState(previous.base);revision=previous.revision||0;updatedAt=previous.updatedAt||null;dirty=!!previous.dirty;put(OWNER_KEY,String(user.id));project(current,'account-offline',{notify:!initial});cache();
      }else{current=empty();put(OWNER_KEY,String(user.id));project(current,'account-unavailable',{notify:!initial});}
      setStatus('offline','Could not reach your saved garage. '+(previous&&String(previous.userId)===String(user.id)?'Your last account copy is available.':'Retry before making account changes.'));
    }
  }
  function schedule(delay=650){clearTimeout(debounce);if(!stopped)debounce=setTimeout(()=>void flush(),delay);}
  function changed(){
    if(applying||!ready)return;
    if(!user){persistGuest();announce();return;}
    if(get(OWNER_KEY)!==JSON.stringify(String(user.id)))return;
    const next=localState();if(same(next,current))return;current=next;dirty=true;cache();
    if(conflict)setStatus('conflict','Your account changed on another device. Choose which version to keep.');
    else{setStatus('pending','Saving your changes…');schedule();}
  }
  async function flush(){
    if(!user||!dirty||writing||conflict||stopped)return;
    writing=true;const generation=identity,sending=copy(current);setStatus('syncing','Saving your garage…');
    try{
      const result=await request('/api/garage',{method:'PUT',body:{state:sending,revision}});if(generation!==identity)return;
      revision=result.revision;updatedAt=result.updatedAt;base=cleanState(result.state);dirty=!same(current,sending);
      if(!dirty){current=copy(base);if(!same(current,sending))project(current,'account-normalized');}cache();setStatus(dirty?'pending':'synced',dirty?'Saving your latest changes…':'Your garage is up to date.');
      if(dirty)schedule(0);
    }catch(error){
      if(generation!==identity)return;
      if(error.status===409){
        if(same(cleanState(error.data.state),current)){revision=error.data.revision;updatedAt=error.data.updatedAt;base=copy(current);dirty=false;cache();setStatus('synced','Your garage is up to date.');}
        else{conflict=error.data;cache();setStatus('conflict','Your account changed on another device. Review the two versions in Account.');}
      }
      else if(error.status===401){requireGuest('session-expired',{preserveCache:true});setStatus('expired','Your session ended. Sign in again to sync.');}
      else if(error.status===400||error.status===413){setStatus('error',error.message);}
      else{cache();setStatus('offline','Changes are saved on this device. Waiting for the account service to reconnect.');clearTimeout(retryTimer);retryTimer=setTimeout(()=>void flush(),15000);}
    }finally{writing=false;}
  }
  async function retry(){
    if(authenticating||writing)return;
    setStatus('loading','Reconnecting to your account…');
    try{const data=await request('/api/auth/session');await openSession(data);}catch{setStatus('offline','The account service is unavailable. You can keep exploring and try again.');}
  }
  async function authenticate(mode,fields){
    if(authenticating)throw new Error('Please wait for the current request.');
    if(provider==='chatgpt')throw new Error('Use Sign in with ChatGPT to continue.');
    authenticating=true;
    try{persistGuest();const data=await request('/api/auth/'+(mode==='signup'?'signup':'login'),{method:'POST',body:fields});await openSession(data);return snapshot();}
    finally{authenticating=false;}
  }
  async function logout(){
    if(provider==='chatgpt'){if(signOutUrl)globalThis.location.assign(signOutUrl);return;}
    // Failed logout leaves the account open, so the UI never implies the cookie was cleared.
    await request('/api/auth/logout',{method:'POST',body:{}});requireGuest('signed-out');ready=true;setStatus('guest','Signed out. Your guest garage has been restored.');
  }
  async function importGuest(){
    if(!user)throw new Error('Sign in first to import your guest garage.');
    if(conflict)throw new Error('Resolve the sync conflict before importing.');
    current=mergeGuestGarage(current,guestState());dirty=true;project(current,'guest-import');cache();setStatus('pending','Saving your imported garage…');await flush();
    return snapshot();
  }
  async function resolveConflict(choice){
    if(!user||!conflict)return;const remote=conflict;conflict=null;revision=remote.revision;updatedAt=remote.updatedAt;base=cleanState(remote.state);
    if(choice==='cloud'){current=copy(base);dirty=false;project(current,'use-cloud');cache();setStatus('synced','The account version is now open on this device.');}
    else if(choice==='local'){dirty=true;cache();await flush();}
    else throw new Error('Choose the account version or this device’s version.');
  }
  async function updateName(name){const result=await request('/api/account/profile',{method:'PUT',body:{name}});user=result.user;announce();return snapshot();}
  function handleStorage(event){
    if(applying||!ready)return;
    if(event.key===OWNER_KEY||event.key===CACHE_KEY){
      // Another tab can change the authenticated browser session. Verify the
      // session instead of ever uploading a projection under the wrong user.
      const owner=get(OWNER_KEY);if(user&&owner!==JSON.stringify(String(user.id))||!user&&owner){void retry();return;}
      if(event.key===CACHE_KEY&&user){const latest=parsed(CACHE_KEY);if(latest&&String(latest.userId)===String(user.id)){current=cleanState(latest.state);base=cleanState(latest.base);revision=latest.revision;dirty=!!latest.dirty;updatedAt=latest.updatedAt;announce();if(dirty&&!conflict)schedule();}}
      return;
    }
    if(Object.values(ACCOUNT_KEYS).includes(event.key))changed();
  }
  const localEvents=['apex:localchange','apex:favoriteschange','apex:garagechange','apex:progress'];
  function online(){if(user&&dirty&&!conflict)void flush();else if(status==='offline')void retry();}
  function pageHidden(){if(globalThis.document?.visibilityState==='hidden'){changed();void flush();}}
  async function start(){
    if(starting)return starting;if(started)return snapshot();started=true;
    localEvents.forEach(event=>eventTarget?.addEventListener(event,changed));eventTarget?.addEventListener('storage',handleStorage);eventTarget?.addEventListener('online',online);globalThis.document?.addEventListener('visibilitychange',pageHidden);
    starting=(async()=>{try{const data=await request('/api/auth/session');await openSession(data,{initial:true});}catch{requireGuest('account-unavailable',{preserveCache:true,notify:false});ready=true;setStatus('offline','Account service unavailable. Exploring as a guest; your guest data stays in this browser.');}return snapshot();})();
    return starting;
  }
  return {start,retry,login:fields=>authenticate('login',fields),signup:fields=>authenticate('signup',fields),logout,importGuest,resolveConflict,updateName,flush,getSnapshot:snapshot,subscribe(fn){listeners.add(fn);fn(snapshot());return()=>listeners.delete(fn);},destroy(){stopped=true;identity++;clearTimeout(debounce);clearTimeout(retryTimer);localEvents.forEach(event=>eventTarget?.removeEventListener(event,changed));eventTarget?.removeEventListener('storage',handleStorage);eventTarget?.removeEventListener('online',online);globalThis.document?.removeEventListener('visibilitychange',pageHidden);listeners.clear();}};
}
export const account = createAccountController();
