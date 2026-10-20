export function accountDestination(user, returnTo = '') {
  if (!user) return '';
  if (typeof returnTo !== 'string' || !returnTo.startsWith('/') || returnTo.startsWith('//') || /[\\\u0000-\u0020]/.test(returnTo)) return '';
  try {
    const url = new URL(returnTo, 'https://apex.invalid');
    const pathname = decodeURIComponent(url.pathname).replace(/^\/+/, '/');
    if (url.origin !== 'https://apex.invalid' || /^\/admin(?:\.html)?(?:\/|$)/i.test(pathname) || /^\/(?:account|api|signin-with-chatgpt|signout-with-chatgpt)(?:\/|$)/.test(pathname)) return '';
    return url.pathname + url.search + url.hash;
  } catch { return ''; }
}

export function nativeAccountPath(value, kind, {origin, returnTo=''} = {}) {
  const path='/'+kind+'-with-chatgpt';
  let url;
  try{url=new URL(value,origin);if(url.origin!==origin||url.pathname!==path)throw new Error();}catch{url=new URL(path,origin);}
  if(kind==='signin'){
    const target=new URL('/account',origin);target.searchParams.set('after_signin','1');
    const destination=accountDestination({},returnTo);if(destination)target.searchParams.set('return_to',destination);
    url.searchParams.set('return_to',target.pathname+target.search);
  }else if(!url.searchParams.has('return_to'))url.searchParams.set('return_to','/account');
  return url.pathname+url.search;
}
