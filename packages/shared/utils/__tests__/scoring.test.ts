import { describe, it, expect } from 'vitest';

import * as scoring from '../scoring';
import {
  calculateCompositeScore,
  isPassing,
  calculateAverage,
  calculateEfficiencyScore,
  scoreExplanation,
  DEFAULT_SCORING_CONFIG,
} from '../scoring';

describe('calculateCompositeScore', () => {
  it('should calculate composite score with default weights', () => {
    const score = calculateCompositeScore(1.0, 1.0, 1.0, 1.0);
    expect(score).toBeCloseTo(1.0);
  });

  it('should calculate composite score with partial scores', () => {
    // 0.5 * 0.4 + 0.5 * 0.3 + 0.5 * 0.2 + 0.5 * 0.1 = 0.5
    const score = calculateCompositeScore(0.5, 0.5, 0.5, 0.5);
    expect(score).toBeCloseTo(0.5);
  });

  it('should clamp score to [0, 1] range', () => {
    const highScore = calculateCompositeScore(2.0, 2.0, 2.0, 2.0);
    expect(highScore).toBe(1.0);

    const lowScore = calculateCompositeScore(-1, -1, -1, -1);
    expect(lowScore).toBe(0);
  });

  it('should use custom config when provided', () => {
    const customConfig = {
      answerWeight: 1.0,
      methodWeight: 0,
      explanationWeight: 0,
      efficiencyWeight: 0,
      passingThreshold: 0.5,
    };
    const score = calculateCompositeScore(0.8, 0.0, 0.0, 0.0, customConfig);
    expect(score).toBe(0.8);
  });
});

describe('isPassing', () => {
  it('should return true for scores at or above threshold', () => {
    expect(isPassing(0.7)).toBe(true);
    expect(isPassing(0.8)).toBe(true);
    expect(isPassing(1.0)).toBe(true);
  });

  it('should return false for scores below threshold', () => {
    expect(isPassing(0.69)).toBe(false);
    expect(isPassing(0.5)).toBe(false);
    expect(isPassing(0)).toBe(false);
  });

  it('should respect custom threshold', () => {
    const customConfig = { ...DEFAULT_SCORING_CONFIG, passingThreshold: 0.5 };
    expect(isPassing(0.5, customConfig)).toBe(true);
    expect(isPassing(0.49, customConfig)).toBe(false);
  });
});

describe('calculateAverage', () => {
  it('should calculate average of scores', () => {
    expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
    expect(calculateAverage([0.5, 0.5])).toBe(0.5);
  });

  it('should return 0 for empty array', () => {
    expect(calculateAverage([])).toBe(0);
  });

  it('should handle single value', () => {
    expect(calculateAverage([0.75])).toBe(0.75);
  });
});

describe('significant figures', () => {
  it('are not counted here', () => {
    // This module shipped a counter that read only the full stop, so the
    // Icelandic `0,125` came out as four figures. Nothing called it; the
    // counter that reads the comma is dimensional-analysis's utils/sigfigs.ts.
    // A second one here is how a game ends up importing the wrong one.
    expect(Object.keys(scoring)).not.toContain('countSignificantFigures');
    expect(Object.keys(scoring)).not.toContain('validateSignificantFigures');
  });
});

describe('calculateEfficiencyScore', () => {
  it('should return 1.0 for optimal or fewer steps', () => {
    expect(calculateEfficiencyScore(3, 5)).toBe(1.0);
    expect(calculateEfficiencyScore(5, 5)).toBe(1.0);
  });

  it('should penalize extra steps', () => {
    expect(calculateEfficiencyScore(6, 5)).toBe(0.9);
    expect(calculateEfficiencyScore(7, 5)).toBe(0.8);
    expect(calculateEfficiencyScore(10, 5)).toBe(0.5);
  });

  it('should not go below 0', () => {
    expect(calculateEfficiencyScore(20, 5)).toBe(0);
    expect(calculateEfficiencyScore(100, 5)).toBe(0);
  });
});

describe('scoreExplanation', () => {
  const qualityKeywords = ['because', 'therefore', 'shows'];
  const typeKeywords = ['molarity', 'concentration', 'solution'];

  it('should return 0 for too short explanations', () => {
    expect(scoreExplanation('short', qualityKeywords, typeKeywords)).toBe(0);
  });

  it('should score based on keywords', () => {
    const explanation = 'The molarity shows the concentration because of the solution properties';
    const score = scoreExplanation(explanation, qualityKeywords, typeKeywords);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('should give length bonus for longer explanations', () => {
    const shortExplanation = 'This is about molarity and concentration';
    const longExplanation =
      'This explanation discusses molarity and concentration in great detail, explaining how these concepts relate to solution chemistry and the calculation of amounts.';

    const shortScore = scoreExplanation(shortExplanation, qualityKeywords, typeKeywords);
    const longScore = scoreExplanation(longExplanation, qualityKeywords, typeKeywords);

    expect(longScore).toBeGreaterThan(shortScore);
  });

  it('should cap score at 1.0', () => {
    const perfectExplanation =
      'Because therefore shows molarity concentration solution. This is a very long explanation that includes all the quality keywords and type-specific keywords to maximize the score.';
    const score = scoreExplanation(perfectExplanation, qualityKeywords, typeKeywords);
    expect(score).toBeLessThanOrEqual(1);
  });
});
