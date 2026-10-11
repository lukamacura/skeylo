"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { osBrowser } from "@/lib/os/supabase-browser";
import { OS } from "@/lib/os/theme";

export default function SignOut({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await osBrowser().auth.signOut();
        router.replace("/os/login");
        router.refresh();
      }}
      className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-[14px] transition-[background,transform] duration-100 hover:bg-white/5 active:scale-[0.97]"
      style={{ color: OS.muted }}
      aria-label="Odjavi se"
    >
      <LogOut className="size-4" />
      {!compact && "Odjavi se"}
    </button>
  );
}
