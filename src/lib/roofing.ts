// Industrijske konstante + matematika za roof estimator.
// Podrazumevane vrednosti rade za većinu US tržišta (TX, FL, OH, AZ...).
// Kad klijent kaže "da", ovde se menjaju njegove realne cene po square-u.

export const SQ_FT_PER_SQUARE = 100;
/** Pokriva nagib krova i otpad od sečenja ivica. */
export const PITCH_WASTE_MULTIPLIER = 1.25;

export type GoalId = "storm" | "age" | "new";
export type MaterialId = "shingles" | "metal" | "tile";

export type Goal = {
  id: GoalId;
  title: string;
  subtitle: string;
  /** Kratka "pravа vrednost" koja se prikazuje čim korisnik izabere. */
  insight: string;
  image: string;
};

export type Material = {
  id: MaterialId;
  name: string;
  tagline: string;
  badge?: string;
  /** Cena po square-u (100 sq ft), instalirano. */
  pricePerSquare: { low: number; high: number };
  lifespanYears: { low: number; high: number };
  perks: string[];
  image: string;
};

export const GOALS: Goal[] = [
  {
    id: "storm",
    title: "Storm or hail damage",
    subtitle: "Missing shingles, dents, leaks after a storm",
    insight:
      "Storm damage is usually covered by homeowner's insurance, so you often pay just your deductible. Most policies require the claim within a year of the storm.",
    image: "/calculator/goal-storm.webp",
  },
  {
    id: "age",
    title: "Roof is aging or leaking",
    subtitle: "20+ years old, curling shingles, granule loss",
    insight:
      "Replacing before leaks spread saves you the drywall, insulation and mold repairs that often add $3,000–$10,000 on top of the roof.",
    image: "/calculator/goal-age.webp",
  },
  {
    id: "new",
    title: "New build or addition",
    subtitle: "Fresh roof on new construction or an extension",
    insight:
      "New-build roofs skip the tear-off and disposal cost of a replacement, so your per-square price tends to land at the low end of the range.",
    image: "/calculator/goal-new.webp",
  },
];

export const SIZE_BUCKETS = [1500, 2500, 3500] as const;
export const SIZE_MIN = 800;
export const SIZE_MAX = 6000;
export const SIZE_STEP = 100;

export const MATERIALS: Material[] = [
  {
    id: "shingles",
    name: "Architectural shingles",
    tagline: "The proven all-rounder",
    badge: "Most popular",
    pricePerSquare: { low: 450, high: 600 },
    lifespanYears: { low: 25, high: 30 },
    perks: ["Best upfront value", "Wide color choice", "Fastest install"],
    image: "/calculator/material-shingles.webp",
  },
  {
    id: "metal",
    name: "Standing seam metal",
    tagline: "Built for the next 50 years",
    badge: "Best longevity",
    pricePerSquare: { low: 1000, high: 1400 },
    lifespanYears: { low: 40, high: 70 },
    perks: ["Hail & wind resistant", "Cuts cooling bills", "Boosts resale"],
    image: "/calculator/material-metal.webp",
  },
  {
    id: "tile",
    name: "Tile or slate",
    tagline: "Premium curb appeal",
    badge: "Premium",
    pricePerSquare: { low: 1200, high: 1800 },
    lifespanYears: { low: 50, high: 100 },
    perks: ["Fire resistant", "Timeless look", "Lifetime material"],
    image: "/calculator/material-tile.webp",
  },
];

export function goalById(id: GoalId): Goal {
  return GOALS.find((g) => g.id === id) ?? GOALS[0];
}
export function materialById(id: MaterialId): Material {
  return MATERIALS.find((m) => m.id === id) ?? MATERIALS[0];
}

/** Squares = (Home sq ft × 1.25) / 100 */
export function squaresFor(homeSqFt: number): number {
  return (homeSqFt * PITCH_WASTE_MULTIPLIER) / SQ_FT_PER_SQUARE;
}

export type Estimate = {
  squares: number;
  roofSqFt: number;
  low: number;
  high: number;
  /** Cena po godini trajanja krova (low cena / high lifespan ... high / low). */
  perYear: { low: number; high: number };
};

