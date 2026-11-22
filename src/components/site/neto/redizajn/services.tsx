"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Compass,
  Globe,
  MapPin,
  Megaphone,
  MousePointer2,
  PenLine,
  Scissors,
  Search,
  ShoppingCart,
  Video,
} from "lucide-react";
import {
  DISPLAY,
  EASE_OUT,
  Headline,
  MONO,
  NETO_RADIUS,
  POP_SPRING,
  RED,
  Slide,
  Visual,
  fmt,
  useSlideActive,
} from "../primitives";
import { MiniLogo, PRODUCTS, off } from "../visuals";

/* ------------------------------------------------------------------------
   What Skeylo does, before the ERP part (Luka, 2026-11-22): strategy,
   scripts, filming, editing, running Meta and Google ads, and the whole
   website, each one as a little motion piece rather than a line of text.

   One stage plays the six in a row, like a reel; the list (a column on a
   wide screen, a row of icons on a phone) shows where we are and jumps on
   a tap. Every scene is drawn in em on a 34 × 24 em stage whose font size
   follows the stage's width (container query units), so a scene looks the
   same on a phone and on a laptop.

   The footage is the store videos in /public/clients/neto (video_1..3).
   ------------------------------------------------------------------------ */

const [MILK, BREAD, , , COFFEE] = PRODUCTS;
const GREEN = "#16A34A";
const META_BLUE = "#0866FF";

/* Something that happens a moment after the scene opens. */
function useAt(ms: number) {
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

/* Characters typed so far: `total` of them, one every `every` ms. */
function useTyping(total: number, start: number, every: number) {
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

function Ripple({ at, className = "" }: { at: number; className?: string }) {
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

const MetaMark = ({ size = "1em" }: { size?: string }) => (
  <svg
    viewBox="0 0 24 24"
    style={{ width: size, height: size }}
    fill="none"
    stroke="currentColor"
    strokeWidth={2.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M2.5 14.6c0-4.3 1.9-8.1 4.6-8.1 2 0 3.4 2 4.9 4.6 1.5 2.7 2.9 6.4 5.6 6.4 2.2 0 3.9-1.6 3.9-4.4 0-3.6-1.7-6.6-4.2-6.6-2 0-3.6 2-5.3 4.9-1.6 2.8-3.1 6.1-5.7 6.1-2.1 0-3.8-1.3-3.8-3z" />
  </svg>
);

/* ------------------------------------------------------------------------ */
/* 1. Strategy: the target, the arrow, the three notes                       */
/* ------------------------------------------------------------------------ */

const NOTES = [
  { k: "Publika", v: "Novi Sad, 25–55", bg: "#FFE57A", r: -2.5 },
  { k: "Ponuda", v: "−5% u aplikaciji", bg: "#FFB3C1", r: 1.8 },
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
      {/* strings from the bullseye to the notes */}
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
            stroke={i === 3 ? RED : "#fff"}
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
          fill={RED}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...POP_SPRING, delay: 0.6 }}
        />
      </svg>
      {/* the hit */}
      <motion.span
        aria-hidden
        className="absolute block h-[6em] w-[6em] rounded-full border-[0.2em]"
        style={{
          left: `${BULL.x - 3}em`,
          top: `${BULL.y - 3}em`,
          borderColor: RED,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5], opacity: [0.9, 0] }}
        transition={{ delay: 1.15, duration: 0.6 }}
      />
      {/* the arrow, tip at the bullseye, flying in from the top right */}
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
            stroke={RED}
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
          transition={{ ...POP_SPRING, delay: 1.45 + i * 0.25 }}
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
/* 2. Scripts: a page that writes itself                                     */
/* ------------------------------------------------------------------------ */

const SCRIPT: [string, string][] = [
  ["HOOK", "„Koliko danas plaćate kafu?”"],
  ["KADAR 1", "Kasa u Fruškogorskoj, krupno."],
  ["KADAR 2", "Polica sa akcijama, kamera klizi."],
  ["CTA", "Skenirajte QR na vratima."],
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
          style={{ background: "rgba(226,35,26,0.35)" }}
        />
        <div className="flex items-center justify-between px-[1.2em] pt-[1em]">
          <span
            className="text-[0.75em] font-semibold uppercase tracking-[0.14em] text-[#6B6B6B]"
            style={{ fontFamily: MONO }}
          >
            Skripta · Reel 01
          </span>
          <MiniLogo className="!px-[0.6em] !py-0 !text-[0.95em]" />
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
                  color: i === 0 || i === 3 ? RED : "#8A8A8A",
                }}
              >
                {label}
              </span>
              <span className="relative text-[1.18em] font-bold leading-[1.3]">
                {i === 0 && shown[0] === text.length && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-x-[-0.15em] bottom-[0.05em] top-[0.35em] -z-0 origin-left"
                    style={{ background: "rgba(255,214,10,0.6)" }}
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
        {/* the pen follows the line being written */}
        <motion.span
          aria-hidden
          className="absolute right-[1.2em] grid h-[2.4em] w-[2.4em] place-items-center rounded-full text-white"
          style={{ background: RED, top: "4.1em" }}
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
            transition={POP_SPRING}
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
/* 3. Filming: a clap, then the viewfinder over the store                    */
/* ------------------------------------------------------------------------ */

function Timecode({ from = 0 }: { from?: number }) {
  const [f, setF] = useState(from);
  useEffect(() => {
    const iv = setInterval(() => setF((x) => x + 1), 40);
    return () => clearInterval(iv);
  }, []);
  const s = Math.floor(f / 25);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      00:{pad(Math.floor(s / 60))}:{pad(s % 60)}:{pad(f % 25)}
    </span>
  );
}

function Footage({ src }: { src: 1 | 2 | 3 }) {
  return (
    <video
      className="absolute inset-0 h-full w-full object-cover"
      src={`/clients/neto/video_${src}.mp4`}
      poster={`/clients/neto/video_${src}.webp`}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  );
}

function Corner({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`absolute h-[2.2em] w-[2.2em] border-white ${className}`}
    />
  );
}

