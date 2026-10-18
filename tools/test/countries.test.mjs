import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EU27,
  ALL_ISO2,
  EXTRA_CODES,
  normalizeCountry,
  countryName,
  isCountryCode,
} from '../../site/assets/js/countries.js';

test('ALL_ISO2 holds the 249 ISO 3166-1 alpha-2 codes', () => {
  assert.equal(ALL_ISO2.length, 249);
  assert.equal(new Set(ALL_ISO2).size, 249);
  for (const c of ALL_ISO2) assert.match(c, /^[A-Z]{2}$/);
  for (const c of ['CZ', 'SK', 'DE', 'US', 'CN', 'TW', 'KR', 'UA', 'CA', 'GB', 'CH', 'NO', 'AX', 'BQ', 'SS', 'ZW']) {
    assert.ok(ALL_ISO2.includes(c), c);
  }
  assert.ok(!ALL_ISO2.includes('UK'));
  assert.ok(!ALL_ISO2.includes('EL'));
  assert.ok(!ALL_ISO2.includes('XK'));
  assert.deepEqual([...EXTRA_CODES], ['XK', 'EU']);
});

test('EU27 has 27 members, GR not EL, and excludes CH, GB, NO, UA', () => {
  assert.equal(EU27.length, 27);
  assert.equal(new Set(EU27).size, 27);
  for (const c of EU27) assert.ok(ALL_ISO2.includes(c), c);
  assert.ok(EU27.includes('GR'));
  for (const c of ['EL', 'CH', 'GB', 'NO', 'UA', 'IS', 'LI', 'TR']) assert.ok(!EU27.includes(c), c);
});

test('normalizeCountry: ISO2 in any case, ISO3, EL and UK', () => {
  assert.equal(normalizeCountry('de'), 'DE');
  assert.equal(normalizeCountry(' CZ '), 'CZ');
  assert.equal(normalizeCountry('DEU'), 'DE');
  assert.equal(normalizeCountry('cze'), 'CZ');
  assert.equal(normalizeCountry('USA'), 'US');
  assert.equal(normalizeCountry('GBR'), 'GB');
  assert.equal(normalizeCountry('TWN'), 'TW');
  assert.equal(normalizeCountry('EL'), 'GR');
  assert.equal(normalizeCountry('el'), 'GR');
  assert.equal(normalizeCountry('GRC'), 'GR');
  assert.equal(normalizeCountry('UK'), 'GB');
  assert.equal(normalizeCountry('CR'), 'CR', 'CR stays Costa Rica');
});

test('normalizeCountry: Czech names with and without diacritics', () => {
  const cases = {
    'Německo': 'DE', 'nemecko': 'DE', 'NĚMECKO': 'DE', 'Rakousko': 'AT', 'Slovensko': 'SK', 'Polsko': 'PL',
    'Česko': 'CZ', 'Česká republika': 'CZ', 'ceska republika': 'CZ', 'ČR': 'CZ', 'Švýcarsko': 'CH',
    'svycarsko': 'CH', 'Velká Británie': 'GB', 'Anglie': 'GB', 'Spojené království': 'GB', 'Holandsko': 'NL',
    'Nizozemsko': 'NL', 'Spojené státy americké': 'US', 'Jižní Korea': 'KR', 'Korea': 'KR', 'Tchaj-wan': 'TW',
    'tchajwan': 'TW', 'Čína': 'CN', 'Japonsko': 'JP', 'Ukrajina': 'UA', 'Norsko': 'NO', 'Řecko': 'GR',
    'Severní Korea': 'KP', 'Rusko': 'RU', 'Bělorusko': 'BY', 'Írán': 'IR', 'Kanada': 'CA', 'Švédsko': 'SE',
    'Francie': 'FR', 'Itálie': 'IT', 'Island': 'IS', 'Lichtenštejnsko': 'LI', 'Bosna a Hercegovina': 'BA',
  };
  for (const [input, code] of Object.entries(cases)) assert.equal(normalizeCountry(input), code, input);
});

