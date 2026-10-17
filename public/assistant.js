import {isElectric} from './collection.js';
import {partCatalog} from './parts.js';
import {convertedPower,convertedTorque} from './comparison.js';

const copy={
  en:{open:'Ask APEX',title:'Your BMW guide',subtitle:'Find a car or ask about one.',close:'Close chat',welcome:'Tell me what kind of BMW you’re looking for, or ask me anything about a model.',placeholder:'Ask about BMWs…',send:'Send',thinking:'Thinking…',error:'Something went wrong.',suggestions:['Find me a sporty daily driver','What makes the E46 M3 CSL special?'],matches:'Cars to explore',disclaimer:'BMW catalog guide · Works without an API key. Answers use the site’s model and parts data.',typing:'Your message',assistant:'APEX assistant',recommendation:'Here are some BMWs in the collection that may fit. Open a card to compare its factory details.',noMatch:'I couldn’t find a strong catalog match for that yet. Try a model name, generation (like E46 or G80), engine code (like S58), body style, or a component such as turbo, VANOS, or battery.',catalog:'From the site catalog',market:'Catalog specification',power:'Power',torque:'Torque',engine:'Engine',electric:'Electric drive',details:'Model details',special:'Why it stands out',filteredElectric:'I filtered for electric models.',filteredSuv:'I filtered for SUVs.',filteredTouring:'I filtered for Touring models.',component:'BMW component guide',notCatalogued:'That detail is not in the site catalog, so I don’t want to guess. Open a matching model card for its factory source.',compareHint:'I couldn’t identify both cars confidently. Include each model or generation, for example “Compare G80 M3 with G82 M4”.',comparisonOpened:'I opened the side-by-side comparison with the selected models and their catalog specifications.',higherMetric:'{winner} has the higher listed {metric} at {value} {unit}; {runnerUp} is listed at {runnerUpValue} {unit}. These are catalog ratings, not an overall performance verdict.',tiedMetric:'The selected models are tied in listed {metric} at {value} {unit}.'},
  ka:{open:'ჰკითხე APEX-ს',title:'BMW-ის გზამკვლევი',subtitle:'იპოვე ავტომობილი ან დასვი კითხვა.',close:'ჩატის დახურვა',welcome:'მითხარი, როგორი BMW გინდა, ან მკითხე კონკრეტული მოდელის შესახებ.',placeholder:'ჰკითხე BMW-ების შესახებ…',send:'გაგზავნა',thinking:'ვფიქრობ…',error:'შეცდომა მოხდა.',suggestions:['იპოვე სპორტული ყოველდღიური ავტომობილი','რით არის გამორჩეული E46 M3 CSL?'],matches:'აღმოაჩინე ეს მოდელები',disclaimer:'BMW-ის კატალოგის გზამკვლევი · მუშაობს API გასაღების გარეშეც.',typing:'შენი შეტყობინება',assistant:'APEX ასისტენტი',recommendation:'აქ არის კოლექციის BMW-ები, რომლებიც შეიძლება გამოგადგეს. გახსენი ბარათი ქარხნული მონაცემების სანახავად.',noMatch:'კატალოგში ზუსტი დამთხვევა ვერ ვიპოვე. სცადე მოდელის სახელი, თაობა (მაგ. E46 ან G80), ძრავის კოდი (მაგ. S58), ძარის ტიპი ან კომპონენტი, მაგალითად ტურბო, VANOS ან ელემენტი.',catalog:'საიტის კატალოგის მიხედვით',market:'კატალოგის სპეციფიკაცია',power:'სიმძლავრე',torque:'ბრუნვის მომენტი',engine:'ძრავი',electric:'ელექტრო წამყვანი სისტემა',details:'მოდელის დეტალები',special:'რით არის გამორჩეული',filteredElectric:'შერჩეულია ელექტრო მოდელები.',filteredSuv:'შერჩეულია SUV მოდელები.',filteredTouring:'შერჩეულია Touring მოდელები.',component:'BMW-ის კომპონენტების გზამკვლევი',notCatalogued:'ეს ინფორმაცია საიტის კატალოგში არ არის და არ მინდა გამოვიგონო. გახსენი შესაბამისი მოდელის ბარათი ქარხნული წყაროსთვის.',compareHint:'ორივე ავტომობილის ზუსტად ამოცნობა ვერ შევძელი. მიუთითე მოდელი ან თაობა, მაგალითად: „შეადარე G80 M3 და G82 M4“.',comparisonOpened:'გვერდიგვერდ შედარება გაიხსნა შერჩეული მოდელებისა და კატალოგის მონაცემებით.',higherMetric:'{winner} {metric}-ის უფრო მაღალ მითითებულ მაჩვენებელს აჩვენებს: {value} {unit}; {runnerUp} — {runnerUpValue} {unit}. ეს კატალოგის მონაცემებია და არა საერთო შეფასება.',tiedMetric:'შერჩეულ მოდელებს {metric}-ის ერთნაირი მითითებული მაჩვენებელი აქვთ: {value} {unit}.'},
  ru:{open:'Спросить APEX',title:'Ваш гид по BMW',subtitle:'Подберите автомобиль или задайте вопрос.',close:'Закрыть чат',welcome:'Расскажите, какой BMW вы ищете, или спросите о любой модели.',placeholder:'Спросить о BMW…',send:'Отправить',thinking:'Думаю…',error:'Произошла ошибка.',suggestions:['Подбери спортивный автомобиль на каждый день','Чем примечателен E46 M3 CSL?'],matches:'Модели для знакомства',disclaimer:'Гид по каталогу BMW · Работает без API-ключа.',typing:'Ваше сообщение',assistant:'Ассистент APEX',recommendation:'Вот несколько BMW из коллекции, которые могут подойти. Откройте карточку, чтобы посмотреть заводские характеристики.',noMatch:'Не удалось точно сопоставить запрос с каталогом. Попробуйте название модели, поколение (например, E46 или G80), код двигателя (например, S58), тип кузова или компонент — например, турбину, VANOS или батарею.',catalog:'По каталогу сайта',market:'Спецификация в каталоге',power:'Мощность',torque:'Крутящий момент',engine:'Двигатель',electric:'Электропривод',details:'Данные модели',special:'Чем выделяется',filteredElectric:'Показаны электрические модели.',filteredSuv:'Показаны внедорожники.',filteredTouring:'Показаны модели Touring.',component:'Гид по компонентам BMW',notCatalogued:'Этих данных нет в каталоге сайта, поэтому я не буду гадать. Откройте карточку модели, чтобы посмотреть заводской источник.',compareHint:'Не удалось уверенно определить обе машины. Укажите модели или поколения, например: «Сравни G80 M3 и G82 M4».',comparisonOpened:'Открылось сравнение выбранных моделей и их характеристик из каталога.',higherMetric:'У {winner} выше указанный показатель {metric}: {value} {unit}; у {runnerUp} — {runnerUpValue} {unit}. Это данные каталога, а не общая оценка характеристик.',tiedMetric:'У выбранных моделей одинаковый указанный показатель {metric}: {value} {unit}.'}
};
const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const stopWords=new Set(['want','find','looking','for','with','that','this','what','which','best','good','car','cars','model','models','vehicle','vehicles','bmw','the','and','from','about','tell','show','me','please','something','like','kind','type','need','have','has','are','is','was','were','daily','driver','drive','driving','sporty','sport','fast','comfortable','weekend','weekends','under','over','around','price','budget','my','a','an','to','of','on','in','do','does','can','you','i','it','make','makes','special','stand','out','different','explain','explanation','describe','compare','comparison','difference','differences','spec','specs','specification','specifications','engine','motor','horsepower','power','torque','reliable','reliability','fuel','economy','consumption','mileage','cheap','expensive','buy','buying','used','new','year','years','generation','generations','series','which','options','option','recommendation','recommend','suggest','suggestions','suggest','please','how','does','work','works','use','uses']);
const priorityIds=['g81-m3-touring','g82-m4-csl','g87-m2','g80','g99-m5-touring','f92-m8','e46-m3-csl','g90-m5','g60-i5','e30-m3','g15-m850i','g29-z4'];
const joinSpecs=(model,strings)=>[
  model.market?`${strings.market}: ${model.market}`:null,
  model.power?`${strings.power}: ${model.power} ${model.powerUnit||''}`.trim():null,
  model.torque?`${strings.torque}: ${model.torque} ${model.torqueUnit||''}`.trim():null
].filter(Boolean).join(' · ');

