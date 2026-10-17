// Vehicle-sale searches remain useful when an individual seller removes an advert.
// MyAuto's selling manufacturer ID (3) differs from its technical catalogue ID (19).
// Verified against the public MyAuto home-data API; unverified model IDs are not guessed.
// https://api2.myauto.ge/ka/services/quick-main-data/all/get
const MYAUTO_MODELS = Object.freeze({ M2: 4634, M4: 1763, X1: 1626, X5: 103, X6: 1501 });

// These are generation ranges, not a claim about cars currently in stock.
const YEARS = {
  f10:[2010,2016],e92:[2007,2013],f90:[2018,2023],f22:[2014,2016],f32:[2014,2016],f13:[2012,2018],f25:[2011,2017],f15:[2014,2018],e46:[2001,2006],e60:[2005,2010],f80:[2015,2018],f82:[2015,2020],g80:[2021,null],e39:[1998,2003],
  'e46-330i':[2000,2006],'e60-530i':[2003,2010],'e90-335i':[2007,2011],'e92-335i':[2007,2013],'f10-m5':[2012,2016],'g20-330i':[2019,null],x1:[2016,2022],x4:[2019,2025],x6:[2020,null],x7:[2019,null],
  'e26-m1':[1978,1981],'e82-1m':[2011,2012],'f87-m2':[2018,2021],'g87-m2':[2023,null],'e30-m3':[1986,1991],'e36-m3':[1992,1999],'g82-m4':[2021,null],'e28-m5':[1985,1988],'e34-m5':[1988,1995],'g90-m5':[2024,null],
  'e24-m635csi':[1984,1989],'e63-m6':[2005,2010],'f13-m6':[2012,2018],'f92-m8':[2019,null],'z3-m':[1997,2002],'z4-m':[2006,2008],'f97-x3m':[2019,2024],'f98-x4m':[2019,2025],'f95-x5m':[2020,null],'f96-x6m':[2020,null],'g09-xm':[2023,null],
  'f40-m135i':[2019,2024],'g42-230i':[2022,null],'g22-430i':[2021,null],'g30-530i':[2017,2023],'g32-640igt':[2017,2023],'g11-740i':[2015,2022],'g15-m850i':[2019,null],'f39-x2':[2018,2023],'g29-z4':[2019,null],'i12-i8':[2014,2020],
  'g81-m3-touring':[2023,null],'g99-m5-touring':[2025,null],'g82-m4-csl':[2022,2023],'g80-m3-cs':[2023,2024],'f90-m5-cs':[2021,2022],'f87-m2-cs':[2020,2021],'f82-m4-gts':[2016,2016],'e46-m3-csl':[2003,2004],'e92-m3-gts':[2010,2011],'e30-m3-sport-evo':[1990,1990],'e90-m3':[2008,2011],
  'f06-m6-gc':[2013,2019],'f93-m8-gc':[2020,null],'f91-m8-convertible':[2019,null],'e368-z3m-coupe':[1998,2002],'e20-2002-turbo':[1973,1975],'e31-850csi':[1992,1996],'e38-750i':[1994,2001],'e9-30-csl':[1971,1975],'e21-323i':[1977,1982],'f44-m235i-gc':[2020,2024],'e86-z4m-coupe':[2006,2008],
  i3:[2018,2022],i4:[2021,null],ix:[2021,null],ix3:[2020,2025],'u11-ix1':[2022,null],'u10-ix2':[2024,null],'g60-i5':[2023,null],'g70-i7':[2022,null],'g26-i4-m50':[2021,2025],'g60-i5-m60':[2023,null],'g70-i7-m70':[2023,null],'i20-ix-m60':[2022,2025]
};

