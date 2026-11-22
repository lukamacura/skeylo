import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import CiklonDeck from "@/components/site/ciklon/CiklonDeck";

/* Figtree: open, even shapes that stay readable from the big headlines
   down to the small labels. Local file (next/font/google trips Turbopack),
   latin + latin-ext for š, đ, č, ć, ž. OFL next to it. */
const figtree = localFont({
  src: "./fonts/Figtree.woff2",
  weight: "300 900",
  variable: "--font-ck",
  display: "swap",
});

const TITLE = "Ciklon Filters × Skeylo · Ponuda";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: "Novi sajt i operativni sistem za Ciklon Filters.",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = { themeColor: "#071521" };

export default function CiklonOfferPage() {
  return <CiklonDeck fontClass={figtree.variable} />;
}
