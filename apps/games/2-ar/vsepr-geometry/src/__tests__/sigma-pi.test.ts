import { describe, expect, it } from 'vitest';

import { LEVEL3_CHALLENGES } from '../components/Level3';

/**
 * σ- og π-tengi, Stig 3's questions on what multiple bonds are made of (book ch. 8.3, m68746).
 * The counts are the book's: ethene has five σ bonds and one π bond, ethyne three σ and two π.
 * Each count is also worked out here from the Lewis structure the card shows, so the key cannot
 * drift from the molecule on screen.
 */

const sigmaPi = LEVEL3_CHALLENGES.filter((c) => c.type === 'sigma_pi');

/** σ and π bonds from a structure written with H, -, = and ≡: every bond is one σ, plus π. */
function countBonds(lewis: string, hydrogens: number) {
  const doubles = (lewis.match(/=/g) ?? []).length;
  const triples = (lewis.match(/≡/g) ?? []).length;
  // C–H bonds, plus the one C–C bond each multiple bond carries.
  return { sigma: hydrogens + doubles + triples, pi: doubles + 2 * triples };
}

describe('σ- og π-tengi', () => {
  it('asks four questions, each with exactly one right option', () => {
    expect(sigmaPi).toHaveLength(4);
    for (const c of sigmaPi) {
      expect(
        c.options.filter((o) => o.correct),
        c.question
      ).toHaveLength(1);
      for (const o of c.options.filter((o) => !o.correct)) {
        expect(o.explanation, o.text).not.toMatch(/^Rétt/);
      }
    }
  });

  it.each([
    ['C₂H₄', 4, 5, 1],
    ['C₂H₂', 2, 3, 2],
  ])('counts %s as the book does', (formula, hydrogens, sigma, pi) => {
    const item = sigmaPi.find((c) => c.formula === formula && /Hve mörg/.test(c.question));
    expect(item).toBeDefined();
    expect(countBonds(item!.lewisStructure!, hydrogens)).toEqual({ sigma, pi });
    const right = item!.options.find((o) => o.correct)!;
    expect(right.text).toBe(`${sigma} σ-tengi og ${pi} π-tengi`);
  });

  it('names the book in every explanation', () => {
    for (const c of sigmaPi) expect(c.conceptExplanation).toContain('kafli 8, „Margföld tengi“');
  });
});
