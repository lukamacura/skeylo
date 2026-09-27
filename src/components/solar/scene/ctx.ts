import type { Roof } from "./geometry";

/** Zajednički kontekst crtanja: mere, svetlo i raspored otvora. */
export interface Ctx {
  x0: number;
  x1: number;
  w: number;
  wallTop: number;
  wallH: number;
  floors: number;
  floorH: number;
  roof: Roof;
  slots: number;
  slotW: number;
  doorSlot: number;
  /** 0–1 koliko je mračno; pali svetla. */
  n: number;
  /** Boja površine pod trenutnim svetlom. */
  c: (hex: string) => string;
  /** Površina koja noću sama svetli. */
  glow: (hex: string, lit: string, amount?: number) => string;
  litAt: (floor: number, slot: number) => boolean;
  /** Sitni detalji se crtaju samo kad su dovoljno veliki da se vide. */
  detail: boolean;
}
