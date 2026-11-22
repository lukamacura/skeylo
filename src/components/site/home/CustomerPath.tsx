"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  Bell,
  Bookmark,
  Boxes,
  Check,
  ChevronRight,
  Globe,
  Heart,
  Home,
  Instagram,
  LayoutDashboard,
  Lock,
  MessageCircle,
  Minus,
  MousePointerClick,
  Plus,
  PlusSquare,
  Search,
  Send,
  ShoppingCart,
  Truck,
  User,
  X,
} from "lucide-react";
import {
  BLENDS,
  BRAND,
  Bag,
  BrandChip,
  CountUp,
  DOMAIN,
  EASE_OUT,
  GOLD,
  GREEN,
  HANDLE,
  IG_BLUE,
  IG_GRAD,
  MONO,
  OR,
  PHONE_H,
  POP,
  Phone,
  Tap,
  fmt,
  off,
} from "./reelKit";

/*
 * Put jednog kupca, posle "Šta radimo" a pre operativnog sistema (Luka,
 * 22.11.2026): reklama iskoči u Instagram feedu, klik na dugme, otvara se
 * sajt, klik na "Poruči", i porudžbina stiže u sistem firme sa oznakom oglasa
 * iz kog je došla. Telefon igra kupca; na širem ekranu prozor sistema stoji
 * pored i porudžbina preleti, na telefonu prozor zameni telefon u poslednjem
 * koraku. Porudžbina, imena i brojevi su izmišljeni ("Tvoja firma").
 */

const [ESPRESSO, FILTER, TURSKA] = BLENDS;
const QTY = 2;
const TOTAL = ESPRESSO.now * QTY;
const BEFORE = FILTER.now + TURSKA.now * 3;
const ORDER_NO = 1042;

const STEPS = [
  { icon: Instagram, title: "Reklama na Instagramu", ms: 3400 },
  { icon: MousePointerClick, title: "Klik na dugme", ms: 1500 },
  { icon: Globe, title: "Otvara se sajt", ms: 2300 },
  { icon: ShoppingCart, title: "Poručuje", ms: 2100 },
  { icon: LayoutDashboard, title: "Stiže u tvoj sistem", ms: 5200 },
] as const;

/* ------------------------------------------------------------------------ */
/* Feed                                                                      */
/* ------------------------------------------------------------------------ */

const STORIES = ["#F9CE34", "#EE2A7B", "#6228D7", "#F58529", "#DD2A7B"];
/* priče (5.6) + objava iznad oglasa (28.7) */
const SCROLL = "-34.3em";

function OtherPost() {
  return (
    <div className="h-[28.7em]">
      <div className="flex h-[3.2em] items-center gap-[0.6em] px-[0.9em]">
        <span className="h-[2.1em] w-[2.1em] rounded-full bg-[#C9B8A6]" />
        <b className="text-[1.05em]">marija.ns</b>
      </div>
      <div
        className="relative aspect-square w-full overflow-hidden"
        style={{ background: "linear-gradient(180deg, #FDBA74, #F472B6 70%)" }}
      >
        <span className="absolute left-[60%] top-[22%] h-[4em] w-[4em] rounded-full bg-[#FFF7AE]" />
        <span
          className="absolute inset-x-0 bottom-0 h-[45%]"
          style={{
            background: "#6D28D9",
            clipPath:
              "polygon(0 60%, 30% 10%, 55% 55%, 75% 25%, 100% 65%, 100% 100%, 0 100%)",
          }}
        />
      </div>
      <div className="flex h-[2.8em] items-center gap-[0.9em] px-[0.9em]">
        <Heart className="h-[1.5em] w-[1.5em]" />
        <MessageCircle className="h-[1.5em] w-[1.5em]" />
        <Send className="h-[1.5em] w-[1.5em]" />
      </div>
    </div>
  );
}

