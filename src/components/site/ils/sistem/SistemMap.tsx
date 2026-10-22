"use client";

/* Informacioni sistem Infinity Laser Studija (/ils/sistem, u CRM-u sekcija
   "Informacioni sistem"). Pregled: Infinity je u sredini petlje Kanali →
   Sajt → Studio → Novac → Kanali, a Tim i Sadržaj je hrane spolja. Po svakoj
   vezi stalno teče struja, a udar prolazi kroz sistem redom kojim ide posao.
   Klik na deo: kamera zumira i otkriva entitete i njihove veze. Klik na
   entitet: panel sa detaljima. Sadržaj je u ./data.ts. */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import Image from "next/image";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarCheck,
  CalendarDays,
  Globe,
  HandCoins,
  Instagram,
  LayoutDashboard,
  Megaphone,
  PenLine,
  PiggyBank,
  Receipt,
  Scissors,
  Sparkles,
  Star,
  TrendingUp,
  Upload,
  UserRound,
  Video,
  Wallet,
  X,
  Zap,
  ZoomIn,
  type LucideIcon,
} from "lucide-react";
import {
  BG,
  GoogleLogo,
  IVORY,
  LINE,
  MetaLogo,
  MUTED,
  ROSE,
  ROSE_SOFT,
  SERIF,
  SURFACE,
  SURFACE_2,
} from "../ads/primitives";
import {
  FLOWS,
  PEOPLE,
  SEG,
  SEGMENTS,
  STATUS,
  entityOf,
  linksOf,
  refOf,
  triggerCount,
  type Entity,
  type Flow,
  type IconName,
  type Link,
  type PersonId,
  type SegId,
  type Segment,
  type Status,
} from "./data";
import "./sistem.css";

const AMBER = STATUS.novo.color;

/* Svaki deo sistema ima svoju boju; struja nosi dve (telo i sjaj), pa je
   udar dvobojan, a varnice na dolasku mešaju obe. */
const SEG_COLOR: Record<SegId, [string, string]> = {
  tim: ["#6fd3ff", "#b794ff"],
  sadrzaj: ["#b794ff", "#ff6fae"],
  kanali: ["#ff6fae", "#ffb36b"],
  sajt: ["#4fe0c8", "#6fd3ff"],
  studio: ["#ffa76b", "#ff6fae"],
  novac: ["#3ddc84", "#e3f56b"],
};
const FLOW_COLOR: Record<Flow["kind"], [string, string]> = {
  sadrzaj: ["#b794ff", "#6fd3ff"],
  ljudi: ["#ff6fae", "#ffb36b"],
  novac: ["#3ddc84", "#e3f56b"],
};
const TRIG: [string, string] = [AMBER, "#ff7a59"];
const RAINBOW = `conic-gradient(from 0deg, ${SEGMENTS.map((x) => SEG_COLOR[x.id][0]).join(", ")}, ${SEG_COLOR[SEGMENTS[0].id][0]})`;
const FLOW_NAME: Record<Flow["kind"], string> = {
  sadrzaj: "sadržaj",
  ljudi: "klijenti",
  novac: "novac",
};

/* kamera: kritično prigušena opruga, kreće od trenutnog položaja */
const CAM = { type: "spring", bounce: 0, visualDuration: 0.55 } as const;
const SHEET = { type: "spring", bounce: 0, visualDuration: 0.35 } as const;
const EASE = [0.2, 0.7, 0.3, 1] as const;

const ICONS: Record<IconName, LucideIcon> = {
  instagram: Instagram,
  star: Star,
  building: Building2,
  globe: Globe,
  "calendar-check": CalendarCheck,
  "calendar-days": CalendarDays,
  wallet: Wallet,
  dashboard: LayoutDashboard,
  sparkles: Sparkles,
  face: UserRound,
  pen: PenLine,
  video: Video,
  scissors: Scissors,
  upload: Upload,
  trending: TrendingUp,
  receipt: Receipt,
  megaphone: Megaphone,
  coins: HandCoins,
  piggy: PiggyBank,
};

const ZAP_D =
  "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/* ------------------------------------------------------------------ */
/* Geometrija                                                          */
/* ------------------------------------------------------------------ */

type Rect = { x: number; y: number; w: number; h: number };
type Pt = [number, number];

const cx = (r: Rect) => r.x + r.w / 2;
const cy = (r: Rect) => r.y + r.h / 2;

function bez(p: Pt[], t: number): Pt {
  const u = 1 - t;
  const a = u * u * u,
    b = 3 * u * u * t,
    c = 3 * u * t * t,
    d = t * t * t;
  return [
    a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0],
    a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1],
  ];
}
const dOf = (p: Pt[]) =>
  `M${p[0][0]},${p[0][1]} C${p[1][0]},${p[1][1]} ${p[2][0]},${p[2][1]} ${p[3][0]},${p[3][1]}`;
const angOf = (a: Pt, b: Pt) =>
  (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;

/* kriva između dve kartice: iz bočne strane u bočnu ("x") ili odozgo/odozdo ("y") */
function curve(a: Rect, b: Rect, side: "x" | "y"): Pt[] {
  if (side === "x") {
    const dir = cx(b) >= cx(a) ? 1 : -1;
    const p0: Pt = [dir > 0 ? a.x + a.w : a.x, cy(a)];
    const p3: Pt = [dir > 0 ? b.x : b.x + b.w, cy(b)];
    const k = Math.max(10, Math.abs(p3[0] - p0[0]) * 0.5);
    return [p0, [p0[0] + dir * k, p0[1]], [p3[0] - dir * k, p3[1]], p3];
  }
  const dir = cy(b) >= cy(a) ? 1 : -1;
  const p0: Pt = [cx(a), dir > 0 ? a.y + a.h : a.y];
  const p3: Pt = [cx(b), dir > 0 ? b.y : b.y + b.h];
  const k = Math.max(10, Math.abs(p3[1] - p0[1]) * 0.5);
  return [p0, [p0[0], p0[1] + dir * k], [p3[0], p3[1] - dir * k], p3];
}

/* lomljena linija sa zaobljenim uglovima kroz zadate tačke */
function ortho(pts: Pt[], rad = 12) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1],
      [x, y] = pts[i],
      [nx, ny] = pts[i + 1];
    const r1 = Math.min(rad, Math.hypot(x - px, y - py) / 2),
      r2 = Math.min(rad, Math.hypot(nx - x, ny - y) / 2);
    d += ` L${x - Math.sign(x - px) * r1},${y - Math.sign(y - py) * r1}`;
    d += ` Q${x},${y} ${x + Math.sign(nx - x) * r2},${y + Math.sign(ny - y) * r2}`;
  }
  const e = pts[pts.length - 1];
  return `${d} L${e[0]},${e[1]}`;
}

