"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BadgePercent,
  Bell,
  Boxes,
  Check,
  Lock,
  MapPin,
  ReceiptText,
  Send,
  Store,
  Users,
} from "lucide-react";
import {
  Count,
  DISPLAY,
  EASE_OUT,
  Headline,
  MONO,
  POP_SPRING,
  RED,
  Slide,
  Visual,
  fmt,
  item,
  pop,
  useSlideActive,
} from "../primitives";
import { PRODUCTS, off } from "../visuals";
import { LOCATION } from "./data";

/* ------------------------------------------------------------------------
   Neto OS, the company's own operating system (ERP). Luka, 2026-11-22:
   "želim više o ERP tj operativnom sistemu", in the price, with four
   modules up front: stores and tasks, stock and orders, invoices /
   contracts / finances, promotions and customers. The knowledge base has
   its own slide, and so do the Telegram alerts.

   Everything inside the windows is an invented example (the windows say
   "primer"): workers, suppliers, amounts, stock levels.
   ------------------------------------------------------------------------ */

const STORE = LOCATION.split("/").pop()!.trim(); /* "Fruškogorska" */
const [MILK, BREAD, , , COFFEE, DETERGENT] = PRODUCTS;

const GREEN = "#16A34A";
const AMBER = "#D97706";
const INK = "#111";
const SOFT = "#F2F0EA";

/* ------------------------------------------------------------------------ */
/* Small parts                                                               */
/* ------------------------------------------------------------------------ */

function Tag({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span
      className="flex-none rounded-full px-2 py-[2px] text-[9.5px] font-semibold uppercase tracking-[0.08em] md:text-[10.5px]"
      style={{ fontFamily: MONO, color, background: `${color}1A` }}
    >
      {children}
    </span>
  );
}

function Head({
  icon: Icon,
  title,
  right,
}: {
  icon: React.ElementType;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center gap-2 md:mb-3">
      <span
        className="grid h-6 w-6 flex-none place-items-center rounded-[7px] text-white md:h-7 md:w-7"
        style={{ background: RED }}
      >
        <Icon size={14} />
      </span>
      <b className="text-[14px] font-extrabold md:text-[16px]">{title}</b>
      <span className="ml-auto">{right}</span>
    </div>
  );
}

/* A product's drawing from the first deck, at a set size. */
function ProductArt({
  p,
  size = 26,
}: {
  p: (typeof PRODUCTS)[number];
  size?: number;
}) {
  return (
    <span
      className="grid flex-none place-items-center rounded-[7px]"
      style={{ width: size, height: size, background: p.tint }}
    >
      <span
        className="block"
        style={{ width: size * 0.78, height: size * 0.78 }}
      >
        <p.Icon />
      </span>
    </span>
  );
}

/* Something that happens a moment after the screen opens: a task gets
   ticked, an order goes out. */
function useLater(ms: number) {
  const active = useSlideActive();
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) return;
    if (reduce) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setDone(true), ms);
    return () => clearTimeout(t);
  }, [active, reduce, ms]);
  return done;
}

/* ------------------------------------------------------------------------ */
/* 1. Stores and tasks                                                       */
/* ------------------------------------------------------------------------ */

const TASKS: [string, string][] = [
  ["Popuniti raf sa kafom", "Ana"],
  ["Prijem robe u 10:00", "Marko"],
  ["Nove cene za akciju", "Ana"],
];