const tokenise=value=>normalize(value).match(/[\p{L}\p{N}]+/gu)||[];
const containsAny=(value,patterns)=>patterns.some(pattern=>typeof pattern==='string'?value.includes(pattern):pattern.test(value));
function preferenceFilters(query){
  const text=normalize(query);
  return{
    electric:containsAny(text,[/\belectric\b/,/\bev\b/,/\bbattery\b/,/\bzero[- ]?emission/,'ელექტრო','электричес']),
    hybrid:containsAny(text,[/\bhybrid\b/,/\bplug[- ]?in\b/,'ჰიბრიდ','гибрид']),
    petrol:containsAny(text,[/\bpetrol\b/,/\bgasoline\b/,/\bgas[- ]?powered\b/,'ბენზინი','бензин']),
    suv:containsAny(text,[/\bsuvs?\b/,/\bx[1357]\b/,'crossover','ჯიპ','внедорож']),
    touring:containsAny(text,[/\btouring\b/,/\bwagon\b/,/\bestate\b/,/\bshooting brake\b/,'უნივერსალ','универсал']),
    coupe:containsAny(text,[/\bcoup[eé]s?\b/,'კუპე','купе']),
    convertible:containsAny(text,[/\bconvertible\b/,/\bcabrio(?:let)?\b/,/\broadster\b/,'კაბრიო','родстер']),
    sedan:containsAny(text,[/\bsedan\b/,/\bsaloon\b/,'სედანი','седан']),
    mCar:containsAny(text,[/\bm\s*(?:series|car|cars|model|models)\b/,/\bbmw\s+m\b/,'სპორტული m','серия m']),
    classic:containsAny(text,[/\bclassic\b/,/\bold[- ]?school\b/,/\bvintage\b/,'კლასიკური','классичес']),
    sporty:containsAny(text,[/\bsporty\b/,/\bsport\b/,/\bperformance\b/,/\bfast\b/,/\btrack\b/,'სპორტული','спортив']),
    daily:containsAny(text,[/\bdaily\b/,/\beveryday\b/,/\bcommut(?:e|er|ing)\b/,/\bfamily\b/,'ყოველდღ','каждый день']),
    query:text
  };
}

