"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, Plus, Users } from "lucide-react";
import Sheet from "@/components/os/Sheet";
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
import { osBrowser } from "@/lib/os/supabase-browser";
import { OS, STATE, rsd } from "@/lib/os/theme";
import { plural } from "@/lib/os/text";
import type { Client, Project, ProjectStatus } from "@/lib/os/types";

export type ProjectStats = {
  scripts: number;
  published: number;
  openTasks: number;
  income: number;
  expense: number;
};

const STATUS: { id: ProjectStatus; label: string; color: string }[] = [
  { id: "active", label: "Aktivan", color: STATE.ok },
  { id: "paused", label: "Pauza", color: STATE.attention },
  { id: "done", label: "Završen", color: STATE.idle },
];

export default function ClientsView({
  clients,
  projects,
  stats,
}: {
  clients: Client[];
  projects: Project[];
  stats: Record<string, ProjectStats>;
}) {
  const router = useRouter();
  const sb = osBrowser();
  const [clientSheet, setClientSheet] = useState<{
    client: Client | null;
  } | null>(null);
  const [projectSheet, setProjectSheet] = useState<{
    project: Project | null;
    clientId: string;
  } | null>(null);

  const empty: ProjectStats = {
    scripts: 0,
    published: 0,
    openTasks: 0,
    income: 0,
    expense: 0,
  };
  const sorted = [...clients].sort(
    (a, b) =>
      Number(b.active) - Number(a.active) || a.name.localeCompare(b.name),
  );

  return (
    <div className={pageCls}>
      <PageHeader
        title="Klijenti"
        sub={(() => {
          const c = clients.filter((x) => x.active).length;
          const p = projects.filter((x) => x.status === "active").length;
          return `${c} ${plural(c, "aktivan", "aktivna", "aktivnih")} · ${p} ${plural(p, "projekat", "projekta", "projekata")} u toku`;
        })()}
        action={
          <AddButton onClick={() => setClientSheet({ client: null })}>
            <Plus className="size-4" />
            Klijent
          </AddButton>
        }
      />

      {clients.length === 0 && (
        <div
          className="mt-6 rounded-2xl px-4 py-12 text-center"
          style={{ border: `1px dashed ${OS.line}` }}
        >
          <Users className="mx-auto size-6" style={{ color: OS.faint }} />
          <div className="mt-2 text-[15px]" style={{ color: OS.muted }}>
            Dodaj prvog klijenta, pa njegove projekte.
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {sorted.map((c) => {
          const mine = projects.filter((p) => p.client_id === c.id);
          const total = mine.reduce(
            (s, p) => s + (stats[p.id] ?? empty).income,
            0,
          );
          return (
            <section
              key={c.id}
              className="overflow-hidden rounded-2xl"
              style={{
                background: OS.surface,
                border: `1px solid ${OS.line}`,
                opacity: c.active ? 1 : 0.6,
              }}
            >
              <button
                type="button"
                onClick={() => setClientSheet({ client: c })}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.02]"
              >
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-xl text-[16px] font-semibold"
                  style={{ background: OS.surface2, color: OS.text }}
                >
                  {c.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] font-semibold">
                    {c.name}
                  </span>
                  <span
                    className="block truncate text-[13px]"
                    style={{ color: OS.muted }}
                  >
                    {c.active
                      ? `${mine.length} ${plural(mine.length, "projekat", "projekta", "projekata")}`
                      : "Neaktivan"}
                    {c.notes && ` · ${c.notes}`}
                  </span>
                </span>
                <span className="text-right">
                  <span
                    className="block text-[15px] font-semibold tabular-nums"
                    style={{ color: OS.text }}
                  >
                    {rsd.format(total)}
                  </span>
                  <span
                    className="block text-[11px]"
                    style={{ color: OS.faint }}
                  >
                    ukupan prihod
                  </span>
                </span>
              </button>
              <ul className="border-t" style={{ borderColor: OS.line }}>
                {mine.map((p) => {
                  const s = stats[p.id] ?? empty;
                  const st = STATUS.find((x) => x.id === p.status)!;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setProjectSheet({ project: p, clientId: c.id })
                        }
                        className="flex w-full items-center gap-3 border-b px-4 py-2.5 text-left hover:bg-white/[0.02]"
                        style={{ borderColor: OS.line }}
                      >
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ background: st.color }}
                          title={st.label}
                        />
                        <span className="min-w-0 flex-1">
                          <span
                            className="block truncate text-[14px]"
                            style={{
                              color: p.status === "done" ? OS.muted : OS.text,
                            }}
                          >
                            {p.name}
                          </span>
                          <span
                            className="block truncate text-[12px]"
                            style={{ color: OS.muted }}
                          >
                            {st.label} · {s.published}/{s.scripts} skripti
                            objavljeno · {s.openTasks} otvorenih taskova
                          </span>
                        </span>
                        <span
                          className="shrink-0 text-[13px] tabular-nums"
                          style={{ color: OS.muted }}
                        >
                          {rsd.format(s.income - s.expense)}
                        </span>
                      </button>
                    </li>
                  );
                })}
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      setProjectSheet({ project: null, clientId: c.id })
                    }
                    className="flex h-10 w-full items-center gap-2 px-4 text-[13px] font-medium hover:bg-white/[0.02]"
                    style={{ color: OS.muted }}
                  >
                    <FolderPlus className="size-4" />
                    Novi projekat
                  </button>
                </li>
              </ul>
            </section>
          );
        })}
      </div>

      <ClientSheet
        state={clientSheet}
        onClose={() => setClientSheet(null)}
        onSave={async (d) => {
          const c = clientSheet?.client;
          setClientSheet(null);
          if (c) await sb.from("clients").update(d).eq("id", c.id);
          else await sb.from("clients").insert(d);
          router.refresh();
        }}
        onDelete={async () => {
          const c = clientSheet?.client;
          setClientSheet(null);
          if (c) await sb.from("clients").delete().eq("id", c.id);
          router.refresh();
        }}
      />
      <ProjectSheet
        state={projectSheet}
        onClose={() => setProjectSheet(null)}
        onSave={async (d) => {
          const s = projectSheet!;
          setProjectSheet(null);
          if (s.project)
            await sb.from("projects").update(d).eq("id", s.project.id);
          else
            await sb.from("projects").insert({ ...d, client_id: s.clientId });
          router.refresh();
        }}
        onDelete={async () => {
          const p = projectSheet?.project;
          setProjectSheet(null);
          if (p) await sb.from("projects").delete().eq("id", p.id);
          router.refresh();
        }}
      />
    </div>
  );
}

