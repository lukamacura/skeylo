/* Informacioni sistem Infinity Laser Studija: sav sadržaj mape je ovde.
   Segmenti su krupni delovi sistema (pregled), entiteti su ono što se vidi
   kad se segment zumira. Veze (links) su tokovi unutar segmenta; okidač
   (kind: "okidac") je pravilo "kad se desi X, pokreće se Y". Veza ka drugom
   segmentu piše se kao "segment/entitet". */

export type SegId = "tim" | "sadrzaj" | "kanali" | "sajt" | "studio" | "novac";

export type Status = "radi" | "novo" | "moguce" | "uskoro" | "test";

export type PersonId =
  | "ana"
  | "branka"
  | "mila"
  | "tanja"
  | "mihajlo"
  | "nina"
  | "filip"
  | "luka";

export type IconName =
  | "instagram"
  | "star"
  | "building"
  | "globe"
  | "calendar-check"
  | "calendar-days"
  | "wallet"
  | "dashboard"
  | "sparkles"
  | "face"
  | "pen"
  | "video"
  | "scissors"
  | "upload"
  | "trending"
  | "receipt"
  | "megaphone"
  | "coins"
  | "piggy";

export type Entity = {
  id: string;
  name: string;
  role: string;
  desc: string;
  /* kolona (pregled na širokom ekranu) ili red (telefon) u zumiranom segmentu */
  lane: number;
  status?: Status;
  who?: PersonId[];
  icon?: IconName;
  logo?: "meta" | "google";
  img?: string;
};

export type Link = {
  from: string;
  to: string;
  kind: "tok" | "okidac";
  /* tok: kratak natpis na liniji */
  label?: string;
  /* okidač: kad se desi ovo … */
  when?: string;
  /* … desi se ovo */
  then?: string;
  status?: Status;
};

export type Segment = {
  id: SegId;
  n: string;
  title: string;
  em: string;
  sub: string;
  lanes: string[];
  entities: Entity[];
  links: Link[];
};

/* tokovi između segmenata u pregledu: šta ide iz jednog dela sistema u drugi */
export type Flow = {
  from: SegId;
  to: SegId;
  label: string;
  kind: "sadrzaj" | "ljudi" | "novac";
};

export const STATUS: Record<Status, { label: string; color: string }> = {
  radi: { label: "Radi", color: "#3ddc84" },
  novo: { label: "Novo", color: "#f4d27a" },
  moguce: { label: "Moguće", color: "#ff6b6b" },
  uskoro: { label: "Uskoro", color: "#a8969a" },
  test: { label: "Test", color: "#86a8ff" },
};

export const PEOPLE: Record<PersonId, { name: string; src: string }> = {
  ana: { name: "Ana", src: "/clients/ils/ljudi/ana.webp" },
  branka: { name: "Branka", src: "/clients/ils/ljudi/branka.webp" },
  mila: { name: "Mila", src: "/clients/ils/ljudi/mila.webp" },
  tanja: { name: "Tanja", src: "/clients/ils/ljudi/tanja.webp" },
  mihajlo: { name: "Mihajlo", src: "/people/mihac.webp" },
  nina: { name: "Nina", src: "/people/nina.webp" },
  filip: { name: "Filip", src: "/people/filip.webp" },
  luka: { name: "Luka", src: "/people/luka.webp" },
};