function scoreModel(model,query){
  const filters=preferenceFilters(query);
  const name=normalize(model.name),generation=normalize(model.generation),code=normalize(model.code);
  const searchable=normalize([model.name,model.title,model.code,model.id,model.generation,model.subtitle,model.description,model.layout,model.induction,model.market,model.body,model.powertrain].join(' '));
  const queryTokens=tokenise(query);
  const specific=queryTokens.filter(token=>!stopWords.has(token)&&token.length>1);
  let score=0;
  for(const token of specific){
    if(name.split(/\W+/).includes(token))score+=12;
    else if(code.split(/\W+/).includes(token))score+=10;
    else if(generation.split(/\W+/).includes(token))score+=8;
    else if(searchable.includes(token))score+=2;
  }
  const electric=model.powertrain==='Electric';
  if(filters.electric)score+=electric?24:-100;
  if(filters.hybrid)score+=model.powertrain==='Plug-in hybrid'?24:-100;
  if(filters.petrol)score+=model.powertrain==='Petrol'?12:-80;
  if(filters.suv)score+=model.body==='SUVs'?18:-60;
  if(filters.touring)score+=model.body==='Touring'?24:-70;
  if(filters.coupe)score+=model.body==='Coupés'?18:-60;
  if(filters.convertible)score+=model.body==='Convertibles'?20:-60;
  if(filters.sedan)score+=model.body==='Sedans'?18:-60;
  if(filters.mCar)score+=/^m series\b/i.test(model.generation)?26:-40;
  if(filters.classic)score+=/\b(?:e[0-3]\d|e9|m1)\b/i.test(model.generation+' '+model.name)?10:0;
  if(filters.sporty)score+=/^m series\b/i.test(model.generation)?8:model.name.includes('M')?3:0;
  if(filters.daily)score+=['Sedans','Touring','SUVs','Hatchbacks'].includes(model.body)?5:-3;
  const maximum=query.match(/\b(?:under|below|less than|max(?:imum)?)\s*(\d{2,4})\s*(?:hp|ps|bhp|kw)\b/i)?.[1];
  if(maximum&&model.power)score+=Number(model.power)<=Number(maximum)?5:-20;
  return{score,specificCount:specific.length,hasSpecific:specific.some(token=>name.includes(token)||code.split(/\W+/).includes(token)||generation.split(/\W+/).includes(token))};
}

