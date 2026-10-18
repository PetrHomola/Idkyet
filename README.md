# Pod35

Pod35 pomáhá výrobcům a dodavatelům obranného průmyslu spočítat a doložit, že díly s původem mimo EU tvoří nejvýš 35 % nákladů na komponenty výrobku (pravidlo SAFE a EDIP). Repozitář obsahuje prezentační web (CZ a EN), kalkulačku, která běží celá v prohlížeči, její offline verzi v jednom souboru, šablony ke stažení a obchodní podklady.

Zadání, fakta, ceny a datový model jsou v [docs/SPEC.md](docs/SPEC.md). Když se něco v tomto README a ve specifikaci rozchází, platí specifikace.

## Rychlý start

Potřebujete Node 22. Žádné závislosti se neinstalují.

```bash
npm run build      # site/ -> dist/, nahradí {{PLACEHOLDERY}}, vytvoří offline kalkulačku
npm run serve      # build a web na http://localhost:8080/
npm run test       # testy výpočtu (node --test)
npm run e2e        # test v prohlížeči (Playwright + Chromium)
npm run templates  # znovu vygeneruje šablony v site/sablony/ (Python 3)
```

Pro `npm run templates` je potřeba `pip install openpyxl python-docx`. Pro `npm run e2e` Playwright s Chromiem (viz Testy).

## Struktura repozitáře

```
site/                         zdroj webu, statické soubory bez backendu
  index.html, metodika.html, ochrana-dat.html, nabidka.html
  en/                         anglická verze (index, methodology, data-protection, offer)
  kalkulacka/index.html       kalkulačka (přepínač CZ/EN)
  assets/css/                 tokens.css (designové tokeny), site.css, app.css
  assets/js/                  calc-core.js, countries.js, declaration.js, i18n.js, calculator.js
  assets/sample/              smyšlený ukázkový kusovník
  sablony/                    šablony ke stažení (generuje tools/make-templates.py)
config.json                   firemní údaje a ceny
tools/
  build.mjs                   build a lokální server
  make-templates.py           generátor šablon XLSX, CSV a DOCX
  e2e.mjs                     test v prohlížeči
  test/*.test.mjs             testy výpočtu
  vendor/                     SheetJS stažený buildem (jen lokálně, není v gitu)
sales/                        interní obchodní podklady
docs/SPEC.md                  specifikace produktu a webu
.github/workflows/pages.yml   nasazení na GitHub Pages
```

Bez frameworku a bez bundleru: čisté HTML, CSS a ES moduly. Jediná externí knihovna je SheetJS 0.18.5 z cdnjs, kterou kalkulačka načte až ve chvíli, kdy uživatel nahraje nebo exportuje XLSX. Fonty jsou z Google Fonts, offline verze používá systémová písma.

## config.json: firemní údaje a ceny

Všechny firemní údaje a ceny jsou jen v `config.json`. Stránky v `site/` obsahují místo nich placeholdery a build je nahradí:

| placeholder | odkud | poznámka |
|---|---|---|
| `{{BRAND}}`, `{{COMPANY}}`, `{{ICO}}`, `{{ADDRESS}}`, `{{EMAIL}}`, `{{PHONE}}`, `{{WEB}}`, `{{LINKEDIN}}`, `{{UPDATED}}` | horní úroveň `config.json` | `UPDATED` je datum poslední aktualizace metodiky, měňte ho ručně |
| `{{YEAR}}` | build | aktuální rok |
| `{{PRICE_QUICK}}`, `{{PRICE_QUICK_EDIP}}`, `{{PRICE_PACK}}`, `{{PRICE_PACK_EXTRA}}`, `{{PRICE_MONITOR}}`, `{{PRICE_SUPPLIER}}`, `{{PRICE_DAY}}` | `prices` (Kč), pro soubory v `site/en/` `prices_en` (EUR) | ceny bez DPH |

Pravidla:

