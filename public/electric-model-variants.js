const electricDescription='Battery-electric drive with a high-voltage battery, electric motor and fixed-ratio drive. Exact equipment and battery capacity vary by market and model year.';
const driveParts=[
  {name:'Overview',title:'Electric drive',text:electricDescription},
  {name:'Battery',title:'High-voltage battery',text:'The traction battery stores electrical energy for the electric drive. Usable capacity depends on the selected specification and is listed separately from gross capacity where BMW publishes both.'},
  {name:'Regeneration',title:'Recover energy while slowing down',text:'The drive motor can act as a generator during deceleration. The friction brakes remain essential, and energy recovery depends on operating conditions.'},
  {name:'Gearing',title:'Fixed-ratio drive',text:'A fixed-ratio transmission transfers electric-motor output to the driven wheels. The BMW drive configuration shown is specific to the model and market listed.'}
];

export const electricModelVariants=[
  {
    id:'i4-edrive35',photoBase:'i4',name:'BMW i4 eDrive35',title:'i4 eDrive35',generation:'BMW i / G26',
    subtitle:'Single rear electric motor and fixed-ratio drive.',
    code:'eDrive',layout:'Rear-wheel drive',shortLayout:'ELECTRIC / REAR-WHEEL DRIVE',
    power:210,powerUnit:'kW',torque:400,torqueUnit:'Nm',induction:'Electric drive',
    market:'2024 BMW i4 update (German-market figures)',source:'https://www.press.bmwgroup.com/belux/article/detail/T0441410FR/la-nouvelle-bmw-i4-et-la-nouvelle-bmw-s%C3%A9rie-4-gran-coup%C3%A9',
    body:'Sedans',powertrain:'Electric',cylinders:0,turbos:0,engine:null,parts:driveParts,
    description:electricDescription,
    photoNote:'G26 i4 body-style reference. This photograph does not verify the eDrive35 trim, battery or market.'
  },
  {
    id:'i4-xdrive40',photoBase:'i4',name:'BMW i4 xDrive40',title:'i4 xDrive40',generation:'BMW i / G26',
    subtitle:'Dual-motor all-wheel drive with a 295 kW system output and 600 Nm peak torque.',
    code:'eDrive',layout:'All-wheel drive',shortLayout:'ELECTRIC / ALL-WHEEL DRIVE',
    power:295,powerUnit:'kW',torque:600,torqueUnit:'Nm',induction:'Electric drive',
    market:'2024 BMW i4 update (German-market figures)',source:'https://www.press.bmwgroup.com/belux/article/detail/T0441410FR/la-nouvelle-bmw-i4-et-la-nouvelle-bmw-s%C3%A9rie-4-gran-coup%C3%A9',
    body:'Sedans',powertrain:'Electric',cylinders:0,turbos:0,engine:null,parts:driveParts,
    description:electricDescription,
    photoNote:'G26 i4 body-style reference. This photograph does not verify the xDrive40 trim, battery or market.'
  },
  {
    id:'u11-ix1-edrive20',photoBase:'u11-ix1',name:'BMW iX1 eDrive20',title:'iX1 eDrive20',generation:'BMW i / U11',
    subtitle:'Single front electric motor, front-wheel drive and a 64.7 kWh usable battery.',
    code:'eDrive',layout:'Front-wheel drive',shortLayout:'ELECTRIC / FRONT-WHEEL DRIVE',
    power:150,powerUnit:'kW',torque:247,torqueUnit:'Nm',induction:'64.7 kWh usable',
    market:'2023 BMW iX1 eDrive20 (Slovakia)',source:'https://www.press.bmwgroup.com/slovak/article/detail/T0436698SK/atrakt%C3%ADvny-vstup-do-sveta-pr%C3%A9miovej-elektrickej-mobility:-%C3%BAplne-nov%C3%BD-model-bmw-ix1-edrive20',
    body:'SUVs',powertrain:'Electric',cylinders:0,turbos:0,engine:null,parts:driveParts,
    description:electricDescription,
    photoNote:'U11 iX1 body-style reference. The photograph does not verify the eDrive20 trim or front-wheel-drive configuration.'
  },
  {
    id:'u10-ix2-edrive20',photoBase:'u10-ix2',name:'BMW iX2 eDrive20',title:'iX2 eDrive20',generation:'BMW i / U10',
    subtitle:'Single front electric motor, front-wheel drive and a 64.78 kWh usable battery.',
    code:'eDrive',layout:'Front-wheel drive',shortLayout:'ELECTRIC / FRONT-WHEEL DRIVE',
    power:150,powerUnit:'kW',torque:247,torqueUnit:'Nm',induction:'64.78 kWh usable',
    market:'2024 BMW iX2 eDrive20 (German-market figures)',source:'https://www.press.bmwgroup.com/belux/article/detail/T0439385FR/new-entry-level-variant-for-the-bmw-ix2-launch-of-the-bmw-x2-xdrive20d',
    body:'SUVs',powertrain:'Electric',cylinders:0,turbos:0,engine:null,parts:driveParts,
    description:electricDescription,
    photoNote:'U10 iX2 body-style reference. The photograph does not verify the eDrive20 trim or front-wheel-drive configuration.'
  }
];