/* Zrna koja padaju kroz kreativu, u petlji. */
const BEANS = [
  { x: 8, d: 0, r: 30, s: 1 },
  { x: 24, d: 1.1, r: -20, s: 0.8 },
  { x: 72, d: 0.5, r: 50, s: 1.1 },
  { x: 86, d: 1.6, r: -40, s: 0.9 },
  { x: 58, d: 2.2, r: 15, s: 0.7 },
];

function Bean({ size }: { size: string }) {
  return (
    <svg viewBox="0 0 20 28" style={{ width: size }} aria-hidden>
      <ellipse cx="10" cy="14" rx="9" ry="13" fill="#9A6440" />
      <path
        d="M10 2c-4 6 4 12 0 24"
        stroke="#4A2E1E"
        strokeWidth={2}
        fill="none"
      />
    </svg>
  );
}

/** Kreativa oglasa: motion grafika, kesa kafe, zrna, nalepnica s popustom. */
function AdCreative() {
  return (
    <div
      className="relative aspect-square w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(70% 60% at 50% 62%, rgba(216,121,40,0.55), transparent 70%), linear-gradient(165deg, #3A2417, #120B07)",
      }}
    >
      {BEANS.map((b, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute top-0 block"
          style={{ left: `${b.x}%` }}
          initial={{ y: "-3em", rotate: 0 }}
          animate={{ y: "23em", rotate: b.r * 4 }}
          transition={{
            delay: b.d,
            duration: 3.2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Bean size={`${1.3 * b.s}em`} />
        </motion.span>
      ))}
      <motion.div
        className="absolute left-[1em] top-[1em]"
        initial={{ opacity: 0, x: "-1em" }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.45, ease: EASE_OUT }}
      >
        <span
          className="block text-[0.75em] font-semibold tracking-[0.16em]"
          style={{ color: GOLD, fontFamily: MONO }}
        >
          SVEŽE PRŽENO
        </span>
        <b className="block text-[2.1em] font-black italic leading-[1] text-white">
          {ESPRESSO.name}
        </b>
      </motion.div>
      <motion.div
        className="absolute bottom-[1.2em] left-1/2 h-[11.5em] w-[11.5em]"
        style={{ x: "-40%" }}
        initial={{ y: "4em", scale: 0.6, rotate: -14, opacity: 0 }}
        animate={{ y: 0, scale: 1, rotate: -6, opacity: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.7 }}
      >
        <motion.div
          className="h-full w-full"
          animate={{ y: ["0em", "-0.5em", "0em"] }}
          transition={{
            delay: 1.6,
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Bag blend={ESPRESSO} />
        </motion.div>
      </motion.div>
      <motion.span
        className="absolute right-[0.9em] top-[4.6em] grid h-[4.6em] w-[4.6em] place-items-center rounded-full text-center text-[1em] font-black italic leading-[0.95] text-white shadow-[0_0.3em_0.8em_rgba(0,0,0,0.35)]"
        style={{ background: OR, rotate: 10 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ ...POP, delay: 1.9 }}
      >
        <span>
          <span className="block text-[1.45em]">−{off(ESPRESSO)}%</span>
          <span className="block text-[0.62em] not-italic tracking-[0.04em]">
            1. porudžbina
          </span>
        </span>
      </motion.span>
      <span className="absolute bottom-[0.8em] left-[0.8em]">
        <BrandChip className="text-[0.9em]" />
      </span>
    </div>
  );
}

function SponsoredPost({ tapped }: { tapped: boolean }) {
  return (
    <div>
      <div className="flex h-[3.2em] items-center gap-[0.6em] px-[0.9em]">
        <span
          className="grid h-[2.1em] w-[2.1em] place-items-center rounded-full text-[0.85em] font-black italic text-white"
          style={{
            background: OR,
            boxShadow: `0 0 0 0.15em #fff, 0 0 0 0.3em ${OR}`,
          }}
        >
          tf
        </span>
        <span className="leading-[1.15]">
          <b className="block text-[1.05em]">{HANDLE}</b>
          <span className="text-[0.85em] text-[#6B6B6B]">Sponzorisano</span>
        </span>
        <span className="ml-auto text-[1.3em] leading-none text-[#6B6B6B]">
          ···
        </span>
      </div>
      <AdCreative />
      <motion.div
        className="relative flex h-[2.9em] items-center justify-between px-[0.9em] text-[1.05em] font-bold"
        initial={{ backgroundColor: "#EFEFEF", color: "#111" }}
        animate={
          tapped
            ? { backgroundColor: IG_BLUE, color: "#fff", scale: [1, 0.97, 1] }
            : { backgroundColor: IG_BLUE, color: "#fff" }
        }
        transition={
          tapped
            ? { duration: 0.3, delay: 0.25 }
            : { delay: 2.5, duration: 0.4 }
        }
      >
        Poruči sada
        <ChevronRight className="h-[1.2em] w-[1.2em]" />
        {tapped && <Tap at={0} />}
      </motion.div>
      <div className="flex h-[2.8em] items-center gap-[0.9em] px-[0.9em]">
        <Heart className="h-[1.5em] w-[1.5em]" />
        <MessageCircle className="h-[1.5em] w-[1.5em]" />
        <Send className="h-[1.5em] w-[1.5em]" />
        <Bookmark className="ml-auto h-[1.5em] w-[1.5em]" />
      </div>
    </div>
  );
}

function Feed({ step, skip }: { step: number; skip: boolean }) {
  return (
    <div className="absolute inset-0 bg-white text-[#111]">
      <div className="absolute inset-x-0 top-0 z-10 flex items-end justify-between bg-white px-[1em] pb-[0.5em] pt-[2.9em]">
        <b className="text-[1.6em] font-extrabold italic tracking-[-0.02em]">
          Instagram
        </b>
        <span className="flex gap-[0.9em] pb-[0.2em]">
          <Heart className="h-[1.5em] w-[1.5em]" />
          <Send className="h-[1.5em] w-[1.5em]" />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-[3.4em] top-[5.6em] overflow-hidden">
        <motion.div
          initial={{ y: skip ? SCROLL : "0em" }}
          animate={{ y: SCROLL }}
          transition={{ delay: 0.5, duration: 1.5, ease: [0.3, 0, 0.2, 1] }}
        >
          <div className="flex h-[5.6em] items-center gap-[0.75em] px-[0.9em]">
            {STORIES.map((c, i) => (
              <span
                key={i}
                className="block h-[3.9em] w-[3.9em] flex-none rounded-full p-[0.18em]"
                style={{ background: IG_GRAD }}
              >
                <span
                  className="block h-full w-full rounded-full border-[0.2em] border-white"
                  style={{ background: c, opacity: 0.55 }}
                />
              </span>
            ))}
          </div>
          <OtherPost />
          <SponsoredPost tapped={step >= 1} />
        </motion.div>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-[3.4em] items-center justify-around border-t border-[#EFEFEF] bg-white">
        {[Home, Search, PlusSquare, Instagram, User].map((I, i) => (
          <I key={i} className="h-[1.5em] w-[1.5em]" />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Sajt, otvoren u Instagramu                                                */
/* ------------------------------------------------------------------------ */

function SiteSheet({ step }: { step: number }) {
  const ordered = step >= 3;
  return (
    <motion.div
      className="absolute inset-0 z-20 bg-white text-[#111]"
      initial={{ y: "100%" }}
      animate={{ y: "0%" }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
    >
      <div className="flex items-end gap-[0.6em] border-b border-[#EFEFEF] px-[0.9em] pb-[0.6em] pt-[2.9em]">
        <X className="h-[1.4em] w-[1.4em]" />
        <span className="mx-auto text-center leading-[1.15]">
          <b className="block text-[1em]">{BRAND}</b>
          <span
            className="flex items-center justify-center gap-[0.25em] text-[0.75em] text-[#6B6B6B]"
            style={{ fontFamily: MONO }}
          >
            <Lock className="h-[0.9em] w-[0.9em]" />
            {DOMAIN}
          </span>
        </span>
        <span className="w-[1.4em]" />
      </div>
      <motion.span
        aria-hidden
        className="block h-[0.18em] origin-left"
        style={{ background: IG_BLUE }}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: 0 }}
        transition={{
          scaleX: { delay: 0.3, duration: 0.6 },
          opacity: { delay: 1, duration: 0.2 },
        }}
      />
      <div
        className="flex items-center justify-between px-[0.9em] py-[0.6em]"
        style={{ background: "#2A1C14" }}
      >
        <b className="text-[1.2em] font-black italic text-white">{BRAND}</b>
        <span className="relative text-white">
          <ShoppingCart className="h-[1.5em] w-[1.5em]" />
          <AnimatePresence>
            {ordered && (
              <motion.b
                className="absolute -right-[0.6em] -top-[0.6em] grid h-[1.3em] w-[1.3em] place-items-center rounded-full text-[0.75em] text-white"
                style={{ background: OR }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...POP, delay: 0.5 }}
              >
                {QTY}
              </motion.b>
            )}
          </AnimatePresence>
        </span>
      </div>
      <motion.div
        className="px-[1em] pt-[1em]"
        initial={{ opacity: 0, y: "1em" }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
      >
        <span
          className="text-[0.75em] tracking-[0.14em] text-[#6B6B6B]"
          style={{ fontFamily: MONO }}
        >
          AKCIJA NEDELJE
        </span>
        <div
          className="relative mt-[0.5em] rounded-[0.8em] p-[0.8em]"
          style={{ background: ESPRESSO.tint }}
        >
          <span className="mx-auto block h-[9.4em] w-[9.4em]">
            <Bag blend={ESPRESSO} />
          </span>
          <span
            className="absolute right-[0.7em] top-[0.7em] rounded-[0.35em] px-[0.45em] py-[0.15em] text-[1.1em] font-black italic text-white"
            style={{ background: OR }}
          >
            −{off(ESPRESSO)}%
          </span>
        </div>
        <b className="mt-[0.7em] block text-[1.35em] font-extrabold leading-[1.15]">
          {ESPRESSO.name} {ESPRESSO.size}
        </b>
        <div className="mt-[0.3em] flex items-center justify-between">
          <span className="text-[1.15em]">
            <s className="text-[#8A8A8A]">{fmt(ESPRESSO.was)}</s>{" "}
            <b style={{ color: OR }}>{fmt(ESPRESSO.now)} RSD</b>
          </span>
          <span className="flex items-center gap-[0.6em] rounded-full border border-[#E4E2DC] px-[0.6em] py-[0.25em] text-[1em] font-bold">
            <Minus className="h-[0.9em] w-[0.9em]" />
            {QTY}
            <Plus className="h-[0.9em] w-[0.9em]" />
          </span>
        </div>
        <motion.div
          className="relative mt-[0.9em] flex h-[3.2em] items-center justify-center gap-[0.4em] rounded-[0.7em] text-[1.15em] font-extrabold text-white"
          initial={false}
          animate={{ backgroundColor: ordered ? GREEN : OR }}
          transition={{ delay: ordered ? 0.55 : 0, duration: 0.25 }}
        >
          {ordered ? (
            <motion.span
              className="flex items-center gap-[0.4em]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              <Check className="h-[1.1em] w-[1.1em]" strokeWidth={3} />
              Poručeno
            </motion.span>
          ) : (
            <span>Poruči · {fmt(TOTAL)} RSD</span>
          )}
          {ordered && <Tap at={0.1} />}
        </motion.div>
        <span className="mt-[0.6em] flex items-center justify-center gap-[0.35em] text-[0.85em] text-[#6B6B6B]">
          <Truck className="h-[1.05em] w-[1.05em]" />
          Dostava sutra na adresu
        </span>
      </motion.div>
      <AnimatePresence>
        {ordered && (
          <motion.div
            className="absolute inset-x-[0.8em] top-[3.2em] z-30 flex items-center gap-[0.6em] rounded-[0.9em] bg-[#111] px-[0.9em] py-[0.7em] text-white shadow-[0_0.6em_1.5em_rgba(0,0,0,0.3)]"
            initial={{ y: "-130%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: 0.95,
              type: "spring",
              stiffness: 300,
              damping: 26,
            }}
          >
            <span
              className="grid h-[2em] w-[2em] flex-none place-items-center rounded-full"
              style={{ background: GREEN }}
            >
              <Check className="h-[1.1em] w-[1.1em]" strokeWidth={3} />
            </span>
            <span className="leading-[1.2]">
              <b className="block text-[1em]">Porudžbina primljena</b>
              <span className="text-[0.85em] text-[#B5B5B5]">
                #{ORDER_NO} · stiže sutra
              </span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CustomerPhone({ step, loop }: { step: number; loop: number }) {
  /* korak na kom se telefon otvorio: skoči pravo na njega, bez ponavljanja */
  const [first] = useState(step);
  return (
    <Phone>
      <div key={loop} className="absolute inset-0">
        <Feed step={step} skip={first >= 1} />
        {step >= 2 && <SiteSheet step={step} />}
      </div>
    </Phone>
  );
}

/* ------------------------------------------------------------------------ */
/* Sistem: porudžbina stiže                                                  */
/* ------------------------------------------------------------------------ */

type Kind = "ig" | "google" | "sajt";

function Source({ kind }: { kind: Kind }) {
  if (kind === "ig")
    return (
      <span
        className="inline-flex flex-none items-center gap-1 rounded-full px-2 py-[2px] text-[10px] font-bold text-white sm:text-[11px]"
        style={{ background: IG_GRAD }}
      >
        <Instagram size={11} />
        Instagram oglas
      </span>
    );
  return (
    <span
      className={`inline-flex flex-none items-center rounded-full px-2 py-[2px] text-[10px] font-bold sm:text-[11px] ${
        kind === "google"
          ? "bg-[#7cb4ff]/15 text-[#9cc6ff]"
          : "bg-white/[0.06] text-muted-foreground"
      }`}
    >
      {kind === "google" ? "Google oglas" : "Sajt"}
    </span>
  );
}

function OrderRow({
  no,
  what,
  who,
  sum,
  kind,
  fresh = false,
}: {
  no: number;
  what: string;
  who: string;
  sum: number;
  kind: Kind;
  fresh?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ring-inset ${
        fresh
          ? "bg-primary/10 ring-primary/30"
          : "bg-white/[0.03] ring-white/[0.06]"
      }`}
    >
      <span className="min-w-0 flex-1 leading-tight">
        <span className="flex items-center gap-1.5">
          <span
            className="text-[11px] font-semibold text-muted-foreground"
            style={{ fontFamily: MONO }}
          >
            #{no}
          </span>
          {fresh && (
            <span className="rounded-full bg-primary px-1.5 text-[9.5px] font-bold tracking-[0.1em] text-primary-foreground">
              NOVO
            </span>
          )}
          <span className="truncate text-[11px] text-muted-foreground">
            · {who}
          </span>
        </span>
        <b className="mt-0.5 block truncate text-[13.5px] font-bold sm:text-[14.5px]">
          {what}
        </b>
        <span className="mt-1 flex items-center gap-1.5">
          <span className="text-[12px] tabular-nums text-foreground/80">
            {fmt(sum)} RSD
          </span>
          <Source kind={kind} />
        </span>
      </span>
    </div>
  );
}

function Orders({ live }: { live: boolean }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-[#0c0b09] text-foreground ring-1 ring-white/12 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span aria-hidden className="flex gap-1.5">
          <i className="size-2.5 rounded-full bg-white/15" />
          <i className="size-2.5 rounded-full bg-white/15" />
          <i className="size-2.5 rounded-full bg-white/15" />
        </span>
        <span className="mx-auto truncate rounded-md bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-muted-foreground sm:text-xs">
          {BRAND} · Porudžbine
        </span>
        <span aria-hidden className="w-[42px]" />
      </div>
      <div className="p-3 sm:p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="grid size-8 flex-none place-items-center rounded-lg bg-primary/15 text-primary">
            <ShoppingCart size={15} />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block text-[11px] text-muted-foreground">
              Prihod danas
            </span>
            <b className="font-display text-lg font-bold tabular-nums">
              {live ? (
                <CountUp
                  from={BEFORE}
                  to={BEFORE + TOTAL}
                  start={700}
                  ms={900}
                />
              ) : (
                fmt(BEFORE)
              )}{" "}
              <span className="text-xs font-semibold text-muted-foreground">
                RSD
              </span>
            </b>
          </span>
          <motion.span
            key={live ? "3" : "2"}
            className="ml-auto rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[11px] font-bold"
            initial={{ scale: live ? 1.5 : 1 }}
            animate={{ scale: 1 }}
            transition={{ ...POP, delay: live ? 0.7 : 0 }}
          >
            {live ? 3 : 2} danas
          </motion.span>
        </div>
        <div className="grid gap-2">
          <AnimatePresence initial={false}>
            {live && (
              <motion.div
                key="new"
                initial={{ opacity: 0, height: 0, y: -14 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: 0.6, duration: 0.45, ease: EASE_OUT }}
              >
                <OrderRow
                  no={ORDER_NO}
                  what={`${ESPRESSO.name} ${ESPRESSO.size} × ${QTY}`}
                  who="Ana K."
                  sum={TOTAL}
                  kind="ig"
                  fresh
                />
              </motion.div>
            )}
          </AnimatePresence>
          <OrderRow
            no={ORDER_NO - 1}
            what={`${FILTER.name} ${FILTER.size} × 1`}
            who="Jovan P."
            sum={FILTER.now}
            kind="google"
          />
          <OrderRow
            no={ORDER_NO - 2}
            what={`${TURSKA.name} ${TURSKA.size} × 3`}
            who="Kafe Centar"
            sum={TURSKA.now * 3}
            kind="sajt"
          />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            {
              icon: Boxes,
              k: "Magacin",
              v: `${ESPRESSO.name} 24 → 22`,
              at: 1.3,
            },
            { icon: Bell, k: "Telegram", v: `🛒 Nova #${ORDER_NO}`, at: 1.6 },
          ].map(({ icon: Icon, k, v, at }) => (
            <motion.div
              key={k}
              className="flex items-center gap-2 rounded-xl px-2.5 py-2 ring-1 ring-inset ring-white/[0.08]"
              initial={false}
              animate={{ opacity: live ? 1 : 0.35 }}
              transition={{ delay: live ? at : 0, duration: 0.35 }}
            >
              <Icon size={15} className="flex-none text-primary" />
              <span className="min-w-0 leading-tight">
                <span className="block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {k}
                </span>
                <b className="block truncate text-[12.5px] font-bold">{v}</b>
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Isprekidana linija između telefona i sistema, i porudžbina koja preleti. */
function Wire({ live }: { live: boolean }) {
  return (
    <div className="relative mx-2 h-10">
      <span
        aria-hidden
        className="absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-white/15"
      />
      <AnimatePresence>
        {live && (
          <motion.span
            key="packet"
            aria-hidden
            className="absolute inset-0"
            initial={{ x: "-10%", opacity: 0 }}
            animate={{ x: "100%", opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.75,
              ease: "easeInOut",
              times: [0, 0.15, 0.85, 1],
            }}
          >
            <span className="absolute left-0 top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[10px] bg-primary text-primary-foreground shadow-[0_6px_16px_rgba(216,121,40,0.45)]">
              <ShoppingCart size={17} />
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Koraci i ceo prikaz                                                       */
/* ------------------------------------------------------------------------ */

function Rail({ step, pick }: { step: number; pick: (i: number) => void }) {
  return (
    <div>
      <div className="relative mx-auto flex max-w-[680px] items-start justify-between">
        <span
          aria-hidden
          className="absolute left-5 right-5 top-[18px] h-[2px] bg-white/10 md:top-[21px]"
        />
        <motion.span
          aria-hidden
          className="absolute left-5 right-5 top-[18px] h-[2px] origin-left bg-primary md:top-[21px]"
          animate={{ scaleX: step / (STEPS.length - 1) }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        />
        {STEPS.map((s, i) => {
          const on = i === step;
          const Icon = s.icon;
          return (
            <button
              key={s.title}
              type="button"
              onClick={() => pick(i)}
              aria-label={s.title}
              aria-current={on ? "step" : undefined}
              className="relative flex w-[20%] cursor-pointer flex-col items-center"
            >
              <span
                className={`grid size-9 place-items-center rounded-full transition-colors duration-300 md:size-[42px] ${
                  on
                    ? "bg-primary text-primary-foreground shadow-[0_0_0_4px_rgba(216,121,40,0.25)]"
                    : i < step
                      ? "bg-[#2a1a0e] text-primary ring-1 ring-inset ring-primary/40"
                      : "bg-[#151310] text-muted-foreground ring-1 ring-inset ring-white/10"
                }`}
              >
                <Icon size={16} />
              </span>
              <span
                className={`mt-2 hidden text-center text-[13px] leading-tight transition-colors duration-300 md:block ${
                  on
                    ? "font-bold text-foreground"
                    : "font-medium text-muted-foreground"
                }`}
              >
                {s.title}
              </span>
            </button>
          );
        })}
      </div>
      <div className="relative mt-2 h-[22px] overflow-hidden text-center md:hidden">
        <AnimatePresence initial={false}>
          <motion.b
            key={step}
            className="absolute inset-0 font-display text-[15px] font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <span
              className="mr-1.5 text-xs text-primary"
              style={{ fontFamily: MONO }}
            >
              {step + 1}/{STEPS.length}
            </span>
            {STEPS[step].title}
          </motion.b>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CustomerPath() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { amount: 0.35 });
  /* Na serveru ne znamo širinu, pa prikaz čeka prvi ulazak u ekran. */
  const [mode, setMode] = useState<"phone" | "wide" | null>(null);
  const [step, setStep] = useState(0);
  const [loop, setLoop] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setMode(mq.matches ? "phone" : "wide");
    if (active || mode) sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [active, mode]);

  useEffect(() => {
    if (!active || !mode) return;
    const t = setTimeout(() => {
      const next = (step + 1) % STEPS.length;
      if (next === 0) setLoop((l) => l + 1);
      setStep(next);
    }, STEPS[step].ms);
    return () => clearTimeout(t);
  }, [active, mode, step, loop]);

  const pick = (i: number) => {
    setStep(i);
    setLoop((l) => l + 1);
  };
  const live = step === STEPS.length - 1;

  return (
    <div ref={ref} style={{ "--ph": PHONE_H } as CSSProperties}>
      <Rail step={step} pick={pick} />
      <div className="mt-5 md:mt-8">
        {mode === "phone" ? (
          <div className="relative flex h-[var(--ph)] items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              {live ? (
                <motion.div
                  key="os"
                  className="w-full"
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                >
                  <Orders live />
                </motion.div>
              ) : (
                <motion.div
                  key={`phone-${loop}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: 30 }}
                  transition={{ duration: 0.35 }}
                >
                  <CustomerPhone step={step} loop={loop} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : mode === "wide" ? (
          <div className="grid grid-cols-[auto_minmax(60px,120px)_minmax(0,460px)] items-center justify-center">
            <CustomerPhone key={loop} step={step} loop={loop} />
            <Wire live={live} />
            <Orders live={live} />
          </div>
        ) : (
          <div className="h-[var(--ph)]" />
        )}
      </div>
    </div>
  );
}
