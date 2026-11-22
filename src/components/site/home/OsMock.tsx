"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  Instagram,
  Phone,
  Search,
  TrendingUp,
} from "lucide-react";
import {
  DOCS,
  INVOICES,
  LEADS,
  MODULES,
  MONTHS,
  STAGES,
  TASKS,
  rsd,
  type Invoice,
  type Lead,
  type ModuleId,
  type Task,
} from "./osData";

/*
 * Interaktivni primer operativnog sistema na početnoj. Moduli se klikću, a
 * stanje je zajedničko: upit koji pomeriš menja broj na bedžu, čekiran zadatak
 * menja "Otvoreni zadaci" na pregledu, mesec u finansijama bira se klikom na
 * stubić. Sve su izmišljeni primeri ("Tvoja firma"), ne podaci klijenta.
 */

const ease = [0.22, 1, 0.36, 1] as const;
const CURRENT = MONTHS.length - 1;

const panel = "rounded-xl bg-white/[0.03] ring-1 ring-inset ring-white/[0.06]";
const press =
  "cursor-pointer transition-[background-color,transform] duration-150 hover:bg-white/[0.06] active:scale-[0.985]";

/* ------------------------------------------------------------------ helpers */

/** Broj koji se pretače iz stare vrednosti u novu (i od nule kad uđe u ekran). */
function Num({
  value,
  format = rsd,
}: {
  value: number;
  format?: (v: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const reduce = useReducedMotion();
  const current = useRef(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      current.current = value;
      setShown(value);
      return;
    }
    const c = animate(current.current, value, {
      duration: 0.7,
      ease,
      onUpdate: (v) => {
        current.current = v;
        setShown(v);
      },
    });
    return () => c.stop();
  }, [inView, reduce, value]);

  return <span ref={ref}>{format(shown)}</span>;
}

function Head({
  kicker,
  title,
  right,
}: {
  kicker: React.ReactNode;
  title: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">
          {kicker}
        </p>
        <div className="font-display text-lg font-bold leading-tight sm:text-xl">
          {title}
        </div>
      </div>
      {right}
    </div>
  );
}

function Live() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#7fd49a]/10 px-2.5 py-1 text-[11px] font-semibold text-[#8fe0a8]">
      <span className="relative flex size-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#8fe0a8] motion-reduce:animate-none" />
        <span className="relative size-1.5 rounded-full bg-[#8fe0a8]" />
      </span>
      uživo
    </span>
  );
}

const SRC_ICON = { Sajt: Globe, Instagram, Telefon: Phone } as const;

const STAGE_TONE = [
  "bg-accent/15 text-accent",
  "bg-[#7cb4ff]/15 text-[#9cc6ff]",
  "bg-primary/15 text-[#f09a52]",
  "bg-[#7fd49a]/15 text-[#8fe0a8]",
];

/* ------------------------------------------------------------------- views */

const TODAY: {
  t: string;
  what: string;
  who: string;
  tag: string;
  tone: string;
  to: ModuleId;
}[] = [
  {
    t: "09:30",
    what: "Novi upit sa sajta",
    who: "Marko P.",
    tag: "Novo",
    tone: STAGE_TONE[0],
    to: "upiti",
  },
  {
    t: "11:00",
    what: "Ponuda poslata",
    who: "Kafe Centar",
    tag: "Ponuda",
    tone: STAGE_TONE[2],
    to: "upiti",
  },
  {
    t: "14:00",
    what: "Faktura #214 plaćena",
    who: "Petrović d.o.o.",
    tag: "Plaćeno",
    tone: STAGE_TONE[3],
    to: "fakture",
  },
  {
    t: "16:30",
    what: "Naručiti materijal",
    who: "Nikola · rok sutra",
    tag: "Zadatak",
    tone: STAGE_TONE[1],
    to: "zadaci",
  },
];

