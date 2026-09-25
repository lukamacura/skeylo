"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import {
  Bell,
  BookOpen,
  Calculator,
  Camera,
  ChevronRight,
  Clock,
  Cloud,
  Compass,
  Copy,
  CreditCard,
  Folder,
  Heart,
  Home,
  Instagram,
  Landmark,
  Languages,
  LayoutGrid,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  Music,
  Navigation,
  Phone,
  Play,
  Settings,
  StickyNote,
  Trash2,
  TrendingUp,
  User,
  Wallet,
  X,
} from "lucide-react";
import { DISPLAY, MONO, MUTED, RED, fmt, useSlideActive } from "./primitives";
import { MiniLogo, PRODUCTS, Pin, ProductCard, off } from "./visuals";

/* The Neto app, on an iPhone that behaves like one. The home screen pages
   swipe, the notification swipes away, a swipe up from the home bar leaves
   whatever app is open, and every icon opens something. Inside Neto, taps
   open bottom sheets and toasts the way a real app would. */

type Tab = "home" | "cat" | "card" | "me";
type Generic = { label: string; bg: string; color: string; icon: ReactNode };
type App = "neto" | Generic;
type SheetKind =
  | "notifs"
  | "club"
  | "store"
  | "list"
  | "favStore"
  | "wallet"
  | null;

const STORES = [
  "Bulevar oslobođenja 2",
  "Preradovićeva 110, Petrovaradin",
  "Cara Lazara 33, Futog",
  "Svetosavska 7, Kać",
];

const SPRING = { type: "spring" as const, stiffness: 420, damping: 38 };

