import localFont from "next/font/local";

// Lokalni fontovi: next/font/google ume da obori Turbopack build (vidi /ils).
// Sve tri porodice imaju š, đ, č, ć i ž. Licenca je OFL, fajlovi su pored fontova.
const fraunces = localFont({
  src: "./fonts/Fraunces.woff2",
  weight: "400 800",
  variable: "--uml-font-display",
  display: "swap",
});

const figtree = localFont({
  src: "./fonts/Figtree.woff2",
  weight: "300 900",
  variable: "--uml-font-body",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono.woff2",
  weight: "100 800",
  variable: "--uml-font-mono",
  display: "swap",
});

export const UML_FONT_VARS = `${fraunces.variable} ${figtree.variable} ${jetbrainsMono.variable}`;
