// Level 3: Calculation challenges for pH titration

export interface Level3Challenge {
  id: number;
  type:
    | 'find-concentration'
    | 'find-volume'
    | 'polyprotic'
    | 'henderson-hasselbalch'
    | 'combined'
    | 'titration-curve';
  titleIs: string;
  title: string;
  descriptionIs: string;
  description: string;

  // Given data
  givenData: {
    analyteVolume?: number;
    analyteMolarity?: number;
    titrantMolarity?: number;
    equivalenceVolume?: number;
    pH?: number;
    pKa?: number;
    /** Kₐ, printed in scientific notation, for a problem that asks for pKₐ from it. */
    Ka?: number;
    /** Titrant poured so far, mL, for a problem at one point of a titration. */
    titrantAdded?: number;
    acidConcentration?: number;
    baseConcentration?: number;
    formula?: string;
  };

  // Answer
  correctAnswer: number;
  unit: string;
  tolerance: number; // Relative tolerance (e.g., 0.02 = ±2%)
  /**
   * An absolute tolerance, which replaces `tolerance` where it is set. A pH is
   * a logarithm, so ±2 % of it is ±0,1 near pH 5 and means nothing chemically;
   * pH answers are graded at ±0,02, as `3-ar/syrufastinn` grades them.
   */
  absoluteTolerance?: number;
  /** Decimals the answer is printed to, so "Rétt svar" keeps its significant figures. */
  answerDecimals: number;

  // For polyprotic
  equivalencePointIndex?: number;

  /**
   * A point on a titration the game draws: the answer is that titration's
   * `calculatePH` at this volume, rounded, and `level3-grading.test.ts` holds
   * it there, so a problem cannot disagree with the curve Stig 2 shows.
   */
  fromCurve?: { titrationId: number; volume: number };

  hintIs: string;
  hint: string;
  explanationIs: string;
  explanation: string;

  // Worked solution steps
  solutionStepsIs: string[];
  solutionSteps: string[];
}

