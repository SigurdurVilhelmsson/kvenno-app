import { describe, it, expect } from 'vitest';

import { generateProblem, particlesOf } from '../components/Level2';
import { buildProblem, DESCRIPTORS } from '../components/Level3';
import { COMPOUNDS } from '../data/compounds';
import { ELEMENTS } from '../data/elements';

/**
 * A mole of an ionic compound is a mole of formula units, not of molecules —
 * the textbook's mole section says `sameindir eða formúlueiningar`. Stig 3
 * already said `formúlueiningar` for NaCl and NaOH, while Stig 2 asked how many
 * `sameindir` there are in a mole of table salt and told the student that each
 * `sameind` of CaCO₃ holds three oxygen atoms.
 *
 * `ionic` is declared per compound; the first test holds it to the formula, so
 * a compound added later cannot be flagged the wrong way without failing here.
 */

const METALS = new Set(
  ELEMENTS.filter((e) =>
    ['alkali-metal', 'alkaline-earth', 'transition-metal', 'post-transition-metal'].includes(
      e.category
    )
  ).map((e) => e.symbol)
);

/** A metal, or the ammonium ion: the salts in this pool. */
function looksIonic(formula: string, symbols: string[]): boolean {
  return symbols.some((s) => METALS.has(s)) || formula.includes('NH₄');
}

describe('which compounds are ionic', () => {
  it.each(COMPOUNDS.map((c) => [c.formula, c] as const))('%s', (formula, compound) => {
    expect(compound.ionic, formula).toBe(
      looksIonic(
        formula,
        compound.elements.map((e) => e.symbol)
      )
    );
  });
});

describe('Stig 2 counts formula units of a salt', () => {
  it.each(COMPOUNDS.filter((c) => c.ionic).map((c) => [c.formula, c] as const))(
    '%s',
    (formula, compound) => {
      const particles = generateProblem(compound, 'moles_to_particles');
      const text = `${particles.questionText} ${particles.solutionFormula} ${particles.solutionSteps}`;
      expect(text, formula).toContain('formúlueiningar');
      expect(text, formula).not.toMatch(/sameind/);

      const atoms = generateProblem(compound, 'moles_to_element_atoms');
      expect(atoms.solutionSteps, formula).not.toMatch(/sameind/);
    }
  );

  it('and molecules of everything else', () => {
    for (const compound of COMPOUNDS.filter((c) => !c.ionic)) {
      expect(particlesOf(compound)).toBe('sameindir');
      expect(generateProblem(compound, 'moles_to_particles').questionText).toContain('sameindir');
    }
  });
});

describe('Stig 3 agrees', () => {
  it('names formula units for every salt it asks about', () => {
    for (const d of DESCRIPTORS) {
      if (d.type === 'mass-to-moles-of-atom') continue;
      const compound = COMPOUNDS.find((c) => c.formula === d.formula)!;
      const problem = buildProblem(d);
      expect(problem.particles, d.formula).toBe(particlesOf(compound));
      expect(problem.question, d.formula).toContain(particlesOf(compound));
    }
  });
});

describe('the atoms-of-an-element solution cancels its units', () => {
  it('turns moles of compound into moles of element before counting atoms', () => {
    const withSubscript = COMPOUNDS.find((c) => c.formula === 'H₂O')!;
    const { solutionFormula } = generateProblem(withSubscript, 'moles_to_element_atoms');
    // mól × (mól X / mól) × (atóm / mól) → atóm. Putting atoms over moles in
    // both factors, as it did, leaves atóm² / mól.
    expect(solutionFormula).toBe(
      'Einingagreining: mól × (mól af frumefninu / 1 mól) × (atóm / 1 mól) → atóm'
    );
  });
});
