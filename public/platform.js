import {mountSmartSearch} from './smart-search.js';
import {partCatalog} from './parts.js';
import {mountSystemGuide,systemComponents} from './system-guide.js';
import {mountNavigation} from './navigation.js';
import {workspaceRoutes} from './routes.js';
import {account} from './account-sync.js';
import {mountAccount,mountAccountButton} from './account.js';
import {getLanguage} from './preferences.js';
import {renderModelProfile} from './model-profile-ui.js';
import {responsivePhotoAttributes,photoBlurStyle} from './responsive-photos.js';
import './retention-translations.js';
import {mountExperience} from './experience.js';
import {encyclopediaParts} from './parts-encyclopedia-data.js';
import {loadStyle} from './experience-common.js';
import {updateSEO} from './seo.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pages={
  '/engines':{id:'engines',title:'The heart of a BMW.',kicker:'THE ENGINE DIRECTORY',description:'Learn the families. Follow the applications. Find the engine behind your favorite BMW.',label:'FROM STRAIGHT-SIX TO ELECTRIC DRIVE'},
  '/play':{id:'play',title:'Curiosity, in play.',kicker:'THE APEX ARCADE',description:'One question leads to another discovery. Practice, challenge a friend, or make today’s daily run.',label:'LEARN SOMETHING WITH EVERY ROUND'},
  '/start':{id:'start',title:'Your way into BMW.',kicker:'THE BEGINNER STARTER KIT',description:'Find your kind of BMW and make sense of the name on its boot. You can start with zero car knowledge.',label:'A LITTLE HELP FINDING YOUR ROAD'},
  '/account':{id:'account',title:'Your account.',kicker:'YOUR BMW GARAGE',description:'Save your builds, keep your favorites, and continue learning wherever you sign in.',label:'A GARAGE THAT GOES WITH YOU'},
  '/learn':{id:'academy',title:'Learn & Play',kicker:'THE BMW LEARNING ACADEMY',description:'Build your knowledge, one discovery at a time. Short lessons, hands-on challenges, and a road that grows with you.',label:'YOUR NEXT CHAPTER'},
  '/generation-guides':{id:'generation-guides',title:'Generation buyer guides',kicker:'BUY WITH CONTEXT',description:'Explore catalog-backed BMW generation pages, sourced pre-purchase checks, and import guidance for buyers in Georgia.',label:'CHASSIS-BY-CHASSIS RESEARCH'},
  '/engine-lab':{id:'engine-lab',title:'Inside the engine.',kicker:'VIRTUAL ENGINE LAB',description:'Meet the S63. Explore the systems of a twin-turbo V8, follow the flow, and see how the components connect.',label:'INTERACTIVE ENGINE EXPLORER'},
  '/tuning-garage':{id:'tuning-garage',title:'Build. Test. Understand.',kicker:'THE TUNING GARAGE',description:'Choose a BMW and explore how changes interact. Save your ideas and compare the tradeoffs behind a build.',label:'EDUCATIONAL SIMULATION'},
  '/compare':{id:'compare',title:'A closer comparison.',kicker:'THE DETAILS MAKE THE DIFFERENCE',description:'The same badge. A different character. Line up to three BMWs side by side and discover what sets them apart.',label:'YOUR SHORTLIST, SIDE BY SIDE'},
  '/my-garage':{id:'my-garage',title:'A space for your obsession.',kicker:'YOUR PERSONAL GARAGE',description:'Your favorite BMWs, saved builds, and learning progress. Ready whenever curiosity calls.',label:'YOUR SAVED COLLECTION'},
};

