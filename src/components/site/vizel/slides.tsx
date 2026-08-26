"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Minus,
  Rocket,
  Bell,
  RefreshCw,
  Flame,
  Share2,
} from "lucide-react";
import {
  Count,
  GOLD,
  Headline,
  INK,
  INK_MUTED,
  MONO,
  Metric,
  SERIES_A,
  Slide,
  Sub,
  Visual,
  item,
  pop,
  reveal,
  useAssets,
} from "./primitives";
import {
  CoachScreen,
  HomeScreen,
  LogScreen,
  PaywallScreen,
  PhoneFrame,
  ProgressScreen,
  QuizScreen,
  ResultsScreen,
} from "./PhoneFrame";
import {
  CohortRevenue,
  CommissionBars,
  RecoveryToStrength,
  RetentionCurve,
  UnitEconomics,
} from "./charts";
import { FlowMap, PlanPipeline, RagDiagram, Timeline } from "./diagrams";

/* Text on the left, a phone on the right - used wherever the argument is
   about a screen the user will actually see. */
function Split({
  children,
  phone,
  phoneClass = "max-w-[9rem] sm:max-w-[10.5rem] md:max-w-[13rem]",
}: {
  children: React.ReactNode;
  phone: React.ReactNode;
  phoneClass?: string;
}) {
  return (
    <motion.div
      variants={item}
      className="mt-6 grid items-center gap-6 md:mt-8 md:grid-cols-[1fr_auto] md:gap-10"
    >
      <div className="order-2 md:order-1">{children}</div>
      <div className={`order-1 mx-auto w-full md:order-2 ${phoneClass}`}>
        {phone}
      </div>
    </motion.div>
  );
}

