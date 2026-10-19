import {engineRecords,engineURL} from './explorer-data.js';
const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categories = ['All', 'Vehicles', 'Components', 'Lessons', 'Engineering', 'Community'];
const recentStorageKey = 'apex-search-recent-v1';
const maxQueryLength = 160, maxRecent = 6;
const stopWords = new Set('what which does do did is are was were an a the how why of and or bmw me my tell about explain find show please can you i want learn understand works work used use need function purpose specs spec specifications details information info photo for in on to with it its vs versus compare comparison between car cars vehicle vehicles system systems'.split(' '));
const aliases = {
  turbos:'turbocharger', turbo:'turbocharger', turbochargers:'turbocharger',
  intercoolers:'intercooler', gearbox:'transmission', gearboxes:'transmission', transmissions:'transmission',
  dampers:'damper', shocks:'damper', springs:'spring', brakes:'brake', braking:'brake',
  clutches:'clutch', pistons:'piston', valves:'valve', sensors:'sensor', injectors:'injector',
  engines:'engine', motors:'motor', hybrids:'hybrid', electrics:'electric', ev:'electric', bev:'electric',
  gasoline:'petrol', gas:'petrol', ecm:'ecu', dme:'ecu', diagnostics:'diagnostic',
  batteries:'battery', tyres:'tire', tires:'tire', tyre:'tire', wheels:'wheel',
  photos:'photo', photographs:'photo', pictures:'photo',
  tutorials:'lesson', lessons:'lesson', histories:'history', historic:'history',
};
const topics = [
  ['starter-kit', 'Find my BMW & name decoder', 'beginner start here family BMW cheap affordable budget finder name decoder M340i xDrive eDrive comfy sporty', 'engineering'],
  ['play-arcade', 'APEX games & daily challenge', 'arcade games daily quiz badges XP sprint survival memory timeline versus flashcards', 'engineering'],
  ['glossary', 'Automotive glossary', 'Glossary definitions terminology VANOS Valvetronic xDrive DCT torque horsepower ტერმინები ლექსიკონი словарь термины', 'academy'],
  ['m-recognition', 'BMW M photo challenges', 'BMW M recognition identify photo quiz M2 M3 M4 M5 M6 M8 generation chassis თამაში ფოტო викторина', 'academy'],
  ['academy-practice', 'Automotive puzzles', 'Puzzles matching sequence components quick practice quiz თავსატეხები задачи практика', 'academy'],
  ['combustion', 'How a combustion engine works', 'Pistons crankshaft valves four stroke cycle fuel ignition internal combustion ICE engine fundamentals', 'academy'],
  ['turbocharging', 'How turbochargers work', 'Single twin twin-scroll variable geometry VGT turbo boost intercooler B58 N54 N55 turbo lag forced induction', 'academy'],
  ['transmission', 'Transmissions and gear ratios', 'Gearbox automatic manual DCT dual clutch drivetrain torque converter gears', 'academy'],
  ['engine-codes', 'BMW engine code explorer', 'S63 B58 N54 N55 engine codes N54 vs N55 identification decode engine family', 'academy'],
  ['cooling', 'BMW cooling systems', 'Engine coolant radiator pump thermostat intercooler heat thermal water cooling', 'academy'],
  ['suspension', 'Suspension and handling', 'Dampers springs wheels suspension alignment shock absorber chassis ride', 'academy'],
  ['electronics', 'Electronic engine control', 'ECU DME sensors fuel boost knock control electronic control unit engine computer stability ABS', 'academy'],
  ['electrification', 'Hybrid and electric powertrains', 'EV BEV PHEV battery inverter motor hybrid electric regenerative braking charging electricity', 'academy'],
  ['engine-lab', 'F10 M5 · S63 engine explorer', '3D S63TU S63B44T0 V8 engine exploded X-ray intake exhaust oil fuel coolant parts under hood', 'engineering'],
  ['tuning-garage', 'Tuning garage & simulated dashboard', 'Dyno ECU tuning turbo intercooler intake exhaust suspension brakes power torque RPM build upgrades modify modification horsepower stage', 'engineering'],
  ['mechanic', 'Virtual mechanic', 'Diagnostic component identification quiz mechanic fault boost troubleshooting parts workshop identify', 'engineering'],
  ['history', 'BMW history timeline', 'History heritage 1916 1923 1928 1972 2013 BMW Motorsport origins founded', 'engineering'],
  ['owner-community', 'Owner community', 'Personal cars real owners approved submissions public garages community', 'community'],
  ['community-friends', 'Friends & shared garages', 'Friends friendship requests sharing share garage saved BMWs public profile', 'community'],
  ['submit-owner-car', 'Submit your BMW', 'Upload personal car photos owner vehicle information review approval credits submission', 'community']
];

