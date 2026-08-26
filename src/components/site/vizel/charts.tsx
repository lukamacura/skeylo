"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GRID,
  INK,
  INK_MUTED,
  MONO,
  SERIES_A,
  SERIES_B,
  useSlideActive,
} from "./primitives";

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/* Legend - always present for two or more series, so identity never rests on
   colour alone. */
function Legend({ items }: { items: [string, string][] }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
      {items.map(([label, color]) => (
        <span key={label} className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-[3px] w-5 rounded-full"
            style={{ background: color }}
          />
          <span
            className="text-[11px] md:text-xs"
            style={{ fontFamily: MONO, color: INK_MUTED }}
          >
            {label}
          </span>
        </span>
      ))}
    </div>
  );
}

/* --- Retention ------------------------------------------------------------
   One cohort of 500 subscribers, decayed at two churn rates. The shaded gap
   between the curves is the whole point of the slide. */
export function RetentionCurve() {
  const active = useSlideActive();
  const [hover, setHover] = useState<number | null>(null);

  const W = 720;
  const H = 300;
  const PAD = { l: 46, r: 104, t: 16, b: 30 };
  const months = Array.from({ length: 13 }, (_, m) => m);
  const good = months.map((m) => 500 * 0.95 ** m); // 5% churn - 270 left at m12
  const bad = months.map((m) => 500 * 0.92 ** m); //  8% churn - 184 left at m12

  const x = (m: number) => PAD.l + (m / 12) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / 500) * (H - PAD.t - PAD.b);
  const line = (d: number[]) =>
    d.map((v, m) => `${m ? "L" : "M"}${x(m)},${y(v)}`).join(" ");
  const gap = `${line(good)} L${x(12)},${y(bad[12])} ${bad
    .map((v, m) => `L${x(12 - m)},${y(bad[12 - m])}`)
    .join(" ")} Z`;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Subscribers remaining from a cohort of 500 over twelve months at 5% and 8% monthly churn"
      >
        {[0, 125, 250, 375, 500].map((v) => (
          <g key={v}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y(v)}
              y2={y(v)}
              stroke={GRID}
              strokeWidth={1}
            />
            <text
              x={PAD.l - 10}
              y={y(v) + 4}
              textAnchor="end"
              fontSize={11}
              fontFamily={MONO}
              fill={INK_MUTED}
            >
              {v}
            </text>
          </g>
        ))}
        {[0, 3, 6, 9, 12].map((m) => (
          <text
            key={m}
            x={x(m)}
            y={H - 8}
            textAnchor="middle"
            fontSize={11}
            fontFamily={MONO}
            fill={INK_MUTED}
          >
            {m === 0 ? "start" : `m${m}`}
          </text>
        ))}

        <motion.path
          d={gap}
          fill="rgba(191,136,41,0.12)"
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        />

        {[[bad, SERIES_B] as const, [good, SERIES_A] as const].map(([d, c]) => (
          <motion.path
            key={c}
            d={line(d)}
            fill="none"
            stroke={c}
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: active ? 1 : 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}

        {/* Direct end labels - the legend alone leaves it too easy to read the
            two curves the wrong way round. */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ delay: 1.15, duration: 0.5 }}
        >
          {(
            [
              [good, SERIES_A, "5% churn"],
              [bad, SERIES_B, "8% churn"],
            ] as const
          ).map(([d, c, name]) => (
            <g key={name}>
              <circle cx={x(12)} cy={y(d[12])} r={4} fill={c} />
              <text
                x={x(12) + 10}
                y={y(d[12]) - 2}
                fontSize={13}
                fontFamily={MONO}
                fill={c}
              >
                {Math.round(d[12])} left
              </text>
              <text
                x={x(12) + 10}
                y={y(d[12]) + 13}
                fontSize={11}
                fontFamily={MONO}
                fill={INK_MUTED}
              >
                {name}
              </text>
            </g>
          ))}
        </motion.g>

        {hover !== null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.t}
              y2={H - PAD.b}
              stroke="rgba(236,232,212,0.25)"
              strokeWidth={1}
            />
            {(
              [
                [good, SERIES_A],
                [bad, SERIES_B],
              ] as const
            ).map(([d, c]) => (
              <circle
                key={c}
                cx={x(hover)}
                cy={y(d[hover])}
                r={5}
                fill={c}
                stroke="#0e0d0b"
                strokeWidth={2}
              />
            ))}
            <g
              transform={`translate(${Math.min(x(hover) + 12, W - 170)},${PAD.t + 8})`}
            >
              <rect
                width={158}
                height={54}
                rx={8}
                fill="#12100e"
                stroke={GRID}
              />
              <text
                x={12}
                y={20}
                fontSize={11}
                fontFamily={MONO}
                fill={INK_MUTED}
              >
                month {hover}
              </text>
              <text x={12} y={36} fontSize={12} fontFamily={MONO} fill={INK}>
                5%: {Math.round(good[hover])} active
              </text>
              <text x={12} y={49} fontSize={12} fontFamily={MONO} fill={INK}>
                8%: {Math.round(bad[hover])} active
              </text>
            </g>
          </g>
        )}

        {months.map((m) => (
          <rect
            key={m}
            x={x(m) - 26}
            y={0}
            width={52}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHover(m)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      <Legend
        items={[
          ["5% monthly churn - 270 of 500 still paying", SERIES_A],
          ["8% monthly churn - 184 of 500 still paying", SERIES_B],
        ]}
      />
    </figure>
  );
}

/* --- One cohort, two business models ------------------------------------- */
export function CohortRevenue() {
  const active = useSlideActive();
  const [hover, setHover] = useState<number | null>(null);

  const W = 720;
  const H = 300;
  const PAD = { l: 58, r: 16, t: 16, b: 30 };
  const months = Array.from({ length: 13 }, (_, m) => m);
  const oneOff = months.map((m) => (m === 0 ? 0 : 9900));
  const subs = months.map((m) => (19.99 * 100 * (1 - 0.92 ** m)) / 0.08);
  const max = 17000;

  const x = (m: number) => PAD.l + (m / 12) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);
  const line = (d: number[]) =>
    d.map((v, m) => `${m ? "L" : "M"}${x(m)},${y(v)}`).join(" ");

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Cumulative revenue from 100 customers: a one-off program versus a subscription, over twelve months"
      >
        {[0, 5000, 10000, 15000].map((v) => (
          <g key={v}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y(v)}
              y2={y(v)}
              stroke={GRID}
              strokeWidth={1}
            />
            <text
              x={PAD.l - 10}
              y={y(v) + 4}
              textAnchor="end"
              fontSize={11}
              fontFamily={MONO}
              fill={INK_MUTED}
            >
              {v ? `$${v / 1000}k` : "$0"}
            </text>
          </g>
        ))}
        {[0, 3, 6, 9, 12].map((m) => (
          <text
            key={m}
            x={x(m)}
            y={H - 8}
            textAnchor="middle"
            fontSize={11}
            fontFamily={MONO}
            fill={INK_MUTED}
          >
            {m === 0 ? "start" : `m${m}`}
          </text>
        ))}

        {(
          [
            [oneOff, SERIES_B],
            [subs, SERIES_A],
          ] as const
        ).map(([d, c]) => (
          <motion.path
            key={c}
            d={line(d)}
            fill="none"
            stroke={c}
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: active ? 1 : 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}

        {/* The crossover is the argument - label it directly. */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ delay: 1.25, duration: 0.5 }}
        >
          <circle
            cx={x(6.05)}
            cy={y(9900)}
            r={5}
            fill="none"
            stroke={INK}
            strokeWidth={1.5}
          />
          <text
            x={x(6.05)}
            y={y(9900) - 14}
            textAnchor="middle"
            fontSize={12}
            fontFamily={MONO}
            fill={INK}
          >
            month 6 · subscription passes it
          </text>
        </motion.g>

        {hover !== null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.t}
              y2={H - PAD.b}
              stroke="rgba(236,232,212,0.25)"
              strokeWidth={1}
            />
            <g
              transform={`translate(${Math.min(x(hover) + 12, W - 180)},${H - PAD.b - 62})`}
            >
              <rect
                width={168}
                height={54}
                rx={8}
                fill="#12100e"
                stroke={GRID}
              />
              <text
                x={12}
                y={20}
                fontSize={11}
                fontFamily={MONO}
                fill={INK_MUTED}
              >
                month {hover}
              </text>
              <text x={12} y={36} fontSize={12} fontFamily={MONO} fill={INK}>
                subs: {usd(subs[hover])}
              </text>
              <text x={12} y={49} fontSize={12} fontFamily={MONO} fill={INK}>
                one-off: {usd(oneOff[hover])}
              </text>
            </g>
          </g>
        )}
        {months.map((m) => (
          <rect
            key={m}
            x={x(m) - 26}
            y={0}
            width={52}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHover(m)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      <Legend
        items={[
          ["Subscription at $19.99 - $15,800 and still running", SERIES_A],
          ["One-off $99 program - $9,900, and that's the ceiling", SERIES_B],
        ]}
      />
    </figure>
  );
}

/* --- The two segments -----------------------------------------------------
   The product in one picture: every plan is recovery plus strength, and the
   ratio moves across the block instead of switching over on a fixed date. */
const RECOVERY = [75, 72, 68, 62, 56, 50, 44, 38, 33, 28, 24, 20];

export function RecoveryToStrength() {
  const active = useSlideActive();
  const [hover, setHover] = useState<number | null>(null);

  const W = 720;
  const H = 260;
  const PAD = { l: 16, r: 16, t: 28, b: 34 };
  const x = (w: number) => PAD.l + (w / 11) * (W - PAD.l - PAD.r);
  const y = (pct: number) => PAD.t + (1 - pct / 100) * (H - PAD.t - PAD.b);

  const boundary = RECOVERY.map(
    (v, w) => `${w ? "L" : "M"}${x(w)},${y(v)}`,
  ).join(" ");
  const recoveryArea = `${boundary} L${x(11)},${y(0)} L${x(0)},${y(0)} Z`;
  const strengthArea = `${boundary} L${x(11)},${y(100)} L${x(0)},${y(100)} Z`;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Across a twelve-week block, the recovery share of each session falls from 75% to 20% while the strength share rises from 25% to 80%"
      >
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <path d={strengthArea} fill={SERIES_B} fillOpacity={0.55} />
          <path d={recoveryArea} fill={SERIES_A} fillOpacity={0.75} />
          {/* 2px of surface between the two fills, per the mark spec. */}
          <path d={boundary} fill="none" stroke="#0e0d0b" strokeWidth={3} />
          <path d={boundary} fill="none" stroke={SERIES_A} strokeWidth={2} />
        </motion.g>

        <text
          x={x(0.4)}
          y={y(30)}
          fontSize={14}
          fontFamily={MONO}
          fill="#0a0a0a"
          fontWeight="700"
        >
          Recovery
        </text>
        <text
          x={x(9.1)}
          y={y(62)}
          fontSize={14}
          fontFamily={MONO}
          fill="#0a0a0a"
          fontWeight="700"
        >
          Strength
        </text>

        {[0, 3, 7, 11].map((w) => (
          <text
            key={w}
            x={x(w)}
            y={H - 10}
            textAnchor={w === 0 ? "start" : w === 11 ? "end" : "middle"}
            fontSize={11}
            fontFamily={MONO}
            fill={INK_MUTED}
          >
            week {w + 1}
          </text>
        ))}

        {hover !== null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.t}
              y2={H - PAD.b}
              stroke="rgba(236,232,212,0.35)"
              strokeWidth={1}
            />
            <g
              transform={`translate(${Math.min(x(hover) + 10, W - 150)},${PAD.t - 22})`}
            >
              <rect
                width={140}
                height={20}
                rx={6}
                fill="#12100e"
                stroke={GRID}
              />
              <text x={10} y={14} fontSize={11} fontFamily={MONO} fill={INK}>
                wk {hover + 1} · {RECOVERY[hover]}% recovery
              </text>
            </g>
          </g>
        )}
        {RECOVERY.map((_, w) => (
          <rect
            key={w}
            x={x(w) - 30}
            y={0}
            width={60}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHover(w)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      <Legend
        items={[
          ["Recovery - mobility, isometrics, controlled loading", SERIES_A],
          ["Strength - the training he actually came for", SERIES_B],
        ]}
      />
    </figure>
  );
}

/* --- Commission ---------------------------------------------------------- */
const ROUTES = [
  {
    label: "App Store / Play - year one",
    kept: 7000,
    cut: 3000,
    note: "30% commission",
  },
  {
    label: "App Store / Play - Small Business",
    kept: 8500,
    cut: 1500,
    note: "15% commission",
  },
  {
    label: "Stripe, on the web",
    kept: 9560,
    cut: 440,
    note: "2.9% + $0.30 per charge",
  },
];

export function CommissionBars() {
  const active = useSlideActive();
  const [hover, setHover] = useState<number | null>(null);

  return (
    <figure className="flex flex-col gap-4">
      {ROUTES.map((r, i) => (
        <div
          key={r.label}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        >
          <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
            <span
              className="text-xs font-semibold md:text-sm"
              style={{ color: i === 2 ? INK : INK_MUTED }}
            >
              {r.label}
            </span>
            <span
              className="text-[11px] md:text-xs"
              style={{ fontFamily: MONO, color: INK_MUTED }}
            >
              {r.note}
            </span>
          </div>
          <div className="flex h-9 w-full gap-[2px] md:h-11">
            <motion.div
              className="flex items-center rounded-l-[4px] rounded-r-[4px] pl-3"
              style={{ background: SERIES_A }}
              initial={{ width: 0 }}
              animate={{ width: active ? `${(r.kept / 10000) * 100}%` : 0 }}
              transition={{
                delay: 0.15 + i * 0.12,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span
                className="text-xs font-bold md:text-sm"
                style={{ color: "#0a0a0a", fontFamily: MONO }}
              >
                {usd(r.kept)}
              </span>
            </motion.div>
            <motion.div
              className="flex items-center justify-end rounded-[4px] pr-2"
              style={{ background: SERIES_B, opacity: hover === i ? 1 : 0.85 }}
              initial={{ width: 0 }}
              animate={{ width: active ? `${(r.cut / 10000) * 100}%` : 0 }}
              transition={{
                delay: 0.15 + i * 0.12,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span
                className="hidden text-xs font-bold sm:inline md:text-sm"
                style={{ color: "#0a0a0a", fontFamily: MONO }}
              >
                −{usd(r.cut)}
              </span>
            </motion.div>
          </div>
        </div>
      ))}
      <Legend
        items={[
          ["What reaches Dr.Brace LLC", SERIES_A],
          ["What the platform takes", SERIES_B],
        ]}
      />
    </figure>
  );
}

/* --- Running costs -------------------------------------------------------
   A bar comparing $103 to $10,000 would render as an invisible sliver, so
   this is a table with proportional rules and one hero number instead. */
export const COSTS = [
  ["Supabase Pro", 25, "Database, auth and storage for every user"],
  ["LLM plan generation", 25, "~2,000 plans a month at 500 users"],
  ["Vercel Pro", 20, "The funnel, quiz and results pages"],
  ["Push notifications", 0, "Expo, free at this volume"],
  ["Apple Developer", 8, "$99 a year, spread monthly"],
  ["Google Play", 2, "$25 once, spread over year one"],
] as const;

export function UnitEconomics() {
  const active = useSlideActive();
  const total = COSTS.reduce((s, c) => s + c[1], 0);

  return (
    <figure>
      <div className="grid gap-2 sm:grid-cols-2">
        {COSTS.map(([label, cost, note], i) => (
          <div
            key={label}
            className="rounded-lg px-3 py-2.5"
            style={{
              background: "rgba(236,232,212,0.035)",
              border: "1px solid rgba(236,232,212,0.07)",
            }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span
                className="text-xs font-semibold md:text-sm"
                style={{ color: INK }}
              >
                {label}
              </span>
              <span
                className="text-xs font-bold md:text-sm"
                style={{ fontFamily: MONO, color: SERIES_A }}
              >
                {cost ? `$${cost}` : "$0"}
              </span>
            </div>
            <p
              className="mt-1 text-[11px] leading-snug"
              style={{ color: INK_MUTED }}
            >
              {note}
            </p>
            <motion.div
              className="mt-2 h-[3px] rounded-full"
              style={{ background: SERIES_A }}
              initial={{ width: 0 }}
              animate={{ width: active ? `${(cost / 25) * 100}%` : 0 }}
              transition={{ delay: 0.2 + i * 0.06, duration: 0.6 }}
            />
          </div>
        ))}
      </div>
      <p
        className="mt-4 text-xs md:text-sm"
        style={{ fontFamily: MONO, color: INK_MUTED }}
      >
        Total ≈ ${total}/month against $10,000 MRR - about 1% of revenue.
      </p>
    </figure>
  );
}
