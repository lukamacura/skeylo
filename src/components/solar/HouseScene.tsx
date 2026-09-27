"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import type { CustomerType, ExtraId, RoofType, UsageId } from "@/lib/solar";

/* ------------------------------------------------------------------ */
/*  Scena: jedan objekat koji se menja sa svakim odgovorom              */
/*  Koordinate su u jedinicama crteža (720 široko), tlo je na y = G.    */
/*                                                                      */
/*  Dve stvari vode ceo crtež:                                          */
/*   - mere objekta (širina, visina zida, visina krova), na oprugama    */
/*   - doba dana t: 0 = dan, 0,5 = zalazak, 1 = noć, takođe na opruzi   */
/*  Sve boje se računaju iz t, pa prelaz dan/noć nema nijedan "skok".   */
/* ------------------------------------------------------------------ */

const VB_W = 720;
const VB_H = 440;
/** Visina koju zauzima najviši objekat sa krovom, u jedinicama crteža. */
const CONTENT_H = 330;
const G = 372;
const CX = 352;
const POLE_X = 668;
/** Sokl (podnožje zida). */
const PLINTH = 8;

/* Kritično prigušene opruge: bez odskakanja, samo meko usporavanje. */
const SPRING = { stiffness: 90, damping: 20, mass: 1 };
const SKY_SPRING = { stiffness: 26, damping: 13, mass: 1 };
/** Najviše panela koje crtamo; ostatak nosi brojka u čipu ispod scene. */
const MAX_DRAWN = 48;

export interface HouseSceneProps {
  type: CustomerType;
  area: number;
  floors: 1 | 2 | 3;
  roof: RoofType;
  usage: UsageId;
  extras: ExtraId[];
  panels: number;
  /** 0–1: koliko je račun visok; pali prozore i ubrzava tok iz mreže. */
  billLevel: number;
  /** 0–1: koliko je lokacija sunčana. */
  sunLevel: number;
  /** Na rezultatu sviće: energija teče sa krova, ne iz mreže. */
  solved: boolean;
  /** Dok traje obračun: sviće i svetlosni zrak prelazi preko krova. */
  scanning?: boolean;
  /** Visina (px) zaglavlja i čipova koji leže preko scene; crtež ih zaobilazi. */
  topPad?: number;
  bottomPad?: number;
}

function useSprung(
  target: number,
  still: boolean,
  config: { stiffness: number; damping: number; mass: number } = SPRING,
) {
  const mv = useSpring(target, config);
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (still) mv.jump(target);
    else mv.set(target);
  }, [mv, target, still]);
  useMotionValueEvent(mv, "change", setValue);
  return value;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
/** Tri ključne vrednosti: dan, zalazak, noć. */
const tri = (day: number, dusk: number, night: number, t: number) =>
  t < 0.5 ? lerp(day, dusk, t * 2) : lerp(dusk, night, (t - 0.5) * 2);

/* ------------------------------ Boje ------------------------------ */

