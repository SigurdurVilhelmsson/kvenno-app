// Level 2: Interactive titration puzzles

import { indicators, isIndicatorAppropriate } from './indicators';
import { getTitrationById } from './titrations';
import type { IndicatorType } from '../types';
import { calculatePH } from '../utils/ph-calculations';

export interface Level2Puzzle {
  id: number;
  titrationId: number; // Reference to titrations.ts
  taskIs: string;
  task: string;
  volumeTolerance: number; // Acceptable error in mL
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
 * Every indicator whose colour-change range contains the equivalence pH —
 * Level 1's rule (question 6), through `isIndicatorAppropriate`. Mobile-pass
 * decision 113 (a), 2026-10-23. Until then each puzzle listed its indicators
 * by hand, and the lists broke that rule and disagreed with each other: methyl
 * red was accepted for HCl + NaOH (pH 7), methyl orange refused for it and
 * accepted for HNO₃ + KOH (also pH 7) and for ammonia (pH 5,3), and
 * phenolphthalein accepted for HF (pH 8,0). A titration no indicator suits
 * throws here, on import, rather than ship a puzzle nobody can answer.
 */
export function acceptableIndicatorsFor(titrationId: number): IndicatorType[] {
  const pH = printedEquivalencePH(titrationId);
  const suited = indicators.filter((i) => isIndicatorAppropriate(i.id, pH)).map((i) => i.id);
  if (suited.length === 0) {
    throw new Error(`titration ${titrationId}: no indicator's range contains pH ${pH}`);
  }
  return suited;
}

const PUZZLES: Level2PuzzleData[] = [
  {
    id: 1,
    titrationId: 1, // HCl + NaOH (strong-strong)
    taskIs:
      'Títraðu 25,0 mL af 0,100 M HCl með 0,100 M NaOH. Finndu jafngildispunktinn og veldu viðeigandi vísi.',
    task: 'Titrate 25.0 mL of 0.100 M HCl with 0.100 M NaOH. Find the equivalence point and select an appropriate indicator.',
    volumeTolerance: 1.0,
    hintIs:
      'Fyrir sterka sýru + sterkan basa er jafngildispunktur við pH = 7. Veldu vísi með litbreytingasvið sem inniheldur pH 7.',
    hint: 'For strong acid + strong base, equivalence point is at pH = 7. Choose an indicator whose color change range contains pH 7.',
    explanationIs:
      'HCl + NaOH gefur NaCl + H₂O. Saltið NaCl er hlutlaust, svo jafngildispunktur er við pH = 7. Brómþýmólblátt (pH 6,0-7,6) er góður vísir.',
    explanation:
      'HCl + NaOH produces NaCl + H₂O. The salt NaCl is neutral, so equivalence point is at pH = 7. Bromothymol blue (pH 6.0-7.6) is a good indicator.',
  },
  {
    id: 2,
    titrationId: 5, // CH₃COOH + NaOH (weak-strong)
    taskIs:
      'Títraðu 25,0 mL af 0,100 M ediksýru (CH₃COOH) með 0,100 M NaOH. Athugaðu að jafngildispunktur er EKKI við pH 7!',
    task: 'Titrate 25.0 mL of 0.100 M acetic acid (CH₃COOH) with 0.100 M NaOH. Note that equivalence point is NOT at pH 7!',
    volumeTolerance: 1.0,
    hintIs:
      'Veik sýra + sterkur basi myndar basískan samoka basa við jafngildispunkt. pH verður hærra en 7.',
    hint: 'Weak acid + strong base forms basic conjugate base at equivalence. pH will be higher than 7.',
    explanationIs:
      'CH₃COOH + NaOH gefur CH₃COONa. Asetatjónin (CH₃COO⁻) er veikur basi, svo lausnin verður basísk við jafngildispunkt (~pH 8,7). Fenólftalín (pH 8,3-10,0) eða þýmólblátt (pH 8,0-9,6) eru góðir vísar.',
    explanation:
      'CH₃COOH + NaOH produces CH₃COONa. The acetate ion (CH₃COO⁻) is a weak base, so solution becomes basic at equivalence (~pH 8.7). Phenolphthalein (pH 8.3-10.0) or thymol blue (pH 8.0-9.6) are good indicators.',
  },
  {
    id: 3,
    titrationId: 2, // HNO₃ + KOH
    taskIs: 'Títraðu 30,0 mL af 0,050 M saltpéturssýru (HNO₃) með 0,100 M KOH.',
    task: 'Titrate 30.0 mL of 0.050 M nitric acid (HNO₃) with 0.100 M KOH.',
    volumeTolerance: 1.0,
    hintIs: 'Þetta er títrun sterkrar sýru með sterkum basa, svipað og HCl + NaOH.',
    hint: 'This is a strong acid + strong base titration, similar to HCl + NaOH.',
    explanationIs:
      'HNO₃ + KOH gefur KNO₃ + H₂O. Eins og öll sterk-sterk títrun, er jafngildispunktur við pH = 7. Brómþýmólblátt (pH 6,0-7,6) er góður vísir.',
    explanation:
      'HNO₃ + KOH produces KNO₃ + H₂O. Like all strong-strong titrations, equivalence point is at pH = 7. Bromothymol blue (pH 6.0-7.6) is a good indicator.',
  },
  {
    id: 4,
    titrationId: 9, // NH₃ + HCl (weak base + strong acid)
    taskIs:
      'Títraðu 25,0 mL af 0,100 M ammóníaki (NH₃) með 0,100 M HCl. Þetta er veikur basi + sterk sýra!',
    task: 'Titrate 25.0 mL of 0.100 M ammonia (NH₃) with 0.100 M HCl. This is weak base + strong acid!',
    volumeTolerance: 1.0,
    hintIs:
      'Veikur basi + sterk sýra myndar súra samoka sýru við jafngildispunkt. pH verður lægra en 7.',
    hint: 'Weak base + strong acid forms acidic conjugate acid at equivalence. pH will be lower than 7.',
    explanationIs:
      'NH₃ + HCl gefur NH₄Cl. Ammóníumjónin (NH₄⁺) er veik sýra, svo lausnin verður súr við jafngildispunkt (~pH 5,3). Metýlrautt (pH 4,4-6,2) er góður vísir.',
    explanation:
      'NH₃ + HCl produces NH₄Cl. The ammonium ion (NH₄⁺) is a weak acid, so solution becomes acidic at equivalence (~pH 5.3). Methyl red (pH 4.4-6.2) is a good indicator.',
  },
  {
    id: 5,
    titrationId: 6, // HF + NaOH
    taskIs: 'Títraðu 30,0 mL af 0,150 M flússýru (HF) með 0,100 M NaOH. HF er veik sýra.',
    task: 'Titrate 30.0 mL of 0.150 M hydrofluoric acid (HF) with 0.100 M NaOH. HF is a weak acid.',
    volumeTolerance: 1.0,
    hintIs: 'HF er veik sýra þó hún sé halógenvetnissýra. Jafngildispunktur verður yfir pH 7.',
    hint: 'HF is a weak acid despite being a halogen acid. Equivalence point will be above pH 7.',
    explanationIs:
      'HF + NaOH gefur NaF. Flúoríðjónin (F⁻) er veikur basi (samoka basi HF), svo lausnin verður basísk við jafngildispunkt. pKₐ(HF) ≈ 3,17. Við jafngildispunkt er pH um 8,0, svo þýmólblátt (pH 8,0-9,6) er góður vísir.',
    explanation:
      'HF + NaOH produces NaF. The fluoride ion (F⁻) is a weak base (conjugate base of HF), so solution becomes basic at equivalence. pKₐ(HF) ≈ 3.17. At equivalence the pH is about 8.0, so thymol blue (pH 8.0-9.6) is a good indicator.',
  },
  {
    id: 6,
    titrationId: 7, // HCOOH + KOH (formic acid)
    taskIs: 'Títraðu 20,0 mL af 0,200 M maurasýru (HCOOH) með 0,100 M KOH.',
    task: 'Titrate 20.0 mL of 0.200 M formic acid (HCOOH) with 0.100 M KOH.',
    volumeTolerance: 1.0,
    hintIs: 'Maurasýra er veik sýra eins og ediksýra. Jafngildispunktur verður yfir pH 7.',
    hint: 'Formic acid is a weak acid like acetic acid. Equivalence point will be above pH 7.',
    explanationIs:
      'HCOOH + KOH gefur HCOOK. Formiatjónin (HCOO⁻) er veikur basi, svo lausnin verður basísk við jafngildispunkt. pKₐ(HCOOH) ≈ 3,74. Fenólftalín (pH 8,3-10,0) eða þýmólblátt (pH 8,0-9,6) eru góðir vísar.',
    explanation:
      'HCOOH + KOH produces HCOOK. The formate ion (HCOO⁻) is a weak base, so solution becomes basic at equivalence. pKₐ(HCOOH) ≈ 3.74. Phenolphthalein (pH 8.3-10.0) or thymol blue (pH 8.0-9.6) are good indicators.',
  },
];

export const LEVEL2_PUZZLES: Level2Puzzle[] = PUZZLES.map((puzzle) => ({
  ...puzzle,
  acceptableIndicators: acceptableIndicatorsFor(puzzle.titrationId),
}));
