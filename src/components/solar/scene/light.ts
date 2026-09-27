import { useEffect, useState } from "react";
import { useMotionValueEvent, useSpring } from "framer-motion";
import { lerp, tri } from "./geometry";

/* ------------------------------------------------------------------ */
/*  Svetlo i opruge                                                     */
/*  Doba dana t: 0 = dan, 0,5 = zalazak, 1 = noć. Sve boje se računaju  */
/*  iz t, pa prelaz dan/noć nema nijedan "skok".                        */
/* ------------------------------------------------------------------ */

/* Kritično prigušene opruge: bez odskakanja, samo meko usporavanje. */
export const SPRING = { stiffness: 90, damping: 20, mass: 1 };
export const SKY_SPRING = { stiffness: 26, damping: 13, mass: 1 };

/**
 * Vrednost na opruzi, zaokružena na korak. Komponenta se ponovo crta tek kad
 * vrednost pređe korak, pa dugi rep opruge (pomeraji ispod piksela) ne košta ništa.
 */
export function useSprung(
  target: number,
  still: boolean,
  config: { stiffness: number; damping: number; mass: number } = SPRING,
  quantum = 0,
) {
  const mv = useSpring(target, config);
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (still) mv.jump(target);
    else mv.set(target);
  }, [mv, target, still]);
  useMotionValueEvent(mv, "change", (v) =>
    setValue(quantum ? Math.round(v / quantum) * quantum : v),
  );
  return value;
}

export type RGB = [number, number, number];
const parsed = new Map<string, RGB>();
export function rgb(hex: string): RGB {
  let v = parsed.get(hex);
  if (!v) {
    const n = parseInt(hex.slice(1), 16);
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    parsed.set(hex, v);
  }
  return v;
}
export const mixRgb = (a: RGB, b: RGB, t: number): RGB => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
export const css = (c: RGB) =>
  `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
/** Boja koja sama prelazi dan → zalazak → noć. */
export const tri3 = (day: string, dusk: string, night: string, t: number) =>
  css(
    t < 0.5
      ? mixRgb(rgb(day), rgb(dusk), t * 2)
      : mixRgb(rgb(dusk), rgb(night), (t - 0.5) * 2),
  );

/** Ista boja, ali providna (za gradijente koji se gube u nebu). */
export const tri3a = (
  day: string,
  dusk: string,
  night: string,
  t: number,
  alpha: number,
) =>
  tri3(day, dusk, night, t).replace("rgb(", "rgba(").replace(")", `,${alpha})`);

/** Koliko svetla pada na površine: pun dan, topao zalazak, plava noć. */
export function ambient(t: number): RGB {
  return [tri(1, 0.88, 0.25, t), tri(1, 0.68, 0.3, t), tri(1, 0.62, 0.45, t)];
}

/* ------------------------------ Kadar ------------------------------ */

/** Sve što nebo i tok energije treba da znaju o kadru, u pikselima. */
export interface Frame {
  w: number;
  h: number;
  zoom: number;
  /** Razmera neba: zavisi od veličine kartice, ne od zuma kamere. */
  ks: number;
  /** Visina zaglavlja preko scene. */
  top: number;
  /** y linije tla i y horizonta (ivice zemljišta). */
  ground: number;
  land: number;
}

/** Gde je sunce, u pikselima kadra. */
export function sunAt(f: Frame, t: number, sunLevel: number) {
  const high = f.top + 50 * f.ks;
  const scale = f.ks * lerp(0.85, 1.18, sunLevel) * tri(1, 1.25, 1.25, t);
  // danju sunce stoji iznad brda, ma koliko kamera bila blizu
  const day = Math.min(
    lerp(high, f.ground, 0.1),
    f.land - 100 * f.zoom - 34 * scale,
  );
  return {
    x: f.w * tri(0.8, 0.83, 0.83, t),
    y: tri(
      Math.max(day, f.top + 30 * scale),
      f.land - 112 * f.zoom,
      f.ground + 110 * f.ks,
      t,
    ),
    scale,
  };
}
