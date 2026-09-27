"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BadgePercent,
  BarChart3,
  CalendarCheck,
  Camera,
  Check,
  CreditCard,
  Eye,
  Facebook,
  Globe,
  Heart,
  Instagram,
  LayoutGrid,
  Lightbulb,
  Lock,
  Megaphone,
  Mic,
  MonitorPlay,
  MousePointerClick,
  Palette,
  PenLine,
  QrCode,
  ReceiptText,
  RefreshCw,
  Scissors,
  ShoppingCart,
  Smartphone,
  Store,
  Target,
  Ticket,
  Timer,
  TrendingUp,
  UserCog,
  Users,
  Video,
  X,
  Youtube,
} from "lucide-react";
import {
  Count,
  DISPLAY,
  EASE_OUT,
  Headline,
  MONO,
  NETO_RADIUS,
  RED,
  Slide,
  Sub,
  Visual,
  item,
  pop,
  useIsPhone,
  useSlideActive,
  useTheme,
  type Theme,
} from "./primitives";
import { NetoLogo, Ticker } from "./visuals";
import { ProofRow, rowA, rowB } from "../BentoGrid";
import CatalogDemo, { SITE_URL } from "./CatalogDemo";
import AppDemo from "./AppDemo";
import { DemoStage } from "./DemoStage";

const TILE_RADIUS = "14px 14px 14px 4px";
const META_BLUE = "#0866FF";

type IconType = React.ElementType;

/* ------------------------------------------------------------------------ */
/* Shared pieces                                                              */
/* ------------------------------------------------------------------------ */

/* Meta's loop, drawn as a stroke so it takes the colour of its tile. */
function MetaIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2.5 14.6c0-4.3 1.9-8.1 4.6-8.1 2 0 3.400 2 4.900 4.600 1.500 2.700 2.900 6.400 5.600 6.400 2.200 0 3.900-1.600 3.900-4.400 0-3.600-1.700-6.600-4.200-6.600-2 0-3.600 2-5.300 4.900-1.600 2.800-3.100 6.100-5.700 6.100-2.100 0-3.800-1.300-3.800-3z" />
    </svg>
  );
}

function MetaTile({ size = 56 }: { size?: number }) {
  return (
    <span
      className="grid flex-none place-items-center text-white"
      style={{
        width: size,
        height: size,
        background: META_BLUE,
        borderRadius: TILE_RADIUS,
      }}
    >
      <MetaIcon size={size * 0.54} />
    </span>
  );
}

/* Organic has no single logo, so it gets the networks themselves. */
function SocialTile({ size = 56 }: { size?: number }) {
  const s = size * 0.6;
  const icon = s * 0.56;
  const nets: [IconType, string][] = [
    [Instagram, "linear-gradient(45deg,#f9ce34,#ee2a7b 50%,#6228d7)"],
    [Facebook, "#1877F2"],
    [Youtube, "#FF0033"],
  ];
  return (
    <span
      className="flex flex-none items-center"
      style={{ height: size }}
      aria-hidden
    >
      {nets.map(([Icon, bg], i) => (
        <span
          key={i}
          className="grid place-items-center rounded-full text-white"
          style={{
            width: s,
            height: s,
            background: bg,
            marginLeft: i ? -s * 0.28 : 0,
            boxShadow: "0 0 0 2px rgba(255,255,255,0.9)",
            zIndex: 3 - i,
          }}
        >
          <Icon size={icon} />
        </span>
      ))}
    </span>
  );
}

function IconTile({
  icon: Icon,
  bg = RED,
  color = "#fff",
}: {
  icon: IconType;
  bg?: string;
  color?: string;
}) {
  return (
    <span
      className="grid h-[var(--h,56px)] w-[var(--h,56px)] flex-none place-items-center"
      style={{ background: bg, color, borderRadius: TILE_RADIUS }}
    >
      <Icon size={26} />
    </span>
  );
}

