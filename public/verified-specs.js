// Expanded facts are deliberately limited to matching, identified factory specifications.
// Preserve the original catalogue's market, power units, photographs and source URLs.
// A missing record is unknown, never a reason to infer a specification from the chassis.
const f10Source = 'https://www.press.bmwgroup.com/global/article/attachment/T0122682EN/178942';
const e92Source = 'https://www.press.bmwgroup.com/usa/article/attachment/T0017783EN_US/35231';

export const verifiedSpecs = Object.freeze({
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
