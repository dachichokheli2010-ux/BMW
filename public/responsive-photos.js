import {responsivePhotoData} from './responsive-photo-data.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function responsivePhotoAttributes(photo,sizes='(max-width: 700px) 100vw, 60vw'){
  const data=responsivePhotoData[photo?.src];
  const width=data?.width||photo?.width||960,height=data?.height||photo?.height||600;
  return `width="${width}" height="${height}"${data?` srcset="${esc(data.variants.map(variant=>`${variant.src} ${variant.width}w`).join(', '))}" sizes="${esc(sizes)}"`:''}`;
}
export function applyResponsivePhoto(image,photo,sizes='(max-width: 700px) 100vw, 75vw'){
  const data=responsivePhotoData[photo.src];
  image.width=data?.width||photo.width||960;image.height=data?.height||photo.height||600;
  if(data){image.srcset=data.variants.map(variant=>`${variant.src} ${variant.width}w`).join(', ');image.sizes=sizes;}
  else{image.removeAttribute('srcset');image.removeAttribute('sizes');}
}
export function photoBlurStyle(src){
  const preview=responsivePhotoData[src]?.placeholder;
  return preview?`background-image:url('${preview}');background-size:contain;background-position:center;background-repeat:no-repeat`:'';
}
