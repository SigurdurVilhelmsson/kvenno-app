/**
 * Drawing a Level 3 run out of the challenge pool.
 *
 * Level 3 used to play `level3Challenges` from end to end. That was tolerable
 * at sixteen items; the February harvest brings the pool to forty-one, and a
 * forty-one-problem level is not a level, it is an afternoon. So the pool is
 * now a pool and a run is drawn from it.
 *
 * Two properties matter more than the shuffling itself:
 *
 * 1. **Every type appears.** The six challenge types are six different skills —
 *    reading a factor backwards, finding someone else's error, choosing the
 *    short path. A random twelve out of forty-one would sometimes drop one
 *    entirely, so one of each is seeded first.
 * 2. **Contexts spread.** The harvested items are dressed in five everyday
 *    settings, and the whole point of harvesting them was context variation.
 *    Filling the run at random would happily deal five kitchen problems in a
 *    row, so the fill prefers a setting the run has not used yet.
 */

import type { Level3Challenge, Level3Context } from '../data/challenges';

/** How many problems one Level 3 run asks for. */
export const LEVEL_3_RUN_LENGTH = 12;

const CHALLENGE_TYPES = [
  'reverse',
  'error_analysis',
  'efficiency',
  'synthesis',
  'real_world',
  'derivation',
] as const;

/** Fisher–Yates, so the caller can hand in a seeded generator in a test. */
function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Draw one run from the pool.
 *
 * Returns the whole pool, shuffled, when it holds no more than `runLength`
 * items — so a shrunken pool degrades to the old behaviour rather than to an
 * empty level.
 */
export function buildLevel3Run(
  pool: Level3Challenge[],
  runLength: number = LEVEL_3_RUN_LENGTH,
  random: () => number = Math.random
): Level3Challenge[] {
  if (pool.length <= runLength) return shuffle(pool, random);

  const remaining = shuffle(pool, random);
  const chosen: Level3Challenge[] = [];

  const take = (predicate: (c: Level3Challenge) => boolean): boolean => {
    const index = remaining.findIndex(predicate);
    if (index === -1) return false;
    chosen.push(remaining.splice(index, 1)[0]);
    return true;
  };

  // One of each type, so no skill can fall out of a run.
  for (const type of CHALLENGE_TYPES) {
    take((c) => c.type === type);
  }

  // Fill, preferring a setting this run has not shown yet. `undefined` counts
  // as its own setting: the sixteen original items carry no context, and a run
  // of nothing but harvested scenarios would be as narrow as the old runs were.
  const usedContexts = new Set<Level3Context | undefined>(chosen.map((c) => c.context));
  while (chosen.length < runLength && remaining.length > 0) {
    const tookFresh = take((c) => !usedContexts.has(c.context));
    if (tookFresh) {
      usedContexts.add(chosen[chosen.length - 1].context);
    } else {
      chosen.push(remaining.shift() as Level3Challenge);
    }
  }

  return shuffle(chosen, random);
}
