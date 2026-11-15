import { describe, expect, it } from 'vitest';

import { CONCENTRATIONS, isAnswerable } from '../data/acids';
import { EXPLORABLE_ACIDS } from '../data/problems';
import {
  DILUTION,
  SCENE_ACID,
  UNITS,
  fraction,
  kaFromGlass,
  strongCounts,
  trueIons,
  weakCounts,
} from '../engine/naermynd';

/**
 * Nærmynd's numbers: the dilution scene shows rising percent dissociation with
 * no exaggeration, Ka read back from every glass is the acid's own, and every
 * glass the slider can make keeps its molecules.
 */

describe('Sýrufastinn Nærmynd', () => {
  it('draws flússýra honestly at every dilution: at least one ion, rising', () => {
    const ions = DILUTION.map((c) => weakCounts(SCENE_ACID, c).A);
    expect(ions[0]).toBeGreaterThanOrEqual(1);
    for (let i = 1; i < ions.length; i++) expect(ions[i]).toBeGreaterThan(ions[i - 1]);
    // Rounding moves a count by under half a particle, never more.
    for (const c of DILUTION) {
      expect(Math.abs(weakCounts(SCENE_ACID, c).A - trueIons(SCENE_ACID, c))).toBeLessThanOrEqual(
        0.5
      );
    }
  });

  it('reads the same Ka back from every glass', () => {
    for (const c of DILUTION) {
      expect(kaFromGlass(SCENE_ACID, c) / SCENE_ACID.ka).toBeCloseTo(1, 9);
    }
  });

  it('keeps 40 molecules in every glass the explore scene can make', () => {
    for (const acid of EXPLORABLE_ACIDS) {
      for (const c of CONCENTRATIONS.filter((x) => isAnswerable(acid, x))) {
        const w = weakCounts(acid, c);
        expect(w.HA + w.A).toBe(UNITS);
        expect(w.A).toBe(w.H3O);
        expect(fraction(acid, c)).toBeLessThan(1);
      }
    }
    const s = strongCounts();
    expect(s.H3O).toBe(UNITS);
    expect(s.Cl).toBe(UNITS);
    expect(s.HA).toBe(0);
  });
});
