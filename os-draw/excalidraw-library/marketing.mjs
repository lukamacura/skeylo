import { arc, B, C, E, L, P, R, S } from "./_oblici.mjs";

function star(cx, cy, outer, inner) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer;
    const t = ((i * 36 - 90) * Math.PI) / 180;
    pts.push([
      Math.round((cx + r * Math.cos(t)) * 10) / 10,
      Math.round((cy + r * Math.sin(t)) * 10) / 10,
    ]);
  }
  return pts;
}

export default {
  id: "marketing",
  name: "Marketing i biznis",
  icons: [
    {
      id: "megafon",
      name: "Megafon",
      kw: "reklama oglas objava kampanja glas announcement",
      shapes: [
        P([
          [22, 48],
          [28, 72],
          [38, 72],
          [32, 50],
        ]),
        R(5, 30, 13, 18, { round: true }),
        P(
          [
            [18, 30],
            [52, 12],
            [52, 66],
            [18, 48],
          ],
          { fill: true },
        ),
        S([
          [60, 28],
          [65, 39],
          [60, 50],
        ]),
        S([
          [67, 18],
          [76, 39],
          [67, 60],
        ]),
      ],
    },
    {
      id: "meta",
      name: "Meta",
      kw: "cilj target publika strelica goal",
      shapes: [
        C(36, 44, 32),
        C(36, 44, 20, { fill: true }),
        C(36, 44, 8),
        L([
          [36, 44],
          [70, 10],
        ]),
        L([
          [62, 8],
          [62, 18],
          [72, 18],
        ]),
      ],
    },
    {
      id: "levak",
      name: "Levak",
      kw: "funnel prodaja konverzija filter",
      shapes: [
        P(
          [
            [6, 10],
            [74, 10],
            [47, 42],
            [47, 66],
            [33, 74],
            [33, 42],
          ],
          { fill: true },
        ),
        L([
          [17, 23],
          [63, 23],
        ]),
        L([
          [27, 34],
          [53, 34],
        ]),
      ],
    },
    {
      id: "grafik",
      name: "Grafik rasta",
      kw: "rast analitika chart statistika prihod growth",
      shapes: [
        L([
          [8, 6],
          [8, 72],
          [76, 72],
        ]),
        R(18, 52, 11, 20, { fill: true }),
        R(36, 40, 11, 32, { fill: true }),
        R(54, 28, 11, 44, { fill: true }),
        L(
          [
            [16, 40],
            [32, 28],
            [46, 30],
            [68, 8],
          ],
          { arrow: true },
        ),
      ],
    },
    {
      id: "pita",
      name: "Pie chart",
      kw: "pita grafikon udeo procenat analitika",
      shapes: [
        C(36, 44, 31),
        L([
          [36, 44],
          [36, 13],
        ]),
        L([
          [36, 44],
          [60, 64],
        ]),
        P([[44, 36], ...arc(44, 36, 31, -90, 0, 7)], { fill: true }),
      ],
    },
    {
      id: "novac",
      name: "Novac",
      kw: "pare dinari evro dolar budzet cena keš prihod money",
      shapes: [
        R(4, 18, 72, 44, { round: true, fill: true }),
        S([
          [47, 32],
          [40, 28],
          [33, 32],
          [36, 38],
          [44, 42],
          [47, 48],
          [40, 52],
          [33, 48],
        ]),
        L([
          [40, 23],
          [40, 57],
        ]),
        C(14, 40, 2.5, { ink: true }),
        C(66, 40, 2.5, { ink: true }),
      ],
    },
    {
      id: "kartica",
      name: "Kartica",
      kw: "placanje kreditna payment visa banka",
      shapes: [
        R(5, 16, 70, 48, { round: true }),
        R(5, 26, 70, 10, { fill: true }),
        R(13, 46, 14, 9),
        L([
          [46, 51],
          [66, 51],
        ]),
      ],
    },
    {
      id: "korpa",
      name: "Korpa",
      kw: "kupovina shop cart webshop porudzbina",
      shapes: [
        P(
          [
            [20, 22],
            [75, 22],
            [66, 46],
            [26, 46],
          ],
          { fill: true },
        ),
        L([
          [4, 10],
          [16, 10],
          [28, 56],
          [66, 56],
        ]),
        C(33, 68, 6),
        C(61, 68, 6),
      ],
    },
    {
      id: "raketa",
      name: "Raketa",
      kw: "lansiranje start launch rast startup",
      shapes: [
        P([
          [26, 38],
          [12, 58],
          [28, 56],
        ]),
        P([
          [54, 38],
          [68, 58],
          [52, 56],
        ]),
        S([
          [33, 60],
          [40, 76],
          [47, 60],
        ]),
        B(
          [
            [40, 4],
            [52, 20],
            [55, 40],
            [52, 58],
            [28, 58],
            [25, 40],
            [28, 20],
          ],
          { fill: true },
        ),
        C(40, 28, 6.5),
      ],
    },
    {
      id: "sijalica",
      name: "Sijalica",
      kw: "ideja idea inovacija kreativa svetlo",
      shapes: [
        B(
          [
            [31, 57],
            [30, 50],
            ...arc(40, 29, 25, 148, 392, 11),
            [50, 50],
            [49, 57],
          ],
          { fill: true },
        ),
        L([
          [32, 34],
          [36, 28],
          [40, 34],
          [44, 28],
          [48, 34],
        ]),
        L([
          [32, 62],
          [48, 62],
        ]),
        L([
          [34, 69],
          [46, 69],
        ]),
        L([
          [37, 75],
          [43, 75],
        ]),
      ],
    },
    {
      id: "zvezda",
      name: "Zvezda",
      kw: "ocena recenzija rating omiljeno review",
      shapes: [P(star(40, 42, 37, 16), { fill: true })],
    },
    {
      id: "zastavica",
      name: "Zastavica",
      kw: "milestone cilj flag faza etapa",
      shapes: [
        L([
          [18, 5],
          [18, 75],
        ]),
        L([
          [8, 75],
          [28, 75],
        ]),
        P(
          [
            [18, 9],
            [70, 9],
            [58, 25],
            [70, 42],
            [18, 42],
          ],
          { fill: true },
        ),
      ],
    },
  ],
};
