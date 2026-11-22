"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  MapPin,
  MessageCircle,
  Minus,
  MousePointerClick,
  Plus,
  PlusSquare,
  Search,
  Send,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import {
  EASE_OUT,
  Headline,
  MONO,
  POP_SPRING,
  RED,
  Slide,
  Visual,
  fmt,
  useIsPhone,
  useSlideActive,
} from "../primitives";
import { MiniLogo, PRODUCTS, off } from "../visuals";
import { LOCATION } from "./data";
import { Chrome, Phone } from "./os";

/* ------------------------------------------------------------------------
   One customer's way, after the services slide and before the ERP (Luka,
   2026-11-22): the ad pops up in the Instagram feed, a tap on its button,
   the site opens, a tap on "Poruči", and the order lands in Neto OS with
   the ad it came from. A phone plays the customer's side; on a wide
   screen the OS window sits beside it and the order flies across, on a
   phone the OS window takes the phone's place for the last step.

   The order, the handle and the numbers are invented, like the rest of
   the "primer" windows.
   ------------------------------------------------------------------------ */

const [MILK, , , , COFFEE, DETERGENT] = PRODUCTS;
const STORE = LOCATION.split("/").pop()!.trim();
const QTY = 2;
const TOTAL = COFFEE.now * QTY;
const IG_BLUE = "#0095F6";
const IG_GRAD = "linear-gradient(45deg, #F9CE34, #EE2A7B 50%, #6228D7)";
const GREEN = "#16A34A";

const STEPS = [
  { icon: Instagram, title: "Reklama na Instagramu", ms: 3400 },
  { icon: MousePointerClick, title: "Klik na dugme", ms: 1500 },
  { icon: Globe, title: "Otvara se sajt", ms: 2300 },
  { icon: ShoppingCart, title: "Poručuje", ms: 2100 },
  { icon: LayoutDashboard, title: "Stiže u Neto OS", ms: 4800 },
] as const;

