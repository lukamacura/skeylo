// Stranice sajta: header i footer. Zagrade u imenu foldera znače da (site) nije deo
// adrese: (site)/solar/page.tsx je i dalje /solar.
import HeaderClient from "@/components/site/HeaderClient";
import Footer from "@/components/site/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeaderClient />
      <main>{children}</main>
      <Footer />
    </>
  );
}
