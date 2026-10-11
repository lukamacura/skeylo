"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  Target,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/os/Shell";
import { OS, STATE, type StateKey } from "@/lib/os/theme";
import type { Person } from "@/lib/os/types";

export type Branch = {
  id: "scripts" | "shoots" | "tasks" | "finance" | "goals" | "clients";
  href: string;
  label: string;
  state: StateKey;
  value: string;
  sub: string;
  people: string[];
  /** Koliko toga teče kroz granu (broj čestica struje). */
  load: number;
};

const ICON: Record<Branch["id"], LucideIcon> = {
  scripts: FileText,
  shoots: CalendarDays,
  tasks: CheckCircle2,
  finance: Wallet,
  goals: Target,
  clients: Users,
};

type Pt = [number, number];

/** Izlomljena linija sa zaobljenim uglovima, kao trasa na pločici. */
function trace(pts: Pt[], r = 14) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    const l1 = Math.hypot(x - px, y - py);
    const l2 = Math.hypot(nx - x, ny - y);
    const k = Math.min(r, l1 / 2, l2 / 2);
    const a: Pt = [
      x - ((x - px) / (l1 || 1)) * k,
      y - ((y - py) / (l1 || 1)) * k,
    ];
    const b: Pt = [
      x + ((nx - x) / (l2 || 1)) * k,
      y + ((ny - y) / (l2 || 1)) * k,
    ];
    d += ` L${a[0]},${a[1]} Q${x},${y} ${b[0]},${b[1]}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  return `${d} L${lx},${ly}`;
}

type Box = { x: number; y: number; w: number; h: number };
type Layout = { h: number; center: Box; nodes: Box[]; paths: string[] };

/* Desktop: centar u sredini, tri grane levo i tri desno, ulaze u centar na tri visine.
   Telefon: centar gore, grane u dve kolone, trase se skupljaju u snop između kolona. */
function layout(w: number): Layout {
  if (w >= 720) {
    const h = 520;
    const nw = Math.min(250, w * 0.27);
    const nh = 132;
    const center: Box = { x: w / 2 - 110, y: h / 2 - 78, w: 220, h: 156 };
    const rows = [h * 0.16, h * 0.5, h * 0.84];
    const nodes: Box[] = [];
    const paths: string[] = [];
    [0, 1].forEach((side) => {
      rows.forEach((cy, row) => {
        nodes.push({ x: side ? w - nw : 0, y: cy - nh / 2, w: nw, h: nh });
        const edge = side ? w - nw : nw;
        const into = side ? center.x + center.w : center.x;
        const bus = (edge + into) / 2 + (side ? 1 : -1) * (row === 1 ? 0 : 18);
        const ey = h / 2 + (row - 1) * 30;
        paths.push(
          row === 1
            ? trace([
                [edge, cy],
                [into, cy],
              ])
            : trace([
                [edge, cy],
                [bus, cy],
                [bus, ey],
                [into, ey],
              ]),
        );
      });
    });
    // Redosled grana: levo gore→dole, pa desno gore→dole.
    return { h, center, nodes, paths };
  }
  const gap = 36;
  const nw = (w - gap) / 2;
  const nh = 136;
  const center: Box = { x: w / 2 - 105, y: 0, w: 210, h: 112 };
  const rowY = [
    center.h + 52,
    center.h + 52 + nh + 14,
    center.h + 52 + 2 * (nh + 14),
  ];
  const h = rowY[2] + nh;
  const nodes: Box[] = [];
  const paths: string[] = [];
  [0, 1].forEach((side) => {
    rowY.forEach((y, row) => {
      nodes.push({ x: side ? w - nw : 0, y, w: nw, h: nh });
      const edge = side ? w - nw : nw;
      const off = 15 - row * 5.5;
      const bus = w / 2 + (side ? 1 : -1) * off;
      const cy = y + nh / 2;
      paths.push(
        trace(
          [
            [edge, cy],
            [bus, cy],
            [bus, center.h],
          ],
          8,
        ),
      );
    });
  });
  return { h, center, nodes, paths };
}

export default function Circuit({
  branches,
  center,
  team,
}: {
  branches: Branch[];
  center: { value: string; sub: string; state: StateKey };
  team: Person[];
}) {
  const uid = useId().replace(/:/g, "");
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const L = w ? layout(w) : null;

  return (
    <div ref={box} className="relative w-full" style={{ height: L?.h ?? 560 }}>
      {L && (
        <>
          <svg
            className="pointer-events-none absolute inset-0"
            width={w}
            height={L.h}
            aria-hidden
          >
            <defs>
              <radialGradient id={`${uid}-core`}>
                <stop offset="0" stopColor={OS.brand} stopOpacity="0.32" />
                <stop offset="1" stopColor={OS.brand} stopOpacity="0" />
              </radialGradient>
            </defs>
            <motion.ellipse
              cx={L.center.x + L.center.w / 2}
              cy={L.center.y + L.center.h / 2}
              rx={L.center.w * 0.9}
              ry={L.center.h * 1.1}
              fill={`url(#${uid}-core)`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            {branches.map((b, i) => {
              const d = L.paths[i];
              const color = STATE[b.state];
              const live = b.state !== "idle";
              const n = live ? Math.max(1, Math.min(5, b.load)) : 0;
              const dur = 2.6;
              const start = 0.15 + i * 0.08;
              return (
                <g key={b.id}>
                  {/* Mek, širok potez ispod: struja se čita kao svetlo. */}
                  <motion.path
                    d={d}
                    fill="none"
                    stroke={color}
                    strokeOpacity={live ? 0.09 : 0.04}
                    strokeWidth={7}
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: start + 0.3, duration: 1 }}
                  />
                  <motion.path
                    id={`${uid}-p${i}`}
                    d={d}
                    fill="none"
                    stroke={color}
                    strokeOpacity={live ? 0.45 : 0.2}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeDasharray={live ? undefined : "3 5"}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      pathLength: {
                        delay: start,
                        duration: 0.7,
                        ease: "easeOut",
                      },
                      opacity: { delay: start, duration: 0.01 },
                    }}
                  />
                  <g className="motion-reduce:hidden">
                    {Array.from({ length: n }, (_, k) => {
                      const begin = `${start + 0.7 + (k * dur) / n}s`;
                      return (
                        <g key={k} opacity={0}>
                          <circle r={5} fill={color} opacity={0.2} />
                          <circle r={2} fill={color} />
                          <animateMotion
                            dur={`${dur}s`}
                            begin={begin}
                            repeatCount="indefinite"
                          >
                            <mpath href={`#${uid}-p${i}`} />
                          </animateMotion>
                          <animate
                            attributeName="opacity"
                            values="0;1;1;0"
                            keyTimes="0;0.12;0.85;1"
                            dur={`${dur}s`}
                            begin={begin}
                            repeatCount="indefinite"
                          />
                        </g>
                      );
                    })}
                  </g>
                </g>
              );
            })}
          </svg>

          <motion.div
            className="absolute flex flex-col items-center justify-center rounded-[28px] text-center"
            style={{
              left: L.center.x,
              top: L.center.y,
              width: L.center.w,
              height: L.center.h,
              background: "rgba(20,20,23,0.85)",
              border: `1px solid ${OS.brand}55`,
              boxShadow: `0 0 0 6px ${OS.brand}0d, 0 20px 60px rgba(0,0,0,0.5)`,
            }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0, visualDuration: 0.4 }}
          >
            <span
              className="flex items-center gap-1.5 text-[12px] font-semibold uppercase"
              style={{ color: OS.brand, letterSpacing: "0.08em" }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{
                  background: OS.brand,
                  boxShadow: `0 0 8px ${OS.brand}`,
                }}
              />
              Skeylo
            </span>
            <span
              className="mt-1 text-[26px] font-semibold tabular-nums md:text-[30px]"
              style={{ letterSpacing: "-0.03em", color: OS.text }}
            >
              {center.value}
            </span>
            <span
              className="mt-0.5 flex items-center gap-1.5 text-[12px]"
              style={{ color: OS.muted }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: STATE[center.state] }}
              />
              {center.sub}
            </span>
          </motion.div>

          {branches.map((b, i) => {
            const n = L.nodes[i];
            const Icon = ICON[b.id];
            const color = STATE[b.state];
            const faces = b.people
              .map((id) => team.find((p) => p.id === id))
              .filter(Boolean) as Person[];
            return (
              <motion.div
                key={b.id}
                className="absolute"
                style={{ left: n.x, top: n.y, width: n.w, height: n.h }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  bounce: 0,
                  visualDuration: 0.35,
                  delay: 0.1 + i * 0.05,
                }}
              >
                <Link
                  href={b.href}
                  className="flex h-full flex-col rounded-[20px] p-3 transition-[transform,background] duration-100 hover:bg-[#1a1a1e] active:scale-[0.98] md:p-3.5"
                  style={{
                    background: OS.surface,
                    border: `1px solid ${b.state === "idle" ? OS.line : `${color}40`}`,
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="grid size-7 shrink-0 place-items-center rounded-lg"
                      style={{ background: `${color}1f`, color }}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span
                      className="truncate text-[14px] font-semibold"
                      style={{ color: OS.text }}
                    >
                      {b.label}
                    </span>
                  </span>
                  <span
                    className="mt-auto truncate text-[22px] font-semibold tabular-nums leading-tight md:text-[24px]"
                    style={{ letterSpacing: "-0.03em", color: OS.text }}
                  >
                    {b.value}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2">
                    <span
                      className="min-w-0 flex-1 truncate text-[12px]"
                      style={{
                        color:
                          b.state === "late" || b.state === "attention"
                            ? color
                            : OS.muted,
                      }}
                    >
                      {b.sub}
                    </span>
                    <span className="hidden shrink-0 -space-x-1.5 min-[400px]:flex">
                      {faces.slice(0, 3).map((p) => (
                        <Avatar key={p.id} person={p} size={20} />
                      ))}
                    </span>
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </>
      )}
    </div>
  );
}
