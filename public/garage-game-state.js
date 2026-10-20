import {account} from './account-sync.js';
import {convertedPower,convertedTorque} from './comparison.js';

export const COIN_POLICY=Object.freeze({perAnswer:1,dailyLimit:20,packCost:8,dailyPacks:1});
export const RARITIES=Object.freeze([{id:'common',name:'Common',weight:50,price:10},{id:'uncommon',name:'Uncommon',weight:28,price:20},{id:'rare',name:'Rare',weight:15,price:40},{id:'epic',name:'Epic',weight:6,price:75},{id:'legendary',name:'Legendary',weight:1,price:120}]);
export const STARTER=Object.freeze({id:'career-isetta',name:'BMW Isetta 300',generation:'HERITAGE / 1956',car:'images/garage-isetta.svg',power:13,powerUnit:'hp',code:'Single-cylinder petrol',gameYear:1956,source:{label:'BMW Group Classic',url:'https://www.bmwgroup-classic.com/en/models/bmw-classics/product-description-page.ad-224-1.bmw-isetta-300-standard.html'}});
export const CAREER=Object.freeze([{id:STARTER.id,title:'Small beginnings',cost:0},{id:'e20-2002-turbo',title:'Find your boost',cost:20},{id:'e30-m3',title:'The first M3',cost:35},{id:'e92',title:'Eight cylinders',cost:60},{id:'g80-m3-cs',title:'Your M destination',cost:120}]);
const utcDay=()=>new Date().toISOString().slice(0,10),validDay=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
const integer=(value,max=10000000)=>Number.isSafeInteger(value)&&value>=0&&value<=max;
const identity=()=>account.getSnapshot?.().user?.id??null;
export const garageGameKey=userId=>'apex-garage-game-v1:'+(userId==null?'guest':'account:'+encodeURIComponent(String(userId)));
const legacyKey=userId=>'apex-collection-v1:'+(userId??'guest');
const getStorage=provided=>{try{return provided??globalThis.localStorage;}catch{return null;}};
export function emptyGarageGame(){return {version:1,coins:0,earned:0,spent:0,cards:{[STARTER.id]:{rarity:'common',source:'starter',day:null}},days:{},packs:[],history:[],legacyMigrated:false};}
export function restoreGarageGame(value){
 const state=emptyGarageGame();if(!value||value.version!==1)return state;
 for(const key of ['coins','earned','spent'])if(integer(value[key]))state[key]=value[key];
 if(value.cards&&typeof value.cards==='object')for(const [id,card]of Object.entries(value.cards).slice(0,1000))if(/^[a-z0-9-]{1,80}$/.test(id)&&card&&RARITIES.some(r=>r.id===card.rarity))state.cards[id]={rarity:card.rarity,source:['starter','legacy','pack','purchase'].includes(card.source)?card.source:'legacy',day:validDay(card.day)?card.day:null};
 if(value.days&&typeof value.days==='object')for(const [day,record]of Object.entries(value.days).filter(([day])=>validDay(day)).sort().slice(-14)){
  if(!record||typeof record.answers!=='object')continue;const answers={};for(const [id,amount]of Object.entries(record.answers).slice(0,2000))if(/^(play|sound|academy):[A-Za-z0-9:_-]{1,180}$/.test(id)&&[0,1].includes(amount))answers[id]=amount;
  state.days[day]={answers,earned:Math.min(COIN_POLICY.dailyLimit,Object.values(answers).reduce((sum,n)=>sum+n,0))};
 }
 state.packs=[...new Set((Array.isArray(value.packs)?value.packs:[]).filter(validDay))].slice(-3660);
 state.history=(Array.isArray(value.history)?value.history:[]).filter(item=>item&&validDay(item.day)&&['earn','pack','purchase'].includes(item.kind)&&integer(item.amount)&&typeof item.label==='string').slice(-100);
 state.legacyMigrated=value.legacyMigrated===true;return state;
}
function load(options={}){
 const userId=Object.hasOwn(options,'userId')?options.userId:identity(),storage=getStorage(options.storage),key=garageGameKey(userId);let state;
 try{state=restoreGarageGame(JSON.parse(storage?.getItem(key)||'null'));}catch{state=emptyGarageGame();}
 // Old daily cards remain owned. Their old claimed days do not grant a new
 // free pack, a coin balance, or a way around the earned-coin pack price.
 if(!state.legacyMigrated){try{const legacy=JSON.parse(storage?.getItem(legacyKey(userId))||'null');for(const id of legacy?.cards||[])if(typeof id==='string'&&/^[a-z0-9-]{1,80}$/.test(id))state.cards[id]??={rarity:'common',source:'legacy',day:null};}catch{}state.legacyMigrated=true;}
 return {state,userId,storage,key};
}
function save(loaded){try{if(!loaded.storage)throw Error();loaded.storage.setItem(loaded.key,JSON.stringify(loaded.state));globalThis.window?.dispatchEvent(new CustomEvent('apex:garagegame',{detail:{key:loaded.key,coins:loaded.state.coins}}));return true;}catch{return false;}}
export function getGarageGame(options={}){return load(options).state;}
export function migrateLegacyGameCards(ids,catalog,options={}){const loaded=load(options),valid=new Set(catalog.map(car=>car.id));let changed=false;for(const id of ids)if(valid.has(id)&&!loaded.state.cards[id]){loaded.state.cards[id]={rarity:cardRarity(catalog.find(car=>car.id===id)),source:'legacy',day:null};changed=true;}return !changed||save(loaded);}
export function validateGarageGameBackup(value,catalog){
 if(!value||value.version!==1||!integer(value.coins)||!integer(value.earned)||!integer(value.spent)||value.coins!==Math.max(0,value.earned-value.spent)||!value.cards||Object.keys(value.cards).length>1000||!value.days||Object.keys(value.days).length>3660)throw Error('This garage-game backup has invalid coins or collection records.');
 const state=restoreGarageGame(value),ids=new Set([STARTER.id,...catalog.map(car=>car.id)]);state.cards=Object.fromEntries(Object.entries(state.cards).filter(([id])=>ids.has(id)));return state;
}
export function mergeGarageGameBackup(value,catalog,options={}){
 const incoming=validateGarageGameBackup(value,catalog),loaded=load(options),current=loaded.state;
 current.earned=Math.max(current.earned,incoming.earned);current.spent=Math.max(current.spent,incoming.spent);current.coins=Math.max(0,current.earned-current.spent);
 current.cards={...incoming.cards,...current.cards};current.packs=[...new Set([...current.packs,...incoming.packs])].sort();
 for(const [day,record]of Object.entries(incoming.days)){const previous=current.days[day];if(!previous){current.days[day]=record;continue;}previous.answers={...record.answers,...previous.answers};previous.earned=Math.min(COIN_POLICY.dailyLimit,Object.values(previous.answers).reduce((sum,n)=>sum+n,0));}
 current.history=[...incoming.history,...current.history].filter((item,index,all)=>all.findIndex(other=>JSON.stringify(other)===JSON.stringify(item))===index).slice(-100);
 loaded.state=restoreGarageGame(current);return save(loaded);
}
export function awardQuizCoins({source='play',questionId,correct,hinted=false,day=utcDay(),...scope},{storage}={}){
 const loaded=load({...scope,storage}),{state}=loaded,balance=state.coins;
 if(!['play','sound','academy'].includes(source)||typeof questionId!=='string'||!/^[A-Za-z0-9:_-]{1,180}$/.test(questionId)||!validDay(day))return {awarded:0,balance,earnedToday:0,reason:'invalid',storageOK:true};
 const canonical=source==='play'&&questionId.startsWith('academy-')?{source:'academy',id:questionId.slice(8)}:{source,id:questionId};
 const record=state.days[day]??={answers:{},earned:0},id=canonical.source+':'+canonical.id;
 if(Object.hasOwn(record.answers,id))return {awarded:0,balance,earnedToday:record.earned,reason:'repeat',storageOK:true};
 const awarded=correct===true&&!hinted&&record.earned<COIN_POLICY.dailyLimit?1:0;
 record.answers[id]=awarded;record.earned+=awarded;state.coins+=awarded;state.earned+=awarded;
 if(awarded)state.history.push({kind:'earn',day,amount:awarded,label:source==='sound'?'Sound challenge':source==='academy'?'Academy answer':'Arcade answer'});
 state.history=state.history.slice(-100);
 const storageOK=save(loaded);return {awarded:storageOK?awarded:0,balance:storageOK?state.coins:balance,earnedToday:storageOK?record.earned:record.earned-awarded,reason:!storageOK?'storage':awarded?'earned':!correct?'wrong':hinted?'hinted':'daily-cap',storageOK};
}
export function garageCards(catalog){return [STARTER,...catalog];}
export function cardRarity(model){
 if(model.id===STARTER.id)return 'common';
 if(/^(e26-m1|e507|g82-30-csl|e9-30-csl|e46-m3-csl|e92-m3-gts)$/.test(model.id))return 'legendary';
 if(/\b(?:CS|CSL|GTS|Sport Evolution)\b/.test(model.name)||/sport-evo/.test(model.id))return 'epic';
 const hp=convertedPower(model,'imperial')?.value||0;
 if(hp>=500)return 'epic';if(hp>=350||model.generation?.startsWith('M SERIES'))return 'rare';if(hp>=200)return 'uncommon';return 'common';
}
export const cardPrice=model=>CAREER.find(step=>step.id===model.id)?.cost??RARITIES.find(r=>r.id===cardRarity(model)).price;
export function packOdds(catalog,state){const pool=catalog.filter(model=>!state.cards[model.id]),available=RARITIES.filter(r=>pool.some(model=>cardRarity(model)===r.id)),total=available.reduce((sum,r)=>sum+r.weight,0);return available.map(r=>({...r,percent:r.weight/total*100}));}
export function buyGarageCar(id,catalog,options={}){
 const loaded=load(options),{state}=loaded,model=catalog.find(car=>car.id===id),step=CAREER.findIndex(item=>item.id===id);
 if(!model||state.cards[id])return {ok:false,message:'This card is already collected or unavailable.'};
 if(step>0&&!state.cards[CAREER[step-1].id])return {ok:false,message:'Complete the previous career step first.'};
 const cost=cardPrice(model);if(state.coins<cost)return {ok:false,message:'Earn more coins in Play or Sounds before buying this card.'};
 state.coins-=cost;state.spent+=cost;state.cards[id]={rarity:cardRarity(model),source:'purchase',day:options.day||utcDay()};state.history.push({kind:'purchase',day:options.day||utcDay(),amount:cost,label:model.name});state.history=state.history.slice(-100);
 return save(loaded)?{ok:true,card:model,cost,state}:{ok:false,message:'This browser could not save the purchase. Your coins were not spent.'};
}
export function openDailyPack(catalog,options={}){
 const loaded=load(options),{state}=loaded,day=options.day||utcDay();if(!validDay(day))return {ok:false,message:'The pack date is invalid.'};
 if(state.packs.includes(day))return {ok:false,message:'Today’s pack is already opened. The next opens at 00:00 UTC.'};
 if(state.coins<COIN_POLICY.packCost)return {ok:false,message:'Earn 8 coins in Play or Sounds to open today’s pack.'};
 const odds=packOdds(catalog,state);if(!odds.length)return {ok:false,message:'You have collected every available card.'};
 const random=options.random||(()=>{const n=new Uint32Array(1);crypto.getRandomValues(n);return n[0]/4294967296;}),roll=random()*100;let sum=0,rarity=odds.at(-1).id;
 for(const option of odds){sum+=option.percent;if(roll<sum){rarity=option.id;break;}}
 const pool=catalog.filter(car=>!state.cards[car.id]&&cardRarity(car)===rarity),card=pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];
 state.coins-=COIN_POLICY.packCost;state.spent+=COIN_POLICY.packCost;state.packs.push(day);state.cards[card.id]={rarity,source:'pack',day};state.history.push({kind:'pack',day,amount:COIN_POLICY.packCost,label:card.name});state.history=state.history.slice(-100);
 return save(loaded)?{ok:true,card,rarity,state}:{ok:false,message:'This browser could not save the pack. Your coins were not spent.'};
}
export const BATTLE_STATS=Object.freeze([{id:'power',label:'Power',unit:'hp',higher:true,value:model=>convertedPower(model,'imperial')?.value??null},{id:'torque',label:'Torque',unit:'Nm',higher:true,value:model=>convertedTorque(model,'metric')?.value??null},{id:'speed',label:'Top speed',unit:'km/h',higher:true,value:model=>Number.isFinite(model.topSpeed)?model.topSpeed:null},{id:'sprint',label:'0–100 km/h',unit:'s',higher:false,value:model=>Number.isFinite(model.acceleration100)?model.acceleration100:null},{id:'heritage',label:'Heritage year',unit:'',higher:false,value:model=>model.gameYear||model.verified?.modelYear||model.profile?.context?.modelYear||Number(String(model.market||'').match(/\b(?:19|20)\d{2}\b/)?.[0])||null}]);
export function battleResult(left,right,statId){const stat=BATTLE_STATS.find(item=>item.id===statId),a=stat?.value(left),b=stat?.value(right);if(!stat||!Number.isFinite(a)||!Number.isFinite(b))return null;return {stat,a,b,winner:a===b?'tie':(stat.higher?a>b:a<b)?'left':'right'};}
