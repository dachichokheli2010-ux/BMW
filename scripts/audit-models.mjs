import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {allModels} from '../public/catalog.js';
import {profileFieldDefinitions,PROFILE_SCHEMA_VERSION} from '../public/model-profiles.js';
import {requiredPhotoSlots,photoRightsStatus} from '../public/model-photo-policy.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const escape=value=>String(value??'').replaceAll('|','\\|').replaceAll('\n',' ');

export function createModelAudit(catalog=allModels){
  const models=catalog.map(model=>{
    const profile=model.profile,fields=profile.sections.flatMap(section=>section.fields),review=model.photoReview;
    return {id:model.id,name:model.name,generation:model.generation,context:profile.context,summary:profile.summary,
      missingFields:fields.filter(field=>field.status==='unavailable').map(field=>field.id),
      notApplicableFields:fields.filter(field=>field.status==='not-applicable').map(field=>field.id),
      unverifiedFields:fields.filter(field=>field.status==='source-linked').map(field=>field.id),
      unknownSourceYears:fields.filter(field=>field.sources.some(source=>source.year===null)).map(field=>field.id),
      fields,
      photos:{slots:profile.photos,availableExterior:review.approved.length,availableEngine:review.engine.length,rejected:review.rejected,
        missingRequiredSlots:profile.photos.filter(photo=>photo.required&&(photo.status==='unavailable'||photo.referenceOnly)).map(photo=>photo.slot)}
    };
  });
  const fields=models.flatMap(model=>model.fields),photos=catalog.flatMap(model=>[...model.approvedPhotos.car,...model.approvedPhotos.engine]);
  const totals={models:models.length,fields:fields.length,verified:fields.filter(field=>field.status==='verified').length,
    sourceLinked:fields.filter(field=>field.status==='source-linked').length,unavailable:fields.filter(field=>field.status==='unavailable').length,
    notApplicable:fields.filter(field=>field.status==='not-applicable').length,uniqueApprovedPhotos:new Set(photos.map(photo=>photo.src)).size,
    modelsWithEnginePhoto:catalog.filter(model=>model.approvedPhotos.engine.length).length,
    modelsWithExactEnginePhoto:catalog.filter(model=>model.approvedPhotos.engine.some(photo=>photo.matchStatus==='model-engine-reference')).length,
    modelsWithExteriorPhoto:catalog.filter(model=>model.approvedPhotos.car.length).length,
    completeVerifiedProfiles:models.filter(model=>!model.missingFields.length&&!model.unverifiedFields.length&&!model.photos.missingRequiredSlots.length).length};
  return {schemaVersion:PROFILE_SCHEMA_VERSION,scope:'Current catalogue after Phase 1 source and photo safeguards; unavailable is explicit and does not mean researched content is complete.',
    yearPolicy:'A source year is the identified specification year, not an inferred production range or publication date. Null means unknown.',
    photoPolicy:{providers:'Wikimedia Commons records with CC BY, CC BY-SA, CC0, public-domain metadata or an individually checked attribution-only permission. Manufacturer material remains excluded until applicable permission is established.',
      matching:'Generation/body references retain trim/year/market differences. Engine-family references identify the actual photographed subject and remain exact-application research tasks.',
      rightsReference:'https://commons.wikimedia.org/wiki/Commons:Licensing',rightsCheckedDate:'2026-10-20',
      note:'Fourteen additional Commons engine/drive references were downloaded, inspected, resized and converted to WebP with credits preserved. No AI photographs are used.'},
    totals,
    fieldCoverage:profileFieldDefinitions.map(({id,label})=>({id,label,...Object.fromEntries(['verified','source-linked','unavailable','not-applicable'].map(status=>[status,fields.filter(field=>field.id===id&&field.status===status).length]))})),
    photoCoverage:requiredPhotoSlots.map(({slot,label,required=true})=>({slot,label,required,available:models.filter(model=>model.photos.slots.some(photo=>photo.slot===slot&&photo.status==='available')).length,unavailable:models.filter(model=>model.photos.slots.some(photo=>photo.slot===slot&&photo.status==='unavailable')).length})),
    models};
}