test('normalizeCountry: English, Slovak, German and Polish names and aliases', () => {
  const cases = {
    Germany: 'DE', Czechia: 'CZ', 'Czech Republic': 'CZ', 'United Kingdom': 'GB', 'Great Britain': 'GB',
    England: 'GB', 'United States': 'US', 'United States of America': 'US', 'South Korea': 'KR',
    'Republic of Korea': 'KR', Taiwan: 'TW', Switzerland: 'CH', 'The Netherlands': 'NL', Holland: 'NL',
    Türkiye: 'TR', Turkey: 'TR', 'Bosnia and Herzegovina': 'BA', 'Trinidad and Tobago': 'TT',
    "Côte d'Ivoire": 'CI', 'Ivory Coast': 'CI', 'Nemecko': 'DE', 'Rakúsko': 'AT', 'Veľká Británia': 'GB',
    'Južná Kórea': 'KR', Deutschland: 'DE', Österreich: 'AT', Tschechien: 'CZ', Schweiz: 'CH',
    'Vereinigtes Königreich': 'GB', Niemcy: 'DE', Czechy: 'CZ', 'Wielka Brytania': 'GB', Szwajcaria: 'CH',
    Polska: 'PL', 'Stany Zjednoczone': 'US', Hongkong: 'HK', Kosovo: 'XK', 'Evropská unie': 'EU',
    'European Union': 'EU', EU: 'EU',
  };
  for (const [input, code] of Object.entries(cases)) assert.equal(normalizeCountry(input), code, input);
});

test('normalizeCountry: code with name, punctuation and spacing', () => {
  assert.equal(normalizeCountry('DE - Německo'), 'DE');
  assert.equal(normalizeCountry('DE – Německo'), 'DE');
  assert.equal(normalizeCountry('Germany (DE)'), 'DE');
  assert.equal(normalizeCountry('Německo [DEU]'), 'DE');
  assert.equal(normalizeCountry('Jižní   Korea'), 'KR');
  assert.equal(normalizeCountry('U.S.A.'), 'US');
  assert.equal(normalizeCountry('tchaj wan'), 'TW');
});

test('normalizeCountry: empty and unknown inputs', () => {
  assert.equal(normalizeCountry(''), null);
  assert.equal(normalizeCountry('   '), null);
  assert.equal(normalizeCountry(null), null);
  assert.equal(normalizeCountry(undefined), null);
  assert.equal(normalizeCountry('XX'), null);
  assert.equal(normalizeCountry('ABC'), null);
  assert.equal(normalizeCountry('Atlantida'), null);
});

test('every ISO2 code and its display names round-trip', () => {
  for (const code of ALL_ISO2) {
    assert.equal(normalizeCountry(code), code);
    assert.equal(normalizeCountry(code.toLowerCase()), code);
    for (const lang of ['cs', 'sk', 'en', 'de', 'pl']) {
      const name = countryName(code, lang);
      if (name === code) continue;
      assert.equal(normalizeCountry(name), code, `${lang}: ${name}`);
    }
  }
});

test('countryName uses Intl.DisplayNames with a code fallback', () => {
  assert.equal(countryName('DE'), 'Německo');
  assert.equal(countryName('DE', 'en'), 'Germany');
  assert.equal(countryName('CZ', 'en'), 'Czechia');
  assert.equal(countryName('EL', 'en'), 'Greece');
  assert.equal(countryName('gb', 'cs'), 'Spojené království');
  assert.equal(countryName('EU', 'en'), 'European Union');
  assert.equal(countryName(''), '');
  assert.equal(countryName(null), '');
  assert.equal(countryName('XYZ'), 'XYZ');
});

test('isCountryCode accepts ISO2, XK and EU only', () => {
  assert.ok(isCountryCode('DE'));
  assert.ok(isCountryCode('XK'));
  assert.ok(isCountryCode('EU'));
  assert.ok(!isCountryCode('UK'));
  assert.ok(!isCountryCode('de'));
  assert.ok(!isCountryCode(null));
});

test('normalizeCountry: two different countries in one cell are ambiguous', () => {
  for (const v of ['DE/US', 'CZ/SK', 'CZ, SK', 'DE - US', 'DE+AT', 'DE & AT', 'Germany (US)', 'Německo [USA]']) {
    assert.equal(normalizeCountry(v), null, v);
  }
  assert.equal(normalizeCountry('DE - Německo'), 'DE');
  assert.equal(normalizeCountry('CZE: Česko'), 'CZ');
  assert.equal(normalizeCountry('EU - Německo'), 'DE');
  assert.equal(normalizeCountry('Německo (EU)'), 'DE');
  assert.equal(normalizeCountry('USA - Kalifornie'), 'US');
  assert.equal(normalizeCountry('UK - England'), 'GB');
});

test('normalizeCountry: more Czech and Slovak spellings', () => {
  const cases = {
    'Slovak Rep.': 'SK', 'Slovenská rep.': 'SK', 'Velká Británie a Severní Irsko': 'GB',
    'Spojené království Velké Británie a Severního Irska': 'GB', 'Řecko': 'GR', 'řecko': 'GR', 'Ελλάδα': null,
  };
  for (const [input, code] of Object.entries(cases)) assert.equal(normalizeCountry(input), code, input);
  assert.equal(normalizeCountry('SR'), 'SR', 'SR stays Suriname (ISO); calc-core adds a note');
});
