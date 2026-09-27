// src/lib/solar.ts
// Model za "Kalkulator uštede" (solarni paneli, tržište Srbije).
// Sve cene i koeficijenti su na jednom mestu — menjaju se ovde, UI ih samo čita.
// Brojevi su tržišne procene (2026) i služe za informativni obračun, ne za ponudu.

/* ------------------------------------------------------------------ */
/*  Konstante tržišta                                                   */
/* ------------------------------------------------------------------ */

export const EUR_RSD = 117.2;

/** Standardni panel: ~1,13 × 1,76 m, 450 Wp. */
export const PANEL_WP = 450;
export const PANEL_M2 = 2.0;

/** Zakonski limiti za kupca-proizvođača (prozjumera). */
export const LEGAL_CAP_KWP = { fizicko: 10.8, pravno: 150 } as const;

/** Domaćinstva — prosečna cena po zoni, sa PDV-om, akcizom i naknadama,
 *  ponderisano viša/niža tarifa. Odnos zona je 1 : 1,5 : 3. */
export const HOUSEHOLD_TIERS = [
  { upTo: 350, price: 9.8, name: "zelena" },
  { upTo: 1600, price: 14.7, name: "plava" },
  { upTo: Infinity, price: 29.4, name: "crvena" },
] as const;

/** Fiksni deo računa (obračunska snaga, trošak snabdevača) — solar ga ne umanjuje. */
export const HOUSEHOLD_FIXED_RSD = 650;

/** Privreda — prosečna ukupna cena po kWh, bez PDV-a (komercijalno snabdevanje). */
export const BUSINESS_PRICE_RSD = 18.5;

/** Neto merenje: na energiju vraćenu iz mreže i dalje se plaćaju mrežarina i
 *  naknade, pa "bankovani" kWh vredi manje od direktno potrošenog. */
export const BANKED_KWH_VALUE = 0.8;

/** Neto obračun (firme): višak se prodaje snabdevaču po nižoj ceni. */
export const EXPORT_VALUE = 0.45;

export const PRICE_GROWTH = 0.05; // godišnji rast cene struje
export const DEGRADATION = 0.005; // godišnji pad proizvodnje panela
export const OPEX_SHARE = 0.01; // održavanje + rezerva za inverter, % investicije godišnje
export const LIFETIME_YEARS = 25;
export const CO2_KG_PER_KWH = 0.7; // mreža Srbije je pretežno na uglju

/* ------------------------------------------------------------------ */
/*  Opcije kviza                                                        */
/* ------------------------------------------------------------------ */

export type CustomerType = "fizicko" | "pravno";
export type RoofType = "kos" | "ravan";
export type OrientationId = "jug" | "jugoistok" | "istok-zapad" | "sever";
export type UsageId = "danju" | "ravnomerno" | "uvece";
export type RegionId =
  | "vojvodina"
  | "beograd"
  | "zapad"
  | "sumadija"
  | "istok"
  | "jug";
export type ExtraId = "baterija" | "auto" | "pumpa";
export type BillUnit = "rsd" | "kwh";

export const REGIONS: {
  id: RegionId;
  label: string;
  cities: string;
  /** Godišnji prinos, kWh po instaliranom kWp. */
  yield: number;
}[] = [
  {
    id: "vojvodina",
    label: "Vojvodina",
    cities: "Novi Sad, Subotica, Zrenjanin",
    yield: 1220,
  },
  {
    id: "beograd",
    label: "Beograd",
    cities: "Beograd sa okolinom",
    yield: 1260,
  },
  {
    id: "zapad",
    label: "Zapadna Srbija",
    cities: "Užice, Valjevo, Šabac",
    yield: 1240,
  },
  {
    id: "sumadija",
    label: "Šumadija",
    cities: "Kragujevac, Kraljevo, Čačak",
    yield: 1280,
  },
  {
    id: "istok",
    label: "Istočna Srbija",
    cities: "Bor, Zaječar, Požarevac",
    yield: 1300,
  },
  {
    id: "jug",
    label: "Južna Srbija",
    cities: "Niš, Leskovac, Vranje",
    yield: 1350,
  },
];

