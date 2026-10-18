// Pod35 calculator UI. Runs entirely in the browser. The only network request it can make is the
// lazy load of SheetJS from cdnjs when the user uploads or exports an XLSX file.
import {
  CATEGORIES, RULE_PACKS, DEFAULT_RISK, parseTable, detectColumns, rowsToLines,
  lineCost, lineStatus, analyze, toCsv,
} from './calc-core.js';
import { EU27, normalizeCountry, countryName, ALL_ISO2 } from './countries.js';
import { declarationHtml, requestEmail } from './declaration.js';
import { LANGS, LOCALES, translate, plural } from './i18n.js';

/* ------------------------------------------------------------------ constants */

const SAMPLE_URL = '../assets/sample/ukazka-kusovnik.csv';
const XLSX_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
const XLSX_SRI = 'sha512-r22gChDnGvBylk90+2e/ycr3RVrDi8DIOkIGNhJlKfuyQM4tIRAI062MaV8sfjQKYVGjOBaZBOA87z+IhZE9DA==';
const LANG_KEY = 'pod35.lang';
const DEFAULT_CURRENCY = 'CZK';
const DEFAULT_FX = { CZK: 1, EUR: 25, USD: 23, GBP: 29.5, CHF: 26.5, PLN: 5.9 };
const FIELDS = ['partNo', 'description', 'supplier', 'supplierCountry', 'category', 'type', 'qty', 'unitCost', 'totalCost', 'currency', 'origin', 'evidence', 'validUntil', 'expectedOrigin', 'note', 'id'];
const EVIDENCE = ['customs', 'declaration', 'contract', 'assumed', 'none'];
const TYPES = ['tier1', 'inhouse', 'raw'];
const SCENARIOS = ['worst', 'expected', 'best'];
const STATUSES = ['documented', 'stated', 'unknown'];
const PREVIEW_ROWS = 6;
const MAX_RENDER = 1500;
const WARN_SHOWN = 12;
const DECL_LANGS = ['cs', 'sk', 'en'];
const LANG_CODE = { cs: 'CZ', sk: 'SK', en: 'EN' };

const BRAND = (document.documentElement.dataset.brand || '').trim();

/* ---------------------------------------------------------------------- state */

const state = {
  lang: 'cs',
  source: null, // { name, rows: string[][], headerIdx, mapping }
  lines: [],
  errors: [],
  implicitCurrency: true,
  settings: {
    pack: 'SAFE',
    currency: DEFAULT_CURRENCY,
    fx: { ...DEFAULT_FX },
    today: todayIso(),
    risk: Array.isArray(DEFAULT_RISK) ? [...DEFAULT_RISK] : ['RU', 'BY', 'IR', 'KP'],
    buyer: '',
    deadline: addDays(todayIso(), 14),
  },
  result: null,
  calcError: null,
  filter: { onlyUndoc: false, q: '' },
  idIndex: new Map(),
  minSet: new Set(),
};

/* -------------------------------------------------------------------- helpers */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function t(key, vars) {
  return translate(state.lang, key, { brand: BRAND, ...vars });
}

function tp(key, n) {
  return plural(state.lang, key, n, fmtInt(n));
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(iso, days) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return '';
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3] + days));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function isIsoDate(v) {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function num(v) {
  return typeof v === 'number' && Number.isFinite(v) ? v : NaN;
}

function debounce(fn, ms) {
  let h;
  return (...args) => {
    clearTimeout(h);
    h = setTimeout(() => fn(...args), ms);
  };
}

const nfCache = new Map();
function nf(opts) {
  const key = state.lang + JSON.stringify(opts);
  let f = nfCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(LOCALES[state.lang] || 'cs-CZ', opts);
    nfCache.set(key, f);
  }
  return f;
}

function fmtNum(n, digits) {
  if (!Number.isFinite(n)) return '–';
  const d = digits ?? (Math.abs(n) < 100 && !Number.isInteger(n) ? 2 : 0);
  return nf({ minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
}

function fmtInt(n) {
  return Number.isFinite(n) ? nf({ maximumFractionDigits: 0 }).format(n) : String(n);
}

function fmtMoney(n) {
  return Number.isFinite(n) ? `${fmtNum(n)} ${state.settings.currency}` : '–';
}

function fmtPct(r) {
  return Number.isFinite(r) ? nf({ style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(r) : '–';
}

function fmtPct0(r) {
  return Number.isFinite(r) ? nf({ style: 'percent', maximumFractionDigits: 1 }).format(r) : '–';
}

function fmtDate(iso) {
  if (!isIsoDate(iso)) return iso || '';
  const [y, m, d] = iso.split('-').map(Number);
  try {
    return new Intl.DateTimeFormat(LOCALES[state.lang], { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC' })
      .format(new Date(Date.UTC(y, m - 1, d)));
  } catch {
    return iso;
  }
}

function plainNum(n, digits = 2) {
  // locale decimal separator, no grouping: pastes cleanly into Excel and Word
  if (!Number.isFinite(n)) return '';
  return nf({ minimumFractionDigits: 0, maximumFractionDigits: digits, useGrouping: false }).format(n);
}

function plainPct(r) {
  if (!Number.isFinite(r)) return '';
  return nf({ style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1, useGrouping: false }).format(r);
}

function cname(code) {
  if (!code) return '';
  try {
    return countryName(code, state.lang) || code;
  } catch {
    return code;
  }
}

function ccHtml(code, withName = true) {
  if (!code) return '<span class="muted">–</span>';
  const name = cname(code);
  return `<span class="cc" title="${esc(name)}">${esc(code)}</span>${withName && name && name !== code ? ` <span class="cc__name">${esc(name)}</span>` : ''}`;
}

/* ------------------------------------------------------------ domain helpers */

function packOf(id) {
  return RULE_PACKS[id] || RULE_PACKS.SAFE || Object.values(RULE_PACKS)[0] || {};
}

function packLabel(p) {
  return (p && (p[state.lang] || p.cs || p.en || p.id)) || '';
}

function packThreshold() {
  const th = num(packOf(state.settings.pack).threshold);
  return Number.isFinite(th) ? th : 0.35;
}

function isCanada() {
  return packOf(state.settings.pack).kind === 'canada';
}

function homeList(p) {
  const h = p.home instanceof Set ? Array.from(p.home) : Array.isArray(p.home) ? p.home : [];
  const extra = h.filter((c) => c !== 'EU' && !EU27.includes(c)).sort();
  return `EU27${extra.length ? ` + ${extra.join(', ')}` : ''}`;
}

function numericFx() {
  const out = {};
  for (const [code, rate] of Object.entries(state.settings.fx)) {
    if (Number.isFinite(rate) && rate > 0) out[code] = rate;
  }
  out[state.settings.currency] = 1;
  return out;
}

function costOf(line) {
  try {
    const c = lineCost(line, numericFx(), state.settings.currency);
    return Number.isFinite(c) ? c : NaN;
  } catch {
    return NaN;
  }
}

function statusOf(line) {
  try {
    return lineStatus(line, state.settings.today) || 'unknown';
  } catch {
    return 'unknown';
  }
}

function typeOf(line) {
  return TYPES.includes(line.type) ? line.type : 'tier1';
}

function effOrigin(line) {
  return line.origin || line.expectedOrigin || line.supplierCountry || null;
}

function lineRef(line) {
  return line.partNo || line.description || line.id || '';
}

function lineById(id) {
  const i = state.idIndex.get(String(id));
  return i === undefined ? null : state.lines[i];
}

function categoryLabel(id) {
  if (!id) return t('cat.none');
  const c = CATEGORIES.find((x) => x.id === id);
  return c ? c[state.lang] || c.cs : id;
}

function isUndocumented(line) {
  return typeOf(line) === 'tier1' && statusOf(line) !== 'documented';
}

function reindex() {
  state.idIndex = new Map();
  state.lines.forEach((l, i) => {
    if (l.id === undefined || l.id === null || l.id === '') l.id = `L${i + 1}`;
    state.idIndex.set(String(l.id), i);
  });
}

/* ----------------------------------------------------------------- language */

function initialLang() {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q && LANGS.includes(q)) return q;
  } catch { /* ignore */ }
  const hash = (location.hash || '').replace('#', '');
  if (LANGS.includes(hash)) return hash;
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && LANGS.includes(saved)) return saved;
  } catch { /* storage blocked */ }
  return 'cs';
}

function setLang(lang) {
  if (!LANGS.includes(lang) || lang === state.lang) return;
  state.lang = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch { /* storage blocked */ }
  try {
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', lang);
      history.replaceState(null, '', url);
    }
  } catch { /* file:// or sandboxed */ }
  applyStatic();
  renderSettings();
  renderMapping();
  renderErrors();
  buildDatalist();
  renderAll(true);
}

function applyStatic() {
  const L = state.lang;
  document.documentElement.lang = L;
  document.title = t('doc.title');
  const desc = $('meta[name="description"]');
  if (desc) desc.setAttribute('content', t('doc.description'));
  for (const el of $$('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of $$('[data-i18n-attr]')) {
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':');
      if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
    }
  }
  for (const el of $$('[data-href-cs]')) {
    const href = el.dataset[`href${L === 'en' ? 'En' : 'Cs'}`];
    if (href) el.setAttribute('href', href);
  }
  for (const b of $$('#lang-switch [data-setlang]')) b.setAttribute('aria-pressed', String(b.dataset.setlang === L));
}

/* ------------------------------------------------------------------- toasts */

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 4200);
}

function setStatus(el, html, kind = '') {
  if (!el) return;
  el.className = `status${kind ? ` status--${kind}` : ''}`;
  el.innerHTML = html;
}

