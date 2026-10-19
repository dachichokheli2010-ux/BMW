import './page-entry.js';
import {mountIcons} from './icons.js';
import {account} from './account-sync.js';
import {allModels,allElectricModels,officialCredits} from './catalog.js';
import {mountBuyingLinks} from './marketplaces.js';
import {mountGalleryEnhancements} from './gallery-enhancements.js';
import {applyResponsivePhoto,photoBlurStyle} from './responsive-photos.js';
import {nextModels,nextElectricModels,nextCredits,photoUpgrades} from './next-models.js';
import {editorialCredits} from './editorial-credits.js';
import {extendedModels,extendedElectricModels,extendedCredits} from './extended-models.js';
import {mountCollection,isElectric} from './collection.js';
import {mountPlatform} from './platform.js';
import {mountDropdowns} from './dropdowns.js';
const normalizeSearch=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
import {mountTurboGuide} from './turbo-types.js';
import {partCatalog,partPhotoCredits} from './parts.js';
import {models as combustion,credits} from './models.js';
import {additionalModels,electricModels,newCredits} from './new-models.js';
import {galleries} from './galleries.js';import {exactViews,exactCredits} from './exact-views.js';
import {threeModels} from './three-models.js';
import {recordingFamilies,recordingModels} from './recordings.js';
import './retention-translations.js';

const electric=document.body.dataset.page==='electric';
const iconUI=mountIcons(document);window.addEventListener('pagehide',event=>{if(!event.persisted)iconUI.destroy();});
document.querySelectorAll('[data-model-total],[data-m-total]').forEach(node=>{node.classList.add('count-skeleton');node.setAttribute('aria-busy','true');});

