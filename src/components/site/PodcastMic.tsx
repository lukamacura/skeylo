"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const GOLD = "#f0b656";

/** Total length of the intro (appear → hold → zoom out), in seconds. */
export const MIC_INTRO_DURATION = 1.05;

/**
 * Decorative broadcast microphone (PodMic-style) drawn in SVG, meant to sit
 * in the hero background behind the headline. Dark body with faint gold rim
 * light and a gold radial glow behind it. Purely decorative (aria-hidden).
 *
 * Intro: pops in large and fully visible, holds a beat, then zooms out and
 * fades away completely; the element unmounts once the intro is done. Hero
 * text should start after `MIC_INTRO_DURATION` (see `heroFadeUp` in the
 * landing).
 */
export default function PodcastMic({ className = "" }: { className?: string }) {
  const [done, setDone] = useState(false);
  if (done) return null;

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 1.18, y: 30 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [1.18, 1.3, 1.3, 1],
        y: [30, 0, 0, 0],
      }}
      onAnimationComplete={() => setDone(true)}
      /* scale from near the top so the windscreen stays in view while large */
      style={{ transformOrigin: "50% 12%" }}
      transition={{
        duration: MIC_INTRO_DURATION,
        times: [0, 0.22, 0.45, 1],
        ease: ["easeOut", "linear", [0.22, 1, 0.36, 1]],
      }}
      className={`pointer-events-none select-none ${className}`}
    >
      {/* radial glow */}
      <div
        className="absolute left-1/2 top-1/2 aspect-square w-[180%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${GOLD}33 0%, ${GOLD}14 30%, transparent 62%)`,
        }}
      />
      {/* slow float */}
      <motion.svg
        viewBox="0 0 200 340"
        className="relative block w-full"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="mic-foam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#101010" />
            <stop offset="0.5" stopColor="#232323" />
            <stop offset="1" stopColor="#0e0e0e" />
          </linearGradient>
          <linearGradient id="mic-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0d0d0d" />
            <stop offset="0.45" stopColor="#262626" />
            <stop offset="1" stopColor="#0b0b0b" />
          </linearGradient>
          <linearGradient id="mic-ring" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#141414" />
            <stop offset="0.5" stopColor="#3a3a3a" />
            <stop offset="1" stopColor="#141414" />
          </linearGradient>
          <linearGradient id="mic-rim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={GOLD} stopOpacity="0.55" />
            <stop offset="1" stopColor={GOLD} stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* yoke (U-bracket) */}
        <path
          d="M34 232 C34 292, 166 292, 166 232"
          fill="none"
          stroke="#1c1c1c"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M34 232 C34 292, 166 292, 166 232"
          fill="none"
          stroke="url(#mic-rim)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* stand stub */}
        <rect
          x="84"
          y="262"
          width="32"
          height="66"
          rx="6"
          fill="url(#mic-body)"
        />
        <ellipse
          cx="100"
          cy="262"
          rx="18"
          ry="6"
          fill="#2a2a2a"
          stroke="url(#mic-rim)"
          strokeWidth="1"
        />
        <rect
          x="84"
          y="262"
          width="32"
          height="66"
          rx="6"
          fill="none"
          stroke="url(#mic-rim)"
          strokeWidth="1"
        />

        {/* side knobs */}
        <rect
          x="8"
          y="212"
          width="34"
          height="38"
          rx="9"
          fill="url(#mic-body)"
          stroke="url(#mic-rim)"
          strokeWidth="1"
        />
        <rect
          x="158"
          y="212"
          width="34"
          height="38"
          rx="9"
          fill="url(#mic-body)"
          stroke="url(#mic-rim)"
          strokeWidth="1"
        />

        {/* body */}
        <path
          d="M46 150 H154 V214 C154 236, 138 254, 100 254 C62 254, 46 236, 46 214 Z"
          fill="url(#mic-body)"
          stroke="url(#mic-rim)"
          strokeWidth="1.2"
        />
        {/* thin body seam */}
        <line
          x1="50"
          y1="196"
          x2="150"
          y2="196"
          stroke="#050505"
          strokeWidth="2"
        />
        <line
          x1="50"
          y1="198"
          x2="150"
          y2="198"
          stroke={GOLD}
          strokeOpacity="0.18"
          strokeWidth="0.8"
        />

        {/* windscreen foam */}
        <path
          d="M52 150 V52 C52 24, 68 12, 100 12 C132 12, 148 24, 148 52 V150 Z"
          fill="url(#mic-foam)"
          stroke="url(#mic-rim)"
          strokeWidth="1"
        />

        {/* grille rings */}
        {[44, 80, 116].map((y) => (
          <g key={y}>
            <rect
              x="42"
              y={y}
              width="116"
              height="10"
              rx="5"
              fill="url(#mic-ring)"
            />
            <rect
              x="42"
              y={y}
              width="116"
              height="10"
              rx="5"
              fill="none"
              stroke="url(#mic-rim)"
              strokeWidth="1"
            />
          </g>
        ))}
        {/* lower collar ring */}
        <rect
          x="40"
          y="146"
          width="120"
          height="12"
          rx="6"
          fill="url(#mic-ring)"
          stroke="url(#mic-rim)"
          strokeWidth="1"
        />

        {/* highlight on foam edge */}
        <path
          d="M66 40 C70 26, 84 18, 100 18"
          fill="none"
          stroke={GOLD}
          strokeOpacity="0.35"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </motion.svg>
    </motion.div>
  );
}
