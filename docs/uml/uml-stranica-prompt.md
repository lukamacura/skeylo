# Zadatak: stranica `/uml` — „Od skice do realizacije UML dijagrama“ (Kurirska služba)

Napravi novu stranicu na ruti `/uml` u postojećoj Next.js aplikaciji. Stranica je prezentacija (slajdovi) koja prikazuje UML deo studentskog projekta na temu **Kurirska služba**: prvo tri skice nacrtane u Excalidraw-u, zatim iste te dijagrame kao animirane, interaktivne, pregledne SVG realizacije, i sav tekst koji zadatak traži.

Ovo je fakultetski projekat koji se brani pred nastavnim timom. **Tačnost UML notacije i sadržaja je važnija od efekata.** Model (akteri, slučajevi upotrebe, klase, atributi, veze, kardinalnosti, poruke) je već završen i proveren. Tvoj posao je da ga verno prikažeš, ne da ga menjaš ili „poboljšavaš“.

---

## 0. Pre nego što počneš

1. Pregledaj repozitorijum: `package.json`, verziju Next.js-a, da li je App Router (`app/`) ili Pages Router (`pages/`), TypeScript, način stilizovanja (Tailwind, CSS Modules…), postojeći layout, fontove, temu (svetla/tamna) i da li je već instaliran `framer-motion` / `motion`.
2. Prati postojeće konvencije projekta: strukturu foldera, imenovanje, stil koda i dizajn-tokene. Ne menjaj druge stranice ni globalne stilove osim ako je neophodno. Ako je neophodno, reci zašto.
3. Slike skica su već u `public/uml/`:
   - `public/uml/skica-slucajevi-upotrebe.png` (2400×1049)
   - `public/uml/skica-dijagram-klasa.png` (2400×2086)
   - `public/uml/skica-dijagram-sekvenci.png` (2400×1487)

   Ako ih nema, stani i reci mi. Nemoj ih generisati.

4. Nove zavisnosti: ako `framer-motion`/`motion` već postoji, koristi ga. Ako ne postoji, smeš da ga dodaš (jedna zavisnost). **Ne dodaj** biblioteke za automatski raspored dijagrama (React Flow, Mermaid, dagre, elk, JointJS…). Raspored mora biti ručno zadat da bi se poklapao sa skicama, a te biblioteke ne umeju ispravnu UML notaciju (kardinalnosti na krajevima veza, «include» strelice, okvir `alt`).

---

## 1. Kontekst zadatka (šta se predaje)

Nastavni tim je tražio:

1. Dijagram slučajeva upotrebe i tekstualni opis svakog osnovnog slučaja upotrebe, po šablonu sa slajda 46 (UML I deo).
2. Dijagram klasa sa najmanje osam klasa i kratak opis klasa i njihovih obeležja.
3. Dijagram sekvenci.

Sve ovo mora biti na stranici: sva tri dijagrama i sav tekst iz odeljka 6.

---

## 2. Struktura prezentacije (slajdovi, ovim redom)

| #   | Slajd                       | Sadržaj                                                                                                                                                                                                                                           |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Naslovni                    | Naslov „Od skice do realizacije UML dijagrama“, podnaslov „Tema: Kurirska služba“, red „UML deo projekta — PoIS“, mesta za `[Ime Prezime]` i `[Broj indeksa]` kao konstante na vrhu fajla sa sadržajem (ja ih popunjavam).                        |
| 2   | Zadatak i sistem            | Tri tražene stavke (odeljak 1) i kratak opis sistema (odeljak 6.1), uključujući životni ciklus pošiljke kao vizuelni niz statusa: Kreirana → Preuzeta → Isporučena / Vraćena.                                                                     |
| 3   | Skice                       | Sve tri skice (odeljak 3), svaka sa naslovom („Dijagram slučajeva upotrebe“, „Dijagram klasa“, „Dijagram sekvenci“), i jasno istaknut tekst: **„Ovo su skice kreirane u Excalidraw-u.“** Klik na skicu otvara je uvećanu (lightbox, Esc zatvara). |
| 4   | Dijagram slučajeva upotrebe | Interaktivna realizacija (odeljak 5.1).                                                                                                                                                                                                           |
| 5   | Opisi slučajeva upotrebe    | Šest tekstualnih opisa (odeljak 6.2) u formatu sa slajda 46. Izbor opisa preko liste/tabova, a na štampi i bez JS-a svi su vidljivi.                                                                                                              |
| 6   | Dijagram klasa              | Interaktivna realizacija (odeljak 5.2).                                                                                                                                                                                                           |
| 7   | Opis klasa i obeležja       | Osam klasa (odeljak 6.3).                                                                                                                                                                                                                         |
| 8   | Dijagram sekvenci           | Interaktivna realizacija sa koračanjem kroz poruke (odeljak 5.3).                                                                                                                                                                                 |
| 9   | Opis dijagrama sekvenci     | Tekst iz odeljka 6.4.                                                                                                                                                                                                                             |
| 10  | Konzistentnost modela       | Kako se tri dijagrama povezuju (odeljak 6.5).                                                                                                                                                                                                     |

Svaki od slajdova 4, 6 i 8 ima malo dugme/link „Pogledaj skicu“ koje otvara odgovarajuću skicu u lightbox-u, da se skica i realizacija mogu uporediti.

### Navigacija

- Strelice ←/→, PageUp/PageDown i razmak menjaju slajd. Ova tastatura ne sme da reaguje dok je fokus u input polju ili dok je otvoren lightbox.
- Dugmad „Prethodni“/„Sledeći“, indikator napretka (npr. 4 / 10) i tačkice ili lista slajdova za direktan skok.
- Trenutni slajd je u URL hash-u (`/uml#4`), tako da link vodi pravo na slajd, a Back/Forward u pregledaču radi.
- Prelaz između slajdova je kratak i miran (fade + blagi pomak, ~300 ms).
- `@media print`: svi slajdovi jedan ispod drugog, bez navigacije, svaki na svojoj strani, dijagrami u konačnom (neanimiranom) stanju. Tako se iz pregledača može napraviti PDF.

