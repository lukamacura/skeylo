"use client";

import { useId, type CSSProperties } from "react";
import { Lock } from "lucide-react";
import { DISPLAY, RED } from "../primitives";

/* ------------------------------------------------------------------------
   The things a knowledge base swallows, drawn: office files with a folded
   corner and a type badge, and the cardboard folder with an elastic band
   every Serbian office has a shelf of (fascikla). Plus the base itself.
   All SVG, sized in em, so a parent's font size scales the whole drawing.
   ------------------------------------------------------------------------ */

export type FileKind = "pdf" | "xlsx" | "docx";

const BADGE: Record<FileKind, string> = {
  pdf: RED,
  xlsx: "#1D7A45",
  docx: "#2B5797",
};

const PAPER_LINE = "#C9C5BA";
const PAPER_EDGE = "#CFCBC0";

/* What is printed on the page, small. */
function PageArt({ kind, art }: { kind: FileKind; art?: "plan" }) {
  if (art === "plan")
    return (
      <g fill="none" stroke="#8F8B80" strokeWidth={1.1}>
        <path d="M8.5 15.5h23v15h-23z" />
        <path d="M18 15.5v6h-9.5M24 30.5v-5h7.5" />
        <path d="M12 24.5h4v3.5h-4z" fill="#F2B8B4" stroke="none" />
        <circle cx={27} cy={20} r={1.6} fill={RED} stroke="none" />
      </g>
    );
  if (kind === "xlsx")
    return (
      <g fill="none" stroke={PAPER_LINE} strokeWidth={0.9}>
        <path d="M8.5 15.5h23v15h-23z" />
        <path d="M8.5 19.25h23M8.5 23h23M8.5 26.75h23M16 15.5v15M24 15.5v15" />
        <path d="M8.5 15.5h23v3.75h-23z" fill="#D7EBDD" stroke="none" />
      </g>
    );
  return (
    <g fill={PAPER_LINE}>
      <rect x={8.5} y={15} width={14} height={2.2} rx={1.1} fill="#9A968C" />
      <rect x={8.5} y={20} width={23} height={1.7} rx={0.85} />
      <rect x={8.5} y={24} width={20} height={1.7} rx={0.85} />
      <rect x={8.5} y={28} width={23} height={1.7} rx={0.85} />
    </g>
  );
}

/* A page with a dog-ear and its type on a coloured tab. 40 x 50. */
export function FileDoc({
  kind = "pdf",
  art,
  size = 2.4,
  className = "",
  style,
}: {
  kind?: FileKind;
  art?: "plan";
  /* width in em */
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 40 50"
      aria-hidden
      className={`block flex-none overflow-visible ${className}`}
      style={{
        width: `${size}em`,
        height: `${size * 1.25}em`,
        filter: "drop-shadow(0 0.08em 0.14em rgba(0,0,0,0.18))",
        ...style,
      }}
    >
      <path
        d="M5 1.5h21l11.5 11.5v33a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-42.5a2 2 0 0 1 2-2z"
        fill="#fff"
        stroke={PAPER_EDGE}
        strokeWidth={1}
      />
      <path
        d="M26 1.5v9.5a2 2 0 0 0 2 2h9.5"
        fill="#EEEBE3"
        stroke={PAPER_EDGE}
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <PageArt kind={kind} art={art} />
      <rect x={0} y={34} width={25} height={11} rx={2} fill={BADGE[kind]} />
      <text
        x={12.5}
        y={42.1}
        textAnchor="middle"
        fill="#fff"
        fontSize={7.4}
        fontWeight={800}
        letterSpacing={0.3}
        style={{ fontFamily: DISPLAY }}
      >
        {kind.toUpperCase()}
      </text>
    </svg>
  );
}

/* The cardboard folder: back cover, two sheets sticking out, the front
   with its white label, and the elastic band over two corners. 64 x 50. */
export type FolderTone = "kraft" | "blue" | "red" | "green";

const TONE: Record<
  FolderTone,
  { front: string; back: string; crease: string }
