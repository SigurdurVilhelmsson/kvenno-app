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
