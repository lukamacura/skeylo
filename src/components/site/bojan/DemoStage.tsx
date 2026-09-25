"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, motion } from "framer-motion";
import { Check, Pointer } from "lucide-react";
import { MONO, RED, useDemo, useTheme } from "./primitives";

/* The frame every clickable phone sits in. Above it a badge says this is a
   live demo and what to do; around it a red ring breathes until the phone
   has been touched once. "Probaj demo" in the deck's bar bumps `focusTick`
   and the frame scrolls into view and pulses. */
export function DemoStage({
  children,
  radius = 46,
  className = "",
}: {
  children: ReactNode;
  radius?: number;
  className?: string;
}) {
  const { tried, focusTick } = useDemo();
  const t = useTheme();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusTick) return;
    const el = box.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    const controls = animate(
      el,
      { scale: [1, 1.03, 1] },
      { duration: 0.55, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] },
    );
    return () => controls.stop();
  }, [focusTick]);

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={box}
        className="relative mx-auto w-fit"
        style={{ scrollMarginTop: 12 }}
      >
        {/* The badge, pinned to the top edge of the frame. */}
        <div className="absolute inset-x-0 -top-4 z-[6] flex justify-center">
          <span
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white md:text-[11px]"
            style={{
              fontFamily: MONO,
              background: tried ? "#111" : RED,
              boxShadow: "0 8px 20px -8px rgba(0,0,0,0.5)",
              border: "2px solid " + t.bg,
              transition: "background-color .3s",
            }}
          >
            {tried ? (
              <>
                <Check size={13} strokeWidth={3} />
                Isprobano · klikajte dalje
              </>
            ) : (
              <>
                <span className="relative grid h-2 w-2 place-items-center">
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-white"
                    animate={{ scale: [1, 2.6], opacity: [0.8, 0] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>
                Live demo · dodirnite ekran
              </>
            )}
          </span>
        </div>

        {/* The breathing ring. Sits just outside the frame, same corner. */}
        {!tried && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-1.5 z-[1]"
            style={{ borderRadius: radius + 6, border: `2px solid ${RED}` }}
            animate={{ opacity: [0.75, 0], scale: [1, 1.05] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              repeatDelay: 0.4,
              ease: "easeOut",
            }}
          />
        )}

        <div className="relative z-[2]">{children}</div>
      </div>
    </div>
  );
}

/* A finger that taps where the demo wants the first touch. Absolutely
   positioned by the parent (which must be `relative`); gone once tried. */
export function TapHint({
  label = "Dodirni",
  className = "",
  style,
  show = true,
}: {
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  show?: boolean;
}) {
  const { tried } = useDemo();
  if (tried || !show) return null;
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute z-[60] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center ${className}`}
      style={style}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 18 }}
    >
      <span className="relative grid h-12 w-12 place-items-center">
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ border: `2.5px solid ${RED}` }}
          animate={{ scale: [0.7, 2], opacity: [0.9, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.span
          className="grid h-11 w-11 place-items-center rounded-full text-white"
          style={{
            background: RED,
            boxShadow: "0 0 0 3px #fff, 0 10px 24px rgba(0,0,0,0.35)",
          }}
          animate={{ scale: [1, 0.82, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Pointer size={22} strokeWidth={2.4} />
        </motion.span>
      </span>
      <span
        className="mt-1.5 whitespace-nowrap rounded-full bg-black px-2.5 py-1 text-[11px] font-extrabold text-white"
        style={{ boxShadow: "0 0 0 2px #fff" }}
      >
        {label}
      </span>
    </motion.div>
  );
}
