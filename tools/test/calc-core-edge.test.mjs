// Adversarial and edge-case tests for the calculation core.
// Every rule is re-derived from SPEC sections 4 and 7, independently of the implementation.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  RULE_PACKS,
  parseTable,
  parseNumber,
  detectColumns,
  rowsToLines,
  lineCost,
  lineStatus,
  analyze,
  makeLine,
} from '../../site/assets/js/calc-core.js';
import { EU27, normalizeCountry } from '../../site/assets/js/countries.js';

const TODAY = '2026-10-18';
const close = (actual, expected, msg) => assert.ok(Math.abs(actual - expected) < 1e-9, `${msg || ''} ${actual} != ${expected}`);
const run = (lines, opts = {}) => analyze(lines, { pack: 'SAFE', fx: { CZK: 1 }, currency: 'CZK', today: TODAY, ...opts });
/** Documented tier-1 line (customs, no expiry) with cost = unitCost CZK. */
const doc = (id, origin, cost, extra = {}) => ({ id, origin, unitCost: cost, qty: 1, currency: 'CZK', evidence: 'customs', category: 'structural', ...extra });
const byId = (r) => Object.fromEntries(r.lines.map((l) => [l.id, l]));
const codesFor = (r, id) => r.warnings.filter((w) => w.lineId === id).map((w) => w.code);

/* ---------------------------------------------------------------------- */

describe('home countries per rule pack (SPEC 7, independently listed)', () => {
  const EEA = ['IS', 'LI', 'NO'];
  const expectedHome = {
    SAFE: [...EU27, ...EEA, 'UA'],
    UASL: [...EU27, ...EEA, 'UA'],
    EDIP: [...EU27, 'NO'],
    EDIP_USI: [...EU27, 'UA'],
    EU_CANADA: [...EU27, ...EEA, 'UA'],
  };

  test('EU27 is exactly the 27 member states, Greece as GR', () => {
    assert.deepEqual([...EU27].sort(), ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU',
      'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK']);
  });

  for (const [pack, home] of Object.entries(expectedHome)) {
    test(`${pack}: home set is exactly as specified`, () => {
      const set = new Set(home);
      assert.deepEqual([...RULE_PACKS[pack].home].filter((c) => c !== 'EU').sort(), [...set].sort());
      assert.deepEqual(run([doc('x', 'DE', 1)], { pack }).rule.home, [...set].sort());
    });

    test(`${pack}: every code is classified as specified in all three scenarios`, () => {
      const probe = [...new Set([...home, 'CH', 'GB', 'IS', 'LI', 'NO', 'UA', 'US', 'CA', 'TR', 'RS', 'XK', 'CN', 'JP'])];
      for (const code of probe) {
        const r = run([doc('p', code, 100)], { pack });
        const g = byId(r).p.group;
        let want = home.includes(code) ? 'home' : 'nonHome';
        if (pack === 'EU_CANADA' && code === 'CA') want = 'canada';
        assert.deepEqual(g, { worst: want, expected: want, best: want }, `${pack} ${code}`);
      }
    });
  }

  test('CH and GB are never home, in no pack and no spelling', () => {
    for (const pack of Object.keys(RULE_PACKS)) {
      for (const v of ['CH', 'CHE', 'Švýcarsko', 'Switzerland', 'GB', 'UK', 'Velká Británie', 'United Kingdom', 'Anglie']) {
        const r = run([doc('p', v, 100)], { pack });
        assert.equal(r.methods.a.scenarios.worst.ratio, 1, `${pack} ${v}`);
        assert.equal(r.methods.a.scenarios.best.pass, false, `${pack} ${v}`);
      }
    }
  });

  test('NO: home in SAFE, UASL, EDIP, EU_CANADA; not in EDIP_USI', () => {
    const res = Object.fromEntries(Object.keys(RULE_PACKS).map((p) => [p, run([doc('p', 'Norsko', 1)], { pack: p }).status]));
    assert.deepEqual(res, { SAFE: 'pass', UASL: 'pass', EDIP: 'pass', EDIP_USI: 'fail', EU_CANADA: 'pass' });
  });

  test('UA: home in SAFE, UASL, EDIP_USI, EU_CANADA; not in EDIP', () => {
    const res = Object.fromEntries(Object.keys(RULE_PACKS).map((p) => [p, run([doc('p', 'Ukrajina', 1)], { pack: p }).status]));
    assert.deepEqual(res, { SAFE: 'pass', UASL: 'pass', EDIP: 'fail', EDIP_USI: 'pass', EU_CANADA: 'pass' });
  });

  test('IS and LI: home only in SAFE, UASL and EU_CANADA', () => {
    for (const c of ['IS', 'Island', 'LI', 'Lichtenštejnsko']) {
      const res = Object.fromEntries(Object.keys(RULE_PACKS).map((p) => [p, run([doc('p', c, 1)], { pack: p }).status]));
      assert.deepEqual(res, { SAFE: 'pass', UASL: 'pass', EDIP: 'fail', EDIP_USI: 'fail', EU_CANADA: 'pass' }, c);
    }
  });

  test('EL and Řecko are Greece (home) in origin, expected origin and supplier country', () => {
    for (const v of ['EL', 'el', 'Řecko', 'řecko', 'GRC', 'Greece']) {
      assert.equal(normalizeCountry(v), 'GR', v);
      const r = run([
        doc('o', v, 10),
        { id: 'e', expectedOrigin: v, unitCost: 10 },
        { id: 's', supplierCountry: v, unitCost: 10 },
      ], { pack: 'EDIP' });
      const l = byId(r);
      assert.equal(l.o.origin, 'GR');
      assert.equal(l.e.effectiveOrigin, 'GR');
      assert.equal(l.s.effectiveOrigin, 'GR');
      assert.equal(r.methods.a.scenarios.expected.nonHome, 0, v);
      assert.equal(r.warnings.filter((w) => w.code === 'unknown-country').length, 0);
    }
  });

  test('pack ids are case-insensitive', () => {
    assert.equal(run([doc('p', 'UA', 1)], { pack: 'edip' }).pack, 'EDIP');
    assert.equal(run([doc('p', 'UA', 1)], { pack: 'eu_canada' }).pack, 'EU_CANADA');
  });
});

