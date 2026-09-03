/**
 * Weak acids for Sýrufastinn.
 *
 * **Where these Ka values come from.** All are the 25 °C values in Appendix D of
 * *Chemistry: The Central Science* (Brown et al.) — the textbook the platform
 * already cites by name on `3-ar/buffer-recipe-creator`'s menu, and the source
 * whose acetic-acid Ka (1,8 × 10⁻⁵) `3-ar/ph-titration` is already computing
 * with. Grading a student against a different book's second significant figure
 * is the failure this note exists to prevent.
 *
 * **What is still unverified.** The local corpus at `~/dev/repos/namsbokasafn-efni`
 * is not reachable from a cloud session, so none of this was checked against the
 * school's own copy. The pool is therefore restricted to acids whose Ka does not
 * disagree between sources: HNO₂ (quoted as both 4,5 × 10⁻⁴ and 5,6 × 10⁻⁴) and
 * HCN (6,2 × 10⁻¹⁰ and 4,9 × 10⁻¹⁰) are deliberately absent for that reason.
 *
 * **Every name here already ships elsewhere on the platform**, which is the other
 * half of the same discipline — `nameEstablished` records where. Three acids that
 * would otherwise belong are excluded because the platform contradicts itself
 * about their names; see the README's "Names the platform cannot agree on".
 *
 * This repo has been bitten by unverified data before: `lausnir` shipped gas
 * solubilities 10× out under a mislabelled axis (B3), and `molmassi` printed
 * per-element breakdowns that did not sum to their own totals (B4). Data that
 * looks plausible is not data that has been checked.
 */

import { solveWeakAcid, waterContributionMatters } from '../engine/ka';

export interface WeakAcid {
  id: string;
  /** Icelandic name. See `nameEstablished`. */
  name: string;
  formula: string;
  /** Formula of the conjugate base. */
  conjugateBase: string;
  /** Icelandic name of the conjugate base. */
  conjugateBaseName: string;
  /** Ka at 25 °C. For polyprotic acids this is Ka₁. */
  ka: number;
  /**
   * Number of acidic protons. The game teaches the monoprotic case only, so
   * anything above 1 is excluded from every calculation question — a student
   * solving H₂CO₃ with the monoprotic quadratic gets the wrong answer, and it
   * is not their mistake. Same guard as `lausnir`'s `form` and `molmassi`'s
   * `state`: the data declares what it is, so the generator cannot ask an
   * unanswerable question.
   */
  protons: number;
  /** Where this Icelandic name already ships. Empty would mean unconfirmed. */
  nameEstablished: string;
  /** Where a student meets it. Real context, per the April restructure. */
  context: string;
}

export const WEAK_ACIDS: WeakAcid[] = [
  {
    id: 'maurasyra',
    name: 'Maurasýra',
    formula: 'HCOOH',
    conjugateBase: 'HCOO⁻',
    conjugateBaseName: 'formíatjón',
    ka: 1.8e-4,
    protons: 1,
    nameEstablished: '2-ar/organic-nomenclature',
    context: 'Maurasýra er varnarefni maura og brenninetla.',
  },
  {
    id: 'ediksyra',
    name: 'Ediksýra',
    formula: 'CH₃COOH',
    conjugateBase: 'CH₃COO⁻',
    conjugateBaseName: 'asetatjón',
    ka: 1.8e-5,
    protons: 1,
    nameEstablished: '3-ar/equilibrium-shifter, 3-ar/buffer-recipe-creator',
    context: 'Edik er um 5% ediksýra í vatni.',
  },
  {
    id: 'propansyra',
    name: 'Própansýra',
    formula: 'CH₃CH₂COOH',
    conjugateBase: 'CH₃CH₂COO⁻',
    conjugateBaseName: 'própanatjón',
    ka: 1.3e-5,
    protons: 1,
    nameEstablished: '2-ar/organic-nomenclature',
    context: 'Própansýra og sölt hennar verja brauð gegn myglu.',
  },
  {
    id: 'fenol',
    name: 'Fenól',
    formula: 'C₆H₅OH',
    conjugateBase: 'C₆H₅O⁻',
    conjugateBaseName: 'fenoxíðjón',
    ka: 1.3e-10,
    protons: 1,
    nameEstablished: '2-ar/organic-nomenclature',
    context: 'Fenól var fyrsta sótthreinsiefnið sem notað var við skurðaðgerðir.',
  },
  {
    id: 'kolsyra',
    name: 'Kolsýra',
    formula: 'H₂CO₃',
    conjugateBase: 'HCO₃⁻',
    conjugateBaseName: 'bíkarbónatjón',
    ka: 4.3e-7,
    protons: 2,
    nameEstablished: '3-ar/equilibrium-shifter',
    context: 'Kolsýra stýrir sýrustigi blóðsins og er í öllum gosdrykkjum.',
  },
  {
    id: 'oxalsyra',
    name: 'Oxalsýra',
    formula: 'H₂C₂O₄',
    conjugateBase: 'HC₂O₄⁻',
    conjugateBaseName: 'hýdrogenoxalatjón',
    ka: 5.9e-2,
    protons: 2,
    nameEstablished: '2-ar/organic-nomenclature',
    context: 'Oxalsýra er í rabarbarablöðum og er þess vegna ekki borðuð.',
  },
];

/**
 * The only pool a calculation question may draw from.
 *
 * Monoprotic, per the scope ruling. `isAnswerable` below adds the second
 * condition, which the concentration decides rather than the acid.
 */
export const MONOPROTIC_ACIDS = WEAK_ACIDS.filter((a) => a.protons === 1);

/** Ordered weakest-first, for the strength-ranking questions. */
export const ACIDS_BY_STRENGTH = [...MONOPROTIC_ACIDS].sort((a, b) => a.ka - b.ka);

/**
 * Concentrations a problem may use, in mol/L. Ordinary bench values; the point
 * of the range is that Ka comes out the same from every one of them, which is
 * what the Explore phase is for.
 */
export const CONCENTRATIONS = [1.0, 0.5, 0.25, 0.1, 0.05, 0.025, 0.01];

/**
 * Whether this acid at this concentration is a fair question.
 *
 * `solveWeakAcid` neglects water's own H⁺, and for a very weak acid that stops
 * being safe: 0,1 M fenól gives [H⁺] = 3,6 × 10⁻⁶, and water's 10⁻⁷ is 2,8 % of
 * it — so the pH the game would grade is not the pH the solution has. Fenól at
 * 1,0 M is fine; fenól at 0,01 M is not.
 *
 * This is the same discipline as `protons`, applied to the pair rather than the
 * acid: the generator asks this before it asks anything of the student, so a
 * question the engine cannot answer correctly can never be posed. A test asserts
 * the guard actually rejects something, so it cannot quietly become vacuous.
 */
export function isAnswerable(acid: WeakAcid, concentration: number): boolean {
  if (acid.protons !== 1) return false;
  const { hExact } = solveWeakAcid(acid.ka, concentration);
  return !waterContributionMatters(hExact);
}

/** Every (acid, concentration) pair a calculation question may use. */
export const ANSWERABLE_PAIRS: ReadonlyArray<{ acid: WeakAcid; concentration: number }> =
  MONOPROTIC_ACIDS.flatMap((acid) =>
    CONCENTRATIONS.filter((c) => isAnswerable(acid, c)).map((concentration) => ({
      acid,
      concentration,
    }))
  );
