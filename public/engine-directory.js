import {engineRecords,getEngineRecord,engineURL,carURL} from './explorer-data.js';
import {responsivePhotoAttributes,photoBlurStyle} from './responsive-photos.js';
import {registerEngineLabTranslations} from './engine-lab-translations.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const rootAsset=value=>'/'+value.replace(/^\//,'');
const kindLabels={petrol:'Petrol',m:'M engines',hybrid:'Hybrid systems',electric:'Electric drive'};
export const ENGINE_LAYOUTS=Object.freeze({all:'Every layout','inline-three':'Inline-three','inline-four':'Inline-four','inline-six':'Inline-six',v8:'V8',v10:'V10',v12:'V12',electric:'Electric drive'});
const fieldText=field=>field?.value==null?'Not yet verified':Array.isArray(field.value)?[...new Set(field.value.map(item=>String(item.value)+(item.unit?' '+item.unit:'')))].join(' / '):String(field.value)+(field.unit?' '+field.unit:'');
export function engineLayoutKey(record){
  if(record.kind==='electric')return 'electric';
  const value=fieldText(record.fields.find(field=>field.id==='engineLayout')).toLowerCase();
  return Object.keys(ENGINE_LAYOUTS).find(key=>key!=='all'&&value.includes(key))||'unknown';
}
const normalized=value=>String(value).toLowerCase().replace(/\b(?:straight|inline)[-\s]?(?:six|6)\b/g,'inline six').replace(/\b(?:straight|inline)[-\s]?(?:four|4)\b/g,'inline four').replace(/\bv[-\s]?(8|10|12)\b/g,'v$1').replace(/[-–]/g,' ');
const icon='<svg viewBox="0 0 64 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 12h30l8 9v20H15L8 32V20h7zM24 12V5h14v7M53 24h6v12h-6M4 22v10M3 27h5"/><path d="m35 18-9 12h9l-7 11"/></svg>';
const placeholder=(label='Engine photo being researched')=>`<div class="ed-photo-placeholder">${icon}<span>${esc(label)}</span></div>`;
const photoHTML=(record,{large=false}={})=>{
  const photo=record.photos[0];
  if(!photo)return placeholder(record.kind==='electric'?'Drive-unit photo being researched':'Engine photo being researched');
  return `<img src="${esc(rootAsset(photo.src))}" alt="${esc(record.code+' engine, '+photo.caption)}" ${responsivePhotoAttributes(photo,large?'(max-width: 760px) 90vw, 48vw':'(max-width: 600px) 90vw, 32vw').replace(/images\//g,'/images/')} style="${photoBlurStyle(photo.src)}" loading="lazy" decoding="async">`;
};

function card(record,selected=[]){
  const layoutText=ENGINE_LAYOUTS[engineLayoutKey(record)]||'Layout under review',checked=selected.includes(record.id);
  return `<article class="ed-card-shell"><a class="ed-card" href="${engineURL(record)}"><div class="ed-card-photo">${photoHTML(record)}<span class="ed-kind">${esc(kindLabels[record.kind])}</span></div><div class="ed-card-body"><span class="eyebrow">${esc(layoutText)}</span><h2>${esc(record.code)}<span aria-hidden="true">↗</span></h2><p>${esc(record.tagline)}</p><small>${record.applications.length} ${record.applications.length===1?'car':'cars'} to explore</small></div></a><button type="button" class="ed-compare-toggle" data-ed-compare="${esc(record.id)}" aria-pressed="${checked}" ${!checked&&selected.length===2?'disabled':''}>${checked?'✓ Added to comparison':'＋ Compare '+esc(record.code)}</button></article>`;
}

export function searchEngines(query='',kind='all',layout='all'){
  const tokens=normalized(query).trim().split(/\s+/).filter(Boolean);
  return engineRecords.filter(record=>(kind==='all'||record.kind===kind)&&(layout==='all'||engineLayoutKey(record)===layout)&&tokens.every(token=>normalized([record.code,record.name,record.tagline,record.kind,...record.searchTerms,...record.applications.flatMap(model=>[model.name,model.generation])].join(' ')).includes(token)));
}

