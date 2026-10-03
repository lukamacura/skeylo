"use client";

import { useState } from "react";

// Potrošnja firme po satima naspram proizvodnje sunca, oba kao % svog dnevnog vrha.
// Poenta nije tačna brojka nego poklapanje: koliko se krive preklapaju.

const HOURS = Array.from({ length: 24 }, (_, h) => h);

/** Proizvodnja elektrane tokom sunčanog dana, % podneva. */
const SUN = [
  0, 0, 0, 0, 0, 3, 12, 28, 46, 64, 80, 92, 100, 98, 90, 76, 58, 38, 18, 5, 0,
  0, 0, 0,
];

export const PROFILES = {
  /** Proizvodna firma, jedna smena 7–15h. */
  smena: [
    12, 12, 12, 12, 12, 14, 40, 92, 100, 100, 98, 96, 85, 96, 94, 60, 24, 15,
    13, 12, 12, 12, 12, 12,
  ],
  /** Magacin / hala, rad od jutra do večeri. */
  ceoDan: [
    22, 22, 22, 22, 22, 24, 55, 85, 92, 95, 97, 100, 98, 98, 97, 95, 90, 82, 60,
    35, 26, 24, 22, 22,
  ],
} as const;

// Validirano za tamnu podlogu (#121826): ΔE 28+ i za daltoniste.
const USE = "#5b8def";
const SUN_C = "#c98500";

const W = 360;
const H = 190;
const PAD = { l: 8, r: 8, t: 14, b: 26 };
const CW = (W - PAD.l - PAD.r) / 24;
const y = (v: number) => PAD.t + (1 - v / 100) * (H - PAD.t - PAD.b);

export default function SeasonChart({
  profile,
  useLabel,
  highlight,
}: {
  profile: readonly number[];
  useLabel: string;
  /** Sati [od, do) koje ističemo kao radno vreme. */
  highlight: [number, number];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const linePts = SUN.map((v, i) => `${PAD.l + CW * (i + 0.5)},${y(v)}`).join(
    " ",
  );
  const base = y(0);
  const inWork = (h: number) => h >= highlight[0] && h < highlight[1];

  return (
    <figure className="relative">
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#aab3c5]">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-[3px]" style={{ background: USE }} />
          {useLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="h-[3px] w-4 rounded-full"
            style={{ background: SUN_C }}
          />
          Proizvodnja elektrane
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full"
          role="img"
          aria-label={`${useLabel} i proizvodnja solarne elektrane po satima`}
          onPointerLeave={() => setHover(null)}
        >
          {[25, 50, 75, 100].map((g) => (
            <line
              key={g}
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y(g)}
              y2={y(g)}
              stroke="rgba(255,255,255,0.06)"
            />
          ))}
          <rect
            x={PAD.l + CW * highlight[0]}
            y={PAD.t - 6}
            width={CW * (highlight[1] - highlight[0])}
            height={base - PAD.t + 6}
            rx={6}
            fill="rgba(251,174,23,0.07)"
          />
          {profile.map((v, i) => {
            const x = PAD.l + CW * i + 1.5;
            const w = CW - 3;
            const top = y(v);
            const r = Math.min(3, w / 2);
            return (
              <path
                key={i}
                d={`M${x},${base} V${top + r} Q${x},${top} ${x + r},${top} H${x + w - r} Q${x + w},${top} ${x + w},${top + r} V${base} Z`}
                fill={USE}
                opacity={hover === null || hover === i ? 0.9 : 0.4}
              />
            );
          })}
          <polyline
            points={linePts}
            fill="none"
            stroke={SUN_C}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {hover !== null && (
            <circle
              cx={PAD.l + CW * (hover + 0.5)}
              cy={y(SUN[hover])}
              r={4.5}
              fill={SUN_C}
              stroke="#121826"
              strokeWidth={2}
            />
          )}
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={base}
            y2={base}
            stroke="rgba(255,255,255,0.18)"
          />
          {[0, 6, 12, 18].map((h) => (
            <text
              key={h}
              x={PAD.l + CW * (h + 0.5)}
              y={H - 8}
              textAnchor="middle"
              fontSize={10}
              fill="#7d879b"
            >
              {h}h
            </text>
          ))}
          <text
            x={PAD.l + CW * ((highlight[0] + highlight[1]) / 2)}
            y={H - 8}
            textAnchor="middle"
            fontSize={10}
            fontWeight={700}
            fill="#eef1f6"
          >
            radno vreme
          </text>
          {HOURS.map((h) => (
            <rect
              key={`hit-${h}`}
              x={PAD.l + CW * h}
              y={0}
              width={CW}
              height={H}
              fill="transparent"
              onPointerEnter={() => setHover(h)}
              onPointerDown={() => setHover(h)}
            />
          ))}
        </svg>

        {hover !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 w-max -translate-x-1/2 rounded-lg border border-white/10 bg-[#0b101b]/95 px-3 py-2 text-xs shadow-xl"
            style={{
              left: `clamp(70px, ${((PAD.l + CW * (hover + 0.5)) / W) * 100}%, calc(100% - 70px))`,
            }}
          >
            <p className="mb-1 font-semibold text-[#eef1f6]">
              {hover}:00–{hover + 1}:00{inWork(hover) ? " · radno vreme" : ""}
            </p>
            <p className="flex items-center gap-2 text-[#aab3c5]">
              <span
                className="h-2 w-2 rounded-[2px]"
                style={{ background: USE }}
              />
              Potrošnja{" "}
              <span className="ml-auto pl-3 font-semibold tabular-nums text-[#eef1f6]">
                {profile[hover]}%
              </span>
            </p>
            <p className="flex items-center gap-2 text-[#aab3c5]">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: SUN_C }}
              />
              Sunce{" "}
              <span className="ml-auto pl-3 font-semibold tabular-nums text-[#eef1f6]">
                {SUN[hover]}%
              </span>
            </p>
          </div>
        )}
      </div>
      <figcaption className="mt-2 text-[11px] leading-snug text-[#7d879b]">
        Ilustrativni dnevni profil, % dnevnog vrha. Tačne brojke za vaš objekat
        daje kalkulator.
      </figcaption>
    </figure>
  );
}
