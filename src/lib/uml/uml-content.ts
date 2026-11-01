// Svi tekstovi stranice /uml.
// Inline kod je označen backtick-ovima, a isticanje sa {{ton|tekst}}; crta ih renderInline.

import type { ClassGroup, ClassId, UseCaseId } from "./uml-data";

export const STUDENT_NAME = "Luka Macura";
export const STUDENT_INDEX = "IT1 / 2025";

export const DECK_SUBTITLE = "Tema: Kurirska služba";
export const DECK_LINE = "UML deo projekta";

export const SLIDE_TITLES = [
  "Naslovni",
  "Opis sistema",
  "Skice",
  "Dijagram slučajeva upotrebe",
  "Opisi slučajeva upotrebe",
  "Dijagram klasa",
  "Opis klasa i obeležja",
  "Dijagram sekvenci",
] as const;

/**
 * Svaki dijagram ima svoju boju: slučajevi upotrebe ljubičasto-plavu, klase
 * tirkiznu, sekvence koralnu. Ista boja prati ih na svim slajdovima.
 */
export const SLIDE_CHAPTERS = [
  "title",
  "system",
  "sketch",
  "use-case",
  "use-case",
  "class",
  "class",
  "sequence",
] as const;

export type Chapter = (typeof SLIDE_CHAPTERS)[number];

/* Slajd 2 */
export const SYSTEM_DESCRIPTION =
  "Kurirska služba prima pošiljke od {{coral|korisnika}} i isporučuje ih {{coral|primaocima}}. {{coral|Korisnik}} kreira pošiljku unoseći podatke o primaocu, tip i težinu pošiljke, a sistem {{sun|obračunava cenu}} i dodeljuje {{sun|broj za praćenje}}. Nakon plaćanja, {{teal|zaposleni}} u filijali dodeljuje pošiljku kuriru. {{teal|Kurir}} preuzima pošiljku od pošiljaoca i isporučuje je primaocu, a sistem pri preuzimanju i isporuci {{iris|ažurira status}} pošiljke. Ukoliko {{coral|primalac}} ne preuzme pošiljku, ona se vraća pošiljaocu. Korisnik u svakom trenutku može da prati pošiljku preko broja za praćenje.";

export const LIFECYCLE_LABEL = "Životni ciklus pošiljke";

/* Slajd 3 */
export type SketchId = "use-case" | "class" | "sequence";

export type Sketch = {
  id: SketchId;
  title: string;
  src: string;
  width: number;
  height: number;
  alt: string;
};

export const SKETCHES: Record<SketchId, Sketch> = {
  "use-case": {
    id: "use-case",
    title: "Dijagram slučajeva upotrebe",
    src: "/uml/dijagram-slucaji.png",
    width: 6481,
    height: 2833,
    alt: "Skica dijagrama slučajeva upotrebe kurirske službe, nacrtana u Excalidraw-u",
  },
  class: {
    id: "class",
    title: "Dijagram klasa",
    src: "/uml/skica-dijagram-klasa.png",
    width: 2400,
    height: 2086,
    alt: "Skica dijagrama klasa kurirske službe, nacrtana u Excalidraw-u",
  },
  sequence: {
    id: "sequence",
    title: "Dijagram sekvenci",
    src: "/uml/skica-dijagram-sekvenci.png",
    width: 2400,
    height: 1487,
    alt: "Skica dijagrama sekvenci kurirske službe, nacrtana u Excalidraw-u",
  },
};

export const SKETCHES_LEAD = "Ovo su skice kreirane u Excalidraw-u.";

/* Slajd 4 */
export const USE_CASE_LEGEND = {
  base: "osnovni slučaj upotrebe",
  helper: "uključeni / proširujući slučaj upotrebe",
  association: "asocijacija",
  include: "«include» — uvek se izvršava",
  extend: "«extend» — izvršava se pod uslovom",
};

