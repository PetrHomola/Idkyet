# CIRUS Origin: specifikace produktu a webu

CIRUS Origin (pracovní název) pomáhá výrobcům a dodavatelům obranného průmyslu spočítat a doložit, že díly s původem mimo EU tvoří nejvýš 35 % nákladů na díly výrobku (pravidlo SAFE / EDIP). Tahle specifikace je společný zdroj pravdy pro všechny části: kalkulačku, prezentační web, šablony a obchodní podklady.

Jazyk: veškerý text pro zákazníky česky (s diakritikou), anglická verze webu a kalkulačky zvlášť. Tón: věcný, sebevědomý, bez přehánění. Žádné vymyšlené reference, loga zákazníků, recenze ani čísla, která nejsou ve „Faktech“ níže.

## 1. Struktura repozitáře

```
site/                       zdroj statického webu (bez backendu)
  index.html                landing page CZ
  metodika.html             metodika výpočtu CZ
  ochrana-dat.html          jak zacházíme s daty CZ
  nabidka.html              tisknutelná nabídka a ceník CZ (1–2 strany A4)
  kalkulacka/index.html     kalkulačka (CZ/EN přepínač)
  en/index.html             landing EN
  en/methodology.html       metodika EN
  en/data-protection.html   ochrana dat EN
  en/offer.html             tisknutelná nabídka EN
  assets/css/tokens.css     designové tokeny (HOTOVO, neměnit názvy tokenů)
  assets/css/site.css       styly webu (landing, metodika, nabídka)
  assets/css/app.css        styly kalkulačky
  assets/js/calc-core.js    čistá výpočetní logika (ES modul, bez DOM)
  assets/js/countries.js    seznam zemí, převod názvů na ISO2 (ES modul)
  assets/js/declaration.js  generátor prohlášení dodavatele (ES modul, vrací HTML řetězec)
  assets/js/i18n.js         texty kalkulačky CZ/EN (ES modul)
  assets/js/calculator.js   UI kalkulačky (ES modul)
  assets/sample/ukazka-kusovnik.csv   smyšlený ukázkový kusovník (~60 řádků)
  sablony/                  ke stažení: vstupní šablona CSV/XLSX, prohlášení DOCX (CZ/SK/EN)
config.json                 firemní údaje a nastavení buildu (HOTOVO)
tools/
  build.mjs                 build: site/ → dist/ (nahradí {{PLACEHOLDERY}} z config.json, vytvoří offline kalkulačku)
  make-templates.py         vygeneruje šablony XLSX a DOCX do site/sablony/
  test/*.test.mjs           testy (node --test)
  e2e.mjs                   test v prohlížeči (Playwright, Chromium v /opt/pw-browsers)
sales/                      interní obchodní podklady (markdown)
.github/workflows/pages.yml nasazení dist/ na GitHub Pages
package.json                skripty: build, test, e2e, serve
README.md                   jak upravit, sestavit, otestovat a nasadit
```

Žádný framework, žádný bundler. Čisté HTML, CSS a ES moduly. Jediná externí knihovna: SheetJS (xlsx 0.18.5) z `https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`, načítaná líně jen při importu/exportu XLSX. Fonty Geist a Geist Mono jsou uložené na webu (`site/assets/fonts/`, licence OFL), žádné požadavky na Google. Offline verze kalkulačky (`dist/cirus-origin-kalkulacka-offline.html`) je jeden soubor, vše vložené, s vloženými fonty a se SheetJS vloženým přímo.

## 2. Placeholdery (z config.json)

V HTML souborech v `site/` používej tyto tokeny, build je nahradí:
`{{BRAND}}`, `{{COMPANY}}`, `{{ICO}}`, `{{ADDRESS}}`, `{{EMAIL}}`, `{{PHONE}}`, `{{WEB}}`, `{{LINKEDIN}}`, `{{YEAR}}`, `{{UPDATED}}` (datum poslední aktualizace metodiky).
Ceny jsou také v config.json (`prices.*`), v HTML jako `{{PRICE_QUICK}}`, `{{PRICE_QUICK_EDIP}}`, `{{PRICE_PACK}}`, `{{PRICE_PACK_EXTRA}}`, `{{PRICE_MONITOR}}`, `{{PRICE_SUPPLIER}}`, `{{PRICE_DAY}}`. Nikdy nevpisuj ceny natvrdo. Stránky v `site/en/` dostanou při buildu ceny z `prices_en` (EUR), ostatní z `prices` (Kč). Kalkulačka ceny nezobrazuje, jen odkazuje na nabídku.

