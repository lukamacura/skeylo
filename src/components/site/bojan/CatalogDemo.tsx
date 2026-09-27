"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  ChevronRight,
  Clapperboard,
  Heart,
  Home,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  ShoppingCart,
  SquarePlus,
} from "lucide-react";
import {
  DISPLAY,
  EASE_OUT,
  MONO,
  MUTED,
  POP_SPRING,
  RED,
  fmt,
  useSlideActive,
} from "./primitives";
import { PhoneFrame } from "./DemoStage";
import {
  Bread,
  Coffee,
  Eggs,
  Milk,
  MiniLogo,
  PRODUCTS,
  Pin,
  ProductCard,
} from "./visuals";

/* The Interaktivni Katalog, from ad to till code, as a clickable phone.
   Five screens live in the same frame; the active one slides in from the
   right and the one it replaces slips out to the left. The phone is the
   same iPhone the app demo sits in. */

/* Instagram's own colours and its wordmark face. */
const IG_BLUE = "#0095F6";
const IG_LINE = "#DBDBDB";
const IG_MUTED = "#737373";
const IG_SCRIPT =
  "var(--font-ig), 'Grand Hotel', 'Snell Roundhand', 'Brush Script MT', cursive";

const STORES: [string, string][] = [
  ["Bulevar oslobođenja 2", "650 m od tebe"],
  ["Preradovićeva 110, Petrovaradin", "u tvom kraju"],
  ["Cara Lazara 33, Futog", "u tvom kraju"],
  ["Svetosavska 7, Kać", "u tvom kraju"],
];
const TOWNS = ["Novi Sad", "Petrovaradin", "Futog", "Kać"];
const CODE = "NETOTAJNA12";

export default function CatalogDemo() {
  const [screen, setScreen] = useState(0);
  const [store, setStore] = useState(0);
  const [sel, setSel] = useState<Set<number>>(() => new Set());

  const totals = useMemo(() => {
    let t = 0;
    let sv = 0;
    sel.forEach((i) => {
      t += PRODUCTS[i].now;
      sv += PRODUCTS[i].was - PRODUCTS[i].now;
    });
    return { t, sv, n: sel.size, extra: t * 0.02 };
  }, [sel]);

  const toggle = (i: number) =>
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const restart = () => {
    setSel(new Set());
    setStore(0);
    setScreen(0);
  };

  return (
    <PhoneFrame
      homeBar="dark"
      captionColor={MUTED}
      caption="Dodirnite oglas i prođite put kupca. Cene su izmišljene; pravi katalog se puni vašim akcijama svake nedelje."
    >
      <div
        className="absolute inset-0 text-[15px] text-[#1A1A1A]"
        style={{ background: "#F3F2EE" }}
        aria-live="polite"
      >
        <Scr on={screen === 0} dir={screen > 0 ? -1 : 1} flush>
          <AdScreen onGo={() => setScreen(1)} />
        </Scr>
        <Scr on={screen === 1} dir={screen > 1 ? -1 : 1}>
          <PermScreen
            onAllow={() => {
              setStore(0);
              setScreen(3);
            }}
            onDeny={() => setScreen(2)}
          />
        </Scr>
        <Scr on={screen === 2} dir={screen > 2 ? -1 : 1}>
          <TownScreen
            onPick={(i) => {
              setStore(i);
              setScreen(3);
            }}
          />
        </Scr>
        <Scr on={screen === 3} dir={screen > 3 ? -1 : 1}>
          <CatalogScreen
            store={store}
            sel={sel}
            totals={totals}
            onToggle={toggle}
            onCode={() => setScreen(4)}
          />
        </Scr>
        <Scr on={screen === 4} dir={1}>
          <TicketScreen store={store} totals={totals} onRestart={restart} />
        </Scr>
      </div>
    </PhoneFrame>
  );
}

/* Screens clear the status bar at the top and the home indicator at the
   bottom. A flush screen draws edge to edge and handles both itself. */
function Scr({
  on,
  dir,
  flush = false,
  children,
}: {
  on: boolean;
  dir: number;
  flush?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={`absolute inset-0 flex flex-col ${flush ? "" : "px-[14px] pb-[34px] pt-[58px]"}`}
      initial={false}
      animate={{ opacity: on ? 1 : 0, x: on ? 0 : dir * 34 }}
      transition={{
        opacity: { duration: 0.3 },
        x: { duration: 0.45, ease: EASE_OUT },
      }}
      style={{ pointerEvents: on ? "auto" : "none" }}
      aria-hidden={!on}
    >
      {children}
    </motion.div>
  );
}

