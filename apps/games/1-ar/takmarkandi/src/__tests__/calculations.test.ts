import { describe, it, expect } from 'vitest';

import type { Reaction } from '../types';
import {
  calculateCorrectAnswer,
  generateReactantCounts,
  calculatePoints,
} from '../utils/calculations';
import { isValidInteger, validateAnswer } from '../utils/validation';

// --- Test data ---

// 2H2 + O2 -> 2H2O (simple 2:1 ratio)
const waterReaction: Reaction = {
  id: 'test-water',
  equation: '2H\u2082 + O\u2082 \u2192 2H\u2082O',
  reactant1: { formula: 'H\u2082', coeff: 2, color: '#3b82f6' },
  reactant2: { formula: 'O\u2082', coeff: 1, color: '#ef4444' },
  products: [{ formula: 'H\u2082O', coeff: 2, color: '#8b5cf6' }],
  difficulty: 'easy',
};

// CH4 + 2O2 -> CO2 + 2H2O (multi-product)
const combustionReaction: Reaction = {
  id: 'test-combustion',
  equation: 'CH\u2084 + 2O\u2082 \u2192 CO\u2082 + 2H\u2082O',
  reactant1: { formula: 'CH\u2084', coeff: 1, color: '#14b8a6' },
  reactant2: { formula: 'O\u2082', coeff: 2, color: '#ef4444' },
  products: [
    { formula: 'CO\u2082', coeff: 1, color: '#6b7280' },
    { formula: 'H\u2082O', coeff: 2, color: '#8b5cf6' },
  ],
  difficulty: 'medium',
};

// --- calculateCorrectAnswer tests ---

describe('calculateCorrectAnswer', () => {
  it('identifies limiting reactant when R1 runs out first', () => {
    // 2H2 + O2 -> 2H2O, with 4 H2 and 5 O2
    // timesFromR1 = 4/2 = 2, timesFromR2 = 5/1 = 5
    // H2 is limiting (2 < 5)
    const result = calculateCorrectAnswer(waterReaction, 4, 5);

    expect(result.limitingReactant).toBe('H\u2082');
    expect(result.excessReactant).toBe('O\u2082');
    expect(result.timesReactionRuns).toBe(2);
    expect(result.productsFormed['H\u2082O']).toBe(4); // 2 * 2
    expect(result.excessRemaining).toBe(3); // 5 - 2*1
    expect(result.r1Used).toBe(4); // 2 * 2
    expect(result.r2Used).toBe(2); // 2 * 1
  });

  it('identifies limiting reactant when R2 runs out first', () => {
    // 2H2 + O2 -> 2H2O, with 10 H2 and 3 O2
    // timesFromR1 = 10/2 = 5, timesFromR2 = 3/1 = 3
    // O2 is limiting
    const result = calculateCorrectAnswer(waterReaction, 10, 3);

    expect(result.limitingReactant).toBe('O\u2082');
    expect(result.excessReactant).toBe('H\u2082');
    expect(result.timesReactionRuns).toBe(3);
    expect(result.productsFormed['H\u2082O']).toBe(6);
    expect(result.excessRemaining).toBe(4); // 10 - 3*2
  });

  it('handles multi-product reactions correctly', () => {
    // CH4 + 2O2 -> CO2 + 2H2O, with 3 CH4 and 4 O2
    // timesFromR1 = 3/1 = 3, timesFromR2 = 4/2 = 2
    // O2 is limiting
    const result = calculateCorrectAnswer(combustionReaction, 3, 4);

    expect(result.limitingReactant).toBe('O\u2082');
    expect(result.timesReactionRuns).toBe(2);
    expect(result.productsFormed['CO\u2082']).toBe(2); // 2 * 1
    expect(result.productsFormed['H\u2082O']).toBe(4); // 2 * 2
    expect(result.excessRemaining).toBe(1); // 3 - 2*1
  });

  it('handles exact stoichiometric amounts (both are limiting)', () => {
    // 2H2 + O2 -> 2H2O, with 6 H2 and 3 O2
    // timesFromR1 = 6/2 = 3, timesFromR2 = 3/1 = 3
    // Equal - R2 is chosen as non-limiting by < comparison
    const result = calculateCorrectAnswer(waterReaction, 6, 3);

    expect(result.timesReactionRuns).toBe(3);
    expect(result.excessRemaining).toBe(0);
    expect(result.productsFormed['H\u2082O']).toBe(6);
  });
});

// --- generateReactantCounts tests ---

