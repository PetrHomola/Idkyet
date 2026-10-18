#!/usr/bin/env node
// Pod35 end-to-end test in a real browser (Playwright + Chromium).
//
//   node tools/e2e.mjs            build, serve dist/ on a free port, run all checks
//   node tools/e2e.mjs --no-build use the existing dist/
//
// Checks: every page of SPEC section 1 loads without console errors, without {{PLACEHOLDERS}}
// and without horizontal overflow at 390 and 360 px; internal links resolve; the calculator loads
// the sample, shows a verdict and tables and switches language, and survives the customer flows
// (paste from Excel, column mapping, rule packs, inline edits, filter, exports, project round trip,
// copy fallback, print CSS, contrast in light and dark mode); the offline file works from
// file:// without any network request; the templates are present and readable by calc-core.
// Exit code 1 when any check fails.

import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OFFLINE = path.join(DIST, 'pod35-kalkulacka-offline.html');
const ARGS = new Set(process.argv.slice(2));
const TIMEOUT = 15000;

const PAGES = [
  { path: '/index.html', name: 'landing CZ', lang: 'cs' },
  { path: '/en/index.html', name: 'landing EN', lang: 'en' },
  { path: '/metodika.html', name: 'metodika CZ', lang: 'cs' },
  { path: '/ochrana-dat.html', name: 'ochrana dat CZ', lang: 'cs' },
  { path: '/nabidka.html', name: 'nabídka CZ', lang: 'cs' },
  { path: '/en/methodology.html', name: 'methodology EN', lang: 'en' },
  { path: '/en/data-protection.html', name: 'data protection EN', lang: 'en' },
  { path: '/en/offer.html', name: 'offer EN', lang: 'en' },
  { path: '/kalkulacka/index.html', name: 'kalkulačka (prázdná)', lang: 'cs' },
];
const WIDTHS = [390, 360];

// data-testid contract between tools/e2e.mjs and the calculator UI (see README.md).
const TESTIDS = {
  'load-sample': '#btn-sample',
  verdict: '#verdict',
  'min-set-table': '#minset table, #minset',
  'category-table': '#categories table',
  'lang-toggle': '#lang-switch',
  'supplier-requests': '#requests',
};

const TEMPLATE_FILES = [
  'pod35-vstupni-sablona.xlsx', 'pod35-vstupni-sablona.csv', 'prohlaseni-o-puvodu-cs.docx',
  'prohlaseni-o-puvodu-sk.docx', 'prohlaseni-o-puvodu-en.docx', 'README.txt',
];
const TEMPLATE_FIELDS = ['partNo', 'description', 'supplier', 'supplierCountry', 'category', 'qty', 'unitCost',
  'currency', 'origin', 'evidence', 'validUntil', 'expectedOrigin', 'type', 'note'];

const FONT_HOSTS = /fonts\.(googleapis|gstatic)\.com/i;
const STAMP_RE = /VYHOVUJE|NEVYHOVUJE|ZÁLEŽÍ|COMPL|DEPENDS|FAIL|PASS/i;

/* ----------------------------------------------------------------- report */

const results = [];
function record(status, name, detail = '') {
  results.push({ status, name, detail });
  const color = { PASS: '\x1b[32m', FAIL: '\x1b[31m', WARN: '\x1b[33m' }[status];
  const tty = process.stdout.isTTY;
  console.log(`${tty ? color : ''}${status}${tty ? '\x1b[0m' : ''}  ${name}${detail ? `  ${detail}` : ''}`);
}
class Warn extends Error {}
async function check(name, fn) {
  try {
    const detail = await fn();
    record('PASS', name, detail || '');
    return true;
  } catch (err) {
    record(err instanceof Warn ? 'WARN' : 'FAIL', name, String(err && err.message ? err.message : err).split('\n')[0].slice(0, 400));
    return err instanceof Warn;
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

/* ------------------------------------------------------------- playwright */

async function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const tries = [process.env.PLAYWRIGHT_MODULE, '/opt/node22/lib/node_modules/playwright'].filter(Boolean);
  for (const p of tries) {
    try {
      return require(p);
    } catch { /* next */ }
  }
  try {
    return await import('playwright');
  } catch { /* next */ }
  throw new Error('Playwright nenalezen. Nainstalujte ho (npm i -g playwright && npx playwright install chromium) nebo nastavte PLAYWRIGHT_MODULE.');
}

function findChromium() {
  if (process.env.CHROMIUM_PATH && existsSync(process.env.CHROMIUM_PATH)) return process.env.CHROMIUM_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (!existsSync(base)) return null;
  const dirs = readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse();
  for (const d of dirs) {
    for (const exe of ['chrome-linux/chrome', 'chrome-linux64/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-win/chrome.exe']) {
      const p = path.join(base, d, exe);
      if (existsSync(p)) return p;
    }
  }
  return null;
}

async function launch(chromium) {
  if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync('/opt/pw-browsers')) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
  const exe = findChromium();
  const attempts = exe ? [{ executablePath: exe }, {}] : [{}];
  let last;
  for (const opts of attempts) {
    try {
      return await chromium.launch({ headless: !ARGS.has('--headed'), ...opts });
    } catch (err) {
      last = err;
    }
  }
  throw last;
}