const featured=['g81-m3-touring','g82-m4-csl','g87-m2','g80','g99-m5-touring','f92-m8','e46-m3-csl','g90-m5','g60-i5','e30-m3','g15-m850i','g29-z4'];
const models=[...(electric?allElectricModels:allModels)].sort((a,b)=>(featured.includes(a.id)?featured.indexOf(a.id):100)-(featured.includes(b.id)?featured.indexOf(b.id):100));
const $=s=>document.querySelector(s),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let current=null,view='car',activePart=0,angle=0,recording=0,zoom=1,pan={x:0,y:0},drag=null,toastTimer,photoRequest=0,collectionScroll=0;
let routeReady=false,fromHistory=false;
const photoCreditLine=document.createElement('p');photoCreditLine.className='active-photo-credit';document.querySelector('.gallery-caption').after(photoCreditLine);
const specSourceLine=document.createElement('p'),specSourceLink=document.createElement('a');
specSourceLine.className='spec-source-line';specSourceLine.hidden=true;
specSourceLink.target='_blank';specSourceLink.rel='noopener noreferrer';specSourceLine.append(specSourceLink);
document.querySelector('.machine-bar').after(specSourceLine);
window.addEventListener('apex:modelselected',()=>{
 const source=current?.source;
 specSourceLine.hidden=typeof source!=='string'||!/^https:\/\//i.test(source);
 if(!specSourceLine.hidden){specSourceLink.href=source;specSourceLink.dataset.i18n='Factory specification source';specSourceLink.textContent='Factory specification source';}
});
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
function dialog(html){$('#dialog').classList.remove('part-dialog','photo-dialog');$('#dialogbody').innerHTML=html;$('#dialog').setAttribute('aria-label',$('#dialogbody h2')?.textContent||'BMW details');$('#dialog').showModal();}
$('#close').onclick=()=>$('#dialog').close();$('#dialog').onclick=e=>{if(e.target===$('#dialog'))$('#dialog').close();};
const buyingUI=mountBuyingLinks({container:$('#buying-links'),getModel:()=>current});
const galleryUI=mountGalleryEnhancements({getCurrent:()=>current,getMode:()=>view,getPhotos:views,getIndex:()=>angle,onSelect:choosePhoto,openDialog:dialog});
function clearAudioPlayers(){$('#recordingplayer').querySelectorAll('iframe').forEach(x=>x.remove());$('#playrecording').textContent='Play recording';$('#playrecording').setAttribute('aria-pressed','false');}
function clearPlayers(){clearAudioPlayers();$('#threeplayer').querySelectorAll('iframe').forEach(x=>x.remove());$('#threeentry').hidden=false;$('#retrythree').hidden=true;}
function views(){return current?.approvedPhotos?.[view==='engine'?'engine':'car']||[];}
function selectedPhoto(){return views()[angle];}
function selectModel(id){if(routeReady&&!['/models','/electric'].includes(location.pathname)&&!location.pathname.startsWith('/cars/')){location.href='/models?model='+encodeURIComponent(id);return;}const m=models.find(x=>x.id===id);if(!m)return;if(!$('#collection').hidden)collectionScroll=Math.max(0,window.scrollY);current=m;document.querySelectorAll('.home-feature').forEach(el=>el.hidden=true);$('#soundstudio').hidden=isElectric(m);$('#inspect').textContent=isElectric(m)?'Explore electric systems':'Inspect the engine';$('#engineview').textContent=isElectric(m)?'Powertrain':'Engine';const specLabels=document.querySelectorAll('.machine-bar>div>span');specLabels[0].textContent=m.powerScope||'FACTORY POWER';specLabels[2].textContent=isElectric(m)?'DRIVE LAYOUT':'ENGINE LAYOUT';specLabels[3].textContent=isElectric(m)?'BATTERY ENERGY':'INDUCTION';let target='/cars/'+encodeURIComponent(id);if(!routeReady){const entry=new URLSearchParams(location.search);if((entry.get('model')===id||location.pathname==='/cars/'+id)&&entry.get('view')==='engine'){target+='?view=engine';const part=entry.get('part');if(part!==null&&/^\d+$/.test(part))target+='&part='+encodeURIComponent(part);}}if(routeReady&&!fromHistory&&location.pathname+location.search!==target)history.pushState({apexModel:true},'',target);else if(!fromHistory)history.replaceState(history.state,'',target);$('#partslibrary').hidden=true;$('#aboutpage').hidden=true;$('#collection').hidden=true;$('#compare-tray').hidden=true;$('#explorer').hidden=false;$('#breadcrumbmodel').textContent=m.name+' / '+m.generation.split(' / ')[1].trim();window.scrollTo({top:0,behavior:'instant'});clearPlayers();if($('#dialog').open)$('#dialog').close();recording=0;$('#modelselect').value=id;$('#modeltitle').innerHTML=m.title;$('#generation').textContent=m.generation;$('#modelsubtitle').textContent=m.subtitle;$('#badgecode').textContent=m.code;$('#badgelayout').textContent=m.shortLayout;$('#power').innerHTML=esc(m.power)+' <small>'+esc(m.powerUnit)+'</small>';$('#torque').innerHTML=esc(m.torque)+' <small>'+esc(m.torqueUnit)+'</small>';$('#layout').textContent=m.layout;$('#induction').textContent=m.induction;$('#market').textContent=m.market;$('#enginecode').textContent=m.code;$('#enginedescription').textContent=m.description;$('#enginenote').textContent=m.imageNote;$('#parttabs').innerHTML=m.parts.map((p,i)=>`<button data-part="${i}">${esc(p.name)}</button>`).join('');document.querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>setPart(+b.dataset.part));setPart(0);document.querySelectorAll('[data-model]').forEach(b=>{const on=b.dataset.model===id;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});collectionUI.recordViewed(m.id);buyingUI.refresh(m);setView('car');if(!isElectric(m))renderRecording();window.dispatchEvent(new CustomEvent('apex:modelselected',{detail:{id:m.id}}));}
function syncModelViewURL(){
 if(!routeReady||fromHistory||!current||!location.pathname.startsWith('/cars/'))return;
 const url=new URL(location.href);url.searchParams.delete('view');url.searchParams.delete('part');
 if(view==='engine'){url.searchParams.set('view','engine');if(activePart>0)url.searchParams.set('part',String(activePart));}
 const address=url.pathname+url.search+url.hash;
 if(address!==location.pathname+location.search+location.hash)history.replaceState(history.state,'',address);
}
function setPart(i){const p=current.parts[i];if(!p)return;activePart=i;$('#parttitle').textContent=p.title;$('#partbody').textContent=p.text;document.querySelectorAll('[data-part]').forEach(b=>{const active=+b.dataset.part===i;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});syncModelViewURL();}
function setView(next){photoRequest++;$('#photoloading').hidden=true;$('#showroom').classList.remove('photo-pending');$('#directiontabs').hidden=next!=='car';$('#directionstatus').hidden=next!=='car';view=next;angle=0;zoom=1;pan={x:0,y:0};drag=null;$('#threeplayer').querySelectorAll('iframe').forEach(x=>x.remove());$('#threeplayer').style.backgroundImage='none';$('#showroom').classList.toggle('engine-mode',next==='engine');$('#showroom').classList.toggle('three-mode',next==='three');$('#enginecanvas').hidden=next!=='engine';$('#enginedetails').hidden=next!=='engine';$('#stagebottom').hidden=next!=='car';$('#threecanvas').hidden=next!=='three';$('.gallery-navigation').hidden=next==='three';$('#enginenote').hidden=next!=='engine';$('#enlargephoto').hidden=next==='three';for(const [id,state] of [['carview','car'],['engineview','engine'],['threeview','three']]){$('#'+id).classList.toggle('active',next===state);$('#'+id).setAttribute('aria-pressed',String(next===state));}$('#threeview').disabled=!threeModels[current.id];$('#threeview').hidden=!threeModels[current.id];$('#imagecredit').textContent=next==='three'?'3D source':'Photo source';if(next==='three'){photoCreditLine.hidden=true;$('#imagecredit').disabled=false;renderThree();galleryUI.render();}else renderGallery();transformImage();syncModelViewURL();}
$('#carview').onclick=()=>setView('car');$('#engineview').onclick=()=>setView('engine');$('#inspect').onclick=()=>setView('engine');$('#threeview').onclick=()=>{if(threeModels[current.id])setView('three');};
function renderGallery(){
 const list=views();angle=Math.min(angle,Math.max(0,list.length-1));const v=list[angle],engine=view==='engine',img=engine?$('#enginephoto'):$('#mainphoto'),request=++photoRequest;
 photoCreditLine.hidden=!v?.credit;if(v?.credit)photoCreditLine.innerHTML=esc(v.credit.author)+' · <a href="'+esc(v.credit.url)+'" target="_blank" rel="noopener noreferrer">'+esc(v.credit.license)+'</a>';
 $('#imagecredit').disabled=!v?.credit;
 $('#showroom').classList.remove('photo-pending');$('#imagestatus').hidden=!!v;$('#enlargephoto').disabled=!v;$('#previousphoto').disabled=angle<=0;$('#nextphoto').disabled=!list.length||angle>=list.length-1;
 $('#imagestatus').textContent=v?'Photograph unavailable. Choose another view.':engine?'A verified '+(isElectric(current)?'powertrain':'engine')+' photograph is not available. Component explanations remain available.':'Photo unavailable';
 img.hidden=!v;img.onload=null;img.onerror=null;
 if(v){applyResponsivePhoto(img,v);img.parentElement.style.cssText=photoBlurStyle(v.src);$('#gallerycaption').textContent=v.caption;img.alt=current.name+' · '+v.angle;$('#photoloading').textContent='Loading '+current.name+' · '+v.angle+'…';$('#photoloading').hidden=true;
  const loader=new Image();const matches=()=>request===photoRequest&&view!=='three';
  const success=()=>{if(!matches())return;img.src=v.src;img.hidden=false;$('#photoloading').hidden=true;$('#imagestatus').hidden=true;$('#showroom').classList.remove('photo-pending');};
  const fail=()=>{if(!matches())return;img.hidden=true;$('#photoloading').hidden=true;$('#showroom').classList.remove('photo-pending');$('#imagestatus').hidden=false;$('#enlargephoto').disabled=true;};
  if(img.getAttribute('src')===v.src&&img.complete&&img.naturalWidth){success();}else{$('#photoloading').hidden=false;img.hidden=true;$('#showroom').classList.add('photo-pending');loader.onload=success;loader.onerror=fail;applyResponsivePhoto(loader,v);loader.src=v.src;}
 }else{img.removeAttribute('src');$('#photoloading').hidden=true;img.removeAttribute('srcset');img.removeAttribute('sizes');img.parentElement.style.backgroundImage='none';$('#gallerycaption').textContent='Photo unavailable';}
 $('#viewcount').textContent=list.length?`${String(angle+1).padStart(2,'0')} / ${String(list.length).padStart(2,'0')}`:'NO VERIFIED PHOTO';
 $('#anglebuttons').innerHTML=list.map((x,i)=>`<button data-angle="${i}" aria-label="View ${esc(x.angle)} photograph" title="${esc(x.angle)}" class="${i===angle?'active':''}" aria-pressed="${i===angle}"><img src="${x.src}" width="${x.width}" height="${x.height}" alt="" loading="lazy" decoding="async"><span>${esc(x.angle)}</span></button>`).join('');
 const directions=[['front','Straight front'],['rear','Straight rear'],['top','Top'],['left','Left side'],['right','Right side'],['under','Underside']];
 const availableDirections=directions.filter(([id])=>list.some(photo=>photo.direction===id));$('#directiontabs').hidden=engine||!availableDirections.length;$('#directionstatus').hidden=engine||!availableDirections.length;
 $('#directiontabs').innerHTML=availableDirections.map(([id,label])=>{const index=list.findIndex(v=>v.direction===id);return `<button data-direction="${id}" data-photoindex="${index}" ${index<0?'disabled':''} class="${index===angle?'active':''}" aria-pressed="${index===angle}" title="${index<0?'No verified matching straight-on photo available':label}">${label}${index<0?' · unavailable':''}</button>`;}).join('');
 $('#directionstatus').textContent='Verified exact angles: '+directions.filter(([id])=>list.some(v=>v.direction===id)).length+' / 6. Reference angles are labeled individually below.';
 galleryUI.render();document.querySelectorAll('[data-angle]').forEach(b=>b.onclick=()=>choosePhoto(+b.dataset.angle));document.querySelectorAll('[data-direction]').forEach(b=>b.onclick=()=>{const i=+b.dataset.photoindex;if(i>=0)choosePhoto(i);});
}
function choosePhoto(index){if(!current||view==='three')return;const list=views();if(index<0||index>=list.length)return;angle=index;renderGallery();zoom=1;pan={x:0,y:0};drag=null;transformImage();}
$('#previousphoto').onclick=()=>choosePhoto(angle-1);$('#nextphoto').onclick=()=>choosePhoto(angle+1);
$('#showroom').addEventListener('keydown',e=>{if(!current||view==='three'||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();choosePhoto(angle+(e.key==='ArrowRight'?1:-1));});
let photoSwipe=null;const photoStage=$('.photograph');
photoStage.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&view==='car')photoSwipe={x:e.clientX,y:e.clientY};});
photoStage.addEventListener('pointerup',e=>{if(!photoSwipe)return;const dx=e.clientX-photoSwipe.x,dy=e.clientY-photoSwipe.y;photoSwipe=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)choosePhoto(angle+(dx<0?1:-1));});
photoStage.addEventListener('pointercancel',()=>photoSwipe=null);
function transformImage(){const box=$('#engineimagewrap').getBoundingClientRect();const mx=(zoom-1)*box.width/2,my=(zoom-1)*box.height/2;pan.x=Math.max(-mx,Math.min(mx,pan.x));pan.y=Math.max(-my,Math.min(my,pan.y));$('#enginephoto').style.transform=`translate(${pan.x}px,${pan.y}px) scale(${zoom})`;$('#zoomvalue').textContent=Math.round(zoom*100)+'%';$('#zoomout').disabled=!current?.engine||zoom<=1;$('#zoomin').disabled=!current?.engine||zoom>=3;$('#engineimagewrap').classList.toggle('zoomed',zoom>1);}
$('#zoomin').onclick=()=>{zoom=Math.min(3,zoom+.25);transformImage();};$('#zoomout').onclick=()=>{zoom=Math.max(1,zoom-.25);transformImage();};$('#zoomreset').onclick=()=>{zoom=1;pan={x:0,y:0};transformImage();};$('#enginephoto').onpointerdown=e=>{if(zoom<=1)return;drag={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};e.currentTarget.setPointerCapture(e.pointerId);};$('#enginephoto').onpointermove=e=>{if(!drag)return;pan={x:drag.px+e.clientX-drag.x,y:drag.py+e.clientY-drag.y};transformImage();};$('#enginephoto').onpointerup=$('#enginephoto').onpointercancel=$('#enginephoto').onlostpointercapture=()=>drag=null;
$('#enlargephoto').onclick=()=>galleryUI.expand();
function renderThree(){const a=threeModels[current.id];$('#threeentry').hidden=false;$('#retrythree').hidden=true;$('#threetitle').textContent=a.title;$('#threecredit').textContent='3D model by '+a.author;$('#threesource').href=a.source;$('#threeplayer').style.backgroundImage=`url("${a.thumbnail}"),url("${current.car}")`;$('#gallerycaption').textContent=a.note+' Creator-built exterior, not factory CAD.';}
$('#loadthree').onclick=()=>{const a=threeModels[current.id];if(view!=='three'||!a)return;const iframe=document.createElement('iframe');iframe.src=a.embed+'?autostart=1';iframe.title=a.title;iframe.allow='autoplay; fullscreen; xr-spatial-tracking';iframe.allowFullscreen=true;$('#threeplayer').replaceChildren(iframe);$('#threeentry').hidden=true;$('#retrythree').hidden=false;};$('#retrythree').onclick=()=>setView('three');
function recordings(){return recordingModels[current.id]||recordingFamilies[current.code]||[];}
function renderRecording(){const list=recordings(),r=list[recording];$('#recordingbadge').textContent=recordingModels[current.id]?'REAL CAR RECORDING':'ENGINE-FAMILY REFERENCE';$('#recordingtitle').textContent=r?.title||'Matching recording unavailable';$('#recordingdescription').textContent=r?(!recordingModels[current.id]?'Engine-family reference. Exact car, model year or exhaust configuration may differ. ':'')+r.note:'No matching original recording has been verified. No generic audio is substituted.';$('#recordingauthor').textContent=r?'Published by '+r.author:'';$('#playrecording').disabled=!r;$('#recordingsource').hidden=!r;if(r)$('#recordingsource').href=r.source;$('#recordingplayer').innerHTML=`<img src="${current.car}" alt="${esc(current.name)}"><span class="player-hint">${r?'Original creator recording':'Matching recording unavailable'}</span>`;let options=$('#recordingoptions');if(!options){options=document.createElement('div');options.id='recordingoptions';options.className='recording-options';$('#recordingtitle').after(options);}options.innerHTML=list.map((x,i)=>`<button data-recording="${i}" class="${i===recording?'active':''}">${esc(x.label)}</button>`).join('');document.querySelectorAll('[data-recording]').forEach(b=>b.onclick=()=>{clearAudioPlayers();recording=+b.dataset.recording;renderRecording();});}
$('#playrecording').onclick=()=>{if($('#recordingplayer iframe')){clearAudioPlayers();return;}const r=recordings()[recording];if(!r)return;const iframe=document.createElement('iframe');iframe.src=r.provider==='youtube'?`https://www.youtube-nocookie.com/embed/${r.id}?autoplay=1&rel=0`:`https://player.vimeo.com/video/${r.id}?autoplay=1`;iframe.title=r.title;iframe.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';$('#recordingplayer').append(iframe);$('#playrecording').textContent='Stop recording';$('#playrecording').setAttribute('aria-pressed','true');};
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearPlayers();});window.addEventListener('pagehide',clearPlayers);
$('#modelselect').innerHTML=models.map(m=>`<option value="${m.id}">${esc(m.name)} · ${esc(m.generation.split(' / ')[1].trim())}</option>`).join('');$('#modelselect').onchange=e=>selectModel(e.target.value);
window.addEventListener('apex:accountprojection',()=>{if(location.pathname!=='/account')location.reload();});
const startup=document.createElement('div');startup.className='app-loading';startup.setAttribute('role','status');startup.innerHTML='<span class="loading-orbit" aria-hidden="true"></span>Opening APEX…';
if(location.pathname!=='/'){document.documentElement.dataset.booting='true';document.querySelector('main').prepend(startup);}
try{await account.start();}finally{startup.remove();delete document.documentElement.dataset.booting;}
const collectionUI=mountCollection({models,catalog:allModels,getCurrent:()=>current,selectModel,showCollection,dialog,toast,threeModels,electricPage:electric});
$('#factorysource').onclick=()=>dialog(`<h2>${esc(current.name)}</h2><p>${esc(current.market)} · ${esc(current.description)}</p><p>${esc(current.imageNote)}</p><a href="${current.source}" target="_blank" rel="noopener">BMW factory source</a>`);
function showCredits(){location.href='/photos';}
$('#credits').onclick=$('#aboutsources').onclick=showCredits;$('#imagecredit').onclick=()=>{if(view==='three'){const a=threeModels[current.id];dialog(`<h2>${esc(a.title)}</h2><p>${esc(a.note)}</p><a href="${a.source}" target="_blank" rel="noopener">Original creator model</a>`);return;}const v=selectedPhoto();if(!v?.credit){showCredits();return;}dialog(`<h2>${esc(v.angle)}</h2><p>${esc(v.caption)}</p><p>${esc(v.credit.author)} · ${esc(v.credit.license)}</p><a href="${v.credit.page}" target="_blank" rel="noopener">Original photograph and license</a>`);};

