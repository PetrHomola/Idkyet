# Evida (pracovní název): produktová skica MVP, verze 2

*Evidence výroby pro malé výrobce dronů a obranné dodavatele. Z dat, která firma už má, poskládá dodací spis a dohledá, kterých kusů se problém týká. Stav k neděli 18. 10. 2026, připraveno na veletrh Future Forces (PVA EXPO Praha, 21.–23. 10. 2026). Skica řeší jen obchod a výrobu, žádné zbraně, munici ani navádění. „Neověřeno“ znamená, že tvrzení má jediný sekundární zdroj nebo je to odhad.*

*Verze 2 zapracovává dvě kritiky: vedoucího výroby z firmy s certifikací AQAP, který používá Odoo, a investora z obranného fondu. Co jsme podle nich změnili, shrnuje oddíl 13.*

## V kostce

- **Co prodáváme:**
  - **Dodací spis.** Je to soubor dokladů, který výrobce odevzdává s dodávkou armádě nebo hlavnímu dodavateli: prohlášení o shodě, protokoly zkoušek, balicí list a prohlášení o původu dílů.
  - **Hledání zpět.** Na otázku „kterých kusů se to týká?“ odpovíme za pár sekund.
  - **Odkud bereme data:** z toho, co firma už má. Tedy z Excelu nebo Odoo, z logů zkušebních stanic a přímo z letové řídicí desky. Doplníme jen to, co chybí.
- **Proč by za to platili:** kvůli riziku, ne kvůli ušetřeným hodinám. Chtějí dodávku převzatou napoprvé, fakturu zaplacenou včas, reklamaci omezenou na 37 zasažených kusů místo stažení všech a kontrolu od státu bez paniky.
- **Původ součástek je pole a výstup, ne hlavní příběh.**
  - Hlavní výstup je prohlášení po kategoriích dílů: „v GNSS, navigaci, řídicí desce, rádiu a softwaru nejsou díly z Číny, Ruska, Íránu ani KLDR“.
  - Procento z ceny součástek podle pravidel EU je až druhý, volitelný výstup.
- **Komu:** malým firmám, které mají **dodávku v příštích 90 dnech** pod státním ověřováním jakosti nebo pro hlavního dodavatele.
- **Co ukážeme na veletrhu:**
  - tři obrazovky klikacího dema: přehled dodávky, příběh jednoho kusu, dodací spis;
  - ukázkový dodací spis v PDF.
- **Co zatím nestavíme:** před první podepsanou objednávkou nepíšeme produkční kód.
- **Kdy se rozhodneme:** v pátek 18. 12. 2026.
  - **Pokračujeme** jen při 2 objednávkách produktu za ≥ 5 000 EUR každá. Obě musí být vyfakturované a aspoň jedna zaplacená.
  - **Jinak** zůstáváme u zakázkového vývoje.

---

## 1. Jednou větou

**Evida poskládá z dat, která výrobce dronů už má, kompletní dodací spis pro armádu nebo hlavního dodavatele. Za pár sekund také řekne, ve kterých dodaných kusech je vadná šarže nebo špatný firmware.**

*Vysvětlivky:*
- **Šarže** je skupina dílů vyrobená a dodaná společně, například 200 baterií se stejným číslem.
- **Firmware** je software nahraný do řídicí elektroniky dronu.
- **Hlavní dodavatel** (anglicky „prime“) je firma, která má zakázku přímo od armády a nakupuje díly a podsestavy od menších subdodavatelů.

**Co Evida dělá, ve třech bodech:**
1. **Zapíše** u každého vyrobeného kusu:
   - z čeho je: šarže dílů;
   - co v něm běží: firmware a jeho nastavení, načtené přímo z desky;
   - jak dopadl ve zkouškách;
   - kdo ho uvolnil.
2. **Vyrobí** z těchto záznamů jedním kliknutím dodací spis ve formátu odběratele, připravený k podpisu.
3. **Hledá zpět.** Ze šarže nebo verze firmwaru dohledá kusy, dodávky a zákazníky.

**Kde běží:** na serveru u výrobce.

**Žádná druhá evidence:** pokud firma už vede šarže v ERP (podnikový systém pro nákup, sklad a účetnictví, například Odoo), čteme je odtamtud a druhou evidenci nezakládáme.

### 30sekundový pitch (česky)

> Dobrý den, jsme Petr a Ben, vývojáři z Prahy. Zajímá nás, co se u výrobců dronů děje před dodávkou armádě. Kdo skládá prohlášení o shodě, protokoly zkoušek a doklady o původu dílů, a co se stane, když něco chybí?
> Stavíme nástroj, který to poskládá z toho, co už máte: z Excelu nebo z Odoo, z logů zkoušek a přímo z letové desky. Za pár vteřin také řekne, ve kterých kusech je vadná šarže. Běží u vás.
> Dnes nic neprodáváme. Chystáte nějakou dodávku v příštích třech měsících? Můžeme se zeptat, jak ji připravujete?

### 30-second pitch (English)

> Hi, we're Petr and Ben, software developers from Prague. We're learning what happens at drone makers before a delivery to an army or a prime contractor. Who puts together the certificate of conformity, the test protocols and the component-origin papers, and what happens when something is missing?
> We're building a tool that assembles that pack from what you already have: Excel or Odoo, your test logs, and the flight controller itself. It also tells you in seconds which units contain a bad lot. It runs on your own server.
> We're not selling today. Do you have a delivery in the next three months? Could we ask how you're preparing it?

### Odpovědi na doplňující otázky

- **„A co z toho máte vy?“** Hledáme dvě firmy na placený pilot s pevnou cenou. Výsledkem je dodací spis pro jejich skutečnou příští dodávku.
- **„Děláte i zakázky?“** Ano, například úpravy Odoo nebo nástroje pro data ze zkušebních stanic.

---

## 2. Pro koho

### Ideální první zákazník

| Znak | Proč právě on |
|---|---|
| **Má dodávku v příštích 90 dnech.** Dodává AČR přes SOJ, ukrajinské armádě, hlavnímu dodavateli nebo zahraniční armádě | Dodací spis potřebuje teď, ne „jednou“ |
| Soukromý výrobce dronů (UAS, bezpilotní systém), protidronových systémů nebo kritických dílů: motorů, regulátorů otáček (ESC), letových řídicích desek („mozek“ dronu), vrtulí, rámů a baterií | Má sériová čísla a ručí za dodané kusy |
| 10–80 lidí, bez oddělení kvality a bez MES (systém, který řídí a zapisuje výrobu na lince) | Doklady skládá majitel nebo jeden technik |
| Ideálně jde o **první obrannou zakázku** nebo první dodávku pod AQAP či SOJ | Firma ještě nemá zaběhnutý a schválený postup, takže přechod na nový nástroj je levný |
| Kusovník (BOM, seznam všech dílů pro jeden kus) a šarže vede v Excelu, nebo v Odoo s výrobními příkazy | U firmy s Excelem vedeme evidenci šarží my. U firmy s Odoo jen čteme a doplňujeme, co Odoo nemá |
| Majitel je k zastižení | Krátký prodejní cyklus. Kdo skutečně podepisuje objednávku, teprve ověřujeme (H9) |

*Vysvětlivky:*
- **AQAP 2110** jsou natovské požadavky na kvalitu, které armáda vkládá do smluv. Česká verze se jmenuje ČOS 051672.
- **SOJ** je státní ověřování jakosti: zástupce státu kontroluje dodavatele místo kupujícího. V ČR to dělá ÚOSKSOJ (Úřad pro obrannou standardizaci, katalogizaci a státní ověřování jakosti).
- **CoC** (Certificate of Conformity) je podepsané prohlášení o shodě, tedy doklad, že dodaný kus odpovídá smlouvě.

**Nejžhavější cíle:** firmy, které vyhrály současné tendry MO na drony, a jejich subdodavatelé.
- Armáda chce do roku 2028 zhruba 3 000 dronů a běží pět tendrů.
- U tendru na 442 průzkumných multikoptér se dodávky čekají do konce roku 2026 (oddíl 3).
- Jména vítězů jsme nenašli. Zeptáme se na stánku MO (H3/307).

**Koho oslovit na veletrhu.** Jde o cíle rozhovorů; nic z toho zatím nemáme ověřené.
- **Výrobci:**
  - PILOTIX (H5/543)
  - U&C UAS (H3/309)
  - Mejzlík Propellers (H4/411)
  - Cyber Drone Solutions (H3/312)
  - EAGLE.ONE (H5/539)
  - PRIMOCO UAV (H4/423)
  - ProLab Engineering (H2/212)
  - 3DFENSE (H1/108)
  - Czechia Systems (H5/578)
- **Partneři a otvírači dveří:**
  - Kentigen (H2/283, zkušební stanice): nabídnout partnerství, viz oddíl 10.
  - Componentas (H3/312) a OneDrone (H1/169): možný zdroj dat o původu dílů.
  - AOBP (H2/205), divize UAV a antidronů.
  - MO (H3/307) a VTÚ (H3/318).

**Koho zatím ne:**
- **Velké skupiny** (CSG, Omnipol, Excalibur Army). U nich se jen zeptáme: „Co chcete od dodavatelů k původu a kvalitě?“
- **Ukrajinské velkovýrobce.** Hodí se na pilot a referenci s platbou předem, ne jako zdroj příjmů.
- **Firmy, které už mají MES** (například Siemens Opcenter).
- **Firmy s utajovaným prostředím** (vyžaduje prověrku NBÚ) **a výrobce munice.** To je mimo naše hranice.

