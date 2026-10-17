const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const topics = [
  ['combustion', 'How a combustion engine works', 'Pistons crankshaft valves four stroke cycle fuel ignition', 'academy'],
  ['turbocharging', 'How turbochargers work', 'Single twin twin-scroll variable geometry VGT turbo boost intercooler B58 N54 N55', 'academy'],
  ['transmission', 'Transmissions and gear ratios', 'Gearbox automatic manual DCT dual clutch drivetrain', 'academy'],
  ['engine-codes', 'BMW engine code explorer', 'S63 B58 N54 N55 S58 engine codes N54 vs N55', 'academy'],
  ['cooling', 'BMW cooling systems', 'Coolant radiator pump thermostat intercooler heat', 'academy'],
  ['suspension', 'Suspension and handling', 'Dampers springs wheels suspension alignment', 'academy'],
  ['electronics', 'Electronic engine control', 'ECU DME sensors fuel boost knock control', 'academy'],
  ['electrification', 'Hybrid and electric powertrains', 'EV battery inverter motor hybrid electric', 'academy'],
  ['engine-lab', 'F10 M5 · S63 engine explorer', '3D S63TU S63B44T0 V8 engine exploded X-ray intake exhaust oil fuel coolant parts', 'engineering'],
  ['tuning-garage', 'Tuning garage & simulated dashboard', 'Dyno ECU tuning turbo intercooler intake exhaust suspension brakes power torque RPM', 'engineering'],
  ['mechanic', 'Virtual mechanic', 'Diagnostics component identification quiz mechanic fault boost', 'engineering'],
  ['history', 'BMW history timeline', 'History heritage 1916 1923 1928 1972 2013 BMW Motorsport', 'engineering']
];

export function createSearchIndex(catalog, parts) {
  return [
    ...catalog.map(m => ({id:m.id, category:'Vehicles', title:m.name + ' · ' + m.generation.split(' / ').at(-1).trim(), subtitle:m.code + ' · ' + m.power + ' ' + m.powerUnit + ' · ' + m.market, keywords:[m.id,m.name,m.generation,m.code,m.body,m.layout,m.description].join(' '), image:m.car})),
    ...parts.map((p, index) => ({id:p.id, index, category:'Components', title:p.name, subtitle:p.system + ' · ' + p.summary, keywords:[p.name,p.system,p.summary,p.purpose,p.how,...p.connections.map(c=>c.name)].join(' '), image:p.photo?.src})),
    ...topics.map(([id,title,keywords,kind])=>({id,category:kind==='academy'?'Lessons':'Engineering',title,keywords,subtitle:kind==='academy'?'Academy · interactive lesson':'Interactive educational workspace'}))
  ].map(record => ({...record, text:normalize(record.title+' '+record.keywords)}));
}

export function searchIndex(index, query, category='All') {
  const stop = new Set(['what','does','do','is','an','a','the','how','works','work','of','vs','versus','and','bmw']);
  const terms=normalize(query).replace(/[^\p{L}\p{N}-]+/gu,' ').split(/\s+/).filter(x=>x&&!stop.has(x));
  if(!terms.length) return index.filter(r=>category==='All'||r.category===category).slice(0,12);
  return index.filter(r=>category==='All'||r.category===category).map(r=>{
    const matches=terms.filter(term=>r.text.includes(term));
    if(!matches.length || (matches.length < terms.length && !/\b(?:vs|versus)\b/i.test(query)))return null;
    return {...r,score:matches.length*10+terms.filter(term=>normalize(r.title).includes(term)).length*8+(normalize(r.title).includes(normalize(query))?20:0)};
  }).filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,24);
}

export function comparisonFromQuery(catalog, query) {
  const sides=normalize(query).split(/\b(?:vs|versus)\b/);
  if(sides.length!==2)return [];
  const selected=[];
  for(const side of sides){
    const terms=side.replace(/[^\p{L}\p{N}-]+/gu,' ').split(/\s+/).filter(term=>term&&term!=='bmw');
    if(!terms.length)return [];
    const match=catalog.find(m=>!selected.includes(m.id)&&terms.every(term=>normalize(m.code+' '+m.name+' '+m.id+' '+m.generation).includes(term)));
    if(!match)return [];selected.push(match.id);
  }
  return selected;
}

