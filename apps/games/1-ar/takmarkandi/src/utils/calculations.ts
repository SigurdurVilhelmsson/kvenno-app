import { Reaction, CorrectAnswer } from '../types';

export function calculateCorrectAnswer(
  reaction: Reaction,
  reactant1Count: number,
  reactant2Count: number
): CorrectAnswer {
  const timesFromR1 = reactant1Count / reaction.reactant1.coeff;
  const timesFromR2 = reactant2Count / reaction.reactant2.coeff;

  const limitingReactant =
    timesFromR1 < timesFromR2
      ? reaction.reactant1.formula
      : reaction.reactant2.formula;

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
    r2Used
  };
}

export function generateReactantCounts(difficulty: 'easy' | 'medium' | 'hard'): {
  r1Count: number;
  r2Count: number;
} {
  let r1Count: number, r2Count: number;

  if (difficulty === 'easy') {
    r1Count = Math.floor(Math.random() * 6) + 3; // 3-8
    r2Count = Math.floor(Math.random() * 6) + 3;
  } else if (difficulty === 'medium') {
    r1Count = Math.floor(Math.random() * 10) + 5; // 5-14
    r2Count = Math.floor(Math.random() * 10) + 5;
  } else {
    r1Count = Math.floor(Math.random() * 15) + 10; // 10-24
    r2Count = Math.floor(Math.random() * 15) + 10;
  }

  return { r1Count, r2Count };
}

export function calculatePoints(
  difficulty: 'easy' | 'medium' | 'hard',
  streak: number,
  timeRemaining: number,
  timerMode: boolean
): number {
  let points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20;

  // Speed bonus in timer mode
  if (timerMode) {
    if (timeRemaining > 90) points += 10;
    else if (timeRemaining > 60) points += 5;
  }

  // Streak bonus
  if (streak % 10 === 0) points += 15;
  else if (streak % 5 === 0) points += 10;
  else if (streak % 3 === 0) points += 5;

  return points;
}
