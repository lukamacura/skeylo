"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { animate, motion } from "framer-motion";

/* --- Palette: Infinity's rose on near-black, from the marketing plan. --- */
export const BG = "#150e10";
export const SURFACE = "#1b1215";
export const SURFACE_2 = "#241a1e";
export const LINE = "rgba(222,178,170,0.16)";
export const ROSE = "#cfa29b";
export const ROSE_SOFT = "#e6c2ba";
export const IVORY = "#f3e9e6";
export const MUTED = "#a8969a";

/* Google's own four, for the logo and the search visuals only. */
export const G_BLUE = "#4285F4";
export const G_RED = "#EA4335";
export const G_YELLOW = "#FBBC04";
export const G_GREEN = "#34A853";

export const SERIF = "var(--font-ils-serif), 'Iowan Old Style', Georgia, serif";
export const SANS =
  "var(--font-ils-sans), 'Avenir Next', system-ui, -apple-system, sans-serif";

export const CONTACT =
  "https://wa.me/381631012474?text=Zdravo%20Luka%2C%20hajde%20da%20pokrenemo%20Google%20Ads%20za%20Infinity.";

/* --- Motion -------------------------------------------------------------- */
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 170, damping: 24 },
  },
};

/* A slide never scrolls: if its content is taller than the stage, the
   column zooms out until it fits. Slides are laid out to fit a phone as
   they are, so this only steps in on the shortest screens. */
function Fit({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useLayoutEffect(() => {
    const el = box.current;
    const stage = el?.closest<HTMLElement>("[data-stage]");
    const section = el?.closest<HTMLElement>("section");
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
        0.6,
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

export function Slide({
  children,
  center = false,
}: {
  children: ReactNode;
  center?: boolean;
}) {
  return (
    <section
      className="relative flex h-full flex-col justify-center px-5 py-6 md:px-10 md:py-12"
      style={{
        backgroundImage:
          "radial-gradient(110% 55% at 50% 0%, #2c1d21 0%, rgba(21,14,16,0) 70%)",
      }}
    >
      <Fit>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className={`mx-auto flex w-full max-w-3xl flex-col ${center ? "items-center text-center" : ""}`}
        >
          {children}
        </motion.div>
      </Fit>
    </section>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <motion.p
      variants={item}
      className="mb-3 text-[11px] font-bold uppercase tracking-[0.26em] md:text-[12px]"
      style={{ color: ROSE }}
    >
      {children}
    </motion.p>
  );
}

/* Playfair, with [[words]] set in rose italic and {{meta}} / {{google}}
   as the logos. */
export function Headline({
  children,
  size = "md",
}: {
  children: string;
  size?: "md" | "lg";
}) {
  const parts = children
    .split(/(\[\[.*?\]\]|\{\{meta\}\}|\{\{google\}\})/g)
    .filter(Boolean);
  return (
    <motion.h1
      variants={item}
      className={`font-semibold ${size === "lg" ? "text-[clamp(2.2rem,10vw,4rem)] leading-[1.02]" : "text-[clamp(1.7rem,7.2vw,2.9rem)] leading-[1.08]"}`}
      style={{ fontFamily: SERIF, color: IVORY }}
    >
      {parts.map((part, i) =>
        part === "{{meta}}" ? (
          <MetaLogo
            key={i}
            size="0.62em"
            className="mr-[0.18em] align-[-0.02em]"
          />
        ) : part === "{{google}}" ? (
          <GoogleLogo
            key={i}
            size="0.62em"
            className="mr-[0.16em] align-[-0.04em]"
          />
        ) : part.startsWith("[[") ? (
          <em key={i} style={{ color: ROSE_SOFT }}>
            {part.slice(2, -2)}
          </em>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </motion.h1>
  );
}

export function Sub({ children }: { children: ReactNode }) {
  return (
    <motion.p
      variants={item}
      className="mt-3 max-w-xl text-[clamp(0.98rem,3.8vw,1.15rem)] leading-snug"
      style={{ color: MUTED }}
    >
      {children}
    </motion.p>
  );
}

/* Count-up with the Serbian thousands dot, written straight to the DOM. */
export function Count({
  to,
  delay = 0,
  duration = 1.2,
}: {
  to: number;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const c = animate(0, to, {
      delay,
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = Math.round(v).toLocaleString("de-DE");
      },
    });
    return () => c.stop();
  }, [to, delay, duration]);
  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      0
    </span>
  );
}

/* The Meta infinity mark, in its blue gradient or flat white for use on a
   coloured fill. */
const META_PATH =
  "M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z";

export function MetaLogo({
  size = 16,
  mono = false,
  className = "",
}: {
  size?: number | string;
  mono?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <svg
      viewBox="0 3.2 24 17.6"
      width={typeof size === "number" ? size * (24 / 17.6) : undefined}
      height={size}
      className={`inline-block flex-none ${className}`}
      role="img"
      aria-label="Meta"
    >
      {!mono && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0" stopColor="#0064E1" />
            <stop offset="0.6" stopColor="#0082FB" />
            <stop offset="1" stopColor="#0098FF" />
          </linearGradient>
        </defs>
      )}
      <path d={META_PATH} fill={mono ? "#fff" : `url(#${id})`} />
    </svg>
  );
}

/* Google's four-colour G, or flat white for use on a coloured fill. */
const GOOGLE_G = [
  {
    fill: "#EA4335",
    d: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z",
  },
  {
    fill: "#4285F4",
    d: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z",
  },
  {
    fill: "#FBBC05",
    d: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z",
  },
  {
    fill: "#34A853",
    d: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z",
  },
];

export function GoogleLogo({
  size = 16,
  mono = false,
  className = "",
}: {
  size?: number | string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={`inline-block flex-none ${className}`}
      role="img"
      aria-label="Google"
    >
      {GOOGLE_G.map((p) => (
        <path key={p.fill} d={p.d} fill={mono ? "#fff" : p.fill} />
      ))}
    </svg>
  );
}
