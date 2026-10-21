import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {PGlite} from '@electric-sql/pglite';
import {createLocalDatabase} from '../server/local-db.mjs';
import {initializePostgres,createPostgresAdapter} from '../server/postgres-db.js';
import {handleApi} from '../server/api.js';
import {communityQuestions,masteryExpiry,publicMasteryQuestions,gradeMasteryQuestions} from '../server/community-questions.js';
import {validateCommunityPhoto,encodePhotoBytes,decodePhotoBytes} from '../server/community-photos.js';
import {emptyGarage} from '../server/validation.js';
import {createRoutedVercelHandler} from '../server/vercel-router.js';
import {hashPassword,randomToken} from '../server/passwords.js';

let checks=0;const check=(v,m)=>{assert.ok(v,m);checks++;};
check(masteryExpiry(Date.parse('2026-10-20T23:59:00Z'))===Date.parse('2026-10-21T00:00:00Z'),'A round cannot carry yesterday’s reward budget past UTC midnight.');
check(masteryExpiry(Date.parse('2026-10-21T00:00:00Z'))===Date.parse('2026-10-21T00:15:00Z'),'A round normally allows fifteen minutes without speed rewards.');
for(const language of ['ka','ru'])for(const question of communityQuestions){const item={id:question.id,order:[3,2,1,0]},shown=publicMasteryQuestions([item],language)[0],result=gradeMasteryQuestions([item],[item.order.indexOf(question.answer)],language)[0];check(shown.prompt!==question.prompt&&shown.options.length===4&&result.correct&&result.explanation!==question.explanation,'Localized question and shuffled answer preserve grading: '+question.id+'/'+language);}
const jpg=await sharp({create:{width:320,height:200,channels:3,background:'#35618c'}}).jpeg().withExif({IFD0:{Artist:'PRIVATE PHOTO METADATA'}}).toBuffer();
const webp=await sharp({create:{width:320,height:200,channels:3,background:'#35618c'}}).webp().toBuffer();
const photo={data:'data:image/jpeg;base64,'+jpg.toString('base64'),caption:'My BMW on a closed driveway'};
const clean=validateCommunityPhoto(photo);check(clean.width===320&&clean.height===200,'Photo parser reads real JPEG dimensions.');
check(!(await sharp(decodePhotoBytes(clean.data)).metadata()).exif,'Uploaded EXIF metadata is removed.');
const progressive=await sharp(jpg).jpeg({progressive:true}).withExif({IFD0:{Artist:'PRIVATE PROGRESSIVE METADATA'}}).toBuffer();
const late=Buffer.from('PRIVATE AFTER SCAN METADATA'),segment=Buffer.concat([Buffer.from([255,225,0,late.length+2]),late]);
const lateMetadata=Buffer.concat([progressive.subarray(0,-2),segment,progressive.subarray(-2)]);
const cleanProgressive=validateCommunityPhoto({data:'data:image/jpeg;base64,'+lateMetadata.toString('base64')});
check((await sharp(decodePhotoBytes(cleanProgressive.data)).metadata()).width===320&&!Buffer.from(decodePhotoBytes(cleanProgressive.data)).includes(late),'Progressive JPEG remains valid and metadata after scans is stripped.');
const cleanedWebp=validateCommunityPhoto({data:'data:image/webp;base64,'+webp.toString('base64')});check((await sharp(decodePhotoBytes(cleanedWebp.data)).metadata()).width===320,'WebP survives sanitization.');
assert.throws(()=>validateCommunityPhoto({...photo,data:'data:image/webp;base64,'+jpg.toString('base64')}));checks++;
assert.throws(()=>validateCommunityPhoto({data:'data:image/svg+xml;base64,'+Buffer.from('<svg/>').toString('base64')}));checks++;
assert.throws(()=>validateCommunityPhoto({data:'data:image/jpeg;base64,'+encodePhotoBytes(new Uint8Array(210*1024))}));checks++;

