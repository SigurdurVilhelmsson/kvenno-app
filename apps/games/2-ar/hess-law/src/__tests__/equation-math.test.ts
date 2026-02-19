import { describe, it, expect } from 'vitest';

import { multiplyEquationCoefficients } from '../utils/equation-math';

describe('multiplyEquationCoefficients', () => {
  it('returns equation unchanged when multiplier is 1', () => {
    expect(multiplyEquationCoefficients('CH₄(g) + 2O₂(g)', 1))
      .toBe('CH₄(g) + 2O₂(g)');
  });

  it('multiplies implicit coefficient of 1', () => {
    expect(multiplyEquationCoefficients('CH₄(g)', 2))
      .toBe('2CH₄(g)');
  });

  it('multiplies explicit integer coefficients', () => {
    expect(multiplyEquationCoefficients('2O₂(g)', 3))
      .toBe('6O₂(g)');
  });

  it('multiplies all terms in a multi-term equation', () => {
    expect(multiplyEquationCoefficients('CH₄(g) + 2O₂(g)', 2))
      .toBe('2CH₄(g) + 4O₂(g)');
  });

  it('handles fraction coefficient ½ with integer result', () => {
    expect(multiplyEquationCoefficients('½O₂(g)', 2))
      .toBe('O₂(g)');
  });

  it('handles fraction coefficient ½ with multiplier 3', () => {
    expect(multiplyEquationCoefficients('½O₂(g)', 3))
      .toBe('³⁄₂O₂(g)');
  });

  it('handles mixed equation with fraction and integer', () => {
    expect(multiplyEquationCoefficients('H₂(g) + ½O₂(g)', 2))
      .toBe('2H₂(g) + O₂(g)');
  });

  it('handles multiplier of 3 on complex equation', () => {
    expect(multiplyEquationCoefficients('C(s) + O₂(g)', 3))
      .toBe('3C(s) + 3O₂(g)');
  });

  it('preserves state annotations like (g), (l), (s)', () => {
    const result = multiplyEquationCoefficients('CO₂(g) + 2H₂O(l)', 2);
    expect(result).toBe('2CO₂(g) + 4H₂O(l)');
  });

  it('handles single-term equation', () => {
    expect(multiplyEquationCoefficients('CO₂(g)', 3))
      .toBe('3CO₂(g)');
  });
});
