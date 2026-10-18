# Software nejdřív: jak vydělat první peníze v obraně

*Navazuje na [obrana-3d-tisk.md](obrana-3d-tisk.md). Stav k 18. 10. 2026. Vychází z průzkumu pěti výzkumníků, tří nezávislých hodnotitelů a jednoho kritika.*

## Shrnutí

- **Software ano. Software pro tiskárny prodávaný armádám ne.** Nápad č. 1 v původní podobě neobstál:
  - Prusa už většinu sama prodává, část zdarma.
  - Konkurence s offline správou tiskáren pro armády už existuje.
  - Armády kupují tiskárny po pár kusech a software si zatím nekupují vůbec.
- **Doporučení má dva kroky najednou:**
  1. **Peníze hned:** zakázkový vývoj softwaru pro české obranné a dronové firmy. Faktura za 1–2 měsíce, žádná licence, žádné prověrky.
  2. **Produkt vedle toho:** evidence výroby a původu dílů pro soukromé výrobce dronů a obranné dodavatele.
     Tedy co se z čeho vyrobilo, na čem, kým a jestli díly nepocházejí z Číny. Tisk z původního nápadu se stane jedním modulem, ne celou firmou.
- **Za 3 dny (21.–23. 10. 2026) je v Praze veletrh Future Forces.** Je to nejlevnější způsob, jak tento týden potkat budoucí zákazníky i Prusu.

## Proč první nápad v původní podobě nefunguje

| Předpoklad z prvního rozboru | Co jsme zjistili |
|---|---|
| Bezpečný nečínský tisk pro armády zatím nikdo nevlastní | **Prusa ho už prodává:** tiskárny Critical Infrastructure Edition (bez Wi-Fi a kamery, šifrované USB, cílí na armády a NATO) a zdarma **Prusa Connect Local** (vlastní server pro správu tiskáren bez internetu, role, vlastní certifikáty, API). Tiskárny Prusa už samy kontrolují podpis tiskových souborů. |
| Offline správa tiskáren s auditní stopou je mezera na trhu | Printago (USA) prodává verzi bez internetu přímo pro obranu, SimplyPrint (Dánsko) nabízí vlastní hosting i armádám, existují i bezplatné nástroje. |
| Armáda je zákazník | AČR kupuje 3D tisk po zakázkách za 57–650 tis. Kč a software tam nefiguruje vůbec. Bundeswehr má 33 tiskáren a německý kontrolní úřad zjistil, že problém je v datech a licencích, ne v zabezpečení. Prodej armádě trvá 9–24 měsíců. |
| Je to velký trh | Software pro 3D tisk je malý trh: SimplyPrint, lídr v EU, má 5–6 lidí. Oqton se koupil za 180 mil. USD a prodal za 3,3 mil. USD. LEO Lane (ochrana tiskových souborů) zkrachoval. Realisticky 50–300 tis. EUR ročně za 2 roky. |

**Co z prvního nápadu přežívá:** vrstva nad Prusou a dalšími tiskárnami, kterou zatím nikdo nemá. Jeden záznam ke každému dílu: verze návrhu, nastavení tisku, otisk a podpis souboru, sériové číslo tiskárny, operátor, šarže materiálu a výsledek kontroly. To se ale prodává jako **důkaz pro audit a zákazníka**, ne jako „zabezpečení tisku“.

## Pořadí nápadů podle hodnotitelů

Hodnotitelé dávali body 1–10, každý z jiného pohledu: rychlost peněz / velikost a obhajitelnost trhu / proveditelnost pro dva vývojáře.

| # | Nápad | Peníze | Trh | Proveditelnost | Průměr |
|---|---|---|---|---|---|
| 1 | **Zakázkový vývoj pro obranné a dronové firmy** (most k penězům) | 9 | 2 | 9 | 6,7 |
| 2 | **Evidence výroby a kvality pro malé výrobce dronů** (s modulem pro tisk) | 6 | 6 | 8 | 6,7 |
| 3 | **Doklad o „čistém“ dodavatelském řetězci** (původ součástek, bez Číny) | 5 | 7 | 6 | 6,0 |
| 4 | Pomoc s plněním nového zákona o kybernetické bezpečnosti (NIS2) pro dodavatele obrany | 6 | 4 | 5 | 5,0 |
| 5 | Přehled zakázek a grantů pro obranné firmy | 5 | 3 | 5 | 4,3 |
| … | Software pro tiskárny prodávaný přímo armádám (původní nápad) | 2 | 2 | 3 | 2,3 |
| … | Katalog náhradních dílů s licencí za každý tisk | 1 | 3 | 2 | 2,0 |

