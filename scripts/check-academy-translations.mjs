import assert from 'node:assert/strict';
import {academyLessons, academyReferenceData, engineCodeEntries} from '../public/academy.js';
import {createCurriculum} from '../public/academy-content.js';
import {partCatalog} from '../public/parts.js';
import {allModels} from '../public/catalog.js';
import {registerAcademyTranslations, academyTranslationCoverage} from '../public/academy-translations.js';
import {engineLabTranslations,registerEngineLabTranslations} from '../public/engine-lab-translations.js';
import {registerTranslations, setLanguage, translateText, translatePage, t, hasTranslation} from '../public/preferences.js';
import {generationGuideSources} from '../public/generation-guide-sources.js';
import {retentionTranslationEntries} from '../public/retention-translations.js';

const curriculum = createCurriculum(academyLessons, academyReferenceData.sources, partCatalog, allModels, academyReferenceData.scenarios);
const signature = JSON.stringify(curriculum.lessons.map(lesson => ({id: lesson.id, questions: lesson.questions.map(question => ({id: question.id, correct: question.correct, answers: question.answers, pairs: question.pairs, items: question.items}))})));
registerAcademyTranslations();
registerAcademyTranslations();
registerEngineLabTranslations();
assert.equal(JSON.stringify(curriculum.lessons.map(lesson => ({id: lesson.id, questions: lesson.questions.map(question => ({id: question.id, correct: question.correct, answers: question.answers, pairs: question.pairs, items: question.items}))}))), signature, 'Language registration must never change quiz identity or scoring.');

