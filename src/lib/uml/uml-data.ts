// Svi elementi i koordinate tri dijagrama. Komponente samo crtaju ove podatke.
// Model je završen i proveren: imena, redosled i kardinalnosti se ne menjaju.

import {
  elbowPath,
  ellipseEdge,
  ellipsePointAtY,
  linePath,
  rectPort,
  sCurvePath,
  type Point,
  type Rect,
  type Side,
} from "./geometry";

export type TextAnchor = "start" | "middle" | "end";
export type LabelPosition = { x: number; y: number; anchor: TextAnchor };

/* ------------------------------------------------------------------ */
/* Dijagram slučajeva upotrebe                                         */
/* ------------------------------------------------------------------ */

export type ActorId = "A1" | "A2" | "A3" | "A4";
export type UseCaseId =
  | "U1"
  | "U2"
  | "U3"
  | "U4"
  | "U5"
  | "U6"
  | "U7"
  | "U8"
  | "U9";
export type UseCaseKind = "osnovni" | "ukljuceni" | "prosirujuci";

export type UcActor = {
  id: ActorId;
  name: string;
  cx: number;
  top: number;
  /** Strana dijagrama; linija polazi od ruke okrenute ka okviru sistema. */
  side: "left" | "right";
};

export type UseCase = {
  id: UseCaseId;
  name: string;
  kind: UseCaseKind;
  cx: number;
  cy: number;
  /** Odeljak ispod naziva, prošireni slučaj upotrebe (P1, sl. 40). */
  extensionPoints?: {
    rx: number;
    ry: number;
    nameY: number;
    dividerY: number;
    textX: number;
    headingY: number;
    /** Redovi teksta, kao na skici. */
    lines: { y: number; text: string }[];
  };
};

export type UcAssociation = { actor: ActorId; useCase: UseCaseId };

export type UcDependency = {
  from: UseCaseId;
  to: UseCaseId;
  stereotype: "«include»" | "«extend»";
  label: LabelPosition;
  /** Meka kriva kroz sredinu okvira; `arriveY` je visina ulaska u drugi element. */
  curve?: { arriveY: number };
};

export const UC_VIEWBOX = { w: 1280, h: 580 };
export const UC_FRAME = {
  x: 190,
  y: 6,
  w: 900,
  h: 568,
  title: "Kurirska služba",
  titleY: 44,
};
export const UC_RX = 122;
export const UC_RY = 37;

export const UC_ACTORS: UcActor[] = [
  { id: "A1", name: "Korisnik", cx: 90, top: 118, side: "left" },
  { id: "A2", name: "Zaposleni", cx: 90, top: 342, side: "left" },
  { id: "A3", name: "Kurir", cx: 1190, top: 216, side: "right" },
  { id: "A4", name: "Primalac", cx: 1190, top: 400, side: "right" },
];

export const USE_CASES: UseCase[] = [
  { id: "U1", name: "Kreiranje pošiljke", kind: "osnovni", cx: 370, cy: 104 },
  { id: "U2", name: "Plaćanje pošiljke", kind: "osnovni", cx: 370, cy: 196 },
  { id: "U3", name: "Praćenje pošiljke", kind: "osnovni", cx: 370, cy: 288 },
  {
    id: "U4",
    name: "Dodela pošiljke kuriru",
    kind: "osnovni",
    cx: 370,
    cy: 380,
  },
  { id: "U5", name: "Ažuriranje statusa", kind: "ukljuceni", cx: 370, cy: 500 },
  { id: "U6", name: "Obračun cene", kind: "ukljuceni", cx: 910, cy: 104 },
  { id: "U7", name: "Preuzimanje pošiljke", kind: "osnovni", cx: 910, cy: 216 },
  {
    id: "U8",
    name: "Isporuka pošiljke",
    kind: "osnovni",
    cx: 910,
    cy: 336,
    extensionPoints: {
      rx: 146,
      ry: 66,
      nameY: 297,
      dividerY: 314,
      textX: 824,
      headingY: 332,
      lines: [
        { y: 350, text: "predaja pošiljke: primalac" },
        { y: 368, text: "ne preuzme pošiljku" },
      ],
    },
  },
  {
    id: "U9",
    name: "Vraćanje pošiljke",
    kind: "prosirujuci",
    cx: 910,
    cy: 500,
  },
];

export const UC_EXTENSION_HEADING = "Extension points";