/* Buttons in the demo: red, the Neto corner, a squeeze on tap. */
export function DBtn({
  children,
  onClick,
  ghost = false,
  sm = false,
  disabled = false,
  className = "",
  style = {},
}: {
  children: ReactNode;
  onClick?: () => void;
  ghost?: boolean;
  sm?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`cursor-pointer font-bold disabled:cursor-default disabled:opacity-35 ${sm ? "w-auto whitespace-nowrap px-3 py-[11px] text-[14px]" : "w-full px-4 py-[14px] text-[16px]"} ${className}`}
      style={{
        background: ghost ? "transparent" : RED,
        color: ghost ? "#000" : "#fff",
        boxShadow: ghost ? "inset 0 0 0 2px #000" : undefined,
        borderRadius: "6px 18px 6px 6px",
        fontFamily: DISPLAY,
        transition: "opacity .2s",
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}

function AppHead() {
  return (
    <div
      className="mb-3 flex items-center gap-2.5 px-0.5 pb-3 pt-1"
      style={{ borderBottom: "1px solid #E4E2DC" }}
    >
      <MiniLogo />
      <span className="text-[16px] font-extrabold">Interaktivni Katalog</span>
    </div>
  );
}

/* Screen 0: the Instagram feed, with the Neto ad as the post on screen.
   The creative floats its products the way the old ad did; around it sits
   everything Instagram puts around a sponsored post, down to the call to
   action strip that turns blue a moment after the post is on screen, which
   is what Instagram does. */
const FLOATS: {
  Icon: () => React.JSX.Element;
  cls: string;
  dur: number;
  delay: number;
}[] = [
  {
    Icon: Milk,
    cls: "right-4 top-[132px] h-[72px] w-[72px]",
    dur: 4,
    delay: 0,
  },
  {
    Icon: Bread,
    cls: "bottom-[20px] left-[16px] h-[72px] w-[72px]",
    dur: 4.6,
    delay: 0.4,
  },
  {
    Icon: Coffee,
    cls: "bottom-[66px] right-[92px] h-[72px] w-[72px]",
    dur: 3.8,
    delay: 0.8,
  },
  {
    Icon: Eggs,
    cls: "left-[24px] top-[136px] h-[60px] w-[60px]",
    dur: 4.2,
    delay: 1.2,
  },
];

function Avatar({ size = 32 }: { size?: number }) {
  return (
    <span
      className="grid flex-none place-items-center rounded-full font-black italic text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.5,
        background: RED,
        boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
      }}
    >
      N
    </span>
  );
}

/* Messenger's paper plane, the icon Instagram keeps top right. */
function Messenger({ size = 24 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2.5C6.6 2.5 2.5 6.4 2.5 11.4c0 2.8 1.3 5.3 3.4 7v3.4l3.2-1.8c.9.3 1.9.4 2.9.4 5.4 0 9.5-3.9 9.5-8.9S17.4 2.5 12 2.5z" />
      <path d="m6.5 13.8 3.3-3.5 2.6 2.2 3.2-3.5" />
    </svg>
  );
}