function Shoot() {
  const focused = useAt(1500);
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.14 }}
        animate={{ scale: 1 }}
        transition={{ duration: 4, ease: "easeOut" }}
      >
        <Footage src={2} />
      </motion.div>
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55))",
        }}
      />
      {/* the viewfinder */}
      <motion.div
        className="absolute inset-0 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.3 }}
      >
        {[33.33, 66.66].map((p) => (
          <span
            key={`v${p}`}
            className="absolute bottom-0 top-0 w-px bg-white/25"
            style={{ left: `${p}%` }}
          />
        ))}
        {[33.33, 66.66].map((p) => (
          <span
            key={`h${p}`}
            className="absolute left-0 right-0 h-px bg-white/25"
            style={{ top: `${p}%` }}
          />
        ))}
        <Corner className="left-[1.3em] top-[1.3em] border-l-[0.2em] border-t-[0.2em]" />
        <Corner className="right-[1.3em] top-[1.3em] border-r-[0.2em] border-t-[0.2em]" />
        <Corner className="bottom-[1.3em] left-[1.3em] border-b-[0.2em] border-l-[0.2em]" />
        <Corner className="bottom-[1.3em] right-[1.3em] border-b-[0.2em] border-r-[0.2em]" />
        <div
          className="absolute left-[2.3em] top-[2.1em] flex items-center gap-[0.45em] text-[0.95em] font-semibold"
          style={{ fontFamily: MONO }}
        >
          <motion.i
            className="block h-[0.75em] w-[0.75em] rounded-full"
            style={{ background: "#FF3B30" }}
            animate={{ opacity: [1, 0.15, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          REC
        </div>
        <div
          className="absolute right-[2.3em] top-[2.1em] text-[0.95em] font-semibold"
          style={{ fontFamily: MONO }}
        >
          <Timecode from={60} />
        </div>
        <div
          className="absolute bottom-[2.1em] left-[2.3em] text-[0.85em] font-semibold"
          style={{ fontFamily: MONO }}
        >
          4K · 60 FPS
        </div>
        <div className="absolute bottom-[2.1em] right-[2.3em] flex h-[1.6em] items-end gap-[0.2em]">
          {[0.9, 0.6, 1, 0.75, 0.5].map((h, i) => (
            <motion.i
              key={i}
              className="block w-[0.32em] origin-bottom rounded-[0.1em]"
              style={{
                height: "100%",
                background: i > 2 ? "#FFD60A" : "#4ADE80",
              }}
              animate={{ scaleY: [h * 0.4, h, h * 0.55, h * 0.9, h * 0.4] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.08 }}
            />
          ))}
        </div>
        {/* autofocus finds the shelf */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[7em] w-[9.5em] border-[0.15em]"
          style={{
            x: "-50%",
            y: "-50%",
            borderColor: focused ? "#4ADE80" : "#fff",
          }}
          initial={{ scale: 1.6, opacity: 0 }}
          animate={{ scale: focused ? [1, 0.94, 1] : 1, opacity: 1 }}
          transition={{ delay: focused ? 0 : 0.85, duration: 0.35 }}
        >
          <span
            className="absolute -top-[1.6em] left-0 text-[0.8em] font-semibold"
            style={{ fontFamily: MONO, color: focused ? "#4ADE80" : "#fff" }}
          >
            {focused ? "AF ✓" : "AF"}
          </span>
        </motion.div>
      </motion.div>
      {/* the clap */}
      <motion.div
        className="absolute left-1/2 top-1/2 w-[10em]"
        style={{ x: "-50%", y: "-50%" }}
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: 0.7, duration: 0.25 }}
      >
        <motion.div
          className="h-[1.6em] origin-bottom-left rounded-[0.2em]"
          style={{
            background:
              "repeating-linear-gradient(-45deg, #fff 0 0.9em, #111 0.9em 1.8em)",
          }}
          initial={{ rotate: -28 }}
          animate={{ rotate: 0 }}
          transition={{ delay: 0.25, duration: 0.15, ease: "easeIn" }}
        />
        <div className="mt-[0.15em] rounded-[0.25em] bg-[#111] px-[0.7em] py-[0.6em] text-white">
          <span
            className="block text-[0.7em] tracking-[0.12em]"
            style={{ fontFamily: MONO }}
          >
            NETO · REEL 01
          </span>
          <b className="block text-[1.3em] italic">Kadar 1 · Take 3</b>
        </div>
      </motion.div>
      <motion.span
        aria-hidden
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.55, 0] }}
        transition={{ delay: 0.4, duration: 0.35 }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* 4. Editing: the preview with captions, the timeline, the export           */
/* ------------------------------------------------------------------------ */

const CAPTIONS = [
  ["Novi", "Neto", "je", "tu."],
  ["−5%", "u", "aplikaciji."],
];
const WORDS = CAPTIONS.flat();
const CLIPS = [
  { w: 4.6, img: "/clients/neto/video_1.webp" },
  { w: 3.6, img: "/clients/neto/video_2.webp" },
  { w: 5.2, img: "/clients/neto/video_3.webp" },
  { w: 3.4, img: "/clients/neto/posle-kasa.webp" },
];
const WAVE = Array.from(
  { length: 46 },
  (_, i) => 0.25 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.45)) * 0.75,
);

