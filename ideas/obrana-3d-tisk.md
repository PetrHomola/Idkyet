# Obrana + 3D tisk: co s tím můžeme udělat

*Podklad k tátově zprávě a článku Sinopsis „Jak Čína tiskne budoucnost“ (říjen 2026). Stav k 18. 10. 2026.*

## Shrnutí

- Táta má pravdu v hlavní věci: drahé střely proti levným dronům jsou neudržitelné a obrana teď opravdu utrácí.
  Jenže trh si toho všiml už před námi. Levné stíhací drony (interceptory) za 2–5 tis. USD už Ukrajina vyrábí ve velkém
  a v Evropě je na ně deset a více startupů s financováním v desítkách milionů EUR.
- **Nedoporučuju stavět vlastní dron.** Ukrajinci jsou levnější, rychlejší a mají zpětnou vazbu z fronty.
  V Česku už to dělají 3DFENSE (Brno), LPP nebo TRL Drones.
- **Doporučuju „prodávat lopaty zlatokopům“:** stavět to, co potřebují všichni výrobci a armády, a co z článku přímo vyplývá.
  Nejsilnější kandidát je **bezpečný, nečínský 3D tisk pro armády** (software + certifikované díly),
  hlavně protože česká armáda si právě nakoupila čínské tiskárny Bambu Lab a USA i Británie už je řeší jako bezpečnostní riziko.
- Hlavní neznámá: co umíte vy dva s Benem a za kým přesně může jít táta. Na tom závisí, který nápad vybrat (viz otázky na konci).

## Co z článku a tátovy zprávy platí a co upřesnit

| Tvrzení | Realita | Zdroj |
|---|---|---|
| Ukrajina vyrábí ~5 mil. dronů ročně | Sedí. 2025 odhad ~4 mil., plán na 2026 je 7 mil., Zelenskyj mluví o kapacitě 10 mil. | Euromaidan Press, TechRadar |
| Patriot stojí miliony a vyrábí se ~1 000 ročně | Řádově sedí. Lockheed dodal ~620 PAC-3 MSE v roce 2025, cíl je ~2 000/rok. Cena vychází zhruba na 4–5 mil. USD za kus (odhad z kontraktů). | The Aviationist, Grosswald |
| Tomahawk se používá proti dronům | Ne, Tomahawk je útočná řízená střela, ne protivzdušná obrana. Pointa o drahých střelách ale platí. | |
| Proti levným dronům se střílí drahými střelami | Ukrajina už přešla na **interceptor drony** za ~2–5 tis. USD. V lednu 2026 připadlo 70 % sestřelů Shahedů na ně. | Euromaidan Press, DroneXL |
| Čína má 90 % trhu tiskáren | Platí pro tiskárny do 2 500 USD (2025). Bambu Lab sám má 37 %. | Sinopsis |
| Armáda má fůru peněz a nemá je za co utrácet | V Evropě a NATO ano (cíl 3,5 % HDP do 2035, evropské defense startupy získaly 8,7 mld. USD v roce 2025). **Česko ale ne:** rozpočet MO 2026 je ~155 mld. Kč, ~1,7 % HDP, a vláda ho zvyšovat nechce. Takže cílit na celé NATO/EU a Ukrajinu, ne jen na AČR. | Euronews, Vestbee |

## Proč ne „další dron“

- **Cena a objem:** Ukrajinci vyrábí miliony kusů ročně za ceny, které malá česká firma neporazí.
- **Konkurence u nás:** 3DFENSE už ukazuje kontejnerovou továrnu na 3D tištěné drony (1 600 ks/měsíc),
  TRL Drones má protidronový systém i vlastní interceptor, LPP útočný dron.
- **Konkurence v Evropě u interceptorů:** Cambridge Aerospace (UK), TYTAN (DE), Frankenburg (EE), Alta Ares a Egide (FR),
  Nordic Air Defence. Kola financování v desítkách milionů EUR.
- **Regulace:** výroba a prodej vojenského materiálu vyžaduje licenci (MPO, zákon 38/1994 Sb.), prověrky a vývozní povolení.
  Pro dva lidi na začátku je to obrovská zátěž.

## Nápady seřazené podle toho, jak dobře sedí

### 1. Bezpečný 3D tisk pro armády („sovereign print farm“) ⭐ doporučuju

**Problém:** Armády (včetně české) tisknou náhradní díly a části dronů na čínských tiskárnách napojených na čínský cloud.

- USA: zákon NDAA 2026 (§ 849) zakazuje Pentagonu nakupovat 3D tiskárny od firem z „rizikových zemí“.
- Británie: ministr obrany nařídil vyšetřování poté, co vojáci tiskli FPV drony na Bambu Lab během cvičení v Keni.
- Česko: MO koupilo Bambu Lab pro 102. průzkumný prapor a Univerzitu obrany, přičemž NÚKIB v roce 2025 varoval
  před předáváním dat do Číny a vzdálenou správou odtamtud.
