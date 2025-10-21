"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import FreeAnalysisPopup from "@/components/site/FreeAnalysisPopup";

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  } as const;

  const itemUp = {
    hidden: { y: prefersReducedMotion ? 0 : 12, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 200, damping: 22 },
    },
  } as const;

  const imageReveal = {
    hidden: { scale: prefersReducedMotion ? 1 : 0.98, opacity: 0 },
    show: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 160, damping: 20, delay: 0.1 },
    },
  } as const;

  return (
    <section className="relative isolate overflow-hidden">
      <motion.div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 grid lg:grid-cols-2 gap-10 items-center"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div>
          <motion.p
            className="inline-flex items-center text-xs uppercase tracking-widest rounded-full border px-2 py-1 mb-4"
            variants={itemUp}
          >
            Skeylo
          </motion.p>

          <motion.h1
            className="text-4xl/tight md:text-5xl font-bold"
            variants={itemUp}
          >
            Saznaj zašto tvoj marketing{" "}
            <b className="text-primary/80">ne donosi novac</b> i kako da to
            promeniš <b className="text-primary/80">POTPUNO BESPLATNO</b>
          </motion.h1>

          <motion.p
            className="mt-4 text-muted-foreground max-w-prose"
            variants={itemUp}
          >
            Dobijaš <b>personalizovanu marketing analizu</b> i jasan plan kako
            da tvoj biznis dođe do više prodaja, kreirano od fullstack marketing
            tima koji <b>garantuje rezultate</b>.
          </motion.p>

          <motion.div
            className="mt-6 flex flex-wrap gap-3 font-bold"
            variants={itemUp}
          >
            {/* Lift on hover/tap for a tactile feel */}
            <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
              <FreeAnalysisPopup triggerText="Saznaj besplatno" />
            </motion.div>
          </motion.div>
        </div>

        <motion.div className="relative aspect-[16/12]" variants={imageReveal}>
          {/* Soft shadow + subtle hover parallax */}
          <motion.div
            className="absolute inset-0 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          />

          <motion.div
            className="absolute inset-0"
            whileHover={
              prefersReducedMotion ? undefined : { rotate: -0.3, scale: 1.01 }
            }
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
          >
            <Image
              src="/hero.png"
              alt="Skeylo hero"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Gentle spotlight background already present; add a faint animated blur pulse */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.08),transparent)]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      />
    </section>
  );
}
