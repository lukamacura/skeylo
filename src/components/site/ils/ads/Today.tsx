"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  CalendarDays,
  Globe,
  MapPin,
  QrCode,
  Ticket,
  Wallet,
} from "lucide-react";
import {
  IVORY,
  Kicker,
  LINE,
  MetaLogo,
  MUTED,
  ROSE,
  ROSE_SOFT,
  SERIF,
  SURFACE,
  item,
  stagger,
} from "./primitives";

/* ------------------------------------------------------------------------ */
/* 00 · Kako Infinity radi danas                                              */
/* ------------------------------------------------------------------------ */

/* Everything is laid out on a 400 × 680 board. The SVG draws the currents
   in board units; the HTML nodes sit on top at the same coordinates, sized
   in cqh so a unit is the same on every board width. Where the stage is
   wider than tall the board widens by a factor k (up to K_MAX) and spreads
   sideways; node positions are percentages, so they follow on their own,
   and the nodes grow a little (--s) into the room the spread opens up. */
const W = 400;
const H = 680;
const K_MAX = 1.75;
const u = (n: number) => `calc(${(n / H) * 100}cqh * var(--s, 1))`;
const at = (x: number, y: number) => ({
  left: `${(x / W) * 100}%`,
  top: `${(y / H) * 100}%`,
});

const WOMAN = ROSE_SOFT;
const MAN = "#86a8ff";
const CONTENT = IVORY;
const NEW = "#f4d27a";
/* A channel that is possible but not part of this pitch. */
const B2B = "#ff6b6b";
const SKEYLO = "#e07a2c";
const CASH = "#3ddc84";

/* When each part of the story switches on. */
const T = { hub: 0.15, team: 0.6, crowd: 1.25, google: 2.1, b2b: 3.2 };

const PEOPLE = {
  branka: {
    name: "Branka",
    src: "/ils/ljudi/branka.webp",
    origin: "52% 42%",
    zoom: 1.3,
  },
  mihac: {
    name: "Mihajlo",
    src: "/people/mihac.webp",
    origin: "50% 33%",
    zoom: 1.3,
  },
  nina: {
    name: "Nina",
    src: "/people/nina.webp",
    origin: "47% 33%",
    zoom: 1.3,
  },
  filip: {
    name: "Filip",
    src: "/people/filip.webp",
    origin: "50% 30%",
    zoom: 1.3,
  },
  luka: {
    name: "Luka",
    src: "/people/luka.webp",
    origin: "50% 31%",
    zoom: 1.3,
  },
  mila: {
    name: "Mila",
    src: "/ils/ljudi/mila.webp",
    origin: "52% 28%",
    zoom: 1.3,
  },
  tanja: {
    name: "Tanja",
    src: "/ils/ljudi/tanja.webp",
    origin: "48% 28%",
    zoom: 1.3,
  },
  ana: {
    name: "Ana",
    src: "/ils/ljudi/ana.webp",
    origin: "49% 30%",
    zoom: 1.3,
  },
} as const;

type Flow = {
  id: string;
  d: string;
  color: string;
  /* Particles in flight at once: how strong the current is. */
  n: number;
  /* Every n-th particle is a man, for mixed currents. */
  menEvery?: number;
  dur: number;
  start: number;
  width?: number;
  fresh?: boolean;
};

/* Paths are written for the 400-wide phone board. On a wider board X()
   spreads them sideways: a point that touches a node keeps its distance to
   that node's centre (the anchor), everything else just scales. */
type Spread = (x: number, anchor?: number) => number;