/* ---------------------------------------------------------------------- */

describe('line types: raw materials and in-house production', () => {
  const base = [
    doc('us', 'US', 40),
    doc('de', 'DE', 60),
  ];

  test('raw materials change neither numerator nor denominator of a or b', () => {
    const withOwn = [...base, { id: 'own', type: 'inhouse', unitCost: 50 }];
    const r0 = run(withOwn);
    const r1 = run([...withOwn,
      { id: 'raw1', type: 'raw', origin: 'RU', unitCost: 10000 },
      { id: 'raw2', type: 'surovina', origin: 'US', unitCost: 5000, evidence: 'none' },
      { id: 'raw3', type: 'raw material', unitCost: 1 }]);
    assert.deepEqual(r1.methods, r0.methods);
    assert.deepEqual(r1.verdict, r0.verdict);
    assert.deepEqual(r1.minimumSet, r0.minimumSet);
    assert.equal(r1.totals.raw, 15001);
    assert.ok(!r1.warnings.some((w) => /^raw/.test(w.lineId || '')), 'no warnings for raw materials (not even RU)');
    assert.ok(!r1.categories.some((c) => c.total > 100));
    assert.ok(!r1.supplierRequests.some((s) => s.lineIds.some((id) => /^raw/.test(id))));
  });

  test('in-house cost enters only the method b denominator, whatever its origin', () => {
    const r = run([...base, { id: 'own', type: 'inhouse', origin: 'US', unitCost: 100 }, { id: 'own2', type: 'vlastní výroba', unitCost: 60 }]);
    assert.equal(r.methods.a.denominator, 100);
    assert.equal(r.methods.b.denominator, 260);
    for (const s of ['worst', 'expected', 'best']) {
      assert.equal(r.methods.a.scenarios[s].nonHome, 40);
      assert.equal(r.methods.b.scenarios[s].nonHome, 40, 'in-house never in the numerator');
      close(r.methods.b.scenarios[s].ratio, 40 / 260);
    }
    assert.ok(!r.supplierRequests.some((s) => s.lineIds.includes('own')));
    assert.equal(r.categories.reduce((s, c) => s + c.total, 0), 100, 'category table holds tier-1 parts only');
  });

  test('method b is unused without in-house lines; verdict then uses method a', () => {
    const r = run(base);
    assert.equal(r.methods.b.used, false);
    assert.deepEqual(r.verdict.worst, { pass: false, method: 'a' });
    assert.equal(r.minimumSet.method, 'a');
  });

  test('passing by method b alone is enough (one of the methods suffices)', () => {
    // a: 40/100 = 40 % fails; b: 40/120 = 33.3 % passes.
    const r = run([...base, { id: 'own', type: 'inhouse', unitCost: 20 }]);
    assert.equal(r.methods.a.scenarios.worst.pass, false);
    assert.equal(r.methods.b.scenarios.worst.pass, true);
    assert.deepEqual(r.verdict.worst, { pass: true, method: 'b' });
    assert.equal(r.status, 'pass');
  });
});

/* ---------------------------------------------------------------------- */

