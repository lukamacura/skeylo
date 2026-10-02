// src/lib/solar-us.ts
// Model za američku verziju "Kalkulatora uštede" (Teksas, Florida, Arizona).
// Ista logika kao src/lib/solar.ts, ali sa američkim merama: USD, sq ft,
// tarife i pravila za višak struje po saveznoj državi, cene po vatu (2026).
// Brojevi su tržišne procene i služe za informativni obračun, ne za ponudu.
//
// Interni ID-jevi (fizicko/pravno, kos/ravan, baterija/auto/pumpa...) ostaju
// isti kao u srpskom modelu da bi HouseScene radio bez izmena.

import type {
  CustomerType,
  ExtraId,
  OrientationId,
  RoofType,
  UsageId,
} from "./solar";

export type { CustomerType, ExtraId, OrientationId, RoofType, UsageId };

/* ------------------------------------------------------------------ */
/*  Konstante tržišta                                                   */
/* ------------------------------------------------------------------ */

/** Standardni rezidencijalni panel u SAD 2026: ~410 W, ~21,5 sq ft. */
export const PANEL_W = 410;
export const PANEL_SQFT = 21.5;
export const SQFT_PER_M2 = 10.7639;

/** Praktični limit za brzu interkonekciju (nije zakon, već pravilo utility-ja). */
export const SIZE_CAP_KW = { fizicko: 20, pravno: 250 } as const;

export const PRICE_GROWTH = 0.03; // godišnji rast cene struje (konzervativno)
export const DEGRADATION = 0.005; // godišnji pad proizvodnje panela
export const OPEX_SHARE = 0.01; // održavanje + rezerva za inverter, % investicije
export const LIFETIME_YEARS = 25;

/** Savezni ITC za firme (Section 48E). Za domaćinstva (25D) ukinut posle 2025. */
export const BUSINESS_ITC = 0.3;

export type StateId = "TX" | "FL" | "AZ";

export const STATES: Record<
  StateId,
  {
    name: string;
    /** Prosečna cena struje, $/kWh, sve naknade uključene. */
    price: { fizicko: number; pravno: number };
    /** Fiksni mesečni deo računa (customer/base charge) — solar ga ne umanjuje. */
    fixed: { fizicko: number; pravno: number };
    /** Vrednost izvezenog kWh (do visine godišnje potrošnje), kao udeo cene. */
    exportValue: { fizicko: number; pravno: number };
    /** Vrednost viška preko godišnje potrošnje (avoided cost), kao udeo cene. */
    excessValue: number;
    /** Puno neto merenje: sistem se dimenzioniše na 100% potrošnje. */
    netMetering: boolean;
    /** Množilac na nacionalnu cenu instalacije. */
    costFactor: number;
    /** Državni poreski kredit za domaćinstva: udeo i gornja granica. */
    stateCredit: { share: number; max: number };
    /** Emisija mreže, lb CO₂ po MWh. */
    co2LbPerMwh: number;
    /** Kratko objašnjenje pravila za višak, za UI. */
    exportNote: string;
  }
> = {
  TX: {
    name: "Texas",
    price: { fizicko: 0.155, pravno: 0.095 },
    fixed: { fizicko: 12, pravno: 45 },
    exportValue: { fizicko: 0.4, pravno: 0.35 },
    excessValue: 0.3,
    netMetering: false,
    costFactor: 0.96,
    stateCredit: { share: 0, max: 0 },
    co2LbPerMwh: 830,
    exportNote:
      "Texas has no statewide net metering. Your retail plan sets the buyback rate, so solar pays off best when you use it as it's produced.",
  },
  FL: {
    name: "Florida",
    price: { fizicko: 0.15, pravno: 0.115 },
    fixed: { fizicko: 10, pravno: 30 },
    exportValue: { fizicko: 1, pravno: 1 },
    excessValue: 0.2,
    netMetering: true,
    costFactor: 0.97,
    stateCredit: { share: 0, max: 0 },
    co2LbPerMwh: 840,
    exportNote:
      "Florida has full retail net metering: every kWh you send to the grid offsets one you buy later. Leftover credit is paid out once a year at a lower rate.",
  },
  AZ: {
    name: "Arizona",
    price: { fizicko: 0.155, pravno: 0.12 },
    fixed: { fizicko: 15, pravno: 40 },
    exportValue: { fizicko: 0.42, pravno: 0.4 },
    excessValue: 0.42,
    netMetering: false,
    costFactor: 0.92,
    stateCredit: { share: 0.25, max: 1000 },
    co2LbPerMwh: 760,
    exportNote:
      "Arizona uses net billing: power you export is credited at the utility's export rate, well below retail. Homeowners also get a state tax credit of up to $1,000.",
  },
};

