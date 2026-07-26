// Centralni izvor istine za tim.
// Team.tsx čita ceo niz; članovi koji imaju `slug` dobijaju i svoju
// biografsku stranicu na /[slug] i klikabilnu karticu na početnoj.
// Da bi neko dobio stranicu: popuni bio polja, dodaj `slug` i napravi
// src/app/[slug]/page.tsx (12 linija, po uzoru na src/app/luka/page.tsx).

// Ovaj modul čitaju i server komponente (npr. src/app/luka/page.tsx) i
// prosleđuju ga klijentskoj PersonBio. Zato ovde sme da stoji samo podatak
// koji se može serijalizovati — ikonice se čuvaju kao ime, a u komponentu
// se mapiraju u lucide-react element.
export type IconName = "swords" | "tent" | "guitar" | "sparkles";

export type Shot = {
  src: string;
  alt: string;
  /** Prirodne dimenzije — drže odnos stranica i sprečavaju skok pri učitavanju */
  w: number;
  h: number;
  /** Kratak potpis; izostavi kad `point` poglavlja već imenuje fotografiju */
  caption?: string;
  /** object-position kada kadar mora da se seče */
  position?: string;
};

/**
 * Jedno poglavlje priče: tekst i fotografije koje mu pripadaju stoje zajedno,
 * pa se čitaju kao celina umesto da slike žive u odvojenoj galeriji.
 * Isti tip nosi i "Van ekrana" — tamo umesto godine stoji ikonica.
 */
export type Chapter = {
  /** Marker u priči (godina ili faza) */
  year?: string;
  /** Marker van priče */
  icon?: IconName;
  title: string;
  text: string[];
  /** Istaknuta rečenica — prikazuje se kao panel kad poglavlje nema fotografiju */
  quote?: string;
  /** Rečenica uz strelicu koja pokazuje na fotografiju */
  point?: string;
  /** Slike iz /public/people/[key]/ */
  shots?: Shot[];
};

export type Person = {
  /** Stabilan id, poklapa se sa imenom fajla u /public/people */
  key: string;
  name: string;
  role: string;
  img: string;
  /** Postavljeno => postoji biografska stranica */
  slug?: string;

  // --- Ispod: samo za članove sa biografskom stranicom ---
  /** H1 na biografskoj stranici */
  heading?: string;
  tagline?: string;
  location?: string;
  /** Broj u E.164 formatu bez plusa — vodi na wa.me */
  whatsapp?: string;
  /** Meta pilule u hero sekciji */
  chips?: string[];
  /** Priča kroz poglavlja, svako sa svojim slikama */
  chapters?: Chapter[];
  /** Ista mehanika, sekcija "Van ekrana" */
  offscreen?: Chapter[];
};