export const UC_ASSOCIATIONS: UcAssociation[] = [
  { actor: "A1", useCase: "U1" },
  { actor: "A1", useCase: "U2" },
  { actor: "A1", useCase: "U3" },
  { actor: "A2", useCase: "U4" },
  { actor: "A3", useCase: "U7" },
  { actor: "A3", useCase: "U8" },
  { actor: "A4", useCase: "U8" },
];

export const UC_DEPENDENCIES: UcDependency[] = [
  {
    from: "U1",
    to: "U6",
    stereotype: "«include»",
    label: { x: 640, y: 129, anchor: "middle" },
  },
  {
    from: "U7",
    to: "U5",
    stereotype: "«include»",
    label: { x: 618, y: 345, anchor: "end" },
    curve: { arriveY: 486 },
  },
  {
    from: "U8",
    to: "U5",
    stereotype: "«include»",
    label: { x: 654, y: 440, anchor: "start" },
    curve: { arriveY: 514 },
  },
  {
    from: "U9",
    to: "U8",
    stereotype: "«extend»",
    label: { x: 898, y: 436, anchor: "end" },
  },
];

const ucById = (id: UseCaseId) => USE_CASES.find((u) => u.id === id) as UseCase;
const actorById = (id: ActorId) =>
  UC_ACTORS.find((a) => a.id === id) as UcActor;

/** Vrh ruke čiča-gliše: odatle polazi asocijacija. */
export const actorHand = (actor: UcActor): Point => ({
  x: actor.side === "left" ? actor.cx + 22 : actor.cx - 22,
  y: actor.top + 38,
});

const ucCenter = (u: UseCase): Point => ({ x: u.cx, y: u.cy });

/** Poluprečnici elipse; slučaj sa odeljkom „Extension points“ je veći. */
export const ucRadii = (u: UseCase) => ({
  rx: u.extensionPoints?.rx ?? UC_RX,
  ry: u.extensionPoints?.ry ?? UC_RY,
});

const ucEdge = (u: UseCase, toward: Point) => {
  const { rx, ry } = ucRadii(u);
  return ellipseEdge(ucCenter(u), rx, ry, toward);
};

export const ucAssociationPath = ({ actor, useCase }: UcAssociation) => {
  const hand = actorHand(actorById(actor));
  return linePath(hand, ucEdge(ucById(useCase), hand));
};

export const ucDependencyPath = ({ from, to, curve }: UcDependency) => {
  const a = ucById(from);
  const b = ucById(to);
  if (curve) {
    const { rx, ry } = ucRadii(b);
    return sCurvePath(
      { x: a.cx - ucRadii(a).rx, y: a.cy },
      ellipsePointAtY(ucCenter(b), rx, ry, curve.arriveY, "right"),
    );
  }
  return linePath(ucEdge(a, ucCenter(b)), ucEdge(b, ucCenter(a)));
};

/** Vodoravna linija odeljka, od ivice do ivice elipse. */
export const ucDividerPath = (u: UseCase, y: number) => {
  const { rx, ry } = ucRadii(u);
  return linePath(
    ellipsePointAtY(ucCenter(u), rx, ry, y, "left"),
    ellipsePointAtY(ucCenter(u), rx, ry, y, "right"),
  );
};

/* ------------------------------------------------------------------ */
/* Dijagram klasa                                                      */
/* ------------------------------------------------------------------ */

export type ClassId =
  | "Korisnik"
  | "Primalac"
  | "Posiljka"
  | "TipPosiljke"
  | "Placanje"
  | "Kurir"
  | "Zaposleni"
  | "Filijala";

export type ClassGroup = "central" | "people" | "catalog" | "org";

export type ClassAttribute = {
  name: string;
  type: "Integer" | "String" | "Double" | "Date" | "Boolean";
  /** link = atribut koji predstavlja vezu sa drugom klasom */
  kind: "link" | "plain";
  target?: ClassId;
};

export type UmlClass = {
  id: ClassId;
  group: ClassGroup;
  x: number;
  y: number;
  attributes: ClassAttribute[];
};

export type AssociationEnd = {
  cls: ClassId;
  role: string;
  multiplicity: "1" | "0..1" | "*";
  side: Side;
  offset: number;
  label: LabelPosition;
};

