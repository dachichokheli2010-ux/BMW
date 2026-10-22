import fs from 'node:fs';
import {allModels} from '../public/catalog.js';
import {engineRecords} from '../public/explorer-data.js';
import {encyclopediaParts} from '../public/parts-encyclopedia-data.js';
import {glossaryEntries} from '../public/academy-glossary.js';
import {PLAY_BADGES,createQuestionBank} from '../public/play-data.js';
import {academyLessons,academyReferenceData} from '../public/academy.js';
import {createCurriculum} from '../public/academy-content.js';
import {partCatalog} from '../public/parts.js';

// Relative sitemap links require an actual publishing origin, never an invented hostname.
const origin=process.env.PUBLIC_ORIGIN?new URL(process.env.PUBLIC_ORIGIN).origin:null;
const {lessons}=createCurriculum(academyLessons,academyReferenceData.sources,partCatalog,allModels,academyReferenceData.scenarios);
const paths=['/','/models','/engines','/parts','/learn','/play','/start','/glossary','/badges','/compare','/my-garage','/engine-lab','/tuning-garage','/about','/photos','/community','/generation-guides','/spotter','/sounds','/personality','/timeline','/legends',...allModels.map(m=>'/cars/'+m.id),...engineRecords.map(m=>'/engines/'+m.id),...encyclopediaParts.map(p=>p.url),...glossaryEntries.map(t=>'/glossary/'+t.id),...PLAY_BADGES.map(b=>'/badges/'+b.id),...createQuestionBank().map(q=>'/questions/'+q.id),...lessons.map(l=>'/lessons/'+l.id)];
paths.push('/club');
const unique=[...new Set(paths)];fs.writeFileSync('public/discovery-manifest.json',JSON.stringify({version:1,paths:unique},null,2)+'\n');
if(origin){const xml=value=>value.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));fs.writeFileSync('public/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+unique.map(p=>'<url><loc>'+xml(origin+p)+'</loc></url>').join('')+'</urlset>\n');fs.writeFileSync('public/robots.txt','User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /account\nDisallow: /admin\nDisallow: /friends\nDisallow: /submit-car\nDisallow: /garage/\nSitemap: '+origin+'/sitemap.xml\n');}
else{fs.writeFileSync('public/robots.txt','User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /account\nDisallow: /admin\nDisallow: /friends\nDisallow: /submit-car\nDisallow: /garage/\n');console.log('PUBLIC_ORIGIN is not configured; skipped absolute sitemap generation. Set the real deployment origin to generate it.');}
console.log(`Indexed ${unique.length} clean discovery URLs.`);
