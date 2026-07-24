"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

const GOLD = "#f0b656";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Pogrešna lozinka.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Greška. Pokušaj ponovo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-foreground/10 bg-background p-8 shadow-lg"
      >
        <div
          className="mb-5 grid size-12 place-items-center rounded-xl"
          style={{ background: `${GOLD}1a` }}
        >
          <Lock className="size-6" style={{ color: GOLD }} />
        </div>
        <h1 className="text-xl font-semibold">Admin panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Unesi lozinku za pristup CRM.
        </p>

        <div className="mt-6 grid gap-2">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Lozinka"
            autoFocus
            className={error ? "border-red-500" : undefined}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <Button
          type="submit"
          disabled={loading || !password}
          className="mt-5 w-full font-bold text-background"
        >
          {loading ? "Prijava..." : "Uđi"}
        </Button>
      </form>
    </div>
  );
}
