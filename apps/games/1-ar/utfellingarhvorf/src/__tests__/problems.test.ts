import { describe, it, expect } from 'vitest';

import { ANIONS, CATIONS } from '../data/ions';
import { DRILL_ITEMS, NON_PRECIPITATING, PRECIPITATING, SCENARIOS } from '../data/problems';
import { renderEquation } from '../engine/precipitation';

/**
 * The shipped content, checked for the things a derived engine cannot catch.
 *
 * The engine guarantees each scenario is internally consistent. It cannot
 * guarantee the *set* is a good set — that it spans the rules, that it contains
 * the exceptions, and that it is not secretly answerable by a guess. Those are
 * the properties here.
 */

describe('the scenario set teaches rather than just works', () => {
  it('ships enough of both outcomes that "always yes" loses', () => {
    // The old game's base rate was 8 precipitate to 4 not, so answering "yes"
    // to everything scored 67 % (ORPHANED_GAMES_ASSESSMENT.md:326). A set that
    // rewards a fixed guess is not measuring anything.
    expect(SCENARIOS.length).toBeGreaterThanOrEqual(12);
    expect(NON_PRECIPITATING.length).toBeGreaterThanOrEqual(3);
    const rate = PRECIPITATING.length / SCENARIOS.length;
    expect(rate, 'the yes/no split is lopsided enough to guess').toBeLessThanOrEqual(0.75);
  });

  it('has unique ids and spans all three difficulties', () => {
    expect(new Set(SCENARIOS.map((s) => s.id)).size).toBe(SCENARIOS.length);
    expect(new Set(SCENARIOS.map((s) => s.difficulty))).toEqual(new Set(['ledd', 'mid', 'thung']));
  });

  it('ships no duplicate reaction', () => {
    // Two of the old game's items were byte-identical, labelled easy and hard.
    const seen = SCENARIOS.map((s) =>
      [s.reaction.reactants[0].formula, s.reaction.reactants[1].formula].sort().join('+')
    );
    expect(new Set(seen).size, 'two scenarios are the same reaction').toBe(seen.length);
  });

  it('covers more than one precipitate-forming rule', () => {
    const rules = new Set(
      PRECIPITATING.flatMap((s) =>
        s.reaction.verdicts.filter((v) => !v.verdict.soluble).map((v) => v.verdict.rule.id)
      )
    );
    expect(rules.size, 'every precipitate comes from the same rule').toBeGreaterThanOrEqual(3);
  });

  it('carries the Ba(OH)₂ trap, where the exception means nothing happens', () => {
    // A student who has learned "hydroxides are insoluble" and stopped reading
    // answers this one wrong. That is the whole reason it is in the set.
    const trap = SCENARIOS.find((s) => s.id === 'bacl2-naoh')!;
    expect(trap.reaction.formsPrecipitate).toBe(false);
    expect(trap.reaction.products.map((p) => p.formula)).toContain('Ba(OH)₂');
  });

  it('carries coefficients beyond 1, so the builder is not trivial', () => {
    // If every net ionic equation were 1:1 the coefficient stepper would be
    // decoration and the Ag₂CrO₄ and Ca₃(PO₄)₂ cases would never be met.
    const withCoefficients = PRECIPITATING.filter((s) =>
      s.reaction.net.left.some((t) => t.coefficient > 1)
    );
    expect(withCoefficients.length).toBeGreaterThanOrEqual(4);
  });

  it('every scenario names where a student meets it', () => {
    for (const s of SCENARIOS) {
      expect(s.context.length, `${s.id} has no context`).toBeGreaterThan(40);
    }
  });

  it('every precipitating scenario has a non-empty net ionic equation', () => {
    for (const s of PRECIPITATING) {
      const rendered = renderEquation(s.reaction.net);
      expect(rendered, s.id).toMatch(/→/);
      expect(rendered.startsWith('→'), `${s.id} has an empty left side`).toBe(false);
    }
  });

  it('no scenario is answerable from the reactant formulas alone', () => {
    // Guards against a set where, say, every silver scenario precipitates and
    // every sodium one does not — a pattern a student can exploit without
    // reading the anion. Each cation that appears more than once has to appear
    // on both sides of the outcome at least somewhere in the set.
    const byCation = new Map<string, Set<boolean>>();
    for (const s of SCENARIOS) {
      for (const salt of s.reaction.reactants) {
        const set = byCation.get(salt.cation.formula) ?? new Set<boolean>();
        set.add(s.reaction.formsPrecipitate);
        byCation.set(salt.cation.formula, set);
      }
    }
    // Sodium and potassium are the spectators of this whole topic and appear
    // constantly, so they are the ones that must not predict the outcome.
    for (const cation of ['Na⁺', 'K⁺']) {
      expect(byCation.get(cation)?.size, `${cation} predicts the outcome by itself`).toBe(2);
    }
  });
});

