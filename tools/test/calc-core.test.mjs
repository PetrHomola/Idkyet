import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  CATEGORIES,
  RULE_PACKS,
  DEFAULT_RISK,
  FIELDS,
  parseTable,
  parseNumber,
  parseDate,
  detectDecimal,
  detectColumns,
  rowsToLines,
  lineCost,
  lineStatus,
  analyze,
  toCsv,
  makeLine,
  normalizeCategory,
  normalizeEvidence,
  normalizeType,
  normalizeCurrency,
} from '../../site/assets/js/calc-core.js';

const TODAY = '2026-10-18';
const close = (actual, expected, msg) => assert.ok(Math.abs(actual - expected) < 1e-9, `${msg || ''} ${actual} != ${expected}`);

/** Documented tier-1 line in CZK with cost = unitCost. */
function doc(id, origin, cost, extra = {}) {
  return { id, origin, unitCost: cost, qty: 1, currency: 'CZK', evidence: 'customs', type: 'tier1', category: 'structural', ...extra };
}

function run(lines, opts = {}) {
  return analyze(lines, { pack: 'SAFE', fx: { CZK: 1 }, currency: 'CZK', today: TODAY, ...opts });
}

/* ---------------------------------------------------------------------- */

describe('Commission example (EDIP training slides)', () => {
  // Tier-1 total 214, of which 92 non-EU; in-house sub-assemblies 61.
  const lines = [
    doc('nonEU', 'US', 92),
    doc('eu', 'DE', 122, { evidence: 'declaration', validUntil: '2027-12-31' }),
    { id: 'own', type: 'inhouse', unitCost: 61, currency: 'CZK', description: 'Podsestavy ve vlastní režii' },
  ];

  for (const pack of ['SAFE', 'EDIP', 'UASL', 'EDIP_USI']) {
    test(`${pack}: method a = 92/214 = 43 % fails, method b = 92/275 = 34 % passes`, () => {
      const r = run(lines, { pack });
      assert.equal(r.totals.tier1, 214);
      assert.equal(r.totals.inhouse, 61);
      assert.equal(r.methods.a.denominator, 214);
      assert.equal(r.methods.b.denominator, 275);
      assert.equal(r.methods.b.used, true);
      for (const scen of ['worst', 'expected', 'best']) {
        assert.equal(r.methods.a.scenarios[scen].nonHome, 92);
        close(r.methods.a.scenarios[scen].ratio, 92 / 214);
        assert.equal(r.methods.a.scenarios[scen].pass, false);
        close(r.methods.b.scenarios[scen].ratio, 92 / 275);
        assert.equal(r.methods.b.scenarios[scen].pass, true);
        assert.deepEqual(r.verdict[scen], { pass: true, method: 'b' });
      }
      assert.equal(Math.round(r.methods.a.scenarios.worst.ratio * 100), 43);
      assert.equal(Math.ceil(r.methods.b.scenarios.worst.ratio * 100), 34, 'the slides round 33.45 % up to 34 %');
      assert.equal(r.status, 'pass');
      assert.equal(r.headroom.worst.method, 'b');
      close(r.headroom.worst.amount, 0.35 * 275 - 92);
      assert.equal(r.minimumSet.feasible, true);
      assert.equal(r.minimumSet.count, 0);
      assert.equal(r.substitution, null);
    });
  }
});

/* ---------------------------------------------------------------------- */

describe('rule packs', () => {
  const shareOf = (origin, pack) => {
    const r = run([doc('x', origin, 50), doc('home', 'DE', 50)], { pack });
    return r.methods.a.scenarios.expected.ratio;
  };
  const isHome = (origin, pack) => shareOf(origin, pack) === 0;

  test('pack metadata', () => {
    for (const id of ['SAFE', 'UASL', 'EDIP', 'EDIP_USI', 'EU_CANADA']) {
      const p = RULE_PACKS[id];
      assert.equal(p.id, id);
      assert.ok(p.home instanceof Set);
      assert.equal(p.threshold, 0.35);
      assert.ok(p.cs && p.en && p.source);
      assert.equal(p.kind, id === 'EU_CANADA' ? 'canada' : 'standard');
    }
    assert.equal(RULE_PACKS.EU_CANADA.homeMin, 0.2);
    assert.deepEqual([...DEFAULT_RISK], ['RU', 'BY', 'IR', 'KP']);
  });

  test('EU27 is home in every pack', () => {
    for (const pack of Object.keys(RULE_PACKS)) {
      for (const c of ['CZ', 'DE', 'AT', 'PL', 'SK', 'FR', 'IT', 'SE', 'GR', 'IE', 'CY', 'MT']) assert.ok(isHome(c, pack), `${c} in ${pack}`);
    }
  });

  test('CH and GB are outside in every pack', () => {
    for (const pack of Object.keys(RULE_PACKS)) {
      assert.equal(isHome('CH', pack), false, `CH in ${pack}`);
      assert.equal(isHome('GB', pack), false, `GB in ${pack}`);
      assert.equal(isHome('US', pack), false, `US in ${pack}`);
    }
  });

  test('NO is home in SAFE, UASL and EDIP but not in EDIP_USI', () => {
    assert.ok(isHome('NO', 'SAFE'));
    assert.ok(isHome('NO', 'UASL'));
    assert.ok(isHome('NO', 'EDIP'));
    assert.equal(isHome('NO', 'EDIP_USI'), false);
  });

  test('UA is home in SAFE, UASL and EDIP_USI but not in EDIP', () => {
    assert.ok(isHome('UA', 'SAFE'));
    assert.ok(isHome('UA', 'UASL'));
    assert.ok(isHome('UA', 'EDIP_USI'));
    assert.equal(isHome('UA', 'EDIP'), false);
  });

  test('IS and LI are home in SAFE but not in EDIP', () => {
    for (const c of ['IS', 'LI']) {
      assert.ok(isHome(c, 'SAFE'), c);
      assert.equal(isHome(c, 'EDIP'), false, c);
    }
  });

  test('EL is read as GR; "EU" origin is home; country names work in lines', () => {
    assert.ok(isHome('EL', 'SAFE'));
    assert.ok(isHome('EU', 'EDIP'));
    assert.ok(isHome('Německo', 'SAFE'));
    assert.equal(isHome('Švýcarsko', 'SAFE'), false);
  });

  test('unknown pack id falls back to SAFE', () => {
    assert.equal(run([doc('a', 'UA', 1)], { pack: 'nonsense' }).pack, 'SAFE');
  });
});

