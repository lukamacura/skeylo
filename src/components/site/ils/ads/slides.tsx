"use client";

import { useEffect, useState, type ComponentType } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Check,
  Database,
  Hand,
  Heart,
  Layers,
  MapPin,
  Search,
  Sunrise,
  Wallet,
  Target,
  TrendingDown,
  TriangleAlert,
  X,
  Zap,
  ShieldAlert,
} from "lucide-react";
import {
  Count,
  G_BLUE,
  G_GREEN,
  G_RED,
  G_YELLOW,
  GoogleLogo,
  Headline,
  IVORY,
  Kicker,
  LINE,
  MetaLogo,
  MUTED,
  ROSE,
  ROSE_SOFT,
  SURFACE,
  Slide,
  Sub,
  item,
} from "./primitives";
import { Today } from "./Today";

const CARD = "rounded-[20px] border";
const QUERY = "laserska epilacija novi sad";
const LINK_BLUE = "#8ab4f8";

/* ------------------------------------------------------------------------ */
/* 01 · Cover                                                                 */
/* ------------------------------------------------------------------------ */

/* The Google Ads mark rebuilt from three strokes so it can draw itself: the
   yellow arm, the blue arm over it, then the green dot lands. */
function AdsMark() {
  const draw = (delay: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: {
      pathLength: { delay, duration: 0.7, ease: [0.65, 0, 0.35, 1] as const },
      opacity: { delay, duration: 0.01 },
    },
  });
  return (
    <svg viewBox="0 0 1603 1450" className="w-full" aria-label="Google Ads">
      <motion.line
        x1={800}
        y1={265}
        x2={273}
        y2={1185}
        stroke={G_YELLOW}
        strokeWidth={530}
        strokeLinecap="round"
        {...draw(0.25)}
      />
      <motion.circle
        cx={273}
        cy={1185}
        r={265}
        fill={G_GREEN}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ transformOrigin: "273px 1185px" }}
        transition={{
          delay: 1.15,
          type: "spring",
          stiffness: 380,
          damping: 14,
        }}
      />
      <motion.line
        x1={800}
        y1={265}
        x2={1330}
        y2={1185}
        stroke={G_BLUE}
        strokeWidth={530}
        strokeLinecap="round"
        {...draw(0.65)}
      />
    </svg>
  );
}

function Cover() {
  return (
    <Slide center>
      <motion.div variants={item} className="relative w-[min(40vw,170px)]">
        <motion.div
          aria-hidden
          className="absolute -inset-10 -z-10 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(66,133,244,0.28), rgba(251,188,4,0.12) 50%, transparent 72%)",
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <AdsMark />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.35, duration: 0.5 }}
        className="mt-5 text-[clamp(1.6rem,7vw,2.3rem)] font-medium tracking-tight"
        style={{ color: "#d6d0d2" }}
      >
        Google Ads
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="mt-8 flex flex-col items-center"
      >
        <p
          className="mb-3 text-[11px] font-bold uppercase tracking-[0.26em]"
          style={{ color: ROSE }}
        >
          Za Infinity Laser Studio
        </p>
        <h1
          className="text-[clamp(1.9rem,8.4vw,3.2rem)] font-semibold leading-[1.05]"
          style={{ fontFamily: "var(--font-ils-serif), Georgia, serif" }}
        >
          Novi kanal <em style={{ color: ROSE_SOFT }}>rasta.</em>
        </h1>
        <p className="mt-3 text-[15px]" style={{ color: MUTED }}>
          Zašto, koliko i zašto baš sada.
        </p>
      </motion.div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 02 · Why                                                                   */
/* ------------------------------------------------------------------------ */

/* A feed that never stops moving: the thumb keeps going past everything. */
function Feed() {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-xl"
      style={{ background: "#0f0a0b" }}
    >
      <motion.div
        className="flex flex-col gap-2 p-2"
        animate={{ y: [0, -132] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="flex h-[58px] flex-none gap-1.5 rounded-lg p-1.5"
            style={{ background: "#2a1f23" }}
          >
            <div
              className="h-full w-[46px] flex-none rounded-md"
              style={{
                background: [
                  "linear-gradient(135deg, #f58529, #dd2a7b)",
                  "linear-gradient(135deg, #5b7cfa, #9b6bff)",
                  "linear-gradient(135deg, #7a5c62, #cfa29b)",
                ][i % 3],
              }}
            />
            <div className="flex flex-1 flex-col justify-center gap-1.5">
              <span className="h-1.5 w-[80%] rounded-full bg-white/25" />
              <span className="h-1.5 w-[55%] rounded-full bg-white/15" />
            </div>
          </div>
        ))}
      </motion.div>
      <motion.span
        className="absolute right-2 top-1/2"
        animate={{ y: [14, -22], opacity: [0, 1, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
        style={{ color: MUTED }}
      >
        <Hand size={18} />
      </motion.span>
    </div>
  );
}

/* The query types itself out, waits, and starts over. */
function SearchBar({ compact = false }: { compact?: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setN((v) => (v >= QUERY.length + 18 ? 0 : v + 1)),
      70,
    );
    return () => clearInterval(id);
  }, []);
  const text = QUERY.slice(0, Math.min(n, QUERY.length));
  return (
    <div
      className={`flex w-full items-center gap-2 rounded-full ${compact ? "px-3 py-2" : "px-4 py-2.5"}`}
      style={{ background: "#303134", color: "#e8eaed" }}
    >
      <Search size={compact ? 13 : 15} style={{ color: "#9aa0a6" }} />
      <span
        className={`min-w-0 flex-1 truncate text-left ${compact ? "text-[11.5px]" : "text-[13px]"}`}
      >
        {text}
        <motion.span
          aria-hidden
          className="ml-px inline-block h-[1em] w-px align-[-2px]"
          style={{ background: "#e8eaed" }}
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </span>
    </div>
  );
}

