# Obchodní podklady [BRAND] (interní)

Interní sada pro prodej služeb kolem pravidla 35 % (SAFE / EDIP). Nezveřejňovat. Texty pro zákazníky jsou připravené k odeslání po doplnění hranatých závorek.

## Obsah

| Soubor | K čemu |
|---|---|
| [oslovovani.md](oslovovani.md) | Hotové zprávy: hlavní dodavatelé (CZ/EN), tier-1 dodavatelé, partneři (CZ/EN), AOBP, dvě kola follow-upů, LinkedIn (žádosti o spojení, 3 příspěvky) |
| [veletrh-a-schuzky.md](veletrh-a-schuzky.md) | Future Forces (21.–23. 10. 2026, termín ověřit), scénář 20minutového úvodního hovoru, převod na placenou Rychlou kontrolu, námitky, zápis po schůzce |
| [webinar-aobp.md](webinar-aobp.md) | 45minutový webinář „Jak spočítat a doložit 35 % podle metodiky EDIP“: osnova, obsah slajdů, poznámky, ukázka kalkulačky, příprava na dotazy |
| [dotazy-pro-komisi.md](dotazy-pro-komisi.md) | Dotazy na helpdesk výzvy EDIP a přes AOBP na MO k dokladům pro SAFE, jak odpovědi zveřejnit |
| [objednavka-vzor.md](objednavka-vzor.md) | Vzor objednávky Rychlé kontroly a Sady dokladů včetně přílohy o datech (před použitím nechat projít právníkem) |
| [cenik-interni.md](cenik-interni.md) | Jak nacenit větší kusovníky, pravidla slev, zaváděcí nabídka, seznam cílových organizací s rolí a kanálem |

## Tři pravidla

1. **Fakta jen z [docs/SPEC.md](../docs/SPEC.md), oddíl 4.** Co tam není, neříkáme ani nepíšeme. Žádné vymyšlené reference, čísla ani jména zákazníků.
2. **Nedáváme právní stanoviska.** Výstup je výpočet z dokladů a prohlášení dodavatelů. Sporná určení původu konzultujeme s celním specialistou. Neslibujeme, že výpočet přijme Komise nebo MO.
3. **Bereme jen obchodní data** (díl nebo kategorie, dodavatel, cena, země původu, doklad). Žádné výkresy, specifikace, technickou dokumentaci, utajované informace ani data podléhající ITAR. Na veletrhu ani na schůzce si nebereme a nerozdáváme USB disky.

## Zástupné údaje

Hranaté závorky doplňte před odesláním. Firemní údaje a ceny berte vždy z `config.json`, aby seděly s webem. Nic z toho nepřepisujte natrvalo do těchto souborů.

| Zástupný text | Zdroj |
|---|---|
| `[BRAND]`, `[COMPANY]`, `[ICO]`, `[ADDRESS]`, `[EMAIL]`, `[PHONE]`, `[WEB]`, `[LINKEDIN]` | `config.json` (stejné klíče) |
| `[PRICE_QUICK]`, `[PRICE_QUICK_EDIP]`, `[PRICE_PACK]`, `[PRICE_PACK_EXTRA]`, `[PRICE_MONITOR]`, `[PRICE_SUPPLIER]`, `[PRICE_DAY]` | `config.json`: `prices` (Kč) pro české texty, `prices_en` (EUR) pro anglické texty a zahraniční zákazníky |
| `[OSLOVENÍ]`, `[NAME]`, `[FIRMA]`, `[PROGRAM]`, `[MOJE JMÉNO]`, `[FUNKCE]`, `[TERMÍN]` | doplníte podle adresáta |

Odkazy na web: kalkulačka `[WEB]/kalkulacka/`, offline verze `[WEB]/cirus-origin-kalkulacka-offline.html`, metodika `[WEB]/metodika.html`, nabídka `[WEB]/nabidka.html` (EN `[WEB]/en/offer.html`), ochrana dat `[WEB]/ochrana-dat.html`, šablony `[WEB]/sablony/`.

