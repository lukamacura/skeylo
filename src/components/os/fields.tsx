"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/os/Shell";
import { OS, SPRING, STATE } from "@/lib/os/theme";
import type { Person } from "@/lib/os/types";

export const inputCls =
  "h-11 w-full rounded-xl px-3.5 text-[15px] outline-none transition-[box-shadow] placeholder:text-[#5a5a62] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.12)]";
export const inputStyle = {
  background: OS.bg,
  border: `1px solid ${OS.line}`,
  color: OS.text,
  colorScheme: "dark" as const,
};

export function Label({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[13px] font-medium" style={{ color: OS.muted }}>
        {label}
      </span>
      {children}
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  id,
}: {
  value: T;
  options: { id: T; label: string; color?: string }[];
  onChange: (v: T) => void;
  id: string;
}) {
  return (
    <div
      className="relative grid rounded-xl p-1"
      style={{
        gridTemplateColumns: `repeat(${options.length}, 1fr)`,
        background: OS.bg,
        border: `1px solid ${OS.line}`,
      }}
    >
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className="relative h-9 rounded-lg text-[14px] font-medium"
            style={{ color: active ? (o.color ?? OS.text) : OS.muted }}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={SPRING}
                className="absolute inset-0 rounded-lg"
                style={{ background: o.color ? `${o.color}24` : OS.surface2 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function PersonPicker({
  team,
  value,
  onChange,
  allowNone = false,
}: {
  team: Person[];
  value: string | null;
  onChange: (id: string | null) => void;
  allowNone?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {team.map((p) => {
        const active = p.id === value;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(active && allowNone ? null : p.id)}
            className="inline-flex h-9 items-center gap-2 rounded-full pl-1 pr-3 text-[14px] transition-[background,transform] duration-100 active:scale-[0.97]"
            style={{
              background: active ? `${p.color}26` : OS.bg,
              border: `1px solid ${active ? `${p.color}66` : OS.line}`,
              color: active ? p.color : OS.muted,
            }}
          >
            <Avatar person={p} size={26} />
            {p.name}
          </button>
        );
      })}
    </div>
  );
}

export function PrimaryButton({
  children,
  disabled,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="h-11 flex-1 rounded-xl px-4 text-[15px] font-semibold transition-transform duration-100 active:scale-[0.98] disabled:opacity-40"
      style={{ background: OS.text, color: OS.bg }}
    >
      {children}
    </button>
  );
}

/** Dva dodira: prvi pita, drugi briše. Bez browser dijaloga. */
export function DeleteButton({
  onConfirm,
  label = "Obriši",
}: {
  onConfirm: () => void;
  label?: string;
}) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type="button"
      onClick={() => (armed ? onConfirm() : setArmed(true))}
      onBlur={() => setArmed(false)}
      className="h-11 rounded-xl px-4 text-[15px] font-medium transition-[background,transform] duration-100 active:scale-[0.98]"
      style={{
        color: STATE.late,
        background: armed ? `${STATE.late}22` : "transparent",
      }}
    >
      {armed ? "Potvrdi" : label}
    </button>
  );
}

export function PageHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1
          className="text-[30px] font-semibold leading-tight md:text-[34px]"
          style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.03em" }}
        >
          {title}
        </h1>
        {sub && (
          <div className="mt-0.5 text-[14px]" style={{ color: OS.muted }}>
            {sub}
          </div>
        )}
      </div>
      {action}
    </header>
  );
}

export function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-[14px] font-semibold transition-transform duration-100 active:scale-[0.97]"
      style={{ background: OS.text, color: OS.bg }}
    >
      {children}
    </button>
  );
}

export const pageCls =
  "mx-auto max-w-5xl px-4 pb-16 pt-[calc(20px+env(safe-area-inset-top))] md:px-10 md:pt-10";
