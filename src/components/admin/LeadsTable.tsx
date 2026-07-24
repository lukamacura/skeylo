"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PACKAGES } from "@/lib/packages";
import {
  LEAD_STATUSES,
  statusMeta,
  leadValue,
  leadTotal,
  sumRevenue,
  formatEur,
  type LeadStatus,
  type RevenueEntry,
} from "@/lib/crm";
import { cn } from "@/lib/utils";
import type { SkeyloLead } from "@/lib/supabase-admin";
import {
  Search,
  Phone,
  MessageCircle,
  LogOut,
  Trash2,
  ChevronDown,
  StickyNote,
  Plus,
  TrendingUp,
  X,
} from "lucide-react";

const GOLD = "#f0b656";

const ADMIN_ACCENTS: Record<string, string> = {
  "creative-engine": "#6366f1",
  "profit-accelerator": "#10b981",
  "profit-za-tebe": "#d87928",
};

function pkgFor(type: string) {
  const slug = type.replace(/-quiz$/, "");
  return PACKAGES.find((p) => p.slug === slug);
}
function typeName(type: string) {
  return pkgFor(type)?.name ?? type;
}
function typeAccent(type: string) {
  const slug = type.replace(/-quiz$/, "");
  return ADMIN_ACCENTS[slug] ?? pkgFor(type)?.accent ?? GOLD;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Ime i prezime",
  brand: "Brend",
  registered: "Registrovana firma",
  margin: "Profitna marža",
  capacity: "Spreman za veći kapacitet",
  agencies: "Sarađivao sa agencijama",
  results: "Rezultati dosadašnje saradnje",
  phone: "Telefon",
  contact: "Kanal kontakta",
};

const FIELD_ORDER = [
  "name",
  "brand",
  "registered",
  "margin",
  "capacity",
  "agencies",
  "results",
  "phone",
  "contact",
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TypeBadge({ type }: { type: string }) {
  const accent = typeAccent(type);
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: `${accent}22`, color: accent }}
    >
      {typeName(type)}
    </span>
  );
}

