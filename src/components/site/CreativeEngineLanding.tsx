"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play,
  ArrowLeft,
  ArrowRight,
  ArrowDownRight,
  TrendingUp,
  Image as ImageIcon,
  PenTool,
  Layers,
  FileText,
  Sparkles,
  Frown,
  EyeOff,
  Wallet,
} from "lucide-react";
import { getPackage, formatPrice } from "@/lib/packages";
import CreativeQuizPopup from "@/components/site/CreativeQuizPopup";
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

/* Reusable video placeholder - swap `<div>` for a real <video>/embed later */
function VideoFrame({
  label,
  caption,
  aspect = "aspect-video",
}: {
  label: string;
  caption?: string;
  aspect?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 140, damping: 22 }}
      className={`group relative ${aspect} w-full overflow-hidden rounded-3xl border border-border card-glass`}
    >
      {/* glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${GOLD}1f, transparent 60%)`,
        }}
      />
      {/* play button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <span
          className="inline-flex size-14 items-center justify-center rounded-full border border-[#f0b656]/40 bg-[#0a0a0a]/40 backdrop-blur transition-transform group-hover:scale-110 sm:size-20"
          style={{ boxShadow: `0 0 40px -6px ${GOLD}66` }}
        >
          <Play className="size-6 translate-x-0.5 fill-[#f0b656] text-[#f0b656] sm:size-8" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      {caption && (
        <span className="absolute bottom-3 left-1/2 max-w-[90%] -translate-x-1/2 truncate whitespace-nowrap text-xs text-muted-foreground sm:bottom-4 sm:text-sm">
          {caption}
        </span>
      )}
    </motion.div>
  );
}

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
    icon: EyeOff,
    title: "Oglasi koje niko ne primeti",
    desc: "Amaterske kreative se gube u feed-u. Korisnik skroluje dalje za pola sekunde, a tvoj budžet i dalje curi.",
  },
  {
    icon: Wallet,
    title: "Budžet odlazi u prazno",
    desc: "Ista publika, isti budžet - ali sa slabom kreativom plaćaš skuplji klik i dobijaš manje kupaca. Kreativa je 80% rezultata.",
  },
  {
    icon: Frown,
    title: "Brend izgleda jeftino",
    desc: "Dok ti improvizuješ u Canvi, konkurencija sa premium vizuelima preuzima poverenje - i prodaju.",
  },
];

const agitation = [
  "Paljaš kampanju, a CTR i prodaja su razočaravajući.",
  "Trošiš sate u Canvi, a vizueli i dalje ne prodaju.",
  "Nemaš ideju šta da objaviš ni kako da to iskoristiš.",
  "Svaka objava izgleda drugačije - brend nema prepoznatljiv stil.",
  "Plaćaš oglase, ali slaba kreativa diže cenu po rezultatu.",
];

const benefits = [
  {
    icon: ImageIcon,
    title: "10 premium kreativa",
    desc: "Profesionalno dizajnirani vizueli prilagođeni tvom brendu - spremni za objavu.",
  },
  {
    icon: PenTool,
    title: "Brend-konzistentan stil",
    desc: "Boje, tipografija i ton usklađeni - feed koji deluje kao da iza njega stoji ozbiljan tim.",
  },
  {
    icon: Layers,
    title: "Spremno za testiranje",
    desc: "Više varijanti za Meta kampanje - testiraj, skaliraj pobednike, spusti cenu po kupcu.",
  },
  {
    icon: FileText,
    title: "Strateški PDF vodič",
    desc: "Tačno znaš kako, gde i kada da objaviš kreative za maksimalan efekat.",
  },
];

export default function CreativeEngineLanding() {
  const pkg = getPackage("creative-engine")!;

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
              Nisi zadovoljan{" "}
              <span
                style={{
                  background: `linear-gradient(100deg, ${GOLD}, ${ORANGE})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                rezultatima kampanje
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
              Skeylo kreative su izgenerisale preko{" "}
              <span className="font-bold text-foreground">113.000€</span>.
              Dobijaš 10 premium kreativa prilagođenih tvom brendu i strateški
              vodič kako da ih iskoristiš za maksimalan efekat.
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

              <CreativeQuizPopup>
                <button type="button" className={ctaCls}>
                  Želim kreative
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </button>
              </CreativeQuizPopup>
            </motion.div>
          </div>

          {/* ── VSL ── */}
          <div className="mx-auto mt-10 max-w-4xl sm:mt-14">
            <YouTubePlayer
              videoId="7gtOE3FhnEE"
              title="Creative Engine"
              caption="Creative Engine"
            />
          </div>
        </div>
      </section>

      {/* ───────────── STORYTELLING / FOMO ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel>Zašto kampanja podbacuje</SectionLabel>
            <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              Problem najčešće nije budžet -{" "}
              <span className="text-gradient">nego kreativa</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-5 sm:text-lg">
              Meta algoritam je pametan, ali ne može da proda slabim vizuelom.
              Kreativa je ono što zaustavlja skrol, gradi poverenje i pretvara
              klik u kupca.
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

      {/* ───────────── CASE STUDY (video) ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionLabel>Studija slučaja</SectionLabel>
              <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl">
                Brojke, ne obećanja
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
                Iste kampanje, ista publika - samo nove kreative. Premium
                vizueli su zaustavili skrol, podigli CTR i spustili cenu po
                kupcu. Rezultat: preko 113.000€ generisano kroz Skeylo kreative.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6">
                {[
                  { value: "113.000€", label: "generisano kroz kreative" },
                  { value: "10", label: "premium kreativa po brendu" },
                  { value: "100%", label: "prilagođeno tvom brendu" },
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

              <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="size-4 text-primary" />
                Pogledaj kreative koje su donele rezultat u videu.
              </div>
            </div>

            <VideoFrame
              label="Video studija slučaja"
              caption="Kreative koje prodaju - cela priča"
            />
          </div>
        </div>
      </section>

      {/* ───────────── PROBLEM → SOLUTION ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card/40 p-6 sm:p-8 md:p-10">
            <SectionLabel>Zvuči poznato?</SectionLabel>
            <h3 className="mt-3 text-xl font-bold sm:text-2xl">
              Ovako izgleda bez prave kreative
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
              Kreative koje zaustavljaju skrol
            </h3>
            <p className="mt-6 text-base leading-relaxed text-foreground/90 sm:text-lg">
              {pkg.promise}
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Bez sati u Canvi i nagađanja šta da objaviš. Dobijaš gotovu
              biblioteku premium kreativa i jasan plan kako da ih iskoristiš -
              spremno za prvu objavu.
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
              Creative Engine
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
                10 kreativa + strateški vodič za{" "}
                <span className="text-gradient">{formatPrice(pkg.price)}€</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
                Jednokratno ulaganje u kreative koje su deo sistema koji je
                generisao preko 113.000€. Spremno za objavu, prilagođeno tvom
                brendu.
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
                <CreativeQuizPopup>
                  <button type="button" className={ctaCls}>
                    Želim kreative
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </CreativeQuizPopup>
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
            <CreativeQuizPopup>
              <button
                type="button"
                className={`${ctaCls} w-full px-8 py-3.5 sm:w-auto`}
              >
                Želim kreative
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </button>
            </CreativeQuizPopup>
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
