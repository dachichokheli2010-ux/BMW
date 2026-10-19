import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {allModels} from '../public/catalog.js';
import {partCatalog} from '../public/parts.js';
import {carRecords,engineRecords,createExplorerAudit,currentLineupCoverage,heritageCoverage,lineupResearchSources,researchDate} from '../public/explorer-data.js';
import {photoRightsStatus} from '../public/model-photo-policy.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const markdown=value=>String(value??'').replaceAll('|','\\|').replaceAll('\n',' ');
const present=value=>value!==null&&value!==undefined&&value!==''&&(!Array.isArray(value)||value.length>0);

// Existing parts already carry structured editorial content and photographs.
// A linked reference is not evidence that every field has been cross-checked.
export function normalizePartsForAudit(parts){
  const fields=[['summary','What it does'],['analogy','Everyday analogy'],['how','Technical explanation'],['location','Location'],['symptoms','Failure signs'],['lifespan','Typical lifespan'],['cost','Typical cost and market'],['funFact','BMW fact'],['applications','BMW applications']];
  return parts.map(part=>{
    if(part.fields)return part;
    return {...part,fields:fields.map(([id,label])=>{
      const value=part[id]??(id==='applications'?part.usedIn||part.bmwApplications:id==='how'?part.technical:id==='funFact'?part.bmwFact:undefined);
      // Relative workshop effort and a condition-based description do not
      // constitute the requested dated price range or typical service life.
      const quantitativeGap=Boolean(part.verification)&&['lifespan','cost'].includes(id);
      const available=present(value)&&!quantitativeGap,sources=part.sources||[];
      return {id,label,value:available?value:null,status:available?'source-linked':'unavailable',unit:null,sources,
        note:available?'Editorial content with linked references; check this specific claim against matching sources.':quantitativeGap?'The registry provides qualitative guidance; a dated, vehicle-specific typical range is not verified.':'This requested detail has not yet been verified for this component.'};
    })};
  });
}

export async function loadAuditParts(){
  const modulePath=path.join(root,'public/parts-encyclopedia-data.js');
  if(fs.existsSync(modulePath)){
    const loaded=await import(pathToFileURL(modulePath));
    const parts=loaded.encyclopediaParts||loaded.partsEncyclopedia||loaded.parts||loaded.partRecords;
    if(!Array.isArray(parts))throw new Error('Parts encyclopedia registry must export its part array for completeness checking.');
    return normalizePartsForAudit(parts);
  }
  return normalizePartsForAudit(partCatalog);
}

export function validateExplorerRegistry({cars=carRecords,engines=engineRecords,parts=[]}={}){
  const errors=[],knownCars=new Set(allModels.map(model=>model.id)),urls=new Set(),statuses=new Set(['verified','cross-checked','source-linked','unavailable','not-applicable']);
  for(const [kind,records]of [['car',cars],['engine',engines],['part',parts]]){
    const ids=new Set();
    for(const record of records){
      if(!record.id||!record.name||ids.has(record.id))errors.push(kind+': missing or duplicate identity '+record.id);ids.add(record.id);
      if(record.url){if(!record.url.startsWith('/')||urls.has(record.url))errors.push(kind+': invalid/duplicate clean URL '+record.url);urls.add(record.url);}
      if(kind==='car'&&!knownCars.has(record.id))errors.push('Unrecognized retained car '+record.id);
      const fields=Array.isArray(record.fields)?record.fields:Object.entries(record.fields||{}).map(([id,field])=>({id,...field}));
      const fieldIds=new Set();
      for(const field of fields){
        const key=kind+'/'+record.id+'/'+field.id;
        if(!field.id||fieldIds.has(field.id))errors.push(key+': duplicate or missing field ID');fieldIds.add(field.id);
        if(!statuses.has(field.status))errors.push(key+': unsupported evidence status '+field.status);
        if(['unavailable','not-applicable'].includes(field.status)){if(field.value!==null)errors.push(key+': unknown must not carry a guessed value');if(!field.note)errors.push(key+': missing reason');}
        else{
          if(!present(field.value))errors.push(key+': available field is empty');
          if(!Array.isArray(field.sources)||!field.sources.length)errors.push(key+': missing provenance');
          if(field.status==='cross-checked'&&new Set((field.sources||[]).map(item=>item.url)).size<2)errors.push(key+': two distinct source documents required');
        }
        for(const item of field.sources||[])try{if(new URL(item.url).protocol!=='https:')errors.push(key+': source must use HTTPS');}catch{errors.push(key+': invalid source URL');}
      }
      if(kind==='engine'){
        for(const application of record.applications||[])if(!knownCars.has(application.id))errors.push(record.id+': unknown application '+application.id);
        for(const photo of record.photos||[]){
          if(photoRightsStatus(photo)!=='licensed')errors.push(record.id+': photo lacks recorded reusable rights');
          if(!fs.existsSync(path.join(root,'public',photo.src)))errors.push(record.id+': missing local photo '+photo.src);
          if(!photo.width||!photo.height)errors.push(record.id+': photograph dimensions missing');
        }
      }
      if(kind==='part'&&record.photo?.src&&!fs.existsSync(path.join(root,'public',record.photo.src)))errors.push(record.id+': missing local part photograph '+record.photo.src);
    }
  }
  if(cars.length!==93)errors.push('All 93 retained car records must remain indexed.');
  return errors;
}

