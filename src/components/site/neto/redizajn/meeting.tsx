"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
  Headline,
  MONO,
  POP_SPRING,
  RED,
  Slide,
  Visual,
  pop,
  useSlideActive,
} from "../primitives";
import { MEETING, WHATSAPP } from "./data";

/* ------------------------------------------------------------------------
   The deck's last word: one meeting with Bojan and Jovana, the one where
   the decision gets made, and three slots to pick from. The slots are the
   next free ones in Luka's calendar (/api/sastanak), one per working day;
   picking one opens WhatsApp with that slot written out. If the calendar
   can't be reached, the next three working days at `MEETING.prefer`.
   ------------------------------------------------------------------------ */

export type Termin = { day: string; time: string };

const DAYS = [
  "Nedelja",
  "Ponedeljak",
  "Utorak",
  "Sreda",
  "Četvrtak",
  "Petak",
  "Subota",
];
const MONTHS = [
  "januar",
  "februar",
  "mart",
  "april",
  "maj",
  "jun",
  "jul",
  "avgust",
  "septembar",
  "oktobar",
  "novembar",
  "decembar",
];

const ymd = (day: string) =>
  day.split("-").map(Number) as [number, number, number];
const weekday = (day: string) => {
  const [y, m, d] = ymd(day);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};
const addDays = (day: string, n: number) => {
  const [y, m, d] = ymd(day);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};
const mins = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const hhmm = (n: number) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
const workday = (day: string) => {
  const w = weekday(day);
  return w >= 1 && w <= 5;
};

/* Today in Belgrade, whatever the viewer's clock says. */
const belgradeToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Belgrade" }).format(
    new Date(),
  );

/* The next working days from tomorrow, at the preferred hour. */
function fallback(today = belgradeToday()): Termin[] {
  const out: Termin[] = [];
  for (let d = addDays(today, 1); out.length < MEETING.slots; d = addDays(d, 1))
    if (workday(d)) out.push({ day: d, time: MEETING.prefer });
  return out;
}

/* One slot per working day from tomorrow on: the one that leaves the whole
   meeting free and starts closest to the preferred hour. */
function pick(slots: string[], len: number, today: string): Termin[] {
  const free = new Set(slots);
  const need = Math.max(1, Math.ceil(MEETING.minutes / Math.max(1, len)));
  const byDay = new Map<string, string[]>();
  for (const s of slots) {
    const day = s.slice(0, 10);
    if (day <= today || !workday(day)) continue;
    const time = s.slice(11, 16);
    const whole = Array.from(
      { length: need },
      (_, k) => `${day}T${hhmm(mins(time) + k * len)}`,
    ).every((x) => free.has(x));
    if (!whole) continue;
    byDay.set(day, [...(byDay.get(day) ?? []), time]);
  }
  const want = mins(MEETING.prefer);
  return [...byDay.keys()]
    .sort()
    .slice(0, MEETING.slots)
    .map((day) => {
      const times = byDay.get(day)!;
      times.sort(
        (a, b) =>
          Math.abs(mins(a) - want) - Math.abs(mins(b) - want) ||
          mins(a) - mins(b),
      );
      return { day, time: times[0] };
    });
}

/* Started once, while the price slide is up, so the slots are there by the
   time anyone reaches the last slide. */
let loading: Promise<Termin[]> | null = null;

export function prefetchTermini() {
  if (loading) return loading;
  loading = (async () => {
    const ctrl = new AbortController();
    const stop = setTimeout(() => ctrl.abort(), 3500);
    try {
      const r = await fetch("/api/sastanak", {
        cache: "no-store",
        signal: ctrl.signal,
      });
      const j = (await r.json()) as {
        ok?: boolean;
        len?: number;
        today?: string;
        slots?: string[];
      };
      if (!j.ok || !Array.isArray(j.slots)) return fallback();
      const got = pick(j.slots, j.len ?? 30, j.today ?? belgradeToday());
      return got.length === MEETING.slots ? got : fallback(j.today);
    } catch {
      return fallback();
    } finally {
      clearTimeout(stop);
    }
  })();
  return loading;
}

const link = (t: Termin) => {
  const [, m, d] = ymd(t.day);
  return (
    `${WHATSAPP}?text=` +
    encodeURIComponent(
      `Zdravo Luka, odgovara nam ${DAYS[weekday(t.day)].toLowerCase()}, ${d}. ${MONTHS[m - 1]} u ${t.time}. Vidimo se na sastanku na kom donosimo odluku.`,
    )
  );
};

