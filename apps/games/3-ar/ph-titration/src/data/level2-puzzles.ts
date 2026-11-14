// Level 2: Interactive titration puzzles

import { formatDecimal } from '@shared/utils';

import { indicators } from './indicators';
import { getTitrationById } from './titrations';
import type { IndicatorType, MonoproticTitration } from '../types';
import { calculatePH } from '../utils/ph-calculations';

export interface Level2Puzzle {
  id: number;
  titrationId: number; // Reference to titrations.ts
  taskIs: string;
  task: string;
  /**
   * How far the endpoint, the burette reading where the student stopped, may
   * be from the equivalence volume, in mL. 0,2 since the endpoint became a
   * burette reading read to the drop (2026-11-14); the curve-marking slider it
   * replaced had 1,0 and then 0,5.
   */
  volumeTolerance: number;
  /** Derived by Level 1's rule, never listed by hand: see `acceptableIndicatorsFor`. */
  acceptableIndicators: IndicatorType[];
  hintIs: string;
  hint: string;
  explanationIs: string;
  explanation: string;
}

/** A puzzle as written; its acceptable indicators are derived below. */
type Level2PuzzleData = Omit<Level2Puzzle, 'acceptableIndicators'>;

/**
 * The equivalence pH as the result screen prints it: the curve's own value at
 * the equivalence volume, to one decimal, which is also the precision every
 * indicator's range is written to. HF's curve reaches 7,97 there and the
 * marking readout and the result both say pH 8,0, so the rule is applied to
 * 8,0 — what the student sees — and not to 7,97, which no range here contains.
 */
export function printedEquivalencePH(titrationId: number): number {
  const titration = getTitrationById(titrationId);
  if (!titration) throw new Error(`no titration ${titrationId}`);
  return Math.round(calculatePH(titration, titration.equivalenceVolume) * 10) / 10;
}

/**
 * How close to the equivalence volume an indicator's whole colour change must
 * fall, in mL: about two drops. A drop from a burette is about 0,05 mL.
 */
export const ENDPOINT_WINDOW_ML = 0.1;

type TitrationRef = MonoproticTitration | number;

const resolve = (t: TitrationRef): MonoproticTitration => {
  const titration = typeof t === 'number' ? getTitrationById(t) : t;
  if (!titration) throw new Error(`no titration ${String(t)}`);
  return titration;
};

