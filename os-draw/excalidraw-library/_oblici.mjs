/* Zajednički stil svih ikonica. Boja, debljina i hrapavost se menjaju samo ovde.
   Ikonica se crta u kvadratu 80×80 i od nativnih je elemenata Excalidraw-a, pa korisnik
   može da joj menja boju, veličinu i delove. */
export const INK = "#1e1e1e";
export const ACCENT = "#dd7522";
export const ROUGHNESS = 1;
export const STROKE = 2;

/* oblici; opcije: fill (akcentna boja), ink (crna ispuna), accent (akcentna linija), round */
const base = (type, o) => ({
  type,
  strokeColor: o.accent ? ACCENT : INK,
  backgroundColor: o.fill ? ACCENT : o.ink ? INK : "transparent",
  angle: o.angle || 0,
  roundness: o.round ? { type: 3 } : null,
});

export const R = (x, y, width, height, o = {}) => ({
  ...base("rectangle", o),
  x,
  y,
  width,
  height,
});

export const E = (x, y, width, height, o = {}) => ({
  ...base("ellipse", o),
  x,
  y,
  width,
  height,
});

export const C = (cx, cy, r, o = {}) => E(cx - r, cy - r, r * 2, r * 2, o);

function poly(points, o, smooth, closed) {
  const [x0, y0] = points[0];
  const pts = points.map(([x, y]) => [x - x0, y - y0]);
  if (closed) pts.push([0, 0]);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return {
    ...base("line", o),
    x: x0,
    y: y0,
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
    points: pts,
    roundness: smooth ? { type: 2 } : null,
    startArrowhead: null,
    endArrowhead: o.arrow ? "arrow" : null,
    ...(o.arrow ? { type: "arrow" } : null),
  };
}

/* L = izlomljena linija, S = zaobljena linija, P = zatvoren mnogougao, B = zatvorena kriva */
export const L = (points, o = {}) => poly(points, o, false, false);
export const S = (points, o = {}) => poly(points, o, true, false);
export const P = (points, o = {}) => poly(points, o, false, true);
export const B = (points, o = {}) => poly(points, o, true, true);

/* tačke na luku (uglovi u stepenima, 0 = desno, ide u smeru kazaljke) */
export function arc(cx, cy, r, from, to, n = 8) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = ((from + ((to - from) * i) / n) * Math.PI) / 180;
    out.push([
      Math.round((cx + r * Math.cos(a)) * 10) / 10,
      Math.round((cy + r * Math.sin(a)) * 10) / 10,
    ]);
  }
  return out;
}

const hash = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++)
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

/* isti ulaz daje iste elemente, pa ikonica izgleda isto pri svakom buildu */
export function element(iconId, i, shape) {
  const seed = (hash(iconId + ":" + i) % 2000000000) + 1;
  return {
    id: `sk-${iconId}-${i}`,
    fillStyle: "solid",
    strokeWidth: STROKE,
    strokeStyle: "solid",
    roughness: ROUGHNESS,
    opacity: 100,
    groupIds: [`sk-g-${iconId}`],
    frameId: null,
    seed,
    version: 1,
    versionNonce: seed,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    ...shape,
  };
}