export const buyingCopy = {
  en:{title:'Find this BMW for sale',eyebrow:'FROM THE COLLECTION TO YOUR GARAGE',intro:'Your model. Two places to look.',local:'Your language market',international:'International search',cta:'View cars for sale',georgia:'Georgia',usa:'United States',russia:'Russia',world:'International · eBay Motors',photos:'Photos show the model, not the cars in marketplace listings.',stock:'Listings change. Check the specification and seller location on the marketplace.',trim:'Model and year search; confirm the exact trim with the seller.',rare:'Rare edition: this search also includes the same model from these years. Confirm the special edition with the seller.',broader:'Search this model; choose the generation and exact trim on the marketplace.',different:'A Georgian marketplace with a model-specific category.',unavailable:'This model was not widely sold in the US. International listings may offer more choice.',years:'Model years',search:'Search',newTab:'Opens in a new tab'},
  ka:{title:'იპოვეთ ეს BMW გასაყიდად',eyebrow:'კოლექციიდან თქვენს ავტოფარეხში',intro:'თქვენი მოდელი. ძებნის ორი გზა.',local:'თქვენი ენის ბაზარი',international:'საერთაშორისო ძებნა',cta:'გასაყიდი ავტომობილების ნახვა',georgia:'საქართველო',usa:'აშშ',russia:'რუსეთი',world:'საერთაშორისო · eBay Motors',photos:'ფოტოებზე ნაჩვენებია მოდელი და არა განცხადებებში გასაყიდი ავტომობილები.',stock:'განცხადებები იცვლება. მახასიათებლები და გამყიდველის მდებარეობა გადაამოწმეთ საიტზე.',trim:'ძიება მოდელისა და წლების მიხედვით; ზუსტი კომპლექტაცია გამყიდველთან გადაამოწმეთ.',rare:'იშვიათი ვერსია: ძიებაში ამ წლების იმავე მოდელის სხვა ვერსიებიც შედის. სპეციალური ვერსია გამყიდველთან გადაამოწმეთ.',broader:'მოძებნეთ ეს მოდელი; საიტზე აირჩიეთ თაობა და ზუსტი კომპლექტაცია.',different:'ქართული ავტომობილების საიტი მოდელის შესაბამისი კატეგორიით.',unavailable:'ეს მოდელი აშშ-ში ფართოდ არ იყიდებოდა. საერთაშორისო ძიებაში შესაძლოა მეტი არჩევანი იყოს.',years:'გამოშვების წლები',search:'ძიება',newTab:'იხსნება ახალ ჩანართში'},
  ru:{title:'Найдите этот BMW в продаже',eyebrow:'ИЗ КОЛЛЕКЦИИ В ВАШ ГАРАЖ',intro:'Ваша модель. Два направления поиска.',local:'Рынок вашего языка',international:'Международный поиск',cta:'Смотреть автомобили в продаже',georgia:'Грузия',usa:'США',russia:'Россия',world:'Международный · eBay Motors',photos:'На фотографиях показана модель, а не автомобили из объявлений.',stock:'Объявления меняются. Проверяйте характеристики и местоположение продавца на площадке.',trim:'Поиск по модели и годам; точную комплектацию уточняйте у продавца.',rare:'Редкая версия: поиск также включает другие версии этой модели за указанные годы. Уточняйте специальную версию у продавца.',broader:'Поиск этой модели; выберите поколение и точную комплектацию на площадке.',different:'Грузинская площадка с категорией выбранной модели.',unavailable:'Эта модель не была широко представлена в США. Международный поиск может дать больше вариантов.',years:'Годы выпуска',search:'Поиск',newTab:'Откроется в новой вкладке'}
};

const langOf = language => ['en','ka','ru'].includes(language) ? language : 'en';
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const makeURL = (base, params) => { const url=new URL(base); for(const [key,value] of Object.entries(params)) if(value!==null&&value!==undefined&&value!=='') url.searchParams.set(key,String(value)); return url.href; };

