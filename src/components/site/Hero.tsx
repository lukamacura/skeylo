"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";

export default function Hero() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  } as const;

  const up = {
    hidden: { y: reduce ? 0 : 18, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 180, damping: 24 },
    },
  } as const;

  // Bez `grain` klase: zrno preko soft-light-a podiže crnu u sivu i celu
  // sekciju čini mutnom. Pozadina ostaje čisto #070707 da bi mreža i
  // narandžasti sjaj ostali oštri.
  return (
    <section className="relative isolate overflow-hidden pt-24 pb-12 md:pt-36 md:pb-20">
      {/* Atmosphere: square grid → radial glow → fade back into the page.
          Everything is sized relatively so it holds up from 360px to ultrawide. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="hero-grid absolute inset-0" />

        <div className="hero-radial absolute inset-0" />

        <div className="hero-glow absolute left-1/2 top-0 h-[20rem] w-[130%] -translate-x-1/2 rounded-full bg-primary/20 blur-[90px] sm:h-[24rem] sm:w-[80%] md:h-[28rem]" />

        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background sm:h-48" />
      </div>

      <motion.div
        className="container-x relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="relative z-10 text-center lg:text-left">
          <motion.h1
            variants={up}
            className="text-balance text-4xl font-extrabold leading-[1.1] sm:text-6xl sm:leading-[0.95] lg:text-7xl"
          >
            Marketing koji <span className="text-gradient">donosi profit</span>,
            a ne samo preglede i lajkove.
          </motion.h1>

          <motion.p
            variants={up}
            className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg lg:mx-0"
          >
            Kreative, plaćene kampanje i sajt u <b>jednom timu</b>. Gradimo
            sistem koji tvoj budžet pretvara u <b>profit</b>.
          </motion.p>

          <motion.div
            variants={up}
            className="mt-8 flex flex-col items-center gap-2 sm:mt-10 lg:items-start"
          >
            <Link
              href="#paketi"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-8 py-3.5 text-base font-extrabold text-primary-foreground transition-transform hover:-translate-y-0.5 sm:w-auto sm:py-4"
            >
              Pogledaj pakete
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <TrendingUp className="size-3.5 text-primary" />
              Svaki projekat profitabilan
            </span>
          </motion.div>
        </div>

        {/* Hero image */}
        <motion.div
          variants={up}
          className="relative mx-auto w-full max-w-xs sm:max-w-lg lg:max-w-none"
        >
          <div
            aria-hidden
            className="absolute inset-0 -z-10 translate-y-8 scale-95 rounded-full opacity-60 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(240,182,86,0.30), rgba(216,121,40,0.22) 45%, transparent 68%)",
            }}
          />
          <motion.div
            whileHover={reduce ? undefined : { rotate: -0.4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            className="relative aspect-[4/3]"
          >
            <Image
              src="/hero.png"
              alt="Skeylo tim"
              fill
              priority
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 45vw"
              className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
