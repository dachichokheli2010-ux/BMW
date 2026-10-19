import {t,getLanguage} from './preferences.js';
import './favorites-translations.js';
import {icon} from './icons.js';
import {responsivePhotoAttributes,photoBlurStyle} from './responsive-photos.js';
import {yearOf} from './collection.js';
import {convertedPower} from './comparison.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/** @param {unknown} value @param {{id:string}[]} catalog */
export function validFavoriteIds(value,catalog){
 const known=new Set(catalog.map(model=>model.id));
 return [...new Set((Array.isArray(value)?value:[]).filter(id=>typeof id==='string'&&known.has(id)))];
}
export function favoritesShareURL(origin,ids,catalog){const url=new URL('/favorites',origin);url.searchParams.set('list',validFavoriteIds(ids,catalog).join(','));return url.href;}

/** A shared list never replaces a visitor's saved data without their action. */
export function mountFavorites(container,{catalog,dialog,toast}={}){
 const controller=new AbortController(),signal=controller.signal,selected=new Set();
 const query=new URLSearchParams(location.search),shared=query.has('list');
 const sharedIds=validFavoriteIds((query.get('list')||'').split(','),catalog);
 let sort='saved',notice='',own=[];
 function read(){try{own=validFavoriteIds(JSON.parse(localStorage.getItem('apex-favorites')||'[]'),catalog);sort=localStorage.getItem('apex-favorites-sort')||sort;}catch{own=[];}}
 function save(ids){
  try{localStorage.setItem('apex-favorites',JSON.stringify(validFavoriteIds(ids,catalog)));window.dispatchEvent(new CustomEvent('apex:localchange',{detail:{key:'apex-favorites'}}));window.dispatchEvent(new CustomEvent('apex:favoriteschange'));return true;}
  catch{notice=t('Could not save favorites. Browser storage may be unavailable.');render();return false;}
 }
 function render(){
  read();const ids=shared?sharedIds:own;
  for(const id of selected)if(!ids.includes(id))selected.delete(id);
  const models=ids.map(id=>catalog.find(model=>model.id===id));
  if(sort==='name')models.sort((a,b)=>a.name.localeCompare(b.name,getLanguage(),{numeric:true}));
  if(sort==='year')models.sort((a,b)=>(yearOf(b)||0)-(yearOf(a)||0));
  if(sort==='power')models.sort((a,b)=>(convertedPower(b,'metric')?.kw||0)-(convertedPower(a,'metric')?.kw||0));
  container.innerHTML=`<div class="favorites-heading"><div><span class="eyebrow">APEX / ${esc(t('Favorites'))}</span><h1>${esc(t(shared?'Shared favorites':'Your favorites.'))}</h1><p>${esc(t(shared?'You are viewing a shared list. Save it to add these models to your own favorites.':'Save the BMWs that catch your eye. Your favorites stay on this device and merge with your account when you sign in.'))}</p></div><span class="favorites-total">${models.length.toLocaleString(getLanguage())}</span></div>${models.length?`<div class="favorites-tools"><label>${esc(t('Sort by'))}<select data-favorite-sort>${[['saved','Saved order'],['name','Name: A to Z'],['year','Newest specification first'],['power','Power: high to low']].map(([value,label])=>`<option value="${value}" ${sort===value?'selected':''}>${esc(t(label))}</option>`).join('')}</select></label><div>${shared?`<button type="button" data-favorite-import>${icon('favorite')}${esc(t('Save this list'))}</button>`:''}<button type="button" data-favorite-share>${icon('share')}${esc(t('Share favorites'))}</button><button type="button" data-favorite-compare ${selected.size<2?'disabled':''}>${icon('compare')}${esc(t('Compare selected'))} <span>${selected.size}/3</span></button></div></div><p class="favorites-hint">${esc(t('Choose two or three BMWs to compare.'))}</p><div class="favorites-grid">${models.map(model=>`<article class="favorite-card"><a href="/models?model=${encodeURIComponent(model.id)}"><div class="favorite-image" style="${photoBlurStyle(model.car)}"><img src="${esc(model.car)}" ${responsivePhotoAttributes({src:model.car,width:model.width,height:model.height},'(max-width: 600px) 90vw, (max-width: 1000px) 43vw, 28vw')} alt="${esc(model.name+' '+model.generation.split(' / ').at(-1))}" loading="lazy" decoding="async"></div><div class="favorite-copy"><span>${esc(model.generation.split(' / ').at(-1))}</span><h2>${esc(model.name)}</h2><p>${esc(model.code)} · ${esc(model.power)} ${esc(model.powerUnit)}</p></div></a><div class="favorite-actions"><label><input type="checkbox" data-favorite-select="${esc(model.id)}" ${selected.has(model.id)?'checked':''} ${selected.size>=3&&!selected.has(model.id)?'disabled':''}><span>${esc(t('Select for comparison'))}</span><span class="sr-only"> ${esc(model.name)}</span></label>${!shared?`<button type="button" data-favorite-remove="${esc(model.id)}" aria-label="${esc(t('Remove from favorites')+': '+model.name)}">${icon('favorite')}</button>`:''}</div></article>`).join('')}</div>`:`<div class="favorites-empty">${icon('garage')}<h2>${esc(t(shared?'This shared list is empty':'No favorites yet'))}</h2><p>${esc(t('Use the heart on any model to start your collection.'))}</p><a class="button-primary" href="/models">${esc(t('Browse models'))}${icon('next')}</a></div>`}<p class="favorites-notice" role="status" aria-live="polite">${esc(notice)}</p>`;
 }
 container.classList.add('favorites-page');render();
 container.addEventListener('change',event=>{
  const input=event.target;
  if(input.matches('[data-favorite-sort]')){sort=input.value;try{localStorage.setItem('apex-favorites-sort',sort);}catch{}render();}
  if(input.matches('[data-favorite-select]')){input.checked?selected.add(input.dataset.favoriteSelect):selected.delete(input.dataset.favoriteSelect);render();container.querySelector(`[data-favorite-select="${input.dataset.favoriteSelect}"]`)?.focus();}
 },{signal});
 container.addEventListener('click',async event=>{
  const remove=event.target.closest('[data-favorite-remove]');if(remove){save(own.filter(id=>id!==remove.dataset.favoriteRemove));return;}
  if(event.target.closest('[data-favorite-import]')){if(save([...own,...sharedIds])){notice=t('List saved to your favorites.');render();}return;}
  if(event.target.closest('[data-favorite-compare]')){if(selected.size>=2)location.href='/compare?compare='+[...selected].map(encodeURIComponent).join(',');return;}
  if(event.target.closest('[data-favorite-share]')){
   const url=favoritesShareURL(location.origin,shared?sharedIds:own,catalog);
   try{if(navigator.share)await navigator.share({title:'APEX · '+t('Favorites'),url});else{await navigator.clipboard.writeText(url);toast?.(t('Favorites link copied.'));}}
   catch(error){if(error.name==='AbortError')return;dialog?.(`<h2>${esc(t('Share favorites'))}</h2><input type="text" readonly value="${esc(url)}" aria-label="${esc(t('Share favorites'))}">`);}
  }
 },{signal});
 window.addEventListener('apex:favoriteschange',render,{signal});window.addEventListener('apex:languagechange',render,{signal});window.addEventListener('storage',event=>{if(event.key==='apex-favorites')render();},{signal});
 return {destroy(){controller.abort();container.replaceChildren();}};
}
