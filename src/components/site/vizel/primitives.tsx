"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, useInView, animate } from "framer-motion";

/* Phones get a cheaper version of every animation in here. The deck is 25
   full-height slides deep, so anything per-word or per-frame has to go. */
export function useIsPhone() {
  const [phone, setPhone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return phone;
}

/* --- Palette -------------------------------------------------------------
   UI accents reuse the site tokens (gold / orange over the black canvas).
   Chart marks use their own two steps: the site gold is too light to sit in
   the dark-mode lightness band, so data gets `SERIES_A` / `SERIES_B`, which
   pass lightness, chroma, CVD separation and contrast against #0e0d0b. */
export const GOLD = "#f0b656";
export const ORANGE = "#d87928";
export const SERIES_A = "#bd8829"; // "what you keep" / the good series
export const SERIES_B = "#5f7fc0"; // "what you lose" / the comparison series
export const INK = "#ece8d4";
export const INK_MUTED = "#8f897a";
export const GRID = "rgba(236, 232, 212, 0.1)";

export const MONO =
  "ui-monospace, SFMono-Regular, Menlo, 'Cascadia Mono', monospace";

/* --- Motion --------------------------------------------------------------
   One spring, reused everywhere, matching the easing already used across the
   site landings. MotionConfig at the deck root handles reduced motion. */
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

export const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 160, damping: 24 },
  },
};

/* Cards and phones that arrive with a slight tilt. `custom` carries the
   starting rotation so a row of them fans in rather than marching. */
export const pop = {
  hidden: (rotate: number = 0) => ({ opacity: 0, y: 24, rotate }),
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 150, damping: 22 },
  },
};

/* The price. One scale-in, nothing else. */
export const reveal = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 140, damping: 20 },
  },
};

/* Slides tell their visuals when they are on screen, so counters and path
   draws fire on arrival instead of all at once on mount. */
const ActiveContext = createContext(false);
export const useSlideActive = () => useContext(ActiveContext);

/* Images the server found on disk, handed down so slides don't have to know
   where they came from. */
export const AssetsContext = createContext<{ fitifyShots: string[] }>({
  fitifyShots: [],
});
export const useAssets = () => useContext(AssetsContext);

export function Slide({
  id,
  act,
  label,
  children,
  className = "",
}: {
  id: string;
  act: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const active = useInView(ref, { once: true, amount: 0.35 });

  return (
    <section
      ref={ref}
      id={id}
      data-slide={id}
      className={`relative flex min-h-[100svh] snap-start flex-col justify-center px-5 pb-24 pt-14 md:px-10 md:pb-28 md:pt-16 ${className}`}
      /* Off-screen slides are skipped entirely by the renderer. `auto` on the
         intrinsic size means the browser reuses each slide's real measured
         height once it has seen it, so scroll position never jumps. */
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "auto 100svh",
      }}
    >
      <ActiveContext.Provider value={active}>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={active ? "show" : "hidden"}
          className="mx-auto flex w-full max-w-6xl flex-col"
        >
          <Eyebrow act={act} label={label} />
          {children}
        </motion.div>
      </ActiveContext.Provider>
    </section>
  );
}

/* The eyebrow carries the act and the slide's own name - the deck really is
   four arguments in sequence, so the labelling encodes something true. */
function Eyebrow({ act, label }: { act: string; label: string }) {
  return (
    <motion.p
      variants={item}
      className="mb-4 flex items-center gap-2.5 text-[10px] uppercase md:mb-5 md:text-[11px]"
      style={{ fontFamily: MONO, letterSpacing: "0.18em" }}
    >
      <span style={{ color: ORANGE }}>{act}</span>
      <span aria-hidden className="h-px w-6" style={{ background: GRID }} />
      <span style={{ color: INK_MUTED }}>{label}</span>
    </motion.p>
  );
}

/* --- Headline ------------------------------------------------------------
   Words wrapped in [[ ]] get the gold marker swipe. The swipe is the deck's
   signature move: it fires once, left to right, after the words have risen. */
