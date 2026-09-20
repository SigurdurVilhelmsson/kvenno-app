/**
 * The compounds Reynsluformúlur teaches with.
 *
 * **Content harvested from the frozen `namsbokasafn-leikir` game
 * `hlutfallsgreining`, with its three data defects fixed first.** The roadmap's
 * instruction was literally "fix three data defects before porting anything",
 * and `ORPHANED_GAMES_ASSESSMENT.md:338` named them. All three were re-verified
 * by arithmetic before anything was ported, because two of Phase 3's four
 * harvest rows turned out to have false premises. This time the assessment was
 * right on all three:
 *
 *  - **`l2-1`** was labelled hydrogen peroxide and carried **water's**
 *    percentages, 11,19 / 88,81, which reduce to H₂O. Its key `HO` was right and
 *    is load-bearing — the old Level 3 consumed it as H₂O₂'s empirical formula —
 *    so the percentages were the thing to fix, not the key. Here: 5,93 / 94,07,
 *    derived rather than typed.
 *  - **`l2-5`** carried N 35,00 / H 5,04 / O 59,96, which reduce to **N₂H₄O₃**
 *    (ammonium nitrate) against a stored key of `NH₂O₃`. The data was right and
 *    the key was wrong. Here the key is derived from the percentages.
 *  - **`l2-10`** carried Mg 28,83 / P 22,04 / O 49,13, which reduce to
 *    1,667 : 1 : 4,316 — **no whole-number formula at all**, so the stored
 *    `Mg₃(PO₄)₂` was unreachable. Real magnesium phosphate is 27,74 / 23,57 /
 *    48,69.
 *  - `l2-2` and `l2-8` were byte-identical, labelled easy and hard. One of them
 *    is here.
 *
 * **Nothing below stores a formula.** Every key is derived by
 * `deriveEmpirical` from the percentages at module load, so a question cannot
 * disagree with its own grader — the `l2-5` defect made structurally impossible
 * rather than merely fixed. The percentages themselves are derived too, from
 * the intended formula, so they cannot be mistyped either: that is what would
 * have caught `l2-1` and `l2-10`.
 */

import { ATOMIC_MASSES, type ElementSymbol } from './elements';
import { deriveEmpirical, deriveMolecular, percentComposition } from '../engine/empirical';

export interface Compound {
  id: string;
  /** Icelandic name. */
  name: string;
  /** The true formula, from which percentages are computed. */
  counts: { element: ElementSymbol; subscript: number }[];
  difficulty: 'ledd' | 'mid' | 'thung';
  /** Where a student meets it. */
  context: string;
}

/**
 * The compounds, written as formulas rather than as percentages.
 *
 * This is the direction that cannot be wrong: a formula is a fact about a
 * compound, while a percentage is an arithmetic result. Deriving the second
 * from the first removes the whole class of defect the old game shipped.
 */
export const COMPOUNDS: Compound[] = [
  {
    id: 'vetnisperoxid',
    name: 'Vetnisperoxíð',
    counts: [
      { element: 'H', subscript: 2 },
      { element: 'O', subscript: 2 },
    ],
    difficulty: 'ledd',
    context:
      'Vetnisperoxíð er sótthreinsandi og bleikiefni — og reynsluformúlan HO er ekki sameindaformúlan.',
  },
  {
    id: 'natriumklorid',
    name: 'Natríumklóríð',
    counts: [
      { element: 'Na', subscript: 1 },
      { element: 'Cl', subscript: 1 },
    ],
    difficulty: 'ledd',
    context: 'Matarsalt. Hlutfallið er 1:1, sem gerir það að góðu fyrsta dæmi.',
  },
  {
    id: 'formaldehyd',
    name: 'Formaldehýð',
    counts: [
      { element: 'C', subscript: 1 },
      { element: 'H', subscript: 2 },
      { element: 'O', subscript: 1 },
    ],
    difficulty: 'ledd',
    context: 'CH₂O er líka reynsluformúla glúkósa — sama reynsluformúla, ólík efni.',
  },
  {
    id: 'etanol',
    name: 'Etanól',
    counts: [
      { element: 'C', subscript: 2 },
      { element: 'H', subscript: 6 },
      { element: 'O', subscript: 1 },
    ],
    difficulty: 'mid',
    context: 'Hér er reynsluformúlan sú sama og sameindaformúlan.',
  },
  {
    id: 'jarnoxid',
    name: 'Járn(III)oxíð',
    counts: [
      { element: 'Fe', subscript: 2 },
      { element: 'O', subscript: 3 },
    ],
    difficulty: 'mid',
    context: 'Ryð. Hlutfallið kemur út sem 1 : 1,5 og verður að tvöfaldast.',
  },
  {
    id: 'ammoniumnitrat',
    name: 'Ammóníumnítrat',
    counts: [
      { element: 'N', subscript: 2 },
      { element: 'H', subscript: 4 },
      { element: 'O', subscript: 3 },
    ],
    difficulty: 'mid',
    context:
      'Áburður, og sama 1 : 1,5 gildran: hlutföllin koma út sem N 1, H 2, O 1,5. Gamla útgáfa þessa dæmis geymdi NH₂O₃ sem svar, sem er einmitt villan að námunda 1,5 upp í 2.',
  },
  {
    id: 'kaliumdikromat',
    name: 'Kalíumdíkrómat',
    counts: [
      { element: 'K', subscript: 2 },
      { element: 'Cr', subscript: 2 },
      { element: 'O', subscript: 7 },
    ],
    difficulty: 'thung',
    context:
      'Hlutföllin koma út sem 1 : 1 : 3,5 og verða að tvöfaldast. Efnið sjálft er krabbameinsvaldandi og er ekki lengur á hillum margra skóla — hér er það reikningsdæmi á blaði, ekki uppskrift.',
  },
  {
    id: 'magnesiumfosfat',
    name: 'Magnesíumfosfat',
    counts: [
      { element: 'Mg', subscript: 3 },
      { element: 'P', subscript: 2 },
      { element: 'O', subscript: 8 },
    ],
    difficulty: 'thung',
    context: 'Þyngsta dæmið: hlutföllin verða 1,5 : 1 : 4 og allt þarf að tvöfaldast.',
  },
];