- Ceny ani firemní údaje nikdy nepište do HTML natvrdo. Změna ceny = úprava `config.json` a nový build.
- Nový údaj přidáte tak, že doplníte klíč do `config.json` (velkými písmeny) a v HTML použijete `{{KLÍČ}}`.
- Hodnoty se při vkládání escapují podle typu souboru (HTML, JavaScript, CSS), takže smí obsahovat `&` nebo uvozovky.
- Build skončí chybou a vypíše soubor a řádek, pokud v `dist/` zůstane nenahrazený `{{…}}` (například překlep v názvu).
- `WEB` je doména bez `https://` (`pod35.cz`). Build z ní skládá odkazy v offline kalkulačce, `sitemap.xml` a `robots.txt`.

### Co je potřeba doplnit před spuštěním

V `config.json` jsou zatím hodnoty `[DOPLNIT: …]`. Build je vypíše na konci a `npm run e2e` je hlásí jako varování u každé stránky, kde se zobrazují.

- [ ] `COMPANY`: obchodní jméno (patička, nabídka, ochrana dat)
- [ ] `ICO`: IČO
- [ ] `ADDRESS`: sídlo
- [ ] `EMAIL`: kontaktní e-mail (odkazy `mailto:` na webu a v nabídce)
- [ ] `PHONE`: telefon (odkazy `tel:`)
- [ ] `LINKEDIN`: odkaz na profil firmy nebo zakladatele
- [ ] zkontrolovat ceny v `prices` a `prices_en` a datum `UPDATED`
- [ ] po změně `BRAND` nebo `WEB` spustit `npm run templates` (šablony mají značku a adresu kalkulačky v sobě)
- [ ] nastavit doménu (viz Nasazení) a ověřit web na mobilu

## Build

`npm run build` (soubor `tools/build.mjs`, Node 22, bez závislostí):

1. smaže `dist/` a zkopíruje do něj `site/`,
2. v souborech `.html`, `.css`, `.js`, `.txt`, `.svg` nahradí placeholdery,
3. vytvoří `dist/pod35-kalkulacka-offline.html` (viz níže),
4. zapíše `dist/.nojekyll`, `sitemap.xml` (pokud ho web nemá vlastní) a do `robots.txt` doplní odkaz na sitemap,
5. selže (exit 1), když v `dist/` zůstal nenahrazený placeholder.

Proměnné prostředí: `POD35_NO_DOWNLOAD=1` nestahuje SheetJS (použije jen `tools/vendor/`), `POD35_REQUIRE_SHEETJS=1` ukončí build chybou, když SheetJS nejde vložit (nastaveno v CI).

## Offline kalkulačka

`dist/pod35-kalkulacka-offline.html` je celá kalkulačka v jednom HTML souboru: styly, všechny ES moduly, ukázková data, obě šablony (CSV a XLSX) i SheetJS jsou vložené. Funguje otevřená z disku (`file://`) bez internetu a neposílá žádný síťový požadavek. Ověřuje to `npm run e2e`.

Jak vzniká:

- `tokens.css` a `app.css` se vloží jako `<style>`, import Google Fonts se vynechá (systémová písma).
- Moduly se nespojují do jednoho souboru. Build přepíše relativní importy (`from './calc-core.js'`) na `data:` URL závislostí, rekurzivně odspodu. Kód modulů zůstává beze změny a každý modul se v prohlížeči vytvoří jen jednou. Vstupní `calculator.js` je vložený jako inline `<script type="module">`.
- Ukázka `assets/sample/ukazka-kusovnik.csv` se vloží jako `<script type="text/plain" id="pod35-sample">`.
- SheetJS 0.18.5 se při buildu stáhne z cdnjs, ověří proti otisku SHA-512 (stejný jako `integrity` v kalkulačce), uloží do `tools/vendor/` a vloží jako klasický `<script>` na konec stránky. Moduly se spouštějí až po něm, takže `window.XLSX` už existuje. Když stažení selže, build vypíše varování a offline verze funguje bez XLSX (CSV a vkládání z Excelu ano).
- Odkazy zpět na web (metodika, nabídka, ochrana dat) vedou na `https://{{WEB}}/…`, šablony ke stažení jsou vložené jako `data:` URL.
- `<html>` má atribut `data-offline="1"`.

