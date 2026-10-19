import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {hasTranslation, registerTranslations} from '../public/preferences.js';

// This check validates authored dictionaries. The optional inventory deliberately
// reports untranslated candidates separately: existing English content does not
// become translated merely because the dictionary parity check passes.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const locales = ['en', 'ka', 'ru'];
const normalize = value => String(value).trim().replace(/\s+/g, ' ');
const variables = value => [...String(value).matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
const relative = filename => path.relative(root, filename).split(path.sep).join('/');
const lineAt = (source, offset) => source.slice(0, offset).split('\n').length;

function filesIn(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    if (entry.isDirectory()) return ['vendor', '_candidates'].includes(entry.name) ? [] : filesIn(path.join(directory, entry.name));
    return /\.(?:js|mjs|html)$/.test(entry.name) ? [path.join(directory, entry.name)] : [];
  });
}

export function validateRows(rows, name) {
  const errors = [];
  if (!Array.isArray(rows)) return [`${name}: translation rows must be an array.`];
  rows.forEach((row, index) => {
    const label = `${name}[${index}]`;
    if (!Array.isArray(row)) { errors.push(`${label}: expected an EN/KA/RU row.`); return; }
    if (row.length !== 3) errors.push(`${label}: expected 3 locales, received ${row.length}.`);
    locales.forEach((locale, position) => {
      if (typeof row[position] !== 'string' || !row[position].trim()) errors.push(`${label}: missing or empty ${locale} for ${JSON.stringify(row[0])}.`);
      else if (position && typeof row[0] === 'string' && JSON.stringify(variables(row[position])) !== JSON.stringify(variables(row[0]))) errors.push(`${label}: ${locale} placeholders differ from English for ${JSON.stringify(row[0])}.`);
    });
  });
  return errors;
}

const flatten = (value, prefix = '', result = new Map()) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) flatten(child, prefix ? `${prefix}.${key}` : key, result);
  } else result.set(prefix, value);
  return result;
};

export function validateObjectDictionary(dictionary, name) {
  const errors = [];
  if (!dictionary?.en || typeof dictionary.en !== 'object') return [`${name}: English dictionary is missing.`];
  const english = flatten(dictionary.en);
  for (const locale of locales) {
    const target = flatten(dictionary[locale]);
    for (const [key, source] of english) {
      const value = target.get(key);
      if (typeof value !== 'string' || !value.trim()) errors.push(`${name}.${locale}.${key}: missing or empty translation.`);
      else if (JSON.stringify(variables(source)) !== JSON.stringify(variables(value))) errors.push(`${name}.${locale}.${key}: placeholders differ from English.`);
    }
  }
  return errors;
}

// Only quoted source literals and plain object/array initializers are evaluated.
// No application script or browser DOM is evaluated to extract a private table.
function quoteEnd(source, start) {
  const quote = source[start];
  for (let index = start + 1; index < source.length; index++) {
    if (source[index] === '\\') { index++; continue; }
    if (source[index] === quote) return index + 1;
  }
  return source.length;
}

function balancedEnd(source, start) {
  const stack = [source[start]], pairs = {'[': ']', '{': '}', '(': ')'};
  for (let index = start + 1; index < source.length; index++) {
    if ('\'"`'.includes(source[index])) { index = quoteEnd(source, index) - 1; continue; }
    if (source.startsWith('//', index)) { index = source.indexOf('\n', index); if (index < 0) return source.length; continue; }
    if (source.startsWith('/*', index)) { index = source.indexOf('*/', index + 2); if (index < 0) return source.length; index++; continue; }
    if (pairs[source[index]]) stack.push(source[index]);
    else if (source[index] === pairs[stack.at(-1)]) { stack.pop(); if (!stack.length) return index + 1; }
  }
  throw new Error(`Unterminated dictionary initializer at offset ${start}.`);
}

function literalValue(source) {
  return vm.runInNewContext(`(${source})`, Object.create(null), {timeout: 1000, contextCodeGeneration: {strings: false, wasm: false}});
}

