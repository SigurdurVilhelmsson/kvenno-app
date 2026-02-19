import { describe, it, expect } from 'vitest';

import { calculateDeltaG, getSpontaneity } from '../utils/thermo-calculations';

describe('calculateDeltaG', () => {
  it('calculates ΔG correctly with known values at 298 K', () => {
    // ΔH = -802 kJ/mol, ΔS = -5 J/(mol·K), T = 298 K
    // ΔG = -802 - 298 * (-5/1000) = -802 + 1.49 = -800.51
    const result = calculateDeltaG(-802, -5, 298);
    expect(result).toBeCloseTo(-800.51, 1);
  });

  it('calculates ΔG = 0 when ΔH equals TΔS', () => {
    // ΔH = 100 kJ/mol, ΔS = 200 J/(mol·K), T = 500 K
    // ΔG = 100 - 500 * (200/1000) = 100 - 100 = 0
    const result = calculateDeltaG(100, 200, 500);
    expect(result).toBeCloseTo(0, 5);
  });

  it('returns ΔH when ΔS is zero', () => {
    // ΔG = ΔH - T * 0 = ΔH
    const result = calculateDeltaG(-50, 0, 298);
    expect(result).toBe(-50);
  });

  it('returns ΔH when temperature is zero', () => {
    // ΔG = ΔH - 0 * ΔS = ΔH
    const result = calculateDeltaG(-92, -199, 0);
    expect(result).toBe(-92);
  });

  it('correctly converts ΔS from J to kJ', () => {
    // ΔH = 0, ΔS = 1000 J/(mol·K), T = 1 K
    // ΔG = 0 - 1 * (1000/1000) = -1
    const result = calculateDeltaG(0, 1000, 1);
    expect(result).toBeCloseTo(-1, 5);
  });

  it('handles large positive ΔG (non-spontaneous reaction)', () => {
    // Photosynthesis: ΔH = 2803, ΔS = -210 J/(mol·K), T = 298 K
    // ΔG = 2803 - 298 * (-210/1000) = 2803 + 62.58 = 2865.58
    const result = calculateDeltaG(2803, -210, 298);
    expect(result).toBeCloseTo(2865.58, 1);
  });

  it('handles water vaporization at 373 K', () => {
    // ΔH = 44.0, ΔS = 118 J/(mol·K), T = 373 K
    // ΔG = 44.0 - 373 * (118/1000) = 44.0 - 44.014 = -0.014
    const result = calculateDeltaG(44.0, 118, 373);
    expect(result).toBeCloseTo(-0.014, 1);
  });
});

describe('getSpontaneity', () => {
  it('returns "spontaneous" for negative ΔG', () => {
    expect(getSpontaneity(-50)).toBe('spontaneous');
  });

  it('returns "non-spontaneous" for positive ΔG', () => {
    expect(getSpontaneity(50)).toBe('non-spontaneous');
  });

  it('returns "equilibrium" for ΔG near zero (positive)', () => {
    expect(getSpontaneity(0.5)).toBe('equilibrium');
  });

  it('returns "equilibrium" for ΔG near zero (negative)', () => {
    expect(getSpontaneity(-0.5)).toBe('equilibrium');
  });

  it('returns "equilibrium" for ΔG exactly zero', () => {
    expect(getSpontaneity(0)).toBe('equilibrium');
  });

  it('returns "spontaneous" for ΔG = -1.01 (just below threshold)', () => {
    expect(getSpontaneity(-1.01)).toBe('spontaneous');
  });

  it('returns "non-spontaneous" for ΔG = 1.01 (just above threshold)', () => {
    expect(getSpontaneity(1.01)).toBe('non-spontaneous');
  });

  it('returns "equilibrium" for ΔG = 0.99 (just inside threshold)', () => {
    expect(getSpontaneity(0.99)).toBe('equilibrium');
  });
});

describe('thermodynamic scenarios', () => {
  it('Scenario 1: ΔH<0, ΔS>0 is always spontaneous', () => {
    // Decomposition of hydrogen peroxide: ΔH = -196, ΔS = 126
    // Should be spontaneous at any temperature
    const lowT = calculateDeltaG(-196, 126, 200);
    const midT = calculateDeltaG(-196, 126, 298);
    const highT = calculateDeltaG(-196, 126, 1200);

    expect(getSpontaneity(lowT)).toBe('spontaneous');
    expect(getSpontaneity(midT)).toBe('spontaneous');
    expect(getSpontaneity(highT)).toBe('spontaneous');
  });

  it('Scenario 2: ΔH>0, ΔS<0 is never spontaneous', () => {
    // Ozone formation: ΔH = 285, ΔS = -137
    // Should be non-spontaneous at any temperature
    const lowT = calculateDeltaG(285, -137, 200);
    const midT = calculateDeltaG(285, -137, 298);
    const highT = calculateDeltaG(285, -137, 1200);

    expect(getSpontaneity(lowT)).toBe('non-spontaneous');
    expect(getSpontaneity(midT)).toBe('non-spontaneous');
    expect(getSpontaneity(highT)).toBe('non-spontaneous');
  });

  it('Scenario 3: ΔH<0, ΔS<0 is spontaneous at low T, non-spontaneous at high T', () => {
    // Haber process: ΔH = -92, ΔS = -199
    // Crossover T = |ΔH / (ΔS/1000)| = 92 / 0.199 ≈ 462 K
    const lowT = calculateDeltaG(-92, -199, 200);   // below crossover
    const highT = calculateDeltaG(-92, -199, 800);   // above crossover

    expect(getSpontaneity(lowT)).toBe('spontaneous');
    expect(getSpontaneity(highT)).toBe('non-spontaneous');
  });

  it('Scenario 4: ΔH>0, ΔS>0 is spontaneous at high T, non-spontaneous at low T', () => {
    // CaCO3 decomposition: ΔH = 178, ΔS = 161
    // Crossover T = |ΔH / (ΔS/1000)| = 178 / 0.161 ≈ 1106 K
    const lowT = calculateDeltaG(178, 161, 200);    // below crossover
    const highT = calculateDeltaG(178, 161, 1200);   // above crossover

    expect(getSpontaneity(lowT)).toBe('non-spontaneous');
    expect(getSpontaneity(highT)).toBe('spontaneous');
  });
});
