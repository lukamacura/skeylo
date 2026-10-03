"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  lightCount,
  meters,
  type AccessId,
  type AttractionId,
  type CoverId,
  type LightId,
  type PoolType,
} from "@/lib/pool";
import { clamp01, smooth } from "@/components/solar/scene/geometry";
import {
  ambient,
  css,
  mixRgb,
  rgb,
  SKY_SPRING,
  SPRING,
  tri3,
  useSprung,
  type Frame,
} from "@/components/solar/scene/light";
import Sky from "@/components/solar/scene/Sky";

/* ------------------------------------------------------------------ */
/*  Scena bazena: dvorište presečeno po prednjoj ivici bazena           */
/*                                                                      */
/*  Gornji deo je dvorište viđeno blago odozgo (širina bazena ide u     */
/*  dubinu slike), a ispod linije tla je presek: zemlja, betonska       */
/*  školjka, voda i dubina. Zato dubina sa klizača odmah "potone".      */
/*  Mere su na oprugama, kao kod solarne scene, pa bazen raste meko.    */
/* ------------------------------------------------------------------ */

const G = 372;
const CX = 352;
/** Dubina dvorišta iza bazena (od preseka do horizonta). */
const LAND = 74;
/** Piksela po metru: dužina, dubina vode i (skraćena) širina. */
const S = 30;
const DS = 46;
const WS = 7;
/** Koliko se zadnja ivica suzi zbog perspektive. */
const VANISH = 520;
const MAX_ZOOM = 2.2;
const Q = 0.2;

export type PoolFocus = "type" | "dims" | "equip" | "site";

export interface PoolSceneProps {
  type: PoolType;
  length: number;
  width: number;
  depth: number;
  heat: boolean;
  salt: boolean;
  cover: CoverId;
  attractions: AttractionId[];
  light: LightId;
  access: AccessId;
  focus: PoolFocus;
  scanning?: boolean;
  solved: boolean;
  topPad?: number;
  bottomPad?: number;
}

type Pt = [number, number];
const pts = (p: Pt[]) =>
  "M" + p.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z";

/** Talasasta linija: "t" ponavlja odraz prethodnog luka. */
function wavy(xa: number, xb: number, y: number, amp: number, period: number) {
  const n = Math.ceil((xb - xa) / (period / 2));
  return (
    `M${xa.toFixed(1)} ${y.toFixed(1)}q${period / 4} ${-amp} ${period / 2} 0` +
    `t${period / 2} 0`.repeat(Math.max(0, n - 1))
  );
}

