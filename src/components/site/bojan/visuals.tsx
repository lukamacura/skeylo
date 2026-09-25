"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import {
  DISPLAY,
  EASE_OUT,
  MONO,
  MUTED,
  NETO_RADIUS,
  POP_SPRING,
  RED,
  useSlideActive,
  useTheme,
} from "./primitives";

/* --- The Neto fascia -------------------------------------------------------
   The red speech-bubble sign, pops in with the overshoot from the page. */
export function NetoLogo({
  className = "",
  animate = true,
  delay = 0.2,
}: {
  className?: string;
  animate?: boolean;
  delay?: number;
}) {
  const active = useSlideActive();
  const on = !animate || active;
  return (
    <motion.svg
      viewBox="0 0 320 210"
      role="img"
      aria-label="Neto"
      className={className}
      style={{ transformOrigin: "70% 90%", display: "block" }}
      initial={animate ? { opacity: 0, scale: 0.6, rotate: -8 } : false}
      animate={
        on
          ? { opacity: 1, scale: 1, rotate: 0 }
          : { opacity: 0, scale: 0.6, rotate: -8 }
      }
      transition={{ delay, type: "spring", stiffness: 210, damping: 14 }}
    >
      <path
        d="M14 10 L306 30 Q312 31 311 38 L302 146 Q301 153 294 153 L252 153 L268 202 L214 153 L16 144 Q9 144 9 137 L6 18 Q6 10 14 10 Z"
        fill={RED}
      />
      <text
        x="160"
        y="118"
        textAnchor="middle"
        fontSize="100"
        fill="#fff"
        textLength="244"
        lengthAdjust="spacingAndGlyphs"
        transform="rotate(2 160 90)"
        style={{ fontFamily: DISPLAY, fontWeight: 900, fontStyle: "italic" }}
      >
        Neto
      </text>
    </motion.svg>
  );
}

/* The little red "Neto" chip used as an app logo in both phone demos. */
export function MiniLogo({
  className = "",
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <span
      className={`inline-block -rotate-2 px-[11px] py-[2px] text-[19px] font-black italic leading-normal ${className}`}
      style={{
        background: invert ? "#fff" : RED,
        color: invert ? RED : "#fff",
        borderRadius: "4px 12px 4px 4px",
        fontFamily: DISPLAY,
      }}
    >
      Neto
    </span>
  );
}

/* --- Towns ticker ----------------------------------------------------------
   A red band of Novi Sad neighbourhoods rolling past, two copies so the loop
   never shows a seam. */
const TOWNS = [
  "Novi Sad",
  "Interaktivni Katalog",
  "Petrovaradin",
  "Sremska Kamenica",
  "Svaki dinar je bitan",
  "Futog",
  "Veternik",
  "Interaktivni Katalog",
  "Kać",
  "Bački Jarak",
  "Svaki dinar je bitan",
  "Kisač",
  "Bukovac",
  "Begeč",
  "Sremski Karlovci",
];

export function Ticker({ className = "" }: { className?: string }) {
  const track = [...TOWNS, ...TOWNS];
  return (
    <div
      aria-hidden
      className={`overflow-hidden whitespace-nowrap py-3 ${className}`}
      style={{
        background: RED,
        color: "#fff",
        borderTop: "3px solid #000",
        borderBottom: "3px solid #000",
      }}
    >
      {/* A CSS keyframe, not a framer animation: it runs on the compositor
          and keeps rolling even when the OS asks for reduced motion, which
          MotionConfig would otherwise honour by freezing every transform. */}
      <div className="neto-ticker inline-flex items-center gap-7 text-[18px] font-extrabold italic md:text-[20px]">
        {track.map((n, i) => (
          <span key={i} className="inline-flex items-center gap-7">
            <b>{n}</b>
            <i className="not-italic opacity-55">●</i>
          </span>
        ))}
      </div>
    </div>
  );
}

/* --- Products (shared by both phone demos) -------------------------------- */
export type Product = {
  name: string;
  size: string;
  was: number;
  now: number;
  tint: string;
  Icon: () => React.JSX.Element;
};

const s = { stroke: "#1A1A1A", strokeWidth: 2 } as const;

