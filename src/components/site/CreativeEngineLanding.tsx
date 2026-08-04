"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CalendarCheck,
  Check,
  Clapperboard,
  CreditCard,
  Image as ImageIcon,
  PenLine,
  Sparkles,
} from "lucide-react";
import { getPackage, formatPrice } from "@/lib/packages";
import CreativeQuizPopup from "@/components/site/CreativeQuizPopup";
import YouTubePlayer from "@/components/site/YouTubePlayer";

const GOLD = "#f0b656";
const ORANGE = "#d87928";

/** Case study video za poslednji korak - dodaje se kad snimak bude gotov. */
const REZULTAT_VIDEO_ID: string | null = "xqlJQ6uadoQ";

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

/** Mesto za sliku koraka - zameni `image` putanjom kad vizuali budu spremni. */
function StepMedia({ image, alt }: { image: string | null; alt: string }) {
  if (image) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border card-glass">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 45vw, 90vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="flex aspect-[4/3] items-center justify-center rounded-3xl border border-dashed"
      style={{
        borderColor: `${GOLD}40`,
        background: `linear-gradient(160deg, ${GOLD}0f, transparent)`,
      }}
    >
      <ImageIcon className="size-8 opacity-30" style={{ color: GOLD }} />
    </div>
  );
}

/** Iznos sa centima, tačno kako piše na screenshotu iz naloga. */
const money = (n: number, currency: string) =>
  `${new Intl.NumberFormat("sr-RS", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)} ${currency}`;