### Kdo ve firmě a co ho bolí

| Role | Co chce | Co ho dnes bolí | Co mu dáme |
|---|---|---|---|
| **Majitel / CEO** (podle naší hypotézy rozhoduje a platí) | Dodávku převzatou a zaplacenou | Faktura visí, dokud kupující dodávku nepřevezme. Neví, jestli projde prohlášení o původu | Přehled, jak je dodávka připravená. Spis bez děr |
| **Kvalita** (v malé firmě často tatáž osoba jako výroba; náš „šampion“, který nástroj ve firmě prosadí) | Mít doklady pohromadě před kontrolou | CoC skládá ve Wordu a shání protokoly. Při reklamaci neví, kterých kusů se týká | Dodací spis jedním kliknutím, hledání zpět, neshody a opravy záznamů s historií |
| **Vedoucí výroby** (uživatel) | Nezpomalit linku | Vadí mu každý sken navíc, výpadky Wi-Fi a letové zkoušky venku bez sítě | Dva skeny na kus (kit + kus), práce offline, firmware se načte sám |
| **Sklad / příjem** | Mít díly označené | Díly chodí v sáčcích bez čísla šarže | Štítek s kódem při příjmu, původ a expirace převzaté z faktury |

### Konkrétní bolesti

1. **„Doložte, jak byl kus postaven.“**
   - AQAP-2110 vyžaduje CoC při uvolnění výrobku (§5.4.11).
   - Sledovatelnost je povinná u každého dílu, jehož selhání by mohlo vést ke ztrátě zařízení nebo života (§5.4.8).
   - Kus, o jehož stavu nikdo neví, je automaticky neshodný (§5.4.12).
   - Na Ukrajině od června 2025 vydává výrobce certifikát kvality ke každému kusu a za správnost dat plně ručí.
   - Dnes se to všechno skládá ručně ve Wordu a Excelu.
2. **„Je dodávka připravená?“**
   - Samotné CoC zabere asi 15 minut.
   - Celý spis k dodávce 20 kusů (protokoly, letové záznamy, balicí list, vývozní doklady) podle kritika z výroby zabere 2–4 hodiny (neověřeno).
   - Skutečná bolest ale není čas. Je to **vrácená nebo odložená dodávka**, když v dokladech něco chybí.
3. **„Doložte původ.“**
   - Česká armáda v tendru zakázala díly z Ruska, Číny, KLDR a Íránu v softwaru, GNSS (satelitní navigace, např. GPS) a navigaci.
   - Většině odběratelů zatím stačí **podepsané prohlášení po kategoriích dílů**.
   - Jestli někdo chce i doklady od dodavatelů, je hlavní otázka veletrhu (H4).
4. **„Kterých kusů se to týká?“**
   - Když je vadná šarže baterií nebo chybné nastavení firmwaru, bez záznamu se stahuje všechno.
   - Firmware se navíc přehrává při opravách i v poli; ukrajinské brigády to dělají běžně. Verze „z výroby“ proto nestačí.
5. **Návštěva zástupce SOJ.**
   - Výrobce musí předložit kompletní dokumentaci se všemi provedenými změnami a výrobky s „řádně vyplněnými průvodními doklady“.
   - Podle AQAP-2110 §5.4.11 musí o konečné kontrole zástupce státu vědět aspoň 10 pracovních dní předem.

---

## 3. Proč teď

| Kdy | Co | Co to znamená pro malého výrobce | Zdroj |
|---|---|---|---|
| Platí od 2016 | **AQAP-2110 Ed D** (ČOS 051672). Vyžaduje CoC při uvolnění, sledovatelnost kritických dílů a řízení konfigurace (kdo co změnil a od kterého kusu). Dále záznamy o neshodách a výjimkách a údaj o zbývající trvanlivosti (např. baterií) sdělený před dodáním | Každá dodávka pod AQAP potřebuje záznamy ke každému kusu | difesa.it |
| 2024, aktualizováno 06/2026 | **Česká metodika SOJ (MP SOJ-2/24).** Vyžaduje plán kvality před výrobou, seznam subdodavatelů, dokumentaci se všemi změnami a „řádně vyplněné průvodní doklady“. Kupující může přidat kontrolně-přejímací let | Takhle vypadají požadavky v české armádní smlouvě | ossoj.mo.gov.cz |
| 27. 11. 2025 | **Tendr MO na průzkumné multikoptéry** (494,2 mil. Kč). Software, GNSS a navigace smí pocházet jen ze zemí, které nejsou hrozbou | Česká armáda chce doložit původ **po kategoriích dílů**, ne v procentech | ekonomickydenik.cz |
| Dodávky do konce 2026 | Týž tendr: 42 multikoptér o hmotnosti kolem 20 kg a 400 dronů do 2,5 kg | Vítězové a jejich subdodavatelé chystají spisy **právě teď** | defence24.com |
| Duben 2026 | **AČR chce do roku 2028 zhruba 3 000 dronů, běží pět tendrů** | V příštích dvou letech přijde vlna dodávek pod SOJ | english.radio.cz |
| 12. 6. 2025 | **Ukrajina:** výrobce sám testuje a ke každému kusu vydává certifikát kvality. Za data plně ručí | Certifikát ke každému kusu je přímo náš výstup | dev.ua |
| SAFE od 27. 5. 2025, EDIP od 12/2025 | **Pravidlo 35 %** (SAFE čl. 16(10), EDIP čl. 10(3)). Součástky z místa mimo EU, EHP (Norsko, Island, Lichtenštejnsko) a Ukrajinu smí tvořit nejvýš 35 % odhadované ceny součástek | Podrobně pod tabulkou. Poptávka po procentech je u malých firem zatím slabá, proto je procento až druhý výstup | eur-lex.europa.eu, consilium.europa.eu |
| Od 1. 11. 2025 | **Zákon o kybernetické bezpečnosti 264/2025 a vyhláška 408/2025** (česká implementace evropské směrnice NIS2). Zavádějí sektor „obranný průmysl“ pro střední a velké výrobce vojenského materiálu | Pro nás je to hlavně omezení: běh u zákazníka, řízení přístupu, auditní záznamy a podklady pro jeho dotazník o bezpečnosti dodavatelů | portal.nukib.gov.cz |
| 22. 12. 2025 | **USA:** FCC (americký telekomunikační úřad) zařadil všechny zahraniční drony a jejich kritické díly na seznam zakázaných zařízení | Pro USA je český dron „zahraniční“. Americká pravidla (NDAA, Drone Dominance) proto **vypouštíme z produktu i z pitche** | insideunmannedsystems.com, wiley.law (neověřeno) |

**Proč je pravidlo 35 % pro malé výrobce zatím slabý tahoun:**
- Počítá se z ceny součástek celého konečného výrobku. Řeší ho tedy hlavní dodavatel; subdodavatel jen vyplní jeho dotazník.
- Komise zatím nevydala metodiku, jak podíl počítat.
- Zakázky SAFE zadávané jedním státem se musely podepsat do 30. 5. 2026.
- České peníze ze SAFE (2,06 mld. EUR) jdou hlavně na tanky, vozidla Tatra a dálnici D11. Drony jsme v plánu nenašli.

**Shrnutí:**
- **Dokládat, jak byl kus postaven, se musí už dnes** a závisí na tom převzetí i zaplacení dodávky.
- **Původ se dnes v ČR dokládá po kategoriích dílů.**
- **Procento podle SAFE přijde později** a hlavně přes hlavní dodavatele.

---

## 4. MVP

### Zásady

- **Nezakládat druhou evidenci.**
  - Firma, která vede šarže a sériová čísla v Odoo, je tam vede dál a my je čteme.
  - Vlastní příjem a montáž používá jen firma, která má Excel.
- **Linka se kvůli nám nikdy nezastaví.** Stanice fungují offline, existuje papírová záloha a pravidlo „pustit s příznakem“.
- **Záznam jde opravit, ale nic nezmizí.** Oprava znamená storno původního záznamu a nový zápis s důvodem a schvalovatelem.
- **Každá schopnost je tenká.** Stavíme jen to, co zaplacený pilot opravdu potřebuje.

### Co MVP umí (6 schopností)

1. **Dodací spis.**
   - **Šablona podle odběratele:**
     - AČR / SOJ;
     - hlavní dodavatel;
     - ukrajinský certifikát kvality ke kusu, v ukrajinštině a s poli z jejich technické specifikace.
   - **Obsah spisu:**
     - **jedno CoC na dodávku se seznamem sériových čísel** (CoC ke každému kusu jen tam, kde to odběratel chce);
     - protokoly zkoušek;
     - balicí list;
     - prohlášení o zbývající trvanlivosti (baterie);
     - prohlášení o původu po kategoriích dílů;
     - číslo vývozní licence a certifikátu konečného uživatele, které jen evidujeme jako text.
   - **Výstup:** PDF připravené k podpisu.
     - Podepisuje se rukou, nebo kvalifikovaným elektronickým podpisem firmy v jejím vlastním nástroji.
     - Vlastní elektronický podpis nevymýšlíme.
   - **Kontrolní seznam před dodávkou** a připomínka, že konečnou kontrolu je třeba oznámit zástupci SOJ aspoň 10 pracovních dní předem.