export const HELPER_USE_CASE_NOTES: Partial<Record<UseCaseId, string>> = {
  U6: "Uključuje ga Kreiranje pošiljke. Izvršava se uvek: cena = težina × cena po kg za izabrani tip pošiljke.",
  U5: "Uključuju ga Preuzimanje i Isporuka pošiljke. Status se menja: Kreirana → Preuzeta → Isporučena / Vraćena. Izdvojen je u poseban slučaj upotrebe da se isto ponašanje ne bi opisivalo dva puta.",
  U9: "Proširuje Isporuku pošiljke u tački proširenja „predaja pošiljke“. Izvršava se samo pod uslovom da primalac ne preuzme pošiljku. Odgovara izuzetku u opisu slučaja upotrebe Isporuka pošiljke.",
};

export const DEPENDENCY_DIRECTION = {
  "«include»": "Strelica ide od osnovnog ka uključenom slučaju upotrebe",
  "«extend»": "Strelica ide od proširujućeg ka osnovnom slučaju upotrebe",
};

/* Slajd 5: šablon P1, sl. 46 */
export const USE_CASE_FIELD_LABELS = {
  name: "Slučaj upotrebe",
  short: "Kratak opis",
  participants: "Učesnici",
  pre: "Uslovi koji moraju biti zadovoljeni pre izvršavanja",
  description: "Opis",
  exception: "Izuzeci",
  post: "Uslovi koji moraju biti zadovoljeni nakon izvršavanja",
};

export type UseCaseDescription = {
  id: UseCaseId;
  name: string;
  short: string;
  participants: string;
  pre: string;
  /** Sadrži oznake `[Izuzetak: …]`; klik na oznaku vodi do izuzetka. */
  description: string;
  exceptionLabel: string;
  exceptionText: string;
  post: string;
};

