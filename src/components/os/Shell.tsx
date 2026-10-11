"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { NAV, isActive, type NavItem } from "@/lib/os/nav";
import { OS, SPRING } from "@/lib/os/theme";
import type { Person } from "@/lib/os/types";
import SignOut from "@/components/os/SignOut";

export default function Shell({
  me,
  children,
}: {
  me: Person;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [more, setMore] = useState(false);

  return (
    <div className="min-h-dvh" style={{ background: OS.bg, color: OS.text }}>
      {/* Desktop: bočna traka */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col px-3 py-5 md:flex"
        style={{
          background: "rgba(20,20,23,0.72)",
          borderRight: `1px solid ${OS.line}`,
        }}
      >
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <span
            className="size-2.5 rounded-full"
            style={{ background: OS.brand, boxShadow: `0 0 12px ${OS.brand}` }}
          />
          <span
            className="text-[15px] font-semibold"
            style={{ letterSpacing: "-0.01em" }}
          >
            Skeylo OS
          </span>
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <SideLink
              key={item.href}
              item={item}
              active={isActive(item.href, pathname)}
            />
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-2.5 px-2">
          <Avatar person={me} size={30} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-medium">{me.name}</div>
            <div className="truncate text-[12px]" style={{ color: OS.muted }}>
              {me.role}
            </div>
          </div>
          <SignOut compact />
        </div>
      </aside>

      <main className="pb-[calc(84px+env(safe-area-inset-bottom))] md:pb-0 md:pl-[232px]">
        {children}
      </main>

      {/* Telefon: donja traka */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 pb-[env(safe-area-inset-bottom)] md:hidden"
        style={{
          background: "rgba(14,14,17,0.72)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderTop: `1px solid ${OS.line}`,
        }}
      >
        {NAV.filter((i) => i.tab).map((item) => (
          <TabLink
            key={item.href}
            item={item}
            active={isActive(item.href, pathname)}
          />
        ))}
        <button
          type="button"
          onClick={() => setMore(true)}
          className="flex h-[58px] flex-col items-center justify-center gap-1 text-[10.5px] font-medium active:opacity-60"
          style={{
            color: NAV.some((i) => !i.tab && isActive(i.href, pathname))
              ? OS.text
              : OS.muted,
          }}
        >
          <MoreHorizontal className="size-[22px]" />
          Više
        </button>
      </nav>

      <MoreSheet
        open={more}
        onClose={() => setMore(false)}
        pathname={pathname}
        me={me}
      />
    </div>
  );
}

function SideLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const body = (
    <>
      {active && (
        <motion.span
          layoutId="os-side-active"
          transition={SPRING}
          className="absolute inset-0 rounded-lg"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />
      )}
      <Icon className="relative size-[18px]" />
      <span className="relative flex-1">{item.label}</span>
      {!item.ready && (
        <span className="relative text-[11px]" style={{ color: OS.faint }}>
          uskoro
        </span>
      )}
    </>
  );
  const cls =
    "relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-[14px]";
  if (!item.ready)
    return (
      <span className={cls} style={{ color: OS.faint }} aria-disabled>
        {body}
      </span>
    );
  return (
    <Link
      href={item.href}
      className={`${cls} transition-colors duration-100 hover:bg-white/[0.04] active:bg-white/[0.07]`}
      style={{ color: active ? OS.text : OS.muted }}
    >
      {body}
    </Link>
  );
}

function TabLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const cls =
    "flex h-[58px] flex-col items-center justify-center gap-1 text-[10.5px] font-medium";
  if (!item.ready)
    return (
      <span className={cls} style={{ color: OS.faint }} aria-disabled>
        <Icon className="size-[22px]" />
        {item.label}
      </span>
    );
  return (
    <Link
      href={item.href}
      className={`${cls} active:opacity-60`}
      style={{ color: active ? OS.text : OS.muted }}
    >
      <Icon className="size-[22px]" />
      {item.label}
    </Link>
  );
}

/* Sheet "Više": prati prst, odluka o zatvaranju po smeru brzine pri puštanju. */
function MoreSheet({
  open,
  onClose,
  pathname,
  me,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  me: Person;
}) {
  function onDragEnd(_: unknown, info: PanInfo) {
    const v = info.velocity.y;
    const close = Math.abs(v) > 300 ? v > 0 : info.offset.y > 80;
    if (close) onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[22px] px-3 pb-[calc(16px+env(safe-area-inset-bottom))] pt-2 md:hidden"
            style={{
              background: OS.surface,
              borderTop: `1px solid ${OS.lineStrong}`,
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0.2, visualDuration: 0.25 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 1 }}
            onDragEnd={onDragEnd}
          >
            <div
              className="mx-auto mb-3 h-1 w-9 rounded-full"
              style={{ background: OS.lineStrong }}
            />
            {NAV.filter((i) => !i.tab).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, pathname);
              const cls =
                "flex h-12 items-center gap-3 rounded-xl px-3 text-[16px]";
              return item.ready ? (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`${cls} active:bg-white/[0.06]`}
                  style={{ color: active ? OS.text : OS.muted }}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              ) : (
                <span
                  key={item.href}
                  className={cls}
                  style={{ color: OS.faint }}
                >
                  <Icon className="size-5" />
                  <span className="flex-1">{item.label}</span>
                  <span className="text-[12px]">uskoro</span>
                </span>
              );
            })}
            <div
              className="mt-2 flex items-center gap-3 border-t px-3 pt-3"
              style={{ borderColor: OS.line }}
            >
              <Avatar person={me} size={32} />
              <span className="flex-1 text-[15px]">{me.name}</span>
              <SignOut />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function Avatar({
  person,
  size,
}: {
  person: Pick<Person, "name" | "avatar" | "color">;
  size: number;
}) {
  return (
    <span
      className="relative inline-block shrink-0 overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 0 1.5px ${person.color}`,
        background: OS.surface2,
      }}
    >
      {person.avatar && (
        <Image
          src={person.avatar}
          alt={person.name}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      )}
    </span>
  );
}
