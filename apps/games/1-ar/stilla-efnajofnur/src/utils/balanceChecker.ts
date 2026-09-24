/**
 * Utility to check whether a chemical equation is balanced given
 * user-provided coefficients.
 */

import type { Molecule } from '../data/reactions';

export interface ElementCount {
  element: string;
  left: number;
  right: number;
  balanced: boolean;
}

export interface BalanceResult {
  /** Per-element breakdown */
  elements: ElementCount[];
  /** True if every element is balanced */
  isBalanced: boolean;
  /**
   * True when the atoms balance but the coefficients share a common factor,
   * so the set is not in lowest whole-number terms — `4H₂ + 2O₂ → 4H₂O`
   * rather than `2H₂ + O₂ → 2H₂O`.
   *
   * The convention that a balanced equation uses the smallest whole numbers was
   * never checked here and is never stated anywhere in the game, so a student
   * who doubled every coefficient was told they were right (B12 in the Year-1
   * curriculum review). Kept separate from `isBalanced` because it is a
   * different thing to tell a student: the atoms genuinely do balance, and the
   * remaining step is to reduce.
   */
  isReduced: boolean;
}

/**
 * Count atoms for one side of the equation.
 * Multiplies each molecule's element counts by its user coefficient.
 */
function countAtoms(molecules: Molecule[], coefficients: number[]): Record<string, number> {
  const counts: Record<string, number> = {};
  molecules.forEach((mol, i) => {
    const coeff = coefficients[i] ?? 1;
    for (const [element, count] of Object.entries(mol.elements)) {
      counts[element] = (counts[element] ?? 0) + count * coeff;
    }
  });
  return counts;
}

/**
 * Collect all unique element symbols from both sides of the reaction.
 */
function getAllElements(reactants: Molecule[], products: Molecule[]): string[] {
  const set = new Set<string>();
  for (const mol of [...reactants, ...products]) {
    for (const el of Object.keys(mol.elements)) {
      set.add(el);
    }
  }
  return Array.from(set).sort();
}

/**
 * Check whether a reaction is balanced given user-provided coefficients.
 *
 * @param reactants - The reactant molecules (from reaction data)
 * @param products  - The product molecules (from reaction data)
 * @param reactantCoeffs - User-entered coefficients for each reactant
 * @param productCoeffs  - User-entered coefficients for each product
 */
export function checkBalance(
  reactants: Molecule[],
  products: Molecule[],
  reactantCoeffs: number[],
  productCoeffs: number[]
): BalanceResult {
  const leftCounts = countAtoms(reactants, reactantCoeffs);
  const rightCounts = countAtoms(products, productCoeffs);
  const allElements = getAllElements(reactants, products);

  const elements: ElementCount[] = allElements.map((element) => {
    const left = leftCounts[element] ?? 0;
    const right = rightCounts[element] ?? 0;
    return { element, left, right, balanced: left === right };
  });

  const isBalanced = elements.every((e) => e.balanced);
  const isReduced = coefficientsAreReduced([...reactantCoeffs, ...productCoeffs]);

  return { elements, isBalanced, isReduced };
}

/** Greatest common divisor, for whole numbers. */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Are these coefficients in lowest whole-number terms?
 *
 * True when their greatest common divisor is 1. A set containing a zero is
 * treated as unreduced rather than crashing: zero is not a usable coefficient in
 * a balanced equation, and gcd(0, n) is n, which would otherwise let
 * `0, 2, 2` pass as reduced only when some other coefficient happened to be odd.
 */
export function coefficientsAreReduced(coefficients: number[]): boolean {
  const values = coefficients.map((c) => Math.abs(Math.round(c)));
  if (values.length === 0) return true;
  if (values.some((v) => v === 0)) return false;
  return values.reduce((acc, v) => gcd(acc, v)) === 1;
}

/** Icelandic element names for common elements in this game */
const ELEMENT_NAMES_IS: Record<string, string> = {
  H: 'Vetni (H)',
  O: 'Súrefni (O)',
  N: 'Köfnunarefni (N)',
  C: 'Kolefni (C)',
  Na: 'Natríum (Na)',
  Cl: 'Klór (Cl)',
  Mg: 'Magnesíum (Mg)',
  Fe: 'Járn (Fe)',
  Ca: 'Kalsíum (Ca)',
  Li: 'Litíum (Li)',
  Al: 'Ál (Al)',
  K: 'Kalíum (K)',
  S: 'Brennisteinn (S)',
  Zn: 'Sink (Zn)',
};

/**
 * Build an Icelandic diagnostic string listing which elements are unbalanced.
 * Example: "Vetni (H): 4 vinstra megin en 2 hægra megin."
 */
export function buildUnbalancedDiagnostic(elements: ElementCount[]): string {
  const unbalanced = elements.filter((e) => !e.balanced);
  if (unbalanced.length === 0) return '';

  return (
    unbalanced
      .map((e) => {
        const name = ELEMENT_NAMES_IS[e.element] ?? e.element;
        return `${name}: ${e.left} vinstra megin en ${e.right} hægra megin`;
      })
      .join('. ') + '.'
  );
}

