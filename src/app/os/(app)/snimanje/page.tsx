import { getSession, osServer } from "@/lib/os/supabase";
import { PROJECT_SELECT } from "@/lib/os/stages";
import CalendarView from "@/components/os/shoots/CalendarView";
import type { ProjectRef, ScriptCard, ScriptStage } from "@/lib/os/types";

export const metadata = { title: "Snimanje" };

export default async function ShootsPage() {
  const { me, team } = await getSession();
  const sb = await osServer();
  const [scripts, stages, projects] = await Promise.all([
    sb
      .from("scripts")
      .select(
        "id, project_id, title, stage, shoot_id, recorded_at, published_at, created_by, created_at, updated_at",
      )
      .neq("stage", "published"),
    sb.from("script_stages").select("*").order("position"),
    sb.from("projects").select(PROJECT_SELECT).order("created_at"),
  ]);

  return (
    <CalendarView
      scripts={(scripts.data ?? []) as ScriptCard[]}
      stages={(stages.data ?? []) as ScriptStage[]}
      projects={(projects.data ?? []) as unknown as ProjectRef[]}
      team={team}
      me={me!}
    />
  );
}
