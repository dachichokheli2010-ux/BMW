import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseHTML} from 'linkedom';

let count = 0, fixtureNumber = 0;
const check = (value, message) => { assert.ok(value, message); count++; };
async function fixture({osDark = false, saved = null, privateStorage = false} = {}) {
  const {window, document} = parseHTML('<html><head><meta name="theme-color"></head><body><button id="theme-toggle" type="button"></button><p>Models</p></body></html>');
  const values = new Map(saved === null ? [] : [['apex-theme', saved]]), queries = [], listeners = [];
  const storage = {
    getItem(key) { if (privateStorage) throw Error('Storage unavailable'); return values.get(key) ?? null; },
    setItem(key, value) { if (privateStorage) throw Error('Storage unavailable'); values.set(key, value); }
  };
  const media = {matches: osDark, addEventListener(_event, callback) { listeners.push(callback); }, addListener(callback) { listeners.push(callback); }};
  Object.assign(globalThis, {window, document, localStorage: storage, MutationObserver: window.MutationObserver, CustomEvent: window.CustomEvent,
    matchMedia: query => { queries.push(query); return query.includes('color-scheme') ? media : {matches: true}; }});
  const preferences = await import('../public/preferences.js?theme-check=' + (++fixtureNumber));
  const button = document.getElementById('theme-toggle');
  const click = shiftKey => { const event = new window.Event('click', {bubbles: true}); event.shiftKey = Boolean(shiftKey); button.dispatchEvent(event); };
  const changeDeviceTheme = () => { media.matches = !media.matches; for (const listener of listeners) listener(); };
  return {window, document, values, queries, listeners, preferences, button, click, changeDeviceTheme};
}

for (const osDark of [true, false]) {
  for (const saved of [null, 'system', 'invalid', '', 'dark', 'light']) {
    const f = await fixture({osDark, saved}), expected = saved === 'light' ? 'light' : 'dark';
    check(f.preferences.getTheme() === expected && f.document.documentElement.dataset.theme === expected, 'Only an explicit saved Light preference selects light; all legacy/default cases select dark.');
    check(f.values.get('apex-theme') === expected, 'Legacy, missing and invalid preferences are saved as a stable dark preference.');
    check(!f.queries.some(query => query.includes('color-scheme')) && f.listeners.length === 0, 'Appearance does not read or subscribe to the device color scheme.');
    f.changeDeviceTheme();
    check(f.preferences.getTheme() === expected && f.document.documentElement.dataset.theme === expected, 'Changing device appearance cannot alter the selected theme.');
    const icon = f.button.querySelector('.theme-orbit');
    f.click();
    const opposite = expected === 'dark' ? 'light' : 'dark';
    check(f.preferences.getTheme() === opposite && f.document.documentElement.dataset.theme === opposite, 'A normal click visibly switches between Light and Dark.');
    check(f.values.get('apex-theme') === opposite && f.button.getAttribute('aria-pressed') === String(opposite === 'dark'), 'Persistence and pressed state match the visible appearance.');
    f.click(true);
    check(f.preferences.getTheme() === expected && f.document.documentElement.dataset.theme === expected, 'Shift-click is an ordinary toggle and cannot enter a third mode.');
    check(f.button.querySelector('.theme-orbit') === icon, 'Theme changes keep the mounted icon for sun/crescent animation.');
    check(!/system|device|shift/i.test(f.button.title + ' ' + f.button.getAttribute('aria-label')) && !f.button.hasAttribute('aria-description'), 'Theme UI contains no removed mode or shortcut.');
  }
}

