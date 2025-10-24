"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = { question: string; answer: string };

const faqs: FaqItem[] = [
  {
    question: "Da li stvarno dobijam nešto besplatno?",
    answer:
      "Da. Analiza je potpuno besplatna - ali nije generička. Analizu detaljno kreiramo potpuno personalizovano koristeći informacije koje dobijemo od Vas. Prolazimo kroz kanale, podatke i oglase i dajemo konkretne preporuke zasnovane na brojkama.",
  },
  {
    question: "Šta znači 'fullstack marketing'?",
    answer:
      "Spajamo ceo funnel: paid, content, SEO, analytics, CRO i prodaju. Ne lovimo novac, već optimizujemo sistem koji donosi profit.",
  },
  {
    question: "Koliko brzo vidim rezultate?",
    answer:
      "Tipično u roku 30–90 dana, u zavisnosti od industrije i trenutnog stanja. Bez nerealnih obećanja - fokus na egzekuciji koja se meri.",
  },
  {
    question: "Da li radite sa malim biznisima?",
    answer:
      "Da, ako postoji ambicija za rast i spremnost na implementaciju preporuka. Ne radimo 'na pola'.",
  },
  {
    question: "Zašto da verujem vašoj analizi?",
    answer:
      "Jer svaka preporuka ima trag u podacima i vlasnika zadatka. Dajemo jasan plan: šta, ko i do kada.",
  },
];

export default function Faq() {
  // ✅ Rešava TS grešku - stanje je number | null
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-black text-foreground py-20 px-6 md:px-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-10 text-center text-foreground">
          Česta pitanja
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="border border-neutral-800 rounded-2xl bg-neutral-950/40"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-6 px-6 py-5 text-left hover:bg-neutral-900/60 transition"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg font-medium">{faq.question}</span>
                  <ChevronDown
                    className={`shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Jednostavna tranzicija: grid-rows [0fr -> 1fr] + overflow-hidden */}
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out px-6 ${
                    isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden text-neutral-300">
                    <p className="leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