// Search aliases change vocabulary, never catalog names, codes or specifications.
function searchText(value) {
  return normalize(value)
    .replace(/\b([efgu]\d{2})(m\d(?:\d{2}i?)?)\b/g, '$1 $2')
    .replace(/([a-z]\d{2})vs(?=[a-z]\d{2})/g, '$1 vs ')
    .replace(/\bcharge[\s-]+air[\s-]+cool(?:er|ers|ing)\b/g, 'intercooler')
    .replace(/\bshock[\s-]+absorbers?\b/g, 'damper')
    .replace(/\b(?:electronic|engine)[\s-]+control[\s-]+unit\b/g, 'ecu')
    .replace(/\b(?:battery[\s-]+electric|all[\s-]+electric)\b/g, 'electric')
    .replace(/\bice\b/g, 'combustion')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim().split(/\s+/).filter(Boolean).map(token => aliases[token] || token).join(' ');
}
const tokensFor = value => [...new Set(searchText(value).split(' ').filter(Boolean))];
const queryTerms = value => tokensFor(value).filter(token => !stopWords.has(token));
const cleanQuery = value => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, maxQueryLength);
function metadata(record) {
  return record.searchFields || {
    title:tokensFor(record.title), identity:tokensFor(record.identity || record.id),
    body:tokensFor(record.keywords || record.text), phrase:searchText(record.title),
  };
}
function makeRecord(record) {
  return {...record, text:normalize(record.title + ' ' + record.keywords), searchFields:metadata(record)};
}
const generationLabel = model => String(model.generation || '').split(' / ').at(-1).trim();

export function createSearchIndex(catalog = [], parts = []) {
  const vehicles = catalog.map(model => makeRecord({
    id:model.id, category:'Vehicles', title:[model.name,generationLabel(model)].filter(Boolean).join(' · '),
    subtitle:[model.code,model.power != null ? [model.power,model.powerUnit].filter(Boolean).join(' ') : '',model.market].filter(Boolean).join(' · '),
    identity:[model.id,model.name,model.generation,model.code].filter(Boolean).join(' '),
    keywords:[model.id,model.name,model.generation,model.code,model.body,model.layout,model.description,model.powertrain,model.transmission,model.productionYears,model.years,Number(model.power)>=400?'fast sporty performance':'',/touring|\bx[1357]\b/i.test(model.name)?'family practical':''].filter(Boolean).join(' '),
    image:model.car,
  }));
  const components = parts.map((part,index) => makeRecord({
    id:part.id, index, category:'Components', title:part.name,
    subtitle:[part.system,part.summary].filter(Boolean).join(' · '), identity:[part.id,part.name].filter(Boolean).join(' '),
    keywords:[part.name,part.system,part.summary,part.purpose,part.how,...(part.connections || []).map(connection => connection.name)].filter(Boolean).join(' '),
    image:part.photo?.src,
  }));
  const engines=engineRecords.map(engine=>makeRecord({id:'directory-engine-'+engine.id,category:'Engineering',title:engine.code+' engine family',identity:engine.code,keywords:[engine.name,engine.tagline,...engine.searchTerms].join(' '),subtitle:engine.applications.length+' catalog applications · engine directory',href:engineURL(engine)}));
  return [...vehicles,...components,...engines,...topics.map(([id,title,keywords,kind]) => makeRecord({
    id, category:kind === 'academy' ? 'Lessons' : kind === 'community' ? 'Community' : 'Engineering', title, identity:id, keywords,
    subtitle:kind === 'academy' ? 'Academy · interactive lesson' : kind === 'community' ? 'Your place in the APEX community' : 'Interactive educational workspace',
  }))];
}

