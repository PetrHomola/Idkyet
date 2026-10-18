/**
 * Pod35: countries.
 *
 * ISO 3166-1 alpha-2 list, EU27 and normalization of country codes and names
 * (ISO2, ISO3, names in Czech, Slovak, English, German and Polish, common aliases).
 * Pure ES module without DOM; works in browsers and in Node 22.
 *
 * Besides ISO 3166-1 codes, normalizeCountry() also returns two extra codes:
 *   - 'XK' Kosovo (user-assigned code in wide use),
 *   - 'EU' European Union (origin stated as "EU" / "made in the EU").
 */

/** EU member states (ISO2). Greece is GR (EL is accepted as input and stored as GR). */
export const EU27 = Object.freeze([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

// "ISO2 ISO3" pairs for all 249 ISO 3166-1 entries.
const ISO_PAIRS = (
  'AD AND AE ARE AF AFG AG ATG AI AIA AL ALB AM ARM AO AGO AQ ATA AR ARG AS ASM AT AUT ' +
  'AU AUS AW ABW AX ALA AZ AZE BA BIH BB BRB BD BGD BE BEL BF BFA BG BGR BH BHR BI BDI ' +
  'BJ BEN BL BLM BM BMU BN BRN BO BOL BQ BES BR BRA BS BHS BT BTN BV BVT BW BWA BY BLR ' +
  'BZ BLZ CA CAN CC CCK CD COD CF CAF CG COG CH CHE CI CIV CK COK CL CHL CM CMR CN CHN ' +
  'CO COL CR CRI CU CUB CV CPV CW CUW CX CXR CY CYP CZ CZE DE DEU DJ DJI DK DNK DM DMA ' +
  'DO DOM DZ DZA EC ECU EE EST EG EGY EH ESH ER ERI ES ESP ET ETH FI FIN FJ FJI FK FLK ' +
  'FM FSM FO FRO FR FRA GA GAB GB GBR GD GRD GE GEO GF GUF GG GGY GH GHA GI GIB GL GRL ' +
  'GM GMB GN GIN GP GLP GQ GNQ GR GRC GS SGS GT GTM GU GUM GW GNB GY GUY HK HKG HM HMD ' +
  'HN HND HR HRV HT HTI HU HUN ID IDN IE IRL IL ISR IM IMN IN IND IO IOT IQ IRQ IR IRN ' +
  'IS ISL IT ITA JE JEY JM JAM JO JOR JP JPN KE KEN KG KGZ KH KHM KI KIR KM COM KN KNA ' +
  'KP PRK KR KOR KW KWT KY CYM KZ KAZ LA LAO LB LBN LC LCA LI LIE LK LKA LR LBR LS LSO ' +
  'LT LTU LU LUX LV LVA LY LBY MA MAR MC MCO MD MDA ME MNE MF MAF MG MDG MH MHL MK MKD ' +
  'ML MLI MM MMR MN MNG MO MAC MP MNP MQ MTQ MR MRT MS MSR MT MLT MU MUS MV MDV MW MWI ' +
  'MX MEX MY MYS MZ MOZ NA NAM NC NCL NE NER NF NFK NG NGA NI NIC NL NLD NO NOR NP NPL ' +
  'NR NRU NU NIU NZ NZL OM OMN PA PAN PE PER PF PYF PG PNG PH PHL PK PAK PL POL PM SPM ' +
  'PN PCN PR PRI PS PSE PT PRT PW PLW PY PRY QA QAT RE REU RO ROU RS SRB RU RUS RW RWA ' +
  'SA SAU SB SLB SC SYC SD SDN SE SWE SG SGP SH SHN SI SVN SJ SJM SK SVK SL SLE SM SMR ' +
  'SN SEN SO SOM SR SUR SS SSD ST STP SV SLV SX SXM SY SYR SZ SWZ TC TCA TD TCD TF ATF ' +
  'TG TGO TH THA TJ TJK TK TKL TL TLS TM TKM TN TUN TO TON TR TUR TT TTO TV TUV TW TWN ' +
  'TZ TZA UA UKR UG UGA UM UMI US USA UY URY UZ UZB VA VAT VC VCT VE VEN VG VGB VI VIR ' +
  'VN VNM VU VUT WF WLF WS WSM YE YEM YT MYT ZA ZAF ZM ZMB ZW ZWE'
).split(' ');

/** All ISO 3166-1 alpha-2 codes (249 entries), alphabetical. */
export const ALL_ISO2 = Object.freeze(ISO_PAIRS.filter((_, i) => i % 2 === 0));

const ISO2_SET = new Set(ALL_ISO2);

/** Codes accepted in addition to ISO 3166-1: Kosovo and the European Union. */
export const EXTRA_CODES = Object.freeze(['XK', 'EU']);

const ISO3_TO_ISO2 = new Map();
for (let i = 0; i < ISO_PAIRS.length; i += 2) ISO3_TO_ISO2.set(ISO_PAIRS[i + 1], ISO_PAIRS[i]);
ISO3_TO_ISO2.set('XKX', 'XK');
ISO3_TO_ISO2.set('ROM', 'RO'); // former ISO3 code of Romania, still seen in old ERP data

// Two-letter inputs that are not ISO codes of the intended country.
const CODE_ALIASES = { UK: 'GB', EL: 'GR' };

// Exact inputs (case-insensitive, diacritics kept) checked before normalization,
// because stripping diacritics would turn them into a different ISO code (ČR -> CR = Costa Rica).
const RAW_ALIASES = { 'ČR': 'CZ', 'Č.R.': 'CZ', 'ČSR': 'CZ' };

// Aliases and alternative names. Intl.DisplayNames supplies the standard names
// in cs, sk, en, de and pl; this list adds the usual alternatives and serves as
// a fallback where Intl.DisplayNames is not available.
const ALIASES = {
  GB: ['UK', 'U.K.', 'Great Britain', 'Britain', 'England', 'Scotland', 'Wales', 'Northern Ireland',
    'United Kingdom', 'United Kingdom of Great Britain and Northern Ireland', 'Velká Británie', 'Británie',
    'Anglie', 'Skotsko', 'Severní Irsko', 'Spojené království', 'Veľká Británia', 'Anglicko',
    'Spojené kráľovstvo', 'Großbritannien', 'Vereinigtes Königreich', 'Wielka Brytania', 'Anglia'],
  US: ['USA', 'U.S.A.', 'U.S.', 'United States', 'United States of America', 'America', 'Amerika',
    'Spojené státy', 'Spojené státy americké', 'Spojené štáty', 'Spojené štáty americké',
    'Vereinigte Staaten', 'Vereinigte Staaten von Amerika', 'Stany Zjednoczone', 'Stany Zjednoczone Ameryki'],
  NL: ['Holandsko', 'Holland', 'Nizozemí', 'Nizozemsko', 'Netherlands', 'The Netherlands', 'Holandia', 'Niederlande'],
  CZ: ['Česko', 'Česká republika', 'Czechia', 'Czech Republic', 'Czech Rep.', 'Čechy', 'Tschechien',
    'Tschechische Republik', 'Czechy', 'Republika Czeska', 'Česká rep.'],
  SK: ['Slovensko', 'Slovenská republika', 'Slovakia', 'Slovak Republic', 'Slowakei', 'Słowacja'],
  KR: ['Korea', 'Jižní Korea', 'South Korea', 'Republic of Korea', 'Korea Republic', 'Korea, Republic of',
    'Korea (South)', 'Korejská republika', 'Južná Kórea', 'Kórea', 'Südkorea', 'Korea Południowa'],
  KP: ['Severní Korea', 'North Korea', 'KLDR', 'DPRK', 'Korea (North)',
    'Democratic People\'s Republic of Korea', 'Korea, Democratic People\'s Republic of',
    'Korejská lidově demokratická republika', 'Severná Kórea', 'Nordkorea', 'Korea Północna'],
  TW: ['Tchaj-wan', 'Tchajwan', 'Taiwan', 'Taiwan, Province of China', 'Taiwan ROC', 'Republic of China',
    'Taiwán', 'Tajwan'],
  CN: ['Čína', 'China', 'ČLR', 'Čínská lidová republika', 'PRC', 'People\'s Republic of China',
    'Mainland China', 'Pevninská Čína', 'Chiny'],
  RU: ['Rusko', 'Russia', 'RF', 'Russian Federation', 'Ruská federace', 'Ruská federácia', 'Russland', 'Rosja'],
  BY: ['Bělorusko', 'Belarus', 'Bielorusko', 'Byelorussia', 'Weißrussland', 'Białoruś'],
  IR: ['Írán', 'Iran', 'Islamic Republic of Iran', 'Iran, Islamic Republic of'],
  DE: ['Německo', 'Germany', 'Deutschland', 'SRN', 'BRD', 'Spolková republika Německo',
    'Federal Republic of Germany', 'Nemecko', 'Niemcy'],
  CH: ['Švýcarsko', 'Switzerland', 'Schweiz', 'Suisse', 'Svizzera', 'Helvetia', 'Švajčiarsko', 'Szwajcaria'],
  AT: ['Rakousko', 'Austria', 'Österreich', 'Oesterreich', 'Rakúsko'],
  GR: ['Řecko', 'Greece', 'Hellas', 'Hellenic Republic', 'Grécko', 'Griechenland', 'Grecja'],
  AE: ['UAE', 'SAE', 'Emiráty', 'Spojené arabské emiráty', 'United Arab Emirates', 'Emirates'],
  ZA: ['JAR', 'RSA', 'Jižní Afrika', 'Jihoafrická republika', 'South Africa', 'Republic of South Africa'],
  SA: ['KSA', 'Saúdská Arábie', 'Saudi Arabia'],
  MK: ['Makedonie', 'Macedonia', 'Severní Makedonie', 'North Macedonia', 'FYROM'],
  MD: ['Moldavsko', 'Moldova', 'Republic of Moldova', 'Moldávie'],
  CI: ['Pobřeží slonoviny', 'Ivory Coast', 'Cote d\'Ivoire'],
  CV: ['Kapverdy', 'Cape Verde', 'Cabo Verde'],
  SZ: ['Svazijsko', 'Swaziland', 'Eswatini'],
  MM: ['Barma', 'Burma', 'Myanmar'],
  VA: ['Vatikán', 'Vatican', 'Vatican City', 'Holy See'],
  LA: ['Laos', 'Lao'],
  VN: ['Vietnam', 'Viet Nam'],
  TR: ['Turecko', 'Turkey', 'Türkiye', 'Turkiye', 'Türkei'],
  HK: ['Hongkong', 'Hong Kong', 'Hong Kong SAR'],
  MO: ['Macao', 'Macau'],
  PS: ['Palestina', 'Palestine'],
  BA: ['Bosna', 'Bosnia', 'Bosna a Hercegovina', 'Bosnia and Herzegovina', 'BiH'],
  RS: ['Srbsko', 'Serbia'],
  ME: ['Černá Hora', 'Montenegro'],
  IL: ['Izrael', 'Israel'],
  IN: ['Indie', 'India'],
  JP: ['Japonsko', 'Japan', 'Nippon', 'Nihon'],
  CA: ['Kanada', 'Canada'],
  UA: ['Ukrajina', 'Ukraine', 'Ukraina'],
  NO: ['Norsko', 'Norway', 'Norge', 'Norwegen', 'Norwegia'],
  IS: ['Island', 'Iceland', 'Ísland'],
  LI: ['Lichtenštejnsko', 'Liechtenstein'],
  IE: ['Irsko', 'Ireland', 'Eire', 'Éire'],
  PL: ['Polsko', 'Poland', 'Polska', 'Polen'],
  ES: ['Španělsko', 'Spain', 'España', 'Spanien'],
  IT: ['Itálie', 'Italy', 'Italia', 'Italien'],
  FR: ['Francie', 'France', 'Frankreich'],
  SE: ['Švédsko', 'Sweden', 'Sverige', 'Schweden'],
  FI: ['Finsko', 'Finland', 'Suomi'],
  DK: ['Dánsko', 'Denmark', 'Danmark'],
  BE: ['Belgie', 'Belgium', 'België', 'Belgique'],
  LU: ['Lucembursko', 'Luxembourg'],
  PT: ['Portugalsko', 'Portugal'],
  HU: ['Maďarsko', 'Hungary', 'Magyarország'],
  SI: ['Slovinsko', 'Slovenia', 'Slovenija'],
  HR: ['Chorvatsko', 'Croatia', 'Hrvatska'],
  RO: ['Rumunsko', 'Romania', 'România'],
  BG: ['Bulharsko', 'Bulgaria'],
  EE: ['Estonsko', 'Estonia', 'Eesti'],
  LV: ['Lotyšsko', 'Latvia', 'Latvija'],
  LT: ['Litva', 'Lithuania', 'Lietuva'],
  MT: ['Malta'],
  CY: ['Kypr', 'Cyprus'],
  XK: ['Kosovo'],
  EU: ['Evropská unie', 'Európska únia', 'European Union', 'Europäische Union', 'Unia Europejska',
    'EU origin', 'Made in EU', 'Made in the EU', 'E.U.'],
};

const NAME_LANGS = ['cs', 'en', 'sk', 'de', 'pl'];
const STOPWORDS = new Set(['a', 'and', 'und', 'i', 'the', 'of', 'et', 'y']);
const SPECIAL_CHARS = { 'ł': 'l', 'ß': 'ss', 'ø': 'o', 'æ': 'ae', 'œ': 'oe', 'đ': 'd', 'ð': 'd', 'þ': 'th', 'ı': 'i' };

/**
 * Lookup key for a country name: lowercase, without diacritics, punctuation,
 * spaces and connecting words ("a", "and", "the", "of" ...).
 * @param {string} s
 * @returns {string}
 */
function nameKey(s) {
  const lower = String(s).toLowerCase().replace(/[łßøæœđðþı]/g, (c) => SPECIAL_CHARS[c]);
  const plain = lower.normalize('NFD').replace(/\p{M}+/gu, '').replace(/&/g, ' and ');
  return plain
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t && !STOPWORDS.has(t))
    .join('');
}

let nameIndex = null;

/** Builds the normalized name index on first use. */
function getNameIndex() {
  if (nameIndex) return nameIndex;
  const map = new Map();
  const add = (name, code, force) => {
    if (!name) return;
    const k = nameKey(name);
    if (!k) return;
    if (force || !map.has(k)) map.set(k, code);
  };
  for (const [code, names] of Object.entries(ALIASES)) for (const n of names) add(n, code, true);
  const codes = [...ALL_ISO2, ...EXTRA_CODES];
  for (const lang of NAME_LANGS) {
    for (const style of ['long', 'short']) {
      let dn = null;
      try {
        dn = new Intl.DisplayNames([lang], { type: 'region', style });
      } catch {
        dn = null;
      }
      if (!dn) continue;
      for (const code of codes) {
        let name;
        try {
          name = dn.of(code);
        } catch {
          name = null;
        }
        if (name && name !== code) add(name, code, false);
      }
    }
  }
  nameIndex = map;
  return map;
}

/** True for codes normalizeCountry() can return (ISO 3166-1 alpha-2, XK, EU). */
export function isCountryCode(code) {
  return typeof code === 'string' && (ISO2_SET.has(code) || code === 'XK' || code === 'EU');
}

/** Resolves a bare code (2 or 3 ASCII letters) to ISO2, or null. */
function fromCode(token) {
  const up = token.toUpperCase();
  if (/^[A-Z]{2}$/.test(up)) {
    if (CODE_ALIASES[up]) return CODE_ALIASES[up];
    if (isCountryCode(up)) return up;
    return null;
  }
  if (/^[A-Z]{3}$/.test(up)) return ISO3_TO_ISO2.get(up) || null;
  return null;
}

/**
 * Normalizes a country code or name to ISO 3166-1 alpha-2.
 *
 * Accepts ISO2 (any case), common ISO3 codes, names in Czech, Slovak, English,
 * German and Polish regardless of case and diacritics, and aliases such as
 * UK, EL, USA, "Velká Británie", "Anglie", "Holandsko", "Korea", "Tchaj-wan".
 * 'EL' becomes 'GR' and 'UK' becomes 'GB'. Inputs like "DE - Německo" or
 * "Germany (DE)" are also understood.
 *
 * @param {unknown} input Code or name.
 * @returns {string|null} ISO2 code ('XK' and 'EU' are possible as well), or null when unknown or empty.
 */
export function normalizeCountry(input) {
  if (input == null) return null;
  const str = String(input).trim();
  if (!str) return null;

  const rawAlias = RAW_ALIASES[str.toUpperCase()];
  if (rawAlias) return rawAlias;

  if (/^[A-Za-z]{2,3}$/.test(str)) {
    const c = fromCode(str);
    if (c) return c;
  }

  const index = getNameIndex();
  const k = nameKey(str);
  if (k && index.has(k)) return index.get(k);

  // "DE - Německo", "DE: Germany", "Germany (DE)", "Německo [DEU]"
  const lead = /^([A-Za-z]{2,3})\s*[-–—:|/,]\s*\S/.exec(str);
  if (lead) {
    const c = fromCode(lead[1]);
    if (c) return c;
  }
  const trail = /[([]\s*([A-Za-z]{2,3})\s*[)\]]\s*$/.exec(str);
  if (trail) {
    const c = fromCode(trail[1]);
    if (c) return c;
  }
  const head = /^(.+?)\s*[([]/.exec(str);
  if (head) {
    const hk = nameKey(head[1]);
    if (hk && index.has(hk)) return index.get(hk);
  }
  return null;
}

const displayNamesCache = new Map();

function displayNames(lang) {
  if (displayNamesCache.has(lang)) return displayNamesCache.get(lang);
  let dn = null;
  try {
    dn = new Intl.DisplayNames([lang], { type: 'region' });
  } catch {
    dn = null;
  }
  displayNamesCache.set(lang, dn);
  return dn;
}

/**
 * Country name for display, via Intl.DisplayNames.
 * @param {string} iso2 ISO2 code (other accepted inputs are normalized first, e.g. 'EL' -> Greece).
 * @param {string} [lang='cs'] Language code, e.g. 'cs', 'en', 'sk'.
 * @returns {string} Name, or the code itself when no name is available; '' for empty input.
 */
export function countryName(iso2, lang = 'cs') {
  if (iso2 == null || String(iso2).trim() === '') return '';
  const raw = String(iso2).trim();
  const code = normalizeCountry(raw) || raw.toUpperCase();
  if (!isCountryCode(code)) return raw;
  const dn = displayNames(lang || 'cs');
  if (dn) {
    try {
      const name = dn.of(code);
      if (name && name !== code) return name;
    } catch {
      /* fall through */
    }
  }
  return code;
}