/* ---------------------------------------------------------------------- */

describe('scenarios', () => {
  const lines = [
    doc('docHome', 'DE', 40, { evidence: 'declaration', validUntil: '2027-01-31' }),
    { id: 'statedHome', origin: 'FR', unitCost: 20, evidence: 'assumed', category: 'power' },
    { id: 'unknownExpHome', expectedOrigin: 'CZ', supplierCountry: 'US', unitCost: 10, category: 'power' },
    { id: 'unknownSupplierHome', supplierCountry: 'PL', unitCost: 10, category: 'safety' },
    { id: 'unknownNothing', unitCost: 10, category: 'safety' },
    { id: 'statedNonHome', origin: 'US', unitCost: 10, evidence: 'none', category: 'electronics' },
  ];
  const r = run(lines);

  test('worst counts only documented home origins as home', () => {
    assert.equal(r.methods.a.scenarios.worst.nonHome, 60);
    close(r.methods.a.scenarios.worst.ratio, 0.6);
    assert.equal(r.methods.a.scenarios.worst.pass, false);
  });

  test('expected uses origin, then expected origin, then supplier country, else outside', () => {
    assert.equal(r.methods.a.scenarios.expected.nonHome, 20);
    assert.equal(r.methods.a.scenarios.expected.pass, true);
    const byId = Object.fromEntries(r.lines.map((l) => [l.id, l]));
    assert.equal(byId.unknownExpHome.effectiveOrigin, 'CZ');
    assert.equal(byId.unknownSupplierHome.effectiveOrigin, 'PL');
    assert.equal(byId.unknownNothing.group.expected, 'nonHome');
  });

  test('best counts unknown lines as home and stated origins as stated', () => {
    assert.equal(r.methods.a.scenarios.best.nonHome, 10);
    assert.equal(r.methods.a.scenarios.best.pass, true);
  });

  test('method b is unused without in-house lines', () => {
    assert.equal(r.methods.b.used, false);
    for (const scen of ['worst', 'expected', 'best']) assert.equal(r.verdict[scen].method, 'a');
  });

  test('status: depends when worst fails and best passes', () => {
    assert.equal(r.status, 'depends');
    assert.deepEqual(r.verdict.worst, { pass: false, method: 'a' });
    assert.deepEqual(r.verdict.expected, { pass: true, method: 'a' });
  });

  test('headroom for worst and expected', () => {
    close(r.headroom.worst.amount, 35 - 60);
    close(r.headroom.expected.amount, 35 - 20);
  });

  test('line statuses', () => {
    const byId = Object.fromEntries(r.lines.map((l) => [l.id, l.status]));
    assert.deepEqual(byId, {
      docHome: 'documented', statedHome: 'stated', unknownExpHome: 'unknown',
      unknownSupplierHome: 'unknown', unknownNothing: 'unknown', statedNonHome: 'stated',
    });
    assert.deepEqual(r.evidence.documented, { count: 1, cost: 40 });
    assert.deepEqual(r.evidence.stated, { count: 2, cost: 30 });
    assert.deepEqual(r.evidence.unknown, { count: 3, cost: 30 });
  });

  test('status fail when even the best case fails', () => {
    const f = run([doc('us', 'US', 60), doc('de', 'DE', 40)]);
    assert.equal(f.status, 'fail');
  });
});

/* ---------------------------------------------------------------------- */

describe('minimum evidence set and substitution', () => {
  test('largest undocumented home-expected lines until the worst case passes', () => {
    const lines = [
      doc('us', 'US', 25),
      { id: 'c25', origin: 'DE', unitCost: 25, evidence: 'none', supplier: 'Alfa' },
      { id: 'c20', expectedOrigin: 'CZ', unitCost: 20, supplier: 'Beta' },
      { id: 'c15', origin: 'SK', unitCost: 15, evidence: 'declaration', validUntil: '2026-01-31', supplier: 'Gama' },
      { id: 'c5', supplierCountry: 'AT', unitCost: 5, supplier: 'Delta' },
      { id: 'jp', expectedOrigin: 'JP', unitCost: 3, supplier: 'Beta' },
      doc('ok', 'FR', 7),
    ];
    const r = run(lines);
    assert.equal(r.methods.a.scenarios.worst.nonHome, 93);
    assert.equal(r.methods.a.scenarios.expected.pass, true);
    assert.equal(r.methods.a.scenarios.worst.pass, false);
    assert.equal(r.minimumSet.method, 'a');
    assert.deepEqual(r.minimumSet.lineIds, ['c25', 'c20', 'c15']);
    assert.equal(r.minimumSet.count, 3);
    assert.equal(r.minimumSet.coveredCost, 60);
    assert.equal(r.minimumSet.feasible, true);
    close(r.minimumSet.needed, 93 - 35);
    assert.equal(r.substitution, null);
    assert.ok(93 - 60 <= 35 && 93 - 45 > 35, 'set is minimal');
    const inSet = r.lines.filter((l) => l.inMinimumSet).map((l) => l.id);
    assert.deepEqual(inSet.sort(), ['c15', 'c20', 'c25']);
  });

  test('empty set when the worst case already passes', () => {
    const r = run([doc('de', 'DE', 80), { id: 'u', unitCost: 20 }]);
    assert.equal(r.verdict.worst.pass, true);
    assert.deepEqual(r.minimumSet.lineIds, []);
    assert.equal(r.minimumSet.feasible, true);
  });

  test('uses method b when it needs fewer lines', () => {
    const lines = [
      doc('us', 'US', 40),
      { id: 'a1', origin: 'DE', unitCost: 30 },
      { id: 'a2', origin: 'DE', unitCost: 20 },
      doc('fr', 'FR', 10),
      { id: 'own', type: 'inhouse', unitCost: 80 },
    ];
    const r = run(lines);
    // a: 90/100 needs 55 > 30 + 20 (infeasible); b: 90/180 needs 27 -> one line
    assert.equal(r.minimumSet.method, 'b');
    assert.equal(r.minimumSet.feasible, true);
    assert.deepEqual(r.minimumSet.lineIds, ['a1']);
  });

  test('infeasible set triggers substitution of the largest non-EU lines', () => {
    const lines = [
      doc('us', 'US', 50, { supplier: 'Omega' }),
      doc('jp', 'JP', 20),
      { id: 'cand', expectedOrigin: 'CZ', unitCost: 20 },
      doc('de', 'DE', 10),
    ];
    const r = run(lines);
    assert.equal(r.verdict.expected.pass, false);
    assert.equal(r.minimumSet.feasible, false);
    assert.deepEqual(r.minimumSet.lineIds, ['cand']);
    assert.ok(r.substitution);
    assert.deepEqual(r.substitution.lineIds, ['us']);
    assert.equal(r.substitution.count, 1);
    assert.equal(r.substitution.cost, 50);
    assert.equal(r.substitution.feasible, true);
    assert.equal(r.status, 'fail');
  });
});

