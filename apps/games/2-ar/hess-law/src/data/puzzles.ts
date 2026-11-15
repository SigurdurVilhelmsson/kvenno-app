import type { Equation } from './challenges';

/**
 * Level 2's puzzles. Each gives a target equation and the equations a student may
 * reverse, scale and combine to reach it. `solution` is the combination that reaches it;
 * the level grades on reaching the target equation itself, not on matching `solution`,
 * and `puzzles.test.ts` holds every `solution` to its target and to `targetDeltaH`.
 *
 * Every equation's ΔH is the book's, derived from `@shared/data/thermo` and printed to
 * one decimal (mobile-pass decision 9), and `targetDeltaH` is the sum of those printed
 * values, so the student's arithmetic lands on it exactly. `formation.test.ts` holds
 * both. They used to be a third set of roundings, from neither book.
 */
export interface Puzzle {
  id: number;
  title: string;
  description: string;
  targetEquation: {
    reactants: string;
    products: string;
  };
  targetDeltaH: number;
  availableEquations: Equation[];
  solution: { equationId: string; reverse: boolean; multiply: number }[];
  hint: string;
  explanation: string;
  /**
   * Where the numbers come from when they are not formation enthalpies from m68865: the
   * Born-Haber puzzles take ionisation energy, electron affinity and the rest from the book's
   * worked cycle for CsF (kafli 7.5, m68741), which `born-haber.test.ts` holds them to.
   */
  source?: string;
}

/**
 * The book's Born-Haber cycle for caesium fluoride (kafli 7.5, „Styrkur jóna- og samgildra
 * tengja“, m68741): each step's ΔH as the book prints it, in kJ/mól.
 */
export const CSF_CYCLE = {
  sublimation: 76.5,
  halfBond: 79.4,
  ionisation: 375.7,
  electronAffinity: -328.2,
  formation: -553.5,
} as const;
const SRC_BORN_HABER =
  'Kafli 7, „Styrkur jóna- og samgildra tengja“, Born-Haber-hringferlið fyrir CsF';

const csfSteps = {
  sublimation: {
    id: 'eq1',
    step: 'Þurrgufun sesíns',
    reactants: 'Cs(s)',
    products: 'Cs(g)',
    deltaH: CSF_CYCLE.sublimation,
    isReversed: false,
    multiplier: 1,
  },
  halfBond: {
    id: 'eq2',
    step: 'Hálf tengjaorka F₂',
    reactants: '½F₂(g)',
    products: 'F(g)',
    deltaH: CSF_CYCLE.halfBond,
    isReversed: false,
    multiplier: 1,
  },
  ionisation: {
    id: 'eq3',
    step: 'Jónunarorka sesíns',
    reactants: 'Cs(g)',
    products: 'Cs⁺(g) + e⁻',
    deltaH: CSF_CYCLE.ionisation,
    isReversed: false,
    multiplier: 1,
  },
  electronAffinity: {
    id: 'eq4',
    step: 'Rafeindasækni flúors',
    reactants: 'F(g) + e⁻',
    products: 'F⁻(g)',
    deltaH: CSF_CYCLE.electronAffinity,
    isReversed: false,
    multiplier: 1,
  },
  formation: {
    id: 'eq5',
    step: 'Myndunarvermi CsF',
    reactants: 'Cs(s) + ½F₂(g)',
    products: 'CsF(s)',
    deltaH: CSF_CYCLE.formation,
    isReversed: false,
    multiplier: 1,
  },
} satisfies Record<string, Equation>;

/** The lattice energy the cycle gives, kJ/mól: the sum of the printed steps, formation reversed. */
export const CSF_LATTICE = Number(
  (
    CSF_CYCLE.sublimation +
    CSF_CYCLE.halfBond +
    CSF_CYCLE.ionisation +
    CSF_CYCLE.electronAffinity -
    CSF_CYCLE.formation
  ).toFixed(1)
);

