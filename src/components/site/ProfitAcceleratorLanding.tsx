"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowDownRight,
  TrendingUp,
  Image as ImageIcon,
  Megaphone,
  MousePointerClick,
  Sparkles,
  HelpCircle,
  Filter,
  Gauge,
} from "lucide-react";
import { getPackage, formatPrice } from "@/lib/packages";
import AcceleratorQuizPopup from "@/components/site/AcceleratorQuizPopup";
import YouTubePlayer from "@/components/site/YouTubePlayer";

const GOLD = "#f0b656";
const ORANGE = "#d87928";

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

const ctaCls =
  "group inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#f0b656] to-[#d87928] px-6 py-3.5 text-base font-extrabold text-[#0a0a0a] shadow-lg shadow-[#f0b656]/20 transition-transform hover:-translate-y-0.5 sm:px-7 sm:py-4";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-sm font-semibold uppercase tracking-widest"
      style={{ color: GOLD }}
    >
      {children}
    </p>
  );
}

const fomo = [
  {
    icon: HelpCircle,
    title: "Vodiš oglase naslepo",
    desc: "Bez prave optimizacije ne znaš koji oglas donosi novac, a koji samo troši budžet. Svaki dan nagađanja je izgubljen novac.",
  },
  {
    icon: Filter,
    title: "Posete bez prodaje",
    desc: "Saobraćaj dolazi, ali se posetioci ne pretvaraju u kupce. Sajt koji ne konvertuje pretvara svaki klik u trošak.",
  },
  {
    icon: Gauge,
    title: "Rast koji staje",
    desc: "Bez sistema za testiranje i skaliranje, kampanje udare u plafon. Konkurencija sa boljim procesom te pretiče.",
  },
];

const agitation = [
  "Paljaš oglase, ali ne znaš koji zapravo donose novac.",
  "Sajt ti ima posete, ali se posetioci ne pretvaraju u kupce.",
  "Nemaš vremena ni znanje da vodiš i optimizuješ kampanje.",
  "Testiraš nasumično - bez jasnog procesa šta radi, a šta ne.",
  "Trošiš budžet brže nego što ti se vraća kroz prodaju.",
];

const benefits = [
  {
    icon: ImageIcon,
    title: "20 kreativa",
    desc: "Veća količina vizuelnog sadržaja za testiranje i skaliranje pobednika.",
  },
  {
    icon: Megaphone,
    title: "Meta reklame (FB & IG)",
    desc: "Kompletno vođenje, optimizacija i praćenje oglasnih kampanja.",
  },
  {
    icon: MousePointerClick,
    title: "Analiza sajta",
    desc: "Detaljan pregled uz konkretne UX/UI predloge za povećanje prodaje.",
  },
  {
    icon: TrendingUp,
    title: "Fokus na ROI",
    desc: "Svaka odluka usmerena ka povratu na uloženo - predvidiv, merljiv rast.",
  },
];