function fieldValue(field){
  if(field.value===null)return `<span class="ed-unavailable">${field.status==='not-applicable'?'Not applicable':'Not yet verified'}</span><p>${esc(field.note)}</p>`;
  if(Array.isArray(field.value)){
    const values=[...new Set(field.value.map(item=>String(item.value)+(item.unit?' '+item.unit:'')))];
    return `<strong>${esc(values.join(' / '))}</strong><p class="ed-application-note">Shown for the retained applications. Each value stays attached to its car and market; family-wide coverage is still being checked.</p>`;
  }
  return `<strong>${esc(field.value)}${field.unit?' '+esc(field.unit):''}</strong><p>${esc(field.note)}</p>`;
}

function beginnerTools(){return `<section class="ed-learning-paths" aria-label="Choose an engine starting point"><div><span class="eyebrow">FOLLOW YOUR CURIOSITY</span><h2>Know the layout. Then the details.</h2><p>A family code is a starting point. Compare the architecture, then open a car for its exact specification.</p></div><div class="ed-topic-buttons" role="group" aria-label="Engine starting points"><button type="button" data-ed-topic="inline-six"><strong>One row. Six cylinders.</strong><span>Explore the straight-six →</span></button><button type="button" data-ed-topic="v8"><strong>Two banks. Eight cylinders.</strong><span>Explore V8 families →</span></button><a href="/engine-lab"><strong>Look inside an engine.</strong><span>Take the guided S63 lab tour ↗</span></a></div></section>`;}

