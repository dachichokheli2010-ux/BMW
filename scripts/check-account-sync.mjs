import assert from 'node:assert/strict';
import {createAccountController,ACCOUNT_KEYS,mergeGuestGarage} from '../public/account-sync.js';

const clone=value=>structuredClone(value),blank=()=>({favorites:[],builds:[],academy:null,legacyProgress:{}});
class MemoryStorage {map=new Map();getItem(key){return this.map.get(key)??null;}setItem(key,value){this.map.set(key,String(value));}removeItem(key){this.map.delete(key);}}
const alice={id:'alice',name:'Alice',email:'alice@example.com'},bob={id:'bob',name:'Bob',email:'bob@example.com'};
function harness(){
  const storage=new MemoryStorage(),events=new EventTarget(),garages=new Map([[alice.id,{state:{...blank(),favorites:['alice-car']},revision:0,updatedAt:null}],[bob.id,{state:blank(),revision:0,updatedAt:null}]]);
  let signedIn=null,offline=false,writes=0,sessionFailure=null,garageUnavailable=false,garageGate=null,garageReply,protectedFailure=null;
  const fetchImpl=async(path,options={})=>{
    if(offline)throw new Error('Offline');
    const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
    if(protectedFailure?.path===path)return new Response(protectedFailure.body,{status:protectedFailure.status});
    if(path==='/api/auth/session'&&sessionFailure)return json({error:sessionFailure.message},sessionFailure.status);
    if(path==='/api/auth/session')return json({user:signedIn,provider:'password',csrfToken:signedIn?'csrf-'+signedIn.id:null});
    if(path==='/api/auth/signup')return json({user:null,csrfToken:null,provider:'password',code:'SIGNUP_ACCEPTED',message:'If this address can be registered, your account is ready. Sign in to continue.'},201);
    if(path==='/api/auth/login'){signedIn=JSON.parse(options.body).email===bob.email?bob:alice;return json({user:signedIn,csrfToken:'csrf-'+signedIn.id});}
    if(!signedIn)return json({error:'Sign in required.'},401);
    if(options.method&&options.method!=='GET'&&options.headers['X-CSRF-Token']!=='csrf-'+signedIn.id)return json({error:'Invalid CSRF.'},403);
    if(path==='/api/auth/logout'){signedIn=null;return json({user:null});}
    if(path==='/api/garage'){
      if(garageGate&&options.method!=='PUT')await garageGate;
      if(garageReply!==undefined)return json(garageReply);
      if(garageUnavailable&&options.method!=='PUT')return json({error:{message:'Garage database temporarily unavailable.'}},503);
      const garage=garages.get(signedIn.id);
      if(options.method==='PUT'){writes++;const data=JSON.parse(options.body);if(data.revision!==garage.revision)return json({...garage,error:'Conflict.'},409);garage.state=data.state;garage.revision++;garage.updatedAt='2026-10-18T12:00:00.000Z';}
      return json(clone(garage));
    }
    throw new Error('Unknown endpoint: '+path);
  };
  const controller=createAccountController({fetchImpl,storage,eventTarget:events});
  function change(field,value){storage.setItem(ACCOUNT_KEYS[field],JSON.stringify(value));events.dispatchEvent(new CustomEvent('apex:localchange',{detail:{key:ACCOUNT_KEYS[field]}}));}
  return {storage,events,garages,controller,fetchImpl,change,setUser(value){signedIn=value;},setOffline(value){offline=value;},setSessionFailure(value){sessionFailure=value;},setGarageUnavailable(value){garageUnavailable=value;},setGarageGate(value){garageGate=value;},setGarageReply(value){garageReply=value;},setProtectedFailure(value){protectedFailure=value;},get writes(){return writes;}};
}
function read(h,field){return JSON.parse(h.storage.getItem(ACCOUNT_KEYS[field])||'null');}
let checks=0;const check=(actual,expected)=>{assert.deepEqual(actual,expected);checks++;};

