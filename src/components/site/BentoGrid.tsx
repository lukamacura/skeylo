"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import {
  TrendingUp,
  Sparkles,
  Target,
  ArrowUpRight,
  TimerIcon,
} from "lucide-react";

const team = ["/luka.webp", "/mihac.webp", "/filip.webp"];

const ease = [0.22, 1, 0.36, 1] as const;

const fade = {
  hidden: { opacity: 0, y: 22, scale: 0.975 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.055, duration: 0.5, ease },
  }),
};

/* ---------------------------------------------------------------- proof wall */

type Shot = {
  src: string;
  w: number;
  h: number;
  /** rendered width — mobile / desktop */
  cls: string;
  /** final resting angle, deg */
  rot: number;
  alt: string;
};

/** Two rows, sizes tuned so the text inside every screenshot stays readable. */
const rowA: Shot[] = [
  {
    src: "/bento1/b5.webp",
    w: 290,
    h: 196,
    cls: "w-[150px] sm:w-[175px]",
    rot: -3.6,
    alt: "Meta Ads: ROAS 11.19",
  },
  {
    src: "/bento1/b11.webp",
    w: 1600,
    h: 389,
    cls: "w-[340px] sm:w-[400px]",
    rot: 1.4,
    alt: "Mesečni izveštaj: 3.611.950 RSD prihoda, 740.280 RSD profita, ROAS 4,51x",
  },
  {
    src: "/bento1/b1.webp",
    w: 942,
    h: 692,
    cls: "w-[145px] sm:w-[170px]",
    rot: -3.2,
    alt: "Mejl klijenta: odobrena kreativa",
  },
  {
    src: "/bento1/b13.webp",
    w: 1012,
    h: 94,
    cls: "w-[290px] sm:w-[340px]",
    rot: 2,
    alt: "Kampanja sa 6.304,85 $ vrednosti kupovina",
  },
  {
    src: "/bento1/b7.webp",
    w: 550,
    h: 360,
    cls: "w-[155px] sm:w-[180px]",
    rot: 3.4,
    alt: "Prihod 1.660.370 RSD",
  },
  {
    src: "/bento1/b6.webp",
    w: 1168,
    h: 194,
    cls: "w-[340px] sm:w-[400px]",
    rot: 1.2,
    alt: "8.206,85 $ potrošeno, 479 prodaja, 71.945,73 $ vrednosti",
  },
];

const rowB: Shot[] = [
  {
    src: "/bento1/b9.webp",
    w: 296,
    h: 182,
    cls: "w-[150px] sm:w-[175px]",
    rot: 3.5,
    alt: "Meta Ads: ROAS 8.77",
  },
  {
    src: "/bento1/b4.webp",
    w: 1200,
    h: 396,
    cls: "w-[320px] sm:w-[380px]",
    rot: -1.4,
    alt: "4.494,81 $ potrošeno, 447 prodaja, 31.952,56 $ vrednosti",
  },
  {
    src: "/bento1/b12.webp",
    w: 806,
    h: 170,
    cls: "w-[275px] sm:w-[320px]",
    rot: 1.8,
    alt: "Poruka klijenta: kada pojačavamo budžet reklame",
  },
  {
    src: "/bento1/b2.webp",
    w: 1170,
    h: 657,
    cls: "w-[180px] sm:w-[210px]",
    rot: -3.4,
    alt: "Instagram poruka klijenta: super je",
  },
  {
    src: "/bento1/b10.webp",
    w: 1600,
    h: 850,
    cls: "w-[190px] sm:w-[225px]",
    rot: 3.2,
    alt: "Popunjen kalendar termina za celu nedelju",
  },
  {
    src: "/bento1/b3.webp",
    w: 1002,
    h: 90,
    cls: "w-[290px] sm:w-[340px]",
    rot: -1.8,
    alt: "Kampanja sa 30.908,41 $ vrednosti kupovina",
  },
];

const shotIn = {
  hidden: { opacity: 0, y: 14, scale: 0.92, rotate: 0 },
  show: (rot: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: rot,
    transition: { duration: 0.42, ease },
  }),
};

const rowIn = {
  hidden: {},
  show: { transition: { delayChildren: 0.12, staggerChildren: 0.045 } },
};

function ProofRow({ shots, anim }: { shots: Shot[]; anim: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      variants={rowIn}
      className={`flex w-max items-center will-change-transform ${
        reduce ? "" : `${anim} hover:[animation-play-state:paused]`
      }`}
    >
      {[...shots, ...shots].map((s, i) => (
        <motion.figure
          key={`${s.src}-${i}`}
          custom={s.rot}
          variants={shotIn}
          aria-hidden={i >= shots.length}
          className={`me-3 shrink-0 overflow-hidden rounded-lg bg-white/5 shadow-[0_12px_30px_-14px_rgba(0,0,0,0.9)] ring-1 ring-white/12 sm:me-4 sm:rounded-xl ${s.cls}`}
        >
          <Image
            src={s.src}
            alt={i >= shots.length ? "" : s.alt}
            width={s.w}
            height={s.h}
            sizes="400px"
            className="h-auto w-full"
          />
        </motion.figure>
      ))}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ counters */

function Counter({
  to,
  format,
}: {
  to: number;
  format: (v: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 0.9,
      ease,
      onUpdate: setValue,
    });
    return () => controls.stop();
  }, [inView, reduce, to]);

  return <span ref={ref}>{format(value)}</span>;
}

