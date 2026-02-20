// Level 3: Design Constraints with Stock Solutions
// Students work with pre-made stock solutions and calculate volumes

import type { TieredHints } from '@shared/types';

export interface Level3Puzzle {
  id: number;
  problemId: number;           // Reference to BUFFER_PROBLEMS
  taskIs: string;              // Icelandic task description
  taskEn?: string;             // English task description
  taskPl?: string;             // Polish task description
  stockAcidConc: number;       // Stock solution concentration for acid (M)
  stockBaseConc: number;       // Stock solution concentration for base (M)
  targetVolume: number;        // Target final volume (mL)
  targetConcentration: number; // Target buffer concentration (M)
  volumeTolerance: number;     // Relative tolerance for volumes (e.g., 0.05 = +/-5%)
  hints: TieredHints;
  hintsEn?: TieredHints;
  hintsPl?: TieredHints;
  explanationIs: string;
  explanationEn?: string;
  explanationPl?: string;
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
    taskEn: 'Prepare 100 mL of phosphate buffer at pH 7.40 (blood pH) using stock solutions.',
    taskPl: 'Przygotuj 100 mL buforu fosforanowego o pH 7.40 (pH krwi) z roztworów podstawowych.',
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
    hintsEn: {
      topic: 'This is about diluting stock solutions and the Henderson-Hasselbalch equation.',
      strategy: 'First: Calculate the [Base]/[Acid] ratio for pH 7.40 with pKa = 7.20. Then: Calculate moles and volumes.',
      method: 'Ratio = 10^(7.40-7.20) = 1.58. Total moles = 0.1 M × 0.1 L = 0.01 mol. Split into acid and base.',
      solution: 'Acid: 0.00388 mol, Base: 0.00612 mol. From 0.5 M stock: Acid = 7.76 mL, Base = 12.24 mL.'
    },
    hintsPl: {
      topic: 'To dotyczy rozcieńczania roztworów podstawowych i równania Hendersona-Hasselbalcha.',
      strategy: 'Najpierw: Oblicz proporcję [Zasada]/[Kwas] dla pH 7.40 z pKa = 7.20. Następnie: Oblicz mole i objętości.',
      method: 'Proporcja = 10^(7.40-7.20) = 1.58. Łączne mole = 0.1 M × 0.1 L = 0.01 mol. Rozdziel na kwas i zasadę.',
      solution: 'Kwas: 0.00388 mol, Zasada: 0.00612 mol. Z 0.5 M roztworu: Kwas = 7.76 mL, Zasada = 12.24 mL.'
    },
    explanationIs: 'Til að búa til 100 mL af 0.1 M fosfatstuðpúða við pH 7.40, þarftu 7.76 mL af 0.5 M NaH₂PO₄ og 12.24 mL af 0.5 M Na₂HPO₄, fyllt upp í 100 mL með vatni.',
    explanationEn: 'To prepare 100 mL of 0.1 M phosphate buffer at pH 7.40, you need 7.76 mL of 0.5 M NaH₂PO₄ and 12.24 mL of 0.5 M Na₂HPO₄, filled up to 100 mL with water.',
    explanationPl: 'Aby przygotować 100 mL 0.1 M buforu fosforanowego o pH 7.40, potrzebujesz 7.76 mL 0.5 M NaH₂PO₄ i 12.24 mL 0.5 M Na₂HPO₄, uzupełnionych wodą do 100 mL.',
    correctAcidVolume: 7.76,
    correctBaseVolume: 12.24,
    correctWaterVolume: 80.0
  },
  {
    id: 2,
    problemId: 14,  // Acetate pH 5.00
    taskIs: 'Búðu til 250 mL af asetatstuðpúða við pH 5.00 með því að nota 1.0 M birgðalausnir.',
    taskEn: 'Prepare 250 mL of acetate buffer at pH 5.00 using 1.0 M stock solutions.',
    taskPl: 'Przygotuj 250 mL buforu octanowego o pH 5.00 z 1.0 M roztworów podstawowych.',
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
    hintsEn: {
      topic: 'Acetate buffer with pKa = 4.74 and target pH = 5.00.',
      strategy: 'Ratio = 10^(5.00-4.74) = 10^0.26 ≈ 1.82. More base than acid.',
      method: 'Total moles = 0.1 × 0.25 = 0.025 mol. Acid: 0.00888 mol, Base: 0.01612 mol.',
      solution: 'From 1.0 M stock: Acid = 8.88 mL, Base = 16.12 mL, Water = 225.0 mL.'
    },
    hintsPl: {
      topic: 'Bufor octanowy z pKa = 4.74 i docelowym pH = 5.00.',
      strategy: 'Proporcja = 10^(5.00-4.74) = 10^0.26 ≈ 1.82. Więcej zasady niż kwasu.',
      method: 'Łączne mole = 0.1 × 0.25 = 0.025 mol. Kwas: 0.00888 mol, Zasada: 0.01612 mol.',
      solution: 'Z 1.0 M roztworu: Kwas = 8.88 mL, Zasada = 16.12 mL, Woda = 225.0 mL.'
    },
    explanationIs: 'Fyrir 250 mL af 0.1 M asetatstuðpúða við pH 5.00 þarftu 8.88 mL af 1.0 M ediksýru og 16.12 mL af 1.0 M natríumasetati.',
    explanationEn: 'For 250 mL of 0.1 M acetate buffer at pH 5.00, you need 8.88 mL of 1.0 M acetic acid and 16.12 mL of 1.0 M sodium acetate.',
    explanationPl: 'Na 250 mL 0.1 M buforu octanowego o pH 5.00 potrzebujesz 8.88 mL 1.0 M kwasu octowego i 16.12 mL 1.0 M octanu sodu.',
    correctAcidVolume: 8.88,
    correctBaseVolume: 16.12,
    correctWaterVolume: 225.0
  },
  {
    id: 3,
    problemId: 13,  // TRIS pH 8.00
    taskIs: 'Búðu til 50 mL af TRIS-stuðpúða við pH 8.00 fyrir DNA einangrun.',
    taskEn: 'Prepare 50 mL of TRIS buffer at pH 8.00 for DNA isolation.',
    taskPl: 'Przygotuj 50 mL buforu TRIS o pH 8.00 do izolacji DNA.',
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
    hintsEn: {
      topic: 'TRIS buffer is common in molecular biology with pKa = 8.06.',
      strategy: 'pH 8.00 is LOWER than pKa 8.06, so you need more acid. Ratio = 10^(-0.06) = 0.87.',
      method: 'Total moles = 0.05 M × 0.05 L = 0.0025 mol. Acid: 0.00134 mol, Base: 0.00116 mol.',
      solution: 'From 0.25 M stock: Acid = 5.36 mL, Base = 4.64 mL, Water = 40.0 mL.'
    },
    hintsPl: {
      topic: 'Bufor TRIS jest powszechny w biologii molekularnej z pKa = 8.06.',
      strategy: 'pH 8.00 jest NIŻSZE niż pKa 8.06, więc potrzebujesz więcej kwasu. Proporcja = 10^(-0.06) = 0.87.',
      method: 'Łączne mole = 0.05 M × 0.05 L = 0.0025 mol. Kwas: 0.00134 mol, Zasada: 0.00116 mol.',
      solution: 'Z 0.25 M roztworu: Kwas = 5.36 mL, Zasada = 4.64 mL, Woda = 40.0 mL.'
    },
    explanationIs: 'TRIS-stuðpúði við pH 8.00 þarf hlutfall 0.87 (lítið meira af sýru). Fyrir 50 mL af 0.05 M stuðpúða: 5.36 mL sýrubirgð, 4.64 mL basabirgð.',
    explanationEn: 'A TRIS buffer at pH 8.00 requires a ratio of 0.87 (slightly more acid). For 50 mL of 0.05 M buffer: 5.36 mL acid stock, 4.64 mL base stock.',
    explanationPl: 'Bufor TRIS o pH 8.00 wymaga proporcji 0.87 (nieco więcej kwasu). Na 50 mL 0.05 M buforu: 5.36 mL roztworu kwasu, 4.64 mL roztworu zasady.',
    correctAcidVolume: 5.36,
    correctBaseVolume: 4.64,
    correctWaterVolume: 40.0
  },
  {
    id: 4,
    problemId: 21,  // Phosphate pH 7.00
    taskIs: 'Búðu til 500 mL af fosfatstuðpúða við hlutlaust pH (7.00).',
    taskEn: 'Prepare 500 mL of phosphate buffer at neutral pH (7.00).',
    taskPl: 'Przygotuj 500 mL buforu fosforanowego o obojętnym pH (7.00).',
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
    hintsEn: {
      topic: 'Phosphate buffer at pH 7.00, which is BELOW pKa (7.20).',
      strategy: 'Ratio = 10^(7.00-7.20) = 10^(-0.20) = 0.63. More acid.',
      method: 'Total moles = 0.05 × 0.5 = 0.025 mol. Acid: 0.01534 mol, Base: 0.00966 mol.',
      solution: 'From 1.0 M stock: Acid = 15.34 mL, Base = 9.66 mL, Water = 475.0 mL.'
    },
    hintsPl: {
      topic: 'Bufor fosforanowy o pH 7.00, które jest PONIŻEJ pKa (7.20).',
      strategy: 'Proporcja = 10^(7.00-7.20) = 10^(-0.20) = 0.63. Więcej kwasu.',
      method: 'Łączne mole = 0.05 × 0.5 = 0.025 mol. Kwas: 0.01534 mol, Zasada: 0.00966 mol.',
      solution: 'Z 1.0 M roztworu: Kwas = 15.34 mL, Zasada = 9.66 mL, Woda = 475.0 mL.'
    },
    explanationIs: 'Við pH 7.00 (undir pKa) þarf meira af sýru. Hlutfall 0.63 þýðir um 60% meira sýra en basi.',
    explanationEn: 'At pH 7.00 (below pKa) you need more acid. A ratio of 0.63 means about 60% more acid than base.',
    explanationPl: 'Przy pH 7.00 (poniżej pKa) potrzebujesz więcej kwasu. Proporcja 0.63 oznacza około 60% więcej kwasu niż zasady.',
    correctAcidVolume: 15.34,
    correctBaseVolume: 9.66,
    correctWaterVolume: 475.0
  },
  {
    id: 5,
    problemId: 17,  // Ammonia pH 9.50
    taskIs: 'Búðu til 200 mL af ammóníustuðpúða við pH 9.50.',
    taskEn: 'Prepare 200 mL of ammonium buffer at pH 9.50.',
    taskPl: 'Przygotuj 200 mL buforu amonowego o pH 9.50.',
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
    hintsEn: {
      topic: 'Ammonium buffer with pKa = 9.25 and target pH = 9.50.',
      strategy: 'pH > pKa so the ratio > 1. Ratio = 10^(0.25) = 1.78.',
      method: 'Total moles = 0.2 × 0.2 = 0.04 mol. Acid: 0.0142 mol, Base: 0.0258 mol.',
      solution: 'From 2.0 M stock: Acid = 7.10 mL, Base = 12.90 mL, Water = 180.0 mL.'
    },
    hintsPl: {
      topic: 'Bufor amonowy z pKa = 9.25 i docelowym pH = 9.50.',
      strategy: 'pH > pKa, więc proporcja > 1. Proporcja = 10^(0.25) = 1.78.',
      method: 'Łączne mole = 0.2 × 0.2 = 0.04 mol. Kwas: 0.0142 mol, Zasada: 0.0258 mol.',
      solution: 'Z 2.0 M roztworu: Kwas = 7.10 mL, Zasada = 12.90 mL, Woda = 180.0 mL.'
    },
    explanationIs: 'Ammóníustuðpúði við pH 9.50 þarf hlutfall 1.78, sem þýðir næstum tvöfalt meira af NH₃ en NH₄Cl.',
    explanationEn: 'An ammonium buffer at pH 9.50 requires a ratio of 1.78, meaning almost twice as much NH₃ as NH₄Cl.',
    explanationPl: 'Bufor amonowy o pH 9.50 wymaga proporcji 1.78, co oznacza prawie dwukrotnie więcej NH₃ niż NH₄Cl.',
    correctAcidVolume: 7.10,
    correctBaseVolume: 12.90,
    correctWaterVolume: 180.0
  },
  {
    id: 6,
    problemId: 15,  // Phosphate pH 6.80
    taskIs: 'Búðu til 1000 mL (1 L) af fosfatstuðpúða við pH 6.80 fyrir frumuræktun.',
    taskEn: 'Prepare 1000 mL (1 L) of phosphate buffer at pH 6.80 for cell culture.',
    taskPl: 'Przygotuj 1000 mL (1 L) buforu fosforanowego o pH 6.80 do hodowli komórkowej.',
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
    hintsEn: {
      topic: 'Phosphate buffer at pH 6.80, which is considerably below pKa (7.20).',
      strategy: 'Ratio = 10^(6.80-7.20) = 10^(-0.40) = 0.40. Much more acid.',
      method: 'Total moles = 0.1 × 1.0 = 0.1 mol. Acid: 0.0714 mol, Base: 0.0286 mol.',
      solution: 'From 0.5 M stock: Acid = 142.8 mL, Base = 57.2 mL, Water = 800.0 mL.'
    },
    hintsPl: {
      topic: 'Bufor fosforanowy o pH 6.80, które jest znacznie poniżej pKa (7.20).',
      strategy: 'Proporcja = 10^(6.80-7.20) = 10^(-0.40) = 0.40. Znacznie więcej kwasu.',
      method: 'Łączne mole = 0.1 × 1.0 = 0.1 mol. Kwas: 0.0714 mol, Zasada: 0.0286 mol.',
      solution: 'Z 0.5 M roztworu: Kwas = 142.8 mL, Zasada = 57.2 mL, Woda = 800.0 mL.'
    },
    explanationIs: 'Við pH 6.80 (0.40 undir pKa) er hlutfall aðeins 0.40, sem þýðir 2.5× meira af sýru en basa.',
    explanationEn: 'At pH 6.80 (0.40 below pKa) the ratio is only 0.40, meaning 2.5× more acid than base.',
    explanationPl: 'Przy pH 6.80 (0.40 poniżej pKa) proporcja wynosi zaledwie 0.40, co oznacza 2.5× więcej kwasu niż zasady.',
    correctAcidVolume: 142.8,
    correctBaseVolume: 57.2,
    correctWaterVolume: 800.0
  }
];