const flows = (X: Spread): Flow[] => {
  /* Where the models' current joins the shoot, halfway along it. */
  const mid = (X(72, 48) + X(100, 138)) / 2;
  return [
    /* Content: Branka on camera → Mihajlo edits → Meta, Filip runs the ads. */
    {
      id: "shoot",
      d: `M${X(72, 48)},48 L${X(100, 138)},48`,
      color: CONTENT,
      n: 2,
      dur: 1.4,
      start: T.team,
    },
    /* Filip writes the scripts Mihajlo and Nina shoot. */
    {
      id: "script",
      d: `M${X(204, 228)},55 C${X(194)},55 ${X(184)},48 ${X(174, 138)},48`,
      color: CONTENT,
      n: 1,
      dur: 1.3,
      start: T.team + 0.25,
    },
    {
      id: "edit",
      d: `M${X(138)},100 L${X(138)},142`,
      color: CONTENT,
      n: 2,
      dur: 1.4,
      start: T.team + 0.2,
    },
    {
      id: "ads",
      d: `M${X(228)},112 C${X(228)},146 ${X(196)},170 ${X(166, 138)},170`,
      color: CONTENT,
      n: 2,
      dur: 1.8,
      start: T.team + 0.3,
    },
    {
      id: "models",
      d: `M${X(62, 48)},124 C${X(80)},120 ${mid},96 ${mid},50`,
      color: CONTENT,
      n: 1,
      dur: 1.4,
      start: T.team + 0.3,
    },
    /* Meta brings people in: far more women than men. */
    {
      id: "m-w",
      d: `M${X(110, 138)},238 C${X(100)},246 ${X(92)},252 ${X(88)},266`,
      color: WOMAN,
      n: 4,
      dur: 1.6,
      start: T.crowd,
      width: 2.2,
    },
    {
      id: "m-m",
      d: `M${X(166, 138)},238 C${X(176)},246 ${X(188)},254 ${X(190)},274`,
      color: MAN,
      n: 1,
      dur: 1.9,
      start: T.crowd,
      width: 1.2,
    },
    /* Every channel lands on the site, where they book, and only then in
     the studio. */
    {
      id: "w-site",
      d: `M${X(88)},354 C${X(88)},384 ${X(108)},398 ${X(136, 200)},398`,
      color: WOMAN,
      n: 4,
      dur: 1.8,
      start: T.crowd + 0.4,
      width: 2.2,
    },
    {
      id: "m-site",
      d: `M${X(190)},310 L${X(190)},378`,
      color: MAN,
      n: 1,
      dur: 1.8,
      start: T.crowd + 0.4,
      width: 1.2,
    },
    {
      id: "site-hub",
      d: `M${X(200)},417 L${X(200)},433`,
      color: WOMAN,
      n: 2,
      dur: 0.9,
      start: T.crowd + 0.7,
      width: 2.6,
    },
    /* Hub → studios. */
    {
      id: "ns",
      d: `M${X(186, 200)},550 C${X(150)},556 ${X(72)},560 ${X(68)},587`,
      color: WOMAN,
      n: 2,
      dur: 1.6,
      start: T.hub + 0.6,
    },
    {
      id: "so",
      d: `M${X(200)},550 L${X(200)},578`,
      color: WOMAN,
      n: 1,
      dur: 1,
      start: T.hub + 0.6,
    },
    /* B2B, only hinted at: a company hands its staff vouchers, the QR code
     on them opens the site. A smaller crowd than Google's. */
    {
      id: "b2b",
      d: `M${X(268)},260 L${X(268)},282`,
      color: B2B,
      n: 1,
      dur: 1.2,
      start: T.b2b,
      fresh: true,
    },
    {
      id: "b2b-site",
      d: `M${X(268)},318 C${X(268)},350 ${X(252)},364 ${X(240, 200)},381`,
      color: WOMAN,
      n: 2,
      menEvery: 2,
      dur: 1.6,
      start: T.b2b + 0.4,
      fresh: true,
    },
    /* Every payment lands in /finances; Skeylo's 10% goes out of it. */
    {
      id: "fin",
      d: `M${X(162, 200)},470 L${X(136, 94)},470`,
      color: CASH,
      n: 1,
      dur: 0.9,
      start: T.crowd + 1.1,
    },
    {
      id: "cut",
      d: `M${X(52, 94)},470 C${X(46, 94)},470 ${X(44, 22)},463 ${X(38, 22)},463`,
      color: SKEYLO,
      n: 1,
      dur: 0.8,
      start: T.crowd + 1.5,
    },
    /* Every booking lands in the calendar on its own. */
    {
      id: "cal",
      d: `M${X(240, 200)},470 C${X(262)},470 ${X(268)},478 ${X(290, 334)},478`,
      color: WOMAN,
      n: 2,
      dur: 1.1,
      start: T.crowd + 0.9,
    },
    /* Google: Luka opens a new channel, full of women searching. */
    {
      id: "g",
      d: `M${X(356)},100 L${X(356)},142`,
      color: NEW,
      n: 2,
      dur: 1.4,
      start: T.google,
      fresh: true,
    },
    {
      id: "g-w",
      d: `M${X(356)},236 L${X(356)},266`,
      color: WOMAN,
      n: 5,
      menEvery: 5,
      dur: 1.4,
      start: T.google + 0.3,
      fresh: true,
      width: 2.2,
    },
    {
      id: "g-site",
      d: `M${X(356)},352 C${X(356)},388 ${X(300)},398 ${X(264, 200)},398`,
      color: WOMAN,
      n: 5,
      menEvery: 5,
      dur: 1.6,
      start: T.google + 0.6,
      fresh: true,
      width: 2.2,
    },
    {
      id: "bg",
      d: `M${X(214, 200)},550 C${X(250)},556 ${X(328)},560 ${X(332)},590`,
      color: NEW,
      n: 1,
      dur: 2,
      start: T.google + 1,
      fresh: true,
    },
  ];
};

/* Little figures: a dress for her, a straight cut for him. */
function Figure({
  x,
  y,
  man,
  delay,
  color,
  scale = 1,
}: {
  x: number;
  y: number;
  man?: boolean;
  delay: number;
  color?: string;
  scale?: number;
}) {
  const fill = color ?? (man ? MAN : WOMAN);
  return (
    <motion.g
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <motion.g
          animate={{ y: [0, -1.6, 0] }}
          transition={{
            duration: 1.8,
            delay: delay % 1.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          fill={fill}
        >
          {/* Pictogram bust: hair behind the head for her, broader
              shoulders for him. */}
          {!man && (
            <path
              d="M-4,-5.6 C-4,-11 4,-11 4,-5.6 L4.6,0.4 C2.6,1.5 -2.6,1.5 -4.6,0.4 Z"
              opacity={0.5}
            />
          )}
          <circle cx={0} cy={-5.6} r={3.2} />
          <path
            d={
              man
                ? "M-5.8,8 L-5.8,4.4 C-5.8,1.6 -4,0.2 -1.8,0.2 L1.8,0.2 C4,0.2 5.8,1.6 5.8,4.4 L5.8,8 Z"
                : "M-4.9,8 C-4.9,3.2 -3.2,0.6 0,0.6 C3.2,0.6 4.9,3.2 4.9,8 Z"
            }
          />
        </motion.g>
      </g>
    </motion.g>
  );
}

/* Revenue: green bills rising off a studio, one after another. */

function Money({
  x,
  start,
  n,
  spread = 34,
}: {
  x: number;
  start: number;
  n: number;
  spread?: number;
}) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const dx = ((i * 37) % spread) - spread / 2;
        const dur = 2.4 + (i % 3) * 0.3;
        return (
          <motion.g
            key={i}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], y: [0, -46], rotate: [-8, 8] }}
            transition={{
              delay: start + (i * dur) / n,
              duration: dur,
              repeat: Infinity,
              ease: "easeOut",
              times: [0, 0.2, 0.7, 1],
            }}
          >
            <g transform={`translate(${x + dx} 578)`}>
              <rect
                x={-8}
                y={-4.5}
                width={16}
                height={9}
                rx={1.8}
                fill={CASH}
              />
              <rect
                x={-6.4}
                y={-2.9}
                width={12.8}
                height={5.8}
                rx={1}
                fill="none"
                stroke="#14532d"
                strokeWidth={0.7}
                opacity={0.6}
              />
              <circle r={1.9} fill="#14532d" opacity={0.7} />
            </g>
          </motion.g>
        );
      })}
    </>
  );
}

