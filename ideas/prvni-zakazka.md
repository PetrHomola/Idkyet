# Jak získat první zakázku

*Pro Petra a Bena. Stav k neděli 18. 10. 2026. Revidovaná verze podle kritiky CTO obranného startupu a upravená podle vaší situace: oba umíte backend, data a web, máte IČO a oba jste zaměstnaní. Navazuje na [software-nejdriv.md](software-nejdriv.md) a opravuje v něm sazby, kód NCAGE a pořadí kroků. Co není ověřené, je označené „ověřit“.*

## Shrnutí

- **Cíl:** podepsaná placená objednávka do **pátku 6. 11. 2026**. Tak rychle to půjde reálně jen přes tátovy kontakty a s malým pilotem, který CTO podepíše sám. **Poslední termín je pátek 20. 11.** U studených kontaktů čekejte podpis spíš koncem listopadu nebo v prosinci (odhad CTO, ověřit).
- **Co prodáváme:** jeden samostatný nástroj kolem produktu, ne jeho zbraňovou část. Dělá ho **1 člověk, asi 80 hodin během 4 týdnů (večery a víkendy), za pevných 75 000 Kč bez DPH**, v odděleném repozitáři, který patří klientovi. Fakturuje se ve dvou částkách (po 2 a po 4 týdnech) až po převzetí. Po první polovině může klient skončit a zaplatí jen ji. **Že pracujete po večerech, řekněte rovnou.**
- **Nejdůležitější kanál jsou tátovy kontakty.** Nejde o jeden kanál z jedenácti, rozhodne se tam celá věc. Studená zpráva od „dvou seniorních vývojářů“ skončí na hromadě s nabídkami offshore agentur.
- **Než cokoli odešlete, vyplňte důkazy:** celá jména, LinkedIn se zaměstnavateli a roky, jeden dodaný systém s čísly, veřejné repo a dva lidé, kteří vás tento týden doporučí po telefonu. Prázdná závorka „[X] let praxe“ zatím *je* celá vaše nabídka.
- **Dnes večer a v pondělí ráno:**
  - Táta vybere 3–5 kontaktů a pošle text C.
  - Vyřešíte dostupnost a souhlas zaměstnavatele (§ 304 ZP).
  - Ohlásíte živnost.
  - Předem si domluvíte desetiminutové schůzky na veletrhu. Nebudete lidi u stánků přepadat.
- **Plán B:** subdodávka webové nebo datové části pro softwarové dodavatele ministerstva obrany (AURA, PragoData, Be a Future, GEPRO). Spustíte ho souběžně **od pondělí 26. 10.**, s čekáním na 20. 11. nemá smysl.

---

## Vaše situace: co to mění (čtěte jako první)

Průzkum počítal s tím, že aspoň jeden z vás může na zakázce pracovat na plný úvazek. Vy jste ale oba zaměstnaní, takže v celém dokumentu platí tyto úpravy:

- **Pilot S:** 1 člověk, **asi 80 hodin během 4 týdnů**, tedy zhruba 20 hodin týdně. Cena zůstává 75 000 Kč, platí se ve dvou částkách po 37 500 Kč (po 2. a po 4. týdnu). Klient může skončit po první polovině. Kde texty píšou „10 dní“, myslí se tím tento pilot.
- **Dostupnost řekněte hned na první schůzce:** „Oba máme stálou práci. Na vašem nástroji pracujeme večer a o víkendech, zhruba 20 hodin týdně, a odevzdáváme ve čtvrtek večer.“ Pro samostatný nástroj v odděleném repu to CTO nevadí. Vadilo by mu, kdyby to zjistil až později.
- **Balíček B** (lidé do týmu klienta na plný úvazek) **teď nenabízejte.** Místo něj nabídněte retainer kolem 40 hodin měsíčně, pokud o něj klient stojí.
- **Balíček C** (1–2 dny u klienta) a **veletrh (st–pá)** znamenají dovolenou. Domluvte si v pondělí ráno volno aspoň na 1–2 dny veletrhu, ideálně středu a čtvrtek.
- **Souhlas zaměstnavatele:** § 304 ZP vyžaduje písemný souhlas jen pro vedlejší podnikání **ve stejném oboru** jako zaměstnavatel. Obrana asi váš obor není. Přesto si projděte pracovní smlouvy (zákaz konkurence, zaměstnanecká díla, vedlejší činnost) a **požádejte zaměstnavatele o krátké písemné potvrzení, že nemá námitky.** CTO to bude chtít kvůli čistým právům ke kódu. Nikdy nepoužívejte notebook, čas ani kód zaměstnavatele.
- **IČO už máte,** takže živnost neohlašujete. **Paušální daň nepůjde** (příjem ze zaměstnání nad 50 000 Kč), zůstanete v běžném režimu s výdajovým paušálem. Ověřte si to s účetní.
- **Stack:** píšete jen to, co opravdu umíte (backend, data, web). **Vypadávají cíle postavené na C/C++, embedded nebo ROS2:** esc Aerospace, SII, Fly4Future, ELDIS a EVPÚ. **Stoupají firmy s webovou a datovou prací:**
  - **TRL** (Python, REST, webové GUI),
  - **VR Group** (React a OpenLayers),
  - **EAGLE.ONE** (API a integrace),
  - **ERA** (automatizace testů v Pythonu),
  - **softwaroví dodavatelé MO** (informační systémy, weby).
- **Demo do úterý je při práci těsné.** Udělejte menší verzi: webový přehrávač tras na mapě s časovou osou, nad syntetickými daty ve formátu Remote ID / OpenDroneID. To je přesně backend + data + web. Když to nestihnete, stačí dvouminutové video toho, co máte, a ukázka kódu, kterým se chlubíte.

---

## Co by nás přesvědčilo (pohled CTO)

Verdikt CTO na původní verzi zněl „možná“. Aby z toho bylo „ano“, chtěl by tohle:

1. **Teplé představení** od někoho, komu věří: investor, člen boardu, bývalý kolega nebo zákazník, ideálně se slovy „ručím za ně“. Takový hovor si vezme ještě ten týden.
2. **Důkaz seniority ověřitelný za 30 vteřin:** celá jména, LinkedIn, jeden dodaný systém s čísly, veřejný kód a dva doporučující lidé, kteří tento týden zvednou telefon.
3. **Ukázku postavenou pro jeho produkt,** ne obecné dronové demo. U protidronové firmy je to rekordér a přehrávač tras ze senzorů pro integrační testy.
4. **Skoro nulovou zátěž pro jeho tým:** vzorová data a popis rozhraní, oddělené repo, kontrola na konci 1. a 2. týdne, nejvýš hodina týdně jednoho jeho inženýra.
5. **Jednu stranu o bezpečnosti, která odpovídá na jeho riziko:** kdo jste, kde pracujete, na jakých zařízeních, AI nástroje jen s jeho souhlasem, podepíšete jeho NDA. Váš seznam „co neděláme“ odpovídá na *vaše* riziko, ne na jeho.
6. **Cenu a formu, kterou podepíše sám:** 1 člověk, 75 000 Kč, fakturace po převzetí, možnost skončit v polovině. Původně 10 dní na plný úvazek, u vás 4 týdny po večerech. Za 140 000 Kč pro dva neznámé lidi už potřebuje druhý rozhovor a schválení.
7. **Poctivou dostupnost a čistá práva:** plný úvazek, nebo večery? Písemný souhlas zaměstnavatele hned na začátku, jinak jeho investor při due diligence najde „špinavý“ původ kódu.
8. **Pomoc s náborem:** „Dodáme nástroj teď, než najdete člověka, a čistě ho vašemu novému člověku předáme.“ O přechod jednoho z vás do zaměstnání po 1–3 měsících by sám stál.
9. **Čisté duševní vlastnictví:** projektový kód je po zaplacení jeho. Vaše knihovny jsou na krátkém výslovném seznamu. Písemně slíbíte, že jeho kód, data a výrobní údaje nikdy nepoužijete ve vlastním produktu.

**Co ho odradí:**
- obecné zprávy, které vypadají jako od agentury,
- červené čáry hned v první zprávě,
- „kód od prvního dne ve vašem repozitáři“,
- placená „diagnostika“ jeho kódu,
- záloha od financovaného startupu,
- „jsme levnější“,
- obyčejný PX4 report jako demo,
- přepadení u stánku, když mluví se zákazníkem,
- dva lidé na neznámém kódu,
- tlak na termín, dokud neřekl ano,
- vlastní šablony smluv s automatickým převzetím,
- průzkum pro vlastní produkt na jeho účet,
- vedlejší práce bez souhlasu zaměstnavatele.

---

## 1. Cíl a měřítko úspěchu

**Úspěch je** objednávka nebo smlouva podepsaná oběma stranami, s rozsahem, cenou a termínem. **Úspěch není** „máme zájem“, podepsaná NDA, memorandum ani „pošlete CV“.

| Co | Termín | Měřítko |
|---|---|---|
| **Hlavní cíl** | **pá 6. 11. 2026** | 1 podepsaný pilot S (75 000 Kč), nejspíš přes tátův kontakt |
| Poslední termín | **pá 20. 11. 2026** (4 týdny po veletrhu) | 1 podepsaná objednávka z jakéhokoli kanálu včetně plánu B |
| Plán B | od **po 26. 10.**, souběžně | subdodávkové e-maily softwarovým dodavatelům MO (AURA, PragoData, Be a Future, GEPRO) |
| Začátek práce | po 9. 11., nejpozději 16. 11. | kick-off, vzorová data a popis rozhraní od klienta |

