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
import { motion, animate } from "framer-motion";

/* --- Palette -------------------------------------------------------------
   Neto's own colours, lifted straight from the strategy page: the red, the
   black, the paper white. Every slide picks one of four backgrounds and the
   rest of its type follows from that choice. */
export const RED = "#E2231A";
export const RED_DEEP = "#B8160F";
export const PAPER = "#F7F6F2";
export const INK = "#1A1A1A";
export const MUTED = "#6B6B6B";
export const LINE = "#E4E2DC";

export const DISPLAY = "var(--font-neto), Rubik, system-ui, sans-serif";
export const MONO =
  "var(--font-neto-mono), 'IBM Plex Mono', ui-monospace, monospace";

export const CONTACT =
  "https://wa.me/381631012474?text=Zdravo%20Luka%2C%20zainteresovan%20sam%20za%20Neto%20ponudu.%20Hajde%20da%20zaka%C5%BEemo%20sastanak.";

export type Theme = "dark" | "light" | "paper" | "red";

export const THEMES: Record<
  Theme,
  {
    bg: string;
    fg: string;
    muted: string;
    line: string;
    card: string;
    soft: string;
    hl: string;
    swipe: string;
  }
> = {
  dark: {
    bg: "#000000",
    fg: "#ffffff",
    muted: "#B5B5B5",
    line: "#333333",
    card: "#141414",
    soft: "rgba(255,255,255,0.08)",
    hl: "#FF4B42",
    swipe: "rgba(226,35,26,0.28)",
  },
  light: {
    bg: "#ffffff",
    fg: "#000000",
    muted: MUTED,
    line: LINE,
    card: PAPER,
    soft: "rgba(0,0,0,0.045)",
    hl: RED,
    swipe: "rgba(226,35,26,0.16)",
  },
  paper: {
    bg: PAPER,
    fg: "#000000",
    muted: MUTED,
    line: LINE,
    card: "#ffffff",
    soft: "rgba(0,0,0,0.045)",
    hl: RED,
    swipe: "rgba(226,35,26,0.16)",
  },
  red: {
    bg: RED,
    fg: "#ffffff",
    muted: "#FFD9D6",
    line: "rgba(255,255,255,0.3)",
    card: "rgba(0,0,0,0.16)",
    soft: "rgba(255,255,255,0.16)",
    hl: "#ffffff",
    swipe: "rgba(0,0,0,0.18)",
  },
};

/* Phones get a cheaper version of every animation in here. */
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

/* --- Motion --------------------------------------------------------------
   The strategy page has two moves: things rise in (`rise`, .8s, a soft
   ease-out) and things pop in with an overshoot (`pop`, cubic-bezier
   .2,1.6,.4,1). Both are reproduced here as springs so they interrupt
   cleanly when someone flips slides fast. */
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
  hidden: (rotate: number = 0) => ({ opacity: 0, y: 24, scale: 0.94, rotate }),
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 220, damping: 20 },
  },
};

export const POP_SPRING = {
  type: "spring" as const,
  stiffness: 320,
  damping: 17,
};

/* --- Contexts ------------------------------------------------------------ */
const ActiveContext = createContext(false);
export const useSlideActive = () => useContext(ActiveContext);

const ThemeContext = createContext<Theme>("dark");
export const useTheme = () => THEMES[useContext(ThemeContext)];
export const useThemeName = () => useContext(ThemeContext);

export const SlidePositionContext = createContext<{
  index: number;
  total: number;
  label: string;
}>({ index: 0, total: 0, label: "" });

export function Slide({
  id,
  theme = "dark",
  children,
  className = "",
  eyebrow = true,
}: {
  id: string;
  theme?: Theme;
  children: ReactNode;
  className?: string;
  eyebrow?: boolean;
}) {
  const [active, setActive] = useState(false);
  const t = THEMES[theme];

  useEffect(() => {
    const r = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(r);
  }, []);

  return (
    <section
      id={id}
      data-slide={id}
      className={`relative flex min-h-full flex-col justify-center px-5 py-8 md:px-10 md:py-12 ${className}`}
      style={{ background: t.bg, color: t.fg, fontFamily: DISPLAY }}
    >
      <ThemeContext.Provider value={theme}>
        <ActiveContext.Provider value={active}>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={active ? "show" : "hidden"}
            className="mx-auto flex w-full max-w-6xl flex-col"
          >
            {eyebrow && <Eyebrow />}
            {children}
          </motion.div>
        </ActiveContext.Provider>
      </ThemeContext.Provider>
    </section>
  );
}