Nápady 2 a 3 jsou ve skutečnosti jeden produkt:

- **Nápad 2 (evidence výroby):** začátek, prodává se rychleji.
- **Nápad 3 (původ součástek):** velký příběh pro investory.
  - Evropské půjčky SAFE (150 mld. EUR) vyžadují, aby **aspoň 65 % hodnoty součástek pocházelo z EU, Ukrajiny nebo EHP**. Dodavatelé to budou muset doložit.
  - Americká pravidla pro drony (Drone Dominance) postupně do srpna 2027 zpřísňují požadavky na doložení původu.
  - Evropského hráče, který by to řešil, jsme nenašli. Americký First Resonance má 32 mil. USD a cílí na USA.

## Doporučený plán

### Týden 1 (teď)

- **Future Forces, PVA Expo Praha, 21.–23. 10. 2026.** Přes 400 vystavovatelů: české zbrojovky, výrobci dronů, CzechInvest a pravděpodobně i Prusa.
  - Cíl: 10–15 rozhovorů o problémech (ne prodej) a 2–3 nabídky zakázkového vývoje.
  - Na koho mířit: 3DFENSE, TRL Drones, Dronetag, LPP, Fly4Future, U&C UAS, EAGLE.ONE, firmy ze skupiny CSG, Omnipol.
- **Táta:** zjistit, koho konkrétně zná, a domluvit 3–5 představení u firem, ne u ministerstva.
- **Založit s.r.o.,** připravit šablonu smlouvy a NDA.

### Měsíce 0–3: peníze ze služeb

- Zakázkový vývoj pro obranné a dronové firmy. Orientačně 450–800 Kč/h, ve dvou zhruba 150–250 tis. Kč měsíčně (odhad, ověřit).
- **Pravidla, aby z vás nezůstala jen agentura:**
  - Služby nejvýš na 50–60 % času.
  - Zákazníky vybírat podle toho, jestli můžou být budoucími uživateli produktu.
  - Ve smlouvách si nechat práva na obecné, znovupoužitelné části kódu.
- Volitelně pevně naceněný balíček **„přechod z Bambu Lab“**:
  - tiskárny Prusa Critical Infrastructure,
  - Connect Local v uzavřené síti,
  - nastavení podepisování souborů,
  - dokumentace pro NÚKIB a audit.

  Nabízet spolu s Prusou nebo jejími prodejci, jako jejich implementační partner.

### Měsíce 3–12: úzký produkt pro platící pilotní zákazníky

- Evidence výroby pro malé výrobce dronů a obranné dodavatele:
  - rodokmen sériových čísel,
  - kontrola kvality,
  - původ součástek a jejich podíl z EU,
  - modul pro tisk nad API Prusa Connect Local.
- Placené pilotní projekty, i kdyby za 5–15 tis. EUR. Žádné pilotní projekty zdarma.
- **Pravidlo pro ukončení:** pokud do ~8 týdnů nebudou aspoň 2 placené pilotní projekty nebo podepsané závazné zájmy (5 tis. EUR+), produkt odložit a zůstat u služeb.
  Totéž platí, pokud Prusa potvrdí, že audit a kontrolu kvality přidá do Connect Local sama.

### Armáda až potom

- AČR a Univerzita obrany jako referenční pilotní projekt přes prodejce, kteří už ministerstvu dodávají. Zakázka malého rozsahu jde od 3. 4. 2025 do 3 mil. Kč bez DPH.
- NSPA, DIANA a akreditace až z vydělaných peněz.

## Granty: podat paralelně, ale nepočítat s nimi na výplaty

| Program | Kolik | Kdy | Poznámka |
|---|---|---|---|
| EUDIS Business Accelerator | voucher 120 tis. EUR | uzávěrka 16. 11. 2026, start březen 2027 | přijímá se ~4 % |
| NÚKIB Cyber Security Boost | 1,5–2,5 mil. Kč, 80 % záloha | uzávěrka 30. 11. 2026 | nová s.r.o. asi neprojde (chtějí 2 uzavřené účetní roky), šlo by přes existující firmu |
| NATO DIANA | 100 tis. + až 300 tis. EUR | další výzva ~červen 2027 | peníze reálně 2028 |
| TA ČR PRODEF, TREND | až desítky mil. Kč | další výzvy 2027 | peníze 2028+, potřeba výzkumný partner |
| Kód NCAGE + registrace u NSPA | zdarma | ~10 pracovních dní | udělat hned, je to vstupenka do zakázek NATO |

