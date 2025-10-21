// components/HeaderClient.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/Navbar";

export default function HeaderClient() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Zaključaj skrol kada je meni otvoren
  useEffect(() => {
    if (open) {
      const { overflow } = document.body.style;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = overflow;
      };
    }
  }, [open]);

  // Zatvori ESC-om
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);
  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  const isActive = (href: string) => pathname === href;

  const linkBase =
    "block rounded-lg px-4 py-3 text-sm font-medium transition-colors";
  const linkActive = "bg-primary text-background font-bold";
  const linkHover = "hover:bg-primary/50 ";

  return (
    <header className="fixed inset-x-0 top-0 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 z-100">
      {/* Safe area padding za iOS notch */}
      <div className="pt-[env(safe-area-inset-top)]" />

      <div className="mx-auto max-w-7xl h-14 px-5 sm:px-8 flex items-center gap-4 sm:gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
          aria-label="Skeylo — Početna"
        >
          <Image
            src="/logo.png"
            alt="Skeylo"
            width={40}
            height={40}
            priority
            className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
          />
          <span className="sr-only">Skeylo</span>
        </Link>

        {/* Desktop meni */}
        <nav className="ml-auto hidden sm:block" aria-label="Glavna navigacija">
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/"
                    className={`${linkBase} ${isActive("/") ? linkActive : linkHover}`}
                  >
                    Početna
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="#team"
                    className={`${linkBase} ${isActive("#team") ? linkActive : linkHover}`}
                  >
                    Tim
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="#faq"
                    className={`${linkBase} ${isActive("#faq") ? linkActive : linkHover}`}
                  >
                    Česta pitanja
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="ml-auto sm:hidden inline-flex items-center justify-center rounded-md border border-neutral-800 p-2 hover:bg-neutral-900/70"
          aria-label={open ? "Zatvori meni" : "Otvori meni"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Overlay */}
      <button
        className={`fixed inset-0 bg-black/50 transition-opacity sm:hidden 
          ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      {/* Mobile panel: slide-down + max-h animacija */}
      <div
        id="mobile-menu"
        className={`sm:hidden overflow-hidden border-t border-border bg-background/95 backdrop-blur
          transition-[max-height,opacity,transform] will-change-[max-height,opacity,transform]
          ${open ? "max-h-[60vh] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-2"}`}
      >
        <nav className="px-2 py-2" aria-label="Mobilna navigacija">
          <ul className="py-1">
            <li>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className={`${linkBase} ${isActive("/") ? linkActive : linkHover}`}
              >
                Početna
              </Link>
            </li>
            <li>
              <Link
                href="#team"
                onClick={() => setOpen(false)}
                className={`${linkBase} ${isActive("#team") ? linkActive : linkHover}`}
              >
                Usluge
              </Link>
            </li>
            <li>
              <Link
                href="#faq"
                onClick={() => setOpen(false)}
                className={`${linkBase} ${isActive("#faq") ? linkActive : linkHover}`}
              >
                Česta pitanja
              </Link>
            </li>
          </ul>

          {/* (opciono) CTA ispod linkova */}
          {/* <div className="p-2">
            <Link
              href="/analiza"
              onClick={() => setOpen(false)}
              className="block w-full text-center rounded-lg bg-primary text-primary-foreground py-3 font-semibold hover:opacity-90"
            >
              Besplatna analiza
            </Link>
          </div> */}
        </nav>
      </div>
    </header>
  );
}