### Metapodaci

`title`: „Od skice do realizacije UML dijagrama — Kurirska služba“, uz kratak `description`.

---

## 3. Slajd sa skicama

- Tri slike preko `next/image`, sa tačnim `width`/`height` iz odeljka 0 i `alt` tekstom (npr. „Skica dijagrama slučajeva upotrebe kurirske službe, nacrtana u Excalidraw-u“).
- Raspored na širokom ekranu: dijagram slučajeva upotrebe preko cele širine, a ispod njega klase i sekvence jedan pored drugog (ili drugi raspored koji ih sve prikaže čitljivo bez skrolovanja na 1440×900). Na telefonu idu jedan ispod drugog.
- Tekst „Ovo su skice kreirane u Excalidraw-u.“ je vidljiv, a ne sitan potpis. Ispod njega može kraća rečenica: „Na sledećim slajdovima su isti dijagrami, realizovani kao interaktivni prikaz.“

---

## 4. Opšta pravila za interaktivne dijagrame

### 4.1 Vernost (najvažnije)

- Realizacija prikazuje **tačno iste elemente kao skica**: ista imena (sa istim kvačicama), isti atributi istim redom, iste veze, uloge, kardinalnosti i poruke. Ništa ne dodaj (operacije u klasama, nove veze, stereotipe, navigabilnost, nove akterе), ništa ne izostavljaj, ništa ne preimenuj.
- Raspored prati skicu (ko je levo/desno/gore/dole). Smeš da poravnaš i uredno razmakneš elemente, ali ne i da ih premeštaš na drugu stranu.
- Sav sadržaj dijagrama drži kao podatke u jednom fajlu (npr. `uml-data.ts`), a komponente samo crtaju te podatke. Tekstove iz odeljka 6 drži u fajlu sa sadržajem (npr. `uml-content.ts`), prepisane od reči do reči.

### 4.2 Boja i dizajn

- „Colorful i jasniji“ znači: boje nose značenje (kategorije), uz legendu na svakom dijagramu. Boja ne sme da zameni UML oznaku. Puna i isprekidana linija, oblik vrha strelice, kardinalnosti i stereotipi moraju ostati jasno vidljivi i u crno-beloj štampi.
- Paleta: prati dizajn sajta ako ima tokene. U suprotnom uzmi jednu usklađenu paletu od 4–5 tonova, a ne dugu. Tekst na obojenoj podlozi uvek ima dovoljan kontrast (WCAG AA).
- Ako sajt ima tamnu temu, dijagrami moraju biti čitljivi i u njoj (boje preko CSS promenljivih).
- Linije su ravne i čiste (bez „rukom crtanog“ stila), uglovi blago zaobljeni, font čitljiv: najmanje 12px pri širini od 1280px.

### 4.3 Tehnika crtanja

- Svaki dijagram je jedan `<svg>` sa fiksnim `viewBox`-om i ručno zadatim koordinatama, skaliran na širinu kontejnera (`width: 100%`, `height: auto`). Koordinate drži u podacima, ne razbacane po JSX-u.
- Linije se završavaju tačno na ivici elementa (elipse, pravougaonika, linije života). Izračunaj presek, nemoj crtati „ispod“ elementa i sakrivati liniju bojom.
- Natpisi na linijama (`«include»`, uloge, kardinalnosti, poruke) ne smeju da preseku drugu liniju, element ili drugi natpis. Posle crtanja proveri svaki natpis.
- Vrhovi strelica su SVG `marker`-i, posebni za dve vrste: otvoreni „V“ i popunjeni trougao (odeljak 5).

### 4.4 Animacija

- Pri prvom ulasku na slajd dijagram se „iscrta“: prvo elementi (fade + blagi scale), pa linije (iscrtavanje putanje), pa natpisi. Ukupno najviše ~1,5 s. Ponovni ulazak na slajd ne ponavlja dugu animaciju.
- Sve animacije koriste samo `transform`, `opacity` i `stroke-dashoffset`.
- `prefers-reduced-motion: reduce` znači bez animacija: dijagram se odmah prikazuje u konačnom stanju, a koračanje u dijagramu sekvenci radi bez kretanja tačke.

### 4.5 Interakcija i pristupačnost

- Hover ili fokus na element ističe njega i sve njegove veze, a ostalo blago zatamni (opacity ~0.25).
- Klik ili Enter otvara bočni panel (na telefonu donji panel) sa objašnjenjem elementa. Esc i dugme ✕ ga zatvaraju.
- Svaki interaktivni element je fokusabilan (`tabIndex=0`), ima `role="button"` i `aria-label`, i vidljiv focus ring.
- SVG ima `role="img"`, a uz njega postoji tekstualna alternativa za čitače ekrana (npr. skrivena lista elemenata i veza).
- Na uskom ekranu dijagram staje po širini i ima dugme „Uvećaj“, koje ga otvara preko celog ekrana sa horizontalnim skrolovanjem. Bez pinch-zoom biblioteke.

---

## 5. Specifikacija dijagrama i pravila notacije

Pravila su iz prezentacija predmeta: „UML I deo“ (P1) i „UML II deo“ (P2). Brojevi slajdova su navedeni da se notacija ne bi izmišljala.

### 5.1 Dijagram slučajeva upotrebe (P1, slajdovi 28–46)

**Notacija:**

