import {
  Hammer,
  Lightbulb,
  PaintRoller,
  PencilRuler,
  Printer,
  Signpost,
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
