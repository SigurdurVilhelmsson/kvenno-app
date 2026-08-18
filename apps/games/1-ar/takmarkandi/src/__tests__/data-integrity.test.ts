import { describe, it, expect } from 'vitest';

import { REACTIONS } from '../data/reactions';
import { calculateCorrectAnswer, generateReactantCounts } from '../utils/calculations';

// Level 2 draws easy|medium single-product reactions (Level2.tsx:28); Level 3 draws
// medium|hard (Level3.tsx:26). Both then call generateReactantCounts(reaction.difficulty).
const LEVEL_2 = REACTIONS.filter(
  (r) => (r.difficulty === 'easy' || r.difficulty === 'medium') && r.products.length === 1
);
const LEVEL_3 = REACTIONS.filter((r) => r.difficulty === 'medium' || r.difficulty === 'hard');

const RUNS = 300;

describe('generated reactant counts', () => {
  it.each([
    ['level 2', LEVEL_2],
    ['level 3', LEVEL_3],
  ])('%s: the method the game prints gives a whole number', (_label, pool) => {
    // Level2.tsx:157 tells the student to compute min(A / c1, B / c2), and :233 says the
    // lower number IS how many times the reaction runs. If that quotient is fractional the
    // student's own answer disagrees with the key, which used to happen on ~44% of level 2
    // and ~70% of level 3 problems.
    const fractional: string[] = [];
    for (const reaction of pool) {
      for (let i = 0; i < RUNS; i++) {
        const { r1Count, r2Count } = generateReactantCounts(reaction.difficulty, reaction);
        const times = Math.min(
          r1Count / reaction.reactant1.coeff,
          r2Count / reaction.reactant2.coeff
        );
        if (!Number.isInteger(times))
          fractional.push(`${reaction.reactant1.formula}: ${r1Count}/${r2Count}`);
      }
    }
    expect(fractional.slice(0, 5)).toEqual([]);
  });

  it.each([
    ['level 2', LEVEL_2],
    ['level 3', LEVEL_3],
  ])('%s: the limiting reactant is fully consumed', (_label, pool) => {
    // A limiting reactant with leftover contradicts the definition the game teaches.
    const leftover: string[] = [];
    for (const reaction of pool) {
      for (let i = 0; i < RUNS; i++) {
        const { r1Count, r2Count } = generateReactantCounts(reaction.difficulty, reaction);
        const answer = calculateCorrectAnswer(reaction, r1Count, r2Count);
        const limitingIsR1 = answer.limitingReactant === reaction.reactant1.formula;
        const remaining = limitingIsR1 ? r1Count - answer.r1Used : r2Count - answer.r2Used;
        if (remaining !== 0) leftover.push(`${answer.limitingReactant}: ${remaining} left`);
      }
    }
    expect(leftover.slice(0, 5)).toEqual([]);
  });

  it.each([
    ['level 2', LEVEL_2],
    ['level 3', LEVEL_3],
  ])('%s: exactly one reactant is limiting, never both', (_label, pool) => {
    // If both quotients are equal neither reactant is in excess, and "which runs out first"
    // has no answer to teach.
    const tied: string[] = [];
    for (const reaction of pool) {
      for (let i = 0; i < RUNS; i++) {
        const { r1Count, r2Count } = generateReactantCounts(reaction.difficulty, reaction);
        const t1 = r1Count / reaction.reactant1.coeff;
        const t2 = r2Count / reaction.reactant2.coeff;
        if (t1 === t2) tied.push(`${reaction.reactant1.formula}: ${r1Count}/${r2Count}`);
      }
    }
    expect(tied.slice(0, 5)).toEqual([]);
  });

  it('every reaction still produces at least one unit of every product', () => {
    const empty: string[] = [];
    for (const reaction of REACTIONS) {
      for (let i = 0; i < RUNS; i++) {
        const { r1Count, r2Count } = generateReactantCounts(reaction.difficulty, reaction);
        const answer = calculateCorrectAnswer(reaction, r1Count, r2Count);
        for (const product of reaction.products) {
          if (!(answer.productsFormed[product.formula] > 0)) empty.push(product.formula);
        }
      }
    }
    expect(empty.slice(0, 5)).toEqual([]);
  });
});
