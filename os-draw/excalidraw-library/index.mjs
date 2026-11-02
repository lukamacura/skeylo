/* Biblioteka ikonica za blok Crtež. Nova ikonica se dodaje u fajl svoje kategorije:
   { id, name, kw, shapes: [...] } u kvadratu 80×80, a oblici su u _oblici.mjs. */
import { element } from "./_oblici.mjs";
import development from "./development.mjs";
import komunikacija from "./komunikacija.mjs";
import ljudi from "./ljudi.mjs";
import marketing from "./marketing.mjs";
import mesta from "./mesta.mjs";
import planiranje from "./planiranje.mjs";
import uredjaji from "./uredjaji.mjs";

export const CATEGORIES = [
  ljudi,
  mesta,
  uredjaji,
  development,
  komunikacija,
  marketing,
  planiranje,
];

/* id počinje sa sk-: po tome se ugrađene ikonice razlikuju od ličnih u biblioteci */
export function libraryItems() {
  return CATEGORIES.flatMap((c) =>
    c.icons.map((icon) => ({
      id: `sk-${icon.id}`,
      status: "published",
      created: 1,
      name: icon.name,
      elements: icon.shapes.map((s, i) => element(icon.id, i, s)),
    })),
  );
}
