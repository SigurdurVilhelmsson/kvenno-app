/**
 * `buildLevel3Run` — the draw that keeps Level 3 a level.
 *
 * The pool went from sixteen items to forty-one with the February harvest, and
 * the level used to play the pool from end to end. The two properties worth
 * pinning are not "it shuffles" but what the shuffling must never cost: a run
 * that silently drops a skill, or a run dressed in one setting.
 */

import { describe, it, expect } from 'vitest';

import { level3Challenges, type Level3Challenge } from '../data/challenges';
import { buildLevel3Run, LEVEL_3_RUN_LENGTH } from '../utils/level3Run';

/** A generator with a fixed sequence, so a failure here is reproducible. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    // xorshift32 — no cryptographic pretensions, just repeatable.
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0x100000000;
  };
}

const ALL_TYPES = [
  'reverse',
  'error_analysis',
  'efficiency',
  'synthesis',
  'real_world',
  'derivation',
];

describe('buildLevel3Run', () => {
  const seeds = [1, 2, 3, 7, 11, 42, 1337, 20260827];

  it.each(seeds)('seed %i — draws exactly one run', (seed) => {
    const run = buildLevel3Run(level3Challenges, LEVEL_3_RUN_LENGTH, seededRandom(seed));
    expect(run).toHaveLength(LEVEL_3_RUN_LENGTH);
  });

  it.each(seeds)('seed %i — never repeats a challenge inside a run', (seed) => {
    const run = buildLevel3Run(level3Challenges, LEVEL_3_RUN_LENGTH, seededRandom(seed));
    expect(new Set(run.map((c) => c.id)).size).toBe(run.length);
  });

  it.each(seeds)('seed %i — exercises all six challenge types', (seed) => {
    const run = buildLevel3Run(level3Challenges, LEVEL_3_RUN_LENGTH, seededRandom(seed));
    const types = new Set(run.map((c) => c.type));
    for (const type of ALL_TYPES) {
      expect(types.has(type as Level3Challenge['type']), `${type} missing from the run`).toBe(true);
    }
  });

  it.each(seeds)('seed %i — spreads the run across everyday settings', (seed) => {
    const run = buildLevel3Run(level3Challenges, LEVEL_3_RUN_LENGTH, seededRandom(seed));
    // Five harvested settings plus `undefined` for the original lab-bench items:
    // a twelve-item run is long enough to hold one of each, and the point of
    // harvesting the scenarios was that a run stops looking the same every time.
    const contexts = new Set(run.map((c) => c.context));
    expect(contexts.size, [...contexts].join(', ')).toBe(6);
  });

  it('draws different runs from different seeds', () => {
    const a = buildLevel3Run(level3Challenges, LEVEL_3_RUN_LENGTH, seededRandom(1))
      .map((c) => c.id)
      .join(',');
    const b = buildLevel3Run(level3Challenges, LEVEL_3_RUN_LENGTH, seededRandom(2))
      .map((c) => c.id)
      .join(',');
    expect(a).not.toBe(b);
  });

  it('returns the whole pool when the pool is no bigger than a run', () => {
    const small = level3Challenges.slice(0, 5);
    const run = buildLevel3Run(small, LEVEL_3_RUN_LENGTH, seededRandom(3));
    expect(run.map((c) => c.id).sort()).toEqual(small.map((c) => c.id).sort());
  });

  it('draws every challenge in the pool eventually, over many runs', () => {
    // Nothing may be authored into the pool and then be unreachable.
    const seen = new Set<string>();
    for (let seed = 1; seed <= 500; seed++) {
      for (const challenge of buildLevel3Run(
        level3Challenges,
        LEVEL_3_RUN_LENGTH,
        seededRandom(seed)
      )) {
        seen.add(challenge.id);
      }
    }
    const unreachable = level3Challenges.filter((c) => !seen.has(c.id)).map((c) => c.id);
    expect(unreachable).toEqual([]);
  });
});
