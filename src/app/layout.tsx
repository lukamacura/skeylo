// app/layout.tsx
// Zajednički okvir za sve stranice: fontovi, metapodaci, analitika. Header i footer sajta
// su u (site)/layout.tsx, pa stranice bez njih (/admin, /calculator, /ils, /uml,
// /construction) jednostavno stoje van grupe (site). Ovde se ne čitaju headers() ni
// cookies(): to bi svaku stranicu pretvorilo u dinamičku (render na svaki zahtev).
import type { Metadata } from "next";
import "./globals.css";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

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
    "Full-stack marketing agencija. Kreativa, performance kampanje i sistemi rasta u jednom timu. Dva paketa, jedan cilj - više prodaja.",
  openGraph: {
    title: "Skeylo - Marketing koji donosi profit",
    description:
      "Kreativa, performance i sistemi rasta u jednom timu. Dva paketa, jedan cilj - više prodaja.",
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
    <html lang="sr" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