export const ORIENTATIONS: {
  id: OrientationId;
  label: string;
  factor: number;
  /** Koliki deo kosog krova je upotrebljiv za panele. */
  usable: number;
}[] = [
  { id: "jug", label: "Jug", factor: 1, usable: 0.45 },
  { id: "jugoistok", label: "JI / JZ", factor: 0.95, usable: 0.45 },
  { id: "istok-zapad", label: "Istok–zapad", factor: 0.86, usable: 0.7 },
  { id: "sever", label: "Sever", factor: 0.65, usable: 0.45 },
];

/** Ravan krov: paneli se okreću ka jugu, ali redovi traže razmak zbog senke. */
export const FLAT_USABLE = 0.5;
export const FLAT_COST_FACTOR = 1.06; // potkonstrukcija i balast

export const USAGES: {
  id: UsageId;
  label: string;
  hint: string;
  /** Udeo proizvodnje koji se potroši odmah, bez mreže. */
  self: { fizicko: number; pravno: number };
}[] = [
  {
    id: "danju",
    label: "Tokom dana",
    hint: "Rad od kuće, radno vreme firme, klime",
    self: { fizicko: 0.45, pravno: 0.75 },
  },
  {
    id: "ravnomerno",
    label: "Ravnomerno",
    hint: "Potrošnja je slična danju i noću",
    self: { fizicko: 0.32, pravno: 0.55 },
  },
  {
    id: "uvece",
    label: "Uveče i noću",
    hint: "Preko dana uglavnom nema nikoga",
    self: { fizicko: 0.22, pravno: 0.3 },
  },
];

export const EXTRAS: {
  id: ExtraId;
  label: string;
  hint: string;
  /** Dodatna godišnja potrošnja koju sistem treba da pokrije. */
  addKwh: number;
}[] = [
  {
    id: "baterija",
    label: "Baterija",
    hint: "Čuva dnevni višak za veče",
    addKwh: 0,
  },
  {
    id: "auto",
    label: "Električni auto",
    hint: "Punjenje kod kuće, ~2.500 kWh godišnje",
    addKwh: 2500,
  },
  {
    id: "pumpa",
    label: "Toplotna pumpa",
    hint: "Grejanje na struju, ~3.500 kWh godišnje",
    addKwh: 3500,
  },
];

export const BATTERY_SELF_BONUS = { fizicko: 0.3, pravno: 0.2 } as const;
export const BATTERY_EUR_PER_KWH = { fizicko: 480, pravno: 400 } as const;

/** Raspon ulaza. Račun ide do velikih iznosa jer isti klizač služi i firmama. */
export const BILL_RANGE = {
  rsd: { min: 2000, max: 400000 },
  kwh: { min: 100, max: 20000 },
} as const;

export const AREA_RANGE = {
  fizicko: { min: 40, max: 400, step: 5 },
  pravno: { min: 100, max: 5000, step: 50 },
} as const;

/* ------------------------------------------------------------------ */
/*  Ulaz / izlaz                                                        */
/* ------------------------------------------------------------------ */

export interface SolarInput {
  billUnit: BillUnit;
  /** Mesečni iznos u jedinici billUnit. */
  billValue: number;
  type: CustomerType;
  area: number;
  floors: 1 | 2 | 3;
  roof: RoofType;
  orientation: OrientationId;
  region: RegionId;
  usage: UsageId;
  extras: ExtraId[];
  /** 0–0.5, udeo investicije koji pokriva subvencija. */
  subsidy: number;
}

export interface SolarResult {
  monthlyKwh: number;
  monthlyBill: number;
  annualKwh: number;
  panels: number;
  kwp: number;
  /** Šta je ograničilo veličinu sistema. */
  limitedBy: "potrosnja" | "krov" | "zakon";
  roofPanelsMax: number;
  productionKwh: number;
  coverage: number;
  selfShare: number;
  batteryKwh: number;
  investment: number;
  investmentAfterSubsidy: number;
  newMonthlyBill: number;
  monthlySaving: number;
  annualSaving: number;
  /** Godine do isplate; null ako se ne isplati u životnom veku. */
  paybackYears: number | null;
  /** Kumulativni novčani tok, indeks = godina (0 = investicija). */
  cashflow: number[];
  lifetimeProfit: number;
  co2Tons: number;
  viable: boolean;
}