/* A finger's tap: a soft dot that lands, and a ring that spreads. */
function Tap({ at = 0 }: { at?: number }) {
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

/* ------------------------------------------------------------------------ */
/* The feed                                                                  */
/* ------------------------------------------------------------------------ */

const STORIES = ["#F9CE34", "#EE2A7B", "#6228D7", "#F58529", "#DD2A7B"];
/* stories (5.6) + the post above the ad (28.7) */
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

function NetoAd({ tapped }: { tapped: boolean }) {
  return (
    <div>
      <div className="flex h-[3.2em] items-center gap-[0.6em] px-[0.9em]">
        <span
          className="grid h-[2.1em] w-[2.1em] place-items-center rounded-full text-[0.95em] font-black italic text-white"
          style={{
            background: RED,
            boxShadow: `0 0 0 0.15em #fff, 0 0 0 0.3em ${RED}`,
          }}
        >
          N
        </span>
        <span className="leading-[1.15]">
          <b className="block text-[1.05em]">neto</b>
          <span className="text-[0.85em] text-[#6B6B6B]">Sponzorisano</span>
        </span>
        <span className="ml-auto text-[1.3em] leading-none text-[#6B6B6B]">
          ···
        </span>
      </div>
      <div className="relative aspect-square w-full overflow-hidden bg-black">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/clients/neto/video_1.mp4"
          poster="/clients/neto/video_1.webp"
          autoPlay
          muted
          loop
          playsInline
        />
        <motion.span
          className="absolute left-[0.8em] top-[0.9em] rounded-[0.35em] px-[0.6em] py-[0.25em] text-[1.25em] font-black italic text-white shadow-[0_0.3em_0.8em_rgba(0,0,0,0.35)]"
          style={{ background: RED, rotate: -4 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...POP_SPRING, delay: 2.1 }}
        >
          Kafa −{off(COFFEE)}%
        </motion.span>
        <span className="absolute bottom-[0.8em] left-[0.8em]">
          <MiniLogo className="!px-[0.6em] !text-[1.1em]" />
        </span>
      </div>
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
          <NetoAd tapped={step >= 1} />
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
/* The site, opening inside Instagram                                         */
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
          <b className="block text-[1em]">Neto</b>
          <span
            className="flex items-center justify-center gap-[0.25em] text-[0.75em] text-[#6B6B6B]"
            style={{ fontFamily: MONO }}
          >
            <Lock className="h-[0.9em] w-[0.9em]" />
            vaš-sajt.rs
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
        style={{ background: RED }}
      >
        <b className="text-[1.3em] font-black italic text-white">Neto</b>
        <span className="relative text-white">
          <ShoppingCart className="h-[1.5em] w-[1.5em]" />
          <AnimatePresence>
            {ordered && (
              <motion.b
                className="absolute -right-[0.6em] -top-[0.6em] grid h-[1.3em] w-[1.3em] place-items-center rounded-full bg-white text-[0.75em]"
                style={{ color: RED }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...POP_SPRING, delay: 0.5 }}
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
          className="relative mt-[0.5em] rounded-[0.8em] p-[1em]"
          style={{ background: COFFEE.tint }}
        >
          <span className="mx-auto block h-[9em] w-[9em]">
            <COFFEE.Icon />
          </span>
          <span
            className="absolute right-[0.7em] top-[0.7em] rounded-[0.35em] px-[0.45em] py-[0.15em] text-[1.1em] font-black italic text-white"
            style={{ background: RED }}
          >
            −{off(COFFEE)}%
          </span>
        </div>
        <b className="mt-[0.7em] block text-[1.35em] font-extrabold leading-[1.15]">
          {COFFEE.name} {COFFEE.size}
        </b>
        <div className="mt-[0.3em] flex items-center justify-between">
          <span className="text-[1.15em]">
            <s className="text-[#8A8A8A]">{fmt(COFFEE.was)}</s>{" "}
            <b style={{ color: RED }}>{fmt(COFFEE.now)} RSD</b>
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
          animate={{ backgroundColor: ordered ? GREEN : RED }}
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
        <span className="mt-[0.6em] flex items-center justify-center gap-[0.3em] text-[0.85em] text-[#6B6B6B]">
          <MapPin className="h-[1em] w-[1em]" />
          Preuzimanje: {STORE}
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
                #1042 · vidimo se u prodavnici
              </span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CustomerPhone({ step, loop }: { step: number; loop: number }) {
  /* the step the phone opened on: jump straight to it, no replay */
  const [first] = useState(step);
  return (
    <Phone reserve="[--ph-r:290px] md:[--ph-r:330px] lg:[--ph-r:370px]">
      <div key={loop} className="absolute inset-0">
        <Feed step={step} skip={first >= 1} />
        {step >= 2 && <SiteSheet step={step} />}
      </div>
    </Phone>
  );
}

/* ------------------------------------------------------------------------ */
/* Neto OS: the order lands                                                  */
/* ------------------------------------------------------------------------ */

function Source({ kind }: { kind: "ig" | "google" | "sajt" }) {
  const look =
    kind === "ig"
      ? { bg: IG_GRAD, fg: "#fff", label: "Instagram oglas" }
      : kind === "google"
        ? { bg: "#E8F0FE", fg: "#1A73E8", label: "Google oglas" }
        : { bg: "#F2F0EA", fg: "#6B6B6B", label: "Sajt" };
  return (
    <span
      className="inline-flex flex-none items-center gap-1 rounded-full px-2 py-[2px] text-[10px] font-bold md:text-[11px]"
      style={{ background: look.bg, color: look.fg }}
    >
      {kind === "ig" && <Instagram size={11} />}
      {look.label}
    </span>
  );
}

function OrderRow({
  no,
  what,
  sum,
  kind,
  fresh = false,
}: {
  no: number;
  what: string;
  sum: number;
  kind: "ig" | "google" | "sajt";
  fresh?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 md:px-3 md:py-2.5"
      style={{
        background: fresh ? "rgba(226,35,26,0.07)" : "#F7F6F2",
        boxShadow: fresh ? `inset 3px 0 0 ${RED}` : "none",
      }}
    >
      <span className="min-w-0 flex-1 leading-[1.25]">
        <span className="flex items-center gap-1.5">
          <span
            className="text-[11px] font-semibold text-[#6B6B6B] md:text-[12px]"
            style={{ fontFamily: MONO }}
          >
            #{no}
          </span>
          {fresh && (
            <span
              className="rounded-full px-1.5 text-[9.5px] font-semibold tracking-[0.1em] text-white"
              style={{ background: RED, fontFamily: MONO }}
            >
              NOVO
            </span>
          )}
        </span>
        <b className="block truncate text-[13px] font-extrabold md:text-[14.5px]">
          {what}
        </b>
        <span className="mt-0.5 flex items-center gap-1.5">
          <span className="text-[11.5px] text-[#6B6B6B] md:text-[12.5px]">
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
    <Chrome title="Neto OS · porudžbine · primer">
      <div className="p-3 md:p-4">
        <div className="mb-2 flex items-center gap-2 md:mb-3">
          <span
            className="grid h-7 w-7 flex-none place-items-center rounded-[7px] text-white"
            style={{ background: RED }}
          >
            <ShoppingCart size={14} />
          </span>
          <b className="text-[15px] font-extrabold md:text-[16px]">
            Porudžbine · danas
          </b>
          <motion.span
            key={live ? "3" : "2"}
            className="ml-auto rounded-full bg-[#111] px-2 py-[2px] text-[11px] font-bold text-white"
            initial={{ scale: live ? 1.5 : 1 }}
            animate={{ scale: 1 }}
            transition={{ ...POP_SPRING, delay: live ? 0.7 : 0 }}
          >
            {live ? 3 : 2}
          </motion.span>
        </div>
        <div className="grid gap-1.5 md:gap-2">
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
                  no={1042}
                  what={`${COFFEE.name} × ${QTY} · ${STORE}`}
                  sum={TOTAL}
                  kind="ig"
                  fresh
                />
              </motion.div>
            )}
          </AnimatePresence>
          <OrderRow
            no={1041}
            what={`${MILK.name} × 3`}
            sum={MILK.now * 3}
            kind="google"
          />
          <OrderRow
            no={1040}
            what={`${DETERGENT.name} × 1`}
            sum={DETERGENT.now}
            kind="sajt"
          />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5 md:mt-3 md:gap-2">
          {[
            { icon: Boxes, k: "Magacin", v: "Kafa 18 → 16", at: 1.3 },
            { icon: Bell, k: "Telegram", v: "🛒 Nova #1042", at: 1.6 },
          ].map(({ icon: Icon, k, v, at }) => (
            <motion.div
              key={k}
              className="flex items-center gap-2 rounded-[10px] border border-[#E4E2DC] px-2.5 py-2"
              initial={false}
              animate={live ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 0 }}
              transition={{ delay: live ? at : 0, duration: 0.35 }}
            >
              <Icon size={15} className="flex-none" style={{ color: RED }} />
              <span className="min-w-0 leading-[1.2]">
                <span
                  className="block text-[9.5px] uppercase tracking-[0.12em] text-[#6B6B6B] md:text-[10.5px]"
                  style={{ fontFamily: MONO }}
                >
                  {k}
                </span>
                <b className="block truncate text-[12px] font-extrabold md:text-[13px]">
                  {v}
                </b>
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </Chrome>
  );
}

/* The dashed wire between the phone and the OS, and the order riding it. */
function Wire({ live }: { live: boolean }) {
  return (
    <div className="relative mx-2 h-10">
      <span
        aria-hidden
        className="absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-[#C9C5BB]"
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
            <span
              className="absolute left-0 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[10px] text-white shadow-[0_6px_16px_rgba(226,35,26,0.4)]"
              style={{ background: RED }}
            >
              <ShoppingCart size={17} />
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* The slide                                                                 */
/* ------------------------------------------------------------------------ */

function Rail({ step, pick }: { step: number; pick: (i: number) => void }) {
  return (
    <div>
      <div className="relative mx-auto flex max-w-[640px] items-start justify-between">
        <span
          aria-hidden
          className="absolute left-5 right-5 top-[18px] h-[2px] bg-[#E4E2DC] md:top-[21px]"
        />
        <motion.span
          aria-hidden
          className="absolute left-5 right-5 top-[18px] h-[2px] origin-left md:top-[21px]"
          style={{ background: RED }}
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
                className="grid h-9 w-9 place-items-center rounded-full transition-colors duration-300 md:h-[42px] md:w-[42px]"
                style={{
                  background: on ? RED : i < step ? "#FBE3E1" : "#fff",
                  color: on ? "#fff" : i < step ? RED : "#8A8A8A",
                  border: `2px solid ${on || i < step ? RED : "#E4E2DC"}`,
                  boxShadow: on ? "0 0 0 4px rgba(226,35,26,0.18)" : "none",
                }}
              >
                <Icon size={16} />
              </span>
              <span
                className="mt-1.5 hidden text-center text-[13px] leading-[1.2] transition-colors duration-300 md:block"
                style={{
                  color: on ? "#000" : "#8A8A8A",
                  fontWeight: on ? 800 : 600,
                }}
              >
                {s.title}
              </span>
            </button>
          );
        })}
      </div>
      <div className="relative mt-1.5 h-[22px] overflow-hidden text-center md:hidden">
        <AnimatePresence initial={false}>
          <motion.b
            key={step}
            className="absolute inset-0 text-[15px] font-extrabold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <span
              className="mr-1.5 text-[12px]"
              style={{ color: RED, fontFamily: MONO }}
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

export function CustomerPath() {
  const active = useSlideActive();
  const phone = useIsPhone();
  const [step, setStep] = useState(0);
  const [loop, setLoop] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      const next = (step + 1) % STEPS.length;
      if (next === 0) setLoop((l) => l + 1);
      setStep(next);
    }, STEPS[step].ms);
    return () => clearTimeout(t);
  }, [active, step, loop]);

  const pick = (i: number) => {
    setStep(i);
    setLoop((l) => l + 1);
  };
  const live = step === STEPS.length - 1;

  let visual: ReactNode;
  if (phone)
    visual = (
      <div className="relative flex min-h-[320px] items-center justify-center">
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
    );
  else
    visual = (
      <div className="grid grid-cols-[auto_minmax(60px,120px)_minmax(0,460px)] items-center justify-center">
        <CustomerPhone key={loop} step={step} loop={loop} />
        <Wire live={live} />
        <Orders live={live} />
      </div>
    );

  return (
    <div>
      <Rail step={step} pick={pick} />
      <div className="mt-3 md:mt-6">{visual}</div>
    </div>
  );
}

export function CustomerPathSlide() {
  return (
    <Slide id="put-kupca" theme="paper">
      <Headline size="xl" center>
        Od oglasa [[do vašeg sistema.]]
      </Headline>
      <Visual className="!mt-4 md:!mt-6">
        <CustomerPath />
      </Visual>
    </Slide>
  );
}