describe('scenarios and line status', () => {
  test('worst: only documented home lines count as home; expired declarations are not documented', () => {
    const lines = [
      doc('cust', 'DE', 10),
      doc('declValid', 'FR', 10, { evidence: 'declaration', validUntil: '2027-01-01' }),
      doc('declToday', 'IT', 10, { evidence: 'declaration', validUntil: TODAY }),
      doc('declExpired', 'AT', 10, { evidence: 'declaration', validUntil: '2026-10-17' }),
      doc('custExpired', 'PL', 10, { evidence: 'customs', validUntil: '2026-01-01' }),
      doc('contract', 'SK', 10, { evidence: 'contract' }),
      doc('assumed', 'CZ', 10, { evidence: 'assumed' }),
      doc('none', 'CZ', 10, { evidence: 'none' }),
      doc('badDate', 'CZ', 10, { evidence: 'declaration', validUntil: 'brzy' }),
      { id: 'unknown', expectedOrigin: 'CZ', unitCost: 10 },
    ];
    const r = run(lines);
    const s = Object.fromEntries(r.lines.map((l) => [l.id, l.status]));
    assert.deepEqual(s, {
      cust: 'documented', declValid: 'documented', declToday: 'documented', declExpired: 'stated', custExpired: 'stated',
      contract: 'documented', assumed: 'stated', none: 'stated', badDate: 'stated', unknown: 'unknown',
    });
    assert.equal(r.methods.a.scenarios.worst.nonHome, 60);
    assert.equal(r.methods.a.scenarios.expected.nonHome, 0);
    assert.equal(r.methods.a.scenarios.best.nonHome, 0);
    assert.deepEqual(r.evidence.expired.map((e) => e.lineId).sort(), ['custExpired', 'declExpired']);
    assert.deepEqual(codesFor(r, 'badDate'), ['invalid-date'], 'an unreadable validity date is explained');
    assert.deepEqual(r.warnings.filter((w) => w.code === 'invalid-date').length, 1);
  });

  test('documented line with a non-home origin is non-home in every scenario', () => {
    const r = run([doc('us', 'US', 10), doc('de', 'DE', 90)]);
    assert.deepEqual(byId(r).us.group, { worst: 'nonHome', expected: 'nonHome', best: 'nonHome' });
  });

  test('expected: origin wins over expected origin, which wins over supplier country', () => {
    const r = run([
      { id: 'o', origin: 'US', expectedOrigin: 'DE', supplierCountry: 'DE', unitCost: 1 },
      { id: 'e', expectedOrigin: 'US', supplierCountry: 'DE', unitCost: 1 },
      { id: 's', supplierCountry: 'US', unitCost: 1 },
      { id: 'n', unitCost: 1 },
    ]);
    const l = byId(r);
    assert.equal(l.o.group.expected, 'nonHome');
    assert.equal(l.e.group.expected, 'nonHome');
    assert.equal(l.s.group.expected, 'nonHome');
    assert.equal(l.n.group.expected, 'nonHome', 'nothing known counts outside');
    assert.deepEqual([l.o.group.best, l.e.group.best, l.s.group.best, l.n.group.best], ['nonHome', 'home', 'home', 'home'],
      'best uses the origin only; lines without origin count as home');
  });

  test('all lines unknown: worst and expected fail, best passes -> depends; substitution is proposed', () => {
    const r = run([{ id: 'a', unitCost: 50 }, { id: 'b', unitCost: 30 }, { id: 'c', unitCost: 20 }]);
    assert.equal(r.methods.a.scenarios.worst.ratio, 1);
    assert.equal(r.methods.a.scenarios.expected.ratio, 1);
    assert.equal(r.methods.a.scenarios.best.ratio, 0);
    assert.equal(r.status, 'depends');
    assert.equal(r.minimumSet.feasible, false);
    assert.deepEqual(r.minimumSet.lineIds, [], 'no line has a home expected origin');
    assert.deepEqual(r.substitution.lineIds, ['a', 'b'], '50 + 30 replaced: 20/100 <= 35 %');
    assert.equal(r.substitution.feasible, true);
    assert.deepEqual(r.evidence.unknown, { count: 3, cost: 100 });
  });

  test('all lines home and documented: pass with empty minimum set', () => {
    const r = run([doc('a', 'CZ', 50), doc('b', 'DE', 30, { evidence: 'declaration', validUntil: '2027-12-31' }), doc('c', 'SK', 20, { evidence: 'contract' })]);
    assert.equal(r.status, 'pass');
    for (const s of ['worst', 'expected', 'best']) assert.equal(r.methods.a.scenarios[s].ratio, 0);
    assert.deepEqual(r.minimumSet, { method: 'a', lineIds: [], count: 0, coveredCost: 0, feasible: true, needed: 0 });
    assert.equal(r.substitution, null);
    assert.deepEqual(r.supplierRequests, []);
    close(r.headroom.worst.amount, 35);
  });

  test('exactly 35 % passes, just above fails', () => {
    assert.equal(run([doc('us', 'US', 35), doc('de', 'DE', 65)]).status, 'pass');
    assert.equal(run([doc('us', 'US', 35.01), doc('de', 'DE', 64.99)]).status, 'fail');
  });

  test('status values', () => {
    assert.equal(run([doc('de', 'DE', 70), doc('us', 'US', 30)]).status, 'pass');
    assert.equal(run([doc('de', 'DE', 40), { id: 'u', unitCost: 60 }]).status, 'depends');
    assert.equal(run([doc('de', 'DE', 40), doc('us', 'US', 60)]).status, 'fail');
    assert.equal(run([]).status, 'nodata');
  });
});

/* ---------------------------------------------------------------------- */

