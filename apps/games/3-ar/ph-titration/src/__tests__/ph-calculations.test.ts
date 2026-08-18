import { describe, it, expect } from 'vitest';

import { titrations } from '../data/titrations';
import {
  calculateStrongStrongPH,
  calculateWeakStrongPH,
  calculateStrongWeakPH,
  calculatePH,
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
    // 25.0 mL of 0.100 M acetic acid, Ka = 1.8e-5.
    // pH = -log10(sqrt(Ka * C)) = -log10(sqrt(1.8e-6)) = 2.87
    // This is the value the game's own data asserts: data/titrations.ts:76 initialPH: 2.87
    const pH = calculateWeakStrongPH(25.0, 0.1, 1.8e-5, 0, 0.1);
    expect(pH).toBeCloseTo(2.87, 2);
  });

  it('initial pH does not depend on the volume of acid present', () => {
    // Concentration, not amount, sets the initial pH. A 1000x volume change must not move it.
    const small = calculateWeakStrongPH(25.0, 0.1, 1.8e-5, 0, 0.1);
    const large = calculateWeakStrongPH(25000, 0.1, 1.8e-5, 0, 0.1);
    expect(small).toBeCloseTo(large, 6);
  });

  it('returns the correct initial pOH-derived pH for a weak base', () => {
    // 25.0 mL of 0.100 M NH3. The third parameter is a pKa, NOT a Ka -- see the
    // note on calculateStrongWeakPH. data/titrations.ts:143 records pKa: 9.26.
    //   Ka  = 10^-9.26
    //   Kb  = Kw/Ka = 1e-14 / 10^-9.26 = 10^(-14+9.26) = 10^-4.74 = 1.82e-5
    //   pOH = 0.5*(-log10(Kb) - log10(C)) = 0.5*(4.74 + 1.00) = 2.87
    //   pH  = 14 - 2.87 = 11.13, which is data/titrations.ts:138 initialPH: 11.13
    const pH = calculateStrongWeakPH(25.0, 0.1, 9.26, 0, 0.1);
    expect(pH).toBeCloseTo(11.13, 1);
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

// Declared initialPH disagrees with the corrected formula by 0.06-0.14 for these
// three. Left asserted-as-failing on purpose, pending a teacher decision on the
// declared values -- the gaps plausibly come from an activity correction or a
// different Ka rather than from a fresh defect, but that is a guess.
// Keyed by id, not name: 'HCl + NaOH' is the name of both id 1 and id 3.
const KNOWN_DISAGREEING = [6, 11, 12]; // HF + NaOH, H2SO3 + NaOH, H2C2O4 + NaOH

describe('every titration starts where its data says it does', () => {
  it.each(
    titrations
      .filter((t) => !KNOWN_DISAGREEING.includes(t.id))
      .map((t) => [`${t.id} ${t.name}`, t] as const)
  )('%s starts at its declared initialPH', (_label, t) => {
    expect(calculatePH(t, 0)).toBeCloseTo(t.initialPH, 1);
  });

  // These three do NOT agree. `it.fails` pins that: if a later edit reconciles the
  // data with the formula, this case goes red and the comment above gets revisited,
  // rather than the disagreement quietly disappearing.
  it.fails.each(
    titrations
      .filter((t) => KNOWN_DISAGREEING.includes(t.id))
      .map((t) => [`${t.id} ${t.name}`, t] as const)
  )('%s does not yet start at its declared initialPH', (_label, t) => {
    expect(calculatePH(t, 0)).toBeCloseTo(t.initialPH, 1);
  });
});
