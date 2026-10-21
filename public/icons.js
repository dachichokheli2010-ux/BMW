import {originalText,translateText,t} from './preferences.js';

// Original Motron symbols: one 24-unit grid, rounded 1.5-unit strokes.
const drawings=Object.freeze({
 external:'<path d="M4 21v-7a7 7 0 0 1 7-7h9M16 3l4 4-4 4M8 21v-6a4 4 0 0 1 4-4"/>',
 next:'<path d="M3 16h8a6 6 0 0 0 6-6V5M13 9l4-4 4 4M3 12h7a3 3 0 0 0 3-3V5"/>',
 back:'<path d="M21 16h-8a6 6 0 0 1-6-6V5M3 9l4-4 4 4M21 12h-7a3 3 0 0 1-3-3V5"/>',
 engine:'<path d="M5 8h4l2-3h6v3h3v10H7l-2-3H2V9h3M12 2v3M9 2h6M22 10v6M2 7v10"/>',
 piston:'<path d="m5 4 11 3-2 7-11-3ZM8 5l-1 6M10 13l-2 5M13 14l-2 5"/><circle cx="9" cy="20" r="2"/>',
 spark:'<path d="m10 2 4 2-2 5 3 1-3 6-2-1-2 5-3-1 3-6-2-1 3-5-1-1ZM4 22l2-1M17 16l3 2M17 12l4-1"/>',
 turbo:'<path d="M12 4a8 8 0 1 0 8 8V9h-6V4ZM20 9V3h-6M5 19H2v-5"/><circle cx="11" cy="12" r="3"/><path d="m10 10 2 4m-3-2 4-1"/>',
 gearbox:'<path d="M4 3v18M12 3v18M20 3v9H4"/><circle cx="4" cy="3" r="1.5"/><circle cx="12" cy="3" r="1.5"/><circle cx="20" cy="3" r="1.5"/><circle cx="4" cy="21" r="1.5"/><circle cx="12" cy="21" r="1.5"/>',
 brake:'<circle cx="11" cy="12" r="9"/><circle cx="11" cy="12" r="3"/><path d="M18 5h4v11h-4M7 7h1m5-1h1m-8 6h1m1 5h1m4 1h1"/>',
 wheel:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="1.5"/><path d="M12 5.5v5m0 3v5m-6-9 4.5 2m3 1 4.5 2m-11 3 4-4m2-2 4-4"/>',
 suspension:'<path d="M12 2v3m0 14v3M8 5h8l-8 3 8 3-8 3 8 3H8M10 17v2h4v-2M8 2h8M8 22h8"/>',
 exhaust:'<path d="M2 7h5l2 3h7a4 4 0 0 1 4 4v3h-4v-3h-6l-3-3H2M20 13h2v5h-2"/>',
 radiator:'<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 5v14m4-14v14m4-14v14M6 2v3m12 14v3M2 9h2m16 6h2"/>',
 battery:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M6 3h3v3m6-3h3v3M6 11h4m-2-2v4m7-2h3"/>',
 steering:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M2 10h7m6 0h7M10 15l-2 6m6-6 2 6M5 6c4 2 10 2 14 0"/>',
 key:'<circle cx="7" cy="8" r="5"/><path d="m11 12 9 9 2-2-2-2 1-1-2-2-1 1-4-4M5 7h1"/>',
 speedometer:'<path d="M4 19a10 10 0 1 1 16 0M4 19h16M12 12l6-6M5 12h2m10 0h2M12 3v2M6 6l1 1"/><circle cx="12" cy="12" r="1.5"/>',
 tachometer:'<path d="M4 19a10 10 0 1 1 16 0M4 19h16M12 12 8 5M5 12h2m10 0h2M12 3v2m5 1 2-2"/><circle cx="12" cy="12" r="1.5"/>',
 oil:'<path d="M3 8h9l4 4 4-2 2 3-5 4H4ZM6 8V5h5v3M3 11H1v5h3M20 19c-2 2-2 3 0 3s2-1 0-3"/>',
 headlight:'<path d="M13 5c5 0 8 3 8 7s-3 7-8 7V5ZM2 6l8 2M2 12h8M2 18l8-2"/>',
 charging:'<path d="M9 2v5m6-5v5M7 7h10v5a5 5 0 0 1-10 0ZM12 17v5M2 10h2m16 0h2"/>',
 favorite:'<path d="M12 21 3.5 13a5.5 5.5 0 0 1 8-7.5l.5.5.5-.5a5.5 5.5 0 0 1 8 7.5Z"/>',
 compare:'<path d="M3 8h18m-4-4 4 4-4 4M21 16H3m4-4-4 4 4 4"/>',
 share:'<path d="M12 16V3m-4 4 4-4 4 4M5 12v8h14v-8"/>',
 garage:'<path d="M2 10 12 3l10 7M4 9v12h16V9M7 21V11h10v10M7 15h10m-10 3h10"/>',
 search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
 filter:'<path d="M3 5h18M6 12h12M9 19h6"/><circle cx="8" cy="5" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>',
 language:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a21 21 0 0 1 0 20 21 21 0 0 1 0-20Z"/>',
 user:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
 quiz:'<path d="M8 3h8v5a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 5 4m7-7h4v3a4 4 0 0 1-5 4M12 12v6m-5 3h10M9 18h6v3"/>',
 sound:'<path d="M3 9h4l5-5v16l-5-5H3ZM16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
 check:'<path d="m5 12 4 4L20 5"/>',
 star:'<path d="m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h10"/>',
 loading:'<path d="M12 2a10 10 0 1 1-10 10M3 6l1-3 3 1"/>',
 offline:'<path d="m3 3 18 18M5 7a12 12 0 0 0-3 2m6 1a8 8 0 0 0-3 2m4 3 1-1M8 5a13 13 0 0 1 14 4m-9 0a8 8 0 0 1 6 3m-5 2 2 1M12 19h0"/>',
 photo:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8" cy="9" r="2"/><path d="m4 18 5-5 4 3 3-5 5 6"/>',
 book:'<path d="M12 5c-4-3-8-2-10-1v15c3-1 6-1 10 2 4-3 7-3 10-2V4c-2-1-6-2-10 1ZM12 5v16"/>',
 up:'<path d="M12 21V3m-6 6 6-6 6 6"/>',down:'<path d="M12 3v18m-6-6 6 6 6-6"/>',
 refresh:'<path d="M3 10a9 9 0 1 1 1 8M3 3v7h7"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h0"/>',
 clock:'<circle cx="12" cy="12" r="10"/><path d="M12 5v7l4 3"/>',
 plus:'<path d="M12 4v16M4 12h16"/>',minus:'<path d="M4 12h16"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 list:'<path d="M9 5h12M9 12h12M9 19h12M3 5h1m-1 7h1m-1 7h1"/>'
});
export const iconNames=Object.freeze(Object.keys(drawings));
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/** @param {string} name @param {{label?:string,className?:string}} [options] */
export function icon(name,{label,className=''}={}){
 if(!Object.hasOwn(drawings,name))throw new TypeError('Unknown Motron icon: '+name);
 return `<svg class="apex-icon ${esc(className)}" data-apex-icon="${name}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ${label?`role="img" aria-label="${esc(label)}"`:'aria-hidden="true"'}>${drawings[name]}</svg>`;
}

