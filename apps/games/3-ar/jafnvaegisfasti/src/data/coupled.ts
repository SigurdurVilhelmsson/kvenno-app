/**
 * Tengd jafnvægi — coupled equilibria.
 *
 * The book's three operations (`ch13/m68798`): reverse an equation and K
 * becomes 1/K; multiply it through by n and K becomes Kⁿ; add two equations
 * and the K values multiply.
 *
 * **Nothing here stores a combined K.** A problem names the equations a
 * student is handed and the equation they are asked about; the route between
 * them is *found* by `findCoupledRoute` at module load and the K falls out of
 * the operations. So a problem whose target cannot be reached from its givens
 * throws on import rather than shipping — `1-ar/nafnakerfid` shipped 33
 * compounds its own answer tray could not spell, and an author's assertion
 * that a problem is solvable is not evidence that it is.
 *
 * **No new constant was needed for any of this.** The single-operation
 * problems transform a constant the game already sources, and a transformed K
 * is derived rather than quoted. The two combination problems are the book's
 * own worked example and its check-your-learning, whose givens are cited like
 * everything else in `reactions.ts`.
 */

import {
  applyCoupledSteps,
  findCoupledRoute,
  type CoupledStep,
  type Reaction,
  type Species,
} from '@shared/engine/equilibrium';

import { reactionBy } from './reactions';

const g = (formula: string, coefficient = 1): Species => ({ formula, coefficient, phase: 'g' });

export interface CoupledProblem {
  id: string;
  /** The equations the student is handed, each with its own sourced K. */
  givens: Reaction[];
  /** The equation asked about. The question, not the answer. */
  target: Reaction;
  /** Which of the three rules this one is for. */
  rules: ('snua' | 'margfalda' | 'leggja')[];
  context: string;
  /** Derived: the operations that get there, and the constant that results. */
  route: CoupledStep[];
  result: Reaction;
}

/** A target equation, written out so the question can be asked. */
function target(
  id: string,
  name: string,
  reactants: Species[],
  products: Species[],
  from: Reaction
): Reaction {
  return { id, name, reactants, products, source: from.source };
}

const ORDER: Omit<CoupledProblem, 'route' | 'result'>[] = [
  {
    id: 'snua-ammoniak',
    givens: [reactionBy('ammoniak')],
    target: target(
      'ammoniak-klofnun',
      'Klofnun ammóníaks',
      [g('NH₃', 2)],
      [g('N₂'), g('H₂', 3)],
      reactionBy('ammoniak')
    ),
    rules: ['snua'],
    context:
      'Ein aðgerð, og hún er sú einfaldasta: sama jafnan lesin aftur á bak. Hvarfefnin og myndefnin skipta um hlutverk, svo stæðan fer á hvolf og K verður umhverfa sín.',
  },
  {
    id: 'snua-no2',
    givens: [reactionBy('no2-n2o4')],
    target: target(
      'n2o4-klofnun',
      'Klofnun díniturtetroxíðs',
      [g('N₂O₄')],
      [g('NO₂', 2)],
      reactionBy('no2-n2o4')
    ),
    rules: ['snua'],
    context:
      'Sama aðgerð á kerfi sem þú hittir aftur í Hliðrun jafnvægis. Takið eftir hvað stór K verður lítið þegar honum er snúið við: 1,6 × 10² verður 6,3 × 10⁻³, og hvorug talan segir neitt annað en hin.',
  },
  {
    id: 'margfalda-vetnisjodid',
    givens: [reactionBy('vetnisjodid')],
    target: target(
      'vetnisjodid-tvofalt',
      'Myndun vetnisjoðíðs, tvöfölduð jafna',
      [g('H₂', 2), g('I₂', 2)],
      [g('HI', 4)],
      reactionBy('vetnisjodid')
    ),
    rules: ['margfalda'],
    context:
      'Stuðlarnir tvöfaldast, svo hver liður í stæðunni fer í annað veldi og K fer í annað veldi með þeim. Þetta er ástæðan fyrir því að K er marklaus tala án jöfnunnar sem hann á við: sama efnahvarfið, tvær réttar jöfnur, tveir ólíkir fastar.',
  },
  {
    id: 'ammoniak-jod',
    givens: [reactionBy('ammoniak'), reactionBy('vetnisjodid')],
    target: target(
      'ammoniak-jod-heild',
      'Ammóníak og joð við 400 °C',
      [g('NH₃', 2), g('I₂', 3)],
      [g('N₂'), g('HI', 6)],
      reactionBy('ammoniak')
    ),
    rules: ['snua', 'margfalda', 'leggja'],
    context:
      'Sýnidæmi bókarinnar, og það notar allar þrjár aðgerðirnar. Vetnið kemur hvergi fram í heildarjöfnunni — 3H₂ stendur sitt hvorum megin eftir að jöfnurnar eru lagðar saman og styttist út.',
  },
  {
    id: 'kobolt',
    givens: [reactionBy('kobolt-koloxid'), reactionBy('kobolt-vetni')],
    target: target(
      'vatnsgas-bakhvarf-550',
      'Vatnsgashvarfið afturábak við 550 °C',
      [g('H₂'), g('CO₂')],
      [g('CO'), g('H₂O')],
      reactionBy('kobolt-koloxid')
    ),
    rules: ['snua', 'leggja'],
    context:
      'Föstu efnin eru það sem styttist út hér: CoO og Co standa sitt hvorum megin eftir að jöfnunum er snúið og þær lagðar saman, og hvorugt var í K hvort eð er. Eftir stendur vatnsgashvarfið afturábak — sama jafna og Vatnsgashvarfið í þessum leik, en við 550 °C í stað 800 °C, og fastarnir tveir eru gjörólíkir. Það er ekki ósamræmi: K er háður hitastigi.',
  },
];

export const COUPLED_PROBLEMS: CoupledProblem[] = ORDER.map((problem) => {
  const route = findCoupledRoute(problem.givens, problem.target);
  if (route === null) {
    throw new RangeError(
      `${problem.id}: engin leið fannst frá gefnu jöfnunum að markjöfnunni. ` +
        `Annaðhvort er markjafnan röng eða gefnu jöfnurnar duga ekki.`
    );
  }
  return {
    ...problem,
    route,
    result: applyCoupledSteps(route, problem.target.id, problem.target.name),
  };
});

/** The single-equation problems come first: one rule at a time, then both. */
export const SINGLE_STEP_PROBLEMS = COUPLED_PROBLEMS.filter((p) => p.givens.length === 1);
export const COMBINATION_PROBLEMS = COUPLED_PROBLEMS.filter((p) => p.givens.length > 1);
