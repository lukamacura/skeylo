"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgePercent,
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  Download,
  Gift,
  Home,
  MapPin,
  QrCode,
  ScanBarcode,
  Tag,
} from "lucide-react";
import {
  DISPLAY,
  EASE_OUT,
  MONO,
  NETO_RADIUS,
  POP_SPRING,
  RED,
  fmt,
  useSlideActive,
} from "../primitives";
import { FIRST_BUY_OFF, QR_DOOR } from "./data";
import { Barcode, QrGlyph } from "./scenes";

/* ------------------------------------------------------------------------
   The customer's way from the sticker on the door to the discount on the
   receipt, played on a phone: the camera finds the QR code, the store page
   installs the app, the app shows the Neto card, the till takes 5% off.
   Next to the phone, the four steps in words; the one on screen is lit
   and a tap on any of them shows it.

   The phone is drawn in em: its height comes from the screen height and
   its font size from its own height, so everything inside scales with it
   and the slide fits a short phone as well as a laptop.
   ------------------------------------------------------------------------ */

const STEPS = [
  { icon: QrCode, title: "Skenira QR", hint: "Nalepnica na vratima" },
  {
    icon: Download,
    title: "Skine aplikaciju",
    hint: "App Store i Google Play",
  },
  { icon: ScanBarcode, title: "Pokaže bar kod", hint: "Neto kartica, na kasi" },
  {
    icon: BadgePercent,
    title: `−${FIRST_BUY_OFF}% na računu`,
    hint: "Već na prvoj kupovini",
  },
] as const;

const BEAT = 3000;

/* An illustrative first purchase, so the receipt shows a real saving. */
const BASKET = 2480;
const SAVED = Math.round((BASKET * FIRST_BUY_OFF) / 100);
const money = (n: number) => `${fmt(n)},00`;

const YELLOW = "#FFD60A";

/* ------------------------------------------------------------------------ */

