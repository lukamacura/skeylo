"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BadgePercent,
  Check,
  BarChart3,
  Clapperboard,
  Database,
  DatabaseBackup,
  DoorOpen,
  Download,
  Globe,
  Hammer,
  HardHat,
  Lightbulb,
  Lock,
  Megaphone,
  PartyPopper,
  PencilRuler,
  Plus,
  QrCode,
  ReceiptText,
  ScanBarcode,
  Search,
  ShieldCheck,
  Signpost,
  Smartphone,
  Store,
  Tag,
  Target,
  UserCheck,
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
  type Person,
} from "./data";
import { AppCard, FloorPlan, QrSticker, Receipt, StoreReel } from "./scenes";
import { KnowledgeFlow, KnowledgeSearch } from "./knowledge";
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
            Lokal, sajt, aplikacija, baza znanja i marketing. Jedan tim.
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

const SCOPE: [IconType, string, string][] = [
  [Store, "Redizajn lokala", "Novi izgled, Neto boje"],
  [Globe, "Sajt + katalog", "Akcije uvek ažurne"],
  [Smartphone, "Aplikacija", `Bar kod, −${FIRST_BUY_OFF}% prva kupovina`],
  [Database, "Baza znanja", "Sve jednim klikom"],
  [Clapperboard, "Kreative i oglasi", "Plaćeni i organski"],
  [QrCode, "QR kod svuda", "Od izloga do kase"],
];

function Scope() {
  return (
    <Slide id="scope" theme="red">
      <Headline>Šta radimo [[za tri meseca.]]</Headline>
      <Visual className="!mt-5 grid grid-cols-2 gap-2 md:!mt-8 md:gap-4 lg:grid-cols-3">
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
/* 04-05  Before and after                                                   */
/* ------------------------------------------------------------------------ */

/* Two halves of one pill, the same on both slides, so the pair reads as a
   before and an after. */
function PrePosle({ on }: { on: "pre" | "posle" }) {
  const t = useTheme();
  return (
    <motion.div
      variants={item}
      className="mt-3 inline-flex self-start rounded-full p-[3px] text-[10.5px] font-semibold uppercase tracking-[0.16em] md:mt-4 md:text-[11.5px]"
      style={{ fontFamily: MONO, border: `1px solid ${t.line}` }}
    >
      {(["pre", "posle"] as const).map((k) => (
        <span
          key={k}
          className="rounded-full px-3.5 py-1"
          style={{
            background: on === k ? RED : "transparent",
            color: on === k ? "#fff" : t.muted,
          }}
        >
          {k}
        </span>
      ))}
    </motion.div>
  );
}

const BEFORE: { src: string; alt: string; w: number; h: number }[] = [
  {
    src: "/clients/neto/pre-1.webp",
    alt: "Fasada lokala danas",
    w: 900,
    h: 1206,
  },
  {
    src: "/clients/neto/pre-2.webp",
    alt: "Ulaz i rafovi sa kućnom hemijom danas",
    w: 1280,
    h: 714,
  },
  {
    src: "/clients/neto/pre-3.webp",
    alt: "Prolaz sa slatkišima danas",
    w: 1280,
    h: 714,
  },
  {
    src: "/clients/neto/pre-4.webp",
    alt: "Pića i frižider danas",
    w: 1280,
    h: 714,
  },
];

function Before() {
  return (
    <Slide id="before" theme="light">
      <Headline>Evo kako [[sad izgleda.]]</Headline>
      <PrePosle on="pre" />
      <Visual className="!mt-4 grid grid-cols-2 gap-2 [grid-template-rows:118px_118px_150px] md:!mt-6 md:h-[min(560px,calc(100svh-310px))] md:grid-cols-[0.8fr_1fr_1fr] md:gap-3 md:[grid-template-rows:repeat(2,minmax(0,1fr))]">
        {BEFORE.map((b, i) => (
          <motion.div
            key={b.src}
            variants={pop}
            custom={i % 2 ? 1.5 : -1.5}
            className={`relative overflow-hidden bg-[#eee] ${i === 0 ? "row-span-2" : ""} ${i === 3 ? "col-span-2" : ""}`}
            style={{ borderRadius: i === 0 ? "4px 22px 4px 4px" : 4 }}
          >
            <Image
              src={b.src}
              alt={b.alt}
              fill
              sizes={
                i === 0
                  ? "(min-width: 768px) 30vw, 45vw"
                  : "(min-width: 768px) 40vw, 90vw"
              }
              className="object-cover"
            />
          </motion.div>
        ))}
      </Visual>
    </Slide>
  );
}

function After() {
  return (
    <Slide id="after" theme="dark">
      <Headline>Ovako će [[izgledati.]]</Headline>
      <PrePosle on="posle" />
      <Visual className="!mt-4 md:!mt-6">
        <StoreReel className="aspect-square w-full sm:aspect-[4/3] md:aspect-video md:max-w-[min(100%,calc((100svh-340px)*16/9))]" />
      </Visual>
    </Slide>
  );
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
/* Neto's knowledge base                                                     */
/* ------------------------------------------------------------------------ */

const GUARDS: [IconType, string][] = [
  [Lock, "Šifrovani podaci"],
  [UserCheck, "Pristup po ulogama"],
  [DatabaseBackup, "Rezervne kopije"],
  [ShieldCheck, "Samo za Neto tim"],
];

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
      [PencilRuler, "Arhitekta crta"],
      [Globe, "Sajt i katalog"],
      [Database, "Prikupljamo dokumente"],
      [Smartphone, "Kreće aplikacija"],
    ],
  },
  {
    title: "Radovi",
    does: [
      [HardHat, "Majstori rade"],
      [Clapperboard, "Snimamo promenu"],
      [Search, "Baza u testu"],
      [QrCode, "QR materijali"],
    ],
  },
  {
    title: "Otvaranje",
    does: [
      [PartyPopper, "Novi lokal"],
      [Smartphone, "Aplikacija uživo"],
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
  [Smartphone, "Aplikacija sa bar kodom"],
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
          <ul className="mt-2.5 grid gap-1 md:mt-5 md:gap-2">
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
  { id: "before", label: "Lokal: pre", theme: "light", Component: Before },
  { id: "after", label: "Lokal: posle", theme: "dark", Component: After },
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
    id: "app-phone",
    label: "Aplikacija: demo",
    theme: "dark",
    Component: AppPhone,
  },
  { id: "web", label: "Sajt i katalog", theme: "light", Component: Web },
  {
    id: "demo-phone",
    label: "Interaktivni Katalog: demo",
    theme: "light",
    Component: DemoPhone,
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
