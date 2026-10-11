"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, FileText } from "lucide-react";
import { Avatar } from "@/components/os/Shell";
import { PageHeader, Segmented, pageCls } from "@/components/os/fields";
import { projectLabel } from "@/components/os/scripts/pickers";
import TaskSheet, { type TaskDraft } from "./TaskSheet";
import { CheckCircle, DueChip } from "./parts";
import { osBrowser } from "@/lib/os/supabase-browser";
import { addDays, isoDay, weekStart } from "@/lib/os/dates";
import { OS, SPRING, STATE } from "@/lib/os/theme";
import type { Person, ProjectRef, Task, TaskStatus } from "@/lib/os/types";

type View = "mine" | "team";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "To do", color: STATE.idle },
  { id: "doing", label: "U toku", color: OS.text },
  { id: "done", label: "Gotovo", color: STATE.ok },
];

export default function TasksView({
  initial,
  team,
  projects: initialProjects,
  me,
}: {
  initial: Task[];
  team: Person[];
  projects: ProjectRef[];
  me: Person;
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initial);
  const [projects, setProjects] = useState(initialProjects);
  const [view, setView] = useState<View>("mine");
  const [who, setWho] = useState<string | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);
  const [showDone, setShowDone] = useState(false);

  // Server je izvor istine (triggeri prave nove taskove); lokalno je samo optimistički sloj.
  useEffect(() => setTasks(initial), [initial]);

  const sb = osBrowser();
  const person = (id: string | null) => team.find((p) => p.id === id);
  const project = (id: string | null) => projects.find((p) => p.id === id);

  async function patch(id: string, p: Partial<Task>) {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...p } : t)));
    await sb.from("tasks").update(p).eq("id", id);
    router.refresh();
  }

  // Štiklirani task ostaje na mestu trenutak, da se vidi da je gotov.
  const [settling, setSettling] = useState<Set<string>>(new Set());
  function toggle(t: Task) {
    const done = t.status !== "done";
    if (done) {
      setSettling((s) => new Set(s).add(t.id));
      setTimeout(
        () =>
          setSettling((s) => {
            const n = new Set(s);
            n.delete(t.id);
            return n;
          }),
        650,
      );
    }
    void patch(t.id, { status: done ? "done" : "todo" });
  }

  async function create(d: TaskDraft) {
    const { data } = await sb
      .from("tasks")
      .insert({ ...d, created_by: me.id })
      .select("*")
      .single();
    if (data) setTasks((ts) => [...ts, data as Task]);
    router.refresh();
  }

  async function remove(id: string) {
    setTasks((ts) => ts.filter((t) => t.id !== id));
    setEditing(null);
    await sb.from("tasks").delete().eq("id", id);
    router.refresh();
  }

  const defaults: TaskDraft = {
    title: "",
    notes: "",
    assignee_id: view === "team" ? (who ?? me.id) : me.id,
    status: "todo",
    due_on: null,
    project_id: null,
  };

  const row = (t: Task) => (
    <TaskRow
      key={t.id}
      task={t}
      person={person(t.assignee_id)}
      project={project(t.project_id)}
      showPerson={view === "team"}
      onToggle={() => toggle(t)}
      onOpen={() => setEditing(t)}
    />
  );

  return (
    <div className={pageCls}>
      <PageHeader title="Taskovi" />
      <div className="mt-4 max-w-[280px]">
        <Segmented
          id="tasks-view"
          value={view}
          onChange={setView}
          options={[
            { id: "mine", label: "Moje" },
            { id: "team", label: "Tim" },
          ]}
        />
      </div>

      <QuickAdd
        onAdd={(title, due_on) => create({ ...defaults, title, due_on })}
        onMore={() => setCreating(true)}
      />

      {view === "mine" ? (
        <Mine
          tasks={tasks.filter((t) => t.assignee_id === me.id)}
          settling={settling}
          row={row}
          showDone={showDone}
          setShowDone={setShowDone}
        />
      ) : (
        <Team
          tasks={who ? tasks.filter((t) => t.assignee_id === who) : tasks}
          team={team}
          who={who}
          setWho={setWho}
          person={person}
          project={project}
          onOpen={setEditing}
          onMove={(t, status) =>
            t.status !== status && void patch(t.id, { status })
          }
        />
      )}

      <TaskSheet
        open={creating || !!editing}
        task={editing}
        defaults={defaults}
        team={team}
        projects={projects}
        onProjectCreated={(p) => setProjects((ps) => [...ps, p])}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onDelete={() => editing && void remove(editing.id)}
        onSave={(d) => {
          if (editing) void patch(editing.id, d);
          else void create(d);
          setCreating(false);
          setEditing(null);
        }}
      />
    </div>
  );
}

