"use client";

import Image from "next/image";
import Link from "next/link";
import { MotionConfig, motion } from "framer-motion";
import { ArrowRight, MousePointerClick, Star } from "lucide-react";

import Vsl from "./Vsl";
import OsMock from "./OsMock";
import GalleryStack from "./GalleryStack";
import ServicesReel from "./ServicesReel";
import CustomerPath from "./CustomerPath";
import { Counter, ProofRow, rowA, rowB } from "@/components/site/BentoGrid";
import { logos, testimonials } from "@/components/site/SocialProof";

/*
 * Početna (od 22.11.2026): VSL landing na jednoj strani.
 * Hero sa videom → šta radimo (animirane usluge) → put jednog kupca (oglas →
 * sajt → porudžbina → sistem) → operativni sistem (interaktivan) → rezultati i
 * preporuke → kako radimo (špil fotografija) → zakaži sastanak.
 * Svaki CTA vodi na /sastanak: zakazan termin postaje event u OS-u i odmah
 * stiže timu kao 🗓️ poruka u Telegram grupu (vidi src/app/sastanak/page.tsx).
 * Stari landing sa uslugama, studijama, timom i paketima je na /starilanding.
 */

const BOOK_HREF = "/sastanak";
const VSL = {
  id: "B9IGZpiJ5M8",
  title: "Interni marketing tim",
  length: "5:39",
};
const TEAM = ["/people/luka.webp", "/people/mihac.webp", "/people/filip.webp"];

const ease = [0.22, 1, 0.36, 1] as const;

