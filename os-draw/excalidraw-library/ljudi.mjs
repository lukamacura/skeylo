import { B, C, L, P, R, S } from "./_oblici.mjs";

export default {
  id: "ljudi",
  name: "Ljudi",
  icons: [
    {
      id: "osoba",
      name: "Osoba",
      kw: "covek user korisnik person lice",
      shapes: [
        B(
          [
            [14, 74],
            [16, 54],
            [26, 42],
            [40, 38],
            [54, 42],
            [64, 54],
            [66, 74],
          ],
          { fill: true },
        ),
        C(40, 20, 14),
      ],
    },
    {
      id: "tim",
      name: "Tim",
      kw: "grupa ljudi team group kolege",
      shapes: [
        C(16, 28, 9),
        S([
          [2, 66],
          [4, 50],
          [16, 42],
          [26, 45],
        ]),
        C(64, 28, 9),
        S([
          [78, 66],
          [76, 50],
          [64, 42],
          [54, 45],
        ]),
        B(
          [
            [20, 74],
            [22, 56],
            [31, 46],
            [40, 43],
            [49, 46],
            [58, 56],
            [60, 74],
          ],
          { fill: true },
        ),
        C(40, 26, 12),
      ],
    },
    {
      id: "korisnik-laptop",
      name: "Za laptopom",
      kw: "korisnik user racunar radi kancelarija",
      shapes: [
        S([
          [14, 60],
          [18, 40],
          [28, 31],
          [40, 28],
          [52, 31],
          [62, 40],
          [66, 60],
        ]),
        C(40, 14, 11),
        R(22, 42, 36, 25, { fill: true, round: true }),
        P([
          [14, 67],
          [66, 67],
          [72, 75],
          [8, 75],
        ]),
      ],
    },
    {
      id: "kupac",
      name: "Kupac",
      kw: "klijent customer kesa kupovina musterija",
      shapes: [
        B([
          [6, 74],
          [8, 54],
          [16, 44],
          [28, 40],
          [40, 44],
          [47, 54],
          [48, 74],
        ]),
        C(28, 22, 13),
        R(50, 44, 26, 30, { fill: true }),
        S([
          [56, 44],
          [56, 36],
          [63, 31],
          [70, 36],
          [70, 44],
        ]),
      ],
    },
    {
      id: "admin",
      name: "Admin",
      kw: "administrator stit prava zastita korisnik",
      shapes: [
        B([
          [4, 74],
          [6, 54],
          [14, 44],
          [26, 40],
          [38, 44],
          [45, 52],
          [46, 74],
        ]),
        C(26, 22, 13),
        P(
          [
            [46, 42],
            [60, 36],
            [76, 42],
            [76, 58],
            [61, 76],
            [46, 58],
          ],
          { fill: true },
        ),
        L([
          [53, 55],
          [59, 62],
          [69, 49],
        ]),
      ],
    },
  ],
};
