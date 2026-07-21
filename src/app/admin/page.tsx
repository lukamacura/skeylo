import { supabaseAdmin, type SkeyloLead } from "@/lib/supabase-admin";
import LeadsTable from "@/components/admin/LeadsTable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data, error } = await supabaseAdmin
    .from("skeylo_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-foreground">
        <h1 className="text-xl font-semibold">Admin panel</h1>
        <p className="mt-2 text-sm text-red-600">
          Greška pri učitavanju: {error.message}
        </p>
      </div>
    );
  }

  return <LeadsTable leads={(data ?? []) as SkeyloLead[]} />;
}
