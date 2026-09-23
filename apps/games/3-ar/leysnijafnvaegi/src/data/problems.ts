/**
 * The problems Leysnijafnvægi serves.
 *
 * **No answer is written down.** Each problem names a salt and the numbers a
 * student would be given; the engine computes what follows. The old
 * `solubility-equilibrium` stored 21 answer keys beside the data they came
 * from — the assessment recomputed them and they were sound, but the PbI₂ pair
 * had already drifted apart (9,8 × 10⁻⁹ stored against 8,8 × 10⁻⁹ derived), and
 * one drift in a file is the whole argument for not keeping two copies.
 */

import { SALTS, saltBy } from './salts';
import {
  molarSolubility,
  mixAndCompare,
  precipitationOrder,
  solubilityWithCommonIon,
} from '../engine/ksp';

export type Difficulty = 'ledd' | 'mid' | 'thung';

/** "Here is Ksp — what is the molar solubility?" and its inverse. */
export interface SolubilityProblem {
  id: string;
  formula: string;
  difficulty: Difficulty;
  direction: 'kspToS' | 'sToKsp';
  /** Derived, never stored. */
  answer: number;
}

const SOLUBILITY_ORDER: {
  formula: string;
  difficulty: Difficulty;
  direction: 'kspToS' | 'sToKsp';
}[] = [
  { formula: 'AgCl', difficulty: 'ledd', direction: 'kspToS' },
  { formula: 'BaSO₄', difficulty: 'ledd', direction: 'kspToS' },
  { formula: 'AgBr', difficulty: 'ledd', direction: 'sToKsp' },
  { formula: 'CaF₂', difficulty: 'mid', direction: 'kspToS' },
  { formula: 'PbF₂', difficulty: 'mid', direction: 'kspToS' },
  { formula: 'Mn(OH)₂', difficulty: 'mid', direction: 'sToKsp' },
  { formula: 'Ag₂CrO₄', difficulty: 'thung', direction: 'kspToS' },
  { formula: 'Ag₂CO₃', difficulty: 'thung', direction: 'kspToS' },
  { formula: 'Ag₂SO₄', difficulty: 'thung', direction: 'sToKsp' },
  { formula: 'PbCl₂', difficulty: 'mid', direction: 'kspToS' },
];

export const SOLUBILITY_PROBLEMS: SolubilityProblem[] = SOLUBILITY_ORDER.map((p) => {
  const salt = saltBy(p.formula);
  return {
    id: `${p.formula}-${p.direction}`,
    formula: p.formula,
    difficulty: p.difficulty,
    direction: p.direction,
    answer: p.direction === 'kspToS' ? molarSolubility(salt) : salt.ksp,
  };
});

/** The common-ion effect: same salt, pure water against a solution of one ion. */
export interface CommonIonProblem {
  id: string;
  formula: string;
  ion: 'cation' | 'anion';
  concentration: number;
  difficulty: Difficulty;
  pure: number;
  exact: number;
  approximate: number;
  /** How many times less soluble. The number that makes the point. */
  suppression: number;
}

const COMMON_ION_ORDER: {
  formula: string;
  ion: 'cation' | 'anion';
  concentration: number;
  difficulty: Difficulty;
}[] = [
  { formula: 'AgCl', ion: 'anion', concentration: 0.1, difficulty: 'ledd' },
  { formula: 'AgCl', ion: 'cation', concentration: 0.01, difficulty: 'ledd' },
  { formula: 'BaSO₄', ion: 'anion', concentration: 0.05, difficulty: 'mid' },
  { formula: 'CaF₂', ion: 'anion', concentration: 0.01, difficulty: 'thung' },
  { formula: 'CaF₂', ion: 'cation', concentration: 0.01, difficulty: 'thung' },
  { formula: 'Ag₂CrO₄', ion: 'cation', concentration: 0.01, difficulty: 'thung' },
];

export const COMMON_ION_PROBLEMS: CommonIonProblem[] = COMMON_ION_ORDER.map((p) => {
  const salt = saltBy(p.formula);
  const pure = molarSolubility(salt);
  const { exact, approximate } = solubilityWithCommonIon(salt, p.ion, p.concentration);
  return {
    id: `${p.formula}-${p.ion}-${p.concentration}`,
    formula: p.formula,
    ion: p.ion,
    concentration: p.concentration,
    difficulty: p.difficulty,
    pure,
    exact,
    approximate,
    suppression: pure / exact,
  };
});

/** Mix two solutions: does a precipitate form? */
export interface MixingProblem {
  id: string;
  formula: string;
  difficulty: Difficulty;
  cation: { concentration: number; volume: number; source: string };
  anion: { concentration: number; volume: number; source: string };
  context: string;
  /** Everything below is derived. */
  q: number;
  ksp: number;
  precipitates: boolean;
  ratio: number;
  diluted: { cation: number; anion: number };
}

const MIXING_ORDER: Omit<
  MixingProblem,
  'q' | 'ksp' | 'precipitates' | 'ratio' | 'diluted' | 'id'