export interface EmpiricalProblem {
  id: string;
  name: string;
  context: string;
  difficulty: Compound['difficulty'];
  /** Derived from the formula — never typed. */
  percentages: { element: ElementSymbol; percent: number }[];
  /** Derived from the percentages — never typed. */
  answer: string;
  multiplier: number;
}

export const PROBLEMS: EmpiricalProblem[] = COMPOUNDS.map((c) => {
  const pct = percentComposition(c.counts);
  const asRecord = Object.fromEntries(
    pct.map((p) => [p.element, Number(p.percent.toFixed(2))])
  ) as Partial<Record<ElementSymbol, number>>;
  const derived = deriveEmpirical(asRecord);
  return {
    id: c.id,
    name: c.name,
    context: c.context,
    difficulty: c.difficulty,
    percentages: pct.map((p) => ({ element: p.element, percent: Number(p.percent.toFixed(2)) })),
    answer: derived.formula,
    multiplier: derived.multiplier,
  };
});

/** Problems whose ratios need multiplying up — the 1,5 trap, which is the lesson. */
export const NEEDS_MULTIPLIER = PROBLEMS.filter((p) => p.multiplier > 1);

export interface MolecularProblem {
  id: string;
  name: string;
  /** The reduced formula the student starts from. */
  empirical: { element: ElementSymbol; subscript: number }[];
  /** Measured molar mass, g/mol — derived from the true formula. */
  molarMass: number;
  answer: string;
  n: number;
  empiricalMass: number;
  context: string;
}

/** Greatest common divisor over the subscripts — what reduces a formula. */
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/**
 * The second half: empirical formula plus a measured molar mass gives the
 * molecular formula.
 *
 * Written as the **molecular** formula, the one fact about the compound. The
 * empirical formula is derived by reducing the subscripts, the molar mass by
 * summing them, and `n` by dividing the two — so all three agree by
 * construction. `glukosi` is the pair that makes the point: it has the same
 * empirical formula as formaldehyde, so the empirical formula alone cannot tell
 * you which compound you are holding.
 */
const MOLECULAR_SOURCES: {
  id: string;
  name: string;
  counts: { element: ElementSymbol; subscript: number }[];
  context: string;
}[] = [
  {
    id: 'vetnisperoxid-sameind',
    name: 'Vetnisperoxíð',
    counts: [
      { element: 'H', subscript: 2 },
      { element: 'O', subscript: 2 },
    ],
    context: 'Reynsluformúlan er HO, en sameindin er H₂O₂ — tvöfalt stærri.',
  },
  {
    id: 'glukosi',
    name: 'Glúkósi',
    counts: [
      { element: 'C', subscript: 6 },
      { element: 'H', subscript: 12 },
      { element: 'O', subscript: 6 },
    ],
    context:
      'Glúkósi hefur sömu reynsluformúlu og formaldehýð, CH₂O. Reynsluformúlan ein og sér segir ekki hvaða efni þú ert með — til þess þarf mólmassann.',
  },
  {
    id: 'bensen',
    name: 'Bensen',
    counts: [
      { element: 'C', subscript: 6 },
      { element: 'H', subscript: 6 },
    ],
    context: 'Reynsluformúlan CH er sú sama og fyrir asetýlen (C₂H₂); mólmassinn aðskilur þau.',
  },
];

export const MOLECULAR_PROBLEMS: MolecularProblem[] = MOLECULAR_SOURCES.map((s) => {
  const divisor = s.counts.map((c) => c.subscript).reduce((a, b) => gcd(a, b));
  const empirical = s.counts.map((c) => ({ element: c.element, subscript: c.subscript / divisor }));
  const molarMass = Number(
    s.counts.reduce((sum, c) => sum + ATOMIC_MASSES[c.element] * c.subscript, 0).toFixed(2)
  );
  const solved = deriveMolecular(empirical, molarMass);
  return {
    id: s.id,
    name: s.name,
    context: s.context,
    empirical,
    molarMass,
    answer: solved.formula,
    n: solved.n,
    empiricalMass: solved.empiricalMass,
  };
});
