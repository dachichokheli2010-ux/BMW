import {mountLearningAcademy} from './academy-ui.js';
import {partCatalog} from './parts.js';

// Original schematics teach system relationships; they are not factory CAD.
const SOURCES = {
  combustion: ['US Department of Energy · combustion basics', 'https://www.energy.gov/cmei/vehicles/articles/internal-combustion-engine-basics'],
  turbo: ['Garrett · how a turbo works', 'https://www.garrettmotion.com/de/turbocharger-technology/how-a-turbo-works/basic/'],
  transmission: ['ZF · torque converters', 'https://www.zf.com/products/en/cars/products_65854.html'],
  cooling: ['HELLA · engine cooling', 'https://www.hella.com/techworld/en/technical/car-cooling-system/engine-cooling/'],
  suspension: ['ZF · how dampers work', 'https://aftermarket.zf.com/en/aftermarket-portal/knowledge-hub/a-guide-on-how-shock-absorbers-work-when-to-replace-them/'],
  electronics: ['Bosch · stability control', 'https://www.bosch-mobility.com/en/solutions/braking-systems/electronic-stability-program/'],
  electric: ['US Department of Energy · electric drive', 'https://afdc.energy.gov/vehicles/electric'],
  history: ['BMW Group · company history', 'https://www.bmwgroup.com/en/company/history.html'],
  m1history: ['BMW M · M1 engine history', 'https://www.bmw-m.com/en/topics/magazine-article-pool/bmw-m-engines.html'],
  m5history: ['BMW M · M5 generation history', 'https://www.bmw-m.com/en/topics/magazine-article-pool/the-generations-of-the-bmw-m5-an-overview.html'],
  m3history: ['BMW · 30 years of the M3', 'https://www.press.bmwgroup.com/usa/article/detail/T0264196EN_US/30-years-of-the-bmw-m3-%E2%80%93-the-story-behind-the-legend?language=en_US'],
  currentM5: ['BMW · seventh-generation M5', 'https://www.press.bmwgroup.com/india/article/detail/T0446483EN/duality-untamed%3A-the-all-new-bmw-m5-launched-in-india?language=en'],
  n55: ['BMW · 2011 135i / N55', 'https://www.press.bmwgroup.com/usa/article/detail/T0076814EN_US/the-2011-bmw-135i-coupe-and-convertible?language=en_US'],
  n54: ['BMW · N54 and N55 applications', 'https://www.press.bmwgroup.com/usa/article/detail/T0451994EN_US/bmw-na-50th-anniversary-%7C-50-stories-for-50-years-chapter-33%3A-%E2%80%9Cjust-for-u-s-%3A-bmw-of-north-america-creates-special-models-with-enhanced-enthusiast-appeal%E2%80%9D?language=en_US'],
  b58: ['BMW · B58 in the 340i and 740i', 'https://www.press.bmwgroup.com/usa/article/detail/T0251866EN_US/bmw-twinpower-turbo-technology-once-again-takes-a-spot-on-2016-wards-10-best-engines-list'],
  s63: ['BMW · fifth-generation M5 / S63', 'https://www.press.bmwgroup.com/canada/article/detail/T0114793EN/the-all-new-bmw-m5?language=en'],
  m3cs: ['BMW · M3 CS and M xDrive', 'https://www.press.bmwgroup.com/global/article/detail/T0407668EN/the-all-new-bmw-m3-cs'],
};
const levels = ['beginner', 'intermediate', 'advanced'];
const titleCase = value => value.charAt(0).toUpperCase() + value.slice(1);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const sourceLink = ([label,url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} <span aria-hidden="true">↗</span></a>`;
const question = (prompt, answers, correct, explanation) => ({prompt, answers, correct, explanation});

export const academyLessons = [
  {
    id:'combustion', title:'The four-stroke engine', summary:'Follow air, compression, combustion and exhaust.', category:'Engine fundamentals', duration:'4 min', source:'combustion',
    content:[
      'A piston slides inside a cylinder. Combustion creates pressure that pushes it down; a connecting rod turns that motion into crankshaft rotation. In a four-stroke petrol engine, intake, compression, power and exhaust complete one cycle.',
      'One four-stroke cycle spans two crankshaft revolutions. The intake valve admits air, both valves close for compression and power, and the exhaust valve opens to release spent gas. A spark initiates combustion in a petrol engine.',
      'Combustion converts only part of fuel energy into useful work. Heat and friction account for losses. Petrol uses spark ignition; a diesel compresses air until it is hot enough to ignite injected fuel. This diagram intentionally simplifies valve timing.'
    ],
    steps:[['Intake','The piston descends. An open intake valve lets fresh air enter.'],['Compression','The piston rises with the valves closed, compressing the charge.'],['Power','Combustion pressure drives the piston down and turns the crankshaft.'],['Exhaust','The piston rises while an open exhaust valve releases spent gas.']],
    quizzes:[
      question('What turns piston motion into rotation?', ['The radiator','The connecting rod and crankshaft','The air filter'],1,'The connecting rod transfers piston force to a crank journal, producing rotation.'),
      question('How far does the crankshaft turn during one four-stroke cycle?', ['One revolution','Two revolutions','Four revolutions'],1,'Four piston strokes complete in two crankshaft revolutions: 720 degrees.'),
      question('What initiates normal combustion in a diesel engine?', ['A spark plug on every stroke','Heat from compressing air, followed by fuel injection','The alternator'],1,'Diesel is a compression-ignition process. It does not use a petrol-style spark to initiate normal combustion.')
    ]
  },
  {
    id:'turbocharging', title:'Air under pressure', summary:'Understand the two sides of a turbocharger.', category:'Air & exhaust', duration:'4 min', source:'turbo',
    content:[
      'Exhaust gas drives a turbine. A shared shaft turns a compressor that supplies compressed intake air. The intake and exhaust streams stay separate. A turbocharger can increase the air mass available for combustion.',
      'Compression heats air. A charge-air cooler removes some of that heat before the air reaches the cylinders. A wastegate can bypass exhaust around the turbine to help control boost.',
      'Single turbo describes a count; twin-scroll describes separated turbine inlet passages. Twin turbo means two units. Variable geometry uses movable vanes to regulate the turbine inlet. These descriptions can overlap; TwinPower Turbo branding alone does not establish turbo count.'
    ],
    steps:[['Exhaust energy','Hot exhaust flows through the turbine housing.'],['Shared shaft','The turbine and compressor rotate together; the gas paths remain separate.'],['Compressed air','The compressor increases intake pressure and also raises air temperature.'],['Charge cooling','The charge-air cooler transfers heat away before the air reaches the engine.']],
    quizzes:[
      question('What powers a conventional exhaust turbocharger?', ['Exhaust flow through the turbine','A belt on the crankshaft','The radiator fan'],0,'The exhaust-driven turbine transfers power through its shaft to the intake-side compressor.'),
      question('Why cool compressed intake air?', ['Compression makes it hot','To mix exhaust into the intake','To stop the crankshaft'],0,'Compression adds heat. Charge cooling reduces intake temperature; the cooler does not connect the two gas streams.'),
      question('Does twin-scroll necessarily mean two turbochargers?', ['Yes, always','No: it describes turbine inlet passages','Only with a six-cylinder engine'],1,'A single turbocharger can have a twin-scroll turbine housing. Turbo count and inlet design describe different things.')
    ], extraSource:['Garrett · variable geometry', 'https://www.garrettmotion.com/turbocharger-technology/broadest-turbo-range/vnt-turbochargers/']
  },
  {
    id:'transmission', title:'From revs to road speed', summary:'Explore speed, torque and gear ratios.', category:'Drivetrain', duration:'3 min', source:'transmission',
    content:[
      'A transmission changes the relationship between engine speed and wheel speed. A low gear delivers more wheel torque for a given engine torque. A higher gear lets the car travel faster at the same engine speed.',
      'In an ideal reduction, output speed equals input speed divided by the ratio, while output torque is multiplied by that ratio. Real gears have losses. The final drive adds another ratio between the transmission and wheels.',
      'Manual gearboxes use a clutch to connect the engine. Many conventional automatics use a fluid torque converter, often with a lock-up clutch to reduce slip. Dual-clutch transmissions use a different arrangement. The ratios below are teaching examples, not BMW transmission specifications.'
    ],
    steps:[['3 : 1','A teaching reduction: 3,000 rpm in → 1,000 rpm out; ideal torque multiplies by three.'],['2 : 1','At 3,000 rpm input, output is 1,500 rpm; ideal torque multiplies by two.'],['1 : 1','Direct ratio: input and output turn at the same speed before the final drive.'],['0.75 : 1','Overdrive: 3,000 rpm in → 4,000 rpm out; ideal output torque is lower.']],
    quizzes:[
      question('What is the purpose of a low gear?', ['Provide more wheel torque at low road speed','Add engine cylinders','Increase battery capacity'],0,'A lower road gear uses greater reduction to multiply torque at the output.'),
      question('With an ideal 3:1 reduction and 3,000 rpm input, what is output speed?', ['9,000 rpm','3,000 rpm','1,000 rpm'],2,'Output speed is input speed divided by the reduction ratio: 3,000 ÷ 3 = 1,000 rpm.'),
      question('Why does a torque converter have a lock-up clutch?', ['To reduce fluid slip when engaged','To double the engine displacement','To replace every gearset'],0,'Lock-up mechanically connects the converter input and output, reducing the losses caused by fluid slip.')
    ]
  },
  {
    id:'engine-codes', title:'Inline-six, V8 & engine codes', summary:'Explore verified BMW engine families.', category:'BMW knowledge', duration:'3 min', source:'n55',
    content:[
      'An engine family code is a more precise clue than a boot badge. BMW identifies the N55 as a turbocharged inline six, and the S63 family underpins the V8 in the F10 M5. A car model badge alone is not a complete engine identification.',
      'Family names such as N55 and B58 cover multiple versions and applications. Production date, market and the complete engine designation matter. Look up a documented example instead of assuming every digit follows one universal rule.',
      'An engine family is not a parts-compatibility guarantee. Changes within a family may alter cooling, fueling, control software or packaging. Use the full vehicle identification and official model documentation when establishing an exact variant.'
    ],
    steps:[['N54','BMW identifies the 335is engine as a twin-turbo N54, contrasting it with the single-turbo N55 in the updated 335i.'],['N55','The 2011 BMW 135i introduction identifies an inline-six petrol engine with one twin-scroll turbocharger and Valvetronic.'],['B58','BMW identifies B58 as the inline-six engine used in the 2016 340i and 740i.'],['S63','BMW’s F10 M5 introduction traces its 4.4-litre V8 to the S63 and describes two twin-scroll turbochargers.']],
    quizzes:[
      question('Which is an engine family code?', ['N55','M Sport exterior package','19-inch wheel'],0,'N55 identifies an engine family. Trim packages and wheel sizes do not identify the engine.'),
      question('Can the same engine family have several versions?', ['Yes, check the exact application','No, every part must be identical','Only electric vehicles do'],0,'A family can span revisions, markets and installations. The exact engine and vehicle documentation matter.'),
      question('Is a shared engine family enough to guarantee parts fitment?', ['Yes, for all components','No, exact variant and application are needed','Yes, if the badge is the same'],1,'Common family naming does not guarantee identical components, packaging or calibration.')
    ], extraSource:SOURCES.s63
  },
  {
    id:'cooling', title:'Keep heat in balance', summary:'Follow coolant around a simplified cooling loop.', category:'Thermal systems', duration:'3 min', source:'cooling',
    content:[
      'Coolant absorbs heat from the engine and carries it to a radiator. Air flowing through the radiator takes heat away. A pump circulates coolant, and a thermostat helps the engine reach and maintain its operating temperature.',
      'During warm-up, a thermostat can restrict radiator flow and route coolant through a bypass. At operating temperature it admits flow to the radiator. A fan supports heat rejection when road airflow is limited.',
      'Modern vehicles may have several thermal circuits, electric pumps and actively controlled valves. A charge-air cooler and an engine-coolant radiator serve different heat-transfer roles, even when an indirect charge cooler uses its own coolant loop.'
    ],
    steps:[['Pump','The pump circulates coolant around the simplified loop.'],['Engine','Coolant absorbs heat from the engine’s metal surfaces.'],['Thermostat','The thermostat regulates the route toward the radiator as temperature changes.'],['Radiator','Heat passes from coolant through the radiator surfaces into surrounding air.']],
    quizzes:[
      question('What does a radiator mainly do?', ['Store engine oil','Transfer coolant heat to the air','Create boost pressure'],1,'The radiator is a heat exchanger between the circulating coolant and outside air.'),
      question('Why can a thermostat restrict radiator flow during warm-up?', ['To help the engine reach operating temperature','To permanently stop coolant circulation','To raise tire pressure'],0,'The bypass circuit supports circulation while limiting heat loss through the radiator during warm-up.'),
      question('Does every charge-air cooler share the engine cooling circuit?', ['Yes, always','No: air-to-air and separate liquid circuits exist','Only when the transmission is manual'],1,'Charge-air cooling can be air-to-air or liquid-cooled. The exact thermal circuits depend on the engine design.')
    ]
  },
  {
    id:'suspension', title:'The contact patch matters', summary:'Discover how springs and dampers work together.', category:'Chassis', duration:'3 min', source:'suspension',
    content:[
      'Springs allow controlled movement between the body and wheels. Dampers resist that motion so the suspension does not keep bouncing. Together they help the tires follow the road.',
      'A damper pushes fluid through controlled passages. This resists compression and rebound and dissipates motion energy as heat. Damping and spring stiffness are different properties.',
      'Adaptive dampers vary their resistance as conditions change. More damping is not automatically better: the tire still needs to follow the road. The diagram shows qualitative movement only and predicts no BMW ride or grip figures.'
    ],
    steps:[['Road input','A road bump moves the wheel relative to the body.'],['Spring compression','The spring deflects and stores energy as the suspension moves.'],['Rebound','The spring releases energy; damping resists uncontrolled oscillation.'],['Settling','The damper dissipates motion energy, helping the suspension settle.']],
    quizzes:[
      question('Which component controls repeated spring bouncing?', ['The damper','The fuel injector','The intake filter'],0,'The damper resists suspension motion and dissipates its energy.'),
      question('What happens to much of the energy dissipated by a hydraulic damper?', ['It becomes heat','It becomes extra fuel','It increases battery voltage directly'],0,'Fluid resistance turns mechanical motion energy into heat in the damper.'),
      question('What changes in an adaptive damper?', ['Its damping resistance','The cylinder count','The tire diameter'],0,'Adaptive damping varies resistance to suspension motion; it does not change tire size or engine configuration.')
    ],extraSource:['ZF · adaptive damping', 'https://www.zf.com/products/en/cars/products_64273.html?pageLink=details_divider658792']
  },
  {
    id:'electronics', title:'Sense. Decide. Respond.', summary:'Understand the control loop behind modern vehicles.', category:'Control systems', duration:'3 min', source:'electronics',
    content:[
      'Sensors measure physical conditions. A controller interprets those signals, then commands actuators. The resulting feedback lets the controller adjust its next command.',
      'Stability control compares driver intent, inferred from steering, with measured vehicle motion. Wheel-speed and yaw sensors provide feedback. The system can reduce drive torque and brake individual wheels.',
      'A fault code reports an observed condition or circuit issue; it does not automatically identify a failed part. A controller depends on plausible signals, electrical supply and network communication. The learning examples simulate reasoning, not a vehicle diagnosis.'
    ],
    steps:[['Sense','Wheel-speed, steering-angle and yaw signals describe driver intent and actual motion.'],['Compare','The controller compares the desired direction with measured movement.'],['Actuate','Torque and individual wheel braking can be adjusted to counter instability.'],['Feedback','New measurements let the controller assess the result and update its response.']],
    quizzes:[
      question('What is the job of a sensor?', ['Measure a physical condition','Choose paint color','Store exhaust gas'],0,'A sensor converts a physical quantity into a signal the controller can interpret.'),
      question('What can electronic stability control do?', ['Adjust drive torque and individual wheel braking','Create unlimited tire grip','Mechanically change the wheelbase'],0,'Stability control can intervene through torque and braking. It remains limited by available traction.'),
      question('Does a fault code prove the named part has failed?', ['No, it describes a detected condition','Yes, with no other evidence','Only on a blue car'],0,'A code is evidence about a detected condition. Wiring, supply, signal plausibility and mechanical causes can lead to similar observations.')
    ]
  },
  {
    id:'electrification', title:'Energy takes another route', summary:'Compare hybrid, plug-in hybrid and battery electric.', category:'Electric powertrains', duration:'4 min', source:'electric',
    content:[
      'A battery-electric vehicle stores electrical energy in a battery and uses an electric motor for propulsion. A hybrid combines a combustion engine with electric drive. A plug-in hybrid can also recharge its battery from an external supply.',
      'An inverter controls electrical power for an AC traction motor. Under suitable braking conditions, the motor can act as a generator and return some motion energy to the battery. Friction brakes remain part of the vehicle.',
      'Regeneration is limited by battery charge state, temperature, grip and system power limits. A conventional hybrid generally does not plug in; a plug-in hybrid does. The flow shown here is a generic teaching layout, not a BMW high-voltage service diagram.'
    ],
    steps:[['Battery','Stored electrical energy is available for propulsion.'],['Inverter','Power electronics control energy delivery to the traction motor.'],['Motor','The motor converts electrical power into mechanical torque at the wheels.'],['Regeneration','During suitable deceleration, energy flows back toward the battery. Not all energy is recovered.']],
    quizzes:[
      question('Which vehicle uses only electric propulsion?', ['Battery-electric vehicle','Conventional petrol car','Every plug-in hybrid'],0,'A battery-electric vehicle has electric propulsion. A plug-in hybrid also includes a combustion engine.'),
      question('What is regenerative braking?', ['Recovering some motion energy as electrical energy','Creating fuel from brake dust','Charging only from the wall'],0,'A motor operating as a generator can recover some kinetic energy during deceleration.'),
      question('Why can regeneration be limited with a nearly full battery?', ['The battery has less capacity available to accept energy','The tires become larger','The car needs a turbo'],0,'The system must limit charging to protect the battery. Friction brakes provide braking when regeneration is unavailable or insufficient.')
    ]
  },
  {
    id:'drivetrain-layouts', title:'RWD or xDrive?', summary:'Follow drive to the rear axle or both axles.', category:'Drivetrain', duration:'3 min', source:'s63', extraSource:SOURCES.m3cs,
    content:[
      'Rear-wheel drive sends drive to the rear axle. BMW’s F10 M5 launch material identifies that model as rear-wheel drive and describes its Active M Differential. This is a documented example, not a rule for every BMW.',
      'BMW describes M xDrive as the all-wheel-drive system in the M3 CS. All-wheel drive can send drive to both axles, but its hardware and behavior depend on the specific model. The diagram compares basic power paths, not exact BMW hardware.',
      'A badge or chassis code alone does not confirm a particular car’s drivetrain. Check the exact model, production details and market documentation before identifying its configuration.'
    ],
    steps:[['Engine and gearbox','The engine’s output passes through the gearbox in both simplified layouts.'],['Rear-wheel drive','A propeller shaft sends drive to the rear differential and rear wheels.'],['All-wheel drive','A transfer path can also send drive to the front axle; the implementation varies by model.'],['Check the model','Use the exact BMW model documentation instead of inferring a system from its badge.']],
    quizzes:[
      question('In the documented F10 M5 example, which axle is driven?', ['Rear axle','Front axle only','Both axles'],0,'BMW’s F10 M5 launch material identifies rear-wheel drive.'),
      question('What does xDrive describe?', ['BMW all-wheel drive','A manual gearbox','A cylinder layout'],0,'xDrive is BMW’s all-wheel-drive name; exact hardware varies by model.'),
      question('Can a chassis code alone prove a car has xDrive?', ['Yes, always','No, confirm the exact model and documentation','Only if it has a V8'],1,'A chassis or generation can include different versions. Verify the exact vehicle application.')
    ]
  },
  {
    id:'m-performance', title:'What changes on an M car?', summary:'Explore documented M powertrain, drivetrain and chassis examples.', category:'BMW M', duration:'4 min', source:'s63', extraSource:SOURCES.m3cs,
    content:[
      'There is no single parts list that describes every BMW M car. BMW’s F10 M5 launch material documents an S63 V8, rear-wheel drive and an Active M Differential, alongside M-specific chassis and braking systems.',
      'BMW’s M3 CS release documents a different combination, including M xDrive. These examples show why the engine, drivetrain and chassis should be checked for the exact model rather than assumed from the M name alone.',
      'M equipment and engineering vary across models and generations. The illustration groups areas to investigate; it is not a checklist of parts shared by all M cars. Follow the linked BMW documentation for each example.'
    ],
    quizzes:[
      question('Which configuration does BMW document for the F10 M5 in the linked launch material?', ['S63 V8, rear-wheel drive and Active M Differential','Inline-six, front-wheel drive and open differential','Battery-electric drive only'],0,'The linked BMW F10 M5 material documents the S63 V8, rear-wheel drive and Active M Differential.'),
      question('What is the safe way to identify an M car’s hardware?', ['Assume every generation uses the same parts','Check the official information for its exact model','Use the exterior badge alone'],1,'BMW’s documented examples differ. Use the exact model and source rather than generalizing.'),
      question('Which system is identified for the M3 CS in the linked BMW release?', ['M xDrive','A manual-only gearbox','Front-wheel drive'],0,'BMW identifies M xDrive in its M3 CS release; this does not establish specifications for other models.')
    ]
  }
];

export const engineCodeEntries = [
  {code:'N54',name:'Twin-turbo inline six',description:'A BMW petrol inline-six family. BMW identifies the 335is engine as a twin-turbo N54 and contrasts it with the single-turbo N55 in the updated 335i.',example:'Documented example: 2011–2012 BMW 335is.',source:'n54'},
  {code:'N55',name:'Single twin-scroll inline six',description:'BMW’s 2011 135i material identifies the N55 as an inline-six petrol engine combining a single twin-scroll turbocharger, direct injection and Valvetronic.',example:'Documented example: 2011 BMW 135i.',source:'n55'},
  {code:'B58',name:'Modular inline-six family',description:'BMW identifies B58 as a six-cylinder engine used in the 2016 340i Sedan and 740i. Later variants and other applications require their own documentation.',example:'Documented examples: 2016 BMW 340i and 740i.',source:'b58'},
  {code:'S63',name:'BMW M V8 family',description:'BMW’s F10 M5 launch material describes a 4.4-litre V8 developed from S63, with two twin-scroll turbochargers in the space between its cylinder banks.',example:'Documented example: fifth-generation BMW M5 (F10).',source:'s63'}
];

const timeline = [
  {year:'1916',title:'Origins in aviation',text:'BMW uses 7 March 1916, the founding date of Bayerische Flugzeugwerke, as its official founding date.'},
  {year:'1923',title:'The first BMW motorcycle',text:'The R 32 establishes BMW as a motorcycle manufacturer.'},
  {year:'1928',title:'Into automobile production',text:'BMW enters car production through its acquisition of Fahrzeugfabrik Eisenach.'},
  {year:'1972',title:'Motorsport gets a home',text:'BMW Motorsport GmbH is established, the foundation of today’s BMW M GmbH.'},
  {year:'2013',title:'The electric i3 arrives',text:'The i3 launches as the BMW Group’s first series-produced fully electric model.'}
];
const mTimeline = [
  {year:'1972',title:'BMW Motorsport is founded',text:'BMW establishes BMW Motorsport GmbH. The company later becomes BMW M GmbH.',source:SOURCES.history},
  {year:'1978',title:'The M1 reaches production',text:'The M1 becomes the first road car developed by BMW Motorsport.',source:SOURCES.m1history},
  {year:'1984',title:'The first M5',text:'The first BMW M5 arrives, bringing motorsport-developed performance to a production sedan.',source:SOURCES.m5history},
  {year:'1986',title:'The M3 begins',text:'The first BMW M3 enters production as a road-going model rooted in touring-car competition.',source:SOURCES.m3history},
  {year:'2023',title:'The M3 CS',text:'BMW introduces the M3 CS with a 405 kW / 550 hp inline-six and M xDrive.',source:SOURCES.m3cs},
  {year:'2024',title:'Electrified M5 generation',text:'The latest M5 generation adds a plug-in hybrid drivetrain to the model line.',source:SOURCES.currentM5}
];
const mechanicParts = ['air-filter','turbocharger','throttle-body','fuel-injector','ignition-coil','spark-plug'].map(id=>partCatalog.find(part=>part.id===id)).filter(Boolean);
const scenarios = [
  {id:'cooling-flow',title:'Heat at a standstill',system:'Cooling',clues:['Simulated engine temperature rises while stationary.','Temperature returns toward normal when road airflow increases.','The simulator reports normal coolant circulation.'],prompt:'Which system most directly matches the airflow clue?',answers:['Radiator fan / airflow control','Spark-plug gap','Transmission gear ratio'],correct:0,explanation:'The radiator needs airflow to reject heat. A fan provides it at low speed. In this deliberately limited scenario, the contrast between stationary and moving points toward fan or airflow control. It does not prove which component failed in a real vehicle.',source:'cooling'},
  {id:'boost-path',title:'Pressure takes a detour',system:'Air & exhaust',clues:['Simulated requested boost exceeds measured intake pressure.','The turbo speed signal follows its expected pattern.','A simulated charge pipe has an open gap downstream of the compressor.'],prompt:'What is the clearest explanation in this simulation?',answers:['A larger battery is needed','Compressed intake air escapes before reaching the engine','The coolant is too cold'],correct:1,explanation:'The visible gap is after the compressor, so some compressed intake air escapes. Low measured boost alone would have several possible causes; the extra simulator evidence makes an intake-path leak the supported answer here.',source:'turbo'},
  {id:'signal-plausibility',title:'A signal that disagrees',system:'Electronics',clues:['Three wheel-speed traces rise smoothly together.','One trace jumps instantly between zero and a very high value.','The simulated vehicle continues moving smoothly.'],prompt:'What is the strongest conclusion supported by these clues?',answers:['The wheel instantly changes its physical size','The controller has an implausible wheel-speed signal','All four tires have lost pressure'],correct:1,explanation:'An abrupt, isolated signal change conflicts with the smooth simulated vehicle motion. That supports a signal-plausibility problem. The clues do not distinguish the sensor itself from its wiring, supply or signal processing.',source:'electronics'}
];
let instanceCount = 0;

function svgFrame(title,description,body) {
  return `<svg class="ac-diagram" data-ac-diagram viewBox="0 0 640 300" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><desc>${esc(description)}</desc><defs><pattern id="ac-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="currentColor" stroke-opacity=".055"/></pattern></defs><rect width="640" height="300" fill="url(#ac-grid)"/>${body}</svg>`;
}
function label(x,y,text,color='currentColor',size=13){return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="middle" font-family="inherit">${esc(text)}</text>`;}
function flowLine(path,active,color='#68b3ff'){return `<path d="${path}" fill="none" stroke="${color}" stroke-width="${active?6:3}" opacity="${active?1:.3}" ${active?'class="ac-flow"':''}/>`;}
function diagramFor(id,step) {
  const accent='#68b3ff', warm='#f4a275';
  if(id==='combustion'){
    const top=[174,98,174,98][step],intake=step===0,exhaust=step===3;
    return svgFrame('Four-stroke cylinder: '+(step===2?'Power stroke':academyLessons[0].steps[step][0]),'A simplified piston, connecting rod and crankshaft. Valve positions and piston position change with the selected stroke.',`<path d="M232 76V222H408V76" fill="none" stroke="currentColor" stroke-width="5"/><rect x="237" y="80" width="166" height="${top-80}" fill="${step===2?warm:accent}" opacity=".17"/><path d="M245 75H285M355 75H395" stroke="${intake?accent:'currentColor'}" stroke-width="7"/><path d="M${intake?267:263} 49V${intake?95:75}M${exhaust?377:373} 49V${exhaust?95:75}" stroke="${exhaust?warm:accent}" stroke-width="5"/><rect x="239" y="${top}" width="162" height="22" rx="3" fill="${accent}"/><path d="M320 ${top+22}L${step%2?346:294} 246L320 265" fill="none" stroke="currentColor" stroke-width="9"/><circle cx="320" cy="265" r="16" fill="none" stroke="currentColor" stroke-width="4"/>${label(320,35,step===2?'COMBUSTION':'FOUR-STROKE PETROL',step===2?warm:accent)}${label(150,100,'Intake',accent)}${label(490,100,'Exhaust',warm)}${label(492,top+16,'Piston')}${label(164,264,'Crankshaft')}${step===2?'<path d="M320 50L310 69H326L316 89" fill="none" stroke="#f4a275" stroke-width="4"/>':''}`);
  }
  if(id==='turbocharging'){
    const turbine=step<2,compressor=step===1||step===2;
    return svgFrame('Turbocharger energy and airflow','The turbine and compressor share a shaft. Hot exhaust and fresh intake air remain in separate paths. The intake path leads through a charge-air cooler.',`${flowLine('M25 82H210',turbine,warm)}${flowLine('M210 148H25',step===0,warm)}<circle cx="225" cy="112" r="54" fill="none" stroke="${warm}" stroke-width="4"/><circle cx="415" cy="112" r="54" fill="none" stroke="${accent}" stroke-width="4"/><path d="M245 112H395" stroke="currentColor" stroke-width="8"/>${[225,415].map((x,i)=>`<g class="${(i?compressor:turbine)?'ac-rotor':''}" style="transform-origin:${x}px 112px"><path d="M${x} 72V152M${x-40} 112H${x+40}M${x-28} 84L${x+28} 140M${x-28} 140L${x+28} 84" stroke="${i?accent:warm}" stroke-width="6"/></g>`).join('')}${flowLine('M610 82H466',compressor)}${flowLine('M466 142H555V225H430',step>=2)}<rect x="300" y="201" width="130" height="52" rx="5" stroke="${accent}" fill="none" stroke-width="3"/>${Array.from({length:8},(_,i)=>`<path d="M${311+i*15} 206V248" stroke="${accent}" opacity=".4"/>`).join('')}${flowLine('M300 227H130',step===3)}${label(100,60,'Exhaust in',warm)}${label(100,174,'Exhaust out',warm)}${label(548,60,'Fresh air',accent)}${label(320,95,'Shaft')}${label(225,187,'Turbine',warm)}${label(415,187,'Compressor',accent)}${label(365,282,'Charge-air cooler')}${label(165,215,'To engine',accent)}`);
  }
  if(id==='transmission'){
    const ratios=[3,2,1,.75],ratio=ratios[step];
    return svgFrame('Illustrative transmission ratio','Example gear ratios show input speed, output speed and ideal torque multiplication, without final drive or real losses.',`<circle cx="215" cy="137" r="60" fill="none" stroke="${accent}" stroke-width="8"/><circle cx="${285+40*ratio/3}" cy="137" r="${22+38*ratio/3}" fill="none" stroke="currentColor" stroke-width="8"/><circle cx="215" cy="137" r="11" fill="${accent}"/>${flowLine('M35 137H147',true)}${flowLine('M405 137H604',true)}${label(78,112,'INPUT',accent)}${label(540,112,'OUTPUT',accent)}${label(80,171,'3,000 rpm')}${label(540,171,Math.round(3000/ratio).toLocaleString()+' rpm')}${label(320,244,ratio+' : 1  •  ideal torque × '+(1*ratio).toFixed(2))}${label(320,276,'Illustrative ratios · losses and final drive excluded','currentColor',12)}`);
  }
  if(id==='engine-codes'){
    const entry=engineCodeEntries[step],v=step===3;
    return svgFrame(entry.code+' engine family schematic','A family-level cylinder-arrangement illustration, not a factory model.',`${label(320,62,entry.code,accent,42)}${v?Array.from({length:4},(_,i)=>`<g><circle cx="${212+i*59}" cy="128" r="20" fill="${accent}" opacity=".35"/><circle cx="${212+i*59}" cy="186" r="20" fill="${accent}" opacity=".35"/></g>`).join(''):Array.from({length:6},(_,i)=>`<circle cx="${165+i*62}" cy="157" r="23" fill="none" stroke="${accent}" stroke-width="4"/>`).join('')}${label(320,246,v?'V8 · two banks of four cylinders':'Inline six · one row of six cylinders')}${label(320,274,'Family illustration · variants require documentation','currentColor',12)}`);
  }
  if(id==='cooling'){
    const nodes=[['Pump',115,145],['Engine',300,75],['Thermostat',490,145],['Radiator',300,225]];
    return svgFrame('Simplified coolant loop','The pump circulates coolant through the engine, thermostat and radiator. The highlighted element follows the selected step.',`${flowLine('M150 125L265 89',step===0)}${flowLine('M337 89L455 125',step===1,warm)}${flowLine('M455 164L338 210',step===2,warm)}${flowLine('M261 210L149 165',step===3)}${nodes.map(([name,x,y],i)=>`<rect x="${x-64}" y="${y-25}" width="128" height="50" rx="5" fill="${step===i?'#234769':'#172333'}" stroke="${step===i?accent:'currentColor'}" stroke-width="${step===i?3:1}"/>${label(x,y+5,name,'#edf4ff')}`).join('')}${label(320,154,'HEAT → AIR',warm,13)}`);
  }
  if(id==='suspension'){
    const shift=[0,-20,14,0][step];
    return svgFrame('Spring and damper schematic','A wheel moves relative to the body. The spring stores energy and the damper resists motion. Positions are illustrative.',`<path d="M170 62H475" stroke="currentColor" stroke-width="14"/><path d="M244 68V90L226 ${105+shift/5}L260 ${125+shift/3}L226 ${145+shift/2}L260 ${165+shift/1.7}L244 ${188+shift}V${213+shift}" stroke="${accent}" fill="none" stroke-width="5"/><path d="M371 68V${128+shift}" stroke="currentColor" stroke-width="6"/><rect x="353" y="${117+shift}" width="36" height="80" rx="5" fill="#172333" stroke="${accent}" stroke-width="4"/><path d="M371 ${197+shift}V${213+shift}M215 ${213+shift}H412" stroke="currentColor" stroke-width="7"/><circle cx="313" cy="${227+shift}" r="33" fill="none" stroke="currentColor" stroke-width="12"/><path d="M100 278H540" stroke="currentColor" stroke-opacity=".3" stroke-width="4"/>${label(128,65,'Body')}${label(156,153,'Spring',accent)}${label(457,153,'Damper',accent)}${label(478,258,step===3?'Settled':'Road input')}`);
  }
  if(id==='electronics'){
    const nodes=[['Sensors',130,105],['Controller',320,105],['Actuators',510,105],['Feedback',320,225]];
    return svgFrame('Electronic control feedback loop','Sensors feed a controller, the controller commands actuators, and measurements provide feedback.',`${flowLine('M195 105H255',step===0)}${flowLine('M385 105H445',step===1)}${flowLine('M510 134V225H385',step===2)}${flowLine('M255 225H130V134',step===3)}${nodes.map(([name,x,y],i)=>`<rect x="${x-65}" y="${y-28}" width="130" height="56" rx="5" fill="${step===i?'#234769':'#172333'}" stroke="${step===i?accent:'currentColor'}" stroke-width="${step===i?3:1}"/>${label(x,y+5,name,'#edf4ff')}`).join('')}`);
  }
  if(id==='drivetrain-layouts'){
    const rwd=step===1,awd=step===2;
    return svgFrame('Rear-wheel drive and all-wheel drive comparison','Simplified power paths: rear-wheel drive sends drive to the rear axle; all-wheel drive can send drive to both axles. Exact vehicle hardware varies.',`<text x="68" y="77" fill="${accent}" font-size="17" font-family="inherit">RWD</text><rect x="105" y="45" width="176" height="54" rx="6" fill="${rwd?'#234769':'#172333'}" stroke="${rwd?accent:'currentColor'}"/><text x="193" y="78" fill="currentColor" font-size="13" text-anchor="middle" font-family="inherit">Engine + gearbox</text><rect x="465" y="45" width="138" height="54" rx="6" fill="${rwd?'#234769':'#172333'}" stroke="${rwd?accent:'currentColor'}"/><text x="534" y="78" fill="currentColor" font-size="13" text-anchor="middle" font-family="inherit">Rear axle</text>${flowLine('M281 72H465',rwd)}<text x="68" y="183" fill="${accent}" font-size="17" font-family="inherit">xDrive</text><rect x="105" y="151" width="176" height="54" rx="6" fill="${awd?'#234769':'#172333'}" stroke="${awd?accent:'currentColor'}"/><text x="193" y="184" fill="currentColor" font-size="13" text-anchor="middle" font-family="inherit">Engine + gearbox</text><rect x="465" y="151" width="138" height="54" rx="6" fill="${awd?'#234769':'#172333'}" stroke="${awd?accent:'currentColor'}"/><text x="534" y="184" fill="currentColor" font-size="13" text-anchor="middle" font-family="inherit">Rear axle</text><rect x="298" y="227" width="142" height="48" rx="6" fill="${awd?'#234769':'#172333'}" stroke="${awd?accent:'currentColor'}"/><text x="369" y="257" fill="currentColor" font-size="13" text-anchor="middle" font-family="inherit">Front axle</text>${flowLine('M281 178H465',awd)}${flowLine('M350 178V227',awd)}${label(320,294,'Simplified power paths',undefined,12)}`);
  }
  if(id==='m-performance'){
    const areas=[['Powertrain','Engine and output'],['Drivetrain','Drive to the wheels'],['Chassis','Suspension and setup'],['Brakes','Model-specific braking']];
    return svgFrame('Areas to check in a BMW M model','BMW M models differ. The cards group areas documented for the linked F10 M5 and M3 CS examples; they are not a shared-parts checklist.',`${areas.map(([name,detail],i)=>{const x=38+i*151;return `<rect x="${x}" y="74" width="132" height="144" rx="7" fill="#172333" stroke="${i===0?accent:'currentColor'}"/><text x="${x+66}" y="119" fill="${i===0?accent:'currentColor'}" font-size="14" text-anchor="middle" font-family="inherit">${esc(name)}</text><text x="${x+66}" y="159" fill="currentColor" font-size="10" text-anchor="middle" font-family="inherit">${esc(detail)}</text>`;}).join('')}${label(320,264,'Examples vary by exact model and generation',undefined,12)}`);
  }
  const reverse=step===3;
  return svgFrame('Generic electric propulsion and regeneration','A battery, inverter and motor connect to the wheels. Regeneration reverses the direction of electrical energy flow.',`<rect x="55" y="94" width="125" height="88" rx="6" fill="none" stroke="${step===0?accent:'currentColor'}" stroke-width="3"/>${[0,1,2,3].map(i=>`<rect x="${68+i*26}" y="108" width="18" height="50" fill="${accent}" opacity=".3"/>`).join('')}<rect x="260" y="99" width="115" height="78" rx="6" fill="none" stroke="${step===1?accent:'currentColor'}" stroke-width="3"/><path d="M277 138Q286 111 296 138T316 138T336 138T356 138" fill="none" stroke="${accent}" stroke-width="3"/><circle cx="500" cy="138" r="48" fill="none" stroke="${step===2?accent:'currentColor'}" stroke-width="3"/>${label(500,147,'M',accent,27)}${flowLine(reverse?'M260 138H180':'M180 138H260',step!==2)}${flowLine(reverse?'M452 138H375':'M375 138H452',step!==0)}${label(218,126,reverse?'←':'→',accent,24)}${label(415,126,reverse?'←':'→',accent,24)}${label(118,215,'Battery')}${label(317,215,'Inverter')}${label(500,215,'Motor / generator')}${label(320,268,reverse?'REGENERATION · energy toward battery':'PROPULSION · energy toward wheels',accent,13)}`);
}

export function mountAcademy(container, options={}) {
  return mountLearningAcademy(container, options, {lessons:academyLessons, sources:SOURCES, levels, engineCodeEntries, timeline, mTimeline, scenarios, diagramFor});
}
export const academyReferenceData = {sources:SOURCES,scenarios,timeline,mTimeline};