>[] = [
  {
    formula: 'AgCl',
    difficulty: 'ledd',
    cation: { concentration: 2.0e-4, volume: 0.05, source: 'AgNO₃' },
    anion: { concentration: 2.0e-4, volume: 0.05, source: 'NaCl' },
    context: 'Vel yfir mörkunum — Q er 56-falt Ksp, svo botnfallið sést strax.',
  },
  {
    formula: 'AgCl',
    difficulty: 'mid',
    cation: { concentration: 2.0e-6, volume: 0.05, source: 'AgNO₃' },
    anion: { concentration: 2.0e-6, volume: 0.05, source: 'NaCl' },
    context:
      'Sömu efni, hundraðfalt þynnri. Nú gerist ekkert — og það er allur munurinn á „óleysanlegt“ og „fellur út“.',
  },
  {
    formula: 'BaSO₄',
    difficulty: 'mid',
    cation: { concentration: 1.0e-4, volume: 0.1, source: 'BaCl₂' },
    anion: { concentration: 1.0e-4, volume: 0.1, source: 'Na₂SO₄' },
    context: 'Jafnstór rúmmál, svo báðir styrkir helmingast áður en nokkuð annað gerist.',
  },
  {
    formula: 'BaSO₄',
    difficulty: 'thung',
    cation: { concentration: 4.0e-5, volume: 0.025, source: 'BaCl₂' },
    anion: { concentration: 4.0e-5, volume: 0.075, source: 'Na₂SO₄' },
    context:
      'Ójöfn rúmmál: 25 mL á móti 75 mL. Styrkirnir þynnast ekki jafnt, og þar fellur flest fólk.',
  },
  {
    formula: 'CaF₂',
    difficulty: 'thung',
    cation: { concentration: 2.0e-3, volume: 0.05, source: 'CaCl₂' },
    anion: { concentration: 2.0e-3, volume: 0.05, source: 'NaF' },
    context: 'Hlutfallið 1:2, svo flúoríðstyrkurinn fer í annað veldi í Q.',
  },
  {
    formula: 'SrCO₃',
    difficulty: 'mid',
    cation: { concentration: 6.0e-5, volume: 0.05, source: 'Sr(NO₃)₂' },
    anion: { concentration: 6.0e-5, volume: 0.05, source: 'Na₂CO₃' },
    context:
      'Naumt: Q lendir rétt undir Ksp. Svona dæmi er ekki hægt að giska á — það verður að reikna.',
  },
];

export const MIXING_PROBLEMS: MixingProblem[] = MIXING_ORDER.map((p) => {
  const salt = saltBy(p.formula);
  const result = mixAndCompare(salt, p.cation, p.anion);
  return {
    ...p,
    id: `${p.formula}-${p.cation.concentration}-${p.cation.volume}-${p.anion.volume}`,
    q: result.q,
    ksp: result.ksp,
    precipitates: result.precipitates,
    ratio: result.ratio,
    diluted: result.diluted,
  };
});

/** Fractional precipitation: which comes down first? */
export interface FractionalProblem {
  id: string;
  sharedIon: 'cation' | 'anion';
  sharedIonName: string;
  difficulty: Difficulty;
  context: string;
  candidates: { formula: string; otherIonConcentration: number }[];
  /** Derived, in order. */
  order: { formula: string; threshold: number }[];
  /** True where the first to precipitate is NOT the one with the lower Ksp. */
  defeatsKspOrdering: boolean;
}

const FRACTIONAL_ORDER: Omit<FractionalProblem, 'order' | 'defeatsKspOrdering'>[] = [
  {
    id: 'mohr',
    sharedIon: 'cation',
    sharedIonName: 'Ag⁺',
    difficulty: 'thung',
    context:
      'Mohr-títrun. Lausnin inniheldur bæði klóríð og krómat í 0,010 M, og silfurnítrati er dreypt í. Silfurkrómat er með 150-falt lægra Ksp en silfurklóríð — og fellur samt út á eftir. Það er einmitt þess vegna sem rauði liturinn virkar sem litvísir: hann kemur ekki fyrr en klóríðið er uppurið.',
    candidates: [
      { formula: 'AgCl', otherIonConcentration: 0.01 },
      { formula: 'Ag₂CrO₄', otherIonConcentration: 0.01 },
    ],
  },
  {
    id: 'kolefni',
    sharedIon: 'anion',
    sharedIonName: 'CO₃²⁻',
    difficulty: 'mid',
    context:
      'Lausn með kalsíum, strontíum og járni(II), öll í 0,010 M. Natríumkarbónati er bætt hægt út í. Hér eru öll þrjú söltin 1:1, svo röðin fylgir Ksp — berðu það saman við Mohr-dæmið.',
    candidates: [
      { formula: 'CaCO₃', otherIonConcentration: 0.01 },
      { formula: 'SrCO₃', otherIonConcentration: 0.01 },
      { formula: 'FeCO₃', otherIonConcentration: 0.01 },
    ],
  },
];

export const FRACTIONAL_PROBLEMS: FractionalProblem[] = FRACTIONAL_ORDER.map((p) => {
  const order = precipitationOrder(
    p.sharedIon,
    p.candidates.map((c) => ({
      salt: saltBy(c.formula),
      otherIonConcentration: c.otherIonConcentration,
    }))
  );
  const byThreshold = order.map((o) => o.salt.ksp);
  const sortedByKsp = [...byThreshold].sort((a, b) => a - b);
  return {
    ...p,
    order: order.map((o) => ({ formula: o.salt.formula, threshold: o.threshold })),
    defeatsKspOrdering: byThreshold.some((k, i) => k !== sortedByKsp[i]),
  };
});

/** Every salt the problems actually reach, for a coverage test. */
export const USED_FORMULAS = new Set<string>([
  ...SOLUBILITY_PROBLEMS.map((p) => p.formula),
  ...COMMON_ION_PROBLEMS.map((p) => p.formula),
  ...MIXING_PROBLEMS.map((p) => p.formula),
  ...FRACTIONAL_PROBLEMS.flatMap((p) => p.candidates.map((c) => c.formula)),
]);

export const POOL_SIZE = SALTS.length;
