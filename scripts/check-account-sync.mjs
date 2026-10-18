import assert from 'node:assert/strict';
import {createAccountController,ACCOUNT_KEYS,mergeGuestGarage} from '../public/account-sync.js';

const clone=value=>structuredClone(value),blank=()=>({favorites:[],builds:[],academy:null,legacyProgress:{}});
class MemoryStorage {map=new Map();getItem(key){return this.map.get(key)??null;}setItem(key,value){this.map.set(key,String(value));}removeItem(key){this.map.delete(key);}}
const alice={id:'alice',name:'Alice',email:'alice@example.com'},bob={id:'bob',name:'Bob',email:'bob@example.com'};
function harness(){
  const storage=new MemoryStorage(),events=new EventTarget(),garages=new Map([[alice.id,{state:{...blank(),favorites:['alice-car']},revision:0,updatedAt:null}],[bob.id,{state:blank(),revision:0,updatedAt:null}]]);
  let signedIn=null,offline=false,writes=0;
  const fetchImpl=async(path,options={})=>{
    if(offline)throw new Error('Offline');
    const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
    if(path==='/api/auth/session')return json({user:signedIn,provider:'password',csrfToken:signedIn?'csrf-'+signedIn.id:null});
    if(path==='/api/auth/login'||path==='/api/auth/signup'){signedIn=JSON.parse(options.body).email===bob.email?bob:alice;return json({user:signedIn,csrfToken:'csrf-'+signedIn.id});}
    if(!signedIn)return json({error:'Sign in required.'},401);
    if(options.method&&options.method!=='GET'&&options.headers['X-CSRF-Token']!=='csrf-'+signedIn.id)return json({error:'Invalid CSRF.'},403);
    if(path==='/api/auth/logout'){signedIn=null;return json({user:null});}
    if(path==='/api/garage'){
      const garage=garages.get(signedIn.id);
      if(options.method==='PUT'){writes++;const data=JSON.parse(options.body);if(data.revision!==garage.revision)return json({...garage,error:'Conflict.'},409);garage.state=data.state;garage.revision++;garage.updatedAt='2026-10-18T12:00:00.000Z';}
      return json(clone(garage));
    }
    throw new Error('Unknown endpoint: '+path);
  };
  const controller=createAccountController({fetchImpl,storage,eventTarget:events});
  function change(field,value){storage.setItem(ACCOUNT_KEYS[field],JSON.stringify(value));events.dispatchEvent(new CustomEvent('apex:localchange',{detail:{key:ACCOUNT_KEYS[field]}}));}
  return {storage,events,garages,controller,fetchImpl,change,setUser(value){signedIn=value;},setOffline(value){offline=value;},get writes(){return writes;}};
}
function read(h,field){return JSON.parse(h.storage.getItem(ACCOUNT_KEYS[field])||'null');}
let checks=0;const check=(actual,expected)=>{assert.deepEqual(actual,expected);checks++;};

const h=harness();
try{
  h.storage.setItem(ACCOUNT_KEYS.favorites,JSON.stringify(['guest-car']));
  await h.controller.start();check(h.controller.getSnapshot().status,'guest');
  await h.controller.login({email:alice.email,password:'long password'});
  check(read(h,'favorites'),['alice-car']);check(h.writes,0);check(h.controller.getSnapshot().guestSummary.favorites,1);
  await h.controller.importGuest();check(read(h,'favorites'),['alice-car','guest-car']);check(h.garages.get(alice.id).state.favorites,['alice-car','guest-car']);
  await h.controller.logout();check(read(h,'favorites'),['guest-car']);check(h.storage.getItem('apex-account-cache-v1'),null);
  await h.controller.login({email:bob.email,password:'long password'});check(read(h,'favorites'),[]);check(h.writes,1);
  h.change('favorites',['bob-car']);await h.controller.flush();check(h.garages.get(bob.id).state.favorites,['bob-car']);check(h.garages.get(alice.id).state.favorites,['alice-car','guest-car']);
  // Optimistic concurrency never silently replaces the other device's copy.
  h.garages.get(bob.id).state.favorites=['other-device'];h.garages.get(bob.id).revision++;
  h.change('favorites',['this-device']);await h.controller.flush();check(h.controller.getSnapshot().status,'conflict');check(h.garages.get(bob.id).state.favorites,['other-device']);
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

// Expired sessions restore guest data but retain an isolated pending account copy.
const expired=harness();
try{
  expired.storage.setItem(ACCOUNT_KEYS.favorites,JSON.stringify(['guest']));await expired.controller.start();await expired.controller.login({email:alice.email,password:'long password'});
  expired.change('favorites',['unsynced-private']);expired.setUser(null);await expired.controller.flush();
  check(expired.controller.getSnapshot().status,'expired');check(read(expired,'favorites'),['guest']);check(JSON.parse(expired.storage.getItem('apex-account-cache-v1')).state.favorites,['unsynced-private']);
  await expired.controller.login({email:alice.email,password:'long password'});await expired.controller.flush();check(expired.garages.get(alice.id).state.favorites,['unsynced-private']);
}finally{expired.controller.destroy();}

// Account progress is combined conservatively; repeated imports cannot farm XP.
const academy=(xp,id)=>({version:2,xp,credits:5,completed:{[id]:{day:'2026-10-18',accuracy:100}},attempts:{},review:{},days:['2026-10-18'],awards:['lesson:'+id],unlocked:[],activity:[]});
const merged=mergeGuestGarage({...blank(),academy:academy(50,'a')},{...blank(),academy:academy(40,'b')});
check(merged.academy.xp,50);check(Object.keys(merged.academy.completed),['b','a']);check(mergeGuestGarage(merged,{...blank(),academy:academy(40,'b')}).academy.xp,50);
console.log(`Account synchronization: ${checks} checks passed.`);