/* ---------------------------------------------------------------------- */

describe('EU–Canada agreement', () => {
  const share = (lines) => run(lines, { pack: 'EU_CANADA' });

  test('Canadian components may exceed 35 %', () => {
    const r = share([doc('ca', 'CA', 60), doc('de', 'DE', 25), doc('us', 'US', 15)]);
    const w = r.methods.a.scenarios.worst;
    close(w.shares.home, 0.25);
    close(w.shares.canada, 0.6);
    close(w.shares.other, 0.15);
    assert.deepEqual(w.costs, { home: 25, canada: 60, other: 15 });
    assert.equal(w.nonHome, 15);
    assert.equal(w.pass, true);
    assert.equal(r.status, 'pass');
    // The same lines fail under plain SAFE.
    assert.equal(run([doc('ca', 'CA', 60), doc('de', 'DE', 25), doc('us', 'US', 15)]).status, 'fail');
  });

  test('home share must be at least 20 %', () => {
    const r = share([doc('ca', 'CA', 70), doc('de', 'DE', 15), doc('us', 'US', 15)]);
    assert.equal(r.methods.a.scenarios.worst.pass, false);
  });

  test('other third countries at most 35 % and not above the home share', () => {
    const r = share([doc('ca', 'CA', 40), doc('de', 'DE', 25), doc('us', 'US', 35)]);
    close(r.methods.a.scenarios.worst.shares.other, 0.35);
    assert.equal(r.methods.a.scenarios.worst.pass, false, 'other 35 > home 25');
    const ok = share([doc('ca', 'CA', 30), doc('de', 'DE', 35), doc('us', 'US', 35)]);
    assert.equal(ok.methods.a.scenarios.worst.pass, true);
    const over = share([doc('ca', 'CA', 20), doc('de', 'DE', 44), doc('us', 'US', 36)]);
    assert.equal(over.methods.a.scenarios.worst.pass, false, 'other 36 % > 35 %');
  });

  test('method b counts in-house costs as home', () => {
    const r = share([doc('ca', 'CA', 70), doc('de', 'DE', 15), doc('us', 'US', 15), { id: 'own', type: 'inhouse', unitCost: 20 }]);
    assert.equal(r.methods.a.scenarios.worst.pass, false);
    const b = r.methods.b.scenarios.worst;
    close(b.shares.home, 35 / 120);
    assert.equal(b.pass, true);
    assert.equal(r.verdict.worst.method, 'b');
  });

  test('undocumented Canadian lines count as other in the worst case', () => {
    const r = share([{ id: 'ca', origin: 'CA', unitCost: 60 }, doc('de', 'DE', 40)]);
    assert.equal(r.methods.a.scenarios.worst.costs.other, 60);
    assert.equal(r.methods.a.scenarios.worst.pass, false);
    assert.equal(r.methods.a.scenarios.expected.costs.canada, 60);
    assert.equal(r.methods.a.scenarios.expected.pass, true);
    assert.deepEqual(r.minimumSet.lineIds, ['ca']);
  });
});

/* ---------------------------------------------------------------------- */

