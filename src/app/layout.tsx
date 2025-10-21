// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import HeaderClient from "@/components/site/HeaderClient";

const inter = Inter({ subsets: ["latin"] });

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
        <HeaderClient />
        <main className="flex-1 pt-14">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
