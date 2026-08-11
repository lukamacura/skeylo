// components/site/HeaderClient.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";

import { PACKAGES, priceLabel } from "@/lib/packages";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/Navbar";

/**
 * Jedan izvor istine za navigaciju - isti niz crta i desktop meni i mobilni
 * panel, pa nova stavka ne mora da se dodaje na dva mesta.
 * `id` je id sekcije na početnoj (koristi ga scroll-spy za aktivno stanje).
 */
type NavItem = { label: string; href: string; id: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Usluge", href: "/#usluge", id: "usluge" },
  { label: "Rezultati", href: "/#rezultati", id: "rezultati" },
  {
    label: "Studije slučaja",
    href: "/#rezultati-studije",
    id: "rezultati-studije",
  },
  { label: "Tim", href: "/#tim", id: "tim" },
];

/** Sekcije koje scroll-spy prati; "paketi" pali dropdown u meniju. */
const SPY_IDS = ["paketi", ...NAV_ITEMS.map((i) => i.id)];

const CTA_HREF = "/#paketi";

/**
 * Prati koja je sekcija trenutno u fokusu i vraća njen id.
 * Radi samo na početnoj - na ostalim stranicama aktivno stanje ide po ruti.
 */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  const visible = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }

    const nodes = SPY_IDS.map((id) => document.getElementById(id)).filter(
      (n): n is HTMLElement => n !== null,
    );
    if (nodes.length === 0) return;

    // Redosled u DOM-u, da uvek biramo najvišu vidljivu sekciju.
    const order = [...nodes]
      .sort((a, b) => a.offsetTop - b.offsetTop)
      .map((n) => n.id);

    const seen = visible.current;
    seen.clear();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) seen.add(entry.target.id);
          else seen.delete(entry.target.id);
        }
        setActive(order.find((id) => seen.has(id)) ?? null);
      },
      // Traka na oko trećini ekrana - sekcija postaje aktivna tek kad
      // stvarno dođe pod navigaciju, a ne čim joj zaviri ivica.
      { rootMargin: "-25% 0px -60% 0px" },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [enabled]);

  return active;
}

export default function HeaderClient() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";
  const activeSection = useActiveSection(isHome);
  const onPackagePage = pathname.startsWith("/paketi");

  const closeMenu = useCallback(() => setOpen(false), []);

  // Ruta se promenila => zatvori mobilni meni
  useEffect(() => setOpen(false), [pathname]);

  // Hairline i jača pozadina tek kad se skroluje sa vrha
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Zaključaj skrol i hvataj ESC samo dok je meni otvoren
  useEffect(() => {
    if (!open) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const isActive = (id: string) => isHome && activeSection === id;
  const packagesActive = onPackagePage || isActive("paketi");

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-100 transition-colors duration-300",
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/65"
          : "border-b border-transparent bg-background/60 backdrop-blur",
      )}
    >
      {/* Safe area padding za iOS notch */}
      <div className="pt-[env(safe-area-inset-top)]" />

      <div className="container-x flex h-14 items-center gap-3 sm:h-16 sm:gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          aria-label="Skeylo - Početna"
        >
          <Image
            src="/logo.png"
            alt="Skeylo"
            width={48}
            height={48}
            priority
            className="h-10 w-10 object-contain sm:h-12 sm:w-12"
          />
          <span className="sr-only">Skeylo</span>
        </Link>

        {/* Desktop meni */}
        <nav className="ml-auto hidden md:block" aria-label="Glavna navigacija">
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              {/* Paketi - dropdown sa sva tri paketa */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(packagesActive && "text-foreground")}
                >
                  Paketi
                </NavigationMenuTrigger>
                <NavigationMenuContent className="md:right-0 md:left-auto">
                  <ul className="grid w-[24rem] gap-1 p-2">
                    {PACKAGES.map((p) => (
                      <li key={p.slug}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={`/paketi/${p.slug}`}
                            data-active={
                              pathname === `/paketi/${p.slug}` || undefined
                            }
                            // Radix `asChild` samo spaja className stringove
                            // (bez tailwind-merge), pa ovde stoje px/py
                            // umesto `p-*` da pouzdano pobede bazu iz primitiva.
                            className={cn(
                              "gap-1.5 border border-transparent px-3 py-3",
                              "hover:border-primary/25",
                              p.premium && "hover:border-accent/40",
                            )}
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span className="font-semibold text-foreground">
                                {p.name}
                              </span>
                              <span
                                className={cn(
                                  "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                                  p.premium
                                    ? "border-accent/40 text-accent"
                                    : "border-border text-muted-foreground",
                                )}
                              >
                                {p.badge}
                              </span>
                            </span>
                            <span className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {p.tagline}
                            </span>
                            <span className="text-xs font-semibold text-primary">
                              {priceLabel(p)}
                            </span>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                    <li className="mt-1 border-t border-border pt-1">
                      <NavigationMenuLink asChild>
                        <Link
                          href={CTA_HREF}
                          className="group/all px-3 py-3 text-sm font-medium"
                        >
                          <span className="flex items-center justify-between">
                            Uporedi sve pakete
                            <ArrowRight className="size-4 transition-transform group-hover/all:translate-x-0.5" />
                          </span>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {NAV_ITEMS.map((item) => (
                <NavigationMenuItem key={item.id}>
                  <NavigationMenuLink
                    asChild
                    data-active={isActive(item.id) || undefined}
                  >
                    <Link
                      href={item.href}
                      className="h-9 items-center justify-center px-3 text-sm font-medium"
                    >
                      {item.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Desktop CTA */}
        <Link
          href={CTA_HREF}
          className="ml-auto hidden shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 md:ml-0 md:inline-flex"
        >
          Pogledaj pakete
          <ArrowRight className="size-4" />
        </Link>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="ml-auto inline-flex items-center justify-center rounded-lg border border-border p-2 text-foreground transition-colors hover:bg-primary/10 md:hidden"
          aria-label={open ? "Zatvori meni" : "Otvori meni"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 -z-10 bg-black/60 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden="true"
        onClick={closeMenu}
      />

      {/* Mobile panel: slide-down + max-h animacija */}
      <div
        id="mobile-menu"
        className={cn(
          "overflow-y-auto border-t bg-background/95 backdrop-blur md:hidden",
          "transition-[max-height,opacity] duration-300 will-change-[max-height,opacity]",
          open
            ? "max-h-[calc(100dvh-3.5rem)] border-border opacity-100"
            : "max-h-0 border-transparent opacity-0",
        )}
      >
        <nav className="container-x py-3" aria-label="Mobilna navigacija">
          <p className="px-1 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Paketi
          </p>
          <ul className="grid gap-1">
            {PACKAGES.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/paketi/${p.slug}`}
                  onClick={closeMenu}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-3 transition-colors hover:bg-primary/10",
                    pathname === `/paketi/${p.slug}` &&
                      "border-primary/40 bg-primary/10",
                  )}
                >
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold">{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.badge}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {priceLabel(p)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="px-1 pt-4 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Sajt
          </p>
          <ul className="grid gap-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "block rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-primary/10",
                    isActive(item.id) && "bg-primary/10 text-primary",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href={CTA_HREF}
            onClick={closeMenu}
            className="mt-4 mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-center font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Pogledaj pakete
            <ArrowRight className="size-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
