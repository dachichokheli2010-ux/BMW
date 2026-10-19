import {glossaryEntries,getGlossaryEntry} from './academy-glossary.js';
import {PLAY_BADGES,createQuestionBank} from './play-data.js';
import {escapeHTML as e,carLink,loadStyle} from './experience-common.js';

export function mountReferencePage(container,{kind,id,catalog=[]}){
  loadStyle('./experience.css');let title,body;
  if(kind==='glossary'){
    const term=getGlossaryEntry(id);title=term?.name;
    if(term)body=`<span class="eyebrow">${e(term.categoryLabel)}</span><h2>${e(term.name)}</h2><p class="reference-lead">${e(term.summary)}</p><p>${e(term.detail)}</p><div class="example-chips">${term.related.map(slug=>`<a href="/glossary/${slug}">${e(getGlossaryEntry(slug)?.name||slug)} ↗</a>`).join('')}</div><h3>See it in a BMW</h3><div class="match-results">${term.modelIds.map(carId=>{const m=catalog.find(m=>m.id===carId);return m?`<a href="${carLink(m.id)}"><img src="${e(m.car)}" alt="" loading="lazy"><div><strong>${e(m.name)}</strong><small>${e(m.generation)}</small></div><span>↗</span></a>`:'';}).join('')}</div><div class="next-road">${term.lessonIds.map(lesson=>`<a href="/lessons/${e(lesson)}">Learn more in the academy ↗</a>`).join('')}</div><details><summary>Sources</summary>${term.sources.map(s=>`<p><a class="source-link" href="${e(s.url)}" target="_blank" rel="noopener">${e(s.label)} ↗</a></p>`).join('')}</details>`;
    else if(!id){title='The jargon buster';body=`<h2>Make the words familiar.</h2><p>Start with any term. The explanation is always one tap away.</p><div class="reference-grid">${glossaryEntries.map(item=>{const term=getGlossaryEntry(item.id);return `<a href="/glossary/${term.id}"><strong>${e(term.name)}</strong><p>${e(term.summary)}</p></a>`;}).join('')}</div><a href="/learn?tab=glossary">Search every term in the academy ↗</a>`;}
  }
  if(kind==='badges'){
    const badge=PLAY_BADGES.find(b=>b.id===id);title=badge?.name;
    body=badge?`<span class="eyebrow">A LITTLE MILESTONE</span><h2>${e(badge.name)}</h2><p class="reference-lead">${e(badge.description)}</p><p>This badge unlocks from your real local Arcade progress. Check your badges in Play to see what you have earned.</p><a class="button-primary" href="/play">Play a round ↗</a>`:!id?`<h2>Your discoveries add up.</h2><p>${PLAY_BADGES.length} milestones to work toward. Each badge shows its exact unlock condition.</p><div class="reference-grid">${PLAY_BADGES.map(b=>`<a href="/badges/${b.id}"><strong>${e(b.name)}</strong><p>${e(b.description)}</p></a>`).join('')}</div>`:null;
    if(!id)title='Arcade badges';
  }
  if(kind==='questions'){
    const q=createQuestionBank(catalog).find(q=>q.id===id);title=q?'A BMW knowledge card':null;
    if(q)body=`<span class="eyebrow">EXPLORE ONE QUESTION</span><h2>${e(q.prompt)}</h2>${q.image?`<img class="knowledge-photo" src="${e(q.image)}" alt="Question reference" loading="lazy">`:''}<details class="knowledge-answer"><summary>Reveal the explanation</summary><p class="reference-lead">${e(q.explanation)}</p><a href="${e(q.learnURL)}">Learn more ↗</a></details><div class="next-road"><a href="/play">Try it in a quiz ↗</a></div>`;
  }
  container.className='tool-card reference-page';container.innerHTML=body||'<h2>A little detour.</h2><p>This reference could not be found. There is plenty more to discover.</p><a href="/start">Find your starting point ↗</a>';if(title)document.title=title+' · APEX';return {destroy(){container.replaceChildren();}};
}
