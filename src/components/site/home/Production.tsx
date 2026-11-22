"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Facebook,
  Heart,
  Instagram,
  MessageCircle,
  Scissors,
  Search,
  Send,
  Youtube,
} from "lucide-react";
import {
  BLENDS,
  BRAND,
  Bag,
  CountUp,
  DOMAIN,
  EASE_OUT,
  GOLD,
  GREEN,
  HANDLE,
  IG_BLUE,
  MONO,
  OR,
  POP,
  STAGE,
  off,
  useAt,
  useTyping,
} from "./reelKit";
import {
  CLIP_GAP,
  CLIP_PAD,
  CLIP_W,
  PHASE_T,
  T,
  TRACK_W,
  shotAt,
} from "./productionTimeline";
import type { Studio } from "./studio3d";

/*
 * Snimanje → Montaža → Oglasi kao jedan neprekinut kadar (Luka, 22.11.2026):
 * 3D ekipa uđe u studio i snimi kesu "Tvoja firma", pogled uđe u monitor
 * kamere, taj isti kadar se iseče na 9:16 i postane pregled u programu za
 * montažu, a gotov klip odleti u Instagram telefon i na mreže. Kesa je sve
 * vreme na ekranu, jer je canvas isti od prve do poslednje sekunde.
 *
 * Scena je 34 × 24 em (kao ostale u ServicesReel). Canvas je uvek pune
 * veličine; faze ga samo seku (clip-path) i pomeraju (transform).
 */

const [ESPRESSO] = BLENDS;
const META_BLUE = "#0866FF";
const STAGE_W = 34;
const STAGE_H = 24;

/* ---------------------------------------------------------- jedan studio */

let studioP: Promise<Studio | null> | null = null;
let studio: Studio | null | undefined;
let owners = 0;

/** Učita three.js i napravi studio jednom po stranici. */
export function preloadStudio() {
  if (!studioP) {
    studioP = import("./studio3d")
      .then((m) => m.createStudio())
      .catch(() => null)
      .then((s) => {
        studio = s;
        return s;
      });
  }
  return studioP;
}

/* ------------------------------------------------------ raspored (u em) */

const PREVIEW = { x: 1.4, y: 1.4, h: 16.62 };
const S1 = PREVIEW.h / STAGE_H;
const CROP1 = (STAGE_W - (STAGE_H * 9) / 16) / 2; // 9:16
const PREV_W = (STAGE_H * 9 * S1) / 16;

const SCREEN = { x: 2.0, y: 1.9, h: 20.2 };
const S2 = SCREEN.h / STAGE_H;
const CROP2 = (STAGE_W - (STAGE_H * 9) / 18) / 2; // 9:18, ekran telefona
const SCREEN_W = ((STAGE_H * 9) / 18) * S2;
const BEZEL = 0.4;
const PHONE = {
  x: SCREEN.x - BEZEL,
  y: SCREEN.y - BEZEL,
  w: SCREEN_W + 2 * BEZEL,
  h: SCREEN.h + 2 * BEZEL,
};

const clip = (cx: number, r: number) =>
  `inset(0em ${cx}em 0em ${cx}em round ${r}em)`;

const FRAME = [
  { x: "0em", y: "0em", scale: 1, clipPath: clip(0, 0) },
  {
    x: `${PREVIEW.x - CROP1 * S1}em`,
    y: `${PREVIEW.y}em`,
    scale: S1,
    clipPath: clip(CROP1, 0.7 / S1),
  },
  {
    x: `${SCREEN.x - CROP2 * S2}em`,
    y: `${SCREEN.y}em`,
    scale: S2,
    clipPath: clip(CROP2, 1.45 / S2),
  },
];
const FRAME_T = [
  { duration: 0 },
  { delay: 0.5, duration: 0.8, ease: [0.65, 0, 0.35, 1] as const },
  { duration: 0.85, ease: [0.65, 0, 0.35, 1] as const },
];

/* ---------------------------------------------------------------- sitno */

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

const TikTok = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden
  >
    <path d="M16.6 5.8a4.3 4.3 0 0 1-3.3-3.3V2h-3.1v12.6a2.6 2.6 0 1 1-1.8-2.5V8.9a5.7 5.7 0 1 0 4.9 5.6V8.3a7.4 7.4 0 0 0 4.3 1.4V6.6a4.3 4.3 0 0 1-1-.8z" />
  </svg>
);