/* ---------------------------------------------------------------- helpers */

// Collects console errors, page errors, failed local requests and external requests of a page.
function watch(page, { allowFonts = true } = {}) {
  const w = { errors: [], external: [], fonts: 0 };
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const loc = (msg.location() && msg.location().url) || '';
    if (allowFonts && (FONT_HOSTS.test(loc) || FONT_HOSTS.test(msg.text()))) return;
    w.errors.push(`console: ${msg.text()}${loc ? ` (${loc.slice(0, 100)})` : ''}`);
  });
  page.on('pageerror', (err) => w.errors.push(`pageerror: ${err.message}`));
  page.on('request', (req) => {
    const u = req.url();
    if (/^(data|blob|about|file|chrome|chrome-extension):/i.test(u)) return;
    if (/^https?:\/\/127\.0\.0\.1[:/]/i.test(u) || /^https?:\/\/localhost[:/]/i.test(u)) return;
    if (allowFonts && FONT_HOSTS.test(u)) {
      w.fonts += 1;
      return;
    }
    w.external.push(u);
  });
  return w;
}

async function overflow(page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    const vw = de.clientWidth;
    const sw = Math.max(de.scrollWidth, document.body ? document.body.scrollWidth : 0);
    const offenders = [];
    if (sw > vw + 1) {
      const clipped = (el) => {
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX)) return true;
        }
        return false;
      };
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > vw + 1 && !clipped(el)) {
          const id = el.id ? `#${el.id}` : '';
          const cls = typeof el.className === 'string' && el.className.trim() ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
          offenders.push(`${el.tagName.toLowerCase()}${id}${cls} (right ${Math.round(r.right)}px)`);
          if (offenders.length >= 4) break;
        }
      }
    }
    return { vw, sw, offenders };
  });
}

async function byTestId(page, id) {
  const loc = page.locator(`[data-testid="${id}"]`).first();
  if (await loc.count()) return { loc, fallback: false };
  const fb = page.locator(TESTIDS[id]).first();
  if (await fb.count()) return { loc: fb, fallback: true };
  return { loc: null, fallback: true };
}

async function tableRows(loc) {
  return loc.evaluate((el) => {
    const table = el.matches('table') ? el : el.querySelector('table');
    if (!table) return -1;
    return table.tBodies.length ? [...table.tBodies].reduce((n, b) => n + b.rows.length, 0) : Math.max(0, table.rows.length - 1);
  });
}

async function verdictText(page) {
  const { loc } = await byTestId(page, 'verdict');
  if (!loc) return '';
  return ((await loc.textContent()) || '').replace(/\s+/g, ' ').trim();
}

async function waitVerdict(page) {
  const sel = (await page.locator('[data-testid="verdict"]').count()) ? '[data-testid="verdict"]' : TESTIDS.verdict;
  await page.waitForFunction((s) => {
    const el = document.querySelector(s);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && el.textContent.trim().length > 0;
  }, sel, { timeout: TIMEOUT });
}

async function clickLang(page, lang) {
  const { loc } = await byTestId(page, 'lang-toggle');
  assert(loc, 'přepínač jazyka nenalezen');
  const btn = loc.locator(`[data-setlang="${lang}"]`).first();
  if (await btn.count()) await btn.click();
  else {
    const named = loc.locator(`button, a`).filter({ hasText: new RegExp(`^\\s*${lang === 'cs' ? '(CZ|CS|Česky|Čeština)' : '(EN|English)'}\\s*$`, 'i') }).first();
    if (await named.count()) await named.click();
    else await loc.click();
  }
  await page.waitForFunction((l) => (document.documentElement.lang || '').toLowerCase().startsWith(l), lang, { timeout: 5000 });
}

function httpGet(url) {
  return fetch(url, { redirect: 'follow' }).then(async (r) => ({ status: r.status, text: r.headers.get('content-type')?.includes('html') ? await r.text() : '' }));
}

/* -------------------------------------------------------------- sections */

