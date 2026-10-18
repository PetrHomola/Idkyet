# Ceník: interní logika a cílové organizace

Interní. Ceny nikdy nepište natvrdo: zdrojem je `config.json` (`prices` v Kč pro české zákazníky, `prices_en` v EUR pro zahraniční). Stejné ceny ukazuje `[WEB]/nabidka.html` a `[WEB]/en/offer.html`. Všechny ceny jsou bez DPH.

## 1. Základní ceník

| Služba | Cena | Rozsah v ceně | Termín |
|---|---|---|---|
| Kalkulačka | zdarma | bez omezení, běží u zákazníka | hned |
| Rychlá kontrola | [PRICE_QUICK] | 1 výrobek, do 500 řádků | do 10 pracovních dnů od úplných dat |
| Rychlá kontrola s návrhem přílohy o původu (EDIP) | [PRICE_QUICK_EDIP] | totéž + návrh přílohy do Procurement strategy | do 10 pracovních dnů |
| Sada dokladů | od [PRICE_PACK] | 1 výrobek, do 500 řádků a 80 dodavatelů | 4–6 týdnů |
| Sada dokladů, rozšíření | [PRICE_PACK_EXTRA] | každých dalších započatých 250 řádků | |
| Hlídání | [PRICE_MONITOR] měsíčně | 1 výrobek | průběžně |
| Pro dodavatele | [PRICE_SUPPLIER] | podle složitosti, viz níže | |
| Posila u vás | [PRICE_DAY] za den | práce u zákazníka pod NDA, na jeho zařízeních | |

**Zápočet:** cena Rychlé kontroly se odečte od Sady dokladů pro stejný výrobek, pokud ji zákazník objedná do 60 dnů od předání Rychlé kontroly. Říkejte to v každé nabídce Rychlé kontroly; je to hlavní důvod objednat Sadu brzy.

## 2. Jak nacenit větší zakázky

**Řádky** = tier-1 díly a podsestavy z vlastní výroby jednoho výrobku po sloučení duplicit. Suroviny se do počtu nezapočítávají. Řádky spočítejte z výpisu dřív, než pošlete cenu.

**Sada dokladů nad 500 řádků:**

```
cena = [PRICE_PACK] + počet_bloků × [PRICE_PACK_EXTRA]
počet_bloků = zaokrouhlit nahoru((řádky − 500) / 250), nejméně 0
```

Příklad: 1 100 řádků → (1 100 − 500) / 250 = 2,4 → 3 bloky → [PRICE_PACK] + 3 × [PRICE_PACK_EXTRA]. Číslo dopočítejte z `config.json` až v nabídce.

**Sada dokladů nad 80 dodavatelů:** připočtěte odhad práce v dnech × [PRICE_DAY]. Výchozí odhad (návrh, upravte po prvních zakázkách): 1 den na každých dalších započatých 20 dodavatelů. Kampaň je hlavně komunikace s dodavateli, proto se počítá podle dodavatelů, ne podle řádků.

**Rychlá kontrola nad 500 řádků:** dvě možnosti, nabídněte obě.
1. Rychlá kontrola nad celým výpisem: [PRICE_QUICK] + odhad dní navíc × [PRICE_DAY]. Výchozí odhad (návrh): 1 den na každých dalších započatých 500 řádků.
2. Rychlá kontrola nad 500 nejdražšími řádky, zbytek jako souhrn bez rozboru po řádcích. Pevná cena [PRICE_QUICK]. Ve zprávě jasně uveďte, jaký podíl nákladů rozbor pokrývá.

**Více výrobků nebo variant:** každý výrobek je samostatná zakázka (pravidlo se počítá na výrobek a varianty nesčítáme). Pokud mají varianty z velké části společný kusovník, nabídněte k první Rychlé kontrole porovnání dalších variant jako dny × [PRICE_DAY] podle odhadu práce.

**Hlídání:** [PRICE_MONITOR] měsíčně za výrobek. Návrh podmínek: fakturace čtvrtletně předem, výpověď ke konci čtvrtletí. Vázat na termíny zákazníka: žádosti o platbu SAFE (Česko duben a říjen) nebo průběžné zprávy EDIP.

**Pro dodavatele** ([PRICE_SUPPLIER]), kde v rozpětí:
- dolní hranice: malý počet položek, které dodavatel celé vyrábí sám, prohlášení v jednom jazyce,
- střed: desítky položek, část z dovezeného materiálu nebo dílů, posouzení poslední podstatné přeměny,
- horní hranice: mnoho položek, sestavy z dovezených dílů, nutná konzultace s celním specialistou, prohlášení ve více jazycích a nastavení obnovy.
Hranice potvrďte po prvních třech zakázkách a zapište sem.