/** Rezervna "snimka" kad nema WebGL-a: nacrtana kesa na postolju. */
function Fallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 60% 70% at 50% 35%, #7a3f17, #2a160b 60%, #0c0b09)",
      }}
    >
      <span
        className="absolute left-1/2 top-[58%] block h-[9em] w-[17em] -translate-x-1/2 rounded-[50%]"
        style={{ background: "#e6dccb" }}
      />
      <span className="absolute left-1/2 top-[18%] block h-[13em] w-[13em] -translate-x-1/2">
        <Bag blend={ESPRESSO} />
      </span>
    </div>
  );
}

/* ------------------------------------------------------- 1. tražilo kamere */

function Corner({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`absolute h-[2.2em] w-[2.2em] border-white ${className}`}
    />
  );
}

function Viewfinder({ delay }: { delay: number }) {
  const focused = useAt((delay + 0.7) * 1000);
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 text-white"
      style={{ textShadow: "0 0.05em 0.35em rgba(0,0,0,0.55)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ delay, duration: 0.35 }}
    >
      {[33.33, 66.66].map((p) => (
        <span
          key={`v${p}`}
          className="absolute bottom-0 top-0 w-px bg-white/20"
          style={{ left: `${p}%` }}
        />
      ))}
      {[33.33, 66.66].map((p) => (
        <span
          key={`h${p}`}
          className="absolute left-0 right-0 h-px bg-white/20"
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
        <Timecode from={75} />
      </div>
      <div
        className="absolute bottom-[2.1em] left-[2.3em] text-[0.85em] font-semibold"
        style={{ fontFamily: MONO }}
      >
        KAMERA A · 4K · 60 FPS
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
      {/* autofokus nalazi etiketu */}
      <motion.div
        className="absolute h-[8.1em] w-[7.8em] border-[0.15em]"
        style={{
          left: "12.6em",
          top: "8.9em",
          borderColor: focused ? "#4ADE80" : "#fff",
        }}
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: focused ? [1, 0.94, 1] : 1, opacity: 1 }}
        transition={{ delay: focused ? 0 : delay + 0.15, duration: 0.35 }}
      >
        <span
          className="absolute left-[calc(100%+0.6em)] top-0 whitespace-nowrap text-[0.8em] font-semibold"
          style={{ fontFamily: MONO, color: focused ? "#4ADE80" : "#fff" }}
        >
          {focused ? "AF ✓" : "AF"}
        </span>
      </motion.div>
    </motion.div>
  );
}

/* --------------------------------------------------------------- 2. montaža */

const CAPTIONS = [
  ["Ovu", "kafu", "market", "nema."],
  ["Link", "je", "u", "opisu."],
];
const WORDS = CAPTIONS.flat();
const WAVE = Array.from(
  { length: 46 },
  (_, i) => 0.25 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.45)) * 0.75,
);

function Captions({ start }: { start: number }) {
  const on = useAt(start * 1000);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!on) return;
    const iv = setInterval(
      () => setW((x) => (x + 1) % (WORDS.length + 2)),
      330,
    );
    return () => clearInterval(iv);
  }, [on]);
  if (!on) return null;
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
              background: now ? GOLD : "transparent",
              textShadow: now ? "none" : "0 0.08em 0.25em rgba(0,0,0,0.8)",
            }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={POP}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
}