2. **Import a příjem s původem na šarži.**
   - **Odkud data bereme:**
     - import z Excelu nebo CSV;
     - nebo čtení z Odoo: výrobní příkazy, šarže a sériová čísla.
   - **Příjmová obrazovka pro firmy bez ERP.**
     - Zapíše šarži dodavatele, zemi původu z faktury, expiraci a výsledek vstupní kontroly.
     - Přiloží CoC dodavatele.
     - Vytiskne vlastní štítek šarže s QR kódem jako PDF na libovolné tiskárně štítků.
   - **Odkud bereme původ:** z faktur a dodacích listů distributorů a z celních dokladů.
   - **Žádný formulář pro dodavatele.** Malí a asijští dodavatelé by ho stejně nevyplnili.
3. **Kity a montáž.** Jen pro firmy, které nemají ERP s výrobními příkazy.
   - **Kit** je sada dílů pro jeden kus, připravená předem a svázaná se šaržemi pod jedním kódem.
   - Operátor naskenuje kód kitu a sériové číslo kusu: dva skeny místo patnácti.
   - **Spotřební materiál** (lepidlo, cín, ochranný lak na desky, zajišťovač šroubů) se k sériovým číslům neskenuje. Váže se časovým oknem, například „kusy postavené 3.–17. 5. mají lepidlo šarže X“.
   - **Offline režim:** tablet ukládá skeny a po připojení je odešle na server.
   - **Díl bez štítku** jde zapsat s příznakem. Kus s příznakem nejde uvolnit, dokud to kvalita nevyřeší.
   - **Papírová záloha:** průvodka (papír, který jde s kusem linkou) s QR kódem. Záznamy přepsané z papíru se označí „doplněno dodatečně“.
4. **Konec linky: firmware a nastavení z desky, zkoušky ze zkušební stanice.**
   - **Agent:** malý program na notebooku u linky se po USB připojí k letové desce. Přečte její jedinečné ID, verzi firmwaru a celé nastavení.
     - Betaflight a ArduPilot jsou nejrozšířenější open-source firmwary pro letové desky.
     - U Betaflightu použije příkazy `version` a `diff all`.
     - U ArduPilotu použije zprávu MAVLink AUTOPILOT_VERSION a stažení parametrů.
     - Funguje to i ve firmách, které nahrávají firmware ručně v grafickém nástroji.
   - **Porovnání nastavení** se schválenou „zlatou konfigurací“. Rozdíly svítí červeně.
   - **Každé přehrání je nový záznam**, ať proběhne ve výrobě, při opravě nebo v poli. Historie se nepřepisuje.
   - **Výsledky zkoušek:**
     - import logů zkušebních stanic v jejich vlastním formátu (CSV, JSON, PDF jako příloha);
     - jednoduchý HTTP endpoint s ukázkovým voláním přes `curl`.
   - **Zkušební let** technik nebo pilot odklikne na tabletu i bez sítě.
5. **Stav kusu po celý život, neshody, opravy a uvolnění.**
   - **Stavy kusu:** rozpracovaný, pozastavený, neshoda, uvolněný, odeslaný, vrácený, v opravě, vyřazený.
   - **Neshoda** (NCR) je záznam, že něco neodpovídá specifikaci, a rozhodnutí, co s tím: šrot, oprava, nebo použití s výjimkou.
     - Váže se na kus nebo na šarži.
     - Výjimka má povolené množství a platnost.
   - **Oprava kusu** (například vrácený z Ukrajiny, vyměněný motor, přehraný firmware) změní rodokmen kusu. Stará verze zůstane v historii.
     - Rodokmen je záznam o tom, z čeho přesně je konkrétní kus složený.
   - **Změna konstrukce** (ECO, engineering change order) se ke kusu zapíše jako štítek.
     - Nástroj ukáže seznam dodaných kusů, které změnu ještě nemají a potřebují dodatečnou úpravu (retrofit).
   - **Oddělení rolí:** kdo kus smontoval, nesmí ho uvolnit.
   - **Uvolnění výjimkou:** všechny „zelené“ kusy dodávky uvolní kvalita jedním podpisem, problémové kusy řeší zvlášť.
6. **Hledání zpět a prohlášení o původu.**
   - **Hledání zpět:**
     - Ze šarže, sériového čísla dílu, verze firmwaru nebo hodnoty nastavení najde kusy, dodávky a zákazníky. Započítá i vrácené a opravené kusy.
     - Kusy na skladě jde hromadně pozastavit.
   - **Prohlášení o původu:**
     - Hlavní výstup je po kategoriích dílů: „v GNSS, navigaci, řídicí desce, rádiu a softwaru nejsou díly z CN/RU/IR/KP“. U každé kategorie jsou odkazy na doklady.
     - Díl s neznámým původem nevyhovuje.
   - **Volitelný výpočet procenta:**
     - Podíl EU/EHP/UA na ceně součástek podle zvolených pravidel (SAFE, EDIP).
     - Pro odběratele existuje verze **bez nákupních cen**.
     - Pravidla výpočtu jsou vypsaná přímo na výstupu (oddíl 6).
     - Na každém výstupu stojí „není právní rada“.

**Mimo MVP:**
- **Modul 3D tisku.** Tištěný díl je zatím obyčejná šarže zadaná ručně: jedna tisková deska = jedna šarže.
- **Blokování operátora bez platné kvalifikace**, například bez certifikátu na pájení.
- **Konektory na další ERP.**

### User stories

| Kdo | Chci… | Abych… |
|---|---|---|
| Majitel | vidět, které kusy příští dodávky jsou připravené a co blokuje | věděl, jestli stihneme termín a dostaneme zaplaceno |
| Kvalita | jedním kliknutím vytvořit dodací spis ve formátu AČR nebo ukrajinského certifikátu | nemusela skládat Word a shánět protokoly |
| Kvalita | uvolnit 19 zelených kusů jedním podpisem a jeden s neshodou zvlášť | uvolnění nebrzdilo linku a přitom ho dělal oprávněný člověk |
| Kvalita | opravit chybně naskenovanou šarži s důvodem a schválením | auditor viděl původní i opravený záznam |
| Sklad | při příjmu zapsat šarži, původ a expiraci z faktury a vytisknout štítek | díly šly na linku označené |
| Operátor | naskenovat kit a kus a pokračovat i bez Wi-Fi | nezdržoval linku |
| Technik | aby se po připojení desky samo zapsalo její ID, verze firmwaru a nastavení | nemusel nic opisovat, i když nahrávám firmware v Betaflight Configuratoru |
| Technik zkoušek | aby se log ze zkušební stanice sám přiřadil k sériovému číslu | protokol byl ve spisu bez přepisování |
| Kvalita | zadat šarži baterií a dostat kusy, dodávky a zákazníky, včetně opravených kusů | omezila reklamaci jen na zasažené kusy |
| Majitel | dát odběrateli prohlášení o původu bez nákupních cen | neprozradil své marže |

### Scénář od začátku do konce (smyšlená firma a dron)

*Firma DronLab s.r.o. z Brna má 25 lidí a vyrábí průzkumnou kvadrokoptéru „Skřivan Q4“. Je to dron NATO třídy 1, tedy do 150 kg. Kusovník vede v Excelu, účetnictví v Money S5. Za šest týdnů dodává AČR 20 kusů pod SOJ.*

1. **Příjem.**
   - Sklad přijme 200 baterií.
   - Z CSV faktury distributora se načte řádek se zemí původu.
   - Skladník doplní šarži dodavatele L-2291 a expiraci 03/2028, přiloží CoC dodavatele a vytiskne štítek.
   - GNSS moduly přijdou bez čísla šarže. Dostanou vlastní šarži G-031 a příznak „bez štítku dodavatele“.
2. **Kity.** Skladnice připraví 20 kitů. Každý je naskenováním svázaný se šaržemi motorů, ESC, desky, GNSS modulu, baterie a tištěných ramen. Tisková deska P-0912 je zadaná ručně.
3. **Montáž.**
   - Operátor Tomáš naskenuje kit K-147 a kus SKR-0147.
   - Wi-Fi v dílně na hodinu vypadne. Tablet skeny ukládá a po obnovení sítě je odešle.
4. **Konec linky.**
   - Technik nahraje firmware v Betaflight Configuratoru jako vždy.
   - Agent po připojení desky přečte její ID, verzi 4.5.1 a nastavení.
   - Jedno nastavení (failsafe, chování při ztrátě signálu) se liší od zlaté konfigurace a svítí červeně. Technik ho opraví a agent zapíše novou verzi.
   - Log ze zkušební stanice (CSV) se přiřadí ke kusu SKR-0147.
5. **Zkušební let.** Na letišti bez signálu pilot odklikne let na tabletu. Záznam se nahraje večer po návratu.
6. **Neshoda.**
   - U kusu SKR-0152 drhne motor. Kvalitářka Jana založí neshodu.
   - Motor se vymění za jiný z nové šarže a kus jde znovu přes konec linky.
7. **Uvolnění.**
   - Jana v přehledu vidí 19 zelených kusů. SKR-0152 je po opravě také zelený.
   - 19 kusů uvolní jedním podpisem a SKR-0152 zvlášť.
   - Tomáš uvolňovat nemůže, protože kusy montoval.
