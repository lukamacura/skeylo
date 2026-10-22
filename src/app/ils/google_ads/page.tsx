import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import Gate from "@/components/site/ils/Gate";
import AdsDeck from "@/components/site/ils/ads/AdsDeck";
import { ILS_COOKIE, isIlsUnlocked } from "@/lib/ils-gate";
import "@/components/site/ils/plan.css";

/* Isti Infinity fontovi kao marketing plan, samo za ovu stranicu. Fajlovi su u
   ../fonts (varijabilni, latin + latin-ext), pa build ne zavisi od Google Fonts-a. */
const playfair = localFont({
  src: [
    {
      path: "../fonts/PlayfairDisplay.woff2",
      weight: "400 900",
      style: "normal",
    },
    {
      path: "../fonts/PlayfairDisplay-Italic.woff2",
      weight: "400 900",
      style: "italic",
    },
  ],
  variable: "--font-ils-serif",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const urbanist = localFont({
  src: "../fonts/Urbanist.woff2",
  weight: "100 900",
  variable: "--font-ils-sans",
  display: "swap",
});

/* Rukopis za računicu na papiru (slajd 04). */
const caveat = localFont({
  src: "../fonts/Caveat.woff2",
  weight: "400 700",
  variable: "--font-ils-hand",
  display: "swap",
});

const FONTS = `${playfair.variable} ${urbanist.variable} ${caveat.variable}`;

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
