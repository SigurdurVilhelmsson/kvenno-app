/**
 * Points for a kinetics challenge answer: full points for a correct answer, none otherwise.
 *
 * There is deliberately no hint parameter. Hint usage is never penalised on this platform
 * (CLAUDE.md, "Game Design Philosophy"), and this function used to take `usedHint` and dock
 * 10 of the 20 points for it — a live penalty in Level 1 until 2026-09-23.
 *
 * @param isCorrect - whether the user's answer was correct
 * @param basePoints - points for a correct answer (default 20)
 */
export function calculateScore(isCorrect: boolean, basePoints: number = 20): number {
  return isCorrect ? basePoints : 0;
}
