import { shuffleArray } from '@shared/utils';

import {
  ANIONS,
  CATIONS,
  formulaOf,
  ionLabel as label,
  lowestCounts,
  type Ion,
  type NameToFormulaItem,
} from '../data/ions';

export type Verdict = 'right' | 'cation' | 'anion' | 'charge' | 'lowest';

/**
 * What is wrong with a built formula, the first thing that is: the ions before
 * the counts, since counts for the wrong ions mean nothing, and a charge that
 * does not cancel before a ratio that is not the lowest.
 */
export function judgeFormula(
  item: NameToFormulaItem,
  cation: Ion,
  anion: Ion,
  cationCount: number,
  anionCount: number
): Verdict {
  if (cation.id !== item.cation.id) return 'cation';
  if (anion.id !== item.anion.id) return 'anion';
  if (cation.charge * cationCount + anion.charge * anionCount !== 0) return 'charge';
  const lowest = lowestCounts(cation, anion);
  if (cationCount !== lowest.cation || anionCount !== lowest.anion) return 'lowest';
  return 'right';
}

/** The sentence under the verdict, saying what the name or the charges tell. */
export function explainVerdict(
  verdict: Verdict,
  item: NameToFormulaItem,
  cationCount: number,
  anionCount: number
): string {
  const { cation, anion } = item;
  const lowest = lowestCounts(cation, anion);
  const answer = formulaOf(cation, anion);
  const sum = `${lowest.cation} × (${signed(cation.charge)}) + ${lowest.anion} × (${signed(anion.charge)}) = 0`;
  switch (verdict) {
    case 'right':
      return `${item.compound.name} er ${answer}: ${sum}.`;
    case 'cation':
      return cation.name.includes('(')
        ? `Rómverska talan í „${cation.name}“ er hleðsla málmjónarinnar, svo jónin er ${label(cation)}.`
        : `„${cation.name}“ er jónin ${label(cation)}.`;
    case 'anion':
      return `„-${anion.name}“ er jónin ${label(anion)}.`;
    case 'charge': {
      const total = cation.charge * cationCount + anion.charge * anionCount;
      // Says what is wrong, not the counts: the student can still find them.
      return `Hleðslurnar eru samtals ${signed(total)}, en jónaefni er óhlaðið. Breyttu fjöldanum svo þær núllist.`;
    }
    case 'lowest':
      return `Hleðslurnar núllast, en formúla jónaefnis notar lægstu heilu tölurnar: ${answer}.`;
  }
}

function signed(n: number): string {
  return n > 0 ? `+${n}` : `−${-n}`;
}

/**
 * Four ions to choose from: the right one, the same metal at its other charge
 * where the game has one (Fe²⁺ beside Fe³⁺), and others drawn at random.
 */
export function ionChoices(right: Ion, all: Ion[] = right.charge > 0 ? CATIONS : ANIONS): Ion[] {
  const twin = all.filter((i) => i.id !== right.id && i.symbol === right.symbol);
  const rest = shuffleArray(all.filter((i) => i.id !== right.id && i.symbol !== right.symbol));
  return shuffleArray([right, ...twin, ...rest].slice(0, 4));
}
