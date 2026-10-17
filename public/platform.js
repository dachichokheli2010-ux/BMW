import {mountSmartSearch} from './smart-search.js';
import {partCatalog} from './parts.js';
import {mountSystemGuide,systemComponents} from './system-guide.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const titles={'engine-lab':'Engine explorer','tuning-garage':'Tuning garage',academy:'Learning academy'};

export function mountPlatform({catalog,getCurrent,selectModel,showCollection,openPart,compareModels,dialog,toast}) {
  const isHome=!document.body.dataset.page, abort=new AbortController(), instances={}, pending={};let active='engine-lab';
  const nav=document.querySelector('.site-header nav');
  nav.querySelector('a[href="/?collection=m"]')?.remove();
  nav.insertAdjacentHTML('beforeend','<a href="/#engine-lab">Engine lab</a><a href="/#tuning-garage">Garage</a><a href="/#academy">Academy</a>');
  function markNavigation(id){for(const a of nav.querySelectorAll('a')){const selected=id==='models'?a.id==='collectionnav':a.getAttribute('href')==='/#'+id;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}}
  document.querySelector('.header-tools').insertAdjacentHTML('afterbegin','<button class="icon-button global-search-trigger" data-global-search aria-label="Search everything (Control K)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg></button>');
  document.querySelector('.footer-links').insertAdjacentHTML('beforeend','<a href="/#engine-lab">Engine lab</a><a href="/#tuning-garage">Tuning garage</a><a href="/#academy">Academy</a>');
  document.querySelector('#modelsearch')?.setAttribute('placeholder','Find a BMW, chassis or engine code…');
  const intro=document.querySelector('.collection-intro');
  if(isHome&&intro)intro.textContent='Real cars. Factory sources. A closer look at every generation.';
  let workspace,workspaceObserver;
  if(isHome){
    const hero=document.querySelector('.hero');
    hero.querySelector('.hero-kicker span:last-child').textContent='THE INDEPENDENT BMW LEARNING PLATFORM';
    hero.querySelector('h1').innerHTML='<span>Driven by</span><em>curiosity.</em>';
    hero.querySelector('.hero-content>p').textContent='Discover the icons. Understand the engineering. Explore what makes a BMW feel like a BMW.';
    hero.querySelector('.hero-actions').insertAdjacentHTML('beforeend','<a class="hero-lab-link" href="/#engine-lab">Go under the hood <span aria-hidden="true">↗</span></a>');
    const strip=document.createElement('section');strip.className='explore-paths home-feature';strip.setAttribute('aria-label','Explore BMW engineering');
    strip.innerHTML=`<a href="/#engine-lab"><span class="path-number">01 / EXPLORE</span><strong>Inside the S63.</strong><p>A twin-turbo V8. Every system, connected.</p><span class="path-bottom">Interactive 3D engine <span aria-hidden="true">↗</span></span></a><a href="/#tuning-garage"><span class="path-number">02 / EXPERIMENT</span><strong>Your next build.</strong><p>Explore the tradeoffs behind the numbers.</p><span class="path-bottom">Tuning & simulated dyno <span aria-hidden="true">↗</span></span></a><a href="/#academy"><span class="path-number">03 / UNDERSTAND</span><strong>Learn the machine.</strong><p>From your first piston to complex systems.</p><span class="path-bottom">Lessons & virtual mechanic <span aria-hidden="true">↗</span></span></a>`;
    document.querySelector('.collection-ticker').after(strip);
    workspace=document.createElement('section');workspace.className='learning-workspace home-feature';workspace.id='engineering';
    workspace.innerHTML=`<div class="workspace-heading"><div><span class="eyebrow">CURIOSITY, IN MOTION</span><h2>Understand what<br>drives it.</h2></div><p>Go beyond the specification sheet. Explore the systems, experiment with a build, and learn how everything connects.</p></div><div class="workspace-tabs" role="tablist" aria-label="Engineering workspace">${Object.entries(titles).map(([id,title],i)=>`<button role="tab" type="button" id="tab-${id}" data-workspace-tab="${id}" aria-controls="${id}" aria-selected="${i===0}" tabindex="${i===0?'0':'-1'}"><small>0${i+1}</small>${title}<span aria-hidden="true">↗</span></button>`).join('')}</div>${Object.keys(titles).map((id,i)=>`<div class="workspace-panel" role="tabpanel" id="${id}" aria-labelledby="tab-${id}" tabindex="0" ${i?'hidden':''}><div class="workspace-loading" role="status"><span class="loading-orbit" aria-hidden="true"></span>Preparing ${titles[id].toLowerCase()}…</div></div>`).join('')}`;
    document.querySelector('.popular-comparisons').before(workspace);
    strip.hidden=workspace.hidden=!!getCurrent();
    workspace.querySelectorAll('[data-workspace-tab]').forEach(b=>b.addEventListener('click',()=>openWorkspace(b.dataset.workspaceTab)));
    workspace.querySelector('.workspace-tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const keys=Object.keys(titles),i=keys.indexOf(active),next=e.key==='Home'?0:e.key==='End'?keys.length-1:(i+(e.key==='ArrowRight'?1:-1)+keys.length)%keys.length;openWorkspace(keys[next],false);workspace.querySelector(`#tab-${keys[next]}`).focus();});
    if('IntersectionObserver' in window){workspaceObserver=new IntersectionObserver(([entry])=>document.body.classList.toggle('workspace-visible',entry.isIntersecting));workspaceObserver.observe(workspace);}
    if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){ensure(active);observer.disconnect();}},{rootMargin:'250px'});observer.observe(workspace);}
    else ensure(active);
  }
  async function ensure(id){
    if(instances[id])return instances[id];if(pending[id])return pending[id];if(!workspace)return;
    const panel=workspace.querySelector('#'+id);
    pending[id]=(async()=>{try{
      let result;
      if(id==='engine-lab'){const {mountEngineLab}=await import('./engine-lab.js');panel.replaceChildren();result=await mountEngineLab(panel);}
      if(id==='tuning-garage'){const {mountGarage}=await import('./garage.js');panel.replaceChildren();result=await mountGarage(panel,{catalog});}
      if(id==='academy'){const {mountAcademy}=await import('./academy.js');panel.replaceChildren();result=await mountAcademy(panel);}
      instances[id]=result||{};return instances[id];
    }catch(error){panel.innerHTML=`<div class="workspace-error"><h3>This workspace could not load.</h3><p>Your model collection and saved data are still available.</p><button type="button" class="primary">Try again</button></div>`;panel.querySelector('button').onclick=()=>{delete pending[id];ensure(id);};console.error('Workspace load failed:',id,error);return null;}})();
    return pending[id];
  }
  async function openWorkspace(id,scroll=true){
    if(!titles[id])return;
    if(!isHome){location.href='/#'+id;return;}
    if(getCurrent())showCollection({skipHistory:true});
    if(active!==id)instances['tuning-garage']?.stop?.();
    active=id;workspace.hidden=false;markNavigation(id);
    workspace.querySelectorAll('[role=tabpanel]').forEach(p=>p.hidden=p.id!==id);
    workspace.querySelectorAll('[role=tab]').forEach(b=>{const selected=b.dataset.workspaceTab===id;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
    if(scroll){const params=new URLSearchParams(location.search);for(const key of ['model','view','part'])params.delete(key);const target=location.pathname+(params.size?'?'+params:'')+'#'+id;if(location.pathname+location.search+location.hash!==target)history.pushState(null,'',target);workspace.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
    return ensure(id);
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    const url=new URL(a.href,location.href),id=url.hash.slice(1);
    if(url.origin===location.origin&&titles[id]&&isHome){e.preventDefault();openWorkspace(id);}
    if(url.origin===location.origin&&url.hash==='#collection'&&getCurrent()&&isHome){e.preventDefault();showCollection();document.querySelector('#collection').scrollIntoView({behavior:'smooth'});}
  },{signal:abort.signal});
  window.addEventListener('hashchange',()=>{if(titles[location.hash.slice(1)])openWorkspace(location.hash.slice(1),false);},{signal:abort.signal});
  // Let the existing model router restore current before updating workspace tabs.
  window.addEventListener('popstate',()=>requestAnimationFrame(()=>{if(titles[location.hash.slice(1)])openWorkspace(location.hash.slice(1),false);}),{signal:abort.signal});
  function updateDetail(){
    const m=getCurrent();document.querySelector('.expanded-factory-specs')?.remove();document.querySelector('.engineering-detail-actions')?.remove();
    if(!m)return;markNavigation('models');instances['tuning-garage']?.stop?.();
    const actions=document.createElement('div');actions.className='engineering-detail-actions';
    actions.innerHTML=(m.id==='f10-m5'?'<button class="primary" type="button" data-open-engine>Explore the S63 in 3D <span aria-hidden="true">↗</span></button>':'')+(!/eDrive/.test(m.code)?'<button type="button" data-open-garage>Build in the tuning garage <span aria-hidden="true">↗</span></button>':'');
    document.querySelector('.detail-actions').after(actions);
    actions.querySelector('[data-open-engine]')?.addEventListener('click',()=>openWorkspace('engine-lab'));
    actions.querySelector('[data-open-garage]')?.addEventListener('click',async()=>{if(!isHome){location.href='/?garage='+encodeURIComponent(m.id)+'#tuning-garage';return;}const instance=await openWorkspace('tuning-garage');instance?.selectModel?.(m.id);});
    const section=document.createElement('section');section.className='expanded-factory-specs';section.setAttribute('aria-label','Detailed factory specifications');
    const unavailable='Not yet verified';
    const values=[['0–100 km/h',m.acceleration100?m.acceleration100+' s':unavailable],['Top speed',m.topSpeed?m.topSpeed+' km/h':unavailable],['Transmission',m.transmission||unavailable],['Drivetrain',m.drivetrain||unavailable],['Vehicle mass',m.weightKg?m.weightKg.toLocaleString()+' kg · '+(m.weightConvention||''):unavailable],['Displacement',m.displacementCc?m.displacementCc.toLocaleString()+' cm³':unavailable]];
    section.innerHTML=`<details ${m.verified?'open':''}><summary>Detailed factory specifications <span>${m.verified?'Source-checked launch configuration':'Additional source coverage pending'}</span></summary>${m.verified?`<p class="spec-context">${esc(m.verified.specification)}</p>`:''}<dl>${values.map(([label,value])=>`<div><dt>${label}</dt><dd class="${value===unavailable?'spec-unavailable':''}">${esc(value)}</dd></div>`).join('')}</dl>${m.verified?.sources?`<div class="spec-source-links">${m.verified.sources.map(s=>`<a href="${esc(typeof s==='string'?s:s.url)}" target="_blank" rel="noopener">${esc(typeof s==='string'?'BMW technical source':s.label||s.title||'BMW technical source')} ↗</a>`).join('')}</div>`:'<p class="spec-context">Power and torque above retain their original factory source. Additional measurements stay unavailable until their exact year, market and configuration are checked.</p>'}</details>`;
    document.querySelector('.machine-bar').after(section);
  }
  window.addEventListener('apex:modelselected',updateDetail,{signal:abort.signal});
  window.addEventListener('apex:collection',()=>{instances['tuning-garage']?.stop?.();markNavigation('models');},{signal:abort.signal});
  const systems=mountSystemGuide(document.querySelector('#partslibrary'),{dialog});
  const search=mountSmartSearch({catalog,parts:[...partCatalog,...systemComponents],onModel:id=>{const m=catalog.find(m=>m.id===id);if(document.body.dataset.page==='parts'||document.body.dataset.page==='about'||document.body.dataset.page==='electric'&&m.code!=='eDrive')location.href='/?model='+encodeURIComponent(id);else selectModel(id);},onPart:index=>index<partCatalog.length?openPart(index):systems.open(systemComponents[index-partCatalog.length].id),onCompare:compareModels,onTopic:async id=>{
    if(titles[id])return openWorkspace(id);
    if(!isHome){location.href='/?lesson='+encodeURIComponent(id)+'#academy';return;}
    const instance=await openWorkspace('academy');if(id==='engine-codes')instance?.setTab?.('codes');else if(['mechanic','history'].includes(id))instance?.setTab?.(id);else instance?.openLesson?.(id);
  }});
  updateDetail();
  const entry=new URLSearchParams(location.search), hash=location.hash.slice(1);
  if(titles[hash])requestAnimationFrame(async()=>{const instance=await openWorkspace(hash);if(hash==='tuning-garage'&&entry.get('garage'))instance?.selectModel?.(entry.get('garage'));if(hash==='academy'&&entry.get('lesson')){const id=entry.get('lesson');if(id==='engine-codes')instance?.setTab?.('codes');else if(['mechanic','history'].includes(id))instance?.setTab?.(id);else instance?.openLesson?.(id);}});
  return {openWorkspace,search,destroy(){abort.abort();workspaceObserver?.disconnect();document.body.classList.remove('workspace-visible');search.destroy();Object.values(instances).forEach(i=>i.destroy?.());}};
}
