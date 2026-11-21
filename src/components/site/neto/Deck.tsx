"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarCheck } from "lucide-react";
import Gate from "./Gate";
import {
  CONTACT,
  DISPLAY,
  MONO,
  RED,
  SlidePositionContext,
  THEMES,
  type Theme,
} from "./primitives";

export type DeckSlide = {
  id: string;
  label: string;
  theme: Theme;
  Component: () => React.JSX.Element;
  /* Photos the slide shows, with the `sizes` it shows them at. The deck
     fetches them while the slide before is on screen, so a photo is there
     the moment its slide opens instead of loading in mid-animation. */
  preload?: { src: string; sizes: string }[];
};

/* One slide on screen at a time, sliding in from the side you are heading
   towards. The stage owns its scrollbar, so a tall slide scrolls inside the
   frame while "Dalje" always means the next slide. */
const enter = {
  hidden: (dir: number) => ({ opacity: 0, x: dir * 28 }),
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.26, ease: [0.2, 0.7, 0.3, 1] as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -20,
    transition: { duration: 0.13, ease: "easeIn" as const },
  }),
};

/* A finger has to travel this far before we decide whether it is a swipe or
   a scroll; a swipe commits past this share of the width or this speed. */
const SWIPE_START = 10;
const SWIPE_COMMIT = 0.28;
const SWIPE_FLICK = 0.55; /* px per ms */

type Swipe = {
  id: number;
  x: number;
  y: number;
  lastX: number;
  lastT: number;
  vx: number;
  mode: "pending" | "swiping" | "off";
};

/* The shell every Neto deck runs in: the password gate, one slide at a
   time, swipe and keys, and the black bar. /neto and the follow-up offers
   pass their own slides, their own "already unlocked" key and, if they
   want, their own WhatsApp text for the last slide's button. Each deck
   imports only its own slides, so one deck's phone demos never ship with
   another. */
