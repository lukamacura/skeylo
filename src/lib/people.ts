// Centralni izvor istine za tim.
// Team.tsx čita ceo niz; članovi koji imaju `slug` dobijaju i svoju
// biografsku stranicu na /[slug] i klikabilnu karticu na početnoj.
// Da bi neko dobio stranicu: popuni bio polja, dodaj `slug` i napravi
// src/app/[slug]/page.tsx (12 linija, po uzoru na src/app/luka/page.tsx).

// Ovaj modul čitaju i server komponente (npr. src/app/luka/page.tsx) i
// prosleđuju ga klijentskoj PersonBio. Zato ovde sme da stoji samo podatak
// koji se može serijalizovati - ikonice se čuvaju kao ime, a u komponentu
// se mapiraju u lucide-react element.
export type IconName =
  | "swords"
  | "tent"
  | "guitar"
  | "sparkles"
  | "dumbbell"
  | "notebook-pen"
  | "users";

export type Shot = {
  src: string;
  alt: string;
  /** Prirodne dimenzije - drže odnos stranica i sprečavaju skok pri učitavanju */
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
 * Isti tip nosi i "Van ekrana" - tamo umesto godine stoji ikonica.
 */
export type Chapter = {
  /** Marker u priči (godina ili faza) */
  year?: string;
  /** Marker van priče */
  icon?: IconName;
  title: string;
  /**
   * `**podebljano**` i `==istaknuto==` (traka u primarnoj boji, iscrtava se
   * pri skrolu). Highlight ne prelama red - drži ga na par reči.
   */
  text: string[];
  /** Istaknuta rečenica - prikazuje se kao panel kad poglavlje nema fotografiju */
  quote?: string;
  /** Prazan okvir sa ikonicom slike - drži mesto dok fotografija ne stigne */
  placeholder?: true;
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
  /** Broj u E.164 formatu bez plusa - vodi na wa.me */
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
    location: "Novi Sad, Srbija",
    whatsapp: "381631012474",
    chips: [
      "Web developer & Marketer",
      "Entrepreneur",
      "Studying at Faculty of Technical Science",
    ],
    chapters: [
      {
        year: "2019.",
        title: "Prva linija koda",
        text: [
          "Web developmentom sam počeo da se bavim 2019. godine. **Šest godina** sam pravio sajtove za lokalne biznise i sve je izgledalo kako treba - uradim sajt, naplatim, i tu se priča završava.",
          "U jednom trenutku mi je bilo jasno da nešto nije u redu. Sajt bez kampanje i kreative nema gde da radi: lep je, funkcioniše, i ==ne donosi ništa==.",
        ],
        point: "Uradim sajt, naplatim, i to je to.",
        shots: [
          {
            src: "/people/luka/money.webp",
            alt: "Luka drži gotovinu naplaćenu za izradu sajta",
            w: 3000,
            h: 4000,
            // Kadar je 3:4, a okvir ga seče po visini - težište je na
            // novcu i šaci u donjoj trećini, ne na kuhinjskim elementima.
            position: "object-[50%_62%]",
          },
        ],
      },
      {
        year: "Skeylo",
        title: "Upoznao sam Filipa i Mihajla",
        text: [
          "Odatle je krenuo ==full-stack marketing==. Kreativa, kampanje i sajt više ne žive odvojeno, nego rade na istom cilju.",
          "To je bila razlika koja je sve promenila. Sada **svaki projekat ima smisla**, profitabilan je, i klijentima zaista pomažemo umesto da im isporučimo fajl i odemo.",
        ],
        point: "Filip, Mihajlo i ja",
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
          "Paralelno gradim svoj projekat - MenoLisu, **AI aplikaciju za žene u menopauzi**, podupretu velikom bazom znanja (RAG).",
          "Aplikacija je ==na App Store-u== i trenutno je u fazi marketinga. Imam velika očekivanja od nje.",
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
            alt: "Radni sto sa dva monitora - strategija levka i MenoLisa aplikacija",
            w: 2252,
            h: 4000,
          },
        ],
      },
      {
        year: "Macura Solutions LLC",
        title: "Firma u Americi",
        text: [
          "Zbog MenoLise sam otvorio **firmu u Americi**, kako bih mogao da naplaćujem bilo kome u svetu.",
          "Isti pristup nosim i u Skeylo: ne isporučujem sajt, nego sistem koji nekome ==donosi novac==.",
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
      {
        year: "Studije",
        title: "Upisao sam Fakultet tehničkih nauka",
        text: [
          "Paralelno sa firmom, upisao sam **Fakultet tehničkih nauka** u Novom Sadu. Predavanja ujutru, klijenti i kod popodne - dva sveta koja sam morao da uskladim.",
          "Fakultet mi je dao teorijsku podlogu za ono što sam do tada učio isključivo kroz praksu - potvrdu da ==inženjerski način== razmišljanja stoji iza svakog dobrog proizvoda, ne samo koda.",
        ],
        point: "Zgrada FTN-a u Novom Sadu",
        shots: [
          {
            src: "/people/luka/ftn.webp",
            alt: "Fakultet tehničkih nauka u Novom Sadu",
            w: 549,
            h: 364,
          },
        ],
      },
    ],
    offscreen: [
      {
        icon: "swords",
        title: "Brazilska džiu-džica",
        text: [
          "Posle teškog dana izbaci svu lošu energiju iz tebe. Veoma težak i zahtevan sport - traži da uložiš mnogo energije u njega.",
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
        point: "Paljenje vatre kresivom",
        shots: [
          {
            src: "/people/luka/bushcraft.webp",
            alt: "Luka obrađuje komad drveta nožem u prirodi",
            w: 2160,
            h: 3840,
            // Kadar je 9:16, a okvir ga seče na oko pola visine - `top` drži
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
    slug: "mihajlo",
    name: "Mihajlo Obradović",
    role: "Video Production Director",
    img: "/people/mihac.webp",
    heading: "Ćao, ja sam Mihajlo",
    location: "Novi Sad, Srbija",
    whatsapp: "381638135141",
    chips: [
      "Content Director & Co-founder",
      "Video Producer",
      "Studying at Faculty of Technical Science",
    ],
    // Medija kolona su za sada prazni okviri (`placeholder`). Kad stignu
    // fotografije, `placeholder` se menja za `shots` (+ `point`), isti
    // obrazac kao kod Luke.
    chapters: [
      {
        year: "2016.",
        title: "Prvi klikovi i YouTube počeci",
        text: [
          "Photoshop sam savladao iz priručnika koji mi je slučajno zapao za oko na polici. Odatle sam na YouTube-u otkrio **Sony Vegas i Camtasia Studio** - tutorijale sam gledao po ceo dan.",
          "Programe sam ==savladao za mesec dana==. Onda sam počeo da snimam sebe samo da bih vežbao montažu, i te klipove potpuno spontano kačio na YouTube.",
        ],
        placeholder: true,
      },
      {
        year: "2022.",
        title: 'Prva "profi" kamera',
        text: [
          "Oduvek sam sanjao profesionalnu opremu. U srednjoj školi sam zbog proseka i vladanja dobio stipendiju - **uštedeo sam je celu** da bih priuštio prvu pravu kameru, Canon EOS M50.",
          "Od tada sav novac ==reinvestiram u opremu==. Krenuo sam od muzičkih spotova, pa se prešaltao na marketing.",
        ],
        placeholder: true,
      },
      {
        year: "Skeylo",
        title: "Od skečeva do ozbiljnog marketinga",
        text: [
          "Sa Filipom sam počeo da radim godinu dana nakon što smo se upoznali. Trebao mu je još jedan čovek u timu koji je pravio skečeve za lokalne e-commerce brendove - mojim dolaskom smo sve digli na viši nivo i to su postali ==jedni od najviralnijih klipova na Balkanu==.",
          "Vremenom su nam ambicije porasle. Nismo više hteli samo skečeve, hteli smo **kompletan marketing za ozbiljne firme**. Ubacio sam Luku, sa kojim sam išao u razred, i tako smo se okupili. Kakav utisak to ostavlja na klijente, svedoče naši rezultati.",
        ],
        placeholder: true,
      },
      {
        year: "Danas",
        title: "Fokus i usavršavanje",
        text: [
          "Trenutni fokus su mi **Skeylo klijenti** i izgradnja personalnog brenda na Instagramu, TikToku i YouTube-u.",
          "Paralelno usavršavam ==3D editovanje i produkciju== - svaki sledeći projekat mora da izgleda bolje od prethodnog.",
        ],
        placeholder: true,
      },
      {
        year: "Studije",
        title: "Fakultet tehničkih nauka",
        text: [
          "Studiram programiranje, smer E2, na **FTN-u u Novom Sadu**. Programiranje nije direktno povezano sa produkcijom, ali mi je odličan životni izazov - tera me na maksimalnu produktivnost da bih stigao oba.",
          "U budućnosti planiram da ==spojim ta dva sveta==: softverski sistemi za kamere i komunikaciju na setu, i produkcija na potpuno drugom nivou.",
        ],
        placeholder: true,
      },
    ],
    offscreen: [
      {
        icon: "dumbbell",
        title: "Teretana",
        text: [
          "Treninzi snage tri puta nedeljno su mi neophodni da ostanem u fokusu. Odličan način da se čovek isključi i održi radnu disciplinu.",
        ],
        placeholder: true,
      },
      {
        icon: "notebook-pen",
        title: "Filmski scenariji",
        text: [
          "Veliki deo vremena provodim pišući scenarije. Razvijam ideje za filmove koje bih u budućnosti voleo da pretvorim u realnost - to je moj kreativni izduvni ventil.",
        ],
        placeholder: true,
      },
      {
        icon: "users",
        title: "Prijatelji",
        text: [
          "Kada se kamere ugase i kodiranje završi, slobodno vreme najradije provodim sa prijateljima - trudim se da održim balans između posla i svakodnevice.",
        ],
        placeholder: true,
      },
    ],
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
