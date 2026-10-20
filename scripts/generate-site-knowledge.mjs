import fs from 'node:fs';
import {allModels} from '../public/catalog.js';
import {glossaryEntries} from '../public/academy-glossary.js';
import {academyLessons,academyReferenceData} from '../public/academy.js';

const models=allModels.map(car=>({id:car.id,name:car.name,generation:car.generation,engine:car.code,layout:car.layout,powertrain:car.powertrain,scope:car.verified?.specification||car.market,description:car.description,power:car.power,powerUnit:car.powerUnit,year:car.verified?.modelYear||null,sources:[{label:'Documented BMW application',url:car.source}]}));
const terms=glossaryEntries.map(term=>({id:term.id,aliases:term.aliases,i18n:term.i18n,sources:term.sources}));
const lessons=academyLessons.map(lesson=>({id:lesson.id,title:lesson.title,summary:lesson.summary,content:lesson.content,sources:[academyReferenceData.sources[lesson.source],lesson.extraSource].filter(Boolean).map(source=>Array.isArray(source)?{label:source[0],url:source[1]}:source)}));
fs.writeFileSync('server/site-knowledge.js','// Generated from the published catalogue, glossary and lessons.\nexport const siteKnowledge='+JSON.stringify({models,terms,lessons},null,2)+';\n');
console.log(`Prepared site helper: ${models.length} applications, ${terms.length} terms, ${lessons.length} lessons.`);
