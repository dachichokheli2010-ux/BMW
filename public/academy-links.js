import {glossaryEntries,renderGlossaryTerm} from './academy-glossary.js';
import {translateText,getLanguage} from './preferences.js';
const escaped=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
// Keep full source sentences intact for language switching. Only their displayed
// text is split into touch/keyboard accessible definition buttons.
export function prepareGlossaryCopy(root,selector='.ac-player-body p'){
  for(const node of root.querySelectorAll(selector)){
    if(node.hasAttribute('data-ac-glossary-source'))continue;
    node.dataset.acGlossarySource=node.textContent;node.setAttribute('data-no-i18n','');
  }
}
export function localizeGlossaryCopy(root,{language=getLanguage()}={}){
  const aliases=new Map();
  for(const entry of glossaryEntries)for(const word of [...entry.aliases,entry.i18n.en.name,entry.i18n[language]?.name].filter(Boolean)){
    if(word.length>=3&&!aliases.has(word.toLocaleLowerCase()))aliases.set(word.toLocaleLowerCase(),entry.id);
  }
  const pattern=new RegExp('(^|[^\\p{L}\\p{N}_])('+[...aliases.keys()].sort((a,b)=>b.length-a.length).map(escaped).join('|')+')(?=$|[^\\p{L}\\p{N}_])','gimu');
  for(const node of root.querySelectorAll('[data-ac-glossary-source]')){
    const text=translateText(node.dataset.acGlossarySource),fragment=node.ownerDocument.createDocumentFragment(),seen=new Set();
    let start=0,match;pattern.lastIndex=0;
    while((match=pattern.exec(text))&&seen.size<5){
      const id=aliases.get(match[2].toLocaleLowerCase());if(seen.has(id))continue;
      const from=match.index+match[1].length,to=from+match[2].length;
      fragment.append(node.ownerDocument.createTextNode(text.slice(start,from)));
      const holder=node.ownerDocument.createElement('span');holder.innerHTML=renderGlossaryTerm(id,{language,label:match[2],className:'acg-inline'});
      fragment.append(...holder.childNodes);seen.add(id);start=to;
    }
    fragment.append(node.ownerDocument.createTextNode(text.slice(start)));node.replaceChildren(fragment);
  }
}
