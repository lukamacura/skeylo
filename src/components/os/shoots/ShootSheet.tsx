"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import Sheet from "@/components/os/Sheet";
import {
  DeleteButton,
  Label,
  PrimaryButton,
  inputCls,
  inputStyle,
} from "@/components/os/fields";
import { ProjectPicker } from "@/components/os/scripts/pickers";
import { StagePill } from "@/components/os/scripts/pickers";
import { OS, STATE } from "@/lib/os/theme";
import type {
  Person,
  ProjectRef,
  ScriptCard,
  ScriptStage,
} from "@/lib/os/types";

export type ShootDraft = {
  day: string;
  start: string; // "HH:MM"
  end: string;
  project_id: string | null;
  location: string;
  notes: string;
  scriptIds: string[];
};

export default function ShootSheet({
  open,
  isNew,
  initial,
  scripts,
  stages,
  team,
  projects,
  conflict,
  onProjectCreated,
  onClose,
  onSave,
  onDelete,
  onRecorded,
}: {
  open: boolean;
  isNew: boolean;
  initial: ShootDraft;
  scripts: ScriptCard[];
  stages: ScriptStage[];
  team: Person[];
  projects: ProjectRef[];
  /** Vraća poruku ako se termin preklapa sa nedostupnim vremenom. */
  conflict: (d: ShootDraft) => string | null;
  onProjectCreated: (p: ProjectRef) => void;
  onClose: () => void;
  onSave: (d: ShootDraft) => void;
  onDelete: () => void;
  onRecorded: (scriptId: string) => void;
}) {
  const [d, setD] = useState(initial);
  useEffect(() => {
    if (open) setD(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const set = (p: Partial<ShootDraft>) => setD((x) => ({ ...x, ...p }));

  // Ponuda: skripte koje čekaju termin + one već u ovom terminu.
  const offered = scripts.filter(
    (s) =>
      d.scriptIds.includes(s.id) || (s.stage === "schedule" && !s.shoot_id),
  );
  const problem =
    d.end <= d.start ? "Kraj mora biti posle početka." : conflict(d);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isNew ? "Novo snimanje" : "Snimanje"}
      footer={
        <div className="grid gap-2">
          {problem && (
            <p className="text-[13px]" style={{ color: STATE.late }}>
              {problem}
            </p>
          )}
          <div className="flex gap-2">
            {!isNew && <DeleteButton onConfirm={onDelete} />}
            <PrimaryButton disabled={!!problem} onClick={() => onSave(d)}>
              {isNew ? "Zakaži" : "Sačuvaj"}
            </PrimaryButton>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 pt-2">
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2">
          <Label label="Dan">
            <input
              type="date"
              value={d.day}
              onChange={(e) => set({ day: e.target.value })}
              className={inputCls}
              style={inputStyle}
            />
          </Label>
          <Label label="Od">
            <input
              type="time"
              step={1800}
              value={d.start}
              onChange={(e) => set({ start: e.target.value })}
              className={inputCls}
              style={inputStyle}
            />
          </Label>
          <Label label="Do">
            <input
              type="time"
              step={1800}
              value={d.end}
              onChange={(e) => set({ end: e.target.value })}
              className={inputCls}
              style={inputStyle}
            />
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
        <Label label="Lokacija">
          <input
            value={d.location}
            onChange={(e) => set({ location: e.target.value })}
            placeholder="Studio, kod klijenta…"
            className={inputCls}
            style={inputStyle}
          />
        </Label>

        <div className="grid gap-1.5">
          <span className="text-[13px] font-medium" style={{ color: OS.muted }}>
            Skripte za snimanje
          </span>
          {offered.length === 0 && (
            <p
              className="rounded-xl px-3 py-3 text-[13px]"
              style={{ color: OS.faint, border: `1px dashed ${OS.line}` }}
            >
              Nijedna skripta ne čeka termin. Skripte u fazi „To schedule“ se
              pojavljuju ovde.
            </p>
          )}
          <ul
            className="overflow-hidden rounded-xl"
            style={{ border: `1px solid ${OS.line}` }}
          >
            {offered.map((s) => {
              const on = d.scriptIds.includes(s.id);
              const stage = stages.find((x) => x.id === s.stage);
              const saved = !isNew && initial.scriptIds.includes(s.id);
              return (
                <li
                  key={s.id}
                  className="flex items-center gap-3 border-b px-3 py-2.5 last:border-b-0"
                  style={{ borderColor: OS.line, background: OS.bg }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      set({
                        scriptIds: on
                          ? d.scriptIds.filter((x) => x !== s.id)
                          : [...d.scriptIds, s.id],
                      })
                    }
                    className="grid size-[22px] shrink-0 place-items-center rounded-md"
                    style={{
                      border: `1.5px solid ${on ? OS.text : OS.faint}`,
                      background: on ? OS.text : "transparent",
                    }}
                    aria-pressed={on}
                    aria-label={on ? "Skini iz termina" : "Dodaj u termin"}
                  >
                    {on && (
                      <Check
                        className="size-3.5"
                        strokeWidth={3}
                        style={{ color: OS.bg }}
                      />
                    )}
                  </button>
                  <Link
                    href={`/os/skripte/${s.id}`}
                    className="min-w-0 flex-1 truncate text-[14px]"
                    style={{ color: OS.text }}
                  >
                    {s.title}
                  </Link>
                  {saved && on ? (
                    <button
                      type="button"
                      // Snimljeno je jednosmerno: skripta je već otišla na montažu.
                      onClick={() => !s.recorded_at && onRecorded(s.id)}
                      disabled={!!s.recorded_at}
                      className="h-7 shrink-0 rounded-full px-2.5 text-[12px] font-semibold active:scale-[0.97]"
                      style={
                        s.recorded_at
                          ? { background: `${STATE.ok}24`, color: STATE.ok }
                          : { background: OS.surface2, color: OS.muted }
                      }
                    >
                      {s.recorded_at ? "Snimljeno ✓" : "Označi snimljeno"}
                    </button>
                  ) : (
                    <StagePill stage={stage} team={team} />
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <Label label="Beleške">
          <textarea
            value={d.notes}
            onChange={(e) => set({ notes: e.target.value })}
            rows={2}
            className="w-full resize-none rounded-xl px-3.5 py-2.5 text-[15px] outline-none"
            style={inputStyle}
          />
        </Label>
      </div>
    </Sheet>
  );
}
