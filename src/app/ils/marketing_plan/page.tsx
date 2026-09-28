import type { Metadata, Viewport } from "next";
import { Playfair_Display, Urbanist } from "next/font/google";
import { cookies } from "next/headers";
import Gate from "@/components/site/ils/Gate";
import Plan from "@/components/site/ils/Plan";
import { ILS_COOKIE, isIlsUnlocked } from "@/lib/ils-gate";
import "@/components/site/ils/plan.css";

/* Infinity's type, scoped to this page only and self-hosted by next/font. */
const serif = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  variable: "--font-ils-serif",
  display: "swap",
});

/* Only the signature at the very bottom is italic: no need to preload it. */
const serifItalic = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: "500",
  style: "italic",
  variable: "--font-ils-serif-italic",
  display: "swap",
  preload: false,
});

const sans = Urbanist({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ils-sans",
  display: "swap",
});

const FONTS = `${serif.variable} ${serifItalic.variable} ${sans.variable}`;

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
