import {responsivePhotoAttributes,photoBlurStyle} from './responsive-photos.js';

const copy={
  en:{gallery:'View gallery',previous:'Previous photograph',next:'Next photograph',source:'Photo source',license:'Photo license',original:'Original photograph',model:'BMW model photography',hint:'Swipe or use the arrow keys to browse. Zoom in to drag the photo or adjust zoom with two fingers.',front:'Front',rear:'Rear',side:'Side',interior:'Interior',detail:'Detail',engine:'Engine',zoomIn:'Zoom in',zoomOut:'Zoom out',reset:'Reset zoom',zoom:'Photo zoom',viewport:'Photograph. Use arrow keys to browse; when zoomed, use them to pan.',unavailable:'Photograph unavailable. Choose another view.',credit:'Photo by',close:'Close gallery'},
  ka:{gallery:'გალერეის ნახვა',previous:'წინა ფოტო',next:'შემდეგი ფოტო',source:'ფოტოს წყარო',license:'ფოტოს ლიცენზია',original:'ორიგინალი ფოტო',model:'BMW-ის მოდელის ფოტოები',hint:'ფოტოების შესაცვლელად გაუსვით თითი ან გამოიყენეთ ისრის ღილაკები. გასადიდებლად დააჭირეთ შესაბამის ღილაკს; შემდეგ გადაიტანეთ ფოტო ან შეცვალეთ მასშტაბი ორი თითით.',front:'წინიდან',rear:'უკნიდან',side:'გვერდიდან',interior:'ინტერიერი',detail:'დეტალი',engine:'ძრავა',zoomIn:'გადიდება',zoomOut:'შემცირება',reset:'მასშტაბის აღდგენა',zoom:'ფოტოს მასშტაბი',viewport:'ფოტო. ისრის ღილაკებით შეცვალეთ ფოტო; გადიდებისას გადაადგილეთ იგი.',unavailable:'ფოტო მიუწვდომელია. აირჩიეთ სხვა ხედი.',credit:'ფოტოს ავტორი:',close:'გალერეის დახურვა'},
  ru:{gallery:'Открыть галерею',previous:'Предыдущая фотография',next:'Следующая фотография',source:'Источник фото',license:'Лицензия фотографии',original:'Оригинал фотографии',model:'Фотографии модели BMW',hint:'Листайте свайпом или клавишами со стрелками. Увеличьте фото, чтобы перемещать его или менять масштаб двумя пальцами.',front:'Спереди',rear:'Сзади',side:'Сбоку',interior:'Интерьер',detail:'Деталь',engine:'Двигатель',zoomIn:'Увеличить',zoomOut:'Уменьшить',reset:'Сбросить масштаб',zoom:'Масштаб фотографии',viewport:'Фотография. Переключайте кадры стрелками; при увеличении стрелки перемещают фото.',unavailable:'Фотография недоступна. Выберите другой ракурс.',credit:'Автор фото:',close:'Закрыть галерею'}
};
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const angleType=angle=>/engine|powertrain/i.test(angle)?'engine':/rear/i.test(angle)?'rear':/front/i.test(angle)?'front':/side|profile/i.test(angle)?'side':/interior|cockpit|cabin|dashboard|seats/i.test(angle)?'interior':'detail';
const icon=kind=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+({previous:'<path d="M20 8h-8c-3 0-5 2-5 5v4M10 5 7 8l3 3"/>',next:'<path d="M4 16h8c3 0 5-2 5-5V7M14 4l3 3-3 3"/>',external:'<path d="M4 20v-6a7 7 0 0 1 7-7h8M15 3l4 4-4 4M8 20v-5a4 4 0 0 1 4-4"/>',in:'<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M7 10h6m-3-3v6"/>',out:'<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M7 10h6"/>',reset:'<path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/>'}[kind]||'')+'</svg>';
const dimensions=(photo,sizes='(max-width: 700px) 100vw, 1180px')=>' '+responsivePhotoAttributes(photo,sizes);
const href=value=>{if(!value)return '';try{const url=new URL(value,document.baseURI);return /^https?:$/.test(url.protocol)?url.href:'';}catch{return '';}};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export function mountGalleryEnhancements({getCurrent,getMode,getPhotos,getIndex,onSelect,openDialog}){
  const tools=document.querySelector('#gallery-tools'),modal=document.querySelector('#dialog'),body=document.querySelector('#dialogbody');
  if(!tools||!modal||!body)return {render(){},expand(){},destroy(){}};
  const lifecycle=new AbortController(),signal=lifecycle.signal,pointers=new Map();
  let scale=1,pan={x:0,y:0},identity='',gesture=null,opener=null;
  const labels=()=>copy[document.documentElement.lang]||copy.en;
  const active=()=>modal.open&&!!modal.querySelector('[data-photo-lightbox]');
  const viewport=()=>modal.querySelector('[data-lightbox-viewport]');
  function reset(){scale=1;pan={x:0,y:0};pointers.clear();gesture=null;}
  function photoIdentity(){return [getCurrent()?.id,getMode(),getPhotos()[getIndex()]?.src].join('|');}
  function focusKey(node){
    if(!node)return null;
    for(const key of ['lightboxControl','lightboxStep','lightboxIndex','galleryAngle'])if(node.dataset?.[key]!==undefined)return {key,value:node.dataset[key]};
    return node.hasAttribute?.('data-lightbox-viewport')?{key:'lightboxViewport',value:''}:null;
  }
  function restoreFocus(saved,scope){
    if(!saved)return;
    const attribute='data-'+saved.key.replace(/[A-Z]/g,letter=>'-'+letter.toLowerCase());
    const target=[...scope.querySelectorAll(`[${attribute}]`)].find(node=>node.getAttribute(attribute)===saved.value&&!node.disabled);
    (target||scope.querySelector('[data-lightbox-viewport]'))?.focus({preventScroll:true});
  }
  function creditHTML(photo,text){
    const credit=photo.credit;if(!credit)return '';
    const source=href(credit.page),license=href(credit.url||credit.page),original=href(photo.original||credit.original);
    return `<div class="lightbox-credit"><p>${esc(text.credit)} <strong>${esc(credit.author)}</strong></p><p>${license?`<a href="${esc(license)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(text.license+': '+credit.license)}">${esc(credit.license)}</a>`:esc(credit.license)}${source?` <a href="${esc(source)}" target="_blank" rel="noopener noreferrer">${esc(text.source)} ${icon('external')}</a>`:''}${original?` <a href="${esc(original)}" target="_blank" rel="noopener noreferrer">${esc(text.original)} ${icon('external')}</a>`:''}</p>${credit.changes?`<p>${esc(credit.changes)}</p>`:''}</div>`;
  }
  function lightbox(){
    const photos=getPhotos(),index=getIndex(),photo=photos[index],model=getCurrent(),text=labels();if(!photo||!model)return '';
    return `<div class="photo-lightbox" data-photo-lightbox data-no-i18n><div class="lightbox-heading"><div><span class="eyebrow">${esc(text.model)}</span><h2>${esc(model.name)}</h2></div><span class="lightbox-count" aria-live="polite">${index+1} / ${photos.length}</span></div><div class="lightbox-toolbar" role="group" aria-label="${esc(text.zoom)}"><button type="button" data-lightbox-control="out" aria-label="${esc(text.zoomOut)}">${icon('out')}</button><output data-lightbox-zoom aria-live="polite">100%</output><button type="button" data-lightbox-control="in" aria-label="${esc(text.zoomIn)}">${icon('in')}</button><button type="button" data-lightbox-control="reset">${icon('reset')}<span>${esc(text.reset)}</span></button></div><div class="lightbox-stage"><div class="lightbox-viewport" style="${esc(photoBlurStyle(photo.src))}" data-lightbox-viewport tabindex="0" role="group" aria-label="${esc(text.viewport)}"><img class="lightbox-image" src="${esc(photo.src)}"${dimensions(photo)} alt="${esc(model.name+' · '+(photo.angle||''))}" decoding="async" draggable="false"><p class="lightbox-unavailable" data-lightbox-unavailable role="status" hidden>${esc(text.unavailable)}</p></div><button type="button" class="lightbox-previous" data-lightbox-step="-1" ${index===0?'disabled':''} aria-label="${esc(text.previous)}">${icon('previous')}</button><button type="button" class="lightbox-next" data-lightbox-step="1" ${index===photos.length-1?'disabled':''} aria-label="${esc(text.next)}">${icon('next')}</button></div><div class="lightbox-footer"><div><strong>${esc(photo.angle)}</strong><p>${esc(photo.caption)}</p></div>${creditHTML(photo,text)}</div><div class="lightbox-thumbnails">${photos.map((item,i)=>`<button type="button" data-lightbox-index="${i}" class="${i===index?'active':''}" aria-label="${esc(item.angle)}" aria-pressed="${i===index}"><img src="${esc(item.src)}"${dimensions(item,"110px")} style="${esc(photoBlurStyle(item.src))}" alt="" loading="lazy" decoding="async"><span>${esc(item.angle)}</span></button>`).join('')}</div><p class="lightbox-hint">${esc(text.hint)}</p></div>`;
  }
  function transform(){
    const stage=viewport(),image=stage?.querySelector('.lightbox-image');if(!stage||!image)return;
    const box=stage.getBoundingClientRect(),width=image.naturalWidth||Number(image.getAttribute('width'))||box.width,height=image.naturalHeight||Number(image.getAttribute('height'))||box.height;
    const fit=Math.min(box.width/width,box.height/height),limitX=Math.max(0,(width*fit*scale-box.width)/2),limitY=Math.max(0,(height*fit*scale-box.height)/2);
    pan.x=clamp(pan.x,-limitX,limitX);pan.y=clamp(pan.y,-limitY,limitY);
    image.style.transform=`translate(${pan.x}px,${pan.y}px) scale(${scale})`;stage.classList.toggle('is-zoomed',scale>1);
    const output=modal.querySelector('[data-lightbox-zoom]');if(output)output.textContent=Math.round(scale*100)+'%';
    modal.querySelector('[data-lightbox-control="out"]').disabled=scale<=1;modal.querySelector('[data-lightbox-control="in"]').disabled=scale>=4;
  }
  function zoomTo(value){scale=clamp(value,1,4);if(scale===1)pan={x:0,y:0};transform();if(document.activeElement?.disabled&&document.activeElement.hasAttribute('data-lightbox-control'))viewport()?.focus({preventScroll:true});}
  function step(delta){const index=getIndex()+delta;if(index>=0&&index<getPhotos().length)onSelect(index);}
  function render(){
    const photos=getPhotos(),text=labels(),model=getCurrent(),savedTools=tools.contains(document.activeElement)?focusKey(document.activeElement):null;
    tools.hidden=!model||getMode()==='three'||!photos.length;
    if(!tools.hidden){
      tools.innerHTML=`<div class="gallery-angle-shortcuts">${photos.map((photo,index)=>`<button type="button" data-gallery-angle="${index}" class="${index===getIndex()?'active':''}" aria-pressed="${index===getIndex()}" title="${esc(photo.angle)}"><span class="angle-number">${String(index+1).padStart(2,'0')}</span>${esc(text[angleType(photo.angle)])}</button>`).join('')}</div><button class="open-gallery" type="button" data-gallery-open>${esc(text.gallery)} <span>${photos.length} ${icon('external')}</span></button>`;
      restoreFocus(savedTools,tools);
    }
    if(active()){
      if(!photos.length||getMode()==='three'){modal.close();return;}
      const saved=focusKey(document.activeElement),nextIdentity=photoIdentity();if(nextIdentity!==identity){reset();identity=nextIdentity;}
      body.innerHTML=lightbox();transform();restoreFocus(saved,modal);
      const strip=modal.querySelector('.lightbox-thumbnails'),thumb=strip?.querySelector('[data-lightbox-index].active');
      if(strip&&thumb)strip.scrollLeft=clamp(thumb.offsetLeft-(strip.clientWidth-thumb.clientWidth)/2,0,Math.max(0,strip.scrollWidth-strip.clientWidth));
    }
  }
  function expand(){
    if(!getCurrent()||getMode()==='three'||!getPhotos().length)return;
    opener=document.activeElement;reset();identity=photoIdentity();openDialog(lightbox());modal.classList.add('photo-dialog');
    transform();viewport()?.focus({preventScroll:true});
  }
  tools.addEventListener('click',event=>{const angle=event.target.closest('[data-gallery-angle]');if(angle)onSelect(Number(angle.dataset.galleryAngle));else if(event.target.closest('[data-gallery-open]'))expand();},{signal});
  modal.addEventListener('click',event=>{
    if(!active())return;const button=event.target.closest('button');if(!button||button.disabled)return;
    if(button.hasAttribute('data-lightbox-step'))step(Number(button.dataset.lightboxStep));
    if(button.hasAttribute('data-lightbox-index'))onSelect(Number(button.dataset.lightboxIndex));
    const control=button.dataset.lightboxControl;if(control==='in')zoomTo(scale+.5);if(control==='out')zoomTo(scale-.5);if(control==='reset')zoomTo(1);
  },{signal});
  modal.addEventListener('keydown',event=>{
    if(!active()||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input,textarea,select,[contenteditable],a,[data-lightbox-control]'))return;
    if(event.key==='+'||event.key==='='){event.preventDefault();zoomTo(scale+.5);return;}if(event.key==='-'){event.preventDefault();zoomTo(scale-.5);return;}
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    if(scale>1&&event.target.matches('[data-lightbox-viewport]')){event.preventDefault();pan.x+=event.key==='ArrowLeft'?40:event.key==='ArrowRight'?-40:0;pan.y+=event.key==='ArrowUp'?40:event.key==='ArrowDown'?-40:0;transform();}
    else if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();step(event.key==='ArrowRight'?1:-1);}
  },{signal});
  modal.addEventListener('pointerdown',event=>{
    const stage=event.target.closest('[data-lightbox-viewport]');if(!active()||!stage||event.button>0)return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    stage.setPointerCapture(event.pointerId);
    if(scale>1){event.preventDefault();const points=[...pointers.values()];gesture=points.length>1?{type:'pinch',distance:Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y),scale}:{type:'pan',start:{x:event.clientX,y:event.clientY},pan:{...pan}};}
    else gesture={type:'swipe',start:{x:event.clientX,y:event.clientY},time:performance.now()};
  },{signal});
  modal.addEventListener('pointermove',event=>{
    if(!pointers.has(event.pointerId)||!gesture)return;pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(gesture.type==='pinch'){const points=[...pointers.values()];if(points.length>1&&gesture.distance>0)zoomTo(gesture.scale*Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y)/gesture.distance);}
    if(gesture.type==='pan'){pan={x:gesture.pan.x+event.clientX-gesture.start.x,y:gesture.pan.y+event.clientY-gesture.start.y};transform();}
  },{signal});
  function finishPointer(event){
    if(!pointers.has(event.pointerId))return;const previous=gesture;pointers.delete(event.pointerId);
    if(event.type==='pointerup'&&previous?.type==='swipe'&&pointers.size===0&&performance.now()-previous.time<900){const dx=event.clientX-previous.start.x,dy=event.clientY-previous.start.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)step(dx<0?1:-1);}
    gesture=null;
    if(pointers.size===1&&scale>1){const point=[...pointers.values()][0];gesture={type:'pan',start:{...point},pan:{...pan}};}
  }
  for(const event of ['pointerup','pointercancel','lostpointercapture'])modal.addEventListener(event,finishPointer,{signal});
  modal.addEventListener('error',event=>{if(active()&&event.target.matches('.lightbox-image')){event.target.hidden=true;modal.querySelector('[data-lightbox-unavailable]').hidden=false;}},{capture:true,signal});
  modal.addEventListener('load',event=>{if(active()&&event.target.matches('.lightbox-image'))transform();},{capture:true,signal});
  modal.addEventListener('close',()=>{const wasGallery=modal.classList.contains('photo-dialog');reset();identity='';if(wasGallery)(opener?.isConnected?opener:tools.querySelector('[data-gallery-open]')||document.querySelector('#enlargephoto'))?.focus({preventScroll:true});opener=null;},{signal});
  window.addEventListener('resize',()=>{if(active())transform();},{signal});
  window.addEventListener('apex:languagechange',()=>{if(getCurrent())render();},{signal});
  return {render,expand,destroy(){lifecycle.abort();reset();}};
}
