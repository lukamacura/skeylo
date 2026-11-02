import { arc, C, E, L, P, R, S } from "./_oblici.mjs";

/* zupci: naizmenično spoljni i unutrašnji poluprečnik */
function gear(cx, cy, outer, inner, teeth) {
  const pts = [];
  const step = 360 / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step - 90;
    for (const [da, r] of [
      [-step * 0.28, inner],
      [-step * 0.14, outer],
      [step * 0.14, outer],
      [step * 0.28, inner],
    ]) {
      const t = ((a + da) * Math.PI) / 180;
      pts.push([
        Math.round((cx + r * Math.cos(t)) * 10) / 10,
        Math.round((cy + r * Math.sin(t)) * 10) / 10,
      ]);
    }
  }
  return pts;
}

export default {
  id: "development",
  name: "Development",
  icons: [
    {
      id: "kod",
      name: "Kod",
      kw: "code programiranje html tag developer",
      shapes: [
        L([
          [26, 20],
          [6, 40],
          [26, 60],
        ]),
        L([
          [54, 20],
          [74, 40],
          [54, 60],
        ]),
        L(
          [
            [47, 12],
            [33, 68],
          ],
          { accent: true },
        ),
      ],
    },
    {
      id: "git",
      name: "Git grana",
      kw: "branch verzija commit grana repozitorijum",
      shapes: [
        L([
          [22, 24],
          [22, 56],
        ]),
        S([
          [58, 36],
          [55, 47],
          [38, 50],
          [24, 56],
        ]),
        C(22, 16, 8),
        C(22, 64, 8),
        C(58, 28, 8, { fill: true }),
      ],
    },
    {
      id: "bug",
      name: "Bug",
      kw: "greska buba insekt problem",
      shapes: [
        L([
          [24, 40],
          [8, 32],
        ]),
        L([
          [22, 52],
          [6, 52],
        ]),
        L([
          [25, 62],
          [10, 72],
        ]),
        L([
          [56, 40],
          [72, 32],
        ]),
        L([
          [58, 52],
          [74, 52],
        ]),
        L([
          [55, 62],
          [70, 72],
        ]),
        L([
          [34, 14],
          [27, 4],
        ]),
        L([
          [46, 14],
          [53, 4],
        ]),
        E(22, 26, 36, 50, { fill: true }),
        C(40, 22, 11),
        L([
          [40, 34],
          [40, 75],
        ]),
      ],
    },
    {
      id: "zupcanik",
      name: "Zupčanik",
      kw: "podesavanja settings gear konfiguracija",
      shapes: [P(gear(40, 40, 36, 27, 8), { fill: true }), C(40, 40, 11)],
    },
    {
      id: "terminal",
      name: "Terminal",
      kw: "konzola komandna linija shell cli",
      shapes: [
        R(5, 12, 70, 56, { round: true, fill: true }),
        L([
          [18, 28],
          [32, 40],
          [18, 52],
        ]),
        L([
          [38, 54],
          [60, 54],
        ]),
      ],
    },
    {
      id: "lokot",
      name: "Lokot",
      kw: "bezbednost security zastita sifra zakljucano",
      shapes: [
        S([[25, 38], ...arc(40, 24, 15, 180, 360, 6), [55, 38]]),
        R(14, 36, 52, 38, { round: true, fill: true }),
        C(40, 50, 4.5),
        L([
          [40, 55],
          [40, 65],
        ]),
      ],
    },
    {
      id: "kljuc",
      name: "Ključ",
      kw: "key pristup lozinka auth",
      shapes: [
        L([
          [35, 35],
          [72, 72],
        ]),
        L([
          [54, 54],
          [64, 44],
        ]),
        L([
          [64, 64],
          [74, 54],
        ]),
        C(24, 24, 18, { fill: true }),
        C(19, 19, 5),
      ],
    },
    {
      id: "link",
      name: "Link",
      kw: "veza url lanac povezivanje",
      shapes: [
        R(3, 37, 44, 22, { round: true, angle: -Math.PI / 4 }),
        R(33, 21, 44, 22, { round: true, angle: -Math.PI / 4, accent: true }),
      ],
    },
  ],
};
