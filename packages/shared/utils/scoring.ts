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

/*
 * There is deliberately no significant-figure counter here. This file carried
 * one until 2026-09-23, with a validator built on it, and neither had a caller:
 * it read only the full stop, so an Icelandic `0,125` counted the comma as a
 * digit and came out as four figures. The counter that is right lives in
 * `apps/games/1-ar/dimensional-analysis/src/utils/sigfigs.ts`, where Stig 0
 * teaches the rules from it and works on the written string, never a number.
 * Move that one here if a second game needs it; do not write a third.
 */

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