/** Pipeline dropdown - jezgro CRM-a. Krupni tap-target na mobilnom. */
function StatusSelect({
  status,
  pending,
  onChange,
}: {
  status: string;
  pending?: boolean;
  onChange: (s: LeadStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = statusMeta(status);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        disabled={pending}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
        style={{
          background: `${meta.color}1a`,
          color: meta.color,
          borderColor: `${meta.color}55`,
        }}
      >
        <span
          className="size-2.5 rounded-full"
          style={{ background: meta.color }}
        />
        {meta.label}
        <ChevronDown className="size-3.5 opacity-70" />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            aria-hidden
          />
          <div
            className="absolute left-0 z-50 mt-1 w-52 overflow-hidden rounded-xl border border-foreground/15 bg-background shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {LEAD_STATUSES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (s.id !== status) onChange(s.id);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm transition-colors hover:bg-foreground/5",
                  s.id === status && "bg-foreground/5 font-medium",
                )}
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: s.color }}
                />
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function LeadsTable({ leads }: { leads: SkeyloLead[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // Lokalni pipeline state (optimistički).
  const [status, setStatus] = useState<Record<string, string>>(() =>
    Object.fromEntries(leads.map((l) => [l.id, l.status])),
  );
  const [notesMap, setNotesMap] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(leads.map((l) => [l.id, l.notes])),
  );
  // Lokalni state za dodatne prihode (optimistički), po lead-u.
  const [revenueMap, setRevenueMap] = useState<Record<string, RevenueEntry[]>>(
    () => Object.fromEntries(leads.map((l) => [l.id, l.revenue ?? []])),
  );
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const visibleLeads = useMemo(
    () => leads.filter((l) => !deletedIds.has(l.id)),
    [leads, deletedIds],
  );

  const active = useMemo(
    () => visibleLeads.find((l) => l.id === activeId) ?? null,
    [visibleLeads, activeId],
  );

  async function patchLead(id: string, payload: Record<string, unknown>) {
    setPending((m) => ({ ...m, [id]: true }));
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      return true;
    } catch {
      return false;
    } finally {
      setPending((m) => ({ ...m, [id]: false }));
    }
  }

  async function changeStatus(id: string, next: LeadStatus) {
    const prev = status[id];
    setStatus((m) => ({ ...m, [id]: next }));
    const ok = await patchLead(id, { status: next });
    if (!ok) setStatus((m) => ({ ...m, [id]: prev }));
  }

  async function saveRevenue(id: string, next: RevenueEntry[]) {
    const prev = revenueMap[id] ?? [];
    setRevenueMap((m) => ({ ...m, [id]: next }));
    const ok = await patchLead(id, { revenue: next });
    if (!ok) setRevenueMap((m) => ({ ...m, [id]: prev }));
  }

  async function deleteLead(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setDeletedIds((s) => new Set(s).add(id));
      setActiveId(null);
    } catch {
      // no-op
    } finally {
      setDeleting(false);
    }
  }

  const types = useMemo(() => {
    const set = new Set(visibleLeads.map((l) => l.type));
    return Array.from(set);
  }, [visibleLeads]);

  // ---- Dashboard metrike ----
  const stats = useMemo(() => {
    const byStatus: Record<string, number> = {};
    let pipeline = 0;
    let won = 0;
    let realized = 0;
    let extra = 0;
    let hot = 0;
    for (const l of visibleLeads) {
      const s = status[l.id] ?? l.status;
      byStatus[s] = (byStatus[s] ?? 0) + 1;
      const base = leadValue({ type: l.type, value: l.value });
      const rev = sumRevenue(revenueMap[l.id] ?? l.revenue);
      const meta = statusMeta(s);
      if (meta.active) pipeline += base;
      if (s === "won") {
        won += base;
        realized += base;
      }
      // Dodatni prihodi su već naplaćen novac - uvek se broje u ostvareno.
      realized += rev;
      extra += rev;
      if (s === "qualified" || s === "proposal") hot += 1;
    }
    return { byStatus, pipeline, won, realized, extra, hot };
  }, [visibleLeads, status, revenueMap]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return visibleLeads.filter((l) => {
      if (filter !== "all" && l.type !== filter) return false;
      if (statusFilter !== "all" && (status[l.id] ?? l.status) !== statusFilter)
        return false;
      if (!query) return true;
      return (
        (l.name ?? "").toLowerCase().includes(query) ||
        (l.brand ?? "").toLowerCase().includes(query) ||
        (l.phone ?? "").toLowerCase().includes(query)
      );
    });
  }, [visibleLeads, filter, statusFilter, q, status]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 text-foreground sm:py-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Skeylo CRM</h1>
          <p className="text-sm text-muted-foreground">
            Ukupno {visibleLeads.length} · prikazano {filtered.length}
          </p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Button
            className="h-11 flex-1 text-base sm:h-9 sm:flex-none sm:text-sm"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-5 sm:size-4" />
            Novi lead
          </Button>
          <Button
            variant="outline"
            className="h-11 text-base sm:h-9 sm:text-sm"
            onClick={logout}
          >
            <LogOut className="size-5 sm:size-4" />
            <span className="hidden sm:inline">Odjava</span>
          </Button>
        </div>
      </div>

      {/* Dashboard strip */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="U pregovorima"
          value={formatEur(stats.pipeline)}
          accent={GOLD}
        />
        <StatCard
          label="Ostvareno"
          value={formatEur(stats.realized)}
          accent="#10b981"
        />
        <StatCard
          label="Dodatni prihod"
          value={formatEur(stats.extra)}
          accent="#6366f1"
        />
        <StatCard
          label="Kvalifikovani"
          value={String(stats.hot)}
          accent="#a855f7"
          onClick={() => setStatusFilter("qualified")}
        />
      </div>

      {/* Kontrole */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <FilterChip
            label="Svi"
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          {LEAD_STATUSES.map((s) => (
            <FilterChip
              key={s.id}
              label={s.label}
              accent={s.color}
              active={statusFilter === s.id}
              onClick={() => setStatusFilter(s.id)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <FilterChip
              label="Svi paketi"
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            {types.map((t) => (
              <FilterChip
                key={t}
                label={typeName(t)}
                accent={typeAccent(t)}
                active={filter === t}
                onClick={() => setFilter(t)}
              />
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pretraga: ime, brend, telefon"
              className="h-11 pl-9 text-base sm:h-9 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">
          Nema leadova.
        </p>
      ) : (
        <>
          {/* Desktop tabela */}
          <div className="mt-6 hidden overflow-visible rounded-xl border border-foreground/10 md:block">
            <table className="w-full text-sm">
              <thead className="bg-foreground/5 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Datum</th>
                  <th className="px-4 py-3 font-medium">Ime</th>
                  <th className="px-4 py-3 font-medium">Brend</th>
                  <th className="px-4 py-3 font-medium">Paket</th>
                  <th className="px-4 py-3 font-medium">Vrednost</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  return (
                    <tr
                      key={l.id}
                      onClick={() => setActiveId(l.id)}
                      className="cursor-pointer border-t border-foreground/10 transition-colors hover:bg-[#f0b656]/5"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {fmtDate(l.created_at)}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <span className="inline-flex items-center gap-2">
                          {l.name ?? "-"}
                          {notesMap[l.id] && (
                            <StickyNote className="size-3.5 text-muted-foreground" />
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">{l.brand ?? "-"}</td>
                      <td className="px-4 py-3">
                        <TypeBadge type={l.type} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          {formatEur(
                            leadTotal({
                              type: l.type,
                              value: l.value,
                              revenue: revenueMap[l.id] ?? l.revenue,
                            }),
                          )}
                          {sumRevenue(revenueMap[l.id] ?? l.revenue) > 0 && (
                            <TrendingUp className="size-3.5 text-emerald-500" />
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusSelect
                          status={status[l.id] ?? l.status}
                          pending={pending[l.id]}
                          onChange={(s) => changeStatus(l.id, s)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobilne kartice */}
          <div className="mt-6 grid gap-3 md:hidden">
            {filtered.map((l) => {
              return (
                <div
                  key={l.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveId(l.id)}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && setActiveId(l.id)
                  }
                  className="cursor-pointer rounded-2xl border border-foreground/10 p-4 text-left transition-colors active:bg-[#f0b656]/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-base font-semibold">
                      {l.name ?? "-"}
                      {notesMap[l.id] && (
                        <StickyNote className="size-4 text-muted-foreground" />
                      )}
                    </span>
                    <TypeBadge type={l.type} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {l.brand ?? "-"} ·{" "}
                    <span className="inline-flex items-center gap-1 font-medium text-foreground/70">
                      {formatEur(
                        leadTotal({
                          type: l.type,
                          value: l.value,
                          revenue: revenueMap[l.id] ?? l.revenue,
                        }),
                      )}
                      {sumRevenue(revenueMap[l.id] ?? l.revenue) > 0 && (
                        <TrendingUp className="size-3.5 text-emerald-500" />
                      )}
                    </span>
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="size-4" />
                      {l.phone ?? "-"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MessageCircle className="size-4" />
                      {l.contact ?? "-"}
                    </span>
                  </div>
                  <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                    <StatusSelect
                      status={status[l.id] ?? l.status}
                      pending={pending[l.id]}
                      onChange={(s) => changeStatus(l.id, s)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Detalj popup */}
      <LeadDialog
        lead={active}
        onClose={() => setActiveId(null)}
        status={active ? (status[active.id] ?? active.status) : "new"}
        pending={active ? pending[active.id] : false}
        notes={active ? (notesMap[active.id] ?? "") : ""}
        revenue={active ? (revenueMap[active.id] ?? active.revenue ?? []) : []}
        onStatus={(s) => active && changeStatus(active.id, s)}
        onNotesSaved={(id, v) => setNotesMap((m) => ({ ...m, [id]: v }))}
        onRevenueChange={(entries) => active && saveRevenue(active.id, entries)}
        onDelete={() => active && deleteLead(active.id)}
        deleting={deleting}
      />

      {/* Ručni unos leada */}
      <AddLeadDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setAddOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  onClick,
}: {
  label: string;
  value: string;
  accent: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 text-left transition-colors",
        onClick &&
          "cursor-pointer hover:bg-foreground/5 active:bg-foreground/10",
      )}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className="mt-1 text-2xl font-semibold tracking-tight"
        style={{ color: accent }}
      >
        {value}
      </p>
    </button>
  );
}

function FilterChip({
  label,
  active,
  accent = GOLD,
  onClick,
}: {
  label: string;
  active: boolean;
  accent?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors sm:py-1.5"
      style={
        active
          ? { background: `${accent}22`, color: accent, borderColor: accent }
          : undefined
      }
    >
      {label}
    </button>
  );
}

function LeadDialog({
  lead,
  onClose,
  status,
  pending,
  notes,
  revenue,
  onStatus,
  onNotesSaved,
  onRevenueChange,
  onDelete,
  deleting,
}: {
  lead: SkeyloLead | null;
  onClose: () => void;
  status: string;
  pending?: boolean;
  notes: string;
  revenue: RevenueEntry[];
  onStatus: (s: LeadStatus) => void;
  onNotesSaved: (id: string, value: string | null) => void;
  onRevenueChange: (entries: RevenueEntry[]) => void;
  onDelete: () => void;
  deleting?: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const rows = useMemo(() => {
    if (!lead) return [];
    const data = lead.data ?? {};
    const keys = Object.keys(data);
    const ordered = [
      ...FIELD_ORDER.filter((k) => keys.includes(k)),
      ...keys.filter((k) => !FIELD_ORDER.includes(k) && k !== "type"),
    ];
    return ordered
      .map((k) => ({
        key: k,
        label: FIELD_LABELS[k] ?? k,
        value: data[k],
      }))
      .filter((r) => r.value != null && String(r.value).trim() !== "");
  }, [lead]);

  return (
    <Dialog
      open={!!lead}
      onOpenChange={(o) => {
        if (!o) {
          setConfirmDelete(false);
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[92vh] gap-3 overflow-y-auto p-4 sm:max-w-lg sm:p-6">
        {lead && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                {lead.name ?? "Lead"}
              </DialogTitle>
              <DialogDescription>
                <TypeBadge type={lead.type} />
                <span className="ml-2 text-xs">{fmtDate(lead.created_at)}</span>
              </DialogDescription>
            </DialogHeader>

            {/* Pipeline kontrole */}
            <div className="grid gap-3 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusSelect
                  status={status}
                  pending={pending}
                  onChange={onStatus}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                  Ukupna vrednost
                </span>
                <span className="text-base font-semibold">
                  {formatEur(
                    leadTotal({
                      type: lead.type,
                      value: lead.value,
                      revenue,
                    }),
                  )}
                </span>
              </div>
              {sumRevenue(revenue) > 0 && (
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    Paket{" "}
                    {formatEur(
                      leadValue({ type: lead.type, value: lead.value }),
                    )}
                  </span>
                  <span className="text-emerald-500">
                    + {formatEur(sumRevenue(revenue))} dodatno
                  </span>
                </div>
              )}
            </div>

            {/* Dodatni prihodi - nove kreative, retainer, sledeći tier */}
            <RevenueEditor entries={revenue} onChange={onRevenueChange} />

            {/* Beleške - auto-save */}
            <NotesEditor
              leadId={lead.id}
              initial={notes}
              onSaved={onNotesSaved}
            />

            {/* Detalji iz kviza */}
            {rows.length > 0 && (
              <dl className="divide-y divide-foreground/10">
                {rows.map((r) => (
                  <div
                    key={r.key}
                    className="grid grid-cols-3 gap-3 py-2.5 text-sm"
                  >
                    <dt className="col-span-1 text-muted-foreground">
                      {r.label}
                    </dt>
                    <dd className="col-span-2 font-medium break-words">
                      {String(r.value)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {/* Akcije */}
            <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              {confirmDelete ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    variant="destructive"
                    className="h-11 w-full text-base sm:h-9 sm:w-auto sm:text-sm"
                    disabled={deleting}
                    onClick={onDelete}
                  >
                    <Trash2 className="size-4" />
                    {deleting ? "Brisanje..." : "Potvrdi brisanje"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-11 w-full text-base sm:h-9 sm:w-auto sm:text-sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Otkaži
                  </Button>
                </div>
              ) : (
                <Button
                  className="h-11 w-full cursor-pointer bg-red-500/20 text-base text-red-600 hover:bg-red-500/30 hover:text-red-600 sm:h-9 sm:w-auto sm:text-sm"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-4" />
                  Obriši
                </Button>
              )}
              <Button
                variant="outline"
                className="h-11 w-full cursor-pointer border border-white/20 text-base text-white hover:bg-white/10 sm:h-9 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Zatvori
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Jedno polje za beleške sa debounce auto-save. */
function NotesEditor({
  leadId,
  initial,
  onSaved,
}: {
  leadId: string;
  initial: string;
  onSaved: (id: string, value: string | null) => void;
}) {
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const savedRef = useRef(initial);
  const valueRef = useRef(initial);
  const leadIdRef = useRef(leadId);
  const onSavedRef = useRef(onSaved);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  onSavedRef.current = onSaved;

  // Reset kad se otvori drugi lead.
  useEffect(() => {
    setValue(initial);
    valueRef.current = initial;
    savedRef.current = initial;
    leadIdRef.current = leadId;
    setState("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  async function save(next: string) {
    if (next === savedRef.current) return;
    setState("saving");
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: next }),
      });
      if (!res.ok) throw new Error();
      savedRef.current = next;
      onSavedRef.current(leadId, next || null);
      setState("saved");
    } catch {
      setState("idle");
    }
  }

  function onChange(next: string) {
    setValue(next);
    valueRef.current = next;
    setState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save(next), 700);
  }

  // Flush samo na stvarni unmount (zatvaranje popup-a).
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (valueRef.current !== savedRef.current) {
        void fetch(`/api/admin/leads/${leadIdRef.current}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: valueRef.current }),
          keepalive: true,
        });
        onSavedRef.current(leadIdRef.current, valueRef.current || null);
      }
    };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-medium">
          <StickyNote className="size-4" />
          Beleške
        </h3>
        <span className="text-xs text-muted-foreground">
          {state === "saving"
            ? "Čuva se…"
            : state === "saved"
              ? "Sačuvano ✓"
              : ""}
        </span>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          if (timer.current) clearTimeout(timer.current);
          void save(value);
        }}
        placeholder="Beleškice da se zapamti..."
        rows={4}
        className="mt-2 text-base sm:text-sm"
      />
    </div>
  );
}

/** Dodatni prihodi po klijentu - lista line-items + dugme za standalone popup. */
function RevenueEditor({
  entries,
  onChange,
}: {
  entries: RevenueEntry[];
  onChange: (entries: RevenueEntry[]) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries],
  );

  function addEntry(entry: RevenueEntry) {
    onChange([...entries, entry]);
  }

  function remove(id: string) {
    onChange(entries.filter((e) => e.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-medium">
          <TrendingUp className="size-4" />
          Dodatni prihodi
        </h3>
        {sumRevenue(entries) > 0 && (
          <span className="text-xs font-semibold text-emerald-500">
            {formatEur(sumRevenue(entries))}
          </span>
        )}
      </div>

      {sorted.length > 0 && (
        <ul className="mt-2 divide-y divide-foreground/10 rounded-xl border border-foreground/10">
          {sorted.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-3 px-3 py-2.5 text-sm"
            >
              <span className="w-20 shrink-0 text-xs text-muted-foreground">
                {new Date(e.date).toLocaleDateString("sr-RS", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </span>
              <span className="flex-1 truncate font-medium">{e.label}</span>
              <span className="shrink-0 font-semibold">
                {formatEur(e.amount)}
              </span>
              <button
                type="button"
                onClick={() => remove(e.id)}
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                aria-label="Obriši prihod"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => setAddOpen(true)}
        className="mt-2 h-11 w-full text-base sm:h-9 sm:text-sm hover:bg-green-500/20 cursor-pointer"
      >
        <Plus className="size-4" />
        Dodaj prihod
      </Button>

      <AddRevenueDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(entry) => {
          addEntry(entry);
          setAddOpen(false);
        }}
      />
    </div>
  );
}

/** Standalone popup za unos jednog dodatnog prihoda. */
function AddRevenueDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: RevenueEntry) => void;
}) {
  const today = () => new Date().toISOString().slice(0, 10);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);

  function reset() {
    setLabel("");
    setAmount("");
    setDate(today());
  }

  const valid = label.trim() !== "" && Number(amount) > 0;

  function submit() {
    if (!valid) return;
    onAdd({
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      label: label.trim(),
      amount: Number(amount),
      date: date || today(),
    });
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="gap-3 p-4 sm:max-w-md sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="size-5 text-emerald-500" />
            Dodatni prihod
          </DialogTitle>
          <DialogDescription>
            Novac zarađen nakon prve prodaje - nove kreative, retainer, sledeći
            tier.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <Field label="Opis *">
            <Input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="npr. Nove kreative"
              className="h-11 text-base sm:h-9 sm:text-sm"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Iznos (€) *">
              <Input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="400"
                className="h-11 text-base sm:h-9 sm:text-sm"
              />
            </Field>
            <Field label="Datum">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 text-base sm:h-9 sm:text-sm"
              />
            </Field>
          </div>
        </div>

        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="outline"
            className="h-11 w-full text-base sm:h-9 sm:w-auto sm:text-sm"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Otkaži
          </Button>
          <Button
            className="h-11 w-full text-base sm:h-9 sm:w-auto sm:text-sm "
            disabled={!valid}
            onClick={submit}
          >
            <Plus className="size-4" />
            Dodaj prihod
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddLeadDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const empty = {
    type: `${PACKAGES[0]?.slug ?? ""}-quiz`,
    name: "",
    brand: "",
    phone: "",
    contact: "",
    status: "new" as LeadStatus,
    value: "",
  };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit() {
    if (!form.name.trim()) return;
    setSaving(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          name: form.name,
          brand: form.brand,
          phone: form.phone,
          contact: form.contact,
          status: form.status,
          value: form.value ? Number(form.value) : null,
        }),
      });
      if (!res.ok) throw new Error();
      setForm(empty);
      onCreated();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setForm(empty);
          setError(false);
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[92vh] gap-3 overflow-y-auto p-4 sm:max-w-lg sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">Novi lead</DialogTitle>
          <DialogDescription>Ručni unos u pipeline.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Ime i prezime *" className="sm:col-span-2">
            <Input
              className="h-11 text-base sm:h-9 sm:text-sm"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Marko Marković"
            />
          </Field>
          <Field label="Brend">
            <Input
              className="h-11 text-base sm:h-9 sm:text-sm"
              value={form.brand}
              onChange={(e) => set("brand", e.target.value)}
            />
          </Field>
          <Field label="Telefon">
            <Input
              className="h-11 text-base sm:h-9 sm:text-sm"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="Kanal kontakta">
            <Input
              className="h-11 text-base sm:h-9 sm:text-sm"
              value={form.contact}
              onChange={(e) => set("contact", e.target.value)}
              placeholder="WhatsApp, Instagram…"
            />
          </Field>
          <Field label="Paket">
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className="h-11 w-full rounded-md border border-foreground/15 bg-transparent px-2 text-base sm:h-9 sm:text-sm"
            >
              {PACKAGES.map((p) => (
                <option key={p.slug} value={`${p.slug}-quiz`}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value as LeadStatus)}
              className="h-11 w-full rounded-md border border-foreground/15 bg-transparent px-2 text-base sm:h-9 sm:text-sm"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Vrednost (€, opciono)" className="sm:col-span-2">
            <Input
              type="number"
              inputMode="numeric"
              className="h-11 text-base sm:h-9 sm:text-sm"
              value={form.value}
              onChange={(e) => set("value", e.target.value)}
              placeholder="Podrazumevano: cena paketa"
            />
          </Field>
        </div>

        {error && (
          <p className="text-xs text-red-500">
            Greška pri čuvanju. Pokušaj ponovo.
          </p>
        )}

        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="outline"
            className="h-11 w-full text-base sm:h-9 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            Otkaži
          </Button>
          <Button
            className="h-11 w-full text-base sm:h-9 sm:w-auto sm:text-sm"
            disabled={saving || !form.name.trim()}
            onClick={submit}
          >
            {saving ? "Čuvam…" : "Sačuvaj lead"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