/* ------------------------------------------------------------------ */
/*  Račun ↔ kWh                                                         */
/* ------------------------------------------------------------------ */

function householdBill(kwh: number): number {
  let rest = Math.max(0, kwh);
  let from = 0;
  let sum = HOUSEHOLD_FIXED_RSD;
  for (const tier of HOUSEHOLD_TIERS) {
    const span = Math.min(rest, tier.upTo - from);
    sum += span * tier.price;
    rest -= span;
    from = tier.upTo;
    if (rest <= 0) break;
  }
  return sum;
}

export function billFromKwh(kwh: number, type: CustomerType): number {
  return type === "fizicko"
    ? householdBill(kwh)
    : Math.max(0, kwh) * BUSINESS_PRICE_RSD;
}

export function kwhFromBill(rsd: number, type: CustomerType): number {
  if (type === "pravno") return Math.max(0, rsd) / BUSINESS_PRICE_RSD;
  let rest = Math.max(0, rsd - HOUSEHOLD_FIXED_RSD);
  let from = 0;
  let kwh = 0;
  for (const tier of HOUSEHOLD_TIERS) {
    const span = tier.upTo - from;
    const cost = span * tier.price;
    if (rest <= cost) return kwh + rest / tier.price;
    kwh += span;
    rest -= cost;
    from = tier.upTo;
  }
  return kwh;
}

/** Cena "ključ u ruke" po kWp, pada sa veličinom sistema. Domaćinstva sa PDV-om. */
function eurPerKwp(kwp: number, type: CustomerType): number {
  const points: [number, number][] =
    type === "fizicko"
      ? [
          [2, 1150],
          [5, 1020],
          [10.8, 900],
        ]
      : [
          [5, 900],
          [30, 760],
          [100, 670],
          [150, 630],
        ];
  if (kwp <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x0, y0] = points[i - 1];
    if (kwp <= x1) return y0 + ((kwp - x0) / (x1 - x0)) * (y1 - y0);
  }
  return points[points.length - 1][1];
}

/* ------------------------------------------------------------------ */
/*  Glavni obračun                                                      */
/* ------------------------------------------------------------------ */

