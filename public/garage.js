import {verifiedSpecs} from './verified-specs.js';

const STORE = 'apex-garage-builds-v1';
const MAX_BUILDS = 20;
const MAX_IMPORT_BYTES = 128 * 1024;
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
  ecu: [['0','Factory calibration'], ['1','Mild calibration scenario'], ['2','Advanced calibration scenario']],
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

const configurationKey = configuration => JSON.stringify(Object.keys(garageDefaults).map(key => configuration[key]));
const buildKey = build => `${build.modelId}\n${build.name}\n${configurationKey(build.config)}`;
const newBuildId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Import only identity and configuration. Recalculate all performance figures and
// source information from the local catalogue; never trust imported derived facts.
export function validateBuildImport(input, catalog = []) {
  const records = Array.isArray(input) ? input : [input];
  if (!records.length || records.length > MAX_BUILDS) throw new Error(`Import between 1 and ${MAX_BUILDS} builds at a time.`);
  const known = new Map(catalog.filter(combustion).map(candidate => [candidate.id, candidate]));
  return records.map((record, index) => {
    const fail = message => {throw new Error(`Build ${index + 1}: ${message}`);};
    if (!record || typeof record !== 'object' || Array.isArray(record)) fail('expected a JSON build object.');
    if (Object.hasOwn(record,'version') && record.version !== 1) fail('this file version is not supported. Export a version 1 garage build.');
    if (typeof record.modelId !== 'string' || !known.has(record.modelId)) fail('the model is not a supported combustion vehicle in this library.');
    if (typeof record.name !== 'string' || !record.name.trim() || record.name.trim().length > 80) fail('the build name must contain 1–80 characters.');
    if (!record.config || typeof record.config !== 'object' || Array.isArray(record.config)) fail('a configuration object is required.');
    if (Object.keys(record.config).some(key => !Object.hasOwn(garageDefaults,key))) fail('the configuration contains an unknown option.');
    const config = {};
    for (const key of Object.keys(garageDefaults)) {
      if (!Object.hasOwn(record.config,key) || typeof record.config[key] !== 'string' || !choices[key].some(([value]) => value === record.config[key])) fail(`choose a supported value for ${controlNames[key]}.`);
      config[key] = record.config[key];
    }
    if (!Number(known.get(record.modelId).turbos) && (config.turbo !== '0' || config.intercooler !== '0')) fail('turbo or charge-cooler upgrades are unavailable for this naturally aspirated model.');
    return {modelId:record.modelId, name:record.name.trim(), config,
      savedAt:typeof record.savedAt === 'string' && Number.isFinite(Date.parse(record.savedAt)) ? new Date(record.savedAt).toISOString() : new Date().toISOString()};
  });
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
  if (!turbocharged) {config.turbo = '0'; config.intercooler = '0';}
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

export {mountGarage} from './tuning-workbench.js';
export {assessBuild} from './tuning-review.js';
export const garageChoices = choices;
export const garageControlNames = controlNames;
export const garageComponentNotes = componentNotes;
export {cleanConfiguration};
