"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OS, SPRING } from "@/lib/os/theme";

/** Meni koji izrasta iz svog dugmeta (transform-origin na okidaču). */
export default function Popover({
  open,
  onClose,
  trigger,
  children,
  align = "left",
  width = 280,
}: {
  open: boolean;
  onClose: () => void;
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  width?: number;
}) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open, onClose]);

  return (
    <div ref={box} className="relative">
      {trigger}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={SPRING}
            className="absolute top-[calc(100%+6px)] z-50 rounded-xl p-1"
            style={{
              [align]: 0,
              width,
              maxWidth: "calc(100vw - 32px)",
              transformOrigin: `top ${align}`,
              background: "rgba(28,28,33,0.94)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: `1px solid ${OS.lineStrong}`,
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MenuItem({
  onSelect,
  selected,
  children,
}: {
  onSelect: () => void;
  selected?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[14px] transition-colors duration-75 hover:bg-white/[0.07] active:bg-white/[0.1]"
      style={{
        color: OS.text,
        background: selected ? "rgba(255,255,255,0.06)" : undefined,
      }}
    >
      {children}
    </button>
  );
}