## 3. Designový systém

`site/assets/css/tokens.css` je hotový: barvy (světlý i tmavý režim), fonty, typografická škála, mezery, poloměry. Všechny styly berou barvy jen z tokenů. Každá stránka linkuje `tokens.css` a pak `site.css` nebo `app.css`.

Charakter: celní a úřední dokument, který je moderní a přehledný. Motiv „razítka“ a hraniční čáry 35 % (barva `--mark`). Čísla a kódy zemí v mono fontu. Žádné emoji, žádné gradientové hero, žádné stockové fotky. Responzivní od 360 px, boční okraj `max(16px, env(safe-area-inset-*))`, nic nepřetéká do strany.

## 4. Fakta, která smí web a podklady používat

Používej jen tato tvrzení (s odkazy, kde dávají smysl). Nic dalšího nevymýšlej.

- **SAFE**, nařízení Rady (EU) 2025/1106, čl. 16 odst. 10: „The cost of components originating outside the Union, EEA EFTA States and Ukraine shall not be higher than 35 % of the estimated cost of the components of the end product.“ Navíc: žádný díl nesmí pocházet ze třetí země, která je v rozporu s bezpečnostními a obrannými zájmy EU. https://eur-lex.europa.eu/eli/reg/2025/1106/oj/eng
- Recitál 19 SAFE: Komise „could establish guidance“ k výpočtu. **Veřejná metodika pro SAFE zatím není** (k 18. 10. 2026).
- **EDIP**, nařízení (EU) 2025/2643, čl. 10 odst. 3 a 4: totéž pravidlo, „outside the Union and associated countries“. Recitál 27: suroviny nejsou komponenty. https://eur-lex.europa.eu/eli/reg/2025/2643/oj/eng
- **EDIP – nástroj pro Ukrajinu (USI)**, čl. 27: „outside the Union and Ukraine“.
- **Půjčka pro Ukrajinu**, nařízení (EU) 2026/467, čl. 13 odst. 4 písm. g): stejně jako SAFE (EU, EHP-ESVO, Ukrajina).
- **Dohoda EU–Kanada o účasti v SAFE**, čl. 5 odst. 8 (platí od 1. 8. 2026): kanadské komponenty smí přesáhnout 35 %; komponenty z EU, EHP-ESVO a Ukrajiny musí tvořit aspoň 20 %; komponenty z ostatních třetích zemí nejvýš 35 % a ne víc než podíl EU.
- **Metodika EDIP** (výzva EDF-EDIP-P-2026-LS-IRA v1.2 z 10. 6. 2026, str. 9–10, a výukové slajdy Komise „Origin of Components“, 5/2026):
  - Komponenta = látky, materiály (bez surovin), díly, sestavy nebo software zabudované do výrobku.
  - Původ dovezeného dílu: podle celních dokladů nebo kupních smluv. Původ dílu koupeného v EU (i přes obchodníka nebo uvnitř skupiny): země poslední podstatné, hospodářsky odůvodněné přeměny podle celního kodexu Unie (nepreferenční původ, čl. 60).
  - Počítají se jen díly nakoupené přímo výrobcem (tier-1), bez ohledu na jejich důležitost. Cena podle faktur, smluv nebo celních dokladů, bez dopravy, cla a daní.
  - Metoda (a): náklady tier-1 dílů mimo EU / náklady všech tier-1 dílů ≤ 35 %.
  - Metoda (b): náklady tier-1 dílů mimo EU / „náklady na komponenty výrobku“ (tier-1 díly + celkové výrobní náklady podsestav vyrobených ve vlastní režii, bez konečné montáže) ≤ 35 %.
  - Stačí splnit jednu z metod. „The condition must be complied with during the entire duration of the action.“
  - Příklad ze slajdů Komise: 92 / 214 = 43 % (metoda a nevyhoví), 92 / 275 = 34 % (metoda b vyhoví).
  - Komise v šabloně „Procurement strategy“ chce rozpad podílu po pěti kategoriích komponent: structural and mechanical, power and energy, instrumentation and monitoring, safety and protection, electronics and comms; a popis postupu: „collection and verification of supplier declarations and customs documents, inclusion of origin clauses in contracts“.
  - Nejasnost: celkové výrobní náklady (TMC) zahrnují dopravu na vstupu a nevratné clo, náklady tier-1 je vylučují. Postup je třeba zdokumentovat.