function showCollection(options={}){if(!options.skipHistory&&!['/models','/electric'].includes(location.pathname)){location.href=collectionUI.getCollectionUrl();return;}clearPlayers();photoRequest++;current=null;document.querySelectorAll('.home-feature').forEach(el=>el.hidden=false);if(!fromHistory&&!options.skipHistory)history.pushState(null,'',collectionUI.getCollectionUrl());$('#explorer').hidden=true;$('#collection').hidden=false;collectionUI.render();$('#photoloading').hidden=true;$('#mainphoto').removeAttribute('src');if($('#dialog').open)$('#dialog').close();document.querySelectorAll('[data-model]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});window.scrollTo({top:collectionScroll,behavior:'instant'});previousScroll=Math.max(0,window.scrollY);revealHeader();window.dispatchEvent(new CustomEvent('apex:collection'));}
$('#backcollection').onclick=showCollection;
if(document.modelContext?.registerTool){const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});for(const tool of [{name:'read_bmw_selection',description:'Read selected BMW, factory facts and photograph angle.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(){if(!current)return{model:null,status:'Choose a BMW from the collection.'};return{model:current.name,generation:current.generation,engine:current.code,view,angle:selectedPhoto()?.angle,factoryPower:{value:current.power,unit:current.powerUnit},audio:'Original creator recordings available separately'};}},{name:'select_bmw_model',description:'Select a BMW from this page; stops previous recording players.',inputSchema:{type:'object',properties:{modelId:{type:'string',enum:models.map(m=>m.id)}},required:['modelId'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!models.some(m=>m.id===input?.modelId))throw new Error('Unknown BMW model');selectModel(input.modelId);return{model:current.name,engine:current.code};}}])try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}


// Keep page content below the fixed navigation, including enlarged text.
const siteHeader=document.querySelector("header");
function sizeHeader(){document.documentElement.style.setProperty("--header-height",Math.ceil(siteHeader.getBoundingClientRect().height)+"px");}
sizeHeader();
if(typeof ResizeObserver!=="undefined")new ResizeObserver(sizeHeader).observe(siteHeader);
window.addEventListener("resize",sizeHeader);

// Follow downward scrolling; reveal navigation after a small upward gesture.
let previousScroll=Math.max(0,window.scrollY),headerOffset=0,upwardTravel=0;
function revealHeader(){headerOffset=0;upwardTravel=0;siteHeader.style.transform='translateY(0)';}
window.addEventListener('scroll',()=>{
 const maxScroll=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
 const position=Math.max(0,Math.min(window.scrollY,maxScroll));
 const delta=position-previousScroll;previousScroll=position;
 if(matchMedia('(max-width:1100px)').matches||siteHeader.contains(document.activeElement)){revealHeader();return;}
 if(position<=32){revealHeader();return;}
 if(delta>0){upwardTravel=0;headerOffset=Math.min(siteHeader.offsetHeight,headerOffset+delta);}
 else if(delta<0){upwardTravel-=delta;if(upwardTravel>=6)headerOffset=0;}
 siteHeader.style.transform=`translateY(${-headerOffset}px)`;
},{passive:true});
siteHeader.addEventListener('focusin',revealHeader);
window.addEventListener('pageshow',()=>{previousScroll=Math.max(0,window.scrollY);revealHeader();});


const openTurboGuide=mountTurboGuide($('#partslibrary'));
if(document.body.dataset.page==='parts'&&window.location.hash==='#turbo-types')requestAnimationFrame(openTurboGuide);

// Only components with inspected, reusable real photographs enter this library.
const partModels=allModels;
function partApplies(part,model){return part.applies==='all'||(part.applies==='turbo'?!!model.turbos:!isElectric(model));}
const families=[...new Set(partModels.filter(m=>partCatalog.some(p=>partApplies(p,m))).map(m=>m.code))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
$('#partfamily').innerHTML='<option value="all">All families</option>'+families.map(code=>`<option value="${esc(code)}">${esc(code)}</option>`).join('');
$('#partslist').innerHTML=partCatalog.map((part,i)=>`<button class="part-photo-card" data-component="${i}" aria-label="Learn about ${esc(part.name)}"><div class="part-photo"><img src="${part.photo.src}" alt="${esc(part.name)} — ${esc(part.photo.caption)}" loading="lazy" decoding="async" draggable="false"></div><div class="part-photo-copy"><span>${esc(part.system)}</span><h3>${esc(part.name)}</h3><p>${esc(part.summary)}</p><small>${esc(part.photo.tag)}</small></div></button>`).join('');
function filterParts(){const terms=normalizeSearch($('#partsearch').value).trim().split(/\s+/).filter(Boolean),family=$('#partfamily').value;let count=0;document.querySelectorAll('[data-component]').forEach(card=>{const part=partCatalog[+card.dataset.component],text=normalizeSearch([part.name,part.system,part.summary,...part.connections.map(c=>c.name)].join(' '));const examples=family==='all'||partModels.some(m=>m.code===family&&partApplies(part,m));card.hidden=!examples||!terms.every(t=>text.includes(t));if(!card.hidden)count++;});$('#partscount').textContent=count+' photographed components';$('#partsempty').hidden=count!==0;$('#clearpartsearch').hidden=!$('#partsearch').value;}
function openPart(index){const part=partCatalog[index];if(!part)return;const photo=part.photo,family=$('#partfamily').value;const examples=partModels.filter(m=>partApplies(part,m)&&(family==='all'||m.code===family)).slice(0,4);
 dialog(`<article class="part-detail"><div class="part-detail-heading"><span class="eyebrow">${esc(part.system)} / COMPONENT GUIDE</span><h2>${esc(part.name)}</h2><p>${esc(part.summary)}</p></div><div class="part-detail-layout"><aside class="part-detail-photo"><img src="${photo.src}" alt="${esc(part.name)} — ${esc(photo.caption)}"><p class="photo-identity">${esc(photo.caption)}</p><p class="photo-identify"><strong>Look for</strong> ${esc(photo.lookFor)}</p><a href="${photo.original}" target="_blank" rel="noopener">Open full-resolution photo</a><div class="part-photo-credit"><a href="${photo.page}" target="_blank" rel="noopener">Photo by ${esc(photo.author)}</a> · <a href="${photo.licenseUrl||photo.page}" target="_blank" rel="noopener">${esc(photo.license)}</a><p>${esc(photo.changes)}. The displayed adaptation retains the photograph’s stated license.</p></div></aside><div class="part-detail-content"><section><h3>Where it is</h3><p>${esc(part.location)}</p></section><section><h3>What it is for</h3><p>${esc(part.purpose)}</p></section><section><h3>How it works</h3><p>${esc(part.how)}</p></section><section><h3>What it connects to</h3><dl class="part-connections">${part.connections.map(c=>`<div><dt>${esc(c.name)}</dt><dd>${esc(c.detail)}</dd></div>`).join('')}</dl></section><section><h3>Possible fault symptoms</h3><p>${esc(part.symptoms)}</p></section><section><h3>Design and BMW differences</h3><p>${esc(part.note)}</p>${index===0?'<button id="exploreturbotypes" class="primary">Explore turbo types →</button>':''}</section><section><h3>BMW system examples</h3><p class="part-fitment-note">These links show related vehicle systems. They do not establish that the photographed part fits those BMWs.</p><div class="part-vehicle-links">${examples.map(m=>`<a href="${isElectric(m)?'/electric':'/'}?model=${encodeURIComponent(m.id)}&view=engine">${esc(m.name)} · ${esc(m.generation.split(' / ')[1].trim())} / ${esc(m.code)}</a>`).join('')}</div></section><section class="part-technical-sources"><h3>Technical references</h3>${part.sources.map(source=>`<a href="${source.url}" target="_blank" rel="noopener">${esc(source.label)}</a>`).join('')}</section></div></div></article>`);$('#dialog').classList.add('part-dialog');$('#dialog').scrollTop=0;
 const turboButton=$('#exploreturbotypes');if(turboButton)turboButton.onclick=()=>{if(document.body.dataset.page!=='parts'){window.location.href='/parts#turbo-types';return;}$('#dialog').close();openTurboGuide();};
}
document.querySelectorAll('[data-component]').forEach(card=>card.onclick=()=>openPart(+card.dataset.component));
$('#partsearch').oninput=$('#partfamily').onchange=filterParts;$('#clearpartsearch').onclick=()=>{$('#partsearch').value='';filterParts();$('#partsearch').focus();};$('#resetparts').onclick=()=>{$('#partsearch').value='';$('#partfamily').value='all';filterParts();};$('#partsearch').onkeydown=e=>{if(e.key==='Escape'){$('#clearpartsearch').click();}else if(e.key==='Enter'){const cards=[...document.querySelectorAll('[data-component]')].filter(c=>!c.hidden);if(cards.length===1)openPart(+cards[0].dataset.component);}};filterParts();
if(document.body.dataset.page==='parts'||document.body.dataset.page==='about'){$('#collection').hidden=true;$('#partslibrary').hidden=document.body.dataset.page!=='parts';$('#aboutpage').hidden=document.body.dataset.page!=='about';}
else{const entry=new URLSearchParams(window.location.search),model=location.pathname.startsWith('/cars/')?models.find(m=>m.id===location.pathname.split('/')[2]):['/models','/electric'].includes(location.pathname)?models.find(m=>m.id===entry.get('model')):null;if(model){selectModel(model.id);if(entry.get('view')==='engine'){setView('engine');const partIndex=Number(entry.get('part'));if(Number.isInteger(partIndex)&&partIndex>=0&&partIndex<model.parts.length)setPart(partIndex);}}}

routeReady=true;
mountPlatform({catalog:allModels,getCurrent:()=>current,selectModel,showCollection,openPart,compareModels:ids=>collectionUI.compareModels(ids),mountComparison:container=>collectionUI.mountComparison(container),dialog,toast});
mountDropdowns();
window.addEventListener('popstate',()=>{if(['parts','about'].includes(document.body.dataset.page)||(!['/models','/electric'].includes(location.pathname)&&!location.pathname.startsWith('/cars/')))return;const params=new URLSearchParams(location.search),model=models.find(m=>m.id===(location.pathname.startsWith('/cars/')?location.pathname.split('/')[2]:params.get('model')));fromHistory=true;try{if(model){selectModel(model.id);if(params.get('view')==='engine'){setView('engine');const partIndex=Number(params.get('part'));if(Number.isInteger(partIndex)&&partIndex>=0&&partIndex<model.parts.length)setPart(partIndex);}}else showCollection();}finally{fromHistory=false;}});
