import {AUTH_PATHS} from './api.js';
import {createVercelHandler} from './vercel-api.js';

const json404=()=>Response.json({error:'Not found.'},{status:404,headers:{'Cache-Control':'no-store'}});
const supported=pathname=>pathname==='/api/ask'||AUTH_PATHS.has(pathname)&&/^\/api\/(?:admin|community|membership|collector)(?:\/|$)/.test(pathname);

// A flat function plus explicit rewrites works without a framework catch-all.
// Only supported routes are reconstructed; query values never select an origin.
export function createRoutedVercelHandler(options={}){
  const handle=createVercelHandler(options);
  return request=>{
    const url=new URL(request.url);
    if(url.pathname==='/api/router'){
      const routes=url.searchParams.getAll('__apex_route');
      if(routes.length!==1||!/^(?:ask|admin|community|membership|collector)(?:\/[a-z-]+)*\/?$/.test(routes[0]))return json404();
      const pathname='/api/'+routes[0].replace(/\/$/,'');
      if(!supported(pathname))return json404();
      url.pathname=pathname;
    }else if(!supported(url.pathname))return json404();
    url.searchParams.delete('__apex_route');
    return handle(new Request(url,request));
  };
}

export default {fetch:createRoutedVercelHandler()};