function ClientSheet({
  state,
  onClose,
  onSave,
  onDelete,
}: {
  state: { client: Client | null } | null;
  onClose: () => void;
  onSave: (d: Pick<Client, "name" | "notes" | "active">) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [active, setActive] = useState(true);
  useEffect(() => {
    if (!state) return;
    setName(state.client?.name ?? "");
    setNotes(state.client?.notes ?? "");
    setActive(state.client?.active ?? true);
  }, [state]);
  return (
    <Sheet
      open={!!state}
      onClose={onClose}
      title={state?.client ? "Klijent" : "Novi klijent"}
      footer={
        <div className="flex gap-2">
          {state?.client && <DeleteButton onConfirm={onDelete} />}
          <PrimaryButton
            disabled={!name.trim()}
            onClick={() =>
              onSave({ name: name.trim(), notes: notes.trim(), active })
            }
          >
            Sačuvaj
          </PrimaryButton>
        </div>
      }
    >
      <div className="grid gap-4 pt-2">
        <Label label="Naziv">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus={!state?.client}
            className={inputCls}
            style={inputStyle}
          />
        </Label>
        <Label label="Beleška">
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Kontakt, paket, napomena…"
            className={inputCls}
            style={inputStyle}
          />
        </Label>
        <Label label="Status">
          <Segmented
            id="client-active"
            value={active ? "on" : "off"}
            onChange={(v) => setActive(v === "on")}
            options={[
              { id: "on", label: "Aktivan", color: STATE.ok },
              { id: "off", label: "Neaktivan" },
            ]}
          />
        </Label>
        {state?.client && (
          <p className="text-[12px]" style={{ color: OS.faint }}>
            Brisanje klijenta briše i njegove projekte. Skripte i taskovi
            ostaju, bez projekta.
          </p>
        )}
      </div>
    </Sheet>
  );
}

function ProjectSheet({
  state,
  onClose,
  onSave,
  onDelete,
}: {
  state: { project: Project | null; clientId: string } | null;
  onClose: () => void;
  onSave: (
    d: Pick<Project, "name" | "status" | "starts_on" | "ends_on">,
  ) => void;
  onDelete: () => void;
}) {
  const [d, setD] = useState<
    Pick<Project, "name" | "status" | "starts_on" | "ends_on">
  >({ name: "", status: "active", starts_on: null, ends_on: null });
  useEffect(() => {
    if (!state) return;
    const p = state.project;
    setD(
      p
        ? {
            name: p.name,
            status: p.status,
            starts_on: p.starts_on,
            ends_on: p.ends_on,
          }
        : { name: "", status: "active", starts_on: null, ends_on: null },
    );
  }, [state]);
  return (
    <Sheet
      open={!!state}
      onClose={onClose}
      title={state?.project ? "Projekat" : "Novi projekat"}
      footer={
        <div className="flex gap-2">
          {state?.project && <DeleteButton onConfirm={onDelete} />}
          <PrimaryButton
            disabled={!d.name.trim()}
            onClick={() => onSave({ ...d, name: d.name.trim() })}
          >
            Sačuvaj
          </PrimaryButton>
        </div>
      }
    >
      <div className="grid gap-4 pt-2">
        <Label label="Naziv">
          <input
            value={d.name}
            onChange={(e) => setD({ ...d, name: e.target.value })}
            autoFocus={!state?.project}
            className={inputCls}
            style={inputStyle}
          />
        </Label>
        <Label label="Status">
          <Segmented
            id="project-status"
            value={d.status}
            onChange={(status) => setD({ ...d, status })}
            options={STATUS}
          />
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Label label="Početak">
            <input
              type="date"
              value={d.starts_on ?? ""}
              onChange={(e) =>
                setD({ ...d, starts_on: e.target.value || null })
              }
              className={inputCls}
              style={inputStyle}
            />
          </Label>
          <Label label="Kraj">
            <input
              type="date"
              value={d.ends_on ?? ""}
              onChange={(e) => setD({ ...d, ends_on: e.target.value || null })}
              className={inputCls}
              style={inputStyle}
            />
          </Label>
        </div>
      </div>
    </Sheet>
  );
}