/* ------------------------------------------------------------------ */
/*  Opcije kviza                                                        */
/* ------------------------------------------------------------------ */

export type RegionId =
  | "dfw"
  | "houston"
  | "central-tx"
  | "west-tx"
  | "north-fl"
  | "central-fl"
  | "south-fl"
  | "phoenix"
  | "south-az"
  | "north-az";

export type BillUnit = "usd" | "kwh";

export const REGIONS: {
  id: RegionId;
  state: StateId;
  label: string;
  cities: string;
  /** Godišnji prinos, kWh po instaliranom kW (DC). */
  yield: number;
}[] = [
  {
    id: "dfw",
    state: "TX",
    label: "Dallas–Fort Worth",
    cities: "Dallas, Fort Worth, Plano",
    yield: 1470,
  },
  {
    id: "houston",
    state: "TX",
    label: "Houston & Gulf Coast",
    cities: "Houston, Beaumont, Corpus Christi",
    yield: 1400,
  },
  {
    id: "central-tx",
    state: "TX",
    label: "Central Texas",
    cities: "Austin, San Antonio, Waco",
    yield: 1490,
  },
  {
    id: "west-tx",
    state: "TX",
    label: "West Texas",
    cities: "El Paso, Midland, Lubbock",
    yield: 1720,
  },
  {
    id: "north-fl",
    state: "FL",
    label: "North Florida",
    cities: "Jacksonville, Tallahassee, Pensacola",
    yield: 1420,
  },
  {
    id: "central-fl",
    state: "FL",
    label: "Central Florida",
    cities: "Orlando, Tampa, St. Petersburg",
    yield: 1460,
  },
  {
    id: "south-fl",
    state: "FL",
    label: "South Florida",
    cities: "Miami, Fort Lauderdale, Naples",
    yield: 1470,
  },
  {
    id: "phoenix",
    state: "AZ",
    label: "Phoenix Metro",
    cities: "Phoenix, Mesa, Scottsdale",
    yield: 1720,
  },
  {
    id: "south-az",
    state: "AZ",
    label: "Southern Arizona",
    cities: "Tucson, Yuma, Sierra Vista",
    yield: 1760,
  },
  {
    id: "north-az",
    state: "AZ",
    label: "Northern Arizona",
    cities: "Flagstaff, Prescott, Sedona",
    yield: 1640,
  },
];

export const YIELD_RANGE = { min: 1400, max: 1760 } as const;

export const ORIENTATIONS: {
  id: OrientationId;
  label: string;
  factor: number;
  /** Koliki deo kosog krova je upotrebljiv (uz požarne odstupe od ivica). */
  usable: number;
}[] = [
  { id: "jug", label: "South", factor: 1, usable: 0.42 },
  { id: "jugoistok", label: "SE / SW", factor: 0.96, usable: 0.42 },
  { id: "istok-zapad", label: "East–West", factor: 0.87, usable: 0.65 },
  { id: "sever", label: "North", factor: 0.7, usable: 0.42 },
];

/** Ravan krov: paneli ka jugu, redovi traže razmak zbog senke. */
export const FLAT_USABLE = 0.5;
export const FLAT_COST_FACTOR = 1.06; // nosači i balast

export const USAGES: {
  id: UsageId;
  label: string;
  hint: string;
  /** Udeo proizvodnje koji se potroši odmah, bez mreže. */
  self: { fizicko: number; pravno: number };
}[] = [
  {
    id: "danju",
    label: "During the day",
    hint: "Working from home, business hours, AC running all afternoon",
    self: { fizicko: 0.5, pravno: 0.75 },
  },
  {
    id: "ravnomerno",
    label: "Evenly",
    hint: "About the same day and night",
    self: { fizicko: 0.35, pravno: 0.55 },
  },
  {
    id: "uvece",
    label: "Evenings and nights",
    hint: "Nobody's home during the day",
    self: { fizicko: 0.25, pravno: 0.3 },
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
    label: "Home battery",
    hint: "Stores daytime surplus for the evening and outages",
    addKwh: 0,
  },
  {
    id: "auto",
    label: "Electric vehicle",
    hint: "Charging at home, ~3,500 kWh a year",
    addKwh: 3500,
  },
  {
    id: "pumpa",
    label: "Pool pump",
    hint: "Runs most of the day, ~2,500 kWh a year",
    addKwh: 2500,
  },
];

export const BATTERY_SELF_BONUS = { fizicko: 0.3, pravno: 0.2 } as const;
/** Instalirana cena baterije, $/kWh. */
export const BATTERY_USD_PER_KWH = { fizicko: 1050, pravno: 850 } as const;
/** Kućna baterija dolazi u modulima od 13,5 kWh. */
export const BATTERY_UNIT_KWH = 13.5;

