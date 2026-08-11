"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Megaphone,
  CalendarCheck,
  Sparkles,
  Search,
  Globe,
  Clapperboard,
  Scissors,
  PenLine,
  Rocket,
  Image as ImageIcon,
} from "lucide-react";
import { getPackage, priceLabel } from "@/lib/packages";
import ProfitQuizPopup from "@/components/site/ProfitQuizPopup";
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

const steps = [
  {
    icon: CalendarCheck,
    title: "Sastanak",
    desc: "Sedneš sa nama na kratak razgovor. Ispričaš nam ko su tvoji kupci i šta si do sada probao, a mi izlazimo sa jasnim planom za tvoj biznis.",
  },
  {
    icon: Search,
    title: "Istraživanje tržišta",
    desc: "Analiziramo konkurenciju, tvoje kupce i tržište - da znamo tačno šta prodaje pre nego što potrošimo novac na reklame.",
  },
  {
    icon: Globe,
    title: "Izrada sajta",
    desc: "Pravimo moderan sajt koji konvertuje posetioce u kupce - brz, jasan i spreman da radi za tebe 24/7.",
  },
  {
    icon: Clapperboard,
    title: "Smišljanje i snimanje",
    desc: "Pišemo hook-ove i uglove koji prodaju, pa snimamo profesionalne kreative.",
  },
  {
    icon: Rocket,
    title: "Aktivacija kampanje",
    desc: "Pokrećemo Meta kampanje sa gotovim kreativama i pratimo rezultate od prvog dana.",
  },
  {
    icon: TrendingUp,
    title: "Skaliranje",
    desc: "Kad kampanja radi, povećavamo budžet i širimo je dalje - rezultat raste umesto da stoji u mestu.",
  },
];

const benefits = [
  {
    icon: Search,
    title: "Istraživanje tržišta",
    desc: "Analiza konkurencije i kupaca pre nego što krenemo sa produkcijom i oglasima.",
  },
  {
    icon: PenLine,
    title: "Smišljanje reklama",
    desc: "Hook-ovi, poruke i uglovi koji su već dokazano prodavali kod sličnih brendova.",
  },
  {
    icon: Clapperboard,
    title: "Snimanje",
    desc: "Produkcija kreativa u tvojim bojama, tipografiji i tonu brenda.",
  },
  {
    icon: Scissors,
    title: "Montaža",
    desc: "Kreative montirane i spremne za objavu u formatima za sve platforme.",
  },
  {
    icon: Globe,
    title: "Izrada sajta",
    desc: "Moderan, brz sajt koji konvertuje posetioce u kupce dok ti spavaš.",
  },
  {
    icon: Megaphone,
    title: "Upravljanje meta kampanjama",
    desc: "Pokretanje, praćenje i optimizacija kampanja - bez nagađanja.",
  },
];

