import localFont from "next/font/local";

// Inter kao u PDF-u. Lokalni fajl, ne next/font/google (vidi /ils): zvanični
// google/fonts izvor, wght sužen na 400–800, opsz osa ostaje (browser je sam bira
// po veličini teksta), subset na latin + Latin Extended-A (š, đ, č, ć, ž), € i
// strelice. Licenca je OFL, fajl je pored fonta.
const inter = localFont({
  src: "./fonts/Inter.woff2",
  weight: "400 800",
  variable: "--bx-font",
  display: "swap",
});

export const BALSOA_FONT = inter.variable;
