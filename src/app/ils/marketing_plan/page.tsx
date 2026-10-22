import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import Gate from "@/components/site/ils/Gate";
import Plan from "@/components/site/ils/Plan";
import { ILS_COOKIE, isIlsUnlocked } from "@/lib/ils-gate";
import "@/components/site/ils/plan.css";

/* Infinity's type, scoped to this page only. The fonts live in ../fonts
   (variable, latin + latin-ext), so the build never fetches Google Fonts:
   Turbopack fails on Google's occasional /l/font?kit=… URLs. */
const playfair = localFont({
  src: "../fonts/PlayfairDisplay.woff2",
  weight: "400 900",
  variable: "--font-ils-serif",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

/* Only the signature at the very bottom is italic: no need to preload it. */
const playfairItalic = localFont({
  src: "../fonts/PlayfairDisplay-Italic.woff2",
  weight: "400 900",
  style: "italic",
  variable: "--font-ils-serif-italic",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

const urbanist = localFont({
  src: "../fonts/Urbanist.woff2",
  weight: "100 900",
  variable: "--font-ils-sans",
  display: "swap",
});

const FONTS = `${playfair.variable} ${playfairItalic.variable} ${urbanist.variable}`;

async function unlocked() {
  return isIlsUnlocked((await cookies()).get(ILS_COOKIE)?.value);
}

export async function generateMetadata(): Promise<Metadata> {
  const open = await unlocked();
  return {
    title: open
      ? { absolute: "Infinity Laser Studio | Marketing plan za oktobar 2026" }
      : "Privatan dokument",
    description: open ? undefined : "Potrebna je lozinka.",
    robots: { index: false, follow: false, nocache: true },
  };
}

// viewportFit: cover + safe-area padding u stilovima, za telefone sa zarezom.
export const viewport: Viewport = {
  themeColor: "#150e10",
  viewportFit: "cover",
};

export default async function IlsMarketingPlanPage() {
  if (!(await unlocked())) return <Gate fontClass={FONTS} />;
  return <Plan fontClass={FONTS} />;
}
