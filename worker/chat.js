const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const maxBodyBytes=24000;

async function readBody(request){
  const declared=Number(request.headers.get('Content-Length'));
  if(Number.isFinite(declared)&&declared>maxBodyBytes)return null;
  if(!request.body)return '';
  const reader=request.body.getReader();
  const decoder=new TextDecoder();
  let bytes=0,text='';
  while(true){
    const {done,value}=await reader.read();
    if(done)break;
    bytes+=value.byteLength;
    if(bytes>maxBodyBytes){await reader.cancel();return null;}
    text+=decoder.decode(value,{stream:true});
  }
  return text+decoder.decode();
}

function validate(body){
  if(!body||!Array.isArray(body.messages)||body.messages.length<1||body.messages.length>12)return null;
  if(typeof body.context!=='string'||body.context.length>6000)return null;
  const messages=body.messages.map(message=>{
    if(!message||!['user','assistant'].includes(message.role)||typeof message.content!=='string')return null;
    const content=message.content.trim();
    if(!content||content.length>1200)return null;
    return{role:message.role,content};
  });
  if(messages.some(message=>!message)||messages[messages.length-1].role!=='user')return null;
  return{messages,context:body.context};
}

export async function chatRoute(request,env){
  if(request.method!=='POST')return json({error:'Method not allowed.'},405);
  if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Origin mismatch.'},403);
  if(request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase()!=='application/json')return json({error:'Content-Type must be application/json.'},415);
  const provider=env.OPENROUTER_API_KEY
    ?{key:env.OPENROUTER_API_KEY,url:'https://openrouter.ai/api/v1/chat/completions',model:env.OPENROUTER_MODEL||'openrouter/free',headers:{'HTTP-Referer':new URL(request.url).origin,'X-OpenRouter-Title':'APEX BMW Explorer'}}
    :env.OPENAI_API_KEY
      ?{key:env.OPENAI_API_KEY,url:'https://api.openai.com/v1/chat/completions',model:env.OPENAI_MODEL||'gpt-4o-mini',headers:{}}
      :null;
  if(!provider)return json({fallback:true});
  let text;
  try{text=await readBody(request);}catch(error){console.error('Could not read AI chat request',error?.message);return json({error:'Could not read your message. Please try again.'},400);}
  if(text===null)return json({error:'Your message is too large.'},413);
  let body;
  try{body=JSON.parse(text);}catch{return json({error:'Invalid JSON.'},400);}
  const input=validate(body);
  if(!input)return json({error:'Please send up to 12 valid chat messages and a catalog context under 6,000 characters.'},400);
  const system='You are APEX, a helpful BMW car guide built into an independent BMW explorer. Help users choose cars and explain BMW models, engineering, and ownership topics in a concise, friendly way. Use the supplied site catalog context for exact site-specific model details; do not invent specifications, prices, availability, or fitment. Say when a detail is not in the catalog and distinguish general knowledge from catalog facts. For buying questions, do not claim live listings or current prices. Answer in the language used by the latest user message.';
  const messages=[{role:'system',content:system+(input.context?'\n\nRelevant BMW catalog context:\n'+input.context:'')},...input.messages];
  let response;
  try{
    response=await fetch(provider.url,{
      method:'POST',
      headers:{'Authorization':'Bearer '+provider.key,'Content-Type':'application/json',...provider.headers},
      body:JSON.stringify({model:provider.model,messages,max_tokens:700,temperature:0.4}),
      signal:AbortSignal.timeout(30000)
    });
  }catch(error){
    console.error('AI provider request failed',error?.name||'network error');
    return json({error:'The AI assistant could not be reached. Please try again shortly.'},502);
  }
  if(!response.ok){
    console.error('AI provider returned an error',response.status);
    return json({error:response.status===429?'The AI assistant is busy. Please wait a moment and try again.':'The AI assistant could not complete that request. Please try again shortly.'},response.status===429?503:502);
  }
  let result;
  try{result=await response.json();}catch(error){
    console.error('AI provider returned invalid JSON',error?.message);
    return json({error:'The AI assistant returned an unreadable response. Please try again.'},502);
  }
  const reply=result?.choices?.[0]?.message?.content;
  if(typeof reply!=='string'||!reply.trim()){
    console.error('AI provider response did not contain a reply');
    return json({error:'The AI assistant returned an empty response. Please try again.'},502);
  }
  return json({reply:reply.trim()});
}