function AdScreen({ onGo }: { onGo: () => void }) {
  const active = useSlideActive();
  return (
    <div className="flex h-full flex-col bg-white text-[#000]">
      {/* Instagram's header */}
      <div className="flex items-center justify-between px-4 pb-1 pt-[50px]">
        <span
          className="text-[29px] leading-none"
          style={{ fontFamily: IG_SCRIPT, letterSpacing: "0.01em" }}
        >
          Instagram
        </span>
        <span className="flex items-center gap-[18px]">
          <Heart size={24} strokeWidth={1.9} />
          <Messenger />
        </span>
      </div>

      {/* the post */}
      <div className="flex items-center gap-2.5 px-3 py-2">
        <Avatar />
        <div className="leading-[1.2]">
          <b className="block text-[13px] font-semibold">netodiskonti</b>
          <small className="block text-[11.5px]" style={{ color: IG_MUTED }}>
            Sponzorisano
          </small>
        </div>
        <MoreHorizontal size={20} className="ml-auto" />
      </div>

      <button
        type="button"
        onClick={onGo}
        aria-label="Otvori oglas"
        className="relative block min-h-0 flex-1 cursor-pointer overflow-hidden text-left text-white"
        style={{ background: RED, fontFamily: DISPLAY }}
      >
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 60% at 100% 100%, rgba(0,0,0,0.22), transparent 60%)",
          }}
        />
        <span className="absolute left-5 top-5 z-[2] block max-w-[9ch] text-[34px] font-black italic leading-[1.02]">
          Gde je tvoj najbliži Neto?
        </span>
        {FLOATS.map(({ Icon, cls, dur, delay }, i) => (
          <motion.span
            key={i}
            aria-hidden
            className={`absolute block bg-white p-[9px] ${cls}`}
            style={{
              borderRadius: "18px 18px 18px 6px",
              boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
            }}
            animate={{ y: [0, -10, 0], rotate: [-4, 5, -4] }}
            transition={{
              duration: dur,
              delay,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <Icon />
          </motion.span>
        ))}
        <span
          className="absolute bottom-4 right-4 z-[2] bg-black px-3 py-1.5 text-[18px] font-black italic text-white"
          style={{ borderRadius: "4px 14px 4px 4px" }}
        >
          do −17%
        </span>
      </button>

      {/* the call to action strip */}
      <motion.button
        type="button"
        onClick={onGo}
        whileTap={{ scale: 0.99 }}
        className="flex cursor-pointer items-center justify-between px-3 py-[11px] text-[14px] font-semibold"
        initial={false}
        animate={{
          background: active ? IG_BLUE : "#FFFFFF",
          color: active ? "#FFFFFF" : "#000000",
        }}
        transition={{ delay: active ? 1.8 : 0, duration: 0.35 }}
        style={{ borderBottom: `1px solid ${IG_LINE}` }}
      >
        Pogledaj katalog
        <ChevronRight size={18} strokeWidth={2.2} />
      </motion.button>

      <div className="flex items-center gap-[15px] px-3 pt-2.5">
        <Heart size={24} strokeWidth={1.9} />
        <MessageCircle size={24} strokeWidth={1.9} className="-scale-x-100" />
        <Send size={23} strokeWidth={1.9} className="-mt-0.5" />
        <Bookmark size={24} strokeWidth={1.9} className="ml-auto" />
      </div>
      <div className="px-3 pt-1.5 text-[13px] leading-[1.35]">
        <b className="block font-semibold">1.248 sviđanja</b>
        <p className="mt-px">
          <b className="font-semibold">netodiskonti</b> Klikni i pogledaj gde je
          tvoj najbliži Neto market. Svaki dinar je bitan.
        </p>
        <p className="mt-px" style={{ color: IG_MUTED }}>
          Pogledaj sva 34 komentara
        </p>
      </div>

      {/* Instagram's tab bar, above the home indicator */}
      <div
        className="mt-auto flex items-center justify-between px-6 pb-[24px] pt-2.5"
        style={{ borderTop: `1px solid ${IG_LINE}` }}
      >
        <Home size={25} strokeWidth={2.2} fill="#000" />
        <Search size={25} strokeWidth={2.4} />
        <SquarePlus size={25} strokeWidth={1.9} />
        <Clapperboard size={25} strokeWidth={1.9} />
        <span
          className="grid h-[26px] w-[26px] place-items-center rounded-full"
          style={{ boxShadow: "0 0 0 1.5px #000", background: "#F3F2EE" }}
        >
          <span
            className="h-[18px] w-[18px] rounded-full"
            style={{ background: "#C9C7C1" }}
          />
        </span>
      </div>
    </div>
  );
}

