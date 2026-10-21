// One prerequisite policy for the road, search/topic links, glossary and drafts.
// Completed lessons remain replayable, including progress imported from older
// versions of the Academy. Optional activities do not belong to a chapter.
export function lessonAccess(id,{units=[],completed={},kind='lesson'}={}){
  const unit=units.find(chapter=>chapter.lessons.includes(id));
  if(kind==='daily'||kind==='review'||!unit)return {allowed:true,unit:unit||null,prerequisiteId:null,remaining:0};
  if(completed[id])return {allowed:true,unit,prerequisiteId:null,remaining:0};
  const prerequisites=unit.lessons.slice(0,unit.lessons.indexOf(id)).filter(key=>!completed[key]);
  return {allowed:prerequisites.length===0,unit,prerequisiteId:prerequisites[0]||null,remaining:prerequisites.length};
}
