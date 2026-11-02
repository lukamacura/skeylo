import { arc, B, C, E, L, P, R, S } from "./_oblici.mjs";

export default {
  id: "uredjaji",
  name: "Uređaji i web",
  icons: [
    {
      id: "sajt",
      name: "Sajt",
      kw: "browser prozor website stranica web",
      shapes: [
        R(5, 12, 70, 56, { round: true }),
        L([
          [5, 26],
          [75, 26],
        ]),
        C(13, 19, 2, { ink: true }),
        C(21, 19, 2, { ink: true }),
        C(29, 19, 2, { ink: true }),
        R(13, 34, 24, 26, { fill: true }),
        L([
          [44, 37],
          [67, 37],
        ]),
        L([
          [44, 47],
          [67, 47],
        ]),
        L([
          [44, 57],
          [58, 57],
        ]),
      ],
    },
    {
      id: "mobilni",
      name: "Mobilni",
      kw: "telefon phone smartphone aplikacija",
      shapes: [
        R(22, 4, 36, 72, { round: true }),
        R(27, 14, 26, 48, { fill: true }),
        L([
          [36, 9],
          [44, 9],
        ]),
        C(40, 69, 2.5),
      ],
    },
    {
      id: "laptop",
      name: "Laptop",
      kw: "racunar notebook kompjuter",
      shapes: [
        R(14, 12, 52, 38, { round: true }),
        R(20, 18, 40, 26, { fill: true }),
        P([
          [14, 50],
          [66, 50],
          [76, 66],
          [4, 66],
        ]),
        L([
          [32, 58],
          [48, 58],
        ]),
      ],
    },
    {
      id: "desktop",
      name: "Desktop",
      kw: "racunar monitor ekran kompjuter pc",
      shapes: [
        R(6, 8, 68, 46, { round: true }),
        R(12, 14, 56, 34, { fill: true }),
        L([
          [34, 54],
          [32, 70],
        ]),
        L([
          [46, 54],
          [48, 70],
        ]),
        L([
          [22, 71],
          [58, 71],
        ]),
      ],
    },
    {
      id: "server",
      name: "Server",
      kw: "hosting rack infrastruktura",
      shapes: [
        ...[8, 31, 54].flatMap((y) => [
          R(10, y, 60, 18, { round: true }),
          C(21, y + 9, 3.5, { fill: true }),
          L([
            [44, y + 9],
            [62, y + 9],
          ]),
        ]),
      ],
    },
    {
      id: "baza",
      name: "Baza podataka",
      kw: "database db podaci sql tabele",
      shapes: [
        L([
          [12, 17],
          [12, 62],
        ]),
        L([
          [68, 17],
          [68, 62],
        ]),
        S([
          [12, 32],
          [24, 39],
          [40, 41],
          [56, 39],
          [68, 32],
        ]),
        S([
          [12, 47],
          [24, 54],
          [40, 56],
          [56, 54],
          [68, 47],
        ]),
        S([
          [12, 62],
          [24, 70],
          [40, 72],
          [56, 70],
          [68, 62],
        ]),
        E(12, 8, 56, 18, { fill: true }),
      ],
    },
    {
      id: "cloud",
      name: "Cloud",
      kw: "oblak hosting cloud servis",
      shapes: [
        B(
          [
            ...arc(21, 47, 15, 90, 265, 6),
            ...arc(40, 31, 18, 195, 345, 7),
            ...arc(60, 46, 16, 275, 450, 6),
          ],
          { fill: true },
        ),
      ],
    },
    {
      id: "api",
      name: "API",
      kw: "konektor integracija utikac plug connector povezivanje",
      shapes: [
        L([
          [2, 40],
          [12, 40],
        ]),
        R(12, 28, 20, 24, { fill: true, round: true }),
        L([
          [32, 34],
          [42, 34],
        ]),
        L([
          [32, 46],
          [42, 46],
        ]),
        R(46, 26, 20, 28, { round: true }),
        L([
          [66, 40],
          [78, 40],
        ]),
      ],
    },
    {
      id: "globus",
      name: "Globus",
      kw: "svet internet web planeta jezik",
      shapes: [
        C(40, 40, 34, { fill: true }),
        E(25, 6, 30, 68),
        L([
          [6, 40],
          [74, 40],
        ]),
        S([
          [12, 22],
          [40, 28],
          [68, 22],
        ]),
        S([
          [12, 58],
          [40, 52],
          [68, 58],
        ]),
      ],
    },
  ],
};
