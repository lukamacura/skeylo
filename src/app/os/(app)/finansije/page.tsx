import { getSession, osServer } from "@/lib/os/supabase";
import { PROJECT_SELECT } from "@/lib/os/stages";
import { addMonths, isoDay } from "@/lib/os/dates";
import FinanceView, {
  type SplitRow,
} from "@/components/os/finance/FinanceView";
import type { ProjectRef, Transaction } from "@/lib/os/types";

export const metadata = { title: "Finansije" };

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const month = m && /^\d{4}-\d{2}$/.test(m) ? m : isoDay().slice(0, 7);
  const { team } = await getSession();
  const sb = await osServer();

  const from = `${addMonths(month, -5)}-01`;
  const to = `${addMonths(month, 1)}-01`;
  const [tx, split, projects] = await Promise.all([
    sb
      .from("transactions")
      .select("*")
      .gte("occurred_on", from)
      .lt("occurred_on", to)
      .order("occurred_on", { ascending: false }),
    sb
      .from("monthly_split")
      .select("person_id, share, payout")
      .eq("month", `${month}-01`),
    sb.from("projects").select(PROJECT_SELECT).order("created_at"),
  ]);

  return (
    <FinanceView
      month={month}
      transactions={(tx.data ?? []) as Transaction[]}
      split={(split.data ?? []) as SplitRow[]}
      projects={(projects.data ?? []) as unknown as ProjectRef[]}
      team={team}
    />
  );
}