export default function ProfitAcceleratorLanding() {
  const pkg = getPackage("profit-accelerator")!;

  return (
    <div className="relative pb-28 sm:pb-24">
      {/* ───────────── HERO ───────────── */}
      <section className="relative isolate overflow-hidden grain pt-24 pb-12 md:pt-36 md:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[40rem] w-[60rem] -translate-x-1/2 rounded-full opacity-50 blur-[130px]"
          style={{
            background: `radial-gradient(circle, ${GOLD}55, transparent 60%)`,
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

          <div className="mx-auto mt-8 max-w-4xl text-center">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 rounded-full border border-[#f0b656]/30 bg-[#f0b656]/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{ color: GOLD }}
            >
              <Sparkles className="size-3.5" />
              {pkg.heroKicker}
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-5 text-balance text-3xl font-extrabold leading-[1.08] sm:mt-6 sm:text-5xl sm:leading-[1.02] lg:text-6xl"
            >
              Trošiš budžet na oglase, a ne znaš šta{" "}
              <span
                style={{
                  background: `linear-gradient(100deg, ${GOLD}, ${ORANGE})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                zapravo donosi profit
              </span>
              ?
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg"
            >
              Preuzimamo tvoje Meta oglašavanje od A do Š, dajemo ti 20 kreativa
              za testiranje i analiziramo sajt - sistem koji pretvara budžet u
              predvidiv profit.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-extrabold sm:text-3xl">
                  {formatPrice(pkg.price)}€
                </span>
                <span className="text-sm text-muted-foreground">
                  / {pkg.priceNote}
                </span>
              </div>

              <AcceleratorQuizPopup>
                <button type="button" className={ctaCls}>
                  Želim rast
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </button>
              </AcceleratorQuizPopup>
            </motion.div>
          </div>

          {/* ── VSL ── */}
          <div className="mx-auto mt-10 max-w-4xl sm:mt-14">
            <YouTubePlayer
              videoId="N9XojZpNSQg"
              title="Profit Accelerator"
              caption="Profit Accelerator"
            />
          </div>
        </div>
      </section>

      {/* ───────────── STORYTELLING / FOMO ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel>Cena nagađanja</SectionLabel>
            <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              Šta se dešava kad{" "}
              <span className="text-gradient">nema sistema</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-5 sm:text-lg">
              Bez procesa za testiranje i optimizaciju, oglašavanje je lutrija.
              Trošiš novac na nadu umesto na podatke - a rast staje pre nego što
              je počeo.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {fomo.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="rounded-2xl border border-border bg-card/40 p-6 sm:p-7"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-red-500/10">
                  <f.icon className="size-5 text-red-400" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── CASE STUDY ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel>Studija slučaja</SectionLabel>
            <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl">
              Brojke, ne obećanja
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
              Preuzeli smo vođenje Meta kampanja, pustili 20 kreativa u
              testiranje i analizirali sajt. Skalirali smo pobednike i
              isključili ono što ne radi - rezultat je predvidiv, merljiv rast.
            </p>

            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-4 border-t border-border pt-8">
              {[
                { value: "20", label: "kreativa za testiranje i skaliranje" },
                { value: "FB+IG", label: "kampanje pod našim vođenjem" },
                { value: "UX/UI", label: "analiza sajta sa predlozima" },
              ].map((r) => (
                <div key={r.label}>
                  <div className="font-display text-lg font-extrabold text-gradient sm:text-3xl">
                    {r.value}
                  </div>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">
                    {r.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── PROBLEM → SOLUTION ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card/40 p-6 sm:p-8 md:p-10">
            <SectionLabel>Zvuči poznato?</SectionLabel>
            <h3 className="mt-3 text-xl font-bold sm:text-2xl">
              Ovako izgleda bez sistema
            </h3>
            <ul className="mt-6 space-y-4">
              {agitation.map((a) => (
                <li key={a} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                    <ArrowDownRight className="size-3.5 text-red-400" />
                  </span>
                  <span className="text-muted-foreground">{a}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-3xl border p-6 sm:p-8 md:p-10"
            style={{
              borderColor: `${GOLD}55`,
              background: `linear-gradient(160deg, ${GOLD}1f, transparent)`,
            }}
          >
            <SectionLabel>Rešenje</SectionLabel>
            <h3 className="mt-3 text-xl font-bold sm:text-2xl">
              Vođene kampanje fokusirane na profit
            </h3>
            <p className="mt-6 text-base leading-relaxed text-foreground/90 sm:text-lg">
              {pkg.promise}
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Preuzimamo oglašavanje, testiramo kreative i optimizujemo svaki
              dinar budžeta. Ti dobijaš jasnu sliku šta donosi prodaju i sistem
              spreman za skaliranje.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────── CORE BENEFITS ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <SectionLabel>Šta tačno dobijaš</SectionLabel>
            <h2 className="mt-3 text-balance text-2xl font-extrabold sm:text-4xl md:text-5xl">
              Profit Accelerator
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="rounded-2xl card-glass p-6 text-center sm:p-7"
              >
                <span
                  className="mx-auto inline-flex size-12 items-center justify-center rounded-xl"
                  style={{ background: `${GOLD}22` }}
                >
                  <b.icon className="size-6" style={{ color: GOLD }} />
                </span>
                <h3 className="mt-5 text-lg font-bold">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {b.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── IRRESISTIBLE OFFER ───────────── */}
      <section className="py-12 md:py-24">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-3xl border border-[#f0b656]/30 p-6 sm:p-8 md:p-14 grain">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full blur-[110px]"
              style={{ background: `${GOLD}33` }}
            />

            <div className="relative mx-auto max-w-2xl text-center">
              <SectionLabel>Neodoljiva ponuda</SectionLabel>
              <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl">
                Vođene kampanje + 20 kreativa za{" "}
                <span className="text-gradient">{formatPrice(pkg.price)}€</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
                Kompletno vođenje Meta oglašavanja, sadržaj za skaliranje i
                analiza sajta - sve usmereno ka više prodaja i predvidivom
                rastu.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 border-t border-border pt-8 sm:mt-10 sm:pt-10">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-extrabold sm:text-5xl">
                    {formatPrice(pkg.price)}€
                  </span>
                  <span className="text-muted-foreground">
                    / {pkg.priceNote}
                  </span>
                </div>
                <AcceleratorQuizPopup>
                  <button type="button" className={ctaCls}>
                    Želim rast
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </AcceleratorQuizPopup>
                <p className="text-sm text-muted-foreground">
                  Bez obaveze · Odgovor na upit za manje od 48h
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── FIXED BOTTOM CTA ───────────── */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur">
        <div className="container-x flex flex-col items-center gap-2 py-3 sm:flex-row sm:justify-between sm:gap-4 sm:py-4">
          <div className="hidden items-baseline gap-1.5 sm:flex">
            <span className="font-display text-2xl font-extrabold">
              {formatPrice(pkg.price)}€
            </span>
            <span className="text-sm text-muted-foreground">
              / {pkg.priceNote}
            </span>
          </div>

          <div className="flex w-full flex-col items-center gap-1.5 sm:w-auto sm:items-end">
            <AcceleratorQuizPopup>
              <button
                type="button"
                className={`${ctaCls} w-full px-8 py-3.5 sm:w-auto`}
              >
                Želim rast
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </button>
            </AcceleratorQuizPopup>
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] text-muted-foreground sm:text-xs">
              <span>Bez obaveze</span>
              <span aria-hidden>·</span>
              <span>Besplatna konsultacija</span>
              <span aria-hidden>·</span>
              <span>Odgovor za 48h</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
