/* ------------------------------------------------------------------ */
/*  Kalkulator bazena: okvirna procena investicije                      */
/*                                                                      */
/*  Namerno vraća RASPON, ne tačnu cenu: konačna cena zavisi od sastava */
/*  zemljišta, iskopa i pristupa terenu, što se vidi tek na izlasku.    */
/*  Cene su okvirne za Srbiju (armirano-betonski bazen, ključ u ruke,   */
/*  bez PDV-a), 2026.                                                   */
/* ------------------------------------------------------------------ */

export type PoolType = "skimer" | "preliv" | "unutrasnji";
export type CoverId = "nema" | "termo" | "roletna";
export type LightId = "nema" | "bela" | "rgb";
export type AttractionId = "hidromasaza" | "protivstrujno";
export type PhaseId = "spreman" | "izgradnja" | "planiram";
export type AccessId = "da" | "ne" | "nesiguran";

export interface PoolInput {
  type: PoolType;
  /** Dužina i širina u metrima, dubina u metrima. */
  length: number;
  width: number;
  depth: number;
  heat: boolean;
  salt: boolean;
  cover: CoverId;
  attractions: AttractionId[];
  light: LightId;
  city: string;
  phase: PhaseId;
  access: AccessId;
}

export const POOL_TYPES: {
  id: PoolType;
  label: string;
  hint: string;
  tag?: string;
}[] = [
  {
    id: "skimer",
    label: "Skimerski bazen",
    hint: "Klasičan: voda je 10–15 cm ispod ivice.",
    tag: "Najčešći izbor",
  },
  {
    id: "preliv",
    label: "Prelivni bazen",
    hint: "Luksuzan: voda u ravni sa plažom, preliva se u kanal.",
  },
  {
    id: "unutrasnji",
    label: "Unutrašnji / Wellness",
    hint: "U sklopu kuće ili objekta, kupanje cele godine.",
  },
];

export const SIZE_PRESETS = [
  {
    id: "6x3",
    length: 6,
    width: 3,
    label: "6 × 3 m",
    hint: "Kompaktan, za manja dvorišta",
  },
  {
    id: "8x4",
    length: 8,
    width: 4,
    label: "8 × 4 m",
    hint: "Zlatni standard za porodične kuće",
  },
  {
    id: "10x5",
    length: 10,
    width: 5,
    label: "10 × 5 m",
    hint: "Veći objekti, vile za izdavanje",
  },
] as const;

export const LENGTH_RANGE = { min: 4, max: 16, step: 0.5 };
export const WIDTH_RANGE = { min: 2, max: 8, step: 0.5 };
export const DEPTH_RANGE = { min: 1, max: 2.2, step: 0.1 };
export const STANDARD_DEPTH = 1.5;

export const COVERS: { id: CoverId; label: string; hint: string }[] = [
  { id: "nema", label: "Bez prekrivke", hint: "" },
  {
    id: "termo",
    label: "Termo solarni prekrivač",
    hint: "Čuva toplotu i smanjuje isparavanje.",
  },
  {
    id: "roletna",
    label: "Automatska podvodna roletna",
    hint: "Jednim dugmetom, skrivena ispod vode.",
  },
];

export const ATTRACTIONS: { id: AttractionId; label: string; hint: string }[] =
  [
    {
      id: "hidromasaza",
      label: "Hidromasažni mlazevi",
      hint: "Mlaznice u zidu za masažu leđa.",
    },
    {
      id: "protivstrujno",
      label: "Turbo jet protivstrujno plivanje",
      hint: "Plivate u mestu, kao u velikom bazenu.",
    },
  ];

export const LIGHTS: { id: LightId; label: string }[] = [
  { id: "nema", label: "Bez" },
  { id: "bela", label: "Bela LED" },
  { id: "rgb", label: "RGB LED" },
];

export const PHASES: { id: PhaseId; label: string; hint: string }[] = [
  {
    id: "spreman",
    label: "Imam spreman iskop / projekat",
    hint: "Možemo odmah na teren.",
  },
  {
    id: "izgradnja",
    label: "Kuća je u izgradnji",
    hint: "Planiram bazen u narednih 3–6 meseci.",
  },
  {
    id: "planiram",
    label: "Tek planiram",
    hint: "Informišem se o okvirnim troškovima.",
  },
];

