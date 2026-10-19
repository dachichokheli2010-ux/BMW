import {allModels} from './catalog.js';
import {academyLessons,academyReferenceData} from './academy.js';
import {createCurriculum} from './academy-content.js';
import {emptyProgress,restoreProgress,levelProgress} from './academy-state.js';
import {partCatalog} from './parts.js';
import {account,accountStorageMessage,mergeGuestGarage} from './account-sync.js';
import {validateBuildImport} from './garage.js';
import {t} from './preferences.js';
import './retention-translations.js';

const KEYS = Object.freeze({favorites:'apex-favorites', recent:'apex-recent', builds:'apex-garage-builds-v1', progress:'bmw-academy-progress-v1', academy:'bmw-academy-state-v2'});
const LEVELS = ['beginner', 'intermediate', 'advanced'];
export const PERSONAL_GARAGE_LESSONS = Object.freeze([
  ['combustion','The four-stroke engine','Engine fundamentals'],
  ['turbocharging','Air under pressure','Air & exhaust'],
  ['transmission','From revs to road speed','Drivetrain'],
  ['engine-codes','Read an engine identity','BMW knowledge'],
  ['cooling','Keep heat in balance','Thermal systems'],
  ['suspension','The contact patch matters','Chassis'],
  ['electronics','Sense. Decide. Respond.','Control systems'],
  ['electrification','Energy takes another route','Electric powertrains'],
  ['drivetrain-layouts','Which wheels drive the car?','Drivetrain'],
  ['m-performance','BMW M and M Performance','BMW knowledge'],
].map(([id,title,category]) => Object.freeze({id,title,category})));
const CONFIG = {
  ecu:['0','1','2'], turbo:['0','1','2'], intercooler:['0','1'], intake:['0','1'], exhaust:['0','1','2'],
  suspension:['stock','road','track'], wheels:['stock','graphite','silver','bronze'], brakes:['stock','road','track'], transmission:['stock','sport','clutch'],
};
const CONFIG_LABELS = {ecu:'ECU',turbo:'Turbo',intercooler:'Charge cooling',intake:'Intake',exhaust:'Exhaust',suspension:'Suspension',wheels:'Wheel finish',brakes:'Brakes',transmission:'Transmission'};
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const MAX_BACKUP_BYTES = 512 * 1024;
const cleanConfig = input => Object.fromEntries(Object.entries(CONFIG).map(([key,values]) => {
  const raw = isRecord(input) ? input[key] : undefined;
  const value = typeof raw === 'string' || typeof raw === 'number' ? String(raw) : '';
  return [key,values.includes(value) ? value : values[0]];
}));
let instanceNumber = 0;
const curriculumCache = new WeakMap();

export function createPersonalGarageBackup(state) {
  return {
    schema:'apex.personal-backup',
    version:3,
    exportedAt:new Date().toISOString(),
    favorites:[...(state.favorites || [])],
    recent:[...(state.recent || [])],
    builds:(state.builds || []).map(build => ({...build,config:{...build.config}})),
    progress:{...(state.progress || {})},
    academy:{...(state.academy || {})}
  };
}

export function validatePersonalGarageBackup(input, catalog) {
  if (!isRecord(input) || input.schema !== 'apex.personal-backup' || ![2,3].includes(input.version)) throw new Error('Unsupported backup format.');
  if (!Array.isArray(input.favorites) || !isRecord(input.progress) || !isRecord(input.academy) || input.academy.version !== 2) throw new Error('The backup is missing saved models or learning progress.');
  if (input.version === 3 && (!Array.isArray(input.recent) || !Array.isArray(input.builds))) throw new Error('The backup is missing garage data.');
  const known = new Set(catalog.map(model => model.id));
  const favorites = [...new Set(input.favorites.filter(id => typeof id === 'string' && known.has(id)))];
  const recent = [...new Set((input.recent || []).filter(id => typeof id === 'string' && known.has(id)))].slice(0,8);
  const progress = {};
  for (const lesson of PERSONAL_GARAGE_LESSONS) for (const level of LEVELS) {
    const key = `${lesson.id}:${level}`;
    if (input.progress[key] === true) progress[key] = true;
  }
  let builds = [];
  if (input.version === 3) {
    if (input.builds.length > 20) throw new Error('The backup contains more than 20 saved builds.');
    if (input.builds.length) {
      const validated = validateBuildImport(input.builds, catalog);
      const ids = new Set();
      builds = validated.map((build, index) => {
        const id = input.builds[index]?.id;
        if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(id) || ['__proto__','constructor','prototype'].includes(id) || ids.has(id)) throw new Error('A saved build has an invalid or duplicate identifier.');
        if(/[\u0000-\u001f\u007f]/.test(build.name))throw new Error('A saved build has an invalid name.');
        ids.add(id);
        return {...build,id};
      });
    }
  }
  return {favorites,recent,builds,progress,legacyProgress:progress,academy:restoreProgress(input.academy)};
}