/** Jedan red računice - iznos se broji od nule kad papir uđe u vidno polje. */
function PaperRow({
  label,
  value,
  currency,
  prefix = "",
  delay,
  start,
  strong = false,
  highlight = false,
}: {
  label: string;
  value: number;
  currency: string;
  prefix?: string;
  delay: number;
  start: boolean;
  strong?: boolean;
  highlight?: boolean;
}) {
  const count = useMotionValue(0);
  const text = useTransform(count, (v) => `${prefix}${money(v, currency)}`);

  useEffect(() => {
    if (!start) return;
    const controls = animate(count, value, {
      duration: 1,
      delay,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [start, value, delay, count]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={start ? { opacity: 1, x: 0 } : undefined}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className="flex h-9 items-center justify-between gap-4"
    >
      <span
        className={
          strong ? "text-lg font-extrabold sm:text-xl" : "text-base sm:text-lg"
        }
      >
        {label}
      </span>
      <span className="relative">
        {highlight && (
          <motion.span
            aria-hidden
            initial={{ scaleX: 0 }}
            animate={start ? { scaleX: 1 } : undefined}
            transition={{ delay: delay + 0.2, duration: 0.5, ease: "easeOut" }}
            className="absolute -inset-x-2 inset-y-1 origin-left rounded-[3px]"
            style={{ background: `${GOLD}99` }}
          />
        )}
        <motion.span
          className={`relative font-display tabular-nums ${
            strong
              ? "text-2xl font-extrabold sm:text-3xl"
              : "text-lg font-bold sm:text-xl"
          }`}
        >
          {text}
        </motion.span>
      </span>
    </motion.div>
  );
}

/** Prosta računica na papiru: prihod - uloženo = profit. */
function ProfitPaper({
  prihod,
  ulozeno,
  currency,
}: {
  prihod: number;
  ulozeno: number;
  currency: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="mx-auto w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 26, rotate: -2.5 }}
        animate={inView ? { opacity: 1, y: 0, rotate: -1.2 } : undefined}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="relative overflow-hidden rounded-sm"
        style={{
          background: "#fbf7ec",
          color: "#26303d",
          boxShadow: "0 30px 60px -25px rgba(0,0,0,.75)",
        }}
      >
        {/* linije sveske - počinju ispod naslova, korak 36px kao visina reda */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 top-14"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0 35px, #cdd9ea 35px 36px)",
          }}
        />
        {/* crvena margina */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-8 w-px"
          style={{ background: "#e59a94" }}
        />

        <div className="relative pb-7 pl-12 pr-6 pt-5 sm:pl-14 sm:pr-8">
          <p
            className="flex h-9 items-center text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "#8a96a6" }}
          >
            Računica
          </p>

          <PaperRow
            label="Prihod"
            value={prihod}
            currency={currency}
            delay={0.2}
            start={inView}
          />
          <PaperRow
            label="Uloženo"
            value={ulozeno}
            currency={currency}
            prefix="− "
            delay={0.95}
            start={inView}
          />

          {/* crta ispod koje se podvlači rezultat */}
          <div className="relative h-0">
            <motion.div
              aria-hidden
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : undefined}
              transition={{ delay: 1.75, duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-x-0 -top-px h-[2px] origin-left rounded-full"
              style={{ background: "#26303d" }}
            />
          </div>

          <PaperRow
            label="= Profit"
            value={prihod - ulozeno}
            currency={currency}
            delay={2.15}
            start={inView}
            strong
            highlight
          />
        </div>
      </motion.div>
    </div>
  );
}

/** Screenshotovi iz reklamnog naloga - stoje uz računicu kao dokaz brojki. */
function ProofShots({ proofs }: { proofs: Proof[] }) {
  return (
    <div className="mx-auto w-full max-w-md">
      <p
        className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em]"
        style={{ color: GOLD }}
      >
        Dokaz iz naloga
      </p>
      <div className="space-y-3">
        {proofs.map((p, i) => (
          <motion.figure
            key={p.src}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              delay: 0.15 + i * 0.12,
              type: "spring",
              stiffness: 130,
              damping: 20,
            }}
            className="overflow-hidden rounded-lg bg-white shadow-[0_12px_30px_-14px_rgba(0,0,0,0.9)] ring-1 ring-white/12"
          >
            <Image
              src={p.src}
              alt={p.alt}
              width={p.w}
              height={p.h}
              sizes="(min-width: 768px) 420px, 90vw"
              className="h-auto w-full"
            />
          </motion.figure>
        ))}
      </div>
    </div>
  );
}

const steps = [
  {
    icon: CalendarCheck,
    title: "Sastanak",
    desc: "Sedneš sa nama na 30 minuta. Ispričaš nam ko su tvoji kupci i šta si do sada probao, a mi izlazimo na teren sa jasnom slikom brenda.",
    image: null as string | null,
  },
  {
    icon: PenLine,
    title: "Pisanje kreativa",
    desc: "Mi pišemo hook-ove, poruke i uglove koji će raditi za tvoj brend. Ne nagađamo, već koristimo ono što je već prodavalo kod brendova sa istim tipom kupca kao tvoj.",
    image: null as string | null,
  },
  {
    icon: Clapperboard,
    title: "Produkcija",
    desc: "Dizajniramo i montiramo 10 kreativa u tvojim bojama, tipografiji i tonu. Dobijaš ih spremne za objavu - u formatima za instagram, tiktok i yt.",
    image: null as string | null,
  },
  {
    icon: BookOpenCheck,
    title: "Implementacija vodiča",
    desc: "Uz kreative dobijaš PDF vodič: Ti samo pratiš korake - i gledaš rezultat.",
    image: null as string | null,
  },
];

/** Screenshot iz reklamnog naloga koji stoji uz računicu. */
type Proof = { src: string; w: number; h: number; alt: string };

/**
 * Studije slučaja - `prihod` je stvarno izgenerisan iznos, a `ulozeno`
 * je za sada okvirna brojka koju treba zameniti stvarnim ulaganjem.
 */
const smallCases = [
  {
    client: "Infinity Laser Studio",
    logo: "/logos/ils-logo.png",
    /** Snimak kreative se dodaje kad bude spreman. */
    videoId: null as string | null,
    /** Prihod je iznos sa screenshota ispod računice. */
    prihod: 6304.85,
    ulozeno: 476,
    currency: "$",
    /** Kreativa desno, računica levo. */
    mediaRight: true,
    proofs: [
      {
        src: "/bento1/b8.webp",
        w: 980,
        h: 48,
        alt: "Kampanja „Anin Odmor“ sa 6.304,85 $ vrednosti kupovina",
      },
    ] as Proof[],
  },
  {
    client: "Ego Tike",
    logo: "/logos/egotike.webp",
    videoId: "iQEcAK09saQ" as string | null,
    prihod: 30908.41,
    ulozeno: 3171,
    currency: "$",
    mediaRight: false,
    proofs: [
      {
        src: "/bento1/b3.webp",
        w: 1076,
        h: 160,
        alt: "Kampanja „Zamena & Reklamacija“ sa 30.908,41 $ vrednosti kupovina",
      },
    ] as Proof[],
  },
];

const valueStack = [
  {
    title: "Strateški sastanak i analiza brenda",
    value: 180,
  },
  {
    title: "10 premium kreativa",
    value: 700,
  },
  {
    title: "Dizajn u stilu brenda",
    value: 150,
  },
  {
    title: "Strateški PDF vodič",
    value: 200,
  },
];

const stackTotal = valueStack.reduce((sum, v) => sum + v.value, 0);
const BONUS_VALUE = 90;

export default function CreativeEngineLanding() {
  const pkg = getPackage("creative-engine")!;

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
              Dobijaš 10 prodajnih kreativa prilagođenih tvom brendu i strateški
              vodič kako da ih iskoristiš za maksimalan profit.
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
              videoId="7gtOE3FhnEE"
              title="Creative Engine"
              caption="Creative Engine"
            />
          </div>
        </div>
      </section>

      {/* ───────────── PROCES / STORYTELLING ───────────── */}
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
                  <StepMedia
                    image={s.image}
                    alt={`${s.title} - Creative Engine`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Rezultat: case study video ── */}
          <div className="mt-12 flex flex-col items-center sm:mt-16">
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
            <SectionLabel>Rezultat</SectionLabel>
            <h3 className="mt-3 text-balance text-center text-xl font-extrabold sm:text-3xl">
              I onda se desi ovo
            </h3>

            <div className="mx-auto mt-8 w-full max-w-3xl">
              {REZULTAT_VIDEO_ID ? (
                <YouTubePlayer
                  videoId={REZULTAT_VIDEO_ID}
                  title="Rezultat - studija slučaja"
                  caption="Studija slučaja"
                />
              ) : (
                <div
                  aria-hidden
                  className="flex aspect-video items-center justify-center rounded-3xl border border-dashed"
                  style={{
                    borderColor: `${GOLD}40`,
                    background: `linear-gradient(160deg, ${GOLD}0f, transparent)`,
                  }}
                >
                  <Clapperboard
                    className="size-8 opacity-30"
                    style={{ color: GOLD }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── MALE STUDIJE SLUČAJA ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel>Brojke, ne obećanja</SectionLabel>
            <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl">
              Kreative koje su{" "}
              <span className="text-gradient">veoma profitabilne</span>
            </h2>
          </div>

          {/* Studije slučaja idu jedna ispod druge: kreativa + računica */}
          <div className="mx-auto mt-10 max-w-4xl space-y-8 sm:mt-12 sm:space-y-10">
            {smallCases.map((c, i) => (
              <motion.div
                key={c.client}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="rounded-3xl card-glass p-6 sm:p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="relative inline-flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-background/40 p-2">
                    <Image
                      src={c.logo}
                      alt={`${c.client} logo`}
                      width={48}
                      height={48}
                      sizes="48px"
                      className="size-full object-contain"
                    />
                  </span>
                  <h3 className="text-base font-bold sm:text-lg">{c.client}</h3>
                </div>

                {/* Naizmenično: Ego Tike kreativa levo, ILS kreativa desno */}
                <div
                  className={`mt-6 grid items-center gap-8 md:gap-10 ${
                    c.mediaRight
                      ? "md:grid-cols-[minmax(0,1fr)_220px]"
                      : "md:grid-cols-[220px_minmax(0,1fr)]"
                  }`}
                >
                  {/* Primer kreative */}
                  <div
                    className={`mx-auto w-full max-w-[220px] ${
                      c.mediaRight ? "md:order-2" : ""
                    }`}
                  >
                    {c.videoId ? (
                      <YouTubePlayer
                        videoId={c.videoId}
                        title={`${c.client} - primer kreative`}
                        caption="Primer kreative"
                        aspect="aspect-[9/16]"
                      />
                    ) : (
                      <div
                        className="flex aspect-[9/16] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed px-4 text-center"
                        style={{
                          borderColor: `${GOLD}40`,
                          background: `linear-gradient(160deg, ${GOLD}0f, transparent)`,
                        }}
                      >
                        <Clapperboard
                          className="size-8 opacity-30"
                          style={{ color: GOLD }}
                        />
                        <span className="text-xs text-muted-foreground">
                          Primer kreative uskoro
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Računica: prihod - uloženo = profit + dokazi iz naloga */}
                  <div
                    className={`space-y-6 ${c.mediaRight ? "md:order-1" : ""}`}
                  >
                    <ProfitPaper
                      prihod={c.prihod}
                      ulozeno={c.ulozeno}
                      currency={c.currency}
                    />
                    {c.proofs.length > 0 && <ProofShots proofs={c.proofs} />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── VALUE STACK ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
            <SectionLabel>Šta tačno dobijaš</SectionLabel>
            <h2 className="mt-3 text-balance text-2xl font-extrabold sm:text-4xl md:text-5xl">
              Vrednost od{" "}
              <span className="text-gradient">{formatPrice(stackTotal)}€</span>{" "}
              za {formatPrice(pkg.price)}€
            </h2>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border card-glass">
            <ul className="divide-y divide-border">
              {valueStack.map((v, i) => (
                <motion.li
                  key={v.title}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-60px" }}
                  className="flex items-start gap-4 p-5 sm:p-6"
                >
                  <span
                    className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full"
                    style={{ background: `${GOLD}22` }}
                  >
                    <Check className="size-4" style={{ color: GOLD }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold">{v.title}</h3>
                  </div>
                  <span className="shrink-0 pl-2 text-sm font-semibold text-muted-foreground line-through sm:text-base">
                    {formatPrice(v.value)}€
                  </span>
                </motion.li>
              ))}
            </ul>

            <div
              className="flex flex-col gap-1 border-t border-border p-5 text-center sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:text-left"
              style={{ background: `${GOLD}0f` }}
            >
              <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Ukupna vrednost
              </span>
              <span className="font-display text-2xl font-extrabold sm:text-3xl">
                <span className="text-muted-foreground line-through">
                  {formatPrice(stackTotal)}€
                </span>{" "}
                <span className="text-gradient">{formatPrice(pkg.price)}€</span>
              </span>
            </div>
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
                Dobijaš sve ovo + <span className="text-gradient">BONUS</span>{" "}
                dizajn vizit kartice
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
                Sastanak, 10 premium kreativa i strateški vodič - ukupno{" "}
                {formatPrice(stackTotal)}€ vrednosti za {formatPrice(pkg.price)}
                €. A vizit karticu dobijaš gratis.
              </p>

              {/* ── Bonus ── */}
              <div
                className="mx-auto mt-8 flex max-w-md items-start gap-4 rounded-2xl border p-5 text-left sm:mt-10"
                style={{
                  borderColor: `${GOLD}55`,
                  background: `linear-gradient(160deg, ${GOLD}1f, transparent)`,
                }}
              >
                <span
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${GOLD}22` }}
                >
                  <CreditCard className="size-5" style={{ color: GOLD }} />
                </span>
                <div className="min-w-0">
                  <p
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: GOLD }}
                  >
                    Bonus
                  </p>
                  <h3 className="mt-1 font-bold">Dizajn vizit kartice</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Vizit kartica u stilu tvog brenda - spremna za štampu.{" "}
                    <span className="text-muted-foreground/80 line-through">
                      {formatPrice(BONUS_VALUE)}€
                    </span>{" "}
                    <span className="font-semibold text-foreground">
                      gratis
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-8 sm:mt-10 sm:pt-10">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-extrabold sm:text-5xl">
                    {formatPrice(pkg.price)}€
                  </span>
                  {pkg.priceNote && (
                    <span className="text-muted-foreground">
                      / {pkg.priceNote}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Odgovoriš na 5 pitanja, javljamo se za 48h i dogovaramo
                  detalje - plaćaš tek kad prihvatiš ponudu.
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
            {pkg.priceNote && (
              <span className="text-sm text-muted-foreground">
                / {pkg.priceNote}
              </span>
            )}
          </div>

          <div className="flex w-full flex-col items-center gap-1.5 sm:w-auto sm:items-end">
            <CreativeQuizPopup>
              <button
                type="button"
                className={`${ctaCls} w-full px-8 py-3.5 sm:w-auto`}
              >
                Zakaži sastanak
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </button>
            </CreativeQuizPopup>
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] text-muted-foreground sm:text-xs">
              <span>5 kratkih pitanja</span>
              <span aria-hidden>·</span>
              <span>Javljamo se za 48h</span>
              <span aria-hidden>·</span>
              <span>Bez plaćanja na sajtu</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
