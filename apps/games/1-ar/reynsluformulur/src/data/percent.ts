/**
 * Prósentusamsetning — the first part of Æfa, before the empirical formula.
 *
 * Siggi's ruling, 2026-11-15 (year-1 plan, decision 3): percent composition goes here, as a
 * drilled step before the empirical formula, because that is the book's order. `ch03/m68702`
 * opens with it ("Reiknað út prósentusamsetningu efnasambands") and then turns it round to
 * find a formula from percentages, which is the rest of this game.
 *
 * The three compounds are the book's own: ammonia, its first example (82,24 % N); iron(III)
 * oxide, its check-your-learning (69,9 % Fe); and aspirin, its worked example (C₉H₈O₄). As
 * everywhere in this game, a compound is written as its formula and every number is derived:
 * the mass of each element in one mole, the molar mass and the percentages.
 */

import { ATOMIC_MASSES, type ElementSymbol } from './elements';
import { formatFormula } from '../engine/empirical';

export interface PercentRow {
  element: ElementSymbol;
  subscript: number;
  /** Atomic mass, g/mól. */
  atomicMass: number;
  /** Grams of the element in one mole of the compound: subscript × atomic mass. */
  mass: number;
  /** Mass percent: mass ÷ molar mass × 100. */
  percent: number;
}

export interface PercentItem {
  id: string;
  name: string;
  formula: string;
  rows: PercentRow[];
  /** g/mól, the sum of the masses. */
  molarMass: number;
  context: string;
}

const SOURCES: {
  id: string;
  name: string;
  counts: { element: ElementSymbol; subscript: number }[];
  context: string;
}[] = [
  {
    id: 'ammoniak',
    name: 'Ammóníak',
    counts: [
      { element: 'N', subscript: 1 },
      { element: 'H', subscript: 3 },
    ],
    context:
      'Fyrsta dæmi kennslubókarinnar: nitur er virka efnið í áburði, svo massaprósenta niturs segir hve mikið bóndinn fær fyrir peninginn.',
  },
  {
    id: 'jarn3oxid',
    name: 'Járn(III)oxíð',
    counts: [
      { element: 'Fe', subscript: 2 },
      { element: 'O', subscript: 3 },
    ],
    context: 'Ryð, og æfingadæmi bókarinnar: járnið er tæp 70 % af massanum.',
  },
  {
    id: 'asperin',
    name: 'Asperín',
    counts: [
      { element: 'C', subscript: 9 },
      { element: 'H', subscript: 8 },
      { element: 'O', subscript: 4 },
    ],
    context:
      'Sýnidæmi bókarinnar. Prósenturnar leggjast saman í 100 %, sem er gott að athuga í lokin.',
  },
];

export const PERCENT_ITEMS: PercentItem[] = SOURCES.map((s) => {
  const masses = s.counts.map((c) => ({
    ...c,
    atomicMass: ATOMIC_MASSES[c.element],
    mass: ATOMIC_MASSES[c.element] * c.subscript,
  }));
  const molarMass = masses.reduce((sum, m) => sum + m.mass, 0);
  return {
    id: s.id,
    name: s.name,
    formula: formatFormula(s.counts),
    rows: masses.map((m) => ({ ...m, percent: (m.mass / molarMass) * 100 })),
    molarMass,
    context: s.context,
  };
});
