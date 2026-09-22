import { molarMassOf } from '@shared/utils';

import { REACTIONS } from './reactions';
import type { Reaction } from '../types';
import { MAX_SENSIBLE_PERCENT, solveMassYield, type MassYield } from '../utils/yield';

/**
 * Stig 3's problems: two masses in, a collected mass, a percentage out.
 *
 * **Only the given quantities are written down here** — the two reactant
 * masses and what came out of the flask. Everything a student is asked for is
 * derived by `solveMassYield`, so no answer can disagree with the data it came
 * from. A problem whose actual yield exceeds its own theoretical yield throws
 * on import rather than shipping.
 *
 * The masses are chosen to land the percentage somewhere a student would
 * recognise as a real recovery — the book's own worked example is 77,3 % — and
 * to make the limiting reactant something they have to compute rather than
 * guess from which number is smaller.
 */

export interface YieldProblem {
  id: string;
  reaction: Reaction;
  gramsR1: number;
  gramsR2: number;
  actualGrams: number;
  /** The product weighed. Every reaction here has one, but say so explicitly. */
  productFormula: string;
  /** Why this one is in the set — shown after the answer. */
  context: string;
  /** Derived, all of it. */
  result: MassYield;
}

const by = (id: string): Reaction => {
  const found = REACTIONS.find((r) => r.id === id);
  if (!found) throw new RangeError(`No reaction ${id}`);
  return found;
};

interface Given {
  id: string;
  reactionId: string;
  gramsR1: number;
  gramsR2: number;
  actualGrams: number;
  productFormula?: string;
  context: string;
}

const ORDER: Given[] = [
  {
    id: 'vatn',
    reactionId: '1',
    gramsR1: 4.0, // H₂
    gramsR2: 48.0, // O₂
    actualGrams: 30.0,
    context:
      'Vetnið klárast fyrst þótt það sé miklu léttara — 4 g af vetni eru tvö mól, en 48 g af súrefni eru bara eitt og hálft. Massinn segir ekki hvað er takmarkandi; mólfjöldinn gerir það.',
  },
  {
    id: 'magnesiumoxid',
    reactionId: '2',
    gramsR1: 12.0, // Mg
    gramsR2: 16.0, // O₂
    actualGrams: 18.5,
    context:
      'Klassísk brennsla úr verklegri kennslu. Heimturnar verða sjaldan fullar hér: hluti oxíðsins rýkur burt sem hvítur reykur áður en það næst á vogina.',
  },
  {
    id: 'natriumklorid',
    reactionId: '7',
    gramsR1: 23.0, // Na
    gramsR2: 71.0, // Cl₂
    actualGrams: 52.0,
    context:
      'Hér er klórinn í umframmagni og natríumið takmarkandi, þótt klórgasið sé miklu þyngra. Berðu saman mól deilt með stuðli, ekki grömmin sjálf.',
  },
  {
    id: 'ammoniak',
    reactionId: '4',
    gramsR1: 28.0, // N₂
    gramsR2: 9.0, // H₂
    actualGrams: 24.0,
    context:
      'Haber-ferlið. Í iðnaði er þetta einmitt hvarf þar sem heimturnar skipta öllu máli — lítil hækkun á prósentunni sparar gríðarlega orku í verksmiðju.',
  },
  {
    id: 'thermit',
    reactionId: '19',
    gramsR1: 54.0, // Al
    gramsR2: 200.0, // CuO
    actualGrams: 132.0,
    productFormula: 'Cu',
    context:
      'Álhvarfið, og fyrsta dæmið hér með tveimur myndefnum. Þá þarf að segja hvort þú vigtar — hér er það koparinn, ekki áloxíðið, og fræðilegar heimtur eru ekki þær sömu fyrir bæði.',
  },
];

export const YIELD_PROBLEMS: YieldProblem[] = ORDER.map((p) => {
  const reaction = by(p.reactionId);
  const productFormula = p.productFormula ?? reaction.products[0].formula;
  const result = solveMassYield(reaction, p.gramsR1, p.gramsR2, p.actualGrams, productFormula);
  if (result.percent > MAX_SENSIBLE_PERCENT) {
    throw new RangeError(
      `${p.id}: raunheimtur (${p.actualGrams} g) eru meiri en fræðilegar heimtur ` +
        `(${result.theoreticalGrams.toFixed(2)} g), sem er ${result.percent.toFixed(1)} %. ` +
        `Lækkaðu actualGrams.`
    );
  }
  return { ...p, reaction, productFormula, result };
});

/** The molar masses a student needs, so the screen can print the table. */
export function molarMassTable(problem: YieldProblem): { formula: string; mass: number }[] {
  return [
    problem.reaction.reactant1.formula,
    problem.reaction.reactant2.formula,
    problem.productFormula,
  ].map((formula) => ({ formula, mass: molarMassOf(formula) }));
}