> = {
  kraft: { front: "#D9B47C", back: "#B98F55", crease: "#C39C63" },
  blue: { front: "#3F72B8", back: "#2C5895", crease: "#335F9F" },
  red: { front: "#D9463B", back: "#AF3128", crease: "#C23A30" },
  green: { front: "#4B9467", back: "#367451", crease: "#3F8058" },
};

export function Fascikla({
  label,
  tone = "kraft",
  size = 3,
  className = "",
  style,
}: {
  label: string;
  tone?: FolderTone;
  /* width in em */
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const c = TONE[tone];
  /* the band's clip, one per drawing */
  const clip = `fasc${useId().replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 64 50"
      aria-hidden
      className={`block flex-none overflow-visible ${className}`}
      style={{
        width: `${size}em`,
        height: `${(size * 50) / 64}em`,
        filter: "drop-shadow(0 0.1em 0.16em rgba(0,0,0,0.22))",
        ...style,
      }}
    >
      <defs>
        <clipPath id={clip}>
          <rect x={1} y={9} width={62} height={40} rx={3} />
        </clipPath>
      </defs>
      <rect x={2} y={5} width={60} height={44} rx={3} fill={c.back} />
      <rect
        x={8}
        y={1.5}
        width={46}
        height={20}
        rx={1}
        fill="#fff"
        stroke="#D8D4C8"
        strokeWidth={0.8}
        transform="rotate(-3 31 11)"
      />
      <rect
        x={12}
        y={2.5}
        width={46}
        height={20}
        rx={1}
        fill="#F5F2E9"
        stroke="#D8D4C8"
        strokeWidth={0.8}
        transform="rotate(2.5 35 12)"
      />
      <rect x={1} y={9} width={62} height={40} rx={3} fill={c.front} />
      <path d="M1 13.5h62" stroke={c.crease} strokeWidth={1} />
      <rect
        x={13}
        y={20}
        width={38}
        height={15}
        rx={1.5}
        fill="#FFFCF2"
        stroke="rgba(0,0,0,0.12)"
        strokeWidth={0.6}
      />
      <text
        x={32}
        y={29.6}
        textAnchor="middle"
        fill="#1A1A1A"
        fontSize={label.length > 8 ? 5.6 : 6.6}
        fontWeight={800}
        fontStyle="italic"
        style={{ fontFamily: DISPLAY }}
      >
        {label}
      </text>
      <path d="M17 32h30" stroke="#D5D0C3" strokeWidth={0.6} />
      <g clipPath={`url(#${clip})`} stroke="#1E1E1E" strokeWidth={2.4}>
        <path d="M49 8l16 16" />
        <path d="M-1 34l16 16" />
      </g>
    </svg>
  );
}

/* The base: a red stack of discs with a lock on it. 52 x 60. */
export function DataBase({
  size = 2.8,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`relative block flex-none ${className}`}
      style={{ width: `${size}em`, height: `${(size * 60) / 52}em` }}
    >
      <svg
        viewBox="0 0 52 60"
        aria-hidden
        className="block h-full w-full overflow-visible"
        style={{ filter: "drop-shadow(0 0.12em 0.2em rgba(158,18,11,0.35))" }}
      >
        <path d="M4 11v37a22 8 0 0 0 44 0V11z" fill={RED} />
        <path
          d="M4 23.5a22 8 0 0 0 44 0M4 36a22 8 0 0 0 44 0"
          fill="none"
          stroke="#9E120B"
          strokeWidth={1.6}
        />
        <ellipse cx={26} cy={11} rx={22} ry={8} fill="#FF6A62" />
        <ellipse cx={26} cy={11} rx={13} ry={4.2} fill="#FF8A84" />
        <circle cx={40} cy={30} r={1.6} fill="#fff" />
        <circle cx={40} cy={42.5} r={1.6} fill="#fff" />
      </svg>
      <span
        className="absolute -bottom-[0.15em] -right-[0.3em] grid place-items-center rounded-full bg-black text-white"
        style={{
          width: `${size * 0.38}em`,
          height: `${size * 0.38}em`,
          boxShadow: "0 0 0 0.12em #F7F6F2",
        }}
      >
        <Lock style={{ width: "55%", height: "55%" }} strokeWidth={2.8} />
      </span>
    </span>
  );
}