describe('minimum evidence set (greedy, cost descending, stop when worst passes)', () => {
  // D = 100; worst numerator = 20 (US) + 35 (undocumented) = 55; needs 20.
  const lines = [
    doc('us', 'US', 20),
    { id: 'h10a', origin: 'DE', evidence: 'assumed', unitCost: 10 },
    { id: 'jp', expectedOrigin: 'JP', unitCost: 12 },
    { id: 'h5', supplierCountry: 'CZ', unitCost: 5 },
    { id: 'h10b', expectedOrigin: 'SK', unitCost: 10 },
    { id: 'zero', expectedOrigin: 'CZ', unitCost: 0 },
    { id: 'gb', origin: 'GB', evidence: 'none', unitCost: 3 },
    doc('ok', 'CZ', 40),
  ];

  test('stops exactly at the threshold (numerator - sum <= 35 % x denominator)', () => {
    const r = run(lines);
    assert.equal(r.methods.a.denominator, 100);
    assert.equal(r.methods.a.scenarios.worst.nonHome, 60);
    // needs 25 -> 10 + 10 = 20 is not enough, + 5 = 25 reaches exactly 35.
    assert.deepEqual(r.minimumSet.lineIds, ['h10a', 'h10b', 'h5']);
    assert.equal(r.minimumSet.coveredCost, 25);
    close(r.minimumSet.needed, 25);
    assert.equal(r.minimumSet.feasible, true);
  });

  test('candidates: only undocumented lines whose expected origin is home, with a cost', () => {
    const r = run(lines);
    for (const id of ['us', 'ok', 'jp', 'gb', 'zero']) assert.ok(!r.minimumSet.lineIds.includes(id), id);
  });

  test('equal costs keep the input order', () => {
    const r = run(lines);
    assert.deepEqual(r.minimumSet.lineIds.slice(0, 2), ['h10a', 'h10b']);
  });

  test('documenting the set makes the worst case pass; one line fewer does not', () => {
    const r = run(lines);
    const fix = (ids) => lines.map((l) => (ids.includes(l.id)
      ? { ...l, origin: l.origin || l.expectedOrigin || l.supplierCountry, evidence: 'declaration', validUntil: '2027-12-31' }
      : l));
    assert.equal(run(fix(r.minimumSet.lineIds)).verdict.worst.pass, true);
    assert.equal(run(fix(r.minimumSet.lineIds.slice(0, -1))).verdict.worst.pass, false);
  });

  test('method with the smaller set wins; supplier requests flag the set as priority', () => {
    const r = run([...lines, { id: 'own', type: 'inhouse', unitCost: 20 }]);
    // b: D = 120, threshold 42, numerator 60 -> needs 18: 10 + 10 = 20 (2 lines) beats a (3 lines).
    assert.equal(r.minimumSet.method, 'b');
    assert.deepEqual(r.minimumSet.lineIds, ['h10a', 'h10b']);
    const prio = r.supplierRequests.filter((s) => s.priority).flatMap((s) => s.priorityLineIds);
    assert.deepEqual(prio.sort(), ['h10a', 'h10b']);
    assert.deepEqual(r.lines.filter((l) => l.inMinimumSet).map((l) => l.id), ['h10a', 'h10b']);
  });

  test('infeasible set: all candidates listed, feasible false, substitution for the expected case', () => {
    const r = run([doc('us', 'US', 60), { id: 'c', expectedOrigin: 'DE', unitCost: 10 }, doc('cz', 'CZ', 30)]);
    assert.equal(r.minimumSet.feasible, false);
    assert.deepEqual(r.minimumSet.lineIds, ['c']);
    // expected: 60/100 -> replace the US line -> 0 %.
    assert.deepEqual(r.substitution, { method: 'a', lineIds: ['us'], count: 1, cost: 60, feasible: true });
    assert.equal(byId(r).us.inSubstitution, true);
  });

  test('substitution takes the fewest lines (largest first) and stops as soon as the expected case passes', () => {
    const r = run([doc('a', 'US', 30), doc('b', 'CN', 25), doc('c', 'JP', 10), doc('d', 'GB', 5), doc('cz', 'CZ', 30)]);
    // expected 70/100; replacing a (30) -> 40 %, + b (25) -> 15 % passes.
    assert.deepEqual(r.substitution.lineIds, ['a', 'b']);
    assert.equal(r.substitution.cost, 55);
  });
});

/* ---------------------------------------------------------------------- */

