// Redosled i pozadina slajdova. Ovaj fajl nije "use client", pa ga čita i page.tsx.
export type Tone = "grad" | "dark" | "cream" | "sand" | "amber";

export const SLIDES: { title: string; tone: Tone }[] = [
  {
    title: "Od 300 strana PDF-a do tačnog odgovora za 3 sekunde",
    tone: "grad",
  },
  { title: "Problem", tone: "cream" },
  { title: "Rešenje", tone: "cream" },
  { title: "Kako radi", tone: "sand" },
  { title: "Demo", tone: "dark" },
  { title: "Primena", tone: "cream" },
  { title: "Analiza jednog tendera", tone: "amber" },
  { title: "ROI kalkulator", tone: "dark" },
  { title: "Bezbednost", tone: "cream" },
  { title: "Luka Macura", tone: "dark" },
  { title: "Korak 1", tone: "sand" },
  { title: "Korak 2", tone: "dark" },
  { title: "Sledeći korak", tone: "grad" },
];

export const SLIDE_COUNT = SLIDES.length;
