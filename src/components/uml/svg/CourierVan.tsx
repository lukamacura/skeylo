import type { CSSProperties } from "react";
import { VAN_STROKES } from "./van-strokes";

const BODY =
  "M738,428 L738,198 C738,176 726,164 706,164 L326,164 C298,164 280,172 264,192 L208,270 C200,281 190,288 176,292 L124,306 C104,312 92,326 90,346 L88,402 C87,420 96,428 112,428 Z";
const WINDOW =
  "M292,188 L238,266 C231,277 235,284 247,284 L378,284 C386,284 390,280 390,272 L390,198 C390,192 386,188 380,188 Z";
const ISLAND =
  "M6,498 C14,462 200,450 420,448 C640,446 826,456 834,498 C842,542 620,568 420,568 C220,568 -2,542 6,498 Z";
const PIN =
  "M118,134 C96,104 84,90 84,72 C84,52 100,38 118,38 C136,38 152,52 152,72 C152,90 140,104 118,134 Z";
const CLOUD_RIGHT =
  "M722,114 C700,114 696,84 718,82 C722,60 758,56 766,78 C784,66 810,78 804,98 C822,100 822,114 806,114 Z";
const CLOUD_LEFT =
  "M36,246.8 C18,246.8 14.7,222.2 32.7,220.6 C36,202.5 65.5,199.2 72.1,217.3 C86.8,207.4 108.2,217.3 103.2,233.7 C118,235.4 118,246.8 104.9,246.8 Z";

const SPOKES = [0, 72, 144, 216, 288];
const ROAD_DASHES = [80, 170, 260, 350, 440, 530, 620, 710];
const STARS = [
  { x: 214, y: 120, r: 17, fill: "var(--sun)" },
  { x: 752, y: 180, r: 12, fill: "#fff" },
  { x: 392, y: 34, r: 14, fill: "#fff" },
  { x: 52, y: 352, r: 14, fill: "var(--sun)" },
  { x: 690, y: 26, r: 16, fill: "var(--sun)" },
];
const PUFFS = [
  { x: 768, y: 416, r: 10 },
  { x: 790, y: 404, r: 14 },
  { x: 816, y: 392, r: 8 },
];

const order = (i: number) => ({ "--i": i }) as CSSProperties;

function Ink({
  group,
  color = "var(--ink)",
}: {
  group: keyof typeof VAN_STROKES;
  color?: string;
}) {
  return (
    <g className="uml-van-ink" stroke={color}>
      {VAN_STROKES[group].map(([d, width, i, ghost]) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          strokeWidth={width}
          className={ghost ? "uml-van-ghost" : undefined}
          style={order(i)}
        />
      ))}
    </g>
  );
}

function Wheel({ cx, group }: { cx: number; group: "wheelF" | "wheelR" }) {
  const cy = 420;
  return (
    <g
      className="uml-van-wheel"
      style={{ transformOrigin: `${cx}px ${cy}px` }}
      data-wheel={group}
    >
      <g className="uml-van-color">
        <circle cx={cx} cy={cy} r={50} fill="var(--ink)" />
        <circle cx={cx} cy={cy} r={27} fill="var(--paper)" />
        <circle cx={cx} cy={cy} r={9} fill="var(--coral)" />
        {SPOKES.map((angle) => (
          <rect
            key={angle}
            x={cx - 2.5}
            y={cy - 24}
            width={5}
            height={11}
            rx={2.5}
            fill="var(--ink)"
            transform={`rotate(${angle} ${cx} ${cy})`}
          />
        ))}
      </g>
      <Ink group={group} />
    </g>
  );
}

/**
 * Kurirski kombi na naslovnom slajdu: prvo se iscrta kao skica, pa se oboji i
 * krene, kao što i prezentacija ide od skice do realizacije. Konačno stanje je
 * podrazumevano, pa štampa i smanjen pokret vide samo njega.
 */
