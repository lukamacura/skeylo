import { getSession, osServer } from "@/lib/os/supabase";
import { PROJECT_SELECT } from "@/lib/os/stages";
import ScriptsBoard from "@/components/os/scripts/ScriptsBoard";
import type { ProjectRef, ScriptCard, ScriptStage } from "@/lib/os/types";

export const metadata = { title: "Skripte" };

export default async function ScriptsPage() {
  const { me, team } = await getSession();
  const sb = await osServer();
  const [scripts, stages, projects] = await Promise.all([
    sb
      .from("scripts")
      .select(
        "id, project_id, title, stage, shoot_id, recorded_at, published_at, created_by, created_at, updated_at",
      )
      .order("updated_at", { ascending: false }),
    sb.from("script_stages").select("*").order("position"),
    sb
      .from("projects")
      .select(PROJECT_SELECT)
      .neq("status", "done")
      .order("created_at"),
  ]);

  return (
    <ScriptsBoard
      scripts={(scripts.data ?? []) as ScriptCard[]}
      stages={(stages.data ?? []) as ScriptStage[]}
      projects={(projects.data ?? []) as unknown as ProjectRef[]}
      team={team}
      me={me!}
    />
  );
}
