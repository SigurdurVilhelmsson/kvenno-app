// Level 2: Henderson-Hasselbalch Calculations
// Students apply the formula to calculate ratios and masses

import type { TieredHints } from '@shared/types';

export interface Level2Puzzle {
  id: number;
  problemId: number;           // Reference to BUFFER_PROBLEMS
  taskIs: string;              // Icelandic task description
  taskEn?: string;             // English task description
  taskPl?: string;             // Polish task description
  ratioTolerance: number;      // Relative tolerance for ratio (e.g., 0.1 = ±10%)
  massTolerance: number;       // Relative tolerance for mass (e.g., 0.05 = ±5%)
  hints: TieredHints;
  hintsEn?: TieredHints;
  hintsPl?: TieredHints;
  explanationIs: string;
  explanationEn?: string;
  explanationPl?: string;
}

export const LEVEL2_PUZZLES: Level2Puzzle[] = [
  {
    id: 1,
    problemId: 11,  // Phosphate pH 7.40 - Blood buffer
    taskIs: 'Búðu til fosfatstuðpúða við blóð-pH (7.40) úr NaH₂PO₄ og Na₂HPO₄.',
    taskEn: 'Prepare a phosphate buffer at blood pH (7.40) from NaH₂PO₄ and Na₂HPO₄.',
    taskPl: 'Przygotuj bufor fosforanowy o pH krwi (7.40) z NaH₂PO₄ i Na₂HPO₄.',
    ratioTolerance: 0.10,
    massTolerance: 0.05,
    hints: {
      topic: 'Þetta snýst um Henderson-Hasselbalch jöfnuna: pH = pKa + log([Basi]/[Sýra]).',
      strategy: 'Markmiðs-pH (7.40) er HÆRRA en pKa (7.20), svo þú þarft meira af basa. Reiknaðu hlutfallið fyrst.',
      method: 'Skref 1: pH - pKa = 7.40 - 7.20 = 0.20. Skref 2: Hlutfall = 10^0.20 ≈ 1.58.',
      solution: 'Hlutfall = 1.58. Með 0.100 M og 1.0 L: 0.0388 mol sýru (4.65 g) og 0.0612 mol basa (8.69 g).'
    },
    hintsEn: {
      topic: 'This is about the Henderson-Hasselbalch equation: pH = pKa + log([Base]/[Acid]).',
      strategy: 'Target pH (7.40) is HIGHER than pKa (7.20), so you need more base. Calculate the ratio first.',
      method: 'Step 1: pH - pKa = 7.40 - 7.20 = 0.20. Step 2: Ratio = 10^0.20 ≈ 1.58.',
      solution: 'Ratio = 1.58. With 0.100 M and 1.0 L: 0.0388 mol acid (4.65 g) and 0.0612 mol base (8.69 g).'
    },
    hintsPl: {
      topic: 'To dotyczy równania Hendersona-Hasselbalcha: pH = pKa + log([Zasada]/[Kwas]).',
      strategy: 'Docelowe pH (7.40) jest WYŻSZE niż pKa (7.20), więc potrzebujesz więcej zasady. Najpierw oblicz proporcję.',
      method: 'Krok 1: pH - pKa = 7.40 - 7.20 = 0.20. Krok 2: Proporcja = 10^0.20 ≈ 1.58.',
      solution: 'Proporcja = 1.58. Przy 0.100 M i 1.0 L: 0.0388 mol kwasu (4.65 g) i 0.0612 mol zasady (8.69 g).'
    },
    explanationIs: 'Blóð pH er 7.40, sem er 0.20 einingum yfir pKa fosfats. Þetta þýðir að hlutfall [Basi]/[Sýra] = 10^0.20 ≈ 1.58. Líkaminn viðheldur þessu hlutfalli til að halda pH stöðugu.',
    explanationEn: 'Blood pH is 7.40, which is 0.20 units above the pKa of phosphate. This means the ratio [Base]/[Acid] = 10^0.20 ≈ 1.58. The body maintains this ratio to keep pH stable.',
    explanationPl: 'pH krwi wynosi 7.40, co jest o 0.20 jednostki powyżej pKa fosforanu. Oznacza to, że proporcja [Zasada]/[Kwas] = 10^0.20 ≈ 1.58. Organizm utrzymuje tę proporcję, aby utrzymać stabilne pH.'
  },
  {
    id: 2,
    problemId: 14,  // Acetate pH 5.00
    taskIs: 'Búðu til asetatstuðpúða við pH 5.00 úr ediksýru og natríumasetati.',
    taskEn: 'Prepare an acetate buffer at pH 5.00 from acetic acid and sodium acetate.',
    taskPl: 'Przygotuj bufor octanowy o pH 5.00 z kwasu octowego i octanu sodu.',
    ratioTolerance: 0.10,
    massTolerance: 0.05,
    hints: {
      topic: 'Asetatstuðpúði notar Henderson-Hasselbalch jöfnuna með pKa = 4.74.',
      strategy: 'Markmiðs-pH (5.00) er HÆRRA en pKa (4.74). Munurinn er 0.26 einingar.',
      method: 'Hlutfall = 10^(pH - pKa) = 10^(5.00 - 4.74) = 10^0.26 ≈ 1.82.',
      solution: 'Hlutfall = 1.82. Með 0.100 M og 1.0 L: 0.0355 mol sýru (2.13 g) og 0.0645 mol basa (5.98 g).'
    },
    hintsEn: {
      topic: 'The acetate buffer uses the Henderson-Hasselbalch equation with pKa = 4.74.',
      strategy: 'Target pH (5.00) is HIGHER than pKa (4.74). The difference is 0.26 units.',
      method: 'Ratio = 10^(pH - pKa) = 10^(5.00 - 4.74) = 10^0.26 ≈ 1.82.',
      solution: 'Ratio = 1.82. With 0.100 M and 1.0 L: 0.0355 mol acid (2.13 g) and 0.0645 mol base (5.98 g).'
    },
    hintsPl: {
      topic: 'Bufor octanowy wykorzystuje równanie Hendersona-Hasselbalcha z pKa = 4.74.',
      strategy: 'Docelowe pH (5.00) jest WYŻSZE niż pKa (4.74). Różnica wynosi 0.26 jednostki.',
      method: 'Proporcja = 10^(pH - pKa) = 10^(5.00 - 4.74) = 10^0.26 ≈ 1.82.',
      solution: 'Proporcja = 1.82. Przy 0.100 M i 1.0 L: 0.0355 mol kwasu (2.13 g) i 0.0645 mol zasady (5.98 g).'
    },
    explanationIs: 'Til að ná pH 5.00 (0.26 yfir pKa) þarf hlutfall 1.82. Þetta þýðir næstum tvöfalt meira af basa en sýru.',
    explanationEn: 'To reach pH 5.00 (0.26 above pKa) requires a ratio of 1.82. This means almost twice as much base as acid.',
    explanationPl: 'Aby osiągnąć pH 5.00 (0.26 powyżej pKa), potrzebna jest proporcja 1.82. Oznacza to prawie dwukrotnie więcej zasady niż kwasu.'
  },
  {
    id: 3,
    problemId: 17,  // Ammonia pH 9.50
    taskIs: 'Búðu til ammóníustuðpúða við pH 9.50 úr ammoniumklóríði og ammóníaki.',
    taskEn: 'Prepare an ammonium buffer at pH 9.50 from ammonium chloride and ammonia.',
    taskPl: 'Przygotuj bufor amonowy o pH 9.50 z chlorku amonu i amoniaku.',
    ratioTolerance: 0.10,
    massTolerance: 0.05,
    hints: {
      topic: 'Ammóníustuðpúði virkar við hátt pH með pKa = 9.25.',
      strategy: 'Markmiðs-pH (9.50) er HÆRRA en pKa (9.25). Þarftu meira af basa.',
      method: 'Hlutfall = 10^(9.50 - 9.25) = 10^0.25 ≈ 1.78.',
      solution: 'Hlutfall = 1.78. Með 0.100 M og 1.0 L: 0.0355 mol sýru (1.89 g) og 0.0645 mol basa (1.21 g).'
    },
    hintsEn: {
      topic: 'The ammonium buffer works at high pH with pKa = 9.25.',
      strategy: 'Target pH (9.50) is HIGHER than pKa (9.25). You need more base.',
      method: 'Ratio = 10^(9.50 - 9.25) = 10^0.25 ≈ 1.78.',
      solution: 'Ratio = 1.78. With 0.100 M and 1.0 L: 0.0355 mol acid (1.89 g) and 0.0645 mol base (1.21 g).'
    },
    hintsPl: {
      topic: 'Bufor amonowy działa przy wysokim pH z pKa = 9.25.',
      strategy: 'Docelowe pH (9.50) jest WYŻSZE niż pKa (9.25). Potrzebujesz więcej zasady.',
      method: 'Proporcja = 10^(9.50 - 9.25) = 10^0.25 ≈ 1.78.',
      solution: 'Proporcja = 1.78. Przy 0.100 M i 1.0 L: 0.0355 mol kwasu (1.89 g) i 0.0645 mol zasady (1.21 g).'
    },
    explanationIs: 'Ammóníustuðpúði við pH 9.50 þarf hlutfall 1.78. Athugaðu að ammóníak (NH₃) hefur mjög lágan mólarmassa (17 g/mol) svo massinn er lítill.',
    explanationEn: 'An ammonium buffer at pH 9.50 requires a ratio of 1.78. Note that ammonia (NH₃) has a very low molar mass (17 g/mol), so the mass is small.',
    explanationPl: 'Bufor amonowy o pH 9.50 wymaga proporcji 1.78. Zauważ, że amoniak (NH₃) ma bardzo niską masę molową (17 g/mol), więc masa jest niewielka.'
  },
  {
    id: 4,
    problemId: 13,  // TRIS pH 8.00
    taskIs: 'Búðu til TRIS-stuðpúða við pH 8.00 fyrir DNA-rannsóknir.',
    taskEn: 'Prepare a TRIS buffer at pH 8.00 for DNA research.',
    taskPl: 'Przygotuj bufor TRIS o pH 8.00 do badań DNA.',
    ratioTolerance: 0.10,
    massTolerance: 0.05,
    hints: {
      topic: 'TRIS er algengur stuðpúði í sameindalíffræði með pKa = 8.06.',
      strategy: 'Markmiðs-pH (8.00) er LÆGRA en pKa (8.06). Þarftu meira af sýru.',
      method: 'Hlutfall = 10^(8.00 - 8.06) = 10^(-0.06) ≈ 0.87.',
      solution: 'Hlutfall = 0.87. Með 0.050 M og 0.5 L: 0.0134 mol sýru (2.10 g) og 0.0116 mol basa (1.41 g).'
    },
    hintsEn: {
      topic: 'TRIS is a common buffer in molecular biology with pKa = 8.06.',
      strategy: 'Target pH (8.00) is LOWER than pKa (8.06). You need more acid.',
      method: 'Ratio = 10^(8.00 - 8.06) = 10^(-0.06) ≈ 0.87.',
      solution: 'Ratio = 0.87. With 0.050 M and 0.5 L: 0.0134 mol acid (2.10 g) and 0.0116 mol base (1.41 g).'
    },
    hintsPl: {
      topic: 'TRIS to popularny bufor w biologii molekularnej z pKa = 8.06.',
      strategy: 'Docelowe pH (8.00) jest NIŻSZE niż pKa (8.06). Potrzebujesz więcej kwasu.',
      method: 'Proporcja = 10^(8.00 - 8.06) = 10^(-0.06) ≈ 0.87.',
      solution: 'Proporcja = 0.87. Przy 0.050 M i 0.5 L: 0.0134 mol kwasu (2.10 g) i 0.0116 mol zasady (1.41 g).'
    },
    explanationIs: 'TRIS-stuðpúði við pH 8.00 (lítið undir pKa) þarf hlutfall 0.87. Þetta þýðir aðeins meira af sýru. TRIS er notað í PCR og rafdráttum.',
    explanationEn: 'A TRIS buffer at pH 8.00 (slightly below pKa) requires a ratio of 0.87. This means slightly more acid. TRIS is used in PCR and electrophoresis.',
    explanationPl: 'Bufor TRIS o pH 8.00 (nieco poniżej pKa) wymaga proporcji 0.87. Oznacza to nieco więcej kwasu. TRIS jest stosowany w PCR i elektroforezie.'
  },
  {
    id: 5,
    problemId: 19,  // Formic acid pH 4.00
    taskIs: 'Búðu til maurasýrustuðpúða við pH 4.00.',
    taskEn: 'Prepare a formic acid buffer at pH 4.00.',
    taskPl: 'Przygotuj bufor mrówkowy o pH 4.00.',
    ratioTolerance: 0.10,
    massTolerance: 0.05,
    hints: {
      topic: 'Maurasýra (HCOOH) hefur pKa = 3.75, lægra en ediksýra.',
      strategy: 'Markmiðs-pH (4.00) er HÆRRA en pKa (3.75). Þarftu meira af basa.',
      method: 'Hlutfall = 10^(4.00 - 3.75) = 10^0.25 ≈ 1.78.',
      solution: 'Hlutfall = 1.78. Með 0.100 M og 1.0 L: 0.0561 mol sýru (2.58 g) og 0.0439 mol basa (4.80 g).'
    },
    hintsEn: {
      topic: 'Formic acid (HCOOH) has pKa = 3.75, lower than acetic acid.',
      strategy: 'Target pH (4.00) is HIGHER than pKa (3.75). You need more base.',
      method: 'Ratio = 10^(4.00 - 3.75) = 10^0.25 ≈ 1.78.',
      solution: 'Ratio = 1.78. With 0.100 M and 1.0 L: 0.0561 mol acid (2.58 g) and 0.0439 mol base (4.80 g).'
    },
    hintsPl: {
      topic: 'Kwas mrówkowy (HCOOH) ma pKa = 3.75, niższe niż kwas octowy.',
      strategy: 'Docelowe pH (4.00) jest WYŻSZE niż pKa (3.75). Potrzebujesz więcej zasady.',
      method: 'Proporcja = 10^(4.00 - 3.75) = 10^0.25 ≈ 1.78.',
      solution: 'Proporcja = 1.78. Przy 0.100 M i 1.0 L: 0.0561 mol kwasu (2.58 g) i 0.0439 mol zasady (4.80 g).'
    },
    explanationIs: 'Maurasýrustuðpúði við pH 4.00 þarf hlutfall 1.78. Maurasýra er einfaldasta karboxýlsýran (HCOOH).',
    explanationEn: 'A formic acid buffer at pH 4.00 requires a ratio of 1.78. Formic acid is the simplest carboxylic acid (HCOOH).',
    explanationPl: 'Bufor mrówkowy o pH 4.00 wymaga proporcji 1.78. Kwas mrówkowy jest najprostszym kwasem karboksylowym (HCOOH).'
  },
  {
    id: 6,
    problemId: 21,  // Phosphate pH 7.00
    taskIs: 'Búðu til fosfatstuðpúða við pH 7.00 (hlutlaust).',
    taskEn: 'Prepare a phosphate buffer at pH 7.00 (neutral).',
    taskPl: 'Przygotuj bufor fosforanowy o pH 7.00 (obojętny).',
    ratioTolerance: 0.10,
    massTolerance: 0.05,
    hints: {
      topic: 'Fosfatstuðpúði við hlutlaust pH þarf meira af sýru.',
      strategy: 'Markmiðs-pH (7.00) er LÆGRA en pKa (7.20). Þarftu meira af sýru.',
      method: 'Hlutfall = 10^(7.00 - 7.20) = 10^(-0.20) ≈ 0.63.',
      solution: 'Hlutfall = 0.63. Með 0.100 M og 1.0 L: 0.0613 mol sýru (7.59 g) og 0.0387 mol basa (5.66 g).'
    },
    hintsEn: {
      topic: 'A phosphate buffer at neutral pH needs more acid.',
      strategy: 'Target pH (7.00) is LOWER than pKa (7.20). You need more acid.',
      method: 'Ratio = 10^(7.00 - 7.20) = 10^(-0.20) ≈ 0.63.',
      solution: 'Ratio = 0.63. With 0.100 M and 1.0 L: 0.0613 mol acid (7.59 g) and 0.0387 mol base (5.66 g).'
    },
    hintsPl: {
      topic: 'Bufor fosforanowy o obojętnym pH wymaga więcej kwasu.',
      strategy: 'Docelowe pH (7.00) jest NIŻSZE niż pKa (7.20). Potrzebujesz więcej kwasu.',
      method: 'Proporcja = 10^(7.00 - 7.20) = 10^(-0.20) ≈ 0.63.',
      solution: 'Proporcja = 0.63. Przy 0.100 M i 1.0 L: 0.0613 mol kwasu (7.59 g) i 0.0387 mol zasady (5.66 g).'
    },
    explanationIs: 'Til að ná pH 7.00 (0.20 undir pKa) þarf hlutfall 0.63. Þetta þýðir um 60% meira af sýru en basa.',
    explanationEn: 'To reach pH 7.00 (0.20 below pKa) requires a ratio of 0.63. This means about 60% more acid than base.',
    explanationPl: 'Aby osiągnąć pH 7.00 (0.20 poniżej pKa), potrzebna jest proporcja 0.63. Oznacza to około 60% więcej kwasu niż zasady.'
  }
];
