import { B, C, L, P, R, S } from "./_oblici.mjs";

export default {
  id: "komunikacija",
  name: "Komunikacija",
  icons: [
    {
      id: "email",
      name: "Email",
      kw: "mejl posta poruka pismo koverta mail",
      shapes: [
        R(5, 16, 70, 48, { fill: true, round: true }),
        L([
          [7, 20],
          [40, 46],
          [73, 20],
        ]),
      ],
    },
    {
      id: "chat",
      name: "Chat",
      kw: "poruka oblacic razgovor komentar sms",
      shapes: [
        B(
          [
            [18, 8],
            [62, 8],
            [74, 20],
            [74, 42],
            [62, 54],
            [38, 54],
            [20, 72],
            [22, 54],
            [18, 54],
            [6, 42],
            [6, 20],
          ],
          { fill: true },
        ),
        C(26, 31, 2.5, { ink: true }),
        C(40, 31, 2.5, { ink: true }),
        C(54, 31, 2.5, { ink: true }),
      ],
    },
    {
      id: "zvono",
      name: "Zvono",
      kw: "notifikacija obavestenje bell alarm",
      shapes: [
        S([
          [32, 64],
          [40, 74],
          [48, 64],
        ]),
        B(
          [
            [40, 8],
            [54, 16],
            [58, 34],
            [62, 50],
            [72, 62],
            [8, 62],
            [18, 50],
            [22, 34],
            [26, 16],
          ],
          { fill: true },
        ),
        C(40, 6, 3),
      ],
    },
    {
      id: "telefon",
      name: "Telefon",
      kw: "poziv call kontakt slusalica",
      shapes: [
        B(
          [
            [14, 7],
            [24, 7],
            [30, 12],
            [33, 23],
            [31, 30],
            [27, 33],
            [33, 42],
            [38, 47],
            [47, 53],
            [50, 49],
            [57, 47],
            [68, 50],
            [73, 56],
            [73, 66],
            [67, 73],
            [50, 70],
            [36, 62],
            [24, 52],
            [14, 38],
            [8, 22],
            [8, 12],
          ],
          { fill: true },
        ),
      ],
    },
    {
      id: "video",
      name: "Video",
      kw: "play snimak youtube reklama film",
      shapes: [
        R(5, 14, 70, 52, { round: true, fill: true }),
        P([
          [32, 28],
          [32, 52],
          [53, 40],
        ]),
      ],
    },
  ],
};
