// app/layout.tsx
// Zajednički okvir za sve stranice: fontovi, metapodaci, analitika. Header i footer sajta
// su u (site)/layout.tsx, pa stranice bez njih (/admin, /calculator, /ils, /uml,
// /construction) jednostavno stoje van grupe (site). Ovde se ne čitaju headers() ni
// cookies(): to bi svaku stranicu pretvorilo u dinamičku (render na svaki zahtev).
import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";

// Lokalni fontovi, ne next/font/google: Google ponekad vrati /l/font?kit= URL i
// Turbopack tada obori ceo build. Fajlovi su zvanični google/fonts izvori, subset na
// latin + latin-ext, OFL je pored njih. Bricolage je instanciran na opsz=96 i
// wdth=100, isto kao što ga Google servira kad se traži samo wght.
const bricolage = localFont({
  src: "./fonts/BricolageGrotesque.woff2",
  weight: "200 800",
  variable: "--font-display",
  display: "swap",
});

const geist = localFont({
  src: "./fonts/Geist.woff2",
  weight: "100 900",
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
    <html lang="sr" className={`${bricolage.variable} ${geist.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
