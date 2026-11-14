import type { Metadata, Viewport } from "next";
import BalsoaDeck from "@/components/balsoa/BalsoaDeck";
import { SLIDE_COUNT } from "@/components/balsoa/meta";

const TITLE = "Balsoa Consulting × Macura Solutions · AI Partnerstvo";
const DESCRIPTION =
  "Od 300 strana PDF-a do tačnog odgovora za 3 sekunde. Interni AI sistemi za energetiku i tendere.";

export const metadata: Metadata = {
  // absolute: bez sufiksa „| Skeylo“ iz root layout-a
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0f1b26" };

// Link /balsoa#5 otvara peti slajd. Server ne vidi hash, pa ovaj stil do
// hidratacije sakriva naslovni slajd i sadržaj ciljnog (vidi se samo njegova
// pozadina). BalsoaDeck ga uklanja čim pokaže pravi slajd sa ulaznom animacijom.
const PRE_HYDRATION = `(function(){var m=/^#(\\d+)$/.exec(location.hash);if(!m)return;var n=+m[1];if(n<2||n>${SLIDE_COUNT})return;var s=document.createElement("style");s.id="bx-pre";s.textContent='[data-bx-slide]{opacity:0!important;visibility:hidden!important;transition:none!important}[data-bx-slide="'+n+'"]{opacity:1!important;visibility:visible!important;z-index:3!important}[data-bx-slide="'+n+'"]>*{opacity:0!important}';document.head.appendChild(s)})()`;

// Bez JS-a: slajdovi jedan ispod drugog, bez animacija i kontrola.
const NO_SCRIPT_CSS = `html:has(.bx),html:has(.bx) body{overflow:auto!important;height:auto!important}.bx{position:relative!important;inset:auto!important}.bx-slide{position:relative!important;opacity:1!important;visibility:visible!important;height:100vh!important;min-height:46rem}.bx-frame{transform:none!important;opacity:1!important}.bx-nav,.bx-progress{display:none!important}.bx *,.bx *::before,.bx *::after{animation:none!important}`;

export default function BalsoaPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PRE_HYDRATION }} />
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: NO_SCRIPT_CSS }} />
      </noscript>
      <BalsoaDeck />
    </>
  );
}