function SearchVisual() {
  return (
    <div
      className="flex h-full w-full flex-col justify-center gap-2 rounded-xl p-2.5"
      style={{ background: "#202124" }}
    >
      <p className="text-center text-[15px] font-semibold tracking-tight">
        <span style={{ color: G_BLUE }}>G</span>
        <span style={{ color: G_RED }}>o</span>
        <span style={{ color: G_YELLOW }}>o</span>
        <span style={{ color: G_BLUE }}>g</span>
        <span style={{ color: G_GREEN }}>l</span>
        <span style={{ color: G_RED }}>e</span>
      </p>
      <SearchBar compact />
    </div>
  );
}

function ChannelCard({
  visual,
  icon: Icon,
  name,
  tag,
  line,
  hot = false,
}: {
  visual: React.ReactNode;
  icon: ComponentType<{ size?: number }>;
  name: string;
  tag: string;
  line: string;
  hot?: boolean;
}) {
  return (
    <motion.div
      variants={item}
      className={`${CARD} flex gap-3 p-3 md:flex-col md:p-4`}
      style={{
        background: SURFACE,
        borderColor: hot ? "rgba(230,194,186,0.5)" : LINE,
        boxShadow: hot ? "0 0 40px -12px rgba(207,162,155,0.45)" : undefined,
      }}
    >
      <div className="h-[104px] w-[42%] flex-none md:h-[150px] md:w-full">
        {visual}
      </div>
      <div className="min-w-0 py-0.5">
        <p className="flex items-center gap-1.5 text-[15px] font-bold md:text-[17px]">
          <Icon size={16} />
          {name}
        </p>
        <span
          className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: hot ? "rgba(52,168,83,0.16)" : "rgba(255,255,255,0.06)",
            color: hot ? "#7fd99a" : MUTED,
          }}
        >
          {tag}
        </span>
        <p
          className="mt-1.5 text-[13.5px] leading-snug"
          style={{ color: MUTED }}
        >
          {line}
        </p>
      </div>
    </motion.div>
  );
}