Podrobnosti grantů jsou z průzkumu, před podáním ověřit na stránkách programů.

## Investoři

- **Presto Ventures (Praha):** nový fond 150 mil. EUR na obranu a bezpečnost, spolupracuje s CSG. Investuje 0,5–5 mil. EUR, většinou do firem, které už mají tržby. To je další důvod začít službami.
- **NATO Innovation Fund:** později, až bude produkt.
- **Táta:** rozumná je malá částka na prvních 6–12 měsíců jako polštář, ne všechno. Služby by se měly brzy uživit samy.

## Na co dát pozor

- **Prusa je klíčový partner i největší riziko:**
  - Může si chybějící vrstvu postavit sama.
  - Je potřeba s ní mluvit hned a zeptat se, co má v plánu.
  - Taky je potřeba ověřit licenci Connect Local (OCL v1.1) pro komerční nadstavby.
- **Vývoz:** software pro obranu poslaný mimo EU (i na Ukrajinu, i jen přístup ke kódu) může potřebovat povolení MPO. Ověřit před první dodávkou.
- **Neslibovat, že podpis souboru zabrání sabotáži.** Soubor jde změnit před podpisem nebo po ověření. Prodávat dohledatelnost a důkazy.
- **Vyhnout se zpočátku:** utajovaným zakázkám (prověrka NBÚ) a softwaru pro zbraně a navádění.
- **Ukrajina:** obrovské množství tiskáren, ale málo peněz a vysoké riziko neplacení. Hodí se na pilotní projekty a reference, ne jako zdroj příjmů.
- **Odhady:** řada čísel o velikosti zakázek a hodinových sazbách jsou odhady výzkumníků, ne ověřená data. Jsou to hypotézy k ověření v rozhovorech.

## Zdroje

- Prusa: [Connect Local (early access)](https://www.prusa3d.com/p/prusa-connect-local/early-access/), [Critical Infrastructure](https://www.prusa3d.com/p/critical-infrastructure/), [Trust Center](https://www.prusa3d.com/p/trustcenter/)
- Konkurence: [Printago Defense](https://printago.io/solutions/defense), [SimplyPrint on-premise](https://simplyprint.io/enterprise/on-premise), [Oqton prodej](https://www.metal-am.com/hubb-to-acquire-3d-systems-oqton-and-3dxpert-software-platforms/), [First Resonance](https://finder.techleap.nl/news/feed/first-resonance-raises-32m-for-ion-os-1)
- Poptávka: [Bundeswehr a 3D tisk (Correctiv)](https://correctiv.org/bundesrechnungshof/2025/07/16/bundeswehr-verschwendet-millionen-3d-druck-ohne-plan-ohne-wirkung/), [NDAA 2026 (King & Spalding)](https://www.kslaw.com/insights/articles/fy-2026-ndaa-domestic-sourcing-artificial-intelligence-cybersecurity-and-acquisition-reforms)
- Původ součástek: [EU SAFE](https://defence-industry-space.ec.europa.eu/eu-defence-industry/safe-security-action-europe_en), [Drone Dominance – dodavatelský řetězec](https://insideunmannedsystems.com/inside-the-drone-dominance-supply-chain-what-every-u-s-drone-company-must-source-and-by-when/)
- Zakázky a granty: [Limity VZMR po novele 2025](https://crr.gov.cz/wp-content/uploads/2025/05/Informace-Centra-ke-zvyseni-limitu-VZMR-po-novele-3.-4.-2025-a-zvyseni-limitu-pro-primy-nakup_FINAL.pdf), [EUDIS Business Accelerator](https://eudis.europa.eu/business-accelerator_en), [NÚKIB výzvy](https://nukib.gov.cz/cs/vyzvy-2/), [CzechInvest Defence Hub](https://czechinvest.gov.cz/en/Key-sectors/defence-hub)
- Akce a investoři: [Future Forces Forum](https://www.futureforcesforum.com/), [Presto Ventures + CSG](https://www.defensemagazine.com/article/presto-ventures-teams-up-csg-to-invest-eur150-million-in-frontier-technologies-and-security-innovations)
