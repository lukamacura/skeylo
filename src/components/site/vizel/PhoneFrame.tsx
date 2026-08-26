"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, Flame, Lock, Play, Send } from "lucide-react";
import { GOLD, INK, INK_MUTED, MONO, useSlideActive } from "./primitives";

/* A phone bezel that wraps live HTML, not a screenshot - the mocked screens
   below are real markup, so they stay sharp at any size and can animate.

   Everything inside a screen is sized in `em`, and the em itself is a slice of
   the frame's own width (`100cqw / 20`, so a 240px frame reads at a 12px base).
   The screens are drawn once at one set of proportions and then scale with the
   bezel - a 150px thumbnail and a 260px hero are the same layout, not two. */
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
        <div
          className="relative h-full w-full overflow-hidden rounded-[1.75rem] bg-[#08070a]"
          style={{ containerType: "inline-size" }}
        >
          <div
            className="relative h-full w-full overflow-hidden"
            style={{ fontSize: "calc(100cqw / 20)" }}
          >
            <div
              aria-hidden
              className="absolute left-1/2 top-[0.7em] z-20 h-[0.7em] w-[26%] -translate-x-1/2 rounded-full bg-black/80"
            />
            {children}
          </div>
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
    <div className="flex h-full flex-col bg-gradient-to-b from-[#12100e] to-[#08070a] px-[1.15em] pb-[1.15em] pt-[2.6em]">
      <p
        className="text-[0.8em] uppercase"
        style={{ fontFamily: MONO, letterSpacing: "0.16em", color: INK_MUTED }}
      >
        {sub ?? "Your app"}
      </p>
      <p
        className="mt-[0.15em] text-[1.3em] font-bold leading-tight"
        style={{ fontFamily: "var(--font-display)", color: INK }}
      >
        {title}
      </p>
      <div className="mt-[0.9em] flex min-h-0 flex-1 flex-col gap-[0.55em]">
        {children}
      </div>
    </div>
  );
}