/* ---------------------------------------------------------------- clipboard */

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through */ }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.className = 'offscreen';
  document.body.append(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch { ok = false; }
  ta.remove();
  if (ok) return true;
  showCopyDialog(text);
  return false;
}

function showCopyDialog(text) {
  const dlg = $('#copy-dialog');
  const ta = $('#copy-dialog-text');
  ta.value = text;
  if (dlg && typeof dlg.showModal === 'function') {
    if (!dlg.open) dlg.showModal();
  } else if (dlg) {
    dlg.setAttribute('open', '');
  }
  ta.focus();
  ta.select();
}

/* --------------------------------------------------------------- downloads */

function download(name, content, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.rel = 'noopener';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/* ---------------------------------------------------------- SheetJS (lazy) */

let xlsxPromise = null;
function loadXlsx() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (!xlsxPromise) {
    xlsxPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = XLSX_SRC;
      s.integrity = XLSX_SRI;
      s.crossOrigin = 'anonymous';
      s.referrerPolicy = 'no-referrer';
      s.async = true;
      s.onload = () => (window.XLSX ? resolve(window.XLSX) : reject(new Error('XLSX')));
      s.onerror = () => {
        xlsxPromise = null;
        s.remove();
        reject(new Error('XLSX'));
      };
      document.head.append(s);
    });
  }
  return xlsxPromise;
}

function cellToString(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return '';
    const d = new Date(v.getTime() + 12 * 3600 * 1000); // absorb SheetJS sub-day drift
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '';
  return String(v);
}

/* -------------------------------------------------------------- data import */

function decodeText(buf) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    try {
      return new TextDecoder('windows-1250').decode(buf);
    } catch {
      return new TextDecoder().decode(buf);
    }
  }
}

function normalizeMapping(m) {
  const out = { ...(m || {}) };
  for (const f of FIELDS) {
    const v = out[f];
    out[f] = Number.isInteger(v) && v >= 0 ? v : null;
  }
  return out;
}

function headerScore(row) {
  try {
    const m = detectColumns(row.map((c) => String(c ?? '')));
    return Object.values(m || {}).filter((v) => Number.isInteger(v) && v >= 0).length;
  } catch {
    return 0;
  }
}

function findHeader(rows) {
  let best = 0;
  let bestScore = -1;
  const limit = Math.min(rows.length, 15);
  for (let i = 0; i < limit; i++) {
    const s = headerScore(rows[i]);
    if (s > bestScore) {
      best = i;
      bestScore = s;
    }
  }
  return { index: best, score: Math.max(bestScore, 0) };
}

function cleanRows(rows) {
  return (rows || [])
    .map((r) => (Array.isArray(r) ? r.map((c) => cellToString(c)) : []))
    .filter((r) => r.some((c) => c.trim() !== ''));
}

function setSource(name, rawRows) {
  const rows = cleanRows(rawRows);
  if (rows.length < 2) {
    setStatus($('#data-status'), esc(t('data.empty')), 'bad');
    return;
  }
  const { index } = findHeader(rows);
  let mapping;
  try {
    mapping = normalizeMapping(detectColumns(rows[index].map(String)));
  } catch {
    mapping = normalizeMapping({});
  }
  state.source = { name, rows, headerIdx: index, mapping };
  buildLinesFromSource();
  afterDataLoaded('data.loaded', name);
}

function buildLinesFromSource() {
  const src = state.source;
  if (!src) return;
  // Pass the header row too: calc-core skips it and reads a currency from the cost header ("Cena (EUR)").
  const rows = src.rows.slice(src.headerIdx);
  let res;
  try {
    res = rowsToLines(rows, src.mapping, { currency: state.settings.currency, hasHeader: true }) || {};
  } catch (err) {
    res = { lines: [], errors: [String(err && err.message ? err.message : err)] };
  }
  state.lines = Array.isArray(res.lines) ? res.lines : [];
  state.errors = Array.isArray(res.errors) ? res.errors : [];
  state.errorRowOffset = src.headerIdx;
  state.implicitCurrency = src.mapping.currency === null;
  reindex();
  ensureFxForLines();
}

function afterDataLoaded(msgKey, sourceName) {
  state.filter = { onlyUndoc: false, q: '' };
  $('#ln-only').checked = false;
  $('#ln-search').value = '';
  recompute();
  renderSettings();
  renderMapping();
  renderErrors();
  renderAll(true);
  const parts = [esc(t(msgKey, { source: sourceName, rows: tp('rows', state.lines.length) }))];
  if (state.source && state.source.mapping.unitCost === null) parts.push(esc(t('data.noCost')));
  if (state.lines.length) parts.push(`<a href="#sec-results" class="status__link">${esc(t('data.toResults'))}</a>`);
  setStatus($('#data-status'), parts.join(' '), state.lines.length ? 'ok' : 'bad');
}

async function handleFile(file) {
  if (!file) return;
  const name = file.name || 'data';
  const ext = (name.split('.').pop() || '').toLowerCase();
  const status = $('#data-status');
  try {
    if (ext === 'json') {
      await loadProjectFile(file);
      return;
    }
    if (['xlsx', 'xls', 'xlsm', 'ods'].includes(ext)) {
      setStatus(status, esc(t('ex.xlsxLoading')));
      let XLSX;
      try {
        XLSX = await loadXlsx();
      } catch {
        setStatus(status, esc(t('ex.xlsxFail')), 'bad');
        return;
      }
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array', cellDates: true });
      let bestRows = [];
      let bestScore = -1;
      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '', blankrows: false });
        const rows = cleanRows(aoa);
        if (rows.length < 2) continue;
        const { score } = findHeader(rows);
        if (score > bestScore) {
          bestScore = score;
          bestRows = rows;
        }
      }
      setSource(name, bestRows);
      return;
    }
    if (['csv', 'tsv', 'txt', ''].includes(ext) || /^text\//.test(file.type)) {
      const text = decodeText(await file.arrayBuffer());
      setSource(name, parseTable(text));
      return;
    }
    setStatus(status, esc(t('data.unsupported')), 'bad');
  } catch (err) {
    setStatus(status, esc(t('data.readError', { msg: err && err.message ? err.message : String(err) })), 'bad');
  }
}

async function loadSample() {
  const status = $('#data-status');
  setStatus(status, esc(t('data.loading')));
  try {
    let text;
    const inline = document.getElementById('pod35-sample');
    if (inline && inline.textContent.trim()) {
      text = inline.textContent;
    } else {
      const res = await fetch(SAMPLE_URL, { credentials: 'same-origin' });
      if (!res.ok) throw new Error(String(res.status));
      text = decodeText(await res.arrayBuffer());
    }
    setSource(t('data.source.sample'), parseTable(text));
  } catch {
    setStatus(status, esc(t('data.sampleError')), 'bad');
  }
}

function loadPasted() {
  const text = $('#paste-area').value;
  if (!text.trim()) {
    $('#paste-area').focus();
    return;
  }
  setSource(t('data.source.paste'), parseTable(text));
}

/* ------------------------------------------------------------ project JSON */

function projectObject() {
  return {
    format: 'pod35-project',
    version: 1,
    savedAt: new Date().toISOString(),
    source: state.source ? state.source.name : null,
    implicitCurrency: state.implicitCurrency,
    settings: { ...state.settings, fx: { ...state.settings.fx }, risk: [...state.settings.risk] },
    lines: state.lines,
  };
}

async function loadProjectFile(file) {
  const status = $('#data-status');
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch {
    data = null;
  }
  if (!data || data.format !== 'pod35-project' || !Array.isArray(data.lines)) {
    setStatus(status, esc(t('ex.badProject')), 'bad');
    $('#export-msg') && setStatus($('#export-msg'), esc(t('ex.badProject')), 'bad');
    return;
  }
  const s = data.settings || {};
  const st = state.settings;
  if (s.pack && RULE_PACKS[s.pack]) st.pack = s.pack;
  if (typeof s.currency === 'string' && /^[A-Z]{3}$/.test(s.currency)) st.currency = s.currency;
  if (s.fx && typeof s.fx === 'object') {
    st.fx = {};
    for (const [k, v] of Object.entries(s.fx)) {
      if (/^[A-Z]{3}$/.test(k)) st.fx[k] = Number.isFinite(v) && v > 0 ? v : null;
    }
  }
  st.fx[st.currency] = 1;
  if (isIsoDate(s.today)) st.today = s.today;
  if (Array.isArray(s.risk)) st.risk = s.risk.map((c) => normalizeCountry(String(c))).filter(Boolean);
  st.buyer = typeof s.buyer === 'string' ? s.buyer : st.buyer;
  st.deadline = isIsoDate(s.deadline) ? s.deadline : st.deadline;
  state.lines = data.lines.filter((l) => l && typeof l === 'object');
  state.errors = [];
  state.source = null;
  state.implicitCurrency = data.implicitCurrency === true;
  reindex();
  ensureFxForLines();
  afterDataLoaded('data.loadedProject', file.name || 'JSON');
  setStatus($('#export-msg'), '', '');
}

/* ------------------------------------------------------------------ compute */

function ensureFxForLines() {
  const fx = state.settings.fx;
  for (const l of state.lines) {
    const c = typeof l.currency === 'string' ? l.currency.trim().toUpperCase() : '';
    if (c && /^[A-Z]{3}$/.test(c) && !(c in fx)) fx[c] = null;
  }
  fx[state.settings.currency] = 1;
}

