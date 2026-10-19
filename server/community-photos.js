const MAX_BYTES=200*1024;
const fail=()=>{throw new Error('Use a valid JPEG or WebP photo, 160–2400 pixels wide, at most 4 megapixels and 200 KB.');};
const u16=(b,i)=>(b[i]<<8)|b[i+1];
const le32=(b,i)=>(b[i]|b[i+1]<<8|b[i+2]<<16|b[i+3]<<24)>>>0;
const ascii=(b,i,n)=>String.fromCharCode(...b.slice(i,i+n));
export function encodePhotoBytes(bytes){let value='';for(let offset=0;offset<bytes.length;offset+=8192)value+=String.fromCharCode(...bytes.subarray(offset,offset+8192));return btoa(value);}
export function decodePhotoBytes(data){return Uint8Array.from(atob(data),c=>c.charCodeAt(0));}
// Parse raster headers ourselves so this remains usable in Worker, Node and
// serverless runtimes. Strip metadata; reject animation, SVG and MIME spoofing.
export function validateCommunityPhoto(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['data','caption'].includes(k))||typeof value.data!=='string'||value.data.length>MAX_BYTES*1.38+100||typeof (value.caption??'')!=='string'||(value.caption??'').length>150||/[\u0000-\u001f\u007f]/.test(value.caption??''))fail();
 const match=/^data:(image\/(?:jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(value.data);if(!match||match[2].length%4)fail();
 let bytes;try{bytes=decodePhotoBytes(match[2]);}catch{fail();}if(!bytes||bytes.length<30||bytes.length>MAX_BYTES)fail();
 let width=0,height=0,clean=bytes;
 if(match[1]==='image/jpeg'){
  if(bytes[0]!==255||bytes[1]!==216||bytes.at(-2)!==255||bytes.at(-1)!==217)fail();
  const chunks=[bytes.slice(0,2)];let i=2,scan=false,ended=false;
  while(i<bytes.length){
   if(bytes[i]!==255)fail();const start=i;while(bytes[i]===255)i++;const marker=bytes[i++];
   if(marker===217){chunks.push(bytes.slice(start,i));ended=true;if(i!==bytes.length)fail();break;}if(marker===0||marker===216||marker>=208&&marker<=215)fail();
   if(i+2>bytes.length)fail();const length=u16(bytes,i);if(length<2||i+length>bytes.length)fail();
   if([192,193,194].includes(marker)){if(length<8)fail();height=u16(bytes,i+3);width=u16(bytes,i+5);}
   if(marker===218){
    if(!width||!height)fail();scan=true;let cursor=i+length,next=-1;
    // Entropy-coded scan data escapes literal FF as FF00; restart markers may
    // also occur inside a scan. Resume segment parsing at every other marker,
    // including progressive scans, so metadata between scans is removed too.
    while(cursor<bytes.length){if(bytes[cursor]!==255){cursor++;continue;}const boundary=cursor;while(bytes[cursor]===255)cursor++;if(cursor>=bytes.length)fail();const code=bytes[cursor];if(code===0||code>=208&&code<=215){cursor++;continue;}next=boundary;break;}
    if(next<0)fail();chunks.push(bytes.slice(start,next));i=next;continue;
   }
   if(!(marker>=225&&marker<=239)&&marker!==254)chunks.push(bytes.slice(start,i+length));i+=length;
  }
  if(!scan||!ended)fail();const size=chunks.reduce((n,b)=>n+b.length,0);clean=new Uint8Array(size);let at=0;for(const b of chunks){clean.set(b,at);at+=b.length;}
 }else{
  if(ascii(bytes,0,4)!=='RIFF'||ascii(bytes,8,4)!=='WEBP'||le32(bytes,4)+8!==bytes.length)fail();
  const chunks=[];let i=12,frames=0;
  while(i<bytes.length){if(i+8>bytes.length)fail();const type=ascii(bytes,i,4),length=le32(bytes,i+4),end=i+8+length+(length%2);if(end>bytes.length||length<1)fail();const b=i+8;
   if(type==='ANIM'||type==='ANMF')fail();
   if(type==='VP8 '){if(length<10||bytes[b+3]!==157||bytes[b+4]!==1||bytes[b+5]!==42)fail();width=(bytes[b+6]|bytes[b+7]<<8)&16383;height=(bytes[b+8]|bytes[b+9]<<8)&16383;frames++;chunks.push(bytes.slice(i,end));}
   else if(type==='VP8L'){if(length<5||bytes[b]!==47)fail();const bits=le32(bytes,b+1);width=(bits&16383)+1;height=((bits>>>14)&16383)+1;frames++;chunks.push(bytes.slice(i,end));}
   else if(type==='ALPH')chunks.push(bytes.slice(i,end));
   else if(type==='VP8X'){if(length!==10||bytes[b]&2)fail();const copy=bytes.slice(i,end);copy[8]&=16;chunks.push(copy);}
   else if(!['EXIF','XMP ','ICCP'].includes(type))fail();i=end;
  }
  if(frames!==1)fail();const size=12+chunks.reduce((n,b)=>n+b.length,0);clean=new Uint8Array(size);clean.set(bytes.slice(0,12));new DataView(clean.buffer).setUint32(4,size-8,true);let at=12;for(const b of chunks){clean.set(b,at);at+=b.length;}
 }
 if(width<160||height<100||width>2400||height>2400||width*height>4000000||width/height>4||height/width>4)fail();
 return {mime:match[1],data:encodePhotoBytes(clean),width,height,caption:(value.caption??'').trim()};
}