function matchingModels(query,models){
  const normalized=normalize(query);
  const scored=models.map((model,index)=>({model,index,...scoreModel(model,query)}))
    .filter(entry=>entry.score>0)
    .sort((a,b)=>b.score-a.score||a.index-b.index);
  if(scored.length){
    const top=scored[0].score;
    const specific=scored[0].hasSpecific;
    return scored.filter(entry=>entry.score>=Math.max(8,top-8)).slice(0,4).map(entry=>entry.model);
  }
  const filters=preferenceFilters(query);
  const filtered=models.filter(model=>
    (!filters.electric||model.powertrain==='Electric')&&
    (!filters.hybrid||model.powertrain==='Plug-in hybrid')&&
    (!filters.petrol||model.powertrain==='Petrol')&&
    (!filters.suv||model.body==='SUVs')&&
    (!filters.touring||model.body==='Touring')&&
    (!filters.coupe||model.body==='Coupés')&&
    (!filters.convertible||model.body==='Convertibles')&&
    (!filters.sedan||model.body==='Sedans')&&
    (!filters.mCar||/^m series\b/i.test(model.generation))&&
    (!filters.daily||['Sedans','Touring','SUVs','Hatchbacks'].includes(model.body))
  );
  if(filtered.length&&[filters.electric,filters.hybrid,filters.petrol,filters.suv,filters.touring,filters.coupe,filters.convertible,filters.sedan,filters.mCar,filters.daily].some(Boolean))
    return filtered.slice(0,4);
  if(/\b(recommend|suggest|looking|want|find|choose|which|recommendation|what\s+(?:bmw|car|model)|i\s+need|მინდა|მირჩიე|найти|подбери|посоветуй|хочу)\b/i.test(normalized))
    return priorityIds.map(id=>models.find(model=>model.id===id)).filter(Boolean).slice(0,4);
  return[];
}

function isComparisonRequest(query){
  return containsAny(normalize(query),[
    /\bcompare\b/,/\bcomparison\b/,/\bversus\b/,/\bvs\b/,/\bcompared\b/,/\bagainst\b/,
    /შეადარე|შედარება/,/сравни|сравнение|против/
  ]);
}

function comparisonModels(query,models){
  if(!isComparisonRequest(query))return[];
  const representativeModels={m1:'m1',m2:'g87-m2',m3:'g80',m4:'g82-m4',m5:'g90-m5',m8:'f92-m8'};
  const segments=normalize(query).split(/\b(?:vs\.?|versus|against|with|and|to|compared\s+(?:to|with))\b|[,;&]|\s+и\s+|\s+და\s+|\s+против\s+/i)
    .map(segment=>segment.replace(/^(?:please\s+)?(?:compare|comparison|the|bmw)\s+/i,'').replace(/\b(?:please|for me|in detail|side by side)\b/g,'').trim())
    .filter(Boolean);
  if(segments.length<2)return[];
  const chosen=[];
  for(const segment of segments.slice(0,4)){
    const tokens=tokenise(segment).filter(token=>!stopWords.has(token)&&token.length>1);
    if(!tokens.length)continue;
    const ranked=models.map((model,index)=>{
      const name=normalize(model.name),generation=normalize(model.generation),code=normalize(model.code);
      const searchable=normalize([model.name,model.title,model.id,model.code,model.generation].join(' '));
      const score=tokens.reduce((total,token)=>{
        if(name.split(/\W+/).includes(token))return total+12;
        if(code.split(/\W+/).includes(token))return total+11;
        if(generation.split(/\W+/).includes(token))return total+10;
        if(normalize(model.id).split(/[-\W]+/).includes(token))return total+9;
        return total+(searchable.includes(token)?2:0);
      },0);
      const namedVariant=['csl','cs','gts','touring','convertible','sedan','competition','sport','evo'].some(token=>tokens.includes(token)&&searchable.split(/\W+/).includes(token));
      const specialVariant=/-(?:csl|cs|gts|sport-evo)$/.test(model.id)&&!namedVariant;
      return{model,index,score,specialVariant};
    }).filter(entry=>entry.score>0)
      .sort((a,b)=>b.score-a.score||Number(a.specialVariant)-Number(b.specialVariant)||(priorityIds.indexOf(a.model.id)<0?100:priorityIds.indexOf(a.model.id))-(priorityIds.indexOf(b.model.id)<0?100:priorityIds.indexOf(b.model.id))||a.index-b.index);
    const representative=tokens.length===1?models.find(model=>model.id===representativeModels[tokens[0]]):null;
    const match=representative||ranked[0]?.model;
    if(match&&!chosen.some(model=>model.id===match.id))chosen.push(match);
  }
  return chosen;
}

