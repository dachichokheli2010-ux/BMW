import {siteKnowledge} from './site-knowledge.js';

const normal=value=>String(value||'').toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const words=value=>normal(value).split(' ').filter(word=>(word.length>=3||/^[a-z]\d/.test(word))&&!['what','the','and','for','does','how','with','this','between','difference','bmw','please','explain','like','are','you','can','show','tell','about','find','get','only','our','from','into','your'].includes(word));
const uniqueSources=sources=>[...new Map(sources.filter(source=>/^https:\/\//.test(source?.url||'')).map(source=>[source.url,source])).values()];
const local=(title,url)=>({label:title,url});

export function answerSiteQuestion(question,{simple=false,language='en'}={}){
  language=['en','ka','ru'].includes(language)?language:'en';
  const query=normal(question),tokens=words(question),sources=[],links=[];
  if(!tokens.length)return {answer:'Ask about a BMW model, engine code, or an engineering term.',sources:[],links:[]};
  if(/community|owner submission|submit.{0,12}car|share.{0,12}car/.test(query)&&/credit|coin|earn|cost|submit|share/.test(query))return {
    answer:simple?'Community credits pay for submitting your own car for review. Pass a five-question server-checked round with at least four right answers to earn 3 credits. Your first submission costs 50 credits. These credits are separate from Garage game coins.':'A community mastery round has five questions. At least four correct answers earn 3 community credits, with up to three paid rounds (9 credits) and five attempts per UTC day. Expired rounds count as attempts. The first owner-car submission costs 50 credits and stays private until review. Garage game coins and Academy collection credits do not pay for a community submission.',
    sources:[],links:[local('Earn community credits','/community#earn-credits'),local('Submit your BMW','/submit-car')]
  };
  if(/\bcoins?\b|\bpacks?\b|\bcareer\b|card shop/.test(query))return {
    answer:simple?'Your first correct answer without hints earns 1 Garage coin per question each day. Learn, Play and Sounds share a 20-coin daily limit. Start with an Isetta, save coins for cars, or open one 8-coin card pack per UTC day.':'Garage coins come from the first correct answer without hints to each question per UTC day. A wrong or hinted first attempt cannot earn coins on a retry. Learn and Play share the same receipt for a shared question, and Learn, Play and Sounds share a 20-coin daily limit. Spend coins on specific cards or one 8-coin daily pack with displayed rarity odds and no duplicate owned card. The career runs Isetta → 2002 turbo → E30 M3 → E92 M3 → G80 M3 CS. Coins are personal game progress on this account’s browser; collection backups include them. They are separate from community submission credits.',
    sources:[],links:[local('Your coin garage and career','/my-garage'),local('Learn and earn','/learn'),local('Play and earn','/play'),local('Sound challenge','/sounds')]
  };
  if(/\bspotted\b|\bspotter\b|street collection/.test(query))return {answer:'Spotted is your personal list of BMW generations you recognise on the street. Compare the reference photos and generation guides, mark a sighting and add an optional note. These sightings are self-reported, saved for this account in this browser, and do not earn coins.',sources:[],links:[local('Your Spotted list','/spotter'),local('Generation reference guides','/generation-guides')]};
  if(/\bisetta\b/.test(query))return {answer:'The BMW Isetta 300 Standard used a single-cylinder engine. BMW Group Classic lists 13 bhp at 5,200 rpm and a top speed of 85 km/h. The Garage career starts with an illustrated Isetta card; its game rarity and purchase rules are separate from real vehicle value.',sources:[{label:'BMW Group Classic: Isetta 300 Standard',url:'https://www.bmwgroup-classic.com/en/models/bmw-classics/product-description-page.ad-224-1.bmw-isetta-300-standard.html'}],links:[local('Isetta career starter','/my-garage')]};
  if(/\bm3\b/.test(query)&&/\bm340i\b/.test(query))return {
    answer:simple?'The M340i is an M Performance version of the 3 Series. The M3 is a BMW M high-performance model. Think of two different model families, rather than assuming the M340i is an M3 with another badge. Hardware depends on the generation and exact model.':'BMW’s naming distinguishes an M Performance model such as M340i from a BMW M high-performance model such as M3. An M Sport equipment package is a third distinction. Compare a matching year, market, engine, drivetrain and chassis specification; the M name alone does not establish shared hardware.',
    sources:[{label:'BMW model naming guide',url:'https://www.bmw.com/de/automotive-life/modellbezeichnungen-bei-bmw.html/index'}],links:[local('BMW name decoder','/start'),local('M engineering lesson','/learn?lesson=m-performance')]
  };
  const aliases=[...new Set((query.match(/\b(?:m\d{1,3}[ide]?|[1-8]\d{2}[ide]?|[efgiu]\d{1,2}|[bsnm]\d{2}|isetta|i[1-8]|ix|z[1-8])\b/g)||[]))];
  const term=siteKnowledge.terms.map(item=>{const copy=item.i18n[language]||item.i18n.en;const names=[item.id,copy.name,item.i18n.en.name,...item.aliases];return {item,copy,score:Math.max(...names.map(name=>query.includes(normal(name))?normal(name).length:0))};}).filter(result=>result.score>0).sort((a,b)=>b.score-a.score)[0];
  if(term&&!aliases.length){const {item,copy}=term;return {answer:copy.summary+(simple?'':' '+copy.detail),sources:item.sources,links:[local(copy.name,'/glossary/'+item.id)]};}
  const ranked=siteKnowledge.models.map(car=>{const identity=normal(car.name+' '+car.generation+' '+car.engine+' '+car.id);return {car,score:tokens.reduce((score,token)=>score+(identity.split(' ').includes(token)?4:identity.includes(token)?1:0),0)};}).filter(row=>row.score>0).sort((a,b)=>b.score-a.score||(b.car.year||0)-(a.car.year||0)||a.car.id.localeCompare(b.car.id));
  let chosen=[];
  if(aliases.length>1)for(const alias of aliases){const row=ranked.find(row=>normal(row.car.name+' '+row.car.generation+' '+row.car.engine).split(' ').includes(alias));if(row&&!chosen.includes(row.car))chosen.push(row.car);}
  if(!chosen.length)chosen=ranked.slice(0,3).map(row=>row.car);
  if(chosen.length){const paragraphs=chosen.slice(0,3).map(car=>{sources.push(...car.sources);links.push(local(car.name+' · '+car.generation,'/cars/'+car.id));const power=Number.isFinite(car.power)&&car.powerUnit?' Published power: '+car.power+' '+car.powerUnit+'.':'';return `${car.name} · ${car.generation}. ${car.scope||'Catalogue application'}: ${simple?car.layout+'; '+car.powertrain+'.'+power:car.engine+'; '+car.layout+'; '+car.powertrain+'.'+power+' '+car.description}`;});return {answer:(ranked.length>chosen.length?'Several applications match. These are documented examples; specify a generation for a narrower answer.\n\n':'')+paragraphs.join('\n\n'),sources:uniqueSources(sources),links};}
  const lesson=siteKnowledge.lessons.map(item=>({item,score:tokens.reduce((sum,token)=>sum+(normal(item.title+' '+item.summary).split(' ').includes(token)?1:0),0)})).filter(row=>row.score>0).sort((a,b)=>b.score-a.score)[0]?.item;
  if(lesson)return {answer:simple?lesson.summary:lesson.content.slice(0,2).join('\n\n'),sources:uniqueSources(lesson.sources),links:[local(lesson.title,'/learn?lesson='+lesson.id)]};
  return {answer:'I could not find that in Motron’s published reference data. Try a model or chassis code such as E46, an engine such as S58, or a term such as torque. I do not have live prices, private account details, or a diagnosis for your car.',sources:[],links:[local('Search the collection','/models'),local('Buyer guides','/generation-guides')]};
}

export async function handleSiteAsk(request){
  const respond=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  if(request.method!=='POST')return respond({error:'Use POST to ask a question.'},405);
  const url=new URL(request.url),origin=request.headers.get('Origin');
  if(origin&&origin!==url.origin||request.headers.get('Sec-Fetch-Site')==='cross-site')return respond({error:'Open Motron directly to use the helper.'},403);
  if(!/^application\/json(?:;|$)/i.test(request.headers.get('Content-Type')||''))return respond({error:'Use application/json.'},415);
  if(Number(request.headers.get('Content-Length'))>4096)return respond({error:'Keep the question under 500 characters.'},413);
  const reader=request.body?.getReader();if(!reader)return respond({error:'Ask a question first.'},400);
  let bytes=0,text='',decoder=new TextDecoder();try{while(true){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.byteLength;if(bytes>4096){await reader.cancel();return respond({error:'Keep the question under 500 characters.'},413);}text+=decoder.decode(chunk.value,{stream:true});}text+=decoder.decode();}catch{return respond({error:'The question could not be read.'},400);}finally{reader.releaseLock();}
  let body;try{body=JSON.parse(text);}catch{return respond({error:'The request must contain valid JSON.'},400);}
  if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(key=>!['question','simple','language'].includes(key))||typeof body.question!=='string'||!body.question.trim()||body.question.length>500||body.simple!==undefined&&typeof body.simple!=='boolean'||body.language!==undefined&&!['en','ka','ru'].includes(body.language))return respond({error:'Ask a question of 1–500 characters.'},400);
  return respond({...answerSiteQuestion(body.question,body),mode:'published-reference'});
}
