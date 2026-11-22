"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { Store } from "lucide-react";
import type { DeckSlide } from "../Deck";
import {
  EASE_OUT,
  Headline,
  MONO,
  NETO_RADIUS,
  POP_SPRING,
  RED,
  Slide,
  Visual,
  pop,
  useSlideActive,
  type Theme,
} from "../primitives";
import { NetoLogo, Ticker } from "../visuals";
import { DemoStage } from "../DemoStage";
import AppDemo from "../AppDemo";
import CatalogDemo from "../CatalogDemo";
import {
  FIRST_BUY_OFF,
  LOCATION,
  MONTHS,
  QR_DOOR,
  SPOTS,
  type Spot,
} from "./data";
import { FloorPlan, QrSticker } from "./scenes";
import { KnowledgeSearch } from "./knowledge";
import { Compare, SPOT_SIZES } from "./compare";
import { QrJourney } from "./journey";
import { Price } from "./price";
import { Creatives } from "./creatives";
import { Meeting } from "./meeting";
import { NetoOs, OsAlerts, OsProof } from "./os";
import { Services } from "./services";
import { CustomerPathSlide } from "./funnel";
/* The first offer's results slide, word for word. */
import { Results } from "../slides";

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
  "Neto OS",
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
            className="mt-[3vh] text-center text-[clamp(2.2rem,min(11.5vw,8.5vh),4.8rem)] font-extrabold italic leading-[1.02] tracking-[-0.01em]"
            initial={{ opacity: 0, y: 18 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.7, delay: 0.95, ease: EASE_OUT }}
          >
            Novi Neto
            <br />
            <span style={{ color: "#FF4B42" }}>počinje ovde.</span>
          </motion.h1>
          <motion.p
            className="mt-[2.6vh] max-w-[26ch] text-balance text-center text-[clamp(16px,2.6vh,21px)] font-bold leading-[1.3]"
            {...fade(1.25)}
          >
            Za {MONTHS * 30} dana: preuređen lokal i kupci u Neto aplikaciji.
          </motion.p>
          <motion.p
            className="mt-[2.2vh] flex items-center gap-2 rounded-full px-3.5 py-2 text-[clamp(12.5px,2vh,15px)] font-bold"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid #333",
              color: "#CFCFCF",
            }}
            {...fade(1.45)}
          >
            <span
              className="grid h-6 w-6 flex-none place-items-center rounded-full text-white"
              style={{ background: RED }}
            >
              <Store size={13} />
            </span>
            {LOCATION}
          </motion.p>
        </div>
      </div>
      <motion.div className="mt-auto w-full" {...fade(1.7)}>
        <Ticker items={TICKER} />
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* The store today, spot by spot                                             */
/* ------------------------------------------------------------------------ */

/* What changes in that spot. Each one lands as the "posle" photo sweeps
   over the spot, so the eye goes from the change to its name. Chips under
   the photo on a phone, a list on a wide screen. The space is kept from
   the start so nothing shifts when they come in. */
function Fixes({
  fixes,
  pos,
  live,
}: {
  fixes: Spot["fixes"];
  pos: MotionValue<number>;
  live: boolean;
}) {
  const active = useSlideActive();
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (!live || reduce) {
      setShown(fixes.length);
      return;
    }
    const step = 100 / (fixes.length + 1);
    const off = pos.on("change", (v) => {
      const k = Math.min(fixes.length, Math.floor((100 - v) / step));
      setShown((n) => (k > n ? k : n));
    });
    /* in case the sweep is cut short before it got that far */
    const all = setTimeout(() => setShown(fixes.length), 4000);
    return () => {
      off();
      clearTimeout(all);
    };
  }, [active, live, reduce, pos, fixes.length]);

  return (
    <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 lg:flex-col lg:items-stretch lg:gap-2.5">
      <span
        className="mb-1 hidden text-[11px] uppercase tracking-[0.16em] lg:block"
        style={{ fontFamily: MONO, color: "#8A8A8A" }}
      >
        Posle redizajna
      </span>
      {fixes.map(([Icon, label], i) => (
        <motion.span
          key={label}
          className="inline-flex items-center gap-1.5 px-3 py-[7px] text-[13.5px] font-bold leading-[1.15] md:text-[15px] lg:gap-3 lg:px-4 lg:py-3.5 lg:text-[18px]"
          style={{
            border: "1px solid #333",
            borderRadius: NETO_RADIUS,
            background: "rgba(255,255,255,0.06)",
          }}
          initial={{ opacity: 0, y: 8, scale: 0.92 }}
          animate={
            i < shown
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 8, scale: 0.92 }
          }
          transition={POP_SPRING}
        >
          <Icon
            className="h-4 w-4 flex-none lg:h-5 lg:w-5"
            style={{ color: "#FF4B42" }}
          />
          {label}
        </motion.span>
      ))}
    </div>
  );
}

