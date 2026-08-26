"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, Flame, Lock, Play, Send } from "lucide-react";
import { GOLD, INK, INK_MUTED, MONO, useSlideActive } from "./primitives";

/* A phone bezel that wraps live HTML, not a screenshot - the mocked screens
   below are real markup, so they stay sharp at any size and can animate. */
export function PhoneFrame({
  children,
  className = "",
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        className="relative w-full rounded-[1.9rem] p-[3px] shadow-[0_30px_80px_-30px_rgba(240,182,86,0.35)]"
        style={{
          background:
            "linear-gradient(160deg, rgba(236,232,212,0.28), rgba(236,232,212,0.06) 45%, rgba(236,232,212,0.18))",
          aspectRatio: "9 / 19",
        }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] bg-[#08070a]">
          <div
            aria-hidden
            className="absolute left-1/2 top-2 z-20 h-[7px] w-[26%] -translate-x-1/2 rounded-full bg-black/80"
          />
          <div className="h-full w-full overflow-hidden">{children}</div>
        </div>
      </div>
      {label && (
        <p
          className="text-[10px] uppercase"
          style={{
            fontFamily: MONO,
            letterSpacing: "0.14em",
            color: INK_MUTED,
          }}
        >
          {label}
        </p>
      )}
    </div>
  );
}

/* Shared chrome for every mocked screen. */
function ScreenShell({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#12100e] to-[#08070a] px-3 pb-3 pt-7">
      <p
        className="text-[8px] uppercase"
        style={{ fontFamily: MONO, letterSpacing: "0.16em", color: INK_MUTED }}
      >
        {sub ?? "Your app"}
      </p>
      <p
        className="mt-0.5 text-[13px] font-bold leading-tight"
        style={{ fontFamily: "var(--font-display)", color: INK }}
      >
        {title}
      </p>
      <div className="mt-2.5 flex min-h-0 flex-1 flex-col gap-1.5">
        {children}
      </div>
    </div>
  );
}

function Row({
  name,
  meta,
  done = false,
  locked = false,
}: {
  name: string;
  meta: string;
  done?: boolean;
  locked?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-2 py-1.5"
      style={{
        background: locked
          ? "rgba(236,232,212,0.025)"
          : "rgba(236,232,212,0.055)",
        border: "1px solid rgba(236,232,212,0.07)",
        opacity: locked ? 0.45 : 1,
      }}
    >
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
        style={{
          background: done ? GOLD : "rgba(236,232,212,0.1)",
          color: done ? "#0a0a0a" : INK_MUTED,
        }}
      >
        {locked ? (
          <Lock size={8} />
        ) : done ? (
          <Check size={9} strokeWidth={3} />
        ) : (
          <Play size={7} fill="currentColor" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block truncate text-[9.5px] font-semibold"
          style={{ color: INK }}
        >
          {locked ? "••••••••••" : name}
        </span>
        <span
          className="block truncate text-[8px]"
          style={{ fontFamily: MONO, color: INK_MUTED }}
        >
          {locked ? "•••••" : meta}
        </span>
      </span>
    </div>
  );
}

/* Segment header - every session is recovery first, then strength. */
function Segment({ n, name, meta }: { n: number; name: string; meta: string }) {
  return (
    <div className="mt-0.5 flex items-baseline gap-1.5">
      <span
        className="text-[8px] font-bold"
        style={{ fontFamily: MONO, color: n === 1 ? GOLD : INK_MUTED }}
      >
        {n} · {name.toUpperCase()}
      </span>
      <span
        className="text-[7.5px]"
        style={{ fontFamily: MONO, color: INK_MUTED }}
      >
        {meta}
      </span>
    </div>
  );
}

/* --- Screen: today's session --------------------------------------------- */
export function HomeScreen() {
  return (
    <ScreenShell title="Shoulder + Push · Week 3" sub="Tuesday">
      <div
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5"
        style={{ background: "rgba(240,182,86,0.12)" }}
      >
        <Flame size={11} style={{ color: GOLD }} />
        <span className="text-[9px] font-bold" style={{ color: GOLD }}>
          11-day streak
        </span>
        <span
          className="ml-auto text-[8px]"
          style={{ fontFamily: MONO, color: INK_MUTED }}
        >
          pain 4 → 2
        </span>
      </div>
      <Segment n={1} name="Recovery" meta="8 min" />
      <Row name="Band external rotation" meta="3 × 15 · light" done />
      <Row name="Scap wall slide" meta="2 × 12 · slow" done />
      <Segment n={2} name="Strength" meta="34 min" />
      <Row name="Landmine press" meta="4 × 8 · 24kg" />
      <Row name="Neutral-grip row" meta="4 × 10 · 30kg" />
      <Row name="Lateral raise" meta="3 × 15 · 6kg" />
      <div className="mt-auto pt-1.5">
        <div
          className="rounded-lg py-1.5 text-center text-[10px] font-extrabold"
          style={{
            background: "linear-gradient(100deg, #f0b656, #d87928)",
            color: "#0a0a0a",
          }}
        >
          Start workout
        </div>
      </div>
    </ScreenShell>
  );
}

/* --- Screen: quiz, cycling through its own questions --------------------- */
const QUIZ = [
  { q: "Where does it hurt?", a: ["Lower back", "Shoulder", "Knee"] },
  {
    q: "How bad is it right now?",
    a: ["Only under load", "Daily ache", "Sharp, most days"],
  },
  {
    q: "Has anyone looked at it?",
    a: ["Physio, yes", "Scan, no physio", "Not yet"],
  },
  {
    q: "What do you want back?",
    a: ["Train pain-free", "Get strong again", "Both"],
  },
  {
    q: "What do you have access to?",
    a: ["Full gym", "Home dumbbells", "Bands only"],
  },
  { q: "Days per week?", a: ["3", "4", "5–6"] },
];

export function QuizScreen() {
  const active = useSlideActive();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setI((v) => (v + 1) % QUIZ.length), 2400);
    return () => clearInterval(t);
  }, [active]);

  const step = QUIZ[i];
  const picked = i % step.a.length;

  return (
    <ScreenShell title={step.q} sub={`Question ${i + 1} of 6`}>
      <div
        aria-hidden
        className="mb-1 h-[3px] w-full overflow-hidden rounded-full"
        style={{ background: "rgba(236,232,212,0.09)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: GOLD }}
          animate={{ width: `${((i + 1) / 6) * 100}%` }}
          transition={{ type: "spring", stiffness: 130, damping: 22 }}
        />
      </div>
      {step.a.map((a, n) => (
        <motion.div
          key={`${i}-${a}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: n * 0.06 }}
          className="rounded-lg px-2 py-2 text-[10px] font-semibold"
          style={{
            background:
              n === picked ? "rgba(240,182,86,0.15)" : "rgba(236,232,212,0.05)",
            border: `1px solid ${n === picked ? "rgba(240,182,86,0.5)" : "rgba(236,232,212,0.08)"}`,
            color: n === picked ? GOLD : INK,
          }}
        >
          {a}
        </motion.div>
      ))}
    </ScreenShell>
  );
}

/* --- Screen: results, the pre-paywall proof ------------------------------ */
export function ResultsScreen() {
  return (
    <ScreenShell
      title="Your 12-week plan is ready"
      sub="Shoulder · intermediate"
    >
      <div className="grid grid-cols-3 gap-1">
        {[
          ["Recovery", "Rotator cuff"],
          ["Strength", "Upper/Lower"],
          ["Days", "4 / week"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="rounded-lg px-1.5 py-1.5"
            style={{ background: "rgba(236,232,212,0.05)" }}
          >
            <p
              className="text-[7px] uppercase"
              style={{ fontFamily: MONO, color: INK_MUTED }}
            >
              {k}
            </p>
            <p className="mt-0.5 text-[8.5px] font-bold" style={{ color: INK }}>
              {v}
            </p>
          </div>
        ))}
      </div>
      <p
        className="mt-1 text-[8px] uppercase"
        style={{ fontFamily: MONO, letterSpacing: "0.14em", color: INK_MUTED }}
      >
        Week 1 preview
      </p>
      <Row name="Day 1 · Recovery + Push" meta="8 min rehab · 34 min lift" />
      <Row name="Day 2 · Recovery + Pull" meta="8 min rehab · 38 min lift" />
      <Row name="Day 3 · Recovery + Legs" meta="Unlock to view" locked />
      <Row name="Day 4 · Recovery + Upper" meta="Unlock to view" locked />
      <div className="mt-auto pt-1.5">
        <div
          className="rounded-lg py-1.5 text-center text-[10px] font-extrabold"
          style={{
            background: "linear-gradient(100deg, #f0b656, #d87928)",
            color: "#0a0a0a",
          }}
        >
          Unlock my plan
        </div>
      </div>
    </ScreenShell>
  );
}

/* --- Screen: paywall ----------------------------------------------------- */
export function PaywallScreen() {
  return (
    <ScreenShell title="Start your plan" sub="Checkout · Stripe">
      <div
        className="rounded-lg p-2"
        style={{
          background: "rgba(240,182,86,0.1)",
          border: "1px solid rgba(240,182,86,0.4)",
        }}
      >
        <p
          className="text-[8px] uppercase"
          style={{ fontFamily: MONO, color: GOLD }}
        >
          Most popular
        </p>
        <p
          className="mt-0.5 text-[15px] font-bold leading-none"
          style={{ color: INK }}
        >
          Annual
        </p>
        <p
          className="mt-1 text-[8px]"
          style={{ fontFamily: MONO, color: INK_MUTED }}
        >
          7 days free, then billed yearly
        </p>
      </div>
      <div
        className="rounded-lg p-2"
        style={{
          background: "rgba(236,232,212,0.05)",
          border: "1px solid rgba(236,232,212,0.08)",
        }}
      >
        <p
          className="text-[13px] font-bold leading-none"
          style={{ color: INK }}
        >
          Monthly
        </p>
        <p
          className="mt-1 text-[8px]"
          style={{ fontFamily: MONO, color: INK_MUTED }}
        >
          Cancel anytime
        </p>
      </div>
      <p
        className="mt-1 text-[7.5px] leading-relaxed"
        style={{ fontFamily: MONO, color: INK_MUTED }}
      >
        Charged by Dr.Brace LLC via Stripe. Card required to start the trial.
      </p>
      <div className="mt-auto pt-1.5">
        <div
          className="rounded-lg py-1.5 text-center text-[10px] font-extrabold"
          style={{
            background: "linear-gradient(100deg, #f0b656, #d87928)",
            color: "#0a0a0a",
          }}
        >
          Start 7-day trial
        </div>
      </div>
    </ScreenShell>
  );
}

/* --- Screen: logging ----------------------------------------------------- */
export function LogScreen() {
  return (
    <ScreenShell title="Landmine press" sub="Set 3 of 4 · pain 2/10">
      <div className="grid grid-cols-3 gap-1 text-center">
        {["Set", "Kg", "Reps"].map((h) => (
          <p
            key={h}
            className="text-[7px] uppercase"
            style={{ fontFamily: MONO, color: INK_MUTED }}
          >
            {h}
          </p>
        ))}
        {[
          ["1", "24", "8"],
          ["2", "24", "8"],
          ["3", "26", "-"],
        ].map((r, n) => (
          <div key={n} className="col-span-3 grid grid-cols-3 gap-1">
            {r.map((c, m) => (
              <div
                key={m}
                className="rounded-md py-1 text-[10px] font-bold"
                style={{
                  background:
                    n === 2
                      ? "rgba(240,182,86,0.13)"
                      : "rgba(236,232,212,0.05)",
                  color: n === 2 ? GOLD : INK,
                }}
              >
                {c}
              </div>
            ))}
          </div>
        ))}
      </div>
      <p
        className="mt-1.5 rounded-lg px-2 py-1.5 text-[8.5px] leading-relaxed"
        style={{ background: "rgba(236,232,212,0.045)", color: INK_MUTED }}
      >
        Pain logged at 2/10, down from 4. Load goes up 2kg next week.
      </p>
      <div className="mt-auto pt-1.5">
        <div
          className="rounded-lg py-1.5 text-center text-[10px] font-extrabold"
          style={{
            background: "linear-gradient(100deg, #f0b656, #d87928)",
            color: "#0a0a0a",
          }}
        >
          Log set
        </div>
      </div>
    </ScreenShell>
  );
}

/* --- Screen: progress ---------------------------------------------------- */
export function ProgressScreen() {
  const bars = [38, 44, 41, 52, 58, 55, 67, 72];
  return (
    <ScreenShell title="Load up, pain down" sub="Progress · 8 weeks">
      <div className="flex h-[42%] items-end gap-1">
        {bars.map((b, n) => (
          <motion.div
            key={n}
            className="flex-1 rounded-t-[3px]"
            style={{
              background: n === bars.length - 1 ? GOLD : "rgba(240,182,86,0.3)",
            }}
            initial={{ height: 0 }}
            whileInView={{ height: `${b}%` }}
            viewport={{ once: true }}
            transition={{
              delay: n * 0.05,
              type: "spring",
              stiffness: 140,
              damping: 20,
            }}
          />
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-1">
        {[
          ["Pain score", "4 → 1"],
          ["Press load", "+14kg"],
          ["Adherence", "86%"],
          ["Sessions", "31"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="rounded-lg px-1.5 py-1.5"
            style={{ background: "rgba(236,232,212,0.05)" }}
          >
            <p
              className="text-[7px] uppercase"
              style={{ fontFamily: MONO, color: INK_MUTED }}
            >
              {k}
            </p>
            <p className="text-[11px] font-bold" style={{ color: GOLD }}>
              {v}
            </p>
          </div>
        ))}
      </div>
    </ScreenShell>
  );
}

/* --- Screen: coach chat -------------------------------------------------- */
export function CoachScreen() {
  return (
    <ScreenShell title="Coach" sub="Trained on your method">
      <div
        className="max-w-[85%] self-end rounded-lg rounded-br-sm px-2 py-1.5 text-[9px] leading-snug"
        style={{ background: "rgba(240,182,86,0.15)", color: INK }}
      >
        My shoulder hurts on overhead press.
      </div>
      <div
        className="max-w-[90%] rounded-lg rounded-bl-sm px-2 py-1.5 text-[9px] leading-snug"
        style={{ background: "rgba(236,232,212,0.055)", color: INK }}
      >
        Swap it for landmine press this week - same push pattern, kinder angle.
        I&apos;ve updated Tuesday for you.
      </div>
      <div
        className="max-w-[70%] rounded-lg rounded-bl-sm px-2 py-1.5 text-[9px]"
        style={{ background: "rgba(236,232,212,0.055)", color: INK_MUTED }}
      >
        Keep the lateral raises light.
      </div>
      <div
        className="mt-auto flex items-center gap-1.5 rounded-full px-2 py-1.5"
        style={{ background: "rgba(236,232,212,0.05)" }}
      >
        <span className="text-[9px]" style={{ color: INK_MUTED }}>
          Ask anything
        </span>
        <Send size={10} className="ml-auto" style={{ color: GOLD }} />
      </div>
    </ScreenShell>
  );
}
