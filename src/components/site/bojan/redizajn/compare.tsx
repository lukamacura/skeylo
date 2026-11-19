"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionStyle,
} from "framer-motion";
import { ChevronsLeftRight } from "lucide-react";
import { MONO, RED, useSlideActive } from "../primitives";

/* Room the rest of a spot slide needs above and below the photo (bar,
   padding, headline, chips). The photo takes whatever height is left, so
   a portrait shot and a landscape one both fit the screen whole. On a wide
   screen the photo shares its row with the 280px list of fixes, so its
   width comes from the viewport (stage padding, max-w-6xl, list and gap)
   rather than from the row: that keeps the list right beside a portrait
   photo instead of out at the far edge. */
const RESERVE =
  "[--reserve:300px] md:[--reserve:380px] lg:[--reserve:290px] lg:[--maxw:calc(min(100vw_-_120px,72rem)_-_312px)]";

const RADIUS = "4px 22px 4px 4px";

function Tag({
  children,
  red = false,
  dashed = false,
  className = "",
  style,
}: {
  children: string;
  red?: boolean;
  dashed?: boolean;
  className?: string;
  style?: MotionStyle;
}) {
  return (
    <motion.span
      className={`pointer-events-none absolute top-2.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] md:top-3.5 md:text-[11px] ${className}`}
      style={{
        fontFamily: MONO,
        color: "#fff",
        background: red
          ? RED
          : dashed
            ? "rgba(0,0,0,0.45)"
            : "rgba(0,0,0,0.62)",
        border: dashed ? "1.5px dashed rgba(255,255,255,0.55)" : undefined,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        ...style,
      }}
    >
      {children}
    </motion.span>
  );
}

/* One spot in the store, before and after. The "posle" photo lies on top
   and is cut off left of the divider, so the left side is always "pre".
   When the slide opens the divider sweeps across once to show the whole
   "posle", then settles in the middle. On touch only the handle drags
   (the rest of the photo still swipes the deck, a tap moves the divider);
   a mouse can drag anywhere. Without a "posle" photo yet, it is just the
   "pre" photo with a dashed tag. */
export function Compare({
  pre,
  posle,
  alt,
  w,
  h,
  className = "",
}: {
  pre: string;
  posle?: string;
  alt: string;
  w: number;
  h: number;
  className?: string;
}) {
  const active = useSlideActive();
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const run = useRef<AnimationPlaybackControls | null>(null);
  const pos = useMotionValue(100);
  const clip = useTransform(pos, (v) => `inset(0 0 0 ${v}%)`);
  const left = useTransform(pos, (v) => `${v}%`);
  const preTag = useTransform(pos, [4, 18], [0, 1]);
  const posleTag = useTransform(pos, [82, 96], [1, 0]);
  const range = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = pos.on("change", (v) => {
      if (range.current) range.current.value = String(Math.round(v));
    });
    return sync;
  }, [pos]);

  useEffect(() => {
    if (!posle || !active) return;
    if (reduce) {
      pos.set(50);
      return;
    }
    pos.set(100);
    run.current = animate(pos, [100, 0, 0, 50], {
      duration: 3.1,
      delay: 0.9,
      times: [0, 0.42, 0.62, 1],
      ease: [[0.65, 0, 0.35, 1], "linear", [0.2, 0.8, 0.2, 1]],
    });
    return () => run.current?.stop();
  }, [active, posle, reduce, pos]);

  const at = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r || !r.width) return pos.get();
    return Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
  };

  const grab = (e: React.PointerEvent<HTMLElement>) => {
    if (!posle) return;
    run.current?.stop();
    e.currentTarget.setPointerCapture(e.pointerId);
    pos.set(at(e.clientX));
  };
  const drag = (e: React.PointerEvent<HTMLElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) pos.set(at(e.clientX));
  };

  const ar = w / h;

  return (
    <div
      ref={box}
      className={`relative select-none overflow-hidden bg-[#141414] ${RESERVE} ${className}`}
      style={
        {
          "--ar": ar,
          aspectRatio: `${w} / ${h}`,
          width:
            "min(var(--maxw, 100%), calc((100svh - var(--reserve)) * var(--ar)))",
          borderRadius: RADIUS,
          cursor: posle ? "ew-resize" : undefined,
        } as CSSProperties
      }
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") grab(e);
      }}
      onPointerMove={drag}
      onClick={(e) => {
        if (!posle) return;
        run.current?.stop();
        run.current = animate(pos, at(e.clientX), {
          type: "spring",
          stiffness: 380,
          damping: 38,
        });
      }}
    >
      <Image
        src={pre}
        alt={`${alt}, danas`}
        fill
        draggable={false}
        sizes="(min-width: 1024px) 60vw, 92vw"
        className="object-cover"
      />

      {posle ? (
        <>
          <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
            <Image
              src={posle}
              alt={`${alt}, posle redizajna`}
              fill
              draggable={false}
              sizes="(min-width: 1024px) 60vw, 92vw"
              className="object-cover"
            />
          </motion.div>

          <Tag className="left-2.5 md:left-3.5" style={{ opacity: preTag }}>
            Pre
          </Tag>
          <Tag
            red
            className="right-2.5 md:right-3.5"
            style={{ opacity: posleTag }}
          >
            Posle
          </Tag>

          {/* The divider and its handle. The wide strip around the line is
              the touch target; it is marked as a demo so the deck leaves
              the gesture to it. */}
          <motion.div
            data-demo
            aria-hidden
            className="absolute inset-y-0 w-14 -translate-x-1/2"
            style={{ left, touchAction: "none" }}
            onPointerDown={(e) => {
              e.stopPropagation();
              grab(e);
            }}
            onPointerMove={(e) => {
              e.stopPropagation();
              drag(e);
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white"
              style={{ boxShadow: "0 0 10px rgba(0,0,0,0.45)" }}
            />
            <span
              className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-black md:h-12 md:w-12"
              style={{
                boxShadow: `0 0 0 3px ${RED}, 0 8px 22px -6px rgba(0,0,0,0.6)`,
              }}
            >
              <ChevronsLeftRight size={20} strokeWidth={2.5} />
            </span>
          </motion.div>

          <input
            ref={range}
            type="range"
            min={0}
            max={100}
            defaultValue={100}
            aria-label={`${alt}: pre i posle`}
            className="sr-only"
            onFocus={() => run.current?.stop()}
            onChange={(e) => pos.set(Number(e.target.value))}
          />
        </>
      ) : (
        <>
          <Tag className="left-2.5 md:left-3.5">Pre</Tag>
          <Tag dashed className="right-2.5 md:right-3.5">
            Posle · u izradi
          </Tag>
        </>
      )}
    </div>
  );
}
