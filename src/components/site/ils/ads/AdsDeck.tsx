"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import { BG, CONTACT, IVORY, LINE, MUTED, ROSE, SANS } from "./primitives";
import { SLIDES } from "./slides";

/* One slide at a time, sliding in from the side you are heading towards. */
const enter = {
  hidden: (dir: number) => ({ opacity: 0, x: dir * 28 }),
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: [0.2, 0.7, 0.3, 1] as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -20,
    transition: { duration: 0.14, ease: "easeIn" as const },
  }),
};

/* A touch swipe has to be mostly sideways and travel this far to turn. */
const SWIPE = 56;

export default function AdsDeck({ fontClass = "" }: { fontClass?: string }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const goTo = useCallback((i: number) => {
    setIndex((prev) => {
      const next = Math.max(0, Math.min(i, SLIDES.length - 1));
      if (next !== prev) setDir(next > prev ? 1 : -1);
      return next;
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        goTo(index + 1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        goTo(index - 1);
      } else if (e.key === "Home") goTo(0);
      else if (e.key === "End") goTo(SLIDES.length - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo]);

  const last = index === SLIDES.length - 1;
  const current = SLIDES[index];
  const Current = current.Component;

  return (
    <MotionConfig reducedMotion="user">
      <div
        lang="sr-Latn"
        className={`fixed inset-0 z-[200] flex flex-col overflow-hidden ${fontClass}`}
        style={{
          background: BG,
          color: IVORY,
          fontFamily: SANS,
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {/* Progress: a rose hairline, one step per slide. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-30 h-[3px]"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full transition-[width] duration-500 ease-out"
            style={{
              width: `${((index + 1) / SLIDES.length) * 100}%`,
              background: "linear-gradient(90deg, #8f5f58, #e6c2ba)",
            }}
          />
        </div>

        <div
          className="relative min-h-0 flex-1"
          style={{ touchAction: "pan-y pinch-zoom" }}
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse")
              touch.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            const t = touch.current;
            touch.current = null;
            if (!t) return;
            const dx = e.clientX - t.x;
            const dy = e.clientY - t.y;
            if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy) * 1.4)
              goTo(index + (dx < 0 ? 1 : -1));
          }}
          onPointerCancel={() => (touch.current = null)}
        >
          {/* No initial={false}: the cover has to draw itself on arrival. */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={current.id}
              custom={dir}
              variants={enter}
              initial="hidden"
              animate="show"
              exit="exit"
              data-stage
              className="absolute inset-0 overflow-hidden"
            >
              <Current />
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          className="relative z-40 shrink-0 border-t"
          style={{
            borderColor: LINE,
            background: BG,
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-3 md:px-10">
            {!last && (
              <div className="min-w-0 flex-1">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: MUTED }}
                >
                  {String(index + 1).padStart(2, "0")} / {SLIDES.length}
                </p>
                <p className="truncate text-[14px] font-bold">
                  {current.label}
                </p>
              </div>
            )}

            <button
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              aria-label="Prethodni slajd"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-25"
              style={{ border: `1px solid ${LINE}`, outlineColor: ROSE }}
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Nazad</span>
            </button>

            {last ? (
              <a
                href={CONTACT}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[15px] font-extrabold transition-transform active:scale-[0.98] md:flex-none md:px-8"
                style={{
                  background: "linear-gradient(180deg, #e2bab2, #c09189)",
                  color: "#1a1113",
                }}
              >
                <MessageCircle size={17} />
                Krećemo?
              </a>
            ) : (
              <button
                onClick={() => goTo(index + 1)}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-extrabold transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: "linear-gradient(180deg, #e2bab2, #c09189)",
                  color: "#1a1113",
                  outlineColor: IVORY,
                }}
              >
                Dalje
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