- **Okvir sistema** je pravougaonik sa nazivom **„Kurirska služba“** unutar okvira, gore. Svi slučajevi upotrebe su unutar okvira, svi akteri izvan njega.
- **Akter** je čiča-gliša (krug za glavu, telo, ruke, noge) sa imenom ispod. Ne sme biti silueta ili ikonica osobe (P1, sl. 30–31).
- **Slučaj upotrebe** je elipsa sa nazivom unutra.
- **Asocijacija** akter–slučaj upotrebe je puna linija **bez vrha strelice** (P1, sl. 38).
- **«include»** je isprekidana linija sa **otvorenim** vrhom strelice („V“, ne popunjen trougao). Ide **od osnovnog ka uključenom** slučaju upotrebe, sa natpisom `«include»` uz liniju (P1, sl. 41–43).
- **«extend»** je isprekidana linija sa otvorenim vrhom. Ide **od proširujućeg ka osnovnom** slučaju upotrebe, sa natpisom `«extend»` (P1, sl. 39–40).
- Natpisi se pišu sa guillemetima `«include»` / `«extend»` (na skici su `<<include>>`, isto značenje).

**Elementi:**

Akteri:
| id | Ime | Položaj |
|---|---|---|
| A1 | Korisnik | levo, gore |
| A2 | Zaposleni | levo, dole (u visini „Dodela pošiljke kuriru“) |
| A3 | Kurir | desno, gore (u visini „Preuzimanje pošiljke“ / „Isporuka pošiljke“) |
| A4 | Primalac | desno, dole |

Slučajevi upotrebe (leva kolona, odozgo nadole):
| id | Naziv | Vrsta |
|---|---|---|
| U1 | Kreiranje pošiljke | osnovni |
| U2 | Plaćanje pošiljke | osnovni |
| U3 | Praćenje pošiljke | osnovni |
| U4 | Dodela pošiljke kuriru | osnovni |
| U5 | Ažuriranje statusa | uključeni (pomoćni) |

Desna kolona, odozgo nadole:
| id | Naziv | Vrsta |
|---|---|---|
| U6 | Obračun cene | uključeni (pomoćni) |
| U7 | Preuzimanje pošiljke | osnovni |
| U8 | Isporuka pošiljke | osnovni |
| U9 | Vraćanje pošiljke | proširujući |

Asocijacije (7 punih linija, bez strelica):
`A1–U1`, `A1–U2`, `A1–U3`, `A2–U4`, `A3–U7`, `A3–U8`, `A4–U8`

Zavisnosti (4 isprekidane strelice; strelica pokazuje na drugi navedeni element):
| Od | Ka | Stereotip |
|---|---|---|
| U1 Kreiranje pošiljke | U6 Obračun cene | «include» |
| U7 Preuzimanje pošiljke | U5 Ažuriranje statusa | «include» |
| U8 Isporuka pošiljke | U5 Ažuriranje statusa | «include» |
| U9 Vraćanje pošiljke | U8 Isporuka pošiljke | «extend» |

**Boje (predlog):**

- **Akteri:** jedna boja.
- **Osnovni slučajevi upotrebe (U1, U2, U3, U4, U7, U8):** druga boja.
- **Uključeni i proširujući (U5, U6, U9):** treća, svetlija boja.
- **Legenda:** „osnovni slučaj upotrebe“, „uključeni / proširujući slučaj upotrebe“, „asocijacija“, „«include» — uvek se izvršava“, „«extend» — izvršava se pod uslovom“.

**Interakcija:**

- **Hover na aktera** ističe sve slučajeve upotrebe koje pokreće.
- **Hover na slučaj upotrebe** ističe aktere i «include»/«extend» veze.
- **Klik na osnovni slučaj upotrebe** otvara panel sa njegovim punim tekstualnim opisom iz odeljka 6.2.
- **Klik na U5, U6 ili U9** otvara kratko objašnjenje:
  - **U6 Obračun cene:** „Uključuje ga Kreiranje pošiljke. Izvršava se uvek: cena = težina × cena po kg za izabrani tip pošiljke.“
  - **U5 Ažuriranje statusa:** „Uključuju ga Preuzimanje i Isporuka pošiljke. Status se menja: Kreirana → Preuzeta → Isporučena / Vraćena. Izdvojen je u poseban slučaj upotrebe da se isto ponašanje ne bi opisivalo dva puta (P1, sl. 43).“
  - **U9 Vraćanje pošiljke:** „Proširuje Isporuku pošiljke. Izvršava se samo pod uslovom da primalac ne preuzme pošiljku. Odgovara izuzetku u opisu slučaja upotrebe Isporuka pošiljke.“
- **Klik na vezu «include»/«extend»** objašnjava smer strelice: „Strelica ide od osnovnog ka uključenom slučaju upotrebe“, odnosno „od proširujućeg ka osnovnom“.

### 5.2 Dijagram klasa (P2, slajdovi 11–28)

**Notacija:**

- **Klasa** je pravougaonik sa dva odeljka: gore naziv klase (podebljano, centrirano), ispod horizontalne linije atributi, jedan po redu, u obliku `naziv: Tip` (P2, sl. 13). Operacije se ne prikazuju, kao ni na skici i u primeru sa vežbi.
- **Asocijacija** je puna linija **bez** strelica, rombova i trouglova (P2, sl. 22–27). Agregacija, kompozicija i generalizacija se u ovom modelu ne koriste.
- Na **svakom kraju** asocijacije, uz klasu na tom kraju, stoje **uloga** (`+naziv`, vidljivost „+“ prema P2, sl. 28) i **kardinalnost** (`1`, `0..1`, `*`, prema P2, sl. 25). Uloga i kardinalnost stoje uz klasu čije ime uloga nosi. Na skici su napisani zajedno, npr. `+korisnik 1`.

**Klase i atributi (tačno ovim redom):**

```
Korisnik:    korisnikID: Integer, ime: String, prezime: String, adresa: String, grad: String, telefon: String, email: String
Primalac:    primalacID: Integer, ime: String, prezime: String, adresa: String, grad: String, telefon: String
Posiljka:    posiljkaID: Integer, brojZaPracenje: String, tezina: Double, datumSlanja: Date, datumIsporuke: Date, status: String, lomljivo: Boolean, korisnikID: Integer, primalacID: Integer, tipPosiljkeID: Integer, kurirID: Integer, zaposleniID: Integer
TipPosiljke: tipPosiljkeID: Integer, nazivTipa: String, cenaPoKg: Double
Placanje:    placanjeID: Integer, iznos: Double, datumPlacanja: Date, nacinPlacanja: String, posiljkaID: Integer
Kurir:       kurirID: Integer, ime: String, prezime: String, JMBG: String, telefon: String, filijalaID: Integer
Zaposleni:   zaposleniID: Integer, ime: String, prezime: String, JMBG: String, radnoMesto: String, filijalaID: Integer
Filijala:    filijalaID: Integer, naziv: String, adresa: String, grad: String, telefon: String
```