describe('line types, costs and evidence', () => {
  test('raw materials are excluded from both methods', () => {
    const base = [doc('us', 'US', 30), doc('de', 'DE', 70)];
    const r0 = run(base);
    const r1 = run([...base, { id: 'steel', type: 'raw', origin: 'CN', unitCost: 1000 }, { id: 'al', type: 'surovina', unitCost: 50 }]);
    assert.equal(r1.totals.raw, 1050);
    assert.equal(r1.totals.tier1, 100);
    assert.equal(r1.totals.counts.raw, 2);
    assert.deepEqual(r1.methods, r0.methods);
    assert.equal(r1.warnings.filter((w) => w.lineId === 'steel').length, 0);
  });

  test('lineCost: qty, currency conversion, defaults', () => {
    const fx = { CZK: 1, EUR: 25, USD: 23 };
    assert.equal(lineCost({ qty: 4, unitCost: 10, currency: 'EUR' }, fx), 1000);
    assert.equal(lineCost({ qty: 2, unitCost: 100, currency: 'USD' }, fx), 4600);
    assert.equal(lineCost({ unitCost: 7, currency: 'CZK' }, fx), 7, 'qty defaults to 1');
    assert.equal(lineCost({ qty: null, unitCost: 7 }, fx), 7);
    assert.equal(lineCost({ qty: 3, unitCost: null }, fx), 0);
    assert.equal(lineCost({ qty: 1, unitCost: 5, currency: 'JPY' }, fx), 0, 'unknown rate');
    assert.equal(lineCost({ qty: 1, unitCost: 5, currency: 'EUR' }, {}, 'EUR'), 5, 'project currency');
    assert.equal(lineCost({ qty: '2', unitCost: '1 234,50', currency: 'Kč' }, fx), 2469);
  });

  test('analyze converts currencies with fx', () => {
    const r = analyze(
      [doc('us', 'US', 100, { currency: 'USD' }), doc('de', 'DE', 200, { currency: 'EUR' }), doc('cz', 'CZ', 1000)],
      { pack: 'SAFE', fx: { CZK: 1, EUR: 25, USD: 23 }, currency: 'CZK', today: TODAY },
    );
    assert.equal(r.totals.tier1, 2300 + 5000 + 1000);
    close(r.methods.a.scenarios.worst.ratio, 2300 / 8300);
  });

  test('lineStatus and validity dates', () => {
    assert.equal(lineStatus({ origin: 'DE', evidence: 'customs' }, TODAY), 'documented');
    assert.equal(lineStatus({ origin: 'DE', evidence: 'declaration', validUntil: TODAY }, TODAY), 'documented');
    assert.equal(lineStatus({ origin: 'DE', evidence: 'declaration', validUntil: '2026-10-17' }, TODAY), 'stated');
    assert.equal(lineStatus({ origin: 'DE', evidence: 'contract', validUntil: '2027-01-01' }, TODAY), 'documented');
    assert.equal(lineStatus({ origin: 'DE', evidence: 'assumed' }, TODAY), 'stated');
    assert.equal(lineStatus({ origin: 'DE', evidence: 'none' }, TODAY), 'stated');
    assert.equal(lineStatus({ origin: 'DE' }, TODAY), 'stated');
    assert.equal(lineStatus({ origin: 'DE', evidence: 'prohlášení' }, TODAY), 'documented');
    assert.equal(lineStatus({ origin: '', evidence: 'customs' }, TODAY), 'unknown');
    assert.equal(lineStatus({ expectedOrigin: 'DE' }, TODAY), 'unknown');
  });

  test('expired declarations count as stated and are listed; expiring within 90 days are flagged', () => {
    const lines = [
      doc('expired', 'DE', 30, { evidence: 'declaration', validUntil: '2026-09-30', supplier: 'Alfa GmbH' }),
      doc('today', 'DE', 10, { evidence: 'declaration', validUntil: TODAY }),
      doc('soon', 'AT', 20, { evidence: 'declaration', validUntil: '2027-01-16' }),
      doc('later', 'AT', 20, { evidence: 'declaration', validUntil: '2027-01-17' }),
      doc('us', 'US', 20),
    ];
    const r = run(lines);
    const status = Object.fromEntries(r.lines.map((l) => [l.id, l.status]));
    assert.equal(status.expired, 'stated');
    assert.equal(status.today, 'documented');
    assert.deepEqual(r.evidence.expired.map((e) => e.lineId), ['expired']);
    assert.equal(r.evidence.expired[0].daysAgo, 18);
    assert.equal(r.evidence.expired[0].supplier, 'Alfa GmbH');
    assert.deepEqual(r.evidence.expiringSoon.map((e) => [e.lineId, e.daysLeft]), [['today', 0], ['soon', 90]]);
    assert.equal(r.methods.a.scenarios.worst.nonHome, 50, 'expired line counts outside in the worst case');
    assert.equal(r.methods.a.scenarios.expected.nonHome, 20);
    assert.deepEqual(r.supplierRequests.map((s) => [s.supplier, s.expired]), [['Alfa GmbH', 1]]);
  });

  test('categories follow the Commission template and add up', () => {
    const lines = [
      doc('s', 'US', 30, { category: 'structural' }),
      doc('p', 'DE', 20, { category: 'Pohon a energie' }),
      { id: 'e', origin: 'CN', unitCost: 25, category: 'electronics and comms' },
      { id: 'i', expectedOrigin: 'CZ', unitCost: 15, category: 'přístroje' },
      { id: 'x', origin: 'PL', unitCost: 10, evidence: 'declaration' },
      { id: 'own', type: 'inhouse', unitCost: 50, category: 'structural' },
    ];
    const r = run(lines);
    assert.deepEqual(CATEGORIES.map((c) => c.id), ['structural', 'power', 'instrumentation', 'safety', 'electronics']);
    assert.deepEqual(r.categories.map((c) => c.id), ['structural', 'power', 'instrumentation', 'safety', 'electronics', 'none']);
    const c = Object.fromEntries(r.categories.map((x) => [x.id, x]));
    assert.equal(c.structural.total, 30, 'in-house lines are not in the tier-1 breakdown');
    assert.equal(c.structural.nonHome, 30);
    assert.equal(c.electronics.nonHome, 25);
    assert.equal(c.electronics.undocumented, 25);
    assert.equal(c.instrumentation.nonHome, 0);
    assert.equal(c.instrumentation.undocumented, 15);
    assert.equal(c.safety.total, 0);
    assert.equal(c.safety.nonHomeShare, null);
    assert.equal(c.none.total, 10);
    close(c.structural.nonHomeShare, 1);
    const sum = r.categories.reduce((s, x) => s + x.contribution, 0);
    close(sum, r.methods[r.verdict.expected.method].scenarios.expected.ratio);
    assert.equal(r.verdict.expected.method, 'b');
    close(c.electronics.contributionByMethod.a, 25 / 100);
    const totalShare = r.categories.reduce((s, x) => s + x.totalShare, 0);
    close(totalShare, 1);
    const w = r.warnings.find((x) => x.code === 'missing-category');
    assert.deepEqual(w.lineIds, ['x']);
    assert.match(w.cs, /^1 řádek nemá kategorii/);
  });

  test('no "none" category row when every line has a category', () => {
    const r = run([doc('a', 'DE', 10)]);
    assert.equal(r.categories.length, 5);
  });

  test('supplier requests: undocumented lines by supplier, priority first, then cost', () => {
    const lines = [
      doc('us', 'US', 20),
      { id: 'big', origin: 'GB', unitCost: 10, supplier: 'Big Ltd', supplierCountry: 'GB' },
      { id: 'k1', expectedOrigin: 'DE', unitCost: 25, supplier: 'Klein GmbH', supplierCountry: 'DE' },
      { id: 'k2', origin: 'DE', unitCost: 15, supplier: 'klein gmbh ' },
      { id: 'm', expectedOrigin: 'CZ', unitCost: 5, supplier: 'Malá s.r.o.', supplierCountry: 'CZ' },
      doc('ok', 'CZ', 25, { supplier: 'Malá s.r.o.' }),
    ];
    const r = run(lines);
    assert.deepEqual(r.minimumSet.lineIds, ['k1', 'k2']);
    assert.deepEqual(
      r.supplierRequests.map((s) => [s.supplier, s.lines, s.cost, s.priority]),
      [['Klein GmbH', 2, 40, true], ['Big Ltd', 1, 10, false], ['Malá s.r.o.', 1, 5, false]],
    );
    assert.equal(r.supplierRequests[0].supplierCountry, 'DE');
    assert.deepEqual(r.supplierRequests[0].lineIds, ['k1', 'k2']);
  });
});

