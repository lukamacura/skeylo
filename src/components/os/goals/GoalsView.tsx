"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Target, X } from "lucide-react";
import Sheet from "@/components/os/Sheet";
import { Avatar } from "@/components/os/Shell";
import {
  AddButton,
  DeleteButton,
  Label,
  PageHeader,
  PersonPicker,
  PrimaryButton,
  Segmented,
  inputCls,
  inputStyle,
  pageCls,
} from "@/components/os/fields";
import { CheckCircle } from "@/components/os/tasks/parts";
import { osBrowser } from "@/lib/os/supabase-browser";
import { daysBetween, dueLabel, isoDay, longDate } from "@/lib/os/dates";
import { OS, STATE, rsd } from "@/lib/os/theme";
import type { Goal, GoalStep, Person } from "@/lib/os/types";
import { goalProgress, goalState, type Metrics } from "@/lib/os/goals";

type Draft = Pick<
  Goal,
  "title" | "deadline" | "owner_id" | "metric" | "target"
>;

export default function GoalsView({
  goals,
  steps: initialSteps,
  metrics,
  team,
  me,
}: {
  goals: Goal[];
  steps: GoalStep[];
  metrics: Metrics;
  team: Person[];
  me: Person;
}) {
  const router = useRouter();
  const sb = osBrowser();
  const [steps, setSteps] = useState(initialSteps);
  const [open, setOpen] = useState<{ goal: Goal | null } | null>(null);
  useEffect(() => setSteps(initialSteps), [initialSteps]);

  const withP = goals.map((g) => ({ g, p: goalProgress(g, steps, metrics) }));
  const active = withP.filter(({ g, p }) => goalState(g, p) !== "ok");
  const done = withP.filter(({ g, p }) => goalState(g, p) === "ok");

  async function save(d: Draft, newSteps: string[]) {
    const goal = open?.goal;
    setOpen(null);
    let id = goal?.id;
    if (goal) await sb.from("goals").update(d).eq("id", goal.id);
    else {
      const { data } = await sb.from("goals").insert(d).select("id").single();
      id = data?.id;
    }
    if (id && newSteps.length) {
      const base = Date.now() / 1000;
      await sb.from("goal_steps").insert(
        newSteps.map((title, i) => ({
          goal_id: id,
          title,
          position: base + i,
        })),
      );
    }
    router.refresh();
  }

  const stepApi = {
    toggle: async (s: GoalStep) => {
      setSteps((ss) =>
        ss.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)),
      );
      await sb.from("goal_steps").update({ done: !s.done }).eq("id", s.id);
      router.refresh();
    },
    add: async (goal_id: string, title: string) => {
      const { data } = await sb
        .from("goal_steps")
        .insert({ goal_id, title })
        .select("*")
        .single();
      if (data) setSteps((ss) => [...ss, data as GoalStep]);
      router.refresh();
    },
    remove: async (s: GoalStep) => {
      setSteps((ss) => ss.filter((x) => x.id !== s.id));
      await sb.from("goal_steps").delete().eq("id", s.id);
      router.refresh();
    },
  };

  return (
    <div className={pageCls}>
      <PageHeader
        title="Ciljevi"
        action={
          <AddButton onClick={() => setOpen({ goal: null })}>
            <Plus className="size-4" />
            Novi cilj
          </AddButton>
        }
      />

      {goals.length === 0 && (
        <div
          className="mt-6 rounded-2xl px-4 py-12 text-center"
          style={{ border: `1px dashed ${OS.line}` }}
        >
          <Target className="mx-auto size-6" style={{ color: OS.faint }} />
          <div className="mt-2 text-[15px]" style={{ color: OS.muted }}>
            Još nema ciljeva. Naziv, rok i plan u koracima.
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-2.5 md:grid-cols-2">
        {active.map(({ g, p }) => (
          <GoalCard
            key={g.id}
            goal={g}
            progress={p}
            steps={steps}
            metrics={metrics}
            owner={team.find((x) => x.id === g.owner_id)}
            onOpen={() => setOpen({ goal: g })}
          />
        ))}
      </div>

      {done.length > 0 && (
        <section className="mt-8">
          <h2
            className="text-[13px] font-semibold uppercase"
            style={{
              fontFamily: "var(--font-sans)",
              letterSpacing: "0.06em",
              color: STATE.ok,
            }}
          >
            Ostvareno
          </h2>
          <div className="mt-3 grid gap-2.5 md:grid-cols-2">
            {done.map(({ g, p }) => (
              <GoalCard
                key={g.id}
                goal={g}
                progress={p}
                steps={steps}
                metrics={metrics}
                owner={team.find((x) => x.id === g.owner_id)}
                onOpen={() => setOpen({ goal: g })}
              />
            ))}
          </div>
        </section>
      )}

      <GoalSheet
        open={!!open}
        goal={open?.goal ?? null}
        steps={steps}
        team={team}
        me={me}
        stepApi={stepApi}
        onClose={() => setOpen(null)}
        onSave={save}
        onDone={async (done) => {
          const g = open?.goal;
          setOpen(null);
          if (g)
            await sb
              .from("goals")
              .update({ done_at: done ? new Date().toISOString() : null })
              .eq("id", g.id);
          router.refresh();
        }}
        onDelete={async () => {
          const g = open?.goal;
          setOpen(null);
          if (g) await sb.from("goals").delete().eq("id", g.id);
          router.refresh();
        }}
      />
    </div>
  );
}

function GoalCard({
  goal,
  progress,
  steps,
  metrics,
  owner,
  onOpen,
}: {
  goal: Goal;
  progress: number;
  steps: GoalStep[];
  metrics: Metrics;
  owner: Person | undefined;
  onOpen: () => void;
}) {
  const state = goalState(goal, progress);
  const mine = steps.filter((s) => s.goal_id === goal.id);
  const bar =
    state === "ok" ? STATE.ok : state === "late" ? STATE.late : OS.text;
  const left = goal.deadline ? daysBetween(isoDay(), goal.deadline) : null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-2xl p-4 text-left transition-transform duration-100 hover:bg-[#1c1c21] active:scale-[0.99]"
      style={{
        background: OS.surface,
        border: `1px solid ${state === "late" ? `${STATE.late}55` : OS.line}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div
            className="text-[16px] font-semibold leading-snug"
            style={{ letterSpacing: "-0.01em" }}
          >
            {goal.title}
          </div>
          {goal.deadline && (
            <div
              className="mt-1 text-[13px]"
              style={{
                color: state && state !== "ok" ? STATE[state] : OS.muted,
              }}
            >
              {state === "ok"
                ? "Ostvareno"
                : left! < 0
                  ? `Rok prošao ${dueLabel(goal.deadline)}`
                  : left === 0
                    ? "Rok je danas"
                    : `Još ${left} ${left === 1 ? "dan" : "dana"} · ${longDate(goal.deadline)}`}
            </div>
          )}
        </div>
        {owner && <Avatar person={owner} size={30} />}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full"
          style={{ background: OS.surface2 }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${Math.round(progress * 100)}%`, background: bar }}
          />
        </div>
        <span
          className="text-[13px] font-semibold tabular-nums"
          style={{ color: OS.text }}
        >
          {Math.round(progress * 100)}%
        </span>
      </div>
      <div className="mt-2 flex gap-3 text-[12px]" style={{ color: OS.muted }}>
        {mine.length > 0 && (
          <span>
            {mine.filter((s) => s.done).length}/{mine.length} koraka
          </span>
        )}
        {goal.metric && goal.target && (
          <span className="tabular-nums">
            {goal.metric === "income" ? "Prihod" : "Profit"} meseca{" "}
            {rsd.format(metrics[goal.metric])} /{" "}
            {rsd.format(Number(goal.target))}
          </span>
        )}
      </div>
    </button>
  );
}

type StepApi = {
  toggle: (s: GoalStep) => void;
  add: (goalId: string, title: string) => void;
  remove: (s: GoalStep) => void;
};

function GoalSheet({
  open,
  goal,
  steps,
  team,
  me,
  stepApi,
  onClose,
  onSave,
  onDone,
  onDelete,
}: {
  open: boolean;
  goal: Goal | null;
  steps: GoalStep[];
  team: Person[];
  me: Person;
  stepApi: StepApi;
  onClose: () => void;
  onSave: (d: Draft, newSteps: string[]) => void;
  onDone: (done: boolean) => void;
  onDelete: () => void;
}) {
  const [d, setD] = useState<Draft>({
    title: "",
    deadline: null,
    owner_id: me.id,
    metric: null,
    target: null,
  });
  const [target, setTarget] = useState("");
  const [pending, setPending] = useState<string[]>([]);
  const [step, setStep] = useState("");
  useEffect(() => {
    if (!open) return;
    setD(
      goal
        ? { ...goal }
        : {
            title: "",
            deadline: null,
            owner_id: me.id,
            metric: null,
            target: null,
          },
    );
    setTarget(goal?.target ? String(Number(goal.target)) : "");
    setPending([]);
    setStep("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, goal]);
  const set = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }));
  const mine = goal ? steps.filter((s) => s.goal_id === goal.id) : [];
  const targetNum = Number(target.replace(/\./g, "").replace(",", "."));

  function addStep() {
    const t = step.trim();
    if (!t) return;
    if (goal) stepApi.add(goal.id, t);
    else setPending((p) => [...p, t]);
    setStep("");
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={goal ? "Cilj" : "Novi cilj"}
      footer={
        <div className="flex flex-wrap gap-2">
          {goal && <DeleteButton onConfirm={onDelete} />}
          {goal && (
            <button
              type="button"
              onClick={() => onDone(!goal.done_at)}
              className="h-11 rounded-xl px-4 text-[15px] font-medium active:scale-[0.98]"
              style={{ color: STATE.ok, background: `${STATE.ok}1a` }}
            >
              {goal.done_at ? "Vrati u aktivne" : "Ostvaren"}
            </button>
          )}
          <PrimaryButton
            disabled={!d.title.trim() || (!!d.metric && !(targetNum > 0))}
            onClick={() =>
              onSave(
                {
                  ...d,
                  title: d.title.trim(),
                  target: d.metric ? targetNum : null,
                },
                pending,
              )
            }
          >
            Sačuvaj
          </PrimaryButton>
        </div>
      }
    >
      <div className="grid gap-4 pt-2">
        <input
          value={d.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Naziv cilja"
          autoFocus={!goal}
          className={`${inputCls} text-[16px] font-medium`}
          style={inputStyle}
        />
        <Label label="Rok">
          <input
            type="date"
            value={d.deadline ?? ""}
            onChange={(e) => set({ deadline: e.target.value || null })}
            className={inputCls}
            style={inputStyle}
          />
        </Label>
        <Label label="Vlasnik">
          <PersonPicker
            team={team}
            value={d.owner_id}
            onChange={(owner_id) => set({ owner_id })}
            allowNone
          />
        </Label>

        <div className="grid gap-1.5">
          <span className="text-[13px] font-medium" style={{ color: OS.muted }}>
            Plan
          </span>
          <ul
            className="overflow-hidden rounded-xl"
            style={{ border: `1px solid ${OS.line}`, background: OS.bg }}
          >
            {mine.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 border-b px-3 py-2.5"
                style={{ borderColor: OS.line }}
              >
                <CheckCircle
                  done={s.done}
                  onToggle={() => stepApi.toggle(s)}
                  color={OS.faint}
                />
                <span
                  className="flex-1 text-[15px]"
                  style={{
                    color: s.done ? OS.muted : OS.text,
                    textDecoration: s.done ? "line-through" : undefined,
                  }}
                >
                  {s.title}
                </span>
                <button
                  type="button"
                  onClick={() => stepApi.remove(s)}
                  aria-label="Ukloni korak"
                  className="grid size-7 place-items-center rounded-full active:scale-90"
                  style={{ color: OS.faint }}
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
            {pending.map((t, i) => (
              <li
                key={`p${i}`}
                className="flex items-center gap-3 border-b px-3 py-2.5"
                style={{ borderColor: OS.line }}
              >
                <span
                  className="size-[22px] rounded-full"
                  style={{ border: `1.75px solid ${OS.faint}` }}
                />
                <span className="flex-1 text-[15px]">{t}</span>
                <button
                  type="button"
                  onClick={() => setPending((p) => p.filter((_, j) => j !== i))}
                  aria-label="Ukloni korak"
                  className="grid size-7 place-items-center rounded-full"
                  style={{ color: OS.faint }}
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
            <li className="flex items-center gap-2 px-2 py-1.5">
              <input
                value={step}
                onChange={(e) => setStep(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addStep();
                  }
                }}
                placeholder="Dodaj korak…"
                className="h-9 flex-1 bg-transparent px-1.5 text-[15px] outline-none placeholder:text-[#5a5a62]"
                style={{ color: OS.text }}
              />
              <button
                type="button"
                onClick={addStep}
                disabled={!step.trim()}
                className="grid size-8 place-items-center rounded-full disabled:opacity-30"
                style={{ background: OS.text, color: OS.bg }}
                aria-label="Dodaj korak"
              >
                <Check className="size-4" strokeWidth={2.5} />
              </button>
            </li>
          </ul>
        </div>

        <Label label="Metrika iz finansija (opciono)">
          <Segmented
            id="goal-metric"
            value={d.metric ?? "none"}
            onChange={(v) => set({ metric: v === "none" ? null : v })}
            options={[
              { id: "none", label: "Bez" },
              { id: "income", label: "Prihod meseca" },
              { id: "profit", label: "Profit meseca" },
            ]}
          />
        </Label>
        {d.metric && (
          <Label label="Cilj (RSD mesečno)">
            <input
              inputMode="decimal"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="npr. 500000"
              className={`${inputCls} tabular-nums`}
              style={inputStyle}
            />
          </Label>
        )}
      </div>
    </Sheet>
  );
}