async function testPages(browser, base) {
  const links = new Map(); // absolute URL without hash -> Set(source pages)
  const anchors = []; // {url, id, from}
  for (const pg of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.route('**/*', (route) => (/^https?:\/\/127\.0\.0\.1[:/]/.test(route.request().url()) ? route.continue() : route.abort()));
    const page = await ctx.newPage();
    page.setDefaultTimeout(TIMEOUT);
    const w = watch(page);
    let resp = null;
    const ok = await check(`${pg.name} ${pg.path}: načte se bez chyb`, async () => {
      resp = await page.goto(base + pg.path, { waitUntil: 'load' });
      assert(resp && resp.status() === 200, `HTTP ${resp ? resp.status() : 'bez odpovědi'} (stránka chybí?)`);
      await page.waitForTimeout(300);
      const html = await page.content();
      const left = html.match(/\{\{[^{}\n]{0,40}\}\}/g);
      assert(!left, `nenahrazené placeholdery: ${left && [...new Set(left)].join(', ')}`);
      assert(!html.includes('{{'), 'stránka obsahuje "{{"');
      const lang = (await page.getAttribute('html', 'lang')) || '';
      assert(lang.toLowerCase().startsWith(pg.lang), `<html lang="${lang}">, čekám "${pg.lang}"`);
      assert((await page.title()).trim(), 'chybí <title>');
      assert(!w.errors.length, w.errors.slice(0, 3).join(' | '));
      assert(!w.external.length, `nečekané externí požadavky: ${w.external.slice(0, 3).join(', ')}`);
      return `${w.fonts ? `(Google Fonts: ${w.fonts}× zablokováno testem)` : ''}`;
    });
    if (ok && resp && resp.status() === 200) {
      const todo = ((await page.content()).match(/\[DOPLNIT/g) || []).length;
      if (todo) record('WARN', `${pg.name}: ${todo}× [DOPLNIT …]`, 'doplňte údaje v config.json před ostrým spuštěním');
      const found = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')));
      for (const href of found) {
        if (!href || /^(mailto|tel|javascript|data|blob):/i.test(href)) continue;
        if (/\[DOPLNIT/i.test(href)) continue; // reported above
        let u;
        try {
          u = new URL(href, base + pg.path);
        } catch {
          continue;
        }
        if (u.origin !== new URL(base).origin) continue;
        const key = u.href.split('#')[0];
        if (!links.has(key)) links.set(key, new Set());
        links.get(key).add(pg.path);
        if (u.hash.length > 1) anchors.push({ url: key, id: decodeURIComponent(u.hash.slice(1)), from: pg.path });
      }
      for (const width of WIDTHS) {
        await check(`${pg.name}: šířka ${width} px bez vodorovného posuvníku`, async () => {
          await page.setViewportSize({ width, height: 800 });
          await page.waitForTimeout(150);
          const o = await overflow(page);
          assert(o.sw <= o.vw + 1, `obsah ${o.sw} px > ${o.vw} px: ${o.offenders.join(', ') || 'viník nenalezen'}`);
        });
      }
    }
    await ctx.close();
  }

  await check(`interní odkazy (${links.size}) vedou na existující soubory`, async () => {
    const broken = [];
    const pagesHtml = new Map();
    for (const [url, from] of links) {
      const r = await httpGet(url).catch((e) => ({ status: String(e.message) }));
      if (r.status !== 200) broken.push(`${url.replace(base, '')} (${r.status}, z ${[...from].join(', ')})`);
      else if (r.text) pagesHtml.set(url, r.text);
    }
    for (const a of anchors) {
      const html = pagesHtml.get(a.url);
      if (html === undefined) continue;
      const re = new RegExp(`\\s(id|name)=["']?${a.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'\\s>]`);
      if (!re.test(html)) broken.push(`${a.url.replace(base, '')}#${a.id} (kotva neexistuje, z ${a.from})`);
    }
    assert(!broken.length, `nefunkční: ${[...new Set(broken)].slice(0, 8).join('; ')}${broken.length > 8 ? ` … (+${broken.length - 8})` : ''}`);
  });
}

async function testCalculator(browser, base) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.route('**/*', (route) => (/^https?:\/\/127\.0\.0\.1[:/]/.test(route.request().url()) ? route.continue() : route.abort()));
  const page = await ctx.newPage();
  page.setDefaultTimeout(TIMEOUT);
  const w = watch(page);
  const url = `${base}/kalkulacka/index.html`;
  const r = await page.goto(url, { waitUntil: 'load' }).catch(() => null);
  if (!r || r.status() !== 200) {
    record('FAIL', 'kalkulačka: stránka se nenačetla', r ? `HTTP ${r.status()}` : '');
    await ctx.close();
    return;
  }

  await check('kalkulačka: data-testid load-sample a lang-toggle', async () => {
    const missing = [];
    for (const id of ['load-sample', 'lang-toggle']) if (!(await page.locator(`[data-testid="${id}"]`).count())) missing.push(id);
    assert(!missing.length, `chybí data-testid: ${missing.join(', ')} (viz README, kontrakt data-testid)`);
  });

  const loaded = await check('kalkulačka: Načíst ukázku zobrazí verdikt', async () => {
    const { loc, fallback } = await byTestId(page, 'load-sample');
    assert(loc, 'tlačítko pro ukázku nenalezeno');
    await loc.click();
    await waitVerdict(page);
    const text = await verdictText(page);
    assert(STAMP_RE.test(text), `verdikt bez razítka: "${text.slice(0, 80)}"`);
    const stamps = await page.locator('.stamp').allTextContents().catch(() => []);
    return `${stamps.length ? `razítka: ${[...new Set(stamps.map((s) => s.trim()))].join(' / ')}` : ''}${fallback ? ' (náhradní selektor)' : ''}`;
  });

  if (loaded) {
    await check('kalkulačka: data-testid verdict, min-set-table, category-table, supplier-requests', async () => {
      const missing = [];
      for (const id of ['verdict', 'min-set-table', 'category-table', 'supplier-requests']) {
        if (!(await page.locator(`[data-testid="${id}"]`).count())) missing.push(id);
      }
      assert(!missing.length, `chybí data-testid: ${missing.join(', ')}`);
    });

    await check('kalkulačka: tabulka kategorií má řádky', async () => {
      const { loc } = await byTestId(page, 'category-table');
      assert(loc, 'tabulka kategorií nenalezena');
      const n = await tableRows(loc);
      assert(n > 0, `řádků: ${n}`);
      return `${n} řádků`;
    });

    await check('kalkulačka: minimální sada dokladů', async () => {
      const { loc } = await byTestId(page, 'min-set-table');
      assert(loc, 'minimální sada nenalezena');
      const n = await tableRows(loc);
      const text = ((await loc.textContent()) || '').trim();
      assert(n > 0 || text.length > 0, 'prázdná');
      return n >= 0 ? `${n} řádků` : 'bez tabulky (náhrada nebo hláška)';
    });

    await check('kalkulačka: žádosti dodavatelům', async () => {
      const { loc } = await byTestId(page, 'supplier-requests');
      assert(loc, 'sekce nenalezena');
      const text = ((await loc.textContent()) || '').trim();
      assert(text.length > 0, 'prázdná');
    });

    await check('kalkulačka: prohlášení dodavatele se otevře v novém okně', async () => {
      const { loc } = await byTestId(page, 'supplier-requests');
      const btn = loc.locator('button, a').filter({ hasText: /^\s*(CZ|Prohlášení CZ)\s*$/ }).first();
      if (!(await btn.count())) throw new Warn('tlačítko „CZ“ u dodavatele nenalezeno, přeskočeno');
      const [popup] = await Promise.all([page.waitForEvent('popup', { timeout: TIMEOUT }), btn.click()]);
      await popup.waitForLoadState('load');
      const body = (await popup.textContent('body')) || '';
      await popup.close();
      assert(/nepreferenčním původu/i.test(body) && /952\/2013/.test(body), 'dokument neobsahuje text prohlášení');
    });

    for (const width of WIDTHS) {
      await check(`kalkulačka s daty: šířka ${width} px bez vodorovného posuvníku`, async () => {
        await page.setViewportSize({ width, height: 800 });
        await page.waitForTimeout(200);
        const o = await overflow(page);
        assert(o.sw <= o.vw + 1, `obsah ${o.sw} px > ${o.vw} px: ${o.offenders.join(', ') || 'viník nenalezen'}`);
      });
    }
    await page.setViewportSize({ width: 1280, height: 900 });

    await check('kalkulačka: přepnutí CZ → EN → CZ', async () => {
      const csHeading = ((await page.textContent('h1')) || '').trim();
      const csVerdict = await verdictText(page);
      await clickLang(page, 'en');
      await page.waitForTimeout(200);
      const enHeading = ((await page.textContent('h1')) || '').trim();
      const enVerdict = await verdictText(page);
      assert(enHeading && enHeading !== csHeading, `nadpis se nezměnil („${enHeading}“)`);
      assert(enVerdict && enVerdict !== csVerdict, 'verdikt se nepřeložil');
      await clickLang(page, 'cs');
      await page.waitForTimeout(200);
      const back = ((await page.textContent('h1')) || '').trim();
      assert(back === csHeading, `po návratu na CZ: „${back}“`);
      return `„${csHeading}“ ↔ „${enHeading}“`;
    });
  }

  await check('kalkulačka: bez chyb v konzoli a bez externích požadavků', async () => {
    assert(!w.errors.length, w.errors.slice(0, 3).join(' | '));
    assert(!w.external.length, `externí požadavky: ${w.external.slice(0, 3).join(', ')}`);
  });
  await ctx.close();
}

// Contrast of visible text against its effective background (WCAG formula). Returns the worst cases.
function contrastProbe() {
  const parse = (c) => {
    const m = /rgba?\(([^)]+)\)/.exec(c || '');
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const blend = (t, b) => ({ r: t.r * t.a + b.r * (1 - t.a), g: t.g * t.a + b.g * (1 - t.a), b: t.b * t.a + b.b * (1 - t.a), a: 1 });
  const bgOf = (el) => {
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
    }
    let bg = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) bg = blend(layers[i], bg);
    return bg;
  };
  const low = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!el.offsetParent || el.closest('.sr-only, [aria-hidden="true"]')) continue;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || Number(cs.opacity) < 0.6) continue;
    const bg = bgOf(el);
    const fg = blend(parse(cs.color), bg);
    const a = lum(fg);
    const b = lum(bg);
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    if (ratio < 3) low.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} „${el.textContent.trim().slice(0, 24)}“ ${ratio.toFixed(2)}`);
  }
  return low;
}

// Interactions a customer goes through: paste from Excel, rule packs, inline edits, filter,
// exports, project round trip, copy fallback, print CSS, dark mode.
async function testCalculatorFlows(browser, base) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  await ctx.route('**/*', (route) => (/^https?:\/\/127\.0\.0\.1[:/]/.test(route.request().url()) ? route.continue() : route.abort()));
  const page = await ctx.newPage();
  page.setDefaultTimeout(TIMEOUT);
  const w = watch(page);
  const r = await page.goto(`${base}/kalkulacka/index.html`, { waitUntil: 'load' }).catch(() => null);
  if (!r || r.status() !== 200) {
    await ctx.close();
    return;
  }
  const stamp = async () => ((await page.locator('#verdict .stamp').textContent().catch(() => '')) || '').trim();
  const verdictTxt = async () => ((await page.locator('#verdict').innerText().catch(() => '')) || '').replace(/\s+/g, ' ');

  await check('kalkulačka: vložení z Excelu (TSV s nadpisem nad záhlavím) a přiřazení sloupců', async () => {
    const tsv = [
      ['Kusovník – test'],
      ['Číslo dílu', 'Dodavatel', 'Země dodavatele', 'Množství', 'Jednotková cena', 'Měna', 'Země původu', 'Doklad', 'Typ'],
      ['T-1', 'Alfa s.r.o.', 'CZ', '1', '120 000', 'CZK', 'CZ', 'prohlášení dodavatele', 'tier-1'],
      ['T-2', 'Beta GmbH', 'DE', '4', '1 250,50', 'CZK', 'US', 'celní doklad', 'tier-1'],
      ['T-3', 'Gamma Inc.', 'US', '1', '2 400', 'EUR', '', '', 'tier-1'],
      ['T-4', 'Delta a.s.', 'SK', '2', '3 500', 'CZK', 'N/A', '', 'tier-1'],
      ['T-5', 'vlastní výroba', 'CZ', '1', '40 000', 'CZK', '', '', 'vlastní výroba'],
    ].map((row) => row.join('\t')).join('\n');
    await page.fill('#paste-area', tsv);
    await page.click('#btn-paste');
    await page.waitForFunction(() => document.querySelectorAll('#ln-body tr').length === 5);
    assert(await page.locator('#mapping').isVisible(), 'přiřazení sloupců se nezobrazilo');
    const originCol = page.locator('#mapping select[data-col="6"]');
    assert((await originCol.inputValue()) === 'origin', `sloupec 7 přiřazen jako „${await originCol.inputValue()}“, čekám origin`);
    const before = await verdictTxt();
    await originCol.selectOption('');
    await page.waitForTimeout(100);
    assert((await verdictTxt()) !== before, 'změna přiřazení nepřepočítala výsledek');
    await page.locator('#mapping select[data-col="6"]').selectOption('origin');
    await page.waitForTimeout(100);
    assert((await verdictTxt()) === before, 'po vrácení přiřazení se výsledek liší');
    return `razítko: ${await stamp()}`;
  });

  const sample = await check('kalkulačka: pravidla SAFE, UASL, EDIP, EDIP_USI, EU_CANADA', async () => {
    await page.click('#btn-sample');
    await page.waitForFunction(() => document.querySelectorAll('#ln-body tr').length > 20);
    const out = [];
    for (const pack of ['EDIP', 'EDIP_USI', 'EU_CANADA', 'UASL', 'SAFE']) {
      await page.selectOption('#set-pack', pack);
      await page.waitForTimeout(80);
      const st = await stamp();
      assert(STAMP_RE.test(st), `${pack}: bez razítka`);
      if (pack === 'EU_CANADA') assert(await page.locator('.bar--stack').count() > 0, 'EU_CANADA: chybí pruhy podílů domácí / CA / ostatní');
      out.push(`${pack} ${(await page.locator('#minset tbody tr').count())} ř.`);
    }
    return `minimální sada: ${out.join(', ')}`;
  });

  if (sample) {
    await check('kalkulačka: úprava země původu a dokladu v tabulce řádků', async () => {
      const idx = await page.locator('#ln-body tr.st-unknown').first().getAttribute('data-idx');
      assert(idx !== null, 'žádný řádek s neznámým původem');
      const before = await verdictTxt();
      const input = page.locator(`#ln-${idx} input[data-f="origin"]`);
      await input.fill('Německo');
      await input.press('Tab');
      await page.waitForTimeout(150);
      assert((await input.inputValue()) === 'DE', `normalizace: „${await input.inputValue()}“`);
      await page.locator(`#ln-${idx} select[data-f="evidence"]`).selectOption('declaration');
      await page.waitForTimeout(150);
      const cls = await page.locator(`#ln-${idx}`).getAttribute('class');
      assert(/st-documented/.test(cls), `stav řádku po úpravě: ${cls}`);
      assert((await verdictTxt()) !== before, 'výsledek se po úpravě nepřepočítal');
    });

    await check('kalkulačka: filtr „Jen nedoložené“', async () => {
      const all = await page.locator('#ln-body tr').count();
      await page.check('#ln-only');
      await page.waitForTimeout(80);
      const n = await page.locator('#ln-body tr').count();
      const documented = await page.locator('#ln-body tr.st-documented').count();
      await page.uncheck('#ln-only');
      assert(n > 0 && n < all && documented === 0, `${all} → ${n}, doložených ve filtru ${documented}`);
      return `${all} → ${n} řádků`;
    });

    await check('kalkulačka: kopírování bez schránky ukáže náhradní okno', async () => {
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
        document.execCommand = () => false;
      });
      await page.click('#btn-copy-cat');
      await page.waitForTimeout(100);
      const open1 = await page.locator('#copy-dialog').evaluate((d) => d.open);
      const text = await page.locator('#copy-dialog-text').inputValue();
      await page.keyboard.press('Escape');
      await page.locator('#requests button[data-act="mail"]').first().click();
      await page.waitForTimeout(100);
      const open2 = await page.locator('#copy-dialog').evaluate((d) => d.open);
      await page.keyboard.press('Escape');
      assert(open1 && open2 && text.includes('\t'), `okno: tabulka ${open1}, e-mail ${open2}`);
    });

    let project = null;
    await check('kalkulačka: export CSV a uložení projektu (JSON) spustí stažení', async () => {
      const [csv] = await Promise.all([page.waitForEvent('download'), page.click('#btn-csv')]);
      const [json] = await Promise.all([page.waitForEvent('download'), page.click('#btn-save')]);
      assert(/\.csv$/.test(csv.suggestedFilename()) && /\.json$/.test(json.suggestedFilename()), 'špatné přípony');
      project = await json.path();
      return `${csv.suggestedFilename()}, ${json.suggestedFilename()}`;
    });

    if (project) {
      await check('kalkulačka: načtení uloženého projektu obnoví stejný výsledek', async () => {
        const before = await verdictTxt();
        const p2 = await ctx.newPage();
        const w2 = watch(p2);
        await p2.goto(`${base}/kalkulacka/index.html`, { waitUntil: 'load' });
        await p2.setInputFiles('#project-input', project);
        await p2.waitForSelector('#verdict .stamp');
        const after = ((await p2.locator('#verdict').innerText()) || '').replace(/\s+/g, ' ');
        await p2.close();
        assert(after === before, 'výsledek po načtení projektu se liší');
        assert(!w2.errors.length, w2.errors.slice(0, 2).join(' | '));
      });
    }

    await check('kalkulačka: tisková verze (print CSS)', async () => {
      await page.emulateMedia({ media: 'print' });
      const css = await page.evaluate(() => ({
        topbar: getComputedStyle(document.querySelector('.topbar')).display,
        data: getComputedStyle(document.querySelector('#sec-data')).display,
        head: getComputedStyle(document.querySelector('.print-head')).display,
      }));
      await page.emulateMedia({ media: null });
      assert(css.topbar === 'none' && css.data === 'none' && css.head === 'block', JSON.stringify(css));
    });
  }

  await check('kalkulačka: bez chyb v konzoli při práci s daty', async () => {
    assert(!w.errors.length, w.errors.slice(0, 3).join(' | '));
    assert(!w.external.length, `externí požadavky: ${w.external.slice(0, 3).join(', ')}`);
  });
  await ctx.close();

  for (const scheme of ['dark', 'light']) {
    await check(`kalkulačka: kontrast textu (${scheme === 'dark' ? 'tmavý' : 'světlý'} režim)`, async () => {
      const c = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: scheme });
      await c.route('**/*', (route) => (/^https?:\/\/127\.0\.0\.1[:/]/.test(route.request().url()) ? route.continue() : route.abort()));
      const p = await c.newPage();
      await p.goto(`${base}/kalkulacka/index.html`, { waitUntil: 'load' });
      await p.click('#btn-sample');
      await p.waitForSelector('#verdict .stamp');
      const low = await p.evaluate(contrastProbe);
      await c.close();
      assert(!low.length, `kontrast pod 3:1: ${low.slice(0, 5).join('; ')}`);
    });
  }
}

