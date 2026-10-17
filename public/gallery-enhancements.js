const copy={
  en:{gallery:'View gallery',views:'views',previous:'Previous photograph',next:'Next photograph',source:'BMW photo source',original:'Original photograph',model:'BMW model photography',hint:'Use the arrow keys to explore the gallery.',front:'Front',rear:'Rear',side:'Side',interior:'Interior',detail:'Detail'},
  ka:{gallery:'გალერეის ნახვა',views:'ხედი',previous:'წინა ფოტო',next:'შემდეგი ფოტო',source:'BMW-ის ფოტოს წყარო',original:'ორიგინალი ფოტო',model:'BMW-ის მოდელის ფოტოები',hint:'ფოტოების სანახავად გამოიყენეთ ისრის ღილაკები.',front:'წინიდან',rear:'უკნიდან',side:'გვერდიდან',interior:'ინტერიერი',detail:'დეტალი'},
  ru:{gallery:'Открыть галерею',views:'ракурса',previous:'Предыдущая фотография',next:'Следующая фотография',source:'Источник фото BMW',original:'Оригинал фотографии',model:'Фотографии модели BMW',hint:'Переключайте фотографии клавишами со стрелками.',front:'Спереди',rear:'Сзади',side:'Сбоку',interior:'Интерьер',detail:'Деталь'}
};
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const angleType=angle=>/rear/i.test(angle)?'rear':/front/i.test(angle)?'front':/side|profile/i.test(angle)?'side':/interior|cockpit|cabin/i.test(angle)?'interior':'detail';
export function mountGalleryEnhancements({getCurrent,getMode,getPhotos,getIndex,onSelect,openDialog}){
  const tools=document.querySelector('#gallery-tools'),modal=document.querySelector('#dialog');
  const labels=()=>copy[document.documentElement.lang]||copy.en;
  function lightbox(){
    const photos=getPhotos(),index=getIndex(),photo=photos[index],model=getCurrent(),text=labels();
    if(!photo)return '';
    return `<div class="photo-lightbox" data-photo-lightbox><div class="lightbox-heading"><div><span class="eyebrow">${esc(text.model)}</span><h2>${esc(model.name)}</h2></div><span class="lightbox-count">${index+1} / ${photos.length}</span></div><div class="lightbox-stage"><img class="lightbox-image" src="${esc(photo.src)}" alt="${esc(model.name+' · '+photo.angle)}"><button class="lightbox-previous" data-lightbox-step="-1" ${index===0?'disabled':''} aria-label="${esc(text.previous)}">←</button><button class="lightbox-next" data-lightbox-step="1" ${index===photos.length-1?'disabled':''} aria-label="${esc(text.next)}">→</button></div><div class="lightbox-footer"><div><strong>${esc(photo.angle)}</strong><p>${esc(photo.caption)}</p></div>${photo.credit?`<a href="${esc(photo.credit.page)}" target="_blank" rel="noopener noreferrer">${esc(text.source)} ↗</a>`:''}</div><div class="lightbox-thumbnails">${photos.map((item,i)=>`<button data-lightbox-index="${i}" class="${i===index?'active':''}" aria-label="${esc(item.angle)}" aria-pressed="${i===index}"><img src="${esc(item.src)}" alt=""><span>${esc(item.angle)}</span></button>`).join('')}</div><p class="lightbox-hint">${esc(text.hint)}</p></div>`;
  }
  function bind(){
    modal.querySelectorAll('[data-lightbox-step]').forEach(button=>button.onclick=()=>onSelect(getIndex()+Number(button.dataset.lightboxStep)));
    modal.querySelectorAll('[data-lightbox-index]').forEach(button=>button.onclick=()=>onSelect(Number(button.dataset.lightboxIndex)));
  }
  function render(){
    const photos=getPhotos(),text=labels(),model=getCurrent();
    tools.hidden=!model||getMode()!=='car';
    if(!tools.hidden){
      tools.innerHTML=`<div class="gallery-angle-shortcuts">${photos.map((photo,index)=>`<button data-gallery-angle="${index}" class="${index===getIndex()?'active':''}" aria-pressed="${index===getIndex()}" title="${esc(photo.angle)}"><span class="angle-number">${String(index+1).padStart(2,'0')}</span>${esc(text[angleType(photo.angle)])}</button>`).join('')}</div><button class="open-gallery" type="button">${esc(text.gallery)} <span>${photos.length} ↗</span></button>`;
      tools.querySelectorAll('[data-gallery-angle]').forEach(button=>button.onclick=()=>onSelect(Number(button.dataset.galleryAngle)));
      tools.querySelector('.open-gallery').onclick=expand;
    }
    if(modal.open&&modal.querySelector('[data-photo-lightbox]')){
      const focusIndex=modal.querySelector('[data-lightbox-index]:focus')?.dataset.lightboxIndex;
      const focusStep=modal.querySelector('[data-lightbox-step]:focus')?.dataset.lightboxStep;
      document.querySelector('#dialogbody').innerHTML=lightbox();bind();
      if(focusIndex!==undefined)modal.querySelector(`[data-lightbox-index="${focusIndex}"]`)?.focus({preventScroll:true});
      else if(focusStep!==undefined)modal.querySelector(`[data-lightbox-step="${focusStep}"]:not(:disabled)`)?.focus({preventScroll:true});
    }
  }
  function expand(){if(!getPhotos().length)return;openDialog(lightbox());modal.classList.add('photo-dialog');bind();}
  modal.addEventListener('keydown',event=>{if(!modal.querySelector('[data-photo-lightbox]')||!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();onSelect(getIndex()+(event.key==='ArrowRight'?1:-1));});
  window.addEventListener('apex:languagechange',()=>{if(getCurrent())render();});
  return {render,expand};
}
