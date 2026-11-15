import { describe, expect, it } from 'vitest';

import { reactionQuotient } from '@shared/engine/equilibrium';

import {
  K,
  K_FORWARD,
  K_REVERSE,
  REACTION,
  SPECIES,
  T_MAX,
  amountsAt,
  countsAt,
  equilibriumExtent,
  qAt,
  settledTime,
  unsnappedEnd,
} from '../engine/naermynd';

describe('Nærmynd: the approach to equilibrium', () => {
  it('uses the water-gas shift and its sourced K', () => {
    expect(REACTION.id).toBe('vatnsgas');
    expect(K).toBe(0.64);
    expect(K_FORWARD / K_REVERSE).toBeCloseTo(K, 12);
  });

  it('ends both flasks where solveExtent puts them, and the rates agree', () => {
    for (const f of ['hvarfefni', 'myndefni'] as const) {
      expect(qAt(f, T_MAX)).toBeCloseTo(K, 10);
      // Mass action with kf/kr = K settles on the same root; by T_MAX it is within 0,5 %.
      expect(Math.abs(unsnappedEnd(f) / equilibriumExtent(f) - 1)).toBeLessThan(0.005);
    }
  });

  it('ends both flasks in the same mixture, since they hold the same atoms', () => {
    expect(countsAt('hvarfefni', T_MAX)).toEqual({ CO: 11, 'H₂O': 11, 'CO₂': 9, 'H₂': 9 });
    expect(countsAt('myndefni', T_MAX)).toEqual(countsAt('hvarfefni', T_MAX));
  });

  it('starts at Q = 0 and Q = ∞, and moves Q monotonically toward K from each side', () => {
    expect(qAt('hvarfefni', 0)).toBe(0);
    expect(qAt('myndefni', 0)).toBe(Infinity);
    let up = 0;
    let down = Infinity;
    for (let t = 0.1; t <= T_MAX; t += 0.1) {
      const a = qAt('hvarfefni', t);
      const b = qAt('myndefni', t);
      expect(a).toBeGreaterThanOrEqual(up);
      expect(a).toBeLessThanOrEqual(K + 1e-9);
      expect(b).toBeLessThanOrEqual(down);
      expect(b).toBeGreaterThanOrEqual(K - 1e-9);
      up = a;
      down = b;
    }
  });

  it('keeps Q equal to the reaction quotient of the drawn amounts', () => {
    for (const t of [0.5, 2, 5]) {
      expect(qAt('hvarfefni', t)).toBe(reactionQuotient(REACTION, amountsAt('hvarfefni', t)));
    }
  });

  it('conserves particles: each CO lost is one CO₂ gained', () => {
    for (const f of ['hvarfefni', 'myndefni'] as const) {
      for (let t = 0; t <= T_MAX; t += 0.25) {
        const c = countsAt(f, t);
        expect(c.CO + c['CO₂']).toBe(20);
        expect(c['H₂O'] + c['H₂']).toBe(20);
        expect(SPECIES.every((s) => c[s] >= 0)).toBe(true);
      }
    }
  });

  it('settles on screen well before the end of the time axis', () => {
    expect(settledTime('hvarfefni')).toBeLessThan(T_MAX * 0.7);
    expect(settledTime('myndefni')).toBeLessThan(T_MAX * 0.7);
  });
});