**Raspored (kao na skici):**

- **Posiljka:** u centru.
- **TipPosiljke:** iznad nje.
- **Korisnik:** levo.
- **Primalac:** dole levo.
- **Placanje:** ispod Posiljke.
- **Kurir:** gore desno.
- **Zaposleni:** dole desno.
- **Filijala:** skroz desno, između Kurira i Zaposlenog.

**Asocijacije (8 linija; svaki kraj ima ulogu i kardinalnost):**

| Linija                 | Kraj kod klase A                | Kraj kod klase B             | Kako se čita                                                                                                   |
| ---------------------- | ------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Korisnik — Posiljka    | `+korisnik 1` (kod Korisnika)   | `+posiljka *` (kod Posiljke) | Jedan korisnik šalje više pošiljki; svaku pošiljku šalje tačno jedan korisnik.                                 |
| Primalac — Posiljka    | `+primalac 1`                   | `+posiljka *`                | Jedan primalac prima više pošiljki; svaka pošiljka ide tačno jednom primaocu.                                  |
| TipPosiljke — Posiljka | `+tipPosiljke 1`                | `+posiljka *`                | Jedan tip ima više pošiljki; svaka pošiljka je tačno jednog tipa.                                              |
| Placanje — Posiljka    | `+placanje 0..1` (kod Placanja) | `+posiljka 1` (kod Posiljke) | Jedno plaćanje je za tačno jednu pošiljku; pošiljka ima nijedno (još nije plaćena) ili jedno plaćanje.         |
| Kurir — Posiljka       | `+kurir 0..1`                   | `+posiljka *`                | Jedan kurir nosi više pošiljki; pošiljka ima nijednog (još nije dodeljena) ili jednog kurira.                  |
| Zaposleni — Posiljka   | `+zaposleni 0..1`               | `+posiljka *`                | Jedan zaposleni dodeljuje više pošiljki; pošiljku je dodelio nijedan (još nije dodeljena) ili jedan zaposleni. |
| Kurir — Filijala       | `+kurir *` (kod Kurira)         | `+filijala 1` (kod Filijale) | U jednoj filijali radi više kurira; kurir radi u tačno jednoj filijali.                                        |
| Zaposleni — Filijala   | `+zaposleni *` (kod Zaposlenog) | `+filijala 1` (kod Filijale) | U jednoj filijali radi više zaposlenih; zaposleni radi u tačno jednoj filijali.                                |

**Boje (predlog, po grupama, sa legendom):**

- **Centralna klasa:** Posiljka (na skici je istaknuta plavom; zadrži je kao najistaknutiju).
- **Učesnici slanja:** Korisnik, Primalac.
- **Šifarnik i finansije:** TipPosiljke, Placanje.
- **Organizacija službe:** Kurir, Zaposleni, Filijala.
- **Atributi veze:** atributi koji su ID druge klase (`korisnikID`, `primalacID`, `tipPosiljkeID`, `kurirID`, `zaposleniID` u Posiljci, `posiljkaID` u Placanju, `filijalaID` u Kuriru i Zaposlenom) prikaži sa malim diskretnim markerom, npr. ikonica veze ili drugačija nijansa teksta. U legendi napiši „atribut koji predstavlja vezu sa drugom klasom“. Primarni ključ (prvi atribut, `…ID` same klase) može imati drugačiji, isto diskretan marker.

**Interakcija:**

- **Hover/fokus na klasu** ističe njene asocijacije i povezane klase.
- **Hover na asocijaciju** ističe obe kardinalnosti i prikazuje tooltip sa rečenicom iz kolone „Kako se čita“.
- **Klik na klasu** otvara panel sa opisom klase i obeležja iz odeljka 6.3.
- **Klik na atribut koji je veza** (npr. `kurirID`) ističe odgovarajuću asocijaciju i klasu na drugom kraju.

### 5.3 Dijagram sekvenci: „Kreiranje pošiljke“ (P1, sl. 70–76; P2, sl. 46)

**Notacija:**

- **Gornji red, sleva nadesno:**
  - akter **Korisnik** (čiča-gliša sa imenom ispod),
  - objekti **`:Posiljka`**, **`:Primalac`**, **`:TipPosiljke`** kao pravougaonici. Dvotačka znači anonimni objekat klase.
- **Zaglavlja se crtaju samo gore**, ne ponavljaju se na dnu.
- **Linija života** je isprekidana vertikalna linija ispod svakog učesnika. Sve četiri se završavaju na istoj visini, ispod okvira `alt`.
- **Fokus kontrole (pravougaonik aktivacije)** je uski uspravni pravougaonik na liniji života (P1, sl. 71):
  - na `:Posiljka` jedan **neprekinut**, od poruke 1 do posle poruke 9;
  - na `:Primalac` od poruke 3 do 4;
  - na `:TipPosiljke` od poruke 5 do 6.
- **Sinhrona poruka (poziv)** je puna linija sa **popunjenim** trouglom na vrhu (P2, sl. 46).
- **Povratak toka upravljanja** je isprekidana linija sa **otvorenim** vrhom „V“. Uvek ide nazad pošiljaocu poziva (P2, sl. 46).
- **Poruka samom sebi** (2 i 7) je puna linija u obliku petlje: izlazi desno iz pravougaonika aktivacije `:Posiljka`, ide malo dole i vraća se u njega, sa popunjenim trouglom.
- **Kombinovani fragment `alt`** je pravougaonik oko poruka 3–9, širok preko svih linija života (P1, sl. 76):
  - u gornjem levom uglu je oznaka `alt` u petougaoniku (pravougaonik sa zasečenim donjim desnim uglom);
  - dva operanda razdvojena horizontalnom isprekidanom linijom;
  - uslovi (guard) u **jednostrukim** uglastim zagradama: `[podaci ispravni]` i `[podaci neispravni]`.
