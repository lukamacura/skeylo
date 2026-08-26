"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import { ArrowLeft, ArrowRight, Rocket } from "lucide-react";
import Gate from "./Gate";
import { AssetsContext, GOLD, INK, INK_MUTED, MONO } from "./primitives";
import { CONTACT, SLIDES } from "./slides";

const STORAGE_KEY = "vizel-deck-open";

export default function VizelDeck({
  fitifyShots = [],
}: {
  fitifyShots?: string[];
}) {
  const [open, setOpen] = useState<boolean | null>(null);
  const [index, setIndex] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

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

  /* Track which slide is on screen, for the rail and the counter. */
  useEffect(() => {
    if (!open) return;
    const root = scroller.current;
    if (!root) return;
    const sections = Array.from(
      root.querySelectorAll<HTMLElement>("[data-slide]"),
    );
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        setIndex(sections.indexOf(visible.target as HTMLElement));
      },
      { root, threshold: [0.2, 0.5] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [open]);

  const goTo = useCallback((i: number) => {
    const root = scroller.current;
    if (!root) return;
    const target = root.querySelectorAll<HTMLElement>("[data-slide]")[i];
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /* Arrow keys, PageUp/Down and space move one slide at a time. */
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      const fwd = ["ArrowDown", "ArrowRight", "PageDown", " "];
      const back = ["ArrowUp", "ArrowLeft", "PageUp"];
      if (fwd.includes(e.key)) {
        e.preventDefault();
        goTo(Math.min(index + 1, SLIDES.length - 1));
      } else if (back.includes(e.key)) {
        e.preventDefault();
        goTo(Math.max(index - 1, 0));
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
  }, [open, index, goTo]);

  /* The overlay is painted before the passphrase check resolves, so the site
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

  return (
    <MotionConfig reducedMotion="user">
      <AssetsContext.Provider value={{ fitifyShots }}>
        <div
          lang="en"
          ref={scroller}
          className="fixed inset-0 z-[200] snap-y snap-proximity overscroll-contain overflow-y-auto overflow-x-hidden bg-background md:snap-mandatory"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Progress: a hairline on phones, a labelled rail on desktop. */}
          <div
            aria-hidden
            className="fixed inset-x-0 top-0 z-30 h-[2px]"
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
            className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-1.5 lg:flex"
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

          {SLIDES.map(({ id, Component }) => (
            <Component key={id} />
          ))}

          {/* The bar is always visible. It carries you to the offer, and on the
            offer it becomes the offer. */}
          <div
            /* No backdrop-filter on phones: a blur that has to re-composite
               every frame of a scroll is what makes a deck feel cheap. */
            className="fixed inset-x-0 bottom-0 z-40 border-t bg-[rgba(7,7,7,0.96)] md:bg-[rgba(7,7,7,0.82)] md:backdrop-blur-md"
            style={{
              borderColor: "rgba(236,232,212,0.1)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3 md:px-10">
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[10px] uppercase md:text-[11px]"
                  style={{
                    fontFamily: MONO,
                    letterSpacing: "0.14em",
                    color: INK_MUTED,
                  }}
                >
                  {String(index + 1).padStart(2, "0")} / {SLIDES.length} ·{" "}
                  {current.act}
                </p>
                <p
                  className="truncate text-[13px] font-semibold md:text-sm"
                  style={{ color: INK }}
                >
                  {current.label}
                </p>
              </div>

              {/* Back is always mounted so the bar never reflows mid-deck; it
                just goes inert on the first slide. */}
              <button
                onClick={() => goTo(index - 1)}
                disabled={index === 0}
                aria-label="Previous slide"
                className="inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2.5 text-[13px] font-bold transition-colors hover:bg-[rgba(236,232,212,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0b656] disabled:pointer-events-none disabled:opacity-25 md:px-4 md:py-3 md:text-[15px]"
                style={{
                  color: INK_MUTED,
                  border: "1px solid rgba(236,232,212,0.16)",
                }}
              >
                <ArrowLeft size={15} />
                <span className="hidden sm:inline">Back</span>
              </button>

              {last ? (
                <a
                  href={CONTACT}
                  className="group inline-flex shrink-0 items-center gap-2 rounded-md bg-gradient-to-r from-[#f0b656] to-[#d87928] px-4 py-2.5 text-[13px] font-extrabold text-[#0a0a0a] shadow-lg shadow-[#f0b656]/20 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0b656] md:px-6 md:py-3 md:text-[15px]"
                >
                  <Rocket size={15} />
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
