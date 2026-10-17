import {t} from './preferences.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const missing = '—';
const positive = value => value !== null && value !== '' && Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : null;
const generation = model => model.generation?.split(' / ').at(-1)?.trim() || missing;
const electric = model => model.code === 'eDrive' || model.electric === true || model.fuel === 'electric';
const safeLink = url => { try { const parsed = new URL(url, location.origin); return /^https?:$/.test(parsed.protocol) ? esc(parsed.href) : ''; } catch { return ''; } };

// Convert original factory ratings, preserving the distinction between metric
// horsepower (PS) and mechanical horsepower (hp). SI is the common baseline.
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

export function createComparisonController({catalog, getSelected, onSelectionChange, dialog, toast = () => {}}) {
  const abort = new AbortController();
  const candidates = [...catalog].sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric:true}) || generation(a).localeCompare(generation(b), undefined, {numeric:true}));
  const byId = new Map(catalog.map(model => [model.id, model]));
  let units = 'metric', differencesOnly = false, shareVisible = false, copied = false;
  const chosen = () => [...new Set(getSelected())].filter(id => byId.has(id)).slice(0, 4).map(id => byId.get(id));
  const active = () => document.querySelector('.comparison-v2')?.closest('dialog')?.open === true;
  const number = value => Math.round(value).toLocaleString(document.documentElement.lang || 'en');
  const selectedId = () => chosen().map(model => model.id);
  const optionName = model => `${model.name} · ${generation(model)}${year(model) !== missing ? ` · ${year(model)}` : ''}`;
  function year(model) { return model.modelYear || model.year || model.market?.match(/\b(?:19|20)\d{2}\b/)?.[0] || missing; }
  function sourcePower(model) { return positive(model.power) === null ? missing : `${model.power} ${model.powerUnit || ''}`.trim(); }
  function sourceTorque(model) { return positive(model.torque) === null ? missing : `${model.torque} ${model.torqueUnit || ''}`.trim(); }
  function scope(model) { return model.powerScope || (electric(model) ? 'System output' : 'Factory figures'); }
  function battery(model) {
    const values = [];
    if (positive(model.batteryNet) !== null) values.push(`${model.batteryNet} kWh ${t('Usable').toLowerCase()}`);
    if (positive(model.batteryGross) !== null) values.push(`${model.batteryGross} kWh ${t('Gross').toLowerCase()}`);
    return values.join(' / ') || (/kWh/i.test(model.induction || '') ? model.induction : missing);
  }
  function rows(models) {
    const groups = [
      {name:'Power & torque', rows:[
        {name:'Power', metric:'power', value:model => convertedPower(model, units)?.value ?? null},
        {name:'Torque', metric:'torque', value:model => convertedTorque(model, units)?.value ?? null},
        {name:'Factory rating', value:model => `${sourcePower(model)} / ${sourceTorque(model)}`},
        {name:'Output definition', value:model => t(scope(model))},
        {name:'Combustion engine power (factory)', optional:true, value:model => positive(model.enginePower) !== null ? `${model.enginePower} ${model.enginePowerUnit || model.powerUnit}` : missing},
        {name:'Combustion engine torque (factory)', optional:true, value:model => positive(model.engineTorque) !== null ? `${model.engineTorque} ${model.engineTorqueUnit || model.torqueUnit}` : missing}
      ]},
      {name:'Model details', rows:[
        {name:'Generation', value:generation},
        {name:'Specification year', value:year},
        {name:'Body style', value:model => model.body ? t(model.body === 'Coupés' ? 'Coupes' : model.body) : missing},
        {name:'Powertrain', value:model => model.powertrain ? t(model.powertrain) : model.fuel ? t(model.fuel) : electric(model) ? t('Electric') : missing},
        {name:'Drive layout', value:model => t(model.drivetrain || (electric(model) ? model.layout : '') || missing)},
        {name:'Engine / motor', value:model => [model.code, model.layout].filter(Boolean).join(' / ') || missing},
        {name:'Induction', value:model => electric(model) ? missing : t(model.induction || missing)},
        {name:'Battery energy', value:battery, optional:true}
      ]},
      {name:'Performance & dimensions', rows:[
        {name:'0–100 km/h (factory)', value:model => positive(model.acceleration100) === null ? missing : `${model.acceleration100} s`},
        {name:'Top speed (factory)', value:model => positive(model.topSpeed) === null ? missing : `${model.topSpeed} km/h`},
        {name:'Transmission', value:model => model.transmission || missing},
        {name:'Mass & convention', value:model => positive(model.weightKg) === null ? missing : `${model.weightKg} kg · ${model.weightConvention || 'See source'}`},
        {name:'Length / width / height', value:model => [model.lengthMm,model.widthMm,model.heightMm].every(v=>positive(v)!==null) ? `${model.lengthMm} / ${model.widthMm} / ${model.heightMm} mm` : missing},
        {name:'Wheelbase', value:model => positive(model.wheelbaseMm) === null ? missing : `${model.wheelbaseMm} mm`},
        {name:'Expanded specification context', value:model => model.verified?.specification || missing}
      ]},
      {name:'Source & context', rows:[
        {name:'Factory specification', value:model => model.market || missing}
      ]}
    ];
    return groups.map(group => ({...group, rows:group.rows.filter(row => {
      const values = models.map(row.value);
      if (row.optional && values.every(value => value === missing || value === null)) return false;
      if (!differencesOnly || models.length < 2) return true;
      return new Set(values.map(value => typeof value === 'number' ? Math.round(value * 10) / 10 : String(value))).size > 1;
    })}));
  }
  function selector(model, index) {
    const ids = selectedId();
    return `<label class="cmp-selector"><span class="sr-only">${esc(t(model ? 'Replace model' : 'Add a BMW'))}${model ? ': ' + esc(model.name) : ''}</span><select data-cmp-select="${index}"><option value="">${esc(t(model ? 'Replace model' : 'Choose a BMW'))}</option>${candidates.map(candidate => `<option value="${esc(candidate.id)}"${candidate.id === model?.id ? ' selected' : ids.includes(candidate.id) ? ' disabled' : ''}>${esc(optionName(candidate))}</option>`).join('')}</select></label>`;
  }
  function metricCell(model, row, models) {
    const result = row.metric === 'power' ? convertedPower(model, units) : convertedTorque(model, units);
    if (!result) return `<span class="cmp-missing" aria-label="${esc(t('Not documented'))}">${missing}</span>`;
    const values = models.map(row.value).filter(value => value !== null), highest = Math.max(...values);
    // The badge describes this one numeric rating, never an overall winner.
    const best = models.length > 1 && values.length > 1 && new Set(values.map(Math.round)).size > 1 && Math.abs(result.value - highest) < 0.01;
    return `<div class="cmp-metric ${best ? 'is-highest' : ''}"><strong>${esc(number(result.value))}<small>${esc(result.unit)}</small></strong>${best ? `<span class="cmp-best" aria-label="${esc(t('Highest in this comparison'))}" title="${esc(t('Highest in this comparison'))}">↑</span>` : ''}${row.metric === 'power' ? `<span class="cmp-secondary">${esc(number(result.kw))} kW</span>` : ''}<span class="cmp-bar" aria-hidden="true"><i style="width:${Math.max(1, Math.min(100, result.value / highest * 100)).toFixed(2)}%"></i></span></div>`;
  }
  function insights(models) {
    if (models.length < 2) return '';
    const items = [];
    for (const [label, convert] of [['Highest listed power', model => convertedPower(model, units)], ['Highest listed torque', model => convertedTorque(model, units)]]) {
      const values = models.map(model => ({model, result:convert(model)})).filter(entry => entry.result);
      if (values.length < 2) continue;
      const rounded = values.map(entry => Math.round(entry.result.value));
      if (new Set(rounded).size < 2) continue;
      const highest = Math.max(...rounded);
      const leaders = values.filter(entry => Math.round(entry.result.value) === highest);
      const names = leaders.map(({model}) => `${model.name} (${generation(model)})`).join(', ');
      items.push(`<li><strong>${esc(t(label))}:</strong> ${esc(names)} · ${esc(number(highest))} ${esc(values[0].result.unit)}</li>`);
    }
    for (const [label, value] of [['Body style', model => model.body ? t(model.body === 'Coupés' ? 'Coupes' : model.body) : missing], ['Powertrain', model => model.powertrain ? t(model.powertrain) : model.fuel ? t(model.fuel) : electric(model) ? t('Electric') : missing]]) {
      const values = models.map(value);
      if (new Set(values).size < 2 || values.every(item => item === missing)) continue;
      const details = models.map((model, index) => `${model.name} (${generation(model)}): ${values[index]}`).join('; ');
      items.push(`<li><strong>${esc(t(label))}:</strong> ${esc(details)}</li>`);
    }
    if (!items.length) return '';
    return `<section class="cmp-insights" aria-label="${esc(t('Quick comparison insights'))}"><h3>${esc(t('Quick takeaways'))}</h3><ul>${items.join('')}</ul></section>`;
  }
  function shareUrl() {
    const url = new URL('/', location.origin);
    url.searchParams.set('compare', selectedId().join(','));
    url.searchParams.set('units', units);
    return url.href;
  }
  function content() {
    const models = chosen(), groups = rows(models), columnCount = Math.max(2, models.length);
    return `<article class="comparison-v2" style="--cmp-count:${columnCount}">
      <div class="cmp-heading"><span class="eyebrow">APEX / ${esc(t('Compare models'))}</span><h2>${esc(t('Your shortlist. Side by side.'))}</h2><p>${esc(t('Compare up to 4 BMWs. Change any car below and compare factory figures in consistent units.'))}</p></div>
      <div class="cmp-toolbar"><div class="cmp-unit-control" role="group" aria-label="${esc(t('Units'))}"><button type="button" data-cmp-units="metric" aria-pressed="${units === 'metric'}">${esc(t('Metric'))}<small>PS · Nm</small></button><button type="button" data-cmp-units="imperial" aria-pressed="${units === 'imperial'}">${esc(t('Imperial'))}<small>hp · lb-ft</small></button></div><label class="cmp-difference"><input type="checkbox" data-cmp-differences${differencesOnly ? ' checked' : ''}><span>${esc(t('Show differences only'))}</span></label><div class="cmp-utilities"><button type="button" data-cmp-share><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 8h-4v13h14V8h-4M12 15V2m-4 4 4-4 4 4"/></svg><span>${esc(t('Share comparison'))}</span></button><button type="button" data-cmp-print><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M7 8V3h10v5M7 17H3V8h18v9h-4M7 14h10v7H7zM17 11h1"/></svg><span>${esc(t('Print comparison'))}</span></button></div></div>
      <p class="cmp-copy-status" role="status"${copied ? '' : ' hidden'}>${esc(t('Comparison link copied.'))}</p><div class="cmp-share-panel"${shareVisible ? '' : ' hidden'}><label>${esc(t('Copy this comparison link'))}<input type="url" data-cmp-share-url value="${esc(shareUrl())}" readonly></label><button type="button" data-cmp-copy>${esc(t('Copy link'))}</button></div>
      <div class="cmp-selection-line"><span>${esc(t('{count} models selected', {count:models.length}))}</span>${models.length < 4 ? `<div class="cmp-add"><span>+</span>${selector(null, models.length)}</div>` : `<span class="cmp-capacity">4 / 4</span>`}<span class="cmp-swipe">↔ ${esc(t('Swipe to compare every model'))}</span></div>
      ${insights(models)}
      ${models.length ? `<div class="cmp-scroll" role="region" tabindex="0" aria-label="${esc(t('Compare models'))}"><table class="cmp-table"><caption class="sr-only">${esc(t('Compare models'))}</caption><colgroup><col class="cmp-label-col">${models.map(() => '<col>').join('')}</colgroup><thead><tr><th class="cmp-corner" scope="col"><span>${esc(t('Specification'))}</span><small>${esc(t('Factory figures'))}</small></th>${models.map((model, index) => `<th scope="col" class="cmp-car"><button type="button" class="cmp-remove" data-cmp-remove="${esc(model.id)}" aria-label="${esc(t('Remove from comparison'))}: ${esc(model.name)}">×</button><img src="${esc(model.car)}" alt="${esc(model.name)} · ${esc(generation(model))}" decoding="async"><div class="cmp-car-copy"><span class="cmp-chassis">${esc(generation(model))}<span>${esc(year(model))}</span></span><h3>${esc(model.name.replace(/^BMW /, ''))}</h3>${selector(model, index)}</div></th>`).join('')}</tr></thead>${groups.filter(group => group.rows.length).map(group => `<tbody><tr class="cmp-group"><th scope="rowgroup" colspan="${models.length + 1}">${esc(t(group.name))}</th></tr>${group.rows.map(row => `<tr${row.metric ? ' class="cmp-metric-row"' : ''}><th scope="row">${esc(t(row.name))}</th>${models.map(model => `<td>${row.metric ? metricCell(model, row, models) : `<span${row.value(model) === missing ? ` class="cmp-missing" aria-label="${esc(t('Not documented'))}"` : ''}>${esc(row.value(model))}</span>`}</td>`).join('')}</tr>`).join('')}</tbody>`).join('')}<tfoot><tr><th scope="row">${esc(t('Read BMW source'))}</th>${models.map(model => `<td><div class="cmp-car-links">${safeLink(model.source) ? `<a href="${safeLink(model.source)}" target="_blank" rel="noopener">${esc(t('Read BMW source'))}<span aria-hidden="true">↗</span></a>` : `<span class="cmp-missing">${missing}</span>`}<a class="cmp-open-model" href="${electric(model) ? '/electric' : '/'}?model=${encodeURIComponent(model.id)}">${esc(t('Open model'))}<span aria-hidden="true">→</span></a></div></td>`).join('')}</tr></tfoot></table></div>` : `<div class="cmp-onboarding">${[0,1].map(index => `<div class="cmp-empty-slot"><span class="cmp-slot-number">0${index + 1}</span><svg viewBox="0 0 160 64" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M13 44v-9l11-6 19-15h59l23 16 22 5 3 9v7h-13M41 51h65M17 51h-5v-7h138M44 17l-9 14h79L99 17M73 17v14"/><circle cx="28" cy="49" r="12"/><circle cx="124" cy="49" r="12"/></svg><h3>${esc(t('Add a BMW'))}</h3>${selector(null, 0)}</div>`).join('')}</div>`}
      ${models.length === 1 ? `<p class="cmp-hint">${esc(t('Add another BMW to start comparing.'))}</p>` : differencesOnly && groups.every(group => !group.rows.length) ? `<p class="cmp-hint">${esc(t('No shared rows differ. Turn off the differences filter to see all specifications.'))}</p>` : ''}
      <div class="cmp-footnotes"><p>${esc(t('Figures are rounded after conversion. PS is metric horsepower; hp is mechanical horsepower.'))}</p><p>${esc(t('Hybrid and electric figures may describe combined system output or temporary boost. Read each model’s output definition and factory source.'))}</p><p>${esc(t('Photos may show a different year, trim or market.'))} <span>${missing} = ${esc(t('Not documented'))}</span></p></div>
    </article>`;
  }
  function refresh(focusSelector) {
    if (!active()) return;
    const body = document.querySelector('.comparison-v2').parentElement, scroll = body.querySelector('.cmp-scroll');
    const left = scroll?.scrollLeft || 0, top = scroll?.scrollTop || 0;
    const dialogElement = body.closest('dialog'), outerTop = dialogElement.scrollTop;
    body.innerHTML = content();
    const next = body.querySelector('.cmp-scroll');
    if (next) { next.scrollLeft = left; next.scrollTop = top; }
    dialogElement.scrollTop = outerTop;
    if (focusSelector) body.querySelector(focusSelector)?.focus({preventScroll:true});
  }
  function select(ids, focusSelector) {
    copied = false;
    onSelectionChange([...new Set(ids)].filter(id => byId.has(id)).slice(0, 4));
    refresh(focusSelector);
  }
  async function copyLink() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(shareUrl());
      copied = true;
      refresh('[data-cmp-share]');
      toast(t('Comparison link copied.'));
    } catch {
      copied = false;
      shareVisible = true; refresh('[data-cmp-share-url]');
      document.querySelector('[data-cmp-share-url]')?.select();
    }
  }
  function open() {
    const supplied = new URLSearchParams(location.search).get('units');
    if (supplied === 'imperial') units = 'imperial';
    if (active()) { refresh(); return; }
    dialog(content());
    const element = document.querySelector('.comparison-v2')?.closest('dialog');
    if (element) { element.scrollTop = 0; element.setAttribute('aria-label', t('Compare models')); }
  }
  document.addEventListener('click', event => {
    if (!event.target.closest('.comparison-v2')) return;
    const remove = event.target.closest('[data-cmp-remove]');
    if (remove) { select(selectedId().filter(id => id !== remove.dataset.cmpRemove), '[data-cmp-select]'); return; }
    const unit = event.target.closest('[data-cmp-units]');
    if (unit) { units = unit.dataset.cmpUnits; copied = false; refresh(`[data-cmp-units="${units}"]`); return; }
    if (event.target.closest('[data-cmp-share],[data-cmp-copy]')) { void copyLink(); return; }
    if (event.target.closest('[data-cmp-print]')) { window.print(); return; }
  }, {signal:abort.signal});
  document.addEventListener('change', event => {
    if (!event.target.closest('.comparison-v2')) return;
    if (event.target.matches('[data-cmp-differences]')) { differencesOnly = event.target.checked; refresh('[data-cmp-differences]'); return; }
    if (event.target.matches('[data-cmp-select]')) {
      if (!event.target.value) { refresh(); return; }
      const ids = selectedId(), index = Number(event.target.dataset.cmpSelect);
      ids[index] = event.target.value;
      select(ids, `[data-cmp-select="${index}"]`);
    }
  }, {signal:abort.signal});
  window.addEventListener('apex:languagechange', () => refresh(), {signal:abort.signal});
  return {open, refresh, shareUrl, dispose:() => abort.abort()};
}