8. **Dodací spis.**
   - Systém včas připomněl, že konečnou kontrolu je třeba oznámit zástupci ÚOSKSOJ aspoň 10 pracovních dní předem.
   - Jedno kliknutí vytvoří:
     - CoC se seznamem 20 sériových čísel;
     - protokoly zkoušek;
     - balicí list;
     - prohlášení o trvanlivosti baterií;
     - prohlášení o původu po kategoriích;
     - číslo vývozní licence.
   - Prohlášení o původu ukazuje u GNSS modulu švýcarského výrobce dvě věci:
     - kategorie vyhovuje, protože díl není z CN/RU/IR/KP;
     - do procenta EU/EHP/UA by se nepočítal (podle našeho čtení SAFE; ověřit).
   - Jana PDF podepíše kvalifikovaným podpisem.
   - Místo 2–4 hodin skládání to trvá pár minut a ve spisu nic nechybí.
9. **O dva měsíce později, reklamace.**
   - Zákazník hlásí nafouknutou baterii. Jana zadá šarži L-2291.
   - Výsledek: 37 kusů ve 3 dodávkách, z toho 1 právě v opravě.
   - Seznam jde zákazníkovi a kusy na skladě se hromadně pozastaví.

**Varianta pro firmu s Odoo:**
- Kroky 1–3 (příjem a montáž přes výrobní příkazy se šaržemi) zůstávají v Odoo.
- Evida si šarže a sériová čísla načte a přidá jen kroky 4–9.

---

## 5. Co NEDĚLÁME

| Nestavíme | Místo toho |
|---|---|
| ERP: nákup, sklad, účetnictví, plánování | Excel nebo CSV a čtení z Odoo. Další ERP (Money, Pohoda, Helios, ABRA, MRPeasy) až podle toho, co výrobci skutečně používají |
| **Druhou evidenci šarží vedle Odoo** | U firem s Odoo jen čteme výrobní příkazy. Odoo už má aplikaci s původem na šarži za 48,66 USD. Zápis původu zpět do Odoo až po ověření |
| PLM a CAD (správu konstrukce a revizí) | Ukládáme jen označení revize a otisk souboru kusovníku |
| Formulář, který vyplňují dodavatelé. Výpočet „co kdyby“ při záměně dílu | Původ bereme z faktur, API distributorů a celních dokladů. Záměnu dílu stejně musí potvrdit zkoušky a zákazník, ne tabulka |
| Americká pravidla (NDAA, Drone Dominance, Blue UAS) | Mimo produkt i pitch. Případně později pro firmy, které míří do USA |
| Modul 3D tisku nad Prusa Connect Local | Tištěný díl je šarže zadaná ručně. Integraci (Prusa i Bambu) zvážíme, až ji potvrdí H10 a až Prusa písemně potvrdí licenci |
| Plné MES. Plný systém řízení kvality (CAPA = nápravná a preventivní opatření, školení, řízení dokumentů) | Jen neshody, opravy a uvolnění. Zbytek zůstává ve stávajícím systému kvality zákazníka |
| Vlastní elektronický podpis. „Řetěz otisků“ jako prodejní argument | PDF k podpisu v nástroji zákazníka. Interní auditní log. Kvalifikované časové razítko až na přání zákazníka |
| Hostování výrobních dat | Hostovaná instance v EU jen pro demo a zkoušení s vymyšlenými daty |
| Právní posudek „vyhovuje SAFE“ | Výpočet, doklady a vypsané předpoklady. Rozhoduje zákazník nebo jeho právník |
| Utajované prostředí, ITAR (americká pravidla pro vývoz vojenských věcí) a cokoli, co souvisí s funkcí zbraní, naváděním nebo zaměřováním | Záměrně mimo rozsah |

---

## 6. Datový model

### Hlavní entity

**Konstrukce a díly**
- **Produkt** se dělí na **konfigurace**. Konfigurace má:
  - revizi (verzi konstrukce);
  - platnost od sériového čísla nebo od data;
  - otisk souboru kusovníku;
  - schválenou zlatou konfiguraci firmwaru.
- **Řádek kusovníku:** pozice, množství, interní díl, kritický ano/ne a kategorie. Kategorie jsou: GNSS, navigace, řídicí deska, rádio, kamera, motor, ESC, baterie, software, mechanika, tištěný díl.
- **Interní díl** může mít více **dodavatelských dílů**. Dodavatelský díl má:
  - výrobce a MPN (katalogové číslo dílu u výrobce);
  - dodavatele;
  - příznak, jestli jde o autorizovaného distributora.

**Příjem a doklady**
- **Šarže (příjem):**
  - dodavatelský díl, šarže dodavatele, naše šarže a štítek, množství;
  - cena v měně faktury a kurz ČNB ke dni faktury;
  - **země původu na šarži** a zdroj tohoto údaje (faktura, celní doklad, prohlášení, nebo „neznámý“);
  - expirace a výsledek vstupní kontroly.
- **Doklad:** soubor s otiskem a platností. Může to být CoC dodavatele, prohlášení o původu, celní doklad nebo log zkoušky.
- **Kit:** kód a šarže, které obsahuje.
- **Spotřební materiál:** šarže a časové okno, kdy byla na pracovišti aktivní (od–do).

**Kus a jeho život**
- **Kus:** sériové číslo, konfigurace, stav a změny konstrukce (ECO), které má.
- **Zabudování:**
  - vazba kusu na kit, šarži, sériově číslovaný díl nebo podsestavu (jiný kus);
  - kdo a kdy;
  - zdroj záznamu: sken, Odoo, nebo papír doplněný dodatečně;
  - příznak „bez štítku“.
- **Snímek desky:**
  - kus, ID desky, verze firmwaru;
  - otisk nastavení a jeho text, rozdíl proti zlaté konfiguraci;
  - důvod: výroba, oprava, nebo pole.
  - Kus má více snímků, takže je vidět celá historie přehrávání.
- **Zkouška:** kus, postup a jeho verze, kritéria přijetí, výsledek, surový log, kdo ji provedl a jestli byla zapsaná offline.
- **Neshoda:** kus nebo šarže, rozhodnutí, výjimka s povoleným množstvím a platností, kdo schválil.
- **Oprava kusu:** příčina, vyměněné díly, nový snímek desky.
- **Změna (ECO):** popis, platnost od kusu, seznam kusů, které potřebují dodatečnou úpravu.
- **Uvolnění:** kusy, kdo, kdy. Systém kontroluje, že uvolňující kusy nemontoval.

**Dodávka a původ**
- **Dodávka:**
  - odběratel a šablona spisu;
  - kusy;
  - termín konečné kontroly;
  - čísla vývozní licence a certifikátu konečného uživatele, jen jako text.
- Z dodávky vzniká **dodací spis**: verze PDF a kdo ho podepsal.
- **Vyhodnocení původu:**
  - pro dodávku nebo konfiguraci;
  - sada pravidel a její verze;
  - výsledek po kategoriích, volitelně procento, a vypsané předpoklady.
  - Ukládá se jako snímek, aby šel výpočet za rok zopakovat a obhájit.

**Systém**
- **Událost:** kdo, kdy, co.
  - Opravy se zapisují jako storno a nový zápis s důvodem a schvalovatelem.
  - Události jsou interně řetězené otisky, navenek to jako funkci neprodáváme.
- **Uživatel** má roli: sklad, operátor, technik, kvalita, admin, nebo auditor (jen pro čtení).

```
Produkt ─1:N─ Konfigurace ─1:N─ Řádek kusovníku ─N:1─ Interní díl ─1:N─ Dodavatelský díl ─1:N─ Šarže ── Doklad
                 │                                                                                 │
                1:N                                                                       Kit (N:M se Šaržemi)
                 │                                                                                 │
                Kus ── Zabudování (N:M) ──────────────────────────────────────────> Kit / Šarže / jiný Kus
                 ├── Snímek desky (1:N, historie přehrávání)
                 ├── Zkouška ── Doklad (log)
                 ├── Neshoda ── Oprava kusu
                 ├── Změna ECO (N:M)
                 └── Uvolnění
                 │
                N:1
                 │
              Dodávka ── Dodací spis (PDF, podpis)
                 └── Vyhodnocení původu ── Sada pravidel (verze)

Událost <── každá změna kdekoli výše (storno + nový zápis, nic se nemaže)
```

### Pravidla výpočtu původu (vypsaná na každém výstupu)

- **Úroveň:** posuzuje se díl tak, jak ho kupujeme, tedy první nakupovaná úroveň kusovníku.
  - Příklad: řídicí deska osazená na Ukrajině je „UA“ podle dokladu dodavatele.
  - U kategorií GNSS, navigace, řídicí deska a rádio navíc evidujeme, odkud je hlavní čip, pokud to dodavatel uvede.
- **Cena:** nákupní cena ze šarže, přepočtená kurzem ČNB ke dni faktury.
- **Vlastní díly** (například frézovaný rám nebo tištěné rameno):
  - zemí původu je země naší výroby;
  - cenu zadá zákazník;
  - suroviny se za součástky nepočítají (EDIP, recitál 27).
- **Neznámý původ znamená, že díl nevyhovuje.**
- **Ochrana cen:** výstup pro odběratele jde vygenerovat bez nákupních cen.

---

## 7. Obrazovky pro klikací demo

**Podoba dema:**
- statické HTML se smyšlenými daty firmy DronLab a dronu Skřivan Q4;
- realistický kusovník se 42 řádky;
- realistický dodací spis v PDF.

**Na veletrhu ukazujeme jen obrazovky 1, 3 a 5.** Ostatní ukážeme, jen když se na ně někdo zeptá.