/** Raspon ulaza. Račun ide do velikih iznosa jer isti klizač služi i firmama. */
export const BILL_RANGE = {
  usd: { min: 40, max: 40000 },
  kwh: { min: 200, max: 300000 },
} as const;

/** Kvadratura u sq ft. */
export const AREA_RANGE = {
  fizicko: { min: 600, max: 5000, step: 50 },
  pravno: { min: 1000, max: 50000, step: 500 },
} as const;

/* ------------------------------------------------------------------ */
/*  Ulaz / izlaz                                                        */
/* ------------------------------------------------------------------ */

export interface SolarInput {
  billUnit: BillUnit;
  /** Mesečni iznos u jedinici billUnit. */
  billValue: number;
  type: CustomerType;
  /** Površina objekta u sq ft. */
  area: number;
  floors: 1 | 2 | 3;
  roof: RoofType;
  orientation: OrientationId;
  region: RegionId;
  usage: UsageId;
  extras: ExtraId[];
  /** 0–0.5, udeo investicije koji pokrivaju poreski krediti i rebate-ovi. */
  subsidy: number;
}

export interface SolarResult {
  monthlyKwh: number;
  monthlyBill: number;
  annualKwh: number;
  panels: number;
  kw: number;
  limitedBy: "potrosnja" | "krov" | "limit";
  roofPanelsMax: number;
  productionKwh: number;
  coverage: number;
  selfShare: number;
  batteryKwh: number;
  /** Bruto cena, pre podsticaja. */
  investment: number;
  /** Državni poreski kredit (Arizona), u dolarima. */
  stateCredit: number;
  investmentAfterSubsidy: number;
  /** Bruto $/W, kako se u SAD porede ponude. */
  pricePerWatt: number;
  newMonthlyBill: number;
  monthlySaving: number;
  annualSaving: number;
  paybackYears: number | null;
  cashflow: number[];
  lifetimeProfit: number;
  /** Kratke tone (2.000 lb). */
  co2Tons: number;
  viable: boolean;
}

export function regionOf(id: RegionId) {
  return REGIONS.find((r) => r.id === id) ?? REGIONS[0];
}

/* ------------------------------------------------------------------ */
/*  Račun ↔ kWh (ravna tarifa + fiksni deo)                             */
/* ------------------------------------------------------------------ */

export function billFromKwh(
  kwh: number,
  type: CustomerType,
  state: StateId,
): number {
  const s = STATES[state];
  return s.fixed[type] + Math.max(0, kwh) * s.price[type];
}

export function kwhFromBill(
  usd: number,
  type: CustomerType,
  state: StateId,
): number {
  const s = STATES[state];
  return Math.max(0, usd - s.fixed[type]) / s.price[type];
}

/** Cena "ključ u ruke" po vatu, pada sa veličinom sistema. */
function usdPerWatt(kw: number, type: CustomerType): number {
  const points: [number, number][] =
    type === "fizicko"
      ? [
          [3, 3.3],
          [6, 2.9],
          [10, 2.7],
          [20, 2.5],
        ]
      : [
          [10, 2.4],
          [50, 2.0],
          [100, 1.8],
          [250, 1.6],
        ];
  if (kw <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x0, y0] = points[i - 1];
    if (kw <= x1) return y0 + ((kw - x0) / (x1 - x0)) * (y1 - y0);
  }
  return points[points.length - 1][1];
}

/* ------------------------------------------------------------------ */
/*  Glavni obračun                                                      */
/* ------------------------------------------------------------------ */

