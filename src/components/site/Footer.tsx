import Link from "next/link";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { PACKAGES } from "@/lib/packages";

export default function Footer() {
  return (
    <footer className="relative border-t border-border">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Skeylo"
                width={44}
                height={44}
                className="h-16 w-16 object-contain"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Full-stack marketing agencija.
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <a
                href="mailto:office@skeylo.com"
                className="flex items-center gap-2 text-foreground/80 transition-colors hover:text-primary"
              >
                <Mail className="size-4" />
                office@skeylo.com
              </a>
              <a
                href="tel:+381600000000"
                className="flex items-center gap-2 text-foreground/80 transition-colors hover:text-primary"
              >
                <Phone className="size-4" />
                +381 63 1012474
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Paketi
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {PACKAGES.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/paketi/${p.slug}`}
                    className="text-foreground/80 transition-colors hover:text-primary"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Navigacija
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/#rezultati"
                  className="text-foreground/80 transition-colors hover:text-primary"
                >
                  Rezultati
                </Link>
              </li>
              <li>
                <Link
                  href="/#paketi"
                  className="text-foreground/80 transition-colors hover:text-primary"
                >
                  Paketi
                </Link>
              </li>
              <li>
                <Link
                  href="/meet"
                  className="text-foreground/80 transition-colors hover:text-primary"
                >
                  Zakaži sastanak
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Skeylo. Sva prava zadržana.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="transition-colors hover:text-primary"
            >
              Politika privatnosti
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-primary"
            >
              Uslovi korišćenja
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
