import type { CustomerType, RoofType } from "@/lib/solar";

/* ------------------------------------------------------------------ */
/*  Geometrija scene                                                    */
/*                                                                      */
/*  Fasada leži u ravni slike, pa se crta bez izobličenja. Sve iznad    */
/*  strehe (krov, atika, paneli, dimnjak) prolazi kroz JEDNU kameru:    */
/*  stoji ispred sredine objekta, iznad strehe, i gleda pravo. Zato se  */
/*  sve ivice koje idu u dubinu seku u istoj tački nedogleda, a redovi  */
/*  se smanjuju tačno koliko treba. Nijedan ugao nije nacrtan "od oka". */
/* ------------------------------------------------------------------ */

/** Tlo i sredina objekta, u jedinicama crteža. */
export const G = 372;
export const CX = 352;
/** Sokl (podnožje zida). */
export const PLINTH = 8;
/** Dubina zemljišta iza objekta: horizont je iznad temelja jer kadar gleda blago odozgo. */
export const LAND = 42;

/** Kamera: visina oka iznad strehe i udaljenost od fasade. */
export const EYE = 200;
export const DIST = 500;

export type Pt = [number, number];

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const smooth = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
/** Tri ključne vrednosti: dan, zalazak, noć. */
export const tri = (day: number, dusk: number, night: number, t: number) =>
  t < 0.5 ? lerp(day, dusk, t * 2) : lerp(dusk, night, (t - 0.5) * 2);

/* ------------------------------ Mere ------------------------------- */

export interface Dims {
  w: number;
  wallH: number;
  /** Dubina objekta, od fasade do zadnjeg zida. */
  depth: number;
  /** Visina slemena iznad strehe; 0 = ravan krov. */
  ridge: number;
  /** Koliko se krov suzi do slemena sa svake strane (četvorovodni krov). */
  hip: number;
}

const RAD = Math.PI / 180;
/** Nagib crepa i nagib lima na hali. */
const HOUSE_PITCH = 35 * RAD;
const HALL_PITCH = 20 * RAD;
const HIP = 0.42;

export function targetDims(
  type: CustomerType,
  area: number,
  floors: number,
  roof: RoofType,
): Dims {
  const footprint = area / floors;
  const pitched = roof === "kos";
  if (type === "fizicko") {
    const t = clamp01((Math.sqrt(footprint) - 4.5) / (20 - 4.5));
    // dužina krovne ravni uz nagib; iz nje slede dubina kuće i visina slemena
    const len = lerp(96, 112, t);
    return {
      w: lerp(172, 330, t),
      wallH: 70 + (floors - 1) * 58,
      depth: 2 * len * Math.cos(HOUSE_PITCH),
      ridge: pitched ? len * Math.sin(HOUSE_PITCH) : 0,
      hip: pitched ? len * HIP : 0,
    };
  }
  const t = clamp01((Math.sqrt(footprint) - 7) / (71 - 7));
  const depth = lerp(186, 204, t);
  return {
    w: lerp(244, 400, t),
    wallH: 92 + (floors - 1) * 50,
    depth,
    ridge: pitched ? (depth / 2) * Math.tan(HALL_PITCH) : 0,
    hip: 0,
  };
}

/* ------------------------------ Krov ------------------------------- */

export interface Roof {
  wallTop: number;
  /** Polovina širine na strehi. */
  half: number;
  depth: number;
  /** 1 = kos, 0 = ravan; vodi pretapanje crepa u ravnu ploču. */
  pitch: number;
  /** Dužina prednje krovne ravni, od strehe do slemena (ili zadnje ivice). */
  len: number;
  /** Jedinični pravac uz krov: koliko ide u dubinu, koliko uvis. */
  ez: number;
  eh: number;
  hip: number;
  /** Na ekranu: visina krova, y slemena i polovina širine slemena. */
  rise: number;
  top: number;
  topHalf: number;
}

export function roofShape(d: Dims, wallTop: number): Roof {
  const pitch = smooth(0, 26, d.ridge);
  // ravan krov vidimo ceo; kod kosog prednja ravan ide samo do slemena
  const run = lerp(d.depth, d.depth / 2, pitch);
  const len = Math.hypot(run, d.ridge);
  const r: Roof = {
    wallTop,
    half: d.w / 2 + 12 * pitch,
    depth: d.depth,
    pitch,
    len,
    ez: run / len,
    eh: d.ridge / len,
    hip: d.hip,
    rise: 0,
    top: 0,
    topHalf: 0,
  };
  const [x, y] = onRoof(r, r.half - r.hip, len);
  r.top = y;
  r.rise = wallTop - y;
  r.topHalf = x - CX;
  return r;
}

/** Tačka u prostoru → tačka na crtežu. x od sredine, h iznad strehe, z iza fasade. */
export function project(r: Roof, x: number, h: number, z: number): Pt {
  const s = DIST / (DIST + z);
  return [CX + x * s, r.wallTop - EYE * (1 - s) - h * s];
}

/** Tačka na prednjoj krovnoj ravni: u popreko, v uz krov, lift iznad pokrivača. */
export function onRoof(r: Roof, u: number, v: number, lift = 0): Pt {
  return project(r, u, v * r.eh + lift * r.ez, v * r.ez - lift * r.eh);
}

/** Polovina širine krovne ravni na visini v (grebeni je sužavaju). */
export const halfAt = (r: Roof, v: number) =>
  r.half - r.hip * clamp01(v / r.len);