export default function AppDemo() {
  const active = useSlideActive();
  const [app, setApp] = useState<App | null>(null);
  const [notif, setNotif] = useState(false);
  const [badge, setBadge] = useState(true);
  const [tab, setTab] = useState<Tab>("home");
  const [origin, setOrigin] = useState("50% 50%");
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sel, setSel] = useState<Set<number>>(() => new Set());
  const [fav, setFav] = useState(0);
  const [page, setPage] = useState(0);
  const screen = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const pager = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inApp = app !== null;

  /* The notification arrives a beat after the slide does and leaves on its
     own if nobody touches it. */
  useEffect(() => {
    if (!active) return;
    const a = setTimeout(() => setNotif(true), 1200);
    const b = setTimeout(() => setNotif(false), 9000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [active]);

  const say = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  /* Apps open from where their icon sits, like iOS. */
  const open = useCallback((which: App, el?: HTMLElement | null) => {
    const r = el?.getBoundingClientRect();
    const sr = screen.current?.getBoundingClientRect();
    if (r && sr)
      setOrigin(
        `${r.left - sr.left + r.width / 2}px ${r.top - sr.top + r.height / 2}px`,
      );
    else setOrigin("50% 50%");
    setNotif(false);
    if (which === "neto") setBadge(false);
    setSheet(null);
    setApp(which);
  }, []);

  const close = useCallback(() => {
    setSheet(null);
    setApp(null);
  }, []);

  /* --- Home pager: two pages of icons, drag to swipe, snap on release. --- */
  const px = useMotionValue(0);
  const PAGES = 2;
  const pageW = () => pager.current?.offsetWidth ?? 300;
  const snap = useCallback(
    (p: number) => {
      const next = Math.max(0, Math.min(PAGES - 1, p));
      setPage(next);
      animate(px, -next * pageW(), SPRING);
    },
    [px],
  );
  const onPagerEnd = (_: unknown, info: PanInfo) => {
    const w = pageW();
    const raw = -px.get() / w;
    let next = Math.round(raw);
    if (info.velocity.x < -250) next = Math.ceil(raw);
    else if (info.velocity.x > 250) next = Math.floor(raw);
    snap(next);
  };

  /* --- Swipe up from the home bar to leave an app. The app follows the
     finger, shrinking a little, and lets go past the threshold. --- */
  const hy = useMotionValue(0);
  const followScale = useTransform(hy, [0, -140], [1, 0.82]);
  const followRadius = useTransform(hy, [0, -60], [0, 40]);
  const followY = useTransform(hy, [0, -140], [0, -40]);
  const onHomeEnd = (_: unknown, info: PanInfo) => {
    if (inApp && (info.offset.y < -50 || info.velocity.y < -400)) close();
    animate(hy, 0, { type: "spring", stiffness: 500, damping: 40 });
  };

  const pick = (t: Tab) => {
    setTab(t);
    if (body.current) body.current.scrollTop = 0;
  };

  const toggleSel = (i: number) =>
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const generic = (
    label: string,
    bg: string,
    color: string,
    icon: ReactNode,
  ): Generic => ({
    label,
    bg,
    color,
    icon,
  });

  return (
    <div className="mx-auto w-full max-w-[350px] select-none">
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
          style={{
            isolation: "isolate",
            fontFamily: DISPLAY,
            touchAction: "none",
          }}
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

          {/* ---------------- home screen ---------------- */}
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
            {/* notification: tap opens Neto, swipe up dismisses */}
            <motion.div
              role="button"
              tabIndex={notif ? 0 : -1}
              aria-label="Obaveštenje od Neto: nova akcija nedelje"
              onTap={(e) =>
                open(
                  "neto",
                  (e.target as HTMLElement).closest(
                    "[role=button]",
                  ) as HTMLElement,
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  open("neto");
                }
              }}
              drag="y"
              dragConstraints={{ top: -60, bottom: 0 }}
              dragElastic={{ top: 0.7, bottom: 0.15 }}
              dragSnapToOrigin
              onDragEnd={(_, info) => {
                if (info.offset.y < -22 || info.velocity.y < -250)
                  setNotif(false);
              }}
              className="absolute left-2.5 right-2.5 top-14 z-20 grid cursor-pointer grid-cols-[40px_1fr] items-start gap-2.5 rounded-[22px] p-3 text-[#111]"
              style={{
                background: "rgba(245,245,247,0.9)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                pointerEvents: notif ? "auto" : "none",
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

            {/* the pager */}
            <div ref={pager} className="-mx-[18px] flex-1 overflow-hidden">
              <motion.div
                className="flex h-full"
                style={{ x: px }}
                drag="x"
                dragConstraints={{ left: -pageW() * (PAGES - 1), right: 0 }}
                dragElastic={0.12}
                dragMomentum={false}
                onDragEnd={onPagerEnd}
              >
                {/* page 1 */}
                <div className="grid w-full flex-none grid-cols-4 content-start gap-x-2.5 gap-y-[18px] px-[18px] pt-1.5">
                  <Cell label="Kalendar">
                    <IconBtn
                      onOpen={(el) =>
                        open(
                          generic(
                            "Kalendar",
                            "#fff",
                            "#111",
                            <CalendarGlyph />,
                          ),
                          el,
                        )
                      }
                    >
                      <span
                        className="flex h-[60px] w-[60px] flex-col items-center justify-center rounded-[15px] bg-white leading-none"
                        style={{ boxShadow: "0 4px 10px rgba(0,0,0,.25)" }}
                      >
                        <small className="text-[10px] font-bold text-[#ff3b30]">
                          PET
                        </small>
                        <b className="text-[28px] font-normal text-[#111]">
                          25
                        </b>
                      </span>
                    </IconBtn>
                  </Cell>
                  <Cell label="Fotografije">
                    <IconBtn
                      onOpen={(el) =>
                        open(
                          generic(
                            "Fotografije",
                            "#fff",
                            "#111",
                            <PhotosGlyph />,
                          ),
                          el,
                        )
                      }
                    >
                      <span
                        className="grid h-[60px] w-[60px] place-items-center rounded-[15px] bg-white"
                        style={{ boxShadow: "0 4px 10px rgba(0,0,0,.25)" }}
                      >
                        <PhotosGlyph />
                      </span>
                    </IconBtn>
                  </Cell>
                  <Ic
                    label="Kamera"
                    bg="linear-gradient(#9a9a9f,#5d5d62)"
                    open={open}
                  >
                    <Camera />
                  </Ic>
                  <Ic
                    label="Mape"
                    bg="linear-gradient(135deg,#4cd964,#2a9df4)"
                    open={open}
                  >
                    <MapPin />
                  </Ic>
                  <Ic
                    label="Vreme"
                    bg="linear-gradient(#3a8ef0,#1c5fd1)"
                    open={open}
                  >
                    <Cloud />
                  </Ic>
                  <Ic label="Sat" bg="#111" open={open}>
                    <Clock />
                  </Ic>
                  <Ic
                    label="Beleške"
                    bg="linear-gradient(#ffe36b,#f7c531)"
                    color="#6b5300"
                    open={open}
                  >
                    <StickyNote />
                  </Ic>
                  <Ic
                    label="Podešavanja"
                    bg="linear-gradient(#8e8e93,#636366)"
                    open={open}
                  >
                    <Settings />
                  </Ic>
                  <Ic
                    label="Muzika"
                    bg="linear-gradient(#ff5f7e,#e3264b)"
                    open={open}
                  >
                    <Music />
                  </Ic>

                  {/* the Neto icon */}
                  <Cell label="Neto" bold>
                    <IconBtn
                      label="Otvori Neto aplikaciju"
                      onOpen={(el) => open("neto", el)}
                      className="relative grid h-[60px] w-[60px] place-items-center rounded-[15px]"
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
                    </IconBtn>
                  </Cell>

                  <Ic
                    label="Pošta"
                    bg="linear-gradient(#5ac8fa,#1f7ae0)"
                    open={open}
                  >
                    <Mail />
                  </Ic>
                  <Ic label="Novčanik" bg="#1c1c1e" open={open}>
                    <Wallet />
                  </Ic>
                  <Ic
                    label="Kalkulator"
                    bg="#2c2c2e"
                    color="#ff9f0a"
                    open={open}
                  >
                    <Calculator />
                  </Ic>
                  <Ic label="Fajlovi" bg="#fff" color="#1f7ae0" open={open}>
                    <Folder />
                  </Ic>
                  <Ic label="Zdravlje" bg="#fff" color="#ff375f" open={open}>
                    <Heart />
                  </Ic>
                  <Ic label="Viber" bg="#7360F2" open={open}>
                    <MessageCircle />
                  </Ic>
                </div>
                {/* page 2 */}
                <div className="grid w-full flex-none grid-cols-4 content-start gap-x-2.5 gap-y-[18px] px-[18px] pt-1.5">
                  <Ic
                    label="Instagram"
                    bg="linear-gradient(45deg,#f9ce34,#ee2a7b 50%,#6228d7)"
                    open={open}
                  >
                    <Instagram />
                  </Ic>
                  <Ic label="YouTube" bg="#ff0033" open={open}>
                    <Play />
                  </Ic>
                  <Ic
                    label="Banka"
                    bg="linear-gradient(#34c759,#1f8f3d)"
                    open={open}
                  >
                    <Landmark />
                  </Ic>
                  <Ic
                    label="Knjige"
                    bg="linear-gradient(#ff9f0a,#ff6b00)"
                    open={open}
                  >
                    <BookOpen />
                  </Ic>
                  <Ic
                    label="Podkasti"
                    bg="linear-gradient(#bf5af2,#8e2de2)"
                    open={open}
                  >
                    <Mic />
                  </Ic>
                  <Ic
                    label="Prevodilac"
                    bg="linear-gradient(#0a84ff,#0040a8)"
                    open={open}
                  >
                    <Languages />
                  </Ic>
                  <Ic label="Berza" bg="#111" color="#30d158" open={open}>
                    <TrendingUp />
                  </Ic>
                  <Ic
                    label="Kućni"
                    bg="linear-gradient(#ffb340,#ff8a00)"
                    open={open}
                  >
                    <Home />
                  </Ic>
                </div>
              </motion.div>
            </div>

            <div
              className="flex justify-center gap-[7px] py-3"
              role="tablist"
              aria-label="Stranice"
            >
              {Array.from({ length: PAGES }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={page === i}
                  aria-label={`Stranica ${i + 1}`}
                  onClick={() => snap(i)}
                  className="h-[7px] w-[7px] cursor-pointer rounded-full transition-colors before:absolute before:-inset-2 before:content-[''] relative"
                  style={{
                    background: page === i ? "#fff" : "rgba(255,255,255,0.4)",
                  }}
                />
              ))}
            </div>
            <div
              className="mb-1.5 grid grid-cols-4 gap-2.5 rounded-[30px] px-3 py-3.5"
              style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              <Ic
                name="Telefon"
                bg="linear-gradient(#5bf675,#2bc24a)"
                open={open}
              >
                <Phone />
              </Ic>
              <Ic
                name="Poruke"
                bg="linear-gradient(#4aa8ff,#1f6fe0)"
                open={open}
              >
                <MessageCircle />
              </Ic>
              <Ic name="Safari" bg="#fff" color="#0a84ff" open={open}>
                <Compass />
              </Ic>
              <Ic
                name="Kontakti"
                bg="linear-gradient(#b0b0b5,#7c7c81)"
                open={open}
              >
                <User />
              </Ic>
            </div>
          </motion.div>

          {/* ---------------- the open app ---------------- */}
          <motion.div
            className="absolute inset-0 z-[15]"
            style={{
              transformOrigin: origin,
              pointerEvents: inApp ? "auto" : "none",
            }}
            initial={false}
            animate={
              inApp ? { scale: 1, opacity: 1 } : { scale: 0.12, opacity: 0 }
            }
            transition={{
              scale: { duration: 0.45, ease: [0.2, 0.9, 0.25, 1] },
              opacity: { duration: 0.22 },
            }}
            aria-hidden={!inApp}
          >
            <motion.div
              className="relative h-full w-full overflow-hidden"
              style={{
                scale: followScale,
                borderRadius: followRadius,
                y: followY,
                background: "#F3F2EE",
              }}
            >
              {app === "neto" && (
                <div className="flex h-full flex-col pt-[54px] text-[#111]">
                  <div className="flex items-center gap-2.5 px-4 pb-3 pt-1.5">
                    <MiniLogo />
                    <div className="flex-1 leading-[1.15]">
                      <small
                        className="block text-[12px]"
                        style={{ color: MUTED }}
                      >
                        Dobro jutro
                      </small>
                      <b className="text-[17px]">Marija</b>
                    </div>
                    <motion.button
                      type="button"
                      aria-label="Obaveštenja"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSheet("notifs")}
                      className="relative grid h-[38px] w-[38px] cursor-pointer place-items-center rounded-full bg-white"
                    >
                      <Bell size={20} />
                      <i
                        className="absolute right-[9px] top-2 h-2 w-2 rounded-full"
                        style={{ background: RED }}
                      />
                    </motion.button>
                  </div>

                  <div
                    ref={body}
                    className="relative flex-1 overflow-y-auto px-4 pb-3.5"
                    style={{ touchAction: "pan-y" }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                      >
                        {tab === "home" && (
                          <HomeTab
                            inApp={inApp}
                            sel={sel}
                            onToggle={toggleSel}
                            say={say}
                            openSheet={setSheet}
                            fav={fav}
                          />
                        )}
                        {tab === "cat" && (
                          <CatTab
                            sel={sel}
                            onToggle={toggleSel}
                            openSheet={setSheet}
                          />
                        )}
                        {tab === "card" && (
                          <CardTab openSheet={setSheet} say={say} />
                        )}
                        {tab === "me" && (
                          <MeTab fav={fav} openSheet={setSheet} say={say} />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <nav
                    className="grid grid-cols-4 bg-white px-1.5 pb-[26px] pt-2"
                    style={{ borderTop: "1px solid #E4E2DC" }}
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
                      badge={sel.size}
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

                  {/* sheets */}
                  <AnimatePresence>
                    {sheet && (
                      <Sheet
                        key={sheet}
                        onClose={() => setSheet(null)}
                        title={sheetTitle(sheet)}
                      >
                        {sheet === "notifs" && <NotifsSheet />}
                        {sheet === "club" && <ClubSheet />}
                        {sheet === "store" && (
                          <StoreSheet
                            store={STORES[fav]}
                            say={say}
                            onClose={() => setSheet(null)}
                          />
                        )}
                        {sheet === "list" && (
                          <ListSheet
                            sel={sel}
                            onRemove={toggleSel}
                            onClear={() => {
                              setSel(new Set());
                              setSheet(null);
                              say("Lista obrisana");
                            }}
                          />
                        )}
                        {sheet === "favStore" && (
                          <FavStoreSheet
                            fav={fav}
                            onPick={(i) => {
                              setFav(i);
                              setSheet(null);
                              say("Omiljena radnja sačuvana");
                            }}
                          />
                        )}
                        {sheet === "wallet" && (
                          <WalletSheet
                            onDone={() => {
                              setSheet(null);
                              say("Kartica je u Wallet-u");
                            }}
                          />
                        )}
                      </Sheet>
                    )}
                  </AnimatePresence>

                  {/* toast */}
                  <AnimatePresence>
                    {toast && (
                      <motion.div
                        key={toast}
                        role="status"
                        className="pointer-events-none absolute left-1/2 top-[62px] z-40 whitespace-nowrap rounded-full bg-black px-4 py-2 text-[13px] font-bold text-white"
                        style={{ x: "-50%" }}
                        initial={{ y: -16, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -10, opacity: 0, scale: 0.95 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      >
                        {toast}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {app && app !== "neto" && <GenericApp app={app} />}
            </motion.div>
          </motion.div>

          {/* home bar: tap or swipe up to leave the app */}
          <motion.div
            className="absolute inset-x-0 bottom-0 z-40 flex h-9 cursor-pointer items-end justify-center pb-2"
            drag={inApp ? "y" : false}
            dragConstraints={{ top: -160, bottom: 0 }}
            dragElastic={0.05}
            dragMomentum={false}
            style={{ y: hy }}
            onDragEnd={onHomeEnd}
            onTap={() => inApp && close()}
            role="button"
            aria-label="Nazad na početni ekran"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                close();
              }
            }}
          >
            <span
              className="block h-[5px] w-[134px] rounded-[3px] transition-colors duration-300"
              style={{ background: inApp ? "#111" : "#fff" }}
            />
          </motion.div>
        </div>
      </div>
      <p className="mt-5 text-center text-[13px]" style={{ color: "#8A8A8A" }}>
        Dodirnite Neto ikonicu ili obaveštenje. Prevucite stranice, prevucite
        traku na dnu nagore da izađete iz aplikacije.
      </p>
    </div>
  );
}

/* ---------------- home screen bits ---------------- */

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

/* An icon you can press. A tap opens, a drag on the pager does not. */
function IconBtn({
  children,
  onOpen,
  label,
  className = "",
  style,
}: {
  children: ReactNode;
  onOpen: (el: HTMLElement) => void;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.88 }}
      onTap={(e) => onOpen(e.currentTarget as HTMLElement)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(e.currentTarget as HTMLElement);
        }
      }}
      className={`cursor-pointer ${className}`}
      style={style}
    >
      {children}
    </motion.button>
  );
}

function Ic({
  children,
  label,
  name,
  bg,
  color = "#fff",
  open,
}: {
  children: ReactNode;
  label?: string;
  name?: string;
  bg: string;
  color?: string;
  open: (which: App, el?: HTMLElement | null) => void;
}) {
  const title = label ?? name ?? "";
  return (
    <Cell label={label}>
      <IconBtn
        label={`Otvori ${title}`}
        onOpen={(el) => open({ label: title, bg, color, icon: children }, el)}
        className="grid h-[60px] w-[60px] place-items-center rounded-[15px] [&>svg]:h-8 [&>svg]:w-8"
        style={{
          background: bg,
          color,
          boxShadow: "0 4px 10px rgba(0,0,0,.25)",
        }}
      >
        {children}
      </IconBtn>
    </Cell>
  );
}

function CalendarGlyph() {
  return (
    <span className="flex flex-col items-center leading-none">
      <small className="text-[10px] font-bold text-[#ff3b30]">PET</small>
      <b className="text-[28px] font-normal text-[#111]">25</b>
    </span>
  );
}

function PhotosGlyph() {
  return (
    <span
      className="block h-10 w-10 rounded-full"
      style={{
        background:
          "conic-gradient(#ff9500,#ffcc00,#34c759,#5ac8fa,#007aff,#af52de,#ff2d55,#ff9500)",
        WebkitMask: "radial-gradient(circle,transparent 6px,#000 7px)",
        mask: "radial-gradient(circle,transparent 6px,#000 7px)",
      }}
    />
  );
}

/* Any app that isn't Neto: a plausible, empty iOS screen, so every icon
   does something and the home bar has something to leave. */
function GenericApp({ app }: { app: Generic }) {
  const rows = ["Danas", "Juče", "Ove nedelje", "Ranije"];
  return (
    <div
      className="flex h-full flex-col pt-[58px] text-[#111]"
      style={{ background: "#F2F2F7" }}
    >
      <div className="flex items-center gap-3 px-4 pb-3">
        <span
          className="grid h-11 w-11 place-items-center rounded-[12px] [&>svg]:h-6 [&>svg]:w-6"
          style={{
            background: app.bg,
            color: app.color,
            boxShadow: "0 3px 8px rgba(0,0,0,.15)",
          }}
        >
          {app.icon}
        </span>
        <b className="text-[26px] font-bold tracking-[-0.02em]">{app.label}</b>
      </div>
      <div className="mx-4 rounded-[14px] bg-white">
        {rows.map((r, i) => (
          <div
            key={r}
            className="flex items-center gap-3 px-3.5 py-3 text-[15px]"
            style={{ borderTop: i ? "1px solid #E5E5EA" : undefined }}
          >
            <span
              className="h-9 w-9 rounded-[10px]"
              style={{ background: "#E5E5EA" }}
            />
            <span className="flex-1">
              <span className="block font-semibold">{r}</span>
              <span
                className="mt-1 block h-2 w-2/3 rounded-full"
                style={{ background: "#E5E5EA" }}
              />
            </span>
            <ChevronRight size={16} style={{ color: "#C7C7CC" }} />
          </div>
        ))}
      </div>
      <p
        className="mt-6 px-8 text-center text-[13px]"
        style={{ color: "#8E8E93" }}
      >
        Ovo je samo iOS okvir. Demo prikazuje Neto aplikaciju: prevucite nagore
        i dodirnite Neto.
      </p>
    </div>
  );
}

/* ---------------- Neto app bits ---------------- */

function TabBtn({
  on,
  onClick,
  icon,
  label,
  badge = 0,
}: {
  on: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className="relative flex cursor-pointer flex-col items-center gap-[3px] py-1 text-[10px] font-bold transition-colors"
      style={{ color: on ? RED : "#9A9A9A", fontFamily: DISPLAY }}
    >
      {icon}
      {label}
      <AnimatePresence>
        {badge > 0 && (
          <motion.em
            key="b"
            className="absolute left-1/2 top-0 ml-1.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] not-italic text-white"
            style={{ background: RED }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            {badge}
          </motion.em>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function H({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 mt-4 text-[17px] font-extrabold italic">{children}</p>
  );
}

/* A bottom sheet: slides up, drags down to dismiss, backdrop tap closes. */
function Sheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <>
      <motion.div
        className="absolute inset-0 z-30 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onTap={onClose}
      />
      <motion.div
        role="dialog"
        aria-label={title}
        className="absolute inset-x-0 bottom-0 z-[35] max-h-[78%] overflow-hidden rounded-t-[22px] bg-white text-[#111]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 36 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.02, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 70 || info.velocity.y > 400) onClose();
        }}
      >
        <div className="flex items-center justify-between px-4 pb-2 pt-2.5">
          <span
            aria-hidden
            className="absolute left-1/2 top-1.5 h-1 w-9 -translate-x-1/2 rounded-full"
            style={{ background: "#D1D1D6" }}
          />
          <b className="mt-2 text-[17px] font-extrabold italic">{title}</b>
          <motion.button
            type="button"
            aria-label="Zatvori"
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="mt-2 grid h-7 w-7 cursor-pointer place-items-center rounded-full"
            style={{ background: "#F2F2F7", color: "#6b6b6b" }}
          >
            <X size={14} strokeWidth={2.5} />
          </motion.button>
        </div>
        <div className="overflow-y-auto px-4 pb-8" style={{ maxHeight: 440 }}>
          {children}
        </div>
      </motion.div>
    </>
  );
}

function sheetTitle(s: Exclude<SheetKind, null>) {
  return {
    notifs: "Obaveštenja",
    club: "Neto Klub",
    store: "Tvoj Neto",
    list: "Lista za kupovinu",
    favStore: "Omiljena radnja",
    wallet: "Apple Wallet",
  }[s];
}

function Row({
  children,
  onClick,
  last = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  last?: boolean;
}) {
  const Tag = onClick ? motion.button : motion.div;
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      whileTap={
        onClick ? { scale: 0.985, backgroundColor: "#F2F2F7" } : undefined
      }
      className={`flex w-full items-center gap-3 px-3.5 py-3 text-left text-[14px] ${onClick ? "cursor-pointer" : ""}`}
      style={{
        borderBottom: last ? undefined : "1px solid #E4E2DC",
        fontFamily: DISPLAY,
      }}
    >
      {children}
    </Tag>
  );
}

function HomeTab({
  inApp,
  sel,
  onToggle,
  say,
  openSheet,
  fav,
}: {
  inApp: boolean;
  sel: Set<number>;
  onToggle: (i: number) => void;
  say: (m: string) => void;
  openSheet: (s: SheetKind) => void;
  fav: number;
}) {
  const copy = () => {
    try {
      void navigator.clipboard?.writeText("MARIJA-5N7");
    } catch {
      /* the toast is the point */
    }
    say("Kod kopiran");
  };
  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => openSheet("club")}
        className="relative block w-full cursor-pointer overflow-hidden p-4 text-left text-white"
        style={{
          background: RED,
          borderRadius: "8px 24px 8px 8px",
          fontFamily: DISPLAY,
        }}
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
        <span className="flex items-center justify-between text-[12px]">
          Još 260 poena do vaučera od 500 din
          <ChevronRight size={14} />
        </span>
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={copy}
        className="mt-2.5 flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-[14px] bg-white px-3.5 py-3 text-left"
        style={{ border: `2px dashed ${RED}`, fontFamily: DISPLAY }}
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
          className="flex items-center gap-2 text-right text-[11px] font-bold leading-[1.25]"
          style={{ color: RED }}
        >
          <span className="max-w-[9ch]">+5% na sledeću kupovinu</span>
          <Copy size={16} />
        </span>
      </motion.button>

      <H>Akcija nedelje</H>
      <div
        className="-mx-4 flex gap-[9px] overflow-x-auto px-4 pb-1"
        style={{ scrollSnapType: "x mandatory", touchAction: "pan-x" }}
      >
        {PRODUCTS.map((p, i) => {
          const on = sel.has(i);
          return (
            <motion.button
              key={p.name}
              type="button"
              aria-pressed={on}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                onToggle(i);
                say(on ? "Sklonjeno sa liste" : "Dodato na listu");
              }}
              className="relative w-28 flex-none cursor-pointer bg-white p-2 text-left"
              style={{
                borderRadius: "14px 14px 14px 4px",
                scrollSnapAlign: "start",
                border: `2px solid ${on ? RED : "transparent"}`,
                fontFamily: DISPLAY,
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
            </motion.button>
          );
        })}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => openSheet("store")}
        className="mt-3.5 flex w-full cursor-pointer items-center gap-2.5 bg-black px-3 py-2.5 text-left text-white"
        style={{ borderRadius: "8px 18px 8px 8px", fontFamily: DISPLAY }}
      >
        <span
          className="grid h-[34px] w-[34px] flex-none place-items-center rounded-full"
          style={{ background: RED }}
        >
          <Pin size={18} />
        </span>
        <div className="flex-1">
          <small className="block text-[11px]" style={{ color: "#FF8A84" }}>
            Tvoj Neto
          </small>
          <b className="block text-[14px]">{STORES[fav]}</b>
          <em className="text-[11px] not-italic" style={{ color: "#BDBDBD" }}>
            Otvoreno do 21h
          </em>
        </div>
        <ChevronRight size={16} style={{ color: "#BDBDBD" }} />
      </motion.button>
    </>
  );
}

