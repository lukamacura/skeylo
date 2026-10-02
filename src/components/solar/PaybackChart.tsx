"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { num } from "@/lib/solar";
import { num as numEn, shortUsd } from "@/lib/solar-us";

/** "1,2 mil." / "350 hilj." — kratko, za ose i oznake. */
export function shortRsd(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    const v = n / 1_000_000;
    return `${num(v, Math.abs(v) >= 10 ? 0 : 1)} mil.`;
  }
  if (abs >= 1_000) return `${num(Math.round(n / 1_000))} hilj.`;
  return num(Math.round(n));
}

function niceStep(range: number, ticks: number): number {
  const raw = range / ticks;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const unit = raw / pow;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * pow;
}

/** Tekstovi grafikona; "en" je za američki kalkulator (USD). */
const TEXT = {
  sr: {
    short: shortRsd,
    amount: (v: number) => `${num(Math.round(v / 1000) * 1000)} RSD`,
    today: "danas",
    Today: "Danas",
    tick: (yr: number) => `${yr}. god.`,
    year: (yr: number) => `${yr}. godina`,
    paid: "Isplaćeno",
    minus: "U minusu ",
    plus: "U plusu ",
    back: "Ulaganje se vraća",
    profit: "Čista zarada",
    aria: "Kumulativni novčani tok solarnog sistema kroz 25 godina",
    caption: "Kumulativni novčani tok po godinama",
    colYear: "Godina",
    colValue: "Stanje (RSD)",
    cell: (v: number) => num(Math.round(v)),
  },
  en: {
    short: shortUsd,
    amount: (v: number) => `$${numEn(Math.round(v / 100) * 100)}`,
    today: "Today",
    Today: "Today",
    tick: (yr: number) => `Yr ${yr}`,
    year: (yr: number) => `Year ${yr}`,
    paid: "Paid off",
    minus: "Down ",
    plus: "Up ",
    back: "Paying back the investment",
    profit: "Net savings",
    aria: "Cumulative cash flow of the solar system over 25 years",
    caption: "Cumulative cash flow by year",
    colYear: "Year",
    colValue: "Balance (USD)",
    cell: (v: number) => numEn(Math.round(v)),
  },
} as const;

const INK = "#f2f5f9";
const MUTED = "#8b97a8";
const GRID = "rgba(255,255,255,0.07)";
const LOSS = "#ff9f1a";
const GAIN = "#3ddc97";
const SURFACE = "#0e1218";

interface Props {
  /** Kumulativni novčani tok, indeks = godina. */
  cashflow: number[];
  paybackYears: number | null;
  locale?: keyof typeof TEXT;
}

