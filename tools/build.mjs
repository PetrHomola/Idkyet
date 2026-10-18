#!/usr/bin/env node
// CIRUS Origin build: site/ -> dist/
//
// 1. copies site/ to dist/ (a clean copy every time),
// 2. replaces {{KEY}} placeholders from config.json in .html/.css/.js/.txt/.svg files
//    (top-level keys + prices; files under site/en/ get prices_en; YEAR = current year),
// 3. fails (exit 1) when any {{KEY}} is left in dist/,
// 4. writes dist/cirus-origin-kalkulacka-offline.html: the calculator in one self-contained file
//    (CSS, ES modules, sample data and SheetJS inlined; no fonts or requests from the internet),
// 5. writes dist/.nojekyll and, when the site has none, robots.txt and sitemap.xml.
//
// Node 22, no dependencies. Usage: node tools/build.mjs
// Options:     --serve [port]  after the build, serve dist/ (default port 8080)
// Environment: CIRUS_NO_DOWNLOAD=1 skips downloading SheetJS (uses tools/vendor/ cache only);
//              CIRUS_REQUIRE_SHEETJS=1 fails the build when SheetJS cannot be inlined (used in CI).

import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');
const DIST = path.join(ROOT, 'dist');
const CONFIG = path.join(ROOT, 'config.json');
const VENDOR = path.join(ROOT, 'tools', 'vendor');

const OFFLINE_NAME = 'cirus-origin-kalkulacka-offline.html';
const CALC_PAGE = path.join('kalkulacka', 'index.html');
const SAMPLE_FILE = path.join('assets', 'sample', 'ukazka-kusovnik.csv');
const SAMPLE_ID = 'cirus-origin-sample';

const XLSX_URL = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
const XLSX_SRI = 'sha512-r22gChDnGvBylk90+2e/ycr3RVrDi8DIOkIGNhJlKfuyQM4tIRAI062MaV8sfjQKYVGjOBaZBOA87z+IhZE9DA==';
const XLSX_CACHE = path.join(VENDOR, 'xlsx-0.18.5.full.min.js');

// Text files in which placeholders are replaced and checked.
const TEXT_EXT = new Set(['.html', '.htm', '.css', '.js', '.mjs', '.txt', '.svg', '.xml', '.webmanifest']);
const PLACEHOLDER = /\{\{([A-Z][A-Z0-9_]*)\}\}/g;
const LEFTOVER = /\{\{\s*[A-Za-z_][A-Za-z0-9_.-]*\s*\}\}/g;
const SKIP_NAMES = new Set(['.DS_Store', 'Thumbs.db', 'desktop.ini']);

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.csv': 'text/csv', '.txt': 'text/plain', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.pdf': 'application/pdf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const warnings = [];
const log = (...a) => console.log(...a);
const warn = (msg) => { warnings.push(msg); console.warn(`VAROVÁNÍ: ${msg}`); };
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

class BuildError extends Error {}

/* ----------------------------------------------------------------- config */

async function loadValues() {
  let cfg;
  try {
    cfg = JSON.parse(await fs.readFile(CONFIG, 'utf8'));
  } catch (err) {
    throw new BuildError(`config.json nejde načíst: ${err.message}`);
  }
  const base = {};
  for (const [k, v] of Object.entries(cfg)) {
    if (v !== null && typeof v !== 'object') base[k] = String(v);
  }
  base.YEAR = String(new Date().getFullYear());
  const flat = (obj) => Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== null && typeof v !== 'object').map(([k, v]) => [k, String(v)]));
  const cs = { ...base, ...flat(cfg.prices) };
  const en = { ...base, ...flat(cfg.prices_en || cfg.prices) };
  if (!cfg.prices) warn('config.json nemá sekci "prices".');
  if (!cfg.prices_en) warn('config.json nemá sekci "prices_en", anglické stránky dostanou ceny z "prices".');
  const todo = Object.entries({ ...base, ...flat(cfg.prices), ...flat(cfg.prices_en) })
    .filter(([, v]) => /\[DOPLNIT/i.test(v)).map(([k]) => k);
  return { cs, en, todo, cfg };
}

/* -------------------------------------------------------------- escaping */