function Captions() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const iv = setInterval(
      () => setW((x) => (x + 1) % (WORDS.length + 2)),
      330,
    );
    return () => clearInterval(iv);
  }, []);
  const line = w < CAPTIONS[0].length ? 0 : 1;
  const words = CAPTIONS[line];
  const offset = line ? CAPTIONS[0].length : 0;
  return (
    <div className="absolute inset-x-[0.4em] bottom-[2.6em] flex flex-wrap justify-center gap-x-[0.3em] text-center">
      {words.map((word, i) => {
        const k = offset + i;
        if (k > w) return null;
        const now = k === w;
        return (
          <motion.span
            key={`${line}-${word}`}
            className="rounded-[0.2em] px-[0.15em] text-[1.15em] font-black uppercase italic leading-[1.15]"
            style={{
              color: now ? "#111" : "#fff",
              background: now ? "#FFD60A" : "transparent",
              textShadow: now ? "none" : "0 0.08em 0.25em rgba(0,0,0,0.8)",
            }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={POP_SPRING}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
}

function Edit() {
  const exported = useAt(3300);
  let x = 0;
  return (
    <div className="absolute inset-0 bg-[#0B0B0B]">
      {/* preview, 9:16 */}
      <motion.div
        className="absolute left-[1.4em] top-[1.4em] h-[16.6em] w-[9.35em] overflow-hidden rounded-[0.9em] border-[0.22em] border-[#2A2A2A] bg-black"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <Footage src={1} />
        <Captions />
      </motion.div>
      {/* timeline */}
      <div className="absolute left-[12.2em] right-[1.4em] top-[1.4em] h-[16.6em] rounded-[0.7em] border border-[#262626] bg-[#151515] px-[0.9em] pt-[0.8em] text-white">
        <div
          className="flex items-center justify-between text-[0.72em] tracking-[0.12em] text-[#8A8A8A]"
          style={{ fontFamily: MONO }}
        >
          <span>TIMELINE</span>
          <Timecode from={250} />
        </div>
        <div className="relative mt-[0.9em] grid gap-[0.55em]">
          {/* text */}
          <div className="relative h-[2.1em] rounded-[0.3em] bg-[#1E1E1E]">
            {[
              [0.4, 5.6, "Novi Neto je tu."],
              [7.4, 8, "−5% u aplikaciji"],
            ].map(([l, w, t], i) => (
              <motion.span
                key={i}
                className="absolute inset-y-[0.25em] flex items-center truncate rounded-[0.25em] px-[0.5em] text-[0.72em] font-bold"
                style={{
                  left: `${l}em`,
                  width: `${w}em`,
                  background: "#8B5CF6",
                }}
                initial={{ opacity: 0, x: "-1em" }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.2, duration: 0.3 }}
              >
                {t}
              </motion.span>
            ))}
          </div>
          {/* video clips snap in */}
          <div className="relative h-[3.6em] rounded-[0.3em] bg-[#1E1E1E]">
            {CLIPS.map((c, i) => {
              const left = x;
              x += c.w + 0.15;
              return (
                <motion.span
                  key={i}
                  className="absolute inset-y-[0.25em] overflow-hidden rounded-[0.3em] border-[0.12em]"
                  style={{
                    left: `${left + 0.25}em`,
                    width: `${c.w}em`,
                    borderColor: i === 1 ? "#FFD60A" : "rgba(255,255,255,0.2)",
                    backgroundImage: `url(${c.img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  initial={{ x: "12em", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 26,
                    delay: 0.15 + i * 0.12,
                  }}
                />
              );
            })}
            {/* the cut */}
            <motion.span
              aria-hidden
              className="absolute -top-[1.7em] grid h-[1.6em] w-[1.6em] place-items-center rounded-full bg-white text-[#111]"
              style={{ left: `${CLIPS[0].w + 0.05}em` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1, 0] }}
              transition={{
                delay: 1.4,
                duration: 1.1,
                times: [0, 0.2, 0.3, 1],
              }}
            >
              <Scissors className="h-[0.95em] w-[0.95em]" />
            </motion.span>
          </div>
          {/* audio */}
          <div className="relative flex h-[2.6em] items-center gap-[0.12em] overflow-hidden rounded-[0.3em] bg-[#1E1E1E] px-[0.3em]">
            {WAVE.map((h, i) => (
              <motion.i
                key={i}
                className="block w-[0.22em] flex-none rounded-full"
                style={{ height: `${h * 100}%`, background: "#2DD4BF" }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.5 + i * 0.012, duration: 0.25 }}
              />
            ))}
          </div>
          {/* playhead: a full-width layer slid across, transform only */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-[0.3em] -top-[0.4em] left-0 w-full"
            initial={{ x: "0%" }}
            animate={{ x: "100%" }}
            transition={{ delay: 0.5, duration: 3.2, ease: "linear" }}
          >
            <span className="absolute bottom-0 left-0 top-0 w-[0.12em] bg-[#FF3B30]" />
            <span
              className="absolute -left-[0.45em] -top-[0.2em] h-0 w-0 border-x-[0.5em] border-t-[0.6em] border-x-transparent"
              style={{ borderTopColor: "#FF3B30" }}
            />
          </motion.div>
        </div>
      </div>
      {/* export */}
      <div className="absolute bottom-[1.3em] left-[1.4em] right-[1.4em] flex h-[3.4em] items-center gap-[0.9em] rounded-[0.7em] border border-[#262626] bg-[#151515] px-[1em] text-white">
        <span className="w-[12.5em] flex-none whitespace-nowrap text-[0.85em] font-bold">
          {exported ? (
            <span
              className="flex items-center gap-[0.35em]"
              style={{ color: "#4ADE80" }}
            >
              <Check className="h-[1.1em] w-[1.1em]" strokeWidth={3} />
              Spremno za objavu
            </span>
          ) : (
            "Export · 1080×1920"
          )}
        </span>
        <span className="h-[0.5em] flex-1 overflow-hidden rounded-full bg-[#262626]">
          <motion.i
            className="block h-full w-full origin-left rounded-full"
            style={{ background: exported ? "#4ADE80" : RED }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.6, duration: 1.7, ease: "easeInOut" }}
          />
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* 5. Meta and Google ads                                                    */
/* ------------------------------------------------------------------------ */

function Ticker({
  to,
  start,
  ms = 1300,
}: {
  to: number;
  start: number;
  ms?: number;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now() + start;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / ms));
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, start, ms]);
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(v)}</span>;
}

const QUERY = "prodavnica novi sad";
const CHART = "M0 34 C10 32 16 26 26 27 S42 18 52 19 S68 8 78 9 S92 2 100 1";

function Ads() {
  const typed = useTyping(QUERY.length, 600, 45);
  const found = useAt(1650);
  const clicked = useAt(2700);
  const roas = useAt(3000);
  return (
    <div className="absolute inset-0 bg-[#0B0B0B] text-[#111]">
      {/* Meta */}
      <motion.div
        className="absolute bottom-[3.6em] left-[1.4em] top-[1.4em] w-[15.2em] rounded-[0.8em] bg-white p-[1em]"
        initial={{ opacity: 0, x: "-1.5em" }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
      >
        <div className="flex items-center gap-[0.5em]">
          <span
            className="grid h-[2em] w-[2em] place-items-center rounded-[0.5em] text-white"
            style={{ background: META_BLUE }}
          >
            <MetaMark size="1.2em" />
          </span>
          <b className="text-[1.05em] font-extrabold">Meta oglasi</b>
          <span
            className="ml-auto flex items-center gap-[0.3em] text-[0.7em] font-bold"
            style={{ color: GREEN }}
          >
            <motion.i
              className="block h-[0.55em] w-[0.55em] rounded-full"
              style={{ background: GREEN }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            Aktivno
          </span>
        </div>
        <div className="mt-[0.9em] grid grid-cols-2 gap-[0.5em]">
          {[
            ["Doseg", 48200],
            ["Klikovi", 1930],
          ].map(([k, v], i) => (
            <div
              key={k}
              className="rounded-[0.5em] bg-[#F2F0EA] px-[0.6em] py-[0.45em]"
            >
              <span
                className="block text-[0.62em] uppercase tracking-[0.12em] text-[#6B6B6B]"
                style={{ fontFamily: MONO }}
              >
                {k}
              </span>
              <b className="block text-[1.25em] font-black italic leading-[1.1]">
                <Ticker to={v as number} start={300 + i * 150} />
              </b>
            </div>
          ))}
        </div>
        <svg
          viewBox="0 0 100 36"
          className="mt-[0.8em] block h-[5.6em] w-full"
          preserveAspectRatio="none"
          aria-hidden
        >
          <motion.path
            d={`${CHART} L100 36 L0 36 Z`}
            fill="rgba(8,102,255,0.12)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          />
          <motion.path
            d={CHART}
            fill="none"
            stroke={META_BLUE}
            strokeWidth={2.2}
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 1.2, ease: "easeInOut" }}
          />
        </svg>
        <span
          className="mt-[0.6em] inline-flex items-center gap-[0.3em] rounded-full bg-[#E8F0FE] px-[0.6em] py-[0.25em] text-[0.72em] font-bold"
          style={{ color: META_BLUE }}
        >
          <MapPin className="h-[1em] w-[1em]" />
          Novi Sad + 10 km
        </span>
      </motion.div>
      {/* Google */}
      <motion.div
        className="absolute bottom-[3.6em] right-[1.4em] top-[1.4em] w-[15.2em] rounded-[0.8em] bg-white p-[1em]"
        initial={{ opacity: 0, x: "1.5em" }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: EASE_OUT }}
      >
        <div className="flex items-center gap-[0.5em]">
          <span className="flex gap-[0.18em]" aria-hidden>
            {["#4285F4", "#EA4335", "#FBBC05", "#34A853"].map((c) => (
              <i
                key={c}
                className="block h-[0.55em] w-[0.55em] rounded-full"
                style={{ background: c }}
              />
            ))}
          </span>
          <b className="text-[1.05em] font-extrabold">Google oglasi</b>
        </div>
        <div className="mt-[0.9em] flex items-center gap-[0.5em] rounded-full border border-[#DADCE0] px-[0.8em] py-[0.5em] text-[0.9em]">
          <Search className="h-[1em] w-[1em] flex-none text-[#6B6B6B]" />
          <span className="truncate">{QUERY.slice(0, typed)}</span>
          {typed < QUERY.length && (
            <motion.i
              aria-hidden
              className="-ml-[0.4em] block h-[1em] w-[0.08em] bg-[#111]"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </div>
        <motion.div
          className="relative mt-[0.8em] rounded-[0.5em] p-[0.6em]"
          animate={{ backgroundColor: clicked ? "#F1F3F4" : "#ffffff" }}
          initial={false}
        >
          {found && (
            <motion.div
              initial={{ opacity: 0, y: "0.6em" }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <span className="text-[0.72em] font-bold">Sponzorisano</span>
              <span className="block text-[0.72em] text-[#4D5156]">
                Neto · prodavnice
              </span>
              <b
                className="mt-[0.2em] block text-[1.05em] font-semibold leading-[1.2]"
                style={{ color: "#1A0DAB" }}
              >
                Neto · Akcije ove nedelje
              </b>
              <span className="mt-[0.2em] block text-[0.75em] leading-[1.3] text-[#4D5156]">
                Kafa −{off(COFFEE)}%, mleko, hleb. Prodavnice u Novom Sadu.
              </span>
            </motion.div>
          )}
          {found && (
            <motion.span
              aria-hidden
              className="absolute"
              style={{ left: "60%", top: "60%" }}
              initial={{ x: "5em", y: "5em", opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.55, ease: EASE_OUT }}
            >
              <MousePointer2
                className="h-[1.5em] w-[1.5em]"
                fill="#111"
                stroke="#fff"
                strokeWidth={1.5}
              />
            </motion.span>
          )}
        </motion.div>
        <div className="mt-[0.8em] flex items-center justify-between text-[0.75em] text-[#6B6B6B]">
          <span style={{ fontFamily: MONO }}>KLIKOVI DANAS</span>
          <b className="text-[1.3em] font-black italic text-[#111]">
            <Ticker to={312} start={1800} ms={1000} />
          </b>
        </div>
      </motion.div>
      {roas && (
        <motion.span
          className="absolute bottom-[0.7em] left-1/2 flex items-center gap-[0.4em] whitespace-nowrap rounded-full px-[1em] py-[0.4em] text-[1em] font-extrabold text-white"
          style={{ x: "-50%", background: RED }}
          initial={{ opacity: 0, scale: 0.5, y: "1em" }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={POP_SPRING}
        >
          4.2x povrat na uloženo
        </motion.span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* 6. The website: wireframe, then the real thing, then the phone            */
/* ------------------------------------------------------------------------ */

function Block({
  real,
  at,
  wire,
  children,
  className = "",
}: {
  real: boolean;
  at: number;
  wire: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        aria-hidden
        className={`absolute inset-0 rounded-[0.4em] ${wire}`}
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
  const cards = [MILK, BREAD, COFFEE];
  return (
    <div className="absolute inset-0 bg-[#0B0B0B]">
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
            vaš-sajt.rs
          </span>
        </div>
        <div className="grid gap-[0.6em] p-[0.8em]">
          <Block real={real} at={0} wire="" className="h-[2.2em]">
            <div
              className="flex h-full items-center justify-between rounded-[0.4em] px-[0.6em]"
              style={{ background: RED }}
            >
              <b className="text-[1em] font-black italic text-white">Neto</b>
              <span className="flex items-center gap-[0.8em] text-[0.65em] font-bold text-white">
                <span>Akcije</span>
                <span>Katalog</span>
                <span>Prodavnice</span>
                <ShoppingCart className="h-[1.4em] w-[1.4em]" />
              </span>
            </div>
          </Block>
          <Block real={real} at={0.15} wire="" className="h-[7.4em]">
            <div className="flex h-full items-center justify-between rounded-[0.4em] bg-[#F7F6F2] px-[1em]">
              <div>
                <span
                  className="block text-[0.6em] tracking-[0.14em] text-[#6B6B6B]"
                  style={{ fontFamily: MONO }}
                >
                  AKCIJE NEDELJE
                </span>
                <b className="block text-[1.55em] font-black italic leading-[1.05]">
                  Svaki dinar
                  <br />
                  <span style={{ color: RED }}>je bitan.</span>
                </b>
                <motion.span
                  className="relative mt-[0.5em] inline-flex items-center gap-[0.3em] rounded-[0.35em] px-[0.8em] py-[0.35em] text-[0.75em] font-extrabold text-white"
                  animate={{ backgroundColor: bought ? GREEN : RED }}
                >
                  {bought && (
                    <Check className="h-[1em] w-[1em]" strokeWidth={3} />
                  )}
                  {bought ? "Poručeno" : "Poruči online"}
                  {bought && <Ripple at={0} className="left-1/2 top-1/2" />}
                </motion.span>
              </div>
              <span
                className="block h-[5.6em] w-[5.6em] rounded-[0.6em] p-[0.6em]"
                style={{ background: COFFEE.tint }}
              >
                <COFFEE.Icon />
              </span>
            </div>
          </Block>
          <div className="grid grid-cols-3 gap-[0.6em]">
            {cards.map((p, i) => (
              <Block
                key={p.name}
                real={real}
                at={0.3 + i * 0.12}
                wire=""
                className="h-[7.6em]"
              >
                <div className="flex h-full flex-col rounded-[0.4em] border border-[#E4E2DC] p-[0.45em]">
                  <span
                    className="relative block h-[3.6em] rounded-[0.3em] p-[0.35em] [&_svg]:h-full [&_svg]:w-full"
                    style={{ background: p.tint }}
                  >
                    <p.Icon />
                    <span
                      className="absolute right-[0.2em] top-[0.2em] rounded-[0.2em] px-[0.25em] text-[0.55em] font-black italic text-white"
                      style={{ background: RED }}
                    >
                      −{off(p)}%
                    </span>
                  </span>
                  <b className="mt-[0.3em] truncate text-[0.62em] font-bold">
                    {p.name}
                  </b>
                  <span className="text-[0.62em]">
                    <s className="text-[#8A8A8A]">{fmt(p.was)}</s>{" "}
                    <b style={{ color: RED }}>{fmt(p.now)}</b>
                  </span>
                </div>
              </Block>
            ))}
          </div>
        </div>
        {/* the click on "Poruči online" */}
        <motion.span
          aria-hidden
          className="absolute"
          style={{ left: "6.2em", top: "11.4em" }}
          initial={{ x: "8em", y: "6em", opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{ delay: 2.3, duration: 0.6, ease: EASE_OUT }}
        >
          <MousePointer2
            className="h-[1.5em] w-[1.5em]"
            fill="#111"
            stroke="#fff"
            strokeWidth={1.5}
          />
        </motion.span>
      </motion.div>
      {/* and the same site on a phone */}
      <motion.div
        className="absolute right-[1.4em] top-[3.2em] h-[17.4em] w-[8.4em] overflow-hidden rounded-[1.3em] border-[0.35em] border-[#1b1b1d] bg-white text-[#111] shadow-[0_0_0_1px_#8d8d92]"
        initial={{ x: "10em", opacity: 0 }}
        animate={{ x: 0, opacity: real ? 1 : 0 }}
        transition={{ delay: 1.6, type: "spring", stiffness: 200, damping: 22 }}
      >
        <div
          className="flex h-[1.9em] items-end justify-between px-[0.5em] pb-[0.25em]"
          style={{ background: RED }}
        >
          <b className="text-[0.75em] font-black italic text-white">Neto</b>
          <ShoppingCart className="h-[0.8em] w-[0.8em] text-white" />
        </div>
        <div className="bg-[#F7F6F2] px-[0.5em] py-[0.5em]">
          <b className="block text-[0.85em] font-black italic leading-[1.05]">
            Svaki dinar <span style={{ color: RED }}>je bitan.</span>
          </b>
          <span
            className="mt-[0.35em] inline-block rounded-[0.3em] px-[0.5em] py-[0.15em] text-[0.55em] font-extrabold text-white"
            style={{ background: RED }}
          >
            Poruči online
          </span>
        </div>
        <div className="grid gap-[0.35em] p-[0.4em]">
          {cards.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-[0.35em] rounded-[0.3em] border border-[#E4E2DC] p-[0.25em]"
            >
              <span
                className="block h-[1.9em] w-[1.9em] flex-none rounded-[0.2em] p-[0.15em]"
                style={{ background: p.tint }}
              >
                <p.Icon />
              </span>
              <span className="min-w-0 text-[0.5em] leading-[1.2]">
                <b className="block truncate">{p.name}</b>
                <b style={{ color: RED }}>{fmt(p.now)} RSD</b>
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* The reel                                                                  */
/* ------------------------------------------------------------------------ */

const CATS = [
  {
    icon: Compass,
    title: "Strategija",
    line: "Kome, šta i gde prodajemo.",
    Scene: Strategy,
  },
  {
    icon: PenLine,
    title: "Skripte",
    line: "Svaki video počinje na papiru.",
    Scene: Script,
  },
  {
    icon: Video,
    title: "Snimanje",
    line: "Naša ekipa, u vašem lokalu.",
    Scene: Shoot,
  },
  {
    icon: Scissors,
    title: "Montaža",
    line: "Ritam, titlovi, poziv na akciju.",
    Scene: Edit,
  },
  {
    icon: Megaphone,
    title: "Meta i Google oglasi",
    line: "Pravi ljudi, u pravom trenutku.",
    Scene: Ads,
  },
  {
    icon: Globe,
    title: "Kompletan sajt",
    line: "Od dizajna do porudžbine.",
    Scene: Site,
  },
] as const;

const BEAT = 4200;

export function ServicesReel() {
  const active = useSlideActive();
  const [at, setAt] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setAt((a) => (a + 1) % CATS.length), BEAT);
    return () => clearTimeout(t);
  }, [active, at, run]);

  const pick = (i: number) => {
    setAt(i);
    setRun((r) => r + 1);
  };
  const { Scene } = CATS[at];

  const stage = (
    <div
      className="relative aspect-[17/12] w-full overflow-hidden border border-[#262626] bg-[#0B0B0B] text-white"
      style={{
        borderRadius: "10px 30px 10px 10px",
        containerType: "inline-size",
      }}
    >
      <div
        className="absolute inset-0"
        style={{ fontSize: "calc(100cqw / 34)", fontFamily: DISPLAY }}
      >
        <AnimatePresence initial={false}>
          {active && (
            <motion.div
              key={`${at}-${run}`}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
            >
              <Scene />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="grid items-center gap-3 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-12">
      {/* wide screens: the six as a list */}
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
                className="relative flex w-full cursor-pointer items-center gap-4 overflow-hidden px-3 py-2.5 text-left transition-colors duration-300"
                style={{
                  borderRadius: NETO_RADIUS,
                  background: on ? "rgba(255,255,255,0.08)" : "transparent",
                  border: `1px solid ${on ? "#3A3A3A" : "transparent"}`,
                }}
              >
                <span
                  className="grid h-11 w-11 flex-none place-items-center transition-colors duration-300"
                  style={{
                    background: on ? RED : "#1E1E1E",
                    color: on ? "#fff" : "#8A8A8A",
                    borderRadius: "10px 10px 10px 3px",
                  }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <b
                    className="block text-[18px] font-extrabold leading-[1.15] transition-colors duration-300"
                    style={{ color: on ? "#fff" : "#8A8A8A" }}
                  >
                    {c.title}
                  </b>
                  <span
                    className="block text-[13.5px] leading-[1.3] transition-colors duration-300"
                    style={{ color: on ? "#B5B5B5" : "#5A5A5A" }}
                  >
                    {c.line}
                  </span>
                </span>
                {on && active && (
                  <motion.i
                    key={`${at}-${run}`}
                    aria-hidden
                    className="absolute bottom-0 left-0 block h-[2px] w-full origin-left"
                    style={{ background: RED }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: BEAT / 1000, ease: "linear" }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <div>
        {stage}
        {/* phones: a row of icons and the one on stage, named */}
        <div className="mt-3 lg:hidden">
          <div className="relative flex items-center justify-between">
            <span
              aria-hidden
              className="absolute left-4 right-4 top-1/2 h-[2px] -translate-y-1/2 bg-[#262626]"
            />
            <motion.span
              aria-hidden
              className="absolute left-4 right-4 top-1/2 h-[2px] origin-left -translate-y-1/2"
              style={{ background: RED }}
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
                  className="relative grid h-9 w-9 cursor-pointer place-items-center rounded-full transition-colors duration-300"
                  style={{
                    background: on ? RED : i < at ? "#3A0D0A" : "#1A1A1A",
                    color: on ? "#fff" : i < at ? "#FF4B42" : "#8A8A8A",
                    boxShadow: on ? "0 0 0 4px rgba(226,35,26,0.25)" : "none",
                  }}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
          <div className="relative mt-2.5 h-[44px] overflow-hidden text-center">
            <AnimatePresence initial={false}>
              <motion.div
                key={at}
                className="absolute inset-0"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <b className="block text-[16px] font-extrabold leading-[1.2]">
                  <span
                    style={{ color: "#FF4B42", fontFamily: MONO }}
                    className="mr-1.5 text-[12px]"
                  >
                    0{at + 1}
                  </span>
                  {CATS[at].title}
                </b>
                <span className="block text-[13px] text-[#B5B5B5]">
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

export function Services() {
  return (
    <Slide id="radimo" theme="dark">
      <Headline size="xl">Od strategije [[do sajta.]]</Headline>
      <Visual className="!mt-4 md:!mt-8">
        <ServicesReel />
      </Visual>
    </Slide>
  );
}
