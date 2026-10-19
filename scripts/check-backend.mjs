import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createLocalDatabase} from '../server/local-db.mjs';
import {handleApi} from '../server/api.js';
import {emptyGarage,validateGarage} from '../server/validation.js';
import {catalogMeta} from '../server/catalog-meta.js';
import {academyRewardMetadata,validateAcademyTransition} from '../server/academy-policy.js';
import {allModels} from '../public/catalog.js';
import {academyLessons,academyReferenceData} from '../public/academy.js';
import {partCatalog} from '../public/parts.js';
import {createCurriculum} from '../public/academy-content.js';
import {emptyProgress,beginSession,recordAnswer,finishSession} from '../public/academy-state.js';
import {garageDefaults} from '../public/garage.js';
import {mergeGuestGarage} from '../public/account-sync.js';
import vercelApi from '../api/[...path].js';

const directory=await fs.mkdtemp(path.join(os.tmpdir(),'bmw-backend-'));
const filename=path.join(directory,'test.sqlite');
let DB=await createLocalDatabase(filename);
const env={DB,AUTH_PROVIDER:'password',CLIENT_IP:'127.0.0.1'};
const origin='http://localhost:3000';
let checks=0;
function check(value,message){assert.ok(value,message);checks++;}
async function call(route,{method='GET',body,cookie,csrf,headers={},provider}={}){
  const request=new Request(origin+route,{method,headers:{...(method==='GET'?{}:{Origin:origin,'Content-Type':'application/json'}),...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CSRF-Token':csrf}:{}),...headers},body:body===undefined?undefined:typeof body==='string'?body:JSON.stringify(body)});
  const response=await handleApi(request,provider?{...env,AUTH_PROVIDER:provider}:env);
  const data=response?await response.json():null;
  return {status:response?.status,headers:response?.headers,data,cookie:response?.headers.get('Set-Cookie')?.split(';')[0]};
}
const password='Three rivers and a BMW!';
const signup=(email,name='Test driver',options={})=>call('/api/auth/signup',{method:'POST',body:{email,password,name},...options});
try{
  const curriculum=createCurriculum(academyLessons,academyReferenceData.sources,partCatalog,allModels,academyReferenceData.scenarios);
  const projection={models:allModels.map(model=>({id:model.id,combustion:!(/electric|hybrid/i.test((model.powertrain||'')+' '+(model.hybridNote||'')))&&Number(model.cylinders)>0,turbo:Number(model.turbos)>0})),lessons:curriculum.lessons.map(lesson=>({id:lesson.id,topic:lesson.topic,questions:lesson.questions.map(question=>question.id)})),units:curriculum.units.map(unit=>unit.id),unitMembers:Object.fromEntries(curriculum.units.map(unit=>[unit.id,unit.lessons])),legacy:academyLessons.map(lesson=>lesson.id)};
  assert.deepEqual(catalogMeta,projection,'Backend ID metadata must track the public catalog and curriculum.');checks++;
  assert.deepEqual({...academyRewardMetadata,unitMembers:Object.fromEntries(Object.entries(academyRewardMetadata.unitMembers).map(([id,ids])=>[id,[...ids].sort()]))},{
    checkpointIds:curriculum.lessons.filter(lesson=>lesson.boss).map(lesson=>lesson.id),
    advancedIds:curriculum.lessons.filter(lesson=>lesson.advanced).map(lesson=>lesson.id),
    unitMembers:Object.fromEntries(curriculum.units.map(unit=>[unit.id,[...unit.lessons].sort()]))
  },'Reward bounds must follow the actual lesson types and unit membership.');checks++;
  assert.deepEqual((await call('/api/auth/session')).data.user,null);checks++;
  check((await call('/api/garage')).status===401,'Anonymous garages must be private.');
  check(await handleApi(new Request(origin+'/api/state'),env)===null,'Legacy platform garage remains separately handled.');
  check((await signup('bad')).status===400,'Validate email.');
  check((await signup('csrf@example.com','Driver',{headers:{Origin:'https://attacker.example'}})).status===403,'Reject cross-origin signup.');
  check((await signup('csrf@example.com','Driver',{headers:{Origin:'null'}})).status===403,'Reject opaque origins.');
  check((await signup('csrf@example.com','Driver',{headers:{Origin:'','Sec-Fetch-Site':'same-site'}})).status===403,'Same-site is not same-origin.');
  const alice=await signup('ALICE@example.com','Alice');
  check(alice.status===201,'A valid account is created.');
  check(alice.data.user.email==='alice@example.com'&&alice.data.provider==='password','Normalize emails and expose provider.');
  check(alice.headers.get('Set-Cookie').includes('HttpOnly')&&alice.headers.get('Set-Cookie').includes('SameSite=Lax'),'Sessions use HttpOnly SameSite cookies.');
  check(alice.data.csrfToken.length===43&&!JSON.stringify(alice.data).includes(password),'Never expose credentials.');
  const stored=await DB.prepare('SELECT password_hash FROM users WHERE id = ?').bind(alice.data.user.id).first();
  check(/^pbkdf2-sha256\$600000\$[a-f0-9]{32}\$[a-f0-9]{64}$/.test(stored.password_hash)&&!stored.password_hash.includes(password),'Store salted 600k PBKDF2, never passwords.');
  const bob=await signup('bob@example.com','Bob');
  const bobStored=await DB.prepare('SELECT password_hash FROM users WHERE id = ?').bind(bob.data.user.id).first();
  check(stored.password_hash!==bobStored.password_hash,'Each account gets a different salt.');
  const wrong=await call('/api/auth/login',{method:'POST',body:{email:'alice@example.com',password:'This is the wrong password'}});
  const missing=await call('/api/auth/login',{method:'POST',body:{email:'missing@example.com',password:'This is the wrong password'}});
  check(wrong.status===401&&missing.status===401&&wrong.data.error===missing.data.error,'Unknown email and wrong password have the same error.');
  check((await signup('alice@example.com')).status===409,'Duplicate addresses cannot create another account.');
  check((await call('/api/auth/session',{headers:{'oai-authenticated-user-id':'spoof','oai-authenticated-user-email':'spoof@example.com'}})).data.user===null,'Local authentication ignores forged platform headers.');
  const account={cookie:alice.cookie,csrf:alice.data.csrfToken};
  check((await call('/api/auth/session',account)).data.user.id===alice.data.user.id,'Cookie restores the account.');
  check((await call('/api/garage',{...account,method:'PUT',csrf:undefined,body:{state:emptyGarage(),revision:0}})).status===403,'Authenticated writes require CSRF token.');
  check((await call('/api/garage',{...account,method:'PUT',body:{state:emptyGarage(),revision:0},headers:{Origin:'https://attacker.example'}})).status===403,'Valid cookies and CSRF do not bypass origin protection.');
  check((await call('/api/garage',{...account,method:'PUT',body:'{bad'})).status===400,'Invalid JSON is rejected.');
  check((await call('/api/garage',{...account,method:'PUT',body:'x'.repeat(256*1024+1)})).status===413,'Streamed requests have a byte limit.');
  const state=emptyGarage();state.favorites=['f80'];state.builds=[{id:crypto.randomUUID(),name:"Alice's configuration; DROP TABLE users;",modelId:'f80',config:{...garageDefaults,ecu:'1'},savedAt:new Date().toISOString()}];
  state.academy=emptyProgress();state.academy.name='Alice';
  const lesson=curriculum.lessons.find(lesson=>lesson.id==='first-engine'),session=beginSession(lesson,{day:'2026-10-18'});
  for(const question of lesson.questions)recordAnswer(state.academy,session,question,question.correct,'2026-10-18');
  finishSession(state.academy,session,lesson,curriculum.units,'2026-10-18');
  for(const id of ['m-models','m-generations','puzzle-sequences','puzzle-connections','puzzle-parts']){
    const activity=curriculum.lessons.find(item=>item.id===id),round=beginSession(activity,{day:'2026-10-18'});
    for(const question of activity.questions){const answer=question.type==='match'?Object.fromEntries(question.pairs.map((_,i)=>[i,i])):question.correct;recordAnswer(state.academy,round,question,answer,'2026-10-18');}
    finishSession(state.academy,round,activity,curriculum.units,'2026-10-18');
  }
  check(Boolean(validateGarage(state)),'M recognition and every puzzle type produce account-compatible snapshots.');
  state.legacyProgress={'combustion:beginner':true};
  check(Boolean(validateGarage(state)),'Real academy session snapshots validate.');
  const save=await call('/api/garage',{...account,method:'PUT',body:{state,revision:0}});
  check(save.status===200&&save.data.revision===1,'Save the complete garage.');
  check((await call('/api/garage',account)).data.state.builds[0].name===state.builds[0].name,'Parameterized queries preserve literal SQL-like text.');
  check((await call('/api/garage',account)).data.state.academy.completed['m-generations'].accuracy===100,'New M recognition progress survives a server save and read.');
  const bobGarage=await call('/api/garage',{cookie:bob.cookie});
  check(bobGarage.data.revision===0&&bobGarage.data.state.builds.length===0,'Accounts never see another garage.');
  const bobAccount={cookie:bob.cookie,csrf:bob.data.csrfToken};
  const forged=emptyGarage();forged.academy=emptyProgress();forged.academy.xp=99999999;
  check((await call('/api/garage',{...bobAccount,method:'PUT',body:{state:forged,revision:0}})).status===400,'A real authenticated PUT rejects invented XP with no reward records.');
  forged.academy.xp=0;forged.academy.credits=999999;
  check((await call('/api/garage',{...bobAccount,method:'PUT',body:{state:forged,revision:0}})).status===400,'Credits need qualifying reward records.');
  check((await call('/api/garage',bobAccount)).data.revision===0,'Rejected rewards leave the saved garage unchanged.');
  const extraXP=structuredClone(state);extraXP.academy.xp++;
  check((await call('/api/garage',{...account,method:'PUT',body:{state:extraXP,revision:1}})).status===400,'Identical completion records cannot increment XP on each save.');
  const badBadge=structuredClone(state);badBadge.academy.achievements['seven-day-driver']={day:'2026-10-18'};
  check((await call('/api/garage',{...account,method:'PUT',body:{state:badBadge,revision:1}})).status===400,'An unearned achievement cannot be set by the client.');
  const answerFor=question=>question.type==='match'?Object.fromEntries(question.pairs.map((_,i)=>[i,i])):question.correct;
  function completeLocal(progress,activity,kind='lesson'){
    const round=beginSession(activity,{kind,day:'2026-10-18'});
    for(const question of activity.questions)recordAnswer(progress,round,question,answerFor(question),'2026-10-18');
    return finishSession(progress,round,activity,curriculum.units,'2026-10-18');
  }
  // This fixture represents an existing save from before the new policy and
  // private receipt ledger. Upgrading must not recalculate the old 25 XP.
  const legacy=emptyGarage();legacy.academy=emptyProgress();completeLocal(legacy.academy,lesson);
  legacy.academy.xp=25;legacy.academy.activity[0].xp=25;legacy.academy.awards=legacy.academy.awards.filter(key=>key!=='milestone:first-lesson');
  await DB.prepare('INSERT INTO user_garages (user_id,state,revision,updated_at) VALUES (?,?,1,?)').bind(bob.data.user.id,JSON.stringify(legacy),Date.now()).run();
  let policySave=await call('/api/garage',{...bobAccount,method:'PUT',body:{state:legacy,revision:1}});
  check(policySave.status===200&&policySave.data.state.academy.xp===25,'A prior-policy personal record keeps its exact XP baseline.');
  const replay=structuredClone(legacy);check(completeLocal(replay.academy,lesson).xp===0,'A completed old-policy lesson remains practice-only.');
  policySave=await call('/api/garage',{...bobAccount,method:'PUT',body:{state:replay,revision:2}});
  check(policySave.status===200&&policySave.data.state.academy.xp===25,'Replay attempts and activity still save without awarding points.');
  const removed=structuredClone(replay);removed.academy.awards=[];removed.academy.completed={};removed.academy.achievements={};
  policySave=await call('/api/garage',{...bobAccount,method:'PUT',body:{state:removed,revision:3}});
  check(policySave.status===200,'An older device snapshot can replace the personal record without losing server receipt history.');
  const readded=structuredClone(replay);readded.academy.xp=50;
  check((await call('/api/garage',{...bobAccount,method:'PUT',body:{state:readded,revision:4}})).status===400,'Removing and re-adding a completion cannot make its reward payable again.');
  const guest=emptyGarage();guest.academy=emptyProgress();completeLocal(guest.academy,curriculum.lessons.find(item=>item.id==='torque'));
  const imported=mergeGuestGarage(replay,guest);
  policySave=await call('/api/garage',{...bobAccount,method:'PUT',body:{state:imported,revision:4}});
  check(policySave.status===200&&policySave.data.state.academy.xp===65,'Explicit guest merging preserves disjoint progress and the conservative XP maximum.');
  check(!Object.hasOwn(policySave.data.state,'_academyReceipts')&&!Object.hasOwn((await call('/api/garage',bobAccount)).data.state,'_academyReceipts'),'Private reward receipt history is never returned to the browser.');
  const storedGarage=JSON.parse((await DB.prepare('SELECT state FROM user_garages WHERE user_id = ?').bind(bob.data.user.id).first()).state);
  check(storedGarage._academyReceipts.seen.includes('lesson:first-engine'),'The receipt ledger survives snapshot replacement in the existing JSON column.');
  policySave=await call('/api/garage',{...bobAccount,method:'PUT',body:{state:{...emptyGarage(),academy:emptyProgress()},revision:5}});
  check(policySave.status===200&&policySave.data.state.academy.xp===0,'A full Academy reset remains supported.');
  const oldDaily=emptyGarage();oldDaily.academy=emptyProgress();completeLocal(oldDaily.academy,{...lesson,id:'daily-2026-10-18'},'daily');oldDaily.academy.xp=30;oldDaily.academy.activity[0].xp=30;
  policySave=await call('/api/garage',{...bobAccount,method:'PUT',body:{state:oldDaily,revision:6}});
  check(policySave.status===200&&policySave.data.state.academy.xp===30,'An imported daily challenge retains the previous 30-XP policy.');
  check(validateAcademyTransition({...oldDaily.academy,xp:4000},{...oldDaily.academy,xp:4000}).ok,'Already saved historical XP is a preserved baseline rather than silently recalculated.');
  check(!validateAcademyTransition({...oldDaily.academy,xp:4001},{...oldDaily.academy,xp:4000}).ok,'Preserving historical points does not allow an unsupported new increment.');
  const conflict=await call('/api/garage',{...account,method:'PUT',body:{state:emptyGarage(),revision:0}});
  check(conflict.status===409&&conflict.data.revision===1&&conflict.data.state.favorites[0]==='f80','Revision conflicts return the current snapshot without overwriting it.');
  const invalid=structuredClone(state);invalid.builds[0].config.ecu='999';
  check((await call('/api/garage',{...account,method:'PUT',body:{state:invalid,revision:1}})).status===400,'Unsupported tuning options are rejected.');
  invalid.builds[0].config.ecu='1';invalid.builds[0].power=9999;
  check((await call('/api/garage',{...account,method:'PUT',body:{state:invalid,revision:1}})).status===400,'Imported derived performance claims are rejected.');
  const invalidAcademy=structuredClone(state);invalidAcademy.academy.completed['made-up-lesson']={day:'2026-10-18',accuracy:100,topic:'basics'};
  check((await call('/api/garage',{...account,method:'PUT',body:{state:invalidAcademy,revision:1}})).status===400,'Unknown academy lesson IDs are rejected.');
  check((await call('/api/account/profile',{...account,method:'PUT',body:{name:'Alice updated'}})).data.user.name==='Alice updated','Account names can be changed.');
  DB.close();DB=await createLocalDatabase(filename);env.DB=DB;
  check((await call('/api/auth/session',account)).data.user.name==='Alice updated','Sessions and profiles survive a server restart.');
  check((await call('/api/garage',account)).data.revision===1,'Garages persist on disk across restarts.');
  check((await call('/api/auth/logout',{...account,method:'POST'})).status===200,'Logout succeeds.');
  check((await call('/api/auth/session',account)).data.user===null&&(await call('/api/garage',account)).status===401,'Logout revokes the server-side session.');
  const login=await call('/api/auth/login',{method:'POST',body:{email:'alice@example.com',password}});
  check(login.status===200&&login.cookie!==alice.cookie,'Login creates a fresh session.');
  const token=login.cookie.split('=')[1];
  check(!(await DB.prepare('SELECT token_hash FROM sessions').all()).results.some(row=>row.token_hash===token),'Raw bearer sessions are not stored in the database.');
  const secure=await handleApi(new Request('https://garage.example/api/auth/login',{method:'POST',headers:{Origin:'https://garage.example','Content-Type':'application/json'},body:JSON.stringify({email:'bob@example.com',password})}),env);
  check(secure.status===200&&secure.headers.get('Set-Cookie').startsWith('__Host-bmw_session=')&&secure.headers.get('Set-Cookie').includes('; Secure'),'HTTPS uses a host-only Secure cookie.');
  const platformHeaders={'oai-authenticated-user-id':'platform-alice','oai-authenticated-user-email':'alice@example.com','oai-authenticated-user-full-name':'Platform%20Alice','oai-authenticated-user-full-name-encoding':'percent-encoded-utf-8'};
  const platform=await call('/api/auth/session',{provider:'chatgpt',headers:platformHeaders});
  check(platform.data.user.name==='Platform Alice'&&platform.data.user.id!==alice.data.user.id&&platform.data.user.email==='alice@example.com','Hosted identity uses trusted headers with a separate namespace.');
  check(platform.data.provider==='chatgpt'&&platform.data.signInUrl.includes('/signin-with-chatgpt?return_to='),'Hosted mode exposes native sign-in URL.');
  check((await call('/api/auth/signup',{method:'POST',provider:'chatgpt',body:{}})).status===403,'Hosted accounts never use custom passwords.');
  check((await call('/api/auth/session',{provider:'chatgpt',cookie:platform.cookie})).data.user===null,'A hosted app cookie alone cannot authenticate.');
  const platformAgain=await call('/api/auth/session',{provider:'chatgpt',cookie:platform.cookie,headers:platformHeaders});
  check(platformAgain.data.user.email==='alice@example.com'&&platformAgain.data.csrfToken===platform.data.csrfToken,'Existing hosted sessions still use the live gateway identity.');
  const platformOther=await call('/api/garage',{provider:'chatgpt',cookie:platform.cookie,headers:{...platformHeaders,'oai-authenticated-user-id':'different-user'}});
  check(platformOther.status===200&&platformOther.data.revision===0,'A platform identity change cannot reuse another user’s garage.');
  check((await call('/api/auth/session',{provider:'chatgpt',headers:{'oai-authenticated-user-id':'incomplete'}})).data.user===null,'Incomplete platform headers do not authenticate.');
  const expiry=await DB.prepare('SELECT token_hash FROM sessions WHERE user_id = ?').bind(login.data.user.id).first();
  await DB.prepare('UPDATE sessions SET expires_at = 0 WHERE token_hash = ?').bind(expiry.token_hash).run();
  check((await call('/api/auth/session',{cookie:login.cookie})).data.user===null,'Expired sessions are rejected.');
  env.CLIENT_IP='rate-limit-client';
  let limited;
  for(let attempt=0;attempt<31;attempt++)limited=await call('/api/auth/login',{method:'POST',body:{}});
  check(limited.status===429&&limited.headers.get('Retry-After'),'Repeated auth requests are limited in SQLite.');
  const databaseVariables=['DATABASE_URL','DATABASE_URL_UNPOOLED','POSTGRES_URL','POSTGRES_URL_NON_POOLING'];
  const previousVariables=databaseVariables.map(name=>[name,process.env[name]]);
  try{
    databaseVariables.forEach(name=>delete process.env[name]);
    const response=await vercelApi.fetch(new Request('https://apex.example/api/auth/session'));
    const data=await response.json();
    check(response.status===503&&data.error.includes('Neon Postgres'),'Vercel sign-in explains the Neon setup when no database is configured.');
  }finally{
    for(const [name,value] of previousVariables)if(value===undefined)delete process.env[name];else process.env[name]=value;
  }
  console.log(`Backend: ${checks} checks passed (accounts, session security, CSRF, identity isolation, validation, conflicts, persistence).`);
}finally{
  DB.close();
  // Only remove the exact random test directory created above, within OS temp.
  const expected=path.resolve(os.tmpdir()),actual=path.resolve(directory);
  if(path.dirname(actual)!==expected||!path.basename(actual).startsWith('bmw-backend-'))throw new Error('Unexpected backend test directory.');
  await fs.rm(actual,{recursive:true,force:true});
}
