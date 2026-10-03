"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Bell,
  Calculator,
  Camera,
  Clapperboard,
  Compass,
  Globe,
  Megaphone,
  PenLine,
  PhoneCall,
  Scissors,
  Search,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import ProfitQuizPopup from "@/components/site/ProfitQuizPopup";
import { BrowserFrame } from "@/components/solar/mt-komex/CalculatorEmbed";

const GOLD = "#f0b656";
const ORANGE = "#d87928";
const MT = "#fbae17";
const LEAD_TYPE = "mt-komex-predlog";
const MTI = "/calculator/mt-komex";

const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { type: "spring" as const, stiffness: 140, damping: 22 },
};

const gradientText = {
  background: `linear-gradient(100deg, ${GOLD}, ${ORANGE})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;

const ctaCls =
  "group inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f0b656] to-[#d87928] px-7 py-3 text-base font-extrabold text-[#0a0a0a] shadow-lg shadow-[#f0b656]/20 transition-transform hover:-translate-y-0.5";

/* ───────────── Goranov put ───────────── */

const JOURNEY = [
  "Ne zna ništa",
  "Vidi oglas",
  "Zna brojku",
  "Ostavio broj",
  "Klijent",
];

function Journey({ at }: { at: number }) {
  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Goran sada: ${JOURNEY[at]}`}
    >
      {JOURNEY.map((j, i) => (
        <span
          key={j}
          className="h-1.5 flex-1 rounded-full transition-colors"
          style={{ background: i <= at ? GOLD : "rgba(236,232,212,0.12)" }}
        />
      ))}
    </div>
  );
}

function Chapter({
  n,
  when,
  at,
  title,
  accent,
  line,
  services,
  children,
  flip = false,
}: {
  n: string;
  when: string;
  at: number;
  title: string;
  accent: string;
  line: string;
  services: { icon: typeof Globe; t: string }[];
  children: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <motion.div {...reveal} className={flip ? "lg:order-2" : ""}>
          <p className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
            <span
              className="font-display text-2xl font-extrabold"
              style={{ color: GOLD }}
            >
              {n}
            </span>
            <span className="h-px w-8 bg-border" />
            {when}
          </p>
          <h2 className="mt-4 text-balance text-[32px] font-extrabold leading-[1.05] sm:text-5xl">
            {title} <span style={gradientText}>{accent}</span>
          </h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">
            {line}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {services.map((s) => (
              <span
                key={s.t}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.03] px-3.5 py-2 text-sm font-semibold"
              >
                <s.icon className="size-4" style={{ color: GOLD }} /> {s.t}
              </span>
            ))}
          </div>

          <div className="mt-8 max-w-xs">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Goran sada: <span className="text-foreground">{JOURNEY[at]}</span>
            </p>
            <Journey at={at} />
          </div>
        </motion.div>
        <motion.div {...reveal} className={flip ? "lg:order-1" : ""}>
          {children}
        </motion.div>
      </div>
    </section>
  );
}

