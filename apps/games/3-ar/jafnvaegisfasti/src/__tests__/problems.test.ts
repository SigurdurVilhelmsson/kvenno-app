import { describe, expect, it } from 'vitest';

import {
  APPROXIMATION_HOLDS,
  APPROXIMATION_FAILS,
  DIRECTION_PROBLEMS,
  EXPRESSION_PROBLEMS,
  ICE_PROBLEMS,
  KP_PROBLEMS,
} from '../data/problems';
import { amountsAtExtent, deltaNGas, kcToKp, reactionQuotient } from '../engine/equilibrium';

describe('the expression set', () => {
  it('covers homogeneous and heterogeneous, and leads with the easy case', () => {
    expect(EXPRESSION_PROBLEMS.length).toBeGreaterThanOrEqual(6);
    expect(EXPRESSION_PROBLEMS[0].difficulty).toBe('ledd');
    const heterogeneous = EXPRESSION_PROBLEMS.filter((p) =>
      [...p.reaction.reactants, ...p.reaction.products].some(
        (s) => s.phase === 's' || s.phase === 'l'
      )
    );
    expect(heterogeneous.length).toBeGreaterThanOrEqual(3);
  });

  it('says what each one is for', () => {
    for (const p of EXPRESSION_PROBLEMS) {
      expect(p.point.trim().length, p.id).toBeGreaterThan(20);
    }
  });
});

describe('the direction set', () => {
  it('derives Q rather than storing it', () => {
    for (const p of DIRECTION_PROBLEMS) {
      expect(p.q, p.id).toBeCloseTo(reactionQuotient(p.reaction, p.amounts), 12);
    }
  });

  it('is not answerable by always saying the same thing', () => {
    const directions = new Set(DIRECTION_PROBLEMS.map((p) => p.direction));
    expect(directions.has('afram')).toBe(true);
    expect(directions.has('afturabak')).toBe(true);
    // Neither answer may be more than three quarters of the set, or guessing
    // beats reading — the threshold 1-ar/utfellingarhvorf's scenario set uses.
    for (const d of directions) {
      const share =
        DIRECTION_PROBLEMS.filter((p) => p.direction === d).length / DIRECTION_PROBLEMS.length;
      expect(share, `${d} is ${Math.round(share * 100)} % of the set`).toBeLessThanOrEqual(0.75);
    }
  });
});

describe('the Kc-to-Kp set', () => {
  it('only offers reactions that can actually be converted', () => {
    expect(KP_PROBLEMS.length).toBeGreaterThanOrEqual(4);
    for (const p of KP_PROBLEMS) {
      expect(p.temperatureC, p.id).toBeTypeOf('number');
      expect(p.expression, p.id).toMatch(/^Kp = /);
    }
  });

  it('derives Kp rather than storing it', () => {
    for (const p of KP_PROBLEMS) {
      expect(p.kp, p.id).toBeCloseTo(kcToKp(p.kc, deltaNGas(p.reaction), p.temperatureC), 12);
    }
  });

  it('includes a delta-n of zero, where Kp equals Kc', () => {
    const flat = KP_PROBLEMS.find((p) => p.deltaN === 0);
    expect(flat, 'no delta-n = 0 case, so nothing shows Kp can equal Kc').toBeDefined();
    expect(flat!.kp).toBe(flat!.kc);
  });

  it('includes both signs of delta-n', () => {
    expect(KP_PROBLEMS.some((p) => p.deltaN > 0)).toBe(true);
    expect(KP_PROBLEMS.some((p) => p.deltaN < 0)).toBe(true);
  });
});

describe('the ICE set', () => {
  it('derives every row, and the rows are consistent', () => {
    for (const p of ICE_PROBLEMS) {
      for (const row of p.result.rows) {
        expect(row.initial + row.change, `${p.id} ${row.formula}`).toBeCloseTo(row.equilibrium, 12);
        expect(row.equilibrium, `${p.id} ${row.formula} went negative`).toBeGreaterThanOrEqual(0);
        const expected = (row.side === 'hvarfefni' ? -1 : 1) * row.coefficient * p.result.extent;
        expect(row.change, `${p.id} ${row.formula}`).toBeCloseTo(expected, 12);
      }
    }
  });

  it('lands on K', () => {
    for (const p of ICE_PROBLEMS) {
      const k = p.reaction.constant!.value;
      const at = amountsAtExtent(p.reaction, p.initial, p.result.extent);
      expect(Math.abs(reactionQuotient(p.reaction, at) - k) / k, p.id).toBeLessThan(1e-9);
    }
  });

  it('has cases on both sides of the five per cent rule', () => {
    // The whole reason the rule is taught is that it sometimes fails. A set
    // where it always holds teaches that it always holds.
    expect(APPROXIMATION_HOLDS.length, 'no problem where the shortcut works').toBeGreaterThan(0);
    expect(APPROXIMATION_FAILS.length, 'no problem where the shortcut fails').toBeGreaterThan(0);
  });

  it('reports the shortcut honestly on every problem', () => {
    for (const p of ICE_PROBLEMS) {
      const approx = p.result.approximateExtent;
      if (approx === null) continue;
      const error = Math.abs(approx - p.result.extent) / p.result.extent;
      // Where the rule says the shortcut is safe, it has to actually be close;
      // where it says it is not, the two must visibly differ. A rule that
      // passes a shortcut which is wrong anyway is worse than no rule.
      if (p.result.approximationSafe) expect(error, p.id).toBeLessThan(0.03);
      else expect(error, p.id).toBeGreaterThan(0.01);
    }
  });

  it('starts every problem away from equilibrium', () => {
    for (const p of ICE_PROBLEMS) {
      expect(
        p.result.direction,
        `${p.id} starts at equilibrium, so there is nothing to solve`
      ).not.toBe('jafnvaegi');
    }
  });

  it('rejects zero, double, half and NaN as answers', () => {
    // The general rule from 3-ar/syrufastinn: assert the property, do not
    // trust the comparison mode. A tolerance wide enough to accept a bare 0
    // is B13 again.
    for (const p of ICE_PROBLEMS) {
      const x = p.result.extent;
      expect(x, p.id).toBeGreaterThan(0);
      expect(Number.isFinite(x), p.id).toBe(true);
      const k = p.reaction.constant!.value;
      const qAt = (guess: number) =>
        reactionQuotient(p.reaction, amountsAtExtent(p.reaction, p.initial, guess));
      // Half and one-and-a-half times the true extent must both be visibly
      // wrong. Either can fall outside the feasible range, which is itself a
      // rejection — a concentration would go negative — so that counts as a
      // pass rather than being skipped silently.
      for (const wrong of [x / 2, x * 1.5]) {
        let q: number;
        try {
          q = qAt(wrong);
        } catch {
          continue;
        }
        if (!Number.isFinite(q)) continue;
        expect(Math.abs(q - k) / k, `${p.id} accepts ${wrong}`).toBeGreaterThan(0.01);
      }
    }
  });

  it('orders the run from easiest to hardest', () => {
    const rank = { ledd: 0, mid: 1, thung: 2 };
    const ranks = ICE_PROBLEMS.map((p) => rank[p.difficulty]);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });
});