/* položaj kartice u grafu: offset* ne vidi transform roditelja (ulazna animacija) */
function offsetIn(el: HTMLElement, root: HTMLElement): Rect {
  let x = 0,
    y = 0,
    n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/* ------------------------------------------------------------------ */
/* Struja: stalni tok + udar koji putuje vezom i pali karticu na kraju */
/* ------------------------------------------------------------------ */

type Wire = {
  id: string;
  d: string;
  color: string;
  /* druga boja: sjaj udara, druga polovina tačkica, varnice */
  alt: string;
  from: string;
  to: string;
  /* u kom taktu ciklusa udar kreće ovom vezom */
  slot: number;
  a: Pt;
  b: Pt;
  /* smer veze na kraju, za strelicu */
  ang: number;
  trig?: boolean;
};

/* varnice na dolasku: lepeza unazad od kartice, uglovi u odnosu na vezu */
const SPARKS = [-80, -48, -16, 16, 48, 80];

/* rep udara u tri sloja: širok sjaj, telo u boji veze i belo jezgro */
const LAYERS: [string, number][] = [
  ["halo", 60],
  ["body", 32],
  ["core", 12],
];

function WireG({ w, lit, draw }: { w: Wire; lit: boolean; draw: number }) {
  return (
    <g
      data-w={w.id}
      style={{ opacity: lit ? 1 : 0.16, transition: "opacity 0.3s" }}
    >
      <motion.path
        d={w.d}
        fill="none"
        stroke={w.color}
        strokeOpacity={w.trig ? 0.26 : 0.36}
        strokeWidth={1.4}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.55, delay: draw, ease: "easeOut" }}
      />
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: draw + 0.4 }}
      >
        {[w.color, w.alt].map((c, k) => (
          <path
            key={k}
            className={`sys-march${w.trig ? " trig" : ""}${k ? " alt" : ""}`}
            d={w.d}
            fill="none"
            stroke={c}
            strokeOpacity={0.85}
            strokeWidth={w.trig ? 1.5 : 2.2}
            strokeLinecap={w.trig ? "butt" : "round"}
          />
        ))}
        <circle cx={w.a[0]} cy={w.a[1]} r={2.5} fill={w.color} />
        <path
          d="M-6.5,-4 L0,0 L-6.5,4"
          fill="none"
          stroke={w.color}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`translate(${w.b[0]} ${w.b[1]}) rotate(${w.ang})`}
        />
      </motion.g>
      <path
        data-l="halo"
        d={w.d}
        fill="none"
        stroke={w.alt}
        strokeOpacity={0.3}
        strokeWidth={10}
        strokeLinecap="round"
        style={{ opacity: 0 }}
      />
      <path
        data-l="body"
        d={w.d}
        fill="none"
        stroke={w.color}
        strokeWidth={2.8}
        strokeLinecap="round"
        style={{ opacity: 0 }}
      />
      <path
        data-l="core"
        d={w.d}
        fill="none"
        stroke="#fff"
        strokeWidth={1.3}
        strokeLinecap="round"
        style={{ opacity: 0 }}
      />
      <circle
        data-l="ping"
        cx={w.b[0]}
        cy={w.b[1]}
        r={3}
        fill="none"
        stroke={w.alt}
        strokeWidth={1.6}
        style={{ opacity: 0 }}
      />
      {SPARKS.map((_, j) => (
        <circle
          key={j}
          data-l="spark"
          cx={w.b[0]}
          cy={w.b[1]}
          r={2}
          fill={j % 2 ? w.alt : w.color}
          style={{ opacity: 0 }}
        />
      ))}
    </g>
  );
}

/* Jedan sat za sve veze u korenu: svaka veza ispaljuje udar u svom taktu,
   pa struja ide kroz sistem redom. Kad udar stigne, kartica na kraju
   ([data-glow-node]) i mesto ulaza ([data-glow]) zasvetle. Piše direktno u
   DOM, bez React rendera po frejmu. */
function useCurrent(
  root: RefObject<HTMLElement | null>,
  wires: Wire[],
  o: { slot: number; period: number; run: boolean; delay: number },
) {
  const { slot, period, run, delay } = o;
  useEffect(() => {
    const el = root.current;
    if (!el || !run || !wires.length) return;
    const P = period * slot;
    const nodes = new Map<string, HTMLElement[]>();
    const nodeEls = (id: string) => {
      let l = nodes.get(id);
      if (!l) {
        l = [...el.querySelectorAll<HTMLElement>(`[data-glow-node="${id}"]`)];
        nodes.set(id, l);
      }
      return l;
    };
    const parts = wires.map((w, i) => {
      const g = el.querySelector(`[data-w="${w.id}"]`);
      const get = (k: string) =>
        g?.querySelector<SVGPathElement>(`[data-l="${k}"]`) ?? null;
      const core = get("core");
      const len = core ? core.getTotalLength() : 0;
      const layers = LAYERS.map(([k, L]) => {
        const e = get(k);
        if (e) e.style.strokeDasharray = `${L} ${len + L + 40}`;
        return { e, L };
      });
      return {
        w,
        i,
        len,
        layers,
        tau: clamp(len / 560, 0.2, 0.5),
        ping: g?.querySelector<SVGCircleElement>('[data-l="ping"]') ?? null,
        sparks: [
          ...(g?.querySelectorAll<SVGCircleElement>('[data-l="spark"]') ?? []),
        ],
        glow: [...el.querySelectorAll<HTMLElement>(`[data-glow="${w.id}"]`)],
        on: false,
      };
    });
    const last = new Map<Element, number>();
    const put = (e: HTMLElement | SVGElement, v: number) => {
      if (Math.abs((last.get(e) ?? -1) - v) < 0.004) return;
      last.set(e, v);
      e.style.opacity = v < 0.004 ? "0" : v.toFixed(3);
    };
    const t0 = performance.now();
    let raf = requestAnimationFrame(function frame(now) {
      raf = requestAnimationFrame(frame);
      const t = (now - t0) / 1000 - delay;
      if (t < 0) return;
      const charge = new Map<string, number>();
      const bump = (id: string, v: number) =>
        charge.set(id, Math.max(charge.get(id) ?? 0, v));
      for (const p of parts) {
        const start = p.w.slot * slot;
        let local = (t - start) % P;
        if (local < 0) local += P;
        if (t < start) local = P;
        const head = (local / p.tau) * p.len;
        if (p.len && head - 60 < p.len) {
          for (const { e, L } of p.layers)
            if (e) e.style.strokeDashoffset = String(L - head);
          if (!p.on) {
            for (const { e } of p.layers) if (e) e.style.opacity = "1";
            p.on = true;
          }
          /* jezgro treperi kao varnica */
          const c = p.layers[2].e;
          if (c)
            c.style.opacity = (
              0.7 +
              0.3 * Math.abs(Math.sin(now * 0.05 + p.i * 1.7))
            ).toFixed(2);
        } else if (p.on) {
          for (const { e } of p.layers) if (e) e.style.opacity = "0";
          p.on = false;
        }
        const since = local - p.tau;
        const arrive =
          since < -p.tau * 0.25
            ? 0
            : since < 0
              ? 1 + since / (p.tau * 0.25)
              : Math.exp(-since / 0.42);
        const k = since / 0.6;
        if (k >= 0 && k < 1) {
          const e = 1 - (1 - k) ** 3;
          if (p.ping) {
            p.ping.setAttribute("r", (3 + e * 15).toFixed(1));
            put(p.ping, (1 - k) ** 1.5 * 0.9);
          }
          p.sparks.forEach((sp, j) => {
            const a = ((p.w.ang + 180 + SPARKS[j]) * Math.PI) / 180;
            const r = 3 + e * (14 + (j % 3) * 6);
            sp.setAttribute("cx", (p.w.b[0] + Math.cos(a) * r).toFixed(1));
            sp.setAttribute("cy", (p.w.b[1] + Math.sin(a) * r).toFixed(1));
            sp.setAttribute("r", (2.2 - 1.4 * k).toFixed(2));
            put(sp, (1 - k) ** 1.2);
          });
        } else {
          if (p.ping) put(p.ping, 0);
          for (const sp of p.sparks) put(sp, 0);
        }
        for (const g of p.glow) put(g, arrive);
        bump(p.w.to, arrive);
        bump(p.w.from, local < 0.25 ? 0.5 * (1 - local / 0.25) : 0);
      }
      for (const [id, v] of charge) for (const e of nodeEls(id)) put(e, v);
    });
    return () => {
      cancelAnimationFrame(raf);
      for (const p of parts) {
        for (const { e } of p.layers) if (e) e.style.opacity = "0";
        if (p.ping) p.ping.style.opacity = "0";
        for (const sp of p.sparks) sp.style.opacity = "0";
        for (const g of p.glow) g.style.opacity = "0";
      }
      for (const l of nodes.values()) for (const e of l) e.style.opacity = "0";
    };
  }, [root, wires, slot, period, run, delay]);
}

/* ------------------------------------------------------------------ */
/* Raspored pregleda                                                   */
/* ------------------------------------------------------------------ */

type Layout = {
  W: number;
  H: number;
  portrait: boolean;
  rad: number;
  cards: Record<SegId, Rect>;
  hub: { x: number; y: number; r: number };
  legend: number;
  /* smer petlje oko Infinity-ja: 1 kazaljka na satu, -1 suprotno */
  spin: 1 | -1;
};

