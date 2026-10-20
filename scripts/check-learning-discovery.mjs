import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
const {document,window}=parseHTML('<html lang="en"><head></head><body><div id="tool"></div></body></html>');
const store=new Map(),storage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,String(value)),removeItem:key=>store.delete(key)};
Object.assign(globalThis,{document,window,location:new URL('https://apex.example/personality'),localStorage:storage,HTMLElement:window.HTMLElement,Element:window.Element,MutationObserver:window.MutationObserver,CustomEvent:window.CustomEvent});
window.scrollTo=()=>{};window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
window.URL.createObjectURL=()=> 'blob:personality-card';window.URL.revokeObjectURL=()=>{};
window.setTimeout=()=>0;
const {allModels}=await import('../public/catalog.js');
const {mountPersonalityQuiz,personalityQuestions,personalityTypes,personalityResult,personalityCardSVG,personalityTranslations}=await import('../public/personality-quiz.js');
const {mountGenerationTimeline,generationAtYear,threeSeriesGenerations,generationTimelineTranslations}=await import('../public/generation-timeline.js');
const {setLanguage,t,hasTranslation}=await import('../public/preferences.js');
let root=document.querySelector('#tool');const replace=()=>{const next=document.createElement('div');root.replaceWith(next);root=next;};
const click=selector=>{const button=root.querySelector(selector);assert.ok(button,selector);assert.equal(button.disabled,false,selector+' must be enabled');button.click();};
assert.equal(personalityQuestions.length,5);
assert.equal(personalityResult([]),null);assert.equal(personalityResult(Array(5)),null);assert.equal(personalityResult([9,9,9,9,9]),null);
for(const [type,value] of Object.entries(personalityTypes)){
  assert.ok(allModels.some(model=>model.id===value.modelId&&model.source),'Every match links to an existing sourced model');
  const answers=personalityQuestions.map(question=>question.options.findIndex(option=>option.type===type));
  assert.equal(personalityResult(answers),type,'Consistent preferences produce their corresponding result');
  const svg=personalityCardSVG(type,{modelName:'BMW <safe> & private'});
  assert.ok(svg.includes('width="1200"')&&svg.includes('height="630"'));
  assert.ok(svg.includes('BMW &lt;safe&gt; &amp; private'));
  assert.equal(/<image|https?:\/\//.test(svg.replace('http://www.w3.org/2000/svg','')),false,'The downloadable result is standalone vector art');
}
let quiz=mountPersonalityQuiz(root,{catalog:allModels});
assert.equal(root.querySelector('[data-pq=next]').disabled,true);
for(let i=0;i<5;i++){
  const index=personalityQuestions[i].options.findIndex(option=>option.type==='heritage'),input=root.querySelector('[data-pq-answer][value="'+index+'"]');input.checked=true;input.dispatchEvent(new window.Event('change',{bubbles:true}));
  assert.equal(root.querySelectorAll('.pq-option.is-selected').length,1);
  if(i===1){click('[data-pq=previous]');assert.ok(root.querySelector('[data-pq-answer]:checked'),'Previous question preserves its selection');click('[data-pq=next]');}
  click('[data-pq=next]');
}
assert.equal(root.querySelector('.pq-result h2').textContent,personalityTypes.heritage.title);
assert.ok(root.querySelector('.pq-result-photo a[target="_blank"]'),'Result photography retains attribution');
click('[data-pq=download]');assert.ok(root.querySelector('[role=status]').textContent.includes('downloaded'));
for(const language of ['ka','ru','en']){setLanguage(language,false);assert.equal(root.querySelector('.pq-result h2').textContent,t(personalityTypes.heritage.title));}
quiz.destroy();replace();globalThis.location=new URL('https://apex.example/personality?result=electric');quiz=mountPersonalityQuiz(root,{catalog:allModels});
assert.equal(root.querySelector('.pq-result h2').textContent,personalityTypes.electric.title,'A shared result link shows the selected type');click('[data-pq=restart]');assert.ok(root.querySelector('.pq-question'));
quiz.destroy();replace();quiz=mountPersonalityQuiz(root,{catalog:[allModels.find(model=>model.id==='f10')]});
assert.equal(root.querySelector('.pq-result h2').textContent,personalityTypes.electric.title);
assert.equal(root.querySelector('.pq-result-photo'),null,'A partial catalog must not substitute an unrelated petrol model for an electric personality match.');
assert.equal(root.querySelector('a[href="/cars/f10"]'),null);
quiz.destroy();replace();globalThis.location=new URL('https://apex.example/timeline?year=2011');
assert.equal(generationAtYear(1974),null);assert.equal(generationAtYear(2026),null);assert.equal(generationAtYear(1982).code,'E30');assert.equal(generationAtYear(2011).code,'E90');assert.equal(generationAtYear(2012).code,'F30');assert.equal(generationAtYear(2019).code,'G20');
assert.deepEqual(threeSeriesGenerations.map(item=>item.launch),[1975,1982,1990,1998,2005,2012,2019]);
for(const item of threeSeriesGenerations)assert.ok(allModels.some(model=>model.id===item.modelId&&model.source)&&item.source.startsWith('https://www.bmwgroup.com/'));
const timeline=mountGenerationTimeline(root,{catalog:allModels});
assert.equal(root.querySelector('.gt-generation-code').textContent,'E90');
const range=root.querySelector('[data-gt-range]');range.value='2012';range.dispatchEvent(new window.Event('input',{bubbles:true}));
assert.equal(root.querySelector('[data-gt-range]'),range,'Scrubbing preserves the native slider and keyboard focus');
assert.equal(root.querySelector('.gt-generation-code').textContent,'F30');assert.ok(root.querySelector('.gt-generation-copy').textContent.includes('2011'),'Reveal and market launch years remain distinct');
range.value='2025';range.dispatchEvent(new window.Event('input',{bubbles:true}));assert.equal(root.querySelector('.gt-generation-code').textContent,'G20');assert.equal(root.querySelector('[data-gt=next]').disabled,true);
click('button[data-gt-year="1975"]');assert.equal(root.querySelector('[data-gt=previous]').disabled,true);click('[data-gt=next]');assert.equal(root.querySelector('.gt-generation-code').textContent,'E30');
for(const language of ['ka','ru','en']){setLanguage(language,false);assert.equal(root.querySelector('.gt-generation h2').textContent,t(threeSeriesGenerations[1].title));}
for(const [source] of [...personalityTranslations,...generationTimelineTranslations])for(const language of ['ka','ru'])assert.ok(hasTranslation(source,language),'Discovery copy translated: '+source);
timeline.destroy();assert.equal(root.childNodes.length,0);
console.log('PASS Learning discovery: all personality outcomes, five-question flow, previous selections, shared links, standalone SVG, source-linked seven-generation slider, launch dates, native slider continuity and three languages.');