const directory=await fs.mkdtemp(path.join(os.tmpdir(),'apex-community-'));
const filename=path.join(directory,'isolated.sqlite');let sqlite=await createLocalDatabase(filename);
const pg=new PGlite();const query=async(sql,values=[])=>{const r=await pg.query(sql,values);return {rows:r.rows,rowCount:r.affectedRows??r.rows.length};};
const transaction=statements=>pg.transaction(async tx=>{const results=[];for(const [sql,values] of statements)results.push(await tx.query(sql,values));return results;});
await initializePostgres(query,transaction);const postgres=createPostgresAdapter(query,transaction);
async function suite(DB,label){
 const adminPassword=randomToken(),adminHash=await hashPassword(adminPassword);
 const origin='https://garage.example',password='BMW community test password!',env={DB,AUTH_PROVIDER:'password',CLIENT_IP:label,ADMIN_EMAILS:'owner@example.test',ADMIN_LOGIN_EMAIL:'private-owner@example.test',ADMIN_PASSWORD_HASH:adminHash};
 async function call(route,{method='GET',body,actor,headers={}}={}){
  const response=await handleApi(new Request(origin+route,{method,headers:{Origin:origin,'Content-Type':'application/json',...(actor?{Cookie:actor.cookie,'X-CSRF-Token':actor.csrf}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body)}),env);
  const data=response.headers.get('Content-Type')?.startsWith('application/json')?await response.json():new Uint8Array(await response.arrayBuffer());return {status:response.status,data,headers:response.headers};
 }
 async function user(email,name){await call('/api/auth/signup',{method:'POST',body:{email,name,password,language:'ka'}});const result=await call('/api/auth/login',{method:'POST',body:{email,password}});check(result.status===200,label+' account login');check(result.data.user.language==='ka',label+' signup language persists through login');check(result.data.user.isAdmin===false&&result.data.user.role==='member'&&result.data.redirectTo==='/account',label+' regular login returns explicit member role and destination');return {id:result.data.user.id,cookie:result.headers.get('Set-Cookie').split(';')[0],csrf:result.data.csrfToken};}
 const alice=await user('alice@example.test','Private Alice'),bob=await user('bob@example.test','Private Bob'),owner=await user('owner@example.test','Private Owner');
 const adminLogin=await call('/api/admin/login',{method:'POST',body:{email:'PRIVATE-OWNER@EXAMPLE.TEST',password:adminPassword}});
 check(adminLogin.status===200&&adminLogin.data.user.name==='Administrator',label+' dedicated administrator login');
 const admin={cookie:adminLogin.headers.get('Set-Cookie').split(';')[0],csrf:adminLogin.data.csrfToken};
 check((await call('/api/community')).status===401,label+' community account is private');
 check((await call('/api/admin/community',{actor:alice})).status===401,label+' ordinary user denied admin');
 check((await call('/api/admin/community',{actor:owner})).status===401,label+' legacy owner email denied dedicated admin');
 const ownerSession=(await call('/api/auth/session',{actor:owner})).data;
 check(ownerSession.user.isAdmin===false&&!('adminAccess' in ownerSession),label+' public session never grants or advertises administrator access');
 check(!JSON.stringify((await call('/api/auth/session',{actor:alice})).data).includes('owner@example.test'),label+' session does not disclose the admin email allowlist');
 await call('/api/auth/signup',{method:'POST',body:{email:'alice@example.test',name:'Changed name',password,language:'ru'}});
 check((await call('/api/auth/session',{actor:alice})).data.user.language==='ka',label+' duplicate registration cannot change an existing language preference');
 check((await call('/api/community/profile',{actor:alice,method:'PUT',body:{handle:'alice-driver',displayName:'Alice Driver',bio:'Learning about BMWs',isAdmin:true}})).status===400,label+' client cannot set admin');
 for(const [actor,handle,name]of [[alice,'alice-driver','Alice Driver'],[bob,'bob-driver','Bob Driver'],[owner,'owner-driver','Owner Driver']])check((await call('/api/community/profile',{actor,method:'PUT',body:{handle,displayName:name,bio:''}})).status===200,label+' public profile');
 check((await call('/api/community/profile',{actor:bob,method:'PUT',body:{handle:'alice-driver',displayName:'Bob',bio:''}})).status===409,label+' handle uniqueness');
 check((await call('/api/community/profile',{actor:alice,method:'PUT',body:{handle:'alice-driver',displayName:'Alice',bio:''},headers:{Origin:'https://evil.test'}})).status===403,label+' origin checked');
 check((await call('/api/community/profile',{actor:{...alice,csrf:''},method:'PUT',body:{handle:'alice-driver',displayName:'Alice',bio:''}})).status===403,label+' CSRF checked');
 const bobShare=await call('/api/community/garage-share',{actor:bob,method:'POST',body:{}});
 const request=await call('/api/community/friends',{actor:alice,method:'POST',body:{handle:'bob-driver'}});check(request.status===201,label+' friend request created');
 check(!('garageUrl'in (await call('/api/community/friends',{actor:alice})).data.outgoing[0]),label+' unsolicited request cannot discover garage token');
 check((await call('/api/community/friends',{actor:alice,method:'PATCH',body:{id:request.data.id,action:'accept'}})).status===403,label+' requester cannot accept own request');
 check((await call('/api/community/friends',{actor:owner,method:'DELETE',body:{id:request.data.id}})).status===404,label+' third party cannot remove friendship');
 check((await call('/api/community/friends',{actor:bob})).data.incoming[0].profile.handle==='alice-driver',label+' recipient sees incoming');
 check((await call('/api/community/friends',{actor:bob,method:'PATCH',body:{id:request.data.id,action:'accept'}})).status===200,label+' recipient accepts');
 check((await call('/api/community/friends',{actor:alice})).data.friends.length===1,label+' mutual friend');
 check((await call('/api/community/friends',{actor:alice})).data.friends[0].garageUrl===bobShare.data.url,label+' accepted friend can open opted-in garage');
 check(!(JSON.stringify((await call('/api/community/friends',{actor:alice})).data).includes('example.test')),label+' friends never expose email');
 const garage={...emptyGarage(),favorites:['f80']};await call('/api/garage',{actor:alice,method:'PUT',body:{state:garage,revision:0}});
 check((await call('/api/community/garage-share',{actor:alice})).data.enabled===false,label+' sharing off by default');
 const shared=await call('/api/community/garage-share',{actor:alice,method:'POST',body:{}});check(shared.data.token.length===43&&shared.data.url==='/garage/'+shared.data.token,label+' canonical public garage URL and strong token');
 const publicGarage=await call('/api/community/shared-garage?token='+shared.data.token);check(publicGarage.data.garage.favorites[0]==='f80',label+' public favorites');
 const sharedText=JSON.stringify(publicGarage.data);check(!['Private Alice','example.test',alice.id,'academy','legacyProgress','_academyReceipts','password'].some(secret=>sharedText.includes(secret)),label+' public share whitelist');
 check((await call('/api/community/garage-share',{actor:bob,method:'DELETE'})).status===200,label+' revoke only own share');
 check((await call('/api/community/shared-garage?token='+shared.data.token)).status===200,label+' another user cannot revoke link');
 await call('/api/community/garage-share',{actor:alice,method:'DELETE'});check((await call('/api/community/shared-garage?token='+shared.data.token)).status===404,label+' revoked links die');
 const secondShare=await call('/api/community/garage-share',{actor:alice,method:'POST',body:{}});check(secondShare.data.token!==shared.data.token,label+' new token after revoke');
 const input={title:'My E46 project',model:'BMW 330i E46',year:2003,engine:'M54B30',transmission:'Six-speed manual',horsepower:231,description:'My daily driven BMW with a documented service history and factory specification.',modifications:'Factory wheels',evidence:'Private ownership note for the administrator only.',photos:[photo]};
 const created=await call('/api/community/submissions',{actor:alice,method:'POST',body:input});check(created.status===201&&created.data.submission.status==='draft',label+' durable draft');const id=created.data.submission.id,photoURL=created.data.submission.photos[0].url;
 check((await call('/api/community/submissions',{actor:bob})).data.submissions.length===0,label+' drafts owner-only');
 check((await call('/api/community/submissions?id='+id,{actor:bob})).status===404,label+' other user cannot inspect proof');
 check((await call('/api/community/cars?id='+id)).status===404,label+' draft not public');
 check((await call(photoURL)).status===404,label+' draft photo not public');check((await call(photoURL,{actor:alice})).status===200,label+' owner previews photo');
 check((await call('/api/community/submissions/submit',{actor:alice,method:'POST',body:{id}})).data.code==='CREDITS_REQUIRED',label+' server credit gate');
 check((await call('/api/community/submissions',{actor:alice,method:'PUT',body:{...input,id,credits:9999}})).status===400,label+' no client balance grant');
 // A prior-policy wallet is a preserved baseline, never repriced on upgrade.
 await DB.prepare('INSERT INTO community_wallets (user_id,balance,updated_at) VALUES (?,41,?) ON CONFLICT(user_id) DO UPDATE SET balance = 41').bind(alice.id,Date.now()).run();
 await DB.prepare("INSERT INTO community_credit_ledger (id,user_id,amount,reason,source_key,created_at) VALUES (?,?,41,'legacy','preserved-history',?)").bind(crypto.randomUUID(),alice.id,Date.now()).run();
 const start=actor=>call('/api/community/challenge',{actor,method:'POST',body:{action:'start'}});
 const answers=(round,wrongCount=0)=>round.questions.map((item,index)=>{const question=communityQuestions.find(q=>q.id===item.id),correct=item.options.indexOf(question.options[question.answer]);return index<wrongCount?(correct+1)%4:correct;});
 check((await call('/api/community/challenge',{actor:alice})).data.challenge===null,label+' reading challenge does not consume an attempt');
 const first=await start(alice),round=first.data.challenge;check(round.questions.length===5&&new Set(round.questions.map(q=>q.topic)).size===5,label+' applied round covers five topics');
 check(round.questions.every(q=>!('answer'in q)&&!('explanation'in q)&&!('order'in q)&&q.options.length===4),label+' shuffled answers and explanations stay server-side');
 check((await call('/api/community/challenge',{actor:alice})).data.challenge.id===round.id&&(await start(alice)).data.credits.attemptsToday===1,label+' reload and start resume the same paid attempt');
 check((await call('/api/community/challenge',{actor:alice,method:'POST',body:{id:round.id,answers:[0]}})).status===400,label+' partial round does not consume answers');
 check((await call('/api/community/challenge',{actor:bob,method:'POST',body:{id:round.id,answers:answers(round)}})).status===409,label+' round bound to its account');
 const wrong=await call('/api/community/challenge',{actor:alice,method:'POST',body:{id:round.id,answers:answers(round,5)}});check(wrong.data.correct===false&&wrong.data.score===0&&wrong.data.awarded===0&&wrong.data.credits.balance===41,label+' guessing all answers wrong earns nothing and preserves past credits');
 check(wrong.data.results.every(result=>result.source.url.startsWith('https://')&&result.explanation&&Number.isInteger(result.answer)),label+' submitted answers receive sourced explanation');
 check((await call('/api/community/challenge',{actor:alice,method:'POST',body:{id:round.id,answers:answers(round)}})).status===409,label+' no answer replay');
 const expired=await start(alice);await DB.prepare('UPDATE community_mastery_rounds SET expires_at = ? WHERE id = ?').bind(Date.now()-1000,expired.data.challenge.id).run();
 check((await call('/api/community/challenge',{actor:alice,method:'POST',body:{id:expired.data.challenge.id,answers:answers(expired.data.challenge)}})).status===409,label+' expired round cannot earn');
 const seen=new Set([...round.questions,...expired.data.challenge.questions].map(q=>q.id));
 for(let i=0;i<3;i++){
  const next=await start(alice);check(next.data.challenge.questions.every(q=>!seen.has(q.id)),label+' daily rounds do not recycle issued questions');for(const q of next.data.challenge.questions)seen.add(q.id);
  if(i===0){const realBatch=env.DB.batch;env.DB={...DB,batch:async()=>{throw new Error('simulated temporary transaction failure');}};
   check((await call('/api/community/challenge',{actor:alice,method:'POST',body:{id:next.data.challenge.id,answers:answers(next.data.challenge,1)}})).status===503,label+' transaction failure is reported');env.DB={...DB,batch:realBatch};
   check((await call('/api/community/challenge',{actor:alice})).data.challenge.id===next.data.challenge.id,label+' failed database transaction leaves round resumable');
  }
  const result=await call('/api/community/challenge',{actor:alice,method:'POST',body:{id:next.data.challenge.id,answers:answers(next.data.challenge,1)}});check(result.data.correct&&result.data.score===4&&result.data.awarded===3&&result.data.credits.balance===41+(i+1)*3,label+' four of five earns three server-verified credits');
 }
 const capped=await start(alice);check(capped.data.challenge===null&&capped.data.credits.earnedToday===3&&capped.data.credits.attemptsToday===5&&capped.data.credits.dailyCreditLimit===9,label+' daily cap is three rewards and nine credits, with abandoned attempts counted');
 const concurrent=await Promise.all([start(bob),start(bob)]);check(concurrent.every(result=>result.data.challenge.id===concurrent[0].data.challenge.id),label+' concurrent start returns one persisted round');
 check((await call('/api/community/challenge',{actor:bob})).data.credits.attemptsToday===1,label+' concurrent start consumes one attempt');
 const raceRound=concurrent[0].data.challenge,raceAnswers=answers(raceRound),claims=await Promise.all([1,2].map(()=>call('/api/community/challenge',{actor:bob,method:'POST',body:{id:raceRound.id,answers:raceAnswers}})));
 check(claims.filter(result=>result.status===200).length===1&&claims.filter(result=>result.status===409).length===1,label+' concurrent answer claims settle once');
 check((await call('/api/community',{actor:bob})).data.credits.balance===3,label+' concurrent claims cannot duplicate reward');
 for(let i=0;i<5;i++){const attempt=await start(owner);await call('/api/community/challenge',{actor:owner,method:'POST',body:{id:attempt.data.challenge.id,answers:answers(attempt.data.challenge,2)}});}
 const attemptsCapped=await start(owner);check(attemptsCapped.data.challenge===null&&attemptsCapped.data.credits.attemptsRemaining===0&&attemptsCapped.data.credits.earnedToday===0,label+' five unsuccessful rounds exhaust attempts without awarding credits');
 const submitted=await call('/api/community/submissions/submit',{actor:alice,method:'POST',body:{id}});check(submitted.status===200&&submitted.data.submission.status==='pending'&&submitted.data.credits.balance===0,label+' spend exactly50 and queue');
 check((await call('/api/community/submissions/submit',{actor:alice,method:'POST',body:{id}})).data.credits.balance===0,label+' retry idempotent');
 check((await call('/api/community/submissions',{actor:alice,method:'PUT',body:{...input,id,photos:undefined}})).status===409,label+' pending cannot edit');
 check((await call('/api/community/cars')).data.cars.length===0,label+' pending never published');
 check((await call('/api/admin/moderation',{actor:alice,method:'POST',body:{id,action:'approve',note:''}})).status===401,label+' no owner self-approval');
 await DB.prepare('INSERT INTO user_verifications (user_id,verified_at) VALUES (?,?)').bind(owner.id,Date.now()).run();
 const publicOwnerLogin=await call('/api/auth/login',{method:'POST',body:{email:'owner@example.test',password}});
 check(publicOwnerLogin.data.user.isAdmin===false&&publicOwnerLogin.data.redirectTo==='/account',label+' public owner login stays in the public account');
 check((await call('/api/account/profile',{actor:owner})).data.user.isAdmin===false,label+' verified legacy account remains a member');
 check((await call('/api/community',{actor:owner})).data.isAdmin===false,label+' public community has no administrator role');
 check((await call('/api/admin/community',{actor:admin})).data.pending.length===1,label+' real private moderation queue');
 check((await call(photoURL,{actor:admin})).status===200,label+' dedicated administrator can inspect private photographs');
 check((await call('/api/admin/moderation',{actor:admin,method:'POST',body:{id,action:'approve',note:'Ownership and specification checked.'}})).status===200,label+' admin approval');
 const staleDecision=await call('/api/admin/moderation',{actor:admin,method:'POST',body:{id,action:'reject',note:'A note from the former pending review.',expectedStatus:'pending',expectedUpdatedAt:submitted.data.submission.updatedAt}});check(staleDecision.status===409&&staleDecision.data.code==='MODERATION_CHANGED',label+' an outdated pending form cannot unpublish a reviewed car');
 const staleVersion=await call('/api/admin/moderation',{actor:admin,method:'POST',body:{id,action:'reject',note:'An outdated note on an approved car.',expectedStatus:'approved',expectedUpdatedAt:'2000-01-01T00:00:00.000Z'}});check(staleVersion.status===409&&staleVersion.data.code==='MODERATION_CHANGED',label+' current status alone cannot authorize stale record details');
 const published=(await call('/api/community/cars?id='+id)).data.car;check(published.photos.length===1&&published.author.handle==='alice-driver',label+' approved card published');
 check(!JSON.stringify(published).includes('Private ownership')&&!('evidence'in published)&&!('moderationNote'in published)&&!('user_id'in published),label+' private proof never public');
 const binary=await call(photoURL);check(binary.status===200&&binary.headers.get('Content-Type')==='image/jpeg'&&binary.headers.get('Cache-Control').includes('no-store'),label+' approved binary photo');
 check((await call('/api/admin/moderation',{actor:admin,method:'POST',body:{id,action:'reject',note:'Please clarify the engine replacement history.'}})).status===200,label+' admin can unpublish');
 check((await call('/api/admin/moderation',{actor:admin,method:'POST',body:{id,action:'reject',note:'Repeated action must not add another decision.'}})).data.code==='MODERATION_CHANGED',label+' a duplicate change request cannot create another moderation action');
 check((await call('/api/community/cars?id='+id)).status===404&&(await call(photoURL)).status===404,label+' rejection revokes public car and photo');
 const edited=await call('/api/community/submissions',{actor:alice,method:'PUT',body:{...input,id,photos:undefined,description:input.description+' The engine replacement history is now attached.'}});check(edited.status===200&&edited.data.submission.photos.length===1,label+' rejected draft retains omitted photos');
 const captioned=await call('/api/community/submissions',{actor:alice,method:'PUT',body:{...input,id,photos:[{id:edited.data.submission.photos[0].id,caption:'Updated owner caption'}]}});check(captioned.status===200&&captioned.data.submission.photos[0].caption==='Updated owner caption',label+' owner edits retained photo caption');
 const again=await call('/api/community/submissions/submit',{actor:alice,method:'POST',body:{id}});check(again.status===200&&again.data.credits.balance===0,label+' same reviewed car correction free');
 const analytics=(await call('/api/admin/community',{actor:admin})).data;check(analytics.stats.accounts===3&&analytics.stats.pending===1&&analytics.stats.creditsEarned===53&&analytics.stats.creditsSpent===50&&analytics.recentActivity.length>=3,label+' database analytics accurate');
 check(!JSON.stringify(analytics).includes('password_hash'),label+' admin response excludes credentials');
 const vercel=createRoutedVercelHandler({environment:{DATABASE_URL:'postgresql://test:secret@test.invalid/isolated',ADMIN_LOGIN_EMAIL:env.ADMIN_LOGIN_EMAIL,ADMIN_PASSWORD_HASH:env.ADMIN_PASSWORD_HASH},connect:async()=>DB});
 check((await vercel(new Request(origin+'/api/community/cars'))).status===200,label+' shared serverless community route');
 check((await vercel(new Request(origin+'/api/admin/community',{headers:{Cookie:admin.cookie}}))).status===200,label+' serverless administrator environment forwarded');
 check((await vercel(new Request(origin+'/api/router?__apex_route=community/cars'))).status===200,label+' explicit community rewrite reaches the database');
 check((await vercel(new Request(origin+'/api/router?__apex_route=admin/community',{headers:{Cookie:admin.cookie}}))).status===200,label+' explicit private rewrite retains isolated authentication');
 check((await call('/api/community/friends',{actor:alice,method:'DELETE',body:{id:request.data.id}})).status===200,label+' friend removal');
 check((await call('/api/community/friends',{actor:bob})).data.friends.length===0,label+' friend removed for both');
 let friendReaders=0,releaseFriends;const friendBarrier=new Promise(resolve=>{releaseFriends=resolve;});
 env.DB={...DB,prepare(sql){const statement=DB.prepare(sql);if(sql!=='SELECT id FROM community_friends WHERE pair_key = ?')return statement;return {...statement,bind(...values){const bound=statement.bind(...values);return {...bound,async first(...args){const row=await bound.first(...args);if(!row){if(++friendReaders===2)releaseFriends();await friendBarrier;}return row;}};}};}};
 const friendRace=await Promise.all([call('/api/community/friends',{actor:alice,method:'POST',body:{handle:'bob-driver'}}),call('/api/community/friends',{actor:bob,method:'POST',body:{handle:'alice-driver'}})]);env.DB=DB;
 check(friendRace.filter(r=>r.status===201).length===1&&friendRace.filter(r=>r.status===409&&r.data.code==='FRIEND_EXISTS').length===1,label+' concurrent friendship requests return one real ID and one conflict');
 const friendship=friendRace.find(r=>r.status===201);check(Boolean(await DB.prepare('SELECT id FROM community_friends WHERE id = ?').bind(friendship.data.id).first()),label+' successful friend response points to a persisted request');
 await call('/api/community/friends',{actor:alice,method:'DELETE',body:{id:friendship.data.id}});
 const reviewRace=(await call('/api/community/submissions',{actor:alice,method:'POST',body:{...input,title:'Competing reviewer record'}})).data.submission;
 await DB.prepare('UPDATE community_wallets SET balance = 50 WHERE user_id = ?').bind(alice.id).run();await call('/api/community/submissions/submit',{actor:alice,method:'POST',body:{id:reviewRace.id}});
 const beforeAudit=Number((await DB.prepare('SELECT COUNT(*) AS count FROM community_audit WHERE car_id = ?').bind(reviewRace.id).first()).count);
 const beforeFailedDecision=await DB.prepare('SELECT * FROM community_cars WHERE id = ?').bind(reviewRace.id).first();
 env.DB={...DB,batch(statements){return DB.batch([...statements,DB.prepare('INSERT INTO community_audit (id,actor_id,action,car_id,note,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),'missing-test-actor','test',reviewRace.id,'Injected rollback check',Date.now())]);}};
 const failedDecision=await call('/api/admin/moderation',{actor:admin,method:'POST',body:{id:reviewRace.id,action:'approve',note:'Do not persist a failed decision.'}});env.DB=DB;
 const afterFailedDecision=await DB.prepare('SELECT * FROM community_cars WHERE id = ?').bind(reviewRace.id).first();check(failedDecision.status===503&&afterFailedDecision.status===beforeFailedDecision.status&&afterFailedDecision.moderation_note===beforeFailedDecision.moderation_note&&afterFailedDecision.updated_at===beforeFailedDecision.updated_at,label+' failed moderation rolls back its private claim, state and timestamp');
 check(Number((await DB.prepare('SELECT COUNT(*) AS count FROM community_audit WHERE car_id = ?').bind(reviewRace.id).first()).count)===beforeAudit,label+' failed moderation does not create phantom audit activity');
 // Hold both reviewers after reading the same pending snapshot. Batch statements
 // stay original adapter statements, exercising actual atomic SQL and row locks.
 let readers=0,release;const barrier=new Promise(resolve=>{release=resolve;});
 env.DB={...DB,prepare(sql){const statement=DB.prepare(sql);if(sql!=='SELECT * FROM community_cars WHERE id = ?')return statement;return {...statement,bind(...values){const bound=statement.bind(...values);return {...bound,async first(...args){const row=await bound.first(...args);if(row?.id===reviewRace.id&&row.status==='pending'){if(++readers===2)release();await barrier;}return row;}};}};}};
 const decisions=await Promise.all([call('/api/admin/moderation',{actor:admin,method:'POST',body:{id:reviewRace.id,action:'approve',note:'Approved after review.'}}),call('/api/admin/moderation',{actor:admin,method:'POST',body:{id:reviewRace.id,action:'reject',note:'Please clarify the factory engine specification.'}})]);env.DB=DB;
 check(decisions.filter(r=>r.status===200).length===1&&decisions.filter(r=>r.data.code==='MODERATION_CHANGED').length===1,label+' stale competing reviewer gets conflict');
 const afterAudit=Number((await DB.prepare('SELECT COUNT(*) AS count FROM community_audit WHERE car_id = ?').bind(reviewRace.id).first()).count);check(afterAudit===beforeAudit+1,label+' competing moderation records only actual winning action');
 const reviewed=await DB.prepare('SELECT status FROM community_cars WHERE id = ?').bind(reviewRace.id).first(),decision=decisions.find(r=>r.status===200);check(reviewed.status===decision.data.submission.status,label+' moderation response matches committed result');
 // Race requests against the real database adapter. Seed funds only inside the
 // isolated test DB; the public API deliberately has no balance-grant endpoint.
 const draftA=(await call('/api/community/submissions',{actor:alice,method:'POST',body:{...input,title:'Concurrency car one'}})).data.submission;
 const draftB=(await call('/api/community/submissions',{actor:alice,method:'POST',body:{...input,title:'Concurrency car two'}})).data.submission;
 check((await call('/api/community/submissions',{actor:alice,method:'PUT',body:{...input,id:draftA.id,photos:[{id:edited.data.submission.photos[0].id}]}})).status===403,label+' photo reuse stays bound to exact car');
 await DB.prepare('UPDATE community_wallets SET balance = 50 WHERE user_id = ?').bind(alice.id).run();
 const raced=await Promise.all([draftA,draftB].map(car=>call('/api/community/submissions/submit',{actor:alice,method:'POST',body:{id:car.id}})));
 check(raced.filter(r=>r.status===200).length===1&&raced.filter(r=>r.data.code==='CREDITS_REQUIRED').length===1,label+' two concurrent cars cannot spend same50');
 check((await call('/api/community',{actor:alice})).data.credits.balance===0,label+' concurrent balance never negative');
 const same=(await call('/api/community/submissions',{actor:alice,method:'POST',body:{...input,title:'Concurrent retry car'}})).data.submission;
 await DB.prepare('UPDATE community_wallets SET balance = 100 WHERE user_id = ?').bind(alice.id).run();
 const retried=await Promise.all([1,2].map(()=>call('/api/community/submissions/submit',{actor:alice,method:'POST',body:{id:same.id}})));
 check(retried.every(r=>r.status===200),label+' concurrent retry returns pending success');
 check((await call('/api/community',{actor:alice})).data.credits.balance===50,label+' concurrent retry charges only once');
 env.ADMIN_USER_IDS=bob.id;check((await call('/api/community',{actor:bob})).data.isAdmin===false,label+' legacy immutable admin ID cannot grant dedicated access');
 const pinnedLogin=await call('/api/auth/login',{method:'POST',body:{email:'bob@example.test',password}});
 check(pinnedLogin.data.user.isAdmin===false&&pinnedLogin.data.redirectTo==='/account',label+' legacy administrator settings cannot redirect public login');
 delete env.ADMIN_USER_IDS;
 check((await call('/api/auth/session',{actor:bob})).data.user.isAdmin===false,label+' session role is recalculated when administrator access is revoked');
 check((await call('/api/admin/community',{actor:bob})).status===401,label+' public cookie cannot authenticate the administrator workspace');
 // Administrative pages must reach records beyond the former combined 100-row cap.
 const fixtures=Array.from({length:112},(_,index)=>({id:crypto.randomUUID(),status:index<105?'pending':index%2?'approved':'rejected',title:index===104?'Exact 100%_ review target':'Review fixture '+String(index).padStart(3,'0'),at:Date.now()-200000-index*1000}));
 await DB.batch(fixtures.map(item=>DB.prepare('INSERT INTO community_cars (id,user_id,title,model,year,engine,transmission,horsepower,description,modifications,evidence,status,created_at,updated_at,submitted_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(item.id,alice.id,item.title,'BMW E46',2003,'M54','Manual',231,input.description,'','Private review fixture',item.status,item.at,item.at,item.at)));
 const firstPage=await call('/api/admin/community?view=queue&pageSize=20',{actor:admin});
 check(firstPage.status===200&&firstPage.data.pagination.total>100&&firstPage.data.submissions.length===20&&firstPage.data.pagination.hasNext,label+' queue exposes true server total and bounded pages');
 const seenRows=new Set();for(let page=1;page<=firstPage.data.pagination.totalPages;page++){const result=await call('/api/admin/community?view=queue&pageSize=20&page='+page,{actor:admin});check(result.status===200&&result.data.submissions.every(car=>car.status==='pending'&&car.author.handle==='alice-driver'),label+' paginated queue retains ownership and status');for(const car of result.data.submissions){check(!seenRows.has(car.id),label+' deterministic page ordering avoids duplicate rows');seenRows.add(car.id);}}
 check(seenRows.size===firstPage.data.pagination.total,label+' every pending record is accessible beyond row100');
 const exact=await call('/api/admin/community?view=queue&q='+encodeURIComponent('100%_'),{actor:admin});check(exact.status===200&&exact.data.pagination.total===1&&exact.data.submissions[0].title==='Exact 100%_ review target',label+' search treats SQL wildcard characters literally');
 await DB.prepare('UPDATE community_cars SET title = ? WHERE id = ?').bind('ТЕСТ ᲢᲔᲡᲢᲘ',fixtures[0].id).run();for(const query of ['тест','ტესტი']){const found=await call('/api/admin/community?view=queue&q='+encodeURIComponent(query),{actor:admin});check(found.status===200&&found.data.submissions.some(car=>car.id===fixtures[0].id),label+' case-insensitive account-language search: '+query);}
 const ownerSearch=await call('/api/admin/community?view=history&q=alice-driver&status=approved',{actor:admin});check(ownerSearch.status===200&&ownerSearch.data.pagination.total>0&&ownerSearch.data.submissions.every(car=>car.status==='approved'),label+' history filters and searches owner on the server');
 const reversed=await call('/api/admin/community?view=queue&sort=newest&pageSize=1',{actor:admin});check(reversed.data.submissions[0].id!==firstPage.data.submissions[0].id,label+' queue sorting changes the actual server order');
 const emptyPage=await call('/api/admin/community?view=history&q=no-such-review-record&page=99',{actor:admin});check(emptyPage.data.pagination.page===1&&emptyPage.data.pagination.totalPages===1&&emptyPage.data.submissions.length===0,label+' empty search has a usable first page');
 for(const query of ['page=0','pageSize=101','page=1.5','view=unknown','sort=unknown','view=queue&status=approved'])check((await call('/api/admin/community?'+query,{actor:admin})).status===400,label+' invalid review filter is rejected: '+query);
 const metadata=firstPage.data.submissions[0];check(!('user_id'in metadata)&&!('data'in (metadata.photos[0]||{}))&&!JSON.stringify(firstPage.data).includes('password_hash'),label+' batch metadata retains private field boundaries');
 return {id,photoURL,alice,call};
}
try{
 const result=await suite(sqlite,'SQLite');sqlite.close();sqlite=await createLocalDatabase(filename);
 check((await sqlite.prepare('SELECT status FROM community_cars WHERE id = ?').bind(result.id).first()).status==='pending','SQLite car survives close/reopen');check((await sqlite.prepare('SELECT data FROM community_photos WHERE car_id = ?').bind(result.id).first()).data.length>100,'SQLite photo survives close/reopen');check((await sqlite.prepare('SELECT balance FROM community_wallets WHERE user_id = ?').bind(result.alice.id).first()).balance===50,'SQLite balance survives close/reopen');
 await suite(postgres,'PostgreSQL');console.log(`Community backend: ${checks} checks passed (SQLite persistence, real PostgreSQL, consent, friends, photos, server credits, private review and admin permissions).`);
}finally{sqlite.close();await pg.close();const resolved=path.resolve(directory),relative=path.relative(path.resolve(os.tmpdir()),resolved);if(relative.startsWith('..')||path.isAbsolute(relative)||!path.basename(resolved).startsWith('apex-community-'))throw new Error('Refusing to remove an unexpected test directory.');await fs.rm(resolved,{recursive:true,force:true});}
