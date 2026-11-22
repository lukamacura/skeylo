"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/*
 * Zajednički delovi za "Šta radimo" (ServicesReel) i "Put jednog kupca"
 * (CustomerPath) na početnoj. Primer je izmišljena "Tvoja firma", mala
 * pržionica kafe, ista kao u primeru operativnog sistema ispod. Fotografije
 * su Skeylo snimanja; Neto materijal (iza lozinke) ovde se ne koristi.
 */

export const OR = "#d87928";
export const GOLD = "#f0b656";
export const STAGE = "#0c0b09";
export const INK = "#141210";
export const PAPER = "#FBFAF6";
export const LINE = "#E6E1D6";
export const MUTED = "#6F6A60";
export const GREEN = "#16A34A";
export const IG_BLUE = "#0095F6";
export const IG_GRAD = "linear-gradient(45deg, #F9CE34, #EE2A7B 50%, #6228D7)";
export const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
export const DISPLAY =
  "var(--font-display), ui-sans-serif, system-ui, sans-serif";

export const BRAND = "Tvoja firma";
export const HANDLE = "tvoja.firma";
export const DOMAIN = "tvoj-sajt.rs";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const POP = { type: "spring" as const, stiffness: 320, damping: 17 };

export const fmt = (n: number) => Math.round(n).toLocaleString("de-DE");

/* ---------------------------------------------------------------- hooks */

/** Postaje true `ms` posle mount-a (scena "nešto se desi malo kasnije"). */
export function useAt(ms: number) {
  const reduce = useReducedMotion();
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (reduce) {
      setOn(true);
      return;
    }
    const t = setTimeout(() => setOn(true), ms);
    return () => clearTimeout(t);
  }, [ms, reduce]);
  return on;
}

/** Koliko je slova otkucano: `total`, jedno na svakih `every` ms. */
export function useTyping(total: number, start: number, every: number) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduce) {
      setN(total);
      return;
    }
    let iv: ReturnType<typeof setInterval> | undefined;
    const t = setTimeout(() => {
      iv = setInterval(
        () =>
          setN((k) => {
            if (k + 1 >= total && iv) clearInterval(iv);
            return Math.min(total, k + 1);
          }),
        every,
      );
    }, start);
    return () => {
      clearTimeout(t);
      if (iv) clearInterval(iv);
    };
  }, [total, start, every, reduce]);
  return n;
}

/** Broj koji naraste od `from` do `to`. */
export function CountUp({
  to,
  from = 0,
  start = 0,
  ms = 1300,
}: {
  to: number;
  from?: number;
  start?: number;
  ms?: number;
}) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(from);
  useEffect(() => {
    if (reduce) {
      setV(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now() + start;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / ms));
      setV(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, from, start, ms, reduce]);
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(v)}</span>;
}

/* ------------------------------------------------------------ products */

export type Blend = {
  name: string;
  size: string;
  was: number;
  now: number;
  bag: string;
  label: string;
  bean: string;
  tint: string;
};

export const BLENDS: Blend[] = [
  {
    name: "Espresso",
    size: "250 g",
    was: 990,
    now: 840,
    bag: "#2A1C14",
    label: OR,
    bean: "#fff",
    tint: "#F4E9DF",
  },
  {
    name: "Filter kafa",
    size: "250 g",
    was: 920,
    now: 790,
    bag: "#EDE1CB",
    label: "#2A1C14",
    bean: "#fff",
    tint: "#F7F0E4",
  },
  {
    name: "Turska kafa",
    size: "200 g",
    was: 420,
    now: 360,
    bag: "#1F4D3A",
    label: GOLD,
    bean: "#2A1C14",
    tint: "#E7F0EA",
  },
];

export const off = (b: Blend) => Math.round((1 - b.now / b.was) * 100);

