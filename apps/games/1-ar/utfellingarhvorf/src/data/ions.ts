/**
 * The ions Útfellingarhvörf works with, and the school's own solubility table.
 *
 * **The table is transcribed from the school's textbook**, not from the old
 * repo's game — `books/efnafraedi-2e/02-mt-output/ch04/m68710-segments.is.md`,
 * the two-part "Leysanleg jónaefni" / "Óleysanleg jónaefni" table. That matters,
 * because the old `jonir-i-lausn` carried a six-rule paraphrase of it that
 * differs in four places, and one of those differences is what made its own
 * Ag₂CrO₄ question unanswerable:
 *
 *  - it had **no chromate rule at all**, while testing a chromate precipitate;
 *  - its sulfate exceptions omitted **Ag⁺ and Hg₂²⁺**;
 *  - its hydroxide exceptions included **Ca²⁺**, which the book does not list;
 *  - it had no rule for **F⁻**, acetate, bicarbonate or chlorate.
 *
 * Nothing here stores a compound's solubility. `solubility()` in the engine
 * derives it from this table, so a verdict cannot disagree with the rule printed
 * beside it, and `rules.test.ts` asserts every anion in `IONS` is covered by
 * some rule — which is the Ag₂CrO₄ defect made structurally impossible rather
 * than patched.
 */

/** A cation or an anion, with the charge that decides every formula. */
export interface Ion {
  /** `Ag⁺`, `SO₄²⁻` — as written, with Unicode super/subscripts. */
  formula: string;
  /** Signed: +1, +2, −1, −2, −3. */
  charge: number;
  /** Icelandic name, nominative. */
  name: string;
  /**
   * True for ions that need brackets when they carry a subscript:
   * `Ca₃(PO₄)₂`, not `Ca₃PO₄₂`.
   */
  polyatomic: boolean;
}

/**
 * Group-1 cations plus ammonium — the one row of the table with no exceptions
 * anywhere, and the reason `Na₂CO₃` is soluble while `CaCO₃` is not.
 */
export const ALWAYS_SOLUBLE_CATIONS = ['Li⁺', 'Na⁺', 'K⁺', 'Rb⁺', 'Cs⁺', 'NH₄⁺'] as const;

export const CATIONS: Ion[] = [
  { formula: 'Na⁺', charge: 1, name: 'natríumjón', polyatomic: false },
  { formula: 'K⁺', charge: 1, name: 'kalíumjón', polyatomic: false },
  { formula: 'Li⁺', charge: 1, name: 'litíumjón', polyatomic: false },
  { formula: 'Rb⁺', charge: 1, name: 'rúbidíumjón', polyatomic: false },
  { formula: 'Cs⁺', charge: 1, name: 'sesíumjón', polyatomic: false },
  { formula: 'NH₄⁺', charge: 1, name: 'ammóníumjón', polyatomic: true },
  { formula: 'Ag⁺', charge: 1, name: 'silfurjón', polyatomic: false },
  { formula: 'Mg²⁺', charge: 2, name: 'magnesíumjón', polyatomic: false },
  { formula: 'Ca²⁺', charge: 2, name: 'kalsíumjón', polyatomic: false },
  { formula: 'Ba²⁺', charge: 2, name: 'baríumjón', polyatomic: false },
  { formula: 'Sr²⁺', charge: 2, name: 'strontíumjón', polyatomic: false },
  { formula: 'Pb²⁺', charge: 2, name: 'blý(II)jón', polyatomic: false },
  { formula: 'Cu²⁺', charge: 2, name: 'kopar(II)jón', polyatomic: false },
  { formula: 'Ni²⁺', charge: 2, name: 'nikkel(II)jón', polyatomic: false },
  { formula: 'Zn²⁺', charge: 2, name: 'sinkjón', polyatomic: false },
  { formula: 'Fe³⁺', charge: 3, name: 'járn(III)jón', polyatomic: false },
];

export const ANIONS: Ion[] = [
  { formula: 'NO₃⁻', charge: -1, name: 'nítratjón', polyatomic: true },
  { formula: 'Cl⁻', charge: -1, name: 'klóríðjón', polyatomic: false },
  { formula: 'Br⁻', charge: -1, name: 'brómíðjón', polyatomic: false },
  { formula: 'I⁻', charge: -1, name: 'joðíðjón', polyatomic: false },
  { formula: 'F⁻', charge: -1, name: 'flúoríðjón', polyatomic: false },
  { formula: 'OH⁻', charge: -1, name: 'hýdroxíðjón', polyatomic: true },
  { formula: 'SO₄²⁻', charge: -2, name: 'súlfatjón', polyatomic: true },
  { formula: 'CO₃²⁻', charge: -2, name: 'karbónatjón', polyatomic: true },
  { formula: 'CrO₄²⁻', charge: -2, name: 'krómatjón', polyatomic: true },
  { formula: 'S²⁻', charge: -2, name: 'súlfíðjón', polyatomic: false },
  { formula: 'PO₄³⁻', charge: -3, name: 'fosfatjón', polyatomic: true },
];

