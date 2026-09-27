"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { inQuad, pathOf, poly, type Pt } from "./geometry";

/* ------------------------------------------------------------------ */
/*  Paneli                                                              */
/*  Svaki panel je četvorougao izračunat kroz kameru scene, pa mu ivice */
/*  prate krov u stopu. Staklo i odsjaj koriste gradijente vezane za    */
/*  ceo krov, pa se nebo ogleda preko niza kao preko jedne površine.    */
/* ------------------------------------------------------------------ */

export interface PanelCell {
  key: string;
  flat: boolean;
  order: number;
  /** Gore levo, gore desno, dole desno, dole levo. */
  q: [Pt, Pt, Pt, Pt];
}

interface PanelProps {
  cell: PanelCell;
  still: boolean;
  frame: string;
  line: string;
  detail: boolean;
}

const n1 = (v: number) => v.toFixed(2);

/** Linije ćelija: prate perspektivu panela. */
function cellLines(q: PanelCell["q"], detail: boolean) {
  const cols = detail ? [1 / 3, 2 / 3] : [0.5];
  const rows = detail ? [0.2, 0.4, 0.6, 0.8] : [1 / 3, 2 / 3];
  let d = "";
  for (const a of cols) {
    const p = inQuad(q, a, 0.04);
    const e = inQuad(q, a, 0.96);
    d += `M${n1(p[0])} ${n1(p[1])}L${n1(e[0])} ${n1(e[1])}`;
  }
  for (const b of rows) {
    const p = inQuad(q, 0.05, b);
    const e = inQuad(q, 0.95, b);
    d += `M${n1(p[0])} ${n1(p[1])}L${n1(e[0])} ${n1(e[1])}`;
  }
  return d;
}

const Panel = memo(function Panel({
  cell,
  still,
  frame,
  line,
  detail,
}: PanelProps) {
  const { q } = cell;
  const [tl, tr, br, bl] = q;
  const points = poly(q);
  const delay = still ? 0 : Math.min(cell.order, 22) * 0.018;
  // Panel ulazi niz krov, iz pravca slemena, i "legne" na svoje mesto.
  const dx = ((tl[0] + tr[0] - bl[0] - br[0]) / 2) * 0.45;
  const dy = ((tl[1] + tr[1] - bl[1] - br[1]) / 2) * 0.45 - 3;
  return (
    <motion.g
      initial={{ opacity: 0, x: dx, y: dy }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{
        opacity: 0,
        x: dx * 0.4,
        y: dy * 0.4,
        transition: { duration: 0.2 },
      }}
      transition={
        still
          ? { duration: 0 }
          : {
              x: { type: "spring", stiffness: 130, damping: 21, delay },
              y: { type: "spring", stiffness: 130, damping: 21, delay },
              opacity: { duration: 0.28, delay },
            }
      }
    >
      <polygon
        points={
          cell.flat
            ? poly([
                bl,
                br,
                [br[0] + 0.8, br[1] + 2.6],
                [bl[0] - 0.8, bl[1] + 2.6],
              ])
            : poly(q.map((p) => [p[0] - 1, p[1] + 1.7] as Pt))
        }
        fill="#000"
        opacity={cell.flat ? 0.34 : 0.26}
      />
      <polygon
        points={points}
        fill="url(#hs-pglass)"
        stroke={frame}
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <path
        d={cellLines(q, detail)}
        stroke={line}
        strokeWidth={0.5}
        fill="none"
      />
      <polygon points={points} fill="url(#hs-array)" />
    </motion.g>
  );
}, samePanel);

function samePanel(a: PanelProps, b: PanelProps) {
  if (
    a.frame !== b.frame ||
    a.line !== b.line ||
    a.still !== b.still ||
    a.detail !== b.detail
  )
    return false;
  for (let i = 0; i < 4; i++) {
    if (a.cell.q[i][0] !== b.cell.q[i][0] || a.cell.q[i][1] !== b.cell.q[i][1])
      return false;
  }
  return true;
}

export default function Panels({
  cells,
  ...rest
}: { cells: PanelCell[] } & Omit<PanelProps, "cell">) {
  return (
    <AnimatePresence>
      {cells.map((cell) => (
        <Panel key={cell.key} cell={cell} {...rest} />
      ))}
    </AnimatePresence>
  );
}

/** Svi paneli kao jedna putanja: maska za odsjaj koji pređe preko niza. */
export const panelsPath = (cells: PanelCell[]) =>
  cells.map((c) => pathOf(c.q)).join("");