function tokenMatch(tokens, term) {
  if (tokens.includes(term)) return 2;
  // Family prefixes may match full engine codes. Short identifiers need a whole
  // token so an M5 search cannot accidentally match M50 or M550i.
  return term.length >= 3 && tokens.some(token => token.startsWith(term)) ? 1 : 0;
}
function matchScore(record, terms) {
  const fields = metadata(record);
  let score = 0, matched = 0;
  for (const term of terms) {
    const title=tokenMatch(fields.title,term), identity=tokenMatch(fields.identity,term), body=tokenMatch(fields.body,term);
    if (!title && !identity && !body) continue;
    matched++;score += Math.max(title*38,identity*43,body*15);
  }
  return {score,matched};
}
function comparisonSides(query) {
  const sides=searchText(query).split(/\b(?:vs|versus)\b/);
  return sides.length===2 ? sides.map(queryTerms) : null;
}
function rankedMatches(index, query, category) {
  const terms=queryTerms(query), sides=comparisonSides(query), phrase=searchText(query);
  const question=/\b(?:how|why|explain|learn)\b/i.test(query), componentQuestion=/\bwhat (?:does|is)\b/i.test(query);
  return index.filter(record=>category==='All'||record.category===category).flatMap((record,order)=>{
    const match=matchScore(record,terms), complete=match.matched===terms.length;
    // Ordinary queries require every meaningful word. Comparisons can show a
    // record matching either complete side, rather than unrelated partial hits.
    const sideMatch=sides?.every(side=>side.length) && sides.some(side=>matchScore(record,side).matched===side.length);
    if (!match.matched || (!complete && !sideMatch)) return [];
    const fields=metadata(record);let score=match.score+(complete?90:0);
    if(fields.phrase===phrase)score+=100;
    if(terms.every(term=>tokenMatch(fields.title,term)))score+=60;
    if(terms.some(term=>/\d/.test(term)) && record.category==='Vehicles' && terms.every(term=>tokenMatch(fields.identity,term)))score+=55;
    if(question && record.category==='Lessons')score+=35;
    if(componentQuestion && record.category==='Components')score+=45;
    if(sides && complete && record.id==='engine-codes')score+=100;
    return [{...record,score,matchKind:'exact',order}];
  }).sort((a,b)=>b.score-a.score || a.order-b.order).map(({order,...record})=>record);
}
const vocabularyCache=new WeakMap();
function vocabulary(index) {
  if(vocabularyCache.has(index))return vocabularyCache.get(index);
  const words=new Set();
  for(const record of index)for(const term of [...metadata(record).title,...metadata(record).identity]) {
    if(term.length>=5 && !/\d/.test(term) && !stopWords.has(term))words.add(term);
  }
  for(const word of ['coolant','intercooler','turbocharger','transmission','crankshaft','suspension','combustion','electronic','inverter','diagnostic','thermostat'])words.add(word);
  const result=[...words];vocabularyCache.set(index,result);return result;
}
// Bounded Damerau-Levenshtein permits a minor typo/transposition. Numbers and
// engine/chassis identifiers are never autocorrected into another real model.
function editDistance(left,right,limit) {
  if(Math.abs(left.length-right.length)>limit)return limit+1;
  let previous=Array.from({length:right.length+1},(_,i)=>i),beforePrevious;
  for(let i=1;i<=left.length;i++){
    const current=[i];
    for(let j=1;j<=right.length;j++){
      current[j]=Math.min(previous[j]+1,current[j-1]+1,previous[j-1]+(left[i-1]===right[j-1]?0:1));
      if(i>1 && j>1 && left[i-1]===right[j-2] && left[i-2]===right[j-1])current[j]=Math.min(current[j],beforePrevious[j-2]+1);
    }
    beforePrevious=previous;previous=current;
  }
  return previous[right.length];
}
function relatedMatches(index,query,category) {
  const terms=queryTerms(query);
  if(!terms.length || terms.length>7 || comparisonSides(query))return [];
  const words=vocabulary(index),corrections=[];
  const corrected=terms.map(term=>{
    if(term.length<5 || /\d/.test(term) || index.some(record=>matchScore(record,[term]).matched))return term;
    const limit=term.length>=9?2:1;
    const candidates=words.map(word=>({word,distance:editDistance(term,word,limit)}))
      .filter(candidate=>candidate.distance<=limit).sort((a,b)=>a.distance-b.distance || Math.abs(term.length-a.word.length)-Math.abs(term.length-b.word.length));
    if(!candidates.length)return term;
    // Ambiguous corrections are less useful than a clear empty result.
    if(candidates[1] && candidates[0].distance===candidates[1].distance)return term;
    corrections.push({from:term,to:candidates[0].word});return candidates[0].word;
  });
  if(!corrections.length || corrections.length>2)return [];
  const suggestedQuery=corrected.join(' ');
  const matches=rankedMatches(index,suggestedQuery,category);
  const named=matches.filter(record=>corrected.every(term=>tokenMatch(metadata(record).title,term)||tokenMatch(metadata(record).identity,term)));
  return (named.length?named:matches).slice(0,8).map(record=>({...record,matchKind:'related',suggested:true,suggestedQuery,corrections}));
}

