import { describe, expect, it } from 'vitest';

import { parseFormula } from '@shared/utils';

import { REACTIONS } from '../data/reactions';

/**
 * Year-1 audit, Phase 0 item 7 (2026-11-15). Two of the `hard` reactions no
 * level draws yet were wrong as written: sulfur burning to SO₃, which needs a
 * catalyst, and P₂O₅ where the book and Nafnakerfið write P₄O₁₀. Every
 * reaction is held here to its atoms, so the first level to draw them gets
 * equations a student can trust.
 */

function atoms(side: { formula: string; coeff: number }[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const { formula, coeff } of side) {
    for (const { symbol, count } of parseFormula(formula)) {
      out[symbol] = (out[symbol] ?? 0) + coeff * count;
    }
  }
  return out;
}

describe('every reaction in the pool', () => {
  it.each(REACTIONS.map((r) => [r.equation, r] as const))('%s is balanced', (_eq, r) => {
    expect(atoms([r.reactant1, r.reactant2])).toEqual(atoms(r.products));
  });

  it('writes phosphorus oxide as the book does and burns sulfur to SO₂', () => {
    const products = REACTIONS.flatMap((r) => r.products.map((p) => p.formula));
    expect(products).not.toContain('P₂O₅');
    const sulfur = REACTIONS.filter((r) => r.reactant1.formula === 'S₈');
    for (const r of sulfur) expect(r.products.map((p) => p.formula)).not.toContain('SO₃');
  });
});
