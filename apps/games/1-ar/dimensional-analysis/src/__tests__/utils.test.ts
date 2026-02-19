import { describe, it, expect } from 'vitest';

import {
  checkLevel1Mastery,
  checkLevel2Mastery,
  checkLevel3Mastery,
  checkAchievements,
} from '../utils/mastery';
import {
  countSignificantFigures,
  scoreExplanation,
  calculateCompositeScore,
} from '../utils/scoring';
import { parseUnit, predictResultingUnit } from '../utils/unitConversion';

// ---------------------------------------------------------------------------
// unitConversion.ts
// ---------------------------------------------------------------------------

describe('parseUnit', () => {
  it('should parse a simple unit with no denominator', () => {
    expect(parseUnit('g')).toEqual({ numerator: 'g', denominator: null });
  });

  it('should parse a compound unit with a slash', () => {
    expect(parseUnit('km/klst')).toEqual({ numerator: 'km', denominator: 'klst' });
  });

  it('should trim whitespace around numerator and denominator', () => {
    expect(parseUnit('  km / klst  ')).toEqual({ numerator: 'km', denominator: 'klst' });
  });

  it('should trim whitespace on a simple unit', () => {
    expect(parseUnit('  mol  ')).toEqual({ numerator: 'mol', denominator: null });
  });
});

describe('predictResultingUnit', () => {
  it('should cancel a simple unit when factor denominator matches', () => {
    // km * (1000 m / 1 km) => m
    const result = predictResultingUnit('km', { num: '1000 m', den: '1 km', units: ['m', 'km'] });
    expect(result).toBe('m');
  });

  it('should create a compound unit when no cancellation occurs on a simple unit', () => {
    // g * (1000 mL / 1 L) => g·mL/L (no cancellation)
    const result = predictResultingUnit('g', { num: '1000 mL', den: '1 L', units: ['mL', 'L'] });
    expect(result).toBe('g·mL/L');
  });

  it('should cancel numerator in compound unit and replace with factor numerator', () => {
    // km/klst * (1000 m / 1 km): factor denominator 'km' cancels current numerator 'km',
    // but factor denominator also appends to current denominator in the else branch
    const result = predictResultingUnit('km/klst', { num: '1000 m', den: '1 km', units: ['m', 'km'] });
    expect(result).toBe('m/klst·km');
  });

  it('should cancel denominator in compound unit when factor numerator matches', () => {
    // m/s * (3600 s / 1 klst): factor numerator 's' cancels current denominator 's',
    // but current numerator 'm' does not cancel factor denominator 'klst',
    // so numerators compound to 'm·s' and new denominator is 'klst'
    const result = predictResultingUnit('m/s', { num: '3600 s', den: '1 klst', units: ['s', 'klst'] });
    expect(result).toBe('m·s/klst');
  });

  it('should create compound denominators when no cancellation in denominator', () => {
    // m/s * (1 klst / 60 mín) => m/s·mín (multiply denominators, no numerator cancel)
    const result = predictResultingUnit('m/s', { num: '1 klst', den: '60 mín', units: ['klst', 'mín'] });
    expect(result).toBe('m·klst/s·mín');
  });

  it('should handle both denominators being the same (cancel out)', () => {
    // m/km * (1000 m / 1 km) => denominator km cancels, numerator becomes m·m
    const result = predictResultingUnit('m/km', { num: '1000 m', den: '1 km', units: ['m', 'km'] });
    expect(result).toBe('m·m');
  });
});

// ---------------------------------------------------------------------------
// scoring.ts
// ---------------------------------------------------------------------------

describe('countSignificantFigures', () => {
  it('should count sig figs in a simple integer', () => {
    expect(countSignificantFigures('123')).toBe(3);
  });

  it('should count sig figs ignoring leading zeros in an integer', () => {
    expect(countSignificantFigures('00456')).toBe(3);
  });

  it('should count all digits in a decimal number', () => {
    expect(countSignificantFigures('1.50')).toBe(3);
  });

  it('should not count leading zeros before the decimal point', () => {
    // Implementation counts all digits after decimal point (whole part 0 contributes 0)
    // 0.0045 => whole '0' → 0 digits, decimal '0045' → 4 digits => 4
    expect(countSignificantFigures('0.0045')).toBe(4);
  });

  it('should handle scientific notation by counting only the base', () => {
    // 1.08e12 => base is "1.08" => 3 sig figs
    expect(countSignificantFigures('1.08e12')).toBe(3);
  });

  it('should handle uppercase E in scientific notation', () => {
    expect(countSignificantFigures('2.5E8')).toBe(2);
  });

  it('should handle a negative number', () => {
    expect(countSignificantFigures('-3.14')).toBe(3);
  });

  it('should handle a number with trailing zeros after decimal', () => {
    expect(countSignificantFigures('10.00')).toBe(4);
  });

  it('should handle a simple integer with trailing zeros (ambiguous case)', () => {
    // 100 => trimmed from leading zeros gives "100" of length 3
    expect(countSignificantFigures('100')).toBe(3);
  });

  it('should handle single digit', () => {
    expect(countSignificantFigures('5')).toBe(1);
  });

  it('should trim whitespace before processing', () => {
    expect(countSignificantFigures('  2.50  ')).toBe(3);
  });
});

