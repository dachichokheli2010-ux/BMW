import {t,translatePage} from './preferences.js';
import './model-profile-translations.js';
import {photoRightsStatus} from './model-photo-policy.js';
import {partCatalog} from './parts.js';
import {editorialCredits} from './editorial-credits.js';
import {responsivePhotoAttributes,photoBlurStyle} from './responsive-photos.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reviewReasons={
  'permission-unverified':'Permission has not been confirmed for this use.',
  'license-unverified':'A license from the requested license set has not been recorded.',
  'missing-provenance':'The author, license or original source is incomplete.',
  'engine-application-unverified':'The fitted engine version has not been confirmed.',
  'local-optimized-asset-unavailable':'An optimized local photograph is unavailable.'
};

export function mountPhotoSources(container,{catalog}){
  const params=new URLSearchParams(location.search);
  let selected=catalog.some(model=>model.id===params.get('model'))?params.get('model'):'';
  function render(){
    const models=selected?catalog.filter(model=>model.id===selected):catalog;
    const approved=new Map(),rejected=new Map();
    for(const model of models){
      for(const photo of [...(model.approvedPhotos?.car||[]),...(model.approvedPhotos?.engine||[])]){
        if(!approved.has(photo.src))approved.set(photo.src,{...photo,models:[]});
        approved.get(photo.src).models.push(model);
      }
      for(const item of model.photoReview?.rejected||[]){
        if(!rejected.has(item.src))rejected.set(item.src,{...item,models:[]});
        rejected.get(item.src).models.push(model);
      }
    }
    document.title=t('Photos & sources · APEX');
    container.innerHTML=`<nav aria-label="${esc(t('Breadcrumb'))}"><a href="/">${esc(t('Home'))}</a><a href="/models">${esc(t('Models'))}</a></nav><span class="eyebrow">APEX / ${esc(t('Photos & sources'))}</span><h1>${esc(t('Photography, with a traceable source.'))}</h1><p>${esc(t('Each displayed model photograph has a recorded author, license and original source. Missing views use a placeholder.'))}</p><div class="photo-source-filter"><label for="photo-source-model">${esc(t('Select BMW model'))}</label><select id="photo-source-model"><option value="">${esc(t('All models'))}</option>${catalog.map(model=>`<option value="${esc(model.id)}" ${selected===model.id?'selected':''}>${esc(model.name+' · '+model.generation.split(' / ').at(-1))}</option>`).join('')}</select></div><h2>${esc(t('Approved catalog photographs'))} <small>(${approved.size})</small></h2><div class="photo-source-models">${[...approved.values()].map(photo=>`<article class="photo-source-card"><img src="${esc(photo.src)}" alt="${esc(photo.models[0].name+' · '+t(photo.angle))}" ${responsivePhotoAttributes(photo, "(max-width: 600px) 90vw, (max-width: 900px) 45vw, 30vw")} style="${photoBlurStyle(photo.src)}" loading="lazy" decoding="async"><div class="photo-source-copy"><h3>${esc(photo.credit.label)}</h3><p>${esc(photo.credit.author)} · ${esc(photo.credit.license)}</p><p>${esc(t(photo.caption))}</p><p>${esc(t(photo.credit.changes||'Adaptation: resized and converted to WebP.'))}</p><a href="${esc(photo.credit.page)}" target="_blank" rel="noopener noreferrer">${esc(t('Original source'))}</a><a href="${esc(photo.credit.url)}" target="_blank" rel="noopener noreferrer">${esc(t('Recorded license'))}</a><div>${photo.models.map(model=>`<a href="/models?model=${encodeURIComponent(model.id)}">${esc(model.name)} · ${esc(model.generation.split(' / ').at(-1))}</a>`).join('')}</div></div></article>`).join('')}</div><details class="photo-source-review"><summary>${esc(t('Permission or identity review pending'))} (${rejected.size})</summary><p>${esc(t('These source records are retained for review. Their images are excluded from galleries for the listed models.'))}</p><ul>${[...rejected.values()].map(photo=>`<li>${esc(photo.models.map(model=>model.name+' '+model.generation.split(' / ').at(-1)).join(', '))} — ${esc(t(reviewReasons[photo.reason]||reviewReasons["missing-provenance"]))}${photo.credit?`<br>${esc(photo.credit.author)} · ${esc(photo.credit.license)}<br><a href="${esc(photo.credit.page)}" target="_blank" rel="noopener noreferrer">${esc(t('Original source'))}</a>`:''}</li>`).join('')}</ul></details><details class="photo-source-review"><summary>${esc(t('Editorial and component photographs'))}</summary><ul>${[...editorialCredits.filter(credit=>photoRightsStatus({credit})==='licensed'),...partCatalog.map(part=>({...part.photo,url:part.photo.licenseUrl}))].map(credit=>`<li>${esc(credit.label||credit.caption)}<br>${esc(credit.author)} · ${esc(credit.license)}<br><a href="${esc(credit.page)}" target="_blank" rel="noopener noreferrer">${esc(t('Original source'))}</a> · <a href="${esc(credit.url||credit.page)}" target="_blank" rel="noopener noreferrer">${esc(t('Recorded license'))}</a></li>`).join('')}</ul></details>`;
    container.querySelector('select').addEventListener('change',event=>{
      selected=event.target.value;
      const url=new URL(location.href);selected?url.searchParams.set('model',selected):url.searchParams.delete('model');history.replaceState(history.state,'',url);
      render();container.querySelector('select').focus({preventScroll:true});
    });
    translatePage();
  }
  const onLanguage=()=>render();window.addEventListener('apex:languagechange',onLanguage);render();
  return {destroy(){window.removeEventListener('apex:languagechange',onLanguage);}};
}
