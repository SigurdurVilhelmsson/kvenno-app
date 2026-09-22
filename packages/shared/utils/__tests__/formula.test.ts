import { describe, expect, it } from 'vitest';

import { ATOMIC_MASSES } from '../../data/elements';
import { molarMassOf, normaliseSubscripts, parseFormula } from '../formula';

/**
 * Reading a formula a student can read.
 *
 * The parser's job is to accept the Unicode-subscript formulas the games put
 * on screen and to **refuse** everything else. A parser that skips what it
 * cannot read turns `Cu(NO₃)₂` into copper and weighs it accordingly — a
 * silently wrong molar mass, which is the `molmassi` B4 defect in a new
 * costume.
 */

describe('parsing', () => {
  it('reads Unicode subscripts, which is how formulas are written here', () => {
    expect(normaliseSubscripts('Fe₂O₃')).toBe('Fe2O3');
    expect(parseFormula('Fe₂O₃')).toEqual([
      { symbol: 'Fe', count: 2 },
      { symbol: 'O', count: 3 },
    ]);
  });

  it('reads an ASCII formula the same way', () => {
    expect(parseFormula('Fe2O3')).toEqual(parseFormula('Fe₂O₃'));
  });

  it('treats a missing subscript as one', () => {
    expect(parseFormula('NaCl')).toEqual([
      { symbol: 'Na', count: 1 },
      { symbol: 'Cl', count: 1 },
    ]);
  });

  it('distinguishes a two-letter symbol from two one-letter symbols', () => {
    // The whole reason the token regex prefers a lowercase continuation: `Co`
    // is cobalt, `CO` is carbon monoxide, and they weigh 56 g/mol apart.
    expect(parseFormula('Co')).toEqual([{ symbol: 'Co', count: 1 }]);
    expect(parseFormula('CO')).toEqual([
      { symbol: 'C', count: 1 },
      { symbol: 'O', count: 1 },
    ]);
    expect(molarMassOf('Co')).not.toBeCloseTo(molarMassOf('CO'), 1);
  });

  it('adds up an element that appears twice', () => {
    expect(parseFormula('HOOH')).toEqual([
      { symbol: 'H', count: 2 },
      { symbol: 'O', count: 2 },
    ]);
  });

  it('refuses rather than guesses', () => {
    expect(() => parseFormula('')).toThrow(/Empty/);
    expect(() => parseFormula('Xx')).toThrow(/no atomic mass/);
    expect(() => parseFormula('fe2o3')).toThrow(); // must start with a capital
    expect(() => parseFormula('H₀')).toThrow(/subscript of zero/);
    expect(() => parseFormula('Fe₂O₃!')).toThrow(/cannot read/);
  });

  it('refuses parentheses out loud instead of mis-weighing them', () => {
    // No formula in the games that weigh things uses them. A silent wrong
    // answer on Ca(OH)₂ would be far worse than a refusal that names itself.
    expect(() => parseFormula('Ca(OH)₂')).toThrow(/parentheses/);
  });
});

describe('weighing', () => {
  it('weighs a single atom as its own atomic mass', () => {
    expect(molarMassOf('Fe')).toBe(ATOMIC_MASSES.Fe);
  });

  it('weighs the book’s copper sulfate example', () => {
    // ch04/m68714 prints 159,62 g/mol for CuSO₄. This table gives 159,60 —
    // the same quantity to five figures, differing only in how the atomic
    // masses themselves were rounded. Asserted at the precision that is
    // actually shared, so a future table change that moves a real digit
    // fails while this rounding difference does not.
    expect(molarMassOf('CuSO₄')).toBeCloseTo(159.6, 1);
  });

  it('scales with the subscript', () => {
    expect(molarMassOf('O₂')).toBeCloseTo(2 * ATOMIC_MASSES.O, 9);
    expect(molarMassOf('S₈')).toBeCloseTo(8 * ATOMIC_MASSES.S, 9);
  });
});
