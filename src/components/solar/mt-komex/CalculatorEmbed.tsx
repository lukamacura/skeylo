"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Play, X } from "lucide-react";

// Naš kalkulator uštede (/calculator/solar) ugrađen kao iframe — tačno onako kako
// bi išao na sajt klijenta. Komponenta kalkulatora se ne menja.
export const CALC_SRC = "/calculator/solar";

export function useIsWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return wide;
}

/** Prozor pregledača oko iframe-a, sa adresom kao na sajtu klijenta. */
export function BrowserFrame({
  url,
  children,
  className = "",
}: {
  url: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/12 bg-[#0b0e14] shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] ${className}`}
    >
      <div className="flex h-10 items-center gap-3 border-b border-white/10 bg-[#141821] px-4">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto flex min-w-0 max-w-sm flex-1 items-center justify-center gap-1.5 truncate rounded-md bg-black/40 px-3 py-1 text-xs text-[#9aa4b4]">
          <Lock className="size-3 shrink-0" /> {url}
        </span>
        <span className="w-[46px]" />
      </div>
      {children}
    </div>
  );
}

/** Telefon sa slikom kalkulatora; dodir otvara pravi kalkulator preko celog ekrana. */
export function PhonePoster({
  onOpen,
  label = "Pokreni kalkulator",
}: {
  onOpen: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative mx-auto block w-full max-w-[300px] overflow-hidden rounded-[40px] border-[6px] border-[#1d2230] bg-black text-left shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]"
      aria-label={label}
    >
      <Image
        src="/calculator/mt-komex/calc-mobile.jpg"
        alt="Kalkulator uštede na telefonu"
        width={780}
        height={1560}
        className="h-auto w-full"
      />
      <span className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/85 via-black/10 to-transparent p-5">
        <span className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#ffc53d] px-5 text-[15px] font-extrabold text-[#0b0d10] shadow-lg transition-transform group-hover:scale-105">
          <Play className="size-4 fill-current" /> {label}
        </span>
      </span>
    </button>
  );
}

/** Kalkulator preko celog ekrana (telefon). */
export function CalculatorOverlay({
  open,
  onClose,
  title = "Kalkulator uštede",
  src = CALC_SRC,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  src?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Portal u body: animirani roditelji (transform) bi inače "zarobili" position: fixed.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
          className="fixed inset-0 z-[200] flex flex-col bg-[#07090d]"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4 pt-[env(safe-area-inset-top)]">
            <span className="text-sm font-semibold text-white">{title}</span>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 inline-flex size-10 items-center justify-center rounded-full text-[#c4cbd8] hover:bg-white/10"
              aria-label="Zatvori kalkulator"
            >
              <X className="size-5" />
            </button>
          </div>
          <iframe
            src={src}
            title={title}
            className="min-h-0 w-full flex-1 border-0"
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Desktop: živ kalkulator u prozoru pregledača. Telefon: poster + overlay. */
export default function CalculatorEmbed({
  url,
  open,
  onOpenChange,
  height = 780,
  frameless = false,
}: {
  /** Adresa u traci pregledača; bez nje (frameless) kalkulator stoji direktno na stranici. */
  url?: string;
  frameless?: boolean;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  height?: number;
}) {
  return (
    <>
      <div className="hidden lg:block">
        {frameless ? (
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#07090d]">
            <iframe
              src={CALC_SRC}
              title="Kalkulator uštede"
              loading="lazy"
              className="block w-full border-0"
              style={{ height }}
            />
          </div>
        ) : (
          <BrowserFrame url={url ?? ""}>
            <iframe
              src={CALC_SRC}
              title="Kalkulator uštede"
              loading="lazy"
              className="block w-full border-0"
              style={{ height }}
            />
          </BrowserFrame>
        )}
      </div>
      <div className="lg:hidden">
        <PhonePoster onOpen={() => onOpenChange(true)} />
      </div>
      <CalculatorOverlay open={open} onClose={() => onOpenChange(false)} />
    </>
  );
}