function Stores() {
  const ticked = useLater(1300);
  return (
    <div>
      <Head
        icon={Store}
        title={STORE}
        right={<Tag color={GREEN}>Otvoreno 07:02</Tag>}
      />
      <div className="rounded-[10px] px-3 py-2.5" style={{ background: SOFT }}>
        <div className="flex items-center justify-between text-[12px] font-bold md:text-[13.5px]">
          <span>Checklista otvaranja</span>
          <span style={{ fontFamily: MONO }}>12/12</span>
        </div>
        <div className="mt-1.5 h-[6px] overflow-hidden rounded-full bg-[#DDD9CF]">
          <motion.i
            className="block h-full w-full origin-left rounded-full"
            style={{ background: GREEN }}
            initial={{ scaleX: 0.6 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE_OUT }}
          />
        </div>
      </div>
      <ul className="mt-2 grid gap-1 md:mt-3 md:gap-1.5">
        {TASKS.map(([task, who], i) => {
          const done = i === 0 || (i === 1 && ticked);
          return (
            <li
              key={task}
              className="flex items-center gap-2 text-[12.5px] font-bold md:text-[14px]"
            >
              <motion.span
                className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full border-2"
                animate={{
                  backgroundColor: done ? GREEN : "#fff",
                  borderColor: done ? GREEN : "#C9C5BB",
                  scale: i === 1 && ticked ? [1, 1.25, 1] : 1,
                }}
                transition={{ duration: 0.35 }}
              >
                {done && <Check size={11} strokeWidth={3.4} color="#fff" />}
              </motion.span>
              <span
                className="min-w-0 flex-1 truncate"
                style={{ color: done ? "#8A8A8A" : INK }}
              >
                {task}
              </span>
              <span
                className="flex-none text-[11px] text-[#6B6B6B] md:text-[12px]"
                style={{ fontFamily: MONO }}
              >
                {who}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-[#6B6B6B] md:mt-3 md:text-[12.5px]">
        <Users size={13} className="flex-none" />
        Smena: Ana, Marko · 07–15h
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* 2. Stock and orders                                                       */
/* ------------------------------------------------------------------------ */

const STOCK: { p: (typeof PRODUCTS)[number]; have: number; min: number }[] = [
  { p: MILK, have: 12, min: 30 },
  { p: BREAD, have: 40, min: 25 },
  { p: COFFEE, have: 18, min: 20 },
  { p: DETERGENT, have: 55, min: 15 },
];

function Stock() {
  const sent = useLater(1500);
  return (
    <div>
      <Head
        icon={Boxes}
        title="Zalihe"
        right={<Tag color="#6B6B6B">{STORE}</Tag>}
      />
      <ul className="grid gap-1.5 md:gap-2">
        {STOCK.map(({ p, have, min }, i) => {
          const low = have < min;
          const tight = low && have >= min * 0.8;
          const color = !low ? GREEN : tight ? AMBER : RED;
          return (
            <li key={p.name} className="flex items-center gap-2">
              <ProductArt p={p} size={24} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2 text-[12px] font-bold leading-none md:text-[13.5px]">
                  <span className="truncate">{p.name}</span>
                  <span
                    className="flex-none text-[10.5px] md:text-[11.5px]"
                    style={{ fontFamily: MONO, color }}
                  >
                    {have}/{min}
                  </span>
                </span>
                <span className="mt-1 block h-[5px] overflow-hidden rounded-full bg-[#ECE9E1]">
                  <motion.i
                    className="block h-full w-full origin-left rounded-full"
                    style={{ background: color }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: Math.min(1, have / (min * 2)) }}
                    transition={{
                      duration: 0.7,
                      delay: 0.1 + i * 0.07,
                      ease: EASE_OUT,
                    }}
                  />
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <div
        className="mt-2.5 flex items-center gap-2 rounded-[10px] px-3 py-2 md:mt-3.5"
        style={{ background: SOFT }}
      >
        <span className="min-w-0 flex-1 text-[11.5px] leading-[1.25] md:text-[13px]">
          <b className="block font-extrabold">Narudžbina · Mlekara</b>
          <span className="text-[#6B6B6B]">
            {MILK.name} {MILK.size} × 48
          </span>
        </span>
        <motion.span
          className="inline-flex flex-none items-center gap-1 rounded-full px-2.5 py-1.5 text-[11.5px] font-extrabold text-white md:text-[12.5px]"
          animate={{ backgroundColor: sent ? GREEN : INK }}
          transition={{ duration: 0.3 }}
        >
          {sent ? <Check size={12} strokeWidth={3} /> : <Send size={12} />}
          {sent ? "Poslato" : "Pošalji"}
        </motion.span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* 3. Invoices, contracts, finances                                          */
/* ------------------------------------------------------------------------ */

const BILLS: [string, string, string, string][] = [
  ["Mlekara", "184.500 RSD", "Sutra", AMBER],
  ["Pekara", "62.300 RSD", "Plaćeno", GREEN],
  ["Ugovor · Dobavljač kafe", "", "Ističe 30.11.", RED],
];

function Bills() {
  return (
    <div>
      <Head
        icon={ReceiptText}
        title="Novembar"
        right={<Tag color={GREEN}>Plaćeno 78%</Tag>}
      />
      <div className="rounded-[10px] px-3 py-2.5" style={{ background: SOFT }}>
        <span
          className="block text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] md:text-[11px]"
          style={{ fontFamily: MONO }}
        >
          Ulazne fakture
        </span>
        <b className="block text-[22px] font-black italic leading-[1.1] md:text-[26px]">
          <Count to={2184000} duration={1.1} delay={0.1} />{" "}
          <span className="text-[13px] not-italic text-[#6B6B6B]">RSD</span>
        </b>
        <div className="mt-1.5 h-[6px] overflow-hidden rounded-full bg-[#DDD9CF]">
          <motion.i
            className="block h-full w-full origin-left rounded-full"
            style={{ background: GREEN }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 0.78 }}
            transition={{ duration: 1, delay: 0.2, ease: EASE_OUT }}
          />
        </div>
      </div>
      <ul className="mt-2 grid gap-1 md:mt-3 md:gap-1.5">
        {BILLS.map(([who, amount, when, color], i) => (
          <motion.li
            key={who}
            className="flex items-center gap-2 text-[12.5px] font-bold md:text-[14px]"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.12, duration: 0.35 }}
          >
            <span className="min-w-0 flex-1 truncate">{who}</span>
            {amount && (
              <span
                className="flex-none text-[11px] text-[#6B6B6B] md:text-[12px]"
                style={{ fontFamily: MONO }}
              >
                {amount}
              </span>
            )}
            <Tag color={color}>{when}</Tag>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* 4. Promotions and customers                                               */
/* ------------------------------------------------------------------------ */

function Promo() {
  const live = useLater(1400);
  return (
    <div>
      <Head
        icon={BadgePercent}
        title="Nova akcija"
        right={<Tag color="#6B6B6B">Sve prodavnice</Tag>}
      />
      <div
        className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5"
        style={{ background: SOFT }}
      >
        <ProductArt p={COFFEE} size={36} />
        <span className="min-w-0 flex-1 leading-[1.2]">
          <b className="block truncate text-[13px] font-extrabold md:text-[14.5px]">
            {COFFEE.name} {COFFEE.size}
          </b>
          <span className="text-[11.5px] md:text-[12.5px]">
            <s className="text-[#8A8A8A]">{fmt(COFFEE.was)}</s>{" "}
            <b style={{ color: RED }}>{fmt(COFFEE.now)} RSD</b>
          </span>
        </span>
        <span
          className="flex-none rounded-[6px] px-1.5 py-1 text-[13px] font-black italic text-white"
          style={{ background: RED }}
        >
          −{off(COFFEE)}%
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 md:mt-3">
        <motion.span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11.5px] font-extrabold text-white md:text-[12.5px]"
          animate={{ backgroundColor: live ? GREEN : INK }}
          transition={{ duration: 0.3 }}
        >
          {live ? <Check size={12} strokeWidth={3} /> : <Send size={12} />}
          {live ? "U aplikaciji" : "Objavi u aplikaciji"}
        </motion.span>
      </div>
      {/* the push the customers get */}
      <motion.div
        className="mt-2 flex items-center gap-2 rounded-[12px] border border-[#E4E2DC] bg-white px-2.5 py-2 shadow-[0_6px_18px_rgba(0,0,0,0.08)] md:mt-3"
        initial={false}
        animate={live ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={POP_SPRING}
      >
        <span
          className="grid h-7 w-7 flex-none place-items-center rounded-[8px] text-[11px] font-black italic text-white"
          style={{ background: RED }}
        >
          N
        </span>
        <span className="min-w-0 flex-1 text-[11.5px] leading-[1.25] md:text-[12.5px]">
          <b className="block">Neto</b>
          <span className="block truncate text-[#6B6B6B]">
            {COFFEE.name} −{off(COFFEE)}% ove nedelje
          </span>
        </span>
        <span className="flex-none text-right text-[10.5px] leading-[1.2] text-[#6B6B6B] md:text-[11.5px]">
          <Users size={11} className="mb-0.5 ml-auto" />
          {live ? <Count to={1240} duration={0.9} /> : "0"}
        </span>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* The window                                                                */
/* ------------------------------------------------------------------------ */

const MODULES = [
  { icon: Store, label: "Prodavnice", Screen: Stores },
  { icon: Boxes, label: "Magacin", Screen: Stock },
  { icon: ReceiptText, label: "Fakture", Screen: Bills },
  { icon: BadgePercent, label: "Akcije", Screen: Promo },
] as const;

const BEAT = 3600;

/* The white "Neto OS · primer" window, shared with the customer path. */
export function Chrome({
  children,
  title = "Neto OS · primer",
  className = "",
}: {
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full overflow-hidden bg-white text-[#111] ${className}`}
      style={{
        border: "2px solid #000",
        borderRadius: "10px 30px 10px 10px",
        fontFamily: DISPLAY,
      }}
    >
      <div className="flex items-center gap-2 border-b border-[#E4E2DC] px-3.5 py-2">
        <span className="flex gap-1">
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <i
              key={c}
              className="block h-2.5 w-2.5 rounded-full"
              style={{ background: c }}
            />
          ))}
        </span>
        <span
          className="mx-auto flex items-center gap-1.5 text-[11px] text-[#6B6B6B]"
          style={{ fontFamily: MONO }}
        >
          <Lock size={11} />
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

export function OsWindow() {
  const active = useSlideActive();
  const [at, setAt] = useState(0);
  /* bumped on a tap, so the timer starts over from the chosen module */
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setAt((a) => (a + 1) % MODULES.length), BEAT);
    return () => clearTimeout(t);
  }, [active, at, run]);

  const { Screen } = MODULES[at];

  return (
    <Chrome className="max-w-[900px]">
      <div className="md:grid md:grid-cols-[176px_minmax(0,1fr)]">
        {/* modules: tabs on a phone, a rail on a wide screen */}
        <nav className="grid grid-cols-4 gap-1 border-b border-[#E4E2DC] p-1.5 md:grid-cols-1 md:content-start md:gap-1 md:border-b-0 md:border-r md:p-2.5">
          {MODULES.map(({ icon: Icon, label }, i) => {
            const on = i === at;
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setAt(i);
                  setRun((r) => r + 1);
                }}
                aria-pressed={on}
                className="relative flex cursor-pointer flex-col items-center gap-1 overflow-hidden rounded-[8px] px-1 py-1.5 text-[11px] font-extrabold transition-colors duration-300 md:flex-row md:gap-2.5 md:px-2.5 md:py-2.5 md:text-[14px]"
                style={{
                  background: on ? "rgba(226,35,26,0.1)" : "transparent",
                  color: on ? RED : "#6B6B6B",
                }}
              >
                <Icon size={17} className="flex-none" />
                {label}
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
            );
          })}
        </nav>
        <div className="relative h-[248px] overflow-hidden md:h-[292px]">
          <AnimatePresence initial={false}>
            <motion.div
              key={at}
              className="absolute inset-0 p-3 md:p-5"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
            >
              <Screen />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Chrome>
  );
}

export function NetoOs() {
  return (
    <Slide id="os" theme="dark">
      <Headline size="xl">Ceo Neto. [[Jedan sistem.]]</Headline>
      <Visual className="!mt-4 md:!mt-8">
        <OsWindow />
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* Alerts on the phone                                                       */
/* ------------------------------------------------------------------------ */

/* The OS writes to a Telegram chat, the way Skeylo's own does: a morning
   rundown, what happened, what needs a yes. The messages come in one by
   one; the order gets its ✅ a moment after it lands. */
type Msg = { at: string; text: string; ask?: boolean };

const MSGS: Msg[] = [
  {
    at: "07:00",
    text: "☀️ Dobro jutro! Danas: 2 isporuke, 1 faktura dospeva, počinje akcija na kafu.",
  },
  { at: "07:02", text: `✅ ${STORE} otvorena. Checklista 12/12.` },
  {
    at: "09:14",
    text: `📦 ${MILK.name} ispod minimuma (12/30). Narudžbina za Mlekaru je spremna.`,
    ask: true,
  },
  { at: "10:00", text: "🧾 Mlekara: 184.500 RSD dospeva sutra." },
  { at: "11:30", text: `🏷️ ${COFFEE.name} −${off(COFFEE)}% je u aplikaciji.` },
];

const MSG_AT = 0.6;
const MSG_EVERY = 0.85;
const OK_AT = MSG_AT + MSG_EVERY * MSGS.length + 0.5;

const TG = {
  bg: "#0E1621",
  bar: "#17212B",
  bubble: "#182533",
  button: "#2B5278",
  muted: "#7F91A4",
};

function Chat() {
  const active = useSlideActive();
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!active) return;
    if (reduce) {
      setShown(MSGS.length);
      setOk(true);
      return;
    }
    const ts = MSGS.map((_, i) =>
      setTimeout(() => setShown(i + 1), (MSG_AT + i * MSG_EVERY) * 1000),
    );
    ts.push(setTimeout(() => setOk(true), OK_AT * 1000));
    return () => ts.forEach(clearTimeout);
  }, [active, reduce]);

  return (
    <div
      className="flex h-full flex-col"
      style={{ background: TG.bg, color: "#fff" }}
    >
      <div
        className="flex items-center gap-[0.7em] px-[1em] pb-[0.7em] pt-[2.9em]"
        style={{ background: TG.bar }}
      >
        <span
          className="grid h-[2.6em] w-[2.6em] flex-none place-items-center rounded-full text-[1.1em] font-black italic"
          style={{ background: RED }}
        >
          N
        </span>
        <span className="leading-[1.2]">
          <b className="block text-[1.2em]">Neto OS</b>
          <span className="text-[0.95em]" style={{ color: TG.muted }}>
            bot
          </span>
        </span>
        <Bell
          className="ml-auto h-[1.3em] w-[1.3em]"
          style={{ color: TG.muted }}
        />
      </div>
      {/* newest at the bottom, the old ones scroll off the top */}
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-[0.55em] overflow-hidden px-[0.8em] pb-[1em]">
        {MSGS.slice(0, shown).map((m) => (
          <motion.div
            key={m.at}
            layout="position"
            className="max-w-[88%]"
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            style={{ transformOrigin: "left bottom" }}
          >
            <div
              className="flow-root rounded-[1em] rounded-bl-[0.3em] px-[0.85em] py-[0.6em] text-[1.18em] leading-[1.35]"
              style={{ background: TG.bubble }}
            >
              {m.text}
              {m.ask && ok && (
                <motion.b
                  className="mt-[0.35em] block font-bold"
                  style={{ color: "#5FD38A" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ✓ Poslato Mlekari
                </motion.b>
              )}
              <span
                className="float-right ml-[0.6em] mt-[0.45em] text-[0.75em]"
                style={{ color: TG.muted }}
              >
                {m.at}
              </span>
            </div>
            {m.ask && !ok && (
              <div className="mt-[0.3em] grid grid-cols-2 gap-[0.3em]">
                {["✅ Pošalji", "⏰ Kasnije"].map((b) => (
                  <span
                    key={b}
                    className="rounded-[0.6em] py-[0.5em] text-center text-[1.05em] font-bold"
                    style={{ background: TG.button }}
                  >
                    {b}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* The same em-sized phone as the QR journey: the height comes from the
   screen, the font size from the height. `reserve` sets --ph-r, the room
   the rest of the slide needs. */
export function Phone({
  children,
  reserve = "[--ph-r:250px] md:[--ph-r:300px] lg:[--ph-r:230px]",
}: {
  children: ReactNode;
  reserve?: string;
}) {
  return (
    <div
      aria-hidden
      className={`relative mx-auto flex-none select-none ${reserve}`}
      style={
        {
          "--ph": "clamp(320px, calc(100svh - var(--ph-r)), 600px)",
          height: "var(--ph)",
          width: "calc(var(--ph) * 0.49)",
          fontSize: "calc(var(--ph) / 44)",
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

export function OsAlerts() {
  return (
    <Slide id="os-telefon" theme="dark" fit={false} className="!py-4 lg:!py-8">
      <div className="grid items-center gap-4 lg:grid-cols-2 lg:gap-10">
        <div className="text-center lg:text-left">
          <Headline size="xl">Sve bitno. [[Na vaš telefon.]]</Headline>
        </div>
        <motion.div variants={pop} custom={2}>
          <Phone>
            <Chat />
          </Phone>
        </motion.div>
      </div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* Proof: the same system already runs Infinity Laser Studio                 */
/* ------------------------------------------------------------------------ */

/* The Ciklon deck's proof and screenshot: Infinity's control center, two
   locations in one system, client names blurred. The figure follows the
   site's SocialProof (±3.900.000 RSD u mesecu, Luka's update 2026-11-22). */
const INFINITY_MONTH = 3900000;

function Laptop({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[640px]">
      <div
        className="rounded-t-[14px] p-[2.2%] pb-[1.6%]"
        style={{ background: "#1b1b1d", boxShadow: "0 0 0 1.5px #8d8d92" }}
      >
        <div className="overflow-hidden rounded-[4px] bg-black">{children}</div>
      </div>
      <div
        className="relative mx-[-5%] h-[12px] rounded-b-[14px] md:h-[16px]"
        style={{ background: "linear-gradient(#d4d4d8, #9a9aa0)" }}
      >
        <span className="absolute left-1/2 top-0 h-[5px] w-[16%] -translate-x-1/2 rounded-b-[6px] bg-[#8a8a90]" />
      </div>
    </div>
  );
}

export function OsProof() {
  return (
    <Slide id="os-dokaz" theme="paper">
      <div className="grid items-center gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        <div>
          <Headline size="xl">Isti sistem. [[Već radi.]]</Headline>
          <motion.div variants={item} className="mt-3 md:mt-6">
            <p className="flex items-center gap-1.5 text-[14px] font-bold md:text-[17px]">
              Infinity Laser Studio
            </p>
            <p className="mt-1 text-[clamp(2.4rem,9vw,4.4rem)] font-black italic leading-none tracking-[-0.02em]">
              <Count
                to={INFINITY_MONTH}
                prefix="±"
                duration={1.6}
                delay={0.3}
              />
            </p>
            <p
              className="mt-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B] md:text-[12.5px]"
              style={{ fontFamily: MONO }}
            >
              <MapPin size={13} className="flex-none" style={{ color: RED }} />
              RSD u mesecu · Novi Sad + Sombor
            </p>
          </motion.div>
        </div>
        <motion.div variants={pop} custom={1.5}>
          <Laptop>
            <div className="relative" style={{ aspectRatio: "1205 / 760" }}>
              <Image
                src="/clients/neto/infinity-os.webp"
                alt="Infinity Laser Studio, kontrolni centar"
                fill
                sizes="(min-width: 1024px) 640px, 92vw"
                className="object-cover object-top"
              />
            </div>
          </Laptop>
          <p
            className="mt-3 text-center text-[10.5px] uppercase tracking-[0.12em] text-[#8A8A8A] md:text-[11.5px]"
            style={{ fontFamily: MONO }}
          >
            Pravi ekran · imena zamućena
          </p>
        </motion.div>
      </div>
    </Slide>
  );
}
