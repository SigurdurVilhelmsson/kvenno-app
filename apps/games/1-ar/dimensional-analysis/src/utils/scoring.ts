/**
 * Scoring and mastery utility functions for dimensional analysis game
 */

/**
 * Count significant figures in a number string
 */
export function countSignificantFigures(numStr: string): number {
  numStr = numStr.trim();

  // Handle scientific notation (e.g., "1.08e12")
  if (numStr.toLowerCase().includes('e')) {
    const [base] = numStr.toLowerCase().split('e');
    numStr = base;
  }

  // Remove negative sign
  const cleaned = numStr.replace(/^-/, '');
  const hasDecimal = cleaned.includes('.');

  if (!hasDecimal) {
    // No decimal: count from first non-zero, trailing zeros might not count
    const trimmed = cleaned.replace(/^0+/, '') || '0';
    if (trimmed === '0') return 1;
    const withoutTrailingZeros = trimmed.replace(/0+$/, '');
    return trimmed === withoutTrailingZeros ? trimmed.length : withoutTrailingZeros.length;
  } else {
    // Has decimal: leading zeros (both whole and decimal) are not significant
    const [whole, decimal] = cleaned.split('.');
    const wholeTrimmed = whole.replace(/^0+/, '') || '0';
    if (wholeTrimmed === '0') {
      const decimalSignificant = decimal?.replace(/^0+/, '') || '';
      // "0.0" and "0.00" have at least 1 significant figure
      return decimalSignificant.length || 1;
    }
    return wholeTrimmed.length + (decimal?.length || 0);
  }
}

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