export function mountPlatform({catalog,getCurrent,selectModel,showCollection,openPart,compareModels,mountComparison,dialog,toast}) {
  if(!['localhost','127.0.0.1'].includes(location.hostname)&&!document.getElementById('vercel-analytics-script')){
    window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};
    const analyticsScript=document.createElement('script');
    analyticsScript.id='vercel-analytics-script';
    analyticsScript.defer=true;
    analyticsScript.src='/_vercel/insights/script.js';
    document.head.append(analyticsScript);
  }
  const abort=new AbortController(),instances={};let modelDefinitions=null;
  const path=location.pathname.replace(/\/+$/,'')||'/',engineSlug=path.startsWith('/engines/')?path.split('/')[2]:null,partSlug=path.startsWith('/parts/')?path.split('/')[2]:null,referenceKind=['glossary','badges','questions'].includes(path.split('/')[1])?path.split('/')[1]:null,lessonSlug=path.startsWith('/lessons/')?path.split('/')[2]:null,page=pages[path]||(lessonSlug?pages['/learn']:referenceKind?{id:'reference',title:referenceKind==='glossary'?'Make the words familiar.':referenceKind==='badges'?'Every discovery counts.':'One more discovery.',kicker:'THE APEX KNOWLEDGE COLLECTION',description:'Follow your curiosity. Every reference leads to something new.',label:'YOUR NEXT DISCOVERY'}:engineSlug?pages['/engines']:partSlug?{id:'part-detail',title:'Inside the machine.',kicker:'THE PARTS ENCYCLOPEDIA',description:'One component. A clearer understanding of the whole car.',label:'LEARN WHAT IT DOES'}:null);
  const nav=document.querySelector('.site-header nav');
  if(path.startsWith('/cars/')&&!getCurrent()){
    const notFound=document.createElement('section');notFound.className='destination-page tool-card';notFound.innerHTML='<span class="eyebrow">A LITTLE DETOUR</span><h1>This BMW is not in the collection yet.</h1><p>Start with a model we have documented, or let the beginner finder help you choose.</p><div class="next-road"><a href="/models">Browse the collection ↗</a><a href="/start">Find my BMW ↗</a></div>';document.querySelector('main').prepend(notFound);document.title='BMW not found · APEX';
  }
  nav.innerHTML='<a href="/models" id="collectionnav">Cars</a><a href="/engines">Engines</a><a href="/parts">Parts</a><a href="/learn">Learn</a><a href="/play">Play</a><a href="/my-garage" class="nav-garage">Garage</a>';
  function markNavigation(id){
    const href=id==='models'?'/models':workspaceRoutes[id]||'/'+id;
    for(const a of nav.querySelectorAll('a')){const selected=a.getAttribute('href')===href;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
  }
  const accountUI=mountAccountButton(document.querySelector('.header-tools'),{accountController:account});
  const unsubscribeAccount=account.subscribe(state=>{const label=document.querySelector('.footer-end>span');if(label)label.textContent=state.user?state.message:'Your guest garage, on this device.';});
  const saved=document.querySelector('.header-saved');if(saved){saved.removeAttribute('data-collection');saved.setAttribute('aria-label','Open saved models in My garage');saved.onclick=()=>{location.href='/my-garage';};}
  document.querySelector('.header-tools').insertAdjacentHTML('afterbegin','<button class="icon-button global-search-trigger" data-global-search aria-label="Search everything (Control K)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg></button>');
  document.querySelector('.footer-brand').innerHTML='<a href="/" class="footer-wordmark">APEX<span>.</span></a><p>Independent BMW stories, specifications and engineering guides.</p><small>Not affiliated with BMW AG.</small>';
  const footerLinks=document.querySelector('.footer-links'),creditsButton=footerLinks.querySelector('#credits');
  footerLinks.innerHTML='<div class="footer-group"><h2>Discover</h2><a href="/models">BMW models</a><a href="/electric">Electric BMWs</a><a href="/parts">Inside BMW</a><a href="/about">About APEX</a></div><div class="footer-group"><h2>Explore</h2><a href="/compare">Compare cars</a><a href="/learn">Learn &amp; Play</a><a href="/generation-guides">Buyer guides</a><a href="/engine-lab">Engine lab</a><a href="/tuning-garage">Tuning garage</a><a href="/my-garage">My garage</a></div><div class="footer-group"><h2>Sources</h2><a href="/account">Account &amp; sync</a></div>';
  creditsButton.textContent='Photos & sources';footerLinks.querySelector('.footer-group:last-child').append(creditsButton);
  document.querySelector('.footer-end').innerHTML='<span>Guest data stays on this device. Sign in to sync your garage.</span><a href="#main-content">Back to top ↑</a>';
  document.querySelector('#modelsearch')?.setAttribute('placeholder','Find a BMW, chassis or engine code…');
  let destination,panel,pending;
  const isHome=path==='/'&&!getCurrent();
  document.querySelectorAll('.home-feature').forEach(node=>{node.hidden=!isHome;});
  if(document.body.dataset.page==='electric'){document.querySelector('.hero')?.removeAttribute('hidden');document.querySelector('.collection-ticker')?.removeAttribute('hidden');}
  document.querySelector('#collection').hidden=!['/models','/cars','/electric'].includes(path)||!!getCurrent();
  if(partSlug)document.querySelector('#partslibrary').hidden=true;
  if(isHome){
    const collectionCover=catalog.find(model=>model.id==='g80'),compareCover=catalog.find(model=>model.id==='g82-m4-csl');
    const hero=document.querySelector('.hero');
    hero.querySelector('.hero-kicker span:last-child').textContent='THE INDEPENDENT BMW LEARNING PLATFORM';
    hero.querySelector('h1').innerHTML='<span>Driven by</span><em>curiosity.</em>';
    hero.querySelector('.hero-content>p').textContent='Discover the icons. Understand the engineering. Find your own road into the world of BMW.';
    hero.querySelector('.hero-actions').insertAdjacentHTML('beforeend','<a class="hero-lab-link" href="/learn">Start learning <span aria-hidden="true">↗</span></a>');
    hero.querySelector('.hero-scroll').href='/models';
    const section=document.createElement('section');section.className='home-directions home-feature';section.setAttribute('aria-labelledby','directions-title');
    section.innerHTML=`<div class="directions-heading"><div><span class="eyebrow">FOLLOW YOUR CURIOSITY</span><h2 id="directions-title">Where will it take you?</h2></div><p>A collection to explore.<br>A whole machine to understand.</p></div><div class="directions-grid"><a class="direction-card" href="/models"><img src="${esc(collectionCover?.car||'images/photo-unavailable.svg')}" ${responsivePhotoAttributes({src:collectionCover?.car,width:collectionCover?.width,height:collectionCover?.height})} style="${photoBlurStyle(collectionCover?.car)}" alt="" loading="lazy"><small>01 / THE COLLECTION</small><h3>Find your BMW.</h3><p>From the original icons to a new generation. Every car has a story.</p><span>Explore ${catalog.length} models <b aria-hidden="true">↗</b></span></a><a class="direction-card learn-direction" href="/learn"><i class="direction-road" aria-hidden="true"></i><small>02 / LEARN &amp; PLAY</small><h3>Know what drives it.</h3><p>Follow the learning road. Get hands-on with the engineering.</p><span>Enter the academy <b aria-hidden="true">↗</b></span></a><a class="direction-card" href="/compare"><img src="${esc(compareCover?.car||'images/photo-unavailable.svg')}" ${responsivePhotoAttributes({src:compareCover?.car,width:compareCover?.width,height:compareCover?.height})} style="${photoBlurStyle(compareCover?.car)}" alt="" loading="lazy"><small>03 / SIDE BY SIDE</small><h3>The finer differences.</h3><p>Two icons. Different characters. Go beyond the badge and compare.</p><span>Build a comparison <b aria-hidden="true">↗</b></span></a></div>`;
    document.querySelector('.collection-ticker').after(section);
    document.title='APEX — Driven by curiosity';
  }
  if(['/models','/cars'].includes(path)&&!getCurrent()){
    const heading=document.querySelector('#collection .section-heading');
    heading.querySelector('.eyebrow').textContent='THE BMW COLLECTION';heading.querySelector('h2').textContent='Find the one that moves you.';
    heading.querySelector('.collection-intro').textContent='Explore the generations. Find an engine, a body style, or the BMW you keep coming back to. Save your favorites and compare the details.';
    document.title='The BMW collection · APEX';markNavigation('models');
  }
  if(path==='/electric'||getCurrent())markNavigation('models');
  if(path==='/parts')markNavigation('parts');
  if(path==='/photos'){
    const sources=document.createElement('section');sources.className='photo-source-page';document.querySelector('main').prepend(sources);
    import('./photo-sources.js').then(({mountPhotoSources})=>{instances.photos=mountPhotoSources(sources,{catalog});}).catch(()=>{sources.textContent='This page could not load.';});
  }
  if(page&&!getCurrent()){
    destination=document.createElement('section');destination.className='destination-page';destination.id='destination';
    destination.innerHTML=`<nav class="destination-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>${esc(page.title.replace(/\.$/,''))}</span></nav><div class="destination-heading"><div><span class="eyebrow">${page.kicker}</span><h1>${page.title}</h1><p>${page.description}</p></div><span class="destination-label">${page.label}</span></div><div class="destination-panel" id="${page.id}" tabindex="-1"><div class="workspace-loading" role="status"><span class="loading-orbit" aria-hidden="true"></span>Opening ${esc(page.title.toLowerCase())}…</div></div>`;
    document.querySelector('main').prepend(destination);panel=destination.querySelector('.destination-panel');
    document.title=page.title+' · APEX BMW';markNavigation(page.id);
    pending=loadPage();
  }
  async function loadPage(){
    try{
      if(page.id==='reference'){const {mountReferencePage}=await import('./reference-pages.js');panel.replaceChildren();instances[page.id]=mountReferencePage(panel,{kind:referenceKind,id:path.split('/')[2],catalog});}
      if(page.id==='engines'){const {mountEngineDirectory}=await import('./engine-directory.js');panel.replaceChildren();instances[page.id]=mountEngineDirectory(panel,{id:engineSlug});}
      if(page.id==='part-detail'){loadStyle('./parts-encyclopedia.css');const {mountPartsEncyclopedia}=await import('./parts-encyclopedia.js');panel.replaceChildren();instances[page.id]=mountPartsEncyclopedia(panel,{catalog,partId:partSlug});}
      if(page.id==='play'){loadStyle('./play.css');const {mountPlay}=await import('./play.js');panel.replaceChildren();instances[page.id]=mountPlay(panel,{catalog});}
      if(page.id==='start'){const {mountGuideTools}=await import('./guide-tools.js');panel.replaceChildren();instances[page.id]=mountGuideTools(panel,{catalog});}
      if(page.id==='engine-lab'){const {mountEngineLab}=await import('./engine-lab.js');panel.replaceChildren();instances[page.id]=await mountEngineLab(panel);}
      if(page.id==='tuning-garage'){const {mountGarage}=await import('./garage.js');panel.replaceChildren();instances[page.id]=await mountGarage(panel,{catalog});}
      if(page.id==='academy'){const {mountAcademy}=await import('./academy.js');panel.replaceChildren();instances[page.id]=await mountAcademy(panel,{catalog,onProgress:detail=>window.dispatchEvent(new CustomEvent('apex:progress',{detail}))});}
      if(page.id==='generation-guides'){const {mountGenerationGuides}=await import('./generation-guides.js');panel.replaceChildren();instances[page.id]=mountGenerationGuides(panel,{catalog});}
      if(page.id==='compare'){panel.replaceChildren();instances[page.id]=mountComparison(panel);}
      if(page.id==='account'){panel.replaceChildren();instances[page.id]=mountAccount(panel,{accountController:account});}
      if(page.id==='my-garage'){
        const {mountPersonalGarage}=await import('./personal-garage.js');panel.replaceChildren();
        const {mountGarageHub}=await import('./garage-hub.js');const hub=document.createElement('section');panel.append(hub);instances['collection-hub']=mountGarageHub(hub,{catalog});
        instances[page.id]=mountPersonalGarage({container:panel,catalog,onModel:openCatalogModel,onBuild:(id,modelId)=>{location.href='/tuning-garage?build='+encodeURIComponent(id)+'&garage='+encodeURIComponent(modelId);},onLesson:(id,level)=>{location.href='/learn?lesson='+encodeURIComponent(id)+(level?'&level='+encodeURIComponent(level):'');},onCompare:compareModels});
      }
      const instance=instances[page.id],entry=new URLSearchParams(location.search);
      if(page.id==='tuning-garage'){if(entry.get('build')&&instance?.loadBuild?.(entry.get('build'))){}else if(entry.get('garage'))instance?.selectModel?.(entry.get('garage'));}
      if(page.id==='academy'){
        const lesson=lessonSlug||entry.get('lesson'),tab=entry.get('tab')||location.hash.slice(1);
        if(lesson){if(['mechanic','history'].includes(lesson))instance?.setTab?.(lesson);else instance?.openLesson?.(lesson,entry.get('level'));}
        else if(tab)instance?.setTab?.(tab);
      }
      updateSEO();return instance;
    }catch(error){panel.innerHTML='<div class="destination-error"><h2>This page could not load.</h2><p>Your saved cars and learning progress are still here.</p><button type="button">Try again</button></div>';panel.querySelector('button').onclick=()=>{pending=loadPage();};console.error('Page load failed:',page.id,error);return null;}
  }
  async function openWorkspace(id){
    const target=workspaceRoutes[id];if(!target)return;
    if(page?.id===id)return pending;
    location.href=target;
  }
  function updateDetail(){
    modelDefinitions?.destroy();modelDefinitions=null;
    const m=getCurrent();document.querySelector('.expanded-factory-specs')?.remove();document.querySelector('.engineering-detail-actions')?.remove();
    if(!m)return;markNavigation('models');document.documentElement.dataset.route='model';if(destination)destination.hidden=true;document.title=m.name+' '+m.generation.split(' / ').at(-1).trim()+' · APEX';instances['tuning-garage']?.stop?.();
    const actions=document.createElement('div');actions.className='engineering-detail-actions';
    actions.innerHTML='<a class="primary learn-car-link" href="/learn?car='+encodeURIComponent(m.id)+'">Learn this car ↗</a><a class="primary" href="/engines/'+m.code.toLowerCase().replace(/\+/g,' plus ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'">Meet the '+esc(m.code)+' ↗</a>'+(m.id==='f10-m5'?'<button class="primary" type="button" data-open-engine>Explore the S63 in 3D <span aria-hidden="true">↗</span></button>':'')+(!/eDrive/.test(m.code)?'<button type="button" data-open-garage>Build in the tuning garage <span aria-hidden="true">↗</span></button>':'');
    document.querySelector('.detail-actions').after(actions);
    actions.querySelector('[data-open-engine]')?.addEventListener('click',()=>openWorkspace('engine-lab'));
    actions.querySelector('[data-open-garage]')?.addEventListener('click',()=>{location.href='/tuning-garage?garage='+encodeURIComponent(m.id);});
    const section=document.createElement('section');section.className='expanded-factory-specs';section.innerHTML=renderModelProfile(m);
    document.querySelector('.machine-bar').after(section);
    updateSEO({model:m});
    // Load definitions only when someone opens a vehicle. Factory values stay
    // verbatim; technical terms can be opened with touch or a keyboard.
    Promise.all([import('./academy-glossary.js'),import('./academy-links.js')]).then(([glossary,links])=>{
      if(!section.isConnected)return;
      modelDefinitions=glossary.mountGlossaryDefinitions(section,{getLanguage,onLesson:id=>{location.href='/learn?lesson='+encodeURIComponent(id);}});
      links.prepareGlossaryCopy(section,'.profile-value:not(.profile-missing)');links.localizeGlossaryCopy(section);
    }).catch(()=>{/* Vehicle specifications remain usable if definitions cannot load. */});
  }

  window.addEventListener('apex:modelselected',updateDetail,{signal:abort.signal});
  window.addEventListener('apex:collection',()=>{
    modelDefinitions?.destroy();modelDefinitions=null;
    instances['tuning-garage']?.stop?.();document.documentElement.dataset.route='models';markNavigation('models');document.title='The BMW collection · APEX';
    if(destination)destination.hidden=true;
    document.querySelectorAll('.home-feature').forEach(node=>node.hidden=true);
    document.querySelector('#collection').hidden=false;
  },{signal:abort.signal});
  const systems=mountSystemGuide(document.querySelector('#partslibrary'),{dialog});
  if(path==='/parts'){loadStyle('./parts-encyclopedia.css');const encyclopedia=document.createElement('section');encyclopedia.className='parts-encyclopedia-host';document.querySelector('#partslibrary').after(encyclopedia);import('./parts-encyclopedia.js').then(({mountPartsEncyclopedia})=>{instances.encyclopedia=mountPartsEncyclopedia(encyclopedia,{catalog});}).catch(error=>{encyclopedia.textContent='The encyclopedia could not load. Reload to try again.';console.error(error);});}
  function openCatalogModel(id){const model=catalog.find(m=>m.id===id);if(!model)return;location.href='/cars/'+encodeURIComponent(id);}
  const openPersonalGarage=()=>{location.href='/my-garage';};
  const navigation=mountNavigation({openSearch:()=>search.open(),openGarage:openPersonalGarage});
  const retainedParts=[...partCatalog,...systemComponents],moreParts=encyclopediaParts.filter(part=>!retainedParts.some(item=>item.id===part.id));
  const search=mountSmartSearch({catalog,parts:[...retainedParts,...moreParts],onModel:openCatalogModel,onPart:index=>{if(index<partCatalog.length)return openPart(index);if(index<retainedParts.length)return systems.open(systemComponents[index-partCatalog.length].id);location.href='/parts/'+encodeURIComponent(moreParts[index-retainedParts.length].id);},onCompare:compareModels,onTopic:async id=>{
    if(id==='starter-kit'){location.href='/start';return;}if(id==='play-arcade'){location.href='/play';return;}if(id.startsWith('directory-engine-')){location.href='/engines/'+id.slice('directory-engine-'.length);return;}
    const academyTabs={glossary:'glossary','m-recognition':'models','academy-practice':'practice'};
    if(academyTabs[id]){location.href='/learn?tab='+academyTabs[id];return;}
    if(workspaceRoutes[id])return openWorkspace(id);
    location.href='/learn?'+(['engine-codes','mechanic','history'].includes(id)?'tab='+encodeURIComponent(id==='engine-codes'?'codes':id):'lesson='+encodeURIComponent(id));
  }});
  function updateCount(){let count=0;try{const ids=JSON.parse(localStorage.getItem('apex-comparison')||'[]');if(Array.isArray(ids))count=new Set(ids.filter(id=>catalog.some(m=>m.id===id))).size;}catch{}const node=nav.querySelector('.nav-comparison-count');if(node)node.textContent=count?String(Math.min(3,count)):'';}
  updateCount();window.addEventListener('apex:localchange',updateCount,{signal:abort.signal});window.addEventListener('storage',updateCount,{signal:abort.signal});
  updateDetail();
  instances.experience=mountExperience({catalog,getCurrent});
  updateSEO({model:getCurrent()});
  window.addEventListener('apex:languagechange',()=>{const profile=document.querySelector('.model-profile');if(profile&&getCurrent()){const open=[...profile.querySelectorAll('.profile-data-group[open]')].map(node=>[...profile.querySelectorAll('.profile-data-group')].indexOf(node));const parent=profile.parentElement;parent.innerHTML=renderModelProfile(getCurrent());parent.querySelectorAll('.profile-data-group').forEach((node,index)=>node.open=open.includes(index));}if(modelDefinitions)import('./academy-links.js').then(links=>{const section=document.querySelector('.expanded-factory-specs');if(section){links.prepareGlossaryCopy(section,'.profile-value:not(.profile-missing)');links.localizeGlossaryCopy(section);}}).catch(()=>{});},{signal:abort.signal});
  return {openWorkspace,search,destroy(){modelDefinitions?.destroy();abort.abort();unsubscribeAccount();accountUI?.destroy?.();navigation.destroy();search.destroy();Object.values(instances).forEach(i=>i?.destroy?.());}};
}