/** Sličica kadra: iz 3D scene, ili nacrtana kesa bez WebGL-a. */
function Thumb({ src, i }: { src?: string; i: number }) {
  if (src)
    return (
      // data URL iz WebGL-a, next/image tu nema šta da optimizuje
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  return (
    <span
      className="absolute inset-0 grid place-items-center"
      style={{ background: ["#5a2e12", "#3a2416", "#6b3a18", "#2a1c14"][i] }}
    >
      <span className="block h-[70%] w-[70%]">
        <Bag blend={ESPRESSO} />
      </span>
    </span>
  );
}

const EDIT_PANEL_X = 12.2;

function Editor({ thumbs, shot }: { thumbs: string[]; shot: number }) {
  const exported = useAt(4400);
  const playFrom = T.play[0] - PHASE_T[1];
  let x = CLIP_PAD;
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
    >
      {/* 9:16 okvir preko kadra, pre nego što se kadar iseče */}
      <motion.div
        className="absolute rounded-[0.7em] border-[0.22em] border-[#2A2724]"
        style={{
          left: `${PREVIEW.x - 0.22}em`,
          top: `${PREVIEW.y - 0.22}em`,
          width: `${PREV_W + 0.44}em`,
          height: `${PREVIEW.h + 0.44}em`,
          borderRadius: "0.9em",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.15, duration: 0.3 }}
      />
      <div
        className="absolute overflow-hidden"
        style={{
          left: `${PREVIEW.x}em`,
          top: `${PREVIEW.y}em`,
          width: `${PREV_W}em`,
          height: `${PREVIEW.h}em`,
          borderRadius: "0.7em",
        }}
      >
        <Captions start={playFrom} />
      </div>

      <motion.div
        className="absolute rounded-[0.7em] border border-[#2A2724] bg-[#151310] px-[0.9em] pt-[0.8em] text-white"
        style={{
          left: `${EDIT_PANEL_X}em`,
          right: "1.4em",
          top: "1.4em",
          height: "16.6em",
        }}
        initial={{ opacity: 0, x: "4em" }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.85, duration: 0.5, ease: EASE_OUT }}
      >
        <div
          className="flex items-center justify-between text-[0.72em] tracking-[0.12em] text-[#8A8579]"
          style={{ fontFamily: MONO }}
        >
          <span>TIMELINE · REEL 01</span>
          <Timecode from={250} />
        </div>
        <div className="relative mt-[0.9em] grid gap-[0.55em]">
          <div className="relative h-[2.1em] rounded-[0.3em] bg-[#1E1C19]">
            {(
              [
                [0.4, 9.2, "Ovu kafu market nema."],
                [10.0, 7.6, "Link je u opisu"],
              ] as const
            ).map(([l, w, t], i) => (
              <motion.span
                key={i}
                className="absolute inset-y-[0.25em] flex items-center truncate rounded-[0.25em] px-[0.5em] text-[0.72em] font-bold"
                style={{
                  left: `${l / 0.72}em`,
                  width: `${w / 0.72}em`,
                  background: "#8B5CF6",
                }}
                initial={{ opacity: 0, x: "-1em" }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + i * 0.2, duration: 0.3 }}
              >
                {t}
              </motion.span>
            ))}
          </div>
          <div className="relative h-[3.6em] rounded-[0.3em] bg-[#1E1C19]">
            {CLIP_W.map((w, i) => {
              const left = x;
              x += w + CLIP_GAP;
              return (
                <motion.span
                  key={i}
                  className="absolute inset-y-[0.25em] overflow-hidden rounded-[0.3em] border-[0.12em]"
                  style={{
                    left: `${left}em`,
                    width: `${w}em`,
                    borderColor: i === shot ? GOLD : "rgba(255,255,255,0.2)",
                  }}
                  initial={{ x: "12em", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 26,
                    delay: 0.95 + i * 0.1,
                  }}
                >
                  <Thumb src={thumbs[i]} i={i} />
                </motion.span>
              );
            })}
            <motion.span
              aria-hidden
              className="absolute -top-[1.7em] grid h-[1.6em] w-[1.6em] place-items-center rounded-full bg-white text-[#111]"
              style={{ left: `${CLIP_PAD + CLIP_W[0] - 0.75}em` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1, 0] }}
              transition={{
                delay: 1.9,
                duration: 1.1,
                times: [0, 0.2, 0.3, 1],
              }}
            >
              <Scissors className="h-[0.95em] w-[0.95em]" />
            </motion.span>
          </div>
          <div className="relative flex h-[2.6em] items-center gap-[0.12em] overflow-hidden rounded-[0.3em] bg-[#1E1C19] px-[0.3em]">
            {WAVE.map((h, i) => (
              <motion.i
                key={i}
                className="block w-[0.22em] flex-none rounded-full"
                style={{ height: `${h * 100}%`, background: "#2DD4BF" }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 1.0 + i * 0.012, duration: 0.25 }}
              />
            ))}
          </div>
          {/* glava za reprodukciju: isti tempo kao rezovi u 3D sceni */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-[0.3em] -top-[0.4em] left-0"
            style={{ width: `${TRACK_W}em` }}
            initial={{ x: "0%" }}
            animate={{ x: "100%" }}
            transition={{
              delay: playFrom,
              duration: T.play[1] - T.play[0],
              ease: "linear",
            }}
          >
            <span className="absolute bottom-0 left-0 top-0 w-[0.12em] bg-[#FF3B30]" />
            <span
              className="absolute -left-[0.45em] -top-[0.2em] h-0 w-0 border-x-[0.5em] border-t-[0.6em] border-x-transparent"
              style={{ borderTopColor: "#FF3B30" }}
            />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-[1.3em] left-[1.4em] right-[1.4em] flex h-[3.4em] items-center gap-[0.9em] rounded-[0.7em] border border-[#2A2724] bg-[#151310] px-[1em] text-white"
        initial={{ opacity: 0, y: "2em" }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95, duration: 0.45, ease: EASE_OUT }}
      >
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
        <span className="h-[0.5em] flex-1 overflow-hidden rounded-full bg-[#2A2724]">
          <motion.i
            className="block h-full w-full origin-left rounded-full"
            style={{ background: exported ? "#4ADE80" : OR }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 2.5, duration: 1.8, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </motion.div>
  );
}