export default function ProfitZaTebeLanding() {
  const pkg = getPackage("profit-za-tebe")!;

  return (
    <div className="relative pb-28 sm:pb-24">
      {/* ───────────── HERO ───────────── */}
      <section className="relative isolate overflow-hidden pt-16 pb-12 sm:pt-20 md:pt-24 md:pb-20">
        {/* Ista atmosfera kao na glavnoj landing stranici: mreža → sjaj → fade. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="hero-grid absolute inset-0" />
          <div className="hero-radial absolute inset-0" />
          <div className="hero-glow absolute left-1/2 top-0 h-[20rem] w-[130%] -translate-x-1/2 rounded-full bg-primary/20 blur-[90px] sm:h-[24rem] sm:w-[80%] md:h-[28rem]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background sm:h-48" />
        </div>
        <div className="container-x relative">
          <Link
            href="/#paketi"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Svi paketi
          </Link>

          <div className="mx-auto mt-6 max-w-4xl text-center">
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
              Želiš da povećaš prihode, ali nemaš vremena da se{" "}
              <span
                style={{
                  background: `linear-gradient(100deg, ${GOLD}, ${ORANGE})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                baviš marketingom?
              </span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg"
            >
              Naš tim će uraditi{" "}
              <strong className="font-semibold text-foreground">
                SVE za tebe
              </strong>{" "}
              - od analize tržišta, produkcije, kreativa i{" "}
              <strong className="font-semibold text-foreground">
                Meta reklama
              </strong>
              , pa do{" "}
              <strong className="font-semibold text-foreground">
                sajta sa finansijskim izveštajima
              </strong>
              .
            </motion.p>

            {/* ── Pokazivač na VSL ── */}
            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-10 flex flex-col items-center gap-2 sm:mt-12"
            >
              <p className="text-base font-semibold sm:text-lg">
                Pogledaj video u kom je sve objašnjeno
              </p>
              <motion.span
                aria-hidden
                animate={{ y: [0, 8, 0] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="inline-flex"
              >
                <ArrowDown className="size-7" style={{ color: GOLD }} />
              </motion.span>
            </motion.div>
          </div>

          {/* ── VSL ── */}
          <div className="mx-auto mt-4 max-w-4xl sm:mt-6">
            <YouTubePlayer
              videoId="dlUPtygQnR8"
              title="Profit za tebe"
              caption="Profit za tebe"
            />
          </div>
        </div>
      </section>

      {/* ───────────── PROCES ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel>Kako to izgleda</SectionLabel>
            <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              Ti ne radiš ništa -{" "}
              <span className="text-gradient">mi radimo sve</span>
            </h2>
          </div>

          <div className="mt-12 space-y-10 sm:mt-16 sm:space-y-14">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                custom={0}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12"
              >
                <div className={i % 2 === 1 ? "lg:order-2" : undefined}>
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex size-11 items-center justify-center rounded-xl"
                      style={{ background: `${GOLD}22` }}
                    >
                      <s.icon className="size-5" style={{ color: GOLD }} />
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                      Korak {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-extrabold sm:text-2xl">
                    {s.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </div>

                <div className={i % 2 === 1 ? "lg:order-1" : undefined}>
                  <div
                    aria-hidden
                    className="flex aspect-[4/3] items-center justify-center rounded-3xl border border-dashed"
                    style={{
                      borderColor: `${GOLD}40`,
                      background: `linear-gradient(160deg, ${GOLD}0f, transparent)`,
                    }}
                  >
                    <ImageIcon
                      className="size-8 opacity-30"
                      style={{ color: GOLD }}
                    />
                  </div>
                </div>
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
              Infinity Laser Studio je sve termine zakazivao{" "}
              <strong className="font-semibold text-foreground">
                ručno, bez marketinga
              </strong>
              . Napravili smo sajt sa sistemom za zakazivanje i pokrenuli{" "}
              <strong className="font-semibold text-foreground">
                Meta kampanje sa 20 novih kreativa
              </strong>
              .
            </p>

            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-4 border-t border-border pt-8">
              {[
                { value: "1.245.000", label: "RSD prihoda za 3 meseca" },
                { value: "~100", label: "online zakazivanja / mesec" },
                { value: "4.14x", label: "povrat na uloženo" },
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

          <div className="mx-auto mt-10 max-w-3xl sm:mt-14">
            <YouTubePlayer
              videoId="8ZlDwuFZnYQ"
              title="Infinity Laser Studio - studija slučaja"
              caption="Infinity Laser Studio - studija slučaja"
            />
          </div>
        </div>
      </section>

      {/* ───────────── CORE BENEFITS / USLUGE ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <SectionLabel>Usluge</SectionLabel>
            <h2 className="mt-3 text-balance text-2xl font-extrabold sm:text-4xl md:text-5xl">
              Ceo biznis online
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

            <div className="relative grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              {/* copy */}
              <div>
                <SectionLabel>ponuda za vas</SectionLabel>
                <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl">
                  Web aplikacija sa{" "}
                  <span className="text-gradient">
                    finansijskim izveštajima
                  </span>
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
                  Prihodi, rashodi, povrat na investiciju -{" "}
                  <strong className="font-semibold text-foreground">
                    vidiš sve
                  </strong>
                  . Zamisli da svaki dan uđeš u aplikaciju i{" "}
                  <strong className="font-semibold text-foreground">
                    tačno znaš na čemu si
                  </strong>
                  . Bez tabela, bez nagađanja, bez čekanja knjigovođe.
                </p>

                <ul className="mt-8 space-y-3">
                  {[
                    "Prihodi i rashodi u realnom vremenu",
                    "Povrat na investiciju (ROI) po kanalu",
                    "Webshop, zakazivanje i finansije - na jednom mestu",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full"
                        style={{ background: `${GOLD}22` }}
                      >
                        <TrendingUp
                          className="size-3.5"
                          style={{ color: GOLD }}
                        />
                      </span>
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* finances doc mockup */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ type: "spring", stiffness: 140, damping: 22 }}
                className="group relative"
              >
                {/* stacked pages behind — the "book" */}
                <div
                  aria-hidden
                  className="absolute inset-0 origin-bottom-left rounded-2xl border border-border bg-white/50 transition-transform duration-500 ease-out group-hover:rotate-[5deg]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 origin-bottom-left rounded-2xl border border-border bg-white/75 transition-transform duration-500 ease-out group-hover:rotate-[2.5deg]"
                />

                {/* top page — the real screenshot */}
                <div
                  className="relative origin-bottom-left overflow-hidden rounded-2xl border border-border bg-white shadow-lg ring-1 ring-black/5 transition-all duration-500 ease-out group-hover:-rotate-[1.5deg] group-hover:shadow-2xl"
                  style={{ boxShadow: `0 22px 50px -24px ${GOLD}55` }}
                >
                  <div className="flex items-center gap-1.5 border-b border-black/5 bg-neutral-50 px-4 py-2.5">
                    <span className="size-2.5 rounded-full bg-red-400/70" />
                    <span className="size-2.5 rounded-full bg-amber-400/70" />
                    <span className="size-2.5 rounded-full bg-emerald-400/70" />
                    <span className="ml-3 text-xs font-medium text-neutral-400">
                      Finansijski panel
                    </span>
                  </div>
                  <Image
                    src="/finances.webp"
                    alt="Finansijski izveštaji — prihodi, rashodi i povrat na investiciju"
                    width={1900}
                    height={980}
                    className="block w-full transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                  {/* sheen */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-[1100ms] ease-out group-hover:translate-x-full"
                  />
                </div>
              </motion.div>
            </div>

            {/* price */}
            <div className="relative mt-10 flex flex-col items-center gap-4 border-t border-border pt-8 text-center sm:mt-12 sm:pt-10">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold sm:text-4xl">
                  {priceLabel(pkg)}
                </span>
              </div>

              <ProfitQuizPopup>
                <button type="button" className={ctaCls}>
                  Zatraži besplatnu konsultaciju
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </button>
              </ProfitQuizPopup>

              <p className="mx-auto max-w-xl text-sm text-muted-foreground">
                Sledeći korak: 9 kratkih pitanja (~1 minut), zatim te zovemo u
                roku od 48h na kanal koji izabereš. Na razgovoru dobijaš plan
                lansiranja i tačne rokove - odluku donosiš posle toga.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── FIXED BOTTOM CTA ───────────── */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur">
        <div className="container-x flex flex-col items-center gap-2 py-3 sm:flex-row sm:justify-between sm:gap-4 sm:py-4">
          <div className="hidden items-baseline gap-1.5 sm:flex">
            <span className="font-display text-xl font-extrabold">
              {priceLabel(pkg)}
            </span>
          </div>

          <div className="flex w-full flex-col items-center gap-1.5 sm:w-auto sm:items-end">
            <ProfitQuizPopup>
              <button
                type="button"
                className={`${ctaCls} w-full px-8 py-3.5 sm:w-auto`}
              >
                Zatraži besplatnu konsultaciju
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </button>
            </ProfitQuizPopup>
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] text-muted-foreground sm:text-xs">
              <span>~1 minut pitanja</span>
              <span aria-hidden>·</span>
              <span>Biraš kako te kontaktiramo</span>
              <span aria-hidden>·</span>
              <span>Javljamo se za 48h</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
