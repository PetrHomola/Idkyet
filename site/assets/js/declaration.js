// CIRUS Origin: supplier declaration of non-preferential origin (printable HTML) and request e-mail.
// Pure ES module, no DOM access, no network. Languages: cs, sk, en.

const T = {
  cs: {
    locale: 'cs-CZ',
    docTitle: 'Prohlášení dodavatele o nepreferenčním původu zboží',
    template: 'Vzor',
    print: 'Vytisknout',
    printHint: 'Vyplňte zemi původu a základ jejího určení, podepište a vraťte odběrateli.',
    supplier: 'Dodavatel',
    supplierCountry: 'Sídlo (země)',
    address: 'Adresa',
    ids: 'IČO / DIČ',
    buyer: 'Odběratel',
    requestDate: 'Datum žádosti',
    intro: (s) => `Dodavatel ${s} prohlašuje, že níže uvedené zboží má nepreferenční původ v uvedené zemi ve smyslu čl. 60 nařízení Evropského parlamentu a Rady (EU) č. 952/2013, kterým se stanoví celní kodex Unie. U zboží, na jehož výrobě se podílela více než jedna země, je původ určen podle místa poslední podstatné, hospodářsky odůvodněné přeměny.`,
    supplierFallback: 'uvedený výše',
    no: 'Č.',
    partNo: 'Číslo dílu',
    description: 'Popis',
    origin: 'Země původu',
    originNote: '(vyplní dodavatel)',
    basis: 'Základ určení původu',
    basisOptions: ['vyrobeno u nás', 'poslední podstatná přeměna u nás', 'převzato od výrobce – uveďte výrobce:'],
    validity: 'Prohlášení platí do:',
    validityNote: '(nejdéle 24 měsíců ode dne podpisu)',
    commitment: 'Dodavatel se zavazuje bez zbytečného odkladu písemně oznámit odběrateli každou změnu, která má vliv na původ uvedeného zboží.',
    place: 'Místo',
    date: 'Datum',
    signatory: 'Jméno a funkce',
    signature: 'Podpis',
    stamp: 'Razítko',
    footnote: 'Vzor. Nejde o preferenční prohlášení podle prováděcího nařízení (EU) 2015/2447.',
    page: 'Strana',
    emptyLine: '—',
  },
  sk: {
    locale: 'sk-SK',
    docTitle: 'Vyhlásenie dodávateľa o nepreferenčnom pôvode tovaru',
    template: 'Vzor',
    print: 'Vytlačiť',
    printHint: 'Vyplňte krajinu pôvodu a základ jej určenia, podpíšte a vráťte odberateľovi.',
    supplier: 'Dodávateľ',
    supplierCountry: 'Sídlo (krajina)',
    address: 'Adresa',
    ids: 'IČO / DIČ',
    buyer: 'Odberateľ',
    requestDate: 'Dátum žiadosti',
    intro: (s) => `Dodávateľ ${s} vyhlasuje, že nižšie uvedený tovar má nepreferenčný pôvod v uvedenej krajine v zmysle článku 60 nariadenia Európskeho parlamentu a Rady (EÚ) č. 952/2013, ktorým sa ustanovuje Colný kódex Únie. Pri tovare, na ktorého výrobe sa podieľala viac ako jedna krajina, je pôvod určený podľa miesta posledného podstatného, ekonomicky odôvodneného spracovania alebo opracovania.`,
    supplierFallback: 'uvedený vyššie',
    no: 'Č.',
    partNo: 'Číslo dielu',
    description: 'Popis',
    origin: 'Krajina pôvodu',
    originNote: '(vyplní dodávateľ)',
    basis: 'Základ určenia pôvodu',
    basisOptions: ['vyrobené u nás', 'posledné podstatné spracovanie u nás', 'prevzaté od výrobcu – uveďte výrobcu:'],
    validity: 'Vyhlásenie platí do:',
    validityNote: '(najviac 24 mesiacov odo dňa podpisu)',
    commitment: 'Dodávateľ sa zaväzuje bez zbytočného odkladu písomne oznámiť odberateľovi každú zmenu, ktorá má vplyv na pôvod uvedeného tovaru.',
    place: 'Miesto',
    date: 'Dátum',
    signatory: 'Meno a funkcia',
    signature: 'Podpis',
    stamp: 'Pečiatka',
    footnote: 'Vzor. Nejde o preferenčné vyhlásenie podľa vykonávacieho nariadenia (EÚ) 2015/2447.',
    page: 'Strana',
    emptyLine: '—',
  },
  en: {
    locale: 'en-GB',
    docTitle: 'Supplier’s declaration of non-preferential origin of goods',
    template: 'Template',
    print: 'Print',
    printHint: 'Enter the country of origin and the basis for it, sign and return to the buyer.',
    supplier: 'Supplier',
    supplierCountry: 'Registered office (country)',
    address: 'Address',
    ids: 'Company ID / VAT number',
    buyer: 'Buyer',
    requestDate: 'Date of request',
    intro: (s) => `The supplier ${s} declares that the goods listed below have their non-preferential origin in the country stated, within the meaning of Article 60 of Regulation (EU) No 952/2013 of the European Parliament and of the Council laying down the Union Customs Code. Where the production of the goods involved more than one country, origin is determined by the place of the last substantial, economically justified processing or working.`,
    supplierFallback: 'named above',
    no: 'No.',
    partNo: 'Part number',
    description: 'Description',
    origin: 'Country of origin',
    originNote: '(to be completed by the supplier)',
    basis: 'Basis for origin',
    basisOptions: ['manufactured by us', 'last substantial transformation by us', 'taken over from the manufacturer – name the manufacturer:'],
    validity: 'This declaration is valid until:',
    validityNote: '(no longer than 24 months from the date of signature)',
    commitment: 'The supplier undertakes to inform the buyer in writing without undue delay of any change affecting the origin of the goods listed.',
    place: 'Place',
    date: 'Date',
    signatory: 'Name and position',
    signature: 'Signature',
    stamp: 'Company stamp',
    footnote: 'Template. This is not a preferential origin declaration under Implementing Regulation (EU) 2015/2447.',
    page: 'Page',
    emptyLine: '—',
  },
};