const fields = new Set(['title', 'subtitle', 'intro', 'detail', 'steps', 'questions', 'prompt', 'answers', 'explanation', 'pairs', 'items', 'text', 'hint', 'contextTitle', 'contextIntro', 'contextClues', 'tag', 'name', 'description', 'example', 'connections']);
const values = [];
function collect(value) {
  if (typeof value === 'string') { if (/[a-z]/i.test(value)) values.push(value); }
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) if (fields.has(key)) collect(child);
}
collect(curriculum.lessons); collect(curriculum.units); collect(engineCodeEntries); collect(academyReferenceData.timeline); collect(academyReferenceData.mTimeline);
assert.ok(academyReferenceData.mTimeline.length > 0 && academyReferenceData.mTimeline.every(entry => /^https:\/\//.test(entry.source?.[1] || '')), 'Every BMW M history milestone must include an HTTPS source.');

// These are factory names, identifiers and unit symbols; translating them would
// change the answer. This whitelist deliberately excludes ordinary English prose.
const factoryNames = new Set(['BMW M3 · F80', 'BMW M5 · F10', 'BMW M3 Competition · G80', '2011–2012 BMW 335is', '2011 BMW 135i', '2016 BMW 340i / 740i', 'BMW M5 F10', 'S63 · BMW M V8', 'M xDrive']);
const isIdentifier = value => factoryNames.has(value) || /^(?:[NBSMFG]\d{1,3}|V8|RPM)$/.test(value) || /^\d[\d,.]* (?:Nm|RPM|rpm)$/.test(value);
const teachingValues = values.filter(value => !isIdentifier(value));
const coverage = academyTranslationCoverage(teachingValues);
assert.deepEqual(coverage.missing, [], 'Every visible curriculum teaching string needs Georgian and Russian copy.');

const uiExamples = [
  'Glossary', 'Learning path', 'Puzzles & practice', 'BMW M recognition',
  'Power-to-weight', 'Best in comparison',
  'QUESTION 2 OF 4', 'UNIT 3 / START HERE', '3 min / INTERACTIVE',
  'Level 5 · Car Enthusiast', '135 XP to level 7', '7 day streak',
  '4 / 12 lessons complete · first-attempt accuracy',
  'Remove step 2: Combustion pressure', 'Now choose the role for Power.',
  'The four-stroke engine, complete the previous lesson to unlock',
  'Connection made.', 'A useful clue for your next try.', 'Power stroke',
  '3 : 1 • ideal torque × 3.00', 'Start lesson →',
  'BASICS / GUIDED LESSON', 'Rear-wheel drive and all-wheel drive comparison',
  'Simplified power paths: rear-wheel drive sends drive to the rear axle; all-wheel drive can send drive to both axles. Exact vehicle hardware varies.',
  'Engine + gearbox', 'Rear axle', 'Front axle', 'Simplified power paths',
  'Areas to check in a BMW M model',
  'BMW M models differ. The cards group areas documented for the linked F10 M5 and M3 CS examples; they are not a shared-parts checklist.',
  'Powertrain', 'Engine and output', 'Drivetrain', 'Drive to the wheels', 'Chassis',
  'Suspension and setup', 'Brakes', 'Model-specific braking',
  'Examples vary by exact model and generation',
];
const guideUIExamples = [
  'Buyer guides', 'Research a BMW generation before you buy', 'Generation buyer guides',
  'BUY WITH CONTEXT', 'Explore catalog-backed BMW generation pages, sourced pre-purchase checks, and import guidance for buyers in Georgia.',
  'CHASSIS-BY-CHASSIS RESEARCH', 'Opening generation buyer guides…',
  'Motron collection examples are not a complete production or market list. Engine and model details link to their factory sources.',
  'Search chassis, model or engine', 'Try E46, M3 or S54', 'Showing {count} generations',
  'No matching generations. Try a chassis or engine code.', 'BMW GENERATION', '{count} catalog examples',
  'All buyer guides', 'BMW GENERATION BUYER GUIDE', 'A source-linked starting point for researching this generation.',
  'OVERVIEW', 'ENGINES', 'RESEARCH STATUS', 'BEFORE YOU BUY', 'MAINTENANCE', 'GEORGIA BUYER NOTES',
  'Catalog overview', 'This page groups the models currently represented in Motron under this chassis code. It does not claim to list every engine, trim, year or market variant.',
  'Engines represented in this catalog', 'These engine codes are only the sourced examples linked above, not a complete list of engines offered for this generation.',
  'Known issues', 'Not available: no generation-specific issue claims are included without a verified source.',
  'Pre-purchase checks', 'Typical maintenance items', 'Not available: consult the service schedule for the exact vehicle, market and VIN.',
  'If you are buying in Georgia', 'Cars imported from the US', 'Cars imported from Europe', 'Clearance and inspection in Georgia',
  'Other generation guides', 'Explore another chassis', 'Browse all', 'Source for: {claim}', 'Factory source',
  'Factory source for {model}', 'BMW {chassis} buyer guide · Motron', 'No catalog generation matches {chassis}.',
];
const generationGuideClaims = Object.values(generationGuideSources).flat().map(item=>item.claim);
const allUIExamples = [...uiExamples,...guideUIExamples,...generationGuideClaims];
allUIExamples.push(...retentionTranslationEntries.map(([english])=>english));
assert.deepEqual(academyTranslationCoverage(allUIExamples).missing, []);
assert.deepEqual(academyTranslationCoverage(engineLabTranslations.map(([english])=>english)).missing,[]);
for (const locale of ['ka', 'ru']) {
  setLanguage(locale, false);
  for (const value of teachingValues) assert.notEqual(translateText(value), value, `Untranslated ${locale}: ${value}`);
  for (const value of allUIExamples) assert.notEqual(translateText(value), value, `Untranslated interface ${locale}: ${value}`);
  for (const [value] of engineLabTranslations) assert.notEqual(translateText(value), value, `Untranslated engine lab ${locale}: ${value}`);
}
assert.equal(hasTranslation('A made-up lesson that has no translation.', 'ka'), false, 'Unknown prose must not get a fake fallback.');
assert.equal(hasTranslation('Learning path', 'fr'), false, 'Unsupported locales are not reported as translated.');

// A tiny DOM fixture exercises the real text-node source tracking. This catches
// a regression where a component renders an already localized t(template, vars)
// value and later language switches cannot recover its original variables.
const previousDocument = globalThis.document;
const previousWindow = globalThis.window;
try {
  const body = {nodeType: 1, closest: () => null, hasAttribute: () => false, childNodes: []};
  const text = {nodeType: 3, parentElement: body, textContent: ''}; body.childNodes = [text];
  globalThis.document = {body, documentElement: {lang: 'en'}, getElementById: () => null};
  globalThis.window = {dispatchEvent: () => {}};
  registerTranslations([['Unlocked on {day} at level {level}', 'გაიხსნა {day}, დონე {level}', 'На уровне {level}, открыто {day}']]);
  setLanguage('ka', false);
  text.textContent = t('Unlocked on {day} at level {level}', {day: '2026-10-19', level: 12});
  translatePage();
  setLanguage('ru', false);
  assert.equal(text.textContent, 'На уровне 12, открыто 2026-10-19');
  setLanguage('en', false);
  assert.equal(text.textContent, 'Unlocked on 2026-10-19 at level 12');
  setLanguage('ka', false);
  assert.equal(text.textContent, 'გაიხსნა 2026-10-19, დონე 12');
} finally {
  if (previousDocument === undefined) delete globalThis.document; else globalThis.document = previousDocument;
  if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
  setLanguage('en', false);
}

console.log(`Academy translations: ${coverage.translated}/${coverage.total} teaching strings, ${curriculum.lessons.length} lessons, ${curriculum.lessons.flatMap(lesson => lesson.questions).length} questions; Georgian/Russian templates and language switching pass.`);
