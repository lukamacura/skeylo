// Napredak i stanje cilja. Deli ih stranica ciljeva i dashboard (server).
import { daysBetween, isoDay } from "@/lib/os/dates";
import type { Goal, GoalStep } from "@/lib/os/types";

export type Metrics = { income: number; profit: number };

/** Stanje cilja po roku: ostvaren (zeleno), prošao rok (crveno), ≤ 7 dana (žuto). */
export function goalState(g: Goal, progress: number, today = isoDay()) {
  if (g.done_at || progress >= 1) return "ok" as const;
  if (!g.deadline) return null;
  const left = daysBetween(today, g.deadline);
  if (left < 0) return "late" as const;
  if (left <= 7) return "attention" as const;
  return null;
}

export function goalProgress(g: Goal, steps: GoalStep[], metrics: Metrics) {
  const mine = steps.filter((s) => s.goal_id === g.id);
  const stepP = mine.length
    ? mine.filter((s) => s.done).length / mine.length
    : null;
  const metricP =
    g.metric && g.target
      ? Math.max(0, Math.min(1, metrics[g.metric] / Number(g.target)))
      : null;
  if (g.done_at) return 1;
  if (stepP !== null && metricP !== null) return Math.min(stepP, metricP);
  return stepP ?? metricP ?? 0;
}
