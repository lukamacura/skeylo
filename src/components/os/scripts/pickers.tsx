"use client";

import { useState } from "react";
import { Check, ChevronDown, FolderPlus } from "lucide-react";
import Popover, { MenuItem } from "@/components/os/Popover";
import { Avatar } from "@/components/os/Shell";
import { osBrowser } from "@/lib/os/supabase-browser";
import { PROJECT_SELECT, stageColor, stageOwner } from "@/lib/os/stages";
import { OS, STATE } from "@/lib/os/theme";
import type {
  Person,
  ProjectRef,
  ScriptStage,
  ScriptStageId,
} from "@/lib/os/types";

export function StagePill({
  stage,
  team,
}: {
  stage: ScriptStage | undefined;
  team: Person[];
}) {
  const color = stageColor(stage, team);
  return (
    <span
      className="inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium"
      style={{ background: `${color}1f`, color }}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {stage?.label ?? "—"}
    </span>
  );
}

export function StagePicker({
  value,
  stages,
  team,
  onChange,
}: {
  value: ScriptStageId;
  stages: ScriptStage[];
  team: Person[];
  onChange: (id: ScriptStageId) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = stages.find((s) => s.id === value);
  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      trigger={
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1 active:opacity-70"
        >
          <StagePill stage={current} team={team} />
          <ChevronDown className="size-3.5" style={{ color: OS.muted }} />
        </button>
      }
    >
      {stages.map((s) => {
        const owner = stageOwner(s, team);
        return (
          <MenuItem
            key={s.id}
            selected={s.id === value}
            onSelect={() => {
              setOpen(false);
              if (s.id !== value) onChange(s.id);
            }}
          >
            <span
              className="size-2 rounded-full"
              style={{ background: stageColor(s, team) }}
            />
            <span className="flex-1">{s.label}</span>
            {owner && (
              <span className="text-[12px]" style={{ color: OS.muted }}>
                {owner.name}
              </span>
            )}
            {s.id === value && (
              <Check className="size-4" style={{ color: OS.muted }} />
            )}
          </MenuItem>
        );
      })}
    </Popover>
  );
}

export function projectLabel(p: ProjectRef | undefined) {
  return p ? `${p.client.name} · ${p.name}` : "Bez projekta";
}

export function ProjectPicker({
  value,
  projects,
  onChange,
  onCreated,
}: {
  value: string | null;
  projects: ProjectRef[];
  onChange: (id: string | null) => void;
  onCreated: (p: ProjectRef) => void;
}) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [client, setClient] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const current = projects.find((p) => p.id === value);
  const clients = [
    ...new Map(projects.map((p) => [p.client.id, p.client])).values(),
  ];

  function close() {
    setOpen(false);
    setCreating(false);
    setError("");
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const sb = osBrowser();
    const clientName = client.trim();
    let clientId = clients.find(
      (c) => c.name.toLowerCase() === clientName.toLowerCase(),
    )?.id;
    if (!clientId) {
      const { data, error } = await sb
        .from("clients")
        .insert({ name: clientName })
        .select("id")
        .single();
      if (error || !data) return setError("Klijent nije sačuvan.");
      clientId = data.id as string;
    }
    const { data, error } = await sb
      .from("projects")
      .insert({ client_id: clientId, name: name.trim() })
      .select(PROJECT_SELECT)
      .single();
    if (error || !data) return setError("Projekat nije sačuvan.");
    const created = data as unknown as ProjectRef;
    onCreated(created);
    onChange(created.id);
    setClient("");
    setName("");
    close();
  }

  const byClient = clients.map((c) => ({
    client: c,
    items: projects.filter((p) => p.client.id === c.id),
  }));

  return (
    <Popover
      open={open}
      onClose={close}
      width={300}
      trigger={
        <button
          type="button"
          onClick={() => (open ? close() : setOpen(true))}
          className="inline-flex h-7 max-w-full items-center gap-1 truncate rounded-md px-1.5 text-[14px] hover:bg-white/[0.05] active:bg-white/[0.08]"
          style={{ color: current ? OS.text : OS.muted }}
        >
          <span className="truncate">{projectLabel(current)}</span>
          <ChevronDown
            className="size-3.5 shrink-0"
            style={{ color: OS.muted }}
          />
        </button>
      }
    >
      {creating ? (
        <form onSubmit={create} className="grid gap-2 p-2">
          <input
            list="os-clients"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Klijent (postojeći ili novi)"
            autoFocus
            className="h-9 rounded-lg px-2.5 text-[14px] outline-none"
            style={{
              background: OS.surface,
              border: `1px solid ${OS.line}`,
              color: OS.text,
            }}
          />
          <datalist id="os-clients">
            {clients.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Naziv projekta"
            className="h-9 rounded-lg px-2.5 text-[14px] outline-none"
            style={{
              background: OS.surface,
              border: `1px solid ${OS.line}`,
              color: OS.text,
            }}
          />
          {error && (
            <p className="text-[12px]" style={{ color: STATE.late }}>
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="h-9 flex-1 rounded-lg text-[14px]"
              style={{ color: OS.muted }}
            >
              Nazad
            </button>
            <button
              type="submit"
              disabled={!client.trim() || !name.trim()}
              className="h-9 flex-1 rounded-lg text-[14px] font-semibold active:scale-[0.98] disabled:opacity-40"
              style={{ background: OS.text, color: OS.bg }}
            >
              Napravi
            </button>
          </div>
        </form>
      ) : (
        <div className="max-h-[320px] overflow-y-auto">
          <MenuItem
            selected={!value}
            onSelect={() => (onChange(null), close())}
          >
            <span className="flex-1" style={{ color: OS.muted }}>
              Bez projekta
            </span>
          </MenuItem>
          {byClient.map(({ client, items }) => (
            <div key={client.id}>
              <div
                className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: OS.faint }}
              >
                {client.name}
              </div>
              {items.map((p) => (
                <MenuItem
                  key={p.id}
                  selected={p.id === value}
                  onSelect={() => (onChange(p.id), close())}
                >
                  <span className="flex-1 truncate">{p.name}</span>
                  {p.id === value && (
                    <Check className="size-4" style={{ color: OS.muted }} />
                  )}
                </MenuItem>
              ))}
            </div>
          ))}
          <div className="mt-1 border-t pt-1" style={{ borderColor: OS.line }}>
            <MenuItem onSelect={() => setCreating(true)}>
              <FolderPlus className="size-4" style={{ color: OS.muted }} />
              Novi projekat
            </MenuItem>
          </div>
        </div>
      )}
    </Popover>
  );
}

export function OwnerChip({ person }: { person: Person | undefined }) {
  if (!person) return <span style={{ color: OS.muted }}>—</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-[14px]">
      <Avatar person={person} size={20} />
      {person.name}
    </span>
  );
}