function Face({
  src,
  name,
  size = 56,
  className,
}: {
  src: string;
  name: string;
  size?: number;
  /* Sizes the face from CSS instead, for a face that changes with the screen. */
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className={`flex-none rounded-full object-cover ${className ?? ""}`}
      style={{
        width: className ? undefined : size,
        height: className ? undefined : size,
        background: "#111",
        boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${RED}`,
      }}
    />
  );
}

/* A row of steps on one line, with a dot that keeps travelling along it.
   Every step is --h tall at the top, so the line runs through the middle
   of the tiles and the dot passes behind them. A compact row shrinks its
   tiles on a phone, to fit five across. */
function Flow({
  steps,
  compact = false,
}: {
  steps: { top: ReactNode; label: string }[];
  compact?: boolean;
}) {
  const active = useSlideActive();
  const t = useTheme();
  const edge = `${50 / steps.length}%`;
  return (
    <div
      className={`relative grid ${compact ? "[--h:44px] md:[--h:56px]" : "[--h:56px]"}`}
      style={{
        gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
      }}
    >
      <div
        aria-hidden
        className="absolute top-[calc(var(--h)/2-1px)] h-[2px]"
        style={{ left: edge, right: edge, background: t.line }}
      >
        <motion.i
          className="absolute -top-1 -ml-[5px] block h-2.5 w-2.5 rounded-full"
          style={{ background: t.hl }}
          initial={{ left: "0%", opacity: 0 }}
          animate={
            active
              ? { left: ["0%", "100%"], opacity: [0, 1, 1, 0] }
              : { left: "0%", opacity: 0 }
          }
          transition={{
            duration: 2.6,
            delay: 0.9,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.4,
          }}
        />
      </div>
      {steps.map((s, i) => (
        <motion.div
          key={s.label}
          variants={pop}
          custom={i % 2 ? 3 : -3}
          className="relative flex flex-col items-center px-0.5 text-center"
        >
          <span className="flex h-[var(--h)] items-center justify-center">
            {s.top}
          </span>
          <span
            className={`mt-2 font-bold leading-[1.2] md:text-[15px] ${compact ? "text-[11px]" : "text-[12.5px]"}`}
          >
            {s.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function Caption({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <p
      className="mb-3 text-[10px] uppercase tracking-[0.14em] md:mb-4 md:text-[11px]"
      style={{ fontFamily: MONO, color: t.muted }}
    >
      {children}
    </p>
  );
}

/* The nudge beside a demo phone: a line of handwriting-sized type and an
   arrow that keeps pointing at the phone. Beside the phone where there is
   room, above it on a phone-sized screen. */
function HintArrow({ down = false }: { down?: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 64 40"
      width={down ? 44 : 64}
      height={down ? 28 : 40}
      fill="none"
      stroke={RED}
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="flex-none"
      style={{ rotate: down ? 70 : 0 }}
      animate={down ? { y: [0, 5, 0] } : { x: [0, 8, 0] }}
      transition={{ duration: 1.3, ease: "easeInOut", repeat: Infinity }}
    >
      <path d="M4 10c16-8 36-4 52 14" />
      <path d="M42 26l15-1-3-15" />
    </motion.svg>
  );
}

const HINT = "Klikni da probaš demo verziju";

function DemoHintAbove() {
  const t = useTheme();
  return (
    <motion.p
      variants={item}
      className="mb-2 flex items-center justify-center gap-2 text-[15px] font-extrabold italic lg:hidden"
      style={{ color: t.fg, fontFamily: DISPLAY }}
    >
      {HINT}
      <HintArrow down />
    </motion.p>
  );
}

function DemoHintBeside() {
  const t = useTheme();
  return (
    <motion.p
      variants={item}
      className="absolute right-[calc(50%+210px)] top-[30%] hidden w-[210px] flex-col items-end gap-2 text-right text-[24px] font-extrabold italic leading-[1.1] lg:flex"
      style={{ color: t.fg, fontFamily: DISPLAY }}
    >
      {HINT}
      <HintArrow />
    </motion.p>
  );
}

/* ------------------------------------------------------------------------ */
/* 01  Cover                                                                  */
/* ------------------------------------------------------------------------ */

function Cover() {
  return (
    <Slide
      id="cover"
      theme="dark"
      eyebrow={false}
      fit={false}
      className="!px-0 !py-0 [&>div]:flex-1"
    >
      <CoverBody />
    </Slide>
  );
}

/* Split out so the hooks read the Slide's own contexts, not the defaults. */
function CoverBody() {
  const active = useSlideActive();
  const fade = (delay: number) => ({
    initial: { opacity: 0 },
    animate: { opacity: active ? 1 : 0 },
    transition: { duration: 0.5, delay, ease: "easeOut" as const },
  });
  return (
    <>
      <div className="flex flex-1 flex-col justify-center px-5 pb-[3vh] pt-[4vh] md:px-10 md:pt-[6vh]">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
          <NetoLogo
            className="w-[min(58vw,240px,30vh)] md:w-[min(340px,38vh)]"
            delay={0.15}
          />
          <motion.div
            aria-hidden
            className="mt-1.5 text-[clamp(16px,min(6vw,3.4vh),28px)] font-medium tracking-[0.16em]"
            {...fade(0.7)}
          >
            DISKONTI
          </motion.div>
          <motion.div className="mt-[2.4vh]" {...fade(0.95)}>
            <Image
              src="/logo.webp"
              alt="Skeylo"
              width={2000}
              height={717}
              priority
              className="h-auto w-[112px] md:w-[136px]"
            />
          </motion.div>
          <motion.h1
            className="mt-[3vh] text-center text-[clamp(1.8rem,min(10vw,8.5vh),4.2rem)] font-extrabold italic leading-[1.02] tracking-[-0.01em]"
            initial={{ opacity: 0, y: 18 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.7, delay: 1.1, ease: EASE_OUT }}
          >
            Ceo marketing tim.
          </motion.h1>
          <motion.p
            className="mt-[1.6vh] max-w-[32ch] text-center text-[clamp(14px,2.4vh,17px)] md:text-[clamp(15px,2.4vh,19px)]"
            style={{ color: "#CFCFCF" }}
            {...fade(1.4)}
          >
            Šest ljudi i kompletna oprema, za Neto u Novom Sadu i okolini.
          </motion.p>
          <motion.p
            className="mt-[2.4vh] text-center text-[13px]"
            style={{ color: "#8A8A8A", fontFamily: MONO }}
            {...fade(1.6)}
          >
            Ponuda za saradnju, septembar 2026.
          </motion.p>
        </div>
      </div>
      <motion.div className="mt-auto w-full" {...fade(1.8)}>
        <Ticker />
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* 02  The crew                                                               */
/* ------------------------------------------------------------------------ */

const PEOPLE = {
  luka: { name: "Luka Macura", img: "/people/luka.webp" },
  mihajlo: { name: "Mihajlo Obradović", img: "/people/mihac.webp" },
  filip: { name: "Filip Ruvčeski", img: "/people/filip.webp" },
  nina: { name: "Nina Kostić", img: "/people/nina.webp" },
  stefan: { name: "Stefan Stojanović", img: "/people/stefan.webp" },
  kuzma: { name: "Luka Kuzmanović", img: "/people/kuzma.webp" },
};

const CREW: {
  who: keyof typeof PEOPLE;
  role: string;
  does: [IconType, string][];
}[] = [
  {
    who: "luka",
    role: "Informacione tehnologije",
    does: [
      [Globe, "Sajt"],
      [LayoutGrid, "Katalog"],
      [Smartphone, "Mobilna aplikacija"],
    ],
  },
  {
    who: "filip",
    role: "Strategija i oglasi",
    does: [
      [PenLine, "Kreative"],
      [Target, "Meta"],
      [BarChart3, "Izveštaji"],
    ],
  },
  {
    who: "nina",
    role: "Organizacija",
    does: [
      [CalendarCheck, "Termini"],
      [Users, "Modeli"],
    ],
  },
  {
    who: "mihajlo",
    role: "Produkcija",
    does: [
      [Video, "Snimanje"],
      [Eye, "Kontrola"],
      [Scissors, "Montaža"],
    ],
  },
  {
    who: "stefan",
    role: "Montaža",
    does: [
      [Scissors, "Montaža"],
      [Palette, "Dizajn"],
    ],
  },
  {
    who: "kuzma",
    role: "Montaža",
    does: [
      [Scissors, "Montaža"],
      [Palette, "Dizajn"],
    ],
  },
];

function Crew() {
  return (
    <Slide id="crew" theme="paper">
      <Headline>Vaš marketing tim. [[Šest ljudi.]]</Headline>
      <Visual className="!mt-4 grid grid-cols-2 gap-2 md:!mt-8 md:gap-4 lg:grid-cols-3">
        {CREW.map((m, i) => {
          const p = PEOPLE[m.who];
          return (
            <motion.article
              key={p.name}
              variants={pop}
              custom={i % 2 ? 1.5 : -1.5}
              className="grid grid-cols-[auto_1fr] content-start items-center gap-x-2.5 bg-white p-2.5 md:gap-x-4 md:p-4"
              style={{ border: "2px solid #000", borderRadius: NETO_RADIUS }}
            >
              <Face
                src={p.img}
                name={p.name}
                className="m-1 h-8 w-8 md:row-span-3 md:h-14 md:w-14"
              />
              <b className="text-[13.5px] font-extrabold leading-[1.1] md:text-[18px]">
                {p.name}
              </b>
              <span
                className="col-span-2 mt-1 text-[11.5px] font-medium leading-[1.2] md:col-span-1 md:col-start-2 md:mt-0 md:text-[15px]"
                style={{ color: RED }}
              >
                {m.role}
              </span>
              <div className="col-span-2 mt-1.5 flex flex-wrap gap-1 md:col-span-1 md:col-start-2 md:mt-2 md:gap-1.5">
                {m.does.map(([Icon, label]) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-full px-1.5 py-[3px] text-[10.5px] font-bold md:px-2 md:py-1 md:text-[13px]"
                    style={{ background: "#F7F6F2" }}
                  >
                    <Icon size={12} style={{ color: RED }} />
                    {label}
                  </span>
                ))}
              </div>
            </motion.article>
          );
        })}
        <motion.div
          variants={item}
          className="col-span-2 flex items-center justify-between gap-3 bg-black px-3.5 py-2.5 text-white md:px-4 md:py-3 lg:col-span-3"
          style={{ borderRadius: NETO_RADIUS }}
        >
          <span className="flex items-center gap-2.5 md:gap-4">
            {[Camera, Lightbulb, Mic, MonitorPlay].map((Icon, i) => (
              <Icon key={i} size={19} style={{ color: "#FF6B63" }} />
            ))}
          </span>
          <b className="text-right text-[12.5px] font-extrabold italic leading-[1.2] md:text-[17px]">
            Uz nas dobijate profesionalnu opremu
          </b>
        </motion.div>
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 03  The website and the catalogue                                          */
/* ------------------------------------------------------------------------ */

function Web() {
  return (
    <Slide id="web" theme="light">
      <WebBody />
    </Slide>
  );
}

function WebBody() {
  const t = useTheme();
  return (
    <>
      <Headline>Interaktivni Katalog [[na vašem sajtu.]]</Headline>
      <Visual>
        <motion.div
          variants={item}
          className="flex max-w-xl items-center gap-3"
        >
          <Face src={PEOPLE.luka.img} name={PEOPLE.luka.name} size={44} />
          <span
            className="flex min-w-0 flex-1 items-center gap-2 rounded-full px-4 py-2.5 text-[13px] md:text-[15px]"
            style={{ background: t.card, border: `1px solid ${t.line}` }}
          >
            <Lock size={13} strokeWidth={2.6} style={{ color: RED }} />
            <span className="truncate">{SITE_URL}</span>
          </span>
        </motion.div>
        <motion.p
          variants={item}
          className="mb-5 mt-3 max-w-2xl text-[clamp(0.9rem,3.5vw,1.1rem)] leading-[1.45] md:mb-7 md:mt-4 md:leading-relaxed"
          style={{ color: t.muted }}
        >
          Luka pravi novi Neto sajt. U sklopu njega dobijate Interaktivni
          katalog i Admin panel gde se dodaju/izmenjuju/brišu trenutne akcije i
          slike proizvoda. Pregledno i jednostavno za korišćenje.
        </motion.p>
        <div className="grid gap-5 lg:grid-cols-2 lg:gap-10">
          <div>
            <Caption>Kroz šta kupac prolazi</Caption>
            <Flow
              compact
              steps={[
                { top: <IconTile icon={Megaphone} />, label: "Vidi oglas" },
                { top: <IconTile icon={Globe} />, label: "Otvori sajt" },
                {
                  top: <IconTile icon={ShoppingCart} />,
                  label: "Bira proizvode",
                },
                {
                  top: <IconTile icon={BadgePercent} />,
                  label: "Dobija popuste i promo kod",
                },
                {
                  top: <IconTile icon={Ticket} />,
                  label: "Predaje kod na kasi",
                },
              ]}
            />
          </div>
          <div>
            <Caption>Kako radi sistem</Caption>
            <Flow
              steps={[
                {
                  top: <IconTile icon={UserCog} bg="#000" />,
                  label: "Admin unese akciju",
                },
                {
                  top: <IconTile icon={RefreshCw} bg="#000" />,
                  label: "Katalog se odmah menja",
                },
                {
                  top: <IconTile icon={Eye} bg="#000" />,
                  label: "Kupac vidi akciju",
                },
              ]}
            />
          </div>
        </div>
      </Visual>
      <motion.p
        variants={item}
        className="mt-4 text-[12.5px] md:mt-6 md:text-[14px]"
        style={{ color: t.muted }}
      >
        Kod i popust potvrđujemo sa vašim softverskim timom.
      </motion.p>
    </>
  );
}

function DemoPhone() {
  return (
    <Slide
      id="demo-phone"
      theme="light"
      eyebrow={false}
      fit={false}
      className="!py-4"
    >
      <DemoHintAbove />
      <motion.div variants={pop} custom={2} className="relative w-full">
        <DemoHintBeside />
        <DemoStage>
          <CatalogDemo />
        </DemoStage>
      </motion.div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 04  Paid and organic                                                       */
/* ------------------------------------------------------------------------ */

function Pulse({ color, children }: { color: string; children: ReactNode }) {
  const active = useSlideActive();
  return (
    <span className="relative grid h-14 flex-none place-items-center">
      <motion.i
        aria-hidden
        className="absolute left-0 top-0 h-14 w-14"
        style={{ border: `2px solid ${color}`, borderRadius: TILE_RADIUS }}
        initial={{ scale: 1, opacity: 0 }}
        animate={
          active
            ? { scale: [1, 1.5], opacity: [0.8, 0] }
            : { scale: 1, opacity: 0 }
        }
        transition={{
          duration: 1.8,
          delay: 0.8,
          ease: "easeOut",
          repeat: Infinity,
        }}
      />
      <span className="relative">{children}</span>
    </span>
  );
}

function Creatives() {
  const kinds: {
    label: string;
    title: string;
    mark: ReactNode;
    color: string;
    points: [IconType, string][];
  }[] = [
    {
      label: "Plaćeni",
      title: "Direktno dovodi kupce.",
      mark: (
        <Pulse color={META_BLUE}>
          <MetaTile />
        </Pulse>
      ),
      color: META_BLUE,
      points: [
        [Target, "Novi Sad i okolina"],
        [MousePointerClick, "Klik vodi u katalog"],
        [Store, "Kupac dolazi u objekat"],
      ],
    },
    {
      label: "Organski",
      title: "Gradi brend.",
      mark: <SocialTile />,
      color: "#FF4B42",
      points: [
        [Heart, "Poverenje"],
        [Users, "Pratioci"],
        [TrendingUp, "Prepoznatljivost"],
      ],
    },
  ];
  return (
    <Slide id="creatives" theme="dark">
      <Headline>Kreativa je [[ono što prodaje.]]</Headline>
      <Sub>Dve vrste sadržaja, dve različite svrhe.</Sub>
      <Visual className="!mt-4 grid gap-3 md:!mt-8 md:grid-cols-2 md:gap-4">
        {kinds.map((k, i) => (
          <motion.div
            key={k.label}
            variants={pop}
            custom={i ? 1.5 : -1.5}
            className="px-4 py-4 md:px-6 md:py-6"
            style={{
              background: "#0d0d0d",
              border: "1px solid #2A2A2A",
              borderRadius: NETO_RADIUS,
            }}
          >
            <div className="flex items-center gap-4">
              {k.mark}
              <div>
                <span
                  className="block text-[11px] uppercase tracking-[0.16em]"
                  style={{ fontFamily: MONO, color: k.color }}
                >
                  {k.label}
                </span>
                <b className="block text-[21px] font-extrabold italic leading-[1.1] md:text-[28px]">
                  {k.title}
                </b>
              </div>
            </div>
            <ul className="mt-3.5 grid gap-2 md:mt-5 md:gap-3">
              {k.points.map(([Icon, text]) => (
                <li
                  key={text}
                  className="flex items-center gap-3 text-[15px] md:text-[17px]"
                >
                  <span
                    className="grid h-8 w-8 flex-none place-items-center rounded-full md:h-9 md:w-9"
                    style={{ background: "#1C1C1C", color: k.color }}
                  >
                    <Icon size={18} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 05  How a creative is made                                                 */
/* ------------------------------------------------------------------------ */

/* A big face with the tool of the job pinned to it. */
function Worker({
  who,
  icon: Icon,
  does,
}: {
  who: keyof typeof PEOPLE;
  icon: IconType;
  does: string;
}) {
  const p = PEOPLE[who];
  return (
    <motion.div
      variants={pop}
      custom={-3}
      className="relative flex items-center gap-4 md:flex-col md:gap-0 md:text-center"
    >
      <span className="relative flex-none">
        <Image
          src={p.img}
          alt={p.name}
          width={112}
          height={112}
          className="h-[76px] w-[76px] rounded-full object-cover md:h-[112px] md:w-[112px]"
          style={{
            background: "#111",
            boxShadow: `0 0 0 3px #F7F6F2, 0 0 0 6px ${RED}`,
          }}
        />
        <span
          aria-hidden
          className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-black text-white md:h-10 md:w-10"
          style={{ boxShadow: "0 0 0 3px #F7F6F2" }}
        >
          <Icon size={17} />
        </span>
      </span>
      <span className="md:mt-4">
        <span
          className="block text-[11px] uppercase tracking-[0.12em] md:text-[12px]"
          style={{ fontFamily: MONO, color: RED }}
        >
          {p.name.split(" ")[0]}
        </span>
        <span className="block text-[19px] font-extrabold leading-[1.15] md:text-[20px]">
          {does}
        </span>
      </span>
    </motion.div>
  );
}

