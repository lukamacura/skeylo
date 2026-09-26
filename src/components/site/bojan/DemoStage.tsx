"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/* Breathing room the phone leaves inside the stage. */
const MARGIN = 16;
const MIN_SCALE = 0.6;

/* The frame every clickable phone sits in. Nothing is drawn around it: the
   phone stands on its own slide and is the only thing to look at.

   The phone is drawn at a fixed size, which is taller than the stage on most
   laptops. Rather than ask a slide to scroll, the frame measures the stage
   and shrinks the phone just enough for the whole thing to be on screen,
   with the slide's padding and whatever else sits in its column accounted
   for. */
export function DemoStage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const inner = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ w: number; h: number; s: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const el = inner.current;
    const phone = el?.firstElementChild as HTMLElement | null;
    if (!el || !phone) return;
    const stage = el.closest<HTMLElement>("[data-stage]");
    const section = el.closest<HTMLElement>("[data-slide]");
    const content = section?.firstElementChild as HTMLElement | null;
    /* The slide's row that holds the phone: the ancestor sitting directly
       inside the slide's content column. Everything above and below it is
       what the phone has to leave room for. */
    let row: HTMLElement | null = el;
    while (row && row.parentElement !== content) row = row.parentElement;
    let last = { w: 0, h: 0, s: 1 };

    const measure = () => {
      const w = phone.offsetWidth;
      const h = phone.offsetHeight;
      if (!w || !h) return;
      const stageH = stage?.clientHeight ?? window.innerHeight;
      let around = MARGIN;
      if (section && content && row) {
        const cs = getComputedStyle(section);
        around +=
          content.offsetHeight -
          row.offsetHeight +
          parseFloat(cs.paddingTop) +
          parseFloat(cs.paddingBottom);
      }
      const s = Math.max(MIN_SCALE, Math.min(1, (stageH - around) / h));
      if (w === last.w && h === last.h && Math.abs(s - last.s) < 0.004) return;
      last = { w, h, s };
      setFit(last);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(phone);
    if (stage) ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div
        className="relative mx-auto w-fit"
        style={{
          width: fit ? fit.w * fit.s : undefined,
          height: fit ? fit.h * fit.s : undefined,
        }}
      >
        <div
          ref={inner}
          className="relative"
          style={{
            width: fit?.w,
            transform: fit ? `scale(${fit.s})` : undefined,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
