"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { DISPLAY } from "./primitives";

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

/* ------------------------------------------------------------------------ */
/* The iPhone both demos live in                                              */
/* ------------------------------------------------------------------------ */

/* Titanium bezel, black screen, Dynamic Island and the status bar. The demo
   draws its own screens inside and, if it needs one, its own home bar: the
   app demo's bar is draggable, the catalog's is only there to look right.
   The status bar's colour follows whatever the screen underneath it is. */
export function PhoneFrame({
  children,
  statusColor = "#111",
  screenRef,
  screenStyle,
  caption,
  captionColor = "#8A8A8A",
  homeBar,
}: {
  children: ReactNode;
  statusColor?: string;
  screenRef?: Ref<HTMLDivElement>;
  screenStyle?: CSSProperties;
  caption?: ReactNode;
  captionColor?: string;
  /* A static home indicator, drawn on top of everything. */
  homeBar?: "light" | "dark";
}) {
  return (
    <div className="mx-auto w-full max-w-[350px] select-none">
      <div
        data-demo
        className="relative rounded-[60px] p-[11px]"
        style={{
          background: "#1b1b1d",
          boxShadow:
            "0 0 0 2px #8d8d92, 0 0 0 4px #3a3a3c, 0 30px 60px -30px rgba(0,0,0,0.5)",
        }}
      >
        <div
          ref={screenRef}
          className="relative h-[660px] overflow-hidden rounded-[50px] bg-black"
          style={{ isolation: "isolate", fontFamily: DISPLAY, ...screenStyle }}
        >
          <div
            aria-hidden
            className="absolute left-1/2 top-[11px] z-30 h-8 w-[108px] -translate-x-1/2 rounded-[20px] bg-black"
          />
          <StatusBar color={statusColor} />
          {children}
          {homeBar && (
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-2 left-1/2 z-40 block h-[5px] w-[134px] -translate-x-1/2 rounded-[3px]"
              style={{ background: homeBar === "light" ? "#fff" : "#111" }}
            />
          )}
        </div>
      </div>
      {caption && (
        <p
          className="mt-5 text-center text-[13px]"
          style={{ color: captionColor }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}

function StatusBar({ color }: { color: string }) {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 top-0 z-[25] flex h-[52px] items-start justify-between px-[30px] pl-[34px] pt-4 text-[15px] transition-colors duration-300"
      style={{ color }}
    >
      <b className="font-bold">9:41</b>
      <span className="mt-0.5 flex items-center gap-1.5">
        <svg viewBox="0 0 18 12" width={17} height={12}>
          <rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" />
          <rect
            x="5"
            y="5.5"
            width="3"
            height="6.5"
            rx="1"
            fill="currentColor"
          />
          <rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor" />
          <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" />
        </svg>
        <svg viewBox="0 0 16 12" width={16} height={12}>
          <path
            d="M8 11.5l2.2-2.6a3 3 0 0 0-4.4 0z M3.3 6.3a6.6 6.6 0 0 1 9.4 0l-1.5 1.8a4.4 4.4 0 0 0-6.4 0z M.6 3.3a10.4 10.4 0 0 1 14.8 0l-1.5 1.8a8.2 8.2 0 0 0-11.8 0z"
            fill="currentColor"
          />
        </svg>
        <span
          className="relative h-3 w-[25px] rounded-[4px] p-[1.5px] opacity-95"
          style={{ border: "1.5px solid currentColor" }}
        >
          <i className="block h-full w-[78%] rounded-[2px] bg-current" />
          <i className="absolute -right-1 top-[3px] h-1 w-[2px] rounded-[1px] bg-current" />
        </span>
      </span>
    </div>
  );
}
