// Redovi iz šeme `os`. Prate migraciju os_foundation.

export type Person = {
  id: string;
  user_id: string | null;
  email: string;
  slug: string;
  name: string;
  role: string;
  color: string;
  avatar: string | null;
  fixed_share: number | null;
  created_at: string;
};

export type ScriptStageId =
  | "idea"
  | "write"
  | "schedule"
  | "record"
  | "edit"
  | "upload"
  | "published";

export type ScriptStage = {
  id: ScriptStageId;
  label: string;
  position: number;
  owner_id: string | null;
  task_verb: string | null;
};

export type TaskStatus = "todo" | "doing" | "done";

export type Task = {
  id: string;
  title: string;
  notes: string;
  assignee_id: string | null;
  status: TaskStatus;
  due_on: string | null;
  project_id: string | null;
  script_id: string | null;
  script_stage: ScriptStageId | null;
  position: number;
  created_by: string | null;
  completed_at: string | null;
  created_at: string;
};

export type Client = {
  id: string;
  name: string;
  notes: string;
  active: boolean;
  created_at: string;
};

export type ProjectStatus = "active" | "paused" | "done";

export type Project = {
  id: string;
  client_id: string;
  name: string;
  status: ProjectStatus;
  starts_on: string | null;
  ends_on: string | null;
  created_at: string;
};

/** Projekat sa imenom klijenta, za birače i oznake. */
export type ProjectRef = Pick<Project, "id" | "name" | "status"> & {
  client: Pick<Client, "id" | "name">;
};

export type Script = {
  id: string;
  project_id: string | null;
  title: string;
  body: string;
  stage: ScriptStageId;
  shoot_id: string | null;
  recorded_at: string | null;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ScriptCard = Omit<Script, "body">;

export type Shoot = {
  id: string;
  project_id: string | null;
  starts_at: string;
  ends_at: string;
  location: string;
  notes: string;
  created_by: string | null;
  created_at: string;
};

export type Block = {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string;
  created_by: string | null;
  created_at: string;
};

export type Transaction = {
  id: string;
  kind: "income" | "expense";
  amount: number;
  occurred_on: string;
  project_id: string | null;
  category: string;
  note: string;
  created_by: string | null;
  created_at: string;
};

export type Goal = {
  id: string;
  title: string;
  deadline: string | null;
  owner_id: string | null;
  metric: "income" | "profit" | null;
  target: number | null;
  done_at: string | null;
  created_at: string;
};

export type GoalStep = {
  id: string;
  goal_id: string;
  title: string;
  done: boolean;
  position: number;
  done_at: string | null;
};
