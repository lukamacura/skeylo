"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";

/** Per-letter stagger in seconds. */
export const LETTER_STAGGER = 0.022;
/** Duration of a single letter's reveal in seconds. */
const LETTER_DURATION = 0.32;

/** Total time for `text` to finish revealing, given its start delay. */
export function lettersDuration(text: string) {
  return (text.length - 1) * LETTER_STAGGER + LETTER_DURATION;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

/** Linear mix of two hex colors, t in [0, 1]. */
function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${c(r1, r2)}, ${c(g1, g2)}, ${c(b1, b2)})`;
}

/**
 * Reveals `text` letter by letter (slide up + fade), word-wrapping only at
 * word boundaries. Optional `gradient` colors each letter along a
 * left→right ramp so the phrase reads as one gradient even while letters
 * are individually transformed (background-clip:text on a parent would
 * break during child transforms).
 */
export default function AnimatedLetters({
  text,
  delay = 0,
  gradient,
  className = "",
}: {
  text: string;
  /** Seconds before the first letter starts. */
  delay?: number;
  /** [from, to] hex colors applied across the whole phrase. */
  gradient?: [string, string];
  className?: string;
}) {
  const words = text.split(" ");
  const total = text.length;
  let index = 0;

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {words.map((word, w) => {
        const letters = Array.from(word);
        const start = index;
        index += letters.length;
        const last = w === words.length - 1;
        // count the space between words so the color ramp stays continuous
        if (!last) index += 1;
        return (
          <Fragment key={`${w}-${word}`}>
            <span aria-hidden className="inline-block whitespace-nowrap">
              {letters.map((ch, i) => {
                const k = start + i;
                return (
                  <motion.span
                    key={`${k}-${ch}`}
                    className="inline-block"
                    style={
                      gradient
                        ? {
                            color: mix(
                              gradient[0],
                              gradient[1],
                              k / Math.max(1, total - 1),
                            ),
                          }
                        : undefined
                    }
                    initial={{ opacity: 0, y: "0.45em" }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: delay + k * LETTER_STAGGER,
                      duration: LETTER_DURATION,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {ch}
                  </motion.span>
                );
              })}
            </span>
            {/* real space between word blocks (outside, so it is not trimmed) */}
            {!last && " "}
          </Fragment>
        );
      })}
    </span>
  );
}