1. **Přehled dodávky.** Majitel za 10 sekund vidí, jestli příští dodávka projde a co ji blokuje.
   - Karta dodávky: „AČR (SOJ), Skřivan Q4, 20 ks, konečná kontrola 12. 11.“
   - Připraveno 18 z 20 kusů a seznam blokujících kusů s důvodem.
   - Chybějící doklady.
   - Odpočet do termínu, kdy je nejpozději třeba oznámit kontrolu zástupci SOJ.
   - Baterie blízko expirace.
   - Poslední dodávky.
2. **Příjem a původ.** Ukazuje, že kvalita dat vzniká už při příjmu.
   - Import řádků faktury distributora.
   - Doplnění šarže, expirace a výsledku vstupní kontroly.
   - Příloha CoC dodavatele.
   - Zdroj údaje o původu.
   - Tisk štítku.
   - Příznak „bez štítku dodavatele“.
3. **Příběh kusu SKR-0147.** Celý život jednoho sériového čísla na jedné stránce.
   - Strom: kus → kit → šarže → dodavatel → doklad.
   - Historie firmwaru a nastavení, včetně přehrání při opravě.
   - Zkoušky s logy a neshody.
   - Časová osa stavů od výroby přes odeslání, vrácení a opravu až po nové odeslání.
   - Opravy záznamů s důvodem a schvalovatelem.
4. **Konec linky.** Firmware a nastavení se zapíšou samy, i když technik používá grafický nástroj.
   - Po připojení desky se zobrazí její ID, verze a otisk firmwaru.
   - Porovnání se zlatou konfigurací, rozdílové řádky červeně.
   - Import logu ze zkušební stanice.
   - Kontrolní seznam zkušebního letu offline.
   - Počítadlo záznamů, které čekají na synchronizaci.
5. **Dodací spis.** Z dvou až čtyř hodin skládání je jedno kliknutí bez děr.
   - Volba šablony.
   - Kontrolní seznam obsahu.
   - Náhled PDF: CoC se seznamem sériových čísel, protokoly, balicí list, trvanlivost, prohlášení o původu po kategoriích.
   - Volitelně procento bez cen.
   - Stažení k podpisu a stav podpisu.
6. **Hledání zpět.** Na otázku „kterých kusů se to týká?“ je odpověď za pár sekund.
   - Hledá se podle šarže, sériového čísla dílu, verze firmwaru, hodnoty nastavení nebo dodavatele.
   - Výsledek ukáže kusy, dodávky a zákazníky, včetně kusů v opravě.
   - Kusy jde hromadně pozastavit a založit k nim neshodu.
   - Seznam jde exportovat pro zákazníka.

Podrobný obsah obrazovek je v seznamu demo obrazovek, který je součástí výstupu.

---

## 8. Technická rozhodnutí (krátce)

- **Nasazení**
  - **Výchozí varianta: u zákazníka.**
    - Jeden server nebo virtuální stroj.
    - Celá aplikace se spouští přes `docker compose`.
    - Běží bez internetu, licence je soubor.
  - **Hostovaná instance v EU** (Hetzner nebo OVH) slouží jen pro demo a zkoušení s vymyšlenými daty.
  - **Vlastní server stojí víc** než hostovaná varianta: platí se instalace a roční podpora.
- **Aktualizace bez internetu**
  - Podepsaný balíček a poznámky k vydání, které si zákazník založí do svého řízení změn.
  - Vzdálený přístup jen na výzvu zákazníka a se záznamem o něm.
- **Stack**
  - Backend: TypeScript (Node.js) nebo Python (FastAPI). Databáze PostgreSQL.
  - Frontend: React jako PWA, tedy webová aplikace, která se na tabletu chová jako nativní appka.
    - Offline fronta v IndexedDB.
    - Záznamy dostávají UUID už na klientovi, takže synchronizace jen „doplní, co chybí“.
  - Čtečky čárových kódů přes USB se chovají jako klávesnice a nepotřebují ovladače.
- **Agent pro konec linky**
  - Malý program v Pythonu (pyserial, pymavlink) pro Windows i Linux.
  - Pozor: ID čipu STM32 nemusí být unikátní mezi deskami ze stejné výrobní série. Sériovým číslem kusu proto zůstává štítek a ID desky je jen doplňkový důkaz.
- **Výstupy**
  - PDF ze šablon přes Typst, ve formátu PDF/A kvůli dlouhodobé archivaci.
  - Ukrajinská šablona je v ukrajinštině. Uživatelské rozhraní je zatím česky a anglicky.
- **Integrace**
  - CSV a Excel.
  - Čtení z Odoo přes JSON-RPC.
  - HTTP endpoint pro zkušební stanice s ukázkovým voláním přes `curl`. Samostatné CLI ani balíček nestavíme.
- **Bezpečnost**
  - Role a oprávnění, dvoufaktorové přihlášení.
  - Auditní log včetně oprav.
  - Šifrované zálohy, TLS všude, žádná telemetrie.
  - Na požádání:
    - SSO (firemní přihlašování);
    - kvalifikované časové razítko denního souhrnu podle RFC 3161 (standard pro důvěryhodná časová razítka);
    - SBOM (seznam knihoven, ze kterých je náš software složený).
- **Balíček pro důvěru kupujícího** (připravuje se jednou a je levný)
  - Export všech dat kdykoli v otevřených formátech: CSV, JSON, PDF.
  - Escrow pro platící zákazníky: úschova zdrojového kódu u třetí strany.
  - Závazek uchování dat. Data leží na serveru zákazníka, takže přežijí i nás.
  - Krátký ověřovací protokol nástroje a hotový text postupu, který si zákazník vloží do svého systému kvality.
  - Odpovědi na dotazník o bezpečnosti dodavatelů podle NIS2: architektura, přístupy, pravidla vzdálené podpory.
- **Vývoz:** před první dodávkou mimo EU, i na Ukrajinu, ověřit u MPO, jestli software nepotřebuje vývozní povolení.

---

## 9. Cena a obchodní model (hypotéza k ověření)

### Pilot: „Dodací spis na vaši příští dodávku“

- **Rozsah:** pevná cena **6 000–9 000 EUR**, 6 týdnů, jeden výrobek, jedna skutečná dodávka.
- **Co uděláme:**
  - Přijdeme k zákazníkovi a data zůstanou u něj.
  - Z jeho Excelu nebo Odoo, logů zkoušek a faktur sestavíme dodací spis ve formátu jeho odběratele.
  - Nastavíme hledání zpět a čtení desek na konci linky.
- **Co zákazník dostane navíc:** nástroj mu zůstane na 6 měsíců.
- **Platba:** 50 % při objednávce, 50 % po předání spisu. Když odběratel spis vrátí kvůli naší chybě, opravíme ho zdarma.
- **Pilot se nemíchá se zakázkovým vývojem** pro tutéž firmu: zvláštní objednávka, zvláštní faktura.

### Po pilotu

| Položka | Pro koho | Cena (hypotéza) |
|---|---|---|
| Licence „Dílna“ | 1 výrobek, zhruba do 2 000 kusů ročně | 4 800 EUR ročně |
| Licence „Výroba“ | Více výrobků, čtení z Odoo, agent pro desky | 9 600 EUR ročně |
| Šablona pro nového odběratele | Nová armáda nebo hlavní dodavatel | 1 500 EUR jednorázově |
| Instalace na vlastní server | Každý zákazník | 1 500–3 000 EUR jednorázově |

**Proč účtujeme za odběratele a zakázku:** hodnota přichází s dodávkami a novými smlouvami, ne rovnoměrně po měsících.

**Proč neúčtujeme za uživatele:** operátoři se střídají a sdílejí tablety.

**Proč je cena rozumná:**
- **Ušetřený čas cenu sám nezaplatí.** Kritik z výroby ho odhaduje na 200–700 EUR měsíčně (neověřeno).
- **Prodáváme snížení rizika:** pozdržené faktury za dodávku, stažení všech kusů místo 37, neúspěšné konečné kontroly.
- **Alternativou je najmout inženýra kvality**, nebo platit konzultanta.
  - Inženýr kvality stojí 44–79 tis. Kč hrubého měsíčně (platy.cz).
  - Včetně odvodů to je zhruba 2,4–4,3 tis. EUR měsíčně (náš přepočet).

**Ekonomika pilotu (odhad):**
- Pilot zabere zhruba 80–120 hodin naší práce.
- To dává 50–110 EUR za hodinu.
- Zakázkový vývoj vynáší 18–33 EUR za hodinu (450–800 Kč/h).
- Produktu věnujeme 40–50 % času dvou lidí, takže zvládneme nejvýš 2 piloty najednou.

**Zakázkový vývoj zvlášť:** úpravy Odoo, nástroje pro data ze zkušebních stanic, integrace. Na otázku „děláte i zakázky?“ na veletrhu odpovídáme ano.

### Velikost trhu, upřímně

- **Česko a Slovensko:** desítky výrobců dronů a dílů (neověřeno).
  - Při 5–10 tis. EUR ročně na zákazníka je strop v řádu stovek tisíc EUR ročních tržeb.
  - To je malá zisková softwarová firma, ne venture.
- **Cesta dál:**
  - stejný problém mají všichni malí dodavatelé pod AQAP a SOJ (AOBP má přes 290 členů napříč obranou, neověřeno);
  - pak Polsko, Pobaltí, Skandinávie a Německo.