describe('EU–Canada agreement (home >= 20 %, other <= 35 % and <= home, Canada unlimited)', () => {
  const ca = (lines) => run(lines, { pack: 'EU_CANADA' });

  test('boundaries: home exactly 20 %, other exactly 35 % and equal to home', () => {
    assert.equal(ca([doc('ca', 'CA', 80), doc('de', 'DE', 20)]).status, 'pass');
    assert.equal(ca([doc('ca', 'CA', 81), doc('de', 'DE', 19)]).status, 'fail');
    assert.equal(ca([doc('ca', 'CA', 30), doc('de', 'DE', 35), doc('us', 'US', 35)]).status, 'pass');
    assert.equal(ca([doc('ca', 'CA', 32), doc('de', 'DE', 34), doc('us', 'US', 34)]).status, 'pass');
    assert.equal(ca([doc('ca', 'CA', 34), doc('de', 'DE', 32), doc('us', 'US', 34)]).status, 'fail', 'other 34 > home 32');
  });

  test('shares add up to 1 in every scenario and method', () => {
    const r = ca([doc('ca', 'CA', 40), { id: 'u', unitCost: 10 }, { id: 'x', origin: 'DE', unitCost: 30 }, doc('us', 'US', 20), { id: 'own', type: 'inhouse', unitCost: 25 }]);
    for (const m of ['a', 'b']) {
      for (const s of ['worst', 'expected', 'best']) {
        const sh = r.methods[m].scenarios[s].shares;
        close(sh.home + sh.canada + sh.other, 1, `${m} ${s}`);
      }
    }
  });

  test('headroom is the smallest of the three margins', () => {
    const r = ca([doc('ca', 'CA', 50), doc('de', 'DE', 30), doc('us', 'US', 20)]);
    // other limit 35 - 20 = 15; home minimum 30 - 20 = 10; other <= home: (30 - 20) / 2 = 5.
    close(r.headroom.worst.amount, 5);
  });

  test('minimum set skips Canadian lines when only the home minimum is missing', () => {
    const r = ca([doc('caDoc', 'CA', 65), doc('de', 'DE', 18), { id: 'caUndoc', origin: 'CA', evidence: 'none', unitCost: 12 }, { id: 'homeCand', expectedOrigin: 'CZ', unitCost: 5 }]);
    const w = r.methods.a.scenarios.worst;
    assert.deepEqual(w.costs, { home: 18, canada: 65, other: 17 });
    assert.equal(w.pass, false);
    assert.deepEqual(r.minimumSet.lineIds, ['homeCand'], 'documenting the Canadian line would not raise the home share');
    assert.equal(r.minimumSet.feasible, true);
  });

  test('minimum set uses Canadian lines when the "other" limits fail', () => {
    const r = ca([doc('caDoc', 'CA', 30), doc('de', 'DE', 30), { id: 'caUndoc', origin: 'CA', evidence: 'none', unitCost: 40 }]);
    // worst: other 40 > 35 and > home 30; documenting the Canadian line fixes both.
    assert.deepEqual(r.minimumSet.lineIds, ['caUndoc']);
    assert.equal(r.minimumSet.feasible, true);
  });

  test('substitution replaces a Canadian line when the home share is too small', () => {
    const r = ca([doc('ca', 'CA', 85), doc('de', 'DE', 15)]);
    assert.equal(r.status, 'fail');
    assert.ok(r.substitution);
    assert.deepEqual(r.substitution.lineIds, ['ca']);
    assert.equal(r.substitution.feasible, true);
  });

  test('substitution replaces other third countries first', () => {
    const r = ca([doc('ca', 'CA', 50), doc('de', 'DE', 10), doc('us', 'US', 40)]);
    assert.deepEqual(r.substitution.lineIds, ['us']);
    assert.equal(r.substitution.feasible, true);
  });
});

/* ---------------------------------------------------------------------- */

describe('costs, currencies and degenerate input', () => {
  test('FX: cost = qty x unit cost x rate; rate keys and values are normalized', () => {
    const fx = { 'Kč': 1, eur: '25,5', usd: 23 };
    const r = analyze([
      doc('e', 'DE', 10, { qty: 2, currency: 'EUR' }),
      doc('u', 'US', 100, { currency: '$' }),
      doc('c', 'CZ', 1000, { currency: 'Kč' }),
      doc('blank', 'CZ', 7, { currency: '' }),
    ], { fx, currency: 'CZK', today: TODAY });
    const l = byId(r);
    assert.equal(l.e.cost, 510);
    assert.equal(l.u.cost, 2300);
    assert.equal(l.c.cost, 1000);
    assert.equal(l.blank.cost, 7, 'no currency = project currency');
    assert.equal(r.totals.tier1, 3817);
    assert.deepEqual(r.warnings, []);
  });

  test('project currency EUR: CZK lines are converted with the CZK rate', () => {
    const r = analyze([doc('c', 'CZ', 2500, { currency: 'CZK' }), doc('u', 'US', 100, { currency: 'EUR' })],
      { fx: { EUR: 1, CZK: 0.04 }, currency: 'EUR', today: TODAY });
    close(byId(r).c.cost, 100);
    close(r.methods.a.scenarios.worst.ratio, 0.5);
  });

  test('mixed currencies without a rate: warning per line, cost 0, no NaN anywhere', () => {
    const r = run([
      doc('jpy', 'JP', 1000, { currency: 'JPY' }),
      doc('eur', 'DE', 10, { currency: 'EUR' }),
      doc('czk', 'CZ', 100),
      doc('bad', 'CZ', 5, { currency: 'peníze' }),
    ]);
    assert.deepEqual(codesFor(r, 'jpy'), ['unknown-currency']);
    assert.deepEqual(codesFor(r, 'eur'), ['unknown-currency']);
    assert.deepEqual(codesFor(r, 'bad'), ['unknown-currency']);
    assert.deepEqual(codesFor(r, 'czk'), []);
    assert.equal(r.totals.tier1, 100);
    assert.ok(!JSON.stringify(r).includes('NaN'));
    assert.ok(r.warnings.find((w) => w.lineId === 'jpy').cs.includes('JPY'));
  });

  test('negative quantity or cost is excluded, also when both are negative', () => {
    assert.equal(lineCost({ qty: -2, unitCost: -50 }, { CZK: 1 }), -100);
    assert.equal(lineCost({ qty: -2, unitCost: 50 }, { CZK: 1 }), -100);
    const r = run([doc('negneg', 'US', -50, { qty: -2 }), doc('negQ', 'US', 50, { qty: -1 }), doc('de', 'DE', 100)]);
    assert.equal(byId(r).negneg.cost, 0);
    assert.equal(byId(r).negQ.cost, 0);
    assert.equal(r.totals.tier1, 100);
    assert.equal(r.status, 'pass');
    assert.deepEqual(codesFor(r, 'negneg'), ['negative-value']);
    assert.deepEqual(codesFor(r, 'negQ'), ['negative-value']);
  });

  const degenerate = {
    empty: [],
    null: null,
    undefined,
    nullLine: [null],
    zeroCosts: [doc('a', 'US', 0), doc('b', 'DE', 0), { id: 'c', unitCost: '0,00' }],
    onlyInhouse: [{ id: 'own', type: 'inhouse', unitCost: 100 }],
    onlyRaw: [{ id: 'r', type: 'raw', origin: 'US', unitCost: 100 }],
    noCosts: [{ id: 'a', origin: 'US' }, { id: 'b', origin: 'DE', unitCost: '' }],
    unknownRateOnly: [doc('j', 'JP', 100, { currency: 'JPY' })],
  };
  for (const [name, input] of Object.entries(degenerate)) {
    test(`no data (${name}): null ratios, no division by zero, valid JSON`, () => {
      const r = analyze(input, { today: TODAY });
      assert.equal(r.status, 'nodata');
      for (const m of ['a', 'b']) {
        for (const s of ['worst', 'expected', 'best']) {
          assert.equal(r.methods[m].scenarios[s].ratio, null);
          assert.equal(r.methods[m].scenarios[s].pass, null);
        }
      }
      for (const s of ['worst', 'expected', 'best']) assert.equal(r.verdict[s].pass, null);
      assert.equal(r.headroom.worst.amount, null);
      assert.equal(r.headroom.expected.amount, null);
      assert.equal(r.minimumSet.count, 0);
      assert.equal(r.substitution, null);
      for (const c of r.categories) {
        assert.equal(c.nonHomeShare, null);
        assert.ok(c.contribution === null || c.contribution === 0);
      }
      assert.equal(r.evidence.documentedShare, null);
      assert.ok(r.warnings.some((w) => w.code === 'no-data'));
      const json = JSON.stringify(r);
      assert.ok(!/NaN|Infinity/.test(json));
    });
  }

  test('EU–Canada with no data does not divide by zero either', () => {
    const r = analyze([{ id: 'own', type: 'inhouse', unitCost: 10 }], { pack: 'EU_CANADA', today: TODAY });
    assert.equal(r.status, 'nodata');
    assert.deepEqual(r.methods.b.scenarios.worst.shares, { home: null, canada: null, other: null });
  });

  test('missing quantity counts as 1 and is reported; a quantity of 0 gives cost 0', () => {
    const r = run([doc('q', 'DE', 10, { qty: '' }), doc('z', 'DE', 10, { qty: 0 }), doc('x', 'DE', 10, { qty: 'abc' })]);
    assert.equal(byId(r).q.cost, 10);
    assert.equal(byId(r).z.cost, 0);
    assert.equal(byId(r).x.cost, 10);
    assert.deepEqual(codesFor(r, 'q'), ['missing-qty']);
    assert.deepEqual(codesFor(r, 'x'), ['missing-qty']);
  });
});

