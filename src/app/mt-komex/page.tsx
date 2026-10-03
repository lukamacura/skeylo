import type { Metadata } from "next";
import MtKomexPitch from "@/components/site/mt-komex/MtKomexPitch";

export const metadata: Metadata = {
  title: "Predlog za MT-Komex",
  description:
    "Meta oglasi po delatnostima, landing stranica i kalkulator uštede za MT-Komex — sistem koji firme dovodi do vašeg inženjera.",
  openGraph: {
    title: "Predlog za MT-Komex | Skeylo",
    description: "Kalkulator uštede i landing za kampanje — isprobajte uživo.",
    images: [{ url: "/calculator/mt-komex/calc-desktop.jpg" }],
  },
  robots: { index: false, follow: false },
};

export default function MtKomexPitchPage() {
  return <MtKomexPitch />;
}