function recompute() {
  state.calcError = null;
  state.result = null;
  state.minSet = new Set();
  if (!state.lines.length) return;
  try {
    state.result = analyze(state.lines, {
      pack: state.settings.pack,
      fx: numericFx(),
      currency: state.settings.currency,
      today: state.settings.today,
      risk: state.settings.risk,
    });
    const ids = state.result?.minimumSet?.lineIds;
    if (Array.isArray(ids)) state.minSet = new Set(ids.map(String));
  } catch (err) {
    state.calcError = err;
    console.error(err);
  }
}

function overallVerdict(r) {
  if (r && ['pass', 'depends', 'fail', 'nodata'].includes(r.status)) return r.status;
  const v = r?.verdict || {};
  if (v.worst?.pass) return 'pass';
  if (v.best?.pass || v.expected?.pass) return 'depends';
  return 'fail';
}

/* ------------------------------------------------------------- render: data */

function renderMapping() {
  const box = $('#mapping');
  const src = state.source;
  if (!src) {
    box.hidden = true;
    box.innerHTML = '';
    return;
  }
  const header = src.rows[src.headerIdx] || [];
  const preview = src.rows.slice(src.headerIdx + 1, src.headerIdx + 1 + PREVIEW_ROWS);
  const width = Math.max(header.length, ...preview.map((r) => r.length));
  const cols = Array.from({ length: width }, (_, i) => i);
  const fieldFor = (c) => FIELDS.find((f) => src.mapping[f] === c) || '';
  const headerOpts = src.rows.slice(0, Math.min(15, src.rows.length)).map((r, i) => {
    const label = r.filter((c) => c.trim()).slice(0, 3).join(' · ');
    return `<option value="${i}"${i === src.headerIdx ? ' selected' : ''}>${i + 1}: ${esc(label.slice(0, 40))}</option>`;
  }).join('');

  const head = cols.map((c) => {
    const name = header[c] || t('map.column', { n: c + 1 });
    const cur = fieldFor(c);
    const opts = [`<option value="">${esc(t('map.ignore'))}</option>`]
      .concat(FIELDS.map((f) => `<option value="${f}"${cur === f ? ' selected' : ''}>${esc(t(`field.${f}`))}</option>`))
      .join('');
    return `<th scope="col" class="${cur ? 'is-mapped' : 'is-ignored'}">
      <span class="map__src">${esc(name)}</span>
      <select data-col="${c}" aria-label="${esc(t('map.selectLabel', { n: c + 1, name }))}">${opts}</select>
    </th>`;
  }).join('');
  const body = preview.map((r) => `<tr>${cols.map((c) => `<td${fieldFor(c) ? '' : ' class="is-ignored"'}>${esc(r[c] ?? '')}</td>`).join('')}</tr>`).join('');

  box.innerHTML = `
    <div class="mapping__head">
      <div>
        <h3 class="mapping__title">${esc(t('map.title'))}</h3>
        <p class="hint">${esc(t('map.hint'))}</p>
      </div>
      <div class="field field--inline">
        <label for="map-header">${esc(t('map.headerRow'))}</label>
        <select id="map-header">${headerOpts}</select>
      </div>
    </div>
    <div class="table-scroll">
      <table class="tbl tbl--map">
        <caption class="sr-only">${esc(t('map.preview', { n: preview.length }))}</caption>
        <thead><tr>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
    <p class="hint">${esc(t('map.preview', { n: preview.length }))}. ${esc(t('map.editsLost'))}</p>`;
  box.hidden = false;
}

function errText(e) {
  if (e === null || e === undefined) return '';
  if (typeof e === 'string') return e;
  const msg = String(e[state.lang] || e.message || e.cs || e.en || e.code || JSON.stringify(e));
  // calc-core reports `row` 1-based within the rows passed in (header first); show the row in the source.
  const row = Number.isInteger(e.row) ? e.row + (state.errorRowOffset || 0) : null;
  return row !== null ? t('data.errRow', { n: row, msg }) : msg;
}

function renderErrors() {
  const box = $('#data-errors');
  const errs = state.errors || [];
  if (!errs.length) {
    box.innerHTML = '';
    return;
  }
  const items = errs.slice(0, 200).map((e) => `<li>${esc(errText(e))}</li>`).join('');
  box.innerHTML = `<details class="errors"><summary>${esc(t('data.errors', { n: fmtInt(errs.length) }))}</summary><ul>${items}</ul></details>`;
}

/* --------------------------------------------------------- render: settings */

function renderSettings() {
  const st = state.settings;
  const packSel = $('#set-pack');
  packSel.innerHTML = Object.keys(RULE_PACKS).map((id) => {
    const p = RULE_PACKS[id];
    return `<option value="${esc(id)}"${id === st.pack ? ' selected' : ''}>${esc(packLabel(p))}</option>`;
  }).join('');
  renderPackInfo();

  const currencies = new Set([...Object.keys(DEFAULT_FX), ...Object.keys(st.fx)]);
  const curSel = $('#set-currency');
  curSel.innerHTML = Array.from(currencies).sort().map((c) => `<option value="${c}"${c === st.currency ? ' selected' : ''}>${c}</option>`).join('');

  $('#set-today').value = st.today;
  $('#set-risk').value = st.risk.join(', ');
  $('#rq-buyer').value = st.buyer;
  $('#rq-deadline').value = st.deadline;
  renderFx();
}

function renderPackInfo() {
  const p = packOf(state.settings.pack);
  const parts = [esc(t('set.home', { list: homeList(p) }))];
  if (p.kind === 'canada') parts.push(esc(t('set.homeCanada')));
  if (p.source) {
    const src = String(p.source);
    parts.push(/^https?:\/\//.test(src)
      ? `<a href="${esc(src)}" rel="noopener noreferrer" target="_blank">${esc(t('set.source', { source: src.replace(/^https?:\/\//, '') }))}</a>`
      : esc(t('set.source', { source: src })));
  }
  $('#pack-info').innerHTML = parts.join(' ');
}

function renderFx() {
  const st = state.settings;
  $('#fx-hint').textContent = t('set.fxHint', { cur: st.currency });
  const used = new Set(state.lines.map((l) => String(l.currency || '').toUpperCase()));
  const codes = Object.keys(st.fx).filter((c) => c !== st.currency).sort();
  $('#fx-grid').innerHTML = codes.map((code) => {
    const rate = st.fx[code];
    const missing = !(Number.isFinite(rate) && rate > 0);
    const canRemove = !used.has(code);
    return `<div class="fx-item${missing ? ' is-missing' : ''}">
      <label for="fx-${code}" class="fx-item__code">${code}</label>
      <input type="text" id="fx-${code}" data-fx="${code}" inputmode="decimal" autocomplete="off" class="mono num"
        value="${missing ? '' : esc(plainNum(rate, 6))}" aria-label="${esc(t('set.fxRateLabel', { code, cur: st.currency }))}"
        ${missing ? `aria-invalid="true" placeholder="${esc(t('set.fxMissing'))}"` : ''}>
      ${canRemove ? `<button type="button" class="fx-item__rm" data-fx-rm="${code}" aria-label="${esc(t('set.fxRemove', { code }))}">×</button>` : '<span class="fx-item__rm" aria-hidden="true"></span>'}
    </div>`;
  }).join('');
}

