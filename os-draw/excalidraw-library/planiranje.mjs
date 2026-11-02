import { C, L, P, R } from "./_oblici.mjs";

const row = (y) => [
  R(20, y, 11, 11, { fill: true }),
  L([
    [22, y + 6],
    [25, y + 9],
    [30, y + 2],
  ]),
  L([
    [38, y + 6],
    [60, y + 6],
  ]),
];

export default {
  id: "planiranje",
  name: "Planiranje",
  icons: [
    {
      id: "kalendar",
      name: "Kalendar",
      kw: "datum rok termin raspored calendar",
      shapes: [
        R(7, 14, 66, 60, { round: true }),
        R(7, 14, 66, 16, { fill: true }),
        L([
          [24, 6],
          [24, 21],
        ]),
        L([
          [56, 6],
          [56, 21],
        ]),
        ...[39, 55].flatMap((y) => [17, 35, 53].map((x) => R(x, y, 10, 9))),
      ],
    },
    {
      id: "sat",
      name: "Sat",
      kw: "vreme clock rok trajanje time",
      shapes: [
        C(40, 40, 35, { fill: true }),
        L([
          [40, 18],
          [40, 40],
          [55, 49],
        ]),
      ],
    },
    {
      id: "dokument",
      name: "Dokument",
      kw: "fajl papir ugovor file izvestaj",
      shapes: [
        P([
          [14, 5],
          [48, 5],
          [66, 23],
          [66, 75],
          [14, 75],
        ]),
        P(
          [
            [48, 5],
            [48, 23],
            [66, 23],
          ],
          { fill: true },
        ),
        L([
          [24, 36],
          [56, 36],
        ]),
        L([
          [24, 48],
          [56, 48],
        ]),
        L([
          [24, 60],
          [44, 60],
        ]),
      ],
    },
    {
      id: "folder",
      name: "Folder",
      kw: "fascikla arhiva direktorijum",
      shapes: [
        P(
          [
            [5, 16],
            [30, 16],
            [38, 27],
            [75, 27],
            [75, 68],
            [5, 68],
          ],
          { fill: true },
        ),
        L([
          [5, 36],
          [75, 36],
        ]),
      ],
    },
    {
      id: "checklist",
      name: "Checklist",
      kw: "lista zadaci todo provera stavke",
      shapes: [
        R(11, 5, 58, 70, { round: true }),
        ...row(16),
        ...row(35),
        ...row(54),
      ],
    },
    {
      id: "upozorenje",
      name: "Upozorenje",
      kw: "paznja warning opasnost rizik alert",
      shapes: [
        P(
          [
            [40, 6],
            [76, 72],
            [4, 72],
          ],
          { fill: true },
        ),
        L([
          [40, 28],
          [40, 51],
        ]),
        C(40, 61, 2.5, { ink: true }),
      ],
    },
    {
      id: "lupa",
      name: "Lupa",
      kw: "pretraga search trazi seo istrazivanje",
      shapes: [
        P([
          [50, 56],
          [56, 50],
          [76, 70],
          [70, 76],
        ]),
        C(33, 33, 27, { fill: true }),
      ],
    },
  ],
};
