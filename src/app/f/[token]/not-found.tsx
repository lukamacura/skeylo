// Link foldera koji je ugašen, obrisan ili pogrešno prekucan.
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 px-4 text-center">
      <Link href="/" aria-label="Skeylo">
        <Image
          src="/brand/logo.webp"
          alt="Skeylo"
          width={2000}
          height={717}
          className="h-8 w-auto opacity-80"
          priority
        />
      </Link>
      <h1 className="text-3xl sm:text-4xl font-bold">Link više ne važi</h1>
    </main>
  );
}
