import assert from 'node:assert/strict';
import {academyLessons, academyReferenceData} from '../public/academy.js';
import {createCurriculum} from '../public/academy-content.js';
import {partCatalog} from '../public/parts.js';
import {allModels} from '../public/catalog.js';
import {learningGuideTranslations, learningTrackIds, learningGuideIds, learningTrack, lessonGuide} from '../public/motron-learning-guides.js';
import {registerTranslations, hasTranslation, setLanguage, t} from '../public/preferences.js';

const {lessons, units} = createCurriculum(academyLessons, academyReferenceData.sources, partCatalog, allModels, academyReferenceData.scenarios);
const assessmentSignature = JSON.stringify(lessons.map(({id, questions}) => ({id, questions})));
const strings = value => typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(strings) : Object.values(value).flatMap(strings);
const english = new Set(learningGuideTranslations.map(([en]) => en));
assert.deepEqual(learningTrackIds.slice().sort(), units.map(unit => unit.id).sort(), 'Every existing chapter needs a purposeful summary.');
assert.deepEqual(learningGuideIds.slice().sort(), lessons.map(lesson => lesson.id).sort(), 'Every published activity needs individual coaching, including photos, puzzles and simulations.');
assert.equal(new Set(learningGuideIds.map(id => lessonGuide(id).scenario.prompt)).size, lessons.length, 'Every published activity needs its own contextual self-check.');
assert.equal(lessonGuide('unknown-dynamic-lesson'), null, 'An unknown lesson must not receive generic filler.');
assert.equal(learningTrack(null), null);
assert.equal(lessonGuide({id:'toString'}), null, 'Object prototype names are not lesson IDs.');
assert.equal(learningTrack('__proto__'), null);
for (const unit of units) {
  const track = learningTrack(unit);
  assert.equal(track, learningTrack(unit.id), 'UI may pass a chapter object or its stable ID.');
  assert.equal(track.focus.length, 3);
  assert.ok(track.outcome.length > 45, 'A chapter must explain what the learner can do: ' + unit.id);
  for (const value of strings(track)) assert.ok(english.has(value), 'Missing chapter translation: ' + value);
}
for (const id of learningGuideIds) {
  const lesson = lessons.find(item => item.id === id), guide = lessonGuide(id);
  assert.ok(lesson, 'Every authored coaching item belongs to a published lesson: ' + id);
  assert.equal(guide, lessonGuide(lesson));
  assert.ok(lesson.sources.length && lesson.sources.every(source => /^https:\/\//.test(source.url)), 'Coaching retains the lesson’s existing primary references: ' + id);
  assert.ok(guide.hook.length > 30 && guide.concept.length > 50, 'Coaching needs an individualized hook and concept: ' + id);
  assert.ok(guide.scenario.prompt.length > 80 && guide.scenario.reasoning.length > 90, 'A self-check needs enough context and a worked explanation: ' + id);
  assert.equal(guide.takeaways.length, 2, 'Keep each lesson’s recap short: ' + id);
  for (const value of strings(guide)) assert.ok(english.has(value), 'Missing coaching translation: ' + value);
}
for (const row of learningGuideTranslations) {
  assert.equal(row.length, 3, 'Every English key needs authored Georgian and Russian.');
  assert.ok(row.every(value => typeof value === 'string' && value.trim().length), 'Translation fields cannot be empty.');
  assert.match(row[1], /[\u10a0-\u10ff]/u, 'Georgian coaching must contain Georgian prose: ' + row[0]);
  assert.match(row[2], /[\u0400-\u04ff]/u, 'Russian coaching must contain Cyrillic prose: ' + row[0]);
}
registerTranslations(learningGuideTranslations);
for (const language of ['ka', 'ru']) {
  setLanguage(language, false);
  for (const [en, ka, ru] of learningGuideTranslations) {
    assert.ok(hasTranslation(en, language), 'Coaching translation must be registered: ' + en);
    assert.equal(t(en), language === 'ka' ? ka : ru, 'Runtime must render authored coaching in ' + language);
  }
}
setLanguage('en', false);
assert.equal(JSON.stringify(lessons.map(({id, questions}) => ({id, questions}))), assessmentSignature, 'Reading and translating coaching must preserve every question and answer.');
console.log(`PASS Motron coaching: ${learningGuideIds.length} individualized lesson guides, ${learningTrackIds.length} chapter summaries, ${learningGuideTranslations.length} EN/KA/RU entries, lesson source links and unchanged assessment data.`);
