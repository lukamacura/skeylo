"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Hammer, Play, Store, Target, Video } from "lucide-react";
import {
  EASE_OUT,
  Headline,
  MONO,
  POP_SPRING,
  RED,
  Slide,
  Visual,
  useSlideActive,
} from "../primitives";

/* ------------------------------------------------------------------------
   The creatives the price buys (Luka, 2026-11-22): organic filming starts
   right away, and there are one or two whole Meta campaigns, depending on
   how fast the works on the store go. Shown as the 90 days on one track:
   the reels start on day one, the works (Neto's) run until the store
   reopens, the campaigns start at the reopening. A quick job leaves room
   for two, a slow one for one. The track flips between the two on its own
   until someone taps a side.
   ------------------------------------------------------------------------ */

const META_BLUE = "#0866FF";

type Pace = "brzo" | "sporo";
const PACES: [Pace, string][] = [
  ["brzo", "Brži radovi"],
  ["sporo", "Sporiji radovi"],
];

/* Shares of the 90 days. */
const WORKS: Record<Pace, number> = { brzo: 0.42, sporo: 0.66 };
const CAMP = 0.27;
const GAP = 0.015;
const REELS = 12;

const FIRST_FLIP = 3400;
const FLIP_EVERY = 3000;
const MOVE = { duration: 0.7, ease: EASE_OUT };

function campaigns(p: Pace) {
  const first = WORKS[p] + GAP;
  return [first, first + CAMP + GAP].map((at) => ({
    at,
    fits: at + CAMP <= 1.001,
  }));
}

const BAR =
  "relative h-[34px] overflow-hidden rounded-[8px] border border-[#262626] bg-[#121212] md:h-[44px]";

