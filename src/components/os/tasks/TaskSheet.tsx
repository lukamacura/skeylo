"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import Sheet from "@/components/os/Sheet";
import {
  DeleteButton,
  Label,
  PersonPicker,
  PrimaryButton,
  Segmented,
  inputCls,
  inputStyle,
} from "@/components/os/fields";
import { ProjectPicker } from "@/components/os/scripts/pickers";
import { addDays, isoDay } from "@/lib/os/dates";
import { OS } from "@/lib/os/theme";
import type { Person, ProjectRef, Task, TaskStatus } from "@/lib/os/types";

export type TaskDraft = Pick<
  Task,
  "title" | "notes" | "assignee_id" | "status" | "due_on" | "project_id"
>;

const STATUSES: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "doing", label: "U toku" },
  { id: "done", label: "Gotovo" },
];

export default function TaskSheet({
  open,
  task,
  defaults,
  team,
  projects,
  onProjectCreated,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  /** Postojeći task; bez njega sheet pravi novi. */
  task: Task | null;
  defaults: TaskDraft;
  team: Person[];
  projects: ProjectRef[];
  onProjectCreated: (p: ProjectRef) => void;
  onClose: () => void;
  onSave: (draft: TaskDraft) => void;
  onDelete: () => void;
}) {
  const [d, setD] = useState<TaskDraft>(defaults);
  useEffect(() => {
    if (open) setD(task ? { ...task } : defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task]);

  const today = isoDay();
  const set = (p: Partial<TaskDraft>) => setD((x) => ({ ...x, ...p }));

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={task ? "Task" : "Novi task"}
      footer={
        <div className="flex gap-2">
          {task && <DeleteButton onConfirm={onDelete} />}
          <PrimaryButton
            disabled={!d.title.trim()}
            onClick={() => onSave({ ...d, title: d.title.trim() })}
          >
            {task ? "Sačuvaj" : "Dodaj task"}
          </PrimaryButton>
        </div>
      }
    >
      <div className="grid gap-4 pt-2">
        <input
          value={d.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Šta treba uraditi?"
          autoFocus={!task}
          className={`${inputCls} text-[16px] font-medium`}
          style={inputStyle}
        />
        {task?.script_id && (
          <Link
            href={`/os/skripte/${task.script_id}`}
            className="inline-flex w-fit items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px]"
            style={{
              background: OS.bg,
              border: `1px solid ${OS.line}`,
              color: OS.muted,
            }}
          >
            <FileText className="size-4" />
            Otvori skriptu · završen task je šalje u sledeću fazu
          </Link>
        )}
        <Label label="Ko radi">
          <PersonPicker
            team={team}
            value={d.assignee_id}
            onChange={(assignee_id) => set({ assignee_id })}
            allowNone
          />
        </Label>
        <Label label="Rok">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: "Danas", v: today },
              { label: "Sutra", v: addDays(today, 1) },
              { label: "Za nedelju", v: addDays(today, 7) },
              { label: "Bez roka", v: null },
            ].map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => set({ due_on: o.v })}
                className="h-9 rounded-full px-3 text-[14px] active:scale-[0.97]"
                style={{
                  background: d.due_on === o.v ? OS.surface2 : OS.bg,
                  border: `1px solid ${d.due_on === o.v ? OS.lineStrong : OS.line}`,
                  color: d.due_on === o.v ? OS.text : OS.muted,
                }}
              >
                {o.label}
              </button>
            ))}
            <input
              type="date"
              value={d.due_on ?? ""}
              onChange={(e) => set({ due_on: e.target.value || null })}
              className="h-9 rounded-full px-3 text-[14px] outline-none"
              style={inputStyle}
            />
          </div>
        </Label>
        <Label label="Status">
          <Segmented
            id="task-status"
            value={d.status}
            options={STATUSES}
            onChange={(status) => set({ status })}
          />
        </Label>
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
        <Label label="Beleške">
          <textarea
            value={d.notes}
            onChange={(e) => set({ notes: e.target.value })}
            rows={3}
            className="w-full resize-none rounded-xl px-3.5 py-2.5 text-[15px] outline-none"
            style={inputStyle}
          />
        </Label>
      </div>
    </Sheet>
  );
}
