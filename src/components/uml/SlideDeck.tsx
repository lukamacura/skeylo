"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
  type ReactNode,
} from "react";
import { MotionConfig, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UML_FONT_VARS } from "@/app/uml/fonts";
import {
  SLIDE_CHAPTERS,
  SLIDE_TITLES,
  type SketchId,
} from "@/lib/uml/uml-content";
import ClassDiagram from "./ClassDiagram";
import Lightbox from "./Lightbox";
import SequenceDiagram from "./SequenceDiagram";
import SketchGallery from "./SketchGallery";
import {
  ClassDescriptionsSlide,
  SystemSlide,
  TitleSlide,
  UseCaseDescriptionsSlide,
} from "./TextSlides";
import UseCaseDiagram from "./UseCaseDiagram";
import { LOAD_SLIDE, SLIDE_COUNT, parseSlideHash } from "./hooks";
import "./uml.css";

// popstate stiže odmah, a hashchange je u merenjima ponekad kasnio ili izostajao;
// promena slajda mora da reaguje bez čekanja.
const subscribeToHash = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
  };
};
const readHashSlide = () => parseSlideHash(window.location.hash);
const serverSlide = () => 1;

/** Rezervno vreme za uklanjanje slajda koji odlazi (animacija traje 180ms). */
const SLIDE_EXIT_MS = 300;
const PARCEL_SPRING = {
  type: "spring",
  bounce: 0.16,
  visualDuration: 0.34,
} as const;
const CHAPTERS = [...new Set(SLIDE_CHAPTERS)];
/** Prevlačenje prstom menja slajd ako je pretežno vodoravno i duže od ovoga. */
const SWIPE_PX = 56;
const OVERLAY_OPEN = "[data-uml-modal], [data-uml-expanded], [data-uml-panel]";

type ViewState = {
  slide: number;
  dir: "fwd" | "back";
  leaving: number | null;
  /** Slajd iz direktnog linka: već je vidljiv pre hidratacije, pa bez ulaska. */
  instant: number | null;
  loadTarget: number | null;
};

function Slide({
  n,
  current,
  view,
  onLeft,
  children,
}: {
  n: number;
  current: number;
  view: ViewState;
  onLeft: () => void;
  children: ReactNode;
}) {
  const leaving = view.leaving === n && n !== current;
  return (
    <section
      className="uml-slide"
      data-uml-slide={n}
      data-chapter={SLIDE_CHAPTERS[n - 1]}
      data-active={n === current ? "true" : "false"}
      data-leaving={leaving ? "true" : undefined}
      data-instant={view.instant === n ? "true" : undefined}
      inert={leaving}
      aria-label={`Slajd ${n}: ${SLIDE_TITLES[n - 1]}`}
      onAnimationEnd={(e) => {
        if (leaving && e.target === e.currentTarget) onLeft();
      }}
    >
      {children}
    </section>
  );
}

/** Mala pošiljka koja putuje rutom kroz prezentaciju. */
function Parcel() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden>
      <rect
        x="3"
        y="6"
        width="22"
        height="18"
        rx="3.5"
        className="uml-parcel-box"
      />
      <path d="M3,12.5 H25" className="uml-parcel-line" />
      <path d="M11,6 V15 L14,13.2 L17,15 V6" className="uml-parcel-tape" />
    </svg>
  );
}