- **Brojevi poruka** su deo natpisa poruke („1: …“), ne kružići na liniji.

**Poruke (tačno ovim redom i ovim tekstom):**

| #   | Od                                              | Ka           | Vrsta      | Natpis                                                                |
| --- | ----------------------------------------------- | ------------ | ---------- | --------------------------------------------------------------------- |
| 1   | Korisnik                                        | :Posiljka    | poziv      | `1: kreirajPosiljku(podaciPrimaoca, tipPosiljkeID, tezina, lomljivo)` |
| 2   | :Posiljka                                       | :Posiljka    | poziv sebi | `2: proveriPodatke()`                                                 |
| —   | _početak `alt`, operand 1:_ `[podaci ispravni]` |              |            |                                                                       |
| 3   | :Posiljka                                       | :Primalac    | poziv      | `3: sacuvajPrimaoca(podaciPrimaoca)`                                  |
| 4   | :Primalac                                       | :Posiljka    | povratak   | `4: primalacID`                                                       |
| 5   | :Posiljka                                       | :TipPosiljke | poziv      | `5: vratiCenuPoKg()`                                                  |
| 6   | :TipPosiljke                                    | :Posiljka    | povratak   | `6: cenaPoKg`                                                         |
| 7   | :Posiljka                                       | :Posiljka    | poziv sebi | `7: izracunajCenu(tezina, cenaPoKg)`                                  |
| 8   | :Posiljka                                       | Korisnik     | povratak   | `8: brojZaPracenje, iznos`                                            |
| —   | _operand 2:_ `[podaci neispravni]`              |              |            |                                                                       |
| 9   | :Posiljka                                       | Korisnik     | povratak   | `9: zahtevZaIspravku`                                                 |

Natpis poruke stoji iznad svoje strelice i ne seče nijednu liniju života ni pravougaonik aktivacije. Natpis poruke 1 je dugačak, pa razmak između Korisnika i `:Posiljka` mora biti dovoljan. Natpis poruke 5 i 6 je između `:Primalac` i `:TipPosiljke`, da ne preseca liniju života `:Primalac`.

**Boje:**

- **Učesnici:** svaki ima svoju boju zaglavlja, a ista boja je na tankom ivičnom tonu njegovog pravougaonika aktivacije.
- **Pozivi i povratne poruke:** neutralne boje. Razlikuju se pre svega punom/isprekidanom linijom i vrhom.
- **Okvir `alt`:** dva operanda sa vrlo blagim pozadinskim tonom (npr. zelenkasti za ispravne, crvenkasti za neispravne).

**Interakcija: koračanje kroz scenario.**

- **Kontrole:** „Pusti“/„Pauza“, „Prethodni korak“, „Sledeći korak“, „Ispočetka“.
- **Prekidač grane:** „Podaci ispravni“ / „Podaci neispravni“.
  - Grana ispravni: poruke 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8.
  - Grana neispravni: poruke 1 → 2 → 9.
  - Operand koji se ne izvršava ostaje vidljiv, ali je zatamnjen.
- **U svakom koraku:**
  - trenutna poruka je istaknuta, a mala tačka putuje duž strelice od pošiljaoca ka primaocu (~600 ms);
  - prethodne poruke su normalne, buduće su zatamnjene;
  - ispod dijagrama piše objašnjenje koraka (tabela ispod).
- **Pre prvog koraka** dijagram je potpuno prikazan, normalno, kao statična slika. Koračanje je dodatak, ne uslov da se dijagram vidi.

| #   | Objašnjenje koraka                                                                                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | Korisnik šalje podatke o primaocu, tip pošiljke, težinu i oznaku da li je pošiljka lomljiva.                                 |
| 2   | Pošiljka proverava da li su svi podaci uneti i ispravni.                                                                     |
| 3   | Podaci su ispravni, pa se čuvaju podaci o primaocu.                                                                          |
| 4   | Pošiljka dobija identifikator primaoca (`primalacID`).                                                                       |
| 5   | Pošiljka traži od svog tipa cenu po kilogramu.                                                                               |
| 6   | Tip pošiljke vraća cenu po kilogramu (`cenaPoKg`).                                                                           |
| 7   | Pošiljka računa cenu: težina × cena po kg. Ovo je «include» Obračun cene sa dijagrama slučajeva upotrebe.                    |
| 8   | Korisnik dobija broj za praćenje i iznos. Pošiljka ima status „Kreirana“.                                                    |
| 9   | Podaci nisu ispravni, pa korisnik dobija zahtev da ih ispravi. Ovo je izuzetak iz opisa slučaja upotrebe Kreiranje pošiljke. |

**Legenda:** „sinhrona poruka (poziv)“, „povratak toka upravljanja“, „linija života“, „fokus kontrole“, „alt — alternativni tokovi“.

---

## 6. Tekstualni sadržaj (prepiši tačno, bez izmena)

### 6.1 Opis sistema (slajd 2)

Kurirska služba prima pošiljke od korisnika i isporučuje ih primaocima. Korisnik kreira pošiljku unoseći podatke o primaocu, tip i težinu pošiljke, a sistem obračunava cenu i dodeljuje broj za praćenje. Nakon plaćanja, zaposleni u filijali dodeljuje pošiljku kuriru. Kurir preuzima pošiljku od pošiljaoca i isporučuje je primaocu, a sistem pri svakom koraku ažurira status pošiljke. Ukoliko primalac ne preuzme pošiljku, ona se vraća pošiljaocu. Korisnik u svakom trenutku može da prati pošiljku preko broja za praćenje.