/** Kumulativni novčani tok kroz 25 godina: ispod nule je ulaganje, iznad zarada. */
export default function PaybackChart({
  cashflow,
  paybackYears,
  locale = "sr",
}: Props) {
  const t = TEXT[locale];
  const wrap = useRef<HTMLDivElement>(null);
  // 0 do prvog merenja: crtež nikad nije širi od kartice, ni na tren.
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const still = useReducedMotion() ?? false;
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = 230;
  const pad = { top: 26, right: 18, bottom: 28, left: 58 };
  const iw = Math.max(10, width - pad.left - pad.right);
  const ih = height - pad.top - pad.bottom;
  const years = cashflow.length - 1;

  const lo = Math.min(0, ...cashflow);
  const hi = Math.max(0, ...cashflow);
  const step = niceStep(hi - lo || 1, 4);
  const yMin = Math.floor(lo / step) * step;
  const yMax = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = yMin; v <= yMax + step / 2; v += step) ticks.push(v);

  const x = (year: number) => pad.left + (year / years) * iw;
  const y = (v: number) => pad.top + (1 - (v - yMin) / (yMax - yMin)) * ih;
  const zero = y(0);

  const line = cashflow
    .map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(years)} ${zero} L${x(0)} ${zero} Z`;

  const onMove = (clientX: number) => {
    const rect = wrap.current?.getBoundingClientRect();
    if (!rect) return;
    const pos = (clientX - rect.left - pad.left) / iw;
    setHover(Math.round(Math.min(1, Math.max(0, pos)) * years));
  };

  const tipLeft = hover === null ? 0 : x(hover);
  const tipFlip = tipLeft > width - 150;

  return (
    <div ref={wrap} className="relative w-full min-w-0 select-none">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={t.aria}
        className="block touch-pan-y"
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerDown={(e) => onMove(e.clientX)}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <clipPath id={`${id}-below`}>
            <rect
              x={0}
              y={zero}
              width={width}
              height={Math.max(0, height - zero)}
            />
          </clipPath>
          <clipPath id={`${id}-above`}>
            <rect x={0} y={0} width={width} height={Math.max(0, zero)} />
          </clipPath>
          <clipPath id={`${id}-reveal`}>
            <motion.rect
              x={0}
              y={0}
              height={height}
              initial={{ width: still ? width : pad.left }}
              animate={{ width }}
              transition={{
                duration: 1.6,
                delay: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </clipPath>
        </defs>

        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke={tick === 0 ? "rgba(255,255,255,0.28)" : GRID}
            />
            <text
              x={pad.left - 10}
              y={y(tick) + 4}
              textAnchor="end"
              fontSize={11}
              fill={MUTED}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {t.short(tick)}
            </text>
          </g>
        ))}
        {[0, 5, 10, 15, 20, 25].map((yr) => (
          <text
            key={yr}
            x={x(yr)}
            y={height - 8}
            textAnchor={yr === 0 ? "start" : yr === 25 ? "end" : "middle"}
            fontSize={11}
            fill={MUTED}
          >
            {yr === 0 ? t.today : t.tick(yr)}
          </text>
        ))}

        <g clipPath={`url(#${id}-reveal)`}>
          <path
            d={area}
            fill={LOSS}
            opacity={0.16}
            clipPath={`url(#${id}-below)`}
          />
          <path
            d={area}
            fill={GAIN}
            opacity={0.16}
            clipPath={`url(#${id}-above)`}
          />
          <path
            d={line}
            fill="none"
            stroke={LOSS}
            strokeWidth={2}
            strokeLinejoin="round"
            clipPath={`url(#${id}-below)`}
          />
          <path
            d={line}
            fill="none"
            stroke={GAIN}
            strokeWidth={2}
            strokeLinejoin="round"
            clipPath={`url(#${id}-above)`}
          />
        </g>

        {paybackYears !== null && paybackYears > 0 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: still ? 0 : 1.5, duration: 0.4 }}
          >
            <line
              x1={x(paybackYears)}
              x2={x(paybackYears)}
              y1={zero}
              y2={pad.top - 4}
              stroke={INK}
              strokeOpacity={0.35}
              strokeDasharray="3 4"
            />
            <circle
              cx={x(paybackYears)}
              cy={zero}
              r={5}
              fill={INK}
              stroke={SURFACE}
              strokeWidth={2}
            />
            <text
              x={x(paybackYears) + 8}
              y={pad.top + 4}
              fontSize={12}
              fontWeight={600}
              fill={INK}
            >
              {t.paid}
            </text>
          </motion.g>
        )}

        {hover !== null && (
          <g pointerEvents="none">
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={pad.top}
              y2={pad.top + ih}
              stroke={INK}
              strokeOpacity={0.3}
            />
            <circle
              cx={x(hover)}
              cy={y(cashflow[hover])}
              r={5}
              fill={cashflow[hover] < 0 ? LOSS : GAIN}
              stroke={SURFACE}
              strokeWidth={2}
            />
          </g>
        )}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-1 z-10 rounded-lg border border-white/10 bg-[#151b24] px-3 py-2 text-xs shadow-xl"
          style={{
            left: tipLeft,
            transform: `translateX(${tipFlip ? "calc(-100% - 10px)" : "10px"})`,
          }}
        >
          <div className="text-[#8b97a8]">
            {hover === 0 ? t.Today : t.year(hover)}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 font-semibold tabular-nums text-[#f2f5f9]">
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: cashflow[hover] < 0 ? LOSS : GAIN }}
            />
            {cashflow[hover] < 0 ? t.minus : t.plus}
            {t.amount(Math.abs(cashflow[hover]))}
          </div>
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#8b97a8]">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4 rounded"
            style={{ background: LOSS }}
          />
          {t.back}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4 rounded"
            style={{ background: GAIN }}
          />
          {t.profit}
        </span>
      </div>

      <table className="sr-only">
        <caption>{t.caption}</caption>
        <thead>
          <tr>
            <th>{t.colYear}</th>
            <th>{t.colValue}</th>
          </tr>
        </thead>
        <tbody>
          {cashflow.map((v, i) =>
            i % 5 === 0 ? (
              <tr key={i}>
                <td>{i}</td>
                <td>{t.cell(v)}</td>
              </tr>
            ) : null,
          )}
        </tbody>
      </table>
    </div>
  );
}
