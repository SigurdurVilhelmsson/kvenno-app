import { describe, expect, it } from 'vitest';

import { ICELANDIC_APPENDIX_KSP } from '@shared/data/appendix-d';

import { FRACTIONAL_PROBLEMS, MIXING_PROBLEMS } from '../data/problems';
import { SALTS, saltBy } from '../data/salts';
import { mixAndCompare, precipitationOrder } from '../engine/ksp';

/**
 * A verdict this game grades comes out the same in the school's Icelandic book.
 *
 * Brown D.3 is the source the engine computes with. But a student who checks a
 * constant in the book they can read gets the Icelandic appendix, which differs
 * 209-fold for BaSO₄. Until 2026-11-14 three mixing problems flipped under it:
 * the two BaSO₄ problems precipitated by Brown and not by the Icelandic book, and
 * the "close call" on SrCO₃ was 3 % under Brown's Ksp and 29 % over the other.
 */
const icelandic = (formula: string) => {
  const ksp = ICELANDIC_APPENDIX_KSP[formula];
  expect(ksp, `${formula} has no Icelandic row transcribed`).toBeDefined();
  return { ...saltBy(formula), ksp };
};

describe('the two books agree on every graded verdict', () => {
  it('has an Icelandic value for every salt in the pool', () => {
    for (const salt of SALTS)
      expect(ICELANDIC_APPENDIX_KSP[salt.formula], salt.formula).toBeDefined();
  });

  it('every mixing problem precipitates, or not, under both', () => {
    for (const p of MIXING_PROBLEMS) {
      const other = mixAndCompare(icelandic(p.formula), p.cation, p.anion);
      expect(other.precipitates, p.id).toBe(p.precipitates);
    }
  });

  it('keeps every verdict at least 10 % from the line in both books', () => {
    for (const p of MIXING_PROBLEMS) {
      const other = mixAndCompare(icelandic(p.formula), p.cation, p.anion);
      for (const ratio of [p.ratio, other.ratio]) {
        expect(Math.abs(Math.log(ratio)), p.id).toBeGreaterThan(Math.log(1.1));
      }
    }
  });

  it('every fractional problem comes out in the same order under both', () => {
    for (const p of FRACTIONAL_PROBLEMS) {
      const order = precipitationOrder(
        p.sharedIon,
        p.candidates.map((c) => ({
          salt: icelandic(c.formula),
          otherIonConcentration: c.otherIonConcentration,
        }))
      );
      expect(
        order.map((o) => o.salt.formula),
        p.id
      ).toEqual(p.order.map((o) => o.formula));
    }
  });
});
