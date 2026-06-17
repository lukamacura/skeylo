import type { Metadata } from "next";
import { getPackage, formatPrice } from "@/lib/packages";
import CreativeEngineLanding from "@/components/site/CreativeEngineLanding";

const pkg = getPackage("creative-engine")!;

export const metadata: Metadata = {
  title: `${pkg.name} - ${formatPrice(pkg.price)}€/${pkg.priceNote}`,
  description:
    "Nisi zadovoljan rezultatima kampanje? Skeylo kreative su izgenerisale preko 113.000€. 10 premium kreativa prilagođenih tvom brendu plus strateški vodič.",
  openGraph: {
    title: `${pkg.name} | Skeylo`,
    description:
      "Skeylo kreative su izgenerisale preko 113.000€. 10 premium kreativa + strateški PDF vodič, spremno za upotrebu.",
  },
};

export default function CreativeEnginePage() {
  return <CreativeEngineLanding />;
}