**Předstihové ukazatele (kontrolovat každý večer):**

| Krok | Kolik | Do kdy |
|---|---|---|
| Hotové důkazy (jména, LinkedIn, systém s čísly, repo, 2 reference) | 100 % | po 19. 10. v poledne |
| Teplá představení od táty | 3–5 | čt 22. 10. |
| Předem domluvené desetiminutové schůzky na Future Forces | 4–6 | út 20. 10. večer |
| Rozhovory na veletrhu celkem | 25–30 | pá 23. 10. |
| Z toho jméno a kontakt na člověka, který vede software | 10 | pá 23. 10. |
| Navazující hovory s konkrétním datem | 6–8 | po 26. 10. |
| Obchodní schůzky (oddíl 7) | 4–5 | čt 29. 10. |
| Písemné nabídky s cenou | 3 | pá 30. 10. |
| Podpis | 1 | pá 6. 11. / pá 20. 11. |

**Pokud v pátek 23. 10. budete mít méně než 4 navazující hovory s datem,** spusťte v pondělí druhou vlnu oslovení. Poměry mezi kroky jsou odhad z běžného B2B prodeje, ne data z obrany. Že lidé u stánků jsou většinou obchodníci, ne vývojáři, je odhad CTO (ověřit).

---

## 2. Co nabízíme

**Věta, kterou říkáte všude:** „Dodáváme obranným a dronovým firmám nástroje, na které jejich vývojáři nemají čas: testovací, datové, výrobní a servisní software. Jeden člověk, čtyři týdny, pevná cena, samostatné repo. Hodí se hlavně ve chvíli, kdy nabíráte a ještě jste nikoho nenašli.“

### Než pošlete první nabídku: důkazy, dostupnost, bezpečnost

**Důkazy (vyplnit dnes, do one-pageru i do všech textů):**
- Celá jména a odkazy na LinkedIn se zaměstnavateli a roky.
- Tři konkrétní stacky, například Python/FastAPI, TypeScript/React, C++/Qt nebo ROS2. Pište jen ty, které opravdu umíte.
- Jeden dodaný systém s čísly („datová pipeline, N zpráv/s, 99,9 % dostupnost, 4 roky v provozu“).
- Jedno veřejné repo nebo ukázka kódu.
- Dva lidé, kteří vás **tento týden** doporučí po telefonu. Dnes jim zavolejte a zeptejte se, jestli můžou.
- Co z toho nemáte, nahraďte tím, co máte. **Obranné reference si nikdy nevymýšlejte.**

**Dostupnost (rozhodnout dnes, v nabídce vždy uvést):**
- Kdo z vás dělá pilot a kolik hodin týdně (u vás oba vedle zaměstnání, realisticky 15–20 h).
- Kdo je zaměstnaný a nemá písemný souhlas podle § 304 ZP, na zakázce nepracuje. Fakturuje a pracuje ten druhý sám.
- Klient se to nesmí dozvědět až později. Pro něj to znamená právní riziko a pro vás konec spolupráce.

**Rámeček „Bezpečnost a důvěra“ (patří do one-pageru, pravdivě a podle skutečnosti):**
- Oba jsme občané EU a pracujeme fyzicky v ČR (ověřit u Bena, napsat jen pokud platí).
- Práci nepředáváme subdodavatelům ani do zahraničí. Nemáme vazby na Rusko ani Bělorusko.
- Pracujeme jen na vyhrazených šifrovaných noteboocích, nebo na zařízeních od klienta. Všude máme MFA.
- AI nástroje nad vaším kódem použijeme jen s vaším písemným souhlasem.
- Hosting a repozitáře máme v EU. Na konci spolupráce data smažeme a smazání potvrdíme.
- Podepíšeme vaši NDA i převod práv. Ověření totožnosti nebo prověrka zázemí nám nevadí.
- **Seznam toho, co neděláme, sem nepatří.** Ten zazní až při schůzce, kde zjišťujete rozsah, a v objednávce.

### Tři balíčky

| Balíček | Pro koho | Co klient dostane | Cena bez DPH | Platby |
|---|---|---|---|---|
| **A. Pilot S (výchozí nabídka)** | startupy i střední firmy | 1 člověk, asi 80 hodin během 4 týdnů (večery a víkendy). Samostatný nástroj v **odděleném repozitáři, který vlastní klient.** Pracuje se na vzorových nebo anonymizovaných datech podle popisu rozhraní. Kontrola po 2. a 4. týdnu, demo a předávací dokumentace. Do hlavního repozitáře klienta až po první kontrole, a jen když to klient chce. | **75 000 Kč** fixně (7 500 Kč/MD) | 2 milníky po 37 500 Kč (po 2. a 4. týdnu), každý fakturovaný **po převzetí**, splatnost 14 dní. Když klient po první polovině skončí, platí jen 37 500 Kč. |
| ↳ Pilot M (jen na žádost) | když klient sám chce víc a úkol jde čistě rozdělit | 2 lidé, každý asi 80 hodin během 4 týdnů | **140 000 Kč** fixně | 2 milníky po 70 000 Kč, stejně jako u S |
| **B. Kapacita a překlenutí náboru** *(teď ne, jste zaměstnaní; místo toho retainer kolem 40 h/měsíc)* | firmy s otevřenými pozicemi, softwarové firmy se smlouvami s MO | 1–2 lidé do týmu klienta na 1–3 měsíce. Hotové věci čistě předáte nově přijatému člověku. Po 1–3 měsících je možný přechod jednoho z vás do zaměstnání (contract-to-hire). | **8 500 Kč/MD** (≈ 1 060 Kč/h). Retainer: 15 MD měsíčně na osobu za 7 900 Kč/MD, aspoň 3 měsíce. | fakturace měsíčně, splatnost 14 dní, výpověď 30 dní |
| **C. Mapování výroby a testů** | **jen** tradiční výrobci a velké skupiny (MSM, Excalibur, nováčci v obraně), ne startupy | 1–2 dny na místě: jak tečou data výrobou, jak funguje testovací stanice. Výstupem je návrh pilotu s pevnou cenou. **Nikdy ne revize kódu.** | **18 000 Kč** fixně | po předání, splatnost 14 dní. Když klient do 30 dnů objedná pilot, cenu odečtete. |

