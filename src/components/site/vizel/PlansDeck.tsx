"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { MotionConfig, motion } from "framer-motion";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import Gate from "./Gate";
import {
  CONTACT,
  GOLD,
  GRID,
  INK,
  INK_MUTED,
  MONO,
  item,
  pop,
  stagger,
} from "./primitives";

/* Same key as the deck: one pass, entered once, opens both pages for the
   session. */
const STORAGE_KEY = "vizel-deck-open";

/* ---------------------------------------------------------------- helpers */

/* The deck's headline animates per word off a slide-mounted context. This page
   scrolls instead of paging, so the same [[gold]] syntax is rendered as a
   static swipe that survives wrapping - no context, no per-word timing. */
function marked(text: string) {
  return text
    .split(/(\[\[.*?\]\])/g)
    .filter(Boolean)
    .map((part, i) =>
      part.startsWith("[[") ? (
        <span
          key={i}
          className="rounded-[2px] px-[0.06em]"
          style={{
            color: GOLD,
            backgroundImage:
              "linear-gradient(100deg, rgba(240,182,86,0.26), rgba(216,121,40,0.14))",
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 74%",
            backgroundPosition: "left 88%",
            WebkitBoxDecorationBreak: "clone",
            boxDecorationBreak: "clone",
          }}
        >
          {part.slice(2, -2)}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
}

function Head({ children }: { children: string }) {
  return (
    <motion.h1
      variants={item}
      className="max-w-4xl text-[clamp(1.9rem,7.2vw,3.9rem)] font-bold leading-[1.06] tracking-[-0.035em]"
      style={{ fontFamily: "var(--font-display)", color: INK }}
    >
      {marked(children)}
    </motion.h1>
  );
}

/* Big enough that he reads it rather than skims past it. */
function Statement({ children }: { children: ReactNode }) {
  return (
    <motion.p
      variants={item}
      className="max-w-3xl text-[clamp(1.05rem,4.2vw,1.7rem)] font-medium leading-[1.38] tracking-[-0.015em]"
      style={{ color: INK_MUTED }}
    >
      {typeof children === "string" ? marked(children) : children}
    </motion.p>
  );
}

function Section({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      id={id}
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className={`mx-auto w-full max-w-6xl px-5 md:px-10 ${className}`}
    >
      {children}
    </motion.section>
  );
}

/* ------------------------------------------------------------------ tiers */

type Tier = {
  id: string;
  code: string;
  name: string;
  price: string;
  deposit: string;
  weeks: string;
  /* Months of revenue at the $10k MRR the deck is aimed at. Arithmetic, so it
     can be checked: price / 10000. */
  repay: string;
  /* plain = the floor, gold = the middle, best = the full build */
  tone: "plain" | "gold" | "best";
  badge?: string;
  inherits?: string;
  gets: string[];
  out: string;
};

const TIERS: Tier[] = [
  {
    id: "test",
    code: "Option A",
    name: "MVP",
    price: "$3,500",
    deposit: "$1,750 + $1,750",
    weeks: "2-3 weeks",
    repay: "0.4",
    tone: "plain",
    gets: [
      "iOS only, iPhone",
      "The quiz, up to 12 questions",
      "One AI plan per user, saved to the account",
      "Apple in-app purchase, one subscription",
      "Sign in with Apple",
      "Three screens: the quiz, the plan, and the paywall",
      "App Store submission",
      "One round of revisions",
    ],
    out: "No Android, no web checkout, no reminders, no progress, no rewards.",
  },
  {
    id: "business",
    code: "Option B",
    name: "The whole app",
    price: "$8,000",
    deposit: "$4,000 + $4,000",
    weeks: "3-4 weeks",
    repay: "0.8",
    tone: "gold",
    badge: "Recommended",
    inherits: "Everything in A, plus",
    gets: [
      "Android as well as iOS",
      "Web checkout with Stripe - no Apple commission",
      "Reward system: streaks, milestones, badges",
      "Push reminders and win-backs",
      "Progress screens: volume, pain score, lifts over time",
      "Workout logging with history",
      "Exercise player with video, built dynamically from each plan",
      "Meta pixel and server-side events",
      "Admin dashboard",
      "Two rounds of revisions",
    ],
    out: "Plans are the model's words, not yours. No coach to ask.",
  },
  {
    id: "full",
    code: "Option C",
    name: "The whole app",
    price: "$12,000",
    deposit: "$6,000 + $6,000",
    weeks: "5-6 weeks",
    repay: "1.2",
    tone: "best",
    badge: "Everything",
    inherits: "Everything in B, plus",
    gets: [
      "RAG over your own programming - plans in your language",
      "AI coach chat that knows the plan and the history",
      "Content CMS, so you update the method yourself",
      "Automated tests across the plan pipeline and checkout",
      "Performance and AI-cost optimisation pass",
      "A/B testing built into the funnel",
      "Three rounds of revisions",
    ],
    out: "Costs a little more per user per month to run - retrieval and chat are real API calls.",
  },
];

function TierCard({ tier }: { tier: Tier }) {
  const gold = tier.tone !== "plain";
  const best = tier.tone === "best";

  return (
    <motion.div
      variants={pop}
      custom={best ? 1.5 : -1.5}
      className={`flex flex-col rounded-2xl px-5 py-5 md:px-6 md:py-6 ${
        gold ? "gold-frame" : ""
      } ${best ? "glow-gold" : ""}`}
      style={{
        background: best
          ? "rgba(240,182,86,0.09)"
          : gold
            ? "rgba(240,182,86,0.055)"
            : "rgba(236,232,212,0.03)",
        border: gold ? undefined : "1px solid rgba(236,232,212,0.08)",
      }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p
          className="text-[10.5px] uppercase"
          style={{
            fontFamily: MONO,
            letterSpacing: "0.16em",
            color: gold ? GOLD : INK_MUTED,
          }}
        >
          {tier.code}
        </p>
        {tier.badge && (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase"
            style={{
              fontFamily: MONO,
              letterSpacing: "0.12em",
              color: best ? "#0a0a0a" : GOLD,
              background: best
                ? "linear-gradient(100deg,#f0b656,#d87928)"
                : "rgba(240,182,86,0.14)",
              border: best ? "none" : "1px solid rgba(240,182,86,0.4)",
            }}
          >
            {tier.badge}
          </span>
        )}
      </div>

      <p
        className="mt-2 text-[17px] font-bold leading-tight tracking-[-0.02em] md:text-[20px]"
        style={{ fontFamily: "var(--font-display)", color: INK }}
      >
        {tier.name}
      </p>

      <p
        className={`mt-3 font-bold leading-[0.9] tracking-[-0.04em] ${
          gold ? "text-gradient" : ""
        }`}
        style={{
          fontFamily: "var(--font-display)",
          fontSize: best
            ? "clamp(3rem,11vw,4.4rem)"
            : "clamp(2.5rem,9vw,3.6rem)",
          color: gold ? undefined : INK,
        }}
      >
        {tier.price}
      </p>

      <p
        className="mt-2 text-[12px]"
        style={{ fontFamily: MONO, color: INK_MUTED }}
      >
        {tier.deposit} · {tier.weeks}
      </p>

      {/* The value line: what it costs measured in the revenue it is aimed at. */}
      <p
        className="mt-3 rounded-lg px-3 py-2 text-[12px]"
        style={{
          fontFamily: MONO,
          background: "rgba(236,232,212,0.03)",
          border: "1px solid rgba(236,232,212,0.07)",
          color: INK_MUTED,
        }}
      >
        <span style={{ color: GOLD, fontWeight: 700 }}>
          {tier.repay} months
        </span>{" "}
        of $10k MRR to repay
      </p>

      {tier.inherits && (
        <p
          className="mt-5 text-[10.5px] uppercase"
          style={{ fontFamily: MONO, letterSpacing: "0.14em", color: GOLD }}
        >
          {tier.inherits}
        </p>
      )}

      <ul className={`flex flex-col gap-2 ${tier.inherits ? "mt-3" : "mt-5"}`}>
        {tier.gets.map((g) => (
          <li key={g} className="flex gap-2.5">
            <Check
              size={14}
              className="mt-[3px] shrink-0"
              style={{ color: gold ? GOLD : "rgba(240,182,86,0.55)" }}
            />
            <span
              className="text-[12.5px] leading-snug md:text-[13.5px]"
              style={{ color: INK }}
            >
              {g}
            </span>
          </li>
        ))}
      </ul>

      <p
        className="mt-5 text-[12px] leading-relaxed"
        style={{ color: INK_MUTED }}
      >
        {tier.out}
      </p>

      <div className="flex-1" />

      <a
        href={CONTACT}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-5 inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-[14px] font-extrabold transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0b656] ${
          gold
            ? "bg-gradient-to-r from-[#f0b656] to-[#d87928] text-[#0a0a0a]"
            : ""
        }`}
        style={
          gold
            ? undefined
            : { color: GOLD, border: "1px solid rgba(240,182,86,0.4)" }
        }
      >
        Take {tier.code.replace("Option ", "")}
      </a>
    </motion.div>
  );
}

/* The handful of things that do not change between the options, kept as one
   line rather than a section of its own. */
const CONSTANTS = [
  "Source code yours on final payment",
  "Store submission handled",
  "Money-back guarantee, unchanged",
  "Ad spend and ~$100/mo running costs are yours",
];

/* ------------------------------------------------------------------- page */

export default function PlansDeck() {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    let stored = false;
    try {
      stored = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      stored = false;
    }
    setOpen(stored);
  }, []);

  const unlock = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode - the page still opens for this view */
    }
    setOpen(true);
  }, []);

  if (open === null)
    return <div className="fixed inset-0 z-[200] bg-background" />;

  if (!open)
    return (
      <MotionConfig reducedMotion="user">
        <div
          lang="en"
          className="fixed inset-0 z-[200] overflow-y-auto bg-background"
        >
          <Gate onUnlock={unlock} />
        </div>
      </MotionConfig>
    );

  return (
    <MotionConfig reducedMotion="user">
      <div
        lang="en"
        className="fixed inset-0 z-[200] overflow-y-auto overflow-x-hidden bg-background"
      >
        <header className="hero-radial grain relative">
          <div
            aria-hidden
            className="hero-grid pointer-events-none absolute inset-0"
          />
          <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-2 pt-8 md:px-10 md:pt-12">
            <a
              href="/luka/daniel"
              className="inline-flex items-center gap-1.5 rounded-sm text-[11px] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0b656]"
              style={{
                fontFamily: MONO,
                letterSpacing: "0.14em",
                color: INK_MUTED,
              }}
            >
              <ArrowLeft size={13} />
              Back to the deck
            </a>
          </div>

          {/* The letter holds the screen on its own. Prices are deliberately
            below the fold, so the reasoning is read before the number. */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="relative z-10 mx-auto flex min-h-[86svh] w-full max-w-6xl flex-col justify-center gap-6 px-5 pb-16 pt-6 md:gap-8 md:px-10"
          >
            <Head>
              Daniel, here is a new offer - I put myself in [[your shoes]]
              first.
            </Head>

            <Statement>
              I know you didn&apos;t plan for a budget this size. The reality is
              that mobile builds just cost more than most people expect—it’s
              simply the massive volume of work involved
            </Statement>

            <Statement>
              What I can promise is that [[I am good at this]]. You are not
              paying me to learn on your project.
            </Statement>

            <Statement>
              And if I had 180,000 people already following me for this exact
              problem, I would not build the cheap version and hope. I would
              build the one that keeps them.
            </Statement>

            <motion.p
              variants={item}
              className="mt-2 flex items-center gap-2 text-[11px] uppercase"
              style={{
                fontFamily: MONO,
                letterSpacing: "0.16em",
                color: INK_MUTED,
              }}
            >
              <ChevronDown size={14} style={{ color: GOLD }} />
              Three options below
            </motion.p>
          </motion.div>
        </header>

        <Section id="options" className="pb-10">
          <motion.p
            variants={item}
            className="mb-6 max-w-2xl text-[13px] leading-relaxed md:text-[14.5px]"
            style={{ color: INK_MUTED }}
          >
            Same foundation under all three, so going up later means paying the
            difference, not the whole thing again.
          </motion.p>
          <motion.div
            variants={item}
            className="grid gap-4 lg:grid-cols-3 lg:items-stretch lg:gap-5"
          >
            {TIERS.map((t) => (
              <TierCard key={t.id} tier={t} />
            ))}
          </motion.div>

          {/* The one place on the page that is opinion rather than spec, and
            it is signed so it reads as one. */}
          <motion.figure
            variants={item}
            className="mt-8 max-w-2xl rounded-xl py-4 pl-5 pr-5"
            style={{
              background: "rgba(240,182,86,0.05)",
              borderLeft: `2px solid ${GOLD}`,
            }}
          >
            <blockquote
              className="text-[13.5px] leading-relaxed md:text-[15px]"
              style={{ color: INK }}
            >
              Look, I don&apos;t want to waste your time. You&apos;ve got the
              audience already - getting them into the app and keeping them
              there is my part, and it&apos;s the part I&apos;m good at. Going
              small doesn&apos;t remove the risk, it just moves it to month
              three when nobody opens the app. I&apos;d rather we do it properly
              once.
            </blockquote>
            <figcaption
              className="mt-3 text-[11px] uppercase"
              style={{
                fontFamily: MONO,
                letterSpacing: "0.14em",
                color: INK_MUTED,
              }}
            >
              - Luka
            </figcaption>
          </motion.figure>

          <motion.ul
            variants={item}
            className="mt-8 flex flex-wrap gap-x-5 gap-y-2"
          >
            {CONSTANTS.map((c) => (
              <li
                key={c}
                className="flex items-center gap-2 text-[12px]"
                style={{ color: INK_MUTED }}
              >
                <span
                  aria-hidden
                  className="h-1 w-1 shrink-0 rounded-full"
                  style={{ background: GRID }}
                />
                {c}
              </li>
            ))}
          </motion.ul>
        </Section>

        <div className="h-8" />
      </div>
    </MotionConfig>
  );
}