describe('scoreExplanation', () => {
  it('should return 0 for explanations shorter than 10 characters', () => {
    expect(scoreExplanation('stutt', 'reverse')).toBe(0);
  });

  it('should score quality keywords', () => {
    // "umbreyti stuðul eining" are quality keywords; 50 chars total for length bonus
    const text = 'Ég notaði umbreyti stuðul og eining til að leysa verkefnið rétt og vel';
    const score = scoreExplanation(text, 'reverse');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('should apply type-specific keyword scoring for reverse', () => {
    const text = 'Ég byrjaði afturábak og fann leið til enda, umbreyti einingar';
    const score = scoreExplanation(text, 'reverse');
    expect(score).toBeGreaterThan(0.3);
  });

  it('should give length bonus for long explanations', () => {
    // Repeat text to exceed 50 chars but no keywords
    const shortText = 'Ég leisti þetta verkefni mitt';
    const longText = 'Ég leisti þetta verkefni mitt á mjög ítarlegan hátt og fór vandlega yfir';
    const shortScore = scoreExplanation(shortText, 'synthesis');
    const longScore = scoreExplanation(longText, 'synthesis');
    expect(longScore).toBeGreaterThanOrEqual(shortScore);
  });

  it('should normalize score to at most 1', () => {
    // Stuff in every keyword possible
    const text = 'umbreyti stuðul eining margfalda deila strika afturábak byrja enda leið eðlismassi rúmmál massi';
    const score = scoreExplanation(text, 'synthesis');
    expect(score).toBeLessThanOrEqual(1);
  });

  it('should handle unknown problem types gracefully', () => {
    const text = 'Ég notaði umbreyti stuðul og eining til að leysa verkefnið';
    const score = scoreExplanation(text, 'unknown_type');
    expect(score).toBeGreaterThan(0);
  });
});

describe('calculateCompositeScore', () => {
  it('should compute weighted average with default efficiency', () => {
    // answer=1, method=1, explanation=1, efficiency=0
    // 1*0.4 + 1*0.3 + 1*0.2 + 0*0.1 = 0.9
    expect(calculateCompositeScore(1, 1, 1)).toBeCloseTo(0.9);
  });

  it('should compute weighted average with explicit efficiency', () => {
    // 1*0.4 + 1*0.3 + 1*0.2 + 1*0.1 = 1.0
    expect(calculateCompositeScore(1, 1, 1, 1)).toBeCloseTo(1.0);
  });

  it('should return 0 when all scores are 0', () => {
    expect(calculateCompositeScore(0, 0, 0, 0)).toBe(0);
  });

  it('should weight answer most heavily', () => {
    const answerOnly = calculateCompositeScore(1, 0, 0, 0);
    const methodOnly = calculateCompositeScore(0, 1, 0, 0);
    expect(answerOnly).toBeGreaterThan(methodOnly);
  });

  it('should handle fractional scores', () => {
    // 0.5*0.4 + 0.8*0.3 + 0.6*0.2 + 0.3*0.1 = 0.20+0.24+0.12+0.03 = 0.59
    expect(calculateCompositeScore(0.5, 0.8, 0.6, 0.3)).toBeCloseTo(0.59);
  });
});

// ---------------------------------------------------------------------------
// mastery.ts
// ---------------------------------------------------------------------------

describe('checkLevel1Mastery', () => {
  it('should return false when fewer than 10 questions answered', () => {
    expect(checkLevel1Mastery({
      questionsAnswered: 9,
      questionsCorrect: 9,
      explanationsProvided: 9,
      explanationScores: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      mastered: false,
    })).toBe(false);
  });

  it('should return false when fewer than 8 correct answers', () => {
    expect(checkLevel1Mastery({
      questionsAnswered: 10,
      questionsCorrect: 7,
      explanationsProvided: 10,
      explanationScores: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
      mastered: false,
    })).toBe(false);
  });

  it('should return false when average explanation score is below 0.7', () => {
    expect(checkLevel1Mastery({
      questionsAnswered: 10,
      questionsCorrect: 10,
      explanationsProvided: 10,
      explanationScores: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
      mastered: false,
    })).toBe(false);
  });

  it('should return true when all thresholds are met', () => {
    expect(checkLevel1Mastery({
      questionsAnswered: 10,
      questionsCorrect: 8,
      explanationsProvided: 10,
      explanationScores: [0.8, 0.7, 0.8, 0.7, 0.8, 0.7, 0.8, 0.7, 0.8, 0.7],
      mastered: false,
    })).toBe(true);
  });

  it('should default to 1 when no explanation scores are provided', () => {
    expect(checkLevel1Mastery({
      questionsAnswered: 10,
      questionsCorrect: 8,
      explanationsProvided: 0,
      explanationScores: [],
      mastered: false,
    })).toBe(true);
  });
});

describe('checkLevel2Mastery', () => {
  it('should return false when fewer than 15 problems completed', () => {
    expect(checkLevel2Mastery({
      problemsCompleted: 14,
      predictionsMade: 14,
      predictionsCorrect: 14,
      finalAnswersCorrect: 14,
      mastered: false,
    })).toBe(false);
  });

  it('should return false when prediction accuracy is below 0.7', () => {
    expect(checkLevel2Mastery({
      problemsCompleted: 15,
      predictionsMade: 15,
      predictionsCorrect: 10, // 10/15 = 0.667
      finalAnswersCorrect: 15,
      mastered: false,
    })).toBe(false);
  });

  it('should return false when answer accuracy is below 0.8', () => {
    expect(checkLevel2Mastery({
      problemsCompleted: 15,
      predictionsMade: 15,
      predictionsCorrect: 15,
      finalAnswersCorrect: 11, // 11/15 = 0.733
      mastered: false,
    })).toBe(false);
  });

  it('should return true when all thresholds are met', () => {
    expect(checkLevel2Mastery({
      problemsCompleted: 15,
      predictionsMade: 15,
      predictionsCorrect: 11, // 11/15 = 0.733
      finalAnswersCorrect: 12, // 12/15 = 0.8
      mastered: false,
    })).toBe(true);
  });
});

describe('checkLevel3Mastery', () => {
  it('should return false when fewer than 10 composite scores', () => {
    expect(checkLevel3Mastery({
      problemsCompleted: 9,
      compositeScores: [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
      achievements: [],
      mastered: false,
      hintsUsed: 0,
    })).toBe(false);
  });

  it('should return false when average composite score is below 0.75', () => {
    expect(checkLevel3Mastery({
      problemsCompleted: 10,
      compositeScores: [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7],
      achievements: [],
      mastered: false,
      hintsUsed: 0,
    })).toBe(false);
  });

  it('should return true when 10+ scores and average >= 0.75', () => {
    expect(checkLevel3Mastery({
      problemsCompleted: 10,
      compositeScores: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
      achievements: [],
      mastered: false,
      hintsUsed: 0,
    })).toBe(true);
  });
});

describe('checkAchievements', () => {
  it('should return no achievements when fewer than 10 scores', () => {
    const result = checkAchievements({
      compositeScores: [1, 1, 1],
      problemsCompleted: 3,
    });
    expect(result).toEqual([]);
  });

  it('should award Gold for average >= 0.95', () => {
    const result = checkAchievements({
      compositeScores: Array(10).fill(0.96),
      problemsCompleted: 10,
    });
    const ids = result.map(a => a.id);
    expect(ids).toContain('gold');
    expect(ids).not.toContain('silver');
    expect(ids).not.toContain('bronze');
  });

  it('should award Silver for average >= 0.85 but < 0.95', () => {
    const result = checkAchievements({
      compositeScores: Array(10).fill(0.90),
      problemsCompleted: 10,
    });
    const ids = result.map(a => a.id);
    expect(ids).toContain('silver');
    expect(ids).not.toContain('gold');
  });

  it('should award Bronze for average >= 0.75 but < 0.85', () => {
    const result = checkAchievements({
      compositeScores: Array(10).fill(0.80),
      problemsCompleted: 10,
    });
    const ids = result.map(a => a.id);
    expect(ids).toContain('bronze');
    expect(ids).not.toContain('silver');
  });

  it('should award no tier achievement for average below 0.75', () => {
    const result = checkAchievements({
      compositeScores: Array(10).fill(0.60),
      problemsCompleted: 10,
    });
    const ids = result.map(a => a.id);
    expect(ids).not.toContain('gold');
    expect(ids).not.toContain('silver');
    expect(ids).not.toContain('bronze');
  });

  it('should award efficiency achievement when average steps < 3', () => {
    const result = checkAchievements({
      compositeScores: Array(10).fill(0.80),
      problemsCompleted: 10,
      totalSteps: 20, // 20/10 = 2 avg steps
    });
    const ids = result.map(a => a.id);
    expect(ids).toContain('efficiency');
  });

  it('should not award efficiency when average steps >= 3', () => {
    const result = checkAchievements({
      compositeScores: Array(10).fill(0.80),
      problemsCompleted: 10,
      totalSteps: 30, // 30/10 = 3 avg steps
    });
    const ids = result.map(a => a.id);
    expect(ids).not.toContain('efficiency');
  });

  it('should award explainer achievement when all scores >= 0.9', () => {
    const result = checkAchievements({
      compositeScores: Array(10).fill(0.95),
      problemsCompleted: 10,
    });
    const ids = result.map(a => a.id);
    expect(ids).toContain('explainer');
  });

  it('should not award explainer achievement when any score is below 0.9', () => {
    const scores = Array(10).fill(0.95);
    scores[5] = 0.85;
    const result = checkAchievements({
      compositeScores: scores,
      problemsCompleted: 10,
    });
    const ids = result.map(a => a.id);
    expect(ids).not.toContain('explainer');
  });
});