function PoolScene(props: PoolSceneProps) {
  const { type, cover, light, attractions, heat, salt, solved, focus } = props;
  const scanning = props.scanning ?? false;
  const still = useReducedMotion() ?? false;
  const indoor = type === "unutrasnji";
  const overflow = type === "preliv";

  const Lp = useSprung(props.length * S, still, SPRING, Q);
  const Wp = useSprung(props.width * WS, still, SPRING, Q);
  const Dp = useSprung(props.depth * DS, still, SPRING, Q);
  const gap = useSprung(overflow ? 0 : 6, still, SPRING, 0.05);
  const gutter = useSprung(overflow ? 1 : 0, still, SPRING, 0.01);

  // Prekrivka se na rezultatu povuče da se vidi voda; vrsta ostaje dok se ne skupi.
  const lastCover = useRef<Exclude<CoverId, "nema">>("termo");
  if (cover !== "nema") lastCover.current = cover;
  const coverK = useSprung(
    cover === "nema" ? 0 : solved || scanning ? 0.3 : 0.62,
    still,
    SPRING,
    0.004,
  );

  const lit = light !== "nema";
  const showSite = focus === "site" && !scanning && !solved;
  const machine = showSite && props.access === "da";
  const fence = showSite && props.access === "ne";
  const unsure = showSite && props.access === "nesiguran";

  // Rasveta se vidi tek u sumrak: kad je izabrana, scena pređe u veče.
  const timeTarget = solved
    ? lit
      ? 0.8
      : 0.08
    : scanning
      ? 0
      : focus === "equip" && lit
        ? 0.86
        : 0;
  const t = clamp01(useSprung(timeTarget, still, SKY_SPRING, 1 / 96));
  const n = smooth(0.15, 0.78, t);

  /* ------------------------------ Kadar ----------------------------- */

  const rightRoom = useSprung(machine || fence ? 168 : 78, still, SPRING, Q);
  const roofH = useSprung(indoor ? 128 : 0, still, SPRING, Q);

  const holder = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 720, h: 440 });
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setBox({ w: e.contentRect.width, h: e.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const topPad = props.topPad ?? 0;
  const bottomPad = props.bottomPad ?? 0;

  const x0 = CX - Lp / 2;
  const x1 = CX + Lp / 2;
  const left = x0 - 98;
  const right = x1 + rightRoom;
  const top = G - Math.max(LAND + 26, roofH + 18);
  // kota dužine ispod preseka traži malo više mesta
  const dimRoom = useSprung(
    focus === "dims" || scanning ? 50 : 34,
    still,
    SPRING,
    Q,
  );
  const bottom = G + Dp + dimRoom;
  const zoom = Math.max(
    0.25,
    Math.min(
      MAX_ZOOM,
      box.w / (right - left),
      (box.h - topPad - bottomPad) / (bottom - top),
    ),
  );
  const vbW = box.w / zoom;
  const vbH = box.h / zoom;
  const vbX = (left + right) / 2 - vbW / 2;
  const vbY = bottom + bottomPad / zoom - vbH;
  const viewBox = `${vbX.toFixed(2)} ${vbY.toFixed(2)} ${vbW.toFixed(2)} ${vbH.toFixed(2)}`;
  const ks = Math.max(0.6, Math.min(1.25, box.w / 640, box.h / 420));
  const frame: Frame = useMemo(
    () => ({
      w: box.w,
      h: box.h,
      zoom,
      ks,
      top: topPad,
      ground: (G - vbY) * zoom,
      land: (G - LAND - vbY) * zoom,
    }),
    [box.w, box.h, zoom, ks, topPad, vbY],
  );

  /* ------------------------------ Svetlo ---------------------------- */

  const amb = ambient(t);
  const c = (hex: string) => {
    const v = rgb(hex);
    return css([v[0] * amb[0], v[1] * amb[1], v[2] * amb[2]]);
  };
  const glow = (hex: string, litHex: string, k: number) => {
    const v = rgb(hex);
    return css(
      mixRgb([v[0] * amb[0], v[1] * amb[1], v[2] * amb[2]], rgb(litHex), k),
    );
  };
  const lightHex = light === "rgb" ? "#7f9bff" : "#9feaff";
  const waterLit = lit ? n * 0.55 : 0;

  /* ---------------------------- Geometrija -------------------------- */

  /** Tačka u dvorištu: xo od sredine (na preseku), d u dubinu slike. */
  const P = (xo: number, d: number, dy = 0): Pt => [
    CX + xo * (1 - d / VANISH),
    G - d + dy,
  ];
  const half = Lp / 2;
  const opening = [P(-half, 0), P(half, 0), P(half, Wp), P(-half, Wp)];
  const waterTop = opening.map(([x, y]) => [x, y + gap] as Pt);
  const deckOut = [
    P(-half - 26, 0),
    P(half + 26, 0),
    P(half + 26, Wp + 16),
    P(-half - 26, Wp + 16),
  ];
  const gutterOut = [
    P(-half - 8, 0),
    P(half + 8, 0),
    P(half + 8, Wp + 6),
    P(-half - 8, Wp + 6),
  ];

  // Prekrivka pokriva desni deo vode, od u do kraja.
  const cu = half - Lp * coverK;
  const coverPoly = [
    P(cu, 0, gap),
    P(half, 0, gap),
    P(half, Wp, gap),
    P(cu, Wp, gap),
  ];

  const waterY = G + gap;
  const waterH = Math.max(0, Dp - gap);
  const sh = Math.min(0.25 * DS, (Dp - 10) / 4);
  const sw = 0.42 * S;
  const stairs = pts([
    [x0, G + sh],
    [x0 + sw, G + sh],
    [x0 + sw, G + 2 * sh],
    [x0 + 2 * sw, G + 2 * sh],
    [x0 + 2 * sw, G + 3 * sh],
    [x0 + 3 * sw, G + 3 * sh],
    [x0 + 3 * sw, G + Dp],
    [x0, G + Dp],
  ]);

  const nLights = lit ? lightCount(props.length) : 0;
  const jets = attractions.includes("hidromasaza");
  const counter = attractions.includes("protivstrujno");

  // šaht sa filtracijom levo od bazena
  const shX = x0 - 84;
  const shY = G + 8;
  const pipeY = G + Math.max(14, Dp * 0.42);

  const fs = Math.min(16, Math.max(8, 11 / zoom));
  const dimStroke = 1 / zoom;
  const showDims = focus === "dims" || scanning;

  const transition = still
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 160, damping: 18 };

  return (
    <div ref={holder} className="relative h-full w-full">
      <Sky timeTarget={timeTarget} frame={frame} sunLevel={0.7} still={still} />

      <svg
        viewBox={viewBox}
        className="absolute inset-0 block h-full w-full"
        role="img"
        aria-label={`Ilustracija bazena ${meters(props.length)} × ${meters(props.width)} m, dubine ${meters(props.depth)} m`}
      >
        <defs>
          <linearGradient
            id="pl-land"
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={G - LAND}
            x2={0}
            y2={G}
          >
            <stop
              offset="0"
              stopColor={tri3("#86bd78", "#5b6152", "#15211e", t)}
            />
            <stop
              offset="1"
              stopColor={tri3("#5c9c52", "#3d4a36", "#101b17", t)}
            />
          </linearGradient>
          <linearGradient id="pl-soil" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0"
              stopColor={tri3("#8a6440", "#5e4634", "#21190f", t)}
            />
            <stop
              offset="0.35"
              stopColor={tri3("#6e4d31", "#4a3628", "#18120c", t)}
            />
            <stop
              offset="1"
              stopColor={tri3("#3f2b1c", "#2a1f17", "#0b0805", t)}
            />
          </linearGradient>
          <linearGradient id="pl-water" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0"
              stopColor={glow("#6fdcf0", lightHex, waterLit)}
              stopOpacity={0.9}
            />
            <stop
              offset="1"
              stopColor={glow("#1576b0", lightHex, waterLit * 0.6)}
              stopOpacity={0.94}
            />
          </linearGradient>
          <linearGradient id="pl-surface" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={glow("#57cde6", lightHex, waterLit)} />
            <stop
              offset="1"
              stopColor={glow("#2f9fd0", lightHex, waterLit * 0.7)}
            />
          </linearGradient>
          <linearGradient id="pl-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.5" stopColor="#fff" stopOpacity={0.16} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="pl-scan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7ae7ff" stopOpacity={0} />
            <stop offset="0.5" stopColor="#d8f8ff" stopOpacity={0.7} />
            <stop offset="1" stopColor="#7ae7ff" stopOpacity={0} />
          </linearGradient>
          <radialGradient id="pl-lamp">
            <stop
              offset="0"
              className={light === "rgb" && !still ? "pl-rgb-stop" : undefined}
              stopColor={light === "rgb" ? "#7f9bff" : "#fff6d8"}
              stopOpacity={0.95}
            />
            <stop
              offset="1"
              className={light === "rgb" && !still ? "pl-rgb-stop" : undefined}
              stopColor={light === "rgb" ? "#7f9bff" : "#bff3ff"}
              stopOpacity={0}
            />
          </radialGradient>
          <radialGradient id="pl-warm">
            <stop offset="0" stopColor="#ffcf70" stopOpacity={0.5} />
            <stop offset="1" stopColor="#ffcf70" stopOpacity={0} />
          </radialGradient>
          <pattern
            id="pl-tiles"
            patternUnits="userSpaceOnUse"
            width={8}
            height={8}
            x={x0}
            y={G}
          >
            <path
              d="M8 0V8M0 8H8"
              stroke="#fff"
              strokeOpacity={0.35}
              strokeWidth={0.6}
              fill="none"
            />
          </pattern>
          <pattern
            id="pl-bubblewrap"
            patternUnits="userSpaceOnUse"
            width={5}
            height={4}
          >
            <circle cx={2.5} cy={2} r={1.1} fill="#fff" fillOpacity={0.22} />
          </pattern>
          <clipPath id="pl-water-clip">
            <rect x={x0} y={waterY} width={Lp} height={waterH} />
          </clipPath>
          <clipPath id="pl-top-clip">
            <path d={pts(waterTop)} />
          </clipPath>
          <clipPath id="pl-pool-clip">
            <path
              d={`${pts([
                [x0 - 60, G - Wp - 40],
                [x1 + 60, G - Wp - 40],
                [x1 + 60, G],
                [x0 - 60, G],
              ])}M${x0} ${G - 2}h${Lp}v${Dp + 4}h${-Lp}Z`}
            />
          </clipPath>
        </defs>

        {/* Brda na horizontu i dvorište */}
        <g transform={`translate(0 ${-LAND})`}>
          <path
            d={`M-2000 ${G - 50} H0 Q 90 ${G - 96} 210 ${G - 62} T 430 ${G - 74} T 640 ${G - 92} T 720 ${G - 80} H2720 V${G} H-2000 Z`}
            fill={tri3("#6fa98f", "#5b4a6e", "#0d1623", t)}
          />
          <path
            d={`M-2000 ${G - 30} H0 Q 140 ${G - 58} 280 ${G - 30} T 520 ${G - 36} T 720 ${G - 48} H2720 V${G} H-2000 Z`}
            fill={tri3("#4f9160", "#3d3f52", "#0a111a", t)}
          />
        </g>
        <rect
          x={-2000}
          y={G - LAND}
          width={4720}
          height={LAND + 1}
          fill="url(#pl-land)"
        />
        {FAR_TREES.map(([x, r]) => (
          <ellipse
            key={x}
            cx={x}
            cy={G - LAND - r * 0.55}
            rx={r * 1.25}
            ry={r}
            fill={tri3("#3f7f52", "#34394a", "#09101a", t)}
          />
        ))}

        {/* Unutrašnji bazen: zadnji zid hale sa prozorima */}
        <AnimatePresence>
          {indoor && (
            <motion.g
              key="hall-back"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            >
              <HallBack
                P={P}
                half={half}
                Wp={Wp}
                roofH={roofH}
                c={c}
                glow={glow}
                n={n}
                t={t}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Žbunje iza bazena (napolju) */}
        {!indoor &&
          [-0.42, 0.08, 0.46].map((k, i) => {
            const [bx, by] = P(k * (Lp + 120), Wp + 34);
            return (
              <g key={i}>
                <ellipse
                  cx={bx}
                  cy={by - 6}
                  rx={18 + i * 3}
                  ry={11 + i}
                  fill={tri3("#3f8a4c", "#384236", "#0c1612", t)}
                />
                <ellipse
                  cx={bx - 7}
                  cy={by - 10}
                  rx={9}
                  ry={7}
                  fill={tri3("#5aa860", "#465040", "#111d17", t)}
                />
              </g>
            );
          })}

        {/* Plaža oko bazena */}
        <path d={pts(deckOut)} fill={c("#e4ddcf")} />
        {[0.35, 0.7].map((k) => {
          const [ax, ay] = P(-half - 26, Wp + 16 - (Wp + 16) * k * 0.2);
          const [bx, by] = P(half + 26, Wp + 16 - (Wp + 16) * k * 0.2);
          return (
            <path
              key={k}
              d={`M${ax} ${ay}L${bx} ${by}`}
              stroke={c("#c9c0ae")}
              strokeWidth={0.6}
            />
          );
        })}

        {/* Prelivni kanal sa rešetkom */}
        {gutter > 0.01 && (
          <g opacity={gutter}>
            <path
              d={pts(gutterOut) + pts(opening)}
              fillRule="evenodd"
              fill={c("#3c4650")}
            />
            {Array.from({ length: Math.round(Lp / 4) }, (_, i) => {
              const xo = -half - 6 + i * 4;
              const a = P(xo, Wp + 0.5);
              const b = P(xo, Wp + 5.5);
              return (
                <path
                  key={i}
                  d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`}
                  stroke={c("#e8edf2")}
                  strokeWidth={1.1}
                />
              );
            })}
          </g>
        )}

        {/* Otvor bazena, vodena površina, talasići */}
        <path d={pts(opening)} fill={c("#bfeaf3")} />
        <path d={pts(waterTop)} fill="url(#pl-surface)" />
        <g clipPath="url(#pl-top-clip)">
          <g
            className={still ? undefined : "pl-wave"}
            style={{ ["--pl-period" as string]: "24px" }}
          >
            {[0.2, 0.45, 0.7, 0.9].map((k) => (
              <path
                key={k}
                d={wavy(x0 - 48, x1 + 24, G - Wp * k + gap, 1.1, 24)}
                fill="none"
                stroke="#fff"
                strokeOpacity={0.35 - n * 0.15}
                strokeWidth={0.8}
              />
            ))}
          </g>
          {counter && (
            <g
              className={still ? undefined : "pl-flow"}
              stroke="#fff"
              strokeOpacity={0.55}
              strokeWidth={0.9}
              strokeDasharray="7 5"
              fill="none"
            >
              {[0.35, 0.5, 0.65].map((k) => {
                const a = P(half - 2, Wp * k, gap);
                const b = P(
                  half - Lp * 0.55,
                  Wp * (0.5 + (k - 0.5) * 2.2),
                  gap,
                );
                return <path key={k} d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} />;
              })}
            </g>
          )}
        </g>
        {nLights > 0 && (
          <path
            d={pts(waterTop)}
            fill="url(#pl-lamp)"
            opacity={n * 0.55}
            style={{ mixBlendMode: "screen" }}
          />
        )}

        {/* Prekrivka */}
        {coverK > 0.01 &&
          (lastCover.current === "termo" ? (
            <g>
              <path d={pts(coverPoly)} fill={c("#2a6bd1")} fillOpacity={0.93} />
              <path d={pts(coverPoly)} fill="url(#pl-bubblewrap)" />
              {/* namotač na plaži */}
              <Reel P={P} x={half + 15} Wp={Wp} c={c} />
            </g>
          ) : (
            <g>
              <path d={pts(coverPoly)} fill={c("#d6dee7")} />
              {Array.from(
                { length: Math.max(1, Math.round((Lp * coverK) / 5)) },
                (_, i) => {
                  const xo = half - i * 5;
                  const a = P(xo, 0, gap);
                  const b = P(xo, Wp, gap);
                  return (
                    <path
                      key={i}
                      d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`}
                      stroke={c("#9aa8b8")}
                      strokeWidth={0.8}
                    />
                  );
                },
              )}
            </g>
          ))}

        {/* Ivica (kamen) */}
        <path
          d={pts(opening)}
          fill="none"
          stroke={c("#f4efe4")}
          strokeWidth={overflow ? 0 : 2.4}
          strokeLinejoin="round"
        />

        {/* Para iznad tople vode */}
        <AnimatePresence>
          {heat && (
            <motion.g
              key="steam"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 + n * 0.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {[-0.3, 0.05, 0.32].map((k, i) => {
                const [sx, sy] = P(k * Lp, Wp * 0.5, gap);
                return (
                  <path
                    key={k}
                    className={still ? undefined : "pl-steam"}
                    style={{ animationDelay: `${i * 1.3}s` }}
                    d={`M${sx} ${sy}c-5 -6 5 -10 0 -16s5 -10 0 -16`}
                    fill="none"
                    stroke="#fff"
                    strokeOpacity={0.7}
                    strokeWidth={1.6}
                    strokeLinecap="round"
                  />
                );
              })}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Toplotna pumpa na travi, levo */}
        <AnimatePresence>
          {heat && (
            <motion.g
              key="hp"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={transition}
            >
              <HeatPump x={x0 - 62} y={G - 12} c={c} still={still} n={n} />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Ležaljka na plaži */}
        {!indoor && !machine && !fence && (
          <Lounger x={x1 + 52} y={G - 26} c={c} t={t} />
        )}

        {/* Teren: bager, uzan prolaz ili znak pitanja */}
        <AnimatePresence>
          {machine && (
            <motion.g
              key="dig"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={transition}
            >
              <Excavator x={x1 + 104} y={G - 20} c={c} still={still} />
            </motion.g>
          )}
          {fence && (
            <motion.g
              key="fence"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={transition}
            >
              <Fence x={x1 + 34} y={G - 24} c={c} />
            </motion.g>
          )}
          {unsure && (
            <motion.g
              key="unsure"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={transition}
              style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
            >
              <rect
                x={x1 + 46}
                y={G - 50}
                width={3}
                height={36}
                fill={c("#6b5a48")}
              />
              <circle cx={x1 + 47.5} cy={G - 56} r={10} fill="#4fd8eb" />
              <text
                x={x1 + 47.5}
                y={G - 52}
                textAnchor="middle"
                fontSize={13}
                fontWeight={700}
                fill="#04202a"
              >
                ?
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ------------------------- Presek -------------------------- */}

        <rect x={-2000} y={G} width={4720} height={1200} fill="url(#pl-soil)" />
        <rect x={-2000} y={G} width={4720} height={4} fill={c("#4c7d3e")} />
        {[34, 78, 130].map((d, i) => (
          <path
            key={d}
            d={wavy(-600, 1400, G + d, 2 + i, 90)}
            fill="none"
            stroke="#000"
            strokeOpacity={0.12}
            strokeWidth={1.2}
          />
        ))}
        {STONES.map(([dx, dy, r], i) => (
          <ellipse
            key={i}
            cx={CX + dx}
            cy={G + dy}
            rx={r * 1.4}
            ry={r}
            fill="#000"
            opacity={0.14}
          />
        ))}

        {/* Šaht sa filtracijom */}
        <g>
          <rect
            x={shX - 3}
            y={G - 2}
            width={62}
            height={4}
            rx={1}
            fill={c("#59606a")}
          />
          <rect
            x={shX}
            y={shY}
            width={56}
            height={48}
            rx={3}
            fill={c("#3a4048")}
          />
          <rect
            x={shX + 3}
            y={shY + 3}
            width={50}
            height={42}
            rx={2}
            fill={glow("#22272e", "#6a5a3a", n * 0.6)}
          />
          {/* peščani filter */}
          <rect
            x={shX + 8}
            y={shY + 12}
            width={14}
            height={30}
            rx={7}
            fill={c("#2b78c2")}
          />
          <rect
            x={shX + 13}
            y={shY + 7}
            width={4}
            height={6}
            fill={c("#c9d2dc")}
          />
          {/* pumpa */}
          <circle cx={shX + 34} cy={shY + 36} r={6} fill={c("#8a96a3")} />
          <rect
            x={shX + 28}
            y={shY + 30}
            width={14}
            height={4}
            rx={1}
            fill={c("#6b7682")}
          />
          {/* cevi do bazena */}
          <path
            d={`M${shX + 17} ${shY + 8}V${shY + 4}H${shX + 50}V${pipeY}H${x0 - 7}`}
            fill="none"
            stroke={c("#d6dde5")}
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
          <path
            d={`M${shX + 40} ${shY + 36}H${shX + 53}V${G + Dp + 3}H${x0 + Lp * 0.5}`}
            fill="none"
            stroke={c("#aeb8c3")}
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
          {/* hidroliza: ćelija na cevi */}
          <AnimatePresence>
            {salt && (
              <motion.g
                key="salt"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={transition}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              >
                <rect
                  x={shX + 44}
                  y={shY + 14}
                  width={12}
                  height={16}
                  rx={3}
                  fill={c("#e9eef3")}
                />
                <circle
                  cx={shX + 50}
                  cy={shY + 19}
                  r={1.8}
                  fill="#3ddc97"
                  className={still ? undefined : "hs-twinkle"}
                />
              </motion.g>
            )}
          </AnimatePresence>
        </g>

        {/* Toplotna pumpa: cevi do šahta */}
        {heat && (
          <path
            d={`M${x0 - 50} ${G - 14}V${shY + 10}`}
            stroke={c("#c9773a")}
            strokeWidth={2}
            fill="none"
          />
        )}

        {/* Kompenzacioni rezervoar (prelivni) */}
        {gutter > 0.01 && (
          <g opacity={gutter}>
            <rect
              x={x1 + 22}
              y={G + 14}
              width={34}
              height={Math.max(20, Dp * 0.55)}
              rx={3}
              fill={c("#4a525c")}
            />
            <rect
              x={x1 + 25}
              y={G + 14 + Math.max(20, Dp * 0.55) * 0.35}
              width={28}
              height={Math.max(20, Dp * 0.55) * 0.65 - 3}
              rx={2}
              fill="url(#pl-water)"
            />
            <path
              d={`M${x1 + 15} ${G + 8}H${x1 + 30}V${G + 16}`}
              stroke={c("#d6dde5")}
              strokeWidth={2}
              fill="none"
            />
          </g>
        )}

        {/* Betonska školjka i kanal u preseku */}
        <rect
          x={x0 - 7}
          y={G}
          width={Lp + 14}
          height={Dp + 9}
          fill={c("#8d969f")}
        />
        {gutter > 0.01 && (
          <g opacity={gutter}>
            {[x0 - 15, x1 + 7].map((gx) => (
              <g key={gx}>
                <rect x={gx} y={G} width={8} height={10} fill={c("#8d969f")} />
                <rect
                  x={gx + 1.5}
                  y={G + 2}
                  width={5}
                  height={7}
                  fill="url(#pl-water)"
                />
                <rect
                  x={gx}
                  y={G - 1.5}
                  width={8}
                  height={1.5}
                  fill={c("#e8edf2")}
                />
              </g>
            ))}
          </g>
        )}
        <rect x={x0} y={G} width={Lp} height={Dp} fill={c("#c4ecf4")} />
        <rect x={x0} y={G} width={Lp} height={Dp} fill="url(#pl-tiles)" />
        <path d={stairs} fill={c("#eef7fa")} />

        {/* Svetla na zadnjem zidu */}
        {Array.from({ length: nLights }, (_, i) => {
          const lx = x0 + ((i + 0.5) * Lp) / nLights;
          const ly = G + Math.max(10, Dp * 0.4);
          return (
            <g key={i}>
              <circle cx={lx} cy={ly} r={3} fill={c("#dfe6ec")} />
              <circle
                cx={lx}
                cy={ly}
                r={1.8}
                className={
                  light === "rgb" && !still ? "pl-rgb-fill" : undefined
                }
                fill={light === "rgb" ? "#7f9bff" : "#fff6d8"}
                opacity={0.5 + n * 0.5}
              />
            </g>
          );
        })}

        {/* Voda */}
        <rect
          x={x0}
          y={waterY}
          width={Lp}
          height={waterH}
          fill="url(#pl-water)"
        />
        <g clipPath="url(#pl-water-clip)">
          {Array.from({ length: nLights }, (_, i) => {
            const lx = x0 + ((i + 0.5) * Lp) / nLights;
            const ly = G + Math.max(10, Dp * 0.4);
            return (
              <ellipse
                key={i}
                cx={lx}
                cy={ly}
                rx={Math.min(46, Lp / nLights / 1.4)}
                ry={Math.min(30, Dp * 0.6)}
                fill="url(#pl-lamp)"
                opacity={0.25 + n * 0.75}
              />
            );
          })}
          <g
            className={still ? undefined : "pl-caustic"}
            style={{ ["--pl-period" as string]: "32px" }}
          >
            {[0.18, 0.4, 0.62, 0.84].map((k) => (
              <path
                key={k}
                d={wavy(x0 - 64, x1 + 32, G + Dp * k, 2.2, 32)}
                fill="none"
                stroke="#fff"
                strokeOpacity={0.14}
                strokeWidth={1}
              />
            ))}
          </g>
          {/* Hidromasaža: mehurići iz mlaznica */}
          {jets &&
            [0.58, 0.72, 0.86].map((k) => {
              const jx = x0 + Lp * k;
              const jy = G + Dp * 0.62;
              return (
                <g key={k}>
                  <circle cx={jx} cy={jy} r={2.2} fill={c("#e6edf3")} />
                  {[0, 1, 2, 3].map((b) => (
                    <circle
                      key={b}
                      cx={jx + (b % 2 ? 2 : -2)}
                      cy={jy - 3}
                      r={1 + (b % 3) * 0.5}
                      fill="#fff"
                      fillOpacity={0.75}
                      className={still ? undefined : "pl-bubble"}
                      style={{
                        ["--pl-rise" as string]: Math.max(4, jy - waterY - 4),
                        animationDelay: `${b * 0.55 + k}s`,
                      }}
                    />
                  ))}
                </g>
              );
            })}
          {/* Protivstrujno: mlaz sa desnog zida */}
          {counter && (
            <g>
              <rect
                x={x1 - 4}
                y={G + Math.max(8, Dp * 0.28) - 3}
                width={4}
                height={6}
                rx={1}
                fill={c("#e6edf3")}
              />
              <g
                className={still ? undefined : "pl-flow"}
                stroke="#fff"
                strokeOpacity={0.7}
                strokeWidth={1.2}
                strokeDasharray="7 5"
                fill="none"
              >
                {[-3, 0, 3].map((o) => {
                  const y = G + Math.max(8, Dp * 0.28) + o;
                  return (
                    <path
                      key={o}
                      d={`M${x1 - 4} ${y}L${x1 - Lp * 0.5} ${y + o * 2.5}`}
                    />
                  );
                })}
              </g>
            </g>
          )}
          {/* Hidroliza: sitni odsjaji u čistoj vodi */}
          {salt &&
            SPARKS.map(([u, v], i) => (
              <circle
                key={i}
                cx={x0 + Lp * u}
                cy={waterY + waterH * v}
                r={0.9}
                fill="#fff"
                className={still ? undefined : "hs-twinkle"}
                style={{ animationDelay: `${i * 0.4}s` }}
              />
            ))}
          <rect
            x={x0}
            y={waterY}
            width={Lp * 0.3}
            height={waterH}
            fill="url(#pl-sheen)"
          />
        </g>
        {/* površina vode u preseku */}
        <path
          d={wavy(x0, x1, waterY, 0.8, 16)}
          fill="none"
          stroke="#fff"
          strokeOpacity={0.7}
          strokeWidth={1}
          clipPath="url(#pl-pool-clip)"
        />

        {/* Podvodna roletna: valjak u niši na desnom kraju */}
        {coverK > 0.01 && lastCover.current === "roletna" && (
          <g opacity={clamp01(coverK * 4)}>
            <rect
              x={x1 - 22}
              y={waterY + 4}
              width={18}
              height={18}
              rx={2}
              fill={c("#5d6a78")}
              fillOpacity={0.55}
            />
            <circle cx={x1 - 13} cy={waterY + 13} r={6.5} fill={c("#cfd8e2")} />
            <circle
              cx={x1 - 13}
              cy={waterY + 13}
              r={4}
              fill="none"
              stroke={c("#8e9bab")}
              strokeWidth={0.8}
            />
          </g>
        )}

        {/* Unutrašnji bazen: stubovi i krovna greda ispred svega */}
        <AnimatePresence>
          {indoor && (
            <motion.g
              key="hall-front"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={transition}
            >
              <HallFront P={P} half={half} Wp={Wp} roofH={roofH} c={c} n={n} />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Kote: dužina, širina, dubina */}
        <AnimatePresence>
          {showDims && (
            <motion.g
              key="dims"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              fontSize={fs}
              fontWeight={600}
              fill="#e9fbff"
            >
              <Dim
                a={[x0, G + Dp + 18]}
                b={[x1, G + Dp + 18]}
                label={`${meters(props.length)} m`}
                sw={dimStroke}
                fs={fs}
                below
              />
              <Dim
                a={[x1 + 14, G]}
                b={[x1 + 14, G + Dp]}
                label={`${meters(props.depth)} m`}
                sw={dimStroke}
                fs={fs}
                side
              />
              <Dim
                a={P(half + 34, 0)}
                b={P(half + 34, Wp)}
                label={`${meters(props.width)} m`}
                sw={dimStroke}
                fs={fs}
                side
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Zrak koji "meri" bazen dok traje obračun */}
        <AnimatePresence>
          {scanning && !still && (
            <motion.g
              key="scan"
              clipPath="url(#pl-pool-clip)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.rect
                y={G - Wp - 20}
                width={28}
                height={Wp + Dp + 30}
                fill="url(#pl-scan)"
                initial={{ x: x0 - 40 }}
                animate={{ x: [x0 - 40, x1 + 12, x0 - 40] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}

export default memo(PoolScene);

/* ------------------------------------------------------------------ */
/*  Delovi scene                                                        */
/* ------------------------------------------------------------------ */

type Paint = (hex: string) => string;

function Dim({
  a,
  b,
  label,
  sw,
  fs,
  below,
  side,
}: {
  a: Pt;
  b: Pt;
  label: string;
  sw: number;
  fs: number;
  below?: boolean;
  side?: boolean;
}) {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const tick = fs * 0.35;
  const vertical = Math.abs(b[0] - a[0]) < Math.abs(b[1] - a[1]);
  const tk = (p: Pt) =>
    vertical
      ? `M${p[0] - tick} ${p[1]}h${tick * 2}`
      : `M${p[0]} ${p[1] - tick}v${tick * 2}`;
  return (
    <g>
      <path
        d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}${tk(a)}${tk(b)}`}
        stroke="#e9fbff"
        strokeWidth={sw * 1.4}
        fill="none"
      />
      <text
        x={side ? mx + fs * 0.6 : mx}
        y={below ? my + fs * 1.25 : my + fs * 0.35}
        textAnchor={side ? "start" : "middle"}
        stroke="#05121a"
        strokeWidth={sw * 3}
        paintOrder="stroke"
      >
        {label}
      </text>
    </g>
  );
}

function HeatPump({
  x,
  y,
  c,
  still,
  n,
}: {
  x: number;
  y: number;
  c: Paint;
  still: boolean;
  n: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={1} rx={26} ry={3} fill="#000" opacity={0.25} />
      <rect x={-24} y={-32} width={48} height={32} rx={3} fill={c("#eef1f4")} />
      <rect x={-24} y={-32} width={48} height={5} rx={2} fill={c("#cfd6dd")} />
      <circle cx={-6} cy={-14} r={11} fill={c("#3a4048")} />
      <g
        className={still ? undefined : "pl-fan"}
        style={{ transformOrigin: "-6px -14px" }}
      >
        {[0, 120, 240].map((r) => (
          <path
            key={r}
            d="M-6 -14 q 2 -9 8 -8 q -3 4 -8 8"
            fill={c("#9aa5b1")}
            transform={`rotate(${r} -6 -14)`}
          />
        ))}
      </g>
      <circle cx={-6} cy={-14} r={2} fill={c("#cfd6dd")} />
      <rect x={10} y={-24} width={9} height={6} rx={1} fill="#0b1a24" />
      <text
        x={14.5}
        y={-19.6}
        fontSize={4.6}
        textAnchor="middle"
        fill="#ff9a5c"
      >
        28°
      </text>
      <circle
        cx={14.5}
        cy={-9}
        r={1.4}
        fill="#3ddc97"
        opacity={0.6 + n * 0.4}
      />
    </g>
  );
}

function Reel({
  P,
  x,
  Wp,
  c,
}: {
  P: (xo: number, d: number, dy?: number) => Pt;
  x: number;
  Wp: number;
  c: Paint;
}) {
  const a = P(x, -2, -5);
  const b = P(x, Wp + 2, -5);
  return (
    <g>
      <path
        d={`M${a[0]} ${a[1] + 5}V${a[1]}M${b[0]} ${b[1] + 5}V${b[1]}`}
        stroke={c("#8a96a3")}
        strokeWidth={1.6}
      />
      <path
        d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`}
        stroke={c("#2a6bd1")}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <path
        d={`M${a[0]} ${a[1] - 1.5}L${b[0]} ${b[1] - 1.5}`}
        stroke="#fff"
        strokeOpacity={0.3}
        strokeWidth={1.4}
      />
    </g>
  );
}

function Lounger({
  x,
  y,
  c,
  t,
}: {
  x: number;
  y: number;
  c: Paint;
  t: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* suncobran */}
      <rect x={14} y={-40} width={1.6} height={40} fill={c("#8a7a66")} />
      <path d="M-6 -36 Q 15 -52 36 -36 Z" fill={c("#f2f2ef")} />
      <path
        d="M-6 -36 Q 4 -40 8 -36 M 22 -36 Q 26 -40 36 -36"
        stroke={c("#d8d8d2")}
        strokeWidth={0.8}
        fill="none"
      />
      {/* ležaljka */}
      <ellipse cx={4} cy={1} rx={22} ry={2.5} fill="#000" opacity={0.2} />
      <path
        d="M-16 -4 H14 L22 -14"
        stroke={c("#f6f4ef")}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      <path d="M-14 -3 v4 M10 -3 v4" stroke={c("#9a8c7a")} strokeWidth={1.4} />
      <rect
        x={-4}
        y={-9}
        width={10}
        height={4}
        rx={2}
        fill={tri3("#4fd8eb", "#3a8fa0", "#16404a", t)}
      />
    </g>
  );
}

function Excavator({
  x,
  y,
  c,
  still,
}: {
  x: number;
  y: number;
  c: Paint;
  still: boolean;
}) {
  const yellow = c("#f5b301");
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={1} rx={34} ry={3.5} fill="#000" opacity={0.25} />
      <rect x={-30} y={-12} width={60} height={12} rx={6} fill={c("#2b2f36")} />
      {[-22, -11, 0, 11, 22].map((wx) => (
        <circle key={wx} cx={wx} cy={-6} r={3.4} fill={c("#555c66")} />
      ))}
      <rect x={-24} y={-30} width={46} height={18} rx={3} fill={yellow} />
      <rect x={14} y={-28} width={10} height={14} rx={2} fill={c("#d39a00")} />
      <rect x={-6} y={-52} width={22} height={23} rx={3} fill={yellow} />
      <rect
        x={-3}
        y={-49}
        width={15}
        height={11}
        rx={1.5}
        fill={c("#8fc3e6")}
      />
      <motion.g
        style={{ transformOrigin: "-16px -30px", transformBox: "view-box" }}
        animate={still ? undefined : { rotate: [0, -6, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M-16 -30 L-44 -66 L-70 -36"
          stroke={yellow}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M-74 -40 L-62 -36 L-66 -26 L-78 -28 Z" fill={c("#3a3f46")} />
      </motion.g>
    </g>
  );
}

function Fence({ x, y, c }: { x: number; y: number; c: Paint }) {
  const wood = c("#9b7b55");
  const posts = [0, 14, 28, 42, 70, 84, 98, 112];
  return (
    <g transform={`translate(${x} ${y})`}>
      {posts.map((px) => (
        <rect
          key={px}
          x={px}
          y={-26}
          width={4}
          height={28}
          rx={1}
          fill={wood}
        />
      ))}
      <rect x={0} y={-20} width={46} height={3} fill={wood} />
      <rect x={0} y={-9} width={46} height={3} fill={wood} />
      <rect x={70} y={-20} width={46} height={3} fill={wood} />
      <rect x={70} y={-9} width={46} height={3} fill={wood} />
      {/* uzak prolaz */}
      <path
        d="M50 -4 h16 M50 -4 l3 -2 M50 -4 l3 2 M66 -4 l-3 -2 M66 -4 l-3 2"
        stroke="#ffc53d"
        strokeWidth={1.3}
        fill="none"
      />
      <path d="M58 -50 l11 19 h-22 z" fill="#ff9f1a" />
      <rect x={57.2} y={-44} width={1.6} height={7} fill="#1a1205" />
      <rect x={57.2} y={-35.5} width={1.6} height={1.6} fill="#1a1205" />
      <rect x={57.2} y={-31} width={1.6} height={5} fill={wood} />
    </g>
  );
}

function HallBack({
  P,
  half,
  Wp,
  roofH,
  c,
  glow,
  n,
  t,
}: {
  P: (xo: number, d: number, dy?: number) => Pt;
  half: number;
  Wp: number;
  roofH: number;
  c: Paint;
  glow: (hex: string, lit: string, k: number) => string;
  n: number;
  t: number;
}) {
  const d = Wp + 22;
  const a = P(-half - 44, d);
  const b = P(half + 44, d);
  const k = 1 - d / VANISH;
  const h = roofH * k;
  const wins = Math.max(3, Math.round((b[0] - a[0]) / 46));
  const ww = (b[0] - a[0]) / wins;
  return (
    <g>
      <rect
        x={a[0]}
        y={a[1] - h}
        width={b[0] - a[0]}
        height={h}
        fill={glow("#ece6da", "#ffd89a", n * 0.5)}
      />
      {Array.from({ length: wins }, (_, i) => (
        <rect
          key={i}
          x={a[0] + i * ww + 5}
          y={a[1] - h + 10}
          width={ww - 10}
          height={h - 24}
          rx={1.5}
          fill={tri3("#9fd0f2", "#e79a76", "#13213a", t)}
          stroke={c("#5d6670")}
          strokeWidth={1.5}
        />
      ))}
      {/* drveni plafon, viđen ispod krovne grede */}
      <path
        d={pts([
          [a[0], a[1] - h],
          [b[0], b[1] - h],
          [b[0] + (half + 44) * (d / VANISH), G - roofH],
          [a[0] - (half + 44) * (d / VANISH), G - roofH],
        ])}
        fill={glow("#b38a5e", "#ffcf88", n * 0.35)}
        opacity={0.95}
      />
      {/* toplo svetlo hale noću */}
      <ellipse
        cx={CX}
        cy={G - Wp * 0.5}
        rx={half + 50}
        ry={Wp * 0.8 + 10}
        fill="url(#pl-warm)"
        opacity={n * 0.8}
      />
    </g>
  );
}

function HallFront({
  P,
  half,
  roofH,
  c,
}: {
  P: (xo: number, d: number, dy?: number) => Pt;
  half: number;
  Wp: number;
  roofH: number;
  c: Paint;
  n: number;
}) {
  const l = P(-half - 44, 0);
  const r = P(half + 44, 0);
  const col = c("#e9e4da");
  return (
    <g>
      {/* staklene stranice */}
      <rect x={l[0]} y={G - roofH} width={6} height={roofH} fill={col} />
      <rect x={r[0] - 6} y={G - roofH} width={6} height={roofH} fill={col} />
      <rect
        x={l[0] - 4}
        y={G - roofH - 12}
        width={r[0] - l[0] + 8}
        height={13}
        rx={1.5}
        fill={c("#d8d1c4")}
      />
      <rect
        x={l[0] - 4}
        y={G - roofH - 1}
        width={r[0] - l[0] + 8}
        height={2}
        fill="#000"
        opacity={0.15}
      />
    </g>
  );
}

const FAR_TREES: [number, number][] = [
  [-120, 9],
  [-40, 7],
  [30, 10],
  [92, 7],
  [600, 8],
  [690, 10],
  [770, 7],
  [850, 9],
];

const STONES: [number, number, number][] = [
  [-260, 40, 4],
  [-200, 96, 3],
  [-150, 150, 5],
  [210, 128, 4],
  [260, 60, 3],
  [300, 170, 5],
  [-30, 190, 4],
  [90, 210, 3],
];

const SPARKS: [number, number][] = [
  [0.22, 0.3],
  [0.38, 0.62],
  [0.51, 0.22],
  [0.64, 0.55],
  [0.77, 0.35],
  [0.3, 0.82],
  [0.88, 0.7],
];