- **Investoři:** Presto Tech Horizons je podle kritika reálný až kolem 15–20 tis. EUR měsíčních opakovaných tržeb, kde je vidět, že zákazníci kupují opakovaně.

---

## 10. Konkurence a čím se lišíme

| Alternativa | Co umí | Co neumí | Cena | Čím se lišíme |
|---|---|---|---|---|
| Excel + Word (dnešní stav) | Všechno ručně | Hledání zpět, historii přehrávání firmwaru, kontrolu úplnosti spisu | „Zdarma“, ale stojí čas a nese riziko | Spis vzniká z dat a před dodávkou se zkontroluje |
| Odoo + vlastní vývojář | Šarže a sériová čísla ve výrobních příkazech, zpětné dohledání. Původ na šarži přes aplikaci za 48,66 USD | Čtení z letové desky, spis podle armádní šablony, prohlášení po kategoriích (neověřeno, zda to někdo nenabízí) | 24,90–49 USD za uživatele a měsíc + mzda vývojáře | Nekonkurujeme mu: čteme z Odoo. Možná budeme Odoo modul (rozhodnutí v týdnu 11–12) |
| Konzultant pro AQAP a ISO | Napíše plán kvality a postupy | Nevede data o jednotlivých kusech | Projektově | Partner a obchodní kanál, ne konkurent |
| Kentigen (CZ, H2/283) | Zkušební stanice s „plnou sledovatelností“ zkoušek, prověrka NBÚ | Celý kus a dodací spis (neověřeno) | Projektově | Partner: jejich data o zkouškách půjdou do našeho spisu |
| Tulip | MES, který si zákazník poskládá sám | Hotové řešení pro drony, vlastní server | Od zhruba 12 tis. USD ročně | Hotový spis, běží u zákazníka |
| Siemens Opcenter X | Rodokmen kusů, i na vlastním serveru | Původ součástek, rychlé nasazení | Na nabídku + implementační projekt | Nasazení za dny, ne za měsíce |
| Proalpha (německé ERP) | ERP s podporou AQAP a vývozní kontroly | Malé firmy | Na nabídku | Nejsme ERP |
| First Resonance ION (USA) | Vzorový záznam o tom, jak byl kus postaven | Provoz v EU, vlastní server, původ součástek | Zhruba 150–400 tis. USD v prvním roce (neověřeno) | Pro nás vzor, ne konkurent v ČR |

**Čím se můžeme bránit.** Je to teze, ne fakt; technicky nic z toho není těžké. Obhajitelné mohou být tři věci:
1. **Sdílená knihovna dokladů o původu dílů.**
   - Stejné prohlášení k vrtuli nebo letové desce použije 20 výrobců.
   - Potřebujeme k tomu partnerství s distributory, například Componentas a OneDrone.
2. **Šablony spisů podle odběratelů** (AČR/SOJ, ukrajinský certifikát, hlavní dodavatelé). Ověřené tím, že je odběratelé skutečně přijali.
3. **Vztahy a poradce z oboru.** Hledáme bývalého inspektora ÚOSKSOJ nebo manažera kvality obranného dodavatele, ideálně s podílem ve firmě.

**Hlavní hrozby:**
- Partner Odoo nebo vývojář zákazníka postaví totéž za 2–4 týdny.
- Kentigen rozšíří svou sledovatelnost na celý kus.
- Partner systémů Helios nebo Pohoda přidá podobný modul.

---

## 11. Plán na 0–12 týdnů

**Pravidla:**
- Zakázkový vývoj zabere nejvýš 50–60 % času.
- **Před první podepsanou objednávkou nepíšeme produkční kód.** Demo, šablona spisu a jednorázové skripty jsou povolené.

| Týden (data) | Rozhovory a prodej | Stavba | Zakázky (peníze) |
|---|---|---|---|
| **0** (19.–25. 10.) | Podrobně pod tabulkou | Jen demo | 2–3 nabídky zakázkového vývoje (Odoo, data ze zkoušek) |
| **1–2** (26. 10.–8. 11.) | 3–5 návštěv přímo ve výrobě. Sehnat skutečné CoC, ukrajinský certifikát a seznam toho, co kontroluje zástupce SOJ. **Najít poradce pro AQAP.** Nabídnout pilot firmám s dodávkou do 90 dnů. Oslovit 2 konzultanty AQAP a ISO jako obchodní kanál | Šablona spisu v Typstu podle skutečného vzoru | Podepsat první zakázku |
| **3–4** (9.–22. 11.) | **První podepsaná objednávka pilotu.** Přihláška do EUDIS do 16. 11. Dotaz na MPO k vývozu | Pilot 1: import z Excelu nebo Odoo, dodací spis, hledání zpět | Zakázka běží |
| **5–7** (23. 11.–13. 12.) | Předat spis pilotu 1. Získat druhou objednávku | Příjem s původem, agent pro desky, stavy, neshody a uvolnění, ale jen to, co pilot zaplatil | Nové zakázky jen od firem, které mohou být budoucími uživateli produktu |
| **8** (14.–18. 12.) | **Rozhodnutí** (viz níže) | Stabilizace pilotů | — |
| **9–10** (21. 12.–3. 1.) | Vánoce: firmy stojí, s odpověďmi nepočítat | Offline montážní stanice, balíček pro důvěru kupujícího | — |
| **11–12** (4.–17. 1. 2027) | Převést piloty na licence. Rozhodnout, jestli **Odoo modul, nebo samostatná aplikace**. Naplánovat Enforce Tac (1.–3. 3. 2027) a IDET (26.–28. 5. 2027) | Podle toho, co piloti potřebují | — |

### Týden 0 podrobně

- **Neděle 18. 10. (dnes):** registrace na veletrh. QR kód přijde e-mailem a bez něj se dovnitř nedostanete.
- **Pondělí a úterý:**
  - jednostránka, demo se třemi obrazovkami a ukázkový spis v PDF;
  - e-maily 10 vybraným firmám s žádostí o 15 minut;
  - rozhodnout postoj ke Kentigenu (nabídnout partnerství);
  - požádat ÚOSKSOJ o schůzku, protože na veletrhu nevystavuje.
- **Středa až pátek, veletrh.** Otevřeno st a čt 9–17, v pátek 9–15.
  - Ve středu ráno check-in a žádosti o schůzky v aplikaci FFF EXPO.
  - Cíl: 10–15 rozhovorů.
  - Čtvrtek 11:45: kulatý stůl o českém průmyslu a zakázkách pro armádu.
  - Čtvrtek 14:35: Jaroslav Řešátko (AOBP, divize UAV a antidronů).
- **Víkend:** obodovat hypotézy podle poznámek z rozhovorů.

### Kritéria rozhodnutí (do pátku 18. 12. 2026)

- **Pokračovat:** 2 objednávky produktu za ≥ 5 000 EUR každá, vyfakturované, z toho aspoň jedna zaplacená.
  - Nepočítá se LOI (letter of intent, písemný závazek zájmu) bez ceny a termínu.
  - Nepočítá se ani zakázka vývoje přejmenovaná na pilot.
- **Prodloužit o 4 týdny, do 15. 1. 2027:** máme jednu zaplacenou objednávku a druhou podepsanou objednávku s termínem po Vánocích.
- **Zastavit produkt:** máme méně. Kód zůstane jako znovupoužitelný základ pro zakázky.
- **Zastavit nebo změnit jen část:**
  - **Odběratelům stačí podepsané prohlášení o původu bez dokladů (H4).** Původ zůstane jen jako šablona a těžiště bude dodací spis.
  - **Většina cílových firem má Odoo s výrobními příkazy (H11).** Stavíme Odoo modul, ne samostatnou aplikaci.
  - **Nikdo nemá dodávku pod AQAP nebo SOJ v příštích 6 měsících.** Bolest ještě nedozrála a vracíme se k zakázkám.

### Průběžná měřítka

- 15 rozhovorů do konce týdne 2, obodovaných podle hypotéz H1–H13.
- 3 firmy s dodávkou do 90 dnů, které nám ukázaly svůj poslední spis.
- Domluvený poradce pro AQAP do konce týdne 3.
- Aspoň jeden partner pro obchodní kanál: konzultant, Componentas nebo OneDrone, partner Odoo, nebo AOBP.

---

## 12. Rizika a co ověřit na veletrhu

### Hypotézy (každou jde vyvrátit)

Ptejte se na to, co se už stalo, ne na „koupil byste?“.

