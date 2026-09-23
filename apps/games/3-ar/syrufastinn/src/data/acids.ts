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
 * **Verified 2026-09-19.** Siggi supplied Tables D.1 and D.2 directly and every Ka
 * below matches D.1 exactly, so the earlier "unchecked against the school's own
 * copy" caveat is retired.
 *
 * That check also settled the two Ka disagreements that had kept acids out: D.1
 * gives HNO₂ 4,5 × 10⁻⁴ (against a competing 5,6 × 10⁻⁴) and HCN 4,9 × 10⁻¹⁰
 * (against 6,2 × 10⁻¹⁰). **Both are now in**, together with HF, which makes the
 * pool nine. What had held HNO₂ and HCN back after the Ka question closed was
 * naming, not chemistry: `ordabok.md` had no entry for nitrous acid, the nitrite
 * ion, or anything cyanide, and coining them here is exactly what this repo's
 * glossary rule forbids. Siggi ruled all four terms on 2026-09-19 —
 * `saltpéturssýrlingur`, `nítrítjón`, `vetnissýaníð` (`blásýra`) and
 * `sýaníðjón` — and they are in `ordabok.md` now.
 *
 * **HF and HNO₂ break the 5 % rule across much of the range** — HF's α runs 2,6 %
 * at 1,0 M to 22,9 % at 0,01 M — which is a feature: the Beita phase exists to
 * include pairs where the approximation fails.
 *
 * **Every name here is either already shipping elsewhere on the platform or
 * carries the ruling that established it**, which is the other half of the same
 * discipline — `nameEstablished` records which. Acids were once kept out because
 * the platform spelled their names more than one way; every one of those names
 * was ruled on 2026-09-19, and the README's table records how.
 *
 * **Names decline.** Icelandic needs the dative after `af` and the genitive after
 * `samoka basa`, so the nominative alone is not enough to build a sentence with:
 * `lausn af ediksýra` is not Icelandic, and with `Vetnissýaníð` (neuter) and
 * `Saltpéturssýrlingur` (masculine) in the pool the nominative is not even close.
 * `nameDative` and `nameGenitive` carry the forms the question templates need.
 *
 * This repo has been bitten by unverified data before: `lausnir` shipped gas
 * solubilities 10× out under a mislabelled axis (B3), and `molmassi` printed
 * per-element breakdowns that did not sum to their own totals (B4). Data that
 * looks plausible is not data that has been checked.
 */

import { solveWeakAcid, waterContributionMatters } from '../engine/ka';

export interface WeakAcid {
  id: string;
  /** Icelandic name, nominative and capitalised. See `nameEstablished`. */
  name: string;
  /**
   * Dative, lowercase — what `af` governs: `lausn af ediksýru`, `af fenóli`,
   * `af vetnissýaníði`. Stored rather than derived because the pool spans all
   * three genders and two declension classes; a rule that got `-sýra` right
   * would still print `af vetnissýaníð`.
   */
  nameDative: string;
  /** Genitive, lowercase — `samoka basi ediksýru`, `samoka basi fenóls`. */
  nameGenitive: string;
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
  /**
   * Where this Icelandic name comes from — the games that already ship it, or
   * the ruling that established it. Empty would mean unconfirmed, which is the
   * state no name in this file is allowed to be in.
   */
  nameEstablished: string;
  /** Where a student meets it. Real context, per the April restructure. */
  context: string;
}

export const WEAK_ACIDS: WeakAcid[] = [
  {
    id: 'maurasyra',
    name: 'Maurasýra',
    nameDative: 'maurasýru',
    nameGenitive: 'maurasýru',
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
    nameDative: 'ediksýru',
    nameGenitive: 'ediksýru',
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
    nameDative: 'própansýru',
    nameGenitive: 'própansýru',
    formula: 'CH₃CH₂COOH',
    conjugateBase: 'CH₃CH₂COO⁻',
    conjugateBaseName: 'própanatjón',
    ka: 1.3e-5,
    protons: 1,
    nameEstablished: '2-ar/organic-nomenclature',
    context: 'Própansýra og sölt hennar verja brauð gegn myglu.',
  },
  {
    id: 'flussyra',
    name: 'Flússýra',
    nameDative: 'flússýru',
    nameGenitive: 'flússýru',
    formula: 'HF',
    conjugateBase: 'F⁻',
    conjugateBaseName: 'flúoríðjón',
    ka: 6.8e-4,
    protons: 1,
    nameEstablished: '3-ar/ph-titration, 2-ar/intermolecular-forces',
    context: 'Flússýra leysir upp gler og er geymd í plastílátum, ekki glerflöskum.',
  },
  {
    id: 'saltpeturssyrlingur',
    name: 'Saltpéturssýrlingur',
    nameDative: 'saltpéturssýrlingi',
    nameGenitive: 'saltpéturssýrlings',
    formula: 'HNO₂',
    conjugateBase: 'NO₂⁻',
    conjugateBaseName: 'nítrítjón',
    ka: 4.5e-4,
    protons: 1,
    nameEstablished: "Siggi's ruling 2026-09-19; ordabok.md nitrous acid / nitrite ion",
    context:
      'Nítrítsölt eru notuð til að verja unnar kjötvörur og gefa þeim bleika litinn; í súrri lausn myndast saltpéturssýrlingur.',
  },
  {
    id: 'fenol',
    name: 'Fenól',
    nameDative: 'fenóli',
    nameGenitive: 'fenóls',
    formula: 'C₆H₅OH',
    conjugateBase: 'C₆H₅O⁻',
    conjugateBaseName: 'fenoxíðjón',
    ka: 1.3e-10,
    protons: 1,
    nameEstablished: '2-ar/organic-nomenclature',
    context: 'Fenól var fyrsta sótthreinsiefnið sem notað var við skurðaðgerðir.',
  },
  {
    id: 'vetnissyanid',
    name: 'Vetnissýaníð',
    nameDative: 'vetnissýaníði',
    nameGenitive: 'vetnissýaníðs',
    formula: 'HCN',
    conjugateBase: 'CN⁻',
    conjugateBaseName: 'sýaníðjón',
    ka: 4.9e-10,
    protons: 1,
    nameEstablished: "Siggi's ruling 2026-09-19; ordabok.md hydrogen cyanide / cyanide ion",
    context:
      'Vetnissýaníð (blásýra) myndast úr amygdalíni í beiskum möndlum og apríkósusteinum og lyktar af marsípani.',
  },
  {
    id: 'kolsyra',
    name: 'Kolsýra',
    nameDative: 'kolsýru',
    nameGenitive: 'kolsýru',
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
    nameDative: 'oxalsýru',
    nameGenitive: 'oxalsýru',
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