function componentAnswer(question,strings,models){
  const tokens=tokenise(question).filter(token=>!stopWords.has(token)&&token.length>1);
  if(!containsAny(normalize(question),[
    /\bturbo(?:charger|chargers|s)?\b/,/\bvanos\b/,/\bvalvetronic\b/,/\bbattery\b/,/\bbrakes?\b/,/\bbraking\b/,
    /\bcooling\b/,/\bintercooler\b/,/\bintake\b/,/\bexhaust\b/,/\bfuel\b/,/\binjectors?\b/,/\bspark plugs?\b/,
    /\bignition coils?\b/,/\balternator\b/,/\bthrottle body\b/,/\btransmission\b/,/\bgearbox\b/,
    /\bengine\b.*\bhow\b/,/\bhow\b.*\bengine\b/
  ]))return null;
  const aliases={turbo:['turbocharger','turbochargers','turbos'],vanos:['vanos','variable valve timing','camshaft timing'],battery:['high-voltage battery','battery'],brake:['brakes','braking'],cooling:['cooling','intercooler'],intake:['intake','air filter'],exhaust:['exhaust'],fuel:['fuel'],suspension:['suspension'],ecu:['engine control unit','ecu']};
  const queryWords=tokens.flatMap(token=>aliases[token]||[token]);
  const explicitVehicle=containsAny(normalize(question),[/\bm[1-8]\b/,/\b[efg]\d{2}\b/,/\bs\d{2}\b/,/\bix\d?\b/]);
  const componentEntries=partCatalog.map(part=>({part,model:null}));
  if(explicitVehicle)for(const model of models)for(const part of model.parts||[])componentEntries.push({part,model});
  const ranked=componentEntries.map(({part,model},index)=>{
    const text=normalize([part.id,part.name,part.title,part.text,part.system,part.summary,part.purpose,part.how,part.note,...(part.connections||[]).map(item=>item.name)].join(' '));
    const words=tokenise(text);
    const wordSet=new Set(words);
    const score=queryWords.reduce((total,word)=>{
      if(word.includes(' '))return total+(text.includes(word)?4:0);
      return total+(wordSet.has(word)?4:0);
    },0);
    return{part,model,index,score};
  }).sort((a,b)=>b.score-a.score||a.index-b.index);
  let match=ranked[0];
  if(!explicitVehicle&&!match?.score){
    const vehicleParts=models.flatMap(model=>(model.parts||[]).map(part=>({part,model})));
    match=vehicleParts.map(({part,model},index)=>{
      const words=new Set(tokenise([part.name,part.title,part.text].join(' ')));
      const text=normalize([part.name,part.title,part.text].join(' '));
      const score=queryWords.reduce((total,word)=>total+(word.includes(' ')?(text.includes(word)?4:0):(words.has(word)?4:0)),0);
      return{part,model,index,score};
    }).sort((a,b)=>b.score-a.score||a.index-b.index)[0];
  }
  if(!match?.score)return null;
  const part=match.part;
  if(match.model)return`${strings.component} · ${match.model.name}: ${(part.title||part.name).replace(/[.!?]+$/,'')}. ${part.text}`;
  return`${strings.component}: ${part.name} (${part.system}). ${part.summary} ${part.purpose} ${part.how} ${part.note}`;
}

