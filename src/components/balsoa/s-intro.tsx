"use client";

import { useEffect, useRef } from "react";
import {
  CountUp,
  Frame,
  Head,
  clamp01,
  d,
  easeInOut,
  reducedMotion,
  vars,
  type SlideProps,
} from "./parts";

/* ---------- 1 · Naslovna ---------- */

// Širine redova na stranici (% najdužeg) i red na kom se pretraga zaustavlja.
const LINES = [100, 82, 100, 60, 100, 82, 100, 60, 82, 100, 60];
const HIT = 8;
// Mora da se poklapa sa animacijom .bx-doc-band u balsoa.css.
const SCAN_DELAY = 1000;
const SCAN_DUR = 1700;
const SCAN_TURN = 0.55;

export function Hero({ active }: SlideProps) {
  const page = useRef<HTMLElement>(null);

  // Brojač strana prati traku: niz stranicu do 300, pa nazad na 201.
  useEffect(() => {
    const el = page.current;
    if (!active || !el) return;
    if (reducedMotion()) {
      el.textContent = "201";
      return;
    }
    el.textContent = "1";
    const t0 = performance.now() + SCAN_DELAY;
    let raf = requestAnimationFrame(function tick(now) {
      const t = clamp01((now - t0) / SCAN_DUR);
      const n =
        t < SCAN_TURN
          ? 1 + 299 * easeInOut(t / SCAN_TURN)
          : 300 - 99 * easeInOut((t - SCAN_TURN) / (1 - SCAN_TURN));
      el.textContent = String(Math.round(n));
      if (t < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <>
      <div className="bx-glow" aria-hidden />
      <Frame>
        <div className="bx-hero">
          <div className="bx-hero-text">
            <p className="bx-eyebrow bx-a" style={d(60)}>
              Balsoa Consulting × Macura Solutions
            </p>
            <h1 className="bx-h1">
              <span className="bx-line">
                <span className="bx-a bx-a-up" style={d(140)}>
                  Od 300 strana PDF‑a
                </span>
              </span>
              <span className="bx-line">
                <span className="bx-a bx-a-up" style={d(220)}>
                  do tačnog odgovora
                </span>
              </span>
              <span className="bx-line">
                <span className="bx-a bx-a-up" style={d(300)}>
                  za 3 sekunde
                </span>
              </span>
            </h1>
            <p className="bx-hero-sub bx-a" style={d(480)}>
              Interni AI sistemi za energetiku i tendere
            </p>
          </div>

          <div className="bx-doc" aria-hidden>
            <i className="bx-doc-sheet bx-doc-b2" />
            <i className="bx-doc-sheet bx-doc-b1" />
            <div className="bx-doc-sheet bx-doc-front">
              <i className="bx-doc-title" />
              {LINES.map((w, i) => (
                <i
                  key={i}
                  className="bx-doc-line"
                  data-hit={i === HIT ? "" : undefined}
                  style={vars({ width: `${w * 0.83}%`, "--i": i })}
                />
              ))}
              <i className="bx-doc-band" />
            </div>
            <p className="bx-doc-cap">
              Strana <b ref={page}>201</b> / 300
            </p>
          </div>
        </div>
      </Frame>
    </>
  );
}

/* ---------- 2 · Problem ---------- */

export function Problem({ active }: SlideProps) {
  return (
    <Frame foot>
      <Head
        eyebrow="Problem"
        title="Tenderi i propisi se i dalje čitaju ručno"
      />
      <div className="bx-stats">
        <div className="bx-stat bx-a" style={d(220)}>
          <p className="bx-stat-num">
            <CountUp to={1000} active={active} delay={320} dur={1100} />
            <span className="bx-plus">+</span>
          </p>
          <p className="bx-stat-txt">strana u jednom tenderu</p>
        </div>
        <div className="bx-stat bx-stat-dark bx-a" style={d(320)}>
          <p className="bx-stat-num">
            Strana{" "}
            <CountUp to={248} from={1} active={active} delay={420} dur={1150} />
          </p>
          <p className="bx-stat-txt">Jedan propušten uslov obara celu ponudu</p>
        </div>
        <div className="bx-stat bx-a" style={d(420)}>
          <p className="bx-stat-num">
            <CountUp to={3} active={active} delay={520} dur={800} /> dana
          </p>
          <p className="bx-stat-txt">ručne analize po tenderu</p>
        </div>
      </div>
    </Frame>
  );
}

/* ---------- 3 · Rešenje ---------- */

const GENERIC = ["Izmišljaju podatke", "Nema izvora", "Ne može se proveriti"];
const OURS = [
  "Samo dokumenti klijenta i važeći propisi",
  "Odgovor za 3 sekunde",
  "Uvek citat: dokument i strana",
];

export function Solution() {
  return (
    <Frame foot>
      <Head eyebrow="Rešenje" title="AI koji čita samo dokumente klijenta" />
      <div className="bx-vs">
        <div className="bx-vs-card bx-vs-gen bx-a bx-a-left" style={d(200)}>
          <h3>Generički AI alati</h3>
          <ul>
            {GENERIC.map((t, i) => (
              <li key={t} className="bx-a bx-a-fade" style={d(340 + i * 70)}>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="bx-vs-card bx-vs-our bx-a bx-a-right" style={d(380)}>
          <h3>Naš RAG sistem</h3>
          <ul>
            {OURS.map((t, i) => (
              <li key={t} className="bx-a bx-a-fade" style={d(540 + i * 80)}>
                {t}
              </li>
            ))}
          </ul>
          <p className="bx-chip bx-a bx-a-pop" style={d(880)}>
            Dokument.pdf · str. 42
          </p>
        </div>
      </div>
    </Frame>
  );
}
