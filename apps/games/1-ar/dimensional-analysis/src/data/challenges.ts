/**
 * Level 3 Challenges for Dimensional Analysis Game
 * Contains advanced challenges with multiple problem types requiring synthesis and analysis
 */

/**
 * Common option structure for reverse and other multiple-choice challenges
 */
interface ChallengeOption {
  /** Display text for the option */
  text: string;
  /** Array of conversion factors in this option */
  factors: string[];
  /** Whether this option is correct */
  correct: boolean;
  /** Number of steps in this solution path */
  steps: number;
}

/**
 * The everyday setting a challenge is dressed in.
 *
 * Only the harvested real-world items carry one. `buildLevel3Run` uses it to
 * spread a run across settings instead of handing a student five kitchen
 * problems in a row; nothing is rendered from it.
 */
export type Level3Context = 'eldhús' | 'apótek' | 'verkfræði' | 'íþróttir' | 'ferðalög';

/**
 * The fields every Level 3 challenge carries, whatever its type.
 */
interface Level3ChallengeShared {
  /** Unique identifier */
  id: string;
  /** Question prompt in Icelandic */
  prompt: string;
  /** Everyday setting, used only to spread a run across contexts */
  context?: Level3Context;
  /**
   * Replaces the generic per-type hint for this one item.
   *
   * The per-type hints are written for the type's usual shape — the derivation
   * hint, for instance, talks about scientific notation, which is wrong for a
   * derivation about minutes and hours.
   */
  hint?: string;
}

/**
 * Reverse challenge: Identify conversion factors used to transform one unit to another
 */
export interface Level3ChallengeReverse extends Level3ChallengeShared {
  /** Challenge type */
  type: 'reverse';
  /** Setup with starting and ending values/units */
  setup: {
    start: string;
    end: string;
    startValue: number;
    endValue: number;
  };
  /** Multiple choice options */
  options: ChallengeOption[];
  /** Prompt for student explanation */
  explanationPrompt: string;
}

/**
 * Error analysis challenge: Identify and correct calculation mistakes
 */
export interface Level3ChallengeErrorAnalysis extends Level3ChallengeShared {
  /** Challenge type */
  type: 'error_analysis';
  /** The incorrect work shown */
  incorrectWork: string;
  /** Correct numerical answer */
  correctAnswer: number;
  /** Unit for correct answer */
  correctUnit: string;
  /** Explanation of the error */
  errorExplanation: string;
  /** Correct conversion factors/method */
  correctMethod: string[];
}

/**
 * Efficiency challenge: Find the most efficient solution path
 */
export interface Level3ChallengeEfficiency extends Level3ChallengeShared {
  /** Challenge type */
  type: 'efficiency';
  /** Starting numerical value */
  startValue: number;
  /** Starting unit */
  startUnit: string;
  /** Target unit */
  targetUnit: string;
  /** Possible solution paths with efficiency ratings */
  possiblePaths: Array<{
    /** Array of conversion factors in this path */
    steps: string[];
    /** Number of steps */
    stepCount: number;
    /** Whether this is an efficient path */
    efficient: boolean;
  }>;
  /** Target numerical answer */
  targetAnswer: number;
}

/**
 * Synthesis challenge: Combine multiple skills (conversions, density, significant figures)
 */
export interface Level3ChallengeSynthesis extends Level3ChallengeShared {
  /** Challenge type */
  type: 'synthesis';
  /** Starting numerical value */
  startValue: number;
  /** Starting unit */
  startUnit: string;
  /**
   * What the starting value *is*, for the "Gefnar upplýsingar" card.
   *
   * Defaults to `Rúmmál`, which is what the card said unconditionally before
   * this field existed — and was wrong on every item whose starting value is a
   * mass, an amount of substance or a speed.
   */
  startLabel?: string;
  /** Density value (optional, for density-based problems) */
  density?: number;
  /** Unit for density (optional) */
  densityUnit?: string;
  /**
   * What the factor *is*, for the same card. Defaults to `Eðlismassi`.
   *
   * A molar mass, a dose per kilo and a fuel consumption all live in the
   * `density` field; only some of them are an eðlismassi.
   */
  factorLabel?: string;
  /** Target unit */
  targetUnit: string;
  /** Expected answer */
  expectedAnswer: number;
  /**
   * Significant figures the correct answer carries.
   *
   * Feedback only — never part of the score. Declare it only where the count is
   * derivable from the precision the problem gives the student; leaving it out
   * says "this item is not about significant figures", which is honest, where a
   * wrong count teaches a rule backwards.
   */
  significantFigures?: number;
  /** Required steps for solution, in Icelandic — rendered verbatim */
  requiredSteps: string[];
}

