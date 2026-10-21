import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';

let count = 0, fixtureNumber = 0;
const check = (value, message) => { assert.ok(value, message); count++; };
async function fixture({dark = false, saved = null, privateStorage = false} = {}) {
  const {window, document} = parseHTML('<html><head><meta name="theme-color"></head><body><button id="theme-toggle" type="button"></button><p>Models</p></body></html>');
  const values = new Map(saved ? [['apex-theme', saved]] : []), listeners = new Map();
  const storage = {
    getItem(key) { if (privateStorage) throw Error('Storage unavailable'); return values.get(key) ?? null; },
    setItem(key, value) { if (privateStorage) throw Error('Storage unavailable'); values.set(key, value); }
  };
  const media = {matches: dark, addEventListener(_event, callback) { listeners.set('change', callback); }};
  Object.assign(globalThis, {window, document, localStorage: storage, MutationObserver: window.MutationObserver, CustomEvent: window.CustomEvent,
    matchMedia: query => query.includes('color-scheme') ? media : {matches: true}});
  const preferences = await import('../public/preferences.js?theme-check=' + (++fixtureNumber));
  const button = document.getElementById('theme-toggle');
  const click = shiftKey => { const event = new window.Event('click', {bubbles: true}); event.shiftKey = Boolean(shiftKey); button.dispatchEvent(event); };
  return {window, document, values, media, listeners, preferences, button, click};
}

for (const dark of [true, false]) {
  const f = await fixture({dark});
  check(f.preferences.getTheme() === 'system', 'Default follows device preferences.');
  check(f.document.documentElement.dataset.theme === (dark ? 'dark' : 'light'), 'System theme resolves to current device appearance.');
  const icon = f.button.querySelector('.theme-orbit');
  f.click();
  check(f.document.documentElement.dataset.theme === (dark ? 'light' : 'dark'), 'First click always visibly changes the current theme.');
  check(f.values.get('apex-theme') === (dark ? 'light' : 'dark'), 'Explicit appearance survives reloads.');
  f.click();
  check(f.document.documentElement.dataset.theme === (dark ? 'dark' : 'light'), 'Second click returns to previous appearance without a system-mode detour.');
  check(f.button.querySelector('.theme-orbit') === icon, 'Theme changes preserve the mounted icon for smooth animation.');
  check(f.button.getAttribute('aria-pressed') === String(dark), 'Pressed state describes the visible dark appearance.');
  f.click(true);
  check(f.preferences.getTheme() === 'system', 'Shift-click restores device-following appearance.');
  check(f.button.getAttribute('aria-description').includes('Shift-click'), 'Device-theme shortcut is accessible.');
  f.media.matches = !dark; f.listeners.get('change')();
  check(f.document.documentElement.dataset.theme === (!dark ? 'dark' : 'light'), 'System mode updates when the device appearance changes.');
}

{
  const f = await fixture({saved: 'dark'});
  for (let index = 0; index < 11; index++) f.click();
  check(f.document.documentElement.dataset.theme === 'light' && f.preferences.getTheme() === 'light', 'Rapid repeated clicks leave persisted and visible theme in agreement.');
  f.preferences.setTheme('not-a-theme');
  check(f.document.documentElement.dataset.theme === 'light', 'Unknown preferences cannot change appearance.');
  f.preferences.setLanguage('ka');
  check(f.button.getAttribute('aria-label').includes('მუქ'), 'Theme action is translated into Georgian.');
  f.preferences.setLanguage('ru');
  check(f.button.getAttribute('aria-label').includes('тёмную'), 'Theme action is translated into Russian.');
  f.preferences.setLanguage('en');
  const event = new f.window.Event('storage'); event.key = 'apex-theme'; event.newValue = 'dark'; f.window.dispatchEvent(event);
  check(f.document.documentElement.dataset.theme === 'dark', 'Appearance follows a saved change in another tab.');
  check(f.document.querySelector('meta[name="theme-color"]').content === '#10151c', 'Browser chrome follows the selected palette.');
  const menu = f.document.createElement('div'); menu.setAttribute('data-menu-theme', ''); f.document.body.append(menu); menu.append(f.button);
  await new Promise(resolve => setImmediate(resolve));
  const system = menu.querySelector('[data-use-system-theme]');
  check(system?.textContent === 'Use system theme', 'Moving Appearance into the mobile menu provides a visible device-theme choice.');
  system.click();
  check(f.preferences.getTheme() === 'system' && system.getAttribute('aria-pressed') === 'true', 'The mobile device-theme choice works and exposes selected state.');
}

{
  const f = await fixture({privateStorage: true, dark: true});
  f.click();
  check(f.document.documentElement.dataset.theme === 'light', 'Theme toggles still work when storage is blocked.');
  f.click();
  check(f.document.documentElement.dataset.theme === 'dark', 'Storage failure does not break later toggles.');
}

console.log(`Theme polish: ${count} functional checks passed (visible toggles, rapid clicks, device mode, translations, cross-tab sync and blocked storage).`);