function Why() {
  return (
    <Slide>
      <Kicker>Zašto Google</Kicker>
      <Headline>
        {
          "Na {{meta}}Meti vas vide [[usput]]. Na {{google}}Google-u vas [[traže]]."
        }
      </Headline>
      <div className="mt-5 grid gap-3 md:mt-7 md:grid-cols-2 md:gap-4">
        <ChannelCard
          visual={<Feed />}
          icon={MetaLogo}
          name="Meta"
          tag="Skroluje"
          line="Ne traži rešenje. Oglas mora da je prekine i ubedi."
        />
        <ChannelCard
          visual={<SearchVisual />}
          icon={GoogleLogo}
          name="Google"
          tag="Traži rešenje"
          line="Ima problem i svesno traži tretman, sada."
          hot
        />
      </div>
      <motion.p
        variants={item}
        className="mt-4 text-[14px] font-semibold"
        style={{ color: ROSE_SOFT }}
      >
        Meta ostaje. Google dodaje one koje već traže.
      </motion.p>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 03 · Revenue                                                               */
/* ------------------------------------------------------------------------ */

const META_COLOR = "#0866FF";

function Bar({
  height,
  color,
  delay,
  hatched = false,
  children,
}: {
  height: string;
  color: string;
  delay: number;
  hatched?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      className="relative flex w-full items-center justify-center text-[12px] font-bold"
      style={{
        height,
        transformOrigin: "bottom",
        background: hatched
          ? `repeating-linear-gradient(135deg, ${color}55 0 6px, ${color}22 6px 12px)`
          : color,
        border: hatched ? `1.5px dashed ${color}` : undefined,
        color: "#fff",
      }}
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Revenue() {
  return (
    <Slide>
      <Kicker>Šta to donosi</Kicker>
      <Headline>{"Novi kanal = [[2–3×]] trenutnog prihoda."}</Headline>

      <motion.div
        variants={item}
        className={`${CARD} mt-5 p-4 md:mt-7 md:p-6`}
        style={{ background: SURFACE, borderColor: LINE }}
      >
        <div className="flex h-[200px] items-end gap-5 md:h-[240px] md:gap-10">
          <div className="flex h-full flex-1 flex-col justify-end">
            <p className="mb-1.5 text-center text-[13px] font-bold">
              ~<Count to={3} delay={0.3} duration={0.6} />M RSD
            </p>
            <div className="flex h-[30%] flex-col overflow-hidden rounded-t-xl">
              <Bar height="100%" color={META_COLOR} delay={0.3}>
                <MetaLogo size={11} mono className="mr-1" />
                Meta
              </Bar>
            </div>
            <p
              className="mt-2 text-center text-[12px]"
              style={{ color: MUTED }}
            >
              Danas
            </p>
          </div>

          <div className="flex h-full flex-1 flex-col justify-end">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="mb-1.5 text-center text-[13px] font-bold"
              style={{ color: ROSE_SOFT }}
            >
              6–9M RSD
            </motion.p>
            <div className="flex h-[90%] flex-col overflow-hidden rounded-t-xl">
              <Bar height="33.4%" color={G_GREEN} delay={1.2} hatched />
              <Bar height="33.3%" color={G_GREEN} delay={0.85}>
                <GoogleLogo size={12} mono className="mr-1" />
                Google
              </Bar>
              <Bar height="33.3%" color={META_COLOR} delay={0.5}>
                <MetaLogo size={11} mono className="mr-1" />
                Meta
              </Bar>
            </div>
            <p
              className="mt-2 text-center text-[12px]"
              style={{ color: MUTED }}
            >
              Sa Google-om
            </p>
          </div>
        </div>
        <p className="mt-3 text-center text-[11px]" style={{ color: MUTED }}>
          Mesečni promet · Meta danas ~3.000.000 RSD
        </p>
      </motion.div>

      <motion.div
        variants={item}
        className="mt-3 flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: "rgba(52,168,83,0.1)" }}
      >
        <Target size={20} className="flex-none" style={{ color: "#7fd99a" }} />
        <p className="text-[13.5px] leading-snug">
          <b>~700–1.200 RSD</b> po rezervaciji
          <span style={{ color: MUTED }}> · isplativo je sve do 3.195 RSD</span>
        </p>
      </motion.div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 04 · LTV                                                                   */
/* ------------------------------------------------------------------------ */

/* Računica napisana rukom na listu iz sveske na kockice: svaki red se
   ispiše redom, crta ispod pre zbira, a na kraju se granica zaokruži. */
const INK = "#22305a";
const PEN_RED = "#c8433a";
const PEN_GREEN = "#1f8a4c";
const HAND = "var(--font-ils-hand), 'Bradley Hand', 'Segoe Print', cursive";

type CalcLine =
  | {
      kind: "row";
      op?: string;
      num: string;
      note: string;
      key?: boolean;
      circle?: boolean;
    }
  | { kind: "rule" };

const CALC: CalcLine[] = [
  { kind: "row", num: "18.000", note: "vrednost klijentkinje (LTV)" },
  { kind: "row", op: "×", num: "75%", note: "marža" },
  { kind: "rule" },
  { kind: "row", op: "=", num: "13.500", note: "zarada po klijentkinji" },
  { kind: "row", op: "÷", num: "3", note: "LTV:CAC 3:1" },
  { kind: "rule" },
  {
    kind: "row",
    op: "=",
    num: "4.500",
    note: "max cena plaćanja nove klijentkinje",
    key: true,
  },
  { kind: "row", op: "×", num: "71%", note: "zakazanih zaista dođe" },
  { kind: "rule" },
  {
    kind: "row",
    op: "=",
    num: "3.195",
    note: "max cena jedne rezervacije",
    key: true,
    circle: true,
  },
];

const START = 0.6;
const STEP = 0.32;
const ease = [0.45, 0, 0.25, 1] as const;

/* Writing reveal: the line uncovers left to right, like a pen moving. */
function Written({
  delay,
  children,
  className = "",
  style,
}: {
  delay: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ clipPath: "inset(-40% 100% -40% -10%)", opacity: 0 }}
      animate={{ clipPath: "inset(-40% -10% -40% -10%)", opacity: 1 }}
      transition={{
        delay,
        duration: 0.45,
        ease,
        opacity: { delay, duration: 0.1 },
      }}
    >
      {children}
    </motion.div>
  );
}

function Paper() {
  let t = START;
  const timed = CALC.map((line) => {
    const at = t;
    t += line.kind === "rule" ? STEP * 0.6 : STEP;
    return { line, at };
  });
  const end = t + 0.2;

  return (
    <motion.div
      variants={item}
      className="relative mt-5 rounded-[6px] px-4 pb-4 pt-4 md:mt-7 md:px-7 md:pb-6 md:pt-6"
      style={{
        rotate: -1.2,
        color: INK,
        fontFamily: HAND,
        backgroundColor: "#fbf7ef",
        backgroundImage:
          "linear-gradient(rgba(70,110,180,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(70,110,180,0.13) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
        backgroundPosition: "-1px -1px",
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.6) inset, 0 18px 40px -12px rgba(0,0,0,0.7), 0 4px 10px rgba(0,0,0,0.35)",
      }}
    >
      {/* the red margin line of a school notebook */}
      <span
        aria-hidden
        className="absolute bottom-0 top-0 left-[44px] w-px md:left-[64px]"
        style={{ background: "rgba(200,67,58,0.35)" }}
      />

      <div className="relative flex flex-col">
        <Written
          delay={START - 0.3}
          className="mb-1 flex items-center gap-1.5 pl-[30px] text-[16px] leading-tight md:pl-[42px] md:text-[19px]"
          style={{ color: "rgba(34,48,90,0.6)" }}
        >
          <Database size={14} className="flex-none" />
          izvučeno iz baze podataka
        </Written>
        {timed.map(({ line, at }, i) =>
          line.kind === "rule" ? (
            <svg
              key={i}
              aria-hidden
              viewBox="0 0 100 4"
              preserveAspectRatio="none"
              className="my-0.5 ml-[18px] h-[5px] w-[92px] md:ml-[30px] md:w-[110px]"
            >
              <motion.path
                d="M1 2.4 C 30 1.4, 65 3, 99 1.8"
                stroke={INK}
                strokeWidth={1.6}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  delay: at,
                  duration: 0.25,
                  ease,
                  opacity: { delay: at, duration: 0.05 },
                }}
              />
            </svg>
          ) : (
            <Written
              key={i}
              delay={at}
              className="grid grid-cols-[18px_74px_1fr] items-baseline gap-x-3 md:grid-cols-[30px_92px_1fr]"
            >
              <span className="text-[22px] leading-[1.15] md:text-[26px]">
                {line.op}
              </span>
              <span
                className="relative text-right text-[25px] font-bold leading-[1.15] md:text-[30px]"
                style={{ color: line.key ? PEN_RED : INK }}
              >
                {line.num}
                {line.circle && (
                  <svg
                    aria-hidden
                    viewBox="0 0 120 60"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute -inset-x-3 -inset-y-2 h-[calc(100%+16px)] w-[calc(100%+24px)] overflow-visible"
                  >
                    <motion.path
                      d="M64 4 C 25 2, 4 14, 5 31 C 6 50, 40 58, 70 56 C 103 54, 118 41, 115 25 C 112 9, 86 2, 52 6"
                      stroke={PEN_RED}
                      strokeWidth={2}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        delay: end,
                        duration: 0.6,
                        ease,
                        opacity: { delay: end, duration: 0.05 },
                      }}
                    />
                  </svg>
                )}
              </span>
              <span
                className={`text-[17px] leading-[1.05] md:text-[20px] ${line.key ? "font-bold" : ""}`}
                style={{ color: line.key ? PEN_RED : "rgba(34,48,90,0.75)" }}
              >
                {line.note}
              </span>
            </Written>
          ),
        )}

        {/* the comparison, scribbled in green under the result */}
        <Written
          delay={end + 0.7}
          className="mt-3 flex items-baseline gap-2 border-t border-dashed pt-2 text-[19px] leading-tight md:text-[23px]"
          style={{ color: PEN_GREEN, borderColor: "rgba(34,48,90,0.25)" }}
        >
          <Check size={18} className="flex-none self-center" />
          <span>
            Google: <b className="text-[24px] md:text-[28px]">700–1.200</b> po
            rezervaciji
          </span>
        </Written>
      </div>
    </motion.div>
  );
}