/**
 * Real-world challenge: Apply conversions to practical scenarios
 */
export interface Level3ChallengeRealWorld extends Level3ChallengeShared {
  /** Challenge type */
  type: 'real_world';
  /** Starting numerical value */
  startValue: number;
  /** Starting unit */
  startUnit: string;
  /** What the starting value is, for the card. Defaults to `Heildarmagn` */
  startLabel?: string;
  /** Size/amount of each portion */
  portionSize: number;
  /** Unit for portion size */
  portionUnit: string;
  /** What the portion is, for the card. Defaults to `Skammtastærð` */
  portionLabel?: string;
  /** Expected answer */
  expectedAnswer: number;
  /** Whether the answer must be a whole number */
  requireInteger: boolean;
  /** Worked solution, shown with the feedback */
  explanation: string;
}

/**
 * Derivation challenge: Convert large-scale or scientific notation values
 */
export interface Level3ChallengeDerivation extends Level3ChallengeShared {
  /** Challenge type */
  type: 'derivation';
  /** Starting numerical value */
  startValue: number;
  /** Starting unit */
  startUnit: string;
  /** Target unit */
  targetUnit: string;
  /** Expected answer */
  expectedAnswer: number;
  /** Whether answer should use scientific notation */
  scientificNotation: boolean;
  /** Correct conversion method */
  correctMethod: string[];
}

/**
 * Union type for all Level 3 challenge types
 */
export type Level3Challenge =
  | Level3ChallengeReverse
  | Level3ChallengeErrorAnalysis
  | Level3ChallengeEfficiency
  | Level3ChallengeSynthesis
  | Level3ChallengeRealWorld
  | Level3ChallengeDerivation;
/**
 * Level 3 Challenges: Advanced multi-step problems requiring synthesis and analysis
 * Includes reverse engineering, error analysis, efficiency optimization, and real-world applications
 */
