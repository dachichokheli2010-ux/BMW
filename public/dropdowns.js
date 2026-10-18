const clean=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let sequence=0;

// Keep the native controls as the source of truth for the existing application.
export function mountDropdowns(root=document){
  const instances=new Map(),events=new AbortController();let current=null,scanQueued=false,refreshQueued=false;
  // Touch devices use the OS picker: no keyboard popup, clipped menus or scroll jumps.
  const nativePicker=matchMedia('(max-width:760px), (pointer:coarse)');
  const popup=document.createElement('div');popup.className='apex-select-popup';popup.setAttribute('popover','manual');
  popup.innerHTML='<div class="asp-heading"><span></span><button type="button" aria-label="Close options">×</button></div><div class="asp-search-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg><input type="search" placeholder="Find an option…" autocomplete="off" aria-label="Search options"></div><div class="asp-options" role="listbox"></div><p class="asp-empty" hidden>No matching options. Try a shorter search.</p><div class="asp-footer"><span></span><span>↑ ↓ navigate · Enter select</span></div>';
  document.body.append(popup);const input=popup.querySelector('input'),list=popup.querySelector('[role=listbox]'),menuId='apex-select-options-'+(++sequence);list.id=menuId;input.setAttribute('aria-controls',menuId);let visible=[],active=-1;
  function labelFor(select){return select.getAttribute('aria-label')||[...select.labels||[]].map(l=>l.childNodes.length?[...l.childNodes].filter(n=>n.nodeType===3||n.nodeType===1&&!n.contains(select)).map(n=>n.textContent).join(' '):l.textContent).join(' ').trim()||'Choose an option';}
  function sync(instance){
    const {select,button,text,wrapper}=instance,option=select.selectedOptions[0];
    text.textContent=select.id==='language-select'?String(option?.value||'en').toUpperCase():option?.textContent.trim()||'Choose an option';
    button.disabled=select.disabled;button.title=option?.textContent.trim()||'';button.setAttribute('aria-label',labelFor(select)+': '+(option?.textContent.trim()||'Choose an option'));
    wrapper.classList.toggle('is-disabled',select.disabled);wrapper.dataset.kind=select.id==='language-select'?'language':'default';
    wrapper.classList.toggle('uses-native-picker',nativePicker.matches);
    button.hidden=nativePicker.matches;
    if(nativePicker.matches){
      if(instance.tabindex===null)select.removeAttribute('tabindex');else select.setAttribute('tabindex',instance.tabindex);
      if(instance.ariaHidden===null)select.removeAttribute('aria-hidden');else select.setAttribute('aria-hidden',instance.ariaHidden);
    }else{select.setAttribute('tabindex','-1');select.setAttribute('aria-hidden','true');}
    if(current===instance)render(false);
  }
  function scan(){
    scanQueued=false;
    for(const [select,instance] of instances)if(!select.isConnected){instance.observer.disconnect();instances.delete(select);if(current===instance)close(false);}
    for(const select of root.querySelectorAll('select:not([multiple]):not([data-native-select])')){
      if(instances.has(select))continue;
      const wrapper=document.createElement('div');wrapper.className='apex-select';
      const button=document.createElement('button');button.type='button';button.className='apex-select-trigger';button.setAttribute('role','combobox');button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');
      button.innerHTML='<span class="ast-text"></span><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
      select.before(wrapper);wrapper.append(select,button);
      const instance={select,wrapper,button,text:button.querySelector('.ast-text'),tabindex:select.getAttribute('tabindex'),ariaHidden:select.getAttribute('aria-hidden'),id:'apex-options-'+(++sequence)};
      instances.set(select,instance);select.setAttribute('tabindex','-1');select.setAttribute('aria-hidden','true');
      button.setAttribute('aria-controls',menuId);
      button.addEventListener('click',e=>{e.preventDefault();if(current===instance)close();else open(instance,false);},{signal:events.signal});
      button.addEventListener('keydown',e=>{
        if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();if(current!==instance)open(instance,false);navigate(e.key);}
        else if(e.key===' '&&current===instance){e.preventDefault();if(active>=0)choose(visible[active].index);}
        else if(e.key==='Escape'&&current===instance){e.preventDefault();e.stopPropagation();close();}
        else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&e.key!==' '){e.preventDefault();if(current!==instance)open(instance,true);input.value+=e.key;input.focus();render();}
      },{signal:events.signal});
      select.addEventListener('focus',()=>{if(!nativePicker.matches)button.focus({preventScroll:true});},{signal:events.signal});
      const observer=new MutationObserver(()=>sync(instance));instance.observer=observer;observer.observe(select,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['disabled','label','selected','hidden','value','aria-label']});
      sync(instance);
    }
  }
  function queueScan(){if(!scanQueued){scanQueued=true;queueMicrotask(scan);}}
  function refresh(){if(!refreshQueued){refreshQueued=true;requestAnimationFrame(()=>{refreshQueued=false;for(const instance of instances.values())sync(instance);});}}
  function position(){
    if(!current)return;const r=current.button.getBoundingClientRect(),margin=10,width=Math.min(Math.max(r.width,290),innerWidth-margin*2),below=innerHeight-r.bottom-12,above=r.top-12;
    const up=below<Math.min(380,current.select.options.length*44+125)&&above>below,height=Math.min(430,Math.max(180,up?above:below));
    popup.style.width=width+'px';popup.style.maxHeight=height+'px';popup.style.left=Math.max(margin,Math.min(r.left,innerWidth-width-margin))+'px';
    popup.style.top=up?'auto':Math.max(margin,r.bottom+7)+'px';popup.style.bottom=up?Math.max(margin,innerHeight-r.top+7)+'px':'auto';popup.dataset.side=up?'above':'below';
    list.style.maxHeight=Math.max(80,height-145)+'px';
  }
  function open(instance,search=false){
    if(instance.select.disabled||nativePicker.matches)return;close(false);current=instance;instance.button.setAttribute('aria-expanded','true');instance.wrapper.classList.add('is-open');
    const parent=instance.button.closest('dialog[open]')||document.body;if(popup.parentElement!==parent)parent.append(popup);
    input.value='';active=-1;popup.querySelector('.asp-heading>span').textContent=labelFor(instance.select);list.setAttribute('aria-label',labelFor(instance.select));
    popup.querySelector('.asp-search-wrap').hidden=instance.select.options.length<8;
    render();
    if(popup.showPopover)popup.showPopover();else popup.classList.add('is-visible');position();
    if(search)input.focus({preventScroll:true});else instance.button.focus({preventScroll:true});
    list.querySelector('[aria-selected=true]')?.scrollIntoView({block:'nearest'});
  }
  function close(focus=true){
    if(!current)return;const previous=current;current=null;previous.button.setAttribute('aria-expanded','false');previous.button.removeAttribute('aria-activedescendant');previous.wrapper.classList.remove('is-open');input.removeAttribute('aria-activedescendant');
    if(popup.hidePopover&&popup.matches(':popover-open'))popup.hidePopover();popup.classList.remove('is-visible');if(focus&&previous.button.isConnected)previous.button.focus({preventScroll:true});
  }
  function setActive(index){
    active=index;list.querySelectorAll('[role=option]').forEach((button,i)=>{button.classList.toggle('is-active',i===index);if(i===index){current?.button.setAttribute('aria-activedescendant',button.id);input.setAttribute('aria-activedescendant',button.id);button.scrollIntoView({block:'nearest'});}});
  }
  function render(reset=true){
    if(!current)return;const select=current.select,terms=clean(input.value).split(/\s+/).filter(Boolean),previous=visible[active]?.index;
    visible=[...select.options].map((option,index)=>({option,index})).filter(({option})=>!option.hidden&&!option.disabled&&!option.closest('optgroup')?.disabled&&terms.every(term=>clean(option.textContent).includes(term)));
    list.replaceChildren();let previousGroup='';
    for(const {option,index} of visible){const group=option.closest('optgroup')?.label||'';if(group&&group!==previousGroup){const heading=document.createElement('div');heading.className='asp-group';heading.textContent=group;list.append(heading);}previousGroup=group;
      const button=document.createElement('button');button.type='button';button.tabIndex=-1;button.className='asp-option';button.setAttribute('role','option');button.setAttribute('aria-selected',String(index===select.selectedIndex));button.id=current.id+'-'+index;button.dataset.index=index;
      const label=document.createElement('span');label.textContent=option.textContent.trim();button.append(label);const check=document.createElement('span');check.className='asp-check';check.textContent='✓';check.setAttribute('aria-hidden','true');button.append(check);list.append(button);
    }
    popup.querySelector('.asp-empty').hidden=visible.length>0;popup.querySelector('.asp-footer>span').textContent=visible.length+' option'+(visible.length===1?'':'s');
    active=reset?visible.findIndex(x=>x.index===select.selectedIndex):visible.findIndex(x=>x.index===previous);if(active<0&&visible.length)active=0;setActive(active);position();
  }
  function navigate(key){if(!current||!visible.length)return;setActive(key==='Home'?0:key==='End'?visible.length-1:Math.max(0,Math.min(visible.length-1,active+(key==='ArrowDown'?1:-1))));}
  function choose(index){if(!current)return;const {select}=current;if(select.options[index]?.disabled)return;select.selectedIndex=index;select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));close();refresh();}
  list.addEventListener('click',e=>{const option=e.target.closest('[data-index]');if(option)choose(+option.dataset.index);});
  input.addEventListener('input',()=>render());
  popup.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();navigate(e.key);}else if(e.key==='Enter'){e.preventDefault();if(active>=0)choose(visible[active].index);}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}else if(e.key==='Tab')close(false);});
  popup.querySelector('.asp-heading button').onclick=()=>close();
  document.addEventListener('pointerdown',e=>{if(current&&!popup.contains(e.target)&&!current.wrapper.contains(e.target))close(false);},{signal:events.signal});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&current){e.preventDefault();e.stopImmediatePropagation();close();}else if(e.key==='Enter'&&current&&e.target===current.button){e.preventDefault();if(active>=0)choose(visible[active].index);}else if(e.key==='Tab'&&current)close(false);},{signal:events.signal,capture:true});
  document.addEventListener('change',refresh,{signal:events.signal});document.addEventListener('click',refresh,{signal:events.signal});
  document.addEventListener('close',e=>{if(current&&e.target.contains?.(current.button))close(false);},{signal:events.signal,capture:true});
  for(const event of ['apex:modelselected','apex:collection','apex:languagechange','apex:garagechange','apex:controlschange'])window.addEventListener(event,refresh,{signal:events.signal});
  window.addEventListener('resize',()=>close(false),{signal:events.signal});window.addEventListener('scroll',e=>{if(current&&!popup.contains(e.target))position();},{signal:events.signal,capture:true,passive:true});
  nativePicker.addEventListener('change',()=>{close(false);refresh();},{signal:events.signal});
  const observer=new MutationObserver(records=>{if(records.some(record=>[...record.addedNodes,...record.removedNodes].some(node=>node.nodeType===1&&(node.matches('select,.apex-select')||node.querySelector('select')))))queueScan();});
  scan();observer.observe(root.body||root,{subtree:true,childList:true});
  return {refresh:()=>{scan();refresh();},close,destroy(){close(false);events.abort();observer.disconnect();for(const instance of instances.values()){instance.observer.disconnect();const {select,wrapper}=instance;if(instance.tabindex===null)select.removeAttribute('tabindex');else select.setAttribute('tabindex',instance.tabindex);if(instance.ariaHidden===null)select.removeAttribute('aria-hidden');else select.setAttribute('aria-hidden',instance.ariaHidden);if(wrapper.isConnected){wrapper.before(select);wrapper.remove();}}instances.clear();popup.remove();}};
}
