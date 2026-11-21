"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
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
import {
  DataBase,
  Fascikla,
  FileDoc,
  type FileKind,
  type FolderTone,
} from "./files";

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

/* Digital files and paper folders alike, into one locked base, found in a
   second. Drawn rather than iconed: the files fan out, the folders pile up,
   one of each drops into the base, then the search lights up. */
const FLOW_AT = {
  files: BEAT.flow,
  plus: BEAT.flow + 0.22,
  folders: BEAT.flow + 0.28,
  arrow1: BEAT.flow + 0.55,
  base: BEAT.flow + 0.62,
  drop: BEAT.flow + 0.85,
  arrow2: BEAT.flow + 1.35,
  search: BEAT.flow + 1.42,
};

function FlowCol({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div className="flex h-[3.9em] items-end justify-center">{children}</div>
      <span className="text-[0.8em] font-bold leading-[1.15] text-[#111]">
        {label}
      </span>
    </div>
  );
}

function FlowSep({ at, arrow = false }: { at: number; arrow?: boolean }) {
  const active = useSlideActive();
  return (
    <motion.span
      aria-hidden
      className="mt-[1.5em] flex justify-center"
      style={{ color: arrow ? RED : "#9A9A9A" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ delay: at, duration: 0.3 }}
    >
      {arrow ? (
        <ArrowRight className="h-[1.15em] w-[1.15em]" strokeWidth={2.6} />
      ) : (
        <span className="text-[1.2em] font-black leading-none">+</span>
      )}
    </motion.span>
  );
}

