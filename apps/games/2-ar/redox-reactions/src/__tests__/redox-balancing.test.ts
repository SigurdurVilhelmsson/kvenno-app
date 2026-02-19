import { describe, it, expect } from 'vitest';

import { gcd, lcm, calculateMultipliers, stripCharges, checkIdentification } from '../utils/redox-balancing';

describe('gcd', () => {
  it('returns gcd for common cases', () => {
    expect(gcd(2, 4)).toBe(2);
    expect(gcd(3, 2)).toBe(1);
    expect(gcd(6, 4)).toBe(2);
    expect(gcd(12, 8)).toBe(4);
  });

  it('handles equal numbers', () => {
    expect(gcd(5, 5)).toBe(5);
  });

  it('handles 1', () => {
    expect(gcd(1, 7)).toBe(1);
  });
});

describe('lcm', () => {
  it('returns lcm for common cases', () => {
    expect(lcm(2, 3)).toBe(6);
    expect(lcm(3, 4)).toBe(12);
    expect(lcm(2, 4)).toBe(4);
  });

  it('handles equal numbers', () => {
    expect(lcm(5, 5)).toBe(5);
  });

  it('handles 1', () => {
    expect(lcm(1, 7)).toBe(7);
  });
});

describe('calculateMultipliers', () => {
  it('returns [1,1] when electrons are equal', () => {
    expect(calculateMultipliers(2, 2)).toEqual([1, 1]);
  });

  it('returns correct multipliers for Fe/Ag (2e, 1e)', () => {
    expect(calculateMultipliers(2, 1)).toEqual([1, 2]);
  });

  it('returns correct multipliers for Al/H (3e, 2e)', () => {
    expect(calculateMultipliers(3, 2)).toEqual([2, 3]);
  });

  it('returns correct multipliers for Mg/O (2e, 4e)', () => {
    expect(calculateMultipliers(2, 4)).toEqual([2, 1]);
  });
});

describe('stripCharges', () => {
  it('strips superscript charges', () => {
    expect(stripCharges('Fe³⁺')).toBe('fe');
    expect(stripCharges('Cu²⁺')).toBe('cu');
    expect(stripCharges('Br⁻')).toBe('br');
  });

  it('strips subscripts', () => {
    expect(stripCharges('O₂')).toBe('o');
    expect(stripCharges('H₂')).toBe('h');
  });

  it('returns lowercase', () => {
    expect(stripCharges('Zn')).toBe('zn');
    expect(stripCharges('Al')).toBe('al');
  });
});

describe('checkIdentification', () => {
  it('returns both correct for matching species', () => {
    const result = checkIdentification('Zn', 'Cu', 'Zn', 'Cu²⁺');
    expect(result.oxidizedCorrect).toBe(true);
    expect(result.reducedCorrect).toBe(true);
  });

  it('returns both incorrect for swapped species', () => {
    const result = checkIdentification('Cu', 'Zn', 'Zn', 'Cu²⁺');
    expect(result.oxidizedCorrect).toBe(false);
    expect(result.reducedCorrect).toBe(false);
  });

  it('ignores case', () => {
    const result = checkIdentification('zn', 'cu', 'Zn', 'Cu²⁺');
    expect(result.oxidizedCorrect).toBe(true);
    expect(result.reducedCorrect).toBe(true);
  });

  it('handles partial correctness', () => {
    const result = checkIdentification('Zn', 'Zn', 'Zn', 'Cu²⁺');
    expect(result.oxidizedCorrect).toBe(true);
    expect(result.reducedCorrect).toBe(false);
  });
});