/**
 * Name the error a wrong coefficient set most likely comes from.
 *
 * `buildUnbalancedDiagnostic` says *what* does not add up; this says *why* it
 * probably does not, and it goes in the `FeedbackPanel`'s misconception slot,
 * which renders outside the collapsible explanation. The Year-1 curriculum
 * review found this game names no misconception at all, so "Rangt" plus a count
 * was the whole response to a wrong answer.
 *
 * Modelled on `1-ar/molmassi`'s `diagnoseMistake`, which the same review holds
 * up as one of the four patterns worth copying: look at what the student
 * actually typed and find the single mistake that explains it, rather than
 * restating the right answer.
 *
 * Returns `undefined` when nothing specific can be said. That is deliberate — a
 * misconception the student does not hold is worse than none, because they will
 * try to act on it.
 */
export function diagnoseMisconception(
  reactants: Molecule[],
  products: Molecule[],
  reactantCoeffs: number[],
  productCoeffs: number[],
  result: BalanceResult
): string | undefined {
  // The unreduced case has its own message and is not a misconception: the
  // student balanced the equation and is being held to a convention.
  if (result.isBalanced) return undefined;

  const allCoeffs = [...reactantCoeffs, ...productCoeffs];

  // Nothing has been changed yet. The commonest misconception in balancing is
  // that you fix an equation by editing the formulas, so say what a coefficient
  // does before anything else.
  if (allCoeffs.every((c) => c === 1)) {
    return (
      'Stuðullinn framan við sameind margfaldar öll atóm í henni — 2H₂O er fjögur vetni og ' +
      'tvö súrefni. Vísitölunum (litlu tölunum) má aldrei breyta: þær segja hvaða efni þetta er.'
    );
  }

  // Only one side has been touched, and the untouched side does need a
  // coefficient. Balancing is a comparison between the sides, and stopping after
  // the first one is a real habit — but only worth saying where it is true:
  // 2Na + Cl₂ → 2NaCl needs nothing on the right, and telling a student
  // otherwise sends them looking for a coefficient that does not exist.
  const leftUntouched = reactantCoeffs.every((c) => c === 1);
  const rightUntouched = productCoeffs.every((c) => c === 1);
  const untouchedSideNeedsOne = leftUntouched
    ? reactants.some((m) => m.coefficient > 1)
    : products.some((m) => m.coefficient > 1);
  if (leftUntouched !== rightUntouched && untouchedSideNeedsOne) {
    return leftUntouched
      ? 'Þú hefur aðeins breytt hægri hliðinni. Atómin verða að standast á milli hliða, og hér þarf stuðul vinstra megin líka.'
      : 'Þú hefur aðeins breytt vinstri hliðinni. Atómin verða að standast á milli hliða, og hér þarf stuðul hægra megin líka.';
  }

  // Every element that does not add up appears in more than one molecule on the
  // side where it is short. That is the classic slip: the element is counted in
  // the molecule you are looking at and not in the other one it also sits in.
  const unbalanced = result.elements.filter((e) => !e.balanced);
  const spreadOut = unbalanced.filter((e) => {
    const shortSide = e.left < e.right ? reactants : products;
    return shortSide.filter((m) => m.elements[e.element] !== undefined).length > 1;
  });
  if (unbalanced.length > 0 && spreadOut.length === unbalanced.length) {
    const names = spreadOut.map((e) => ELEMENT_NAMES_IS[e.element] ?? e.element).join(' og ');
    return `${names} kemur fyrir í fleiri en einni sameind sömu megin. Teldu atómin í þeim öllum, ekki bara í þeirri sem þú ert að horfa á.`;
  }

  // An element that only enters one side as a lone diatomic molecule can only
  // ever contribute an even number of atoms, so if the other side needs an odd
  // number the equation cannot close without doubling everything. This is the
  // spot where balancing stops being bookkeeping, and a student who has not met
  // it will keep nudging one coefficient up and down.
  const parityTrap = unbalanced.find((e) => {
    const needed = e.left < e.right ? e.right : e.left;
    const shortSide = e.left < e.right ? reactants : products;
    const carriers = shortSide.filter((m) => m.elements[e.element] !== undefined);
    return (
      needed % 2 === 1 &&
      carriers.length === 1 &&
      Object.keys(carriers[0].elements).length === 1 &&
      carriers[0].elements[e.element] === 2
    );
  });
  if (parityTrap) {
    const name = ELEMENT_NAMES_IS[parityTrap.element] ?? parityTrap.element;
    return `${name} kemur aðeins inn sem tvíatóma sameind öðrum megin, svo sú hlið getur bara lagt til slétta tölu atóma. Þegar hin hliðin þarf oddatölu gengur jafnan ekki upp fyrr en þú tvöfaldar alla hina stuðlana.`;
  }

  return undefined;
}