function curriculumFor(catalog) {
  if (!curriculumCache.has(catalog)) {
    // The curriculum includes three documented model lessons even when this hub
    // receives a filtered model collection.
    const models = [...new Map([...allModels,...catalog].map(model => [model.id,model])).values()];
    curriculumCache.set(catalog,createCurriculum(academyLessons,academyReferenceData.sources,partCatalog,models,academyReferenceData.scenarios));
  }
  return curriculumCache.get(catalog);
}

/** Read local data without changing it. Unknown catalogue IDs and invalid progress do not count. */
export function readPersonalGarage(catalog, suppliedStorage) {
  const known = new Set(catalog.map(model => model.id)), errors = [];
  const buildModels = new Set(catalog.filter(model => !/electric|hybrid/i.test(`${model.powertrain || ''} ${model.hybridNote || ''}`) && Number.isFinite(Number(model.cylinders)) && Number(model.cylinders) > 0).map(model => model.id));
  let storage;
  try { storage = suppliedStorage ?? globalThis.localStorage; if (!storage || typeof storage.getItem !== 'function') throw new Error('Storage unavailable'); }
  catch { errors.push(...Object.values(KEYS)); }
  function read(key, fallback, validate) {
    if (!storage) return fallback;
    try {
      const raw = storage.getItem(key);
      if (raw === null) return fallback;
      if (typeof raw !== 'string' || raw.length > 512 * 1024) throw new Error('Invalid storage value');
      const parsed = JSON.parse(raw); if (!validate(parsed)) throw new Error('Invalid storage shape'); return parsed;
    } catch { errors.push(key); return fallback; }
  }
  const ids = values => [...new Set(values.filter(id => typeof id === 'string' && known.has(id)))];
  const favorites = ids(read(KEYS.favorites, [], Array.isArray));
  const recent = ids(read(KEYS.recent, [], Array.isArray)).slice(0,8);
  const seenBuilds = new Set();
  const builds = read(KEYS.builds, [], Array.isArray).filter(build => isRecord(build) && typeof build.id === 'string' && build.id.slice(0,80).trim() && typeof build.name === 'string' && typeof build.modelId === 'string' && buildModels.has(build.modelId))
    .slice(0,20).map(build => ({id:build.id.slice(0,80),modelId:build.modelId,name:build.name.slice(0,80),config:cleanConfig(build.config),savedAt:typeof build.savedAt === 'string' && Number.isFinite(Date.parse(build.savedAt)) ? build.savedAt : ''}))
    .filter(build => {if (seenBuilds.has(build.id)) return false; seenBuilds.add(build.id); return true;})
    .sort((a,b) => (Date.parse(b.savedAt) || 0) - (Date.parse(a.savedAt) || 0));
  const rawProgress = read(KEYS.progress, {}, isRecord), progress = {};
  for (const lesson of PERSONAL_GARAGE_LESSONS) for (const level of LEVELS) {
    const key = `${lesson.id}:${level}`; if (Object.hasOwn(rawProgress,key) && rawProgress[key] === true) progress[key] = true;
  }
  let next = null;
  for (const level of LEVELS) {const lesson = PERSONAL_GARAGE_LESSONS.find(item => !progress[`${item.id}:${level}`]); if (lesson) {next = {...lesson,level}; break;}}
  const {lessons,units} = curriculumFor(catalog), byLesson = new Map(lessons.map(lesson => [lesson.id,lesson]));
  const rawAcademy = read(KEYS.academy,null,value => isRecord(value) && value.version === 2);
  const academyState = rawAcademy ? restoreProgress(rawAcademy) : emptyProgress();
  // Count documented curriculum lessons, not arbitrary keys from browser storage.
  academyState.completed = Object.fromEntries(Object.entries(academyState.completed).filter(([id,value]) => {
    const documented = byLesson.has(id) || id.startsWith('explore-') && known.has(id.slice(8));
    return documented && isRecord(value) && (value.migrated === true && value.day === null && value.accuracy === null || typeof value.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.day) && Number.isFinite(Date.parse(value.day)) && Number.isFinite(value.accuracy) && value.accuracy >= 0 && value.accuracy <= 100);
  }));
  // Match the academy's migration: any previously passed difficulty completes
  // that legacy lesson once, without inventing XP or quiz accuracy.
  for (const lesson of academyLessons) if (LEVELS.some(level => progress[`${lesson.id}:${level}`]) && !academyState.completed[lesson.id]) {
    academyState.completed[lesson.id] = {day:null,accuracy:null,topic:byLesson.get(lesson.id).topic,migrated:true};
  }
  const ordered = units.flatMap(unit => unit.lessons.map(id => ({...byLesson.get(id),unitId:unit.id,category:unit.title}))).filter(lesson => lesson.id);
  const academy = {state:academyState,lessons:ordered,units,completed:lessons.filter(lesson => academyState.completed[lesson.id]).length,total:lessons.length,xp:academyState.xp,level:levelProgress(academyState.xp),next:ordered.find(lesson => !academyState.completed[lesson.id]) || null};
  return {favorites,recent,builds,progress,completed:Object.keys(progress).length,next,academy,errors:[...new Set(errors)]};
}

