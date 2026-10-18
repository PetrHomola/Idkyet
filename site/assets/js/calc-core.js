/**
 * CIRUS Origin: calculation core.
 *
 * Pure functions without DOM; ES module for browsers and Node 22.
 * Computes the share of components originating outside the "home" countries
 * (EU27 + associated countries, depending on the rule pack) in the cost of
 * components of an end product, by EDIP method (a) and (b), in three scenarios.
 * Nothing is rounded here; formatting is left to the UI.
 *
 * Imports only ./countries.js.
 */

import { EU27, normalizeCountry, isCountryCode } from './countries.js';

/* ------------------------------------------------------------------------ */
/* Constants                                                                */
/* ------------------------------------------------------------------------ */

/** Component categories from the Commission "Procurement strategy" template. */
export const CATEGORIES = Object.freeze([
  { id: 'structural', cs: 'Konstrukce a mechanika', en: 'Structural and mechanical' },
  { id: 'power', cs: 'Pohon a energie', en: 'Power and energy' },
  { id: 'instrumentation', cs: 'Přístroje a monitorování', en: 'Instrumentation and monitoring' },
  { id: 'safety', cs: 'Bezpečnost a ochrana', en: 'Safety and protection' },
  { id: 'electronics', cs: 'Elektronika a komunikace', en: 'Electronics and comms' },
]);

/** Label of the extra category row for lines without a category. */
export const UNCATEGORIZED = Object.freeze({ id: 'none', cs: 'Bez kategorie', en: 'Uncategorized' });

const EEA_EFTA = ['IS', 'LI', 'NO'];

/**
 * Rule packs. `home` is a Set of ISO2 codes counted as "home" origin (the code
 * 'EU' for an origin stated as European Union is home in every pack).
 * `kind` is 'standard' (non-home share <= threshold) or 'canada'
 * (home share >= homeMin, other third countries <= threshold and <= home share,
 * Canadian components unlimited).
 */
export const RULE_PACKS = Object.freeze({
  SAFE: Object.freeze({
    id: 'SAFE',
    cs: 'SAFE (nařízení 2025/1106)',
    en: 'SAFE (Regulation 2025/1106)',
    home: new Set([...EU27, ...EEA_EFTA, 'UA', 'EU']),
    threshold: 0.35,
    kind: 'standard',
    source: 'Nařízení Rady (EU) 2025/1106, čl. 16 odst. 10',
    sourceEn: 'Council Regulation (EU) 2025/1106, Article 16(10)',
    url: 'https://eur-lex.europa.eu/eli/reg/2025/1106/oj/eng',
  }),
  UASL: Object.freeze({
    id: 'UASL',
    cs: 'Půjčka pro Ukrajinu (2026/467)',
    en: 'Ukraine loan (Regulation 2026/467)',
    home: new Set([...EU27, ...EEA_EFTA, 'UA', 'EU']),
    threshold: 0.35,
    kind: 'standard',
    source: 'Nařízení (EU) 2026/467, čl. 13 odst. 4 písm. g)',
    sourceEn: 'Regulation (EU) 2026/467, Article 13(4)(g)',
    url: null,
  }),
  EDIP: Object.freeze({
    id: 'EDIP',
    cs: 'EDIP – program (2025/2643, čl. 10)',
    en: 'EDIP – programme (2025/2643, Art. 10)',
    home: new Set([...EU27, 'NO', 'EU']),
    threshold: 0.35,
    kind: 'standard',
    source: 'Nařízení (EU) 2025/2643, čl. 10 odst. 3 a 4',
    sourceEn: 'Regulation (EU) 2025/2643, Article 10(3) and (4)',
    url: 'https://eur-lex.europa.eu/eli/reg/2025/2643/oj/eng',
  }),
  EDIP_USI: Object.freeze({
    id: 'EDIP_USI',
    cs: 'EDIP – nástroj pro Ukrajinu (čl. 27)',
    en: 'EDIP – Ukraine Support Instrument (Art. 27)',
    home: new Set([...EU27, 'UA', 'EU']),
    threshold: 0.35,
    kind: 'standard',
    source: 'Nařízení (EU) 2025/2643, čl. 27',
    sourceEn: 'Regulation (EU) 2025/2643, Article 27',
    url: 'https://eur-lex.europa.eu/eli/reg/2025/2643/oj/eng',
  }),
  EU_CANADA: Object.freeze({
    id: 'EU_CANADA',
    cs: 'SAFE – dohoda EU–Kanada (čl. 5 odst. 8)',
    en: 'SAFE – EU–Canada agreement (Art. 5(8))',
    home: new Set([...EU27, ...EEA_EFTA, 'UA', 'EU']),
    canada: 'CA',
    threshold: 0.35,
    homeMin: 0.2,
    kind: 'canada',
    source: 'Dohoda mezi EU a Kanadou o účasti Kanady v nástroji SAFE, čl. 5 odst. 8',
    sourceEn: 'Agreement between the EU and Canada on the participation of Canada in SAFE, Article 5(8)',
    url: null,
  }),
});

/** Default risk countries (a warning, not a legal conclusion). */
export const DEFAULT_RISK = Object.freeze(['RU', 'BY', 'IR', 'KP']);

/** Evidence types that document origin (subject to validUntil). */
export const DOCUMENT_TYPES = Object.freeze(['customs', 'declaration', 'contract']);
/** All evidence values. */
export const EVIDENCE_TYPES = Object.freeze(['customs', 'declaration', 'contract', 'assumed', 'none']);
/** Line types. */
export const LINE_TYPES = Object.freeze(['tier1', 'inhouse', 'raw']);

/**
 * Input fields that detectColumns() can map, with labels for a mapping UI.
 * `totalCost` and `id` are optional extras: a line total is used to derive the
 * unit cost when no unit cost column is present.
 */
export const FIELDS = Object.freeze([
  { id: 'partNo', cs: 'Číslo dílu', en: 'Part number' },
  { id: 'description', cs: 'Popis', en: 'Description' },
  { id: 'supplier', cs: 'Dodavatel', en: 'Supplier' },
  { id: 'supplierCountry', cs: 'Země dodavatele', en: 'Supplier country' },
  { id: 'category', cs: 'Kategorie', en: 'Category' },
  { id: 'qty', cs: 'Množství', en: 'Quantity' },
  { id: 'unitCost', cs: 'Jednotková cena', en: 'Unit cost' },
  { id: 'totalCost', cs: 'Cena celkem', en: 'Total cost' },
  { id: 'currency', cs: 'Měna', en: 'Currency' },
  { id: 'origin', cs: 'Země původu', en: 'Country of origin' },
  { id: 'evidence', cs: 'Doklad', en: 'Evidence' },
  { id: 'validUntil', cs: 'Platnost do', en: 'Valid until' },
  { id: 'expectedOrigin', cs: 'Odhad původu', en: 'Expected origin' },
  { id: 'type', cs: 'Typ', en: 'Type' },
  { id: 'note', cs: 'Poznámka', en: 'Note' },
  { id: 'id', cs: 'ID řádku', en: 'Line ID' },
]);

const DOC_SET = new Set(DOCUMENT_TYPES);
const EPS = 1e-12;
const DAY_MS = 86400000;

/* ------------------------------------------------------------------------ */
/* Text helpers                                                             */
/* ------------------------------------------------------------------------ */

const SPECIAL_CHARS = { 'ł': 'l', 'ß': 'ss', 'ø': 'o', 'æ': 'ae', 'œ': 'oe', 'đ': 'd' };

