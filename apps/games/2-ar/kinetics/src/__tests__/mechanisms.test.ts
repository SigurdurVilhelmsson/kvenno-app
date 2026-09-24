import { describe, it, expect } from 'vitest';

import { challenges } from '../data/level3-questions';

/**
 * The elementary steps of a mechanism must add up to the overall equation (Brown 14.6) — that
 * is the first check a student is taught to make of a proposed mechanism. Two Level 3 cards
 * failed it on screen: the ozone card printed `O₃ + O → 2O₂` above steps that add to
 * `2O₃ → 3O₂`, and the iodide-catalysed card halved its overall equation (`½O₂`) against steps
 * that add to `2H₂O₂ → 2H₂O + O₂`.
 *
 * Species-level bookkeeping: each step may be used a whole number of times (1–3), which is how
 * the N₂O₅ mechanism, whose first step runs twice, adds up.
 */

type Tally = Map<string, number>;

function parseSide(side: string, sign: number, into: Tally) {
  for (const raw of side.split(' + ')) {
    const term = raw.trim();
    const match = /^(\d+|½)?(.+)$/.exec(term)!;
    const coefficient = match[1] === '½' ? 0.5 : match[1] ? Number(match[1]) : 1;
    into.set(match[2], (into.get(match[2]) ?? 0) + sign * coefficient);
  }
}

function net(equation: string, times = 1, into: Tally = new Map()): Tally {
  const bare = equation.replace(/\s*\([^)]*\)\s*$/, '');
  const [left, right] = bare.split(/\s*[→⇌]\s*/);
  parseSide(left, -times, into);
  parseSide(right, times, into);
  return into;
}

function same(a: Tally, b: Tally): boolean {
  const keys = new Set([...a.keys(), ...b.keys()]);
  return [...keys].every((k) => Math.abs((a.get(k) ?? 0) - (b.get(k) ?? 0)) < 1e-9);
}

function multiplierSets(n: number): number[][] {
  if (n === 0) return [[]];
  return multiplierSets(n - 1).flatMap((rest) => [1, 2, 3].map((m) => [...rest, m]));
}

describe('Level 3 mechanisms', () => {
  for (const challenge of challenges) {
    it(`${challenge.title}: the steps add up to the overall equation`, () => {
      const overall = net(challenge.overallReaction);
      const adds = multiplierSets(challenge.mechanism.length).some((times) => {
        const sum: Tally = new Map();
        challenge.mechanism.forEach((step, i) => net(step.equation, times[i], sum));
        return same(sum, overall);
      });
      expect(adds, `${challenge.overallReaction}`).toBe(true);
    });

    it(`${challenge.title}: a step is an equilibrium in its arrow, colour and label alike`, () => {
      for (const step of challenge.mechanism) {
        const arrow = step.equation.includes('⇌');
        const label = /jafnvægi/.test(step.label ?? '');
        expect({ step: step.equation, arrow, label, type: step.type }).toEqual({
          step: step.equation,
          arrow: step.type === 'equilibrium',
          label: step.type === 'equilibrium',
          type: step.type,
        });
      }
    });
  }

  it('takes the square root of K when a pre-equilibrium dissociates Cl₂ into two Cl', () => {
    // Cl₂ ⇌ 2Cl gives K = [Cl]²/[Cl₂], so [Cl] = √(K[Cl₂]) — which the hint says and the
    // explanation used to contradict with `[Cl] = K[Cl₂]^½`.
    const card = challenges.find((c) => c.overallReaction.startsWith('Cl₂ + CHCl₃'))!;
    const explanation = card.options.find((o) => o.correct)!.explanation;
    expect(explanation).toContain('[Cl] = √(K[Cl₂])');
    expect(card.hint).toContain('√(K[Cl₂])');
  });
});