function CatTab({
  sel,
  onToggle,
  openSheet,
}: {
  sel: Set<number>;
  onToggle: (i: number) => void;
  openSheet: (s: SheetKind) => void;
}) {
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
            onToggle={() => onToggle(i)}
          />
        ))}
      </div>
      <motion.button
        type="button"
        whileTap={n ? { scale: 0.98 } : undefined}
        onClick={() => n && openSheet("list")}
        className={`sticky bottom-0 mt-2.5 w-full rounded-[12px] bg-black px-3.5 py-[11px] text-center text-[13px] font-bold text-white ${n ? "cursor-pointer" : ""}`}
        style={{ fontFamily: DISPLAY }}
      >
        {n
          ? `Lista za kupovinu: ${n} ${word} · štediš ${sv} din`
          : "Dodaj proizvode na listu za kupovinu"}
      </motion.button>
    </>
  );
}

function CardTab({
  openSheet,
  say,
}: {
  openSheet: (s: SheetKind) => void;
  say: (m: string) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <>
      <motion.button
        type="button"
        aria-label="Klub kartica, dodirni da okreneš"
        onClick={() => setFlipped((f) => !f)}
        whileTap={{ scale: 0.98 }}
        className="mt-2 block w-full cursor-pointer"
        style={{ perspective: 900, fontFamily: DISPLAY }}
      >
        <motion.div
          className="relative aspect-[1.6] w-full"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute inset-0 flex flex-col justify-between rounded-[18px] p-[18px] text-left text-white"
            style={{
              background: "linear-gradient(135deg,#E2231A,#9E120B)",
              boxShadow: "0 14px 30px -12px rgba(226,35,26,.6)",
              backfaceVisibility: "hidden",
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
          <div
            className="absolute inset-0 flex flex-col justify-between rounded-[18px] bg-[#111] p-[18px] text-left text-white"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
            }}
          >
            <div className="-mx-[18px] mt-1 h-9 bg-black" />
            <div className="rounded-[8px] bg-white/10 p-2.5 text-[12px] leading-[1.35]">
              Kartica važi u svim Neto radnjama. Poeni se obračunavaju na kasi.
            </div>
            <span
              className="text-[11px]"
              style={{ color: "#9A9A9A", fontFamily: MONO }}
            >
              ČLAN OD 2026 · ID 5N7
            </span>
          </div>
        </motion.div>
      </motion.button>
      <p className="my-3 text-center text-[13px]" style={{ color: MUTED }}>
        Pokaži karticu na kasi i skupljaj poene. Dodirni karticu da je okreneš.
      </p>
      <div className="grid grid-cols-2 gap-[9px]">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => say("Ušteda od 1. januara")}
          className="cursor-pointer rounded-[14px] bg-white p-3 text-left"
          style={{ fontFamily: DISPLAY }}
        >
          <small className="block text-[11px]" style={{ color: MUTED }}>
            Ušteda ove godine
          </small>
          <b className="text-[22px] font-black italic" style={{ color: RED }}>
            8.450 din
          </b>
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => say("12 kupovina u septembru")}
          className="cursor-pointer rounded-[14px] bg-white p-3 text-left"
          style={{ fontFamily: DISPLAY }}
        >
          <small className="block text-[11px]" style={{ color: MUTED }}>
            Kupovina ovog meseca
          </small>
          <b className="text-[22px] font-black italic" style={{ color: RED }}>
            12
          </b>
        </motion.button>
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => openSheet("wallet")}
        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-black py-3 text-[14px] font-bold text-white"
        style={{ fontFamily: DISPLAY }}
      >
        <Wallet size={18} />
        Dodaj u Apple Wallet
      </motion.button>
    </>
  );
}