Životni ciklus pošiljke: **Kreirana → Preuzeta → Isporučena** (ili **Vraćena**).

### 6.2 Opisi osnovnih slučajeva upotrebe (slajd 5, šablon P1, sl. 46)

Svaki opis prikaži sa poljima: **Slučaj upotrebe**, **Kratak opis**, **Učesnici**, **Uslovi koji moraju biti zadovoljeni pre izvršavanja**, **Opis**, **Izuzeci**, **Uslovi koji moraju biti zadovoljeni nakon izvršavanja**. Oznake izuzetaka u uglastim zagradama (npr. `[Izuzetak: …]`) vizuelno istakni, a klik na njih skroluje do tog izuzetka.

**1. Kreiranje pošiljke**

- Slučaj upotrebe: Kreiranje pošiljke
- Kratak opis: Korisnik kreira novu pošiljku u sistemu kurirske službe.
- Učesnici: Korisnik (K)
- Uslovi koji moraju biti zadovoljeni pre izvršavanja: Korisnik je evidentiran u sistemu.
- Opis: K unosi podatke o primaocu (ime, prezime, adresu, grad i telefon), bira tip pošiljke, unosi težinu i označava da li je pošiljka lomljiva. Sistem proverava unete podatke. [Izuzetak: Nepotpuni ili neispravni podaci]. Sistem obračunava cenu pošiljke na osnovu težine i cene po kg za izabrani tip i prikazuje iznos korisniku. Sistem dodeljuje pošiljci jedinstveni broj za praćenje i postavlja status „Kreirana“.
- Izuzeci: [Nepotpuni ili neispravni podaci] Ukoliko neki obavezan podatak nije unet ili nije ispravan (npr. težina je 0), sistem obaveštava K i traži da ispravi podatke.
- Uslovi koji moraju biti zadovoljeni nakon izvršavanja: Pošiljka je evidentirana sa statusom „Kreirana“, brojem za praćenje i obračunatom cenom.

**2. Plaćanje pošiljke**

- Slučaj upotrebe: Plaćanje pošiljke
- Kratak opis: Korisnik plaća uslugu slanja pošiljke.
- Učesnici: Korisnik (K)
- Uslovi koji moraju biti zadovoljeni pre izvršavanja: Pošiljka je kreirana i cena je obračunata.
- Opis: K bira pošiljku koju želi da plati i način plaćanja (gotovina ili kartica). Sistem prikazuje iznos za plaćanje. K potvrđuje plaćanje. [Izuzetak: Plaćanje odbijeno]. Sistem evidentira plaćanje (iznos, datum i način plaćanja) i izdaje potvrdu o plaćanju.
- Izuzeci: [Plaćanje odbijeno] Ukoliko plaćanje karticom ne prođe, sistem obaveštava K i nudi ponovni pokušaj ili drugi način plaćanja.
- Uslovi koji moraju biti zadovoljeni nakon izvršavanja: Plaćanje je evidentirano za pošiljku i pošiljka može biti dodeljena kuriru.

**3. Praćenje pošiljke**

- Slučaj upotrebe: Praćenje pošiljke
- Kratak opis: Korisnik proverava trenutni status svoje pošiljke.
- Učesnici: Korisnik (K)
- Uslovi koji moraju biti zadovoljeni pre izvršavanja: Pošiljka postoji u sistemu i K ima njen broj za praćenje.
- Opis: K unosi broj za praćenje pošiljke. Sistem pronalazi pošiljku. [Izuzetak: Pogrešan broj za praćenje]. Sistem prikazuje trenutni status pošiljke i datum slanja, a ako je pošiljka isporučena, i datum isporuke.
- Izuzeci: [Pogrešan broj za praćenje] Ukoliko pošiljka sa unetim brojem ne postoji, sistem obaveštava K da proveri i ponovo unese broj.
- Uslovi koji moraju biti zadovoljeni nakon izvršavanja: K je informisan o statusu pošiljke. Podaci o pošiljci nisu promenjeni.

**4. Dodela pošiljke kuriru**

- Slučaj upotrebe: Dodela pošiljke kuriru
- Kratak opis: Zaposleni određuje kurira koji će preuzeti i isporučiti pošiljku.
- Učesnici: Zaposleni (Z)
- Uslovi koji moraju biti zadovoljeni pre izvršavanja: Pošiljka je plaćena i nije dodeljena nijednom kuriru.
- Opis: Z pregleda listu plaćenih pošiljki koje nisu dodeljene kuriru. Z bira pošiljku i jednog od kurira iz svoje filijale. [Izuzetak: Nema dostupnog kurira]. Sistem na pošiljci evidentira izabranog kurira i zaposlenog koji je izvršio dodelu.
- Izuzeci: [Nema dostupnog kurira] Ukoliko nijedan kurir nije dostupan, pošiljka ostaje nedodeljena i Z je dodeljuje kasnije.
- Uslovi koji moraju biti zadovoljeni nakon izvršavanja: Pošiljka ima dodeljenog kurira.

**5. Preuzimanje pošiljke**

- Slučaj upotrebe: Preuzimanje pošiljke
- Kratak opis: Kurir preuzima pošiljku sa adrese pošiljaoca.
- Učesnici: Kurir (Ku)
- Uslovi koji moraju biti zadovoljeni pre izvršavanja: Pošiljka je dodeljena kuriru.
- Opis: Ku dolazi na adresu pošiljaoca. [Izuzetak: Pošiljalac nije na adresi]. Ku preuzima pošiljku i u sistemu potvrđuje preuzimanje. Sistem menja status pošiljke u „Preuzeta“.
- Izuzeci: [Pošiljalac nije na adresi] Ukoliko pošiljalac nije na adresi, Ku ne preuzima pošiljku i dolazi ponovo u dogovoreno vreme.
- Uslovi koji moraju biti zadovoljeni nakon izvršavanja: Pošiljka je kod kurira i ima status „Preuzeta“.