export type ClassAssociation = {
  id: string;
  a: AssociationEnd;
  b: AssociationEnd;
  reading: string;
  /** Donja sredina oblačića „Kako se čita“: slobodno mesto, ne pokriva natpise veze. */
  tip: Point;
};

export const CLASS_VIEWBOX = { w: 1360, h: 604 };
export const CLASS_WIDTH = 204;
export const CLASS_HEADER_H = 30;
export const CLASS_ROW_H = 19;
const CLASS_BODY_PADDING = 7;

const link = (name: string, target: ClassId): ClassAttribute => ({
  name,
  type: "Integer",
  kind: "link",
  target,
});
const attr = (
  name: string,
  type: ClassAttribute["type"] = "String",
): ClassAttribute => ({ name, type, kind: "plain" });
/** Identifikator same klase: uvek prvi atribut. */
const ownId = (name: string) => attr(name, "Integer");

export const CLASSES: UmlClass[] = [
  {
    id: "Korisnik",
    group: "people",
    x: 12,
    y: 150,
    attributes: [
      ownId("korisnikID"),
      attr("ime"),
      attr("prezime"),
      attr("adresa"),
      attr("grad"),
      attr("telefon"),
      attr("email"),
    ],
  },
  {
    id: "Primalac",
    group: "people",
    x: 196,
    y: 442,
    attributes: [
      ownId("primalacID"),
      attr("ime"),
      attr("prezime"),
      attr("adresa"),
      attr("grad"),
      attr("telefon"),
    ],
  },
  {
    id: "Posiljka",
    group: "central",
    x: 578,
    y: 147,
    attributes: [
      ownId("posiljkaID"),
      attr("brojZaPracenje"),
      attr("tezina", "Double"),
      attr("datumSlanja", "Date"),
      attr("datumIsporuke", "Date"),
      attr("status"),
      attr("lomljivo", "Boolean"),
      link("korisnikID", "Korisnik"),
      link("primalacID", "Primalac"),
      link("tipPosiljkeID", "TipPosiljke"),
      link("kurirID", "Kurir"),
      link("zaposleniID", "Zaposleni"),
    ],
  },
  {
    id: "TipPosiljke",
    group: "catalog",
    x: 578,
    y: 4,
    attributes: [
      ownId("tipPosiljkeID"),
      attr("nazivTipa"),
      attr("cenaPoKg", "Double"),
    ],
  },
  {
    id: "Placanje",
    group: "catalog",
    x: 578,
    y: 461,
    attributes: [
      ownId("placanjeID"),
      attr("iznos", "Double"),
      attr("datumPlacanja", "Date"),
      attr("nacinPlacanja"),
      link("posiljkaID", "Posiljka"),
    ],
  },
  {
    id: "Kurir",
    group: "org",
    x: 860,
    y: 4,
    attributes: [
      ownId("kurirID"),
      attr("ime"),
      attr("prezime"),
      attr("JMBG"),
      attr("telefon"),
      link("filijalaID", "Filijala"),
    ],
  },
  {
    id: "Zaposleni",
    group: "org",
    x: 860,
    y: 442,
    attributes: [
      ownId("zaposleniID"),
      attr("ime"),
      attr("prezime"),
      attr("JMBG"),
      attr("radnoMesto"),
      link("filijalaID", "Filijala"),
    ],
  },
  {
    id: "Filijala",
    group: "org",
    x: 1148,
    y: 233,
    attributes: [
      ownId("filijalaID"),
      attr("naziv"),
      attr("adresa"),
      attr("grad"),
      attr("telefon"),
    ],
  },
];

