import {t, translatePage} from './preferences.js';

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
function series(m) {
  const name=m.name.replace(/^BMW /,'');
  if (/^i[\dX]/i.test(name) && name!=='i8') return 'BMW i';
  if (/^X/.test(name)) return 'BMW X';
  if (/^Z/.test(name)) return 'BMW Z';
  if(name==='i8') return 'BMW i';
  const digit=(name.match(/^M?([1-8])/)||[])[1];
  return digit?digit+' Series':'Heritage';
}

export function mountCollection({models, catalog=models, selectModel, showCollection, dialog, toast, threeModels, electricPage}) {
  const $=s=>document.querySelector(s), favorites=new Set(stored('apex-favorites').filter(id=>catalog.some(m=>m.id===id))), comparison=new Set(stored('apex-comparison').filter(id=>catalog.some(m=>m.id===id)).slice(0,3));
  let active='all', limit=12;
  const filters=[['all','All models'],['m','BMW M'],['electric','Electric'],['sedan','Sedans'],['coupe','Coupes'],['suv','SUVs'],['roadster','Roadsters'],['heritage','Heritage'],['saved','Saved'],['3d','3D cars']];
  $('#filters').innerHTML=filters.map(([id,label])=>`<button data-filter="${id}" aria-pressed="${id==='all'}" class="${id==='all'?'active':''}">${id==='saved'?icons.heart:''}<span>${esc(t(label))}</span>${id==='m'?'<i class="m-stripes" aria-hidden="true"></i>':''}</button>`).join('');
  const seriesNames=[...new Set(models.map(series))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  $('#series-filter').innerHTML='<option value="all">'+esc(t('All series'))+'</option>'+seriesNames.map(s=>`<option>${esc(s)}</option>`).join('');
  $('#modelsort').innerHTML=[['collection','Collection order'],['name','Model name'],['power-desc','Power: high to low'],['power-asc','Power: low to high'],['generation','Generation code']].map(([value,label])=>`<option value="${value}">${esc(t(label))}</option>`).join('');
  const normalized=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function matches(m) {
    const category=active==='all'||active==='m'&&isM(m)||active==='electric'&&isElectric(m)||active==='sedan'&&m.body==='Sedans'||active==='coupe'&&/Coup/.test(m.body)||active==='suv'&&m.body==='SUVs'||active==='roadster'&&/Roadster|Convertible/.test(m.body)||active==='heritage'&&/\b(?:E\d\d|E\d\d\/|E26)\b/.test(m.generation)||active==='saved'&&favorites.has(m.id)||active==='3d'&&!!threeModels[m.id];
    const query=normalized($('#modelsearch').value).trim().split(/\s+/).filter(Boolean);
    const haystack=normalized([m.name,m.id,m.series,m.generation,m.code,m.layout,m.body,series(m),isM(m)?'BMW M M cars performance':'',isElectric(m)?'electric ev':''].join(' '));
    return category&&($('#series-filter').value==='all'||series(m)===$('#series-filter').value)&&query.every(term=>haystack.includes(term));
  }
  function card(m,i) {
    return `<article class="model-card"><a class="model" data-model="${esc(m.id)}" href="${electricPage?'/electric':'/'}?model=${encodeURIComponent(m.id)}" aria-label="${esc(t('Explore model'))}: ${esc(m.name)} ${esc(m.generation.split(' / ')[1]?.trim())}"><div class="model-image"><img src="${esc(m.car)}" alt="${esc(m.name)} ${esc(m.generation.split(' / ')[1]?.trim())}" loading="lazy" decoding="async"><span class="model-chassis">${esc(m.generation.split(' / ')[1]?.trim())}</span>${isM(m)?'<span class="model-tag"><i class="m-stripes" aria-hidden="true"></i> M</span>':isElectric(m)?'<span class="model-tag electric-tag">'+esc(t('Electric'))+'</span>':''}</div><div class="model-info"><div><span class="model-category">${esc(t(m.body==='Coupés'?'Coupes':m.body))}</span><h3>${esc(m.name.replace('BMW ',''))}</h3><small>${esc(m.code)} <span>·</span> ${esc(m.power)} ${esc(m.powerUnit)}</small></div><span class="model-arrow">${icons.arrow}</span></div></a><div class="card-actions"><button data-save="${esc(m.id)}" class="icon-button save-model ${favorites.has(m.id)?'is-saved':''}" aria-label="${esc(t(favorites.has(m.id)?'Remove from garage':'Save to garage'))}: ${esc(m.name)}" aria-pressed="${favorites.has(m.id)}" title="${esc(t(favorites.has(m.id)?'Remove from garage':'Save to garage'))}">${icons.heart}</button><button data-compare="${esc(m.id)}" class="compare-model ${comparison.has(m.id)?'is-selected':''}" aria-pressed="${comparison.has(m.id)}">${icons.compare}<span>${esc(t(comparison.has(m.id)?'Remove':'Compare'))}</span></button></div></article>`;
  }
  function render() {
    const list=models.filter(matches), order=$('#modelsort').value;
    if(order==='name')list.sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
    if(order==='generation')list.sort((a,b)=>a.generation.split(' / ')[1].trim().localeCompare(b.generation.split(' / ')[1].trim(),undefined,{numeric:true}));
    if(order==='power-desc'||order==='power-asc')list.sort((a,b)=>(powerHP(a)-powerHP(b))*(order==='power-desc'?-1:1));
    $('#models').innerHTML=list.slice(0,limit).map(card).join('');
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
    updateCompare(); translatePage();
  }
  function updateCompare() {
    const chosen=[...comparison].map(id=>catalog.find(m=>m.id===id)).filter(Boolean);
    $('#compare-tray').hidden=!chosen.length;
    $('#compare-items').innerHTML=chosen.map(m=>`<button data-uncompare="${esc(m.id)}" aria-label="${esc(t('Remove'))} ${esc(m.name)}"><img src="${esc(m.car)}" alt=""><span>${esc(m.name.replace('BMW ',''))}<small>${esc(m.generation.split(' / ')[1].trim())}</small></span><span aria-hidden="true">×</span></button>`).join('');
    $('#open-comparison').textContent=t('Compare')+' ('+chosen.length+'/3)';
    $('#open-comparison').disabled=chosen.length<2;
  }
  function openComparison() {
    const chosen=[...comparison].map(id=>catalog.find(m=>m.id===id)).filter(Boolean);
    if(chosen.length<2)return;
    const rows=[['Generation',m=>m.generation.split(' / ')[1].trim()],['Power',m=>m.power+' '+m.powerUnit],['Torque',m=>m.torque+' '+m.torqueUnit],['Engine',m=>m.code+' / '+m.layout],['Body style',m=>t(m.body==='Coupés'?'Coupes':m.body)],['Specification',m=>m.market]];
    dialog(`<div class="comparison-dialog"><span class="eyebrow">APEX / ${esc(t('Compare'))}</span><h2>${esc(t('Compare models'))}</h2><p>${esc(t('Factory figures use each model’s stated year, market and units.'))}</p><div class="comparison-scroll"><table><thead><tr><th scope="col"><span class="sr-only">${esc(t('Specification'))}</span></th>${chosen.map(m=>`<th scope="col"><img src="${esc(m.car)}" alt="${esc(m.name)}"><h3>${esc(m.name)}</h3></th>`).join('')}</tr></thead><tbody>${rows.map(([label,value])=>`<tr><th scope="row">${esc(t(label))}</th>${chosen.map(m=>`<td>${esc(value(m))}</td>`).join('')}</tr>`).join('')}<tr><th></th>${chosen.map(m=>`<td><a class="button-link" href="/?model=${encodeURIComponent(m.id)}">${esc(t('Open model'))} ↗</a></td>`).join('')}</tr></tbody></table></div></div>`);
  }
  function setFilter(filter) {
    active=filters.some(([id])=>id===filter)?filter:'all';limit=12;
    $('#modelsearch').value='';$('#series-filter').value='all';
    if($('#collection').hidden)showCollection();
    history.replaceState(null,'',(electricPage?'/electric':'/')+(active==='all'?'':'?collection='+active)+'#collection');
    render();$('#collection').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }
  document.addEventListener('click',event=>{
    const filter=event.target.closest('[data-filter]');if(filter){setFilter(filter.dataset.filter);return;}
    const saveButton=event.target.closest('[data-save]');
    if(saveButton){const id=saveButton.dataset.save;favorites.has(id)?favorites.delete(id):favorites.add(id);save('apex-favorites',favorites);const y=window.scrollY;render();$(`[data-save="${id}"]`)?.focus({preventScroll:true});window.scrollTo({top:y,behavior:'instant'});return;}
    const compareButton=event.target.closest('[data-compare],[data-uncompare]');
    if(compareButton){const id=compareButton.dataset.compare||compareButton.dataset.uncompare;if(comparison.has(id))comparison.delete(id);else if(comparison.size<3)comparison.add(id);else{toast(t('Select up to 3 models to compare.'));return;}save('apex-comparison',comparison);render();$(`[data-compare="${id}"]`)?.focus({preventScroll:true});return;}
    const modelLink=event.target.closest('a[data-model]');
    if(modelLink&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&event.button===0){event.preventDefault();selectModel(modelLink.dataset.model);}
    const shortcut=event.target.closest('[data-collection]');if(shortcut){if(document.body.dataset.page==='parts'||document.body.dataset.page==='about'||document.body.dataset.page&&shortcut.dataset.collection==='saved'){window.location.href='/?collection='+shortcut.dataset.collection;return;}setFilter(shortcut.dataset.collection);}
  });
  $('#modelsearch').addEventListener('input',()=>{limit=12;render();});
  $('#modelsearch').addEventListener('keydown',event=>{if(event.key==='Escape'){$('#clearsearch').click();}if(event.key==='Enter'){const found=models.filter(matches);if(found.length===1)selectModel(found[0].id);}});
  $('#clearsearch').onclick=()=>{$('#modelsearch').value='';limit=12;render();$('#modelsearch').focus();};
  $('#resetfilters').onclick=()=>setFilter('all');
  $('#series-filter').onchange=$('#modelsort').onchange=()=>{limit=12;render();};
  $('#load-more').onclick=()=>{const previous=limit;limit+=12;render();$('#models').children[previous]?.querySelector('a')?.focus({preventScroll:true});};
  $('#open-comparison').onclick=openComparison;
  $('#clear-comparison').onclick=()=>{comparison.clear();save('apex-comparison',comparison);render();};
  window.addEventListener('apex:languagechange',render);
  window.addEventListener('storage',event=>{if(event.key==='apex-favorites'){favorites.clear();stored('apex-favorites').filter(id=>catalog.some(m=>m.id===id)).forEach(x=>favorites.add(x));render();}if(event.key==='apex-comparison'){comparison.clear();stored('apex-comparison').filter(id=>catalog.some(m=>m.id===id)).slice(0,3).forEach(id=>comparison.add(id));render();}});
  $('#browse3d span').textContent=Object.keys(threeModels).length;
  $('#browse3d').hidden=electricPage;
  $('#browse3d').onclick=()=>setFilter('3d');
  const initial=new URLSearchParams(location.search).get('collection');
  if(initial&&filters.some(([id])=>id===initial))active=initial;
  render();
  if(initial&&!document.body.dataset.page)requestAnimationFrame(()=>$('#collection').scrollIntoView({block:'start'}));
  document.querySelectorAll('[data-model-total]').forEach(el=>el.textContent=models.length);
  document.querySelectorAll('[data-m-total]').forEach(el=>el.textContent=models.filter(isM).length);
  return {render,setFilter};
}