/* Svaka veza ide samo između susednih kartica, pa se ništa ne seče.
   Široko (3 × 2):            Usko (2 × 3):
     Tim     Kanali  Sajt       Tim     Sadržaj
     Sadržaj Novac   Studio     Sajt    Kanali
                                Studio  Novac
   Infinity je u preseku četiri kartice petlje. */
function layoutOf(W: number, H: number): Layout {
  const portrait = W / H < 0.95;
  const m = clamp(Math.min(W, H) * 0.045, 14, 40);
  const leg = 30;
  const cards = {} as Record<SegId, Rect>;
  const put = (id: SegId, x: number, y: number, w: number, h: number) => {
    cards[id] = { x, y, w, h };
  };
  if (!portrait) {
    const g = clamp(W * 0.075, 40, 112);
    const gap = clamp(H * 0.19, 84, 160);
    const cw = (W - 2 * m - 2 * g) / 3;
    const ch = Math.min((H - 2 * m - leg - gap) / 2, cw * 0.7);
    const top = m + (H - 2 * m - leg - (2 * ch + gap)) / 2;
    const X = (c: number) => m + c * (cw + g);
    const Y = (r: number) => top + r * (ch + gap);
    put("tim", X(0), Y(0), cw, ch);
    put("sadrzaj", X(0), Y(1), cw, ch);
    put("kanali", X(1), Y(0), cw, ch);
    put("sajt", X(2), Y(0), cw, ch);
    put("studio", X(2), Y(1), cw, ch);
    put("novac", X(1), Y(1), cw, ch);
    const rad = clamp(cw * 0.075, 16, 26);
    /* najveći krug koji staje između četiri zaobljena ugla */
    const free = Math.hypot(g / 2 + rad, gap / 2 + rad) - rad;
    return {
      W,
      H,
      portrait,
      rad,
      cards,
      hub: { x: X(2) - g / 2, y: Y(1) - gap / 2, r: clamp(free - 14, 24, 64) },
      legend: H - m - leg / 2,
      spin: 1,
    };
  }
  const g = clamp(W * 0.075, 18, 34);
  const gapA = clamp(H * 0.04, 18, 34);
  const gapB = clamp(H * 0.09, 44, 84);
  const cw = (W - 2 * m - g) / 2;
  const ch = Math.min((H - 2 * m - leg - gapA - gapB) / 3, cw * 1.2);
  const top = m + (H - 2 * m - leg - (3 * ch + gapA + gapB)) / 2;
  const X = (c: number) => m + c * (cw + g);
  const Y = [top, top + ch + gapA, top + 2 * ch + gapA + gapB];
  put("tim", X(0), Y[0], cw, ch);
  put("sadrzaj", X(1), Y[0], cw, ch);
  put("sajt", X(0), Y[1], cw, ch);
  put("kanali", X(1), Y[1], cw, ch);
  put("studio", X(0), Y[2], cw, ch);
  put("novac", X(1), Y[2], cw, ch);
  const rad = clamp(cw * 0.08, 14, 22);
  const free = Math.hypot(g / 2 + rad, gapB / 2 + rad) - rad;
  return {
    W,
    H,
    portrait,
    rad,
    cards,
    hub: { x: X(1) - g / 2, y: Y[2] - gapB / 2, r: clamp(free - 8, 20, 64) },
    legend: H - m - leg / 2,
    spin: -1,
  };
}

/* Takt udara: dubina od prvog dela sistema, a petlja određuje dužinu
   ciklusa. Tako sadržaj (Sadržaj → Kanali) i budžet (Novac → Kanali)
   stižu u Kanale u istom trenutku. */
const BEAT = (() => {
  const depth = new Map<SegId, number>([[FLOWS[0].from, 0]]);
  for (let k = 0; k < FLOWS.length; k++)
    for (const f of FLOWS)
      if (depth.has(f.from) && !depth.has(f.to))
        depth.set(f.to, depth.get(f.from)! + 1);
  let period = Math.max(...depth.values()) + 2;
  for (const f of FLOWS) {
    const a = depth.get(f.from) ?? 0,
      b = depth.get(f.to) ?? 0;
    if (b <= a) period = a + 1 - b;
  }
  return { depth, period };
})();

