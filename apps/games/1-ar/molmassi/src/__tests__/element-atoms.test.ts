/**
 * The subscript step: moles of a compound to atoms of one element in it.
 *
 * Harvested from the frozen repo's `avogadro.ts` (`atoms_in_compound`), the one
 * conversion of its five that Level 2 did not already ask. It is the step where
 * the number in the formula does the work — a student who can go from moles to
 * molecules but reads `H₂O` as one hydrogen has not finished learning the mole.
 *
 * The key is recomputed here from `compounds.ts` rather than trusted, because
 * the question text and the key are built in the same function and could agree
 * with each other while both being wrong about the compound.
 */

import { describe, it, expect } from 'vitest';

import {
  generateProblem,
  generateAllProblems,
  hasRepeatedElement,
  type ConvType,
} from '../components/Level2';
import { COMPOUNDS } from '../data/compounds';
import { getElementBySymbol } from '../data/elements';

const AVOGADRO = 6.022e23;

/** How many of each conversion a ten-problem run deals. */
const TOTAL_PER_RUN = 2;

/** The moles the generated question actually asks about. */
function molesIn(questionText: string): number {
  const match = questionText.match(/í ([\d.,]+) mól/);
  if (!match) throw new Error(`no mole count in: ${questionText}`);
  return Number.parseFloat(match[1].replace(',', '.'));
}

const WITH_SUBSCRIPT = COMPOUNDS.filter(hasRepeatedElement);

describe('moles_to_element_atoms', () => {
  it.each(WITH_SUBSCRIPT.map((c) => [c.formula, c] as const))(
    '%s — the key is moles x subscript x Avogadro',
    (formula, compound) => {
      const problem = generateProblem(compound, 'moles_to_element_atoms');
      const biggest = [...compound.elements].sort((a, b) => b.count - a.count)[0];
      const moles = molesIn(problem.questionText);

      expect(problem.correctAnswer / (moles * biggest.count * AVOGADRO), formula).toBeCloseTo(1, 9);
    }
  );

  it.each(WITH_SUBSCRIPT.map((c) => [c.formula, c] as const))(
    '%s — asks about the element with the largest subscript, by its Icelandic name',
    (formula, compound) => {
      const problem = generateProblem(compound, 'moles_to_element_atoms');
      const biggest = [...compound.elements].sort((a, b) => b.count - a.count)[0];
      const name = getElementBySymbol(biggest.symbol)?.name;

      expect(name, `${formula}: ${biggest.symbol} is not in elements.ts`).toBeTruthy();
      expect(problem.questionText, formula).toContain(name as string);
      expect(problem.questionText, formula).toContain(`(${biggest.symbol})`);
    }
  );

  it('has compounds to ask it about at all', () => {
    expect(WITH_SUBSCRIPT.length).toBeGreaterThan(TOTAL_PER_RUN);
  });

  it.each(COMPOUNDS.filter((c) => !hasRepeatedElement(c)).map((c) => [c.formula, c] as const))(
    '%s has no subscript above one, so it is asked the particles question instead',
    (formula, compound) => {
      // "How many Na atoms in n mol of NaCl" is the moles-to-molecules question
      // the level already asks, with a step that multiplies by one. Asking it
      // as if it were the subscript question teaches that the subscript is
      // decoration.
      const problem = generateProblem(compound, 'moles_to_element_atoms');
      expect(problem.questionText, formula).toContain('Hversu margar sameindir');
    }
  );

  it('never draws a flat compound for the subscript slot in a real run', () => {
    for (let run = 0; run < 200; run++) {
      for (const problem of generateAllProblems()) {
        if (!/-atóm/.test(problem.questionText)) continue;
        expect(hasRepeatedElement(problem.compound), problem.questionText).toBe(true);
      }
    }
  });
});

describe('a Level 2 run', () => {
  it('asks all five conversions', () => {
    // The generator deals types round-robin over ten compounds, so a run holds
    // two of each. If a type is ever added without the pool growing, this says
    // which one stopped appearing.
    const problems = generateAllProblems();
    const asked = new Set<ConvType>();

    for (const problem of problems) {
      if (/Hversu mörg mól eru í .* g af/.test(problem.questionText)) asked.add('mass_to_moles');
      else if (/Hvað vega .* mól/.test(problem.questionText)) asked.add('moles_to_mass');
      else if (/Hversu margar sameindir/.test(problem.questionText))
        asked.add('moles_to_particles');
      else if (/Hversu mörg mól eru .* sameindir/.test(problem.questionText))
        asked.add('particles_to_moles');
      else if (/-atóm/.test(problem.questionText)) asked.add('moles_to_element_atoms');
    }

    expect([...asked].sort()).toEqual(
      [
        'mass_to_moles',
        'moles_to_element_atoms',
        'moles_to_mass',
        'moles_to_particles',
        'particles_to_moles',
      ].sort()
    );
  });
});
