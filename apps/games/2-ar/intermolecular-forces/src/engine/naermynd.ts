/**
 * Nærmynd: liquids in closed flasks at 20 °C (docs/particle-view-template.md).
 *
 * The vapour above each liquid is drawn as whole molecules, one per kPa of the book's
 * vapour pressure, rounded. The liquid itself is drawn the same for every substance: what
 * differs is how many molecules have escaped it.
 */
import { LIQUIDS, type Liquid } from '../data/vapour-pressure';

export const PER_KPA = 1;
/** Molecules drawn in the liquid, the same for every flask. */
export const LIQUID_MOLECULES = 15;

export function liquid(id: Liquid['id']): Liquid {
  const found = LIQUIDS.find((l) => l.id === id);
  if (!found) throw new Error(`Enginn vökvi ${id}`);
  return found;
}

/** Whole molecules in the vapour: the vapour pressure on the fixed scale, rounded. */
export function vapourCount(id: Liquid['id']): number {
  return Math.round(liquid(id).kPa * PER_KPA);
}

/** How many times the first liquid's vapour pressure is the second's. */
export function ratio(a: Liquid['id'], b: Liquid['id']): number {
  return liquid(a).kPa / liquid(b).kPa;
}

/** "1 sameind", "21 sameind", "12 sameindir": Icelandic takes the singular after 1, 21, 31 … */
export function sameindir(n: number): string {
  return n % 10 === 1 && n % 100 !== 11 ? `${n} sameind` : `${n} sameindir`;
}