{
  const f = await fixture({saved: 'dark'});
  for (let index = 0; index < 11; index++) f.click();
  check(f.document.documentElement.dataset.theme === 'light' && f.preferences.getTheme() === 'light', 'Rapid repeated clicks keep persisted and visible themes in agreement.');
  for (const invalid of ['system', 'not-a-theme', null]) f.preferences.setTheme(invalid);
  check(f.document.documentElement.dataset.theme === 'light' && f.preferences.getTheme() === 'light', 'The public setter rejects removed and invalid modes.');
  f.preferences.setLanguage('ka');
  check(f.button.getAttribute('aria-label').includes('მუქ'), 'Theme action is translated into Georgian.');
  f.preferences.setLanguage('ru');
  check(f.button.getAttribute('aria-label').includes('тёмную'), 'Theme action is translated into Russian.');
  f.preferences.setLanguage('en');
  for (const [value, expected] of [['dark', 'dark'], ['light', 'light'], ['system', 'dark'], ['invalid', 'dark'], [null, 'dark']]) {
    const event = new f.window.Event('storage'); event.key = 'apex-theme'; event.newValue = value; f.window.dispatchEvent(event);
    check(f.document.documentElement.dataset.theme === expected && f.preferences.getTheme() === expected, 'Cross-tab changes accept Light/Dark and normalize old, removed or invalid preferences to Dark.');
  }
  check(f.document.querySelector('meta[name="theme-color"]').content === '#10151c', 'Browser chrome follows the dark palette.');
  const menu = f.document.createElement('div'); menu.setAttribute('data-menu-theme', ''); f.document.body.append(menu); menu.append(f.button);
  await new Promise(resolve => setImmediate(resolve));
  check(menu.querySelectorAll('button').length === 1 && !menu.querySelector('[data-use-system-theme]'), 'The mobile appearance section contains only the Light/Dark toggle.');
  f.click(true);
  check(f.preferences.getTheme() === 'light', 'The relocated toggle also treats Shift-click as an ordinary Light/Dark toggle.');
  const clear = new f.window.Event('storage'); clear.key = null; f.window.dispatchEvent(clear);
  check(f.preferences.getTheme() === 'dark', 'Clearing preferences restores the stable Dark default.');
}

{
  const f = await fixture({privateStorage: true, osDark: false});
  check(f.preferences.getTheme() === 'dark', 'Blocked storage defaults to Dark independently of the device.');
  f.click();
  check(f.document.documentElement.dataset.theme === 'light', 'Theme toggles work when storage is blocked.');
  f.click(true);
  check(f.document.documentElement.dataset.theme === 'dark', 'Storage failure and modifier keys cannot introduce a third appearance.');
}

const publicPath = new URL('../public/', import.meta.url);
for (const name of fs.readdirSync(publicPath).filter(name => name.endsWith('.html'))) {
  const html = fs.readFileSync(new URL(name, publicPath), 'utf8');
  if (!html.includes('apex-theme')) continue;
  const bootstrap = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]).find(source => source.includes('apex-theme'));
  check(Boolean(bootstrap), name + ' has an initial appearance bootstrap.');
  for (const saved of [null, 'system', 'invalid', 'light', 'dark']) {
    const document = {documentElement: {dataset: {}}}; let deviceReads = 0;
    vm.runInNewContext(bootstrap, {document, location: new URL('https://motron.test/models'), localStorage: {getItem: key => key === 'apex-theme' ? saved : 'en'}, matchMedia() { deviceReads++; throw Error('Device appearance must not be read.'); }});
    check(document.documentElement.dataset.theme === (saved === 'light' ? 'light' : 'dark') && deviceReads === 0, name + ' paints a stable Light/Dark appearance before styles load.');
  }
  const document = {documentElement: {dataset: {}}};
  vm.runInNewContext(bootstrap, {document, location: new URL('https://motron.test/'), localStorage: {getItem() { throw Error('Storage unavailable'); }}});
  check(document.documentElement.dataset.theme === 'dark', name + ' defaults to Dark before first paint when storage is blocked.');
}

console.log(`Theme polish: ${count} checks passed (Light/Dark only, legacy migration, device independence, modifier keys, initial paint, translations, cross-tab sync and blocked storage).`);