export function calculate(input: SolarInput): SolarResult {
  const { type } = input;
  const region = REGIONS.find((r) => r.id === input.region) ?? REGIONS[1];
  const orientation =
    ORIENTATIONS.find((o) => o.id === input.orientation) ?? ORIENTATIONS[0];
  const usage = USAGES.find((u) => u.id === input.usage) ?? USAGES[1];
  const hasBattery = input.extras.includes("baterija");

  const baseMonthlyKwh =
    input.billUnit === "kwh"
      ? input.billValue
      : kwhFromBill(input.billValue, type);
  const extraKwh = EXTRAS.filter((e) => input.extras.includes(e.id)).reduce(
    (s, e) => s + e.addKwh,
    0,
  );
  const monthlyKwh = baseMonthlyKwh + extraKwh / 12;
  const annualKwh = monthlyKwh * 12;
  const monthlyBill = billFromKwh(monthlyKwh, type);

  const flat = input.roof === "ravan";
  const yieldPerKwp = region.yield * (flat ? 1 : orientation.factor);

  let selfShare = usage.self[type];
  if (hasBattery) selfShare += BATTERY_SELF_BONUS[type];
  selfShare = Math.min(0.9, selfShare);

  // Domaćinstvo (neto merenje) cilja punu godišnju potrošnju. Firma (neto
  // obračun) se dimenzioniše bliže sopstvenoj dnevnoj potrošnji jer je višak jeftin.
  const targetShare =
    type === "fizicko" ? 1 : Math.min(1, 0.35 + selfShare * 0.75);
  const targetPanels = Math.ceil(
    (annualKwh * targetShare) / yieldPerKwp / (PANEL_WP / 1000),
  );

  const footprint = input.area / input.floors;
  const usable = footprint * (flat ? FLAT_USABLE : orientation.usable);
  const roofPanelsMax = Math.max(0, Math.floor(usable / PANEL_M2));
  const legalPanelsMax = Math.floor(
    (LEGAL_CAP_KWP[type] * 1000) / PANEL_WP + 1e-9,
  );

  const panels = Math.max(
    0,
    Math.min(targetPanels, roofPanelsMax, legalPanelsMax),
  );
  const limitedBy: SolarResult["limitedBy"] =
    panels === targetPanels
      ? "potrosnja"
      : roofPanelsMax <= legalPanelsMax
        ? "krov"
        : "zakon";

  const kwp = (panels * PANEL_WP) / 1000;
  const productionKwh = kwp * yieldPerKwp;
  const batteryKwh = hasBattery
    ? type === "fizicko"
      ? Math.min(15, Math.max(5, Math.round(kwp)))
      : Math.max(10, Math.round(kwp * 0.5))
    : 0;

  const investment =
    (kwp * eurPerKwp(kwp, type) * (flat ? FLAT_COST_FACTOR : 1) +
      batteryKwh * BATTERY_EUR_PER_KWH[type]) *
    EUR_RSD;
  const investmentAfterSubsidy = investment * (1 - input.subsidy);

  /** Ušteda u prvoj godini za datu proizvodnju, po današnjim cenama. */
  const savingFor = (production: number): number => {
    const direct = Math.min(production * selfShare, annualKwh);
    const surplus = production - direct;
    if (type === "fizicko") {
      // Višak preko godišnje potrošnje propada (poravnanje 1. aprila).
      const banked = Math.min(surplus, annualKwh - direct);
      const offsetMonthly = (direct + banked * BANKED_KWH_VALUE) / 12;
      return (monthlyBill - householdBill(monthlyKwh - offsetMonthly)) * 12;
    }
    return (
      direct * BUSINESS_PRICE_RSD + surplus * BUSINESS_PRICE_RSD * EXPORT_VALUE
    );
  };

  const annualSaving = savingFor(productionKwh);
  const monthlySaving = annualSaving / 12;

  const cashflow = [-investmentAfterSubsidy];
  let paybackYears: number | null = null;
  for (let y = 1; y <= LIFETIME_YEARS; y++) {
    const yearSaving =
      savingFor(productionKwh * Math.pow(1 - DEGRADATION, y - 1)) *
      Math.pow(1 + PRICE_GROWTH, y - 1);
    const net = yearSaving - investment * OPEX_SHARE;
    const prev = cashflow[y - 1];
    const next = prev + net;
    if (paybackYears === null && prev < 0 && next >= 0) {
      paybackYears = y - 1 + -prev / net;
    }
    cashflow.push(next);
  }
  if (investmentAfterSubsidy <= 0 && panels > 0) paybackYears = 0;

  return {
    monthlyKwh,
    monthlyBill,
    annualKwh,
    panels,
    kwp,
    limitedBy,
    roofPanelsMax,
    productionKwh,
    coverage: annualKwh > 0 ? Math.min(1, productionKwh / annualKwh) : 0,
    selfShare,
    batteryKwh,
    investment,
    investmentAfterSubsidy,
    newMonthlyBill: Math.max(0, monthlyBill - monthlySaving),
    monthlySaving,
    annualSaving,
    paybackYears,
    cashflow,
    lifetimeProfit: cashflow[LIFETIME_YEARS],
    co2Tons: (productionKwh * CO2_KG_PER_KWH * LIFETIME_YEARS) / 1000,
    viable: panels >= 3 && paybackYears !== null,
  };
}

/* ------------------------------------------------------------------ */
/*  Formatiranje (ručno, da server i klijent uvek daju isti string)     */
/* ------------------------------------------------------------------ */

export function num(n: number, decimals = 0): string {
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, dec] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${n < 0 ? "−" : ""}${grouped}${dec ? `,${dec}` : ""}`;
}

export function rsd(n: number): string {
  return `${num(Math.round(n))} RSD`;
}

/** Zaokružuje velike iznose da procena ne deluje lažno precizno. */
export function rsdRound(n: number): string {
  const abs = Math.abs(n);
  const step = abs >= 1_000_000 ? 10_000 : abs >= 100_000 ? 1_000 : 100;
  return rsd(Math.round(n / step) * step);
}

export function eur(n: number): string {
  const v = n / EUR_RSD;
  const step = v >= 10_000 ? 100 : 10;
  return `${num(Math.round(v / step) * step)} €`;
}