## Než pošlete první zprávu

- [ ] V `config.json` doplněné všechny položky `[DOPLNIT: …]`, web nasazený, odkazy výše fungují.
- [ ] Funkční e-mail na doméně `[WEB]` s podpisem (jméno, `[BRAND]`, `[WEB]`, `[PHONE]`).
- [ ] Profil na LinkedInu: jedna věta o pravidle 35 % a odkaz na kalkulačku.
- [ ] Vytištěná nabídka z `[WEB]/nabidka.html` (A4) a vizitky s QR kódem na kalkulačku.
- [ ] `objednavka-vzor.md` prošel právník, máme připravenou verzi k podpisu.
- [ ] Rozjednaný celní specialista pro sporná určení původu a ověřené pojištění profesní odpovědnosti.
- [ ] Jednoduchá evidence kontaktů (tabulka): organizace, role, kanál, datum, stav, další krok.

## Tři týdny od startu

Plán počítá se startem v pondělí 19. 10. 2026 (stav podkladů k 18. 10. 2026).

### Týden 1 (19.–25. 10.): Future Forces

- **Po 19. 10.:** kontrola webu a kalkulačky na mobilu i v tisku. Registrace na EU Export Control Forum (20. 11. 2026, online; datum i registraci ověřit). E-mail na edf@aobp.cz s nabídkou webináře (oslovovani.md, část 4).
- **Út 20. 10.:** seznam stánků podle katalogu vystavovatelů (cenik-interni.md, cílové organizace), jedna otázka na každý typ stánku (veletrh-a-schuzky.md).
- **St–Pá 21.–23. 10.: Future Forces.** Neprodávat. Ptát se, sbírat odpovědi a vizitky, po každém rozhovoru zápis. Večer téhož dne krátký e-mail s odkazem na kalkulačku (oslovovani.md, 5c) a žádost o spojení na LinkedInu.
- **So–Ne 24.–25. 10.:** přepsat zápisy do evidence, vybrat 10 nejteplejších kontaktů a navrhnout jim 20minutový hovor.

### Týden 2 (26. 10.–1. 11.; 28. 10. je státní svátek): oslovení a dotazy

- 10–15 e-mailů hlavním dodavatelům a jejich přímým dodavatelům (část 1), úvodní hovory s kontakty z veletrhu.
- Partneři: CMS, Kinstellar, PROKURENT, celní týmy KPMG, PwC a EY, grantoví poradci (část 3). Hledání celního specialisty.
- Dotazy na helpdesk výzvy EDIP a přes AOBP na MO (dotazy-pro-komisi.md).
- LinkedIn: příspěvek 1 „Pravidlo 35 % v pěti větách“, 15–20 žádostí o spojení.
- Webinář AOBP: dohodnout termín, připravit slajdy a ukázku.

### Týden 3 (2.–8. 11.): hovory a první objednávky

- Follow-up 1 na e-maily z týdne 2 (část 5), follow-up 2 o týden později.
- E-maily tier-1 dodavatelům, kteří dostávají dotazníky o původu (část 2).
- LinkedIn: příspěvek 2 „Metoda (a) a (b) na příkladu Komise“; příspěvek 3 „Minimální sada dokladů“ v týdnu 4.
- Každý dobrý hovor končí konkrétním návrhem Rychlé kontroly a objednávkou poslanou ještě ten den.

### Cíle

- Do 8. 11.: 10 úvodních hovorů, 3 návrhy Rychlé kontroly, termín webináře AOBP, odeslané dotazy na Komisi.
- Do poloviny prosince: 3 firmy potvrdí, že data o původu dnes sbírají ručně, a 1 placená Rychlá kontrola. Pak naplno na žadatele EDIP (uzávěrka 16. 2. 2027) a na dubnovou žádost o platbu SAFE.