export function searchIndex(index,query,category='All') {
  const cleaned=cleanQuery(query);
  if(!categories.includes(category))return [];
  if(!queryTerms(cleaned).length){
    if(cleaned && !/^(?:bmw|cars?|vehicles?|please|show|find|me|all|\s)+$/i.test(cleaned))return [];
    const featured=['engine-lab','tuning-garage','mechanic','combustion','turbocharging','engine-codes'];
    return index.filter(record=>category==='All'||record.category===category)
      .map((record,order)=>({...record,order,priority:featured.includes(record.id)?featured.indexOf(record.id):featured.length+order}))
      .sort((a,b)=>a.priority-b.priority).slice(0,category==='All'?10:12).map(({order,priority,...record})=>record);
  }
  const exact=rankedMatches(index,cleaned,category);
  return exact.length?exact.slice(0,24):relatedMatches(index,cleaned,category);
}

export function comparisonFromQuery(catalog,query) {
  const sides=comparisonSides(cleanQuery(query));
  if(!sides || sides.some(side=>!side.length))return [];
  if([...sides[0]].sort().join(' ')===[...sides[1]].sort().join(' '))return [];
  const selected=[],vehicles=createSearchIndex(catalog,[]).filter(record=>record.category==='Vehicles');
  for(const side of sides){
    const matches=vehicles.filter(record=>!selected.includes(record.id) && side.every(term=>tokenMatch(metadata(record).identity,term)))
      .map((record,order)=>({record,order,score:matchScore(record,side).score})).sort((a,b)=>b.score-a.score || a.order-b.order);
    if(!matches.length)return [];selected.push(matches[0].record.id);
  }
  return selected;
}

function readRecent() {
  try{
    const stored=JSON.parse(localStorage.getItem(recentStorageKey)||'[]');
    if(!Array.isArray(stored))return [];
    const seen=new Set();
    return stored.filter(value=>{
      if(typeof value!=='string' || !cleanQuery(value))return false;
      const key=normalize(cleanQuery(value));if(seen.has(key))return false;seen.add(key);return true;
    }).slice(0,maxRecent).map(cleanQuery);
  }catch{return null;}
}
const writeRecent=values=>{try{localStorage.setItem(recentStorageKey,JSON.stringify(values));}catch{/* In-memory recents remain available without storage. */}};
let searchInstance=0;