export default function Deck({
  fontClass = "",
  slides,
  storageKey,
  contact = CONTACT,
  eyebrows = true,
}: {
  fontClass?: string;
  slides: DeckSlide[];
  storageKey: string;
  contact?: string;
  /* The small "02 / 17 · label" line on top of each slide. The bar at the
     bottom says the same, so a deck can leave it out. */
  eyebrows?: boolean;
}) {
  const [open, setOpen] = useState<boolean | null>(null);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const stage = useRef<HTMLDivElement>(null);
  const stageBox = useRef<HTMLDivElement>(null);

  /* Swiping between slides on touch, the iOS way: the slide follows the
     finger, rubber-bands at either end of the deck, and lets go on a long
     enough pull or a quick flick. A gesture that starts inside a demo phone
     belongs to the phone; a mouse never swipes. */
  const sx = useMotionValue(0);
  const sop = useTransform(sx, (v) => {
    const w = stageBox.current?.clientWidth ?? 400;
    return 1 - Math.min(0.5, Math.abs(v) / (w * 1.4));
  });
  const swipe = useRef<Swipe | null>(null);

  useEffect(() => {
    let stored = false;
    try {
      stored = sessionStorage.getItem(storageKey) === "1";
    } catch {
      stored = false;
    }
    setOpen(stored);
  }, [storageKey]);

  const unlock = useCallback(() => {
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      /* private mode - the deck still opens for this view */
    }
    setOpen(true);
  }, [storageKey]);

  const goTo = useCallback(
    (i: number) => {
      setIndex((prev) => {
        const next = Math.max(0, Math.min(i, slides.length - 1));
        if (next !== prev) setDir(next > prev ? 1 : -1);
        return next;
      });
    },
    [slides.length],
  );

  const onSwipeDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-demo], input, textarea, select")) return;
    swipe.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      lastX: e.clientX,
      lastT: performance.now(),
      vx: 0,
      mode: "pending",
    };
  };

  const onSwipeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    if (!s || s.id !== e.pointerId || s.mode === "off") return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (s.mode === "pending") {
      if (Math.abs(dx) < SWIPE_START && Math.abs(dy) < SWIPE_START) return;
      if (Math.abs(dx) > Math.abs(dy) * 1.3) {
        s.mode = "swiping";
        e.currentTarget.setPointerCapture(e.pointerId);
      } else {
        s.mode = "off";
        return;
      }
    }
    const now = performance.now();
    const dt = now - s.lastT;
    if (dt > 0) s.vx = s.vx * 0.6 + ((e.clientX - s.lastX) / dt) * 0.4;
    s.lastX = e.clientX;
    s.lastT = now;
    const atEdge =
      (dx > 0 && index === 0) || (dx < 0 && index === slides.length - 1);
    /* Past the ends the slide gives a little, then holds, like a list
       pulled past its top. */
    const w = stageBox.current?.clientWidth ?? 400;
    const give = w * 0.18;
    sx.set(
      atEdge ? Math.sign(dx) * give * (1 - give / (give + Math.abs(dx))) : dx,
    );
  };

  const onSwipeEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    if (!s || s.id !== e.pointerId) return;
    swipe.current = null;
    if (s.mode !== "swiping") return;
    const w = stageBox.current?.clientWidth ?? 400;
    const raw = e.clientX - s.x;
    const step = raw < 0 ? 1 : -1;
    const target = index + step;
    const far = Math.abs(raw) > w * SWIPE_COMMIT;
    const flick = Math.abs(s.vx) > SWIPE_FLICK && Math.sign(s.vx) === -step;
    if ((far || flick) && target >= 0 && target < slides.length) {
      animate(sx, -step * w * 0.55, {
        duration: 0.2,
        ease: [0.2, 0.7, 0.3, 1],
      });
      goTo(target);
    } else {
      animate(sx, 0, { type: "spring", stiffness: 520, damping: 42 });
    }
  };

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

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|BUTTON)$/.test(target.tagName)) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        if (target.tagName !== "BUTTON") return;
      }
      const page = () =>
        Math.round((stage.current?.clientHeight ?? 600) * 0.85);

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
        goTo(slides.length - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, goTo, nudge, slides.length]);

  if (open === null)
    return <div className={`fixed inset-0 z-[200] bg-black ${fontClass}`} />;

  if (!open)
    return (
      <MotionConfig reducedMotion="user">
        <div
          lang="sr-Latn"
          className={`fixed inset-0 z-[200] overflow-y-auto bg-black ${fontClass}`}
        >
          <Gate onUnlock={unlock} />
        </div>
      </MotionConfig>
    );

  const last = index === slides.length - 1;
  const current = slides[index];
  const Current = current.Component;
  const t = THEMES[current.theme];
  const lightStage = current.theme === "light" || current.theme === "paper";

  return (
    <MotionConfig reducedMotion="user">
      <div
        lang="sr-Latn"
        className={`fixed inset-0 z-[200] flex flex-col overflow-hidden bg-black ${fontClass}`}
        style={{ fontFamily: DISPLAY }}
      >
        {/* Progress: a red hairline across the top, one step per slide. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-30 h-[3px]"
          style={{
            background: lightStage
              ? "rgba(0,0,0,0.08)"
              : "rgba(255,255,255,0.12)",
          }}
        >
          <div
            className="h-full transition-[width] duration-500 ease-out"
            style={{
              width: `${((index + 1) / slides.length) * 100}%`,
              background: `linear-gradient(90deg, #B8160F, ${RED})`,
            }}
          />
        </div>

        <nav
          aria-label="Slajdovi"
          className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-1.5 lg:flex"
        >
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-label={`Idi na ${s.label}`}
              aria-current={i === index ? "true" : undefined}
              className="group flex items-center gap-2 rounded-sm py-0.5 pl-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2231A]"
            >
              <span
                className="whitespace-nowrap text-[10px] uppercase opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{
                  fontFamily: MONO,
                  letterSpacing: "0.12em",
                  color: t.muted,
                }}
              >
                {s.label}
              </span>
              <span
                className="h-[3px] rounded-full transition-all duration-300"
                style={{
                  width: i === index ? 22 : 10,
                  background:
                    i === index
                      ? t.hl
                      : lightStage
                        ? "rgba(0,0,0,0.18)"
                        : "rgba(255,255,255,0.28)",
                }}
              />
            </button>
          ))}
        </nav>

        {/* The stage. Its background follows the slide so the swap between a
            black and a white slide reads as one page turning, not a flash. */}
        <div
          ref={stageBox}
          className="relative min-h-0 flex-1 transition-colors duration-300"
          style={{ background: t.bg, touchAction: "pan-y pinch-zoom" }}
          onPointerDown={onSwipeDown}
          onPointerMove={onSwipeMove}
          onPointerUp={onSwipeEnd}
          onPointerCancel={onSwipeEnd}
        >
          <motion.div
            className="absolute inset-0"
            style={{ x: sx, opacity: sop }}
          >
            <AnimatePresence
              mode="wait"
              initial={false}
              custom={dir}
              onExitComplete={() => sx.jump(0)}
            >
              <motion.div
                key={current.id}
                ref={stage}
                custom={dir}
                variants={enter}
                initial="hidden"
                animate="show"
                exit="exit"
                data-stage
                className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain lg:pr-10"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <SlidePositionContext.Provider
                  value={{
                    index,
                    total: slides.length,
                    label: current.label,
                    eyebrow: eyebrows,
                  }}
                >
                  <Current />
                </SlidePositionContext.Provider>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* The next two slides' photos, loading in the background. Same
            src and sizes as on the slide, so the browser asks for the same
            file and the slide gets it from the cache. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-px w-px overflow-hidden opacity-0"
        >
          {[slides[index + 1], slides[index + 2]].flatMap(
            (s) =>
              s?.preload?.map((p) => (
                <span key={p.src} className="relative block h-px w-px">
                  <Image
                    src={p.src}
                    alt=""
                    fill
                    sizes={p.sizes}
                    loading="eager"
                  />
                </span>
              )) ?? [],
          )}
        </div>

        {/* The bar is always black. It carries you to the offer, and on the
            offer it becomes the offer. */}
        <div
          className="relative z-40 shrink-0 border-t bg-black"
          style={{
            borderColor: "rgba(255,255,255,0.12)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3 md:px-10">
            {!last && (
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[10px] uppercase md:text-[11px]"
                  style={{
                    fontFamily: MONO,
                    letterSpacing: "0.14em",
                    color: "#8A8A8A",
                  }}
                >
                  {String(index + 1).padStart(2, "0")} / {slides.length}
                </p>
                <p className="truncate text-[13px] font-bold text-white md:text-sm">
                  {current.label}
                </p>
              </div>
            )}

            <button
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              aria-label="Prethodni slajd"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-[rgba(226,35,26,0.18)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2231A] disabled:pointer-events-none disabled:opacity-25 md:px-3 md:py-2 md:text-[13px]"
              style={{ border: "1px solid rgba(255,255,255,0.22)" }}
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Nazad</span>
            </button>

            {last ? (
              <a
                href={contact}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-w-0 flex-1 items-center justify-center gap-2 bg-white px-5 py-3.5 text-[15px] font-extrabold text-black transition-[transform,background-color,color] hover:-translate-y-0.5 hover:bg-[#E2231A] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2231A] active:scale-[0.98] md:px-8 md:py-4 md:text-[17px]"
                style={{ borderRadius: "6px 22px 6px 6px" }}
              >
                <CalendarCheck size={18} />
                Zakažite sastanak
              </a>
            ) : (
              <button
                onClick={() => goTo(index + 1)}
                className="group inline-flex shrink-0 items-center gap-2 px-4 py-2.5 text-[13px] font-extrabold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] md:px-5 md:py-3 md:text-[15px]"
                style={{ background: RED, borderRadius: "6px 18px 6px 6px" }}
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
