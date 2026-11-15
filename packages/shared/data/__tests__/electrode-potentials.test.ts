import { describe, expect, it } from 'vitest';

import { ELECTRODE_POTENTIALS, cellPotential, standardPotential } from '../electrode-potentials';

/**
 * The table is transcribed by hand from the Icelandic book's appendix m68870. These hold the
 * rows the year-2 audit checked (2026-11-15) and the shape every row must have, so a slip in a
 * later addition is caught here rather than on a student's screen.
 */
describe('electrode potentials from the book', () => {
  it('holds the values the book prints', () => {
    expect(standardPotential('Fe2+/Fe')).toBe(-0.447);
    expect(standardPotential('Zn2+/Zn')).toBe(-0.7618);
    expect(standardPotential('Cu2+/Cu')).toBe(0.337);
    expect(standardPotential('Ag+/Ag')).toBe(0.7996);
    expect(standardPotential('Mg2+/Mg')).toBe(-2.372);
    expect(standardPotential('Cl2/Cl-')).toBe(1.35827);
    expect(standardPotential('H+/H2')).toBe(0);
  });

  it("gives the book's Daniell cell", () => {
    expect(cellPotential('Cu2+/Cu', 'Zn2+/Zn')).toBeCloseTo(1.0988, 4);
  });

  it('writes every half-reaction as a reduction with H⁺, never H₃O⁺', () => {
    for (const [couple, row] of Object.entries(ELECTRODE_POTENTIALS)) {
      expect(row.halfReaction, couple).toMatch(/e⁻ → /);
      expect(row.halfReaction, couple).not.toContain('H₃O⁺');
    }
  });

  it('lists the couples in order of E°, as the activity series runs', () => {
    const values = Object.values(ELECTRODE_POTENTIALS).map((r) => r.e);
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });
});