type RGB = [number, number, number];
const parsed = new Map<string, RGB>();
function rgb(hex: string): RGB {
  let v = parsed.get(hex);
  if (!v) {
    const n = parseInt(hex.slice(1), 16);
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    parsed.set(hex, v);
  }
  return v;
}
const mixRgb = (a: RGB, b: RGB, t: number): RGB => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
const css = (c: RGB) =>
  `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
/** Boja koja sama prelazi dan → zalazak → noć. */
const tri3 = (day: string, dusk: string, night: string, t: number) =>
  css(
    t < 0.5
      ? mixRgb(rgb(day), rgb(dusk), t * 2)
      : mixRgb(rgb(dusk), rgb(night), (t - 0.5) * 2),
  );

/** Koliko svetla pada na površine: pun dan, topao zalazak, plava noć. */
function ambient(t: number): RGB {
  return [tri(1, 0.88, 0.25, t), tri(1, 0.68, 0.3, t), tri(1, 0.62, 0.45, t)];
}

interface Dims {
  w: number;
  wallH: number;
  rise: number;
}

function targetDims(
  type: CustomerType,
  area: number,
  floors: number,
  roof: RoofType,
): Dims {
  const footprint = area / floors;
  if (type === "fizicko") {
    const t = clamp01((Math.sqrt(footprint) - 4.5) / (20 - 4.5));
    return {
      w: lerp(172, 330, t),
      wallH: 70 + (floors - 1) * 58,
      rise: roof === "kos" ? lerp(70, 86, t) : 10,
    };
  }
  const t = clamp01((Math.sqrt(footprint) - 7) / (71 - 7));
  return {
    w: lerp(244, 400, t),
    wallH: 92 + (floors - 1) * 50,
    rise: roof === "kos" ? 60 : 10,
  };
}

interface PanelBox {
  x: number;
  y: number;
  w: number;
  h: number;
  dim: number;
}

/** Raspored panela na kosom krovu: redovi se pune odozdo, gde je krov najširi. */
function pitchedLayout(n: number, d: Dims): PanelBox[] {
  const top = G - d.wallH - d.rise;
  const inset = d.rise * 0.62;
  const gap = 3;
  const padY = 9;
  for (let rows = 1; rows <= 4; rows++) {
    const ph = (d.rise - padY * 2 - gap * (rows - 1)) / rows;
    const pw = Math.min(30, ph * 0.66);
    const caps: number[] = [];
    for (let r = 0; r < rows; r++) {
      // r = 0 je donji red; širina krova na gornjoj ivici tog reda
      const yTop = top + d.rise - padY - (r + 1) * ph - r * gap;
      const t = (yTop - top) / d.rise;
      const half = lerp(d.w / 2 - inset, d.w / 2 + 12, t) - 12;
      caps.push(Math.max(0, Math.floor((half * 2 + gap) / (pw + gap))));
    }
    const total = caps.reduce((s, c) => s + c, 0);
    if (total < n && rows < 4) continue;
    const boxes: PanelBox[] = [];
    let left = Math.min(n, total);
    for (let r = 0; r < rows && left > 0; r++) {
      // ravnomerno po redovima, ali nikad preko kapaciteta reda
      const want = Math.ceil(left / (rows - r));
      const count = Math.min(caps[r], Math.max(want, left - sum(caps, r + 1)));
      const rowW = count * pw + (count - 1) * gap;
      const y = top + d.rise - padY - (r + 1) * ph - r * gap;
      for (let c = 0; c < count; c++) {
        boxes.push({
          x: CX - rowW / 2 + c * (pw + gap),
          y,
          w: pw,
          h: ph,
          dim: 1,
        });
      }
      left -= count;
    }
    return boxes;
  }
  return [];
}

function sum(a: number[], from: number) {
  let s = 0;
  for (let i = from; i < a.length; i++) s += a[i];
  return s;
}

/** Ravan krov: nagnuti redovi okrenuti ka posmatraču, zadnji redovi tamniji. */
function flatLayout(n: number, d: Dims): PanelBox[] {
  const roofTop = G - d.wallH - d.rise;
  const pw = 22;
  const ph = 15;
  const gap = 5;
  const perRow = Math.max(1, Math.floor((d.w - 28 + gap) / (pw + gap)));
  const rows = Math.min(3, Math.ceil(n / perRow));
  const boxes: PanelBox[] = [];
  let left = Math.min(n, perRow * rows);
  for (let r = 0; r < rows; r++) {
    const count = Math.min(perRow, Math.ceil(left / (rows - r)));
    const rowW = count * pw + (count - 1) * gap;
    for (let c = 0; c < count; c++) {
      boxes.push({
        x: CX - rowW / 2 + c * (pw + gap),
        y: roofTop - ph - 3 - r * 13,
        w: pw,
        h: ph,
        dim: 1 - r * 0.22,
      });
    }
    left -= count;
  }
  // zadnji redovi se crtaju prvi, da ih prednji preklope
  return boxes.reverse();
}

/* ------------------------------------------------------------------ */
/*  Zajednički kontekst crtanja                                         */
/* ------------------------------------------------------------------ */

interface Ctx {
  x0: number;
  x1: number;
  w: number;
  wallTop: number;
  wallH: number;
  floors: number;
  floorH: number;
  rise: number;
  roofTop: number;
  pitch: number;
  roofPath: string;
  slots: number;
  slotW: number;
  doorSlot: number;
  /** 0–1 koliko je mračno; pali svetla. */
  n: number;
  /** Boja površine pod trenutnim svetlom. */
  c: (hex: string) => string;
  /** Površina koja noću sama svetli. */
  glow: (hex: string, lit: string, amount?: number) => string;
  litAt: (floor: number, slot: number) => boolean;
  /** Sitni detalji se crtaju samo kad su dovoljno veliki da se vide. */
  detail: boolean;
}

/** Staklo: noću svetli ili je mračno, danju ogleda nebo. */
function Glass({
  k,
  x,
  y,
  w,
  h,
  lit,
  rx = 1,
}: {
  k: Ctx;
  x: number;
  y: number;
  w: number;
  h: number;
  lit: boolean;
  rx?: number;
}) {
  if (w <= 0 || h <= 0) return null;
  return (
    <>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill={lit ? "#ffd67d" : "#0c1421"}
      />
      {lit && (
        <rect
          x={x}
          y={y + h * 0.55}
          width={w}
          height={h * 0.45}
          rx={rx}
          fill="#ffb74a"
          opacity={0.35}
        />
      )}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill="url(#hs-glass)"
        opacity={1 - k.n * (lit ? 0.95 : 0.8)}
      />
      <path
        d={`M${x + w * 0.12} ${y + h} L${x + w * 0.5} ${y} H${x + w * 0.72} L${x + w * 0.34} ${y + h} Z`}
        fill="#fff"
        opacity={0.2 * (1 - k.n)}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Kuća                                                                */
/* ------------------------------------------------------------------ */

function HouseFacade({ k }: { k: Ctx }) {
  const { x0, x1, w, wallTop, wallH, floors, floorH, c, n, slotW } = k;
  const frame = c("#f4f0e6");
  const trim = c("#d8d1c0");

  const ww = Math.max(14, Math.min(34, slotW - 34));
  const wh = Math.min(42, floorH * 0.56);
  const shutters = slotW - ww >= 38;

  const doorW = Math.min(32, slotW - 24);
  const doorH = Math.min(58, floorH * 0.8);
  const doorX = x0 + k.doorSlot * slotW + (slotW - doorW) / 2;
  const doorTop = G - PLINTH - doorH;

  const windows: React.ReactNode[] = [];
  for (let f = 0; f < floors; f++) {
    for (let s = 0; s < k.slots; s++) {
      if (f === 0 && s === k.doorSlot) continue;
      const lit = k.litAt(f, s);
      const balcony = f === 1 && s === k.doorSlot;
      const h = balcony ? floorH * 0.72 : wh;
      const x = x0 + s * slotW + (slotW - ww) / 2;
      const y = balcony
        ? G - f * floorH - h - 3
        : G - f * floorH - floorH * 0.54 - h / 2;
      windows.push(
        <g key={`${f}-${s}`}>
          {lit && (
            <ellipse
              cx={x + ww / 2}
              cy={y + h / 2}
              rx={ww * 1.25}
              ry={h * 1.05}
              fill="url(#hs-warm)"
              opacity={n * 0.85}
            />
          )}
          {shutters && !balcony && (
            <>
              <rect
                x={x - 12}
                y={y - 2}
                width={9}
                height={h + 4}
                rx={1}
                fill={c("#4d6e66")}
              />
              <rect
                x={x + ww + 3}
                y={y - 2}
                width={9}
                height={h + 4}
                rx={1}
                fill={c("#456259")}
              />
              {k.detail &&
                [0.2, 0.4, 0.6, 0.8].map((q) => (
                  <path
                    key={q}
                    d={`M${x - 11} ${y + h * q}h7M${x + ww + 4} ${y + h * q}h7`}
                    stroke={c("#34504a")}
                    strokeWidth={1}
                  />
                ))}
            </>
          )}
          <rect
            x={x - 3}
            y={y - 3}
            width={ww + 6}
            height={h + 6}
            rx={2}
            fill={frame}
          />
          <Glass k={k} x={x} y={y} w={ww} h={h} lit={lit} />
          {lit && (
            <path
              d={`M${x} ${y}h${ww * 0.34}q0 ${h * 0.5} -${ww * 0.34} ${h * 0.78}ZM${x + ww} ${y}h-${ww * 0.34}q0 ${h * 0.5} ${ww * 0.34} ${h * 0.78}Z`}
              fill="#fff1c9"
              opacity={n * 0.55}
            />
          )}
          <path
            d={`M${x + ww / 2} ${y}V${y + h}M${x} ${y + h * (balcony ? 0.36 : 0.5)}H${x + ww}`}
            stroke={frame}
            strokeWidth={2}
          />
          {!balcony && (
            <>
              <rect
                x={x - 6}
                y={y + h + 3}
                width={ww + 12}
                height={3.5}
                rx={1}
                fill={trim}
              />
              <rect
                x={x - 4}
                y={y + h + 6.5}
                width={ww + 8}
                height={2}
                fill="#000"
                opacity={0.18}
              />
            </>
          )}
        </g>,
      );
    }
  }

  const railX = x0 + k.doorSlot * slotW + 5;
  const railW = slotW - 10;
  const railY = G - floorH - 24;

  return (
    <g>
      {/* Drvo iza kuće */}
      <g transform={`translate(${x1 + 84} ${G})`}>
        <rect x={-4} y={-52} width={8} height={52} rx={2} fill={c("#6a4a33")} />
        <circle cx={-18} cy={-62} r={24} fill={c("#3c7a46")} />
        <circle cx={16} cy={-58} r={26} fill={c("#357040")} />
        <circle cx={0} cy={-88} r={30} fill={c("#47894f")} />
        <circle cx={-8} cy={-96} r={14} fill={c("#5a9c5c")} opacity={0.7} />
      </g>

      {/* Dimnjak */}
      <g opacity={k.pitch}>
        <rect
          x={x1 - k.rise * 0.62 - 40}
          y={k.roofTop - 20 * k.pitch}
          width={18}
          height={44 * k.pitch}
          fill={c("#a1604a")}
        />
        <rect
          x={x1 - k.rise * 0.62 - 43}
          y={k.roofTop - 24 * k.pitch}
          width={24}
          height={5}
          rx={1}
          fill={c("#6f6a66")}
        />
      </g>

      {/* Zid */}
      <rect x={x0} y={wallTop} width={w} height={wallH} fill={c("#ece5d6")} />
      <rect x={x0} y={wallTop} width={w} height={wallH} fill="url(#hs-side)" />
      <rect x={x0} y={wallTop} width={w} height={20} fill="url(#hs-eave)" />
      {Array.from({ length: floors - 1 }, (_, i) => (
        <g key={i}>
          <rect
            x={x0}
            y={G - (i + 1) * floorH - 2}
            width={w}
            height={4}
            fill={trim}
          />
          <rect
            x={x0}
            y={G - (i + 1) * floorH + 2}
            width={w}
            height={3}
            fill="#000"
            opacity={0.12}
          />
        </g>
      ))}
      {/* Sokl */}
      <rect
        x={x0 - 3}
        y={G - PLINTH}
        width={w + 6}
        height={PLINTH}
        fill={c("#8d8a84")}
      />
      <rect
        x={x0 - 3}
        y={G - PLINTH}
        width={w + 6}
        height={1.5}
        fill={c("#a9a6a0")}
      />

      {/* Oluk */}
      <rect
        x={x1 - 9}
        y={wallTop}
        width={4.5}
        height={wallH - PLINTH}
        fill={c("#6b727c")}
      />

      {windows}

      {/* Balkon */}
      {floors >= 2 && (
        <g>
          <rect
            x={railX - 3}
            y={G - floorH - 4}
            width={railW + 6}
            height={5}
            fill={c("#c9c2b2")}
          />
          <rect
            x={railX}
            y={railY}
            width={railW}
            height={2.5}
            rx={1}
            fill={c("#2d323a")}
          />
          {k.detail &&
            Array.from(
              { length: Math.max(2, Math.floor(railW / 6)) },
              (_, i) => (
                <rect
                  key={i}
                  x={
                    railX +
                    1 +
                    (i * (railW - 3)) / (Math.max(2, Math.floor(railW / 6)) - 1)
                  }
                  y={railY + 2}
                  width={1.2}
                  height={18}
                  fill={c("#2d323a")}
                />
              ),
            )}
          {!k.detail && (
            <rect
              x={railX}
              y={railY + 2}
              width={railW}
              height={18}
              fill={c("#2d323a")}
              opacity={0.35}
            />
          )}
        </g>
      )}

      {/* Ulaz */}
      <circle
        cx={doorX + doorW + 12}
        cy={doorTop + 14}
        r={30}
        fill="url(#hs-warm)"
        opacity={n * 0.9}
      />
      <rect
        x={doorX - 3}
        y={doorTop - 3}
        width={doorW + 6}
        height={doorH + 3}
        rx={2}
        fill={frame}
      />
      <rect
        x={doorX}
        y={doorTop}
        width={doorW}
        height={doorH}
        rx={1}
        fill={c("#7b4a2c")}
      />
      <rect
        x={doorX + 4}
        y={doorTop + 5}
        width={doorW - 8}
        height={doorH * 0.3}
        rx={1}
        fill={k.glow("#9fc4e4", "#ffd67d", 0.9)}
        opacity={0.9}
      />
      <rect
        x={doorX + 4}
        y={doorTop + doorH * 0.46}
        width={doorW - 8}
        height={doorH * 0.44}
        rx={1}
        fill="none"
        stroke={c("#5f371f")}
        strokeWidth={1.5}
      />
      <circle
        cx={doorX + doorW - 5}
        cy={doorTop + doorH * 0.56}
        r={1.8}
        fill={c("#e2b64c")}
      />
      {/* Nadstrešnica */}
      <path
        d={`M${doorX - 14} ${doorTop - 6}L${doorX - 6} ${doorTop - 14}H${doorX + doorW + 6}L${doorX + doorW + 14} ${doorTop - 6}Z`}
        fill={c("#9c452d")}
      />
      <rect
        x={doorX - 14}
        y={doorTop - 6}
        width={doorW + 28}
        height={2.5}
        fill={c("#f4f0e6")}
      />
      <rect
        x={doorX - 10}
        y={doorTop - 3.5}
        width={doorW + 20}
        height={5}
        fill="#000"
        opacity={0.16}
      />
      {/* Lampa */}
      <rect
        x={doorX + doorW + 10}
        y={doorTop + 9}
        width={4}
        height={8}
        rx={1}
        fill={k.glow("#3a3f47", "#fff0b8")}
      />
      {/* Stepenice */}
      <rect
        x={doorX - 9}
        y={G - PLINTH}
        width={doorW + 18}
        height={4}
        fill={c("#bdb8ae")}
      />
      <rect
        x={doorX - 15}
        y={G - 4}
        width={doorW + 30}
        height={4}
        fill={c("#aaa59b")}
      />

      {/* Žbunje */}
      <g>
        <circle cx={x0 + 10} cy={G - 6} r={9} fill={c("#3c7a46")} />
        <circle cx={x0 + 22} cy={G - 4} r={7} fill={c("#47894f")} />
        <circle cx={x1 - 24} cy={G - 5} r={8} fill={c("#357040")} />
      </g>

      {/* Krov */}
      <path d={k.roofPath} fill={c("#8f969e")} />
      <g opacity={k.pitch}>
        <path d={k.roofPath} fill="url(#hs-tiles)" />
        <path d={k.roofPath} fill="url(#hs-roofshade)" />
        <rect
          x={x0 - 12 + k.rise * 0.62}
          y={k.roofTop - 2}
          width={Math.max(0, w + 24 - k.rise * 1.24)}
          height={4.5}
          rx={2}
          fill={c("#7e3421")}
        />
      </g>
      <rect
        x={x0 - 14}
        y={wallTop - 3}
        width={w + 28}
        height={4.5}
        rx={1}
        fill={frame}
      />
      <rect
        x={x0 - 15}
        y={wallTop + 1.5}
        width={w + 30}
        height={3}
        rx={1.5}
        fill={c("#6b727c")}
      />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Firma                                                               */
/* ------------------------------------------------------------------ */

function CompanyFacade({ k }: { k: Ctx }) {
  const { x0, w, wallTop, wallH, floors, floorH, c, n, slotW } = k;
  const BAND = 20;
  const steel = c("#2f3640");
  const bays: React.ReactNode[] = [];

  for (let f = 0; f < floors; f++) {
    const base = G - f * floorH - (f === 0 ? PLINTH : 0);
    const top = G - (f + 1) * floorH + (f === floors - 1 ? BAND + 8 : 8);
    const y = top + 4;
    const h = base - (f === 0 ? 0 : 13) - y;
    for (let s = 0; s < k.slots; s++) {
      const x = x0 + s * slotW + 6;
      const bw = slotW - 12;
      const lit = k.litAt(f, s);
      const door = f === 0 && s === k.doorSlot;
      const dock = f === 0 && k.slots >= 4 && s === k.slots - 1;
      if (dock) {
        bays.push(
          <g key={`${f}-${s}`}>
            <rect
              x={x - 2}
              y={y - 2}
              width={bw + 4}
              height={h + 2}
              fill={steel}
            />
            <rect x={x} y={y} width={bw} height={h} fill={c("#aab2bc")} />
            {Array.from({ length: Math.floor(h / 7) }, (_, i) => (
              <rect
                key={i}
                x={x}
                y={y + 6 + i * 7}
                width={bw}
                height={1.2}
                fill={c("#8a929d")}
              />
            ))}
            <rect x={x} y={y} width={bw} height={5} fill="#000" opacity={0.2} />
          </g>,
        );
        continue;
      }
      bays.push(
        <g key={`${f}-${s}`}>
          {lit && (
            <rect
              x={x - 8}
              y={y - 8}
              width={bw + 16}
              height={h + 16}
              rx={10}
              fill="url(#hs-warm)"
              opacity={n * 0.6}
            />
          )}
          <rect
            x={x - 2}
            y={y - 2}
            width={bw + 4}
            height={h + (f === 0 ? 2 : 4)}
            fill={steel}
          />
          <Glass k={k} x={x} y={y} w={bw} h={h} lit={lit} rx={0} />
          <path
            d={
              door
                ? `M${x + bw / 2} ${y}V${y + h}M${x} ${y + h * 0.22}H${x + bw}`
                : `M${x + bw / 2} ${y}V${y + h}`
            }
            stroke={steel}
            strokeWidth={door ? 2.5 : 1.5}
          />
          {door && (
            <>
              <path
                d={`M${x + bw / 2 - 4} ${y + h * 0.5}v${h * 0.22}M${x + bw / 2 + 4} ${y + h * 0.5}v${h * 0.22}`}
                stroke={c("#dfe4ea")}
                strokeWidth={1.6}
                strokeLinecap="round"
              />
              <rect
                x={x - 10}
                y={y - 8}
                width={bw + 20}
                height={5}
                rx={1}
                fill={steel}
              />
              <rect
                x={x - 6}
                y={y - 3}
                width={bw + 12}
                height={5}
                fill="#000"
                opacity={0.2}
              />
            </>
          )}
        </g>,
      );
    }
  }

  return (
    <g>
      {/* Fasadni paneli */}
      <rect x={x0} y={wallTop} width={w} height={wallH} fill={c("#d3dae2")} />
      <rect x={x0} y={wallTop} width={w} height={wallH} fill="url(#hs-clad)" />
      <rect x={x0} y={wallTop} width={w} height={wallH} fill="url(#hs-side)" />
      {Array.from({ length: floors - 1 }, (_, i) => (
        <rect
          key={i}
          x={x0}
          y={G - (i + 1) * floorH - 1}
          width={w}
          height={2}
          fill={c("#aab3be")}
        />
      ))}
      {/* Atika sa natpisom */}
      <rect x={x0} y={wallTop} width={w} height={BAND} fill={steel} />
      <rect
        x={x0}
        y={wallTop + BAND}
        width={w}
        height={2.5}
        fill={k.glow("#ffc53d", "#ffd977", 0.6)}
      />
      <rect
        x={x0}
        y={wallTop + BAND + 2.5}
        width={w}
        height={8}
        fill="url(#hs-eave)"
      />
      <ellipse
        cx={CX}
        cy={wallTop + BAND / 2}
        rx={70}
        ry={20}
        fill="url(#hs-warm)"
        opacity={n * 0.5}
      />
      <text
        x={CX}
        y={wallTop + BAND / 2 + 3.6}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        letterSpacing={2.4}
        fill={k.glow("#eef2f6", "#fff3c9")}
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        VAŠA FIRMA
      </text>
      {/* Sokl */}
      <rect
        x={x0 - 2}
        y={G - PLINTH}
        width={w + 4}
        height={PLINTH}
        fill={c("#4a5059")}
      />

      {bays}

      {/* Krov: ravan sa atikom ili limeni na falc */}
      <path d={k.roofPath} fill={c("#9aa1a9")} />
      <g opacity={k.pitch}>
        <path d={k.roofPath} fill={c("#77828f")} />
        <path d={k.roofPath} fill="url(#hs-seam)" />
        <path d={k.roofPath} fill="url(#hs-roofshade)" />
      </g>
      <rect
        x={x0 - 13}
        y={wallTop - 3}
        width={w + 26}
        height={4}
        rx={1}
        fill={c("#e3e7ec")}
      />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Nebo                                                                */
/* ------------------------------------------------------------------ */

const Sky = memo(function Sky({
  t,
  vbX,
  vbY,
  vbW,
  skyHigh,
  sunLevel,
  still,
}: {
  t: number;
  vbX: number;
  vbY: number;
  vbW: number;
  skyHigh: number;
  sunLevel: number;
  still: boolean;
}) {
  const sunX = tri(596, 606, 606, t);
  const sunY = tri(lerp(skyHigh, G, 0.1), G - 112, G + 110, t);
  const sunScale = lerp(0.85, 1.18, sunLevel) * tri(1, 1.25, 1.25, t);
  const moonUp = smooth(0.55, 1, t);
  const moonY = lerp(G + 60, lerp(skyHigh, G, 0.16), moonUp);
  const stars = smooth(0.45, 0.95, t);
  const clouds = tri(0.92, 0.7, 0.16, t) * lerp(1, 0.55, sunLevel);
  const cloudFill = tri3("#ffffff", "#ffc2a3", "#23304a", t);

  return (
    <g>
      <defs>
        <linearGradient
          id="hs-sky"
          gradientUnits="userSpaceOnUse"
          x1={0}
          y1={vbY}
          x2={0}
          y2={G}
        >
          <stop
            offset="0"
            stopColor={tri3("#1f5fb4", "#1d2352", "#05080f", t)}
          />
          <stop
            offset="0.55"
            stopColor={tri3("#4f97dc", "#6f3f74", "#0a1222", t)}
          />
          <stop
            offset="0.85"
            stopColor={tri3("#8fc4ee", "#e2745c", "#11203a", t)}
          />
          <stop
            offset="1"
            stopColor={tri3("#bfe0f7", "#ffb066", "#182a47", t)}
          />
        </linearGradient>
        <radialGradient id="hs-sunglow">
          <stop
            offset="0"
            stopColor={tri3("#fff2b0", "#ff9d4d", "#ff7a3a", t)}
            stopOpacity={0.6}
          />
          <stop
            offset="0.5"
            stopColor={tri3("#ffe28a", "#ff8a3a", "#ff7a3a", t)}
            stopOpacity={0.14}
          />
          <stop offset="1" stopColor="#ffb040" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="hs-sun">
          <stop
            offset="0"
            stopColor={tri3("#fffbe6", "#ffe0a0", "#ffb070", t)}
          />
          <stop
            offset="0.6"
            stopColor={tri3("#ffd84d", "#ff9a3c", "#ff6a30", t)}
          />
          <stop
            offset="1"
            stopColor={tri3("#ffb31a", "#ff6f2e", "#e04a28", t)}
          />
        </radialGradient>
        <radialGradient id="hs-moonglow">
          <stop offset="0" stopColor="#cfe0ff" stopOpacity={0.35} />
          <stop offset="1" stopColor="#cfe0ff" stopOpacity={0} />
        </radialGradient>
      </defs>

      <rect
        x={vbX}
        y={vbY - 2}
        width={vbW}
        height={G - vbY + 4}
        fill="url(#hs-sky)"
      />

      {stars > 0.01 && (
        <g opacity={stars}>
          {STARS.map(([fx, fy, r], i) =>
            i % 3 === 0 && !still ? (
              <motion.circle
                key={i}
                cx={vbX + fx * vbW}
                cy={lerp(vbY, G - 90, fy)}
                r={r}
                fill="#dbe7ff"
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{
                  duration: 2.4 + (i % 5) * 0.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ) : (
              <circle
                key={i}
                cx={vbX + fx * vbW}
                cy={lerp(vbY, G - 90, fy)}
                r={r}
                fill="#dbe7ff"
              />
            ),
          )}
        </g>
      )}

      {/* Mesec */}
      {moonUp > 0.01 && (
        <g
          transform={`translate(${vbX + vbW * 0.2} ${moonY})`}
          opacity={moonUp}
        >
          <circle r={70} fill="url(#hs-moonglow)" />
          <circle r={20} fill="#eef3ff" />
          <circle cx={-6} cy={-5} r={4.5} fill="#cfd9ee" />
          <circle cx={7} cy={4} r={3} fill="#cfd9ee" />
          <circle cx={-2} cy={9} r={2} fill="#d6dff0" />
        </g>
      )}

      {/* Sunce */}
      <g transform={`translate(${sunX} ${sunY}) scale(${sunScale})`}>
        <circle r={tri(96, 150, 150, t)} fill="url(#hs-sunglow)" />
        <motion.g
          opacity={clamp01(1 - t * 2.4)}
          animate={still ? undefined : { rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <rect
              key={i}
              x={-1.5}
              y={-54}
              width={3}
              height={i % 2 ? 9 : 15}
              rx={1.5}
              fill="#ffe27a"
              transform={`rotate(${i * 30})`}
            />
          ))}
        </motion.g>
        <circle r={30} fill="url(#hs-sun)" />
      </g>

      {/* Oblaci */}
      <g opacity={clouds}>
        {CLOUDS.map(([fx, fy, sc, dur], i) => (
          <motion.g
            key={i}
            animate={still ? undefined : { x: [0, 26 * sc, 0] }}
            transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
          >
            <g
              transform={`translate(${vbX + fx * vbW} ${lerp(skyHigh, G - 120, fy)}) scale(${sc})`}
              fill={cloudFill}
            >
              <ellipse cx={0} cy={0} rx={34} ry={11} />
              <ellipse cx={-14} cy={-8} rx={16} ry={11} />
              <ellipse cx={8} cy={-12} rx={20} ry={14} />
              <ellipse cx={26} cy={-4} rx={14} ry={9} />
            </g>
          </motion.g>
        ))}
      </g>
    </g>
  );
});

/* ------------------------------------------------------------------ */
/*  Scena                                                               */
/* ------------------------------------------------------------------ */

export default function HouseScene(props: HouseSceneProps) {
  const { type, area, floors, roof, usage, extras, panels, solved } = props;
  const still = useReducedMotion() ?? false;

  const target = useMemo(
    () => targetDims(type, area, floors, roof),
    [type, area, floors, roof],
  );
  const w = useSprung(target.w, still);
  const wallH = useSprung(target.wallH, still);
  const rise = useSprung(target.rise, still);

  // Doba dana prati odgovor o navikama; na rezultatu sviće.
  const timeTarget =
    solved || props.scanning
      ? 0
      : { danju: 0, ravnomerno: 0.5, uvece: 1 }[usage];
  const t = clamp01(useSprung(timeTarget, still, SKY_SPRING));
  const n = smooth(0.15, 0.78, t);

  const x0 = CX - w / 2;
  const x1 = CX + w / 2;
  const wallTop = G - wallH;
  const roofTop = wallTop - rise;
  const inset = rise * 0.62;
  /** 1 = kos krov, 0 = ravan; vodi pretapanje dok se krov spušta. */
  const pitch = clamp01((rise - 10) / 50);
  const roofPath = `M${x0 - 12} ${wallTop} L${x0 - 12 + inset + 12 * (1 - pitch)} ${roofTop} L${
    x1 + 12 - inset - 12 * (1 - pitch)
  } ${roofTop} L${x1 + 12} ${wallTop} Z`;

  const drawn = Math.min(panels, MAX_DRAWN);
  const boxes = useMemo(
    () =>
      roof === "kos" ? pitchedLayout(drawn, target) : flatLayout(drawn, target),
    [roof, drawn, target],
  );

  const business = type === "pravno";

  /* Kadar prati oblik kontejnera: širina crteža je stalna, a nebo i tlo se
     produžavaju, pa scena ispuni i uspravnu karticu i nisku traku na telefonu. */
  const frame = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: VB_W, h: VB_H });
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setBox({ w: e.contentRect.width, h: e.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const topPad = props.topPad ?? 0;
  const bottomPad = props.bottomPad ?? 0;
  const zoom = Math.max(
    0.2,
    Math.min(box.w / VB_W, (box.h - topPad - bottomPad) / CONTENT_H),
  );
  const vbW = box.w / zoom;
  const vbH = box.h / zoom;
  const vbX = VB_W / 2 - vbW / 2;
  const vbY = G + 20 + bottomPad / zoom - vbH;
  const skyHigh = vbY + topPad / zoom + 56;

  const amb = ambient(t);
  const c = (hex: string) => {
    const v = rgb(hex);
    return css([v[0] * amb[0], v[1] * amb[1], v[2] * amb[2]]);
  };
  const glow = (hex: string, lit: string, amount = 1) => {
    const v = rgb(hex);
    return css(
      mixRgb(
        [v[0] * amb[0], v[1] * amb[1], v[2] * amb[2]],
        rgb(lit),
        n * amount,
      ),
    );
  };

  const slots = Math.max(2, Math.round(target.w / (business ? 84 : 80)));
  const k: Ctx = {
    x0,
    x1,
    w,
    wallTop,
    wallH,
    floors,
    floorH: wallH / floors,
    rise,
    roofTop,
    pitch,
    roofPath,
    slots,
    slotW: w / slots,
    doorSlot: Math.floor(slots / 2),
    n,
    c,
    glow,
    // stabilan pseudo-slučajan redosled paljenja; viši račun = više svetla
    litAt: (f, s) =>
      ((f * 7 + s * 13 + 3) % 10) / 10 < 0.3 + props.billLevel * 0.7,
    detail: zoom > 0.78,
  };

  const flowSpeed = lerp(2.6, 0.9, props.billLevel);
  const sunX = tri(596, 606, 606, t);
  const sunY = tri(lerp(skyHigh, G, 0.1), G - 112, G + 110, t);

  // Žica: od vrha stuba do ugla fasade, blago ulegnuta.
  const wireEnd = { x: x1 - 2, y: wallTop + 12 };
  const wire = `M ${POLE_X} ${G - 150} Q ${(POLE_X + wireEnd.x) / 2} ${
    (G - 150 + wireEnd.y) / 2 + 26
  } ${wireEnd.x} ${wireEnd.y}`;
  const roofMid = { x: CX, y: roofTop + rise * 0.5 };
  const panelSpring = still
    ? { duration: 0 }
    : { type: "spring" as const, ...SPRING };

  return (
    <div ref={frame} className="h-full w-full">
      <svg
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        className="block h-full w-full"
        role="img"
        aria-label={`Ilustracija objekta sa ${panels} solarnih panela`}
      >
        <defs>
          <radialGradient id="hs-warm">
            <stop offset="0" stopColor="#ffcf70" stopOpacity={0.55} />
            <stop offset="1" stopColor="#ffcf70" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="hs-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c("#a9d0f0")} />
            <stop offset="1" stopColor={c("#4f7fb0")} />
          </linearGradient>
          <linearGradient id="hs-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity={0.06} />
            <stop offset="0.5" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="hs-eave" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity={0.34} />
            <stop offset="1" stopColor="#000" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="hs-roofshade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.1} />
            <stop offset="1" stopColor="#000" stopOpacity={0.22} />
          </linearGradient>
          <linearGradient id="hs-ground" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0"
              stopColor={tri3("#5c9c52", "#3d4a36", "#101b17", t)}
            />
            <stop
              offset="1"
              stopColor={tri3("#2f6b3a", "#1e2a24", "#080c10", t)}
            />
          </linearGradient>
          <pattern
            id="hs-tiles"
            patternUnits="userSpaceOnUse"
            width={16}
            height={20}
          >
            <rect width={16} height={20} fill={c("#b8573b")} />
            <rect y={8} width={16} height={2} fill={c("#8c3d28")} />
            <rect y={18} width={16} height={2} fill={c("#8c3d28")} />
            <rect width={16} height={1.2} fill={c("#cf7253")} />
            <rect y={10} width={16} height={1.2} fill={c("#cf7253")} />
            <rect x={0} y={0} width={1} height={8} fill={c("#9a4730")} />
            <rect x={8} y={10} width={1} height={8} fill={c("#9a4730")} />
          </pattern>
          <pattern
            id="hs-seam"
            patternUnits="userSpaceOnUse"
            width={14}
            height={10}
            x={CX}
          >
            <rect width={1.4} height={10} fill={c("#56606c")} />
            <rect x={1.4} width={1} height={10} fill={c("#94a0ad")} />
          </pattern>
          <pattern
            id="hs-clad"
            patternUnits="userSpaceOnUse"
            width={28}
            height={10}
            x={CX}
          >
            <rect width={1.2} height={10} fill={c("#aab3be")} />
            <rect x={1.2} width={1} height={10} fill={c("#eef1f5")} />
          </pattern>
          <pattern
            id="hs-panel"
            width="1"
            height="1"
            patternContentUnits="objectBoundingBox"
          >
            <rect width="1" height="1" fill={c("#c9d2dc")} />
            <rect
              x="0.05"
              y="0.035"
              width="0.9"
              height="0.93"
              fill={tri3("#1c4c96", "#2a3f7a", "#0b1730", t)}
            />
            <path
              d="M0.05 0.035H0.95V0.5Z"
              fill="#9ccaff"
              opacity={0.22 * (1 - n)}
            />
            <path
              d="M0.5 0.035V0.965M0.05 0.27H0.95M0.05 0.5H0.95M0.05 0.73H0.95"
              stroke={tri3("#8fbaf2", "#7f8fc4", "#2a3c66", t)}
              strokeOpacity={0.6}
              strokeWidth="0.025"
            />
          </pattern>
          <linearGradient id="hs-scan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffe08a" stopOpacity={0} />
            <stop offset="0.5" stopColor="#fff3c4" stopOpacity={0.75} />
            <stop offset="1" stopColor="#ffe08a" stopOpacity={0} />
          </linearGradient>
          <clipPath id="hs-roof-clip">
            <rect
              x={x0 - 12}
              y={roofTop - 50}
              width={w + 24}
              height={rise + 50}
            />
          </clipPath>
        </defs>

        <Sky
          t={t}
          vbX={vbX}
          vbY={vbY}
          vbW={vbW}
          skyHigh={skyHigh}
          sunLevel={props.sunLevel}
          still={still}
        />

        {/* Brda i tlo */}
        <path
          d={`M-2000 ${G - 50} H0 Q 90 ${G - 96} 210 ${G - 62} T 430 ${G - 74} T 640 ${G - 92} T 720 ${G - 80} H2720 V${G} H-2000 Z`}
          fill={tri3("#6fa98f", "#5b4a6e", "#0d1623", t)}
        />
        <path
          d={`M-2000 ${G - 30} H0 Q 140 ${G - 58} 280 ${G - 30} T 520 ${G - 36} T 720 ${G - 48} H2720 V${G} H-2000 Z`}
          fill={tri3("#4f9160", "#3d3f52", "#0a111a", t)}
        />
        <rect
          x={-2000}
          y={G}
          width={4720}
          height={1200}
          fill="url(#hs-ground)"
        />
        <rect
          x={-2000}
          y={G}
          width={4720}
          height={1.5}
          fill={tri3("#7ab86a", "#55604a", "#1c2a25", t)}
        />

        {/* Stub i žica ka mreži */}
        <g>
          <rect
            x={POLE_X - 3}
            y={G - 160}
            width={6}
            height={160}
            fill={c("#5b5148")}
          />
          <rect
            x={POLE_X - 22}
            y={G - 152}
            width={44}
            height={4}
            rx={2}
            fill={c("#5b5148")}
          />
          <rect
            x={POLE_X - 16}
            y={G - 136}
            width={32}
            height={4}
            rx={2}
            fill={c("#5b5148")}
          />
          <path d={wire} fill="none" stroke={c("#2f333a")} strokeWidth={1.6} />
          <motion.path
            key={solved ? "out" : "in"}
            d={wire}
            fill="none"
            stroke={solved ? "#3ddc97" : "#ff9f1a"}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray="1 17"
            initial={{ opacity: 0 }}
            animate={
              still
                ? { opacity: 0.95 }
                : {
                    opacity: 0.95,
                    // iz mreže ka kući dok se troši, sa krova ka mreži na rezultatu
                    strokeDashoffset: solved ? [0, 36] : [0, -36],
                  }
            }
            transition={{
              opacity: { duration: 0.6 },
              strokeDashoffset: {
                duration: solved ? 1.6 : flowSpeed,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          />
        </g>

        {/* Zraci ka krovu — kad ima panela i kad je obračun gotov */}
        <AnimatePresence>
          {solved && panels > 0 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, delay: 0.5 }}
            >
              {[-0.32, 0, 0.32].map((q) => (
                <motion.line
                  key={q}
                  x1={sunX - 34}
                  y1={sunY + 22}
                  x2={roofMid.x + q * w * 0.7}
                  y2={roofMid.y - 8}
                  stroke="#fff0a8"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeDasharray="2 14"
                  opacity={0.9}
                  animate={still ? undefined : { strokeDashoffset: [0, -32] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Senka objekta i svetlo iz prozora na tlu */}
        <ellipse
          cx={CX}
          cy={G + 7}
          rx={w / 2 + 30}
          ry={8}
          fill="#000"
          opacity={0.3}
        />
        <ellipse
          cx={CX}
          cy={G + 12}
          rx={w / 2 + 10}
          ry={11}
          fill="url(#hs-warm)"
          opacity={n * (0.35 + props.billLevel * 0.5)}
        />

        {/* Električni auto */}
        <AnimatePresence>
          {extras.includes("auto") && (
            <motion.g
              key="auto"
              initial={{ x: -170, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -170, opacity: 0 }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            >
              <path
                d={`M${x0} ${G - 40} C ${x0 - 22} ${G - 40}, ${x0 - 30} ${G - 8}, ${x0 - 50} ${G - 22}`}
                fill="none"
                stroke="#3ddc97"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <g transform={`translate(${x0 - 152} ${G - 46})`}>
                <ellipse
                  cx={55}
                  cy={47}
                  rx={54}
                  ry={4}
                  fill="#000"
                  opacity={0.3}
                />
                <path
                  d="M6 30 Q6 20 18 18 L30 5 Q33 2 38 2 H70 Q76 2 80 6 L92 18 Q104 20 104 30 V36 Q104 40 100 40 H10 Q6 40 6 36 Z"
                  fill={c("#e4e9f0")}
                />
                <path
                  d="M6 31 H104 V36 Q104 40 100 40 H10 Q6 40 6 36 Z"
                  fill={c("#b9c2ce")}
                />
                <path
                  d="M34 8 H52 V18 H26 Z M57 8 H70 Q73 8 75 10 L83 18 H57 Z"
                  fill={c("#35506e")}
                />
                <circle cx={30} cy={40} r={9} fill={c("#1c1f25")} />
                <circle cx={30} cy={40} r={4.5} fill={c("#aab2bd")} />
                <circle cx={82} cy={40} r={9} fill={c("#1c1f25")} />
                <circle cx={82} cy={40} r={4.5} fill={c("#aab2bd")} />
                <rect
                  x={7}
                  y={23}
                  width={5}
                  height={4}
                  rx={2}
                  fill={glow("#d94c3d", "#ff5a48")}
                />
                <rect
                  x={97}
                  y={22}
                  width={6}
                  height={4}
                  rx={2}
                  fill="#3ddc97"
                />
              </g>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Toplotna pumpa */}
        <AnimatePresence>
          {extras.includes("pumpa") && (
            <motion.g
              key="pumpa"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={panelSpring}
            >
              <g transform={`translate(${x0 - 46} ${G - 38})`}>
                <rect width={40} height={34} rx={4} fill={c("#e3e8ee")} />
                <rect y={26} width={40} height={8} rx={4} fill={c("#c5ccd6")} />
                <circle cx={20} cy={16} r={12} fill={c("#232b38")} />
                <g transform="translate(20 16)">
                  <motion.g
                    animate={still ? undefined : { rotate: 360 }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <path
                      d="M0 -9 V9 M-9 0 H9"
                      stroke={c("#9fb0c8")}
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                  </motion.g>
                </g>
                <rect x={4} y={34} width={5} height={4} fill={c("#4b5668")} />
                <rect x={31} y={34} width={5} height={4} fill={c("#4b5668")} />
              </g>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Objekat: kuća i firma se pretapaju dok se mere menjaju */}
        <AnimatePresence initial={false}>
          <motion.g
            key={type}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: still ? 0 : 0.7, ease: "easeInOut" }}
          >
            {business ? <CompanyFacade k={k} /> : <HouseFacade k={k} />}
          </motion.g>
        </AnimatePresence>

        {/* Nosač redova na ravnom krovu */}
        <rect
          x={x0 + 8}
          y={roofTop - 3}
          width={Math.max(0, w - 16)}
          height={3}
          rx={1}
          fill={c("#4b525c")}
          opacity={(1 - pitch) * (boxes.length ? 1 : 0)}
        />

        {/* Paneli */}
        <AnimatePresence>
          {boxes.map((b, i) => (
            <motion.rect
              key={i}
              rx={1.2}
              fill="url(#hs-panel)"
              initial={{
                attrX: b.x,
                attrY: b.y - 30,
                width: b.w,
                height: b.h,
                opacity: 0,
              }}
              animate={{
                attrX: b.x,
                attrY: b.y,
                width: b.w,
                height: b.h,
                opacity: b.dim,
              }}
              exit={{ opacity: 0, attrY: b.y - 20 }}
              transition={{
                ...panelSpring,
                delay: still ? 0 : Math.min(i, 24) * 0.014,
                opacity: { duration: 0.35, delay: Math.min(i, 24) * 0.014 },
              }}
            />
          ))}
        </AnimatePresence>

        {/* Zrak koji "meri" krov dok traje obračun */}
        <AnimatePresence>
          {props.scanning && !still && (
            <motion.rect
              key="scan"
              y={roofTop - 50}
              width={26}
              height={rise + 70}
              fill="url(#hs-scan)"
              initial={{ attrX: x0 - 40, opacity: 0 }}
              animate={{ attrX: [x0 - 40, x1 + 14, x0 - 40], opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                attrX: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.4 },
              }}
              clipPath="url(#hs-roof-clip)"
            />
          )}
        </AnimatePresence>

        {/* Odsjaj koji pređe preko panela kad svane */}
        <AnimatePresence>
          {solved && panels > 0 && !still && (
            <motion.rect
              key="sheen"
              y={roofTop - 50}
              width={54}
              height={rise + 70}
              fill="#fff"
              opacity={0.2}
              initial={{ attrX: x0 - 70 }}
              animate={{ attrX: x1 + 20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, delay: 1.1, ease: "easeInOut" }}
              clipPath="url(#hs-roof-clip)"
            />
          )}
        </AnimatePresence>

        {/* Baterija */}
        <AnimatePresence>
          {extras.includes("baterija") && (
            <motion.g
              key="bat"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={panelSpring}
            >
              <g transform={`translate(${x1 + 12} ${G - 60})`}>
                <rect width={26} height={60} rx={5} fill={c("#eef1f5")} />
                <rect x={20} width={6} height={60} rx={3} fill={c("#cfd6de")} />
                <rect
                  x={5}
                  y={7}
                  width={13}
                  height={3}
                  rx={1.5}
                  fill={c("#9aa7b8")}
                />
                {[0, 1, 2, 3].map((i) => (
                  <motion.rect
                    key={i}
                    x={5}
                    y={46 - i * 8}
                    width={13}
                    height={5}
                    rx={1.5}
                    fill="#3ddc97"
                    animate={
                      still ? undefined : { opacity: [0.25, 1, 1, 0.25] }
                    }
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      delay: i * 0.3,
                      times: [0, 0.2, 0.8, 1],
                    }}
                  />
                ))}
              </g>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}

/** Zvezde u udelima kadra (x, y, poluprečnik), da prate svaki oblik scene. */
const STARS: [number, number, number][] = [
  [0.06, 0.12, 1.3],
  [0.16, 0.3, 1],
  [0.24, 0.06, 1.5],
  [0.34, 0.22, 0.9],
  [0.45, 0.08, 1.2],
  [0.56, 0.18, 1],
  [0.65, 0.05, 1.4],
  [0.12, 0.56, 0.9],
  [0.3, 0.46, 1.1],
  [0.7, 0.42, 0.9],
  [0.95, 0.1, 1.2],
  [0.04, 0.78, 1],
  [0.5, 0.62, 0.9],
  [0.86, 0.66, 1],
  [0.4, 0.36, 1.2],
  [0.78, 0.22, 1.1],
  [0.9, 0.4, 0.9],
  [0.2, 0.7, 1],
];

/** Oblaci: x i y u udelima neba, veličina, trajanje jednog prolaza (s). */
const CLOUDS: [number, number, number, number][] = [
  [0.14, 0.18, 1.1, 46],
  [0.46, 0.05, 0.8, 58],
  [0.3, 0.62, 0.7, 52],
];
