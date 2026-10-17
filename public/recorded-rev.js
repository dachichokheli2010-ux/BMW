// Original hosted recordings, never synthesized, pitch-shifted or treated as an RPM sample bank.
const loads=new Map();
function sdk(provider){
 if(provider==='youtube'&&window.YT?.Player)return Promise.resolve();
 if(provider==='vimeo'&&window.Vimeo?.Player)return Promise.resolve();
 if(loads.has(provider))return loads.get(provider);
 const promise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');let timeout;
  const done=()=>{clearTimeout(timeout);resolve();};
  if(provider==='youtube'){const previous=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{previous?.();done();};}
  else script.onload=done;
  script.src=provider==='youtube'?'https://www.youtube.com/iframe_api':'https://player.vimeo.com/api/player.js';
  script.async=true;script.onerror=()=>{clearTimeout(timeout);loads.delete(provider);reject(new Error('Recording player could not load.'));};
  timeout=setTimeout(()=>{loads.delete(provider);reject(new Error('Recording player timed out.'));},15000);
  document.head.append(script);
 });loads.set(provider,promise);return promise;
}
export class RecordedRev {
 constructor(container,status){this.container=container;this.status=status;this.generation=0;this.held=false;this.ready=false;this.player=null;}
 async prepare(recording){
  this.destroy();const generation=this.generation;this.recording=recording;
  if(!recording){this.status.textContent='Matching real recording unavailable. No generic sound is substituted.';return;}
  this.status.textContent='Loading original recording…';
  try{
   await sdk(recording.provider);if(generation!==this.generation)return;
   const iframe=document.createElement('iframe');iframe.title=recording.title+' · original recording';iframe.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';
   iframe.src=recording.provider==='youtube'?`https://www.youtube-nocookie.com/embed/${recording.id}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&playsinline=1&rel=0`:`https://player.vimeo.com/video/${recording.id}?playsinline=1`;
   this.container.replaceChildren(iframe);
   const ready=()=>{if(generation!==this.generation)return;this.ready=true;this.status.textContent='Ready. Hold REV to play; release to pause the original recording.';if(this.held)this.play();else this.pause();};
   if(recording.provider==='youtube')this.player=new window.YT.Player(iframe,{events:{onReady:ready,onError:()=>{if(generation===this.generation)this.status.textContent='This recording cannot play here. Open the original recording below.';},onAutoplayBlocked:()=>{if(generation===this.generation)this.status.textContent='Tap Play in the recording once to enable sound, then hold REV.';}}});
   else{this.player=new window.Vimeo.Player(iframe);await this.player.ready();ready();}
  }catch(error){if(generation===this.generation)this.status.textContent='Recording unavailable in this browser. Open the original recording below.';}
 }
 play(){this.held=true;if(!this.ready||!this.player)return;try{if(this.recording.provider==='youtube'){if(this.player.getPlayerState?.()===0)this.player.seekTo(0,true);this.player.unMute();this.player.playVideo();}else this.player.play().catch(()=>{this.status.textContent='Tap Play in the recording once to enable sound, then hold REV.';});}catch{}}
 pause(){this.held=false;if(!this.ready||!this.player)return;try{if(this.recording.provider==='youtube')this.player.pauseVideo();else this.player.pause().catch(()=>{});}catch{}}
 destroy(){this.generation++;this.held=false;this.ready=false;try{const result=this.player?.destroy();result?.catch?.(()=>{});}catch{}this.player=null;this.container.replaceChildren();}
}
