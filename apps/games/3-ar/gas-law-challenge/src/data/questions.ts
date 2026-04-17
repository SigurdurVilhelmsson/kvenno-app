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
    scenario_is:
      'Þú ert að blása upp blöðru fyrir afmælisveislu. Loftið í andanum þínum er um 37°C.',
    scenario_en:
      "You're blowing up a balloon for a birthday party. The air from your breath is about 37°C.",
    difficulty: 'Auðvelt',
    gasLaw: 'ideal',
    given: {
      P: { value: 1.0, unit: 'atm' },
      T: { value: 310, unit: 'K' },
      n: { value: 0.15, unit: 'mol' },
    },
    find: 'V',
    answer: 3.82,
    tolerance: 0.08,
    hints: [
      'Solve for V. Rearrange PV = nRT',
      'Use: V = nRT/P',
      'Substitute: V = (0.15)(0.08206)(310)/(1.0)',
      'Calculate: V = 3.82 L',
    ],
    solution: {
      formula: 'V = nRT/P',
      substitution: 'V = (0.15 mol)(0.08206 L·atm/mol·K)(310 K) / (1.0 atm)',
      calculation: 'V = 3.82 L',
      steps: [
        'Start with PV = nRT',
        'Rearrange to solve for V: V = nRT/P',
        'Substitute values: V = (0.15)(0.08206)(310)/(1.0)',
        'Calculate: V = 3.82 L',
      ],
    },
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
      T: { value: 288, unit: 'K' },
    },
    find: 'n',
    answer: 0.211,
    tolerance: 0.004,
    hints: [
      'Solve for n (moles). Rearrange PV = nRT',
      'Use: n = PV/RT',
      'Substitute: n = (2.5)(2.0)/[(0.08206)(288)]',
      'Calculate: n = 0.211 mol',
    ],
    solution: {
      formula: 'n = PV/RT',
      substitution: 'n = (2.5 atm)(2.0 L) / [(0.08206 L·atm/mol·K)(288 K)]',
      calculation: 'n = 0.211 mol',
      steps: [
        'Start with PV = nRT',
        'Rearrange to solve for n: n = PV/RT',
        'Substitute values: n = (2.5)(2.0)/(0.08206 × 288)',
        'Calculate: n = 0.211 mol',
      ],
    },
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
      n: { value: 0.3, unit: 'mol' },
    },
    find: 'P',
    answer: 3.67,
    tolerance: 0.07,
    hints: [
      'Solve for P (pressure). Rearrange PV = nRT',
      'Use: P = nRT/V',
      'Substitute: P = (0.30)(0.08206)(298)/(2.0)',
      'Calculate: P = 3.67 atm',
    ],
    solution: {
      formula: 'P = nRT/V',
      substitution: 'P = (0.30 mol)(0.08206 L·atm/mol·K)(298 K) / (2.0 L)',
      calculation: 'P = 3.67 atm',
      steps: [
        'Start with PV = nRT',
        'Rearrange to solve for P: P = nRT/V',
        'Substitute values: P = (0.30)(0.08206)(298)/(2.0)',
        'Calculate: P = 3.67 atm',
      ],
    },
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
      n: { value: 0.2, unit: 'mol' },
    },
    find: 'T',
    answer: 305,
    tolerance: 6,
    hints: [
      'Solve for T (temperature). Rearrange PV = nRT',
      'Use: T = PV/nR',
      'Substitute: T = (1.0)(5.0)/[(0.20)(0.08206)]',
      'Calculate: T = 305 K',
    ],
    solution: {
      formula: 'T = PV/nR',
      substitution: 'T = (1.0 atm)(5.0 L) / [(0.20 mol)(0.08206 L·atm/mol·K)]',
      calculation: 'T = 305 K',
      steps: [
        'Start with PV = nRT',
        'Rearrange to solve for T: T = PV/nR',
        'Substitute values: T = (1.0)(5.0)/(0.20 × 0.08206)',
        'Calculate: T = 305 K',
      ],
    },
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
      T: { value: 283, unit: 'K' },
    },
    find: 'n',
    answer: 1.03,
    tolerance: 0.02,
    hints: [
      'Solve for moles at depth. Use n = PV/RT',
      'Notice pressure is doubled at this depth',
      'Substitute: n = (2.0)(12.0)/[(0.08206)(283)]',
      'Calculate: n = 1.03 mol',
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
        'Calculate: n = 1.03 mol',
      ],
    },
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
      n: { value: 150, unit: 'mol' },
    },
    find: 'V',
    answer: 4924,
    tolerance: 98,
    hints: [
      'Large balloon needs large volume',
      'Use V = nRT/P with many moles',
      'Substitute: V = (150)(0.08206)(400)/(1.0)',
      'Calculate: V = 4924 L',
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
        'Calculate: V = 4924 L (≈ 4.9 m³)',
      ],
    },
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
      n: { value: 82.0, unit: 'mol' },
    },
    find: 'P',
    answer: 40.1,
    tolerance: 0.8,
    hints: [
      'High moles in small volume = high pressure',
      'Use P = nRT/V',
      'Substitute: P = (82.0)(0.08206)(298)/(50.0)',
      'Calculate: P = 40.1 atm',
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
        'Calculate: P = 40.1 atm (very high!)',
      ],
    },
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
      n: { value: 1.5, unit: 'mol' },
    },
    find: 'T',
    answer: 268,
    tolerance: 5,
    hints: [
      'Deep ocean = high pressure, cold temperature',
      'Use T = PV/nR',
      'Substitute: T = (11.0)(3.0)/[(1.5)(0.08206)]',
      'Calculate: T = 268 K',
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
        'Calculate: T = 268 K (≈ -5°C, cold!)',
      ],
    },
  },

  // ===== ATMOSPHERIC APPLICATIONS =====
  {
    id: 9,
    emoji: '🏔️',
    scenario_is:
      'Á toppi Everest (8849m) er loftþrýstingur aðeins 0.33 atm. Hversu mikið loft (mól) er í 5L lungum?',
    scenario_en:
      'At the summit of Everest (8849m), air pressure is only 0.33 atm. How much air (moles) is in 5L lungs?',
    difficulty: 'Miðlungs',
    gasLaw: 'ideal',
    given: {
      P: { value: 0.33, unit: 'atm' },
      V: { value: 5.0, unit: 'L' },
      T: { value: 243, unit: 'K' },
    },
    find: 'n',
    answer: 0.083,
    tolerance: 0.002,
    hints: [
      'High altitude = low pressure = less air per breath',
      'Use n = PV/RT',
      'Substitute: n = (0.33)(5.0)/[(0.08206)(243)]',
      'Calculate: n = 0.083 mol (only 1/3 of sea level!)',
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
        'Calculate: n = 0.083 mol (explains why climbers need oxygen!)',
      ],
    },
  },

  {
    id: 10,
    emoji: '✈️',
    scenario_is:
      'Farþegaflugvél flýgur á 10.000m hæð þar sem þrýstingur er 0.26 atm og hitastig -50°C.',
    scenario_en:
      'A passenger aircraft flies at 10,000m altitude where pressure is 0.26 atm and temperature is -50°C.',
    difficulty: 'Miðlungs',
    gasLaw: 'ideal',
    given: {
      P: { value: 0.26, unit: 'atm' },
      T: { value: 223, unit: 'K' },
      n: { value: 0.5, unit: 'mol' },
    },
    find: 'V',
    answer: 35.2,
    tolerance: 0.7,
    hints: [
      'Low pressure and temperature affect gas volume',
      'Use V = nRT/P',
      'Substitute: V = (0.50)(0.08206)(223)/(0.26)',
      'Calculate: V = 35.2 L',
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
        'Calculate: V = 35.2 L (this is why planes are pressurized!)',
      ],
    },
  },

  {
    id: 11,
    emoji: '🌡️',
    scenario_is:
      'Veðurspá: Lágþrýstingssvæði nálgast. Hvað gerist við loftþrýsting þegar hitastigið lækkar?',
    scenario_en:
      'Weather forecast: Low pressure system approaching. A weather balloon has 100 mol of gas.',
    difficulty: 'Miðlungs',
    gasLaw: 'ideal',
    given: {
      V: { value: 2500, unit: 'L' },
      T: { value: 288, unit: 'K' },
      n: { value: 100, unit: 'mol' },
    },
    find: 'P',
    answer: 0.946,
    tolerance: 0.019,
    hints: [
      'Weather balloons measure atmospheric conditions',
      'Use P = nRT/V',
      'Substitute: P = (100)(0.08206)(288)/(2500)',
      'Calculate: P = 0.946 atm (low pressure = stormy weather!)',
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
        'Calculate: P = 0.946 atm (below standard 1.0 atm = low pressure system)',
      ],
    },
  },

  {
    id: 12,
    emoji: '🚀',
    scenario_is:
      'Geimferð: Í geimskipi er þrýstingi haldið við 0.7 atm (eins og á 3000m hæð á jörðu).',
    scenario_en:
      'Space travel: A spacecraft cabin is maintained at 0.7 atm (like 3000m altitude on Earth).',
    difficulty: 'Erfitt',
    gasLaw: 'ideal',
    given: {
      P: { value: 0.7, unit: 'atm' },
      V: { value: 50.0, unit: 'L' },
      T: { value: 295, unit: 'K' },
    },
    find: 'n',
    answer: 1.45,
    tolerance: 0.03,
    hints: [
      'Spacecraft cabins use lower pressure to reduce stress on hull',
      'Use n = PV/RT',
      'Substitute: n = (0.7)(50.0)/[(0.08206)(295)]',
      'Calculate: n = 1.45 mol',
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
        'Calculate: n = 1.45 mol of breathing gas',
      ],
    },
  },

  {
    id: 13,
    emoji: '🎿',
    scenario_is: 'Skíðasvæði á 2500m hæð. Loftþrýstingur er 0.74 atm. Á hvaða hitastigi er loftið?',
    scenario_en:
      'Ski resort at 2500m altitude. Air pressure is 0.74 atm. What is the air temperature?',
    difficulty: 'Erfitt',
    gasLaw: 'ideal',
    given: {
      P: { value: 0.74, unit: 'atm' },
      V: { value: 10.0, unit: 'L' },
      n: { value: 0.35, unit: 'mol' },
    },
    find: 'T',
    answer: 258,
    tolerance: 5,
    hints: [
      'Mountain resorts have lower pressure and temperature',
      'Use T = PV/nR',
      'Substitute: T = (0.74)(10.0)/[(0.35)(0.08206)]',
      'Calculate: T = 258 K (about -15°C, perfect for skiing!)',
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
        'Convert: 258 K - 273 = -15°C (typical ski resort temperature)',
      ],
    },
  },

  // ===== BOYLE'S LAW (P₁V₁ = P₂V₂) =====
  {
    id: 14,
    emoji: '💉',
    scenario_is:
      'Sprauta í efnafræðistofu inniheldur 10.0 mL af gasi við 1.0 atm. Þú ýtir á stimpilinn þar til þrýstingur er 2.5 atm. Hvert er nýja rúmmálið?',
    scenario_en:
      'A syringe in the chemistry lab contains 10.0 mL of gas at 1.0 atm. You push the plunger until the pressure is 2.5 atm. What is the new volume?',
    difficulty: 'Auðvelt',
    gasLaw: 'boyles',
    given: {
      P: { value: 1.0, unit: 'atm' },
      V: { value: 10.0, unit: 'mL' },
    },
    find: 'V',
    answer: 4.0,
    tolerance: 0.08,
    hints: [
      'Þetta er lögmál Boyles: P₁V₁ = P₂V₂ (hitastig og mól eru föst)',
      'V₂ = P₁V₁ / P₂',
      'V₂ = (1.0 atm)(10.0 mL) / (2.5 atm)',
      'V₂ = 4.0 mL',
    ],
    solution: {
      formula: 'V₂ = P₁V₁ / P₂',
      substitution: 'V₂ = (1.0 atm)(10.0 mL) / (2.5 atm)',
      calculation: 'V₂ = 4.0 mL',
      steps: [
        'Lögmál Boyles: P₁V₁ = P₂V₂ (T og n eru föst)',
        'Einangra V₂: V₂ = P₁V₁ / P₂',
        'Setja inn gildi: V₂ = (1.0)(10.0) / 2.5',
        'atm·mL / atm → mL (atm styttist út)',
        'V₂ = 4.0 mL',
      ],
    },
  },

  {
    id: 15,
    emoji: '🛥️',
    scenario_is:
      'Kafbátur er á yfirborði sjávar þar sem þrýstingur er 1.0 atm og loftbólga hefur rúmmál 6.0 L. Kafbáturinn kafar og bólgan minnkar í 2.0 L. Hver er þrýstingurinn á þessu dýpi?',
    scenario_en:
      'A submarine is at the sea surface where pressure is 1.0 atm and an air bubble has a volume of 6.0 L. The submarine dives and the bubble shrinks to 2.0 L. What is the pressure at this depth?',
    difficulty: 'Miðlungs',
    gasLaw: 'boyles',
    given: {
      P: { value: 1.0, unit: 'atm' },
      V: { value: 6.0, unit: 'L' },
    },
    find: 'P',
    answer: 3.0,
    tolerance: 0.06,
    hints: [
      'Lögmál Boyles gildir: P₁V₁ = P₂V₂',
      'P₂ = P₁V₁ / V₂ þar sem V₂ = 2.0 L',
      'P₂ = (1.0)(6.0) / 2.0',
      'P₂ = 3.0 atm',
    ],
    solution: {
      formula: 'P₂ = P₁V₁ / V₂',
      substitution: 'P₂ = (1.0 atm)(6.0 L) / (2.0 L)',
      calculation: 'P₂ = 3.0 atm',
      steps: [
        'Lögmál Boyles: P₁V₁ = P₂V₂',
        'Einangra P₂: P₂ = P₁V₁ / V₂',
        'V₂ = 2.0 L (gefið í verkefninu)',
        'Setja inn: P₂ = (1.0)(6.0) / 2.0',
        'atm·L / L → atm (L styttist út)',
        'P₂ = 3.0 atm',
      ],
    },
  },

  // ===== CHARLES'S LAW (V₁/T₁ = V₂/T₂) =====
  {
    id: 16,
    emoji: '🎈',
    scenario_is:
      'Loftbelgur hefur rúmmál 3.0 L við 300 K. Hann er hitaður upp í 450 K við fast þrýsðing. Hvert er nýja rúmmálið?',
    scenario_en:
      'A balloon has a volume of 3.0 L at 300 K. It is heated to 450 K at constant pressure. What is the new volume?',
    difficulty: 'Auðvelt',
    gasLaw: 'charles',
    given: {
      V: { value: 3.0, unit: 'L' },
      T: { value: 300, unit: 'K' },
    },
    find: 'V',
    answer: 4.5,
    tolerance: 0.09,
    hints: [
      'Lögmál Charles: V₁/T₁ = V₂/T₂ (þrýstingur og mól eru föst)',
      'V₂ = V₁ × T₂/T₁ þar sem T₂ = 450 K',
      'V₂ = 3.0 × 450/300',
      'V₂ = 4.5 L',
    ],
    solution: {
      formula: 'V₂ = V₁ × T₂ / T₁',
      substitution: 'V₂ = (3.0 L)(450 K) / (300 K)',
      calculation: 'V₂ = 4.5 L',
      steps: [
        'Lögmál Charles: V₁/T₁ = V₂/T₂ (P og n föst)',
        'Einangra V₂: V₂ = V₁ × T₂/T₁',
        'T₂ = 450 K (gefið í verkefninu)',
        'Setja inn: V₂ = 3.0 × 450/300',
        'L·K / K → L (K styttist út)',
        'V₂ = 4.5 L',
      ],
    },
  },

  {
    id: 17,
    emoji: '🚗',
    scenario_is:
      'Hjólbarði bíls hefur rúmmál 8.0 L við 293 K (20°C). Eftir akstur er rúmmálið orðið 8.8 L við fast þrýsðing. Hvert er nýja hitastigið?',
    scenario_en:
      'A car tire has a volume of 8.0 L at 293 K (20°C). After driving, the volume has increased to 8.8 L at constant pressure. What is the new temperature?',
    difficulty: 'Miðlungs',
    gasLaw: 'charles',
    given: {
      V: { value: 8.0, unit: 'L' },
      T: { value: 293, unit: 'K' },
    },
    find: 'T',
    answer: 322.3,
    tolerance: 6.4,
    hints: [
      'Lögmál Charles: V₁/T₁ = V₂/T₂',
      'T₂ = T₁ × V₂/V₁ þar sem V₂ = 8.8 L',
      'T₂ = 293 × 8.8/8.0',
      'T₂ = 322.3 K (≈ 49°C)',
    ],
    solution: {
      formula: 'T₂ = T₁ × V₂ / V₁',
      substitution: 'T₂ = (293 K)(8.8 L) / (8.0 L)',
      calculation: 'T₂ = 322.3 K',
      steps: [
        'Lögmál Charles: V₁/T₁ = V₂/T₂',
        'Einangra T₂: T₂ = T₁ × V₂/V₁',
        'V₂ = 8.8 L (gefið í verkefninu)',
        'Setja inn: T₂ = 293 × 8.8/8.0',
        'K·L / L → K (L styttist út)',
        'T₂ = 322.3 K (≈ 49°C — heitur hjólbarði!)',
      ],
    },
  },

  // ===== GAY-LUSSAC'S LAW (P₁/T₁ = P₂/T₂) =====
  {
    id: 18,
    emoji: '🔥',
    scenario_is:
      'Þrýstihylki í efnafræðistofu hefur þrýsting 2.0 atm við 300 K. Það er hitað upp í 450 K. Rúmmálið er fast. Hver er nýi þrýstingurinn?',
    scenario_en:
      'A pressure vessel in the chemistry lab has a pressure of 2.0 atm at 300 K. It is heated to 450 K. The volume is fixed. What is the new pressure?',
    difficulty: 'Auðvelt',
    gasLaw: 'gay-lussac',
    given: {
      P: { value: 2.0, unit: 'atm' },
      T: { value: 300, unit: 'K' },
    },
    find: 'P',
    answer: 3.0,
    tolerance: 0.06,
    hints: [
      'Lögmál Gay-Lussac: P₁/T₁ = P₂/T₂ (rúmmál og mól eru föst)',
      'P₂ = P₁ × T₂/T₁ þar sem T₂ = 450 K',
      'P₂ = 2.0 × 450/300',
      'P₂ = 3.0 atm',
    ],
    solution: {
      formula: 'P₂ = P₁ × T₂ / T₁',
      substitution: 'P₂ = (2.0 atm)(450 K) / (300 K)',
      calculation: 'P₂ = 3.0 atm',
      steps: [
        'Lögmál Gay-Lussac: P₁/T₁ = P₂/T₂ (V og n föst)',
        'Einangra P₂: P₂ = P₁ × T₂/T₁',
        'T₂ = 450 K (gefið í verkefninu)',
        'Setja inn: P₂ = 2.0 × 450/300',
        'atm·K / K → atm (K styttist út)',
        'P₂ = 3.0 atm',
      ],
    },
  },

  {
    id: 19,
    emoji: '🚙',
    scenario_is:
      'Bíldekk hefur þrýsting 2.2 atm við 288 K (15°C). Eftir akstur á sólríkum degi hækkar þrýstingurinn í 2.5 atm. Rúmmálið er fast. Hvert er nýja hitastigið?',
    scenario_en:
      'A car tire has a pressure of 2.2 atm at 288 K (15°C). After driving on a sunny day, the pressure rises to 2.5 atm. The volume is fixed. What is the new temperature?',
    difficulty: 'Miðlungs',
    gasLaw: 'gay-lussac',
    given: {
      P: { value: 2.2, unit: 'atm' },
      T: { value: 288, unit: 'K' },
    },
    find: 'T',
    answer: 327.3,
    tolerance: 6.5,
    hints: [
      'Lögmál Gay-Lussac: P₁/T₁ = P₂/T₂',
      'T₂ = T₁ × P₂/P₁ þar sem P₂ = 2.5 atm',
      'T₂ = 288 × 2.5/2.2',
      'T₂ = 327.3 K (≈ 54°C)',
    ],
    solution: {
      formula: 'T₂ = T₁ × P₂ / P₁',
      substitution: 'T₂ = (288 K)(2.5 atm) / (2.2 atm)',
      calculation: 'T₂ = 327.3 K',
      steps: [
        'Lögmál Gay-Lussac: P₁/T₁ = P₂/T₂',
        'Einangra T₂: T₂ = T₁ × P₂/P₁',
        'P₂ = 2.5 atm (gefið í verkefninu)',
        'Setja inn: T₂ = 288 × 2.5/2.2',
        'K·atm / atm → K (atm styttist út)',
        'T₂ = 327.3 K (≈ 54°C — heitt dekk!)',
      ],
    },
  },

  // ===== COMBINED GAS LAW (P₁V₁/T₁ = P₂V₂/T₂) =====
  {
    id: 20,
    emoji: '🎈',
    scenario_is:
      'Veðurblöðra er fyllt á jörðu: P₁=1.0 atm, V₁=5.0 L, T₁=293 K. Hún rís þar sem P₂=0.5 atm og T₂=253 K. Hvert er nýja rúmmálið?',
    scenario_en:
      'A weather balloon is filled at ground level: P₁=1.0 atm, V₁=5.0 L, T₁=293 K. It rises to where P₂=0.5 atm and T₂=253 K. What is the new volume?',
    difficulty: 'Miðlungs',
    gasLaw: 'combined',
    given: {
      P: { value: 1.0, unit: 'atm' },
      V: { value: 5.0, unit: 'L' },
      T: { value: 293, unit: 'K' },
    },
    find: 'V',
    answer: 8.63,
    tolerance: 0.17,
    hints: [
      'Sameinuð gaslögmál: P₁V₁/T₁ = P₂V₂/T₂ (n er fast)',
      'V₂ = V₁ × (P₁/P₂) × (T₂/T₁) þar sem P₂=0.5 atm, T₂=253 K',
      'V₂ = 5.0 × (1.0/0.5) × (253/293)',
      'V₂ = 5.0 × 2.0 × 0.8635 = 8.63 L',
    ],
    solution: {
      formula: 'V₂ = V₁ × (P₁/P₂) × (T₂/T₁)',
      substitution: 'V₂ = (5.0 L)(1.0 atm / 0.5 atm)(253 K / 293 K)',
      calculation: 'V₂ = 8.63 L',
      steps: [
        'Sameinuð gaslögmál: P₁V₁/T₁ = P₂V₂/T₂',
        'Einangra V₂: V₂ = V₁ × (P₁/P₂) × (T₂/T₁)',
        'P₂ = 0.5 atm og T₂ = 253 K (gefin í verkefninu)',
        'Setja inn: V₂ = 5.0 × (1.0/0.5) × (253/293)',
        'L × (atm/atm) × (K/K) → L (einingar styttast út)',
        'V₂ = 5.0 × 2.0 × 0.8635 = 8.63 L',
      ],
    },
  },

  {
    id: 21,
    emoji: '🏭',
    scenario_is:
      'Gasílát í verksmiðju: P₁=3.0 atm, V₁=10.0 L, T₁=300 K. Gasið er þjappað í P₂=6.0 atm og V₂=6.0 L. Hvert er nýja hitastigið?',
    scenario_en:
      'A gas container in a factory: P₁=3.0 atm, V₁=10.0 L, T₁=300 K. The gas is compressed to P₂=6.0 atm and V₂=6.0 L. What is the new temperature?',
    difficulty: 'Erfitt',
    gasLaw: 'combined',
    given: {
      P: { value: 3.0, unit: 'atm' },
      V: { value: 10.0, unit: 'L' },
      T: { value: 300, unit: 'K' },
    },
    find: 'T',
    answer: 360,
    tolerance: 7,
    hints: [
      'Sameinuð gaslögmál: P₁V₁/T₁ = P₂V₂/T₂',
      'T₂ = T₁ × (P₂/P₁) × (V₂/V₁) þar sem P₂=6.0 atm, V₂=6.0 L',
      'T₂ = 300 × (6.0/3.0) × (6.0/10.0)',
      'T₂ = 300 × 2.0 × 0.6 = 360 K',
    ],
    solution: {
      formula: 'T₂ = T₁ × (P₂/P₁) × (V₂/V₁)',
      substitution: 'T₂ = (300 K)(6.0 atm / 3.0 atm)(6.0 L / 10.0 L)',
      calculation: 'T₂ = 360 K',
      steps: [
        'Sameinuð gaslögmál: P₁V₁/T₁ = P₂V₂/T₂',
        'Einangra T₂: T₂ = T₁ × (P₂/P₁) × (V₂/V₁)',
        'P₂ = 6.0 atm og V₂ = 6.0 L (gefin í verkefninu)',
        'Setja inn: T₂ = 300 × (6.0/3.0) × (6.0/10.0)',
        'K × (atm/atm) × (L/L) → K (einingar styttast út)',
        'T₂ = 300 × 2.0 × 0.6 = 360 K (≈ 87°C)',
      ],
    },
  },

  // ===== AVOGADRO'S LAW (V₁/n₁ = V₂/n₂) =====
  {
    id: 22,
    emoji: '🎈',
    scenario_is:
      'Loftbelgur inniheldur 2.0 L af gasi og 0.10 mól af lofti. Þú blæsir meira loft inn þar til mólfjöldinn er 0.30 mól. Þrýstingur og hitastig eru föst. Hvert er nýja rúmmálið?',
    scenario_en:
      'A balloon contains 2.0 L of gas with 0.10 mol of air. You blow in more air until the amount is 0.30 mol. Pressure and temperature are constant. What is the new volume?',
    difficulty: 'Auðvelt',
    gasLaw: 'avogadro',
    given: {
      V: { value: 2.0, unit: 'L' },
      n: { value: 0.1, unit: 'mol' },
    },
    find: 'V',
    answer: 6.0,
    tolerance: 0.12,
    hints: [
      'Lögmál Avogadros: V₁/n₁ = V₂/n₂ (þrýstingur og hitastig eru föst)',
      'V₂ = V₁ × n₂/n₁ þar sem n₂ = 0.30 mol',
      'V₂ = 2.0 × 0.30/0.10',
      'V₂ = 6.0 L',
    ],
    solution: {
      formula: 'V₂ = V₁ × n₂ / n₁',
      substitution: 'V₂ = (2.0 L)(0.30 mol) / (0.10 mol)',
      calculation: 'V₂ = 6.0 L',
      steps: [
        'Lögmál Avogadros: V₁/n₁ = V₂/n₂ (P og T föst)',
        'Einangra V₂: V₂ = V₁ × n₂/n₁',
        'n₂ = 0.30 mol (gefið í verkefninu)',
        'Setja inn: V₂ = 2.0 × 0.30/0.10',
        'L·mol / mol → L (mol styttist út)',
        'V₂ = 6.0 L (þrisvar meira gas = þrisvar meira rúmmál)',
      ],
    },
  },

  {
    id: 23,
    emoji: '⚗️',
    scenario_is:
      'Gashylki inniheldur 5.0 L af gasi og 0.20 mól. Gasið þenst út í 12.5 L við fast þrýsðing og hitastig. Hversu mörg mól eru núna?',
    scenario_en:
      'A gas container holds 5.0 L of gas with 0.20 mol. The gas expands to 12.5 L at constant pressure and temperature. How many moles are there now?',
    difficulty: 'Miðlungs',
    gasLaw: 'avogadro',
    given: {
      V: { value: 5.0, unit: 'L' },
      n: { value: 0.2, unit: 'mol' },
    },
    find: 'n',
    answer: 0.5,
    tolerance: 0.01,
    hints: [
      'Lögmál Avogadros: V₁/n₁ = V₂/n₂',
      'n₂ = n₁ × V₂/V₁ þar sem V₂ = 12.5 L',
      'n₂ = 0.20 × 12.5/5.0',
      'n₂ = 0.50 mol',
    ],
    solution: {
      formula: 'n₂ = n₁ × V₂ / V₁',
      substitution: 'n₂ = (0.20 mol)(12.5 L) / (5.0 L)',
      calculation: 'n₂ = 0.50 mol',
      steps: [
        'Lögmál Avogadros: V₁/n₁ = V₂/n₂',
        'Einangra n₂: n₂ = n₁ × V₂/V₁',
        'V₂ = 12.5 L (gefið í verkefninu)',
        'Setja inn: n₂ = 0.20 × 12.5/5.0',
        'mol·L / L → mol (L styttist út)',
        'n₂ = 0.50 mol (2.5× meira rúmmál = 2.5× fleiri mól)',
      ],
    },
  },
];

