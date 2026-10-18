const encoder = new TextEncoder();
const ITERATIONS = 600000;
const hex = value => [...new Uint8Array(value)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
const unhex = value => Uint8Array.from(value.match(/../g), byte=>parseInt(byte,16));

export function randomToken() {
  const bytes=crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export async function tokenHash(value) {return hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));}
export function timingSafeEqual(left,right) {
  if(typeof left!=='string'||typeof right!=='string')return false;
  let difference=left.length^right.length;
  const length=Math.max(left.length,right.length);
  for(let index=0;index<length;index++)difference|=(left.charCodeAt(index)||0)^(right.charCodeAt(index)||0);
  return difference===0;
}
async function derive(password,salt,iterations=ITERATIONS) {
  const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:unhex(salt),iterations},key,256));
}
export async function hashPassword(password) {
  const salt=hex(crypto.getRandomValues(new Uint8Array(16)));
  return `pbkdf2-sha256$${ITERATIONS}$${salt}$${await derive(password,salt)}`;
}
export async function verifyPassword(password,record) {
  const match=typeof record==='string'&&/^pbkdf2-sha256\$(600000)\$([a-f0-9]{32})\$([a-f0-9]{64})$/.exec(record);
  // Unknown accounts still pay the full derivation cost, with no account lookup hint.
  const salt=match?match[2]:'0'.repeat(32),expected=match?match[3]:'0'.repeat(64);
  const derived=await derive(password,salt);
  return timingSafeEqual(derived,expected)&&Boolean(match);
}
