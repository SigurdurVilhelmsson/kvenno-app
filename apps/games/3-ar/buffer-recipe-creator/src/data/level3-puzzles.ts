// Level 3: Design Constraints with Stock Solutions
// Students work with pre-made stock solutions and calculate volumes

import type { TieredHints } from '@shared/types';

export interface Level3Puzzle {
  id: number;
  problemId: number;           // Reference to BUFFER_PROBLEMS
  taskIs: string;              // Icelandic task description
  stockAcidConc: number;       // Stock solution concentration for acid (M)
  stockBaseConc: number;       // Stock solution concentration for base (M)
  targetVolume: number;        // Target final volume (mL)
  targetConcentration: number; // Target buffer concentration (M)
  volumeTolerance: number;     // Relative tolerance for volumes (e.g., 0.05 = +/-5%)
  hints: TieredHints;
  explanationIs: string;
  // Pre-calculated correct answers
  correctAcidVolume: number;   // mL of acid stock
  correctBaseVolume: number;   // mL of base stock
  correctWaterVolume: number;  // mL of water to add
}

export const LEVEL3_PUZZLES: Level3Puzzle[] = [
  {
    id: 1,
    problemId: 11,  // Phosphate pH 7.40 - Blood buffer
    taskIs: 'Búðu til 100 mL af fosfatstuðpúða við pH 7.40 (blóð-pH) með því að nota birgðalausnir.',
    stockAcidConc: 0.5,  // 0.5 M NaH2PO4
    stockBaseConc: 0.5,  // 0.5 M Na2HPO4
    targetVolume: 100,   // 100 mL final
    targetConcentration: 0.1, // 0.1 M total
    volumeTolerance: 0.05,
    hints: {
      topic: 'Þetta snýst um þynningu birgðalausna og Henderson-Hasselbalch jöfnuna.',
      strategy: 'Fyrst: Reiknaðu hlutfall [Basi]/[Sýra] fyrir pH 7.40 með pKa = 7.20. Síðan: Reiknaðu mól og þá rúmmál.',
      method: 'Hlutfall = 10^(7.40-7.20) = 1.58. Heildar mól = 0.1 M × 0.1 L = 0.01 mol. Skiptu í sýru og basa.',
      solution: 'Sýra: 0.00388 mol, Basi: 0.00612 mol. Úr 0.5 M birgð: Sýra = 7.76 mL, Basi = 12.24 mL.'
    },
    explanationIs: 'Til að búa til 100 mL af 0.1 M fosfatstuðpúða við pH 7.40, þarftu 7.76 mL af 0.5 M NaH₂PO₄ og 12.24 mL af 0.5 M Na₂HPO₄, fyllt upp í 100 mL með vatni.',
    correctAcidVolume: 7.76,
    correctBaseVolume: 12.24,
    correctWaterVolume: 80.0
  },
  {
    id: 2,
    problemId: 14,  // Acetate pH 5.00
    taskIs: 'Búðu til 250 mL af asetatstuðpúða við pH 5.00 með því að nota 1.0 M birgðalausnir.',
    stockAcidConc: 1.0,  // 1.0 M acetic acid
    stockBaseConc: 1.0,  // 1.0 M sodium acetate
    targetVolume: 250,   // 250 mL final
    targetConcentration: 0.1,
    volumeTolerance: 0.05,
    hints: {
      topic: 'Asetatstuðpúði með pKa = 4.74 og markmiðs-pH = 5.00.',
      strategy: 'Hlutfall = 10^(5.00-4.74) = 10^0.26 ≈ 1.82. Meira af basa en sýru.',
      method: 'Heildar mól = 0.1 × 0.25 = 0.025 mol. Sýra: 0.00888 mol, Basi: 0.01612 mol.',
      solution: 'Úr 1.0 M birgð: Sýra = 8.88 mL, Basi = 16.12 mL, Vatn = 225.0 mL.'
    },
    explanationIs: 'Fyrir 250 mL af 0.1 M asetatstuðpúða við pH 5.00 þarftu 8.88 mL af 1.0 M ediksýru og 16.12 mL af 1.0 M natríumasetati.',
    correctAcidVolume: 8.88,
    correctBaseVolume: 16.12,
    correctWaterVolume: 225.0
  },
  {
    id: 3,
    problemId: 13,  // TRIS pH 8.00
    taskIs: 'Búðu til 50 mL af TRIS-stuðpúða við pH 8.00 fyrir DNA einangrun.',
    stockAcidConc: 0.25,  // 0.25 M TRIS-HCl
    stockBaseConc: 0.25,  // 0.25 M TRIS base
    targetVolume: 50,
    targetConcentration: 0.05,
    volumeTolerance: 0.05,
    hints: {
      topic: 'TRIS-stuðpúði er algengur í sameindalíffræði með pKa = 8.06.',
      strategy: 'pH 8.00 er LÆGRA en pKa 8.06, þannig að þú þarft meira af sýru. Hlutfall = 10^(-0.06) = 0.87.',
      method: 'Heildar mól = 0.05 M × 0.05 L = 0.0025 mol. Sýra: 0.00134 mol, Basi: 0.00116 mol.',
      solution: 'Úr 0.25 M birgð: Sýra = 5.36 mL, Basi = 4.64 mL, Vatn = 40.0 mL.'
    },
    explanationIs: 'TRIS-stuðpúði við pH 8.00 þarf hlutfall 0.87 (lítið meira af sýru). Fyrir 50 mL af 0.05 M stuðpúða: 5.36 mL sýrubirgð, 4.64 mL basabirgð.',
    correctAcidVolume: 5.36,
    correctBaseVolume: 4.64,
    correctWaterVolume: 40.0
  },
  {
    id: 4,
    problemId: 21,  // Phosphate pH 7.00
    taskIs: 'Búðu til 500 mL af fosfatstuðpúða við hlutlaust pH (7.00).',
    stockAcidConc: 1.0,
    stockBaseConc: 1.0,
    targetVolume: 500,
    targetConcentration: 0.05,
    volumeTolerance: 0.05,
    hints: {
      topic: 'Fosfatstuðpúði við pH 7.00, sem er UNDIR pKa (7.20).',
      strategy: 'Hlutfall = 10^(7.00-7.20) = 10^(-0.20) = 0.63. Meira af sýru.',
      method: 'Heildar mól = 0.05 × 0.5 = 0.025 mol. Sýra: 0.01534 mol, Basi: 0.00966 mol.',
      solution: 'Úr 1.0 M birgð: Sýra = 15.34 mL, Basi = 9.66 mL, Vatn = 475.0 mL.'
    },
    explanationIs: 'Við pH 7.00 (undir pKa) þarf meira af sýru. Hlutfall 0.63 þýðir um 60% meira sýra en basi.',
    correctAcidVolume: 15.34,
    correctBaseVolume: 9.66,
    correctWaterVolume: 475.0
  },
  {
    id: 5,
    problemId: 17,  // Ammonia pH 9.50
    taskIs: 'Búðu til 200 mL af ammóníustuðpúða við pH 9.50.',
    stockAcidConc: 2.0,  // 2.0 M NH4Cl
    stockBaseConc: 2.0,  // 2.0 M NH3
    targetVolume: 200,
    targetConcentration: 0.2,
    volumeTolerance: 0.05,
    hints: {
      topic: 'Ammóníustuðpúði með pKa = 9.25 og markmiðs-pH = 9.50.',
      strategy: 'pH > pKa þannig að hlutfall > 1. Hlutfall = 10^(0.25) = 1.78.',
      method: 'Heildar mól = 0.2 × 0.2 = 0.04 mol. Sýra: 0.0142 mol, Basi: 0.0258 mol.',
      solution: 'Úr 2.0 M birgð: Sýra = 7.10 mL, Basi = 12.90 mL, Vatn = 180.0 mL.'
    },
    explanationIs: 'Ammóníustuðpúði við pH 9.50 þarf hlutfall 1.78, sem þýðir næstum tvöfalt meira af NH₃ en NH₄Cl.',
    correctAcidVolume: 7.10,
    correctBaseVolume: 12.90,
    correctWaterVolume: 180.0
  },
  {
    id: 6,
    problemId: 15,  // Phosphate pH 6.80
    taskIs: 'Búðu til 1000 mL (1 L) af fosfatstuðpúða við pH 6.80 fyrir frumuræktun.',
    stockAcidConc: 0.5,
    stockBaseConc: 0.5,
    targetVolume: 1000,
    targetConcentration: 0.1,
    volumeTolerance: 0.05,
    hints: {
      topic: 'Fosfatstuðpúði við pH 6.80, sem er töluvert undir pKa (7.20).',
      strategy: 'Hlutfall = 10^(6.80-7.20) = 10^(-0.40) = 0.40. Miklu meira af sýru.',
      method: 'Heildar mól = 0.1 × 1.0 = 0.1 mol. Sýra: 0.0714 mol, Basi: 0.0286 mol.',
      solution: 'Úr 0.5 M birgð: Sýra = 142.8 mL, Basi = 57.2 mL, Vatn = 800.0 mL.'
    },
    explanationIs: 'Við pH 6.80 (0.40 undir pKa) er hlutfall aðeins 0.40, sem þýðir 2.5× meira af sýru en basa.',
    correctAcidVolume: 142.8,
    correctBaseVolume: 57.2,
    correctWaterVolume: 800.0
  }
];
