import { getSession, osServer } from "@/lib/os/supabase";
import { PROJECT_SELECT } from "@/lib/os/stages";
import TasksView from "@/components/os/tasks/TasksView";
import type { ProjectRef, Task } from "@/lib/os/types";

export const metadata = { title: "Taskovi" };

export default async function TasksPage() {
  const { me, team } = await getSession();
  const sb = await osServer();
  // Otvoreni taskovi + ono što je završeno u poslednje dve nedelje.
  const since = new Date(Date.now() - 14 * 86400000).toISOString();
  const [tasks, projects] = await Promise.all([
    sb
      .from("tasks")
      .select("*")
      .or(`status.neq.done,completed_at.gte.${since}`)
      .order("position"),
    sb
      .from("projects")
      .select(PROJECT_SELECT)
      .neq("status", "done")
      .order("created_at"),
  ]);

  return (
    <TasksView
      initial={(tasks.data ?? []) as Task[]}
      projects={(projects.data ?? []) as unknown as ProjectRef[]}
      team={team}
      me={me!}
    />
  );
}