function Bullets({ rows }: { rows: [string, string][] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map(([k, v]) => (
        <li key={k} className="flex gap-3">
          <span
            aria-hidden
            className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: GOLD }}
          />
          <span>
            <span
              className="text-[13.5px] font-semibold md:text-[15px]"
              style={{ color: INK }}
            >
              {k}
            </span>{" "}
            <span
              className="text-[13px] md:text-[14.5px]"
              style={{ color: INK_MUTED }}
            >
              {v}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Tile({
  icon: Icon,
  title,
  body,
  gold = false,
}: {
  icon?: React.ElementType;
  title: string;
  body: string;
  gold?: boolean;
}) {
  return (
    <div
      className="rounded-xl px-4 py-3.5"
      style={{
        background: gold ? "rgba(240,182,86,0.07)" : "rgba(236,232,212,0.035)",
        border: `1px solid ${gold ? "rgba(240,182,86,0.35)" : "rgba(236,232,212,0.08)"}`,
      }}
    >
      {Icon && <Icon size={16} style={{ color: GOLD }} />}
      <p
        className="mt-2 text-[13.5px] font-semibold md:text-[15px]"
        style={{ color: INK }}
      >
        {title}
      </p>
      <p
        className="mt-1.5 text-[12.5px] leading-relaxed md:text-[13.5px]"
        style={{ color: INK_MUTED }}
      >
        {body}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------------ */

const ACT_1 = "Act I · The opportunity";
const ACT_2 = "Act II · The machine";
const ACT_3 = "Act III · The proof";
const ACT_4 = "Act IV · The terms";

function Cover() {
  return (
    <Slide id="cover" act="Prepared for Daniel Vizel" label="Dr.Brace × Skeylo">
      <Headline size="lg">Dr.Brace, [[on the App Store]].</Headline>
      <Sub>
        An AI training app for people training around an injury - and the funnel
        that turns the audience you already have into monthly revenue.
      </Sub>
      <Split
        phone={
          <PhoneFrame>
            <HomeScreen />
          </PhoneFrame>
        }
      >
        <div className="grid grid-cols-3 gap-4">
          <Metric value="3–4" label="Weeks to build" />
          <Metric value="2" label="App stores" />
          <Metric value="0%" label="Store commission" color={GOLD} />
        </div>
        <p
          className="mt-5 max-w-md text-[13px] leading-relaxed md:text-sm"
          style={{ color: INK_MUTED }}
        >
          Every number here is arithmetic you can check. The price is near the
          end.
        </p>
      </Split>
    </Slide>
  );
}

/* The positioning slide. Everything downstream - the quiz, the plan, the
   retrieval layer - only makes sense once this one has landed. */
function Wedge() {
  return (
    <Slide id="wedge" act={ACT_1} label="Who it's for">
      <Headline>Every training app assumes [[nothing hurts]].</Headline>
      <Sub>
        Yours is for the people they quietly fail: the bad shoulder, the bad
        back, the bad knee - who still want to lift.
      </Sub>
      <Visual>
        <RecoveryToStrength />
      </Visual>
      <motion.p
        variants={item}
        className="mt-4 max-w-3xl text-[12.5px] leading-relaxed md:text-sm"
        style={{ color: INK_MUTED }}
      >
        <span style={{ color: INK, fontWeight: 600 }}>Why this wins:</span> a
        healthy person picks any app. Someone with a rotator cuff problem has
        almost nothing. You already own that audience.
      </motion.p>
    </Slide>
  );
}

const PRICES = [
  { price: 14.99, subs: 668, note: "Easiest yes, most to keep" },
  { price: 19.99, subs: 501, note: "Where most fitness apps land" },
  { price: 29.99, subs: 334, note: "Premium, fewer to serve" },
];

function TheNumber() {
  return (
    <Slide id="mrr" act={ACT_1} label="What $10k actually is">
      <Headline>
        $10,000 a month is [[a subscriber count]], not a wish.
      </Headline>
      <Sub>
        Pick a price and the rest is arithmetic. Here it is at three settings.
      </Sub>
      <Visual className="grid gap-3 sm:grid-cols-3">
        {PRICES.map((p, i) => (
          <div
            key={p.price}
            className="rounded-xl px-4 py-4"
            style={{
              background:
                i === 1 ? "rgba(240,182,86,0.07)" : "rgba(236,232,212,0.035)",
              border: `1px solid ${i === 1 ? "rgba(240,182,86,0.35)" : "rgba(236,232,212,0.08)"}`,
            }}
          >
            <p
              className="text-[12px]"
              style={{ fontFamily: MONO, color: INK_MUTED }}
            >
              ${p.price.toFixed(2)} / month
            </p>
            <p
              className="mt-2 text-[clamp(1.9rem,6vw,3rem)] font-bold leading-none tracking-[-0.03em]"
              style={{
                fontFamily: "var(--font-display)",
                color: i === 1 ? GOLD : INK,
              }}
            >
              <Count to={p.subs} delay={0.2 + i * 0.12} />
            </p>
            <p
              className="mt-1.5 text-[12px] uppercase"
              style={{
                fontFamily: MONO,
                letterSpacing: "0.1em",
                color: INK_MUTED,
              }}
            >
              active members
            </p>
            <p
              className="mt-3 text-[12.5px] leading-snug"
              style={{ color: INK_MUTED }}
            >
              {p.note}
            </p>
          </div>
        ))}
      </Visual>
      <motion.p
        variants={item}
        className="mt-4 text-[12.5px] md:text-sm"
        style={{ fontFamily: MONO, color: INK_MUTED }}
      >
        Five hundred people. You reach more than that in a single story.
      </motion.p>
    </Slide>
  );
}

function Churn() {
  return (
    <Slide id="churn" act={ACT_1} label="The tax nobody mentions">
      <Headline>Standing still [[costs 40 sales a month]].</Headline>
      <Sub>
        Holding 500 members at 8% monthly churn means replacing forty before you
        grow by one. Half this build is about people staying.
      </Sub>
      <Visual>
        <RetentionCurve />
      </Visual>
    </Slide>
  );
}

function Compounding() {
  return (
    <Slide id="compounding" act={ACT_1} label="Why an app, not a PDF">
      <Headline>The same 100 customers, [[twice the money]].</Headline>
      <Sub>
        A $99 program earns $9,900, once. The same hundred people at $19.99 a
        month pass it in month six - and keep going.
      </Sub>
      <Visual>
        <CohortRevenue />
      </Visual>
    </Slide>
  );
}

function Flow() {
  return (
    <Slide id="flow" act={ACT_2} label="The whole machine">
      <Headline>Nine steps. [[Three lanes]]. One screen.</Headline>
      <Sub>From a story link to a plan that rebuilds itself every week.</Sub>
      <Visual>
        <FlowMap />
      </Visual>
    </Slide>
  );
}

function Commission() {
  return (
    <Slide id="commission" act={ACT_2} label="Web2app, in dollars">
      <Headline>Selling on the web [[keeps $2,560 a month]].</Headline>
      <Sub>
        Apple and Google charge for the checkout. Stripe charges far less. At
        $10,000 MRR that gap is $30,720 a year.
      </Sub>
      <Visual>
        <CommissionBars />
      </Visual>
      <motion.p
        variants={item}
        className="mt-4 text-[13px] md:text-sm"
        style={{ color: INK }}
      >
        <span style={{ color: GOLD, fontFamily: MONO }}>≈ 5 months.</span>{" "}
        <span style={{ color: INK_MUTED }}>
          The saved commission alone repays this entire build. Everything after
          is yours.
        </span>
      </motion.p>
    </Slide>
  );
}

function Quiz() {
  return (
    <Slide id="quiz" act={ACT_2} label="The quiz">
      <Headline>The quiz [[does two jobs]] at once.</Headline>
      <Sub>
        Ninety seconds that make him commit before he pays - and produce the
        input the plan builder needs.
      </Sub>
      <Split
        phone={
          <PhoneFrame>
            <QuizScreen />
          </PhoneFrame>
        }
      >
        <Bullets
          rows={[
            ["Where it hurts", "- picks the recovery segment."],
            [
              "How bad it is",
              "- sets the starting load and how fast it climbs.",
            ],
            ["Whether a pro has seen it", "- decides what we won't touch."],
            ["What he wants back", "- pain-free, strong, or both."],
            ["Equipment", "- filters every exercise he can't do."],
            ["Days per week", "- picks the split, not just the count."],
          ]}
        />
        <p
          className="mt-4 text-[12.5px] leading-relaxed md:text-[13.5px]"
          style={{ color: INK_MUTED }}
        >
          If an answer doesn&apos;t change the plan, it doesn&apos;t get asked.
        </p>
      </Split>
    </Slide>
  );
}

function Results() {
  return (
    <Slide id="results" act={ACT_2} label="The results page">
      <Headline>Show him [[his own plan]] before he pays.</Headline>
      <Sub>
        It names his injury, his recovery work, his strength split and his first
        two sessions. Then it locks the rest.
      </Sub>
      <Split
        phone={
          <PhoneFrame>
            <ResultsScreen />
          </PhoneFrame>
        }
      >
        <Bullets
          rows={[
            ["He isn't buying a promise", "- it's already on his screen."],
            ["It names his problem back to him", "- harder than any headline."],
            [
              "The lock is the offer",
              "- two sessions visible, ten weeks behind it.",
            ],
            ["Built in seconds", "- the plan exists before the payment does."],
            [
              "Every result is different",
              "- which is why it beats a sales page.",
            ],
          ]}
        />
      </Split>
    </Slide>
  );
}

function Checkout() {
  return (
    <Slide id="checkout" act={ACT_2} label="Payment">
      <Headline>Charged by [[Dr.Brace LLC]]. Not by Apple.</Headline>
      <Sub>
        Stripe subscriptions on the web, in your company&apos;s name - with your
        customer list and your billing relationship.
      </Sub>
      <Split
        phone={
          <PhoneFrame>
            <PaywallScreen />
          </PhoneFrame>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Tile
            title="7-day trial, card upfront"
            body="Two to three times more starts, more cancellations at day seven. Better for cold traffic and a big audience - which yours is."
            gold
          />
          <Tile
            title="Charge immediately"
            body="Fewer starts, higher intent, cash on day one. 200 people who meant it, not 500 who were curious."
          />
        </div>
        <p
          className="mt-4 text-[12.5px] leading-relaxed md:text-[13.5px]"
          style={{ color: INK_MUTED }}
        >
          Both are built. Switching is a setting, not a rebuild.
        </p>
      </Split>
    </Slide>
  );
}

const SCREENS = [
  { node: <HomeScreen />, label: "Today" },
  { node: <LogScreen />, label: "Logging" },
  { node: <ProgressScreen />, label: "Progress" },
  { node: <CoachScreen />, label: "Coach" },
];

function TheApp() {
  return (
    <Slide id="app" act={ACT_2} label="The app">
      <Headline>Four screens, [[done properly]].</Headline>
      <Sub>
        Today&apos;s session, logging, progress, and a coach he can ask.
        Everything else costs retention and earns nothing.
      </Sub>
      <Visual className="mx-auto grid w-full max-w-[20rem] grid-cols-2 gap-3 sm:max-w-3xl sm:grid-cols-4 sm:gap-5">
        {SCREENS.map((s, i) => (
          <motion.div key={s.label} variants={pop} custom={i % 2 ? 1.5 : -1.5}>
            <PhoneFrame label={s.label}>{s.node}</PhoneFrame>
          </motion.div>
        ))}
      </Visual>
    </Slide>
  );
}

function Pipeline() {
  return (
    <Slide id="pipeline" act={ACT_2} label="How the plan is built">
      <Headline>Not a chatbot. [[A constrained generator]].</Headline>
      <Sub>
        What sits between the model and the screen is what keeps a man with a
        disc problem off a 200kg deadlift.
      </Sub>
      <Visual>
        <PlanPipeline />
      </Visual>
    </Slide>
  );
}

function Rag() {
  return (
    <Slide id="rag" act={ACT_2} label="Why it sounds like you">
      <Headline>Anyone can wrap GPT. [[Nobody else has your method]].</Headline>
      <Sub>
        Retrieval over your own programming, substitutions and language - so the
        plan reads like you wrote it.
      </Sub>
      <Visual>
        <RagDiagram />
      </Visual>
    </Slide>
  );
}

const RETENTION = [
  {
    icon: Flame,
    title: "A streak worth protecting",
    body: "On the home screen from day one. The cheapest retention mechanic ever built, and still the best.",
  },
  {
    icon: RefreshCw,
    title: "The plan rebuilds itself",
    body: "Every week, from the sets and pain scores he logged. Less pain earns more load - he feels the plan reacting.",
  },
  {
    icon: Bell,
    title: "One push, at his hour",
    body: "Sent at the hour he usually trains, not at nine with everyone else.",
  },
  {
    icon: Share2,
    title: "A month-three report he'll post",
    body: "Pain down, load up, formatted for a story. Retention and acquisition from one screen.",
  },
];

function Retention() {
  return (
    <Slide id="retention" act={ACT_2} label="Keeping them">
      <Headline>Retention is [[built]], not hoped for.</Headline>
      <Sub>
        8% churn instead of 5% costs about $12,900 a year on 500 members. These
        four close the gap.
      </Sub>
      <Visual className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {RETENTION.map((r) => (
          <Tile key={r.title} icon={r.icon} title={r.title} body={r.body} />
        ))}
      </Visual>
    </Slide>
  );
}

function Economics() {
  return (
    <Slide id="economics" act={ACT_2} label="What it costs to run">
      <Headline>Running it costs [[about $100 a month]].</Headline>
      <Sub>At 500 members. Every line is a real invoice at a real tier.</Sub>
      <Visual>
        <UnitEconomics />
      </Visual>
    </Slide>
  );
}

/* --- Benchmarks -----------------------------------------------------------
   Screenshots are read off disk by the page and handed down, so dropping files
   into public/people/luka/fitify/ is the whole workflow. */
const BENCHMARKS: [string, string, string][] = [
  [
    "Fitify",
    "What it proved",
    "A clean library and a plan you never have to think about. It scaled on premium - people pay monthly for structure alone.",
  ],
  [
    "Fitonomy",
    "What it proved",
    "Streaks, challenges, before-and-after. Ugly in places, but it keeps people paying past month three.",
  ],
  [
    "Neither one",
    "What's still missing",
    "Both assume a body that works. Nobody built it for the shoulder that gives out on rep four - the exact person following you.",
  ],
];

function Benchmarks() {
  const { fitifyShots } = useAssets();
  const slots = fitifyShots.length ? fitifyShots : [null, null];

  return (
    <Slide id="benchmarks" act={ACT_3} label="The benchmarks">
      <Headline>Two apps already [[proved people pay]].</Headline>
      <Sub>
        A proven category with an obvious hole in it. These are the two we
        borrow from.
      </Sub>
      <Visual className="grid items-start gap-5 md:grid-cols-[auto_1fr] md:gap-8">
        <div
          className="mx-auto grid w-full max-w-[16rem] gap-2"
          style={{
            gridTemplateColumns: `repeat(${Math.min(slots.length, 2)}, minmax(0, 1fr))`,
          }}
        >
          {slots.map((src, i) =>
            src ? (
              <div
                key={src}
                className="relative overflow-hidden rounded-lg"
                style={{
                  aspectRatio: "9 / 19.5",
                  border: "1px solid rgba(236,232,212,0.14)",
                }}
              >
                <Image
                  src={src}
                  alt={`Fitify screenshot ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 40vw, 130px"
                  className="object-cover object-top"
                />
              </div>
            ) : (
              <div
                key={i}
                className="flex items-center justify-center rounded-lg px-2 text-center"
                style={{
                  aspectRatio: "9 / 19.5",
                  border: "1px dashed rgba(236,232,212,0.2)",
                  background: "rgba(236,232,212,0.02)",
                }}
              >
                <span
                  className="text-[9px] leading-relaxed"
                  style={{ fontFamily: MONO, color: INK_MUTED }}
                >
                  drop into
                  <br />
                  /public/people/
                  <br />
                  luka/fitify/
                </span>
              </div>
            ),
          )}
          <p
            className="col-span-full text-center text-[10px] uppercase"
            style={{
              fontFamily: MONO,
              letterSpacing: "0.14em",
              color: INK_MUTED,
            }}
          >
            Fitify
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {BENCHMARKS.map(([name, kicker, body], i) => (
            <div
              key={name}
              className="rounded-xl px-4 py-3"
              style={{
                background:
                  i === 2 ? "rgba(240,182,86,0.07)" : "rgba(236,232,212,0.035)",
                border: `1px solid ${i === 2 ? "rgba(240,182,86,0.35)" : "rgba(236,232,212,0.08)"}`,
              }}
            >
              <p className="flex items-baseline gap-2">
                <span
                  className="text-[15px] font-bold md:text-[17px]"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: i === 2 ? GOLD : INK,
                  }}
                >
                  {name}
                </span>
                <span
                  className="text-[10px] uppercase"
                  style={{
                    fontFamily: MONO,
                    letterSpacing: "0.12em",
                    color: INK_MUTED,
                  }}
                >
                  {kicker}
                </span>
              </p>
              <p
                className="mt-1.5 text-[12.5px] leading-relaxed md:text-[13.5px]"
                style={{ color: INK_MUTED }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </Visual>
    </Slide>
  );
}

function Proof() {
  return (
    <Slide id="proof" act={ACT_3} label="Already shipped">
      <Headline>
        This isn&apos;t a mockup. [[It&apos;s already in the store]].
      </Headline>
      <Sub>
        MenoLisa - quiz, AI plan, native delivery. Built and shipped by me, live
        on the App Store.
      </Sub>
      <Split
        phoneClass="max-w-[11rem] sm:max-w-[13rem] md:max-w-[15rem]"
        phone={
          <div
            className="overflow-hidden rounded-xl"
            style={{ border: "1px solid rgba(236,232,212,0.14)" }}
          >
            <Image
              src="/people/luka/menolisa.webp"
              alt="MenoLisa's App Store listing, showing version 1.0.7 published by Macura Solutions"
              width={922}
              height={1937}
              className="h-auto w-full"
            />
          </div>
        }
      >
        <Bullets
          rows={[
            ["Same flow", "- quiz, AI-built plan, delivered in-app."],
            ["Same stack", "- Expo, Supabase, validated generation."],
            [
              "Through review, twice",
              "- approved, and shipping updates since.",
            ],
            ["Built by me", "- not a case study I read about."],
          ]}
        />
        <p
          className="mt-4 text-[12.5px] leading-relaxed md:text-[13.5px]"
          style={{ color: INK_MUTED }}
        >
          Different sport. The machine underneath is the one you&apos;re buying.
        </p>
      </Split>
    </Slide>
  );
}

const TEAM = [
  {
    name: "Luka Macura",
    role: "Builds and ships it",
    body: "The funnel, the app, Stripe, both store submissions. One contact, one person accountable.",
  },
  {
    name: "A second developer",
    role: "On call - infrastructure",
    body: "Pulled in for the Supabase schema and the parts that must survive a bad gym connection.",
  },
  {
    name: "A RAG specialist",
    role: "On call - the plan builder",
    body: "Consulted on the retrieval layer and the validation around it.",
  },
];

function Team() {
  return (
    <Slide id="team" act={ACT_3} label="Who builds it">
      <Headline>[[One builder]], two specialists behind him.</Headline>
      <Sub>
        I build and ship it. Two people are on call for the parts worth a second
        opinion. You deal with me either way.
      </Sub>
      <Visual className="grid gap-3 md:grid-cols-3">
        {TEAM.map((t, i) => (
          <div
            key={t.name}
            className="rounded-xl px-4 py-4"
            style={{
              background:
                i === 0 ? "rgba(240,182,86,0.07)" : "rgba(236,232,212,0.035)",
              border: `1px solid ${i === 0 ? "rgba(240,182,86,0.35)" : "rgba(236,232,212,0.08)"}`,
            }}
          >
            <p
              className="text-[11px] uppercase"
              style={{ fontFamily: MONO, letterSpacing: "0.14em", color: GOLD }}
            >
              {t.role}
            </p>
            <p
              className="mt-1.5 text-[17px] font-bold md:text-[19px]"
              style={{ fontFamily: "var(--font-display)", color: INK }}
            >
              {t.name}
            </p>
            <p
              className="mt-2 text-[13px] leading-relaxed md:text-[14px]"
              style={{ color: INK_MUTED }}
            >
              {t.body}
            </p>
          </div>
        ))}
      </Visual>
    </Slide>
  );
}

const STACK: [string, string][] = [
  [
    "Next.js - the funnel",
    "Instagram traffic is impatient and on mobile data. The quiz has to render instantly - that is where conversion is won.",
  ],
  [
    "Expo / React Native - the app",
    "One codebase, both stores, and updates that ship without a review queue.",
  ],
  [
    "Supabase - auth, data, storage",
    "Postgres you own. If you ever move, the database goes with you.",
  ],
  [
    "Stripe - subscriptions",
    "Billed by Dr.Brace LLC. You keep the customer and the payout schedule.",
  ],
  [
    "LLM layer - plan generation",
    "Schema-validated output - a bad response is rejected before anyone sees it.",
  ],
];

function Stack() {
  return (
    <Slide id="stack" act={ACT_3} label="The stack">
      <Headline>The stack, and [[why each piece is there]].</Headline>
      <Sub>Five choices, each with a reason you can push back on.</Sub>
      <Visual className="flex flex-col gap-2">
        {STACK.map(([k, v], i) => (
          <div
            key={k}
            className="grid gap-1 rounded-lg px-3.5 py-3 md:grid-cols-[minmax(0,270px)_1fr] md:items-baseline md:gap-6"
            style={{
              background: "rgba(236,232,212,0.035)",
              border: "1px solid rgba(236,232,212,0.07)",
            }}
          >
            <span
              className="text-[13.5px] font-semibold md:text-[15px]"
              style={{ color: i === 3 ? GOLD : INK }}
            >
              {k}
            </span>
            <span
              className="text-[12.5px] leading-relaxed md:text-[13.5px]"
              style={{ color: INK_MUTED }}
            >
              {v}
            </span>
          </div>
        ))}
      </Visual>
    </Slide>
  );
}

function Delivery() {
  return (
    <Slide id="timeline" act={ACT_4} label="The schedule">
      <Headline>[[Three to four weeks]] of building. Then review.</Headline>
      <Sub>
        Every week ends with something on your phone, never a status update.
        After week four it is in Apple&apos;s hands.
      </Sub>
      <Visual>
        <Timeline />
      </Visual>
    </Slide>
  );
}

const YOURS = [
  "The brand, the face and the voice",
  "Instagram traffic - the channel this runs on",
  "Dr.Brace LLC and its Stripe account",
  "Apple and Google accounts, in your name",
  "Your rehab protocols and coaching material",
];

const MINE = [
  "Landing page, quiz and results page",
  "iOS and Android app, both stores",
  "Stripe subscriptions, trials, webhooks",
  "Plan builder, retrieval layer, validation",
  "Store assets, submission, review replies",
  "A Loom walkthrough every week of the build",
  "Thirty days of fixes after launch",
];

function Responsibilities() {
  return (
    <Slide id="split" act={ACT_4} label="Who does what">
      <Headline>What you bring, [[what I ship]].</Headline>
      <Sub>
        You stay the coach. I stay the engineering department. Nothing on the
        right needs your time.
      </Sub>
      <Visual className="grid gap-3 md:grid-cols-2">
        {[
          { title: "Daniel", rows: YOURS, gold: false },
          { title: "Skeylo", rows: MINE, gold: true },
        ].map((col) => (
          <div
            key={col.title}
            className="rounded-xl px-4 py-4"
            style={{
              background: col.gold
                ? "rgba(240,182,86,0.07)"
                : "rgba(236,232,212,0.035)",
              border: `1px solid ${col.gold ? "rgba(240,182,86,0.35)" : "rgba(236,232,212,0.08)"}`,
            }}
          >
            <p
              className="text-[11px] uppercase"
              style={{ fontFamily: MONO, letterSpacing: "0.14em", color: GOLD }}
            >
              {col.title}
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {col.rows.map((r) => (
                <li
                  key={r}
                  className="flex gap-2.5 text-[12.5px] leading-snug md:text-[13.5px]"
                  style={{ color: INK }}
                >
                  <Check
                    size={14}
                    className="mt-[2px] shrink-0"
                    style={{ color: GOLD }}
                  />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Visual>
    </Slide>
  );
}

const NOT_INCLUDED: [string, string][] = [
  ["Ad spend", "Yours, straight to Meta."],
  ["Filming and content", "You already do it better than any agency."],
  ["Running costs", "~$100 a month, on your own accounts."],
];

const ALTERNATIVES: [string, string][] = [
  ["An app agency", "$40k–$60k, six months, funnel quoted separately."],
  ["Hiring a developer", "$70k a year before you know if they can ship."],
  [
    "No-code builders",
    "Fine until you need native push, an AI layer, and store approval.",
  ],
];

function Value() {
  return (
    <Slide id="value" act={ACT_4} label="What it's worth">
      <Headline>
        What&apos;s in, what&apos;s out, and [[what it replaces]].
      </Headline>
      <Visual className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p
            className="text-[11px] uppercase"
            style={{
              fontFamily: MONO,
              letterSpacing: "0.14em",
              color: INK_MUTED,
            }}
          >
            Not included - on purpose
          </p>
          {NOT_INCLUDED.map(([k, v]) => (
            <div
              key={k}
              className="flex gap-2.5 rounded-lg px-3 py-2.5"
              style={{
                background: "rgba(236,232,212,0.03)",
                border: "1px solid rgba(236,232,212,0.07)",
              }}
            >
              <Minus
                size={14}
                className="mt-[3px] shrink-0"
                style={{ color: INK_MUTED }}
              />
              <span>
                <span
                  className="text-[13px] font-semibold md:text-[14px]"
                  style={{ color: INK }}
                >
                  {k}
                </span>{" "}
                <span
                  className="text-[12.5px] md:text-[13.5px]"
                  style={{ color: INK_MUTED }}
                >
                  {v}
                </span>
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <p
            className="text-[11px] uppercase"
            style={{
              fontFamily: MONO,
              letterSpacing: "0.14em",
              color: INK_MUTED,
            }}
          >
            What this is instead of
          </p>
          {ALTERNATIVES.map(([k, v]) => (
            <div
              key={k}
              className="flex gap-2.5 rounded-lg px-3 py-2.5"
              style={{
                background: "rgba(236,232,212,0.03)",
                border: "1px solid rgba(236,232,212,0.07)",
              }}
            >
              <X
                size={14}
                className="mt-[3px] shrink-0"
                style={{ color: INK_MUTED }}
              />
              <span>
                <span
                  className="text-[13px] font-semibold md:text-[14px]"
                  style={{ color: INK }}
                >
                  {k}
                </span>{" "}
                <span
                  className="text-[12.5px] md:text-[13.5px]"
                  style={{ color: INK_MUTED }}
                >
                  {v}
                </span>
              </span>
            </div>
          ))}
        </div>
      </Visual>
      <motion.div variants={item} className="mt-4 grid gap-4 sm:grid-cols-3">
        <Metric
          value={<Count to={1.2} decimals={1} suffix=" mo" />}
          label="To repay at $10k MRR"
          color={GOLD}
        />
        <Metric
          value={<Count to={120} prefix="$" suffix="k" />}
          label="Year one at goal"
          color={GOLD}
        />
        <Metric
          value={<Count to={30720} prefix="$" />}
          label="Commission kept per year"
          color={SERIES_A}
        />
      </motion.div>
    </Slide>
  );
}

/* The one number the whole deck has been walking toward. */
const CONTACT =
  "mailto:office@skeylo.com?subject=The%20app%20-%20let%27s%20start";

function Price() {
  return (
    <Slide id="price" act={ACT_4} label="The offer">
      <motion.div variants={item} className="flex flex-col items-start">
        <p
          className="text-[12px] uppercase"
          style={{
            fontFamily: MONO,
            letterSpacing: "0.16em",
            color: INK_MUTED,
          }}
        >
          Everything in this deck, fixed price
        </p>
        <motion.p
          className="mt-2 font-bold leading-[0.85] tracking-[-0.04em] text-gradient"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(4rem,20vw,11rem)",
          }}
          variants={reveal}
        >
          $12,000
        </motion.p>
      </motion.div>

      <Visual className="grid gap-3 sm:grid-cols-2">
        {[
          ["$6,000", "50% to start", "Week one begins the day it clears."],
          [
            "$6,000",
            "50% at launch",
            "Paid when the app is live and taking payments, not when submitted.",
          ],
        ].map(([amt, when, what], i) => (
          <div
            key={when}
            className="rounded-xl px-4 py-3.5"
            style={{
              background:
                i === 1 ? "rgba(240,182,86,0.07)" : "rgba(236,232,212,0.035)",
              border: `1px solid ${i === 1 ? "rgba(240,182,86,0.35)" : "rgba(236,232,212,0.08)"}`,
            }}
          >
            <p
              className="text-[11px] uppercase"
              style={{ fontFamily: MONO, letterSpacing: "0.12em", color: GOLD }}
            >
              {when}
            </p>
            <p
              className="mt-1.5 text-[26px] font-bold leading-none md:text-[30px]"
              style={{ fontFamily: "var(--font-display)", color: INK }}
            >
              {amt}
            </p>
            <p
              className="mt-2 text-[12.5px] leading-snug"
              style={{ color: INK_MUTED }}
            >
              {what}
            </p>
          </div>
        ))}
      </Visual>

      <motion.p
        variants={item}
        className="mt-5 max-w-2xl rounded-lg px-4 py-3 text-[12.5px] leading-relaxed md:text-[13.5px]"
        style={{
          background: "rgba(236,232,212,0.03)",
          border: "1px solid rgba(236,232,212,0.08)",
          color: INK_MUTED,
        }}
      >
        <span style={{ color: INK, fontWeight: 600 }}>On DanForce:</span> that
        project and its deposit stay exactly where they are. Paused, not dropped
        - I finish it the moment you say go. Separate build, separate budget.
      </motion.p>
    </Slide>
  );
}

/* --- Optional: the retainer ---------------------------------------------- */
const RETAINER = [
  [
    "Numbers, read weekly",
    "Where people drop out, where they cancel, which price is winning.",
  ],
  [
    "Funnel optimisation",
    "Landing copy, quiz order, results, paywall - tested on your real traffic.",
  ],
  [
    "Ad creatives and angles",
    "New hooks and cuts, for the audience that's converting.",
  ],
  [
    "Everything else that moves the number",
    "Pricing, retention pushes, new offers. Whatever the data says next.",
  ],
];

function Retainer() {
  return (
    <Slide id="retainer" act={ACT_4} label="Optional, after launch">
      <Headline>After launch, [[if you want it]].</Headline>
      <Sub>
        The build is finished when it&apos;s live. Growing it afterwards is a
        separate, optional job.
      </Sub>
      <Visual className="grid items-start gap-4 md:grid-cols-[minmax(0,260px)_1fr] md:gap-8">
        <div
          className="gold-frame rounded-xl px-5 py-5"
          style={{ background: "rgba(240,182,86,0.06)" }}
        >
          <p
            className="text-[11px] uppercase"
            style={{
              fontFamily: MONO,
              letterSpacing: "0.14em",
              color: INK_MUTED,
            }}
          >
            Optional retainer
          </p>
          <p
            className="mt-1.5 font-bold leading-none tracking-[-0.03em] text-gradient"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem,9vw,3.6rem)",
            }}
          >
            $600
          </p>
          <p
            className="mt-1 text-[13px]"
            style={{ fontFamily: MONO, color: INK_MUTED }}
          >
            per month · cancel anytime
          </p>
          <p
            className="mt-4 text-[12.5px] leading-relaxed"
            style={{ color: INK_MUTED }}
          >
            Starts only when you ask. At $10,000 MRR it&apos;s 6% of revenue to
            push the other 94% up.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {RETAINER.map(([k, v]) => (
            <Tile key={k} title={k} body={v} />
          ))}
        </div>
      </Visual>
    </Slide>
  );
}

/* --- The guarantee, and the button --------------------------------------- */
function Guarantee() {
  return (
    <Slide id="guarantee" act={ACT_4} label="The guarantee">
      <Headline>If it isn&apos;t good, [[you get your money back]].</Headline>
      <Sub>Exactly what it covers, and exactly what it doesn&apos;t.</Sub>
      <Visual className="grid gap-3 md:grid-cols-2">
        <div
          className="gold-frame rounded-xl px-5 py-4"
          style={{ background: "rgba(240,182,86,0.06)" }}
        >
          <p
            className="text-[11px] uppercase"
            style={{ fontFamily: MONO, letterSpacing: "0.14em", color: GOLD }}
          >
            What it covers
          </p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {[
              "The app doesn't do what this deck says it does.",
              "It's broken, slow, or unusable in a way I can't fix.",
              "It never gets through store review because of how it was built.",
            ].map((r) => (
              <li
                key={r}
                className="flex gap-2.5 text-[13px] leading-snug md:text-[14px]"
                style={{ color: INK }}
              >
                <Check
                  size={15}
                  className="mt-[2px] shrink-0"
                  style={{ color: GOLD }}
                />
                {r}
              </li>
            ))}
          </ul>
          <p
            className="mt-4 text-[12.5px] leading-relaxed"
            style={{ color: INK_MUTED }}
          >
            A concrete reason from that list and you get 100% back. I would
            rather refund you than argue with you.
          </p>
        </div>
        <div
          className="rounded-xl px-5 py-4"
          style={{
            background: "rgba(236,232,212,0.03)",
            border: "1px solid rgba(236,232,212,0.08)",
          }}
        >
          <p
            className="text-[11px] uppercase"
            style={{
              fontFamily: MONO,
              letterSpacing: "0.14em",
              color: INK_MUTED,
            }}
          >
            What it doesn&apos;t
          </p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {[
              "Changing your mind, or losing interest halfway through.",
              "Deciding not to launch, or not to send traffic to it.",
              "The app working as specified and simply not selling - that depends on the offer and the audience, which are yours.",
            ].map((r) => (
              <li
                key={r}
                className="flex gap-2.5 text-[13px] leading-snug md:text-[14px]"
                style={{ color: INK_MUTED }}
              >
                <X
                  size={15}
                  className="mt-[2px] shrink-0"
                  style={{ color: INK_MUTED }}
                />
                {r}
              </li>
            ))}
          </ul>
          <p
            className="mt-4 text-[12.5px] leading-relaxed"
            style={{ color: INK_MUTED }}
          >
            It protects you from bad work. It isn&apos;t a free option on your
            own decision.
          </p>
        </div>
      </Visual>

      <motion.div
        variants={item}
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <a
          href={CONTACT}
          className="group inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#f0b656] to-[#d87928] px-6 py-3.5 text-[15px] font-extrabold text-[#0a0a0a] shadow-lg shadow-[#f0b656]/20 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0b656]"
        >
          <Rocket size={17} />
          Start the build
        </a>
        <p
          className="text-[12.5px] leading-relaxed md:text-[13.5px]"
          style={{ color: INK_MUTED }}
        >
          Week one starts the day the deposit clears.
        </p>
      </motion.div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */

export const SLIDES: {
  id: string;
  act: string;
  label: string;
  Component: () => React.JSX.Element;
}[] = [
  { id: "cover", act: "Intro", label: "Cover", Component: Cover },
  { id: "wedge", act: ACT_1, label: "Who it's for", Component: Wedge },
  { id: "mrr", act: ACT_1, label: "The number", Component: TheNumber },
  { id: "churn", act: ACT_1, label: "Churn", Component: Churn },
  {
    id: "compounding",
    act: ACT_1,
    label: "Compounding",
    Component: Compounding,
  },
  { id: "flow", act: ACT_2, label: "The machine", Component: Flow },
  { id: "commission", act: ACT_2, label: "Commission", Component: Commission },
  { id: "quiz", act: ACT_2, label: "Quiz", Component: Quiz },
  { id: "results", act: ACT_2, label: "Results", Component: Results },
  { id: "checkout", act: ACT_2, label: "Payment", Component: Checkout },
  { id: "app", act: ACT_2, label: "The app", Component: TheApp },
  { id: "pipeline", act: ACT_2, label: "Plan builder", Component: Pipeline },
  { id: "rag", act: ACT_2, label: "Your method", Component: Rag },
  { id: "retention", act: ACT_2, label: "Retention", Component: Retention },
  { id: "economics", act: ACT_2, label: "Running costs", Component: Economics },
  { id: "benchmarks", act: ACT_3, label: "Benchmarks", Component: Benchmarks },
  { id: "proof", act: ACT_3, label: "Proof", Component: Proof },
  { id: "team", act: ACT_3, label: "Team", Component: Team },
  { id: "stack", act: ACT_3, label: "Stack", Component: Stack },
  { id: "timeline", act: ACT_4, label: "Timeline", Component: Delivery },
  {
    id: "split",
    act: ACT_4,
    label: "Who does what",
    Component: Responsibilities,
  },
  { id: "value", act: ACT_4, label: "What it replaces", Component: Value },
  { id: "price", act: ACT_4, label: "The offer", Component: Price },
  {
    id: "retainer",
    act: ACT_4,
    label: "Optional retainer",
    Component: Retainer,
  },
  { id: "guarantee", act: ACT_4, label: "The guarantee", Component: Guarantee },
];

export const LAST_SLIDE = SLIDES[SLIDES.length - 1].id;
export { CONTACT };
