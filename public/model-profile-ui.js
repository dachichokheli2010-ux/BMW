import './discovery-translations.js';
import {t,getLanguage} from './preferences.js';
import './model-profile-translations.js';
import './car-detail-translations.js';
import {responsivePhotoAttributes,photoBlurStyle} from './responsive-photos.js';
import {storyFor} from './car-stories.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const states={'verified':'Source-checked','source-linked':'Reference linked','unavailable':'Not available','not-applicable':'Not applicable'};
const locales={en:'en-GB',ka:'ka-GE',ru:'ru-RU'};

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

function renderStory(model){
  const story=storyFor(model);if(!story)return '';
  return `<section class="car-story" aria-labelledby="car-story-title"><span class="eyebrow">${esc(t('The story behind the badge'))}</span><h2 id="car-story-title">${esc(story.tagline)}</h2><p class="car-story-lead">${esc(story.story)}</p><div class="car-story-grid"><section><h3>${esc(t('Who is it for?'))}</h3><p>${esc(story.bestFor)}</p></section><section><h3>${esc(t('Before you choose'))}</h3><p>${esc(story.tradeOff)}</p></section></div><div class="car-facts">${story.facts.map((fact,index)=>`<p><strong>${esc(t('Did you know?'))} / 0${index+1}</strong>${esc(fact)}</p>`).join('')}</div><a class="car-buyer-guide" href="/generation-guides?model=${encodeURIComponent(model.id)}">${esc(t('Buyer guide & running costs'))} ↗</a><details class="car-story-sources"><summary>${esc(t('Read the factory story'))} ↗</summary><a href="${esc(story.source)}" target="_blank" rel="noopener noreferrer">${esc(model.name)} · ${esc(t('BMW reference'))}</a><p>${esc(t('Introduction and buying considerations by APEX. Exact specifications and their sources follow below.'))}</p></details></section>`;
}

function renderField(field){
  return `<div class="profile-field" data-profile-field="${esc(field.id)}"><dt>${esc(t(field.label))}</dt><dd><span class="profile-value ${field.value===null?'profile-missing':''}">${field.value===null?esc(t(states[field.status])):esc(valueText(field.value))+(field.unit?' <span class="profile-unit">'+esc(field.unit)+'</span>':'')}</span>${field.value!==null?`<span class="profile-status" data-status="${esc(field.status)}">${esc(t(states[field.status]))}</span>`:''}${field.sources.length?`<details class="profile-provenance"><summary>${esc(t('Source details'))}</summary>${field.note?`<p>${esc(t(field.note))}</p>`:''}${field.sources.map(source=>`<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a><small>${esc(source.year?t('Specification year: {year}',{year:source.year}):t('Source year not recorded'))}${source.locator?' · '+esc(source.locator):''}</small>`).join('')}</details>`:field.note?`<p class="profile-field-note">${esc(t(field.note))}</p>`:''}</dd></div>`;
}

export function renderModelProfile(model){
  const profile=model.profile;if(!profile)return '';
  const {summary}=profile,sourced=summary.verified+summary.sourceLinked;
  const available=profile.sections.map(section=>({...section,fields:section.fields.filter(field=>field.value!==null)})).filter(section=>section.fields.length);
  const pending=profile.sections.flatMap(section=>section.fields).filter(field=>field.status==='unavailable');
  const photos=profile.photos.filter(slot=>slot.photo),missingPhotos=profile.photos.filter(slot=>slot.required&&!slot.photo);
  return renderStory(model)+`<div class="model-profile" aria-labelledby="model-profile-title"><div class="profile-heading"><div><span class="eyebrow">${esc(t('Specification'))}</span><h2 id="model-profile-title">${esc(t('Full model profile'))}</h2><p>${esc(t('Explore the details. Open any source to check its year, market and units.'))}</p></div><span class="profile-coverage">${esc(t('Sourced fields: {count} of {total}',{count:sourced,total:summary.total-summary.notApplicable}))}</span></div>${profile.context.specification?`<p class="profile-context">${esc(profile.context.specification)}</p>`:''}${sourceMeasurements(model)}${model.verified?.verificationNote?`<p class="profile-context">${esc(t(model.verified.verificationNote))}</p>`:''}<div class="profile-sections">${available.map((section,index)=>`<details class="profile-data-group" ${index<2?'open':''}><summary><span>${esc(t(section.label))}</span><small>${section.fields.length}</small></summary><dl>${section.fields.map(renderField).join('')}</dl></details>`).join('')}</div>${pending.length?`<details class="profile-research"><summary>${esc(t('Details still being researched'))} <span>${pending.length}</span></summary><p>${esc(t('Missing information stays visible until a matching source is recorded.'))}</p><dl>${pending.map(renderField).join('')}</dl></details>`:''}<section class="profile-photos" aria-labelledby="profile-photos-title"><div class="profile-photo-heading"><h3 id="profile-photos-title">${esc(t('Photo coverage'))}</h3><a href="/photos?model=${encodeURIComponent(model.id)}">${esc(t('Photos & sources'))}</a></div><div class="profile-photo-grid">${photos.map(slot=>`<article class="profile-photo-slot"><img src="${esc(slot.photo.src)}" alt="${esc(model.name+' ? '+t(slot.label)+' ? '+(slot.photo.angle||''))}" ${responsivePhotoAttributes(slot.photo, '(max-width: 600px) 45vw, 22vw')} style="${photoBlurStyle(slot.photo.src)}" loading="lazy" decoding="async"><h4>${esc(t(slot.label))}</h4><p>${esc(slot.photo.caption||'')}</p><p>${esc(slot.photo.credit.author)} ? ${esc(slot.photo.credit.license)}</p><a href="${esc(slot.photo.credit.page)}" target="_blank" rel="noopener noreferrer">${esc(t('Source and license'))}</a></article>`).join('')}</div>${missingPhotos.length?`<details class="profile-photo-pending"><summary>${esc(t('Additional views being researched'))} ? ${missingPhotos.length}</summary><ul>${missingPhotos.map(slot=>`<li><strong>${esc(t(slot.label))}</strong> ? ${esc(slot.reason)}</li>`).join('')}</ul></details>`:''}</section></div>`;
}
