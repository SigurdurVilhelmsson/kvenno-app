import { describe, expect, it } from 'vitest';

import { FORMATION_ENTHALPY } from '@shared/data/thermo';

import { CHALLENGES } from '../data/challenges';
import { PUZZLES } from '../data/puzzles';
import { parseSide } from '../utils/equation-math';
import { FORMATION_ENTHALPIES, calculateSum } from '../utils/hess-calculations';

/**
 * Every enthalpy this game prints is the book's (mobile-pass decision 9, ruled (a)):
 * derived from the formation enthalpies in `@shared/data/thermo`, the Icelandic
 * textbook's appendix m68865, which `equilibrium-shifter` and
 * `thermodynamics-predictor` read too.
 *
 * Until 2026-10-03 the game kept its own table and three sets of roundings. The one
 * that cost a student marks: Level 3 stored CaCO₃ at −1206,9 where the book gives
 * −1220,0, so a student who looked it up was 13 kJ off and marked wrong.
 */

/** ΔH° of `reactants → products` from the book's rows, or null if one is missing. */
function derive(reactants: string, products: string): number | null {
  let total = 0;
  for (const [side, sign] of [
    [reactants, -1],
    [products, 1],
  ] as const) {
    for (const [species, n] of parseSide(side)) {
      const value = FORMATION_ENTHALPY[species];
      if (value === undefined) return null;
      total += sign * n * value;
    }
  }
  return total;
}

describe('Level 2: equations and targets', () => {
  describe.each(PUZZLES.map((p) => [p.id, p] as const))('puzzle %i', (_id, puzzle) => {
    it.each(puzzle.availableEquations.map((e) => [e.id, e] as const))(
      'equation %s prints the book’s ΔH to one decimal',
      (_eq, eq) => {
        const derived = derive(eq.reactants, eq.products);
        expect(derived, `${eq.reactants} → ${eq.products}`).not.toBeNull();
        // Within half a unit in the last printed place. −57,05 prints as −57,1.
        expect(Math.abs(eq.deltaH - derived!)).toBeLessThanOrEqual(0.05 + 1e-9);
      }
    );

    it('its target is what the printed equations add up to', () => {
      const steps = puzzle.solution.map((step) => {
        const eq = puzzle.availableEquations.find((e) => e.id === step.equationId)!;
        return { ...eq, isReversed: step.reverse, multiplier: step.multiply };
      });
      expect(calculateSum(steps)).toBeCloseTo(puzzle.targetDeltaH, 9);
    });

    it('its target is the book’s, give or take that rounding', () => {
      const derived = derive(puzzle.targetEquation.reactants, puzzle.targetEquation.products);
      expect(derived).not.toBeNull();
      expect(Math.abs(puzzle.targetDeltaH - derived!)).toBeLessThanOrEqual(0.15);
    });
  });
});

describe('Level 1: the reactions it names', () => {
  // Level 1 is about signs and scaling, so it prints whole kilojoules. Each real
  // reaction's number is still the book's, rounded; `A → D` and its kin are made up.
  const real = CHALLENGES.filter((c) => derive(c.equation.reactants, c.equation.products) !== null);

  it('covers the real reactions, not only the made-up ones', () => {
    expect(real.length).toBeGreaterThanOrEqual(4);
  });

  it.each(real.map((c) => [c.id, c] as const))(
    'challenge %i prints the book’s ΔH, rounded to a whole kJ',
    (_id, c) => {
      const derived = derive(c.equation.reactants, c.equation.products)!;
      expect(c.equation.deltaH).toBe(Math.round(derived));
    }
  );
});

describe('Level 3: the reference table', () => {
  it('prints the shared table’s values', () => {
    for (const [key, { value }] of Object.entries(FORMATION_ENTHALPIES)) {
      const shared = FORMATION_ENTHALPY[key.replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)])];
      expect(value, key).toBe(shared);
    }
  });

  it('gives calcium carbonate the book’s −1220,0', () => {
    expect(FORMATION_ENTHALPIES['CaCO3(s)'].value).toBe(-1220.0);
  });

  it('prints no species the book has no row for', () => {
    expect(FORMATION_ENTHALPIES['C6H12O6(s)']).toBeUndefined();
  });
});