export const USE_CASE_DESCRIPTIONS: UseCaseDescription[] = [
  {
    id: "U1",
    name: "Kreiranje pošiljke",
    short: "Korisnik kreira novu pošiljku u sistemu kurirske službe.",
    participants: "Korisnik (K)",
    pre: "Korisnik je evidentiran u sistemu.",
    description:
      "K unosi podatke o primaocu (ime, prezime, adresu, grad i telefon), bira tip pošiljke, unosi težinu i označava da li je pošiljka lomljiva. Sistem proverava unete podatke. [Izuzetak: Nepotpuni ili neispravni podaci]. Sistem obračunava cenu pošiljke na osnovu težine i cene po kg za izabrani tip i prikazuje iznos korisniku. Sistem dodeljuje pošiljci jedinstveni broj za praćenje i postavlja status „Kreirana“.",
    exceptionLabel: "Nepotpuni ili neispravni podaci",
    exceptionText:
      "Ukoliko neki obavezan podatak nije unet ili nije ispravan (npr. težina je 0), sistem obaveštava K i traži da ispravi podatke.",
    post: "Pošiljka je evidentirana sa statusom „Kreirana“ i brojem za praćenje, a korisniku je prikazan obračunati iznos.",
  },
  {
    id: "U2",
    name: "Plaćanje pošiljke",
    short: "Korisnik plaća uslugu slanja pošiljke.",
    participants: "Korisnik (K)",
    pre: "Pošiljka je kreirana i cena je obračunata.",
    description:
      "K bira pošiljku koju želi da plati i način plaćanja (gotovina ili kartica). Sistem prikazuje iznos za plaćanje. K potvrđuje plaćanje. [Izuzetak: Plaćanje odbijeno]. Sistem evidentira plaćanje (iznos, datum i način plaćanja) i izdaje potvrdu o plaćanju.",
    exceptionLabel: "Plaćanje odbijeno",
    exceptionText:
      "Ukoliko plaćanje karticom ne prođe, sistem obaveštava K i nudi ponovni pokušaj ili drugi način plaćanja.",
    post: "Plaćanje je evidentirano za pošiljku i pošiljka može biti dodeljena kuriru.",
  },
  {
    id: "U3",
    name: "Praćenje pošiljke",
    short: "Korisnik proverava trenutni status svoje pošiljke.",
    participants: "Korisnik (K)",
    pre: "Pošiljka postoji u sistemu i K ima njen broj za praćenje.",
    description:
      "K unosi broj za praćenje pošiljke. Sistem pronalazi pošiljku. [Izuzetak: Pogrešan broj za praćenje]. Sistem prikazuje trenutni status pošiljke i datum slanja, a ako je pošiljka isporučena, i datum isporuke.",
    exceptionLabel: "Pogrešan broj za praćenje",
    exceptionText:
      "Ukoliko pošiljka sa unetim brojem ne postoji, sistem obaveštava K da proveri i ponovo unese broj.",
    post: "K je informisan o statusu pošiljke. Podaci o pošiljci nisu promenjeni.",
  },
  {
    id: "U4",
    name: "Dodela pošiljke kuriru",
    short: "Zaposleni određuje kurira koji će preuzeti i isporučiti pošiljku.",
    participants: "Zaposleni (Z)",
    pre: "Pošiljka je plaćena i nije dodeljena nijednom kuriru.",
    description:
      "Z pregleda listu plaćenih pošiljki koje nisu dodeljene kuriru. Z bira pošiljku i jednog od kurira iz svoje filijale. [Izuzetak: Nema dostupnog kurira]. Sistem na pošiljci evidentira izabranog kurira i zaposlenog koji je izvršio dodelu.",
    exceptionLabel: "Nema dostupnog kurira",
    exceptionText:
      "Ukoliko nijedan kurir nije dostupan, pošiljka ostaje nedodeljena i Z je dodeljuje kasnije.",
    post: "Pošiljka ima dodeljenog kurira.",
  },
  {
    id: "U7",
    name: "Preuzimanje pošiljke",
    short: "Kurir preuzima pošiljku sa adrese pošiljaoca.",
    participants: "Kurir (Ku)",
    pre: "Pošiljka je dodeljena kuriru.",
    description:
      "Ku dolazi na adresu pošiljaoca. [Izuzetak: Pošiljalac nije na adresi]. Ku preuzima pošiljku i u sistemu potvrđuje preuzimanje. Sistem menja status pošiljke u „Preuzeta“.",
    exceptionLabel: "Pošiljalac nije na adresi",
    exceptionText:
      "Ukoliko pošiljalac nije na adresi, Ku ne preuzima pošiljku i dolazi ponovo u dogovoreno vreme.",
    post: "Pošiljka je kod kurira i ima status „Preuzeta“.",
  },
  {
    id: "U8",
    name: "Isporuka pošiljke",
    short: "Kurir predaje pošiljku primaocu.",
    participants: "Kurir (Ku), Primalac (P)",
    pre: "Pošiljka ima status „Preuzeta“.",
    description:
      "Ku dolazi na adresu P i predaje mu pošiljku. [Izuzetak: Primalac ne preuzima pošiljku]. P potvrđuje prijem pošiljke potpisom. Ku u sistemu potvrđuje isporuku. Sistem menja status pošiljke u „Isporučena“ i upisuje datum isporuke.",
    exceptionLabel: "Primalac ne preuzima pošiljku",
    exceptionText:
      "Ukoliko P nije na adresi ili odbije pošiljku, pošiljka se vraća pošiljaocu i sistem menja njen status u „Vraćena“.",
    post: "Pošiljka je isporučena, ima status „Isporučena“ i upisan datum isporuke.",
  },
];

/* Slajd 6 */
export const CLASS_GROUP_LABELS: Record<ClassGroup, string> = {
  central: "Centralna klasa",
  people: "Učesnici slanja",
  catalog: "Šifarnik i finansije",
  org: "Organizacija službe",
};

