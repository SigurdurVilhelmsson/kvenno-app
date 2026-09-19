import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

import { ATOMIC_MASSES } from '../data/elements';
import { COMPOUNDS, MOLECULAR_PROBLEMS, NEEDS_MULTIPLIER, PROBLEMS } from '../data/problems';
import { deriveEmpirical, formatFormula, percentComposition } from '../engine/empirical';

/**
 * The shipped content, re-derived independently of the data file.
 *
 * Every one of the old game's three defects is asserted here as a property
 * rather than as a fixed expectation, so a future compound cannot reintroduce
 * the shape of the bug.
 */

describe('every problem is answerable and agrees with its own grader', () => {
  it('ships a usable set', () => {
    expect(PROBLEMS.length).toBeGreaterThanOrEqual(8);
    expect(MOLECULAR_PROBLEMS.length).toBeGreaterThanOrEqual(3);
  });

  it.each(PROBLEMS.map((p) => [p.id, p] as const))('%s derives its own answer', (_id, problem) => {
    const record = Object.fromEntries(problem.percentages.map((p) => [p.element, p.percent]));
    const derived = deriveEmpirical(record);
    expect(derived.formula).toBe(problem.answer);
    expect(derived.multiplier).toBe(problem.multiplier);
  });

  it('every stated percentage matches the compound it claims to be', () => {
    // The `l2-1` defect: a compound labelled hydrogen peroxide carrying water's
    // percentages. Checked by recomputing from the formula, which is the only
    // direction that cannot be fooled.
    for (const c of COMPOUNDS) {
      const problem = PROBLEMS.find((p) => p.id === c.id)!;
      const expected = percentComposition(c.counts);
      for (const e of expected) {
        const got = problem.percentages.find((p) => p.element === e.element)!;
        expect(got.percent, `${c.id} ${e.element}`).toBeCloseTo(e.percent, 1);
      }
    }
  });

  it('every percentage set sums to 100', () => {
    for (const p of PROBLEMS) {
      const total = p.percentages.reduce((s, x) => s + x.percent, 0);
      expect(total, p.id).toBeCloseTo(100, 1);
    }
  });

  it('no answer is the 1,5-rounded-up formula', () => {
    // The `l2-5` defect in general form: if the ratios needed doubling, the
    // answer must be the doubled formula, never the rounded one. Reproduces the
    // wrong answer explicitly and asserts it is not what we ship.
    for (const problem of NEEDS_MULTIPLIER) {
      const record = Object.fromEntries(problem.percentages.map((p) => [p.element, p.percent]));
      const derived = deriveEmpirical(record);
      const rounded = formatFormula(
        derived.rows.map((r) => ({
          element: r.element,
          subscript: Math.max(Math.round(r.ratio), 1),
        }))
      );
      expect(problem.answer, `${problem.id} shipped the rounded formula`).not.toBe(rounded);
    }
  });

  it('carries the 1,5 trap, which is the lesson', () => {
    expect(NEEDS_MULTIPLIER.length).toBeGreaterThanOrEqual(3);
    // Ammonium nitrate is the one the old game got wrong; keep it.
    const an = PROBLEMS.find((p) => p.id === 'ammoniumnitrat')!;
    expect(an.answer).toBe('N₂H₄O₃');
    expect(an.multiplier).toBe(2);
  });

  it('has unique ids and spans all three difficulties', () => {
    expect(new Set(PROBLEMS.map((p) => p.id)).size).toBe(PROBLEMS.length);
    expect(new Set(COMPOUNDS.map((c) => c.difficulty))).toEqual(new Set(['ledd', 'mid', 'thung']));
  });

  it('ships no duplicate composition', () => {
    // `l2-2` and `l2-8` were byte-identical, labelled easy and hard.
    const seen = PROBLEMS.map((p) =>
      p.percentages
        .map((x) => `${x.element}${x.percent}`)
        .sort()
        .join('|')
    );
    expect(new Set(seen).size, 'two problems share a composition').toBe(seen.length);
  });
});

describe('the molecular half', () => {
  it.each(MOLECULAR_PROBLEMS.map((m) => [m.id, m] as const))('%s is self-consistent', (_id, m) => {
    const empiricalMass = m.empirical.reduce(
      (s, e) => s + ATOMIC_MASSES[e.element] * e.subscript,
      0
    );
    expect(m.empiricalMass).toBeCloseTo(empiricalMass, 6);
    expect(m.molarMass / empiricalMass).toBeCloseTo(m.n, 1);
    expect(m.n).toBeGreaterThanOrEqual(1);
  });

  it('the empirical formula is genuinely reduced', () => {
    // If it were not, the question would already be answered.
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    for (const m of MOLECULAR_PROBLEMS) {
      const divisor = m.empirical.map((e) => e.subscript).reduce((a, b) => gcd(a, b));
      expect(divisor, `${m.id} empirical formula is not in lowest terms`).toBe(1);
    }
  });

  it('carries a pair that shares an empirical formula, which is the point', () => {
    // Glucose and formaldehyde are both CH₂O. Without such a pair the molecular
    // half has no reason to exist.
    const glucose = MOLECULAR_PROBLEMS.find((m) => m.id === 'glukosi')!;
    expect(formatFormula(glucose.empirical)).toBe('CH₂O');
    expect(glucose.answer).toBe('C₆H₁₂O₆');
    expect(PROBLEMS.find((p) => p.id === 'formaldehyd')!.answer).toBe('CH₂O');
  });
});

describe('the atomic masses agree with molmassi', () => {
  it('every shared symbol has the same mass', () => {
    // Two copies of the same numbers is how B4 happened. This is what stops it.
    const src = readFileSync(
      join(__dirname, '..', '..', '..', 'molmassi', 'src', 'data', 'elements.ts'),
      'utf8'
    );
    const theirs = new Map<string, number>();
    for (const m of src.matchAll(/symbol: '([A-Z][a-z]?)',[\s\S]*?atomicMass: ([\d.]+),/g)) {
      if (!theirs.has(m[1])) theirs.set(m[1], Number(m[2]));
    }
    expect(theirs.size).toBeGreaterThan(30);
    let compared = 0;
    for (const [symbol, mass] of Object.entries(ATOMIC_MASSES)) {
      const other = theirs.get(symbol);
      if (other === undefined) continue;
      expect(mass, `${symbol} disagrees with molmassi`).toBe(other);
      compared++;
    }
    expect(compared, 'nothing was actually compared').toBeGreaterThan(30);
  });
});