export const Milk = () => (
  <svg viewBox="0 0 64 64">
    <path d="M20 18h24v38a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3z" fill="#fff" {...s} />
    <path d="M20 18l6-9h12l6 9z" fill="#EDEDED" {...s} strokeLinejoin="round" />
    <path d="M26 9h12v-4H26z" fill={RED} />
    <path d="M20 32h24v12H20z" fill="#3B82C4" />
    <path
      d="M27 38c2-3 8-3 10 0"
      stroke="#fff"
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);
export const Bread = () => (
  <svg viewBox="0 0 64 64">
    <path
      d="M8 38c0-12 11-20 24-20s24 8 24 20v10a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z"
      fill="#D9963F"
      {...s}
    />
    <path d="M8 38c0-12 11-20 24-20s24 8 24 20" fill="#E8B061" {...s} />
    <path
      d="M20 26l4 8M30 23l3 9M41 25l2 8"
      stroke="#A8651F"
      strokeWidth={2.5}
      strokeLinecap="round"
    />
  </svg>
);
export const Eggs = () => (
  <svg viewBox="0 0 64 64">
    <path d="M6 36h52l-5 16H11z" fill="#C9B79A" {...s} strokeLinejoin="round" />
    <ellipse cx="18" cy="30" rx="8" ry="10" fill="#F4E2C8" {...s} />
    <ellipse cx="32" cy="28" rx="8" ry="11" fill="#fff" {...s} />
    <ellipse cx="46" cy="30" rx="8" ry="10" fill="#F4E2C8" {...s} />
  </svg>
);
export const Oil = () => (
  <svg viewBox="0 0 64 64">
    <path d="M28 4h8v7h-8z" fill={RED} {...s} />
    <path
      d="M26 11h12l4 10v33a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4V21z"
      fill="#F7C531"
      {...s}
      strokeLinejoin="round"
    />
    <path d="M22 32h20v14H22z" fill="#fff" {...s} />
    <circle
      cx="32"
      cy="39"
      r="4"
      fill="#F7C531"
      stroke="#1A1A1A"
      strokeWidth={1.5}
    />
  </svg>
);
export const Coffee = () => (
  <svg viewBox="0 0 64 64">
    <path
      d="M16 12h32l-3 44a3 3 0 0 1-3 3H22a3 3 0 0 1-3-3z"
      fill="#5A3A26"
      {...s}
      strokeLinejoin="round"
    />
    <path d="M16 12l4-6h24l4 6z" fill="#3E2718" {...s} strokeLinejoin="round" />
    <path d="M20 26h24v16H20z" fill={RED} />
    <ellipse
      cx="32"
      cy="34"
      rx="5"
      ry="3.5"
      fill="#fff"
      transform="rotate(-25 32 34)"
    />
    <path d="M29 36c2-1 4-3 6-4" stroke={RED} strokeWidth={1.5} />
  </svg>
);
export const Detergent = () => (
  <svg viewBox="0 0 64 64">
    <path
      d="M14 16h36v40a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z"
      fill="#2E7FD9"
      {...s}
    />
    <path
      d="M24 16v-6h16v6"
      fill="none"
      stroke="#1A1A1A"
      strokeWidth={3}
      strokeLinecap="round"
    />
    <circle cx="32" cy="36" r="11" fill="#fff" {...s} />
    <path
      d="M26 36c2-3 4 3 6 0s4 3 6 0"
      stroke="#2E7FD9"
      strokeWidth={2.5}
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);
export const Pasta = () => (
  <svg viewBox="0 0 64 64">
    <path
      d="M18 8h28l2 48a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3z"
      fill="#fff"
      {...s}
      strokeLinejoin="round"
    />
    <path d="M18 8h28v8H18z" fill={RED} {...s} />
    <rect
      x="22"
      y="24"
      width="20"
      height="24"
      rx="4"
      fill="#FFE7A8"
      stroke="#1A1A1A"
      strokeWidth={1.5}
    />
    <path
      d="M26 30l4 4M34 28l4 4M26 40l4 4M34 38l4 4"
      stroke="#E0A526"
      strokeWidth={3}
      strokeLinecap="round"
    />
  </svg>
);

export const PRODUCTS: Product[] = [
  {
    name: "Mleko 2,8%",
    size: "1 l",
    was: 149,
    now: 129,
    tint: "#E8F1FB",
    Icon: Milk,
  },
  {
    name: "Hleb beli",
    size: "500 g",
    was: 89,
    now: 75,
    tint: "#FBF0E1",
    Icon: Bread,
  },
  {
    name: "Jaja",
    size: "10 kom",
    was: 259,
    now: 219,
    tint: "#F7F1E8",
    Icon: Eggs,
  },
  {
    name: "Suncokretovo ulje",
    size: "1 l",
    was: 219,
    now: 189,
    tint: "#FEF6DA",
    Icon: Oil,
  },
  {
    name: "Mlevena kafa",
    size: "200 g",
    was: 399,
    now: 339,
    tint: "#F3EAE4",
    Icon: Coffee,
  },
  {
    name: "Deterdžent za veš",
    size: "3 kg",
    was: 899,
    now: 749,
    tint: "#E6F0FC",
    Icon: Detergent,
  },
  {
    name: "Testenina",
    size: "500 g",
    was: 149,
    now: 119,
    tint: "#FDEDEC",
    Icon: Pasta,
  },
];