const MAIL = {
  cs: {
    subject: (buyer) => `Žádost o prohlášení o nepreferenčním původu dodávaných dílů${buyer ? ` – ${buyer}` : ''}`,
    greeting: 'Dobrý den,',
    p1: 'pro výpočet podílu komponent s původem mimo EU (pravidlo 35 % podle nařízení SAFE a EDIP) potřebujeme doložit nepreferenční původ dílů, které od vás nakupujeme.',
    ask: (deadline) => `Prosíme o vyplnění a podpis přiloženého prohlášení dodavatele (země původu a základ jejího určení)${deadline ? ` do ${deadline}` : ''}.`,
    linesIntro: 'Jde o tyto díly:',
    more: (n) => (n === 1 ? 'a 1 další položka' : n < 5 ? `a další ${n} položky` : `a dalších ${n} položek`) + ', viz přiložené prohlášení',
    p2: 'Původ určujte podle čl. 60 celního kodexu Unie (nařízení (EU) č. 952/2013): u zboží vyrobeného ve více zemích rozhoduje země poslední podstatné, hospodářsky odůvodněné přeměny. Nejde o preferenční původ. Pokud díly jen přeprodáváte, uveďte prosím výrobce, případně přiložte jeho prohlášení.',
    p3: 'Prohlášení může platit nejdéle 24 měsíců. Pokud se původ některého dílu změní, dejte nám prosím vědět.',
    thanks: 'Děkujeme za spolupráci.',
    regards: 'S pozdravem',
  },
  sk: {
    subject: (buyer) => `Žiadosť o vyhlásenie o nepreferenčnom pôvode dodávaných dielov${buyer ? ` – ${buyer}` : ''}`,
    greeting: 'Dobrý deň,',
    p1: 'na výpočet podielu komponentov s pôvodom mimo EÚ (pravidlo 35 % podľa nariadení SAFE a EDIP) potrebujeme doložiť nepreferenčný pôvod dielov, ktoré od vás nakupujeme.',
    ask: (deadline) => `Prosíme o vyplnenie a podpis priloženého vyhlásenia dodávateľa (krajina pôvodu a základ jej určenia)${deadline ? ` do ${deadline}` : ''}.`,
    linesIntro: 'Ide o tieto diely:',
    more: (n) => (n === 1 ? 'a 1 ďalšia položka' : n < 5 ? `a ďalšie ${n} položky` : `a ďalších ${n} položiek`) + ', pozri priložené vyhlásenie',
    p2: 'Pôvod určujte podľa článku 60 Colného kódexu Únie (nariadenie (EÚ) č. 952/2013): pri tovare vyrobenom vo viacerých krajinách rozhoduje krajina posledného podstatného, ekonomicky odôvodneného spracovania. Nejde o preferenčný pôvod. Ak diely len predávate ďalej, uveďte, prosím, výrobcu, prípadne priložte jeho vyhlásenie.',
    p3: 'Vyhlásenie môže platiť najviac 24 mesiacov. Ak sa pôvod niektorého dielu zmení, dajte nám, prosím, vedieť.',
    thanks: 'Ďakujeme za spoluprácu.',
    regards: 'S pozdravom',
  },
  en: {
    subject: (buyer) => `Request for a declaration of non-preferential origin of supplied parts${buyer ? ` – ${buyer}` : ''}`,
    greeting: 'Dear Sir or Madam,',
    p1: 'to calculate the share of components originating outside the EU (the 35 % rule under the SAFE and EDIP regulations), we need to document the non-preferential origin of the parts we buy from you.',
    ask: (deadline) => `Please complete and sign the attached supplier’s declaration (country of origin and the basis for it)${deadline ? ` by ${deadline}` : ''}.`,
    linesIntro: 'The parts concerned are:',
    more: (n) => `and ${n} further item${n === 1 ? '' : 's'}, see the attached declaration`,
    p2: 'Please determine origin under Article 60 of the Union Customs Code (Regulation (EU) No 952/2013): for goods produced in more than one country, origin is the country of the last substantial, economically justified processing. This is not preferential origin. If you resell the parts, please name the manufacturer or attach the manufacturer’s declaration.',
    p3: 'The declaration may be valid for no longer than 24 months. If the origin of any part changes, please let us know.',
    thanks: 'Thank you for your cooperation.',
    regards: 'Kind regards,',
  },
};

