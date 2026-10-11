import Link from "next/link";
import { getSession, osServer } from "@/lib/os/supabase";
import { OS, STATE, STATE_LABEL, rsd, type StateKey } from "@/lib/os/theme";
import {
  addDays,
  addMonths,
  daysBetween,
  dueLabel,
  isoDay,
  monthLabel,
} from "@/lib/os/dates";
import type { Goal, GoalStep, ScriptStage, Task } from "@/lib/os/types";
import Circuit, { type Branch } from "@/components/os/dashboard/Circuit";
import { Avatar } from "@/components/os/Shell";
import { goalProgress, goalState } from "@/lib/os/goals";
import { plural } from "@/lib/os/text";

export const metadata = { title: "Početna" };

function greeting(hour: number) {
  if (hour < 12) return "Dobro jutro";
  if (hour < 18) return "Dobar dan";
  return "Dobro veče";
}

const timeFmt = new Intl.DateTimeFormat("sr-Latn-RS", {
  timeZone: "Europe/Belgrade",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function OsHome() {
  const { me, team } = await getSession();
  const sb = await osServer();
  const today = isoDay();
  const month = today.slice(0, 7);
  const now = new Date();

  const [tasks, scripts, stages, shoots, tx, goals, steps, clients, projects] =
    await Promise.all([
      sb
        .from("tasks")
        .select("id, title, assignee_id, status, due_on, script_id")
        .neq("status", "done"),
      sb
        .from("scripts")
        .select("id, stage, shoot_id, updated_at, published_at"),
      sb.from("script_stages").select("*").order("position"),
      sb
        .from("shoots")
        .select("id, starts_at, ends_at, location")
        .gte("ends_at", now.toISOString())
        .order("starts_at")
        .limit(5),
      sb
        .from("transactions")
        .select("kind, amount")
        .gte("occurred_on", `${month}-01`)
        .lt("occurred_on", `${addMonths(month, 1)}-01`),
      sb.from("goals").select("*"),
      sb.from("goal_steps").select("*"),
      sb.from("clients").select("id").eq("active", true),
      sb.from("projects").select("id").eq("status", "active"),
    ]);

  const open = (tasks.data ?? []) as Pick<
    Task,
    "id" | "title" | "assignee_id" | "status" | "due_on" | "script_id"
  >[];
  const late = open.filter((t) => t.due_on && t.due_on < today);
  const dueToday = open.filter((t) => t.due_on === today);
  const stageList = (stages.data ?? []) as ScriptStage[];
  const allScripts = scripts.data ?? [];
  const pipeline = allScripts.filter((s) => s.stage !== "published");
  const publishedThisMonth = allScripts.filter((s) =>
    s.published_at?.startsWith(month),
  ).length;
  const stale = pipeline.filter(
    (s) =>
      s.stage !== "idea" && daysBetween(s.updated_at.slice(0, 10), today) > 7,
  );
  const scriptTaskLate = late.some((t) => t.script_id);
  const waiting = allScripts.filter(
    (s) => s.stage === "schedule" && !s.shoot_id,
  ).length;
  const nextShoot = (shoots.data ?? [])[0];
  const income = (tx.data ?? [])
    .filter((t) => t.kind === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expense = (tx.data ?? [])
    .filter((t) => t.kind === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const profit = income - expense;
  const goalList = (goals.data ?? []) as Goal[];
  const stepList = (steps.data ?? []) as GoalStep[];
  const activeGoals = goalList
    .map((g) => ({ g, p: goalProgress(g, stepList, { income, profit }) }))
    .filter(({ g, p }) => goalState(g, p, today) !== "ok");
  const goalStates = activeGoals.map(({ g, p }) => goalState(g, p, today));

  const owners = (ids: (string | null)[]) => [
    ...new Set(ids.filter(Boolean) as string[]),
  ];
  const nina = team.find((p) => p.slug === "nina")?.id ?? null;
  const record = stageList.find((s) => s.id === "record")?.owner_id ?? null;

  const shootDay = nextShoot ? isoDay(new Date(nextShoot.starts_at)) : null;
  const shootState: StateKey =
    shootDay === today
      ? "attention"
      : nextShoot
        ? "ok"
        : waiting
          ? "attention"
          : "idle";

  const branches: Branch[] = [
    {
      id: "scripts",
      href: "/os/skripte",
      label: "Skripte",
      state: scriptTaskLate
        ? "late"
        : stale.length
          ? "attention"
          : pipeline.length
            ? "ok"
            : "idle",
      value: `${pipeline.length} u toku`,
      sub: stale.length
        ? `${stale.length} stoji duže od 7 dana`
        : `${publishedThisMonth} objavljeno ovog meseca`,
      people: owners(
        stageList
          .filter((st) => pipeline.some((s) => s.stage === st.id))
          .map((st) => st.owner_id),
      ),
      load: Math.ceil(pipeline.length / 2),
    },
    {
      id: "shoots",
      href: "/os/snimanje",
      label: "Snimanje",
      state: shootState,
      value: nextShoot
        ? `${dueLabel(shootDay!, today)} ${timeFmt.format(new Date(nextShoot.starts_at))}`
        : "Nema termina",
      sub: waiting
        ? `${waiting} ${plural(waiting, "skripta čeka", "skripte čekaju", "skripti čeka")} termin`
        : nextShoot?.location || "Sledeće snimanje",
      people: owners([nina, record]),
      load: (nextShoot ? 2 : 0) + waiting,
    },
    {
      id: "tasks",
      href: "/os/taskovi",
      label: "Taskovi",
      state: late.length ? "late" : dueToday.length ? "attention" : "ok",
      value: `${open.length} ${plural(open.length, "otvoren", "otvorena", "otvorenih")}`,
      sub: late.length
        ? `${late.length} kasni · ${dueToday.length} danas`
        : dueToday.length
          ? `${dueToday.length} za danas`
          : open.length
            ? "Ništa ne kasni"
            : "Sve je čisto",
      people: owners(open.map((t) => t.assignee_id)),
      load: Math.ceil(open.length / 3),
    },
    {
      id: "finance",
      href: "/os/finansije",
      label: "Finansije",
      state: profit > 0 ? "ok" : profit < 0 ? "late" : "idle",
      value: rsd.format(profit),
      sub: `Prihod ${rsd.format(income)} · Rashod ${rsd.format(expense)}`,
      people: team.map((p) => p.id),
      load: income ? 3 : 0,
    },
    {
      id: "goals",
      href: "/os/ciljevi",
      label: "Ciljevi",
      state: goalStates.includes("late")
        ? "late"
        : goalStates.includes("attention")
          ? "attention"
          : activeGoals.length
            ? "ok"
            : "idle",
      value: activeGoals.length
        ? `${Math.round((activeGoals.reduce((s, x) => s + x.p, 0) / activeGoals.length) * 100)}%`
        : "—",
      sub: activeGoals.length
        ? `${activeGoals.length} ${plural(activeGoals.length, "aktivan cilj", "aktivna cilja", "aktivnih ciljeva")}`
        : "Postavi prvi cilj",
      people: owners(activeGoals.map(({ g }) => g.owner_id)),
      load: activeGoals.length,
    },
    {
      id: "clients",
      href: "/os/klijenti",
      label: "Klijenti",
      state: (projects.data ?? []).length ? "ok" : "idle",
      value: `${(projects.data ?? []).length} ${plural((projects.data ?? []).length, "projekat", "projekta", "projekata")}`,
      sub: `${(clients.data ?? []).length} ${plural((clients.data ?? []).length, "aktivan klijent", "aktivna klijenta", "aktivnih klijenata")}`,
      people: [],
      load: Math.ceil((projects.data ?? []).length / 2),
    },
  ];

  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Belgrade",
      hour: "numeric",
    }).format(now),
  );
  const dateLine = new Intl.DateTimeFormat("sr-Latn-RS", {
    timeZone: "Europe/Belgrade",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
  const mine = open
    .filter((t) => t.assignee_id === me?.id && t.due_on && t.due_on <= today)
    .sort((a, b) => a.due_on!.localeCompare(b.due_on!));
  const mineWeek = open.filter(
    (t) =>
      t.assignee_id === me?.id &&
      t.due_on &&
      t.due_on > today &&
      t.due_on <= addDays(today, 7),
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-[calc(20px+env(safe-area-inset-top))] md:px-10 md:pt-10">
      <p
        className="text-[13px] font-medium capitalize"
        style={{ color: OS.muted }}
      >
        {dateLine}
      </p>
      <h1
        className="mt-1 text-[30px] font-semibold leading-[1.1] md:text-[36px]"
        style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.03em" }}
      >
        {greeting(hour)}, {me?.name}.
      </h1>

      <div className="mt-8">
        <Circuit
          branches={branches}
          team={team}
          center={{
            value: rsd.format(profit),
            sub: `Profit · ${monthLabel(month)}`,
            state: profit > 0 ? "ok" : profit < 0 ? "late" : "idle",
          }}
        />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <section>
          <SectionTitle>Moje za danas</SectionTitle>
          {mine.length === 0 ? (
            <div
              className="mt-3 rounded-2xl px-4 py-6 text-[14px]"
              style={{
                background: OS.surface,
                border: `1px solid ${OS.line}`,
                color: OS.muted,
              }}
            >
              <span style={{ color: STATE.ok }}>Ništa ne kasni.</span>{" "}
              {mineWeek ? `${mineWeek} do kraja nedelje.` : ""}
            </div>
          ) : (
            <ul
              className="mt-3 overflow-hidden rounded-2xl"
              style={{ background: OS.surface, border: `1px solid ${OS.line}` }}
            >
              {mine.slice(0, 6).map((t) => (
                <li key={t.id}>
                  <Link
                    href="/os/taskovi"
                    className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-white/[0.02]"
                    style={{ borderColor: OS.line }}
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{
                        background:
                          t.due_on! < today ? STATE.late : STATE.attention,
                      }}
                    />
                    <span className="min-w-0 flex-1 truncate text-[15px]">
                      {t.title}
                    </span>
                    <span
                      className="shrink-0 text-[12px] font-medium"
                      style={{
                        color: t.due_on! < today ? STATE.late : STATE.attention,
                      }}
                    >
                      {dueLabel(t.due_on!, today)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionTitle>Tim</SectionTitle>
          <ul
            className="mt-3 overflow-hidden rounded-2xl"
            style={{ background: OS.surface, border: `1px solid ${OS.line}` }}
          >
            {team.map((p) => {
              const theirs = open.filter((t) => t.assignee_id === p.id);
              const lateN = theirs.filter(
                (t) => t.due_on && t.due_on < today,
              ).length;
              return (
                <li
                  key={p.id}
                  className="flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0"
                  style={{ borderColor: OS.line }}
                >
                  <Avatar person={p} size={30} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium">
                      {p.name}
                    </span>
                    <span
                      className="block truncate text-[12px]"
                      style={{ color: OS.muted }}
                    >
                      {p.role}
                    </span>
                  </span>
                  <span
                    className="text-right text-[12px] tabular-nums"
                    style={{ color: OS.muted }}
                  >
                    <b
                      className="text-[15px] font-semibold"
                      style={{ color: OS.text }}
                    >
                      {theirs.length}
                    </b>{" "}
                    otvoreno
                    {lateN > 0 && (
                      <span className="block" style={{ color: STATE.late }}>
                        {lateN} kasni
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="mt-10">
        <SectionTitle>Šta boje znače</SectionTitle>
        <div
          className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13px]"
          style={{ color: OS.muted }}
        >
          {(Object.keys(STATE) as StateKey[]).map((k) => (
            <span key={k} className="inline-flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ background: STATE[k] }}
              />
              {STATE_LABEL[k]}
            </span>
          ))}
          <span className="inline-flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ background: OS.brand }}
            />
            Skeylo, centar sistema
          </span>
          {team.map((p) => (
            <span key={p.id} className="inline-flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ background: p.color }}
              />
              {p.name} na potezu
            </span>
          ))}
        </div>
      </section>
    </div>
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
