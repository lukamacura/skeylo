"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type PointerEvent,
} from "react";
import { BALSOA_FONT } from "@/app/balsoa/fonts";
import Demo from "./Demo";
import Pipeline from "./Pipeline";
import { SLIDES } from "./meta";
import { Ico, type SlideProps } from "./parts";
import { About, Cta, Security, Step1, Step2 } from "./s-close";
import { Hero, Problem, Solution } from "./s-intro";
import { Roi, Statement, Uses } from "./s-value";
import "./balsoa.css";

const VIEWS: ComponentType<SlideProps>[] = [
  Hero,
  Problem,
  Solution,
  Pipeline,
  Demo,
  Uses,
  Statement,
  Roi,
  Security,
  About,
  Step1,
  Step2,
  Cta,
];
const N = VIEWS.length;

/** Koliko dugo slajd koji odlazi ostaje ispod novog (novi se pretapa 420ms). */
const LEAVE_MS = 520;
/** Prevlačenje prstom menja slajd ako je pretežno vodoravno i duže od ovoga. */
const SWIPE_PX = 44;

const readHash = () => {
  const m = /^#(\d+)$/.exec(window.location.hash);
  const n = m ? Number(m[1]) : 1;
  return n >= 1 && n <= N ? n : 1;
};

export default function BalsoaDeck() {
  const [cur, setCur] = useState(1);
  const [prev, setPrev] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const curRef = useRef(1);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  // Slajd iz linka (#n) se postavlja pre prvog iscrtavanja posle hidratacije.
  useLayoutEffect(() => {
    const n = readHash();
    if (n !== 1) setCur(n);
    setReady(true);
  }, []);

  useLayoutEffect(() => {
    curRef.current = cur;
    if (ready) document.getElementById("bx-pre")?.remove();
  }, [cur, ready]);

  const go = useCallback((n: number) => {
    const from = curRef.current;
    if (n < 1 || n > N || n === from) return;
    curRef.current = n;
    setPrev(from);
    setCur(n);
    const { pathname, search } = window.location;
    window.history.replaceState(
      null,
      "",
      n === 1 ? pathname + search : `${pathname}${search}#${n}`,
    );
  }, []);

  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), LEAVE_MS);
    return () => clearTimeout(t);
  }, [prev, cur]);

  useEffect(() => {
    const onHash = () => go(readHash());
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target instanceof Element ? e.target : null;
      if (t?.closest("input, textarea, select, [contenteditable='true']"))
        return;
      let step = 0;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
          step = 1;
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          step = -1;
          break;
        case " ":
          // Razmak na dugmetu ili linku aktivira njih, ne menja slajd.
          if (t?.closest("button, a")) return;
          step = e.shiftKey ? -1 : 1;
          break;
        case "Home":
          e.preventDefault();
          go(1);
          return;
        case "End":
          e.preventDefault();
          go(N);
          return;
        default:
          return;
      }
      e.preventDefault();
      go(curRef.current + step);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("hashchange", onHash);
    };
  }, [go]);

  const onPointerDown = (e: PointerEvent) => {
    const t = e.target instanceof Element ? e.target : null;
    swipe.current =
      e.pointerType === "touch" && !t?.closest("input, [data-noswipe]")
        ? { x: e.clientX, y: e.clientY }
        : null;
  };

  const onPointerUp = (e: PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    go(curRef.current + (dx < 0 ? 1 : -1));
  };

  return (
    <div
      className={`bx ${BALSOA_FONT}`}
      data-tone={SLIDES[cur - 1].tone}
      data-cur={cur}
      data-ready={ready ? "" : undefined}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        swipe.current = null;
      }}
    >
      {VIEWS.map((View, i) => {
        const n = i + 1;
        const on = n === cur;
        return (
          <section
            key={n}
            className="bx-slide"
            data-bx-slide={n}
            data-tone={SLIDES[i].tone}
            data-state={on ? "on" : n === prev ? "off" : undefined}
            data-side={n < cur ? "before" : n > cur ? "after" : undefined}
            aria-hidden={!on}
            inert={!on}
            aria-label={`${n} / ${N}: ${SLIDES[i].title}`}
          >
            <View active={on && ready} />
          </section>
        );
      })}

      <nav className="bx-nav" aria-label="Slajdovi">
        <button
          type="button"
          aria-label="Prethodni slajd"
          disabled={cur === 1}
          onClick={() => go(cur - 1)}
        >
          <Ico name="left" />
        </button>
        <span className="bx-count" aria-live="polite">
          {cur} / {N}
        </span>
        <button
          type="button"
          aria-label="Sledeći slajd"
          disabled={cur === N}
          onClick={() => go(cur + 1)}
        >
          <Ico name="right" />
        </button>
      </nav>
      <div className="bx-progress" aria-hidden>
        <i style={{ transform: `scaleX(${cur / N})` }} />
      </div>
    </div>
  );
}