function identity(model) {
  const name=String(model.name||'BMW').replace(/^BMW\s+/i,'');
  const generation=String(model.generation||'').split(' / ').pop().trim();
  const years=YEARS[model.id] || [Number(model.modelYear)||Number(String(model.market||'').match(/\b(?:19|20)\d{2}\b/)?.[0])||null,null];
  let family=name.match(/^(?:X[1-7]\sM\b|X[1-7]\b|XM\b|iX[123]?\b|i[34578]\b|M[1-8]\b|M\d{3}i\b|\d{3}(?:CSi|iL|i)?\b)/i)?.[0] || name;
  if (/^1 Series M/.test(name)) family='1M';
  if (/^Z[34] M/.test(name)) family=name.slice(0,4);
  if (/^Z4 M40i/.test(name)) family='Z4';
  if (/^M635CSi/.test(name)) family='M635CSi';
  if (/^3\.0 CSL/.test(name)) family='3.0 CSL';
  const rare=/\b(?:CSL|CS|GTS|Sport Evolution)\b/i.test(name);
  let us=family.toLowerCase().replace(/\s/g,'-');
  if(family==='1M')us='1-series-m';
  if(/^Z[34] M$/.test(family))us=/Coup/.test(name)?'m-coupe':'m-roadster';
  if(model.id==='f13')us='640i-gran-coupe';
  if(model.id==='g32-640igt')us='640i-gran-turismo';
  if(model.id==='f06-m6-gc')us='m6-gran-coupe';
  if(model.id==='f93-m8-gc')us='m8-gran-coupe-xdrive';
  if(model.id==='f44-m235i-gc')us='m235i-xdrive-gran-coupe';
  if(model.id==='g15-m850i')us='m850i-xdrive';
  const unavailable=['e26-m1','e24-m635csi','e20-2002-turbo','e9-30-csl','e21-323i','f40-m135i','g81-m3-touring','u11-ix1','u10-ix2','ix3'].includes(model.id);
  let ru=/^\d/.test(family)&&family!=='1M'&&family!=='3.0 CSL' ? family[0]+'er' : family.toLowerCase().replace(/\s/g,'_');
  if(/^M\d{3}/.test(family))ru=family[1]+'er';
  if(family==='M635CSi')ru='6er';
  if(/^Z[34] M$/.test(family))ru=family.toLowerCase().replace(' ','_');
  if(family==='3.0 CSL')ru='e9';
  if(ru==='4er')ru='4';
  if(family==='Z3 M')ru='z3m';
  return {name,family,generation,years,rare,us,ru,unavailable};
}

function autoGeCategory(car) {
  const family=car.family;
  if(['1M','M635CSi','2002 turbo','3.0 CSL','i4','i5','iX1','iX2','X3 M','X4 M','230i'].includes(family))return null;
  if(/^M[1-8]$/.test(family))return 'm-series/'+family.toLowerCase();
  if(/^M\d{3}/.test(family))return 'm-series/'+family.match(/^M\d{3}/)[0].toLowerCase();
  if(/^X[1-7](?: M)?$/.test(family))return 'xseries/'+({X2:'x2-bmw',X7:'x7-b'}[family]||family.toLowerCase().replace(/ /g,'-'));
  if(family==='XM')return 'xseries/xm';
  if(/^Z[34]/.test(family))return 'zseries/'+family.slice(0,2).toLowerCase();
  if(/^i(?:3|7|8|X|X3)$/i.test(family))return 'i-series/'+family.toLowerCase();
  if(/^\d{3}(?:i|iL|CSi)?$/.test(family))return family[0]+'-series/'+family.match(/^\d{3}/)[0];
  return null;
}

