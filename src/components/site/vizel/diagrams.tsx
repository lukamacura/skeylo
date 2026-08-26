"use client";

import { motion } from "framer-motion";
import {
  Instagram,
  MonitorSmartphone,
  ListChecks,
  FileText,
  CreditCard,
  UserPlus,
  Download,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Database,
  ArrowRight,
  Video,
  type LucideIcon,
} from "lucide-react";
import {
  GOLD,
  GRID,
  INK,
  INK_MUTED,
  MONO,
  SERIES_A,
  useSlideActive,
} from "./primitives";

/* --- The funnel ----------------------------------------------------------
   Nine steps is too many to read as one line, so they are grouped into the
   three lanes that actually behave differently: one you already own, one
   that decides revenue, one that decides churn. */
const LANES: {
  name: string;
  stake: string;
  steps: { icon: LucideIcon; title: string; note: string }[];
}[] = [
  {
    name: "Acquire",
    stake: "Traffic you already own",
    steps: [
      { icon: Instagram, title: "Instagram", note: "Story link, bio, reels" },
      {
        icon: MonitorSmartphone,
        title: "Landing page",
        note: "One promise, one button",
      },
      { icon: ListChecks, title: "Quiz", note: "6 questions, 90 seconds" },
    ],
  },
  {
    name: "Convert",
    stake: "Where revenue is decided",
    steps: [
      { icon: FileText, title: "Results", note: "His plan, before he pays" },
      { icon: CreditCard, title: "Stripe", note: "Charged by Dr.Brace LLC" },
      {
        icon: UserPlus,
        title: "Account",
        note: "Created at checkout, not later",
      },
    ],
  },
  {
    name: "Deliver",
    stake: "Where churn is decided",
    steps: [
      {
        icon: Download,
        title: "App install",
        note: "Already paid, already logged in",
      },
      {
        icon: Sparkles,
        title: "AI plan",
        note: "Recovery first, strength second",
      },
      {
        icon: RefreshCw,
        title: "Weekly refresh",
        note: "Reweighted as the pain drops",
      },
    ],
  },
];

function Node({
  icon: Icon,
  title,
  note,
}: {
  icon: LucideIcon;
  title: string;
  note: string;
}) {
  return (
    <div
      className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2.5 py-2 md:flex-col md:items-start md:gap-1.5 md:px-3 md:py-2.5"
      style={{
        background: "rgba(236,232,212,0.04)",
        border: "1px solid rgba(236,232,212,0.08)",
      }}
    >
      <Icon size={15} style={{ color: GOLD }} className="shrink-0" />
      <div className="min-w-0">
        <p
          className="truncate text-[12px] font-semibold md:text-[13px]"
          style={{ color: INK }}
        >
          {title}
        </p>
        <p
          className="truncate text-[10px] md:text-[11px]"
          style={{ color: INK_MUTED }}
        >
          {note}
        </p>
      </div>
    </div>
  );
}

