"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Archive,
  ArrowRight,
  ClipboardList,
  Database,
  FileSignature,
  FileText,
  FolderX,
  Lock,
  Map,
  ReceiptText,
  Search,
  Sparkles,
  Tag,
  Zap,
} from "lucide-react";
import {
  DISPLAY,
  EASE_OUT,
  HEADLINE_XL,
  MONO,
  NETO_RADIUS,
  POP_SPRING,
  RED,
  item,
  pop,
  useSlideActive,
} from "../primitives";

/* ------------------------------------------------------------------------ */
/* The way in: the project plans Jovana could not find. A search types      */
/* itself and comes back empty, then the promise lands, one beat at a time. */
/* ------------------------------------------------------------------------ */

const LOST = "projektni planovi";
/* When each beat of the story lands, in seconds after the slide opens. */
const BEAT = { type: 0.5, empty: 2.0, punch: 2.4, promise: 2.9, flow: 3.3 };

function LostSearch() {
  const active = useSlideActive();
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(0);
  const [found, setFound] = useState<"wait" | "looking" | "none">("wait");

  useEffect(() => {
    if (!active) return;
    if (reduce) {
      setTyped(LOST.length);
      setFound("none");
      return;
    }
    const step = ((BEAT.empty - BEAT.type - 0.6) * 1000) / LOST.length;
    let n = 0;
    let iv: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      iv = setInterval(() => {
        n += 1;
        setTyped(n);
        if (n >= LOST.length && iv) {
          clearInterval(iv);
          setFound("looking");
        }
      }, step);
    }, BEAT.type * 1000);
    const empty = setTimeout(() => setFound("none"), BEAT.empty * 1000);
    return () => {
      clearTimeout(start);
      clearTimeout(empty);
      if (iv) clearInterval(iv);
    };
  }, [active, reduce]);

  return (
    <motion.div
      variants={pop}
      custom={-1.5}
      className="w-full bg-white p-3 text-[#111] md:p-4"
      style={{ border: "2px solid #000", borderRadius: "10px 30px 10px 10px" }}
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="grid h-9 w-9 flex-none place-items-center rounded-full bg-black text-[15px] font-black italic text-white md:h-10 md:w-10"
        >
          J
        </span>
        <b className="text-[14.5px] font-extrabold leading-[1.25] md:text-[17px]">
          Tražili smo projektne planove od Jovane.
        </b>
      </div>
      <div
        className="mt-2.5 flex items-center gap-2 rounded-full px-3.5 py-2.5 text-[13.5px] font-bold md:mt-3 md:text-[15px]"
        style={{ background: "#F7F6F2", border: "1px solid #E4E2DC" }}
      >
        <Search size={16} className="flex-none" style={{ color: RED }} />
        <span className="truncate">{LOST.slice(0, typed)}</span>
        {found === "wait" && typed < LOST.length && (
          <motion.i
            aria-hidden
            className="-ml-1.5 block h-4 w-[2px] bg-[#111]"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />
        )}
      </div>
      <div className="mt-2 flex min-h-[44px] items-center gap-2.5 px-1 md:mt-2.5">
        {found === "none" ? (
          <motion.span
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
            transition={{ duration: 0.5 }}
          >
            <span
              className="grid h-9 w-9 flex-none place-items-center rounded-[10px]"
              style={{ background: "rgba(226,35,26,0.1)", color: RED }}
            >
              <FolderX size={19} />
            </span>
            <b
              className="text-[14px] font-extrabold leading-[1.2] md:text-[16px]"
              style={{ color: RED }}
            >
              Nije uspela da ih pronađe.
            </b>
          </motion.span>
        ) : found === "looking" ? (
          <span aria-label="Traži" className="flex h-9 items-center gap-1 pl-1">
            {[0, 1, 2].map((k) => (
              <motion.i
                key={k}
                className="block h-1.5 w-1.5 rounded-full bg-[#9A9A9A]"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: k * 0.12,
                }}
              />
            ))}
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}

/* Digital files and paper alike, into one locked base, found in a second. */
const INTO: [React.ElementType, string][] = [
  [FileText, "Digitalni podaci"],
  [Archive, "Fizička dokumenta"],
  [Database, "Jedna baza"],
  [Zap, "Pretraga za sekund"],
];

