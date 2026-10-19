// These credit challenges are checked on the server. Local Academy/Arcade XP
// remains separate and cannot be submitted as a spendable wallet balance.
export const communityQuestions=[
 ['four-strokes','Which order describes a four-stroke petrol engine?',['Intake, compression, power, exhaust','Compression, exhaust, power, intake','Power, intake, exhaust, compression'],0,'A full cycle uses intake, compression, power and exhaust strokes.'],
 ['turbo-energy','What normally drives a turbocharger turbine?',['The battery','Exhaust gas energy','The crankshaft belt'],1,'Exhaust gas spins the turbine, which drives the compressor.'],
 ['intercooler','Why cool compressed intake air?',['To increase its density','To burn engine oil','To replace the radiator'],0,'Cooler compressed air is denser; cooling also helps control combustion temperatures.'],
 ['differential','What does a differential allow in a corner?',['Both tyres must turn equally','The engine to stop','Driven wheels to turn at different speeds'],2,'The outside wheel travels farther than the inside wheel through a corner.'],
 ['torque','Which is a unit of torque?',['Newton metre','Kilowatt-hour','Kilometre per hour'],0,'Torque is a turning effect measured in newton metres.'],
 ['battery','What does kWh describe for a battery?',['Peak motor torque','Stored energy','Charging connector width'],1,'Kilowatt-hours describe energy, whereas kilowatts describe power.'],
 ['abs','What is the main purpose of ABS during hard braking?',['Make the car accelerate','Lock all wheels','Help prevent sustained wheel lock'],2,'ABS modulates brake pressure to help prevent sustained wheel lock.'],
 ['e30','Which M3 generation came first?',['E46','E30','F80'],1,'The E30 was the first BMW M3 generation.'],
 ['s65','How many cylinders does the E92 M3 S65 have?',['Six','Ten','Eight'],2,'The S65 is the naturally aspirated V8 used by the E9x M3.'],
 ['s85','What engine layout powers the E60 M5 S85?',['V10','Inline-four','V12'],0,'The E60 M5 uses the naturally aspirated S85 V10.'],
 ['s54','The E46 M3 S54 has which layout?',['V8','Inline-six','Flat-six'],1,'The S54 is a naturally aspirated inline-six.'],
 ['f80','Which engine family powers the F80 M3?',['S55','S65','M20'],0,'The F80 M3 uses the twin-turbo S55 inline-six.'],
 ['g80','Which engine family powers the G80 M3?',['S85','S58','S62'],1,'The G80 M3 uses the twin-turbo S58 inline-six.'],
 ['m8','The F92 is the body code for which BMW?',['M2 Coupé','M5 Touring','M8 Coupé'],2,'F92 identifies the M8 Coupé within the 8 Series family.'],
 ['regen','What happens during regenerative braking?',['Some motion energy returns to the battery','Fuel is added to the brakes','Tyre pressure rises automatically'],0,'The electric motor can act as a generator and recover some kinetic energy.'],
 ['oil','What is one key role of engine oil?',['Replace brake fluid','Reduce friction between moving parts','Inflate the tyres'],1,'Oil lubricates moving parts and also helps with cooling and contamination control.'],
 ['camshaft','What does a camshaft control in a piston engine?',['Valve timing','Wheel alignment','Battery charge level'],0,'The camshaft controls the opening and closing of engine valves.'],
 ['coolant','What does the cooling system help control?',['Radio reception','Engine operating temperature','Gear ratios'],1,'Coolant carries heat from the engine toward the radiator.'],
 ['rwd','What does rear-wheel drive mean?',['Only the rear wheels steer','All four wheels are always driven','Engine torque is sent to the rear wheels'],2,'Rear-wheel drive sends propulsion torque to the rear axle.'],
 ['clutch','A manual gearbox clutch primarily connects and disconnects what?',['Engine and transmission','Radiator and fan','Steering wheel and tyres'],0,'The clutch allows the engine and gearbox input to be coupled or separated.'],
 ['unsprung','Which component contributes to unsprung mass?',['The dashboard','A wheel and tyre','The roof lining'],1,'Wheels, tyres and parts of the suspension move with the wheel rather than the body.'],
 ['spark','What normally ignites the mixture in a petrol engine?',['A spark plug','A brake disc','The air filter'],0,'A spark plug supplies the ignition spark in a spark-ignition petrol engine.'],
 ['catalyst','What is a catalytic converter designed to reduce?',['Wheel diameter','Harmful exhaust emissions','Engine displacement'],1,'A catalytic converter helps convert certain harmful exhaust gases into less harmful substances.'],
 ['pressure','Why check tyre pressure when the tyres are cold?',['Hot air has no pressure','Brakes need more power','Driving warms the air and changes the reading'],2,'Temperature affects pressure, so the specified cold pressure is the consistent reference.']
].map(([id,prompt,options,answer,explanation])=>({id,prompt,options,answer,explanation}));
