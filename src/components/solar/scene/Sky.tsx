"use client";

import { memo } from "react";
import { clamp01, lerp, smooth, tri } from "./geometry";
import { SKY_SPRING, sunAt, tri3, tri3a, useSprung, type Frame } from "./light";

/* ------------------------------------------------------------------ */
/*  Nebo                                                                */
/*  Nebo je HTML sloj, ne SVG: oblaci, zraci sunca i zvezde se kreću    */
/*  samo preko transform/opacity, pa ih pomera kompozitor i glavna nit  */
/*  ostaje slobodna za kviz. Prelaz dan → zalazak → noć je pretapanje   */
/*  tri gotova gradijenta, što je piksel u piksel isto što i mešanje    */
/*  boja, ali bez ponovnog crtanja.                                     */
/* ------------------------------------------------------------------ */

const GRADIENTS = [
  ["#1f5fb4", "#4f97dc", "#8fc4ee", "#bfe0f7"],
  ["#1d2352", "#6f3f74", "#e2745c", "#ffb066"],
  ["#05080f", "#0a1222", "#11203a", "#182a47"],
].map(
  (c) =>
    `linear-gradient(to bottom, ${c[0]} 0%, ${c[1]} 55%, ${c[2]} 85%, ${c[3]} 100%)`,
);

const fill = { position: "absolute", inset: 0 } as const;

