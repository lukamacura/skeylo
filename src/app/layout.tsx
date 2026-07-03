// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { headers } from "next/headers";
import HeaderClient from "@/components/site/HeaderClient";
import Footer from "@/components/site/Footer";

const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

const sans = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Skeylo - Marketing koji donosi profit",
    template: "%s | Skeylo",
  },
  description:
    "Full-stack marketing agencija. Kreativa, performance kampanje i sistemi rasta u jednom timu. Tri paketa, jedan cilj - više prodaja.",
  openGraph: {
    title: "Skeylo - Marketing koji donosi profit",
    description:
      "Kreativa, performance i sistemi rasta u jednom timu. Tri paketa, jedan cilj - više prodaja.",
    images: [{ url: "/og.png" }],
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const construction = (await headers()).get("x-construction") === "1";

  return (
    <html lang="sr" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {!construction && <HeaderClient />}
        <main>{children}</main>
        {!construction && <Footer />}
        <Analytics />
      </body>
    </html>
  );
}
