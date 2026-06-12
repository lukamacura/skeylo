// Centralni izvor istine za sva tri paketa.
// Listinzi prate docs/packages.md.
// Svaki paket ima svoju landing stranicu na /paketi/[slug].

export type Package = {
  slug: string;
  name: string;
  tagline: string;
  price: number; // u evrima
  priceNote: string;
  badge: string;
  // CTA tekst na kartici (drugačiji za svaki paket)
  cta: string;
  // Flagship paket dobija premium zlatni tretman
  premium?: boolean;
  // Hero
  heroKicker: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  // Za koga je
  forWho: string;
  // Problem -> rešenje
  pain: string[];
  promise: string;
  // Šta dobijaš (tačno iz ponude)
  deliverables: { title: string; desc: string }[];
  // Rezultati / brojke
  stats: { value: string; label: string }[];
  // Rezultat na kraju
  outcome: string;
  // boja akcenta za vizuelnu razliku
  accent: string;
};

export const PACKAGES: Package[] = [
  {
    slug: "creative-engine",
    name: "Creative Engine",
    tagline:
      "Poboljšaj performans tvoje Meta Kampanje kreativama koje su zaradile preko 100.000€",
    price: 720,
    priceNote: "jednokratno",
    badge: "Start",
    cta: "Želim kreative",
    heroKicker: "Paket 01 - Creative Engine",
    heroTitle: "Kreativa koja",
    heroHighlight: "privlači prve kupce",
    heroSubtitle:
      "10 profesionalnih kreativa prilagođenih tvom brendu, plus strateški PDF vodič koji ti pokazuje kako da ih iskoristiš za maksimalan efekat.",
    forWho:
      "Za brendove koji žele da osveže vizuelni identitet i privuku prve kupce - bez da troše sate na dizajn i nagađanje šta da objave.",
    pain: [
      "Objave ti izgledaju amaterski i ne privlače pažnju.",
      "Trošiš sate u Canvi, a rezultat i dalje ne prodaje.",
      "Nemaš ideju šta da objaviš ni kako da to iskoristiš.",
    ],
    promise:
      "Dobijaš 10 gotovih, brend-konzistentnih kreativa i jasan vodič kako da ih objaviš za najbolji efekat - spremno za upotrebu od prvog dana.",
    deliverables: [
      {
        title: "10 kreativa",
        desc: "Profesionalno dizajnirani vizueli prilagođeni tvom brendu.",
      },
      {
        title: "Strateški PDF vodič",
        desc: "Detaljna uputstva i strategije kako da maksimalno iskoristiš kreative za najbolji efekat.",
      },
    ],
    stats: [
      { value: "10", label: "premium kreativa" },
      { value: "100%", label: "prilagođeno tvom brendu" },
      { value: "PDF", label: "strateški vodič uključen" },
    ],
    outcome:
      "Za par dana imaš biblioteku od 10 kreativa i vodič uz njih - feed koji izgleda kao da iza njega stoji ozbiljan brend.",
    accent: "#d87928",
  },
  {
    slug: "profit-accelerator",
    name: "Profit Accelerator",
    tagline: "Ozbiljan rast kroz Meta oglašavanje",
    price: 1600,
    priceNote: "jednokratno",
    badge: "Rast",
    cta: "Želim rast",
    heroKicker: "Paket 02 - Profit Accelerator",
    heroTitle: "Pretvaramo budžet u",
    heroHighlight: "predvidiv profit",
    heroSubtitle:
      "20 kreativa, kompletno vođene Meta kampanje i analiza tvog sajta - sistem koji optimizuje konverzije i pokreće ozbiljan rast.",
    forWho:
      "Za biznise koji žele da pokrenu ozbiljan rast, optimizuju konverzije i počnu da dominiraju na društvenim mrežama.",
    pain: [
      "Paljaš oglase, ali ne znaš koji zapravo donose novac.",
      "Sajt ti ima posete, ali se posetioci ne pretvaraju u kupce.",
      "Nemaš vremena ni znanje da vodiš i optimizuješ kampanje.",
    ],
    promise:
      "Preuzimamo tvoje Meta oglašavanje od A do Š, dajemo ti 20 kreativa za testiranje i analiziramo sajt sa konkretnim predlozima koji podižu prodaju.",
    deliverables: [
      {
        title: "20 kreativa",
        desc: "Veća količina vizuelnog sadržaja za testiranje i skaliranje.",
      },
      {
        title: "Meta reklame (FB & IG)",
        desc: "Kompletno vođenje, optimizacija i praćenje oglasnih kampanja.",
      },
      {
        title: "Analiza sajta",
        desc: "Detaljan pregled uz konkretne UX/UI predloge za povećanje prodaje.",
      },
    ],
    stats: [
      { value: "20", label: "kreativa za testiranje i skaliranje" },
      { value: "FB+IG", label: "Meta kampanje pod našim vođenjem" },
      { value: "UX/UI", label: "analiza sajta sa predlozima" },
    ],
    outcome:
      "Dobijaš profesionalno vođene kampanje, sadržaj za skaliranje i sajt spreman da konvertuje - sve usmereno ka više prodaja.",
    accent: "#e8a13a",
  },
  {
    slug: "profit-za-tebe",
    name: "Profit Za Tebe",
    tagline:
      "Dok se Vi fokusirate na upravljanje biznisom, Skeylo tim radi sve što je potrebno da Vaš brend dostigne svoj maksimalni potencijal.",
    price: 2550,
    priceNote: "jednokratno",
    badge: "All-in-one",
    cta: "Želim sve",
    premium: true,
    heroKicker: "Paket 03 - Profit Za Tebe",
    heroTitle: "Ceo biznis online -",
    heroHighlight: "ključ u ruke",
    heroSubtitle:
      "Premium kreativa, napredne Meta kampanje i moderan sajt sa webshopom, sistemom za zakazivanje i finansijskim admin panelom. Sve na jednom mestu.",
    forWho:
      "Za biznise koji žele kompletno digitalno prisustvo - sajt, prodaju i marketing - bez spajanja deset alata i agencija.",
    pain: [
      "Nemaš sajt koji zaista prodaje 24/7.",
      "Termine zakazuješ ručno, a leadovi ti usput cure.",
      "Nemaš jasnu sliku prihoda, troškova i šta se zaista isplati.",
    ],
    promise:
      "Postaješ vlasnik kompletnog digitalnog sistema - premium kreativa, ROI-fokusirane kampanje i moderan sajt sa prodavnicom, zakazivanjem i finansijskim panelom.",
    deliverables: [
      {
        title: "20 premium kreativa",
        desc: "Vizuelni materijali najvišeg nivoa za sve marketinške kanale.",
      },
      {
        title: "Napredne Meta reklame",
        desc: "Strategije oglašavanja fokusirane na maksimalan povrat investicije (ROI).",
      },
      {
        title: "Web aplikacija",
        desc: "Moderan i brz sajt bilo da je webshop ili običan landing page.",
      },
      {
        title: "Sistem za zakazivanje",
        desc: "Automatizovano bukiranje termina i usluga - bez ručnog rada.",
      },
      {
        title: "Finansijski admin panel",
        desc: "Praćenje prihoda, troškova i analitike u realnom vremenu.",
      },
    ],
    stats: [
      { value: "All-in-1", label: "rešenje ključ u ruke" },
      { value: "24/7", label: "sajt koji prodaje i zakazuje" },
      { value: "3-u-1", label: "webshop + zakazivanje + finansije" },
    ],
    outcome:
      "Posle lansiranja imaš sajt koji prodaje i zakazuje 24/7, jasnu sliku finansija i marketing koji ga puni kupcima.",
    accent: "#f0b656",
  },
];

export function getPackage(slug: string): Package | undefined {
  return PACKAGES.find((p) => p.slug === slug);
}

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("sr-RS").format(n);