export function Headline({
  children,
  size = "md",
}: {
  children: string;
  size?: "md" | "lg";
}) {
  const active = useSlideActive();
  const phone = useIsPhone();
  const parts = children.split(/(\[\[.*?\]\])/g).filter(Boolean);

  const cls =
    size === "lg"
      ? "text-[clamp(2rem,7.5vw,4.75rem)] leading-[0.98]"
      : "text-[clamp(1.65rem,5vw,3.4rem)] leading-[1.04]";

  let wordIndex = 0;

  /* Phone: the whole headline rises once with the rest of the slide, and each
     gold phrase gets a single swipe painted as a background so it survives
     wrapping. One animation instead of one per word. */
  if (phone)
    return (
      <motion.h1
        variants={item}
        className={`max-w-4xl font-bold tracking-[-0.03em] ${cls}`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {parts.map((part, p) => {
          const hit = part.startsWith("[[");
          if (!hit) return <span key={p}>{part}</span>;
          return (
            <motion.span
              key={p}
              className="rounded-[2px] px-[0.06em]"
              style={{
                color: GOLD,
                backgroundImage:
                  "linear-gradient(100deg, rgba(240,182,86,0.26), rgba(216,121,40,0.14))",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "left center",
                WebkitBoxDecorationBreak: "clone",
                boxDecorationBreak: "clone",
              }}
              initial={{ backgroundSize: "0% 86%" }}
              animate={
                active
                  ? { backgroundSize: "100% 86%" }
                  : { backgroundSize: "0% 86%" }
              }
              transition={{
                delay: 0.3,
                duration: 0.5,
                ease: [0.2, 0.7, 0.3, 1],
              }}
            >
              {part.slice(2, -2)}
            </motion.span>
          );
        })}
      </motion.h1>
    );

  return (
    <motion.h1
      variants={item}
      className={`max-w-4xl font-bold tracking-[-0.03em] ${cls}`}
      style={{ fontFamily: "var(--font-display)" }}
    >
      {parts.map((part, p) => {
        const hit = part.startsWith("[[");
        const text = hit ? part.slice(2, -2) : part;
        return text.split(/(\s+)/).map((word, w) => {
          if (!word.trim()) return <span key={`${p}-${w}`}>{word}</span>;
          const i = wordIndex++;
          return (
            <span
              key={`${p}-${w}`}
              className="relative inline-block overflow-hidden align-bottom"
            >
              <motion.span
                className="relative inline-block"
                initial={{ y: "105%" }}
                animate={active ? { y: 0 } : { y: "105%" }}
                transition={{
                  delay: 0.08 + i * 0.035,
                  type: "spring",
                  stiffness: 190,
                  damping: 25,
                }}
                style={hit ? { color: GOLD } : undefined}
              >
                {hit && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-x-[-0.06em] bottom-[0.1em] top-[0.18em] -z-10 origin-left rounded-[2px]"
                    style={{
                      background:
                        "linear-gradient(100deg, rgba(240,182,86,0.26), rgba(216,121,40,0.14))",
                    }}
                    initial={{ scaleX: 0 }}
                    animate={active ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{
                      delay: 0.45 + i * 0.03,
                      duration: 0.5,
                      ease: [0.2, 0.7, 0.3, 1],
                    }}
                  />
                )}
                {word}
              </motion.span>
            </span>
          );
        });
      })}
    </motion.h1>
  );
}

export function Sub({ children }: { children: ReactNode }) {
  return (
    <motion.p
      variants={item}
      className="mt-3.5 max-w-2xl text-[clamp(0.9rem,2.3vw,1.15rem)] leading-relaxed md:mt-5"
      style={{ color: INK_MUTED }}
    >
      {children}
    </motion.p>
  );
}

/* Visual well. `tight` caps the height so nothing ever needs to scroll
   inside a slide on a short phone screen. */
export function Visual({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={item} className={`mt-6 md:mt-9 ${className}`}>
      {children}
    </motion.div>
  );
}

export function Card({
  children,
  className = "",
  gold = false,
}: {
  children: ReactNode;
  className?: string;
  gold?: boolean;
}) {
  return (
    <div
      className={`card-glass rounded-xl p-4 md:p-5 ${gold ? "gold-frame" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function Metric({
  value,
  label,
  color = INK,
}: {
  value: ReactNode;
  label: string;
  color?: string;
}) {
  return (
    <div>
      <p
        className="text-[clamp(1.5rem,4.5vw,2.6rem)] font-bold leading-none tracking-[-0.03em]"
        style={{ fontFamily: "var(--font-display)", color }}
      >
        {value}
      </p>
      <p
        className="mt-2 text-[11px] uppercase md:text-xs"
        style={{ fontFamily: MONO, letterSpacing: "0.12em", color: INK_MUTED }}
      >
        {label}
      </p>
    </div>
  );
}

/* --- Count-up ------------------------------------------------------------ */
export function Count({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.1,
  delay = 0,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  delay?: number;
}) {
  const active = useSlideActive();
  const ref = useRef<HTMLSpanElement>(null);

  const format = useCallback(
    (v: number) =>
      prefix +
      v.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) +
      suffix,
    [prefix, suffix, decimals],
  );

  /* Written straight to the DOM. Several of these run at once on a slide, and
     a React render per frame per counter is the most expensive thing a phone
     does in this deck. */
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!active) {
      node.textContent = format(0);
      return;
    }
    const controls = animate(0, to, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = format(v);
      },
    });
    return () => controls.stop();
  }, [active, to, duration, delay, format]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      {format(0)}
    </span>
  );
}
