"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export type SlideProps = { active: boolean };

/** Kašnjenje ulazne animacije (ms) za `.bx-a` elemente. */
export const d = (ms: number) => ({ "--d": ms }) as CSSProperties;

/** CSS promenljive kao inline stil, bez kastovanja na svakom mestu. */
export const vars = (v: Record<string, string | number>) => v as CSSProperties;

export const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 1234567 → "1.234.567" (srpski zapis, nezavisno od jezika browsera). */
export const fmtInt = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export const fmtEur = (n: number) => `€${fmtInt(n)}`;

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/**
 * Broj koji se odbrojava kad `active` postane true. Piše direktno u DOM (bez
 * re-rendera po frejmu). `rest` je vrednost dok ne broji; bez nje stoji `to`.
 */
export function CountUp({
  to,
  from = 0,
  rest,
  active,
  delay = 0,
  dur = 1000,
  format = fmtInt,
}: {
  to: number;
  from?: number;
  rest?: number;
  active: boolean;
  delay?: number;
  dur?: number;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!active) {
      if (rest !== undefined) el.textContent = format(rest);
      return;
    }
    if (reducedMotion()) {
      el.textContent = format(to);
      return;
    }
    el.textContent = format(from);
    const t0 = performance.now() + delay;
    let raf = requestAnimationFrame(function tick(now) {
      const t = clamp01((now - t0) / dur);
      el.textContent = format(from + (to - from) * easeOut(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [active, to, from, rest, delay, dur, format]);

  return <span ref={ref}>{format(rest ?? to)}</span>;
}

/** Broj koji glatko prati promenljivu vrednost (ROI kalkulator). */
export function Tween({
  value,
  active,
  format,
}: {
  value: number;
  active: boolean;
  format: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  const target = useRef(value);
  const raf = useRef(0);

  useEffect(() => {
    target.current = value;
    const el = ref.current;
    if (!el) return;
    if (!active || reducedMotion()) {
      shown.current = value;
      el.textContent = format(value);
      return;
    }
    let last = performance.now();
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(function step(now) {
      const k = 1 - Math.exp(-(now - last) / 90);
      last = now;
      shown.current += (target.current - shown.current) * k;
      if (Math.abs(target.current - shown.current) < 0.5)
        shown.current = target.current;
      el.textContent = format(shown.current);
      if (shown.current !== target.current)
        raf.current = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf.current);
  }, [value, active, format]);

  // Slajd koji se ponovo otvara kreće od nule.
  useEffect(() => {
    if (!active) shown.current = 0;
  }, [active]);

  return <span ref={ref}>{format(value)}</span>;
}

export function Frame({
  children,
  foot = false,
  className = "",
}: {
  children: ReactNode;
  foot?: boolean;
  className?: string;
}) {
  return (
    <div className={`bx-frame ${className}`}>
      {children}
      {foot && (
        <p className="bx-foot bx-a bx-a-fade" style={d(500)}>
          Balsoa Consulting × Macura Solutions
        </p>
      )}
    </div>
  );
}

export function Head({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="bx-head">
      <p className="bx-eyebrow bx-a" style={d(40)}>
        {eyebrow}
      </p>
      <h2 className="bx-h2 bx-a" style={d(110)}>
        {title}
      </h2>
    </header>
  );
}

/* ---------- Ikone (lucide oblici; pathLength=1 da bi mogle da se iscrtaju) ---------- */

const PATHS = {
  search: (
    <>
      <circle cx="11" cy="11" r="8" pathLength={1} />
      <path d="m21 21-4.3-4.3" pathLength={1} />
    </>
  ),
  book: (
    <>
      <path d="M12 7v14" pathLength={1} />
      <path
        d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"
        pathLength={1}
      />
    </>
  ),
  zap: (
    <path
      d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
      pathLength={1}
    />
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" pathLength={1} />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" pathLength={1} />
    </>
  ),
  db: (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" pathLength={1} />
      <path d="M3 5v14a9 3 0 0 0 18 0V5" pathLength={1} />
      <path d="M3 12a9 3 0 0 0 18 0" pathLength={1} />
    </>
  ),
  shield: (
    <>
      <path
        d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
        pathLength={1}
      />
      <path d="m9 12 2 2 4-4" pathLength={1} />
    </>
  ),
  badge: (
    <>
      <path
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
        pathLength={1}
      />
      <path d="m9 12 2 2 4-4" pathLength={1} />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" pathLength={1} />
      <path d="M18 17V9" pathLength={1} />
      <path d="M13 17V5" pathLength={1} />
      <path d="M8 17v-3" pathLength={1} />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" pathLength={1} />
      <path
        d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
        pathLength={1}
      />
      <path d="M2 12h20" pathLength={1} />
    </>
  ),
  play: (
    <path
      d="M6 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L7.5 3.64A1 1 0 0 0 6 4.5z"
      pathLength={1}
    />
  ),
  file: (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </>
  ),
  timer: (
    <>
      <path d="M10 2h4" />
      <path d="m12 14 3-3" />
      <circle cx="12" cy="14" r="8" />
    </>
  ),
  left: <path d="m15 18-6-6 6-6" />,
  right: <path d="m9 18 6-6-6-6" />,
} as const;

export type IconName = keyof typeof PATHS;

export function Ico({
  name,
  className,
  style,
}: {
  name: IconName;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      style={style}
    >
      {PATHS[name]}
    </svg>
  );
}
