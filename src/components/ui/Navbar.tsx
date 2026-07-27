"use client";

// Radix navigation menu primitiv.
// Stock shadcn verzija gađa tokene koje ova tema nema (popover,
// accent-foreground, secondary), pa su hover i panel ostajali bez boje -
// ili gore: `bg-accent` je ovde zlatna (#f0b656) pa je hover bio blještav.
// Sve je prevedeno na tokene iz globals.css: card / primary / border / ring.

import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// Klase koje ne zavise od propsa stoje na nivou modula - string se pravi
// jednom, a ne pri svakom renderu.
const FOCUS_RING =
  "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

const TRIGGER_CLASS = cn(
  "group inline-flex h-9 w-max items-center justify-center gap-1 rounded-lg px-3 py-2",
  "text-sm font-medium text-muted-foreground transition-colors",
  "hover:bg-primary/10 hover:text-foreground",
  "data-[state=open]:bg-primary/10 data-[state=open]:text-foreground",
  "disabled:pointer-events-none disabled:opacity-50",
  FOCUS_RING,
);

/** Panel ispod stavke - koristi se i za viewport i za `viewport={false}`. */
const PANEL_CLASS =
  "bg-card text-card-foreground rounded-xl border border-border shadow-xl shadow-black/40";

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-0.5",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(TRIGGER_CLASS);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(TRIGGER_CLASS, className)}
      {...props}
    >
      {children}
      <ChevronDownIcon
        className="relative top-px size-3.5 transition-transform duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        // Klizanje između stavki dok je viewport uključen
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52",
        "top-0 left-0 w-full md:absolute md:w-auto",
        // Bez viewporta panel sam nosi pozadinu i animaciju otvaranja
        "group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-2",
        "group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:duration-200",
        "group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out",
        "group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0",
        "group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95",
        "group-data-[viewport=false]/navigation-menu:data-[state=open]:slide-in-from-top-1",
        "group-data-[viewport=false]/navigation-menu:bg-card group-data-[viewport=false]/navigation-menu:text-card-foreground",
        "group-data-[viewport=false]/navigation-menu:rounded-xl group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:border-border",
        "group-data-[viewport=false]/navigation-menu:shadow-xl group-data-[viewport=false]/navigation-menu:shadow-black/40",
        "**:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className="absolute top-full left-0 isolate z-50 flex justify-center">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-2 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden md:w-[var(--radix-navigation-menu-viewport-width)]",
          PANEL_CLASS,
          className,
        )}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "flex flex-col gap-1 rounded-lg p-2 text-sm transition-colors",
        "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
        "data-[active=true]:bg-primary/10 data-[active=true]:text-foreground",
        "[&_svg:not([class*='text-'])]:text-primary [&_svg:not([class*='size-'])]:size-4",
        FOCUS_RING,
        className,
      )}
      {...props}
    />
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};