function Toggle({
  label,
  initial,
  say,
}: {
  label: string;
  initial: boolean;
  say: (m: string) => void;
}) {
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
        onChange={() => {
          setOn((v) => !v);
          say(on ? `${label}: isključeno` : `${label}: uključeno`);
        }}
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

function MeTab({
  fav,
  openSheet,
  say,
}: {
  fav: number;
  openSheet: (s: SheetKind) => void;
  say: (m: string) => void;
}) {
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
        <Toggle label="Akcija nedelje" initial say={say} />
        <Toggle label="Novi proizvodi" initial say={say} />
        <Toggle label="Nove radnje u blizini" initial={false} say={say} />
      </div>
      <H>Omiljena radnja</H>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => openSheet("favStore")}
        className="flex w-full cursor-pointer items-center justify-between rounded-[14px] bg-white px-3.5 py-[13px] text-left text-[14px] font-bold"
        style={{ fontFamily: DISPLAY }}
      >
        {STORES[fav]}
        <ChevronRight size={16} style={{ color: "#BDBDBD" }} />
      </motion.button>
      <H>Nalog</H>
      <div className="overflow-hidden rounded-[16px] bg-white">
        {[
          ["Lični podaci", "Ime, telefon, e-mail"],
          ["Istorija kupovina", "12 ovog meseca"],
          ["Pomoć i podrška", "Viber ili poziv"],
        ].map(([k, v], i, arr) => (
          <Row
            key={k}
            onClick={() => say(`${k}: uskoro`)}
            last={i === arr.length - 1}
          >
            <span className="flex-1">
              <b className="block">{k}</b>
              <small style={{ color: MUTED }}>{v}</small>
            </span>
            <ChevronRight size={16} style={{ color: "#BDBDBD" }} />
          </Row>
        ))}
      </div>
    </>
  );
}

