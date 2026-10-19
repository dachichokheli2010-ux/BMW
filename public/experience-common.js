import {account} from './account-sync.js';

export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function loadStyle(file){const href=new URL(file,import.meta.url).href;if(![...document.querySelectorAll('link[rel="stylesheet"]')].some(node=>node.href===href)){const link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.append(link);}}
export function scopedKey(name){return `apex-${name}-v1:${account.getSnapshot?.().user?.id||'guest'}`;}
export function readJSON(key,fallback){try{const value=localStorage.getItem(key);return value&&value.length<1024*1024?JSON.parse(value):fallback;}catch{return fallback;}}
export function saveJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new CustomEvent('apex:localchange',{detail:{key}}));return true;}catch{return false;}}
export const carLink=id=>'/cars/'+encodeURIComponent(id);
export function modelYear(model){return model.verified?.modelYear||model.profile?.context?.modelYear||Number(String(model.market||'').match(/\b(?:19|20)\d{2}\b/)?.[0])||null;}
export function downloadFile(text,name,type='application/json'){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
