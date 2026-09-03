/**
 * How this game grades a typed answer.
 *
 * **Siggi's ruling, 2026-09-03: grade on the approximation, by the 5 % rule.**
 *
 * That settles the question the README raised as a finding rather than a
 * preference. `3-ar/ph-titration` stores `initialPH: 2.87` for 0,100 M ediksýra
 * and `11.13` for 0,100 M ammóníak (`data/titrations.ts:76,138`), and both are
 * `√(Ka·C)` values. If this game taught the exact quadratic and graded 2,88, two
 * adjacent nodes of one chain would disagree about the same beaker — the defect
 * in numbers that the glossary work spent a week eliminating in words.
 *
 * So **where the 5 % rule holds, the approximation is the quoted answer**, and
 * where it fails the exact root is, because there the approximation is not a
 * rounding away from the answer but the wrong answer.
 *
 * **Why accepting both routes needs no special case.** The two roots are related
 * exactly: h_exact = √(Ka·C·(1−α)) = h_approx·√(1−α), so the pH gap is
 * −½·log₁₀(1−α). Under the 5 % rule that is at most −½·log₁₀(0,95) = **0,0111**,
 * comfortably inside the ±0,02 tolerance below. A student who solved the
 * quadratic therefore lands inside tolerance of the quoted approximation
 * automatically, with no second comparison needed.
 *
 * That bound is the reason `PH_TOLERANCE` may not be tightened below ~0,012
 * without breaking the ruling, and a test pins it. (An earlier draft of this
 * file put the boundary gap at 0,022 — that is −log₁₀(1−α), missing the factor
 * of ½ that comes from the square root, and it wrongly implied a second
 * comparison was needed. The half matters.)
 */

import { solveWeakAcid, type WeakAcidSolution } from './ka';

/**
 * pH is reported to two decimals, so this is a rounding tolerance.
 *
 * It also has a floor with a reason: it must exceed 0,0111, the widest the exact
 * and approximate roots can be apart while the 5 % rule still licenses the
 * approximation. Below that, a correct quadratic solution starts being marked
 * wrong. See `EXACT_APPROX_MAX_GAP`.
 */
export const PH_TOLERANCE = 0.02;

/**
 * The widest the exact and approximate pH can differ while the 5 % rule holds:
 * −½·log₁₀(1 − 0,05). `PH_TOLERANCE` must stay above it.
 */
export const EXACT_APPROX_MAX_GAP = -0.5 * Math.log10(1 - 0.05);

/**
 * Ka spans ten orders of magnitude, so its tolerance has to be relative.
 * 1 % is the platform's figure — `1-ar/dimensional-analysis` grades on it.
 */
export const KA_RELATIVE_TOLERANCE = 0.01;

/**
 * A wider tolerance for Ka recovered from a **measured pH**, and it is not
 * generosity — the arithmetic requires it.
 *
 * Ka ∝ [H⁺]² and [H⁺] = 10⁻ᵖᴴ, so a pH quoted to two decimals carries ±0,005,
 * and d(ln Ka) = 2·ln10·d(pH) = **2,3 %** before the student does anything at
 * all. Grading that answer at 1 % marks a correct calculation wrong purely
 * because the question rounded its own input. 5 % leaves room for the student to
 * round [H⁺] as well.
 *
 * This is the same failure as B13 seen from the other side: there an absolute
 * tolerance was wrong because the answers spanned scales; here a tight relative
 * tolerance is wrong because the *question* is less precise than the tolerance.
 */
export const KA_FROM_PH_TOLERANCE = 0.05;

/**
 * Klofnunarhlutfall is graded relatively, not to a fixed number of percentage
 * points.
 *
 * An absolute tolerance is the B13 defect: this game's own pool spans 0,0011 %
 * (fenól at 1,0 M) to 12,6 % (maurasýra at 0,01 M), and ±0,1 percentage points
 * would accept a bare `0` for the first while demanding four significant figures
 * of the second. 2 % relative means the same thing at both ends.
 */
export const PERCENT_RELATIVE_TOLERANCE = 0.02;

export interface PHGrade {
  correct: boolean;
  /** The value the game quotes as the answer. */
  expected: number;
  /**
   * Whether the 5 % rule licensed the approximation for this problem.
   *
   * A property of the problem, not of the student's work, and always known — so
   * feedback may state it freely. **What feedback may not say is which route the
   * student took.** Under the 5 % rule the two answers agree to within 0,0111
   * pH, so a correct answer is not evidence either way, and asserting otherwise
   * would be inventing a fact about their work.
   */
  approximationValid: boolean;
  /** The full solution, so a caller can explain rather than just judge. */
  solution: WeakAcidSolution;
}

/**
 * The pH this game quotes for a solution.
 *
 * The approximation where the 5 % rule licenses it — that is what the textbook
 * prints and what `ph-titration` already stores — and the exact root where it
 * does not.
 */
export function referencePH(ka: number, concentration: number): number {
  const s = solveWeakAcid(ka, concentration);
  return s.approximationValid ? s.pHApprox : s.pH;
}

/**
 * Grade a typed pH against the quoted value.
 *
 * `value` is already-parsed — call `parseStudentNumber` from `@shared/utils` at
 * the input, so the Icelandic decimal comma survives.
 */
export function gradePH(
  value: number,
  ka: number,
  concentration: number,
  tolerance: number = PH_TOLERANCE
): PHGrade {
  const solution = solveWeakAcid(ka, concentration);
  const expected = solution.approximationValid ? solution.pHApprox : solution.pH;

  return {
    correct: Number.isFinite(value) && Math.abs(value - expected) <= tolerance,
    expected,
    approximationValid: solution.approximationValid,
    solution,
  };
}

/**
 * Klofnunarhlutfall — the share of the acid that has dissociated, as a percent.
 *
 * From the exact root, always. This is the number the 5 % rule is *stated on*,
 * so computing it from the approximation would make the rule test itself.
 */
export function percentDissociation(ka: number, concentration: number): number {
  return solveWeakAcid(ka, concentration).fractionDissociated * 100;
}

/** Relative comparison, for Ka and any other answer spanning decades. */
export function isRelativelyClose(
  value: number,
  expected: number,
  relativeTolerance: number = KA_RELATIVE_TOLERANCE
): boolean {
  if (!Number.isFinite(value)) return false;
  if (expected === 0) return value === 0;
  return Math.abs(value - expected) <= Math.abs(expected) * relativeTolerance;
}

/** Absolute comparison, for pH, pKa and percentages — all of which are logs or shares. */
export function isAbsolutelyClose(value: number, expected: number, tolerance: number): boolean {
  if (!Number.isFinite(value)) return false;
  return Math.abs(value - expected) <= tolerance;
}