export const CLASS_ASSOCIATIONS: ClassAssociation[] = [
  {
    id: "Korisnik-Posiljka",
    a: {
      cls: "Korisnik",
      role: "+korisnik",
      multiplicity: "1",
      side: "right",
      offset: 88,
      label: { x: 228, y: 230, anchor: "start" },
    },
    b: {
      cls: "Posiljka",
      role: "+posiljka",
      multiplicity: "*",
      side: "left",
      offset: 91,
      label: { x: 566, y: 230, anchor: "end" },
    },
    reading:
      "Jedan korisnik šalje više pošiljki; svaku pošiljku šalje tačno jedan korisnik.",
    tip: { x: 397, y: 330 },
  },
  {
    id: "Primalac-Posiljka",
    a: {
      cls: "Primalac",
      role: "+primalac",
      multiplicity: "1",
      side: "top",
      offset: 184,
      label: { x: 392, y: 434, anchor: "start" },
    },
    b: {
      cls: "Posiljka",
      role: "+posiljka",
      multiplicity: "*",
      side: "left",
      offset: 213,
      label: { x: 566, y: 352, anchor: "end" },
    },
    reading:
      "Jedan primalac prima više pošiljki; svaka pošiljka ide tačno jednom primaocu.",
    tip: { x: 215, y: 432 },
  },
  {
    id: "TipPosiljke-Posiljka",
    a: {
      cls: "TipPosiljke",
      role: "+tipPosiljke",
      multiplicity: "1",
      side: "bottom",
      offset: 102,
      label: { x: 670, y: 123, anchor: "end" },
    },
    b: {
      cls: "Posiljka",
      role: "+posiljka",
      multiplicity: "*",
      side: "top",
      offset: 102,
      label: { x: 690, y: 141, anchor: "start" },
    },
    reading:
      "Jedan tip ima više pošiljki; svaka pošiljka je tačno jednog tipa.",
    tip: { x: 420, y: 120 },
  },
  {
    id: "Placanje-Posiljka",
    a: {
      cls: "Placanje",
      role: "+placanje",
      multiplicity: "0..1",
      side: "top",
      offset: 102,
      label: { x: 690, y: 456, anchor: "start" },
    },
    b: {
      cls: "Posiljka",
      role: "+posiljka",
      multiplicity: "1",
      side: "bottom",
      offset: 102,
      label: { x: 670, y: 436, anchor: "end" },
    },
    reading:
      "Jedno plaćanje je za tačno jednu pošiljku; pošiljka ima nijedno (još nije plaćena) ili jedno plaćanje.",
    tip: { x: 415, y: 466 },
  },
  {
    id: "Kurir-Posiljka",
    a: {
      cls: "Kurir",
      role: "+kurir",
      multiplicity: "0..1",
      side: "bottom",
      offset: 70,
      label: { x: 942, y: 180, anchor: "start" },
    },
    b: {
      cls: "Posiljka",
      role: "+posiljka",
      multiplicity: "*",
      side: "right",
      offset: 53,
      label: { x: 794, y: 192, anchor: "start" },
    },
    reading:
      "Jedan kurir nosi više pošiljki; pošiljka ima nijednog (još nije dodeljena) ili jednog kurira.",
    tip: { x: 940, y: 290 },
  },
  {
    id: "Zaposleni-Posiljka",
    a: {
      cls: "Zaposleni",
      role: "+zaposleni",
      multiplicity: "0..1",
      side: "top",
      offset: 70,
      label: { x: 942, y: 434, anchor: "start" },
    },
    b: {
      cls: "Posiljka",
      role: "+posiljka",
      multiplicity: "*",
      side: "right",
      offset: 219,
      label: { x: 794, y: 358, anchor: "start" },
    },
    reading:
      "Jedan zaposleni dodeljuje više pošiljki; pošiljku je dodelio nijedan (još nije dodeljena) ili jedan zaposleni.",
    tip: { x: 940, y: 345 },
  },
  {
    id: "Kurir-Filijala",
    a: {
      cls: "Kurir",
      role: "+kurir",
      multiplicity: "*",
      side: "right",
      offset: 79,
      label: { x: 1076, y: 75, anchor: "start" },
    },
    b: {
      cls: "Filijala",
      role: "+filijala",
      multiplicity: "1",
      side: "top",
      offset: 102,
      label: { x: 1262, y: 225, anchor: "start" },
    },
    reading:
      "U jednoj filijali radi više kurira; kurir radi u tačno jednoj filijali.",
    tip: { x: 985, y: 290 },
  },
  {
    id: "Zaposleni-Filijala",
    a: {
      cls: "Zaposleni",
      role: "+zaposleni",
      multiplicity: "*",
      side: "right",
      offset: 79,
      label: { x: 1076, y: 513, anchor: "start" },
    },
    b: {
      cls: "Filijala",
      role: "+filijala",
      multiplicity: "1",
      side: "bottom",
      offset: 102,
      label: { x: 1262, y: 392, anchor: "start" },
    },
    reading:
      "U jednoj filijali radi više zaposlenih; zaposleni radi u tačno jednoj filijali.",
    tip: { x: 985, y: 430 },
  },
];

export const classById = (id: ClassId) =>
  CLASSES.find((c) => c.id === id) as UmlClass;

