"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BadgePercent,
  Bell,
  Check,
  BarChart3,
  Clapperboard,
  CreditCard,
  Database,
  DatabaseBackup,
  DoorOpen,
  Download,
  Gift,
  Globe,
  Hammer,
  HardHat,
  Lightbulb,
  ListChecks,
  Lock,
  MapPin,
  Megaphone,
  PartyPopper,
  PencilRuler,
  Plus,
  QrCode,
  ReceiptText,
  Repeat,
  ScanBarcode,
  Search,
  ShieldCheck,
  Signpost,
  SlidersHorizontal,
  Smartphone,
  Store,
  Tag,
  Target,
  UserCheck,
  Users,
  Video,
} from "lucide-react";
import type { DeckSlide } from "../Deck";
import {
  Count,
  EASE_OUT,
  Headline,
  MONO,
  NETO_RADIUS,
  RED,
  Slide,
  Visual,
  fmt,
  item,
  pop,
  useSlideActive,
  useTheme,
} from "../primitives";
import { NetoLogo, Ticker } from "../visuals";
import {
  AGENCY_FEE,
  ARCHITECT,
  CRAFTS,
  FIRST_BUY_OFF,
  LOCATION,
  MONTHS,
  SPOTS,
  type Person,
  type Spot,
} from "./data";
import { AppCard, FloorPlan, QrSticker, Receipt } from "./scenes";
import { KnowledgeFlow, KnowledgeSearch, KnowledgeStory } from "./knowledge";
import { Compare } from "./compare";
/* The first offer's slides, word for word: the team, the site and its
   catalogue demo, the creatives, how they are made and the app demo. */
import {
  AppPhone,
  Creatives,
  Crew as Team,
  DemoPhone,
  Production,
  Web,
} from "../slides";

type IconType = React.ElementType;

const TILE_RADIUS = "14px 14px 14px 4px";

const PEOPLE = {
  luka: { name: "Luka Macura", img: "/people/luka.webp" },
  filip: { name: "Filip Ruvčeski", img: "/people/filip.webp" },
  nina: { name: "Nina Kostić", img: "/people/nina.webp" },
  mihajlo: { name: "Mihajlo Obradović", img: "/people/mihac.webp" },
  stefan: { name: "Stefan Stojanović", img: "/people/stefan.webp" },
  kuzma: { name: "Luka Kuzmanović", img: "/people/kuzma.webp" },
};

/* ------------------------------------------------------------------------ */
/* Shared pieces                                                             */
/* ------------------------------------------------------------------------ */

function IconTile({
  icon: Icon,
  bg = RED,
  color = "#fff",
  size = 26,
}: {
  icon: IconType;
  bg?: string;
  color?: string;
  size?: number;
}) {
  return (
    <span
      className="grid h-[var(--h,56px)] w-[var(--h,56px)] flex-none place-items-center"
      style={{ background: bg, color, borderRadius: TILE_RADIUS }}
    >
      <Icon size={size} />
    </span>
  );
}