export function QrJourney() {
  const active = useSlideActive();
  const [step, setStep] = useState(0);
  /* Bumped on a tap, so the timer starts over from the chosen step. */
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), BEAT);
    return () => clearTimeout(t);
  }, [active, step, run]);

  const pick = (i: number) => {
    setStep(i);
    setRun((r) => r + 1);
  };

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3.5 md:gap-8 lg:gap-12">
      <Phone step={step} />
      <ol className="grid max-w-[480px] gap-1.5 md:gap-2.5">
        {STEPS.map((s, i) => {
          const on = i === step;
          const Icon = s.icon;
          return (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => pick(i)}
                aria-current={on ? "step" : undefined}
                className="relative flex w-full items-center gap-2.5 overflow-hidden px-2 py-2 text-left transition-colors duration-300 md:gap-4 md:px-4 md:py-2.5 [@media(min-height:780px)]:md:py-3.5"
                style={{
                  borderRadius: NETO_RADIUS,
                  background: on ? "rgba(255,255,255,0.08)" : "transparent",
                  border: `1px solid ${on ? "#3A3A3A" : "transparent"}`,
                }}
              >
                <span
                  className="grid h-8 w-8 flex-none place-items-center transition-colors duration-300 md:h-12 md:w-12"
                  style={{
                    background: on ? RED : "#1E1E1E",
                    color: on ? "#fff" : "#8A8A8A",
                    borderRadius: "10px 10px 10px 3px",
                  }}
                >
                  <Icon className="h-4 w-4 md:h-6 md:w-6" />
                </span>
                <span className="min-w-0">
                  <span
                    className="block text-[10px] uppercase tracking-[0.14em] md:text-[11px]"
                    style={{
                      fontFamily: MONO,
                      color: on ? "#FF4B42" : "#6B6B6B",
                    }}
                  >
                    Korak {i + 1}
                  </span>
                  <b
                    className="block text-[13.5px] font-extrabold leading-[1.15] transition-colors duration-300 md:text-[19px]"
                    style={{ color: on ? "#fff" : "#8A8A8A" }}
                  >
                    {s.title}
                  </b>
                  <span
                    className="mt-0.5 hidden text-[14px] leading-[1.25] [@media(min-height:780px)]:md:block"
                    style={{ color: "#8A8A8A" }}
                  >
                    {s.hint}
                  </span>
                </span>
                {on && active && (
                  <motion.i
                    key={`${step}-${run}`}
                    aria-hidden
                    className="absolute bottom-0 left-0 block h-[2px]"
                    style={{ background: RED }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: BEAT / 1000, ease: "linear" }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* The phone                                                                  */
/* ------------------------------------------------------------------------ */

const SCREENS = [Camera, Store, Card, Receipt];

function Phone({ step }: { step: number }) {
  const Screen = SCREENS[step];
  return (
    <div
      aria-hidden
      className="relative flex-none select-none [--ph-r:290px] lg:[--ph-r:410px]"
      style={
        {
          "--ph": "clamp(300px, calc(100svh - var(--ph-r)), 560px)",
          height: "var(--ph)",
          width: "calc(var(--ph) * 0.49)",
          fontSize: "calc(var(--ph) / 46)",
          fontFamily: DISPLAY,
        } as CSSProperties
      }
    >
      <div
        className="absolute inset-0 p-[0.55em]"
        style={{
          background: "#1b1b1d",
          borderRadius: "3.4em",
          boxShadow:
            "0 0 0 1.5px #8d8d92, 0 0 0 3px #3a3a3c, 0 30px 60px -30px rgba(0,0,0,0.7)",
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden bg-black"
          style={{ borderRadius: "2.9em", isolation: "isolate" }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={step}
              className="absolute inset-0"
              initial={{ opacity: 0, x: "12%" }}
              animate={{ opacity: 1, x: "0%" }}
              exit={{ opacity: 0, x: "-12%" }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
            >
              <Screen />
            </motion.div>
          </AnimatePresence>
          <span className="absolute left-1/2 top-[0.6em] z-30 block h-[1.7em] w-[5.6em] -translate-x-1/2 rounded-full bg-black" />
        </div>
      </div>
    </div>
  );
}

/* --- 1. The camera finds the sticker on the door ------------------------
   The door after the redesign: the Gemini "posle" photo of the
   Fruškogorska door, with the real sticker on the glass. Until that photo
   exists, the "pre" photo with the sticker drawn where the flyer is. */

/* Where the QR code's white square sits in posle-vrata.webp, in percent of
   the phone screen (the photo is cropped to the screen's width, 18.2% off
   each side). Measured from the pixels; redo it if the photo changes. */
const QR_IN_PHOTO = {
  left: "37.4%",
  top: "54.6%",
  width: "26%",
  height: "12.3%",
};

function Camera() {
  return (
    <div className="absolute inset-0 bg-black">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.14 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: EASE_OUT }}
      >
        <Image
          src={QR_DOOR.posle ?? QR_DOOR.pre}
          alt=""
          fill
          sizes="280px"
          className="object-cover"
          style={{ filter: "brightness(0.9) saturate(0.95)" }}
        />
        {QR_DOOR.posle ? (
          <span className="absolute" style={QR_IN_PHOTO}>
            <Brackets />
          </span>
        ) : (
          <DrawnSticker />
        )}
      </motion.div>

      {/* what iOS shows once it reads a code */}
      <motion.div
        className="absolute inset-x-[1em] bottom-[6.4em] flex items-center gap-[0.7em] bg-white/95 px-[0.8em] py-[0.7em] text-black"
        style={{
          borderRadius: "1.1em",
          boxShadow: "0 0.6em 1.6em rgba(0,0,0,0.4)",
        }}
        initial={{ opacity: 0, y: "1.5em", scale: 0.92 }}
        animate={{ opacity: 1, y: "0em", scale: 1 }}
        transition={{ ...POP_SPRING, delay: 1.2 }}
      >
        <AppIcon size={2.6} />
        <span className="min-w-0 flex-1 leading-[1.15]">
          <b className="block text-[1.05em] font-extrabold">Neto aplikacija</b>
          <span className="block text-[0.85em] text-[#6B6B6B]">
            −{FIRST_BUY_OFF}% na prvu kupovinu
          </span>
        </span>
        <ChevronRight className="h-[1.3em] w-[1.3em] flex-none text-[#8A8A8A]" />
      </motion.div>

      {/* shutter */}
      <span className="absolute bottom-[1.6em] left-1/2 block h-[3.6em] w-[3.6em] -translate-x-1/2 rounded-full border-[0.3em] border-white/90" />
      <span
        className="absolute left-1/2 top-[3.2em] -translate-x-1/2 rounded-full px-[0.7em] py-[0.25em] text-[0.75em] font-bold uppercase tracking-[0.12em] text-black"
        style={{ background: YELLOW, fontFamily: MONO }}
      >
        QR kod
      </span>
    </div>
  );
}

/* The camera's yellow corners closing in on the code. */
function Brackets() {
  return (
    <motion.span
      className="absolute -inset-[0.55em]"
      initial={{ scale: 1.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.55, duration: 0.45, ease: EASE_OUT }}
    >
      {(
        [
          "left-0 top-0 border-l-[0.28em] border-t-[0.28em] rounded-tl-[0.7em]",
          "right-0 top-0 border-r-[0.28em] border-t-[0.28em] rounded-tr-[0.7em]",
          "left-0 bottom-0 border-b-[0.28em] border-l-[0.28em] rounded-bl-[0.7em]",
          "right-0 bottom-0 border-b-[0.28em] border-r-[0.28em] rounded-br-[0.7em]",
        ] as const
      ).map((c) => (
        <i
          key={c}
          className={`absolute block h-[1.6em] w-[1.6em] ${c}`}
          style={{ borderColor: YELLOW }}
        />
      ))}
    </motion.span>
  );
}

/* The sticker drawn over the taped flyer, for as long as there is no
   "posle" photo of the door. */
function DrawnSticker() {
  return (
    <div
      className="absolute flex flex-col items-center px-[0.7em] py-[0.8em] text-center text-white"
      style={{
        left: "27%",
        width: "46%",
        top: "41%",
        background: RED,
        borderRadius: "0.3em 1.3em 0.3em 0.3em",
        boxShadow: "0 0.4em 1.2em rgba(0,0,0,0.35)",
      }}
    >
      <b className="block text-[1.3em] font-black italic leading-[1]">
        Skeniraj
        <br />
        QR kod
      </b>
      <span className="relative mt-[0.55em] block aspect-square w-[78%] [&_svg]:!h-full [&_svg]:!w-full">
        <QrGlyph />
        <Brackets />
      </span>
      <span className="mt-[0.55em] block text-[0.95em] font-bold leading-[1.2]">
        i ostvari {FIRST_BUY_OFF}% popusta na 1. kupovinu.
      </span>
    </div>
  );
}

/* --- 2. The store page: get, a ring fills, open ------------------------- */
function Store() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const a = setTimeout(() => setPhase(1), 500);
    const b = setTimeout(() => setPhase(2), 1500);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col bg-white px-[1.3em] pt-[4.6em] text-[#111]">
      <div className="flex items-center gap-[1em]">
        <AppIcon size={5.6} />
        <div className="min-w-0 flex-1">
          <b className="block text-[1.8em] font-black italic leading-[1]">
            Neto
          </b>
          <span className="mt-[0.2em] block text-[0.9em] leading-[1.2] text-[#6B6B6B]">
            Akcije, kartica, popusti
          </span>
          <span className="mt-[0.6em] flex h-[2.2em] items-center">
            {phase === 0 && (
              <span
                className="rounded-full px-[1.1em] py-[0.35em] text-[0.95em] font-extrabold text-white"
                style={{ background: "#0A84FF" }}
              >
                Preuzmi
              </span>
            )}
            {phase === 1 && (
              <svg viewBox="0 0 36 36" className="h-[2em] w-[2em] -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#E4E2DC"
                  strokeWidth="3.5"
                />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#0A84FF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.1, ease: "easeInOut" }}
                />
              </svg>
            )}
            {phase === 2 && (
              <motion.span
                className="rounded-full px-[1.1em] py-[0.35em] text-[0.95em] font-extrabold"
                style={{ background: "#E8F1FF", color: "#0A84FF" }}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={POP_SPRING}
              >
                Otvori
              </motion.span>
            )}
          </span>
        </div>
      </div>

      <div
        className="mt-[1.6em] flex items-center gap-[0.8em] px-[1em] py-[1em] text-white"
        style={{
          background: `linear-gradient(135deg, ${RED}, #9E120B)`,
          borderRadius: "0.5em 1.6em 0.5em 0.5em",
        }}
      >
        <b className="text-[2.6em] font-black italic leading-[0.9]">
          −{FIRST_BUY_OFF}%
        </b>
        <span className="text-[0.95em] font-bold leading-[1.2]">
          na prvu kupovinu, odmah posle preuzimanja
        </span>
      </div>

      <div className="mt-[1em] grid gap-[0.55em]">
        {(
          [
            [Tag, "Akcije nedelje"],
            [Bell, "Obaveštenja o akcijama"],
            [Gift, "Neto Klub, poeni i vaučeri"],
          ] as const
        ).map(([Icon, label]) => (
          <span
            key={label}
            className="flex items-center gap-[0.7em] rounded-[0.8em] bg-[#F4F3EF] px-[0.8em] py-[0.65em] text-[0.95em] font-bold"
          >
            <Icon
              className="h-[1.2em] w-[1.2em] flex-none"
              style={{ color: RED }}
            />
            {label}
          </span>
        ))}
      </div>

      {/* the store's screenshot strip, sketched */}
      <div className="mt-[1.2em] grid grid-cols-3 gap-[0.6em]">
        <Shot bg={RED}>
          <b className="text-[1.6em] font-black italic leading-none text-white">
            −{FIRST_BUY_OFF}%
          </b>
          <span className="mt-[0.4em] block h-[1.6em] w-[80%] rounded-[0.25em] bg-white" />
        </Shot>
        <Shot bg="#F4F3EF">
          <span className="grid w-[80%] grid-cols-2 gap-[0.3em]">
            {["#FFD34D", "#9AD0F5", "#F5B59A", "#B9E0A5"].map((c) => (
              <span
                key={c}
                className="relative block aspect-square rounded-[0.25em]"
                style={{ background: c }}
              >
                <i
                  className="absolute -right-[0.15em] -top-[0.15em] block h-[0.6em] w-[0.6em] rounded-full"
                  style={{ background: RED }}
                />
              </span>
            ))}
          </span>
        </Shot>
        <Shot bg="#1a0f3a">
          <span className="flex w-[84%] items-center gap-[0.3em] rounded-[0.4em] bg-white/90 px-[0.3em] py-[0.35em]">
            <i
              className="block h-[1em] w-[1em] flex-none rounded-[0.25em]"
              style={{ background: RED }}
            />
            <i className="block h-[0.35em] flex-1 rounded-full bg-[#B5B5B5]" />
          </span>
          <Bell className="mt-[0.6em] h-[1.4em] w-[1.4em] text-white/80" />
        </Shot>
      </div>
    </div>
  );
}

function Shot({ bg, children }: { bg: string; children: ReactNode }) {
  return (
    <span
      className="flex aspect-[0.56] flex-col items-center justify-center rounded-[0.8em]"
      style={{ background: bg, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}
    >
      {children}
    </span>
  );
}

/* --- 3. The Neto card, with the discount on it --------------------------- */
function Card() {
  return (
    <div
      className="absolute inset-0 flex flex-col px-[1.2em] pt-[4.6em] text-[#111]"
      style={{ background: "#F7F6F2" }}
    >
      <div className="flex items-center justify-between">
        <Chip />
        <span className="text-[0.85em] font-bold text-[#6B6B6B]">
          Moj nalog
        </span>
      </div>
      <b className="mt-[0.9em] block text-[1.55em] font-black italic leading-[1.05]">
        Dobrodošli
        <br />u Neto!
      </b>

      <motion.div
        className="relative mt-[1em] flex aspect-[1.6] w-full flex-col justify-between p-[1em] text-white"
        style={{
          background: `linear-gradient(135deg, ${RED}, #9E120B)`,
          borderRadius: "1.2em",
          boxShadow: "0 1.2em 2.4em -1.2em rgba(226,35,26,0.7)",
        }}
        initial={{ y: "1.5em", opacity: 0, rotate: -3 }}
        animate={{ y: "0em", opacity: 1, rotate: 0 }}
        transition={{ ...POP_SPRING, delay: 0.25 }}
      >
        <span
          className="text-[0.7em] uppercase tracking-[0.14em] opacity-90"
          style={{ fontFamily: MONO }}
        >
          Neto kartica
        </span>
        <span className="flex items-end gap-[0.4em]">
          <b className="text-[2.7em] font-black italic leading-[0.85]">
            −{FIRST_BUY_OFF}%
          </b>
          <span className="pb-[0.15em] text-[0.8em] font-bold leading-[1.1]">
            na prvu
            <br />
            kupovinu
          </span>
        </span>
        <span className="relative block h-[2.9em] overflow-hidden rounded-[0.45em] bg-white px-[0.6em] pb-[1em] pt-[0.35em]">
          <Barcode />
          <span
            className="absolute inset-x-0 bottom-[0.1em] text-center text-[0.6em] tracking-[0.24em] text-black"
            style={{ fontFamily: MONO }}
          >
            2045 1180 7736
          </span>
          <motion.i
            className="absolute inset-x-[0.3em] block h-[2px] rounded-full"
            style={{
              background: "#FF2A1F",
              boxShadow: "0 0 8px 2px rgba(255,42,31,0.75)",
            }}
            initial={{ top: "10%" }}
            animate={{ top: ["10%", "68%", "10%"] }}
            transition={{
              duration: 1.4,
              delay: 0.8,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </span>
      </motion.div>

      <span className="mt-[1em] flex items-center justify-center gap-[0.5em] text-[0.95em] font-bold text-[#6B6B6B]">
        <ScanBarcode className="h-[1.3em] w-[1.3em]" style={{ color: RED }} />
        Pokažite kod na kasi
      </span>

      <div className="mt-[1.1em] grid grid-cols-2 gap-[0.55em]">
        {(
          [
            [Tag, "Akcije nedelje"],
            [Gift, "Neto Klub"],
            [Bell, "Obaveštenja"],
            [MapPin, "Tvoj Neto"],
          ] as const
        ).map(([Icon, label]) => (
          <span
            key={label}
            className="flex items-center gap-[0.5em] rounded-[0.8em] bg-white px-[0.7em] py-[0.75em] text-[0.85em] font-bold"
            style={{ boxShadow: "inset 0 0 0 1px #E4E2DC" }}
          >
            <Icon
              className="h-[1.25em] w-[1.25em] flex-none"
              style={{ color: RED }}
            />
            {label}
          </span>
        ))}
      </div>

      {/* tab bar */}
      <div
        className="absolute inset-x-0 bottom-0 flex items-start justify-around bg-white px-[1em] pb-[1.8em] pt-[0.7em]"
        style={{ boxShadow: "0 -1px 0 #E4E2DC" }}
      >
        {(
          [
            [Home, "Početna", false],
            [Tag, "Akcije", false],
            [CreditCard, "Kartica", true],
            [Gift, "Klub", false],
          ] as const
        ).map(([Icon, label, on]) => (
          <span
            key={label}
            className="flex flex-col items-center gap-[0.2em] text-[0.7em] font-bold"
            style={{ color: on ? RED : "#8A8A8A" }}
          >
            <Icon className="h-[1.9em] w-[1.9em]" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* --- 4. At the till: the receipt with the discount ----------------------- */
function Receipt() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center px-[1.3em] text-[#111]"
      style={{ background: RED }}
    >
      <motion.div
        className="w-full bg-white px-[1.1em] pb-[1.4em] pt-[1.1em]"
        style={{
          borderRadius: "0.4em",
          fontFamily: MONO,
          boxShadow: "0 1em 2.4em -1em rgba(0,0,0,0.5)",
          clipPath:
            "polygon(0 0,100% 0,100% calc(100% - 0.5em),95% 100%,90% calc(100% - 0.5em),85% 100%,80% calc(100% - 0.5em),75% 100%,70% calc(100% - 0.5em),65% 100%,60% calc(100% - 0.5em),55% 100%,50% calc(100% - 0.5em),45% 100%,40% calc(100% - 0.5em),35% 100%,30% calc(100% - 0.5em),25% 100%,20% calc(100% - 0.5em),15% 100%,10% calc(100% - 0.5em),5% 100%,0 calc(100% - 0.5em))",
        }}
        initial={{ y: "40%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      >
        <div className="flex justify-center">
          <Chip />
        </div>
        <span className="mt-[0.5em] block text-center text-[0.7em] uppercase tracking-[0.14em] text-[#6B6B6B]">
          Prva kupovina
        </span>
        <div className="mt-[0.9em] grid gap-[0.45em] text-[0.82em]">
          <Row label="Ukupno" value={money(BASKET)} />
          <Row
            label={`Neto kartica −${FIRST_BUY_OFF}%`}
            value={`−${money(SAVED)}`}
            red
          />
          <span className="my-[0.2em] block border-t border-dashed border-[#B5B5B5]" />
          <Row label="Za uplatu" value={money(BASKET - SAVED)} bold />
        </div>
      </motion.div>

      <motion.span
        className="mt-[1.3em] flex items-center gap-[0.5em] rounded-full bg-white px-[1em] py-[0.55em] text-[1.05em] font-extrabold text-black"
        style={{ boxShadow: "0 0.6em 1.4em -0.6em rgba(0,0,0,0.6)" }}
        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: -2 }}
        transition={{ ...POP_SPRING, delay: 0.75 }}
      >
        <span
          className="grid h-[1.4em] w-[1.4em] place-items-center rounded-full text-white"
          style={{ background: "#16A34A" }}
        >
          <Check className="h-[0.9em] w-[0.9em]" strokeWidth={3.5} />
        </span>
        Ušteda {fmt(SAVED)} RSD
      </motion.span>
      <span className="mt-[1em] text-[1em] font-extrabold italic text-white">
        Svaki dinar je bitan.
      </span>
    </div>
  );
}

function Row({
  label,
  value,
  red = false,
  bold = false,
}: {
  label: string;
  value: string;
  red?: boolean;
  bold?: boolean;
}) {
  return (
    <span
      className={`flex items-baseline justify-between gap-[0.6em] ${bold ? "text-[1.15em] font-semibold" : ""}`}
      style={{ color: red ? RED : undefined }}
    >
      <span className="min-w-0 truncate">{label}</span>
      <span className="whitespace-nowrap">{value}</span>
    </span>
  );
}

/* --- small parts ---------------------------------------------------------- */

function AppIcon({ size }: { size: number }) {
  return (
    <span
      className="grid flex-none place-items-center text-white"
      style={{
        width: `${size}em`,
        height: `${size}em`,
        background: RED,
        borderRadius: `${size * 0.24}em`,
      }}
    >
      <b
        className="-rotate-2 font-black italic leading-none"
        style={{ fontSize: `${size * 0.3}em` }}
      >
        Neto
      </b>
    </span>
  );
}

function Chip() {
  return (
    <span
      className="inline-block -rotate-2 px-[0.6em] py-[0.1em] text-[1.05em] font-black italic text-white"
      style={{
        background: RED,
        borderRadius: "0.25em 0.7em 0.25em 0.25em",
        fontFamily: DISPLAY,
      }}
    >
      Neto
    </span>
  );
}