/** Highlighter-pen sweep that fires once, when the heading scrolls into view. */
function Highlight({
  children,
  tone,
  delay = 0,
}: {
  children: React.ReactNode;
  tone: "dark" | "light";
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const light = tone === "light";

  return (
    <span className="relative inline-block whitespace-nowrap px-[0.22em]">
      <motion.span
        aria-hidden
        initial={reduce ? false : { scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ delay, duration: 0.42, ease }}
        className={`absolute inset-x-0 inset-y-[0.06em] origin-left rounded-[0.28em] ${
          light
            ? "bg-[#f2eedd] shadow-[0_0_30px_-8px_rgba(242,238,221,0.6)]"
            : "bg-[#050505] shadow-[0_0_30px_-6px_rgba(0,0,0,0.95)] ring-1 ring-inset ring-white/12"
        }`}
      />
      <motion.span
        initial={reduce ? false : { color: "#ece8d4" }}
        whileInView={{ color: light ? "#070707" : "#ece8d4" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ delay: delay + 0.16, duration: 0.26, ease }}
        className="relative"
      >
        {children}
      </motion.span>
    </span>
  );
}

function Cell({
  children,
  className = "",
  i = 0,
}: {
  children: React.ReactNode;
  className?: string;
  i?: number;
}) {
  return (
    <motion.div
      custom={i}
      variants={fade}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className={`relative overflow-hidden rounded-2xl card-glass p-5 sm:p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function BentoGrid() {
  return (
    <section id="rezultati" className="relative py-12 md:py-20">
      <div className="container-x">
        <div className="mb-8 max-w-2xl sm:mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            kako izgleda na papiru
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-5xl">
            Rezultati <Highlight tone="dark">crno</Highlight> na{" "}
            <Highlight tone="light" delay={0.14}>
              belo
            </Highlight>
          </h2>
        </div>

        <div className="grid auto-rows-[minmax(9rem,auto)] grid-cols-2 gap-3 sm:auto-rows-[minmax(11rem,auto)] sm:gap-4 lg:grid-cols-4">
          {/* Big statement card — zid dokaza */}
          <Cell
            i={0}
            className="col-span-2 row-span-2 flex flex-col justify-between gap-4 bg-gradient-to-br from-primary/15 via-card to-card"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl"
            />

            {/* Marquee zid — sve što smo napravili, jedno pored drugog */}
            <div className="-mx-5 flex flex-col gap-3 [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)] sm:-mx-6 sm:gap-4">
              <div className="flex h-[126px] items-center overflow-hidden sm:h-[148px]">
                <ProofRow
                  shots={rowA}
                  anim="animate-[marquee_52s_linear_infinite]"
                />
              </div>
              <div className="flex h-[126px] items-center overflow-hidden sm:h-[148px]">
                <ProofRow
                  shots={rowB}
                  anim="animate-[marquee_58s_linear_infinite_reverse]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {team.map((src) => (
                  <div
                    key={src}
                    className="relative size-9 overflow-hidden rounded-full border-2 border-card"
                  >
                    <Image src={src} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                Tvoj posvećeni tim
              </span>
            </div>
          </Cell>

          {/* ROAS metric */}
          <Cell i={1} className="flex flex-col justify-between">
            <TrendingUp className="size-6 text-accent" />
            <div>
              <div className="font-display text-3xl font-extrabold text-gradient sm:text-4xl lg:text-5xl">
                <Counter to={4.2} format={(v) => `${v.toFixed(1)}x`} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                prosečan povrat na uloženo
              </p>
            </div>
          </Cell>

          {/* Leads metric */}
          <Cell i={2} className="flex flex-col justify-between">
            <Target className="size-6 text-accent" />
            <div>
              <div className="font-display text-2xl font-extrabold sm:text-4xl lg:text-5xl">
                <Counter
                  to={133000}
                  format={(v) => `${Math.round(v).toLocaleString("de-DE")}€`}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                generisano Skeylo kreativama
              </p>
            </div>
          </Cell>

          {/* Time-to-profit metric */}
          <Cell i={3} className="flex flex-col justify-between">
            <TimerIcon className="size-6 rotate-90 text-accent" />
            <div>
              <div className="font-display text-2xl font-extrabold sm:text-4xl lg:text-5xl">
                1 mesec
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                prosečan period potreban za profit
              </p>
            </div>
          </Cell>

          {/* Retention metric */}
          <Cell i={4} className="flex flex-col justify-between">
            <TimerIcon className="size-6 rotate-90 text-accent" />
            <div>
              <div className="font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl">
                <Counter to={97} format={(v) => `${Math.round(v)}%`} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                klijenata ostane sa nama duže od godinu dana
              </p>
            </div>
          </Cell>

          {/* Wide CTA-ish card */}
          <Cell
            i={5}
            className="col-span-2 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center lg:col-span-4"
          >
            <div>
              <h3 className="text-lg font-bold sm:text-2xl">
                Sve počinje odabirom paketa.
              </h3>
            </div>
            <a
              href="#paketi"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 sm:py-3 sm:text-base"
            >
              Paketi
              <ArrowUpRight className="size-4" />
            </a>
          </Cell>
        </div>
      </div>
    </section>
  );
}
