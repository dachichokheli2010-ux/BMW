// Hosting dashboards receive literal strings, while .env readers remove quotes.
// Accept either representation without changing the credential itself.
export function environmentValue(value){
 if(typeof value!=='string')return null;
 let normalized=value.trim();
 if(normalized.length>=2&&['\"',"'"].includes(normalized[0])&&normalized.at(-1)===normalized[0])normalized=normalized.slice(1,-1).trim();
 return normalized||null;
}
