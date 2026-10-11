import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/os/supabase";
import Shell from "@/components/os/Shell";
import NoAccess from "@/components/os/NoAccess";
import { OS } from "@/lib/os/theme";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Skeylo OS", template: "%s · Skeylo OS" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: OS.bg, viewportFit: "cover" };

export default async function OsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, me } = await getSession();
  if (!user) redirect("/os/login");
  if (!me) return <NoAccess email={user.email ?? ""} />;
  return <Shell me={me}>{children}</Shell>;
}
