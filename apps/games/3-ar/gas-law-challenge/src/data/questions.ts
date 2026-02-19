import { GasLawQuestion } from '../types';

/**
 * Complete bank of gas law questions
 * Based on Ideal Gas Law: PV = nRT where R = 0.08206 L·atm/(mol·K)
 */
export const questions: GasLawQuestion[] = [
  // ===== EASY LEVEL (10 Questions) =====
  {
    id: 1,
    emoji: '🎈',
    scenario_is: 'Þú ert að blása upp blöðru fyrir afmælisveislu. Loftið í andanum þínum er um 37°C.',
    scenario_en: "You're blowing up a balloon for a birthday party. The air from your breath is about 37°C.",
    difficulty: 'Auðvelt',
    gasLaw: 'ideal',
    given: {
      P: { value: 1.0, unit: 'atm' },
      T: { value: 310, unit: 'K' },
      n: { value: 0.15, unit: 'mol' }
    },
    find: 'V',
    answer: 3.82,
    tolerance: 0.08,
    hints: [
      'Solve for V. Rearrange PV = nRT',
      'Use: V = nRT/P',
      'Substitute: V = (0.15)(0.08206)(310)/(1.0)',
      'Calculate: V = 3.82 L'
    ],
    solution: {
      formula: 'V = nRT/P',
      substitution: 'V = (0.15 mol)(0.08206 L·atm/mol·K)(310 K) / (1.0 atm)',
      calculation: 'V = 3.82 L',
      steps: [
        'Start with PV = nRT',
        'Rearrange to solve for V: V = nRT/P',
        'Substitute values: V = (0.15)(0.08206)(310)/(1.0)',
        'Calculate: V = 3.82 L'
      ]
    }
  },
  
  {
    id: 2,
    emoji: '🚴',
    scenario_is: 'Þú ert að athuga loftþrýsting í hjólbarða hjólreiðarinnar þinnar að morgni.',
    scenario_en: "You're checking the tire pressure on your bicycle in the morning.",
    difficulty: 'Auðvelt',
    gasLaw: 'ideal',
    given: {
      P: { value: 2.5, unit: 'atm' },
      V: { value: 2.0, unit: 'L' },
      T: { value: 288, unit: 'K' }
    },
    find: 'n',
    answer: 0.211,
    tolerance: 0.004,
    hints: [
      'Solve for n (moles). Rearrange PV = nRT',
      'Use: n = PV/RT',
      'Substitute: n = (2.5)(2.0)/[(0.08206)(288)]',
      'Calculate: n = 0.211 mol'
    ],
    solution: {
      formula: 'n = PV/RT',
      substitution: 'n = (2.5 atm)(2.0 L) / [(0.08206 L·atm/mol·K)(288 K)]',
      calculation: 'n = 0.211 mol',
      steps: [
        'Start with PV = nRT',
        'Rearrange to solve for n: n = PV/RT',
        'Substitute values: n = (2.5)(2.0)/(0.08206 × 288)',
        'Calculate: n = 0.211 mol'
      ]
    }
  },
  
  {
    id: 3,
    emoji: '🥤',
    scenario_is: 'Kólaflaska inniheldur koltvísýring undir þrýstingi.',
    scenario_en: 'A soda bottle contains carbon dioxide under pressure.',
    difficulty: 'Auðvelt',
    gasLaw: 'ideal',
    given: {
      V: { value: 2.0, unit: 'L' },
      T: { value: 298, unit: 'K' },
      n: { value: 0.30, unit: 'mol' }
    },
    find: 'P',
    answer: 3.67,
    tolerance: 0.07,
    hints: [
      'Solve for P (pressure). Rearrange PV = nRT',
      'Use: P = nRT/V',
      'Substitute: P = (0.30)(0.08206)(298)/(2.0)',
      'Calculate: P = 3.67 atm'
    ],
    solution: {
      formula: 'P = nRT/V',
      substitution: 'P = (0.30 mol)(0.08206 L·atm/mol·K)(298 K) / (2.0 L)',
      calculation: 'P = 3.67 atm',
      steps: [
        'Start with PV = nRT',
        'Rearrange to solve for P: P = nRT/V',
        'Substitute values: P = (0.30)(0.08206)(298)/(2.0)',
        'Calculate: P = 3.67 atm'
      ]
    }
  },
  
  {
    id: 4,
    emoji: '🧪',
    scenario_is: 'Í efnafræðistofu ertu að vinna með lofteinangrun við staðalskilyrði.',
    scenario_en: "In the chemistry lab, you're working with a gas sample at standard conditions.",
    difficulty: 'Auðvelt',
    gasLaw: 'ideal',
    given: {
      P: { value: 1.0, unit: 'atm' },
      V: { value: 5.0, unit: 'L' },
      n: { value: 0.20, unit: 'mol' }
    },
    find: 'T',
    answer: 305,
    tolerance: 6,
    hints: [
      'Solve for T (temperature). Rearrange PV = nRT',
      'Use: T = PV/nR',
      'Substitute: T = (1.0)(5.0)/[(0.20)(0.08206)]',
      'Calculate: T = 305 K'
    ],
    solution: {
      formula: 'T = PV/nR',
      substitution: 'T = (1.0 atm)(5.0 L) / [(0.20 mol)(0.08206 L·atm/mol·K)]',
      calculation: 'T = 305 K',
      steps: [
        'Start with PV = nRT',
        'Rearrange to solve for T: T = PV/nR',
        'Substitute values: T = (1.0)(5.0)/(0.20 × 0.08206)',
        'Calculate: T = 305 K'
      ]
    }
  },
  
  // ===== MEDIUM LEVEL (6 Questions) =====
  {
    id: 5,
    emoji: '🤿',
    scenario_is: 'Köfunarílát við 10m dýpi þar sem þrýstingur er 2.0 atm.',
    scenario_en: 'A scuba tank at 10m depth where the pressure is 2.0 atm.',
    difficulty: 'Miðlungs',
    gasLaw: 'ideal',
    given: {
      P: { value: 2.0, unit: 'atm' },
      V: { value: 12.0, unit: 'L' },
      T: { value: 283, unit: 'K' }
    },
    find: 'n',
    answer: 1.03,
    tolerance: 0.02,
    hints: [
      'Solve for moles at depth. Use n = PV/RT',
      'Notice pressure is doubled at this depth',
      'Substitute: n = (2.0)(12.0)/[(0.08206)(283)]',
      'Calculate: n = 1.03 mol'
    ],
    solution: {
      formula: 'n = PV/RT',
      substitution: 'n = (2.0 atm)(12.0 L) / [(0.08206 L·atm/mol·K)(283 K)]',
      calculation: 'n = 1.03 mol',
      steps: [
        'At 10m depth, pressure = 2.0 atm',
        'Start with PV = nRT',
        'Rearrange: n = PV/RT',
        'Substitute: n = (2.0)(12.0)/(0.08206 × 283)',
        'Calculate: n = 1.03 mol'
      ]
    }
  },
  
  {
    id: 6,
    emoji: '🎈',
    scenario_is: 'Loftbelgur er hitaður upp úr 300K í 400K við fast þrýsðing.',
    scenario_en: 'A hot air balloon is heated from 300K to 400K at constant pressure.',
    difficulty: 'Miðlungs',
    gasLaw: 'ideal',
    given: {
      P: { value: 1.0, unit: 'atm' },
      T: { value: 400, unit: 'K' },
      n: { value: 150, unit: 'mol' }
    },
    find: 'V',
    answer: 4924,
    tolerance: 98,
    hints: [
      'Large balloon needs large volume',
      'Use V = nRT/P with many moles',
      'Substitute: V = (150)(0.08206)(400)/(1.0)',
      'Calculate: V = 4924 L'
    ],
    solution: {
      formula: 'V = nRT/P',
      substitution: 'V = (150 mol)(0.08206 L·atm/mol·K)(400 K) / (1.0 atm)',
      calculation: 'V = 4924 L',
      steps: [
        'Hot air balloon at high temperature',
        'Use ideal gas law: PV = nRT',
        'Solve for V: V = nRT/P',
        'Substitute: V = (150)(0.08206)(400)/(1.0)',
        'Calculate: V = 4924 L (≈ 4.9 m³)'
      ]
    }
  },
  
  // ===== HARD LEVEL (4 Questions) =====
  {
    id: 7,
    emoji: '🏭',
    scenario_is: 'Iðnaðargastankur með mjög háum þrýstingi.',
    scenario_en: 'Industrial gas cylinder with very high pressure.',
    difficulty: 'Erfitt',
    gasLaw: 'ideal',
    given: {
      V: { value: 50.0, unit: 'L' },
      T: { value: 298, unit: 'K' },
      n: { value: 82.0, unit: 'mol' }
    },
    find: 'P',
    answer: 40.1,
    tolerance: 0.8,
    hints: [
      'High moles in small volume = high pressure',
      'Use P = nRT/V',
      'Substitute: P = (82.0)(0.08206)(298)/(50.0)',
      'Calculate: P = 40.1 atm'
    ],
    solution: {
      formula: 'P = nRT/V',
      substitution: 'P = (82.0 mol)(0.08206 L·atm/mol·K)(298 K) / (50.0 L)',
      calculation: 'P = 40.1 atm',
      steps: [
        'Industrial cylinder has high pressure',
        'Start with PV = nRT',
        'Solve for P: P = nRT/V',
        'Substitute: P = (82.0)(0.08206)(298)/(50.0)',
        'Calculate: P = 40.1 atm (very high!)'
      ]
    }
  },
  
  {
    id: 8,
    emoji: '🌊',
    scenario_is: 'Djúpköfun á 100m dýpi þar sem þrýstingur er 11 atm.',
    scenario_en: 'Deep sea dive at 100m depth where pressure is 11 atm.',
    difficulty: 'Erfitt',
    gasLaw: 'ideal',
    given: {
      P: { value: 11.0, unit: 'atm' },
      V: { value: 3.0, unit: 'L' },
      n: { value: 1.5, unit: 'mol' }
    },
    find: 'T',
    answer: 268,
    tolerance: 5,
    hints: [
      'Deep ocean = high pressure, cold temperature',
      'Use T = PV/nR',
      'Substitute: T = (11.0)(3.0)/[(1.5)(0.08206)]',
      'Calculate: T = 268 K'
    ],
    solution: {
      formula: 'T = PV/nR',
      substitution: 'T = (11.0 atm)(3.0 L) / [(1.5 mol)(0.08206 L·atm/mol·K)]',
      calculation: 'T = 268 K',
      steps: [
        'At 100m depth, pressure is very high (11 atm)',
        'Start with PV = nRT',
        'Solve for T: T = PV/nR',
        'Substitute: T = (11.0)(3.0)/(1.5 × 0.08206)',
        'Calculate: T = 268 K (≈ -5°C, cold!)'
      ]
    }
  },

  // ===== ATMOSPHERIC APPLICATIONS =====
  {
    id: 9,
    emoji: '🏔️',
    scenario_is: 'Á toppi Everest (8849m) er loftþrýstingur aðeins 0.33 atm. Hversu mikið loft (mól) er í 5L lungum?',
    scenario_en: 'At the summit of Everest (8849m), air pressure is only 0.33 atm. How much air (moles) is in 5L lungs?',
    difficulty: 'Miðlungs',
    gasLaw: 'ideal',
    given: {
      P: { value: 0.33, unit: 'atm' },
      V: { value: 5.0, unit: 'L' },
      T: { value: 243, unit: 'K' }
    },
    find: 'n',
    answer: 0.083,
    tolerance: 0.002,
    hints: [
      'High altitude = low pressure = less air per breath',
      'Use n = PV/RT',
      'Substitute: n = (0.33)(5.0)/[(0.08206)(243)]',
      'Calculate: n = 0.083 mol (only 1/3 of sea level!)'
    ],
    solution: {
      formula: 'n = PV/RT',
      substitution: 'n = (0.33 atm)(5.0 L) / [(0.08206 L·atm/mol·K)(243 K)]',
      calculation: 'n = 0.083 mol',
      steps: [
        'At 8849m, atmospheric pressure is only 33% of sea level',
        'Temperature at summit: about -30°C = 243 K',
        'Rearrange PV = nRT to n = PV/RT',
        'Substitute: n = (0.33)(5.0)/(0.08206 × 243)',
        'Calculate: n = 0.083 mol (explains why climbers need oxygen!)'
      ]
    }
  },

  {
    id: 10,
    emoji: '✈️',
    scenario_is: 'Farþegaflugvél flýgur á 10.000m hæð þar sem þrýstingur er 0.26 atm og hitastig -50°C.',
    scenario_en: 'A passenger aircraft flies at 10,000m altitude where pressure is 0.26 atm and temperature is -50°C.',
    difficulty: 'Miðlungs',
    gasLaw: 'ideal',
    given: {
      P: { value: 0.26, unit: 'atm' },
      T: { value: 223, unit: 'K' },
      n: { value: 0.50, unit: 'mol' }
    },
    find: 'V',
    answer: 35.2,
    tolerance: 0.7,
    hints: [
      'Low pressure and temperature affect gas volume',
      'Use V = nRT/P',
      'Substitute: V = (0.50)(0.08206)(223)/(0.26)',
      'Calculate: V = 35.2 L'
    ],
    solution: {
      formula: 'V = nRT/P',
      substitution: 'V = (0.50 mol)(0.08206 L·atm/mol·K)(223 K) / (0.26 atm)',
      calculation: 'V = 35.2 L',
      steps: [
        'At cruising altitude (10 km), pressure is very low',
        'Temperature: -50°C = 223 K',
        'Use PV = nRT, solve for V',
        'Substitute: V = (0.50)(0.08206)(223)/(0.26)',
        'Calculate: V = 35.2 L (this is why planes are pressurized!)'
      ]
    }
  },

  {
    id: 11,
    emoji: '🌡️',
    scenario_is: 'Veðurspá: Lágþrýstingssvæði nálgast. Hvað gerist við loftþrýsting þegar hitastigið lækkar?',
    scenario_en: 'Weather forecast: Low pressure system approaching. A weather balloon has 100 mol of gas.',
    difficulty: 'Miðlungs',
    gasLaw: 'ideal',
    given: {
      V: { value: 2500, unit: 'L' },
      T: { value: 288, unit: 'K' },
      n: { value: 100, unit: 'mol' }
    },
    find: 'P',
    answer: 0.946,
    tolerance: 0.019,
    hints: [
      'Weather balloons measure atmospheric conditions',
      'Use P = nRT/V',
      'Substitute: P = (100)(0.08206)(288)/(2500)',
      'Calculate: P = 0.946 atm (low pressure = stormy weather!)'
    ],
    solution: {
      formula: 'P = nRT/V',
      substitution: 'P = (100 mol)(0.08206 L·atm/mol·K)(288 K) / (2500 L)',
      calculation: 'P = 0.946 atm',
      steps: [
        'Weather balloon carries instruments to measure atmosphere',
        'Low pressure systems often bring clouds and rain',
        'Use PV = nRT, solve for P',
        'Substitute: P = (100)(0.08206)(288)/(2500)',
        'Calculate: P = 0.946 atm (below standard 1.0 atm = low pressure system)'
      ]
    }
  },

  {
    id: 12,
    emoji: '🚀',
    scenario_is: 'Geimferð: Í geimskipi er þrýstingi haldið við 0.7 atm (eins og á 3000m hæð á jörðu).',
    scenario_en: 'Space travel: A spacecraft cabin is maintained at 0.7 atm (like 3000m altitude on Earth).',
    difficulty: 'Erfitt',
    gasLaw: 'ideal',
    given: {
      P: { value: 0.7, unit: 'atm' },
      V: { value: 50.0, unit: 'L' },
      T: { value: 295, unit: 'K' }
    },
    find: 'n',
    answer: 1.45,
    tolerance: 0.03,
    hints: [
      'Spacecraft cabins use lower pressure to reduce stress on hull',
      'Use n = PV/RT',
      'Substitute: n = (0.7)(50.0)/[(0.08206)(295)]',
      'Calculate: n = 1.45 mol'
    ],
    solution: {
      formula: 'n = PV/RT',
      substitution: 'n = (0.7 atm)(50.0 L) / [(0.08206 L·atm/mol·K)(295 K)]',
      calculation: 'n = 1.45 mol',
      steps: [
        'Spacecraft use lower cabin pressure (0.7 atm) for safety',
        'Astronauts adapt to this like being at 3000m altitude',
        'Use n = PV/RT to find moles of air',
        'Substitute: n = (0.7)(50.0)/(0.08206 × 295)',
        'Calculate: n = 1.45 mol of breathing gas'
      ]
    }
  },

  {
    id: 13,
    emoji: '🎿',
    scenario_is: 'Skíðasvæði á 2500m hæð. Loftþrýstingur er 0.74 atm. Á hvaða hitastigi er loftið?',
    scenario_en: 'Ski resort at 2500m altitude. Air pressure is 0.74 atm. What is the air temperature?',
    difficulty: 'Erfitt',
    gasLaw: 'ideal',
    given: {
      P: { value: 0.74, unit: 'atm' },
      V: { value: 10.0, unit: 'L' },
      n: { value: 0.35, unit: 'mol' }
    },
    find: 'T',
    answer: 258,
    tolerance: 5,
    hints: [
      'Mountain resorts have lower pressure and temperature',
      'Use T = PV/nR',
      'Substitute: T = (0.74)(10.0)/[(0.35)(0.08206)]',
      'Calculate: T = 258 K (about -15°C, perfect for skiing!)'
    ],
    solution: {
      formula: 'T = PV/nR',
      substitution: 'T = (0.74 atm)(10.0 L) / [(0.35 mol)(0.08206 L·atm/mol·K)]',
      calculation: 'T = 258 K',
      steps: [
        'At 2500m, pressure drops to about 74% of sea level',
        'Use PV = nRT, solve for T',
        'Substitute: T = (0.74)(10.0)/(0.35 × 0.08206)',
        'Calculate: T = 258 K',
        'Convert: 258 K - 273 = -15°C (typical ski resort temperature)'
      ]
    }
  }
];

/**
 * Get questions filtered by difficulty
 */
export function getQuestionsByDifficulty(difficulty: string): GasLawQuestion[] {
  return questions.filter(q => q.difficulty === difficulty);
}

/**
 * Get a random question
 */
export function getRandomQuestion(): GasLawQuestion {
  return questions[Math.floor(Math.random() * questions.length)];
}

/**
 * Get question by ID
 */
export function getQuestionById(id: number): GasLawQuestion | undefined {
  return questions.find(q => q.id === id);
}