function localAnswer(question,matches,lastMatches,models){
  const strings=copy[document.documentElement.lang]||copy.en;
  const candidates=matches.length?matches:lastMatches;
  const normalized=normalize(question);
  if(isComparisonRequest(question)&&matches.length<2)return strings.compareHint;
  if(/^(?:hi|hello|hey|thanks|thank you|გამარჯობა|მადლობა|привет|здравствуйте|спасибо)[!. ]*$/i.test(normalized))
    return`Hi! I can recommend a BMW, look up models by name, generation or engine code, compare catalog specifications, and explain components.`;
  const component=componentAnswer(question,strings,models);
  if(component&&!containsAny(normalized,[/\b(?:m[1-8]|[efg]\d{2}|s\d{2})\b/]))
    return component;
  if(!candidates.length)return strings.noMatch;
  const metric=containsAny(normalized,[/\btorque\b/,'ბრუნვის მომენტი','крутящий момент'])?'torque':
    containsAny(normalized,[/\b(?:power|horsepower|bhp|ps|kw)\b/,'სიმძლავრე','мощность'])?'power':null;
  const asksWhich=containsAny(normalized,[/\b(?:which|more|higher|most|stronger|faster|less|lower|best)\b/,'რომელს','მეტი','больше','мощнее']);
  if(metric&&asksWhich&&candidates.length>1){
    const convert=metric==='power'?convertedPower:convertedTorque;
    const values=candidates.map(model=>({model,result:convert(model)})).filter(item=>item.result);
    if(values.length!==candidates.length)return strings.notCatalogued;
    if(values.length>1){
      values.sort((a,b)=>b.result.value-a.result.value);
      const highest=Math.round(values[0].result.value),leaders=values.filter(item=>Math.round(item.result.value)===highest);
      const fill=(template,vars)=>Object.entries(vars).reduce((text,[key,value])=>text.replaceAll(`{${key}}`,value),template);
      const value=highest.toLocaleString(document.documentElement.lang||'en');
      if(leaders.length>1)return fill(strings.tiedMetric,{metric:strings[metric],value,unit:values[0].result.unit});
      return fill(strings.higherMetric,{winner:`${values[0].model.name} (${values[0].model.generation.split(' / ').pop()})`,runnerUp:`${values[1].model.name} (${values[1].model.generation.split(' / ').pop()})`,metric:strings[metric],value,unit:values[0].result.unit,runnerUpValue:Math.round(values[1].result.value).toLocaleString(document.documentElement.lang||'en')});
    }
  }
  const filters=preferenceFilters(question);
  const isRecommendation=containsAny(normalized,[/\brecommend\b/,/\bsuggest\b/,/\blooking\b/,/\bwant\b/,/\bfind\b/,/\bchoose\b/,/\bwhat (?:bmw|car|model)\b/,/\bsporty\b/,/\bdaily\b/,/\beveryday\b/,/\bdriver\b/,/\bsuv\b/,/\belectric\b/,/\btouring\b/,/\bhybrid\b/,/\bclassic\b/,/\bsedan\b/,/\bconvertible\b/,/\bcoup[eé]\b/,/\bbudget\b/,/\bprice\b/,'მინდა','მირჩიე','найти','подбери','посоветуй','хочу']);
  if(isRecommendation){
    const summaries=candidates.slice(0,3).map(model=>{
      const power=model.power?` · ${model.power} ${model.powerUnit}`:'';
      const body=model.body?` · ${model.body}`:'';
      return`${model.name} (${model.generation.split(' / ').pop()}${body}${power})`;
    });
    const priceNote=/\b(?:budget|price|cost|under \$|less than \$)\b/.test(normalized)?' I can’t compare current prices because this catalog has no live listings or price data.':'';
    return`${strings.recommendation} ${summaries.join('; ')}. ${filters.electric?strings.filteredElectric:''}${filters.suv?` ${strings.filteredSuv}`:''}${filters.touring?` ${strings.filteredTouring}`:''}${priceNote}`;
  }
  const requestedTokens=tokenise(question).filter(token=>!stopWords.has(token));
  const candidatesWithScores=candidates.map(model=>{
    const parts=model.parts||[];
    const matching=parts.map(part=>({part,score:requestedTokens.reduce((sum,token)=>sum+(tokenise([part.name,part.title,part.text].join(' ')).includes(token)?1:0),0)}))
      .sort((a,b)=>b.score-a.score);
    return{model,part:matching[0]?.score?matching[0].part:null};
  });
  if(containsAny(normalized,[/\bcompare\b/,/\bdifference\b/,'შეადარე','сравни'])&&candidates.length>1){
    return candidates.slice(0,2).map(model=>`${model.name} (${model.generation.split(' / ').pop()}): ${joinSpecs(model,strings)} · ${model.layout} · ${model.induction}.`).join('\n');
  }
  const model=candidatesWithScores[0].model;
  const details=model.parts||[];
  const relevant=candidatesWithScores[0].part;
  const overview=details.find(part=>part.name==='Overview')?.text||model.description||model.subtitle||'';
  const technical=model.powertrain==='Electric'
    ?`${strings.electric}: ${model.layout}; ${model.induction}.`
    :`${strings.engine}: ${model.code}, ${model.layout}, ${model.induction}.`;
  const answer=[model.name+' · '+model.generation+'.',overview,relevant&&relevant.name!=='Overview'?relevant.text:null,technical,joinSpecs(model,strings)].filter((value,index,array)=>value&&array.indexOf(value)===index);
  if(model.source)answer.push(`${strings.details}: ${model.source}`);
  else answer.push(`${strings.details}: open the model card to explore its catalog record.`);
  return answer.join(' ');
}

