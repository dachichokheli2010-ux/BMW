import {t} from './preferences.js';
import {generationGuideSources} from './generation-guide-sources.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function generationCode(model) {
  return /^[EFGIU]\d{1,2}(?:\/\d)?/i.exec(model.generation.split(' / ').at(-1).trim())?.[0].toUpperCase()||null;
}

export function groupGenerationModels(catalog) {
  const groups=new Map();
  for(const model of catalog){
    const code=generationCode(model);
    if(!code)continue;
    if(!groups.has(code))groups.set(code,[]);
    groups.get(code).push(model);
  }
  return [...groups].map(([code,models])=>({code,models})).sort((a,b)=>a.code.localeCompare(b.code,undefined,{numeric:true}));
}

function modelSources(model) {
  const candidates=[...(model.verified?.sources||[]),...(model.source?[{url:model.source}]:[])];
  return [...new Map(candidates.map(source=>[typeof source==='string'?source:source.url,source])).values()].filter(source=>typeof source==='string'?/^https:\/\//.test(source):/^https:\/\//.test(source.url||''));
}

function sourceLink(source,label,ariaLabel) {
  const url=typeof source==='string'?source:source.url;
  return `<a class="guide-source-link" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(ariaLabel)}">${esc(label)} ↗</a>`;
}

function renderSources(items) {
  return items.map(item=>`<li><p>${esc(t(item.claim))}</p>${sourceLink(item.source,item.source.label,t('Source for: {claim}',{claim:t(item.claim)}))}</li>`).join('');
}

function renderCatalog(container,groups) {
  container.innerHTML=`<div class="generation-guide-index">
    <p class="generation-guide-disclosure">${esc(t('APEX collection examples are not a complete production or market list. Engine and model details link to their factory sources.'))}</p>
    <label class="generation-guide-search">${esc(t('Search chassis, model or engine'))}<input type="search" data-guide-search placeholder="${esc(t('Try E46, M3 or S54'))}" autocomplete="off"></label>
    <p class="generation-guide-count" role="status" aria-live="polite"></p>
    <div class="generation-guide-grid" data-guide-grid>${groups.map(group=>`<a class="generation-guide-card" data-guide-card data-search="${esc([group.code,...group.models.flatMap(model=>[model.name,model.code])].join(' ').toLowerCase())}" href="/generation-guides?chassis=${encodeURIComponent(group.code)}"><span class="eyebrow">${esc(t('BMW GENERATION'))}</span><strong>${esc(group.code)}</strong><span>${esc(t('{count} catalog examples',{count:group.models.length}))}</span><span class="generation-guide-card-arrow" aria-hidden="true">↗</span></a>`).join('')}</div>
    <p class="generation-guide-empty" data-guide-empty hidden>${esc(t('No matching generations. Try a chassis or engine code.'))}</p>
  </div>`;
  const input=container.querySelector('[data-guide-search]'),cards=[...container.querySelectorAll('[data-guide-card]')],count=container.querySelector('.generation-guide-count'),empty=container.querySelector('[data-guide-empty]');
  const update=()=>{const query=input.value.trim().toLocaleLowerCase();let visible=0;for(const card of cards){card.hidden=!!query&&!card.dataset.search.includes(query);if(!card.hidden)visible++;}count.textContent=t('Showing {count} generations',{count:visible});empty.hidden=visible!==0;};
  input.addEventListener('input',update);
  update();
}

function renderGuide(container,group,groups) {
  const codes=[...new Set(group.models.map(model=>model.code))];
  const modelCards=group.models.map(model=>{
    const sources=modelSources(model);
    const modelHref='/models?model='+encodeURIComponent(model.id);
    return `<article class="generation-model-card"><div><a class="generation-model-name" href="${modelHref}">${esc(model.name)}</a><p>${esc(model.generation)} · ${esc(model.code)}</p></div><div class="generation-model-sources">${sources.map(source=>sourceLink(source,typeof source==='string'?t('Factory source'):source.label||source.title||t('Factory source'),t('Factory source for {model}',{model:model.name}))).join('')}</div></article>`;
  }).join('');
  const references=(key)=>renderSources(generationGuideSources[key]);
  container.innerHTML=`<article class="generation-guide-detail">
    <a class="generation-guide-back" href="/generation-guides">← ${esc(t('All buyer guides'))}</a>
    <header class="generation-guide-detail-heading"><span class="eyebrow">${esc(t('BMW GENERATION BUYER GUIDE'))}</span><h2>${esc(group.code)}</h2><p>${esc(t('A source-linked starting point for researching this generation.'))}</p></header>
    <div class="generation-guide-sections">
      <section class="generation-guide-section"><span class="eyebrow">01 / ${esc(t('OVERVIEW'))}</span><h3>${esc(t('Catalog overview'))}</h3><p>${esc(t('This page groups the models currently represented in APEX under this chassis code. It does not claim to list every engine, trim, year or market variant.'))}</p><div class="generation-guide-models">${modelCards}</div></section>
      <section class="generation-guide-section"><span class="eyebrow">02 / ${esc(t('ENGINES'))}</span><h3>${esc(t('Engines represented in this catalog'))}</h3><p class="generation-guide-engine-codes">${codes.map(code=>`<span>${esc(code)}</span>`).join('')}</p><p>${esc(t('These engine codes are only the sourced examples linked above, not a complete list of engines offered for this generation.'))}</p></section>
      <section class="generation-guide-section"><span class="eyebrow">03 / ${esc(t('RESEARCH STATUS'))}</span><h3>${esc(t('Known issues'))}</h3><p class="guide-unavailable">${esc(t('Not available: no generation-specific issue claims are included without a verified source.'))}</p></section>
      <section class="generation-guide-section"><span class="eyebrow">04 / ${esc(t('BEFORE YOU BUY'))}</span><h3>${esc(t('Pre-purchase checks'))}</h3><ul class="generation-guide-checks">${references('prePurchase')}</ul></section>
      <section class="generation-guide-section"><span class="eyebrow">05 / ${esc(t('MAINTENANCE'))}</span><h3>${esc(t('Typical maintenance items'))}</h3><p class="guide-unavailable">${esc(t('Not available: consult the service schedule for the exact vehicle, market and VIN.'))}</p></section>
      <section class="generation-guide-section generation-georgia-section"><span class="eyebrow">06 / ${esc(t('GEORGIA BUYER NOTES'))}</span><h3>${esc(t('If you are buying in Georgia'))}</h3><div class="generation-guide-import-grid"><article><h4>${esc(t('Cars imported from the US'))}</h4><ul class="generation-guide-checks">${references('georgiaUS')}</ul></article><article><h4>${esc(t('Cars imported from Europe'))}</h4><ul class="generation-guide-checks">${references('georgiaEurope')}</ul></article></div><h4>${esc(t('Clearance and inspection in Georgia'))}</h4><ul class="generation-guide-checks">${references('georgiaImport')}</ul></section>
    </div>
    <nav class="generation-guide-neighbors" aria-label="${esc(t('Other generation guides'))}"><span>${esc(t('Explore another chassis'))}</span>${groups.filter(item=>item.code!==group.code).slice(0,8).map(item=>`<a href="/generation-guides?chassis=${encodeURIComponent(item.code)}">${esc(item.code)}</a>`).join('')}<a href="/generation-guides">${esc(t('Browse all'))}</a></nav>
  </article>`;
}

export function mountGenerationGuides(container,{catalog}) {
  const groups=groupGenerationModels(catalog);
  const selected=new URLSearchParams(location.search).get('chassis')?.toUpperCase();
  const group=groups.find(item=>item.code===selected);
  if(group){
    renderGuide(container,group,groups);
    const updateTitle=()=>{document.title=t('BMW {chassis} buyer guide · APEX',{chassis:group.code});};
    updateTitle();
    window.addEventListener('apex:languagechange',updateTitle);
  }
  else{renderCatalog(container,groups);if(selected)container.insertAdjacentHTML('afterbegin',`<p class="generation-guide-not-found" role="status">${esc(t('No catalog generation matches {chassis}.',{chassis:selected}))}</p>`);}
  return {groups:groups.length};
}