Jak ji poslat zákazníkovi:

1. Spusťte `npm run build` a vezměte `dist/pod35-kalkulacka-offline.html` (asi 1,2 MB). Po nasazení je ke stažení i na `https://pod35.cz/pod35-kalkulacka-offline.html`.
2. Firemní poštovní brány často blokují přílohy `.html`. Spolehlivější je soubor zabalit do ZIP, případně poslat odkaz ke stažení.
3. Do e-mailu napište, že kalkulačka běží jen v prohlížeči, nic neodesílá a funguje i na počítači bez internetu. IT oddělení zákazníka může soubor před použitím prověřit: kód rozhraní je v něm jako čitelný text, výpočetní moduly jsou vložené jako base64 `data:` URL (jejich zdroj je v `site/assets/js/`) a SheetJS je oficiální minifikovaná verze 0.18.5 s ověřeným otiskem.
4. Potřebuje aktuální Chrome, Edge, Firefox nebo Safari.

## Kontrakt mezi kalkulačkou, buildem a testy

Kalkulačku (`site/assets/js/calculator.js` a `site/kalkulacka/index.html`) a build píší různí lidé. Aby offline verze a testy fungovaly, musí kalkulačka dodržet:

- **`data-testid`**: UI musí mít tyto atributy, `tools/e2e.mjs` podle nich hledá prvky:

  | data-testid | prvek |
  |---|---|
  | `load-sample` | tlačítko „Načíst ukázku“ |
  | `verdict` | kontejner s verdiktem (razítko VYHOVUJE / NEVYHOVUJE / ZÁLEŽÍ NA DOKLADECH) |
  | `min-set-table` | tabulka minimální sady dokladů (nebo její kontejner) |
  | `category-table` | tabulka rozpadu po kategoriích (nebo kontejner s `<table>`) |
  | `lang-toggle` | přepínač jazyka; když obsahuje tlačítka s `data-setlang="cs"` a `data-setlang="en"`, test klikne na ně, jinak na celý prvek |
  | `supplier-requests` | seznam žádostí dodavatelům |

  Volitelně `export-xlsx` a `file-input` (jinak test použije `#btn-xlsx` a `#file-input`).
- **SheetJS**: načítat líně a nejdřív zkontrolovat `window.XLSX`. Když existuje (offline verze), použít ho, jinak vložit `<script>` z `https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`.
- **Ukázka**: před `fetch` ukázkového CSV zkusit `document.getElementById('pod35-sample')?.textContent`.
- **Moduly**: importovat jen relativně (`./x.js`), bez `import.meta.url` a bez jiných síťových požadavků. Vstupem je `<script type="module" src="…">` na stránce kalkulačky.
- **Jazyk**: přepnutí jazyka mění `<html lang>` (test čeká na `en` a zpět `cs`).
- Odkazy na web v kalkulačce jsou relativní (`../metodika.html`), případně s atributy `data-href-cs` a `data-href-en`. Build je v offline verzi převede na absolutní adresy.

## Šablony ke stažení

`npm run templates` (Python 3 s `openpyxl` a `python-docx`) vygeneruje do `site/sablony/`:

- `pod35-vstupni-sablona.xlsx`: list „Data“ se záhlavím, které kalkulačka rozpozná (Číslo dílu; Popis; Dodavatel; Země dodavatele; Kategorie; Množství; Jednotková cena; Měna; Země původu; Doklad; Platnost do; Odhad původu; Typ; Poznámka), tři ukázkové řádky, nabídky hodnot pro Kategorii, Doklad a Typ a list „Návod“ česky a anglicky,
- `pod35-vstupni-sablona.csv`: stejné sloupce, středník, UTF-8 s BOM,
- `prohlaseni-o-puvodu-cs.docx`, `-sk.docx`, `-en.docx`: vzor prohlášení dodavatele o nepreferenčním původu (čl. 60 nařízení (EU) č. 952/2013), text je shodný s dokumentem, který generuje kalkulačka (`declaration.js`),
- `README.txt`: co ve složce je.