function Crowd({
  cx,
  cy,
  cols,
  rows,
  gap,
  man,
  men = [],
  start,
}: {
  cx: number;
  cy: number;
  cols: number;
  rows: number;
  gap: number;
  man?: boolean;
  /* Which figures in an otherwise female crowd are men. */
  men?: number[];
  start: number;
}) {
  const figs = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      /* Every other row shifts half a step, so it reads as a crowd. */
      const x = cx + (c - (cols - 1) / 2) * gap + (r % 2 ? gap / 4 : -gap / 4);
      const y = cy + (r - (rows - 1) / 2) * gap;
      figs.push(
        <Figure
          key={`${r}-${c}`}
          x={x}
          y={y}
          man={man || men.includes(r * cols + c)}
          scale={Math.min(1, gap / 17)}
          delay={start + (r * cols + c) * 0.04}
        />,
      );
    }
  return <>{figs}</>;
}

function Currents({ k }: { k: number }) {
  const uid = useId().replace(/:/g, "");
  const X: Spread = (x, anchor = x) => anchor * k + (x - anchor);
  return (
    <svg
      viewBox={`0 0 ${W * k} ${H}`}
      className="absolute inset-0 h-full w-full overflow-visible"
      aria-hidden
    >
      <defs>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0" stopColor={NEW} stopOpacity="0.28" />
          <stop offset="1" stopColor={NEW} stopOpacity="0" />
        </radialGradient>
      </defs>

      <defs>
        <radialGradient id={`${uid}-rose`}>
          <stop offset="0" stopColor={ROSE} stopOpacity="0.22" />
          <stop offset="1" stopColor={ROSE} stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.ellipse
        cx={X(200)}
        cy={470}
        rx={190 * k}
        ry={150}
        fill={`url(#${uid}-rose)`}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.ellipse
        cx={X(130)}
        cy={230}
        rx={130 * k}
        ry={150}
        fill={`url(#${uid}-rose)`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: T.team, duration: 1.5 }}
      />

      {/* The new channel glows, so the eye lands on it last. */}
      <motion.ellipse
        cx={X(356)}
        cy={250}
        rx={Math.min(70, W * k - X(356))}
        ry={150}
        fill={`url(#${uid}-glow)`}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.6, 1] }}
        transition={{
          delay: T.google,
          duration: 3,
          times: [0, 0.3, 0.65, 1],
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <defs>
        <radialGradient id={`${uid}-red`}>
          <stop offset="0" stopColor={B2B} stopOpacity="0.16" />
          <stop offset="1" stopColor={B2B} stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.ellipse
        cx={X(268)}
        cy={262}
        rx={46}
        ry={100}
        fill={`url(#${uid}-red)`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: T.b2b, duration: 1.2 }}
      />

      {flows(X).map((f) => (
        <g key={f.id}>
          {/* A soft wide stroke under every current, so it reads as light. */}
          <motion.path
            d={f.d}
            fill="none"
            stroke={f.color}
            strokeOpacity={0.07}
            strokeWidth={(f.width ?? 1.4) * 5}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: f.start + 0.3, duration: 1.2 }}
          />
          {f.fresh ? (
            <motion.path
              id={`${uid}-${f.id}`}
              d={f.d}
              fill="none"
              stroke={f.color}
              strokeOpacity={0.45}
              strokeWidth={f.width ?? 1.4}
              strokeLinecap="round"
              strokeDasharray="4 5"
              initial={{ opacity: 0, strokeDashoffset: 0 }}
              animate={{ opacity: 1, strokeDashoffset: -36 }}
              transition={{
                opacity: { delay: f.start, duration: 0.4 },
                strokeDashoffset: {
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            />
          ) : (
            <motion.path
              id={`${uid}-${f.id}`}
              d={f.d}
              fill="none"
              stroke={f.color}
              strokeOpacity={0.3}
              strokeWidth={f.width ?? 1.4}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { delay: f.start, duration: 0.6, ease: "easeOut" },
                opacity: { delay: f.start, duration: 0.01 },
              }}
            />
          )}
          {/* The current itself: particles riding the path, hidden until
              their turn so none of them waits at the origin. */}
          <g className="motion-reduce:hidden">
            {Array.from({ length: f.n }, (_, i) => {
              const begin = `${f.start + 0.4 + (i * f.dur) / f.n}s`;
              const r = (f.width ?? 1.4) + 0.6;
              const fill =
                f.menEvery && (i + 1) % f.menEvery === 0 ? MAN : f.color;
              return (
                <g key={i} opacity={0}>
                  <circle r={r * 2.8} fill={fill} opacity={0.18} />
                  <circle r={r} fill={fill} />
                  <animateMotion
                    dur={`${f.dur}s`}
                    begin={begin}
                    repeatCount="indefinite"
                  >
                    <mpath href={`#${uid}-${f.id}`} />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.15;0.8;1"
                    dur={`${f.dur}s`}
                    begin={begin}
                    repeatCount="indefinite"
                  />
                </g>
              );
            })}
          </g>
        </g>
      ))}

      {/* Labels on the currents. */}
      {(
        [
          [(X(72, 48) + X(100, 138)) / 2, 39, "middle", "video", T.team],
          [
            (X(204, 228) + X(174, 138)) / 2,
            41,
            "middle",
            "skripta",
            T.team + 0.25,
          ],
          [X(145, 138), 124, "start", "montaža", T.team + 0.2],
          [X(234, 228), 140, "start", "oglasi", T.team + 0.3],
          [X(349, 356), 124, "end", "novi kanal", T.google],
        ] as const
      ).map(([x, y, anchor, text, delay]) => (
        <motion.text
          key={text}
          x={x}
          y={y}
          textAnchor={anchor}
          fontSize={9}
          fontWeight={600}
          fill={text === "novi kanal" ? NEW : MUTED}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
        >
          {text}
        </motion.text>
      ))}

      {/* Models in front of the camera with Branka. */}
      {(
        [
          [32, 128, false],
          [48, 126, true],
          [64, 128, false],
        ] as const
      ).map(([x, y, man], i) => (
        <Figure
          key={x}
          x={X(x, 48)}
          y={y}
          man={man}
          color={CONTENT}
          delay={T.team + 0.25 + i * 0.08}
        />
      ))}
      <motion.text
        x={X(48)}
        y={152}
        textAnchor="middle"
        fontSize={9}
        fontWeight={600}
        fill={MUTED}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: T.team + 0.5 }}
      >
        modeli
      </motion.text>

      {/* Clients turn into money in both studios; Google adds more. */}
      <Money x={X(44, 68)} start={T.crowd + 1.2} n={3} />
      <Money x={X(168, 200)} start={T.crowd + 1.4} n={3} />
      <Money x={X(44, 68)} start={T.google + 1.6} n={3} />
      <Money x={X(168, 200)} start={T.google + 1.8} n={3} />

      <Crowd
        cx={X(88)}
        cy={298}
        cols={3}
        rows={3}
        gap={17}
        start={T.crowd + 0.2}
      />
      <Crowd
        cx={X(190)}
        cy={292}
        cols={2}
        rows={1}
        gap={18}
        man
        start={T.crowd + 0.2}
      />
      <Crowd
        cx={X(356)}
        cy={308}
        cols={5}
        rows={4}
        gap={14}
        men={[3, 9, 12, 18]}
        start={T.google + 0.4}
      />
      <Crowd
        cx={X(268)}
        cy={299}
        cols={3}
        rows={2}
        gap={13}
        men={[1, 5]}
        start={T.b2b + 0.3}
      />

      {(
        [
          [88, 345, "žene", WOMAN, T.crowd + 0.5],
          [190, 318, "muškarci (razvija se)", MAN, T.crowd + 0.5],
        ] as const
      ).map(([x, y, text, fill, delay]) => (
        <motion.text
          key={text}
          x={X(x)}
          y={y}
          textAnchor="middle"
          fontSize={9}
          fontWeight={700}
          fill={fill}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ delay }}
        >
          {text}
        </motion.text>
      ))}
    </svg>
  );
}