function Eyebrow() {
  const { index, total, label } = useContext(SlidePositionContext);
  const t = useTheme();
  return (
    <motion.p
      variants={item}
      className="mb-4 flex items-center gap-2 text-[9.5px] uppercase tracking-[0.1em] md:mb-5 md:gap-2.5 md:text-[11px] md:tracking-[0.18em]"
      style={{ fontFamily: MONO }}
    >
      <span
        className="shrink-0 whitespace-nowrap font-semibold"
        style={{ color: t.hl }}
      >
        {String(index + 1).padStart(2, "0")} / {total}
      </span>
      <span
        aria-hidden
        className="h-px w-4 shrink-0 md:w-6"
        style={{ background: t.line }}
      />
      <span className="min-w-0 truncate" style={{ color: t.muted }}>
        {label}
      </span>
    </motion.p>
  );
}

/* --- Headline ------------------------------------------------------------
   Rubik, heavy italic, exactly the `.h2` of the strategy page. Words wrapped
   in [[ ]] go red and get a marker swipe once they have landed. */
export function Headline({
  children,
  size = "md",
  center = false,
}: {
  children: string;
  size?: "md" | "lg";
  center?: boolean;
}) {
  const active = useSlideActive();
  const phone = useIsPhone();
  const t = useTheme();
  const parts = children.split(/(\[\[.*?\]\])/g).filter(Boolean);

  const cls =
    size === "lg"
      ? "text-[clamp(2.1rem,10vw,4.6rem)] leading-[1.02]"
      : "text-[clamp(1.75rem,7.4vw,3.2rem)] leading-[1.05]";

  let wordIndex = 0;

  if (phone)
    return (
      <motion.h1
        variants={item}
        className={`max-w-4xl font-extrabold italic tracking-[-0.01em] ${center ? "mx-auto text-center" : ""} ${cls}`}
        style={{ fontFamily: DISPLAY }}
      >
        {parts.map((part, p) => {
          const hit = part.startsWith("[[");
          if (!hit) return <span key={p}>{part}</span>;
          return (
            <motion.span
              key={p}
              className="rounded-[2px] px-[0.06em]"
              style={{
                color: t.hl,
                backgroundImage: `linear-gradient(100deg, ${t.swipe}, ${t.swipe})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "left 88%",
                WebkitBoxDecorationBreak: "clone",
                boxDecorationBreak: "clone",
              }}
              initial={{ backgroundSize: "0% 70%" }}
              animate={{ backgroundSize: active ? "100% 70%" : "0% 70%" }}
              transition={{ delay: 0.25, duration: 0.45, ease: EASE_OUT }}
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
      className={`max-w-4xl font-extrabold italic tracking-[-0.01em] ${center ? "mx-auto text-center" : ""} ${cls}`}
      style={{ fontFamily: DISPLAY }}
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
              className="relative inline-block overflow-hidden pr-[0.08em] align-bottom"
            >
              <motion.span
                className="relative inline-block"
                initial={{ y: "105%" }}
                animate={{ y: active ? 0 : "105%" }}
                transition={{
                  delay: 0.06 + i * 0.03,
                  type: "spring",
                  stiffness: 210,
                  damping: 25,
                }}
                style={hit ? { color: t.hl } : undefined}
              >
                {hit && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-x-[-0.06em] bottom-[0.08em] top-[0.3em] -z-10 origin-left rounded-[2px]"
                    style={{ background: t.swipe }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: active ? 1 : 0 }}
                    transition={{
                      delay: 0.4 + i * 0.025,
                      duration: 0.45,
                      ease: EASE_OUT,
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
      className={`mt-3 max-w-2xl text-[clamp(0.95rem,3.6vw,1.15rem)] leading-relaxed md:mt-4 ${center ? "mx-auto text-center" : ""}`}
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
    <motion.div variants={item} className={`mt-6 md:mt-8 ${className}`}>
      {children}
    </motion.div>
  );
}

/* Neto's signature corner: three tight radii and one big one, top-right. */
export const NETO_RADIUS = "4px 22px 4px 4px";

/* --- Count-up ------------------------------------------------------------
   Serbian thousands separator (1.240), written straight to the DOM. */
export function Count({
  to,
  prefix = "",
  suffix = "",
  duration = 1.4,
  delay = 0,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  const active = useSlideActive();
  const ref = useRef<HTMLSpanElement>(null);

  const format = useCallback(
    (v: number) => prefix + Math.round(v).toLocaleString("de-DE") + suffix,
    [prefix, suffix],
  );

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

export const fmt = (n: number) => Math.round(n).toLocaleString("de-DE");