/* ---------------------------------------------------------------------- */

describe('warnings', () => {
  const r = analyze(
    [
      doc('ru', 'RU', 10),
      { id: 'cn', origin: 'Čína', unitCost: 10, category: 'electronics' },
      { id: 'noCost', origin: 'DE', category: 'power' },
      { id: 'noQty', origin: 'DE', qty: null, unitCost: 5, category: 'power' },
      { id: 'neg', origin: 'DE', qty: 1, unitCost: -5, category: 'power' },
      { id: 'jpy', origin: 'DE', unitCost: 5, currency: 'JPY', category: 'power' },
      { id: 'bad', origin: 'Atlantis', unitCost: 5, category: 'power' },
      { id: 'byS', expectedOrigin: 'DE', supplierCountry: 'BY', unitCost: 5, category: 'power' },
    ],
    { pack: 'SAFE', fx: { CZK: 1, EUR: 25 }, currency: 'CZK', today: TODAY },
  );
  const codes = (id) => r.warnings.filter((w) => w.lineId === id).map((w) => w.code);

  test('codes per line', () => {
    assert.deepEqual(codes('ru'), ['risk-country']);
    assert.deepEqual(codes('cn'), ['check-individually']);
    assert.deepEqual(codes('noCost'), ['missing-cost']);
    assert.deepEqual(codes('noQty'), ['missing-qty']);
    assert.deepEqual(codes('neg'), ['negative-value']);
    assert.deepEqual(codes('jpy'), ['unknown-currency']);
    assert.deepEqual(codes('bad'), ['unknown-country']);
    assert.deepEqual(codes('byS'), ['risk-country']);
  });

  test('every warning has Czech and English text and a severity', () => {
    for (const w of r.warnings) {
      assert.ok(w.cs && w.en && w.code && w.severity, JSON.stringify(w));
      assert.ok(!/undefined|null/.test(w.cs + w.en), w.cs);
    }
    assert.equal(r.warnings.find((w) => w.lineId === 'ru').severity, 'error');
    assert.equal(r.warnings.find((w) => w.lineId === 'cn').severity, 'info');
  });

  test('values behind warnings', () => {
    const cost = Object.fromEntries(r.lines.map((l) => [l.id, l.cost]));
    assert.equal(cost.noCost, 0);
    assert.equal(cost.noQty, 5, 'missing qty counts as 1');
    assert.equal(cost.neg, 0, 'negative lines are excluded');
    assert.equal(cost.jpy, 0);
    const bad = r.lines.find((l) => l.id === 'bad');
    assert.equal(bad.group.expected, 'nonHome', 'unknown country counts outside');
    assert.equal(bad.origin, 'ATLANTIS');
  });

  test('custom risk list', () => {
    const x = analyze([doc('cn', 'CN', 10)], { today: TODAY, risk: ['CN', 'Rusko'] });
    assert.deepEqual(x.warnings.map((w) => w.code), ['risk-country']);
    const y = analyze([doc('ru', 'RU', 10)], { today: TODAY, risk: [] });
    assert.deepEqual(y.warnings, []);
  });

  test('empty input: no division by zero', () => {
    for (const input of [[], null, [{ id: 'own', type: 'inhouse', unitCost: 10 }], [{ id: 'z', origin: 'DE', unitCost: 0 }]]) {
      const e = analyze(input, { today: TODAY });
      assert.equal(e.status, 'nodata');
      assert.equal(e.methods.a.scenarios.worst.ratio, null);
      assert.equal(e.methods.a.scenarios.worst.pass, null);
      assert.equal(e.headroom.worst.amount, null);
      assert.equal(e.minimumSet.feasible, false);
      assert.equal(e.substitution, null);
      assert.ok(e.warnings.some((w) => w.code === 'no-data'));
      assert.doesNotThrow(() => JSON.stringify(e));
    }
  });

  test('lines without ids get L<n>; duplicate ids are reported', () => {
    const x = analyze([{ origin: 'DE', unitCost: 1 }, { origin: 'US', unitCost: 1 }], { today: TODAY });
    assert.deepEqual(x.lines.map((l) => l.id), ['L1', 'L2']);
    const d = analyze([doc('a', 'DE', 1), doc('a', 'US', 1)], { today: TODAY });
    assert.ok(d.warnings.some((w) => w.code === 'duplicate-id'));
  });

  test('analyze does not mutate input lines', () => {
    const input = [{ origin: 'el', unitCost: '10', evidence: 'celní doklad' }];
    const copy = JSON.parse(JSON.stringify(input));
    analyze(input, { today: TODAY });
    assert.deepEqual(input, copy);
  });
});

/* ---------------------------------------------------------------------- */