async function testOffline(browser) {
  if (!existsSync(OFFLINE)) {
    record('FAIL', 'offline: soubor neexistuje', path.relative(ROOT, OFFLINE));
    return;
  }
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  await ctx.setOffline(true);
  const page = await ctx.newPage();
  page.setDefaultTimeout(TIMEOUT);
  const w = watch(page, { allowFonts: false });
  const network = [];
  ctx.on('request', (req) => {
    if (!/^(data|blob|about|file):/i.test(req.url())) network.push(req.url());
  });

  const loaded = await check('offline (file://): načte ukázku a ukáže verdikt', async () => {
    await page.goto(pathToFileURL(OFFLINE).href, { waitUntil: 'load' });
    const { loc } = await byTestId(page, 'load-sample');
    assert(loc, 'tlačítko pro ukázku nenalezeno');
    await loc.click();
    await waitVerdict(page);
    const text = await verdictText(page);
    assert(STAMP_RE.test(text), `verdikt bez razítka: "${text.slice(0, 80)}"`);
    const { loc: cat } = await byTestId(page, 'category-table');
    const n = cat ? await tableRows(cat) : 0;
    assert(n > 0, 'tabulka kategorií je prázdná');
    return `${(readFileSync(OFFLINE).length / 1024).toFixed(0)} kB, kategorie: ${n} řádků`;
  });

  const hasXlsx = await page.evaluate(() => typeof window.XLSX === 'object' && Boolean(window.XLSX.utils)).catch(() => false);
  await check('offline: SheetJS je vložený', async () => {
    if (!hasXlsx) throw new Warn('window.XLSX chybí (build bez SheetJS), XLSX import a export offline nepůjde');
  });

  if (loaded && hasXlsx) {
    await check('offline: export XLSX', async () => {
      const btn = page.locator('[data-testid="export-xlsx"], #btn-xlsx').first();
      if (!(await btn.count())) throw new Warn('tlačítko exportu XLSX nenalezeno, přeskočeno');
      const [dl] = await Promise.all([page.waitForEvent('download', { timeout: TIMEOUT }), btn.click()]);
      const name = dl.suggestedFilename();
      assert(/\.xlsx$/i.test(name), `stažený soubor: ${name}`);
      return name;
    });

    await check('offline: import vstupní šablony XLSX (3 ukázkové řádky)', async () => {
      const input = page.locator('[data-testid="file-input"], #file-input').first();
      if (!(await input.count())) throw new Warn('pole pro nahrání souboru nenalezeno, přeskočeno');
      const before = await verdictText(page);
      await input.setInputFiles(path.join(DIST, 'sablony', 'pod35-vstupni-sablona.xlsx'));
      const body = page.locator('#ln-body');
      if (await body.count()) {
        await page.waitForFunction(() => document.querySelectorAll('#ln-body tr').length === 3, null, { timeout: TIMEOUT });
      } else {
        await page.waitForFunction((b) => {
          const el = document.querySelector('[data-testid="verdict"]') || document.querySelector('#verdict');
          return el && el.textContent.replace(/\s+/g, ' ').trim() !== b;
        }, before, { timeout: TIMEOUT });
      }
      const status = ((await page.textContent('#data-status').catch(() => '')) || '').replace(/\s+/g, ' ').trim();
      return status.slice(0, 80);
    });
  }

  await check('offline: žádné síťové požadavky, žádné chyby', async () => {
    assert(!network.length, `síťové požadavky: ${network.slice(0, 3).join(', ')}`);
    assert(!w.errors.length, w.errors.slice(0, 3).join(' | '));
  });
  await ctx.close();
}

