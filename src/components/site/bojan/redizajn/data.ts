import {
  ClipboardList,
  Droplets,
  Hammer,
  LayoutGrid,
  Lightbulb,
  MoveHorizontal,
  Package,
  PaintRoller,
  PencilRuler,
  Printer,
  Shirt,
  Signpost,
  Sparkles,
  SprayCan,
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

/* The first purchase discount the app's barcode gives. */
export const FIRST_BUY_OFF = 5;

/* The six worst spots in the Fruškogorska store, in the order a customer
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
    label: "Lokal 1/6: ulaz",
    title: "Ulaz. [[Prvi utisak.]]",
    alt: "Ulaz u lokal",
    pre: "/clients/neto/pre-ulaz.webp",
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
    label: "Lokal 2/6: prolaz",
    title: "Sred radnje. [[Zid od papira.]]",
    alt: "Glavni prolaz",
    pre: "/clients/neto/pre-prolaz.webp",
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
    label: "Lokal 3/6: kavez",
    title: "Kavez sa odećom. [[Haos u prolazu.]]",
    alt: "Kavez sa odećom u prolazu",
    pre: "/clients/neto/pre-kavez.webp",
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
    label: "Lokal 4/6: lavabo",
    title: "Lavabo. [[Usred prodavnice.]]",
    alt: "Lavabo pored frižidera",
    pre: "/clients/neto/pre-lavabo.webp",
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
    label: "Lokal 5/6: plafon",
    title: "Plafon. [[Fleke od vlage.]]",
    alt: "Plafon iznad rafa",
    pre: "/clients/neto/pre-plafon.webp",
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
    label: "Lokal 6/6: kasa",
    title: "Kasa. [[Poslednji utisak.]]",
    alt: "Kasa i izlaz",
    pre: "/clients/neto/pre-kasa.webp",
    w: 1600,
    h: 900,
    fixes: [
      [ClipboardList, "Jedna oglasna tabla"],
      [LayoutGrid, "Police istog stila"],
      [Package, "Bez kaveza"],
      [Sparkles, "Čist zamrzivač"],
    ],
  },
];

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