export const off = (p: Product) => Math.round((1 - p.now / p.was) * 100);

/* A product tile. Tapping it flips the plus into a tick and tilts the icon. */
export function ProductCard({
  p,
  pressed,
  onToggle,
  compact = false,
}: {
  p: Product;
  pressed: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <motion.button
      type="button"
      aria-pressed={pressed}
      aria-label={`${p.name}, ${p.now} dinara`}
      onClick={onToggle}
      whileTap={{ scale: 0.97 }}
      className="relative text-left"
      style={{
        background: "#fff",
        border: `2px solid ${pressed ? RED : "transparent"}`,
        borderRadius: "14px 14px 14px 4px",
        padding: compact ? "7px 7px 9px" : "8px 8px 10px",
        transition: "border-color .2s",
        fontFamily: DISPLAY,
      }}
    >
      <span
        className="grid place-items-center rounded-[10px]"
        style={{ height: compact ? 64 : 74, background: p.tint }}
      >
        <motion.span
          className="block"
          style={{ width: compact ? 48 : 58, height: compact ? 48 : 58 }}
          animate={
            pressed ? { scale: 1.1, rotate: -6 } : { scale: 1, rotate: 0 }
          }
          transition={POP_SPRING}
        >
          <p.Icon />
        </motion.span>
      </span>
      <span
        className="absolute left-1.5 top-1.5 px-[7px] py-[2px] text-[11px] font-extrabold text-white"
        style={{ background: RED, borderRadius: "3px 9px 3px 3px" }}
      >
        −{off(p)}%
      </span>
      <b className="mt-[7px] block text-[13px] leading-[1.2] text-[#111]">
        {p.name}
      </b>
      <small className="block text-[11px]" style={{ color: MUTED }}>
        {p.size}
      </small>
      <span className="mt-1 flex items-baseline gap-1.5">
        <strong className="text-[15px] font-extrabold" style={{ color: RED }}>
          {p.now}
        </strong>
        <s className="text-[11px]" style={{ color: MUTED }}>
          {p.was}
        </s>
      </span>
      <motion.span
        aria-hidden
        className="absolute bottom-2 right-[7px] grid h-7 w-7 place-items-center rounded-full text-white"
        animate={{
          background: pressed ? RED : "#000",
          rotate: pressed ? 360 : 0,
        }}
        transition={{ background: { duration: 0.2 }, rotate: POP_SPRING }}
      >
        {pressed ? (
          <Check size={14} strokeWidth={3} />
        ) : (
          <span className="relative block h-3 w-3">
            <span className="absolute left-0 top-1/2 h-[2.5px] w-3 -translate-y-1/2 rounded-sm bg-white" />
            <span className="absolute left-1/2 top-0 h-3 w-[2.5px] -translate-x-1/2 rounded-sm bg-white" />
          </span>
        )}
      </motion.span>
    </motion.button>
  );
}

