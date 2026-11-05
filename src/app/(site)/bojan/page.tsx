import type { Metadata } from "next";
import localFont from "next/font/local";
import BojanDeck from "@/components/site/bojan/BojanDeck";

/* Local fonts, not next/font/google: Google sometimes serves /l/font?kit= URLs
   and Turbopack then fails the whole build (vidi /ils). Files are the official
   google/fonts sources subset to latin + latin-ext, OFL next to them. */

/* Neto's type, scoped to this deck only: the rest of the site keeps its own
   display face. The variables are read by the deck as --font-neto. */
const rubik = localFont({
  src: [
    { path: "./fonts/Rubik.woff2", weight: "300 900", style: "normal" },
    { path: "./fonts/Rubik-Italic.woff2", weight: "300 900", style: "italic" },
  ],
  variable: "--font-neto",
  display: "swap",
});

const plexMono = localFont({
  src: [
    {
      path: "./fonts/IBMPlexMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/IBMPlexMono-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-neto-mono",
  display: "swap",
});

/* The script face the Instagram wordmark is set in, for the catalog demo's
   opening screen. Read as --font-ig. Latin only, like before. */
const grandHotel = localFont({
  src: "./fonts/GrandHotel.woff2",
  weight: "400",
  variable: "--font-ig",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Privatna prezentacija",
  description: "Potrebna je lozinka.",
  robots: { index: false, follow: false, nocache: true },
};

export default function BojanOfferPage() {
  return (
    <BojanDeck
      fontClass={`${rubik.variable} ${plexMono.variable} ${grandHotel.variable}`}
    />
  );
}
