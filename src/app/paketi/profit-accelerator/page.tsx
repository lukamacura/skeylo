import type { Metadata } from "next";
import { getPackage, formatPrice } from "@/lib/packages";
import ProfitAcceleratorLanding from "@/components/site/ProfitAcceleratorLanding";

const pkg = getPackage("profit-accelerator")!;

export const metadata: Metadata = {
  title: `${pkg.name} - ${formatPrice(pkg.price)}€/${pkg.priceNote}`,
  description:
    "Preuzimamo tvoje Meta oglašavanje od A do Š - 20 kreativa, vođene FB & IG kampanje i analiza sajta. Sistem koji pretvara budžet u predvidiv profit.",
  openGraph: {
    title: `${pkg.name} | Skeylo`,
    description:
      "Vođene Meta kampanje, 20 kreativa za skaliranje i analiza sajta - ozbiljan rast kroz oglašavanje fokusirano na ROI.",
  },
};

export default function ProfitAcceleratorPage() {
  return <ProfitAcceleratorLanding />;
}
