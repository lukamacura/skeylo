import type { Metadata } from "next";
import BazeniLanding from "@/components/site/bazeni/BazeniLanding";

export const metadata: Metadata = {
  title: "Predlog za firme koje grade bazene",
  description:
    "Meta oglasi, landing stranica i kalkulator bazena: sistem koji vlasnike novih kuća dovodi do vašeg telefona.",
  openGraph: {
    title: "Predlog za firme koje grade bazene | Skeylo",
    description:
      "Kalkulator bazena i kampanje koje donose upite. Isprobajte uživo.",
    images: [{ url: "/clients/bazeni/result-desktop.jpg" }],
  },
  robots: { index: false, follow: false },
};

export default function BazeniPage() {
  return <BazeniLanding />;
}