/**
 * Get questions filtered by difficulty
 */
export function getQuestionsByDifficulty(difficulty: string): GasLawQuestion[] {
  return questions.filter((q) => q.difficulty === difficulty);
}

/**
 * Get a random question
 */
export function getRandomQuestion(): GasLawQuestion {
  return questions[Math.floor(Math.random() * questions.length)];
}

/**
 * Gas-law curriculum level (introduced in iter 5 P3 restructure).
 *
 * Level 1: Ideal gas law only — students learn PV=nRT as the central relationship.
 * Level 2: Boyle/Charles/Gay-Lussac — simplifications of the ideal law when one or more
 *          variables are held constant.
 * Level 3: Combined gas law + Avogadro — recognising that conservation of moles / constant
 *          conditions turn PV=nRT into the combined form, and that equal volumes of any gas
 *          at the same T and P contain equal moles.
 */
export type Level = 1 | 2 | 3;

const LEVEL_LAWS: Record<Level, GasLawQuestion['gasLaw'][]> = {
  1: ['ideal'],
  2: ['boyles', 'charles', 'gay-lussac'],
  3: ['combined', 'avogadro'],
};

/**
 * Return all questions for a given curriculum level.
 */
export function getQuestionsForLevel(level: Level): GasLawQuestion[] {
  const laws = LEVEL_LAWS[level];
  return questions.filter((q) => laws.includes(q.gasLaw));
}

/**
 * Return a random question filtered to the given level.
 */
export function getRandomQuestionForLevel(level: Level): GasLawQuestion {
  const pool = getQuestionsForLevel(level);
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get question by ID
 */
export function getQuestionById(id: number): GasLawQuestion | undefined {
  return questions.find((q) => q.id === id);
}
