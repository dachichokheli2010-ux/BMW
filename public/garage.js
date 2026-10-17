import {EngineDrive} from './drive.js';
import {EngineSound} from './engine-sound.js';
import {verifiedSpecs} from './verified-specs.js';

const STORE = 'apex-garage-builds-v1';
const PS_WATTS = 735.49875;
const HP_WATTS = 745.69987158227;
const TORQUE_TO_PS = 60 * PS_WATTS / (2 * Math.PI);
const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character]));
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const positive = value => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : null;
const format = (value, digits = 0) => Number.isFinite(value) ? value.toLocaleString('en', {maximumFractionDigits: digits, minimumFractionDigits: digits}) : 'Not documented';
const verifiedFor = model => model?.verified || verifiedSpecs[model?.id];
const combustion = model => !/electric|hybrid/i.test(`${model.powertrain || ''} ${model.hybridNote || ''}`) && positive(model.cylinders) !== null;

export const garageDefaults = Object.freeze({ecu:'0', turbo:'0', intercooler:'0', intake:'0', exhaust:'0', suspension:'stock', wheels:'stock', brakes:'stock', transmission:'stock'});
const choices = {
  ecu: [['0','Factory calibration'], ['1','Mild calibration hypothesis'], ['2','Advanced calibration hypothesis']],
  turbo: [['0','Factory turbo system'], ['1','Larger turbo concept'], ['2','High-flow turbo concept']],
  intercooler: [['0','Factory charge cooling'], ['1','Larger charge-cooler concept']],
  intake: [['0','Factory intake'], ['1','High-flow intake concept']],
  exhaust: [['0','Factory exhaust'], ['1','Rear exhaust concept'], ['2','Full exhaust concept']],
  suspension: [['stock','Factory suspension'], ['road','Road spring concept'], ['track','Track coilover concept']],
  wheels: [['stock','Factory finish'], ['graphite','Graphite finish'], ['silver','Bright silver finish'], ['bronze','Satin bronze finish']],
  brakes: [['stock','Factory brakes'], ['road','Road pad concept'], ['track','Track brake concept']],
  transmission: [['stock','Factory transmission'], ['sport','Shift calibration concept'], ['clutch','Clutch / cooling concept']]
};
const controlNames = {ecu:'ECU calibration', turbo:'Turbochargers', intercooler:'Charge-air cooling', intake:'Intake system', exhaust:'Exhaust system', suspension:'Suspension', wheels:'Wheel finish', brakes:'Brakes', transmission:'Transmission'};
const componentNotes = {
  ecu:'Calibration hypotheses change the assumed output. No tuner, fuel grade or engine safety limit has been validated.',
  turbo:'A larger compressor may increase airflow but also changes response and supporting requirements. Physical fitment is not verified.',
  intercooler:'Charge cooling can help manage intake temperature. The small assumed gain is a scenario input, not a guaranteed peak-power improvement.',
  intake:'A different intake may change restriction and sound. Real results depend on the original system and calibration.',
  exhaust:'Flow, sound and catalyst configuration vary. No real exhaust product or measured gain is represented.',
  suspension:'Changes the educational chassis preview. No engine-power gain, exact ride height or handling result is assumed.',
  wheels:'Changes the preview finish and saved build. Wheel fitment, diameter, tyre grip and mass have not been verified.',
  brakes:'Changes the preview caliper. Brake capacity and fade resistance depend on the complete system; no engine-power gain is assumed.',
  transmission:'Records a transmission concept. No shift-time, compatibility or acceleration benefit is invented.'
};

function cleanConfiguration(supplied = {}) {
  if (!supplied || typeof supplied !== 'object' || Array.isArray(supplied)) supplied = {};
  return Object.fromEntries(Object.entries(garageDefaults).map(([key, fallback]) => [key, choices[key].some(([value]) => value === String(supplied[key])) ? String(supplied[key]) : fallback]));
}

export function factoryOutput(model) {
  const power = positive(model?.power), torque = positive(model?.torque);
  const unit = String(model?.powerUnit || '').toLowerCase();
  const powerPS = power === null ? null : unit === 'ps' ? power : unit === 'hp' ? power * HP_WATTS / PS_WATTS : unit === 'kw' ? power * 1000 / PS_WATTS : null;
  const torqueUnit = String(model?.torqueUnit || '').toLowerCase();
  const torqueNm = torque === null ? null : torqueUnit === 'nm' || torqueUnit === 'n·m' ? torque : /lb.?ft/.test(torqueUnit) ? torque * 1.3558179483314 : null;
  return {powerPS, torqueNm};
}

