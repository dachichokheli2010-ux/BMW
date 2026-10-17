import {t, translatePage} from './preferences.js';
import {createComparisonController} from './comparison.js';

const icons = {
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  compare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>'
};
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function stored(key) { try { const value=JSON.parse(localStorage.getItem(key)||'[]'); return Array.isArray(value)?value.filter(x=>typeof x==='string'):[]; } catch { return []; } }
function save(key,value) { try { localStorage.setItem(key,JSON.stringify([...value])); } catch {} }
export const isM = m => m.isM === true || m.generation.startsWith('M SERIES') || /^BMW (?:M[1-8](?:\b|\s)|1 Series M|1M\b|X[3-6] M\b|XM\b|Z[34] M\b)/.test(m.name);
export const isElectric = m => m.code === 'eDrive' || m.fuel === 'electric' || m.electric === true;
const powerHP = m => Number(m.power)*(m.powerUnit==='kW'?1.34102:m.powerUnit==='PS'?0.98632:1);
export const yearOf=m=>Number(m.modelYear)||Number(String(m.market).match(/\b(?:19|20)\d{2}\b/)?.[0])||null;
export const fuelOf=m=>isElectric(m)?'electric':m.hybridNote||/plug-in/i.test(m.powertrain||'')?'hybrid':'petrol';
const bodyOf=m=>/Touring|Wagon|Estate/.test(m.body)?'touring':/Sedan/.test(m.body)?'sedan':/Coup/.test(m.body)?'coupe':/SUV/.test(m.body)?'suv':/Roadster|Convertible/.test(m.body)?'open':/Hatch/.test(m.body)?'hatch':'other';
function series(m) {
  const name=m.name.replace(/^BMW /,'');
  if (/^i[\dX]/i.test(name) && name!=='i8') return 'BMW i';
  if (/^X/.test(name)) return 'BMW X';
  if (/^Z/.test(name)) return 'BMW Z';
  if(name==='i8') return 'BMW i';
  const digit=(name.match(/^M?([1-8])/)||[])[1];
  return digit?digit+' Series':'Heritage';
}