| # | Hypotéza | Otázka | Je vyvrácená, když… |
|---|---|---|---|
| H1 | Aspoň třetina malých výrobců má v příštích 90 dnech dodávku pod AQAP nebo SOJ, případně pro hlavního dodavatele | „Kdy je vaše příští dodávka a komu?“ | Méně než 3 z 10 |
| H2 | Spis skládá ručně jeden člověk a dodávka se aspoň jednou za rok zdržela kvůli dokladům | „Jak jste chystali poslední dodávku? Vrátil vám někdy odběratel doklady?“ | Nikomu se za posledních 12 měsíců nic nezdrželo |
| H3 | Malí výrobci nedokážou do hodiny říct, které šarže a jaký firmware jsou v kusu X | „Kdy jste naposledy hledali, co je v konkrétním kusu? Jak dlouho to trvalo?“ | ≥ 5 z 8 to zvládne do hodiny ze systému |
| H4 | Aspoň některým odběratelům nestačí podepsané prohlášení o původu a chtějí doklady | „Co přesně jste k původu posílali a stačilo to?“ | Nikdo z 10 se nesetkal s požadavkem na doklady |
| H5 | Firmware se nahrává ručně v grafickém nástroji a verze ani nastavení se k sériovému číslu nezapisují | „Kdo a čím nahrává firmware? Kam se zapíše verze a nastavení?“ | Většina má verzi u sériového čísla ze skriptu |
| H6 | Díly chodí bez čísla šarže a označují se až u výrobce | „Jak poznáte šarži motoru, který přišel v sáčku?“ | Většina má díly se šarží od dodavatele |
| H7 | Bolí to natolik, že zaplatí pilot za 6–9 tis. EUR | „Kdyby vám spis pro příští dodávku připravil nástroj za pevnou cenu, kdo by o tom rozhodl a do kdy?“ | Rozhodovatele i termín jmenuje jen 0–1 z 10 |
| H8 | Pustí nás k datům u sebe ve firmě, místo aby posílali kusovník ven | „Mohli bychom u vás jeden den projít data jednoho výrobku?“ | Do 2 týdnů nikdo |
| H9 | Ve firmách do 50 lidí podepisuje majitel z provozního rozpočtu | „Kdo podepsal vaši poslední objednávku softwaru a jak dlouho to trvalo?“ | Většinou schvaluje mateřská firma, nebo nákup trvá déle než 2 měsíce |
| H10 | Tištěné díly, které letí, jsou běžné a tisknou se na tiskárnách Prusa | „Tisknete díly, které letí? Na čem?“ | Sériové díly na tiskárnách Prusa tisknou méně než 2 z 10 |
| H11 | Malé firmy vedou šarže v Excelu, ne v Odoo s výrobními příkazy | „Kde se zapíše, která šarže šla do kterého kusu?“ | Většina má Odoo s výrobními příkazy. Pak stavíme Odoo modul |
| H12 | Je poptávka po zakázkovém vývoji | „Máte software, na který nemáte kapacitu?“ | Konkrétní zakázku na příští 2 měsíce má 0–1 z 15 |
| H13 | Distributoři dávají zemi původu ke každé položce ve strojově čitelné podobě | Componentas a OneDrone: „Uvádíte zemi původu na faktuře nebo v API?“ | Odmítnou. Pak bude v pilotech víc ruční práce |

### Otázky na úřady a velké hráče

- **MO (H3/307):** „Kdo vyhrál tendry na drony a kdy jsou dodávky? Co budou další tendry chtít k původu a kvalitě?“
- **AOBP (H2/205), divize UAV a antidronů:** „Žádají členové o pomoc s dodacími doklady? Kdo z členů dodává armádě?“
- **EU pavilon (DG DEFIS, H1/121):** „Jak se bude podíl 65 % dokládat? Vyjde metodika?“
- **CSG a Omnipol:** „Co chcete od subdodavatelů k původu a kvalitě a v jaké podobě?“
- **ÚOSKSOJ (mimo veletrh):** „Co kontrolujete při konečné kontrole u malého výrobce dronů? Přijmete spis vytvořený nástrojem?“

### Rizika

| Riziko | Dopad | Co s tím |
|---|---|---|
| Nejsme z oboru: nezažili jsme audit AQAP ani nestáli na lince | Manažer kvality pozná mělkost za 5 minut | Poradce pro AQAP do týdne 3. Ptát se na minulost. Pilot dělat vždy na skutečné dodávce |
| Druhá evidence vedle Odoo | Auditor najde rozpory mezi systémy | U Odoo jen číst. O Odoo modulu rozhodnout podle H11 |
| Firma s certifikací AQAP má ověřený a schválený papírový postup | Nekoupí, i když se jí nástroj líbí | Cílit na firmy s první obrannou zakázkou. Nabídnout hotový text postupu, ověřovací protokol, souběh na jedné dodávce, export a escrow |
| Citlivá data: kusovník vojenského dronu | Data nedostaneme | Pracovat u zákazníka, data neopustí firmu, NDA. Nikdy neoslovovat jeho dodavatele |
| Odběratelům stačí prohlášení o původu | Část o původu nikdo nezaplatí | Původ je jen část spisu. Hlavní hodnota je spis a hledání zpět |
| Malý trh v ČR | Nedorosteme | Rozšířit se na všechny malé dodavatele pod AQAP a do Polska, Pobaltí a Německa. Jinak zůstat malou ziskovou firmou |
| Zakázky sežerou všechen čas | Produkt nevznikne | Zakázky nejvýš 50–60 % času. Pilot a vývoj pro stejnou firmu vždy odděleně |
| Jsme dva, co když skončíme | Zákazník se bojí na nás spolehnout | Data na jeho serveru, export kdykoli, escrow |
| Vývozní kontrola softwaru | Bez povolení nelze dodávat na Ukrajinu | Dotaz na MPO v týdnech 3–4 |
| Ukrajinský zákazník nezaplatí | Ztráta času | Jen s platbou předem |

---

## 13. Co nám řekli kritici a jak jsme to zapracovali

Skicu hodnotili dva kritici:
- **Vedoucí výroby** z firmy s certifikací AQAP-2110, která používá Odoo. Nástroj by koupil „možná, spíš ne“.
- **Investor z obranného fondu.** Dnes by do nás neinvestoval.

| Výtka | Co jsme změnili |
|---|---|
| Odoo už umí šarže ve výrobních příkazech i původ na šarži (aplikace za zhruba 49 USD), takže by vznikla druhá evidence | Opravili jsme tvrzení „ERP to neumí“. U Odoo jen čteme. O Odoo modulu rozhodneme v týdnu 11–12 |
| Chybí příjem zboží, přitom díly chodí bez šarže | Nová schopnost: příjem se štítkem, původ a expirace z faktury, vstupní kontrola |
| 10–15 skenů na kus a žádný offline režim | Kity (2 skeny), spotřební materiál přes časové okno, offline tablet, papírová záloha, „pustit s příznakem“ |
| Firmware se nahrává v grafickém nástroji a otisk souboru na notebooku nic nedokazuje | Agent čte ID desky, verzi a nastavení přímo z desky. Každé přehrání je nový záznam |
| Chybí opravy, vratky a změny konstrukce | Stavy až po „vrácený“, „v opravě“ a „vyřazený“. Oprava kusu. Změna konstrukce se seznamem kusů k dodatečné úpravě |
| „Neměnný“ log nejde opravit, řetěz otisků nikdo nechce a klíč Ed25519 kontrolor nebere | Oprava = storno + nový zápis s důvodem a schvalovatelem. Řetěz otisků jen interně. Podpis rukou nebo kvalifikovaným podpisem zákazníka |
| 20 CoC na dodávku je zbytečných a chybí celý spis | Jedno CoC na dodávku a k němu celý dodací spis. Ukrajinský certifikát ke kusu. Připomínka konečné kontroly 10 pracovních dní předem |
| Uvolňování po jednom kusu brzdí a montér nesmí uvolňovat | Uvolnění výjimkou jedním podpisem a oddělení rolí |
| Původ je moc zjednodušený a SAFE je u malých firem zbožné přání | Původ z faktur a celních dokladů. Hlavní výstup je po kategoriích dílů. Procento je volitelné, bez cen a s vypsanými pravidly |
| „Co kdyby“, portál pro dodavatele a NDAA/USA jsou k ničemu. „Design authority“ se navíc na drony třídy 1 nevztahuje | Vypuštěno z MVP i z pitche |
| Modul Prusa stojí na early access verzi a podpis tiskových souborů jsme nedoložili | Modul tisku je mimo MVP. Prusa podle své dokumentace ověřuje podpis firmwaru. O podpisu tiskových souborů jsme nic nenašli, takže to tvrzení neopakujeme |
| Ušetřený čas předplatné nezaplatí | Prodáváme snížení rizika. Cena je navázaná na dodávky a odběratele |
| Pilot, ve kterém obvoláme dodavatele zákazníka, je nepřijatelný | Zrušen. Pilot = spis pro skutečnou příští dodávku, z dat, která firma už má, a přímo u ní |
| Hostování výrobních dat je nepřijatelné | Výchozí je server u zákazníka. Hostovaná instance jen pro demo |
| Rozsah je příliš velký a stavět před objednávkou je plýtvání | 6 tenkých schopností. Žádný produkční kód před první objednávkou. Stavíme jen to, co pilot zaplatil |
| Měkké kritérium ukončení | Vyfakturované objednávky, aspoň jedna zaplacená. LOI bez ceny se nepočítá. Pilot odděleně od zakázek |
| Chybí poradce, obchodní kanál, velikost trhu a obhajitelnost | Poradce pro AQAP do týdne 3. Kanály: konzultanti, distributoři, partner Odoo, AOBP. Upřímný odhad trhu a teze, čím se bránit |
| Chybí seznam cílů | Vítězové a subdodavatelé tendrů MO. Na veletrhu hlavní otázka „máte dodávku do 90 dnů?“ |
| Obava ze závislosti na malé firmě a z bezpečnosti | Balíček pro důvěru kupujícího: export, escrow, offline aktualizace, text postupu, odpovědi pro NIS2 |

### Kde se kritici neshodli a jak jsme rozhodli

- **Hostování.**
  - Investor chtěl pro piloty hostovanou instanci, vedoucí výroby ji odmítá.
  - **Rozhodnutí:** server u zákazníka. Je to dražší, ale jinak data nedostaneme.