/* ---------------- sheets ---------------- */

function NotifsSheet() {
  const items = [
    ["Nova akcija nedelje je stigla!", "Mleko 129 din, kafa 339 din.", "sada"],
    ["Skupila si 1.240 poena", "Još 260 do vaučera od 500 din.", "juče"],
    ["Tvoj kod MARIJA-5N7 je aktivan", "+5% na sledeću kupovinu.", "pon"],
  ];
  return (
    <div
      className="overflow-hidden rounded-[14px]"
      style={{ background: "#F7F6F2" }}
    >
      {items.map(([t, s, w], i) => (
        <Row key={t} last={i === items.length - 1}>
          <span
            className="grid h-9 w-9 flex-none place-items-center rounded-[10px]"
            style={{ background: RED }}
          >
            <span className="-rotate-[4deg] text-[10px] font-black italic text-white">
              Neto
            </span>
          </span>
          <span className="flex-1">
            <b className="block">{t}</b>
            <small style={{ color: MUTED }}>{s}</small>
          </span>
          <small style={{ color: MUTED }}>{w}</small>
        </Row>
      ))}
    </div>
  );
}

function ClubSheet() {
  const rows: [string, string, number][] = [
    ["Kupovina, Bulevar oslobođenja", "23. sep", 120],
    ["Kod iskorišćen na kasi", "23. sep", 50],
    ["Kupovina, Bulevar oslobođenja", "19. sep", 210],
    ["Vaučer 500 din iskorišćen", "12. sep", -500],
  ];
  return (
    <>
      <div
        className="mb-3 flex items-end justify-between rounded-[14px] p-3.5 text-white"
        style={{ background: RED }}
      >
        <div>
          <small className="text-[11px] opacity-90">Stanje</small>
          <b className="block text-[28px] font-black italic leading-none">
            1.240
          </b>
        </div>
        <small className="text-[12px]">10 din = 1 poen</small>
      </div>
      <div
        className="overflow-hidden rounded-[14px]"
        style={{ background: "#F7F6F2" }}
      >
        {rows.map(([t, d, p], i) => (
          <Row key={t + d} last={i === rows.length - 1}>
            <span className="flex-1">
              <b className="block">{t}</b>
              <small style={{ color: MUTED }}>{d}</small>
            </span>
            <b style={{ color: p > 0 ? "#1f8f3d" : RED }}>
              {p > 0 ? "+" : ""}
              {p}
            </b>
          </Row>
        ))}
      </div>
    </>
  );
}