function renderModelCard(model){
  const link=document.createElement('a');
  link.className='apex-chat-car';
  link.href=(isElectric(model)?'/electric':'/')+'?model='+encodeURIComponent(model.id);
  const image=document.createElement('img');
  image.src=model.car;
  image.alt=model.name;
  image.loading='lazy';
  image.decoding='async';
  const info=document.createElement('span');
  info.className='apex-chat-car-info';
  const name=document.createElement('strong');
  name.textContent=model.name;
  const meta=document.createElement('small');
  meta.textContent=[model.generation?.split(' / ').pop(),model.code,model.power?`${model.power} ${model.powerUnit||''}`.trim():null].filter(Boolean).join(' · ');
  info.append(name,meta);
  const arrow=document.createElement('span');
  arrow.className='apex-chat-car-arrow';
  arrow.setAttribute('aria-hidden','true');
  arrow.textContent='↗';
  link.append(image,info,arrow);
  return link;
}

export function mountAssistant(models,{compareModels:openModelComparison=()=>false}={}){
  if(!Array.isArray(models)||!models.length)throw new TypeError('The BMW assistant needs the model catalog.');
  const language=()=>copy[document.documentElement.lang]||copy.en;
  const stylesheet=document.createElement('link');
  stylesheet.rel='stylesheet';
  stylesheet.href=new URL('./assistant.css',import.meta.url);
  document.head.append(stylesheet);

  const widget=document.createElement('section');
  widget.className='apex-assistant';
  widget.setAttribute('aria-label',language().assistant);
  widget.innerHTML='<button class="apex-assistant-launch" type="button"><span class="apex-assistant-spark" aria-hidden="true">✦</span><span class="apex-assistant-launch-label"></span></button><section class="apex-assistant-panel" aria-label="BMW chat" hidden><header class="apex-assistant-header"><div><span class="apex-assistant-kicker">APEX / BMW GUIDE</span><h2></h2><p></p></div><button class="apex-assistant-close" type="button"></button></header><div class="apex-assistant-feed" role="log" aria-live="polite" aria-relevant="additions text"></div><div class="apex-assistant-suggestions"></div><form class="apex-assistant-form"><input type="text" maxlength="1200" autocomplete="off"><button type="submit" aria-label="Send message"><span aria-hidden="true">↑</span></button></form><p class="apex-assistant-disclaimer"></p></section></section>';
  document.body.append(widget);

  const launcher=widget.querySelector('.apex-assistant-launch');
  const panel=widget.querySelector('.apex-assistant-panel');
  const feed=widget.querySelector('.apex-assistant-feed');
  const form=widget.querySelector('form');
  const input=widget.querySelector('input');
  const closeButton=widget.querySelector('.apex-assistant-close');
  const suggestionBox=widget.querySelector('.apex-assistant-suggestions');
  let history=[];
  let lastMatches=[];
  let sending=false;

  function updateLabels(){
    const strings=language();
    widget.setAttribute('aria-label',strings.assistant);
    launcher.querySelector('.apex-assistant-launch-label').textContent=strings.open;
    launcher.setAttribute('aria-label',strings.open);
    widget.querySelector('h2').textContent=strings.title;
    widget.querySelector('.apex-assistant-header p').textContent=strings.subtitle;
    closeButton.textContent='×';
    closeButton.setAttribute('aria-label',strings.close);
    input.placeholder=strings.placeholder;
    input.setAttribute('aria-label',strings.typing);
    form.querySelector('button').setAttribute('aria-label',strings.send);
    widget.querySelector('.apex-assistant-disclaimer').textContent=strings.disclaimer;
    suggestionBox.replaceChildren();
    suggestionBox.hidden=false;
    for(const suggestion of strings.suggestions){
      const button=document.createElement('button');
      button.type='button';
      button.textContent=suggestion;
      button.addEventListener('click',()=>submitMessage(suggestion));
      suggestionBox.append(button);
    }
  }

  function addMessage(role,text){
    const item=document.createElement('article');
    item.className='apex-chat-message '+role;
    item.setAttribute('aria-label',role==='assistant'?language().assistant:language().typing);
    const paragraph=document.createElement('p');
    paragraph.textContent=text;
    item.append(paragraph);
    feed.append(item);
    feed.scrollTop=feed.scrollHeight;
    return item;
  }

  function catalogContext(candidates){
    return candidates.map(model=>[
      model.name+' ('+model.id+')',
      model.generation,
      'Engine/family: '+model.code,
      model.power?'Power: '+model.power+' '+(model.powerUnit||''):'',
      model.torque?'Torque: '+model.torque+' '+(model.torqueUnit||''):'',
      'Layout: '+model.layout,
      'Induction/battery: '+model.induction,
      'Market: '+model.market,
      model.subtitle||model.description
    ].filter(Boolean).join(' | ')).join('\n').slice(0,5800);
  }

  function open(){
    panel.hidden=false;
    launcher.hidden=true;
    input.focus();
    if(!feed.childElementCount)addMessage('assistant',language().welcome);
  }
  function close(){
    panel.hidden=true;
    launcher.hidden=false;
    launcher.focus();
  }

  async function submitMessage(text=input.value){
    const message=text.trim();
    if(!message||sending)return;
    input.value='';
    suggestionBox.hidden=true;
    addMessage('user',message);
    const comparisonRequested=isComparisonRequest(message);
    const compared=comparisonRequested?comparisonModels(message,models):[];
    const matches=comparisonRequested?(compared.length>=2?compared:[]):matchingModels(message,models);
    if(matches.length)lastMatches=matches;
    const candidates=matches.length?matches:lastMatches;
    const turns=[...history,{role:'user',content:message}].slice(-12);
    sending=true;
    form.querySelector('button').disabled=true;
    input.disabled=true;
    const loading=addMessage('assistant',language().thinking);
    let comparisonOpened=false;
    if(matches.length){
      const group=document.createElement('section');
      group.className='apex-chat-matches';
      const heading=document.createElement('h3');
      heading.textContent=language().matches;
      group.append(heading,...matches.map(renderModelCard));
      loading.append(group);
    }
    try{
      comparisonOpened=compared.length>=2&&openModelComparison(compared.map(model=>model.id))===true;
      const response=await fetch('/api/chat',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({messages:turns,context:catalogContext(candidates)})
      });
      let result;
      try{result=await response.json();}catch(error){throw new Error(language().error);}
      let reply;
      if(result.fallback===true){
        reply=localAnswer(message,matches,lastMatches,models);
      }else if(!response.ok){
        throw new Error(typeof result.error==='string'?result.error:language().error);
      }else if(typeof result.reply==='string'&&result.reply.trim()){
        reply=result.reply;
      }else{
        throw new Error(language().error);
      }
      if(comparisonOpened)reply+=`\n\n${language().comparisonOpened}`;
      loading.querySelector('p').textContent=reply;
      history=[...turns,{role:'assistant',content:reply}].slice(-12);
      feed.scrollTop=feed.scrollHeight;
    }catch(error){
      loading.classList.add('error');
      loading.querySelector('p').textContent=error instanceof Error?error.message:language().error;
    }finally{
      sending=false;
      form.querySelector('button').disabled=false;
      input.disabled=false;
      input.focus();
      feed.scrollTop=feed.scrollHeight;
    }
  }

  launcher.addEventListener('click',open);
  closeButton.addEventListener('click',close);
  form.addEventListener('submit',event=>{event.preventDefault();submitMessage();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)close();});
  window.addEventListener('apex:languagechange',updateLabels);
  updateLabels();
  return{open,close};
}
