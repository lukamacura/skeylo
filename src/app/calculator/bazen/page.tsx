import type { Metadata, Viewport } from "next";
import PoolCalculator from "@/components/pool/PoolCalculator";

export const metadata: Metadata = {
  // absolute: preskače root template "%s | Skeylo" (white-label).
  title: { absolute: "Kalkulator bazena | Okvirna cena" },
  description:
    "Izaberite tip, dimenzije i opremu bazena i dobijte okvirnu procenu investicije za 4 kratka koraka.",
  openGraph: {
    title: "Kalkulator bazena | Okvirna cena",
    description:
      "Koliko košta vaš bazen? Okvirna procena investicije za tip, dimenzije i opremu koju birate.",
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
export default function PoolCalculatorPage() {
  return <PoolCalculator />;
}