const MAX_MAIL_LINES = 25;

function pickLang(lang) {
  return lang === 'sk' || lang === 'en' ? lang : 'cs';
}

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function clean(v) {
  return String(v ?? '').trim();
}

function formatDate(value, locale) {
  const s = clean(value);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return s;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  try {
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(d);
  } catch {
    return s;
  }
}

function regionName(code, locale) {
  const c = clean(code).toUpperCase();
  if (!c) return '';
  try {
    const dn = new Intl.DisplayNames([locale], { type: 'region' });
    const name = dn.of(c);
    return name && name !== c ? `${name} (${c})` : c;
  } catch {
    return c;
  }
}

function lineLabel(line) {
  const part = clean(line?.partNo);
  const desc = clean(line?.description);
  if (part && desc) return `${part} – ${desc}`;
  return part || desc || clean(line?.id);
}

/**
 * Full printable HTML document (A4) of a supplier's declaration of non-preferential origin.
 * @param {{lang?:'cs'|'sk'|'en', supplier?:string, supplierCountry?:string|null, buyer?:string,
 *          lines?:Array<{partNo?:string, description?:string}>, place?:string, date?:string}} opts
 * @returns {string}
 */
export function declarationHtml({ lang = 'cs', supplier = '', supplierCountry = null, buyer = '', lines = [], place = '', date = '' } = {}) {
  const L = pickLang(lang);
  const t = T[L];
  const sup = clean(supplier);
  const rows = (Array.isArray(lines) ? lines : []).map((line, i) => {
    const opts = t.basisOptions
      .map((o, j) => `<li><span class="box" aria-hidden="true"></span>${esc(o)}${j === 2 ? '<span class="fill"></span>' : ''}</li>`)
      .join('');
    return `<tr>
      <td class="n">${i + 1}</td>
      <td class="mono">${esc(clean(line?.partNo)) || t.emptyLine}</td>
      <td>${esc(clean(line?.description)) || t.emptyLine}</td>
      <td class="write"></td>
      <td><ul class="basis">${opts}</ul></td>
    </tr>`;
  });
  // Always leave a few blank rows so the supplier can add items.
  const blanks = Math.max(2, 6 - rows.length);
  for (let i = 0; i < blanks; i++) {
    rows.push(`<tr class="blank"><td class="n">${rows.length + 1}</td><td></td><td></td><td class="write"></td><td></td></tr>`);
  }
  const introSupplier = sup ? `<strong>${esc(sup)}</strong>` : esc(t.supplierFallback);
  const requestDate = clean(date) ? formatDate(date, t.locale) : '';
  const country = regionName(supplierCountry, t.locale);

  return `<!doctype html>
<html lang="${L}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="data:,">
<title>${esc(t.docTitle)}${sup ? ` – ${esc(sup)}` : ''}</title>
<style>
  @page { size: A4; margin: 16mm 14mm 18mm; }
  :root { color-scheme: light; --ink: #142029; --muted: #56636d; --line: #9aa5ac; --soft: #eef0ea; --mark: #c97a00; }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body { margin: 0; background: #e7e9e3; color: var(--ink); font: 10.5pt/1.45 "Public Sans", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  .sheet { max-width: 210mm; margin: 16px auto; background: #fff; padding: 16mm 14mm; box-shadow: 0 8px 28px -16px rgba(10,20,30,.4); }
  .toolbar { max-width: 210mm; margin: 16px auto 0; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; padding: 0 16px; }
  .toolbar button { font: inherit; font-weight: 600; padding: 8px 16px; border: 1px solid #1f4e8c; background: #1f4e8c; color: #fff; border-radius: 6px; cursor: pointer; }
  .toolbar button:focus-visible { outline: 2px solid #1f4e8c; outline-offset: 2px; }
  .toolbar p { margin: 0; color: var(--muted); font-size: 9.5pt; }
  .head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; border-bottom: 2px solid var(--ink); padding-bottom: 8px; margin-bottom: 12px; }
  h1 { font: 700 15pt/1.2 "Barlow Semi Condensed", "Arial Narrow", Arial, sans-serif; margin: 0; letter-spacing: .01em; }
  .tag { flex: none; border: 2px solid var(--mark); color: var(--mark); font: 700 9pt/1 "Barlow Semi Condensed", "Arial Narrow", Arial, sans-serif; text-transform: uppercase; letter-spacing: .12em; padding: 5px 8px; transform: rotate(-3deg); }
  .meta { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--line); margin-bottom: 12px; }
  .meta div { padding: 5px 8px; border-bottom: 1px solid var(--line); min-height: 34px; }
  .meta div:nth-child(odd) { border-right: 1px solid var(--line); }
  .meta div:nth-last-child(-n+2) { border-bottom: 0; }
  .meta span { display: block; font-size: 7.5pt; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
  .meta b { font-weight: 600; }
  p.intro { margin: 0 0 10px; text-align: justify; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  thead { display: table-header-group; }
  th, td { border: 1px solid var(--line); padding: 4px 6px; vertical-align: top; text-align: left; }
  th { background: var(--soft); font-size: 8pt; font-weight: 600; }
  th small { display: block; font-weight: 400; color: var(--muted); }
  td.n { width: 7mm; text-align: right; color: var(--muted); }
  td.write { width: 30mm; }
  tr { page-break-inside: avoid; break-inside: avoid; }
  tr.blank td { height: 9mm; }
  .mono { font-family: "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace; font-size: 9pt; }
  ul.basis { list-style: none; margin: 0; padding: 0; font-size: 8.5pt; }
  ul.basis li { display: flex; align-items: baseline; gap: 5px; flex-wrap: wrap; }
  .box { display: inline-block; width: 9px; height: 9px; border: 1px solid var(--ink); flex: none; transform: translateY(1px); }
  .fill { display: block; flex-basis: 100%; height: 12px; border-bottom: 1px dotted var(--ink); }
  .validity { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; margin: 0 0 6px; }
  .validity .line { flex: 0 0 45mm; border-bottom: 1px solid var(--ink); height: 14px; }
  .validity small { color: var(--muted); }
  p.commit { margin: 0 0 14px; }
  .sign { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid var(--line); break-inside: avoid; page-break-inside: avoid; }
  .sign div { padding: 5px 8px; min-height: 18mm; border-bottom: 1px solid var(--line); }
  .sign div:nth-child(odd) { border-right: 1px solid var(--line); }
  .sign div:nth-last-child(-n+2) { border-bottom: 0; min-height: 26mm; }
  .sign span { display: block; font-size: 7.5pt; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
  .foot { margin-top: 12px; padding-top: 6px; border-top: 1px solid var(--line); font-size: 8pt; color: var(--muted); }
  @media (max-width: 640px) {
    .sheet { padding: 16px; margin: 0; }
    .meta, .sign { grid-template-columns: 1fr; }
    .meta div:nth-child(odd), .sign div:nth-child(odd) { border-right: 0; }
    .meta div:nth-last-child(2), .sign div:nth-last-child(2) { border-bottom: 1px solid var(--line); }
    .scroll { overflow-x: auto; }
  }
  @media print {
    body { background: #fff; }
    .toolbar { display: none; }
    .sheet { margin: 0; padding: 0; box-shadow: none; max-width: none; }
  }
</style>
</head>
<body>
<div class="toolbar"><button type="button" onclick="window.print()">${esc(t.print)}</button><p>${esc(t.printHint)}</p></div>
<article class="sheet">
  <header class="head">
    <h1>${esc(t.docTitle)}</h1>
    <span class="tag">${esc(t.template)}</span>
  </header>
  <section class="meta">
    <div><span>${esc(t.supplier)}</span><b>${esc(sup)}</b></div>
    <div><span>${esc(t.supplierCountry)}</span><b>${esc(country)}</b></div>
    <div><span>${esc(t.address)}</span></div>
    <div><span>${esc(t.ids)}</span></div>
    <div><span>${esc(t.buyer)}</span><b>${esc(clean(buyer))}</b></div>
    <div><span>${esc(t.requestDate)}</span><b>${esc(requestDate)}</b></div>
  </section>
  <p class="intro">${t.intro(introSupplier)}</p>
  <div class="scroll">
  <table>
    <thead><tr>
      <th>${esc(t.no)}</th>
      <th>${esc(t.partNo)}</th>
      <th>${esc(t.description)}</th>
      <th>${esc(t.origin)}<small>${esc(t.originNote)}</small></th>
      <th>${esc(t.basis)}</th>
    </tr></thead>
    <tbody>
      ${rows.join('\n')}
    </tbody>
  </table>
  </div>
  <p class="validity"><strong>${esc(t.validity)}</strong><span class="line"></span><small>${esc(t.validityNote)}</small></p>
  <p class="commit">${esc(t.commitment)}</p>
  <section class="sign">
    <div><span>${esc(t.place)}</span>${esc(clean(place))}</div>
    <div><span>${esc(t.date)}</span></div>
    <div><span>${esc(t.signatory)}</span></div>
    <div><span>${esc(t.signature)}</span></div>
    <div><span>${esc(t.stamp)}</span></div>
    <div></div>
  </section>
  <p class="foot">${esc(t.footnote)}</p>
</article>
</body>
</html>`;
}

/**
 * Plain-text request e-mail asking a supplier for the declaration.
 * @param {{lang?:'cs'|'sk'|'en', supplier?:string, buyer?:string, lines?:Array, deadline?:string}} opts
 * @returns {{subject:string, body:string}}
 */
export function requestEmail({ lang = 'cs', supplier = '', buyer = '', lines = [], deadline = '' } = {}) {
  const L = pickLang(lang);
  const m = MAIL[L];
  const list = Array.isArray(lines) ? lines : [];
  const shown = list.slice(0, MAX_MAIL_LINES).map((l) => `- ${lineLabel(l)}`).filter((s) => s.length > 2);
  const rest = list.length - Math.min(list.length, MAX_MAIL_LINES);
  if (rest > 0) shown.push(`- ${m.more(rest)}`);
  const due = clean(deadline) ? formatDate(deadline, T[L].locale) : '';
  const b = clean(buyer);
  const parts = [
    m.greeting,
    '',
    m.p1,
    m.ask(due),
  ];
  if (shown.length) parts.push('', m.linesIntro, ...shown);
  parts.push('', m.p2, '', m.p3, '', m.thanks, '', m.regards);
  if (b) parts.push(b);
  return { subject: m.subject(b), body: parts.join('\n') };
}
