import type { Metadata, Viewport } from "next";
import SolarCalculator from "@/components/solar/SolarCalculator";

export const metadata: Metadata = {
  // absolute: preskače root template "%s | Skeylo" (white-label).
  title: { absolute: "Kalkulator uštede | Solarni paneli" },
  description:
    "Izračunajte za koliko godina se isplate solarni paneli na vašem krovu. Procena za Srbiju u 6 kratkih pitanja.",
  openGraph: {
    title: "Kalkulator uštede | Solarni paneli",
    description:
      "Izračunajte za koliko godina se isplate solarni paneli na vašem krovu.",
    images: [],
  },
  robots: { index: false, follow: false },
};

// viewportFit: cover + safe-area padding u komponenti, za telefone sa zarezom.
export const viewport: Viewport = {
  themeColor: "#07090d",
  viewportFit: "cover",
};

// Živi pod /calculator da bi nasledio white-label režim (bez Skeylo headera/footera).
export default function SolarCalculatorPage() {
  return <SolarCalculator />;
}