export const SEGMENTS: Segment[] = [
  {
    id: "tim",
    n: "01",
    title: "Tim",
    em: "ko šta radi",
    sub: "Infinity i Skeylo, svako na svom delu.",
    lanes: ["Infinity", "Skeylo · sadržaj", "Skeylo · Meta + Google"],
    entities: [
      {
        id: "ana",
        name: "Ana",
        role: "Vlasnica",
        desc: "Lice brenda. Odobrava ponudu, a skripte komentariše u CRM-u pre snimanja.",
        lane: 0,
        who: ["ana"],
      },
      {
        id: "branka",
        name: "Branka",
        role: "Pred kamerom",
        desc: "Glavno lice u videima i tretmani u Novom Sadu.",
        lane: 0,
        who: ["branka"],
      },
      {
        id: "sombor-tim",
        name: "Mila i Tanja",
        role: "Tim u Somboru",
        desc: "Tretmani i klijentkinje u Somboru.",
        lane: 0,
        who: ["mila", "tanja"],
      },
      {
        id: "nina",
        name: "Nina",
        role: "Organizacija",
        desc: "Pravi raspored snimanja: ko je u kadru, gde i kada.",
        lane: 1,
        who: ["nina"],
      },
      {
        id: "mihajlo",
        name: "Mihajlo",
        role: "Snimanje",
        desc: "Snima u studiju po skripti i ubacuje gotove kreative u OS.",
        lane: 1,
        who: ["mihajlo"],
      },
      {
        id: "filip",
        name: "Filip",
        role: "Skripte i Meta oglasi",
        desc: "Piše skripte, vodi Meta kampanje i šalje izveštaj za svaki ciklus.",
        lane: 2,
        who: ["filip"],
      },
      {
        id: "luka",
        name: "Luka",
        role: "Sajt, sistem i Google",
        desc: "Sajt, online zakazivanje, admin i finansije. Pokreće Google Ads.",
        lane: 2,
        who: ["luka"],
      },
    ],
    links: [],
  },
  {
    id: "sadrzaj",
    n: "02",
    title: "Sadržaj",
    em: "od ideje do objave",
    sub: "Svaki video prolazi isti put, korak po korak.",
    /* koraci su sami po sebi natpisi, kolone nemaju naslov */
    lanes: [],
    entities: [
      {
        id: "skripta",
        name: "Skripta",
        role: "Ugao, hook i tekst",
        desc: "Filip piše skriptu, a Ana je komentariše u CRM-u (Creative Inspection) pre snimanja.",
        lane: 0,
        icon: "pen",
        who: ["filip", "ana"],
        status: "radi",
      },
      {
        id: "raspored",
        name: "Raspored snimanja",
        role: "Ko, gde i kada",
        desc: "Nina slaže dan snimanja. Modeli dobijaju svoj link sa rasporedom.",
        lane: 1,
        icon: "calendar-days",
        who: ["nina"],
        status: "radi",
      },
      {
        id: "snimanje",
        name: "Snimanje",
        role: "U studiju",
        desc: "Branka i modeli pred kamerom, Mihajlo snima po skripti.",
        lane: 2,
        icon: "video",
        who: ["mihajlo", "branka"],
        status: "radi",
      },
      {
        id: "montaza",
        name: "Montaža",
        role: "Vertikalni video",
        desc: "Reels i oglasi u formatu 9:16.",
        lane: 3,
        icon: "scissors",
        status: "radi",
      },
      {
        id: "kreative",
        name: "Gotove kreative",
        role: "Final Creatives",
        desc: "Mihajlo ih ubacuje u OS, Ana ih vidi u CRM-u. Odatle idu u objave i oglase.",
        lane: 4,
        icon: "upload",
        who: ["mihajlo"],
        status: "radi",
      },
    ],
    links: [
      { from: "skripta", to: "raspored", kind: "tok" },
      { from: "raspored", to: "snimanje", kind: "tok" },
      { from: "snimanje", to: "montaza", kind: "tok" },
      { from: "montaza", to: "kreative", kind: "tok" },
      { from: "kreative", to: "kanali/organski", kind: "tok", label: "objava" },
      { from: "kreative", to: "kanali/meta-zene", kind: "tok", label: "oglas" },
    ],
  },
  {
    id: "kanali",
    n: "03",
    title: "Kanali",
    em: "gde nas vide",
    sub: "Svaki kanal vodi ljude na sajt. Neki pale druge.",
    lanes: ["Prvi kontakt", "Oglasi", "Pretraga"],
    entities: [
      {
        id: "organski",
        name: "Instagram",
        role: "Organski sadržaj",
        desc: "Objave i Reels bez plaćanja. Tu se vidi koja poruka radi pre nego što u nju uložimo.",
        lane: 0,
        icon: "instagram",
        status: "radi",
      },
      {
        id: "recenzije",
        name: "Google recenzije",
        role: "Preko 100 recenzija",
        desc: "Poverenje pre prvog termina. Vide se na Google pretrazi i na mapi.",
        lane: 0,
        icon: "star",
        status: "radi",
      },
      {
        id: "firme",
        name: "Firme",
        role: "Vaučeri za zaposlene",
        desc: "Firma kupuje vaučere, a zaposleni zakazuju preko QR koda.",
        lane: 0,
        icon: "building",
        status: "moguce",
      },
      {
        id: "meta-zene",
        name: "Meta oglasi · žene",
        role: "Glavna kampanja",
        desc: "Oko 20 novih kreativa po ciklusu. Od oktobra Novi Sad i Sombor u istoj kampanji.",
        lane: 1,
        logo: "meta",
        who: ["filip"],
        status: "radi",
      },
      {
        id: "meta-muskarci",
        name: "Meta oglasi · muškarci",
        role: "Test kampanja",
        desc: "Od septembra. Muškarci češće kliknu na oglas i biraju veće regije.",
        lane: 1,
        logo: "meta",
        who: ["filip"],
        status: "test",
      },
      {
        id: "google",
        name: "Google Ads",
        role: "Visoka kupovna namera",
        desc: "Na Meti nas vide usput, na Google-u nas traže. Hvata one koji već traže epilaciju.",
        lane: 2,
        logo: "google",
        who: ["luka"],
        status: "novo",
      },
    ],
    links: [
      {
        from: "organski",
        to: "meta-zene",
        kind: "okidac",
        when: "Objava prođe organski bolje od proseka",
        then: "ista poruka ide u Meta oglase",
        status: "novo",
      },
      {
        from: "organski",
        to: "google",
        kind: "okidac",
        when: "Posle videa ljudi guglaju studio",
        then: "Google Ads ih hvata na pretrazi",
        status: "novo",
      },
      {
        from: "meta-zene",
        to: "google",
        kind: "okidac",
        when: "Vide oglas, ali ne kliknu odmah",
        then: "nađu nas kad kasnije traže na Google-u",
        status: "novo",
      },
      {
        from: "recenzije",
        to: "google",
        kind: "okidac",
        when: "Raste broj recenzija",
        then: "jači utisak na pretrazi i mapi",
        status: "novo",
      },
      { from: "organski", to: "sajt/sajt", kind: "tok", label: "klik" },
      { from: "meta-zene", to: "sajt/sajt", kind: "tok", label: "klik" },
      { from: "meta-muskarci", to: "sajt/sajt", kind: "tok", label: "klik" },
      { from: "google", to: "sajt/sajt", kind: "tok", label: "klik" },
      { from: "firme", to: "sajt/zakazivanje", kind: "tok", label: "QR kod" },
    ],
  },
  {
    id: "sajt",
    n: "04",
    title: "Sajt",
    em: "i sistem",
    sub: "Gde se zakazuje i gde se sve beleži.",
    lanes: ["Ulaz", "Zakazivanje", "Beleži se"],
    entities: [
      {
        id: "sajt",
        name: "infinitylaserstudio.com",
        role: "Sajt",
        desc: "Usluge, cene i ponuda. Svaki kanal vodi ovde.",
        lane: 0,
        icon: "globe",
        who: ["luka"],
        status: "radi",
      },
      {
        id: "zakazivanje",
        name: "Online zakazivanje",
        role: "Bez poziva",
        desc: "Termin za minut, bez telefona. Od aprila 2026. više od 1.200 zakazanih termina.",
        lane: 1,
        icon: "calendar-check",
        who: ["luka"],
        status: "radi",
      },
      {
        id: "kalendar",
        name: "Admin kalendar",
        role: "/admin",
        desc: "Svaki termin za Novi Sad i Sombor, na jednom mestu.",
        lane: 2,
        icon: "calendar-days",
        status: "radi",
      },
      {
        id: "finansije",
        name: "Finansije",
        role: "/finances",
        desc: "Svaki dinar: prihodi, rashodi i profit.",
        lane: 2,
        icon: "wallet",
        status: "radi",
      },
      {
        id: "crm",
        name: "Skeylo CRM",
        role: "Ova platforma",
        desc: "Izveštaji, skripte, kreative, raspored snimanja i šifre.",
        lane: 2,
        icon: "dashboard",
        status: "radi",
      },
    ],
    links: [
      { from: "sajt", to: "zakazivanje", kind: "tok", label: "izbor tretmana" },
      { from: "zakazivanje", to: "kalendar", kind: "tok", label: "termin" },
      { from: "zakazivanje", to: "finansije", kind: "tok", label: "cena" },
      {
        from: "zakazivanje",
        to: "studio/novi-sad",
        kind: "tok",
        label: "termin",
      },
      {
        from: "zakazivanje",
        to: "studio/sombor",
        kind: "tok",
        label: "termin",
      },
      { from: "finansije", to: "novac/prihodi", kind: "tok", label: "prihod" },
    ],
  },
  {
    id: "studio",
    n: "05",
    title: "Studio",
    em: "gde se dešava",
    sub: "Tretman, rezultat i sledeći termin.",
    lanes: ["Lokacije", "Usluge"],
    entities: [
      {
        id: "novi-sad",
        name: "Novi Sad",
        role: "Ana i Branka",
        desc: "Studio u Novom Sadu.",
        lane: 0,
        img: "/clients/ils/lokacije/novi_sad.webp",
        who: ["ana", "branka"],
        status: "radi",
      },
      {
        id: "sombor",
        name: "Sombor",
        role: "Ana, Mila i Tanja",
        desc: "Prvi studio. Od oktobra ima svoje online zakazivanje i oglase.",
        lane: 0,
        img: "/clients/ils/lokacije/sombor.webp",
        who: ["ana", "mila", "tanja"],
        status: "radi",
      },
      {
        id: "beograd",
        name: "Beograd",
        role: "Sledeći grad",
        desc: "Isti sistem, treći grad.",
        lane: 0,
        img: "/clients/ils/lokacije/beograd.webp",
        status: "uskoro",
      },
      {
        id: "epilacija",
        name: "Laserska epilacija",
        role: "Žene i muškarci",
        desc: "Laser sa 4 talasne dužine. Garancija: 70 do 90% dlačica manje ili vraćamo novac.",
        lane: 1,
        icon: "sparkles",
        status: "radi",
      },
      {
        id: "lice",
        name: "Tretmani lica",
        role: "Higijenski i biološki",
        desc: "Higijenski tretman kao osnova, biološki tretmani po tipu kože.",
        lane: 1,
        icon: "face",
        status: "novo",
      },
    ],
    links: [
      {
        from: "epilacija",
        to: "kanali/meta-zene",
        kind: "okidac",
        when: "Prođe oko 6 nedelja od tretmana",
        then: "oglas je podseti na sledeći termin",
        status: "radi",
      },
      {
        from: "epilacija",
        to: "kanali/recenzije",
        kind: "okidac",
        when: "Klijentkinja zadovoljna posle tretmana",
        then: "zamolimo je za Google recenziju",
        status: "moguce",
      },
      {
        from: "epilacija",
        to: "novac/prihodi",
        kind: "tok",
        label: "plaćen tretman",
      },
    ],
  },
  {
    id: "novac",
    n: "06",
    title: "Novac",
    em: "svaki dinar",
    sub: "Prihod se vidi, a deo se vraća u Meta i Google oglase.",
    lanes: ["Ulazi", "Odlazi", "Ostaje"],
    entities: [
      {
        id: "prihodi",
        name: "Prihodi",
        role: "Svaki termin",
        desc: "Svaki termin ulazi sa svojom cenom.",
        lane: 0,
        icon: "trending",
        status: "radi",
      },
      {
        id: "troskovi",
        name: "Troškovi studija",
        role: "Tretmani i rad",
        desc: "Materijal, oprema i rad po tretmanu.",
        lane: 1,
        icon: "receipt",
      },
      {
        id: "budzet",
        name: "Budžet za oglase",
        role: "Meta i Google",
        desc: "Ulaže se po ciklusu i prati kroz izveštaje.",
        lane: 1,
        icon: "megaphone",
      },
      {
        id: "skeylo",
        name: "Skeylo",
        role: "Vođenje",
        desc: "Naknada za vođenje, u istom obračunu.",
        lane: 1,
        icon: "coins",
      },
      {
        id: "profit",
        name: "Profit",
        role: "Ostaje Infinity-ju",
        desc: "Ono što ostaje posle svih troškova.",
        lane: 2,
        icon: "piggy",
      },
    ],
    links: [
      { from: "prihodi", to: "troskovi", kind: "tok" },
      { from: "prihodi", to: "budzet", kind: "tok" },
      { from: "prihodi", to: "skeylo", kind: "tok" },
      { from: "prihodi", to: "profit", kind: "tok" },
      { from: "budzet", to: "kanali/meta-zene", kind: "tok", label: "budžet" },
      { from: "budzet", to: "kanali/google", kind: "tok", label: "budžet" },
    ],
  },
];