/** 9:16 vodilice preko punog kadra; ide zajedno sa canvasom (u okviru). */
function CropGuide() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-y-0"
      style={{
        left: `${CROP1}em`,
        width: `${STAGE_W - 2 * CROP1}em`,
        boxShadow: "0 0 0 40em rgba(0,0,0,0.55)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.5, times: [0, 0.2, 0.75, 1] }}
    >
      <span className="absolute inset-0 border-[0.18em] border-dashed border-white/90" />
      <span
        className="absolute left-[0.6em] top-[0.6em] rounded-[0.2em] bg-white px-[0.4em] text-[0.8em] font-bold text-[#111]"
        style={{ fontFamily: MONO }}
      >
        9:16
      </span>
    </motion.div>
  );
}

/* ----------------------------------------------------- 3. Meta i mreže */

const NETS = [
  { name: "Instagram", Icon: Instagram, color: "#E1306C" },
  { name: "Facebook", Icon: Facebook, color: "#1877F2" },
  { name: "TikTok", Icon: TikTok, color: "#111111" },
  { name: "YouTube", Icon: Youtube, color: "#FF0000" },
] as const;

const COL_X = PHONE.x + PHONE.w + 1.3;
const COL_W = STAGE_W - 1.4 - COL_X;
const CHIP_H = 2.3;
const CHIP_GAP = 0.35;
const CHIP_W = (COL_W - CHIP_GAP) / 2;
const CHIPS_Y = 2.6;
const THUMB = { x: 0.28, y: 0.28, w: 0.98, h: CHIP_H - 0.56 };
const CARDS_Y = CHIPS_Y + 2 * CHIP_H + CHIP_GAP + 0.5;
const QUERY = "kafa dostava novi sad";
const MORPH = { duration: 0.85, ease: [0.65, 0, 0.35, 1] as const };

