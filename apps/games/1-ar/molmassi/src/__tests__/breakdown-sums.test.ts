import { describe, it, expect } from 'vitest';

import { COMPOUNDS, molarMassOf, type Compound } from '../data/compounds';
import { ELEMENTS } from '../data/elements';
import { generateCalculationBreakdown } from '../utils/calculations';

/**
 * The per-element breakdown must sum to the total printed underneath it.
 *
 * This is the one game whose entire skill is summing element masses, and for 12
 * of its 29 compounds it printed lines that did not add up to its own answer —
 * Al₂(SO₄)₃ showed lines totalling 342,132 above a stated total of 342,151
 * (B4 in the Year-1 curriculum review).
 *
 * The cause was a hand-written `molarMass` on each compound, computed from more
 * precise atomic masses than the periodic table this game shows a student.
 * `molarMass` is now summed from `elements.ts`, which is why the first test below
 * would be tautological if it compared the two sums directly. It does not: it
 * drives `generateCalculationBreakdown`, the function the component actually
 * renders, so it also covers the hydrate path and the display rounding.
 */

/** What `CalculationBreakdown.tsx` prints for each line and for the total. */
const DISPLAY_DECIMALS = 3;
const asDisplayed = (n: number): number => Number(n.toFixed(DISPLAY_DECIMALS));

const sumOfPrintedLines = (compound: Compound): number =>
  generateCalculationBreakdown(compound)
    .filter((step) => step.type === 'calculation')
    .reduce((sum, step) => sum + asDisplayed(step.total ?? 0), 0);

describe('every compound breakdown sums to the total it prints', () => {
  it.each(COMPOUNDS.map((c) => [c.formula, c] as const))('%s', (_formula, compound) => {
    // Compared at the precision a student reads off the screen, not at full
    // float precision — the lines are rounded individually before they are shown.
    expect(asDisplayed(sumOfPrintedLines(compound))).toBe(asDisplayed(compound.molarMass));
  });

  it('covers every compound, including the hydrates', () => {
    expect(COMPOUNDS.length).toBe(29);
    expect(COMPOUNDS.filter((c) => c.formula.includes('·')).length).toBeGreaterThan(0);
  });
});

describe('molar masses are derived, not authored', () => {
  it('matches a sum over the element table for every compound', () => {
    for (const compound of COMPOUNDS) {
      expect(compound.molarMass, compound.formula).toBeCloseTo(molarMassOf(compound.elements), 10);
    }
  });

  it('names every element its compounds use', () => {
    // molarMassOf throws on an unknown symbol; this makes that a named failure
    // rather than a crash deep inside a render.
    const known = new Set(ELEMENTS.map((e) => e.symbol));
    for (const compound of COMPOUNDS) {
      for (const element of compound.elements) {
        expect(known.has(element.symbol), `${compound.formula} uses ${element.symbol}`).toBe(true);
      }
    }
  });

  it('still agrees with the reference values to within the abridged-mass rounding', () => {
    // Guards the deriving change itself: switching the source of truth moved
    // every affected total by less than 0.02 g/mol, far inside Level 1's
    // 0,5–2,0 g/mol grading tolerance, so no answer key meaningfully moved.
    const REFERENCE: Record<string, number> = {
      'H₂O': 18.015,
      NaCl: 58.44,
      'H₂SO₄': 98.079,
      'Al₂(SO₄)₃': 342.151,
      'CuSO₄·5H₂O': 249.685,
      'Na₂CO₃·10H₂O': 286.141,
    };
    for (const [formula, reference] of Object.entries(REFERENCE)) {
      const compound = COMPOUNDS.find((c) => c.formula === formula);
      expect(compound, formula).toBeDefined();
      expect(Math.abs(compound!.molarMass - reference), formula).toBeLessThan(0.02);
    }
  });
});
