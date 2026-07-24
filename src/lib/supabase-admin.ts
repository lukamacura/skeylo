// Server-only Supabase klijent sa service_role ključem.
// NIKAD ne importuj u client komponentu.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { RevenueEntry } from "@/lib/crm";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var.",
  );
}

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type SkeyloLead = {
  id: string;
  created_at: string;
  type: string;
  name: string | null;
  brand: string | null;
  phone: string | null;
  contact: string | null;
  data: Record<string, unknown>;
  meta: Record<string, unknown>;
  contacted: boolean;
  contacted_at: string | null;
  status: string;
  next_follow_up: string | null;
  value: number | null;
  revenue: RevenueEntry[] | null;
  notes: string | null;
};
