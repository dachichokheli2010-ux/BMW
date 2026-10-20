import {validName,validateGarage} from './validation.js';
import {randomToken} from './passwords.js';
import {validateCommunityPhoto,decodePhotoBytes} from './community-photos.js';
import {communityQuestions} from './community-questions.js';
import {administratorAccess} from './admin-policy.js';

export const COMMUNITY_PATHS=new Set(['/api/community','/api/community/profile','/api/community/friends','/api/community/garage-share','/api/community/shared-garage','/api/community/cars','/api/community/submissions','/api/community/submissions/submit','/api/community/car-photo','/api/community/challenge','/api/admin/community','/api/admin/moderation']);
const COST=50,REWARD=5,DAILY=10;
const uuid=()=>crypto.randomUUID();
const iso=value=>value?new Date(value).toISOString():null;
const safeID=value=>typeof value==='string'&&/^[0-9a-f-]{36}$/.test(value);
const safeToken=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{43}$/.test(value);
const text=(value,min,max)=>typeof value==='string'&&value.trim().length>=min&&value.trim().length<=max&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
const only=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).every(k=>keys.includes(k));
const profile=row=>row?{handle:row.handle,displayName:row.display_name,bio:row.bio}:null;
const getProfile=(env,id)=>env.DB.prepare('SELECT handle,display_name,bio FROM community_profiles WHERE user_id = ?').bind(id).first();
const creditDay=()=>new Date().toISOString().slice(0,10);
async function wallet(env,id){
 const day=creditDay(),balance=await env.DB.prepare('SELECT balance FROM community_wallets WHERE user_id = ?').bind(id).first();
 const count=await env.DB.prepare('SELECT COUNT(*) AS count FROM community_credit_ledger WHERE user_id = ? AND reason = ? AND source_key LIKE ?').bind(id,'challenge',day+':%').first();
 return {balance:balance?.balance||0,submissionCost:COST,reward:REWARD,dailyLimit:DAILY,earnedToday:Number(count.count)};
}
async function shareState(env,id){const row=await env.DB.prepare('SELECT token FROM community_shares WHERE user_id = ?').bind(id).first();return row?{enabled:true,token:row.token,url:'/garage/'+row.token}:{enabled:false};}
async function photosFor(env,id){return (await env.DB.prepare('SELECT id,caption,width,height FROM community_photos WHERE car_id = ? ORDER BY position').bind(id).all()).results.map(row=>({...row,url:'/api/community/car-photo?id='+row.id}));}
async function carView(env,row,{privateView=false}={}){
 const result={id:row.id,title:row.title,model:row.model,year:row.year,engine:row.engine,transmission:row.transmission,horsepower:row.horsepower,description:row.description,modifications:row.modifications,status:row.status,createdAt:iso(row.created_at),updatedAt:iso(row.updated_at),submittedAt:iso(row.submitted_at),reviewedAt:iso(row.reviewed_at),author:profile(await getProfile(env,row.user_id)),photos:await photosFor(env,row.id)};
 if(privateView)Object.assign(result,{evidence:row.evidence,moderationNote:row.moderation_note,creditSpent:row.credit_spent});return result;
}
async function audit(env,user,action,carId,note=''){await env.DB.prepare('INSERT INTO community_audit (id,actor_id,action,car_id,note,created_at) VALUES (?,?,?,?,?,?)').bind(uuid(),user,action,carId,note,Date.now()).run();}
async function carInput(body,existing,env,ErrorClass){
 const keys=['id','title','model','year','engine','transmission','horsepower','description','modifications','evidence','photos'];
 if(!only(body,keys)||!text(body.title,3,80)||!text(body.model,2,80)||!Number.isInteger(body.year)||body.year<1928||body.year>new Date().getUTCFullYear()+1||!text(body.engine,2,100)||!text(body.transmission,2,80)||!(body.horsepower===null||body.horsepower===undefined||Number.isInteger(body.horsepower)&&body.horsepower>=1&&body.horsepower<=3000)||!text(body.description,30,4000)||!text(body.modifications??'',0,1500)||!text(body.evidence??'',0,2000))throw new ErrorClass('Complete the title, model, year, engine, transmission and a description of at least 30 characters.',400,'INVALID_CAR');
 let photos=null;if(body.photos!==undefined){
  if(!Array.isArray(body.photos)||body.photos.length>3)throw new ErrorClass('Add up to three car photos.',400,'INVALID_PHOTOS');
  photos=[];const ids=new Set();
  for(const value of body.photos){
   if(only(value,['id','caption'])&&safeID(value.id)&&existing){if(ids.has(value.id))throw new ErrorClass('Each photo can appear once.');ids.add(value.id);const photo=await env.DB.prepare('SELECT * FROM community_photos WHERE id = ? AND car_id = ?').bind(value.id,existing.id).first();if(!photo)throw new ErrorClass('This photo does not belong to your submission.',403);if(value.caption!==undefined){if(!text(value.caption,0,150)||/[\u0000-\u001f\u007f]/.test(value.caption))throw new ErrorClass('Use a photo caption of at most 150 characters.');photo.caption=value.caption.trim();}photos.push(photo);}
   else{try{photos.push({id:uuid(),...validateCommunityPhoto(value)});}catch(error){throw new ErrorClass(error.message,400,'INVALID_PHOTO');}}
  }
 }
 return {title:body.title.trim(),model:body.model.trim(),year:body.year,engine:body.engine.trim(),transmission:body.transmission.trim(),horsepower:body.horsepower??null,description:body.description.trim(),modifications:(body.modifications??'').trim(),evidence:(body.evidence??'').trim(),photos};
}

