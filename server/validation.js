import {catalogMeta} from './catalog-meta.js';

const record=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const exact=(value,keys)=>record(value)&&Object.keys(value).every(key=>keys.includes(key));
const integer=(value,max=1000000)=>Number.isSafeInteger(value)&&value>=0&&value<=max;
const modelMap=new Map(catalogMeta.models.map(model=>[model.id,model]));
const lessons=new Map(catalogMeta.lessons.map(lesson=>[lesson.id,lesson.topic]));
const questions=new Map(catalogMeta.lessons.flatMap(lesson=>lesson.questions.map(id=>[id,lesson.topic])));
for(const model of catalogMeta.models){
  lessons.set('explore-'+model.id,'models');
  for(const suffix of ['drive','engine','generation','scope'])questions.set('explore-'+model.id+'-'+suffix,'models');
}
const topics=new Set([...lessons.values(),'review']);
const date=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
const accuracy=value=>Number.isInteger(value)&&value>=0&&value<=100;
const safeId=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(value)&&!['__proto__','prototype','constructor'].includes(value);
export const validName=value=>typeof value==='string'&&value.trim().length>=1&&value.trim().length<=32&&!/[\u0000-\u001f\u007f]/.test(value);
export const normalizeEmail=value=>typeof value==='string'&&value.trim().length<=254&&/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value.trim())?value.trim().toLowerCase():null;
export const validPassword=value=>typeof value==='string'&&value.length>=12&&value.length<=128;
const uniqueArray=(value,max,validator)=>Array.isArray(value)&&value.length<=max&&new Set(value).size===value.length&&value.every(validator);
const configOptions={ecu:['0','1','2'],turbo:['0','1','2'],intercooler:['0','1'],intake:['0','1'],exhaust:['0','1','2'],suspension:['stock','road','track'],wheels:['stock','graphite','silver','bronze'],brakes:['stock','road','track'],transmission:['stock','sport','clutch']};
function validBuild(build){
  if(!exact(build,['id','name','modelId','config','savedAt'])||!safeId(build.id)||typeof build.name!=='string'||!build.name.trim()||build.name.trim().length>80||/[\u0000-\u001f\u007f]/.test(build.name))return false;
  const model=modelMap.get(build.modelId);
  if(!model?.combustion||!exact(build.config,Object.keys(configOptions))||Object.keys(build.config).length!==Object.keys(configOptions).length)return false;
  for(const [key,values] of Object.entries(configOptions))if(!values.includes(build.config[key]))return false;
  if(!model.turbo&&(build.config.turbo!=='0'||build.config.intercooler!=='0'))return false;
  return typeof build.savedAt==='string'&&build.savedAt.length<=40&&/^\d{4}-\d{2}-\d{2}T/.test(build.savedAt)&&Number.isFinite(Date.parse(build.savedAt));
}
function validAward(value){
  if(typeof value!=='string'||value.length>120)return false;
  const split=value.indexOf(':'),kind=value.slice(0,split),id=value.slice(split+1);
  return kind==='lesson'?lessons.has(id):kind==='unit'?catalogMeta.units.includes(id):['daily','review'].includes(kind)&&date(id);
}
function boundedEntries(value,max,validator){return record(value)&&Object.keys(value).length<=max&&Object.entries(value).every(([key,item])=>safeId(key)&&validator(key,item));}
export function validateAcademy(value){
  if(value===null)return null;
  if(!exact(value,['version','xp','credits','completed','attempts','review','days','awards','unlocked','activity','name'])||value.version!==2||!integer(value.xp,100000000)||!integer(value.credits)||!validName(value.name))return false;
  if(!boundedEntries(value.completed,200,(id,item)=>lessons.has(id)&&exact(item,['day','accuracy','topic','migrated'])&&(date(item.day)||(item.day===null&&item.migrated===true))&&(accuracy(item.accuracy)||(item.accuracy===null&&item.migrated===true))&&item.topic===lessons.get(id)&&(!Object.hasOwn(item,'migrated')||typeof item.migrated==='boolean')))return false;
  if(!boundedEntries(value.attempts,600,(id,item)=>questions.has(id)&&exact(item,['right','total','topic','lastDay'])&&integer(item.right)&&integer(item.total)&&item.right<=item.total&&item.topic===questions.get(id)&&date(item.lastDay)))return false;
  if(!boundedEntries(value.review,600,(id,item)=>questions.has(id)&&exact(item,['topic','stage','due'])&&item.topic===questions.get(id)&&integer(item.stage,4)&&date(item.due)))return false;
  if(!uniqueArray(value.days,10000,date)||!uniqueArray(value.awards,20000,validAward)||!uniqueArray(value.unlocked,100,id=>modelMap.has(id)))return false;
  if(!Array.isArray(value.activity)||value.activity.length>500||!value.activity.every(item=>exact(item,['day','xp','lessonId','kind','accuracy'])&&date(item.day)&&integer(item.xp,1000)&&accuracy(item.accuracy)&&['lesson','daily','review'].includes(item.kind)&&(lessons.has(item.lessonId)||item.kind==='daily'&&item.lessonId==='daily-'+item.day||item.kind==='review'&&item.lessonId==='review-'+item.day)))return false;
  return JSON.parse(JSON.stringify(value));
}
export function emptyGarage(){return {favorites:[],builds:[],academy:null,legacyProgress:{}};}
export function validateGarage(value){
  if(!exact(value,['favorites','builds','academy','legacyProgress'])||Object.keys(value).length!==4||!uniqueArray(value.favorites,100,id=>modelMap.has(id))||!Array.isArray(value.builds)||value.builds.length>20||!value.builds.every(validBuild)||new Set(value.builds.map(build=>build.id)).size!==value.builds.length)return null;
  const academy=validateAcademy(value.academy);
  if(academy===false)return null;
  if(!record(value.legacyProgress)||Object.keys(value.legacyProgress).length>100||!Object.entries(value.legacyProgress).every(([key,item])=>item===true&&catalogMeta.legacy.some(id=>['beginner','intermediate','advanced'].some(level=>key===id+':'+level))))return null;
  // Reconstruct supported data only. Never persist imported power claims or HTML.
  return {favorites:[...value.favorites],builds:value.builds.map(build=>({id:build.id,name:build.name.trim(),modelId:build.modelId,config:{...build.config},savedAt:new Date(build.savedAt).toISOString()})),academy,legacyProgress:{...value.legacyProgress}};
}
