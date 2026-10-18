export function mountNavigation({openSearch}){
  const header=document.querySelector('.site-header'),tools=header.querySelector('.header-tools');
  const events=new AbortController(),signal=events.signal,mobile=matchMedia('(max-width:1100px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const button=document.createElement('button');
  button.type='button';button.className='mobile-menu-toggle icon-button';button.setAttribute('aria-label','Open navigation');button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');
  button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>';tools.append(button);
  const dialog=document.createElement('dialog');dialog.className='mobile-navigation';dialog.id='apex-mobile-navigation';dialog.setAttribute('aria-labelledby','mn-title');button.setAttribute('aria-controls',dialog.id);
  const arrow='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
  const groups=[['Discover',[['/','Home','Start your next discovery'],['/models','The collection','Find your BMW'],['/learn','Learn & Play','Lessons, puzzles & M challenges'],['/compare','Compare cars','Get into the details']]],['Explore deeper',[['/engine-lab','Engine lab','Understand what drives it'],['/tuning-garage','Tuning garage','Build your next idea'],['/parts','Inside BMW','Meet the components'],['/electric','Electric BMWs','Explore a different energy']]]];
  dialog.innerHTML=`<div class="mn-top"><a class="mn-wordmark" href="/" id="mn-title">APEX<span>DRIVEN BY CURIOSITY</span></a><button type="button" data-menu-close aria-label="Close navigation" autofocus><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div class="mn-scroll"><button class="mn-search" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><span>Search cars, parts & lessons</span>${arrow}</button>${groups.map(([title,links])=>`<section class="mn-group"><h2>${title}</h2><nav aria-label="${title}">${links.map(([href,title,description],i)=>`<a href="${href}" style="--mn-index:${i}" ${location.pathname===href?'aria-current="page"':''}><span>${title}<small>${description}</small></span>${arrow}</a>`).join('')}</nav></section>`).join('')}<div class="mn-personal"><a href="/my-garage"><span>My garage<small>Your cars & saved builds</small></span>${arrow}</a><a href="/account"><span>Your account<small>Profile, sign-in & sync</small></span>${arrow}</a></div><div class="mn-preferences"><div><label for="language-select">Language</label><div data-menu-language></div></div><div><span>Appearance</span><div data-menu-theme></div></div></div><div class="mn-bottom"><a href="/about">About APEX ↗</a><span>Independent BMW exploration.</span></div></div>`;
  document.body.append(dialog);
  const language=document.getElementById('language-select'),theme=document.getElementById('theme-toggle'),anchors=[];
  for(const control of [language,theme])if(control){const anchor=document.createComment('Header preference');control.before(anchor);anchors.push({control,anchor});}
  let closeTimer,closing,resolveClose,scrollY=0,priorTop='',touchStart=null;
  function preferences(){
    for(const {control,anchor} of anchors){const node=control.closest('.apex-select')||control;
      if(mobile.matches)dialog.querySelector(control===language?'[data-menu-language]':'[data-menu-theme]').append(node);
      else anchor.after(node);
    }
    if(!mobile.matches)close(true);
  }
  function cleanup(){
    clearTimeout(closeTimer);dialog.classList.remove('is-closing');button.setAttribute('aria-expanded','false');
    if(document.body.classList.contains('navigation-open')){document.body.classList.remove('navigation-open');document.body.style.top=priorTop;window.scrollTo({top:scrollY,behavior:'instant'});}
    resolveClose?.();resolveClose=null;closing=null;
  }
  function close(immediate=false){
    if(!dialog.open)return Promise.resolve();
    if(closing&&!immediate)return closing;
    if(immediate||reduced.matches){dialog.close();cleanup();return Promise.resolve();}
    dialog.classList.add('is-closing');closing=new Promise(resolve=>{resolveClose=resolve;});
    closeTimer=setTimeout(()=>{dialog.close();cleanup();},200);return closing;
  }
  function open(){
    if(dialog.open)return;
    scrollY=window.scrollY;priorTop=document.body.style.top;document.body.style.top=-scrollY+'px';document.body.classList.add('navigation-open');
    header.classList.remove('is-hidden');dialog.showModal();dialog.scrollTop=0;dialog.querySelector('.mn-scroll').scrollTop=0;button.setAttribute('aria-expanded','true');
  }
  button.addEventListener('click',open,{signal});
  dialog.addEventListener('cancel',event=>{event.preventDefault();void close();},{signal});
  dialog.addEventListener('close',cleanup,{signal});
  dialog.addEventListener('click',event=>{
    const rect=dialog.getBoundingClientRect();
    if(event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))void close();
    if(event.target.closest('[data-menu-close]'))void close();
    if(event.target.closest('a'))void close(true);
  },{signal});
  dialog.querySelector('.mn-search').addEventListener('click',async()=>{await close();openSearch();},{signal});
  dialog.querySelector('.mn-top').addEventListener('pointerdown',event=>{if(event.pointerType==='touch')touchStart={x:event.clientX,y:event.clientY};},{signal});
  dialog.querySelector('.mn-top').addEventListener('pointerup',event=>{if(touchStart&&event.clientX-touchStart.x>70&&Math.abs(event.clientY-touchStart.y)<45)void close();touchStart=null;},{signal});
  mobile.addEventListener('change',preferences);preferences();
  return {close,destroy(){close(true);events.abort();mobile.removeEventListener('change',preferences);for(const {control,anchor} of anchors){anchor.after(control.closest('.apex-select')||control);anchor.remove();}dialog.remove();button.remove();}};
}
