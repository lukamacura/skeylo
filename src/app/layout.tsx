import type { Metadata } from "next";
import "./globals.css"; // ✅ fajl ti je u /app, ne u /styles
import { Analytics } from "@vercel/analytics/react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/Navbar";

export const metadata: Metadata = {
  title: {
    default: "Skeylo — Full-stack marketing agencija",
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
    <html lang="sr">
      <body className="">
        <header className="border-b">
          <div className="mx-auto font-medium max-w-7xl h-14 px-4 flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink>Početna</NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink>Work</NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink>Kontakt</NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