function PregledView({
  tasks,
  go,
  pickMonth,
}: {
  tasks: Task[];
  go: (m: ModuleId) => void;
  pickMonth: (i: number) => void;
}) {
  const open = tasks.filter((t) => !t.done);
  const today = open.filter((t) => t.due === "danas").length;
  const max = Math.max(...MONTHS.map((m) => m.rev));

  return (
    <div className="flex flex-col gap-3">
      <Head
        kicker={MONTHS[CURRENT].name}
        title="Pregled firme"
        right={<Live />}
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        <button
          type="button"
          onClick={() => go("finansije")}
          className={`${panel} ${press} col-span-2 min-w-0 p-3 text-left sm:col-span-1 sm:p-4`}
        >
          <p className="text-[10px] font-semibold text-muted-foreground sm:text-xs">
            Prihod
          </p>
          <p className="mt-1 truncate font-display text-lg font-extrabold leading-none tabular-nums sm:text-2xl">
            <Num value={MONTHS[CURRENT].rev} />
            <span className="ms-1 text-[10px] font-semibold text-muted-foreground sm:text-xs">
              RSD
            </span>
          </p>
          <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#8fe0a8] sm:text-[11px]">
            <TrendingUp className="size-3" />
            +12%
          </p>
        </button>
        <button
          type="button"
          onClick={() => go("upiti")}
          className={`${panel} ${press} min-w-0 p-3 text-left sm:p-4`}
        >
          <p className="text-[10px] font-semibold text-muted-foreground sm:text-xs">
            Novi upiti
          </p>
          <p className="mt-1 font-display text-lg font-extrabold leading-none tabular-nums sm:text-2xl">
            <Num value={18} />
          </p>
          <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#8fe0a8] sm:text-[11px]">
            <TrendingUp className="size-3" />
            +5 danas
          </p>
        </button>
        <button
          type="button"
          onClick={() => go("zadaci")}
          className={`${panel} ${press} min-w-0 p-3 text-left sm:p-4`}
        >
          <p className="text-[10px] font-semibold text-muted-foreground sm:text-xs">
            Otvoreni zadaci
          </p>
          <p className="mt-1 font-display text-lg font-extrabold leading-none tabular-nums sm:text-2xl">
            <Num value={open.length} />
          </p>
          <p className="mt-1.5 text-[10px] text-muted-foreground sm:text-[11px]">
            {today} za danas
          </p>
        </button>
      </div>

      <div className="grid gap-2 sm:gap-3 lg:grid-cols-[1.15fr_1fr]">
        <div className={`${panel} flex flex-col p-3 sm:p-4`}>
          <p className="text-[11px] font-semibold text-muted-foreground sm:text-xs">
            Prihod po mesecima
          </p>
          <div className="mt-3 flex h-24 items-end gap-1 sm:h-28 sm:gap-1.5 lg:h-auto lg:flex-1">
            {MONTHS.map((m, i) => (
              <button
                key={m.short}
                type="button"
                aria-label={`${m.name}: ${rsd(m.rev)} RSD`}
                onClick={() => pickMonth(i)}
                className="group flex h-full flex-1 cursor-pointer flex-col items-center justify-end gap-1"
              >
                <motion.span
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.1 + i * 0.035, duration: 0.55, ease }}
                  style={{ height: `${(m.rev / max) * 100}%` }}
                  className={`block w-full origin-bottom rounded-t-[3px] transition-colors ${
                    i === CURRENT
                      ? "bg-gradient-to-t from-primary to-accent"
                      : "bg-white/[0.12] group-hover:bg-white/25"
                  }`}
                />
                <span className="text-[9px] uppercase text-muted-foreground/70">
                  {m.short[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className={`${panel} p-1.5 sm:p-2`}>
          <p className="px-1.5 pt-1.5 text-[11px] font-semibold text-muted-foreground sm:px-2 sm:pt-2 sm:text-xs">
            Danas
          </p>
          <ul className="mt-1">
            {TODAY.map((x) => (
              <li key={x.what}>
                <button
                  type="button"
                  onClick={() => go(x.to)}
                  className={`${press} flex w-full items-center gap-3 rounded-lg px-1.5 py-2 text-left sm:px-2`}
                >
                  <span className="w-9 shrink-0 text-[11px] font-semibold tabular-nums text-muted-foreground">
                    {x.t}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold leading-tight">
                      {x.what}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {x.who}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${x.tone}`}
                  >
                    {x.tag}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function UpitiView({
  leads,
  advance,
}: {
  leads: Lead[];
  advance: (id: number) => void;
}) {
  const counts = STAGES.map(
    (_, s) => leads.filter((l) => l.stage === s).length,
  );

  return (
    <div className="flex flex-col gap-3">
      <Head kicker="18 ovog meseca · sajt, Instagram, telefon" title="Upiti" />

      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {STAGES.map((s, i) => (
          <div key={s} className={`${panel} min-w-0 px-2 py-2 sm:px-3`}>
            <p className="truncate text-[10px] font-semibold text-muted-foreground sm:text-[11px]">
              {s}
            </p>
            <p className="font-display text-base font-extrabold leading-tight tabular-nums sm:text-lg">
              {counts[i]}
            </p>
            <span
              aria-hidden
              className={`mt-1.5 block h-1 rounded-full ${STAGE_TONE[i].split(" ")[0]}`}
            />
          </div>
        ))}
      </div>

      <ul className={`${panel} divide-y divide-white/[0.06] p-1.5 sm:p-2`}>
        {leads.map((l) => {
          const Icon = SRC_ICON[l.src];
          return (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => advance(l.id)}
                className={`${press} flex w-full items-center gap-3 rounded-lg px-1.5 py-2 text-left sm:px-2`}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/[0.06] text-[11px] font-bold">
                  {l.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold leading-tight">
                    {l.name}
                  </span>
                  <span className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                    <Icon className="size-3 shrink-0" />
                    {l.ask} · {l.when}
                  </span>
                </span>
                <motion.span
                  key={l.stage}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    bounce: 0.3,
                    visualDuration: 0.25,
                  }}
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${STAGE_TONE[l.stage]}`}
                >
                  {STAGES[l.stage]}
                </motion.span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ZadaciView({
  tasks,
  toggle,
}: {
  tasks: Task[];
  toggle: (id: number) => void;
}) {
  const done = tasks.filter((t) => t.done).length;

  return (
    <div className="flex flex-col gap-3">
      <Head
        kicker={`${done} od ${tasks.length} gotovo`}
        title="Zadaci"
        right={
          <span className="text-[11px] font-semibold tabular-nums text-muted-foreground sm:text-xs">
            {Math.round((done / tasks.length) * 100)}%
          </span>
        }
      />
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={false}
          animate={{ width: `${(done / tasks.length) * 100}%` }}
          transition={{ type: "spring", bounce: 0, visualDuration: 0.35 }}
        />
      </div>

      <ul className={`${panel} divide-y divide-white/[0.06] p-1.5 sm:p-2`}>
        {tasks.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              role="checkbox"
              aria-checked={t.done}
              onClick={() => toggle(t.id)}
              className={`${press} flex w-full items-center gap-3 rounded-lg px-1.5 py-2.5 text-left sm:px-2`}
            >
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full ring-1 ring-inset transition-colors ${
                  t.done
                    ? "bg-gradient-to-br from-accent to-primary ring-transparent"
                    : "ring-white/25"
                }`}
              >
                <AnimatePresence initial={false}>
                  {t.done && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{
                        type: "spring",
                        bounce: 0.4,
                        visualDuration: 0.22,
                      }}
                    >
                      <Check
                        className="size-3 text-primary-foreground"
                        strokeWidth={3.5}
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span
                className={`min-w-0 flex-1 truncate text-[13px] font-semibold transition-colors ${
                  t.done
                    ? "text-muted-foreground line-through decoration-white/30"
                    : ""
                }`}
              >
                {t.title}
              </span>
              <span
                className={`shrink-0 text-[10px] font-semibold ${
                  !t.done && t.due === "danas"
                    ? "text-accent"
                    : "text-muted-foreground"
                }`}
              >
                {t.due}
              </span>
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/[0.07] text-[9px] font-bold">
                {t.who}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const INV_TONE: Record<Invoice["state"], [string, string]> = {
  paid: ["Plaćeno", "bg-[#7fd49a]/15 text-[#8fe0a8]"],
  wait: ["Čeka", "bg-white/[0.08] text-muted-foreground"],
  late: ["Kasni", "bg-[#ff8a7a]/15 text-[#ff9d8f]"],
};

function FaktureView({
  invoices,
  togglePaid,
  remind,
}: {
  invoices: Invoice[];
  togglePaid: (no: string) => void;
  remind: (no: string) => void;
}) {
  const sum = (s: Invoice["state"]) =>
    invoices.filter((i) => i.state === s).reduce((a, i) => a + i.amount, 0);

  return (
    <div className="flex flex-col gap-3">
      <Head kicker={MONTHS[CURRENT].name} title="Fakture" />

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {(
          [
            ["Naplaćeno", sum("paid"), "text-[#8fe0a8]"],
            ["Čeka", sum("wait"), "text-foreground"],
            ["Kasni", sum("late"), "text-[#ff9d8f]"],
          ] as const
        ).map(([label, v, tone]) => (
          <div key={label} className={`${panel} min-w-0 px-2.5 py-2 sm:px-3`}>
            <p className="text-[10px] font-semibold text-muted-foreground sm:text-[11px]">
              {label}
            </p>
            <p
              className={`truncate font-display text-[15px] font-extrabold tabular-nums sm:text-lg ${tone}`}
            >
              <Num value={v} />
            </p>
          </div>
        ))}
      </div>

      <ul className={`${panel} divide-y divide-white/[0.06] p-1.5 sm:p-2`}>
        {invoices.map((inv) => {
          const [label, tone] = INV_TONE[inv.state];
          const row = (
            <>
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.05]">
                <FileText className="size-4 text-muted-foreground" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold leading-tight">
                  {inv.who}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {inv.no} · {inv.state === "paid" ? "plaćeno" : inv.due}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[12px] font-bold tabular-nums sm:text-[13px]">
                  {rsd(inv.amount)}
                </span>
                <span
                  className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${tone}`}
                >
                  {label}
                </span>
              </span>
            </>
          );

          return (
            <li key={inv.no}>
              {inv.state === "late" ? (
                <div className="flex items-center gap-3 rounded-lg px-1.5 py-2 sm:px-2">
                  {row}
                  <button
                    type="button"
                    onClick={() => remind(inv.no)}
                    disabled={inv.reminded}
                    aria-label={
                      inv.reminded
                        ? `Podsetnik poslat: ${inv.who}`
                        : `Pošalji podsetnik: ${inv.who}`
                    }
                    className={`grid size-8 shrink-0 place-items-center rounded-lg transition-colors ${
                      inv.reminded
                        ? "bg-[#7fd49a]/15 text-[#8fe0a8]"
                        : "cursor-pointer bg-primary text-primary-foreground hover:bg-accent active:scale-95"
                    }`}
                  >
                    {inv.reminded ? (
                      <Check className="size-4" />
                    ) : (
                      <Bell className="size-4" />
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => togglePaid(inv.no)}
                  className={`${press} flex w-full items-center gap-3 rounded-lg px-1.5 py-2 text-left sm:px-2`}
                >
                  {row}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FinansijeView({
  month,
  setMonth,
}: {
  month: number;
  setMonth: (i: number) => void;
}) {
  const m = MONTHS[month];
  const profit = m.rev - m.cost;
  const max = Math.max(...MONTHS.map((x) => x.rev));
  const arrow =
    "grid size-8 place-items-center rounded-lg bg-white/[0.05] transition-colors enabled:cursor-pointer enabled:hover:bg-white/10 disabled:opacity-30";

  return (
    <div className="flex flex-col gap-3">
      <Head
        kicker="Finansije"
        title={m.name}
        right={
          <span className="flex shrink-0 gap-1">
            <button
              type="button"
              aria-label="Prethodni mesec"
              disabled={month === 0}
              onClick={() => setMonth(month - 1)}
              className={arrow}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Sledeći mesec"
              disabled={month === CURRENT}
              onClick={() => setMonth(month + 1)}
              className={arrow}
            >
              <ChevronRight className="size-4" />
            </button>
          </span>
        }
      />

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {(
          [
            ["Prihod", m.rev, "text-foreground"],
            ["Troškovi", m.cost, "text-[#ff9d8f]"],
            ["Zarada", profit, "text-accent"],
          ] as const
        ).map(([label, v, tone]) => (
          <div
            key={label}
            className={`${panel} min-w-0 px-2.5 py-2 sm:px-3 sm:py-3`}
          >
            <p className="text-[10px] font-semibold text-muted-foreground sm:text-[11px]">
              {label}
            </p>
            <p
              className={`truncate font-display text-[15px] font-extrabold tabular-nums sm:text-xl ${tone}`}
            >
              <Num value={v} />
            </p>
          </div>
        ))}
      </div>

      <div className={`${panel} p-3 sm:p-4`}>
        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground sm:text-xs">
          <span>Poslednjih 12 meseci</span>
          <span className="tabular-nums text-foreground">
            marža {Math.round((profit / m.rev) * 100)}%
          </span>
        </div>
        <div className="mt-3 flex h-32 items-end gap-1 sm:h-36 sm:gap-1.5 md:h-60">
          {MONTHS.map((x, i) => {
            const on = i === month;
            return (
              <button
                key={x.short}
                type="button"
                aria-label={x.name}
                aria-pressed={on}
                onClick={() => setMonth(i)}
                className="group flex h-full flex-1 cursor-pointer flex-col items-center justify-end gap-1"
              >
                <span
                  style={{ height: `${(x.rev / max) * 100}%` }}
                  className="flex w-full flex-col overflow-hidden rounded-t-[3px]"
                >
                  <span
                    className={`block flex-1 transition-colors ${
                      on
                        ? "bg-gradient-to-t from-primary to-accent"
                        : "bg-white/[0.16] group-hover:bg-white/30"
                    }`}
                  />
                  <span
                    style={{ height: `${(x.cost / x.rev) * 100}%` }}
                    className={`block ${on ? "bg-[#ff8a7a]/55" : "bg-white/[0.07]"}`}
                  />
                </span>
                <span
                  className={`text-[9px] uppercase ${
                    on
                      ? "font-bold text-foreground"
                      : "text-muted-foreground/70"
                  }`}
                >
                  {x.short[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BazaView({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (q: string) => void;
}) {
  const q = query.trim().toLowerCase();
  const hits = DOCS.filter(
    (d) =>
      !q ||
      d.title.toLowerCase().includes(q) ||
      d.tag.toLowerCase().includes(q),
  );

  return (
    <div className="flex flex-col gap-3">
      <Head kicker={`${DOCS.length} dokumenata`} title="Baza znanja" />

      <label className={`${panel} flex items-center gap-2 px-3 py-2`}>
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pretraži"
          aria-label="Pretraži bazu znanja"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/70 sm:text-sm"
        />
      </label>

      <ul className={`${panel} divide-y divide-white/[0.06] p-1.5 sm:p-2`}>
        {hits.map((d) => (
          <li
            key={d.title}
            className="flex items-center gap-3 rounded-lg px-1.5 py-2 sm:px-2"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.05]">
              <FileText className="size-4 text-accent" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold leading-tight">
                {d.title}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                izmenjeno {d.when}
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {d.tag}
            </span>
          </li>
        ))}
        {hits.length === 0 && (
          <li className="px-2 py-6 text-center text-[13px] text-muted-foreground">
            Nema rezultata za „{query.trim()}”
          </li>
        )}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------- shell */

export default function OsMock() {
  const [mod, setMod] = useState<ModuleId>("pregled");
  const [leads, setLeads] = useState(LEADS);
  const [tasks, setTasks] = useState(TASKS);
  const [invoices, setInvoices] = useState(INVOICES);
  const [month, setMonth] = useState(CURRENT);
  const [query, setQuery] = useState("");
  const tabs = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [stageH, setStageH] = useState<number | "auto">("auto");

  // Visina pozornice prati trenutni modul (+ p-1 sa obe strane).
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStageH(el.offsetHeight + 8));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const newLeads = leads.filter((l) => l.stage === 0).length;
  const active = MODULES.find((m) => m.id === mod) ?? MODULES[0];

  // Na telefonu drži aktivni modul vidljivim u traci (bez skrola cele strane).
  useEffect(() => {
    const box = tabs.current;
    const el = box?.querySelector<HTMLElement>(`[data-mod="${mod}"]`);
    if (!box || !el) return;
    const left = el.offsetLeft - 12;
    const right = el.offsetLeft + el.offsetWidth + 12 - box.clientWidth;
    if (box.scrollLeft > left) box.scrollTo({ left, behavior: "smooth" });
    else if (box.scrollLeft < right)
      box.scrollTo({ left: right, behavior: "smooth" });
  }, [mod]);

  const views: Record<ModuleId, React.ReactNode> = {
    pregled: (
      <PregledView
        tasks={tasks}
        go={setMod}
        pickMonth={(i) => {
          setMonth(i);
          setMod("finansije");
        }}
      />
    ),
    upiti: (
      <UpitiView
        leads={leads}
        advance={(id) =>
          setLeads((ls) =>
            ls.map((l) =>
              l.id === id ? { ...l, stage: (l.stage + 1) % STAGES.length } : l,
            ),
          )
        }
      />
    ),
    zadaci: (
      <ZadaciView
        tasks={tasks}
        toggle={(id) =>
          setTasks((ts) =>
            ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
          )
        }
      />
    ),
    fakture: (
      <FaktureView
        invoices={invoices}
        togglePaid={(no) =>
          setInvoices((xs) =>
            xs.map((x) =>
              x.no === no
                ? { ...x, state: x.state === "paid" ? "wait" : "paid" }
                : x,
            ),
          )
        }
        remind={(no) =>
          setInvoices((xs) =>
            xs.map((x) => (x.no === no ? { ...x, reminded: true } : x)),
          )
        }
      />
    ),
    finansije: <FinansijeView month={month} setMonth={setMonth} />,
    baza: <BazaView query={query} setQuery={setQuery} />,
  };

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[3rem] opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(55% 50% at 50% 40%, rgba(216,121,40,0.28), transparent 72%)",
        }}
      />

      <div className="overflow-hidden rounded-2xl bg-[#0c0b09] ring-1 ring-white/12 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] sm:rounded-3xl">
        {/* Naslovna traka prozora */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span aria-hidden className="flex gap-1.5">
            <i className="size-2.5 rounded-full bg-white/15" />
            <i className="size-2.5 rounded-full bg-white/15" />
            <i className="size-2.5 rounded-full bg-white/15" />
          </span>
          <span className="mx-auto truncate rounded-md bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-muted-foreground sm:text-xs">
            Tvoja firma · {active.name}
          </span>
          <span aria-hidden className="w-[42px]" />
        </div>

        <div className="grid md:grid-cols-[200px_1fr]">
          {/* Moduli: bočni meni na većim ekranima */}
          <nav
            aria-label="Moduli"
            className="hidden border-r border-border p-3 md:block"
          >
            <ul className="space-y-0.5">
              {MODULES.map(({ id, name, Icon }) => {
                const on = id === mod;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      aria-current={on ? "page" : undefined}
                      onClick={() => setMod(id)}
                      className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors ${
                        on
                          ? "bg-primary/12 text-foreground ring-1 ring-inset ring-primary/25"
                          : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                      }`}
                    >
                      <Icon className={`size-4 ${on ? "text-primary" : ""}`} />
                      {name}
                      {id === "upiti" && newLeads > 0 ? (
                        <motion.span
                          key={newLeads}
                          initial={{ scale: 0.6 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            bounce: 0.4,
                            visualDuration: 0.25,
                          }}
                          className="ms-auto rounded-full bg-primary px-1.5 text-[10px] font-bold leading-4 text-primary-foreground"
                        >
                          {newLeads}
                        </motion.span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="min-w-0 p-3 sm:p-5">
            {/* Moduli kao trake na telefonu */}
            <div
              ref={tabs}
              className="relative -mx-3 mb-4 flex gap-1.5 overflow-x-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
            >
              {MODULES.map(({ id, name, Icon }) => {
                const on = id === mod;
                return (
                  <button
                    key={id}
                    type="button"
                    data-mod={id}
                    aria-current={on ? "page" : undefined}
                    onClick={() => setMod(id)}
                    className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                      on
                        ? "bg-primary/15 text-foreground ring-1 ring-inset ring-primary/30"
                        : "bg-white/[0.04] text-muted-foreground"
                    }`}
                  >
                    <Icon className={`size-3.5 ${on ? "text-primary" : ""}`} />
                    {name}
                    {id === "upiti" && newLeads > 0 ? (
                      <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold leading-4 text-primary-foreground">
                        {newLeads}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Od md naviše svi moduli imaju istu visinu (prozor stoji mirno);
                na telefonu se razlikuju, pa visina glatko prati sadržaj. */}
            <motion.div
              data-os-stage
              initial={false}
              animate={{ height: stageH }}
              transition={{ type: "spring", bounce: 0, visualDuration: 0.3 }}
              className="relative -m-1 overflow-hidden p-1"
            >
              <div ref={inner}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mod}
                    data-os-view
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease }}
                    className="md:min-h-[444px]"
                  >
                    {views[mod]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