- Útok na integritu dat je reálný: už v roce 2017 výzkumníci ukázali upravený model vrtule, který vypadá normálně, ale za letu praskne.

**Řešení:** Softwarová vrstva + hardware od nečínského výrobce (ideálně **Prusa**, česká firma, které čínská konkurence přímo škodí):

- správa tiskové farmy **offline / v uzavřené síti**, bez cloudu,
- **podepsané a ověřené tiskové soubory** (nikdo nepodstrčí upravený díl),
- auditní stopa (kdo, co, kdy, z jakého materiálu tiskl) a kontrola kvality,
- volitelně mobilní „tiskárna v kontejneru / v bedně“ pro jednotky v poli.

**Zákazník:** AČR (logistika, průzkumníci, Univerzita obrany), další armády NATO, Ukrajina, obranné firmy (CSG, Excalibur Army)
a civilní kritická infrastruktura (energetika, letectví), protože problém je stejný.

**Proč to sedí:**

- Vyplývá přímo z článku a regulace jde naším směrem.
- Je to hlavně software: levný start, žádná licence na zbraně, dual-use, takže firma přežije i konec války.
- Česká výhoda: Prusa je za rohem a AČR má čerstvě problém, který se dá ukázat na vlastním příkladu.

**Riziko:** Prusa si to může postavit sama, takže od začátku jednat o partnerství. Existují civilní nástroje pro správu tiskových farem
(SimplyPrint, OctoFarm) a americká Firestorm Labs dělá expediční výrobu dronů, ale bezpečnostní evropskou verzi pro armády zatím nikdo nevlastní.

### 2. Katalog ověřených náhradních dílů („digitální sklad“)

**Problém:** Jednotky tisknou díly ze souborů z internetu, bez ověření pevnosti, materiálu a licence od výrobce.

**Řešení:** Knihovna otestovaných tiskových souborů pro drony a vybavení: ověřené profily tisku, materiál, kontrolní postup.
Výrobci (OEM) licencují své díly „za každý vytisknutý kus“ místo toho, aby je vozili ze skladu.

**Proč to sedí:** Přirozeně navazuje na nápad 1 (podepsané soubory) a dohromady tvoří platformu. Je to obchodní model s opakovanými příjmy.

**Riziko:** Přesvědčit výrobce, aby dali své CAD soubory třetí straně. Začít s jedním výrobcem dronů, ideálně ukrajinským nebo českým.

### 3. Levné cvičné cíle pro protidronovou obranu

**Problém:** Desítky protidronových firem a každá armáda potřebují **hodně levných a realistických cílů** na testování a výcvik.
Skutečné drony jsou drahé a nehodí se.

**Řešení:** 3D tištěné cvičné drony, které napodobují různé typy hrozeb (rychlost, velikost, radarový odraz), **bez nálože**.
Mimochodem, i čínský AECC zmiňovaný v článku vyvíjí motory mimo jiné pro návnady k výcviku protivzdušné obrany.

**Proč to sedí:** Prodáváme celému protidronovému boomu, ne proti němu, a 3D tisk je tu výhoda (rychlé varianty, nízká cena).

**Riziko:** Je to hardware, takže pomalejší a dražší vývoj. I cvičný cíl může spadat pod vojenský materiál, to je třeba ověřit u MPO.

### 4. Software pro detekci dronů (jen pokud jeden z vás umí real-time data a ML)

Největší trh, ale nejvíc přeplněný. Fúze senzorů, rozpoznání typu dronu, predikce trasy.
V Česku už je Dronetag (detekce, vybraný do evropského akcelerátoru EUDIS) a TRL Drones. Dává smysl jen s jasnou technickou výhodou.

## Co udělat v příštích 30 dnech

1. **Vyjasnit si s Benem, co oba umíte a kolik času do toho dáte.** Software, hardware, prodej? Podle toho vybrat 1–2 nápady.
2. **Zeptat se táty, za kým přesně chce jít:** někdo z MO / nákupu, majitel obranné firmy, investor? Kontakt na logistiku AČR = nápad 1.
   Kontakt na zbrojovku = partnerství. Investor = nejdřív potřebujeme ověřený problém.
3. **10–15 rozhovorů se zákazníky, ještě než cokoli postavíme.** Kdo tiskne díly v AČR (102. průzkumný prapor, Univerzita obrany),
   ukrajinské dobrovolnické tiskové sítě, Prusa Research (obchod/B2B), protidronové firmy (pro nápad 3).
   Otázky: co tisknou, na čem, co je bolí, kdo rozhoduje o nákupu, kolik by zaplatili.
4. **CzechInvest Defence Hub:** zdarma konzultace a příprava přihlášek do NATO DIANA, Evropského obranného fondu a NATO Innovation Fund.
   Sledovat výzvu DIANA Challenge 2027.
5. **Brave1 „Test in Ukraine“:** program ukrajinské vlády, kde zahraniční firmy testují produkty v reálných podmínkách.
   Pro pozdější fázi.
6. **Právo:** u nápadů 1 a 2 (software) nejspíš stačí hlídat dual-use regulaci EU. U nápadů 3 a 4 hned zjistit, jestli nepotřebujeme licenci MPO na vojenský materiál.

