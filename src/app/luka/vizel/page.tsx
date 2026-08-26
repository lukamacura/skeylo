import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import VizelDeck from "@/components/site/vizel/VizelDeck";

export const metadata: Metadata = {
  title: "Private presentation",
  description: "Passphrase required.",
  robots: { index: false, follow: false, nocache: true },
};

/* Screenshots are read off disk rather than hardcoded, so dropping files into
   public/vizel/ is all it takes to put them on the benchmarks slide. */
function readShots(dir: string): string[] {
  try {
    return fs
      .readdirSync(path.join(process.cwd(), "public", dir))
      .filter((f) => /\.(webp|png|jpe?g|avif)$/i.test(f))
      .sort()
      .slice(0, 4)
      .map((f) => `/${dir}/${f}`);
  } catch {
    return [];
  }
}

export default function VizelOfferPage() {
  return <VizelDeck fitifyShots={readShots("vizel")} />;
}