function OneBase() {
  const active = useSlideActive();
  const drop = (delay: number, rotate = 0) => ({
    initial: { opacity: 0, y: "-0.8em", scale: 0.9, rotate },
    animate: active
      ? { opacity: 1, y: "0em", scale: 1, rotate }
      : { opacity: 0, y: "-0.8em", scale: 0.9, rotate },
    transition: { ...POP_SPRING, delay },
  });
  /* a page and a folder falling into the base, once */
  const into = (delay: number) => ({
    initial: { opacity: 0 },
    animate: active
      ? {
          opacity: [0, 1, 1, 0],
          x: ["-2.6em", "-1.3em", "0em", "0em"],
          y: ["-0.4em", "-1.3em", "-0.6em", "0.5em"],
          scale: [0.9, 0.85, 0.6, 0.35],
        }
      : { opacity: 0 },
    transition: { delay, duration: 0.8, ease: "easeInOut" as const },
  });

  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-start gap-1 text-[14px] md:gap-2 md:text-[17px]">
      <FlowCol label="Digitalni fajlovi">
        <span className="relative block h-[3.6em] w-[4.1em]">
          <motion.span
            className="absolute left-0 top-[0.55em]"
            {...drop(FLOW_AT.files, -9)}
          >
            <FileDoc kind="xlsx" size={2} />
          </motion.span>
          <motion.span
            className="absolute left-[1.05em] top-[0.2em]"
            {...drop(FLOW_AT.files + 0.07, 4)}
          >
            <FileDoc kind="docx" size={2} />
          </motion.span>
          <motion.span
            className="absolute left-[2.05em] top-[0.45em]"
            {...drop(FLOW_AT.files + 0.14, 10)}
          >
            <FileDoc kind="pdf" art="plan" size={2} />
          </motion.span>
        </span>
      </FlowCol>
      <FlowSep at={FLOW_AT.plus} />
      <FlowCol label="Fizička dokumenta">
        <span className="relative block h-[3.7em] w-[4em]">
          <motion.span
            className="absolute left-[0.45em] top-[1.1em]"
            {...drop(FLOW_AT.folders, 4)}
          >
            <Fascikla label="Ugovori" tone="green" size={3.3} />
          </motion.span>
          <motion.span
            className="absolute left-0 top-[0.6em]"
            {...drop(FLOW_AT.folders + 0.08, -3)}
          >
            <Fascikla label="Fakture" tone="blue" size={3.3} />
          </motion.span>
          <motion.span
            className="absolute left-[0.55em] top-[0.05em]"
            {...drop(FLOW_AT.folders + 0.16, 2)}
          >
            <Fascikla label="Planovi" tone="kraft" size={3.3} />
          </motion.span>
        </span>
      </FlowCol>
      <FlowSep at={FLOW_AT.arrow1} arrow />
      <FlowCol label="Jedna baza">
        <span className="relative block">
          <motion.span className="block" {...drop(FLOW_AT.base)}>
            <DataBase size={2.7} />
          </motion.span>
          <motion.span
            className="pointer-events-none absolute left-1/2 top-0 -ml-[0.6em]"
            {...into(FLOW_AT.drop)}
          >
            <FileDoc kind="pdf" size={1.2} />
          </motion.span>
          <motion.span
            className="pointer-events-none absolute left-1/2 top-0 -ml-[0.8em]"
            {...into(FLOW_AT.drop + 0.3)}
          >
            <Fascikla label="Planovi" size={1.7} />
          </motion.span>
        </span>
      </FlowCol>
      <FlowSep at={FLOW_AT.arrow2} arrow />
      <FlowCol label="Pretraga za sekund">
        <motion.span
          className="relative mb-[0.2em] grid h-[2.7em] w-[2.7em] place-items-center bg-white"
          style={{
            border: "2px solid #000",
            borderRadius: "0.7em 0.7em 0.7em 0.2em",
          }}
          {...drop(FLOW_AT.search)}
        >
          <Search
            className="h-[1.25em] w-[1.25em]"
            style={{ color: RED }}
            strokeWidth={2.8}
          />
          <span className="absolute -right-[0.45em] -top-[0.45em] grid h-[1.15em] w-[1.15em] place-items-center rounded-full bg-black text-[#FFD60A]">
            <Zap className="h-[0.65em] w-[0.65em]" fill="currentColor" />
          </span>
        </motion.span>
      </FlowCol>
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

/* Where an answer came from: a file, or a paper folder that was scanned
   into the base, with the page or row the answer sits on. */
type Source =
  | { name: string; kind: FileKind; art?: "plan"; where: string }
  | {
      name: string;
      kind: "fascikla";
      label: string;
      tone: FolderTone;
      where: string;
    };

const QA: { q: string; a: string; src: Source[] }[] = [
  {
    q: "Gde je plan novog izgleda lokala?",
    a: "Poslednja verzija je od arhitekte, sa rasporedom rafova, rasvetom i mestima za QR kod.",
    src: [
      { name: "Plan lokala v2.pdf", kind: "pdf", art: "plan", where: "str. 2" },
      {
        name: "Ponude majstora",
        kind: "fascikla",
        label: "Ponude",
        tone: "kraft",
        where: "skenirano · str. 5",
      },
    ],
  },
  {
    q: "Koji ugovori ističu ovog meseca?",
    a: "Dva ugovora sa dobavljačima ističu do 30. novembra. Oba imaju opciju produženja.",
    src: [
      { name: "Ugovori 2026.xlsx", kind: "xlsx", where: "red 14" },
      {
        name: "Dobavljači",
        kind: "fascikla",
        label: "Ugovori",
        tone: "blue",
        where: "skenirano · str. 1",
      },
    ],
  },
  {
    q: "Kako se radi popis na kraju meseca?",
    a: "Šest koraka, od zatvaranja kase do potpisa zapisnika. Obrazac zapisnika je u prilogu.",
    src: [
      { name: "Procedura popisa.docx", kind: "docx", where: "str. 1" },
      { name: "Zapisnik.xlsx", kind: "xlsx", where: "obrazac" },
    ],
  },
];

function SourceCard({ s }: { s: Source }) {
  return (
    <>
      <span className="flex w-[2.5em] flex-none justify-center text-[14px] md:text-[15px]">
        {s.kind === "fascikla" ? (
          <Fascikla label={s.label} tone={s.tone} size={2.5} />
        ) : (
          <FileDoc kind={s.kind} art={s.art} size={1.65} />
        )}
      </span>
      <span className="min-w-0 leading-[1.2]">
        <b className="block text-[11.5px] font-bold text-[#111] md:text-[12.5px]">
          {s.name}
        </b>
        <span
          className="mt-0.5 block text-[9.5px] uppercase tracking-[0.08em] text-[#8A8A8A] md:text-[10.5px]"
          style={{ fontFamily: MONO }}
        >
          {s.where}
        </span>
      </span>
    </>
  );
}

function Answer({ a, src }: { a: string; src: Source[] }) {
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
      <div className="mt-2.5 grid grid-cols-2 gap-1.5 pl-[38px]">
        {src.map((s, i) => (
          <motion.span
            key={s.name}
            className="flex min-w-0 items-center gap-1.5 rounded-lg py-1.5 pl-1 pr-2"
            style={{ background: "#F2F0EA" }}
            initial={{ opacity: 0, y: 6 }}
            animate={done ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ ...POP_SPRING, delay: i * 0.1 }}
          >
            <SourceCard s={s} />
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
