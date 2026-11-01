import type { Metadata } from "next";
import SlideDeck from "@/components/uml/SlideDeck";
import { SLIDE_CHAPTERS } from "@/lib/uml/uml-content";

const TITLE = "Od skice do realizacije UML dijagrama - Kurirska služba";
const DESCRIPTION =
  "UML deo projekta iz predmeta PoIS na temu Kurirska služba: skice iz Excalidraw-a i interaktivni dijagrami slučajeva upotrebe, klasa i sekvenci.";

export const metadata: Metadata = {
  // absolute: bez sufiksa „| Skeylo“ iz root layout-a
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  robots: { index: false, follow: false },
};

// Link /uml#4 otvara četvrti slajd. Server ne vidi hash, pa ovaj stil sprečava
// bljesak naslovnog slajda dok se React ne hidrira (SlideDeck ga tada uklanja).
const PRE_HYDRATION = `(function(){var m=/^#(\\d+)$/.exec(location.hash);if(!m||m[1]==="1")return;var n=Number(m[1]);if(n<1||n>${SLIDE_CHAPTERS.length})return;var c=${JSON.stringify(SLIDE_CHAPTERS)}[n-1];var s=document.createElement("style");s.id="uml-pre-hydration";s.textContent='@media screen{[data-uml-slide]{display:none!important}[data-uml-slide="'+n+'"]{display:flex!important}.uml-bg{opacity:0!important}.uml-bg[data-chapter="'+c+'"]{opacity:1!important}.uml-sheet{opacity:1!important;transform:none!important}}';document.head.appendChild(s)})()`;

// Bez JS-a: svi slajdovi jedan ispod drugog, svi opisi vidljivi, bez kontrola.
const NO_SCRIPT_CSS = `html:has(.uml-deck),html:has(.uml-deck) body{overflow:visible!important;height:auto!important;font-size:16px!important}.uml-deck{position:static!important;display:block!important;height:auto!important;overflow:visible!important;background:#fffdf8}.uml-stage{position:static!important;margin:0!important}.uml-bg,.uml-sheet,.uml-dock-wrap,.uml-js-only,.uml-btn{display:none!important}.uml-slide{position:static!important;display:flex!important;padding:32px!important;animation:none!important}.uml-title{color:#1a1442!important}.uml-title-line{border-color:#1a1442!important}.uml-figure{height:80vh!important;flex:none!important}.uml-split,.uml-system{display:block!important}.uml-tabpanel{display:block!important;height:auto!important;margin-bottom:24px}`;

export default function UmlPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PRE_HYDRATION }} />
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: NO_SCRIPT_CSS }} />
      </noscript>
      <SlideDeck />
    </>
  );
}