export function validateModelAudit(report,catalog=allModels){
  const errors=[];
  if(new Set(report.models.map(model=>model.id)).size!==catalog.length)errors.push('Catalogue IDs are not unique.');
  for(const model of catalog){
    const fields=model.profile?.sections.flatMap(section=>section.fields)||[];
    if(fields.length!==profileFieldDefinitions.length||new Set(fields.map(field=>field.id)).size!==profileFieldDefinitions.length)errors.push(`${model.id}: incomplete profile schema.`);
    for(const field of fields){
      if(['unavailable','not-applicable'].includes(field.status)&&field.value!==null)errors.push(`${model.id}.${field.id}: unavailable datum has a value.`);
      if(['verified','source-linked'].includes(field.status)&&(!field.sources.length||field.value===null))errors.push(`${model.id}.${field.id}: available datum lacks provenance.`);
      for(const source of field.sources)if(!/^https:\/\//.test(source.url)||source.year!==null&&!Number.isInteger(source.year))errors.push(`${model.id}.${field.id}: invalid source metadata.`);
    }
    for(const photo of [...model.approvedPhotos.car,...model.approvedPhotos.engine]){
      if(photoRightsStatus(photo)!=='licensed')errors.push(`${model.id}: unsafe photo ${photo.src}.`);
      if(!fs.existsSync(path.join(root,'public',photo.src)))errors.push(`${model.id}: missing photo ${photo.src}.`);
      if(!Number.isInteger(photo.width)||!Number.isInteger(photo.height)||photo.width<=0||photo.height<=0)errors.push(`${model.id}: intrinsic dimensions missing for ${photo.src}.`);
    }
  }
  return errors;
}

export function modelAuditMarkdown(report){
  const {totals}=report;
  return `# Model completeness and photo audit\n\n${report.scope}\n\n`+
    `The catalogue has **${totals.models} models**, **${totals.verified} verified fields**, **${totals.sourceLinked} source-linked fields awaiting datum-level review**, and **${totals.unavailable} unavailable fields**. ${totals.notApplicable} fields do not apply to the selected powertrain. **${totals.completeVerifiedProfiles} profiles meet every requested verified-content and required-photo slot**.\n\n`+
    `Available safe media: ${totals.modelsWithExteriorPhoto}/${totals.models} models have an exterior reference; ${totals.modelsWithEnginePhoto}/${totals.models} have a positively matched engine photograph. ${totals.uniqueApprovedPhotos} unique local WebP photographs are used, with intrinsic dimensions and recorded author/license/source. Dashboard and seat slots require identified views; a generic interior label does not establish both. Wheel/detail photos are optional.\n\n`+
    `## Accuracy and provenance\n\n${report.yearPolicy}\n\nExisting umbrella factory links are labelled source-linked, not independently verified. Verified fields retain the exact model, market, unit and specification context. G80's source publishes 0–60 mph and mph top speeds; 0–100 km/h remains unavailable. US, EU and DIN weight conventions remain distinct.\n\n`+
    `Manufacturer images with all-rights-reserved metadata are excluded from public model media pending applicable permission. [BMW PressClub terms](${report.photoPolicy.rightsReference}) restrict material to press use and prohibit commercial reuse; generic PressClub terms do not establish rights to BMW M or Classic website downloads. Two legacy Commons credits labelled only “Attribution” also remain excluded under the requested license whitelist.\n\n`+
    `The previous EV-variant clone copied drivetrain, boost, battery and model-year facts from the photo donor. It now shares photography only, so absent variant-specific facts remain unavailable. M54B25 images are excluded for M54B30 cars; the later F90 S63 image is excluded for F10 M5. Engine-family extras are not substituted for a positively matched model application.\n\n`+
    `## Field coverage\n\n| Field | Verified | Source-linked | Unavailable | Not applicable |\n|---|---:|---:|---:|---:|\n`+
    report.fieldCoverage.map(field=>`| ${escape(field.label)} | ${field.verified} | ${field['source-linked']} | ${field.unavailable} | ${field['not-applicable']} |`).join('\n')+
    `\n\n## Photo coverage\n\n| Identified view | Available | Unavailable | Required |\n|---|---:|---:|---|\n`+
    report.photoCoverage.map(photo=>`| ${escape(photo.label)} | ${photo.available} | ${photo.unavailable} | ${photo.required?'Yes':'Optional'} |`).join('\n')+
    `\n\n## Every model\n\nField IDs correspond to the field definitions in public/model-profiles.js. Source-linked fields are present but still need individual source verification; unknown source years are listed separately in the JSON report.\n\n| Model | Verified / source-linked | Missing information | Missing required photo views |\n|---|---|---|---|\n`+
    report.models.map(model=>`| ${escape(model.id)} — ${escape(model.name)} | ${model.summary.verified} / ${model.summary.sourceLinked} | ${model.missingFields.map(escape).join(', ')||'None'} | ${model.photos.missingRequiredSlots.map(escape).join(', ')||'None'} |`).join('\n')+
    `\n\n## Reproduce\n\nRun \`node scripts/audit-models.mjs\` to validate the schema and print each car's gaps. Run \`node scripts/audit-models.mjs --write\` to regenerate this Markdown report and model-completeness.json. \`--json\` prints machine-readable data; \`--strict\` exits unsuccessfully while verified-content or required-photo gaps remain.\n`;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const report=createModelAudit(),errors=validateModelAudit(report);
  if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
  else if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
  else{
    if(process.argv.includes('--write')){
      fs.mkdirSync(path.join(root,'reports'),{recursive:true});
      fs.writeFileSync(path.join(root,'reports/model-completeness.json'),JSON.stringify(report,null,2)+'\n');
      fs.writeFileSync(path.join(root,'reports/model-completeness.md'),modelAuditMarkdown(report));
    }
    console.log(`${report.totals.models} models; ${report.totals.verified} verified fields; ${report.totals.sourceLinked} source-linked; ${report.totals.unavailable} unavailable.`);
    if(!process.argv.includes('--summary'))for(const model of report.models)console.log(`${model.id}: missing [${model.missingFields.join(', ')}]; photos [${model.photos.missingRequiredSlots.join(', ')}]; unverified [${model.unverifiedFields.join(', ')}]`);
  }
  if(process.argv.includes('--strict')&&report.totals.completeVerifiedProfiles!==report.totals.models)process.exitCode=1;
}