/* ------------------------------ Paneli ----------------------------- */
/*  Raspored (koja mesta su zauzeta) zavisi samo od ciljnih mera i      */
/*  broja panela, pa se tokom animacije ne menja. Položaj svakog mesta  */
/*  računa se iz trenutnih mera, pa paneli klize zajedno sa krovom.     */
/*  Mesta se pune uvek istim redom: dodavanje panela nikad ne pomera    */
/*  postojeće.                                                          */

export const P_GAP = 1.6;
/** Odnos širine i dužine panela (uspravno postavljen). */
const P_RATIO = 0.62;
const PITCHED_ROWS = 3;
/** Razmak od strehe i od slemena. */
const M_EAVE = 6;
const M_RIDGE = 7;
/** Ravan krov: razmak od atike spreda i pozadi, nagib i širina panela. */
const M_FRONT = 18;
const M_BACK = 8;
const TILT = 18 * RAD;
const F_W = 19;
const F_LIFT = 2;

export interface Slot {
  key: string;
  flat: boolean;
  row: number;
  /** Kolona od sredine: 0 je prva desno, -1 prva levo. */
  k: number;
  /** Redosled popunjavanja; vodi kašnjenje pri ulasku. */
  order: number;
}

interface Grid {
  rows: number;
  stepX: number;
  /** Donja ivica reda i dužina panela uz krov. */
  v0: (row: number) => number;
  pl: number;
  pw: number;
}

function grid(r: Roof, flat: boolean, rows: number): Grid {
  if (flat) {
    const pitchV = (r.len - M_FRONT - M_BACK) / rows;
    return {
      rows,
      stepX: F_W + P_GAP,
      v0: (row) => M_FRONT + row * pitchV,
      pl: Math.min(28, pitchV * 0.62),
      pw: F_W,
    };
  }
  const pl = (r.len - M_EAVE - M_RIDGE - (rows - 1) * P_GAP) / rows;
  return {
    rows,
    stepX: pl * P_RATIO + P_GAP,
    v0: (row) => M_EAVE + row * (pl + P_GAP),
    pl,
    pw: pl * P_RATIO,
  };
}

export const rowsFor = (flat: boolean, business: boolean) =>
  flat ? (business ? 4 : 3) : PITCHED_ROWS;

/**
 * Koja mesta zauzima n panela na krovu ciljnih mera.
 * Kos krov: dva reda rastu zajedno od sredine, treći se otvara tek kad se
 * oni popune, pa niz prati liniju grebena. Ravan krov: red po red, od prednjeg.
 */
export function layoutPanels(
  n: number,
  target: Roof,
  flat: boolean,
  rows: number,
): Slot[] {
  const g = grid(target, flat, rows);
  const cand: { row: number; j: number; p: number }[] = [];
  for (let row = 0; row < rows; row++) {
    const vTop = g.v0(row) + (flat ? g.pl * Math.cos(TILT) : g.pl);
    const room = halfAt(target, vTop) - (flat ? 8 : 5) + P_GAP / 2;
    const perSide = Math.max(0, Math.floor(room / g.stepX));
    const penalty = flat ? row * 1000 : [0, 1, 4.5][row];
    for (let j = 0; j < perSide; j++) cand.push({ row, j, p: j + penalty });
  }
  cand.sort((a, b) => a.p - b.p || a.row - b.row);
  const slots: Slot[] = [];
  for (const c of cand) {
    for (const k of [-1 - c.j, c.j]) {
      if (slots.length >= n) return slots;
      slots.push({
        key: `${flat ? "f" : "p"}${c.row}:${k}`,
        flat,
        row: c.row,
        k,
        order: slots.length,
      });
    }
  }
  return slots;
}

/** Četiri ugla panela na crtežu: gore levo, gore desno, dole desno, dole levo. */
export function slotQuad(r: Roof, s: Slot, rows: number): [Pt, Pt, Pt, Pt] {
  const g = grid(r, s.flat, rows);
  const u0 = s.k * g.stepX + P_GAP / 2;
  const u1 = u0 + g.pw;
  const vb = g.v0(s.row);
  if (s.flat) {
    // panel na nosaču: donja ivica uz krov, gornja podignuta ka suncu
    const vt = vb + g.pl * Math.cos(TILT);
    const lt = F_LIFT + g.pl * Math.sin(TILT);
    return [
      onRoof(r, u0, vt, lt),
      onRoof(r, u1, vt, lt),
      onRoof(r, u1, vb, F_LIFT),
      onRoof(r, u0, vb, F_LIFT),
    ];
  }
  const vt = vb + g.pl;
  return [
    onRoof(r, u0, vt, 1),
    onRoof(r, u1, vt, 1),
    onRoof(r, u1, vb, 1),
    onRoof(r, u0, vb, 1),
  ];
}

/** Tačka unutar četvorougla: a popreko (0 levo, 1 desno), b naniže (0 gore, 1 dole). */
export function inQuad(q: [Pt, Pt, Pt, Pt], a: number, b: number): Pt {
  const [tl, tr, br, bl] = q;
  const tx = lerp(tl[0], tr[0], a);
  const ty = lerp(tl[1], tr[1], a);
  const bx = lerp(bl[0], br[0], a);
  const by = lerp(bl[1], br[1], a);
  return [lerp(tx, bx, b), lerp(ty, by, b)];
}

export const poly = (pts: Pt[]) =>
  pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");

export const pathOf = (pts: Pt[]) =>
  `M${pts.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join("L")}Z`;
