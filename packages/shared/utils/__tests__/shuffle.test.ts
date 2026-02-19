import { describe, it, expect } from 'vitest';
import { shuffleArray } from '../shuffle';

describe('shuffleArray', () => {
  describe('basic functionality', () => {
    it('should return a new array without mutating the original', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      const shuffled = shuffleArray(original);

      expect(original).toEqual(originalCopy);
      expect(shuffled).not.toBe(original);
    });

    it('should return an array with the same length', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);

      expect(shuffled.length).toBe(original.length);
    });

    it('should contain all original elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);

      expect(shuffled.sort((a, b) => a - b)).toEqual(original.sort((a, b) => a - b));
    });

    it('should handle empty arrays', () => {
      const empty: number[] = [];
      const shuffled = shuffleArray(empty);

      expect(shuffled).toEqual([]);
      expect(shuffled).not.toBe(empty);
    });

    it('should handle single element arrays', () => {
      const single = [42];
      const shuffled = shuffleArray(single);

      expect(shuffled).toEqual([42]);
      expect(shuffled).not.toBe(single);
    });

    it('should handle two element arrays', () => {
      const pair = [1, 2];
      const shuffled = shuffleArray(pair);

      expect(shuffled.sort()).toEqual([1, 2]);
    });
  });

  describe('type preservation', () => {
    it('should work with string arrays', () => {
      const strings = ['a', 'b', 'c', 'd'];
      const shuffled = shuffleArray(strings);

      expect(shuffled.length).toBe(4);
      expect(shuffled.sort()).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should work with object arrays', () => {
      const objects = [
        { id: 'a', text: 'Option A', correct: true },
        { id: 'b', text: 'Option B', correct: false },
        { id: 'c', text: 'Option C', correct: false },
      ];
      const shuffled = shuffleArray(objects);

      expect(shuffled.length).toBe(3);
      expect(shuffled.find(o => o.correct)).toBeDefined();
      expect(shuffled.map(o => o.id).sort()).toEqual(['a', 'b', 'c']);
    });

    it('should preserve object references', () => {
      const obj1 = { value: 1 };
      const obj2 = { value: 2 };
      const original = [obj1, obj2];
      const shuffled = shuffleArray(original);

      expect(shuffled).toContain(obj1);
      expect(shuffled).toContain(obj2);
    });
  });

  describe('randomness', () => {
    it('should produce different orderings over multiple runs', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results = new Set<string>();

      // Run shuffle 50 times and collect unique orderings
      for (let i = 0; i < 50; i++) {
        const shuffled = shuffleArray(original);
        results.add(JSON.stringify(shuffled));
      }

      // With 10 elements, we should get many different orderings
      // Probability of getting same order twice is 1/10! ≈ 0.00000028%
      expect(results.size).toBeGreaterThan(1);
    });

    it('should not always place the first element first', () => {
      const original = ['correct', 'wrong1', 'wrong2', 'wrong3'];
      let firstElementMovedCount = 0;

      // Run 30 times and count how often the first element moves
      for (let i = 0; i < 30; i++) {
        const shuffled = shuffleArray(original);
        if (shuffled[0] !== 'correct') {
          firstElementMovedCount++;
        }
      }

      // First element should move at least sometimes (probability of staying = 1/4)
      // With 30 runs, expect it to move roughly 22-23 times on average
      expect(firstElementMovedCount).toBeGreaterThan(5);
    });

    it('should distribute elements across all positions', () => {
      const original = [0, 1, 2, 3];
      const positionCounts: Record<number, number[]> = {
        0: [0, 0, 0, 0],
        1: [0, 0, 0, 0],
        2: [0, 0, 0, 0],
        3: [0, 0, 0, 0],
      };

      // Run 100 times and track where each element ends up
      for (let i = 0; i < 100; i++) {
        const shuffled = shuffleArray(original);
        shuffled.forEach((value, position) => {
          positionCounts[value][position]++;
        });
      }

      // Each element should appear in each position at least a few times
      // With 100 runs and 4 positions, expect ~25 per position on average
      for (const element of [0, 1, 2, 3]) {
        for (const position of [0, 1, 2, 3]) {
          expect(positionCounts[element][position]).toBeGreaterThan(5);
        }
      }
    });
  });
});
