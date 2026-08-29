/**
 * Weak acids and bases for Sýrufastinn.
 *
 * **Every Ka in this file needs checking against the school's textbook before
 * the game ships.** Literature values for these acids differ between sources in
 * the second significant figure — HNO₂ is quoted as both 4.5 × 10⁻⁴ and
 * 5.6 × 10⁻⁴, HCN as both 6.2 × 10⁻¹⁰ and 4.9 × 10⁻¹⁰ — and the number a
 * student is graded against has to be the one they were taught. The values
 * below are the common textbook set at 25 °C; `docs`-side verification is
 * tracked in the README's "Verify before this ships" section.
 *
 * This repo has been bitten by exactly this before: `lausnir` shipped gas
 * solubilities 10× out under a mislabelled axis (B3), and `molmassi` printed
 * per-element breakdowns that did not sum to their own totals (B4). Data that
 * looks plausible is not data that has been checked.
 */

export type AcidState = 'vökvi' | 'fast' | 'gas' | 'lausn';

export interface WeakAcid {
  id: string;
  /** Icelandic name. See `nameEstablished`. */
  name: string;
  formula: string;
  /** Formula of the conjugate base. */
  conjugateBase: string;
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
  /**
   * Whether this Icelandic name already ships elsewhere on the platform.
   * `false` means Siggi has not signed it off and `ordabok.md` is silent —
   * flagged in the README rather than quietly treated as settled.
   */
  nameEstablished: boolean;
  /** Where a student meets it. Real context, per the April restructure. */
  context: string;
}

export const WEAK_ACIDS: WeakAcid[] = [
  {
    id: 'ediksyra',
    name: 'Ediksýra',
    formula: 'CH₃COOH',
    conjugateBase: 'CH₃COO⁻',
    ka: 1.8e-5,
    protons: 1,
    nameEstablished: true, // ships in equilibrium-shifter, buffer-recipe-creator
    context: 'Edik er um 5% ediksýra í vatni.',
  },
  {
    id: 'maurasyra',
    name: 'Maurasýra',
    formula: 'HCOOH',
    conjugateBase: 'HCOO⁻',
    ka: 1.8e-4,
    protons: 1,
    nameEstablished: true, // ships in organic-nomenclature
    context: 'Maurasýra er varnarefni maura og brennninetla.',
  },
  {
    id: 'kolsyra',
    name: 'Kolsýra',
    formula: 'H₂CO₃',
    conjugateBase: 'HCO₃⁻',
    ka: 4.3e-7,
    protons: 2,
    nameEstablished: true, // ships in equilibrium-shifter
    context: 'Kolsýra stýrir sýrustigi blóðsins og er í öllum gosdrykkjum.',
  },
];

/** Monoprotic acids only — the set every calculation question may draw from. */
export const MONOPROTIC_ACIDS = WEAK_ACIDS.filter((a) => a.protons === 1);

/** Names still needing Siggi's sign-off, surfaced for the README and tests. */
export const UNCONFIRMED_NAMES = WEAK_ACIDS.filter((a) => !a.nameEstablished).map((a) => a.name);
