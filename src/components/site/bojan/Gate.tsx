"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { DISPLAY, MONO, RED } from "./primitives";
import { NetoLogo } from "./visuals";

export const PASS = "bojanneto26";

export default function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(0);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (value.trim().toLowerCase() === PASS) {
      onUnlock();
      return;
    }
    setValue("");
    setWrong((n) => n + 1);
  }

  return (
    <div
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-6"
      style={{ background: "#000", color: "#fff", fontFamily: DISPLAY }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 45% at 50% 0%, rgba(226,35,26,0.35), transparent 70%)",
        }}
      />
      <motion.div
        key={wrong}
        initial={wrong ? { x: -9 } : false}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 900, damping: 12 }}
        className="relative z-10 w-full max-w-sm"
      >
        <NetoLogo className="w-[120px]" animate={false} />
        <div className="mt-6 flex items-center gap-2">
          <Lock size={18} style={{ color: RED }} />
          <p
            className="text-[11px] uppercase tracking-[0.16em]"
            style={{ fontFamily: MONO, color: "#8A8A8A" }}
          >
            Privatna prezentacija
          </p>
        </div>
        <h1 className="mt-3 text-[clamp(1.6rem,6vw,2.2rem)] font-extrabold italic leading-tight">
          Ponuda za Neto diskonte.
        </h1>
        <p className="mt-2 text-[15px]" style={{ color: "#B5B5B5" }}>
          Pripremljeno za Bojana i Jovanu. Unesite lozinku koju ste dobili.
        </p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <label htmlFor="bojan-pass" className="sr-only">
            Lozinka
          </label>
          <input
            id="bojan-pass"
            type="password"
            autoFocus
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="lozinka"
            aria-invalid={wrong > 0}
            className="w-full rounded-md px-4 py-3 text-[15px] text-white outline-none transition-colors focus:border-[rgba(226,35,26,0.8)]"
            style={{
              fontFamily: MONO,
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${wrong ? "rgba(226,35,26,0.8)" : "rgba(255,255,255,0.14)"}`,
            }}
          />
          <button
            type="submit"
            className="group inline-flex items-center justify-center gap-2 px-5 py-3.5 text-[16px] font-extrabold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2231A] active:scale-[0.98]"
            style={{ background: RED, borderRadius: "6px 20px 6px 6px" }}
          >
            Otvori
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </form>

        <p
          className="mt-3 h-4 text-xs"
          style={{ fontFamily: MONO, color: wrong ? "#FF6B63" : "transparent" }}
          role={wrong ? "alert" : undefined}
        >
          {wrong ? "Lozinka nije tačna. Pokušajte ponovo." : "·"}
        </p>
      </motion.div>
    </div>
  );
}
