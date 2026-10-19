// Expanded facts are deliberately limited to matching, identified factory specifications.
// Preserve the original catalogue's market, power units, photographs and source URLs.
// A missing record is unknown, never a reason to infer a specification from the chassis.
const f10Source = 'https://www.press.bmwgroup.com/global/article/attachment/T0122682EN/178942';
const e92Source = 'https://www.press.bmwgroup.com/usa/article/attachment/T0017783EN_US/35231';
const g80Source = 'https://www.press.bmwgroup.com/usa/article/detail/T0317577EN_US/the-new-2021-bmw-m3-sedan-and-m4-coupe';
const g82Source = 'https://www.press.bmwgroup.com/united-kingdom/article/attachment/T0316947EN_GB/461132';
const g87Source = 'https://www.press.bmwgroup.com/ireland/article/attachment/T0404612EN/568013';
const g81Source = 'https://www.press.bmwgroup.com/global/article/attachment/T0399336EN/615239';
const f80Source = 'https://www.press.bmwgroup.com/usa/article/attachment/T0160684EN_US/391902';
const cslSource = 'https://www.press.bmwgroup.com/italy/article/attachment/T0082320IT/125300';
const cslLaunch = 'https://www.press.bmwgroup.com/asia/article/detail/T0048019EN/the-new-bmw-m3-csl-intelligent-lightweight-technology-and-supreme-driving-dynamics';

