import { describe, it, expect } from 'vitest';

import { REACTIONS } from '../data/reactions';
import { checkBalance, diagnoseMisconception } from '../utils/balanceChecker';

/**
 * The Year-1 curriculum review found this game names no misconception at all,
 * so a wrong answer got the word "Rangt", a per-element count, and the right
 * coefficients — nothing about why the student got it wrong.
 *
 * The slot it fills renders outside the FeedbackPanel's collapsible
 * explanation, so it is the one thing a student who reads nothing else sees.
 */

const diagnose = (
  reaction: (typeof REACTIONS)[number],
  reactantCoeffs: number[],
  productCoeffs: number[]
) =>
  diagnoseMisconception(
    reaction.reactants,
    reaction.products,
    reactantCoeffs,
    productCoeffs,
    checkBalance(reaction.reactants, reaction.products, reactantCoeffs, productCoeffs)
  );

const correctCoeffs = (reaction: (typeof REACTIONS)[number]) => ({
  reactants: reaction.reactants.map((m) => m.coefficient),
  products: reaction.products.map((m) => m.coefficient),
});

/** A reaction needing a coefficient above 1 on both sides. */
const twoSided = REACTIONS.find(
  (r) => r.reactants.some((m) => m.coefficient > 1) && r.products.some((m) => m.coefficient > 1)
)!;

describe('diagnoseMisconception', () => {
  it('finds a reaction needing coefficients on both sides to test with', () => {
    expect(twoSided).toBeDefined();
  });

  it('says nothing when the equation is balanced', () => {
    for (const reaction of REACTIONS) {
      const { reactants, products } = correctCoeffs(reaction);
      expect(diagnose(reaction, reactants, products), `reaction ${reaction.id}`).toBeUndefined();
    }
  });

  it('says nothing about a doubled-but-balanced set — that has its own message', () => {
    for (const reaction of REACTIONS) {
      const { reactants, products } = correctCoeffs(reaction);
      expect(
        diagnose(
          reaction,
          reactants.map((c) => c * 2),
          products.map((c) => c * 2)
        ),
        `reaction ${reaction.id}`
      ).toBeUndefined();
    }
  });

  it('explains what a coefficient does when nothing has been changed', () => {
    const unbalancedAtOne = REACTIONS.filter(
      (r) =>
        !checkBalance(
          r.reactants,
          r.products,
          r.reactants.map(() => 1),
          r.products.map(() => 1)
        ).isBalanced
    );
    expect(unbalancedAtOne.length).toBeGreaterThan(0);

    for (const reaction of unbalancedAtOne) {
      const message = diagnose(
        reaction,
        reaction.reactants.map(() => 1),
        reaction.products.map(() => 1)
      );
      expect(message, `reaction ${reaction.id}`).toMatch(/Vísitölunum/);
    }
  });

  it('notices when only one side has been balanced', () => {
    const { reactants, products } = correctCoeffs(twoSided);

    expect(
      diagnose(
        twoSided,
        reactants,
        products.map(() => 1)
      )
    ).toMatch(/aðeins breytt vinstri hliðinni/);

    expect(
      diagnose(
        twoSided,
        reactants.map(() => 1),
        products
      )
    ).toMatch(/aðeins breytt hægri hliðinni/);
  });

  it('never claims a side needs a coefficient it does not need', () => {
    // 2Na + Cl₂ → 2NaCl needs nothing above 1 on the right. Telling a student
    // to look for one there sends them after something that does not exist.
    const oneSided = REACTIONS.filter(
      (r) =>
        r.reactants.every((m) => m.coefficient === 1) !==
        r.products.every((m) => m.coefficient === 1)
    );
    expect(oneSided.length).toBeGreaterThan(0);

    for (const reaction of oneSided) {
      const sideThatNeedsNothing = reaction.reactants.every((m) => m.coefficient === 1)
        ? 'vinstri'
        : 'hægri';
      const { reactants, products } = correctCoeffs(reaction);
      // Balance the side that does need coefficients, leave the other at 1 —
      // which is what the answer asks for anyway — then perturb one value so
      // the equation is unbalanced and the diagnosis actually runs.
      const perturbedReactants = [...reactants];
      perturbedReactants[0] = perturbedReactants[0] + 1;
      const message = diagnose(reaction, perturbedReactants, products);
      if (message) {
        expect(message, `reaction ${reaction.id}`).not.toContain(
          `aðeins breytt ${sideThatNeedsNothing === 'vinstri' ? 'hægri' : 'vinstri'} hliðinni`
        );
      }
    }
  });

  it('names the element that sits in more than one molecule on the short side', () => {
    // Methane combustion: CH₄ + 2O₂ → CO₂ + 2H₂O. Oxygen is in both products,
    // so a student counting it in CO₂ alone under-counts that side.
    const combustion = REACTIONS.find(
      (r) =>
        r.reactants.some((m) => m.formula === 'CH₄') && r.products.some((m) => m.formula === 'CO₂')
    );
    expect(combustion, 'no methane combustion in the pool to test with').toBeDefined();

    // Right side correct, one too many O₂ on the left.
    const reactants = combustion!.reactants.map((m) =>
      m.formula === 'O₂' ? m.coefficient + 1 : m.coefficient
    );
    expect(
      diagnose(
        combustion!,
        reactants,
        combustion!.products.map((m) => m.coefficient)
      )
    ).toMatch(/Súrefni \(O\) kemur fyrir í fleiri en einni sameind/);
  });

  it('is silent rather than guessing', () => {
    // A misconception the student does not hold is worse than none, because
    // they will act on it. This pins that the diagnosis declines to speak on
    // cases it cannot read, rather than reaching for a catch-all.
    let spoke = 0;
    let silent = 0;
    for (const reaction of REACTIONS) {
      const { reactants, products } = correctCoeffs(reaction);
      for (let i = 0; i < reactants.length; i++) {
        const perturbed = [...reactants];
        perturbed[i] += 1;
        if (diagnose(reaction, perturbed, products)) spoke++;
        else silent++;
      }
    }
    expect(spoke).toBeGreaterThan(0);
    expect(silent).toBeGreaterThan(0);
  });
});
