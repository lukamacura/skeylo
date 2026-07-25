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

  return (
    <section className="relative isolate overflow-hidden grain pt-24 pb-12 md:pt-36 md:pb-20">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[42rem] w-[42rem] rounded-full opacity-60 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(216,121,40,0.45), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 grid-lines opacity-[0.4] [mask-image:radial-gradient(80%_60%_at_50%_0%,black,transparent)]"
      />

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
            className="absolute inset-0 -z-10 translate-y-8 scale-95 rounded-full opacity-70 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(216,121,40,0.4), transparent 65%)",
            }}
          />
          <motion.div
            whileHover={reduce ? undefined : { rotate: -0.4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            className="relative aspect-[4/3]"
          >
            <Image
              src="/hero.jpeg"
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