export const ACCESS: { id: AccessId; label: string }[] = [
  { id: "da", label: "Da" },
  { id: "ne", label: "Ne" },
  { id: "nesiguran", label: "Nisam siguran" },
];

/* ------------------------------ Obračun ----------------------------- */

export interface PoolResult {
  area: number;
  volume: number;
  perimeter: number;
  /** Delovi investicije, srednja vrednost u evrima. */
  construction: number;
  filtration: number;
  equipment: number;
  mid: number;
  low: number;
  high: number;
  lights: number;
  season: string;
  seasonMonths: number;
  weeks: [number, number];
}

const round500 = (v: number) => Math.round(v / 500) * 500;

export function calculate(i: PoolInput): PoolResult {
  const area = i.length * i.width;
  const perimeter = 2 * (i.length + i.width);
  const volume = area * i.depth;

  // Školjka: iskop i odvoz zemlje po m², armirani beton, hidroizolacija i
  // završna obloga po m² unutrašnje površine (dno + zidovi).
  const shellArea = area + perimeter * i.depth;
  let construction = shellArea * 150 + area * 35;
  if (i.type === "preliv") {
    // deblji zidovi u ravni vode, prelivni kanal sa rešetkom, kompenzacioni rezervoar
    construction = construction * 1.15 + perimeter * 140 + 1600;
  }
  if (i.type === "unutrasnji") construction *= 1.1;
  // Bez pristupa mehanizaciji: ručni iskop, mini bager, pumpa za beton.
  if (i.access === "ne") construction *= 1.12;

  const filtration = 2600 + volume * 25;

  let equipment = 0;
  if (i.type === "unutrasnji") equipment += 3800; // odvlaživanje i ventilacija hale
  if (i.heat) {
    const hp = volume <= 40 ? 2300 : volume <= 70 ? 3200 : 4400;
    equipment += i.type === "unutrasnji" ? hp * 0.8 : hp;
  }
  if (i.salt) equipment += volume <= 50 ? 1300 : 1900;
  if (i.cover === "termo") equipment += area * 12 + 450;
  if (i.cover === "roletna") equipment += area * 300 + 1800;
  if (i.attractions.includes("hidromasaza")) equipment += 1700;
  if (i.attractions.includes("protivstrujno")) equipment += 2600;
  const lights = i.light === "nema" ? 0 : lightCount(i.length);
  if (i.light === "bela") equipment += lights * 260;
  if (i.light === "rgb") equipment += lights * 380 + 150;

  const mid = construction + filtration + equipment;
  const low = round500(mid * 0.88);
  const high = round500(mid * 1.14 * (i.access === "nesiguran" ? 1.05 : 1));

  const [season, seasonMonths] =
    i.type === "unutrasnji"
      ? i.heat
        ? ["cele godine", 12]
        : ["maj – septembar", 5]
      : i.heat
        ? ["april – oktobar", 7]
        : ["jun – avgust", 3];

  const base: [number, number] =
    i.type === "skimer" ? [6, 8] : i.type === "preliv" ? [8, 10] : [10, 14];
  const extra = i.access === "ne" ? 2 : 0;

  return {
    area,
    volume,
    perimeter,
    construction,
    filtration,
    equipment,
    mid,
    low,
    high,
    lights,
    season: season as string,
    seasonMonths: seasonMonths as number,
    weeks: [base[0] + extra, base[1] + extra],
  };
}

export function lightCount(length: number) {
  return length <= 7 ? 2 : length <= 10 ? 3 : 4;
}

/* ------------------------------ Format ------------------------------ */

export function num(n: number, decimals = 0): string {
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, dec] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${n < 0 ? "−" : ""}${grouped}${dec ? `,${dec}` : ""}`;
}

/** 1,5 → "1,5"; 8 → "8" */
export function meters(n: number) {
  const r = Math.round(n * 10) / 10;
  return num(r, Number.isInteger(r) ? 0 : 1);
}

export const eur = (n: number) => `${num(Math.round(n))}\u00a0€`;
