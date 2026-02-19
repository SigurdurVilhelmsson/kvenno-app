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
    const trimmed = cleaned.replace(/^0+/, '');
    return trimmed.length;
  } else {
    // Has decimal: all digits count except leading zeros
    const [whole, decimal] = cleaned.split('.');
    const wholeTrimmed = whole.replace(/^0+/, '') || '0';
    const sigFigs = (wholeTrimmed === '0' ? 0 : wholeTrimmed.length) + (decimal?.length || 0);
    return sigFigs;
  }
}

/**
 * Score an explanation text based on keyword presence and length
 */
export function scoreExplanation(explanationText: string, problemType: string): number {
  const text = explanationText.toLowerCase().trim();

  if (text.length < 10) return 0; // Too short

  let score = 0;
  let maxScore = 0;

  // Common quality indicators (apply to all types)
  const qualityKeywords = ['umbreyti', 'stuðul', 'eining', 'margfalda', 'deila', 'strika'];
  const qualityCount = qualityKeywords.filter(kw => text.includes(kw)).length;
  score += Math.min(qualityCount * 0.15, 0.3); // Up to 30% for vocabulary
  maxScore += 0.3;

  // Type-specific keywords
  const typeKeywords: Record<string, string[]> = {
    reverse: ['afturábak', 'byrja', 'enda', 'leið'],
    error_analysis: ['rang', 'öfug', 'villa', 'snúinn', 'nefnara'],
    efficiency: ['fæst', 'skref', 'skilvirkn', 'bein'],
    synthesis: ['eðlismassi', 'rúmmál', 'massi', 'margfalda'],
    real_world: ['skammta', 'deila', 'fjöldi', 'heiltala'],
    derivation: ['vísindatölustaf', 'umbreyti', 'hraði']
  };

  const keywords = typeKeywords[problemType] || [];
  if (keywords.length > 0) {
    const found = keywords.filter(kw => text.includes(kw)).length;
    score += (found / keywords.length) * 0.4;
    maxScore += 0.4;
  }

  // Length bonus (up to 30%)
  if (text.length >= 50) {
    score += 0.3;
  } else if (text.length >= 30) {
    score += 0.2;
  } else if (text.length >= 20) {
    score += 0.1;
  }
  maxScore += 0.3;

  return Math.min(score / maxScore, 1); // Normalize to 0-1
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
  return (answerScore * 0.4) + (methodScore * 0.3) + (explanationScore * 0.2) + (efficiencyScore * 0.1);
}
