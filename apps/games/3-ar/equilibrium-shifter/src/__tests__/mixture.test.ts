import { describe, expect, it } from 'vitest';

import { CONSTANTS, STARTING_MIXTURES } from '../data/constants';
import { equilibria } from '../data/equilibria';
import { MIN_RATIO, TARGET, mixtureFrames, shownSpecies } from '../engine/mixture';
import { applyStress, equilibrate } from '../engine/stress';
import type { Equilibrium } from '../types';

/**
 * The particle view draws what `applyStress` computes, on one fixed scale per
 * system, and draws nothing where it could not do that honestly.
 */

const solvable = equilibria.filter((eq) => CONSTANTS[eq.id] && STARTING_MIXTURES[eq.id]);
const beforeOf = (eq: Equilibrium) =>
  equilibrate(eq, CONSTANTS[eq.id].value, STARTING_MIXTURES[eq.id])!;
const drawn = solvable.filter((eq) => mixtureFrames(eq, beforeOf(eq), null, null));

describe('mixtureFrames', () => {
  it('draws the systems it can draw to scale, and only those', () => {
    expect(drawn.map((eq) => eq.id)).toEqual([2, 3, 4, 6, 11, 12, 14, 18, 25, 26, 27, 28, 30]);
  });

  it('puts the largest species at TARGET and the smallest at two particles or more', () => {
    for (const eq of drawn) {
      const [first] = mixtureFrames(eq, beforeOf(eq), null, null)!.frames;
      const counts = Object.values(first.counts);
      expect(Math.max(...counts), eq.nameIs).toBe(TARGET);
      expect(Math.min(...counts), eq.nameIs).toBeGreaterThanOrEqual(2);
    }
    expect(TARGET * MIN_RATIO).toBe(2);
  });

  it('draws nothing for a weak acid, whose H⁺ is too few to show without exaggerating', () => {
    const acetic = solvable.find((eq) => eq.id === 8)!;
    expect(mixtureFrames(acetic, beforeOf(acetic), null, null)).toBeNull();
  });

  it('counts every frame from applyStress on the same scale', () => {
    for (const eq of drawn) {
      const before = beforeOf(eq);
      for (const stress of eq.possibleStresses) {
        const outcome = applyStress(eq, CONSTANTS[eq.id], STARTING_MIXTURES[eq.id], stress)!;
        const m = mixtureFrames(eq, before, outcome, stress);
        if (!m) continue;
        const sets = [outcome.before, outcome.afterStress, outcome.afterEquilibrium];
        m.frames.forEach((f, i) => {
          for (const s of m.species) {
            expect(f.counts[s.formula]).toBe(
              Math.round((sets[i]![s.formula] ?? 0) * f.volume * m.scale)
            );
          }
        });
      }
    }
  });

  it('keeps the counts and shrinks the box when the vessel is compressed', () => {
    const haber = drawn.find((eq) => eq.id === 11)!;
    const stress = { type: 'increase-pressure' as const, target: null };
    const outcome = applyStress(haber, CONSTANTS[11], STARTING_MIXTURES[11], stress)!;
    const m = mixtureFrames(haber, beforeOf(haber), outcome, stress)!;
    expect(m.frames[1].counts).toEqual(m.frames[0].counts);
    expect(m.frames[1].volume).toBe(0.5);
    // Then the shift to fewer gas molecules: ammonia up, nitrogen and hydrogen down.
    expect(m.frames[2].counts['NH₃']).toBeGreaterThan(m.frames[1].counts['NH₃']);
    expect(m.frames[2].counts['H₂']).toBeLessThan(m.frames[1].counts['H₂']);
  });

  it('stops at the stress where the new K is unknown, rather than drawing no change', () => {
    const pcl5 = drawn.find((eq) => eq.id === 3)!;
    const stress = { type: 'increase-temp' as const, target: null };
    const outcome = applyStress(pcl5, CONSTANTS[3], STARTING_MIXTURES[3], stress)!;
    expect(outcome.kUnknown).toBe(true);
    expect(mixtureFrames(pcl5, beforeOf(pcl5), outcome, stress)!.frames).toHaveLength(2);
  });

  it('shows only species that appear in K', () => {
    for (const eq of drawn) {
      for (const s of shownSpecies(eq)) {
        const m = [...eq.reactants, ...eq.products].find((x) => x.formula === s.formula)!;
        expect(['g', 'aq']).toContain(m.phase);
      }
    }
  });
});