export const CLASS_LEGEND_LINK =
  "atribut koji predstavlja vezu sa drugom klasom";

/* Slajd 7 */
export const CLASS_INTRO =
  "Atributi čiji se naziv završava na `ID`, a pripadaju drugoj klasi (npr. `korisnikID` u klasi Posiljka), predstavljaju vezu sa tom klasom.";

export type ClassDescription = {
  id: ClassId;
  /** Rečenica počinje nazivom klase, koji se ističe. */
  intro: string;
  attributes: { names: string[]; text: string }[];
};

export const CLASS_DESCRIPTIONS: ClassDescription[] = [
  {
    id: "Korisnik",
    intro:
      "Korisnik predstavlja lice koje šalje pošiljku (pošiljaoca) i evidentirano je u sistemu kurirske službe.",
    attributes: [
      { names: ["korisnikID"], text: "jedinstveni identifikator korisnika" },
      { names: ["ime", "prezime"], text: "ime i prezime korisnika" },
      {
        names: ["adresa", "grad"],
        text: "adresa sa koje kurir preuzima pošiljku",
      },
      { names: ["telefon", "email"], text: "kontakt podaci korisnika" },
    ],
  },
  {
    id: "Primalac",
    intro:
      "Primalac predstavlja lice kome je pošiljka namenjena. Podaci o primaocu unose se prilikom kreiranja pošiljke.",
    attributes: [
      { names: ["primalacID"], text: "jedinstveni identifikator primaoca" },
      { names: ["ime", "prezime"], text: "ime i prezime primaoca" },
      {
        names: ["adresa", "grad"],
        text: "adresa na koju se pošiljka isporučuje",
      },
      {
        names: ["telefon"],
        text: "kontakt telefon primaoca, koji kurir koristi pri isporuci",
      },
    ],
  },
  {
    id: "Posiljka",
    intro:
      "Posiljka je centralna klasa sistema. Predstavlja jednu pošiljku od trenutka kreiranja do isporuke ili vraćanja.",
    attributes: [
      { names: ["posiljkaID"], text: "jedinstveni identifikator pošiljke" },
      {
        names: ["brojZaPracenje"],
        text: "jedinstveni broj pomoću kog korisnik prati pošiljku",
      },
      {
        names: ["tezina"],
        text: "težina pošiljke u kilogramima, koristi se za obračun cene",
      },
      { names: ["datumSlanja"], text: "datum kreiranja pošiljke" },
      {
        names: ["datumIsporuke"],
        text: "datum isporuke primaocu (prazan dok pošiljka nije isporučena)",
      },
      {
        names: ["status"],
        text: "trenutno stanje pošiljke (Kreirana, Preuzeta, Isporučena, Vraćena)",
      },
      {
        names: ["lomljivo"],
        text: "oznaka da li pošiljka zahteva pažljivo rukovanje",
      },
      { names: ["korisnikID"], text: "veza sa korisnikom koji šalje pošiljku" },
      { names: ["primalacID"], text: "veza sa primaocem pošiljke" },
      { names: ["tipPosiljkeID"], text: "veza sa tipom pošiljke" },
      {
        names: ["kurirID"],
        text: "veza sa kurirom koji preuzima i isporučuje pošiljku",
      },
      {
        names: ["zaposleniID"],
        text: "veza sa zaposlenim koji je pošiljku dodelio kuriru",
      },
    ],
  },
  {
    id: "TipPosiljke",
    intro:
      "TipPosiljke predstavlja vrstu pošiljke (npr. pismo, dokument, paket) i određuje cenu prenosa.",
    attributes: [
      {
        names: ["tipPosiljkeID"],
        text: "jedinstveni identifikator tipa pošiljke",
      },
      { names: ["nazivTipa"], text: "naziv tipa pošiljke" },
      { names: ["cenaPoKg"], text: "cena prenosa po kilogramu za dati tip" },
    ],
  },
  {
    id: "Placanje",
    intro:
      "Placanje predstavlja evidenciju plaćanja usluge slanja jedne pošiljke.",
    attributes: [
      { names: ["placanjeID"], text: "jedinstveni identifikator plaćanja" },
      {
        names: ["iznos"],
        text: "plaćeni iznos, dobijen kao težina pošiljke × cena po kg njenog tipa",
      },
      { names: ["datumPlacanja"], text: "datum kada je plaćanje izvršeno" },
      {
        names: ["nacinPlacanja"],
        text: "način plaćanja (gotovina ili kartica)",
      },
      {
        names: ["posiljkaID"],
        text: "veza sa pošiljkom na koju se plaćanje odnosi",
      },
    ],
  },
  {
    id: "Kurir",
    intro:
      "Kurir predstavlja radnika kurirske službe koji preuzima pošiljke od pošiljalaca i isporučuje ih primaocima.",
    attributes: [
      { names: ["kurirID"], text: "jedinstveni identifikator kurira" },
      { names: ["ime", "prezime"], text: "ime i prezime kurira" },
      { names: ["JMBG"], text: "jedinstveni matični broj građana" },
      { names: ["telefon"], text: "kontakt telefon kurira" },
      { names: ["filijalaID"], text: "veza sa filijalom u kojoj kurir radi" },
    ],
  },
  {
    id: "Zaposleni",
    intro:
      "Zaposleni predstavlja službenika u filijali koji raspoređuje pošiljke kuririma.",
    attributes: [
      { names: ["zaposleniID"], text: "jedinstveni identifikator zaposlenog" },
      { names: ["ime", "prezime"], text: "ime i prezime zaposlenog" },
      { names: ["JMBG"], text: "jedinstveni matični broj građana" },
      { names: ["radnoMesto"], text: "naziv radnog mesta (npr. operater)" },
      {
        names: ["filijalaID"],
        text: "veza sa filijalom u kojoj zaposleni radi",
      },
    ],
  },
  {
    id: "Filijala",
    intro:
      "Filijala predstavlja poslovnicu kurirske službe u određenom gradu, u kojoj rade kuriri i zaposleni.",
    attributes: [
      { names: ["filijalaID"], text: "jedinstveni identifikator filijale" },
      { names: ["naziv"], text: "naziv filijale (npr. Filijala Novi Sad)" },
      { names: ["adresa", "grad"], text: "lokacija filijale" },
      { names: ["telefon"], text: "kontakt telefon filijale" },
    ],
  },
];

