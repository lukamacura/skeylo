"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type FocusEvent,
} from "react";

export const SLIDE_COUNT = 9;

export function parseSlideHash(hash: string): number {
  const match = /^#(\d+)$/.exec(hash);
  if (!match) return 1;
  const n = Number(match[1]);
  return n >= 1 && n <= SLIDE_COUNT ? n : 1;
}

/** Slajd na koji je stranica otvorena: njegov dijagram je već vidljiv pre hidratacije. */
export const LOAD_SLIDE =
  typeof window === "undefined" ? null : parseSlideHash(window.location.hash);

const DRAW_MS = 1600;

/** True samo tokom prvog iscrtavanja. Ponovni ulazak na slajd ga ne ponavlja. */
export function useFirstDraw(active: boolean, slide: number) {
  const [drawing, setDrawing] = useState(false);
  const seen = useRef(false);

  useLayoutEffect(() => {
    if (!active || seen.current) return;
    seen.current = true;
    if (slide !== LOAD_SLIDE) setDrawing(true);
  }, [active, slide]);

  useEffect(() => {
    if (!drawing) return;
    const timer = setTimeout(() => setDrawing(false), DRAW_MS);
    return () => clearTimeout(timer);
  }, [drawing]);

  return drawing;
}

/** Hover/fokus ističe element; izabrani element ostaje istaknut dok je panel otvoren. */
export function useDiagramInteraction(active: boolean) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (active) return;
    setHovered(null);
    setFocused(null);
    setSelected(null);
  }, [active]);

  const bind = useCallback(
    (id: string, label: string, activate: () => void) => ({
      role: "button",
      tabIndex: 0,
      "aria-label": label,
      onPointerEnter: (e: PointerEvent<SVGGElement>) => {
        if (e.pointerType === "mouse") setHovered(id);
      },
      onPointerLeave: (e: PointerEvent<SVGGElement>) => {
        if (e.pointerType === "mouse")
          setHovered((current) => (current === id ? null : current));
      },
      onFocus: (e: FocusEvent<SVGGElement>) => {
        if (!e.currentTarget.matches(":focus-visible")) return;
        // Važi poslednja radnja: miš koji miruje ne sme da prekrije fokus sa tastature.
        setHovered(null);
        setFocused(id);
      },
      onBlur: () => setFocused((current) => (current === id ? null : current)),
      onClick: activate,
      onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      },
    }),
    [],
  );

  return {
    highlighted: hovered ?? focused ?? selected,
    selected,
    setSelected,
    bind,
  };
}
