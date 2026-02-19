// Level 3: Calculation challenges for pH titration

export interface Level3Challenge {
  id: number;
  type: 'find-concentration' | 'find-volume' | 'polyprotic' | 'henderson-hasselbalch' | 'combined';
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
    acidConcentration?: number;
    baseConcentration?: number;
    formula?: string;
  };

  // Answer
  correctAnswer: number;
  unit: string;
  tolerance: number;  // Relative tolerance (e.g., 0.02 = ±2%)

  // For polyprotic
  titrationId?: number;
  equivalencePointIndex?: number;

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
    descriptionIs: 'Títrun á 25.0 mL af HCl með 0.100 M NaOH náði jafngildispunkti við 32.5 mL. Hver er styrkur HCl?',
    description: 'Titration of 25.0 mL of HCl with 0.100 M NaOH reached equivalence at 32.5 mL. What is the HCl concentration?',
    givenData: {
      analyteVolume: 25.0,
      equivalenceVolume: 32.5,
      titrantMolarity: 0.100,
      formula: 'HCl + NaOH → NaCl + H₂O'
    },
    correctAnswer: 0.130,
    unit: 'M',
    tolerance: 0.02,
    hintIs: 'Notaðu hlutfallið: n(HCl) = n(NaOH) við jafngildispunkt. Molfjöldi = styrkur × rúmmál.',
    hint: 'Use the ratio: n(HCl) = n(NaOH) at equivalence. Moles = molarity × volume.',
    explanationIs: 'Við jafngildispunkt: n(HCl) = n(NaOH). Þannig: M₁V₁ = M₂V₂.',
    explanation: 'At equivalence: n(HCl) = n(NaOH). Thus: M₁V₁ = M₂V₂.',
    solutionStepsIs: [
      'n(NaOH) = M × V = 0.100 mol/L × 0.0325 L = 0.00325 mol',
      'n(HCl) = n(NaOH) = 0.00325 mol (1:1 hlutfall)',
      'M(HCl) = n / V = 0.00325 mol / 0.025 L = 0.130 M'
    ],
    solutionSteps: [
      'n(NaOH) = M × V = 0.100 mol/L × 0.0325 L = 0.00325 mol',
      'n(HCl) = n(NaOH) = 0.00325 mol (1:1 ratio)',
      'M(HCl) = n / V = 0.00325 mol / 0.025 L = 0.130 M'
    ]
  },
  {
    id: 2,
    type: 'find-concentration',
    titleIs: 'Styrk veikrar sýru',
    title: 'Weak acid concentration',
    descriptionIs: 'Títrun á 50.0 mL af ediksýru (CH₃COOH) með 0.150 M NaOH náði jafngildispunkti við 28.0 mL. Hver er styrkur ediksýrunnar?',
    description: 'Titration of 50.0 mL of acetic acid (CH₃COOH) with 0.150 M NaOH reached equivalence at 28.0 mL. What is the acetic acid concentration?',
    givenData: {
      analyteVolume: 50.0,
      equivalenceVolume: 28.0,
      titrantMolarity: 0.150,
      formula: 'CH₃COOH + NaOH → CH₃COONa + H₂O'
    },
    correctAnswer: 0.084,
    unit: 'M',
    tolerance: 0.02,
    hintIs: 'Sama aðferð og fyrir sterka sýru - einungis molfjöldi skiptir máli við jafngildispunkt.',
    hint: 'Same method as for strong acid - only moles matter at equivalence point.',
    explanationIs: 'Hvort sem sýran er sterk eða veik, er molfjöldi sýru og basa jafnt við jafngildispunkt.',
    explanation: 'Whether the acid is strong or weak, moles of acid and base are equal at equivalence.',
    solutionStepsIs: [
      'n(NaOH) = 0.150 mol/L × 0.028 L = 0.0042 mol',
      'n(CH₃COOH) = n(NaOH) = 0.0042 mol',
      'M(CH₃COOH) = 0.0042 mol / 0.050 L = 0.084 M'
    ],
    solutionSteps: [
      'n(NaOH) = 0.150 mol/L × 0.028 L = 0.0042 mol',
      'n(CH₃COOH) = n(NaOH) = 0.0042 mol',
      'M(CH₃COOH) = 0.0042 mol / 0.050 L = 0.084 M'
    ]
  },

  // === FIND VOLUME PROBLEM ===
  {
    id: 3,
    type: 'find-volume',
    titleIs: 'Finndu jafngildisrúmmál',
    title: 'Find equivalence volume',
    descriptionIs: 'Hversu mikið af 0.200 M NaOH þarf til að títra 35.0 mL af 0.120 M HNO₃ til jafngildispunkts?',
    description: 'How much 0.200 M NaOH is needed to titrate 35.0 mL of 0.120 M HNO₃ to equivalence?',
    givenData: {
      analyteVolume: 35.0,
      analyteMolarity: 0.120,
      titrantMolarity: 0.200,
      formula: 'HNO₃ + NaOH → NaNO₃ + H₂O'
    },
    correctAnswer: 21.0,
    unit: 'mL',
    tolerance: 0.02,
    hintIs: 'M₁V₁ = M₂V₂ fyrir 1:1 hvarfahlutfall. Leystu fyrir V₂.',
    hint: 'M₁V₁ = M₂V₂ for 1:1 reaction ratio. Solve for V₂.',
    explanationIs: 'Notaðu formúluna M₁V₁ = M₂V₂ þar sem 1 er sýra og 2 er basi.',
    explanation: 'Use the formula M₁V₁ = M₂V₂ where 1 is acid and 2 is base.',
    solutionStepsIs: [
      'n(HNO₃) = 0.120 M × 35.0 mL = 4.20 mmol',
      'n(NaOH) þarf = 4.20 mmol (1:1 hlutfall)',
      'V(NaOH) = n / M = 4.20 mmol / 0.200 M = 21.0 mL'
    ],
    solutionSteps: [
      'n(HNO₃) = 0.120 M × 35.0 mL = 4.20 mmol',
      'n(NaOH) needed = 4.20 mmol (1:1 ratio)',
      'V(NaOH) = n / M = 4.20 mmol / 0.200 M = 21.0 mL'
    ]
  },

  // === POLYPROTIC PROBLEMS ===
  {
    id: 4,
    type: 'polyprotic',
    titleIs: 'Tvíprótón sýra: H₂SO₃',
    title: 'Diprotic acid: H₂SO₃',
    descriptionIs: 'Títrun á 20.0 mL af 0.100 M H₂SO₃ með 0.100 M NaOH. Hversu mikið NaOH þarf til að ná ÖÐRUM jafngildispunkti (H₂SO₃ → SO₃²⁻)?',
    description: 'Titration of 20.0 mL of 0.100 M H₂SO₃ with 0.100 M NaOH. How much NaOH is needed to reach the SECOND equivalence point (H₂SO₃ → SO₃²⁻)?',
    givenData: {
      analyteVolume: 20.0,
      analyteMolarity: 0.100,
      titrantMolarity: 0.100,
      formula: 'H₂SO₃ + 2NaOH → Na₂SO₃ + 2H₂O'
    },
    correctAnswer: 40.0,
    unit: 'mL',
    tolerance: 0.02,
    titrationId: 11,
    equivalencePointIndex: 2,
    hintIs: 'Tvíprótón sýra gefur 2 mól H⁺ fyrir hvert mól sýru. Við annan jafngildispunkt hafa bæði H⁺ hvarfast.',
    hint: 'Diprotic acid gives 2 mol H⁺ per mol acid. At second equivalence, both H⁺ have reacted.',
    explanationIs: 'H₂SO₃ er tvíprótón, svo n(NaOH) = 2 × n(H₂SO₃) við annan jafngildispunkt.',
    explanation: 'H₂SO₃ is diprotic, so n(NaOH) = 2 × n(H₂SO₃) at second equivalence point.',
    solutionStepsIs: [
      'n(H₂SO₃) = 0.100 M × 20.0 mL = 2.00 mmol',
      'Við 2. jafngildispunkt: n(NaOH) = 2 × n(H₂SO₃) = 4.00 mmol',
      'V(NaOH) = 4.00 mmol / 0.100 M = 40.0 mL'
    ],
    solutionSteps: [
      'n(H₂SO₃) = 0.100 M × 20.0 mL = 2.00 mmol',
      'At 2nd equivalence: n(NaOH) = 2 × n(H₂SO₃) = 4.00 mmol',
      'V(NaOH) = 4.00 mmol / 0.100 M = 40.0 mL'
    ]
  },
  {
    id: 5,
    type: 'polyprotic',
    titleIs: 'Þríprótón sýra: H₃PO₄',
    title: 'Triprotic acid: H₃PO₄',
    descriptionIs: 'Títrun á 25.0 mL af 0.080 M H₃PO₄ með 0.100 M NaOH. Hversu mikið NaOH þarf til að ná FYRSTA jafngildispunkti (H₃PO₄ → H₂PO₄⁻)?',
    description: 'Titration of 25.0 mL of 0.080 M H₃PO₄ with 0.100 M NaOH. How much NaOH is needed to reach the FIRST equivalence point (H₃PO₄ → H₂PO₄⁻)?',
    givenData: {
      analyteVolume: 25.0,
      analyteMolarity: 0.080,
      titrantMolarity: 0.100,
      formula: 'H₃PO₄ + NaOH → NaH₂PO₄ + H₂O (1. jafngildispunktur)'
    },
    correctAnswer: 20.0,
    unit: 'mL',
    tolerance: 0.02,
    titrationId: 13,
    equivalencePointIndex: 1,
    hintIs: 'Við fyrsta jafngildispunkt, hefur aðeins eitt H⁺ hvarfast. Hlutfallið er 1:1.',
    hint: 'At first equivalence, only one H⁺ has reacted. The ratio is 1:1.',
    explanationIs: 'Við fyrsta jafngildispunkt: n(NaOH) = n(H₃PO₄) þar sem eitt H⁺ hlutlausast.',
    explanation: 'At first equivalence: n(NaOH) = n(H₃PO₄) since one H⁺ is neutralized.',
    solutionStepsIs: [
      'n(H₃PO₄) = 0.080 M × 25.0 mL = 2.00 mmol',
      'Við 1. jafngildispunkt: n(NaOH) = n(H₃PO₄) = 2.00 mmol',
      'V(NaOH) = 2.00 mmol / 0.100 M = 20.0 mL'
    ],
    solutionSteps: [
      'n(H₃PO₄) = 0.080 M × 25.0 mL = 2.00 mmol',
      'At 1st equivalence: n(NaOH) = n(H₃PO₄) = 2.00 mmol',
      'V(NaOH) = 2.00 mmol / 0.100 M = 20.0 mL'
    ]
  },

  // === HENDERSON-HASSELBALCH PROBLEMS ===
  {
    id: 6,
    type: 'henderson-hasselbalch',
    titleIs: 'Henderson-Hasselbalch: Finndu pH',
    title: 'Henderson-Hasselbalch: Find pH',
    descriptionIs: 'Púffurlausn inniheldur 0.15 M ediksýru (CH₃COOH) og 0.20 M natríumasetat (CH₃COONa). pKₐ = 4.74. Hver er pH púffursins?',
    description: 'A buffer contains 0.15 M acetic acid (CH₃COOH) and 0.20 M sodium acetate (CH₃COONa). pKₐ = 4.74. What is the buffer pH?',
    givenData: {
      acidConcentration: 0.15,
      baseConcentration: 0.20,
      pKa: 4.74,
      formula: 'pH = pKₐ + log([A⁻]/[HA])'
    },
    correctAnswer: 4.86,
    unit: '',
    tolerance: 0.02,
    hintIs: 'Henderson-Hasselbalch jafnan: pH = pKₐ + log([samþjöppuð basi]/[veik sýra])',
    hint: 'Henderson-Hasselbalch equation: pH = pKₐ + log([conjugate base]/[weak acid])',
    explanationIs: 'Settu gildin inn í Henderson-Hasselbalch jöfnuna og reiknaðu.',
    explanation: 'Substitute the values into the Henderson-Hasselbalch equation and calculate.',
    solutionStepsIs: [
      'pH = pKₐ + log([A⁻]/[HA])',
      'pH = 4.74 + log(0.20/0.15)',
      'pH = 4.74 + log(1.33)',
      'pH = 4.74 + 0.12 = 4.86'
    ],
    solutionSteps: [
      'pH = pKₐ + log([A⁻]/[HA])',
      'pH = 4.74 + log(0.20/0.15)',
      'pH = 4.74 + log(1.33)',
      'pH = 4.74 + 0.12 = 4.86'
    ]
  },
  {
    id: 7,
    type: 'henderson-hasselbalch',
    titleIs: 'Henderson-Hasselbalch: Finndu hlutfall',
    title: 'Henderson-Hasselbalch: Find ratio',
    descriptionIs: 'Þú þarft púffur með pH = 9.50 úr ammoníaki (NH₃) og ammóníumklóríði (NH₄Cl). pKₐ(NH₄⁺) = 9.26. Hvert þarf hlutfall [NH₃]/[NH₄⁺] að vera?',
    description: 'You need a buffer with pH = 9.50 using ammonia (NH₃) and ammonium chloride (NH₄Cl). pKₐ(NH₄⁺) = 9.26. What ratio [NH₃]/[NH₄⁺] is needed?',
    givenData: {
      pH: 9.50,
      pKa: 9.26,
      formula: 'pH = pKₐ + log([NH₃]/[NH₄⁺])'
    },
    correctAnswer: 1.74,
    unit: '',
    tolerance: 0.05,
    hintIs: 'Endurraðaðu Henderson-Hasselbalch: log(hlutfall) = pH - pKₐ, svo hlutfall = 10^(pH - pKₐ)',
    hint: 'Rearrange Henderson-Hasselbalch: log(ratio) = pH - pKₐ, so ratio = 10^(pH - pKₐ)',
    explanationIs: 'Leystu fyrir hlutfallið með því að nota 10^ á báðar hliðar.',
    explanation: 'Solve for the ratio by using 10^ on both sides.',
    solutionStepsIs: [
      'pH = pKₐ + log([NH₃]/[NH₄⁺])',
      '9.50 = 9.26 + log(hlutfall)',
      'log(hlutfall) = 9.50 - 9.26 = 0.24',
      'hlutfall = 10^0.24 = 1.74'
    ],
    solutionSteps: [
      'pH = pKₐ + log([NH₃]/[NH₄⁺])',
      '9.50 = 9.26 + log(ratio)',
      'log(ratio) = 9.50 - 9.26 = 0.24',
      'ratio = 10^0.24 = 1.74'
    ]
  },

  // === COMBINED PROBLEM ===
  {
    id: 8,
    type: 'combined',
    titleIs: 'Samansett verkefni: pH við hálfan jafngildispunkt',
    title: 'Combined problem: pH at half-equivalence',
    descriptionIs: 'Títrun á 30.0 mL af 0.100 M flúorsýru (HF, pKₐ = 3.17) með 0.100 M NaOH. Hver er pH við hálfan jafngildispunkt?',
    description: 'Titration of 30.0 mL of 0.100 M hydrofluoric acid (HF, pKₐ = 3.17) with 0.100 M NaOH. What is the pH at half-equivalence?',
    givenData: {
      analyteVolume: 30.0,
      analyteMolarity: 0.100,
      titrantMolarity: 0.100,
      pKa: 3.17,
      formula: 'HF + NaOH → NaF + H₂O'
    },
    correctAnswer: 3.17,
    unit: '',
    tolerance: 0.02,
    hintIs: 'Við hálfan jafngildispunkt: [HA] = [A⁻]. Hvað verður þá log([A⁻]/[HA])?',
    hint: 'At half-equivalence: [HA] = [A⁻]. What does log([A⁻]/[HA]) become?',
    explanationIs: 'Við hálfan jafngildispunkt, helmingur sýrunnar hefur hvarfast, svo [HA] = [A⁻] og pH = pKₐ.',
    explanation: 'At half-equivalence, half the acid has reacted, so [HA] = [A⁻] and pH = pKₐ.',
    solutionStepsIs: [
      'Við hálfan jafngildispunkt: [HF] = [F⁻]',
      'Henderson-Hasselbalch: pH = pKₐ + log([F⁻]/[HF])',
      'pH = pKₐ + log(1) = pKₐ + 0 = pKₐ',
      'pH = 3.17'
    ],
    solutionSteps: [
      'At half-equivalence: [HF] = [F⁻]',
      'Henderson-Hasselbalch: pH = pKₐ + log([F⁻]/[HF])',
      'pH = pKₐ + log(1) = pKₐ + 0 = pKₐ',
      'pH = 3.17'
    ]
  }
];
