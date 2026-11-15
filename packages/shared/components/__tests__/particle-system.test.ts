import { describe, expect, it } from 'vitest';

import {
  applyCounts,
  createSystem,
  exchange,
  realCounts,
  seeded,
  settle,
  shownCounts,
  step,
  type ParticleCounts,
} from '../ParticleBeaker';

/**
 * The shared particle system's strong-acid half, added for the buffer scene in
 * `3-ar/buffer-recipe-creator`: H⁺ drips in with Cl⁻ and protonates CH₃COO⁻.
 * Nærmynd's titration (the NaOH half) is held by `3-ar/ph-titration`'s tests.
 */

const BOUNDS = { left: 0, right: 300, top: 0, bottom: 240 };

const buffer = (hcl: number): ParticleCounts => {
  const used = Math.min(hcl, 10);
  return { HA: 10 + used, A: 10 - used, H3O: hcl - used, OH: 0, Na: 10, Cl: hcl, flag: null };
};

const expected = (c: ParticleCounts) => ({
  HA: c.HA,
  A: c.A,
  H3O: c.H3O,
  OH: c.OH,
  Na: c.Na,
  Cl: c.Cl ?? 0,
});

describe('particle system, strong acid', () => {
  it('drips H⁺ in one at a time and each protonates an acetate until none is left', () => {
    const rng = seeded(5);
    const sys = createSystem(BOUNDS);
    applyCounts(sys, buffer(0), rng, { animate: false, drip: false });
    for (let n = 1; n <= 14; n++) {
      applyCounts(sys, buffer(n), rng, { animate: true, drip: true });
      // While the H⁺ swims, the system already counts it as reacted.
      expect(realCounts(sys)).toEqual(expected(buffer(n)));
      for (let t = 0; t < 120; t++) step(sys, 1 / 30, rng);
      settle(sys, rng);
      expect(shownCounts(sys)).toEqual(expected(buffer(n)));
    }
  });

  it('sends a dripped H⁺ to an acetate rather than spawning the acid in place', () => {
    const rng = seeded(9);
    const sys = createSystem(BOUNDS);
    applyCounts(sys, buffer(0), rng, { animate: false, drip: false });
    applyCounts(sys, buffer(1), rng, { animate: true, drip: true });
    const swimmer = sys.particles.find((p) => p.action === 'protonate');
    expect(swimmer?.kind).toBe('H3O');
    expect(sys.particles.find((p) => p.id === swimmer?.target)?.kind).toBe('A');
  });

  it('follows any jump in either reagent, backwards included', () => {
    const rng = seeded(21);
    const sys = createSystem(BOUNDS);
    for (let k = 0; k < 200; k++) {
      const n = Math.floor(rng() * 15);
      const target: ParticleCounts =
        rng() < 0.5
          ? buffer(n)
          : {
              HA: 10 - Math.min(n, 10),
              A: 10 + Math.min(n, 10),
              H3O: 0,
              OH: n - Math.min(n, 10),
              Na: 10 + n,
              Cl: 0,
              flag: null,
            };
      applyCounts(sys, target, rng, { animate: rng() < 0.5, drip: false });
      settle(sys, rng);
      expect(shownCounts(sys)).toEqual(expected(target));
    }
  });
});

describe('particle system, a weak acid at its real counts', () => {
  it('exchanges an ionisation for a recombination and keeps the counts', () => {
    const rng = seeded(13);
    const sys = createSystem(BOUNDS);
    const weak: ParticleCounts = { HA: 37, A: 3, H3O: 3, OH: 0, Na: 0, Cl: 0, flag: null };
    applyCounts(sys, weak, rng, { animate: false, drip: false });
    for (let k = 0; k < 20; k++) {
      exchange(sys, rng);
      expect(realCounts(sys)).toEqual(expected(weak));
      for (let t = 0; t < 90; t++) step(sys, 1 / 30, rng);
      settle(sys, rng);
      expect(shownCounts(sys)).toEqual(expected(weak));
    }
  });

  it('does nothing with no free pair to recombine', () => {
    const rng = seeded(2);
    const sys = createSystem(BOUNDS);
    const molecules: ParticleCounts = { HA: 10, A: 0, H3O: 0, OH: 0, Na: 0, Cl: 0, flag: null };
    applyCounts(sys, molecules, rng, { animate: false, drip: false });
    exchange(sys, rng);
    expect(shownCounts(sys)).toEqual(expected(molecules));
  });
});
