import type { Metadata } from "next";
import RoofEstimator from "@/components/calculator/RoofEstimator";
import { getContractorConfig, type SearchParams } from "./config";

export const metadata: Metadata = {
  // absolute: preskače root template "%s | Skeylo" (white-label).
  title: { absolute: "Instant Roof Estimate" },
  description:
    "Get a real price range for a new roof in 30 seconds. No phone call required.",
  openGraph: {
    title: "Instant Roof Estimate",
    description:
      "Get a real price range for a new roof in 30 seconds. No phone call required.",
    images: [],
  },
  robots: { index: false, follow: false },
};

// Demo template: /calculator?company=Austin+Pro+Roofing&city=Austin&phone=5125550199&color=%23c2410c
export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const config = getContractorConfig(await searchParams);
  return <RoofEstimator config={config} />;
}
