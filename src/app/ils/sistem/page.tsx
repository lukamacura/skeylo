import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import Gate from "@/components/site/ils/Gate";
import SistemStage from "@/components/site/ils/sistem/SistemStage";
import { ILS_COOKIE, isIlsUnlocked } from "@/lib/ils-gate";
import "@/components/site/ils/plan.css";

/* Isti Infinity fontovi kao Google Ads prezentacija (../fonts, bez Google Fonts-a). */
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

const FONTS = `${playfair.variable} ${urbanist.variable}`;

async function unlocked() {
  return isIlsUnlocked((await cookies()).get(ILS_COOKIE)?.value);
}

export async function generateMetadata(): Promise<Metadata> {
  const open = await unlocked();
  return {
    title: open
      ? { absolute: "Infinity Laser Studio | Informacioni sistem" }
      : "Privatan dokument",
    description: open ? undefined : "Potrebna je lozinka.",
    robots: { index: false, follow: false, nocache: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#150e10",
  viewportFit: "cover",
};

/* Informacioni sistem: mapa kako Infinity radi. U CRM-u je posebna sekcija
   (Dashboard → Informacioni sistem), ovde je ista stranica preko celog ekrana. */
export default async function IlsSistemPage() {
  if (!(await unlocked()))
    return (
      <Gate
        fontClass={FONTS}
        title="Informacioni sistem"
        cta="Otvori"
        next="/ils/sistem"
      />
    );
  return <SistemStage fontClass={FONTS} />;
}