const h=harness();
try{
  const guestBuild={id:'guest-build',name:'Guest configuration',modelId:'f80'};
  h.storage.setItem(ACCOUNT_KEYS.favorites,JSON.stringify(['guest-car']));
  h.storage.setItem(ACCOUNT_KEYS.builds,JSON.stringify([guestBuild]));
  await h.controller.start();check(h.controller.getSnapshot().status,'guest');
  await h.controller.login({email:alice.email,password:'long password'});
  // Guest favorites are intentionally a sign-in shortlist merge. Builds and
  // learning data require the separate explicit import action.
  check(read(h,'favorites'),['alice-car','guest-car']);check(h.writes,1);check(h.controller.getSnapshot().guestSummary.favorites,1);
  check(read(h,'builds'),[]);check(h.garages.get(alice.id).state.builds,[]);check(h.controller.getSnapshot().guestSummary.builds,1);
  await h.controller.importGuest();check(read(h,'favorites'),['alice-car','guest-car']);check(h.garages.get(alice.id).state.favorites,['alice-car','guest-car']);
  check(h.garages.get(alice.id).state.builds,[guestBuild]);
  await h.controller.logout();check(read(h,'favorites'),['guest-car']);check(h.storage.getItem('apex-account-cache-v1'),null);
  await h.controller.login({email:bob.email,password:'long password'});check(read(h,'favorites'),['guest-car']);check(h.writes,3);
  check(read(h,'builds'),[]);check(h.garages.get(bob.id).state.builds,[]);check(h.garages.get(alice.id).state.builds,[guestBuild]);
  h.change('favorites',['bob-car']);await h.controller.flush();check(h.garages.get(bob.id).state.favorites,['bob-car']);check(h.garages.get(alice.id).state.favorites,['alice-car','guest-car']);
  // Optimistic concurrency never silently replaces the other device's copy.
  h.garages.get(bob.id).state.favorites=['other-device'];h.garages.get(bob.id).revision++;
  h.change('favorites',['this-device']);await h.controller.flush();check(h.controller.getSnapshot().status,'conflict');check(h.garages.get(bob.id).state.favorites,['other-device']);
  await assert.rejects(()=>h.controller.resolveConflict('invalid'),/Choose the account version/);check(h.controller.getSnapshot().conflict,true);
  await h.controller.resolveConflict('cloud');check(read(h,'favorites'),['other-device']);
  h.garages.get(bob.id).revision++;h.change('favorites',['explicit-local']);await h.controller.flush();await h.controller.resolveConflict('local');check(h.garages.get(bob.id).state.favorites,['explicit-local']);
  // Offline edits persist, and restore to the same authenticated account.
  h.setOffline(true);h.change('favorites',['offline-edit']);await h.controller.flush();check(h.controller.getSnapshot().status,'offline');check(h.controller.getSnapshot().dirty,true);
  h.setOffline(false);await h.controller.retry();await h.controller.flush();check(h.garages.get(bob.id).state.favorites,['offline-edit']);check(h.controller.getSnapshot().dirty,false);
  // A cookie/session change in another tab cannot upload the old projection.
  const bobWrites=h.writes;h.setUser(alice);h.storage.setItem('apex-garage-owner-v1',JSON.stringify(alice.id));h.storage.setItem(ACCOUNT_KEYS.favorites,JSON.stringify(['alice-car']));
  const storageEvent=new Event('storage');Object.assign(storageEvent,{key:ACCOUNT_KEYS.favorites});h.events.dispatchEvent(storageEvent);
  await h.controller.flush();check(h.writes,bobWrites);check(h.garages.get(bob.id).state.favorites,['offline-edit']);
  // Verify the session before reopening the new account's projection.
  await h.controller.retry();check(h.controller.getSnapshot().user.id,alice.id);check(read(h,'favorites'),['alice-car','guest-car']);
}finally{h.controller.destroy();}

const registration=harness();
try{
  registration.storage.setItem(ACCOUNT_KEYS.favorites,JSON.stringify(['guest-shortlist']));await registration.controller.start();
  const accepted=await registration.controller.signup({email:'new@example.com',name:'New driver',password:'a long new password'});
  check(accepted.status,'guest');check(accepted.user,null);check(registration.writes,0);check(read(registration,'favorites'),['guest-shortlist']);
}finally{registration.controller.destroy();}