function Face({ who, size = 44 }: { who: keyof typeof PEOPLE; size?: number }) {
  const p = PEOPLE[who];
  return (
    <Image
      src={p.img}
      alt={p.name}
      width={size}
      height={size}
      className="flex-none rounded-full object-cover"
      style={{
        width: size,
        height: size,
        background: "#111",
        boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${RED}`,
      }}
    />
  );
}

/* Steps on one line with a dot travelling along them, as on /bojan. */
function Steps({ steps }: { steps: { icon: IconType; label: string }[] }) {
  const active = useSlideActive();
  const t = useTheme();
  const edge = `${50 / steps.length}%`;
  return (
    <div
      className="relative grid [--h:44px] md:[--h:56px]"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
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
          <IconTile icon={s.icon} size={22} />
          <span className="mt-2 text-[11.5px] font-bold leading-[1.2] md:text-[15px]">
            {s.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function Note({
  icon: Icon,
  children,
  boxed = false,
}: {
  icon: IconType;
  children: ReactNode;
  boxed?: boolean;
}) {
  const t = useTheme();
  return (
    <motion.p
      variants={item}
      className={`flex items-start gap-2.5 text-[12.5px] leading-[1.35] md:text-[14px] md:leading-[1.4] ${boxed ? "px-3 py-2 md:px-3.5 md:py-3" : ""}`}
      style={{
        color: boxed ? t.fg : t.muted,
        border: boxed ? `1px solid ${t.line}` : undefined,
        borderRadius: boxed ? NETO_RADIUS : undefined,
      }}
    >
      <Icon size={17} className="mt-0.5 flex-none" style={{ color: t.hl }} />
      <span>{children}</span>
    </motion.p>
  );
}

/* ------------------------------------------------------------------------ */
/* 01  Cover                                                                 */
/* ------------------------------------------------------------------------ */

const TICKER = [
  "Redizajn lokala",
  "Patrijarha Pavla",
  "Interaktivni Katalog",
  "QR kod svuda",
  `−${FIRST_BUY_OFF}% na prvu kupovinu`,
  "Neto aplikacija",
  "Baza znanja",
  "Fruškogorska",
  "Svaki dinar je bitan",
];

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
            className="w-[min(50vw,210px,25vh)] md:w-[min(300px,32vh)]"
            delay={0.15}
          />
          <motion.div className="mt-[2vh]" {...fade(0.7)}>
            <Image
              src="/brand/logo.webp"
              alt="Skeylo"
              width={2000}
              height={717}
              priority
              className="h-auto w-[104px] md:w-[128px]"
            />
          </motion.div>
          <motion.h1
            className="mt-[3vh] text-center text-[clamp(1.9rem,min(10.5vw,8.5vh),4.4rem)] font-extrabold italic leading-[1.02] tracking-[-0.01em]"
            initial={{ opacity: 0, y: 18 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.7, delay: 0.95, ease: EASE_OUT }}
          >
            Novi Neto
            <br />
            <span style={{ color: "#FF4B42" }}>počinje ovde.</span>
          </motion.h1>
          <motion.p
            className="mt-[2.2vh] flex items-center gap-2 rounded-full px-3.5 py-2 text-[clamp(13px,2.2vh,16px)] font-bold"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid #333",
            }}
            {...fade(1.25)}
          >
            <span
              className="grid h-6 w-6 flex-none place-items-center rounded-full"
              style={{ background: RED }}
            >
              <Store size={13} />
            </span>
            {LOCATION}
          </motion.p>
          <motion.p
            className="mt-[2vh] max-w-[32ch] text-center text-[clamp(14px,2.3vh,17px)] md:text-[clamp(15px,2.3vh,19px)]"
            style={{ color: "#CFCFCF" }}
            {...fade(1.45)}
          >
            Aplikacija, lokal, sajt, baza znanja i marketing. Jedan tim.
          </motion.p>
          <motion.p
            className="mt-[2vh] text-center text-[13px]"
            style={{ color: "#8A8A8A", fontFamily: MONO }}
            {...fade(1.6)}
          >
            {MONTHS} meseca saradnje, novembar 2026.
          </motion.p>
        </div>
      </div>
      <motion.div className="mt-auto w-full" {...fade(1.8)}>
        <Ticker items={TICKER} />
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* 02  Everything in the three months                                        */
/* ------------------------------------------------------------------------ */

/* The app leads: it is the biggest piece of work in the three months and
   the one that keeps paying after them. The QR codes are how people get
   it, so they live in its line. */
const SCOPE: [IconType, string, string][] = [
  [Store, "Redizajn lokala", "Novi izgled, Neto boje"],
  [Globe, "Sajt + katalog", "Akcije uvek ažurne"],
  [Database, "Baza znanja", "Sve jednim klikom"],
  [Clapperboard, "Kreative i oglasi", "Plaćeni i organski"],
];

function Scope() {
  return (
    <Slide id="scope" theme="red">
      <Headline>Šta radimo [[za tri meseca.]]</Headline>
      <Visual className="!mt-5 grid grid-cols-2 gap-2 md:!mt-8 md:gap-4 lg:grid-cols-4">
        <motion.div
          variants={pop}
          custom={-1}
          className="col-span-2 flex items-center gap-3 bg-black p-3 text-white [--h:50px] md:gap-5 md:p-5 md:[--h:64px] lg:col-span-4"
          style={{ borderRadius: NETO_RADIUS }}
        >
          <IconTile icon={Smartphone} size={26} />
          <span className="min-w-0 flex-1">
            <span
              className="block text-[10px] uppercase tracking-[0.16em] md:text-[11px]"
              style={{ fontFamily: MONO, color: "#FF4B42" }}
            >
              Glavni deo
            </span>
            <b className="block text-[20px] font-black italic leading-[1.05] md:text-[28px]">
              Neto aplikacija
            </b>
            <span
              className="mt-0.5 block text-[11.5px] leading-[1.25] md:text-[15px]"
              style={{ color: "#CFCFCF" }}
            >
              iOS i Android · QR, bar kod, −{FIRST_BUY_OFF}% prva kupovina
            </span>
          </span>
        </motion.div>
        {SCOPE.map(([Icon, title, hint], i) => (
          <motion.div
            key={title}
            variants={pop}
            custom={i % 2 ? 1.5 : -1.5}
            className="flex flex-col items-start gap-2 bg-white p-3 text-black [--h:40px] md:flex-row md:items-center md:gap-4 md:p-4 md:[--h:52px]"
            style={{ borderRadius: NETO_RADIUS }}
          >
            <IconTile icon={Icon} size={20} />
            <span className="min-w-0">
              <b className="block text-[14.5px] font-extrabold leading-[1.15] md:text-[19px]">
                {title}
              </b>
              <span
                className="mt-0.5 block text-[11.5px] leading-[1.2] md:text-[14px]"
                style={{ color: RED }}
              >
                {hint}
              </span>
            </span>
          </motion.div>
        ))}
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* The store today, spot by spot                                             */
/* ------------------------------------------------------------------------ */

/* What changes in that spot. Chips under the photo on a phone, a list
   beside it on a wide screen. */
function Fixes({ fixes }: { fixes: Spot["fixes"] }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5 lg:flex-col lg:items-stretch lg:gap-2">
      <motion.span
        variants={item}
        className="mb-1 hidden text-[11px] uppercase tracking-[0.16em] lg:block"
        style={{ fontFamily: MONO, color: "#8A8A8A" }}
      >
        Posle redizajna
      </motion.span>
      {fixes.map(([Icon, label], i) => (
        <motion.span
          key={label}
          variants={pop}
          custom={i % 2 ? 1.5 : -1.5}
          className="inline-flex items-center gap-1.5 px-2.5 py-[6px] text-[12.5px] font-bold leading-[1.15] md:text-[14px] lg:gap-2.5 lg:px-3.5 lg:py-3 lg:text-[16px]"
          style={{
            border: "1px solid #333",
            borderRadius: NETO_RADIUS,
            background: "rgba(255,255,255,0.06)",
          }}
        >
          <Icon size={15} className="flex-none" style={{ color: "#FF4B42" }} />
          {label}
        </motion.span>
      ))}
    </div>
  );
}

function SpotSlide({ spot }: { spot: Spot }) {
  return (
    <Slide id={spot.id} theme="dark">
      <Headline>{spot.title}</Headline>
      <Visual className="!mt-3 flex flex-col items-center gap-3 md:!mt-6 md:gap-4 lg:flex-row lg:gap-8">
        <div className="flex w-full justify-center lg:w-auto lg:flex-none">
          <Compare
            pre={spot.pre}
            posle={spot.posle}
            alt={spot.alt}
            w={spot.w}
            h={spot.h}
          />
        </div>
        <div className="w-full lg:w-[280px] lg:flex-none">
          <Fixes fixes={spot.fixes} />
        </div>
      </Visual>
    </Slide>
  );
}

/* One deck slide per spot, each with a named component. */
function spotSlide(spot: Spot): DeckSlide {
  function SpotN() {
    return <SpotSlide spot={spot} />;
  }
  return { id: spot.id, label: spot.label, theme: "dark", Component: SpotN };
}

/* ------------------------------------------------------------------------ */
/* 03  The redesign                                                          */
/* ------------------------------------------------------------------------ */

const ZONES: [IconType, string, string][] = [
  [Store, "Fasada i tabla", "Vidi se iz daljine"],
  [DoorOpen, "Ulaz i izlog", "Prvi utisak"],
  [Lightbulb, "Rasveta", "Svetao prostor"],
  [Tag, "Rafovi i cene", "Akcije koje se vide"],
  [Signpost, "Oznake odeljaka", "Sve se brzo nađe"],
  [ScanBarcode, "Kasa", "QR i aplikacija"],
];

function Redesign() {
  return (
    <Slide id="redesign" theme="paper">
      <Headline>Isti lokal. [[Novi izgled.]]</Headline>
      <motion.div
        variants={item}
        className="mt-3 flex items-center gap-2.5 md:mt-4"
      >
        <span className="flex">
          {[RED, "#000", "#fff"].map((c, i) => (
            <span
              key={c}
              className="h-6 w-6 rounded-full md:h-7 md:w-7"
              style={{
                background: c,
                marginLeft: i ? -7 : 0,
                boxShadow:
                  "0 0 0 2px #F7F6F2, inset 0 0 0 1px rgba(0,0,0,0.12)",
              }}
            />
          ))}
        </span>
        <b className="text-[14px] font-extrabold md:text-[17px]">
          Sve u Neto bojama.
        </b>
      </motion.div>
      <Visual className="!mt-4 grid grid-cols-2 gap-2 md:!mt-7 md:gap-4 lg:grid-cols-3">
        {ZONES.map(([Icon, title, hint], i) => (
          <motion.div
            key={title}
            variants={pop}
            custom={i % 2 ? 1.5 : -1.5}
            className="flex items-center gap-2.5 bg-white p-2.5 [--h:40px] md:gap-4 md:p-4 md:[--h:52px]"
            style={{ border: "2px solid #000", borderRadius: NETO_RADIUS }}
          >
            <IconTile icon={Icon} size={20} />
            <span className="min-w-0">
              <b className="block text-[13.5px] font-extrabold leading-[1.15] md:text-[18px]">
                {title}
              </b>
              <span
                className="mt-0.5 block text-[11.5px] leading-[1.2] md:text-[14px]"
                style={{ color: RED }}
              >
                {hint}
              </span>
            </span>
          </motion.div>
        ))}
      </Visual>
      <motion.p
        variants={item}
        className="mt-3 flex items-center gap-2 text-[12.5px] md:mt-5 md:text-[14px]"
        style={{ color: "#6B6B6B" }}
      >
        <PencilRuler size={15} className="flex-none" style={{ color: RED }} />
        Konačno rešenje crta arhitekta, Skeylo vodi projekat.
      </motion.p>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 04  Who does the work                                                     */
/* ------------------------------------------------------------------------ */

/* A name if we have one, a dashed blank if we do not yet. */
function NameSlot({ name }: { name?: string }) {
  if (name?.trim())
    return (
      <span className="block truncate text-[12.5px] font-bold md:text-[14px]">
        {name}
      </span>
    );
  return (
    <span
      className="mt-1 block w-full max-w-[150px] border-b-[1.5px] border-dashed pb-0.5 text-[10px] uppercase tracking-[0.12em] md:text-[11px]"
      style={{ borderColor: "#C9C5BB", color: "#9A9A9A", fontFamily: MONO }}
    >
      upisujemo
    </span>
  );
}

function PersonCard({ p, big = false }: { p: Person; big?: boolean }) {
  const filled = !!p.name?.trim();
  return (
    <motion.div
      variants={pop}
      custom={big ? -1 : 1.5}
      className={`flex items-center gap-2.5 bg-white md:gap-3.5 ${big ? "p-3 [--h:46px] md:p-4 md:[--h:56px]" : "p-2.5 [--h:38px] md:p-3.5 md:[--h:46px]"}`}
      style={{
        border: filled
          ? "2px solid #000"
          : `2px dashed ${big ? RED : "#C9C5BB"}`,
        borderRadius: NETO_RADIUS,
      }}
    >
      <IconTile icon={p.icon} size={big ? 22 : 18} bg={big ? RED : "#000"} />
      <span className="min-w-0 flex-1">
        <b
          className={`block font-extrabold leading-[1.15] ${big ? "text-[17px] md:text-[21px]" : "text-[13.5px] md:text-[16px]"}`}
        >
          {p.role}
        </b>
        <NameSlot name={p.name} />
      </span>
    </motion.div>
  );
}

function Builders() {
  return (
    <Slide id="builders" theme="light">
      <Headline>Ko radi [[redizajn.]]</Headline>
      <Visual className="!mt-4 grid gap-2 md:!mt-7 md:gap-3">
        <motion.div
          variants={item}
          className="flex items-center justify-between gap-3 bg-black px-3 py-2.5 text-white md:px-4 md:py-3"
          style={{ borderRadius: NETO_RADIUS }}
        >
          <span className="flex pl-1">
            {(Object.keys(PEOPLE) as (keyof typeof PEOPLE)[]).map((k, i) => (
              <span
                key={k}
                className="relative"
                style={{ marginLeft: i ? -9 : 0, zIndex: 6 - i }}
              >
                <Face who={k} size={28} />
              </span>
            ))}
          </span>
          <b className="text-right text-[13px] font-extrabold italic leading-[1.15] md:text-[17px]">
            Skeylo vodi ceo projekat
          </b>
        </motion.div>
        <PersonCard p={ARCHITECT} big />
        <div className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-3">
          {CRAFTS.map((p) => (
            <PersonCard key={p.role} p={p} />
          ))}
          <motion.div
            variants={pop}
            custom={-1.5}
            className="flex items-center gap-2.5 p-2.5 [--h:38px] md:gap-3.5 md:p-3.5 md:[--h:46px]"
            style={{ border: "2px dashed #C9C5BB", borderRadius: NETO_RADIUS }}
          >
            <IconTile icon={Plus} size={18} bg="#F7F6F2" color="#6B6B6B" />
            <b
              className="text-[13px] font-extrabold leading-[1.15] md:text-[16px]"
              style={{ color: "#6B6B6B" }}
            >
              Po potrebi još
            </b>
          </motion.div>
        </div>
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 05  The budget                                                            */
/* ------------------------------------------------------------------------ */

function Budget() {
  return (
    <Slide id="budget" theme="dark">
      <Headline>Okvirni budžet. [[Sve na jednom računu.]]</Headline>
      <Visual className="!mt-5 md:!mt-8">
        <Receipt />
      </Visual>
      <motion.p
        variants={item}
        className="mx-auto mt-3 max-w-[400px] text-center text-[12.5px] md:mt-5 md:text-[14px]"
        style={{ color: "#B5B5B5" }}
      >
        Iznose za radove upisujemo zajedno sa arhitektom i majstorima.
      </motion.p>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 06  QR codes everywhere                                                   */
/* ------------------------------------------------------------------------ */

function QrEverywhere() {
  return (
    <Slide id="qr" theme="paper">
      <Headline>QR kod. [[Na svakom koraku.]]</Headline>
      <Visual className="!mt-4 grid items-center gap-3 md:!mt-7 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
        <div>
          <p
            className="mb-2 text-right text-[10px] uppercase tracking-[0.14em] md:text-[11px]"
            style={{ fontFamily: MONO, color: "#9A9A9A" }}
          >
            Šematski prikaz
          </p>
          <FloorPlan className="mx-auto max-w-[560px]" />
        </div>
        <motion.div variants={pop} custom={2}>
          <QrSticker />
        </motion.div>
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 07  The app                                                               */
/* ------------------------------------------------------------------------ */

function TheApp() {
  return (
    <Slide id="app" theme="dark">
      <Headline>{`Neto aplikacija. [[−${FIRST_BUY_OFF}% na prvu kupovinu.]]`}</Headline>
      <Visual className="!mt-5 grid items-center gap-6 md:!mt-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
        <div>
          <Steps
            steps={[
              { icon: QrCode, label: "Skenira QR" },
              { icon: Download, label: "Skine aplikaciju" },
              { icon: ScanBarcode, label: "Pokaže bar kod" },
              { icon: BadgePercent, label: `−${FIRST_BUY_OFF}% na računu` },
            ]}
          />
          <motion.div
            variants={item}
            className="mt-6 hidden items-center gap-3 lg:flex"
          >
            <Face who="luka" size={40} />
            <span className="text-[15px]" style={{ color: "#B5B5B5" }}>
              <b className="text-white">Razvoj vodi Luka.</b> Procenat i uslove
              potvrđujemo sa vama.
            </span>
          </motion.div>
        </div>
        <motion.div variants={pop} custom={-2} className="pt-2">
          <AppCard />
        </motion.div>
      </Visual>
      <motion.div
        variants={item}
        className="mt-5 flex items-center gap-3 lg:hidden"
      >
        <Face who="luka" size={34} />
        <span
          className="text-[12.5px] leading-[1.3]"
          style={{ color: "#B5B5B5" }}
        >
          <b className="text-white">Razvoj vodi Luka.</b> Procenat i uslove
          potvrđujemo sa vama.
        </span>
      </motion.div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* What the app does, and what it does for Neto                              */
/* ------------------------------------------------------------------------ */

/* Every tile is a screen the demo phone two slides on really has. */
const APP_FEATURES: [IconType, string, string][] = [
  [CreditCard, "Neto kartica", "Bar kod na kasi, u Wallet-u"],
  [Tag, "Akcije nedelje", "Isti katalog kao na sajtu"],
  [Bell, "Obaveštenja", "Nova akcija stiže odmah"],
  [Gift, "Neto Klub", "Poeni i vaučeri"],
  [ListChecks, "Lista za kupovinu", "Vidi koliko štedi"],
  [MapPin, "Tvoj Neto", "Mapa, poziv, navigacija"],
];

function AppFeatures() {
  return (
    <Slide id="app-features" theme="paper">
      <Headline>Neto u džepu. [[Sve na jednom mestu.]]</Headline>
      <Visual className="!mt-4 grid grid-cols-2 gap-2 md:!mt-7 md:gap-4 lg:grid-cols-3">
        {APP_FEATURES.map(([Icon, title, hint], i) => (
          <motion.div
            key={title}
            variants={pop}
            custom={i % 2 ? 1.5 : -1.5}
            className="flex flex-col items-start gap-2 bg-white p-2.5 [--h:40px] md:flex-row md:items-center md:gap-4 md:p-4 md:[--h:52px]"
            style={{ border: "2px solid #000", borderRadius: NETO_RADIUS }}
          >
            <IconTile icon={Icon} size={20} />
            <span className="min-w-0">
              <b className="block text-[14px] font-extrabold leading-[1.15] md:text-[18px]">
                {title}
              </b>
              <span
                className="mt-0.5 block text-[11.5px] leading-[1.2] md:text-[14px]"
                style={{ color: RED }}
              >
                {hint}
              </span>
            </span>
          </motion.div>
        ))}
      </Visual>
      <motion.p
        variants={item}
        className="mt-3 flex items-center gap-2 text-[12.5px] md:mt-5 md:text-[14px]"
        style={{ color: "#6B6B6B" }}
      >
        <Smartphone size={15} className="flex-none" style={{ color: RED }} />
        iOS i Android, objavljena na App Store i Google Play.
      </motion.p>
    </Slide>
  );
}

const APP_VALUE: [IconType, string, string][] = [
  [Users, "Baza kupaca", "Ko kupuje, koliko često, gde"],
  [Bell, "Vaš kanal", "Obaveštenje umesto letka"],
  [Repeat, "Kupci se vraćaju", "Poeni i vaučeri"],
  [BarChart3, "Sve se meri", "Preuzimanja, poeni, kodovi"],
  [SlidersHorizontal, "Vi upravljate", "Akcije iz admin panela"],
  [Store, "Svaki Neto", "Jedna aplikacija za sve radnje"],
];

function AppValue() {
  return (
    <Slide id="app-value" theme="red">
      <Headline>Svaki kupac. [[Vaš kontakt.]]</Headline>
      <Visual className="!mt-4 grid grid-cols-2 gap-2 md:!mt-7 md:gap-4 lg:grid-cols-3">
        {APP_VALUE.map(([Icon, title, hint], i) => (
          <motion.div
            key={title}
            variants={pop}
            custom={i % 2 ? 1.5 : -1.5}
            className="flex flex-col items-start gap-2 bg-white p-2.5 text-black [--h:40px] md:flex-row md:items-center md:gap-4 md:p-4 md:[--h:52px]"
            style={{ borderRadius: NETO_RADIUS }}
          >
            <IconTile icon={Icon} size={20} />
            <span className="min-w-0">
              <b className="block text-[14px] font-extrabold leading-[1.15] md:text-[18px]">
                {title}
              </b>
              <span
                className="mt-0.5 block text-[11.5px] leading-[1.2] md:text-[14px]"
                style={{ color: RED }}
              >
                {hint}
              </span>
            </span>
          </motion.div>
        ))}
      </Visual>
      <motion.p
        variants={item}
        className="mt-3 px-3 py-2.5 text-center text-[14px] font-extrabold italic leading-[1.2] md:mt-5 md:py-3 md:text-[19px]"
        style={{ background: "rgba(0,0,0,0.18)", borderRadius: NETO_RADIUS }}
      >
        Letak završi u kanti. Aplikacija ostaje u telefonu.
      </motion.p>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* Neto's knowledge base                                                     */
/* ------------------------------------------------------------------------ */

const GUARDS: [IconType, string][] = [
  [Lock, "Šifrovani podaci"],
  [UserCheck, "Pristup po ulogama"],
  [DatabaseBackup, "Rezervne kopije"],
  [ShieldCheck, "Samo za Neto tim"],
];

/* The way in, in Luka's words: the plans nobody could find. */
function KnowledgeIntro() {
  return (
    <Slide id="knowledge-intro" theme="paper">
      <Visual className="!mt-0">
        <KnowledgeStory />
      </Visual>
    </Slide>
  );
}

function Knowledge() {
  return (
    <Slide id="knowledge" theme="dark">
      <Headline>Neto baza znanja. [[Bezbedno, na jednom mestu.]]</Headline>
      <Visual className="!mt-5 grid items-center gap-4 md:!mt-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
        <KnowledgeFlow />
        <div className="grid grid-cols-2 gap-1.5 md:gap-2.5 lg:grid-cols-1">
          {GUARDS.map(([Icon, label]) => (
            <motion.span
              key={label}
              variants={item}
              className="flex items-center gap-2 px-2.5 py-2 text-[12.5px] font-bold leading-[1.15] md:px-3.5 md:py-3 md:text-[16px]"
              style={{ border: "1px solid #333", borderRadius: NETO_RADIUS }}
            >
              <Icon
                size={16}
                className="flex-none"
                style={{ color: "#FF4B42" }}
              />
              {label}
            </motion.span>
          ))}
        </div>
      </Visual>
    </Slide>
  );
}

function KnowledgeDemo() {
  return (
    <Slide id="knowledge-demo" theme="paper">
      <Headline>Jedan klik. [[Svaki dokument.]]</Headline>
      <Visual className="!mt-4 md:!mt-7">
        <KnowledgeSearch />
      </Visual>
      <motion.p
        variants={item}
        className="mx-auto mt-3 flex max-w-[560px] items-center gap-2 text-[12px] md:mt-4 md:text-[14px]"
        style={{ color: "#6B6B6B" }}
      >
        <Globe size={14} className="flex-none" style={{ color: RED }} />
        Web servis, na telefonu i računaru. Odgovori su ilustrativni.
      </motion.p>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 08  Three months                                                          */
/* ------------------------------------------------------------------------ */

const PLAN: { title: string; does: [IconType, string][] }[] = [
  {
    title: "Projekat",
    does: [
      [Smartphone, "Dizajn aplikacije"],
      [PencilRuler, "Arhitekta crta"],
      [Globe, "Sajt i katalog"],
      [Database, "Prikupljamo dokumente"],
    ],
  },
  {
    title: "Radovi",
    does: [
      [Smartphone, "Aplikacija u testu"],
      [HardHat, "Majstori rade"],
      [Clapperboard, "Snimamo promenu"],
      [Search, "Baza u testu"],
      [QrCode, "QR materijali"],
    ],
  },
  {
    title: "Otvaranje",
    does: [
      [Smartphone, "Aplikacija uživo"],
      [PartyPopper, "Novi lokal"],
      [BadgePercent, `−${FIRST_BUY_OFF}% prva kupovina`],
      [Megaphone, "Kampanja otvaranja"],
    ],
  },
];

const EVERY_MONTH: [IconType, string][] = [
  [Video, "Kreative"],
  [Target, "Meta oglasi"],
  [BarChart3, "Izveštaji"],
];

function Months() {
  return (
    <Slide id="months" theme="red">
      <MonthsBody />
    </Slide>
  );
}

function MonthsBody() {
  const active = useSlideActive();
  return (
    <>
      <Headline>Tri meseca. [[Korak po korak.]]</Headline>
      <Visual className="relative !mt-5 grid gap-4 pl-[30px] md:!mt-9 md:grid-cols-3 md:gap-5 md:pl-0">
        {/* the line down the months on a phone */}
        <div
          aria-hidden
          className="absolute bottom-3 left-[8px] top-2 w-[3px] rounded-sm md:hidden"
          style={{ background: "rgba(255,255,255,0.3)" }}
        >
          <motion.i
            className="block w-full rounded-sm bg-white"
            initial={{ height: 0 }}
            animate={{ height: active ? "100%" : 0 }}
            transition={{ duration: 1.8, ease: [0.3, 0.7, 0.3, 1], delay: 0.5 }}
          />
        </div>
        {PLAN.map((m, i) => (
          <motion.div
            key={m.title}
            variants={pop}
            custom={i % 2 ? 1.5 : -1.5}
            className="relative md:p-5"
            style={{ borderRadius: NETO_RADIUS }}
          >
            <span
              aria-hidden
              className="absolute -left-[29px] top-1 h-[17px] w-[17px] rounded-full bg-white md:hidden"
              style={{ boxShadow: `0 0 0 3px ${RED}` }}
            />
            <span
              aria-hidden
              className="absolute inset-0 hidden rounded-[inherit] md:block"
              style={{ background: "rgba(0,0,0,0.16)" }}
            />
            <div className="relative">
              <span
                className="text-[10.5px] uppercase tracking-[0.16em] md:text-[11px]"
                style={{ fontFamily: MONO, color: "#FFD9D6" }}
              >
                Mesec {i + 1}
              </span>
              <b className="block text-[21px] font-black italic leading-[1.05] md:mt-1 md:text-[28px]">
                {m.title}
              </b>
              <div className="mt-2 flex flex-wrap gap-1.5 md:mt-4 md:flex-col md:gap-2">
                {m.does.map(([Icon, label]) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-[4px] text-[11.5px] font-bold text-black md:self-start md:px-2.5 md:py-1.5 md:text-[14px]"
                  >
                    <Icon size={13} style={{ color: RED }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </Visual>
      <motion.div
        variants={item}
        className="mt-4 flex flex-wrap items-center gap-x-3.5 gap-y-1 px-3 py-2 md:mt-5 md:gap-2.5 md:px-4 md:py-3"
        style={{ background: "rgba(0,0,0,0.18)", borderRadius: NETO_RADIUS }}
      >
        <span
          className="w-full text-[10.5px] uppercase tracking-[0.16em] md:mr-1 md:w-auto md:text-[11px]"
          style={{ fontFamily: MONO, color: "#FFD9D6" }}
        >
          Svaki mesec
        </span>
        {EVERY_MONTH.map(([Icon, label]) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-extrabold md:text-[15px]"
          >
            <Icon size={14} />
            {label}
          </span>
        ))}
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* 09  The offer                                                             */
/* ------------------------------------------------------------------------ */

const INCLUDED: [IconType, string][] = [
  [Store, "Redizajn lokala"],
  [Globe, "Sajt + Interaktivni katalog"],
  [Database, "Neto baza znanja"],
  [Clapperboard, "Kreative: plaćene i organske"],
  [QrCode, "QR kod na svakom koraku"],
  [Megaphone, "Kampanja otvaranja"],
];

function Price() {
  return (
    <Slide id="price" theme="dark">
      <Headline center>Tri meseca. [[Jedan tim.]]</Headline>
      <Visual className="!mt-4 grid gap-3 md:!mt-8 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-10">
        <motion.article
          variants={pop}
          custom={1.5}
          className="px-4 py-4 text-white md:px-6 md:py-6"
          style={{ background: RED, borderRadius: "10px 34px 10px 10px" }}
        >
          <span
            className="text-[10px] uppercase tracking-[0.16em] md:text-[11px]"
            style={{ fontFamily: MONO, color: "rgba(255,255,255,0.85)" }}
          >
            Skeylo agencija · {MONTHS} meseca
          </span>
          <h2 className="mt-0.5 text-[22px] font-black italic leading-[1.05] md:mt-1 md:text-[28px]">
            Sve iz prve ponude, i više
          </h2>
          <div
            className="mt-2.5 flex items-center gap-2.5 bg-white px-2.5 py-2 text-black md:mt-5 md:gap-3.5 md:px-3.5 md:py-3"
            style={{ borderRadius: NETO_RADIUS }}
          >
            <span
              className="grid h-9 w-9 flex-none place-items-center text-white md:h-11 md:w-11"
              style={{ background: RED, borderRadius: TILE_RADIUS }}
            >
              <Smartphone size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-[16px] font-black italic leading-[1.1] md:text-[20px]">
                Neto aplikacija
              </b>
              <span
                className="block text-[11.5px] leading-[1.2] md:text-[13.5px]"
                style={{ color: RED }}
              >
                iOS i Android · kartica, klub, obaveštenja
              </span>
            </span>
            <span
              className="hidden flex-none rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white md:inline"
              style={{ background: "#000", fontFamily: MONO }}
            >
              Glavni deo
            </span>
          </div>
          <ul className="mt-2.5 grid gap-1 md:mt-4 md:gap-2">
            {INCLUDED.map(([Icon, label]) => (
              <li
                key={label}
                className="flex items-center gap-2.5 text-[13.5px] font-bold leading-[1.2] md:text-[16px]"
              >
                <span
                  className="grid h-[26px] w-[26px] flex-none place-items-center rounded-full bg-white md:h-8 md:w-8"
                  style={{ color: RED }}
                >
                  <Icon size={14} />
                </span>
                <span className="flex-1">{label}</span>
                <Check size={16} strokeWidth={3} />
              </li>
            ))}
          </ul>
          <div
            className="mt-3 flex items-end justify-between gap-3 pt-3 md:mt-5 md:pt-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.35)" }}
          >
            <span className="pb-1 text-[12.5px] leading-[1.25] text-white/85 md:text-[13.5px]">
              Ukupno, {MONTHS} meseca
              <br />
              {fmt(AGENCY_FEE / MONTHS)} € mesečno
            </span>
            <strong className="whitespace-nowrap text-[40px] font-black italic leading-none tracking-[-0.02em] md:text-[52px]">
              <Count to={AGENCY_FEE} delay={0.5} />{" "}
              <span className="text-[22px] md:text-[26px]">€</span>
            </strong>
          </div>
        </motion.article>
        <div className="grid gap-2 md:gap-3">
          <Note icon={Hammer}>
            Radovi na lokalu, budžet za Meta oglase i modeli idu odvojeno od
            agencije.
          </Note>
          <Note icon={ReceiptText} boxed>
            <b>Sve cene su bez PDV-a.</b> Ako vam je potrebna faktura, na cenu
            se dodaje PDV.
          </Note>
          <strong className="mt-2 hidden text-[22px] font-extrabold italic lg:block">
            Svaki dinar je bitan.
          </strong>
        </div>
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */

export const SLIDES: DeckSlide[] = [
  { id: "cover", label: "Neto × Skeylo", theme: "dark", Component: Cover },
  { id: "scope", label: "Šta radimo", theme: "red", Component: Scope },
  { id: "crew", label: "Vaš tim", theme: "paper", Component: Team },
  ...SPOTS.map(spotSlide),
  { id: "redesign", label: "Redizajn", theme: "paper", Component: Redesign },
  {
    id: "builders",
    label: "Ko radi redizajn",
    theme: "light",
    Component: Builders,
  },
  { id: "budget", label: "Okvirni budžet", theme: "dark", Component: Budget },
  { id: "qr", label: "QR kod svuda", theme: "paper", Component: QrEverywhere },
  { id: "app", label: "Neto aplikacija", theme: "dark", Component: TheApp },
  {
    id: "app-features",
    label: "Aplikacija: šta radi",
    theme: "paper",
    Component: AppFeatures,
  },
  {
    id: "app-phone",
    label: "Aplikacija: demo",
    theme: "dark",
    Component: AppPhone,
  },
  {
    id: "app-value",
    label: "Aplikacija: šta Neto dobija",
    theme: "red",
    Component: AppValue,
  },
  { id: "web", label: "Sajt i katalog", theme: "light", Component: Web },
  {
    id: "demo-phone",
    label: "Interaktivni Katalog: demo",
    theme: "light",
    Component: DemoPhone,
  },
  {
    id: "knowledge-intro",
    label: "Baza znanja: zašto",
    theme: "paper",
    Component: KnowledgeIntro,
  },
  {
    id: "knowledge",
    label: "Baza znanja",
    theme: "dark",
    Component: Knowledge,
  },
  {
    id: "knowledge-demo",
    label: "Baza znanja: demo",
    theme: "paper",
    Component: KnowledgeDemo,
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
  { id: "months", label: "Tri meseca", theme: "red", Component: Months },
  { id: "price", label: "Ponuda", theme: "dark", Component: Price },
];