export const level3Challenges: Level3Challenge[] = [
  {
    id: 'L3-1',
    type: 'reverse',
    prompt:
      'Nemandi byrjaði með 5000 mg og endaði með 0.005 kg. Hvaða umbreytingarstuðla notaði hann líklega?',
    setup: { start: '5000 mg', end: '0.005 kg', startValue: 5000, endValue: 0.005 },
    options: [
      {
        text: '1 g / 1000 mg, síðan 1 kg / 1000 g',
        factors: ['1 g / 1000 mg', '1 kg / 1000 g'],
        correct: true,
        steps: 2,
      },
      {
        text: '1 kg / 1000000 mg',
        factors: ['1 kg / 1000000 mg'],
        correct: true,
        steps: 1,
      },
      {
        text: '1000 g / 1 kg, síðan 1000 mg / 1 g',
        factors: ['1000 g / 1 kg', '1000 mg / 1 g'],
        correct: false,
        steps: 2,
      },
    ],
    explanationPrompt: 'Útskýrðu hvernig umbreytingin virkar:',
  },
  {
    id: 'L3-2',
    type: 'error_analysis',
    prompt:
      'María reyndi að breyta 250 mL í L. Hún fékk 250000 L. Hvað fór úrskeiðis og hvað er rétta svarið?',
    incorrectWork: '250 mL × (1000 mL / 1 L) = 250000 L',
    correctAnswer: 0.25,
    correctUnit: 'L',
    errorExplanation: 'María notaði stuðulinn öfugan - hún margfaldaði með mL í stað þess að deila',
    correctMethod: ['1 L / 1000 mL'],
  },
  {
    id: 'L3-3',
    type: 'efficiency',
    prompt: 'Breyttu 0.000005 km í mm. Finndu skilvirkustu leiðina (fæst skref).',
    startValue: 0.000005,
    startUnit: 'km',
    targetUnit: 'mm',
    possiblePaths: [
      { steps: ['1000 m / 1 km', '1000 mm / 1 m'], stepCount: 2, efficient: true },
      { steps: ['1000 m / 1 km', '100 cm / 1 m', '10 mm / 1 cm'], stepCount: 3, efficient: false },
      { steps: ['100000 cm / 1 km', '10 mm / 1 cm'], stepCount: 2, efficient: true },
    ],
    targetAnswer: 5,
  },
  {
    id: 'L3-4',
    type: 'synthesis',
    prompt:
      'Þú mælir 50.0 mL af lausn með eðlismassa 2.50 g/mL. Hversu mörg kg er þetta? Gefðu svar í 3 markverðum stöfum.',
    startValue: 50.0,
    startUnit: 'mL',
    density: 2.5,
    densityUnit: 'g/mL',
    targetUnit: 'kg',
    expectedAnswer: 0.125,
    significantFigures: 3,
    requiredSteps: ['🧪 Margfaldaðu rúmmál með eðlismassa (g = mL × g/mL)', '⚖️ 1 kg / 1000 g'],
  },
  {
    id: 'L3-5',
    type: 'real_world',
    prompt:
      'Þú átt 2.0 L af stofnlausn og þarft að útbúa 150 mL skammta. Hversu marga skammta getur þú útbúið?',
    startValue: 2.0,
    startUnit: 'L',
    portionSize: 150,
    portionUnit: 'mL',
    expectedAnswer: 13,
    requireInteger: true,
    explanation:
      'Svar verður að vera heiltala vegna þess að ekki er hægt að útbúa hluta af skammti',
  },
  {
    id: 'L3-6',
    type: 'derivation',
    prompt: 'Hraði ljóss er 3.00 × 10⁸ m/s. Birtu svarið í km/klst.',
    startValue: 3.0e8,
    startUnit: 'm/s',
    targetUnit: 'km/klst',
    expectedAnswer: 1.08e9,
    scientificNotation: true,
    correctMethod: ['1 km / 1000 m', '3600 s / 1 klst'],
  },
  {
    id: 'L3-7',
    type: 'reverse',
    prompt: 'Nemandi byrjaði með 72 km/klst og endaði með 20 m/s. Hvaða stuðla notaði hann?',
    setup: { start: '72 km/klst', end: '20 m/s', startValue: 72, endValue: 20 },
    options: [
      {
        text: '1000 m / 1 km, síðan 1 klst / 3600 s',
        factors: ['1000 m / 1 km', '1 klst / 3600 s'],
        correct: true,
        steps: 2,
      },
      {
        text: '1 km / 1000 m, síðan 3600 s / 1 klst',
        factors: ['1 km / 1000 m', '3600 s / 1 klst'],
        correct: false,
        steps: 2,
      },
    ],
    explanationPrompt: 'Útskýrðu umbreytinguna:',
  },
  {
    id: 'L3-8',
    type: 'synthesis',
    prompt: 'Eðlismassi kopar er 8.96 g/cm³. Breyttu þessu í kg/m³.',
    startValue: 8.96,
    startUnit: 'g/cm³',
    startLabel: 'Eðlismassi',
    targetUnit: 'kg/m³',
    expectedAnswer: 8960,
    significantFigures: 3,
    requiredSteps: ['⚖️ 1 kg / 1000 g', '📐 1000000 cm³ / 1 m³'],
  },
  {
    id: 'L3-9',
    type: 'error_analysis',
    prompt: 'Jón reyndi að breyta 3 klst í sekúndur. Hann fékk 180 s. Hvað fór úrskeiðis?',
    incorrectWork: '3 klst × (60 mín / 1 klst) = 180',
    correctAnswer: 10800,
    correctUnit: 's',
    errorExplanation: 'Jón gleymdi að breyta mínútum í sekúndur',
    correctMethod: ['60 mín / 1 klst', '60 s / 1 mín'],
  },
  {
    id: 'L3-10',
    type: 'efficiency',
    prompt: 'Breyttu 500000 mg í kg. Veldu skilvirkustu leiðina.',
    startValue: 500000,
    startUnit: 'mg',
    targetUnit: 'kg',
    possiblePaths: [
      { steps: ['1 g / 1000 mg', '1 kg / 1000 g'], stepCount: 2, efficient: true },
      { steps: ['1 kg / 1000000 mg'], stepCount: 1, efficient: true },
      // The long way round — correct, but three steps through a unit nobody
      // needs here. This slot used to hold `1000 g / 1 kg`, an *inverted*
      // factor that lands on 5 × 10⁸ kg; the level scored picking it as a
      // slow-but-valid method, which is the opposite of what the level teaches.
      {
        steps: ['1 g / 1000 mg', '1 tonn / 1000000 g', '1000 kg / 1 tonn'],
        stepCount: 3,
        efficient: false,
      },
    ],
    targetAnswer: 0.5,
  },
  // New real-world chemistry lab scenarios
  {
    id: 'L3-11',
    type: 'real_world',
    prompt:
      '🧪 Í tilraun þarftu að mæla út 25 mL skammta af sýru. Þú ert með 500 mL bikar. Hversu marga skammta getur þú útbúið?',
    startValue: 500,
    startUnit: 'mL',
    portionSize: 25,
    portionUnit: 'mL',
    expectedAnswer: 20,
    requireInteger: true,
    explanation: 'Deila heildarmagni með skammtastærð. 500 mL ÷ 25 mL = 20 skammtar',
  },
  {
    id: 'L3-12',
    type: 'synthesis',
    prompt:
      '🔬 Þú ert að undirbúa tilraun sem krefst 0.5 mol af NaCl. Mólmassi NaCl er 58.5 g/mol. Hversu mörg grömm þarftu?',
    startValue: 0.5,
    startUnit: 'mol',
    startLabel: 'Efnismagn',
    density: 58.5,
    densityUnit: 'g/mol',
    factorLabel: 'Mólmassi',
    targetUnit: 'g',
    expectedAnswer: 29.25,
    significantFigures: 3,
    requiredSteps: ['⚗️ Margfaldaðu efnismagn með mólmassa (g = mol × g/mol)'],
  },
  {
    id: 'L3-13',
    type: 'real_world',
    prompt:
      '💊 Lyf inniheldur 250 mg af virka efninu per töflu. Sjúklingur þarf 1.5 g á dag. Hversu margar töflur þarf hann?',
    startValue: 1.5,
    startUnit: 'g',
    portionSize: 250,
    portionUnit: 'mg',
    expectedAnswer: 6,
    requireInteger: true,
    explanation: 'Fyrst breyta g í mg (1.5 g = 1500 mg), síðan deila með 250 mg/töflu = 6 töflur',
  },
  {
    id: 'L3-14',
    type: 'synthesis',
    prompt: '⚗️ Þú mælir 75.0 mL af etanóli með eðlismassa 0.789 g/mL. Hvað vegur þetta í grömm?',
    startValue: 75.0,
    startUnit: 'mL',
    density: 0.789,
    densityUnit: 'g/mL',
    targetUnit: 'g',
    expectedAnswer: 59.2,
    significantFigures: 3,
    requiredSteps: ['🧪 Margfaldaðu rúmmál með eðlismassa (g = mL × g/mL)'],
  },
  {
    id: 'L3-17',
    type: 'error_analysis',
    prompt:
      '🔴 Nemandi reyndi að reikna massa úr rúmmáli. Hann hafði 50 mL og eðlismassa 2.7 g/mL en fékk 18.5 g. Hvað fór úrskeiðis?',
    incorrectWork: '50 mL ÷ 2.7 g/mL = 18.5 g',
    correctAnswer: 135,
    correctUnit: 'g',
    errorExplanation:
      'Nemandinn deildi í stað þess að margfalda. Rétt: m = ρ × V = 2.7 g/mL × 50 mL = 135 g',
    correctMethod: ['2.7 g/mL × 50 mL'],
  },
  {
    id: 'L3-18',
    type: 'real_world',
    prompt:
      '💧 Efnafræðitilraun þarf 2.5 L af vatni. Þú hefur 250 mL flöskur. Hversu margar flöskur þarftu?',
    startValue: 2.5,
    startUnit: 'L',
    portionSize: 250,
    portionUnit: 'mL',
    expectedAnswer: 10,
    requireInteger: true,
    explanation: 'Umbreyta 2.5 L í mL: 2500 mL. Síðan 2500 ÷ 250 = 10 flöskur',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RAUNVERULEG SAMHENGI — harvested from namsbokasafn-leikir dc5e614.
  //
  // The Year-1 curriculum review's sharpest complaint was that five of seven
  // games dress every problem in the same lab-bench setting. These 25 put the
  // same conversions in a kitchen, a pharmacy, a building site, a gym and an
  // airport, so a student meets dimensional analysis where they will actually
  // use it.
  //
  // Taken as data, not as code, and every one of them re-checked on the way in:
  // see the harvest note in the game's README for what was wrong with them.
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── ELDHÚS ────────────────────────────────────────────────────────────────
  {
    id: 'L3-COOK-1',
    type: 'synthesis',
    context: 'eldhús',
    prompt:
      '👨‍🍳 Uppskrift krefst 2 bolla af mjólk en mæliglasið þitt er merkt í mL. Hversu marga mL þarftu? (1 bolli = 240 mL)',
    startValue: 2,
    startUnit: 'bollar',
    startLabel: 'Magn',
    density: 240,
    densityUnit: 'mL/bolli',
    factorLabel: 'Umreikningsstuðull',
    targetUnit: 'mL',
    expectedAnswer: 480,
    requiredSteps: ['🥛 Margfaldaðu fjölda bolla með 240 mL/bolli'],
  },
  {
    id: 'L3-COOK-2',
    type: 'synthesis',
    context: 'eldhús',
    prompt:
      '🥧 Uppskrift þarf 4 oz af smjöri en pakkningin er merkt í grömmum. Hversu mörg g þarftu? (1 oz = 28.35 g)',
    startValue: 4,
    startUnit: 'oz',
    startLabel: 'Magn',
    density: 28.35,
    densityUnit: 'g/oz',
    factorLabel: 'Umreikningsstuðull',
    targetUnit: 'g',
    expectedAnswer: 113.4,
    significantFigures: 4,
    requiredSteps: ['⚖️ 28.35 g / 1 oz'],
  },
  {
    id: 'L3-COOK-3',
    type: 'derivation',
    context: 'eldhús',
    prompt:
      '🍰 Þú þrefaldar uppskrift sem þarf 1.5 dl af sykri. Hversu marga mL af sykri þarftu alls? (1 dl = 100 mL)',
    startValue: 1.5,
    startUnit: 'dl',
    targetUnit: 'mL',
    expectedAnswer: 450,
    scientificNotation: false,
    correctMethod: ['3 uppskriftir / 1 uppskrift', '100 mL / 1 dl'],
    hint: 'Þrefaldaðu fyrst magnið, umbreyttu svo dl í mL — eða öfugt, svarið er það sama.',
  },
  {
    id: 'L3-COOK-4',
    type: 'efficiency',
    context: 'eldhús',
    prompt: '🥄 Breyttu 3 matskeiðum (msk) í teskeiðar (tsk). (1 msk = 3 tsk)',
    startValue: 3,
    startUnit: 'msk',
    targetUnit: 'tsk',
    possiblePaths: [
      { steps: ['3 tsk / 1 msk'], stepCount: 1, efficient: true },
      { steps: ['15 mL / 1 msk', '1 tsk / 5 mL'], stepCount: 2, efficient: false },
    ],
    targetAnswer: 9,
  },
  {
    id: 'L3-COOK-5',
    type: 'real_world',
    context: 'eldhús',
    prompt:
      '🍕 Pizzudeig krefst 500 g af hveiti. Þú átt 2 kg poka. Hversu mörg deig geturðu búið til?',
    startValue: 2,
    startUnit: 'kg',
    portionSize: 500,
    portionUnit: 'g',
    expectedAnswer: 4,
    requireInteger: true,
    explanation: '2 kg = 2000 g. 2000 g ÷ 500 g/deig = 4 deig.',
  },

  // ─── APÓTEK ────────────────────────────────────────────────────────────────
  {
    id: 'L3-PHARM-1',
    type: 'synthesis',
    context: 'apótek',
    prompt:
      '💊 Barn sem vegur 25 kg fær lyf í skammtinum 15 mg/kg líkamsþyngdar. Hversu mörg mg fær barnið?',
    startValue: 25,
    startUnit: 'kg',
    startLabel: 'Líkamsþyngd',
    density: 15,
    densityUnit: 'mg/kg',
    factorLabel: 'Skammtur',
    targetUnit: 'mg',
    expectedAnswer: 375,
    requiredSteps: ['💊 Margfaldaðu líkamsþyngd með skammtinum (mg = kg × mg/kg)'],
  },
  {
    id: 'L3-PHARM-2',
    type: 'synthesis',
    context: 'apótek',
    prompt:
      '💉 Lyfjaskammtur er 0.5 mL/kg líkamsþyngdar. Sjúklingur vegur 70 kg. Hversu marga mL þarf sjúklingurinn?',
    startValue: 70,
    startUnit: 'kg',
    startLabel: 'Líkamsþyngd',
    density: 0.5,
    densityUnit: 'mL/kg',
    factorLabel: 'Skammtur',
    targetUnit: 'mL',
    expectedAnswer: 35,
    requiredSteps: ['💉 Margfaldaðu líkamsþyngd með skammtinum (mL = kg × mL/kg)'],
  },
  {
    id: 'L3-PHARM-3',
    type: 'synthesis',
    context: 'apótek',
    prompt:
      '🩺 Lyfjalausn inniheldur 125 mg í hverjum 5 mL. Sjúklingur á að fá 250 mg. Hversu marga mL þarf að gefa?',
    startValue: 250,
    startUnit: 'mg',
    startLabel: 'Skammtur',
    density: 5,
    densityUnit: 'mL / 125 mg',
    factorLabel: 'Styrkur lausnar',
    targetUnit: 'mL',
    expectedAnswer: 10,
    requiredSteps: ['🧪 Margfaldaðu skammtinn með 5 mL / 125 mg'],
  },
  {
    id: 'L3-PHARM-4',
    type: 'real_world',
    context: 'apótek',
    prompt:
      '💊 Hvert hylki inniheldur 200 mg. Daglegur skammtur er 0.6 g. Hversu mörg hylki þarf á dag?',
    startValue: 0.6,
    startUnit: 'g',
    portionSize: 200,
    portionUnit: 'mg',
    expectedAnswer: 3,
    requireInteger: true,
    explanation: '0.6 g = 600 mg. 600 mg ÷ 200 mg/hylki = 3 hylki.',
  },
  {
    id: 'L3-PHARM-5',
    type: 'derivation',
    context: 'apótek',
    prompt: '🏥 Innrennslishraði er 2 mL/mín. Hversu marga mL fær sjúklingurinn á klukkustund?',
    startValue: 2,
    startUnit: 'mL/mín',
    targetUnit: 'mL/klst',
    expectedAnswer: 120,
    scientificNotation: false,
    correctMethod: ['60 mín / 1 klst'],
    hint: 'Mínúturnar eiga að styttast út — settu þær í nefnara stuðulsins.',
  },

  // ─── VERKFRÆÐI ─────────────────────────────────────────────────────────────
  {
    id: 'L3-ENG-1',
    type: 'synthesis',
    context: 'verkfræði',
    prompt:
      '🏗️ Steypa hefur eðlismassann 2400 kg/m³. Þú steypir 0.50 m³. Hversu mörg kg vegur steypan?',
    startValue: 0.5,
    startUnit: 'm³',
    density: 2400,
    densityUnit: 'kg/m³',
    targetUnit: 'kg',
    expectedAnswer: 1200,
    significantFigures: 2,
    requiredSteps: ['🧱 Margfaldaðu rúmmál með eðlismassa (kg = m³ × kg/m³)'],
  },
  {
    id: 'L3-ENG-2',
    type: 'real_world',
    context: 'verkfræði',
    prompt:
      '🔩 Skrúfupakki inniheldur 50 skrúfur. Verkefnið þarf 325 skrúfur. Hversu marga pakka þarftu að kaupa?',
    startValue: 325,
    startUnit: 'skrúfur',
    portionSize: 50,
    portionUnit: 'skrúfur',
    expectedAnswer: 7,
    requireInteger: true,
    explanation:
      '325 ÷ 50 = 6.5 pakkar. Þú getur ekki keypt hálfan pakka, svo það þarf að kaupa 7 — hér er námundað upp.',
  },
  {
    id: 'L3-ENG-3',
    type: 'synthesis',
    context: 'verkfræði',
    prompt: '🪨 Sandur hefur eðlismassann 1.6 g/cm³. Breyttu því í kg/m³.',
    startValue: 1.6,
    startUnit: 'g/cm³',
    startLabel: 'Eðlismassi',
    targetUnit: 'kg/m³',
    expectedAnswer: 1600,
    significantFigures: 2,
    requiredSteps: ['⚖️ 1 kg / 1000 g', '📐 1000000 cm³ / 1 m³'],
  },
  {
    id: 'L3-ENG-4',
    type: 'real_world',
    context: 'verkfræði',
    prompt:
      '🧱 Múrsteinn vegur 2.5 kg. Flutningabíll ber 2 tonn. Hversu marga steina getur hann flutt?',
    startValue: 2,
    startUnit: 'tonn',
    portionSize: 2.5,
    portionUnit: 'kg',
    expectedAnswer: 800,
    requireInteger: true,
    explanation: '2 tonn = 2000 kg. 2000 kg ÷ 2.5 kg/stein = 800 steinar.',
  },
  {
    id: 'L3-ENG-5',
    type: 'derivation',
    context: 'verkfræði',
    prompt: '⚡ Rafmagnsofn hefur aflið 1500 W. Hversu mörg kW er það?',
    startValue: 1500,
    startUnit: 'W',
    targetUnit: 'kW',
    expectedAnswer: 1.5,
    scientificNotation: false,
    correctMethod: ['1 kW / 1000 W'],
    hint: 'Forskeytið kíló þýðir þúsund: 1 kW = 1000 W.',
  },

  // ─── ÍÞRÓTTIR ──────────────────────────────────────────────────────────────
  {
    id: 'L3-SPORT-1',
    type: 'derivation',
    context: 'íþróttir',
    prompt: '🏃 Hlaupari hleypur 10 km á 50 mínútum. Hver er meðalhraðinn í km/klst?',
    startValue: 10,
    startUnit: 'km',
    targetUnit: 'km/klst',
    expectedAnswer: 12,
    scientificNotation: false,
    correctMethod: ['1 / 50 mín', '60 mín / 1 klst'],
    hint: 'Finndu fyrst hraðann í km/mín (10 km ÷ 50 mín) og margfaldaðu svo með 60 mín/klst.',
  },
  {
    id: 'L3-SPORT-2',
    type: 'synthesis',
    context: 'íþróttir',
    prompt: '🚴 Hjólreiðamaður hjólar á 25.0 km/klst. Breyttu hraðanum í m/s.',
    startValue: 25.0,
    startUnit: 'km/klst',
    startLabel: 'Hraði',
    targetUnit: 'm/s',
    expectedAnswer: 6.94,
    significantFigures: 3,
    requiredSteps: ['📏 1000 m / 1 km', '⏱️ 1 klst / 3600 s'],
  },
  {
    id: 'L3-SPORT-3',
    type: 'real_world',
    context: 'íþróttir',
    prompt:
      '🏊 Sundlaugin er 25 m löng. Þjálfarinn vill að nemendur syndi 1 km. Hversu margar ferðir þurfa þeir að synda?',
    startValue: 1,
    startUnit: 'km',
    portionSize: 25,
    portionUnit: 'm',
    expectedAnswer: 40,
    requireInteger: true,
    explanation: '1 km = 1000 m. 1000 m ÷ 25 m/ferð = 40 ferðir.',
  },
  {
    id: 'L3-SPORT-4',
    type: 'efficiency',
    context: 'íþróttir',
    prompt: '⏱️ Hlaupari hleypur míluna á 4:30 mínútum. Breyttu tímanum í sekúndur.',
    startValue: 4.5,
    startUnit: 'mín',
    targetUnit: 's',
    possiblePaths: [
      { steps: ['60 s / 1 mín'], stepCount: 1, efficient: true },
      { steps: ['1 klst / 60 mín', '3600 s / 1 klst'], stepCount: 2, efficient: false },
    ],
    targetAnswer: 270,
  },
  {
    id: 'L3-SPORT-5',
    type: 'synthesis',
    context: 'íþróttir',
    prompt:
      '🎿 Skíðamaður fer á 45.0 km/klst. Hversu margar mínútur tekur það hann að fara einn km?',
    startValue: 45.0,
    startUnit: 'km/klst',
    startLabel: 'Hraði',
    targetUnit: 'mín/km',
    expectedAnswer: 1.33,
    significantFigures: 3,
    requiredSteps: ['↔️ Snúðu hraðanum við: 1 klst / 45.0 km', '⏱️ 60 mín / 1 klst'],
  },

  // ─── FERÐALÖG ──────────────────────────────────────────────────────────────
  {
    id: 'L3-TRAVEL-1',
    type: 'synthesis',
    context: 'ferðalög',
    prompt: '✈️ Flugið tekur 8.5 klst. Hversu margar mínútur eru það?',
    startValue: 8.5,
    startUnit: 'klst',
    startLabel: 'Tími',
    targetUnit: 'mín',
    expectedAnswer: 510,
    significantFigures: 2,
    requiredSteps: ['⏱️ 60 mín / 1 klst'],
  },
  {
    id: 'L3-TRAVEL-2',
    type: 'synthesis',
    context: 'ferðalög',
    prompt: '⛽ Bíll eyðir 7.0 L á hverja 100 km. Ferðin er 350 km. Hversu marga lítra þarftu?',
    startValue: 350,
    startUnit: 'km',
    startLabel: 'Vegalengd',
    density: 7.0,
    densityUnit: 'L / 100 km',
    factorLabel: 'Eyðsla',
    targetUnit: 'L',
    expectedAnswer: 24.5,
    requiredSteps: ['⛽ Margfaldaðu vegalengdina með 7.0 L / 100 km'],
  },
  {
    id: 'L3-TRAVEL-3',
    type: 'efficiency',
    context: 'ferðalög',
    prompt: '🌍 Breyttu 100 km í mílur. (1 míla = 1.609 km)',
    startValue: 100,
    startUnit: 'km',
    targetUnit: 'mílur',
    possiblePaths: [
      { steps: ['1 míla / 1.609 km'], stepCount: 1, efficient: true },
      { steps: ['1000 m / 1 km', '1 míla / 1609 m'], stepCount: 2, efficient: false },
    ],
    targetAnswer: 62.15,
  },
  {
    id: 'L3-TRAVEL-4',
    type: 'derivation',
    context: 'ferðalög',
    prompt: '🚂 Lest fer á 200 km/klst. Hversu langt fer hún á 45 mínútum?',
    startValue: 45,
    startUnit: 'mín',
    targetUnit: 'km',
    expectedAnswer: 150,
    scientificNotation: false,
    correctMethod: ['1 klst / 60 mín', '200 km / 1 klst'],
    hint: 'Byrjaðu á tímanum, ekki hraðanum: umbreyttu 45 mín í klst og margfaldaðu svo með hraðanum.',
  },
  {
    id: 'L3-TRAVEL-5',
    type: 'real_world',
    context: 'ferðalög',
    prompt:
      '🛫 Flugvélin er 73 m löng. Flugbrautin er 3.5 km. Hversu margar flugvélar komast fyrir á brautinni?',
    startValue: 3.5,
    startUnit: 'km',
    portionSize: 73,
    portionUnit: 'm',
    expectedAnswer: 47,
    requireInteger: true,
    explanation:
      '3.5 km = 3500 m. 3500 m ÷ 73 m/flugvél = 47.9 — hér er námundað niður, því hálf flugvél kemst ekki fyrir.',
  },
];