- **Evropský účetní dvůr**, Review 01/2026, odst. 71: „Limited information on underlying costs can also create practical challenges for verifying and confirming compliance with certain EU preference clauses.“ https://www.eca.europa.eu/ECAPublications/RV-2026-01/RV-2026-01_EN.pdf
- **Česko**: SAFE až 2,06 mld. EUR. Leopard 2A8 802 mil. EUR, Tatra T-815 319 mil. EUR, dálnice D11 939 mil. EUR (MO, 15. 6. 2026). První platba 309 mil. EUR přišla 6. 10. 2026. O platby se žádá dvakrát ročně, ČR v dubnu a říjnu.
- **Slovensko**: SAFE asi 2,3 mld. EUR (mimo jiné Tatra a CV90). **Polsko**: 43,7 mld. EUR.
- **Termíny**: výzvy EDIP s uzávěrkou 16. 2. 2027 (mimo jiné klíčové elektronické komponenty 122,25 mil. EUR, platformy 152,75 mil. EUR, bezpilotní systémy pro Ukrajinu 80 mil. EUR). Čerpání SAFE do 31. 12. 2030. Projekty EDIP nejpozději do 31. 12. 2033.
- **Sankce**: u SAFE pozastavení výplaty, u EDIP krácení nebo ukončení grantu, za nepravdivé údaje vyloučení z peněz EU.
- CIRUS Origin **nedává právní stanoviska**. Výstup je výpočet z dokladů a prohlášení dodavatelů. Sporná určení původu konzultujeme s celním specialistou.

## 5. Nabídka a ceny (texty pro web a podklady)

1. **Kalkulačka zdarma** – běží v prohlížeči, data nikam neodcházejí, existuje i offline verze v jednom souboru.
2. **Rychlá kontrola** – `{{PRICE_QUICK}}` (pro žadatele EDIP s návrhem přílohy o původu do „Procurement strategy“ `{{PRICE_QUICK_EDIP}}`). Do 10 pracovních dnů, do 500 řádků. Výsledek podle obou metod, rozpětí nejlepší/očekávaný/nejhorší případ, rezerva do 35 %, řádky, které rozhodují, minimální sada dokladů, rozpad po 5 kategoriích, seznam dodavatelů k oslovení, popis postupu. Cena se odečte z Sady dokladů, pokud ji objednáte do 60 dnů.
3. **Sada dokladů** – od `{{PRICE_PACK}}` (do 500 řádků a 80 dodavatelů, `{{PRICE_PACK_EXTRA}}` za každých dalších 250 řádků). 4–6 týdnů. Kampaň za prohlášeními dodavatelů (CZ/SK/EN, připomínky), původ dovezených dílů z celních dokladů, konečný výpočet, scénáře „co když“, přehled dokladů připravený na audit.
4. **Hlídání** – `{{PRICE_MONITOR}}` měsíčně za výrobek. Obnova prohlášení, přepočet při změnách, upozornění na tenčící se rezervu, podklady k žádostem o platbu SAFE (duben a říjen) nebo k průběžným zprávám EDIP.
5. **Pro dodavatele** – `{{PRICE_SUPPLIER}}`. Pro firmy, které dostaly dotazník o původu od hlavního dodavatele: určíme nepreferenční původ dílů, připravíme prohlášení, nastavíme obnovu.
6. **Posila u vás** – `{{PRICE_DAY}}` za den. Práce u zákazníka pod NDA, na jeho zařízeních.

Ceny jsou bez DPH. Prvním dvěma zákazníkům Rychlá kontrola za poloviční cenu výměnou za referenci (jen v osobním rozhovoru, na webu ne).

## 6. Jak zacházíme s daty (texty pro web)

- Kalkulačka běží jen ve vašem prohlížeči, data se nikam neodesílají. Offline verze je jeden soubor a funguje bez internetu.
- U služeb pracujeme jen s obchodními údaji: označení dílu (může být vlastní, bez skutečných čísel), dodavatel, cena, země původu, doklad o původu. Nebereme výkresy, technickou dokumentaci, utajované informace ani data podléhající ITAR.
- Předání: zašifrovaný archiv (heslo telefonem), složka v úložišti zákazníka, nebo práce u zákazníka (Posila u vás).
- Uložení: jen na šifrovaných discích našich pracovních počítačů. Data nenahráváme do cloudových úložišť ani do AI služeb. Přístup mají jen zakladatelé ({{FOUNDER_1}}, {{FOUNDER_2}}).
- Do 30 dnů od předání výsledku data smažeme (na žádost dříve) a smazání potvrdíme e-mailem.
- Podepíšeme NDA zákazníka.

