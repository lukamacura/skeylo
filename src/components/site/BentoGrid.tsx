"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Sparkles,
  Target,
  Zap,
  ArrowUpRight,
  TimerIcon,
} from "lucide-react";

const team = ["/luka.webp", "/mihac.webp", "/filip.webp"];

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      type: "spring" as const,
      stiffness: 140,
      damping: 20,
    },
  }),
};

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
            Šta dobijaš
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-5xl">
            Jedan tim. Kompletan marketing. Merljivi rezultati.
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            <b>Gradimo sistem</b> koji svaki uloženi dinar pretvara u prodaju
            koju možeš da vidiš u brojkama.
          </p>
        </div>

        <div className="grid auto-rows-[minmax(9rem,auto)] grid-cols-2 gap-3 sm:auto-rows-[minmax(11rem,auto)] sm:gap-4 lg:grid-cols-4">
          {/* Big statement card */}
          <Cell
            i={0}
            className="col-span-2 row-span-2 flex flex-col justify-between bg-gradient-to-br from-primary/15 via-card to-card"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl"
            />
            <Sparkles className="size-7 text-primary" />
            <div>
              <h3 className="text-balance text-xl font-bold leading-tight sm:text-3xl">
                Mi vodimo tvoj marketing - da ti možeš da vodiš biznis.
              </h3>
              <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
                Strategija, kreativa, kampanje i sajt pod jednim krovom. Bez
                mučenja sa pet agencija.
              </p>
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
                4.2x
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
                113.000€
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                generisano skeylo kreativama
              </p>
            </div>
          </Cell>

          {/* Creative mock card */}
          <Cell
            i={3}
            className="col-span-2 row-span-2 flex flex-col justify-between overflow-hidden p-0"
          >
            <div className="relative flex-1">
              <Image
                src="/step1.png"
                alt="Primer kreative"
                fill
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
            </div>
            <div className="relative -mt-16 p-6">
              <Zap className="size-6 text-primary" />
              <h3 className="mt-2 text-xl font-bold">
                Kreativa koja zaustavlja palac
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Reels i statične objave dizajnirane da prodaju, ne samo da
                izgledaju lepo.
              </p>
            </div>
          </Cell>

          {/* Cost metric */}
          <Cell i={4} className="flex flex-col justify-between">
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
          {/* Cost metric */}
          <Cell i={4} className="flex flex-col justify-between">
            <TimerIcon className="size-6 rotate-90 text-accent" />
            <div>
              <div className="font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl">
                97%
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                klijenata ostane sa nama duže od godinu dana
              </p>
            </div>
          </Cell>

          {/* Wide CTA-ish card */}
          <Cell
            i={6}
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
