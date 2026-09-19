import type { BufferProblem, HendersonHasselbalchResult } from '../types';

/**
 * Derive a buffer recipe from Henderson–Hasselbalch.
 *
 * **Why this exists.** Until Sep 2026 every one of these numbers was stored
 * per-problem in `data/problems.ts` as `correctAcidMass`, `correctBaseMass`,
 * `correctAcidMoles`, `correctBaseMoles` and `ratio`. The stored `ratio` values
 * were all correct — `data-integrity.test.ts` checked them against
 * `10^(pH − pKa)` — but nothing checked that the moles followed from the ratio,
 * or that the masses followed from the moles, and **13 of the 29 real problems
 * had at least one value that did not.** The worst was #15, whose base mass was
 * `totalConcentration × molarMass` (0.15 × 141.96 = 21.29 g) where it should
 * have been `baseMoles × molarMass` (0.08 × 141.96 = 11.36 g), an 87 % error.
 *
 * Level 2 graded entered masses against those stored values at ±5 %, so on
 * three of the six problems it serves a student who did the chemistry correctly
 * was marked wrong — and the explanation panel then printed the false
 * multiplication back at them as the worked answer.
 *
 * Deriving is the same cure B4 got in `1-ar/molmassi`, where every molar mass
 * comes from `elements.ts` so a breakdown cannot disagree with its own total.
 * A number that is computed cannot drift from the number it is computed from.
 *
 * **The `phAdjustment` branch is load-bearing.** Problem #25 is not a
 * mix-two-salts recipe: you weigh out *all* of the weak acid and add NaOH to
 * convert part of it to the conjugate base. Its acid mass is therefore the
 * total, not the acid fraction. That model lived only in the stored numbers —
 * `Level2.tsx` never read the flag — so deriving with the standard formula
 * would have silently broken the one problem whose stored data was right.
 */
export function solveBuffer(problem: BufferProblem): HendersonHasselbalchResult {
  const ratio = Math.pow(10, problem.targetPH - problem.pKa);
  const totalMoles = problem.totalConcentration * problem.volume;

  const acidMoles = totalMoles / (1 + ratio);
  const baseMoles = totalMoles - acidMoles;

  // A pH-adjustment problem starts from the full amount of weak acid and
  // titrates part of it across with strong base, so the mass to weigh out is
  // all of it. Everything else mixes the acid and its conjugate base directly.
  const acidMass = (problem.phAdjustment ? totalMoles : acidMoles) * problem.acidMolarMass;
  const baseMass = baseMoles * problem.baseMolarMass;

  return {
    ratio,
    acidConc: acidMoles / problem.volume,
    baseConc: baseMoles / problem.volume,
    acidMoles,
    baseMoles,
    acidMass,
    baseMass,
  };
}

/**
 * The buffer's useful range, pKa ± 1 — what a `rangeQuestion` problem asks for.
 *
 * Kept beside `solveBuffer` because a range question carries `targetPH: 0` as a
 * placeholder, which makes every quantity `solveBuffer` returns meaningless for
 * it. No Level 2 puzzle points at one today; this is here so that if one ever
 * does, the right function is already sitting next to the wrong one.
 */
export function bufferRange(problem: BufferProblem): { low: number; high: number } {
  return { low: problem.pKa - 1, high: problem.pKa + 1 };
}