## 7. Datový model kalkulačky

Řádek (`Line`):

| pole | typ | význam |
|---|---|---|
| `id` | string | interní ID řádku (generuje se, pokud chybí) |
| `partNo` | string | číslo dílu (volitelné, může být pseudonym) |
| `description` | string | popis (volitelné) |
| `supplier` | string | dodavatel |
| `supplierCountry` | ISO2 \| null | sídlo dodavatele (použije se jako odhad původu, když původ chybí) |
| `category` | `structural` \| `power` \| `instrumentation` \| `safety` \| `electronics` \| null | kategorie podle šablony Komise |
| `qty` | number | množství na jeden výrobek (výchozí 1) |
| `unitCost` | number | jednotková cena bez dopravy, cla a DPH |
| `currency` | string | ISO měna (výchozí měna projektu) |
| `origin` | ISO2 \| null | země původu dílu (nepreferenční) |
| `evidence` | `customs` \| `declaration` \| `contract` \| `assumed` \| `none` | doklad o původu |
| `validUntil` | `YYYY-MM-DD` \| null | platnost prohlášení |
| `expectedOrigin` | ISO2 \| null | odhad původu, pokud není doložen |
| `type` | `tier1` \| `inhouse` \| `raw` | tier-1 díl / vlastní výroba podsestav (práce + režie, bez nakoupených dílů, které už jsou v seznamu) / surovina (vyloučeno) |
| `note` | string | poznámka |

Náklad řádku = `qty * unitCost * fx[currency]` (fx = kurz do měny projektu; měna projektu má kurz 1).

Stav doložení řádku:
- **doloženo**: `origin` vyplněno a `evidence` ∈ {customs, declaration, contract} a (není `validUntil` nebo `validUntil >= today`);
- **uvedeno, nedoloženo**: `origin` vyplněno, ale doklad chybí, je `assumed`/`none` nebo prohlášení vypršelo;
- **neznámé**: `origin` chybí.

### Pravidla (rule packs)

| id | název | „domácí“ země | práh | typ |
|---|---|---|---|---|
| `SAFE` | SAFE (nařízení 2025/1106) | EU27 + IS, LI, NO + UA | 0,35 | standard |
| `UASL` | Půjčka pro Ukrajinu (2026/467) | EU27 + IS, LI, NO + UA | 0,35 | standard |
| `EDIP` | EDIP – program (2025/2643, čl. 10) | EU27 + NO | 0,35 | standard |
| `EDIP_USI` | EDIP – nástroj pro Ukrajinu (čl. 27) | EU27 + UA | 0,35 | standard |
| `EU_CANADA` | SAFE – dohoda EU–Kanada (čl. 5 odst. 8) | domácí = EU27 + IS, LI, NO + UA; zvlášť CA | viz níže | canada |

EU27: AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, DE, GR, HU, IE, IT, LV, LT, LU, MT, NL, PL, PT, RO, SK, SI, ES, SE. Pozor: Švýcarsko (CH) a Spojené království (GB) **nejsou** domácí.
Kód Řecka: přijímej `GR` i `EL`, ukládej `GR`.

Typ `canada`: spočítej podíly domácí / CA / ostatní z nákladů tier-1 (metoda a) a z nákladů na komponenty (metoda b). Vyhovuje, když domácí ≥ 20 %, ostatní ≤ 35 % a ostatní ≤ domácí.

Rizikové země (varování, ne právní závěr), výchozí: RU, BY, IR, KP. Uživatel může seznam upravit. U CN zobraz informativní upozornění „ověřte individuálně“.

### Scénáře

- **nejhorší (auditní)**: domácí jsou jen řádky „doloženo“ s domácím původem; vše ostatní (uvedeno, nedoloženo i neznámé) se počítá jako mimo EU.
- **očekávaný**: použije se `origin`, pak `expectedOrigin`, pak `supplierCountry`; když nic, mimo EU.
- **nejlepší**: použije se `origin`, pokud je vyplněn; neznámé řádky se počítají jako domácí.