/* Screen 1: the location permission, with a radar pinging behind it. */
function PermScreen({
  onAllow,
  onDeny,
}: {
  onAllow: () => void;
  onDeny: () => void;
}) {
  return (
    <>
      <AppHead />
      <div className="relative mx-auto mt-4 h-[150px] w-[150px]" aria-hidden>
        {[0, 0.8, 1.6].map((d) => (
          <motion.i
            key={d}
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${RED}` }}
            initial={{ scale: 0.3, opacity: 0.9 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{
              duration: 2.4,
              delay: d,
              ease: "easeOut",
              repeat: Infinity,
            }}
          />
        ))}
        <span
          className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center text-white"
          style={{ background: RED, borderRadius: "50% 50% 50% 12%" }}
        >
          <Pin size={28} />
        </span>
      </div>
      <div
        className="mt-auto rounded-[18px] bg-white px-4 py-5"
        style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
      >
        <p className="text-[19px] font-extrabold leading-[1.25]">
          Da li odobravaš da podeliš svoju lokaciju?
        </p>
        <p className="mt-2 text-[14px]" style={{ color: MUTED }}>
          Tako ti pokazujemo najbliži Neto u Novom Sadu.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <DBtn ghost onClick={onDeny}>
            Ne sada
          </DBtn>
          <DBtn onClick={onAllow}>Dozvoli</DBtn>
        </div>
      </div>
    </>
  );
}

/* Screen 2: pick a town by hand. */
function TownScreen({ onPick }: { onPick: (i: number) => void }) {
  return (
    <>
      <AppHead />
      <p className="text-[22px] font-extrabold italic">
        Nema problema. Gde si?
      </p>
      <div className="mt-3.5 grid gap-2.5">
        {TOWNS.map((t, i) => (
          <motion.button
            key={t}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => onPick(i)}
            className="flex items-center gap-3 bg-white p-3.5 text-left font-bold"
            style={{
              borderRadius: "6px 16px 6px 6px",
              boxShadow: "0 2px 0 #E4E2DC",
              fontFamily: DISPLAY,
            }}
          >
            <span
              className="grid h-8 w-8 place-items-center rounded-full"
              style={{ background: "#FDE8E7", color: RED }}
            >
              <Pin size={18} />
            </span>
            {t}
          </motion.button>
        ))}
      </div>
    </>
  );
}

/* Screen 3: the catalogue itself, with a live basket. */
function Bump({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  return (
    <motion.b
      key={value}
      className={`inline-block text-[15px] ${className}`}
      initial={{ scale: 1.18 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      {value}
    </motion.b>
  );
}

function CatalogScreen({
  store,
  sel,
  totals,
  onToggle,
  onCode,
}: {
  store: number;
  sel: Set<number>;
  totals: { t: number; sv: number; n: number };
  onToggle: (i: number) => void;
  onCode: () => void;
}) {
  return (
    <>
      <AppHead />
      <div
        className="flex items-center gap-2.5 bg-black px-3 py-2.5 text-white"
        style={{ borderRadius: "6px 18px 6px 6px" }}
      >
        <span
          className="grid h-[34px] w-[34px] flex-none place-items-center rounded-full"
          style={{ background: RED }}
        >
          <Pin size={18} />
        </span>
        <div>
          <b className="block text-[14px] leading-[1.2]">{STORES[store][0]}</b>
          <small className="text-[11px]" style={{ color: "#BDBDBD" }}>
            {STORES[store][1]} · otvoreno do 21h
          </small>
        </div>
      </div>
      <p className="mt-3 text-[19px] font-extrabold italic leading-[1.12]">
        Izaberi proizvode koji su ti potrebni
      </p>
      <div className="-mx-1 mt-2.5 grid flex-1 grid-cols-2 content-start gap-[9px] overflow-y-auto px-1 pb-2 pt-0.5">
        {PRODUCTS.map((p, i) => (
          <ProductCard
            key={p.name}
            p={p}
            pressed={sel.has(i)}
            onToggle={() => onToggle(i)}
          />
        ))}
      </div>
      <div
        className="-mx-[14px] -mb-[34px] mt-1.5 grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2.5 bg-white px-3 pb-[38px] pt-2.5"
        style={{ borderTop: "2px solid #000" }}
      >
        <div
          className="relative grid h-9 w-9 place-items-center rounded-full"
          style={{ background: "#F3F2EE" }}
        >
          <ShoppingCart size={20} />
          <motion.em
            key={totals.n}
            className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[11px] font-extrabold not-italic text-white"
            style={{ background: RED }}
            initial={{ scale: 1.18 }}
            animate={{ scale: 1 }}
          >
            {totals.n}
          </motion.em>
        </div>
        <div>
          <small className="block text-[10px]" style={{ color: MUTED }}>
            Ukupno
          </small>
          <Bump value={`${fmt(totals.t)} din`} />
        </div>
        <div>
          <small className="block text-[10px]" style={{ color: MUTED }}>
            Štediš
          </small>
          <Bump value={`${fmt(totals.sv)} din`} className="text-[#E2231A]" />
        </div>
        <DBtn sm disabled={totals.n === 0} onClick={onCode}>
          Uzmi kod
        </DBtn>
      </div>
    </>
  );
}

/* Screen 4: the code, with confetti. */
const CONFETTI = Array.from({ length: 34 }, (_, k) => ({
  left: ((k * 37) % 100) + (k % 3),
  color: k % 3 ? RED : k % 2 ? "#000" : "#F7C531",
  delay: ((k * 13) % 40) / 100,
  rot: (k * 47) % 180,
}));

function TicketScreen({
  store,
  totals,
  onRestart,
}: {
  store: number;
  totals: { t: number; sv: number; n: number; extra: number };
  onRestart: () => void;
}) {
  return (
    <>
      <AppHead />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[4] overflow-hidden"
      >
        <AnimatePresence>
          {CONFETTI.map((c, k) => (
            <motion.i
              key={k}
              className="absolute -top-3 h-3 w-2 rounded-[2px]"
              style={{ left: `${c.left}%`, background: c.color }}
              initial={{ y: 0, rotate: c.rot, opacity: 1 }}
              animate={{ y: 680, rotate: c.rot + 540, opacity: 0.2 }}
              transition={{
                duration: 1.6,
                delay: c.delay,
                ease: [0.3, 0.6, 0.4, 1],
              }}
            />
          ))}
        </AnimatePresence>
      </div>
      <div
        className="relative mb-2.5 mt-auto rounded-[18px] bg-white px-4 pb-4 pt-5 text-center"
        style={{ boxShadow: "0 12px 30px rgba(0,0,0,0.1)" }}
      >
        <span
          aria-hidden
          className="absolute -left-[11px] top-[118px] h-[22px] w-[22px] rounded-full"
          style={{ background: "#F3F2EE" }}
        />
        <span
          aria-hidden
          className="absolute -right-[11px] top-[118px] h-[22px] w-[22px] rounded-full"
          style={{ background: "#F3F2EE" }}
        />
        <small style={{ color: MUTED }}>Tvoj tajni kod</small>
        <motion.div
          className="my-2 px-1.5 py-3.5 text-[24px] font-semibold tracking-[0.05em] text-white"
          style={{
            background: RED,
            borderRadius: "6px 20px 6px 6px",
            fontFamily: MONO,
          }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...POP_SPRING, delay: 0.15 }}
        >
          {CODE}
        </motion.div>
        <p
          className="pb-3.5 text-[14px]"
          style={{ borderBottom: "2px dashed #E4E2DC" }}
        >
          Pokaži ga na kasi i dobijaš još 2% popusta.
        </p>
        <div className="mt-1.5 text-left text-[14px]">
          <Row l="Ušteda na akcijama" v={`${fmt(totals.sv)} din`} />
          <Row l="Dodatnih 2% sa kodom" v={`${fmt(totals.extra)} din`} />
          <div className="flex justify-between py-2 font-extrabold">
            <span>Ukupno štediš</span>
            <b className="text-[19px]" style={{ color: RED }}>
              {fmt(totals.sv + totals.extra)} din
            </b>
          </div>
        </div>
        <p className="mt-1 text-[12px]" style={{ color: MUTED }}>
          Tvoj najbliži Neto: {STORES[store][0]}
        </p>
      </div>
      <DBtn
        style={{ background: "#7360F2" }}
        className="flex items-center justify-center gap-2 text-[15px]"
      >
        <svg
          viewBox="0 0 24 24"
          width={20}
          height={20}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L4 20.5l1.4-4.4A8.5 8.5 0 1 1 21 11.5z" />
          <path d="M9.5 8.5c.3 2.6 2.4 4.8 5 5.2" />
        </svg>
        Pridruži se Viber zajednici
      </DBtn>
      <button
        type="button"
        onClick={onRestart}
        className="cursor-pointer pb-0.5 pt-2.5 text-[13px] font-bold underline"
        style={{ color: MUTED, fontFamily: DISPLAY }}
      >
        Kreni ispočetka
      </button>
    </>
  );
}

function Row({ l, v }: { l: string; v: string }) {
  return (
    <div
      className="flex justify-between py-2"
      style={{ borderBottom: "1px solid #E4E2DC" }}
    >
      <span>{l}</span>
      <b>{v}</b>
    </div>
  );
}
