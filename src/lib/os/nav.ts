import {
  CalendarDays,
  CheckCircle2,
  FileText,
  LayoutGrid,
  Target,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Na telefonu u donjoj traci; ostalo ide pod "Više". */
  tab: boolean;
  /** Modul je izgrađen. Neizgrađeni stoje u meniju ali nisu linkovi. */
  ready: boolean;
};

export const NAV: NavItem[] = [
  { href: "/os", label: "Početna", icon: LayoutGrid, tab: true, ready: true },
  {
    href: "/os/taskovi",
    label: "Taskovi",
    icon: CheckCircle2,
    tab: true,
    ready: true,
  },
  {
    href: "/os/skripte",
    label: "Skripte",
    icon: FileText,
    tab: true,
    ready: true,
  },
  {
    href: "/os/snimanje",
    label: "Snimanje",
    icon: CalendarDays,
    tab: true,
    ready: true,
  },
  {
    href: "/os/finansije",
    label: "Finansije",
    icon: Wallet,
    tab: false,
    ready: true,
  },
  {
    href: "/os/ciljevi",
    label: "Ciljevi",
    icon: Target,
    tab: false,
    ready: true,
  },
  {
    href: "/os/klijenti",
    label: "Klijenti",
    icon: Users,
    tab: false,
    ready: true,
  },
];

export function isActive(href: string, pathname: string) {
  return href === "/os" ? pathname === "/os" : pathname.startsWith(href);
}
