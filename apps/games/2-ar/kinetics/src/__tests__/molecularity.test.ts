import { describe, expect, it } from 'vitest';

import { challenges } from '../data/level3-questions';

/**
 * Molecularity in Stig 3 (year-2 plan, Phase 4; Siggi, 2026-11-15). The book teaches it in
 * kafli 12, Hvarfgangar (m68794): the rate law of an elementary reaction follows from its
 * equation, each reactant raised to its coefficient. The correct option is held to that here,
 * worked out from the step itself, not typed beside it.
 */

const NAMES = ['einsameindahvarf', 'tvísameindahvarf', 'þrísameindahvarf'];
const molecularity = challenges.filter((c) => c.type === 'molecularity');

/** Reactant particles of one step: `2NO + O₂` → { NO: 2, O₂: 1 }. */
function reactants(equation: string): Map<string, number> {
  const out = new Map<string, number>();
  for (const term of equation.split(/\s*→\s*/)[0].split(' + ')) {
    const [, n, species] = /^(\d*)(.+)$/.exec(term.trim())!;
    out.set(species, (out.get(species) ?? 0) + (n ? Number(n) : 1));
  }
  return out;
}

const rateLaw = (r: Map<string, number>) =>
  'hraði = k' + [...r].map(([s, n]) => `[${s}]${n === 1 ? '' : n === 2 ? '²' : '³'}`).join('');

describe('molecularity', () => {
  it('has two challenges, each one elementary step', () => {
    expect(molecularity).toHaveLength(2);
    for (const c of molecularity) {
      expect(c.mechanism).toHaveLength(1);
      expect(c.mechanism[0].equation).toBe(c.overallReaction);
    }
  });

  it('names the molecularity and rate law the step itself gives', () => {
    for (const c of molecularity) {
      const r = reactants(c.mechanism[0].equation);
      const count = [...r.values()].reduce((a, b) => a + b, 0);
      const right = c.options.find((o) => o.correct)!;
      const text = `${right.text} ${right.explanation}`.toLowerCase();
      if (c.options.some((o) => /hraði = k/.test(o.text))) {
        expect(right.text).toContain(rateLaw(r));
        expect(text).toContain(NAMES[count - 1]);
      } else {
        expect(text).toContain(NAMES[count - 1].slice(0, -5));
        expect(c.description).toContain(rateLaw(r));
      }
    }
  });

  it('cites the book', () => {
    for (const c of molecularity) expect(c.conceptExplanation).toMatch(/kafli 12, Hvarfgangar/);
  });
});