async function testTemplates() {
  await check('šablony: soubory v dist/sablony/', async () => {
    const missing = TEMPLATE_FILES.filter((f) => !existsSync(path.join(DIST, 'sablony', f)));
    assert(!missing.length, `chybí: ${missing.join(', ')} (spusťte npm run templates)`);
    for (const f of TEMPLATE_FILES.filter((x) => /\.(xlsx|docx)$/.test(x))) {
      const head = readFileSync(path.join(DIST, 'sablony', f)).subarray(0, 4);
      assert(head.equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])), `${f} není platný soubor Office (ZIP)`);
    }
    return `${TEMPLATE_FILES.length} souborů`;
  });

  await check('šablony: calc-core rozpozná sloupce a hodnoty CSV šablony', async () => {
    const core = await import(pathToFileURL(path.join(DIST, 'assets', 'js', 'calc-core.js')).href);
    const csvPath = path.join(DIST, 'sablony', 'pod35-vstupni-sablona.csv');
    const raw = readFileSync(csvPath);
    assert(raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf, 'CSV nemá BOM');
    const rows = core.parseTable(raw.toString('utf8'));
    const map = core.detectColumns(rows[0]);
    const wrong = TEMPLATE_FIELDS.filter((f, i) => map[f] !== i);
    assert(!wrong.length, `nerozpoznané nebo špatně přiřazené sloupce: ${wrong.join(', ')}`);
    const { lines, errors } = core.rowsToLines(rows.slice(1), map, { currency: 'CZK' });
    assert(lines.length === 3, `řádků ${lines.length}, čekám 3`);
    assert(!errors.length, `chyby: ${JSON.stringify(errors).slice(0, 200)}`);
    const unknown = lines.filter((l) => !l.category || !l.type);
    assert(!unknown.length, 'kategorie nebo typ nerozpoznány');
    return `${TEMPLATE_FIELDS.length} sloupců, 3 řádky`;
  });
}