function Ltv() {
  return (
    <Slide>
      <Kicker>Zašto se isplati</Kicker>
      <Headline>{"Jedna klijentkinja vredi [[~18.000 RSD]]."}</Headline>
      <Sub>
        Paket od ~36.600 RSD kupi 36% novih, i taj udeo raste svakog meseca.
        Računamo sa prosekom svih klijentkinja.
      </Sub>

      <Paper />

      <motion.div
        variants={item}
        className="mt-5 flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: "rgba(52,168,83,0.1)" }}
      >
        <TrendingDown
          size={20}
          className="flex-none"
          style={{ color: "#7fd99a" }}
        />
        <p className="text-[13.5px] leading-snug">
          <b>3–4× jeftinije</b> od granice isplativosti
          <span style={{ color: MUTED }}> · paketi se plaćaju unapred</span>
        </p>
      </motion.div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 05 · Budget                                                                */
/* ------------------------------------------------------------------------ */

/* Faza 1 iz plana: dnevni budžet po gradu × 30 dana. */
const CITIES = [
  { city: "Novi Sad", day: "1.200–1.500", month: "36–45.000", share: 0.68 },
  { city: "Sombor", day: "500–700", month: "15–21.000", share: 0.32 },
];

function Budget() {
  return (
    <Slide>
      <Kicker>Budžet</Kicker>
      <Headline>{"Start: [[~50–65.000 RSD]] mesečno."}</Headline>
      <Sub>Oko 440–560 €. Dva grada, odvojene kampanje.</Sub>

      <motion.div
        variants={item}
        className={`${CARD} mt-5 flex flex-col gap-4 p-4 md:mt-7 md:p-6`}
        style={{ background: SURFACE, borderColor: LINE }}
      >
        {CITIES.map((c, i) => (
          <div key={c.city}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="flex items-center gap-1.5 text-[15px] font-bold">
                <MapPin size={15} style={{ color: ROSE_SOFT }} />
                {c.city}
              </p>
              <p className="text-[15px] font-bold">
                {c.month}{" "}
                <span
                  className="text-[12px] font-semibold"
                  style={{ color: MUTED }}
                >
                  RSD
                </span>
              </p>
            </div>
            <div
              className="mt-2 h-2.5 overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${c.share * 100}%`,
                  transformOrigin: "left",
                  background: "linear-gradient(90deg, #8f5f58, #e6c2ba)",
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: 0.5 + i * 0.25,
                  duration: 0.8,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
              />
            </div>
            <p className="mt-1.5 text-[12px]" style={{ color: MUTED }}>
              {c.day} RSD dnevno
            </p>
          </div>
        ))}
      </motion.div>

      <motion.div
        variants={item}
        className="mt-3 flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: "rgba(52,168,83,0.1)" }}
      >
        <Target size={20} className="flex-none" style={{ color: "#7fd99a" }} />
        <p className="text-[13.5px] leading-snug">
          <b>≈ 40–90 rezervacija</b> mesečno
          <span style={{ color: MUTED }}>
            {" "}
            pri 700–1.200 RSD po rezervaciji
          </span>
        </p>
      </motion.div>

      <motion.p
        variants={item}
        className="mt-3 flex items-start gap-2 text-[13px] leading-snug"
        style={{ color: MUTED }}
      >
        <Wallet
          size={15}
          className="mt-0.5 flex-none"
          style={{ color: ROSE }}
        />
        Najviše 70 RSD po kliku na startu. Budžet podižemo tek kad podaci
        potvrde cenu rezervacije.
      </motion.p>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 06 · Competition                                                           */
/* ------------------------------------------------------------------------ */

function Pill({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold"
      style={{
        background: ok ? "rgba(255,255,255,0.06)" : "rgba(234,67,53,0.12)",
        color: ok ? IVORY : "#ff8a80",
      }}
    >
      {ok ? <Check size={14} /> : <X size={14} />}
      {children}
    </span>
  );
}

function Competition() {
  return (
    <Slide>
      <Kicker>Konkurencija</Kicker>
      <Headline>{"Konkurencija je [[već tamo]]."}</Headline>
      <Sub>Brana Estetic plaća prvo mesto za „{QUERY}“.</Sub>

      <motion.div
        variants={item}
        className={`${CARD} relative mt-4 aspect-[1000/600] w-full max-w-[600px] overflow-hidden md:mt-6`}
        style={{ borderColor: LINE, background: "#202124" }}
      >
        <Image
          src="/ils/konkurencija.webp"
          alt="Google pretraga „laserska epilacija novi sad“: sponzorisani rezultati, Brana Estetic na prvom mestu"
          width={1000}
          height={1103}
          sizes="(max-width: 640px) 100vw, 600px"
          className="w-full"
          priority
        />
        <motion.div
          aria-hidden
          className="absolute inset-x-[1%] top-[25.5%] h-[30%] rounded-xl"
          style={{ border: `2.5px solid ${ROSE_SOFT}` }}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{
            opacity: 1,
            scale: 1,
            boxShadow: [
              "0 0 0 0 rgba(230,194,186,0.5)",
              "0 0 0 10px rgba(230,194,186,0)",
            ],
          }}
          transition={{
            delay: 0.7,
            duration: 0.4,
            boxShadow: { delay: 1.1, duration: 1.6, repeat: Infinity },
          }}
        />
        <motion.span
          className="absolute right-[3%] top-[18%] rounded-full px-2.5 py-1 text-[11px] font-extrabold"
          style={{ background: ROSE_SOFT, color: "#1a1113" }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          1. mesto
        </motion.span>
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-12"
          style={{ background: "linear-gradient(transparent, #202124)" }}
        />
      </motion.div>

      <motion.div variants={item} className="mt-4 flex flex-wrap gap-2">
        <Pill ok>Plaćaju vrh pretrage</Pill>
        <Pill>Spor sajt</Pill>
        <Pill>Loš funnel</Pill>
      </motion.div>
      <motion.p
        variants={item}
        className="mt-3 text-[14px] font-semibold"
        style={{ color: ROSE_SOFT }}
      >
        Klik plate, a klijentkinju izgube na sajtu.
      </motion.p>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 07 · Speed & quality                                                       */
/* ------------------------------------------------------------------------ */

function Gauge({
  value,
  label,
  color,
  shown,
  delay,
}: {
  value: number;
  label: string;
  color: string;
  shown?: string;
  delay: number;
}) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-[66px] w-[66px] flex-none">
        <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
          <circle cx={32} cy={32} r={r} fill={`${color}1f`} stroke="none" />
          <motion.circle
            cx={32}
            cy={32}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - value / 100) }}
            transition={{ delay, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <span
          className="absolute inset-0 grid place-items-center text-[19px] font-bold"
          style={{ color }}
        >
          {shown ?? <Count to={value} delay={delay} />}
        </span>
      </div>
      <p className="text-[13.5px] font-semibold leading-tight">{label}</p>
    </div>
  );
}

function Speed() {
  return (
    <Slide>
      <Kicker>Kvalitet sajta</Kicker>
      <Headline>{"Google [[nagrađuje]] brz i jasan sajt."}</Headline>
      <Sub>Bolji sajt znači jeftiniji klik i više mesto od konkurencije.</Sub>

      <motion.div
        variants={item}
        className="mt-5 flex items-center gap-4 md:mt-7 md:gap-8"
      >
        <div className="relative w-[34%] max-w-[150px] flex-none">
          <div
            className="overflow-hidden rounded-[18px] border-[3px]"
            style={{ borderColor: "#3a2c30" }}
          >
            <Image
              src="/ils/brana-sajt.webp"
              alt="Sajt Brana Estetic na telefonu"
              width={262}
              height={525}
              className="w-full opacity-80 grayscale-[0.3]"
            />
          </div>
          <motion.span
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold text-white"
            style={{ background: G_RED }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 1.2,
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
          >
            22,9 s učitavanje
          </motion.span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Gauge value={40} label="Brana Estetic" color={G_RED} delay={0.5} />
          <Gauge
            value={95}
            shown="90+"
            label="Infinity Laser Studio"
            color={G_GREEN}
            delay={0.9}
          />

          {/* Rukom pisana beleška sa strelicom ka PageSpeed izveštaju ispod. */}
          <motion.div
            className="relative mt-1 pr-1"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.4 }}
          >
            <p
              className="text-[17px] leading-[1.05] md:text-[20px]"
              style={{ fontFamily: HAND, color: ROSE_SOFT, rotate: "-3deg" }}
            >
              Uradio sam analizu, rade reklame sa ovakvim sajtom{" "}
              <span className="not-italic" style={{ fontFamily: "initial" }}>
                😄
              </span>
            </p>
            <svg
              aria-hidden
              viewBox="0 0 60 56"
              className="pointer-events-none absolute left-[18%] top-full z-10 h-[52px] w-[56px]"
              fill="none"
              stroke={ROSE_SOFT}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M43 19 C 44 32, 33 42, 14 50"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.9, duration: 0.5, ease: "easeInOut" }}
              />
              <motion.path
                d="M27 49 L 13 51 L 18 38"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 2.35, duration: 0.2 }}
              />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Dokaz: isečak reda sa ocenama iz PageSpeed izveštaja (1200×780). */}
      <motion.div
        variants={item}
        className={`${CARD} mt-6 overflow-hidden`}
        style={{ borderColor: LINE, background: SURFACE }}
      >
        <div className="aspect-[1110/190] w-full overflow-hidden bg-white">
          <Image
            src="/ils/brana.webp"
            alt="Google PageSpeed analiza sajta Brana Estetic: Performance 40"
            width={1200}
            height={780}
            sizes="(max-width: 640px) 110vw, 560px"
            className="max-w-none"
            style={{
              width: `${(1200 / 1110) * 100}%`,
              marginLeft: `${(-40 / 1110) * 100}%`,
            }}
          />
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className={`${CARD} mt-3 grid grid-cols-2 overflow-hidden`}
        style={{ borderColor: LINE, background: SURFACE }}
      >
        <div className="p-3">
          <p
            className="text-[11px] uppercase tracking-[0.14em]"
            style={{ color: MUTED }}
          >
            Quality Score
          </p>
          <p
            className="mt-0.5 text-[15px] font-bold"
            style={{ color: "#ff8a80" }}
          >
            Brana 3–4/10
          </p>
        </div>
        <div className="border-l p-3" style={{ borderColor: LINE }}>
          <p
            className="text-[11px] uppercase tracking-[0.14em]"
            style={{ color: MUTED }}
          >
            Quality Score
          </p>
          <p
            className="mt-0.5 text-[15px] font-bold"
            style={{ color: "#7fd99a" }}
          >
            Infinity 8–10/10
          </p>
        </div>
      </motion.div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 08 · Setup                                                                 */
/* ------------------------------------------------------------------------ */

/* Screenshots iz naloga koji se već sprema. Svaka kartica je isečak 4:3 iz
   celog screenshota: x, y, w su u pikselima originala, a slika se pomera
   procentima širine (margine u % uvek računaju od širine). */
const SHOTS = [
  {
    src: "/ils/setup1.webp",
    size: [1296, 1582],
    crop: [80, 500, 1050],
    title: "Oglas vodi na vaš sajt",
    note: "infinitylaserstudio.com",
  },
  {
    src: "/ils/setup2.webp",
    size: [1374, 1622],
    crop: [165, 560, 1050],
    title: "10 naslova",
    note: "Google sam testira kombinacije",
  },
  {
    src: "/ils/setup3.webp",
    size: [1322, 858],
    crop: [120, 60, 1050],
    title: "4 opisa",
    note: "Bez bola, cene online, zakazivanje",
  },
  {
    src: "/ils/bid_strategy.webp",
    size: [1526, 1094],
    crop: [125, 60, 1290],
    title: "Plaćamo samo klik",
    note: "Najviše 0,60 $ (~70 RSD) po kliku",
  },
] as const;

function Shot({ shot }: { shot: (typeof SHOTS)[number] }) {
  const [W, H] = shot.size;
  const [x, y, w] = shot.crop;
  return (
    <div className="aspect-[4/3] w-full overflow-hidden bg-white">
      <Image
        src={shot.src}
        alt={`${shot.title}: ${shot.note}`}
        width={W}
        height={H}
        sizes="(max-width: 640px) 120vw, 700px"
        className="max-w-none"
        style={{
          width: `${(W / w) * 100}%`,
          marginLeft: `${(-x / w) * 100}%`,
          marginTop: `${(-y / w) * 100}%`,
        }}
      />
    </div>
  );
}

function Setup() {
  const [i, setI] = useState(0);
  const [tick, setTick] = useState(0);
  /* Kartice se same smenjuju; tap ide na sledeću i resetuje tajmer. */
  useEffect(() => {
    const id = setTimeout(() => setI((v) => (v + 1) % SHOTS.length), 3200);
    return () => clearTimeout(id);
  }, [i, tick]);
  const next = () => {
    setI((v) => (v + 1) % SHOTS.length);
    setTick((t) => t + 1);
  };

  return (
    <Slide>
      <Kicker>Već pripremljeno</Kicker>
      <Headline>{"Kampanja je [[spremna]] za start."}</Headline>

      <motion.div variants={item} className="mt-6 w-full max-w-[520px]">
        <button
          type="button"
          onClick={next}
          aria-label="Sledeći screenshot"
          className="relative block w-full pt-4 text-left"
        >
          {SHOTS.map((shot, k) => {
            const depth = (k - i + SHOTS.length) % SHOTS.length;
            return (
              <motion.div
                key={shot.src}
                className={`${depth === 0 ? "relative" : "absolute inset-x-0 bottom-0"} overflow-hidden rounded-2xl border`}
                style={{
                  borderColor: LINE,
                  zIndex: SHOTS.length - depth,
                  boxShadow: "0 18px 40px -18px rgba(0,0,0,0.8)",
                }}
                initial={false}
                animate={{
                  y: depth * -8,
                  scale: 1 - depth * 0.045,
                  opacity: depth > 2 ? 0 : 1 - depth * 0.25,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Shot shot={shot} />
              </motion.div>
            );
          })}
        </button>

        <div className="mt-3 flex items-start justify-between gap-3">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[16px] font-bold">{SHOTS[i].title}</p>
            <p className="text-[13px]" style={{ color: MUTED }}>
              {SHOTS[i].note}
            </p>
          </motion.div>
          <div className="mt-2 flex flex-none gap-1.5">
            {SHOTS.map((shot, k) => (
              <span
                key={shot.src}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: k === i ? 18 : 6,
                  background: k === i ? ROSE_SOFT : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className="mt-4 flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: "rgba(66,133,244,0.12)" }}
      >
        <span
          className="text-[22px] font-medium leading-none"
          style={{ color: LINK_BLUE }}
        >
          90,2%
        </span>
        <p className="text-[13px] leading-snug" style={{ color: MUTED }}>
          Google ocena optimizacije kampanje, pre samog starta.
        </p>
      </motion.div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 09 · Capacity                                                              */
/* ------------------------------------------------------------------------ */

const READY = [
  [Heart, "Želja", "Spremni smo za rast", true],
  [Layers, "Sistem", "Automatizovan sistem zakazivanja", true],
  [ShieldAlert, "Problem", "Postoji problem za koji imamo rešenje", true],
  [CalendarCheck, "Kapacitet", "Još je nestabilan", false],
] as const;

function Capacity() {
  return (
    <Slide>
      <Kicker>Jedna molba</Kicker>
      <Headline>{"Sve imamo, osim [[slobodnih termina]]."}</Headline>
      <Sub>
        Molimo da se da sve od sebe da kapacitet poraste za najmanje 50%, kako
        bi i Meta i Google zakazivali bez zastoja i povećali konverziju
        maksimalno.
      </Sub>

      <motion.div
        variants={item}
        className={`${CARD} mt-5 flex flex-col gap-2.5 p-3 md:mt-7 md:p-4`}
        style={{ background: SURFACE, borderColor: LINE }}
      >
        {READY.map(([Icon, title, note, ok]) => (
          <div key={title} className="flex items-center gap-3">
            <span
              className="grid h-9 w-9 flex-none place-items-center rounded-full"
              style={{
                background: ok
                  ? "rgba(207,162,155,0.16)"
                  : "rgba(251,188,4,0.14)",
                color: ok ? ROSE_SOFT : G_YELLOW,
              }}
            >
              <Icon size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-bold leading-tight">{title}</p>
              <p className="text-[12.5px]" style={{ color: MUTED }}>
                {note}
              </p>
            </div>
            {ok ? (
              <Check size={18} style={{ color: "#7fd99a" }} />
            ) : (
              <TriangleAlert size={18} style={{ color: G_YELLOW }} />
            )}
          </div>
        ))}
      </motion.div>

      <motion.div variants={item} className="mt-4">
        <div className="flex items-baseline justify-between text-[12.5px]">
          <span style={{ color: MUTED }}>Danas</span>
          <span className="font-bold" style={{ color: ROSE_SOFT }}>
            Cilj: +50% termina
          </span>
        </div>
        <div
          className="relative mt-1.5 h-3 overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: "66.7%", background: "rgba(255,255,255,0.22)" }}
          />
          <motion.div
            className="absolute inset-y-0 rounded-r-full"
            style={{
              left: "66.7%",
              width: "33.3%",
              transformOrigin: "left",
              background: "linear-gradient(90deg, #8f5f58, #e6c2ba)",
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className={`${CARD} mt-4 flex items-center gap-3 px-4 py-3`}
        style={{
          background: "rgba(207,162,155,0.1)",
          borderColor: "rgba(230,194,186,0.35)",
        }}
      >
        <Sunrise size={22} className="flex-none" style={{ color: ROSE_SOFT }} />
        <p className="text-[13.5px] leading-snug">
          <span
            className="mr-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: ROSE }}
          >
            Predlog
          </span>
          <b>Jutarnji termini uz 10% popusta</b>
          <span style={{ color: MUTED }}>
            {" "}
            za svaku klijentkinju koja se zakaže ujutru.
          </span>
        </p>
      </motion.div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 10 · Close                                                                 */
/* ------------------------------------------------------------------------ */

function AdResult({ ours }: { ours?: boolean }) {
  return (
    <div
      className={`${CARD} p-3 text-left`}
      style={{
        background: "#202124",
        borderColor: ours ? "rgba(230,194,186,0.6)" : "transparent",
        boxShadow: ours ? "0 0 36px -10px rgba(207,162,155,0.55)" : undefined,
        opacity: ours ? 1 : 0.55,
      }}
    >
      <p className="text-[11px]" style={{ color: "#bdc1c6" }}>
        <b>Sponzorisano</b> ·{" "}
        {ours ? "infinitylaserstudio.com" : "branaestetic.com"}
      </p>
      <p
        className="mt-0.5 text-[14.5px] leading-snug"
        style={{ color: LINK_BLUE }}
      >
        {ours
          ? "Laserska Epilacija Novi Sad | Bezbolno Uklanjanje Dlaka"
          : "Laserska epilacija Novi Sad - 40% Manje Dlačica Prvi Put"}
      </p>
      <p
        className="mt-0.5 text-[12px] leading-snug"
        style={{ color: "#bdc1c6" }}
      >
        {ours
          ? "Zaboravite na svakodnevno brijanje i iritacije. Bezbolna epilacija laserom u Novom Sadu."
          : "Trajno uklanjanje dlačica uz bezbolnu i bezbednu lasersku epilaciju…"}
      </p>
    </div>
  );
}

function Close() {
  const [swapped, setSwapped] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setSwapped(true), 1300);
    return () => clearTimeout(id);
  }, []);
  const order = swapped ? ["ours", "brana"] : ["brana", "ours"];

  return (
    <Slide>
      <Kicker>Zaključak</Kicker>
      <Headline>
        {"Infinity bi bio [[najbolji rezultat]] na stranici."}
      </Headline>

      <motion.div
        variants={item}
        className="mt-5 flex w-full max-w-[560px] flex-col gap-2.5 rounded-[22px] p-3 md:mt-7"
        style={{ background: "#171718" }}
      >
        <SearchBar compact />
        {order.map((k) => (
          <motion.div
            key={k}
            layout
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            <AdResult ours={k === "ours"} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={item} className="mt-5 grid grid-cols-3 gap-2">
        {(
          [
            [MapPin, "Novi Sad i Sombor"],
            [Search, "Samo pretrage sa namerom kupovine"],
            [Zap, "Brz sajt, jeftiniji klik"],
          ] as const
        ).map(([Icon, text]) => (
          <div
            key={text}
            className={`${CARD} flex flex-col items-start gap-2 p-3`}
            style={{ background: SURFACE, borderColor: LINE }}
          >
            <span
              className="grid h-8 w-8 place-items-center rounded-full"
              style={{ background: "rgba(207,162,155,0.16)", color: ROSE_SOFT }}
            >
              <Icon size={16} />
            </span>
            <p className="text-[12.5px] font-semibold leading-tight">{text}</p>
          </div>
        ))}
      </motion.div>
    </Slide>
  );
}

export const SLIDES: { id: string; label: string; Component: ComponentType }[] =
  [
    { id: "today", label: "Kako radimo danas", Component: Today },
    { id: "cover", label: "Google Ads", Component: Cover },
    { id: "why", label: "Zašto Google", Component: Why },
    { id: "revenue", label: "2–3× prihoda", Component: Revenue },
    { id: "ltv", label: "Zašto se isplati", Component: Ltv },
    { id: "budget", label: "Mesečni budžet", Component: Budget },
    { id: "competition", label: "Konkurencija", Component: Competition },
    { id: "speed", label: "Kvalitet sajta", Component: Speed },
    { id: "setup", label: "Kampanja spremna", Component: Setup },
    { id: "capacity", label: "Kapacitet +50%", Component: Capacity },
    { id: "close", label: "Zaključak", Component: Close },
  ];
