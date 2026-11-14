"use client";

import { useEffect, useRef, useState } from "react";
import {
  Frame,
  Head,
  Ico,
  d,
  reducedMotion,
  vars,
  type SlideProps,
} from "./parts";

/* ---------- 5 · Demo: pitanje se kuca, pretraga, odgovor sa citatom ---------- */

// Ilustrativni podaci (tako piše i na slajdu).
const QA = [
  {
    q: "Koje sertifikate tender traži za invertere?",
    lead: "Inverter mora da ima:",
    items: [
      "IEC 62109-1 i IEC 62109-2 (bezbednost)",
      "IEC 61727 i IEC 62116 (rad na mreži)",
      "EN 50549-1 (priključenje na distributivnu mrežu)",
    ],
    cites: ["Tender_FNE_2025.pdf · str. 248", "Prilog_3.pdf · str. 12"],
    ms: 2300,
  },
  {
    q: "Uslovi za priključenje elektrane do 150 kW?",
    lead: "Član 14 Pravilnika o OIE:",
    items: [
      "Zahtev operatoru distributivnog sistema",
      "Tehnička dokumentacija elektrane",
      "Ugovor o priključenju pre puštanja u rad",
    ],
    cites: ["Pravilnik_OIE.pdf · str. 28"],
    ms: 1900,
  },
  {
    q: "Da li je HX-100 kompatibilan sa TS 20/0,4 kV?",
    lead: "Da, priključuje se na stranu 0,4 kV:",
    items: [
      "Izlaz 3 × 400 V AC, 50 Hz",
      "Nazivna snaga 100 kW, do 145 A po fazi",
    ],
    cites: ["HX-100_tehnicki_list.pdf · str. 7"],
    ms: 1700,
  },
];

const TYPE_MS = 24;
const TYPE_START = 420;
const ENTER_PAUSE = 260;
/** Koliko dugo odgovor stoji pre sledećeg pitanja (dok niko ne klikne). */
const HOLD_MS = 5200;

type Phase = "idle" | "type" | "search" | "answer";

const fmtSec = (ms: number) => `${(ms / 1000).toFixed(1).replace(".", ",")} s`;

export default function Demo({ active }: SlideProps) {
  const [qi, setQi] = useState(0);
  const [run, setRun] = useState(0);
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  // Odgovor koji se prikazuje; menja se tek kad stigne novi, pa stari lepo izbledi.
  const [shown, setShown] = useState(0);
  const auto = useRef(true);
  const clock = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active) {
      // Vrati na početak tek kad slajd izbledi.
      const t = setTimeout(() => {
        auto.current = true;
        setQi(0);
        setTyped(0);
        setPhase("idle");
      }, 600);
      return () => clearTimeout(t);
    }

    const qa = QA[qi];
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    let raf = 0;
    let iv: ReturnType<typeof setInterval> | undefined;

    if (reducedMotion()) {
      setTyped(qa.q.length);
      setShown(qi);
      setPhase("answer");
      if (clock.current) clock.current.textContent = fmtSec(qa.ms);
      return;
    }

    setTyped(0);
    setPhase("type");
    at(TYPE_START, () => {
      let i = 0;
      iv = setInterval(() => {
        i += 1;
        setTyped(i);
        if (i >= qa.q.length) clearInterval(iv);
      }, TYPE_MS);
    });

    const tSearch = TYPE_START + qa.q.length * TYPE_MS + ENTER_PAUSE;
    at(tSearch, () => {
      setPhase("search");
      const el = clock.current;
      const t0 = performance.now();
      raf = requestAnimationFrame(function tick(now) {
        const ms = Math.min(qa.ms, now - t0);
        if (el) el.textContent = fmtSec(ms);
        if (ms < qa.ms) raf = requestAnimationFrame(tick);
      });
    });
    at(tSearch + qa.ms, () => {
      setShown(qi);
      setPhase("answer");
    });
    at(tSearch + qa.ms + HOLD_MS, () => {
      if (auto.current) setQi((qi + 1) % QA.length);
    });

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(iv);
      cancelAnimationFrame(raf);
    };
  }, [active, qi, run]);

  const pick = (i: number) => {
    auto.current = false;
    if (i === qi) setRun((r) => r + 1);
    else setQi(i);
  };

  const qa = QA[qi];
  const ans = QA[shown];
  const searching = phase === "search";
  const answered = phase === "answer";

  return (
    <Frame foot>
      <Head eyebrow="Demo" title="Pitanje, odgovor i citat za 3 sekunde" />
      <div className="bx-demo">
        <div className="bx-qs-col">
          <p className="bx-qs-label bx-a bx-a-fade" style={d(200)}>
            Pitanja
          </p>
          <div className="bx-qs">
            {QA.map((x, i) => (
              <button
                key={x.q}
                type="button"
                className="bx-q bx-a"
                style={d(260 + i * 70)}
                aria-pressed={i === qi}
                onClick={() => pick(i)}
              >
                {x.q}
              </button>
            ))}
          </div>
        </div>

        <div className="bx-demo-main bx-a" style={d(300)}>
          <div className="bx-search" data-phase={phase}>
            <Ico name="search" />
            <span className="bx-search-text">
              {qa.q.slice(0, typed)}
              <i className="bx-caret" />
            </span>
          </div>

          <div
            className="bx-prog"
            data-on={searching || answered ? "" : undefined}
            aria-live="polite"
          >
            <span className="bx-prog-bar">
              <i
                data-run={searching || answered ? "" : undefined}
                style={vars({ "--ms": `${qa.ms}ms` })}
              />
            </span>
            <span className="bx-prog-text">
              {answered ? "Gotovo" : "Pretražujem 1.284 strane…"}
            </span>
            <span className="bx-prog-time">
              <Ico name="timer" />
              <span ref={clock}>0,0 s</span>
            </span>
          </div>

          <div className="bx-ans" data-show={answered ? "" : undefined}>
            <p className="bx-ans-lead">{ans.lead}</p>
            <ul>
              {ans.items.map((t, i) => (
                <li key={t} style={vars({ "--i": i })}>
                  {t}
                </li>
              ))}
            </ul>
            <div className="bx-ans-cites">
              {ans.cites.map((c, i) => (
                <span
                  key={c}
                  className="bx-chip bx-chip-sm"
                  style={vars({ "--i": ans.items.length + i })}
                >
                  <Ico name="file" />
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="bx-note bx-a bx-a-fade" style={d(560)}>
        Ilustrativni podaci
      </p>
    </Frame>
  );
}
