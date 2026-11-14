"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import photo from "./luka-macura.webp";
import {
  CountUp,
  Frame,
  Head,
  Ico,
  d,
  reducedMotion,
  type IconName,
  type SlideProps,
} from "./parts";

/* ---------- 9 · Bezbednost ---------- */

const NODES = [
  { n: "01", title: "Dokumenti", text: "Tenderi, katalozi, pravilnici" },
  { n: "02", title: "Vektorska baza", text: "EU / GDPR serveri" },
  { n: "03", title: "AI model", text: "Na API nalogu klijenta" },
  { n: "04", title: "Odgovor", text: "Dokument.pdf · str. 42" },
];

// Prelomi redova (\n) su kao u PDF-u.
const GUARDS: { icon: IconName; text: string }[] = [
  { icon: "lock", text: "Podaci ostaju\nkod klijenta" },
  { icon: "db", text: "Bez treniranja\njavnih modela" },
  { icon: "shield", text: "Obostrani NDA unapred" },
  { icon: "badge", text: "Svaki odgovor\nsa izvorom" },
];

export function Security() {
  return (
    <Frame foot>
      <Head eyebrow="Bezbednost" title="Podaci ostaju kod klijenta" />
      <div className="bx-zt">
        <i className="bx-zt-border" aria-hidden />
        <p className="bx-zt-label bx-a bx-a-fade" style={d(380)}>
          Infrastruktura klijenta · Zero-trust
        </p>
        <div className="bx-zt-row">
          <i className="bx-packet" aria-hidden />
          {NODES.map((x, i) => (
            <div
              key={x.n}
              className={`bx-node bx-a bx-a-pop${i === 3 ? " bx-node-out" : ""}`}
              style={d(420 + i * 150)}
            >
              <b>{x.n}</b>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
              {i < 3 && (
                <svg
                  className="bx-zt-arrow bx-draw"
                  style={d(560 + i * 150)}
                  viewBox="0 0 32 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M1 6h29" pathLength={1} />
                  <path d="M25 1.5 30 6l-5 4.5" pathLength={1} />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
      <ul className="bx-gs">
        {GUARDS.map((g, i) => (
          <li key={g.text} className="bx-g bx-a" style={d(1000 + i * 90)}>
            <Ico name={g.icon} className="bx-draw" style={d(1100 + i * 90)} />
            <span>{g.text}</span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

/* ---------- 10 · Luka Macura ---------- */

export function About() {
  return (
    <>
      <div className="bx-photo">
        <Image
          src={photo}
          alt="Luka Macura za radnim stolom"
          fill
          sizes="(max-aspect-ratio: 1/1) 100vw, 50vw"
          placeholder="blur"
          className="bx-photo-img"
        />
      </div>
      <Frame>
        <div className="bx-me">
          <p className="bx-eyebrow bx-a" style={d(300)}>
            Macura Solutions LLC
          </p>
          <h2 className="bx-line">
            <span className="bx-a bx-a-up" style={d(380)}>
              Luka Macura
            </span>
          </h2>
          <p className="bx-me-role bx-a" style={d(520)}>
            RAG specijalista · Marketer
          </p>
          <ul>
            <li className="bx-a" style={d(640)}>
              <Ico name="db" />
              RAG sistemi nad dokumentima klijenta
            </li>
            <li className="bx-a" style={d(720)}>
              <Ico name="chart" />
              Marketing koji tehnologiju pretvara u prodaju
            </li>
            <li className="bx-a" style={d(800)}>
              <Ico name="shield" />
              <span>
                Već radimo zajedno na{" "}
                <a
                  href="https://balsoaconsulting.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  balsoaconsulting.com
                </a>
              </span>
            </li>
          </ul>
        </div>
      </Frame>
    </>
  );
}

/* ---------- 11 · Korak 1 ---------- */

const K1: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "book",
    title: "Tvoja baza znanja",
    text: "Zakoni, pravilnici i EU direktive koje koristiš",
  },
  {
    icon: "globe",
    title: "U Balsoa brendu",
    text: "Brz web interfejs za telefon i laptop",
  },
  {
    icon: "play",
    title: "Živi demo",
    text: "Klijentima pokažeš kako radi, uživo",
  },
];

const W_Q = "Priključenje do 150 kW?";
/** 0 prazno · 1 kuca · 2 razmišlja · 3 odgovor · 4 citat · 5 bledi pre nove runde */
type WPhase = 0 | 1 | 2 | 3 | 4 | 5;

export function Step1({ active }: SlideProps) {
  const [typed, setTyped] = useState(W_Q.length);
  const [ph, setPh] = useState<WPhase>(4);

  useEffect(() => {
    if (!active) return;
    if (reducedMotion()) {
      setTyped(W_Q.length);
      setPh(4);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    let iv: ReturnType<typeof setInterval> | undefined;

    const round = (wait: number) => {
      setPh(0);
      setTyped(0);
      at(wait, () => {
        setPh(1);
        let i = 0;
        iv = setInterval(() => {
          i += 1;
          setTyped(i);
          if (i < W_Q.length) return;
          clearInterval(iv);
          at(250, () => setPh(2));
          at(1050, () => setPh(3));
          at(1400, () => setPh(4));
          at(5600, () => setPh(5));
          at(6100, () => round(350));
        }, 38);
      });
    };
    round(950);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(iv);
    };
  }, [active]);

  return (
    <Frame foot>
      <Head eyebrow="Korak 1 · Besplatno" title="Tvoj lični Balsoa AI alat" />
      <div className="bx-k1">
        <ul className="bx-k1-list">
          {K1.map((x, i) => (
            <li key={x.title} className="bx-a" style={d(220 + i * 110)}>
              <Ico name={x.icon} className="bx-draw" style={d(380 + i * 110)} />
              <div>
                <h3>{x.title}</h3>
                <p>{x.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="bx-w-wrap bx-a bx-a-pop" style={d(420)}>
          <div className="bx-w" data-ph={ph}>
            <p className="bx-w-name">Balsoa AI</p>
            <p className="bx-w-q">
              <span>{W_Q.slice(0, typed)}</span>
              <i className="bx-caret" />
            </p>
            <div className="bx-w-a">
              <span className="bx-dots" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              <span className="bx-w-a-text">Član 14 Pravilnika o OIE</span>
            </div>
            <p className="bx-w-cite">Pravilnik_OIE.pdf · str. 28</p>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ---------- 12 · Korak 2 ---------- */

const ROLES = [
  {
    label: "Pilot 30 dana",
    text: "Bez naknade za razvoj. Klijent plaća samo API.",
  },
  { label: "Tvoja uloga", text: "Kontakt sa donosiocima odluka" },
  { label: "Naša uloga", text: "Razvoj, bezbednost i održavanje" },
];

export function Step2({ active }: SlideProps) {
  return (
    <Frame foot>
      <Head eyebrow="Korak 2 · Pilot" title="Zajedno ulazimo u veće firme" />
      <div className="bx-k2">
        <div className="bx-k2-left">
          <p className="bx-k2-big bx-a bx-a-pop" style={d(240)}>
            <CountUp to={20} active={active} delay={320} dur={1000} />%
          </p>
          <p className="bx-k2-lead bx-a" style={d(420)}>
            prihoda od svakog klijenta za Balsoa
          </p>
          <p className="bx-k2-sub bx-a" style={d(500)}>
            Setup i svako mesečno održavanje
          </p>
        </div>
        <div className="bx-k2-cards">
          {ROLES.map((r, i) => (
            <div
              key={r.label}
              className="bx-k2-card bx-a bx-a-right"
              style={d(320 + i * 110)}
            >
              <h3>{r.label}</h3>
              <p>{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ---------- 13 · Sledeći korak ---------- */

export function Cta() {
  return (
    <>
      <div className="bx-glow" aria-hidden />
      <Frame>
        <div className="bx-cta">
          <p className="bx-eyebrow bx-a" style={d(60)}>
            Sledeći korak
          </p>
          <h2 className="bx-h1">
            <span className="bx-line">
              <span className="bx-a bx-a-up" style={d(140)}>
                Kratak poziv, pa krećemo sa
              </span>
            </span>
            <span className="bx-line">
              <span className="bx-a bx-a-up" style={d(220)}>
                Korakom 1
              </span>
            </span>
          </h2>
          <p className="bx-cta-sub bx-a" style={d(380)}>
            Biramo dokumente i potpisujemo NDA.
          </p>
          <a className="bx-btn bx-a bx-a-pop" style={d(520)} href="/sastanak">
            Zakaži poziv <span className="bx-btn-arrow">→</span>
          </a>
          <p className="bx-contact bx-a bx-a-fade" style={d(680)}>
            Luka Macura · Macura Solutions LLC
          </p>
        </div>
      </Frame>
    </>
  );
}
