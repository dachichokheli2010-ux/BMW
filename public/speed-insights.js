const localHosts=new Set(['localhost','127.0.0.1','[::1]']);
if(!localHosts.has(location.hostname)&&!document.head.querySelector('script[data-vercel-speed-insights]')){
  window.si=window.si||function(...params){window.siq=window.siq||[];window.siq.push(params);};
  const script=document.createElement('script');
  script.src='/_vercel/speed-insights/script.js';
  script.defer=true;
  script.dataset.vercelSpeedInsights='';
  script.dataset.sdkn='@vercel/speed-insights';
  script.dataset.sdkv='2.0.0';
  const updateRoute=()=>{script.dataset.route=location.pathname;};
  updateRoute();
  for(const event of ['popstate','apex:modelselected','apex:collection','apex:routechange'])window.addEventListener(event,updateRoute);
  document.head.appendChild(script);
}
