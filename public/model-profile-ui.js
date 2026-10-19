import {t,getLanguage} from './preferences.js';
import './model-profile-translations.js';
import {responsivePhotoAttributes,photoBlurStyle} from './responsive-photos.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const states={'verified':'Source-checked','source-linked':'Reference linked','unavailable':'Not available','not-applicable':'Not applicable'};
const locales={en:'en-GB',ka:'ka-GE',ru:'ru-RU'};
const photoIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="1.5"/><path d="m4 17 5-4 3 2 4-5 5 6"/></svg>';

export function valueText(value){
  if(typeof value==='number')return new Intl.NumberFormat(locales[getLanguage()],{maximumFractionDigits:3}).format(value);
  if(Array.isArray(value))return value.map(valueText).join(' · ');
  return t(String(value??''));
}

function sourceMeasurements(model){
  if(!model.verified?.acceleration60Mph)return '';
  const source=model.verified.sources[0];
  return '<p class="profile-context profile-native-measurement">'+esc(t('Measurement in the source units'))+': 0–60 mph: '+esc(valueText(model.verified.acceleration60Mph))+' s <a href="'+esc(source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(t('Factory source'))+'</a></p>';
}

export function renderModelProfile(model){
  const profile=model.profile;
  if(!profile)return '';
  const {summary}=profile;
  const sourced=summary.verified+summary.sourceLinked;
  return `<div class="model-profile" aria-labelledby="model-profile-title"><div class="profile-heading"><div><span class="eyebrow">${esc(t('Specification'))}</span><h2 id="model-profile-title">${esc(t('Full model profile'))}</h2><p>${esc(t('Missing information stays visible until a matching source is recorded.'))}</p></div><span class="profile-coverage">${esc(t('Sourced fields: {count} of {total}',{count:sourced,total:summary.total-summary.notApplicable}))}</span></div>${profile.context.specification?`<p class="profile-context">${esc(profile.context.specification)}</p>`:''}${sourceMeasurements(model)}${model.verified?.verificationNote?`<p class="profile-context">${esc(t(model.verified.verificationNote))}</p>`:''}<div class="profile-sections">${profile.sections.map((section,index)=>`<details class="profile-data-group" ${index===0?'open':''}><summary><span>${esc(t(section.label))}</span><small>${section.fields.filter(field=>['verified','source-linked'].includes(field.status)).length} / ${section.fields.filter(field=>field.status!=='not-applicable').length}</small></summary><dl>${section.fields.map(field=>`<div class="profile-field" data-profile-field="${esc(field.id)}"><dt>${esc(t(field.label))}</dt><dd><span class="profile-value ${field.value===null?'profile-missing':''}">${field.value===null?esc(t(states[field.status])):esc(valueText(field.value))+(field.unit?' <span class="profile-unit">'+esc(field.unit)+'</span>':'')}</span>${field.value!==null?`<span class="profile-status" data-status="${esc(field.status)}">${esc(t(states[field.status]))}</span>`:''}${!field.sources.length&&field.note&&!/^(Not available:|Not applicable)/.test(field.note)?`<p class="profile-field-note">${esc(t(field.note))}</p>`:''}${field.sources.length?`<details class="profile-provenance"><summary>${esc(t('Source details'))}</summary>${field.note?`<p>${esc(t(field.note))}</p>`:''}${field.sources.map(source=>`<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a><small>${esc(source.year?t('Specification year: {year}',{year:source.year}):t('Source year not recorded'))}${source.locator?' · '+esc(source.locator):''}</small>`).join('')}</details>`:''}</dd></div>`).join('')}</dl></details>`).join('')}</div><section class="profile-photos" aria-labelledby="profile-photos-title"><div class="profile-photo-heading"><h3 id="profile-photos-title">${esc(t('Photo coverage'))}</h3><a href="/photos?model=${encodeURIComponent(model.id)}">${esc(t('Photos & sources'))}</a></div><div class="profile-photo-grid">${profile.photos.map(slot=>`<article class="profile-photo-slot">${slot.photo?`<img src="${esc(slot.photo.src)}" alt="${esc(model.name+' · '+t(slot.label))}" ${responsivePhotoAttributes(slot.photo, "(max-width: 600px) 45vw, 22vw")} style="${photoBlurStyle(slot.photo.src)}" loading="lazy" decoding="async">`:`<div class="profile-photo-placeholder">${photoIcon}<span>${esc(t('Photo unavailable'))}</span></div>`}<h4>${esc(t(slot.label))}</h4>${slot.photo?`<p>${esc(slot.photo.credit.author)} · ${esc(slot.photo.credit.license)}</p><a href="${esc(slot.photo.credit.page)}" target="_blank" rel="noopener noreferrer">${esc(t('Source and license'))}</a>`:''}</article>`).join('')}</div></section></div>`;
}
