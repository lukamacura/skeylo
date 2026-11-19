import type { Metadata } from "next";
import localFont from "next/font/local";
import RedizajnDeck from "@/components/site/bojan/redizajn/RedizajnDeck";

/* The follow-up to /bojan: three months of Skeylo, starting with the
   redesign of one store. Same type as the first deck, from the same local
   files (next/font/google trips Turbopack, see /bojan). */
const rubik = localFont({
  src: [
    { path: "../fonts/Rubik.woff2", weight: "300 900", style: "normal" },
    { path: "../fonts/Rubik-Italic.woff2", weight: "300 900", style: "italic" },
  ],
  variable: "--font-neto",
  display: "swap",
});

const plexMono = localFont({
  src: [
    {
      path: "../fonts/IBMPlexMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/IBMPlexMono-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-neto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Privatna prezentacija",
  description: "Potrebna je lozinka.",
  robots: { index: false, follow: false, nocache: true },
};

export default function NetoRedesignPage() {
  return <RedizajnDeck fontClass={`${rubik.variable} ${plexMono.variable}`} />;
}
