import { ScoringConfig } from '@shared/types';

/**
 * Default scoring configuration for composite scores
 */
export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  answerWeight: 0.4,
  methodWeight: 0.3,
  explanationWeight: 0.2,
  efficiencyWeight: 0.1,
  passingThreshold: 0.7,
};

/**
 * Calculate composite score from individual components
 */
export const calculateCompositeScore = (
  answerScore: number,
  methodScore: number,
  explanationScore: number,
  efficiencyScore: number,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG
): number => {
  const composite =
    answerScore * config.answerWeight +
    methodScore * config.methodWeight +
    explanationScore * config.explanationWeight +
    efficiencyScore * config.efficiencyWeight;

  return Math.max(0, Math.min(1, composite));
};

/**
 * Check if a score meets the passing threshold
 */
export const isPassing = (
  score: number,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG
): boolean => {
  return score >= config.passingThreshold;
};

/**
 * Calculate average from array of scores
 */
export const calculateAverage = (scores: number[]): number => {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return sum / scores.length;
};

/**
 * Count significant figures in a numeric string
 */
export const countSignificantFigures = (numStr: string): number => {
  numStr = numStr.trim();

  // Handle scientific notation
  if (numStr.toLowerCase().includes('e')) {
    const [base] = numStr.toLowerCase().split('e');
    numStr = base;
  }

  const hasDecimal = numStr.includes('.');
  const cleaned = numStr.replace(/^-/, ''); // Remove negative sign

  if (!hasDecimal) {
    // No decimal point - trailing zeros may not be significant
    const trimmed = cleaned.replace(/^0+/, ''); // Remove leading zeros
    const withoutTrailingZeros = trimmed.replace(/0+$/, '');

    // If number ends in zeros, we assume they're not significant unless specified
    return trimmed === withoutTrailingZeros ? trimmed.length : trimmed.length;
  } else {
    // Has decimal point - all digits count except leading zeros
    const [whole, decimal] = cleaned.split('.');
    const wholeTrimmed = whole.replace(/^0+/, '') || '0';
    const sigFigs = (wholeTrimmed === '0' ? 0 : wholeTrimmed.length) + (decimal?.length || 0);
    return sigFigs;
  }
};

/**
 * Validate significant figures match expected count
 */
export const validateSignificantFigures = (
  answer: string,
  expected: number,
  tolerance: number = 0
): boolean => {
  const actual = countSignificantFigures(answer);
  return Math.abs(actual - expected) <= tolerance;
};

/**
 * Calculate efficiency score based on steps taken vs optimal
 */
export const calculateEfficiencyScore = (stepsTaken: number, optimalSteps: number): number => {
  if (stepsTaken <= optimalSteps) {
    return 1.0;
  }

  const extraSteps = stepsTaken - optimalSteps;
  const penalty = extraSteps * 0.1; // 10% penalty per extra step
  return Math.max(0, 1 - penalty);
};

/**
 * Score text explanation based on keywords and quality
 */
export const scoreExplanation = (
  explanationText: string,
  qualityKeywords: string[],
  typeSpecificKeywords: string[],
  minLength: number = 10
): number => {
  const text = explanationText.toLowerCase().trim();

  if (text.length < minLength) {
    return 0;
  }

  let score = 0;

  // Quality keywords (30%)
  const qualityCount = qualityKeywords.filter((kw) => text.includes(kw.toLowerCase())).length;
  score += Math.min(qualityCount * 0.15, 0.3);

  // Type-specific keywords (40%)
  const typeCount = typeSpecificKeywords.filter((kw) => text.includes(kw.toLowerCase())).length;
  score += (typeCount / Math.max(typeSpecificKeywords.length, 1)) * 0.4;

  // Length bonus (30%)
  if (text.length >= 50) {
    score += 0.3;
  } else if (text.length >= 30) {
    score += 0.2;
  } else if (text.length >= 20) {
    score += 0.1;
  }

  return Math.min(score, 1);
};