/* The line runs down the faces on a phone and across them on a desktop,
   and the dot follows whichever way it runs. */
function Production() {
  return (
    <Slide id="production" theme="paper">
      <ProductionBody />
    </Slide>
  );
}

function ProductionBody() {
  const active = useSlideActive();
  const phone = useIsPhone();
  const to = ["0%", "100%"];
  return (
    <>
      <Headline>Od ideje [[do objave.]]</Headline>
      <Visual className="relative flex flex-col gap-6 md:grid md:grid-cols-5 md:gap-0">
        <div
          aria-hidden
          className="absolute bottom-10 left-[37px] top-10 w-[2px] md:bottom-auto md:left-[10%] md:right-[10%] md:top-[55px] md:h-[2px] md:w-auto"
          style={{ background: "#D9D6CE" }}
        >
          <motion.i
            key={phone ? "down" : "across"}
            className="absolute -ml-[5px] -mt-[5px] block h-3 w-3 rounded-full"
            style={{
              background: RED,
              left: phone ? 1 : undefined,
              top: phone ? undefined : 1,
            }}
            initial={{ opacity: 0 }}
            animate={
              active
                ? {
                    ...(phone ? { top: to } : { left: to }),
                    opacity: [0, 1, 1, 0],
                  }
                : { opacity: 0 }
            }
            transition={{
              duration: 3,
              delay: 0.9,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 0.4,
            }}
          />
        </div>
        <Worker who="filip" icon={PenLine} does="Piše kreative" />
        <Worker who="nina" icon={Users} does="Organizuje modele" />
        <Worker who="mihajlo" icon={Video} does="Snima" />
        {/* Mihajlo's second job: the dashed frame ties him to the editors. */}
        <div
          className="relative -mx-3 -my-3 flex flex-col gap-6 rounded-[18px] px-3 pb-11 pt-3 md:col-span-2 md:mx-0 md:-mb-0 md:-mt-4 md:grid md:grid-cols-2 md:gap-0 md:px-0 md:pb-14 md:pt-4"
          style={{ border: `2px dashed ${RED}` }}
        >
          <Worker who="stefan" icon={Scissors} does="Montira" />
          <Worker who="kuzma" icon={Scissors} does="Montira" />
          <motion.p
            variants={item}
            className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 text-[13px] font-bold md:text-[15px]"
          >
            <Eye size={16} className="flex-none" style={{ color: RED }} />
            Mihajlo kontroliše montažu
          </motion.p>
        </div>
      </Visual>
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* 06  The app                                                                */
/* ------------------------------------------------------------------------ */

function TheApp() {
  const gets: [IconType, string][] = [
    [Ticket, "Vaučeri"],
    [QrCode, "Kod na kasi"],
    [CreditCard, "Kartica lojalnosti"],
  ];
  return (
    <Slide id="app" theme="dark">
      <Headline>Neto aplikacija. [[Potencijal za budućnost.]]</Headline>
      <Sub>
        Sledeći korak, kad katalog zaživi. Aplikacija koja će imati integrisan
        Interaktivni katalog uz vaučere, karticu lojalnosti i lični profil
        kupca.
      </Sub>
      <motion.div variants={item} className="mt-5 flex items-center gap-3">
        <Face src={PEOPLE.luka.img} name={PEOPLE.luka.name} size={44} />
        <b className="text-[16px] font-extrabold md:text-[18px]">
          Razvoj vodi Luka
        </b>
      </motion.div>
      <Visual className="grid max-w-3xl grid-cols-3 gap-2.5 md:gap-4">
        {gets.map(([Icon, label], i) => (
          <motion.div
            key={label}
            variants={pop}
            custom={i % 2 ? 2 : -2}
            className="flex flex-col items-center gap-3 px-2 py-5 text-center md:py-7"
            style={{
              background: "#0d0d0d",
              border: "1px dashed #4A4A4A",
              borderRadius: NETO_RADIUS,
            }}
          >
            <IconTile icon={Icon} />
            <b className="text-[13px] font-extrabold leading-[1.2] md:text-[17px]">
              {label}
            </b>
          </motion.div>
        ))}
      </Visual>
    </Slide>
  );
}

function AppPhone() {
  return (
    <Slide
      id="app-phone"
      theme="dark"
      eyebrow={false}
      fit={false}
      className="!py-4"
    >
      <DemoHintAbove />
      <motion.div variants={pop} custom={-2} className="relative w-full">
        <DemoHintBeside />
        <DemoStage>
          <AppDemo />
        </DemoStage>
      </motion.div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 07  Results                                                                */
/* ------------------------------------------------------------------------ */

/* The proof wall and the four numbers of the landing page's Rezultati
   section, in the deck's own dress. */
function Results() {
  const stats: [IconType, ReactNode, string][] = [
    [TrendingUp, "4.2x", "prosečan povrat na uloženo"],
    [
      Target,
      <Count key="g" to={133000} suffix="€" delay={0.3} />,
      "generisano Skeylo kreativama",
    ],
    [Timer, "1 mesec", "prosečan period potreban za profit"],
    [
      Heart,
      <Count key="r" to={97} suffix="%" delay={0.5} />,
      "klijenata ostane duže od godinu dana",
    ],
  ];
  return (
    <Slide id="results" theme="dark">
      <Headline>Rezultati, [[crno na belo.]]</Headline>
      <Visual>
        <div className="-mx-5 flex flex-col gap-3 [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)] max-md:-mx-[25px] max-md:[zoom:0.8] md:-mx-10 md:gap-4">
          <div className="flex h-[126px] items-center overflow-hidden sm:h-[148px]">
            <ProofRow
              shots={rowA}
              anim="animate-[marquee_86s_linear_infinite]"
            />
          </div>
          <div className="flex h-[126px] items-center overflow-hidden sm:h-[148px]">
            <ProofRow
              shots={rowB}
              anim="animate-[marquee_88s_linear_infinite_reverse]"
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 md:mt-6 md:gap-4 lg:grid-cols-4">
          {stats.map(([Icon, value, label], i) => (
            <motion.div
              key={label}
              variants={pop}
              custom={i % 2 ? 1.5 : -1.5}
              className="px-3.5 py-3 md:px-5 md:py-5"
              style={{
                background: "#0d0d0d",
                border: "1px solid #2A2A2A",
                borderRadius: NETO_RADIUS,
              }}
            >
              <Icon size={22} style={{ color: "#FF4B42" }} />
              <strong className="mt-2 block whitespace-nowrap text-[24px] font-black italic leading-none md:mt-3 md:text-[38px]">
                {value}
              </strong>
              <span
                className="mt-1.5 block text-[12.5px] leading-[1.25] md:text-[14px]"
                style={{ color: "#B5B5B5" }}
              >
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 08  The offer                                                              */
/* ------------------------------------------------------------------------ */

const PACKS: {
  name: string;
  short: string;
  tag: string;
  featured?: boolean;
  paid: boolean;
  organic: boolean;
  team: number;
  ads: number;
  models: number;
  note: string;
}[] = [
  {
    name: "Organski paket",
    short: "Organski",
    tag: "Prepoznatljivost brenda",
    paid: false,
    organic: true,
    team: 2800,
    ads: 0,
    models: 400,
    note: "Bez oglasa nema direktnog dolaska na sajt. Više na sastanku.",
  },
  {
    name: "Meta paket",
    short: "Meta",
    tag: "Direktno do kupca",
    paid: true,
    organic: false,
    team: 2800,
    ads: 1500,
    models: 300,
    note: "Oglas vodi kupca pravo u katalog.",
  },
  {
    name: "Full paket",
    short: "Full",
    tag: "Najkompletniji",
    featured: true,
    paid: true,
    organic: true,
    team: 3500,
    ads: 1500,
    models: 700,
    note: "Oglasi dovode kupce, organski gradi brend.",
  },
];

function Has({
  on,
  mark,
  children,
}: {
  on: boolean;
  mark: ReactNode;
  children: ReactNode;
}) {
  return (
    <li
      className="flex items-center gap-2.5 text-[14px] leading-[1.2] md:text-[15px]"
      style={{ opacity: on ? 1 : 0.4 }}
    >
      <span className="flex w-[46px] flex-none items-center">{mark}</span>
      <span className={`flex-1 ${on ? "font-bold" : "line-through"}`}>
        {children}
      </span>
      {on ? (
        <Check size={16} strokeWidth={3} />
      ) : (
        <X size={16} strokeWidth={3} />
      )}
    </li>
  );
}

function Pack({ p, delay }: { p: (typeof PACKS)[number]; delay: number }) {
  const line = p.featured ? "rgba(255,255,255,0.35)" : "#333";
  const soft = p.featured ? "rgba(255,255,255,0.85)" : "#B5B5B5";
  return (
    <motion.article
      variants={pop}
      custom={p.featured ? 1.5 : -1.5}
      className="flex h-full flex-col px-4 py-4 text-white md:px-5 md:py-6"
      style={{
        background: p.featured ? RED : "#0d0d0d",
        border: p.featured ? `2px solid ${RED}` : "2px solid #2A2A2A",
        borderRadius: "10px 34px 10px 10px",
      }}
    >
      <span
        className="text-[10px] uppercase tracking-[0.16em] md:text-[10.5px]"
        style={{ fontFamily: MONO, color: soft }}
      >
        {p.tag}
      </span>
      <h2 className="mt-0.5 text-[22px] font-black italic leading-[1.05] md:mt-1 md:text-[26px]">
        {p.name}
      </h2>

      <ul className="mt-3 grid gap-1.5 md:mt-4 md:gap-2.5">
        <Has
          on
          mark={
            <span
              className="grid h-8 w-8 place-items-center rounded-full"
              style={{
                background: p.featured ? "#fff" : RED,
                color: p.featured ? RED : "#fff",
              }}
            >
              <Globe size={17} />
            </span>
          }
        >
          Sajt + Interaktivni Katalog
        </Has>
        <Has on={p.paid} mark={<MetaTile size={32} />}>
          15 plaćenih video oglasa
        </Has>
        <Has on={p.organic} mark={<SocialTile size={30} />}>
          20 organskih klipova
        </Has>
      </ul>

      <div
        className="mt-3 text-[14px] md:mt-5 md:text-[15px]"
        style={{ borderTop: `1px solid ${line}` }}
      >
        {(
          [
            ["Tim", `${p.team.toLocaleString("de-DE")} €`],
            [
              "Meta oglasi",
              p.ads ? `~${p.ads.toLocaleString("de-DE")} €` : "nema",
            ],
            ["Modeli", `~${p.models} €`],
          ] as const
        ).map(([k, v]) => (
          <div
            key={k}
            className="flex justify-between gap-3 py-1.5 md:py-2.5"
            style={{ borderBottom: `1px solid ${line}` }}
          >
            <span style={{ color: soft }}>{k}</span>
            <b className="whitespace-nowrap">{v}</b>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3 md:mt-4">
        <span
          className="pb-1 text-[12.5px] md:pb-1.5 md:text-[13px]"
          style={{ color: soft }}
        >
          Ukupno, okvirno
        </span>
        <strong className="whitespace-nowrap text-[38px] font-black italic leading-none tracking-[-0.02em] md:text-[44px]">
          <Count to={p.team + p.ads + p.models} delay={delay} />{" "}
          <span className="text-[22px] md:text-[24px]">€</span>
        </strong>
      </div>
      <p
        className="mt-2 text-[12.5px] leading-[1.3] md:mt-3 md:text-[13.5px] md:leading-[1.35]"
        style={{ color: soft }}
      >
        {p.note}
      </p>
    </motion.article>
  );
}

/* Three packages, cheapest first. A desktop shows them side by side; a
   phone shows one at a time behind three tabs, all stacked in one cell so
   the slide keeps its height whichever is open. */
function Price() {
  const [open, setOpen] = useState(0);
  return (
    <Slide id="price" theme="dark">
      <Headline center>Tri paketa. [[Vi birate.]]</Headline>
      <motion.div
        variants={item}
        role="tablist"
        aria-label="Paketi"
        className="mt-4 grid grid-cols-3 gap-1 rounded-full p-1 lg:hidden"
        style={{ background: "#161616", border: "1px solid #2A2A2A" }}
      >
        {PACKS.map((p, i) => (
          <button
            key={p.name}
            type="button"
            role="tab"
            aria-selected={open === i}
            onClick={() => setOpen(i)}
            className="relative cursor-pointer rounded-full py-2 text-[13.5px] font-extrabold text-white"
          >
            {open === i && (
              <motion.span
                layoutId="pack-tab"
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{ background: RED }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{p.short}</span>
          </button>
        ))}
      </motion.div>
      <Visual className="!mt-3 grid lg:!mt-8 lg:grid-cols-3 lg:items-stretch lg:gap-4">
        {PACKS.map((p, i) => (
          <div
            key={p.name}
            role="tabpanel"
            aria-label={p.name}
            className={`transition-[opacity,transform] duration-300 max-lg:[grid-area:1/1] ${
              open === i
                ? ""
                : "max-lg:pointer-events-none max-lg:invisible max-lg:translate-y-2 max-lg:opacity-0"
            }`}
          >
            <Pack p={p} delay={0.4 + i * 0.2} />
          </div>
        ))}
      </Visual>
      <motion.div
        variants={item}
        className="mt-3 grid gap-4 md:mt-4 md:grid-cols-[1fr_auto] md:items-end"
      >
        <div className="grid max-w-2xl gap-2">
          <p
            className="flex items-start gap-2.5 text-[12.5px] leading-[1.35] md:text-[14px] md:leading-[1.4]"
            style={{ color: "#B5B5B5" }}
          >
            <TrendingUp
              size={18}
              className="mt-0.5 flex-none"
              style={{ color: "#FF4B42" }}
            />
            <span>
              Budžet za Meta oglase je investicija: vraća se kroz kupce koje
              dovodi u prodavnicu. Cene su mesečne.
            </span>
          </p>
          <p
            className="flex items-start gap-2.5 px-3 py-2 text-[12.5px] leading-[1.35] text-white md:px-3.5 md:py-3 md:text-[14.5px] md:leading-[1.4]"
            style={{ border: "1px solid #4A4A4A", borderRadius: NETO_RADIUS }}
          >
            <ReceiptText
              size={18}
              className="mt-0.5 flex-none"
              style={{ color: "#FF4B42" }}
            />
            <span>
              <b>Sve cene su bez PDV-a.</b> Ako vam je potrebna faktura, na cenu
              se dodaje PDV.
            </span>
          </p>
        </div>
        <strong className="hidden text-[20px] font-extrabold italic md:block md:text-right">
          Svaki dinar je bitan.
        </strong>
      </motion.div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */

export const SLIDES: {
  id: string;
  label: string;
  theme: Theme;
  Component: () => React.JSX.Element;
}[] = [
  { id: "cover", label: "Neto × Skeylo", theme: "dark", Component: Cover },
  { id: "crew", label: "Vaš tim", theme: "paper", Component: Crew },
  { id: "web", label: "Sajt i katalog", theme: "light", Component: Web },
  {
    id: "demo-phone",
    label: "Interaktivni Katalog: demo",
    theme: "light",
    Component: DemoPhone,
  },
  {
    id: "creatives",
    label: "Plaćeni i organski",
    theme: "dark",
    Component: Creatives,
  },
  {
    id: "production",
    label: "Kako nastaje kreativa",
    theme: "paper",
    Component: Production,
  },
  {
    id: "app",
    label: "Aplikacija: potencijal",
    theme: "dark",
    Component: TheApp,
  },
  {
    id: "app-phone",
    label: "Aplikacija: demo",
    theme: "dark",
    Component: AppPhone,
  },
  { id: "results", label: "Rezultati", theme: "dark", Component: Results },
  { id: "price", label: "Ponuda", theme: "dark", Component: Price },
];
