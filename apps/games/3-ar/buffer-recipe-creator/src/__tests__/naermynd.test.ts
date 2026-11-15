import { describe, expect, it } from 'vitest';

import { STEPS } from '../data/naermynd-steps';
import { solveBuffer } from '../engine/buffer';
import {
  ACID_PARTICLES,
  BASE_PARTICLES,
  ML_PER_PARTICLE,
  N_ACID,
  N_BASE,
  PARTICLES_PER_MMOL,
  PKA,
  SCENE_PROBLEM,
  V_CAPACITY_ACID,
  V_CAPACITY_BASE,
  V_MAX,
  V_SAMPLE,
  countsAfter,
  pHAfter,
} from '../engine/naermynd';

/**
 * Nærmynd's numbers: the buffer is Stig 2's first problem, its pH is exact and
 * agrees with Henderson-Hasselbalch while both acid and base are there, and
 * the particles are whole amounts that follow the reaction.
 */

const volumes = Array.from(
  { length: Math.round(V_MAX / ML_PER_PARTICLE) + 1 },
  (_, i) => i * ML_PER_PARTICLE
);

describe('Nærmynd chemistry', () => {
  it('takes its buffer from Stig 2’s first problem through solveBuffer', () => {
    expect(SCENE_PROBLEM.acidName).toBe('CH₃COOH');
    const r = solveBuffer(SCENE_PROBLEM);
    expect(N_ACID).toBeCloseTo(r.acidConc * V_SAMPLE, 12);
    expect(N_BASE).toBeCloseTo(r.baseConc * V_SAMPLE, 12);
  });

  it('draws whole amounts: nothing is rounded', () => {
    expect(N_ACID * PARTICLES_PER_MMOL).toBeCloseTo(ACID_PARTICLES, 9);
    expect(N_BASE * PARTICLES_PER_MMOL).toBeCloseTo(BASE_PARTICLES, 9);
  });

  it('starts the buffer at pKa and the water at 7', () => {
    expect(pHAfter('buffer', 'HCl', 0)).toBeCloseTo(PKA, 2);
    expect(pHAfter('water', 'HCl', 0)).toBeCloseTo(7, 6);
    expect(pHAfter('water', 'NaOH', 0)).toBeCloseTo(7, 6);
  });

  it('agrees with Henderson-Hasselbalch on the particles while both acid and base remain', () => {
    for (const reagent of ['HCl', 'NaOH'] as const) {
      for (const v of volumes) {
        const c = countsAfter('buffer', reagent, v);
        if (c.HA === 0 || c.A === 0) continue;
        expect(pHAfter('buffer', reagent, v), `${reagent} ${v}`).toBeCloseTo(
          PKA + Math.log10(c.A / c.HA),
          1
        );
      }
    }
  });

  it('has water move far more than the buffer for the first drop', () => {
    const v = ML_PER_PARTICLE;
    const buf = Math.abs(pHAfter('buffer', 'HCl', v) - PKA);
    const water = Math.abs(pHAfter('water', 'HCl', v) - 7);
    expect(buf).toBeLessThan(0.1);
    expect(water).toBeGreaterThan(4);
  });

  it('keeps every pH moving the right way as reagent is added', () => {
    for (const glass of ['buffer', 'water'] as const) {
      for (let i = 1; i < volumes.length; i++) {
        expect(pHAfter(glass, 'HCl', volumes[i])).toBeLessThan(
          pHAfter(glass, 'HCl', volumes[i - 1])
        );
        expect(pHAfter(glass, 'NaOH', volumes[i])).toBeGreaterThan(
          pHAfter(glass, 'NaOH', volumes[i - 1])
        );
      }
    }
  });

  it('runs out of base, and of acid, exactly at its capacity and stays out', () => {
    expect(V_CAPACITY_ACID).toBeLessThan(V_MAX);
    expect(V_CAPACITY_BASE).toBeLessThan(V_MAX);
    for (const v of volumes) {
      const acid = countsAfter('buffer', 'HCl', v);
      expect(acid.A === 0).toBe(v >= V_CAPACITY_ACID - 1e-9);
      expect(acid.H3O > 0).toBe(v > V_CAPACITY_ACID + 1e-9);
      const base = countsAfter('buffer', 'NaOH', v);
      expect(base.HA === 0).toBe(v >= V_CAPACITY_BASE - 1e-9);
    }
  });

  it('conserves acetate and keeps every glass neutral in charge', () => {
    for (const glass of ['buffer', 'water'] as const) {
      for (const reagent of ['HCl', 'NaOH'] as const) {
        for (const v of volumes) {
          const c = countsAfter(glass, reagent, v);
          expect(c.HA + c.A).toBe(glass === 'buffer' ? ACID_PARTICLES + BASE_PARTICLES : 0);
          expect(c.H3O + c.Na).toBe(c.A + c.OH + (c.Cl ?? 0));
        }
      }
    }
  });

  it('ends every scene inside the slider’s range, on a whole particle', () => {
    for (const s of STEPS) {
      expect(s.volume).toBeLessThanOrEqual(V_MAX);
      expect((s.volume / ML_PER_PARTICLE) % 1).toBe(0);
    }
  });
});