// These percentages are explicit teaching assumptions, not documented tuning claims.
// They are additive to prevent accidental multiplication of independent guesses.
export function estimateBuild(model, supplied = {}) {
  const config = cleanConfiguration(supplied), turbocharged = Number(model?.turbos) > 0;
  const stock = factoryOutput(model);
  const assumptions = {
    ecu: [0, turbocharged ? 8 : 3, turbocharged ? 15 : 6][Number(config.ecu)],
    turbo: turbocharged ? [0,12,25][Number(config.turbo)] : 0,
    intercooler: turbocharged ? Number(config.intercooler) * 2 : 0,
    intake: Number(config.intake),
    exhaust: [0,1,3][Number(config.exhaust)]
  };
  const gainPercent = Object.values(assumptions).reduce((sum, value) => sum + value, 0);
  const factor = 1 + gainPercent / 100, verified = verifiedFor(model);
  const mass = positive(verified?.weightKg);
  const stockAcceleration = positive(verified?.acceleration100);
  return {
    config, assumptions, gainPercent, stock,
    powerPS: stock.powerPS === null ? null : stock.powerPS * factor,
    torqueNm: stock.torqueNm === null ? null : stock.torqueNm * factor,
    powerToWeight: mass && stock.powerPS ? stock.powerPS * factor / mass * 1000 : null,
    stockPowerToWeight: mass && stock.powerPS ? stock.powerPS / mass * 1000 : null,
    // A sensitivity illustration only: unchanged mass, traction and gearing.
    acceleration100: stockAcceleration && stock.powerPS ? stockAcceleration / Math.pow(factor, .35) : null,
    stockAcceleration,
    mass
  };
}

// Construct a pedagogical envelope from scalar catalogue ratings. Neither curve
// represents a measured factory dyno run. Power and torque obey P = T × omega.
export function syntheticDynoPoint(model, rpm, factor = 1) {
  const {powerPS, torqueNm} = factoryOutput(model);
  if (powerPS === null || torqueNm === null) return {rpm, powerPS:null, torqueNm:null};
  const limit = positive(model.maxRPM) || 7000;
  const speed = clamp(Number(rpm) || 800, 800, limit);
  const verified = verifiedFor(model);
  let shape;
  if (Number(model.turbos) > 0) {
    const start = verified?.torqueRPM?.[0] || limit * .28;
    const end = verified?.torqueRPM?.[1] || limit * .7;
    shape = speed < start ? .4 + .6 * clamp((speed - 800) / Math.max(1, start - 800), 0, 1) : speed <= end ? 1 : 1 - .26 * clamp((speed - end) / Math.max(1, limit - end), 0, 1);
  } else {
    const peak = verified?.torqueRPM?.[0] || limit * .5;
    shape = speed <= peak ? .55 + .45 * clamp((speed - 800) / Math.max(1, peak - 800), 0, 1) : 1 - .15 * clamp((speed - peak) / Math.max(1, limit - peak), 0, 1);
  }
  const torque = Math.min(torqueNm * shape, powerPS * TORQUE_TO_PS / speed) * factor;
  return {rpm:speed, powerPS:torque * speed / TORQUE_TO_PS, torqueNm:torque};
}