export function coverageMarkdown(){return '# Current BMW and heritage coverage\n\n'+
  `Checked ${researchDate}. This is a **discovery and omission checklist**, not a complete world-market inventory or a claim that all models are implemented. BMW Germany lists both orderable and coming-soon vehicles; availability differs by market. Source discovery is separate from verifying a complete specification.\n\n`+
  '| Family | Scope | Retained records | Work still required |\n|---|---|---|---|\n'+currentLineupCoverage.map(row=>`| ${markdown(row.family)} | ${markdown(row.scope)} | ${row.modelIds.join(', ')||'None'} | ${markdown(row.gap)} |`).join('\n')+
  '\n\n## Primary references\n\n'+lineupResearchSources.map(item=>`- [${item.title}](${item.url}) — ${item.scope}; checked ${item.checked}.`).join('\n')+
  '\n\n## Historical gaps\n\nThis deliberately lists broad missing families. It does not establish production dates or an exhaustive variant count. No unverified car record was fabricated to fill a row.\n\n| Family | Missing coverage |\n|---|---|\n'+heritageCoverage.map(row=>`| ${markdown(row.group)} | ${markdown(row.missing)} |`).join('\n')+
  '\n\n## Research order\n\n1. Add current-generation records with exact market, specification year, units and two matching documents. Keep existing-generation records.\n2. Identify and license each exterior/interior/engine or drive-unit photograph, then generate responsive assets.\n3. Expand the historical generations and special editions with the same evidence requirements.\n4. Only mark a profile complete when every requested applicable field and required view is actually present.\n';}

export function completenessMarkdown(report){
  const {totals}=report,carGaps=carRecords.map(record=>({record,items:report.needsReview.filter(item=>item.kind==='car'&&item.id===record.id),photos:report.missingImages.filter(item=>item.kind==='car'&&item.id===record.id)}));
  return '# Explorer completeness, missing images and review queue\n\n'+report.scope+'\n\n'+
    `Checked ${report.checked}. **The zero-gap definition of done is not met.** Structural integrity checks and complete researched content are different checks. The checker does not treat a placeholder, an unavailable label, or a factory homepage link as a completed fact.\n\n`+
    `- ${totals.cars} retained car profiles and ${totals.engines} engine/drive-family entries.\n- ${totals.parts} parts indexed by this audit run.\n- ${totals.missingCarFields} missing car fields; ${totals.missingEngineFields} missing engine fields; ${totals.missingPartFields} missing part fields.\n- ${totals.needsReview} field-level research/review tasks.\n- ${totals.missingImages} missing required image slots across all indexed types.\n\n`+
    '## Evidence policy\n\n'+Object.values(report.policy).join(' ')+'\n\n'+
    'A car’s existing verified field may have only one checked document. It remains a review task under the requested two-source rule. Engine output tables preserve hp/PS, market, vehicle-system hybrid output and individual model context. Engine-family production dates are not inferred from represented vehicle years.\n\n'+
    '## Every retained car\n\n| Car | Missing fields | Review tasks | Missing required images |\n|---|---:|---:|---|\n'+carGaps.map(({record,items,photos})=>`| ${markdown(record.id+' — '+record.name)} | ${items.filter(item=>item.reason==='missing-field').length} | ${items.length} | ${photos.map(item=>item.slot).join(', ')||'None'} |`).join('\n')+
    '\n\n## Engine research\n\n| Engine | Applications | Missing fields | Engine image |\n|---|---:|---:|---|\n'+engineRecords.map(record=>`| ${markdown(record.code)} | ${record.applications.length} | ${report.needsReview.filter(item=>item.kind==='engine'&&item.id===record.id&&item.reason==='missing-field').length} | ${record.photoStatus} |`).join('\n')+
    '\n\n## Machine-readable handoff\n\n- `explorer-needs-review.json`: every missing field, source-linked claim and verified claim that still needs a second document.\n- `explorer-missing-images.json`: every missing required image with a suggested Commons search.\n- `current-lineup-coverage.md`: current-model discovery and historical omissions.\n- `explorer-completeness.json`: all of the above in one report.\n\n'+
    'Run `node scripts/check-completeness.mjs --write` to regenerate. The default command fails on invalid structure or media references; `--strict` also fails while content or image gaps remain. No new or unlicensed media is downloaded by the checker.\n';
}

export function writeExplorerReports(report){
  fs.mkdirSync(path.join(root,'reports'),{recursive:true});
  for(const [filename,data]of [['explorer-completeness.json',report],['explorer-needs-review.json',{checked:report.checked,items:report.needsReview}],['explorer-missing-images.json',{checked:report.checked,items:report.missingImages}]])fs.writeFileSync(path.join(root,'reports',filename),JSON.stringify(data,null,2)+'\n');
  fs.writeFileSync(path.join(root,'reports/explorer-completeness.md'),completenessMarkdown(report));
  fs.writeFileSync(path.join(root,'reports/current-lineup-coverage.md'),coverageMarkdown());
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const parts=await loadAuditParts(),report=createExplorerAudit({parts}),errors=validateExplorerRegistry({parts});
  if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
  else{
    if(process.argv.includes('--write'))writeExplorerReports(report);
    if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
    else{
      console.log(`Explorer integrity passed: ${report.totals.cars} cars, ${report.totals.engines} engines, ${report.totals.parts} parts.`);
      console.log(`Content incomplete: ${report.totals.needsReview} review tasks; ${report.totals.missingImages} missing required image slots.`);
      if(process.argv.includes('--list'))for(const item of report.needsReview)console.log(`${item.kind}/${item.id}/${item.field}: ${item.reason}`);
    }
    if(process.argv.includes('--strict')&&!report.totals.complete)process.exitCode=1;
  }
}
