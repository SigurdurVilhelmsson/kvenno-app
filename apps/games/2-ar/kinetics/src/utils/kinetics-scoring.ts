/**
 * Calculate score for a kinetics challenge answer.
 *
 * @param isCorrect - whether the user's answer was correct
 * @param usedHint - whether the user used a hint
 * @param basePoints - full points for a correct answer without hints (default 20)
 * @param hintPenalty - points deducted for using a hint (default 10)
 * @returns points earned for this answer
 */
export function calculateScore(
  isCorrect: boolean,
  usedHint: boolean,
  basePoints: number = 20,
  hintPenalty: number = 10
): number {
  if (!isCorrect) return 0;
  return usedHint ? basePoints - hintPenalty : basePoints;
}