// Valid inside JS strings ('…', "…", `…`) and JSON strings alike.
function escJs(v) {
  return v.replace(/[\\"'`$<>&\u0000-\u001f\u2028\u2029]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
}
function escHtml(v) {
  return v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function escCss(v) {
  return v.replace(/[\\"'\n\r]/g, (c) => (c === '\n' || c === '\r' ? '\\A ' : `\\${c}`));
}

function fill(text, values, escape, file) {
  return text.replace(PLACEHOLDER, (m, key) => {
    if (!Object.hasOwn(values, key)) return m; // reported by the leftover check
    return escape(values[key], file);
  });
}

// HTML: script blocks get JS escaping, style blocks CSS escaping, the rest HTML escaping.
function fillHtml(text, values) {
  const re = /(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)|(<style\b[^>]*>)([\s\S]*?)(<\/style\s*>)/gi;
  let out = '';
  let last = 0;
  for (const m of text.matchAll(re)) {
    out += fill(text.slice(last, m.index), values, escHtml);
    if (m[1]) out += fill(m[1], values, escHtml) + fill(m[2], values, escJs) + m[3];
    else out += fill(m[4], values, escHtml) + fill(m[5], values, escCss) + m[6];
    last = m.index + m[0].length;
  }
  return out + fill(text.slice(last), values, escHtml);
}

function replaceIn(text, ext, values) {
  switch (ext) {
    case '.html': case '.htm': return fillHtml(text, values);
    case '.svg': case '.xml': return fill(text, values, escHtml);
    case '.js': case '.mjs': case '.webmanifest': return fill(text, values, escJs);
    case '.css': return fill(text, values, escCss);
    default: return fill(text, values, (v) => v);
  }
}

/* ------------------------------------------------------------------ files */

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else if (e.isFile()) out.push(p);
  }
  return out;
}

async function copySite() {
  if (!existsSync(SITE)) throw new BuildError('Chybí složka site/.');
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.cp(SITE, DIST, {
    recursive: true,
    filter: (src) => !SKIP_NAMES.has(path.basename(src)),
  });
}

async function replacePlaceholders(values) {
  let count = 0;
  for (const file of await walk(DIST)) {
    const ext = path.extname(file).toLowerCase();
    if (!TEXT_EXT.has(ext)) continue;
    const relPath = path.relative(DIST, file).split(path.sep).join('/');
    const vals = relPath.startsWith('en/') ? values.en : values.cs;
    const text = await fs.readFile(file, 'utf8');
    const out = replaceIn(text, ext, vals);
    if (out !== text) {
      count += 1;
      await fs.writeFile(file, out);
    }
  }
  return count;
}

async function findLeftovers() {
  const found = [];
  for (const file of await walk(DIST)) {
    if (!TEXT_EXT.has(path.extname(file).toLowerCase())) continue;
    const text = await fs.readFile(file, 'utf8');
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      for (const m of line.matchAll(LEFTOVER)) found.push(`${rel(file)}:${i + 1}  ${m[0]}`);
    });
  }
  return found;
}

async function findTodo() {
  const found = new Map();
  for (const file of await walk(DIST)) {
    if (!TEXT_EXT.has(path.extname(file).toLowerCase())) continue;
    const n = ((await fs.readFile(file, 'utf8')).match(/\[DOPLNIT/g) || []).length;
    if (n) found.set(rel(file), n);
  }
  return found;
}

/* -------------------------------------------------------------- SheetJS */

function sri(buf) {
  return `sha512-${createHash('sha512').update(buf).digest('base64')}`;
}

async function download(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    // Fallback for environments where only curl is set up for the proxy.
    try {
      return execFileSync('curl', ['-fsSL', '--max-time', '60', url], { maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    } catch {
      throw err;
    }
  }
}

async function getSheetJs() {
  if (existsSync(XLSX_CACHE)) {
    const buf = await fs.readFile(XLSX_CACHE);
    if (sri(buf) === XLSX_SRI) return buf.toString('utf8');
    warn(`${rel(XLSX_CACHE)} nemá očekávaný otisk SHA-512, stahuji znovu.`);
  }
  if (process.env.CIRUS_NO_DOWNLOAD === '1') {
    warn('SheetJS se nestahuje (CIRUS_NO_DOWNLOAD=1). Offline kalkulačka bude bez importu a exportu XLSX.');
    return null;
  }
  let buf;
  try {
    buf = await download(XLSX_URL);
  } catch (err) {
    warn(`SheetJS se nepodařilo stáhnout (${err.message}). Offline kalkulačka bude bez importu a exportu XLSX (CSV a vkládání fungují).`);
    return null;
  }
  if (sri(buf) !== XLSX_SRI) {
    warn('Stažený SheetJS nemá očekávaný otisk SHA-512, nepoužiji ho. Offline kalkulačka bude bez XLSX.');
    return null;
  }
  await fs.mkdir(VENDOR, { recursive: true });
  await fs.writeFile(XLSX_CACHE, buf);
  log(`SheetJS stažen a uložen do ${rel(XLSX_CACHE)}`);
  return buf.toString('utf8');
}

/* ------------------------------------------------------- offline helpers */

function attr(tag, name) {
  const m = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i').exec(tag);
  return m ? (m[1] ?? m[2] ?? m[3] ?? '') : null;
}

function setAttr(tag, name, value) {
  const re = new RegExp(`(\\s${name}\\s*=\\s*)(?:"[^"]*"|'[^']*'|[^\\s"'>]+)`, 'i');
  const v = `"${escHtml(value)}"`;
  if (re.test(tag)) return tag.replace(re, (m, a) => a + v);
  return tag.replace(/^<([a-z0-9-]+)/i, `<$1 ${name}=${v}`);
}

function hasAttr(tag, name) {
  return new RegExp(`\\s${name}(?=[\\s=/>])`, 'i').test(tag);
}

function removeAttr(tag, name) {
  return tag.replace(new RegExp(`\\s${name}(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s"'>]+))?(?=[\\s/>])`, 'i'), '');
}

const decodeAttr = (v) => v.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const isExternal = (u) => /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(u);
const isFontHost = (u) => /fonts\.(?:googleapis|gstatic)\.com/i.test(u);

function localPath(fromDir, url) {
  const clean = decodeURIComponent(decodeAttr(url).split(/[?#]/)[0]);
  const p = clean.startsWith('/') ? path.join(DIST, clean) : path.resolve(fromDir, clean);
  if (!p.startsWith(DIST + path.sep)) throw new BuildError(`Odkaz mimo dist/: ${url}`);
  return p;
}

async function dataUrl(file) {
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  return `data:${type};base64,${(await fs.readFile(file)).toString('base64')}`;
}

// Make text safe inside <script>/<style>: no closing tag, no "<!--" (script data escaped state).
function guardRaw(code, tagName) {
  return code
    .replace(new RegExp(`</(${tagName})`, 'gi'), '<\\/$1')
    .replace(/<!--/g, tagName === 'script' ? '<\\u0021--' : '<\\!--');
}

/* ------------------------------------------------------------ CSS inline */

async function inlineCss(file, seen = new Set()) {
  if (seen.has(file)) return '';
  seen.add(file);
  const dir = path.dirname(file);
  let css = await fs.readFile(file, 'utf8');
  // @import url("…") / @import "…" (URLs may contain ';', so quoted strings are matched first)
  const importRe = /@import\s+(?:url\(\s*(?:"([^"]*)"|'([^']*)'|([^)"'\s]*))\s*\)|"([^"]*)"|'([^']*)')([^;]*);/gi;
  const parts = [];
  let last = 0;
  for (const m of css.matchAll(importRe)) {
    parts.push(css.slice(last, m.index));
    last = m.index + m[0].length;
    const url = m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5];
    const media = m[6].trim();
    if (isExternal(url)) {
      if (!isFontHost(url)) warn(`offline: vynechán externí @import ${url}`);
      parts.push(isFontHost(url) ? '/* webové fonty vynechány, offline verze používá systémová písma */' : '');
      continue;
    }
    const inner = await inlineCss(localPath(dir, url), seen);
    parts.push(media ? `@media ${media} {\n${inner}\n}` : inner);
  }
  parts.push(css.slice(last));
  css = parts.join('');
  // url(...) to local files -> data: URLs
  const urlRe = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)"'\s]*))\s*\)/gi;
  const out = [];
  last = 0;
  for (const m of css.matchAll(urlRe)) {
    out.push(css.slice(last, m.index));
    last = m.index + m[0].length;
    const url = m[1] ?? m[2] ?? m[3];
    if (!url || isExternal(url) || url.startsWith('#')) {
      if (url && /^(?:https?:)?\/\//i.test(url)) warn(`offline: CSS odkazuje na ${url}`);
      out.push(m[0]);
      continue;
    }
    const target = localPath(dir, url);
    if (!existsSync(target)) {
      warn(`offline: CSS odkaz ${url} v ${rel(file)} neexistuje`);
      out.push(m[0]);
      continue;
    }
    out.push(`url("${await dataUrl(target)}")`);
  }
  out.push(css.slice(last));
  return out.join('');
}

/* ------------------------------------------------------------ JS inline */

// Relative module specifiers: import … from './x.js', export … from './x.js', import './x.js', import('./x.js')
const SPEC_RE = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)(["'])(\.{1,2}\/[^"'\n]+|\/[^"'\n/][^"'\n]*)\2/g;

async function moduleUrl(file, cache, stack) {
  if (cache.has(file)) return cache.get(file);
  if (stack.includes(file)) {
    throw new BuildError(`offline: cyklická závislost modulů ${[...stack, file].map(rel).join(' -> ')}`);
  }
  const code = await rewriteModule(file, cache, [...stack, file]);
  const url = `data:text/javascript;base64,${Buffer.from(code, 'utf8').toString('base64')}`;
  cache.set(file, url);
  return url;
}

// Rewrites relative imports of a module to data: URLs of the (recursively rewritten) dependencies.
// Identical dependencies get identical URLs, so the browser instantiates each module once.
async function rewriteModule(file, cache, stack) {
  if (!existsSync(file)) throw new BuildError(`offline: modul ${rel(file)} neexistuje`);
  const src = await fs.readFile(file, 'utf8');
  const dir = path.dirname(file);
  const out = [];
  let last = 0;
  for (const m of src.matchAll(SPEC_RE)) {
    out.push(src.slice(last, m.index));
    last = m.index + m[0].length;
    const dep = localPath(dir, m[3]);
    out.push(`${m[1]}${m[2]}${await moduleUrl(dep, cache, stack)}${m[2]}`);
  }
  out.push(src.slice(last));
  return out.join('');
}

/* ---------------------------------------------------------- offline page */

async function buildOffline(values) {
  const pagePath = path.join(DIST, CALC_PAGE);
  if (!existsSync(pagePath)) {
    warn(`offline: ${CALC_PAGE} neexistuje, offline kalkulačka se nevytvoří.`);
    return null;
  }
  const pageDir = path.dirname(pagePath);
  let html = await fs.readFile(pagePath, 'utf8');
  const web = String(values.cs.WEB || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  const siteBase = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(web) ? `https://${web}/` : null;
  if (!siteBase) warn(`offline: WEB v config.json ("${web}") není doména, odkazy na web zůstanou relativní.`);
  const pageUrl = siteBase ? new URL(CALC_PAGE.split(path.sep).join('/'), siteBase) : null;

  let sheetJsWanted = false;
  let modules = 0;

  // <link>: stylesheets inline, external hints removed, icons as data: URLs
  async function linkTag(tag) {
    const relAttr = (attr(tag, 'rel') || '').toLowerCase();
    const href = attr(tag, 'href') || '';
    if (/\b(preconnect|dns-prefetch|preload|prefetch|modulepreload)\b/.test(relAttr)) {
      return isExternal(href) || /\bmodulepreload\b/.test(relAttr) ? '' : tag;
    }
    if (/\bstylesheet\b/.test(relAttr)) {
      if (isExternal(href)) {
        if (!isFontHost(href)) warn(`offline: vynechán externí stylopis ${href}`);
        return '';
      }
      const media = attr(tag, 'media');
      const css = guardRaw(await inlineCss(localPath(pageDir, href)), 'style');
      return `<style${media ? ` media="${escHtml(media)}"` : ''}>\n${css}\n</style>`;
    }
    if (/\b(icon|apple-touch-icon|mask-icon|manifest)\b/.test(relAttr) && href && !isExternal(href)) {
      const target = localPath(pageDir, href);
      return /\bmanifest\b/.test(relAttr) || !existsSync(target) ? '' : setAttr(tag, 'href', await dataUrl(target));
    }
    return tag;
  }

  // <a>, <img>: links back to the web -> absolute URLs; downloadable files -> data: URLs
  async function refTag(tag) {
    let t = tag;
    const name = tag.slice(1).split(/[\s>/]/)[0].toLowerCase();
    if (name === 'img' || name === 'source') {
      const src = attr(t, 'src');
      if (src && !isExternal(src) && existsSync(localPath(pageDir, src))) t = setAttr(t, 'src', await dataUrl(localPath(pageDir, src)));
    } else {
      const href = attr(t, 'href');
      if (href && !isExternal(href) && !href.startsWith('#')) {
        const target = localPath(pageDir, href);
        const isDownload = hasAttr(t, 'download');
        if (isDownload && existsSync(target) && (await fs.stat(target)).size <= 2 * 1024 * 1024) {
          t = setAttr(t, 'href', await dataUrl(target));
          if (!attr(t, 'download')) t = setAttr(t, 'download', path.basename(target));
        } else if (pageUrl) {
          t = setAttr(t, 'href', new URL(decodeAttr(href), pageUrl).href);
          if (isDownload) t = removeAttr(t, 'download');
        }
      }
    }
    // data-href-cs / data-href-en (language-dependent links switched by the calculator)
    for (const m of [...t.matchAll(/\s(data-href-[a-z]+)\s*=\s*"([^"]*)"/gi)]) {
      if (pageUrl && m[2] && !isExternal(m[2]) && !m[2].startsWith('#')) {
        t = setAttr(t, m[1], new URL(decodeAttr(m[2]), pageUrl).href);
      }
    }
    return t;
  }

  // <script src>: ES modules bundled (data: URLs), classic scripts inlined; inline scripts kept
  async function scriptTag(tag, attrs) {
    const src = attr(attrs, 'src');
    if (src === null) return tag;
    const type = (attr(attrs, 'type') || '').toLowerCase();
    if (isExternal(src)) {
      if (/\/xlsx(\.full)?(\.min)?\.js/i.test(src)) {
        sheetJsWanted = true;
        return '';
      }
      throw new BuildError(`offline: kalkulačka načítá externí skript ${src}, offline verze ho neumí vložit.`);
    }
    if (type === 'module') {
      const cache = new Map();
      const entry = localPath(pageDir, src);
      const code = await rewriteModule(entry, cache, [entry]);
      const body = /<\/script|<!--/i.test(code)
        ? `import ${JSON.stringify(`data:text/javascript;base64,${Buffer.from(code, 'utf8').toString('base64')}`)};`
        : code;
      modules += cache.size + 1;
      log(`offline: ES moduly vloženy: ${[entry, ...cache.keys()].map((f) => path.basename(f)).join(', ')}`);
      return `<script type="module">\n${body}\n</script>`;
    }
    const code = await fs.readFile(localPath(pageDir, src), 'utf8');
    return `<script>\n${guardRaw(code, 'script')}\n</script>`;
  }

  // One pass over the page. Raw-text elements (script, style) are tokens of their own, so
  // markup inside inlined code is never rewritten.
  const tokenRe = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<!--[\s\S]*?-->|<link\b[^>]*>|<(?:a|area|img|source)\b[^>]*>/gi;
  const parts = [];
  let last = 0;
  for (const m of html.matchAll(tokenRe)) {
    parts.push(html.slice(last, m.index));
    last = m.index + m[0].length;
    const tok = m[0];
    if (/^<script/i.test(tok)) parts.push(m[2].trim() ? tok : await scriptTag(tok, m[1]));
    else if (/^<(style|!--)/i.test(tok)) parts.push(tok);
    else if (/^<link/i.test(tok)) parts.push(await linkTag(tok));
    else parts.push(await refTag(tok));
  }
  parts.push(html.slice(last));
  html = parts.join('');
  if (!modules) warn(`offline: ${CALC_PAGE} nemá <script type="module" src>, kalkulačka nebude fungovat.`);

  // sample data for "Načíst ukázku"
  const samplePath = path.join(DIST, SAMPLE_FILE);
  let sampleBlock = '';
  if (existsSync(samplePath)) {
    const csv = (await fs.readFile(samplePath, 'utf8')).replace(/^\uFEFF/, '');
    if (/<\/script|<!--/i.test(csv)) throw new BuildError(`offline: ${SAMPLE_FILE} obsahuje "</script" nebo "<!--", nejde vložit.`);
    sampleBlock = `<script type="text/plain" id="${SAMPLE_ID}">\n${csv.replace(/\s+$/, '')}\n</script>\n`;
  } else {
    warn(`offline: ukázka ${SAMPLE_FILE} neexistuje, tlačítko Načíst ukázku nebude offline fungovat.`);
  }

  // SheetJS (classic script at the end of body; module scripts run after it, so window.XLSX exists)
  let sheetBlock = '';
  const sheet = await getSheetJs();
  if (sheet) {
    const guarded = guardRaw(sheet, 'script');
    try {
      new vm.Script(guarded, { filename: 'xlsx.full.min.js' });
    } catch (err) {
      throw new BuildError(`offline: SheetJS po úpravě pro vložení není platný JavaScript (${err.message}).`);
    }
    sheetBlock = `<script>/*! SheetJS Community Edition 0.18.5, Apache-2.0, https://sheetjs.com */\n${guarded}\n</script>\n`;
  } else if (process.env.CIRUS_REQUIRE_SHEETJS === '1') {
    throw new BuildError('offline: SheetJS se nepodařilo vložit a CIRUS_REQUIRE_SHEETJS=1 vyžaduje offline verzi s XLSX.');
  } else if (sheetJsWanted) {
    warn('offline: SheetJS chybí.');
  }

  if (!/<\/body\s*>/i.test(html)) throw new BuildError(`offline: ${CALC_PAGE} nemá </body>.`);
  html = html.replace(/<\/body\s*>/i, () => `${sampleBlock}${sheetBlock}</body>`);
  html = html.replace(/<html\b[^>]*>/i, (t) => setAttr(t, 'data-offline', '1'));
  const stamp = new Date().toISOString().slice(0, 10);
  const note = `<!-- ${values.cs.BRAND || 'CIRUS Origin'}: offline kalkulačka v jednom souboru, sestaveno ${stamp}. Běží bez internetu, data se nikam neodesílají. -->`;
  html = /^\s*<!doctype[^>]*>/i.test(html) ? html.replace(/^\s*(<!doctype[^>]*>)/i, `$1\n${note}`) : `<!doctype html>\n${note}\n${html}`;

  // sanity checks
  const problems = [];
  if (/<link\b[^>]*rel=["']?stylesheet/i.test(html)) problems.push('zůstal <link rel="stylesheet">');
  if (/<script\b[^>]*\ssrc=/i.test(html)) problems.push('zůstal <script src>');
  if (isFontHost(html.replace(/data:[^"')\s]+/g, ''))) problems.push('zůstal odkaz na Google Fonts');
  if (problems.length) throw new BuildError(`offline: ${problems.join(', ')}`);

  const out = path.join(DIST, OFFLINE_NAME);
  await fs.writeFile(out, html);
  return { file: out, size: Buffer.byteLength(html), sheetJs: Boolean(sheet) };
}

/* -------------------------------------------------- robots + sitemap */

async function writeSeo(values) {
  const web = String(values.cs.WEB || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(web)) return;
  const base = `https://${web}/`;
  if (!existsSync(path.join(DIST, 'sitemap.xml'))) {
    const pages = (await walk(DIST))
      .filter((f) => f.endsWith('.html') && path.basename(f) !== OFFLINE_NAME && path.basename(f) !== '404.html')
      .map((f) => path.relative(DIST, f).split(path.sep).join('/'))
      .map((p) => p.replace(/(^|\/)index\.html$/, '$1'))
      .sort();
    const today = new Date().toISOString().slice(0, 10);
    const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...pages.map((p) => `  <url><loc>${escHtml(new URL(p, base).href)}</loc><lastmod>${today}</lastmod></url>`), '</urlset>', ''].join('\n');
    await fs.writeFile(path.join(DIST, 'sitemap.xml'), xml);
  }
  const robots = path.join(DIST, 'robots.txt');
  if (!existsSync(robots)) {
    await fs.writeFile(robots, `User-agent: *\nAllow: /\n\nSitemap: ${base}sitemap.xml\n`);
  } else {
    const text = await fs.readFile(robots, 'utf8');
    if (!/^\s*sitemap:/im.test(text)) await fs.writeFile(robots, `${text.replace(/\s*$/, '')}\n\nSitemap: ${base}sitemap.xml\n`);
  }
}

/* ------------------------------------------------------------------ main */

async function main() {
  const t0 = Date.now();
  const values = await loadValues();
  await copySite();
  const changed = await replacePlaceholders(values);
  log(`dist/: zkopírováno ze site/, placeholdery nahrazeny v ${changed} souborech`);

  const offline = await buildOffline(values);
  if (offline) {
    log(`offline: ${rel(offline.file)} (${(offline.size / 1024).toFixed(0)} kB${offline.sheetJs ? ', se SheetJS' : ', bez SheetJS'})`);
  }

  await fs.writeFile(path.join(DIST, '.nojekyll'), '');
  await writeSeo(values);

  const leftovers = await findLeftovers();
  if (leftovers.length) {
    console.error(`\nCHYBA: v dist/ zůstaly nenahrazené placeholdery (${leftovers.length}):`);
    for (const l of leftovers) console.error(`  ${l}`);
    console.error('Doplňte klíč do config.json, nebo opravte název placeholderu (viz docs/SPEC.md, kap. 2).');
    process.exit(1);
  }

  if (values.todo.length) {
    const where = await findTodo();
    console.warn(`\nK DOPLNĚNÍ v config.json: ${values.todo.join(', ')}`);
    if (where.size) console.warn(`  [DOPLNIT] se objevuje v ${where.size} souborech dist/ (celkem ${[...where.values()].reduce((a, b) => a + b, 0)}×).`);
  }

  log(`\nBuild hotový za ${((Date.now() - t0) / 1000).toFixed(1)} s${warnings.length ? `, varování: ${warnings.length}` : ''}.`);
}

/* ------------------------------------------------------------ dev server */

/**
 * Minimal static server for dist/ (used by `npm run serve` and tools/e2e.mjs).
 * @param {string} root directory to serve
 * @param {number} port 0 = any free port
 * @returns {Promise<{server: import('node:http').Server, url: string}>}
 */
export async function serveDir(root = DIST, port = 0, host = '127.0.0.1') {
  const { createServer } = await import('node:http');
  const { createReadStream } = await import('node:fs');
  const base = path.resolve(root);
  const server = createServer(async (req, res) => {
    try {
      const { pathname } = new URL(req.url, 'http://localhost');
      let file = path.join(base, decodeURIComponent(pathname));
      if (file !== base && !file.startsWith(base + path.sep)) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      let st = await fs.stat(file).catch(() => null);
      if (st && st.isDirectory()) {
        if (!pathname.endsWith('/')) {
          res.writeHead(301, { Location: `${pathname}/` }).end();
          return;
        }
        file = path.join(file, 'index.html');
        st = await fs.stat(file).catch(() => null);
      }
      if (!st || !st.isFile()) {
        const notFound = path.join(base, '404.html');
        const body = existsSync(notFound) ? await fs.readFile(notFound) : 'Not found';
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(body);
        return;
      }
      const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
      const text = /^(text\/|application\/json|image\/svg)/.test(type);
      res.writeHead(200, {
        'Content-Type': text ? `${type}; charset=utf-8` : type,
        'Content-Length': st.size,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      if (req.method === 'HEAD') res.end();
      else createReadStream(file).pipe(res);
    } catch (err) {
      res.writeHead(500).end(String(err));
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  const addr = server.address();
  return { server, url: `http://${host === '0.0.0.0' ? 'localhost' : host}:${addr.port}` };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  main()
    .then(async () => {
      const i = args.indexOf('--serve');
      if (i === -1) return;
      const port = Number(args[i + 1]) || Number(process.env.PORT) || 8080;
      const { url } = await serveDir(DIST, port, '0.0.0.0');
      log(`\nWeb běží na ${url}/  (kalkulačka ${url}/kalkulacka/, ukončíte Ctrl+C)`);
    })
    .catch((err) => {
      console.error(`\nCHYBA buildu: ${err instanceof BuildError ? err.message : err.stack || err}`);
      process.exit(1);
    });
}