export default function SlideDeck() {
  // Trenutni slajd živi u hash-u: link vodi pravo na slajd, a Back/Forward rade.
  const current = useSyncExternalStore(
    subscribeToHash,
    readHashSlide,
    serverSlide,
  );
  const [sketch, setSketch] = useState<SketchId | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  // Smer i slajd koji odlazi; navigacija nikad ne čeka da se prelaz završi.
  const [view, setView] = useState<ViewState>({
    slide: 1,
    dir: "fwd",
    leaving: null,
    instant: null,
    loadTarget: LOAD_SLIDE,
  });
  if (view.slide !== current) {
    const isLoadJump = current === view.loadTarget;
    setView({
      slide: current,
      dir: current > view.slide ? "fwd" : "back",
      leaving: isLoadJump ? null : view.slide,
      instant: isLoadJump ? current : view.instant,
      loadTarget: null,
    });
  }

  const finishLeaving = useCallback(
    () => setView((v) => ({ ...v, leaving: null, instant: null })),
    [],
  );

  // Slajd koji odlazi uklanja kraj njegove animacije; tajmer je rezerva za
  // smanjen pokret, kad animacije nema.
  useEffect(() => {
    if (view.leaving === null) return;
    const timer = setTimeout(finishLeaving, SLIDE_EXIT_MS);
    return () => clearTimeout(timer);
  }, [view.leaving, view.slide, finishLeaving]);

  const goTo = useCallback((n: number) => {
    if (n < 1 || n > SLIDE_COUNT) return;
    window.location.hash = String(n);
  }, []);

  const closeSketch = useCallback(() => setSketch(null), []);

  // Stil iz page.tsx je sprečio bljesak prvog slajda; od hidratacije vodi React.
  useEffect(() => {
    document.getElementById("uml-pre-hydration")?.remove();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

      // Esc ovde nema drugo značenje. Bez preventDefault je u headless Chrome-u
      // hashchange posle njega izostajao; uzrok nije utvrđen.
      if (e.key === "Escape") {
        e.preventDefault();
        return;
      }

      const forward =
        e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ";
      const backward = e.key === "ArrowLeft" || e.key === "PageUp";
      if (!forward && !backward) return;

      if (document.querySelector("[data-uml-modal], [data-uml-expanded]"))
        return;

      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]'))
        return;
      // Razmak na dugmetu aktivira dugme, ne menja slajd.
      if (
        e.key === " " &&
        target?.closest('button, a, [role="button"], [role="tab"]')
      )
        return;

      e.preventDefault();
      goTo(current + (forward ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, goTo]);

  const onPointerDown = (e: PointerEvent) => {
    swipeStart.current =
      e.pointerType === "touch" ? { x: e.clientX, y: e.clientY } : null;
  };

  const onPointerUp = (e: PointerEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || document.querySelector(OVERLAY_OPEN)) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    goTo(current + (dx < 0 ? 1 : -1));
  };

  const diagramProps = (n: number) => ({
    active: current === n,
    slide: n,
    onSketch: setSketch,
  });

  const slideProps = { current, view, onLeft: finishLeaving };
  const chapter = SLIDE_CHAPTERS[current - 1];

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`uml-root uml-deck ${UML_FONT_VARS}`}
        data-dir={view.dir}
        data-chapter={chapter}
        data-title={current === 1 ? "true" : undefined}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
      >
        {/* Boja poglavlja se pretapa samo preko opacity. */}
        {CHAPTERS.map((c) => (
          <div
            key={c}
            className="uml-bg"
            data-chapter={c}
            data-active={c === chapter ? "true" : undefined}
            aria-hidden
          />
        ))}

        <div className="uml-stage">
          <div className="uml-sheet" aria-hidden />
          <Slide n={1} {...slideProps}>
            <TitleSlide />
          </Slide>
          <Slide n={2} {...slideProps}>
            <SystemSlide />
          </Slide>
          <Slide n={3} {...slideProps}>
            <SketchGallery onOpen={setSketch} />
          </Slide>
          <Slide n={4} {...slideProps}>
            <UseCaseDiagram {...diagramProps(4)} />
          </Slide>
          <Slide n={5} {...slideProps}>
            <UseCaseDescriptionsSlide active={current === 5} />
          </Slide>
          <Slide n={6} {...slideProps}>
            <ClassDiagram {...diagramProps(6)} />
          </Slide>
          <Slide n={7} {...slideProps}>
            <ClassDescriptionsSlide active={current === 7} />
          </Slide>
          <Slide n={8} {...slideProps}>
            <SequenceDiagram {...diagramProps(8)} />
          </Slide>
        </div>

        <div className="uml-dock-wrap">
          <nav className="uml-dock" aria-label="Navigacija kroz slajdove">
            <button
              type="button"
              className="uml-nav-btn"
              aria-label="Prethodni"
              title="Prethodni"
              disabled={current === 1}
              onClick={() => goTo(current - 1)}
            >
              <ChevronLeft aria-hidden />
            </button>

            <div className="uml-route">
              <span className="uml-route-line" aria-hidden />
              <span
                className="uml-route-done"
                aria-hidden
                style={{
                  transform: `scaleX(${(current - 1) / (SLIDE_COUNT - 1)})`,
                }}
              />
              <ol className="uml-stops">
                {SLIDE_TITLES.map((title, i) => (
                  <li key={title}>
                    <button
                      type="button"
                      aria-label={`Slajd ${i + 1}: ${title}`}
                      aria-current={current === i + 1 ? "true" : undefined}
                      title={title}
                      data-done={i + 1 < current ? "true" : undefined}
                      onClick={() => goTo(i + 1)}
                      className="uml-stop"
                    >
                      <span />
                    </button>
                  </li>
                ))}
              </ol>
              <motion.span
                className="uml-parcel"
                aria-hidden
                initial={false}
                animate={{ x: `${(current - 1) * 100}%` }}
                transition={PARCEL_SPRING}
              >
                <Parcel />
              </motion.span>
            </div>

            <span className="uml-count" aria-live="polite" data-part="progress">
              {current} / {SLIDE_COUNT}
            </span>

            <button
              type="button"
              className="uml-nav-btn"
              data-primary="true"
              aria-label="Sledeći"
              title="Sledeći"
              disabled={current === SLIDE_COUNT}
              onClick={() => goTo(current + 1)}
            >
              <ChevronRight aria-hidden />
            </button>
          </nav>
        </div>
      </div>

      <Lightbox sketchId={sketch} onClose={closeSketch} />
    </MotionConfig>
  );
}