function flowWires(L: Layout): Wire[] {
  return FLOWS.map((f) => {
    const a = L.cards[f.from],
      b = L.cards[f.to];
    const side = Math.abs(cx(a) - cx(b)) < Math.min(a.w, b.w) / 2 ? "y" : "x";
    const p = curve(a, b, side);
    return {
      id: `${f.from}>${f.to}`,
      d: dOf(p),
      color: FLOW_COLOR[f.kind][0],
      alt: FLOW_COLOR[f.kind][1],
      from: f.from,
      to: f.to,
      slot: (BEAT.depth.get(f.from) ?? 0) % BEAT.period,
      a: p[0],
      b: p[3],
      ang: angOf(p[2], p[3]),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Sitni delovi                                                        */
/* ------------------------------------------------------------------ */

function Face({
  id,
  size,
  ring = BG,
}: {
  id: PersonId;
  size: number;
  ring?: string;
}) {
  const p = PEOPLE[id];
  return (
    <span
      className="relative inline-block flex-none overflow-hidden rounded-full"
      style={{ width: size, height: size, boxShadow: `0 0 0 2px ${ring}` }}
      title={p.name}
    >
      <Image
        src={p.src}
        alt={p.name}
        fill
        sizes={`${Math.ceil(size * 2)}px`}
        className="object-cover"
        style={{ objectPosition: "50% 28%" }}
      />
    </span>
  );
}

function Faces({
  ids,
  size,
  ring,
}: {
  ids: PersonId[];
  size: number;
  ring?: string;
}) {
  return (
    <span className="flex items-center">
      {ids.map((id, i) => (
        <span key={id} style={{ marginLeft: i ? -size * 0.32 : 0 }}>
          <Face id={id} size={size} ring={ring} />
        </span>
      ))}
    </span>
  );
}

/* slika entiteta: fotografija lokacije, logo kanala, ikonica ili lica */
function Visual({
  e,
  size,
  tint = ROSE_SOFT,
}: {
  e: Entity;
  size: number;
  tint?: string;
}) {
  const box = {
    width: size,
    height: size,
    background: SURFACE_2,
    border: `1px solid ${LINE}`,
  };
  if (e.img)
    return (
      <span
        className="relative flex-none overflow-hidden rounded-xl"
        style={box}
      >
        <Image
          src={e.img}
          alt=""
          fill
          sizes={`${Math.ceil(size * 2)}px`}
          className="object-cover"
        />
      </span>
    );
  if (e.logo)
    return (
      <span
        className="grid flex-none place-items-center rounded-full"
        style={box}
      >
        {e.logo === "meta" ? (
          <MetaLogo size={size * 0.42} />
        ) : (
          <GoogleLogo size={size * 0.48} />
        )}
      </span>
    );
  if (e.icon) {
    const I = ICONS[e.icon];
    return (
      <span
        className="grid flex-none place-items-center rounded-full"
        style={box}
      >
        <I style={{ width: size * 0.46, height: size * 0.46, color: tint }} />
      </span>
    );
  }
  if (e.who?.length)
    return e.who.length === 1 ? (
      <Face id={e.who[0]} size={size} ring={LINE} />
    ) : (
      <Faces ids={e.who} size={size * 0.82} ring={SURFACE} />
    );
  return <span className="flex-none rounded-full" style={box} />;
}

function Chip({ s, small }: { s: Status; small?: boolean }) {
  const c = STATUS[s];
  return (
    <span
      className="inline-flex flex-none items-center gap-1 rounded-full font-bold uppercase"
      style={{
        fontSize: small ? 9 : 10,
        letterSpacing: "0.08em",
        padding: small ? "2px 6px" : "3px 8px",
        color: c.color,
        background: `${c.color}1f`,
      }}
    >
      <span
        className="rounded-full"
        style={{ width: 5, height: 5, background: c.color }}
      />
      {c.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Pregled                                                             */
/* ------------------------------------------------------------------ */

type Port = { id: string; x: number; y: number; color: string };

function SegCard({
  seg,
  r,
  rad,
  dim,
  ports,
  showEm,
  onOpen,
  onHover,
  i,
}: {
  seg: Segment;
  r: Rect;
  rad: number;
  dim: boolean;
  ports: Port[];
  showEm: boolean;
  onOpen: () => void;
  onHover: (id: SegId | null) => void;
  i: number;
}) {
  const fs = clamp(r.w * 0.11, 17, 34);
  const pad = clamp(r.w * 0.065, 12, 24);
  const mini = clamp(r.w * 0.11, 22, 38);
  const fit = Math.floor((r.w - 2 * pad - mini * 0.9 - 8) / (mini * 1.18));
  const n = seg.entities.length > fit ? Math.max(1, fit - 1) : fit;
  const trig = triggerCount(seg);
  const blob = Math.min(r.w, r.h) * 1.2;
  const [accent, accent2] = SEG_COLOR[seg.id];
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      onPointerEnter={(ev) => ev.pointerType === "mouse" && onHover(seg.id)}
      onPointerLeave={() => onHover(null)}
      aria-label={`${seg.title}: ${seg.em}. Otvori.`}
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: dim ? 0.22 : 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay: dim ? 0 : 0.12 + i * 0.06,
        ease: EASE,
      }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className="group absolute flex flex-col overflow-hidden text-left"
      style={{
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        padding: pad,
        borderRadius: rad,
        background: `radial-gradient(90% 70% at 0% 0%, ${accent}1a, transparent 62%), radial-gradient(70% 60% at 100% 100%, ${accent2}12, transparent 60%), linear-gradient(160deg, ${SURFACE_2}, ${SURFACE} 70%)`,
        border: `1px solid ${LINE}`,
        boxShadow: "0 24px 50px -30px rgba(0,0,0,0.9)",
        zIndex: 2,
      }}
    >
      {/* svetlo i ivica u boji struje na mestu gde ulazi u karticu */}
      {ports.map((p) => (
        <span key={p.id} aria-hidden>
          <span
            data-glow={p.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: p.x - blob / 2,
              top: p.y - blob / 2,
              width: blob,
              height: blob,
              background: `radial-gradient(closest-side, ${p.color}55, transparent)`,
              opacity: 0,
            }}
          />
          <span
            data-glow={p.id}
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: "inherit",
              boxShadow: `inset 0 0 0 1.5px ${p.color}cc`,
              opacity: 0,
            }}
          />
        </span>
      ))}
      {/* kartica šalje struju dalje: kratak sjaj u njenoj boji */}
      <span
        data-glow-node={seg.id}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: "inherit",
          boxShadow: `inset 0 0 0 1.5px ${accent}cc`,
          background: `radial-gradient(80% 70% at 50% 50%, ${accent}22, transparent 70%)`,
          opacity: 0,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          borderRadius: "inherit",
          boxShadow: `inset 0 0 0 1px ${accent}88`,
          background: `radial-gradient(120% 80% at 100% 0%, ${accent}1f, transparent 60%)`,
        }}
      />
      <span className="relative flex items-center justify-between gap-2">
        <span
          className="font-bold tabular-nums"
          style={{ color: accent, fontSize: clamp(fs * 0.4, 10, 13) }}
        >
          {seg.n}
        </span>
        {trig > 0 && (
          <span
            className="inline-flex items-center gap-1 rounded-full font-bold"
            style={{
              fontSize: clamp(fs * 0.38, 10, 12),
              padding: "2px 7px",
              color: AMBER,
              background: `${AMBER}1c`,
            }}
            title="Okidači"
          >
            <Zap
              style={{ width: 11, height: 11 }}
              fill={AMBER}
              strokeWidth={0}
            />
            {trig}
          </span>
        )}
      </span>
      <span
        className="relative mt-1 block font-semibold leading-[1.02]"
        style={{ fontFamily: SERIF, fontSize: fs, color: IVORY }}
      >
        {seg.title}
      </span>
      {showEm && (
        <em
          className="relative mt-1 block font-semibold leading-tight"
          style={{
            fontFamily: SERIF,
            fontSize: clamp(fs * 0.52, 13, 18),
            color: accent,
          }}
        >
          {seg.em}
        </em>
      )}
      <span className="relative mt-auto flex items-end justify-between gap-2 pt-2">
        <span
          className="flex min-w-0 items-center"
          style={{ gap: mini * 0.18 }}
        >
          {seg.entities.slice(0, n).map((e) => (
            <Visual key={e.id} e={e} size={mini} tint={accent} />
          ))}
          {seg.entities.length > n && (
            <span
              className="font-semibold"
              style={{ color: MUTED, fontSize: clamp(mini * 0.36, 10, 13) }}
            >
              +{seg.entities.length - n}
            </span>
          )}
        </span>
        <span
          className="grid flex-none place-items-center rounded-full transition-transform duration-300 group-hover:scale-110"
          style={{
            width: mini * 0.86,
            height: mini * 0.86,
            background: `linear-gradient(135deg, ${accent}, ${accent2})`,
            color: BG,
          }}
        >
          <ZoomIn style={{ width: mini * 0.42, height: mini * 0.42 }} />
        </span>
      </span>
    </motion.button>
  );
}

/* Infinity u sredini petlje; prsten se okreće u smeru u kom petlja teče */
function Hub({ L, dim }: { L: Layout; dim: boolean }) {
  const { x, y, r } = L.hub;
  const R = r + 7;
  const spin = L.spin < 0 ? "sys-spin ccw" : "sys-spin";
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{
        left: x - R,
        top: y - R,
        width: R * 2,
        height: R * 2,
        zIndex: 3,
      }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: dim ? 0.25 : 1, scale: 1 }}
      transition={{
        type: "spring",
        bounce: 0.25,
        visualDuration: 0.5,
        delay: 0.1,
      }}
      aria-hidden
    >
      {/* boje svih delova sistema u krugu, sjaj i tanak prsten */}
      <span
        className={`${spin} absolute rounded-full`}
        style={{
          inset: 4,
          background: RAINBOW,
          filter: "blur(9px)",
          opacity: 0.4,
        }}
      />
      <span
        className={`${spin} absolute rounded-full`}
        style={{
          inset: 2,
          background: RAINBOW,
          mask: "radial-gradient(closest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px))",
          WebkitMask:
            "radial-gradient(closest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px))",
        }}
      />
      <svg
        className={`${spin} absolute inset-0`}
        viewBox="-50 -50 100 100"
        width="100%"
        height="100%"
      >
        {[45, 135, 225, 315].map((deg) => (
          <path
            key={deg}
            d="M-3,-3.6 L2,0 L-3,3.6"
            fill="none"
            stroke={IVORY}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            transform={`rotate(${deg}) translate(46 0) rotate(${L.spin * 90})`}
          />
        ))}
      </svg>
      <span
        className="absolute grid place-items-center overflow-hidden rounded-full"
        style={{
          inset: 7,
          background: `radial-gradient(circle at 40% 32%, #4a2a33, ${SURFACE} 75%)`,
          border: `1px solid ${ROSE}66`,
          boxShadow: `0 0 34px -4px ${ROSE}66`,
        }}
      >
        <Image
          src="/clients/ils/logo.webp"
          alt=""
          width={120}
          height={120}
          className="h-[62%] w-[62%] object-contain"
        />
      </span>
    </motion.div>
  );
}

/* boje veza umesto natpisa na svakoj vezi */
function Legend({ L, hide }: { L: Layout; hide: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute flex items-center justify-center gap-x-4"
      style={{ left: 0, width: L.W, top: L.legend - 10, height: 20, zIndex: 2 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: hide ? 0 : 1 }}
      transition={{ duration: 0.4, delay: hide ? 0 : 1.1 }}
      aria-hidden
    >
      {(Object.keys(FLOW_COLOR) as Flow["kind"][]).map((k) => (
        <span
          key={k}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold"
          style={{ color: MUTED }}
        >
          <span
            className="rounded-full"
            style={{
              width: 16,
              height: 3,
              background: `linear-gradient(90deg, ${FLOW_COLOR[k][0]}, ${FLOW_COLOR[k][1]})`,
            }}
          />
          {FLOW_NAME[k]}
        </span>
      ))}
      <span
        className="inline-flex items-center gap-1 text-[11px] font-semibold"
        style={{ color: MUTED }}
      >
        <Zap style={{ width: 11, height: 11 }} fill={AMBER} strokeWidth={0} />
        okidači
      </span>
    </motion.div>
  );
}

