import type { Metadata, Viewport } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import LoginForm from "@/components/os/LoginForm";
import { OS } from "@/lib/os/theme";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Skeylo OS" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: OS.bg, viewportFit: "cover" };

export default async function OsLoginPage() {
  // Lica tima na ekranu prijave; samo javni deo (ime, slika, boja).
  const { data } = await supabaseAdmin
    .schema("os")
    .from("people")
    .select("slug, name, avatar, color")
    .order("created_at");

  return <LoginForm team={data ?? []} />;
}
