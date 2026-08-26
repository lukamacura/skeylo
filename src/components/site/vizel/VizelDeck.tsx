"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Rocket } from "lucide-react";
import Gate from "./Gate";
import {
  AssetsContext,
  GOLD,
  INK,
  INK_MUTED,
  MONO,
  SlidePositionContext,
} from "./primitives";
import { CONTACT, SLIDES } from "./slides";

const STORAGE_KEY = "vizel-deck-open";

/* One slide is on screen at a time and nothing else is mounted. The slide owns
   its own scrollbar, so a long slide scrolls inside the frame while Next always
   means the next slide - never "a bit further down the same page". */
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

export default function VizelDeck({
  fitifyShots = [],
}: {
  fitifyShots?: string[];
}) {
  const [open, setOpen] = useState<boolean | null>(null);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stored = false;
    try {
      stored = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      stored = false;
    }
    setOpen(stored);
  }, []);

  const unlock = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode - the deck still opens for this view */
    }
    setOpen(true);
  }, []);

  const goTo = useCallback((i: number) => {
    setIndex((prev) => {
      const next = Math.max(0, Math.min(i, SLIDES.length - 1));
      if (next !== prev) setDir(next > prev ? 1 : -1);
      return next;
    });
  }, []);

  /* Page up/down inside the current slide first, and only report back that we
     couldn't - the caller then turns the page instead. */
  const nudge = useCallback((delta: number) => {
    const el = stage.current;
    if (!el) return false;
    const room = el.scrollHeight - el.clientHeight;
    if (room < 8) return false;
    const atEdge = delta > 0 ? el.scrollTop >= room - 8 : el.scrollTop <= 8;
    if (atEdge) return false;
    el.scrollBy({ top: delta, behavior: "smooth" });
    return true;
  }, []);

  /* Left/right and PageUp/Down always turn the page. Up/down and space scroll
     the slide when there is more of it, and turn the page when there isn't. */
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;

      const page = () => {
        const h = stage.current?.clientHeight ?? 600;
        return Math.round(h * 0.85);
      };

      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        goTo(index + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goTo(index - 1);
      } else if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        if (!nudge(page())) goTo(index + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!nudge(-page())) goTo(index - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(SLIDES.length - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, goTo, nudge]);

  /* The overlay is painted before the pass check resolves, so the site
     underneath never flashes through on first paint. */
  if (open === null)
    return <div className="fixed inset-0 z-[200] bg-background" />;

  if (!open)
    return (
      <MotionConfig reducedMotion="user">
        <div
          lang="en"
          className="fixed inset-0 z-[200] overflow-y-auto bg-background"
        >
          <Gate onUnlock={unlock} />
        </div>
      </MotionConfig>
    );

  const last = index === SLIDES.length - 1;
  const current = SLIDES[index];
  const Current = current.Component;

  return (
    <MotionConfig reducedMotion="user">
      <AssetsContext.Provider value={{ fitifyShots }}>
        <div
          lang="en"
          className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-background"
        >
          {/* Progress: a hairline across the top, one step per slide. */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 z-30 h-[2px]"
            style={{ background: "rgba(236,232,212,0.08)" }}
          >
            <div
              className="h-full transition-[width] duration-500 ease-out"
              style={{
                width: `${((index + 1) / SLIDES.length) * 100}%`,
                background: "linear-gradient(90deg, #d87928, #f0b656)",
              }}
            />
          </div>

          <nav
            aria-label="Slides"
            className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-1.5 lg:flex"
          >
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                aria-label={`Go to ${s.label}`}
                aria-current={i === index ? "true" : undefined}
                className="group flex items-center gap-2 rounded-sm py-0.5 pl-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0b656]"
              >
                <span
                  className="whitespace-nowrap text-[10px] uppercase opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  style={{
                    fontFamily: MONO,
                    letterSpacing: "0.12em",
                    color: INK_MUTED,
                  }}
                >
                  {s.label}
                </span>
                <span
                  className="h-[2px] rounded-full transition-all"
                  style={{
                    width: i === index ? 22 : 10,
                    background: i === index ? GOLD : "rgba(236,232,212,0.22)",
                  }}
                />
              </button>
            ))}
          </nav>

          {/* The stage. Exactly one slide lives in here, and it scrolls on its
            own when it is taller than the space it was given. */}
          <div className="relative min-h-0 flex-1">
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.div
                key={current.id}
                ref={stage}
                custom={dir}
                variants={enter}
                initial="hidden"
                animate="show"
                exit="exit"
                className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain lg:pr-10"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <SlidePositionContext.Provider
                  value={{
                    index,
                    total: SLIDES.length,
                    label: current.label,
                  }}
                >
                  <Current />
                </SlidePositionContext.Provider>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* The bar is always visible. It carries you to the offer, and on the
            offer it becomes the offer. */}
          <div
            className="relative z-40 shrink-0 border-t bg-[rgba(7,7,7,0.96)]"
            style={{
              borderColor: "rgba(236,232,212,0.1)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3 md:px-10">
              {/* On the offer the counter steps aside so the CTA owns the bar. */}
              {!last && (
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[10px] uppercase md:text-[11px]"
                    style={{
                      fontFamily: MONO,
                      letterSpacing: "0.14em",
                      color: INK_MUTED,
                    }}
                  >
                    {String(index + 1).padStart(2, "0")} / {SLIDES.length}
                  </p>
                  <p
                    className="truncate text-[13px] font-semibold md:text-sm"
                    style={{ color: INK }}
                  >
                    {current.label}
                  </p>
                </div>
              )}

              {/* Back is always mounted so the bar never reflows mid-deck; it
                just goes inert on the first slide. */}
              <button
                onClick={() => goTo(index - 1)}
                disabled={index === 0}
                aria-label="Previous slide"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-bold transition-colors hover:bg-[rgba(240,182,86,0.14)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0b656] disabled:pointer-events-none disabled:opacity-25 md:px-3 md:py-2 md:text-[13px]"
                style={{
                  color: GOLD,
                  border: "1px solid rgba(240,182,86,0.35)",
                }}
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Back</span>
              </button>

              {last ? (
                <a
                  href={CONTACT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#f0b656] to-[#d87928] px-5 py-3.5 text-[15px] font-extrabold text-[#0a0a0a] shadow-lg shadow-[#f0b656]/20 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0b656] md:px-8 md:py-4 md:text-[17px]"
                >
                  <Rocket size={18} />
                  Start the build
                </a>
              ) : (
                <button
                  onClick={() => goTo(index + 1)}
                  className="group inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-bold transition-colors hover:bg-[rgba(240,182,86,0.14)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0b656] md:px-5 md:py-3 md:text-[15px]"
                  style={{
                    color: GOLD,
                    border: "1px solid rgba(240,182,86,0.45)",
                  }}
                >
                  Next
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </AssetsContext.Provider>
    </MotionConfig>
  );
}
