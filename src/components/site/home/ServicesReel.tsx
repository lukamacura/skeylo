"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  Check,
  Compass,
  Globe,
  Megaphone,
  MousePointer2,
  PenLine,
  Scissors,
  ShoppingCart,
  Video,
} from "lucide-react";
import {
  BLENDS,
  BRAND,
  Bag,
  BrandChip,
  DISPLAY,
  DOMAIN,
  EASE_OUT,
  GREEN,
  MONO,
  OR,
  POP,
  Ripple,
  STAGE,
  fmt,
  off,
  useAt,
  useTyping,
} from "./reelKit";
import Production, { preloadStudio } from "./Production";
import { PHASE_MS } from "./productionTimeline";

/*
 * "Šta radimo" na početnoj (Luka, 22.11.2026): strategija, skripte, snimanje,
 * montaža, Meta i Google oglasi i kompletan sajt, svaka kao mala animacija
 * umesto reda teksta. Ista ideja kao Neto deck (neto/redizajn/services.tsx),
 * ali u bojama sajta, sa Skeylo fotografijama i izmišljenom "Tvoja firma".
 *
 * Jedna scena 34 × 24 em; veličina fonta prati širinu scene (cqw), pa scena
 * izgleda isto na telefonu i na laptopu. Vrti se samo dok je na ekranu.
 *
 * Snimanje, Montaža i Oglasi su jedna scena (Production.tsx): 3D studio, pa
 * isti kadar u montaži, pa isti klip na mrežama, bez reza između njih.
 */

const [ESPRESSO] = BLENDS;
const Cursor = () => (
  <MousePointer2
    className="h-[1.5em] w-[1.5em]"
    fill="#111"
    stroke="#fff"
    strokeWidth={1.5}
  />
);

/* ------------------------------------------------------------------------ */
/* 1. Strategija: meta, strela, tri papirića                                 */
/* ------------------------------------------------------------------------ */

const NOTES = [
  { k: "Publika", v: "Novi Sad, 25–45", bg: "#FFE57A", r: -2.5 },
  { k: "Ponuda", v: "−15% prva porudžbina", bg: "#FFC9A3", r: 1.8 },
  { k: "Kanal", v: "Instagram + Google", bg: "#A7F3D0", r: -1.2 },
];
const BULL = { x: 9.5, y: 12 };