function Sky({
  timeTarget,
  frame: f,
  sunLevel,
  still,
}: {
  timeTarget: number;
  frame: Frame;
  sunLevel: number;
  still: boolean;
}) {
  const t = clamp01(useSprung(timeTarget, still, SKY_SPRING, 1 / 400));
  const sun = sunAt(f, t, sunLevel);
  const high = f.top + 50 * f.ks;
  const moonUp = smooth(0.55, 1, t);
  const moonY = lerp(f.ground + 60 * f.ks, lerp(high, f.ground, 0.16), moonUp);
  const stars = smooth(0.45, 0.95, t);
  const clouds = tri(0.92, 0.7, 0.16, t) * lerp(1, 0.55, sunLevel);
  const cloudFill = tri3("#ffffff", "#ffc2a3", "#23304a", t);
  const glowR = tri(96, 150, 150, t);

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden [contain:strict]"
    >
      <div style={{ ...fill, bottom: "auto", height: f.ground + 2 }}>
        <div style={{ ...fill, background: GRADIENTS[0] }} />
        <div
          style={{
            ...fill,
            background: GRADIENTS[1],
            opacity: clamp01(t * 2),
            willChange: "opacity",
          }}
        />
        <div
          style={{
            ...fill,
            background: GRADIENTS[2],
            opacity: clamp01((t - 0.5) * 2),
            willChange: "opacity",
          }}
        />
      </div>

      {stars > 0.01 && (
        <div style={{ ...fill, opacity: stars }}>
          {STARS.map(([fx, fy, size], i) => {
            const r = Math.max(1, Math.round(size * 2)) / 2;
            return (
              <span
                key={i}
                className={i % 3 === 0 ? "hs-twinkle" : undefined}
                style={{
                  position: "absolute",
                  left: Math.round(fx * f.w) - r,
                  top: Math.round(lerp(0, f.ground - 90 * f.zoom, fy)) - r,
                  width: r * 2,
                  height: r * 2,
                  borderRadius: "50%",
                  background: "#dbe7ff",
                  animationDuration: `${2.4 + (i % 5) * 0.7}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Mesec */}
      {moonUp > 0.01 && (
        <svg
          viewBox="-70 -70 140 140"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 140 * f.ks,
            height: 140 * f.ks,
            opacity: moonUp,
            transform: `translate3d(${f.w * 0.2 - 70 * f.ks}px, ${moonY - 70 * f.ks}px, 0)`,
            willChange: "transform, opacity",
          }}
        >
          <defs>
            <radialGradient id="hs-moonglow">
              <stop offset="0" stopColor="#cfe0ff" stopOpacity={0.35} />
              <stop offset="1" stopColor="#cfe0ff" stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle r={70} fill="url(#hs-moonglow)" />
          <circle r={20} fill="#eef3ff" />
          <circle cx={-6} cy={-5} r={4.5} fill="#cfd9ee" />
          <circle cx={7} cy={4} r={3} fill="#cfd9ee" />
          <circle cx={-2} cy={9} r={2} fill="#d6dff0" />
        </svg>
      )}

      {/* Sunce */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          transform: `translate3d(${sun.x}px, ${sun.y}px, 0) scale(${sun.scale})`,
          willChange: "transform",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -glowR,
            top: -glowR,
            width: glowR * 2,
            height: glowR * 2,
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${tri3a("#fff2b0", "#ff9d4d", "#ff7a3a", t, 0.6)} 0%, ${tri3a("#ffe28a", "#ff8a3a", "#ff7a3a", t, 0.14)} 50%, rgba(255,176,64,0) 100%)`,
          }}
        />
        <svg
          viewBox="-60 -60 120 120"
          className="hs-spin"
          style={{
            position: "absolute",
            left: -60,
            top: -60,
            width: 120,
            height: 120,
            opacity: clamp01(1 - t * 2.4),
          }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <rect
              key={i}
              x={-1.5}
              y={-54}
              width={3}
              height={i % 2 ? 9 : 15}
              rx={1.5}
              fill="#ffe27a"
              transform={`rotate(${i * 30})`}
            />
          ))}
        </svg>
        <div
          style={{
            position: "absolute",
            left: -30,
            top: -30,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${tri3("#fffbe6", "#ffe0a0", "#ffb070", t)} 0%, ${tri3("#ffd84d", "#ff9a3c", "#ff6a30", t)} 60%, ${tri3("#ffb31a", "#ff6f2e", "#e04a28", t)} 100%)`,
          }}
        />
      </div>

      {/* Oblaci */}
      <div style={{ ...fill, opacity: clouds }}>
        {CLOUDS.map(([fx, fy, sc, dur], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: `translate3d(${fx * f.w}px, ${lerp(high, f.ground - 120 * f.zoom, fy)}px, 0)`,
            }}
          >
            <svg
              viewBox="-40 -30 84 46"
              className="hs-drift"
              style={
                {
                  position: "absolute",
                  left: -40 * sc * f.ks,
                  top: -30 * sc * f.ks,
                  width: 84 * sc * f.ks,
                  height: 46 * sc * f.ks,
                  overflow: "visible",
                  animationDuration: `${dur}s`,
                  "--hs-drift": `${26 * sc * f.ks}px`,
                } as React.CSSProperties
              }
              fill={cloudFill}
            >
              <ellipse cx={0} cy={0} rx={34} ry={11} />
              <ellipse cx={-14} cy={-8} rx={16} ry={11} />
              <ellipse cx={8} cy={-12} rx={20} ry={14} />
              <ellipse cx={26} cy={-4} rx={14} ry={9} />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(Sky);

/** Zvezde u udelima kadra (x, y, poluprečnik), da prate svaki oblik scene. */
const STARS: [number, number, number][] = [
  [0.06, 0.12, 1.3],
  [0.16, 0.3, 1],
  [0.24, 0.06, 1.5],
  [0.34, 0.22, 0.9],
  [0.45, 0.08, 1.2],
  [0.56, 0.18, 1],
  [0.65, 0.05, 1.4],
  [0.12, 0.56, 0.9],
  [0.3, 0.46, 1.1],
  [0.7, 0.42, 0.9],
  [0.95, 0.1, 1.2],
  [0.04, 0.78, 1],
  [0.5, 0.62, 0.9],
  [0.86, 0.66, 1],
  [0.4, 0.36, 1.2],
  [0.78, 0.22, 1.1],
  [0.9, 0.4, 0.9],
  [0.2, 0.7, 1],
];

/** Oblaci: x i y u udelima neba, veličina, trajanje jednog prolaza (s). */
const CLOUDS: [number, number, number, number][] = [
  [0.14, 0.18, 1.1, 46],
  [0.46, 0.05, 0.8, 58],
  [0.3, 0.62, 0.7, 52],
];
