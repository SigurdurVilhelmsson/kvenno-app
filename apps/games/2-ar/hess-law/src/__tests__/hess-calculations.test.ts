import { describe, it, expect } from 'vitest';

import {
  calculateSum,
  checkAnswer,
  calculateDeltaHrxn,
  FORMATION_ENTHALPIES,
} from '../utils/hess-calculations';

describe('calculateSum', () => {
  it('sums delta H values for equations', () => {
    const equations = [
      { deltaH: -393.5, multiplier: 1, isReversed: false },
      { deltaH: -283.0, multiplier: 1, isReversed: true },
    ];
    // -393.5 + 283.0 = -110.5
    expect(calculateSum(equations)).toBeCloseTo(-110.5);
  });

  it('handles multiplier correctly', () => {
    const equations = [
      { deltaH: -393.5, multiplier: 2, isReversed: false },
    ];
    expect(calculateSum(equations)).toBeCloseTo(-787.0);
  });

  it('handles reversal (sign flip)', () => {
    const equations = [
      { deltaH: -297.0, multiplier: 1, isReversed: true },
    ];
    expect(calculateSum(equations)).toBeCloseTo(297.0);
  });

  it('handles combined reversal and multiplier', () => {
    const equations = [
      { deltaH: -277.0, multiplier: 1, isReversed: true }, // +277
      { deltaH: -393.5, multiplier: 2, isReversed: false }, // -787
      { deltaH: -285.8, multiplier: 3, isReversed: false }, // -857.4
    ];
    // +277 - 787 - 857.4 = -1367.4
    expect(calculateSum(equations)).toBeCloseTo(-1367.4);
  });

  it('returns 0 for empty array', () => {
    expect(calculateSum([])).toBe(0);
  });

  it('handles positive delta H values', () => {
    const equations = [
      { deltaH: 90.2, multiplier: 1, isReversed: false },
      { deltaH: -57.0, multiplier: 1, isReversed: false },
    ];
    expect(calculateSum(equations)).toBeCloseTo(33.2);
  });
});

describe('checkAnswer', () => {
  it('accepts exact answer', () => {
    expect(checkAnswer(-890.3, -890.3)).toBe(true);
  });

  it('accepts answer within 2% tolerance', () => {
    // -890.3 * 0.02 = 17.806 tolerance
    expect(checkAnswer(-880, -890.3)).toBe(true);
  });

  it('rejects answer outside 2% tolerance', () => {
    expect(checkAnswer(-800, -890.3)).toBe(false);
  });

  it('handles positive correct answers', () => {
    expect(checkAnswer(178, 178.3)).toBe(true);
  });

  it('handles small values near zero', () => {
    // For a correct answer of 0, tolerance is 0, so only exact 0 works
    expect(checkAnswer(0, 0)).toBe(true);
  });

  it('rejects wrong sign', () => {
    expect(checkAnswer(890, -890.3)).toBe(false);
  });
});

describe('calculateDeltaHrxn', () => {
  it('calculates methane combustion correctly', () => {
    const products = [
      { formula: 'CO2(g)', coefficient: 1, deltaHf: -393.5 },
      { formula: 'H2O(l)', coefficient: 2, deltaHf: -285.8 },
    ];
    const reactants = [
      { formula: 'CH4(g)', coefficient: 1, deltaHf: -74.8 },
      { formula: 'O2(g)', coefficient: 2, deltaHf: 0 },
    ];
    // [1(-393.5) + 2(-285.8)] - [1(-74.8) + 2(0)]
    // = -393.5 - 571.6 - (-74.8) = -965.1 + 74.8 = -890.3
    expect(calculateDeltaHrxn(products, reactants)).toBeCloseTo(-890.3);
  });

  it('calculates ammonia formation correctly', () => {
    const products = [
      { formula: 'NH3(g)', coefficient: 2, deltaHf: -46.1 },
    ];
    const reactants = [
      { formula: 'N2(g)', coefficient: 1, deltaHf: 0 },
      { formula: 'H2(g)', coefficient: 3, deltaHf: 0 },
    ];
    expect(calculateDeltaHrxn(products, reactants)).toBeCloseTo(-92.2);
  });

  it('calculates endothermic reaction (CaCO3 decomposition)', () => {
    const products = [
      { formula: 'CaO(s)', coefficient: 1, deltaHf: -635.1 },
      { formula: 'CO2(g)', coefficient: 1, deltaHf: -393.5 },
    ];
    const reactants = [
      { formula: 'CaCO3(s)', coefficient: 1, deltaHf: -1206.9 },
    ];
    // (-635.1 + -393.5) - (-1206.9) = -1028.6 + 1206.9 = 178.3
    expect(calculateDeltaHrxn(products, reactants)).toBeCloseTo(178.3);
  });
});

describe('FORMATION_ENTHALPIES data integrity', () => {
  it('contains all standard state elements with value 0', () => {
    const elements = ['O2(g)', 'H2(g)', 'N2(g)', 'C(s)', 'Fe(s)', 'Al(s)', 'S(s)', 'Cl2(g)'];
    for (const element of elements) {
      expect(FORMATION_ENTHALPIES[element]).toBeDefined();
      expect(FORMATION_ENTHALPIES[element].value).toBe(0);
    }
  });

  it('contains water in both liquid and gas states', () => {
    expect(FORMATION_ENTHALPIES['H2O(l)'].value).toBe(-285.8);
    expect(FORMATION_ENTHALPIES['H2O(g)'].value).toBe(-241.8);
  });

  it('has negative formation enthalpies for stable compounds', () => {
    expect(FORMATION_ENTHALPIES['CO2(g)'].value).toBeLessThan(0);
    expect(FORMATION_ENTHALPIES['NaCl(s)'].value).toBeLessThan(0);
  });

  it('has positive formation enthalpy for NO(g)', () => {
    expect(FORMATION_ENTHALPIES['NO(g)'].value).toBeGreaterThan(0);
  });
});
