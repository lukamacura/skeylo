import { getSession, osServer } from "@/lib/os/supabase";
import { addMonths, isoDay } from "@/lib/os/dates";
import GoalsView from "@/components/os/goals/GoalsView";
import type { Goal, GoalStep } from "@/lib/os/types";

export const metadata = { title: "Ciljevi" };

export default async function GoalsPage() {
  const { me, team } = await getSession();
  const sb = await osServer();
  const month = isoDay().slice(0, 7);
  const [goals, steps, tx] = await Promise.all([
    sb
      .from("goals")
      .select("*")
      .order("deadline", { ascending: true, nullsFirst: false }),
    sb.from("goal_steps").select("*").order("position"),
    sb
      .from("transactions")
      .select("kind, amount")
      .gte("occurred_on", `${month}-01`)
      .lt("occurred_on", `${addMonths(month, 1)}-01`),
  ]);
  const income = (tx.data ?? [])
    .filter((t) => t.kind === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expense = (tx.data ?? [])
    .filter((t) => t.kind === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  return (
    <GoalsView
      goals={(goals.data ?? []) as Goal[]}
      steps={(steps.data ?? []) as GoalStep[]}
      metrics={{ income, profit: income - expense }}
      team={team}
      me={me!}
    />
  );
}
