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
  /** The name as a label shows it, capitalised and in the nominative. */
  name: string;
  /**
   * The name as it reads mid-sentence after `af`, which governs the dative:
   * `í 25 g af vatni`, never `af Vatn`. Lower case, except a Roman numeral,
   * which is why this is written out rather than made with `toLowerCase()`.
   *
   * Every question template in Stig 2 and 3 puts the name after `af`, and they
   * interpolated `name` itself, so they read `af Köfnunarefni` and `af
   * Þvottasódi`. A case in Icelandic is not a string operation, so the forms
   * belong in the data — the same fix `3-ar/syrufastinn` made for its acids.
   * A hydrate declines its head noun only: `kopar(II)súlfat pentahýdrati`.
   */
  nameDative: string;
  /** The name after `Mólmassi`, which takes the genitive: `Mólmassi vatns`. */
  nameGenitive: string;
  /**
   * An ionic compound is counted in formula units, not molecules: a crystal of
   * NaCl holds no NaCl molecule. The textbook's mole section says `sameindir eða
   * formúlueiningar`, and Stig 3 already made the distinction for NaCl and NaOH
   * while Stig 2 asked for the `sameindir` in a mole of table salt.
   */
  ionic: boolean;
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
    nameDative: 'vatni',
    nameGenitive: 'vatns',
    ionic: false,
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
    nameDative: 'borðsalti',
    nameGenitive: 'borðsalts',
    ionic: true,
    elements: [
      { symbol: 'Na', count: 1 },
      { symbol: 'Cl', count: 1 },
    ],
    difficulty: 'easy',
  },
  {
    formula: 'O₂',
    name: 'Súrefni',
    nameDative: 'súrefni',
    nameGenitive: 'súrefnis',
    ionic: false,
    elements: [{ symbol: 'O', count: 2 }],
    state: 'gas',
    difficulty: 'easy',
  },
  {
    formula: 'N₂',
    state: 'gas',
    name: 'Köfnunarefni',
    nameDative: 'köfnunarefni',
    nameGenitive: 'köfnunarefnis',
    ionic: false,
    elements: [{ symbol: 'N', count: 2 }],
    difficulty: 'easy',
  },
  {
    formula: 'CH₄',
    state: 'gas',
    name: 'Metan',
    nameDative: 'metani',
    nameGenitive: 'metans',
    ionic: false,
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
    nameDative: 'etani',
    nameGenitive: 'etans',
    ionic: false,
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
    nameDative: 'própani',
    nameGenitive: 'própans',
    ionic: false,
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
    nameDative: 'koldíoxíði',
    nameGenitive: 'koldíoxíðs',
    ionic: false,
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
    nameDative: 'ammóníaki',
    nameGenitive: 'ammóníaks',
    ionic: false,
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
    nameDative: 'saltsýru',
    nameGenitive: 'saltsýru',
    ionic: false,
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
    nameDative: 'etanóli',
    nameGenitive: 'etanóls',
    ionic: false,
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
    nameDative: 'ediksýru',
    nameGenitive: 'ediksýru',
    ionic: false,
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
    nameDative: 'natríumhýdroxíði',
    nameGenitive: 'natríumhýdroxíðs',
    ionic: true,
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
    nameDative: 'kalsíumkarbónati',
    nameGenitive: 'kalsíumkarbónats',
    ionic: true,
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
    nameDative: 'kalíumklóríði',
    nameGenitive: 'kalíumklóríðs',
    ionic: true,
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
    nameDative: 'magnesíumsúlfati',
    nameGenitive: 'magnesíumsúlfats',
    ionic: true,
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
    nameDative: 'matarsóda',
    nameGenitive: 'matarsóda',
    ionic: true,
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
    nameDative: 'vetnisperoxíði',
    nameGenitive: 'vetnisperoxíðs',
    ionic: false,
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
    nameDative: 'glúkósa',
    nameGenitive: 'glúkósa',
    ionic: false,
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
    nameDative: 'brennisteinssýru',
    nameGenitive: 'brennisteinssýru',
    ionic: false,
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
    nameDative: 'fenóli',
    nameGenitive: 'fenóls',
    ionic: false,
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
    nameDative: 'súkrósa/sykri',
    nameGenitive: 'súkrósa/sykurs',
    ionic: false,
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
    nameDative: 'magnesíumsúlfat heptahýdrati',
    nameGenitive: 'magnesíumsúlfat heptahýdrats',
    ionic: true,
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
    nameDative: 'þvottasóda',
    nameGenitive: 'þvottasóda',
    ionic: true,
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
    nameDative: 'járn(II)súlfat heptahýdrati',
    nameGenitive: 'járn(II)súlfat heptahýdrats',
    ionic: true,
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
    nameDative: 'ammóníumfosfati',
    nameGenitive: 'ammóníumfosfats',
    ionic: true,
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
    nameDative: 'álsúlfati',
    nameGenitive: 'álsúlfats',
    ionic: true,
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
    nameDative: 'kalsíumfosfati',
    nameGenitive: 'kalsíumfosfats',
    ionic: true,
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
    nameDative: 'kopar(II)súlfat pentahýdrati',
    nameGenitive: 'kopar(II)súlfat pentahýdrats',
    ionic: true,
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
