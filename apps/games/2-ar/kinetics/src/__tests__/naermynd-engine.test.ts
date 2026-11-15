import { describe, expect, it } from 'vitest';

import {
  A0,
  PARTICLES,
  T_HALF,
  ZERO_EMPTY_AT,
  firstOrderAt,
  zeroOrderAt,
} from '../engine/naermynd';
import { concentrationAt, halfLife } from '../engine/rate-laws';

describe('Hvarfhraði Nærmynd engine', () => {
  it('halves the first-order flask every half-life, as the book does', () => {
    // ch12/m68791: 1,000 → 0,500 → 0,250 → 0,125 M at 0, 6, 12 and 18 klst.
    expect(firstOrderAt(0).concentration).toBeCloseTo(1.0, 10);
    expect(firstOrderAt(6).concentration).toBeCloseTo(0.5, 10);
    expect(firstOrderAt(12).concentration).toBeCloseTo(0.25, 10);
    expect(firstOrderAt(18).concentration).toBeCloseTo(0.125, 10);
    expect([0, 6, 12, 18, 24].map((t) => firstOrderAt(t).count)).toEqual([32, 16, 8, 4, 2]);
    // ln[H₂O₂] at 24 klst. is −2,772 in the book's table.
    expect(Math.log(firstOrderAt(24).concentration)).toBeCloseTo(-2.772, 2);
  });

  it('empties the zero-order flask after two of its first half-lives', () => {
    expect(zeroOrderAt(T_HALF).count).toBe(16);
    expect(ZERO_EMPTY_AT).toBeCloseTo(2 * T_HALF, 10);
    expect(zeroOrderAt(12).count).toBe(0);
    expect(zeroOrderAt(20).concentration).toBe(0);
  });

  it('keeps the first-order half-life fixed and shrinks the zero-order one', () => {
    for (const t of [0, 3, 9, 15]) expect(firstOrderAt(t).halfLifeNow).toBeCloseTo(T_HALF, 10);
    expect(zeroOrderAt(0).halfLifeNow).toBeCloseTo(6, 10);
    expect(zeroOrderAt(6).halfLifeNow).toBeCloseTo(3, 10);
    expect(zeroOrderAt(9).halfLifeNow).toBeCloseTo(1.5, 10);
  });

  it('counts are the concentrations on a fixed scale, rounded', () => {
    for (let t = 0; t <= 30; t += 0.5) {
      expect(firstOrderAt(t).count).toBe(
        Math.round((firstOrderAt(t).concentration / A0) * PARTICLES)
      );
      expect(zeroOrderAt(t).count).toBe(
        Math.round((zeroOrderAt(t).concentration / A0) * PARTICLES)
      );
    }
  });

  it('is the function the graph draws', () => {
    expect(concentrationAt(6, 1, Math.LN2 / 6, 1)).toBeCloseTo(0.5, 10);
    expect(halfLife(1, 1 / 12, 0)).toBeCloseTo(6, 10);
  });
});