const glyphs=Object.freeze({'↗':'external','↖':'back','→':'next','←':'back','‹':'back','›':'next','↑':'up','↓':'down','✓':'check','✔':'check','✕':'close','✖':'close','★':'star','☆':'star','♥':'favorite','♡':'favorite','❤️':'favorite','❤':'favorite','⌁':'suspension','↻':'refresh','↶':'back','↔':'compare','◈':'wheel','◎':'tachometer','◇':'engine','⚒':'piston','◷':'clock','▱':'garage','✧':'spark','▥':'list','◉':'user','⌘':'gearbox','🏆':'quiz','🏁':'quiz','🚗':'garage','🏎':'speedometer','🔧':'piston','🛠':'engine','⚙':'gearbox','⚡':'charging','🔥':'spark','🔍':'search','🔎':'search','🌐':'language','🌍':'language','📚':'book','📖':'book','🧠':'quiz','🎯':'quiz','🔊':'sound','🎵':'sound','🔋':'battery','📷':'photo','📸':'photo','🔑':'key','⭐':'star','✅':'check','❌':'close','❎':'close','💡':'headlight','ℹ':'info','⏱':'clock','⏰':'clock','📊':'tachometer','🏠':'garage','👤':'user','💾':'garage','🗑':'close','📋':'list','🎮':'quiz','🎓':'book','🏅':'star','🥇':'star','🥈':'star','🥉':'star','📈':'tachometer','🚀':'next'});
const escapePattern=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const pattern=new RegExp('('+Object.keys(glyphs).sort((a,b)=>b.length-a.length).map(escapePattern).join('|')+')(?:\uFE0F)?','gu');
const excluded='script,style,svg,textarea,input,select,option,code,pre,kbd,[contenteditable],[data-source-verbatim],[data-apex-icon-text]';
const labels={external:'Open source',next:'Next',back:'Back',up:'Back to top',down:'Browse models',check:'Completed',close:'Close',star:'Achievement',favorite:'Favorites',refresh:'Try again',compare:'Compare',garage:'My garage',quiz:'Quiz',engine:'Engine',user:'Your account',search:'Search',language:'Language',sound:'Sound',charging:'Charging',clock:'Time'};
const knownControls=[['[data-save],#detail-save,.header-saved','favorite'],['[data-compare],#detail-compare','compare'],['#detail-share','share'],['[data-global-search]','search'],['#filter-toggle','filter'],['.mobile-menu-toggle','menu'],['[data-menu-close],#close','close'],['#grid-view','grid'],['#list-view','list']];

