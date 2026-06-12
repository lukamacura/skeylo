"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { type Package, formatPrice } from "@/lib/packages";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      type: "spring" as const,
      stiffness: 150,
      damping: 22,
    },
  }),
};

export default function PackageLanding({ pkg }: { pkg: Package }) {
  const accent = pkg.accent;
  const meetHref = `/meet?paket=${pkg.slug}`;
  const ctaCls =
    "group inline-flex items-center justify-center gap-2 rounded-md bg-primary px-7 py-4 text-base font-extrabold text-primary-foreground transition-transform hover:-translate-y-0.5";

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative isolate overflow-hidden grain pt-28 pb-16 md:pt-36 md:pb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[40rem] w-[60rem] -translate-x-1/2 rounded-full opacity-50 blur-[130px]"
          style={{
            background: `radial-gradient(circle, ${accent}55, transparent 60%)`,
          }}
        />
        <div className="container-x relative">
          <Link
            href="/#paketi"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Svi paketi
          </Link>

          <div className="mt-8 max-w-3xl">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.03] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{ color: accent }}
            >
              <Sparkles className="size-3.5" />
              {pkg.heroKicker}
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-6 text-balance text-5xl font-extrabold leading-[0.95] sm:text-6xl lg:text-7xl"
            >
              {pkg.heroTitle}{" "}
              <span
                style={{
                  background: `linear-gradient(100deg, ${pkg.accent}, var(--primary))`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {pkg.heroHighlight}
              </span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              {pkg.heroSubtitle}
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-8 flex flex-wrap items-center gap-5"
            >
              <Link href={meetHref} className={ctaCls}>
                Kreni sa {pkg.name}
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-extrabold">
                  {formatPrice(pkg.price)}€
                </span>
                <span className="text-sm text-muted-foreground">
                  / {pkg.priceNote}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Stats strip */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {pkg.stats.map((s) => (
              <div key={s.label} className="rounded-2xl card-glass p-6">
                <div
                  className="font-display text-4xl font-extrabold"
                  style={{ color: accent }}
                >
                  {s.value}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ZA KOGA */}
      <section className="py-16 md:py-20">
        <div className="container-x">
          <div className="rounded-3xl border border-border card-glass p-8 md:p-12">
            <p
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: accent }}
            >
              Za koga je ovaj paket
            </p>
            <p className="mt-4 max-w-3xl text-balance text-2xl font-bold leading-snug sm:text-3xl">
              {pkg.forWho}
            </p>
          </div>
        </div>
      </section>

      {/* PROBLEM -> RESENJE */}
      <section className="py-16 md:py-20">
        <div className="container-x grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card/40 p-8 md:p-10">
            <h3 className="text-2xl font-bold">Bez nas, ovako izgleda</h3>
            <ul className="mt-6 space-y-4">
              {pkg.pain.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                    <X className="size-3.5 text-red-400" />
                  </span>
                  <span className="text-muted-foreground">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-3xl border p-8 md:p-10"
            style={{
              borderColor: `${accent}55`,
              background: `linear-gradient(160deg, ${accent}1f, transparent)`,
            }}
          >
            <h3 className="text-2xl font-bold">Sa nama, ovako izgleda</h3>
            <p className="mt-6 text-lg leading-relaxed text-foreground/90">
              {pkg.promise}
            </p>
            <div className="mt-8">
              <Link href={meetHref} className={ctaCls}>
                Hoću ovaj paket
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DELIVERABLES */}
      <section className="py-16 md:py-20">
        <div className="container-x">
          <div className="mb-12 max-w-2xl">
            <p
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: accent }}
            >
              Šta tačno dobijaš
            </p>
            <h2 className="mt-3 text-balance text-4xl font-extrabold sm:text-5xl">
              Sve uključeno u {pkg.name}
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {pkg.deliverables.map((d, i) => (
              <motion.div
                key={d.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="flex gap-4 rounded-2xl card-glass p-6"
              >
                <span
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${accent}22` }}
                >
                  <Check className="size-5" style={{ color: accent }} />
                </span>
                <div>
                  <h3 className="text-lg font-bold">{d.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* OUTCOME + PRICE CTA */}
      <section className="py-16 md:py-24">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-3xl border border-border p-8 text-center md:p-16 grain">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full blur-[100px]"
              style={{ background: `${accent}33` }}
            />
            <p
              className="relative text-sm font-semibold uppercase tracking-widest"
              style={{ color: accent }}
            >
              Rezultat
            </p>
            <h2 className="relative mx-auto mt-4 max-w-3xl text-balance text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              {pkg.outcome}
            </h2>

            <div className="relative mt-10 flex flex-col items-center gap-4">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-extrabold">
                  {formatPrice(pkg.price)}€
                </span>
                <span className="text-muted-foreground">/ {pkg.priceNote}</span>
              </div>
              <Link href={meetHref} className={ctaCls}>
                Kreni sa {pkg.name}
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <p className="text-sm text-muted-foreground">
                Bez obaveze · Odgovor na upit za manje od 48h
              </p>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center">
            <Link
              href="/#paketi"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-primary"
            >
              Uporedi sa drugim paketima
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
