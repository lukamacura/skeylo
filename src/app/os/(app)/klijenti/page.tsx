import { osServer } from "@/lib/os/supabase";
import ClientsView, {
  type ProjectStats,
} from "@/components/os/clients/ClientsView";
import type { Client, Project } from "@/lib/os/types";

export const metadata = { title: "Klijenti" };

export default async function ClientsPage() {
  const sb = await osServer();
  const [clients, projects, scripts, tasks, tx] = await Promise.all([
    sb.from("clients").select("*").order("name"),
    sb.from("projects").select("*").order("created_at"),
    sb.from("scripts").select("project_id, stage"),
    sb.from("tasks").select("project_id").neq("status", "done"),
    sb.from("transactions").select("project_id, kind, amount"),
  ]);

  const stats: Record<string, ProjectStats> = {};
  const at = (id: string | null) =>
    id
      ? (stats[id] ??= {
          scripts: 0,
          published: 0,
          openTasks: 0,
          income: 0,
          expense: 0,
        })
      : null;
  (scripts.data ?? []).forEach((s) => {
    const x = at(s.project_id);
    if (!x) return;
    x.scripts++;
    if (s.stage === "published") x.published++;
  });
  (tasks.data ?? []).forEach((t) => {
    const x = at(t.project_id);
    if (x) x.openTasks++;
  });
  (tx.data ?? []).forEach((t) => {
    const x = at(t.project_id);
    if (x) x[t.kind === "income" ? "income" : "expense"] += Number(t.amount);
  });

  return (
    <ClientsView
      clients={(clients.data ?? []) as Client[]}
      projects={(projects.data ?? []) as Project[]}
      stats={stats}
    />
  );
}