function IgOverlay() {
  const blue = useAt(1700);
  const liked = useAt(2300);
  return (
    <motion.div
      className="pointer-events-none absolute overflow-hidden text-white"
      style={{
        left: `${SCREEN.x}em`,
        top: `${SCREEN.y}em`,
        width: `${SCREEN_W}em`,
        height: `${SCREEN.h}em`,
        borderRadius: "1.45em",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.75, duration: 0.35 }}
    >
      <span
        className="absolute inset-x-0 bottom-0 h-[45%]"
        style={{
          background: "linear-gradient(transparent, rgba(0,0,0,0.65))",
        }}
      />
      <b
        className="absolute left-[0.8em] top-[1.6em] text-[0.95em] font-extrabold"
        style={{ textShadow: "0 0.05em 0.3em rgba(0,0,0,0.45)" }}
      >
        Reels
      </b>
      <div className="absolute bottom-[4.4em] right-[0.55em] grid justify-items-center gap-[0.75em] text-[0.62em] font-bold">
        <span className="grid justify-items-center gap-[0.15em]">
          <motion.span
            animate={liked ? { scale: [1, 1.45, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Heart
              className="h-[2em] w-[2em]"
              fill={liked ? "#FF3040" : "none"}
              stroke={liked ? "#FF3040" : "#fff"}
            />
          </motion.span>
          {liked ? "2.418" : "2.417"}
        </span>
        <span className="grid justify-items-center gap-[0.15em]">
          <MessageCircle className="h-[2em] w-[2em]" />
          86
        </span>
        <Send className="h-[1.9em] w-[1.9em]" />
      </div>
      {liked && (
        <motion.span
          className="absolute left-1/2 top-[38%] -translate-x-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.25, 1, 1], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.9, times: [0, 0.3, 0.5, 1] }}
        >
          <Heart className="h-[3.6em] w-[3.6em]" fill="#fff" stroke="none" />
        </motion.span>
      )}
      <div className="absolute inset-x-[0.7em] bottom-[0.8em]">
        <div className="flex items-center gap-[0.4em]">
          <span
            className="grid h-[1.7em] w-[1.7em] flex-none place-items-center rounded-full p-[0.25em] ring-[0.1em] ring-white"
            style={{ background: OR }}
          >
            <Bag blend={ESPRESSO} />
          </span>
          <span className="min-w-0 leading-[1.15]">
            <b className="block truncate text-[0.72em]">{HANDLE}</b>
            <span className="block text-[0.58em] opacity-80">Sponzorisano</span>
          </span>
        </div>
        <p className="mt-[0.35em] truncate text-[0.64em]">
          Ovu kafu market nema.
        </p>
        <motion.span
          className="mt-[0.45em] flex items-center justify-between rounded-[0.45em] px-[0.7em] py-[0.4em] text-[0.7em] font-extrabold"
          animate={{
            backgroundColor: blue ? IG_BLUE : "rgba(255,255,255,0.22)",
          }}
          transition={{ duration: 0.4 }}
        >
          Poruči sada
          <span aria-hidden>›</span>
        </motion.span>
      </div>
    </motion.div>
  );
}

function Social({ thumb }: { thumb?: string }) {
  const typed = useTyping(QUERY.length, 2600, 45);
  const found = useAt(3600);
  const phoneCx = SCREEN.x + SCREEN_W / 2;
  const phoneCy = SCREEN.y + SCREEN.h / 2;
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* okvir pregleda iz montaže raste u telefon, zajedno sa klipom */}
      <motion.div
        className="absolute"
        initial={{
          opacity: 0,
          left: `${PREVIEW.x - BEZEL}em`,
          top: `${PREVIEW.y - BEZEL}em`,
          width: `${PREV_W + 2 * BEZEL}em`,
          height: `${PREVIEW.h + 2 * BEZEL}em`,
        }}
        animate={{
          opacity: 1,
          left: `${PHONE.x}em`,
          top: `${PHONE.y}em`,
          width: `${PHONE.w}em`,
          height: `${PHONE.h}em`,
        }}
        transition={{ ...MORPH, opacity: { duration: 0.25 } }}
      >
        <motion.span
          className="absolute inset-0"
          style={{
            border: `${BEZEL}em solid #1b1b1d`,
            boxShadow: "0 0 0 0.08em #8d8d92, 0 1.5em 3em -1em rgba(0,0,0,0.8)",
          }}
          initial={{ borderRadius: `${0.7 + BEZEL}em` }}
          animate={{ borderRadius: "1.85em" }}
          transition={MORPH}
        />
        <motion.span
          className="absolute left-1/2 top-[0.85em] block h-[0.95em] w-[3.2em] -translate-x-1/2 rounded-full bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.3 }}
        />
      </motion.div>
      <IgOverlay />

      {/* isti klip odlazi na mreže */}
      <span
        className="absolute text-[0.62em] font-semibold uppercase tracking-[0.14em] text-white/55"
        style={{
          left: `${COL_X / 0.62}em`,
          top: `${1.45 / 0.62}em`,
          fontFamily: MONO,
        }}
      >
        Objavljeno
      </span>
      {NETS.map((n, k) => {
        const cx = COL_X + (k % 2) * (CHIP_W + CHIP_GAP);
        const cy = CHIPS_Y + Math.floor(k / 2) * (CHIP_H + CHIP_GAP);
        const at = 1.0 + k * 0.17;
        return (
          <div key={n.name}>
            <motion.div
              className="absolute flex items-center rounded-[0.6em] bg-white text-[#111]"
              style={{
                left: `${cx}em`,
                top: `${cy}em`,
                width: `${CHIP_W}em`,
                height: `${CHIP_H}em`,
                paddingLeft: `${THUMB.x + THUMB.w + 0.45}em`,
              }}
              initial={{ opacity: 0, y: "0.6em" }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + k * 0.1, duration: 0.35 }}
            >
              <n.Icon
                className="h-[1.1em] w-[1.1em] flex-none"
                style={{ color: n.color }}
              />
              <b className="ml-[0.35em] min-w-0 truncate text-[0.78em] font-extrabold">
                {n.name}
              </b>
              <motion.span
                className="ml-auto mr-[0.5em] grid h-[1.15em] w-[1.15em] flex-none place-items-center rounded-full text-white"
                style={{ background: GREEN }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...POP, delay: at + 0.55 }}
              >
                <Check className="h-[0.75em] w-[0.75em]" strokeWidth={3.5} />
              </motion.span>
            </motion.div>
            <motion.span
              className="absolute overflow-hidden rounded-[0.25em] bg-[#2a1c14]"
              style={{
                left: `${cx + THUMB.x}em`,
                top: `${cy + THUMB.y}em`,
                width: `${THUMB.w}em`,
                height: `${THUMB.h}em`,
              }}
              initial={{
                opacity: 0,
                scale: 3,
                x: `${phoneCx - (cx + THUMB.x + THUMB.w / 2)}em`,
                y: `${phoneCy - (cy + THUMB.y + THUMB.h / 2)}em`,
              }}
              animate={{ opacity: 1, scale: 1, x: "0em", y: "0em" }}
              transition={{ delay: at, duration: 0.6, ease: EASE_OUT }}
            >
              <Thumb src={thumb} i={0} />
            </motion.span>
          </div>
        );
      })}

      <div
        className="absolute flex flex-col gap-[0.5em]"
        style={{
          left: `${COL_X}em`,
          top: `${CARDS_Y}em`,
          width: `${COL_W}em`,
          height: `${PHONE.y + PHONE.h - CARDS_Y}em`,
        }}
      >
        {/* Meta oglasi */}
        <motion.div
          className="flex-none rounded-[0.8em] bg-white px-[0.9em] pb-[0.7em] pt-[0.8em] text-[#111]"
          initial={{ opacity: 0, y: "1em" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.4, ease: EASE_OUT }}
        >
          <div className="flex items-center gap-[0.5em]">
            <span
              className="grid h-[1.7em] w-[1.7em] place-items-center rounded-[0.45em] text-white"
              style={{ background: META_BLUE }}
            >
              <MetaMark size="1.05em" />
            </span>
            <b className="text-[0.92em] font-extrabold">Meta oglasi</b>
            <span
              className="ml-auto flex items-center gap-[0.3em] text-[0.66em] font-bold"
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
          <div className="mt-[0.55em] grid grid-cols-3 gap-[0.4em]">
            {(
              [
                ["Doseg", 48200],
                ["Klikovi", 1930],
                ["Porudžbine", 86],
              ] as const
            ).map(([k, v], i) => (
              <div
                key={k}
                className="min-w-0 rounded-[0.5em] bg-[#F2F0EA] px-[0.5em] py-[0.3em]"
              >
                <span
                  className="block truncate text-[0.54em] uppercase tracking-[0.1em] text-[#6B6B6B]"
                  style={{ fontFamily: MONO }}
                >
                  {k}
                </span>
                <b className="block text-[1em] font-black italic leading-[1.15]">
                  <CountUp to={v} start={1400 + i * 150} />
                </b>
              </div>
            ))}
          </div>
          <svg
            viewBox="0 0 100 30"
            className="mt-[0.45em] block h-[2.3em] w-full"
            preserveAspectRatio="none"
            aria-hidden
          >
            <motion.path
              d="M0 28 C10 27 16 22 26 23 S42 15 52 16 S68 7 78 8 S92 2 100 1 L100 30 L0 30 Z"
              fill="rgba(8,102,255,0.12)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 0.5 }}
            />
            <motion.path
              d="M0 28 C10 27 16 22 26 23 S42 15 52 16 S68 7 78 8 S92 2 100 1"
              fill="none"
              stroke={META_BLUE}
              strokeWidth={2.2}
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.5, duration: 1.2, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>

        {/* Google: ista ponuda u pretrazi */}
        <motion.div
          className="min-h-0 flex-1 overflow-hidden rounded-[0.8em] bg-white px-[0.9em] py-[0.65em] text-[#111]"
          initial={{ opacity: 0, y: "1em" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 0.4, ease: EASE_OUT }}
        >
          <div className="flex items-center gap-[0.45em] rounded-full border border-[#DADCE0] px-[0.7em] py-[0.25em] text-[0.78em]">
            <span className="flex flex-none gap-[0.14em]" aria-hidden>
              {["#4285F4", "#EA4335", "#FBBC05", "#34A853"].map((c) => (
                <i
                  key={c}
                  className="block h-[0.5em] w-[0.5em] rounded-full"
                  style={{ background: c }}
                />
              ))}
            </span>
            <Search className="h-[1em] w-[1em] flex-none text-[#6B6B6B]" />
            <span className="truncate">{QUERY.slice(0, typed)}</span>
          </div>
          {found && (
            <motion.div
              className="mt-[0.4em] min-w-0 leading-[1.25]"
              initial={{ opacity: 0, y: "0.5em" }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="block truncate text-[0.58em] text-[#4D5156]">
                <b className="text-[#111]">Sponzorisano</b> · {DOMAIN}
              </span>
              <b
                className="block truncate text-[0.82em] font-semibold"
                style={{ color: "#1A0DAB" }}
              >
                {BRAND}: sveže pržena kafa −{off(ESPRESSO)}%
              </b>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- scena */

type Phase = 0 | 1 | 2;

export default function Production({
  phase,
  hold,
}: {
  phase: Phase;
  hold: (on: boolean) => void;
}) {
  const reduce = useReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const clock = useRef<number>(PHASE_T[phase]);
  const [start] = useState<Phase>(phase);
  const [ready, setReady] = useState(studio !== undefined);
  const [fallback, setFallback] = useState(studio === null);
  const [thumbs, setThumbs] = useState<string[]>(studio?.thumbs ?? []);
  const [shot, setShot] = useState(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // sat: posle promene faze nikad ne zaostaje za njenim početkom
  useEffect(() => {
    clock.current = Math.max(clock.current, PHASE_T[phase]);
    if (clock.current > PHASE_T[phase] + 0.25 && phase > start)
      clock.current = PHASE_T[phase];
  }, [phase, start]);

  useEffect(() => {
    const el = host.current;
    let alive = true;
    let raf = 0;
    let ro: ResizeObserver | undefined;
    const me = ++owners;
    if (studio === undefined) hold(true);
    preloadStudio().then((s) => {
      if (!alive) return;
      if (!s || !el) {
        setFallback(true);
        setReady(true);
        hold(false);
        return;
      }
      s.owner = me;
      el.appendChild(s.canvas);
      const fit = () => s.resize(el.clientWidth, el.clientHeight);
      fit();
      ro = new ResizeObserver(fit);
      ro.observe(el);
      setThumbs(s.thumbs);
      clock.current = PHASE_T[start];
      const REST_T = [6.6, 10.2, 14.6];
      let last = performance.now();
      let shown = -1;
      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (reduce) clock.current = REST_T[phaseRef.current];
        else clock.current += dt;
        if (s.owner === me) s.frame(clock.current);
        const i = shotAt(clock.current).i;
        if (i !== shown) {
          shown = i;
          setShot(i);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      setReady(true);
      hold(false);
    });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      const c = studio?.canvas;
      if (c && el && c.parentElement === el) el.removeChild(c);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const from = Math.max(0, start - 1);
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: STAGE }}
    >
      <motion.div
        className="absolute left-0 top-0"
        style={{
          width: `${STAGE_W}em`,
          height: `${STAGE_H}em`,
          transformOrigin: "0 0",
          willChange: "transform",
        }}
        initial={FRAME[from]}
        animate={ready ? FRAME[phase] : FRAME[from]}
        transition={FRAME_T[phase]}
      >
        <motion.div
          ref={host}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {fallback && <Fallback />}
        </motion.div>
        {ready && phase === 1 && <CropGuide />}
      </motion.div>

      <AnimatePresence>
        {ready && phase === 0 && <Viewfinder key="vf" delay={T.pov} />}
        {ready && phase === 1 && (
          <Editor key="ed" thumbs={thumbs} shot={shot} />
        )}
      </AnimatePresence>
      {ready && phase === 2 && <Social thumb={thumbs[0]} />}
    </div>
  );
}