/** Ulazak sekcije pri skrolu, jednom. */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ delay, duration: 0.6, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function BookButton({
  className = "",
  size = "lg",
}: {
  className?: string;
  size?: "sm" | "lg";
}) {
  return (
    <Link
      href={BOOK_HREF}
      className={`group inline-flex items-center justify-center gap-2 bg-primary font-extrabold text-primary-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
        size === "lg"
          ? "rounded-xl px-8 py-4 text-base shadow-[0_18px_50px_-16px_rgba(216,121,40,0.85)] sm:text-lg"
          : "rounded-lg px-3.5 py-2 text-sm"
      } ${className}`}
    >
      Zakaži sastanak
      <ArrowRight
        className={`transition-transform group-hover:translate-x-1 ${
          size === "lg" ? "size-5" : "size-4"
        }`}
      />
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-widest text-primary">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ header */

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/70 backdrop-blur-md">
      <div className="pt-[env(safe-area-inset-top)]" />
      <div className="container-x flex h-14 items-center justify-between gap-4 sm:h-16">
        <Link
          href="/"
          aria-label="Skeylo - Početna"
          className="flex shrink-0 items-center rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Image
            src="/brand/logo.webp"
            alt="Skeylo"
            width={48}
            height={48}
            priority
            className="h-10 w-10 object-contain sm:h-12 sm:w-12"
          />
        </Link>
        <BookButton size="sm" />
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------- hero */

function Hero() {
  const up = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.6, ease },
  });

  return (
    <section className="relative isolate overflow-hidden pt-24 pb-14 sm:pt-32 md:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="hero-grid absolute inset-0" />
        <div className="hero-radial absolute inset-0" />
        <div className="hero-glow absolute left-1/2 top-0 h-[20rem] w-[130%] -translate-x-1/2 rounded-full bg-primary/20 blur-[90px] sm:h-[24rem] sm:w-[80%] md:h-[28rem]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background sm:h-48" />
      </div>

      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            {...up(0.05)}
            className="text-balance text-[2.4rem] font-extrabold leading-[1.04] sm:text-6xl lg:text-7xl"
          >
            Tvoj interni marketing tim.{" "}
            <span className="text-gradient">Bez zapošljavanja.</span>
          </motion.h1>
          <motion.p
            {...up(0.15)}
            className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg"
          >
            Kreative, plaćene kampanje i sajt radi jedan tim koji tvoj posao
            poznaje iznutra. Uz to dobijaš{" "}
            <b className="font-semibold text-foreground">operativni sistem</b> u
            kome vidiš celu firmu i upravljaš njome.
          </motion.p>
        </div>

        <motion.div {...up(0.25)} className="mx-auto mt-8 max-w-4xl sm:mt-12">
          <Vsl id={VSL.id} title={VSL.title} length={VSL.length} />
        </motion.div>

        <motion.div
          {...up(0.35)}
          className="mt-7 flex flex-col items-center gap-3 sm:mt-10"
        >
          <BookButton className="w-full sm:w-auto" />
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">
            Besplatno · 30 minuta · bez obaveza
          </span>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- rezultati */

function Stat({
  pre,
  value,
  unit,
  label,
  delay,
}: {
  pre?: string;
  value: React.ReactNode;
  unit?: string;
  label: string;
  delay: number;
}) {
  // Veličina broja ide po širini kartice (cqi), pa 4.000.000+ RSD stane
  // i na telefonu i u dve kolone.
  return (
    <Reveal
      delay={delay}
      className="@container relative overflow-hidden rounded-2xl card-glass px-5 py-6 text-center sm:px-8 sm:py-9"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-32 w-48 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
      />
      <p className="relative whitespace-nowrap font-display text-[clamp(2.1rem,12.5cqi,4.25rem)] font-extrabold leading-none tracking-tight tabular-nums">
        {pre ? (
          <span className="me-[0.3em] align-middle text-[0.34em] font-bold tracking-normal text-muted-foreground">
            {pre}
          </span>
        ) : null}
        <span className="text-gradient">{value}</span>
        {unit ? (
          <span className="ms-[0.22em] text-[0.34em] font-bold tracking-normal text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </p>
      <p className="relative mt-3 text-sm text-muted-foreground sm:text-base">
        {label}
      </p>
    </Reveal>
  );
}

function Results() {
  return (
    <section
      id="rezultati"
      className="relative scroll-mt-16 border-t border-border py-16 md:py-24"
    >
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Rezultati</Eyebrow>
          <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-5xl">
            Ne obećavamo. <span className="text-gradient">Pokazujemo.</span>
          </h2>
        </Reveal>

        <div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4">
          <Stat
            delay={0}
            value={
              <Counter
                to={4000000}
                format={(v) => `${Math.round(v).toLocaleString("de-DE")}+`}
              />
            }
            unit="RSD"
            label="generisano za jednog klijenta u 1 mesecu"
          />
          <Stat
            delay={0.08}
            pre="skoro"
            value={
              <Counter
                to={200000}
                format={(v) => `${Math.round(v).toLocaleString("de-DE")} €`}
              />
            }
            label="generisano Skeylo kreativama"
          />
        </div>
      </div>

      {/* Zid dokaza: pravi screenshotovi iz kampanja i poruka klijenata */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-10 flex flex-col gap-3 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] sm:mt-14 sm:gap-4"
      >
        <div className="flex h-[126px] items-center overflow-hidden sm:h-[148px]">
          <ProofRow shots={rowA} anim="animate-[marquee_86s_linear_infinite]" />
        </div>
        <div className="flex h-[126px] items-center overflow-hidden sm:h-[148px]">
          <ProofRow
            shots={rowB}
            anim="animate-[marquee_88s_linear_infinite_reverse]"
          />
        </div>
      </motion.div>

      <div className="container-x">
        <p className="mt-12 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground sm:mt-16">
          Brendovi koji nam veruju
        </p>
        <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] sm:mt-8">
          <div className="flex w-max animate-[marquee_18s_linear_infinite] items-center gap-6 whitespace-nowrap pr-6 motion-reduce:animate-none sm:gap-12 sm:pr-12">
            {[...logos, ...logos].map((l, i) =>
              l.img ? (
                <span
                  key={`${l.name}-${i}`}
                  aria-hidden={i >= logos.length}
                  className="relative h-6 w-24 shrink-0 opacity-70 sm:h-8 sm:w-32"
                >
                  <Image
                    src={l.img}
                    alt={i >= logos.length ? "" : l.name}
                    fill
                    sizes="128px"
                    className="object-contain"
                  />
                </span>
              ) : (
                <span
                  key={`${l.name}-${i}`}
                  aria-hidden={i >= logos.length}
                  className="font-display text-lg font-bold tracking-tight text-foreground/35 sm:text-2xl"
                >
                  {l.name}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-3 sm:mt-14 sm:gap-4 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08} className="h-full">
              <figure className="flex h-full flex-col rounded-2xl card-glass p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {t.result}
                  </span>
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className="size-3.5 fill-primary text-primary"
                      />
                    ))}
                  </span>
                </div>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
                  „{t.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  {t.img ? (
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-primary/15">
                      <Image
                        src={t.img}
                        alt={t.name}
                        fill
                        sizes="40px"
                        className={`object-cover ${t.imgPosition ?? "object-center"}`}
                      />
                    </span>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- šta radimo */

function Services() {
  return (
    <section
      id="usluge"
      className="relative scroll-mt-16 border-t border-border py-16 md:py-24"
    >
      <div className="container-x">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow>Šta radimo</Eyebrow>
          <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-5xl">
            Od strategije <span className="text-gradient">do sajta.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
            Strategija, skripte, snimanje, montaža, Meta i Google oglasi i
            kompletan sajt. Sve radi jedan tim.
          </p>
        </Reveal>
        <Reveal className="mx-auto mt-8 max-w-6xl sm:mt-12">
          <ServicesReel />
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- put jednog kupca */

function Journey() {
  return (
    <section
      id="put-kupca"
      className="relative scroll-mt-16 overflow-x-clip border-t border-border py-16 md:py-24"
    >
      <div className="container-x">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow>Put jednog kupca</Eyebrow>
          <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-5xl">
            Od oglasa <span className="text-gradient">do tvog sistema.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
            Kupac vidi oglas, klikne i poruči. Porudžbina istog trenutka stiže u
            tvoj operativni sistem, sa oglasom iz kog je došla.
          </p>
        </Reveal>
        <Reveal className="mx-auto mt-8 max-w-5xl sm:mt-12">
          <CustomerPath />
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- operativni sistem */

const STEPS = [
  {
    title: "Upoznajemo tvoju firmu",
    text: "Pričamo sa tobom i timom: šta vam treba, ko šta radi i gde posao zapinje.",
  },
  {
    title: "Mapiramo realan sistem",
    text: "Upiti, ponude, zadaci, fakture, novac. Zapisujemo kako zaista radite, ne kako bi trebalo.",
  },
  {
    title: "Pravimo virtuelni interfejs",
    text: "Ceo sistem dobija svoj ekran. Vidiš sve odjednom i upravljaš preduzećem iz jednog mesta.",
  },
];

function OperatingSystem() {
  return (
    <section
      id="sistem"
      className="relative scroll-mt-16 overflow-hidden border-t border-border py-16 md:py-24"
    >
      <div className="container-x">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow>Uz marketing dobijaš</Eyebrow>
          <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-5xl">
            Operativni sistem{" "}
            <span className="text-gradient">tvoje firme.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
            ERP po meri tvog preduzeća. Upoznamo potrebe tvoje firme i kako
            posao stvarno teče, pa taj realan sistem pretvorimo u virtuelni
            interfejs. Sve vidiš na jednom mestu i jednostavno upravljaš firmom.
          </p>
        </Reveal>

        <Reveal className="mx-auto mt-8 max-w-5xl sm:mt-12">
          <p className="mb-4 flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground sm:text-sm">
            <MousePointerClick className="size-4 text-primary" />
            Primer sistema · klikni i probaj
          </p>
          <OsMock />
        </Reveal>

        <ol className="mx-auto mt-10 grid max-w-5xl gap-3 sm:mt-14 sm:gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ delay: i * 0.08, duration: 0.6, ease }}
              className="relative flex gap-4 rounded-2xl card-glass p-5 md:flex-col md:gap-0 md:p-6"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-primary font-display text-sm font-extrabold text-primary-foreground">
                {i + 1}
              </span>
              <div className="md:mt-5">
                <h3 className="text-lg font-bold leading-snug sm:text-xl">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  {s.text}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- kako radimo */

const SERVICES = [
  "Strategija",
  "Video produkcija",
  "Web sajt",
  "Meta & Google Ads",
  "Funnel + CRM",
  "Dizajn",
  "Društvene mreže",
];

function HowWeWork() {
  return (
    <section
      id="kako-radimo"
      className="relative scroll-mt-16 overflow-x-clip border-t border-border py-16 md:py-24"
    >
      <div className="container-x grid items-center gap-12 md:grid-cols-2 lg:gap-20">
        <Reveal className="text-center md:text-left">
          <Eyebrow>Kako radimo</Eyebrow>
          <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-5xl">
            Sve radimo mi.{" "}
            <span className="text-gradient sm:block">Od ideje do objave.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg md:mx-0">
            Strategiju, snimanje, montažu, sajt i kampanje radi isti tim. U
            studiju, na terenu i kod tebe u firmi.
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
            {SERVICES.map((s) => (
              <li
                key={s}
                className="rounded-full border border-border bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-foreground/85 sm:text-sm"
              >
                {s}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <GalleryStack />
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- finalni CTA */

function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden border-t border-border py-20 md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 100%, rgba(216,121,40,0.22), rgba(216,121,40,0.05) 50%, transparent 75%)",
        }}
      />
      <div className="container-x">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="flex -space-x-3">
            {TEAM.map((src) => (
              <span
                key={src}
                className="relative size-11 overflow-hidden rounded-full border-2 border-background sm:size-12"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </span>
            ))}
          </div>
          <h2 className="mt-6 text-balance text-3xl font-extrabold sm:text-5xl">
            Hajde da upoznamo{" "}
            <span className="text-gradient">tvoju firmu.</span>
          </h2>
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Izaberi termin koji ti odgovara. Pričamo o tvom marketingu i o tome
            kako bi izgledao tvoj operativni sistem.
          </p>
          <BookButton className="mt-8 w-full sm:w-auto" />
          <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
            Telefonom, WhatsApp-om, Viberom, preko Google Meet-a ili uživo
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export default function HomeLanding() {
  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <main>
        <Hero />
        <Services />
        <Journey />
        <OperatingSystem />
        <Results />
        <HowWeWork />
        <FinalCta />
      </main>
    </MotionConfig>
  );
}
