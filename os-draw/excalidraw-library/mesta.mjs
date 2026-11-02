import { C, L, P, R } from "./_oblici.mjs";

export default {
  id: "mesta",
  name: "Mesta",
  icons: [
    {
      id: "zgrada",
      name: "Firma",
      kw: "zgrada kompanija building office poslovna kancelarija",
      shapes: [
        R(18, 6, 44, 68),
        R(26, 14, 10, 10, { fill: true }),
        R(44, 14, 10, 10, { fill: true }),
        R(26, 30, 10, 10, { fill: true }),
        R(44, 30, 10, 10, { fill: true }),
        R(34, 54, 12, 20),
        L([
          [4, 74],
          [76, 74],
        ]),
      ],
    },
    {
      id: "kuca",
      name: "Kuća",
      kw: "dom home house stan",
      shapes: [
        R(55, 12, 9, 18),
        R(16, 38, 48, 36),
        P(
          [
            [6, 40],
            [40, 8],
            [74, 40],
          ],
          { fill: true },
        ),
        R(33, 50, 14, 24),
      ],
    },
    {
      id: "prodavnica",
      name: "Prodavnica",
      kw: "radnja shop store market ducan",
      shapes: [
        R(12, 30, 56, 44),
        P(
          [
            [6, 30],
            [16, 8],
            [64, 8],
            [74, 30],
          ],
          { fill: true },
        ),
        L([
          [28, 8],
          [24, 30],
        ]),
        L([
          [40, 8],
          [40, 30],
        ]),
        L([
          [52, 8],
          [56, 30],
        ]),
        R(44, 44, 16, 30),
        R(20, 44, 16, 16),
      ],
    },
    {
      id: "fabrika",
      name: "Fabrika",
      kw: "proizvodnja factory industrija pogon",
      shapes: [
        P(
          [
            [54, 74],
            [56, 18],
            [68, 18],
            [72, 74],
          ],
          { fill: true },
        ),
        P([
          [6, 74],
          [6, 44],
          [30, 58],
          [30, 44],
          [54, 58],
          [54, 74],
        ]),
        R(14, 62, 8, 8),
        R(34, 62, 8, 8),
        C(62, 10, 4),
        C(71, 6, 3),
      ],
    },
  ],
};