export function mountSmartSearch({catalog,parts,onModel,onPart,onTopic,onCompare}) {
  const index=createSearchIndex(catalog,parts), abort=new AbortController();
  const modal=document.createElement('dialog');modal.className='global-search';modal.setAttribute('aria-label','Search APEX');
  modal.innerHTML=`<div class="gs-top"><span class="eyebrow">SEARCH THE ENTIRE GARAGE</span><button type="button" data-gs-close aria-label="Close search">Esc <span>×</span></button></div><div class="gs-input-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg><label class="sr-only" for="global-query">Search vehicles, components and lessons</label><input id="global-query" type="search" placeholder="Try F10 M5, S63, or how turbos work…" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="global-results"></div><div class="gs-filters" role="group" aria-label="Search category">${['All','Vehicles','Components','Lessons','Engineering'].map(c=>`<button type="button" data-gs-category="${c}" aria-pressed="${c==='All'}">${c}</button>`).join('')}</div><p class="gs-status" role="status"></p><div id="global-results" role="listbox" aria-label="Search suggestions"></div><div class="gs-footer"><span>↑ ↓ to navigate · Enter to open</span><span>Factory data. Clear context.</span></div>`;
  document.body.append(modal);
  const input=modal.querySelector('input'), list=modal.querySelector('#global-results');let category='All', selected=-1, results=[];
  function select(i){selected=i;list.querySelectorAll('[role=option]').forEach((el,j)=>{el.setAttribute('aria-selected',String(j===i));if(j===i){input.setAttribute('aria-activedescendant',el.id);el.scrollIntoView({block:'nearest'});}});if(i<0)input.removeAttribute('aria-activedescendant');}
  function render(){
    results=searchIndex(index,input.value,category);select(-1);
    const q=input.value.trim(),compare=comparisonFromQuery(catalog,q).map(id=>catalog.find(m=>m.id===id));
    modal.querySelector('.gs-status').textContent=q?`${results.length} results${category==='All'?'':' in '+category.toLowerCase()}`:'Start with a model, engine code, component or question.';
    list.innerHTML=(compare.length===2?`<button class="gs-compare" type="button" data-gs-compare>Compare ${escapeHTML(compare.map(m=>m.name+' '+m.generation.split(' / ').at(-1)).join(' & '))} →</button>`:'')+(results.length?results.map((r,i)=>`<button class="gs-result" id="gs-result-${i}" role="option" aria-selected="false" data-gs-result="${i}" tabindex="-1">${r.image?`<img src="${escapeHTML(r.image)}" alt="" loading="lazy">`:'<span class="gs-topic-icon" aria-hidden="true">↗</span>'}<span><small>${r.category}</small><strong>${escapeHTML(r.title)}</strong><span>${escapeHTML(r.subtitle)}</span></span><span aria-hidden="true">↗</span></button>`).join(''):'<div class="gs-empty"><strong>No matching results.</strong><p>Try an engine code such as B58, a chassis such as F10, or a part such as intercooler.</p></div>');
    modal.querySelector('[data-gs-compare]')?.addEventListener('click',()=>{modal.close();onCompare(compare.map(m=>m.id));});
  }
  function activate(i){const r=results[i];if(!r)return;modal.close();if(r.category==='Vehicles')onModel(r.id);else if(r.category==='Components')onPart(r.index);else onTopic(r.id);}
  function open(query=''){category='All';input.value=query;modal.querySelectorAll('[data-gs-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.gsCategory==='All')));render();if(!modal.open)modal.showModal();input.focus();}
  input.addEventListener('input',render);input.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();select(Math.max(0,Math.min(results.length-1,selected+(e.key==='ArrowDown'?1:-1))));}if(e.key==='Enter'){e.preventDefault();activate(selected<0?0:selected);}});
  modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-gs-close]'))modal.close();const b=e.target.closest('[data-gs-result]');if(b)activate(+b.dataset.gsResult);const filter=e.target.closest('[data-gs-category]');if(filter){category=filter.dataset.gsCategory;modal.querySelectorAll('[data-gs-category]').forEach(b=>b.setAttribute('aria-pressed',String(b===filter)));render();input.focus();}});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(modal.open)modal.close();else open();}},{signal:abort.signal});
  document.querySelectorAll('[data-global-search]').forEach(b=>b.addEventListener('click',()=>open(),{signal:abort.signal}));
  return {open,destroy(){abort.abort();modal.remove();}};
}
