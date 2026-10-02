import type { Metadata, Viewport } from "next";
import SolarCalculatorUS from "@/components/solar/SolarCalculatorUS";

export const metadata: Metadata = {
  // absolute: preskače root template "%s | Skeylo" (white-label).
  title: { absolute: "Solar Savings Calculator | Texas, Florida, Arizona" },
  description:
    "Find out how many years it takes for solar panels to pay for themselves on your roof. Estimate for Texas, Florida and Arizona in 6 quick questions.",
  openGraph: {
    title: "Solar Savings Calculator",
    description:
      "Find out how many years it takes for solar panels to pay for themselves on your roof.",
    images: [],
  },
  robots: { index: false, follow: false },
};

// viewportFit: cover + safe-area padding u komponenti, za telefone sa zarezom.
export const viewport: Viewport = {
  themeColor: "#07090d",
  viewportFit: "cover",
};

// Američka verzija (TX/FL/AZ); živi pod /calculator zbog white-label režima.
export default function SolarCalculatorUSPage() {
  return <SolarCalculatorUS />;
}