function StoreSheet({
  store,
  say,
  onClose,
}: {
  store: string;
  say: (m: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className="relative mb-3 h-[120px] overflow-hidden rounded-[14px]"
        style={{ background: "#E8ECEF" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(#fff 2px, transparent 2px), linear-gradient(90deg, #fff 2px, transparent 2px)",
            backgroundSize: "34px 34px",
          }}
        />
        <div
          aria-hidden
          className="absolute left-0 right-0 top-[54px] h-3 bg-white"
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-[120px] top-0 w-3 bg-white"
        />
        <motion.span
          className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center text-white"
          style={{ background: RED, borderRadius: "50% 50% 50% 12%" }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Pin size={22} />
        </motion.span>
      </div>
      <b className="block text-[16px]">{store}</b>
      <small className="block" style={{ color: MUTED }}>
        Otvoreno svaki dan 7 do 21 · 650 m od tebe
      </small>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            onClose();
            say("Otvaram navigaciju");
          }}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-[12px] py-3 text-[14px] font-bold text-white"
          style={{ background: RED, fontFamily: DISPLAY }}
        >
          <Navigation size={16} />
          Navigacija
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => say("Pozivam radnju")}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-[12px] py-3 text-[14px] font-bold"
          style={{ background: "#F2F2F7", fontFamily: DISPLAY }}
        >
          <Phone size={16} />
          Pozovi
        </motion.button>
      </div>
    </>
  );
}

