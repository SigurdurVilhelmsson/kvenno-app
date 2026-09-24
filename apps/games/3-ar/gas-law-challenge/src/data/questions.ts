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
    difficulty: 'Auðvelt',
    gasLaw: 'ideal',
    given: {
      P: { value: 1.0, unit: 'atm' },
      T: { value: 310, unit: 'K' },
      n: { value: 0.15, unit: 'mól' },
    },
    find: 'V',
    answer: 3.82,
    tolerance: 0.08,
    hints: [
      'Finndu V. Einangraðu V í PV = nRT',
      'Notaðu: V = nRT/P',
      'Settu inn: V = (0,15)(0,08206)(310)/(1,0)',
      'Reiknaðu: V = 3,82 L',
    ],
    solution: {
      formula: 'V = nRT/P',
      substitution: 'V = (0,15 mól)(0,08206 L·atm/mól·K)(310 K) / (1,0 atm)',
      calculation: 'V = 3,82 L',
      steps: [
        'Byrja á PV = nRT',
        'Einangra V: V = nRT/P',
        'Setja inn gildi: V = (0,15)(0,08206)(310)/(1,0)',
        'Reikna: V = 3,82 L',
      ],
    },
  },

  {
    id: 2,
    emoji: '🚴',
    scenario_is: 'Þú ert að athuga loftþrýsting í hjólbarða reiðhjólsins þíns að morgni.',
    difficulty: 'Auðvelt',
    gasLaw: 'ideal',
    given: {
      P: { value: 2.5, unit: 'atm' },
      V: { value: 2.0, unit: 'L' },
      T: { value: 288, unit: 'K' },
    },
    find: 'n',
    answer: 0.212,
    tolerance: 0.004,
    hints: [
      'Finndu n (fjölda móla). Einangraðu n í PV = nRT',
      'Notaðu: n = PV/RT',
      'Settu inn: n = (2,5)(2,0)/[(0,08206)(288)]',
      'Reiknaðu: n = 0,212 mól',
    ],
    solution: {
      formula: 'n = PV/RT',
      substitution: 'n = (2,5 atm)(2,0 L) / [(0,08206 L·atm/mól·K)(288 K)]',
      calculation: 'n = 0,212 mól',
      steps: [
        'Byrja á PV = nRT',
        'Einangra n: n = PV/RT',
        'Setja inn gildi: n = (2,5)(2,0)/(0,08206 × 288)',
        'Reikna: n = 0,212 mól',
      ],
    },
  },

  {
    id: 3,
    emoji: '🥤',
    scenario_is: 'Kólaflaska inniheldur koldíoxíð undir þrýstingi.',
    difficulty: 'Auðvelt',
    gasLaw: 'ideal',
    given: {
      V: { value: 2.0, unit: 'L' },
      T: { value: 298, unit: 'K' },
      n: { value: 0.3, unit: 'mól' },
    },
    find: 'P',
    answer: 3.67,
    tolerance: 0.07,
    hints: [
      'Finndu P (þrýsting). Einangraðu P í PV = nRT',
      'Notaðu: P = nRT/V',
      'Settu inn: P = (0,30)(0,08206)(298)/(2,0)',
      'Reiknaðu: P = 3,67 atm',
    ],
    solution: {
      formula: 'P = nRT/V',
      substitution: 'P = (0,30 mól)(0,08206 L·atm/mól·K)(298 K) / (2,0 L)',
      calculation: 'P = 3,67 atm',
      steps: [
        'Byrja á PV = nRT',
        'Einangra P: P = nRT/V',
        'Setja inn gildi: P = (0,30)(0,08206)(298)/(2,0)',
        'Reikna: P = 3,67 atm',
      ],
    },
  },

  {
    id: 4,
    emoji: '🧪',
    scenario_is: 'Í efnafræðistofu ertu að vinna með gassýni.',
    difficulty: 'Auðvelt',
    gasLaw: 'ideal',
    given: {
      P: { value: 1.0, unit: 'atm' },
      V: { value: 5.0, unit: 'L' },
      n: { value: 0.2, unit: 'mól' },
    },
    find: 'T',
    answer: 305,
    tolerance: 6,
    hints: [
      'Finndu T (hitastig). Einangraðu T í PV = nRT',
      'Notaðu: T = PV/nR',
      'Settu inn: T = (1,0)(5,0)/[(0,20)(0,08206)]',
      'Reiknaðu: T = 305 K',
    ],
    solution: {
      formula: 'T = PV/nR',
      substitution: 'T = (1,0 atm)(5,0 L) / [(0,20 mól)(0,08206 L·atm/mól·K)]',
      calculation: 'T = 305 K',
      steps: [
        'Byrja á PV = nRT',
        'Einangra T: T = PV/nR',
        'Setja inn gildi: T = (1,0)(5,0)/(0,20 × 0,08206)',
        'Reikna: T = 305 K',
      ],
    },
  },

  // ===== MEDIUM LEVEL (6 Questions) =====
  {
    id: 5,
    emoji: '🤿',
    scenario_is: 'Köfunarílát við 10m dýpi þar sem þrýstingur er 2,0 atm.',
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
      'Finndu fjölda móla á þessu dýpi. Notaðu n = PV/RT',
      'Taktu eftir að þrýstingurinn er tvöfaldur á þessu dýpi',
      'Settu inn: n = (2,0)(12,0)/[(0,08206)(283)]',
      'Reiknaðu: n = 1,03 mól',
    ],
    solution: {
      formula: 'n = PV/RT',
      substitution: 'n = (2,0 atm)(12,0 L) / [(0,08206 L·atm/mól·K)(283 K)]',
      calculation: 'n = 1,03 mól',
      steps: [
        'Á 10 m dýpi er þrýstingurinn 2,0 atm',
        'Byrja á PV = nRT',
        'Einangra n: n = PV/RT',
        'Setja inn gildi: n = (2,0)(12,0)/(0,08206 × 283)',
        'Reikna: n = 1,03 mól',
      ],
    },
  },

  {
    id: 6,
    emoji: '🎈',
    scenario_is: 'Loftbelgur er hitaður upp úr 300K í 400K við fastan þrýsting.',
    difficulty: 'Miðlungs',
    gasLaw: 'ideal',
    given: {
      P: { value: 1.0, unit: 'atm' },
      T: { value: 400, unit: 'K' },
      n: { value: 150, unit: 'mól' },
    },
    find: 'V',
    answer: 4924,
    tolerance: 98,
    hints: [
      'Stór loftbelgur þarf mikið rúmmál',
      'Notaðu V = nRT/P með mörgum mólum',
      'Settu inn: V = (150)(0,08206)(400)/(1,0)',
      'Reiknaðu: V = 4924 L',
    ],
    solution: {
      formula: 'V = nRT/P',
      substitution: 'V = (150 mól)(0,08206 L·atm/mól·K)(400 K) / (1,0 atm)',
      calculation: 'V = 4924 L',
      steps: [
        'Loftbelgur með heitu lofti, við hátt hitastig',
        'Nota kjörgaslögmálið: PV = nRT',
        'Einangra V: V = nRT/P',
        'Setja inn gildi: V = (150)(0,08206)(400)/(1,0)',
        'Reikna: V = 4924 L (≈ 4,9 m³)',
      ],
    },
  },

  // ===== HARD LEVEL (4 Questions) =====
  {
    id: 7,
    emoji: '🏭',
    scenario_is: 'Iðnaðargastankur með mjög háum þrýstingi.',
    difficulty: 'Erfitt',
    gasLaw: 'ideal',
    given: {
      V: { value: 50.0, unit: 'L' },
      T: { value: 298, unit: 'K' },
      n: { value: 82.0, unit: 'mól' },
    },
    find: 'P',
    answer: 40.1,
    tolerance: 0.8,
    hints: [
      'Mörg mól í litlu rúmmáli = hár þrýstingur',
      'Notaðu P = nRT/V',
      'Settu inn: P = (82,0)(0,08206)(298)/(50,0)',
      'Reiknaðu: P = 40,1 atm',
    ],
    solution: {
      formula: 'P = nRT/V',
      substitution: 'P = (82,0 mól)(0,08206 L·atm/mól·K)(298 K) / (50,0 L)',
      calculation: 'P = 40,1 atm',
      steps: [
        'Gaskútur í iðnaði er undir miklum þrýstingi',
        'Byrja á PV = nRT',
        'Einangra P: P = nRT/V',
        'Setja inn gildi: P = (82,0)(0,08206)(298)/(50,0)',
        'Reikna: P = 40,1 atm (mjög hár!)',
      ],
    },
  },

  {
    id: 8,
    emoji: '🌊',
    scenario_is: 'Djúpköfun á 100m dýpi þar sem þrýstingur er 11 atm.',
    difficulty: 'Erfitt',
    gasLaw: 'ideal',
    given: {
      P: { value: 11.0, unit: 'atm' },
      V: { value: 3.0, unit: 'L' },
      n: { value: 1.5, unit: 'mól' },
    },
    find: 'T',
    answer: 268,
    tolerance: 5,
    hints: [
      'Djúpt í hafinu = hár þrýstingur og kalt',
      'Notaðu T = PV/nR',
      'Settu inn: T = (11,0)(3,0)/[(1,5)(0,08206)]',
      'Reiknaðu: T = 268 K',
    ],
    solution: {
      formula: 'T = PV/nR',
      substitution: 'T = (11,0 atm)(3,0 L) / [(1,5 mól)(0,08206 L·atm/mól·K)]',
      calculation: 'T = 268 K',
      steps: [
        'Á 100 m dýpi er þrýstingurinn mjög hár (11 atm)',
        'Byrja á PV = nRT',
        'Einangra T: T = PV/nR',
        'Setja inn gildi: T = (11,0)(3,0)/(1,5 × 0,08206)',
        'Reikna: T = 268 K (≈ −5 °C, kalt!)',
      ],
    },
  },

  // ===== ATMOSPHERIC APPLICATIONS =====
  {
    id: 9,
    emoji: '🏔️',
    scenario_is:
      'Á toppi Everest (8849m) er loftþrýstingur aðeins 0,33 atm. Hversu mikið loft (mól) er í 5L lungum?',
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
      'Mikil hæð = lágur þrýstingur = minna loft í hverjum andardrætti',
      'Notaðu n = PV/RT',
      'Settu inn: n = (0,33)(5,0)/[(0,08206)(243)]',
      'Reiknaðu: n = 0,083 mól (aðeins þriðjungur af því sem er við sjávarmál!)',
    ],
    solution: {
      formula: 'n = PV/RT',
      substitution: 'n = (0,33 atm)(5,0 L) / [(0,08206 L·atm/mól·K)(243 K)]',
      calculation: 'n = 0,083 mól',
      steps: [
        'Í 8849 m hæð er loftþrýstingurinn aðeins 33 % af þrýstingnum við sjávarmál',
        'Hitastig á tindinum: um −30 °C = 243 K',
        'Einangra n í PV = nRT: n = PV/RT',
        'Setja inn gildi: n = (0,33)(5,0)/(0,08206 × 243)',
        'Reikna: n = 0,083 mól (þess vegna þurfa fjallgöngumenn súrefni!)',
      ],
    },
  },

  {
    id: 10,
    emoji: '✈️',
    scenario_is:
      'Farþegaflugvél flýgur á 10 km hæð þar sem þrýstingur er 0,26 atm og hitastig -50°C.',
    difficulty: 'Miðlungs',
    gasLaw: 'ideal',
    given: {
      P: { value: 0.26, unit: 'atm' },
      T: { value: 223, unit: 'K' },
      n: { value: 0.5, unit: 'mól' },
    },
    find: 'V',
    answer: 35.2,
    tolerance: 0.7,
    hints: [
      'Lágur þrýstingur og lágt hitastig hafa áhrif á rúmmál gass',
      'Notaðu V = nRT/P',
      'Settu inn: V = (0,50)(0,08206)(223)/(0,26)',
      'Reiknaðu: V = 35,2 L',
    ],
    solution: {
      formula: 'V = nRT/P',
      substitution: 'V = (0,50 mól)(0,08206 L·atm/mól·K)(223 K) / (0,26 atm)',
      calculation: 'V = 35,2 L',
      steps: [
        'Í farflugshæð (10 km) er þrýstingurinn mjög lágur',
        'Hitastig: −50 °C = 223 K',
        'Nota PV = nRT og einangra V',
        'Setja inn gildi: V = (0,50)(0,08206)(223)/(0,26)',
        'Reikna: V = 35,2 L (þess vegna er þrýstingi haldið uppi í farþegarými flugvéla!)',
      ],
    },
  },

  {
    id: 11,
    emoji: '🌡️',
    scenario_is: 'Veðurspá: Lágþrýstingssvæði nálgast.',
    difficulty: 'Miðlungs',
    gasLaw: 'ideal',
    given: {
      V: { value: 2500, unit: 'L' },
      T: { value: 288, unit: 'K' },
      n: { value: 100, unit: 'mól' },
    },
    find: 'P',
    answer: 0.945,
    tolerance: 0.019,
    hints: [
      'Veðurbelgir mæla ástand lofthjúpsins',
      'Notaðu P = nRT/V',
      'Settu inn: P = (100)(0,08206)(288)/(2500)',
      'Reiknaðu: P = 0,945 atm (lágur þrýstingur = óveður!)',
    ],
    solution: {
      formula: 'P = nRT/V',
      substitution: 'P = (100 mól)(0,08206 L·atm/mól·K)(288 K) / (2500 L)',
      calculation: 'P = 0,945 atm',
      steps: [
        'Veðurbelgur ber mælitæki upp í lofthjúpinn',
        'Lægðum fylgja oft ský og rigning',
        'Nota PV = nRT og einangra P',
        'Setja inn gildi: P = (100)(0,08206)(288)/(2500)',
        'Reikna: P = 0,945 atm (undir staðalþrýstingnum 1,0 atm = lægð)',
      ],
    },
  },

  {
    id: 12,
    emoji: '🚀',
    scenario_is:
      'Geimferð: Í geimskipi er þrýstingi haldið við 0,7 atm (eins og á 3000m hæð á jörðu).',
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
      'Í geimförum er þrýstingurinn í farþegarýminu hafður lægri til að minnka álag á skrokkinn',
      'Notaðu n = PV/RT',
      'Settu inn: n = (0,7)(50,0)/[(0,08206)(295)]',
      'Reiknaðu: n = 1,45 mól',
    ],
    solution: {
      formula: 'n = PV/RT',
      substitution: 'n = (0,7 atm)(50,0 L) / [(0,08206 L·atm/mól·K)(295 K)]',
      calculation: 'n = 1,45 mól',
      steps: [
        'Í geimförum er þrýstingurinn í farþegarýminu lægri (0,7 atm) af öryggisástæðum',
        'Geimfarar venjast honum eins og þeir væru í 3000 m hæð',
        'Nota n = PV/RT til að finna fjölda móla af lofti',
        'Setja inn gildi: n = (0,7)(50,0)/(0,08206 × 295)',
        'Reikna: n = 1,45 mól af öndunarlofti',
      ],
    },
  },

  {
    id: 13,
    emoji: '🎿',
    scenario_is: 'Skíðasvæði á 2500m hæð. Loftþrýstingur er 0,74 atm. Á hvaða hitastigi er loftið?',
    difficulty: 'Erfitt',
    gasLaw: 'ideal',
    given: {
      P: { value: 0.74, unit: 'atm' },
      V: { value: 10.0, unit: 'L' },
      n: { value: 0.35, unit: 'mól' },
    },
    find: 'T',
    answer: 258,
    tolerance: 5,
    hints: [
      'Á skíðasvæðum til fjalla eru þrýstingur og hitastig lægri',
      'Notaðu T = PV/nR',
      'Settu inn: T = (0,74)(10,0)/[(0,35)(0,08206)]',
      'Reiknaðu: T = 258 K (um −15 °C, fullkomið skíðaveður!)',
    ],
    solution: {
      formula: 'T = PV/nR',
      substitution: 'T = (0,74 atm)(10,0 L) / [(0,35 mól)(0,08206 L·atm/mól·K)]',
      calculation: 'T = 258 K',
      steps: [
        'Í 2500 m hæð fellur þrýstingurinn niður í um 74 % af þrýstingnum við sjávarmál',
        'Nota PV = nRT og einangra T',
        'Setja inn gildi: T = (0,74)(10,0)/(0,35 × 0,08206)',
        'Reikna: T = 258 K',
        'Umreikna: 258 K − 273 = −15 °C (dæmigert hitastig á skíðasvæði)',
      ],
    },
  },

  // ===== BOYLE'S LAW (P₁V₁ = P₂V₂) =====
  {
    id: 14,
    emoji: '💉',
    scenario_is:
      'Sprauta í efnafræðistofu inniheldur 10,0 mL af gasi við 1,0 atm. Þú ýtir á stimpilinn þar til þrýstingur er 2,5 atm. Hvert er nýja rúmmálið?',
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
      'V₂ = (1,0 atm)(10,0 mL) / (2,5 atm)',
      'V₂ = 4,0 mL',
    ],
    solution: {
      formula: 'V₂ = P₁V₁ / P₂',
      substitution: 'V₂ = (1,0 atm)(10,0 mL) / (2,5 atm)',
      calculation: 'V₂ = 4,0 mL',
      steps: [
        'Lögmál Boyles: P₁V₁ = P₂V₂ (T og n eru föst)',
        'Einangra V₂: V₂ = P₁V₁ / P₂',
        'Setja inn gildi: V₂ = (1,0)(10,0) / 2,5',
        'atm·mL / atm → mL (atm styttist út)',
        'V₂ = 4,0 mL',
      ],
    },
  },

  {
    id: 15,
    emoji: '🛥️',
    scenario_is:
      'Kafbátur er á yfirborði sjávar þar sem þrýstingur er 1,0 atm og loftbóla hefur rúmmál 6,0 L. Kafbáturinn kafar og bólan minnkar í 2,0 L. Hver er þrýstingurinn á þessu dýpi?',
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
      'P₂ = P₁V₁ / V₂ þar sem V₂ = 2,0 L',
      'P₂ = (1,0)(6,0) / 2,0',
      'P₂ = 3,0 atm',
    ],
    solution: {
      formula: 'P₂ = P₁V₁ / V₂',
      substitution: 'P₂ = (1,0 atm)(6,0 L) / (2,0 L)',
      calculation: 'P₂ = 3,0 atm',
      steps: [
        'Lögmál Boyles: P₁V₁ = P₂V₂',
        'Einangra P₂: P₂ = P₁V₁ / V₂',
        'V₂ = 2,0 L (gefið í verkefninu)',
        'Setja inn: P₂ = (1,0)(6,0) / 2,0',
        'atm·L / L → atm (L styttist út)',
        'P₂ = 3,0 atm',
      ],
    },
  },

  // ===== CHARLES'S LAW (V₁/T₁ = V₂/T₂) =====
  {
    id: 16,
    emoji: '🎈',
    scenario_is:
      'Loftbelgur hefur rúmmál 3,0 L við 300 K. Hann er hitaður upp í 450 K við fastan þrýsting. Hvert er nýja rúmmálið?',
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
      'V₂ = 3,0 × 450/300',
      'V₂ = 4,5 L',
    ],
    solution: {
      formula: 'V₂ = V₁ × T₂ / T₁',
      substitution: 'V₂ = (3,0 L)(450 K) / (300 K)',
      calculation: 'V₂ = 4,5 L',
      steps: [
        'Lögmál Charles: V₁/T₁ = V₂/T₂ (P og n föst)',
        'Einangra V₂: V₂ = V₁ × T₂/T₁',
        'T₂ = 450 K (gefið í verkefninu)',
        'Setja inn: V₂ = 3,0 × 450/300',
        'L·K / K → L (K styttist út)',
        'V₂ = 4,5 L',
      ],
    },
  },

  {
    id: 17,
    emoji: '🚗',
    scenario_is:
      'Hjólbarði bíls hefur rúmmál 8,0 L við 293 K (20°C). Eftir akstur er rúmmálið orðið 8,8 L við fastan þrýsting. Hvert er nýja hitastigið?',
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
      'T₂ = T₁ × V₂/V₁ þar sem V₂ = 8,8 L',
      'T₂ = 293 × 8,8/8,0',
      'T₂ = 322,3 K (≈ 49°C)',
    ],
    solution: {
      formula: 'T₂ = T₁ × V₂ / V₁',
      substitution: 'T₂ = (293 K)(8,8 L) / (8,0 L)',
      calculation: 'T₂ = 322,3 K',
      steps: [
        'Lögmál Charles: V₁/T₁ = V₂/T₂',
        'Einangra T₂: T₂ = T₁ × V₂/V₁',
        'V₂ = 8,8 L (gefið í verkefninu)',
        'Setja inn: T₂ = 293 × 8,8/8,0',
        'K·L / L → K (L styttist út)',
        'T₂ = 322,3 K (≈ 49°C — heitur hjólbarði!)',
      ],
    },
  },

  // ===== GAY-LUSSAC'S LAW (P₁/T₁ = P₂/T₂) =====
  {
    id: 18,
    emoji: '🔥',
    scenario_is:
      'Þrýstihylki í efnafræðistofu hefur þrýsting 2,0 atm við 300 K. Það er hitað upp í 450 K. Rúmmálið er fast. Hver er nýi þrýstingurinn?',
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
      'P₂ = 2,0 × 450/300',
      'P₂ = 3,0 atm',
    ],
    solution: {
      formula: 'P₂ = P₁ × T₂ / T₁',
      substitution: 'P₂ = (2,0 atm)(450 K) / (300 K)',
      calculation: 'P₂ = 3,0 atm',
      steps: [
        'Lögmál Gay-Lussac: P₁/T₁ = P₂/T₂ (V og n föst)',
        'Einangra P₂: P₂ = P₁ × T₂/T₁',
        'T₂ = 450 K (gefið í verkefninu)',
        'Setja inn: P₂ = 2,0 × 450/300',
        'atm·K / K → atm (K styttist út)',
        'P₂ = 3,0 atm',
      ],
    },
  },

  {
    id: 19,
    emoji: '🚙',
    scenario_is:
      'Bíldekk hefur þrýsting 2,2 atm við 288 K (15°C). Eftir akstur á sólríkum degi hækkar þrýstingurinn í 2,5 atm. Rúmmálið er fast. Hvert er nýja hitastigið?',
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
      'T₂ = T₁ × P₂/P₁ þar sem P₂ = 2,5 atm',
      'T₂ = 288 × 2,5/2,2',
      'T₂ = 327,3 K (≈ 54°C)',
    ],
    solution: {
      formula: 'T₂ = T₁ × P₂ / P₁',
      substitution: 'T₂ = (288 K)(2,5 atm) / (2,2 atm)',
      calculation: 'T₂ = 327,3 K',
      steps: [
        'Lögmál Gay-Lussac: P₁/T₁ = P₂/T₂',
        'Einangra T₂: T₂ = T₁ × P₂/P₁',
        'P₂ = 2,5 atm (gefið í verkefninu)',
        'Setja inn: T₂ = 288 × 2,5/2,2',
        'K·atm / atm → K (atm styttist út)',
        'T₂ = 327,3 K (≈ 54°C — heitt dekk!)',
      ],
    },
  },

  // ===== COMBINED GAS LAW (P₁V₁/T₁ = P₂V₂/T₂) =====
  {
    id: 20,
    emoji: '🎈',
    scenario_is:
      'Veðurblöðra er fyllt á jörðu: P₁=1,0 atm, V₁=5,0 L, T₁=293 K. Hún rís þar sem P₂=0,5 atm og T₂=253 K. Hvert er nýja rúmmálið?',
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
      'Sameinaða gaslögmálið: P₁V₁/T₁ = P₂V₂/T₂ (n er fast)',
      'V₂ = V₁ × (P₁/P₂) × (T₂/T₁) þar sem P₂=0,5 atm, T₂=253 K',
      'V₂ = 5,0 × (1,0/0,5) × (253/293)',
      'V₂ = 5,0 × 2,0 × 0,8635 = 8,63 L',
    ],
    solution: {
      formula: 'V₂ = V₁ × (P₁/P₂) × (T₂/T₁)',
      substitution: 'V₂ = (5,0 L)(1,0 atm / 0,5 atm)(253 K / 293 K)',
      calculation: 'V₂ = 8,63 L',
      steps: [
        'Sameinaða gaslögmálið: P₁V₁/T₁ = P₂V₂/T₂',
        'Einangra V₂: V₂ = V₁ × (P₁/P₂) × (T₂/T₁)',
        'P₂ = 0,5 atm og T₂ = 253 K (gefin í verkefninu)',
        'Setja inn: V₂ = 5,0 × (1,0/0,5) × (253/293)',
        'L × (atm/atm) × (K/K) → L (einingar styttast út)',
        'V₂ = 5,0 × 2,0 × 0,8635 = 8,63 L',
      ],
    },
  },

  {
    id: 21,
    emoji: '🏭',
    scenario_is:
      'Gasílát í verksmiðju: P₁=3,0 atm, V₁=10,0 L, T₁=300 K. Gasið er þjappað í P₂=6,0 atm og V₂=6,0 L. Hvert er nýja hitastigið?',
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
      'Sameinaða gaslögmálið: P₁V₁/T₁ = P₂V₂/T₂',
      'T₂ = T₁ × (P₂/P₁) × (V₂/V₁) þar sem P₂=6,0 atm, V₂=6,0 L',
      'T₂ = 300 × (6,0/3,0) × (6,0/10,0)',
      'T₂ = 300 × 2,0 × 0,6 = 360 K',
    ],
    solution: {
      formula: 'T₂ = T₁ × (P₂/P₁) × (V₂/V₁)',
      substitution: 'T₂ = (300 K)(6,0 atm / 3,0 atm)(6,0 L / 10,0 L)',
      calculation: 'T₂ = 360 K',
      steps: [
        'Sameinaða gaslögmálið: P₁V₁/T₁ = P₂V₂/T₂',
        'Einangra T₂: T₂ = T₁ × (P₂/P₁) × (V₂/V₁)',
        'P₂ = 6,0 atm og V₂ = 6,0 L (gefin í verkefninu)',
        'Setja inn: T₂ = 300 × (6,0/3,0) × (6,0/10,0)',
        'K × (atm/atm) × (L/L) → K (einingar styttast út)',
        'T₂ = 300 × 2,0 × 0,6 = 360 K (≈ 87°C)',
      ],
    },
  },

  // ===== AVOGADRO'S LAW (V₁/n₁ = V₂/n₂) =====
  {
    id: 22,
    emoji: '🎈',
    scenario_is:
      'Loftbelgur inniheldur 2,0 L af gasi og 0,10 mól af lofti. Þú blæsir meira loft inn þar til mólfjöldinn er 0,30 mól. Þrýstingur og hitastig eru föst. Hvert er nýja rúmmálið?',
    difficulty: 'Auðvelt',
    gasLaw: 'avogadro',
    given: {
      V: { value: 2.0, unit: 'L' },
      n: { value: 0.1, unit: 'mól' },
    },
    find: 'V',
    answer: 6.0,
    tolerance: 0.12,
    hints: [
      'Lögmál Avogadros: V₁/n₁ = V₂/n₂ (þrýstingur og hitastig eru föst)',
      'V₂ = V₁ × n₂/n₁ þar sem n₂ = 0,30 mól',
      'V₂ = 2,0 × 0,30/0,10',
      'V₂ = 6,0 L',
    ],
    solution: {
      formula: 'V₂ = V₁ × n₂ / n₁',
      substitution: 'V₂ = (2,0 L)(0,30 mól) / (0,10 mól)',
      calculation: 'V₂ = 6,0 L',
      steps: [
        'Lögmál Avogadros: V₁/n₁ = V₂/n₂ (P og T föst)',
        'Einangra V₂: V₂ = V₁ × n₂/n₁',
        'n₂ = 0,30 mól (gefið í verkefninu)',
        'Setja inn: V₂ = 2,0 × 0,30/0,10',
        'L·mól / mól → L (mól styttist út)',
        'V₂ = 6,0 L (þrisvar meira gas = þrisvar meira rúmmál)',
      ],
    },
  },

  {
    id: 23,
    emoji: '⚗️',
    scenario_is:
      'Gashylki inniheldur 5,0 L af gasi og 0,20 mól. Gasið þenst út í 12,5 L við fastan þrýsting og hitastig. Hversu mörg mól eru núna?',
    difficulty: 'Miðlungs',
    gasLaw: 'avogadro',
    given: {
      V: { value: 5.0, unit: 'L' },
      n: { value: 0.2, unit: 'mól' },
    },
    find: 'n',
    answer: 0.5,
    tolerance: 0.01,
    hints: [
      'Lögmál Avogadros: V₁/n₁ = V₂/n₂',
      'n₂ = n₁ × V₂/V₁ þar sem V₂ = 12,5 L',
      'n₂ = 0,20 × 12,5/5,0',
      'n₂ = 0,50 mól',
    ],
    solution: {
      formula: 'n₂ = n₁ × V₂ / V₁',
      substitution: 'n₂ = (0,20 mól)(12,5 L) / (5,0 L)',
      calculation: 'n₂ = 0,50 mól',
      steps: [
        'Lögmál Avogadros: V₁/n₁ = V₂/n₂',
        'Einangra n₂: n₂ = n₁ × V₂/V₁',
        'V₂ = 12,5 L (gefið í verkefninu)',
        'Setja inn: n₂ = 0,20 × 12,5/5,0',
        'mól·L / L → mól (L styttist út)',
        'n₂ = 0,50 mól (2,5× meira rúmmál = 2,5× fleiri mól)',
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
