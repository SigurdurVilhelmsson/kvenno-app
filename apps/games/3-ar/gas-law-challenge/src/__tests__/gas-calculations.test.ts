import { describe, it, expect } from 'vitest';
import {
  solveGasLaw,
  checkAnswer,
  calculateError,
  getFormula,
  getUnit,
  getVariableName,
} from '../utils/gas-calculations';
import { R } from '../types';
import type { GasValue } from '../types';

// Helper to create a GasValue
function gv(value: number, unit = ''): GasValue {
  return { value, unit };
}

describe('solveGasLaw', () => {
  // Known values: P = 1.0 atm, V = 22.414 L, n = 1.0 mol, T = 273.15 K
  // PV = nRT => 1.0 * 22.414 = 1.0 * 0.08206 * 273.15 ≈ 22.414

  const P = 1.0;
  const V = 22.414;
  const n = 1.0;
  const T = 273.15;

  it('solves for P when given n, R, T, V', () => {
    const result = solveGasLaw(
      { n: gv(n), T: gv(T), V: gv(V) },
      'P'
    );
    // P = nRT / V
    const expected = (n * R * T) / V;
    expect(result).toBeCloseTo(expected, 4);
    expect(result).toBeCloseTo(P, 2);
  });

  it('solves for V when given n, R, T, P', () => {
    const result = solveGasLaw(
      { n: gv(n), T: gv(T), P: gv(P) },
      'V'
    );
    // V = nRT / P
    const expected = (n * R * T) / P;
    expect(result).toBeCloseTo(expected, 4);
    expect(result).toBeCloseTo(V, 2);
  });

  it('solves for T when given P, V, n', () => {
    const result = solveGasLaw(
      { P: gv(P), V: gv(V), n: gv(n) },
      'T'
    );
    // T = PV / (nR)
    const expected = (P * V) / (n * R);
    expect(result).toBeCloseTo(expected, 4);
    // T ≈ 273.15 but R constant rounding gives ~273.14, so use 1 decimal
    expect(result).toBeCloseTo(T, 1);
  });

  it('solves for n when given P, V, T', () => {
    const result = solveGasLaw(
      { P: gv(P), V: gv(V), T: gv(T) },
      'n'
    );
    // n = PV / (RT)
    const expected = (P * V) / (R * T);
    expect(result).toBeCloseTo(expected, 4);
    expect(result).toBeCloseTo(n, 2);
  });

  it('solves for P with different known values', () => {
    // 2 mol at 300 K in 10 L
    const result = solveGasLaw(
      { n: gv(2), T: gv(300), V: gv(10) },
      'P'
    );
    const expected = (2 * R * 300) / 10;
    expect(result).toBeCloseTo(expected, 4);
  });

  it('solves for V with high pressure', () => {
    // 5 mol at 400 K under 10 atm
    const result = solveGasLaw(
      { n: gv(5), T: gv(400), P: gv(10) },
      'V'
    );
    const expected = (5 * R * 400) / 10;
    expect(result).toBeCloseTo(expected, 4);
  });

  it('throws an error when insufficient data for P (missing V)', () => {
    expect(() =>
      solveGasLaw({ n: gv(1), T: gv(300) }, 'P')
    ).toThrow('Cannot solve for P with given values');
  });

  it('throws an error when insufficient data for V (missing P)', () => {
    expect(() =>
      solveGasLaw({ n: gv(1), T: gv(300) }, 'V')
    ).toThrow('Cannot solve for V with given values');
  });

  it('throws an error when insufficient data for T (missing n)', () => {
    expect(() =>
      solveGasLaw({ P: gv(1), V: gv(10) }, 'T')
    ).toThrow('Cannot solve for T with given values');
  });

  it('throws an error when insufficient data for n (missing T)', () => {
    expect(() =>
      solveGasLaw({ P: gv(1), V: gv(10) }, 'n')
    ).toThrow('Cannot solve for n with given values');
  });

  it('throws when all values are missing', () => {
    expect(() =>
      solveGasLaw({}, 'P')
    ).toThrow('Cannot solve for P');
  });
});

describe('checkAnswer', () => {
  it('returns true when answer is exactly correct', () => {
    expect(checkAnswer(5.0, 5.0, 0.1)).toBe(true);
  });

  it('returns true when answer is within tolerance', () => {
    expect(checkAnswer(5.05, 5.0, 0.1)).toBe(true);
    expect(checkAnswer(4.95, 5.0, 0.1)).toBe(true);
  });

  it('returns true when answer is at the edge of tolerance', () => {
    expect(checkAnswer(5.1, 5.0, 0.1)).toBe(true);
    expect(checkAnswer(4.9, 5.0, 0.1)).toBe(true);
  });

  it('returns false when answer is outside tolerance', () => {
    expect(checkAnswer(5.2, 5.0, 0.1)).toBe(false);
    expect(checkAnswer(4.8, 5.0, 0.1)).toBe(false);
  });

  it('returns false when answer is far from correct', () => {
    expect(checkAnswer(10.0, 5.0, 0.1)).toBe(false);
  });

  it('works with zero tolerance (exact match only)', () => {
    expect(checkAnswer(5.0, 5.0, 0)).toBe(true);
    expect(checkAnswer(5.001, 5.0, 0)).toBe(false);
  });
});

describe('calculateError', () => {
  it('returns 0 for an exact answer', () => {
    expect(calculateError(5.0, 5.0)).toBe(0);
  });

  it('calculates correct percentage error for overestimate', () => {
    // (|5.5 - 5.0| / 5.0) * 100 = 10%
    expect(calculateError(5.5, 5.0)).toBeCloseTo(10, 2);
  });

  it('calculates correct percentage error for underestimate', () => {
    // (|4.5 - 5.0| / 5.0) * 100 = 10%
    expect(calculateError(4.5, 5.0)).toBeCloseTo(10, 2);
  });

  it('returns 100% when answer is double the correct value', () => {
    expect(calculateError(10.0, 5.0)).toBeCloseTo(100, 2);
  });

  it('returns 50% when answer is half the correct value', () => {
    expect(calculateError(2.5, 5.0)).toBeCloseTo(50, 2);
  });
});

describe('getFormula', () => {
  it('returns correct formula for P', () => {
    expect(getFormula('P')).toBe('P = nRT/V');
  });

  it('returns correct formula for V', () => {
    expect(getFormula('V')).toBe('V = nRT/P');
  });

  it('returns correct formula for T', () => {
    expect(getFormula('T')).toBe('T = PV/nR');
  });

  it('returns correct formula for n', () => {
    expect(getFormula('n')).toBe('n = PV/RT');
  });
});

describe('getUnit', () => {
  it('returns atm for P', () => {
    expect(getUnit('P')).toBe('atm');
  });

  it('returns L for V', () => {
    expect(getUnit('V')).toBe('L');
  });

  it('returns K for T', () => {
    expect(getUnit('T')).toBe('K');
  });

  it('returns mol for n', () => {
    expect(getUnit('n')).toBe('mol');
  });
});

describe('getVariableName', () => {
  it('returns Icelandic name for P', () => {
    expect(getVariableName('P')).toBe('Þrýstingur');
  });

  it('returns Icelandic name for V', () => {
    expect(getVariableName('V')).toBe('Rúmmál');
  });

  it('returns Icelandic name for T', () => {
    expect(getVariableName('T')).toBe('Hiti');
  });

  it('returns Icelandic name for n', () => {
    expect(getVariableName('n')).toBe('Mólfjöldi');
  });
});

describe('R constant', () => {
  it('has the correct value for ideal gas constant', () => {
    expect(R).toBe(0.08206);
  });
});
