// Chemical compounds database
import { ELEMENTS } from './elements';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface CompoundElement {
  symbol: string;
  count: number;
}

export interface Compound {
  formula: string;
  name: string;
  elements: CompoundElement[];
  /**
   * Summed from `elements` and the atomic masses in `elements.ts` — never authored.
   *
   * It used to be typed in by hand alongside the element list, computed from more
   * precise atomic masses than the table this game shows a student. On 12 of the
   * 29 compounds the two disagreed, so `CalculationBreakdown` printed per-element
   * lines that did not sum to the total printed underneath them — in the one game
   * whose entire skill is summing element masses. Al₂(SO₄)₃ was the worst: the
   * lines came to 342,132 and the total said 342,151.
   *
   * Deriving it makes that disagreement impossible rather than merely fixed. It
   * also means the answer key is the number a student reaches by doing exactly
   * what the game teaches, with the periodic table the game gives them — which
   * matters more here than the last two decimal places of absolute accuracy.
   */
  molarMass: number;
  difficulty: Difficulty;
}

/** Authored shape: the total is derived, so it is not written by hand. */
type CompoundDefinition = Omit<Compound, 'molarMass'>;

function atomicMassOf(symbol: string): number {
  const element = ELEMENTS.find((e) => e.symbol === symbol);
  if (!element) {
    throw new Error(`Óþekkt frumefni í efnasambandi: ${symbol}`);
  }
  return element.atomicMass;
}

/** The total a student gets by summing the printed lines, because it is that sum. */
export function molarMassOf(elements: CompoundElement[]): number {
  return elements.reduce((sum, e) => sum + e.count * atomicMassOf(e.symbol), 0);
}

const withMolarMass = (c: CompoundDefinition): Compound => ({
  ...c,
  molarMass: molarMassOf(c.elements),
});

