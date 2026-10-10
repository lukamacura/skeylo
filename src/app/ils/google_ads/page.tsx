import type { Metadata, Viewport } from "next";
import { Caveat, Playfair_Display, Urbanist } from "next/font/google";
import { cookies } from "next/headers";
import Gate from "@/components/site/ils/Gate";
import AdsDeck from "@/components/site/ils/ads/AdsDeck";
import { ILS_COOKIE, isIlsUnlocked } from "@/lib/ils-gate";
import "@/components/site/ils/plan.css";

/* Isti Infinity fontovi kao marketing plan, samo za ovu stranicu. */
const serif = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-ils-serif",
  display: "swap",
});

const sans = Urbanist({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-ils-sans",
  display: "swap",
});

/* Rukopis za računicu na papiru (slajd 04). */
const hand = Caveat({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
  variable: "--font-ils-hand",
  display: "swap",
});

const FONTS = `${serif.variable} ${sans.variable} ${hand.variable}`;

async function unlocked() {
  return isIlsUnlocked((await cookies()).get(ILS_COOKIE)?.value);
}

export async function generateMetadata(): Promise<Metadata> {
  const open = await unlocked();
  return {
    title: open
      ? { absolute: "Infinity Laser Studio | Google Ads" }
      : "Privatna prezentacija",
    description: open ? undefined : "Potrebna je lozinka.",
    robots: { index: false, follow: false, nocache: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#150e10",
  viewportFit: "cover",
};

export default async function IlsGoogleAdsPage() {
  if (!(await unlocked()))
    return (
      <Gate
        fontClass={FONTS}
        title="Google Ads"
        cta="Otvori prezentaciju"
        next="/ils/google_ads"
      />
    );
  return <AdsDeck fontClass={FONTS} />;
}