export function mountCollection({models, catalog=models, getCurrent=()=>null, selectModel, showCollection, dialog, toast, threeModels, electricPage}) {
  const $=s=>document.querySelector(s), favorites=new Set(stored('apex-favorites').filter(id=>catalog.some(m=>m.id===id))), comparison=new Set(stored('apex-comparison').filter(id=>catalog.some(m=>m.id===id)).slice(0,4));
  let active='all',limit=12,quick='',viewStyle='grid',compareController;
  try{viewStyle=localStorage.getItem('apex-view')==='list'?'list':'grid';}catch{}
  const filters=[['all','All models'],['m','BMW M'],['electric','Electric'],['sedan','Sedans'],['coupe','Coupes'],['suv','SUVs'],['roadster','Roadsters'],['touring','Touring'],['heritage','Heritage'],['saved','Saved'],['3d','3D cars']];
  $('#filters').innerHTML=filters.map(([id,label])=>`<button data-filter="${id}" aria-pressed="${id==='all'}" class="${id==='all'?'active':''}">${id==='saved'?icons.heart:''}<span>${esc(t(label))}</span>${id==='m'?'<i class="m-stripes" aria-hidden="true"></i>':''}</button>`).join('');
  const seriesNames=[...new Set(models.map(series))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  $('#series-filter').innerHTML='<option value="all">'+esc(t('All series'))+'</option>'+seriesNames.map(s=>`<option>${esc(s)}</option>`).join('');
  $('#modelsort').innerHTML=[['collection','Collection order'],['name','Model name'],['newest','Newest first'],['power-desc','Power: high to low'],['power-asc','Power: low to high'],['generation','Generation code']].map(([value,label])=>`<option value="${value}">${esc(t(label))}</option>`).join('');
  const normalized=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function matches(m) {
    const category=active==='all'||active==='m'&&isM(m)||active==='electric'&&isElectric(m)||active==='sedan'&&bodyOf(m)==='sedan'||active==='coupe'&&bodyOf(m)==='coupe'||active==='suv'&&bodyOf(m)==='suv'||active==='roadster'&&bodyOf(m)==='open'||active==='touring'&&bodyOf(m)==='touring'||active==='heritage'&&yearOf(m)&&yearOf(m)<2000||active==='saved'&&favorites.has(m.id)||active==='3d'&&!!threeModels[m.id];
    const query=normalized($('#modelsearch').value).trim().split(/\s+/).filter(Boolean);
    const haystack=normalized([m.name,m.id,m.series,m.generation,m.code,m.layout,m.body,t(m.body==='Coupés'?'Coupes':m.body),series(m),yearOf(m),'BMW ბმვ бмв',isM(m)?'BMW M M cars performance':'',isElectric(m)?'electric ev '+t('Electric'):'',fuelOf(m)==='hybrid'?'hybrid '+t('Plug-in hybrid'):''].join(' '));
    const era=$('#era-filter').value,year=yearOf(m),fuel=$('#powertrain-filter').value,body=$('#body-filter').value;
    const eraMatches=era==='all'||era==='classic'&&year&&year<2000||era==='modern'&&year>=2000&&year<2020||era==='recent'&&year>=2020;
    const quickMatches=quick!=='daily'||!isM(m)&&['sedan','hatch'].includes(bodyOf(m));
    return category&&quickMatches&&eraMatches&&(fuel==='all'||fuelOf(m)===fuel)&&(body==='all'||bodyOf(m)===body)&&powerHP(m)>=Number($('#power-filter').value)&&($('#series-filter').value==='all'||series(m)===$('#series-filter').value)&&query.every(term=>haystack.includes(term));
  }
  function card(m,i) {
    return `<article class="model-card"><a class="model" data-model="${esc(m.id)}" href="${electricPage?'/electric':'/'}?model=${encodeURIComponent(m.id)}" aria-label="${esc(t('Explore model'))}: ${esc(m.name)} ${esc(m.generation.split(' / ')[1]?.trim())}"><div class="model-image"><img src="${esc(m.car)}" alt="${esc(m.name)} ${esc(m.generation.split(' / ')[1]?.trim())}" loading="lazy" decoding="async"><span class="model-chassis">${esc(m.generation.split(' / ')[1]?.trim())}</span>${isM(m)?'<span class="model-tag"><i class="m-stripes" aria-hidden="true"></i> M</span>':isElectric(m)?'<span class="model-tag electric-tag">'+esc(t('Electric'))+'</span>':''}</div><div class="model-info"><div><span class="model-category">${esc(t(m.body==='Coupés'?'Coupes':m.body))}</span><h3>${esc(m.name.replace('BMW ',''))}</h3><small>${esc(m.code)} <span>·</span> ${esc(m.power)} ${esc(m.powerUnit)}</small></div><span class="model-arrow">${icons.arrow}</span></div></a><div class="card-actions"><button data-save="${esc(m.id)}" class="icon-button save-model ${favorites.has(m.id)?'is-saved':''}" aria-label="${esc(t(favorites.has(m.id)?'Remove from garage':'Save to garage'))}: ${esc(m.name)}" aria-pressed="${favorites.has(m.id)}" title="${esc(t(favorites.has(m.id)?'Remove from garage':'Save to garage'))}">${icons.heart}</button><button data-compare="${esc(m.id)}" class="compare-model ${comparison.has(m.id)?'is-selected':''}" aria-pressed="${comparison.has(m.id)}">${icons.compare}<span>${esc(t(comparison.has(m.id)?'Remove':'Compare'))}</span></button></div></article>`;
  }
  function render() {
    const list=models.filter(matches), order=$('#modelsort').value;
    if(order==='name')list.sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
    if(order==='generation')list.sort((a,b)=>a.generation.split(' / ')[1].trim().localeCompare(b.generation.split(' / ')[1].trim(),undefined,{numeric:true}));
    if(order==='power-desc'||order==='power-asc')list.sort((a,b)=>(powerHP(a)-powerHP(b))*(order==='power-desc'?-1:1));
    if(order==='newest')list.sort((a,b)=>(yearOf(b)||0)-(yearOf(a)||0));
    $('#models').innerHTML=list.slice(0,limit).map(card).join('');
    $('#models').classList.toggle('list-view',viewStyle==='list');
    $('#grid-view').setAttribute('aria-pressed',String(viewStyle==='grid'));$('#list-view').setAttribute('aria-pressed',String(viewStyle==='list'));
    $('#collectioncount').textContent=String(list.length).padStart(2,'0')+' / '+String(models.length).padStart(2,'0');
    $('#searchsummary').textContent=t('Showing {shown} of {total} models',{shown:Math.min(limit,list.length),total:list.length});
    $('#clearsearch').hidden=!$('#modelsearch').value;
    $('#searchempty').hidden=!!list.length;
    $('#searchempty h3').textContent=t(active==='saved'?'No saved models yet':'No matching BMWs');
    $('#searchempty p').textContent=t(active==='saved'?'Save a model with the heart button to build your garage.':'Try another model, engine or generation.');
    $('#load-more').hidden=list.length<=limit;
    $('#load-more').textContent=t('Show more models')+' ('+Math.max(0,list.length-limit)+')';
    document.querySelectorAll('[data-filter]').forEach(b=>{const on=b.dataset.filter===active;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
    document.querySelectorAll('[data-saved-count]').forEach(e=>e.textContent=String(favorites.size));
    document.querySelectorAll('[data-quick]').forEach(b=>b.setAttribute('aria-pressed',String(quick===b.dataset.quick)));
    updateCompare();renderActiveFilters();renderRecent();renderDetailActions();translatePage();
  }
  function updateCompare() {
    const chosen=[...comparison].map(id=>catalog.find(m=>m.id===id)).filter(Boolean);
    $('#compare-tray').hidden=!chosen.length;
    $('#compare-items').innerHTML=chosen.map(m=>`<button data-uncompare="${esc(m.id)}" aria-label="${esc(t('Remove'))} ${esc(m.name)}"><img src="${esc(m.car)}" alt=""><span>${esc(m.name.replace('BMW ',''))}<small>${esc(m.generation.split(' / ')[1].trim())}</small></span><span aria-hidden="true">×</span></button>`).join('');
    $('#open-comparison').textContent=t('Compare')+' ('+chosen.length+'/4)';
    $('#open-comparison').disabled=chosen.length<1;
    compareController?.refresh();
  }
  function openComparison(){compareController.open();}
  function clearAdvanced(){for(const id of ['#powertrain-filter','#era-filter','#body-filter'])$(id).value='all';$('#power-filter').value='0';}
  function syncFilterUrl(write=true){const params=new URLSearchParams();if(active!=='all')params.set('collection',active);if(quick==='daily')params.set('pick','daily');for(const [key,id] of [['series','#series-filter'],['fuel','#powertrain-filter'],['era','#era-filter'],['body','#body-filter'],['power','#power-filter']]){const value=$(id).value;if(value!=='all'&&value!=='0')params.set(key,value);}if($('#modelsearch').value.trim())params.set('q',$('#modelsearch').value.trim());const address=(electricPage?'/electric':'/')+(params.size?'?'+params:'')+'#collection';if(write)history.replaceState(null,'',address);return address;}
  function renderActiveFilters(){
    const chips=[];
    if(active!=='all')chips.push(['category',t(filters.find(([id])=>id===active)?.[1]||'All models')]);
    if(quick==='daily')chips.push(['daily',t('Daily drivers')]);
    if($('#modelsearch').value.trim())chips.push(['query',t('Search')+': '+$('#modelsearch').value.trim()]);
    for(const id of ['#series-filter','#powertrain-filter','#era-filter','#body-filter','#power-filter'])if($(id).value!=='all'&&$(id).value!=='0')chips.push([id,$(id).selectedOptions[0].textContent]);
    $('#active-filters').hidden=!chips.length;
    $('#active-filters').innerHTML=chips.map(([id,label])=>`<button data-remove-filter="${id}" aria-label="${esc(t('Remove filter'))}: ${esc(label)}">${esc(label)} <span aria-hidden="true">×</span></button>`).join('');
    $('#filter-count').hidden=!chips.length;$('#filter-count').textContent=String(chips.length);
  }
  function miniCard(m){return `<a class="mini-model" data-model="${esc(m.id)}" href="/?model=${encodeURIComponent(m.id)}"><img src="${esc(m.car)}" alt="${esc(m.name)}" loading="lazy"><span><strong>${esc(m.name.replace('BMW ',''))}</strong><small>${esc(m.generation.split(' / ')[1])} · ${esc(m.power)} ${esc(m.powerUnit)}</small></span><span aria-hidden="true">↗</span></a>`;}
  function renderRecent(){const section=$('#recent-section');if(!section)return;const recent=stored('apex-recent').map(id=>catalog.find(m=>m.id===id)).filter(Boolean).slice(0,4);section.hidden=!recent.length||!!getCurrent();$('#recent-models').innerHTML=recent.map(miniCard).join('');}
  function recordViewed(id){save('apex-recent',new Set([id,...stored('apex-recent').filter(value=>value!==id)].slice(0,8)));renderRecent();renderDetailActions();}
  function renderDetailActions(){const m=getCurrent();if(!m)return;$('#detail-save').setAttribute('aria-pressed',String(favorites.has(m.id)));$('#detail-save span').textContent=t(favorites.has(m.id)?'Saved':'Save to garage');$('#detail-compare').setAttribute('aria-pressed',String(comparison.has(m.id)));const score=other=>(isM(m)===isM(other)?3:0)+(fuelOf(m)===fuelOf(other)?3:0)+(bodyOf(m)===bodyOf(other)?2:0)+(series(m)===series(other)?4:0)-Math.min(2,Math.abs(powerHP(m)-powerHP(other))/200);const related=models.filter(other=>other.id!==m.id).sort((a,b)=>score(b)-score(a)).slice(0,3);$('#related-models').innerHTML=related.map(miniCard).join('');}
  function renderPresets(){const grid=$('#matchup-grid');if(!grid)return;const pairs=[['M3 vs M4',['g80','g82-m4']],['M2 vs 1M',['g87-m2','e82-1m']],['Electric vs petrol',['g60-i5','g30-530i']]];grid.innerHTML=pairs.map(([title,ids])=>{const cars=ids.map(id=>catalog.find(m=>m.id===id)).filter(Boolean);if(cars.length!==2)return '';return `<button class="matchup-card" data-compare-preset="${ids.join(',')}"><div class="matchup-photos">${cars.map(m=>`<img src="${esc(m.car)}" alt="${esc(m.name)}" loading="lazy">`).join('')}<span>VS</span></div><div class="matchup-copy"><span>${esc(t(title))}</span><small>${esc(t('Compare this pair'))} →</small></div></button>`;}).join('');}
  function setComparison(ids){comparison.clear();ids.filter(id=>catalog.some(m=>m.id===id)).slice(0,4).forEach(id=>comparison.add(id));save('apex-comparison',comparison);render();}
  function setFilter(filter) {
    active=filters.some(([id])=>id===filter)?filter:'all';limit=12;
    quick='';$('#modelsearch').value='';$('#series-filter').value='all';clearAdvanced();
    if($('#collection').hidden)showCollection();
    syncFilterUrl();
    render();$('#collection').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }
  document.addEventListener('click',event=>{
    const filter=event.target.closest('[data-filter]');if(filter){setFilter(filter.dataset.filter);return;}
    const saveButton=event.target.closest('[data-save]');
    if(saveButton){const id=saveButton.dataset.save;favorites.has(id)?favorites.delete(id):favorites.add(id);save('apex-favorites',favorites);const y=window.scrollY;render();$(`[data-save="${id}"]`)?.focus({preventScroll:true});window.scrollTo({top:y,behavior:'instant'});return;}
    const compareButton=event.target.closest('[data-compare],[data-uncompare]');
    if(compareButton){const id=compareButton.dataset.compare||compareButton.dataset.uncompare;if(comparison.has(id))comparison.delete(id);else if(comparison.size<4)comparison.add(id);else{toast(t('Select up to 4 models to compare.'));return;}save('apex-comparison',comparison);render();$(`[data-compare="${id}"]`)?.focus({preventScroll:true});return;}
    const modelLink=event.target.closest('a[data-model]');
    if(modelLink&&models.some(m=>m.id===modelLink.dataset.model)&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&event.button===0){event.preventDefault();selectModel(modelLink.dataset.model);}
    const quickButton=event.target.closest('[data-quick]');if(quickButton){const id=quickButton.dataset.quick;setFilter(id==='m'?'m':id==='electric'?'electric':id==='open'?'roadster':'all');quick=id;limit=12;syncFilterUrl();render();}
    const removeFilter=event.target.closest('[data-remove-filter]');if(removeFilter){const id=removeFilter.dataset.removeFilter;if(id==='category'){active='all';quick='';}else if(id==='query')$('#modelsearch').value='';else if(id==='daily')quick='';else $(id).value=id==='#power-filter'?'0':'all';limit=12;syncFilterUrl();render();}
    const preset=event.target.closest('[data-compare-preset]');if(preset){setComparison(preset.dataset.comparePreset.split(','));openComparison();}
    if(event.target.closest('[data-start-compare]'))openComparison();
    const shortcut=event.target.closest('[data-collection]');if(shortcut){if(document.body.dataset.page==='parts'||document.body.dataset.page==='about'||document.body.dataset.page&&shortcut.dataset.collection==='saved'){window.location.href='/?collection='+shortcut.dataset.collection;return;}setFilter(shortcut.dataset.collection);}
  });
  $('#modelsearch').addEventListener('input',()=>{limit=12;syncFilterUrl();render();});
  $('#modelsearch').addEventListener('keydown',event=>{if(event.key==='Escape'){$('#clearsearch').click();}if(event.key==='Enter'){const found=models.filter(matches);if(found.length===1)selectModel(found[0].id);}});
  $('#clearsearch').onclick=()=>{$('#modelsearch').value='';limit=12;syncFilterUrl();render();$('#modelsearch').focus();};
  $('#resetfilters').onclick=()=>setFilter('all');
  $('#series-filter').onchange=$('#modelsort').onchange=()=>{limit=12;syncFilterUrl();render();};
  for(const id of ['#powertrain-filter','#era-filter','#body-filter','#power-filter'])$(id).onchange=()=>{limit=12;syncFilterUrl();render();};
  $('#filter-toggle').onclick=()=>{const open=$('#advanced-filters').hidden;$('#advanced-filters').hidden=!open;$('#filter-toggle').setAttribute('aria-expanded',String(open));};
  $('#reset-advanced').onclick=()=>setFilter('all');
  for(const style of ['grid','list'])$('#'+style+'-view').onclick=()=>{viewStyle=style;try{localStorage.setItem('apex-view',style);}catch{}render();};
  $('#load-more').onclick=()=>{const previous=limit;limit+=12;render();$('#models').children[previous]?.querySelector('a')?.focus({preventScroll:true});};
  $('#open-comparison').onclick=openComparison;
  $('#clear-comparison').onclick=()=>{comparison.clear();save('apex-comparison',comparison);render();};
  window.addEventListener('apex:languagechange',render);
  window.addEventListener('storage',event=>{if(event.key==='apex-favorites'){favorites.clear();stored('apex-favorites').filter(id=>catalog.some(m=>m.id===id)).forEach(x=>favorites.add(x));render();}if(event.key==='apex-comparison'){comparison.clear();stored('apex-comparison').filter(id=>catalog.some(m=>m.id===id)).slice(0,4).forEach(id=>comparison.add(id));render();}if(event.key==='apex-recent')renderRecent();});
  $('#browse3d span').textContent=Object.keys(threeModels).length;
  $('#browse3d').hidden=electricPage;
  $('#browse3d').onclick=()=>setFilter('3d');
  const initial=new URLSearchParams(location.search).get('collection');
  if(initial&&filters.some(([id])=>id===initial))active=initial;
  const params=new URLSearchParams(location.search);
  for(const [param,id] of [['series','#series-filter'],['fuel','#powertrain-filter'],['era','#era-filter'],['body','#body-filter'],['power','#power-filter']]){const value=params.get(param);if(value&&[...$(id).options].some(o=>o.value===value))$(id).value=value;}
  if(params.get('q'))$('#modelsearch').value=params.get('q');
  if(params.get('pick')==='daily')quick='daily';
  compareController=createComparisonController({catalog,getSelected:()=>[...comparison],onSelectionChange:setComparison,dialog,toast});
  render();renderPresets();
  const shared=(params.get('compare')||'').split(',').filter(id=>catalog.some(m=>m.id===id)).slice(0,4);
  if(shared.length){setComparison(shared);requestAnimationFrame(openComparison);}
  if(initial&&!document.body.dataset.page)requestAnimationFrame(()=>$('#collection').scrollIntoView({block:'start'}));
  document.querySelectorAll('[data-model-total]').forEach(el=>el.textContent=models.length);
  document.querySelectorAll('[data-m-total]').forEach(el=>el.textContent=models.filter(isM).length);
  $('#clear-recent')?.addEventListener('click',()=>{try{localStorage.removeItem('apex-recent');}catch{}renderRecent();});
  $('#detail-save').onclick=()=>{const m=getCurrent();if(!m)return;favorites.has(m.id)?favorites.delete(m.id):favorites.add(m.id);save('apex-favorites',favorites);render();};
  $('#detail-compare').onclick=()=>{const m=getCurrent();if(!m)return;if(!comparison.has(m.id)){if(comparison.size>=4){toast(t('Select up to 4 models to compare.'));return;}setComparison([...comparison,m.id]);}openComparison();};
  $('#detail-share').onclick=async()=>{const m=getCurrent();if(!m)return;const url=location.origin+'/?model='+encodeURIComponent(m.id);try{await navigator.clipboard.writeText(url);toast(t('Link copied'));}catch{dialog(`<h2>${esc(t('Copy this link'))}</h2><input class="share-link-input" aria-label="${esc(t('Share model'))}" readonly value="${esc(url)}">`);$('#dialogbody input')?.select();}};
  $('#related-back').onclick=showCollection;
  document.addEventListener('keydown',event=>{if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.target.closest('input,select,textarea,[contenteditable=true]')&&!$('#dialog').open){if(document.body.dataset.page==='about')return;event.preventDefault();if(document.body.dataset.page==='parts'){$('#partsearch').focus();return;}if(getCurrent())showCollection();$('#modelsearch').focus();$('#modelsearch').scrollIntoView({block:'center'});}});
  function compareModels(ids){
    const selected=[...new Set(Array.isArray(ids)?ids:[])].filter(id=>catalog.some(model=>model.id===id)).slice(0,4);
    if(selected.length<2)return false;
    setComparison(selected);
    openComparison();
    return true;
  }
  return {render,setFilter,recordViewed,compareModels,getCollectionUrl:()=>syncFilterUrl(false)};
}
