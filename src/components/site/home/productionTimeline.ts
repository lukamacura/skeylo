/*
 * Jedan sat za Snimanje → Montažu → Oglase (ServicesReel, Production, studio3d).
 * Sva vremena su u sekundama od početka Snimanja; 3D scena i DOM slojevi čitaju
 * iste brojeve, pa rez u montaži pada tačno kad glava za reprodukciju pređe klip.
 * Ovaj fajl ne uvozi three, da ga Production može učitati odmah.
 */

/** Početak svake faze: Snimanje, Montaža, Oglasi. */
export const PHASE_T = [0, 7.4, 12.8] as const;
export const PHASE_MS = [7400, 5400, 5600] as const;

export const T = {
  /** vrata se otvore, ekipa ulazi */
  door: [0.25, 0.85],
  doorClose: [2.7, 3.6],
  /** rasveta: ključno svetlo, pa kontra i pozadina */
  key: 2.45,
  rim: 2.85,
  /** bum mikrofon iznad kese */
  boom: [3.55, 4.15],
  /** klapa ispred kamere A */
  slateUp: [3.35, 3.6],
  clap: 3.95,
  /** pogled ide iza kamere A, do njenog monitora */
  push: [3.4, 5.6],
  /** od ovog trenutka gledamo kroz kameru A */
  pov: 5.6,
  /** montaža: glava za reprodukciju prelazi timeline */
  play: [8.6, 11.8],
  /** oglasi: isti klip se vrti, rez na svakih 1,4 s */
  reel: 1.4,
} as const;

/** Klipovi na timeline-u (em), isti raspored crta Production. */
export const CLIP_W = [4.6, 3.6, 5.2, 3.4] as const;
export const CLIP_GAP = 0.15;
export const CLIP_PAD = 0.25;
/** unutrašnja širina timeline panela u em (20,4 − 2 × 0,9) */
export const TRACK_W = 18.6;

const CLIP_END = (() => {
  let x = CLIP_PAD;
  return CLIP_W.map((w) => {
    x += w;
    const end = x;
    x += CLIP_GAP;
    return end;
  });
})();

/** Kad glava uđe u klip i (sekunde, apsolutno). */
const CLIP_IN: number[] = [
  T.pov,
  ...CLIP_END.slice(0, -1).map(
    (end) => T.play[0] + (end / TRACK_W) * (T.play[1] - T.play[0]),
  ),
];

/** Koji kadar je na ekranu u trenutku t i koliko traje (tau). */
export function shotAt(t: number): { i: number; tau: number } {
  if (t >= PHASE_T[2]) {
    const k = Math.floor((t - PHASE_T[2]) / T.reel);
    return { i: k % 4, tau: t - PHASE_T[2] - k * T.reel };
  }
  let i = 0;
  for (let k = 1; k < CLIP_IN.length; k++) if (t >= CLIP_IN[k]) i = k;
  return { i, tau: Math.max(0, t - CLIP_IN[i]) };
}
