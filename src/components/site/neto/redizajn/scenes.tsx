"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Play, QrCode } from "lucide-react";
import {
  DISPLAY,
  EASE_OUT,
  MONO,
  POP_SPRING,
  RED,
  fmt,
  useSlideActive,
} from "../primitives";
import { MiniLogo, Pin } from "../visuals";
import { AGENCY_FEE, BUDGET, FIRST_BUY_OFF, LOCATION, MONTHS } from "./data";

/* ------------------------------------------------------------------------ */
/* The store as it is today: three clips played one after another, with a   */
/* story bar on top. A tap moves to the next clip, a bar jumps to its clip. */
/* ------------------------------------------------------------------------ */

const CLIPS = [
  { n: 1, label: "Ulaz" },
  { n: 2, label: "Prolazi" },
  { n: 3, label: "Rafovi" },
].map((c) => ({
  ...c,
  src: `/clients/neto/video_${c.n}.mp4`,
  poster: `/clients/neto/video_${c.n}.webp`,
}));

export function StoreReel({ className = "" }: { className?: string }) {
  const [at, setAt] = useState(0);
  /* Autoplay can be refused (Low Power Mode on an iPhone): the poster
     stays up with a play button until the first tap. */
  const [blocked, setBlocked] = useState(false);
  const vids = useRef<(HTMLVideoElement | null)[]>([]);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    vids.current.forEach((v, i) => {
      if (!v) return;
      if (i !== at) {
        v.pause();
        return;
      }
      v.currentTime = 0;
      v.play()
        .then(() => setBlocked(false))
        .catch(() => setBlocked(true));
    });
  }, [at]);

  /* The bars are written straight to the DOM, once a frame. */
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      fills.current.forEach((f, i) => {
        if (!f) return;
        let p = i < at ? 1 : 0;
        if (i === at) {
          const v = vids.current[i];
          p = v && v.duration ? v.currentTime / v.duration : 0;
        }
        f.style.transform = `scaleX(${p})`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [at]);

  const next = () => setAt((a) => (a + 1) % CLIPS.length);

  const tap = () => {
    if (blocked) {
      vids.current[at]
        ?.play()
        .then(() => setBlocked(false))
        .catch(() => {});
      return;
    }
    next();
  };

  return (
    <div
      role="group"
      aria-label={`Lokal danas, ${LOCATION}: tri kratka snimka`}
      onClick={tap}
      className={`relative cursor-pointer overflow-hidden bg-[#111] ${className}`}
      style={{ borderRadius: "6px 28px 6px 6px" }}
    >
      {CLIPS.map((c, i) => (
        <video
          key={c.src}
          ref={(el) => {
            vids.current[i] = el;
          }}
          src={c.src}
          poster={c.poster}
          muted
          playsInline
          preload={i === 0 ? "auto" : "metadata"}
          onEnded={i === at ? next : undefined}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
          style={{ opacity: i === at ? 1 : 0 }}
        />
      ))}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-20"
        style={{
          background: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0))",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{
          background: "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.6))",
        }}
      />

      <div className="absolute inset-x-0 top-0 flex gap-1.5 px-3 pt-3">
        {CLIPS.map((c, i) => (
          <button
            key={c.src}
            type="button"
            aria-label={`Snimak ${i + 1}: ${c.label}`}
            aria-current={i === at ? "true" : undefined}
            onClick={(e) => {
              e.stopPropagation();
              setAt(i);
            }}
            className="flex-1 cursor-pointer pb-1 text-left"
          >
            <span className="block h-[3px] overflow-hidden rounded-full bg-white/35">
              <span
                ref={(el) => {
                  fills.current[i] = el;
                }}
                className="block h-full origin-left rounded-full bg-white"
                style={{ transform: "scaleX(0)" }}
              />
            </span>
            <span
              className="mt-1.5 block text-[10px] uppercase tracking-[0.14em] text-white"
              style={{ fontFamily: MONO, opacity: i === at ? 1 : 0.6 }}
            >
              {c.label}
            </span>
          </button>
        ))}
      </div>

      <p className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-[14px] font-extrabold text-white md:bottom-4 md:left-4 md:text-[16px]">
        <span
          className="grid h-7 w-7 flex-none place-items-center rounded-full"
          style={{ background: RED }}
        >
          <Pin size={16} />
        </span>
        {LOCATION}
      </p>

      {blocked && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-white"
          style={{ background: RED }}
        >
          <Play size={28} fill="#fff" />
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* The store's floor plan with the QR spots on it.                          */
/* Walls, windows, doors, the pillar, WC and storage follow the evacuation  */
/* plan on the store wall (Fruškogorska 18, R 1:100), street at the bottom. */
/* Till and ice cream chest by the door, and the fridges along the blind    */
/* left wall, come from the store photos; the gondola rows are schematic.   */
/* ------------------------------------------------------------------------ */

const W = 390;
const H = 328;

type Spot = {
  x: number;
  y: number;
  label: string;
  side: "left" | "right" | "top" | "bottom";
};

/* In the order a customer meets them. */
const SPOTS: Spot[] = [
  { x: 110, y: 315, label: "Izlog", side: "top" },
  { x: 284, y: 312, label: "Vrata", side: "right" },
  { x: 271, y: 240, label: "Akcije", side: "right" },
  { x: 113, y: 150, label: "Rafovi", side: "right" },
  { x: 22, y: 196, label: "Frižideri", side: "right" },
  { x: 221, y: 272, label: "Kasa", side: "left" },
];

const LABEL_POS: Record<Spot["side"], string> = {
  left: "right-full mr-1.5 top-1/2 -translate-y-1/2",
  right: "left-full ml-1.5 top-1/2 -translate-y-1/2",
  top: "bottom-full mb-1.5 left-1/2 -translate-x-1/2",
  bottom: "top-full mt-1.5 left-1/2 -translate-x-1/2",
};

export function FloorPlan({ className = "" }: { className?: string }) {
  const ink = "#1A1A1A";
  const shelf = "#ECE9E1";
  const cold = "#DCEBFA";
  const glass = "#BFDDF7";
  const room = "#F4F2EC";
  const wall = {
    stroke: ink,
    strokeWidth: 5,
    strokeLinecap: "square" as const,
    fill: "none",
  };
  const inner = { ...wall, strokeWidth: 3 };
  const swing = {
    fill: "none",
    stroke: ink,
    strokeWidth: 1,
    strokeDasharray: "3 3",
  };
  const tag = {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: "0.12em",
    fill: "#8A8A8A",
    textAnchor: "middle" as const,
  };
  return (
    <div
      className={`relative w-full ${className}`}
      style={{ aspectRatio: `${W} / ${H}` }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Osnova lokala sa mestima za QR kod: izlog, vrata, akcije, rafovi, frižideri i kasa"
      >
        {/* floor: the sales hall, then WC, storage and the back hallway */}
        <path d="M11 68 H379 V315 H11 Z M182 11 H379 V68 H182 Z" fill="#fff" />
        <rect x={182} y={68} width={54} height={67} fill={room} />
        <path d="M236 68 H379 V122 H276 L236 122 Z" fill={room} />
        <path d="M182 11 H379 V68 H182 Z" fill={room} />

        {/* the step in front of the entrance */}
        <rect
          x={228}
          y={318}
          width={110}
          height={8}
          fill={shelf}
          stroke={ink}
          strokeWidth={1}
        />

        {/* fixtures */}
        <rect
          x={15}
          y={92}
          width={14}
          height={204}
          rx={2}
          fill={cold}
          stroke={ink}
          strokeWidth={1.5}
        />
        {[126, 160, 194, 228, 262].map((y) => (
          <line
            key={y}
            x1={15}
            y1={y}
            x2={29}
            y2={y}
            stroke={ink}
            strokeWidth={1}
          />
        ))}
        <rect
          x={34}
          y={72}
          width={140}
          height={12}
          rx={2}
          fill={shelf}
          stroke={ink}
          strokeWidth={1.5}
        />
        <rect
          x={361}
          y={130}
          width={14}
          height={168}
          rx={2}
          fill={shelf}
          stroke={ink}
          strokeWidth={1.5}
        />
        {[60, 104, 148].map((x) => (
          <rect
            key={x}
            x={x}
            y={104}
            width={18}
            height={132}
            rx={2}
            fill={shelf}
            stroke={ink}
            strokeWidth={1.5}
          />
        ))}
        {[262, 310].map((x) => (
          <rect
            key={x}
            x={x}
            y={148}
            width={18}
            height={88}
            rx={2}
            fill={shelf}
            stroke={ink}
            strokeWidth={1.5}
          />
        ))}
        {/* ice cream chest, then the till */}
        <rect
          x={196}
          y={238}
          width={50}
          height={16}
          rx={2}
          fill={cold}
          stroke={ink}
          strokeWidth={1.5}
        />
        <rect x={196} y={262} width={50} height={20} rx={3} fill={ink} />
        {/* the pillar */}
        <rect x={186} y={192} width={12} height={12} fill={ink} />
        {/* electrical cabinets in the storage */}
        <rect
          x={367}
          y={74}
          width={8}
          height={18}
          fill={shelf}
          stroke={ink}
          strokeWidth={1}
        />
        <rect
          x={367}
          y={96}
          width={8}
          height={18}
          fill={shelf}
          stroke={ink}
          strokeWidth={1}
        />

        {/* windows: two on the back wall, the shop window on the street */}
        <rect
          x={46}
          y={66}
          width={102}
          height={5}
          fill={glass}
          stroke={ink}
          strokeWidth={1.2}
        />
        <rect
          x={56}
          y={312}
          width={108}
          height={6}
          fill={glass}
          stroke={ink}
          strokeWidth={1.2}
        />
        {/* glazed entrance with a double door */}
        <rect
          x={232}
          y={312}
          width={34}
          height={6}
          fill={glass}
          stroke={ink}
          strokeWidth={1.2}
        />
        <rect
          x={302}
          y={312}
          width={36}
          height={6}
          fill={glass}
          stroke={ink}
          strokeWidth={1.2}
        />
        <path d="M266 315 V297 M302 315 V297" stroke={ink} strokeWidth={2} />
        <path d="M266 297 A18 18 0 0 1 284 315" {...swing} />
        <path d="M302 297 A18 18 0 0 0 284 315" {...swing} />

        {/* outer walls */}
        <path
          d="M46 68 H11 V315 H56 M164 315 H232 M338 315 H379 V11 H318 M294 11 H182 V68 H148"
          {...wall}
        />
        {/* WC, storage, back hallway */}
        <path
          d="M182 68 H294 M318 68 H379 M182 135 H208 M232 135 H236 V68 M276 122 H379 M236 11 V30 M330 11 V28 M330 48 V68"
          {...inner}
        />
        {/* doors: WC, storage to hallway, back exit */}
        <path d="M232 135 V113" stroke={ink} strokeWidth={2} />
        <path d="M232 113 A22 22 0 0 0 210 135" {...swing} />
        <path d="M294 68 V46" stroke={ink} strokeWidth={2} />
        <path d="M294 46 A22 22 0 0 1 316 68" {...swing} />
        <path d="M294 11 V33" stroke={ink} strokeWidth={2} />
        <path d="M294 33 A22 22 0 0 0 316 11" {...swing} />

        <text x={209} y={106} {...tag}>
          WC
        </text>
        <text x={322} y={101} {...tag}>
          MAGACIN
        </text>
      </svg>

      {SPOTS.map((s) => (
        <span
          key={s.label}
          className="absolute -ml-[13px] -mt-[13px]"
          style={{ left: `${(s.x / W) * 100}%`, top: `${(s.y / H) * 100}%` }}
        >
          <span
            className="relative grid h-[26px] w-[26px] place-items-center rounded-[7px] text-white"
            style={{ background: RED, boxShadow: "0 0 0 2px #fff" }}
          >
            <QrCode size={15} strokeWidth={2.4} />
          </span>
          <span
            className={`absolute whitespace-nowrap rounded-full bg-black px-2 py-[3px] text-[10.5px] font-bold leading-none text-white md:text-[12px] ${LABEL_POS[s.side]}`}
          >
            {s.label}
          </span>
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* A QR code drawn for the look only: three finder squares, timing rows     */
/* and a fixed scatter of modules. It does not scan.                        */
/* ------------------------------------------------------------------------ */

const QR_N = 21;
const QR_PATH = (() => {
  let seed = 20261115;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const inFinder = (r: number, c: number) =>
    (r < 8 && c < 8) || (r < 8 && c >= QR_N - 8) || (r >= QR_N - 8 && c < 8);
  /* Local position inside whichever finder square the cell falls in; the
     row and column right next to a square stay white. */
  const finder = (r: number, c: number) => {
    const lr = r - (r >= QR_N - 7 ? QR_N - 7 : 0);
    const lc = c - (c >= QR_N - 7 ? QR_N - 7 : 0);
    if (lr > 6 || lc > 6) return false;
    return (
      lr === 0 ||
      lr === 6 ||
      lc === 0 ||
      lc === 6 ||
      (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4)
    );
  };
  let d = "";
  for (let r = 0; r < QR_N; r++)
    for (let c = 0; c < QR_N; c++) {
      let on: boolean;
      if (inFinder(r, c)) on = finder(r, c);
      else if (r === 6) on = c % 2 === 0;
      else if (c === 6) on = r % 2 === 0;
      else on = rnd() < 0.48;
      if (on) d += `M${c} ${r}h1v1h-1z`;
    }
  return d;
})();

export function QrGlyph({ size = 64 }: { size?: number }) {
  return (
    <svg
      viewBox={`-1.5 -1.5 ${QR_N + 3} ${QR_N + 3}`}
      width={size}
      height={size}
      aria-hidden
      className="flex-none rounded-[6px] bg-white"
      shapeRendering="crispEdges"
    >
      <path d={QR_PATH} fill="#000" />
    </svg>
  );
}

/* The sticker that goes on every spot in the plan, in the words of the
   real one on the door. */
export function QrSticker() {
  return (
    <div
      className="flex items-center gap-3.5 px-3.5 py-3 text-white md:gap-5 md:px-5 md:py-4"
      style={{ background: RED, borderRadius: "6px 26px 6px 6px" }}
    >
      <QrGlyph size={68} />
      <div className="min-w-0">
        <b className="block text-[22px] font-black italic leading-none md:text-[28px]">
          Skeniraj QR kod
        </b>
        <span className="mt-1 block text-[13px] font-bold leading-[1.25] md:text-[15px]">
          i ostvari {FIRST_BUY_OFF}% popusta na 1. kupovinu.
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* The app's barcode card: a laser runs over the code, then the first      */
/* purchase discount lands on it.                                           */
/* ------------------------------------------------------------------------ */

const BARS = (() => {
  let seed = 4021;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const out: { x: number; w: number }[] = [];
  let x = 0;
  for (let i = 0; i < 46; i++) {
    const w = 1 + Math.floor(rnd() * 3);
    if (i % 2 === 0) out.push({ x, w });
    x += w;
  }
  return { bars: out, width: x };
})();

export function Barcode() {
  return (
    <svg
      viewBox={`0 0 ${BARS.width} 30`}
      preserveAspectRatio="none"
      className="block h-full w-full"
      aria-hidden
      shapeRendering="crispEdges"
    >
      {BARS.bars.map((b) => (
        <rect key={b.x} x={b.x} y={0} width={b.w} height={30} fill="#000" />
      ))}
    </svg>
  );
}

export function AppCard() {
  const active = useSlideActive();
  return (
    <div
      className="relative mx-auto w-full max-w-[340px]"
      style={{ fontFamily: DISPLAY }}
    >
      <div
        className="relative flex aspect-[1.6] w-full flex-col justify-between rounded-[18px] p-[16px] text-white md:p-[18px]"
        style={{
          background: "linear-gradient(135deg,#E2231A,#9E120B)",
          boxShadow: "0 18px 40px -16px rgba(226,35,26,.7)",
        }}
      >
        <div className="flex items-center justify-between">
          <MiniLogo invert />
          <small
            className="text-[10.5px] uppercase tracking-[0.14em] opacity-90"
            style={{ fontFamily: MONO }}
          >
            Moj kod
          </small>
        </div>
        <div className="flex items-end gap-2">
          <b className="text-[44px] font-black italic leading-[0.9] md:text-[50px]">
            −{FIRST_BUY_OFF}%
          </b>
          <span className="pb-1 text-[13px] font-bold leading-[1.15]">
            na prvu
            <br />
            kupovinu
          </span>
        </div>
        <div className="relative h-[46px] overflow-hidden rounded-[7px] bg-white px-2.5 pb-[16px] pt-[6px]">
          <Barcode />
          <span
            className="absolute inset-x-0 bottom-[2px] text-center text-[10px] tracking-[0.24em] text-black"
            style={{ fontFamily: MONO }}
          >
            2045 1180 7736
          </span>
          <motion.i
            aria-hidden
            className="absolute inset-x-1 block h-[2px] rounded-full"
            style={{
              background: "#FF2A1F",
              boxShadow: "0 0 8px 2px rgba(255,42,31,0.75)",
            }}
            initial={{ top: "8%", opacity: 0 }}
            animate={
              active
                ? { top: ["8%", "70%", "8%"], opacity: 1 }
                : { top: "8%", opacity: 0 }
            }
            transition={{
              top: {
                duration: 1.6,
                delay: 0.8,
                ease: "easeInOut",
                repeat: Infinity,
              },
              opacity: { duration: 0.2, delay: 0.8 },
            }}
          />
        </div>
      </div>
      <motion.span
        className="absolute -right-2 -top-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[12px] font-extrabold text-black md:-right-4"
        style={{ boxShadow: "0 8px 20px -8px rgba(0,0,0,0.6)" }}
        initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
        animate={
          active
            ? { opacity: 1, scale: 1, rotate: 4 }
            : { opacity: 0, scale: 0.5, rotate: -12 }
        }
        transition={{ ...POP_SPRING, delay: 2.2 }}
      >
        <span
          className="grid h-4 w-4 place-items-center rounded-full text-white"
          style={{ background: "#16A34A" }}
        >
          <Check size={11} strokeWidth={3.5} />
        </span>
        Popust na kasi
      </motion.span>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* The budget as a till receipt, printed out of a slot. Blank amounts are   */
/* dashed lines, filled in from data.ts as the numbers come in.             */
/* ------------------------------------------------------------------------ */

function Blank({ wide = false }: { wide?: boolean }) {
  return (
    <span
      aria-label="iznos u izradi"
      className={`inline-block h-[0.95em] translate-y-[0.12em] border-b-[1.5px] border-dashed border-[#9A9A9A] ${wide ? "w-16" : "w-11"}`}
    />
  );
}

function Leader() {
  return (
    <span
      aria-hidden
      className="mx-1.5 min-w-3 flex-1 translate-y-[-0.28em] border-b border-dotted border-[#B5B5B5]"
    />
  );
}

const TEETH = 40;
const TORN =
  `M0 0H${TEETH * 2}V1` +
  Array.from({ length: TEETH }, () => "l-1 3-1-3").join("") +
  "z";

export function Receipt() {
  const active = useSlideActive();
  const known = BUDGET.filter((l) => l.amount !== undefined);
  const works =
    known.length === BUDGET.length && BUDGET.length > 0
      ? BUDGET.reduce((s, l) => s + (l.amount ?? 0), 0)
      : null;

  return (
    <div className="mx-auto w-full max-w-[400px]">
      {/* the printer's slot */}
      <div className="relative z-10 h-3 rounded-full bg-[#2A2A2A] shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)]" />
      <div className="-mt-1.5 overflow-hidden px-2">
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: active ? "0%" : "-100%" }}
          transition={{ duration: 1.25, delay: 0.35, ease: EASE_OUT }}
        >
          <div
            className="bg-white px-4 pb-4 pt-5 text-[12.5px] leading-[1.25] text-[#111] md:px-5 md:text-[13.5px]"
            style={{ fontFamily: MONO }}
          >
            <div className="flex items-center justify-between">
              <MiniLogo className="!text-[16px]" />
              <span className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B6B6B]">
                Redizajn lokala
              </span>
            </div>
            <p className="mt-2 text-[11px] text-[#6B6B6B]">{LOCATION}</p>
            <div className="my-2.5 border-t border-dashed border-[#BDBDBD]" />
            <ul className="grid gap-[7px]">
              {BUDGET.map((l) => (
                <li key={l.label} className="flex items-baseline">
                  <l.icon
                    size={13}
                    className="mr-2 flex-none translate-y-[2px]"
                    style={{ color: RED }}
                  />
                  <span className="truncate">{l.label}</span>
                  <Leader />
                  <span className="whitespace-nowrap">
                    {l.amount !== undefined ? fmt(l.amount) : <Blank />} €
                  </span>
                </li>
              ))}
            </ul>
            <div className="my-2.5 border-t border-dashed border-[#BDBDBD]" />
            <p className="flex items-baseline font-semibold">
              Radovi, okvirno
              <Leader />
              <span className="whitespace-nowrap">
                {works !== null ? fmt(works) : <Blank wide />} €
              </span>
            </p>
            <p className="mt-[7px] flex items-baseline">
              Skeylo, {MONTHS} meseca
              <Leader />
              <span className="whitespace-nowrap">{fmt(AGENCY_FEE)} €</span>
            </p>
            <div className="my-2.5 border-t-2 border-black" />
            <p className="flex items-baseline text-[15px] font-semibold md:text-[16px]">
              UKUPNO
              <Leader />
              <span className="whitespace-nowrap">
                {works !== null
                  ? `${fmt(works + AGENCY_FEE)} €`
                  : `${fmt(AGENCY_FEE)} € + radovi`}
              </span>
            </p>
          </div>
          {/* the torn edge */}
          <svg
            aria-hidden
            className="block h-2 w-full"
            preserveAspectRatio="none"
            viewBox={`0 0 ${TEETH * 2} 4`}
          >
            <path d={TORN} fill="#fff" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