export const verifiedSpecs = Object.freeze({
  'f92-m8':Object.freeze({
    specification:'BMW M8 Competition Coupé F92 · ACEA launch specification · June 2019',modelYear:2019,
    displacementCc:4395,transmission:'8-speed M Steptronic with Drivelogic',drivetrain:'M xDrive all-wheel drive',
    acceleration100:3.2,topSpeed:250,topSpeedOptional:305,
    topSpeedNote:'250 km/h electronically limited; 305 km/h with the optional M Driver’s Package.',
    weightKg:1885,weightDIN:1885,weightEU:1960,weightConvention:'DIN unladen, June 2019 ACEA launch specification; EU mass 1,960 kg. Later specification updates may differ.',
    lengthMm:4867,widthMm:1907,heightMm:1362,wheelbaseMm:2827,
    dimensionNote:'Unladen body dimensions, excluding mirrors; Competition Coupé column, page 3.',
    powerKw:460,powerPS:625,torqueNm:750,powerRPM:[6000,6000],torqueRPM:[1800,5800],maxRPM:7200,
    sources:Object.freeze([
      {title:'BMW M8 Competition Coupé technical specifications · June 2019 · pages 3–4',url:'https://www.press.bmwgroup.com/global/article/attachment/T0296150EN/430870'},
      {title:'BMW M8 launch release · June 2019 · engine, transmission and acceleration',url:'https://www.press.bmwgroup.com/global/article/detail/T0296150EN/the-new-bmw-m8-coupe-and-bmw-m8-competition-coupe-the-new-bmw-m8-convertible-and-bmw-m8-competition-convertible'}
    ]),
    verificationNote:'The 2019 Competition Coupé is kept separate from the Convertible and later updates. The European 460 kW / 625 rating uses metric horsepower (PS), although the English table labels it hp.'
  }),
  'f91-m8-convertible':Object.freeze({
    specification:'BMW M8 Competition Convertible F91 · ACEA launch specification · June 2019',modelYear:2019,
    displacementCc:4395,transmission:'8-speed M Steptronic with Drivelogic',drivetrain:'M xDrive all-wheel drive',
    acceleration100:3.3,topSpeed:250,topSpeedOptional:305,
    topSpeedNote:'250 km/h electronically limited; 305 km/h with the optional M Driver’s Package.',
    weightKg:2010,weightDIN:2010,weightEU:2085,weightConvention:'DIN unladen, June 2019 ACEA launch specification; EU mass 2,085 kg.',
    lengthMm:4867,widthMm:1907,heightMm:1353,wheelbaseMm:2827,
    dimensionNote:'Unladen body dimensions, excluding mirrors; Competition Convertible column, page 3.',
    powerKw:460,powerPS:625,torqueNm:750,powerRPM:[6000,6000],torqueRPM:[1800,5800],maxRPM:7200,
    sources:Object.freeze([
      {title:'BMW M8 Competition Convertible technical specifications · June 2019 · pages 3–4',url:'https://www.press.bmwgroup.com/global/article/attachment/T0296150EN/430871'},
      {title:'BMW M8 launch release · June 2019 · Competition Convertible',url:'https://www.press.bmwgroup.com/global/article/detail/T0296150EN/the-new-bmw-m8-coupe-and-bmw-m8-competition-coupe-the-new-bmw-m8-convertible-and-bmw-m8-competition-convertible'}
    ]),
    verificationNote:'The Convertible’s height, mass and acceleration remain separate from the Coupé. The European 460 kW / 625 rating is metric horsepower (PS).'
  }),
  'f10-m5': Object.freeze({
    specification: 'BMW M5 F10 · ACEA specification valid 10/2011 · seven-speed M DCT',
    modelYear: 2011,
    displacementCc: 4395,
    transmission: '7-speed M double-clutch transmission with Drivelogic',
    drivetrain: 'Rear-wheel drive',
    acceleration100: 4.4,
    topSpeed: 250,
    topSpeedOptional: 305,
    topSpeedNote: '250 km/h electronically limited; 305 km/h with optional M Driver’s Package.',
    weightKg: 1870,
    weightConvention: 'DIN unladen; source also quotes 1,945 kg EU. Equipment and market affect mass.',
    weightDIN: 1870,
    weightEU: 1945,
    lengthMm: 4910,
    widthMm: 1891,
    heightMm: 1456,
    wheelbaseMm: 2964,
    powerKw: 412,
    powerPS: 560,
    torqueNm: 680,
    powerRPM: [6000, 7000],
    torqueRPM: [1500, 5750],
    maxRPM: 7200,
    // Primary source has no production-end date; do not invent a production range.
    sources: Object.freeze([
      {title: 'BMW M5 specifications · October 2011 · pages 1–2', url: f10Source},
      {title: 'BMW launch press kit · engine speed and rear-wheel drive', url: 'https://www.press.bmwgroup.com/united-kingdom/article/detail/T0121795EN_GB/the-new-bmw-m5?language=en_GB'}
    ]),
    verificationNote: 'The English factory PDF prints “560 hp” alongside 412 kW. This is metric horsepower (PS), approximately 552 mechanical hp. It is not a 560 SAE-hp US rating.'
  }),
  e92: Object.freeze({
    specification: 'BMW M3 E92 Coupé · April 2007 European launch figures · six-speed manual',
    modelYear: 2007,
    displacementCc: 3999,
    transmission: '6-speed manual',
    drivetrain: 'Rear-wheel drive',
    acceleration100: 4.8,
    topSpeed: 250,
    topSpeedNote: 'Electronically limited. These acceleration and mass figures describe the launch manual, not the later M DCT.',
    weightKg: 1655,
    weightConvention: 'EU unladen: DIN road-trim mass plus 75 kg for driver and luggage.',
    weightEU: 1655,
    lengthMm: 4615,
    widthMm: 1817,
    heightMm: 1418,
    wheelbaseMm: 2761,
    powerKw: 309,
    powerPS: 420,
    torqueNm: 400,
    powerRPM: [8300, 8300],
    torqueRPM: [3900, 3900],
    maxRPM: 8400,
    sources: Object.freeze([{title: 'BMW M3 launch press kit · April 2007 · pages 2 and 18', url: e92Source}]),
    verificationNote: 'Factory European output is 309 kW / 420 PS (approximately 414 mechanical hp). Published here with the manual transmission and EU mass convention from the same document.'
  }),
  g80: Object.freeze({
    specification: 'BMW M3 Competition Sedan G80 · 2021 US launch · rear-wheel drive · eight-speed M Steptronic',
    modelYear: 2021,
    displacementCc: 2993,
    transmission: '8-speed M Steptronic automatic with Drivelogic',
    drivetrain: 'Rear-wheel drive',
    // This US document does not publish a 0–100 km/h time. A 0–60 mph
    // time cannot be relabelled, and European figures are not substituted.
    acceleration60Mph: 3.8,
    topSpeedMph: 155,
    topSpeedOptionalMph: 180,
    topSpeedNote: 'The US launch source quotes 155 mph, or 180 mph with the optional M Driver’s Package. A separate metric speed figure is not supplied here.',
    weightKg: 1764,
    weightUSLb: 3890,
    weightConvention: 'US curb mass: 3,890 lb in BMW’s launch table; converted to 1,764 kg, rounded to the nearest kg. Not DIN/EU mass.',
    dimensionsIn: Object.freeze({length: 189.1, width: 74.3, widthIncludingMirrors: 81.4, height: 56.4, wheelbase: 112.5}),
    dimensionNote: 'US launch-table dimensions are retained in their published, rounded inches. Width is listed separately from width including mirrors; no European millimetre measurements are substituted.',
    powerHp: 503,
    torqueLbFt: 479,
    powerRPM: [6250, 6250],
    torqueRPM: [2750, 5500],
    maxRPM: 7200,
    sources: Object.freeze([{title: 'BMW US 2021 M3/M4 launch · M3 Competition column in specifications table', url: g80Source}]),
    verificationNote: 'Matches the catalogue’s 503 hp / 479 lb-ft US RWD Competition configuration. The later M xDrive and 473 hp manual models are separate specifications. The source reports 0–60 mph, not 0–100 km/h; unpublished metric fields remain unknown.'
  }),
  'g82-m4': Object.freeze({
    specification: 'BMW M4 Competition Coupé G82 · 2021 European launch · September 2020 ACEA data · rear-wheel drive',
    modelYear: 2021,
    displacementCc: 2993,
    transmission: '8-speed M Steptronic automatic with Drivelogic',
    drivetrain: 'Rear-wheel drive',
    acceleration100: 3.9,
    topSpeed: 250,
    topSpeedOptional: 290,
    topSpeedNote: '250 km/h electronically limited; 290 km/h with the optional M Driver’s Package.',
    weightKg: 1725,
    weightConvention: 'DIN unladen: 1,725 kg; source separately lists 1,800 kg EU. Homologation mass refers to Germany; equipment affects mass.',
    weightDIN: 1725,
    weightEU: 1800,
    lengthMm: 4794,
    widthMm: 1887,
    heightMm: 1393,
    wheelbaseMm: 2857,
    dimensionNote: 'Unladen body dimensions in millimetres; body width excludes mirrors (the source drawing separately shows 2,081 mm including mirrors).',
    powerKw: 375,
    powerPS: 510,
    torqueNm: 650,
    powerRPM: [6250, 6250],
    torqueRPM: [2750, 5500],
    sources: Object.freeze([
      {title: 'BMW M4 Competition specifications · September 2020 · pages 3–4; dimensions page 6', url: g82Source},
      {title: 'BMW M3/M4 Competition launch · original rear-drive configuration', url: 'https://www.press.bmwgroup.com/united-kingdom/article/detail/T0316947EN_GB/the-new-bmw-m3-competition-saloon-and-bmw-m4-competition-coup%C3%A9'}
    ]),
    verificationNote: 'The factory table’s 375 kW / 510 hp uses metric horsepower (PS), matching the catalogue. These are the original RWD Competition figures, not M xDrive or later 530 PS versions. Rated-power speed follows the table; the same PDF’s graph has a conflicting power annotation.'
  }),
  'g87-m2': Object.freeze({
    specification: 'BMW M2 G87 · 2023 European launch · October 2022 provisional ACEA data · eight-speed automatic baseline',
    modelYear: 2023,
    displacementCc: 2993,
    transmission: '8-speed M Steptronic with Drivelogic (6-speed manual optional)',
    drivetrain: 'Rear-wheel drive',
    acceleration100: 4.1,
    topSpeed: 250,
    topSpeedOptional: 285,
    topSpeedNote: '250 km/h electronically limited; 285 km/h with the optional M Driver’s Package.',
    weightKg: 1725,
    weightConvention: 'Automatic baseline: 1,725 kg DIN / 1,800 kg EU. Optional manual: 1,700 kg DIN / 1,775 kg EU. German base configuration; launch figures provisional.',
    weightDIN: 1725,
    weightEU: 1800,
    lengthMm: 4580,
    widthMm: 1887,
    heightMm: 1403,
    wheelbaseMm: 2747,
    dimensionNote: 'Unladen body dimensions in millimetres; body width excludes mirrors. The source warns that model and optional equipment can affect drawing dimensions.',
    powerKw: 338,
    powerPS: 460,
    torqueNm: 550,
    powerRPM: [6250, 6250],
    torqueRPM: [2650, 5870],
    transmissionAlternatives: Object.freeze([
      Object.freeze({transmission: '6-speed manual', acceleration100: 4.3, weightDIN: 1700, weightEU: 1775})
    ]),
    sources: Object.freeze([
      {title: 'BMW M2 launch technical specifications · October 2022 · pages 1–2', url: g87Source},
      {title: 'BMW M2 European launch · transmission alternatives and engine speed', url: 'https://www.press.bmwgroup.com/ireland/article/detail/T0404612EN/the-all-new-bmw-m2'}
    ]),
    verificationNote: 'Matches the original 338 kW / 460 PS / 550 Nm European M2, not the later 480 PS revision. Acceleration and headline mass use the standard automatic together; manual values remain a separate alternative. BMW marks the original specification sheet provisional.'
  }),
  'g81-m3-touring': Object.freeze({
    specification: 'BMW M3 Competition Touring G81 with M xDrive · June 2022 European launch · provisional ACEA data',
    modelYear: 2022,
    displacementCc: 2993,
    transmission: '8-speed M Steptronic automatic with Drivelogic',
    drivetrain: 'M xDrive all-wheel drive',
    acceleration100: 3.6,
    topSpeed: 250,
    topSpeedOptional: 280,
    topSpeedNote: '250 km/h electronically limited; 280 km/h with the optional M Driver’s Package.',
    weightKg: 1865,
    weightConvention: 'DIN unladen: 1,865 kg; source separately lists 1,940 kg EU. German homologation configuration; launch figures provisional.',
    weightDIN: 1865,
    weightEU: 1940,
    lengthMm: 4801,
    widthMm: 1903,
    heightMm: 1446,
    wheelbaseMm: 2857,
    dimensionNote: 'Unladen body dimensions in millimetres; body width excludes mirrors. Model and optional equipment may change drawing dimensions.',
    powerKw: 375,
    powerPS: 510,
    torqueNm: 650,
    powerRPM: [6250, 6250],
    torqueRPM: [2750, 5500],
    sources: Object.freeze([{title: 'BMW M3 Touring technical specifications · June 2022 · pages 1–2', url: g81Source}]),
    verificationNote: 'Matches the catalogue’s original 510 PS M xDrive Touring, not the later 530 PS update or a saloon. June 2022 is the launch-document date, not a claimed production-year range. BMW identifies all figures in this launch sheet as provisional.'
  }),
  f80: Object.freeze({
    specification: 'BMW M3 Sedan F80 · 2015 US base specification · six-speed manual baseline',
    modelYear: 2015,
    displacementCc: 2979,
    transmission: '6-speed manual (7-speed M DCT optional)',
    drivetrain: 'Rear-wheel drive',
    acceleration100: 4.3,
    acceleration60Mph: 4.1,
    topSpeed: 250,
    topSpeedNote: '250 km/h / 155 mph in the 2015 US technical table. The source does not specify an optional higher limit.',
    weightKg: 1606,
    weightUSLb: 3540,
    weightConvention: 'US curb mass, manual: 1,606 kg / 3,540 lb as published. DCT: 1,631 kg / 3,595 lb. These are not European DIN masses.',
    lengthMm: 4687,
    widthMm: 1877,
    heightMm: 1424,
    wheelbaseMm: 2812,
    dimensionNote: 'Vehicle body dimensions in millimetres from the 2015 US table; width is body width, not mirror span.',
    powerHp: 425,
    torqueLbFt: 406,
    torqueNm: 550,
    powerRPM: [5500, 7300],
    torqueRPM: [1850, 5500],
    transmissionAlternatives: Object.freeze([
      Object.freeze({transmission: '7-speed M DCT', acceleration100: 4.1, acceleration60Mph: 3.9, weightKg: 1631, weightUSLb: 3595})
    ]),
    sources: Object.freeze([
      {title: '2015 BMW M3 Sedan US technical data · manual and DCT columns', url: f80Source},
      {title: 'BMW US M3/M4 launch · rear-wheel-drive powertrain and transmission choices', url: 'https://www.press.bmwgroup.com/usa/article/detail/T0160684EN_US/the-all-new-bmw-m3-sedan-and-bmw-m4-coupe'}
    ]),
    verificationNote: 'Matches the catalogue’s 425 hp / 406 lb-ft US base car. The standard manual is the named baseline; its mass and acceleration are kept together. The optional DCT is separately recorded. European 431 PS ratings and lighter DIN masses are not substituted.'
  }),
  'e46-m3-csl': Object.freeze({
    specification: 'BMW M3 CSL E46 · 2003 European CSL · six-speed SMG Drivelogic · historical BMW technical table',
    modelYear: 2003,
    displacementCc: 3246,
    transmission: '6-speed SMG automated manual with Drivelogic',
    drivetrain: 'Rear-wheel drive',
    acceleration100: 4.9,
    topSpeed: 250,
    topSpeedNote: '250 km/h, electronically limited in the original BMW CSL launch release.',
    weightKg: 1385,
    weightDIN: 1385,
    weightConvention: '1,385 kg, labeled DIN unladen in BMW’s historical technical table. A later BMW archive sheet labels the same mass EU; no EU mass is inferred here.',
    lengthMm: 4492,
    widthMm: 1780,
    heightMm: 1365,
    wheelbaseMm: 2729,
    dimensionNote: 'Unladen body dimensions in millimetres, using the CSL column rather than the standard M3 Coupé column. Width excludes mirrors.',
    powerKw: 265,
    powerPS: 360,
    torqueNm: 370,
    powerRPM: [7900, 7900],
    torqueRPM: [4900, 4900],
    sources: Object.freeze([
      {title: 'BMW historical M3 technical tables · page 10 · 2003 CSL column', url: cslSource},
      {title: 'BMW M3 CSL original April 2003 launch · six-speed SMG and performance', url: cslLaunch},
      {title: 'BMW CSL archive reprint · retained for conflicting mass-convention context', url: 'https://www.press.bmwgroup.com/united-kingdom/article/attachment/T0451185EN_GB/634824'}
    ]),
    verificationNote: '265 kW / 360 is metric horsepower (PS), despite some English releases printing bhp. The original launch confirms SMG; a later archive table’s generic “six-speed manual” label is not treated as a separate three-pedal CSL. Historical and later mass-convention labels conflict, so only the explicitly identified historical DIN value is used.'
  })
});

export function enrichModel(model) {
  const verified = verifiedSpecs[model.id];
  if (!verified) return {...model};
  // Keep source context separate so an expanded launch specification cannot silently
  // relabel an existing catalogue entry or replace licensed image provenance.
  return {...model,
    transmission: verified.transmission,
    drivetrain: verified.drivetrain,
    acceleration100: verified.acceleration100,
    topSpeed: verified.topSpeed,
    topSpeedOptional: verified.topSpeedOptional,
    weightKg: verified.weightKg,
    weightConvention: verified.weightConvention,
    displacementCc: verified.displacementCc,
    lengthMm: verified.lengthMm,
    widthMm: verified.widthMm,
    heightMm: verified.heightMm,
    wheelbaseMm: verified.wheelbaseMm,
    verified
  };
}
