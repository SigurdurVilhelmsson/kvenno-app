// Chemical compounds database
import { ELEMENTS } from './elements';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface CompoundElement {
  symbol: string;
  count: number;
}

/**
 * State at STP (273,15 K, 1 atm), describing the substance **as this game names
 * it** — which is not always the same as the bare formula.
 *
 * It exists so the molar-volume question can only be asked about a gas. One mole
 * of anything occupies 22,4 L only if it is a gas; asking for the volume of a
 * mole of table salt is the same class of defect as `lausnir` asking a student
 * to weigh out a gas, which was fixed in August 2026.
 */
export type CompoundState = 'gas' | 'vökvi' | 'fast';

export interface Compound {
  formula: string;
  name: string;
  elements: CompoundElement[];
  /** State at STP. See `CompoundState`. */
  state: CompoundState;
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
/**
 * Standard molar volume: one mole of an ideal gas at STP occupies 22,4 L.
 *
 * STP here is 273,15 K and **1 atm**, which is what the school's textbook uses —
 * it notes that IUPAC moved standard pressure to 1 bar in 1982 and then says
 * plainly that the earlier definition "verður notuð í þessum texta". At 1 bar the
 * figure would be 22,7 L/mól, so the condition is not decoration: it is stated
 * everywhere this constant is shown to a student.
 */
export const STANDARD_MOLAR_VOLUME = 22.4;

/** The conditions the constant above is quoted at, for any string that shows it. */
export const STP_LABEL = 'STP (0 °C og 1 atm)';

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
    state: 'vökvi',
    name: 'Vatn',
    elements: [
      { symbol: 'H', count: 2 },
      { symbol: 'O', count: 1 },
    ],
    difficulty: 'easy',
  },
  {
    formula: 'NaCl',
    state: 'fast',
    name: 'Borðsalt',
    elements: [
      { symbol: 'Na', count: 1 },
      { symbol: 'Cl', count: 1 },
    ],
    difficulty: 'easy',
  },
  {
    formula: 'O₂',
    name: 'Súrefni',
    elements: [{ symbol: 'O', count: 2 }],
    state: 'gas',
    difficulty: 'easy',
  },
  {
    formula: 'N₂',
    state: 'gas',
    name: 'Köfnunarefni',
    elements: [{ symbol: 'N', count: 2 }],
    difficulty: 'easy',
  },
  {
    formula: 'CH₄',
    state: 'gas',
    name: 'Metan',
    elements: [
      { symbol: 'C', count: 1 },
      { symbol: 'H', count: 4 },
    ],
    difficulty: 'easy',
  },
  {
    formula: 'C₂H₆',
    state: 'gas',
    name: 'Etan',
    elements: [
      { symbol: 'C', count: 2 },
      { symbol: 'H', count: 6 },
    ],
    difficulty: 'easy',
  },
  {
    formula: 'C₃H₈',
    state: 'gas',
    name: 'Própan',
    elements: [
      { symbol: 'C', count: 3 },
      { symbol: 'H', count: 8 },
    ],
    difficulty: 'easy',
  },
  {
    formula: 'CO₂',
    state: 'gas',
    name: 'Koldíoxíð',
    elements: [
      { symbol: 'C', count: 1 },
      { symbol: 'O', count: 2 },
    ],
    difficulty: 'easy',
  },
  {
    formula: 'NH₃',
    state: 'gas',
    name: 'Ammóníak',
    elements: [
      { symbol: 'N', count: 1 },
      { symbol: 'H', count: 3 },
    ],
    difficulty: 'easy',
  },
  {
    formula: 'HCl',
    state: 'vökvi',
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
    state: 'vökvi',
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
    state: 'vökvi',
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
    state: 'fast',
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
    state: 'fast',
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
    state: 'fast',
    name: 'Kalíumklóríð',
    elements: [
      { symbol: 'K', count: 1 },
      { symbol: 'Cl', count: 1 },
    ],
    difficulty: 'medium',
  },
  {
    formula: 'MgSO₄',
    state: 'fast',
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
    state: 'fast',
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
    state: 'vökvi',
    name: 'Vetnisperoxíð',
    elements: [
      { symbol: 'H', count: 2 },
      { symbol: 'O', count: 2 },
    ],
    difficulty: 'medium',
  },
  {
    formula: 'C₆H₁₂O₆',
    state: 'fast',
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
    state: 'vökvi',
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
    state: 'fast',
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
    state: 'fast',
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
    state: 'fast',
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
    state: 'fast',
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
    state: 'fast',
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
    state: 'fast',
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
    state: 'fast',
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
    state: 'fast',
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
    state: 'fast',
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