// Expired sessions restore guest data but retain an isolated pending account copy.
const expired=harness();
try{
  expired.storage.setItem(ACCOUNT_KEYS.favorites,JSON.stringify(['guest']));await expired.controller.start();await expired.controller.login({email:alice.email,password:'long password'});
  expired.change('favorites',['unsynced-private']);expired.setUser(null);await expired.controller.flush();
  check(expired.controller.getSnapshot().status,'expired');check(read(expired,'favorites'),['guest']);check(JSON.parse(expired.storage.getItem('apex-account-cache-v1')).state.favorites,['unsynced-private']);
  await expired.controller.login({email:alice.email,password:'long password'});await expired.controller.flush();check(expired.garages.get(alice.id).state.favorites,['unsynced-private','guest']);
  const recoveredWrites=expired.writes;await expired.controller.login({email:alice.email,password:'long password'});check(expired.writes,recoveredWrites);check(read(expired,'favorites'),['unsynced-private','guest']);
}finally{expired.controller.destroy();}

const unavailable=harness();
try{
  unavailable.storage.setItem(ACCOUNT_KEYS.favorites,JSON.stringify(['guest-favorite']));
  unavailable.setSessionFailure({status:503,message:'Connect a Neon database to enable sign-in.'});
  const state=await unavailable.controller.start();
  check(state.status,'offline');check(state.user,null);check(state.message,'Connect a Neon database to enable sign-in.');
  check(read(unavailable,'favorites'),['guest-favorite']);
}finally{unavailable.controller.destroy();}

// A failed initial GET must never turn an unknown revision-zero cloud garage
// into an empty local baseline that silently overwrites existing builds.
const unknownGarage=harness();
try{
  unknownGarage.setUser(alice);unknownGarage.setGarageUnavailable(true);
  unknownGarage.garages.get(alice.id).state.builds=[{id:'cloud-build',name:'Keep this build'}];
  await unknownGarage.controller.start();check(unknownGarage.controller.getSnapshot().status,'offline');
  unknownGarage.change('favorites',['offline-new-favorite']);await unknownGarage.controller.flush();
  check(unknownGarage.writes,0);check(unknownGarage.controller.getSnapshot().dirty,true);
  unknownGarage.setGarageUnavailable(false);await unknownGarage.controller.retry();await unknownGarage.controller.flush();
  check(unknownGarage.controller.getSnapshot().conflict,true);check(unknownGarage.writes,0);
  check(JSON.parse(unknownGarage.storage.getItem('apex-account-cache-v1')).remoteKnown,false);
  check(unknownGarage.garages.get(alice.id).state.builds,[{id:'cloud-build',name:'Keep this build'}]);
  await unknownGarage.controller.resolveConflict('cloud');check(read(unknownGarage,'builds'),[{id:'cloud-build',name:'Keep this build'}]);
}finally{unknownGarage.controller.destroy();}

const pendingLogout=harness();
try{
  await pendingLogout.controller.start();await pendingLogout.controller.login({email:alice.email,password:'long password'});
  pendingLogout.change('favorites',['unsynced-before-logout']);await pendingLogout.controller.logout();
  check(JSON.parse(pendingLogout.storage.getItem('apex-account-cache-v1')).dirty,true);
  await pendingLogout.controller.login({email:alice.email,password:'long password'});await pendingLogout.controller.flush();check(pendingLogout.garages.get(alice.id).state.favorites,['unsynced-before-logout']);
}finally{pendingLogout.controller.destroy();}

