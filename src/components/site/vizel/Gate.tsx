"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { GOLD, INK, INK_MUTED, MONO } from "./primitives";

export const PASSPHRASE = "danielvizel26";

export default function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(0);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (value.trim().toLowerCase() === PASSPHRASE) {
      onUnlock();
      return;
    }
    setValue("");
    setWrong((n) => n + 1);
  }

  return (
    <div className="hero-radial grain relative flex min-h-[100svh] flex-col items-center justify-center px-6">
      <div
        aria-hidden
        className="hero-grid pointer-events-none absolute inset-0"
      />
      <motion.div
        key={wrong}
        initial={wrong ? { x: -9 } : false}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 900, damping: 12 }}
        className="relative z-10 w-full max-w-sm"
      >
        <Lock size={20} style={{ color: GOLD }} />
        <h1
          className="mt-4 text-[clamp(1.5rem,6vw,2.1rem)] font-bold leading-tight tracking-[-0.03em]"
          style={{ fontFamily: "var(--font-display)", color: INK }}
        >
          Private presentation
        </h1>
        <p className="mt-2 text-sm" style={{ color: INK_MUTED }}>
          Prepared for Daniel Vizel. Enter the pass you were sent.
        </p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <label htmlFor="vizel-pass" className="sr-only">
            Pass
          </label>
          <input
            id="vizel-pass"
            type="password"
            autoFocus
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="passphrase"
            aria-invalid={wrong > 0}
            className="w-full rounded-md px-4 py-3 text-[15px] outline-none transition-colors focus:border-[rgba(240,182,86,0.6)]"
            style={{
              fontFamily: MONO,
              color: INK,
              background: "rgba(236,232,212,0.05)",
              border: `1px solid ${wrong ? "rgba(216,121,40,0.7)" : "rgba(236,232,212,0.12)"}`,
            }}
          />
          <button
            type="submit"
            className="group inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#f0b656] to-[#d87928] px-5 py-3 text-[15px] font-extrabold text-[#0a0a0a] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0b656]"
          >
            Open
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </form>

        <p
          className="mt-3 h-4 text-xs"
          style={{ fontFamily: MONO, color: wrong ? "#d87928" : "transparent" }}
          role={wrong ? "alert" : undefined}
        >
          {wrong ? "That passphrase doesn't match. Try again." : "·"}
        </p>
      </motion.div>
    </div>
  );
}
