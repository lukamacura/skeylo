"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ClipboardList,
  Database,
  FileSignature,
  FileText,
  Lock,
  Map,
  ReceiptText,
  Search,
  Sparkles,
  Tag,
} from "lucide-react";
import {
  DISPLAY,
  MONO,
  NETO_RADIUS,
  POP_SPRING,
  RED,
  item,
  pop,
  useSlideActive,
} from "../primitives";
import { Fascikla, FileDoc, type FileKind, type FolderTone } from "./files";

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
  /* The project plans nobody could find (the old "Baza znanja: zašto"
     slide, folded into this one on 2026-11-22). */
  {
    q: "Gde su projektni planovi?",
    a: "Poslednja verzija je od arhitekte, sa rasporedom rafova i rasvetom. Ponude majstora su skenirane iz fascikle.",
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

function Answer({
  a,
  src,
  after,
}: {
  a: string;
  src: Source[];
  /* ms to wait: the question is still typing itself */
  after: number;
}) {
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
    }, after);
    return () => {
      clearTimeout(start);
      if (iv) clearInterval(iv);
    };
  }, [a, active, after]);

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

/* The question types itself, quickly, before the answer comes. */
const TYPE_MS = 22;

function Typed({ text }: { text: string }) {
  const active = useSlideActive();
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (reduce) {
      setN(text.length);
      return;
    }
    let k = 0;
    const iv = setInterval(() => {
      k += 1;
      setN(k);
      if (k >= text.length) clearInterval(iv);
    }, TYPE_MS);
    return () => clearInterval(iv);
  }, [text, active, reduce]);
  return (
    <span className="truncate" aria-label={text}>
      {text.slice(0, n)}
      {n < text.length && (
        <i
          aria-hidden
          className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-[#111]"
        />
      )}
    </span>
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
          Neto OS · baza znanja · primer
        </span>
      </div>
      <div className="p-3 md:p-4">
        <div
          className="flex items-center gap-2 rounded-full px-3.5 py-2.5 text-[13.5px] font-bold md:text-[15px]"
          style={{ background: "#F7F6F2", border: "1px solid #E4E2DC" }}
        >
          <Search size={16} className="flex-none" style={{ color: RED }} />
          <Typed key={at} text={cur.q} />
        </div>
        <div className="mt-3">
          <Answer
            key={at}
            a={cur.a}
            src={cur.src}
            after={cur.q.length * TYPE_MS + 300}
          />
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
