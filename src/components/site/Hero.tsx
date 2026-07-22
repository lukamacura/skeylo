"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

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
    <section className="relative isolate overflow-hidden grain pt-28 pb-14 md:pt-36 md:pb-20">
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
        className="container-x relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="relative z-10">
          <motion.div
            variants={up}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.03] px-3 py-1.5 text-xs font-medium tracking-wide text-muted-foreground"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Full-stack marketing agencija
          </motion.div>

          <motion.h1
            variants={up}
            className="mt-6 text-balance text-5xl font-extrabold leading-[0.95] sm:text-6xl lg:text-7xl"
          >
            Marketing koji <span className="text-gradient">donosi profit</span>,
            a ne samo preglede i lajkove.
          </motion.h1>

          <motion.p
            variants={up}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            Kreative, plaćene kampanje i sajt u <b>jednom timu</b>. Gradimo
            sistem koji tvoj budžet pretvara u <b>vidljive prodaje</b>.
          </motion.p>

          <motion.div
            variants={up}
            className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <Link
              href="#paketi"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-4 text-base font-extrabold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Pogledaj pakete
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.div
            variants={up}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-primary text-primary" />
              ))}
              <span className="ml-1 font-medium text-foreground">
                Svaki projekat profitabilan
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span>
              <span className="font-semibold text-foreground">4.2x</span>{" "}
              prosečan povrat na uloženo
            </span>
          </motion.div>
        </div>

        {/* Hero image */}
        <motion.div
          variants={up}
          className="relative mx-auto w-full max-w-lg lg:max-w-none"
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
            className="relative aspect-[16/13]"
          >
            <Image
              src="/hero.png"
              alt="Skeylo tim"
              fill
              priority
              className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
