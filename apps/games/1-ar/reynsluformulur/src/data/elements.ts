/**
 * Atomic masses for Reynsluformúlur.
 *
 * **Re-exported from `@shared/data/elements`, which is now the platform's
 * single source for these numbers.** This file used to hold a transcribed
 * copy, held to `1-ar/molmassi`'s by a test, and its own comment explained
 * why — "reaching across into a sibling's data directory is not something
 * this repo does". That was right about game-to-game imports and does not
 * reach `packages/shared`, which every game already imports and which already
 * holds `appendix-d.ts` and `thermo.ts`. A third game needed the same numbers
 * (`1-ar/takmarkandi`, for theoretical yield), and a third copy with a third
 * agreement test would have been the wrong answer.
 *
 * The name stays, so every import and test in this game is unchanged. The
 * agreement test against molmassi's richer `ELEMENTS` array stays too, and now
 * pins that array to the shared table — it lives in `__tests__/problems.test.ts`,
 * not in the `elements-agree.test.ts` the old comment here named, which has
 * never existed.
 */

export { ATOMIC_MASSES, type ElementSymbol } from '@shared/data/elements';