**6. Isporuka pošiljke**

- Slučaj upotrebe: Isporuka pošiljke
- Kratak opis: Kurir predaje pošiljku primaocu.
- Učesnici: Kurir (Ku), Primalac (P)
- Uslovi koji moraju biti zadovoljeni pre izvršavanja: Pošiljka ima status „Preuzeta“.
- Opis: Ku dolazi na adresu P i predaje mu pošiljku. [Izuzetak: Primalac ne preuzima pošiljku]. P potvrđuje prijem pošiljke potpisom. Ku u sistemu potvrđuje isporuku. Sistem menja status pošiljke u „Isporučena“ i upisuje datum isporuke.
- Izuzeci: [Primalac ne preuzima pošiljku] Ukoliko P nije na adresi ili odbije pošiljku, pošiljka se vraća pošiljaocu i sistem menja njen status u „Vraćena“.
- Uslovi koji moraju biti zadovoljeni nakon izvršavanja: Pošiljka je isporučena, ima status „Isporučena“ i upisan datum isporuke.

### 6.3 Opis klasa i obeležja (slajd 7)

Uvodna rečenica: Atributi čiji se naziv završava na `ID`, a pripadaju drugoj klasi (npr. `korisnikID` u klasi Posiljka), predstavljaju vezu sa tom klasom.

**Korisnik** predstavlja lice koje šalje pošiljku (pošiljaoca) i evidentirano je u sistemu kurirske službe.

- `korisnikID`: jedinstveni identifikator korisnika
- `ime`, `prezime`: ime i prezime korisnika
- `adresa`, `grad`: adresa sa koje kurir preuzima pošiljku
- `telefon`, `email`: kontakt podaci korisnika

**Primalac** predstavlja lice kome je pošiljka namenjena. Podaci o primaocu unose se prilikom kreiranja pošiljke.

- `primalacID`: jedinstveni identifikator primaoca
- `ime`, `prezime`: ime i prezime primaoca
- `adresa`, `grad`: adresa na koju se pošiljka isporučuje
- `telefon`: kontakt telefon primaoca, koji kurir koristi pri isporuci

**Posiljka** je centralna klasa sistema. Predstavlja jednu pošiljku od trenutka kreiranja do isporuke ili vraćanja.

- `posiljkaID`: jedinstveni identifikator pošiljke
- `brojZaPracenje`: jedinstveni broj pomoću kog korisnik prati pošiljku
- `tezina`: težina pošiljke u kilogramima, koristi se za obračun cene
- `datumSlanja`: datum kreiranja pošiljke
- `datumIsporuke`: datum isporuke primaocu (prazan dok pošiljka nije isporučena)
- `status`: trenutno stanje pošiljke (Kreirana, Preuzeta, Isporučena, Vraćena)
- `lomljivo`: oznaka da li pošiljka zahteva pažljivo rukovanje
- `korisnikID`: veza sa korisnikom koji šalje pošiljku
- `primalacID`: veza sa primaocem pošiljke
- `tipPosiljkeID`: veza sa tipom pošiljke
- `kurirID`: veza sa kurirom koji preuzima i isporučuje pošiljku
- `zaposleniID`: veza sa zaposlenim koji je pošiljku dodelio kuriru

**TipPosiljke** predstavlja vrstu pošiljke (npr. pismo, dokument, paket) i određuje cenu prenosa.

- `tipPosiljkeID`: jedinstveni identifikator tipa pošiljke
- `nazivTipa`: naziv tipa pošiljke
- `cenaPoKg`: cena prenosa po kilogramu za dati tip

**Placanje** predstavlja evidenciju plaćanja usluge slanja jedne pošiljke.

- `placanjeID`: jedinstveni identifikator plaćanja
- `iznos`: plaćeni iznos, dobijen kao težina pošiljke × cena po kg njenog tipa
- `datumPlacanja`: datum kada je plaćanje izvršeno
- `nacinPlacanja`: način plaćanja (gotovina ili kartica)
- `posiljkaID`: veza sa pošiljkom na koju se plaćanje odnosi

**Kurir** predstavlja radnika kurirske službe koji preuzima pošiljke od pošiljalaca i isporučuje ih primaocima.

- `kurirID`: jedinstveni identifikator kurira
- `ime`, `prezime`: ime i prezime kurira
- `JMBG`: jedinstveni matični broj građana
- `telefon`: kontakt telefon kurira
- `filijalaID`: veza sa filijalom u kojoj kurir radi

**Zaposleni** predstavlja službenika u filijali koji raspoređuje pošiljke kuririma.

- `zaposleniID`: jedinstveni identifikator zaposlenog
- `ime`, `prezime`: ime i prezime zaposlenog
- `JMBG`: jedinstveni matični broj građana
- `radnoMesto`: naziv radnog mesta (npr. operater)
- `filijalaID`: veza sa filijalom u kojoj zaposleni radi

**Filijala** predstavlja poslovnicu kurirske službe u određenom gradu, u kojoj rade kuriri i zaposleni.

- `filijalaID`: jedinstveni identifikator filijale
- `naziv`: naziv filijale (npr. Filijala Novi Sad)
- `adresa`, `grad`: lokacija filijale
- `telefon`: kontakt telefon filijale

Prikaz: kartice po klasama (u bojama grupa iz 5.2), u mreži koja na širokom ekranu staje na jedan slajd ili se skroluje unutar slajda.

### 6.4 Opis dijagrama sekvenci (slajd 9)

Dijagram sekvenci prikazuje realizaciju slučaja upotrebe „Kreiranje pošiljke“. Korisnik šalje objektu klase Posiljka podatke o primaocu, tip pošiljke, težinu i oznaku da li je pošiljka lomljiva. Pošiljka najpre proverava ispravnost unetih podataka. Ukoliko su podaci ispravni, čuvaju se podaci o primaocu, od objekta klase TipPosiljke preuzima se cena po kilogramu i na osnovu težine obračunava se cena pošiljke. Korisniku se zatim vraćaju broj za praćenje i iznos za plaćanje, a pošiljka dobija status „Kreirana“. Ukoliko podaci nisu ispravni, korisniku se vraća zahtev za ispravku, što odgovara izuzetku navedenom u opisu slučaja upotrebe.