export function calculate(input: SolarInput): SolarResult {
  const { type } = input;
  const region = regionOf(input.region);
  const state = STATES[region.state];
  const price = state.price[type];
  const orientation =
    ORIENTATIONS.find((o) => o.id === input.orientation) ?? ORIENTATIONS[0];
  const usage = USAGES.find((u) => u.id === input.usage) ?? USAGES[1];
  const hasBattery = input.extras.includes("baterija");

  const baseMonthlyKwh =
    input.billUnit === "kwh"
      ? input.billValue
      : kwhFromBill(input.billValue, type, region.state);
  const extraKwh = EXTRAS.filter((e) => input.extras.includes(e.id)).reduce(
    (s, e) => s + e.addKwh,
    0,
  );
  const monthlyKwh = baseMonthlyKwh + extraKwh / 12;
  const annualKwh = monthlyKwh * 12;
  const monthlyBill = billFromKwh(monthlyKwh, type, region.state);

  const flat = input.roof === "ravan";
  const yieldPerKw = region.yield * (flat ? 1 : orientation.factor);

  let selfShare = usage.self[type];
  if (hasBattery) selfShare += BATTERY_SELF_BONUS[type];
  selfShare = Math.min(0.9, selfShare);

  // Domaćinstva se u SAD standardno dimenzionišu na ~100% potrošnje. Firma
  // bez neto merenja cilja bliže sopstvenoj dnevnoj potrošnji jer je višak jeftin.
  const targetShare =
    type === "fizicko" || state.netMetering
      ? 1
      : Math.min(1, 0.35 + selfShare * 0.75);
  const targetPanels = Math.ceil(
    (annualKwh * targetShare) / yieldPerKw / (PANEL_W / 1000),
  );

  const footprint = input.area / input.floors;
  const usable = footprint * (flat ? FLAT_USABLE : orientation.usable);
  const roofPanelsMax = Math.max(0, Math.floor(usable / PANEL_SQFT));
  const capPanelsMax = Math.floor((SIZE_CAP_KW[type] * 1000) / PANEL_W + 1e-9);

  const panels = Math.max(
    0,
    Math.min(targetPanels, roofPanelsMax, capPanelsMax),
  );
  const limitedBy: SolarResult["limitedBy"] =
    panels === targetPanels
      ? "potrosnja"
      : roofPanelsMax <= capPanelsMax
        ? "krov"
        : "limit";

  const kw = (panels * PANEL_W) / 1000;
  const productionKwh = kw * yieldPerKw;
  const batteryKwh = hasBattery
    ? type === "fizicko"
      ? kw > 12
        ? BATTERY_UNIT_KWH * 2
        : BATTERY_UNIT_KWH
      : Math.max(20, Math.round(kw * 0.5))
    : 0;

  const pricePerWatt =
    usdPerWatt(kw, type) * state.costFactor * (flat ? FLAT_COST_FACTOR : 1);
  const investment =
    kw * 1000 * pricePerWatt + batteryKwh * BATTERY_USD_PER_KWH[type];
  const stateCredit =
    type === "fizicko" && panels > 0
      ? Math.min(state.stateCredit.max, investment * state.stateCredit.share)
      : 0;
  const investmentAfterSubsidy = Math.max(
    0,
    investment * (1 - input.subsidy) - stateCredit,
  );

  /** Ušteda u prvoj godini za datu proizvodnju, po današnjim cenama. */
  const savingFor = (production: number): number => {
    const direct = Math.min(production * selfShare, annualKwh);
    const exported = production - direct;
    const credited = Math.min(exported, annualKwh - direct);
    const excess = exported - credited;
    return (
      (direct +
        credited * state.exportValue[type] +
        excess * state.excessValue) *
      price
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
    kw,
    limitedBy,
    roofPanelsMax,
    productionKwh,
    coverage: annualKwh > 0 ? Math.min(1, productionKwh / annualKwh) : 0,
    selfShare,
    batteryKwh,
    investment,
    stateCredit,
    investmentAfterSubsidy,
    pricePerWatt,
    newMonthlyBill: Math.max(0, monthlyBill - monthlySaving),
    monthlySaving,
    annualSaving,
    paybackYears,
    cashflow,
    lifetimeProfit: cashflow[LIFETIME_YEARS],
    co2Tons: (productionKwh * LIFETIME_YEARS * state.co2LbPerMwh) / 1000 / 2000,
    viable: panels >= 3 && paybackYears !== null,
  };
}

/* ------------------------------------------------------------------ */
/*  Formatiranje (ručno, da server i klijent uvek daju isti string)     */
/* ------------------------------------------------------------------ */

export function num(n: number, decimals = 0): string {
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, dec] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${n < 0 ? "−" : ""}${grouped}${dec ? `.${dec}` : ""}`;
}

export function usd(n: number): string {
  return `${n < 0 ? "−" : ""}$${num(Math.abs(Math.round(n)))}`;
}

/** Zaokružuje velike iznose da procena ne deluje lažno precizno. */
export function usdRound(n: number): string {
  const abs = Math.abs(n);
  const step =
    abs >= 100_000 ? 1_000 : abs >= 10_000 ? 100 : abs >= 1_000 ? 10 : 1;
  return usd(Math.round(n / step) * step);
}

/** "$1.2M" / "$350K" — kratko, za ose i oznake. */
export function shortUsd(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 1_000_000) {
    const v = abs / 1_000_000;
    return `${sign}$${num(v, v >= 10 ? 0 : 1)}M`;
  }
  if (abs >= 1_000) return `${sign}$${num(Math.round(abs / 1_000))}K`;
  return `${sign}$${num(Math.round(abs))}`;
}
