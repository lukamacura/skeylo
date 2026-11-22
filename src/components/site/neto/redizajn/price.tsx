"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clapperboard,
  Globe,
  LayoutDashboard,
  MessageCircle,
  QrCode,
  Smartphone,
  Store,
  Target,
  Video,
} from "lucide-react";
import {
  Count,
  EASE_OUT,
  Headline,
  MONO,
  POP_SPRING,
  RED,
  Slide,
  item,
  useSlideActive,
} from "../primitives";
import { MiniLogo } from "../visuals";
import { AGENCY_FEE, FULL_PACK_TEAM, MONTHS } from "./data";
import { prefetchTermini } from "./meeting";

/* ------------------------------------------------------------------------
   The offer as a Neto till receipt. Why the price is fair, in one look:
   the first lines are the Full package from the first offer, the client
   already knows them and what they cost; everything under "Novo" comes on
   top for the same monthly fee. The receipt prints out of a slot, the new
   lines light up as they come out, the total counts up. Only the total is
   printed: Luka dropped the monthly line on 2026-11-21. All of Skeylo's
   work is in the price; the ad budget and the works on the store are not,
   Neto pays those.

   2026-11-22 (Luka and Filip): it was Bojan who brought up a three-month
   test, so the slide opens with that, and for the same price he gets a plan
   for longer than the test: the plan for building the app (not in the
   first offer) and the plan for fixing up the store. Neto OS (the ERP,
   os.tsx) is in the price too, with the knowledge base as one of its
   parts. The creatives are
   what the creatives slide says: filming organic content starts, and one
   or two whole Meta campaigns, depending on how fast the works go.
   ------------------------------------------------------------------------ */

type Row = { icon: React.ElementType; label: string; tag?: string };

const FROM_FIRST: Row[] = [
  { icon: Globe, label: "Sajt + Interaktivni katalog" },
  { icon: Clapperboard, label: "Organski sadržaj: početak snimanja" },
  { icon: Target, label: "1–2 cele Meta kampanje" },
];

const ADDED: Row[] = [
  { icon: Smartphone, label: "Plan izgradnje aplikacije", tag: "Glavni deo" },
  { icon: Store, label: "Plan sređivanja lokala" },
  { icon: LayoutDashboard, label: "Neto OS (ERP) + baza znanja" },
  { icon: QrCode, label: "QR kod na svakom koraku" },
  { icon: Video, label: "Video cele promene", tag: "Bonus" },
];

const MONTHLY = AGENCY_FEE / MONTHS;
/* The comparison only holds while the monthly fee matches the first
   offer's Full package; if the fee changes, the slide drops it. */
const SAME = MONTHLY === FULL_PACK_TEAM;

/* When things land, in seconds after the slide opens. */
const PRINT = { at: 0.3, for: 0.95 };
const ROWS_AT = 0.75;
const TOTAL_AT = 1.5;

const TEETH = 40;
const TORN =
  `M0 0H${TEETH * 2}V1` +
  Array.from({ length: TEETH }, () => "l-1 3-1-3").join("") +
  "z";

function Section({
  children,
  red = false,
}: {
  children: string;
  red?: boolean;
}) {
  return (
    <p
      className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] md:text-[11px]"
      style={{ fontFamily: MONO, color: red ? RED : "#8A8A8A" }}
    >
      {children}
    </p>
  );
}