/* A firm, drawn as a small glass tower: red face, lit windows, a door. */
function FirmLogo({ size }: { size: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }} aria-hidden>
      <defs>
        <linearGradient id={`${uid}-f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff8a80" />
          <stop offset="1" stopColor="#e53935" />
        </linearGradient>
      </defs>
      <path d="M3.5,22 L3.5,10.5 L9,8 L9,22 Z" fill="#b71c1c" />
      <path
        d="M8,22 L8,4 Q8,2.6 9.4,2.4 L18.6,1.6 Q20.5,1.5 20.5,3.3 L20.5,22 Z"
        fill={`url(#${uid}-f)`}
      />
      {[5.5, 9.5, 13.5].map((y) =>
        [11, 14.5, 18].map((x) => (
          <rect
            key={`${x}-${y}`}
            x={x - 1.1}
            y={y}
            width={2.2}
            height={2.4}
            rx={0.4}
            fill="#fff"
            opacity={0.9}
          />
        )),
      )}
      {[13, 17].map((y) => (
        <rect
          key={y}
          x={5}
          y={y}
          width={2.4}
          height={2}
          rx={0.4}
          fill="#fff"
          opacity={0.55}
        />
      ))}
      <rect x={12.8} y={17.6} width={3.4} height={4.4} rx={0.6} fill="#fff" />
      <path
        d="M2,22 L22,22"
        stroke="#fff"
        strokeOpacity={0.5}
        strokeWidth={0.8}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Where the B2B current turns into a booking: the voucher with its QR code. */
function VoucherStop() {
  return (
    <motion.div
      className="absolute flex items-center rounded-full font-semibold leading-none"
      style={{
        ...at(262, 346),
        translate: "-50% -50%",
        gap: u(3),
        padding: `${u(3)} ${u(6)}`,
        fontSize: u(8),
        color: B2B,
        background: SURFACE,
        border: `${u(1)} dashed ${B2B}`,
      }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: T.b2b + 0.5,
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
      <Ticket style={{ width: u(9), height: u(9) }} />
      <span className="whitespace-nowrap">vaučer</span>
      <QrCode style={{ width: u(9), height: u(9), marginLeft: u(2) }} />
      <span className="whitespace-nowrap">QR</span>
    </motion.div>
  );
}

/* The /admin calendar: a week of slots that book themselves, one after
   another, then clear and start over. Gold ones came in through Google. */
const CAL_DAYS = ["P", "U", "S", "Č", "P"];
const CAL_ROWS = 4;
const CAL_CYCLE = 7;
/* Cell index (row-major) → who booked it, in the order they arrive. */
const CAL_BOOKINGS: [number, string][] = [
  [6, WOMAN],
  [1, WOMAN],
  [13, NEW],
  [8, MAN],
  [15, WOMAN],
  [3, NEW],
  [10, WOMAN],
  [17, NEW],
  [0, WOMAN],
  [12, WOMAN],
  [19, NEW],
  [4, WOMAN],
];

/* The dashboard panels beside the studio: same card, different ledger. */
function Panel({
  x,
  y,
  delay,
  icon,
  path,
  name,
  note,
  children,
}: {
  x: number;
  y: number;
  delay: number;
  icon: React.ReactNode;
  path: string;
  name: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{
        ...at(x, y),
        translate: "-50% 0",
        marginTop: u(-36),
        width: u(96),
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 20 }}
    >
      <div
        style={{
          width: u(80),
          padding: u(6),
          borderRadius: u(10),
          background: SURFACE,
          border: `${u(1.2)} solid ${ROSE}`,
        }}
      >
        <div
          className="flex items-center justify-between leading-none"
          style={{ marginBottom: u(4) }}
        >
          <span
            className="flex items-center font-bold"
            style={{ gap: u(2.5), fontSize: u(7.5), color: ROSE_SOFT }}
          >
            {icon}
            {path}
          </span>
          <motion.span
            className="rounded-full"
            style={{ width: u(4), height: u(4), background: CASH }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        </div>
        {children}
      </div>
      <p
        className="font-bold leading-none"
        style={{ fontSize: u(11.5), marginTop: u(6) }}
      >
        {name}
      </p>
      <p
        className="whitespace-nowrap font-medium leading-none"
        style={{ fontSize: u(8.5), marginTop: u(3), color: MUTED }}
      >
        {note}
      </p>
    </motion.div>
  );
}

function Calendar({ x, y, delay }: { x: number; y: number; delay: number }) {
  const booked = new Map(
    CAL_BOOKINGS.map(([c, color], i) => [c, { color, i }]),
  );
  return (
    <Panel
      x={x}
      y={y}
      delay={delay}
      icon={<CalendarDays style={{ width: u(8), height: u(8) }} />}
      path="/admin"
      name="Kalendar"
      note="svaki termin, sam"
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${CAL_DAYS.length}, 1fr)`,
          gap: u(2.5),
        }}
      >
        {CAL_DAYS.map((d, i) => (
          <span
            key={i}
            className="text-center font-bold leading-none"
            style={{ fontSize: u(6), color: MUTED }}
          >
            {d}
          </span>
        ))}
        {Array.from({ length: CAL_DAYS.length * CAL_ROWS }, (_, c) => {
          const b = booked.get(c);
          /* When in the cycle this slot fills, as a fraction of it. */
          const t = b ? (0.4 + b.i * 0.42) / CAL_CYCLE : 0;
          const loop = {
            delay: delay + 0.6,
            duration: CAL_CYCLE,
            repeat: Infinity,
            ease: "easeOut",
          } as const;
          return (
            <div
              key={c}
              className="relative"
              style={{
                height: u(7),
                borderRadius: u(2),
                background: "rgba(222,178,170,0.08)",
              }}
            >
              {b && (
                <motion.div
                  className="absolute inset-0"
                  style={{ borderRadius: u(2), background: b.color }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 0, 1, 1, 0],
                    scale: [0, 0, 1.4, 1, 1],
                  }}
                  /* Pops in on its turn, holds until the week is full,
                       then everything clears together. */
                  transition={{
                    opacity: { ...loop, times: [0, t, t + 0.02, 0.9, 1] },
                    scale: { ...loop, times: [0, t, t + 0.03, t + 0.07, 1] },
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* /finances: income, costs and profit, each underlined in its own colour.
   The lines draw in on the same rhythm as the calendar fills. */
const FIN_ROWS: [string, string, string, number][] = [
  ["Prihodi", CASH, "840.000", 1],
  ["Rashodi", B2B, "310.000", 0.37],
  ["Profit", NEW, "530.000", 0.63],
];

function Finances({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <Panel
      x={x}
      y={y}
      delay={delay}
      icon={<Wallet style={{ width: u(8), height: u(8) }} />}
      path="/finances"
      name="Finansije"
      note="svaki dinar, sam"
    >
      <div className="flex flex-col" style={{ gap: u(4) }}>
        {FIN_ROWS.map(([label, color, amount, share], i) => {
          const t = (0.6 + i * 1.6) / CAL_CYCLE;
          return (
            <div key={label}>
              <div
                className="flex items-baseline justify-between font-bold leading-none"
                style={{ fontSize: u(6.5) }}
              >
                <span style={{ color: IVORY }}>{label}</span>
                <span style={{ color }}>{amount}</span>
              </div>
              <div
                style={{
                  marginTop: u(2.5),
                  height: u(1.8),
                  borderRadius: u(1),
                  background: "rgba(222,178,170,0.08)",
                }}
              >
                <motion.div
                  className="h-full origin-left"
                  style={{
                    width: `${share * 100}%`,
                    borderRadius: u(1),
                    background: color,
                    boxShadow: `0 0 ${u(4)} ${color}`,
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: [0, 0, 1, 1, 0] }}
                  transition={{
                    delay: delay + 0.6,
                    duration: CAL_CYCLE,
                    repeat: Infinity,
                    ease: "easeOut",
                    times: [0, t, t + 0.12, 0.9, 1],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* Skeylo: the S mark cropped off the wordmark, taking its 10%. */
function Skeylo({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{ ...at(x, y), translate: "-50% 0", marginTop: u(-15) }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 20 }}
    >
      <div
        className="grid place-items-center rounded-full"
        style={{
          width: u(30),
          height: u(30),
          background: SURFACE,
          border: `${u(1.4)} solid ${SKEYLO}`,
        }}
      >
        <span
          className="relative block overflow-hidden"
          style={{ width: u(10.5), height: u(17) }}
        >
          <Image
            src="/logo.webp"
            alt="Skeylo"
            width={2000}
            height={717}
            sizes="96px"
            className="absolute left-0 top-0 max-w-none"
            style={{ height: "100%", width: "auto" }}
          />
        </span>
      </div>
      <p
        className="font-bold leading-none"
        style={{ fontSize: u(10), marginTop: u(5) }}
      >
        Skeylo
      </p>
      <p
        className="font-extrabold leading-none"
        style={{ fontSize: u(10), marginTop: u(3), color: SKEYLO }}
      >
        10%
      </p>
    </motion.div>
  );
}

/* A person: round crop on the face, name and what they do underneath. */
function Person({
  who,
  name,
  role,
  x,
  y,
  delay,
  size = 44,
  ring = LINE,
}: {
  who: keyof typeof PEOPLE | (keyof typeof PEOPLE)[];
  name: string;
  role: string;
  x: number;
  y: number;
  delay: number;
  size?: number;
  ring?: string;
}) {
  const faces = Array.isArray(who) ? who : [who];
  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{
        ...at(x, y),
        translate: "-50% 0",
        marginTop: u(-size / 2),
        width: u(96),
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Two people doing one job share a node, faces overlapping. */}
      <div className="flex">
        {faces.map((f, i) => (
          <div
            key={f}
            className="relative overflow-hidden rounded-full"
            style={{
              width: u(size),
              height: u(size),
              marginLeft: i ? u(-size * 0.3) : 0,
              boxShadow: `0 0 0 ${u(1.6)} ${ring}, 0 0 0 ${u(3)} #150e10`,
            }}
          >
            <Image
              src={PEOPLE[f].src}
              alt={PEOPLE[f].name}
              fill
              sizes="96px"
              className="object-cover"
              style={{
                objectPosition: "50% 30%",
                transform: `scale(${PEOPLE[f].zoom})`,
                transformOrigin: PEOPLE[f].origin,
              }}
            />
          </div>
        ))}
      </div>
      <p
        className="font-bold leading-none"
        style={{ fontSize: u(11.5), marginTop: u(6) }}
      >
        {name}
      </p>
      <p
        className="whitespace-nowrap font-medium leading-none"
        style={{ fontSize: u(8.5), marginTop: u(3), color: MUTED }}
      >
        {role}
      </p>
    </motion.div>
  );
}

