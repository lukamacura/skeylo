"use client";

import { memo } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
} from "framer-motion";
import { clamp01, G } from "./geometry";
import { SKY_SPRING, sunAt, useSprung, type Frame } from "./light";

/** Tok energije: tačkice po žici i zraci ka krovu, iznad svega ostalog. */
function Flow({
  timeTarget,
  viewBox,
  vbX,
  vbY,
  frame,
  sunLevel,
  wire,
  solved,
  rays,
  flowSpeed,
  roofX,
  roofY,
  spread,
  treeX,
  still,
}: {
  timeTarget: number;
  viewBox: string;
  vbX: number;
  vbY: number;
  frame: Frame;
  sunLevel: number;
  wire: string;
  solved: boolean;
  rays: boolean;
  /** Sekunde za jedan korak tačkica po žici. */
  flowSpeed: number;
  roofX: number;
  roofY: number;
  spread: number;
  /** Gde stoji drvo; tok po žici prolazi iza njegove krošnje. null = nema drveta. */
  treeX: number | null;
  still: boolean;
}) {
  const t = clamp01(useSprung(timeTarget, still, SKY_SPRING, 1 / 400));
  const sun = sunAt(frame, t, sunLevel);
  const sunX = vbX + sun.x / frame.zoom;
  const sunY = vbY + sun.y / frame.zoom;
  const reach = (sun.scale * 40) / frame.zoom;

  // Tačkice vozi jedan brojač, pa promena brzine (viši račun) nema trzaj:
  // menja se samo korak, a ne faza animacije.
  const wireOffset = useMotionValue(0);
  const rayOffset = useMotionValue(0);
  useAnimationFrame((_, delta) => {
    if (still) return;
    const dt = Math.min(delta, 50) / 1000;
    const step = (36 / (solved ? 1.6 : flowSpeed)) * dt;
    wireOffset.set((wireOffset.get() + (solved ? step : -step)) % 36);
    if (rays) rayOffset.set((rayOffset.get() - (32 / 1.2) * dt) % 32);
  });

  return (
    <svg
      viewBox={viewBox}
      className="pointer-events-none absolute inset-0 block h-full w-full"
      aria-hidden
    >
      {treeX !== null && (
        <mask
          id="hs-behind-tree"
          maskUnits="userSpaceOnUse"
          x={-2000}
          y={-2000}
          width={5000}
          height={5000}
        >
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#fff" />
          <g
            transform={`translate(${treeX} ${G - 20}) scale(0.92)`}
            fill="#000"
          >
            <rect x={-4} y={-52} width={8} height={52} />
            <circle cx={-18} cy={-62} r={24} />
            <circle cx={16} cy={-58} r={26} />
            <circle cx={0} cy={-88} r={30} />
          </g>
        </mask>
      )}
      <g mask={treeX !== null ? "url(#hs-behind-tree)" : undefined}>
        <motion.path
          d={wire}
          fill="none"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray="1 17"
          initial={false}
          animate={{ stroke: solved ? "#3ddc97" : "#ff9f1a" }}
          transition={{ duration: still ? 0 : 0.6 }}
          style={{ strokeDashoffset: wireOffset, opacity: 0.95 }}
        />
      </g>
      {/* Zraci ka krovu — kad ima panela i kad je obračun gotov */}
      <AnimatePresence>
        {rays && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, delay: still ? 0 : 0.5 }}
          >
            {[-0.32, 0, 0.32].map((q) => {
              const tx = roofX + q * spread;
              const len = Math.hypot(tx - sunX, roofY - sunY) || 1;
              return (
                <motion.line
                  key={q}
                  x1={sunX + ((tx - sunX) / len) * reach}
                  y1={sunY + ((roofY - sunY) / len) * reach}
                  x2={tx}
                  y2={roofY}
                  stroke="#fff0a8"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeDasharray="2 14"
                  opacity={0.9}
                  style={{ strokeDashoffset: rayOffset }}
                />
              );
            })}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

export default memo(Flow);
