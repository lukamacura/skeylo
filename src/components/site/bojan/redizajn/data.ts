import {
  BadgePercent,
  ClipboardList,
  Droplets,
  Hammer,
  LayoutGrid,
  Lightbulb,
  MoveHorizontal,
  Package,
  PaintRoller,
  PenOff,
  PencilRuler,
  Printer,
  QrCode,
  Shirt,
  Signpost,
  Sparkles,
  SprayCan,
  Store,
  Tag,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------------
   Everything in this file is meant to be filled in by hand as the project
   firms up. An empty `name` or a missing `amount` shows on the slide as a
   dashed blank ("upisujemo"), so the deck can go out before the architect
   and the craftsmen are picked and the numbers are in.
   ------------------------------------------------------------------------ */

/* The first store to be redone. */
export const LOCATION = "Patrijarha Pavla / Fruškogorska";

/* Skeylo's fee for the three months, in euros, without VAT. */
export const AGENCY_FEE = 10500;
export const MONTHS = 3;

/* What the first offer's Full package charged a month for the team (/bojan,
   PACKS "Full paket"): site + catalogue, paid and organic creatives. The
   price slide compares against it: same monthly fee, the rest on top. */
export const FULL_PACK_TEAM = 3500;

/* The first purchase discount the app's barcode gives. */
export const FIRST_BUY_OFF = 5;

/* The six worst spots in the Fruškogorska store (plus digital prices for
   the main stores as the seventh), in the order a customer
   meets them, one slide each. `pre` is our photo from the store. `posle` is
   the same shot redone (Gemini, prompts in OS: General / Neto / Pre i
   posle): drop the file in /public/clients/neto as posle-<id>.webp and fill
   in the path. Until then the slide shows only "pre". */
export type Spot = {
  id: string;
  label: string;
  title: string;
  alt: string;
  pre: string;
  posle?: string;
  w: number;
  h: number;
  fixes: [LucideIcon, string][];
};

export const SPOTS: Spot[] = [
  {
    id: "ulaz",
    label: "Lokal 1/7: ulaz",
    title: "Ulaz. [[Prvi utisak.]]",
    alt: "Ulaz u lokal",
    pre: "/clients/neto/pre-ulaz.webp",
    posle: "/clients/neto/posle-ulaz.webp",
    w: 960,
    h: 1280,
    fixes: [
      [SprayCan, "Bez grafita"],
      [PaintRoller, "Okrečena fasada"],
      [Lightbulb, "Cela svetleća tabla"],
      [Sparkles, "Čist izlog"],
    ],
  },
  {
    id: "prolaz",
    label: "Lokal 2/7: prolaz",
    title: "Sred radnje. [[Zid od papira.]]",
    alt: "Glavni prolaz",
    pre: "/clients/neto/pre-prolaz.webp",
    posle: "/clients/neto/posle-prolaz.webp",
    w: 1600,
    h: 900,
    fixes: [
      [MoveHorizontal, "Slobodan prolaz"],
      [LayoutGrid, "Papir na policu"],
      [Signpost, "Oznake odeljaka"],
      [Tag, "Štampane cene"],
    ],
  },
  {
    id: "kavez",
    label: "Lokal 3/7: kavez",
    title: "Kavez sa odećom. [[Haos u prolazu.]]",
    alt: "Kavez sa odećom u prolazu",
    pre: "/clients/neto/pre-kavez.webp",
    posle: "/clients/neto/posle-kavez.webp",
    w: 960,
    h: 1280,
    fixes: [
      [Package, "Neto kutija"],
      [Shirt, "Složeno po vrsti"],
      [Sparkles, "Bez merdevina i kesa"],
    ],
  },
  {
    id: "lavabo",
    label: "Lokal 4/7: lavabo",
    title: "Lavabo. [[Usred prodavnice.]]",
    alt: "Lavabo pored frižidera",
    pre: "/clients/neto/pre-lavabo.webp",
    posle: "/clients/neto/posle-lavabo.webp",
    w: 960,
    h: 1280,
    fixes: [
      [Wrench, "Lavabo uklonjen"],
      [Package, "Kutije u magacin"],
      [LayoutGrid, "Puna, uredna polica"],
    ],
  },
  {
    id: "plafon",
    label: "Lokal 5/7: plafon",
    title: "Plafon. [[Fleke od vlage.]]",
    alt: "Plafon iznad rafa",
    pre: "/clients/neto/pre-plafon.webp",
    posle: "/clients/neto/posle-plafon.webp",
    w: 960,
    h: 1280,
    fixes: [
      [Droplets, "Sanirana vlaga"],
      [PaintRoller, "Okrečen plafon"],
      [Tag, "Štampane cene"],
    ],
  },
  {
    id: "kasa",
    label: "Lokal 6/7: kasa",
    title: "Kasa. [[Poslednji utisak.]]",
    alt: "Kasa i izlaz",
    pre: "/clients/neto/pre-kasa.webp",
    posle: "/clients/neto/posle-kasa.webp",
    w: 1600,
    h: 900,
    fixes: [
      [ClipboardList, "Jedna oglasna tabla"],
      [LayoutGrid, "Police istog stila"],
      [Package, "Bez kaveza"],
      [Sparkles, "Čist zamrzivač"],
    ],
  },
  /* The last one is a proposal for the main stores rather than a fix in
     this one: digital price labels on the shelves. The photo is
     Fruškogorska 11; the "posle" is the same shot with an electronic
     label composited over the handwritten tag. */
  {
    id: "cene",
    label: "Lokal 7/7: cene",
    title: "Cene. [[Pisane rukom.]]",
    alt: "Cena napisana rukom na rafu",
    pre: "/clients/neto/pre-cene.webp",
    posle: "/clients/neto/posle-cene.webp",
    w: 960,
    h: 1280,
    fixes: [
      [Tag, "Digitalne cene"],
      [Zap, "Nova cena za sekund"],
      [Store, "Glavne prodavnice"],
      [PenOff, "Bez pisanja rukom"],
    ],
  },
];

/* The store's glass door (Fruškogorska 08), where the QR journey starts:
   today a flyer taped to the glass, after the redesign the Neto QR sticker
   with the first purchase offer. Not one of the seven spots: it opens the
   app part of the deck. The "posle" is Luka's Gemini edit (2026-11-21);
   journey.tsx also shows it in the phone's camera and marks where its QR
   code sits (QR_IN_PHOTO), so a new photo needs that box measured again. */
export const QR_DOOR: Spot = {
  id: "qr-vrata",
  label: "QR: vrata",
  title: "Vrata. [[Prvi korak do aplikacije.]]",
  alt: "Staklena vrata prodavnice",
  pre: "/clients/neto/pre-vrata.webp",
  posle: "/clients/neto/posle-vrata.webp",
  w: 960,
  h: 1280,
  fixes: [
    [QrCode, "Neto QR nalepnica"],
    [BadgePercent, `−${FIRST_BUY_OFF}% na 1. kupovinu`],
    [Sparkles, "Bez letaka na selotejpu"],
  ],
};

export type Person = { role: string; icon: LucideIcon; name?: string };

export const ARCHITECT: Person = {
  role: "Arhitekta",
  icon: PencilRuler,
  name: "",
};

export const CRAFTS: Person[] = [
  { role: "Električar", icon: Zap, name: "" },
  { role: "Moler", icon: PaintRoller, name: "" },
  { role: "Stolar", icon: Hammer, name: "" },
  { role: "Reklamna tabla", icon: Signpost, name: "" },
  { role: "Štampa", icon: Printer, name: "" },
];

/* The redesign budget, line by line, in euros. Leave `amount` out until
   the number is agreed. */
export type Line = { label: string; icon: LucideIcon; amount?: number };

export const BUDGET: Line[] = [
  { label: "Projekat arhitekte", icon: PencilRuler },
  { label: "Radovi majstora", icon: Hammer },
  { label: "Materijal i boja", icon: PaintRoller },
  { label: "Rasveta", icon: Lightbulb },
  { label: "Fasada i reklamna tabla", icon: Signpost },
  { label: "QR materijali i štampa", icon: Printer },
];
