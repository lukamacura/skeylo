// Geometrija dijagrama: sve linije se završavaju tačno na ivici elementa.

export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };
export type Side = "top" | "right" | "bottom" | "left";

const round = (n: number) => Math.round(n * 100) / 100;

/** Presek duži centar → cilj sa ivicom elipse. */
export function ellipseEdge(
  center: Point,
  rx: number,
  ry: number,
  toward: Point,
): Point {
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  const t = 1 / Math.hypot(dx / rx, dy / ry);
  return { x: round(center.x + dx * t), y: round(center.y + dy * t) };
}

/** Tačka na ivici elipse na zadatoj visini, sa njene leve ili desne strane. */
export function ellipsePointAtY(
  center: Point,
  rx: number,
  ry: number,
  y: number,
  side: "left" | "right",
): Point {
  const k = Math.sqrt(1 - ((y - center.y) / ry) ** 2);
  return { x: round(center.x + (side === "right" ? rx : -rx) * k), y };
}

/** Tačka na zadatoj stranici pravougaonika; `offset` se meri od levog/gornjeg ugla. */
export function rectPort(rect: Rect, side: Side, offset: number): Point {
  switch (side) {
    case "top":
      return { x: rect.x + offset, y: rect.y };
    case "bottom":
      return { x: rect.x + offset, y: rect.y + rect.h };
    case "left":
      return { x: rect.x, y: rect.y + offset };
    case "right":
      return { x: rect.x + rect.w, y: rect.y + offset };
  }
}

export const linePath = (a: Point, b: Point) => `M${a.x},${a.y} L${b.x},${b.y}`;

/** Prava linija sa jednim blago zaobljenim uglom. */
export function elbowPath(a: Point, corner: Point, b: Point, radius = 16) {
  const toward = (from: Point, to: Point) => {
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const t = Math.min(radius, length / 2) / length;
    return {
      x: round(from.x + (to.x - from.x) * t),
      y: round(from.y + (to.y - from.y) * t),
    };
  };
  const enter = toward(corner, a);
  const leave = toward(corner, b);
  return `M${a.x},${a.y} L${enter.x},${enter.y} Q${corner.x},${corner.y} ${leave.x},${leave.y} L${b.x},${b.y}`;
}

/** Meka S-kriva: napušta prvi element i ulazi u drugi vodoravno. */
export function sCurvePath(a: Point, b: Point) {
  const midX = round((a.x + b.x) / 2);
  return `M${a.x},${a.y} C${midX},${a.y} ${midX},${b.y} ${b.x},${b.y}`;
}

/**
 * Okvir putanje koju crtaju funkcije iznad (samo apsolutne komande M, L, Q, C, H, V).
 * Kontrolne tačke kriva su uključene, pa je okvir uvek dovoljno velik.
 */
export function pathBounds(d: string): Rect {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [, command, args] of d.matchAll(/([MLQCHV])([^MLQCHV]*)/g)) {
    const values = args
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    if (command === "H") xs.push(...values);
    else if (command === "V") ys.push(...values);
    else {
      values.forEach((value, i) => (i % 2 === 0 ? xs : ys).push(value));
    }
  }
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}
