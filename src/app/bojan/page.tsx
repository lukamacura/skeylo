import type { Metadata } from "next";
import { IBM_Plex_Mono, Rubik } from "next/font/google";
import BojanDeck from "@/components/site/bojan/BojanDeck";

/* Neto's type, scoped to this deck only: the rest of the site keeps its own
   display face. The variables are read by the deck as --font-neto. */
const rubik = Rubik({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-neto",
  display: "swap",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-neto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Privatna prezentacija",
  description: "Potrebna je lozinka.",
  robots: { index: false, follow: false, nocache: true },
};

export default function BojanOfferPage() {
  return <BojanDeck fontClass={`${rubik.variable} ${plex.variable}`} />;
}