## Upřímně k penězům

- **Táta by do toho neměl dávat všechny peníze.** Obranné startupy mají dlouhé prodejní cykly (pilot → certifikace → nákup trvá i 2–5 let),
  dividendy budou za dlouho, pokud vůbec. Rozumnější je malá částka na start a ověření problému, pak defense VC fondy (NATO Innovation Fund, Plural, Armira apod.),
  které teď do Evropy aktivně investují.
- **Český rozpočet MO letos neroste,** takže byznys nesmí stát jen na AČR. Cílit od začátku na NATO, EU a Ukrajinu.
- **Etika a osobní pohodlí:** stojí za to si s Benem otevřeně říct, kde je vaše hranice (obrana vs. útočné zbraně). Nápady 1–3 jsou na defenzivní / logistické straně.

## Otázky, které musíme zodpovědět

1. Co je teď váš byznys s Benem a co z něj jde přenést (lidi, technologie, zákazníci)?
2. Kdo z vás umí software, kdo hardware, kdo prodávat?
3. Za kým přesně může jít táta a co ten člověk umí otevřít (nákup, investice, partnerství)?
4. Chceme dělat věci, které zabíjí, nebo jen ty, které chrání a zásobují?
5. Kolik času a peněz do toho můžeme dát, než budeme potřebovat první příjmy?

## Zdroje

- Sinopsis: [Jak Čína tiskne budoucnost](https://sinopsis.cz/jak-cina-tiskne-budoucnost-vzestup-3d-tisku-jako-strategicke-technologie/)
- Produkce dronů na Ukrajině: [Euromaidan Press](https://euromaidanpress.com/2026/01/26/ukraine-aims-to-build-7-million-drones-in-2026-70-times-more-than-the-us), [TechRadar](https://techradar.com/pro/ukraine-confirms-it-will-produce-10-million-drones-in-2026-rising-to-20-million-as-it-signs-a-massive-usd1-1-billion-drone-deal-with-the-eu)
- Patriot PAC-3 MSE: [The Aviationist](https://theaviationist.com/2026/01/06/lockheed-martin-pac-3-mse-production-2000-year/), [Grosswald](https://www.grosswald.org/us-army-lockheed-martin-4-76-billion-pac-3-mse-contract-94-percent-foreign-military-sales-2000-interceptors-2030/)
- Interceptor drony: [Euromaidan Press](https://euromaidanpress.com/2026/07/01/russias-shaheds-cost-10000-each-ukraine-just-unveiled-drone-that-kills-them-for-2000/), [DroneXL](https://dronexl.co/2026/03/01/ukraine-is-scaling-up-interceptor-drones-as-russias-shahed-threat-outpaces-every-defense)
- Evropské interceptor startupy: [Vestbee](https://www.vestbee.com/insights/articles/europ-s-defence-top-deals-in-early-2026), [Resilience Media (Egide)](https://resiliencemedia.co/egide-lands-e8m-to-build-low-cost-interceptors-as-europe-races-to-counter-drone-swarms/), [UAS Vision](https://www.uasvision.com/2026/07/17/uk-selects-three-companies-to-develop-low-cost-drone-interceptors/), [NewMarketPitch](https://newmarketpitch.com/blogs/news/counter-uas-funding-analysis)
- České firmy: [3DFENSE (Militarnyi)](https://militarnyi.com/en/news/mobile-factory-for-uav-production-was-developed-in-czech-republic/), [TRL Drones](https://thedefensepost.com/2026/03/27/czech-system-drone-defense/), [Dronetag / EUDIS](https://www.suasnews.com/2026/03/dronetag-becomes-the-first-czech-company-selected-for-the-eudis-business-accelerator/), [AdriaDefense](https://www.adriadefense.com/7-czech-defense-tech-startups-and-scaleups-to-watch-in-2026/)
- Zákaz čínských tiskáren: [King & Spalding (NDAA 2026)](https://www.kslaw.com/insights/articles/fy-2026-ndaa-domestic-sourcing-artificial-intelligence-cybersecurity-and-acquisition-reforms), [Fabbaloo](https://www.fabbaloo.com/news/ndaa-2026-expands-additive-manufacturing-mandates-while-banning-use-of-chinese-made-am-equipment), [3D Printing Industry (UK MoD)](https://3dprintingindustry.com/news/mod-probes-security-risks-of-chinese-3d-printers-in-military-exercises-251119/)
- Český rozpočet na obranu: [Euronews](https://euronews.com/2026/03/12/czech-2026-budget-passes-but-defence-outlays-fall-short-of-nato-pledge), [The Defense Post](https://thedefensepost.com/2026/03/21/czech-2026-budget-nato/amp/)
- Podpora startupů: [CzechInvest Defence Hub](https://czechinvest.gov.cz/en/Key-sectors/defence-hub), [Brave1 Test in Ukraine](https://thedefensepost.com/2025/07/21/test-in-ukraine-program)