/** Lowercase, no diacritics, punctuation turned into single spaces. */
function norm(s) {
  if (s == null) return '';
  return String(s)
    .toLowerCase()
    .replace(/[łßøæœđ]/g, (c) => SPECIAL_CHARS[c])
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function isBlank(v) {
  return v == null || (typeof v === 'string' && v.trim() === '') || (typeof v === 'number' && Number.isNaN(v));
}

function str(v) {
  return v == null ? '' : String(v).trim();
}

// Values that mean "origin not known" ('-', '?', 'N/A', 'neznámá', 'TBD' ...).
// They give an empty country (status 'unknown'), not a country outside the EU.
const NO_COUNTRY = new Set([
  'n a', 'n d', 'nevim', 'nevime', 'nezname', 'neznamy', 'neznama', 'nezn', 'nezjisteno', 'nezjistena',
  'nezjisteny', 'neuvedeno', 'neuveden', 'neuvedena', 'neurceno', 'neurcena', 'nedoplneno', 'chybi',
  'zjistit', 'zjistuje se', 'overit', 'k overeni', 'ceka se', 'bez udaje', 'zadna', 'zadny', 'nic',
  'unknown', 'unk', 'not known', 'not available', 'missing', 'none', 'null', 'nan', 'tbd', 'tba', 'tbc',
  'to be confirmed', 'to be defined', 'x', 'xx', 'xxx',
]);

/** True when a country cell is empty or only says that the country is not known. */
function noCountry(v) {
  if (isBlank(v)) return true;
  const n = norm(v);
  return n === '' || NO_COUNTRY.has(n);
}

// ISO codes that are often meant as something else in Czech and Slovak data.
const AMBIGUOUS_CODES = {
  SR: {
    cs: 'kód SR je Surinam. Pokud jde o Slovensko (Slovenská republika), použijte SK.',
    en: 'SR is the code for Suriname. For Slovakia use SK.',
  },
  NA: {
    cs: 'kód NA je Namibie. Pokud původ neznáte, nechte pole prázdné.',
    en: 'NA is the code for Namibia. If the origin is not known, leave the field empty.',
  },
};

/* ------------------------------------------------------------------------ */
/* CSV / TSV parsing                                                        */
/* ------------------------------------------------------------------------ */

function parseWith(s, d) {
  const rows = [];
  let row = [];
  let field = '';
  let inQ = false;
  let quoted = false;
  // An opening quote that is never closed would swallow the rest of the text.
  // Parsing goes back to it once and reads quotes from there on as plain characters.
  let open = null;
  let plainFrom = Infinity;
  const n = s.length;
  for (let i = 0; i < n; i++) {
    const ch = s[i];
    if (inQ) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQ = false;
          open = null;
        }
      } else {
        field += ch;
      }
      if (inQ && i === n - 1 && open) {
        plainFrom = open.i;
        rows.length = open.rows;
        row = open.row;
        row.length = open.rowLen;
        field = open.field;
        quoted = false;
        inQ = false;
        i = open.i - 1;
        open = null;
      }
      continue;
    }
    if (ch === '"' && !quoted && field.trim() === '' && i < plainFrom) {
      if (i === n - 1) {
        field += ch;
        continue;
      }
      open = { i, rows: rows.length, row, rowLen: row.length, field };
      inQ = true;
      quoted = true;
      field = '';
      continue;
    }
    if (ch === d) {
      row.push(field);
      field = '';
      quoted = false;
      continue;
    }
    if (ch === '\r' || ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      quoted = false;
      if (ch === '\r' && s[i + 1] === '\n') i++;
      continue;
    }
    field += ch;
  }
  if (field !== '' || quoted || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/**
 * Guesses the delimiter of a delimited text: tab, semicolon, comma or pipe.
 * Picks the candidate that yields the widest consistent table. The reference
 * width is the first row with at least two cells, so a title line above the
 * header ("Kusovník PM7") does not decide the delimiter.
 * @param {string} text
 * @returns {string}
 */
export function detectDelimiter(text) {
  const sample = String(text ?? '').slice(0, 20000);
  let best = ',';
  let bestScore = 0;
  for (const d of ['\t', ';', ',', '|']) {
    const rows = parseWith(sample, d)
      .filter((r) => r.some((c) => c.trim() !== ''))
      .slice(0, 50);
    if (!rows.length) continue;
    const ref = rows.slice(0, 10).find((r) => r.length >= 2);
    const w = ref ? ref.length : 0;
    if (w < 2) continue;
    const ok = rows.filter((r) => r.length <= w).length;
    const score = (w * ok) / rows.length;
    if (score > bestScore + 1e-9) {
      best = d;
      bestScore = score;
    }
  }
  return best;
}

/**
 * Parses CSV (comma or semicolon), TSV (pasted from Excel) or pipe-separated text.
 * Handles quoted fields with delimiters, newlines and escaped quotes (""),
 * a UTF-8 BOM, CRLF/LF/CR line ends and Excel's "sep=;" first line.
 * Cells are trimmed; empty rows are dropped.
 *
 * @param {string} text
 * @param {{delimiter?: string}} [options] Force a delimiter instead of detecting it.
 * @returns {string[][]}
 */
export function parseTable(text, options = {}) {
  if (text == null) return [];
  let s = String(text);
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  let delim = options.delimiter || null;
  const sep = /^\s*sep=(.)[ \t]*(\r\n|\n|\r|$)/i.exec(s);
  if (sep) {
    delim = delim || sep[1];
    s = s.slice(sep[0].length);
  }
  if (!delim) delim = detectDelimiter(s);
  return parseWith(s, delim)
    .map((r) => r.map((c) => c.trim()))
    .filter((r) => r.some((c) => c !== ''));
}

/* ------------------------------------------------------------------------ */
/* Numbers, dates, currencies                                               */
/* ------------------------------------------------------------------------ */

function cleanNumberText(v) {
  return String(v)
    .replace(/[−‒–—]/g, '-')
    .replace(/[\s     '’`]/g, '')
    .replace(/[^\d.,()+-]/g, '');
}

/**
 * Detects the decimal separator used in a column of numbers.
 * @param {Array<unknown>} values
 * @returns {','|'.'|null} null when the values do not tell.
 */
export function detectDecimal(values) {
  let comma = 0;
  let dot = 0;
  let ambComma = 0;
  let ambDot = 0;
  for (const v of values || []) {
    if (v == null || typeof v === 'number') continue;
    const s = cleanNumberText(v);
    const ci = s.lastIndexOf(',');
    const di = s.lastIndexOf('.');
    if (ci >= 0 && di >= 0) {
      if (ci > di) comma += 10;
      else dot += 10;
    } else if (ci >= 0) {
      if (s.indexOf(',') !== ci) dot += 5;
      else if (s.length - ci - 1 !== 3) comma += 1;
      else ambComma += 1;
    } else if (di >= 0) {
      if (s.indexOf('.') !== di) comma += 5;
      else if (s.length - di - 1 !== 3) dot += 1;
      else ambDot += 1;
    }
  }
  if (comma > dot) return ',';
  if (dot > comma) return '.';
  if (ambComma >= 2 && !ambDot) return '.';
  if (ambDot >= 2 && !ambComma) return ',';
  return null;
}

/**
 * Parses a number written the Czech, German or English way.
 * '1 234,50', '1,234.50', '1234.5', '1.234,50', non-breaking spaces,
 * currency marks ('Kč', 'EUR', '€', '$') and '(123)' for negative numbers.
 * A single separator followed by exactly three digits ('1,234' or '1.234') is
 * ambiguous; it is read as a decimal separator unless `decimal` says otherwise.
 *
 * @param {unknown} value
 * @param {','|'.'|null} [decimal] Decimal separator hint (see detectDecimal).
 * @returns {number|null} The number, null for an empty value, NaN when unreadable.
 */
export function parseNumber(value, decimal = null) {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (typeof value === 'boolean') return NaN;
  const raw = String(value).trim();
  if (!raw) return null;
  // Scientific notation from spreadsheets: '1.5E+06', '2,5e3'.
  const sci = /^([-+−]?\d+(?:[.,]\d+)?)\s*[eE]\s*([-+−]?\d{1,3})$/.exec(raw);
  if (sci) {
    const num = Number(`${sci[1].replace(',', '.').replace('−', '-')}e${sci[2].replace('−', '-')}`);
    return Number.isFinite(num) ? num : NaN;
  }
  let s = cleanNumberText(raw);
  if (!/\d/.test(s)) return /^[-–—]+$/.test(raw) ? null : NaN;
  // Letters between digits ('12x5', '3 ks 2') make the value unreadable.
  if (/\d\s*\p{L}+\s*\d/u.test(raw.replace(/[   ]/g, ' '))) return NaN;
  let neg = false;
  if (/^\(.*\)$/.test(s)) {
    neg = true;
    s = s.slice(1, -1);
  }
  if (s.startsWith('-')) {
    neg = !neg;
    s = s.slice(1);
  } else if (s.startsWith('+')) {
    s = s.slice(1);
  }
  if (s.endsWith('-')) s = s.slice(0, -1); // "1 234,-"
  if (!/^[\d.,]+$/.test(s)) return NaN;
  const ci = s.lastIndexOf(',');
  const di = s.lastIndexOf('.');
  // Thousands groups must have three digits: '1.234.567' yes, '31.3.2027' (a date) no.
  const grouped = (intPart, sep) => intPart.split(sep).every((g, k) => (k === 0 ? /^\d{1,3}$/.test(g) : /^\d{3}$/.test(g)));
  let out;
  if (ci >= 0 && di >= 0) {
    const [dec, th] = ci > di ? [',', '.'] : ['.', ','];
    const at = Math.max(ci, di);
    if (s.indexOf(dec) !== at || !grouped(s.slice(0, at), th)) return NaN;
    out = `${s.slice(0, at).split(th).join('')}.${s.slice(at + 1)}`;
  } else if (ci >= 0) {
    const multiple = s.indexOf(',') !== ci;
    let thousands = multiple || (decimal === '.' && s.length - ci - 1 === 3);
    if (thousands && !grouped(s, ',')) {
      if (multiple) return NaN;
      thousands = false;
    }
    out = thousands ? s.replace(/,/g, '') : s.replace(',', '.');
  } else if (di >= 0) {
    const multiple = s.indexOf('.') !== di;
    let thousands = multiple || (decimal === ',' && s.length - di - 1 === 3);
    if (thousands && !grouped(s, '.')) {
      if (multiple) return NaN;
      thousands = false;
    }
    out = thousands ? s.replace(/\./g, '') : s;
  } else {
    out = s;
  }
  if (!/^\d*\.?\d+$|^\d+\.$/.test(out)) return NaN;
  const num = Number(out);
  if (!Number.isFinite(num)) return NaN;
  return neg ? -num : num;
}

const CURRENCY_WORDS = [
  [/k[čc]|czk/i, 'CZK'],
  [/€|eur/i, 'EUR'],
  [/us\$|usd|\$/i, 'USD'],
  [/£|gbp/i, 'GBP'],
  [/chf|sfr/i, 'CHF'],
  [/z[łl]|pln/i, 'PLN'],
];

/**
 * Normalizes a currency code or symbol ('Kč' -> 'CZK', '€' -> 'EUR', 'usd' -> 'USD').
 * @param {unknown} value
 * @returns {string|null} Upper-case ISO 4217 code, or null.
 */
export function normalizeCurrency(value) {
  const s = str(value);
  if (!s) return null;
  const up = s.toUpperCase().replace(/[\s.]/g, '');
  const table = {
    'KČ': 'CZK', KC: 'CZK', 'KČS': 'CZK', CZK: 'CZK', ',-': 'CZK',
    '€': 'EUR', EUR: 'EUR', EURO: 'EUR', EUROS: 'EUR',
    $: 'USD', US$: 'USD', USD: 'USD', 'DOLLAR': 'USD',
    '£': 'GBP', GBP: 'GBP', CHF: 'CHF', SFR: 'CHF', FR: 'CHF',
    'ZŁ': 'PLN', ZL: 'PLN', PLN: 'PLN',
  };
  if (table[up]) return table[up];
  if (/^[A-Z]{3}$/.test(up)) return up;
  return null;
}

/** Finds a currency mentioned in a text such as '12,50 EUR' or 'Cena (Kč)'. */
export function currencyFromText(text) {
  const s = str(text);
  if (!s) return null;
  for (const [re, code] of CURRENCY_WORDS) if (re.test(s)) return code;
  return null;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function isoDate(y, m, d) {
  if (!(y >= 1900 && y <= 2200 && m >= 1 && m <= 12 && d >= 1 && d <= 31)) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

/**
 * Parses a date to 'YYYY-MM-DD'.
 * Accepts '2027-03-31', '31. 3. 2027', '31.03.2027', '31/03/2027' (day first unless
 * the second number is above 12), '2027/03/31', Date objects and Excel serial numbers.
 * @param {unknown} value
 * @returns {string|null} ISO date or null when empty or unreadable.
 */
export function parseDate(value) {
  if (value == null) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return isoDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }
  if (typeof value === 'number') return excelSerial(value);
  const s = String(value).trim();
  if (!s) return null;
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:$|[T\s])/.exec(s);
  if (m) return isoDate(+m[1], +m[2], +m[3]);
  m = /^(\d{4})[/.](\d{1,2})[/.](\d{1,2})\.?$/.exec(s);
  if (m) return isoDate(+m[1], +m[2], +m[3]);
  m = /^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{2}|\d{4})$/.exec(s);
  if (m) return isoDate(year(m[3]), +m[2], +m[1]);
  m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/.exec(s);
  if (m) {
    const a = +m[1];
    const b = +m[2];
    if (b > 12 && a <= 12) return isoDate(year(m[3]), a, b);
    return isoDate(year(m[3]), b, a);
  }
  if (/^\d{4,6}(\.\d+)?$/.test(s)) return excelSerial(Number(s));
  return null;
}

function year(y) {
  const n = Number(y);
  return y.length === 2 ? 2000 + n : n;
}

function excelSerial(n) {
  if (!Number.isFinite(n) || n < 20000 || n > 120000) return null;
  const dt = new Date(Date.UTC(1899, 11, 30) + Math.floor(n) * DAY_MS);
  return isoDate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

function localToday() {
  const d = new Date();
  return isoDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function dayNumber(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return NaN;
  return Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / DAY_MS);
}

/* ------------------------------------------------------------------------ */
/* Value vocabularies (CZ / EN)                                             */
/* ------------------------------------------------------------------------ */

const CATEGORY_EXACT = new Map();
for (const c of CATEGORIES) {
  for (const label of [c.id, c.cs, c.en]) CATEGORY_EXACT.set(norm(label), c.id);
}
[
  ['structural mechanical', 'structural'], ['mechanical', 'structural'], ['konstrukce', 'structural'],
  ['mechanika', 'structural'], ['power energy', 'power'], ['energy', 'power'], ['energie', 'power'],
  ['pohon', 'power'], ['instrumentation monitoring', 'instrumentation'], ['monitoring', 'instrumentation'],
  ['pristroje', 'instrumentation'], ['safety protection', 'safety'], ['protection', 'safety'],
  ['bezpecnost', 'safety'], ['ochrana', 'safety'], ['electronics comms', 'electronics'],
  ['electronics communications', 'electronics'], ['elektronika', 'electronics'], ['komunikace', 'electronics'],
  ['comms', 'electronics'], ['1', 'structural'], ['2', 'power'], ['3', 'instrumentation'], ['4', 'safety'],
  ['5', 'electronics'],
].forEach(([k, v]) => CATEGORY_EXACT.set(k, v));

const CATEGORY_STEMS = [
  ['structural', ['konstruk', 'mechani', 'struct', 'struktur', 'strojn', 'nosn', 'karoser', 'hull', 'frame']],
  ['power', ['pohon', 'energ', 'power', 'propuls', 'napajen', 'motor', 'engine', 'bateri', 'batter', 'akumul', 'hydraul', 'prevod', 'gear']],
  ['instrumentation', ['pristroj', 'monitor', 'instrument', 'mereni', 'meric', 'senzor', 'sensor', 'snimac', 'cidl', 'measur']],
  ['safety', ['bezpec', 'ochran', 'safety', 'protect', 'pancer', 'armo', 'balist', 'ballist', 'hasic', 'fire', 'brzd', 'brake']],
  ['electronics', ['elektron', 'electron', 'komunik', 'comm', 'spoj', 'radio', 'software', 'elektr', 'electr', 'kabel', 'cable']],
];

/**
 * Maps a category value in Czech or English to a category id.
 * @param {unknown} value e.g. 'Elektronika', 'electronics', 'Konstrukce a mechanika', 'safety'.
 * @returns {'structural'|'power'|'instrumentation'|'safety'|'electronics'|null}
 */
export function normalizeCategory(value) {
  const n = norm(value);
  if (!n) return null;
  const compact = n.replace(/\b(a|and|und|i)\b/g, ' ').replace(/\s+/g, ' ').trim();
  if (CATEGORY_EXACT.has(n)) return CATEGORY_EXACT.get(n);
  if (CATEGORY_EXACT.has(compact)) return CATEGORY_EXACT.get(compact);
  for (const token of n.split(' ')) {
    for (const [id, stems] of CATEGORY_STEMS) {
      if (stems.some((st) => token.startsWith(st))) return id;
    }
  }
  return null;
}

/** First rule whose stem matches: phrases by substring, stems of up to 3 letters as whole tokens, longer stems as token prefixes. */
function matchStems(n, rules) {
  const tokens = n.split(' ');
  for (const [id, stems] of rules) {
    for (const st of stems) {
      if (st.includes(' ')) {
        if (` ${n} `.includes(` ${st}`)) return id;
      } else if (tokens.some((t) => (st.length <= 3 ? t === st : t.startsWith(st)))) {
        return id;
      }
    }
  }
  return null;
}

const EVIDENCE_NONE = new Set([
  'none', 'zadny', 'zadne', 'zadna', 'nic', 'chybi', 'missing', 'no', 'ne', 'n a', 'na', 'x', '0', 'neni',
  'neuvedeno', 'bez', 'bez dokladu', 'nedolozeno', 'not documented', 'no evidence', 'nema', 'nemame',
]);
const EVIDENCE_RULES = [
  ['none', ['bez dokl', 'chybi', 'missing', 'vyzadan', 'pozadovan', 'request', 'ceka', 'pending', 'nedoloz', 'neni k dispozici']],
  ['customs', ['celni', 'clo', 'cla', 'customs', 'jsd', 'sad', 'mrn', 'dovozn', 'import', 'osvedcen', 'certif', 'vyvozn', 'export decl']],
  ['declaration', ['prohlas', 'declar', 'vyhlas', 'ltsd', 'cestne', 'dodavatelsk', 'statement']],
  ['contract', ['smlouv', 'zmluv', 'contract', 'kupni', 'ramcov', 'agreement']],
  ['assumed', ['odhad', 'predpokl', 'assum', 'estimat', 'expect', 'neover', 'unverif', 'ustne', 'verbal', 'email', 'e mail', 'domnen', 'udaj']],
];

/**
 * Maps an evidence value in Czech or English to an evidence type.
 * 'celní doklad'/'customs' -> customs, 'prohlášení'/'declaration' -> declaration,
 * 'smlouva'/'contract' -> contract, 'odhad'/'assumed' -> assumed, 'žádný'/'none' -> none.
 * @param {unknown} value
 * @returns {'customs'|'declaration'|'contract'|'assumed'|'none'|null} null when empty or not recognized.
 */
export function normalizeEvidence(value) {
  const n = norm(value);
  if (!n) return null;
  if (EVIDENCE_TYPES.includes(n)) return n;
  if (EVIDENCE_NONE.has(n)) return 'none';
  const id = matchStems(n, EVIDENCE_RULES);
  if (id) return id;
  if (n === 'sd' || n === 'doc') return 'declaration';
  return null;
}

const TYPE_RULES = [
  ['inhouse', ['inhouse', 'in house', 'vlastni', 'own', 'make', 'interni', 'internal', 'vyroba', 'vyrobeno u nas', 'domaci vyroba']],
  ['raw', ['raw', 'surovin', 'material', 'hutni', 'commodity']],
  ['tier1', ['tier1', 'tier 1', 't1', 'nakup', 'nakupovan', 'purchas', 'bought', 'buy', 'dil', 'komponent', 'component', 'dodavk', 'part', 'sestav']],
];

/**
 * Maps a line type value in Czech or English to 'tier1', 'inhouse' or 'raw'.
 * 'vlastní výroba'/'in-house' -> inhouse, 'surovina'/'raw material' -> raw,
 * 'nakupovaný díl'/'tier-1'/'purchased' -> tier1.
 * @param {unknown} value
 * @returns {'tier1'|'inhouse'|'raw'|null} null when empty or not recognized.
 */
export function normalizeType(value) {
  const n = norm(value);
  if (!n) return null;
  if (LINE_TYPES.includes(n)) return n;
  const joined = n.replace(/\s+/g, '');
  if (joined === 'tier1' || joined === 't1') return 'tier1';
  if (joined === 'inhouse') return 'inhouse';
  return matchStems(n, TYPE_RULES);
}

/* ------------------------------------------------------------------------ */
/* Column detection                                                         */
/* ------------------------------------------------------------------------ */

const SYNONYMS = {
  id: ['id radku', 'line id', 'row id', 'id'],
  partNo: ['cislo dilu', 'cislo soucastky', 'cislo polozky', 'katalogove cislo', 'kat cislo', 'objednaci cislo',
    'cislo materialu', 'oznaceni dilu', 'part no', 'part number', 'part nr', 'part', 'pn', 'p n', 'item no',
    'item number', 'material number', 'dil', 'polozka', 'item'],
  description: ['popis', 'popis dilu', 'popis polozky', 'nazev', 'nazev dilu', 'nazev polozky', 'description',
    'desc', 'name', 'item description', 'part description', 'part name'],
  supplier: ['dodavatel', 'nazev dodavatele', 'supplier', 'supplier name', 'vendor', 'vendor name', 'prodejce',
    'dodavatel nazev', 'vyrobce', 'manufacturer'],
  supplierCountry: ['zeme dodavatele', 'stat dodavatele', 'sidlo dodavatele', 'zeme sidla dodavatele',
    'dodavatel zeme', 'supplier country', 'vendor country', 'country of supplier', 'supplier country code',
    'supplier location'],
  category: ['kategorie', 'kategorie komponenty', 'kategorie dilu', 'skupina', 'category', 'component category',
    'commodity', 'komodita'],
  qty: ['mnozstvi', 'pocet', 'pocet kusu', 'ks', 'mnozstvi na vyrobek', 'mnozstvi ks', 'qty', 'quantity', 'pcs',
    'qty per unit', 'quantity per unit', 'units'],
  unitCost: ['jednotkova cena', 'cena za kus', 'cena ks', 'cena za jednotku', 'nakupni cena', 'cena', 'unit cost',
    'unit price', 'price', 'cost', 'price per unit', 'cost per unit', 'net price', 'naklad', 'naklady'],
  totalCost: ['cena celkem', 'celkova cena', 'celkem', 'naklady celkem', 'celkove naklady', 'total', 'total cost',
    'total price', 'line total', 'extended cost', 'extended price', 'amount'],
  currency: ['mena', 'currency', 'curr', 'ccy', 'mena ceny'],
  origin: ['zeme puvodu', 'puvod', 'stat puvodu', 'zeme puvodu dilu', 'nepreferencni puvod', 'country of origin',
    'origin', 'coo', 'origin country', 'made in', 'zeme', 'stat', 'country'],
  evidence: ['doklad', 'doklad o puvodu', 'dolozeni', 'dolozeni puvodu', 'podklad', 'evidence', 'proof',
    'proof of origin', 'origin evidence', 'document', 'evidence type'],
  validUntil: ['platnost do', 'platne do', 'platnost', 'plati do', 'platnost prohlaseni', 'valid until', 'valid to',
    'validity', 'expiry', 'expiry date', 'expires', 'expiration', 'expiration date'],
  expectedOrigin: ['odhad puvodu', 'odhadovany puvod', 'odhadovana zeme puvodu', 'predpokladany puvod',
    'predpokladana zeme puvodu', 'ocekavany puvod', 'ocekavana zeme puvodu', 'pravdepodobny puvod',
    'zeme puvodu odhad', 'puvod odhad', 'expected origin', 'assumed origin', 'estimated origin', 'likely origin',
    'probable origin', 'origin estimate', 'origin expected', 'odhad'],
  type: ['typ', 'typ radku', 'typ polozky', 'druh', 'druh polozky', 'type', 'line type', 'item type',
    'make or buy', 'make buy'],
  note: ['poznamka', 'poznamky', 'komentar', 'note', 'notes', 'comment', 'comments', 'remark', 'remarks'],
};

const SYN_TOKENS = Object.fromEntries(
  Object.entries(SYNONYMS).map(([f, list]) => [f, list.map((s) => ({ tokens: s.split(' '), compact: s.replace(/ /g, '') }))]),
);

function tokenMatch(headerTokens, synTokens) {
  const n = synTokens.length;
  outer: for (let i = 0; i + n <= headerTokens.length; i++) {
    for (let j = 0; j < n; j++) {
      const h = headerTokens[i + j];
      const t = synTokens[j];
      const ok = t.length <= 3 ? h === t : h.startsWith(t);
      if (!ok) continue outer;
    }
    return true;
  }
  return false;
}

/**
 * Detects which column holds which field, from Czech or English headers.
 * Exact matches win over partial ones; each column is used at most once.
 *
 * @param {string[]} headers Header row.
 * @returns {Record<string, number|null>} Field id -> column index (keys as in FIELDS, null when not found).
 */
export function detectColumns(headers) {
  const result = {};
  for (const f of FIELDS) result[f.id] = null;
  if (!Array.isArray(headers)) return result;
  const cands = [];
  headers.forEach((h, col) => {
    const n = norm(h);
    if (!n) return;
    const tokens = n.split(' ');
    const compact = n.replace(/ /g, '');
    for (const [field, syns] of Object.entries(SYN_TOKENS)) {
      let best = 0;
      for (const syn of syns) {
        let score = 0;
        if (compact === syn.compact) score = 1000 + syn.compact.length;
        else if (tokenMatch(tokens, syn.tokens)) score = 100 + syn.compact.length;
        if (score > best) best = score;
      }
      if (best) cands.push({ field, col, score: best });
    }
  });
  const order = FIELDS.map((f) => f.id);
  cands.sort((x, y) => y.score - x.score || order.indexOf(x.field) - order.indexOf(y.field) || x.col - y.col);
  const usedCols = new Set();
  for (const c of cands) {
    if (result[c.field] != null || usedCols.has(c.col)) continue;
    result[c.field] = c.col;
    usedCols.add(c.col);
  }
  return result;
}

/* ------------------------------------------------------------------------ */
/* Rows -> lines                                                            */
/* ------------------------------------------------------------------------ */

const TOTAL_ROW_WORDS = new Set(['celkem', 'total', 'soucet', 'suma', 'sum', 'mezisoucet', 'subtotal', 'grand total',
  'celkova cena', 'celkem za vyrobek']);

function looksNumeric(v) {
  if (typeof v === 'number') return Number.isFinite(v);
  const s = str(v).replace(/(kč|czk|eur|€|usd|\$|gbp|£|chf|pln|zł)\.?$/i, '').trim();
  return /^[\s\d.,'’()+\-\u2212\u00a0\u202f]*\d[\s\d.,'’()+\-\u2212\u00a0\u202f]*$/.test(s);
}

function looksLikeHeader(row, mapping) {
  const det = detectColumns(row);
  const hits = Object.values(det).filter((v) => v != null).length;
  if (hits < 2) return false;
  const costCol = mapping.unitCost ?? mapping.totalCost;
  if (costCol != null && looksNumeric(row[costCol])) return false;
  const agree = Object.keys(mapping).filter((k) => mapping[k] != null && det[k] === mapping[k]).length;
  return agree >= 1 || hits >= 3;
}

function issue(row, lineId, field, value, code, cs, en) {
  return { row, lineId, field, value: value == null ? '' : String(value), code, cs, en };
}

let idSeq = 0;
function newId() {
  idSeq += 1;
  return `M${Date.now().toString(36)}${idSeq.toString(36)}`;
}

/**
 * Builds a line with defaults and normalized values (countries, evidence, type,
 * category, currency, date). Useful for manual entry and for loading saved projects.
 * A missing id is generated (unique within the session).
 * Countries that cannot be recognized are kept as upper-case text so that
 * analyze() can warn about them.
 *
 * @param {object} [partial]
 * @param {{currency?: string}} [options] Project currency used when the line has none.
 * @returns {object} Line as described in SPEC section 7.
 */
export function makeLine(partial = {}, options = {}) {
  const p = partial || {};
  const country = (v) => {
    if (noCountry(v)) return null;
    return normalizeCountry(v) || String(v).trim().toUpperCase();
  };
  const qty = isBlank(p.qty) ? 1 : parseNumber(p.qty);
  const unit = isBlank(p.unitCost) ? null : parseNumber(p.unitCost);
  return {
    id: isBlank(p.id) ? newId() : String(p.id),
    partNo: str(p.partNo),
    description: str(p.description),
    supplier: str(p.supplier),
    supplierCountry: country(p.supplierCountry),
    category: normalizeCategory(p.category),
    qty: Number.isFinite(qty) ? qty : null,
    unitCost: Number.isFinite(unit) ? unit : null,
    currency: normalizeCurrency(p.currency) || normalizeCurrency(options.currency) || 'CZK',
    origin: country(p.origin),
    evidence: normalizeEvidence(p.evidence) || 'none',
    validUntil: parseDate(p.validUntil),
    expectedOrigin: country(p.expectedOrigin),
    type: normalizeType(p.type) || 'tier1',
    note: str(p.note),
  };
}

/**
 * Converts parsed rows to lines.
 *
 * `rows` may include the header row: it is skipped when it looks like a header
 * (or set `hasHeader` explicitly). Numbers accept decimal commas and spaces
 * ('1 234,50'); the decimal separator is detected per column. Categories,
 * evidence and type values accept Czech and English words. Rows whose part
 * number, description or supplier is just "Celkem"/"Total" are skipped.
 * Missing quantity cells give `qty: null` (computed as 1, analyze() warns);
 * an unmapped quantity column gives qty 1. A currency written next to the
 * cost ('12,50 EUR') or in the cost header ('Cena (EUR)') is used when the
 * currency cell is empty.
 *
 * @param {Array<Array<unknown>>} rows Output of parseTable() or rows from a spreadsheet.
 * @param {Record<string, number|null>} mapping Output of detectColumns() (possibly edited).
 * @param {{currency?: string, hasHeader?: boolean}} [options]
 * @returns {{lines: object[], errors: Array<{row: number, lineId: string|null, field: string|null, value: string, code: string, cs: string, en: string}>}}
 *   `row` is the 1-based index in `rows`.
 */
export function rowsToLines(rows, mapping, options = {}) {
  const lines = [];
  const errors = [];
  const map = { ...(mapping || {}) };
  const projectCurrency = normalizeCurrency(options.currency) || 'CZK';
  if (!Array.isArray(rows) || !rows.length) return { lines, errors };

  let start = 0;
  let headerRow = null;
  const hasHeader = options.hasHeader ?? looksLikeHeader(rows[0] || [], map);
  if (hasHeader) {
    start = 1;
    headerRow = rows[0];
  }
  const cell = (r, f) => (map[f] == null ? undefined : r[map[f]]);

  if (map.unitCost == null && map.totalCost == null) {
    errors.push(issue(null, null, 'unitCost', '', 'no-cost-column',
      'Chybí sloupec s cenou. Přiřaďte jednotkovou cenu nebo cenu celkem.',
      'No cost column. Map the unit cost or the total cost.'));
  }

  const data = rows.slice(start);
  const hint = (f) => (map[f] == null ? null : detectDecimal(data.map((r) => (Array.isArray(r) ? r[map[f]] : null))));
  const decQty = hint('qty');
  const decUnit = hint('unitCost');
  const decTotal = hint('totalCost');
  const headerCurrency = headerRow
    ? currencyFromText(map.unitCost != null ? headerRow[map.unitCost] : '') ||
      currencyFromText(map.totalCost != null ? headerRow[map.totalCost] : '')
    : null;

  const usedIds = new Set();
  data.forEach((r, i) => {
    if (!Array.isArray(r)) return;
    const rowNo = start + i + 1;
    const mappedCells = Object.keys(map).filter((f) => map[f] != null).map((f) => cell(r, f));
    if (mappedCells.every(isBlank)) return;

    const partNo = str(cell(r, 'partNo'));
    const description = str(cell(r, 'description'));
    const supplier = str(cell(r, 'supplier'));
    if ([partNo, description, supplier].some((v) => v && TOTAL_ROW_WORDS.has(norm(v))) && !(partNo && description && supplier)) {
      errors.push(issue(rowNo, null, null, partNo || description || supplier, 'skipped-total-row',
        'Řádek vypadá jako součet, a proto se přeskočil.',
        'The row looks like a total and was skipped.'));
      return;
    }

    let id = str(cell(r, 'id'));
    if (!id || usedIds.has(id)) {
      let k = lines.length + 1;
      while (usedIds.has(`L${k}`)) k++;
      id = `L${k}`;
    }
    usedIds.add(id);

    const err = (field, value, code, cs, en) => errors.push(issue(rowNo, id, field, value, code, cs, en));

    const country = (field) => {
      const v = cell(r, field);
      if (noCountry(v)) return null;
      const c = normalizeCountry(v);
      if (c) return c;
      err(field, v, 'unknown-country', `Neznámá země „${str(v)}“.`, `Unknown country "${str(v)}".`);
      return String(v).trim().toUpperCase();
    };

    let qty = 1;
    if (map.qty != null) {
      const v = cell(r, 'qty');
      if (isBlank(v)) {
        qty = null;
      } else {
        const q = parseNumber(v, decQty);
        if (Number.isFinite(q)) qty = q;
        else {
          qty = null;
          err('qty', v, 'invalid-number', `Množství „${str(v)}“ nejde přečíst jako číslo.`, `Quantity "${str(v)}" is not a number.`);
        }
      }
    }

    let unitCost = null;
    const rawUnit = cell(r, 'unitCost');
    const rawTotal = cell(r, 'totalCost');
    if (!isBlank(rawUnit)) {
      const u = parseNumber(rawUnit, decUnit);
      if (Number.isFinite(u)) unitCost = u;
      else err('unitCost', rawUnit, 'invalid-number', `Cenu „${str(rawUnit)}“ nejde přečíst jako číslo.`, `Cost "${str(rawUnit)}" is not a number.`);
    }
    if (unitCost == null && !isBlank(rawTotal)) {
      const t = parseNumber(rawTotal, decTotal);
      if (Number.isFinite(t)) {
        const q = qty == null ? 1 : qty;
        unitCost = q ? t / q : t;
      } else {
        err('totalCost', rawTotal, 'invalid-number', `Cenu „${str(rawTotal)}“ nejde přečíst jako číslo.`, `Cost "${str(rawTotal)}" is not a number.`);
      }
    }

    let currency = null;
    const rawCur = cell(r, 'currency');
    if (!isBlank(rawCur)) {
      currency = normalizeCurrency(rawCur);
      if (!currency) err('currency', rawCur, 'unknown-currency', `Neznámá měna „${str(rawCur)}“.`, `Unknown currency "${str(rawCur)}".`);
    }
    if (!currency) {
      currency = currencyFromText(typeof rawUnit === 'string' ? rawUnit : '') ||
        currencyFromText(typeof rawTotal === 'string' ? rawTotal : '') ||
        headerCurrency || projectCurrency;
    }

    const rawCat = cell(r, 'category');
    const category = normalizeCategory(rawCat);
    if (!category && !isBlank(rawCat)) err('category', rawCat, 'unknown-category', `Neznámá kategorie „${str(rawCat)}“.`, `Unknown category "${str(rawCat)}".`);

    const rawEv = cell(r, 'evidence');
    let evidence = normalizeEvidence(rawEv);
    if (!evidence) {
      if (!isBlank(rawEv)) err('evidence', rawEv, 'unknown-evidence', `Neznámý typ dokladu „${str(rawEv)}“, počítá se jako bez dokladu.`, `Unknown evidence type "${str(rawEv)}", treated as none.`);
      evidence = 'none';
    }

    const rawValid = cell(r, 'validUntil');
    const validUntil = parseDate(rawValid);
    if (!validUntil && !isBlank(rawValid)) err('validUntil', rawValid, 'invalid-date', `Datum „${str(rawValid)}“ nejde přečíst.`, `Date "${str(rawValid)}" cannot be read.`);

    const rawType = cell(r, 'type');
    let type = normalizeType(rawType);
    if (!type) {
      if (!isBlank(rawType)) err('type', rawType, 'unknown-type', `Neznámý typ řádku „${str(rawType)}“, počítá se jako nakupovaný díl (tier-1).`, `Unknown line type "${str(rawType)}", treated as a tier-1 part.`);
      type = 'tier1';
    }

    lines.push({
      id,
      partNo,
      description,
      supplier,
      supplierCountry: country('supplierCountry'),
      category,
      qty,
      unitCost,
      currency,
      origin: country('origin'),
      evidence,
      validUntil,
      expectedOrigin: country('expectedOrigin'),
      type,
      note: str(cell(r, 'note')),
    });
  });
  return { lines, errors };
}

/* ------------------------------------------------------------------------ */
/* Line cost and status                                                     */
/* ------------------------------------------------------------------------ */

function toNum(v) {
  if (typeof v === 'number') return v;
  const n = parseNumber(v);
  return n == null ? NaN : n;
}

/**
 * Exchange rate of a currency into the project currency, or NaN when unknown.
 * @param {string|null} cur
 * @param {Record<string, number>} fx
 * @param {string} [projectCurrency]
 */
function rateOf(cur, fx, projectCurrency) {
  if (!cur) return 1;
  if (projectCurrency && cur === projectCurrency) return 1;
  const r = fx ? toNum(fx[cur]) : NaN;
  return Number.isFinite(r) && r > 0 ? r : NaN;
}

/**
 * Cost of a line in the project currency: qty * unitCost * fx[currency].
 * A missing or unreadable quantity counts as 1; a missing unit cost or an
 * unknown exchange rate gives 0. A negative quantity or unit cost gives a
 * negative cost, even when both are negative (analyze() excludes such lines and warns).
 *
 * @param {object} line
 * @param {Record<string, number>} fx Rates into the project currency (project currency = 1).
 * @param {string} [projectCurrency] Lines in this currency use rate 1 even if fx lacks it.
 * @returns {number}
 */
export function lineCost(line, fx = {}, projectCurrency) {
  if (!line) return 0;
  let q = isBlank(line.qty) ? 1 : toNum(line.qty);
  if (!Number.isFinite(q)) q = 1;
  const u = isBlank(line.unitCost) ? 0 : toNum(line.unitCost);
  if (!Number.isFinite(u)) return 0;
  const cur = isBlank(line.currency) ? null : normalizeCurrency(line.currency);
  if (!isBlank(line.currency) && !cur) return 0;
  const rate = rateOf(cur, fx, normalizeCurrency(projectCurrency));
  if (!Number.isFinite(rate)) return 0;
  let cost = q * u * rate;
  if (!Number.isFinite(cost)) return 0;
  // A negative quantity or price stays negative (-2 x -50 is not +100), so analyze() excludes it.
  if (q < 0 || u < 0) cost = -Math.abs(cost);
  return cost;
}

/**
 * Documentation status of a line.
 * - 'documented': origin filled, evidence customs/declaration/contract and not expired (validUntil >= today);
 * - 'stated': origin filled but evidence missing, assumed/none, or expired;
 * - 'unknown': no origin.
 *
 * @param {object} line
 * @param {string} [today] 'YYYY-MM-DD'; defaults to the local date.
 * @returns {'documented'|'stated'|'unknown'}
 */
export function lineStatus(line, today) {
  if (!line || isBlank(line.origin)) return 'unknown';
  const ev = normalizeEvidence(line.evidence);
  if (!ev || !DOC_SET.has(ev)) return 'stated';
  const valid = parseDate(line.validUntil);
  if (!valid) {
    // An unreadable validity date cannot prove validity.
    return isBlank(line.validUntil) ? 'documented' : 'stated';
  }
  const t = parseDate(today) || localToday();
  return valid >= t ? 'documented' : 'stated';
}

/* ------------------------------------------------------------------------ */
/* Analysis                                                                 */
/* ------------------------------------------------------------------------ */

function czPlural(n, one, few, many) {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}

const FIELD_LABELS = {
  origin: { cs: 'země původu', en: 'country of origin' },
  expectedOrigin: { cs: 'odhad původu', en: 'expected origin' },
  supplierCountry: { cs: 'země dodavatele', en: 'supplier country' },
};

function resolvePack(p) {
  if (p && typeof p === 'object' && p.home instanceof Set) return p;
  const key = String(p || 'SAFE').toUpperCase();
  return RULE_PACKS[key] || RULE_PACKS.SAFE;
}

function normalizeFx(fx, currency) {
  const out = {};
  for (const [k, v] of Object.entries(fx || {})) {
    const code = normalizeCurrency(k);
    const n = toNum(v);
    if (code && Number.isFinite(n) && n > 0) out[code] = n;
  }
  out[currency] = 1;
  return out;
}

/**
 * Analyzes lines against a rule pack.
 *
 * Only tier-1 lines enter the numerator; in-house lines (type 'inhouse') add to
 * the method (b) denominator; raw materials ('raw') are excluded. Lines without
 * an id get `L<index+1>`. Unknown country codes count as outside the home
 * countries. Negative lines are excluded with a warning.
 *
 * Scenarios: worst (only documented home origins count as home), expected
 * (origin, else expected origin, else supplier country, else non-home),
 * best (origin when filled, unknown lines count as home).
 *
 * For the 'canada' rule pack: `nonHome`/`ratio` refer to components from other
 * third countries (the part capped at 35 %); each scenario also has
 * `costs {home, canada, other}` and `shares {home, canada, other}`. For method (b)
 * in-house costs count as home (as Canadian when the in-house line's origin is CA).
 *
 * @param {object[]} lines
 * @param {{pack?: string, fx?: Record<string, number>, currency?: string, today?: string, risk?: string[]}} [options]
 * @returns {object} Result: {pack, rule, currency, today, fx, threshold, totals, methods, verdict, status,
 *   headroom, minimumSet, substitution, categories, evidence, supplierRequests, warnings, lines}.
 *   `status` is 'pass' (worst case passes), 'depends' (worst fails, best passes),
 *   'fail' (best fails) or 'nodata'.
 */
export function analyze(lines, options = {}) {
  const opts = options || {};
  const pack = resolvePack(opts.pack);
  const isCanada = pack.kind === 'canada';
  const thr = Number.isFinite(pack.threshold) ? pack.threshold : 0.35;
  const homeMin = isCanada ? (Number.isFinite(pack.homeMin) ? pack.homeMin : 0.2) : 0;
  const currency = normalizeCurrency(opts.currency) || 'CZK';
  const fx = normalizeFx(opts.fx || { [currency]: 1 }, currency);
  const today = parseDate(opts.today) || localToday();
  const todayNo = dayNumber(today);
  const riskList = Array.isArray(opts.risk) ? opts.risk : DEFAULT_RISK;
  const risk = new Set(riskList.map((c) => normalizeCountry(c)).filter(Boolean));
  const warnings = [];
  const warn = (w) => warnings.push({ severity: 'warning', ...w });

  /* --- prepare lines --- */
  const items = (Array.isArray(lines) ? lines : []).map((raw, index) => {
    const line = raw || {};
    const id = isBlank(line.id) ? `L${index + 1}` : String(line.id);
    const type = normalizeType(line.type) || 'tier1';
    const countryOf = (field) => {
      const v = line[field];
      if (noCountry(v)) return null;
      const c = normalizeCountry(v);
      if (c) {
        if (AMBIGUOUS_CODES[c] && type !== 'raw') {
          warnings.push({
            severity: 'info', code: 'ambiguous-country', lineId: id, field, country: c,
            cs: `${capital(FIELD_LABELS[field].cs)}: ${AMBIGUOUS_CODES[c].cs}`,
            en: `${capital(FIELD_LABELS[field].en)}: ${AMBIGUOUS_CODES[c].en}`,
          });
        }
        return c;
      }
      const text = String(v).trim();
      if (type !== 'raw') {
        warn({
          code: 'unknown-country', lineId: id, field,
          cs: `Neznámá země „${text}“ (${FIELD_LABELS[field].cs}). Počítá se jako země mimo EU.`,
          en: `Unknown country "${text}" (${FIELD_LABELS[field].en}). Treated as outside the EU.`,
        });
      }
      return text.toUpperCase();
    };
    const origin = countryOf('origin');
    const expectedOrigin = countryOf('expectedOrigin');
    const supplierCountry = countryOf('supplierCountry');
    const evidence = normalizeEvidence(line.evidence) || 'none';
    const validUntil = parseDate(line.validUntil);
    const status = lineStatus({ origin, evidence, validUntil: isBlank(line.validUntil) ? null : (validUntil || line.validUntil) }, today);
    if (type === 'tier1' && !validUntil && !isBlank(line.validUntil) && DOC_SET.has(evidence)) {
      warn({
        code: 'invalid-date', lineId: id, field: 'validUntil',
        cs: `Platnost dokladu „${str(line.validUntil)}“ nejde přečíst. Řádek se počítá jako nedoložený.`,
        en: `The validity date "${str(line.validUntil)}" cannot be read. The line counts as not documented.`,
      });
    }
    const category = normalizeCategory(line.category);

    let cost = lineCost(line, fx, currency);
    if (type !== 'raw') {
      // qty absent (undefined) silently means 1; an explicitly empty or unreadable qty is reported.
      const qBlank = line.qty === null || (typeof line.qty === 'string' && line.qty.trim() === '');
      const q = isBlank(line.qty) ? 1 : toNum(line.qty);
      const u = isBlank(line.unitCost) ? null : toNum(line.unitCost);
      const cur = isBlank(line.currency) ? null : normalizeCurrency(line.currency) || str(line.currency);
      if (u == null || !Number.isFinite(u)) {
        warn({
          code: 'missing-cost', lineId: id, field: 'unitCost',
          cs: 'Chybí jednotková cena nebo ji nejde přečíst. Řádek se počítá s nulovým nákladem.',
          en: 'The unit cost is missing or unreadable. The line is counted at zero cost.',
        });
      }
      if (qBlank || !Number.isFinite(q)) {
        warn({
          code: 'missing-qty', lineId: id, field: 'qty',
          cs: 'Chybí množství nebo ho nejde přečíst. Počítá se 1 kus.',
          en: 'The quantity is missing or unreadable. Counted as 1 unit.',
        });
      }
      if ((Number.isFinite(q) && q < 0) || (u != null && Number.isFinite(u) && u < 0)) {
        warn({
          code: 'negative-value', lineId: id, field: Number.isFinite(q) && q < 0 ? 'qty' : 'unitCost',
          cs: 'Záporné množství nebo cena. Řádek se do výpočtu nezapočítal.',
          en: 'Negative quantity or cost. The line is excluded from the calculation.',
        });
      }
      if (cur && cur !== currency && !Number.isFinite(rateOf(cur, fx, currency))) {
        warn({
          code: 'unknown-currency', lineId: id, field: 'currency',
          cs: `Pro měnu ${cur} chybí kurz. Řádek se počítá s nulovým nákladem, doplňte kurz.`,
          en: `There is no exchange rate for ${cur}. The line is counted at zero cost; add the rate.`,
        });
      }
    }
    if (!(cost > 0)) cost = 0;

    const effectiveOrigin = origin || expectedOrigin || supplierCountry || null;
    return {
      index, id, line, type, origin, expectedOrigin, supplierCountry, effectiveOrigin,
      evidence, validUntil, status, category, cost,
      group: null, inMinimumSet: false, inSubstitution: false,
    };
  });

  const seenIds = new Set();
  for (const it of items) {
    if (seenIds.has(it.id)) {
      warn({
        code: 'duplicate-id', lineId: it.id, field: 'id',
        cs: `ID řádku „${it.id}“ se opakuje. Výsledky u řádků se mohou zaměnit.`,
        en: `Line ID "${it.id}" is used more than once. Per-line results may be mixed up.`,
      });
    }
    seenIds.add(it.id);
  }

  const groupOf = (code) => {
    if (!code) return null;
    if (pack.home.has(code)) return 'home';
    if (isCanada && code === (pack.canada || 'CA')) return 'canada';
    return 'nonHome';
  };

  const tier1 = items.filter((it) => it.type === 'tier1');
  const inhouse = items.filter((it) => it.type === 'inhouse');
  const raw = items.filter((it) => it.type === 'raw');

  for (const it of tier1) {
    it.group = {
      worst: it.status === 'documented' ? groupOf(it.origin) : 'nonHome',
      expected: groupOf(it.effectiveOrigin) || 'nonHome',
      best: it.origin ? groupOf(it.origin) : 'home',
    };
  }

  const sum = (arr) => arr.reduce((s, it) => s + it.cost, 0);
  const tier1Total = sum(tier1);
  const inhouseTotal = sum(inhouse);
  const rawTotal = sum(raw);
  const inhouseCanada = isCanada ? sum(inhouse.filter((it) => it.origin === (pack.canada || 'CA'))) : 0;
  const bUsed = inhouse.length > 0;

  /* --- scenarios --- */
  const SCEN = ['worst', 'expected', 'best'];
  const stateFor = (scen, method) => {
    const s = { home: 0, canada: 0, nonHome: 0 };
    for (const it of tier1) s[it.group[scen]] += it.cost;
    if (method === 'b') {
      s.home += inhouseTotal - inhouseCanada;
      s.canada += inhouseCanada;
    }
    return s;
  };
  // Without tier-1 costs there is nothing to evaluate, even if in-house costs exist.
  const hasData = tier1Total > 0;
  const passes = (s, D) => {
    if (!hasData || !(D > 0)) return null;
    if (isCanada) {
      return s.home / D >= homeMin - EPS && s.nonHome / D <= thr + EPS && s.nonHome <= s.home + EPS * D;
    }
    return s.nonHome / D <= thr + EPS;
  };
  const scenarioResult = (s, D) => {
    const r = { nonHome: s.nonHome, ratio: hasData && D > 0 ? s.nonHome / D : null, pass: passes(s, D) };
    if (isCanada) {
      r.costs = { home: s.home, canada: s.canada, other: s.nonHome };
      r.shares = hasData && D > 0
        ? { home: s.home / D, canada: s.canada / D, other: s.nonHome / D }
        : { home: null, canada: null, other: null };
    }
    return r;
  };
  const denominators = { a: tier1Total, b: tier1Total + inhouseTotal };
  const methods = {};
  for (const m of ['a', 'b']) {
    const D = denominators[m];
    const scenarios = {};
    for (const scen of SCEN) scenarios[scen] = scenarioResult(stateFor(scen, m), D);
    methods[m] = { used: m === 'a' ? true : bUsed, denominator: D, scenarios };
  }

  const better = (x, y) => {
    if (x.pass !== y.pass) return x.pass === true;
    if (x.ratio == null) return false;
    if (y.ratio == null) return true;
    return x.ratio < y.ratio - EPS;
  };
  const pick = (scen) => (bUsed && better(methods.b.scenarios[scen], methods.a.scenarios[scen]) ? 'b' : 'a');

  const verdict = {};
  for (const scen of SCEN) {
    const m = pick(scen);
    verdict[scen] = { pass: methods[m].scenarios[scen].pass, method: m };
  }
  let status;
  if (verdict.worst.pass === null) status = 'nodata';
  else if (verdict.worst.pass) status = 'pass';
  else if (verdict.best.pass) status = 'depends';
  else status = 'fail';

  /* --- headroom --- */
  const headroomAmount = (s, D) => {
    if (!hasData || !(D > 0)) return null;
    if (isCanada) return Math.min(thr * D - s.nonHome, s.home - homeMin * D, (s.home - s.nonHome) / 2);
    return thr * D - s.nonHome;
  };
  const headroom = {};
  for (const scen of ['worst', 'expected']) {
    const m = verdict[scen].method;
    headroom[scen] = { method: m, amount: headroomAmount(stateFor(scen, m), denominators[m]) };
  }

  /* --- minimum evidence set --- */
  const byCostDesc = (x, y) => y.cost - x.cost || x.index - y.index;
  const minCandidates = tier1
    .filter((it) => it.status !== 'documented' && it.cost > 0 &&
      (it.group.expected === 'home' || (isCanada && it.group.expected === 'canada')))
    .sort(byCostDesc);

  const otherOk = (s, D) => s.nonHome / D <= thr + EPS && s.nonHome <= s.home + EPS * D;
  const minimumSetFor = (m) => {
    const D = denominators[m];
    const s = stateFor('worst', m);
    const needed = hasData && D > 0 ? Math.max(0, s.nonHome - thr * D) : 0;
    const out = { method: m, lineIds: [], count: 0, coveredCost: 0, feasible: false, needed };
    if (!hasData || !(D > 0)) return out;
    if (passes(s, D)) {
      out.feasible = true;
      return out;
    }
    for (const it of minCandidates) {
      // EU–Canada: a Canadian line only lowers the "other" share; skip it once just the home minimum is missing.
      if (isCanada && it.group.expected === 'canada' && otherOk(s, D)) continue;
      s.nonHome -= it.cost;
      s[it.group.expected] += it.cost;
      out.lineIds.push(it.id);
      out.coveredCost += it.cost;
      if (passes(s, D)) {
        out.feasible = true;
        break;
      }
    }
    out.count = out.lineIds.length;
    return out;
  };
  const setOptions = [minimumSetFor('a')];
  if (bUsed) setOptions.push(minimumSetFor('b'));
  const preferred = verdict.worst.method;
  setOptions.sort((x, y) => {
    if (x.feasible !== y.feasible) return x.feasible ? -1 : 1;
    if (x.count !== y.count) return x.count - y.count;
    if (Math.abs(x.coveredCost - y.coveredCost) > EPS) return x.coveredCost - y.coveredCost;
    return (x.method === preferred ? 0 : 1) - (y.method === preferred ? 0 : 1);
  });
  let minimumSet = setOptions[0];
  if (!minimumSet.feasible && setOptions.length > 1) {
    // Neither is feasible: use the method that is more favourable in the expected scenario.
    minimumSet = setOptions.find((o) => o.method === verdict.expected.method) || minimumSet;
  }
  const minSetIds = new Set(minimumSet.lineIds);

  /* --- substitution --- */
  let substitution = null;
  if (!minimumSet.feasible && tier1Total > 0) {
    const m = minimumSet.method;
    const D = denominators[m];
    const s = stateFor('expected', m);
    substitution = { method: m, lineIds: [], count: 0, cost: 0, feasible: passes(s, D) === true };
    if (!substitution.feasible) {
      // Lines outside the home countries (expected scenario), largest first. In the EU–Canada
      // pack Canadian lines can be replaced too (they raise the home share): lines from other
      // third countries go first while the "other" limits fail, then the larger of the two.
      const pool = tier1.filter((it) => it.group.expected === 'nonHome' && it.cost > 0).sort(byCostDesc);
      const caPool = isCanada ? tier1.filter((it) => it.group.expected === 'canada' && it.cost > 0).sort(byCostDesc) : [];
      while (pool.length || caPool.length) {
        let it;
        if (!caPool.length || (pool.length && !otherOk(s, D))) it = pool.shift();
        else if (!pool.length) it = caPool.shift();
        else it = pool[0].cost >= caPool[0].cost ? pool.shift() : caPool.shift();
        if (it.group.expected === 'canada') s.canada -= it.cost;
        else s.nonHome -= it.cost;
        s.home += it.cost;
        substitution.lineIds.push(it.id);
        substitution.cost += it.cost;
        if (passes(s, D)) {
          substitution.feasible = true;
          break;
        }
      }
    }
    substitution.count = substitution.lineIds.length;
  }
  const subIds = new Set(substitution ? substitution.lineIds : []);

  for (const it of items) {
    it.inMinimumSet = minSetIds.has(it.id);
    it.inSubstitution = subIds.has(it.id);
  }

  /* --- categories (expected scenario) --- */
  const catMethod = verdict.expected.method;
  const catDen = denominators[catMethod];
  const catRows = [...CATEGORIES, UNCATEGORIZED].map((c) => ({
    id: c.id, cs: c.cs, en: c.en, lines: 0, total: 0, nonHome: 0, canada: 0, undocumented: 0,
    nonHomeShare: null, contribution: null, contributionByMethod: { a: null, b: null }, totalShare: null,
  }));
  const catIndex = Object.fromEntries(catRows.map((c, i) => [c.id, i]));
  for (const it of tier1) {
    const c = catRows[catIndex[it.category || 'none']];
    c.lines += 1;
    c.total += it.cost;
    if (it.group.expected === 'nonHome') c.nonHome += it.cost;
    if (it.group.expected === 'canada') c.canada += it.cost;
    if (it.status !== 'documented') c.undocumented += it.cost;
  }
  for (const c of catRows) {
    c.nonHomeShare = c.total > 0 ? c.nonHome / c.total : null;
    c.contribution = catDen > 0 ? c.nonHome / catDen : null;
    c.contributionByMethod = {
      a: denominators.a > 0 ? c.nonHome / denominators.a : null,
      b: bUsed && denominators.b > 0 ? c.nonHome / denominators.b : null,
    };
    c.totalShare = tier1Total > 0 ? c.total / tier1Total : null;
    if (!isCanada) delete c.canada;
  }
  const categories = catRows.filter((c) => c.id !== 'none' || c.lines > 0);

  /* --- evidence --- */
  const evidence = {
    documented: { count: 0, cost: 0 },
    stated: { count: 0, cost: 0 },
    unknown: { count: 0, cost: 0 },
    documentedShare: null,
    expired: [],
    expiringSoon: [],
  };
  for (const it of tier1) {
    evidence[it.status].count += 1;
    evidence[it.status].cost += it.cost;
    if (DOC_SET.has(it.evidence) && it.validUntil) {
      const days = dayNumber(it.validUntil) - todayNo;
      const entry = {
        lineId: it.id, partNo: str(it.line.partNo), description: str(it.line.description),
        supplier: str(it.line.supplier), origin: it.origin, evidence: it.evidence,
        validUntil: it.validUntil, cost: it.cost,
      };
      if (days < 0) evidence.expired.push({ ...entry, daysAgo: -days });
      else if (days <= 90 && it.origin) evidence.expiringSoon.push({ ...entry, daysLeft: days });
    }
  }
  evidence.documentedShare = tier1Total > 0 ? evidence.documented.cost / tier1Total : null;
  evidence.expired.sort((x, y) => (x.validUntil < y.validUntil ? -1 : x.validUntil > y.validUntil ? 1 : y.cost - x.cost));
  evidence.expiringSoon.sort((x, y) => x.daysLeft - y.daysLeft || y.cost - x.cost);

  /* --- supplier requests --- */
  const groups = new Map();
  for (const it of tier1) {
    if (it.status === 'documented') continue;
    const name = str(it.line.supplier);
    const key = norm(name);
    let g = groups.get(key);
    if (!g) {
      g = {
        supplier: name, supplierCountry: null, lineIds: [], lines: 0, cost: 0, priority: false,
        priorityLineIds: [], priorityCost: 0, stated: 0, unknown: 0, expired: 0,
      };
      groups.set(key, g);
    }
    if (!g.supplier && name) g.supplier = name;
    if (!g.supplierCountry && it.supplierCountry) g.supplierCountry = it.supplierCountry;
    g.lineIds.push(it.id);
    g.lines += 1;
    g.cost += it.cost;
    g[it.status] += 1;
    if (it.origin && DOC_SET.has(it.evidence) && it.validUntil && it.validUntil < today) g.expired += 1;
    if (it.inMinimumSet) {
      g.priority = true;
      g.priorityLineIds.push(it.id);
      g.priorityCost += it.cost;
    }
  }
  const supplierRequests = [...groups.values()].sort(
    (x, y) => (x.priority === y.priority ? 0 : x.priority ? -1 : 1) || y.cost - x.cost || x.supplier.localeCompare(y.supplier),
  );
  for (const g of supplierRequests) g.country = g.supplierCountry;

  /* --- warnings: risk countries, China, categories, no data --- */
  for (const it of tier1) {
    const checks = [
      ['origin', it.origin || it.expectedOrigin, it.origin ? 'origin' : 'expectedOrigin'],
      ['supplierCountry', it.supplierCountry, 'supplierCountry'],
    ];
    const seen = new Set();
    for (const [, code, field] of checks) {
      if (!code || seen.has(code)) continue;
      seen.add(code);
      if (risk.has(code)) {
        warnings.push({
          severity: 'error', code: 'risk-country', lineId: it.id, field, country: code,
          cs: `${capital(FIELD_LABELS[field].cs)} ${code} je na seznamu rizikových zemí. SAFE i EDIP vylučují díly ze zemí, které jsou v rozporu s bezpečnostními a obrannými zájmy EU. Ověřte původ; nejde o právní závěr.`,
          en: `${capital(FIELD_LABELS[field].en)} ${code} is on the risk country list. SAFE and EDIP exclude components from countries contrary to the security and defence interests of the EU. Verify the origin; this is not a legal conclusion.`,
        });
      } else if (code === 'CN') {
        warnings.push({
          severity: 'info', code: 'check-individually', lineId: it.id, field, country: code,
          cs: `${capital(FIELD_LABELS[field].cs)} CN (Čína): ověřte individuálně.`,
          en: `${capital(FIELD_LABELS[field].en)} CN (China): check individually.`,
        });
      }
    }
  }
  const noCat = tier1.filter((it) => !it.category).map((it) => it.id);
  if (noCat.length) {
    const n = noCat.length;
    warnings.push({
      severity: 'warning', code: 'missing-category', lineId: null, lineIds: noCat, count: n,
      cs: `${n} ${czPlural(n, 'řádek nemá', 'řádky nemají', 'řádků nemá')} kategorii. Rozpad po kategoriích pro šablonu Komise bude neúplný.`,
      en: `${n} ${n === 1 ? 'line has' : 'lines have'} no category. The category breakdown for the Commission template will be incomplete.`,
    });
  }
  if (!(tier1Total > 0)) {
    warnings.push({
      severity: 'error', code: 'no-data', lineId: null,
      cs: 'Chybí nakupované díly (tier-1) s cenou. Výsledek nejde spočítat.',
      en: 'There are no tier-1 parts with a cost. The result cannot be calculated.',
    });
  }

  /* --- per-line results --- */
  const lineResults = items.map((it) => ({
    id: it.id,
    index: it.index,
    type: it.type,
    cost: it.cost,
    status: it.status,
    origin: it.origin,
    effectiveOrigin: it.effectiveOrigin,
    category: it.category,
    group: it.group,
    inMinimumSet: it.inMinimumSet,
    inSubstitution: it.inSubstitution,
  }));

  return {
    pack: pack.id,
    rule: {
      id: pack.id, cs: pack.cs, en: pack.en, kind: pack.kind, threshold: thr,
      homeMin: isCanada ? homeMin : null, source: pack.source, sourceEn: pack.sourceEn, url: pack.url,
      home: [...pack.home].filter((c) => c !== 'EU').sort(),
    },
    threshold: thr,
    currency,
    today,
    fx,
    totals: {
      tier1: tier1Total,
      inhouse: inhouseTotal,
      raw: rawTotal,
      lines: items.length,
      counts: { tier1: tier1.length, inhouse: inhouse.length, raw: raw.length },
    },
    methods,
    verdict,
    status,
    headroom,
    minimumSet,
    substitution,
    categories,
    evidence,
    supplierRequests,
    warnings,
    lines: lineResults,
  };
}

function capital(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/* ------------------------------------------------------------------------ */
/* CSV output                                                               */
/* ------------------------------------------------------------------------ */

/**
 * Serializes rows to CSV.
 * Defaults suit Czech Excel: semicolon, decimal comma, CRLF. Numbers are written
 * without thousands separators. Text starting with '=', '+' or '@' is prefixed
 * with an apostrophe so that spreadsheets do not run it as a formula.
 *
 * @param {Array<Array<unknown>>} rows
 * @param {{delimiter?: string, decimal?: string, newline?: string, bom?: boolean, safe?: boolean}} [options]
 * @returns {string}
 */
export function toCsv(rows, options = {}) {
  const delimiter = options.delimiter || ';';
  const decimal = options.decimal || (delimiter === ';' ? ',' : '.');
  const newline = options.newline || '\r\n';
  const safe = options.safe !== false;
  const out = (rows || []).map((row) =>
    (row || [])
      .map((v) => {
        let s;
        if (v == null || (typeof v === 'number' && !Number.isFinite(v))) s = '';
        else if (typeof v === 'number') s = decimal === ',' ? String(v).replace('.', ',') : String(v);
        else if (v instanceof Date) s = parseDate(v) || '';
        else {
          s = String(v);
          if (safe && /^[=+@\t\r]/.test(s)) s = `'${s}`;
        }
        if (s.includes(delimiter) || /["\r\n]/.test(s) || /^\s|\s$/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
        return s;
      })
      .join(delimiter),
  );
  return (options.bom ? '﻿' : '') + out.join(newline) + (out.length ? newline : '');
}

/** @internal exposed for tests and the UI: checks a value is a recognized country code. */
export { isCountryCode };