const DEFINITIONS: CompoundDefinition[] = [
  // Easy - Real-world chemicals students know
  {
    formula: 'H₂O',
    name: 'Vatn',
    elements: [
      { symbol: 'H', count: 2 },
      { symbol: 'O', count: 1 },
    ],
    difficulty: 'easy',
  },
  {
    formula: 'NaCl',
    name: 'Borðsalt',
    elements: [
      { symbol: 'Na', count: 1 },
      { symbol: 'Cl', count: 1 },
    ],
    difficulty: 'easy',
  },
  { formula: 'O₂', name: 'Súrefni', elements: [{ symbol: 'O', count: 2 }], difficulty: 'easy' },
  {
    formula: 'N₂',
    name: 'Köfnunarefni',
    elements: [{ symbol: 'N', count: 2 }],
    difficulty: 'easy',
  },
  {
    formula: 'CH₄',
    name: 'Metan',
    elements: [
      { symbol: 'C', count: 1 },
      { symbol: 'H', count: 4 },
    ],
    difficulty: 'easy',
  },
  {
    formula: 'C₂H₆',
    name: 'Etan',
    elements: [
      { symbol: 'C', count: 2 },
      { symbol: 'H', count: 6 },
    ],
    difficulty: 'easy',
  },
  {
    formula: 'C₃H₈',
    name: 'Própan',
    elements: [
      { symbol: 'C', count: 3 },
      { symbol: 'H', count: 8 },
    ],
    difficulty: 'easy',
  },
  {
    formula: 'CO₂',
    name: 'Koldíoxíð',
    elements: [
      { symbol: 'C', count: 1 },
      { symbol: 'O', count: 2 },
    ],
    difficulty: 'easy',
  },
  {
    formula: 'NH₃',
    name: 'Ammóníak',
    elements: [
      { symbol: 'N', count: 1 },
      { symbol: 'H', count: 3 },
    ],
    difficulty: 'easy',
  },
  {
    formula: 'HCl',
    name: 'Saltsýra',
    elements: [
      { symbol: 'H', count: 1 },
      { symbol: 'Cl', count: 1 },
    ],
    difficulty: 'easy',
  },

  // Medium - Common chemicals in labs and household
  {
    formula: 'C₂H₅OH',
    name: 'Etanól',
    elements: [
      { symbol: 'C', count: 2 },
      { symbol: 'H', count: 6 },
      { symbol: 'O', count: 1 },
    ],
    difficulty: 'medium',
  },
  {
    formula: 'CH₃COOH',
    name: 'Ediksýra',
    elements: [
      { symbol: 'C', count: 2 },
      { symbol: 'H', count: 4 },
      { symbol: 'O', count: 2 },
    ],
    difficulty: 'medium',
  },
  {
    formula: 'NaOH',
    name: 'Natríumhýdroxíð',
    elements: [
      { symbol: 'Na', count: 1 },
      { symbol: 'O', count: 1 },
      { symbol: 'H', count: 1 },
    ],
    difficulty: 'medium',
  },
  {
    formula: 'CaCO₃',
    name: 'Kalsíumkarbónat',
    elements: [
      { symbol: 'Ca', count: 1 },
      { symbol: 'C', count: 1 },
      { symbol: 'O', count: 3 },
    ],
    difficulty: 'medium',
  },
  {
    formula: 'KCl',
    name: 'Kalíumklóríð',
    elements: [
      { symbol: 'K', count: 1 },
      { symbol: 'Cl', count: 1 },
    ],
    difficulty: 'medium',
  },
  {
    formula: 'MgSO₄',
    name: 'Magnesíumsúlfat',
    elements: [
      { symbol: 'Mg', count: 1 },
      { symbol: 'S', count: 1 },
      { symbol: 'O', count: 4 },
    ],
    difficulty: 'medium',
  },
  {
    formula: 'NaHCO₃',
    name: 'Matarsódi',
    elements: [
      { symbol: 'Na', count: 1 },
      { symbol: 'H', count: 1 },
      { symbol: 'C', count: 1 },
      { symbol: 'O', count: 3 },
    ],
    difficulty: 'medium',
  },
  {
    formula: 'H₂O₂',
    name: 'Vetnisperoxíð',
    elements: [
      { symbol: 'H', count: 2 },
      { symbol: 'O', count: 2 },
    ],
    difficulty: 'medium',
  },
  {
    formula: 'C₆H₁₂O₆',
    name: 'Glúkósi',
    elements: [
      { symbol: 'C', count: 6 },
      { symbol: 'H', count: 12 },
      { symbol: 'O', count: 6 },
    ],
    difficulty: 'medium',
  },
  {
    formula: 'H₂SO₄',
    name: 'Brennisteinssýra',
    elements: [
      { symbol: 'H', count: 2 },
      { symbol: 'S', count: 1 },
      { symbol: 'O', count: 4 },
    ],
    difficulty: 'medium',
  },

  // Hard - Complex molecules and hydrates
  {
    formula: 'C₆H₅OH',
    name: 'Fenól',
    elements: [
      { symbol: 'C', count: 6 },
      { symbol: 'H', count: 6 },
      { symbol: 'O', count: 1 },
    ],
    difficulty: 'hard',
  },
  {
    formula: 'C₁₂H₂₂O₁₁',
    name: 'Súkrósi/Sykur',
    elements: [
      { symbol: 'C', count: 12 },
      { symbol: 'H', count: 22 },
      { symbol: 'O', count: 11 },
    ],
    difficulty: 'hard',
  },
  {
    formula: 'MgSO₄·7H₂O',
    name: 'Magnesíumsúlfat heptahýdrat',
    elements: [
      { symbol: 'Mg', count: 1 },
      { symbol: 'S', count: 1 },
      { symbol: 'O', count: 11 },
      { symbol: 'H', count: 14 },
    ],
    difficulty: 'hard',
  },
  {
    formula: 'Na₂CO₃·10H₂O',
    name: 'Þvottasódi',
    elements: [
      { symbol: 'Na', count: 2 },
      { symbol: 'C', count: 1 },
      { symbol: 'O', count: 13 },
      { symbol: 'H', count: 20 },
    ],
    difficulty: 'hard',
  },
  {
    formula: 'FeSO₄·7H₂O',
    name: 'Járn(II)súlfat heptahýdrat',
    elements: [
      { symbol: 'Fe', count: 1 },
      { symbol: 'S', count: 1 },
      { symbol: 'O', count: 11 },
      { symbol: 'H', count: 14 },
    ],
    difficulty: 'hard',
  },
  {
    formula: '(NH₄)₃PO₄',
    name: 'Ammóníumfosfat',
    elements: [
      { symbol: 'N', count: 3 },
      { symbol: 'H', count: 12 },
      { symbol: 'P', count: 1 },
      { symbol: 'O', count: 4 },
    ],
    difficulty: 'hard',
  },
  {
    formula: 'Al₂(SO₄)₃',
    name: 'Álsúlfat',
    elements: [
      { symbol: 'Al', count: 2 },
      { symbol: 'S', count: 3 },
      { symbol: 'O', count: 12 },
    ],
    difficulty: 'hard',
  },
  {
    formula: 'Ca₃(PO₄)₂',
    name: 'Kalsíumfosfat',
    elements: [
      { symbol: 'Ca', count: 3 },
      { symbol: 'P', count: 2 },
      { symbol: 'O', count: 8 },
    ],
    difficulty: 'hard',
  },
  {
    formula: 'CuSO₄·5H₂O',
    name: 'Kopar(II)súlfat pentahýdrat',
    elements: [
      { symbol: 'Cu', count: 1 },
      { symbol: 'S', count: 1 },
      { symbol: 'O', count: 9 },
      { symbol: 'H', count: 10 },
    ],
    difficulty: 'hard',
  },
];

export const COMPOUNDS: Compound[] = DEFINITIONS.map(withMolarMass);

// Helper functions
export function getCompoundsByDifficulty(difficulty: Difficulty): Compound[] {
  return COMPOUNDS.filter((c) => c.difficulty === difficulty);
}

export function getRandomCompound(difficulty: Difficulty | 'mixed' = 'mixed'): Compound {
  if (difficulty === 'mixed') {
    return COMPOUNDS[Math.floor(Math.random() * COMPOUNDS.length)];
  }
  const filtered = getCompoundsByDifficulty(difficulty);
  return filtered[Math.floor(Math.random() * filtered.length)];
}
