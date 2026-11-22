/*
 * Podaci za interaktivni primer operativnog sistema na početnoj.
 * Sve je izmišljeno ("Tvoja firma"), nisu podaci nijednog klijenta.
 */
import {
  BookOpen,
  FileText,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type ModuleId =
  | "pregled"
  | "upiti"
  | "zadaci"
  | "fakture"
  | "finansije"
  | "baza";

export const MODULES: { id: ModuleId; name: string; Icon: LucideIcon }[] = [
  { id: "pregled", name: "Pregled", Icon: LayoutDashboard },
  { id: "upiti", name: "Upiti", Icon: Inbox },
  { id: "zadaci", name: "Zadaci", Icon: ListChecks },
  { id: "fakture", name: "Fakture", Icon: FileText },
  { id: "finansije", name: "Finansije", Icon: Wallet },
  { id: "baza", name: "Baza znanja", Icon: BookOpen },
];

/** Poslednjih 12 meseci, prihod i troškovi u RSD. Poslednji je tekući. */
export const MONTHS = [
  { short: "dec", name: "Decembar 2025", rev: 612000, cost: 268000 },
  { short: "jan", name: "Januar 2026", rev: 688000, cost: 281000 },
  { short: "feb", name: "Februar 2026", rev: 640000, cost: 274000 },
  { short: "mar", name: "Mart 2026", rev: 734000, cost: 296000 },
  { short: "apr", name: "April 2026", rev: 702000, cost: 289000 },
  { short: "maj", name: "Maj 2026", rev: 826000, cost: 318000 },
  { short: "jun", name: "Jun 2026", rev: 790000, cost: 311000 },
  { short: "jul", name: "Jul 2026", rev: 905000, cost: 342000 },
  { short: "avg", name: "Avgust 2026", rev: 868000, cost: 336000 },
  { short: "sep", name: "Septembar 2026", rev: 1012000, cost: 371000 },
  { short: "okt", name: "Oktobar 2026", rev: 1146000, cost: 402000 },
  { short: "nov", name: "Novembar 2026", rev: 1284000, cost: 431000 },
];

export const STAGES = ["Novo", "Pozvan", "Ponuda", "Dobijen"] as const;

export type Lead = {
  id: number;
  name: string;
  ask: string;
  src: "Sajt" | "Instagram" | "Telefon";
  when: string;
  stage: number;
};

export const LEADS: Lead[] = [
  {
    id: 1,
    name: "Marko P.",
    ask: "Traži ponudu",
    src: "Sajt",
    when: "09:30",
    stage: 0,
  },
  {
    id: 2,
    name: "Ivana S.",
    ask: "Zakazuje termin",
    src: "Instagram",
    when: "08:55",
    stage: 0,
  },
  {
    id: 3,
    name: "Dragan M.",
    ask: "Pita za cenu",
    src: "Sajt",
    when: "juče",
    stage: 0,
  },
  {
    id: 4,
    name: "Kafe Centar",
    ask: "Mesečno održavanje",
    src: "Telefon",
    when: "juče",
    stage: 2,
  },
  {
    id: 5,
    name: "Studio Lux",
    ask: "Paket za 2 lokala",
    src: "Instagram",
    when: "pon",
    stage: 3,
  },
];

export type Task = {
  id: number;
  title: string;
  who: string;
  due: "danas" | "sutra" | "petak" | "juče";
  done: boolean;
};

export const TASKS: Task[] = [
  {
    id: 1,
    title: "Pozvati Marka P. oko ponude",
    who: "MA",
    due: "danas",
    done: false,
  },
  {
    id: 2,
    title: "Poslati fakturu Kafe Centru",
    who: "JE",
    due: "danas",
    done: false,
  },
  {
    id: 3,
    title: "Naručiti materijal za sledeću nedelju",
    who: "NI",
    due: "sutra",
    done: false,
  },
  {
    id: 4,
    title: "Potpisati ugovor sa Studio Lux",
    who: "MA",
    due: "petak",
    done: false,
  },
  {
    id: 5,
    title: "Objaviti novu kreativu",
    who: "SK",
    due: "danas",
    done: true,
  },
  { id: 6, title: "Ažurirati cenovnik", who: "JE", due: "juče", done: true },
];

export type InvoiceState = "paid" | "wait" | "late";

export type Invoice = {
  no: string;
  who: string;
  amount: number;
  state: InvoiceState;
  due: string;
  reminded?: boolean;
};

export const INVOICES: Invoice[] = [
  {
    no: "#216",
    who: "Studio Lux",
    amount: 120000,
    state: "wait",
    due: "za 5 dana",
  },
  {
    no: "#215",
    who: "Kafe Centar",
    amount: 54000,
    state: "wait",
    due: "za 2 dana",
  },
  {
    no: "#214",
    who: "Petrović d.o.o.",
    amount: 96000,
    state: "paid",
    due: "danas",
  },
  {
    no: "#213",
    who: "Marković",
    amount: 48000,
    state: "late",
    due: "kasni 6 dana",
  },
  {
    no: "#212",
    who: "Hotel Sunce",
    amount: 210000,
    state: "paid",
    due: "12. nov",
  },
];

export const DOCS = [
  { title: "Cenovnik 2026", tag: "Cene", when: "danas" },
  { title: "Kako pravimo ponudu", tag: "Prodaja", when: "pre 3 dana" },
  { title: "Procedura za reklamacije", tag: "Podrška", when: "pre 6 dana" },
  { title: "Onboarding novog radnika", tag: "Tim", when: "pre 2 nedelje" },
  { title: "Šablon ugovora o saradnji", tag: "Pravno", when: "pre mesec dana" },
  { title: "Uputstvo za kasu", tag: "Operativa", when: "pre 2 meseca" },
];

export const rsd = (v: number) => Math.round(v).toLocaleString("de-DE");