export const classRect = (c: UmlClass): Rect => ({
  x: c.x,
  y: c.y,
  w: CLASS_WIDTH,
  h:
    CLASS_HEADER_H + CLASS_BODY_PADDING * 2 + c.attributes.length * CLASS_ROW_H,
});

export const attributeRowTop = (c: UmlClass, index: number) =>
  c.y + CLASS_HEADER_H + CLASS_BODY_PADDING + index * CLASS_ROW_H;

export const associationPoints = (assoc: ClassAssociation) => {
  const end = (e: AssociationEnd) =>
    rectPort(classRect(classById(e.cls)), e.side, e.offset);
  return { a: end(assoc.a), b: end(assoc.b) };
};

const leavesVertically = (e: AssociationEnd) =>
  e.side === "top" || e.side === "bottom";

/** Ugao linije; asocijacija čija se oba kraja poklapaju po osi ide pravo. */
const associationCorner = (assoc: ClassAssociation): Point | null => {
  if (leavesVertically(assoc.a) === leavesVertically(assoc.b)) return null;
  const { a, b } = associationPoints(assoc);
  return leavesVertically(assoc.a) ? { x: a.x, y: b.y } : { x: b.x, y: a.y };
};

export const associationPath = (assoc: ClassAssociation) => {
  const { a, b } = associationPoints(assoc);
  const corner = associationCorner(assoc);
  return corner ? elbowPath(a, corner, b) : linePath(a, b);
};

/** Asocijacija koju predstavlja atribut-veza (npr. `kurirID` u Posiljci). */
export const associationForAttribute = (owner: ClassId, target: ClassId) =>
  CLASS_ASSOCIATIONS.find(
    ({ a, b }) =>
      (a.cls === owner && b.cls === target) ||
      (a.cls === target && b.cls === owner),
  ) as ClassAssociation;

/* ------------------------------------------------------------------ */
/* Dijagram sekvenci                                                   */
/* ------------------------------------------------------------------ */

export type ParticipantId = "korisnik" | "posiljka" | "primalac" | "tip";

export type SeqParticipant = {
  id: ParticipantId;
  name: string;
  kind: "actor" | "object";
  x: number;
  /** Širina zaglavlja objekta. */
  w: number;
  classId: ClassId;
};

export type SeqMessage = {
  n: number;
  from: ParticipantId;
  to: ParticipantId;
  kind: "call" | "self" | "return";
  y: number;
  text: string;
  label: LabelPosition;
};

export type SeqBranch = "ispravni" | "neispravni";

export const SEQ_VIEWBOX = { w: 1400, h: 576 };
export const SEQ_LIFELINE_END = 566;
export const SEQ_ACTIVATION_W = 14;
export const SEQ_SELF_W = 36;
export const SEQ_SELF_H = 22;
export const SEQ_OBJECT_BOX = { y: 22, h: 44 };
export const SEQ_ACTOR_TOP = 4;

export const SEQ_PARTICIPANTS: SeqParticipant[] = [
  {
    id: "korisnik",
    name: "Korisnik",
    kind: "actor",
    x: 110,
    w: 0,
    classId: "Korisnik",
  },
  {
    id: "posiljka",
    name: ":Posiljka",
    kind: "object",
    x: 700,
    w: 170,
    classId: "Posiljka",
  },
  {
    id: "primalac",
    name: ":Primalac",
    kind: "object",
    x: 1040,
    w: 170,
    classId: "Primalac",
  },
  {
    id: "tip",
    name: ":TipPosiljke",
    kind: "object",
    x: 1290,
    w: 170,
    classId: "TipPosiljke",
  },
];

/** Fokus kontrole. `startsAt` je poruka koja ga otvara (za koračanje). */
export const SEQ_ACTIVATIONS: {
  participant: ParticipantId;
  y1: number;
  y2: number;
  startsAt: number;
}[] = [
  { participant: "posiljka", y1: 118, y2: 532, startsAt: 1 },
  { participant: "primalac", y1: 240, y2: 284, startsAt: 3 },
  { participant: "tip", y1: 312, y2: 356, startsAt: 5 },
];