function Lane({
  icon: Icon,
  color,
  name,
  note,
  children,
}: {
  icon: React.ElementType;
  color: string;
  name: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2 md:mb-2">
        <Icon size={16} className="flex-none" style={{ color }} />
        <b className="text-[14px] font-extrabold leading-none md:text-[17px]">
          {name}
        </b>
        {note && (
          <span
            className="ml-auto text-[10px] uppercase leading-none tracking-[0.12em] md:text-[11.5px]"
            style={{ fontFamily: MONO, color: "#9A9A9A" }}
          >
            {note}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/* A reel every week or so, from the first day on. */
function Reels() {
  const active = useSlideActive();
  return (
    <div className={`${BAR} flex items-center justify-between px-1.5 md:px-2`}>
      {Array.from({ length: REELS }, (_, i) => (
        <motion.span
          key={i}
          className="grid h-[26px] w-[16px] place-items-center rounded-[4px] md:h-[34px] md:w-[21px]"
          style={{ background: i % 3 === 1 ? "#FF4B42" : RED }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={
            active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }
          }
          transition={{ ...POP_SPRING, delay: 0.55 + i * 0.06 }}
        >
          <Play size={9} fill="#fff" stroke="none" />
        </motion.span>
      ))}
    </div>
  );
}

/* The works, hatched, up to the reopening. The hatched layer slides in a
   clipped frame (transform only), the pin rides a full-width layer. */
function Works({ pace }: { pace: Pace }) {
  const active = useSlideActive();
  const w = active ? WORKS[pace] : 0;
  return (
    <div className="relative">
      <div className={BAR}>
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-r-[8px]"
          style={{
            background:
              "repeating-linear-gradient(135deg, #3A3A3A 0 6px, #262626 6px 12px)",
          }}
          initial={{ x: "-100%" }}
          animate={{ x: `${(w - 1) * 100}%` }}
          transition={MOVE}
        />
      </div>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ x: "0%", opacity: 0 }}
        animate={{ x: `${w * 100}%`, opacity: active ? 1 : 0 }}
        transition={MOVE}
      >
        <span className="absolute left-0 top-1/2 ml-1.5 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-white px-2 py-[3px] text-[11px] font-extrabold text-black md:ml-2 md:px-2.5 md:py-1 md:text-[13px]">
          <Store size={12} className="flex-none" style={{ color: RED }} />
          Otvaranje
        </span>
      </motion.span>
    </div>
  );
}

function Campaigns({ pace }: { pace: Pace }) {
  const active = useSlideActive();
  return (
    <div className={BAR}>
      {campaigns(pace).map((c, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute inset-y-[4px] left-0 w-full"
          initial={{ x: "100%", opacity: 0 }}
          animate={
            active
              ? { x: `${c.at * 100}%`, opacity: c.fits ? 1 : 0 }
              : { x: "100%", opacity: 0 }
          }
          transition={MOVE}
        >
          <span
            className="flex h-full items-center justify-center gap-1.5 rounded-[5px] text-[11.5px] font-extrabold text-white md:text-[14px]"
            style={{ width: `${CAMP * 100}%`, background: META_BLUE }}
          >
            <Target size={13} className="hidden flex-none md:block" />
            {i + 1}. kampanja
          </span>
        </motion.span>
      ))}
    </div>
  );
}

function Track() {
  const active = useSlideActive();
  const reduce = useReducedMotion();
  const [pace, setPace] = useState<Pace>("brzo");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!active || touched || reduce) return;
    let iv: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      setPace("sporo");
      iv = setInterval(
        () => setPace((p) => (p === "brzo" ? "sporo" : "brzo")),
        FLIP_EVERY,
      );
    }, FIRST_FLIP);
    return () => {
      clearTimeout(start);
      if (iv) clearInterval(iv);
    };
  }, [active, touched, reduce]);

  const n = campaigns(pace).filter((c) => c.fits).length;

  return (
    <div className="w-full max-w-[940px]">
      {/* the 90 days */}
      <div
        className="mb-3 grid grid-cols-3 text-[10px] uppercase tracking-[0.14em] md:mb-4 md:text-[11.5px]"
        style={{ fontFamily: MONO, color: "#8A8A8A" }}
      >
        {["1. mesec", "2. mesec", "3. mesec"].map((m, i) => (
          <span
            key={m}
            className="border-l border-[#333] pl-1.5 md:pl-2"
            style={i === 2 ? { borderRight: "1px solid #333" } : undefined}
          >
            {m}
          </span>
        ))}
      </div>

      <div className="grid gap-3.5 md:gap-5">
        <Lane
          icon={Video}
          color="#FF4B42"
          name="Organski sadržaj"
          note="od 1. dana"
        >
          <Reels />
        </Lane>
        <Lane icon={Hammer} color="#9A9A9A" name="Radovi na lokalu">
          <Works pace={pace} />
        </Lane>
        <Lane
          icon={Target}
          color={META_BLUE}
          name="Meta kampanje"
          note={
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={n}
                className="inline-block font-semibold text-white"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {n === 2 ? "2 cele kampanje" : "1 cela kampanja"}
              </motion.span>
            </AnimatePresence>
          }
        >
          <Campaigns pace={pace} />
        </Lane>
      </div>

      <div className="mt-4 flex justify-center md:mt-6">
        <div className="relative grid grid-cols-2 rounded-full border border-[#333] p-1">
          {/* one pill sliding under the two sides, transform only */}
          <motion.span
            aria-hidden
            className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white"
            initial={false}
            animate={{ x: pace === "brzo" ? "0%" : "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          />
          {PACES.map(([p, label]) => (
            <button
              key={p}
              type="button"
              aria-pressed={pace === p}
              onClick={() => {
                setTouched(true);
                setPace(p);
              }}
              className="relative cursor-pointer rounded-full px-3.5 py-2 text-[13px] font-extrabold transition-colors duration-300 md:px-5 md:text-[15px]"
              style={{ color: pace === p ? "#000" : "#BDBDBD" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Creatives() {
  return (
    <Slide id="kreative" theme="dark">
      <Headline size="xl">
        {"U ceni: snimanje [[i 1\u2060–\u20602 Meta kampanje.]]"}
      </Headline>
      <Visual className="!mt-5 md:!mt-9">
        <Track />
      </Visual>
    </Slide>
  );
}