/* ---------------------------------------------------------------------- */

describe('origins that only say "unknown"', () => {
  test('"-", "?", "N/A", "neznámá", "unknown", "TBD", "XX" are an empty origin, not a country', () => {
    for (const v of ['-', '–', '?', '???', 'N/A', 'n/a', 'n.a.', 'neznámá', 'Neznámý', 'nezjištěno', 'unknown', 'TBD', 'XX', 'x']) {
      const l = makeLine({ origin: v, expectedOrigin: v, supplierCountry: v });
      assert.deepEqual([l.origin, l.expectedOrigin, l.supplierCountry], [null, null, null], v);
      const r = run([{ id: 'p', origin: v, expectedOrigin: 'CZ', unitCost: 100 }]);
      const p = byId(r).p;
      assert.equal(p.status, 'unknown', v);
      assert.equal(p.origin, null, v);
      assert.deepEqual(p.group, { worst: 'nonHome', expected: 'home', best: 'home' }, v);
      assert.deepEqual(codesFor(r, 'p'), [], v);
    }
  });

  test('rowsToLines reads such cells as empty, without an unknown-country error', () => {
    const rows = [['Díl', 'Cena', 'Země původu', 'Odhad původu'], ['A', '10', 'N/A', 'Řecko'], ['B', '10', '-', '?']];
    const { lines, errors } = rowsToLines(rows, detectColumns(rows[0]));
    assert.deepEqual(lines.map((l) => [l.origin, l.expectedOrigin]), [[null, 'GR'], [null, null]]);
    assert.deepEqual(errors, []);
  });

  test('NA and SR stay ISO codes (Namibia, Suriname) but get an information note', () => {
    const r = run([{ id: 'na', origin: 'NA', unitCost: 1 }, { id: 'sr', supplierCountry: 'SR', unitCost: 1 }]);
    assert.equal(byId(r).na.origin, 'NA');
    const w = r.warnings.filter((x) => x.code === 'ambiguous-country');
    assert.deepEqual(w.map((x) => [x.lineId, x.country, x.severity]), [['na', 'NA', 'info'], ['sr', 'SR', 'info']]);
    assert.match(w[1].cs, /Slovensko/);
    assert.match(w[1].en, /Slovakia use SK/);
  });

  test('two countries in one cell are ambiguous: unknown country, counted outside, warned', () => {
    for (const v of ['DE/US', 'CZ, SK', 'DE - US', 'Germany (US)', 'DE+AT']) assert.equal(normalizeCountry(v), null, v);
    for (const [v, c] of [['DE - Německo', 'DE'], ['Germany (DE)', 'DE'], ['EU - Německo', 'DE'], ['Německo (EU)', 'DE'], ['USA - Kalifornie', 'US']]) {
      assert.equal(normalizeCountry(v), c, v);
    }
    const r = run([doc('mix', 'DE/US', 100)]);
    assert.equal(byId(r).mix.group.worst, 'nonHome');
    assert.deepEqual(codesFor(r, 'mix'), ['unknown-country']);
  });
});

