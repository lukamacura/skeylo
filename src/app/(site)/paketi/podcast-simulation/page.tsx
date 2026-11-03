import type { Metadata } from "next";
import { getPackage, priceLabelFull } from "@/lib/packages";
import PodcastSimulationLanding from "@/components/site/PodcastSimulationLanding";

const pkg = getPackage("podcast-simulation")!;

export const metadata: Metadata = {
  title: `${pkg.name} - ${priceLabelFull(pkg)}`,
  description:
    "30 kratkih videa za Vaših 3 sata mesečno. Studio, voditelj, kamerman i montaža - Vi samo dođete i pričate, mi obezbeđujemo daily upload.",
  openGraph: {
    title: `${pkg.name} | Skeylo`,
    description:
      "Snimite jednom, objavljujte svaki dan. 3 sata u studiju = 30 gotovih klipova za ceo mesec.",
  },
};

export default function PodcastSimulationPage() {
  return <PodcastSimulationLanding />;
}