**Posila u vás:** [PRICE_DAY] za den, nejméně 1 den. Cesty mimo [MĚSTO] dohodnout předem. Hodí se, když data nesmí z firmy: stejný rozsah jako Rychlá kontrola, ale na zařízení zákazníka a s offline kalkulačkou. Cena: vyšší z [PRICE_QUICK] a (odhad dní × [PRICE_DAY]).

**Zahraniční zákazníci (SK, PL, BAE Hägglunds a další):** ceny z `prices_en` v EUR. U plátců DPH v jiném státě EU obvykle přenesená daňová povinnost; ověřte s účetní.

**Platební podmínky:** splatnost 14 dní. Rychlá kontrola fakturou po předání. Sada dokladů polovina po potvrzení objednávky, zbytek po předání (viz [objednavka-vzor.md](objednavka-vzor.md)).

## 3. Slevy jen za rozsah

Cenu nesnižujeme procenty. Když je cena problém, zmenšíme práci:

- méně řádků (nejdražší řádky, zbytek jako souhrn),
- jeden výrobek nebo jedna varianta místo všech,
- jen jedna metoda, pokud zákazník výrobu podsestav nemá,
- zákazník obešle dodavatele sám s našimi vzory a e-maily z kalkulačky, my jen vyhodnotíme odpovědi a spočítáme výsledek (ocenit jako dny × [PRICE_DAY]),
- bez scénářů „co když“,
- prohlášení jen v jednom jazyce.

Odpověď na „dáte nám slevu?“:
> „Cenu nesnižujeme, ale můžeme zmenšit rozsah tak, aby odpovídal rozpočtu. Například…“

## 4. Zaváděcí nabídka

- **Komu:** jen prvním dvěma zákazníkům. Ideálně středně velký dodavatel v kooperaci programu SAFE nebo žadatel EDIP, jehož jméno bude pro další zákazníky srozumitelné.
- **Co:** Rychlá kontrola za poloviční cenu (polovina z [PRICE_QUICK], případně z [PRICE_QUICK_EDIP]).
- **Výměnou za:** referenci, sjednanou písemně v objednávce (čl. 5.3): souhlas s uvedením názvu na webu, nebo anonymizovaný popis, a jeden referenční telefonát. Pokud firma nechce být jmenována, anonymizovaný popis s telefonátem je pořád cenný.
- **Na webu** se uvádí jen v sekci nabídky jako „zaváděcí nabídka“. Po druhé objednávce ji z webu stáhněte (správce webu upraví `site/index.html`, `site/nabidka.html`, `site/en/index.html` a `site/en/offer.html`).
- Zápočet do Sady dokladů platí ve výši skutečně zaplacené ceny.

## 5. Partneři

Návrh podmínek, upravte podle partnera:

| Partner | Co dělá | Odměna (návrh) |
|---|---|---|
| Celní specialista | posuzuje sporná určení původu | za případ, nebo 20–30 % z tržby zakázky, na které pracuje |
| Advokátní kancelář | výklad, doložky o původu do smluv, přivede klienta | doporučení s provizí [DOPLNIT] z první zakázky, nebo subdodávka pro kancelář za naše ceny |
| Grantový poradce | žádost EDIP, přivede žadatele | doporučení s provizí [DOPLNIT] z první zakázky |
| Celní tým poradenské firmy, speditér | celní doklady k dovozům | rozdělení práce na zakázce, každý fakturuje svou část |
| Partner SAP | integrace výstupů do SAP | doporučení oběma směry |

Výši provize za doporučení rozhodněte před prvním jednáním s partnerem a zapište sem. Provize se platí jen z přijatých plateb zákazníka.

## 6. Cílové organizace

Bez jmen osob: role najděte na LinkedInu nebo se zeptejte na veletrhu. Do zpráv dávejte jen fakta z SPEC, oddíl 4. Popisy organizací níže jsou interní orientace; co je označeno „ověřit“, před použitím ověřte.

**Priorita:** A = oslovit do 2 týdnů, B = do 4 týdnů, C = přes partnera nebo později.

### Hlavní dodavatelé a výrobci