/* ---------------------------------------------------------------------- */

describe('parsing real-world input', () => {
  test('Czech number formats', () => {
    const cases = [
      ['1 234,50', 1234.5], ['1 234,50', 1234.5], ['1 234,50', 1234.5], ['1.234,50', 1234.5], ['12,50 Kč', 12.5],
      ['1 234,- Kč', 1234], ['48 500', 48500], ['0,5', 0.5], ['-1 234,5', -1234.5], ['1 234 567,891', 1234567.891],
      ['1,5E+03', 1500], ['1.5e3', 1500], ['2E-2', 0.02],
    ];
    for (const [v, n] of cases) close(parseNumber(v), n, v);
    for (const v of ['31. 3. 2027', '31.3.2027', '12x5', '1.234.5', '3 ks 2']) assert.ok(Number.isNaN(parseNumber(v)), v);
  });

  test('a column of Czech thousands with dots (1.250, 2.500) is read as thousands', () => {
    const rows = [['Díl', 'Cena'], ['a', '1.250'], ['b', '2.500'], ['c', '12']];
    assert.deepEqual(rowsToLines(rows, detectColumns(rows[0])).lines.map((l) => l.unitCost), [1250, 2500, 12]);
  });

  test('a date or a range in a cost column is an error, not a number', () => {
    const rows = [['Díl', 'Cena'], ['a', '31.3.2027'], ['b', '10']];
    const { lines, errors } = rowsToLines(rows, detectColumns(rows[0]));
    assert.equal(lines[0].unitCost, null);
    assert.deepEqual(errors.map((e) => [e.code, e.field, e.row]), [['invalid-number', 'unitCost', 2]]);
  });

  test('semicolon CSV with quoted semicolons, quotes, CRLF and LF newlines inside a cell', () => {
    const text = 'Číslo dílu;Popis;Cena;Země původu\r\nA-1;"Šroub; M8 ""nerez""\r\ndruhý řádek";"1 234,50";CZ\r\nA-2;"Matice\nM8";5;"Německo"\r\n';
    assert.deepEqual(parseTable(text), [
      ['Číslo dílu', 'Popis', 'Cena', 'Země původu'],
      ['A-1', 'Šroub; M8 "nerez"\r\ndruhý řádek', '1 234,50', 'CZ'],
      ['A-2', 'Matice\nM8', '5', 'Německo'],
    ]);
    const rows = parseTable(text);
    const { lines } = rowsToLines(rows, detectColumns(rows[0]));
    assert.deepEqual(lines.map((l) => [l.partNo, l.unitCost, l.origin]), [['A-1', 1234.5, 'CZ'], ['A-2', 5, 'DE']]);
  });

  test('TSV pasted from Excel with trailing tabs and empty trailing cells', () => {
    const text = 'Číslo dílu\tPopis\tMnožství\tJednotková cena\tMěna\tZemě původu\tDoklad\t\t\n' +
      'A-1\tŠroub, M8\t2\t1 234,50\tCZK\tCZ\tcelní doklad\t\t\n' +
      'A-2\tSnímač\t\t12,50\tEUR\tEL\t\t\t\n' +
      'A-3\tKabel\t1\t500\t\t\t\t\t\n';
    const rows = parseTable(text);
    assert.equal(rows.length, 4);
    assert.ok(rows.every((r) => r.length === 9));
    const { lines, errors } = rowsToLines(rows, detectColumns(rows[0]));
    assert.deepEqual(errors, []);
    assert.deepEqual(lines.map((l) => [l.partNo, l.qty, l.unitCost, l.currency, l.origin, l.evidence]), [
      ['A-1', 2, 1234.5, 'CZK', 'CZ', 'customs'],
      ['A-2', null, 12.5, 'EUR', 'GR', 'none'],
      ['A-3', 1, 500, 'CZK', null, 'none'],
    ]);
    const r = analyze(lines, { fx: { CZK: 1, EUR: 25 }, currency: 'CZK', today: TODAY });
    assert.equal(r.totals.tier1, 2469 + 312.5 + 500);
    assert.deepEqual(codesFor(r, 'L2'), ['missing-qty']);
  });

  test('a title row above the header does not decide the delimiter', () => {
    assert.deepEqual(parseTable('Kusovník PM7\nDíl;Cena;Původ\nA;1 234,50;CZ\nB;5;DE'), [
      ['Kusovník PM7'], ['Díl', 'Cena', 'Původ'], ['A', '1 234,50', 'CZ'], ['B', '5', 'DE'],
    ]);
    assert.deepEqual(parseTable('Export 18. 10. 2026\n\nDíl\tCena\nA\t1,5\n')[2], ['A', '1,5']);
  });

  test('an unclosed quote is read as a character instead of swallowing the rest of the file', () => {
    assert.deepEqual(parseTable('Díl;Popis;Cena\nA;"Kabel 12;5\nB;Šroub;7\nC;Matice;8'), [
      ['Díl', 'Popis', 'Cena'], ['A', '"Kabel 12', '5'], ['B', 'Šroub', '7'], ['C', 'Matice', '8'],
    ]);
    assert.deepEqual(parseTable('a;b\n1;"'), [['a', 'b'], ['1', '"']]);
    assert.deepEqual(parseTable('a;b\n"x";"y""'), [['a', 'b'], ['x', '"y""']], 'the raw text is kept');
  });

  test('lineStatus accepts Czech evidence words and dates', () => {
    assert.equal(lineStatus({ origin: 'CZ', evidence: 'Prohlášení dodavatele', validUntil: '31. 12. 2026' }, TODAY), 'documented');
    assert.equal(lineStatus({ origin: 'CZ', evidence: 'Prohlášení dodavatele', validUntil: '17. 10. 2026' }, TODAY), 'stated');
    assert.equal(lineStatus({ origin: 'CZ', evidence: 'celní doklad (JSD)' }, TODAY), 'documented');
    assert.equal(lineStatus({ origin: 'CZ', evidence: 'odhad' }, TODAY), 'stated');
  });
});