export const FLOWS: Flow[] = [
  { from: "tim", to: "sadrzaj", label: "snimamo", kind: "sadrzaj" },
  { from: "sadrzaj", to: "kanali", label: "kreative", kind: "sadrzaj" },
  { from: "kanali", to: "sajt", label: "klikovi", kind: "ljudi" },
  { from: "sajt", to: "studio", label: "termini", kind: "ljudi" },
  { from: "studio", to: "novac", label: "prihod", kind: "novac" },
  { from: "novac", to: "kanali", label: "budžet za oglase", kind: "novac" },
];

export const SEG = Object.fromEntries(SEGMENTS.map((s) => [s.id, s])) as Record<
  SegId,
  Segment
>;

/* "segment/entitet" → delovi; bez kose crte entitet je u istom segmentu */
export function refOf(ref: string, here: SegId) {
  const i = ref.indexOf("/");
  return i < 0
    ? { seg: here, id: ref }
    : { seg: ref.slice(0, i) as SegId, id: ref.slice(i + 1) };
}

export function entityOf(seg: SegId, id: string) {
  return SEG[seg]?.entities.find((e) => e.id === id) ?? null;
}

/* sve veze koje dodiruju entitet, i iz drugih segmenata */
export function linksOf(seg: SegId, id: string) {
  const out: { link: Link; from: SegId; to: { seg: SegId; id: string } }[] = [];
  const into: { link: Link; from: { seg: SegId; id: string } }[] = [];
  for (const s of SEGMENTS)
    for (const l of s.links) {
      const to = refOf(l.to, s.id);
      if (s.id === seg && l.from === id) out.push({ link: l, from: s.id, to });
      if (to.seg === seg && to.id === id)
        into.push({ link: l, from: { seg: s.id, id: l.from } });
    }
  return { out, into };
}

export const triggerCount = (s: Segment) =>
  SEGMENTS.reduce(
    (n, x) =>
      n +
      x.links.filter(
        (l) =>
          l.kind === "okidac" &&
          (x.id === s.id || refOf(l.to, x.id).seg === s.id),
      ).length,
    0,
  );
