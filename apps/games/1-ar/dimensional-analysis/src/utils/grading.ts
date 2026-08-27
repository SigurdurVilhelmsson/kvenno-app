/**
 * Reading and grading a typed numeric answer.
 *
 * Two shipped defects lived in the same expression and are fixed together here,
 * because fixing either alone leaves the other making the level unusable:
 *
 * **B13 — an absolute 0,01 tolerance.** `Math.abs(user - expected) < 0.01`, applied
 * to answers spanning 0,005 kg to 5 000 000 mm. At the small end it was absurdly
 * loose: on L2-7, whose answer is 0,005 kg, typing `0` scored correct. At the
 * large end it demanded the exact value. A relative tolerance behaves the same way
 * at every scale, and 1% is what this game's own Level 3 already uses for its
 * synthesis and derivation problems — so this makes the game consistent with
 * itself rather than inventing a new rule.
 *
 * **B9 — `parseFloat` cannot read an Icelandic decimal comma.** `parseFloat('0,5')`
 * stops at the comma and returns 0. The game's own worked example teaches the
 * answer as `0,5 g` (`Level2.tsx`), so a student copying the format they were just
 * shown was marked wrong — and then told they had probably inverted a factor.
 * Eight of the fifteen Level-2 answers are non-integer, so this was reachable on
 * over half the level. `1-ar/molmassi` already normalises the comma before
 * parsing; this follows that precedent.
 *
 * The repo-wide decimal-comma pass (B9/B10 across every game) has since landed;
 * the parser this game introduced is now `@shared/utils`' and is re-exported
 * below.
 */

/**
 * Read a number the way an Icelandic student writes one.
 *
 * This game got the fix first and the rest of the library followed, so the
 * implementation now lives in `@shared/utils` and this is the re-export. It
 * stays because every call site in this game imports it from here alongside
 * `isAnswerCorrect`, which is game-specific.
 */
export { parseStudentNumber } from '@shared/utils';

/** The share of the expected value a student's answer may differ by. */
export const RELATIVE_TOLERANCE = 0.01;

/**
 * Is the answer close enough?
 *
 * Relative to the expected magnitude, so it means the same thing whether the
 * answer is 0,005 or 5 000 000. An expected value of exactly zero has no
 * meaningful relative tolerance, so it requires an exact zero.
 */
export function isAnswerCorrect(
  userValue: number,
  expected: number,
  relativeTolerance: number = RELATIVE_TOLERANCE
): boolean {
  if (!Number.isFinite(userValue)) return false;
  if (expected === 0) return userValue === 0;
  return Math.abs(userValue - expected) <= Math.abs(expected) * relativeTolerance;
}

/**
 * Apply a chain of `"num unit / den unit"` factors to a starting value.
 *
 * Extracted because Level 2 computed this twice, verbatim, in `handleSubmit` and
 * in `getDetailedFeedback` — two copies of the grading rule that could drift apart
 * and disagree about whether the same answer was right.
 */
export function applyFactorPath(startValue: number, path: string[]): number {
  return path.reduce((value, factor) => {
    const [num, den] = factor.split(' / ');
    const numerator = Number.parseFloat(num.split(' ')[0]);
    const denominator = Number.parseFloat(den.split(' ')[0]);
    return (value * numerator) / denominator;
  }, startValue);
}