export const PUZZLES: Puzzle[] = [
  {
    id: 1,
    title: 'Kolmónoxíð - iðnaðargas',
    description:
      '🏭 CO er mikilvægt iðnaðargas notað í stálframleiðslu og efnasmíði. Finndu myndunarvermið.',
    targetEquation: {
      reactants: 'C(s) + ½O₂(g)',
      products: 'CO(g)',
    },
    targetDeltaH: -110.5,
    availableEquations: [
      {
        id: 'eq1',
        reactants: 'C(s) + O₂(g)',
        products: 'CO₂(g)',
        deltaH: -393.5,
        isReversed: false,
        multiplier: 1,
      },
      {
        id: 'eq2',
        reactants: 'CO(g) + ½O₂(g)',
        products: 'CO₂(g)',
        deltaH: -283.0,
        isReversed: false,
        multiplier: 1,
      },
    ],
    solution: [
      { equationId: 'eq1', reverse: false, multiply: 1 },
      { equationId: 'eq2', reverse: true, multiply: 1 },
    ],
    hint: 'Þú vilt CO sem myndefni, en í jöfnu 2 er CO hvarfefni. Hvað þarftu að gera?',
    explanation:
      'Nota jöfnu 1 (C → CO₂) og snúa við jöfnu 2 (CO₂ → CO). CO₂ styttist út: -393,5 + 283,0 = -110,5 kJ',
  },
  {
    id: 2,
    title: 'Vatn - vetnisorkugjafi',
    description:
      '🚀 Myndun vatns er grunnur að vetnisefnarafölum og eldsneytisknippi eldflaugar. Finndu hvarfvermið.',
    targetEquation: {
      reactants: 'H₂(g) + ½O₂(g)',
      products: 'H₂O(g)',
    },
    targetDeltaH: -241.8,
    availableEquations: [
      {
        id: 'eq1',
        reactants: 'H₂(g) + ½O₂(g)',
        products: 'H₂O(l)',
        deltaH: -285.8,
        isReversed: false,
        multiplier: 1,
      },
      {
        id: 'eq2',
        reactants: 'H₂O(l)',
        products: 'H₂O(g)',
        deltaH: 44.0,
        isReversed: false,
        multiplier: 1,
      },
    ],
    solution: [
      { equationId: 'eq1', reverse: false, multiply: 1 },
      { equationId: 'eq2', reverse: false, multiply: 1 },
    ],
    hint: 'Jafna 1 gefur fljótandi vatn, en þú vilt gas. Jafna 2 umbreytir vökva í gas.',
    explanation: 'Leggja saman báðar jöfnur: -285,8 + 44,0 = -241,8 kJ. H₂O(l) styttist út.',
  },
  {
    id: 3,
    title: 'Etanól - lífeldsneyti',
    description:
      '🌽 Etanól er umhverfisvænt lífeldsneyti framleitt úr korni og sykurreyr. Notað í bílum í Brasilíu og E85 blöndum.',
    targetEquation: {
      reactants: 'C₂H₅OH(l) + 3O₂(g)',
      products: '2CO₂(g) + 3H₂O(l)',
    },
    targetDeltaH: -1366.8,
    availableEquations: [
      {
        id: 'eq1',
        reactants: 'C(s) + O₂(g)',
        products: 'CO₂(g)',
        deltaH: -393.5,
        isReversed: false,
        multiplier: 1,
      },
      {
        id: 'eq2',
        reactants: 'H₂(g) + ½O₂(g)',
        products: 'H₂O(l)',
        deltaH: -285.8,
        isReversed: false,
        multiplier: 1,
      },
      {
        id: 'eq3',
        reactants: '2C(s) + 3H₂(g) + ½O₂(g)',
        products: 'C₂H₅OH(l)',
        deltaH: -277.6,
        isReversed: false,
        multiplier: 1,
      },
    ],
    solution: [
      { equationId: 'eq1', reverse: false, multiply: 2 },
      { equationId: 'eq2', reverse: false, multiply: 3 },
      { equationId: 'eq3', reverse: true, multiply: 1 },
    ],
    hint: 'Etanól er hvarfefni, en í jöfnu 3 er það myndefni. Þú þarft 2 CO₂ og 3 H₂O.',
    explanation: '2×(-393,5) + 3×(-285,8) + (+277,6) = -787 - 857,4 + 277,6 = -1366,8 kJ',
  },
  {
    id: 4,
    title: 'NO₂ - loftmengun',
    description:
      '🚗 NO₂ myndast í bifreiðum og veldur loftmengun. Skilningur á þessu hjálpar við útblásturshreinsikerfi (hvarfakúta).',
    targetEquation: {
      reactants: '½N₂(g) + O₂(g)',
      products: 'NO₂(g)',
    },
    targetDeltaH: 33.2,
    availableEquations: [
      {
        id: 'eq1',
        reactants: '½N₂(g) + ½O₂(g)',
        products: 'NO(g)',
        deltaH: 90.3,
        isReversed: false,
        multiplier: 1,
      },
      {
        id: 'eq2',
        reactants: 'NO(g) + ½O₂(g)',
        products: 'NO₂(g)',
        deltaH: -57.1,
        isReversed: false,
        multiplier: 1,
      },
    ],
    solution: [
      { equationId: 'eq1', reverse: false, multiply: 1 },
      { equationId: 'eq2', reverse: false, multiply: 1 },
    ],
    hint: 'NO er milliefni. Leggðu saman til að NO styttist út.',
    explanation: 'Jöfnur 1 + 2: NO styttist út. 90,3 + (-57,1) = 33,2 kJ',
  },
  {
    id: 5,
    title: 'SO₃ - Snertiferlið',
    description:
      '🏭 SO₃ framleiðsla er lykilskref í snertiferlinu sem framleiðir brennisteinssýru - mest framleidda efnið í heiminum!',
    targetEquation: {
      reactants: 'SO₂(g) + ½O₂(g)',
      products: 'SO₃(g)',
    },
    targetDeltaH: -98.9,
    availableEquations: [
      {
        id: 'eq1',
        reactants: 'S(s) + O₂(g)',
        products: 'SO₂(g)',
        deltaH: -296.8,
        isReversed: false,
        multiplier: 1,
      },
      {
        id: 'eq2',
        reactants: 'S(s) + 3/2O₂(g)',
        products: 'SO₃(g)',
        deltaH: -395.7,
        isReversed: false,
        multiplier: 1,
      },
    ],
    solution: [
      { equationId: 'eq1', reverse: true, multiply: 1 },
      { equationId: 'eq2', reverse: false, multiply: 1 },
    ],
    hint: 'SO₂ er hvarfefni í markmiðinu, en myndefni í jöfnu 1. Hvað þarftu að gera?',
    explanation: 'Snúa við jöfnu 1 og leggja við jöfnu 2: +296,8 + (-395,7) = -98,9 kJ',
  },
  {
    id: 6,
    title: 'Termít - járnbrautaviðgerðir',
    description:
      '🔥 Termít-efnahvörf (2700°C!) eru notuð til að bræða saman járnbrautarteina. Einnig notuð í hernaði og eldflaugum.',
    targetEquation: {
      reactants: '2Al(s) + Fe₂O₃(s)',
      products: 'Al₂O₃(s) + 2Fe(s)',
    },
    targetDeltaH: -851.8,
    availableEquations: [
      {
        id: 'eq1',
        reactants: '2Al(s) + 3/2O₂(g)',
        products: 'Al₂O₃(s)',
        deltaH: -1676,
        isReversed: false,
        multiplier: 1,
      },
      {
        id: 'eq2',
        reactants: '2Fe(s) + 3/2O₂(g)',
        products: 'Fe₂O₃(s)',
        deltaH: -824.2,
        isReversed: false,
        multiplier: 1,
      },
    ],
    solution: [
      { equationId: 'eq1', reverse: false, multiply: 1 },
      { equationId: 'eq2', reverse: true, multiply: 1 },
    ],
    hint: 'Fe₂O₃ er hvarfefni í markmiðinu (neysla), en myndefni í jöfnu 2 (myndun).',
    explanation: 'Jafna 1 + öfug jafna 2: -1676 + 824,2 = -851,8 kJ. Þetta er termít-efnahvarfið!',
  },
  {
    id: 7,
    title: 'Grindarorka sesínflúoríðs - Born-Haber',
    description:
      '🧂 Grindarorka er orkan sem þarf til að aðskilja eitt mól af föstu jónaefni í jónir á gasformi. Hana er ekki hægt að mæla beint, en Born-Haber-hringferlið reiknar hana með lögmáli Hess úr skrefum sem má mæla.',
    targetEquation: {
      reactants: 'CsF(s)',
      products: 'Cs⁺(g) + F⁻(g)',
    },
    targetDeltaH: CSF_LATTICE,
    availableEquations: [
      csfSteps.sublimation,
      csfSteps.halfBond,
      csfSteps.ionisation,
      csfSteps.electronAffinity,
      csfSteps.formation,
    ],
    solution: [
      { equationId: 'eq1', reverse: false, multiply: 1 },
      { equationId: 'eq2', reverse: false, multiply: 1 },
      { equationId: 'eq3', reverse: false, multiply: 1 },
      { equationId: 'eq4', reverse: false, multiply: 1 },
      { equationId: 'eq5', reverse: true, multiply: 1 },
    ],
    hint: 'Byrjaðu á föstu CsF: snúðu myndunarjöfnunni við svo hún gefi frumefnin. Hin skrefin breyta frumefnunum í jónir á gasformi.',
    explanation:
      'Snúa myndunarjöfnunni við (+553,5) og leggja hin fjögur skrefin við: 76,5 + 79,4 + 375,7 − 328,2 + 553,5 = +756,9 kJ. Grindarorka er jákvæð: það kostar orku að aðskilja jónirnar.',
    source: SRC_BORN_HABER,
  },
  {
    id: 8,
    title: 'Rafeindasækni flúors - hringferlið hina leiðina',
    description:
      '🔁 Born-Haber-hringferlið má leysa fyrir hvaða skref sem er, ef hin eru þekkt. Notaðu grindarorku CsF úr síðustu þraut til að finna rafeindasækni flúors.',
    targetEquation: {
      reactants: 'F(g) + e⁻',
      products: 'F⁻(g)',
    },
    targetDeltaH: CSF_CYCLE.electronAffinity,
    availableEquations: [
      csfSteps.sublimation,
      csfSteps.halfBond,
      csfSteps.ionisation,
      {
        id: 'eq4',
        step: 'Grindarorka CsF',
        reactants: 'CsF(s)',
        products: 'Cs⁺(g) + F⁻(g)',
        deltaH: CSF_LATTICE,
        isReversed: false,
        multiplier: 1,
      },
      csfSteps.formation,
    ],
    solution: [
      { equationId: 'eq1', reverse: true, multiply: 1 },
      { equationId: 'eq2', reverse: true, multiply: 1 },
      { equationId: 'eq3', reverse: true, multiply: 1 },
      { equationId: 'eq4', reverse: false, multiply: 1 },
      { equationId: 'eq5', reverse: false, multiply: 1 },
    ],
    hint: 'Markmiðið byrjar á F(g) og rafeind. Snúðu við skrefunum sem mynda F(g), Cs(g) og Cs⁺(g), svo allt nema F⁻(g) styttist út.',
    explanation:
      'Snúa við þurrgufun, hálfri tengjaorku og jónunarorku, og leggja við myndunarvermi og grindarorku: −76,5 − 79,4 − 375,7 − 553,5 + 756,9 = −328,2 kJ. Neikvætt: orka losnar þegar flúoratóm tekur við rafeind.',
    source: SRC_BORN_HABER,
  },
];