export function estimate(homeSqFt: number, materialId: MaterialId): Estimate {
  const m = materialById(materialId);
  const squares = squaresFor(homeSqFt);
  const low = roundTo(squares * m.pricePerSquare.low, 100);
  const high = roundTo(squares * m.pricePerSquare.high, 100);
  return {
    squares: Math.round(squares * 10) / 10,
    roofSqFt: Math.round(homeSqFt * PITCH_WASTE_MULTIPLIER),
    low,
    high,
    perYear: {
      low: Math.round(low / m.lifespanYears.high),
      high: Math.round(high / m.lifespanYears.low),
    },
  };
}

function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step;
}

export const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Šta pomera cenu — prikazuje se na rezultatu da estimate deluje pošteno. */
export const PRICE_FACTORS: { label: string; detail: string }[] = [
  {
    label: "Roof pitch & complexity",
    detail: "Steep slopes, valleys and dormers add labor and safety setup.",
  },
  {
    label: "Layers to tear off",
    detail: "Two or more existing layers mean extra removal and disposal.",
  },
  {
    label: "Decking repairs",
    detail: "Rotted plywood under the old roof is replaced per sheet.",
  },
  {
    label: "Permits & code upgrades",
    detail: "Ice barrier, ventilation and drip edge may be required locally.",
  },
];

/* ------------------------------------------------------------------ */
/*  Kvalifikatori — pitanja koja "free estimate" forma nikad ne postavi  */
/* ------------------------------------------------------------------ */

export type TimelineId = "asap" | "season" | "research";
export type ClaimId = "filed" | "not-yet" | "unsure";

export const TIMELINES: { id: TimelineId; label: string; short: string }[] = [
  { id: "asap", label: "As soon as possible", short: "ASAP" },
  { id: "season", label: "In the next few months", short: "This season" },
  { id: "research", label: "Just researching", short: "Researching" },
];

export const CLAIM_OPTIONS: { id: ClaimId; label: string; short: string }[] = [
  { id: "filed", label: "Yes, claim is filed", short: "Claim filed" },
  { id: "not-yet", label: "Not yet", short: "No claim yet" },
  {
    id: "unsure",
    label: "Not sure if I'm covered",
    short: "Unsure on coverage",
  },
];

export function timelineLabel(id: TimelineId | null | undefined): string {
  return TIMELINES.find((t) => t.id === id)?.short ?? "—";
}
export function claimLabel(id: ClaimId | null | undefined): string {
  return CLAIM_OPTIONS.find((c) => c.id === id)?.short ?? "—";
}

/* ------------------------------------------------------------------ */
/*  Finansiranje — "from $X/mo" umesto "$14,000"                         */
/* ------------------------------------------------------------------ */

/** Tipični uslovi roofing finansiranja (GreenSky / Hearth): 10 god, ~9.99% APR. */
export const FINANCING = { apr: 0.0999, months: 120 };

export function monthlyPayment(
  principal: number,
  { apr, months } = FINANCING,
): number {
  const r = apr / 12;
  const m = (principal * r) / (1 - Math.pow(1 + r, -months));
  return Math.round(m);
}

/* ------------------------------------------------------------------ */
/*  Termini za besplatnu inspekciju — sledeća 3 radna dana, AM / PM     */
/* ------------------------------------------------------------------ */

export type InspectionSlot = {
  /** Stabilan ključ, npr. "2026-09-22-am" — čuva se u leadu. */
  id: string;
  /** "Tue, Sep 22" */
  day: string;
  /** "Morning (8–12)" */
  window: string;
};

export function inspectionSlots(now = new Date(), days = 3): InspectionSlot[] {
  const out: InspectionSlot[] = [];
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  while (out.length < days * 2) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    const day = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    out.push({ id: `${iso}-am`, day, window: "Morning · 8–12" });
    out.push({ id: `${iso}-pm`, day, window: "Afternoon · 12–5" });
  }
  return out;
}

/** "2026-09-22-am" -> "Tue, Sep 22 · Morning (8–12)" — za mejl/SMS vlasniku. */
export function slotLabel(id: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})-(am|pm)$/.exec(id);
  if (!m) return id;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const day = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${day} · ${m[4] === "am" ? "Morning (8–12)" : "Afternoon (12–5)"}`;
}