/* A channel: the platform's mark in a dark disc, name and note underneath. */
function Channel({
  x,
  y,
  delay,
  logo,
  name,
  note,
  fresh,
  accent = NEW,
  badge,
}: {
  x: number;
  y: number;
  delay: number;
  logo: React.ReactNode;
  name: string;
  note: string;
  fresh?: boolean;
  /* Colour of a dashed channel's ring and note. */
  accent?: string;
  /* A pill on the disc: "Novo" for Google, "Uspešno" for Meta. */
  badge?: { text: string; color: string };
}) {
  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{
        ...at(x, y),
        translate: "-50% 0",
        marginTop: u(-26),
        width: u(110),
      }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 240, damping: 18 }}
    >
      <div
        className="relative grid place-items-center rounded-full"
        style={{
          width: u(52),
          height: u(52),
          background: SURFACE,
          border: `${u(1.4)} ${fresh ? "dashed" : "solid"} ${fresh ? accent : LINE}`,
        }}
      >
        {logo}
        {badge && (
          <motion.span
            className="absolute rounded-full font-extrabold uppercase"
            style={{
              top: u(-6),
              right: u(badge.text.length > 4 ? -26 : -14),
              fontSize: u(7.5),
              padding: `${u(2)} ${u(5)}`,
              letterSpacing: "0.08em",
              background: badge.color,
              color: badge.color === B2B ? "#fff" : "#1a1113",
            }}
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: delay + 0.5 }}
          >
            {badge.text}
          </motion.span>
        )}
      </div>
      <p
        className="font-bold leading-none"
        style={{ fontSize: u(11.5), marginTop: u(6) }}
      >
        {name}
      </p>
      <p
        className="whitespace-nowrap font-medium leading-none"
        style={{
          fontSize: u(8.5),
          marginTop: u(3),
          color: fresh ? accent : MUTED,
        }}
      >
        {note}
      </p>
    </motion.div>
  );
}