Pro každý scénář a každou metodu: čitatel (náklady mimo domácí země), jmenovatel, podíl, vyhovuje/nevyhovuje. Metoda (b) jen pokud existují řádky `inhouse`, jinak se zobrazí jako „nepoužito“.

### Další výstupy funkce `analyze`

- **Rezerva**: pro nejpříznivější metodu v nejhorším i očekávaném scénáři: kolik nákladů mimo EU lze ještě přidat (`threshold * jmenovatel - čitatel`), záporné = kolik chybí.
- **Minimální sada dokladů**: pro metodu, kde vyjde menší, vezmi nedoložené řádky (uvedeno i neznámé), jejichž očekávaný původ je domácí, seřaď podle nákladu sestupně a přidávej, dokud nejhorší scénář nevyhoví (`čitatel - suma ≤ threshold * jmenovatel`). Výsledek: seznam řádků, počet, pokrytý náklad, `feasible` (true/false). Pokud nestačí ani všechny takové řádky, `feasible = false` a spočítej **náhradu**: nejmenší počet řádků s původem mimo EU (podle očekávaného scénáře, seřazeno sestupně), které je třeba nahradit domácím zdrojem, aby vyhověl očekávaný scénář.
- **Kategorie**: pro každou z 5 kategorií (+ „bez kategorie“): náklady celkem, náklady mimo EU (očekávaný scénář), nedoložené náklady, podíl mimo EU v kategorii a příspěvek k celku. Tabulka odpovídá šabloně Komise.
- **Doklady**: počty a náklady podle stavu (doloženo / uvedeno, nedoloženo / neznámé), seznam prošlých prohlášení, prohlášení vyprší do 90 dnů.
- **Žádosti dodavatelům**: seskupení nedoložených řádků podle dodavatele: dodavatel, země, řádky, náklad, zda jsou v minimální sadě (priorita).
- **Varování**: rizikové země, chybějící cena nebo množství, neznámý kód země, neznámá měna bez kurzu, záporné hodnoty, chybějící kategorie.

## 8. API modulů (aby se daly psát souběžně)

`countries.js`:
```js
export const EU27 = [...];                       // ISO2
export function normalizeCountry(input): string|null   // ISO2 / ISO3 (běžné) / název CZ, SK, EN, DE, PL (bez ohledu na velikost písmen a diakritiku); 'EL'→'GR', 'UK'→'GB'
export function countryName(iso2, lang='cs'): string   // přes Intl.DisplayNames, fallback na kód
export const ALL_ISO2 = [...];                   // všechny ISO 3166-1 alpha-2
```

`calc-core.js`:
```js
export const CATEGORIES = [{id:'structural', cs:'Konstrukce a mechanika', en:'Structural and mechanical'}, {id:'power', cs:'Pohon a energie', en:'Power and energy'}, {id:'instrumentation', cs:'Přístroje a monitorování', en:'Instrumentation and monitoring'}, {id:'safety', cs:'Bezpečnost a ochrana', en:'Safety and protection'}, {id:'electronics', cs:'Elektronika a komunikace', en:'Electronics and comms'}];
export const RULE_PACKS = { SAFE: {...}, UASL: {...}, EDIP: {...}, EDIP_USI: {...}, EU_CANADA: {...} }; // {id, cs, en, home:Set, threshold, kind, source}
export const DEFAULT_RISK = ['RU','BY','IR','KP'];
export function parseTable(text): string[][]          // CSV/TSV/středník, uvozovky, BOM, prázdné řádky
export function detectColumns(headers): Record<field, number|null>   // synonyma CZ/EN (např. 'Země původu','Origin','COO','Původ')
export function rowsToLines(rows, mapping, {currency}): {lines, errors}   // čísla s desetinnou čárkou i mezerami ('1 234,50'), kategorie a doklady podle synonym CZ/EN
export function lineCost(line, fx): number
export function lineStatus(line, today): 'documented'|'stated'|'unknown'
export function analyze(lines, {pack:'SAFE', fx:{CZK:1}, currency:'CZK', today:'YYYY-MM-DD', risk:DEFAULT_RISK}): Result
export function toCsv(rows): string
```
`Result` obsahuje: `pack`, `currency`, `totals {tier1, inhouse, raw, lines}`, `methods {a:{denominator, scenarios:{worst, expected, best}: {nonHome, ratio, pass}}, b:{used, ...stejně}}`, pro `canada` navíc podíly `{home, canada, other}` ve scénářích, `verdict {worst, expected, best}: {pass, method}`, `headroom {worst, expected}: {method, amount}`, `minimumSet {method, lineIds, count, coveredCost, feasible}`, `substitution {lineIds, count, cost}|null`, `categories [...]`, `evidence {...}`, `supplierRequests [...]`, `warnings [{code, lineId, cs, en}]`.

