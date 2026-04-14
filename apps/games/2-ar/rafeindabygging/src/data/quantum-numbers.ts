export interface QuantumNumberPuzzle {
  id: number;
  n: number;
  description_is: string;
  description_en: string;
  options: { l: number; ml: number; ms: number; isValid: boolean }[];
  explanation_is: string;
  explanation_en: string;
}

export const puzzles: QuantumNumberPuzzle[] = [
  {
    id: 1,
    n: 1,
    description_is: 'Fyrir n = 1, hvaða samsetningar (l, mₗ, mₛ) eru gildar?',
    description_en: 'For n = 1, which combinations (l, mₗ, mₛ) are valid?',
    options: [
      { l: 0, ml: 0, ms: 0.5, isValid: true },
      { l: 0, ml: 0, ms: -0.5, isValid: true },
      { l: 1, ml: 0, ms: 0.5, isValid: false }, // l cannot equal n
      { l: 0, ml: 1, ms: 0.5, isValid: false }, // ml out of range
    ],
    explanation_is: 'Þegar n=1: l getur aðeins verið 0 (1s svigrúm). mₗ=0, mₛ=±½.',
    explanation_en: 'When n=1: l can only be 0 (1s orbital). mₗ=0, mₛ=±½.',
  },
  {
    id: 2,
    n: 2,
    description_is: 'Fyrir n = 2, hvaða samsetningar eru gildar? (2s og 2p svigrúm)',
    description_en: 'For n = 2, which combinations are valid? (2s and 2p orbitals)',
    options: [
      { l: 0, ml: 0, ms: 0.5, isValid: true }, // 2s
      { l: 1, ml: -1, ms: -0.5, isValid: true }, // 2p
      { l: 1, ml: 0, ms: 0.5, isValid: true }, // 2p
      { l: 2, ml: 0, ms: 0.5, isValid: false }, // l=2 invalid for n=2
      { l: 1, ml: 2, ms: 0.5, isValid: false }, // ml > l
    ],
    explanation_is: 'Þegar n=2: l getur verið 0 eða 1. Fyrir l=1: mₗ = -1, 0, +1.',
    explanation_en: 'When n=2: l can be 0 or 1. For l=1: mₗ = -1, 0, +1.',
  },
  {
    id: 3,
    n: 2,
    description_is: 'Hvaða samsetningar eru gildar fyrir 2p svigrúmið (l = 1)?',
    description_en: 'Which combinations are valid for the 2p orbital (l = 1)?',
    options: [
      { l: 1, ml: 1, ms: 0.5, isValid: true },
      { l: 1, ml: 0, ms: -0.5, isValid: true },
      { l: 1, ml: -1, ms: 0.5, isValid: true },
      { l: 1, ml: -2, ms: 0.5, isValid: false }, // ml < -l
      { l: 1, ml: 1, ms: 0, isValid: false }, // ms must be ±½
    ],
    explanation_is: 'Fyrir l=1: mₗ = -1, 0, +1 (3 gildi). mₛ verður að vera +½ eða -½.',
    explanation_en: 'For l=1: mₗ = -1, 0, +1 (3 values). mₛ must be +½ or -½.',
  },
  {
    id: 4,
    n: 3,
    description_is: 'Fyrir n = 3, hvaða samsetningar eru gildar? (3s, 3p, 3d)',
    description_en: 'For n = 3, which combinations are valid? (3s, 3p, 3d)',
    options: [
      { l: 0, ml: 0, ms: -0.5, isValid: true }, // 3s
      { l: 2, ml: -2, ms: 0.5, isValid: true }, // 3d
      { l: 2, ml: 1, ms: -0.5, isValid: true }, // 3d
      { l: 3, ml: 0, ms: 0.5, isValid: false }, // l=3 invalid for n=3
      { l: 2, ml: 3, ms: 0.5, isValid: false }, // ml > l
    ],
    explanation_is: 'Þegar n=3: l = 0, 1, eða 2. l=2 gefur 3d svigrúm (mₗ: -2 til +2).',
    explanation_en: 'When n=3: l = 0, 1, or 2. l=2 gives 3d orbitals (mₗ: -2 to +2).',
  },
  {
    id: 5,
    n: 3,
    description_is: 'Hvaða samsetningar eru gildar fyrir 3d svigrúmið (l = 2)?',
    description_en: 'Which combinations are valid for the 3d orbital (l = 2)?',
    options: [
      { l: 2, ml: -2, ms: 0.5, isValid: true },
      { l: 2, ml: 0, ms: -0.5, isValid: true },
      { l: 2, ml: 2, ms: 0.5, isValid: true },
      { l: 2, ml: -3, ms: 0.5, isValid: false }, // ml < -l
      { l: 3, ml: 0, ms: 0.5, isValid: false }, // wrong l for n=3
    ],
    explanation_is: 'Fyrir l=2 (d-svigrúm): mₗ = -2, -1, 0, +1, +2 (5 svigrúm).',
    explanation_en: 'For l=2 (d-orbital): mₗ = -2, -1, 0, +1, +2 (5 orbitals).',
  },
  {
    id: 6,
    n: 4,
    description_is: 'Fyrir n = 4, hvaða samsetningar eru gildar?',
    description_en: 'For n = 4, which combinations are valid?',
    options: [
      { l: 0, ml: 0, ms: 0.5, isValid: true }, // 4s
      { l: 3, ml: -3, ms: -0.5, isValid: true }, // 4f
      { l: 2, ml: 1, ms: 0.5, isValid: true }, // 4d
      { l: 4, ml: 0, ms: 0.5, isValid: false }, // l cannot equal n
      { l: 3, ml: 4, ms: 0.5, isValid: false }, // ml > l
    ],
    explanation_is: 'Þegar n=4: l = 0, 1, 2, eða 3 (s, p, d, f). l=4 er ógilt!',
    explanation_en: 'When n=4: l = 0, 1, 2, or 3 (s, p, d, f). l=4 is invalid!',
  },
  {
    id: 7,
    n: 1,
    description_is: 'Hvaða gildi á mₛ eru möguleg? Veldu gildar samsetningar.',
    description_en: 'What values of mₛ are possible? Select valid combinations.',
    options: [
      { l: 0, ml: 0, ms: 0.5, isValid: true },
      { l: 0, ml: 0, ms: -0.5, isValid: true },
      { l: 0, ml: 0, ms: 1, isValid: false }, // ms must be ±½
      { l: 0, ml: 0, ms: 0, isValid: false }, // ms cannot be 0
    ],
    explanation_is:
      'mₛ (spunaskammtatala) getur aðeins verið +½ eða -½. Þetta táknar snúning rafeindanna.',
    explanation_en: 'mₛ (spin quantum number) can only be +½ or -½. This represents electron spin.',
  },
  {
    id: 8,
    n: 4,
    description_is: 'Hvaða samsetningar eru gildar fyrir 4f svigrúmið (l = 3)?',
    description_en: 'Which combinations are valid for the 4f orbital (l = 3)?',
    options: [
      { l: 3, ml: -3, ms: 0.5, isValid: true },
      { l: 3, ml: 0, ms: -0.5, isValid: true },
      { l: 3, ml: 3, ms: 0.5, isValid: true },
      { l: 3, ml: -4, ms: 0.5, isValid: false }, // ml < -l
      { l: 4, ml: 0, ms: 0.5, isValid: false }, // l=4 invalid for n=4
    ],
    explanation_is: 'Fyrir l=3 (f-svigrúm): mₗ = -3 til +3 (7 svigrúm, 14 rafeindir).',
    explanation_en: 'For l=3 (f-orbital): mₗ = -3 to +3 (7 orbitals, 14 electrons).',
  },
];
