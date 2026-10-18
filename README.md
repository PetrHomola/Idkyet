# CIRUS Origin

CIRUS Origin (pracovní název; značka na webu je `BRAND` z `config.json`, nyní „CIRUS Origin“) pomáhá výrobcům a dodavatelům obranného průmyslu spočítat a doložit, že díly s původem mimo EU tvoří nejvýš 35 % nákladů na komponenty výrobku (pravidlo SAFE a EDIP). Repozitář obsahuje prezentační web (CZ a EN), kalkulačku, která běží celá v prohlížeči, její offline verzi v jednom souboru, šablony ke stažení a obchodní podklady.

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
  assets/fonts/               Archivo, IBM Plex Sans, IBM Plex Mono (WOFF2, licence v OFL.txt)
  assets/img/                 fotky (zakladatelé: petr.jpg, ben.jpg)
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

Bez frameworku a bez bundleru: čisté HTML, CSS a ES moduly. Jediná externí knihovna je SheetJS 0.18.5 z cdnjs, kterou kalkulačka načte až ve chvíli, kdy uživatel nahraje nebo exportuje XLSX. Fonty Archivo (nadpisy), IBM Plex Sans (text) a IBM Plex Mono (čísla a kódy v tabulkách), licence SIL OFL, jsou uložené přímo na webu v `site/assets/fonts/` (podmnožiny latin a latin-ext), takže nic nejde k Googlu ani jiné třetí straně. Offline verze je má vložené (build vloží všechny `url()` z `tokens.css` jako `data:`).

## Vzhled a fotky

Identita vychází z loga CIRUS: navy `#0F3D73`, téměř černá `#0B1220`, bílá a světle šedé plochy. Podpisovým tvarem je zkosení 45° písmene C: tlačítka, rámy obrázků, panely a navy sekce mají zkosený levý horní a pravý dolní roh (`clip-path`, velikost v proměnné `--c`, tokeny `--cut`, `--cut-sm`, `--cut-lg`). Kulaté rohy mají jen formulářová pole (2 px). Strukturu nesou tenké linky, ne karty se stíny. Žádné animace při scrollování; jediný pohyb je jednorázové naplnění pruhů v ukázce v hero (a ne při `prefers-reduced-motion`). Barvy berou styly jen z tokenů, tmavý režim funguje přes stejné názvy tokenů.

### Obrazové sloty

Fotky patří do `site/assets/img/` (build je zkopíruje do `dist/`). Formát JPG, šířka aspoň dvojnásobek zobrazené velikosti, EXIF odstraněný. Rámeček je komponenta `.photo` v `site.css`: zkosené rohy, obrázek vyplní rám (`object-fit: cover`), poměr stran nastavíte proměnnou `--ratio`.

```html
<figure class="photo" style="--ratio: 4 / 3">
  <img src="assets/img/vyroba.jpg" width="1600" height="1200" loading="lazy" decoding="async" alt="Popis fotky">
</figure>
```

Sloty na stránkách (`site/index.html` a `site/en/index.html`, u anglické verze s `../` na začátku cesty):

| slot | kde | co tam je teď | jak vyměnit |
|---|---|---|---|
| hero | `.hero__media` v úvodní navy sekci | značka C kreslená velká do pozadí (SVG) | `<svg class="hero__mark">` nahraďte `<img src="assets/img/hero.jpg" alt="">`; CSS fotku zobrazí v navy duotónu, aby bílý text měl kontrast. Fotka aspoň 2400 × 1200 px. |
| Pro koho / For whom | `<figure class="photo photo--doc">` vedle textu | ilustrace prohlášení dodavatele s tabulkou původu a razítkem (inline SVG) | `<svg>` uvnitř figure nahraďte `<img>`, odstraňte `aria-hidden="true"` z `<figure>` a doplňte `alt`. Poměr 4 : 3. |
| O nás / About us | `.people__list`, dvě `figure.photo.portrait` | portréty `petr.jpg` a `ben.jpg`, 900 × 900 px, čtvercové | soubor přepište stejným jménem; `alt` je jméno z `{{FOUNDER_1}}` / `{{FOUNDER_2}}`. `npm run e2e` ověřuje, že se obě fotky načtou. |

## config.json: firemní údaje a ceny

Všechny firemní údaje a ceny jsou jen v `config.json`. Stránky v `site/` obsahují místo nich placeholdery a build je nahradí:

| placeholder | odkud | poznámka |
|---|---|---|
| `{{BRAND}}`, `{{COMPANY}}`, `{{ICO}}`, `{{ADDRESS}}`, `{{EMAIL}}`, `{{PHONE}}`, `{{WEB}}`, `{{FOUNDER_1}}`, `{{FOUNDER_2}}`, `{{UPDATED}}` | horní úroveň `config.json` | `UPDATED` je datum poslední aktualizace metodiky, měňte ho ručně |
| `{{YEAR}}` | build | aktuální rok |
| `{{PRICE_QUICK}}`, `{{PRICE_QUICK_EDIP}}`, `{{PRICE_PACK}}`, `{{PRICE_PACK_EXTRA}}`, `{{PRICE_MONITOR}}`, `{{PRICE_SUPPLIER}}`, `{{PRICE_DAY}}` | `prices` (Kč), pro soubory v `site/en/` `prices_en` (EUR) | ceny bez DPH |

Pravidla:

- Ceny ani firemní údaje nikdy nepište do HTML natvrdo. Změna ceny = úprava `config.json` a nový build.
- Nový údaj přidáte tak, že doplníte klíč do `config.json` (velkými písmeny) a v HTML použijete `{{KLÍČ}}`.
- Hodnoty se při vkládání escapují podle typu souboru (HTML, JavaScript, CSS), takže smí obsahovat `&` nebo uvozovky.
- Build skončí chybou a vypíše soubor a řádek, pokud v `dist/` zůstane nenahrazený `{{…}}` (například překlep v názvu).
- `WEB` je doména bez `https://` (nyní `cirusorigin.cz`). Build z ní skládá odkazy v offline kalkulačce, `sitemap.xml` a `robots.txt`.
- Z `BRAND` kalkulačka skládá i názvy exportovaných souborů (`cirus-origin-vysledek-2026-10-18.xlsx`, `…-radky-….csv`, `…-projekt-….json`).

### Co je potřeba doplnit před spuštěním

V `config.json` jsou zatím hodnoty `[DOPLNIT: …]`. Build je vypíše na konci a `npm run e2e` je hlásí jako varování u každé stránky, kde se zobrazují.

- [ ] `COMPANY`: obchodní jméno (patička, nabídka, ochrana dat)
- [ ] `ICO`: IČO
- [ ] `ADDRESS`: sídlo
- [ ] `EMAIL`: kontaktní e-mail (odkazy `mailto:` na webu a v nabídce)
- [ ] `PHONE`: telefon (odkazy `tel:`)
- [ ] zkontrolovat ceny v `prices` a `prices_en` a datum `UPDATED`
- [ ] po změně `BRAND` nebo `WEB` spustit `npm run templates` (šablony mají značku a adresu kalkulačky v sobě)
- [ ] nastavit doménu (viz Nasazení) a ověřit web na mobilu

## Build

`npm run build` (soubor `tools/build.mjs`, Node 22, bez závislostí):

1. smaže `dist/` a zkopíruje do něj `site/`,
2. v souborech `.html`, `.css`, `.js`, `.txt`, `.svg` nahradí placeholdery,
3. vytvoří `dist/cirus-origin-kalkulacka-offline.html` (viz níže),
4. zapíše `dist/.nojekyll`, `sitemap.xml` (pokud ho web nemá vlastní) a do `robots.txt` doplní odkaz na sitemap,
5. selže (exit 1), když v `dist/` zůstal nenahrazený placeholder.

Proměnné prostředí: `CIRUS_NO_DOWNLOAD=1` nestahuje SheetJS (použije jen `tools/vendor/`), `CIRUS_REQUIRE_SHEETJS=1` ukončí build chybou, když SheetJS nejde vložit (nastaveno v CI).

## Offline kalkulačka

`dist/cirus-origin-kalkulacka-offline.html` je celá kalkulačka v jednom HTML souboru: styly, všechny ES moduly, ukázková data, obě šablony (CSV a XLSX) i SheetJS jsou vložené. Funguje otevřená z disku (`file://`) bez internetu a neposílá žádný síťový požadavek. Ověřuje to `npm run e2e`.

Jak vzniká:

- `tokens.css` a `app.css` se vloží jako `<style>`, fonty se vloží také.
- Moduly se nespojují do jednoho souboru. Build přepíše relativní importy (`from './calc-core.js'`) na `data:` URL závislostí, rekurzivně odspodu. Kód modulů zůstává beze změny a každý modul se v prohlížeči vytvoří jen jednou. Vstupní `calculator.js` je vložený jako inline `<script type="module">`.
- Ukázka `assets/sample/ukazka-kusovnik.csv` se vloží jako `<script type="text/plain" id="cirus-origin-sample">`.
- SheetJS 0.18.5 se při buildu stáhne z cdnjs, ověří proti otisku SHA-512 (stejný jako `integrity` v kalkulačce), uloží do `tools/vendor/` a vloží jako klasický `<script>` na konec stránky. Moduly se spouštějí až po něm, takže `window.XLSX` už existuje. Když stažení selže, build vypíše varování a offline verze funguje bez XLSX (CSV a vkládání z Excelu ano).
- Odkazy zpět na web (metodika, nabídka, ochrana dat) vedou na `https://{{WEB}}/…`, šablony ke stažení jsou vložené jako `data:` URL.
- `<html>` má atribut `data-offline="1"`.

