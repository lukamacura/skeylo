"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  Target,
  Megaphone,
  ShoppingCart,
  CalendarCheck,
  LineChart,
  Sparkles,
} from "lucide-react";
import { getPackage, formatPrice } from "@/lib/packages";
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

const fomo = [
  {
    icon: Clock,
    title: "Vreme curi, a ti se idalje mučiš",
    desc: "Svaki dan koji provedeš boreći se sa marketingom je dan u kome ne vodiš biznis. Konkurencija u međuvremenu uzima tvoje kupce.",
  },
  {
    icon: ArrowDownRight,
    title: "Novac odlazi u prazno",
    desc: "Bez sistema, svaki uloženi dinar u oglase je nagađanje. Ne znaš šta radi, šta ne, ni koliko te zapravo košta neaktivnost.",
  },
  {
    icon: Target,
    title: "Kupci te ne nalaze",
    desc: "Dok ti odlažeš, oni biraju nekog drugog. Tržište ne čeka - ko se prvi pojavi sa pravom porukom, taj uzima prodaju.",
  },
];

const agitation = [
  "Probao si sam da vodiš oglase - potrošio budžet, a rezultat je tišina.",
  "Skupljaš ponude od pet agencija i niko ti ne daje celu sliku.",
  "Sajt ti je zastareo ili ga uopšte nemaš, pa prodaja zavisi od poruka u DM-u.",
  "Termine i porudžbine vodiš ručno - greške, propušteni leadovi, izgubljeno vreme.",
  "Na kraju meseca ne znaš tačno koliko si zaradio, potrošio, ni šta se isplati.",
];

const benefits = [
  {
    icon: Megaphone,
    title: "Kompletan marketing",
    desc: "Analiza tržišta, premium kreative i Meta kampanje - sve vodi naš tim.",
  },
  {
    icon: ShoppingCart,
    title: "Sajt koji prodaje 24/7",
    desc: "Moderan, brz webshop koji konvertuje posetioce u kupce dok ti spavaš.",
  },
  {
    icon: CalendarCheck,
    title: "Automatsko zakazivanje",
    desc: "Termini i usluge se bukiraju sami - bez poruka, poziva i ručnog rada.",
  },
  {
    icon: LineChart,
    title: "Finansije na dlanu",
    desc: "Prihodi, rashodi i ROI u realnom vremenu - jasna slika svakog dana.",
  },
];

export default function ProfitZaTebeLanding() {
  const pkg = getPackage("profit-za-tebe")!;

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
            </motion.div>
          </div>

          {/* ── VSL ── */}
          <div className="mx-auto mt-10 max-w-4xl sm:mt-14">
            <YouTubePlayer
              videoId="dlUPtygQnR8"
              title="Profit za tebe"
              caption="Profit za tebe"
            />
          </div>
        </div>
      </section>

      {/* ───────────── STORYTELLING / FOMO ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel>Cena čekanja</SectionLabel>
            <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              Šta se dešava ako{" "}
              <span className="text-gradient">ništa ne promeniš</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
              <strong className="font-semibold text-foreground">
                Najskuplja odluka u biznisu
              </strong>{" "}
              je ona koju stalno odlažeš. Dok razmišljaš,{" "}
              <strong className="font-semibold text-foreground">
                konkurencija već radi
              </strong>{" "}
              - a tvoj potencijal stoji neiskorišćen.
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
              Jedan tim preuzima sve umesto tebe
            </h3>
            <p className="mt-6 text-base leading-relaxed text-foreground/90 sm:text-lg">
              {pkg.promise}
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Ti se fokusiraš na{" "}
              <strong className="font-semibold text-foreground">
                vođenje biznisa
              </strong>
              . Mi se brinemo o tržištu, kreativama, oglasima, sajtu,
              zakazivanju i finansijskim izveštajima -{" "}
              <strong className="font-semibold text-foreground">
                sve na jednom mestu
              </strong>
              , bez spajanja deset alata i agencija.
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
              Ceo biznis online
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
                <span className="font-display text-4xl font-extrabold sm:text-5xl">
                  {formatPrice(pkg.price)}€
                </span>
                <span className="text-muted-foreground">/ {pkg.priceNote}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Odgovor za manje od 48h
              </p>
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
            <ProfitQuizPopup>
              <button
                type="button"
                className={`${ctaCls} w-full px-8 py-3.5 sm:w-auto`}
              >
                Želim sve
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </button>
            </ProfitQuizPopup>
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] text-muted-foreground sm:text-xs">
              <span>Tvoj posvećeni tim</span>
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