function QuickAdd({
  onAdd,
  onMore,
}: {
  onAdd: (title: string, due: string | null) => void;
  onMore: () => void;
}) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState<string | null>(null);
  const today = isoDay();
  const opts = [
    { label: "Bez roka", v: null },
    { label: "Danas", v: today },
    { label: "Sutra", v: addDays(today, 1) },
  ];
  return (
    <form
      className="mt-5 rounded-2xl p-1.5"
      style={{ background: OS.surface, border: `1px solid ${OS.line}` }}
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onAdd(title.trim(), due);
        setTitle("");
      }}
    >
      <div className="flex items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Novi task…"
          className="h-10 min-w-0 flex-1 bg-transparent px-2.5 text-[15px] outline-none placeholder:text-[#5a5a62]"
          style={{ color: OS.text }}
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="grid size-9 shrink-0 place-items-center rounded-full transition-[opacity,transform] active:scale-90 disabled:opacity-30"
          style={{ background: OS.text, color: OS.bg }}
          aria-label="Dodaj"
        >
          <ArrowUp className="size-4" strokeWidth={2.5} />
        </button>
      </div>
      <div className="flex items-center gap-1 px-1 pb-0.5 pt-1">
        {opts.map((o) => (
          <button
            key={o.label}
            type="button"
            onClick={() => setDue(o.v)}
            className="h-7 rounded-full px-2.5 text-[12px] font-medium"
            style={{
              background: due === o.v ? OS.surface2 : "transparent",
              color:
                due === o.v
                  ? o.v === today
                    ? STATE.attention
                    : OS.text
                  : OS.faint,
            }}
          >
            {o.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onMore}
          className="ml-auto h-7 px-2 text-[12px] font-medium"
          style={{ color: OS.muted }}
        >
          Više opcija
        </button>
      </div>
    </form>
  );
}

function Mine({
  tasks,
  settling,
  row,
  showDone,
  setShowDone,
}: {
  tasks: Task[];
  settling: Set<string>;
  row: (t: Task) => React.ReactNode;
  showDone: boolean;
  setShowDone: (v: boolean) => void;
}) {
  const today = isoDay();
  const sunday = addDays(weekStart(today), 6);
  const groups = useMemo(() => {
    const open = tasks
      .filter((t) => t.status !== "done" || settling.has(t.id))
      .sort(byDue);
    return [
      {
        id: "late",
        label: "Zakasnelo",
        color: STATE.late,
        items: open.filter((t) => t.due_on && t.due_on < today),
      },
      {
        id: "today",
        label: "Danas",
        color: STATE.attention,
        items: open.filter((t) => t.due_on === today),
      },
      {
        id: "week",
        label: "Ove nedelje",
        color: OS.text,
        items: open.filter(
          (t) => t.due_on && t.due_on > today && t.due_on <= sunday,
        ),
      },
      {
        id: "later",
        label: "Kasnije",
        color: OS.muted,
        items: open.filter((t) => t.due_on && t.due_on > sunday),
      },
      {
        id: "none",
        label: "Bez roka",
        color: OS.muted,
        items: open.filter((t) => !t.due_on),
      },
    ];
  }, [tasks, settling, today, sunday]);
  const done = tasks
    .filter((t) => t.status === "done" && !settling.has(t.id))
    .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""));
  const empty = groups.every((g) => !g.items.length);

  return (
    <div className="mt-6 grid gap-6">
      {empty && (
        <div
          className="rounded-2xl px-4 py-10 text-center"
          style={{ border: `1px dashed ${OS.line}` }}
        >
          <div className="text-[16px] font-medium" style={{ color: STATE.ok }}>
            Sve je čisto.
          </div>
          <div className="mt-1 text-[14px]" style={{ color: OS.faint }}>
            Nemaš otvorenih taskova.
          </div>
        </div>
      )}
      {groups.map(
        (g) =>
          g.items.length > 0 && (
            <section key={g.id}>
              <h2
                className="mb-1.5 flex items-center gap-2 px-1 text-[14px] font-semibold"
                style={{
                  color: g.color,
                  fontFamily: "var(--font-sans)",
                  letterSpacing: 0,
                }}
              >
                {g.label}
                <span
                  className="font-normal tabular-nums"
                  style={{ color: OS.faint }}
                >
                  {g.items.length}
                </span>
              </h2>
              <motion.ul
                layout
                className="overflow-hidden rounded-2xl"
                style={{
                  background: OS.surface,
                  border: `1px solid ${OS.line}`,
                }}
              >
                <AnimatePresence initial={false}>
                  {g.items.map(row)}
                </AnimatePresence>
              </motion.ul>
            </section>
          ),
      )}
      {done.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setShowDone(!showDone)}
            className="mb-1.5 px-1 text-[14px] font-semibold"
            style={{ color: OS.muted }}
          >
            {showDone ? "Sakrij završeno" : `Završeno (${done.length})`}
          </button>
          {showDone && (
            <ul
              className="overflow-hidden rounded-2xl"
              style={{ background: OS.surface, border: `1px solid ${OS.line}` }}
            >
              <AnimatePresence initial={false}>{done.map(row)}</AnimatePresence>
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function byDue(a: Task, b: Task) {
  return (
    (a.due_on ?? "9999").localeCompare(b.due_on ?? "9999") ||
    a.position - b.position
  );
}

function TaskRow({
  task,
  person,
  project,
  showPerson,
  onToggle,
  onOpen,
}: {
  task: Task;
  person: Person | undefined;
  project: ProjectRef | undefined;
  showPerson: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const done = task.status === "done";
  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={SPRING}
      className="border-b last:border-b-0"
      style={{ borderColor: OS.line }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => e.key === "Enter" && onOpen()}
        className="flex cursor-pointer items-center gap-3 px-3.5 py-3 transition-colors duration-75 hover:bg-white/[0.025] active:bg-white/[0.05]"
      >
        <CheckCircle
          done={done}
          onToggle={onToggle}
          color={person?.color ?? OS.faint}
        />
        <div className="min-w-0 flex-1">
          <div
            className="truncate text-[15px]"
            style={{
              color: done ? OS.muted : OS.text,
              textDecorationLine: done ? "line-through" : "none",
              textDecorationColor: OS.faint,
            }}
          >
            {task.title}
          </div>
          {(task.due_on ||
            project ||
            task.status === "doing" ||
            task.script_id) && (
            <div
              className="mt-0.5 flex items-center gap-2 text-[12px]"
              style={{ color: OS.muted }}
            >
              {task.status === "doing" && (
                <span style={{ color: OS.text }}>U toku</span>
              )}
              <DueChip task={task} />
              {task.script_id && <FileText className="size-3" />}
              {project && (
                <span className="truncate">{projectLabel(project)}</span>
              )}
            </div>
          )}
        </div>
        {showPerson && person && <Avatar person={person} size={26} />}
      </div>
    </motion.li>
  );
}

function Team({
  tasks,
  team,
  who,
  setWho,
  person,
  project,
  onOpen,
  onMove,
}: {
  tasks: Task[];
  team: Person[];
  who: string | null;
  setWho: (id: string | null) => void;
  person: (id: string | null) => Person | undefined;
  project: (id: string | null) => ProjectRef | undefined;
  onOpen: (t: Task) => void;
  onMove: (t: Task, s: TaskStatus) => void;
}) {
  const [over, setOver] = useState<TaskStatus | null>(null);
  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-1.5">
        <FilterChip active={!who} onClick={() => setWho(null)}>
          Svi
        </FilterChip>
        {team.map((p) => (
          <FilterChip
            key={p.id}
            active={who === p.id}
            color={p.color}
            onClick={() => setWho(who === p.id ? null : p.id)}
          >
            <Avatar person={p} size={22} />
            {p.name}
          </FilterChip>
        ))}
      </div>
      <div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {COLUMNS.map((c) => {
          const items = tasks.filter((t) => t.status === c.id).sort(byDue);
          return (
            <section
              key={c.id}
              className="w-[82vw] shrink-0 snap-start md:w-auto"
              onDragOver={(e) => {
                e.preventDefault();
                setOver(c.id);
              }}
              onDragLeave={() => setOver((o) => (o === c.id ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                const t = tasks.find(
                  (x) => x.id === e.dataTransfer.getData("text/plain"),
                );
                if (t) onMove(t, c.id);
              }}
            >
              <h2
                className="mb-2 flex items-center gap-2 px-1 text-[14px] font-semibold"
                style={{
                  color: c.color,
                  fontFamily: "var(--font-sans)",
                  letterSpacing: 0,
                }}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: c.color }}
                />
                {c.label}
                <span
                  className="font-normal tabular-nums"
                  style={{ color: OS.faint }}
                >
                  {items.length}
                </span>
              </h2>
              <div
                className="grid min-h-[160px] content-start gap-2 rounded-2xl p-2 transition-colors"
                style={{
                  background:
                    over === c.id
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(255,255,255,0.02)",
                  border: `1px solid ${OS.line}`,
                }}
              >
                {items.map((t) => {
                  const p = person(t.assignee_id);
                  const pr = project(t.project_id);
                  return (
                    // framer-motion ne prosleđuje onDragStart DOM-u, zato HTML drag nosi običan div.
                    <motion.div layout transition={SPRING} key={t.id}>
                      <div
                        draggable
                        onDragStart={(e) =>
                          e.dataTransfer.setData("text/plain", t.id)
                        }
                        onClick={() => onOpen(t)}
                        className="cursor-pointer rounded-xl p-3 active:scale-[0.985]"
                        style={{
                          background: OS.surface,
                          border: `1px solid ${OS.line}`,
                          borderLeft: `3px solid ${p?.color ?? OS.faint}`,
                        }}
                      >
                        <div
                          className="text-[14px] leading-snug"
                          style={{
                            color: c.id === "done" ? OS.muted : OS.text,
                          }}
                        >
                          {t.title}
                        </div>
                        <div
                          className="mt-2 flex items-center gap-2 text-[12px]"
                          style={{ color: OS.muted }}
                        >
                          {p && <Avatar person={p} size={20} />}
                          <DueChip task={t} />
                          {pr && (
                            <span className="truncate">{projectLabel(pr)}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium transition-transform duration-100 active:scale-[0.97]"
      style={{
        background: active
          ? color
            ? `${color}24`
            : OS.surface2
          : "transparent",
        border: `1px solid ${active ? (color ? `${color}55` : OS.lineStrong) : OS.line}`,
        color: active ? (color ?? OS.text) : OS.muted,
        paddingLeft: color ? 3 : undefined,
      }}
    >
      {children}
    </button>
  );
}