/** Replace decorative glyphs while keeping complete English translation keys. */
export function mountIcons(root=document){
 const document=root.ownerDocument||root,window=document.defaultView||globalThis.window;
 let queued=false,stopped=false;
 function renderText(wrapper){
  const value=translateText(wrapper.dataset.apexIconText),fragment=document.createDocumentFragment();let from=0,match;pattern.lastIndex=0;
  while((match=pattern.exec(value))){fragment.append(document.createTextNode(value.slice(from,match.index)));const holder=document.createElement('span');holder.innerHTML=icon(glyphs[match[1]]);fragment.append(holder.firstChild);from=pattern.lastIndex;}
  fragment.append(document.createTextNode(value.slice(from)));wrapper.replaceChildren(fragment);
 }
 function decorate(){
  queued=false;if(stopped)return;
  const walker=document.createTreeWalker(root===document?document.body:root,4),nodes=[];let node;
  while((node=walker.nextNode())){if(node.parentElement?.closest(excluded))continue;pattern.lastIndex=0;if(pattern.test(node.textContent))nodes.push(node);}
  for(const node of nodes){
   const source=originalText(node.textContent),wrapper=document.createElement('span');wrapper.dataset.apexIconText=source;wrapper.setAttribute('data-no-i18n','');wrapper.className='apex-icon-copy';node.replaceWith(wrapper);renderText(wrapper);
   const control=wrapper.closest('button,a');if(control&&!control.getAttribute('aria-label')&&!control.textContent.trim()){pattern.lastIndex=0;const key=pattern.exec(source)?.[1];control.setAttribute('aria-label',t(labels[glyphs[key]]||'Open'));}
  }
  for(const [selector,name]of knownControls)for(const control of root.querySelectorAll(selector)){const old=control.querySelector('svg');if(old&&!old.dataset.apexIcon){const holder=document.createElement('span');holder.innerHTML=icon(name);old.replaceWith(holder.firstChild);}}
  for(const button of root.querySelectorAll('button'))if(!button.children.length&&/^[×+−–-]$/.test(button.textContent.trim())){const symbol=button.textContent.trim(),name=symbol==='×'?'close':symbol==='+'?'plus':'minus';button.innerHTML=icon(name);if(!button.getAttribute('aria-label'))button.setAttribute('aria-label',t(name==='plus'?'Zoom in':name==='minus'?'Zoom out':'Close'));}
  for(const svg of root.querySelectorAll('svg[viewBox="0 0 24 24"]')){if(svg.closest('[data-ac-diagram],.dyno-chart,.engine-diagram'))continue;svg.setAttribute('stroke-width','1.5');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');if(svg.getAttribute('stroke')&&svg.getAttribute('stroke')!=='none')svg.setAttribute('stroke','currentColor');}
  for(const node of root.querySelectorAll('.loading-orbit:not([data-apex-loader])')){node.dataset.apexLoader='';node.classList.add('apex-loader');node.innerHTML=icon('loading');}
  for(const node of root.querySelectorAll('.search-empty,.destination-error'))if(!node.querySelector('[data-apex-empty]')){const visual=document.createElement('span');visual.dataset.apexEmpty='';visual.className='apex-empty-symbol';visual.innerHTML=icon(node.matches('.destination-error')?'engine':'garage');node.prepend(visual);}
 }
 // Disconnect during decoration so our own SVG insertions never schedule a loop.
 function onMutation(){if(!queued&&!stopped){queued=true;window.requestAnimationFrame(refresh);}}
 const live=new window.MutationObserver(onMutation);
 function refresh(){live.disconnect();decorate();if(!stopped)live.observe(root===document?document.body:root,{subtree:true,childList:true,characterData:true});}
 function onLanguage(){live.disconnect();for(const wrapper of root.querySelectorAll('[data-apex-icon-text]'))renderText(wrapper);refresh();}
 window.addEventListener('apex:languagechange',onLanguage);refresh();
 return {refresh,destroy(){stopped=true;live.disconnect();window.removeEventListener('apex:languagechange',onLanguage);}};
}
