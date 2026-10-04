"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  MotionConfig,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  CalendarCheck,
  Clapperboard,
  CodeXml,
  FileSignature,
  FlaskConical,
  Mic,
  PhoneCall,
  Play,
  Scissors,
  Search,
  Shapes,
  Smartphone,
  Target,
  TrendingUp,
  Video,
  Waves,
  type LucideIcon,
} from "lucide-react";
import {
  BrowserFrame,
  CalculatorOverlay,
  useIsWide,
} from "@/components/solar/mt-komex/CalculatorEmbed";

const AQUA = "#4fd8eb";
const BLUE = "#2aa8ff";
const WHATSAPP = `https://wa.me/381631012474?text=${encodeURIComponent(
  "Zdravo Luka, pogledao sam predlog za Pool Service. Hajde da razgovaramo.",
)}`;
const IMG = "/calculator/pool-service";
const CALC = "/calculator/bazen";

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEW = { once: true, margin: "0px 0px -12% 0px" } as const;

const gradientText = {
  background: `linear-gradient(100deg, #9af0ff, ${AQUA} 45%, ${BLUE})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;

const ctaCls =
  "group inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7ae7ff] to-[#2aa8ff] px-7 py-3 text-base font-extrabold text-[#04161c] shadow-lg shadow-[#4fd8eb]/20 transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]";

// Bez backdrop-blur: kartice su ionako neprozirne, a blur preko slika koje se
// pomeraju je najskuplja stvar na telefonu.
const cardCls =
  "rounded-2xl border border-white/10 bg-[#0f1319] shadow-[0_30px_60px_-25px_rgba(0,0,0,0.9)]";

/* ───────────── Animacioni primitivi ───────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/** Naslov koji izlazi reč po reč iz maske. */
function RevealTitle({
  as = "h2",
  text,
  accent,
  className,
  immediate,
  delay = 0,
  light,
}: {
  as?: "h1" | "h2";
  text: string;
  accent?: string;
  className?: string;
  /** Hero: animiraj odmah, ne čekaj skrol. */
  immediate?: boolean;
  delay?: number;
  light?: boolean;
}) {
  const Tag = as === "h1" ? motion.h1 : motion.h2;
  const words = [
    ...text.split(" ").map((w) => ({ w, a: false })),
    ...(accent ? accent.split(" ").map((w) => ({ w, a: true })) : []),
  ];
  return (
    <Tag
      initial="hidden"
      {...(immediate
        ? { animate: "shown" }
        : { whileInView: "shown", viewport: VIEW })}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: 0.05, delayChildren: delay } },
      }}
      className={`text-balance font-extrabold ${light ? "text-white" : ""} ${className ?? ""}`}
    >
      {words.map(({ w, a }, i) => (
        <span key={i}>
          <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
            <motion.span
              className="inline-block"
              style={a ? gradientText : undefined}
              variants={{
                hidden: { y: "110%" },
                shown: { y: "0%", transition: { duration: 0.85, ease: EASE } },
              }}
            >
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}

function formatNum(v: number, decimals: number) {
  const [int, frac] = v.toFixed(decimals).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return frac ? `${grouped},${frac}` : grouped;
}

/** Broj koji odbrojava do cilja kad uđe u ekran. Piše direktno u DOM, bez rendera. */
function Count({
  to,
  decimals = 0,
  duration = 1.6,
  delay = 0,
  step,
}: {
  to: number;
  decimals?: number;
  duration?: number;
  delay?: number;
  /** Zaokruživanje tokom brojanja, da velike cifre ne trepere. */
  step?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const inView = useInView(ref, { once: true, margin: "0px 0px -4% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || started.current) return;
    el.textContent = formatNum(reduce ? to : 0, decimals);
  }, [reduce, to, decimals]);

  useEffect(() => {
    if (!inView || reduce || started.current) return;
    started.current = true;
    const c = animate(0, to, {
      duration,
      delay,
      ease: EASE,
      onUpdate: (v) => {
        const n = step ? Math.round(v / step) * step : v;
        if (ref.current) ref.current.textContent = formatNum(n, decimals);
      },
    });
    return () => c.stop();
  }, [inView, reduce, to, decimals, duration, delay, step]);

  return (
    <span ref={ref} className="tabular-nums">
      {formatNum(to, decimals)}
    </span>
  );
}

/** Ilustracija scene: ulazi blagim zumom, na desktopu ima i laganu paralaksu. */
function Scene({
  src,
  alt,
  pos,
  zoom,
  priority,
}: {
  src: string;
  alt: string;
  pos?: string;
  zoom?: boolean;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const wide = useIsWide();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={VIEW}
      transition={{ duration: 0.9, ease: EASE }}
      className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border bg-card"
    >
      <motion.div
        className="absolute inset-x-0 -inset-y-[6%]"
        style={wide ? { y } : undefined}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 680px, 100vw"
          className={`object-cover ${zoom ? "scale-[1.18]" : ""}`}
          style={pos ? { objectPosition: pos } : undefined}
        />
      </motion.div>
    </motion.div>
  );
}

/* ───────────── Kartice iz priče ───────────── */

const QUERY = "Koliko košta bazen u Novom Sadu";

/** Nikola kuca pitanje i dobija isti odgovor: „zavisi”. */
function SearchCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, VIEW);
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(QUERY.length);
  const started = useRef(false);

  useEffect(() => {
    if (!reduce && !started.current) setTyped(0);
  }, [reduce]);

  useEffect(() => {
    if (!inView || reduce || started.current) return;
    started.current = true;
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setTyped(n);
      if (n >= QUERY.length) window.clearInterval(id);
    }, 38);
    return () => window.clearInterval(id);
  }, [inView, reduce]);

  const done = typed >= QUERY.length;
  const results = [
    {
      site: "forum.rs › kuca-i-basta",
      t: "Koliko je koštao vaš bazen? (strana 14)",
      hl: "„Zavisi",
      d: " od mnogo stvari, javi se majstoru…”",
    },
    {
      site: "oglasi.rs › bazeni",
      t: "Izgradnja bazena po povoljnim cenama",
      hl: "Cena na upit.",
      d: " Pozovite za besplatnu procenu.",
    },
  ];

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      whileInView="shown"
      viewport={VIEW}
      className={`${cardCls} p-4 sm:p-5`}
    >
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5">
        <Search className="size-4 shrink-0 text-[#9aa4b4]" />
        <span className="relative min-w-0 flex-1 truncate text-[13px] font-semibold text-white sm:text-sm">
          {QUERY.slice(0, typed)}
          {!done && (
            <span className="ml-px inline-block h-4 w-px translate-y-0.5 bg-white" />
          )}
        </span>
      </div>
      <motion.ul
        initial={false}
        animate={done ? "shown" : "hidden"}
        variants={{
          hidden: {},
          shown: { transition: { staggerChildren: 0.18, delayChildren: 0.15 } },
        }}
        className="mt-4 space-y-3"
      >
        {results.map((r) => (
          <motion.li
            key={r.t}
            variants={{
              hidden: { opacity: 0, y: 10 },
              shown: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, ease: EASE },
              },
            }}
          >
            <p className="truncate text-xs text-[#9aa4b4]">{r.site}</p>
            <p className="mt-0.5 text-[15px] font-bold leading-snug text-[#8ab4f8]">
              {r.t}
            </p>
            <p className="mt-0.5 text-sm text-[#9aa4b4]">
              <span className="relative whitespace-nowrap text-[#ffd8a8]">
                <motion.span
                  aria-hidden
                  variants={{
                    hidden: { scaleX: 0 },
                    shown: {
                      scaleX: 1,
                      transition: { duration: 0.6, delay: 0.5, ease: EASE },
                    },
                  }}
                  className="absolute inset-x-0 bottom-0 h-[0.45em] origin-left rounded-sm bg-[#ff9f43]/25"
                />
                <span className="relative">{r.hl}</span>
              </span>
              {r.d}
            </p>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

/** Oglas koji Nikola vidi u feedu: isklizne kao sledeća objava. */
function AdCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEW}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className={`${cardCls} flex gap-4 p-3 sm:p-4`}
    >
      <div className="relative aspect-[9/16] w-24 shrink-0 overflow-hidden rounded-xl sm:w-28">
        <Image
          src={`${IMG}/oglas-bazen.webp`}
          alt="Vertikalni video oglas"
          fill
          sizes="112px"
          className="object-cover object-bottom"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-9 items-center justify-center rounded-full bg-black/60">
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
          className="relative mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-[#04161c]"
          style={{ background: AQUA }}
        >
          {/* "Dodir" na dugme: talas koji kaže da je Nikola kliknuo. */}
          <motion.span
            aria-hidden
            initial={{ opacity: 0, scale: 1 }}
            whileInView={{ opacity: [0, 0.55, 0], scale: [1, 1, 1.5] }}
            viewport={VIEW}
            transition={{ duration: 1, delay: 0.9, times: [0, 0.1, 1] }}
            className="absolute inset-0 rounded-lg"
            style={{ background: AQUA }}
          />
          <span className="relative">Izračunaj cenu</span>
          <ArrowRight className="relative size-3.5" />
        </span>
      </div>
    </motion.div>
  );
}

/** Odjek hero kartice: Nikola sada zna cenu. */
function KnowsCard() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="shown"
      viewport={VIEW}
      className={`${cardCls} p-4 sm:p-5`}
    >
      <div className="flex items-center gap-3">
        <span className="relative size-9 shrink-0 overflow-hidden rounded-full border border-white/10">
          <Image
            src={`${IMG}/nikola-avatar.webp`}
            alt=""
            fill
            sizes="36px"
            className="object-cover"
          />
        </span>
        <p className="min-w-0 flex-1 text-sm text-[#9aa4b4]">
          Nikola zna koliko košta bazen
        </p>
        <span
          className="font-display text-lg font-extrabold"
          style={{ color: AQUA }}
        >
          <Count to={100} duration={1.4} />%
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={VIEW}
          transition={{ duration: 1.4, ease: EASE }}
          className="h-full origin-left rounded-full"
          style={{ background: `linear-gradient(90deg, ${BLUE}, ${AQUA})` }}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 rounded-xl bg-white/[0.05] px-3.5 py-2.5">
        <span className="text-sm text-[#9aa4b4]">Okvirna cena</span>
        <span className="whitespace-nowrap font-display text-xl font-extrabold text-white">
          <Count to={17500} delay={0.2} step={100} /> –{" "}
          <Count to={22500} delay={0.2} step={100} /> €
        </span>
      </div>
    </motion.div>
  );
}

/** Upit koji stiže Pool Service-u: pada odozgo kao notifikacija. */
function LeadCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={VIEW}
      transition={{ type: "spring", stiffness: 170, damping: 18 }}
      className={`${cardCls} p-4`}
    >
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
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3ddc97] opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2.5 rounded-full bg-[#3ddc97]" />
        </span>
      </div>
      <motion.div
        initial="hidden"
        whileInView="shown"
        viewport={VIEW}
        variants={{
          hidden: {},
          shown: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
        }}
        className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {[
          ["Bazen", "8 × 4 m, skimerski"],
          ["Procena", "17.500 – 22.500 €"],
          ["Oprema", "Pumpa, prekrivač, LED"],
          ["Faza", "Kuća u izgradnji"],
        ].map(([k, v]) => (
          <motion.div
            key={k}
            variants={{
              hidden: { opacity: 0, y: 8 },
              shown: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.45, ease: EASE },
              },
            }}
            className="rounded-lg bg-white/[0.06] px-2.5 py-2"
          >
            <p className="text-[10px] uppercase tracking-wider text-[#9aa4b4]">
              {k}
            </p>
            <p className="text-[13px] font-bold leading-tight text-white">
              {v}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
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
      viewport={VIEW}
      variants={{ hidden: { opacity: 0, y: 24 }, shown: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.6, ease: EASE }}
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
    { t: "Video · majstor na vašem gradilištu", w: 0.92, on: true },
    { t: "Video · koliko će vas koštati bazen", w: 0.74, on: true },
    { t: "Statična slika · akcija", w: 0.18, on: false },
  ];
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="shown"
      viewport={VIEW}
      className={`${cardCls} p-4 sm:p-5`}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-[#9aa4b4]">
        Kampanja · upiti iz kalkulatora
      </p>
      <ul className="mt-4 space-y-3.5">
        {rows.map((r, i) => (
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
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: r.w }}
                viewport={VIEW}
                transition={{
                  duration: 1.2,
                  delay: 0.2 + i * 0.12,
                  ease: EASE,
                }}
                className="h-full origin-left rounded-full"
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
    </motion.div>
  );
}

/* ───────────── Poglavlje ───────────── */

type Work = { icon: LucideIcon; t: string };

/** Šta Skeylo radi u ovom koraku: tri ikonice umesto tri fotografije. */
function WorkChips({ items }: { items: Work[] }) {
  return (
    <motion.ul
      initial="hidden"
      whileInView="shown"
      viewport={VIEW}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
      }}
      className="mt-6 flex flex-wrap gap-2"
      aria-label="Šta mi radimo"
    >
      {items.map((w) => (
        <motion.li
          key={w.t}
          variants={{
            hidden: { opacity: 0, y: 8 },
            shown: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.45, ease: EASE },
            },
          }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.03] py-1.5 pl-1.5 pr-3.5 text-[13px] font-semibold"
        >
          <span
            className="flex size-6 items-center justify-center rounded-full"
            style={{ background: `${AQUA}1f` }}
          >
            <w.icon className="size-3.5" style={{ color: AQUA }} />
          </span>
          {w.t}
        </motion.li>
      ))}
    </motion.ul>
  );
}

function Chapter({
  n,
  when,
  title,
  accent,
  line,
  aside,
  work,
  scene,
  artifact,
  onSpine = true,
}: {
  n: number;
  when: string;
  title: string;
  accent: string;
  line: string;
  aside?: React.ReactNode;
  work?: Work[];
  scene: React.ReactNode;
  artifact?: React.ReactNode;
  onSpine?: boolean;
}) {
  const num = String(n).padStart(2, "0");
  return (
    <section
      id={`poglavlje-${n}`}
      className={`relative scroll-mt-20 py-16 sm:py-20 ${onSpine ? "pl-7 sm:pl-12 lg:pl-16" : ""}`}
    >
      {onSpine && (
        <motion.span
          aria-hidden
          initial="off"
          whileInView="on"
          viewport={{ once: true, margin: "0px 0px -45% 0px" }}
          className="absolute left-0 top-[4.6rem] flex size-4 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-background sm:top-[6.6rem]"
        >
          <motion.span
            variants={{ off: { scale: 0 }, on: { scale: 1 } }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="size-2 rounded-full"
            style={{ background: AQUA, boxShadow: `0 0 12px ${AQUA}` }}
          />
        </motion.span>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="shown"
            viewport={VIEW}
            className="flex items-center gap-3 text-sm font-semibold text-muted-foreground"
          >
            <span
              className="font-display text-xl font-extrabold tabular-nums"
              style={{ color: AQUA }}
            >
              {num}
            </span>
            <span className="h-px w-8 bg-border" />
            {when}
          </motion.p>
          <RevealTitle
            text={title}
            accent={accent}
            className="mt-4 text-[30px] leading-[1.06] sm:text-5xl"
          />
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="shown"
            viewport={VIEW}
            className="mt-5 max-w-md text-[17px] leading-relaxed text-muted-foreground sm:text-lg"
          >
            {line}
          </motion.p>
          {work && <WorkChips items={work} />}
          {aside}
        </div>

        <div className="min-w-0">
          {scene}
          {artifact && (
            <div className="relative z-10 -mt-12 px-3 sm:-mt-20 sm:px-10">
              {artifact}
            </div>
          )}
        </div>
      </div>
    </section>
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

function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-6 pt-24 sm:pt-32 md:pb-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem]"
        style={{
          background: `radial-gradient(60% 55% at 50% 0%, ${BLUE}33, transparent 70%)`,
        }}
      />
      <div className="container-x grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="inline-flex items-center gap-3 rounded-full border border-border bg-foreground/[0.03] py-1.5 pl-1.5 pr-4 text-xs font-semibold text-muted-foreground"
          >
            <span
              className="flex size-7 items-center justify-center rounded-full"
              style={{ background: AQUA }}
            >
              <Waves className="size-4 text-[#04161c]" />
            </span>
            Predlog za Pool Service Novi Sad · Skeylo
          </motion.div>
          <RevealTitle
            as="h1"
            immediate
            delay={0.15}
            text="Upoznajte"
            accent="Nikolu."
            className="mt-6 text-[48px] leading-[1] sm:text-6xl lg:text-7xl"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
            className="mt-6 max-w-lg text-xl leading-snug text-muted-foreground sm:text-2xl"
          >
            Gradi kuću i hoće bazen. On je vaš sledeći klijent, samo to još ne
            zna.
          </motion.p>
          <motion.a
            href="#poglavlje-1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
            className={`${ctaCls} mt-9`}
          >
            Pratite Nikolin put
            <ArrowDown className="size-5 transition-transform group-hover:translate-y-0.5" />
          </motion.a>
        </div>

        <div className="mx-auto w-full min-w-0 max-w-sm lg:max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
            className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border"
          >
            <Image
              src={`${IMG}/nikola-hero.webp`}
              alt="Nikola"
              fill
              priority
              quality={90}
              sizes="(min-width: 1024px) 450px, 384px"
              className="object-cover object-top"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#07090d] to-transparent" />
          </motion.div>
          <motion.div
            initial="hidden"
            animate="shown"
            variants={{
              hidden: { opacity: 0, y: 28 },
              shown: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.8,
                  delay: 0.5,
                  ease: EASE,
                  staggerChildren: 0.09,
                  delayChildren: 0.75,
                },
              },
            }}
            className={`${cardCls} relative z-10 mx-4 -mt-28 p-5 sm:mx-8`}
          >
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
                <motion.div
                  key={k}
                  variants={{
                    hidden: { opacity: 0, x: -8 },
                    shown: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.5, ease: EASE },
                    },
                  }}
                  className="flex justify-between gap-4 py-2.5"
                >
                  <dt className="text-[#9aa4b4]">{k}</dt>
                  <dd className="text-right font-bold text-white">{v}</dd>
                </motion.div>
              ))}
            </dl>
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -8 },
                shown: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.5, ease: EASE },
                },
              }}
              className="mt-2 rounded-xl bg-white/[0.05] px-3.5 py-2.5 text-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#9aa4b4]">Zna koliko košta bazen</span>
                <span className="font-extrabold" style={{ color: AQUA }}>
                  0%
                </span>
              </div>
              <div className="mt-2 h-1 rounded-full bg-white/[0.07]" />
            </motion.div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="mt-4 text-center text-xs text-muted-foreground"
          >
            Nikola je izmišljen. Njegovo pitanje nije.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

/** Vrhunac priče: slika preko celog ekrana koja se "otvara" dok skrolujete. */
function Climax() {
  const ref = useRef<HTMLElement>(null);
  const wide = useIsWide();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.6], [1.15, 1]);

  return (
    <section
      ref={ref}
      id="poglavlje-6"
      className="relative isolate overflow-hidden pb-14 pt-64 sm:pt-80 lg:py-40"
    >
      <motion.div
        className="absolute inset-0 -z-10"
        style={wide ? { scale } : undefined}
      >
        <Image
          src={`${IMG}/prvo-kupanje.webp`}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[70%_top] lg:object-center"
        />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#05080c] via-[#05080c]/70 to-transparent lg:bg-gradient-to-r lg:from-[#05080c]/85 lg:via-[#05080c]/55" />
      <div className="container-x">
        <div className="max-w-3xl">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="shown"
            viewport={VIEW}
            className="flex items-center gap-3 text-sm font-semibold text-white/70"
          >
            <span
              className="font-display text-xl font-extrabold"
              style={{ color: AQUA }}
            >
              06
            </span>
            <span className="h-px w-8 bg-white/30" />
            Jul, prvo kupanje
          </motion.p>
          <RevealTitle
            light
            text="Nikolina deca skaču u bazen."
            accent="Vi ste izgradili još jedan."
            className="mt-4 text-[34px] leading-[1.05] sm:text-6xl"
          />
        </div>
      </div>
    </section>
  );
}

function Results() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="shown"
          viewport={VIEW}
          className="text-sm font-bold uppercase tracking-widest text-muted-foreground"
        >
          Isti sistem, druge branše
        </motion.p>
        <RevealTitle
          text="Ne obećavamo."
          accent="Pokazujemo."
          className="mt-3 text-[32px] leading-[1.05] sm:text-5xl"
        />

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="shown"
            viewport={VIEW}
            className="flex items-center gap-5 rounded-3xl border border-border bg-card p-6 sm:gap-7 sm:p-8"
          >
            <div
              className="relative size-20 shrink-0 overflow-hidden rounded-full border-2 sm:size-28"
              style={{ borderColor: AQUA }}
            >
              <Image
                src="/ana.webp"
                alt="Ana Kasap"
                fill
                sizes="112px"
                className="object-cover object-top"
              />
            </div>
            <div className="min-w-0">
              <p
                className="font-display text-[34px] font-extrabold leading-none sm:text-5xl"
                style={gradientText}
              >
                <Count to={1600000} duration={2} step={10000} />
              </p>
              <p className="mt-2 text-base font-semibold sm:text-lg">
                RSD prihoda u jednom mesecu
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ana Kasap · Infinity Laser Studio
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="shown"
            viewport={VIEW}
            className="flex flex-col justify-center rounded-3xl border border-border bg-card p-6 sm:p-8"
          >
            <p className="text-sm font-semibold text-muted-foreground">ROAS</p>
            <p
              className="mt-1 font-display text-[44px] font-extrabold leading-none sm:text-6xl"
              style={gradientText}
            >
              <Count to={11.19} decimals={2} duration={1.8} />
            </p>
            <p className="mt-2 text-base font-semibold">
              iz Meta kampanje za klijenta
            </p>
          </motion.div>
        </div>
      </div>

      {/* Logotipi u beskonačnoj traci: samo transform, ide na GPU. */}
      <div className="relative mt-12 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex w-max animate-[marquee_32s_linear_infinite] items-center motion-reduce:animate-none">
          {/* Četiri kopije: pola trake je uvek šire od ekrana, pa nema rupe. */}
          {[0, 1, 2, 3].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy > 0}
              className="flex shrink-0 items-center gap-12 pr-12 sm:gap-16 sm:pr-16"
            >
              {LOGOS.map((l) => (
                <Image
                  key={l.name}
                  src={l.img}
                  alt={copy === 0 ? l.name : ""}
                  width={120}
                  height={48}
                  className="h-10 w-auto rounded object-contain opacity-80 sm:h-12"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Team() {
  return (
    <section className="border-t border-border bg-card/40 py-16 sm:py-24">
      <div className="container-x">
        <div className="grid items-end gap-4 lg:grid-cols-2 lg:gap-6">
          <RevealTitle
            text="Jedan tim."
            accent="Ceo Nikolin put."
            className="text-[32px] leading-[1.05] sm:text-5xl"
          />
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="shown"
            viewport={VIEW}
            className="text-lg text-muted-foreground lg:text-right"
          >
            Strategija, video, kalkulator, reklame i upiti. Vi samo zatvarate.
          </motion.p>
        </div>
        <motion.div
          initial="hidden"
          whileInView="shown"
          viewport={VIEW}
          variants={{
            hidden: {},
            shown: { transition: { staggerChildren: 0.07 } },
          }}
          className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-6"
        >
          {TEAM.map((p) => (
            <motion.div
              key={p.name}
              variants={{
                hidden: { opacity: 0, y: 20 },
                shown: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: EASE },
                },
              }}
              className="text-center"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-border">
                <Image
                  src={p.img}
                  alt={p.name}
                  fill
                  sizes="(min-width: 640px) 200px, 33vw"
                  className="object-cover object-top"
                />
              </div>
              <p className="mt-2 text-sm font-bold">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="pb-16 pt-4 sm:pb-24">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={VIEW}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative isolate overflow-hidden rounded-3xl border border-border px-6 py-16 text-center sm:px-12 sm:py-24"
        >
          <Image
            src={`${IMG}/cta-gradilista.webp`}
            alt=""
            fill
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="-z-10 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-[#05080c]/65" />
          <TrendingUp className="mx-auto size-10" style={{ color: AQUA }} />
          <RevealTitle
            light
            text="Sledeći Nikola"
            accent="već zida kuću."
            className="mx-auto mt-5 max-w-3xl text-[34px] leading-[1.05] sm:text-6xl"
          />
          <p className="mx-auto mt-5 max-w-md text-lg text-white/75">
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
  );
}

export default function PoolServiceLanding() {
  const [calcOpen, setCalcOpen] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ["start 60%", "end 60%"],
  });

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative overflow-x-clip">
        <Hero />

        {/* PRIČA: linija s leve strane se puni dok Nikola napreduje. */}
        <div ref={storyRef} className="container-x relative">
          <div
            aria-hidden
            className="absolute bottom-24 left-5 top-24 w-px bg-border md:left-8"
          >
            <motion.div
              className="h-full w-full origin-top"
              style={{
                scaleY: scrollYProgress,
                background: `linear-gradient(${AQUA}, ${BLUE})`,
              }}
            />
          </div>

          <Chapter
            n={1}
            when="Mart, na gradilištu"
            title="Bazen je u planu,"
            accent="a cenu ne zna."
            line="Gugla cenu i dobija isti odgovor: „zavisi”. Majstor ne odgovara na poruku. Bazen pada na listu „jednog dana”."
            work={[
              { icon: Search, t: "Istraživanje kupca" },
              { icon: Target, t: "Strategija" },
              { icon: Clapperboard, t: "Scenariji za video" },
            ]}
            scene={
              <Scene
                src={`${IMG}/kuca-gradnja.webp`}
                alt="Nikola na placu ispred kuće u izgradnji"
                pos="60% 50%"
              />
            }
            artifact={<SearchCard />}
          />

          <Chapter
            n={2}
            when="Utorak, 22:10"
            title="Skroluje Instagram."
            accent="Oglas mu kaže ono što niko nije."
            line="Video sa vašeg gradilišta u Novom Sadu, vaš majstor pored iskopa i jedno pitanje: koliko košta vaš bazen?"
            work={[
              { icon: Video, t: "Snimanje na gradilištu" },
              { icon: Mic, t: "Vaš majstor pred kamerom" },
              { icon: Scissors, t: "Montaža vertikalnih reklama" },
            ]}
            scene={
              <Scene
                src={`${IMG}/nikola-skroluje.webp`}
                alt="Nikola uveče skroluje telefon na kauču"
              />
            }
            artifact={<AdCard />}
          />

          <Chapter
            n={3}
            when="22:11"
            title="Klikne."
            accent="Za minut zna: 17.500 – 22.500 €."
            line="Četiri koraka: tip, dimenzije, oprema, teren. Bazen se crta dok bira. Na kraju raspon cene, rok izvođenja i sezona kupanja."
            work={[
              { icon: CodeXml, t: "Dizajn i razvoj" },
              { icon: Smartphone, t: "Pravljeno za telefon" },
              { icon: Shapes, t: "Bazen se crta dok bira" },
            ]}
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
              <motion.button
                type="button"
                onClick={() => setCalcOpen(true)}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEW}
                transition={{ duration: 0.9, ease: EASE }}
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
                      sizes="(min-width: 1024px) 680px, 100vw"
                      className="h-auto w-full"
                    />
                    <span className="absolute inset-0 flex items-center justify-center transition-colors group-hover:bg-black/30">
                      <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <Play className="size-4 fill-current" /> Pokreni
                      </span>
                    </span>
                  </div>
                </BrowserFrame>
              </motion.button>
            }
            artifact={<KnowsCard />}
          />

          <Chapter
            n={4}
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
            when="Sreda ujutru"
            title="Vi ga zovete."
            accent="Razgovor počinje od brojke, ne od nule."
            line="Nikola zna okvir i hoće obilazak placa. Vi radite ono što najbolje znate: teren, ponuda, ugovor."
            aside={
              <motion.p
                variants={fadeUp}
                initial="hidden"
                whileInView="shown"
                viewport={VIEW}
                className="mt-8 max-w-md rounded-2xl border border-border bg-foreground/[0.03] p-4 text-[15px] leading-relaxed"
              >
                <span className="font-bold">Mi dovodimo, vi zatvarate.</span>{" "}
                <span className="text-muted-foreground">
                  Sve do ovog poziva je naš posao. Od poziva nadalje, vaš.
                </span>
              </motion.p>
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
        </div>

        <Climax />

        <div className="container-x">
          <Chapter
            n={7}
            onSpine={false}
            when="I onda"
            title="Nikolin bazen"
            accent="postaje vaša sledeća reklama."
            line="Snimamo prvo kupanje i Nikolu koji priča kako je prošlo. Kampanje palimo pre sezone, gasimo oglase koji ne rade i pojačavamo one koji donose upite. Tražimo sledećih sto."
            work={[
              { icon: Video, t: "Video studija slučaja" },
              { icon: FlaskConical, t: "Testiranje kreativa" },
              { icon: TrendingUp, t: "Optimizacija svaki dan" },
            ]}
            scene={
              <Scene
                src={`${IMG}/snimanje-bazen.webp`}
                alt="Ekipa snima Nikolu na ivici bazena"
              />
            }
            artifact={<CampaignCard />}
          />
        </div>

        <Results />
        <Team />
        <FinalCta />

        <CalculatorOverlay
          open={calcOpen}
          onClose={() => setCalcOpen(false)}
          title="Kalkulator bazena"
          src={CALC}
        />
      </div>
    </MotionConfig>
  );
}
