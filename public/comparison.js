import {t} from './preferences.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const missing = '—';
const positive = value => value !== null && value !== '' && Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : null;
const generation = model => model.generation?.split(' / ').at(-1)?.trim() || missing;
const electric = model => model.code === 'eDrive' || model.electric === true || model.fuel === 'electric';
const normalized = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const safeLink = url => { try { if (!url) return ''; const parsed = new URL(url, location.origin); return /^https?:$/.test(parsed.protocol) ? esc(parsed.href) : ''; } catch { return ''; } };
const paths = {plus:'<path d="M12 5v14M5 12h14"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',share:'<path d="M9 8H5v13h14V8h-4M12 15V2m-4 4 4-4 4 4"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>'};
const svg = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${paths[name]}</svg>`;

// Factory PS and mechanical hp are different units. Convert through SI first.
export function powerInKW(value, unit) {
  const amount = positive(value);
  if (amount === null) return null;
  if (unit === 'kW') return amount;
  if (unit === 'PS') return amount * 0.73549875;
  if (unit === 'hp') return amount * 0.7456998715822702;
  return null;
}
export function torqueInNm(value, unit) {
  const amount = positive(value);
  if (amount === null) return null;
  if (/^N[·\s-]?m$/i.test(unit)) return amount;
  if (/^(?:lb[·\s-]?ft|ft[·\s-]?lb)$/i.test(unit)) return amount * 1.3558179483314004;
  return null;
}
export function convertedPower(model, units = 'metric') {
  const kw = powerInKW(model.power, model.powerUnit);
  return kw === null ? null : {value:kw / (units === 'imperial' ? 0.7456998715822702 : 0.73549875), unit:units === 'imperial' ? 'hp' : 'PS', kw};
}
export function convertedTorque(model, units = 'metric') {
  const nm = torqueInNm(model.torque, model.torqueUnit);
  return nm === null ? null : {value:nm / (units === 'imperial' ? 1.3558179483314004 : 1), unit:units === 'imperial' ? 'lb-ft' : 'Nm', nm};
}
export function powerToWeightKwPerTonne(model) {
  const kw=powerInKW(model.power,model.powerUnit),kg=positive(model.weightKg);
  return kw===null||kg===null?null:kw/(kg/1000);
}
export function comparisonWinner(values,direction='higher') {
  const comparable=values.filter(value=>Number.isFinite(value)&&value>0);
  if(comparable.length<2)return null;
  return direction==='lower'?Math.min(...comparable):Math.max(...comparable);
}
export function comparisonBarPercent(value,best,direction='higher') {
  if(!Number.isFinite(value)||!Number.isFinite(best)||value<=0||best<=0)return 0;
  return Math.max(1,Math.min(100,direction==='lower'?best/value*100:value/best*100));
}
export function comparisonShareURL(origin,ids,units='metric',differencesOnly=false) {
  const url=new URL('/compare',origin),selected=[...new Set(Array.isArray(ids)?ids:[])].filter(id=>typeof id==='string'&&id).slice(0,3);
  if(selected.length)url.searchParams.set('compare',selected.join(','));
  url.searchParams.set('units',units==='imperial'?'imperial':'metric');
  if(differencesOnly)url.searchParams.set('differences','1');
  return url.href;
}

export function createComparisonController({catalog, getSelected, onSelectionChange, dialog, toast = () => {}}) {
  const abort = new AbortController(), byId = new Map(catalog.map(model => [model.id, model]));
  const candidates = [...catalog].sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric:true}) || generation(a).localeCompare(generation(b), undefined, {numeric:true}));
  const params = new URLSearchParams(location.search);
  let units = params.get('units') === 'imperial' ? 'imperial' : 'metric', differencesOnly = params.get('differences') === '1';
  let mountedHost = null, dialogRoot = null, pickerIndex = null, pickerQuery = '', pickerFilter = 'all', showAll = false, shareVisible = false, copied = false;
  const chosen = () => [...new Set(getSelected())].filter(id => byId.has(id)).slice(0, 3).map(id => byId.get(id));
  const selectedId = () => chosen().map(model => model.id);
  const root = () => mountedHost?.querySelector('.comparison-v2') || dialogRoot;
  const number = (value, digits = 0) => Number(value).toLocaleString(document.documentElement.lang || 'en', {maximumFractionDigits:digits});
  const year = model => model.modelYear || model.year || model.market?.match(/\b(?:19|20)\d{2}\b/)?.[0] || missing;
  const sourcePower = model => positive(model.power) === null ? missing : `${model.power} ${model.powerUnit || ''}`.trim();
  const sourceTorque = model => positive(model.torque) === null ? missing : `${model.torque} ${model.torqueUnit || ''}`.trim();
  const isM = model => model.isM === true || model.generation?.startsWith('M SERIES') || /^BMW (?:M[1-8](?:\b|\s)|1 Series M|1M\b|X[3-6] M\b|XM\b|Z[34] M\b)/.test(model.name);
  const scope = model => model.powerScope || (electric(model) ? 'System output' : 'Factory figures');
  const display = value => value === null || value === undefined || value === '' ? missing : value;
  function battery(model) {
    const values = [];
    if (positive(model.batteryNet) !== null) values.push(`${number(model.batteryNet, 1)} kWh ${t('Usable').toLowerCase()}`);
    if (positive(model.batteryGross) !== null) values.push(`${number(model.batteryGross, 1)} kWh ${t('Gross').toLowerCase()}`);
    return values.join(' / ') || (/kWh/i.test(model.induction || '') ? model.induction : missing);
  }
  function speed(model) {
    const kmh = positive(model.topSpeed), mph = positive(model.verified?.topSpeedMph);
    if (units === 'imperial') return mph !== null ? `${number(mph)} mph` : kmh !== null ? `${number(kmh / 1.609344)} mph` : missing;
    return kmh !== null ? `${number(kmh)} km/h` : mph !== null ? `${number(mph * 1.609344)} km/h` : missing;
  }
  function dimensions(model) {
    const values = ['length','width','height'].map(key => positive(model[`${key}Mm`]) ?? (positive(model.verified?.dimensionsIn?.[key]) === null ? null : model.verified.dimensionsIn[key] * 25.4));
    return values.every(value => value !== null) ? `${values.map(value => number(value / (units === 'imperial' ? 25.4 : 1), units === 'imperial' ? 1 : 0)).join(' / ')} ${units === 'imperial' ? 'in' : 'mm'}` : missing;
  }
  function wheelbase(model) {
    const mm = positive(model.wheelbaseMm) ?? (positive(model.verified?.dimensionsIn?.wheelbase) === null ? null : model.verified.dimensionsIn.wheelbase * 25.4);
    return mm === null ? missing : `${number(mm / (units === 'imperial' ? 25.4 : 1), units === 'imperial' ? 1 : 0)} ${units === 'imperial' ? 'in' : 'mm'}`;
  }
  function mass(model) {
    const kg = positive(model.weightKg);
    return kg === null ? missing : `${number(units === 'imperial' ? positive(model.verified?.weightUSLb) ?? kg * 2.2046226218 : kg)} ${units === 'imperial' ? 'lb' : 'kg'}`;
  }
  function massValue(model) {
    const kg=positive(model.weightKg);
    return kg===null?null:units==='imperial'?positive(model.verified?.weightUSLb)??kg*2.2046226218:kg;
  }
  function rows(models) {
    const groups = [
      {id:'powertrain', name:'Power & powertrain', rows:[
        {name:'Power', metric:'power', direction:'higher', value:model => convertedPower(model, units)?.value ?? null, format:model => {const result=convertedPower(model,units);return result?{value:number(Math.round(result.value)),unit:result.unit,secondary:`${number(Math.round(result.kw))} kW`}:null;}},
        {name:'Torque', metric:'torque', direction:'higher', value:model => convertedTorque(model, units)?.value ?? null, format:model => {const result=convertedTorque(model,units);return result?{value:number(Math.round(result.value)),unit:result.unit}:null;}},
        {name:'Powertrain', value:model => t(model.powertrain || model.fuel || (electric(model) ? 'Electric' : missing))},
        {name:'Engine / motor', value:model => [model.code, model.layout].filter(Boolean).join(' / ') || missing},
        {name:'Drive layout', value:model => t(model.drivetrain || (electric(model) ? model.layout : '') || missing)},
        {name:'Transmission', value:model => model.transmission || missing},
        {name:'Induction', value:model => electric(model) ? missing : t(model.induction || missing)},
        {name:'Battery energy', optional:true, value:battery}
      ]},
      {id:'performance', name:'Performance', rows:[
        {name:'Power-to-weight', metric:'powerToWeight', direction:'higher', value:powerToWeightKwPerTonne, format:(model,value)=>({value:number(value,1),unit:'kW/t'})},
        // These different acceleration targets cannot be converted into each other.
        {name:'0–100 km/h', metric:'acceleration', direction:'lower', value:model => positive(model.acceleration100), format:(model,value)=>({value:number(value,1),unit:'s'})},
        {name:'0–60 mph', optional:true, value:model => positive(model.verified?.acceleration60Mph) === null ? missing : `${number(model.verified.acceleration60Mph, 1)} s`},
        {name:'Top speed', value:speed},
        {name:'Speed limitation / options', optional:true, detail:true, value:model => model.verified?.topSpeedNote || missing}
      ]},
      {id:'dimensions', name:'Size & body', rows:[
        {name:'Body style', value:model => model.body ? t(model.body === 'Coupés' ? 'Coupes' : model.body) : missing},
        {name:'Mass', metric:'mass', direction:'lower', value:massValue, format:model=>{const value=massValue(model);return value===null?null:{value:number(value),unit:units==='imperial'?'lb':'kg'};}},
        {name:'Mass convention', detail:true, value:model => model.weightConvention || missing},
        {name:'Length / width / height', value:dimensions},
        {name:'Wheelbase', value:wheelbase}
      ]},
      {id:'source', name:'Specification & sources', rows:[
        {name:'Generation', value:generation},
        {name:'Specification year', value:year},
        {name:'Factory power / torque', value:model => `${sourcePower(model)} / ${sourceTorque(model)}`},
        {name:'Output definition', value:model => t(scope(model))},
        {name:'Combustion engine power', optional:true, value:model => positive(model.enginePower) === null ? missing : `${model.enginePower} ${model.enginePowerUnit || model.powerUnit}`},
        {name:'Combustion engine torque', optional:true, value:model => positive(model.engineTorque) === null ? missing : `${model.engineTorque} ${model.engineTorqueUnit || model.torqueUnit}`},
        {name:'Factory specification', detail:true, value:model => model.verified?.specification || model.market || missing}
      ]}
    ];
    return groups.map(group => ({...group, rows:group.rows.map(row => {
      const rawValues = models.map(row.value),values=rawValues.map(display);
      const differs = models.length > 1 && new Set(rawValues.map(value => typeof value === 'number' ? Math.round(value*1000) : String(display(value)))).size > 1;
      return {...row, differs, values, rawValues};
    }).filter(row => !(!row.metric && row.values.every(value => value === missing)) && (!differencesOnly || models.length < 2 || row.differs))}));
  }
  function metricCell(model, row, index) {
    const value=row.rawValues[index];
    if(value===null)return `<span class="cmp-missing" aria-label="${esc(t('Not documented'))}">${missing}</span>`;
    const bestValue=comparisonWinner(row.rawValues,row.direction),best=bestValue!==null&&value===bestValue,formatted=row.format(model,value);
    return `<div class="cmp-metric${best ? ' is-best' : ''}"><strong>${esc(formatted.value)}<small>${esc(formatted.unit)}</small></strong>${best ? `<span class="cmp-best" title="${esc(t('Best in comparison'))}">✓<span class="sr-only"> ${esc(t('Best in comparison'))}</span></span>` : ''}${formatted.secondary ? `<span class="cmp-secondary">${esc(formatted.secondary)}</span>` : ''}<span class="cmp-bar" aria-hidden="true"><i style="width:${comparisonBarPercent(value,bestValue||value,row.direction).toFixed(2)}%"></i></span></div>`;
  }
  function slot(model, index) {
    if (!model) return `<button type="button" class="cmp-slot cmp-slot-empty" data-cmp-pick="${index}" aria-label="${esc(t('Add a BMW'))}, ${index + 1}"><span class="cmp-slot-index">0${index + 1}</span><span class="cmp-slot-plus">${svg('plus')}</span><strong>${esc(t('Add a BMW'))}</strong><span>${esc(t('Model, chassis or engine'))}</span></button>`;
    return `<article class="cmp-slot cmp-slot-filled"><div class="cmp-slot-photo"><img src="${esc(model.car)}" alt="${esc(model.name)} · ${esc(generation(model))}" decoding="async"><span class="cmp-slot-index">0${index + 1}</span><span class="cmp-slot-generation">${esc(generation(model))}</span><button type="button" class="cmp-remove" data-cmp-remove="${esc(model.id)}" aria-label="${esc(t('Remove from comparison'))}: ${esc(model.name)} ${esc(generation(model))}">${svg('close')}</button></div><div class="cmp-slot-copy"><span class="cmp-slot-meta">${esc(t(model.powertrain || (electric(model) ? 'Electric' : 'Petrol')))}${year(model) !== missing ? ` <span>·</span> ${esc(year(model))}` : ''}</span><h3>${esc(model.name.replace(/^BMW /, ''))}</h3><button type="button" class="cmp-replace" data-cmp-pick="${index}">${esc(t('Replace model'))} ${svg('arrow')}</button></div></article>`;
  }
  function filteredCandidates() {
    const terms = normalized(pickerQuery).trim().split(/\s+/).filter(Boolean), preferred = ['g80','g82-m4','f10-m5','e92','g87-m2','g26-i4-m50'];
    return candidates.filter(model => (pickerFilter === 'all' || pickerFilter === 'm' && isM(model) || pickerFilter === 'electric' && electric(model)) && terms.every(term => normalized([model.name,model.generation,model.code,model.powertrain,model.body,year(model)].join(' ')).includes(term))).sort((a,b) => terms.length ? 0 : (preferred.indexOf(a.id) < 0 ? 99 : preferred.indexOf(a.id)) - (preferred.indexOf(b.id) < 0 ? 99 : preferred.indexOf(b.id)));
  }
  function pickerResults() {
    const matches = filteredCandidates(), limit = showAll || pickerQuery.trim() ? matches.length : 6, ids = selectedId();
    return `<p class="cmp-results-count" role="status">${esc(t('{count} models found', {count:matches.length}))}${!pickerQuery.trim() && !showAll && matches.length > 6 ? ` <span>· ${esc(t('Popular picks first'))}</span>` : ''}</p><div class="cmp-picker-grid">${matches.slice(0,limit).map(model => `<button type="button" class="cmp-candidate" data-cmp-choose="${esc(model.id)}"${ids.includes(model.id) ? ' disabled' : ''}><img src="${esc(model.car)}" alt="" loading="lazy"><span><strong>${esc(model.name.replace(/^BMW /, ''))}</strong><small>${esc(generation(model))} · ${esc(model.code)}${year(model) !== missing ? ` · ${esc(year(model))}` : ''}</small></span><span class="cmp-candidate-action">${ids.includes(model.id) ? '✓' : '+'}<span class="sr-only">${esc(t(ids.includes(model.id) ? 'Already selected' : 'Add a BMW'))}</span></span></button>`).join('')}</div>${!matches.length ? `<p class="cmp-no-results">${esc(t('No BMWs match your search. Try a model such as M3, a chassis such as F10, or an engine such as N55.'))}</p>` : !showAll && !pickerQuery.trim() && matches.length > 6 ? `<button type="button" class="cmp-show-all" data-cmp-show-all>${esc(t('Browse all {count} models', {count:matches.length}))} ${svg('arrow')}</button>` : ''}`;
  }
  function picker() {
    if (pickerIndex === null) return '';
    const replacing = !!chosen()[pickerIndex];
    return `<section class="cmp-picker" aria-labelledby="cmp-picker-title"><div class="cmp-picker-heading"><div><span class="eyebrow">${esc(t(replacing ? 'REFINE YOUR SHORTLIST' : 'BUILD YOUR SHORTLIST'))}</span><h3 id="cmp-picker-title">${esc(t(replacing ? 'Find a replacement.' : 'Which BMW is next?'))}</h3></div><button type="button" class="cmp-picker-close" data-cmp-close-picker aria-label="${esc(t('Close model picker'))}">${svg('close')}</button></div><label class="cmp-search">${svg('search')}<span class="sr-only">${esc(t('Search models to compare'))}</span><input type="search" data-cmp-search placeholder="${esc(t('Search M3, F10, N55…'))}" value="${esc(pickerQuery)}" autocomplete="off" aria-controls="cmp-picker-results"></label><div class="cmp-picker-filters" role="group" aria-label="${esc(t('Filter models'))}">${[['all','All models'],['m','BMW M'],['electric','Electric']].map(([id,label]) => `<button type="button" data-cmp-filter="${id}" aria-pressed="${pickerFilter === id}">${esc(t(label))}</button>`).join('')}</div><div id="cmp-picker-results">${pickerResults()}</div></section>`;
  }
  function suggestions() {
    const presets = [
      {title:'M3 vs M4', subtitle:'Same engine. Different character.', ids:['g80','g82-m4']},
      {title:'Three eras of M5', subtitle:'V10, V8 and a new generation.', ids:['e60','f90','g90-m5']},
      {title:'Electric vs petrol', subtitle:'Two approaches to the everyday.', ids:['g60-i5','g30-530i']}
    ].filter(preset => preset.ids.every(id => byId.has(id)));
    return `<section class="cmp-suggestions"><div class="cmp-section-heading"><h3>${esc(t('Start with a good rivalry.'))}</h3><span>${esc(t('CURATED COMPARISONS'))}</span></div><div class="cmp-suggestion-grid">${presets.map(preset => `<button type="button" class="cmp-suggestion" data-cmp-preset="${preset.ids.join(',')}"><div class="cmp-suggestion-photos">${preset.ids.slice(0,2).map(id => `<img src="${esc(byId.get(id).car)}" alt="${esc(byId.get(id).name)} ${esc(generation(byId.get(id)))}" loading="lazy">`).join('')}<span>VS</span></div><span class="cmp-suggestion-copy"><strong>${esc(t(preset.title))}</strong><small>${esc(t(preset.subtitle))}</small>${svg('arrow')}</span></button>`).join('')}</div></section>`;
  }
  function shareUrl() {
    return comparisonShareURL(location.origin,selectedId(),units,differencesOnly);
  }
  function syncAddress() { if (mountedHost && /^\/compare\/?$/.test(location.pathname)) history.replaceState(history.state, '', shareUrl()); }
  function table(models, groups) {
    return `<div class="cmp-spec-heading"><h3>${esc(t('The details that make the difference.'))}</h3><span class="cmp-swipe">↔ ${esc(t('Swipe to compare'))}</span></div><div class="cmp-scroll" role="region" tabindex="0" aria-label="${esc(t('Model specification comparison'))}"><table class="cmp-table"><caption class="sr-only">${esc(t('Factory specifications for your selected BMWs'))}</caption><colgroup><col class="cmp-label-col">${models.map(() => '<col>').join('')}</colgroup><thead><tr><th class="cmp-corner" scope="col">${esc(t('Specification'))}<small>${esc(t('Factory figures'))}</small></th>${models.map(model => `<th scope="col"><span class="cmp-table-generation">${esc(generation(model))}</span><strong>${esc(model.name.replace(/^BMW /, ''))}</strong></th>`).join('')}</tr></thead>${groups.filter(group => group.rows.length).map(group => `<tbody id="cmp-group-${group.id}"><tr class="cmp-group"><th scope="rowgroup" colspan="${models.length + 1}">${esc(t(group.name))}</th></tr>${group.rows.map(row => `<tr class="${row.metric ? 'cmp-metric-row ' : ''}${row.detail ? 'cmp-detail-row ' : ''}${row.differs ? 'cmp-is-different' : ''}"><th scope="row">${esc(t(row.name))}</th>${models.map((model, index) => `<td>${row.metric ? metricCell(model, row, index) : `<span${row.values[index] === missing ? ` class="cmp-missing" aria-label="${esc(t('Not documented'))}"` : ''}>${esc(row.values[index])}</span>`}</td>`).join('')}</tr>`).join('')}</tbody>`).join('')}<tfoot><tr><th scope="row">${esc(t('Explore further'))}</th>${models.map(model => `<td><div class="cmp-car-links"><a href="/models?model=${encodeURIComponent(model.id)}">${esc(t('Explore model'))} ${svg('arrow')}</a>${safeLink(model.source) ? `<a href="${safeLink(model.source)}" target="_blank" rel="noopener">${esc(t('Read BMW source'))}<span aria-hidden="true">↗</span></a>` : ''}</div></td>`).join('')}</tr></tfoot></table></div>`;
  }
  function content() {
    const models = chosen(), groups = rows(models), heading = mountedHost ? 'h1' : 'h2';
    return `<article class="comparison-v2${mountedHost ? ' cmp-workspace' : ''}" style="--cmp-count:${Math.max(1, models.length)}"><div class="cmp-heading"><div><span class="eyebrow">${esc(t('THE COMPARISON GARAGE'))}</span><${heading}>${esc(t('Your shortlist.'))}<br><span>${esc(t('Side by side.'))}</span></${heading}><p>${esc(t('Find what sets them apart. Compare up to three BMWs, from their engines to the finer details.'))}</p></div><div class="cmp-heading-aside"><span class="cmp-progress" aria-label="${esc(t('{count} of 3 models selected', {count:models.length}))}">${[0,1,2].map(index => `<i${index < models.length ? ' class="is-filled"' : ''}></i>`).join('')}</span><span>${esc(t('{count} / 3 selected', {count:models.length}))}</span></div></div><div class="cmp-cars">${[0,1,2].map(index => slot(models[index],index)).join('')}</div>${picker()}${!models.length ? suggestions() : `<div class="cmp-toolbar"><div class="cmp-unit-control" role="group" aria-label="${esc(t('Units'))}"><button type="button" data-cmp-units="metric" aria-pressed="${units === 'metric'}">${esc(t('Metric'))}<small>PS · Nm</small></button><button type="button" data-cmp-units="imperial" aria-pressed="${units === 'imperial'}">${esc(t('Imperial'))}<small>hp · lb-ft</small></button></div><label class="cmp-difference${models.length < 2 ? ' is-disabled' : ''}"><input type="checkbox" data-cmp-differences${differencesOnly ? ' checked' : ''}${models.length < 2 ? ' disabled' : ''}><span>${esc(t('Differences only'))}</span></label><div class="cmp-utilities"><button type="button" data-cmp-share>${svg('share')} ${esc(t('Share'))}</button><button type="button" data-cmp-clear>${esc(t('Clear all'))}</button></div></div><p class="cmp-copy-status" role="status"${copied ? '' : ' hidden'}>${esc(t('Comparison link copied.'))}</p><div class="cmp-share-panel"${shareVisible ? '' : ' hidden'}><label>${esc(t('Copy this comparison link'))}<input type="url" data-cmp-share-url value="${esc(shareUrl())}" readonly></label><button type="button" data-cmp-copy>${esc(t('Copy link'))}</button></div>${models.length === 1 ? `<p class="cmp-hint">${svg('plus')} ${esc(t('Add a second BMW to see what sets them apart.'))}</p>` : ''}${differencesOnly && groups.every(group => !group.rows.length) ? `<p class="cmp-hint">${esc(t('These listed specifications match. Turn off Differences only to see every figure.'))}</p>` : ''}${table(models,groups)}<details class="cmp-footnotes"><summary>${esc(t('A note on these figures'))}</summary><p>${esc(t('Figures are rounded after conversion. PS is metric horsepower; hp is mechanical horsepower. Top speed, mass and dimensions follow your selected units. Acceleration targets are kept separate.'))}</p><p>${esc(t('Hybrid and electric output can include combined system power or temporary boost. Mass conventions, equipment and markets may differ; check the specification and BMW source.'))}</p><p>${esc(t('Photos are generation references and may show a different year, trim or market.'))} ${missing} = ${esc(t('Not documented'))}.</p></details>`}</article>`;
  }
  function refresh(focusSelector) {
    const current = root();
    if (!current?.isConnected || current.closest('dialog')?.open === false) return;
    const scroll = current.querySelector('.cmp-scroll'), left = scroll?.scrollLeft || 0, top = scroll?.scrollTop || 0;
    const dialogElement = current.closest('dialog'), outerTop = dialogElement?.scrollTop || 0;
    current.outerHTML = content();
    if (!mountedHost) dialogRoot = document.querySelector('dialog .comparison-v2');
    const next = root()?.querySelector('.cmp-scroll');
    if (next) { next.scrollLeft = left; next.scrollTop = top; }
    if (dialogElement) dialogElement.scrollTop = outerTop;
    if (focusSelector) root()?.querySelector(focusSelector)?.focus({preventScroll:true});
  }
  function select(ids, focusSelector) {
    copied = false;
    onSelectionChange([...new Set(ids)].filter(id => byId.has(id)).slice(0, 3));
    syncAddress(); refresh(focusSelector);
  }
  function openPicker(index) {
    pickerIndex = Math.min(Number(index), chosen().length, 2); pickerQuery = ''; pickerFilter = 'all'; showAll = false;
    refresh('[data-cmp-search]');
    root()?.querySelector('.cmp-picker')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'nearest'});
  }
  function updatePicker() { const results = root()?.querySelector('#cmp-picker-results'); if (results) results.innerHTML = pickerResults(); }
  async function copyLink() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(shareUrl());
      copied = true; refresh('[data-cmp-share]'); toast(t('Comparison link copied.'));
    } catch {
      copied = false; shareVisible = true; refresh('[data-cmp-share-url]');
      root()?.querySelector('[data-cmp-share-url]')?.select();
    }
  }
  function open() {
    if (mountedHost) { refresh(); return; }
    if (dialogRoot?.isConnected && dialogRoot.closest('dialog')?.open) { refresh(); return; }
    pickerIndex = null; dialog(content()); dialogRoot = document.querySelector('dialog .comparison-v2');
    const element = dialogRoot?.closest('dialog');
    if (element) { element.scrollTop = 0; element.setAttribute('aria-label', t('Compare models')); }
  }
  function mount(container) {
    mountedHost = typeof container === 'string' ? document.querySelector(container) : container;
    if (!mountedHost) return false;
    mountedHost.innerHTML = content(); return true;
  }
  const belongs = event => event.target.closest('.comparison-v2') === root();
  document.addEventListener('click', event => {
    if (!belongs(event)) return;
    const button = event.target.closest('button'); if (!button) return;
    if (button.matches('[data-cmp-pick]')) { openPicker(button.dataset.cmpPick); return; }
    if (button.matches('[data-cmp-close-picker]')) { const index = pickerIndex; pickerIndex = null; refresh(`[data-cmp-pick="${index}"]`); return; }
    if (button.matches('[data-cmp-choose]')) {
      const id = button.dataset.cmpChoose, ids = selectedId();
      if (ids.includes(id) || !byId.has(id) || pickerIndex === null) return;
      const index = Math.min(pickerIndex, ids.length, 2); ids[index] = id; pickerIndex = null;
      select(ids, `[data-cmp-pick="${index}"]`); return;
    }
    if (button.matches('[data-cmp-remove]')) { pickerIndex = null; select(selectedId().filter(id => id !== button.dataset.cmpRemove), '[data-cmp-pick]'); return; }
    if (button.matches('[data-cmp-clear]')) { pickerIndex = null; select([], '[data-cmp-pick]'); return; }
    if (button.matches('[data-cmp-preset]')) { pickerIndex = null; select(button.dataset.cmpPreset.split(','), '[data-cmp-pick]'); return; }
    if (button.matches('[data-cmp-units]')) { units = button.dataset.cmpUnits; copied = false; syncAddress(); refresh(`[data-cmp-units="${units}"]`); return; }
    if (button.matches('[data-cmp-share],[data-cmp-copy]')) { void copyLink(); return; }
    if (button.matches('[data-cmp-filter]')) { pickerFilter = button.dataset.cmpFilter; showAll = false; refresh(`[data-cmp-filter="${pickerFilter}"]`); return; }
    if (button.matches('[data-cmp-show-all]')) { showAll = true; updatePicker(); return; }
  }, {signal:abort.signal});
  document.addEventListener('input', event => {
    if (!belongs(event) || !event.target.matches('[data-cmp-search]')) return;
    pickerQuery = event.target.value; updatePicker();
  }, {signal:abort.signal});
  document.addEventListener('change', event => {
    if (!belongs(event) || !event.target.matches('[data-cmp-differences]')) return;
    differencesOnly = event.target.checked; copied = false; syncAddress(); refresh('[data-cmp-differences]');
  }, {signal:abort.signal});
  document.addEventListener('keydown', event => {
    if (!belongs(event)) return;
    if (event.key === 'Escape' && pickerIndex !== null) { event.preventDefault(); event.stopPropagation(); const index = pickerIndex; pickerIndex = null; refresh(`[data-cmp-pick="${index}"]`); }
    if (event.key === 'ArrowDown' && event.target.matches('[data-cmp-search]')) { event.preventDefault(); root()?.querySelector('[data-cmp-choose]:not(:disabled)')?.focus(); }
  }, {signal:abort.signal});
  window.addEventListener('apex:languagechange', () => refresh(), {signal:abort.signal});
  return {open, mount, render:content, refresh, shareUrl, dispose:() => abort.abort()};
}