for(const conflict of [false,true]){
 const delayed=harness();
 try{
  await delayed.controller.start();await delayed.controller.login({email:alice.email,password:'long password'});
  let release;delayed.setGarageGate(new Promise(resolve=>release=resolve));const reconnect=delayed.controller.retry();await new Promise(resolve=>setTimeout(resolve,0));
  delayed.change('favorites',['clicked-during-reconnect']);if(conflict){delayed.garages.get(alice.id).state.favorites=['other-device'];delayed.garages.get(alice.id).revision++;}
  release();await reconnect;check(read(delayed,'favorites'),['clicked-during-reconnect']);check(delayed.controller.getSnapshot().dirty,true);check(delayed.controller.getSnapshot().conflict,conflict);
  if(!conflict){await delayed.controller.flush();check(delayed.garages.get(alice.id).state.favorites,['clicked-during-reconnect']);}
 }finally{delayed.controller.destroy();}
}

const malformed=harness();
try{
 await malformed.controller.start();await malformed.controller.login({email:alice.email,password:'long password'});malformed.setGarageReply({});await malformed.controller.retry();check(read(malformed,'favorites'),['alice-car']);check(malformed.controller.getSnapshot().status,'offline');
 malformed.change('favorites',['keep-pending']);await malformed.controller.flush();check(malformed.controller.getSnapshot().dirty,true);check(malformed.garages.get(alice.id).state.favorites,['alice-car']);
}finally{malformed.controller.destroy();}

const expiredProfile=harness();
try{
 expiredProfile.storage.setItem(ACCOUNT_KEYS.favorites,JSON.stringify(['guest']));await expiredProfile.controller.start();await expiredProfile.controller.login({email:alice.email,password:'long password'});expiredProfile.change('favorites',['private-unsynced']);
 expiredProfile.setProtectedFailure({path:'/api/account/profile',body:'Session expired',status:401});await assert.rejects(()=>expiredProfile.controller.updateName('New name'));
 check(expiredProfile.controller.getSnapshot().status,'expired');check(expiredProfile.controller.getSnapshot().user,null);check(read(expiredProfile,'favorites'),['guest']);check(JSON.parse(expiredProfile.storage.getItem('apex-account-cache-v1')).state.favorites,['private-unsynced']);
}finally{expiredProfile.controller.destroy();}

for(const [payload,expected]of [[{error:{message:'Database temporarily unavailable.'}},'Database temporarily unavailable.'],[{error:{code:'OFFLINE'}},'This request could not be completed. Please try again.'],[null,'This request could not be completed. Please try again.']]){
  const controller=createAccountController({storage:new MemoryStorage(),eventTarget:new EventTarget(),fetchImpl:async()=>new Response(JSON.stringify(payload),{status:503})});
  try{await assert.rejects(()=>controller.login({email:alice.email,password:'long password'}),error=>error.message===expected);checks++;}finally{controller.destroy();}
}

// Account progress is combined conservatively; repeated imports cannot farm XP.
const academy=(xp,id)=>({version:2,xp,credits:5,completed:{[id]:{day:'2026-10-18',accuracy:100}},attempts:{},review:{},days:['2026-10-18'],awards:['lesson:'+id],unlocked:[],activity:[]});
const merged=mergeGuestGarage({...blank(),academy:academy(50,'a')},{...blank(),academy:academy(40,'b')});
check(merged.academy.xp,50);check(Object.keys(merged.academy.completed),['b','a']);check(mergeGuestGarage(merged,{...blank(),academy:academy(40,'b')}).academy.xp,50);
const progressMerge=mergeGuestGarage({...blank(),academy:{...academy(50,'a'),selectedPath:'engines',achievements:{'first-ignition':{day:null},'seven-day-driver':{day:'2026-10-17'}}}},{...blank(),academy:{...academy(40,'b'),selectedPath:'models',achievements:{'first-ignition':{day:'2026-10-15'},'seven-day-driver':{day:'2026-10-18'}}}});
check(progressMerge.academy.selectedPath,'engines');
check(progressMerge.academy.achievements,{'first-ignition':{day:'2026-10-15'},'seven-day-driver':{day:'2026-10-17'}});
check(mergeGuestGarage(progressMerge,{...blank(),academy:progressMerge.academy}).academy.achievements,progressMerge.academy.achievements);
console.log(`Account synchronization: ${checks} checks passed.`);
