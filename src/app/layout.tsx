import type { Metadata } from "next";
import "./globals.css"; // ✅ fajl ti je u /app, ne u /styles
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/Navbar";

export const metadata: Metadata = {
  title: {
    default: "Skeylo: Full-stack marketing agencija",
    template: "%s | Skeylo",
  },
  description:
    "Performance, SEO, kreativa i CRM u jednom timu. Gradimo sistem koji raste uz vaš biznis.",
  openGraph: {
    title: "Skeylo — Full-stack marketing agencija",
    description: "Performance, SEO, kreativa i CRM u jednom timu.",
    images: [{ url: "/og.png" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr" className={inter.className}>
      <body>
        <header className="w-full fixed bg-background z-10">
          <div className="mx-auto max-w-7xl h-14 px-8 flex items-center gap-6 font-medium">
            {/* Logo levo */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0"
              aria-label="Skeylo — Početna"
            >
              <Image
                src="/logo.png"
                alt="Skeylo"
                width={300}
                height={300}
                priority
                className="h-18 w-18 object-contain"
              />
            </Link>

            {/* Meni desno */}
            <div className="ml-auto">
              <NavigationMenu viewport={false}>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/">Početna</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/services">Usluge</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/kontakt">Kontakt</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 pt-14">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
