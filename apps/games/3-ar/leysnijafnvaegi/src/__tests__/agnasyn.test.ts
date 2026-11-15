import { describe, expect, it } from 'vitest';

import {
  AG2CRO4,
  AGCL,
  AG_FOR_AG2CRO4,
  AG_FOR_AGCL,
  CL_GONE_AT_RED,
  COMMON_FACTOR,
  MIX_CONCENTRATIONS,
  S_COMMON,
  S_WATER,
  WATER_PER_ION,
  mixAt,
  mohrAt,
} from '../engine/agnasyn';
import { molarSolubility } from '../engine/ksp';

describe('Agnasýn: the numbers behind the pictures', () => {
  it('uses Brown’s AgCl and Ag₂CrO₄ through the game’s own engine', () => {
    expect(AGCL.ksp).toBe(1.8e-10);
    expect(AG2CRO4.ksp).toBe(1.2e-12);
    expect(S_WATER).toBe(molarSolubility(AGCL));
    expect(S_WATER).toBeCloseTo(Math.sqrt(1.8e-10), 15);
  });

  it('has about four million water molecules per dissolved Ag⁺, which is why the ions are exaggerated', () => {
    expect(WATER_PER_ION).toBeGreaterThan(4e6);
    expect(WATER_PER_ION).toBeLessThan(4.2e6);
  });

  it('cuts the solubility several hundredfold with 0,010 M chloride', () => {
    expect(S_COMMON * (S_COMMON + 0.01)).toBeCloseTo(AGCL.ksp, 20);
    expect(COMMON_FACTOR).toBeGreaterThan(700);
    expect(COMMON_FACTOR).toBeLessThan(800);
  });

  it('precipitates in the mixing scene exactly where Q > Ksp, with both choices on offer', () => {
    const verdicts = MIX_CONCENTRATIONS.map((c) => mixAt(c).precipitates);
    expect(verdicts).toEqual([true, true, false, false]);
    expect(mixAt(1e-4).diluted.cation).toBeCloseTo(5e-5, 15);
    // No offered concentration sits near the line, where rounding could flip the verdict.
    for (const c of MIX_CONCENTRATIONS) {
      const r = mixAt(c).ratio;
      expect(r > 3 || r < 1 / 3).toBe(true);
    }
  });

  it('brings AgCl down first in the Mohr titration although its Ksp is larger', () => {
    expect(AGCL.ksp).toBeGreaterThan(AG2CRO4.ksp);
    expect(AG_FOR_AGCL).toBeLessThan(AG_FOR_AG2CRO4);
    expect(CL_GONE_AT_RED).toBeGreaterThan(0.99);
    expect(mohrAt(1e-9)).toMatchObject({ agcl: false, ag2cro4: false, cl: 0.01 });
    expect(mohrAt(1e-6)).toMatchObject({ agcl: true, ag2cro4: false });
    expect(mohrAt(5e-5)).toMatchObject({ agcl: true, ag2cro4: true });
  });
});