function Line({ row, i, fresh }: { row: Row; i: number; fresh: boolean }) {
  const active = useSlideActive();
  const Icon = row.icon;
  const at = ROWS_AT + i * 0.11;
  return (
    <motion.li
      className="relative -mx-2 flex items-center gap-2.5 rounded-[6px] px-2 py-[3px] md:py-[5px]"
      initial={false}
      animate={
        active && fresh
          ? {
              backgroundColor: [
                "rgba(226,35,26,0)",
                "rgba(226,35,26,0.16)",
                "rgba(226,35,26,0)",
              ],
            }
          : { backgroundColor: "rgba(226,35,26,0)" }
      }
      transition={{ delay: at, duration: 0.7, times: [0, 0.25, 1] }}
    >
      <span
        className="grid h-6 w-6 flex-none place-items-center rounded-[7px] md:h-7 md:w-7"
        style={
          fresh
            ? { background: RED, color: "#fff" }
            : { background: "#F2F0EA", color: "#8A8A8A" }
        }
      >
        <Icon size={14} strokeWidth={2.4} />
      </span>
      <span
        className={`min-w-0 flex-1 text-[14.5px] leading-[1.15] md:text-[16px] ${fresh ? "font-extrabold text-black" : "font-bold text-[#6B6B6B]"}`}
      >
        {row.label}
      </span>
      {row.tag && (
        <motion.span
          className="flex-none rounded-full px-2 py-[3px] text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white md:text-[10.5px]"
          style={{
            fontFamily: MONO,
            background: row.tag === "Bonus" ? "#16A34A" : "#000",
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={
            active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }
          }
          transition={{ ...POP_SPRING, delay: at + 0.15 }}
        >
          {row.tag}
        </motion.span>
      )}
      {fresh && !row.tag && (
        <b
          className="flex-none text-[15px] font-black leading-none"
          style={{ color: RED }}
        >
          +
        </b>
      )}
    </motion.li>
  );
}

function OfferReceipt() {
  const active = useSlideActive();
  return (
    <div className="mx-auto w-full max-w-[440px]">
      {/* the till's slot */}
      <div className="relative z-10 mx-1 h-3 rounded-full bg-[#5C0B07] shadow-[inset_0_2px_3px_rgba(0,0,0,0.6)]" />
      <div className="-mt-1.5 overflow-hidden px-3">
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: active ? "0%" : "-100%" }}
          transition={{ duration: PRINT.for, delay: PRINT.at, ease: EASE_OUT }}
          style={{ willChange: "transform" }}
        >
          <div className="bg-white px-4 pb-3.5 pt-4 text-[#111] md:px-6 md:pb-5 md:pt-5">
            <div className="flex items-center justify-between">
              <MiniLogo className="!text-[16px] md:!text-[18px]" />
              <span
                className="text-[10.5px] uppercase tracking-[0.14em] text-[#6B6B6B] md:text-[11.5px]"
                style={{ fontFamily: MONO }}
              >
                Ponuda · {MONTHS} meseca
              </span>
            </div>

            <div className="my-2.5 border-t border-dashed border-[#BDBDBD] md:my-3.5" />
            <Section>Iz prve ponude</Section>
            <ul>
              {FROM_FIRST.map((r, i) => (
                <Line key={r.label} row={r} i={i} fresh={false} />
              ))}
            </ul>

            <div className="mt-2 md:mt-3">
              <Section red>{SAME ? "Novo, bez doplate" : "Novo"}</Section>
            </div>
            <ul>
              {ADDED.map((r, i) => (
                <Line key={r.label} row={r} i={i} fresh />
              ))}
            </ul>

            <div className="my-2.5 border-t-2 border-black md:my-3.5" />
            <p className="flex items-end justify-between gap-3">
              <span
                className="pb-1 text-[12.5px] font-semibold uppercase tracking-[0.08em] md:text-[14px]"
                style={{ fontFamily: MONO }}
              >
                Ukupno
              </span>
              <strong className="whitespace-nowrap text-[38px] font-black italic leading-none tracking-[-0.02em] md:text-[48px]">
                <Count to={AGENCY_FEE} delay={TOTAL_AT} duration={1.1} />{" "}
                <span className="text-[22px] md:text-[26px]">€</span>
              </strong>
            </p>
          </div>
          <svg
            aria-hidden
            className="block h-2 w-full"
            preserveAspectRatio="none"
            viewBox={`0 0 ${TEETH * 2} 4`}
          >
            <path d={TORN} fill="#fff" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

/* The price. Bojan's own idea first (the three-month test), then what the
   receipt proves: the Full package's fee, and a plan for longer than the
   test on top. The meeting slide's slots start loading here. */
export function Price() {
  useEffect(() => {
    prefetchTermini();
  }, []);
  return (
    <Slide id="price" theme="red" className="md:!py-8">
      <motion.p
        variants={item}
        className="mx-auto mb-2.5 flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-[13.5px] font-bold md:mb-4 md:text-[16px]"
        style={{ background: "rgba(0,0,0,0.22)", color: "#fff" }}
      >
        <MessageCircle size={15} className="flex-none" />
        Pominjali ste test od {MONTHS} meseca.
      </motion.p>
      <Headline size="xl" center>
        {SAME
          ? "Ista cena. [[Plan na duže staze.]]"
          : `Novi Neto. [[Za ${MONTHS * 30} dana.]]`}
      </Headline>
      <motion.div variants={item} className="mt-4 md:mt-6">
        <OfferReceipt />
      </motion.div>
      <motion.p
        variants={item}
        className="mx-auto mt-2.5 max-w-[440px] text-center text-[12px] leading-[1.35] md:mt-4 md:text-[13.5px]"
        style={{ color: "#FFE3E0" }}
      >
        U ceni su sve naše usluge. Građevinske radove na marketu i budžet za
        oglase plaća Neto.
      </motion.p>
    </Slide>
  );
}
