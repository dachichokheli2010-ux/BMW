import assert from 'node:assert/strict';
import {academyLessons,academyReferenceData} from '../public/academy.js';
import {createCurriculum} from '../public/academy-content.js';
import {allModels} from '../public/catalog.js';
import {partCatalog} from '../public/parts.js';
import {lessonTeaching} from '../public/academy-teaching.js';
import {registerAcademyTranslations,academyTranslationCoverage} from '../public/academy-translations.js';

const create=()=>createCurriculum(academyLessons,academyReferenceData.sources,partCatalog,allModels,academyReferenceData.scenarios);
const {lessons}=create(),authored=lessons.flatMap(lesson=>lesson.questions).filter(question=>question.assessmentVersion===2);
assert.ok(authored.length>=70,'The published curriculum must use the authored application questions, not an unused question bank.');
assert.deepEqual(create().lessons,lessons,'Building another curriculum must not rotate shared answer arrays or append repeated source references.');
const positions=[0,1,2].map(position=>authored.filter(question=>question.correct===position).length);
assert.ok(Math.max(...positions)-Math.min(...positions)<=8,'Authored answer positions must remain balanced.');
for(const question of authored){
  assert.equal(new Set(question.answers).size,question.answers.length,'Answer alternatives must be distinct: '+question.id);
  assert.ok(question.explanation.length>45,'Feedback should teach reasoning: '+question.id);
}
for(const part of partCatalog){
  const lesson=lessons.find(lesson=>lesson.id==='part-'+part.id);
  assert.equal(lesson.questions.filter(question=>question.assessmentVersion===2).length,2,'Each part needs two authored applications beyond photo identification.');
}
registerAcademyTranslations();
const study=lessons.flatMap(lesson=>{const guide=lessonTeaching(lesson,allModels);return [guide.keyIdea,guide.workedExample].filter(Boolean);});
assert.deepEqual(academyTranslationCoverage(study).missing,[],'Study cards must translate with the rest of the course.');
console.log(`PASS Academy teaching: ${authored.length} published applied questions, balanced answers (${positions.join('/')}), distinct part scenarios and translated study cards.`);
