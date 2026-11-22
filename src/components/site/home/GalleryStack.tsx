"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  motionValue,
  useInView,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/*
 * Špil fotografija "iza kulisa". Gornja fotka se prevlači levo-desno: brz
 * pokret ili dovoljno daleko je baca u stranu i ona se podvuče na dno špila,
 * inače se vrati. Tap ili strelica = sledeća, strelica levo vraća poslednju.
 * Dok niko ne dira, špil se sam okreće (samo dok je na ekranu).
 */

type Shot = { src: string; caption: string; pos?: string };

const SHOTS: Shot[] = [
  { src: "/podcast/korak3.webp", caption: "Snimanje", pos: "50% 40%" },
  { src: "/people/mihac/3.webp", caption: "Na terenu", pos: "50% 30%" },
  { src: "/podcast/korak4.webp", caption: "Montaža", pos: "62% 50%" },
  { src: "/site/analiza.webp", caption: "Strategija", pos: "50% 55%" },
  { src: "/people/mihac/2.webp", caption: "Iza kamere", pos: "42% 50%" },
  { src: "/podcast/korak1.webp", caption: "Plan i scenario", pos: "40% 50%" },
  { src: "/site/meta.webp", caption: "Kampanje", pos: "35% 50%" },
  { src: "/site/webdev.webp", caption: "Rad na sajtu", pos: "65% 50%" },
];

const N = SHOTS.length;
const VISIBLE = 4;
/** Položaj karte po dubini (0 = gornja). */
const POSE = [
  { x: 0, y: 0, scale: 1 },
  { x: 26, y: 6, scale: 0.96 },
  { x: -28, y: 14, scale: 0.92 },
  { x: 12, y: 24, scale: 0.88 },
];
/** Svaka fotka ima svoj nagib, pa špil izgleda kao prave slike na stolu. */
const TILT = [-2.5, 4, -5, 3, -3.5, 5, -1.5, 4.5];

const SETTLE = { type: "spring", bounce: 0.15, visualDuration: 0.45 } as const;

/** Apple-ova projekcija zamaha: gde bi se karta zaustavila da je pustiš. */
const project = (v: number, d = 0.998) => ((v / 1000) * d) / (1 - d);