export function mountSmartSearch({catalog=[],parts=[],onModel,onPart,onTopic,onCompare}) {
  const index=createSearchIndex(catalog,parts),abort=new AbortController(),uid=`global-search-${++searchInstance}`;
  const modal=document.createElement('dialog');modal.className='global-search';
  modal.setAttribute('aria-labelledby',`${uid}-title`);modal.setAttribute('aria-describedby',`${uid}-help`);
  modal.innerHTML=`<div class="gs-top"><span class="eyebrow" id="${uid}-title">SEARCH THE ENTIRE GARAGE</span><div class="gs-top-actions"><kbd class="gs-escape-hint" aria-hidden="true">Esc</kbd><button type="button" data-gs-close aria-label="Close search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div></div><div class="gs-input-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg><label class="sr-only" for="${uid}-query">Search vehicles, components and lessons</label><input id="${uid}-query" type="search" maxlength="${maxQueryLength}" placeholder="Try F10 M5, S63, or how turbos work…" autocomplete="off" spellcheck="false" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${uid}-options" aria-describedby="${uid}-help"></div><div class="gs-filters" role="group" aria-label="Search category">${categories.map(category=>`<button type="button" data-gs-category="${category}" aria-pressed="${category==='All'}">${category}</button>`).join('')}</div><p class="gs-status" role="status" aria-live="polite" aria-atomic="true"></p><div id="${searchInstance===1?'global-results':uid+'-results'}" class="gs-scroll"></div><div class="gs-footer" id="${uid}-help"><span>↑ ↓ to navigate · Enter to open · Esc clears, then closes</span><span>Recent searches stay in this browser.</span></div>`;
  document.body.append(modal);
  const input=modal.querySelector('input'),list=modal.querySelector('.gs-scroll'),status=modal.querySelector('.gs-status');
  let category='All',selected=-1,results=[],actions=[],recent=readRecent()||[],returnFocus=null;
  const arrowIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>';
  const topicIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21zm0 0V21M9 7h7M9 11h5"/></svg>';

  function select(position) {
    selected=position>=0 && position<actions.length?position:-1;input.removeAttribute('aria-activedescendant');
    list.querySelectorAll('[role=option]').forEach((option,i)=>{
      const active=i===selected;option.setAttribute('aria-selected',String(active));
      if(active){input.setAttribute('aria-activedescendant',option.id);option.scrollIntoView({block:'nearest'});}
    });
  }
  function recentMarkup() {
    if(input.value.trim() || !recent.length)return '';
    return `<section class="gs-recents" aria-label="Recent searches"><div class="gs-recents-heading"><span>RECENT SEARCHES</span><button type="button" data-gs-clear-recent>Clear all</button></div><div class="gs-recent-list">${recent.map((query,i)=>`<span class="gs-recent-item"><button type="button" data-gs-recent="${i}" title="${escapeHTML(query)}">${escapeHTML(query)}</button><button type="button" data-gs-remove="${i}" aria-label="Remove ${escapeHTML(query)} from recent searches"><span aria-hidden="true">×</span></button></span>`).join('')}</div></section>`;
  }
  function remember(query) {
    const cleaned=cleanQuery(query);if(!cleaned)return;
    recent=[cleaned,...recent.filter(value=>normalize(value)!==normalize(cleaned))].slice(0,maxRecent);writeRecent(recent);
  }
  function render() {
    const query=cleanQuery(input.value),pair=comparisonFromQuery(catalog,query);results=searchIndex(index,query,category);
    const related=results[0]?.suggested;actions=[];const optionMarkup=[];
    if(pair.length===2 && (category==='All'||category==='Vehicles')){
      const models=pair.map(id=>catalog.find(model=>model.id===id)),i=actions.length;actions.push({type:'compare',ids:pair});
      optionMarkup.push(`<button class="gs-compare" type="button" id="${uid}-option-${i}" data-gs-action="${i}" role="option" aria-selected="false" tabindex="-1">Compare ${escapeHTML(models.map(model=>[model.name,generationLabel(model)].filter(Boolean).join(' ')).join(' & '))} <span aria-hidden="true">→</span></button>`);
    }
    for(const record of results){
      const i=actions.length;actions.push({type:'result',record});
      optionMarkup.push(`<button class="gs-result" type="button" id="${uid}-option-${i}" role="option" aria-selected="false" data-gs-action="${i}" data-gs-result="${i}" tabindex="-1">${record.image?`<img src="${escapeHTML(record.image)}" alt="" loading="lazy">`:`<span class="gs-topic-icon" aria-hidden="true">${topicIcon}</span>`}<span><small${record.suggested?' class="gs-related-label"':''}>${record.suggested?'Related suggestion · ':''}${record.category}</small><strong>${escapeHTML(record.title)}</strong><span>${escapeHTML(record.subtitle)}</span></span><span class="gs-result-arrow" aria-hidden="true">${arrowIcon}</span></button>`);
    }
    if(related)status.textContent=`No exact matches. Related suggestions for “${results[0].suggestedQuery}”${category==='All'?'':' in '+category.toLowerCase()}.`;
    else if(query)status.textContent=`${results.length} ${results.length===1?'result':'results'}${category==='All'?'':' in '+category.toLowerCase()}${pair.length===2 && (category==='All'||category==='Vehicles')?' · vehicle comparison available':''}.`;
    else status.textContent=recent.length?'Pick a recent search or explore a starting point below.':'Search a model, engine code, component or question.';
    list.innerHTML=recentMarkup()+`<div role="listbox" id="${uid}-options" aria-label="${related?'Related search suggestions':'Search results'}">${optionMarkup.join('')}</div>`+(actions.length?'':`<div class="gs-empty"><strong>No ${category==='All'?'matching results':category.toLowerCase()+' found'}.</strong><p>${category==='All'?'Try a chassis such as F10, an engine code such as B58, or a component such as intercooler.':`Your ${escapeHTML(category.toLowerCase())} filter is active. Search all categories for more results.`}</p>${category==='All'?'':'<button type="button" data-gs-show-all>Search all categories</button>'}</div>`);
    select(-1);list.scrollTop=0;
  }
  function releaseSearch(){
    if(!document.querySelector('dialog.global-search[open]'))document.documentElement.classList.remove('apex-search-open');
    input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');
  }
  function close(){if(modal.open)modal.close();releaseSearch();}
  function activate(position) {
    const action=actions[position];if(!action)return;remember(input.value);close();
    if(action.type==='compare'){onCompare?.(action.ids);return;}
    const record=action.record;
    if(record.category==='Vehicles')onModel?.(record.id);
    else if(record.category==='Components')onPart?.(record.index);
    else onTopic?.(record.id);
  }
  function setCategory(value) {
    category=value;modal.querySelectorAll('[data-gs-category]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.gsCategory===value)));
  }
  function open(query='') {
    if(!modal.open)returnFocus=document.activeElement;
    recent=readRecent()||recent;setCategory('All');input.value=cleanQuery(query);render();
    if(!modal.open)modal.showModal();document.documentElement.classList.add('apex-search-open');input.setAttribute('aria-expanded','true');input.focus({preventScroll:true});
  }
  input.addEventListener('input',render,{signal:abort.signal});
  input.addEventListener('keydown',event=>{
    if(event.isComposing)return;
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();if(!actions.length)return;
      select(selected<0?(event.key==='ArrowDown'?0:actions.length-1):(selected+(event.key==='ArrowDown'?1:-1)+actions.length)%actions.length);
    }else if((event.key==='Home'||event.key==='End') && selected>=0){event.preventDefault();select(event.key==='Home'?0:actions.length-1);}
    else if(event.key==='Enter'){event.preventDefault();activate(selected<0?0:selected);}
    else if(event.key==='Escape' && input.value){event.preventDefault();event.stopPropagation();input.value='';render();}
  },{signal:abort.signal});
  modal.addEventListener('click',event=>{
    if(event.target.closest('[data-gs-close]')){close();return;}
    if(event.target===modal){const bounds=modal.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)close();return;}
    const action=event.target.closest('[data-gs-action]');if(action){activate(Number(action.dataset.gsAction));return;}
    const filter=event.target.closest('[data-gs-category]');if(filter){setCategory(filter.dataset.gsCategory);render();input.focus();return;}
    const recentButton=event.target.closest('[data-gs-recent]');if(recentButton){input.value=recent[Number(recentButton.dataset.gsRecent)]||'';render();input.focus();return;}
    const remove=event.target.closest('[data-gs-remove]');if(remove){
      const removedIndex=Number(remove.dataset.gsRemove);recent.splice(removedIndex,1);writeRecent(recent);render();
      (list.querySelector(`[data-gs-remove="${Math.min(removedIndex,recent.length-1)}"]`)||input).focus();return;
    }
    if(event.target.closest('[data-gs-clear-recent]')){recent=[];writeRecent(recent);render();input.focus();return;}
    if(event.target.closest('[data-gs-show-all]')){setCategory('All');render();input.focus();}
  },{signal:abort.signal});
  modal.addEventListener('cancel',event=>{
    if(input.value){event.preventDefault();input.value='';render();input.focus({preventScroll:true});}
  },{signal:abort.signal});
  modal.addEventListener('close',()=>{
    releaseSearch();
    if(returnFocus?.isConnected && returnFocus.getClientRects().length)returnFocus.focus({preventScroll:true});
  },{signal:abort.signal});
  document.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey) && !event.altKey && event.key.toLowerCase()==='k'){
      event.preventDefault();if(modal.open)close();else open();
    }
  },{signal:abort.signal});
  document.querySelectorAll('[data-global-search]').forEach(button=>button.addEventListener('click',()=>open(),{signal:abort.signal}));
  window.addEventListener('storage',event=>{if(event.key===recentStorageKey || event.key===null){recent=readRecent()||recent;if(modal.open && !input.value)render();}},{signal:abort.signal});
  return {open,destroy(){close();abort.abort();modal.remove();}};
}