export const LEVEL3_CHALLENGES: Level3Challenge[] = [
  // === FIND CONCENTRATION PROBLEMS ===
  {
    id: 1,
    type: 'find-concentration',
    titleIs: 'Finndu styrk sýrunnar',
    title: 'Find the acid concentration',
    descriptionIs:
      'Títrun á 25,0 mL af HCl með 0,100 M NaOH náði jafngildispunkti við 32,5 mL. Hver er styrkur HCl?',
    description:
      'Titration of 25.0 mL of HCl with 0.100 M NaOH reached equivalence at 32.5 mL. What is the HCl concentration?',
    givenData: {
      analyteVolume: 25.0,
      equivalenceVolume: 32.5,
      titrantMolarity: 0.1,
      formula: 'HCl + NaOH → NaCl + H₂O',
    },
    correctAnswer: 0.13,
    answerDecimals: 3,
    unit: 'M',
    tolerance: 0.02,
    hintIs:
      'Notaðu hlutfallið: n(HCl) = n(NaOH) við jafngildispunkt. Mólfjöldi = styrkur × rúmmál.',
    hint: 'Use the ratio: n(HCl) = n(NaOH) at equivalence. Moles = molarity × volume.',
    explanationIs: 'Við jafngildispunkt: n(HCl) = n(NaOH). Þannig: M₁V₁ = M₂V₂.',
    explanation: 'At equivalence: n(HCl) = n(NaOH). Thus: M₁V₁ = M₂V₂.',
    solutionStepsIs: [
      'n(NaOH) = M × V = 0,100 mól/L × 0,0325 L = 0,00325 mól',
      'n(HCl) = n(NaOH) = 0,00325 mól (1:1 hlutfall)',
      'M(HCl) = n / V = 0,00325 mól / 0,0250 L = 0,130 M',
    ],
    solutionSteps: [
      'n(NaOH) = M × V = 0.100 mol/L × 0.0325 L = 0.00325 mol',
      'n(HCl) = n(NaOH) = 0.00325 mol (1:1 ratio)',
      'M(HCl) = n / V = 0.00325 mol / 0.0250 L = 0.130 M',
    ],
  },
  {
    id: 2,
    type: 'find-concentration',
    titleIs: 'Styrkur veikrar sýru',
    title: 'Weak acid concentration',
    descriptionIs:
      'Títrun á 50,0 mL af ediksýru (CH₃COOH) með 0,150 M NaOH náði jafngildispunkti við 28,0 mL. Hver er styrkur ediksýrunnar?',
    description:
      'Titration of 50.0 mL of acetic acid (CH₃COOH) with 0.150 M NaOH reached equivalence at 28.0 mL. What is the acetic acid concentration?',
    givenData: {
      analyteVolume: 50.0,
      equivalenceVolume: 28.0,
      titrantMolarity: 0.15,
      formula: 'CH₃COOH + NaOH → CH₃COONa + H₂O',
    },
    correctAnswer: 0.084,
    answerDecimals: 4,
    unit: 'M',
    tolerance: 0.02,
    hintIs:
      'Sama aðferð og fyrir sterka sýru - einungis mólfjöldi skiptir máli við jafngildispunkt.',
    hint: 'Same method as for strong acid - only moles matter at equivalence point.',
    explanationIs:
      'Hvort sem sýran er sterk eða veik, er mólfjöldi sýru og basa jafn við jafngildispunkt.',
    explanation:
      'Whether the acid is strong or weak, moles of acid and base are equal at equivalence.',
    solutionStepsIs: [
      'n(NaOH) = 0,150 mól/L × 0,0280 L = 0,00420 mól',
      'n(CH₃COOH) = n(NaOH) = 0,00420 mól (1:1 hlutfall)',
      'M(CH₃COOH) = 0,00420 mól / 0,0500 L = 0,0840 M',
    ],
    solutionSteps: [
      'n(NaOH) = 0.150 mol/L × 0.0280 L = 0.00420 mol',
      'n(CH₃COOH) = n(NaOH) = 0.00420 mol (1:1 ratio)',
      'M(CH₃COOH) = 0.00420 mol / 0.0500 L = 0.0840 M',
    ],
  },

  // === FIND VOLUME PROBLEM ===
  {
    id: 3,
    type: 'find-volume',
    titleIs: 'Finndu jafngildisrúmmál',
    title: 'Find equivalence volume',
    descriptionIs:
      'Hversu mikið af 0,200 M NaOH þarf til að títra 35,0 mL af 0,120 M HNO₃ til jafngildispunkts?',
    description:
      'How much 0.200 M NaOH is needed to titrate 35.0 mL of 0.120 M HNO₃ to equivalence?',
    givenData: {
      analyteVolume: 35.0,
      analyteMolarity: 0.12,
      titrantMolarity: 0.2,
      formula: 'HNO₃ + NaOH → NaNO₃ + H₂O',
    },
    correctAnswer: 21.0,
    answerDecimals: 1,
    unit: 'mL',
    tolerance: 0.02,
    hintIs: 'M₁V₁ = M₂V₂ fyrir 1:1 hvarfahlutfall. Leystu fyrir V₂.',
    hint: 'M₁V₁ = M₂V₂ for 1:1 reaction ratio. Solve for V₂.',
    explanationIs: 'Notaðu formúluna M₁V₁ = M₂V₂ þar sem 1 er sýra og 2 er basi.',
    explanation: 'Use the formula M₁V₁ = M₂V₂ where 1 is acid and 2 is base.',
    solutionStepsIs: [
      'n(HNO₃) = 0,120 M × 35,0 mL = 4,20 mmol',
      'n(NaOH) þarf = 4,20 mmol (1:1 hlutfall)',
      'V(NaOH) = n / M = 4,20 mmol / 0,200 M = 21,0 mL',
    ],
    solutionSteps: [
      'n(HNO₃) = 0.120 M × 35.0 mL = 4.20 mmol',
      'n(NaOH) needed = 4.20 mmol (1:1 ratio)',
      'V(NaOH) = n / M = 4.20 mmol / 0.200 M = 21.0 mL',
    ],
  },

  // === POLYPROTIC PROBLEMS ===
  {
    id: 4,
    type: 'polyprotic',
    titleIs: 'Tvívirk sýra: H₂SO₃',
    title: 'Diprotic acid: H₂SO₃',
    descriptionIs:
      'Títrun á 20,0 mL af 0,100 M H₂SO₃ með 0,100 M NaOH. Hversu mikið NaOH þarf til að ná ÖÐRUM jafngildispunkti (H₂SO₃ → SO₃²⁻)?',
    description:
      'Titration of 20.0 mL of 0.100 M H₂SO₃ with 0.100 M NaOH. How much NaOH is needed to reach the SECOND equivalence point (H₂SO₃ → SO₃²⁻)?',
    givenData: {
      analyteVolume: 20.0,
      analyteMolarity: 0.1,
      titrantMolarity: 0.1,
      formula: 'H₂SO₃ + 2NaOH → Na₂SO₃ + 2H₂O',
    },
    correctAnswer: 40.0,
    answerDecimals: 1,
    unit: 'mL',
    tolerance: 0.02,
    equivalencePointIndex: 2,
    hintIs:
      'Tvívirk sýra gefur 2 mól H⁺ fyrir hvert mól sýru. Við annan jafngildispunkt hafa bæði H⁺ hvarfast.',
    hint: 'Diprotic acid gives 2 mol H⁺ per mol acid. At second equivalence, both H⁺ have reacted.',
    explanationIs: 'H₂SO₃ er tvívirk sýra, svo n(NaOH) = 2 × n(H₂SO₃) við annan jafngildispunkt.',
    explanation: 'H₂SO₃ is diprotic, so n(NaOH) = 2 × n(H₂SO₃) at second equivalence point.',
    solutionStepsIs: [
      'n(H₂SO₃) = 0,100 M × 20,0 mL = 2,00 mmol',
      'Við 2. jafngildispunkt: n(NaOH) = 2 × n(H₂SO₃) = 4,00 mmol',
      'V(NaOH) = 4,00 mmol / 0,100 M = 40,0 mL',
    ],
    solutionSteps: [
      'n(H₂SO₃) = 0.100 M × 20.0 mL = 2.00 mmol',
      'At 2nd equivalence: n(NaOH) = 2 × n(H₂SO₃) = 4.00 mmol',
      'V(NaOH) = 4.00 mmol / 0.100 M = 40.0 mL',
    ],
  },
  {
    id: 5,
    type: 'polyprotic',
    titleIs: 'Þrívirk sýra: H₃PO₄',
    title: 'Triprotic acid: H₃PO₄',
    descriptionIs:
      'Títrun á 25,0 mL af 0,080 M H₃PO₄ með 0,100 M NaOH. Hversu mikið NaOH þarf til að ná FYRSTA jafngildispunkti (H₃PO₄ → H₂PO₄⁻)?',
    description:
      'Titration of 25.0 mL of 0.080 M H₃PO₄ with 0.100 M NaOH. How much NaOH is needed to reach the FIRST equivalence point (H₃PO₄ → H₂PO₄⁻)?',
    givenData: {
      analyteVolume: 25.0,
      analyteMolarity: 0.08,
      titrantMolarity: 0.1,
      formula: 'H₃PO₄ + NaOH → NaH₂PO₄ + H₂O (1. jafngildispunktur)',
    },
    correctAnswer: 20.0,
    answerDecimals: 1,
    unit: 'mL',
    tolerance: 0.02,
    equivalencePointIndex: 1,
    hintIs: 'Við fyrsta jafngildispunkt hefur aðeins eitt H⁺ hvarfast. Hlutfallið er 1:1.',
    hint: 'At first equivalence, only one H⁺ has reacted. The ratio is 1:1.',
    explanationIs: 'Við fyrsta jafngildispunkt: n(NaOH) = n(H₃PO₄) þar sem eitt H⁺ hlutleysist.',
    explanation: 'At first equivalence: n(NaOH) = n(H₃PO₄) since one H⁺ is neutralized.',
    solutionStepsIs: [
      'n(H₃PO₄) = 0,080 M × 25,0 mL = 2,00 mmol',
      'Við 1. jafngildispunkt: n(NaOH) = n(H₃PO₄) = 2,00 mmol',
      'V(NaOH) = 2,00 mmol / 0,100 M = 20,0 mL',
    ],
    solutionSteps: [
      'n(H₃PO₄) = 0.080 M × 25.0 mL = 2.00 mmol',
      'At 1st equivalence: n(NaOH) = n(H₃PO₄) = 2.00 mmol',
      'V(NaOH) = 2.00 mmol / 0.100 M = 20.0 mL',
    ],
  },

  // === HENDERSON-HASSELBALCH PROBLEM ===
  {
    id: 6,
    type: 'henderson-hasselbalch',
    titleIs: 'Henderson-Hasselbalch: Finndu hlutfall',
    title: 'Henderson-Hasselbalch: Find ratio',
    descriptionIs:
      'Þú þarft stuðpúða með pH = 9,50 úr ammóníaki (NH₃) og ammóníumklóríði (NH₄Cl). pKₐ(NH₄⁺) = 9,26. Hvert þarf hlutfall [NH₃]/[NH₄⁺] að vera?',
    description:
      'You need a buffer with pH = 9.50 using ammonia (NH₃) and ammonium chloride (NH₄Cl). pKₐ(NH₄⁺) = 9.26. What ratio [NH₃]/[NH₄⁺] is needed?',
    givenData: {
      pH: 9.5,
      pKa: 9.26,
      formula: 'pH = pKₐ + log([NH₃]/[NH₄⁺])',
    },
    correctAnswer: 1.74,
    answerDecimals: 2,
    unit: '',
    tolerance: 0.02,
    hintIs:
      'Endurraðaðu Henderson-Hasselbalch: log(hlutfall) = pH - pKₐ, svo hlutfall = 10^(pH - pKₐ)',
    hint: 'Rearrange Henderson-Hasselbalch: log(ratio) = pH - pKₐ, so ratio = 10^(pH - pKₐ)',
    explanationIs: 'Leystu fyrir hlutfallið með því að nota 10^ á báðar hliðar.',
    explanation: 'Solve for the ratio by using 10^ on both sides.',
    solutionStepsIs: [
      'pH = pKₐ + log([NH₃]/[NH₄⁺])',
      '9,50 = 9,26 + log(hlutfall)',
      'log(hlutfall) = 9,50 - 9,26 = 0,24',
      'hlutfall = 10^0,24 = 1,74',
    ],
    solutionSteps: [
      'pH = pKₐ + log([NH₃]/[NH₄⁺])',
      '9.50 = 9.26 + log(ratio)',
      'log(ratio) = 9.50 - 9.26 = 0.24',
      'ratio = 10^0.24 = 1.74',
    ],
  },

  // === COMBINED PROBLEM ===
  {
    id: 7,
    type: 'combined',
    titleIs: 'Samansett verkefni: pH við hálfjafngildispunkt',
    title: 'Combined problem: pH at half-equivalence',
    descriptionIs:
      'Títrun á 30,0 mL af 0,100 M flússýru (HF, Kₐ = 6,8 × 10⁻⁴) með 0,100 M NaOH. Hvert er pH þegar 15,0 mL af NaOH hefur verið bætt við?',
    description:
      'Titration of 30.0 mL of 0.100 M hydrofluoric acid (HF, Kₐ = 6.8 × 10⁻⁴) with 0.100 M NaOH. What is the pH after 15.0 mL of NaOH has been added?',
    givenData: {
      analyteVolume: 30.0,
      analyteMolarity: 0.1,
      titrantMolarity: 0.1,
      Ka: 6.8e-4,
      formula: 'HF + NaOH → NaF + H₂O',
    },
    correctAnswer: 3.17,
    answerDecimals: 2,
    unit: '',
    tolerance: 0.02,
    absoluteTolerance: 0.02,
    hintIs:
      'Finndu fyrst jafngildisrúmmálið. Hve stór hluti sýrunnar hefur hvarfast eftir 15,0 mL? Hvað segir það um [HF] og [F⁻]?',
    hint: 'First find the equivalence volume. What fraction of the acid has reacted after 15.0 mL? What does that say about [HF] and [F⁻]?',
    explanationIs:
      'Jafngildisrúmmálið er 30,0 mL, svo eftir 15,0 mL hefur helmingur sýrunnar hvarfast. Þá er [HF] = [F⁻] og pH = pKₐ = −log(6,8 × 10⁻⁴) = 3,17.',
    explanation:
      'The equivalence volume is 30.0 mL, so after 15.0 mL half the acid has reacted. Then [HF] = [F⁻] and pH = pKₐ = −log(6.8 × 10⁻⁴) = 3.17.',
    solutionStepsIs: [
      'n(HF) = 0,100 M × 30,0 mL = 3,00 mmol, svo jafngildisrúmmálið er 3,00 mmol / 0,100 M = 30,0 mL',
      '15,0 mL er helmingur þess: hálfjafngildispunktur, 1,50 mmol HF og 1,50 mmol F⁻',
      'pH = pKₐ + log([F⁻]/[HF]) = pKₐ + log(1) = pKₐ',
      'pKₐ = −log(6,8 × 10⁻⁴) = 3,17, svo pH = 3,17',
    ],
    solutionSteps: [
      'n(HF) = 0.100 M × 30.0 mL = 3.00 mmol, so the equivalence volume is 3.00 mmol / 0.100 M = 30.0 mL',
      '15.0 mL is half of that: half-equivalence, 1.50 mmol HF and 1.50 mmol F⁻',
      'pH = pKₐ + log([F⁻]/[HF]) = pKₐ + log(1) = pKₐ',
      'pKₐ = −log(6.8 × 10⁻⁴) = 3.17, so pH = 3.17',
    ],
  },

  // === ONE TITRATION, FOUR POINTS ON ITS CURVE (2026-11-14) ===
  {
    id: 8,
    type: 'titration-curve',
    titleIs: 'Títrunarferill 1/4: upphafs-pH',
    title: 'Titration curve 1/4: initial pH',
    descriptionIs:
      'Títrun á 25,0 mL af 0,100 M ediksýru (CH₃COOH, Kₐ = 1,8 × 10⁻⁵) með 0,100 M NaOH. Hvert er pH áður en nokkru NaOH er bætt við?',
    description:
      'Titration of 25.0 mL of 0.100 M acetic acid (CH₃COOH, Kₐ = 1.8 × 10⁻⁵) with 0.100 M NaOH. What is the pH before any NaOH is added?',
    givenData: {
      analyteVolume: 25.0,
      analyteMolarity: 0.1,
      titrantMolarity: 0.1,
      Ka: 1.8e-5,
      formula: 'CH₃COOH + NaOH → CH₃COONa + H₂O',
    },
    fromCurve: { titrationId: 5, volume: 0 },
    correctAnswer: 2.87,
    answerDecimals: 2,
    unit: '',
    tolerance: 0.02,
    absoluteTolerance: 0.02,
    hintIs:
      'Aðeins veika sýran er í flöskunni. Notaðu Kₐ = [H⁺]²/C og athugaðu að [H⁺] sé lítið miðað við C.',
    hint: 'Only the weak acid is in the flask. Use Kₐ = [H⁺]²/C and check that [H⁺] is small next to C.',
    explanationIs:
      'Í upphafi er aðeins veik sýra í flöskunni, svo [H⁺] ≈ √(Kₐ·C). Hún klofnar um 1,3 %, langt undir 5 %, svo nálgunin stenst.',
    explanation:
      'At the start only the weak acid is in the flask, so [H⁺] ≈ √(Kₐ·C). It dissociates by 1.3 %, well under 5 %, so the approximation holds.',
    solutionStepsIs: [
      '[H⁺] ≈ √(Kₐ·C) = √(1,8 × 10⁻⁵ × 0,100) = 1,34 × 10⁻³ M',
      '1,34 × 10⁻³ / 0,100 = 1,3 %, undir 5 %: nálgunin stenst',
      'pH = −log(1,34 × 10⁻³) = 2,87',
    ],
    solutionSteps: [
      '[H⁺] ≈ √(Kₐ·C) = √(1.8 × 10⁻⁵ × 0.100) = 1.34 × 10⁻³ M',
      '1.34 × 10⁻³ / 0.100 = 1.3 %, under 5 %: the approximation holds',
      'pH = −log(1.34 × 10⁻³) = 2.87',
    ],
  },
  {
    id: 9,
    type: 'titration-curve',
    titleIs: 'Títrunarferill 2/4: pH á stuðpúðasvæðinu',
    title: 'Titration curve 2/4: pH in the buffer region',
    descriptionIs:
      'Títrun á 25,0 mL af 0,100 M ediksýru (CH₃COOH, Kₐ = 1,8 × 10⁻⁵) með 0,100 M NaOH. Hvert er pH eftir að 10,0 mL af NaOH hefur verið bætt við?',
    description:
      'Titration of 25.0 mL of 0.100 M acetic acid (CH₃COOH, Kₐ = 1.8 × 10⁻⁵) with 0.100 M NaOH. What is the pH after 10.0 mL of NaOH has been added?',
    givenData: {
      analyteVolume: 25.0,
      analyteMolarity: 0.1,
      titrantMolarity: 0.1,
      Ka: 1.8e-5,
      titrantAdded: 10.0,
      formula: 'CH₃COOH + NaOH → CH₃COONa + H₂O',
    },
    fromCurve: { titrationId: 5, volume: 10 },
    correctAnswer: 4.57,
    answerDecimals: 2,
    unit: '',
    tolerance: 0.02,
    absoluteTolerance: 0.02,
    hintIs:
      'Reiknaðu mólfjölda: hvað er eftir af sýrunni og hve mikið asetat hefur myndast? Þá er lausnin stuðpúði.',
    hint: 'Work in moles: how much acid is left and how much acetate has formed? Then the solution is a buffer.',
    explanationIs:
      'OH⁻ hvarfast að fullu við ediksýruna, svo eftir eru 1,50 mmól CH₃COOH og 1,00 mmól CH₃COO⁻. Rúmmálið styttist út úr hlutfallinu, svo Henderson-Hasselbalch gefur pH beint.',
    explanation:
      'OH⁻ reacts completely with the acetic acid, leaving 1.50 mmol CH₃COOH and 1.00 mmol CH₃COO⁻. The volume cancels from the ratio, so Henderson-Hasselbalch gives the pH directly.',
    solutionStepsIs: [
      'n(CH₃COOH) í upphafi = 0,100 M × 25,0 mL = 2,50 mmól',
      'n(OH⁻) = 0,100 M × 10,0 mL = 1,00 mmól',
      'Eftir hvarfið: 1,50 mmól CH₃COOH og 1,00 mmól CH₃COO⁻',
      'pKₐ = −log(1,8 × 10⁻⁵) = 4,745',
      'pH = 4,745 + log(1,00 / 1,50) = 4,745 − 0,176 = 4,57',
    ],
    solutionSteps: [
      'n(CH₃COOH) at the start = 0.100 M × 25.0 mL = 2.50 mmol',
      'n(OH⁻) = 0.100 M × 10.0 mL = 1.00 mmol',
      'After the reaction: 1.50 mmol CH₃COOH and 1.00 mmol CH₃COO⁻',
      'pKₐ = −log(1.8 × 10⁻⁵) = 4.745',
      'pH = 4.745 + log(1.00 / 1.50) = 4.745 − 0.176 = 4.57',
    ],
  },
  {
    id: 10,
    type: 'titration-curve',
    titleIs: 'Títrunarferill 3/4: pH við jafngildispunkt',
    title: 'Titration curve 3/4: pH at equivalence',
    descriptionIs:
      'Títrun á 25,0 mL af 0,100 M ediksýru (CH₃COOH, Kₐ = 1,8 × 10⁻⁵) með 0,100 M NaOH. Hvert er pH við jafngildispunktinn?',
    description:
      'Titration of 25.0 mL of 0.100 M acetic acid (CH₃COOH, Kₐ = 1.8 × 10⁻⁵) with 0.100 M NaOH. What is the pH at the equivalence point?',
    givenData: {
      analyteVolume: 25.0,
      analyteMolarity: 0.1,
      titrantMolarity: 0.1,
      Ka: 1.8e-5,
      formula: 'CH₃COOH + NaOH → CH₃COONa + H₂O',
    },
    fromCurve: { titrationId: 5, volume: 25 },
    correctAnswer: 8.72,
    answerDecimals: 2,
    unit: '',
    tolerance: 0.02,
    absoluteTolerance: 0.02,
    hintIs:
      'Finndu fyrst jafngildisrúmmálið. Þar er öll sýran orðin að asetatjónum, sem eru veikur basi: Kb = Kw/Kₐ.',
    hint: 'First find the equivalence volume. There all the acid has become acetate ions, a weak base: Kb = Kw/Kₐ.',
    explanationIs:
      'Við jafngildispunkt er öll ediksýran orðin að CH₃COO⁻, sem tekur við róteind frá vatni og myndar OH⁻. Því er pH yfir 7.',
    explanation:
      'At equivalence all the acetic acid has become CH₃COO⁻, which takes a proton from water and forms OH⁻. So the pH is above 7.',
    solutionStepsIs: [
      'Jafngildisrúmmál = 2,50 mmól / 0,100 M = 25,0 mL',
      '[CH₃COO⁻] = 2,50 mmól / 50,0 mL = 0,0500 M',
      'Kb = Kw / Kₐ = 1,0 × 10⁻¹⁴ / 1,8 × 10⁻⁵ = 5,6 × 10⁻¹⁰',
      '[OH⁻] ≈ √(Kb·C) = √(5,6 × 10⁻¹⁰ × 0,0500) = 5,3 × 10⁻⁶ M',
      'pOH = 5,28, svo pH = 14,00 − 5,28 = 8,72',
    ],
    solutionSteps: [
      'Equivalence volume = 2.50 mmol / 0.100 M = 25.0 mL',
      '[CH₃COO⁻] = 2.50 mmol / 50.0 mL = 0.0500 M',
      'Kb = Kw / Kₐ = 1.0 × 10⁻¹⁴ / 1.8 × 10⁻⁵ = 5.6 × 10⁻¹⁰',
      '[OH⁻] ≈ √(Kb·C) = √(5.6 × 10⁻¹⁰ × 0.0500) = 5.3 × 10⁻⁶ M',
      'pOH = 5.28, so pH = 14.00 − 5.28 = 8.72',
    ],
  },
  {
    id: 11,
    type: 'titration-curve',
    titleIs: 'Títrunarferill 4/4: pH eftir jafngildispunkt',
    title: 'Titration curve 4/4: pH past equivalence',
    descriptionIs:
      'Títrun á 25,0 mL af 0,100 M ediksýru (CH₃COOH, Kₐ = 1,8 × 10⁻⁵) með 0,100 M NaOH. Hvert er pH eftir að 30,0 mL af NaOH hefur verið bætt við?',
    description:
      'Titration of 25.0 mL of 0.100 M acetic acid (CH₃COOH, Kₐ = 1.8 × 10⁻⁵) with 0.100 M NaOH. What is the pH after 30.0 mL of NaOH has been added?',
    givenData: {
      analyteVolume: 25.0,
      analyteMolarity: 0.1,
      titrantMolarity: 0.1,
      Ka: 1.8e-5,
      titrantAdded: 30.0,
      formula: 'CH₃COOH + NaOH → CH₃COONa + H₂O',
    },
    fromCurve: { titrationId: 5, volume: 30 },
    correctAnswer: 11.96,
    answerDecimals: 2,
    unit: '',
    tolerance: 0.02,
    absoluteTolerance: 0.02,
    hintIs:
      'Hve mikið OH⁻ er umfram það sem sýran notaði? Asetatjónin bætir svo litlu við að hún skiptir ekki máli.',
    hint: 'How much OH⁻ is left over beyond what the acid used? The acetate ion adds too little to matter.',
    explanationIs:
      'Eftir jafngildispunkt ræður umframmagn OH⁻ pH. Asetatjónin myndar um 10⁻⁵ M OH⁻, sem hverfur við hliðina á 9 × 10⁻³ M.',
    explanation:
      'Past equivalence the excess OH⁻ sets the pH. The acetate ion makes about 10⁻⁵ M OH⁻, which vanishes beside 9 × 10⁻³ M.',
    solutionStepsIs: [
      'n(OH⁻) = 0,100 M × 30,0 mL = 3,00 mmól',
      'Umfram: 3,00 − 2,50 = 0,50 mmól OH⁻ í 55,0 mL',
      '[OH⁻] = 0,50 mmól / 55,0 mL = 9,09 × 10⁻³ M',
      'pOH = 2,04, svo pH = 14,00 − 2,04 = 11,96',
    ],
    solutionSteps: [
      'n(OH⁻) = 0.100 M × 30.0 mL = 3.00 mmol',
      'Excess: 3.00 − 2.50 = 0.50 mmol OH⁻ in 55.0 mL',
      '[OH⁻] = 0.50 mmol / 55.0 mL = 9.09 × 10⁻³ M',
      'pOH = 2.04, so pH = 14.00 − 2.04 = 11.96',
    ],
  },
];

/**
 * Whether an answer is right: within `absoluteTolerance` where a problem sets
 * one (the pH answers), else within `tolerance` of the answer, relatively.
 */
export function isAnswerCorrect(challenge: Level3Challenge, answer: number): boolean {
  if (!Number.isFinite(answer)) return false;
  const error = Math.abs(answer - challenge.correctAnswer);
  // The 1e-9 keeps an answer exactly on the bound, such as 4,88 for 4,86, inside it.
  if (challenge.absoluteTolerance !== undefined) return error <= challenge.absoluteTolerance + 1e-9;
  return error / Math.abs(challenge.correctAnswer) <= challenge.tolerance;
}