describe('the solubility drill', () => {
  it('contains exceptions in both directions', () => {
    // An exception that makes a soluble ion precipitate, and one that makes an
    // insoluble ion dissolve. A drill with only the first teaches half the rule.
    const exceptions = DRILL_ITEMS.filter((d) => d.verdict.byException);
    expect(
      exceptions.some((d) => !d.verdict.soluble),
      'no soluble-rule exception'
    ).toBe(true);
    expect(
      exceptions.some((d) => d.verdict.soluble),
      'no insoluble-rule exception'
    ).toBe(true);
    expect(exceptions.length).toBeGreaterThanOrEqual(5);
  });

  it('is not lopsided toward one verdict', () => {
    const soluble = DRILL_ITEMS.filter((d) => d.verdict.soluble).length;
    const ratio = soluble / DRILL_ITEMS.length;
    expect(ratio).toBeGreaterThan(0.3);
    expect(ratio).toBeLessThan(0.7);
  });

  it('carries the near-miss pairs that make the exception visible', () => {
    // AgCl against AgNO₃, and Ca(OH)₂ against Ba(OH)₂: same cation or same
    // anion, opposite verdicts. Without a pair the student cannot see that the
    // partner is what decided it.
    const find = (formula: string) => DRILL_ITEMS.find((d) => d.salt.formula === formula);
    expect(find('AgCl')!.verdict.soluble).toBe(false);
    expect(find('AgNO₃')!.verdict.soluble).toBe(true);
    expect(find('Ca(OH)₂')!.verdict.soluble).toBe(false);
    expect(find('Ba(OH)₂')!.verdict.soluble).toBe(true);
    expect(find('Na₂CO₃')!.verdict.soluble).toBe(true);
    expect(find('CaCO₃')!.verdict.soluble).toBe(false);
  });

  it('has unique items', () => {
    expect(new Set(DRILL_ITEMS.map((d) => d.salt.formula)).size).toBe(DRILL_ITEMS.length);
  });
});

describe('the ion pool', () => {
  it('declares every ion the rules name, so no exception is dead', () => {
    const cationFormulas = new Set(CATIONS.map((c) => c.formula));
    for (const group of ['Li⁺', 'Na⁺', 'K⁺', 'Rb⁺', 'Cs⁺', 'NH₄⁺']) {
      expect(cationFormulas.has(group), `${group} is named in a rule but not declared`).toBe(true);
    }
  });

  it('gives every ion a name and a non-zero charge', () => {
    for (const i of [...CATIONS, ...ANIONS]) {
      expect(i.name.length, i.formula).toBeGreaterThan(2);
      expect(i.charge, i.formula).not.toBe(0);
    }
  });

  it('marks a variable-valence metal with its Roman numeral', () => {
    // Járn(III), Kopar(II), Blý(II) — the convention nafnakerfid and the
    // textbook both use. A bare `járnjón` does not say which iron.
    for (const formula of ['Fe³⁺', 'Cu²⁺', 'Pb²⁺', 'Ni²⁺']) {
      const found = CATIONS.find((c) => c.formula === formula)!;
      expect(found.name, `${formula} needs a Roman numeral`).toMatch(/\((I|V)+\)/);
    }
  });
});