async function dictionaries(files) {
  const rows = [], objects = [], errors = [], names = new Set(), arrayExports = new WeakSet();
  const addRows = (values, name) => {
    if (names.has(name) || Array.isArray(values) && arrayExports.has(values)) return;
    if (Array.isArray(values)) arrayExports.add(values);
    names.add(name); errors.push(...validateRows(values, name));
    if (Array.isArray(values)) for (const row of values) if (Array.isArray(row) && row.length === 3 && row.every(value => typeof value === 'string')) rows.push({source: name, en: row[0], ka: row[1], ru: row[2]});
  };
  for (const filename of files.filter(file => /\.(?:js|mjs)$/.test(file))) {
    const source = fs.readFileSync(filename, 'utf8'), name = relative(filename);
    if (name === 'public/preferences.js') {
      const match = /\bconst\s+copy\s*=\s*\[/.exec(source);
      if (!match) errors.push(`${name}: base English dictionary was not found.`);
      else {
        const start = match.index + match[0].lastIndexOf('[');
        try { addRows(literalValue(source.slice(start, balancedEnd(source, start))), `${name}:copy`); }
        catch (error) { errors.push(`${name}: cannot read base dictionary: ${error.message}`); }
      }
    }
    // Discover local locale objects, including the gallery's private copy table.
    for (const match of source.matchAll(/\b(?:const|let|var)\s+(\w+)\s*=\s*(?:Object\.freeze\(\s*)?\{\s*(?:en|['"]en['"])\s*:\s*\{/g)) {
      const start = match.index + match[0].indexOf('{'), label = `${name}:${match[1]}`;
      try {
        const dictionary = literalValue(source.slice(start, balancedEnd(source, start)));
        errors.push(...validateObjectDictionary(dictionary, label)); objects.push({source: label, dictionary});
      } catch (error) { errors.push(`${label}: cannot read locale dictionary; export it from a translations module: ${error.message}`); }
    }
    if (!/translations[^/]*\.(?:js|mjs)$/i.test(filename) && !/\bexport\s+(?:const|let|var)\s+\w*Translations?\b/i.test(source) && !/\bexport\s+const\s+glossaryEntries\b/.test(source)) continue;
    try {
      // Import complete modules so generated/assembled legacy and parts rows are
      // validated too. These modules already support the Node academy checks.
      const module = await import(pathToFileURL(filename).href);
      let exported = 0;
      for (const [key, value] of Object.entries(module)) {
        if (key === 'glossaryEntries' && Array.isArray(value)) {
          for (const entry of value) if (entry.i18n?.en) {
            const label = `${name}:glossaryEntries.${entry.id}.i18n`;
            errors.push(...validateObjectDictionary(entry.i18n, label)); objects.push({source: label, dictionary: entry.i18n});
          }
          exported++; continue;
        }
        if (!/translations?|translationEntries|locale|dictionary|copy|^default$/i.test(key)) continue;
        if (Array.isArray(value)) { addRows(value, `${name}:${key}`); exported++; }
        else if (value?.en && typeof value.en === 'object') { const label = `${name}:${key}`; errors.push(...validateObjectDictionary(value, label)); objects.push({source: label, dictionary: value}); exported++; }
      }
      for (const [key, value] of Object.entries(module)) if (/^register\w*Translations$/.test(key) && typeof value === 'function') value();
      if (!exported) errors.push(`${name}: no exported dictionary was found; export the complete rows for build-time checking.`);
    } catch (error) { errors.push(`${name}: cannot import translation module: ${error.message}`); }
  }
  const unique = new Map(), conflicts = [];
  for (const row of rows) {
    const previous = unique.get(normalize(row.en));
    if (previous && (previous.ka !== row.ka || previous.ru !== row.ru)) conflicts.push({english: row.en, first: previous.source, second: row.source, firstTranslation: {ka: previous.ka, ru: previous.ru}, secondTranslation: {ka: row.ka, ru: row.ru}});
    unique.set(normalize(row.en), row);
  }
  if (!errors.length) registerTranslations(rows.map(row => [row.en, row.ka, row.ru]));
  return {rows, objects, unique, conflicts, errors};
}

const english = value => /[A-Za-z]/.test(value);
const meaningful = value => {
  if (!english(value) || value.length > 12000) return false;
  if (/[\u0400-\u04ff\u10a0-\u10ff]/.test(value)) return false;
  if (/^(?:https?:|data:|\.\.?\/|\/[^ ]|#[\w-]+$)/.test(value)) return false;
  if (/^[\w./-]+\.(?:js|mjs|html|css|json|webp|jpe?g|png|svg|glb|woff2?)(?:\?.*)?$/i.test(value)) return false;
  if (/^(?:[a-z_$][\w$-]*|[A-Z_]+|--[\w-]+)$/.test(value)) return false;
  if (/^(?:\{value\d+\}|\s|[\d\W])+$/.test(value) || /^&[a-z#\d]+;$/.test(value)) return false;
  if (/^(?:[.#][\w-]+|\w+\[[\s\S]+\])$/.test(value) || /\\[pwsdb]/.test(value)) return false;
  if (/^\[[\w=\s"'-]+\]$/.test(value) || /^[\w-]+:[\w-]+$/.test(value) || /^-[\w?=%-]+$/.test(value)) return false;
  if (/[{};=]/.test(value) && /(?:=>|function|const |var |let |;\s*\w|display:|color:|padding:|margin:)/.test(value)) return false;
  return true;
};

function templateValue(source, start) {
  let value = '', index = start + 1, variable = 0;
  for (; index < source.length; index++) {
    if (source[index] === '\\') { value += source[index + 1] === 'n' ? '\n' : source[index + 1] || ''; index++; continue; }
    if (source[index] === '`') return {value, end: index + 1, dynamic: variable > 0};
    if (source.startsWith('${', index)) { const end = balancedEnd(source, index + 1); value += `{value${++variable}}`; index = end - 1; continue; }
    value += source[index];
  }
  return {value, end: index, dynamic: variable > 0};
}

function sourceLiterals(source) {
  const result = [];
  function scan(start = 0, stop = source.length) {
    for (let index = start; index < stop; index++) {
      const char = source[index];
      if (source.startsWith('//', index)) { const end = source.indexOf('\n', index); index = end < 0 ? stop : end; continue; }
      if (source.startsWith('/*', index)) { const end = source.indexOf('*/', index + 2); index = end < 0 ? stop : end + 1; continue; }
      if (char === '/' && /[=(,:;!?\[{]|^$/.test(source.slice(0, index).trimEnd().slice(-1))) {
        let bracket = false;
        for (index++; index < stop; index++) { if (source[index] === '\\') index++; else if (source[index] === '[') bracket = true; else if (source[index] === ']') bracket = false; else if (source[index] === '/' && !bracket) break; }
        continue;
      }
      if (char === '\'' || char === '"') {
        const end = quoteEnd(source, index);
        try { result.push({value: literalValue(source.slice(index, end)), offset: index, dynamic: false}); } catch { /* Not an ordinary literal, e.g. a regular expression. */ }
        index = end - 1;
      } else if (char === '`') {
        const token = templateValue(source, index); result.push({...token, offset: index});
        // Literal branches inside interpolation are also public copy candidates.
        let cursor = index + 1;
        while (cursor < token.end) { const next = source.indexOf('${', cursor); if (next < 0 || next >= token.end) break; const end = balancedEnd(source, next + 1); scan(next + 2, end - 1); cursor = end; }
        index = token.end - 1;
      }
    }
  }
  scan(); return result;
}

function availableParser() {
  // Report generation can use the parser shipped inside this Node executable.
  // Dictionary/build checks do not depend on this private optional capability.
  // If a future Node omits it, the explicitly conservative lexer remains usable.
  try {
    const embedded = process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'];
    if (!embedded) return null;
    const exports = {}, context = {exports, module: {exports}};
    vm.runInNewContext(embedded, context, {timeout: 1000});
    return context.module.exports;
  } catch { return null; }
}

function parsedSourceLiterals(source, parser) {
  if (!parser) return sourceLiterals(source);
  const result = [], tree = parser.parse(source, {ecmaVersion: 'latest', sourceType: 'module', locations: true});
  function visit(node, parent) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'Literal' && typeof node.value === 'string' && !(parent?.type === 'Property' && parent.key === node && !parent.computed) && !['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration'].includes(parent?.type)) {
      result.push({value: node.value, offset: node.start, dynamic: false, field: parent?.type === 'Property' ? parent.key?.name || parent.key?.value || null : null});
    } else if (node.type === 'TemplateLiteral') {
      let value = ''; const offsetMap = [];
      node.quasis.forEach((part, index) => {
        for (let offset = 0; offset < part.value.raw.length; offset++) { value += part.value.raw[offset]; offsetMap.push(part.start + offset); }
        if (index < node.expressions.length) { const variable = `{value${index + 1}}`; value += variable; for (let offset = 0; offset < variable.length; offset++) offsetMap.push(node.expressions[index].start); }
      });
      result.push({value, offset: node.start, offsetMap, dynamic: node.expressions.length > 0});
    }
    for (const [key, value] of Object.entries(node)) {
      if (['start', 'end', 'loc'].includes(key)) continue;
      if (Array.isArray(value)) { for (const child of value) if (child?.type) visit(child, node); }
      else if (value?.type) visit(value, node);
    }
  }
  visit(tree, null); return result;
}

function htmlStrings(html, offset = 0) {
  const result = [], cleaned = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, match => ' '.repeat(match.length));
  for (const match of cleaned.matchAll(/>([^<>]+)</g)) result.push({value: match[1], offset: offset + match.index + 1, kind: 'visible-text'});
  for (const match of cleaned.matchAll(/\b(aria-label|aria-description|aria-valuetext|title|placeholder|alt|content)\s*=\s*(["'])([\s\S]*?)\2/gi)) {
    if (match[1].toLowerCase() === 'content' && !/<meta\b[^>]*$/i.test(cleaned.slice(Math.max(0, match.index - 200), match.index))) continue;
    result.push({value: match[3], offset: offset + match.index, kind: match[1].toLowerCase() === 'content' ? 'meta-content' : match[1].toLowerCase()});
  }
  return result;
}

function inventory(files, data, parser) {
  const dictionary = new Map(data.unique);
  for (const {dictionary: object, source} of data.objects) {
    const ka = flatten(object.ka), ru = flatten(object.ru);
    for (const [key, en] of flatten(object.en)) dictionary.set(normalize(en), {en, ka: ka.get(key), ru: ru.get(key), source});
  }
  const templates = [...dictionary.keys()].filter(value => /\{\w+\}/.test(value)).map(value => new RegExp('^' + value.split(/(\{\w+\})/).map(part => /^\{\w+\}$/.test(part) ? '.+?' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('') + '$'));
  const entries = [], seen = new Set();
  for (const filename of files) {
    const name = relative(filename), source = fs.readFileSync(filename, 'utf8');
    if (/translations[^/]*\.(?:js|mjs)$/i.test(filename) || name === 'public/preferences.js') continue;
    const tokens = filename.endsWith('.html') ? htmlStrings(source) : parsedSourceLiterals(source, parser).flatMap(token => /<[a-z][\s\S]*>/i.test(token.value) ? htmlStrings(token.value).map(item => ({...item, offset: token.offsetMap?.[item.offset] ?? token.offset + item.offset, dynamic: token.dynamic, field: token.field})) : [{...token, kind: token.dynamic ? 'dynamic-template' : 'literal'}]);
    for (const token of tokens) {
      const value = normalize(token.value);
      if (!meaningful(value)) continue;
      const row = dictionary.get(value), matchedTemplate = !row && templates.some(template => template.test(value));
      const line = lineAt(source, token.offset), key = `${name}:${line}:${token.kind}:${value}`;
      if (seen.has(key)) continue; seen.add(key);
      const missingLocales = locales.slice(1).filter(locale => !row?.[locale] && !matchedTemplate && !hasTranslation(value, locale));
      const previous = source.slice(Math.max(0, token.offset - 90), token.offset);
      const field = token.field || previous.match(/\b([\w]+)\s*:\s*$/)?.[1] || null;
      const identifier = /^(?:BMW(?: [A-Z\d][\w+./-]*)*|[A-Z]\d[\w./ -]*|(?:CC BY|CC BY-SA) [\d.]+|Public domain|[\d.,]+ (?:PS|hp|kW|Nm|rpm|RPM|kg|mm|km\/h|mph))$/.test(value);
      entries.push({file: name, line, kind: token.kind, field, english: value, missingLocales, dictionaryCovered: !missingLocales.length, dynamic: !!token.dynamic || /\{value\d+\}/.test(value), review: identifier ? 'identifier-or-license' : missingLocales.length ? 'translation-candidate' : 'dictionary-covered', note: token.kind === 'alt' ? 'The current preferences translator does not visit alt attributes.' : token.kind === 'meta-content' || filename.endsWith('.html') && /<title>/.test(source.slice(Math.max(0, token.offset - 10), token.offset)) ? 'The current preferences translator visits document.body, not document.head.' : null});
    }
  }
  return entries.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.english.localeCompare(b.english));
}

function writeReports(files, data) {
  const parser = availableParser(), entries = inventory(files, data, parser), missing = entries.filter(entry => entry.missingLocales.length && entry.review !== 'identifier-or-license');
  const summary = Object.fromEntries([...new Set(entries.map(entry => entry.file))].map(file => [file, {candidates: entries.filter(entry => entry.file === file).length, untranslatedCandidates: missing.filter(entry => entry.file === file).length}]));
  const finding = (file, needle, detail) => ({file, line: lineAt(fs.readFileSync(path.join(root, file), 'utf8'), Math.max(0, fs.readFileSync(path.join(root, file), 'utf8').indexOf(needle))), detail});
  const confirmedFindings = [
    finding('public/preferences.js', "const attributes =", 'Only aria-label, title and placeholder are visited; alt, aria-description and aria-valuetext are omitted.'),
    finding('public/preferences.js', 'translateNode(document.body)', 'Translation starts at document.body. Head titles and meta descriptions are excluded.'),
    finding('public/index.html', 'Engine family', 'Engine family, All engines, Chassis / generation and All source years have no authored target-language keys.'),
    finding('public/index.html', 'Choose up to 3', 'The comparison-tray instruction has no authored target-language key.'),
    finding('public/account.js', 'APEX / YOUR ACCOUNT', 'Auth/account story, sign-in and profile prose are mostly outside the authored dictionaries.'),
    finding('public/account.js', 'Enter your name to create an account.', 'Sign-up validation messages have no authored Georgian or Russian entries.'),
    finding('public/smart-search.js', 'No exact matches. Related suggestions', 'Search result counts, related suggestions and empty-result templates are assembled from English fragments.'),
    finding('public/viewer.js', "'Select '+text", 'The 3D part selection accessible label is assembled as English Select + part text.'),
    finding('public/system-guide.js', 'export const systemComponents', 'System encyclopedia component names, descriptions, connections and failure notes mostly lack dictionary entries.'),
    finding('public/engine-lab.js', 'export const ENGINE_LAB_PARTS', 'The engine-lab dictionary covers a selected UI subset; most inspector area/text/detail content is still English.'),
    finding('public/garage.js', "toLocaleString('en'", 'Garage number formatting forces English regardless of the selected application language.'),
    finding('public/tuning-workbench.js', "toLocaleString('en'", 'Workbench number formatting forces English regardless of the selected application language.'),
    finding('public/personal-garage.js', 'new Intl.DateTimeFormat(undefined', 'Saved-build dates use browser locale instead of the selected application language.'),
    finding('public/platform.js', "document.title='APEX", 'Route titles are assigned as English prose and do not subscribe to language changes.'),
  ];
  const report = {schemaVersion: 1, scope: 'Public JS and HTML source, excluding vendor libraries, dictionary implementation files, and candidate photography research.', parser: parser ? `Node bundled Acorn ${parser.version}` : 'Conservative lexical fallback', methodology: 'All exported translation modules and private plain EN/KA/RU objects are checked. The source inventory lists source-copy candidates, not browser-verified defects or semantic translation completeness. Dynamic templates need manual review; factory names, URLs, identifiers and legal attribution may intentionally remain unchanged. Source line numbers refer to the audit snapshot.', authoredDictionaryRows: data.rows.length, uniqueEnglishDictionaryKeys: data.unique.size, objectDictionaries: data.objects.map(item => item.source), parityErrors: data.errors, conflictingDictionaryKeys: data.conflicts, confirmedFindings, counts: {sourceFiles: files.length, candidates: entries.length, untranslatedCandidates: missing.length}, byFile: summary, entries};
  const directory = path.join(root, 'reports'); fs.mkdirSync(directory, {recursive: true});
  fs.writeFileSync(path.join(directory, 'phase-0-translation-inventory.json'), JSON.stringify(report, null, 2) + '\n');
  const escape = value => String(value).replace(/\|/g, '\\|').replace(/`/g, '\\`').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = ['# Phase 0 translation audit', '', report.methodology, '', `Authored dictionary parity: ${data.errors.length ? 'FAIL' : 'PASS'}. ${data.rows.length} rows; ${data.unique.size} unique English keys; ${data.objects.length} locale-object dictionaries. ${data.conflicts.length} conflicting duplicate English entries are recorded separately. Passing parity does not mean the application is fully translated.`, '', `Scanned ${files.length} source files. Found ${entries.length} source-copy candidates, including ${missing.length} untranslated candidates after identifier/license exclusions. All candidates, including covered strings and review classifications, are in phase-0-translation-inventory.json.`, '', '## Confirmed architectural gaps', '', '- public/preferences.js visits document.body and only aria-label/title/placeholder attributes; page metadata, image alt, aria-description and aria-valuetext are not translated through that path.', '- public/routes.js has no locale URL prefixes; no hreflang alternates are authored in the HTML pages.', '- Global English source text is used as dictionary identity. Conflicting definitions can change terminology after a feature dictionary loads.', '- Dictionary parity checks cannot detect prose that was never added to a dictionary. Treat this source inventory and per-route browser tests as additional checks.', '- Numeric/date formatting is inconsistent: garage.js and tuning-workbench.js force English; personal-garage.js uses browser locale rather than the selected application language.', '', '## Source inventory by file', '', '| File | Candidates | Untranslated candidates |', '| --- | ---: | ---: |', ...Object.entries(summary).map(([file, count]) => `| ${file} | ${count.candidates} | ${count.untranslatedCandidates} |`), '', '## Untranslated candidates requiring review', '', 'Factory model names, engine codes, original author/license names and units should remain intact where appropriate. Dynamic fragments can be translated through a complete template even when an individual fragment has no key. The list below does not claim every candidate is a visible defect.', ''];
  lines.splice(lines.indexOf('## Source inventory by file'), 0, '## Confirmed source findings', '', ...confirmedFindings.map(item => `- ${item.file}:${item.line} — ${item.detail}`), '', 'Browser interaction, viewport coverage and screen-reader behavior were not tested by this script.', '');
  for (const [file] of Object.entries(summary)) {
    const items = missing.filter(entry => entry.file === file); if (!items.length) continue;
    lines.push(`### ${file}`, '', '| Line | Context | English source candidate |', '| ---: | --- | --- |', ...items.map(entry => `| ${entry.line} | ${entry.dynamic ? 'dynamic ' : ''}${entry.kind}${entry.field ? ' / ' + entry.field : ''} | ${escape(entry.english)} |`), '');
  }
  lines.push('## Conflicting duplicate dictionary entries', '', 'Existing conflicts are warnings; they do not prevent deployment. Reconcile terminology or use context-specific keys before making this rule strict.', '', '| English key | First dictionary | Later dictionary |', '| --- | --- | --- |', ...data.conflicts.map(entry => `| ${escape(entry.english)} | ${entry.first} | ${entry.second} |`), '');
  fs.writeFileSync(path.join(directory, 'phase-0-translation-audit.md'), lines.join('\n'));
  console.log(`Translation inventory: ${entries.length} candidates, ${missing.length} untranslated candidates. Reports written to reports/.`);
}

function selfTest() {
  assert.deepEqual(validateRows([['Hello {name}', 'გამარჯობა {name}', 'Привет {name}']], 'valid'), []);
  assert.ok(validateRows([['Hello', 'გამარჯობა']], 'missing').some(error => error.includes('missing or empty ru')));
  assert.ok(validateRows([['Hello', '', 'Привет']], 'empty').some(error => error.includes('missing or empty ka')));
  assert.ok(validateRows([['Hello {name}', 'გამარჯობა', 'Привет {name}']], 'placeholder').some(error => error.includes('placeholders differ')));
  assert.ok(validateObjectDictionary({en: {button: {label: 'Open'}}, ka: {button: {label: 'გახსნა'}}, ru: {button: {}}}, 'nested').some(error => error.includes('ru.button.label')));
  assert.ok(validateObjectDictionary({en: {label: 'Open'}, ru: {label: 'Открыть'}}, 'locale').some(error => error.includes('ka.label')));
  assert.deepEqual(validateObjectDictionary({en: {label: 'Open {count}'}, ka: {label: 'გახსნა {count}'}, ru: {label: 'Открыть {count}'}}, 'valid-object'), []);
  const fixture = path.join(os.tmpdir(), `apex-translation-negative-${process.pid}-${Date.now()}.json`);
  try {
    fs.writeFileSync(fixture, JSON.stringify([['This English key has no Russian translation', 'რუსული თარგმანი არ არის']]));
    const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--fixture', fixture], {encoding: 'utf8'});
    assert.equal(result.status, 1, `Missing translation must fail the checker process. ${result.stderr}`);
    assert.match(result.stderr, /missing or empty ru/);
  } finally { if (fs.existsSync(fixture)) fs.unlinkSync(fixture); }
  console.log('Translation checker self-test passed: missing/empty locales, nested keys and placeholder mismatches are rejected; an isolated missing-Russian fixture exits 1 without changing application source.');
}

function reportErrors(errors) {
  if (!errors.length) return false;
  console.error(`Translation parity failed (${errors.length}):\n` + errors.map(error => `- ${error}`).join('\n')); process.exitCode = 1; return true;
}

async function main() {
  if (process.argv.includes('--self-test')) { selfTest(); return; }
  if (process.argv.includes('--fixture')) {
    const filename = process.argv[process.argv.indexOf('--fixture') + 1];
    const value = JSON.parse(fs.readFileSync(filename, 'utf8'));
    if (!reportErrors(Array.isArray(value) ? validateRows(value, filename) : validateObjectDictionary(value, filename))) console.log('Translation fixture passed.');
    return;
  }
  const files = filesIn(path.join(root, 'public')), data = await dictionaries(files);
  if (process.argv.includes('--report')) writeReports(files, data);
  if (reportErrors(data.errors)) return;
  console.log(`Translation parity passed: ${data.rows.length} EN/KA/RU rows, ${data.unique.size} unique English keys and ${data.objects.length} locale-object dictionaries.`);
  if (data.conflicts.length) console.warn(`Translation terminology warning: ${data.conflicts.length} conflicting duplicate entries; see --report output.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
