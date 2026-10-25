"use client";

import { motion } from "framer-motion";
import { MapPin, MoveHorizontal, MoveVertical } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  HTML sloj iznad scene                                               */
/*                                                                      */
/*  Ručice, natpisi i pribadača su HTML, ne SVG: tekst ostaje oštar na  */
/*  svakom zumu, a touch-action i pointer capture rade isto na svakom   */
/*  telefonu. Scena im daje tačku u pikselima kadra.                    */
/* ------------------------------------------------------------------ */

export type Px = [number, number];

const at = ([x, y]: Px) => ({
  transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`,
});

type GripEvents = Pick<
  React.HTMLAttributes<HTMLDivElement>,
  | "onPointerDown"
  | "onPointerMove"
  | "onPointerUp"
  | "onPointerCancel"
  | "onLostPointerCapture"
>;

/** Ručica za povlačenje mere direktno na bazenu. */
export function Handle({
  pos,
  axis,
  active,
  ping,
  ...events
}: {
  pos: Px;
  axis: "x" | "y";
  active: boolean;
  ping: boolean;
} & GripEvents) {
  const Icon = axis === "x" ? MoveHorizontal : MoveVertical;
  return (
    <div aria-hidden className="absolute left-0 top-0" style={at(pos)}>
      <div
        {...events}
        className={`pl-fade-in absolute -left-[15px] -top-[15px] grid size-[30px] touch-none select-none place-items-center rounded-full bg-white text-[#04161c] transition-[scale,box-shadow] duration-200 before:absolute before:-inset-2.5 before:content-[''] ${
          axis === "x" ? "cursor-ew-resize" : "cursor-ns-resize"
        } ${
          active
            ? "scale-115 shadow-[0_0_0_3px_#4fd8eb,0_0_0_10px_rgba(79,216,235,0.22)]"
            : "shadow-[0_0_0_2px_#4fd8eb,0_6px_16px_-4px_rgba(0,0,0,0.6)] hover:scale-105"
        }`}
      >
        {ping && (
          <span className="pl-ping pointer-events-none absolute inset-0 rounded-full border-2 border-[#4fd8eb]" />
        )}
        <Icon className="pointer-events-none size-4" strokeWidth={2.6} />
      </div>
    </div>
  );
}

/** Kratak natpis koji pokaže gde se u sceni pojavila izabrana stavka. */
export function Callout({
  pos,
  shift,
  text,
  onDone,
}: {
  pos: Px;
  /** Pomeraj natpisa da ne izađe iz kadra; tačka ostaje na mestu. */
  shift: number;
  text: string;
  onDone: () => void;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0"
      style={at(pos)}
    >
      <div
        className="pl-callout absolute left-0 top-0"
        onAnimationEnd={(e) => e.target === e.currentTarget && onDone()}
      >
        <span className="absolute -left-[4px] -top-[4px] size-2 rounded-full bg-[#4fd8eb] shadow-[0_0_0_3px_rgba(79,216,235,0.3)]" />
        <span className="absolute -left-px bottom-1 h-3 w-0.5 rounded-full bg-[#4fd8eb]/70" />
        <span
          className="absolute bottom-4 left-0 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#4fd8eb]/40 bg-[#07090d]/90 px-2.5 py-1 text-[11px] font-semibold text-[#e9fbff] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.8)] lg:px-3 lg:text-xs"
          style={{ translate: `calc(-50% + ${shift.toFixed(1)}px) 0` }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}

/** Pribadača sa gradom korisnika, zabodena u dvorište. */
export function CityPin({ pos, label }: { pos: Px; label: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0"
      style={at(pos)}
    >
      <span className="pl-fade-in absolute -left-2.5 -top-1 h-2 w-5 rounded-[50%] bg-black/35" />
      <motion.div
        className="absolute bottom-0.5 left-0 flex -translate-x-1/2 flex-col items-center"
        initial={{ y: -26, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -14, opacity: 0, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 520, damping: 22 }}
      >
        <span className="flex max-w-[11rem] items-center gap-1 rounded-full bg-white py-1 pl-1.5 pr-2.5 text-xs font-semibold text-[#04161c] shadow-[0_8px_18px_-6px_rgba(0,0,0,0.7)]">
          <MapPin
            className="size-3.5 shrink-0 text-[#0aa5c0]"
            strokeWidth={2.6}
          />
          <span className="truncate">{label}</span>
        </span>
        <span className="-mt-px h-2 w-2.5 bg-white [clip-path:polygon(0_0,100%_0,50%_100%)]" />
      </motion.div>
    </div>
  );
}

/** Jednokratan savet uz ručice; nestane sam ili na prvo povlačenje. */
export function Hint({ pos, text }: { pos: Px; text: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0"
      style={at(pos)}
    >
      <span className="pl-hint absolute bottom-6 left-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#07090d]/85 px-2.5 py-1 text-[11px] font-semibold text-[#e9fbff] lg:text-xs">
        {text}
      </span>
    </div>
  );
}