async function testSources() {
  await check('zdroj: ceny nejsou v site/ natvrdo (jen {{PRICE_*}})', async () => {
    const cfg = JSON.parse(readFileSync(path.join(ROOT, 'config.json'), 'utf8'));
    const prices = [...Object.values(cfg.prices || {}), ...Object.values(cfg.prices_en || {})]
      .map(String).filter((v) => /\d/.test(v) && v.length >= 5);
    const norm = (t) => t.replace(/[\u00a0\u202f]/g, ' ');
    const hits = [];
    const walk = (dir) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(html|js|css|txt|svg)$/i.test(e.name)) {
          norm(readFileSync(p, 'utf8')).split('\n').forEach((line, i) => {
            for (const v of prices) if (line.includes(v)) hits.push(`${path.relative(ROOT, p)}:${i + 1} „${v}“`);
          });
        }
      }
    };
    walk(path.join(ROOT, 'site'));
    assert(!hits.length, `ceny natvrdo: ${hits.slice(0, 6).join(', ')}`);
  });

  await check('dist: anglické stránky mají ceny v EUR, české v Kč', async () => {
    const cfg = JSON.parse(readFileSync(path.join(ROOT, 'config.json'), 'utf8'));
    const cs = Object.values(cfg.prices || {}).map(String);
    const en = Object.values(cfg.prices_en || {}).map(String);
    const wrong = [];
    const scan = (rel, bad) => {
      const f = path.join(DIST, rel);
      if (!existsSync(f)) return;
      const t = readFileSync(f, 'utf8');
      for (const v of bad) if (v && t.includes(v)) wrong.push(`${rel}: ${v}`);
    };
    for (const p of PAGES) scan(p.path.slice(1), p.lang === 'en' ? cs.filter((v) => !en.includes(v)) : en.filter((v) => !cs.includes(v)));
    assert(!wrong.length, wrong.slice(0, 6).join(', '));
  });
}