/** The volume at which the titration's pH reaches `target`, by bisection (pH is monotonic in volume). */
function volumeAtPH(titration: MonoproticTitration, target: number): number {
  const rising = calculatePH(titration, 60) > calculatePH(titration, 0);
  let lo = 0;
  let hi = 60;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (calculatePH(titration, mid) < target === rising) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Where an indicator changes colour on this titration's curve, in mL from the
 * equivalence volume: from where the pH enters its range to where it leaves.
 */
export function colourChangeWindow(t: TitrationRef, indicatorId: string): [number, number] {
  const titration = resolve(t);
  const indicator = indicators.find((i) => i.id === indicatorId);
  if (!indicator) throw new Error(`no indicator ${indicatorId}`);
  const [a, b] = indicator.pHRange.map(
    (pH) => volumeAtPH(titration, pH) - titration.equivalenceVolume
  );
  return [Math.min(a, b), Math.max(a, b)];
}

/**
 * Every indicator whose whole colour change falls within ENDPOINT_WINDOW_ML of
 * the equivalence volume on the curve: where the curve is that steep, the
 * endpoint is the equivalence point to a drop or two. That is the textbook's
 * rule (ch. 14, m68809): any of methyl red, bromothymol blue and
 * phenolphthalein for a strong acid with a strong base, phenolphthalein for a
 * weak acid. Siggi's ruling, 2026-11-14, replacing decision 113 (a), which
 * accepted an indicator only if its range contained the equivalence pH and so
 * marked phenolphthalein wrong for HCl + NaOH, which changes colour within
 * 0,05 mL of it. Before 113 (a) each puzzle listed its indicators by hand,
 * inconsistently. A titration no indicator suits throws here, on import,
 * rather than ship a puzzle nobody can answer.
 */
export function acceptableIndicatorsFor(t: TitrationRef): IndicatorType[] {
  const suited = indicators
    .filter((i) => {
      const [from, to] = colourChangeWindow(t, i.id);
      return from >= -ENDPOINT_WINDOW_ML && to <= ENDPOINT_WINDOW_ML;
    })
    .map((i) => i.id);
  if (suited.length === 0) {
    throw new Error(`titration ${resolve(t).id}: no indicator changes colour at equivalence`);
  }
  return suited;
}

/**
 * The sample's concentration varies around the stored one by this factor,
 * either way, so a classmate's answer does not carry over and the titration
 * finds something the student did not know (2026-11-14). It stays narrow
 * enough that the accepted indicators do not change (level2-puzzles.test.ts).
 */
export const CONCENTRATION_SPREAD = 0.2;

/** Equivalence volumes are kept between these, mL, so the 60 mL burette always reaches them. */
const EQUIVALENCE_RANGE: [number, number] = [10, 50];

/** Rounds to three significant figures, as a concentration on a bottle is written. */
const threeFigures = (x: number) => Number(x.toPrecision(3));

/** A sample of this titration's analyte at another concentration. */
export function sampleOf(base: TitrationRef, molarity: number): MonoproticTitration {
  const t = resolve(base);
  return {
    ...t,
    analyte: { ...t.analyte, molarity },
    // Every titration here reacts 1:1.
    equivalenceVolume: (molarity * t.analyte.volume) / t.titrant.molarity,
  };
}

/** The concentration range a sample of this titration is drawn from, M. */
export function concentrationRange(base: TitrationRef): [number, number] {
  const t = resolve(base);
  const perMl = t.titrant.molarity / t.analyte.volume; // M of sample per mL at equivalence
  return [
    Math.max(t.analyte.molarity * (1 - CONCENTRATION_SPREAD), EQUIVALENCE_RANGE[0] * perMl),
    Math.min(t.analyte.molarity * (1 + CONCENTRATION_SPREAD), EQUIVALENCE_RANGE[1] * perMl),
  ];
}

/** A concentration drawn from `concentrationRange`, to three significant figures. */
export function randomMolarity(base: TitrationRef, rand: () => number = Math.random): number {
  const [lo, hi] = concentrationRange(base);
  return threeFigures(lo + rand() * (hi - lo));
}

/** The concentration the student's own endpoint gives (1:1): what their answer is graded against. */
export function molarityFromEndpoint(sample: MonoproticTitration, endpointMl: number): number {
  return (sample.titrant.molarity * endpointMl) / sample.analyte.volume;
}

/** Relative tolerance on the student's concentration, against their own endpoint. */
export const CONCENTRATION_TOLERANCE = 0.02;

const PUZZLES: Level2PuzzleData[] = [
  {
    id: 1,
    titrationId: 1, // HCl + NaOH (strong-strong)
    taskIs:
      'Títraðu 25,0 mL af HCl af óþekktum styrk með 0,100 M NaOH. Veldu litvísi, finndu endapunktinn og reiknaðu styrk sýrunnar.',
    task: 'Titrate 25.0 mL of HCl of unknown concentration with 0.100 M NaOH. Choose an indicator, find the endpoint and calculate the acid concentration.',
    volumeTolerance: 0.2,
    hintIs:
      'Fyrir sterka sýru + sterkan basa er jafngildispunktur við pH = 7, og ferillinn er nær lóðréttur þar. Veldu litvísi sem skiptir um lit einhvers staðar á lóðrétta kaflanum.',
    hint: 'For strong acid + strong base, equivalence point is at pH = 7, and the curve is nearly vertical there. Choose an indicator that changes colour somewhere on the vertical part.',
    explanationIs:
      'HCl + NaOH gefur NaCl + H₂O. Saltið NaCl er hlutlaust, svo jafngildispunktur er við pH = 7. Ferillinn fer nær lóðrétt frá pH 4 upp í 10, svo metýlrautt, brómþýmólblátt, fenólftalín og þýmólblátt skipta öll um lit innan við 0,1 mL frá jafngildispunktinum.',
    explanation:
      'HCl + NaOH produces NaCl + H₂O. The salt NaCl is neutral, so equivalence point is at pH = 7. The curve rises nearly vertically from pH 4 to 10, so methyl red, bromothymol blue, phenolphthalein and thymol blue all change colour within 0.1 mL of equivalence.',
  },
  {
    id: 2,
    titrationId: 5, // CH₃COOH + NaOH (weak-strong)
    taskIs:
      'Títraðu 25,0 mL af ediksýru (CH₃COOH) af óþekktum styrk með 0,100 M NaOH. Athugaðu að jafngildispunktur er EKKI við pH 7!',
    task: 'Titrate 25.0 mL of acetic acid (CH₃COOH) of unknown concentration with 0.100 M NaOH. Note that equivalence point is NOT at pH 7!',
    volumeTolerance: 0.2,
    hintIs:
      'Veik sýra + sterkur basi myndar basískan samoka basa við jafngildispunkt. pH verður hærra en 7.',
    hint: 'Weak acid + strong base forms basic conjugate base at equivalence. pH will be higher than 7.',
    explanationIs:
      'CH₃COOH + NaOH gefur CH₃COONa. Asetatjónin (CH₃COO⁻) er veikur basi, svo lausnin verður basísk við jafngildispunkt (~pH 8,7). Fenólftalín (pH 8,3-10,0) eða þýmólblátt (pH 8,0-9,6) eru góðir litvísar.',
    explanation:
      'CH₃COOH + NaOH produces CH₃COONa. The acetate ion (CH₃COO⁻) is a weak base, so solution becomes basic at equivalence (~pH 8.7). Phenolphthalein (pH 8.3-10.0) or thymol blue (pH 8.0-9.6) are good indicators.',
  },
  {
    id: 3,
    titrationId: 2, // HNO₃ + KOH
    taskIs: 'Títraðu 30,0 mL af saltpéturssýru (HNO₃) af óþekktum styrk með 0,100 M KOH.',
    task: 'Titrate 30.0 mL of nitric acid (HNO₃) of unknown concentration with 0.100 M KOH.',
    volumeTolerance: 0.2,
    hintIs: 'Þetta er títrun sterkrar sýru með sterkum basa, svipað og HCl + NaOH.',
    hint: 'This is a strong acid + strong base titration, similar to HCl + NaOH.',
    explanationIs:
      'HNO₃ + KOH gefur KNO₃ + H₂O. Eins og í allri títrun sterkrar sýru með sterkum basa er jafngildispunktur við pH = 7 og ferillinn nær lóðréttur þar. Metýlrautt, brómþýmólblátt, fenólftalín og þýmólblátt skipta öll um lit innan við 0,1 mL frá jafngildispunktinum.',
    explanation:
      'HNO₃ + KOH produces KNO₃ + H₂O. Like all strong-strong titrations, equivalence point is at pH = 7 and the curve is nearly vertical there. Methyl red, bromothymol blue, phenolphthalein and thymol blue all change colour within 0.1 mL of equivalence.',
  },
  {
    id: 4,
    titrationId: 9, // NH₃ + HCl (weak base + strong acid)
    taskIs:
      'Títraðu 25,0 mL af ammóníaki (NH₃) af óþekktum styrk með 0,100 M HCl. Þetta er veikur basi + sterk sýra!',
    task: 'Titrate 25.0 mL of ammonia (NH₃) of unknown concentration with 0.100 M HCl. This is weak base + strong acid!',
    volumeTolerance: 0.2,
    hintIs:
      'Veikur basi + sterk sýra myndar súra samoka sýru við jafngildispunkt. pH verður lægra en 7.',
    hint: 'Weak base + strong acid forms acidic conjugate acid at equivalence. pH will be lower than 7.',
    explanationIs:
      'NH₃ + HCl gefur NH₄Cl. Ammóníumjónin (NH₄⁺) er veik sýra, svo lausnin verður súr við jafngildispunkt (~pH 5,3). Metýlrautt (pH 4,4-6,2) er góður litvísir.',
    explanation:
      'NH₃ + HCl produces NH₄Cl. The ammonium ion (NH₄⁺) is a weak acid, so solution becomes acidic at equivalence (~pH 5.3). Methyl red (pH 4.4-6.2) is a good indicator.',
  },
  {
    id: 5,
    titrationId: 6, // HF + NaOH
    taskIs: 'Títraðu 30,0 mL af flússýru (HF) af óþekktum styrk með 0,100 M NaOH. HF er veik sýra.',
    task: 'Titrate 30.0 mL of hydrofluoric acid (HF) of unknown concentration with 0.100 M NaOH. HF is a weak acid.',
    volumeTolerance: 0.2,
    hintIs: 'HF er veik sýra þó hún sé halógenvetnissýra. Jafngildispunktur verður yfir pH 7.',
    hint: 'HF is a weak acid despite being a halogen acid. Equivalence point will be above pH 7.',
    explanationIs:
      'HF + NaOH gefur NaF. Flúoríðjónin (F⁻) er veikur basi (samoka basi HF), svo lausnin verður basísk við jafngildispunkt. pKₐ(HF) ≈ 3,17. Við jafngildispunkt er pH um 8,0 og ferillinn brattur, svo brómþýmólblátt, fenólftalín og þýmólblátt skipta öll um lit innan við 0,1 mL frá honum.',
    explanation:
      'HF + NaOH produces NaF. The fluoride ion (F⁻) is a weak base (conjugate base of HF), so solution becomes basic at equivalence. pKₐ(HF) ≈ 3.17. At equivalence the pH is about 8.0 and the curve is steep, so bromothymol blue, phenolphthalein and thymol blue all change colour within 0.1 mL of it.',
  },
  {
    id: 6,
    titrationId: 7, // HCOOH + KOH (formic acid)
    taskIs: 'Títraðu 20,0 mL af maurasýru (HCOOH) af óþekktum styrk með 0,100 M KOH.',
    task: 'Titrate 20.0 mL of formic acid (HCOOH) of unknown concentration with 0.100 M KOH.',
    volumeTolerance: 0.2,
    hintIs: 'Maurasýra er veik sýra eins og ediksýra. Jafngildispunktur verður yfir pH 7.',
    hint: 'Formic acid is a weak acid like acetic acid. Equivalence point will be above pH 7.',
    explanationIs:
      'HCOOH + KOH gefur HCOOK. Formiatjónin (HCOO⁻) er veikur basi, svo lausnin verður basísk við jafngildispunkt. pKₐ(HCOOH) ≈ 3,74. Fenólftalín (pH 8,3-10,0) eða þýmólblátt (pH 8,0-9,6) eru góðir litvísar.',
    explanation:
      'HCOOH + KOH produces HCOOK. The formate ion (HCOO⁻) is a weak base, so solution becomes basic at equivalence. pKₐ(HCOOH) ≈ 3.74. Phenolphthalein (pH 8.3-10.0) or thymol blue (pH 8.0-9.6) are good indicators.',
  },
];

export const LEVEL2_PUZZLES: Level2Puzzle[] = PUZZLES.map((puzzle) => ({
  ...puzzle,
  acceptableIndicators: acceptableIndicatorsFor(puzzle.titrationId),
}));

/** A molarity to three significant figures, with a decimal comma: 0,0960 M. */
export function formatMolarity(m: number): string {
  if (!(m > 0)) return formatDecimal(m, 3);
  const decimals = Math.max(0, 2 - Math.floor(Math.log10(m)));
  return formatDecimal(Number(m.toPrecision(3)), decimals);
}