function ListSheet({
  sel,
  onRemove,
  onClear,
}: {
  sel: Set<number>;
  onRemove: (i: number) => void;
  onClear: () => void;
}) {
  const items = PRODUCTS.map((p, i) => ({ p, i })).filter(({ i }) =>
    sel.has(i),
  );
  const total = items.reduce((a, { p }) => a + p.now, 0);
  const save = items.reduce((a, { p }) => a + p.was - p.now, 0);
  if (!items.length)
    return (
      <p className="py-6 text-center text-[14px]" style={{ color: MUTED }}>
        Lista je prazna.
      </p>
    );
  return (
    <>
      <div
        className="overflow-hidden rounded-[14px]"
        style={{ background: "#F7F6F2" }}
      >
        <AnimatePresence initial={false}>
          {items.map(({ p, i }, k) => (
            <motion.div
              key={p.name}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Row last={k === items.length - 1}>
                <span
                  className="grid h-10 w-10 flex-none place-items-center rounded-[10px] [&>svg]:h-8 [&>svg]:w-8"
                  style={{ background: p.tint }}
                >
                  <p.Icon />
                </span>
                <span className="flex-1">
                  <b className="block">{p.name}</b>
                  <small style={{ color: MUTED }}>{p.size}</small>
                </span>
                <b style={{ color: RED }}>{p.now}</b>
                <motion.button
                  type="button"
                  aria-label={`Ukloni ${p.name}`}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => onRemove(i)}
                  className="grid h-8 w-8 cursor-pointer place-items-center rounded-full"
                  style={{ background: "#fff", color: MUTED }}
                >
                  <Trash2 size={15} />
                </motion.button>
              </Row>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="mt-3 flex justify-between text-[14px]">
        <span style={{ color: MUTED }}>Ukupno</span>
        <b>{fmt(total)} din</b>
      </div>
      <div className="mt-1 flex justify-between text-[14px]">
        <span style={{ color: MUTED }}>Štediš</span>
        <b style={{ color: RED }}>{fmt(save)} din</b>
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onClear}
        className="mt-3 w-full cursor-pointer rounded-[12px] py-3 text-[14px] font-bold"
        style={{ background: "#F2F2F7", color: RED, fontFamily: DISPLAY }}
      >
        Obriši listu
      </motion.button>
    </>
  );
}

function FavStoreSheet({
  fav,
  onPick,
}: {
  fav: number;
  onPick: (i: number) => void;
}) {
  return (
    <div
      className="overflow-hidden rounded-[14px]"
      style={{ background: "#F7F6F2" }}
    >
      {STORES.map((s, i) => (
        <Row key={s} onClick={() => onPick(i)} last={i === STORES.length - 1}>
          <span
            className="grid h-5 w-5 flex-none place-items-center rounded-full"
            style={{ border: `2px solid ${i === fav ? RED : "#C7C7CC"}` }}
          >
            {i === fav && (
              <span
                className="block h-2.5 w-2.5 rounded-full"
                style={{ background: RED }}
              />
            )}
          </span>
          <span className="flex-1 font-semibold">{s}</span>
        </Row>
      ))}
    </div>
  );
}

function WalletSheet({ onDone }: { onDone: () => void }) {
  return (
    <>
      <div
        className="mx-auto mt-1 aspect-[1.6] w-[78%] rounded-[14px] p-3.5 text-white"
        style={{ background: "linear-gradient(135deg,#E2231A,#9E120B)" }}
      >
        <MiniLogo invert className="!text-[15px]" />
        <b className="mt-6 block text-[15px]">Marija Petrović</b>
        <span className="text-[11px]" style={{ fontFamily: MONO }}>
          2045 1180 7736
        </span>
      </div>
      <p className="mt-4 text-center text-[13px]" style={{ color: MUTED }}>
        Kartica će biti dostupna sa zaključanog ekrana, dvostrukim klikom na
        bočno dugme.
      </p>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onDone}
        className="mt-4 w-full cursor-pointer rounded-[12px] bg-black py-3 text-[14px] font-bold text-white"
        style={{ fontFamily: DISPLAY }}
      >
        Dodaj
      </motion.button>
    </>
  );
}