/* Room around the photo (see Compare). Phone: bar, padding, a two-line
   headline and two rows of chips. Wide screens: a portrait photo stands
   beside the headline and the list and takes the full height; a landscape
   one sits under the headline with the list beside it. */
const RESERVE_TALL =
  "[--reserve:272px] md:[--reserve:380px] lg:[--reserve:190px] lg:[--maxw:calc(min(100vw_-_120px,72rem)_-_400px)]";
const RESERVE_WIDE =
  "[--reserve:272px] md:[--reserve:380px] lg:[--reserve:270px] lg:[--maxw:calc(min(100vw_-_120px,72rem)_-_312px)]";

function SpotSlide({ spot }: { spot: Spot }) {
  const pos = useMotionValue(100);
  const wide = spot.w > spot.h;
  const photo = (
    <Compare
      pre={spot.pre}
      posle={spot.posle}
      alt={spot.alt}
      w={spot.w}
      h={spot.h}
      pos={pos}
      reserve={wide ? RESERVE_WIDE : RESERVE_TALL}
    />
  );
  const fixes = <Fixes fixes={spot.fixes} pos={pos} live={!!spot.posle} />;

  if (wide)
    return (
      <Slide id={spot.id} theme="dark">
        <Headline size="xl">{spot.title}</Headline>
        <Visual className="!mt-3 flex flex-col items-center gap-3 md:!mt-6 md:gap-4 lg:flex-row lg:gap-8">
          <div className="flex w-full justify-center lg:w-auto lg:flex-none">
            {photo}
          </div>
          <div className="w-full lg:w-[280px] lg:flex-none">{fixes}</div>
        </Visual>
      </Slide>
    );

  return (
    <Slide id={spot.id} theme="dark">
      <div className="grid gap-3 md:gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-14 lg:gap-y-8">
        <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <Headline size="xl">{spot.title}</Headline>
        </div>
        <Visual className="!mt-0 flex justify-center lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {photo}
        </Visual>
        <div className="lg:col-start-1 lg:row-start-2 lg:max-w-[340px] lg:self-start">
          {fixes}
        </div>
      </div>
    </Slide>
  );
}

/* One deck slide per spot, each with a named component; the deck fetches
   its two photos while the slide before it is on screen. */
function spotSlide(spot: Spot): DeckSlide {
  function SpotN() {
    return <SpotSlide spot={spot} />;
  }
  return {
    id: spot.id,
    label: spot.label,
    theme: "dark",
    Component: SpotN,
    preload: [spot.pre, spot.posle]
      .filter((src): src is string => !!src)
      .map((src) => ({ src, sizes: SPOT_SIZES })),
  };
}

/* ------------------------------------------------------------------------ */
/* QR codes everywhere                                                       */
/* ------------------------------------------------------------------------ */

