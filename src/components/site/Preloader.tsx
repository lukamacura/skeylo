/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type SkeyloPreloaderProps = {
  texts?: string[];
  intervalMs?: number;
  loop?: boolean;
  /**
   * Ako je true, komponenta će sama da se sakrije (fade-out) kad završi.
   * Ako je false, vidljivost kontroliše parent (preporučeno za veće app-ove).
   */
  autoHide?: boolean;
  /**
   * Trajanje fade-out animacije u ms kada se komponenta sakriva.
   */
  fadeOutMs?: number;
  onComplete?: () => void;
  className?: string;
};

const DEFAULT_TEXTS = [
  "Proveravamo podatke ℹ️",
  "Otkrivamo gde je problem ⚠️",
  "Dobijaš jasan plan korak‑po‑korak 🚀",
];

export default function Preloader({
  texts = DEFAULT_TEXTS,
  intervalMs = 2000,
  loop = true,
  autoHide = true,
  fadeOutMs = 350,
  onComplete,
  className = "",
}: SkeyloPreloaderProps) {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true); // lokalna vidljivost (za autoHide)
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const safeInterval = Math.max(800, intervalMs);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIndex((prev) => {
        const next = prev + 1;
        if (next >= texts.length) {
          if (loop) return 0;
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          // prvo pozovi onComplete, pa ako je autoHide — sakrij komponentu
          if (onComplete) onComplete();
          if (autoHide) {
            // odradi fade-out (AnimatePresence exit) i potom unmount (return null)
            // AnimatePresence će odraditi animaciju, a mi posle njenog vremena setujemo isVisible=false
            setTimeout(() => setIsVisible(false), fadeOutMs);
          }
          return prev;
        }
        return next;
      });
    }, safeInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loop, onComplete, safeInterval, texts.length, autoHide, fadeOutMs]);

  const progress = useMemo(
    () => (index + 1) / texts.length,
    [index, texts.length],
  );

  // Kada autoHide i isVisible postane false — potpuno ukloni iz DOM-a
  if (autoHide && !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="preloader-root"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: fadeOutMs / 1000 }}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black text-white ${className}`}
        aria-live="polite"
        role="status"
      >
        {/* Subtle grid / noise overlay for depth */}
        <div className="pointer-events-none absolute inset-0 opacity-10 [background:radial-gradient(circle_at_center,_#fff_1px,_transparent_1px)] [background-size:24px_24px]" />

        <div className="relative z-10 flex flex-col items-center gap-8">
          {/* Logo */}
          <motion.div
            className="flex items-center justify-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
          >
            <LogoMark className="h-24" />
          </motion.div>

          {/* Rotating message */}
          <div className="min-h-[2.5rem] text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                className="mx-auto max-w-xl px-6 text-center text-xl font-semibold text-foreground md:text-2xl"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
              >
                {texts[index]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="relative h-1.5 w-72 overflow-hidden rounded-full bg-neutral-800 md:w-96">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
            />
            <motion.div
              className="absolute inset-0 h-full w-1/3 bg-white/10"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
            />
          </div>

          <p className="text-xs text-neutral-400">
            Naš fokus nije na kampanjama, već na stvarnom rastu i profitu.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function LogoMark({ className = "" }: { className?: string }) {
  return <img src="/logo.png" alt="Skeylo logo" className={className} />;
}