/** Native-dialog hub. Callbacks open existing model, garage, academy and comparison views. */
export function mountPersonalGarage({catalog = [], onModel, onBuild, onLesson, onCompare, container} = {}) {
  const styleURL = new URL('./personal-garage.css',import.meta.url).href;
  if (![...document.querySelectorAll('link[rel="stylesheet"]')].some(link => link.href === styleURL)) {
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = styleURL; document.head.append(link);
  }
  const uid = `pg-${++instanceNumber}`, events = new AbortController(), known = new Map(catalog.map(model => [model.id,model]));
  const modal = document.createElement(container ? 'section' : 'dialog'); modal.className = 'personal-garage'+(container ? ' pg-inline' : ''); modal.setAttribute('aria-label','My garage');
  modal.innerHTML = `<div class="pg-shell"><header class="pg-header"><div><span class="pg-eyebrow">YOUR CORNER OF APEX</span><h2>My garage<span>.</span></h2><p>The cars you keep. The ideas you build. What you learn next.</p></div><button type="button" class="pg-close" data-pg-action="close" aria-label="Close My garage"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header><div class="pg-overview" aria-label="Your garage summary"></div><div class="pg-tabs" role="tablist" aria-label="My garage sections"><button type="button" role="tab" id="${uid}-tab-models" aria-controls="${uid}-models" aria-selected="true" tabindex="0" data-pg-tab="models">Saved models <span data-pg-count="models"></span></button><button type="button" role="tab" id="${uid}-tab-builds" aria-controls="${uid}-builds" aria-selected="false" tabindex="-1" data-pg-tab="builds">Saved builds <span data-pg-count="builds"></span></button><button type="button" role="tab" id="${uid}-tab-learning" aria-controls="${uid}-learning" aria-selected="false" tabindex="-1" data-pg-tab="learning">Learning <span data-pg-count="learning"></span></button></div><div class="pg-content"><p class="pg-storage-note" hidden></p><section id="${uid}-models" role="tabpanel" aria-labelledby="${uid}-tab-models" data-pg-panel="models"></section><section id="${uid}-builds" role="tabpanel" aria-labelledby="${uid}-tab-builds" data-pg-panel="builds" hidden></section><section id="${uid}-learning" role="tabpanel" aria-labelledby="${uid}-tab-learning" data-pg-panel="learning" hidden></section><p class="pg-status" role="status" aria-live="polite"></p></div><footer class="pg-footer"><div><span class="pg-local-dot" aria-hidden="true"></span><p data-pg-account-storage></p><a href="/account" data-pg-account-link>Sign in to sync ?</a></div><div class="pg-backup-actions"><button type="button" data-pg-action="export">${t('Download garage backup')} <span aria-hidden="true">↗</span></button><button type="button" data-pg-action="import">${t('Import garage backup')}</button><input type="file" accept="application/json,.json" data-pg-import-file hidden></div></footer></div>`;
  (container || document.body).append(modal);
  const $ = selector => modal.querySelector(selector);
  let active = 'models', snapshot = readPersonalGarage(catalog), destroyed = false, refreshQueued = false, returnFocus = null;
  const compared = new Set(), downloads = new Map();
  function el(tag,className,text) {const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = String(text); return node;}
  function button(text,action,id,className = '') {const node = el('button',className,text); node.type = 'button'; node.dataset.pgAction = action; if (id !== undefined) node.dataset.pgId = id; return node;}
  function modelLabel(model) {return `${model.name} · ${model.generation?.split(' / ').at(-1) || model.code || ''}`;}
  function photo(model) {
    const wrap = el('div','pg-model-image'); const missing = el('span','pg-photo-missing','Photo unavailable'); wrap.append(missing);
    try {const url = new URL(model.car,document.baseURI); if (typeof model.car === 'string' && /^https?:$/.test(url.protocol)) {const img = el('img'); img.src = url.href; img.alt = model.name; img.loading = 'lazy'; img.decoding = 'async'; wrap.append(img); missing.hidden = true;}}
    catch { /* A missing source is displayed explicitly. */ }
    return wrap;
  }
  function emptyState(number,title,text,linkText,href) {
    const wrap = el('div','pg-empty'); wrap.append(el('span','pg-empty-number',number),el('h3','',title),el('p','',text));
    const link = el('a','pg-primary',linkText); link.href = href; link.dataset.pgNavigate = ''; wrap.append(link); return wrap;
  }
  function selectTab(tab,focus = false) {
    if (!['models','builds','learning'].includes(tab)) return;
    active = tab;
    for (const item of modal.querySelectorAll('[data-pg-tab]')) {const selected = item.dataset.pgTab === active; item.setAttribute('aria-selected',String(selected)); item.tabIndex = selected ? 0 : -1; if (selected && focus) item.focus();}
    for (const panel of modal.querySelectorAll('[data-pg-panel]')) panel.hidden = panel.dataset.pgPanel !== active;
  }
  function compareBar() {
    const bar = el('div','pg-compare-bar'), copy = el('div'); copy.append(el('strong','',`${compared.size} selected`),el('span','','Choose 2–3 saved BMWs to compare.'));
    const action = button('Compare selected →','compare',undefined,'pg-primary'); action.disabled = compared.size < 2 || typeof onCompare !== 'function'; bar.append(copy,action); return bar;
  }
  function renderModels() {
    const panel = $('[data-pg-panel="models"]'); panel.replaceChildren();
    if (snapshot.favorites.length) {
      const heading = el('div','pg-section-heading'); heading.append(el('h3','','Your shortlist'),el('p','','Pick a few. Look a little closer.')); panel.append(heading);
      const grid = el('div','pg-model-grid');
      for (const id of snapshot.favorites) {
        const model = known.get(id), card = el('article','pg-model-card'), imageButton = button('','model',id,'pg-photo-open'); imageButton.setAttribute('aria-label',`Open ${modelLabel(model)}`); imageButton.append(photo(model));
        const body = el('div','pg-model-body'), heading = el('h4','',model.name), details = el('p','pg-model-spec',`${model.generation?.split(' / ').at(-1) || model.code} · ${model.power} ${model.powerUnit}`);
        const actions = el('div','pg-model-actions'); actions.append(button('Open model ↗','model',id,'pg-text-button'),button('Remove','remove-favorite',id,'pg-text-button pg-remove'));
        const label = el('label','pg-compare-choice'), input = el('input'); input.type = 'checkbox'; input.dataset.pgCompare = id; input.checked = compared.has(id); label.append(input,el('span','','Compare this model')); body.append(heading,details,actions,label); card.append(imageButton,body); grid.append(card);
      }
      panel.append(grid,compareBar());
    } else panel.append(emptyState('01','Make room for your favorites.','Save a BMW from its model card or detail page. Your shortlist will be waiting here.','Explore the collection ↗','/models'));
    if (snapshot.recent.length) {
      const section = el('section','pg-recent'), heading = el('div','pg-section-heading'); heading.append(el('h3','','Recently viewed'),el('p','','Find your way back.')); section.append(heading);
      const list = el('div','pg-recent-list');
      for (const id of snapshot.recent) {
        const model = known.get(id), row = el('article','pg-recent-card'), open = button('','model',id,'pg-recent-open');
        const copy = el('span'); copy.append(el('strong','',model.name),el('small','',model.generation?.split(' / ').at(-1) || model.code)); open.append(photo(model),copy,el('span','pg-recent-arrow','↗')); row.append(open);
        const save = button(snapshot.favorites.includes(id) ? 'Saved' : 'Save','save-favorite',id,'pg-recent-save'); save.disabled = snapshot.favorites.includes(id); save.setAttribute('aria-label',`${save.textContent} ${model.name}`); row.append(save); list.append(row);
      }
      section.append(list); panel.append(section);
    }
  }
  function renderBuilds() {
    const panel = $('[data-pg-panel="builds"]'); panel.replaceChildren();
    if (!snapshot.builds.length) {panel.append(emptyState('02','Give an idea some wheels.','Choose a BMW in the tuning garage, explore a configuration and save a named snapshot.','Open the tuning garage ↗','/tuning-garage')); return;}
    const heading = el('div','pg-section-heading'); heading.append(el('h3','','Your saved concepts'),el('p','','Resume a snapshot in the tuning garage. Performance changes remain hypothetical.')); panel.append(heading);
    const list = el('div','pg-build-list');
    for (const build of snapshot.builds) {
      const model = known.get(build.modelId), card = el('article','pg-build-card'), body = el('div','pg-build-copy'), title = el('h4','',build.name.trim() || 'Untitled build');
      body.append(title,el('p','pg-build-model',modelLabel(model)));
      const changed = Object.keys(CONFIG).filter(key => build.config[key] !== CONFIG[key][0]), chips = el('div','pg-build-chips');
      for (const key of changed.slice(0,4)) chips.append(el('span','',CONFIG_LABELS[key]));
      if (changed.length > 4) chips.append(el('span','',`+${changed.length-4} more`));
      if (!changed.length) chips.append(el('span','','Factory configuration snapshot')); body.append(chips);
      let savedText = 'Saved date unavailable';
      if (build.savedAt) {try {savedText = `Saved ${new Intl.DateTimeFormat(undefined,{year:'numeric',month:'short',day:'numeric'}).format(new Date(build.savedAt))}`;} catch { /* Leave the date unknown. */ }}
      body.append(el('small','pg-saved-date',savedText));
      const actions = el('div','pg-build-actions'), resume = button('Resume build ↗','build',build.id,'pg-primary'); resume.disabled = typeof onBuild !== 'function'; actions.append(resume,button('View model','model',model.id,'pg-text-button'));
      card.append(photo(model),body,actions); list.append(card);
    }
    panel.append(list);
  }
  function renderLearning() {
    const panel = $('[data-pg-panel="learning"]'); panel.replaceChildren();
    const academy = snapshot.academy;
    const summary = el('div','pg-learning-summary'), copy = el('div'); copy.append(el('span','pg-eyebrow','UNDERSTANDING, ONE SYSTEM AT A TIME'),el('h3','',`${academy.completed} of ${academy.total} lessons complete`),el('p','',`${academy.xp.toLocaleString()} XP earned · Level ${academy.level.level}: ${academy.level.title}.`));
    const progress = el('progress'); progress.max = academy.total; progress.value = academy.completed; progress.setAttribute('aria-label',`${academy.completed} of ${academy.total} academy lessons completed`); summary.append(copy,progress); panel.append(summary);
    const nextCard = el('div','pg-next-lesson');
    if (academy.next) {
      const text = el('div'); text.append(el('span','pg-eyebrow','YOUR NEXT LESSON'),el('h4','',academy.next.title),el('p','',`${academy.next.category} · ${academy.next.duration}${academy.next.boss ? ' · Checkpoint' : ''}`));
      const resume = button(academy.completed ? 'Continue learning ↗' : 'Start learning ↗','lesson',academy.next.id,'pg-primary'); nextCard.append(text,resume);
    } else {
      const text = el('div'); text.append(el('span','pg-eyebrow',`ALL ${academy.total} COMPLETE`),el('h4','','Keep your curiosity in gear.'),el('p','','You have completed every curriculum lesson. Revisit a lesson below, or practice in the academy.')); nextCard.append(text);
      const practice = el('a','pg-primary','Open the academy ↗'); practice.href = '/learn'; nextCard.append(practice);
    }
    panel.append(nextCard);
    let index = 0;
    for (const unit of academy.units) {
      const section = el('section','pg-learning-unit'), heading = el('div','pg-section-heading');
      const completed = unit.lessons.filter(id => academy.state.completed[id]).length;
      const title = el('h3','',unit.title); title.id = `${uid}-unit-${unit.id}`; section.setAttribute('aria-labelledby',title.id);
      heading.append(title,el('p','',`${completed} of ${unit.lessons.length} complete · ${unit.subtitle}`)); section.append(heading);
      const list = el('div','pg-lesson-list');
      for (const lesson of academy.lessons.filter(item => item.unitId === unit.id)) {
        index++;
        const done = !!academy.state.completed[lesson.id], migrated = academy.state.completed[lesson.id]?.migrated;
        const card = el('article','pg-lesson-card'), copy = el('div','pg-lesson-copy'); copy.append(el('span','pg-lesson-number',String(index).padStart(2,'0')),el('h4','',lesson.title),el('p','',`${lesson.duration}${lesson.boss ? ' · Checkpoint' : ''}${done ? migrated ? ' · Previously completed' : ' · Completed' : ''}`));
        const actions = el('div','pg-lesson-levels'), action = button(done ? '✓ Review lesson' : 'Open lesson ↗','lesson',lesson.id,done ? 'is-complete' : '');
        action.setAttribute('aria-label',`${done ? 'Review completed lesson' : 'Open lesson'}: ${lesson.title}`); actions.append(action); card.append(copy,actions); list.append(card);
      }
      section.append(list); panel.append(section);
    }
  }
  function refresh() {
    if (destroyed) return;
    snapshot = readPersonalGarage(catalog);
    for (const id of compared) if (!snapshot.favorites.includes(id)) compared.delete(id);
    const overview = $('.pg-overview'); overview.replaceChildren();
    for (const [value,label] of [[snapshot.favorites.length,'saved models'],[snapshot.builds.length,'saved builds'],[`${snapshot.academy.completed}/${snapshot.academy.total}`,`lessons complete · ${snapshot.academy.xp.toLocaleString()} XP`]]) {const item = el('div'); item.append(el('strong','',value),el('span','',label)); overview.append(item);}
    $('[data-pg-count="models"]').textContent = snapshot.favorites.length; $('[data-pg-count="builds"]').textContent = snapshot.builds.length; $('[data-pg-count="learning"]').textContent = `${snapshot.academy.completed}/${snapshot.academy.total}`;
    const note = $('.pg-storage-note'); note.hidden = !snapshot.errors.length; note.textContent = 'Some browser data could not be read. Your stored data has not been changed.';
    $('[data-pg-action="export"]').disabled = snapshot.errors.some(key => [KEYS.favorites,KEYS.recent,KEYS.builds,KEYS.progress,KEYS.academy].includes(key));
    renderModels(); renderBuilds(); renderLearning(); selectTab(active);
  }
  function open(tab) {
    if (destroyed) return false;
    if (!(container || modal.open)) returnFocus = document.activeElement;
    refresh(); selectTab(tab || active);
    if (!(container || modal.open)) if (!container) modal.showModal(); $(`[data-pg-tab="${active}"]`).focus(); return true;
  }
  function status(message) {$('.pg-status').textContent = message;}
  function changeFavorite(id,save) {
    if (!known.has(id)) return;
    try {
      const raw = localStorage.getItem(KEYS.favorites), values = raw === null ? [] : JSON.parse(raw);
      if (!Array.isArray(values) || (raw?.length || 0) > 512*1024) throw new Error('Invalid favorites');
      // Change only the requested ID; retain all other stored entries.
      const updated = save ? values.includes(id) ? values : [id,...values] : values.filter(value => value !== id);
      localStorage.setItem(KEYS.favorites,JSON.stringify(updated));
      refresh(); status(`${known.get(id).name} ${save ? 'saved to your garage.' : 'removed from saved models.'}`);
      const detail = {key:KEYS.favorites,source:uid};
      window.dispatchEvent(new CustomEvent('apex:favoriteschange',{detail})); window.dispatchEvent(new CustomEvent('apex:localchange',{detail}));
      (save ? modal.querySelector(`[data-pg-action="save-favorite"][data-pg-id="${CSS.escape(id)}"]`) : $('[data-pg-tab="models"]'))?.focus({preventScroll:true});
    } catch {status('Favorites could not be saved. Existing browser data has been preserved.');}
  }
  async function navigate(callback,args,fallback) {
    const tab = active; if (!container) modal.close();
    try {
      if (typeof callback === 'function') {if (await callback(...args) === false) throw new Error('View unavailable');}
      else if (fallback) window.location.assign(fallback);
      else throw new Error('View unavailable');
    } catch {if (!destroyed) {open(tab); status('This item could not be opened. Please try again.');}}
  }
  function exportBackup() {
    refresh(); if ($('[data-pg-action="export"]').disabled) {status(t('Some current garage data could not be read. A backup was not created.')); return;}
    let url, anchor;
    try {
      const payload = createPersonalGarageBackup({...snapshot,academy:snapshot.academy.state});
      url = URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})); anchor = el('a'); anchor.href = url; anchor.download = 'apex-garage-backup.json'; document.body.append(anchor); anchor.click();
      downloads.set(url,setTimeout(() => {URL.revokeObjectURL(url); downloads.delete(url);},1000));
      status(t('A backup was downloaded with saved models, builds and learning progress.'));
    } catch {
      if (url) URL.revokeObjectURL(url);
      status(t('The backup could not be downloaded. Your browser data has not been changed.'));
    } finally {anchor?.remove();}
  }
  async function importBackupFile(file) {
    const input = $('[data-pg-import-file]');
    if (!file) {status(t('Choose a JSON backup file to import.')); return;}
    if (file.size > MAX_BACKUP_BYTES) {status(t('This file is larger than 512 KB. Nothing was changed.')); input.value = ''; return;}
    if (snapshot.errors.some(key => [KEYS.favorites,KEYS.recent,KEYS.builds,KEYS.progress,KEYS.academy].includes(key))) {
      status(t('Some current garage data could not be read. Import was cancelled to protect it.'));
      input.value = '';
      return;
    }
    let text;
    try {text = await file.text();}
    catch {status(t('The file could not be read. Your garage has not been changed.')); input.value = ''; return;}
    try {
      if (new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES) throw new Error('The backup is too large.');
      const incoming = validatePersonalGarageBackup(JSON.parse(text.replace(/^\uFEFF/,'')),catalog);
      const current = {favorites:snapshot.favorites,builds:snapshot.builds,academy:snapshot.academy.state,legacyProgress:snapshot.progress};
      const uniqueBuilds = new Map([...current.builds,...incoming.builds].map(build => [build.id,build]));
      if (uniqueBuilds.size > 20) {status(t('The backup would exceed the 20 saved-build limit. Nothing was changed.')); return;}
      const merged = mergeGuestGarage(current,incoming);
      const recent = [...new Set([...incoming.recent,...snapshot.recent])].slice(0,8);
      const updates = new Map([
        [KEYS.favorites,merged.favorites],
        [KEYS.recent,recent],
        [KEYS.builds,merged.builds],
        [KEYS.progress,merged.legacyProgress],
        [KEYS.academy,merged.academy]
      ]);
      const storage = globalThis.localStorage, previous = new Map(), written = [];
      try {
        for (const [key,value] of updates) {
          previous.set(key,storage.getItem(key));
          storage.setItem(key,JSON.stringify(value));
          written.push(key);
        }
      } catch {
        let rollbackFailed = false;
        for (const key of written.reverse()) {
          try {
            const value = previous.get(key);
            if (value === null) storage.removeItem(key);
            else storage.setItem(key,value);
          } catch {rollbackFailed = true;}
        }
        status(t(rollbackFailed
          ? 'The backup could not be saved, and rollback was incomplete. Check your garage data before continuing.'
          : 'The backup could not be saved safely. Existing data has been preserved where storage allowed.'));
        return;
      }
      window.dispatchEvent(new CustomEvent('apex:localchange',{detail:{keys:[...updates.keys()],source:uid}}));
      refresh();
      status(t('Garage backup imported. Existing data was merged, not replaced.'));
    } catch (error) {
      status(t(error?.message === 'The backup is too large.'
        ? 'This file is larger than 512 KB. Nothing was changed.'
        : 'This is not a supported APEX garage backup. Nothing was changed.'));
    } finally {input.value = '';}
  }
  modal.addEventListener('click',event => {
    const tab = event.target.closest('[data-pg-tab]'); if (tab) {selectTab(tab.dataset.pgTab,true); return;}
    const target = event.target.closest('[data-pg-action]'), action = target?.dataset.pgAction, id = target?.dataset.pgId;
    if (action === 'close') if (!container) modal.close();
    if (action === 'model' && known.has(id)) void navigate(onModel,[id],`/?model=${encodeURIComponent(id)}`);
    if (action === 'remove-favorite') changeFavorite(id,false);
    if (action === 'save-favorite') changeFavorite(id,true);
    if (action === 'build') {const build = snapshot.builds.find(item => item.id === id); if (build) void navigate(onBuild,[id,build.modelId]);}
    if (action === 'lesson') void navigate(onLesson,[id,target.dataset.pgLevel],'/learn?lesson='+encodeURIComponent(id));
    if (action === 'compare' && compared.size >= 2 && compared.size <= 3) void navigate(onCompare,[[...compared]]);
    if (action === 'export') exportBackup();
    if (action === 'import') $('[data-pg-import-file]').click();
    if (event.target.closest('[data-pg-navigate]')) if (!container) modal.close();
    if (event.target === modal) {const rect = modal.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) if (!container) modal.close();}
  },{signal:events.signal});
  modal.addEventListener('change',event => {
    if (event.target.matches('[data-pg-import-file]')) {void importBackupFile(event.target.files?.[0]); return;}
    const id = event.target.dataset.pgCompare; if (!id || !snapshot.favorites.includes(id)) return;
    if (event.target.checked) {if (compared.size >= 3) {event.target.checked = false; status('Choose up to three saved models for one comparison.'); return;} compared.add(id);} else compared.delete(id);
    const bar = $('.pg-compare-bar'); if (bar) bar.replaceWith(compareBar()); status(`${compared.size} model${compared.size===1?'':'s'} selected for comparison.`);
  },{signal:events.signal});
  modal.addEventListener('keydown',event => {
    const tab = event.target.closest('[data-pg-tab]'); if (!tab || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault(); const tabs = ['models','builds','learning'], current = tabs.indexOf(active);
    selectTab(event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs.at(-1) : tabs[(current+(event.key==='ArrowRight'?1:2))%3],true);
  },{signal:events.signal});
  modal.addEventListener('error',event => {if (event.target.matches('.pg-model-image img')) {event.target.hidden = true; event.target.parentElement.querySelector('.pg-photo-missing').hidden = false;}},{capture:true,signal:events.signal});
  modal.addEventListener('close',() => {if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});},{signal:events.signal});
  function storageChanged(event) {
    if (event.detail?.source === uid) return;
    const key = event.key ?? event.detail?.key;
    if (key && !Object.values(KEYS).includes(key)) return;
    if (!(container || modal.open) || refreshQueued) return;
    refreshQueued = true; queueMicrotask(() => {refreshQueued = false; if (!destroyed && (container || modal.open)) refresh();});
  }
  for (const event of ['storage','apex:localchange','apex:favoriteschange','apex:garagechange','apex:progress']) window.addEventListener(event,storageChanged,{signal:events.signal});
  function updateAccountCopy(accountState) {
    $('[data-pg-account-storage]').textContent = accountStorageMessage(accountState);
    const link = $('[data-pg-account-link]'); link.textContent = accountState.user ? 'Account & sync status ?' : 'Sign in to sync ?';
  }
  const unsubscribeAccount = account.subscribe(updateAccountCopy);
  refresh();
  return {open,refresh,destroy() {if (destroyed) return; destroyed = true; unsubscribeAccount(); if ((container || modal.open)) if (!container) modal.close(); events.abort(); for (const [url,timer] of downloads) {clearTimeout(timer); URL.revokeObjectURL(url);} downloads.clear(); modal.remove();}};
}
