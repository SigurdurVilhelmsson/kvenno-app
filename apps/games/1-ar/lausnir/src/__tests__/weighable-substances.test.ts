import { describe, it, expect } from 'vitest';

import { CHEMICALS } from '../data';
import type { Chemical, Difficulty } from '../types';
import { generateProblem } from '../utils/problem-generator';

// Until Aug 2026 the generator drew any chemical for any problem type, so it
// would tell a student "Þú leysir 60 g af HCl í 250 mL af lausn". HCl is a gas;
// hydrochloric acid is its aqueous solution, bought by the bottle. Six more of
// the 21 chemicals are liquids in the same position — H₂SO₄, HNO₃, H₃PO₄,
// CH₃COOH, etanól, H₂O₂ — all dispensed by volume from stock, never weighed.
//
// The two problem types that open "Þú leysir ..." must therefore draw solids
// only. The rest may use anything: dilution and mixing act on solutions, and
// massFromMolarity asks what a solution already contains rather than telling the
// student to make one.

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const DISSOLVES_PURE_SUBSTANCE = ['molarity', 'molarityFromMass'];
const RUNS = 3000;

const ALL: Chemical[] = [...CHEMICALS.simple, ...CHEMICALS.medium, ...CHEMICALS.hard];
const byName = new Map<string, Chemical>(ALL.map((c) => [c.name, c]));

describe('lausnir only asks students to weigh out things that can be weighed', () => {
  it.each(DIFFICULTIES)(
    '%s: no dissolve-the-substance problem uses a liquid or gas',
    (difficulty) => {
      const offenders = new Set<string>();

      for (let i = 0; i < RUNS; i++) {
        const problem = generateProblem(difficulty);
        if (!DISSOLVES_PURE_SUBSTANCE.includes(problem.type)) continue;
        const c = problem.chemical;
        // Problem.chemical is optional on the type; every generator sets it, and a
        // missing one would itself be a defect worth failing on.
        expect(c, `${problem.type} produced no chemical`).toBeDefined();
        if (c && c.form !== 'solid') {
          offenders.add(`${problem.type}: ${c.name} (${c.form})`);
        }
      }

      expect([...offenders]).toEqual([]);
    }
  );

  it.each(DIFFICULTIES)(
    '%s: the solids-only filter still leaves a pool to draw from',
    (difficulty) => {
      // A filter that empties a pool would make generateProblem return undefined
      // for the chemical rather than fail loudly, so assert the pools directly.
      const set =
        difficulty === 'easy'
          ? CHEMICALS.simple
          : difficulty === 'medium'
            ? CHEMICALS.medium
            : CHEMICALS.hard;

      expect(set.filter((c) => c.form === 'solid').length).toBeGreaterThan(1);
    }
  );

  it('every chemical declares a form, and the known non-solids are classified', () => {
    expect(ALL).toHaveLength(20);
    for (const c of ALL) {
      expect(['solid', 'liquid', 'gas'], `${c.name} has form ${c.form}`).toContain(c.form);
    }

    // HCl is the only gas; the six liquids are the concentrated-stock reagents.
    expect(byName.get('HCl')?.form).toBe('gas');

    for (const name of ['H₂SO₄', 'HNO₃', 'H₃PO₄', 'CH₃COOH', 'etanól', 'H₂O₂']) {
      expect(byName.get(name)?.form, `${name} should be a liquid`).toBe('liquid');
    }
  });

  it.each(DIFFICULTIES)('%s: every mass a student is told to weigh is weighable', (difficulty) => {
    // A school balance reads to 0.01 g. Ca(OH)₂ saturates at 0.022 M, so before
    // this it was asked for in tens of milligrams — "Þú leysir 0.048 g af
    // Ca(OH)₂" — where the reading is mostly its own error.
    const tooSmall: string[] = [];

    for (let i = 0; i < RUNS; i++) {
      const problem = generateProblem(difficulty);
      if (problem.type !== 'molarityFromMass') continue;
      const mass = problem.given.massInGrams;
      if (mass !== undefined && mass < 0.1) {
        tooSmall.push(`${problem.chemical?.name}: ${mass} g`);
      }
    }

    expect(tooSmall.slice(0, 5)).toEqual([]);
  });

  it.each(DIFFICULTIES)(
    '%s: no dissolve problem implies an unweighable amount, in grams or moles',
    (difficulty) => {
      // 'molarity' states the quantity in moles, but a student still has to weigh
      // it: 0.00079 mol of Ca(OH)₂ is 58 mg. The rule applies to both types.
      const tooSmall: string[] = [];

      for (let i = 0; i < RUNS; i++) {
        const problem = generateProblem(difficulty);
        if (!DISSOLVES_PURE_SUBSTANCE.includes(problem.type)) continue;
        const c = problem.chemical;
        if (!c) continue;

        const grams =
          problem.type === 'molarityFromMass'
            ? problem.given.massInGrams
            : (problem.given.moles ?? 0) * c.molarMass;

        if (grams !== undefined && grams < 0.1) tooSmall.push(`${c.name}: ${grams.toFixed(4)} g`);
      }

      expect(tooSmall.slice(0, 5)).toEqual([]);
    }
  );

  it('holds no potassium dichromate', () => {
    // Removed 2026-08-26 on Siggi's call. K₂Cr₂O₇ is Cr(VI), a category-1
    // carcinogen many Icelandic schools no longer stock, and this game is the
    // one place that asks a student to weigh it out and dissolve it. Its
    // numbers were fine — 1.44 g at the low end — so nothing but the safety
    // question is at issue, and that question does not reach the naming and
    // oxidation-number exercises in 1-ar/nafnakerfid and 2-ar/redox-reactions,
    // which are paper chemistry and keep it.
    expect(ALL.map((c) => c.name)).not.toContain('K₂Cr₂O₇');
  });

  it('liquids and gases still appear, in the problem types that suit them', () => {
    // Removing them from the game entirely would lose the dilution-from-stock
    // problems, which are the real lab skill for these reagents.
    const seen = new Set<string>();
    for (const difficulty of DIFFICULTIES) {
      for (let i = 0; i < RUNS; i++) {
        const problem = generateProblem(difficulty);
        if (problem.chemical && problem.chemical.form !== 'solid') {
          seen.add(problem.chemical.name);
        }
      }
    }

    expect(seen.has('HCl')).toBe(true);
    expect(seen.size).toBeGreaterThanOrEqual(6);
  });
});
