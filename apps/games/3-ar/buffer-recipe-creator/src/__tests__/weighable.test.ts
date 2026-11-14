import { describe, expect, it } from 'vitest';

import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { BUFFER_PROBLEMS } from '../data/problems';

/**
 * Stig 2 asks for the mass of each component to weigh out, so neither may be a
 * gas. Until 2026-11-14 one puzzle asked for grams of NH₃, the same premise
 * Lausnir dropped in August for its gases. Level 3 still uses the ammonium
 * buffer, from stock solutions, where ammonia is measured by volume.
 */
const GASES = ['NH₃'];

describe('Stig 2 only weighs out what can be weighed', () => {
  it('asks for no mass of a gas', () => {
    for (const puzzle of LEVEL2_PUZZLES) {
      const p = BUFFER_PROBLEMS.find((b) => b.id === puzzle.problemId)!;
      expect(GASES, `puzzle ${puzzle.id}`).not.toContain(p.acidName);
      expect(GASES, `puzzle ${puzzle.id}`).not.toContain(p.baseName);
    }
  });

  it('describes the carbonate buffer at the pH it is made at', () => {
    // Its context said swimming pools at pH 7,2–7,8 beside a target of 9,80.
    const carbonate = BUFFER_PROBLEMS.find((p) => p.id === 12)!;
    expect(carbonate.context).not.toMatch(/7,2|7,8/);
  });
});
