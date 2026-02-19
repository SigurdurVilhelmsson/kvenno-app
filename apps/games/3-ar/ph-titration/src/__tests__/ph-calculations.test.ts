import { describe, it, expect } from 'vitest';
import {
  calculateStrongStrongPH,
  calculateWeakStrongPH,
  calculateStrongWeakPH,
  getPHColor,
} from '../utils/ph-calculations';

describe('calculateStrongStrongPH', () => {
  // 50 mL of 0.1 M HCl titrated with 0.1 M NaOH

  it('returns low pH before base is added', () => {
    // 50 mL 0.1M HCl, 0 mL NaOH => pure acid
    const pH = calculateStrongStrongPH(50, 0.1, 0, 0.1);
    // [H+] = 0.005/0.05 = 0.1 M => pH = 1.0
    expect(pH).toBeCloseTo(1.0, 1);
  });

  it('returns pH = 7 at equivalence point', () => {
    // 50 mL of 0.1M HCl + 50 mL of 0.1M NaOH => eq point
    const pH = calculateStrongStrongPH(50, 0.1, 50, 0.1);
    expect(pH).toBeCloseTo(7.0, 1);
  });

  it('returns pH > 7 after equivalence (excess base)', () => {
    // 50 mL of 0.1M HCl + 60 mL of 0.1M NaOH => excess base
    const pH = calculateStrongStrongPH(50, 0.1, 60, 0.1);
    expect(pH).toBeGreaterThan(7);
  });

  it('returns pH < 7 before equivalence (excess acid)', () => {
    // 50 mL of 0.1M HCl + 25 mL of 0.1M NaOH => excess acid
    const pH = calculateStrongStrongPH(50, 0.1, 25, 0.1);
    expect(pH).toBeLessThan(7);
    expect(pH).toBeGreaterThan(1);
  });

  it('correctly calculates half-equivalence', () => {
    // At half-equivalence: 50 mL HCl 0.1M + 25 mL NaOH 0.1M
    // moles acid = 0.005, moles base = 0.0025, excess H+ = 0.0025
    // [H+] = 0.0025 / 0.075 = 0.0333 M => pH ~ 1.48
    const pH = calculateStrongStrongPH(50, 0.1, 25, 0.1);
    expect(pH).toBeCloseTo(1.48, 1);
  });
});

describe('calculateWeakStrongPH', () => {
  // 50 mL of 0.1 M acetic acid (Ka = 1.8e-5) titrated with 0.1 M NaOH

  it('returns acidic pH for initial weak acid solution', () => {
    const pH = calculateWeakStrongPH(50, 0.1, 1.8e-5, 0, 0.1);
    // Initial pH of weak acid
    expect(pH).toBeGreaterThan(1);
    expect(pH).toBeLessThan(7);
  });

  it('returns pKa at half-equivalence point (buffer region)', () => {
    // Half-equivalence: 25 mL NaOH added to 50 mL acetic acid
    // Henderson-Hasselbalch: pH = pKa + log(1) = pKa
    const pH = calculateWeakStrongPH(50, 0.1, 1.8e-5, 25, 0.1);
    const pKa = -Math.log10(1.8e-5);
    expect(pH).toBeCloseTo(pKa, 1);
  });

  it('returns pH > 7 at equivalence point (weak base formed)', () => {
    // Equivalence: 50 mL NaOH => acetate ion is a weak base
    const pH = calculateWeakStrongPH(50, 0.1, 1.8e-5, 50, 0.1);
    expect(pH).toBeGreaterThan(7);
  });

  it('returns high pH when excess strong base is added', () => {
    // 60 mL NaOH (past equivalence) - excess OH- dominates
    const pH = calculateWeakStrongPH(50, 0.1, 1.8e-5, 60, 0.1);
    expect(pH).toBeGreaterThan(11);
  });
});

describe('calculateStrongWeakPH', () => {
  // 50 mL of 0.1 M NH3 (pKa = 9.25 for NH4+) titrated with 0.1 M HCl

  it('returns basic pH for initial weak base solution', () => {
    const pH = calculateStrongWeakPH(50, 0.1, 9.25, 0, 0.1);
    expect(pH).toBeGreaterThan(7);
  });

  it('returns pH < 7 at equivalence point (weak acid formed)', () => {
    // NH3 + HCl -> NH4+ (weak acid), so pH < 7
    const pH = calculateStrongWeakPH(50, 0.1, 9.25, 50, 0.1);
    expect(pH).toBeLessThan(7);
  });

  it('returns pKa at half-equivalence point', () => {
    // At half-equivalence: pH = pKa
    const pH = calculateStrongWeakPH(50, 0.1, 9.25, 25, 0.1);
    expect(pH).toBeCloseTo(9.25, 1);
  });

  it('returns low pH when excess strong acid is added', () => {
    const pH = calculateStrongWeakPH(50, 0.1, 9.25, 60, 0.1);
    expect(pH).toBeLessThan(3);
  });
});

describe('getPHColor', () => {
  it('returns dark red for pH 0', () => {
    const color = getPHColor(0);
    expect(color).toBe('#8B0000');
  });

  it('returns green for pH 7', () => {
    const color = getPHColor(7);
    expect(color).toBe('#00FF00');
  });

  it('returns purple for pH 14', () => {
    const color = getPHColor(14);
    expect(color).toBe('#800080');
  });

  it('clamps negative pH to 0', () => {
    const color = getPHColor(-2);
    expect(color).toBe('#8B0000');
  });

  it('clamps pH > 14 to 14', () => {
    const color = getPHColor(16);
    expect(color).toBe('#800080');
  });

  it('returns correct color for integer pH values', () => {
    // Just verify we get a string for each value
    for (let pH = 0; pH <= 14; pH++) {
      const color = getPHColor(pH);
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
