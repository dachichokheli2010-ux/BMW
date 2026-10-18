const choice=(id,prompt,answers,correct,explanation)=>({id,type:'choice',prompt,answers,correct,explanation});
const order=(id,prompt,items,explanation)=>({id,type:'order',prompt,items:items.map((text,i)=>({id:i,text})),correct:items.map((_,i)=>i),explanation});
const match=(id,prompt,pairs,explanation)=>({id,type:'match',prompt,pairs,explanation});
const doc=(label,url)=>({label,url});

export function createCurriculum(legacy,sources,parts,catalog,scenarios){
  const lessons=legacy.map(item=>({id:item.id,title:item.title,topic:'systems',duration:item.duration,intro:item.content[0],detail:item.content.slice(1),visual:item.id,steps:item.steps,sources:[doc(...sources[item.source]),...(item.extraSource?[doc(...item.extraSource)]:[])],questions:item.quizzes.map((q,i)=>({...q,id:item.id+'-'+i,type:'choice'})),legacy:true}));
  const add=item=>(lessons.push({duration:'3 min',detail:[],steps:[],...item}),item.id);
  const basicSources=[doc(...sources.combustion),doc('US DOE · gasoline vehicle systems','https://afdc.energy.gov/vehicles/how-do-gasoline-cars-work')];
  add({id:'first-engine',title:'What is an engine?',topic:'basics',intro:'A combustion engine converts energy in fuel into mechanical work. Gas pressure moves pistons; connecting rods and a crankshaft turn that movement into rotation. That rotation can drive the wheels through a transmission.',detail:['The engine supplies rotation. The transmission and differential adapt and distribute it before it reaches the tires.'],visual:'combustion',sources:basicSources,questions:[
    choice('first-engine-0','What useful output does a combustion engine deliver?',['Rotating mechanical output','Stored electricity only','Refrigerated coolant'],0,'Fuel energy is converted into mechanical work at the crankshaft.'),
    order('first-engine-1','Build the path from combustion to rotation.',['Combustion pressure','Piston movement','Connecting rod force','Crankshaft rotation'],'Pressure acts on the piston; the rod transmits force to an offset crank journal.'),
    choice('first-engine-2','Which item belongs between the engine and driven wheels?',['A radiator fin','A transmission','An air filter'],1,'A transmission changes the speed and torque relationship between engine and drivetrain.')
  ]});
  add({id:'horsepower',title:'Power: how fast work happens',topic:'basics',intro:'Power measures how quickly work is done. Horsepower and kilowatts are units of power. Engine power depends on both torque and rotational speed, so the largest torque number alone cannot tell you the largest power output.',detail:['Mechanical horsepower (hp) and metric horsepower (PS) are different units. Always keep the stated unit when comparing factory specifications.','At a given engine speed, more torque means more power. At a given torque, more rotational speed also means more power.'],visual:'power',sources:[doc('BMW · F10 M5 technical data','https://www.press.bmwgroup.com/global/article/attachment/T0141959EN/219895')],questions:[
    choice('horsepower-0','What does power describe?',['How quickly work is done','Only how heavy a car is','Only engine size'],0,'Power is the rate of doing work; it is not an engine-displacement measurement.'),
    choice('horsepower-1','At the same RPM, which engine produces more power?',['The one with more torque','The one with a larger fuel tank','They must be identical'],0,'At fixed rotational speed, power is proportional to torque.'),
    match('horsepower-2','Match the quantity with its unit.',[['Power','Kilowatts (kW)'],['Torque','Newton metres (Nm)'],['Rotational speed','Revolutions per minute (RPM)']],'Power, torque and rotational speed describe related but different quantities.')
  ]});
  add({id:'torque',title:'Torque: a turning effect',topic:'basics',intro:'Torque is the turning effect of a force acting at a distance from an axis. Think of pushing a wrench: the force and its perpendicular distance from the bolt both matter. At the engine, torque describes the turning effect delivered by the crankshaft.',detail:['A transmission can multiply torque by reducing rotational speed. It does not create energy; real components also have losses.'],visual:'torque',sources:[doc(...sources.transmission)],questions:[
    choice('torque-0','Torque describes…',['A turning effect','The number of liters in a fuel tank','A distance traveled'],0,'Torque is a moment of force about an axis.'),
    choice('torque-1','Apply the same perpendicular force farther from a bolt. The turning effect is…',['Greater','Always zero','Unchanged'],0,'The longer perpendicular lever arm produces a greater moment from the same force.'),
    choice('torque-2','An ideal 2:1 reduction receives 100 Nm. What is its output torque?',['50 Nm','100 Nm','200 Nm'],2,'An ideal 2:1 reduction doubles torque while halving rotational speed. Real losses reduce the ideal output.')
  ]});
  add({id:'rpm',title:'RPM: count the revolutions',topic:'basics',intro:'RPM means revolutions per minute. For an engine, it usually describes crankshaft speed. Engine speed and road speed are different: the selected gear, final drive and tire size connect the two.',detail:['A four-stroke cycle uses two crankshaft revolutions. RPM is not a direct reading of vehicle speed or power.'],visual:'rpm',sources:basicSources,questions:[
    choice('rpm-0','What does 3,000 RPM mean?',['3,000 crankshaft revolutions per minute','3,000 kilometers per hour','3,000 combustion cycles per second'],0,'RPM counts revolutions in one minute.'),
    choice('rpm-1','Can the same road speed correspond to different engine RPM?',['Yes, by selecting a different gear','No, RPM is road speed','Only when parked'],0,'Different gear ratios connect a given wheel speed to different engine speeds.'),
    choice('rpm-2','How many revolutions occur in 30 seconds at 2,000 RPM?',['4,000','2,000','1,000'],2,'Thirty seconds is half a minute, so 2,000 × 0.5 = 1,000 revolutions.')
  ]});
  const alternator=parts.find(p=>p.id==='alternator');
  add({id:'charging',title:'The alternator & battery',topic:'basics',intro:'In a conventional combustion car, an engine-driven alternator supplies electrical power and replenishes the battery. The battery stores energy and supports starting. These are different jobs within one charging system.',detail:[alternator.how,alternator.symptoms],photo:alternator.photo,visual:'charging',sources:alternator.sources,questions:[
    choice('charging-0','Which component generates electrical power while the engine runs?',['The alternator','The radiator','The differential'],0,alternator.purpose),
    match('charging-1','Connect each component to its role.',[['Alternator','Generates electrical power'],['Battery','Stores electrical energy'],['Starter','Turns the engine for starting']],'Generating, storing and using electrical energy are separate functions.'),
    choice('charging-2','Does a charging warning prove the alternator is faulty?',['Yes, always','No, the battery, belt and wiring also matter','It proves the radiator is blocked'],1,'A warning identifies a system concern. It does not prove one component failed.')
  ]});
  add({id:'differential',title:'Different speeds. One corner.',topic:'basics',intro:'In a corner, the outside wheel travels a longer path than the inside wheel. A differential lets the driven wheels turn at different speeds while transmitting drive. Its exact layout depends on whether a car uses rear, front or all-wheel drive.',detail:['An open differential and a limited-slip differential use different strategies for torque distribution. A generation code alone does not tell you which configuration a vehicle has.'],visual:'differential',sources:[doc(...sources.s63)],questions:[
    choice('differential-0','Why allow driven wheels to rotate at different speeds?',['The outside wheel travels farther in a corner','To disable all brakes','To generate boost'],0,'The outside wheel follows a larger-radius path and travels farther during the turn.'),
    order('differential-1','Follow drive in a simplified longitudinal rear-drive layout.',['Transmission output','Propeller shaft','Rear differential','Half-shafts and rear wheels'],'This is a generic rear-drive power path; other drivetrains use different layouts.'),
    choice('differential-2','Where would you study torque distribution between driven wheels?',['The differential','The spark plug','The radiator cap'],0,'The differential connects driven axle outputs and permits different wheel speeds.')
  ]});
  const basicIds=['first-engine','transmission','horsepower','torque','rpm'];
  add({id:'basics-checkpoint',title:'Checkpoint: from engine to road',topic:'basics',boss:true,intro:'Bring the first five ideas together. Read each prompt carefully; you can study the explanation and retry whenever an answer needs work.',visual:'transmission',sources:basicSources,questions:[
    match('checkpoint-0','Pair each idea with its meaning.',[['Power','Rate of doing work'],['Torque','Turning effect'],['RPM','Rotational speed']],'The three quantities are related, but each answers a different question.'),
    order('checkpoint-1','Put the simple drive path in order.',['Engine','Transmission','Differential','Driven wheels'],'Engine output passes through the transmission and driven-axle system before reaching the road.'),
    choice('checkpoint-2','An ideal 3:1 reduction receives 3,000 RPM. Output speed is…',['9,000 RPM','1,000 RPM','3,000 RPM'],1,'Speed divides by the reduction ratio: 3,000 ÷ 3 = 1,000 RPM.')
  ]});
  const fourStroke=lessons.find(l=>l.id==='combustion');fourStroke.questions.push(order('combustion-order','Arrange the four strokes in cycle order.',['Intake','Compression','Power','Exhaust'],'One complete four-stroke cycle requires two crankshaft revolutions.'));
  add({id:'basics-finale',title:'Checkpoint: know the machine',topic:'basics',boss:true,intro:'Your first complete systems check. Connect the airflow, cooling, charging and drivetrain ideas you have just learned.',visual:'cooling',sources:[doc(...sources.cooling),doc(...sources.turbo)],questions:[
    match('finale-0','Match the system to the job.',[['Turbocharger','Compresses intake air'],['Radiator','Transfers coolant heat to air'],['Alternator','Generates electrical power'],['Differential','Allows different driven-wheel speeds']],'Each component serves a particular system; similar symptoms can still have multiple causes.'),
    choice('finale-1','Which stream drives a conventional turbocharger turbine?',['Engine coolant','Fresh intake air','Exhaust gas'],2,'Exhaust transfers energy to the turbine; a shared shaft drives the compressor.'),
    order('finale-2','Follow energy through the simplified engine.',['Fuel energy','Combustion pressure','Piston and connecting rod motion','Crankshaft rotation'],'The conversion has heat and friction losses; not all fuel energy becomes mechanical output.')
  ]});
  for(const id of ['transmission','turbocharging','cooling','combustion'])lessons.find(l=>l.id===id).topic='basics';
  const partIds=parts.map((part,i)=>add({id:'part-'+part.id,title:part.name,topic:'parts',intro:part.summary,detail:[part.location,part.how,part.symptoms],photo:part.photo,connections:part.connections,visual:'connections',sources:part.sources,questions:[
    {...choice('part-'+part.id+'-photo','Identify the component in the photograph.',parts.slice(i,i+3).concat(parts.slice(0,Math.max(0,3-(parts.length-i)))).map(p=>p.name),0,part.purpose),photo:part.photo},
    choice('part-'+part.id+'-function','Which statement describes its function?',[part.purpose,parts[(i+2)%parts.length].purpose,parts[(i+4)%parts.length].purpose],0,part.how),
    choice('part-'+part.id+'-symptom','Does a symptom alone prove this component has failed?',['Yes, every symptom identifies one part','No, investigate the full system','Only the component color matters'],1,part.symptoms)
  ]}));
  const modelIds=['f80','g80','f10-m5'];
  const modelLessons=modelIds.map((id,index)=>{
    const model=catalog.find(m=>m.id===id),generation=model.generation.split('/').at(-1).trim(),family=model.code.replace(/TU\d*$/,'');
    const context=model.verified?.specification||model.name+' · '+generation;
    const photos={src:model.car,caption:model.name+' · '+generation,author:model.carCredit.author,license:model.carCredit.license,licenseUrl:model.carCredit.url,page:model.carCredit.page,changes:model.carCredit.changes||'Existing catalog photograph.'};
    const cues={f80:'Look at the four-door sedan body, broad wheel arches and horizontally proportioned twin kidney grille.',g80:'Notice the tall, vertically oriented twin kidney grille and four-door sedan body. A grille is a useful cue, but body shape and the complete view matter too.','f10-m5':'Look at the larger four-door sedan proportions, front bumper air intakes and horizontally proportioned twin kidney grille. This photograph is the F10 M5, not every F10 variant.'};
    return add({id:'model-'+id,title:model.name+' · '+generation,modelId:id,topic:'models',intro:cues[id],detail:[context+' uses the '+family+' engine family.','A generation code does not identify one universal engine. A 5 Series F10 and an M5 F10 have different engine applications; check the specific model, year and market.'],photo:photos,visual:'photo',sources:(model.verified?.sources||[]).map(s=>typeof s==='string'?doc('BMW factory reference',s):doc(s.label||s.title||'BMW factory reference',s.url)),questions:[
      {...choice('model-'+id+'-photo','Which BMW is shown?',modelIds.map(key=>{const m=catalog.find(v=>v.id===key);return m.name+' · '+m.generation.split('/').at(-1).trim();}),index,cues[id]),photo:photos},
      choice('model-'+id+'-engine','Which engine family powers this documented '+model.name+' '+generation+' configuration?',['S55','S58','S63'],['S55','S58','S63'].indexOf(family),'The specific '+context+' uses '+family+'. Other vehicles sharing its generation code may use different engines.'),
      choice('model-'+id+'-scope','Does this generation code establish the engine for every car in the generation?',['Yes, all trims share one engine','No, the exact model and application matter','Only wheel size changes'],1,'A chassis or generation code covers multiple versions. Use the engine and factory documentation for the specific application.')
    ]});
  });
  const engines=[['N54','Twin-turbo inline six','n54'],['N55','Single twin-scroll inline six','n55'],['B58','Modular inline six','b58'],['S63','BMW M V8','s63']];
  const engineIds=engines.map(([code,name,source],i)=>{
    const old=legacy.find(l=>l.id==='engine-codes'),isV8=code==='S63';
    return add({id:'engine-'+code.toLowerCase(),title:code+' · '+name,topic:'engines',intro:old.steps[i][1],detail:[old.content[1],old.content[2]],visual:'engine-codes',visualStep:i,sources:[doc(...sources[source])],questions:[
      choice(code+'-layout','What cylinder arrangement does the '+code+' use?',['Inline six','V8','Flat four'],isV8?1:0,isV8?'The S63 family is a V8: eight cylinders arranged in two banks.':'The '+code+' is an inline-six family: six cylinders in one row.'),
      choice(code+'-application','Which is a documented application in this lesson?',['2011–2012 BMW 335is','2011 BMW 135i','2016 BMW 340i / 740i','BMW M5 F10'],i,old.steps[i][1]),
      choice(code+'-variant','Before assuming a replacement component fits, check…',['Only the engine family letters','Exact variant, production details and vehicle application','Only exterior paint'],1,'Engine families span variants. Shared family naming is not a parts-compatibility guarantee.')
    ]});
  });
  const diagnosticIds=scenarios.map(s=>add({id:'diagnosis-'+s.id,title:s.title,topic:'mechanic',advanced:true,intro:'Read the simulated evidence and choose the conclusion it supports. These exercises teach reasoning; they are not a diagnosis of a real vehicle.',detail:s.clues,visual:s.system==='Cooling'?'cooling':s.system==='Electronics'?'electronics':'turbocharging',sources:[doc(...sources[s.source])],questions:[
    choice('diagnosis-'+s.id+'-0',s.prompt,s.answers,s.correct,s.explanation),
    choice('diagnosis-'+s.id+'-1','What should you do with a clue that contradicts the initial idea?',['Ignore it','Reconsider the idea using all the evidence','Replace every component'],1,'A useful explanation must account for all available evidence, including clues that challenge it.'),
    choice('diagnosis-'+s.id+'-2','Can this simplified exercise prove a specific fault on a real vehicle?',['Yes, symptoms are unique','No, vehicle-specific diagnosis needs more evidence','Yes, if the vehicle is a BMW'],1,'The simulator intentionally limits the possibilities. Real vehicle systems require appropriate checks and specific documentation.')
  ]}));
  const units=[
    {id:'basics',title:'Automotive basics',subtitle:'Your first mile under the hood.',tag:'START HERE',lessons:[...basicIds,'basics-checkpoint','turbocharging','cooling','charging','differential','combustion','basics-finale']},
    {id:'parts',title:'Parts academy',subtitle:'Real components. Connected ideas.',tag:'LOOK CLOSER',lessons:partIds},
    {id:'models',title:'BMW model recognition',subtitle:'Read the design. Learn the application.',tag:'THREE VERIFIED CONFIGURATIONS',lessons:modelLessons},
    {id:'engines',title:'BMW engine academy',subtitle:'Know the family. Check the variant.',tag:'FOUR DOCUMENTED FAMILIES',lessons:['engine-codes',...engineIds]},
    {id:'systems',title:'Mechanical systems',subtitle:'Understand the whole control loop.',tag:'GO DEEPER',lessons:['suspension','electronics','electrification']},
    {id:'mechanic',title:'Mechanic challenges',subtitle:'Follow evidence before conclusions.',tag:'EDUCATIONAL SIMULATIONS',lessons:diagnosticIds}
  ];
  lessons.find(l=>l.id==='engine-codes').topic='engines';
  // Correct choices are deterministically rotated, avoiding an always-first answer pattern.
  for(const lesson of lessons)for(const question of lesson.questions){if(question.type!=='choice')continue;const shift=[...question.id].reduce((n,c)=>n+c.charCodeAt(0),0)%question.answers.length;question.answers=question.answers.slice(shift).concat(question.answers.slice(0,shift));question.correct=(question.correct-shift+question.answers.length)%question.answers.length;}
  return {lessons,units};
}