function OneBase() {
  const active = useSlideActive();
  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-start gap-1 md:gap-2">
      {INTO.map(([Icon, label], i) => (
        <motion.div
          key={label}
          className="contents"
          initial={false}
          animate={active ? "on" : "off"}
        >
          {i > 0 && (
            <motion.span
              aria-hidden
              className="mt-[13px] md:mt-[17px]"
              style={{ color: i === 2 ? RED : "#9A9A9A" }}
              variants={{ off: { opacity: 0 }, on: { opacity: 1 } }}
              transition={{ delay: BEAT.flow + i * 0.18 - 0.08 }}
            >
              {i === 1 ? (
                <span className="text-[16px] font-black leading-none">+</span>
              ) : (
                <ArrowRight size={16} />
              )}
            </motion.span>
          )}
          <motion.span
            className="flex flex-col items-center gap-1.5 text-center text-[11px] font-bold leading-[1.15] md:text-[13px]"
            variants={{
              off: { opacity: 0, y: 10, scale: 0.9 },
              on: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ ...POP_SPRING, delay: BEAT.flow + i * 0.18 }}
          >
            <span
              className="relative grid h-10 w-10 place-items-center md:h-12 md:w-12"
              style={{
                background: i >= 2 ? RED : "#fff",
                color: i >= 2 ? "#fff" : "#111",
                border: i >= 2 ? undefined : "2px solid #000",
                borderRadius: "10px 10px 10px 3px",
              }}
            >
              <Icon size={19} />
              {i === 2 && (
                <span className="absolute -bottom-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-black text-white">
                  <Lock size={10} strokeWidth={2.6} />
                </span>
              )}
            </span>
            {label}
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
}

export function KnowledgeStory() {
  const active = useSlideActive();
  const at = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
    transition: { duration: 0.55, delay, ease: EASE_OUT },
  });
  return (
    <div className="grid items-center gap-4 md:gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
      <LostSearch />
      <div>
        <motion.h1
          className={`${HEADLINE_XL} font-extrabold italic tracking-[-0.01em]`}
          {...at(BEAT.punch)}
        >
          To se više{" "}
          <motion.span
            className="rounded-[2px] px-[0.06em]"
            style={{
              color: RED,
              backgroundImage:
                "linear-gradient(100deg, rgba(226,35,26,0.16), rgba(226,35,26,0.16))",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "left 88%",
              WebkitBoxDecorationBreak: "clone",
              boxDecorationBreak: "clone",
            }}
            initial={{ backgroundSize: "0% 70%" }}
            animate={{ backgroundSize: active ? "100% 70%" : "0% 70%" }}
            transition={{
              delay: BEAT.punch + 0.35,
              duration: 0.45,
              ease: EASE_OUT,
            }}
          >
            neće dešavati.
          </motion.span>
        </motion.h1>
        <motion.p
          className="mt-3 text-[14px] leading-[1.45] md:mt-4 md:text-[17px]"
          style={{ color: "#333" }}
          {...at(BEAT.promise)}
        >
          Pomoći ćemo Vam da sve digitalne, pa i fizičke podatke firme{" "}
          <b className="text-black">bezbedno skladištimo u jednu bazu</b>, gde
          ćete u sekundi moći da ih pretražite.
        </motion.p>
        <div className="mt-4 md:mt-6">
          <OneBase />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Everything Neto keeps on paper and in mailboxes, falling into one locked */
/* store.                                                                   */
/* ------------------------------------------------------------------------ */

const DOCS: [React.ElementType, string][] = [
  [FileText, "Dokumentacija"],
  [Map, "Planovi lokala"],
  [FileSignature, "Ugovori"],
  [ReceiptText, "Fakture"],
  [ClipboardList, "Procedure"],
  [Tag, "Cenovnici"],
];

export function KnowledgeFlow() {
  const active = useSlideActive();
  return (
    <div className="mx-auto w-full max-w-[460px]">
      <div className="grid grid-cols-3 gap-1.5 md:gap-2">
        {DOCS.map(([Icon, label], i) => (
          <motion.span
            key={label}
            variants={pop}
            custom={i % 2 ? 2 : -2}
            className="flex flex-col items-center gap-1 px-1 py-2 text-center text-[11px] font-bold leading-[1.15] md:py-3 md:text-[13px]"
            style={{
              background: "#141414",
              border: "1px solid #2A2A2A",
              borderRadius: NETO_RADIUS,
            }}
          >
            <Icon size={18} style={{ color: "#FF4B42" }} />
            {label}
          </motion.span>
        ))}
      </div>

      {/* the documents dropping in */}
      <div
        aria-hidden
        className="relative mx-auto h-9 w-[2px] md:h-11"
        style={{ background: "#333" }}
      >
        {[0, 1, 2].map((k) => (
          <motion.i
            key={k}
            className="absolute -left-[3px] block h-2 w-2 rounded-[2px]"
            style={{ background: "#FF4B42" }}
            initial={{ top: "0%", opacity: 0 }}
            animate={
              active
                ? { top: ["0%", "100%"], opacity: [0, 1, 0] }
                : { top: "0%", opacity: 0 }
            }
            transition={{
              duration: 1.1,
              delay: 0.9 + k * 0.37,
              repeat: Infinity,
              ease: "easeIn",
            }}
          />
        ))}
      </div>

      <motion.div
        variants={item}
        className="flex items-center gap-3 px-3.5 py-3 text-white md:px-4 md:py-3.5"
        style={{ background: RED, borderRadius: "6px 22px 6px 6px" }}
      >
        <span
          className="relative grid h-11 w-11 flex-none place-items-center rounded-[12px] bg-white"
          style={{ color: RED }}
        >
          <Database size={22} />
          <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-black text-white">
            <Lock size={11} strokeWidth={2.6} />
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <b className="block text-[18px] font-black italic leading-none md:text-[21px]">
            Neto baza znanja
          </b>
          <span className="mt-1 flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[12px] font-bold md:text-[13px]">
            <Search size={13} />
            Pronađi bilo šta…
          </span>
        </span>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* The search itself, clickable: a question in, an answer out with the      */
/* documents it came from. The answers are made up for the demo.            */
/* ------------------------------------------------------------------------ */

const QA: { q: string; a: string; src: string[] }[] = [
  {
    q: "Gde je plan novog izgleda lokala?",
    a: "Poslednja verzija je od arhitekte, sa rasporedom rafova, rasvetom i mestima za QR kod.",
    src: ["Plan lokala v2.pdf", "Ponuda majstora.pdf"],
  },
  {
    q: "Koji ugovori ističu ovog meseca?",
    a: "Dva ugovora sa dobavljačima ističu do 30. novembra. Oba imaju opciju produženja.",
    src: ["Ugovori 2026.xlsx", "Dobavljač A, ugovor.pdf"],
  },
  {
    q: "Kako se radi popis na kraju meseca?",
    a: "Šest koraka, od zatvaranja kase do potpisa zapisnika. Obrazac zapisnika je u prilogu.",
    src: ["Procedura popisa.docx", "Zapisnik.xlsx"],
  },
];

function Answer({ a, src }: { a: string; src: string[] }) {
  const active = useSlideActive();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!active) return;
    let iv: ReturnType<typeof setInterval> | undefined;
    let n = 0;
    const start = setTimeout(() => {
      iv = setInterval(() => {
        n = Math.min(a.length, n + 2);
        setShown(n);
        if (n >= a.length && iv) clearInterval(iv);
      }, 20);
    }, 650);
    return () => {
      clearTimeout(start);
      if (iv) clearInterval(iv);
    };
  }, [a, active]);

  const done = shown >= a.length;

  return (
    <div className="min-h-[124px] md:min-h-[132px]">
      <div className="flex items-start gap-2.5">
        <span
          className="grid h-7 w-7 flex-none place-items-center rounded-full text-white"
          style={{ background: RED }}
        >
          <Sparkles size={14} />
        </span>
        {shown === 0 ? (
          <span aria-label="Tražim" className="flex h-7 items-center gap-1">
            {[0, 1, 2].map((k) => (
              <motion.i
                key={k}
                className="block h-1.5 w-1.5 rounded-full bg-[#9A9A9A]"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: k * 0.12,
                }}
              />
            ))}
          </span>
        ) : (
          <p
            className="pt-1 text-[13.5px] leading-[1.4] text-[#111] md:text-[15px]"
            aria-live="polite"
          >
            {a.slice(0, shown)}
          </p>
        )}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5 pl-[38px]">
        {src.map((s, i) => (
          <motion.span
            key={s}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[#333] md:text-[12px]"
            style={{ background: "#F2F0EA", fontFamily: MONO }}
            initial={{ opacity: 0, y: 6 }}
            animate={done ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ ...POP_SPRING, delay: i * 0.1 }}
          >
            <FileText size={12} style={{ color: RED }} />
            {s}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

export function KnowledgeSearch() {
  const [at, setAt] = useState(0);
  const cur = QA[at];
  return (
    <div
      className="mx-auto w-full max-w-[560px] overflow-hidden bg-white text-[#111]"
      style={{
        border: "2px solid #000",
        borderRadius: "10px 30px 10px 10px",
        fontFamily: DISPLAY,
      }}
    >
      <div className="flex items-center gap-2 border-b border-[#E4E2DC] px-3.5 py-2">
        <span className="flex gap-1">
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <i
              key={c}
              className="block h-2.5 w-2.5 rounded-full"
              style={{ background: c }}
            />
          ))}
        </span>
        <span
          className="mx-auto flex items-center gap-1.5 text-[11px] text-[#6B6B6B]"
          style={{ fontFamily: MONO }}
        >
          <Lock size={11} />
          Neto baza znanja · primer
        </span>
      </div>
      <div className="p-3 md:p-4">
        <div
          className="flex items-center gap-2 rounded-full px-3.5 py-2.5 text-[13.5px] font-bold md:text-[15px]"
          style={{ background: "#F7F6F2", border: "1px solid #E4E2DC" }}
        >
          <Search size={16} className="flex-none" style={{ color: RED }} />
          <span className="truncate">{cur.q}</span>
        </div>
        <div className="mt-3">
          <Answer key={at} a={cur.a} src={cur.src} />
        </div>
        <div className="mt-2 grid gap-1.5 border-t border-[#E4E2DC] pt-3">
          {QA.map((x, i) => (
            <button
              key={x.q}
              type="button"
              onClick={() => setAt(i)}
              aria-pressed={i === at}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] font-bold transition-colors md:text-[14px]"
              style={{
                background: i === at ? "rgba(226,35,26,0.1)" : "transparent",
                color: i === at ? RED : "#333",
              }}
            >
              <Search size={13} className="flex-none opacity-70" />
              {x.q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
