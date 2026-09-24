// Centralni izvor istine za sve pakete.
// Listinzi prate docs/packages.md.
// Svaki paket ima svoju statičku landing stranicu u src/app/paketi/<slug>/page.tsx.

export type Package = {
  slug: string;
  name: string;
  tagline: string;
  price: number; // u evrima (interno - koristi se za vrednost leada u CRM-u)
  priceNote: string;
  // Alternativna jednokratna cena - prikazuje se samo na landing stranici paketa
  oneTimePrice?: number;
  // Paket sa cenom po meri - cena se nikad ne prikazuje na sajtu
  customPrice?: boolean;
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
    slug: "podcast-simulation",
    name: "Podcast Simulation",
    tagline:
      "30 videa mesečno koji dokazuju Vašu stručnost i grade autoritet u niši - za samo 3 sata u studiju.",
    price: 750,
    priceNote: "mesečno",
    oneTimePrice: 950,
    badge: "Daily upload",
    cta: "Pogledaj ponudu",
    heroKicker: "Podcast Simulation",
    heroTitle: "30 videa za Vaših",
    heroHighlight: "3 sata mesečno",
    heroSubtitle:
      "Za samo 3 sata mesečno proizvodimo 30 videa koji dokazuju Vašu stručnost i kredibilitet u niši - gradeći u očima publike neupitan autoritet.",
    forWho:
      "Za ljude koji nemaju vremena da kreiraju sadržaj, ali imaju ozbiljne ambicije za svoj lični brend.",
    pain: [
      "Znate da treba da objavljujete svaki dan, ali nemate ni vreme ni ekipu za to.",
      "Snimanje na svoju ruku, bez pitanja i voditelja, ispadne usiljeno i nikad ne izađe.",
      "Objavljujete kad stignete - jednom nedeljno, pa pauza od mesec dana.",
    ],
    promise:
      "Dolazite u studio jednom mesečno na 3 sata. Mi pripremamo pitanja, vodimo razgovor, snimamo i montiramo - Vi dobijate 30 klipova spremnih za objavu, jedan za svaki dan.",
    deliverables: [
      {
        title: "30 pitanja iz Vaše industrije",
        desc: "Istražujemo tržište i pripremamo pitanja na koja Vaši kupci traže odgovore.",
      },
      {
        title: "3 sata snimanja u studiju sa voditeljem",
        desc: "Moderan prostor, profesionalna oprema, kamerman i voditelj koji izvlači najbolje odgovore.",
      },
      {
        title: "30 montiranih klipova",
        desc: "Vertikalni format za Reels, TikTok i Shorts - jedan klip za svaki dan u mesecu.",
      },
      {
        title: "ManyChat automacija i soft CTA",
        desc: "Svaki video radi i kao lead magnet - komentare pretvara u poruke i upite.",
      },
    ],
    stats: [
      { value: "3h", label: "snimanja mesečno" },
      { value: "30", label: "gotovih videa" },
      { value: "30", label: "dana objava" },
    ],
    outcome:
      "Posle jednog termina u studiju imate mesec dana daily upload-a - bez smišljanja tema, bez montaže i bez praznina u objavama.",
    accent: "#d87928",
  },
  {
    slug: "profit-za-tebe",
    name: "Profit Za Tebe",
    tagline:
      "Dok se Vi fokusirate na upravljanje biznisom, Skeylo tim radi sve što je potrebno da Vaš brend dostigne svoj maksimalni potencijal.",
    price: 2550,
    priceNote: "",
    customPrice: true,
    badge: "All-in-one",
    cta: "Pogledaj ponudu",
    premium: true,
    heroKicker: "Profit Za Tebe",
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
        title: "Vođenje Meta Ads kampanje",
        desc: "Strategije oglašavanja fokusirane na maksimalan povrat investicije (ROI).",
      },
      {
        title: "Website/Webshop",
        desc: "Moderan i brz sajt bilo da je webshop ili običan landing page.",
      },
      {
        title: "Sistem za kupovinu/zakazivanje",
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

// Tekst koji zamenjuje cenu za pakete sa ponudom po meri.
export const CUSTOM_PRICE_LABEL = "Po dogovoru";

// Jedini način na koji cena sme da se prikaže u UI-u.
export const priceLabel = (p: Package) =>
  p.customPrice ? CUSTOM_PRICE_LABEL : `${formatPrice(p.price)}€`;

// Cena + napomena ("750€ / mesečno"); bez napomene ostaje samo cena.
export const priceLabelFull = (p: Package) =>
  p.customPrice || !p.priceNote
    ? priceLabel(p)
    : `${priceLabel(p)} / ${p.priceNote}`;
