"use client";

import { useEffect, useState } from "react";
import {
  CountUp,
  Frame,
  Head,
  d,
  reducedMotion,
  vars,
  type SlideProps,
} from "./parts";

/* ---------- 4 · Kako radi: pet koraka koji se smenjuju u petlji ---------- */

const STEPS = [
  { title: "Input folder", desc: "Ubaciš PDF, Word i Excel" },
  { title: "AI analizira", desc: "Čita i deli tekst na celine" },
  { title: "Embedovanje", desc: "Tekst postaje vektori" },
  { title: "Vektorska baza", desc: "Privatna, na EU serveru" },
  { title: "RAG odgovor", desc: "Uvek sa citatom" },
];

/** Trajanje svakog koraka; zatim pauza sa svim koracima gotovim, pa ispočetka. */
const RUN_MS = [1500, 1700, 1400, 1700, 1600];
const START_MS = 700;
const HOLD_MS = 2800;
const RESET_MS = 700;
/** stage: -1 = sve čeka, 0–4 = korak radi, 5 = sve gotovo. */
const ALL_DONE = 5;

type StepState = "wait" | "run" | "done";

export default function Pipeline({ active }: SlideProps) {
  const [stage, setStage] = useState(-1);

  useEffect(() => {
    if (!active) return;
    if (reducedMotion()) {
      setStage(ALL_DONE);
      return;
    }
    setStage(-1);
    let timer: ReturnType<typeof setTimeout>;
    const run = (s: number) => {
      setStage(s);
      timer =
        s < ALL_DONE
          ? setTimeout(() => run(s + 1), RUN_MS[s])
          : setTimeout(() => {
              setStage(-1);
              timer = setTimeout(() => run(0), RESET_MS);
            }, HOLD_MS);
    };
    timer = setTimeout(() => run(0), START_MS);
    return () => clearTimeout(timer);
  }, [active]);

  const state = (i: number): StepState =>
    stage < 0 || i > stage ? "wait" : i === stage ? "run" : "done";

  return (
    <Frame foot>
      <Head
        eyebrow="Kako radi"
        title="Ubaciš fajlove u folder. Sistem uradi ostalo."
      />
      <ol className="bx-pipe">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className="bx-step bx-a"
            style={d(220 + i * 80)}
            data-s={state(i)}
          >
            <div className="bx-step-card" aria-hidden>
              {i === 0 && <Folder />}
              {i === 1 && <Analyze />}
              {i === 2 && <Embed />}
              {i === 3 && <Vault stage={stage} />}
              {i === 4 && <Answer />}
            </div>
            {i < STEPS.length - 1 && (
              <i
                className="bx-link"
                data-on={stage > i ? "" : undefined}
                aria-hidden
              >
                <b />
              </i>
            )}
            <div className="bx-step-text">
              <p className="bx-step-num">{String(i + 1).padStart(2, "0")}</p>
              <p className="bx-step-title">{s.title}</p>
              <p className="bx-step-desc">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </Frame>
  );
}

const FILES = [
  { label: "PDF", color: "#e0584f", x: 1.8 },
  { label: "DOC", color: "#3b82d6", x: 4.65 },
  { label: "XLS", color: "#34a35a", x: 7.5 },
];

function Folder() {
  return (
    <div className="bx-v1">
      <i className="bx-v1-back" />
      {FILES.map((f, i) => (
        <span
          key={f.label}
          className="bx-file"
          style={vars({ left: `${f.x}em`, "--c": f.color, "--i": i })}
        >
          <span>{f.label}</span>
        </span>
      ))}
      <span className="bx-v1-front">
        <span>INPUT</span>
      </span>
    </div>
  );
}

// Redovi dokumenta: vrh i širina u em; k = celina (chunk) kojoj red pripada.
const DOC_LINES = [
  { y: 1.5, w: 6.5, k: 0 },
  { y: 2.75, w: 5.2, k: 0 },
  { y: 4, w: 6.5, k: 1 },
  { y: 5.25, w: 4.7, k: 1 },
  { y: 6.5, w: 6.5, k: 2 },
  { y: 7.75, w: 4, k: 2 },
];

function Analyze() {
  return (
    <div className="bx-v2">
      <div className="bx-v2-doc">
        {DOC_LINES.map((l, i) => (
          <i
            key={i}
            style={vars({
              top: `${l.y}em`,
              width: `${l.w}em`,
              "--k": l.k,
              "--tint": l.k === 1 ? "#f2b33d" : "#5bc8d6",
            })}
          />
        ))}
        <b className="bx-v2-scan" />
      </div>
      <span className="bx-v2-ai">
        <span>AI</span>
      </span>
    </div>
  );
}

// Prozirnost tačaka vektora (6 × 5), ponavlja se da izgleda nasumično.
const DOT_O = [
  0.95, 0.4, 0.7, 1, 0.5, 0.8, 0.55, 1, 0.35, 0.75, 0.9, 0.45, 0.85, 0.6, 1,
  0.4, 0.7, 0.95, 0.45, 0.8, 0.6, 0.9, 1, 0.5, 1, 0.55, 0.85, 0.4, 0.7, 0.9,
];

function Embed() {
  return (
    <div className="bx-v3">
      <div className="bx-v3-grid">
        {DOT_O.map((o, i) => (
          <i
            key={i}
            style={vars({ "--o": o, "--k": Math.floor(i / 6) + (i % 6) })}
          />
        ))}
      </div>
      <p className="bx-v3-vec">
        <span>[0.12, −0.48, 0.91 …]</span>
      </p>
    </div>
  );
}

function Vault({ stage }: { stage: number }) {
  return (
    <div className="bx-v4">
      <svg className="bx-v4-svg" viewBox="0 0 96 112">
        <defs>
          <clipPath id="bx-cyl">
            <path d="M2 16v80a46 14 0 0 0 92 0V16z" />
          </clipPath>
        </defs>
        <path className="bx-v4-body" d="M2 16v80a46 14 0 0 0 92 0V16z" />
        <g clipPath="url(#bx-cyl)">
          <rect className="bx-v4-fill" x="0" y="30" width="96" height="84" />
        </g>
        <ellipse className="bx-v4-top" cx="48" cy="16" rx="46" ry="14" />
      </svg>
      <p className="bx-v4-n">
        <span>
          <CountUp
            to={12480}
            rest={stage > 3 ? 12480 : 0}
            active={stage === 3}
            delay={150}
            dur={1300}
          />{" "}
          vektora
        </span>
      </p>
    </div>
  );
}

function Answer() {
  return (
    <div className="bx-v5">
      <div className="bx-v5-q">
        <span>Rok za ponudu?</span>
      </div>
      <div className="bx-v5-a">
        {[100, 86, 58].map((w, i) => (
          <i key={i} style={vars({ width: `${w}%`, "--i": i })} />
        ))}
        <p className="bx-v5-cite">
          <span>Dokument.pdf · str. 42</span>
        </p>
      </div>
    </div>
  );
}
