export const generationGuideSources = Object.freeze({
  prePurchase: [
    {
      claim:'Arrange an independent physical pre-purchase inspection; a vehicle-history report is only one part of due diligence.',
      source:{url:'https://www.aamva.org/vehicles/nmvtis/nmvtis-for-general-public-consumers',label:'AAMVA · NMVTIS for consumers'},
    },
    {
      claim:'Use NHTSA’s VIN decoder for US-market vehicle attributes. Missing decoded values mean NHTSA has no data for that variable—not that the feature is absent.',
      source:{url:'https://vpic.nhtsa.dot.gov/decoder/',label:'NHTSA · vPIC VIN decoder'},
    },
  ],
  georgiaUS: [
    {
      claim:'US title, brand, most recent odometer and some theft history may appear in an NMVTIS report from an approved provider.',
      source:{url:'https://www.aamva.org/vehicles/nmvtis/nmvtis-for-general-public-consumers',label:'AAMVA · NMVTIS for consumers'},
    },
    {
      claim:'A clean NICB VINCheck result does not prove the vehicle has never been damaged; the service covers only certain records from participating insurers.',
      source:{url:'https://www.nicb.org/vincheck',label:'NICB · VINCheck coverage'},
    },
    {
      claim:'Check open safety recalls for the vehicle by VIN through NHTSA’s recall lookup.',
      source:{url:'https://www.nhtsa.gov/recalls',label:'NHTSA · Recalls'},
    },
  ],
  georgiaEurope: [
    {
      claim:'For a UK-imported car, GOV.UK can show MOT pass/fail, recorded mileage, next due date and available advisories; this does not cover all European countries.',
      source:{url:'https://www.gov.uk/check-mot-history',label:'GOV.UK · Check MOT history'},
    },
    {
      claim:'EU roadworthiness inspection certificates follow minimum requirements in Directive 2014/45/EU; confirm records and rules with the vehicle’s specific country.',
      source:{url:'https://eur-lex.europa.eu/eli/dir/2014/45/oj',label:'EUR-Lex · Directive 2014/45/EU'},
    },
    {
      claim:'EU vehicle-registration procedures and related taxes vary by country; check the relevant national authority for the vehicle’s country.',
      source:{url:'https://europa.eu/youreurope/citizens/vehicles/registration/registration-abroad/index_en.htm',label:'European Commission · Registration abroad'},
    },
  ],
  georgiaImport: [
    {
      claim:'Use Georgia Revenue Service’s vehicle-clearance calculator for applicable import clearance costs; confirm requirements for your vehicle.',
      source:{url:'https://www.rs.ge/CarClearance-en',label:'Georgia Revenue Service · Vehicle clearance'},
    },
    {
      claim:'Confirm local registration steps with the Georgian MIA Service Agency; its portal is not verified here as a VIN-based history lookup.',
      source:{url:'https://my.sa.gov.ge/',label:'Georgian MIA Service Agency'},
    },
    {
      claim:'Georgia’s periodic technical inspection checks include identity, brakes, steering, tyres, chassis, visibility, lights and emissions for vehicle categories subject to inspection; it does not replace pre-purchase inspection or history checks.',
      source:{url:'https://pti.ge/',label:'PTI Georgia · Technical inspection'},
    },
  ],
});
