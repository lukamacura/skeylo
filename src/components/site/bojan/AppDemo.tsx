"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Calculator,
  Camera,
  Clock,
  Cloud,
  CreditCard,
  Folder,
  Heart,
  Home,
  LayoutGrid,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  Music,
  Phone,
  Settings,
  StickyNote,
  User,
  Wallet,
  Compass,
} from "lucide-react";
import { DISPLAY, MONO, MUTED, RED, useSlideActive } from "./primitives";
import { MiniLogo, PRODUCTS, Pin, ProductCard, off } from "./visuals";

/* The Neto app, on an iPhone. The home screen waits, a notification drops
   in, and tapping the Neto icon scales the app open from exactly where the
   icon sits. The bar at the bottom closes it. */

type Tab = "home" | "cat" | "card" | "me";

export default function AppDemo() {
  const active = useSlideActive();
  const [inApp, setInApp] = useState(false);
  const [notif, setNotif] = useState(false);
  const [badge, setBadge] = useState(true);
  const [tab, setTab] = useState<Tab>("home");
  const [origin, setOrigin] = useState("50% 50%");
  const screen = useRef<HTMLDivElement>(null);
  const icon = useRef<HTMLButtonElement>(null);
  const body = useRef<HTMLDivElement>(null);

  /* The notification arrives a beat after the slide does and leaves on its
     own if nobody taps it. */
  useEffect(() => {
    if (!active) return;
    const a = setTimeout(() => setNotif(true), 1200);
    const b = setTimeout(() => setNotif(false), 8500);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [active]);

  function openApp() {
    const r = icon.current?.getBoundingClientRect();
    const sr = screen.current?.getBoundingClientRect();
    if (r && sr)
      setOrigin(
        `${r.left - sr.left + r.width / 2}px ${r.top - sr.top + r.height / 2}px`,
      );
    setNotif(false);
    setBadge(false);
    setInApp(true);
  }

  function closeApp() {
    setInApp(false);
  }

  function pick(t: Tab) {
    setTab(t);
    if (body.current) body.current.scrollTop = 0;
  }

  return (
    <div className="mx-auto w-full max-w-[350px]">
      <div
        className="relative rounded-[60px] p-[11px]"
        style={{
          background: "#1b1b1d",
          boxShadow:
            "0 0 0 2px #8d8d92, 0 0 0 4px #3a3a3c, 0 40px 80px -30px rgba(226,35,26,0.6)",
        }}
      >
        <div
          ref={screen}
          className="relative h-[660px] overflow-hidden rounded-[50px] bg-black"
          style={{ isolation: "isolate", fontFamily: DISPLAY }}
        >
          {/* island + status bar */}
          <div
            aria-hidden
            className="absolute left-1/2 top-[11px] z-30 h-8 w-[108px] -translate-x-1/2 rounded-[20px] bg-black"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 z-[25] flex h-[52px] items-start justify-between px-[30px] pl-[34px] pt-4 text-[15px] transition-colors duration-300"
            style={{ color: inApp ? "#111" : "#fff" }}
          >
            <b className="font-bold">9:41</b>
            <span className="mt-0.5 flex items-center gap-1.5">
              <svg viewBox="0 0 18 12" width={17} height={12}>
                <rect
                  x="0"
                  y="8"
                  width="3"
                  height="4"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  x="5"
                  y="5.5"
                  width="3"
                  height="6.5"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  x="10"
                  y="3"
                  width="3"
                  height="9"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  x="15"
                  y="0"
                  width="3"
                  height="12"
                  rx="1"
                  fill="currentColor"
                />
              </svg>
              <svg viewBox="0 0 16 12" width={16} height={12}>
                <path
                  d="M8 11.5l2.2-2.6a3 3 0 0 0-4.4 0z M3.3 6.3a6.6 6.6 0 0 1 9.4 0l-1.5 1.8a4.4 4.4 0 0 0-6.4 0z M.6 3.3a10.4 10.4 0 0 1 14.8 0l-1.5 1.8a8.2 8.2 0 0 0-11.8 0z"
                  fill="currentColor"
                />
              </svg>
              <span
                className="relative h-3 w-[25px] rounded-[4px] p-[1.5px] opacity-95"
                style={{ border: "1.5px solid currentColor" }}
              >
                <i className="block h-full w-[78%] rounded-[2px] bg-current" />
                <i className="absolute -right-1 top-[3px] h-1 w-[2px] rounded-[1px] bg-current" />
              </span>
            </span>
          </div>

          {/* home screen */}
          <motion.div
            className="absolute inset-0 flex flex-col px-[18px] pb-[18px] pt-[66px]"
            style={{
              background:
                "radial-gradient(120% 70% at 10% 0%,#ff6a4d 0%,transparent 55%),radial-gradient(90% 60% at 100% 40%,#7b2ff7 0%,transparent 60%),radial-gradient(100% 70% at 30% 100%,#0a2a8a 0%,transparent 65%),#1a0f3a",
            }}
            animate={
              inApp
                ? { scale: 0.92, filter: "blur(4px) brightness(0.7)" }
                : { scale: 1, filter: "blur(0px) brightness(1)" }
            }
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {/* notification */}
            <motion.div
              role="button"
              tabIndex={0}
              aria-label="Obaveštenje od Neto: nova akcija nedelje"
              onClick={openApp}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openApp();
                }
              }}
              className="absolute left-2.5 right-2.5 top-14 z-20 grid cursor-pointer grid-cols-[40px_1fr] items-start gap-2.5 rounded-[22px] p-3 text-[#111]"
              style={{
                background: "rgba(245,245,247,0.9)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
              initial={{ y: "-140%", opacity: 0 }}
              animate={
                notif ? { y: 0, opacity: 1 } : { y: "-140%", opacity: 0 }
              }
              transition={{
                y: { type: "spring", stiffness: 260, damping: 22 },
                opacity: { duration: 0.3 },
              }}
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-[10px]"
                style={{ background: RED }}
              >
                <span className="-rotate-[4deg] text-[12px] font-black italic text-white">
                  Neto
                </span>
              </span>
              <div>
                <p className="flex justify-between text-[13px]">
                  <b>Neto</b>
                  <small style={{ color: "#6b6b6b" }}>sada</small>
                </p>
                <strong className="mt-px block text-[14px]">
                  Nova akcija nedelje je stigla!
                </strong>
                <span className="block text-[13px] leading-[1.3] text-[#333]">
                  Mleko 129 din, kafa 339 din. Tvoj lični kod te čeka.
                </span>
              </div>
            </motion.div>

            <div className="mt-1.5 grid grid-cols-4 gap-x-2.5 gap-y-[18px]">
              <Cell label="Kalendar">
                <span
                  className="flex h-[60px] w-[60px] flex-col items-center justify-center rounded-[15px] bg-white leading-none"
                  style={{ boxShadow: "0 4px 10px rgba(0,0,0,.25)" }}
                >
                  <small className="text-[10px] font-bold text-[#ff3b30]">
                    PET
                  </small>
                  <b className="text-[28px] font-normal text-[#111]">25</b>
                </span>
              </Cell>
              <Cell label="Fotografije">
                <span
                  className="grid h-[60px] w-[60px] place-items-center rounded-[15px] bg-white"
                  style={{ boxShadow: "0 4px 10px rgba(0,0,0,.25)" }}
                >
                  <span
                    className="block h-10 w-10 rounded-full"
                    style={{
                      background:
                        "conic-gradient(#ff9500,#ffcc00,#34c759,#5ac8fa,#007aff,#af52de,#ff2d55,#ff9500)",
                      WebkitMask:
                        "radial-gradient(circle,transparent 6px,#000 7px)",
                      mask: "radial-gradient(circle,transparent 6px,#000 7px)",
                    }}
                  />
                </span>
              </Cell>
              <Ic label="Kamera" bg="linear-gradient(#9a9a9f,#5d5d62)">
                <Camera />
              </Ic>
              <Ic label="Mape" bg="linear-gradient(135deg,#4cd964,#2a9df4)">
                <MapPin />
              </Ic>
              <Ic label="Vreme" bg="linear-gradient(#3a8ef0,#1c5fd1)">
                <Cloud />
              </Ic>
              <Ic label="Sat" bg="#111">
                <Clock />
              </Ic>
              <Ic
                label="Beleške"
                bg="linear-gradient(#ffe36b,#f7c531)"
                color="#6b5300"
              >
                <StickyNote />
              </Ic>
              <Ic label="Podešavanja" bg="linear-gradient(#8e8e93,#636366)">
                <Settings />
              </Ic>
              <Ic label="Muzika" bg="linear-gradient(#ff5f7e,#e3264b)">
                <Music />
              </Ic>

              {/* the Neto icon */}
              <Cell label="Neto" bold>
                <motion.button
                  ref={icon}
                  type="button"
                  onClick={openApp}
                  aria-label="Otvori Neto aplikaciju"
                  whileTap={{ scale: 0.92 }}
                  className="relative grid h-[60px] w-[60px] cursor-pointer place-items-center rounded-[15px]"
                  style={{
                    background: RED,
                    boxShadow: "0 4px 10px rgba(0,0,0,.25)",
                  }}
                >
                  <motion.span
                    aria-hidden
                    className="absolute -inset-1.5 rounded-[20px]"
                    style={{ border: "2.5px solid #fff" }}
                    initial={{ scale: 0.9, opacity: 0.9 }}
                    animate={
                      inApp
                        ? { opacity: 0 }
                        : { scale: [0.9, 1.25], opacity: [0.9, 0] }
                    }
                    transition={{
                      duration: 2,
                      delay: 1,
                      ease: "easeOut",
                      repeat: Infinity,
                    }}
                  />
                  <span className="block -rotate-[4deg] text-[18px] font-black italic tracking-[-0.02em] text-white">
                    Neto
                  </span>
                  <AnimatePresence>
                    {badge && (
                      <motion.em
                        className="absolute -right-[5px] -top-[5px] grid h-[22px] min-w-[22px] place-items-center rounded-[11px] text-[13px] font-bold not-italic text-white"
                        style={{ background: "#ff3b30" }}
                        exit={{ scale: 0, opacity: 0 }}
                      >
                        1
                      </motion.em>
                    )}
                  </AnimatePresence>
                </motion.button>
              </Cell>

              <Ic label="Pošta" bg="linear-gradient(#5ac8fa,#1f7ae0)">
                <Mail />
              </Ic>
              <Ic label="Novčanik" bg="#1c1c1e">
                <Wallet />
              </Ic>
              <Ic label="Kalkulator" bg="#2c2c2e" color="#ff9f0a">
                <Calculator />
              </Ic>
              <Ic label="Fajlovi" bg="#fff" color="#1f7ae0">
                <Folder />
              </Ic>
              <Ic label="Zdravlje" bg="#fff" color="#ff375f">
                <Heart />
              </Ic>
              <Ic label="Podkasti" bg="linear-gradient(#bf5af2,#8e2de2)">
                <Mic />
              </Ic>
            </div>

            <div
              aria-hidden
              className="mt-auto flex justify-center gap-[7px] py-3"
            >
              <i className="h-[7px] w-[7px] rounded-full bg-white" />
              <i className="h-[7px] w-[7px] rounded-full bg-white/40" />
              <i className="h-[7px] w-[7px] rounded-full bg-white/40" />
            </div>
            <div
              className="mb-1.5 grid grid-cols-4 gap-2.5 rounded-[30px] px-3 py-3.5"
              style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              <Ic bg="linear-gradient(#5bf675,#2bc24a)">
                <Phone />
              </Ic>
              <Ic bg="linear-gradient(#4aa8ff,#1f6fe0)">
                <MessageCircle />
              </Ic>
              <Ic bg="#fff" color="#0a84ff">
                <Compass />
              </Ic>
              <Ic bg="linear-gradient(#b0b0b5,#7c7c81)">
                <User />
              </Ic>
            </div>
          </motion.div>

          {/* the app */}
          <motion.div
            className="absolute inset-0 z-[15] flex flex-col pt-[54px] text-[#111]"
            style={{ background: "#F3F2EE", transformOrigin: origin }}
            initial={false}
            animate={
              inApp
                ? { scale: 1, opacity: 1, borderRadius: 0 }
                : { scale: 0.12, opacity: 0, borderRadius: 50 }
            }
            transition={{
              scale: { duration: 0.5, ease: [0.2, 0.9, 0.25, 1] },
              opacity: { duration: 0.25 },
              borderRadius: { duration: 0.5 },
            }}
            aria-hidden={!inApp}
            aria-label="Neto aplikacija"
          >
            <div
              className="flex items-center gap-2.5 px-4 pb-3 pt-1.5"
              style={{ pointerEvents: inApp ? "auto" : "none" }}
            >
              <MiniLogo />
              <div className="flex-1 leading-[1.15]">
                <small className="block text-[12px]" style={{ color: MUTED }}>
                  Dobro jutro
                </small>
                <b className="text-[17px]">Marija</b>
              </div>
              <span className="relative grid h-[38px] w-[38px] place-items-center rounded-full bg-white">
                <Bell size={20} />
                <i
                  className="absolute right-[9px] top-2 h-2 w-2 rounded-full"
                  style={{ background: RED }}
                />
              </span>
            </div>

            <div
              ref={body}
              className="relative flex-1 overflow-y-auto px-4 pb-3.5"
              style={{ pointerEvents: inApp ? "auto" : "none" }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {tab === "home" && <HomeTab inApp={inApp} />}
                  {tab === "cat" && <CatTab />}
                  {tab === "card" && <CardTab />}
                  {tab === "me" && <MeTab />}
                </motion.div>
              </AnimatePresence>
            </div>

            <nav
              className="grid grid-cols-4 bg-white px-1.5 pb-[26px] pt-2"
              style={{
                borderTop: "1px solid #E4E2DC",
                pointerEvents: inApp ? "auto" : "none",
              }}
            >
              <TabBtn
                on={tab === "home"}
                onClick={() => pick("home")}
                icon={<Home size={24} />}
                label="Početna"
              />
              <TabBtn
                on={tab === "cat"}
                onClick={() => pick("cat")}
                icon={<LayoutGrid size={24} />}
                label="Katalog"
              />
              <TabBtn
                on={tab === "card"}
                onClick={() => pick("card")}
                icon={<CreditCard size={24} />}
                label="Kartica"
              />
              <TabBtn
                on={tab === "me"}
                onClick={() => pick("me")}
                icon={<User size={24} />}
                label="Profil"
              />
            </nav>
          </motion.div>

          <button
            type="button"
            onClick={closeApp}
            aria-label="Nazad na početni ekran"
            className="absolute bottom-2 left-1/2 z-40 h-[5px] w-[134px] -translate-x-1/2 cursor-pointer rounded-[3px] transition-colors duration-300 before:absolute before:-inset-x-2.5 before:-inset-y-3 before:content-['']"
            style={{ background: inApp ? "#111" : "#fff" }}
          />
        </div>
      </div>
      <p className="mt-5 text-center text-[13px]" style={{ color: "#8A8A8A" }}>
        Dodirnite Neto ikonicu. Traka na dnu ekrana vraća na početni ekran.
      </p>
    </div>
  );
}

function Cell({
  children,
  label,
  bold = false,
}: {
  children: ReactNode;
  label?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {children}
      {label && (
        <span
          className={`whitespace-nowrap text-[11px] text-white ${bold ? "font-bold" : ""}`}
          style={{ textShadow: "0 1px 3px rgba(0,0,0,.5)" }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

function Ic({
  children,
  label,
  bg,
  color = "#fff",
}: {
  children: ReactNode;
  label?: string;
  bg: string;
  color?: string;
}) {
  return (
    <Cell label={label}>
      <span
        aria-hidden
        className="grid h-[60px] w-[60px] place-items-center rounded-[15px] [&>svg]:h-8 [&>svg]:w-8"
        style={{
          background: bg,
          color,
          boxShadow: "0 4px 10px rgba(0,0,0,.25)",
        }}
      >
        {children}
      </span>
    </Cell>
  );
}

function TabBtn({
  on,
  onClick,
  icon,
  label,
}: {
  on: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer flex-col items-center gap-[3px] py-1 text-[10px] font-bold transition-colors"
      style={{ color: on ? RED : "#9A9A9A", fontFamily: DISPLAY }}
    >
      {icon}
      {label}
    </button>
  );
}

function H({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 mt-4 text-[17px] font-extrabold italic">{children}</p>
  );
}

function HomeTab({ inApp }: { inApp: boolean }) {
  return (
    <>
      <div
        className="relative overflow-hidden p-4 text-white"
        style={{ background: RED, borderRadius: "8px 24px 8px 8px" }}
      >
        <span
          aria-hidden
          className="absolute -right-[30px] -top-[30px] h-[120px] w-[120px] rounded-full bg-white/10"
        />
        <small className="text-[12px] opacity-90">Neto Klub</small>
        <b className="mt-0.5 block text-[30px] font-black italic leading-[1.1]">
          1.240 poena
        </b>
        <div
          className="mb-2 mt-3 h-2 overflow-hidden rounded-[4px]"
          style={{ background: "rgba(0,0,0,0.2)" }}
        >
          <motion.i
            className="block h-full rounded-[4px] bg-white"
            initial={{ width: 0 }}
            animate={{ width: inApp ? "83%" : 0 }}
            transition={{
              duration: 1.4,
              ease: [0.25, 0.8, 0.25, 1],
              delay: 0.3,
            }}
          />
        </div>
        <span className="text-[12px]">Još 260 poena do vaučera od 500 din</span>
      </div>
      <div
        className="mt-2.5 flex items-center justify-between gap-2.5 rounded-[14px] bg-white px-3.5 py-3"
        style={{ border: `2px dashed ${RED}` }}
      >
        <div>
          <small className="block text-[11px]" style={{ color: MUTED }}>
            Tvoj lični kod
          </small>
          <b
            className="text-[17px] tracking-[0.04em]"
            style={{ fontFamily: MONO }}
          >
            MARIJA-5N7
          </b>
        </div>
        <span
          className="max-w-[9ch] text-right text-[11px] font-bold leading-[1.25]"
          style={{ color: RED }}
        >
          +5% na sledeću kupovinu
        </span>
      </div>
      <H>Akcija nedelje</H>
      <div
        className="-mx-4 flex gap-[9px] overflow-x-auto px-4 pb-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {PRODUCTS.map((p) => (
          <div
            key={p.name}
            className="relative w-28 flex-none bg-white p-2"
            style={{
              borderRadius: "14px 14px 14px 4px",
              scrollSnapAlign: "start",
            }}
          >
            <span
              className="grid h-[70px] place-items-center rounded-[10px] [&>svg]:h-[52px] [&>svg]:w-[52px]"
              style={{ background: p.tint }}
            >
              <p.Icon />
            </span>
            <span
              className="absolute left-[5px] top-[5px] px-1.5 py-0.5 text-[10px] font-extrabold text-white"
              style={{ background: RED, borderRadius: "3px 8px 3px 3px" }}
            >
              −{off(p)}%
            </span>
            <b className="mt-1.5 block min-h-[29px] text-[12px] leading-[1.2]">
              {p.name}
            </b>
            <strong className="text-[14px]" style={{ color: RED }}>
              {p.now}
            </strong>
            <s className="ml-1 text-[10px]" style={{ color: MUTED }}>
              {p.was}
            </s>
          </div>
        ))}
      </div>
      <div
        className="mt-3.5 flex items-center gap-2.5 bg-black px-3 py-2.5 text-white"
        style={{ borderRadius: "8px 18px 8px 8px" }}
      >
        <span
          className="grid h-[34px] w-[34px] flex-none place-items-center rounded-full"
          style={{ background: RED }}
        >
          <Pin size={18} />
        </span>
        <div>
          <small className="block text-[11px]" style={{ color: "#FF8A84" }}>
            Tvoj Neto
          </small>
          <b className="block text-[14px]">Bulevar oslobođenja 2</b>
          <em className="text-[11px] not-italic" style={{ color: "#BDBDBD" }}>
            Otvoreno do 21h
          </em>
        </div>
      </div>
    </>
  );
}

function CatTab() {
  const [sel, setSel] = useState<Set<number>>(() => new Set());
  let n = 0;
  let sv = 0;
  sel.forEach((i) => {
    n++;
    sv += PRODUCTS[i].was - PRODUCTS[i].now;
  });
  const word = n === 1 ? "proizvod" : "proizvoda";
  return (
    <>
      <H>Interaktivni Katalog</H>
      <div className="grid grid-cols-2 gap-[9px]">
        {PRODUCTS.map((p, i) => (
          <ProductCard
            key={p.name}
            p={p}
            compact
            pressed={sel.has(i)}
            onToggle={() =>
              setSel((prev) => {
                const next = new Set(prev);
                if (next.has(i)) next.delete(i);
                else next.add(i);
                return next;
              })
            }
          />
        ))}
      </div>
      <div className="sticky bottom-0 mt-2.5 rounded-[12px] bg-black px-3.5 py-[11px] text-center text-[13px] font-bold text-white">
        {n
          ? `Lista za kupovinu: ${n} ${word} · štediš ${sv} din`
          : "Dodaj proizvode na listu za kupovinu"}
      </div>
    </>
  );
}

function CardTab() {
  return (
    <>
      <div
        className="mt-2 flex aspect-[1.6] flex-col justify-between rounded-[18px] p-[18px] text-white"
        style={{
          background: "linear-gradient(135deg,#E2231A,#9E120B)",
          boxShadow: "0 14px 30px -12px rgba(226,35,26,.6)",
        }}
      >
        <div className="flex items-center justify-between">
          <MiniLogo invert />
          <small className="text-[12px] opacity-90">Klub kartica</small>
        </div>
        <b className="text-[17px]">Marija Petrović</b>
        <div
          aria-hidden
          className="h-[38px] rounded-[6px] bg-white px-2 py-[5px]"
        >
          <div
            className="h-full"
            style={{
              background:
                "repeating-linear-gradient(90deg,#000 0 2px,transparent 2px 4px,#000 4px 7px,transparent 7px 9px,#000 9px 10px,transparent 10px 13px)",
            }}
          />
        </div>
        <span
          className="text-[13px] tracking-[0.1em]"
          style={{ fontFamily: MONO }}
        >
          2045 1180 7736
        </span>
      </div>
      <p className="my-3 text-center text-[13px]" style={{ color: MUTED }}>
        Pokaži karticu na kasi i skupljaj poene.
      </p>
      <div className="grid grid-cols-2 gap-[9px]">
        <div className="rounded-[14px] bg-white p-3">
          <small className="block text-[11px]" style={{ color: MUTED }}>
            Ušteda ove godine
          </small>
          <b className="text-[22px] font-black italic" style={{ color: RED }}>
            8.450 din
          </b>
        </div>
        <div className="rounded-[14px] bg-white p-3">
          <small className="block text-[11px]" style={{ color: MUTED }}>
            Kupovina ovog meseca
          </small>
          <b className="text-[22px] font-black italic" style={{ color: RED }}>
            12
          </b>
        </div>
      </div>
    </>
  );
}

function Toggle({ label, initial }: { label: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <label
      className="flex cursor-pointer items-center justify-between py-3 text-[14px] last:border-0"
      style={{ borderBottom: "1px solid #E4E2DC" }}
    >
      <span>{label}</span>
      <input
        type="checkbox"
        className="sr-only"
        checked={on}
        onChange={() => setOn((v) => !v)}
      />
      <motion.i
        className="relative block h-7 w-[46px] rounded-[14px]"
        animate={{ background: on ? "#34C759" : "#D1D1D6" }}
        transition={{ duration: 0.25 }}
      >
        <motion.span
          className="absolute left-0.5 top-0.5 block h-6 w-6 rounded-full bg-white"
          style={{ boxShadow: "0 2px 4px rgba(0,0,0,.2)" }}
          animate={{ x: on ? 18 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.i>
    </label>
  );
}

function MeTab() {
  return (
    <>
      <div className="mt-2 flex items-center gap-3 rounded-[16px] bg-white p-3.5">
        <span
          className="grid h-[50px] w-[50px] place-items-center font-black italic text-white"
          style={{ background: RED, borderRadius: "50% 50% 50% 14%" }}
        >
          MP
        </span>
        <div>
          <b className="block text-[16px]">Marija Petrović</b>
          <small className="text-[12px]" style={{ color: MUTED }}>
            Član Neto Kluba od 2026.
          </small>
        </div>
      </div>
      <H>Obaveštenja</H>
      <div className="rounded-[16px] bg-white px-3.5 py-0.5">
        <Toggle label="Akcija nedelje" initial />
        <Toggle label="Novi proizvodi" initial />
        <Toggle label="Nove radnje u blizini" initial={false} />
      </div>
      <H>Omiljena radnja</H>
      <div className="rounded-[14px] bg-white px-3.5 py-[13px] text-[14px] font-bold">
        Bulevar oslobođenja 2, Novi Sad
      </div>
    </>
  );
}
