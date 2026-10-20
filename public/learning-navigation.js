// Keep new questions visible below the floating site header without moving the
// reader while they choose an answer or inspect an explanation.
function viewportFor(target){
  const doc=target?.ownerDocument,win=doc?.defaultView;
  if(!win)return null;
  const height=win.visualViewport?.height||win.innerHeight||doc.documentElement?.clientHeight||0;
  const header=doc.querySelector('.site-header'),bounds=header?.getBoundingClientRect?.();
  const inset=bounds&&bounds.height>0&&bounds.top<48&&bounds.bottom<height/2?Math.max(16,bounds.bottom+16):16;
  const controls=doc.querySelector('.ac-player-bottom,.play-confirm,.play-feedback .play-actions,.community-mastery-actions')?.getBoundingClientRect?.();
  const bottomInset=controls&&controls.bottom>=height-1&&controls.top>height/2?Math.max(24,height-controls.top+16):24;
  return {win,height,inset,bottomInset};
}
function moveTo(target,{focus=false,feedback=false,behavior='smooth'}={}){
  if(!target)return false;
  if(focus)target.focus?.({preventScroll:true});
  const viewport=viewportFor(target),bounds=target.getBoundingClientRect?.();
  if(!viewport||!bounds||!viewport.height||!Number.isFinite(bounds.top))return false;
  const {win,height,inset,bottomInset}=viewport;
  // An explanation can be taller than the viewport. Showing its opening is
  // enough; do not drag the reader to the bottom of a long feedback panel.
  const visible=feedback?bounds.top>=inset&&bounds.top<=height-Math.max(96,bottomInset):bounds.top>=inset&&bounds.bottom<=height-bottomInset;
  if(visible)return false;
  const reduced=win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  win.scrollTo?.({top:Math.max(0,(win.scrollY||win.pageYOffset||0)+bounds.top-inset),behavior:reduced?'instant':behavior});
  return true;
}
export function focusLearningTarget(target,options={}){return moveTo(target,{...options,focus:true});}
export function revealLearningFeedback(target){return moveTo(target,{feedback:true});}
