import { notFound } from "next/navigation";
import { getSession, osServer } from "@/lib/os/supabase";
import { PROJECT_SELECT } from "@/lib/os/stages";
import ScriptEditor from "@/components/os/scripts/ScriptEditor";
import type { ProjectRef, Script, ScriptStage } from "@/lib/os/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = await osServer();
  const { data } = await sb
    .from("scripts")
    .select("title")
    .eq("id", id)
    .maybeSingle();
  return { title: data?.title ?? "Skripta" };
}

export default async function ScriptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { team } = await getSession();
  const sb = await osServer();
  const [script, stages, projects] = await Promise.all([
    sb.from("scripts").select("*").eq("id", id).maybeSingle(),
    sb.from("script_stages").select("*").order("position"),
    sb.from("projects").select(PROJECT_SELECT).order("created_at"),
  ]);
  if (!script.data) notFound();

  return (
    <ScriptEditor
      key={id}
      initial={script.data as Script}
      stages={(stages.data ?? []) as ScriptStage[]}
      projects={(projects.data ?? []) as unknown as ProjectRef[]}
      team={team}
    />
  );
}
