import { Reaction, CorrectAnswer } from '../types';

export function calculateCorrectAnswer(
  reaction: Reaction,
  reactant1Count: number,
  reactant2Count: number
): CorrectAnswer {
  const timesFromR1 = reactant1Count / reaction.reactant1.coeff;
  const timesFromR2 = reactant2Count / reaction.reactant2.coeff;

  const limitingReactant =
    timesFromR1 < timesFromR2 ? reaction.reactant1.formula : reaction.reactant2.formula;

  const timesReactionRuns = Math.floor(Math.min(timesFromR1, timesFromR2));

  // Calculate each product separately
  const productsFormed: Record<string, number> = {};
  reaction.products.forEach((product) => {
    productsFormed[product.formula] = timesReactionRuns * product.coeff;
  });

  const r1Used = timesReactionRuns * reaction.reactant1.coeff;
  const r2Used = timesReactionRuns * reaction.reactant2.coeff;

  const excessReactant =
    limitingReactant === reaction.reactant1.formula
      ? reaction.reactant2.formula
      : reaction.reactant1.formula;

  const excessRemaining =
    limitingReactant === reaction.reactant1.formula
      ? reactant2Count - r2Used
      : reactant1Count - r1Used;

  return {
    limitingReactant,
    productsFormed,
    excessReactant,
    excessRemaining,
    timesReactionRuns,
    timesFromR1,
    timesFromR2,
    r1Used,
    r2Used,
  };
}

/** How many times the reaction can run, per difficulty: [min, max] inclusive. */
const RUN_RANGES = {
  easy: [2, 6],
  medium: [4, 10],
  hard: [6, 15],
} as const;

/**
 * Draw molecule counts for a limiting-reactant problem.
 *
 * Counts are whole multiples of their own coefficients. That is not decoration --
 * the game prints the method as `min(A ÷ c1, B ÷ c2)` (`Level2.tsx:157`) and tells
 * the student the lower number *is* how many times the reaction runs (`:233`).
 * Drawing the counts independently of the coefficients made that quotient
 * fractional on ~44% of level 2 and ~70% of level 3 problems, so a student who
 * followed the printed method was graded wrong; the code silently floored it.
 * It also left the *limiting* reactant with molecules to spare, which contradicts
 * the definition the game is teaching.
 *
 * The two multipliers are always different, so exactly one reactant is limiting.
 */
export function generateReactantCounts(
  difficulty: 'easy' | 'medium' | 'hard',
  reaction: Reaction
): {
  r1Count: number;
  r2Count: number;
} {
  const [min, max] = RUN_RANGES[difficulty];
  const pick = () => min + Math.floor(Math.random() * (max - min + 1));

  const runs1 = pick();
  let runs2 = pick();
  while (runs2 === runs1) runs2 = pick();

  return {
    r1Count: runs1 * reaction.reactant1.coeff,
    r2Count: runs2 * reaction.reactant2.coeff,
  };
}