/* The primary action every screen ends on. */
function Cta({ children }: { children: string }) {
  return (
    <div className="mt-auto pt-[0.6em]">
      <div
        className="rounded-[0.8em] py-[0.6em] text-center text-[1em] font-extrabold"
        style={{
          background: "linear-gradient(100deg, #f0b656, #d87928)",
          color: "#0a0a0a",
        }}
      >
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
      className="flex items-center gap-[0.7em] rounded-[0.8em] px-[0.7em] py-[0.55em]"
      style={{
        background: locked
          ? "rgba(236,232,212,0.025)"
          : "rgba(236,232,212,0.055)",
        border: "1px solid rgba(236,232,212,0.07)",
        opacity: locked ? 0.45 : 1,
      }}
    >
      <span
        className="flex h-[1.5em] w-[1.5em] shrink-0 items-center justify-center rounded-full"
        style={{
          background: done ? GOLD : "rgba(236,232,212,0.1)",
          color: done ? "#0a0a0a" : INK_MUTED,
        }}
      >
        {locked ? (
          <Lock className="h-[0.75em] w-[0.75em]" />
        ) : done ? (
          <Check className="h-[0.85em] w-[0.85em]" strokeWidth={3} />
        ) : (
          <Play className="h-[0.65em] w-[0.65em]" fill="currentColor" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block truncate text-[0.95em] font-semibold"
          style={{ color: INK }}
        >
          {locked ? "••••••••••" : name}
        </span>
        <span
          className="block truncate text-[0.8em]"
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
    <div className="mt-[0.15em] flex items-baseline gap-[0.5em]">
      <span
        className="text-[0.8em] font-bold"
        style={{ fontFamily: MONO, color: n === 1 ? GOLD : INK_MUTED }}
      >
        {n} · {name.toUpperCase()}
      </span>
      <span
        className="text-[0.75em]"
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
        className="flex items-center gap-[0.5em] rounded-[0.8em] px-[0.7em] py-[0.55em]"
        style={{ background: "rgba(240,182,86,0.12)" }}
      >
        <Flame className="h-[1em] w-[1em] shrink-0" style={{ color: GOLD }} />
        <span className="text-[0.9em] font-bold" style={{ color: GOLD }}>
          11-day streak
        </span>
        <span
          className="ml-auto text-[0.8em]"
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
      <Cta>Start workout</Cta>
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
        className="mb-[0.3em] h-[0.3em] w-full overflow-hidden rounded-full"
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
          className="rounded-[0.8em] px-[0.8em] py-[0.75em] text-[1em] font-semibold"
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
      <div className="grid grid-cols-3 gap-[0.4em]">
        {[
          ["Recovery", "Rotator cuff"],
          ["Strength", "Upper/Lower"],
          ["Days", "4 / week"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="rounded-[0.8em] px-[0.55em] py-[0.55em]"
            style={{ background: "rgba(236,232,212,0.05)" }}
          >
            <p
              className="text-[0.7em] uppercase"
              style={{ fontFamily: MONO, color: INK_MUTED }}
            >
              {k}
            </p>
            <p
              className="mt-[0.15em] text-[0.85em] font-bold"
              style={{ color: INK }}
            >
              {v}
            </p>
          </div>
        ))}
      </div>
      <p
        className="mt-[0.3em] text-[0.8em] uppercase"
        style={{ fontFamily: MONO, letterSpacing: "0.14em", color: INK_MUTED }}
      >
        Week 1 preview
      </p>
      <Row name="Day 1 · Recovery + Push" meta="8 min rehab · 34 min lift" />
      <Row name="Day 2 · Recovery + Pull" meta="8 min rehab · 38 min lift" />
      <Row name="Day 3 · Recovery + Legs" meta="Unlock to view" locked />
      <Row name="Day 4 · Recovery + Upper" meta="Unlock to view" locked />
      <Cta>Unlock my plan</Cta>
    </ScreenShell>
  );
}

/* --- Screen: paywall ----------------------------------------------------- */
export function PaywallScreen() {
  return (
    <ScreenShell title="Start your plan" sub="Checkout · Stripe">
      <div
        className="rounded-[0.8em] p-[0.8em]"
        style={{
          background: "rgba(240,182,86,0.1)",
          border: "1px solid rgba(240,182,86,0.4)",
        }}
      >
        <p
          className="text-[0.8em] uppercase"
          style={{ fontFamily: MONO, color: GOLD }}
        >
          Most popular
        </p>
        <p
          className="mt-[0.1em] text-[1.5em] font-bold leading-none"
          style={{ color: INK }}
        >
          Annual
        </p>
        <p
          className="mt-[0.5em] text-[0.8em]"
          style={{ fontFamily: MONO, color: INK_MUTED }}
        >
          7 days free, then billed yearly
        </p>
      </div>
      <div
        className="rounded-[0.8em] p-[0.8em]"
        style={{
          background: "rgba(236,232,212,0.05)",
          border: "1px solid rgba(236,232,212,0.08)",
        }}
      >
        <p
          className="text-[1.3em] font-bold leading-none"
          style={{ color: INK }}
        >
          Monthly
        </p>
        <p
          className="mt-[0.5em] text-[0.8em]"
          style={{ fontFamily: MONO, color: INK_MUTED }}
        >
          Cancel anytime
        </p>
      </div>
      <p
        className="mt-[0.3em] text-[0.75em] leading-relaxed"
        style={{ fontFamily: MONO, color: INK_MUTED }}
      >
        Charged by Dr.Brace LLC via Stripe. Card required to start the trial.
      </p>
      <Cta>Start 7-day trial</Cta>
    </ScreenShell>
  );
}

/* --- Screen: logging ----------------------------------------------------- */
export function LogScreen() {
  return (
    <ScreenShell title="Landmine press" sub="Set 3 of 4 · pain 2/10">
      <div className="grid grid-cols-3 gap-[0.4em] text-center">
        {["Set", "Kg", "Reps"].map((h) => (
          <p
            key={h}
            className="text-[0.7em] uppercase"
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
          <div key={n} className="col-span-3 grid grid-cols-3 gap-[0.4em]">
            {r.map((c, m) => (
              <div
                key={m}
                className="rounded-[0.6em] py-[0.4em] text-[1em] font-bold"
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
        className="mt-[0.5em] rounded-[0.8em] px-[0.7em] py-[0.6em] text-[0.85em] leading-relaxed"
        style={{ background: "rgba(236,232,212,0.045)", color: INK_MUTED }}
      >
        Pain logged at 2/10, down from 4. Load goes up 2kg next week.
      </p>
      <Cta>Log set</Cta>
    </ScreenShell>
  );
}

/* --- Screen: progress ---------------------------------------------------- */
export function ProgressScreen() {
  const active = useSlideActive();
  const bars = [38, 44, 41, 52, 58, 55, 67, 72];
  return (
    <ScreenShell title="Load up, pain down" sub="Progress · 8 weeks">
      <div className="flex h-[42%] items-end gap-[0.35em]">
        {bars.map((b, n) => (
          <motion.div
            key={n}
            className="flex-1 rounded-t-[0.3em]"
            style={{
              background: n === bars.length - 1 ? GOLD : "rgba(240,182,86,0.3)",
            }}
            initial={{ height: 0 }}
            animate={active ? { height: `${b}%` } : { height: 0 }}
            transition={{
              delay: n * 0.05,
              type: "spring",
              stiffness: 140,
              damping: 20,
            }}
          />
        ))}
      </div>
      <div className="mt-[0.5em] grid grid-cols-2 gap-[0.4em]">
        {[
          ["Pain score", "4 → 1"],
          ["Press load", "+14kg"],
          ["Adherence", "86%"],
          ["Sessions", "31"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="rounded-[0.8em] px-[0.55em] py-[0.55em]"
            style={{ background: "rgba(236,232,212,0.05)" }}
          >
            <p
              className="text-[0.7em] uppercase"
              style={{ fontFamily: MONO, color: INK_MUTED }}
            >
              {k}
            </p>
            <p className="text-[1.1em] font-bold" style={{ color: GOLD }}>
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
        className="max-w-[85%] self-end rounded-[0.8em] rounded-br-[0.2em] px-[0.7em] py-[0.55em] text-[0.9em] leading-snug"
        style={{ background: "rgba(240,182,86,0.15)", color: INK }}
      >
        My shoulder hurts on overhead press.
      </div>
      <div
        className="max-w-[90%] rounded-[0.8em] rounded-bl-[0.2em] px-[0.7em] py-[0.55em] text-[0.9em] leading-snug"
        style={{ background: "rgba(236,232,212,0.055)", color: INK }}
      >
        Swap it for landmine press this week - same push pattern, kinder angle.
        I&apos;ve updated Tuesday for you.
      </div>
      <div
        className="max-w-[70%] rounded-[0.8em] rounded-bl-[0.2em] px-[0.7em] py-[0.55em] text-[0.9em]"
        style={{ background: "rgba(236,232,212,0.055)", color: INK_MUTED }}
      >
        Keep the lateral raises light.
      </div>
      <div
        className="mt-auto flex items-center gap-[0.5em] rounded-full px-[0.8em] py-[0.55em]"
        style={{ background: "rgba(236,232,212,0.05)" }}
      >
        <span className="text-[0.9em]" style={{ color: INK_MUTED }}>
          Ask anything
        </span>
        <Send className="ml-auto h-[0.9em] w-[0.9em]" style={{ color: GOLD }} />
      </div>
    </ScreenShell>
  );
}