describe('number and date parsing', () => {
  test('parseNumber formats', () => {
    const cases = [
      ['1 234,50', 1234.5], ['1,234.50', 1234.5], ['1234.5', 1234.5], ['1.234,50', 1234.5],
      ['1 234,50', 1234.5], ['1 234,5', 1234.5], ['12,5', 12.5], ['12', 12], ['0,75', 0.75],
      ['1 234 Kč', 1234], ['1 234,50 Kč', 1234.5], ['12,50 EUR', 12.5], ['EUR 12.50', 12.5], ['€ 1.250,00', 1250],
      ['$1,250.00', 1250], ['1.234.567', 1234567], ['1,234,567', 1234567], ['1 234 567,89', 1234567.89],
      ['-5', -5], ['−5,5', -5.5], ['(120)', -120], ['1 234,-', 1234], ["1'234.50", 1234.5], [42, 42], ['+3', 3],
    ];
    for (const [input, expected] of cases) close(parseNumber(input), expected, JSON.stringify(input));
    assert.equal(parseNumber(''), null);
    assert.equal(parseNumber('  '), null);
    assert.equal(parseNumber(null), null);
    assert.equal(parseNumber('-'), null);
    assert.ok(Number.isNaN(parseNumber('abc')));
    assert.ok(Number.isNaN(parseNumber('N/A')));
  });

  test('ambiguous single separators follow the column hint', () => {
    assert.equal(parseNumber('1,234'), 1.234);
    assert.equal(parseNumber('1,234', '.'), 1234);
    assert.equal(parseNumber('1.234'), 1.234);
    assert.equal(parseNumber('1.234', ','), 1234);
    assert.equal(detectDecimal(['1,5', '1.234', '12']), ',');
    assert.equal(detectDecimal(['1.5', '1,234', '12']), '.');
    assert.equal(detectDecimal(['1 234,50', '99']), ',');
    assert.equal(detectDecimal(['1,234', '12,000', '500']), '.');
    assert.equal(detectDecimal(['12']), null);
  });

  test('parseDate formats', () => {
    assert.equal(parseDate('2027-03-31'), '2027-03-31');
    assert.equal(parseDate('2027-3-1'), '2027-03-01');
    assert.equal(parseDate('31. 3. 2027'), '2027-03-31');
    assert.equal(parseDate('31.03.2027'), '2027-03-31');
    assert.equal(parseDate('31/03/2027'), '2027-03-31');
    assert.equal(parseDate('03/31/2027'), '2027-03-31');
    assert.equal(parseDate('2027/03/31'), '2027-03-31');
    assert.equal(parseDate('2027-03-31T00:00:00Z'), '2027-03-31');
    assert.equal(parseDate(46477), '2027-03-31', 'Excel serial');
    assert.equal(parseDate('46477'), '2027-03-31');
    assert.equal(parseDate(new Date(2027, 2, 31)), '2027-03-31');
    assert.equal(parseDate('2027-02-30'), null);
    assert.equal(parseDate('soon'), null);
    assert.equal(parseDate(''), null);
  });

  test('normalizeCurrency', () => {
    assert.equal(normalizeCurrency('Kč'), 'CZK');
    assert.equal(normalizeCurrency('kc'), 'CZK');
    assert.equal(normalizeCurrency('€'), 'EUR');
    assert.equal(normalizeCurrency('eur'), 'EUR');
    assert.equal(normalizeCurrency('$'), 'USD');
    assert.equal(normalizeCurrency('zł'), 'PLN');
    assert.equal(normalizeCurrency('jpy'), 'JPY');
    assert.equal(normalizeCurrency(''), null);
    assert.equal(normalizeCurrency('peníze'), null);
  });
});

/* ---------------------------------------------------------------------- */

describe('CSV and TSV parsing', () => {
  test('semicolon CSV with quotes, decimal commas, BOM and CRLF', () => {
    const text = '﻿Číslo dílu;Popis;Cena\r\nA-1;"Šroub; M8";"1 234,50"\r\nA-2;"Řekl ""ano""";12,5\r\n\r\n;;\r\n';
    assert.deepEqual(parseTable(text), [
      ['Číslo dílu', 'Popis', 'Cena'],
      ['A-1', 'Šroub; M8', '1 234,50'],
      ['A-2', 'Řekl "ano"', '12,5'],
    ]);
  });

  test('comma CSV with quoted commas and newlines', () => {
    const text = 'Part No,Description,Unit price\nP1,"Bolt, M8",1.5\nP2,"Two\nlines",2\n';
    assert.deepEqual(parseTable(text), [
      ['Part No', 'Description', 'Unit price'],
      ['P1', 'Bolt, M8', '1.5'],
      ['P2', 'Two\nlines', '2'],
    ]);
  });

  test('TSV pasted from Excel', () => {
    const text = 'Číslo dílu\tPopis\tCena\nA-1\tŠroub, M8; nerez\t1 234,50\nA-2\t"Uvozovky ""x"""\t5\n';
    assert.deepEqual(parseTable(text), [
      ['Číslo dílu', 'Popis', 'Cena'],
      ['A-1', 'Šroub, M8; nerez', '1 234,50'],
      ['A-2', 'Uvozovky "x"', '5'],
    ]);
  });

  test('semicolon file with decimal commas is not split on commas', () => {
    const rows = parseTable('A;B;C\n1,5;2,25;x\n3,5;4;y');
    assert.deepEqual(rows[1], ['1,5', '2,25', 'x']);
  });

  test('Excel sep= line, CR line ends, forced delimiter', () => {
    assert.deepEqual(parseTable('sep=,\na;b,c\n1;2,3'), [['a;b', 'c'], ['1;2', '3']]);
    assert.deepEqual(parseTable('a;b\r1;2\r'), [['a', 'b'], ['1', '2']]);
    assert.deepEqual(parseTable('a,b;c', { delimiter: ';' }), [['a,b', 'c']]);
    assert.deepEqual(parseTable(''), []);
    assert.deepEqual(parseTable(null), []);
  });

  test('toCsv round-trips through parseTable', () => {
    const rows = [['ID', 'Popis', 'Cena'], ['L1', 'Šroub; "M8"', 1234.5], ['L2', 'dva\nřádky', null], ['L3', '=SUM(A1)', -2]];
    const csv = toCsv(rows);
    assert.ok(csv.endsWith('\r\n'));
    assert.match(csv, /1234,5/);
    assert.deepEqual(parseTable(csv), [
      ['ID', 'Popis', 'Cena'],
      ['L1', 'Šroub; "M8"', '1234,5'],
      ['L2', 'dva\nřádky', ''],
      ['L3', "'=SUM(A1)", '-2'],
    ]);
    assert.equal(toCsv([[1.5, 'a,b']], { delimiter: ',' }), '1.5,"a,b"\r\n');
    assert.ok(toCsv([['a']], { bom: true }).startsWith('﻿'));
  });
});

/* ---------------------------------------------------------------------- */