function Card({
  shot,
  index,
  depth,
  x,
  onRelease,
  onTap,
  onGrab,
}: {
  shot: Shot;
  index: number;
  depth: number;
  x: MotionValue<number>;
  onRelease: (velocity: number) => void;
  onTap: () => void;
  onGrab: () => void;
}) {
  const top = depth === 0;
  const pose = POSE[Math.min(depth, VISIBLE - 1)];
  const rotate = useTransform(x, [-320, 0, 320], [-14, 0, 14]);
  // Tap pratimo ručno: framer pokreće drag već posle 3px, a pravi prst uvek
  // malo drhti. Tap = ceo pokret ostao ispod 12px.
  const down = useRef<{ x: number; y: number } | null>(null);
  const maxOff = useRef(0);
  const tapped = useRef(false);

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: N - depth }}
      initial={false}
      animate={{
        x: pose.x,
        y: pose.y,
        scale: pose.scale,
        rotate: top ? TILT[index] * 0.35 : TILT[index] * 1.4,
        opacity: depth < VISIBLE ? 1 : 0,
      }}
      transition={SETTLE}
    >
      <motion.div
        style={{ x, rotate }}
        drag={top ? "x" : false}
        dragMomentum={false}
        onDragStart={onGrab}
        onDrag={(_, info) => {
          maxOff.current = Math.max(maxOff.current, Math.abs(info.offset.x));
        }}
        onDragEnd={(_, info) => {
          // Tap je već prebacio kartu; ne vraćaj je na mesto preko njega.
          if (tapped.current) {
            tapped.current = false;
            return;
          }
          onRelease(info.velocity.x);
        }}
        onPointerDown={(e) => {
          if (!top) return;
          down.current = { x: e.clientX, y: e.clientY };
          maxOff.current = 0;
          tapped.current = false;
        }}
        onPointerUp={(e) => {
          const d = down.current;
          down.current = null;
          if (!top || !d || maxOff.current >= 12) return;
          if (Math.hypot(e.clientX - d.x, e.clientY - d.y) >= 12) return;
          tapped.current = true;
          window.setTimeout(() => (tapped.current = false), 300);
          // Posle ovog događaja framer završava svoj drag i pokreće animaciju na
          // istoj vrednosti, što bi prekinulo bacanje karte. Zato tap ide tik posle.
          window.setTimeout(onTap, 0);
        }}
        className={`relative h-full w-full touch-pan-y select-none rounded-[14px] bg-[#f3efe1] p-2.5 shadow-[0_28px_60px_-22px_rgba(0,0,0,0.95),0_2px_0_rgba(255,255,255,0.4)_inset] sm:p-3 ${
          top ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
        }`}
      >
        <div className="relative h-[calc(100%-2.75rem)] overflow-hidden rounded-[8px] bg-[#1a1712] sm:h-[calc(100%-3rem)]">
          <Image
            src={shot.src}
            alt={shot.caption}
            fill
            draggable={false}
            sizes="(max-width: 640px) 78vw, 360px"
            className="pointer-events-none object-cover"
            style={{ objectPosition: shot.pos }}
          />
        </div>
        <div className="flex h-11 items-center justify-between px-1 sm:h-12">
          <span className="font-display text-[15px] font-bold text-[#1a1712] sm:text-base">
            {shot.caption}
          </span>
          <span className="text-[11px] font-semibold tabular-nums text-[#1a1712]/40">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        {/* Karte dublje u špilu su malo tamnije */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[14px] bg-black transition-opacity duration-500"
          style={{ opacity: top ? 0 : Math.min(depth, VISIBLE - 1) * 0.12 }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function GalleryStack() {
  const [order, setOrder] = useState(() => SHOTS.map((_, i) => i));
  const [xs] = useState(() => SHOTS.map(() => motionValue(0)));
  const [touched, setTouched] = useState(false);
  const [hover, setHover] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const reduce = useReducedMotion();
  const inView = useInView(stage, { margin: "-15% 0px -15% 0px" });

  const width = () => stage.current?.offsetWidth ?? 300;

  /** Gornju baci u stranu `dir`; kad izađe, podvuci je na dno špila. */
  const next = (dir = -1, velocity = 0) => {
    if (busy.current) return;
    const top = order[0];
    const x = xs[top];
    const rotateDeck = () => setOrder((o) => [...o.slice(1), o[0]]);
    if (reduce) {
      x.set(0);
      rotateDeck();
      return;
    }
    busy.current = true;
    // Ako neko zgrabi kartu u letu, animacija stane pre zamene; ne zaključavaj špil.
    window.setTimeout(() => (busy.current = false), 700);
    const W = width();
    let swapped = false;
    animate(x, dir * W * 1.05, {
      type: "spring",
      bounce: 0,
      visualDuration: 0.3,
      velocity,
      onUpdate: (v) => {
        if (swapped || Math.abs(v) < W * 0.6) return;
        swapped = true;
        rotateDeck();
        // Ista vrednost, nova meta: karta nastavlja iz trenutnog zamaha i
        // vraća se iza špila, bez zastoja na ivici.
        animate(x, 0, SETTLE);
        busy.current = false;
      },
    });
  };

  /** Vrati poslednju sa dna: uleti sleva na vrh. */
  const prev = () => {
    if (busy.current) return;
    const last = order[N - 1];
    const x = xs[last];
    setOrder((o) => [o[N - 1], ...o.slice(0, -1)]);
    if (reduce) return;
    x.set(-width() * 0.9);
    animate(x, 0, SETTLE);
  };

  const release = (top: number, v: number) => {
    const x = xs[top];
    const pos = x.get();
    const W = width();
    // Brz pokret nazad ka sredini znači "ipak ne": vrati kartu.
    const returning =
      Math.abs(pos) > 40 &&
      Math.abs(v) > 200 &&
      Math.sign(v) !== Math.sign(pos);
    const landing = pos + project(v);
    if (!returning && (Math.abs(v) > 500 || Math.abs(landing) > W * 0.45)) {
      next(Math.sign(Math.abs(v) > 300 ? v : landing) || -1, v);
    } else {
      animate(x, 0, {
        type: "spring",
        bounce: 0.2,
        visualDuration: 0.3,
        velocity: v,
      });
    }
  };

  // Sama se okreće dok je na ekranu, dok miš nije na njoj i dok je niko ne dira.
  const nextRef = useRef(next);
  useEffect(() => {
    nextRef.current = next;
  });
  useEffect(() => {
    if (!inView || hover || touched || reduce) return;
    const t = window.setInterval(() => {
      if (!document.hidden) nextRef.current(-1);
    }, 3400);
    return () => window.clearInterval(t);
  }, [inView, hover, touched, reduce]);

  const top = order[0];
  const user = (fn: () => void) => () => {
    setTouched(true);
    fn();
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={stage}
        tabIndex={0}
        role="group"
        aria-roledescription="galerija"
        aria-label="Kako radimo, fotografije"
        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
        onPointerLeave={() => setHover(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") user(() => next(-1))();
          if (e.key === "ArrowLeft") user(prev)();
        }}
        className="relative aspect-[5/6] w-[min(76vw,340px)] rounded-[14px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:w-[360px]"
      >
        {SHOTS.map((s, i) => (
          <Card
            key={s.src}
            shot={s}
            index={i}
            depth={order.indexOf(i)}
            x={xs[i]}
            onGrab={() => setTouched(true)}
            onRelease={(v) => release(i, v)}
            onTap={user(() => next(-1))}
          />
        ))}
      </div>

      <div className="mt-10 flex items-center gap-4">
        <button
          type="button"
          aria-label="Prethodna fotografija"
          onClick={user(prev)}
          className="grid size-11 cursor-pointer place-items-center rounded-full border border-border bg-white/[0.03] text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 active:scale-95"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p
          aria-live="polite"
          className="min-w-[4.5rem] text-center text-sm font-semibold tabular-nums text-muted-foreground"
        >
          <span className="sr-only">
            Fotografija {top + 1} od {N}: {SHOTS[top].caption}.{" "}
          </span>
          <span aria-hidden>
            <span className="text-foreground">
              {String(top + 1).padStart(2, "0")}
            </span>
            {" / "}
            {String(N).padStart(2, "0")}
          </span>
        </p>
        <button
          type="button"
          aria-label="Sledeća fotografija"
          onClick={user(() => next(-1))}
          className="grid size-11 cursor-pointer place-items-center rounded-full border border-border bg-white/[0.03] text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 active:scale-95"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
