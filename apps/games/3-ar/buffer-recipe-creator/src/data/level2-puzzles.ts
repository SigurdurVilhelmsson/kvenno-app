// Level 2: Henderson-Hasselbalch Calculations
// Students apply the formula to calculate ratios and masses

import type { TieredHints } from '@shared/types';

export interface Level2Puzzle {
  id: number;
  problemId: number;           // Reference to BUFFER_PROBLEMS
  taskIs: string;              // Icelandic task description
  ratioTolerance: number;      // Relative tolerance for ratio (e.g., 0.1 = ±10%)
  massTolerance: number;       // Relative tolerance for mass (e.g., 0.05 = ±5%)
  hints: TieredHints;
  explanationIs: string;
}

export const LEVEL2_PUZZLES: Level2Puzzle[] = [
  {
    id: 1,
    problemId: 11,  // Phosphate pH 7.40 - Blood buffer
    taskIs: 'Búðu til fosfatstuðpúða við blóð-pH (7.40) úr NaH₂PO₄ og Na₂HPO₄.',
    ratioTolerance: 0.10,
    massTolerance: 0.05,
    hints: {
      topic: 'Þetta snýst um Henderson-Hasselbalch jöfnuna: pH = pKa + log([Basi]/[Sýra]).',
      strategy: 'Markmiðs-pH (7.40) er HÆRRA en pKa (7.20), svo þú þarft meira af basa. Reiknaðu hlutfallið fyrst.',
      method: 'Skref 1: pH - pKa = 7.40 - 7.20 = 0.20. Skref 2: Hlutfall = 10^0.20 ≈ 1.58.',
      solution: 'Hlutfall = 1.58. Með 0.100 M og 1.0 L: 0.0388 mol sýru (4.65 g) og 0.0612 mol basa (8.69 g).'
    },
    explanationIs: 'Blóð pH er 7.40, sem er 0.20 einingum yfir pKa fosfats. Þetta þýðir að hlutfall [Basi]/[Sýra] = 10^0.20 ≈ 1.58. Líkaminn viðheldur þessu hlutfalli til að halda pH stöðugu.'
  },
  {
    id: 2,
    problemId: 14,  // Acetate pH 5.00
    taskIs: 'Búðu til asetatstuðpúða við pH 5.00 úr ediksýru og natríumasetati.',
    ratioTolerance: 0.10,
    massTolerance: 0.05,
    hints: {
      topic: 'Asetatstuðpúði notar Henderson-Hasselbalch jöfnuna með pKa = 4.74.',
      strategy: 'Markmiðs-pH (5.00) er HÆRRA en pKa (4.74). Munurinn er 0.26 einingar.',
      method: 'Hlutfall = 10^(pH - pKa) = 10^(5.00 - 4.74) = 10^0.26 ≈ 1.82.',
      solution: 'Hlutfall = 1.82. Með 0.100 M og 1.0 L: 0.0355 mol sýru (2.13 g) og 0.0645 mol basa (5.98 g).'
    },
    explanationIs: 'Til að ná pH 5.00 (0.26 yfir pKa) þarf hlutfall 1.82. Þetta þýðir næstum tvöfalt meira af basa en sýru.'
  },
  {
    id: 3,
    problemId: 17,  // Ammonia pH 9.50
    taskIs: 'Búðu til ammóníustuðpúða við pH 9.50 úr ammoniumklóríði og ammóníaki.',
    ratioTolerance: 0.10,
    massTolerance: 0.05,
    hints: {
      topic: 'Ammóníustuðpúði virkar við hátt pH með pKa = 9.25.',
      strategy: 'Markmiðs-pH (9.50) er HÆRRA en pKa (9.25). Þarftu meira af basa.',
      method: 'Hlutfall = 10^(9.50 - 9.25) = 10^0.25 ≈ 1.78.',
      solution: 'Hlutfall = 1.78. Með 0.100 M og 1.0 L: 0.0355 mol sýru (1.89 g) og 0.0645 mol basa (1.21 g).'
    },
    explanationIs: 'Ammóníustuðpúði við pH 9.50 þarf hlutfall 1.78. Athugaðu að ammóníak (NH₃) hefur mjög lágan mólarmassa (17 g/mol) svo massinn er lítill.'
  },
  {
    id: 4,
    problemId: 13,  // TRIS pH 8.00
    taskIs: 'Búðu til TRIS-stuðpúða við pH 8.00 fyrir DNA-rannsóknir.',
    ratioTolerance: 0.10,
    massTolerance: 0.05,
    hints: {
      topic: 'TRIS er algengur stuðpúði í sameindalíffræði með pKa = 8.06.',
      strategy: 'Markmiðs-pH (8.00) er LÆGRA en pKa (8.06). Þarftu meira af sýru.',
      method: 'Hlutfall = 10^(8.00 - 8.06) = 10^(-0.06) ≈ 0.87.',
      solution: 'Hlutfall = 0.87. Með 0.050 M og 0.5 L: 0.0134 mol sýru (2.10 g) og 0.0116 mol basa (1.41 g).'
    },
    explanationIs: 'TRIS-stuðpúði við pH 8.00 (lítið undir pKa) þarf hlutfall 0.87. Þetta þýðir aðeins meira af sýru. TRIS er notað í PCR og rafdráttum.'
  },
  {
    id: 5,
    problemId: 19,  // Formic acid pH 4.00
    taskIs: 'Búðu til maurasýrustuðpúða við pH 4.00.',
    ratioTolerance: 0.10,
    massTolerance: 0.05,
    hints: {
      topic: 'Maurasýra (HCOOH) hefur pKa = 3.75, lægra en ediksýra.',
      strategy: 'Markmiðs-pH (4.00) er HÆRRA en pKa (3.75). Þarftu meira af basa.',
      method: 'Hlutfall = 10^(4.00 - 3.75) = 10^0.25 ≈ 1.78.',
      solution: 'Hlutfall = 1.78. Með 0.100 M og 1.0 L: 0.0561 mol sýru (2.58 g) og 0.0439 mol basa (4.80 g).'
    },
    explanationIs: 'Maurasýrustuðpúði við pH 4.00 þarf hlutfall 1.78. Maurasýra er einfaldasta karboxýlsýran (HCOOH).'
  },
  {
    id: 6,
    problemId: 21,  // Phosphate pH 7.00
    taskIs: 'Búðu til fosfatstuðpúða við pH 7.00 (hlutlaust).',
    ratioTolerance: 0.10,
    massTolerance: 0.05,
    hints: {
      topic: 'Fosfatstuðpúði við hlutlaust pH þarf meira af sýru.',
      strategy: 'Markmiðs-pH (7.00) er LÆGRA en pKa (7.20). Þarftu meira af sýru.',
      method: 'Hlutfall = 10^(7.00 - 7.20) = 10^(-0.20) ≈ 0.63.',
      solution: 'Hlutfall = 0.63. Með 0.100 M og 1.0 L: 0.0613 mol sýru (7.59 g) og 0.0387 mol basa (5.66 g).'
    },
    explanationIs: 'Til að ná pH 7.00 (0.20 undir pKa) þarf hlutfall 0.63. Þetta þýðir um 60% meira af sýru en basa.'
  }
];