export const SEQ_ALT = {
  x: 14,
  y: 190,
  w: 1372,
  h: 358,
  dividerY: 458,
  tag: "alt",
  operands: [
    {
      branch: "ispravni" as SeqBranch,
      guard: "[podaci ispravni]",
      guardX: 124,
      guardY: 212,
      y1: 190,
      y2: 458,
    },
    {
      branch: "neispravni" as SeqBranch,
      guard: "[podaci neispravni]",
      guardX: 124,
      guardY: 480,
      y1: 458,
      y2: 548,
    },
  ],
};

export const SEQ_MESSAGES: SeqMessage[] = [
  {
    n: 1,
    from: "korisnik",
    to: "posiljka",
    kind: "call",
    y: 122,
    text: "1: kreirajPosiljku(podaciPrimaoca, tipPosiljkeID, tezina, lomljivo)",
    label: { x: 401, y: 115, anchor: "middle" },
  },
  {
    n: 2,
    from: "posiljka",
    to: "posiljka",
    kind: "self",
    y: 150,
    text: "2: proveriPodatke()",
    label: { x: 753, y: 166, anchor: "start" },
  },
  {
    n: 3,
    from: "posiljka",
    to: "primalac",
    kind: "call",
    y: 244,
    text: "3: sacuvajPrimaoca(podaciPrimaoca)",
    label: { x: 870, y: 237, anchor: "middle" },
  },
  {
    n: 4,
    from: "primalac",
    to: "posiljka",
    kind: "return",
    y: 280,
    text: "4: primalacID",
    label: { x: 870, y: 273, anchor: "middle" },
  },
  {
    n: 5,
    from: "posiljka",
    to: "tip",
    kind: "call",
    y: 316,
    text: "5: vratiCenuPoKg()",
    label: { x: 1165, y: 309, anchor: "middle" },
  },
  {
    n: 6,
    from: "tip",
    to: "posiljka",
    kind: "return",
    y: 352,
    text: "6: cenaPoKg",
    label: { x: 1165, y: 345, anchor: "middle" },
  },
  {
    n: 7,
    from: "posiljka",
    to: "posiljka",
    kind: "self",
    y: 380,
    text: "7: izracunajCenu(tezina, cenaPoKg)",
    label: { x: 753, y: 396, anchor: "start" },
  },
  {
    n: 8,
    from: "posiljka",
    to: "korisnik",
    kind: "return",
    y: 438,
    text: "8: brojZaPracenje, iznos",
    label: { x: 401, y: 431, anchor: "middle" },
  },
  {
    n: 9,
    from: "posiljka",
    to: "korisnik",
    kind: "return",
    y: 512,
    text: "9: zahtevZaIspravku",
    label: { x: 401, y: 505, anchor: "middle" },
  },
];

export const SEQ_BRANCH_ORDER: Record<SeqBranch, number[]> = {
  ispravni: [1, 2, 3, 4, 5, 6, 7, 8],
  neispravni: [1, 2, 9],
};

const participantById = (id: ParticipantId) =>
  SEQ_PARTICIPANTS.find((p) => p.id === id) as SeqParticipant;

/** X na kome strelica dodiruje liniju života ili ivicu fokusa kontrole. */
const participantEdgeX = (id: ParticipantId, y: number, towardX: number) => {
  const { x } = participantById(id);
  const active = SEQ_ACTIVATIONS.some(
    (a) => a.participant === id && y >= a.y1 && y <= a.y2,
  );
  if (!active) return x;
  return towardX > x ? x + SEQ_ACTIVATION_W / 2 : x - SEQ_ACTIVATION_W / 2;
};

/** Putanja poruke, od pošiljaoca ka primaocu; tačke koristi i putujuća tačka. */
export const messageGeometry = (m: SeqMessage) => {
  if (m.kind === "self") {
    const startX = participantEdgeX(m.from, m.y, Infinity);
    const points: Point[] = [
      { x: startX, y: m.y },
      { x: startX + SEQ_SELF_W, y: m.y },
      { x: startX + SEQ_SELF_W, y: m.y + SEQ_SELF_H },
      { x: startX, y: m.y + SEQ_SELF_H },
    ];
    return {
      points,
      d: `M${points[0].x},${points[0].y} H${points[1].x} V${points[2].y} H${points[3].x}`,
    };
  }
  const fromX = participantById(m.from).x;
  const toX = participantById(m.to).x;
  const points: Point[] = [
    { x: participantEdgeX(m.from, m.y, toX), y: m.y },
    { x: participantEdgeX(m.to, m.y, fromX), y: m.y },
  ];
  return { points, d: linePath(points[0], points[1]) };
};