| Organizace | Proč | Komu | Kanál | Šablona | Priorita |
|---|---|---|---|---|---|
| Tatra Trucks / Tatra Defence Systems | Tatra T-815 v českém SAFE (319 mil. EUR); slovenský SAFE mimo jiné na Tatru | vedoucí trade compliance, ředitel nákupu, manažer programu T-815 | Future Forces, AOBP, LinkedIn | 1a | A |
| CSG, skupinová compliance | rozhodnutí na úrovni skupiny může určit formát pro více firem skupiny i jejich dodavatele (strukturu skupiny ověřit) | vedoucí skupinové trade compliance | Future Forces, LinkedIn | 1a / 1b | A |
| KNDS (Leopard 2A8) | Leopard 2A8 v českém SAFE (802 mil. EUR); česká kooperace | trade compliance, řízení průmyslové spolupráce | Future Forces, LinkedIn | 1b | B |
| Ray Service | možný tier-1 dodavatel programů SAFE, elektro a kabeláž (ověřit) | nákup, exportní kontrola | AOBP, LinkedIn | 1a | A |
| Meopta | možný tier-1 dodavatel (ověřit, kterých programů) | nákup, compliance | AOBP, LinkedIn | 1a | B |
| Colt CZ Group | výrobce v obranném průmyslu (ověřit účast v programech SAFE a EDIP) | skupinová compliance, nákup | AOBP, LinkedIn | 1a | B |
| Excalibur Army | výrobce v obranném průmyslu, skupina CSG (ověřit) | nákup, compliance | AOBP, přes CSG | 1a | B |
| STV Group | výrobce v obranném průmyslu (ověřit účast v programech) | nákup, compliance | AOBP | 1a | B |
| VOP CZ | výrobce v obranném průmyslu (ověřit účast v programech) | nákup, compliance, koordinátor EU projektů | AOBP | 1a | B |
| RETIA, ERA, ELDIS | elektronika; možní žadatelé EDIP (výzva na klíčové elektronické komponenty 122,25 mil. EUR) | koordinátor EU projektů, compliance | AOBP | 1a (věta EDIP) | A |
| Explosia | možný žadatel EDIP (ověřit) | koordinátor EU projektů, nákup | AOBP | 1a (věta EDIP) | B |
| MSM Group (SK) | slovenský SAFE (asi 2,3 mld. EUR, mimo jiné Tatra a CV90); vazbu na programy ověřit | trade compliance, nákup | Future Forces, ZBOP SR | 1a / 1b | A |
| Konštrukta-Defence (SK) | slovenský SAFE (vazbu na programy ověřit) | trade compliance, nákup | Future Forces, ZBOP SR | 1a / 1b | B |
| BAE Systems Hägglunds | CV90 ve slovenském SAFE; slovenští dodavatelé v průmyslové spolupráci | manažer průmyslové spolupráce pro Slovensko | Future Forces | 1b | A |
| Polští střední dodavatelé: Teldat, AMZ-Kutno, Miranda, Celtech | polský SAFE 43,7 mld. EUR | nákup, kvalita, compliance | LinkedIn, PIPROK (polsky přes partnera) | 1b | C |

### Partneři a kanály

| Organizace | Proč | Komu | Kanál | Šablona | Priorita |
|---|---|---|---|---|---|
| AOBP (roli kontaktního místa pro EDF ověřit) | kanál k členům, webinář, předání dotazů na MO | edf@aobp.cz (adresu ověřit) | e-mail | 4 | A |
| CMS | o pravidle 35 % publikují (ověřit aktuální článek) | partner pro veřejné zakázky a obranu | e-mail, LinkedIn | 3a | A |
| Kinstellar | advokátní kancelář v regionu (ověřit tým pro obranu) | partner pro veřejné zakázky a obranu | e-mail, LinkedIn | 3a | B |
| PROKURENT | o programu SAFE publikují (ověřit aktuální článek) | partner pro veřejné zakázky | e-mail, AOBP | 3a | A |
| KPMG, PwC, EY: celní týmy | klienti z průmyslu, přístup k celním dokladům | vedoucí celního a obchodního poradenství | LinkedIn, e-mail | 3c | B |
| NTT DATA Business Solutions CZ | partner SAP; výstupy se zemí původu po řádcích pro zákazníky se SAP (členství v AOBP ověřit) | vedoucí praxe SAP GTS nebo logistiky, partner manager | AOBP, LinkedIn | 3a (upravit) | B |
| DHL Global Forwarding, celní oddělení | celní doklady k dovozům (členství v AOBP ověřit) | vedoucí celního oddělení CZ | AOBP, LinkedIn | 3c | C |
| Grantoví poradci pro EDF a EDIP | připravují žádosti s uzávěrkou 16. 2. 2027 | jednatel, konzultant pro EDF | e-mail, AOBP | 3b | A |
| Celní specialisté, deklaranti | sporná určení původu | jednotlivci | LinkedIn | 3c | A |

**Evidence:** každou organizaci vést v tabulce kontaktů (README) se sloupci: organizace, role, kanál, datum prvního kontaktu, follow-up 1, follow-up 2, stav, další krok.