**Pravidla pro peníze:**
- **Zálohu nechtějte** od zavedené české firmy ani od financovaného startupu. Finance by ji u nové OSVČ označily jako varovný signál. **Zálohu 50 % chtějte jen** od nefinancovaného startupu nebo zahraničního či ukrajinského klienta, a to až po kontrole rejstříku, účetní závěrky a financování.
- **Spodní hranice je 7 000 Kč/MD.** Ustupujte v rozsahu, ne v ceně.
- **Pro interní orientaci:** medián vývojáře ve státních ICT zakázkách za 1. pololetí 2026 je 10 700 Kč/MD ([Tendergate, data MV ČR/EY](https://tendergate.ai/blog/software-day-rates-eu-27)). Medián seniora na tržišti Lemon.io je 38 USD/h ([Lemon.io](https://lemon.io/rate-calculator/czech/)). Vaše sazba 8 500 Kč/MD je střed trhu.
- **Klientovi „jsme levnější“ neříkejte.** Při ceně 75–140 tisíc pro něj cena není problém a „levný“ zní jako junior. Prodávejte „žádné řízení navíc, žádné zaškolování, žádný nábor“.
- Sazba 450–800 Kč/h ze [software-nejdriv.md](software-nejdriv.md) je příliš nízká.

**Vstup pro startupy:** místo diagnostiky se zeptejte na „jeden úkol z backlogu, který tam leží měsíce“, a ten dodejte jako pilot S.

### Demo do úterý 20. 10. (zbývá 1,5 dne, takže jedno a malé)

- **Hlavní demo, varianta 1: rekordér a přehrávač tras ze senzorů pro integrační testy.**
  - Pro koho: EAGLE.ONE, Cyber Drone Solutions, ERA, protidronová část TRL.
  - Co umí: načíst tracky v otevřených formátech, uložit je, přehrát je na časové ose s mapou a exportovat. K tomu generátor syntetických tras, protože každý integrační test potřebuje nahraná nebo syntetická data.
  - Formáty:
    - Remote ID / OpenDroneID,
    - radarové tracky ASTERIX,
    - SAPIENT (britské rozhraní pro protidronové senzory s veřejnou specifikací, [GOV.UK](https://www.gov.uk/guidance/sapient-autonomous-sensor-system); zda je to standard NATO, ověřit).
  - Pro demo stačí jeden formát a syntetická data.
- **Doplněk, varianta 2: jen jako jednostránkový diagram nebo pár obrazovek, ne kód.**
  - Pro koho: výrobci dronů (TRL, Fly4Future).
  - Co ukazuje: letový log → sériové číslo dronu → šarže komponent → „která šarže ESC vykazuje vyšší vibrace v N letech“. Žádný bezplatný nástroj tohle nepropojuje (tvrzení CTO, ověřit).
- **Vypouštíme** obyčejný report z jednoho letu PX4/ArduPilot. Je to běžná věc: PX4 Flight Review ([PX4](https://docs.px4.io/main/en/log/flight_log_analysis.html)) a ArduPilot UAV LogViewer ([ArduPilot](https://ardupilot.org/dev/docs/common-uavlogviewer.html)) to už umí.
- **Technické požadavky:** demo běží na notebooku bez internetu. K tomu natočte dvouminutové video a nahrajte ho jako neveřejné. Odkaz na něj patří do všech textů.
- **Červená čára i pro demo a testovací nástroje:** příjem dat, záznam, přehrání a zobrazení jsou v pořádku. **Nic** pro přidělování efektorů, logiku zásahu, navádění stíhačů ani datasety pro klasifikaci cílů, a to ani jako „testovací nástroj“.

### Co na začátku neděláme a proč

*Tohle zazní až na schůzce a v objednávce, ne v první zprávě.*

| Neděláme | Proč | Kde přesně je hranice |
|---|---|---|
| Cílení, rozpoznávání cílů, řízení palby, navádění (včetně stíhačů dronů), přidělování efektorů, autonomní zásah, odpálení a odjištění, hlavice, balistiku pro skutečné zbraně | reputace a odpovědnost; jde o vojenský software kategorie ML21 ([EU Military List](https://www.aalto.fi/en/services/classification-system-in-the-eu-common-military-list)) | **Protidronová obrana:** detekci zobrazit a zaznamenat ano, efektor nebo navádění ne. **Pozemní stanice:** telemetrie, plánování průzkumných letů a údržba ano, označování cílů a shoz nákladu ne. |
| Datasety a nástroje pro trénování rozpoznávání cílů | vstup do řetězce cílení | data pro údržbu a kvalitu ano |
| Utajované informace (Vyhrazené a výš), napojení na vojenské sítě | prověrka NBÚ trvá ze zákona 2 (Důvěrné) až 6 měsíců (Tajné) a „do zásoby“ ji získat nejde | když klient řekne „budete potřebovat prověrku“, je to pro teď ne |
| Vojensky specifický software pro zahraniční klienty, i v EU a na Ukrajině | zákon 38/1994 Sb.: povolení a licence MPO, povolení dostane jen právnická osoba s prověřeným vedením | **česká firma v ČR je v pořádku**, vývoz řeší ona |
| Certifikovaný bezpečnostně kritický letový software | chybí praxe s certifikací, vysoká odpovědnost (vlastní úsudek) | nástroje kolem něj ano |
| Práci zdarma: neplacené piloty, podrobné návrhy předem | čas patří platícím klientům | pilot S s možností skončit v polovině |
| Průzkum pro vlastní produkt u platícího klienta | klient se bojí, že jeho know-how prodáte konkurenci | o produktu mluvte jen s firmami, které nejsou vaši klienti (např. Dronetag), a odděleně |

**Šedá zóna:** C2 a zobrazení fúze senzorů pro vojenskou protidronovou obranu. Pro českou firmu v ČR je to v pořádku, ale klasifikaci (vojenský materiál, nebo zboží dvojího užití) vám klient musí potvrdit písemně ještě před začátkem práce.

---

## 3. Komu

**Pravidla:**
- **Jen 8 A-firem.** Každá dostane do středy jeden konkrétní nápad na pilot a předem domluvený termín. B-firmy oslovte na veletrhu nebo po něm, u C-firem jen poslouchejte nebo je nechte na druhou zakázku.
- **Jména kontaktních osob neuvádím,** nemám je ověřená. Na LinkedInu hledejte CTO nebo vedoucího vývoje softwaru.
- **Stánky** jsou podle katalogu FF 2026 ([čeští vystavovatelé](https://www.future-forces.org/exhibitors/list/state/cze?lang=en)).

| # | Firma | Nápad na pilot a proč | Signál (zdroj) | Cesta | Priorita |
|---|---|---|---|---|---|
| 1 | **TRL Space / TRL Defense** (Brno) | Servisní vrstva s API a webovým rozhraním, dokud nenajdou Python vývojáře. Druhá možnost: propojení letových logů se sériovými čísly a šaržemi (varianta 2). **Bez** navádění stíhačů TRL Drones. | Inzerát Software Engineer (Python, Django/Flask, REST, web GUI); „embedded dělá samostatný externí tým“ ([inzerát](https://www.trlspace.com/careers/software-engineer/)) | předem domluvit schůzku, stánek **H3/342** | **A** |
| 2 | **ERA a.s.** (Omnipol) | Samostatný nástroj pro automatizaci testů. Případně rekordér a přehrávač tras pro integrační testy, pokud jejich výstupy používají ASTERIX (ověřit). Možná je potřeba prověrka a nákup přes Omnipol může být pomalý (obojí ověřit). | Vývojový tester, IT specialista pro automatizaci, možný remote; na inzeráty reagovali „méně než 4“ lidé ([jobs.cz](https://www.jobs.cz/rpd/2001478148/)) | LinkedIn vedoucí vývoje, stánek **H5/508** | **A** |
| 3 | **EAGLE.ONE** (Praha) | Rekordér a přehrávač nahraných i syntetických tras pro integraci partnerských senzorů s jejich otevřeným API, plus logování. **Bez** navádění stíhače. | Otevřené API pro radary, RF detektory a kamery partnerů, běžící piloty ([FF](https://www.future-forces-forum.org/useful/news/4868)) | LinkedIn CTO s odkazem na demo, stánek **H5/539** | **A** |
| 4 | **VR Group** (Brno, patří pod LOM Praha) | Samostatný frontendový modul v Reactu a OpenLayers pro konstruktivní simulaci, s předáním novému člověku. Jestli to vyžaduje prověrku (LOM Praha má TAJNÉ), ověřit. | Frontend TS/React + OpenLayers ([kariéra](https://www.vrg.cz/cs/kariera/frontend-vyvojar-konstruktivni-simulace)); objednávka MO 6,7 mil. Kč (4/2026) | stánek **H3/319** | **A** |
| 5 | **AURA, s.r.o.** (Brno) | Ohraničená část jejich zakázky pro MO (konkrétní kus zjistit v prvním hovoru). Logistika a katalogizace jsou bezpečné téma. Jestli smlouva s MO dovoluje subdodavatele, ověřit. | 55 smluv s MO, ISL 121 mil. Kč, NCS/WEB 13,5 mil. Kč (2/2026) ([registr](https://www.hlidacstatu.cz/HledatSmlouvy?Q=%22AURA%2C%20s.r.o.%22%20ico%3A60162694)) | e-mail B (subdodávka), stánek **H2/249** | **A** |
| 6 | **PragoData a.s.** | Kapacita (balíček B) na jejich zakázky pro MO. | GINIS DEFENCE 92,5 mil. Kč, FIS/ISSP/ESSS 35 mil. Kč, partner BAE ([BAE](https://www.baesystems.com/en/article/bae-systems-and-pragodata-work-together-to-deliver-integrated-product-support-to-czech-defence-sector)) | e-mail B (subdodávka), stánek **H1/156** | **A** |
| 7 | **Fly4Future** (Praha) | Nástroj kolem ROS2 nebo simulace jako pilot S, případně subdodávka na jejich zakázkách. | Robotics SW Engineer C++/ROS2, i na částečný úvazek ([inzerát](https://fly4future.com/career/robotics-sw-engineer/)) | podle všeho nevystavuje (ověřit), LinkedIn zakladatelů | **C** (C++/ROS2, to nemáte) |
| 8 | **esc Aerospace** (Praha) | Kontrakt na IČO pro jednoho z vás. Vesmír, ne zbraně, tedy čistá reference. | C/C++ Embedded, v inzerátu výslovně HPP nebo IČO ([jobs.cz](https://www.jobs.cz/rpd/2001445257/)) | – | **vyřazeno** (C/C++ embedded a plný úvazek) |
| 9 | **Cyber Drone Solutions** a pavilon **Defence Lab** (S-Tech) | Rekordér a přehrávač tras, integrace datových toků do C2 (šedá zóna, klasifikace písemně). **Pozor:** robot Termit se používá i se zbraní. | Integrátor DroneShield, Tencore a dalších ([FF](https://www.future-forces-forum.org/useful/news/4704), [S-Tech](https://future-forces-forum.com/useful/news/4479)) | Tech Happy Hours 20. 10., stánek **H3/312** | **B** |
| 10 | **MSM Group** (CSG) | Balíček C: mapování výroby a toku dat pro MES a dohledatelnost. Nákup bude pomalý, v muničních závodech se prověřuje přístup. | Group MES Lead bude „řídit dodavatele a integrátory“ (21. 9. 2026, [LinkedIn](https://cz.linkedin.com/jobs/view/group-mes-lead-at-msm-group-4469868759)) | stánek CSG **H2D 291–294**, zeptat se na MES Leada | **B** |
| 11 | **Gofore / Huld** | Kapacita pro jejich obranné projekty. | Akvizice Huld za 54,5 mil. EUR kvůli obraně ([Gofore](https://gofore.com/en/news/inside-information-gofore-acquires-technology-company-huld-significantly-growing-its-position-in-intelligent-industry-and-security-sectors/)); pobočky v ČR ověřit | stánek **H3/311** | **B** |
| 12 | **ELDIS Pardubice** (CSG) | Testovací nástroje pro radary jako projekt a překlenutí náboru. Hlavně civilní ATC. | Řada SW rolí, 30 tis. Kč za nástup ([volné pozice](https://www.eldis.cz/volne-pozice)) | stánek CSG (účast ověřit), LinkedIn | **B** |
| 13 | **Be a Future** (Praha) | Subdodávka na zakázkách pro MO. Jestli jim chybí kapacita, ověřit. | Zhodnocení systému pro MO 17 mil. Kč, provoz webů MO ([Ekonomický deník](https://ekonomickydenik.cz/nejsou-ajtaci-provoz-webu-pro-obranu-zajistuje-privatni-firma-za-30-milionu/)) | e-mail B (subdodávka) | **B** |
| 14 | **Kentigen** | Subdodávka v automatizaci testů. | Člen AOBP, automatizace testů pro obranu ([AOBP](https://aobp.cz/en/member/)) | stánek **H2/283** | **B** |
| 15 | **Excalibur Army** (CSG) | Balíček C nebo webové a diagnostické nástroje. **Řízení palby ne.** Práce na místě ve Šternberku. | „Integrace SW od dodavatelů“ v inzerátu ([inzerát](https://kariera.excaliburarmy.cz/pracovni-pozice/122/programator-win-linux-aplikaci-senior)) | stánek CSG **H2D 291–294** | **B** |
| 16 | **SII Czech** (agentura) | B2B kontrakt pro jednoho z vás. Klienta předem neznáte (ověřit). | Embedded Linux pro radary, i B2B ([jobs.cz](https://www.jobs.cz/rpd/2001455685/)) | – | **vyřazeno** (embedded a plný úvazek) |
| 17 | **EVPÚ Defence** | Desktopové nástroje pro konfiguraci, diagnostiku a servis. **Zaměřovače a zbraňové stanice ne.** | Embedded & PC SW Developer ([jobs.cz](https://www.jobs.cz/rpd/2001465740/)) | stánky H1/147, H3/332 | **C** |
| 18 | **Bagira Systems** (Brno) | Hraniční: bojová AI a balistika v simulaci. Jen jasně oddělené nástroje. | C++ Developer, QA Lead ([LinkedIn](https://cz.linkedin.com/jobs/view/c%2B%2B-developer-ig-at-bagira-4475405633)) | LinkedIn | **C** |
| 19 | **MORAVIO, Vigilante Design** a další softwaroví členové AOBP | Subdodávky. Profily jsou sebeprezentace firem. | [katalog AOBP](https://aobp.cz/en/member/) | e-mail po veletrhu | **C** |
| 20 | **GEPRO, DELINFO, SKILL, Microis** | Menší dodavatelé MO, rozhodují rychleji. | GIS MISYS 17,9 mil., IT vývoj 21,1 mil., NSIP a BMIS po 3,6 mil. Kč ([registr](https://www.hlidacstatu.cz/HledatSmlouvy?Q=ico%3A60162694%20AND%20%28%22v%C3%BDvoj%20software%22%20OR%20%22v%C3%BDvoj%20SW%22%20OR%20%22programov%C3%A9ho%20vybaven%C3%AD%22%29%20AND%20podepsano%3A%5B2025-01-01%20TO%20*%5D)) | e-maily B v týdnu po veletrhu | **C** |
| 21 | **Dronetag** | Ne jako klient. Jen samostatný rozhovor o produktu dohledatelnosti. | Softwarové role nemají ([kariéra](https://www.dronetag.com/careers)) | LinkedIn | **C** |
| 22 | **JISR Institute, RETIA** | Jen poslouchat. Prověrka Tajné v inzerátech, JISR napojuje i efektory. | [JISR](https://www.jobs.cz/rpd/2001457833/), [RETIA](https://www.mametenaradaru.cz/volne-pozice/sw-architect/) | stánek H4/448, stánek CSG | **C** |

**Teď vynechat:** LPP (úderné drony, Narwhal), Noontide Systems (sledování cíle a navádění), Fire Point, Ukrainska Bavovna a Pavetra Aerospace (úderné drony) a navádění stíhačů TRL Drones.

---

## 4. Kanály (seřazené podle rychlosti)

Doby jsou odhad, ne data.

| # | Kanál | K podpisu za | Co udělat | Pozor |
|---|---|---|---|---|
| 1 | **Tátovy kontakty: to hlavní** | 1–3 týdny | Dnes večer s tátou projít seznam: jméno, firma, role, jak blízko si jsou. Hledat i investory, členy boardů, bývalé kolegy a zákazníky obranných firem, nejen přímé známé. Vybrat 3–5 jmen, poslat text C a chtít **představení e-mailem rovnou u CTO nebo vedoucího vývoje**. | Úředníky MO a armády žádat jen o radu, komu napsat, nikdy o zakázku: hrozí střet zájmů. Tomuto kanálu dejte v týdnu 1 většinu Petrova času. |
| 2 | **Future Forces s předem domluvenými schůzkami** a doprovodné akce | 1–3 týdny po veletrhu | V pondělí a úterý domluvit desetiminutové schůzky e-mailem nebo přes LinkedIn s konkrétními časy. Na stánky chodit jen v klidných časech: první hodina, po 15:00, pátek. CTO se lépe zastihne na doprovodných akcích: Tech Happy Hours 20. 10. (790 Kč, nutné schválení, [Luma](https://luma.com/1asiah8a)) a panely fóra. | Registrace je zdarma online, na místě 20 EUR, jen pro odborné návštěvníky ([registrace](https://future-forces-forum.org/events/registration)). Otevírací dobu ověřit ([PVA EXPO](https://www.pvaexpo.cz/en/event/467)), organizátor uvádí asi 9–17 ve středu a čtvrtek a 9–15 v pátek. **Nikdy nepřerušovat rozhovor se zákazníkem.** |
| 3 | **Subdodávky pro softwarové firmy se smlouvami s MO** | 2–4 týdny | Text B (varianta) s odkazem na jejich smlouvu v registru a návrhem konkrétního času. | Hned se zeptat, jestli smlouva dovoluje subdodavatele a jestli je potřeba prověrka. |
| 4 | **Agentury a B2B nebo IČO kontrakty** | – | **Teď ne.** Agentury chtějí lidi na plný úvazek. | Vrátit se k tomu, až jeden z vás odejde ze zaměstnání. |
| 5 | **LinkedIn napřímo** | 2–6 týdnů | Text A (konkrétní háček a odkaz na demo), jen pro A- a B-firmy. | Poznámka má limit 200 znaků. Bezplatný účet má málo poznámek měsíčně, zdroje uvádějí 3–10 ([La Growth Machine](https://help.lagrowthmachine.com/en/articles/8480511-linkedin-basic-accounts-new-connection-request-limits-advice-on-how-to-proceed)), ověřit. |
| 6 | **S-Tech Ventures, Defence Lab** | 2–6 týdnů | Na veletrhu se zeptat správce pavilonu, kterým firmám z portfolia chybí vývojáři ([S-Tech](https://future-forces-forum.com/useful/news/4479)). | Akcelerátor, jehož firmy potřebují lidi. |
| 7 | **CzechInvest Defence Hub** | 3–8 týdnů | Formulář nebo e-mail Leoši Mauerovi (leos.mauer@czechinvest.gov.cz) s prosbou o 2–3 představení u startupů z akcelerátoru DIANA. Zápis do databáze dodavatelů ([Defence Hub](https://czechinvest.gov.cz/en/Key-sectors/defence-hub), [databáze](https://czechinvest.gov.cz/en/For-Investors/Database-of-Suppliers)). | Nežádat o grant. |
| 8 | **DroneTech b2match online** | 2–6 týdnů | Registrace zdarma, dvacetiminutové schůzky 21.–23. 10. dát na 8:00–8:45 nebo po zavření veletrhu ([b2match](https://www.b2match.com/e/dronetech-world-meeting-2026)). | Převážně zahraniční firmy, u vojenského kódu pozor na vývoz. |
| 9 | **AOBP** | měsíce | Katalog členů použít hned jako seznam firem ([katalog](https://aobp.cz/en/member/)), členství řešit až po první faktuře. | Poplatek neověřen. |
| 10 | **Hackathony EDTH** | měsíce | Zapsat se do komunity ([EDTH](https://events.eurodefense.tech/)). | Cesta ke druhé a třetí zakázce, volit témata bez zbraní. |
| 11 | Freelance platformy | – | Teď nic. | Obrannou platformu pro střední a východní Evropu jsme nenašli. |

---

## 5. Plán den po dni (ne 18. 10. – pá 6. 11.)

**Role:**
- **Petr:** táta, obchod, právní věci.
- **Ben:** demo, one-pager, LinkedIn.
- **Oba:** na schůzky s A-firmami chodíte spolu.

**Každý večer** aktualizujte tabulku obchodních příležitostí se sloupci: firma, osoba, role, co je trápí, další krok, datum.

### Neděle 18. 10. večer

- **Petr a táta (30 min):** sestavit seznam kontaktů včetně investorů, boardů a bývalých kolegů, vybrat 3–5 jmen, upravit text C.
- **Oba:**
  - Rozhodnout, kdo dělá první pilot a kolik hodin týdně opravdu zvládne (realisticky 15–20).
  - Zjistit, kdo potřebuje souhlas podle § 304.
  - Zavolat dvěma lidem, kteří vás tento týden doporučí.
  - Registrace na Future Forces.
- **Oba:** začít s důkazy, tedy doplnit LinkedIn (zaměstnavatelé, roky, titulek „Testovací, datový a výrobní software pro obranné a dronové firmy“) a vybrat systém s čísly a veřejné repo.

### Týden 1: příprava a veletrh

**Po 19. 10.**
- **Táta:** ráno pošle text C.
- **Do poledne:** důkazy hotové a vyplněné ve všech textech.
- **Oba:** ráno si domluvit volno na veletrh. Projít pracovní smlouvy a požádat zaměstnavatele o krátké písemné potvrzení, že proti vedlejší činnosti nemá námitky.
- **IČO:** ověřit, že živnost obsahuje obor č. 56 (poskytování software, zpracování dat), případně ho doplnit.
- **Petr:**
  - Ke každé z 8 A-firem napsat jednu větu s nápadem na pilot.
  - Poslat 6 e-mailů B (TRL, ERA, EAGLE.ONE, VR Group, AURA, PragoData) se dvěma konkrétními desetiminutovými termíny.
  - Formulář CzechInvest, registrace na b2match.
- **Ben:**
  - One-pager v PDF česky a anglicky: důkazy, pilot S, rámeček „Bezpečnost a důvěra“.
  - Vizitky v expresním tisku.
  - Začít demo (varianta 1).
- **Výstup dne:** táta odeslal, důkazy hotové, 6 e-mailů venku, živnost ohlášená.

**Út 20. 10.**
- **Ben:**
  - Dokončit demo a nahrát video (neveřejně).
  - Poslat 8–10 LinkedIn žádostí (text A) s odkazem.
  - Diagram pro variantu 2.
- **Petr:**
  - Zavolat A-firmám, které neodpověděly, a potvrdit termíny.
  - Poslat e-maily B-firmám (Cyber Drone Solutions, Gofore, Kentigen, Be a Future).
  - Připravit 3 body, o kterých budete jednat v cizích smlouvách (oddíl 8), a záložní šablonu objednávky pro klienty, kteří vlastní nemají.
- **Oba:**
  - Trasa po halách s rozdělením na klidné časy a pevné schůzky.
  - Nacvičit text D.
  - Od 15:30 Tech Happy Hours (panel DefenceTech, S-Tech), pokud vás schválí.
- **Cíl dne:** 4–6 domluvených schůzek na veletrhu.

**St 21. 10.: veletrh, den 1 (haly 3 a 5)**
- **9:00–10:00, klidná hodina:** TRL H3/342, VR Group H3/319, Cyber Drone Solutions H3/312, Gofore H3/311.
- **10:00–15:00:**
  - Domluvené schůzky.
  - Panely fóra.
  - Defence Lab a Innovation Pavilion.
  - Stánky zprostředkovatelů, které jsou tam od toho, aby mluvily s návštěvníky.
  - U obsazených stánků se jen zeptat: „Kdo u vás vede software? Je tu, kdy přijde?“
- **Po 15:00:** Omnipol/ERA H5/508, EAGLE.ONE H5/539.
- **Večer:**
  - Tabulka.
  - Děkovné zprávy a žádosti o spojení.
  - Kdo chtěl návrh, dostane do 48 hodin text E.
- **Cíl dne:** 10 rozhovorů, 3–4 jména lidí, kteří vedou software.

**Čt 22. 10.: veletrh, den 2 (haly 1, 2 a 2D)**
- **9:00–10:00:** PragoData H1/156, AURA H2/249, Kentigen H2/283.
- **Přes den:**
  - Domluvené schůzky.
  - Stánek CSG H2D 291–294: zeptat se na MES Leada z MSM, na IT a digitalizaci v Excaliburu a na ELDIS.
  - Czech AI Association H2D/273, Czech Aerospace Cluster H2/237.
  - EVPÚ H1/147 jen poslouchat.
- **Večer:** tabulka, odpovědi lidem ze středy, zpráva tátovi, kdo se ozval.
- **Cíl dne:** 10 rozhovorů, 3–4 jména.

**Pá 23. 10.: veletrh, den 3 (kratší, klidnější)**
- **Ráno:** vrátit se ke 3–5 nejteplejším kontaktům s náčrtem pilotu na papíře.
- **Pak:** hala 4 (Primoco H4/423, JISR H4/448 jen poslouchat) a stánky, které se nestihly.
- **Odpoledne:** vybrat 5 nejlepších příležitostí a ke každé jeden návrh pilotu S.
- **Cíl veletrhu:** 25–30 rozhovorů, 10 jmen, 6–8 navazujících termínů.

**So–Ne 24.–25. 10.:** follow-up (text E) všem do 48 hodin od rozhovoru, koncepty 3 nabídek, odpočinek.

### Týden 2: navazující hovory, nabídky, plán B

**Po 26. 10.**
- Telefonem potvrdit navazující hovory.
- **Plán B startuje:** subdodávkové e-maily (varianta textu B) softwarovým dodavatelům MO: AURA, PragoData, Be a Future, GEPRO, DELINFO, SKILL, Microis, MORAVIO, Vigilante Design.
- **Táta:** připomenout kontakty, které neodpověděly, poděkovat těm, kdo pomohli.
- **Petr:** výpis z živnostenského rejstříku, urgovat potvrzení od zaměstnavatelů, poptat pojištění odpovědnosti.

**Út 27. 10.**
- 2–3 schůzky podle oddílu 7.
- Poslat první 1–2 nabídky.

**St 28. 10.: státní svátek**
- Nikoho neurgovat.
- Vylepšit demo podle toho, co se na veletrhu ptali.
- Dopsat nabídky.
- Domluvit si s advokátem 1–2 hodiny na 3 body, o kterých budete jednat v cizích smlouvách.

**Čt 29. 10.**
- Schůzky, zbývající nabídky (start 9. nebo 16. 11.).
- CzechInvest, pokud je domluveno.

**Pá 30. 10.: kontrolní bod 1**
- Kolik nabídek je venku (cíl 3) a kdo řekl „ano, ale…“.
- **Kdo řekl ano:** ještě dnes si vyžádat **jeho** NDA a objednávku.
- **Méně než 3 nabídky:** druhá vlna subdodávkových e-mailů a znovu požádat tátu o další kontakty.

### Týden 3: podpis

**Po 2. 11.**
- **Kdo řekl ústně ano:** text F1 s termínem kvůli startu 9. 11.
- **Kdo mlčí:** text F2, bez umělého termínu.

**Út 3. 11.**
- Připomínky k jejich smlouvě: jen strop odpovědnosti, výjimka pro vaše knihovny a platby.
- U CSG a Omnipolu zjistit, jak u nich probíhá registrace dodavatele, a nastavit si realistický termín.

**St 4. 11.: cílový den podpisu**
- Hned po podpisu:
  - požádat o vzorová data, popis rozhraní a vytvořené repo klienta,
  - poslat pozvánku na kick-off 9. 11.,
  - domluvit termíny kontrol na konci 1. a 2. týdne.

**Čt 5. 11.**
- Dotáhnout zbývající podpisy.
- Kdo řekl „teď ne“, dostane zprávu: „Ozvu se v lednu.“
- **Pokud je podpis:** objednat notáře kvůli s.r.o.

**Pá 6. 11.: kontrolní bod 2**
- **Podepsáno:**
  - připravit kick-off,
  - zapsat si, co rozhodlo,
  - zeptat se, jestli vás klient smí uvést jako referenci.
- **Nepodepsáno:**
  - kde se to zaseklo (důvěra, rozsah, nikdo nerozhodoval, nákup),
  - plán do 20. 11.,
  - plán B běží dál.

---

## 6. Texty k použití

*Bez vyplněných důkazů a jedné konkrétní věci o adresátovi nic neposílejte. Hranice toho, co neděláte, do prvních zpráv nepatří.*

### A) LinkedIn: žádost o spojení (max. 200 znaků **po vyplnění**, vždy přepočítat)

**Firma, která nabírá** (165 znaků bez vyplnění; [nástroj X] nejvýš asi 35 znaků, odkaz nejvýš 25):

> Dobrý den, vidím, že od jara hledáte Python vývojáře. Než ho najdete, dodáme za 4 týdny za pevnou cenu [nástroj X] mimo váš hlavní repozitář. 2min demo: [odkaz]. Petr

*„Od jara“ a „Python“ nahraďte skutečným signálem konkrétní firmy.*

**Protidronová firma s otevřeným API** (190 znaků s odkazem typu youtu.be/… o 20 znacích):

> Dobrý den, viděl jsem vaše otevřené API pro radary a RF detektory. Máme rekordér a přehrávač tras pro integrační testy (demo: [odkaz]). Za 4 týdny ho napojíme na váš formát. Petr

**Anglicky** (170 znaků bez vyplnění):

> Hi [name], saw you have been hiring Python devs since spring. Until you do, we can ship [tool X] in 4 weeks, fixed price, outside your core repo. 2-min demo: [link]. Petr

**Zpráva po přijetí žádosti:**

> Díky za spojení. Jsme Petr [Příjmení] a Ben [Příjmení], [X] a [Y] let praxe ([stack 1], [stack 2]). Naposledy jsme dodali [systém s číslem, např. „pipeline pro N zpráv/s, 4 roky v provozu“].
>
> Pro firmy, které nabírají, děláme jednu věc: vezmeme jeden nástroj, na který váš tým nemá čas, a dodáme ho za 4 týdny za pevnou cenu. Pracuje na něm jeden člověk, v odděleném repu, na vašich vzorových datech, a od vás potřebujeme nejvýš hodinu týdně. Až najdete člověka, čistě mu ho předáme.
>
> Máte na Future Forces 10 minut? Navrhuji [st 21. 10. v 9:15] nebo [čt 22. 10. v 15:30] u stánku [H3/342].

### B) Cold e-mail

**Předmět:** [nástroj X] pro [firma] za 4 týdny, mimo váš hlavní repozitář

> Dobrý den, pane / paní [příjmení],
>
> [firma] [konkrétní bolest jednou větou: od jara hledá Python vývojáře / integruje senzory partnerů přes otevřené API / skládá nový tým pro STELA].
>
> Mezitím obvykle zůstává ležet [konkrétní nástroj: servisní API s webovým rozhraním / přehrávač nahraných tras pro integrační testy / automatizace testovací stanice] a váš senior na to nemá čas. Ten bychom vzali na sebe.
>
> Jsme Petr [Příjmení] a Ben [Příjmení], [X] a [Y] let praxe, naposledy [jeden dodaný systém s číslem]. LinkedIn: [odkaz], [odkaz]. Dvouminutové demo: [odkaz].
>
> Nabízíme:
> – 1 člověk, 4 týdny (asi 20 h týdně, vedle stálé práce), pevně 75 000 Kč bez DPH,
> – oddělené repo, které patří Vám, vzorová data a popis rozhraní, od Vašeho inženýra nejvýš hodinu týdně,
> – fakturace ve dvou částkách až po převzetí; když Vám první polovina nebude stačit, skončíme a platíte jen ji,
> – nástroj pak čistě předáme člověku, kterého přijmete.
>
> Zaměřujeme se na testovací, datový, výrobní a servisní software. Podepíšeme Vaši NDA.
>
> Máte 10 minut na Future Forces? Navrhuji [st 21. 10. v 9:15] nebo [čt 22. 10. v 15:30] u Vašeho stánku [H3/342]. Případně krátký hovor příští týden.
>
> S pozdravem
> Petr [Příjmení]
> [telefon] · [LinkedIn] · [demo/GitHub]

**Varianta pro softwarovou firmu se smlouvou s MO** (místo prvních dvou odstavců a nabídky):

> V registru smluv jsem viděl, že pro Ministerstvo obrany děláte [podporu systému ISL / GINIS DEFENCE]. Pokud na tom nebo jinde potřebujete posílit tým, naskočíme jako subdodavatel na ohraničenou část. Buď za pevnou cenu, nebo za 8 500 Kč/MD, pod Vaším vedením a podle Vašich standardů pro kód. Začít můžeme [9. 11.].

### C) Teplé představení přes tátu

**Zpráva od táty jeho kontaktu:**

> Ahoj [jméno], mám prosbu. Můj syn Petr a jeho kolega Ben [Příjmení] dělají vývojáře [X] a [Y] let a teď začínají dodávat software obranným a dronovým firmám. Petra znám, takže vím, že dodá, co slíbí. Nechci po tobě zakázku, jen představení: znáš ve [firma] nebo jinde CTO nebo vedoucího vývoje, kterému by se hodili? Kdyby ses s nimi pak chtěl spojit sám, můžu vás propojit e-mailem. Ve středu až pátek jsou na Future Forces v Letňanech. Díky, [táta]

**Krátký popis, který kontakt může přeposlat:**

> Petr [Příjmení] a Ben [Příjmení] ([X]/[Y] let, [stack], naposledy [systém s číslem], LinkedIn: [odkazy]) dodávají obranným a dronovým firmám testovací, datové, výrobní a servisní nástroje. Jeden člověk, 4 týdny, pevná cena, oddělené repo a minimum času Vašeho týmu, vhodné hlavně jako překlenutí, než se podaří někoho přijmout. Demo: [odkaz]. Kontakt: [telefon], [e-mail].

**Co od táty potřebujete:**
- Doplňující otázku: „Komu bys to přeposlal?“
- Představení e-mailem s oběma stranami v kopii, ideálně se slovy kontaktu „znám je, ručím za ně“.
- Od úředníků MO a armády jen radu.

### D) U stánku (jen v klidné chvíli)

> Dobrý den, nechci zdržovat. Máte minutku, nebo se mám stavit později? … Jsem Petr, s kolegou dodáváme dronovým a obranným firmám nástroje, na které jejich vývojáři nemají čas. Teď třeba rekordér a přehrávač tras pro integrační testy, tady je demo na minutu. Jeden člověk, čtyři týdny, pevná cena, mimo váš hlavní repozitář. Kdo u vás vede software? Je tu, nebo kdy přijde?

**Anglicky:**

> Hi, I don't want to interrupt. Do you have a minute, or should I come back later? … I'm Petr. My colleague and I ship the tools your developers have no time for, for example a track recorder and replayer for integration tests. Here's a one-minute demo. One engineer, four weeks, fixed price, outside your core repo. Who leads software here? Are they around today?

**Doplňující otázky:**
1. Co teď nejvíc zdržuje vaše vývojáře?
2. Na jaké pozice nabíráte, a co čeká, než někoho najdete?
3. Kdo by schválil malý úkol za pevnou cenu a jak u vás probíhá nákup od nového dodavatele?

**Rozhovor uzavřít:** jménem, e-mailem a konkrétním termínem, ne „pošlete nám něco“.

### E) Follow-up po rozhovoru (do 48 hodin)

**Předmět:** Future Forces: [nástroj X] pro [firma], návrh na 4 týdny

> Dobrý den, pane / paní [příjmení],
>
> děkuji za rozhovor ve [čtvrtek]. Jestli to chápu správně, trápí Vás [jejich slovy] a teď to [stojí X hodin týdně / zdržuje Y].
>
> Návrh:
> – **Co:** [konkrétní výstup, např. přehrávač nahraných i syntetických tras ve formátu Remote ID s časovou osou a exportem pro Vaše integrační testy]
> – **Kdo a kdy:** [Ben], asi 80 hodin během 4 týdnů (vedle stálé práce, průběžné předávky každý čtvrtek), start [9. 11.]
> – **Jak:** oddělené repo ve Vašem vlastnictví, vzorová data a popis rozhraní. Kontrola s Vaším inženýrem po 2. a 4. týdnu, celkem nejvýš 2 hodiny.
> – **Za kolik:** pevně 75 000 Kč bez DPH ve dvou částkách po 37 500 Kč (po 2. a 4. týdnu), fakturovaných až po převzetí, splatnost 14 dní. Když Vám první polovina nebude stačit, skončíme a zaplatíte jen ji.
> – **Mimo rozsah:** [co tam není].
> – Podepíšeme Vaši NDA a objednávku. Projektový kód je po zaplacení Váš a nic z Vašeho kódu ani dat nepoužijeme jinde.
>
> Hodí se Vám 15 minut [v úterý 27. 10. v 10:00] nebo [ve čtvrtek 29. 10. ve 14:00]?
>
> S pozdravem
> Petr [Příjmení]

### F1) Připomínka po ústním „ano“ (3–4 pracovní dny)

> Dobrý den, posílám připomínku k objednávce [téma]. Abychom udrželi start [9. 11.], potřebovali bychom podpis do [středy 4. 11.]. Pokud čekáte na schválení, napište mi prosím, s čím můžu pomoct.

### F2) Připomínka bez odpovědi (5–7 pracovních dní, bez termínu)

> Dobrý den, jen se připomínám s návrhem [téma] z [datum]. Pokud teď není vhodná doba nebo by dávalo smysl jiné téma, stačí jedna věta a ozvu se později.

---

## 7. Jak vést první obchodní schůzku

### Příprava (10 minut)

- Projděte jejich web, inzeráty a to, co vystavují.
- Připravte si dvě hypotézy, co je trápí, a jeden nápad na pilot S.

### Průběh (30 minut)

1. **Úvod (2 min):** „Chci pochopit, co vás brzdí. Když to bude dávat smysl, navrhnu na konci malý první krok.“
2. **Otázky (15 min):** poslouchat, nic neprodávat.
3. **Shrnutí (3 min):** „Problém je…, stojí vás…, vyřešené to je, když…“
4. **Návrh (5 min):** pilot S.
5. **Dohoda (5 min):** kdo co pošle a do kdy, termín dalšího hovoru.

### Otázky, ze kterých poznáte rozsah

**Problém a nábor**
- Co teď nejvíc zdržuje vaše vývojáře?
- Co by se dalo vytáhnout jako samostatný nástroj mimo hlavní kód?
- Jaký úkol leží v backlogu měsíce?
- Na jaké pozice nabíráte a jak dlouho už?

**Dopad**
- Kolik vás to stojí hodin týdně?
- Je to vázané na zakázku, audit nebo termín (AQAP, NIS2, původ dílů pro SAFE)?

**Jak to udělat s minimem zátěže pro tým**
- Máte vzorová data a popis rozhraní?
- Kdo by měl hodinu týdně na kontrolu?
- Kde má být repo? Smíme používat AI nástroje? (Výchozí odpověď je ne, dokud to nepovolí písemně.)

**Rozhodování a nákup**
- Kdo to schválí? Podepíšete sám pilot za 75 000 Kč?
- Máte vlastní NDA a objednávku?
- Jakou máte splatnost?

**Bezpečnost a vývoz.** Když odpověď vede do červené zóny z oddílu 2, slušně odmítněte.
- Bude potřeba pracovat s utajovanými informacemi nebo u vás v objektu?
- Kdo je koncový zákazník: česká firma, nebo zahraničí?
- Napojí se to někdy na řízení palby, navádění nebo efektory?
- Jde o vojenský materiál, nebo zboží dvojího užití? Potvrdíte nám to písemně?

**Měřítko úspěchu**
- Podle čeho za dva týdny poznáte, že se to povedlo?

**Neptejte se** na výrobní procesy kvůli vlastnímu produktu. Na schůzce se zajímáte jen o jejich problém.

### Jak navrhnout pilot

> „Navrhuji začít malým krokem. Jeden z nás čtyři týdny, asi 20 hodin týdně vedle stálé práce, na [výstup] za pevných 75 000 Kč, v odděleném repu, které vlastníte, na vzorových datech. Od vašeho inženýra potřebujeme hodinu týdně. Fakturujeme ve dvou částkách až po převzetí. Když vám první polovina nebude stačit, skončíme a zaplatíte jen ji. Až najdete svého člověka, nástroj mu předáme.“

- **Pilot M (140 000 Kč)** nabídněte, až když klient sám chce víc.
- **Balíček C** nabídněte jen tradičnímu výrobci nebo skupině.

### Jak nacenit

- **Pevnou cenu na místě** řekněte jen za pilot S (75 000 Kč). Rozsah potvrďte písemně do 24 hodin.
- **Postup:** odhad člověkodnů + 20–30 % rezerva. Když se úkol do 10 MD nevejde, rozdělte ho na dva piloty, nenafukujte ho.
- **Nabídka na jednu stranu:**
  - problém jejich slovy,
  - výstup,
  - co **není** v rozsahu,
  - kdo na tom pracuje a na kolik hodin týdně,
  - termín, cena, milníky,
  - co potřebujete od klienta,
  - platnost 14 dní.
- **Sleva jen výměnou za menší rozsah.** Pod 7 000 Kč/MD nejděte.
- **Velké skupiny** (CSG, Omnipol) chtějí cenu za člověkoden a vlastní smlouvu: 8 500 Kč/MD a odhad počtu MD.

### „Máte reference?“

- **Nikdy si je nevymýšlejte.**
- **Odpověď:**

  > „Z obrany zatím ne. Máme [X] let v [obor], naposledy [systém s číslem], tady je kód [odkaz]. [Jméno] z [firma] vám to tento týden potvrdí po telefonu. Proto nabízíme čtyři týdny s možností skončit v polovině: riskujete 37 500 Kč, ne půl roku náboru.“
- Ukažte demo.
- Do objednávky si dejte právo uvést klienta jako referenci, aspoň anonymně.

### Další námitky

- **„Raději bychom vás zaměstnali.“** Je to nákupní signál, nevyhýbejte se mu.
  > „To nás těší. Začněme jako kontraktoři na 1–3 měsíce. Dodáme a předáme, a pak se společně rozhodneme.“
- **„Proč ne agentura?“**
  > „Mluvíte přímo s lidmi, kteří píšou kód. Žádný projektový manažer navíc. Pracujeme vedle stálé práce, takže termíny držíme po týdnech a předáváme každý čtvrtek.“
- **„Pošlete nám nabídku.“**
  > „Rád. Co přesně má první úkol vyřešit a kdo ho bude schvalovat?“

**Uzavření:**

> „Návrh pošlu zítra do 12:00. Můžeme si dát 15 minut [ve čtvrtek 29. 10. v 10:00] a rozhodnout?“

---

## 8. Právní a praktické minimum (checklist)

*Advokát na 1–2 hodiny: projít 3 body, o kterých budete jednat, a záložní šablonu.*

### Forma podnikání

- [ ] **Živnost hned:**
  - volná živnost, obor č. 56, online přes jednotný registrační formulář,
  - oprávnění vzniká dnem ohlášení, výpis do 5 pracovních dnů ([Czech POINT](https://www.czechpoint.gov.cz/public/wp-content/uploads/2026/08/Prijeti_podani_podle_zivnostenskeho_zakona.pdf)),
  - poplatek 1 000 Kč, elektronicky nejspíš 800 Kč (ověřit).
- [ ] **Paušální daň:** oznámení nejpozději v den zahájení. Nejde, pokud jste letos měli ze zaměstnání přes 50 000 Kč ([Finance.cz](https://www.finance.cz/aktuality/pro-vstup-a-vystup-do-pausalni-dane-mate-cas-jen-do-pondeli-12-ledna-2026/)). Jinak běžný režim, ověřit s účetní.
- [ ] **S.r.o. hned po první objednávce:**
  - orientačně ~12 tis. Kč a 5–10 pracovních dní (data z roku 2023, ověřit u notáře),
  - omezené ručení, důvěryhodnost, duševní vlastnictví obou v jedné firmě,
  - povolení MPO pro obchod mimo EU dostane jen právnická osoba.
- [ ] **Do vzniku s.r.o.** fakturuje ten z vás, kdo zakázku dělá, ze svého IČO.
- [ ] **Dohoda mezi vámi dvěma na jednu stranu:** dělení příjmů, převod kódu do s.r.o., odchod jednoho z vás. Podepsat před první fakturou.

### Zaměstnání a dostupnost

- [ ] **§ 304 ZP:** vedlejší činnost ve stejném oboru jako zaměstnavatel potřebuje předchozí písemný souhlas, který jde odvolat ([ePravo](https://www.epravo.cz/top/clanky/vedlejsi-cinnost-zamestnance-114841.html)). **Bez souhlasu dotyčný na zakázce nepracuje** a klient to ví předem.
- [ ] V pracovní smlouvě zkontrolovat konkurenční doložku (§ 310), mlčenlivost a zaměstnanecká díla.
- [ ] Nikdy nepoužívat notebook, čas ani kód zaměstnavatele.
- [ ] V každé nabídce uvést, kdo na zakázce pracuje a kolik hodin týdně.

### Smlouvy: podepište papíry klienta

- [ ] **Výchozí postup:** podepsat NDA a objednávku klienta. Vlastní šablona je jen pro klienty, kteří žádnou nemají (typicky tradiční výrobci).
- [ ] **Jednat jen o třech věcech:**
  1. **Strop odpovědnosti** ve výši ceny objednávky, bez ušlého zisku. Smluvní pokuty jen se stropem. Úmysl a hrubou nedbalost předem omezit nelze (§ 2898 OZ).
  2. **Výjimka pro vaše dosavadní nástroje:** výslovný krátký seznam obecných knihoven, ke kterým klient dostane nevýhradní licenci. Všechno projektové je po zaplacení klienta. U programu na objednávku vykonává práva ze zákona objednatel (§ 58 odst. 7 AZ, [ePravo](https://www.epravo.cz/top/clanky/pravo-it-prava-k-software-na-objednavku-111074.html)).
  3. **Platby:** milníky po převzetí, splatnost 14 dní, nejvýš 30 ([iDoklad](https://www.idoklad.cz/blog/jak-na-splatnost-faktur-dle-zakona)), právo přerušit práci při prodlení.
- [ ] **Automatické převzetí po 5 dnech** jen pokud s ním klient souhlasí, jinak ho nevyžadujte.
- [ ] **Doplnit jednu větu:** „Kód, data a výrobní informace klienta dodavatel nepoužije ve vlastních produktech ani pro jiné klienty.“
- [ ] **Do objednávky:** „Mimo rozsah: řízení palby, navádění, přidělování efektorů a klasifikace cílů.“ U šedé zóny přidat písemnou klasifikaci (vojenský materiál, nebo zboží dvojího užití).
- [ ] **V NDA klienta hlídat:** pokuty bez stropu, schovaný zákaz konkurence, převod vašich vlastních nástrojů. Požádat o větu, že vám nepředá utajované informace.

### Bezpečnost (co slibujete, musíte dodržet)

- [ ] Vyhrazený šifrovaný notebook pro zakázku, ne zaměstnavatelův. Všude MFA.
- [ ] Repozitáře a hosting v EU. Žádné AI nástroje nad kódem klienta bez písemného souhlasu.
- [ ] Na konci smazat data a smazání potvrdit e-mailem.

### Fakturace

- [ ] Fakturoid nebo iDoklad, samostatný účet. Jako neplátce DPH na fakturu „Nejsem plátce DPH“.
- [ ] **DPH:** plátcem od 1. 1. dalšího roku při obratu nad 2 mil. Kč, nad 2 536 500 Kč už den po překročení ([Pohoda](https://portal.pohoda.cz/dane-ucetnictvi-mzdy/dph/dph-v-roce-2025-1-dil-registrace-platce)).
- [ ] **Služba firmě v jiném státě EU:** stáváte se identifikovanou osobou, registrace do 15 dnů ([ePravo](https://www.epravo.cz/top/clanky/identifikovana-osoba-i-neplatce-dph-musi-na-tuto-dan-myslet-111770.html)).
- [ ] **Záloha** jen u nefinancovaných nebo zahraničních klientů, a to až po kontrole rejstříku, účetní závěrky a financování.
- [ ] **Pojištění profesní odpovědnosti** s limitem 5–10 mil. Kč před první větší smlouvou. Cenu ověřit u Allianz, Kooperativy a ČPP.

### Vývoz, MPO a prověrky: červené čáry

- [ ] **Česká firma v ČR je v pořádku.** Podle zákona 38/1994 Sb. to není obchod s vojenským materiálem ([zákon](https://www.zakonyprolidi.cz/cs/1994-38)).
- [ ] **Vojensky specifický software pro zahraniční firmu** (i v EU nebo na Ukrajině) potřebuje povolení a licenci MPO ([licence](https://portal.gov.cz/sluzby-vs/licence-k-zahranicnimu-obchodu-s-vojenskym-materialem-S1631)). Na začátku ne.
- [ ] **Zboží dvojího užití:** vývozem je i zpřístupnění kódu mimo EU ([nařízení 2021/821](https://eur-lex.europa.eu/eli/reg/2021/821/2025-11-15)). Nic pro ruské nebo běloruské subjekty.
- [ ] **Prověrka NBÚ** bez utajovaných informací není potřeba a „do zásoby“ ji získat nejde ([zákon 412/2005](https://www.zakonyprolidi.cz/cs/2005-412)).
- [ ] **NCAGE teď neřešit,** v ČR ho dostávají hlavně přímí dodavatelé MO.
- [ ] **AQAP-2210:** certifikaci nepotřebujete. Stačí řízení verzí, dohledatelnost požadavků a testů a záznam změn.

---

## 9. Na co si dát pozor

| Signál | Proč je to problém | Co udělat nebo říct |
|---|---|---|
| **„Udělejte to zdarma jako ukázku“** | týdny práce bez závazku | „Proto máme pilot s možností skončit v polovině. Riskujete 37 500 Kč.“ |
| **Nekonečná specifikace a podrobný odhad předem** | pracujete zadarmo a návrh může skončit u konkurence | Rozsah na jednu stranu zdarma, víc až v placeném pilotu |
| **Rozšiřování směrem ke zbraním** („a ať to rovnou navádí, zaměřuje, přiděluje efektor“) | červená zóna: etika, vývoz, odpovědnost | Hranice v objednávce, zdvořile odmítnout |
| **„Testovací nástroj“ pro logiku zásahu nebo navádění** | i testovací nástroj pro zbraňovou logiku je zbraňový software | Příjem dat, záznam, přehrání a zobrazení ano, logika zásahu ne |
| **Přístup do jejich sítě nebo objektu, podklady se stupněm utajení** | prověrka na měsíce | Pro teď ne, nabídnout neutajovanou část |
| **Zahraniční klient nebo mateřská firma chce kód** | vojensky specifický kód = vývoz bez povolení | Jen přes českou firmu s povolením, klasifikaci mít písemně |
| **„Zaplatíme, až nám zaplatí armáda nebo hlavní dodavatel“** | čekání měsíce | Milníky po převzetí, splatnost 14–30 dní, nikdy „až nám zaplatí“ |
| **Platební riziko** (nefinancované startupy; ukrajinské firmy, kterým stát platí pozdě, [Mezha](https://mezha.media/en/oboronka/shtrafi-dlya-virobnikiv-zbroji-chomu-sperechayutsya-minoboroni-ta-zbroyni-kompaniji-302216); dlouhé splatnosti velkých skupin, ověřit) | peníze nepřijdou | Ověřit firmu, u rizikových klientů záloha 50 % |
| **Pokušení dělat průzkum pro vlastní produkt u klienta** | klient se bojí úniku know-how a ztratíte důvěru | Na zakázce jen jeho problém, produktové rozhovory jinde |
| **Tlak na termín u studeného kontaktu** | působí uměle a člověk neodpoví | Termín jen po ústním „ano“ (text F1) |
| **Dlouhodobý pronájem za nízkou sazbu na místě** | z vás se stanou levní zaměstnanci | Teď vůbec, aspoň 7 000 Kč/MD i později |
| **„Veškerý váš kód včetně knihoven je náš“** | přijdete o vlastní nástroje | Výslovný krátký seznam výjimek |
| **Neomezená odpovědnost, pokuty bez stropu** | OSVČ ručí celým majetkem | Strop ve výši ceny objednávky, jinak nepodepisovat |
| **Na schůzce chybí ten, kdo rozhoduje** | sympatický rozhovor, který nikam nevede | „Kdo to schvaluje? Přizveme ho na 15 minut?“ |
| **Rozšiřování rozsahu během pilotu** | z pevné ceny je ztráta | Každý nový požadavek jako změna s cenou nebo do dalšího pilotu |
| **Hraniční klienti** (Bagira, EVPÚ, JISR) | snadno sklouznete do zbraňové části | Jen oddělené servisní, testovací a datové úkoly, hranice v objednávce |
| **Vedlejší práce bez souhlasu zaměstnavatele** | konec spolupráce a právní riziko pro obě strany | Bez souhlasu dotyčný nepracuje, klient to ví předem |

**Pravidlo, které si teď spolu odsouhlaste:** co neuděláte, máte rozhodnuté předem. Neměňte to jen proto, že je na stole první peníze.

---

## Co ověřit

- Otevírací dobu Future Forces a jestli jde domlouvat schůzky v aplikaci veletrhu.
- Zda vystavují ELDIS, Fly4Future a esc Aerospace a zda má CzechInvest stánek.
- Limit poznámek na LinkedIn ve vašem účtu.
- Zda AURA, PragoData a Be a Future smějí mít subdodavatele a zda je potřeba prověrka.
- Prověrky u ERA (STELA) a VR Group / LOM Praha. Zda ERA používá ASTERIX.
- Zda je SAPIENT standardem NATO.
- Zda opravdu neexistuje bezplatný nástroj na propojení logů se šaržemi.
- Občanství obou kvůli rámečku „Bezpečnost a důvěra“.
- Poplatek za živnost, cenu s.r.o., cenu pojištění a poplatek AOBP.
- Délku nákupu a splatnosti v CSG a Omnipolu.
- Odhad CTO, že u studených kontaktů přijde podpis až koncem listopadu nebo v prosinci.

## Hlavní zdroje

- **Future Forces:** [registrace](https://future-forces-forum.org/events/registration) · [PVA EXPO](https://www.pvaexpo.cz/en/event/467) · [čeští vystavovatelé](https://www.future-forces.org/exhibitors/list/state/cze?lang=en) · [S-Tech a Defence Lab](https://future-forces-forum.com/useful/news/4479) · [Tech Happy Hours](https://luma.com/1asiah8a)
- **Signály náboru:** [TRL](https://www.trlspace.com/careers/software-engineer/) · [ERA](https://www.jobs.cz/rpd/2001478148/) · [VR Group](https://www.vrg.cz/cs/kariera/frontend-vyvojar-konstruktivni-simulace) · [Fly4Future](https://fly4future.com/career/robotics-sw-engineer/) · [esc Aerospace](https://www.jobs.cz/rpd/2001445257/) · [MSM](https://cz.linkedin.com/jobs/view/group-mes-lead-at-msm-group-4469868759) · [ELDIS](https://www.eldis.cz/volne-pozice) · [SII](https://www.jobs.cz/rpd/2001455685/) · [EAGLE.ONE](https://www.future-forces-forum.org/useful/news/4868)
- **Demo:** [SAPIENT](https://www.gov.uk/guidance/sapient-autonomous-sensor-system) · [PX4 Flight Review](https://docs.px4.io/main/en/log/flight_log_analysis.html) · [ArduPilot UAV LogViewer](https://ardupilot.org/dev/docs/common-uavlogviewer.html)
- **Subdodávky:** [AURA](https://www.hlidacstatu.cz/HledatSmlouvy?Q=%22AURA%2C%20s.r.o.%22%20ico%3A60162694) · [PragoData](https://www.baesystems.com/en/article/bae-systems-and-pragodata-work-together-to-deliver-integrated-product-support-to-czech-defence-sector) · [Be a Future](https://ekonomickydenik.cz/nejsou-ajtaci-provoz-webu-pro-obranu-zajistuje-privatni-firma-za-30-milionu/) · [Gofore](https://gofore.com/en/news/inside-information-gofore-acquires-technology-company-huld-significantly-growing-its-position-in-intelligent-industry-and-security-sectors/) · [AOBP](https://aobp.cz/en/member/)
- **Kanály:** [CzechInvest](https://czechinvest.gov.cz/en/Key-sectors/defence-hub) · [databáze dodavatelů](https://czechinvest.gov.cz/en/For-Investors/Database-of-Suppliers) · [b2match](https://www.b2match.com/e/dronetech-world-meeting-2026) · [EDTH](https://events.eurodefense.tech/) · [limity LinkedIn](https://help.lagrowthmachine.com/en/articles/8480511-linkedin-basic-accounts-new-connection-request-limits-advice-on-how-to-proceed)
- **Ceny:** [Tendergate](https://tendergate.ai/blog/software-day-rates-eu-27) · [Lemon.io](https://lemon.io/rate-calculator/czech/)
- **Právo:** [zákon 38/1994](https://www.zakonyprolidi.cz/cs/1994-38) · [licence MPO](https://portal.gov.cz/sluzby-vs/licence-k-zahranicnimu-obchodu-s-vojenskym-materialem-S1631) · [nařízení 2021/821](https://eur-lex.europa.eu/eli/reg/2021/821/2025-11-15) · [zákon 412/2005](https://www.zakonyprolidi.cz/cs/2005-412) · [§ 304 ZP](https://www.epravo.cz/top/clanky/vedlejsi-cinnost-zamestnance-114841.html) · [software na objednávku](https://www.epravo.cz/top/clanky/pravo-it-prava-k-software-na-objednavku-111074.html) · [ML21](https://www.aalto.fi/en/services/classification-system-in-the-eu-common-military-list)