export default function CourierVan() {
  return (
    <svg viewBox="0 0 840 580" aria-hidden className="uml-van">
      <defs>
        <clipPath id="van-body">
          <path d={BODY} />
        </clipPath>
        <clipPath id="van-window">
          <path d={WINDOW} />
        </clipPath>
        <clipPath id="van-island">
          <path d={ISLAND} />
        </clipPath>
        {/* Sunce se završava iza kombija, da ne viri između točkova. */}
        <clipPath id="van-sky">
          <rect x={0} y={-20} width={840} height={450} />
        </clipPath>
      </defs>

      <g clipPath="url(#van-sky)">
        <circle
          className="uml-van-sun"
          cx={478}
          cy={246}
          r={232}
          fill="var(--coral)"
        />
        <Ink group="ring" color="#fff" />
      </g>

      <path
        className="uml-van-route"
        d="M124,142 C150,192 238,150 300,112 C346,84 386,70 424,76"
      />
      <g className="uml-van-color">
        <path d={CLOUD_RIGHT} fill="var(--paper)" />
        <path d={CLOUD_LEFT} fill="var(--paper)" />
        <path d={PIN} fill="var(--teal)" />
      </g>
      <Ink group="sky" />
      <circle
        className="uml-van-color uml-van-pin-dot"
        cx={118}
        cy={72}
        r={12}
      />

      <g className="uml-van-ground">
        <path d={ISLAND} fill="var(--teal)" />
        <path
          clipPath="url(#van-island)"
          d="M-10,528 C160,512 320,522 470,516 C620,510 740,512 850,522 L850,600 L-10,600 Z"
          fill="#0fb39b"
        />
        <path
          d="M52,458 L788,458 C824,458 824,512 788,512 L52,512 C16,512 16,458 52,458 Z"
          fill="var(--ink)"
        />
        {ROAD_DASHES.map((x) => (
          <path
            key={x}
            d={`M${x},485 L${x + 46},485`}
            stroke="#fff"
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.9}
          />
        ))}
      </g>

      <g className="uml-van-truck">
        {/* Papir ispod boja: dok se linije crtaju, kombi je bela skica. */}
        <g className="uml-van-paper" fill="var(--paper)">
          <rect x={427} y={69} width={118} height={86} />
          <rect x={553} y={95} width={94} height={60} />
          <rect x={571} y={43} width={66} height={52} />
          <path d={BODY} transform="translate(-4 3)" />
          <circle cx={204} cy={420} r={50} />
          <circle cx={612} cy={420} r={50} />
        </g>

        <g className="uml-van-color" transform="translate(-3 3)">
          <rect x={430} y={66} width={118} height={86} fill="#ff9f43" />
          <rect x={478} y={66} width={24} height={86} fill="#ffe2b0" />
          <rect x={556} y={92} width={94} height={60} fill="var(--teal)" />
          <rect
            x={556}
            y={116}
            width={94}
            height={12}
            fill="var(--paper)"
            opacity={0.85}
          />
          <rect x={574} y={40} width={66} height={52} fill="var(--paper)" />
          <rect x={600} y={40} width={14} height={52} fill="var(--coral)" />
        </g>
        <Ink group="load" />

        <g className="uml-van-color" transform="translate(-4 3)">
          <path d={BODY} fill="var(--sun)" />
          <g clipPath="url(#van-body)">
            <rect x={80} y={160} width={670} height={30} fill="#ffdc6b" />
            <path
              d="M70,372 C300,372 500,356 750,262 L750,312 C500,404 300,412 70,412 Z"
              fill="var(--coral)"
            />
            <path
              d="M70,412 C300,412 500,404 750,312 L750,330 C500,420 300,428 70,428 Z"
              fill="var(--teal)"
            />
            <rect x={80} y={412} width={670} height={20} fill="#f5a81c" />
            <path
              d="M138,428 C138,390 166,358 204,358 C242,358 270,390 270,428 Z"
              fill="var(--ink)"
            />
            <path
              d="M546,428 C546,390 574,358 612,358 C650,358 678,390 678,428 Z"
              fill="var(--ink)"
            />
          </g>
          <path d={WINDOW} fill="#bfeaff" />
          <g clipPath="url(#van-window)">
            <path
              d="M276,284 C276,262 296,254 322,254 C350,254 368,264 370,284 Z"
              fill="var(--iris)"
            />
            <circle cx={322} cy={233} r={24} fill="#ffd7b5" />
            <path
              d="M298,228 C298,201 348,199 348,229 L348,234 L298,230 Z"
              fill="var(--coral)"
            />
            <path
              d="M300,226 L285,230 C282,232 285,235 289,235 L304,233 Z"
              fill="#e23a63"
            />
            <path
              d="M250,284 L306,188 L330,188 L274,284 Z"
              fill="#fff"
              opacity={0.35}
            />
            <path
              d="M352,284 L388,222 L388,250 L370,284 Z"
              fill="#fff"
              opacity={0.35}
            />
          </g>
          <path
            d="M95,338 C97,326 106,318 122,312 L142,307 C146,318 141,334 128,341 L104,348 C97,349 94,345 95,338 Z"
            fill="var(--paper)"
          />
          <path
            d="M727,296 L738,296 L738,352 L727,352 C723,352 723,296 727,296 Z"
            fill="#e23a63"
          />
          <path
            d="M78,398 L142,398 C150,398 150,430 142,430 L90,430 C80,430 74,424 74,414 L74,402 C74,400 76,398 78,398 Z"
            fill="var(--ink)"
          />
          <path
            d="M722,404 L748,404 C754,404 754,430 748,430 L722,430 Z"
            fill="var(--ink)"
          />
          <path
            d="M232,260 L212,258 C204,258 202,274 210,276 L232,276 Z"
            fill="var(--ink)"
          />
          <path
            d="M360,306 L392,306 C398,306 398,318 392,318 L360,318 C354,318 354,306 360,306 Z"
            fill="var(--ink)"
          />
          <rect x={632} y={244} width={46} height={46} fill="var(--teal)" />
          <rect x={649} y={244} width={12} height={46} fill="var(--paper)" />
        </g>
        <Ink group="van" />

        <g className="uml-van-color">
          <path
            d="M305,245 C309,250 315,250 320,247"
            fill="none"
            stroke="var(--ink)"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle cx={308} cy={236} r={2.6} fill="var(--ink)" />
          <text x={424} y={236} className="uml-van-label">
            Kurirska
          </text>
          <text x={424} y={288} className="uml-van-label">
            služba
          </text>
        </g>

        <Wheel cx={204} group="wheelF" />
        <Wheel cx={612} group="wheelR" />
      </g>

      <Ink group="speed" color="#fff" />
      {PUFFS.map((puff, i) => (
        <circle
          key={puff.x}
          className="uml-van-pop"
          style={order(i)}
          cx={puff.x}
          cy={puff.y}
          r={puff.r}
          fill="var(--paper)"
        />
      ))}
      {STARS.map(({ x, y, r, fill }, i) => (
        <path
          key={x}
          className="uml-van-pop"
          style={order(i + 3)}
          d={`M${x},${y - r} Q${x},${y} ${x + r},${y} Q${x},${y} ${x},${y + r} Q${x},${y} ${x - r},${y} Q${x},${y} ${x},${y - r} Z`}
          fill={fill}
        />
      ))}
    </svg>
  );
}
