"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { osBrowser } from "@/lib/os/supabase-browser";
import { OS, SPRING, STATE } from "@/lib/os/theme";

type Face = {
  slug: string;
  name: string;
  avatar: string | null;
  color: string;
};
type Mode = "login" | "setup";

const MODES: { id: Mode; label: string }[] = [
  { id: "login", label: "Prijava" },
  { id: "setup", label: "Prvi ulazak" },
];

export default function LoginForm({ team }: { team: Face[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "setup") {
        const res = await fetch("/api/os/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, code }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json.error ?? "Greška. Pokušaj ponovo.");
          return;
        }
      }
      const { error } = await osBrowser().auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        setError("Pogrešan email ili lozinka.");
        return;
      }
      router.replace("/os");
      router.refresh();
    } catch {
      setError("Greška. Pokušaj ponovo.");
    } finally {
      setBusy(false);
    }
  }

  const ready =
    email.includes("@") &&
    password.length >= (mode === "setup" ? 8 : 1) &&
    (mode === "login" || code);

  return (
    <div
      className="grid min-h-dvh place-items-center px-4 py-10"
      style={{ background: OS.bg, color: OS.text }}
    >
      <form onSubmit={submit} className="w-full max-w-[380px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex -space-x-3">
            {team.map((p) => (
              <div
                key={p.slug}
                className="relative size-12 overflow-hidden rounded-full"
                style={{
                  boxShadow: `0 0 0 2px ${OS.bg}, 0 0 0 3.5px ${p.color}`,
                }}
              >
                {p.avatar && (
                  <Image
                    src={p.avatar}
                    alt={p.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </div>
            ))}
          </div>
          <h1
            className="mt-6 text-[28px] font-semibold leading-tight"
            style={{
              fontFamily: "var(--font-sans)",
              letterSpacing: "-0.025em",
            }}
          >
            Skeylo OS
          </h1>
          <p className="mt-1 text-[15px]" style={{ color: OS.muted }}>
            {mode === "login"
              ? "Prijavi se svojim nalogom."
              : "Izaberi lozinku za svoj nalog."}
          </p>
        </div>

        <div
          className="relative mb-5 grid grid-cols-2 rounded-xl p-1"
          style={{ background: OS.surface, border: `1px solid ${OS.line}` }}
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                setError("");
              }}
              className="relative h-9 rounded-lg text-[14px] font-medium"
              style={{ color: mode === m.id ? OS.text : OS.muted }}
            >
              {mode === m.id && (
                <motion.span
                  layoutId="os-login-mode"
                  transition={SPRING}
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: OS.surface2,
                    boxShadow: "0 1px 2px rgba(0,0,0,.4)",
                  }}
                />
              )}
              <span className="relative">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-2.5">
          <Field
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Email"
            autoComplete="email"
            autoFocus
          />
          <Field
            type="password"
            value={password}
            onChange={setPassword}
            placeholder={mode === "setup" ? "Nova lozinka (min. 8)" : "Lozinka"}
            autoComplete={
              mode === "setup" ? "new-password" : "current-password"
            }
          />
          {mode === "setup" && (
            <Field
              type="password"
              value={code}
              onChange={setCode}
              placeholder="Agencijska šifra"
              autoComplete="off"
            />
          )}
        </div>

        {error && (
          <p className="mt-3 text-[13px]" style={{ color: STATE.late }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !ready}
          className="mt-5 h-11 w-full rounded-xl text-[15px] font-semibold transition-[transform,opacity] duration-100 active:scale-[0.98] disabled:opacity-40"
          style={{ background: OS.text, color: OS.bg }}
        >
          {busy ? "Trenutak…" : mode === "login" ? "Uđi" : "Napravi nalog"}
        </button>
      </form>
    </div>
  );
}

function Field({
  onChange,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  onChange: (v: string) => void;
}) {
  return (
    <input
      {...props}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-xl px-3.5 text-[15px] outline-none transition-[box-shadow] placeholder:text-[#5a5a62] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.12)]"
      style={{
        background: OS.surface,
        border: `1px solid ${OS.line}`,
        color: OS.text,
      }}
    />
  );
}