`declaration.js`:
```js
export function declarationHtml({lang:'cs'|'sk'|'en', supplier, supplierCountry, buyer, lines, place, date}): string  // celý tisknutelný HTML dokument
export function requestEmail({lang, supplier, buyer, lines, deadline}): {subject, body}
```
Text prohlášení: „Prohlášení dodavatele o nepreferenčním původu zboží“. Dodavatel prohlašuje, že níže uvedené zboží má nepreferenční původ v uvedené zemi ve smyslu čl. 60 nařízení (EU) č. 952/2013 (celní kodex Unie), u zboží, na jehož výrobě se podílela více než jedna země, podle místa poslední podstatné, hospodářsky odůvodněné přeměny. Tabulka: číslo dílu, popis, země původu (vyplní dodavatel), základ určení (vyrobeno u nás / poslední podstatná přeměna u nás / převzato od výrobce – uveďte výrobce). Platnost do (max. 24 měsíců), závazek oznámit změnu, podpis, razítko. Poznámka „Vzor. Nejde o preferenční prohlášení podle prováděcího nařízení (EU) 2015/2447.“

`calculator.js`: importuje výše uvedené, nic jiného. Žádné síťové požadavky kromě líného načtení SheetJS (jen když uživatel nahraje nebo exportuje XLSX).

## 9. Kalkulačka: UX

Jedna stránka, tři části:
1. **Data**: vložit z Excelu (textarea, TSV), nahrát CSV/XLSX, „Načíst ukázku“, „Stáhnout šablonu“. Po načtení náhled prvních řádků a přiřazení sloupců (automaticky, s možností změny). Lišta „Data zůstávají ve vašem prohlížeči. Nic se neodesílá.“
2. **Nastavení**: pravidlo (SAFE výchozí), měna projektu (CZK), kurzy měn (editovatelné, výchozí EUR 25, USD 23, GBP 29.5, CHF 26.5, PLN 5.9 – s poznámkou „orientační, zadejte vlastní“), dnešní datum, rizikové země.
3. **Výsledek**: 
   - verdikt nahoře (pruh s čárou na 35 % pro každý scénář a metodu, razítko VYHOVUJE / NEVYHOVUJE / ZÁLEŽÍ NA DOKLADECH),
   - rezerva,
   - minimální sada dokladů (tabulka) nebo potřebná náhrada,
   - rozpad po kategoriích (tabulka připravená do „Procurement strategy“, tlačítko Kopírovat jako tabulku),
   - stav dokladů,
   - žádosti dodavatelům (u každého: „Prohlášení CZ / SK / EN“ otevře tisknutelný dokument v novém okně přes Blob URL; „Kopírovat e-mail“),
   - tabulka řádků s inline úpravou země původu, dokladu a platnosti (přepočet živě), filtr „jen nedoložené“,
   - varování.
   - Export: CSV výsledků, XLSX (SheetJS), Uložit projekt (JSON), Načíst projekt, Tisk zprávy (print CSS, A4).
- Přepínač CZ/EN v hlavičce (texty v i18n.js).
- Odkazy: zpět na web, metodika, „Chcete to doložit? Objednat Rychlou kontrolu“.
- Přístupnost: popisky formulářů, klávesnice, kontrast.
- Funguje i bez SheetJS (CSV, vkládání).

## 10. Testy

- `tools/test/calc-core.test.mjs`: příklad Komise (92/214 a 92/275), každé pravidlo (CH a GB mimo EU, NO domácí v SAFE i EDIP, UA domácí v SAFE a USI, ne v EDIP), scénáře, minimální sada, náhrada, Kanada, suroviny vyloučeny, prošlá prohlášení, parsování čísel a CSV (středník, uvozovky, desetinná čárka), detekce sloupců, normalizace zemí (CZ/EN názvy, diakritika, EL→GR).
- `tools/e2e.mjs`: build, spustit server, otevřít kalkulačku, načíst ukázku, ověřit verdikt a tabulky, přepnout EN, mobilní šířka bez vodorovného posuvníku, žádné chyby v konzoli; landing pages se načtou bez chyb a bez nenahrazených `{{...}}`.