/* A tear-off calendar page per slot. */
function Sheet({ t, i }: { t: Termin; i: number }) {
  const active = useSlideActive();
  const [, m, d] = ymd(t.day);
  return (
    <motion.a
      href={link(t)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${DAYS[weekday(t.day)]}, ${d}. ${MONTHS[m - 1]} u ${t.time}`}
      className="group relative block overflow-hidden bg-white text-[#111] transition-[translate,scale] hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-[0.97]"
      style={{ borderRadius: "6px 20px 6px 6px" }}
      initial={{ opacity: 0, y: 26, rotate: i === 1 ? 0 : i ? 3 : -3 }}
      animate={
        active
          ? { opacity: 1, y: 0, rotate: 0 }
          : { opacity: 0, y: 26, rotate: i === 1 ? 0 : i ? 3 : -3 }
      }
      transition={{ ...POP_SPRING, delay: 0.55 + i * 0.12 }}
    >
      <span
        className="block px-2 py-1.5 text-center text-[9.5px] font-semibold uppercase tracking-[0.14em] text-white md:py-2 md:text-[11px]"
        style={{ background: RED, fontFamily: MONO }}
      >
        {DAYS[weekday(t.day)]}
      </span>
      <span className="block px-2 pb-3 pt-2 text-center md:pb-4 md:pt-3">
        <b className="block text-[44px] font-black italic leading-[0.95] tracking-[-0.03em] md:text-[60px]">
          {d}
        </b>
        <span
          className="mt-0.5 block text-[10.5px] uppercase tracking-[0.1em] text-[#6B6B6B] md:text-[12px]"
          style={{ fontFamily: MONO }}
        >
          {MONTHS[m - 1]}
        </span>
        <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-[13px] font-extrabold text-white transition-colors group-hover:bg-[#E2231A] md:mt-3 md:px-3 md:text-[15px]">
          {t.time}
          <ArrowUpRight size={13} className="flex-none" />
        </span>
      </span>
    </motion.a>
  );
}

function SheetBlank() {
  return (
    <span
      aria-hidden
      className="block h-[154px] animate-pulse bg-white/10 md:h-[196px]"
      style={{ borderRadius: "6px 20px 6px 6px" }}
    />
  );
}

/* Who sits at the table: Bojan and Jovana, and Skeylo. */
function Table() {
  return (
    <div className="flex items-center justify-center gap-3 md:gap-5">
      <div className="flex flex-col items-center">
        <div className="flex">
          {MEETING.people.map((name, i) => (
            <motion.span
              key={name}
              variants={pop}
              custom={i ? 4 : -4}
              className="relative grid h-12 w-12 place-items-center rounded-full text-[20px] font-black italic text-white md:h-14 md:w-14 md:text-[23px]"
              style={{
                background: RED,
                boxShadow: "0 0 0 3px #000",
                marginLeft: i ? -8 : 0,
                zIndex: MEETING.people.length - i,
              }}
            >
              {name[0]}
            </motion.span>
          ))}
        </div>
        <span className="mt-1.5 text-[12px] font-bold md:text-[14px]">
          {MEETING.people.join(" i ")}
        </span>
      </div>
      <motion.span
        variants={pop}
        className="-mt-6 text-[22px] font-black italic text-[#6B6B6B] md:text-[26px]"
        aria-hidden
      >
        ×
      </motion.span>
      <motion.span variants={pop} custom={-3} className="-mt-6">
        <Image
          src="/brand/logo.webp"
          alt="Skeylo"
          width={2000}
          height={717}
          className="h-auto w-[104px] md:w-[124px]"
        />
      </motion.span>
    </div>
  );
}

export function Meeting() {
  const [termini, setTermini] = useState<Termin[] | null>(null);

  useEffect(() => {
    let live = true;
    prefetchTermini().then((t) => live && setTermini(t));
    return () => {
      live = false;
    };
  }, []);

  return (
    <Slide id="sastanak" theme="dark">
      <Headline size="xl" center>
        Jedan sastanak. [[Jedna odluka.]]
      </Headline>
      <Visual className="!mt-5 md:!mt-8">
        <Table />
      </Visual>
      <div className="mx-auto mt-5 grid w-full max-w-[520px] grid-cols-3 gap-2.5 md:mt-8 md:gap-4">
        {termini
          ? termini.map((t, i) => <Sheet key={t.day} t={t} i={i} />)
          : Array.from({ length: MEETING.slots }, (_, i) => (
              <SheetBlank key={i} />
            ))}
      </div>
    </Slide>
  );
}
