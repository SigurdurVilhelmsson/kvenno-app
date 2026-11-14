import { describe, expect, it } from 'vitest';

import { APPENDIX_D1_ACIDS } from '@shared/data/appendix-d';

import { FIRST_BUFFER_ML, STEPS, hhPH } from '../data/agnasyn-steps';
import { titrations } from '../data/titrations';
import {
  ACID_PARTICLES,
  KA,
  ML_PER_PARTICLE,
  PKA,
  V_EQ,
  V_HALF,
  V_MAX,
  drawnCounts,
  pHAt,
  particleCountsAt,
  percentIonised,
  speciesAt,
  trueMinorParticles,
} from '../utils/agnasyn';
import {
  applyCounts,
  createSystem,
  flicker,
  realCounts,
  seeded,
  settle,
  shownCounts,
  step,
} from '../utils/particles';
import { calculatePH } from '../utils/ph-calculations';

const BOUNDS = { left: 0, right: 300, top: 0, bottom: 200 };

describe('Agnasýn chemistry', () => {
  it('is titration 5, the textbook example, with the Appendix D constant', () => {
    const t = titrations.find((x) => x.id === 5)!;
    expect(KA).toBe(t.Ka);
    expect(KA).toBe(1.8e-5);
    expect(V_EQ).toBeCloseTo(25, 10);
    expect(KA).toBe(APPENDIX_D1_ACIDS.acetic.ka[0]);
  });

  it('reads the pH off the same curve as Stig 2', () => {
    const t = titrations.find((x) => x.id === 5)!;
    for (let v = 0; v <= V_MAX; v += 0.25) expect(pHAt(v)).toBe(calculatePH(t, v));
  });

  it('lands on the numbers the book prints', () => {
    expect(pHAt(0).toFixed(2)).toBe('2.87');
    // The ICE root sits 0,0005 above pKa at half-equivalence, which tips the second decimal;
    // the scene says so beside it.
    expect(pHAt(V_HALF) - PKA).toBeGreaterThan(0);
    expect(pHAt(V_HALF) - PKA).toBeLessThan(0.001);
    expect(PKA.toFixed(2)).toBe('4.74');
    expect(pHAt(V_EQ).toFixed(2)).toBe('8.72');
    expect(pHAt(35).toFixed(2)).toBe('12.22');
    expect(percentIonised().toFixed(1)).toBe('1.3');
  });

  it('keeps every acetate group, and one Na⁺ per OH⁻ added', () => {
    for (let v = 0; v <= V_MAX; v += 0.25) {
      const s = speciesAt(v);
      expect(s.mmol.HA + s.mmol.A).toBeCloseTo(2.5, 9);
      const c = particleCountsAt(v);
      const d = drawnCounts(c);
      expect(d.HA + d.A).toBe(ACID_PARTICLES);
      expect(c.Na).toBe(Math.round(v / ML_PER_PARTICLE));
    }
  });

  it('flags only the two volumes where a species is under one particle', () => {
    expect(particleCountsAt(0).flag).toBe('ion');
    expect(particleCountsAt(V_EQ).flag).toBe('hyd');
    expect(particleCountsAt(12.5).flag).toBeNull();
    expect(trueMinorParticles(0)).toBeLessThan(0.5);
    expect(trueMinorParticles(V_EQ)).toBeLessThan(0.01);
  });

  it('rounds the real amounts to the counts drawn away from the flagged volumes', () => {
    for (let i = 1; i <= 32; i++) {
      const v = i * ML_PER_PARTICLE;
      if (Math.abs(v - V_EQ) < 1e-9) continue;
      const s = speciesAt(v);
      const c = particleCountsAt(v);
      expect(Math.round(s.mmol.HA * 8)).toBe(c.HA);
      expect(Math.round(s.mmol.A * 8)).toBe(c.A);
      expect(Math.round(s.mmol.OH * 8)).toBe(c.OH);
      expect(Math.round(s.mmol.H3O * 8)).toBe(c.H3O);
    }
  });
});

describe('Agnasýn particles', () => {
  it('drips a whole titration in and ends with the counts it should', () => {
    const rng = seeded(7);
    const sys = createSystem(BOUNDS);
    applyCounts(sys, particleCountsAt(0), rng, { animate: false, drip: false });
    for (let i = 1; i <= 32; i++) {
      const v = i * ML_PER_PARTICLE;
      applyCounts(sys, particleCountsAt(v), rng, { animate: true, drip: true });
      for (let t = 0; t < 120; t++) step(sys, 1 / 30, rng);
      settle(sys, rng);
      const want = drawnCounts(particleCountsAt(v));
      expect(shownCounts(sys)).toEqual({
        HA: want.HA,
        A: want.A,
        H3O: want.H3O,
        OH: want.OH,
        Na: want.Na,
      });
    }
  });

  it('follows a slider dragged anywhere, backwards included', () => {
    const rng = seeded(3);
    const sys = createSystem(BOUNDS);
    for (let k = 0; k < 200; k++) {
      const v = Math.round(rng() * V_MAX * 4) / 4;
      const target = particleCountsAt(v);
      applyCounts(sys, target, rng, { animate: rng() < 0.5, drip: false });
      settle(sys, rng);
      const want = drawnCounts(target);
      expect(shownCounts(sys)).toEqual({
        HA: want.HA,
        A: want.A,
        H3O: want.H3O,
        OH: want.OH,
        Na: want.Na,
      });
    }
  });

  it('keeps the counts through the dynamic equilibrium', () => {
    const rng = seeded(11);
    for (const v of [0, V_EQ]) {
      const sys = createSystem(BOUNDS);
      applyCounts(sys, particleCountsAt(v), rng, { animate: false, drip: false });
      for (let k = 0; k < 10; k++) {
        flicker(sys, rng);
        for (let t = 0; t < 90; t++) step(sys, 1 / 30, rng);
        settle(sys, rng);
        const want = drawnCounts(particleCountsAt(v));
        expect(shownCounts(sys)).toEqual({
          HA: want.HA,
          A: want.A,
          H3O: want.H3O,
          OH: want.OH,
          Na: want.Na,
        });
      }
      const real = realCounts(sys);
      expect(real.H3O + real.OH).toBe(0);
    }
  });
});

describe('Agnasýn scenes', () => {
  it('print a Henderson-Hasselbalch pH the curve agrees with to two decimals', () => {
    for (const v of [FIRST_BUFFER_ML, 20]) expect(hhPH(v).toFixed(2)).toBe(pHAt(v).toFixed(2));
    expect(hhPH(V_HALF).toFixed(2)).toBe('4.74');
  });

  it('walk the titration forward', () => {
    const volumes = STEPS.map((s) => s.volume);
    for (let i = 1; i < volumes.length; i++)
      expect(volumes[i]).toBeGreaterThanOrEqual(volumes[i - 1]);
    expect(volumes).toContain(V_HALF);
    expect(volumes).toContain(V_EQ);
    expect(volumes[volumes.length - 1]).toBeGreaterThan(V_EQ);
  });
});
