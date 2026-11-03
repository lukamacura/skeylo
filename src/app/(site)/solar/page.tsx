import type { Metadata } from "next";
import SolarLanding from "@/components/site/SolarLanding";

export const metadata: Metadata = {
  title: "Marketing za solarne firme",
  description:
    "Video produkcija, sajt sa kalkulatorom uštede i Meta reklame za solarne firme. Cela marketing agencija u jednom timu - vi montirate, mi punimo kalendar.",
  openGraph: {
    title: "Marketing za solarne firme | Skeylo",
    description:
      "Video produkcija, sajt sa kalkulatorom uštede i Meta reklame - kupci koji su već izračunali da im se elektrana isplati.",
  },
};

export default function SolarPage() {
  return <SolarLanding />;
}