/* ---------------------------------------------------------------------- */

describe('sample bill of materials: the intended story under every rule pack', () => {
  const path = fileURLToPath(new URL('../../site/assets/sample/ukazka-kusovnik.csv', import.meta.url));
  const rows = parseTable(readFileSync(path, 'utf8'));
  const { lines } = rowsToLines(rows, detectColumns(rows[0]), { currency: 'CZK', hasHeader: true });
  const fx = { CZK: 1, EUR: 25, USD: 23, GBP: 29.5, CHF: 26.5, PLN: 5.9 };
  const at = (pack, today = TODAY) => analyze(lines, { pack, fx, currency: 'CZK', today });
  const pct = (x) => Math.round(x * 1000) / 10;

  test('SAFE numbers (18. 10. 2026), recomputed independently', () => {
    const r = at('SAFE');
    assert.deepEqual([r.totals.tier1, r.totals.inhouse, r.totals.raw], [3127660, 700000, 66000]);
    assert.deepEqual([r.totals.counts.tier1, r.totals.counts.inhouse, r.totals.counts.raw], [59, 3, 2]);
    const a = r.methods.a.scenarios;
    const b = r.methods.b.scenarios;
    assert.deepEqual([a.worst.nonHome, a.expected.nonHome, a.best.nonHome], [1858110, 1156060, 973260]);
    assert.deepEqual([pct(a.worst.ratio), pct(a.expected.ratio), pct(a.best.ratio)], [59.4, 37, 31.1]);
    assert.deepEqual([pct(b.worst.ratio), pct(b.expected.ratio), pct(b.best.ratio)], [48.5, 30.2, 25.4]);
    assert.deepEqual([a.worst.pass, a.expected.pass, a.best.pass, b.worst.pass, b.expected.pass, b.best.pass],
      [false, false, true, false, true, true]);
    assert.equal(r.status, 'depends');
    close(r.headroom.worst.amount, 0.35 * 3827660 - 1858110);
    close(r.headroom.expected.amount, 0.35 * 3827660 - 1156060);
    const partNo = Object.fromEntries(lines.map((l) => [l.id, l.partNo]));
    assert.equal(r.minimumSet.method, 'b');
    assert.deepEqual(r.minimumSet.lineIds.map((id) => partNo[id]), ['PM7-S-008', 'PM7-E-001', 'PM7-S-013', 'PM7-I-009', 'PM7-P-006']);
    assert.equal(r.minimumSet.coveredCost, 582500);
    assert.deepEqual(r.evidence.expired.map((e) => e.partNo), ['PM7-P-006']);
    assert.deepEqual(r.evidence.expiringSoon.map((e) => [e.partNo, e.daysLeft]), [['PM7-I-006', 89]]);
  });

  test('every pack: worst fails, expected passes by method b, a small set fixes the worst case', () => {
    const want = { SAFE: 5, UASL: 5, EDIP: 6, EDIP_USI: 5, EU_CANADA: 5 };
    for (const pack of Object.keys(RULE_PACKS)) {
      const r = at(pack);
      assert.equal(r.status, 'depends', pack);
      assert.equal(r.verdict.worst.pass, false, pack);
      assert.deepEqual(r.verdict.expected, { pass: true, method: 'b' }, pack);
      assert.equal(r.methods.a.scenarios.expected.pass, false, pack);
      assert.equal(r.minimumSet.feasible, true, pack);
      assert.equal(r.minimumSet.count, want[pack], pack);
      assert.equal(r.substitution, null, pack);
    }
  });

  test('the story holds for a year: SAFE set stays at 5 lines and EDIP at 6 until the end of 2027', () => {
    for (const day of ['2026-11-30', '2026-12-31', '2027-01-20', '2027-04-15', '2027-07-15', '2027-10-15', '2027-12-31']) {
      const safe = at('SAFE', day);
      assert.equal(safe.status, 'depends', day);
      assert.equal(safe.minimumSet.count, 5, day);
      assert.equal(pct(safe.methods.b.scenarios.expected.ratio), 30.2, day);
      assert.equal(at('EDIP', day).minimumSet.count, 6, day);
    }
  });
});
