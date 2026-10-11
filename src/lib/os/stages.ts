import { STATE } from "@/lib/os/theme";
import type { Person, ScriptStage } from "@/lib/os/types";

/** Boja faze = boja osobe na potezu; objavljeno je zeleno (gotovo). */
export function stageColor(stage: ScriptStage | undefined, team: Person[]) {
  if (!stage) return STATE.idle;
  if (stage.id === "published") return STATE.ok;
  return team.find((p) => p.id === stage.owner_id)?.color ?? STATE.idle;
}

export function stageOwner(stage: ScriptStage | undefined, team: Person[]) {
  return stage ? team.find((p) => p.id === stage.owner_id) : undefined;
}

export function nextStage(stages: ScriptStage[], id: string) {
  const cur = stages.find((s) => s.id === id);
  return cur ? stages.find((s) => s.position === cur.position + 1) : undefined;
}

/** Projekat sa klijentom: "ILS · Oktobar kampanja". */
export const PROJECT_SELECT = "id, name, status, client:clients(id, name)";