Ispod teksta je kratka legenda notacije:

- **Linija života:** isprekidana vertikalna linija.
- **Fokus kontrole:** uski pravougaonik na liniji života.
- **Sinhrona poruka:** puna linija, popunjen vrh.
- **Povratak toka upravljanja:** isprekidana linija, otvoren vrh.
- **`alt`:** alternativni tokovi sa uslovima u uglastim zagradama.

### 6.5 Konzistentnost modela (slajd 10)

Uvod: Tri dijagrama opisuju isti sistem iz različitih uglova: dijagram slučajeva upotrebe prikazuje šta sistem radi i ko ga koristi, dijagram klasa koje podatke sistem čuva, a dijagram sekvenci kako objekti sarađuju u realizaciji jednog slučaja upotrebe.

Tabela veza:

| Dijagram slučajeva upotrebe                | Dijagram klasa                                | Dijagram sekvenci                     |
| ------------------------------------------ | --------------------------------------------- | ------------------------------------- |
| «include» Obračun cene                     | `tezina` (Posiljka), `cenaPoKg` (TipPosiljke) | poruke 5–7                            |
| Plaćanje pošiljke                          | klasa Placanje                                | —                                     |
| Dodela pošiljke kuriru                     | `kurirID`, `zaposleniID` u Posiljci           | —                                     |
| «include» Ažuriranje statusa               | atribut `status`                              | poruka 8 (status „Kreirana“)          |
| Izuzetak „Nepotpuni ili neispravni podaci“ | —                                             | grana `[podaci neispravni]`, poruka 9 |
| «extend» Vraćanje pošiljke                 | status „Vraćena“                              | —                                     |

Na ekranu redovi tabele mogu biti interaktivni: hover na red ističe odgovarajući pojam u sve tri kolone. Ovo je opciono.

---

## 7. Organizacija koda (predlog, prilagodi projektu)

```
app/uml/page.tsx                 // ruta, metadata, server komponenta koja renderuje klijentski deck
components/uml/SlideDeck.tsx     // navigacija, hash, tastatura, print
components/uml/SketchGallery.tsx
components/uml/Lightbox.tsx
components/uml/UseCaseDiagram.tsx
components/uml/ClassDiagram.tsx
components/uml/SequenceDiagram.tsx
components/uml/DetailPanel.tsx
components/uml/svg/markers.tsx   // otvoreni V i popunjen trougao
lib/uml/uml-data.ts              // svi elementi i koordinate dijagrama (odeljak 5)
lib/uml/uml-content.ts           // svi tekstovi (odeljak 6)
```

- Sve tipizuj (TypeScript). Bez `any`.
- Bez konzolnih upozorenja ni hydration grešaka.
- Klijentske komponente označi sa `"use client"` samo tamo gde treba.

---

## 8. Provera pre nego što kažeš da je gotovo

1. Pokreni postojeće skripte projekta: lint, typecheck i `build`. Sve mora proći bez grešaka.
2. Pokreni dev server i Playwright-om (ili alatom koji projekat već koristi) napravi screenshot svakog slajda na **1440×900** i **390×844**, u svetloj i tamnoj temi ako sajt ima tamnu temu. Pregledaj svaki screenshot.
3. Na screenshot-ima interaktivnih dijagrama prebroj i potvrdi:
   - **Slučajevi upotrebe:**
     - 4 aktera kao čiča-gliše, izvan okvira;
     - 9 elipsa unutar okvira;
     - 7 punih linija bez strelica;
     - 4 isprekidane strelice sa otvorenim vrhom: 3 «include», 1 «extend».
   - **Smerovi strelica:** U1→U6, U7→U5, U8→U5, U9→U8.
   - **Klase:**
     - 8 klasa sa dva odeljka;
     - atributi tačno kao u 5.2;
     - 8 punih linija bez vrhova i rombova;
     - na svakom kraju uloga i kardinalnost (ukupno 16 parova), uz pravu klasu.
   - **Sekvence:**
     - 4 zaglavlja samo gore;
     - 4 isprekidane linije života;
     - 3 pravougaonika aktivacije (onaj na `:Posiljka` je neprekinut);
     - pozivi 1, 2, 3, 5, 7 imaju punu liniju i popunjen trougao;
     - povratne poruke 4, 6, 8, 9 imaju isprekidanu liniju i otvoren vrh;
     - okvir sa oznakom `alt`, dva operanda i jednostrukim zagradama.
   - **Nijedan natpis** ne seče liniju niti drugi natpis.
4. Proveri interakcije:
   - hover/fokus ističe ispravne elemente;
   - klik otvara pravi opis;
   - Esc zatvara panel i lightbox;
   - koračanje u sekvencama prati obe grane tačno po redosledu iz 5.3.
5. Proveri `prefers-reduced-motion` (Playwright `reducedMotion: 'reduce'`): nema animacija, sve je vidljivo.
6. Proveri štampu (`page.emulateMedia({ media: 'print' })`): svi slajdovi su vidljivi, bez navigacije.
7. Uporedi svaki interaktivni dijagram sa njegovom skicom iz `public/uml/` element po element. Ako se bilo šta razlikuje u sadržaju, popravi realizaciju, ne skicu.

Na kraju mi napiši kratak izveštaj:

- koje fajlove si napravio/izmenio i da li si dodao zavisnost;
- rezultat provera iz koraka 1–7;
- sve što nisi mogao da uradiš ili gde si morao da odstupiš od ovog prompta, i zašto.

Ako ti nešto u ovom promptu deluje kontradiktorno ili netačno u odnosu na UML pravila, **pitaj me pre nego što promeniš model**. Ne pogađaj.