function Photo({
  src,
  alt,
  className = "",
  sizes = "(min-width: 1024px) 600px, 100vw",
  label,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  label?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border ${className}`}
    >
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      {label && (
        <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          {label}
        </span>
      )}
    </div>
  );
}

function Phone({
  src,
  alt,
  children,
}: {
  src: string;
  alt: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[34px] border-[5px] border-[#1d2230] bg-black shadow-[0_30px_70px_-25px_rgba(0,0,0,0.9)]">
      <Image
        src={src}
        alt={alt}
        width={780}
        height={1560}
        className="h-auto w-full"
      />
      {children}
    </div>
  );
}

/* ───────────── Stranica ───────────── */

const TEAM = [
  { name: "Luka", role: "Web i kalkulator", img: "/people/luka.webp" },
  { name: "Mihajlo", role: "Video produkcija", img: "/people/mihac.webp" },
  { name: "Filip", role: "Meta reklame", img: "/people/filip.webp" },
  { name: "Nina", role: "Organizacija", img: "/people/nina.webp" },
  { name: "Stefan", role: "Snimanje", img: "/people/stefan.webp" },
  { name: "Kuzma", role: "Snimanje", img: "/people/kuzma.webp" },
];

const LOGOS = [
  { name: "Infinity Laser Studio", img: "/logos/ils-logo.webp" },
  { name: "Ego tike", img: "/logos/egotike.webp" },
  { name: "Novak Invest", img: "/logos/novak.webp" },
  { name: "Bulevar company", img: "/logos/bulevar.webp" },
  { name: "RS barbershop", img: "/logos/rsbarbershop.webp" },
  { name: "Powerade", img: "/logos/powerade.webp" },
  { name: "Nowa", img: "/logos/nowa.webp" },
];

export default function MtKomexPitch() {
  return (
    <div className="relative">
      {/* HERO: upoznajte Gorana */}
      <section className="relative isolate overflow-hidden pb-16 pt-24 sm:pt-28 md:pb-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[22rem] w-[130%] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px] sm:w-[80%]" />
        </div>
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 130, damping: 20 }}
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-foreground/[0.03] py-1.5 pl-2 pr-4 text-xs font-semibold text-muted-foreground">
              <span className="rounded-full bg-[#1f2330] px-2.5 py-1">
                <Image
                  src={`${MTI}/logo.svg`}
                  alt="MT-Komex"
                  width={52}
                  height={25}
                  className="h-[18px] w-auto"
                />
              </span>
              Predlog za MT-Komex · Skeylo
            </div>
            <h1 className="mt-6 text-[44px] font-extrabold leading-[1] sm:text-6xl lg:text-7xl">
              Upoznajte <span style={gradientText}>Gorana.</span>
            </h1>
            <p className="mt-6 max-w-lg text-xl leading-snug text-muted-foreground sm:text-2xl">
              Vaš sledeći klijent. Samo on to još ne zna.
            </p>
            <a href="#prica" className={`${ctaCls} mt-9`}>
              Pratite Goranov put
              <ArrowDown className="size-5 transition-transform group-hover:translate-y-0.5" />
            </a>
          </motion.div>

          {/* Goranov profil */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -1.5 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            transition={{
              type: "spring",
              stiffness: 110,
              damping: 18,
              delay: 0.15,
            }}
            className="mx-auto w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center gap-4">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f0b656] to-[#d87928] font-display text-3xl font-extrabold text-[#0a0a0a]">
                G
              </span>
              <div>
                <p className="font-display text-2xl font-extrabold">Goran</p>
                <p className="text-sm text-muted-foreground">
                  Vlasnik firme · 40 zaposlenih
                </p>
              </div>
            </div>
            <dl className="mt-6 divide-y divide-border text-[15px]">
              {[
                ["Račun za struju", "2.000 € / mes."],
                ["Krov hale", "1.500 m², prazan"],
                ["Vreme za istraživanje", "nula"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-bold">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 rounded-2xl bg-foreground/[0.04] p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Zna o solarnim panelima
                </span>
                <span className="font-extrabold" style={{ color: GOLD }}>
                  0%
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-foreground/10" />
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Goran je izmišljen. Njegov račun za struju nije.
            </p>
          </motion.div>
        </div>
      </section>

      <div id="prica" className="scroll-mt-16" />

      {/* 01 — ne traži */}
      <Chapter
        n="01"
        when="Danas"
        at={0}
        title="Goran ne traži solarne panele."
        accent="Zato ga mi nalazimo."
        line="Ne zna šta je kupac-proizvođač. Misli da je solar za velike. Neće guglati."
        services={[
          { icon: Search, t: "Istraživanje kupca" },
          { icon: Compass, t: "Strategija" },
          { icon: PenLine, t: "Scenariji" },
        ]}
      >
        <div className="grid grid-cols-5 gap-3">
          <Photo
            src="/podcast/korak1.webp"
            alt="Planiranje strategije i scenarija"
            className="col-span-3 aspect-[4/5]"
            sizes="(min-width: 1024px) 360px, 60vw"
            label="Strategija"
          />
          <div className="col-span-2 grid gap-3">
            <Photo
              src="/analiza.webp"
              alt="Tim analizira kampanju"
              className="aspect-square"
              sizes="240px"
            />
            <Photo
              src="/people/mihac/7.webp"
              alt="Pisanje scenarija"
              className="aspect-square"
              sizes="240px"
            />
          </div>
        </div>
      </Chapter>

      {/* 02 — oglas */}
      <div className="border-y border-border bg-card/40">
        <Chapter
          n="02"
          when="Ponedeljak, 21:40"
          at={1}
          flip
          title="Skroluje Instagram."
          accent="Oglas ga zaustavi za 3 sekunde."
          line="Video sa krova hale, vaš inženjer, jedna brojka koja ga se tiče."
          services={[
            { icon: Camera, t: "Snimanje na gradilištu" },
            { icon: Clapperboard, t: "Vertikalne reklame" },
            { icon: Scissors, t: "Montaža" },
          ]}
        >
          <div className="grid grid-cols-[0.9fr_1.1fr] items-center gap-3">
            <Phone src={`${MTI}/calc-mobile.jpg`} alt="Reklama na Instagramu">
              <div className="absolute inset-0">
                <Image
                  src={`${MTI}/krov-hala-montaza.jpg`}
                  alt=""
                  fill
                  sizes="240px"
                  className="object-cover object-[75%_center]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/85" />
                <p className="absolute inset-x-2 top-[34%] text-balance rounded-xl bg-black/70 px-2 py-2.5 text-center font-display text-[15px] font-extrabold leading-tight text-white backdrop-blur-sm sm:text-xl">
                  Račun za struju veći od{" "}
                  <span style={{ color: MT }}>1.000 €</span>?
                </p>
                <div
                  className="absolute inset-x-3 bottom-4 rounded-lg py-2 text-center text-xs font-bold text-[#141414]"
                  style={{ background: MT }}
                >
                  Izračunaj uštedu
                </div>
              </div>
            </Phone>
            <div className="grid gap-3">
              <Photo
                src="/people/mihac/3.webp"
                alt="Snimanje gimbalom na terenu"
                className="aspect-[4/3]"
                sizes="300px"
                label="Teren"
              />
              <Photo
                src="/podcast/korak3.webp"
                alt="Snimanje pred kamerom"
                className="aspect-[4/3]"
                sizes="300px"
                label="Kamera"
              />
              <Photo
                src="/podcast/korak4.webp"
                alt="Montaža videa"
                className="aspect-[4/3]"
                sizes="300px"
                label="Montaža"
              />
            </div>
          </div>
        </Chapter>
      </div>

      {/* 03 — kalkulator */}
      <Chapter
        n="03"
        when="21:41"
        at={2}
        title="Klikne."
        accent="Prvi put vidi koliko štedi."
        line="Šest pitanja, 60 sekundi. Na ekranu: paneli na krovu, novi račun, povrat."
        services={[
          { icon: Globe, t: "Landing stranica" },
          { icon: Calculator, t: "Kalkulator uštede" },
          { icon: Smartphone, t: "Pravljeno za telefon" },
        ]}
      >
        <div className="relative pb-8 pr-10 sm:pr-20">
          <BrowserFrame url="mt-komex.co.rs/kalkulator">
            <Image
              src={`${MTI}/calc-desktop.jpg`}
              alt="Kalkulator uštede"
              width={1920}
              height={1200}
              className="h-auto w-full"
            />
          </BrowserFrame>
          <div className="absolute -bottom-2 right-0 w-[34%]">
            <Phone
              src={`${MTI}/calc-mobile.jpg`}
              alt="Kalkulator uštede na telefonu"
            />
          </div>
        </div>
      </Chapter>

      {/* 04 — upit */}
      <div className="border-y border-border bg-card/40">
        <Chapter
          n="04"
          when="21:43"
          at={3}
          flip
          title="Ostavlja broj."
          accent="Vaš inženjer zove kupca koji je već ubeđen."
          line="Upit stiže sa računom, krovom i procenom. Poziv za 24 sata."
          services={[
            { icon: Bell, t: "Upit odmah na telefon" },
            { icon: PhoneCall, t: "Poziv za 24h" },
          ]}
        >
          <div className="relative">
            <Photo
              src={`${MTI}/krov-hala-montaza.jpg`}
              alt="Inženjer MT-Komexa na krovu"
              className="aspect-[4/3]"
              sizes="(min-width: 1024px) 600px, 100vw"
            />
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.3,
              }}
              className="absolute inset-x-4 top-4 rounded-2xl border border-white/10 bg-[#111318]/95 p-4 shadow-2xl backdrop-blur sm:inset-x-8"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex size-10 items-center justify-center rounded-xl"
                  style={{ background: `${MT}26` }}
                >
                  <Zap className="size-5" style={{ color: MT }} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">
                    Novi upit · Goran P.
                  </p>
                  <p className="text-xs text-[#9aa4b4]">upravo sada</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  ["Račun", "2.000 €"],
                  ["Krov", "1.500 m²"],
                  ["Procena", "~120 kW"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-white/[0.06] px-2 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-[#9aa4b4]">
                      {k}
                    </p>
                    <p className="text-sm font-bold text-white">{v}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </Chapter>
      </div>

      {/* 05 — skaliranje */}
      <Chapter
        n="05"
        when="Ista nedelja"
        at={3}
        title="Goran nije jedini."
        accent="Tražimo sledećih sto."
        line="Gasimo oglase koji ne rade, pojačavamo one koji donose upite."
        services={[
          { icon: Megaphone, t: "Meta reklame" },
          { icon: Target, t: "Testiranje kreativa" },
          { icon: BarChart3, t: "Izveštaj svake nedelje" },
        ]}
      >
        <div className="grid grid-cols-2 gap-3">
          <Photo
            src="/meta.webp"
            alt="Media buyer vodi Meta kampanje"
            className="col-span-2 aspect-[16/9]"
            sizes="(min-width: 1024px) 600px, 100vw"
            label="Media buying"
          />
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-white">
            <Image
              src="/bento1/b5.webp"
              alt="ROAS iz Meta kampanje"
              fill
              sizes="300px"
              className="object-cover object-left-top"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-white">
            <Image
              src="/bento1/b4.webp"
              alt="Cena po rezultatu iz Meta kampanje"
              fill
              sizes="300px"
              className="object-cover object-left-top"
            />
          </div>
        </div>
      </Chapter>

      {/* 06 — kraj priče */}
      <section className="relative isolate overflow-hidden py-20 sm:py-28">
        <Image
          src={`${MTI}/polje-zalazak.jpg`}
          alt=""
          fill
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[#070707]/80" />
        <div className="container-x">
          <motion.div {...reveal} className="max-w-3xl">
            <p className="flex items-center gap-3 text-sm font-semibold text-white/70">
              <span
                className="font-display text-2xl font-extrabold"
                style={{ color: GOLD }}
              >
                06
              </span>
              <span className="h-px w-8 bg-white/30" />
              Šest meseci kasnije
            </p>
            <h2 className="mt-4 text-balance text-[34px] font-extrabold leading-[1.05] text-white sm:text-6xl">
              Goranov krov plaća račun.{" "}
              <span style={gradientText}>
                Vi ste izgradili još jednu elektranu.
              </span>
            </h2>
            <div className="mt-8 max-w-xs">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/60">
                Goran sada: <span className="text-white">Klijent</span>
              </p>
              <Journey at={4} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 07 — priča postaje reklama */}
      <Chapter
        n="07"
        when="I onda"
        at={4}
        flip
        title="Goranova priča"
        accent="postaje vaša sledeća reklama."
        line="Snimamo ga ispred njegove elektrane. Najjači dokaz za sledećeg Gorana."
        services={[
          { icon: Clapperboard, t: "Video studija slučaja" },
          { icon: Sparkles, t: "Lice firme" },
        ]}
      >
        <div className="grid grid-cols-2 gap-3">
          <Photo
            src="/podcast/korak2.webp"
            alt="Studio za snimanje intervjua"
            className="aspect-[4/5]"
            sizes="300px"
            label="Intervju"
          />
          <div className="grid gap-3">
            <Photo
              src="/podcast/case-study-instagram-2.webp"
              alt="Studija slučaja na Instagramu"
              className="aspect-square"
              sizes="300px"
            />
            <Photo
              src="/people/mihac/4.webp"
              alt="Postavljanje svetla za snimanje"
              className="aspect-[4/3]"
              sizes="300px"
            />
          </div>
        </div>
      </Chapter>

      {/* TIM */}
      <section className="border-t border-border bg-card/40 py-16 sm:py-24">
        <div className="container-x">
          <motion.div
            {...reveal}
            className="grid items-end gap-8 lg:grid-cols-2"
          >
            <h2 className="text-balance text-[32px] font-extrabold leading-[1.05] sm:text-5xl">
              Jedan tim. <span style={gradientText}>Ceo Goranov put.</span>
            </h2>
            <p className="text-lg text-muted-foreground lg:text-right">
              Strategija, video, sajt i reklame. Jedan kontakt.
            </p>
          </motion.div>
          <motion.div
            {...reveal}
            className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl border border-border sm:aspect-[21/9]"
          >
            <Image
              src="/skeylo_team.webp"
              alt="Skeylo tim"
              fill
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="object-cover"
            />
          </motion.div>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {TEAM.map((p) => (
              <motion.div key={p.name} {...reveal} className="text-center">
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-border">
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    sizes="200px"
                    className="object-cover object-top"
                  />
                </div>
                <p className="mt-2 text-sm font-bold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DOKAZ */}
      <section className="py-16 sm:py-24">
        <div className="container-x">
          <motion.div
            {...reveal}
            className="grid items-center gap-8 rounded-3xl border border-border bg-card p-6 sm:p-10 lg:grid-cols-[auto_1fr]"
          >
            <div
              className="relative mx-auto size-32 overflow-hidden rounded-full border-2 sm:size-40"
              style={{ borderColor: GOLD }}
            >
              <Image
                src="/ana.webp"
                alt="Ana Kasap"
                fill
                sizes="160px"
                className="object-cover object-top"
              />
            </div>
            <div className="text-center lg:text-left">
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Isti sistem, druga branša
              </p>
              <p
                className="mt-3 font-display text-4xl font-extrabold sm:text-6xl"
                style={gradientText}
              >
                1.600.000 RSD
              </p>
              <p className="mt-1 text-lg font-semibold">
                prihoda u jednom mesecu
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Ana Kasap · vlasnica, Infinity Laser Studio
              </p>
            </div>
          </motion.div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-90">
            {LOGOS.map((l) => (
              <Image
                key={l.name}
                src={l.img}
                alt={l.name}
                width={120}
                height={48}
                className="h-8 w-auto rounded object-contain sm:h-10"
              />
            ))}
          </div>
        </div>
      </section>

      {/* FINALNI CTA */}
      <section className="pb-16 pt-4 sm:pb-24">
        <div className="container-x">
          <motion.div
            {...reveal}
            className="relative isolate overflow-hidden rounded-3xl border border-border px-6 py-16 text-center sm:px-12 sm:py-24"
          >
            <Image
              src="/podcast/korak1.webp"
              alt=""
              fill
              sizes="100vw"
              className="-z-10 object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-[#070707]/85" />
            <TrendingUp className="mx-auto size-10" style={{ color: GOLD }} />
            <h2 className="mx-auto mt-5 max-w-3xl text-balance text-[34px] font-extrabold leading-[1.05] sm:text-6xl">
              Sledeći Goran <span style={gradientText}>već skroluje.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg text-muted-foreground">
              Pola sata razgovora. Bez obaveze.
            </p>
            <ProfitQuizPopup leadType={LEAD_TYPE}>
              <button type="button" className={`${ctaCls} mt-9`}>
                Zakažite razgovor
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </button>
            </ProfitQuizPopup>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
