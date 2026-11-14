"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Frame,
  Head,
  Ico,
  Tween,
  clamp01,
  d,
  easeOut,
  fmtEur,
  fmtInt,
  reducedMotion,
  vars,
  type IconName,
  type SlideProps,
} from "./parts";

/* ---------- 6 · Primena ---------- */

const USES: { icon: IconName; title: string; text: string; badge: string }[] = [
  {
    icon: "search",
    title: "Tenderi",
    text: "Svi zahtevi, rokovi i penali iz celog tendera",
    badge: "3 dana → 15 minuta",
  },
  {
    icon: "book",
    title: "Regulativa",
    text: "Tačan član zakona: OIE, CBAM, IEC, EN, SRPS",
    badge: "Trenutna provera",
  },
  {
    icon: "zap",
    title: "Katalozi opreme",
    text: "Šifre, parametri i garancije iz tehničkih listova",
    badge: "Brže ponude",
  },
];

export function Uses() {
  return (
    <Frame foot>
      <Head eyebrow="Primena" title="Gde se štedi najviše vremena" />
      <div className="bx-uses">
        {USES.map((u, i) => (
          <article
            key={u.title}
            className="bx-use bx-a"
            style={d(220 + i * 100)}
          >
            <Ico name={u.icon} className="bx-draw" style={d(420 + i * 100)} />
            <h3>{u.title}</h3>
            <p>{u.text}</p>
            <span className="bx-badge bx-a bx-a-pop" style={d(620 + i * 100)}>
              {u.badge}
            </span>
          </article>
        ))}
      </div>
    </Frame>
  );
}

/* ---------- 7 · 3 dana → 15 minuta ---------- */

export function Statement() {
  return (
    <Frame>
      <div className="bx-big">
        <p className="bx-eyebrow bx-a" style={d(60)}>
          Analiza jednog tendera
        </p>
        <h2 aria-label="3 dana → 15 minuta">
          <span className="bx-line" aria-hidden>
            <span className="bx-a bx-a-up" style={d(160)}>
              3 dana
            </span>
          </span>
          <svg
            className="bx-big-arrow bx-draw"
            style={d(520)}
            viewBox="0 0 100 40"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 20h92" pathLength={1} />
            <path d="M83 9.5 95 20 83 30.5" pathLength={1} />
          </svg>
          <span className="bx-line" aria-hidden>
            <span className="bx-a bx-a-up bx-a-spring" style={d(760)}>
              15 minuta
            </span>
          </span>
        </h2>
        <p className="bx-big-sub bx-a" style={d(1000)}>
          Svaki zahtev, rok i penal, sa brojem strane.
        </p>
      </div>
    </Frame>
  );
}

/* ---------- 8 · ROI kalkulator ---------- */

const H_PER_TENDER = 23.75;
const H_PER_ENGINEER = 10;
const EUR_PER_HOUR = 45;
const DEF = { eng: 5, ten: 4 };
const ENG = { min: 1, max: 40 };
const TEN = { min: 1, max: 20 };

const firmSize = (eng: number) =>
  eng < 10 ? "Manja firma" : eng < 25 ? "Srednja firma" : "Velika firma";

export function Roi({ active }: SlideProps) {
  const [eng, setEng] = useState(DEF.eng);
  const [ten, setTen] = useState(DEF.ten);
  const touched = useRef(false);

  // Na ulazu klizači sami dođu do podrazumevanih vrednosti, brojevi ih prate.
  useEffect(() => {
    if (!active) return;
    touched.current = false;
    if (reducedMotion()) {
      setEng(DEF.eng);
      setTen(DEF.ten);
      return;
    }
    setEng(ENG.min);
    setTen(TEN.min);
    const t0 = performance.now() + 450;
    let raf = requestAnimationFrame(function tick(now) {
      if (touched.current) return;
      const e = easeOut(clamp01((now - t0) / 900));
      setEng(Math.round(ENG.min + (DEF.eng - ENG.min) * e));
      setTen(Math.round(TEN.min + (DEF.ten - TEN.min) * e));
      if (e < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const hours = ten * H_PER_TENDER + eng * H_PER_ENGINEER;
  const month = hours * EUR_PER_HOUR;
  const size = firmSize(eng);

  return (
    <Frame foot>
      <Head eyebrow="ROI kalkulator" title="Koliko firma uštedi mesečno" />
      <div className="bx-roi">
        <div className="bx-roi-panel bx-a" style={d(200)} data-noswipe>
          <h3 key={size} className="bx-roi-size">
            {size}
          </h3>
          <Range
            label="Inženjeri"
            value={eng}
            {...ENG}
            onChange={(v) => {
              touched.current = true;
              setEng(v);
            }}
          />
          <Range
            label="Tenderi mesečno"
            value={ten}
            {...TEN}
            onChange={(v) => {
              touched.current = true;
              setTen(v);
            }}
          />
        </div>
        <div className="bx-roi-out">
          <div className="bx-roi-year bx-a" style={d(300)}>
            <p>Ušteda godišnje</p>
            <strong>
              <Tween value={month * 12} active={active} format={fmtEur} />
            </strong>
          </div>
          <div className="bx-roi-box bx-a" style={d(380)}>
            <p>Sati mesečno</p>
            <strong>
              <Tween value={hours} active={active} format={fmtInt} />
            </strong>
          </div>
          <div className="bx-roi-box bx-a" style={d(440)}>
            <p>Ušteda mesečno</p>
            <strong>
              <Tween value={month} active={active} format={fmtEur} />
            </strong>
          </div>
        </div>
      </div>
      <p className="bx-roi-note bx-a bx-a-fade" style={d(560)}>
        Pretpostavke: 23,75 h po tenderu · 10 h mesečno po inženjeru · €45 po
        satu
      </p>
    </Frame>
  );
}

function Range({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div className="bx-range">
      <div className="bx-range-top">
        <label htmlFor={id}>{label}</label>
        <b>{value}</b>
      </div>
      <input
        id={id}
        type="range"
        className="bx-slider"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={vars({ "--p": (value - min) / (max - min) })}
      />
    </div>
  );
}