function comparisonHTML(ids){
 const records=ids.map(getEngineRecord).filter(Boolean);
 if(!records.length)return '';
 const rows=[['Powertrain',record=>kindLabels[record.kind]],['Layout',record=>fieldText(record.fields.find(field=>field.id==='engineLayout'))],['Retained displacement values',record=>fieldText(record.fields.find(field=>field.id==='displacement'))],['Induction',record=>fieldText(record.fields.find(field=>field.id==='induction'))],['Car records',record=>record.applications.length+' linked applications']];
 return `<div class="ed-comparison-heading"><div><span class="eyebrow">SIDE BY SIDE · ${records.length}/2 SELECTED</span><h2>Different ways to make it move.</h2><p>Compare architecture here. Output and ownership details remain specific to each car, year and market.</p></div><button type="button" data-ed-clear-compare>Clear comparison</button></div>${records.length===1?'<p class="ed-comparison-hint" role="status">Choose one more engine below to compare two families.</p>':''}<div class="ed-table-wrap" tabindex="0" role="region" aria-label="Engine family comparison; scroll horizontally for all columns"><table><thead><tr><th scope="col">What to compare</th>${records.map(record=>`<th scope="col"><a href="${engineURL(record)}">${esc(record.code)} ↗</a><button type="button" data-ed-compare="${esc(record.id)}" aria-label="Remove ${esc(record.code)} from comparison">Remove</button></th>`).join('')}</tr></thead><tbody>${rows.map(([label,value])=>`<tr><th scope="row">${label}</th>${records.map(record=>`<td>${esc(value(record))}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="ed-compare-scope">Values come from retained car records and may cover different revisions. They do not establish full family ranges. <a href="${engineURL(records[0])}">Open sources and applications ↗</a></p>`;
}

function designHTML(record){
  const character=record.fields.find(field=>field.id==='strengths');
  if(!character?.value)return '';
  return `<section class="ed-design"><div><span class="eyebrow">WHAT TO NOTICE</span><h2>Look beyond the headline number.</h2><p>${esc(character.value)}</p></div>${record.relatedPart?`<a class="ed-primary" href="/parts/${encodeURIComponent(record.relatedPart)}">Explore a connected part <span aria-hidden="true">↗</span></a>`:''}</section>`;
}

function detail(record){
  const photo=record.photos[0],sourceYears=[...new Set(record.applications.map(model=>model.specificationYear).filter(Boolean))].sort((a,b)=>a-b);
  const factFields=record.fields.filter(field=>['engineLayout','displacement','induction','funFact'].includes(field.id));
  return `<div class="engine-directory ed-detail"><a class="ed-back" href="/engines">← All engines</a><section class="ed-detail-intro"><div><span class="eyebrow">${esc(kindLabels[record.kind])} / ENGINE DIRECTORY</span><h1>${esc(record.code)}</h1><h2>${esc(record.tagline)}</h2><p>${esc(record.overview)}</p><a class="ed-primary" href="#engine-applications">Explore its ${record.applications.length} ${record.applications.length===1?'car':'cars'} <span aria-hidden="true">↓</span></a></div><figure><div class="ed-detail-photo">${photoHTML(record,{large:true})}</div><figcaption>${photo?`${esc(photo.caption)}<br><a href="${esc(photo.credit.page)}" target="_blank" rel="noopener noreferrer">${esc(photo.credit.author)} · ${esc(photo.credit.license)}</a>`:esc(record.photoNote)}</figcaption></figure></section><div class="ed-context"><span class="ed-dot" aria-hidden="true"></span><p>One family name can cover different revisions. Output, torque and ownership information belong to a specific car, year and market.</p></div><section class="ed-facts" aria-label="Engine facts">${factFields.map(field=>`<article><span class="eyebrow">${esc(field.label)}</span>${fieldValue(field)}${field.status==='cross-checked'?`<small class="ed-evidence">Checked against two BMW references</small>`:''}</article>`).join('')}</section>${designHTML(record)}<section class="ed-applications" id="engine-applications"><div class="ed-section-heading"><div><span class="eyebrow">FOLLOW THE CONNECTIONS</span><h2>Meet the cars.</h2></div><p>${record.kind==='hybrid'?'Hybrid output below is vehicle-system output unless the car page explicitly identifies engine-only power.':'Factory power units stay attached to the model. PS and mechanical hp are different units.'}</p></div><div class="ed-table-wrap" tabindex="0" role="region" aria-label="Cars using this engine; scroll horizontally for all columns"><table><thead><tr><th scope="col">BMW</th><th scope="col">Generation</th><th scope="col">Factory output</th><th scope="col">Source context</th></tr></thead><tbody>${record.applications.map(model=>`<tr><th scope="row"><a href="${carURL(model.id)}">${esc(model.name)} <span aria-hidden="true">↗</span></a></th><td>${esc(model.generation)}</td><td>${esc(model.power)} ${esc(model.powerUnit)}</td><td>${esc(model.market)}<br><a href="${esc(model.source)}" target="_blank" rel="noopener noreferrer">Factory reference</a></td></tr>`).join('')}</tbody></table></div></section><section class="ed-research"><details><summary>Production years and ownership research</summary><p>Represented vehicle specification years: ${sourceYears.length?sourceYears.join(', '):'not recorded'}. These do not establish the engine’s full production dates.</p>${record.fields.filter(field=>['strengths','weaknesses'].includes(field.id)).map(field=>`<h3>${esc(field.label)}</h3><p>${esc(field.note)}</p>`).join('')}<p>Open the exact car record before using a family-level description to guide an ownership decision.</p></details><details><summary>Sources and evidence</summary><p>“Checked against two BMW references” means two documents, both from BMW. Other inherited catalogue values remain reference-linked pending a datum-level cross-check.</p><ol>${record.sources.map(item=>`<li><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.title||'Factory reference')}</a>${item.locator?`<small>${esc(item.locator)}</small>`:''}</li>`).join('')}</ol></details></section><section class="ed-next"><span class="eyebrow">KEEP YOUR CURIOSITY RUNNING</span><h2>What makes it work?</h2><p>See the parts behind the power, or explore another engine family.</p><div><a class="ed-primary" href="/parts">Explore car parts ↗</a><a href="/engines">Another engine →</a><a href="/learn">Learn the basics →</a></div></section></div>`;
}