export function getBuyingLinks(model, language='en') {
  if(!model||!model.name)throw new TypeError('A BMW model is required.');
  const lang=langOf(language),copy=buyingCopy[lang],car=identity(model),[from,to]=car.years;
  const yearLabel=from?`${from}${to===from?'':`–${to||'…'}`}`:'';
  const query=`BMW ${car.family}${yearLabel?' · '+yearLabel:''}`;
  const matchingNote=car.rare?copy.rare:copy.trim;
  let local;
  if(lang==='ka') {
    const id=MYAUTO_MODELS[car.family];
    if(id) {
      local={url:makeURL('https://www.myauto.ge/ka/s/',{vehicleType:0,bargainType:0,mansNModels:`3.${id}`,yearFrom:from,yearTo:to,currId:1,mileageType:1,page:1}),provider:'MyAuto.ge',region:copy.georgia,query,matchingNote};
    } else {
      const category=autoGeCategory(car);
      // Auto.ge's public search form names and category key were inspected directly.
      // This fallback searches the actual model name, never a guessed MyAuto ID.
      const searchName=car.family==='M635CSi'?'M635':car.family==='2002 turbo'?'2002':car.family;
      local={url:category?`https://www.auto.ge/auto/bmw/${category}/`:makeURL('https://www.auto.ge/auto/bmw/search-results.html',{action:'search',post_form_key:'in_category_79','f[keyword_search]':searchName,'f[keyword_search_type]':1,'f[built][from]':from,'f[built][to]':to}),provider:'Auto.ge',region:copy.georgia,query:category?`BMW ${car.family}`:query,matchingNote:category?copy.broader:matchingNote};
    }
  } else if(lang==='ru') {
    local=car.family==='M1'
      ? {url:makeURL('https://www.avito.ru/rossiya/avtomobili',{q:'BMW M1'}),provider:'Avito Auto',region:copy.russia,query:'BMW M1 · E26',matchingNote:copy.broader}
      : {url:makeURL(`https://auto.ru/cars/bmw/${car.ru}/all/`,{year_from:from,year_to:to}),provider:'Auto.ru',region:copy.russia,query,matchingNote};
  } else {
    const slug=car.unavailable?'':`/${car.us}`;
    local={url:makeURL(`https://www.autotrader.com/cars-for-sale/bmw${slug}`,{startYear:from,endYear:to,searchRadius:0,keywordPhrases:car.unavailable?`BMW ${car.family}`:null}),provider:'Autotrader',region:copy.usa,query,matchingNote:car.unavailable?copy.unavailable:matchingNote};
  }
  const edition=car.rare?car.name.replace(/\s+(?:Coupé|Sedan|Convertible)$/,''):car.family;
  const ebayYears=from?Array.from({length:Math.max(1,(to||2026)-from+1)},(_,i)=>from+i).join('|'):null;
  // eBay encodes the space in an aspect's key before URL query encoding.
  // Its own Model Year links use Model%2520Year, not Model+Year.
  const body={Sedans:'Sedan','Coupés':'Coupe',SUVs:'SUV',Hatchbacks:'Hatchback',Touring:'Wagon',Convertibles:'Convertible'}[model.body];
  const international={url:makeURL('https://www.ebay.com/sch/i.html',{_nkw:`BMW ${edition}`,_sacat:6001,Make:'BMW','Model%20Year':ebayYears,'Body%20Type':body,rt:'nc'}),provider:'eBay Motors',region:copy.world,query:`BMW ${edition}${yearLabel?' · '+yearLabel:''}`,matchingNote:car.rare?copy.stock:copy.trim};
  return {local:{...local,label:copy.cta},international:{...international,label:copy.cta},model:model.name,generation:car.generation,years:yearLabel};
}

export function mountBuyingLinks({container,getModel}) {
  if(!container) return {refresh(){},render(){},destroy(){}};
  let activeModel=null;
  function refresh(model) {
    activeModel=model&&model.name?model:getModel?.()||activeModel;
    if(!activeModel){container.hidden=true;return;}
    container.hidden=false;
    const lang=langOf(document.documentElement.lang),copy=buyingCopy[lang],links=getBuyingLinks(activeModel,lang);
    container.setAttribute('aria-labelledby','buying-title');
    container.setAttribute('data-market-language',lang);
    const card=(link,type,index)=>`<a class="buying-card" href="${escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer external" aria-label="${escapeHTML(`${link.provider}: ${link.query}. ${copy.newTab}`)}"><span class="buying-card-meta"><span>${String(index).padStart(2,'0')} / ${escapeHTML(type)}</span><span>${escapeHTML(link.region)}</span></span><strong class="buying-provider">${escapeHTML(link.provider)}<span aria-hidden="true">↗</span></strong><span class="buying-query">${escapeHTML(link.query)}</span><span class="buying-match">${escapeHTML(link.matchingNote)}</span><span class="buying-cta">${escapeHTML(link.label)} <span aria-hidden="true">↗</span></span></a>`;
    container.innerHTML=`<div class="buying-heading"><div><span class="eyebrow">${escapeHTML(copy.eyebrow)}</span><h2 id="buying-title">${escapeHTML(copy.title)}</h2></div><p>${escapeHTML(copy.intro)}</p></div><div class="buying-grid">${card(links.local,copy.local,1)}${card(links.international,copy.international,2)}</div><p class="buying-note">${escapeHTML(copy.stock)} ${escapeHTML(copy.photos)}</p>`;
  }
  const onLanguageChange=()=>refresh();
  window.addEventListener('apex:languagechange',onLanguageChange);
  refresh();
  return {refresh,render:refresh,destroy(){window.removeEventListener('apex:languagechange',onLanguageChange);}};
}
