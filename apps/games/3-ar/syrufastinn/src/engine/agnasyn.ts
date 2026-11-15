import type { GlyphText, ParticleCounts } from '@shared/components/ParticleBeaker';

import { solveWeakAcid } from './ka';
import { WEAK_ACIDS, type WeakAcid } from '../data/acids';

/**
 * The chemistry behind this game's Agnasýn: the same weak acid at three
 * concentrations, and a weak acid beside a strong one.
 *
 * Every glass holds the same number of acid molecules, 40, dissolved in more or
 * less water; water is not drawn. The ions are the exact fraction dissociated,
 * from `solveWeakAcid`'s quadratic, times 40, rounded. The dilution scene uses
 * flússýra because its fraction is large enough to draw honestly at every step
 * (1, 3 and 9 ions of 40), so nothing is exaggerated; ediksýra would show none
 * at 1,0 M and two at 0,010 M.
 */

export const UNITS = 40;
export const DILUTION = [1.0, 0.1, 0.01] as const;

export const SCENE_ACID: WeakAcid = WEAK_ACIDS.find((a) => a.id === 'flussyra')!;

/** Fraction dissociated, from the exact root. */
export function fraction(acid: WeakAcid, c: number): number {
  return solveWeakAcid(acid.ka, c).fractionDissociated;
}

/** Ions of 40 before rounding, for the table beside the picture. */
export function trueIons(acid: WeakAcid, c: number): number {
  return UNITS * fraction(acid, c);
}

export function weakCounts(acid: WeakAcid, c: number): ParticleCounts {
  const ions = Math.round(trueIons(acid, c));
  return { HA: UNITS - ions, A: ions, H3O: ions, OH: 0, Na: 0, Cl: 0, flag: null };
}

/** HCl ionises completely: every molecule is an H⁺ and a Cl⁻. */
export function strongCounts(): ParticleCounts {
  return { HA: 0, A: 0, H3O: UNITS, OH: 0, Na: 0, Cl: UNITS, flag: null };
}

export function weakPH(acid: WeakAcid, c: number): number {
  return solveWeakAcid(acid.ka, c).pH;
}

/** pH of HCl, [H⁺] = C; water's own H⁺ is negligible at every concentration offered. */
export function strongPH(c: number): number {
  return -Math.log10(c);
}

/**
 * Ka read back from a glass: x²/(C − x), with x the exact [H⁺]. The same at
 * every concentration, which is the point of the second scene.
 */
export function kaFromGlass(acid: WeakAcid, c: number): number {
  const x = solveWeakAcid(acid.ka, c).hExact;
  return (x * x) / (c - x);
}

/** The formula inside each glyph where it is short enough to fit, else HA and A⁻. */
export function glyphText(acid: WeakAcid): GlyphText {
  return acid.formula.length <= 3
    ? { HA: acid.formula, A: acid.conjugateBase }
    : { HA: 'HA', A: 'A⁻' };
}