/* Slajd 8 */
export const SEQUENCE_SUBTITLE = "Kreiranje pošiljke";

export const SEQUENCE_STEP_NOTES: Record<number, string> = {
  1: "Korisnik šalje podatke o primaocu, tip pošiljke, težinu i oznaku da li je pošiljka lomljiva.",
  2: "Pošiljka proverava da li su svi podaci uneti i ispravni.",
  3: "Podaci su ispravni, pa se čuvaju podaci o primaocu.",
  4: "Pošiljka dobija identifikator primaoca (`primalacID`).",
  5: "Pošiljka traži od svog tipa cenu po kilogramu.",
  6: "Tip pošiljke vraća cenu po kilogramu (`cenaPoKg`).",
  7: "Pošiljka računa cenu: težina × cena po kg. Ovo je «include» Obračun cene sa dijagrama slučajeva upotrebe.",
  8: "Korisnik dobija broj za praćenje i iznos. Pošiljka ima status „Kreirana“.",
  9: "Podaci nisu ispravni, pa korisnik dobija zahtev da ih ispravi. Ovo je izuzetak iz opisa slučaja upotrebe Kreiranje pošiljke.",
};

export const SEQUENCE_LEGEND = {
  call: "sinhrona poruka (poziv)",
  return: "povratak toka upravljanja",
  lifeline: "linija života",
  activation: "fokus kontrole",
  alt: "alt — alternativni tokovi",
};
