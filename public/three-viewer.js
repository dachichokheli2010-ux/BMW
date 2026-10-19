// Creator-hosted iframes are loaded only after a deliberate click. A failed or
// blocked embed always leaves its source and a retry available.
export function mountThreeViewer({player,entry,button,retry,status,getModel,isActive,setTimer=setTimeout,clearTimer=clearTimeout}){
 let timer=null,session=0;
 function clear(){
  session++;if(timer!==null)clearTimer(timer);timer=null;
  player.querySelectorAll('iframe').forEach(frame=>frame.remove());
  player.setAttribute('aria-busy','false');status.hidden=true;status.textContent='';
  entry.hidden=false;retry.hidden=true;button.disabled=false;
 }
 function load(){
  const model=getModel();if(!model||!isActive())return false;
  clear();const request=++session,doc=player.ownerDocument;
  const iframe=doc.createElement('iframe');
  const url=new URL(model.embed);url.searchParams.set('autostart','1');
  iframe.src=url.href;iframe.title=model.title+' · interactive 3D exterior';
  iframe.allow='autoplay; fullscreen; xr-spatial-tracking';iframe.allowFullscreen=true;
  iframe.referrerPolicy='strict-origin-when-cross-origin';
  entry.hidden=true;retry.hidden=false;player.setAttribute('aria-busy','true');
  status.textContent='Opening the 3D viewer…';status.hidden=false;
  const settle=()=>{if(request!==session)return false;if(timer!==null)clearTimer(timer);timer=null;player.setAttribute('aria-busy','false');return true;};
  iframe.addEventListener('load',()=>{if(settle())status.hidden=true;},{once:true});
  iframe.addEventListener('error',()=>{if(!settle())return;iframe.remove();entry.hidden=false;status.textContent='The 3D viewer could not load. Try again or open the original model below.';status.hidden=false;},{once:true});
  player.append(iframe);
  timer=setTimer(()=>{if(request!==session)return;timer=null;player.setAttribute('aria-busy','false');status.textContent='Still loading? You can wait, retry, or open the original model below. Some browser privacy settings block embedded viewers.';status.hidden=false;},20000);
  return true;
 }
 button.addEventListener('click',load);retry.addEventListener('click',load);
 return {load,clear,destroy(){clear();button.removeEventListener('click',load);retry.removeEventListener('click',load);}};
}