/** Kesa kafe, crtana; skalira se sa roditeljem (100% × 100%). */
export function Bag({ blend }: { blend: Blend }) {
  const s = { stroke: "#1A1A1A", strokeWidth: 2 } as const;
  return (
    <svg viewBox="0 0 64 64" className="block h-full w-full" aria-hidden>
      <path
        d="M17 15h30l3 41a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z"
        fill={blend.bag}
        {...s}
        strokeLinejoin="round"
      />
      <path
        d="M17 15l2-8h26l2 8z"
        fill={blend.bag}
        {...s}
        strokeLinejoin="round"
      />
      <path d="M17 15l2-8h26l2 8z" fill="rgba(0,0,0,0.22)" />
      <path d="M19 11h26" stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
      <circle
        cx="41"
        cy="21"
        r="1.7"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
      />
      <rect
        x="20"
        y="27"
        width="24"
        height="21"
        rx="2.5"
        fill={blend.label}
        {...s}
      />
      <g transform="rotate(28 32 37.5)">
        <ellipse cx="32" cy="37.5" rx="5" ry="7" fill={blend.bean} />
        <path
          d="M32 31c-2 3 2 6 0 13"
          stroke={blend.label}
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/** Logo "Tvoja firma" kao mala nalepnica (sajt, oglas, skripta). */
export function BrandChip({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`inline-block -rotate-2 whitespace-nowrap px-[0.6em] py-[0.1em] font-black italic leading-normal text-white ${className}`}
      style={{
        background: OR,
        borderRadius: "0.25em 0.7em 0.25em 0.25em",
        fontFamily: DISPLAY,
        ...style,
      }}
    >
      {BRAND}
    </span>
  );
}

/* -------------------------------------------------------------- motion */

/** Klik mišem ili prstom: krug koji se raširi. */
export function Ripple({
  at,
  className = "",
}: {
  at: number;
  className?: string;
}) {
  return (
    <motion.span
      aria-hidden
      className={`pointer-events-none absolute h-[3em] w-[3em] -translate-x-1/2 -translate-y-1/2 rounded-full ${className}`}
      style={{ background: "rgba(255,255,255,0.55)" }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1, 1.6], opacity: [0, 0.9, 0] }}
      transition={{ delay: at, duration: 0.6 }}
    />
  );
}

/** Dodir prsta na dugme: tačka koja sleti i prsten koji se širi. */
export function Tap({ at = 0 }: { at?: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-[72%] top-1/2 z-10"
    >
      <motion.span
        className="absolute block h-[2.6em] w-[2.6em] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.18em] border-white"
        style={{ background: "rgba(0,0,0,0.28)" }}
        initial={{ scale: 1.6, opacity: 0 }}
        animate={{ scale: [1.6, 1, 0.9, 1], opacity: [0, 1, 1, 0] }}
        transition={{ delay: at, duration: 1.3, times: [0, 0.2, 0.35, 1] }}
      />
      <motion.span
        className="absolute block h-[2.6em] w-[2.6em] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.15em] border-white"
        initial={{ scale: 1, opacity: 0 }}
        animate={{ scale: [1, 2.4], opacity: [0.9, 0] }}
        transition={{ delay: at + 0.3, duration: 0.55 }}
      />
    </span>
  );
}

/**
 * Fotografija koja "živi" kao snimak: polako prilazi (Ken Burns) i blago se
 * njiše kao kamera iz ruke. Samo transform, bez promene rasporeda.
 */
export function Footage({
  src,
  pos = "50% 50%",
  sizes,
  from = 1.14,
}: {
  src: string;
  pos?: string;
  sizes: string;
  from?: number;
}) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ scale: from }}
      animate={{ scale: 1.02 }}
      transition={{ duration: 5, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          x: ["0%", "0.6%", "-0.4%", "0.2%", "0%"],
          y: ["0%", "-0.4%", "0.3%", "0.5%", "0%"],
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
          style={{ objectPosition: pos }}
        />
      </motion.div>
    </motion.div>
  );
}

/* --------------------------------------------------------------- phone */

/**
 * Telefon u em jedinicama: visina iz --ph, sve unutra je u em (1em = visina/44),
 * pa ekran izgleda isto na svakoj veličini.
 */
export const PHONE_H = "clamp(400px, calc(100svh - 250px), 560px)";

export function Phone({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden
      className="relative mx-auto flex-none select-none"
      style={{
        height: "var(--ph)",
        width: "calc(var(--ph) * 0.49)",
        fontSize: "calc(var(--ph) / 44)",
        fontFamily: DISPLAY,
      }}
    >
      <div
        className="absolute inset-0 p-[0.55em]"
        style={{
          background: "#1b1b1d",
          borderRadius: "3.4em",
          boxShadow:
            "0 0 0 1.5px #8d8d92, 0 0 0 3px #3a3a3c, 0 30px 60px -30px rgba(0,0,0,0.85)",
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden"
          style={{ borderRadius: "2.9em", isolation: "isolate" }}
        >
          {children}
          <span className="absolute left-1/2 top-[0.6em] z-30 block h-[1.7em] w-[5.6em] -translate-x-1/2 rounded-full bg-black" />
        </div>
      </div>
    </div>
  );
}
