import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

import { REACTIONS, type Reaction } from '../data/reactions';
import { checkBalance, coefficientsAreReduced } from '../utils/balanceChecker';

/**
 * Guards B12 — the game accepted any balanced coefficient set, reduced or not.
 *
 * `4H₂ + 2O₂ → 4H₂O` has equal atom counts on both sides, so the old check said
 * "Rétt!". A balanced equation uses the smallest whole numbers that work, and
 * that convention was neither enforced nor stated anywhere in the game, so a
 * student who doubled everything was told they had it right.
 *
 * Two things had to change together, which is why this file tests both. Grading
 * now requires `isBalanced && isReduced`, and the instructions say so — holding a
 * student to a rule the game never mentions would have been a worse defect than
 * the one being fixed.
 *
 * This game shipped with no tests at all, which is how B12 survived four review
 * iterations.
 */

const coefficientsOf = (reaction: Reaction) => ({
  reactants: reaction.reactants.map((m) => m.coefficient),
  products: reaction.products.map((m) => m.coefficient),
});

const check = (reaction: Reaction, reactants: number[], products: number[]) =>
  checkBalance(reaction.reactants, reaction.products, reactants, products);

describe('coefficientsAreReduced', () => {
  it('accepts a set whose greatest common divisor is 1', () => {
    expect(coefficientsAreReduced([2, 1, 2])).toBe(true);
    expect(coefficientsAreReduced([1, 1, 1])).toBe(true);
    expect(coefficientsAreReduced([6, 10, 15])).toBe(true);
    expect(coefficientsAreReduced([1])).toBe(true);
  });

  it('rejects a set sharing a common factor — the B12 case', () => {
    expect(coefficientsAreReduced([4, 2, 4])).toBe(false);
    expect(coefficientsAreReduced([3, 3])).toBe(false);
    expect(coefficientsAreReduced([10, 5, 10])).toBe(false);
  });

  it('rejects a zero rather than reasoning about gcd(0, n)', () => {
    // gcd(0, n) is n, so `0, 2, 2` would otherwise be called reduced whenever
    // some other coefficient happened to be odd. Zero is not a usable
    // coefficient in a balanced equation either way.
    expect(coefficientsAreReduced([0, 2, 2])).toBe(false);
    expect(coefficientsAreReduced([0, 3])).toBe(false);
  });

  it('treats an empty set as reduced', () => {
    expect(coefficientsAreReduced([])).toBe(true);
  });
});

describe('checkBalance separates balanced from reduced', () => {
  // 2H₂ + O₂ → 2H₂O
  const water = REACTIONS.find((r) => r.id === 1)!;

  it('found the reaction it is testing', () => {
    expect(water.reactants.map((m) => m.formula)).toEqual(['H₂', 'O₂']);
    expect(water.products.map((m) => m.formula)).toEqual(['H₂O']);
  });

  it('accepts the lowest whole-number set', () => {
    const result = check(water, [2, 1], [2]);
    expect(result.isBalanced).toBe(true);
    expect(result.isReduced).toBe(true);
  });

  it('reports a doubled set as balanced but not reduced', () => {
    const result = check(water, [4, 2], [4]);
    expect(result.isBalanced).toBe(true);
    expect(result.isReduced).toBe(false);
  });

  it('reports an unbalanced set as unbalanced', () => {
    const result = check(water, [1, 1], [1]);
    expect(result.isBalanced).toBe(false);
    expect(result.elements.find((e) => e.element === 'O')).toMatchObject({
      left: 2,
      right: 1,
      balanced: false,
    });
  });

  it('grades a doubled set as wrong, the way the level does', () => {
    // Level.tsx: `const correct = balanceResult.isBalanced && balanceResult.isReduced`
    const doubled = check(water, [4, 2], [4]);
    expect(doubled.isBalanced && doubled.isReduced).toBe(false);
  });
});

describe('every stored answer key is itself balanced and reduced', () => {
  it('has the full reaction set', () => {
    expect(REACTIONS.length).toBeGreaterThanOrEqual(20);
  });

  it.each(REACTIONS.map((r) => [r.id, r] as const))('reaction %s', (_id, reaction) => {
    const { reactants, products } = coefficientsOf(reaction);
    const result = check(reaction, reactants, products);

    const formula = [
      reaction.reactants.map((m, i) => `${reactants[i]}${m.formula}`).join(' + '),
      reaction.products.map((m, i) => `${products[i]}${m.formula}`).join(' + '),
    ].join(' → ');

    expect(result.isBalanced, `${formula} does not balance`).toBe(true);
    expect(result.isReduced, `${formula} is not in lowest whole-number terms`).toBe(true);
  });

  it.each(REACTIONS.map((r) => [r.id, r] as const))(
    'reaction %s rejects its own answer doubled',
    (_id, reaction) => {
      const { reactants, products } = coefficientsOf(reaction);
      const result = check(
        reaction,
        reactants.map((c) => c * 2),
        products.map((c) => c * 2)
      );
      expect(result.isBalanced).toBe(true);
      expect(result.isReduced).toBe(false);
    }
  );

  it('uses no zero coefficients in any answer key', () => {
    for (const reaction of REACTIONS) {
      const { reactants, products } = coefficientsOf(reaction);
      for (const coefficient of [...reactants, ...products]) {
        expect(coefficient, `reaction ${reaction.id}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('the game states the rule it now enforces', () => {
  const src = (path: string) => readFileSync(join(__dirname, '..', path), 'utf8');

  it('tells the student to use the lowest whole numbers', () => {
    expect(src('components/levelConfigs.tsx')).toMatch(/lægstu heilu tölurnar/);
  });

  it('says what is wrong when the atoms balance but the numbers do not reduce', () => {
    // A bare "Rangt" here would be the worst of both: the student did the
    // chemistry and is told only that they failed.
    const level = src('components/Level.tsx');
    expect(level).toMatch(/Atómin standast á/);
    expect(level).toMatch(/lægstu heilu tölum/);
  });
});