describe('generateReactantCounts', () => {
  it('generates easy counts in range 3-8', () => {
    for (let i = 0; i < 20; i++) {
      const { r1Count, r2Count } = generateReactantCounts('easy');
      expect(r1Count).toBeGreaterThanOrEqual(3);
      expect(r1Count).toBeLessThanOrEqual(8);
      expect(r2Count).toBeGreaterThanOrEqual(3);
      expect(r2Count).toBeLessThanOrEqual(8);
    }
  });

  it('generates medium counts in range 5-14', () => {
    for (let i = 0; i < 20; i++) {
      const { r1Count, r2Count } = generateReactantCounts('medium');
      expect(r1Count).toBeGreaterThanOrEqual(5);
      expect(r1Count).toBeLessThanOrEqual(14);
      expect(r2Count).toBeGreaterThanOrEqual(5);
      expect(r2Count).toBeLessThanOrEqual(14);
    }
  });

  it('generates hard counts in range 10-24', () => {
    for (let i = 0; i < 20; i++) {
      const { r1Count, r2Count } = generateReactantCounts('hard');
      expect(r1Count).toBeGreaterThanOrEqual(10);
      expect(r1Count).toBeLessThanOrEqual(24);
      expect(r2Count).toBeGreaterThanOrEqual(10);
      expect(r2Count).toBeLessThanOrEqual(24);
    }
  });
});

// --- calculatePoints tests ---

describe('calculatePoints', () => {
  it('gives base points by difficulty', () => {
    expect(calculatePoints('easy', 1, 0, false)).toBe(10);
    expect(calculatePoints('medium', 1, 0, false)).toBe(15);
    expect(calculatePoints('hard', 1, 0, false)).toBe(20);
  });

  it('adds speed bonus when timer mode is active and time > 90', () => {
    const points = calculatePoints('easy', 1, 95, true);
    expect(points).toBe(20); // 10 base + 10 speed bonus
  });

  it('adds smaller speed bonus for time between 60-90', () => {
    const points = calculatePoints('easy', 1, 75, true);
    expect(points).toBe(15); // 10 base + 5 speed bonus
  });

  it('no speed bonus when timer mode is inactive', () => {
    const points = calculatePoints('easy', 1, 95, false);
    expect(points).toBe(10); // no timer bonus
  });

  it('adds streak bonus at multiples of 10', () => {
    const points = calculatePoints('easy', 10, 0, false);
    expect(points).toBe(25); // 10 base + 15 streak
  });

  it('adds streak bonus at multiples of 5', () => {
    const points = calculatePoints('easy', 5, 0, false);
    expect(points).toBe(20); // 10 base + 10 streak
  });

  it('adds streak bonus at multiples of 3', () => {
    const points = calculatePoints('easy', 3, 0, false);
    expect(points).toBe(15); // 10 base + 5 streak
  });
});

// --- isValidInteger tests ---

describe('isValidInteger', () => {
  it('returns true for valid non-negative integers', () => {
    expect(isValidInteger('0')).toBe(true);
    expect(isValidInteger('5')).toBe(true);
    expect(isValidInteger('42')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isValidInteger('')).toBe(false);
  });

  it('returns false for negative numbers', () => {
    expect(isValidInteger('-1')).toBe(false);
  });

  it('returns false for decimal numbers', () => {
    expect(isValidInteger('3.5')).toBe(false);
  });

  it('returns false for non-numeric strings', () => {
    expect(isValidInteger('abc')).toBe(false);
  });
});

// --- validateAnswer tests ---

describe('validateAnswer', () => {
  it('returns all correct when answer matches', () => {
    const result = validateAnswer(
      {
        limitingReactant: 'H\u2082',
        productsFormed: { 'H\u2082O': '4' },
        excessRemaining: '3',
      },
      {
        limitingReactant: 'H\u2082',
        productsFormed: { 'H\u2082O': 4 },
        excessRemaining: 3,
      },
      [{ formula: 'H\u2082O' }]
    );

    expect(result.allCorrect).toBe(true);
    expect(result.isLimitingCorrect).toBe(true);
    expect(result.isProductsCorrect).toBe(true);
    expect(result.isExcessCorrect).toBe(true);
  });

  it('detects wrong limiting reactant', () => {
    const result = validateAnswer(
      {
        limitingReactant: 'O\u2082',
        productsFormed: { 'H\u2082O': '4' },
        excessRemaining: '3',
      },
      {
        limitingReactant: 'H\u2082',
        productsFormed: { 'H\u2082O': 4 },
        excessRemaining: 3,
      },
      [{ formula: 'H\u2082O' }]
    );

    expect(result.allCorrect).toBe(false);
    expect(result.isLimitingCorrect).toBe(false);
  });

  it('detects wrong product amounts', () => {
    const result = validateAnswer(
      {
        limitingReactant: 'H\u2082',
        productsFormed: { 'H\u2082O': '5' },
        excessRemaining: '3',
      },
      {
        limitingReactant: 'H\u2082',
        productsFormed: { 'H\u2082O': 4 },
        excessRemaining: 3,
      },
      [{ formula: 'H\u2082O' }]
    );

    expect(result.allCorrect).toBe(false);
    expect(result.isProductsCorrect).toBe(false);
  });

  it('detects wrong excess remaining', () => {
    const result = validateAnswer(
      {
        limitingReactant: 'H\u2082',
        productsFormed: { 'H\u2082O': '4' },
        excessRemaining: '2',
      },
      {
        limitingReactant: 'H\u2082',
        productsFormed: { 'H\u2082O': 4 },
        excessRemaining: 3,
      },
      [{ formula: 'H\u2082O' }]
    );

    expect(result.allCorrect).toBe(false);
    expect(result.isExcessCorrect).toBe(false);
  });
});