function QrEverywhere() {
  return (
    <Slide id="qr" theme="paper">
      <Headline size="xl">QR kod. [[Na svakom koraku.]]</Headline>
      <Visual className="!mt-4 grid items-center gap-4 md:!mt-7 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
        <FloorPlan className="mx-auto max-w-[560px]" />
        <motion.div variants={pop} custom={2}>
          <QrSticker />
        </motion.div>
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* The app                                                                   */
/* ------------------------------------------------------------------------ */

/* The customer's side of the QR code, played on a phone: from the sticker
   on the door to the discount on the receipt. */
function TheApp() {
  return (
    <Slide id="app" theme="dark">
      <Headline size="xl">{`Skeniraj QR. [[−${FIRST_BUY_OFF}% na prvu kupovinu.]]`}</Headline>
      <Visual className="!mt-4 md:!mt-8">
        <QrJourney />
      </Visual>
    </Slide>
  );
}

/* A clickable phone with its headline. On a phone the headline sits above
   it; on a wide screen beside it, pointing at it, with the phone in the
   middle. The demos' own how-to captions are hidden: the headline says
   what to do. */
function Arrow() {
  return (
    <motion.svg
      viewBox="0 0 64 40"
      width={64}
      height={40}
      fill="none"
      stroke={RED}
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="mt-4 flex-none"
      animate={{ x: [0, 8, 0] }}
      transition={{ duration: 1.3, ease: "easeInOut", repeat: Infinity }}
    >
      <path d="M4 10c16-8 36-4 52 14" />
      <path d="M42 26l15-1-3-15" />
    </motion.svg>
  );
}

function TryPhone({
  id,
  theme,
  title,
  children,
}: {
  id: string;
  theme: Theme;
  title: string;
  children: ReactNode;
}) {
  return (
    <Slide
      id={id}
      theme={theme}
      fit={false}
      className="!py-4 lg:!py-8 [&_[data-demo]~p]:hidden"
    >
      <div className="lg:hidden">
        <Headline size="xl" center>
          {title}
        </Headline>
      </div>
      <motion.div
        variants={pop}
        custom={-2}
        className="mt-3 grid w-full items-center lg:mt-0 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-14"
      >
        <div className="hidden flex-col items-end text-right lg:flex">
          <Headline size="xl">{title}</Headline>
          <Arrow />
        </div>
        {/* A set width: with the caption gone, the frame has no text left
            to size itself by. */}
        <DemoStage>
          <div className="w-[350px]">{children}</div>
        </DemoStage>
        <div aria-hidden className="hidden lg:block" />
      </motion.div>
    </Slide>
  );
}

function AppPhone() {
  return (
    <TryPhone id="app-phone" theme="dark" title="Probajte [[Neto aplikaciju.]]">
      <AppDemo />
    </TryPhone>
  );
}

function CatalogPhone() {
  return (
    <TryPhone
      id="demo-phone"
      theme="light"
      title="Probajte [[Interaktivni katalog.]]"
    >
      <CatalogDemo />
    </TryPhone>
  );
}

/* ------------------------------------------------------------------------ */
/* Neto's knowledge base                                                     */
/* ------------------------------------------------------------------------ */

/* One slide since 2026-11-22 ("OS jedan slajd"): the story of the project
   plans nobody could find is now the demo's first question, and it gets
   found. The intro slide (KnowledgeStory) is in git history. */
function KnowledgeDemo() {
  return (
    <Slide id="knowledge" theme="paper">
      <Headline size="xl">Jedan klik. [[Svaki dokument.]]</Headline>
      <Visual className="!mt-4 md:!mt-7">
        <KnowledgeSearch />
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */

function ResultsSlide() {
  return <Results big />;
}

/* The order an offer sells in, shown rather than told: the promise, the
   store as it is today and after, the customer's way from the door to the
   discount, the three things to try with a finger, what Skeylo does (from
   strategy to the site) and one customer's way from an Instagram ad into
   the ERP, Neto OS (the modules,
   the knowledge base, the alerts, the proof), what the creatives are,
   the proof, the price, and the meeting where the decision gets made.
   Slides that were only text in boxes (scope, redesign, builders, budget,
   app tiles, site, knowledge flow, creatives, production, team, months)
   left on 2026-11-21; they are in git history. */
export const SLIDES: DeckSlide[] = [
  { id: "cover", label: "Neto × Skeylo", theme: "dark", Component: Cover },
  ...SPOTS.map(spotSlide),
  { id: "qr", label: "QR kod svuda", theme: "paper", Component: QrEverywhere },
  spotSlide(QR_DOOR),
  {
    id: "app",
    label: "Aplikacija: put kupca",
    theme: "dark",
    Component: TheApp,
  },
  {
    id: "app-phone",
    label: "Aplikacija: demo",
    theme: "dark",
    Component: AppPhone,
  },
  {
    id: "demo-phone",
    label: "Interaktivni Katalog: demo",
    theme: "light",
    Component: CatalogPhone,
  },
  { id: "radimo", label: "Šta radimo", theme: "dark", Component: Services },
  {
    id: "put-kupca",
    label: "Put kupca",
    theme: "paper",
    Component: CustomerPathSlide,
  },
  { id: "os", label: "Neto OS", theme: "dark", Component: NetoOs },
  {
    id: "knowledge",
    label: "Neto OS: baza znanja",
    theme: "paper",
    Component: KnowledgeDemo,
  },
  {
    id: "os-telefon",
    label: "Neto OS: obaveštenja",
    theme: "dark",
    Component: OsAlerts,
  },
  {
    id: "os-dokaz",
    label: "Neto OS: već radi",
    theme: "paper",
    Component: OsProof,
  },
  { id: "kreative", label: "Kreative", theme: "dark", Component: Creatives },
  { id: "results", label: "Rezultati", theme: "dark", Component: ResultsSlide },
  { id: "price", label: "Ponuda", theme: "red", Component: Price },
  { id: "sastanak", label: "Sastanak", theme: "dark", Component: Meeting },
];
