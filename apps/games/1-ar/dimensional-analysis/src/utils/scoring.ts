/**
 * Scoring and mastery utility functions for dimensional analysis game
 */

/**
 * Count significant figures in a number string.
 *
 * **One counter, not two.** This used to be a second implementation that knew
 * only the full stop, so the Icelandic decimal comma counted as a digit —
 * `0,125` was four figures — and Level 3 marked a correct three-figure answer
 * down for its precision while Stig 0 taught the rule correctly. It is now the
 * engine Stig 0 teaches from, under its old name; `utils/sigfigs.ts` is where
 * the rules live. It throws on input that is not a written number.
 */
export { countSigFigs as countSignificantFigures } from './sigfigs';

/**
 * Score an explanation text — gives full credit for genuine effort.
 *
 * We can't meaningfully grade free-text Icelandic explanations with keyword
 * matching. Instead: any substantive attempt (20+ chars, at least 3 words)
 * gets full credit. This encourages reflection without false precision.
 */
export function scoreExplanation(explanationText: string, _problemType: string): number {
  const text = explanationText.trim();
  if (text.length < 10) return 0;

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 3) return 0.3; // Minimal attempt
  if (text.length < 20) return 0.5; // Brief but present
  return 1.0; // Genuine effort — full credit
}

/**
 * Calculate composite score from individual components
 * Weighted: answer 40%, method 30%, explanation 20%, efficiency 10%
 */
export function calculateCompositeScore(
  answerScore: number,
  methodScore: number,
  explanationScore: number,
  efficiencyScore: number = 0
): number {
  return answerScore * 0.4 + methodScore * 0.3 + explanationScore * 0.2 + efficiencyScore * 0.1;
}
