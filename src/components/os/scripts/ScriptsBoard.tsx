"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ChevronDown, Plus } from "lucide-react";
import Popover, { MenuItem } from "@/components/os/Popover";
import { Avatar } from "@/components/os/Shell";
import { projectLabel } from "./pickers";
import { osBrowser } from "@/lib/os/supabase-browser";
import { stageColor, stageOwner } from "@/lib/os/stages";
import { OS, SPRING } from "@/lib/os/theme";
import type {
  Person,
  ProjectRef,
  ScriptCard,
  ScriptStage,
  ScriptStageId,
} from "@/lib/os/types";

const rel = new Intl.RelativeTimeFormat("sr-Latn-RS", { numeric: "auto" });
function ago(iso: string) {
  const min = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (min > -60) return rel.format(min, "minute");
  if (min > -60 * 24) return rel.format(Math.round(min / 60), "hour");
  return rel.format(Math.round(min / 1440), "day");
}

export default function ScriptsBoard({
  scripts,
  stages,
  team,
  projects,
  me,
}: {
  scripts: ScriptCard[];
  stages: ScriptStage[];
  team: Person[];
  projects: ProjectRef[];
  me: Person;
}) {
  const router = useRouter();
  const [project, setProject] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const visible = project
    ? scripts.filter((s) => s.project_id === project)
    : scripts;
  const byStage = useMemo(() => {
    const m = new Map<ScriptStageId, ScriptCard[]>(
      stages.map((s) => [s.id, []]),
    );
    visible.forEach((s) => m.get(s.stage)?.push(s));
    return m;
  }, [visible, stages]);

  // Telefon: prva faza u kojoj sam ja na potezu i nešto čeka, inače prva neprazna.
  const [phoneStage, setPhoneStage] = useState<ScriptStageId>(() => {
    const mine = stages.find(
      (s) => s.owner_id === me.id && scripts.some((x) => x.stage === s.id),
    );
    return (
      mine ??
      stages.find((s) => scripts.some((x) => x.stage === s.id)) ??
      stages[0]
    ).id;
  });

  // Izabrana faza uvek u vidnom polju trake.
  const chips = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chips.current
      ?.querySelector<HTMLElement>(`[data-stage="${phoneStage}"]`)
      ?.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: "smooth",
      });
  }, [phoneStage]);

  async function create() {
    setCreating(true);
    const { data, error } = await osBrowser()
      .from("scripts")
      .insert({ created_by: me.id, project_id: project })
      .select("id")
      .single();
    if (error || !data) return setCreating(false);
    router.push(`/os/skripte/${data.id}`);
  }

  const projectById = (id: string | null) => projects.find((p) => p.id === id);

  return (
    <div className="pt-[calc(20px+env(safe-area-inset-top))] md:pt-10">
      <header className="flex flex-wrap items-end justify-between gap-3 px-4 md:px-10">
        <div>
          <h1
            className="text-[30px] font-semibold leading-tight md:text-[34px]"
            style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.03em" }}
          >
            Skripte
          </h1>
          <Popover
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            width={280}
            trigger={
              <button
                type="button"
                onClick={() => setFilterOpen((o) => !o)}
                className="-ml-1.5 mt-0.5 inline-flex h-8 items-center gap-1 rounded-md px-1.5 text-[14px] hover:bg-white/[0.05]"
                style={{ color: OS.muted }}
              >
                {project ? projectLabel(projectById(project)) : "Svi projekti"}
                <ChevronDown className="size-3.5" />
              </button>
            }
          >
            <MenuItem
              selected={!project}
              onSelect={() => (setProject(null), setFilterOpen(false))}
            >
              <span className="flex-1">Svi projekti</span>
              {!project && (
                <Check className="size-4" style={{ color: OS.muted }} />
              )}
            </MenuItem>
            {projects.map((p) => (
              <MenuItem
                key={p.id}
                selected={p.id === project}
                onSelect={() => (setProject(p.id), setFilterOpen(false))}
              >
                <span className="flex-1 truncate">{projectLabel(p)}</span>
                {p.id === project && (
                  <Check className="size-4" style={{ color: OS.muted }} />
                )}
              </MenuItem>
            ))}
          </Popover>
        </div>
        <button
          type="button"
          onClick={create}
          disabled={creating}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl pl-3 pr-4 text-[14px] font-semibold transition-transform duration-100 active:scale-[0.97] disabled:opacity-50"
          style={{ background: OS.text, color: OS.bg }}
        >
          <Plus className="size-4" />
          Nova skripta
        </button>
      </header>

      {/* Telefon: izbor faze + lista */}
      <div className="md:hidden">
        <div
          ref={chips}
          className="mt-5 overflow-x-auto px-4 [scrollbar-width:none]"
        >
          <div className="flex w-max gap-1.5">
            {stages.map((s) => {
              const color = stageColor(s, team);
              const active = s.id === phoneStage;
              const n = byStage.get(s.id)?.length ?? 0;
              return (
                <button
                  key={s.id}
                  type="button"
                  data-stage={s.id}
                  onClick={() => setPhoneStage(s.id)}
                  className="relative flex h-9 items-center gap-1.5 rounded-full px-3 text-[14px] font-medium"
                  style={{ color: active ? color : OS.muted }}
                >
                  {active && (
                    <motion.span
                      layoutId="os-stage-chip"
                      transition={SPRING}
                      className="absolute inset-0 rounded-full"
                      style={{ background: `${color}1f` }}
                    />
                  )}
                  <span
                    className="relative size-1.5 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="relative">{s.label}</span>
                  <span className="relative tabular-nums opacity-70">{n}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-3 grid gap-2 px-4 pb-6">
          {(byStage.get(phoneStage) ?? []).map((s) => (
            <Card key={s.id} script={s} project={projectById(s.project_id)} />
          ))}
          {!(byStage.get(phoneStage) ?? []).length && <Empty />}
        </div>
      </div>

      {/* Desktop: kolone po fazama */}
      <div className="mt-6 hidden overflow-x-auto pb-8 md:block">
        <div className="flex w-max gap-3 px-10">
          {stages.map((s) => {
            const color = stageColor(s, team);
            const owner = stageOwner(s, team);
            const items = byStage.get(s.id) ?? [];
            return (
              <section key={s.id} className="w-[264px] shrink-0">
                <div className="mb-2 flex h-8 items-center gap-2 px-1">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="text-[14px] font-semibold" style={{ color }}>
                    {s.label}
                  </span>
                  <span
                    className="text-[13px] tabular-nums"
                    style={{ color: OS.faint }}
                  >
                    {items.length}
                  </span>
                  {owner && (
                    <span className="ml-auto">
                      <Avatar person={owner} size={22} />
                    </span>
                  )}
                </div>
                <div
                  className="grid min-h-[120px] content-start gap-2 rounded-2xl p-2"
                  style={{
                    background: `${color}0a`,
                    border: `1px solid ${color}1f`,
                  }}
                >
                  {items.map((x) => (
                    <Card
                      key={x.id}
                      script={x}
                      project={projectById(x.project_id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Card({
  script,
  project,
}: {
  script: ScriptCard;
  project: ProjectRef | undefined;
}) {
  return (
    <Link
      href={`/os/skripte/${script.id}`}
      className="block rounded-xl p-3 transition-[transform,background] duration-100 hover:bg-[#1c1c21] active:scale-[0.985]"
      style={{ background: OS.surface, border: `1px solid ${OS.line}` }}
    >
      <div
        className="line-clamp-2 text-[15px] font-medium leading-snug"
        style={{ color: OS.text }}
      >
        {script.title || "Bez naslova"}
      </div>
      <div
        className="mt-1.5 flex items-center gap-2 text-[12px]"
        style={{ color: OS.muted }}
      >
        <span className="truncate">
          {project ? projectLabel(project) : "Bez projekta"}
        </span>
        <span
          className="ml-auto shrink-0"
          style={{ color: OS.faint }}
          suppressHydrationWarning
        >
          {ago(script.updated_at)}
        </span>
      </div>
    </Link>
  );
}

function Empty() {
  return (
    <div
      className="rounded-xl px-4 py-8 text-center text-[14px]"
      style={{ color: OS.faint, border: `1px dashed ${OS.line}` }}
    >
      Ništa ne čeka u ovoj fazi.
    </div>
  );
}
