// Nepostojeća adresa: ista stranica kao ranije (header i footer sajta), sada i bez
// dinamičkog root layout-a.
import Link from "next/link";
import HeaderClient from "@/components/site/HeaderClient";
import Footer from "@/components/site/Footer";

export default function NotFound() {
  return (
    <>
      <HeaderClient />
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 pt-32 pb-24 text-center">
        <p className="text-sm text-muted-foreground">404</p>
        <h1 className="font-display text-3xl">Ova stranica ne postoji.</h1>
        <Link href="/" className="underline underline-offset-4">
          Nazad na početnu
        </Link>
      </main>
      <Footer />
    </>
  );
}
