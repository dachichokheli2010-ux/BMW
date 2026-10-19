import {canonicalPageURL} from './routes.js';
const canonical = canonicalPageURL(location.href);
if (canonical !== location.pathname + location.search + location.hash) history.replaceState(history.state, '', canonical);
document.documentElement.dataset.route = location.pathname.slice(1) || 'home';

// Keep a failed optional profile photograph from leaving a broken-image icon.
// Main galleries and game photographs have their own interaction-aware recovery.
document.addEventListener('error',event=>{
  const image=event.target;
  if(!image.matches?.('.profile-photo-slot img')||image.dataset.fallbackApplied)return;
  image.dataset.fallbackApplied='true';image.removeAttribute('srcset');image.removeAttribute('sizes');
  image.style.backgroundImage='none';image.src='/images/photo-unavailable.svg';image.alt='Photo unavailable. The original source is linked below.';
},{capture:true});

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
