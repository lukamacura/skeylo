import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PACKAGES, getPackage, formatPrice } from "@/lib/packages";
import PackageLanding from "@/components/site/PackageLanding";

// profit-za-tebe ima svoju namensku stranicu (/paketi/profit-za-tebe)
export function generateStaticParams() {
  return PACKAGES.filter((p) => p.slug !== "profit-za-tebe").map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackage(slug);
  if (!pkg) return {};
  const title = `${pkg.name} - ${formatPrice(pkg.price)}€/${pkg.priceNote}`;
  return {
    title,
    description: pkg.heroSubtitle,
    openGraph: { title: `${title} | Skeylo`, description: pkg.heroSubtitle },
  };
}

export default async function PackagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pkg = getPackage(slug);
  if (!pkg) notFound();
  return <PackageLanding pkg={pkg} />;
}
