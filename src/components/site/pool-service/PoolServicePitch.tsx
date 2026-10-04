"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  CalendarCheck,
  FileSignature,
  PhoneCall,
  Play,
  Search,
  TrendingUp,
  Waves,
} from "lucide-react";
import {
  BrowserFrame,
  CalculatorOverlay,
} from "@/components/solar/mt-komex/CalculatorEmbed";

const AQUA = "#4fd8eb";
const BLUE = "#2aa8ff";
const WHATSAPP = `https://wa.me/381631012474?text=${encodeURIComponent(
  "Zdravo Luka, pogledao sam predlog za Pool Service. Hajde da razgovaramo.",
)}`;
const IMG = "/calculator/pool-service";
const CALC = "/calculator/bazen";

const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { type: "spring" as const, stiffness: 140, damping: 22 },
};

const gradientText = {
  background: `linear-gradient(100deg, #9af0ff, ${AQUA} 45%, ${BLUE})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;

const ctaCls =
  "group inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7ae7ff] to-[#2aa8ff] px-7 py-3 text-base font-extrabold text-[#04161c] shadow-lg shadow-[#4fd8eb]/20 transition-transform hover:-translate-y-0.5";

const cardCls =
  "rounded-2xl border border-white/10 bg-[#0f1319]/95 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.9)] backdrop-blur";

/* ───────────── Nikolin put ───────────── */

const STAGES = [
  { label: "Ne zna cenu", href: "#poglavlje-1" },
  { label: "Vidi oglas", href: "#poglavlje-2" },
  { label: "Zna brojku", href: "#poglavlje-3" },
  { label: "Ostavio broj", href: "#poglavlje-4" },
  { label: "Vaš klijent", href: "#poglavlje-5" },
];

/** Traka ispod headera: gde je Nikola trenutno u priči. */
function StoryBar({ stage, chapter }: { stage: number; chapter: string }) {
  return (
    <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-40 border-y border-border bg-background/85 backdrop-blur-md sm:top-[calc(4rem+env(safe-area-inset-top))]">
      <div className="container-x flex items-center gap-4 py-2.5">
        <span className="relative size-9 shrink-0 overflow-hidden rounded-full border border-white/10">
          <Image
            src={`${IMG}/nikola-avatar.webp`}
            alt=""
            fill
            sizes="36px"
            className="object-cover"
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-sm">
              <span className="text-muted-foreground">Nikola sada: </span>
              <span className="font-bold">{STAGES[stage].label}</span>
            </p>
            <span
              className="shrink-0 font-display text-xs font-bold tabular-nums"
              style={{ color: AQUA }}
            >
              {chapter} / 08
            </span>
          </div>
          <div className="mt-1.5 flex gap-1">
            {STAGES.map((s, i) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="h-1.5 flex-1 rounded-full transition-colors duration-500"
                style={{
                  background: i <= stage ? AQUA : "rgba(236,232,212,0.12)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type Proof = {
  src: string;
  t: string;
  /** Snimak ekrana: prikaži ceo, na beloj podlozi. */
  contain?: boolean;
  pos?: string;
};

/** Tri prave fotografije iz našeg rada, uvek istog formata. */
function ProofStrip({ items }: { items: Proof[] }) {
  return (
    <div className="mt-8">
      <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Kako to radimo
        <span className="h-px flex-1 bg-border" />
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2.5 sm:gap-3">
        {items.map((p) => (
          <figure key={p.t} className="min-w-0">
            <div
              className={`relative aspect-[4/5] overflow-hidden rounded-xl border border-border ${p.contain ? "bg-white" : ""}`}
            >
              <Image
                src={p.src}
                alt={p.t}
                fill
                sizes="(min-width: 1024px) 220px, 33vw"
                className={p.contain ? "object-contain p-2" : "object-cover"}
                style={p.pos ? { objectPosition: p.pos } : undefined}
              />
            </div>
            <figcaption className="mt-2 text-[13px] font-semibold leading-snug">
              {p.t}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

/** Velika ilustracija scene iz priče. */
function Scene({
  src,
  alt,
  pos,
  zoom,
}: {
  src: string;
  alt: string;
  pos?: string;
  zoom?: boolean;
}) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 680px, 100vw"
        className={`object-cover ${zoom ? "scale-[1.18]" : ""}`}
        style={pos ? { objectPosition: pos } : undefined}
      />
    </div>
  );
}

function Chapter({
  n,
  stage,
  when,
  title,
  accent,
  line,
  aside,
  scene,
  artifact,
  proof,
}: {
  n: number;
  stage: number;
  when: string;
  title: string;
  accent: string;
  line: string;
  aside?: React.ReactNode;
  scene: React.ReactNode;
  artifact?: React.ReactNode;
  proof?: Proof[];
}) {
  const num = String(n).padStart(2, "0");
  return (
    <section
      id={`poglavlje-${n}`}
      data-stage={stage}
      data-chapter={num}
      className="scroll-mt-32 border-b border-border py-16 sm:py-24"
    >
      <div className="container-x grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <motion.div
          {...reveal}
          className="min-w-0 lg:sticky lg:top-44 lg:self-start"
        >
          <p className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
            <span
              className="font-display text-2xl font-extrabold"
              style={{ color: AQUA }}
            >
              {num}
            </span>
            <span className="h-px w-8 bg-border" />
            {when}
          </p>
          <h2 className="mt-4 text-balance text-[32px] font-extrabold leading-[1.05] sm:text-5xl">
            {title} <span style={gradientText}>{accent}</span>
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
            {line}
          </p>
          {aside}
        </motion.div>

        <motion.div {...reveal} className="min-w-0">
          {scene}
          {artifact && (
            <div className="relative z-10 -mt-12 px-3 sm:-mt-20 sm:px-10">
              {artifact}
            </div>
          )}
          {proof && <ProofStrip items={proof} />}
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────── Kartice iz priče ───────────── */

/** Ono što Nikola dobije kad sam traži cenu: "zavisi". */
function SearchCard() {
  const results = [
    {
      site: "forum.rs › kuca-i-basta",
      t: "Koliko je koštao vaš bazen? (strana 14)",
      d: "„Zavisi od mnogo stvari, javi se majstoru…”",
    },
    {
      site: "oglasi.rs › bazeni",
      t: "Izgradnja bazena po povoljnim cenama",
      d: "Cena na upit. Pozovite za besplatnu procenu.",
    },
  ];
  return (
    <div className={`${cardCls} p-4 sm:p-5`}>
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5">
        <Search className="size-4 shrink-0 text-[#9aa4b4]" />
        <span className="truncate text-sm font-semibold text-white">
          Koliko košta bazen u Novom Sadu
        </span>
      </div>
      <ul className="mt-4 space-y-3">
        {results.map((r) => (
          <li key={r.t}>
            <p className="truncate text-xs text-[#9aa4b4]">{r.site}</p>
            <p className="mt-0.5 text-[15px] font-bold leading-snug text-[#8ab4f8]">
              {r.t}
            </p>
            <p className="mt-0.5 text-sm text-[#9aa4b4]">{r.d}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Oglas koji Nikola vidi u feedu. */
function AdCard() {
  return (
    <div className={`${cardCls} flex gap-4 p-3 sm:p-4`}>
      <div className="relative aspect-[9/16] w-24 shrink-0 overflow-hidden rounded-xl sm:w-28">
        <Image
          src={`${IMG}/oglas-bazen.webp`}
          alt="Vertikalni video oglas"
          fill
          sizes="112px"
          className="object-cover object-bottom"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-9 items-center justify-center rounded-full bg-black/55 backdrop-blur">
            <Play className="size-4 fill-white text-white" />
          </span>
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="flex items-center gap-2 text-xs text-[#9aa4b4]">
          <span
            className="flex size-5 items-center justify-center rounded-full"
            style={{ background: AQUA }}
          >
            <Waves className="size-3 text-[#04161c]" />
          </span>
          Pool Service · Sponzorisano
        </p>
        <p className="mt-2 text-balance font-display text-lg font-extrabold leading-tight text-white sm:text-xl">
          Koliko će vas <span style={{ color: AQUA }}>koštati bazen</span>?
        </p>
        <p className="mt-1 text-sm text-[#9aa4b4]">
          Izračunajte okvirnu cenu za 1 minut.
        </p>
        <span
          className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-[#04161c]"
          style={{ background: AQUA }}
        >
          Izračunaj cenu <ArrowRight className="size-3.5" />
        </span>
      </div>
    </div>
  );
}

/** Upit koji stiže Pool Service-u, sa svim što je Nikola izabrao. */
function LeadCard() {
  return (
    <div className={`${cardCls} p-4`}>
      <div className="flex items-center gap-3">
        <span
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ background: `${AQUA}26` }}
        >
          <Waves className="size-5" style={{ color: AQUA }} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">Novi upit · Nikola M.</p>
          <p className="text-xs text-[#9aa4b4]">
            upravo sada · traži PDF ponudu
          </p>
        </div>
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3ddc97] opacity-60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-[#3ddc97]" />
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Bazen", "8 × 4 m, skimerski"],
          ["Procena", "17.500 – 22.500 €"],
          ["Oprema", "Pumpa, prekrivač, LED"],
          ["Faza", "Kuća u izgradnji"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-white/[0.06] px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wider text-[#9aa4b4]">
              {k}
            </p>
            <p className="text-[13px] font-bold leading-tight text-white">
              {v}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Pool Service zatvara: poziv, obilazak placa, ugovor — korak po korak. */
function CloseCard() {
  const steps = [
    { icon: PhoneCall, t: "Poziv", d: "Sreda, 9:15" },
    { icon: CalendarCheck, t: "Obilazak placa", d: "Subota, 10:00" },
    { icon: FileSignature, t: "Ugovor", d: "Dve nedelje kasnije" },
  ];
  const STEP = 0.7;
  return (
    <motion.div
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-80px" }}
      className={`${cardCls} p-4 sm:p-5`}
    >
      <ol className="grid grid-cols-3 gap-2">
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={s.t} className="relative text-center">
              {!last && (
                <span className="absolute left-[calc(50%+1.75rem)] right-[calc(-50%+1.75rem)] top-5 h-px overflow-hidden bg-white/10">
                  <motion.span
                    variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
                    transition={{
                      duration: STEP * 0.7,
                      delay: i * STEP + 0.35,
                      ease: "easeInOut",
                    }}
                    className="block h-full origin-left"
                    style={{ background: AQUA }}
                  />
                </span>
              )}
              <motion.span
                variants={{
                  hidden: { scale: 0.4, opacity: 0 },
                  shown: { scale: 1, opacity: 1 },
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 16,
                  delay: i * STEP,
                }}
                className="relative mx-auto flex size-10 items-center justify-center rounded-xl"
                style={{ background: last ? AQUA : `${AQUA}1f` }}
              >
                {last && (
                  <motion.span
                    aria-hidden
                    variants={{
                      hidden: { scale: 1, opacity: 0 },
                      shown: { scale: [1, 1.7], opacity: [0.6, 0] },
                    }}
                    transition={{ duration: 1.1, delay: i * STEP + 0.2 }}
                    className="absolute inset-0 rounded-xl"
                    style={{ background: AQUA }}
                  />
                )}
                <s.icon
                  className="relative size-5"
                  style={{ color: last ? "#04161c" : AQUA }}
                />
              </motion.span>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  shown: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4, delay: i * STEP + 0.15 }}
              >
                <p className="mt-2 text-[13px] font-bold leading-tight text-white">
                  {s.t}
                </p>
                <p className="text-[11px] text-[#9aa4b4]">{s.d}</p>
              </motion.div>
            </li>
          );
        })}
      </ol>
      <motion.p
        variants={{
          hidden: { opacity: 0, y: 10 },
          shown: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.45, delay: steps.length * STEP }}
        className="mt-4 rounded-xl bg-white/[0.05] px-3.5 py-2.5 text-sm text-[#d6dde6]"
      >
        „Video sam procenu, to je otprilike moj budžet. Kad možete da dođete?”
      </motion.p>
    </motion.div>
  );
}

/** Kampanja: šta pojačavamo, šta gasimo. */
function CampaignCard() {
  const rows = [
    { t: "Video · majstor na vašem gradilištu", w: 92, on: true },
    { t: "Video · koliko će vas koštati bazen", w: 74, on: true },
    { t: "Statična slika · akcija", w: 18, on: false },
  ];
  return (
    <div className={`${cardCls} p-4 sm:p-5`}>
      <p className="text-xs font-bold uppercase tracking-widest text-[#9aa4b4]">
        Kampanja · upiti iz kalkulatora
      </p>
      <ul className="mt-4 space-y-3.5">
        {rows.map((r) => (
          <li key={r.t}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span
                className={`truncate font-semibold ${r.on ? "text-white" : "text-[#6f7a8a] line-through"}`}
              >
                {r.t}
              </span>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
                style={
                  r.on
                    ? { background: `${AQUA}26`, color: AQUA }
                    : { background: "rgba(255,255,255,0.06)", color: "#8b97a8" }
                }
              >
                {r.on ? "Pojačano" : "Ugašeno"}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.07]">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${r.w}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{
                  background: r.on
                    ? `linear-gradient(90deg, ${BLUE}, ${AQUA})`
                    : "#3a4250",
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────────── Stranica ───────────── */

const TEAM = [
  { name: "Luka", role: "Web i kalkulator", img: "/people/luka.webp" },
  { name: "Mihajlo", role: "Video produkcija", img: "/people/mihac.webp" },
  { name: "Filip", role: "Meta reklame", img: "/people/filip.webp" },
  { name: "Nina", role: "Organizacija", img: "/people/nina.webp" },
  { name: "Stefan", role: "Montiranje", img: "/people/stefan.webp" },
  { name: "Kuzma", role: "Montiranje", img: "/people/kuzma.webp" },
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

/** Prati koje poglavlje je na sredini ekrana. */
function useActiveChapter() {
  const [active, setActive] = useState({ stage: 0, chapter: "01" });
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-stage]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          setActive({
            stage: Number(el.dataset.stage),
            chapter: el.dataset.chapter ?? "01",
          });
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

export default function PoolServicePitch() {
  const [calcOpen, setCalcOpen] = useState(false);
  const active = useActiveChapter();

  return (
    <div className="relative">
      {/* HERO: upoznajte Nikolu */}
      <section className="relative isolate overflow-hidden pb-16 pt-24 sm:pt-28 md:pb-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[22rem] w-[130%] -translate-x-1/2 rounded-full bg-[#2aa8ff]/20 blur-[100px] sm:w-[80%]" />
        </div>
        <div className="container-x grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 130, damping: 20 }}
            className="min-w-0"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-foreground/[0.03] py-1.5 pl-1.5 pr-4 text-xs font-semibold text-muted-foreground">
              <span
                className="flex size-7 items-center justify-center rounded-full"
                style={{ background: AQUA }}
              >
                <Waves className="size-4 text-[#04161c]" />
              </span>
              Predlog za Pool Service Novi Sad · Skeylo
            </div>
            <h1 className="mt-6 text-[44px] font-extrabold leading-[1] sm:text-6xl lg:text-7xl">
              Upoznajte <span style={gradientText}>Nikolu.</span>
            </h1>
            <p className="mt-6 max-w-lg text-xl leading-snug text-muted-foreground sm:text-2xl">
              Gradi kuću i hoće bazen. On je vaš sledeći klijent, samo to još ne
              zna.
            </p>
            <a href="#poglavlje-1" className={`${ctaCls} mt-9`}>
              Pratite Nikolin put
              <ArrowDown className="size-5 transition-transform group-hover:translate-y-0.5" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 110,
              damping: 18,
              delay: 0.15,
            }}
            className="mx-auto w-full min-w-0 max-w-md"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border">
              <Image
                src={`${IMG}/nikola-hero.webp`}
                alt="Nikola"
                fill
                priority
                quality={90}
                sizes="(min-width: 1024px) 450px, 100vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#07090d] to-transparent" />
            </div>
            <div className={`${cardCls} relative z-10 mx-4 -mt-28 p-5 sm:mx-8`}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-2xl font-extrabold text-white">
                  Nikola
                </p>
                <p className="text-sm text-[#9aa4b4]">
                  38 · supruga i dvoje dece
                </p>
              </div>
              <dl className="mt-3 divide-y divide-white/10 text-[15px]">
                {[
                  ["Kuća", "u izgradnji, Veternik"],
                  ["Useljenje", "sledećeg proleća"],
                  ["Dvorište", "mesto za bazen 8 × 4"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-[#9aa4b4]">{k}</dt>
                    <dd className="text-right font-bold text-white">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-white/[0.05] px-3.5 py-2.5 text-sm">
                <span className="text-[#9aa4b4]">Zna koliko košta bazen</span>
                <span className="font-extrabold" style={{ color: AQUA }}>
                  0%
                </span>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Nikola je izmišljen. Njegovo pitanje nije.
            </p>
          </motion.div>
        </div>
      </section>

      {/* PRIČA */}
      <div className="relative">
        <StoryBar stage={active.stage} chapter={active.chapter} />

        <Chapter
          n={1}
          stage={0}
          when="Mart, na gradilištu"
          title="Bazen je u planu,"
          accent="a cenu ne zna."
          line="Gugla cenu i dobija isti odgovor: „zavisi”. Majstor ne odgovara na poruku. Bazen pada na listu „jednog dana”."
          scene={
            <Scene
              src={`${IMG}/kuca-gradnja.webp`}
              alt="Nikola na placu ispred kuće u izgradnji"
              pos="60% 50%"
            />
          }
          artifact={<SearchCard />}
          proof={[
            { src: "/analiza.webp", t: "Istraživanje kupca", pos: "50% 35%" },
            { src: "/podcast/korak1.webp", t: "Strategija" },
            { src: "/people/mihac/7.webp", t: "Scenariji za video" },
          ]}
        />

        <Chapter
          n={2}
          stage={1}
          when="Utorak, 22:10"
          title="Skroluje Instagram."
          accent="Oglas mu kaže ono što niko nije."
          line="Video sa vašeg gradilišta u Novom Sadu, vaš majstor pored iskopa i jedno pitanje: koliko košta vaš bazen?"
          scene={
            <Scene
              src={`${IMG}/nikola-skroluje.webp`}
              alt="Nikola uveče skroluje telefon na kauču"
            />
          }
          artifact={<AdCard />}
          proof={[
            { src: "/people/mihac/3.webp", t: "Snimanje na gradilištu" },
            { src: "/podcast/korak3.webp", t: "Vaš majstor pred kamerom" },
            { src: "/podcast/korak4.webp", t: "Montaža vertikalnih reklama" },
          ]}
        />

        <Chapter
          n={3}
          stage={2}
          when="22:11"
          title="Klikne."
          accent="Za minut zna: 17.500 – 22.500 €."
          line="Četiri koraka: tip, dimenzije, oprema, teren. Bazen se crta dok bira. Na kraju raspon cene, rok izvođenja i sezona kupanja."
          aside={
            <button
              type="button"
              onClick={() => setCalcOpen(true)}
              className={`${ctaCls} mt-8`}
            >
              <Play className="size-4 fill-current" />
              Isprobajte kalkulator uživo
            </button>
          }
          scene={
            <button
              type="button"
              onClick={() => setCalcOpen(true)}
              className="group block w-full text-left"
              aria-label="Otvori kalkulator bazena"
            >
              <BrowserFrame url="Kalkulator bazena">
                <div className="relative">
                  <Image
                    src={`${IMG}/result-desktop.jpg`}
                    alt="Kalkulator bazena sa procenom 17.500 – 22.500 €"
                    width={1920}
                    height={1200}
                    className="h-auto w-full"
                  />
                  <span className="absolute inset-0 flex items-center justify-center transition-colors group-hover:bg-black/30">
                    <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-bold text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                      <Play className="size-4 fill-current" /> Pokreni
                    </span>
                  </span>
                </div>
              </BrowserFrame>
            </button>
          }
          proof={[
            { src: "/webdev.webp", t: "Dizajn i razvoj", pos: "50% 60%" },
            {
              src: `${IMG}/calc-mobile.jpg`,
              t: "Pravljeno za telefon",
              pos: "50% 0%",
            },
            {
              src: `${IMG}/calc-desktop.jpg`,
              t: "Bazen se crta dok bira",
              pos: "25% 60%",
            },
          ]}
        />

        <Chapter
          n={4}
          stage={3}
          when="22:14"
          title="Ostavlja broj."
          accent="Hoće PDF ponudu sa troškovnikom."
          line="Upit stiže sa svim što je izabrao: dimenzije, opremu, fazu gradnje i lokaciju. Znate sve pre prvog poziva."
          scene={
            <Scene
              src={`${IMG}/upit-stize.webp`}
              alt="Telefon sa novim upitom pored uzoraka pločica"
            />
          }
          artifact={<LeadCard />}
        />

        <Chapter
          n={5}
          stage={4}
          when="Sreda ujutru"
          title="Vi ga zovete."
          accent="Razgovor počinje od brojke, ne od nule."
          line="Nikola zna okvir i hoće obilazak placa. Vi radite ono što najbolje znate: teren, ponuda, ugovor."
          aside={
            <p className="mt-8 max-w-md rounded-2xl border border-border bg-foreground/[0.03] p-4 text-[15px] leading-relaxed">
              <span className="font-bold">Mi dovodimo, vi zatvarate.</span>{" "}
              <span className="text-muted-foreground">
                Sve do ovog poziva je naš posao. Od poziva nadalje, vaš.
              </span>
            </p>
          }
          scene={
            <Scene
              src={`${IMG}/obilazak-placa.webp`}
              alt="Nikola se rukuje sa majstorom Pool Service-a na placu"
              zoom
            />
          }
          artifact={<CloseCard />}
        />

        <Chapter
          n={6}
          stage={4}
          when="Ista nedelja"
          title="Nikola nije jedini."
          accent="Tražimo sledećih sto."
          line="Kampanje palimo pre sezone, dok ljudi planiraju. Gasimo oglase koji ne rade, pojačavamo one koji donose upite."
          scene={
            <Scene
              src="/meta.webp"
              alt="Media buyer vodi Meta kampanje"
              pos="50% 40%"
            />
          }
          artifact={<CampaignCard />}
          proof={[
            { src: "/scale.webp", t: "Optimizacija svaki dan", pos: "50% 40%" },
            { src: "/kreativa.webp", t: "Testiranje kreativa", pos: "50% 45%" },
            {
              src: "/bento1/b5.webp",
              t: "ROAS 11,19 za klijenta",
              contain: true,
            },
          ]}
        />

        {/* 07 — vrhunac priče */}
        <section
          id="poglavlje-7"
          data-stage={4}
          data-chapter="07"
          className="relative isolate overflow-hidden pb-14 pt-64 sm:pt-80 lg:py-36"
        >
          <Image
            src={`${IMG}/prvo-kupanje.webp`}
            alt=""
            fill
            sizes="100vw"
            className="-z-10 object-cover object-[70%_top] lg:object-center"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#05080c] via-[#05080c]/70 to-transparent lg:bg-gradient-to-r lg:from-[#05080c]/85 lg:via-[#05080c]/55" />
          <div className="container-x">
            <motion.div {...reveal} className="max-w-3xl">
              <p className="flex items-center gap-3 text-sm font-semibold text-white/70">
                <span
                  className="font-display text-2xl font-extrabold"
                  style={{ color: AQUA }}
                >
                  07
                </span>
                <span className="h-px w-8 bg-white/30" />
                Jul, prvo kupanje
              </p>
              <h2 className="mt-4 text-balance text-[34px] font-extrabold leading-[1.05] text-white sm:text-6xl">
                Nikolina deca skaču u bazen.{" "}
                <span style={gradientText}>Vi ste izgradili još jedan.</span>
              </h2>
            </motion.div>
          </div>
        </section>

        <Chapter
          n={8}
          stage={4}
          when="I onda"
          title="Nikolin bazen"
          accent="postaje vaša sledeća reklama."
          line="Snimamo prvo kupanje i Nikolu koji priča kako je prošlo. Najjači dokaz za sledećeg Nikolu."
          scene={
            <Scene
              src={`${IMG}/snimanje-bazen.webp`}
              alt="Ekipa snima Nikolu na ivici bazena"
            />
          }
          proof={[
            {
              src: "/podcast/case-study-instagram-2.webp",
              t: "Video studija slučaja",
            },
            {
              src: "/podcast/case-study-instagram.webp",
              t: "Klijent pred kamerom",
            },
            { src: "/podcast/korak2.webp", t: "Naš studio", pos: "40% 50%" },
          ]}
        />
      </div>

      {/* TIM */}
      <section className="bg-card/40 py-16 sm:py-24">
        <div className="container-x">
          <motion.div
            {...reveal}
            className="grid items-end gap-6 lg:grid-cols-2"
          >
            <h2 className="text-balance text-[32px] font-extrabold leading-[1.05] sm:text-5xl">
              Jedan tim. <span style={gradientText}>Ceo Nikolin put.</span>
            </h2>
            <p className="text-lg text-muted-foreground lg:text-right">
              Strategija, video, kalkulator, reklame i upiti. Vi samo zatvarate.
            </p>
          </motion.div>
          <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-6">
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

      {/* REZULTATI */}
      <section className="py-16 sm:py-24">
        <div className="container-x">
          <motion.div {...reveal} className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Isti sistem, druge branše
            </p>
            <h2 className="mt-3 text-balance text-[32px] font-extrabold leading-[1.05] sm:text-5xl">
              Ne obećavamo. <span style={gradientText}>Pokazujemo.</span>
            </h2>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <motion.div
              {...reveal}
              className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card p-6 text-center sm:flex-row sm:p-8 sm:text-left"
            >
              <div
                className="relative size-28 shrink-0 overflow-hidden rounded-full border-2 sm:size-32"
                style={{ borderColor: AQUA }}
              >
                <Image
                  src="/ana.webp"
                  alt="Ana Kasap"
                  fill
                  sizes="128px"
                  className="object-cover object-top"
                />
              </div>
              <div>
                <p
                  className="font-display text-4xl font-extrabold sm:text-5xl"
                  style={gradientText}
                >
                  1.600.000 RSD
                </p>
                <p className="mt-1 text-lg font-semibold">
                  prihoda u jednom mesecu
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ana Kasap · vlasnica, Infinity Laser Studio
                </p>
              </div>
            </motion.div>

            <motion.div {...reveal} className="grid grid-cols-2 gap-4">
              {[
                {
                  src: "/bento1/b7.webp",
                  t: "Prihod u jednom mesecu",
                  w: 550,
                  h: 360,
                },
                {
                  src: "/bento1/b9.webp",
                  t: "ROAS iz Meta kampanje",
                  w: 296,
                  h: 182,
                },
              ].map((m) => (
                <figure
                  key={m.src}
                  className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card"
                >
                  <div className="flex flex-1 items-center justify-center bg-white p-3">
                    <Image
                      src={m.src}
                      alt={m.t}
                      width={m.w}
                      height={m.h}
                      className="h-auto max-h-36 w-full object-contain"
                    />
                  </div>
                  <figcaption className="px-4 py-3 text-[13px] font-semibold">
                    {m.t}
                  </figcaption>
                </figure>
              ))}
            </motion.div>
          </div>

          <motion.div
            {...reveal}
            className="mt-4 rounded-3xl border border-border bg-card p-4 sm:p-6"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Najbolji oglasi · vrednost kupovina
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
              {[
                { src: "/bento1/b3.webp", w: 1076, h: 160 },
                { src: "/bento1/b16.webp", w: 904, h: 156 },
                { src: "/bento1/b19.webp", w: 844, h: 162 },
              ].map((s) => (
                <div
                  key={s.src}
                  className="flex items-center overflow-hidden rounded-xl bg-white px-2"
                >
                  <Image
                    src={s.src}
                    alt="Rezultat oglasa iz Meta Ads Managera"
                    width={s.w}
                    height={s.h}
                    className="h-auto w-full"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-90">
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
              src={`${IMG}/cta-gradilista.webp`}
              alt=""
              fill
              sizes="100vw"
              className="-z-10 object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-[#05080c]/60" />
            <TrendingUp className="mx-auto size-10" style={{ color: AQUA }} />
            <h2 className="mx-auto mt-5 max-w-3xl text-balance text-[34px] font-extrabold leading-[1.05] sm:text-6xl">
              Sledeći Nikola <span style={gradientText}>već zida kuću.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg text-muted-foreground">
              Pola sata razgovora. Bez obaveze.
            </p>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className={`${ctaCls} mt-9`}
            >
              Pišite Luki na WhatsApp
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>
        </div>
      </section>

      <CalculatorOverlay
        open={calcOpen}
        onClose={() => setCalcOpen(false)}
        title="Kalkulator bazena"
        src={CALC}
      />
    </div>
  );
}
