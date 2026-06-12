import type { Metadata } from "next";
import { getPackage, formatPrice } from "@/lib/packages";
import ProfitZaTebeLanding from "@/components/site/ProfitZaTebeLanding";

const pkg = getPackage("profit-za-tebe")!;

export const metadata: Metadata = {
  title: `${pkg.name} - ${formatPrice(pkg.price)}€/${pkg.priceNote}`,
  description:
    "Naš tim radi sve umesto tebe - analiza tržišta, kreative, Meta reklame i sajt sa finansijskim izveštajima. Ceo biznis online, ključ u ruke.",
  openGraph: {
    title: `${pkg.name} | Skeylo`,
    description:
      "Ceo biznis online - ključ u ruke. Marketing, webshop, zakazivanje i finansijski panel na jednom mestu.",
  },
};

export default function ProfitZaTebePage() {
  return <ProfitZaTebeLanding />;
}