/**
 * One row of the school's table.
 *
 * `ion` is the ion the row is about, `soluble` is the row's verdict, and
 * `exceptions` are the counter-ions that flip it. A row with an empty
 * `exceptions` array is one of the book's "engar" rows.
 */
export interface SolubilityRule {
  id: string;
  /** The ion this row is keyed on. */
  ion: string;
  /** Other ions the same book row covers, so one rule can serve the halides. */
  alsoCovers: string[];
  soluble: boolean;
  /** Counter-ions that reverse the verdict. */
  exceptions: string[];
  /** Icelandic, as a student reads it. */
  text: string;
  exceptionText: string;
}

/**
 * The table, in the book's own order: the soluble rows first, then the
 * insoluble ones.
 *
 * The cation row comes first and is checked first, because it is the row with
 * no exceptions — every other row lists group 1 and ammonium among its own
 * exceptions, so putting it first makes those redundant rather than
 * contradictory.
 */
export const SOLUBILITY_RULES: SolubilityRule[] = [
  {
    id: 'flokkur1',
    ion: 'NH₄⁺',
    alsoCovers: ['Li⁺', 'Na⁺', 'K⁺', 'Rb⁺', 'Cs⁺'],
    soluble: true,
    exceptions: [],
    text: 'Öll sölt með NH₄⁺ eða katjón úr flokki 1 (Li⁺, Na⁺, K⁺, Rb⁺, Cs⁺) eru leysanleg.',
    exceptionText: 'Engar undantekningar.',
  },
  {
    id: 'nitrot',
    ion: 'NO₃⁻',
    alsoCovers: [],
    soluble: true,
    exceptions: [],
    text: 'Öll nítröt (NO₃⁻) eru leysanleg.',
    exceptionText: 'Engar undantekningar.',
  },
  {
    id: 'halid',
    ion: 'Cl⁻',
    alsoCovers: ['Br⁻', 'I⁻'],
    soluble: true,
    exceptions: ['Ag⁺', 'Pb²⁺'],
    text: 'Klóríð (Cl⁻), brómíð (Br⁻) og joðíð (I⁻) eru leysanleg.',
    exceptionText: 'Nema með Ag⁺, Pb²⁺ og Hg₂²⁺.',
  },
  {
    id: 'fluorid',
    ion: 'F⁻',
    alsoCovers: [],
    soluble: true,
    exceptions: ['Mg²⁺', 'Ca²⁺', 'Sr²⁺', 'Ba²⁺', 'Pb²⁺', 'Fe³⁺'],
    text: 'Flúoríð (F⁻) eru leysanleg.',
    exceptionText: 'Nema með katjónum jarðalkalímálma (flokkur 2), Pb²⁺ og Fe³⁺.',
  },
  {
    id: 'sulfot',
    ion: 'SO₄²⁻',
    alsoCovers: [],
    soluble: true,
    exceptions: ['Ag⁺', 'Ba²⁺', 'Ca²⁺', 'Pb²⁺', 'Sr²⁺'],
    text: 'Súlföt (SO₄²⁻) eru leysanleg.',
    exceptionText: 'Nema með Ag⁺, Ba²⁺, Ca²⁺, Pb²⁺, Sr²⁺ og Hg₂²⁺.',
  },
  {
    id: 'thungir-anjonir',
    ion: 'CO₃²⁻',
    alsoCovers: ['CrO₄²⁻', 'PO₄³⁻', 'S²⁻'],
    soluble: false,
    exceptions: [...ALWAYS_SOLUBLE_CATIONS],
    text: 'Karbónöt (CO₃²⁻), krómöt (CrO₄²⁻), fosföt (PO₄³⁻) og súlfíð (S²⁻) eru óleysanleg.',
    exceptionText: 'Nema með katjónum úr flokki 1 og NH₄⁺.',
  },
  {
    id: 'hydroxid',
    ion: 'OH⁻',
    alsoCovers: [],
    soluble: false,
    exceptions: [...ALWAYS_SOLUBLE_CATIONS, 'Ba²⁺'],
    text: 'Hýdroxíð (OH⁻) eru óleysanleg.',
    exceptionText: 'Nema með katjónum úr flokki 1 og Ba²⁺.',
  },
];

const byFormula = new Map<string, Ion>([...CATIONS, ...ANIONS].map((i) => [i.formula, i]));

/** Look an ion up by formula. Throws rather than returning a silent undefined. */
export function ion(formula: string): Ion {
  const found = byFormula.get(formula);
  if (!found) throw new RangeError(`No ion declared with formula ${formula}`);
  return found;
}