let mountedCount = 0;
export function mountGarage(container, {catalog = [], initialModelId} = {}) {
  if (!container) return {destroy(){}, stop(){}, selectModel(){}};
  const prefix = `garage-${++mountedCount}`;
  const models = catalog.filter(combustion);
  const byId = new Map(models.map(model => [model.id, model]));
  const events = new AbortController();
  const drive = new EngineDrive(), sound = new EngineSound();
  sound.setVolume(.25);
  let model = null, config = {...garageDefaults}, result = null, builds = [], destroyed = false;
  let operation = 0, frameId = 0, stopTimer = 0, lastTime = 0, lastPaint = 0, dynoRPM = 3500;
  let gear = 1, speed = 0, temperature = 20, boost = 0;
  const $ = selector => container.querySelector(selector);
  const url = value => {if (typeof value !== 'string' || !value.trim()) return ''; try {const parsed = new URL(value, document.baseURI); return /^https?:$/.test(parsed.protocol) ? parsed.href : '';} catch {return '';}};
  const label = candidate => `${candidate.name} · ${candidate.generation?.split(' / ').at(-1) || candidate.code} · ${candidate.market || candidate.code}`;
  const status = message => {const target = $('[data-garage-status]'); if (target) target.textContent = message;};
  function readBuilds() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE) || '[]');
      builds = Array.isArray(parsed) ? parsed.filter(build => build && typeof build.id === 'string' && typeof build.modelId === 'string' && typeof build.name === 'string' && byId.has(build.modelId)).slice(0, 20).map(build => ({id:build.id.slice(0,80), name:build.name.slice(0,80), modelId:build.modelId, savedAt:typeof build.savedAt === 'string' ? build.savedAt : '', config:cleanConfiguration(build.config)})) : [];
    } catch {builds = [];}
  }
  function writeBuilds(next) {
    try {localStorage.setItem(STORE, JSON.stringify(next)); builds = next; renderBuilds(); return true;}
    catch {status('Your browser could not save this build. Export JSON to keep a copy.'); return false;}
  }
  container.classList.add('garage-app');
  container.innerHTML = `<div class="garage-heading"><div><span class="eyebrow">APEX LAB / VIRTUAL WORKSHOP</span><h2>Build your hypothesis.</h2><p>Explore how engine output, chassis choices and calibration relate. Start with a BMW, then compare factory ratings with an explicitly hypothetical build.</p></div><span class="garage-badge">EDUCATIONAL SIMULATION</span></div>
    <div class="garage-selector"><label for="${prefix}-model">Choose your BMW<select id="${prefix}-model" data-garage-model><option value="">Select a combustion model</option>${models.map(candidate => `<option value="${esc(candidate.id)}">${esc(label(candidate))}</option>`).join('')}</select></label><p>Factory figures keep their original market and units. Electric and hybrid system outputs are excluded from combustion tuning.</p></div>
    <div class="garage-empty" data-garage-empty><span aria-hidden="true">01 / SELECT</span><h3>Your workshop is ready.</h3><p>Select a car to open its configuration, synthetic dyno and interactive dashboard.</p><p>No vehicle is selected automatically.</p></div>
    <div data-garage-workbench hidden></div>
    <p class="garage-status" data-garage-status role="status" aria-live="polite"></p>
    <section class="garage-saved" aria-label="Saved garage builds"><div><h3>Your saved builds</h3><p>Stored in this browser. Export a JSON copy to keep or share a configuration.</p></div><div data-garage-builds></div></section>`;

  function controls() {
    return Object.keys(garageDefaults).map((key, index) => {
      const unavailable = ['turbo','intercooler'].includes(key) && !Number(model.turbos);
      return `<div class="garage-control"><label for="${prefix}-${key}"><span>${String(index + 1).padStart(2,'0')}</span>${controlNames[key]}</label><select id="${prefix}-${key}" data-garage-control="${key}" aria-describedby="${prefix}-${key}-note"${unavailable ? ' disabled' : ''}>${choices[key].map(([value, text]) => `<option value="${value}"${config[key] === value ? ' selected' : ''}>${esc(unavailable && value === '0' ? 'Naturally aspirated · no turbo system' : text)}</option>`).join('')}</select><p id="${prefix}-${key}-note">${esc(unavailable ? 'Forced-induction conversion is outside this model. No compatible conversion or resulting output is assumed.' : componentNotes[key])}</p></div>`;
    }).join('');
  }
  function renderWorkbench() {
    const verified = verifiedFor(model);
    $('[data-garage-workbench]').hidden = false;
    $('[data-garage-empty]').hidden = true;
    $('[data-garage-workbench]').innerHTML = `<div class="garage-car-heading"><div><span class="eyebrow">${esc(model.generation)} / ${esc(model.code)}</span><h3>${esc(model.name)}</h3><p>${esc(model.market)}</p></div><button type="button" data-garage-action="reset">Reset to factory <span aria-hidden="true">↺</span></button></div>
      <div class="garage-columns"><section class="garage-configuration" aria-label="Build configuration"><div class="garage-panel-title"><span>01</span><h3>Configuration</h3></div><p class="garage-fine">Concept options describe systems, not verified aftermarket products or fitment.</p>${controls()}</section>
      <div class="garage-performance"><div class="garage-chassis"><svg viewBox="0 0 600 170" role="img" aria-label="Simplified educational chassis preview. Wheel finish, suspension and brake concept change this diagram."><title>Simplified chassis preview, not an exact BMW model</title><path class="garage-ground" d="M30 140h540"/><g class="garage-body"><path d="M47 112v-24l19-13 71-9 59-42h169l69 42 105 18 20 22v12h-61a47 47 0 0 0-94 0H196a47 47 0 0 0-94 0Z"/><path class="garage-glass" d="m157 66 46-32h67v32Zm124-32h77l52 32H281Z"/><path d="M285 74v42m181-31 61 11M59 92h40"/></g><g class="garage-wheel" transform="translate(149 118)"><circle r="33"/><circle class="garage-rim" r="22"/><path d="M0-20v40m-19-26 38 12m-31 10 24-32"/><path class="garage-caliper" d="M13-14q15 14 0 28"/></g><g class="garage-wheel" transform="translate(451 118)"><circle r="33"/><circle class="garage-rim" r="22"/><path d="M0-20v40m-19-26 38 12m-31 10 24-32"/><path class="garage-caliper" d="M13-14q15 14 0 28"/></g></svg><span>Simplified chassis preview · no physical fitment claim</span></div>
      <section class="garage-results" aria-label="Factory versus hypothetical output"><div class="garage-panel-title"><span>02</span><h3>Stock vs. scenario</h3></div><div data-garage-results></div><p class="garage-fine">PS = metric horsepower. hp = mechanical horsepower. Factory values are engine ratings; no wheel-power or drivetrain-loss claim is made.</p></section>
      <section class="garage-dyno"><div class="garage-panel-title"><span>03</span><h3>Synthetic dyno</h3></div><p>Constructed curves, <strong>not measured dyno data</strong>. Scalar factory ratings anchor a simplified envelope; the entire curve shape is illustrative.</p><div class="garage-legend"><span><i class="power"></i>Scenario PS</span><span><i class="torque"></i>Scenario Nm</span><span><i class="stock"></i>Stock envelopes</span></div><div data-garage-chart></div><label class="garage-rpm-control" for="${prefix}-dyno-rpm">Inspect engine speed <output data-garage-dyno-rpm-label></output><input type="range" id="${prefix}-dyno-rpm" data-garage-dyno-rpm min="800" max="${positive(model.maxRPM) || 7000}" step="100" value="${dynoRPM}"></label><div data-garage-dyno-readout class="garage-dyno-readout" aria-live="polite"></div></section>
      <details class="garage-method"><summary>Read the assumptions and factory evidence</summary><p>Output increases are arbitrary teaching inputs. They are added to the factory scalar power and torque ratings; they are not measured or documented aftermarket results. Real output depends on hardware, fuel, calibration, temperature, emissions equipment and engine condition.</p><div data-garage-assumptions></div><p>Acceleration sensitivity = factory time ÷ (scenario power / factory power)<sup>0.35</sup>. This deliberately simple illustration ignores traction, launch control, gearing, aerodynamic drag and changing mass. It is not a vehicle performance prediction.</p><p>Power-to-weight uses an explicitly sourced factory mass, unchanged by concept parts. No mass is guessed for other cars. Suspension, wheel, brake and transmission choices carry no invented engine-power gain.</p>${verified ? `<p><strong>Expanded factory scope:</strong> ${esc(verified.specification)}</p><p>${esc(verified.verificationNote)}</p><p>${esc(verified.weightConvention)}</p>${verified.sources.map(source => `<a href="${url(source.url)}" target="_blank" rel="noopener">${esc(source.title)} ↗</a>`).join('')}` : '<p>Expanded acceleration and mass have not been verified for this catalogue entry. They remain unavailable.</p>'}<a href="${url(model.source)}" target="_blank" rel="noopener">Original catalogue factory source ↗</a></details>
      </div></div>
      <section class="garage-dashboard" aria-label="Interactive simulated dashboard"><div class="garage-dashboard-heading"><div><span class="eyebrow">VIRTUAL INSTRUMENT CLUSTER</span><h3>Feel the response.</h3></div><span class="garage-badge">ALL READINGS SIMULATED</span></div><p class="garage-fine">This is a free-rev and virtual-roller teaching model. Speed, boost, temperature and load output are invented simulation states, not telemetry or a performance test.</p><div class="garage-instruments"><div class="garage-main-instrument"><span>ENGINE SPEED</span><strong data-garage-rpm>0</strong><small>RPM</small><div class="garage-rpm-track"><i data-garage-rpm-fill></i></div></div><div class="garage-main-instrument"><span>VIRTUAL SPEED</span><strong data-garage-speed>0</strong><small>km/h</small></div><div class="garage-gear"><span>GEAR</span><strong data-garage-gear>1</strong><div><button type="button" data-garage-action="gear-down" aria-label="Shift simulated gear down" disabled>−</button><button type="button" data-garage-action="gear-up" aria-label="Shift simulated gear up" disabled>+</button></div></div><div class="garage-mini-instruments"><div><span>BOOST</span><strong data-garage-boost>0.00 bar</strong></div><div><span>ENGINE TEMP</span><strong data-garage-temperature>20 °C</strong></div><div><span>LOAD POWER</span><strong data-garage-live-power>0 PS</strong></div><div><span>LOAD TORQUE</span><strong data-garage-live-torque>0 Nm</strong></div></div></div><div class="garage-driving-controls"><button type="button" class="garage-start" data-garage-action="start" aria-pressed="false">Start simulation</button><label for="${prefix}-throttle">Throttle <output data-garage-throttle-label>0%</output><input type="range" id="${prefix}-throttle" min="0" max="100" value="0" data-garage-throttle disabled></label><button type="button" data-garage-action="rev" disabled>Hold to rev</button><label class="garage-volume" for="${prefix}-volume">Volume<input type="range" id="${prefix}-volume" min="0" max="100" value="${Math.round(sound.volume * 100)}" data-garage-volume></label><button type="button" data-garage-action="mute" aria-pressed="${sound.muted}">${sound.muted ? 'Unmute' : 'Mute'}</button></div><p class="garage-audio-label">Synthesized ${esc(model.code)} / ${esc(model.layout)} audio · ${model.turbos ? 'illustrative turbo spool and lift-off effect' : 'naturally aspirated profile'}. Engine families use different sound-design profiles; this is not an authentic recording.</p><p data-garage-engine-state role="status">ENGINE OFF · Start, then use the throttle or hold to rev. Sound requires a browser that supports Web Audio Worklets.</p></section>
      <section class="garage-save"><div><h3>Keep this configuration.</h3><p>Name your build and save it locally, or download the complete assumptions as JSON.</p></div><label for="${prefix}-name">Build name<input id="${prefix}-name" data-garage-build-name maxlength="80" placeholder="My ${esc(model.generation?.split(' / ').at(-1) || 'BMW')} build"></label><div><button type="button" data-garage-action="save">Save build</button><button type="button" data-garage-action="export">Export JSON ↗</button></div></section>`;
    updateResults();
  }

  function metric(title, factory, scenario, unit, note = '') {
    const value = text => text === 'Not documented' ? '<span class="garage-missing" aria-label="Not documented">—</span>' : text;
    return `<div class="garage-result"><span>${title}</span><div><span>${value(factory)}<small>${unit}</small><em>FACTORY</em></span><span aria-hidden="true">→</span><strong>${value(scenario)}<small>${unit}</small><em>HYPOTHETICAL</em></strong></div>${note ? `<p>${note}</p>` : ''}</div>`;
  }
  function updateResults() {
    if (!model) return;
    result = estimateBuild(model, config);
    const verified = verifiedFor(model);
    $('[data-garage-results]').innerHTML = metric('Engine power', format(result.stock.powerPS), format(result.powerPS), 'PS', `Original catalogue rating: ${esc(model.power)} ${esc(model.powerUnit)}. Scenario ≈ ${format(result.powerPS === null ? null : result.powerPS * PS_WATTS / HP_WATTS)} mechanical hp.`)
      + metric('Peak engine torque', format(result.stock.torqueNm), format(result.torqueNm), 'Nm')
      + metric('Power-to-weight', format(result.stockPowerToWeight,1), format(result.powerToWeight,1), result.mass ? 'PS/t' : '', result.mass ? `${format(result.mass)} kg unchanged factory mass · ${esc(verified.weightConvention)}` : 'No verified matching factory mass. Ratio is unavailable.')
      + metric('0–100 sensitivity', format(result.stockAcceleration,1), format(result.acceleration100,1), result.stockAcceleration ? 's' : '', result.stockAcceleration ? 'Illustrative power-ratio formula only. No traction or launch model; not a predicted test result.' : 'No verified matching factory 0–100 km/h time. Sensitivity is unavailable.');
    $('[data-garage-assumptions]').innerHTML = `<ul>${Object.entries(result.assumptions).map(([key,value]) => `<li>${controlNames[key]}: +${value}% assumed scalar output</li>`).join('')}</ul><p><strong>Total additive assumption: +${result.gainPercent}%.</strong> A factory configuration uses +0%.</p>`;
    const preview = $('.garage-chassis');
    preview.style.setProperty('--garage-wheel', {stock:'#7c8793', graphite:'#515a66', silver:'#dde2e8', bronze:'#bd925e'}[config.wheels]);
    preview.style.setProperty('--garage-caliper', {stock:'#7c8793', road:'#63a8ff', track:'#ed6c4f'}[config.brakes]);
    preview.style.setProperty('--garage-lower', {stock:'0px', road:'5px', track:'9px'}[config.suspension]);
    renderChart();
  }
  function chartGeometry() {
    return {left:54, top:23, width:672, height:208, limit:positive(model.maxRPM) || 7000,
      maxPower:Math.max(100, Math.ceil((result.powerPS || 100) * 1.12 / 100) * 100),
      maxTorque:Math.max(100, Math.ceil((result.torqueNm || 100) * 1.12 / 100) * 100)};
  }
  function renderChart() {
    const target = $('[data-garage-chart]');
    if (!result.stock.powerPS || !result.stock.torqueNm) {target.innerHTML = '<p>Power and torque units are not documented sufficiently to construct this teaching curve.</p>'; return;}
    const g = chartGeometry(), factor = 1 + result.gainPercent / 100;
    const x = rpm => g.left + (rpm - 800) / (g.limit - 800) * g.width;
    const y = (value, maximum) => g.top + g.height * (1 - value / maximum);
    const path = (key, multiplier) => Array.from({length:81}, (_, index) => {const point = syntheticDynoPoint(model, 800 + (g.limit - 800) * index / 80, multiplier); return `${index ? 'L' : 'M'}${x(point.rpm).toFixed(2)},${y(point[key], key === 'powerPS' ? g.maxPower : g.maxTorque).toFixed(2)}`;}).join(' ');
    target.innerHTML = `<svg class="garage-dyno-svg" viewBox="0 0 780 278" role="img" aria-label="Synthetic engine power and torque curves. Use the RPM slider below to inspect values; curves are not measurements." data-garage-dyno><title>Illustrative stock and scenario curves</title><desc>The left axis shows metric horsepower and the right axis shows newton-metres. All line shapes are constructed teaching envelopes, not measured dyno data.</desc>${[0,.25,.5,.75,1].map(fraction => `<path class="garage-chart-grid" d="M${g.left} ${y(g.maxPower * fraction,g.maxPower)}h${g.width}"/><text x="44" y="${y(g.maxPower * fraction,g.maxPower) + 4}" text-anchor="end">${Math.round(g.maxPower * fraction)}</text><text x="736" y="${y(g.maxPower * fraction,g.maxPower) + 4}">${Math.round(g.maxTorque * fraction)}</text>`).join('')}<text x="${g.left}" y="12" class="garage-chart-power">PS</text><text x="${g.left + g.width}" y="12" text-anchor="end" class="garage-chart-torque">Nm</text>${Array.from({length:Math.floor(g.limit/1000)}, (_, index) => (index+1)*1000).map(rpm => `<text x="${x(rpm)}" y="255" text-anchor="middle">${rpm/1000}k</text>`).join('')}<text x="390" y="275" text-anchor="middle">ENGINE SPEED / RPM</text><path class="garage-curve stock power" d="${path('powerPS',1)}"/><path class="garage-curve stock torque" d="${path('torqueNm',1)}"/><path class="garage-curve power" d="${path('powerPS',factor)}"/><path class="garage-curve torque" d="${path('torqueNm',factor)}"/><path class="garage-chart-cursor" data-garage-cursor d="M0 23v208"/><circle class="garage-chart-dot power" data-garage-power-dot r="4"/><circle class="garage-chart-dot torque" data-garage-torque-dot r="4"/></svg>`;
    updateCursor();
  }
  function updateCursor() {
    if (!model || !result) return;
    const g = chartGeometry();
    dynoRPM = clamp(dynoRPM, 800, g.limit);
    const point = syntheticDynoPoint(model, dynoRPM, 1 + result.gainPercent / 100), stockPoint = syntheticDynoPoint(model, dynoRPM);
    const x = g.left + (dynoRPM - 800) / (g.limit - 800) * g.width;
    $('[data-garage-cursor]')?.setAttribute('transform', `translate(${x},0)`);
    for (const [selector,value,max] of [['[data-garage-power-dot]',point.powerPS,g.maxPower],['[data-garage-torque-dot]',point.torqueNm,g.maxTorque]]) {
      const dot = $(selector); dot?.setAttribute('cx', x); dot?.setAttribute('cy',g.top + g.height * (1 - value / max));
    }
    $('[data-garage-dyno-rpm]').value = dynoRPM;
    $('[data-garage-dyno-rpm-label]').textContent = `${format(dynoRPM)} RPM`;
    $('[data-garage-dyno-readout]').innerHTML = `<span><small>STOCK ENVELOPE</small>${format(stockPoint.powerPS)} PS / ${format(stockPoint.torqueNm)} Nm</span><span><small>SCENARIO ENVELOPE</small>${format(point.powerPS)} PS / ${format(point.torqueNm)} Nm</span>`;
  }
  function renderBuilds() {
    $('[data-garage-builds]').innerHTML = builds.length ? builds.map(build => {const savedModel = byId.get(build.modelId); return `<article class="garage-saved-card"><div><strong>${esc(build.name)}</strong><p>${esc(savedModel.name)} · ${esc(savedModel.generation?.split(' / ').at(-1) || savedModel.code)}</p></div><div><button type="button" data-garage-load="${esc(build.id)}" aria-label="Load ${esc(build.name)}">Load</button><button type="button" data-garage-delete="${esc(build.id)}" aria-label="Delete ${esc(build.name)}">Delete</button></div></article>`;}).join('') : '<p class="garage-no-builds">No builds saved yet. Choose a BMW above to start.</p>';
  }
  function selectModel(id, supplied) {
    if (destroyed) return false;
    const next = byId.get(id);
    if (!next) {
      if (!id) {stop(); model = null; $('[data-garage-workbench]').hidden = true; $('[data-garage-empty]').hidden = false; $('[data-garage-model]').value = '';}
      else status('This vehicle has no supported combustion configuration in the garage.');
      return false;
    }
    stop(); model = next; config = cleanConfiguration(supplied);
    if (!Number(model.turbos)) {config.turbo = '0'; config.intercooler = '0';}
    drive.configure(model); gear = 1; dynoRPM = Math.min(3500, positive(model.maxRPM) || 7000);
    $('[data-garage-model]').value = model.id;
    renderWorkbench(); status(''); return true;
  }
  function paintDashboard() {
    if (!model || !$('[data-garage-rpm]')) return;
    const rpm = drive.running ? drive.rpm : 0, throttle = drive.running ? drive.throttle / 100 : 0;
    const point = syntheticDynoPoint(model, Math.max(800,rpm), 1 + (result?.gainPercent || 0) / 100);
    $('[data-garage-rpm]').textContent = format(Math.round(rpm / 10) * 10);
    $('[data-garage-speed]').textContent = format(Math.round(speed));
    $('[data-garage-gear]').textContent = gear;
    $('[data-garage-boost]').textContent = `${format(boost,2)} bar`;
    $('[data-garage-temperature]').textContent = `${format(temperature)} °C`;
    $('[data-garage-live-power]').textContent = `${format((point.powerPS || 0) * throttle)} PS`;
    $('[data-garage-live-torque]').textContent = `${format((point.torqueNm || 0) * throttle)} Nm`;
    $('[data-garage-rpm-fill]').style.width = `${clamp(rpm / (positive(model.maxRPM) || 7000) * 100, 0, 100)}%`;
  }
  function stop(immediate = false) {
    if (destroyed) return;
    operation++; cancelAnimationFrame(frameId); frameId = 0; clearTimeout(stopTimer);
    drive.stop(); sound.stop(); speed = 0; boost = 0;
    if (sound.ctx?.state === 'running') {
      if (immediate) void sound.ctx.suspend().catch(() => {});
      else stopTimer = setTimeout(() => {if (!drive.running) void sound.ctx?.suspend().catch(() => {});}, 180);
    }
    if ($('[data-garage-throttle]')) {$('[data-garage-throttle]').value = 0; $('[data-garage-throttle-label]').textContent = '0%';}
    for (const element of container.querySelectorAll('[data-garage-throttle],[data-garage-action="rev"],[data-garage-action="gear-up"],[data-garage-action="gear-down"]')) element.disabled = true;
    const start = $('[data-garage-action="start"]');
    if (start) {start.textContent = 'Start simulation'; start.setAttribute('aria-pressed','false'); start.disabled = false;}
    const state = $('[data-garage-engine-state]'); if (state) state.textContent = 'ENGINE OFF · Start, then use the throttle or hold to rev.';
    $('[data-garage-action="rev"]')?.classList.remove('is-held');
    paintDashboard();
  }
  async function start() {
    if (!model || destroyed) return;
    if (drive.running) {stop(); return;}
    clearTimeout(stopTimer);
    const token = ++operation, selected = model, button = $('[data-garage-action="start"]');
    button.disabled = true; button.textContent = 'Preparing audio…';
    try {
      await sound.start(selected);
      if (token !== operation || selected !== model || destroyed || document.hidden || container.closest('[hidden]')) {sound.stop(); void sound.ctx?.suspend().catch(() => {}); return;}
      await drive.start();
      for (const element of container.querySelectorAll('[data-garage-throttle],[data-garage-action="rev"],[data-garage-action="gear-up"],[data-garage-action="gear-down"]')) element.disabled = false;
      button.textContent = 'Stop simulation'; button.setAttribute('aria-pressed','true');
      $('[data-garage-engine-state]').textContent = 'SIMULATION RUNNING · Synthetic audio and dashboard. Release the throttle to return smoothly to idle.';
      lastTime = performance.now(); lastPaint = 0; frameId = requestAnimationFrame(frame);
    } catch {if (token === operation) {stop(true); status('Audio could not start. Use a secure context (HTTPS or localhost) and a browser with Audio Worklet support.');}}
    finally {if (!destroyed && token === operation) button.disabled = false;}
  }
  function frame(now) {
    if (!drive.running || destroyed) return;
    const dt = Math.min(.05, (now - lastTime) / 1000); lastTime = now;
    const rpm = drive.tick(dt), load = drive.throttle / 100, limit = positive(model.maxRPM) || 7000;
    sound.tick(rpm, drive.throttle);
    const targetSpeed = Math.max(0, (rpm - 760) / (limit - 760)) * gear * 38 * Math.pow(load, .25);
    speed += (targetSpeed - speed) * Math.min(1, dt * 1.2);
    const targetBoost = Number(model.turbos) ? Math.max(0,(rpm - 1800) / Math.max(1,limit - 1800)) * load * (1.1 + result.gainPercent / 100) : 0;
    boost += (targetBoost - boost) * Math.min(1, dt * 2);
    temperature += (90 + load * 20 - temperature) * dt * .025;
    if (now - lastPaint > 75) {paintDashboard(); lastPaint = now;}
    frameId = requestAnimationFrame(frame);
  }
  function releaseRev() {
    if (!drive.running) return;
    drive.throttle = Number($('[data-garage-throttle]').value);
    $('[data-garage-throttle-label]').textContent = `${drive.throttle}%`;
    $('[data-garage-action="rev"]').classList.remove('is-held');
  }
  function holdRev() {
    if (!drive.running) return;
    drive.throttle = 100; $('[data-garage-throttle-label]').textContent = '100%';
    $('[data-garage-action="rev"]').classList.add('is-held');
  }
  function exportBuild() {
    const payload = {version:1, name:$('[data-garage-build-name]').value.trim() || `${model.name} concept`, modelId:model.id, model:label(model), config, savedAt:new Date().toISOString(),
      classification:'Hypothetical educational configuration, not verified aftermarket performance or fitment.',
      assumptions:result.assumptions, totalAssumedGainPercent:result.gainPercent,
      factory:{power:model.power, powerUnit:model.powerUnit, torque:model.torque, torqueUnit:model.torqueUnit, market:model.market, source:model.source, expanded:verifiedFor(model) || null},
      hypothetical:{powerPS:result.powerPS, torqueNm:result.torqueNm, accelerationSensitivitySeconds:result.acceleration100, powerToWeightPSPerTonne:result.powerToWeight},
      method:'Additive scalar output assumptions. Synthetic curves use P=T×omega. Acceleration sensitivity = stock seconds / power ratio^0.35. Factory mass unchanged. No wheel-power claim.'};
    const download = URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)], {type:'application/json'}));
    const anchor = document.createElement('a'); anchor.href = download; anchor.download = `apex-${model.id}-concept.json`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(download), 1000); status('Configuration exported with its sources and assumptions.');
  }
  container.addEventListener('change', event => {
    if (event.target.matches('[data-garage-model]')) {selectModel(event.target.value); return;}
    const key = event.target.dataset.garageControl;
    if (key && model && Object.hasOwn(garageDefaults,key)) {config[key] = event.target.value; config = cleanConfiguration(config); updateResults();}
  }, {signal:events.signal});
  container.addEventListener('input', event => {
    if (event.target.matches('[data-garage-throttle]')) {drive.throttle = Number(event.target.value); $('[data-garage-throttle-label]').textContent = `${event.target.value}%`;}
    if (event.target.matches('[data-garage-volume]')) sound.setVolume(Number(event.target.value) / 100);
    if (event.target.matches('[data-garage-dyno-rpm]')) {dynoRPM = Number(event.target.value); updateCursor();}
  }, {signal:events.signal});
  container.addEventListener('click', event => {
    const load = event.target.closest('[data-garage-load]'), remove = event.target.closest('[data-garage-delete]');
    if (load) {const build = builds.find(item => item.id === load.dataset.garageLoad); if (build) {selectModel(build.modelId, build.config); $('[data-garage-build-name]').value = build.name; status(`Loaded ${build.name}.`); $('[data-garage-model]').focus({preventScroll:true});} return;}
    if (remove) {const build = builds.find(item => item.id === remove.dataset.garageDelete); if (writeBuilds(builds.filter(item => item.id !== remove.dataset.garageDelete))) status(`Deleted ${build?.name || 'build'}.`); return;}
    const action = event.target.closest('[data-garage-action]')?.dataset.garageAction;
    if (!action || !model) return;
    if (action === 'start') void start();
    if (action === 'reset') {stop(); config = {...garageDefaults}; for (const control of container.querySelectorAll('[data-garage-control]')) control.value = config[control.dataset.garageControl]; updateResults(); status('Factory configuration restored.');}
    if (action === 'save') {const name = $('[data-garage-build-name]').value.trim() || `${model.name} · ${model.generation?.split(' / ').at(-1) || model.code} concept`; const build = {id:globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`, modelId:model.id, name:name.slice(0,80), config:{...config}, savedAt:new Date().toISOString()}; if (writeBuilds([build,...builds].slice(0,20))) status(`Saved ${build.name} in this browser.`);}
    if (action === 'export') exportBuild();
    if (action === 'mute') {sound.setMute(!sound.muted); const button = $('[data-garage-action="mute"]'); button.textContent = sound.muted ? 'Unmute' : 'Mute'; button.setAttribute('aria-pressed',String(sound.muted));}
    if ((action === 'gear-up' || action === 'gear-down') && drive.running) {const maximum = Number(verifiedFor(model)?.transmission?.match(/^(\d+)/)?.[1]) || 6; gear = clamp(gear + (action === 'gear-up' ? 1 : -1), 1, maximum); paintDashboard();}
  }, {signal:events.signal});
  container.addEventListener('pointerdown', event => {const button = event.target.closest('[data-garage-action="rev"]'); if (!button || button.disabled || event.isPrimary === false) return; event.preventDefault(); button.focus({preventScroll:true}); button.setPointerCapture(event.pointerId); holdRev();}, {signal:events.signal});
  for (const type of ['pointerup','pointercancel','lostpointercapture']) container.addEventListener(type, event => {if (event.target.closest('[data-garage-action="rev"]')) releaseRev();}, {signal:events.signal});
  container.addEventListener('keydown', event => {if (event.target.matches('[data-garage-action="rev"]') && ['Space','Enter'].includes(event.code)) {event.preventDefault(); holdRev();}}, {signal:events.signal});
  container.addEventListener('keyup', event => {if (event.target.matches('[data-garage-action="rev"]') && ['Space','Enter'].includes(event.code)) {event.preventDefault(); releaseRev();}}, {signal:events.signal});
  container.addEventListener('contextmenu', event => {if (event.target.closest('[data-garage-action="rev"]')) event.preventDefault();}, {signal:events.signal});
  container.addEventListener('pointermove', event => {const svg = event.target.closest('[data-garage-dyno]'); if (!svg || event.buttons || !model) return; const bounds = svg.getBoundingClientRect(), g = chartGeometry(); const plotX = (event.clientX - bounds.left) / bounds.width * 780; dynoRPM = Math.round(clamp((plotX - g.left) / g.width,0,1) * (g.limit - 800) / 100) * 100 + 800; updateCursor();}, {signal:events.signal});
  window.addEventListener('blur', () => stop(true), {signal:events.signal});
  window.addEventListener('pagehide', () => stop(true), {signal:events.signal});
  document.addEventListener('visibilitychange', () => {if (document.hidden) stop(true);}, {signal:events.signal});
  const observer = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(entries => {if (!entries[0].isIntersecting && (drive.running || sound.running)) stop(true);}) : null;
  observer?.observe(container);
  sound.onError = () => {stop(true); status('The sound processor stopped. Start the simulation again to retry.');};
  readBuilds(); renderBuilds();
  if (initialModelId) selectModel(initialModelId);
  return {selectModel, stop, destroy() {if (destroyed) return; stop(true); destroyed = true; observer?.disconnect(); events.abort(); clearTimeout(stopTimer); sound.node?.disconnect(); sound.master?.disconnect(); sound.compressor?.disconnect(); void sound.ctx?.close().catch(() => {}); container.replaceChildren(); container.classList.remove('garage-app');}};
}
