import { describe, it, expect } from 'vitest';

import { APPENDIX_D1_ACIDS, APPENDIX_D2_BASES } from '@shared/data/appendix-d';

import { indicators } from '../data/indicators';
import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { titrations } from '../data/titrations';
import { calculatePH } from '../utils/ph-calculations';

/**
 * The titration bank holds only what a level serves, and every constant in it
 * is Appendix D's.
 *
 * Until 2026-10-23 it held thirteen, seven of which nothing rendered: benzoic
 * acid at a Ka that is not Appendix D's (6,5 × 10⁻⁵ against 6,3 × 10⁻⁵),
 * phosphoric acid at none of Appendix D's three, sulfurous acid, which has no
 * Appendix D row at all, and polyprotic pH branches that fell to −∞ or NaN.
 * Mobile-pass decision 115 (a) deleted them rather than correct maths no
 * screen used.
 */

const ACIDS = Object.values(APPENDIX_D1_ACIDS);
const BASES = Object.values(APPENDIX_D2_BASES);

describe('the titration bank', () => {
  it('holds only the titrations a level serves', () => {
    // Level 2's puzzles name theirs; Level 1 draws its two sample curves from
    // the first strong–strong and the first weak–strong, both among them.
    const served = new Set(LEVEL2_PUZZLES.map((p) => p.titrationId));
    expect(titrations.map((t) => t.id).sort((a, b) => a - b)).toEqual(
      [...served].sort((a, b) => a - b)
    );
  });

  it('holds no polyprotic titration', () => {
    for (const t of titrations) {
      expect(['strong-strong', 'weak-strong', 'strong-weak'], `${t.id} ${t.name}`).toContain(
        t.type
      );
    }
  });

  it.each(titrations.map((t) => [`${t.id} ${t.name}`, t] as const))(
    '%s: every constant is an Appendix D row',
    (_label, t) => {
      if (t.type === 'weak-strong') {
        const row = ACIDS.find((a) => a.formula === t.analyte.formula);
        expect(row, t.analyte.formula).toBeDefined();
        expect(row!.ka).toHaveLength(1);
        expect(t.Ka).toBe(row!.ka[0]);
      } else if (t.type === 'strong-weak') {
        const row = BASES.find((b) => b.formula === t.analyte.formula);
        expect(row, t.analyte.formula).toBeDefined();
        expect(t.Kb).toBe(row!.kb);
      } else {
        expect(t.Ka ?? null).toBeNull();
      }
    }
  );

  it.each(titrations.map((t) => [`${t.id} ${t.name}`, t] as const))(
    '%s: the curve is a number everywhere on the burette',
    (_label, t) => {
      for (let step = 0; step <= 1200; step++) {
        expect(Number.isFinite(calculatePH(t, step * 0.05)), `${step * 0.05} mL`).toBe(true);
      }
    }
  );

  it.each(titrations.map((t) => [`${t.id} ${t.name}`, t] as const))(
    "%s: the best indicator obeys Level 1's rule",
    (_label, t) => {
      const pH = Math.round(calculatePH(t, t.equivalenceVolume) * 10) / 10;
      const [low, high] = indicators.find((i) => i.id === t.bestIndicator)!.pHRange;
      expect(pH, t.bestIndicator).toBeGreaterThanOrEqual(low);
      expect(pH, t.bestIndicator).toBeLessThanOrEqual(high);
    }
  );
});
