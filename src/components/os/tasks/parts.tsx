"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { dueLabel, isoDay } from "@/lib/os/dates";
import { OS, SPRING, STATE } from "@/lib/os/theme";
import type { Task } from "@/lib/os/types";

/** Stanje roka: kasni (crveno), danas (žuto), ostalo neutralno. */
export function dueState(t: Pick<Task, "due_on" | "status">, today = isoDay()) {
  if (t.status === "done") return "ok" as const;
  if (!t.due_on) return null;
  if (t.due_on < today) return "late" as const;
  if (t.due_on === today) return "attention" as const;
  return null;
}

export function DueChip({ task }: { task: Pick<Task, "due_on" | "status"> }) {
  if (!task.due_on) return null;
  const s = dueState(task);
  const color = s && s !== "ok" ? STATE[s] : OS.muted;
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] font-medium tabular-nums"
      style={{ color }}
    >
      {s === "late" && (
        <span className="size-1.5 rounded-full" style={{ background: color }} />
      )}
      {dueLabel(task.due_on)}
    </span>
  );
}

/** Krug za štikliranje: puni se zelenom kad je gotovo. */
export function CheckCircle({
  done,
  onToggle,
  color,
}: {
  done: boolean;
  onToggle: () => void;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="relative grid size-[22px] shrink-0 place-items-center rounded-full transition-transform duration-100 active:scale-90"
      style={{ border: `1.75px solid ${done ? STATE.ok : color}` }}
      aria-label={done ? "Vrati u otvorene" : "Završi"}
      aria-pressed={done}
    >
      <motion.span
        className="absolute inset-[-1.75px] rounded-full"
        style={{ background: STATE.ok }}
        initial={false}
        animate={{ scale: done ? 1 : 0, opacity: done ? 1 : 0 }}
        transition={SPRING}
      />
      <motion.span
        className="relative"
        initial={false}
        animate={{ scale: done ? 1 : 0.4, opacity: done ? 1 : 0 }}
        transition={SPRING}
      >
        <Check className="size-3.5" strokeWidth={3} style={{ color: OS.bg }} />
      </motion.span>
    </button>
  );
}