export function FlowMap() {
  const active = useSlideActive();
  return (
    <div className="flex flex-col gap-3 md:gap-4">
      {LANES.map((lane, li) => (
        <motion.div
          key={lane.name}
          initial={{ opacity: 0, x: -14 }}
          animate={active ? { opacity: 1, x: 0 } : {}}
          transition={{
            delay: 0.15 + li * 0.18,
            type: "spring",
            stiffness: 150,
            damping: 24,
          }}
          className="grid gap-2 md:grid-cols-[minmax(0,150px)_1fr] md:items-center md:gap-4"
        >
          <div>
            <p
              className="text-[11px] uppercase"
              style={{ fontFamily: MONO, letterSpacing: "0.14em", color: GOLD }}
            >
              {lane.name}
            </p>
            <p
              className="text-[10px] md:text-[11px]"
              style={{ color: INK_MUTED }}
            >
              {lane.stake}
            </p>
          </div>
          <div className="flex flex-col gap-1.5 md:flex-row md:items-stretch md:gap-2">
            {lane.steps.map((s, si) => (
              <div
                key={s.title}
                className="flex min-w-0 flex-1 items-center gap-1.5 md:gap-2"
              >
                <Node {...s} />
                {si < lane.steps.length - 1 && (
                  <ArrowRight
                    size={13}
                    className="hidden shrink-0 md:block"
                    style={{ color: INK_MUTED }}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* --- Plan builder pipeline ----------------------------------------------- */
const PIPELINE = [
  {
    title: "Quiz answers",
    note: "Goal, training age, equipment, days, injuries",
  },
  {
    title: "Structured profile",
    note: "Typed fields, not a paragraph of prose",
  },
  {
    title: "Constrained generation",
    note: "Injury filters, progression rules, segment ratio",
  },
  { title: "Schema validation", note: "Wrong shape is rejected and rebuilt" },
  {
    title: "Rendered natively",
    note: "Sets, reps and loads - not a wall of text",
  },
];

export function PlanPipeline() {
  const active = useSlideActive();
  return (
    <div>
      <div className="grid gap-2 md:grid-cols-5">
        {PIPELINE.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 14 }}
            animate={active ? { opacity: 1, y: 0 } : {}}
            transition={{
              delay: 0.15 + i * 0.1,
              type: "spring",
              stiffness: 160,
              damping: 24,
            }}
            className="relative rounded-lg px-3 py-2.5"
            style={{
              background: "rgba(236,232,212,0.04)",
              border: `1px solid ${i === 3 ? "rgba(240,182,86,0.4)" : "rgba(236,232,212,0.08)"}`,
            }}
          >
            <span
              className="text-[10px]"
              style={{ fontFamily: MONO, color: i === 3 ? GOLD : INK_MUTED }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <p
              className="mt-0.5 text-[12.5px] font-semibold md:text-[13px]"
              style={{ color: INK }}
            >
              {s.title}
            </p>
            <p
              className="mt-1 text-[11px] leading-snug"
              style={{ color: INK_MUTED }}
            >
              {s.note}
            </p>
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : {}}
        transition={{ delay: 0.9 }}
        className="mt-3 flex items-center gap-2 text-[11px] md:text-xs"
        style={{ fontFamily: MONO, color: INK_MUTED }}
      >
        <ShieldCheck size={13} style={{ color: GOLD }} />
        Step 04 loops back to 03 on failure - a malformed plan never reaches a
        user.
      </motion.p>
    </div>
  );
}

/* --- Retrieval ------------------------------------------------------------ */
export function RagDiagram() {
  const active = useSlideActive();
  const corpus = [
    "Your rehab protocols, by injury and by stage",
    "Which movements to swap, and what to swap them for",
    "When it's safe to load, and when to back off",
    "Your posts, captions and video transcripts",
  ];

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-5">
      <div className="flex flex-col gap-1.5">
        <p
          className="text-[11px] uppercase"
          style={{ fontFamily: MONO, letterSpacing: "0.14em", color: GOLD }}
        >
          Your own material
        </p>
        {corpus.map((c, i) => (
          <motion.div
            key={c}
            initial={{ opacity: 0, x: -10 }}
            animate={active ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.15 + i * 0.08 }}
            className="rounded-lg px-3 py-2 text-[11.5px] md:text-xs"
            style={{
              background: "rgba(236,232,212,0.04)",
              border: "1px solid rgba(236,232,212,0.08)",
              color: INK,
            }}
          >
            {c}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={active ? { opacity: 1, scale: 1 } : {}}
        transition={{
          delay: 0.55,
          type: "spring",
          stiffness: 160,
          damping: 20,
        }}
        className="flex items-center justify-center gap-2 md:flex-col"
      >
        <Database size={16} style={{ color: SERIES_A }} />
        <span
          className="text-center text-[10px] uppercase"
          style={{
            fontFamily: MONO,
            letterSpacing: "0.14em",
            color: INK_MUTED,
          }}
        >
          Indexed · retrieved per user
        </span>
        <ArrowRight size={16} style={{ color: INK_MUTED }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={active ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.7 }}
        className="gold-frame rounded-xl px-4 py-4"
        style={{ background: "rgba(240,182,86,0.06)" }}
      >
        <p
          className="text-[11px] uppercase"
          style={{ fontFamily: MONO, letterSpacing: "0.14em", color: GOLD }}
        >
          The plan the user opens
        </p>
        <p
          className="mt-2 text-[13px] leading-relaxed md:text-sm"
          style={{ color: INK }}
        >
          Your exercise selection. Your progression. Your wording. A model that
          has never read a word of yours writes a plan that could belong to
          anyone.
        </p>
      </motion.div>
    </div>
  );
}

/* --- Delivery timeline ---------------------------------------------------- */
export const MILESTONES = [
  {
    weeks: "Week 1",
    build: "Landing page, quiz and results page live",
    sees: "A real quiz link you can post to your story that week",
  },
  {
    weeks: "Week 2",
    build: "App core: auth, plan view, set logging, progress",
    sees: "A TestFlight build on your own phone",
  },
  {
    weeks: "Week 3",
    build: "Plan builder, retrieval layer, Stripe subscriptions",
    sees: "Your own answers turned into your own plan, end to end",
  },
  {
    weeks: "Week 4",
    build: "Optimisation pass, store assets, both submissions filed",
    sees: "The listings in App Store Connect and Play Console",
  },
  {
    weeks: "Then: review",
    build: "Apple and Google review the build - usually days, not weeks",
    sees: "A live download link and a Stripe dashboard with money in it",
  },
];

export function Timeline() {
  const active = useSlideActive();
  return (
    <ol className="flex flex-col gap-2">
      {MILESTONES.map((m, i) => (
        <motion.li
          key={m.weeks}
          initial={{ opacity: 0, y: 12 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{
            delay: 0.12 + i * 0.09,
            type: "spring",
            stiffness: 160,
            damping: 24,
          }}
          className="grid gap-1 rounded-lg px-3 py-2.5 md:grid-cols-[110px_1fr_1fr] md:items-baseline md:gap-4"
          style={{
            background: "rgba(236,232,212,0.035)",
            border: `1px solid ${i === MILESTONES.length - 1 ? "rgba(240,182,86,0.35)" : "rgba(236,232,212,0.07)"}`,
          }}
        >
          <span
            className="text-[11px] uppercase"
            style={{ fontFamily: MONO, letterSpacing: "0.1em", color: GOLD }}
          >
            {m.weeks}
          </span>
          <span
            className="text-[12.5px] font-semibold md:text-[13.5px]"
            style={{ color: INK }}
          >
            {m.build}
          </span>
          <span
            className="text-[11.5px] md:text-xs"
            style={{ color: INK_MUTED }}
          >
            You see: {m.sees}
          </span>
        </motion.li>
      ))}
      <motion.li
        initial={{ opacity: 0, y: 12 }}
        animate={active ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.6 }}
        className="mt-1 flex items-start gap-2.5 rounded-lg px-3 py-2.5"
        style={{
          background: "rgba(240,182,86,0.07)",
          border: "1px solid rgba(240,182,86,0.35)",
        }}
      >
        <Video
          size={15}
          className="mt-[2px] shrink-0"
          style={{ color: GOLD }}
        />
        <span
          className="text-[12.5px] leading-snug md:text-[13.5px]"
          style={{ color: INK }}
        >
          Every week you get a Loom from me - screen recording, my voice,
          walking through what shipped and what&apos;s next.{" "}
          <span style={{ color: INK_MUTED }}>
            You watch it in five minutes on your own time. No status calls.
          </span>
        </span>
      </motion.li>
      <p
        className="mt-1 text-[11px]"
        style={{
          fontFamily: MONO,
          color: INK_MUTED,
          borderTop: `1px solid ${GRID}`,
          paddingTop: 10,
        }}
      >
        Three to four weeks of building, then an optimisation pass, then review.
        Review is the one step outside my control - which is why we submit early
        enough to absorb a rejection and resubmit without losing the launch.
      </p>
    </ol>
  );
}