export function renderEngineDirectoryPage(id=null){
  registerEngineLabTranslations();
  if(id){
    const record=getEngineRecord(id);
    return record?detail(record):`<div class="engine-directory ed-empty"><span class="eyebrow">ENGINE NOT FOUND</span><h1>Let’s find another engine.</h1><p>This engine code is not in the researched directory yet.</p><a class="ed-primary" href="/engines">Browse all engines →</a></div>`;
  }
  const markup = `<section class="engine-directory" aria-labelledby="ed-title"><div class="ed-heading"><div><span class="eyebrow">THE HEART OF EVERY BMW</span><h1 id="ed-title">Different engines.<br><span>Same curiosity.</span></h1><p>Never opened a bonnet? Start with a family. Meet its cars, understand the layout and follow the engineering.</p></div><div class="ed-heading-stat"><strong>${engineRecords.length}</strong><span>engine & drive-system entries</span></div></div><div class="ed-starter"><span class="ed-starter-icon" aria-hidden="true">6</span><div><strong>Start with the straight-six.</strong><p>Six cylinders in one row. One of BMW’s most familiar engine layouts.</p></div><a href="/engines/b58">Meet the B58 <span aria-hidden="true">↗</span></a></div><div class="ed-toolbar"><label class="ed-search"><span class="sr-only">Search engines or cars</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><input data-ed-search type="search" placeholder="Try B58, V8, M3 or E46…" autocomplete="off"><button data-ed-clear type="button" hidden>Clear</button></label><label class="ed-select"><span class="sr-only">Engine type</span><select data-ed-kind><option value="all">Every powertrain</option>${Object.entries(kindLabels).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></label></div><p class="ed-count" data-ed-count role="status">${engineRecords.length} entries · Explore a family below</p><div class="ed-grid" data-ed-grid>${engineRecords.map(record=>card(record)).join('')}</div><div class="ed-empty" data-ed-empty hidden><h2>No engines found yet.</h2><p>Try a family code such as B58, or a car name such as M3.</p><button type="button" data-ed-reset>Show every engine</button></div><p class="ed-footnote">A growing index of the retained catalogue. eDrive covers multiple electric systems. Missing photography and unverified facts stay labelled while research continues.</p></section>`;
  return markup.replace(/<div class="ed-starter">[\s\S]*?<div class="ed-toolbar">/, '<div class="ed-toolbar">').replace('</select></label></div><p class="ed-count"', '</select></label><label class="ed-select"><span class="sr-only">Cylinder layout</span><select data-ed-layout>'+Object.entries(ENGINE_LAYOUTS).map(([value,label])=>'<option value="'+value+'">'+label+'</option>').join('')+'</select></label></div>'+beginnerTools()+'<section class="ed-compare" data-ed-compare-panel aria-label="Engine family comparison" hidden></section><p class="ed-count"');
}

export function mountEngineDirectory(container,{id=null}={}){
  if(!container)return ()=>{};
  container.innerHTML=renderEngineDirectoryPage(id);
  const controller=new AbortController(),options={signal:controller.signal};
  container.addEventListener('error',event=>{
    if(event.target instanceof HTMLImageElement&&event.target.closest('.engine-directory'))event.target.outerHTML=placeholder('Photograph unavailable');
  },{capture:true,...options});
  const cleanup=()=>controller.abort();cleanup.destroy=cleanup;
  if(id)return cleanup;
  const input=container.querySelector('[data-ed-search]'),select=container.querySelector('[data-ed-kind]'),layout=container.querySelector('[data-ed-layout]'),clear=container.querySelector('[data-ed-clear]');
  let selected=[];
  const update=()=>{
    const records=searchEngines(input.value,select.value||'all',layout.value||'all');
    container.querySelector('[data-ed-grid]').innerHTML=records.map(record=>card(record,selected)).join('');
    container.querySelector('[data-ed-count]').textContent=records.length+' '+(records.length===1?'entry':'entries')+(input.value?' matching “'+input.value+'”':' · Explore a family below');
    container.querySelector('[data-ed-empty]').hidden=records.length>0;clear.hidden=!input.value;
    const panel=container.querySelector('[data-ed-compare-panel]');panel.hidden=selected.length===0;panel.innerHTML=comparisonHTML(selected);
    for(const button of container.querySelectorAll('[data-ed-topic]'))button.setAttribute('aria-pressed',String(button.dataset.edTopic===layout.value));
  };
  input.addEventListener('input',update,options);select.addEventListener('change',update,options);layout.addEventListener('change',update,options);
  clear.addEventListener('click',()=>{input.value='';update();input.focus();},options);
  container.querySelector('[data-ed-reset]').addEventListener('click',()=>{input.value='';select.value='all';layout.value='all';update();input.focus();},options);
  container.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||button.disabled)return;
    if(button.dataset.edTopic){input.value='';select.value='all';layout.value=button.dataset.edTopic;update();input.focus();}
    if(button.dataset.edCompare){const id=button.dataset.edCompare;if(selected.includes(id))selected=selected.filter(value=>value!==id);else if(selected.length<2&&getEngineRecord(id))selected.push(id);update();const next=container.querySelector(`[data-ed-grid] [data-ed-compare="${id}"]`)||container.querySelector('[data-ed-clear-compare]');next?.focus({preventScroll:true});}
    if(button.hasAttribute('data-ed-clear-compare')){selected=[];update();input.focus();}
  },options);
  return cleanup;
}
