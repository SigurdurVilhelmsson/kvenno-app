import { describe, it, expect } from 'vitest';

import {
  COMPOUNDS,
  getCompoundsByDifficulty,
  getRandomCompounds,
  type Difficulty,
  type CompoundType,
  type Category,
} from '../data/compounds';

const VALID_CATEGORIES: Category[] = [
  'jónefni',
  'sameind',
  'sameindaefni',
  'málmar-breytilega-hleðsla',
];
const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const VALID_TYPES: CompoundType[] = ['ionic', 'molecular'];

describe('COMPOUNDS data integrity', () => {
  it('all compounds have required fields', () => {
    for (const compound of COMPOUNDS) {
      expect(compound).toHaveProperty('formula');
      expect(compound).toHaveProperty('name');
      expect(compound).toHaveProperty('type');
      expect(compound).toHaveProperty('category');
      expect(compound).toHaveProperty('difficulty');
      expect(compound).toHaveProperty('elements');
      expect(compound).toHaveProperty('info');

      expect(typeof compound.formula).toBe('string');
      expect(typeof compound.name).toBe('string');
      expect(typeof compound.type).toBe('string');
      expect(typeof compound.category).toBe('string');
      expect(typeof compound.difficulty).toBe('string');
      expect(Array.isArray(compound.elements)).toBe(true);
      expect(typeof compound.info).toBe('string');

      expect(compound.formula.length).toBeGreaterThan(0);
      expect(compound.name.length).toBeGreaterThan(0);
      expect(compound.info.length).toBeGreaterThan(0);
    }
  });

  it('contains no duplicate formulas', () => {
    const formulas = COMPOUNDS.map((c) => c.formula);
    const uniqueFormulas = new Set(formulas);
    expect(uniqueFormulas.size).toBe(formulas.length);
  });

  it('all category values are valid', () => {
    for (const compound of COMPOUNDS) {
      expect(VALID_CATEGORIES).toContain(compound.category);
    }
  });

  it('all difficulty values are valid', () => {
    for (const compound of COMPOUNDS) {
      expect(VALID_DIFFICULTIES).toContain(compound.difficulty);
    }
  });

  it('all type values are valid', () => {
    for (const compound of COMPOUNDS) {
      expect(VALID_TYPES).toContain(compound.type);
    }
  });

  it('elements array is non-empty for all compounds', () => {
    for (const compound of COMPOUNDS) {
      expect(compound.elements.length).toBeGreaterThan(0);
      for (const element of compound.elements) {
        expect(typeof element).toBe('string');
        expect(element.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('getCompoundsByDifficulty', () => {
  it('returns correct subsets for each difficulty level', () => {
    for (const difficulty of VALID_DIFFICULTIES) {
      const subset = getCompoundsByDifficulty(difficulty);
      expect(subset.length).toBeGreaterThan(0);
      for (const compound of subset) {
        expect(compound.difficulty).toBe(difficulty);
      }
    }
  });

  it('returns all compounds when subsets are combined', () => {
    const easy = getCompoundsByDifficulty('easy');
    const medium = getCompoundsByDifficulty('medium');
    const hard = getCompoundsByDifficulty('hard');
    expect(easy.length + medium.length + hard.length).toBe(COMPOUNDS.length);
  });
});

describe('getRandomCompounds', () => {
  it('returns the requested count of compounds', () => {
    const count = 5;
    const result = getRandomCompounds(count);
    expect(result).toHaveLength(count);
  });

  it('returns fewer compounds when count exceeds pool size', () => {
    const count = COMPOUNDS.length + 100;
    const result = getRandomCompounds(count);
    expect(result).toHaveLength(COMPOUNDS.length);
  });

  it('filters by difficulty when specified', () => {
    const result = getRandomCompounds(3, 'hard');
    expect(result).toHaveLength(3);
    for (const compound of result) {
      expect(compound.difficulty).toBe('hard');
    }
  });
});

describe('shuffle (via getRandomCompounds)', () => {
  it('does not lose elements when shuffling', () => {
    const all = getRandomCompounds(COMPOUNDS.length);
    expect(all).toHaveLength(COMPOUNDS.length);

    const returnedFormulas = new Set(all.map((c) => c.formula));
    const originalFormulas = new Set(COMPOUNDS.map((c) => c.formula));
    expect(returnedFormulas).toEqual(originalFormulas);
  });
});