describe('column detection and rows to lines', () => {
  const CZ_HEADERS = ['Číslo dílu', 'Popis', 'Dodavatel', 'Země dodavatele', 'Kategorie', 'Množství', 'Jednotková cena', 'Měna',
    'Země původu', 'Doklad', 'Platnost do', 'Odhad původu', 'Typ', 'Poznámka'];

  test('Czech headers', () => {
    const m = detectColumns(CZ_HEADERS);
    assert.deepEqual(m, {
      partNo: 0, description: 1, supplier: 2, supplierCountry: 3, category: 4, qty: 5, unitCost: 6, totalCost: null,
      currency: 7, origin: 8, evidence: 9, validUntil: 10, expectedOrigin: 11, type: 12, note: 13, id: null,
    });
    assert.deepEqual(Object.keys(m).sort(), FIELDS.map((f) => f.id).sort());
  });

  test('English headers and abbreviations', () => {
    const m = detectColumns(['PN', 'Description', 'Supplier', 'Supplier country', 'Category', 'Qty', 'Unit price', 'Currency',
      'COO', 'Evidence', 'Valid until', 'Expected origin', 'Type', 'Note']);
    assert.deepEqual([m.partNo, m.description, m.supplier, m.supplierCountry, m.category, m.qty, m.unitCost, m.currency,
      m.origin, m.evidence, m.validUntil, m.expectedOrigin, m.type, m.note], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    const m2 = detectColumns(['Part No.', 'Quantity', 'Unit cost (EUR)', 'Country of origin', 'Cena celkem']);
    assert.equal(m2.partNo, 0);
    assert.equal(m2.qty, 1);
    assert.equal(m2.unitCost, 2);
    assert.equal(m2.origin, 3);
    assert.equal(m2.totalCost, 4);
  });

  test('variants and disambiguation', () => {
    const m = detectColumns(['Původ', 'Odhadovaná země původu', 'Cena', 'Dodavatel', 'Množství (ks)', 'Origin evidence', 'Platnost']);
    assert.equal(m.origin, 0);
    assert.equal(m.expectedOrigin, 1);
    assert.equal(m.unitCost, 2);
    assert.equal(m.supplier, 3);
    assert.equal(m.qty, 4);
    assert.equal(m.evidence, 5);
    assert.equal(m.validUntil, 6);
    const n = detectColumns(['', 'Neznámý sloupec', 'Země původu', 'Země dodavatele']);
    assert.equal(n.origin, 2);
    assert.equal(n.supplierCountry, 3);
    assert.equal(n.partNo, null);
    assert.deepEqual(detectColumns(null).unitCost, null);
  });

  test('rowsToLines: header skip, numbers, synonyms, currency, totals', () => {
    const text = [
      'Číslo dílu;Popis;Dodavatel;Kategorie;Množství;Jednotková cena;Měna;Země původu;Doklad;Platnost do;Odhad původu;Typ',
      'A1;Rám;Strojírny Valeč s.r.o.;konstrukce;2;"1 234,50";Kč;Česko;celní doklad;;;nakupovaný díl',
      'A2;Snímač;Nordwerk GmbH;Instrumentation;;12,50 EUR;;Germany;supplier declaration;31. 3. 2027;;tier-1',
      'A3;Kabel;Kabel s.r.o.;elektronika;1;500;;;;;Polsko;',
      'A4;Montáž;;power;1;10 000;;;;;;vlastní výroba',
      'A5;Plech;Hutě;;1;1 000;;;;;;raw material',
      'A6;Těsnění;Gumy a.s.;safety;1;100;CZK;Atlantida;smlouva;;;',
      'Celkem;;;;;12 345;;;;;;',
    ].join('\n');
    const rows = parseTable(text);
    const mapping = detectColumns(rows[0]);
    const { lines, errors } = rowsToLines(rows, mapping, { currency: 'CZK' });
    assert.equal(lines.length, 6);
    assert.deepEqual(lines.map((l) => l.id), ['L1', 'L2', 'L3', 'L4', 'L5', 'L6']);
    const [a1, a2, a3, a4, a5, a6] = lines;
    assert.deepEqual(
      { qty: a1.qty, unitCost: a1.unitCost, currency: a1.currency, origin: a1.origin, evidence: a1.evidence, category: a1.category, type: a1.type },
      { qty: 2, unitCost: 1234.5, currency: 'CZK', origin: 'CZ', evidence: 'customs', category: 'structural', type: 'tier1' },
    );
    assert.equal(a2.qty, null, 'empty qty cell');
    assert.equal(a2.unitCost, 12.5);
    assert.equal(a2.currency, 'EUR', 'currency from the cost cell');
    assert.equal(a2.origin, 'DE');
    assert.equal(a2.evidence, 'declaration');
    assert.equal(a2.validUntil, '2027-03-31');
    assert.equal(a2.category, 'instrumentation');
    assert.equal(a3.evidence, 'none');
    assert.equal(a3.origin, null);
    assert.equal(a3.expectedOrigin, 'PL');
    assert.equal(a3.category, 'electronics');
    assert.equal(a3.currency, 'CZK', 'project currency by default');
    assert.equal(a4.type, 'inhouse');
    assert.equal(a4.unitCost, 10000);
    assert.equal(a5.type, 'raw');
    assert.equal(a6.evidence, 'contract');
    assert.equal(a6.origin, 'ATLANTIDA');
    const codes = errors.map((e) => e.code).sort();
    assert.deepEqual(codes, ['skipped-total-row', 'unknown-country']);
    const unknown = errors.find((e) => e.code === 'unknown-country');
    assert.equal(unknown.row, 7);
    assert.equal(unknown.lineId, 'L6');
    assert.ok(unknown.cs && unknown.en);
  });

  test('rowsToLines: rows without the header, explicit hasHeader, line totals, unknown values', () => {
    const rows = [['P1', '2', '100', 'xyz', 'magic', 'něco'], ['P2', '', '', '', '', '']];
    const mapping = { partNo: 0, qty: 1, totalCost: 2, category: 3, evidence: 4, type: 5 };
    const { lines, errors } = rowsToLines(rows, mapping, { currency: 'EUR', hasHeader: false });
    assert.equal(lines.length, 2);
    assert.equal(lines[0].unitCost, 50, 'unit cost derived from the line total');
    assert.equal(lines[0].currency, 'EUR');
    assert.equal(lines[0].category, null);
    assert.equal(lines[0].evidence, 'none');
    assert.equal(lines[0].type, 'tier1');
    assert.deepEqual(errors.map((e) => e.code).sort(), ['unknown-category', 'unknown-evidence', 'unknown-type']);
    assert.equal(lines[1].unitCost, null);
    const auto = rowsToLines(rows, mapping, {});
    assert.equal(auto.lines.length, 2, 'first data row is not mistaken for a header');
  });

  test('rowsToLines: decimal detection per column and missing cost column', () => {
    const rows = [['Part', 'Price'], ['a', '1,234'], ['b', '12.50']];
    const { lines } = rowsToLines(rows, detectColumns(rows[0]));
    assert.deepEqual(lines.map((l) => l.unitCost), [1234, 12.5]);
    const { errors } = rowsToLines([['Part'], ['a']], { partNo: 0 });
    assert.equal(errors[0].code, 'no-cost-column');
  });

  test('rowsToLines: currency from the cost header', () => {
    const rows = [['Díl', 'Cena (EUR)'], ['a', '10']];
    const { lines } = rowsToLines(rows, detectColumns(rows[0]), { currency: 'CZK' });
    assert.equal(lines[0].currency, 'EUR');
  });

  test('vocabularies: categories, evidence and types in Czech and English', () => {
    const cat = {
      elektronika: 'electronics', electronics: 'electronics', 'Elektronika a komunikace': 'electronics', comms: 'electronics',
      'Konstrukce a mechanika': 'structural', mechanical: 'structural', 'Pohon a energie': 'power', energy: 'power',
      'Přístroje a monitorování': 'instrumentation', sensors: 'instrumentation', 'Bezpečnost a ochrana': 'safety',
      'safety and protection': 'safety', ochrana: 'safety', 3: 'instrumentation',
    };
    for (const [k, v] of Object.entries(cat)) assert.equal(normalizeCategory(k), v, k);
    assert.equal(normalizeCategory(''), null);
    assert.equal(normalizeCategory('ostatní'), null);

    const ev = {
      'celní doklad': 'customs', customs: 'customs', 'Customs declaration': 'customs', JSD: 'customs',
      'prohlášení': 'declaration', 'prohlášení dodavatele': 'declaration', declaration: 'declaration',
      'vyhlásenie dodávateľa': 'declaration', smlouva: 'contract', 'kupní smlouva': 'contract', contract: 'contract',
      odhad: 'assumed', assumed: 'assumed', 'předpoklad': 'assumed', none: 'none', 'žádný': 'none', '-': null,
      'bez dokladu': 'none', 'prohlášení vyžádáno': 'none', 'n/a': 'none',
    };
    for (const [k, v] of Object.entries(ev)) assert.equal(normalizeEvidence(k), v, k);

    const ty = {
      'vlastní výroba': 'inhouse', 'in-house': 'inhouse', inhouse: 'inhouse', make: 'inhouse', surovina: 'raw',
      'raw material': 'raw', raw: 'raw', 'nakupovaný díl': 'tier1', 'tier-1': 'tier1', 'Tier 1': 'tier1',
      purchased: 'tier1', buy: 'tier1',
    };
    for (const [k, v] of Object.entries(ty)) assert.equal(normalizeType(k), v, k);
    assert.equal(normalizeType('něco'), null);
  });

  test('makeLine fills defaults and normalizes values', () => {
    const l = makeLine({ origin: 'el', evidence: 'celní doklad', unitCost: '1 000,5', category: 'elektronika' }, { currency: 'EUR' });
    assert.ok(l.id);
    assert.equal(l.origin, 'GR');
    assert.equal(l.evidence, 'customs');
    assert.equal(l.unitCost, 1000.5);
    assert.equal(l.qty, 1);
    assert.equal(l.currency, 'EUR');
    assert.equal(l.category, 'electronics');
    assert.equal(l.type, 'tier1');
    assert.notEqual(makeLine().id, makeLine().id);
  });
});

/* ---------------------------------------------------------------------- */

describe('sample bill of materials (site/assets/sample/ukazka-kusovnik.csv)', () => {
  const path = fileURLToPath(new URL('../../site/assets/sample/ukazka-kusovnik.csv', import.meta.url));
  const text = readFileSync(path, 'utf8');
  const rows = parseTable(text);
  const mapping = detectColumns(rows[0]);
  const { lines, errors } = rowsToLines(rows, mapping, { currency: 'CZK' });
  const fx = { CZK: 1, EUR: 25, USD: 23, GBP: 29.5, CHF: 26.5, PLN: 5.9 };
  const r = analyze(lines, { pack: 'SAFE', fx, currency: 'CZK', today: TODAY });

  test('parses cleanly with every column detected', () => {
    assert.equal(errors.length, 0, JSON.stringify(errors));
    for (const f of FIELDS) if (f.id !== 'totalCost' && f.id !== 'id') assert.notEqual(mapping[f.id], null, f.id);
    assert.ok(r.totals.counts.tier1 >= 55 && r.totals.counts.tier1 <= 65);
    assert.ok(r.totals.counts.inhouse >= 2);
    assert.ok(r.totals.counts.raw >= 1);
    for (const c of CATEGORIES) assert.ok(r.categories.find((x) => x.id === c.id).lines > 0, c.id);
    assert.ok(!r.categories.some((x) => x.id === 'none'));
  });

  test('SAFE: worst case fails, expected case passes, a small evidence set fixes the worst case', () => {
    assert.equal(r.verdict.worst.pass, false);
    assert.equal(r.verdict.expected.pass, true);
    assert.equal(r.status, 'depends');
    assert.equal(r.methods.a.scenarios.expected.pass, false, 'method a fails in the expected case');
    assert.equal(r.methods.b.scenarios.expected.pass, true, 'method b passes in the expected case');
    assert.equal(r.minimumSet.feasible, true);
    assert.ok(r.minimumSet.count >= 3 && r.minimumSet.count <= 6, `count ${r.minimumSet.count}`);
    assert.equal(r.substitution, null);
    // Documenting the minimum set makes the worst case pass.
    const ids = new Set(r.minimumSet.lineIds);
    const fixed = lines.map((l) => (ids.has(l.id) ? { ...l, origin: l.origin || l.expectedOrigin || l.supplierCountry, evidence: 'declaration', validUntil: '2027-12-31' } : l));
    const r2 = analyze(fixed, { pack: 'SAFE', fx, currency: 'CZK', today: TODAY });
    assert.equal(r2.verdict.worst.pass, true);
    assert.equal(r2.status, 'pass');
  });

  test('evidence: one expired declaration, one expiring within 90 days, China flagged', () => {
    assert.equal(r.evidence.expired.length, 1);
    assert.equal(r.evidence.expiringSoon.length, 1);
    assert.ok(r.evidence.documented.count > 0 && r.evidence.stated.count > 0 && r.evidence.unknown.count > 0);
    assert.ok(r.warnings.some((w) => w.code === 'check-individually'));
    assert.ok(!r.warnings.some((w) => w.severity === 'error'));
    assert.ok(r.supplierRequests[0].priority);
  });
});