/* A location: a photo card of the city, the people who work there on its
   corner. Beograd is still a plan, so it is dimmed and outlined in gold. */
function Studio({
  x,
  y = 625,
  name,
  img,
  staff = [],
  soon,
  delay,
}: {
  x: number;
  y?: number;
  name: string;
  img: string;
  staff?: (keyof typeof PEOPLE)[];
  soon?: boolean;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute"
      style={{
        ...at(x, y),
        translate: "-50% -50%",
        width: u(120),
        height: u(84),
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          borderRadius: u(12),
          border: `${u(1.4)} ${soon ? "dashed" : "solid"} ${soon ? NEW : ROSE}`,
        }}
      >
        <Image
          src={img}
          alt={name}
          fill
          sizes="160px"
          className="object-cover"
          style={{ filter: soon ? "saturate(0.8) brightness(0.9)" : undefined }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(21,14,16,0) 30%, rgba(21,14,16,0.92) 100%)",
          }}
        />
        <div
          className="absolute leading-none"
          style={{ left: u(8), right: u(6), bottom: u(7) }}
        >
          <p
            className="flex items-center font-extrabold"
            style={{ gap: u(3), fontSize: u(12.5), color: soon ? NEW : IVORY }}
          >
            <MapPin
              style={{
                width: u(11),
                height: u(11),
                color: soon ? NEW : ROSE_SOFT,
              }}
            />
            <span className="whitespace-nowrap">{name}</span>
          </p>
          {soon && (
            <p
              className="whitespace-nowrap font-semibold"
              style={{ fontSize: u(8.5), marginTop: u(3), color: NEW }}
            >
              uskoro
            </p>
          )}
        </div>
      </div>
      {staff.length > 0 && (
        <div className="absolute flex" style={{ top: u(-10), right: u(-6) }}>
          {staff.map((f, i) => (
            <div
              key={f}
              className="relative overflow-hidden rounded-full"
              style={{
                width: u(28),
                height: u(28),
                marginLeft: i ? u(-9) : 0,
                boxShadow: `0 0 0 ${u(1.4)} ${ROSE}, 0 0 0 ${u(2.8)} #150e10`,
              }}
            >
              <Image
                src={PEOPLE[f].src}
                alt={PEOPLE[f].name}
                fill
                sizes="48px"
                className="object-cover"
                style={{
                  objectPosition: "50% 30%",
                  transform: `scale(${PEOPLE[f].zoom})`,
                  transformOrigin: PEOPLE[f].origin,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function Board({ k }: { k: number }) {
  return (
    <div
      className="relative mx-auto"
      style={{
        width: `min(100cqw, 100cqh * ${(W * k) / H})`,
        height: `min(100cqh, 100cqw * ${H / (W * k)})`,
        containerType: "size",
        ["--s" as string]: 1 + (k - 1) * 0.2,
      }}
    >
      <Currents k={k} />

      {/* Meta, as it runs today. */}
      <Person
        who="branka"
        name="Branka"
        role="pred kamerom"
        x={48}
        y={48}
        delay={T.team}
      />
      <Person
        who={["mihac", "nina"]}
        name="Mihajlo i Nina"
        role="snimanje · organizacija"
        x={138}
        y={48}
        size={40}
        delay={T.team + 0.1}
      />
      <Person
        who="filip"
        name="Filip"
        role="Meta oglasi"
        x={228}
        y={56}
        delay={T.team + 0.2}
      />
      <Channel
        x={138}
        y={170}
        delay={T.team + 0.5}
        logo={<MetaLogo size={u(19)} />}
        name="Meta"
        note="oglasi + organski"
        badge={{ text: "Uspešno", color: CASH }}
      />

      {/* Google, what Luka wants to open. */}
      <Person
        who="luka"
        name="Luka"
        role="sajt + Google"
        x={356}
        y={41}
        delay={T.google}
        ring={NEW}
      />
      <Channel
        x={356}
        y={170}
        delay={T.google + 0.15}
        logo={
          /* The real Ads mark, cropped above its wordmark. */
          <span
            className="relative block overflow-hidden"
            style={{ width: u(27), height: u(27 * (580 / 640)) }}
          >
            <Image
              src="/ils/google_ads.webp"
              alt="Google Ads"
              fill
              sizes="64px"
              className="object-cover object-top"
            />
          </span>
        }
        name="Google Ads"
        note="visoka kupovna namera"
        fresh
        badge={{ text: "Novo", color: NEW }}
      />

      {/* B2B: possible, not part of this pitch. */}
      <Channel
        x={268}
        y={200}
        delay={T.b2b}
        logo={<FirmLogo size={u(26)} />}
        name="Firme"
        note="vaučeri za radnike"
        fresh
        accent={B2B}
        badge={{ text: "Moguće", color: B2B }}
      />
      <VoucherStop />
      <motion.div
        className="absolute flex flex-col items-center rounded-[14px] leading-none"
        style={{
          ...at(200, 398),
          translate: "-50% -50%",
          gap: u(4),
          padding: `${u(6)} ${u(10)}`,
          background: SURFACE,
          border: `${u(1.2)} solid ${ROSE}`,
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: T.crowd + 0.5, duration: 0.35 }}
      >
        <span
          className="flex items-center font-bold"
          style={{ gap: u(4), fontSize: u(9.5) }}
        >
          <Globe style={{ width: u(10), height: u(10), color: ROSE }} />
          <span className="whitespace-nowrap">infinitylaserstudio.com</span>
        </span>
        <span
          className="flex items-center font-semibold"
          style={{ gap: u(3), fontSize: u(8), color: ROSE_SOFT }}
        >
          <CalendarCheck style={{ width: u(9), height: u(9) }} />
          <span className="whitespace-nowrap">online zakazivanje</span>
        </span>
      </motion.div>

      {/* The studio itself, Ana on its corner. */}
      <motion.div
        className="absolute flex flex-col items-center"
        style={{
          ...at(200, 470),
          translate: "-50% 0",
          marginTop: u(-36),
          width: u(150),
        }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: T.hub,
          type: "spring",
          stiffness: 220,
          damping: 18,
        }}
      >
        <div className="relative" style={{ width: u(72), height: u(72) }}>
          <motion.div
            aria-hidden
            className="absolute rounded-full blur-xl"
            style={{
              inset: u(-14),
              background:
                "radial-gradient(circle, rgba(230,194,186,0.35), transparent 70%)",
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="relative h-full w-full overflow-hidden rounded-full"
            style={{ background: "#fff", boxShadow: `0 0 0 ${u(2)} ${ROSE}` }}
          >
            <Image
              src="/ils/logo.webp"
              alt="Infinity Laser Studio"
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>
          <div
            className="absolute overflow-hidden rounded-full"
            style={{
              width: u(26),
              height: u(26),
              right: u(-6),
              bottom: u(-2),
              boxShadow: `0 0 0 ${u(1.4)} ${ROSE}, 0 0 0 ${u(2.8)} #150e10`,
            }}
          >
            <Image
              src={PEOPLE.ana.src}
              alt={PEOPLE.ana.name}
              fill
              sizes="48px"
              className="object-cover"
              style={{
                objectPosition: "50% 30%",
                transform: `scale(${PEOPLE.ana.zoom})`,
                transformOrigin: PEOPLE.ana.origin,
              }}
            />
          </div>
          <div
            className="absolute leading-none"
            style={{ left: `calc(100% + ${u(9)})`, bottom: u(1) }}
          >
            <p className="font-bold" style={{ fontSize: u(9) }}>
              Ana
            </p>
            <p
              className="whitespace-nowrap font-medium"
              style={{ fontSize: u(7.5), marginTop: u(2), color: MUTED }}
            >
              vlasnica
            </p>
          </div>
        </div>
        <p
          className="whitespace-nowrap font-semibold leading-none"
          style={{
            fontSize: u(13),
            marginTop: u(7),
            fontFamily: "var(--font-ils-serif), Georgia, serif",
          }}
        >
          Infinity Laser Studio
        </p>
      </motion.div>
      <Finances x={94} y={470} delay={T.crowd + 0.9} />
      <Skeylo x={22} y={463} delay={T.crowd + 1.3} />
      <Calendar x={334} y={478} delay={T.crowd + 0.8} />

      <Studio
        x={68}
        y={629}
        name="Novi Sad"
        img="/ils/lokacije/novi_sad.webp"
        staff={["ana", "branka"]}
        delay={T.hub + 0.4}
      />
      <Studio
        x={200}
        y={620}
        name="Sombor"
        img="/ils/lokacije/sombor.webp"
        staff={["ana", "mila", "tanja"]}
        delay={T.hub + 0.5}
      />
      <Studio
        x={332}
        y={632}
        name="Beograd"
        img="/ils/lokacije/beograd.webp"
        soon
        delay={T.google + 1}
      />
    </div>
  );
}

/* How far the board may widen to fill a box: 1 on a phone, more as the
   box gets wider than the board is tall. Stepped so a resize does not
   re-render on every pixel, and rounded down so the board always fits. */
function spreadFor(w: number, h: number) {
  const k = Math.floor(((w / h) * (H / W)) / 0.05) * 0.05;
  return Math.min(K_MAX, Math.max(1, k));
}

/* Not a regular Slide: the board is the slide, so it gets every pixel the
   stage has, sized by whichever side runs out first. */
export function Today() {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState<number | null>(null);

  /* Measured before the first paint, so the board mounts once at its final
     width and its entrance plays from the start. */
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      /* client size, not the rect: the box enters scaled down. */
      const { clientWidth: w, clientHeight: h } = el;
      if (w && h) setK(spreadFor(w, h));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="h-full"
      style={{
        backgroundImage:
          "radial-gradient(110% 55% at 50% 0%, #2c1d21 0%, rgba(21,14,16,0) 70%)",
      }}
    >
      <section className="relative mx-auto flex h-full w-full max-w-[1680px] flex-col px-3 pb-3 pt-4 md:px-8 md:pt-6 lg:flex-row lg:items-center lg:gap-10 lg:px-10 lg:py-5">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="shrink-0 px-2 md:px-0 lg:w-[250px] xl:w-[290px]"
        >
          <Kicker>Danas</Kicker>
          <motion.h1
            variants={item}
            className="text-[clamp(1.45rem,6.2vw,1.9rem)] font-semibold leading-[1.1] md:text-[2.1rem] lg:text-[clamp(1.9rem,2.5vw,2.6rem)]"
            style={{ fontFamily: SERIF }}
          >
            Kako klijenti <em style={{ color: ROSE_SOFT }}>danas</em> stižu u
            Infinity.
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-4 hidden text-[15px] leading-snug lg:block"
            style={{ color: MUTED }}
          >
            Meta dovodi uglavnom žene, a svi zakazuju preko sajta. Google je
            sledeći korak: ljudi, <b>koji već sami traže tretman</b>.
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          ref={box}
          className="mt-2 flex min-h-0 min-w-0 flex-1 items-center justify-center self-stretch md:mt-4 lg:mt-0"
          style={{ containerType: "size" }}
        >
          {k !== null && <Board k={k} />}
        </motion.div>
      </section>
    </div>
  );
}