/* ------------------------------------------------------------------- main */

async function main() {
  console.log('Pod35 e2e\n');
  if (!ARGS.has('--no-build')) {
    const b = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'build.mjs')], { cwd: ROOT, encoding: 'utf8' });
    if (b.status !== 0) {
      record('FAIL', 'build', (b.stderr || b.stdout || '').trim().split('\n').slice(-6).join(' | '));
      return summary();
    }
    const warns = (b.stderr || '').split('\n').filter((l) => l.startsWith('VAROVÁNÍ')).length;
    record('PASS', 'build', warns ? `(${warns} varování, viz npm run build)` : '');
  }
  assert(existsSync(DIST), 'dist/ neexistuje, spusťte npm run build');

  await testSources();
  await testTemplates();

  const { serveDir } = await import(pathToFileURL(path.join(ROOT, 'tools', 'build.mjs')).href);
  const { server, url } = await serveDir(DIST, 0);
  let browser;
  try {
    const pw = await loadPlaywright();
    browser = await launch(pw.chromium);
    record('PASS', 'prohlížeč', `Chromium ${browser.version()}`);
    await testPages(browser, url);
    await testCalculator(browser, url);
    await testCalculatorFlows(browser, url);
    await testOffline(browser);
  } catch (err) {
    record('FAIL', 'běh testu', String(err && err.stack ? err.stack : err).split('\n').slice(0, 3).join(' | '));
  } finally {
    if (browser) await browser.close();
    server.close();
  }
  return summary();
}

function summary() {
  const n = (s) => results.filter((r) => r.status === s).length;
  const failed = n('FAIL');
  console.log(`\n${'-'.repeat(60)}`);
  console.log(`${failed ? 'FAIL' : 'PASS'}: ${n('PASS')} prošlo, ${failed} selhalo, ${n('WARN')} varování`);
  if (failed) {
    console.log('\nSelhalo:');
    for (const r of results.filter((x) => x.status === 'FAIL')) console.log(`  - ${r.name}${r.detail ? `: ${r.detail}` : ''}`);
  }
  process.exitCode = failed ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