Vygenerované soubory jsou v gitu, protože CI Python knihovny nemá. Výstup je deterministický, takže nové spuštění bez změn nevytvoří rozdíl. Po změně sloupců v `calc-core.js` spusťte `npm run e2e`, které ověří, že kalkulačka šablonu pořád rozpozná.

## Testy

- `npm run test`: jednotkové testy výpočtu (`tools/test/*.test.mjs`, `node --test`).
- `npm run e2e`: sestaví web, spustí ho na volném portu a v Chromiu ověří:
  - všechny stránky ze specifikace se načtou bez chyb v konzoli, bez nenahrazených `{{…}}`, se správným `lang` a bez vodorovného posuvníku na šířce 390 a 360 px,
  - interní odkazy a kotvy vedou na existující soubory,
  - kalkulačka načte ukázku, ukáže verdikt, tabulky kategorií a minimální sady, žádosti dodavatelům, otevře prohlášení a přepne jazyk CZ, EN a zpět,
  - offline soubor otevřený přes `file://` načte ukázku, ukáže verdikt, exportuje a importuje XLSX a neudělá žádný síťový požadavek,
  - šablony existují a `calc-core.js` rozpozná všechny jejich sloupce a hodnoty,
  - ceny nejsou v `site/` natvrdo a anglické stránky mají ceny v EUR, české v Kč.

  Požadavky mimo `127.0.0.1` test blokuje. Google Fonts se tím pádem nenačtou, to se za chybu nepovažuje, jiný externí požadavek ano. Na konci vypíše PASS/FAIL a při selhání skončí kódem 1. `node tools/e2e.mjs --no-build` použije existující `dist/`.

  Playwright se hledá v `/opt/node22/lib/node_modules/playwright`, pak jako běžný balíček `playwright` (nebo cesta v `PLAYWRIGHT_MODULE`). Chromium v `PLAYWRIGHT_BROWSERS_PATH` (výchozí `/opt/pw-browsers`) nebo v `CHROMIUM_PATH`.

## Nasazení

Web je statický, nasazuje se obsah `dist/`.

### GitHub Pages (výchozí)

1. V repozitáři na GitHubu: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Každý push do `main` spustí `.github/workflows/pages.yml`: testy, build, nasazení. Ručně jde spustit v záložce Actions (Run workflow).
3. Když testy nebo build selžou, nic se nenasadí.

### Cloudflare Pages nebo Netlify

- Build command: `npm run build`
- Output directory: `dist`
- Proměnná prostředí `NODE_VERSION=22`

### Vlastní doména pod35.cz

- **GitHub Pages**: v Settings → Pages vyplňte *Custom domain* `pod35.cz` a zapněte *Enforce HTTPS*. U registrátora domény nastavte pro `pod35.cz` záznamy A na `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (a AAAA na `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`) a pro `www` záznam CNAME na `<uživatel nebo organizace>.github.io`. Doménu doporučujeme ověřit v nastavení účtu nebo organizace (Settings → Pages → Verified domains). Při nasazení přes GitHub Actions se soubor `CNAME` nepoužívá. Pokud ho přesto chcete mít (třeba pro jiný hosting), vytvořte `site/CNAME` s obsahem `pod35.cz`, build ho zkopíruje.
- **Cloudflare Pages / Netlify**: doménu přidejte v nastavení projektu (Custom domains / Domain management) a nastavte CNAME podle jejich pokynů.

Hodnota `WEB` v `config.json` má odpovídat ostré doméně, jinak budou mít offline kalkulačka a sitemap špatné odkazy.