export const PEOPLE: Person[] = [
  {
    key: "luka",
    slug: "luka",
    name: "Luka Macura",
    role: "Web Development & CRO",
    img: "/people/luka.webp",
    heading: "Ćao, ja sam Luka",
    tagline:
      "Šest godina sam pravio sajtove. Onda sam shvatio da sajt sam po sebi ne znači ništa.",
    location: "Novi Sad, Srbija",
    whatsapp: "381631012474",
    chips: [
      "Novi Sad, Srbija",
      "Web development od 2019.",
      "Macura Solutions LLC",
    ],
    chapters: [
      {
        year: "2019.",
        title: "Prvi red koda",
        text: [
          "Web developmentom sam počeo da se bavim 2019. godine. Šest godina sam pravio sajtove za lokalne biznise i sve je izgledalo kako treba — uradim sajt, naplatim, i tu se priča završava.",
          "U jednom trenutku mi je bilo jasno da nešto nije u redu. Sajt bez kampanje i kreative nema gde da radi: lep je, funkcioniše, i ne donosi ništa.",
        ],
        point: "Uradim sajt, naplatim, i to je to.",
        shots: [
          {
            src: "/people/luka/money.webp",
            alt: "Luka drži gotovinu naplaćenu za izradu sajta",
            w: 3000,
            h: 4000,
            // Kadar je 3:4, a okvir ga seče po visini — težište je na
            // novcu i šaci u donjoj trećini, ne na kuhinjskim elementima.
            position: "object-[50%_62%]",
          },
        ],
      },
      {
        year: "Skeylo",
        title: "Upoznao sam Filipa i Mihajla",
        text: [
          "Odatle je krenuo full-stack marketing. Kreativa, kampanje i sajt više ne žive odvojeno, nego rade na istom cilju.",
          "To je bila razlika koja je sve promenila. Sada svaki projekat ima smisla, profitabilan je, i klijentima zaista pomažemo umesto da im isporučimo fajl i odemo.",
        ],
        point: "Filip i Mihajlo — veče kada je dogovoreno",
        shots: [
          {
            src: "/people/luka/tim.webp",
            alt: "Luka, Filip i Mihajlo nazdravljaju",
            w: 1536,
            h: 2048,
            position: "object-[50%_38%]",
          },
        ],
      },
      {
        year: "Danas",
        title: "MenoLisa",
        text: [
          "Paralelno gradim svoj projekat — MenoLisu, AI aplikaciju za žene u menopauzi, podupretu velikom bazom znanja (RAG).",
          "Aplikacija je na App Store-u i trenutno je u fazi marketinga. Imam velika očekivanja od nje.",
        ],
        point: "Uživo na App Store-u",
        shots: [
          {
            src: "/people/luka/menolisa.webp",
            alt: "MenoLisa na App Store-u",
            w: 945,
            h: 2048,
          },
          {
            src: "/people/luka/radni-sto.webp",
            alt: "Radni sto sa dva monitora — strategija levka i MenoLisa aplikacija",
            w: 2252,
            h: 4000,
          },
        ],
      },
      {
        year: "Macura Solutions LLC",
        title: "Firma u Americi",
        text: [
          "Zbog MenoLise sam otvorio firmu u Americi, kako bih mogao da naplaćujem bilo kome u svetu.",
          "Isti pristup nosim i u Skeylo: ne isporučujem fajl, nego sistem koji nekome donosi novac.",
        ],
        point: "Prve kartice firme",
        shots: [
          {
            src: "/people/luka/kartice.webp",
            alt: "Kartice firme Macura Solutions LLC",
            w: 2252,
            h: 4000,
            position: "object-[50%_45%]",
          },
        ],
      },
    ],
    offscreen: [
      {
        icon: "swords",
        title: "Brazilska džiu-džica",
        text: [
          "Posle teškog dana izbaci svu lošu energiju iz tebe. Veoma težak i zahtevan sport — traži da uložiš mnogo energije u njega.",
        ],
        point: "No Gi Challenge, Novi Sad",
        shots: [
          {
            src: "/people/luka/bjj-1.webp",
            alt: "Luka na No Gi Challenge takmičenju u Novom Sadu",
            w: 2976,
            h: 1984,
          },
          {
            src: "/people/luka/bjj-2.webp",
            alt: "Luka u dominantnoj poziciji tokom meča",
            w: 2976,
            h: 1984,
          },
        ],
      },
      {
        icon: "tent",
        title: "Bushcraft",
        text: [
          "Paljenje vatre, pravljenje skloništa, vezivanje čvorova. Veštine koje te vrate na ono osnovno.",
        ],
        point: "Bez signala, bez ekrana — samo ono što umeš rukama",
        shots: [
          {
            src: "/people/luka/bushcraft.webp",
            alt: "Luka obrađuje komad drveta nožem u prirodi",
            w: 2160,
            h: 3840,
            // Kadar je 9:16, a okvir ga seče na oko pola visine — `top` drži
            // lice i ruke u slici umesto da ostane samo torzo.
            position: "object-top",
          },
        ],
      },
      {
        icon: "guitar",
        title: "Gitara",
        text: [
          "Način da se glava isprazni kada ni trening ni kod nisu rešenje.",
        ],
        point: "Kad ništa drugo ne upali",
        shots: [
          {
            src: "/people/luka/gitara.webp",
            alt: "Luka svira akustičnu gitaru",
            w: 1920,
            h: 1080,
          },
        ],
      },
    ],
  },
  {
    key: "filip",
    name: "Filip Ruvčeski",
    role: "Media Buyer",
    img: "/people/filip.webp",
  },
  {
    key: "mihac",
    name: "Mihajlo Obradović",
    role: "Video Production Director",
    img: "/people/mihac.webp",
  },
  {
    key: "nina",
    name: "Nikolina Kostić",
    role: "Organization Director",
    img: "/people/nina.webp",
  },
  {
    key: "stefan",
    name: "Stefan Stojanović",
    role: "Video Production",
    img: "/people/stefan.webp",
  },
  {
    key: "kuzma",
    name: "Luka Kuzmanović",
    role: "Video Production",
    img: "/people/kuzma.webp",
  },
];

export function getPerson(slug: string): Person | undefined {
  return PEOPLE.find((p) => p.slug === slug);
}
