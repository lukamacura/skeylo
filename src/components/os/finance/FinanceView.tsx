"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Sheet from "@/components/os/Sheet";
import { Avatar } from "@/components/os/Shell";
import {
  AddButton,
  DeleteButton,
  Label,
  PageHeader,
  PrimaryButton,
  Segmented,
  inputCls,
  inputStyle,
  pageCls,
} from "@/components/os/fields";
import { ProjectPicker, projectLabel } from "@/components/os/scripts/pickers";
import { osBrowser } from "@/lib/os/supabase-browser";
import { addMonths, dueLabel, isoDay, monthLabel } from "@/lib/os/dates";
import { OS, STATE, rsd } from "@/lib/os/theme";
import type { Person, ProjectRef, Transaction } from "@/lib/os/types";

export type SplitRow = { person_id: string; share: number; payout: number };
type Draft = Pick<
  Transaction,
  "kind" | "amount" | "occurred_on" | "project_id" | "category" | "note"
>;

const sum = (xs: Transaction[], kind: Transaction["kind"]) =>
  xs.filter((t) => t.kind === kind).reduce((s, t) => s + Number(t.amount), 0);

export default function FinanceView({
  month,
  transactions,
  split,
  projects: initialProjects,
  team,
}: {
  month: string;
  transactions: Transaction[];
  split: SplitRow[];
  projects: ProjectRef[];
  team: Person[];
}) {
  const router = useRouter();
  const sb = osBrowser();
  const [projects, setProjects] = useState(initialProjects);
  const [sheet, setSheet] = useState<{ tx: Transaction | null } | null>(null);

  const inMonth = transactions.filter((t) => t.occurred_on.startsWith(month));
  const income = sum(inMonth, "income");
  const expense = sum(inMonth, "expense");
  const profit = income - expense;

  // Pogled monthly_split je izvor; dok ga nema za mesec, isto pravilo se računa ovde.
  const fixed = team.reduce((s, p) => s + Number(p.fixed_share ?? 0), 0);
  const equal =
    (100 - fixed) /
    Math.max(1, team.filter((p) => p.fixed_share == null).length);
  const shares = team.map((p) => {
    const row = split.find((r) => r.person_id === p.id);
    const share = row ? Number(row.share) : Number(p.fixed_share ?? equal);
    return {
      person: p,
      share,
      payout: row ? Number(row.payout) : Math.round((profit * share) / 100),
    };
  });

  const months = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const ym = addMonths(month, i - 5);
        const xs = transactions.filter((t) => t.occurred_on.startsWith(ym));
        return { ym, profit: sum(xs, "income") - sum(xs, "expense") };
      }),
    [month, transactions],
  );

  const categories = [
    ...new Set(transactions.map((t) => t.category).filter(Boolean)),
  ];

  async function save(d: Draft) {
    const tx = sheet?.tx;
    setSheet(null);
    if (tx) await sb.from("transactions").update(d).eq("id", tx.id);
    else await sb.from("transactions").insert(d);
    router.refresh();
  }
  async function remove() {
    const tx = sheet?.tx;
    setSheet(null);
    if (tx) await sb.from("transactions").delete().eq("id", tx.id);
    router.refresh();
  }

  return (
    <div className={pageCls}>
      <PageHeader
        title="Finansije"
        sub={
          <span className="inline-flex items-center gap-1">
            <MonthLink ym={addMonths(month, -1)} label="Prethodni mesec">
              <ChevronLeft className="size-4" />
            </MonthLink>
            <span
              className="min-w-[120px] text-center font-medium"
              style={{ color: OS.text }}
            >
              {monthLabel(month)}
            </span>
            <MonthLink ym={addMonths(month, 1)} label="Sledeći mesec">
              <ChevronRight className="size-4" />
            </MonthLink>
          </span>
        }
        action={
          <AddButton onClick={() => setSheet({ tx: null })}>
            <Plus className="size-4" />
            Unos
          </AddButton>
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-2.5 md:grid-cols-3">
        <Tile label="Prihod" value={income} color={STATE.ok} />
        <Tile label="Rashod" value={expense} color={STATE.late} />
        <div className="col-span-2 md:col-span-1">
          <Tile
            label="Profit"
            value={profit}
            color={profit > 0 ? STATE.ok : profit < 0 ? STATE.late : STATE.idle}
            trend={profit !== 0 ? (profit > 0 ? "up" : "down") : undefined}
            big
          />
        </div>
      </div>

      <section className="mt-8">
        <SectionTitle>Ko je koliko zaradio</SectionTitle>
        <ul
          className="mt-3 overflow-hidden rounded-2xl"
          style={{ background: OS.surface, border: `1px solid ${OS.line}` }}
        >
          {shares.map(({ person, share, payout }) => (
            <li
              key={person.id}
              className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
              style={{ borderColor: OS.line }}
            >
              <Avatar person={person} size={34} />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-medium">{person.name}</div>
                <div
                  className="mt-1.5 h-1 overflow-hidden rounded-full"
                  style={{ background: OS.surface2 }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${share}%`, background: person.color }}
                  />
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-[16px] font-semibold tabular-nums"
                  style={{ color: OS.text }}
                >
                  {rsd.format(payout)}
                </div>
                <div
                  className="text-[12px] tabular-nums"
                  style={{ color: OS.muted }}
                >
                  {Math.round(share * 100) / 100}%
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-2 px-1 text-[12px]" style={{ color: OS.faint }}>
          Profit meseca × procenat. Nina 15%, ostatak se deli na jednake delove.
        </p>
      </section>

      <section className="mt-8">
        <SectionTitle>Profit, poslednjih 6 meseci</SectionTitle>
        <ProfitChart months={months} current={month} />
      </section>

      <section className="mt-8">
        <SectionTitle>Unosi · {monthLabel(month)}</SectionTitle>
        {inMonth.length === 0 ? (
          <div
            className="mt-3 rounded-2xl px-4 py-8 text-center text-[14px]"
            style={{ color: OS.faint, border: `1px dashed ${OS.line}` }}
          >
            Nema unosa za ovaj mesec.
          </div>
        ) : (
          <ul
            className="mt-3 overflow-hidden rounded-2xl"
            style={{ background: OS.surface, border: `1px solid ${OS.line}` }}
          >
            {inMonth.map((t) => {
              const p = projects.find((x) => x.id === t.project_id);
              const inc = t.kind === "income";
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setSheet({ tx: t })}
                    className="flex w-full items-center gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-white/[0.025] active:bg-white/[0.05]"
                    style={{ borderColor: OS.line }}
                  >
                    <span
                      className="grid size-8 shrink-0 place-items-center rounded-full"
                      style={{
                        background: `${inc ? STATE.ok : STATE.late}1f`,
                        color: inc ? STATE.ok : STATE.late,
                      }}
                    >
                      {inc ? (
                        <TrendingUp className="size-4" />
                      ) : (
                        <TrendingDown className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px]">
                        {t.category || t.note || (inc ? "Prihod" : "Rashod")}
                      </span>
                      <span
                        className="block truncate text-[12px]"
                        style={{ color: OS.muted }}
                      >
                        {dueLabel(t.occurred_on)}
                        {p && ` · ${projectLabel(p)}`}
                        {t.category && t.note && ` · ${t.note}`}
                      </span>
                    </span>
                    <span
                      className="shrink-0 text-[15px] font-semibold tabular-nums"
                      style={{ color: OS.text }}
                    >
                      {inc ? "+" : "−"}
                      {rsd.format(Number(t.amount))}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <TxSheet
        open={!!sheet}
        tx={sheet?.tx ?? null}
        projects={projects}
        categories={categories}
        onProjectCreated={(p) => setProjects((ps) => [...ps, p])}
        onClose={() => setSheet(null)}
        onSave={save}
        onDelete={remove}
      />
    </div>
  );
}

function MonthLink({
  ym,
  label,
  children,
}: {
  ym: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/os/finansije?m=${ym}`}
      aria-label={label}
      className="grid size-8 place-items-center rounded-lg hover:bg-white/[0.05] active:scale-95"
      style={{ color: OS.muted }}
    >
      {children}
    </Link>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[13px] font-semibold uppercase"
      style={{
        fontFamily: "var(--font-sans)",
        letterSpacing: "0.06em",
        color: OS.muted,
      }}
    >
      {children}
    </h2>
  );
}

/* Brojka je u boji teksta; boja stanja ide na oznaku pored nje. */
function Tile({
  label,
  value,
  color,
  trend,
  big,
}: {
  label: string;
  value: number;
  color: string;
  trend?: "up" | "down";
  big?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: OS.surface, border: `1px solid ${OS.line}` }}
    >
      <div
        className="flex items-center gap-2 text-[13px] font-medium"
        style={{ color: OS.muted }}
      >
        <span className="size-2 rounded-full" style={{ background: color }} />
        {label}
        {trend &&
          (trend === "up" ? (
            <TrendingUp className="size-3.5" style={{ color }} />
          ) : (
            <TrendingDown className="size-3.5" style={{ color }} />
          ))}
      </div>
      <div
        className={`mt-1.5 font-semibold tabular-nums ${big ? "text-[30px]" : "text-[22px] md:text-[26px]"}`}
        style={{ letterSpacing: "-0.03em", color: OS.text }}
      >
        {rsd.format(value)}
      </div>
    </div>
  );
}

function ProfitChart({
  months,
  current,
}: {
  months: { ym: string; profit: number }[];
  current: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = 180;
  const PAD = { t: 16, b: 8 };
  const max = Math.max(1, ...months.map((m) => Math.abs(m.profit)));
  const hasNeg = months.some((m) => m.profit < 0);
  const zero = hasNeg ? PAD.t + (H - PAD.t - PAD.b) / 2 : H - PAD.b;
  const scale = (hasNeg ? (H - PAD.t - PAD.b) / 2 : H - PAD.t - PAD.b) / max;
  const slot = W / months.length;
  const bw = Math.min(56, slot * 0.55);
  const short = (ym: string) => monthLabel(ym).slice(0, 3);

  return (
    <div
      className="relative mt-3 rounded-2xl p-3"
      style={{ background: OS.surface, border: `1px solid ${OS.line}` }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        role="img"
        aria-label={months
          .map((m) => `${monthLabel(m.ym)}: ${rsd.format(m.profit)}`)
          .join(", ")}
      >
        <line
          x1={0}
          x2={W}
          y1={zero}
          y2={zero}
          stroke={OS.lineStrong}
          strokeWidth={1}
        />
        {months.map((m, i) => {
          const h = Math.max(
            m.profit === 0 ? 0 : 2,
            Math.abs(m.profit) * scale,
          );
          const x = i * slot + (slot - bw) / 2;
          const up = m.profit >= 0;
          const color =
            m.profit > 0 ? STATE.ok : m.profit < 0 ? STATE.late : STATE.idle;
          const r = Math.min(4, h);
          // Zaobljen samo kraj podatka; strana uz nultu liniju ostaje ravna.
          const d = up
            ? `M${x},${zero} V${zero - h + r} Q${x},${zero - h} ${x + r},${zero - h} H${x + bw - r} Q${x + bw},${zero - h} ${x + bw},${zero - h + r} V${zero} Z`
            : `M${x},${zero} V${zero + h - r} Q${x},${zero + h} ${x + r},${zero + h} H${x + bw - r} Q${x + bw},${zero + h} ${x + bw},${zero + h - r} V${zero} Z`;
          return (
            <g key={m.ym}>
              <path
                d={d}
                fill={color}
                opacity={
                  hover === null || hover === i
                    ? m.ym === current
                      ? 1
                      : 0.7
                    : 0.35
                }
              />
              <rect
                x={i * slot}
                y={0}
                width={slot}
                height={H}
                fill="transparent"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onPointerDown={() => setHover(i)}
              />
            </g>
          );
        })}
      </svg>
      {/* Oznake su HTML, da ostanu čitljive kad se grafikon smanji na telefonu. */}
      <div
        className="mt-1.5 grid text-center text-[12px]"
        style={{ gridTemplateColumns: `repeat(${months.length}, 1fr)` }}
      >
        {months.map((m) => (
          <span
            key={m.ym}
            style={{ color: m.ym === current ? OS.text : OS.muted }}
          >
            {short(m.ym)}
          </span>
        ))}
      </div>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[12px]"
          style={{
            left: `calc(12px + ${((hover + 0.5) / months.length) * 100}% - ${((hover + 0.5) / months.length) * 24}px)`,
            background: OS.surface2,
            border: `1px solid ${OS.lineStrong}`,
            color: OS.text,
          }}
        >
          <span style={{ color: OS.muted }}>
            {monthLabel(months[hover].ym)} ·{" "}
          </span>
          <b className="tabular-nums">{rsd.format(months[hover].profit)}</b>
        </div>
      )}
    </div>
  );
}

function TxSheet({
  open,
  tx,
  projects,
  categories,
  onProjectCreated,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  tx: Transaction | null;
  projects: ProjectRef[];
  categories: string[];
  onProjectCreated: (p: ProjectRef) => void;
  onClose: () => void;
  onSave: (d: Draft) => void;
  onDelete: () => void;
}) {
  const blank: Draft = {
    kind: "income",
    amount: 0,
    occurred_on: isoDay(),
    project_id: null,
    category: "",
    note: "",
  };
  const [d, setD] = useState<Draft>(blank);
  const [amount, setAmount] = useState("");
  useEffect(() => {
    if (!open) return;
    setD(tx ? { ...tx, amount: Number(tx.amount) } : blank);
    setAmount(tx ? String(Number(tx.amount)) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tx]);
  const set = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }));
  const value = Number(amount.replace(/\./g, "").replace(",", "."));

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={tx ? "Unos" : "Novi unos"}
      footer={
        <div className="flex gap-2">
          {tx && <DeleteButton onConfirm={onDelete} />}
          <PrimaryButton
            disabled={!(value > 0) || !d.occurred_on}
            onClick={() =>
              onSave({
                ...d,
                amount: value,
                category: d.category.trim(),
                note: d.note.trim(),
              })
            }
          >
            Sačuvaj
          </PrimaryButton>
        </div>
      }
    >
      <div className="grid gap-4 pt-2">
        <Segmented
          id="tx-kind"
          value={d.kind}
          onChange={(kind) => set({ kind })}
          options={[
            { id: "income", label: "Prihod", color: STATE.ok },
            { id: "expense", label: "Rashod", color: STATE.late },
          ]}
        />
        <Label label="Iznos (RSD)">
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            autoFocus={!tx}
            className={`${inputCls} text-[22px] font-semibold tabular-nums`}
            style={inputStyle}
          />
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Label label="Datum">
            <input
              type="date"
              value={d.occurred_on}
              onChange={(e) => set({ occurred_on: e.target.value })}
              className={inputCls}
              style={inputStyle}
            />
          </Label>
          <Label label="Kategorija">
            <input
              list="os-tx-cat"
              value={d.category}
              onChange={(e) => set({ category: e.target.value })}
              placeholder="Retainer, oprema…"
              className={inputCls}
              style={inputStyle}
            />
            <datalist id="os-tx-cat">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Label>
        </div>
        <div className="grid gap-1.5">
          <span className="text-[13px] font-medium" style={{ color: OS.muted }}>
            Projekat
          </span>
          <div className="-ml-1.5">
            <ProjectPicker
              value={d.project_id}
              projects={projects}
              onChange={(project_id) => set({ project_id })}
              onCreated={onProjectCreated}
            />
          </div>
        </div>
        <Label label="Beleška">
          <input
            value={d.note}
            onChange={(e) => set({ note: e.target.value })}
            className={inputCls}
            style={inputStyle}
          />
        </Label>
      </div>
    </Sheet>
  );
}