- **Odoo.**
  - Vedoucí výroby chce konektor hned v pilotu, investor až po platícím zákazníkovi s Odoo.
  - **Rozhodnutí:** čtení z Odoo jen v pilotu u firmy, která Odoo má. Plný modul až podle H11.
- **Demo.**
  - Investor chce tři obrazovky, vedoucí výroby realistický kusovník a spis.
  - **Rozhodnutí:** tři obrazovky na realistických datech a k tomu spis v PDF.

---

## Příloha A: Návrhy názvu

**Než název použijeme:**
- Ověřit ho v ÚPV a EUIPO (rejstříky ochranných známek, vyhledávač TMview).
- Zkontrolovat volné domény .eu, .cz a .com.

1. **Evida** (doporučený pracovní název).
   - Česky „evidence“ znamená záznamy, anglicky „evidence“ znamená důkaz. Přesně to produkt dělá.
   - Rychlé hledání nenašlo software pro sledovatelnost ani obranu s tímto jménem.
   - Mimo obranu firma s podobným jménem existovat může (neověřeno).
2. **Atest.**
   - Česky je „atest“ osvědčení o zkoušce (výrobci znají „atest materiálu“), anglicky „attest“ znamená doložit.
   - Nevýhoda: anglicky se dá přečíst jako „a test“.
3. **Genea.** Odkazuje na genealogii, tedy rodokmen kusu. Srozumitelné česky i anglicky.
4. **Provena.**
   - Česky „provenience“, anglicky „provenance“; obojí znamená původ.
   - Pod tímto jménem existuje výzkumný nástroj australské CSIRO, mimo obranu.
   - Hodí se méně, protože původ už není hlavní příběh.

**Vyřazeno:** „Konforma“. Pod jménem „Konforme“ existuje francouzský software pro plnění předpisů.

## Příloha B: Mini slovníček na veletrh

| Pojem | Co znamená |
|---|---|
| Dodací spis | Všechny doklady, které jdou s dodávkou: CoC, protokoly zkoušek, balicí list, prohlášení o trvanlivosti a o původu |
| CoC (prohlášení o shodě) | Podepsaný doklad výrobce, že dodaný výrobek odpovídá smlouvě. AQAP ho vyžaduje při uvolnění |
| Kusovník (BOM) | Seznam všech dílů a jejich množství pro jeden kus |
| Šarže (lot) | Skupina dílů nebo materiálu vyrobená a sledovaná společně |
| Kit | Sada dílů pro jeden kus, připravená předem pod jedním kódem |
| Rodokmen (as-built) | U jednoho sériového čísla přesně které díly, šarže, firmware, zkoušky a lidé |
| Zlatá konfigurace | Schválená verze firmwaru a nastavení, se kterou se každý kus porovnává |
| Neshoda (NCR) | Záznam, že něco neodpovídá specifikaci, a rozhodnutí: šrot, oprava, nebo použití s výjimkou |
| Výjimka (koncese) | Souhlas odběratele dodat něco mimo specifikaci. Při SOJ ji schvaluje zástupce státu |
| Změna (ECO) a retrofit | Formální změna konstrukce, od kterého kusu platí, a dodatečná úprava už dodaných kusů |
| AQAP 2110 / 2310 | Natovské požadavky na kvalitu ve smlouvách (česky ČOS 051672 a 051674) |
| SOJ / ÚOSKSOJ | Státní ověřování jakosti: zástupce státu kontroluje dodavatele místo kupujícího |
| Hlavní dodavatel (prime) | Firma se zakázkou od armády, která nakupuje od subdodavatelů |
| SAFE / EDIP, pravidlo 35 % | Evropské peníze na obranu. Součástky mimo EU, EHP a Ukrajinu smí tvořit nejvýš 35 % ceny součástek konečného výrobku |
| GNSS | Satelitní navigace (GPS, Galileo a další) |
| MPN | Katalogové číslo dílu u výrobce |
| ERP / MES / Odoo | Podnikový systém / systém pro řízení linky / rozšířené open-source ERP |
| Kvalifikovaný podpis | Elektronický podpis s kvalifikovaným certifikátem (například od I.CA nebo PostSignum), rovnocenný vlastnoručnímu |
| Escrow | Úschova zdrojového kódu u třetí strany pro případ, že dodavatel skončí |
| LOI | Letter of intent, písemný závazek zájmu. Bez ceny a termínu ho za objednávku nepočítáme |
| NATO třída 1 | Bezpilotní prostředky do 150 kg |

## Zdroje

**Pravidla, úřady, zakázky**
- AQAP-2110 Ed D: https://www.difesa.it/assets/allegati/34116/aqap-2110_edd_v1_e.pdf
- Metodika SOJ MP SOJ-2/24: https://ossoj.mo.gov.cz/sites/ossoj/files/2026-06/MP_SOJ-2_24-%C3%9A%C5%99%20OSK%20SOJ_3.pdf
- Tendr MO na multikoptéry (27. 11. 2025): https://ekonomickydenik.cz/armada-nakoupi-stovky-dronu-za-pul-miliardy/
- Tendr: 42 + 400 dronů, dodávky do konce 2026 (31. 12. 2025): https://defence24.com/defence-policy/the-czech-republic-is-investing-eur20-million-in-drone-systems
- AČR: 3 000 dronů do 2028, pět tendrů (18. 4. 2026): https://english.radio.cz/czech-army-plans-acquire-3000-drones-2028-8883960
- Ukrajinský certifikát kvality ke každému kusu: https://dev.ua/en/news/kabmin-dozvolyv-pryimaty-drony-ta-reb-bez-uchasti-derzhzamovnyka-teper-dosyt-sertyfikata-iakosti-1749737932
- SAFE (nařízení 2025/1106): https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32025R1106
- SAFE pro ČR: https://www.consilium.europa.eu/it/press/press-releases/2026/04/10/safe-final-green-light-for-financial-assistance-to-czechia-and-france/
- EDIP: https://data.consilium.europa.eu/doc/document/PE-52-2025-INIT/en/pdf
- NIS2 v ČR (vyhláška 408/2025): https://portal.nukib.gov.cz/storage/uploads/2025/12/03/duvodova-zprava-vyhlaska-regulovane-sluzby_uid_69303a3285993.pdf
- FCC Covered List: https://insideunmannedsystems.com/fcc-carves-out-blue-uas-and-buy-american-drones-from-foreign-drone-ban/ a https://www.wiley.law/alert-FCC-Issues-Exemptions-Clarifications-for-Sweeping-Prohibition-of-Foreign-Made-Drones (neověřeno)

**Technika a výroba**
- Betaflight CLI (`diff all`, `dump`): https://betaflight.com/docs/development/Cli
- MAVLink AUTOPILOT_VERSION (verze firmwaru, UID desky): https://mavlink.io/en/messages/common.html
- UID čipů STM32 nemusí být unikátní: https://community.st.com/stm32-mcus-products-25/possible-counterfeit-stm32f405-nearly-identical-mcu-ids-on-two-betaflight-flight-controllers-153169
- Prusa ověřuje podpis firmwaru: https://help.prusa3d.com/article/signature-verification-failed-31606-core-one-35606-core-one-l-26606-mk4s-13606-mk4-27606-mk3-9s-21606-mk3-9-28606-mk3-5s-23606-mk3-5_401109
- Licence OCL v1.1: https://blog.prusa3d.com/open-community-license-v1-1-the-new-plugin-system-more-examples-and-your-questions-answered_137202/
- Prusa Connect Local: https://www.prusa3d.com/p/prusa-connect-local/early-access/
- Vyriy, výrobní linka: https://dou.ua/lenta/articles/lean-flow-fpv-vyriy/

**Konkurence a ceny**
- Odoo, původ na šarži (48,66 USD, verze 17–19): https://apps.odoo.com/apps/modules/18.0/fal_origin_of_goods
- Odoo, sledovatelnost v Odoo 18 (blog partnera; ověřit na živé instanci): https://www.nalios.com/en/blog/what-s-new-in-odoo-6/optimise-accuracy-and-ensure-total-traceability-new-odoo-18-features-for-compliant-and-efficient-warehouse-management-72
- Odoo, ceník: https://www.odoo.com/pricing-plan
- Tulip, ceník: https://tulip.co/pricing/
- Siemens Opcenter X: https://www.siemens.com/en-us/products/opcenter/opcenter-x
- First Resonance (odhad ceny): https://www.itqlick.com/first-resonance-ion/pricing
- Kentigen: https://www.kentigen.com/en/industries/defense/
- Platy inženýrů kvality: https://www.platy.cz/platy/management-kvality/inzenyr-kvality

**Trh a investoři**
- Presto Ventures a CSG: https://siliconcanals.com/presto-ventures-and-csg-launch-e150m-fund/
- AOBP: https://aobp.cz/en/

**Veletrh**
- https://www.futureforcesforum.com/
- Registrace: https://www.futureforcesforum.com/events/registration
- Seznam vystavovatelů: https://www.future-forces.org/exhibitors/list/state/cze?lang=en

**Naše strategické poznámky:** /home/user/Idkyet/ideas/software-nejdriv.md, /home/user/Idkyet/ideas/obrana-3d-tisk.md

*Poznámka k poznámkám:* soubor software-nejdriv.md tvrdí, že „tiskárny Prusa už samy kontrolují podpis tiskových souborů“. Doložené máme jen ověřování podpisu firmwaru. Tvrzení je třeba v poznámkách opravit nebo označit jako neověřené.
