"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useMotionValue,
} from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarCheck } from "lucide-react";

/* --- Palette -------------------------------------------------------------
   Ciklon's own colours from the old site (boje.txt): the logo's blue and
   green, the cream background. Navy is ours, so the water reads at night. */
export const BLUE = "#52C1EA";
export const BLUE_DEEP = "#1592C4";
export const GREEN = "#78BF42";
export const CREAM = "#FFF9E3";
export const NAVY = "#071521";
export const GRAD = `linear-gradient(100deg, ${BLUE}, ${GREEN})`;

export const DISPLAY = "var(--font-ck), system-ui, sans-serif";
/* Small labels share the face; uppercase and tracking set them apart. */
export const MONO = DISPLAY;

export const PHONE = "381631012474";
export const wa = (text: string) =>
  `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;

export type Theme = "dark" | "light" | "cream";

type Palette = {
  bg: string;
  fg: string;
  muted: string;
  line: string;
  card: string;
  hl: string;
};

export const THEMES: Record<Theme, Palette> = {
  dark: {
    bg: NAVY,
    fg: "#ffffff",
    muted: "#A9BCCB",
    line: "rgba(255,255,255,0.12)",
    card: "#0E2233",
    hl: BLUE,
  },
  light: {
    bg: "#ffffff",
    fg: "#0B1B26",
    muted: "#5B6B77",
    line: "#E3E9EE",
    card: "#F3F7FA",
    hl: BLUE_DEEP,
  },
  cream: {
    bg: CREAM,
    fg: "#0B1B26",
    muted: "#62625A",
    line: "#EDE5C8",
    card: "#ffffff",
    hl: BLUE_DEEP,
  },
};

/* --- Motion -------------------------------------------------------------- */
export const EASE_OUT = [0.2, 0.8, 0.2, 1] as const;

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.03 } },
};

export const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 170, damping: 24 },
  },
};

export const pop = {
  hidden: { opacity: 0, y: 24, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 220, damping: 20 },
  },
};

/* --- Contexts ------------------------------------------------------------ */
const ActiveContext = createContext(false);
export const useSlideActive = () => useContext(ActiveContext);

const ThemeContext = createContext<Theme>("dark");
export const useTheme = () => THEMES[useContext(ThemeContext)];

const PositionContext = createContext({ index: 0, total: 0, label: "" });

/* A slide never scrolls: a column taller than the stage is zoomed out
   until it fits (same trick as the Neto decks). */
const MIN_FIT = 0.6;

function Fit({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useLayoutEffect(() => {
    const el = box.current;
    const stage = el?.closest<HTMLElement>("[data-stage]");
    const section = el?.closest<HTMLElement>("[data-slide]");
    if (!el || !stage || !section) return;
    let current = 1;
    let stageH = stage.clientHeight;

    const measure = () => {
      if (stage.clientHeight !== stageH) {
        stageH = stage.clientHeight;
        if (current !== 1) {
          current = 1;
          setZoom(1);
          return;
        }
      }
      const cs = getComputedStyle(section);
      const room =
        stageH - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const h = el.getBoundingClientRect().height;
      if (h <= room + 1) return;
      const next = Math.max(
        MIN_FIT,
        Math.floor(((current * room) / h) * 100) / 100,
      );
      if (next < current) {
        current = next;
        setZoom(next);
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className="w-full" style={{ zoom }}>
      {children}
    </div>
  );
}

/* The deck wraps each slide in this, so a slide component can read its
   theme and "active" before it renders <Slide>. */
function SlideScope({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(r);
  }, []);
  return (
    <ThemeContext.Provider value={theme}>
      <ActiveContext.Provider value={active}>{children}</ActiveContext.Provider>
    </ThemeContext.Provider>
  );
}

export function Slide({
  children,
  eyebrow = true,
  backdrop,
  wide = false,
}: {
  theme?: Theme;
  children: ReactNode;
  eyebrow?: boolean;
  backdrop?: ReactNode;
  /* Photo and screenshot slides use more of a big screen. */
  wide?: boolean;
}) {
  const t = useTheme();
  return (
    <section
      data-slide
      className="relative flex min-h-full flex-col justify-center overflow-hidden px-5 py-6 md:px-10 md:py-12"
      style={{ background: t.bg, color: t.fg, fontFamily: DISPLAY }}
    >
      {backdrop}
      <Fit>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className={`relative mx-auto flex w-full flex-col ${wide ? "max-w-[min(92rem,100%)]" : "max-w-6xl"}`}
        >
          {eyebrow && <Eyebrow />}
          {children}
        </motion.div>
      </Fit>
    </section>
  );
}

function Eyebrow() {
  const { index, total, label } = useContext(PositionContext);
  const t = useTheme();
  return (
    <motion.p
      variants={item}
      className="mb-4 flex items-center gap-2.5 text-[10px] uppercase tracking-[0.16em] md:mb-6 md:text-[11px]"
      style={{ fontFamily: MONO }}
    >
      <span className="font-semibold" style={{ color: t.hl }}>
        {String(index + 1).padStart(2, "0")} / {total}
      </span>
      <span aria-hidden className="h-px w-6" style={{ background: t.line }} />
      <span className="truncate" style={{ color: t.muted }}>
        {label}
      </span>
    </motion.p>
  );
}

/* --- Headline ------------------------------------------------------------
   Big, heavy, word by word. Words in [[ ]] take the blue-to-green of the
   Ciklon logo. */
export function Headline({
  children,
  size = "md",
  center = false,
}: {
  children: string;
  size?: "md" | "lg" | "xl";
  center?: boolean;
}) {
  const active = useSlideActive();
  const parts = children.split(/(\[\[.*?\]\])/g).filter(Boolean);
  const cls =
    size === "xl"
      ? "text-[clamp(2.6rem,11vw,6.2rem)] leading-[0.98]"
      : size === "lg"
        ? "text-[clamp(2.2rem,9vw,4.8rem)] leading-[1.0]"
        : "text-[clamp(1.85rem,7vw,3.4rem)] leading-[1.04]";

  let n = 0;
  return (
    <h1
      className={`max-w-5xl font-extrabold tracking-[-0.025em] ${center ? "mx-auto text-center" : ""} ${cls}`}
    >
      {parts.map((part, p) => {
        const hit = part.startsWith("[[");
        const text = hit ? part.slice(2, -2) : part;
        return text.split(/(\s+)/).map((word, w) => {
          if (!word.trim()) return <span key={`${p}-${w}`}>{word}</span>;
          const i = n++;
          return (
            <span
              key={`${p}-${w}`}
              className="relative inline-block overflow-hidden pb-[0.08em] pr-[0.06em] align-bottom"
            >
              <motion.span
                className="inline-block"
                initial={{ y: "110%" }}
                animate={{ y: active ? 0 : "110%" }}
                transition={{
                  delay: 0.06 + i * 0.035,
                  type: "spring",
                  stiffness: 200,
                  damping: 24,
                }}
                style={
                  hit
                    ? {
                        backgroundImage: GRAD,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }
                    : undefined
                }
              >
                {word}
              </motion.span>
            </span>
          );
        });
      })}
    </h1>
  );
}

export function Sub({
  children,
  center = false,
}: {
  children: ReactNode;
  center?: boolean;
}) {
  const t = useTheme();
  return (
    <motion.p
      variants={item}
      className={`mt-4 max-w-2xl text-[clamp(1rem,3.6vw,1.2rem)] leading-relaxed md:mt-5 ${center ? "mx-auto text-center" : ""}`}
      style={{ color: t.muted }}
    >
      {children}
    </motion.p>
  );
}

export function Visual({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={item} className={`mt-7 md:mt-9 ${className}`}>
      {children}
    </motion.div>
  );
}

export function Count({
  to,
  suffix = "",
  duration = 1.5,
  delay = 0,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  const active = useSlideActive();
  const ref = useRef<HTMLSpanElement>(null);
  const format = useCallback(
    (v: number) => Math.round(v).toLocaleString("de-DE") + suffix,
    [suffix],
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!active) {
      node.textContent = format(0);
      return;
    }
    const c = animate(0, to, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = format(v);
      },
    });
    return () => c.stop();
  }, [active, to, duration, delay, format]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      {format(0)}
    </span>
  );
}

/* --- Deck ----------------------------------------------------------------
   One slide at a time, sliding in from the side you are heading towards.
   Keys, swipe and the bottom bar move between slides. */
export type DeckSlide = {
  id: string;
  label: string;
  theme: Theme;
  Component: () => React.JSX.Element;
};

const enter = {
  hidden: (dir: number) => ({ opacity: 0, x: dir * 32 }),
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.32, ease: [0.2, 0.7, 0.3, 1] as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -24,
    transition: { duration: 0.15, ease: "easeIn" as const },
  }),
};

export function Deck({
  slides,
  fontClass = "",
  contact,
}: {
  slides: DeckSlide[];
  fontClass?: string;
  contact: string;
}) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const sx = useMotionValue(0);
  const touch = useRef<{ x: number; y: number; on: boolean } | null>(null);

  const goTo = useCallback(
    (i: number) => {
      setIndex((prev) => {
        const next = Math.max(0, Math.min(i, slides.length - 1));
        if (next !== prev) setDir(next > prev ? 1 : -1);
        return next;
      });
    },
    [slides.length],
  );

  /* #5 in the address opens the fifth slide; the hash follows along. The
     deck waits for that read, so a deep link never flashes the cover. */
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const m = /^#(\d+)$/.exec(window.location.hash);
    if (m) setIndex(Math.max(0, Math.min(Number(m[1]) - 1, slides.length - 1)));
    setReady(true);
  }, [slides.length]);

  useEffect(() => {
    if (ready) window.history.replaceState(null, "", `#${index + 1}`);
  }, [index, ready]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName ?? "";
      if (/^(INPUT|TEXTAREA)$/.test(tag)) return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        goTo(index + 1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        goTo(index - 1);
      } else if (e.key === "Home") goTo(0);
      else if (e.key === "End") goTo(slides.length - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo, slides.length]);

  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    if ((e.target as HTMLElement).closest("input, textarea")) return;
    touch.current = { x: e.clientX, y: e.clientY, on: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const s = touch.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.on) {
      if (Math.abs(dx) < 10) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.3) {
        touch.current = null;
        return;
      }
      s.on = true;
    }
    sx.set(dx * 0.6);
  };
  const onUp = (e: React.PointerEvent) => {
    const s = touch.current;
    touch.current = null;
    if (!s?.on) return;
    const dx = e.clientX - s.x;
    animate(sx, 0, { type: "spring", stiffness: 500, damping: 40 });
    if (Math.abs(dx) > 70) goTo(index + (dx < 0 ? 1 : -1));
  };

  if (!ready)
    return (
      <div
        className={`fixed inset-0 z-[200] ${fontClass}`}
        style={{ background: NAVY }}
      />
    );

  const last = index === slides.length - 1;
  const current = slides[index];
  const Current = current.Component;
  const t = THEMES[current.theme];
  const light = current.theme !== "dark";

  return (
    <MotionConfig reducedMotion="user">
      <div
        lang="sr-Latn"
        className={`fixed inset-0 z-[200] flex flex-col overflow-hidden ${fontClass}`}
        style={{ fontFamily: DISPLAY, background: NAVY }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-30 h-[3px]"
          style={{
            background: light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.1)",
          }}
        >
          <div
            className="h-full transition-[width] duration-500 ease-out"
            style={{
              width: `${((index + 1) / slides.length) * 100}%`,
              background: GRAD,
            }}
          />
        </div>

        <nav
          aria-label="Slajdovi"
          className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-1.5 lg:flex"
        >
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-label={`Idi na ${s.label}`}
              aria-current={i === index ? "true" : undefined}
              className="group flex items-center gap-2 py-0.5 pl-2"
            >
              <span
                className="whitespace-nowrap text-[10px] uppercase opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  fontFamily: MONO,
                  letterSpacing: "0.12em",
                  color: t.muted,
                }}
              >
                {s.label}
              </span>
              <span
                className="h-[3px] rounded-full transition-all duration-300"
                style={{
                  width: i === index ? 22 : 10,
                  background:
                    i === index
                      ? t.hl
                      : light
                        ? "rgba(0,0,0,0.18)"
                        : "rgba(255,255,255,0.28)",
                }}
              />
            </button>
          ))}
        </nav>

        <div
          className="relative min-h-0 flex-1 transition-colors duration-300"
          style={{ background: t.bg, touchAction: "pan-y pinch-zoom" }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <motion.div className="absolute inset-0" style={{ x: sx }}>
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.div
                key={current.id}
                custom={dir}
                variants={enter}
                initial="hidden"
                animate="show"
                exit="exit"
                data-stage
                className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain lg:pr-10"
              >
                <PositionContext.Provider
                  value={{ index, total: slides.length, label: current.label }}
                >
                  <SlideScope theme={current.theme}>
                    <Current />
                  </SlideScope>
                </PositionContext.Provider>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        <div
          className="relative z-40 shrink-0 border-t"
          style={{
            background: NAVY,
            borderColor: "rgba(255,255,255,0.1)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3 md:px-10">
            {!last && (
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[10px] uppercase md:text-[11px]"
                  style={{
                    fontFamily: MONO,
                    letterSpacing: "0.14em",
                    color: "#7C93A5",
                  }}
                >
                  {String(index + 1).padStart(2, "0")} / {slides.length}
                </p>
                <p className="truncate text-[13px] font-bold text-white md:text-sm">
                  {current.label}
                </p>
              </div>
            )}
            <button
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              aria-label="Prethodni slajd"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold text-white transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-25"
              style={{ border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Nazad</span>
            </button>
            {last ? (
              <a
                href={contact}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[15px] font-extrabold text-[#071521] transition-transform hover:-translate-y-0.5 active:scale-[0.98] md:py-4 md:text-[17px]"
                style={{ background: GRAD }}
              >
                <CalendarCheck size={18} />
                Zakaži sastanak
              </a>
            ) : (
              <button
                onClick={() => goTo(index + 1)}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-extrabold text-[#071521] transition-transform hover:-translate-y-0.5 active:scale-[0.98] md:py-3 md:text-[15px]"
                style={{ background: GRAD }}
              >
                Dalje
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
