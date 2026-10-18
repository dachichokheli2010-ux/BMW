import {canonicalPageURL} from './routes.js';
const canonical = canonicalPageURL(location.href);
if (canonical !== location.pathname + location.search + location.hash) history.replaceState(history.state, '', canonical);
document.documentElement.dataset.route = location.pathname.slice(1) || 'home';

// Old bookmarks and in-content links still reach the matching dedicated page.
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link || link.hasAttribute('download')) return;
  const raw = link.getAttribute('href');
  const url = new URL(raw?.startsWith('#') ? raw : link.href, location.href);
  if (/^https?:$/.test(url.protocol) && url.origin === location.origin) link.href = canonicalPageURL(url.href);
}, {capture: true});
window.addEventListener('hashchange', () => {
  const target = canonicalPageURL(location.href);
  if (target !== location.pathname + location.search + location.hash) location.replace(target);
});