function Overview({
  L,
  focus,
  idle,
  run,
  onOpen,
}: {
  L: Layout;
  focus: SegId | null;
  idle: boolean;
  run: boolean;
  onOpen: (id: SegId) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<SegId | null>(null);
  const wires = useMemo(() => flowWires(L), [L]);
  useCurrent(root, wires, { slot: 1, period: BEAT.period, run, delay: 1.2 });
  const ports = useMemo(() => {
    const m = {} as Record<SegId, Port[]>;
    for (const w of wires) {
      const r = L.cards[w.to as SegId];
      (m[w.to as SegId] ??= []).push({
        id: w.id,
        x: w.b[0] - r.x,
        y: w.b[1] - r.y,
        color: w.color,
      });
    }
    return m;
  }, [wires, L]);
  return (
    <div
      ref={root}
      className={idle ? "sys-idle absolute inset-0" : "absolute inset-0"}
    >
      <svg
        className="pointer-events-none absolute left-0 top-0"
        width={L.W}
        height={L.H}
        viewBox={`0 0 ${L.W} ${L.H}`}
        style={{ zIndex: 1, overflow: "visible" }}
        aria-hidden
      >
        {wires.map((w, i) => (
          <WireG
            key={w.id}
            w={w}
            lit={!hover || w.from === hover || w.to === hover}
            draw={0.5 + i * 0.09}
          />
        ))}
      </svg>

      <Hub L={L} dim={!!focus} />

      {SEGMENTS.map((s, i) => (
        <SegCard
          key={s.id}
          seg={s}
          r={L.cards[s.id]}
          rad={L.rad}
          dim={!!focus && focus !== s.id}
          ports={ports[s.id] ?? []}
          showEm={L.cards[s.id].h > 120}
          onOpen={() => {
            setHover(null);
            onOpen(s.id);
          }}
          onHover={setHover}
          i={i}
        />
      ))}

      <Legend L={L} hide={!!focus} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Zumiran segment                                                     */
/* ------------------------------------------------------------------ */

/* razmak između kolona: mesta za vezu, munju i dva prolaza */
const GAP = 64;

type Inner = { l: Link; from: string; to: string };

/* Telefon: kartice su u jednoj koloni, a veze idu levo od njih po šinama.
   Više ulaza u isti entitet dele šinu, inače sve iz istog izvora; mreže
   koje se ne preklapaju idu na istu šinu. Redosled šina (bliže/dalje od
   kartica) je onaj sa najmanje lažnih ukrštanja. */
function railsOf(order: Entity[], links: Inner[]) {
  const at = new Map(order.map((e, i) => [e.id, i]));
  const fanIn = new Map<string, number>();
  for (const k of links) fanIn.set(k.to, (fanIn.get(k.to) ?? 0) + 1);
  type Net = { idx: number[]; stops: Set<number>; lo: number; hi: number };
  const nets = new Map<string, Net>();
  links.forEach((k, i) => {
    const key = (fanIn.get(k.to) ?? 0) > 1 ? `in:${k.to}` : `out:${k.from}`;
    const n: Net = nets.get(key) ?? {
      idx: [],
      stops: new Set(),
      lo: Infinity,
      hi: -Infinity,
    };
    for (const y of [at.get(k.from) ?? 0, at.get(k.to) ?? 0]) {
      n.stops.add(y);
      n.lo = Math.min(n.lo, y);
      n.hi = Math.max(n.hi, y);
    }
    n.idx.push(i);
    nets.set(key, n);
  });
  const list = [...nets.values()].sort((a, b) => a.lo - b.lo || b.hi - a.hi);
  const ends: number[] = [];
  const railOf = new Map<Net, number>();
  for (const n of list) {
    let r = ends.findIndex((hi) => hi <= n.lo);
    if (r < 0) {
      r = ends.length;
      ends.push(n.hi);
    } else ends[r] = n.hi;
    railOf.set(n, r);
  }
  const R = ends.length;
  const perms: number[][] = [];
  const permute = (rest: number[], acc: number[]) => {
    if (!rest.length) perms.push(acc);
    else
      rest.forEach((v, i) =>
        permute(
          rest.filter((_, j) => j !== i),
          [...acc, v],
        ),
      );
  };
  if (R <= 4) permute([...Array(R).keys()], []);
  else perms.push([...Array(R).keys()]);
  const cost = (pos: number[]) => {
    let c = 0;
    for (const n of list)
      for (const y of n.stops)
        for (const m of list)
          if (
            m !== n &&
            pos[railOf.get(m)!] < pos[railOf.get(n)!] &&
            m.lo < y &&
            y < m.hi &&
            !m.stops.has(y)
          )
            c++;
    return c;
  };
  const best = perms.reduce(
    (b, p) => (cost(p) < cost(b) ? p : b),
    perms[0] ?? [],
  );
  const of = links.map(() => 0);
  for (const n of list) for (const i of n.idx) of[i] = best[railOf.get(n)!];
  return { of, n: R };
}

type Net = {
  wires: Wire[];
  badges: { id: string; at: Pt }[];
  room: number;
  sig: string;
};

function EntityCard({
  e,
  ring,
  tint,
  i,
  onOpen,
  onHover,
}: {
  e: Entity;
  ring: boolean;
  tint: [string, string];
  i: number;
  onOpen: () => void;
  onHover: (id: string | null) => void;
}) {
  const faces = !e.img && !e.logo && !e.icon;
  return (
    <motion.button
      type="button"
      data-ent={e.id}
      onClick={onOpen}
      onPointerEnter={(ev) => ev.pointerType === "mouse" && onHover(e.id)}
      onPointerLeave={() => onHover(null)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.25 + i * 0.04, ease: EASE }}
      whileTap={{ scale: 0.98 }}
      className="relative flex w-full items-center gap-3 rounded-2xl p-3 text-left"
      style={{
        zIndex: 1,
        background: SURFACE,
        border: `1px solid ${ring ? AMBER : LINE}`,
        boxShadow: ring ? `0 0 0 3px ${AMBER}26` : "0 16px 34px -26px #000",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      <span
        data-glow-node={e.id}
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-2xl"
        style={{
          boxShadow: `0 0 0 1.5px ${tint[0]}, 0 0 28px -4px ${tint[1]}`,
          opacity: 0,
        }}
      />
      <Visual e={e} size={44} tint={tint[0]} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className="text-[15px] font-bold leading-tight"
            style={{ color: IVORY }}
          >
            {e.name}
          </span>
          {e.status && e.status !== "radi" && <Chip s={e.status} small />}
        </span>
        <span
          className="mt-0.5 block text-[12.5px] leading-snug"
          style={{ color: MUTED }}
        >
          {e.role}
        </span>
        {!faces && e.who && e.who.length > 0 && (
          <span className="mt-1.5 flex">
            <Faces ids={e.who} size={18} ring={SURFACE} />
          </span>
        )}
      </span>
    </motion.button>
  );
}

/* Entiteti dela sistema i veze među njima. Široko: kolone, veze kroz
   prolaze između kolona (preko kolone: ispod svih kartica). Usko ili kad
   kolone ne staju: jedna kolona, veze levo po šinama. Nijedna linija ne
   prelazi preko kartice. */
function Graph({
  seg,
  hot,
  setHot,
  onOpen,
  run,
}: {
  seg: Segment;
  hot: string[];
  setHot: (ids: string[]) => void;
  onOpen: (e: Entity) => void;
  run: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const measure = useRef<() => void>(() => {});
  const [W, setW] = useState(0);
  const [net, setNet] = useState<Net>({
    wires: [],
    badges: [],
    room: 0,
    sig: "",
  });

  const lanes = useMemo(() => {
    const n = Math.max(...seg.entities.map((e) => e.lane)) + 1;
    return Array.from({ length: n }, (_, i) =>
      seg.entities.filter((e) => e.lane === i),
    );
  }, [seg]);
  const links = useMemo<Inner[]>(
    () =>
      seg.links.flatMap((l) => {
        const to = refOf(l.to, seg.id);
        return to.seg === seg.id &&
          entityOf(seg.id, l.from) &&
          entityOf(seg.id, to.id)
          ? [{ l, from: l.from, to: to.id }]
          : [];
      }),
    [seg],
  );
  const rails = useMemo(() => railsOf(lanes.flat(), links), [lanes, links]);
  const cols = W > 0 && W >= lanes.length * 168 + (lanes.length - 1) * GAP;
  const gutter = !cols && rails.n ? 12 + rails.n * 12 : 0;
  const period =
    Math.max(0, ...links.map((k) => entityOf(seg.id, k.from)?.lane ?? 0)) + 2;

  useLayoutEffect(() => {
    const g = box.current;
    if (!g) return;
    setW(g.clientWidth);
    const ro = new ResizeObserver(() => {
      setW(g.clientWidth);
      measure.current();
    });
    ro.observe(g);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    measure.current = () => {
      const g = box.current;
      if (!g) return;
      const R = new Map<string, Rect>();
      g.querySelectorAll<HTMLElement>("[data-ent]").forEach((el) =>
        R.set(el.dataset.ent!, offsetIn(el, g)),
      );
      const laneOf = (id: string) => entityOf(seg.id, id)?.lane ?? 0;
      /* tok u boji dela sistema, okidač u boji munje */
      const tone = (trig: boolean) => {
        const [color, alt] = trig ? TRIG : SEG_COLOR[seg.id];
        return { color, alt };
      };
      const wires: Wire[] = [];
      const badges = new Map<string, Pt>();
      let room = 0;
      if (cols) {
        const span = lanes.map((list) => {
          const rs = list.flatMap((e) => R.get(e.id) ?? []);
          return {
            l: Math.min(...rs.map((r) => r.x)),
            r: Math.max(...rs.map((r) => r.x + r.w)),
          };
        });
        const floor = Math.max(...[...R.values()].map((r) => r.y + r.h));
        const level = new Map<string, number>();
        for (const { l, from, to } of links) {
          const a = R.get(from),
            b = R.get(to);
          if (!a || !b) continue;
          const la = laneOf(from),
            lb = laneOf(to);
          const trig = l.kind === "okidac";
          let d: string, s: Pt, e: Pt, ang: number;
          if (Math.abs(lb - la) === 1) {
            const p = curve(a, b, "x");
            [d, s, e, ang] = [dOf(p), p[0], p[3], angOf(p[2], p[3])];
            if (trig) badges.set(`${from}>${to}`, bez(p, 0.5));
          } else {
            const fwd = lb >= la;
            const x1 = fwd ? span[la].r + 14 : span[la].l - 14;
            let pts: Pt[];
            if (la === lb)
              pts = [
                [a.x + a.w, cy(a)],
                [x1, cy(a)],
                [x1, cy(b)],
                [b.x + b.w, cy(b)],
              ];
            else {
              /* preko kolone: ispod svih kartica, jedan nivo po cilju */
              if (!level.has(to)) level.set(to, level.size);
              const fy = floor + 22 + level.get(to)! * 14;
              const x2 = fwd ? span[lb].l - 14 : span[lb].r + 14;
              pts = [
                [fwd ? a.x + a.w : a.x, cy(a)],
                [x1, cy(a)],
                [x1, fy],
                [x2, fy],
                [x2, cy(b)],
                [fwd ? b.x : b.x + b.w, cy(b)],
              ];
              if (trig) badges.set(`under>${to}`, [(x1 + x2) / 2, fy]);
            }
            const n = pts.length;
            [d, s, e, ang] = [
              ortho(pts, 12),
              pts[0],
              pts[n - 1],
              angOf(pts[n - 2], pts[n - 1]),
            ];
          }
          wires.push({
            id: `${from}>${to}`,
            d,
            ...tone(trig),
            from,
            to,
            slot: la,
            a: s,
            b: e,
            ang,
            trig,
          });
        }
        room = level.size ? 34 + (level.size - 1) * 14 : 0;
      } else {
        links.forEach(({ l, from, to }, k) => {
          const a = R.get(from),
            b = R.get(to);
          if (!a || !b) return;
          const rx = a.x - 10 - rails.of[k] * 12;
          const pts: Pt[] = [
            [a.x, cy(a)],
            [rx, cy(a)],
            [rx, cy(b)],
            [b.x, cy(b)],
          ];
          const trig = l.kind === "okidac";
          wires.push({
            id: `${from}>${to}`,
            d: ortho(pts, 7),
            ...tone(trig),
            from,
            to,
            slot: laneOf(from),
            a: pts[0],
            b: pts[3],
            ang: 0,
            trig,
          });
        });
      }
      const sig = wires.map((w) => w.d).join("|") + `|${room}`;
      setNet((o) =>
        o.sig === sig
          ? o
          : {
              wires,
              badges: [...badges].map(([id, at]) => ({ id, at })),
              room,
              sig,
            },
      );
    };
    measure.current();
  }, [cols, gutter, lanes, links, rails, seg.id]);

  useCurrent(box, net.wires, { slot: 0.85, period, run, delay: 0.9 });

  const lit = (w: Wire) =>
    !hot.length ||
    (hot.length === 1
      ? w.from === hot[0] || w.to === hot[0]
      : hot.includes(w.from) && hot.includes(w.to));
  const hover = (id: string | null) => setHot(id ? [id] : []);

  return (
    <div
      ref={box}
      className="relative mt-7"
      style={{ paddingBottom: cols ? net.room : 0 }}
    >
      <svg
        className="pointer-events-none absolute left-0 top-0 h-full w-full"
        style={{ zIndex: 0, overflow: "visible" }}
        aria-hidden
      >
        {net.wires.map((w, i) => (
          <WireG key={w.id} w={w} lit={lit(w)} draw={0.45 + i * 0.06} />
        ))}
        {net.badges.map(({ id, at }, i) => (
          <motion.g
            key={id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 + i * 0.06 }}
          >
            <circle
              cx={at[0]}
              cy={at[1]}
              r={10}
              fill={BG}
              stroke={AMBER}
              strokeWidth={1.4}
            />
            <path
              transform={`translate(${at[0] - 6},${at[1] - 6}) scale(0.5)`}
              d={ZAP_D}
              fill={AMBER}
            />
          </motion.g>
        ))}
      </svg>

      {cols ? (
        <div className="flex items-start" style={{ gap: GAP }}>
          {lanes.map((list, li) => (
            <div key={li} className="min-w-0 flex-1">
              {seg.lanes[li] && <LaneLabel text={seg.lanes[li]} />}
              <div className="flex flex-col gap-3">
                {list.map((e) => (
                  <EntityCard
                    key={e.id}
                    e={e}
                    i={seg.entities.indexOf(e)}
                    ring={hot.length > 1 && hot.includes(e.id)}
                    tint={SEG_COLOR[seg.id]}
                    onOpen={() => onOpen(e)}
                    onHover={hover}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col gap-5"
          style={{ paddingLeft: gutter, maxWidth: 560 + gutter }}
        >
          {lanes.map((list, li) => (
            <div key={li}>
              {seg.lanes[li] && <LaneLabel text={seg.lanes[li]} />}
              <div className="flex flex-col gap-2.5">
                {list.map((e) => (
                  <EntityCard
                    key={e.id}
                    e={e}
                    i={seg.entities.indexOf(e)}
                    ring={hot.length > 1 && hot.includes(e.id)}
                    tint={SEG_COLOR[seg.id]}
                    onOpen={() => onOpen(e)}
                    onHover={hover}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LaneLabel({ text }: { text: string }) {
  return (
    <p
      className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em]"
      style={{ color: MUTED }}
    >
      {text}
    </p>
  );
}

/* gde je ovaj deo u sistemu: odakle dolazi i kuda ide */
function FlowNav({
  seg,
  onJump,
}: {
  seg: Segment;
  onJump: (id: SegId) => void;
}) {
  const ins = FLOWS.filter((f) => f.to === seg.id);
  const outs = FLOWS.filter((f) => f.from === seg.id);
  const chip = (f: Flow, other: SegId) => (
    <button
      type="button"
      key={other}
      onClick={() => onJump(other)}
      className="inline-flex h-8 items-center gap-1.5 rounded-full pl-2.5 pr-3 text-[13px] font-semibold"
      style={{
        border: `1px solid ${LINE}`,
        background: "rgba(255,255,255,0.03)",
        color: IVORY,
      }}
    >
      <span
        className="rounded-full"
        style={{
          width: 8,
          height: 8,
          background: `linear-gradient(135deg, ${FLOW_COLOR[f.kind][0]}, ${FLOW_COLOR[f.kind][1]})`,
        }}
      />
      {SEG[other].title}
    </button>
  );
  const arrow = (
    <ArrowRight className="h-4 w-4 flex-none" style={{ color: MUTED }} />
  );
  return (
    <motion.nav
      aria-label="Povezani delovi sistema"
      className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      {ins.length > 0 && (
        <span className="flex items-center gap-1.5">
          {ins.map((f) => chip(f, f.from))}
          {arrow}
        </span>
      )}
      <span
        className="inline-flex h-8 items-center rounded-full px-3 text-[13px] font-bold"
        style={{
          background: `linear-gradient(135deg, ${SEG_COLOR[seg.id][0]}, ${SEG_COLOR[seg.id][1]})`,
          color: BG,
        }}
      >
        {seg.title}
      </span>
      {outs.length > 0 && (
        <span className="flex items-center gap-1.5">
          {arrow}
          {outs.map((f) => chip(f, f.to))}
        </span>
      )}
    </motion.nav>
  );
}

function Triggers({
  seg,
  setHot,
  onOpen,
}: {
  seg: Segment;
  setHot: (ids: string[]) => void;
  onOpen: (seg: SegId, e: Entity) => void;
}) {
  /* okidači koji počinju ili završavaju u ovom segmentu */
  const list = useMemo(() => {
    const t: {
      link: Link;
      from: { seg: SegId; id: string };
      to: { seg: SegId; id: string };
    }[] = [];
    for (const s of SEGMENTS)
      for (const l of s.links) {
        if (l.kind !== "okidac") continue;
        const to = refOf(l.to, s.id);
        if (s.id === seg.id || to.seg === seg.id)
          t.push({ link: l, from: { seg: s.id, id: l.from }, to });
      }
    return t;
  }, [seg]);
  if (!list.length) return null;

  const end = (r: { seg: SegId; id: string }) => {
    const e = entityOf(r.seg, r.id);
    const name = `${e?.name ?? r.id}${r.seg !== seg.id ? ` · ${SEG[r.seg].title}` : ""}`;
    return (
      <span className="inline-flex flex-none" title={name}>
        {e && <Visual e={e} size={30} tint={SEG_COLOR[r.seg][0]} />}
        <span className="sr-only">{name}</span>
      </span>
    );
  };

  return (
    <section className="mt-10">
      <h3
        className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em]"
        style={{ color: AMBER }}
      >
        <Zap className="h-4 w-4" fill={AMBER} strokeWidth={0} />
        Okidači
      </h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {list.map(({ link, from, to }, i) => (
          <motion.button
            type="button"
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
            onPointerEnter={() => setHot([from.id, to.id])}
            onPointerLeave={() => setHot([])}
            onFocus={() => setHot([from.id, to.id])}
            onBlur={() => setHot([])}
            onClick={() => {
              const e = entityOf(from.seg, from.id);
              if (e) onOpen(from.seg, e);
            }}
            className="rounded-2xl p-4 text-left"
            style={{ background: SURFACE, border: `1px solid ${AMBER}33` }}
          >
            <span className="flex items-center gap-2">
              {end(from)}
              <Zap
                className="h-3.5 w-3.5 flex-none"
                fill={AMBER}
                strokeWidth={0}
              />
              {end(to)}
              {link.status && link.status !== "radi" && (
                <span className="ml-auto">
                  <Chip s={link.status} small />
                </span>
              )}
            </span>
            <span
              className="mt-3 block text-[15px] leading-snug"
              style={{ color: IVORY }}
            >
              <span style={{ color: AMBER }}>Kad</span>{" "}
              {link.when?.charAt(0).toLowerCase()}
              {link.when?.slice(1)}{" "}
              <ArrowRight
                className="mx-0.5 inline h-4 w-4 align-[-3px]"
                style={{ color: AMBER }}
              />{" "}
              {link.then}
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

function Detail({
  seg,
  reduce,
  onBack,
  onJump,
  onOpen,
  onShown,
}: {
  seg: Segment;
  reduce: boolean;
  onBack: () => void;
  onJump: (id: SegId) => void;
  onOpen: (seg: SegId, e: Entity) => void;
  onShown: () => void;
}) {
  const back = useRef<HTMLButtonElement>(null);
  const [hot, setHot] = useState<string[]>([]);

  useEffect(() => {
    back.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{
        zIndex: 20,
        background: `radial-gradient(70% 45% at 8% 0%, ${SEG_COLOR[seg.id][0]}1f, transparent 70%), radial-gradient(60% 40% at 100% 0%, ${SEG_COLOR[seg.id][1]}14, transparent 70%), radial-gradient(120% 70% at 50% 0%, #2a1a1f, ${BG} 65%)`,
      }}
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: { delay: 0.2, duration: 0.3, ease: EASE },
      }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      onAnimationComplete={(d) => {
        /* samo kad je ušao, ne i kad izlazi */
        if ((d as { opacity?: number }).opacity === 1) onShown();
      }}
    >
      <div className="flex flex-none items-center px-4 pb-2 pt-4 md:px-7 md:pt-6">
        <button
          ref={back}
          type="button"
          onClick={onBack}
          className="inline-flex h-10 items-center gap-2 rounded-full pl-1.5 pr-4 text-[14px] font-semibold transition-colors"
          style={{
            border: `1px solid ${LINE}`,
            background: "rgba(255,255,255,0.03)",
            color: IVORY,
          }}
        >
          <span
            className="grid h-7 w-7 place-items-center rounded-full"
            style={{ background: ROSE_SOFT, color: BG }}
          >
            <ArrowLeft className="h-4 w-4" />
          </span>
          Ceo sistem
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-10 pt-2 md:px-7">
        <h2
          className="font-semibold leading-[1.02]"
          style={{
            fontFamily: SERIF,
            fontSize: "clamp(30px, 5vw, 50px)",
            color: IVORY,
          }}
        >
          {seg.title}{" "}
          <em className="font-semibold" style={{ color: SEG_COLOR[seg.id][0] }}>
            {seg.em}
          </em>
        </h2>
        <FlowNav seg={seg} onJump={onJump} />
        <Graph
          seg={seg}
          hot={hot}
          setHot={setHot}
          onOpen={(e) => onOpen(seg.id, e)}
          run={!reduce}
        />
        <Triggers seg={seg} setHot={setHot} onOpen={onOpen} />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Panel entiteta                                                      */
/* ------------------------------------------------------------------ */

function Sheet({
  seg,
  e,
  wide,
  onClose,
  onGo,
}: {
  seg: SegId;
  e: Entity;
  wide: boolean;
  onClose: () => void;
  onGo: (seg: SegId, id: string) => void;
}) {
  const { out, into } = linksOf(seg, e.id);
  const x = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    x.current?.focus({ preventScroll: true });
  }, [e.id]);
  const roleOf = (p: PersonId) =>
    SEG.tim.entities.find((t) => t.who?.length === 1 && t.who[0] === p)?.role;

  const row = (
    key: string,
    l: Link,
    target: { seg: SegId; id: string },
    dir: "out" | "in",
  ) => {
    const t = l.kind === "okidac";
    const other = entityOf(target.seg, target.id);
    const note = t
      ? `Kad ${l.when?.charAt(0).toLowerCase()}${l.when?.slice(1)}: ${l.then}`
      : l.label;
    return (
      <button
        type="button"
        key={key}
        onClick={() => onGo(target.seg, target.id)}
        className="flex w-full items-start gap-3 rounded-xl p-3 text-left"
        style={{
          background: SURFACE_2,
          border: `1px solid ${t ? `${AMBER}33` : LINE}`,
        }}
      >
        <span
          className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full"
          style={{
            background: t ? `${AMBER}22` : `${ROSE}22`,
            color: t ? AMBER : ROSE_SOFT,
          }}
        >
          {t ? (
            <Zap className="h-3.5 w-3.5" fill={AMBER} strokeWidth={0} />
          ) : dir === "out" ? (
            <ArrowRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowLeft className="h-3.5 w-3.5" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="block text-[14px] font-semibold"
            style={{ color: IVORY }}
          >
            {other?.name ?? target.id}
            {target.seg !== seg && (
              <span className="font-medium" style={{ color: MUTED }}>
                {" "}
                · {SEG[target.seg].title}
              </span>
            )}
          </span>
          {note && (
            <span
              className="mt-0.5 block text-[13px] leading-snug"
              style={{ color: MUTED }}
            >
              {note}
            </span>
          )}
        </span>
      </button>
    );
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: 40 }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 1 }}
    >
      <motion.button
        type="button"
        aria-label="Zatvori"
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(10,6,8,0.55)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      <motion.aside
        role="dialog"
        aria-label={e.name}
        className={`absolute flex flex-col overflow-hidden ${wide ? "bottom-3 right-3 top-3 w-[380px] rounded-[26px]" : "inset-x-0 bottom-0 max-h-[78%] rounded-t-[26px]"}`}
        style={{
          background: SURFACE,
          border: `1px solid ${LINE}`,
          boxShadow: "0 30px 80px -20px #000",
        }}
        initial={wide ? { x: "105%" } : { y: "100%" }}
        animate={wide ? { x: 0 } : { y: 0 }}
        exit={wide ? { x: "105%" } : { y: "100%" }}
        transition={SHEET}
      >
        <div className="flex flex-none items-start gap-3 p-5 pb-3">
          <Visual e={e} size={56} tint={SEG_COLOR[seg][0]} />
          <div className="min-w-0 flex-1">
            <p
              className="text-[19px] font-bold leading-tight"
              style={{ color: IVORY }}
            >
              {e.name}
            </p>
            <p className="mt-0.5 text-[13.5px]" style={{ color: MUTED }}>
              {e.role} · {SEG[seg].title}
            </p>
            {e.status && (
              <span className="mt-2 inline-block">
                <Chip s={e.status} />
              </span>
            )}
          </div>
          <button
            ref={x}
            type="button"
            onClick={onClose}
            aria-label="Zatvori"
            className="grid h-9 w-9 flex-none place-items-center rounded-full"
            style={{ border: `1px solid ${LINE}`, color: IVORY }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
          <p className="text-[15px] leading-relaxed" style={{ color: IVORY }}>
            {e.desc}
          </p>
          {e.who && e.who.length > 0 && (
            <SheetBlock title="Ko">
              <div className="flex flex-col gap-2">
                {e.who.map((p) => (
                  <span key={p} className="flex items-center gap-3">
                    <Face id={p} size={34} ring={LINE} />
                    <span>
                      <span
                        className="block text-[14px] font-semibold"
                        style={{ color: IVORY }}
                      >
                        {PEOPLE[p].name}
                      </span>
                      {roleOf(p) && (
                        <span
                          className="block text-[12.5px]"
                          style={{ color: MUTED }}
                        >
                          {roleOf(p)}
                        </span>
                      )}
                    </span>
                  </span>
                ))}
              </div>
            </SheetBlock>
          )}
          {out.length > 0 && (
            <SheetBlock title="Pokreće">
              <div className="flex flex-col gap-2">
                {out.map((o, i) => row("o" + i, o.link, o.to, "out"))}
              </div>
            </SheetBlock>
          )}
          {into.length > 0 && (
            <SheetBlock title="Pokreće ga">
              <div className="flex flex-col gap-2">
                {into.map((o, i) => row("i" + i, o.link, o.from, "in"))}
              </div>
            </SheetBlock>
          )}
        </div>
      </motion.aside>
    </motion.div>
  );
}

function SheetBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-6">
      <h4
        className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em]"
        style={{ color: MUTED }}
      >
        {title}
      </h4>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Celina: kamera, pregled, zumiran segment, panel                     */
/* ------------------------------------------------------------------ */

const isSeg = (s: string): s is SegId => s in SEG;

export function SistemMap() {
  const stage = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [focus, setFocus] = useState<SegId | null>(null);
  /* zumirani deo je potpuno prekrio pregled: pregled miruje */
  const [covered, setCovered] = useState(false);
  const [sheet, setSheet] = useState<{ seg: SegId; e: Entity } | null>(null);
  const first = useRef(true);
  const x = useMotionValue(0),
    y = useMotionValue(0),
    s = useMotionValue(1);

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => {
      const w = Math.round(el.clientWidth),
        h = Math.round(el.clientHeight);
      if (w && h) setSize((o) => (o && o.w === w && o.h === h ? o : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    /* adresa #kanali otvara pravo taj deo */
    const h = location.hash.slice(1);
    if (isSeg(h)) setFocus(h);
    return () => ro.disconnect();
  }, []);

  const L = useMemo(() => (size ? layoutOf(size.w, size.h) : null), [size]);
  const wide = !!size && size.w >= 760;

  /* kamera prati izabrani deo; pri promeni veličine skače bez animacije */
  const lastSize = useRef<string>("");
  useEffect(() => {
    if (!L) return;
    let tx = 0,
      ty = 0,
      ts = 1;
    if (focus) {
      const r = L.cards[focus];
      ts = Math.min(L.W / r.w, L.H / r.h) * 0.92;
      tx = L.W / 2 - cx(r) * ts;
      ty = L.H / 2 - cy(r) * ts;
    }
    const key = `${L.W}x${L.H}`;
    const jump = first.current || reduce || lastSize.current !== key;
    first.current = false;
    lastSize.current = key;
    if (jump) {
      x.set(tx);
      y.set(ty);
      s.set(ts);
      return;
    }
    const a = [animate(x, tx, CAM), animate(y, ty, CAM), animate(s, ts, CAM)];
    return () => a.forEach((c) => c.stop());
  }, [focus, L, reduce, x, y, s]);

  /* adresa prati zum (bez novih koraka u istoriji pregledača) */
  useEffect(() => {
    if (first.current) return;
    const url =
      location.pathname + location.search + (focus ? `#${focus}` : "");
    history.replaceState(history.state, "", url);
  }, [focus]);

  const close = useCallback(() => {
    setSheet(null);
    setFocus(null);
    setCovered(false);
  }, []);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape") return;
      if (sheet) setSheet(null);
      else if (focus) close();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [sheet, focus, close]);

  const go = useCallback((seg: SegId, id: string) => {
    const e = entityOf(seg, id);
    setFocus(seg);
    setSheet(e ? { seg, e } : null);
  }, []);

  const onShown = useCallback(() => setCovered(true), []);

  return (
    <div
      ref={stage}
      className="relative h-full w-full overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(110% 60% at 50% 0%, #2c1d21 0%, rgba(21,14,16,0) 70%)",
      }}
    >
      {L && (
        <motion.div
          className="absolute left-0 top-0"
          style={{
            width: L.W,
            height: L.H,
            x,
            y,
            scale: s,
            transformOrigin: "0 0",
          }}
        >
          <Overview
            L={L}
            focus={focus}
            idle={covered}
            run={!reduce && !covered}
            onOpen={(id) => {
              setSheet(null);
              setFocus(id);
            }}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {focus && (
          <Detail
            key={focus}
            seg={SEG[focus]}
            reduce={reduce}
            onShown={onShown}
            onBack={close}
            onJump={(id) => {
              setSheet(null);
              setFocus(id);
            }}
            onOpen={(seg, e) => setSheet({ seg, e })}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheet && (
          <Sheet
            key={sheet.seg + sheet.e.id}
            seg={sheet.seg}
            e={sheet.e}
            wide={wide}
            onClose={() => setSheet(null)}
            onGo={go}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