Jak ji poslat zákazníkovi:

1. Spusťte `npm run build` a vezměte `dist/cirus-origin-kalkulacka-offline.html` (asi 1,4 MB). Po nasazení je ke stažení i na `https://<WEB>/cirus-origin-kalkulacka-offline.html` (web na ni odkazuje z úvodní stránky).
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
- **Ukázka**: před `fetch` ukázkového CSV zkusit `document.getElementById('cirus-origin-sample')?.textContent`.
- **Moduly**: importovat jen relativně (`./x.js`), bez `import.meta.url` a bez jiných síťových požadavků. Vstupem je `<script type="module" src="…">` na stránce kalkulačky.
- **Jazyk**: přepnutí jazyka mění `<html lang>` (test čeká na `en` a zpět `cs`).
- Odkazy na web v kalkulačce jsou relativní (`../metodika.html`), případně s atributy `data-href-cs` a `data-href-en`. Build je v offline verzi převede na absolutní adresy.

## Šablony ke stažení

`npm run templates` (Python 3 s `openpyxl` a `python-docx`) vygeneruje do `site/sablony/`:

- `cirus-origin-vstupni-sablona.xlsx`: list „Data“ se záhlavím, které kalkulačka rozpozná (Číslo dílu; Popis; Dodavatel; Země dodavatele; Kategorie; Množství; Jednotková cena; Měna; Země původu; Doklad; Platnost do; Odhad původu; Typ; Poznámka), tři ukázkové řádky, nabídky hodnot pro Kategorii, Doklad a Typ a list „Návod“ česky a anglicky,
- `cirus-origin-vstupni-sablona.csv`: stejné sloupce, středník, UTF-8 s BOM,
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

  Kalkulačka má `data-testid` podle kontraktu níže, test je najde bez náhradních selektorů.

  Požadavky mimo `127.0.0.1` test blokuje. Jakýkoli externí požadavek se považuje za chybu. Na konci vypíše PASS/FAIL a při selhání skončí kódem 1. `node tools/e2e.mjs --no-build` použije existující `dist/`.

  Playwright se hledá v `/opt/node22/lib/node_modules/playwright`, pak jako běžný balíček `playwright` (nebo cesta v `PLAYWRIGHT_MODULE`). Chromium v `PLAYWRIGHT_BROWSERS_PATH` (výchozí `/opt/pw-browsers`) nebo v `CHROMIUM_PATH`.

## Nasazení

Web je statický, nasazuje se obsah `dist/`.

### Struktura nasazeného webu

Web produktu je na adrese `https://<WEB>/origin/` (build ho dává do `dist/origin/`). Kořen domény (`dist/index.html`) zatím jen přesměruje na `/origin/`; později tam může být web celé firmy CIRUS Technologies. Build vytvoří i `dist/CNAME` s doménou z `WEB` a `dist/robots.txt`.

### GitHub Pages (výchozí)

1. V repozitáři na GitHubu: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Každý push do `main` spustí `.github/workflows/pages.yml`: testy, build, nasazení. Ručně jde spustit v záložce Actions (Run workflow).
3. Když testy nebo build selžou, nic se nenasadí.

### Cloudflare Pages nebo Netlify

- Build command: `npm run build`
- Output directory: `dist`
- Proměnná prostředí `NODE_VERSION=22`

### Vlastní doména

Níže `<WEB>` = hodnota `WEB` z `config.json` (nyní `cirusorigin.cz`).

- **GitHub Pages**: v Settings → Pages vyplňte *Custom domain* `<WEB>` a zapněte *Enforce HTTPS*. U registrátora domény nastavte pro `<WEB>` záznamy A na `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (a AAAA na `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`) a pro `www` záznam CNAME na `<uživatel nebo organizace>.github.io`. Doménu doporučujeme ověřit v nastavení účtu nebo organizace (Settings → Pages → Verified domains). Při nasazení přes GitHub Actions se soubor `CNAME` nepoužívá. Pokud ho přesto chcete mít (třeba pro jiný hosting), vytvořte `site/CNAME` s obsahem `<WEB>`, build ho zkopíruje.
- **Cloudflare Pages / Netlify**: doménu přidejte v nastavení projektu (Custom domains / Domain management) a nastavte CNAME podle jejich pokynů.

Hodnota `WEB` v `config.json` má odpovídat ostré doméně, jinak budou mít offline kalkulačka a sitemap špatné odkazy.
