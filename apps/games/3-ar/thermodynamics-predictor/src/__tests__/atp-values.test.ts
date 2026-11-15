import { describe, expect, it } from 'vitest';

import { problemById } from './play-helpers';
import { calculateDeltaG } from '../utils/thermo-calculations';

/**
 * ATP hydrolysis (id 27) is out of the book's tables, so its two numbers come from elsewhere:
 * ΔH° = −20,5 kJ/mol, measured by calorimetry (Gajewski, Steckler & Goldberg, J. Biol. Chem.
 * 261, 12733, 1986), and ΔS° chosen so that ΔG° at 298 K is the book's −30 kJ (m68819).
 * They were −20 and 35, from no source.
 */
describe('ATP hydrolysis', () => {
  const { problem } = problemById(27);

  it('carries the calorimetric ΔH°', () => {
    expect(problem.deltaH).toBe(-20.5);
  });

  it("gives the book's ΔG° = −30 kJ at 298 K, to the rounding of a whole-number ΔS°", () => {
    expect(Math.abs(calculateDeltaG(problem.deltaH, problem.deltaS, 298) - -30)).toBeLessThan(0.15);
  });
});