function Strategy() {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "2em 2em",
      }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 34 24"
        preserveAspectRatio="none"
        aria-hidden
      >
        {NOTES.map((_, i) => (
          <motion.path
            key={i}
            d={`M${BULL.x} ${BULL.y} L18.6 ${5 + i * 6.3}`}
            stroke="rgba(255,255,255,0.45)"
            strokeWidth={0.08}
            strokeDasharray="0.35 0.3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.3 + i * 0.25, duration: 0.4 }}
          />
        ))}
      </svg>
      <svg
        className="absolute"
        style={{
          left: `${BULL.x - 7}em`,
          top: `${BULL.y - 7}em`,
          width: "14em",
          height: "14em",
        }}
        viewBox="0 0 100 100"
        aria-hidden
      >
        {[46, 34, 22, 11].map((r, i) => (
          <motion.circle
            key={r}
            cx={50}
            cy={50}
            r={r}
            fill={i % 2 ? "rgba(255,255,255,0.06)" : "none"}
            stroke={i === 3 ? OR : "#fff"}
            strokeWidth={i === 3 ? 3 : 2}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.12, duration: 0.55 }}
          />
        ))}
        <motion.circle
          cx={50}
          cy={50}
          r={4.5}
          fill={OR}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...POP, delay: 0.6 }}
        />
      </svg>
      <motion.span
        aria-hidden
        className="absolute block h-[6em] w-[6em] rounded-full border-[0.2em]"
        style={{
          left: `${BULL.x - 3}em`,
          top: `${BULL.y - 3}em`,
          borderColor: OR,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5], opacity: [0.9, 0] }}
        transition={{ delay: 1.15, duration: 0.6 }}
      />
      <motion.svg
        aria-hidden
        className="absolute"
        style={{
          left: `${BULL.x}em`,
          top: `${BULL.y - 2.6}em`,
          width: "9em",
          height: "2.6em",
          overflow: "visible",
        }}
        viewBox="0 0 90 26"
        initial={{ x: "16em", y: "-7em", opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.4, ease: "easeIn" }}
      >
        <g transform="rotate(-17 0 26)">
          <path d="M0 26 L80 26" stroke="#fff" strokeWidth={3} />
          <path d="M0 26 L12 20 L12 32 Z" fill="#fff" />
          <path
            d="M72 26 L88 16 M72 26 L88 36 M78 26 L90 19 M78 26 L90 33"
            stroke={OR}
            strokeWidth={3}
          />
        </g>
      </motion.svg>
      {NOTES.map((n, i) => (
        <motion.div
          key={n.k}
          className="absolute px-[0.8em] py-[0.55em] text-[#111] shadow-[0_0.4em_1em_rgba(0,0,0,0.35)]"
          style={{
            left: "18.6em",
            top: `${3.1 + i * 6.3}em`,
            width: "13.6em",
            background: n.bg,
            borderRadius: "0.25em",
          }}
          initial={{ opacity: 0, scale: 0.5, rotate: n.r * 4 }}
          animate={{ opacity: 1, scale: 1, rotate: n.r }}
          transition={{ ...POP, delay: 1.45 + i * 0.25 }}
        >
          <span
            className="block text-[0.72em] font-semibold uppercase tracking-[0.12em] opacity-60"
            style={{ fontFamily: MONO }}
          >
            {n.k}
          </span>
          <b className="block text-[1.2em] font-extrabold leading-[1.15]">
            {n.v}
          </b>
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* 2. Skripte: stranica koja se sama piše                                    */
/* ------------------------------------------------------------------------ */

const SCRIPT: [string, string][] = [
  ["HOOK", "„Ovu kafu market nema.”"],
  ["KADAR 1", "Pržionica, krupan kadar."],
  ["KADAR 2", "Zrna padaju, kamera klizi."],
  ["CTA", "Poruči preko linka."],
];
const SCRIPT_CHARS = SCRIPT.reduce((n, [, t]) => n + t.length, 0);

function Script() {
  const typed = useTyping(SCRIPT_CHARS, 350, 24);
  let left = typed;
  let row = 0;
  const shown = SCRIPT.map(([, text], i) => {
    const take = Math.max(0, Math.min(text.length, left));
    left -= take;
    if (take > 0) row = i;
    return take;
  });
  const done = typed >= SCRIPT_CHARS;
  return (
    <div className="absolute inset-0 grid place-items-center">
      <motion.div
        className="relative h-[20.6em] w-[28.5em] overflow-hidden text-[#111] shadow-[0_1em_2.5em_rgba(0,0,0,0.5)]"
        style={{
          background: "#FBFAF6",
          backgroundImage:
            "repeating-linear-gradient(transparent 0 3.05em, rgba(37,99,235,0.14) 3.05em calc(3.05em + 1px))",
          backgroundPositionY: "3.4em",
          borderRadius: "0.35em",
        }}
        initial={{ opacity: 0, y: "2em", rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -1.5 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <span
          aria-hidden
          className="absolute bottom-0 left-[5.6em] top-0 w-px"
          style={{ background: "rgba(216,121,40,0.4)" }}
        />
        <div className="flex items-center justify-between px-[1.2em] pt-[1em]">
          <span
            className="text-[0.75em] font-semibold uppercase tracking-[0.14em] text-[#6B6B6B]"
            style={{ fontFamily: MONO }}
          >
            Skripta · Reel 01
          </span>
          <BrandChip className="text-[0.95em]" />
        </div>
        <div className="mt-[1.05em] grid gap-[0.85em] px-[1.2em]">
          {SCRIPT.map(([label, text], i) => (
            <div
              key={label}
              className="relative flex items-baseline gap-[0.9em]"
            >
              <span
                className="w-[6.4em] flex-none whitespace-nowrap text-[0.72em] font-semibold tracking-[0.08em]"
                style={{
                  fontFamily: MONO,
                  color: i === 0 || i === 3 ? OR : "#8A8A8A",
                }}
              >
                {label}
              </span>
              <span className="relative text-[1.18em] font-bold leading-[1.3]">
                {i === 0 && shown[0] === text.length && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-x-[-0.15em] bottom-[0.05em] top-[0.35em] origin-left"
                    style={{ background: "rgba(240,182,86,0.55)" }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.35 }}
                  />
                )}
                <span className="relative">{text.slice(0, shown[i])}</span>
                {!done && row === i && (
                  <motion.i
                    aria-hidden
                    className="relative ml-[0.05em] inline-block h-[1em] w-[0.1em] translate-y-[0.15em] bg-[#111]"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </span>
            </div>
          ))}
        </div>
        <motion.span
          aria-hidden
          className="absolute right-[1.2em] grid h-[2.4em] w-[2.4em] place-items-center rounded-full text-white"
          style={{ background: OR, top: "4.1em" }}
          animate={{ y: `${row * 3.35}em`, rotate: done ? 0 : [0, -12, 0] }}
          transition={{
            y: { type: "spring", stiffness: 260, damping: 24 },
            rotate: { duration: 0.5, repeat: done ? 0 : Infinity },
          }}
        >
          <PenLine className="h-[1.2em] w-[1.2em]" />
        </motion.span>
        {done && (
          <motion.span
            className="absolute bottom-[1em] right-[1.2em] flex items-center gap-[0.35em] rounded-full px-[0.8em] py-[0.3em] text-[0.85em] font-extrabold text-white"
            style={{ background: GREEN }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={POP}
          >
            <Check className="h-[1em] w-[1em]" strokeWidth={3} />
            Odobreno
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* 6. Sajt: skica, pa pravi sajt, pa ista stvar na telefonu                   */
/* ------------------------------------------------------------------------ */

function Block({
  real,
  at,
  children,
  className = "",
}: {
  real: boolean;
  at: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-[0.4em]"
        animate={real ? { opacity: 0 } : { opacity: [0.5, 0.9, 0.5] }}
        transition={
          real
            ? { delay: at, duration: 0.3 }
            : { duration: 1, repeat: Infinity }
        }
        style={{ background: "#E4E2DC" }}
      />
      <motion.div
        className="relative h-full"
        initial={{ opacity: 0, y: "0.5em" }}
        animate={real ? { opacity: 1, y: 0 } : { opacity: 0, y: "0.5em" }}
        transition={{ delay: at, duration: 0.4, ease: EASE_OUT }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function Site() {
  const real = useAt(1000);
  const bought = useAt(3000);
  return (
    <div className="absolute inset-0" style={{ background: STAGE }}>
      <motion.div
        className="absolute left-[1.4em] top-[1.4em] h-[21.2em] w-[23.4em] overflow-hidden rounded-[0.8em] bg-white text-[#111]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-[0.5em] border-b border-[#E4E2DC] px-[0.8em] py-[0.55em]">
          <span className="flex gap-[0.25em]">
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <i
                key={c}
                className="block h-[0.55em] w-[0.55em] rounded-full"
                style={{ background: c }}
              />
            ))}
          </span>
          <span
            className="mx-auto rounded-full bg-[#F2F0EA] px-[1em] py-[0.15em] text-[0.65em] text-[#6B6B6B]"
            style={{ fontFamily: MONO }}
          >
            {DOMAIN}
          </span>
        </div>
        <div className="grid gap-[0.6em] p-[0.8em]">
          <Block real={real} at={0} className="h-[2.2em]">
            <div
              className="flex h-full items-center justify-between rounded-[0.4em] px-[0.6em]"
              style={{ background: "#2A1C14" }}
            >
              <b className="text-[0.95em] font-black italic text-white">
                {BRAND}
              </b>
              <span className="flex items-center gap-[0.8em] text-[0.65em] font-bold text-white">
                <span>Kafe</span>
                <span>O nama</span>
                <span>Kontakt</span>
                <ShoppingCart className="h-[1.4em] w-[1.4em]" />
              </span>
            </div>
          </Block>
          <Block real={real} at={0.15} className="h-[7.4em]">
            <div className="flex h-full items-center justify-between rounded-[0.4em] bg-[#F7F2EA] px-[1em]">
              <div>
                <span
                  className="block text-[0.6em] tracking-[0.14em] text-[#6B6B6B]"
                  style={{ fontFamily: MONO }}
                >
                  SVEŽE PRŽENO
                </span>
                <b className="block text-[1.55em] font-black italic leading-[1.05]">
                  Kafa iz pržionice.
                  <br />
                  <span style={{ color: OR }}>Na tvoja vrata.</span>
                </b>
                <motion.span
                  className="relative mt-[0.5em] inline-flex items-center gap-[0.3em] rounded-[0.35em] px-[0.8em] py-[0.35em] text-[0.75em] font-extrabold text-white"
                  animate={{ backgroundColor: bought ? GREEN : OR }}
                >
                  {bought && (
                    <Check className="h-[1em] w-[1em]" strokeWidth={3} />
                  )}
                  {bought ? "Poručeno" : "Poruči online"}
                  {bought && <Ripple at={0} className="left-1/2 top-1/2" />}
                </motion.span>
              </div>
              <span className="block h-[5.8em] w-[5.8em] flex-none">
                <Bag blend={ESPRESSO} />
              </span>
            </div>
          </Block>
          <div className="grid grid-cols-3 gap-[0.6em]">
            {BLENDS.map((p, i) => (
              <Block
                key={p.name}
                real={real}
                at={0.3 + i * 0.12}
                className="h-[7.6em]"
              >
                <div className="flex h-full flex-col rounded-[0.4em] border border-[#E4E2DC] p-[0.45em]">
                  <span
                    className="relative block h-[3.6em] rounded-[0.3em] p-[0.3em]"
                    style={{ background: p.tint }}
                  >
                    <Bag blend={p} />
                    <span
                      className="absolute right-[0.2em] top-[0.2em] rounded-[0.2em] px-[0.25em] text-[0.55em] font-black italic text-white"
                      style={{ background: OR }}
                    >
                      −{off(p)}%
                    </span>
                  </span>
                  <b className="mt-[0.3em] truncate text-[0.62em] font-bold">
                    {p.name} {p.size}
                  </b>
                  <span className="text-[0.62em]">
                    <s className="text-[#8A8A8A]">{fmt(p.was)}</s>{" "}
                    <b style={{ color: OR }}>{fmt(p.now)}</b>
                  </span>
                </div>
              </Block>
            ))}
          </div>
        </div>
        <motion.span
          aria-hidden
          className="absolute"
          style={{ left: "6.2em", top: "11.4em" }}
          initial={{ x: "8em", y: "6em", opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{ delay: 2.3, duration: 0.6, ease: EASE_OUT }}
        >
          <Cursor />
        </motion.span>
      </motion.div>
      <motion.div
        className="absolute right-[1.4em] top-[3.2em] h-[17.4em] w-[8.4em] overflow-hidden rounded-[1.3em] border-[0.35em] border-[#1b1b1d] bg-white text-[#111] shadow-[0_0_0_1px_#8d8d92]"
        initial={{ x: "10em", opacity: 0 }}
        animate={{ x: 0, opacity: real ? 1 : 0 }}
        transition={{ delay: 1.6, type: "spring", stiffness: 200, damping: 22 }}
      >
        <div
          className="flex h-[1.9em] items-end justify-between px-[0.5em] pb-[0.25em]"
          style={{ background: "#2A1C14" }}
        >
          <b className="text-[0.7em] font-black italic text-white">{BRAND}</b>
          <ShoppingCart className="h-[0.8em] w-[0.8em] text-white" />
        </div>
        <div className="bg-[#F7F2EA] px-[0.5em] py-[0.5em]">
          <b className="block text-[0.8em] font-black italic leading-[1.05]">
            Kafa iz pržionice.{" "}
            <span style={{ color: OR }}>Na tvoja vrata.</span>
          </b>
          <span
            className="mt-[0.35em] inline-block rounded-[0.3em] px-[0.5em] py-[0.15em] text-[0.55em] font-extrabold text-white"
            style={{ background: OR }}
          >
            Poruči online
          </span>
        </div>
        <div className="grid gap-[0.35em] p-[0.4em]">
          {BLENDS.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-[0.35em] rounded-[0.3em] border border-[#E4E2DC] p-[0.25em]"
            >
              <span
                className="block h-[1.9em] w-[1.9em] flex-none rounded-[0.2em] p-[0.15em]"
                style={{ background: p.tint }}
              >
                <Bag blend={p} />
              </span>
              <span className="min-w-0 text-[0.5em] leading-[1.2]">
                <b className="block truncate">{p.name}</b>
                <b style={{ color: OR }}>{fmt(p.now)} RSD</b>
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Reel                                                                      */
/* ------------------------------------------------------------------------ */

const BEAT = 4200;

/** Production: Snimanje, Montaža i Oglasi su faze 0, 1 i 2 iste scene. */
const PROD = 2;

const CATS = [
  {
    icon: Compass,
    title: "Strategija",
    line: "Kome, šta i gde prodajemo.",
    Scene: Strategy,
    ms: BEAT,
  },
  {
    icon: PenLine,
    title: "Skripte",
    line: "Svaki video počinje na papiru.",
    Scene: Script,
    ms: BEAT,
  },
  {
    icon: Video,
    title: "Snimanje",
    line: "Naša ekipa, kod tebe u firmi.",
    Scene: null,
    ms: PHASE_MS[0],
  },
  {
    icon: Scissors,
    title: "Montaža",
    line: "Ritam, titlovi, poziv na akciju.",
    Scene: null,
    ms: PHASE_MS[1],
  },
  {
    icon: Megaphone,
    title: "Meta i Google oglasi",
    line: "Pravi ljudi, u pravom trenutku.",
    Scene: null,
    ms: PHASE_MS[2],
  },
  {
    icon: Globe,
    title: "Kompletan sajt",
    line: "Od dizajna do porudžbine.",
    Scene: Site,
    ms: BEAT,
  },
] as const;

export default function ServicesReel() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { amount: 0.35 });
  const [at, setAt] = useState(0);
  const [run, setRun] = useState(0);
  /** dok se three.js učitava, Snimanje čeka (ne broji vreme) */
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (active) preloadStudio();
  }, [active]);

  useEffect(() => {
    if (!active || held) return;
    const t = setTimeout(
      () => setAt((a) => (a + 1) % CATS.length),
      CATS[at].ms,
    );
    return () => clearTimeout(t);
  }, [active, at, run, held]);

  const pick = (i: number) => {
    setAt(i);
    setRun((r) => r + 1);
  };
  const { Scene } = CATS[at];
  const prod = at >= PROD && at < PROD + 3;
  const sceneKey = prod ? `prod-${run}` : `${at}-${run}`;

  return (
    <div
      ref={ref}
      className="grid items-center gap-3 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12"
    >
      {/* šira ekrana: šest stavki kao lista */}
      <ol className="hidden gap-1.5 lg:grid">
        {CATS.map((c, i) => {
          const on = i === at;
          const Icon = c.icon;
          return (
            <li key={c.title}>
              <button
                type="button"
                onClick={() => pick(i)}
                aria-current={on ? "step" : undefined}
                className={`relative flex w-full cursor-pointer items-center gap-4 overflow-hidden rounded-xl px-3 py-2.5 text-left ring-1 ring-inset transition-colors duration-300 ${
                  on
                    ? "bg-white/[0.05] ring-white/10"
                    : "ring-transparent hover:bg-white/[0.03]"
                }`}
              >
                <span
                  className={`grid size-11 flex-none place-items-center rounded-[10px] transition-colors duration-300 ${
                    on
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/[0.05] text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <b
                    className={`block font-display text-lg font-bold leading-tight transition-colors duration-300 ${
                      on ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {c.title}
                  </b>
                  <span
                    className={`block text-sm leading-snug transition-colors duration-300 ${
                      on ? "text-foreground/70" : "text-muted-foreground/60"
                    }`}
                  >
                    {c.line}
                  </span>
                </span>
                {on && active && !held && (
                  <motion.i
                    key={`${at}-${run}`}
                    aria-hidden
                    className="absolute bottom-0 left-0 block h-[2px] w-full origin-left bg-primary"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: c.ms / 1000, ease: "linear" }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <div>
        <div
          className="relative aspect-[17/12] w-full overflow-hidden rounded-2xl text-white ring-1 ring-white/12 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] sm:rounded-3xl"
          style={{ background: STAGE, containerType: "inline-size" }}
        >
          <div
            className="absolute inset-0"
            style={{ fontSize: "calc(100cqw / 34)", fontFamily: DISPLAY }}
          >
            <AnimatePresence initial={false}>
              {active && (
                <motion.div
                  key={sceneKey}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                >
                  {prod ? (
                    <Production
                      phase={(at - PROD) as 0 | 1 | 2}
                      hold={setHeld}
                    />
                  ) : (
                    Scene && <Scene />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* telefon: red ikonica i naziv one koja je na sceni */}
        <div className="mt-4 lg:hidden">
          <div className="relative flex items-center justify-between">
            <span
              aria-hidden
              className="absolute left-4 right-4 top-1/2 h-[2px] -translate-y-1/2 bg-white/10"
            />
            <motion.span
              aria-hidden
              className="absolute left-4 right-4 top-1/2 h-[2px] origin-left -translate-y-1/2 bg-primary"
              animate={{ scaleX: at / (CATS.length - 1) }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
            />
            {CATS.map((c, i) => {
              const on = i === at;
              const Icon = c.icon;
              return (
                <button
                  key={c.title}
                  type="button"
                  onClick={() => pick(i)}
                  aria-label={c.title}
                  aria-current={on ? "step" : undefined}
                  className={`relative grid size-9 cursor-pointer place-items-center rounded-full transition-colors duration-300 ${
                    on
                      ? "bg-primary text-primary-foreground shadow-[0_0_0_4px_rgba(216,121,40,0.25)]"
                      : i < at
                        ? "bg-[#2a1a0e] text-primary"
                        : "bg-[#151310] text-muted-foreground ring-1 ring-inset ring-white/10"
                  }`}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
          <div className="relative mt-3 h-[46px] overflow-hidden text-center">
            <AnimatePresence initial={false}>
              <motion.div
                key={at}
                className="absolute inset-0"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <b className="block font-display text-base font-bold leading-tight">
                  <span
                    className="mr-1.5 text-xs text-primary"
                    style={{ fontFamily: MONO }}
                  >
                    0{at + 1}
                  </span>
                  {CATS[at].title}
                </b>
                <span className="block text-[13px] text-muted-foreground">
                  {CATS[at].line}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
