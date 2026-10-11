"use client";

import { useEffect, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useDragControls,
  type PanInfo,
} from "framer-motion";
import { X } from "lucide-react";
import { OS } from "@/lib/os/theme";

/**
 * Telefon: sheet odozdo, vuče se za ručku; zatvara se po smeru brzine pri puštanju.
 * Desktop: panel u sredini. Isti sadržaj, isti put ulaska i izlaska.
 */
export default function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const drag = useDragControls();

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  function onDragEnd(_: unknown, info: PanInfo) {
    const v = info.velocity.y;
    if (Math.abs(v) > 300 ? v > 0 : info.offset.y > 120) onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
          <motion.div
            className="absolute inset-0 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-label={title}
            className="relative flex max-h-[92dvh] w-full flex-col rounded-t-[22px] md:max-w-[520px] md:rounded-[22px]"
            style={{
              background: OS.surface,
              border: `1px solid ${OS.lineStrong}`,
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            }}
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.6 }}
            transition={{ type: "spring", bounce: 0, visualDuration: 0.3 }}
            drag="y"
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 1 }}
            onDragEnd={onDragEnd}
          >
            <div
              className="flex shrink-0 cursor-grab touch-none items-center gap-3 px-5 pb-2 pt-2 md:pt-4"
              onPointerDown={(e) => drag.start(e)}
            >
              <div
                className="absolute left-1/2 top-2 h-1 w-9 -translate-x-1/2 rounded-full md:hidden"
                style={{ background: OS.lineStrong }}
              />
              <h2
                className="mt-3 flex-1 text-[18px] font-semibold md:mt-0"
                style={{
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "-0.02em",
                }}
              >
                {title}
              </h2>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onClose}
                className="mt-3 grid size-8 place-items-center rounded-full active:scale-95 md:mt-0"
                style={{ background: OS.surface2, color: OS.muted }}
                aria-label="Zatvori"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
              {children}
            </div>
            {footer && (
              <div
                className="shrink-0 border-t px-5 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3 md:pb-4"
                style={{ borderColor: OS.line }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