export async function handleCommunity(request,env,context){
 const {session,ApiError,readJSON,requireCSRF,authRequired,limit,json,sessionHeaders}=context;
 const url=new URL(request.url),path=url.pathname,method=request.method,user=session?.user,{isAdmin}=administratorAccess(env,user);
 const respond=(body,status=200)=>json(body,status,sessionHeaders(session));
 const allowed=methods=>{if(!methods.includes(method))throw new ApiError('Method not allowed.',405);};
 const requireProfile=async()=>{const p=await getProfile(env,user.id);if(!p)throw new ApiError('Create your public driver profile first.',409,'PROFILE_REQUIRED');return p;};
 const requireAdmin=()=>{authRequired(session);if(!isAdmin)throw new ApiError('Administrator access is required.',403,'ADMIN_REQUIRED');};
 const publicRead=method==='GET'&&['/api/community/cars','/api/community/car-photo','/api/community/shared-garage'].includes(path);
 if(!publicRead)authRequired(session);
 if(['POST','PUT','PATCH','DELETE'].includes(method))requireCSRF(request,session);

 if(path==='/api/community'){
  allowed(['GET']);const counts=await env.DB.prepare('SELECT COUNT(*) AS count FROM community_cars WHERE user_id = ?').bind(user.id).first();
  return respond({profile:profile(await getProfile(env,user.id)),credits:await wallet(env,user.id),isAdmin,share:await shareState(env,user.id),counts:{submissions:Number(counts.count)}});
 }
 if(path==='/api/community/profile'){
  allowed(['PUT']);await limit(env,'community-profile:'+user.id,20,60000);const body=await readJSON(request);
  if(!only(body,['handle','displayName','bio'])||typeof body.handle!=='string'||!/^[a-z0-9][a-z0-9-]{2,23}$/.test(body.handle)||['admin','administrator','apex','support','moderator'].includes(body.handle)||!validName(body.displayName)||!text(body.bio??'',0,240))throw new ApiError('Use a 3–24 character lowercase handle, a public name and a short bio.',400,'INVALID_PROFILE');
  const other=await env.DB.prepare('SELECT user_id FROM community_profiles WHERE handle = ?').bind(body.handle).first();if(other&&other.user_id!==user.id)throw new ApiError('This driver handle is already in use.',409,'HANDLE_TAKEN');
  const now=Date.now();try{await env.DB.prepare('INSERT INTO community_profiles (user_id,handle,display_name,bio,created_at,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET handle = excluded.handle,display_name = excluded.display_name,bio = excluded.bio,updated_at = excluded.updated_at').bind(user.id,body.handle,body.displayName.trim(),(body.bio??'').trim(),now,now).run();}catch{throw new ApiError('This driver handle is already in use.',409,'HANDLE_TAKEN');}
  return respond({profile:profile(await getProfile(env,user.id))});
 }
 if(path==='/api/community/friends'){
  allowed(['GET','POST','PATCH','DELETE']);
  if(method==='GET'){
   const rows=(await env.DB.prepare('SELECT * FROM community_friends WHERE requester_id = ? OR recipient_id = ? ORDER BY updated_at DESC LIMIT 200').bind(user.id,user.id).all()).results;
   const lists={friends:[],incoming:[],outgoing:[]};for(const row of rows){const other=row.requester_id===user.id?row.recipient_id:row.requester_id,p=await getProfile(env,other);if(p){const share=row.status==='accepted'?await shareState(env,other):{enabled:false};lists[row.status==='accepted'?'friends':row.recipient_id===user.id?'incoming':'outgoing'].push({id:row.id,profile:profile(p),createdAt:iso(row.created_at),...(share.enabled?{garageUrl:share.url}:{})});}}return respond(lists);
  }
  await requireProfile();await limit(env,'community-friends:'+user.id,30,60000);const body=await readJSON(request);
  if(method==='POST'){
   if(!only(body,['handle'])||typeof body.handle!=='string')throw new ApiError('Enter a driver handle.');const recipient=await env.DB.prepare('SELECT user_id FROM community_profiles WHERE handle = ?').bind(body.handle.trim().toLowerCase()).first();if(!recipient)throw new ApiError('No driver with this handle was found.',404);if(recipient.user_id===user.id)throw new ApiError('Choose another driver.');
   const pair=[user.id,recipient.user_id].sort().join('|'),existing=await env.DB.prepare('SELECT id FROM community_friends WHERE pair_key = ?').bind(pair).first();if(existing)throw new ApiError('You already have a request or friendship with this driver.',409);
   const count=await env.DB.prepare('SELECT COUNT(*) AS count FROM community_friends WHERE requester_id = ? OR recipient_id = ?').bind(user.id,user.id).first();if(Number(count.count)>=200)throw new ApiError('Your friend list is full. Remove an old request first.',409);
   const id=uuid(),now=Date.now(),created=await env.DB.prepare("INSERT INTO community_friends (id,requester_id,recipient_id,pair_key,status,created_at,updated_at) VALUES (?,?,?,?,'pending',?,?) ON CONFLICT(pair_key) DO NOTHING RETURNING id").bind(id,user.id,recipient.user_id,pair,now,now).first();
   if(!created)throw new ApiError('You already have a request or friendship with this driver.',409,'FRIEND_EXISTS');
   return respond({id:created.id,message:'Friend request sent.'},201);
  }
  if(!only(body,method==='PATCH'?['id','action']:['id'])||!safeID(body.id))throw new ApiError('Choose a valid friend request.');
  const row=await env.DB.prepare('SELECT * FROM community_friends WHERE id = ?').bind(body.id).first();if(!row||![row.requester_id,row.recipient_id].includes(user.id))throw new ApiError('Friend request not found.',404);
  if(method==='PATCH'){
   if(row.recipient_id!==user.id||row.status!=='pending'||!['accept','decline'].includes(body.action))throw new ApiError('Only the recipient can respond to a pending request.',403);
   if(body.action==='accept')await env.DB.prepare("UPDATE community_friends SET status = 'accepted',updated_at = ? WHERE id = ? AND recipient_id = ? AND status = 'pending'").bind(Date.now(),row.id,user.id).run();else await env.DB.prepare('DELETE FROM community_friends WHERE id = ? AND recipient_id = ?').bind(row.id,user.id).run();
  }else await env.DB.prepare('DELETE FROM community_friends WHERE id = ?').bind(row.id).run();return respond({ok:true});
 }
 if(path==='/api/community/garage-share'){
  allowed(['GET','POST','DELETE']);if(method==='GET')return respond(await shareState(env,user.id));await limit(env,'community-share:'+user.id,10,60000);
  if(method==='DELETE'){await env.DB.prepare('DELETE FROM community_shares WHERE user_id = ?').bind(user.id).run();return respond({enabled:false});}
  await requireProfile();await env.DB.prepare('INSERT INTO community_shares (user_id,token,created_at) VALUES (?,?,?) ON CONFLICT(user_id) DO NOTHING').bind(user.id,randomToken(),Date.now()).run();return respond(await shareState(env,user.id));
 }
 if(path==='/api/community/shared-garage'){
  allowed(['GET']);const token=url.searchParams.get('token');if(!safeToken(token))throw new ApiError('Shared garage not found.',404);
  const row=await env.DB.prepare('SELECT community_shares.user_id,user_garages.state,user_garages.updated_at FROM community_shares LEFT JOIN user_garages ON user_garages.user_id = community_shares.user_id WHERE community_shares.token = ?').bind(token).first();if(!row)throw new ApiError('This garage link is unavailable or was revoked.',404);
  let garage={favorites:[],builds:[]};if(row.state){try{const {_academyReceipts,...raw}=JSON.parse(row.state),valid=validateGarage(raw);if(valid)garage={favorites:valid.favorites,builds:valid.builds.map(({name,modelId,config})=>({name,modelId,config}))};}catch{}}
  return respond({owner:profile(await getProfile(env,row.user_id)),garage,updatedAt:iso(row.updated_at)});
 }
 if(path==='/api/community/challenge'){
  allowed(['GET','POST']);await limit(env,'community-challenge:'+user.id,90,60*60*1000);const now=Date.now(),credits=await wallet(env,user.id);
  if(method==='GET'){
   await env.DB.prepare('DELETE FROM community_challenges WHERE user_id = ? OR expires_at <= ?').bind(user.id,now).run();
   if(credits.earnedToday>=DAILY)return respond({challenge:null,credits,message:'Today’s credit rewards are complete. More challenges unlock tomorrow (UTC).'});
   const completed=(await env.DB.prepare('SELECT source_key FROM community_credit_ledger WHERE user_id = ? AND reason = ? AND source_key LIKE ?').bind(user.id,'challenge',creditDay()+':%').all()).results.map(r=>r.source_key.split(':').slice(1).join(':'));
   const available=communityQuestions.filter(q=>!completed.includes(q.id)),random=new Uint32Array(1);crypto.getRandomValues(random);const q=available[random[0]%available.length],id=uuid();await env.DB.prepare('INSERT INTO community_challenges (id,user_id,question_id,created_at,expires_at) VALUES (?,?,?,?,?)').bind(id,user.id,q.id,now,now+10*60*1000).run();return respond({challenge:{id,prompt:q.prompt,options:q.options},credits});
  }
  const body=await readJSON(request);if(!only(body,['id','answer'])||!safeID(body.id)||!Number.isInteger(body.answer)||body.answer<0||body.answer>2)throw new ApiError('Choose an answer to this credit challenge.');
  const claim=await env.DB.prepare('DELETE FROM community_challenges WHERE id = ? AND user_id = ? AND expires_at > ? RETURNING question_id').bind(body.id,user.id,now).first();if(!claim)throw new ApiError('This challenge was answered or expired. Start another one.',409,'CHALLENGE_USED');
  const q=communityQuestions.find(q=>q.id===claim.question_id);if(!q)throw new ApiError('Start a fresh challenge.',409);const correct=q.answer===body.answer;
  if(correct){const id=uuid(),source=creditDay()+':'+q.id;await env.DB.batch([
   env.DB.prepare('INSERT INTO community_wallets (user_id,balance,updated_at) VALUES (?,0,?) ON CONFLICT(user_id) DO NOTHING').bind(user.id,now),
   env.DB.prepare('UPDATE community_wallets SET updated_at = ? WHERE user_id = ?').bind(now,user.id),
   env.DB.prepare("INSERT INTO community_credit_ledger (id,user_id,amount,reason,source_key,created_at) SELECT ?,?,?,'challenge',?,? WHERE (SELECT COUNT(*) FROM community_credit_ledger WHERE user_id = ? AND reason = 'challenge' AND source_key LIKE ?) < ? ON CONFLICT(user_id,source_key) DO NOTHING").bind(id,user.id,REWARD,source,now,user.id,creditDay()+':%',DAILY),
   env.DB.prepare('UPDATE community_wallets SET balance = balance + ?,updated_at = ? WHERE user_id = ? AND EXISTS (SELECT 1 FROM community_credit_ledger WHERE id = ?)').bind(REWARD,now,user.id,id)
  ]);}
  return respond({correct,explanation:q.explanation,credits:await wallet(env,user.id)});
 }
 if(path==='/api/community/car-photo'){
  allowed(['GET']);const id=url.searchParams.get('id');if(!safeID(id))throw new ApiError('Photo not found.',404);const photo=await env.DB.prepare('SELECT community_photos.*,community_cars.user_id,community_cars.status FROM community_photos INNER JOIN community_cars ON community_cars.id = community_photos.car_id WHERE community_photos.id = ?').bind(id).first();if(!photo||photo.status!=='approved'&&photo.user_id!==user?.id&&!isAdmin)throw new ApiError('Photo not found.',404);
  return new Response(decodePhotoBytes(photo.data),{headers:{'Content-Type':photo.mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'",...sessionHeaders(session)}});
 }
 if(path==='/api/community/cars'){
  allowed(['GET']);const id=url.searchParams.get('id');if(id){if(!safeID(id))throw new ApiError('Car not found.',404);const row=await env.DB.prepare("SELECT * FROM community_cars WHERE id = ? AND status = 'approved'").bind(id).first();if(!row)throw new ApiError('Car not found.',404);return respond({car:await carView(env,row)});}
  const rows=(await env.DB.prepare("SELECT * FROM community_cars WHERE status = 'approved' ORDER BY reviewed_at DESC,id DESC LIMIT 60").all()).results;return respond({cars:await Promise.all(rows.map(row=>carView(env,row)))});
 }
 if(path==='/api/community/submissions'){
  allowed(['GET','POST','PUT']);
  if(method==='GET'){
   const id=url.searchParams.get('id');if(id){if(!safeID(id))throw new ApiError('Submission not found.',404);const row=await env.DB.prepare('SELECT * FROM community_cars WHERE id = ?').bind(id).first();if(!row||row.user_id!==user.id&&!isAdmin)throw new ApiError('Submission not found.',404);return respond({submission:await carView(env,row,{privateView:true})});}
   const rows=(await env.DB.prepare('SELECT * FROM community_cars WHERE user_id = ? ORDER BY updated_at DESC LIMIT 30').bind(user.id).all()).results;return respond({submissions:await Promise.all(rows.map(row=>carView(env,row,{privateView:true})))});
  }
  await requireProfile();await limit(env,'community-car-write:'+user.id,30,60*60*1000);const body=await readJSON(request,900*1024);let existing=null;
  if(method==='PUT'){if(!safeID(body?.id))throw new ApiError('Choose your draft.');existing=await env.DB.prepare('SELECT * FROM community_cars WHERE id = ? AND user_id = ?').bind(body.id,user.id).first();if(!existing)throw new ApiError('Submission not found.',404);if(!['draft','rejected'].includes(existing.status))throw new ApiError('Only drafts or rejected submissions can be edited.',409);}
  else{const count=await env.DB.prepare('SELECT COUNT(*) AS count FROM community_cars WHERE user_id = ?').bind(user.id).first();if(Number(count.count)>=30)throw new ApiError('You have reached the 30-car submission limit.',409);}
  const value=await carInput(body,existing,env,ApiError),id=existing?.id||uuid(),now=Date.now();
  const statements=[existing?env.DB.prepare("UPDATE community_cars SET title = ?,model = ?,year = ?,engine = ?,transmission = ?,horsepower = ?,description = ?,modifications = ?,evidence = ?,status = 'draft',updated_at = ? WHERE id = ? AND user_id = ? AND status IN ('draft','rejected')").bind(value.title,value.model,value.year,value.engine,value.transmission,value.horsepower,value.description,value.modifications,value.evidence,now,id,user.id):env.DB.prepare("INSERT INTO community_cars (id,user_id,title,model,year,engine,transmission,horsepower,description,modifications,evidence,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,'draft',?,?)").bind(id,user.id,value.title,value.model,value.year,value.engine,value.transmission,value.horsepower,value.description,value.modifications,value.evidence,now,now)];
  if(value.photos!==null){statements.push(env.DB.prepare("DELETE FROM community_photos WHERE car_id = ? AND EXISTS (SELECT 1 FROM community_cars WHERE id = ? AND status = 'draft')").bind(id,id));for(const [position,p]of value.photos.entries())statements.push(env.DB.prepare("INSERT INTO community_photos (id,car_id,mime,data,width,height,caption,position) SELECT ?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM community_cars WHERE id = ? AND status = 'draft')").bind(p.id,id,p.mime,p.data,p.width,p.height,p.caption,position,id));}
  await env.DB.batch(statements);return respond({submission:await carView(env,await env.DB.prepare('SELECT * FROM community_cars WHERE id = ?').bind(id).first(),{privateView:true})},existing?200:201);
 }
 if(path==='/api/community/submissions/submit'){
  allowed(['POST']);await requireProfile();await limit(env,'community-submit:'+user.id,12,60*60*1000);const body=await readJSON(request);if(!only(body,['id'])||!safeID(body.id))throw new ApiError('Choose a saved draft.');const row=await env.DB.prepare('SELECT * FROM community_cars WHERE id = ? AND user_id = ?').bind(body.id,user.id).first();if(!row)throw new ApiError('Submission not found.',404);if(row.status==='pending')return respond({submission:await carView(env,row,{privateView:true}),credits:await wallet(env,user.id)});if(!['draft','rejected'].includes(row.status))throw new ApiError('This car is already published.',409);
  if(!(await photosFor(env,row.id)).length)throw new ApiError('Add at least one real car photo before submitting.',400,'PHOTO_REQUIRED');if(!row.evidence.trim())throw new ApiError('Add information that helps the administrator check ownership and specifications.',400,'EVIDENCE_REQUIRED');
  const operation=uuid(),now=Date.now(),charge=row.credit_spent>=COST?0:COST;
  await env.DB.batch([
   env.DB.prepare("UPDATE community_cars SET updated_at = ? WHERE id = ? AND user_id = ? AND status IN ('draft','rejected')").bind(now,row.id,user.id),
   env.DB.prepare('INSERT INTO community_wallets (user_id,balance,updated_at) VALUES (?,0,?) ON CONFLICT(user_id) DO NOTHING').bind(user.id,now),
   env.DB.prepare("UPDATE community_wallets SET balance = balance - ?,last_operation = ?,updated_at = ? WHERE user_id = ? AND balance >= ? AND EXISTS (SELECT 1 FROM community_cars WHERE id = ? AND user_id = ? AND status IN ('draft','rejected'))").bind(charge,operation,now,user.id,charge,row.id,user.id),
   env.DB.prepare("INSERT INTO community_credit_ledger (id,user_id,amount,reason,source_key,created_at) SELECT ?,?,?,'submission',?,? WHERE EXISTS (SELECT 1 FROM community_wallets WHERE user_id = ? AND last_operation = ?)").bind(operation,user.id,-charge,'submit:'+operation,now,user.id,operation),
   env.DB.prepare("UPDATE community_cars SET status = 'pending',credit_spent = ?,submitted_at = ?,updated_at = ? WHERE id = ? AND user_id = ? AND status IN ('draft','rejected') AND EXISTS (SELECT 1 FROM community_wallets WHERE user_id = ? AND last_operation = ?)").bind(COST,now,now,row.id,user.id,user.id,operation),
   env.DB.prepare("INSERT INTO community_audit (id,actor_id,action,car_id,note,created_at) SELECT ?,?,'submitted',?,'',? WHERE EXISTS (SELECT 1 FROM community_wallets WHERE user_id = ? AND last_operation = ?)").bind(uuid(),user.id,row.id,now,user.id,operation)
  ]);
  const fresh=await env.DB.prepare('SELECT * FROM community_cars WHERE id = ?').bind(row.id).first();if(fresh.status!=='pending')throw new ApiError('Earn 50 verified community credits before submitting this car.',409,'CREDITS_REQUIRED');return respond({submission:await carView(env,fresh,{privateView:true}),credits:await wallet(env,user.id)});
 }
 if(path==='/api/admin/community'){
  allowed(['GET']);requireAdmin();const count=async(sql,values=[])=>Number((await env.DB.prepare(sql).bind(...values).first()).count);
  const stats={accounts:await count('SELECT COUNT(*) AS count FROM users'),drivers:await count('SELECT COUNT(*) AS count FROM community_profiles'),sharedGarages:await count('SELECT COUNT(*) AS count FROM community_shares'),friendships:await count("SELECT COUNT(*) AS count FROM community_friends WHERE status = 'accepted'"),drafts:await count("SELECT COUNT(*) AS count FROM community_cars WHERE status = 'draft'"),pending:await count("SELECT COUNT(*) AS count FROM community_cars WHERE status = 'pending'"),approved:await count("SELECT COUNT(*) AS count FROM community_cars WHERE status = 'approved'"),rejected:await count("SELECT COUNT(*) AS count FROM community_cars WHERE status = 'rejected'"),creditsEarned:Number((await env.DB.prepare('SELECT COALESCE(SUM(amount),0) AS total FROM community_credit_ledger WHERE amount > 0').first()).total),creditsSpent:Number((await env.DB.prepare('SELECT COALESCE(SUM(-amount),0) AS total FROM community_credit_ledger WHERE amount < 0').first()).total)};
  const rows=(await env.DB.prepare("SELECT * FROM community_cars WHERE status IN ('pending','approved','rejected') ORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END,updated_at DESC LIMIT 100").all()).results,submissions=await Promise.all(rows.map(row=>carView(env,row,{privateView:true}))),activity=(await env.DB.prepare('SELECT action,car_id,note,created_at FROM community_audit ORDER BY created_at DESC LIMIT 50').all()).results.map(row=>({action:row.action,carId:row.car_id,note:row.note,createdAt:iso(row.created_at)}));return respond({stats,pending:submissions.filter(c=>c.status==='pending'),submissions,recentActivity:activity});
 }
 if(path==='/api/admin/moderation'){
  allowed(['POST']);requireAdmin();await limit(env,'community-moderation:'+user.id,100,60000);const body=await readJSON(request);if(!only(body,['id','action','note'])||!safeID(body.id)||!['approve','reject'].includes(body.action)||!text(body.note??'',0,1000)||body.action==='reject'&&!(body.note??'').trim())throw new ApiError('Choose approve or reject and give a reason for rejection.');const row=await env.DB.prepare('SELECT * FROM community_cars WHERE id = ?').bind(body.id).first();if(!row||!['pending','approved','rejected'].includes(row.status))throw new ApiError('Submitted car not found.',404);if(body.action==='approve'&&row.status!=='pending')throw new ApiError('Only a pending submission can be approved.',409);const now=Date.now(),status=body.action==='approve'?'approved':'rejected',operation=uuid();await env.DB.batch([
   // Lock the record before checking its status again. On PostgreSQL a competing
   // reviewer waits here; the following statement sees the committed decision.
   env.DB.prepare('UPDATE community_cars SET updated_at = ? WHERE id = ? AND status = ?').bind(now,row.id,row.status),
   env.DB.prepare('INSERT INTO community_audit (id,actor_id,action,car_id,note,created_at) SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM community_cars WHERE id = ? AND status = ?)').bind(operation,user.id,status,row.id,(body.note??'').trim(),now,row.id,row.status),
   env.DB.prepare('UPDATE community_cars SET status = ?,moderation_note = ?,moderated_by = ?,reviewed_at = ?,updated_at = ? WHERE id = ? AND status = ? AND EXISTS (SELECT 1 FROM community_audit WHERE id = ?)').bind(status,(body.note??'').trim(),user.id,now,now,row.id,row.status,operation)
  ]);
  if(!await env.DB.prepare('SELECT id FROM community_audit WHERE id = ?').bind(operation).first())throw new ApiError('Another reviewer changed this car. Refresh the queue before making a decision.',409,'MODERATION_CHANGED');
  return respond({submission:await carView(env,await env.DB.prepare('SELECT * FROM community_cars WHERE id = ?').bind(row.id).first(),{privateView:true})});
 }
 return null;
}