function parseDecimal(s) {
  const v = String(s ?? '').replace(/\s| /g, '').replace(',', '.');
  if (!v) return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function changeCurrency(next) {
  const st = state.settings;
  const prev = st.currency;
  if (!next || next === prev) return;
  const k = st.fx[next];
  const fx = {};
  for (const [code, rate] of Object.entries(st.fx)) {
    fx[code] = Number.isFinite(k) && k > 0 && Number.isFinite(rate) && rate > 0 ? Number((rate / k).toPrecision(6)) : null;
  }
  fx[next] = 1;
  st.fx = fx;
  st.currency = next;
  if (state.implicitCurrency) {
    for (const l of state.lines) if (!l.currency || l.currency === prev) l.currency = next;
  }
  ensureFxForLines();
  recompute();
  renderSettings();
  renderAll(true);
}

/* ---------------------------------------------------------- render: results */

function renderAll(includeLines) {
  const has = state.lines.length > 0;
  $('#results-empty').hidden = has;
  $('#results').hidden = !has;
  for (const b of $$('[data-needs-data]')) b.disabled = !has;
  if (!has) return;

  const errBox = $('#calc-error');
  if (state.calcError || !state.result) {
    errBox.hidden = false;
    errBox.textContent = t('s3.calcError', { msg: state.calcError?.message || '?' });
  } else {
    errBox.hidden = true;
  }
  const r = state.result;
  renderVerdict(r);
  renderHeadroom(r);
  renderMinSet(r);
  renderCategories(r);
  renderEvidence(r);
  renderRequests(r);
  if (includeLines) renderLines();
  else updateLineRows();
  renderWarnings(r);
  renderPrintHead(r);
}

function methodData(r, m) {
  return r?.methods?.[m] || null;
}

function methodUsed(r, m) {
  const md = methodData(r, m);
  if (!md) return false;
  if (m === 'a') return md.used !== false;
  return md.used === true;
}

function canadaShares(sc, den) {
  if (!sc) return null;
  const src = sc.shares && typeof sc.shares === 'object' ? sc.shares : sc;
  let home = num(src.home);
  let ca = num(src.canada ?? src.ca);
  let other = num(src.other);
  if (![home, ca, other].every(Number.isFinite)) return null;
  const sum = home + ca + other;
  if (sum > 1.0001 && den > 0) {
    home /= den;
    ca /= den;
    other /= den;
  }
  return { home, ca, other };
}

function barHtml(r, m, s) {
  const md = methodData(r, m);
  const sc = md?.scenarios?.[s] || {};
  const thr = packThreshold();
  const pass = !!sc.pass;
  const res = t(pass ? 'res.pass' : 'res.fail');
  const label = `<div class="bar-row__label"><b>${esc(t(`scen.${s}`))}</b><small>${esc(t(`scen.${s}Hint`))}</small></div>`;
  const tag = `<span class="tag tag--${pass ? 'pass' : 'fail'}">${esc(res)}</span>`;
  const shares = isCanada() ? canadaShares(sc, md?.denominator) : null;
  if (shares) {
    const w = (x) => `${Math.max(0, Math.min(100, x * 100)).toFixed(2)}%`;
    const aria = t('bar.ariaCanada', {
      method: t(`method.${m}`), scenario: t(`scen.${s}`), home: fmtPct(shares.home), ca: fmtPct(shares.ca), other: fmtPct(shares.other), result: res,
    });
    return `<div class="bar-row">
      ${label}
      <div class="bar bar--stack" role="img" aria-label="${esc(aria)}" style="--thr:${(thr * 100).toFixed(2)}%">
        <span class="seg seg--other" style="width:${w(shares.other)}"></span><span class="seg seg--ca" style="width:${w(shares.ca)}"></span><span class="seg seg--home" style="width:${w(shares.home)}"></span>
        <span class="bar__thr"></span><span class="bar__thr bar__thr--home" style="--thr:80%"></span>
      </div>
      <div class="bar-row__val">
        <span class="bar-row__pct mono">${esc(fmtPct(shares.other))}</span> ${tag}
        <small class="mono">${esc(t('canada.other'))} ${esc(fmtPct(shares.other))} · ${esc(t('canada.ca'))} ${esc(fmtPct(shares.ca))} · ${esc(t('canada.home'))} ${esc(fmtPct(shares.home))}</small>
      </div>
    </div>`;
  }
  const ratio = num(sc.ratio);
  const width = Number.isFinite(ratio) ? Math.max(0, Math.min(100, ratio * 100)) : 0;
  const aria = t('bar.aria', { method: t(`method.${m}`), scenario: t(`scen.${s}`), ratio: fmtPct(ratio), thr: fmtPct0(thr), result: res });
  return `<div class="bar-row">
    ${label}
    <div class="bar ${pass ? 'bar--pass' : 'bar--fail'}" role="img" aria-label="${esc(aria)}" style="--v:${width.toFixed(2)}%;--thr:${(thr * 100).toFixed(2)}%">
      <span class="bar__fill"></span><span class="bar__thr"></span>
    </div>
    <div class="bar-row__val">
      <span class="bar-row__pct mono">${esc(fmtPct(ratio))}</span> ${tag}
      <small class="mono">${esc(t('bar.of', { part: fmtMoney(num(sc.nonHome)), whole: fmtMoney(num(md?.denominator)) }))}</small>
    </div>
  </div>`;
}

function methodHtml(r, m) {
  const md = methodData(r, m);
  if (!md) return '';
  const thr = packThreshold();
  const head = `<header class="method__head">
      <h4 class="method__title">${esc(t(`method.${m}`))}</h4>
      <p class="method__long">${esc(t(`method.${m}Long`))}</p>
    </header>`;
  if (!methodUsed(r, m)) {
    return `<section class="method method--unused">${head}<p class="hint">${esc(t('method.bUnused'))}</p></section>`;
  }
  const scale = `<div class="scale" aria-hidden="true" style="--thr:${(thr * 100).toFixed(2)}%">
      <span class="scale__track"><span class="scale__0">0</span><span class="scale__thr">${esc(t('bar.limit', { thr: fmtPct0(thr) }))}</span><span class="scale__100">${esc(fmtPct0(1))}</span></span>
    </div>`;
  const legend = isCanada() ? `<p class="hint">${esc(t('canada.legend'))}</p>` : '';
  return `<section class="method">
    ${head}
    <p class="method__den mono">${esc(t('method.denominator', { amount: fmtMoney(num(md.denominator)) }))}</p>
    <div class="bars">${scale}${SCENARIOS.map((s) => barHtml(r, m, s)).join('')}</div>
    ${legend}
  </section>`;
}

function riskInfo(r) {
  const ws = Array.isArray(r?.warnings) ? r.warnings.filter((w) => w.code === 'risk-country') : null;
  if (ws) {
    const ids = new Set(ws.map((w) => String(w.lineId)));
    const codes = new Set(ws.map((w) => w.country).filter(Boolean));
    return { count: ids.size, codes: Array.from(codes).sort() };
  }
  const risk = new Set(state.settings.risk);
  const lines = state.lines.filter((l) => typeOf(l) !== 'raw' && risk.has(effOrigin(l)));
  return { count: lines.length, codes: Array.from(new Set(lines.map(effOrigin))).sort() };
}

function renderVerdict(r) {
  const box = $('#verdict');
  if (!r) {
    box.innerHTML = '';
    return;
  }
  const v = r.verdict || {};
  const st = overallVerdict(r);
  const label = t(`verdict.${st}`);
  let lead = st === 'pass' ? t('verdict.passText')
    : st === 'fail' ? t('verdict.failText')
      : st === 'nodata' ? t('verdict.nodataText')
        : (v.expected?.pass ? t('verdict.dependsText') : t('verdict.dependsExpectedFail'));
  const decisive = st === 'pass' ? v.worst?.method : st === 'depends' ? (v.expected?.pass ? v.expected?.method : v.best?.method) : null;
  if (decisive) lead += ` ${t('verdict.byMethod', { m: decisive })}`;
  const p = packOf(state.settings.pack);
  const meta = t('verdict.meta', { pack: packLabel(p), thr: fmtPct0(packThreshold()), rows: tp('rows', state.lines.length), date: fmtDate(state.settings.today) });
  const risky = riskInfo(r);
  const riskHtml = risky.count
    ? `<p class="alert alert--bad">${esc(t('verdict.risk', { rows: tp('rows', risky.count), codes: risky.codes.join(', ') }))}</p>`
    : '';
  box.innerHTML = `
    <div class="verdict verdict--${st}">
      <p class="stamp stamp--${st}"><span>${esc(label)}</span></p>
      <div class="verdict__body">
        <p class="verdict__lead">${esc(lead)}</p>
        <p class="verdict__meta mono">${esc(meta)}</p>
      </div>
    </div>
    ${riskHtml}
    <div class="methods">${methodHtml(r, 'a')}${methodHtml(r, 'b')}</div>
    <p class="hint">${esc(t('verdict.homeNote'))} ${esc(t('verdict.disclaimer'))}</p>`;
}

function renderHeadroom(r) {
  const box = $('#headroom');
  const h = r?.headroom || {};
  box.innerHTML = `<div class="hr-grid">${['worst', 'expected'].map((s) => {
    const x = h[s];
    const amount = num(x?.amount);
    if (!x || !Number.isFinite(amount)) {
      return `<div class="hr"><p class="hr__scen">${esc(t(`scen.${s}`))}</p><p class="hint">${esc(t('hr.na'))}</p></div>`;
    }
    const plus = amount >= 0;
    const den = num(methodData(r, x.method)?.denominator);
    const pct = den > 0 ? Math.abs(amount) / den : NaN;
    return `<div class="hr hr--${plus ? 'plus' : 'minus'}">
      <p class="hr__scen">${esc(t(`scen.${s}`))}</p>
      <p class="hr__amount mono">${plus ? '+' : '−'}${esc(fmtMoney(Math.abs(amount)))}</p>
      <p class="hr__text">${esc(t(plus ? 'hr.plus' : 'hr.minus', { amount: fmtMoney(Math.abs(amount)) }))}</p>
      <p class="hint">${esc(t('hr.method', { m: x.method || 'a', pct: fmtPct(pct) }))}</p>
    </div>`;
  }).join('')}</div>`;
}

function linesTableHtml(ids, { caption }) {
  const lines = ids.map((id) => lineById(id)).filter(Boolean);
  let sum = 0;
  const rows = lines.map((l, i) => {
    const c = costOf(l);
    if (Number.isFinite(c)) sum += c;
    const st = statusOf(l);
    return `<tr>
      <td class="num muted">${i + 1}</td>
      <td class="pn">${esc(l.partNo || '')}</td>
      <td class="wrap">${esc(l.description || '')}</td>
      <td class="sup">${esc(l.supplier || '')}</td>
      <td class="nowrap">${ccHtml(effOrigin(l), false)}</td>
      <td class="num mono">${esc(fmtNum(c))}</td>
      <td><span class="badge badge--${st}">${esc(t(`status.${st}`))}</span></td>
    </tr>`;
  }).join('');
  return `<div class="table-scroll"><table class="tbl">
    <caption class="sr-only">${esc(caption)}</caption>
    <thead><tr>
      <th scope="col" class="num">${esc(t('col.no'))}</th>
      <th scope="col">${esc(t('col.part'))}</th>
      <th scope="col">${esc(t('col.desc'))}</th>
      <th scope="col">${esc(t('col.supplier'))}</th>
      <th scope="col">${esc(t('col.effOrigin'))}</th>
      <th scope="col" class="num">${esc(t('col.cost', { cur: state.settings.currency }))}</th>
      <th scope="col">${esc(t('col.status'))}</th>
    </tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><th scope="row" colspan="5">${esc(t('ms.sum'))}</th><td class="num mono">${esc(fmtNum(sum))}</td><td></td></tr></tfoot>
  </table></div>`;
}

function renderMinSet(r) {
  const box = $('#minset');
  const ms = r?.minimumSet;
  if (!ms) {
    box.innerHTML = '';
    return;
  }
  const ids = Array.isArray(ms.lineIds) ? ms.lineIds : [];
  const count = Number.isFinite(ms.count) ? ms.count : ids.length;
  const covered = num(ms.coveredCost);
  if (r.verdict?.worst?.pass || (ms.feasible && count === 0)) {
    box.innerHTML = `<p class="callout callout--ok">${esc(t('ms.none'))}</p>`;
    return;
  }
  if (ms.feasible) {
    box.innerHTML = `<p>${esc(t('ms.intro', { rows: tp('rows', count), cost: fmtMoney(covered), m: ms.method || 'a' }))}</p>
      ${linesTableHtml(ids, { caption: t('ms.title') })}`;
    return;
  }
  const sub = r.substitution;
  let html = `<p class="callout callout--bad">${esc(t('ms.infeasible', { rows: tp('rows', count), cost: fmtMoney(covered) }))}</p>`;
  if (ids.length) html += `<p>${esc(t('ms.candidates'))}</p>${linesTableHtml(ids, { caption: t('ms.title') })}`;
  html += `<h4 class="sub-title">${esc(t('sub.title'))}</h4>`;
  if (sub && Array.isArray(sub.lineIds)) {
    const n = Number.isFinite(sub.count) ? sub.count : sub.lineIds.length;
    html += `<p>${esc(t('sub.intro', { rows: tp('rows', n), cost: fmtMoney(num(sub.cost)) }))}</p>${linesTableHtml(sub.lineIds, { caption: t('sub.title') })}`;
  } else {
    html += `<p class="hint">${esc(t('sub.none'))}</p>`;
  }
  box.innerHTML = html;
}

/* categories */

function categoryRows(r) {
  const cats = Array.isArray(r?.categories) ? r.categories : [];
  return cats.map((c) => {
    const id = c.id ?? null;
    const total = num(c.total);
    const nonHome = num(c.nonHome);
    const undoc = num(c.undocumented);
    let share = num(c.nonHomeShare ?? c.share);
    if (!Number.isFinite(share) && total > 0) share = nonHome / total;
    const contrib = num(c.contribution);
    const known = id && CATEGORIES.some((x) => x.id === id);
    return { id: known ? id : null, label: known ? categoryLabel(id) : t('cat.none'), lines: c.lines, total, nonHome, undoc, share, contrib };
  });
}

function categoryTotals(rows) {
  const sum = (k) => rows.reduce((a, x) => a + (Number.isFinite(x[k]) ? x[k] : 0), 0);
  const total = sum('total');
  const nonHome = sum('nonHome');
  return { label: t('cat.total'), total, nonHome, undoc: sum('undoc'), share: total > 0 ? nonHome / total : NaN, contrib: sum('contrib') };
}

function categoryMethod(r) {
  // calc-core computes the category contributions with the method that is more favourable in the expected case.
  return r?.verdict?.expected?.method || 'a';
}

function renderCategories(r) {
  const rows = categoryRows(r);
  $('#cat-hint').textContent = t('cat.hint', { m: categoryMethod(r) });
  const box = $('#categories');
  if (!rows.length) {
    box.innerHTML = '';
    return;
  }
  const tot = categoryTotals(rows);
  const tr = (x, isTotal) => `<tr${isTotal ? ' class="is-total"' : ''}>
    <th scope="row">${esc(x.label)}</th>
    <td class="num mono">${esc(fmtNum(x.total))}</td>
    <td class="num mono">${esc(fmtNum(x.nonHome))}</td>
    <td class="num mono">${esc(fmtNum(x.undoc))}</td>
    <td class="num mono">${esc(fmtPct(x.share))}</td>
    <td class="num mono">${esc(fmtPct(x.contrib))}</td>
  </tr>`;
  box.innerHTML = `<div class="table-scroll"><table class="tbl tbl--cat">
    <caption class="sr-only">${esc(t('cat.title'))}</caption>
    <thead><tr>
      <th scope="col">${esc(t('cat.col.cat'))}</th>
      <th scope="col" class="num">${esc(t('cat.col.total'))} (${esc(state.settings.currency)})</th>
      <th scope="col" class="num">${esc(t('cat.col.nonHome'))} (${esc(state.settings.currency)})</th>
      <th scope="col" class="num">${esc(t('cat.col.undoc'))} (${esc(state.settings.currency)})</th>
      <th scope="col" class="num">${esc(t('cat.col.share'))}</th>
      <th scope="col" class="num">${esc(t('cat.col.contrib'))}</th>
    </tr></thead>
    <tbody>${rows.map((x) => tr(x, false)).join('')}</tbody>
    <tfoot>${tr(tot, true)}</tfoot>
  </table></div>`;
}

function categoriesTsv() {
  const rows = categoryRows(state.result);
  const cur = state.settings.currency;
  const out = [[t('cat.col.cat'), `${t('cat.col.total')} (${cur})`, `${t('cat.col.nonHome')} (${cur})`, `${t('cat.col.undoc')} (${cur})`, t('cat.col.share'), t('cat.col.contrib')]];
  for (const x of [...rows, categoryTotals(rows)]) {
    out.push([x.label, plainNum(x.total, 0), plainNum(x.nonHome, 0), plainNum(x.undoc, 0), plainPct(x.share), plainPct(x.contrib)]);
  }
  return out.map((r) => r.map((c) => String(c).replace(/[\t\r\n]+/g, ' ')).join('\t')).join('\r\n');
}

/* evidence */

function evidenceStats() {
  const today = state.settings.today;
  const soon = addDays(today, 90);
  const by = { documented: { count: 0, cost: 0 }, stated: { count: 0, cost: 0 }, unknown: { count: 0, cost: 0 } };
  const expired = [];
  const expiring = [];
  let total = 0;
  for (const l of state.lines) {
    if (typeOf(l) !== 'tier1') continue;
    const st = statusOf(l);
    const c = costOf(l);
    const bucket = by[st] || by.unknown;
    bucket.count += 1;
    if (Number.isFinite(c)) {
      bucket.cost += c;
      total += c;
    }
    if (isIsoDate(l.validUntil)) {
      if (l.validUntil < today) expired.push(l);
      else if (l.validUntil <= soon) expiring.push(l);
    }
  }
  expired.sort((a, b) => a.validUntil.localeCompare(b.validUntil));
  expiring.sort((a, b) => a.validUntil.localeCompare(b.validUntil));
  return { by, total, expired, expiring };
}

function evidenceFromResult(r) {
  const e = r?.evidence;
  if (!e || !e.documented || !e.stated || !e.unknown) return evidenceStats();
  const toLine = (x) => ({
    validUntil: x.validUntil, partNo: x.partNo, description: x.description, supplier: x.supplier, id: x.lineId,
  });
  const by = { documented: e.documented, stated: e.stated, unknown: e.unknown };
  const total = STATUSES.reduce((a, s) => a + (num(by[s].cost) || 0), 0);
  return {
    by, total,
    expired: (Array.isArray(e.expired) ? e.expired : []).map(toLine),
    expiring: (Array.isArray(e.expiringSoon) ? e.expiringSoon : []).map(toLine),
  };
}

function renderEvidence(r) {
  const ev = evidenceFromResult(r);
  const tiles = STATUSES.map((s) => {
    const b = ev.by[s];
    const share = ev.total > 0 ? b.cost / ev.total : NaN;
    return `<div class="ev ev--${s}">
      <p class="ev__label"><span class="badge badge--${s}">${esc(t(`ev.${s}`))}</span></p>
      <p class="ev__count mono">${esc(tp('rows', b.count))}</p>
      <p class="ev__cost mono">${esc(fmtMoney(b.cost))}</p>
      <p class="hint">${esc(t('ev.share', { pct: fmtPct(share) }))}</p>
      <span class="ev__bar" aria-hidden="true" style="--v:${Number.isFinite(share) ? (share * 100).toFixed(2) : 0}%"></span>
    </div>`;
  }).join('');
  const list = (arr, emptyKey) => (arr.length
    ? `<ul class="ev-list">${arr.slice(0, 50).map((l) => `<li><span class="mono">${esc(fmtDate(l.validUntil))}</span> · <span class="mono">${esc(l.partNo || '')}</span> ${esc(l.description || '')}${l.supplier ? ` · ${esc(l.supplier)}` : ''}</li>`).join('')}${arr.length > 50 ? '<li>…</li>' : ''}</ul>`
    : `<p class="hint">${esc(t(emptyKey))}</p>`);
  $('#evidence').innerHTML = `
    <div class="ev-grid">${tiles}</div>
    <p class="hint">${esc(t('ev.scope'))}</p>
    <div class="ev-dates">
      <div><h4 class="sub-title">${esc(t('ev.expired'))}</h4>${list(ev.expired, 'ev.noExpired')}</div>
      <div><h4 class="sub-title">${esc(t('ev.expiring'))}</h4>${list(ev.expiring, 'ev.noExpiring')}</div>
    </div>`;
}

/* supplier requests */

function requestList(r) {
  const reqs = Array.isArray(r?.supplierRequests) ? r.supplierRequests : [];
  return reqs.map((q) => {
    const ids = Array.isArray(q.lineIds) ? q.lineIds : Array.isArray(q.lines) ? q.lines.map((x) => (typeof x === 'object' ? x.id : x)) : [];
    const lines = ids.map((id) => lineById(id)).filter(Boolean);
    const country = q.country ?? q.supplierCountry ?? (lines[0] && lines[0].supplierCountry) ?? null;
    const costRaw = num(q.cost);
    const cost = Number.isFinite(costRaw) ? costRaw : lines.reduce((a, l) => a + (Number.isFinite(costOf(l)) ? costOf(l) : 0), 0);
    const priority = q.priority === true || q.inMinimumSet === true || (typeof q.priority === 'number' && q.priority > 0) || lines.some((l) => state.minSet.has(String(l.id)));
    return { supplier: q.supplier || '', country, lines, cost, priority };
  });
}

function mailLangFor(country) {
  if (country === 'CZ') return 'cs';
  if (country === 'SK') return 'sk';
  return 'en';
}

function renderRequests(r) {
  const box = $('#requests');
  const reqs = requestList(r);
  if (!reqs.length) {
    box.innerHTML = `<p class="callout callout--ok">${esc(t('rq.none'))}</p>`;
    return;
  }
  box.innerHTML = `<ol class="rq-list">${reqs.map((q, i) => {
    const name = q.supplier || t('rq.unknownSupplier');
    const ml = mailLangFor(q.country);
    const refs = q.lines.slice(0, 8).map((l) => lineRef(l)).join(', ') + (q.lines.length > 8 ? ', …' : '');
    const declBtns = DECL_LANGS.map((dl) => `<button type="button" class="btn btn--ghost btn--sm" data-act="decl" data-i="${i}" data-dl="${dl}" aria-label="${esc(t('rq.declLabel', { lang: LANG_CODE[dl], supplier: name }))}">${LANG_CODE[dl]}</button>`).join('');
    return `<li class="rq${q.priority ? ' rq--prio' : ''}">
      <div class="rq__main">
        <p class="rq__name"><strong>${esc(name)}</strong>${q.priority ? ` <span class="tag tag--mark">${esc(t('rq.priority'))}</span>` : ''}</p>
        <p class="rq__meta">${ccHtml(q.country)} · ${esc(tp('rows', q.lines.length))} · <span class="mono">${esc(fmtMoney(q.cost))}</span></p>
        <p class="hint rq__lines">${esc(t('rq.lines', { list: refs }))}</p>
      </div>
      <div class="rq__actions no-print">
        <span class="rq__label">${esc(t('rq.decl'))}</span>
        <span class="btn-group">${declBtns}</span>
        <button type="button" class="btn btn--sm" data-act="mail" data-i="${i}" data-ml="${ml}" aria-label="${esc(t('rq.mailLabel', { supplier: name, lang: LANG_CODE[ml] }))}">${esc(t('rq.mail', { lang: LANG_CODE[ml] }))}</button>
      </div>
    </li>`;
  }).join('')}</ol>`;
}

function openDeclaration(i, dl) {
  const q = requestList(state.result)[i];
  if (!q) return;
  const html = declarationHtml({
    lang: dl,
    supplier: q.supplier,
    supplierCountry: q.country,
    buyer: state.settings.buyer,
    lines: q.lines,
    place: '',
    date: state.settings.today,
  });
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const w = window.open(url, '_blank');
  if (!w) toast(t('rq.popup'));
  setTimeout(() => URL.revokeObjectURL(url), 10 * 60 * 1000);
}

async function copyMail(i, ml) {
  const q = requestList(state.result)[i];
  if (!q) return;
  const { subject, body } = requestEmail({ lang: ml, supplier: q.supplier, buyer: state.settings.buyer, lines: q.lines, deadline: state.settings.deadline });
  const ok = await copyText(`${t('rq.subject')}: ${subject}\n\n${body}`);
  if (ok) toast(t('rq.mailCopied', { supplier: q.supplier || t('rq.unknownSupplier') }));
}

/* lines table */

function filteredLines() {
  const q = state.filter.q.trim().toLowerCase();
  const out = [];
  state.lines.forEach((l, idx) => {
    if (state.filter.onlyUndoc && !isUndocumented(l)) return;
    if (q) {
      const hay = [l.partNo, l.description, l.supplier, l.origin, l.expectedOrigin, l.supplierCountry, l.note, l.category]
        .map((x) => String(x ?? '').toLowerCase()).join(' ');
      if (!hay.includes(q)) return;
    }
    out.push(idx);
  });
  return out;
}

function renderLinesHead() {
  const cols = [
    ['col.no', 'num'], ['col.part', ''], ['col.desc', ''], ['col.supplier', ''], ['col.type', ''], ['col.category', ''],
    ['col.cost', 'num'], ['col.origin', ''], ['col.evidence', ''], ['col.valid', ''], ['col.expected', ''], ['col.status', ''],
  ];
  $('#ln-head').innerHTML = `<tr>${cols.map(([k, cls]) => `<th scope="col"${cls ? ` class="${cls}"` : ''}>${esc(t(k, { cur: state.settings.currency }))}</th>`).join('')}</tr>`;
}

function lineRowHtml(l, idx) {
  const st = statusOf(l);
  const ref = lineRef(l) || String(idx + 1);
  const evOpts = EVIDENCE.map((e) => `<option value="${e}"${l.evidence === e ? ' selected' : ''}>${esc(t(`evidence.${e}`))}</option>`).join('');
  const evSel = EVIDENCE.includes(l.evidence) ? evOpts : `<option value="" selected></option>${evOpts}`;
  const exp = l.expectedOrigin || l.supplierCountry || '';
  return `<tr id="ln-${idx}" data-idx="${idx}" class="st-${st}">
    <td class="num muted">${idx + 1}</td>
    <th scope="row" class="pn">${esc(l.partNo || '')}</th>
    <td class="wrap">${esc(l.description || '')}</td>
    <td class="sup">${esc(l.supplier || '')}</td>
    <td class="nowrap">${esc(t(`type.${typeOf(l)}`))}</td>
    <td>${esc(l.category ? categoryLabel(l.category) : '–')}</td>
    <td class="num mono" data-cell="cost">${esc(fmtNum(costOf(l)))}</td>
    <td><input type="text" class="in in--cc mono" data-f="origin" value="${esc(l.origin || '')}" list="dl-cc" maxlength="40" autocomplete="off" spellcheck="false" aria-label="${esc(t('ln.originLabel', { ref }))}"><span class="print-val mono">${esc(l.origin || '')}</span></td>
    <td><select class="in in--ev" data-f="evidence" aria-label="${esc(t('ln.evidenceLabel', { ref }))}">${evSel}</select><span class="print-val">${esc(EVIDENCE.includes(l.evidence) ? t(`evidence.${l.evidence}`) : '')}</span></td>
    <td><input type="date" class="in in--date" data-f="validUntil" value="${esc(isIsoDate(l.validUntil) ? l.validUntil : '')}" aria-label="${esc(t('ln.validLabel', { ref }))}"><span class="print-val">${esc(isIsoDate(l.validUntil) ? fmtDate(l.validUntil) : '')}</span></td>
    <td class="mono muted" title="${esc(cname(exp))}">${esc(exp || '–')}</td>
    <td data-cell="status"><span class="badge badge--${st}">${esc(t(`status.${st}`))}</span></td>
  </tr>`;
}

function renderLines() {
  renderLinesHead();
  const idxs = filteredLines();
  const shown = idxs.slice(0, MAX_RENDER);
  $('#ln-body').innerHTML = shown.map((i) => lineRowHtml(state.lines[i], i)).join('');
  let msg = t('ln.count', { shown: fmtInt(shown.length), total: fmtInt(state.lines.length) });
  if (idxs.length > MAX_RENDER) msg += ` ${t('ln.limited', { n: fmtInt(MAX_RENDER) })}`;
  $('#ln-count').textContent = msg;
}

function updateLineRows() {
  for (const tr of $$('#ln-body tr[data-idx]')) {
    const l = state.lines[+tr.dataset.idx];
    if (!l) continue;
    const st = statusOf(l);
    tr.className = `st-${st}`;
    const cell = tr.querySelector('[data-cell="status"]');
    if (cell) cell.innerHTML = `<span class="badge badge--${st}">${esc(t(`status.${st}`))}</span>`;
  }
}

function buildDatalist() {
  const dl = $('#dl-cc');
  if (!dl) return;
  const codes = Array.isArray(ALL_ISO2) && ALL_ISO2.length ? ALL_ISO2 : EU27;
  dl.innerHTML = codes.map((c) => `<option value="${esc(c)}" label="${esc(cname(c))}"></option>`).join('');
}

function applyLineEdit(input, final) {
  const tr = input.closest('tr[data-idx]');
  if (!tr) return;
  const line = state.lines[+tr.dataset.idx];
  if (!line) return;
  const f = input.dataset.f;
  if (f === 'origin') {
    const raw = input.value.trim();
    if (!raw) {
      line.origin = null;
      input.removeAttribute('aria-invalid');
      input.title = '';
    } else {
      let code = null;
      try { code = normalizeCountry(raw); } catch { code = null; }
      if (!code) {
        if (final) {
          input.setAttribute('aria-invalid', 'true');
          input.title = t('ln.badCountry');
          toast(t('ln.badCountry'));
        }
        return;
      }
      input.removeAttribute('aria-invalid');
      input.title = cname(code);
      if (final) input.value = code;
      if (line.origin === code) return;
      line.origin = code;
    }
  } else if (f === 'evidence') {
    line.evidence = EVIDENCE.includes(input.value) ? input.value : line.evidence;
  } else if (f === 'validUntil') {
    line.validUntil = isIsoDate(input.value) ? input.value : null;
  } else {
    return;
  }
  const pv = input.parentElement && input.parentElement.querySelector('.print-val');
  if (pv) {
    pv.textContent = f === 'origin' ? (line.origin || '')
      : f === 'evidence' ? (EVIDENCE.includes(line.evidence) ? t(`evidence.${line.evidence}`) : '')
        : (isIsoDate(line.validUntil) ? fmtDate(line.validUntil) : '');
  }
  recompute();
  renderAll(false);
}

const applyLineEditLive = debounce((input) => applyLineEdit(input, false), 300);

/* warnings */

function renderWarnings(r) {
  const box = $('#warnings');
  const ws = Array.isArray(r?.warnings) ? r.warnings : [];
  if (!ws.length) {
    box.innerHTML = `<p class="hint">${esc(t('wr.none'))}</p>`;
    return;
  }
  const item = (w) => {
    const text = w[state.lang] || w.cs || w.en || w.message || w.code || '';
    let ref = '';
    if (w.lineId !== undefined && w.lineId !== null) {
      const idx = state.idIndex.get(String(w.lineId));
      const l = idx === undefined ? null : state.lines[idx];
      if (l) ref = ` <a class="wr__ref mono" href="#ln-${idx}" data-goto="${idx}">${esc(t('wr.line', { ref: lineRef(l) || idx + 1 }))}</a>`;
    }
    const sev = w.severity === 'error' ? 'bad' : w.severity === 'info' ? 'info' : 'warn';
    return `<li class="wr wr--${sev}">${esc(text)}${ref}</li>`;
  };
  const first = ws.slice(0, WARN_SHOWN).map(item).join('');
  const rest = ws.slice(WARN_SHOWN);
  box.innerHTML = `<p class="hint">${esc(tp('warnings', ws.length))}</p><ul class="wr-list">${first}</ul>${rest.length
    ? `<details class="wr-more"><summary>${esc(t('wr.more', { n: fmtInt(rest.length) }))}</summary><ul class="wr-list">${rest.map(item).join('')}</ul></details>`
    : ''}`;
}

function gotoLine(idx) {
  let tr = document.getElementById(`ln-${idx}`);
  if (!tr) {
    state.filter = { onlyUndoc: false, q: '' };
    $('#ln-only').checked = false;
    $('#ln-search').value = '';
    renderLines();
    tr = document.getElementById(`ln-${idx}`);
  }
  if (!tr) return;
  tr.scrollIntoView({ block: 'center', behavior: 'smooth' });
  tr.classList.add('is-flash');
  setTimeout(() => tr.classList.remove('is-flash'), 1600);
  const input = tr.querySelector('input, select');
  if (input) input.focus({ preventScroll: true });
}

/* print head */

function renderPrintHead(r) {
  const fx = Object.entries(state.settings.fx)
    .filter(([c, v]) => c !== state.settings.currency && Number.isFinite(v))
    .map(([c, v]) => `${c} ${plainNum(v, 4)}`).join(', ');
  const st = r ? overallVerdict(r) : 'fail';
  $('#print-head').innerHTML = `
    <p class="print-head__brand">${esc(BRAND)}</p>
    <p class="print-head__title">${esc(t('print.title'))}</p>
    <p class="print-head__meta">${esc(t('print.settings', { pack: packLabel(packOf(state.settings.pack)), cur: state.settings.currency, date: fmtDate(state.settings.today), fx: fx || '–' }))}</p>
    <p class="print-head__meta">${esc(t('print.created', { date: fmtDate(todayIso()) }))} · ${esc(t(`verdict.${st}`))} · ${esc(tp('rows', state.lines.length))}</p>`;
}

/* ------------------------------------------------------------------- export */

function fileStamp() {
  return state.settings.today || todayIso();
}

function linesExportRows() {
  const head = ['ID', t('field.partNo'), t('field.description'), t('field.supplier'), t('field.supplierCountry'), t('field.category'), t('field.type'),
    t('field.qty'), t('field.unitCost'), t('field.currency'), t('col.cost', { cur: state.settings.currency }), t('field.origin'), t('field.expectedOrigin'),
    t('field.evidence'), t('field.validUntil'), t('col.status'), t('col.inMinSet'), t('field.note')];
  const rows = state.lines.map((l) => {
    const c = costOf(l);
    return [l.id ?? '', l.partNo ?? '', l.description ?? '', l.supplier ?? '', l.supplierCountry ?? '', l.category ?? '', typeOf(l),
      Number.isFinite(l.qty) ? l.qty : (l.qty ?? ''), Number.isFinite(l.unitCost) ? l.unitCost : (l.unitCost ?? ''), l.currency ?? '',
      Number.isFinite(c) ? Math.round(c * 100) / 100 : '', l.origin ?? '', l.expectedOrigin ?? '', l.evidence ?? '', l.validUntil ?? '',
      t(`status.${statusOf(l)}`), state.minSet.has(String(l.id)) ? t('ex.yes') : t('ex.no'), l.note ?? ''];
  });
  return [head, ...rows];
}

function exportCsv() {
  const rows = linesExportRows();
  let csv;
  try {
    csv = toCsv(rows, state.lang === 'en' ? { delimiter: ',' } : { delimiter: ';' });
  } catch {
    csv = rows.map((r) => r.map((c) => {
      const s = String(c ?? '');
      return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(';')).join('\r\n');
  }
  const name = `${t('ex.file.lines')}-${fileStamp()}.csv`;
  download(name, `﻿${csv.replace(/^﻿/, '')}`, 'text/csv;charset=utf-8');
  setStatus($('#export-msg'), esc(t('ex.done', { name })), 'ok');
}

function summaryRows(r) {
  const out = [[t('ex.sum.item'), t('ex.sum.value')]];
  const p = packOf(state.settings.pack);
  out.push([t('ex.sum.pack'), packLabel(p)]);
  out.push([t('ex.sum.currency'), state.settings.currency]);
  out.push([t('ex.sum.date'), state.settings.today]);
  out.push([t('ex.sum.verdict'), t(`verdict.${overallVerdict(r)}`)]);
  for (const m of ['a', 'b']) {
    if (!methodUsed(r, m)) continue;
    const md = methodData(r, m);
    out.push([t('ex.sum.den', { method: t(`method.${m}`) }), round2(num(md.denominator))]);
    for (const s of SCENARIOS) {
      const sc = md.scenarios?.[s] || {};
      out.push([t('ex.sum.nonHome', { method: t(`method.${m}`), scenario: t(`scen.${s}`) }), round2(num(sc.nonHome))]);
      out.push([t('ex.sum.ratio', { method: t(`method.${m}`), scenario: t(`scen.${s}`) }), { pct: num(sc.ratio) }]);
    }
  }
  for (const s of ['worst', 'expected']) {
    const h = r?.headroom?.[s];
    if (h) out.push([`${t('ex.sum.headroom', { scenario: t(`scen.${s}`) })} (${h.method || 'a'})`, round2(num(h.amount))]);
  }
  const tot = r?.totals || {};
  out.push([t('ex.sum.tier1'), round2(num(tot.tier1))]);
  out.push([t('ex.sum.inhouse'), round2(num(tot.inhouse))]);
  out.push([t('ex.sum.raw'), round2(num(tot.raw))]);
  out.push([t('ex.sum.lines'), state.lines.length]);
  out.push([t('ex.sum.fx'), Object.entries(state.settings.fx).filter(([, v]) => Number.isFinite(v)).map(([c, v]) => `${c}=${v}`).join(', ')]);
  out.push([t('verdict.disclaimer'), '']);
  return out;
}

function round2(n) {
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : '';
}

function idsTable(ids) {
  const head = [t('col.part'), t('col.desc'), t('col.supplier'), t('col.effOrigin'), t('col.cost', { cur: state.settings.currency }), t('col.status')];
  const rows = (ids || []).map((id) => lineById(id)).filter(Boolean).map((l) => [l.partNo ?? '', l.description ?? '', l.supplier ?? '', effOrigin(l) ?? '', round2(costOf(l)), t(`status.${statusOf(l)}`)]);
  return [head, ...rows];
}

function sheetFromRows(XLSX, rows) {
  const pctCells = [];
  const aoa = rows.map((r, ri) => r.map((c, ci) => {
    if (c && typeof c === 'object' && 'pct' in c) {
      pctCells.push([ri, ci]);
      return Number.isFinite(c.pct) ? c.pct : '';
    }
    return c;
  }));
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  for (const [ri, ci] of pctCells) {
    const ref = XLSX.utils.encode_cell({ r: ri, c: ci });
    if (ws[ref] && ws[ref].t === 'n') ws[ref].z = '0.0%';
  }
  const widths = [];
  for (const r of aoa) r.forEach((c, i) => { widths[i] = Math.min(60, Math.max(widths[i] || 8, String(c ?? '').length + 2)); });
  ws['!cols'] = widths.map((wch) => ({ wch }));
  return ws;
}

async function exportXlsx() {
  const msg = $('#export-msg');
  setStatus(msg, esc(t('ex.xlsxLoading')));
  let XLSX;
  try {
    XLSX = await loadXlsx();
  } catch {
    setStatus(msg, esc(t('ex.xlsxFail')), 'bad');
    return;
  }
  const r = state.result;
  const wb = XLSX.utils.book_new();
  const add = (rows, key) => XLSX.utils.book_append_sheet(wb, sheetFromRows(XLSX, rows), t(key).slice(0, 31));
  add(summaryRows(r), 'ex.sheet.summary');
  add(linesExportRows(), 'ex.sheet.lines');
  const cats = categoryRows(r);
  const cur = state.settings.currency;
  add([
    [t('cat.col.cat'), `${t('cat.col.total')} (${cur})`, `${t('cat.col.nonHome')} (${cur})`, `${t('cat.col.undoc')} (${cur})`, t('cat.col.share'), t('cat.col.contrib')],
    ...[...cats, categoryTotals(cats)].map((x) => [x.label, round2(x.total), round2(x.nonHome), round2(x.undoc), { pct: x.share }, { pct: x.contrib }]),
  ], 'ex.sheet.categories');
  const ms = r?.minimumSet;
  const msRows = idsTable(ms?.lineIds);
  if (r?.substitution?.lineIds?.length) {
    msRows.push([], [t('sub.title')], ...idsTable(r.substitution.lineIds));
  }
  add(msRows, 'ex.sheet.minset');
  add([
    [t('col.supplier'), t('col.country'), t('col.lines'), t('col.cost', { cur }), t('rq.priority')],
    ...requestList(r).map((q) => [q.supplier, q.country ?? '', q.lines.map(lineRef).join(', '), round2(q.cost), q.priority ? t('ex.yes') : t('ex.no')]),
  ], 'ex.sheet.suppliers');
  add([
    [t('ex.warn.code'), t('ex.warn.text'), t('ex.warn.line')],
    ...(Array.isArray(r?.warnings) ? r.warnings : []).map((w) => {
      const l = w.lineId !== undefined && w.lineId !== null ? lineById(w.lineId) : null;
      return [w.code ?? '', w[state.lang] || w.cs || '', l ? lineRef(l) : ''];
    }),
  ], 'ex.sheet.warnings');
  const name = `${t('ex.file.result')}-${fileStamp()}.xlsx`;
  XLSX.writeFile(wb, name, { compression: true });
  setStatus(msg, esc(t('ex.done', { name })), 'ok');
}

function saveProject() {
  const name = `${t('ex.file.project')}-${fileStamp()}.json`;
  download(name, JSON.stringify(projectObject(), null, 2), 'application/json');
  setStatus($('#export-msg'), esc(t('ex.done', { name })), 'ok');
}

/* print: force the light palette and expand collapsed parts */

let printState = null;
function beforePrint() {
  const root = document.documentElement;
  printState = { theme: root.getAttribute('data-theme'), details: $$('details:not([open])') };
  root.setAttribute('data-theme', 'light');
  printState.details.forEach((d) => { d.open = true; });
}
function afterPrint() {
  if (!printState) return;
  const root = document.documentElement;
  if (printState.theme === null) root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', printState.theme);
  printState.details.forEach((d) => { d.open = false; });
  printState = null;
}

/* ------------------------------------------------------------------- events */

function bindEvents() {
  $('#lang-switch').addEventListener('click', (e) => {
    const b = e.target.closest('[data-setlang]');
    if (b) setLang(b.dataset.setlang);
  });

  $('#btn-sample').addEventListener('click', loadSample);
  $('#btn-sample-2').addEventListener('click', loadSample);
  $('#btn-upload').addEventListener('click', () => $('#file-input').click());
  $('#file-input').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    handleFile(f).finally(() => { e.target.value = ''; });
  });
  const openProject = () => $('#project-input').click();
  $('#btn-project').addEventListener('click', openProject);
  $('#btn-load').addEventListener('click', openProject);
  $('#project-input').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) loadProjectFile(f).finally(() => { e.target.value = ''; });
  });
  $('#btn-paste').addEventListener('click', loadPasted);
  $('#paste-area').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      loadPasted();
    }
  });

  // drag & drop on the data box
  const zone = $('#sec-data');
  const hasFiles = (e) => Array.from(e.dataTransfer?.types || []).includes('Files');
  zone.addEventListener('dragover', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    zone.classList.add('is-drop');
  });
  zone.addEventListener('dragleave', (e) => {
    if (!zone.contains(e.relatedTarget)) zone.classList.remove('is-drop');
  });
  zone.addEventListener('drop', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    zone.classList.remove('is-drop');
    handleFile(e.dataTransfer.files[0]);
  });
  window.addEventListener('dragover', (e) => { if (hasFiles(e)) e.preventDefault(); });
  window.addEventListener('drop', (e) => { if (hasFiles(e) && !zone.contains(e.target)) e.preventDefault(); });

  // mapping
  $('#mapping').addEventListener('change', (e) => {
    const src = state.source;
    if (!src) return;
    if (e.target.id === 'map-header') {
      src.headerIdx = Number(e.target.value) || 0;
      try {
        src.mapping = normalizeMapping(detectColumns(src.rows[src.headerIdx].map(String)));
      } catch {
        src.mapping = normalizeMapping({});
      }
    } else if (e.target.matches('select[data-col]')) {
      const col = Number(e.target.dataset.col);
      const field = e.target.value;
      for (const f of FIELDS) if (src.mapping[f] === col) src.mapping[f] = null;
      if (field) src.mapping[field] = col;
    } else {
      return;
    }
    const focusId = e.target.id || null;
    const focusCol = e.target.dataset.col;
    buildLinesFromSource();
    afterDataLoaded('data.loaded', src.name);
    const again = focusId ? document.getElementById(focusId) : $(`#mapping select[data-col="${focusCol}"]`);
    if (again) again.focus();
  });

  // settings
  $('#set-pack').addEventListener('change', (e) => {
    state.settings.pack = e.target.value;
    renderPackInfo();
    recompute();
    renderAll(false);
  });
  $('#set-currency').addEventListener('change', (e) => changeCurrency(e.target.value));
  $('#set-today').addEventListener('change', (e) => {
    state.settings.today = isIsoDate(e.target.value) ? e.target.value : todayIso();
    e.target.value = state.settings.today;
    recompute();
    renderAll(true);
  });
  const applyRisk = (value) => {
    const codes = String(value).split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean)
      .map((s) => { try { return normalizeCountry(s); } catch { return null; } }).filter(Boolean);
    state.settings.risk = Array.from(new Set(codes));
    $('#set-risk').value = state.settings.risk.join(', ');
    recompute();
    renderAll(false);
  };
  $('#set-risk').addEventListener('change', (e) => applyRisk(e.target.value));
  $('#btn-risk-reset').addEventListener('click', () => applyRisk((DEFAULT_RISK || []).join(',')));

  $('#fx-grid').addEventListener('change', (e) => {
    const code = e.target.dataset.fx;
    if (!code) return;
    const v = parseDecimal(e.target.value);
    state.settings.fx[code] = Number.isFinite(v) && v > 0 ? v : null;
    recompute();
    renderFx();
    renderAll(true);
    const again = document.getElementById(`fx-${code}`);
    if (again && document.activeElement === document.body) again.focus();
  });
  $('#fx-grid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-fx-rm]');
    if (!b) return;
    delete state.settings.fx[b.dataset.fxRm];
    renderSettings();
    recompute();
    renderAll(true);
    $('#fx-new').focus();
  });
  const addFx = () => {
    const input = $('#fx-new');
    const code = input.value.trim().toUpperCase();
    const msg = $('#fx-msg');
    if (!/^[A-Z]{3}$/.test(code)) {
      msg.textContent = t('set.fxBadCode');
      input.focus();
      return;
    }
    msg.textContent = '';
    if (!(code in state.settings.fx)) state.settings.fx[code] = null;
    input.value = '';
    renderSettings();
    const field = document.getElementById(`fx-${code}`);
    if (field) field.focus();
  };
  $('#btn-fx-add').addEventListener('click', addFx);
  $('#fx-new').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFx();
    }
  });

  // results
  $('#btn-copy-cat').addEventListener('click', async () => {
    const ok = await copyText(categoriesTsv());
    if (ok) toast(t('cat.copied'));
  });
  $('#rq-buyer').addEventListener('input', (e) => { state.settings.buyer = e.target.value; });
  $('#rq-deadline').addEventListener('change', (e) => { state.settings.deadline = isIsoDate(e.target.value) ? e.target.value : ''; });
  $('#requests').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    const i = Number(b.dataset.i);
    if (b.dataset.act === 'decl') openDeclaration(i, b.dataset.dl);
    else if (b.dataset.act === 'mail') copyMail(i, b.dataset.ml);
  });

  const lnBody = $('#ln-body');
  lnBody.addEventListener('change', (e) => {
    if (e.target.matches('[data-f]')) applyLineEdit(e.target, true);
  });
  lnBody.addEventListener('input', (e) => {
    if (e.target.matches('input[data-f="origin"]')) applyLineEditLive(e.target);
  });
  $('#ln-only').addEventListener('change', (e) => {
    state.filter.onlyUndoc = e.target.checked;
    renderLines();
  });
  $('#ln-search').addEventListener('input', debounce((e) => {
    state.filter.q = e.target.value;
    renderLines();
  }, 200));

  $('#warnings').addEventListener('click', (e) => {
    const a = e.target.closest('a[data-goto]');
    if (!a) return;
    e.preventDefault();
    gotoLine(Number(a.dataset.goto));
  });

  $('#data-status').addEventListener('click', (e) => {
    const a = e.target.closest('a.status__link');
    if (!a) return;
    e.preventDefault();
    const sec = $('#sec-results');
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    sec.focus({ preventScroll: true });
  });

  // export
  $('#btn-csv').addEventListener('click', exportCsv);
  $('#btn-xlsx').addEventListener('click', exportXlsx);
  $('#btn-save').addEventListener('click', saveProject);
  $('#btn-print').addEventListener('click', () => window.print());
  window.addEventListener('beforeprint', beforePrint);
  window.addEventListener('afterprint', afterPrint);

  const dlg = $('#copy-dialog');
  if (dlg) {
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  }
}

/* --------------------------------------------------------------------- init */

function init() {
  state.lang = initialLang();
  applyStatic();
  buildDatalist();
  renderSettings();
  bindEvents();
  renderAll(true);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
