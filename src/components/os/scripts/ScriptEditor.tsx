"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, Trash2 } from "lucide-react";
import Editor from "./Editor";
import { OwnerChip, ProjectPicker, StagePicker } from "./pickers";
import { osBrowser } from "@/lib/os/supabase-browser";
import { nextStage, stageColor, stageOwner } from "@/lib/os/stages";
import { OS, STATE } from "@/lib/os/theme";
import type { Person, ProjectRef, Script, ScriptStage } from "@/lib/os/types";

type Save = "idle" | "saving" | "saved" | "error";
type Patch = Partial<Pick<Script, "title" | "body" | "stage" | "project_id">>;

const dateFmt = new Intl.DateTimeFormat("sr-Latn-RS", {
  timeZone: "Europe/Belgrade",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default function ScriptEditor({
  initial,
  stages,
  team,
  projects: initialProjects,
}: {
  initial: Script;
  stages: ScriptStage[];
  team: Person[];
  projects: ProjectRef[];
}) {
  const router = useRouter();
  const [script, setScript] = useState(initial);
  const [projects, setProjects] = useState(initialProjects);
  const [save, setSave] = useState<Save>("idle");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Tekst se čuva sa zadrškom; sve izmene koje čekaju stoje u jednom paketu.
  const pending = useRef<Patch>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const patch = pending.current;
    if (!Object.keys(patch).length) return;
    pending.current = {};
    setSave("saving");
    const { data, error } = await osBrowser()
      .from("scripts")
      .update(patch)
      .eq("id", initial.id)
      .select("*")
      .single();
    if (error || !data) {
      pending.current = { ...patch, ...pending.current };
      setSave("error");
      return;
    }
    // Faza može da se promeni i u bazi (trigger), zato uzimamo red nazad,
    // ali ne gazimo tekst koji je korisnik u međuvremenu otkucao.
    setScript((s) => ({
      ...(data as Script),
      title: "title" in pending.current ? s.title : (data as Script).title,
      body: "body" in pending.current ? s.body : (data as Script).body,
    }));
    setSave("saved");
  }, [initial.id]);

  const queue = useCallback(
    (patch: Patch, now = false) => {
      pending.current = { ...pending.current, ...patch };
      setScript((s) => ({ ...s, ...patch }));
      setSave("saving");
      if (timer.current) clearTimeout(timer.current);
      if (now) void flush();
      else timer.current = setTimeout(() => void flush(), 700);
    },
    [flush],
  );

  useEffect(() => {
    const leave = (e: BeforeUnloadEvent) => {
      if (Object.keys(pending.current).length) {
        void flush();
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", leave);
    return () => {
      window.removeEventListener("beforeunload", leave);
      void flush();
    };
  }, [flush]);

  const stage = stages.find((s) => s.id === script.stage);
  const next = nextStage(stages, script.stage);
  const nextOwner = stageOwner(next, team);
  const nextColor = stageColor(next, team);

  async function remove() {
    if (!confirmDelete) return setConfirmDelete(true);
    pending.current = {};
    await osBrowser().from("scripts").delete().eq("id", initial.id);
    router.replace("/os/skripte");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[760px] px-4 pb-10 pt-[calc(12px+env(safe-area-inset-top))] md:px-10 md:pt-8">
      <div className="flex h-10 items-center justify-between">
        <Link
          href="/os/skripte"
          onClick={() => void flush()}
          className="-ml-2 inline-flex h-9 items-center gap-0.5 rounded-lg pl-1 pr-2.5 text-[15px] active:opacity-60"
          style={{ color: OS.muted }}
        >
          <ChevronLeft className="size-5" />
          Skripte
        </Link>
        <div className="flex items-center gap-2">
          <span
            className="text-[12px] tabular-nums"
            style={{ color: save === "error" ? STATE.late : OS.faint }}
          >
            {save === "saving"
              ? "Čuva se…"
              : save === "saved"
                ? "Sačuvano"
                : save === "error"
                  ? "Nije sačuvano"
                  : ""}
          </span>
          <button
            type="button"
            onClick={remove}
            onBlur={() => setConfirmDelete(false)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] transition-colors active:scale-[0.97]"
            style={{
              color: confirmDelete ? STATE.late : OS.faint,
              background: confirmDelete ? `${STATE.late}1a` : undefined,
            }}
            aria-label="Obriši skriptu"
          >
            <Trash2 className="size-4" />
            {confirmDelete && "Potvrdi brisanje"}
          </button>
        </div>
      </div>

      <TitleInput value={script.title} onChange={(title) => queue({ title })} />

      <dl
        className="mt-4 grid grid-cols-[96px_1fr] items-center gap-x-3 gap-y-1.5 text-[14px]"
        style={{ color: OS.muted }}
      >
        <dt>Faza</dt>
        <dd>
          <StagePicker
            value={script.stage}
            stages={stages}
            team={team}
            onChange={(s) => queue({ stage: s }, true)}
          />
        </dd>
        <dt>Na potezu</dt>
        <dd>
          <OwnerChip person={stageOwner(stage, team)} />
        </dd>
        <dt>Projekat</dt>
        <dd className="min-w-0 -ml-1.5">
          <ProjectPicker
            value={script.project_id}
            projects={projects}
            onChange={(project_id) => queue({ project_id }, true)}
            onCreated={(p) => setProjects((ps) => [...ps, p])}
          />
        </dd>
        {script.recorded_at && (
          <>
            <dt>Snimljeno</dt>
            <dd style={{ color: STATE.ok }}>
              {dateFmt.format(new Date(script.recorded_at))}
            </dd>
          </>
        )}
        {script.published_at && (
          <>
            <dt>Objavljeno</dt>
            <dd style={{ color: STATE.ok }}>
              {dateFmt.format(new Date(script.published_at))}
            </dd>
          </>
        )}
      </dl>

      {next && (
        <button
          type="button"
          onClick={() => queue({ stage: next.id }, true)}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl pl-3 pr-3.5 text-[14px] font-semibold transition-transform duration-100 active:scale-[0.97]"
          style={{ background: `${nextColor}1f`, color: nextColor }}
        >
          Pošalji dalje: {next.label}
          {nextOwner && (
            <span className="font-normal opacity-80">· {nextOwner.name}</span>
          )}
          <ArrowRight className="size-4" />
        </button>
      )}

      <div className="my-6 h-px" style={{ background: OS.line }} />

      <Editor initial={initial.body} onChange={(body) => queue({ body })} />
    </div>
  );
}

function TitleInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\n/g, " "))}
      onFocus={(e) => value === "Bez naslova" && e.target.select()}
      placeholder="Naslov"
      className="mt-4 w-full resize-none bg-transparent text-[30px] font-semibold leading-[1.15] outline-none placeholder:text-[#5a5a62] md:text-[38px]"
      style={{ letterSpacing: "-0.03em", color: OS.text }}
    />
  );
}