/* --- Map pin, used all over the demos ------------------------------------- */
export function Pin({ size = 24 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

/* --- Store dots (pilot slide) --------------------------------------------- */
export function StoreDots({
  test = 24,
  total = 37,
}: {
  test?: number;
  total?: number;
}) {
  const active = useSlideActive();
  return (
    <div
      role="img"
      aria-label={`${total} radnji: ${test} u Novom Sadu i okolini sa kampanjom, ${total - test} van tog područja za poređenje`}
      className="grid max-w-[380px] grid-cols-10 gap-[9px]"
    >
      {Array.from({ length: total }, (_, i) => (
        <motion.span
          key={i}
          className="aspect-square"
          style={{
            borderRadius: "50% 50% 50% 12%",
            background: i < test ? "#fff" : "transparent",
            boxShadow: i < test ? undefined : "inset 0 0 0 2.5px #fff",
          }}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={
            active ? { scale: 1, opacity: 1 } : { scale: 0.3, opacity: 0 }
          }
          transition={{ ...POP_SPRING, delay: 0.2 + i * 0.028 }}
        />
      ))}
    </div>
  );
}

/* --- Timeline (pilot slide) ----------------------------------------------- */
export function Timeline({
  steps,
}: {
  steps: { title: string; body: string }[];
}) {
  const active = useSlideActive();
  return (
    <div className="relative pl-[34px]">
      <div
        aria-hidden
        className="absolute bottom-[6px] left-[10px] top-[6px] w-[3px] rounded-sm"
        style={{ background: "rgba(255,255,255,0.3)" }}
      />
      <motion.div
        aria-hidden
        className="absolute left-[10px] top-[6px] w-[3px] rounded-sm bg-white"
        initial={{ height: 0 }}
        animate={{ height: active ? "calc(100% - 12px)" : 0 }}
        transition={{ duration: 1.8, ease: [0.3, 0.7, 0.3, 1], delay: 0.5 }}
      />
      {steps.map((st, i) => (
        <motion.div
          key={st.title}
          className="relative pb-7 last:pb-0"
          initial={{ opacity: 0, x: -10 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
          transition={{ delay: 0.5 + i * 0.5, duration: 0.5, ease: EASE_OUT }}
        >
          <span
            aria-hidden
            className="absolute -left-[31px] top-1 h-[17px] w-[17px] rounded-full"
            style={{ background: RED, boxShadow: "0 0 0 3px #fff" }}
          />
          <h3 className="text-[21px] font-extrabold italic leading-[1.1] md:text-[23px]">
            {st.title}
          </h3>
          <p
            className="mt-1.5 text-[15px] md:text-[16px]"
            style={{ color: "#FFE6E4" }}
          >
            {st.body}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

/* --- Versus bars (crew cost slide) ---------------------------------------- */
export function Bar({
  pct,
  color,
  delay = 0,
}: {
  pct: number;
  color: string;
  delay?: number;
}) {
  const active = useSlideActive();
  return (
    <div
      className="mt-2 h-[18px] overflow-hidden"
      style={{ background: "#222", borderRadius: "4px 10px 4px 4px" }}
    >
      <motion.i
        className="block h-full"
        style={{ background: color, borderRadius: "inherit" }}
        initial={{ width: 0 }}
        animate={{ width: active ? `${pct}%` : 0 }}
        transition={{
          duration: 1.6,
          ease: [0.25, 0.8, 0.25, 1],
          delay: 0.4 + delay,
        }}
      />
    </div>
  );
}

/* --- The price tag ---------------------------------------------------------
   Hangs from a string, swings in from the left and settles. */
export function PriceTag({
  amount,
  currency,
  per,
  forWhom,
  items,
}: {
  amount: string;
  currency: string;
  per: string;
  forWhom: string;
  items: string[];
}) {
  const active = useSlideActive();
  return (
    <div className="flex justify-center pt-14">
      <motion.div
        className="relative w-[min(88vw,380px)] px-[26px] pb-[30px] pt-[38px] text-white"
        style={{
          background: RED,
          borderRadius: "10px 34px 10px 10px",
          transformOrigin: "50% -18px",
          fontFamily: DISPLAY,
        }}
        initial={{ rotate: -7, opacity: 0 }}
        animate={
          active
            ? { rotate: [-7, 5, -3, 1.5, -0.6, 0], opacity: 1 }
            : { rotate: -7, opacity: 0 }
        }
        transition={{
          rotate: {
            duration: 1.8,
            ease: [0.3, 0.6, 0.3, 1],
            times: [0, 0.25, 0.45, 0.65, 0.82, 1],
          },
          opacity: { duration: 0.3 },
        }}
      >
        {/* the string and the hole */}
        <span
          aria-hidden
          className="absolute left-1/2 top-[-40px] h-[56px] w-[2px] -translate-x-1/2"
          style={{ background: "#555" }}
        />
        <span
          aria-hidden
          className="absolute left-1/2 top-[14px] h-[14px] w-[14px] -translate-x-1/2 rounded-full bg-black"
        />
        <p className="text-center text-[16px] font-bold opacity-90">
          {forWhom}
        </p>
        <p
          className="mt-2.5 flex items-start justify-center gap-1.5 font-black italic leading-[0.85]"
          aria-label={`${amount} ${currency === "€" ? "evra" : currency}`}
        >
          <span className="text-[clamp(78px,24vw,112px)] tracking-[-0.03em]">
            {amount}
          </span>
          <span className="mt-2 text-[36px]">{currency}</span>
        </p>
        <p className="mt-2.5 text-center text-[18px] font-bold">{per}</p>
        <div
          className="my-[22px] mb-[18px]"
          style={{ borderTop: "2px dashed rgba(255,255,255,0.5)" }}
        />
        <ul className="grid gap-[9px]">
          {items.map((it) => (
            <li key={it} className="relative pl-7 text-[16px] leading-[1.35]">
              <span
                aria-hidden
                className="absolute left-0 top-[2px] grid h-[18px] w-[18px] place-items-center rounded-full bg-white"
              >
                <Check size={11} strokeWidth={3.5} style={{ color: RED }} />
              </span>
              {it}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

/* --- Small type helpers ----------------------------------------------------- */
export function Mono({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const t = useTheme();
  return (
    <span
      className={`text-[11px] uppercase ${className}`}
      style={{ fontFamily: MONO, letterSpacing: "0.14em", color: t.muted }}
    >
      {children}
    </span>
  );
}

export { NETO_RADIUS };
