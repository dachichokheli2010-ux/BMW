// Shared route definitions for the local preview and the hosted Worker.
export const pageRoutes = Object.freeze({
  '/': 'index.html', '/models': 'index.html', '/learn': 'index.html',
  '/compare': 'index.html', '/engine-lab': 'index.html',
  '/generation-guides': 'index.html',
  '/tuning-garage': 'index.html', '/my-garage': 'index.html',
  '/photos': 'index.html', '/account': 'index.html', '/login': 'index.html', '/signup': 'index.html',
  '/cars': 'index.html', '/engines': 'index.html', '/play': 'index.html', '/start': 'index.html',
  '/glossary': 'index.html', '/badges': 'index.html',
  '/community':'index.html', '/friends':'index.html', '/submit-car':'index.html', '/admin':'admin.html',
  '/parts': 'parts.html', '/electric': 'electric.html', '/about': 'about.html',
});

export const workspaceRoutes = Object.freeze({
  'engine-lab': '/engine-lab', 'tuning-garage': '/tuning-garage', academy: '/learn',
});

export function resolvePage(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (/^\/(?:cars|engines)\/[a-z0-9][a-z0-9-]{0,99}$/.test(clean)) return 'index.html';
  if (/^\/garage\/[A-Za-z0-9_-]{1,100}$/.test(clean)||/^\/community\/cars\/[A-Za-z0-9_-]{1,100}$/.test(clean)) return 'index.html';
  if (/^\/(?:glossary|badges|questions|lessons)\/[a-z0-9][a-z0-9-]{0,149}$/.test(clean)) return 'index.html';
  if (/^\/parts\/[a-z0-9][a-z0-9-]{0,99}$/.test(clean)) return 'parts.html';
  return pageRoutes[clean] || null;
}

export function canonicalPageURL(input) {
  const url = new URL(input, 'http://localhost');
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  if (url.pathname === '/login' || url.pathname === '/signup') {
    if (url.pathname === '/signup') url.searchParams.set('mode','signup');
    url.pathname = '/account';
  }
  if (url.pathname === '/' || url.pathname === '/index.html') {
    const legacy = workspaceRoutes[url.hash.slice(1)];
    if (legacy) { url.pathname = legacy; url.hash = ''; }
    else if (url.searchParams.has('compare')) { url.pathname = '/compare'; url.hash = ''; }
    else if (url.hash === '#collection' || ['collection','q','pick','series','fuel','era','body','engine','chassis','year','power','model'].some(key => url.searchParams.has(key))) {
      url.pathname = '/models';
      if (url.hash === '#collection') url.hash = '';
    }
    else if (url.pathname === '/index.html') url.pathname = '/';
  }
  return url.pathname + url.search + url.hash;
}
