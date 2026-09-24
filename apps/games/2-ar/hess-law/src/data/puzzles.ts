import type { Equation } from './challenges';

/**
 * Level 2's puzzles. Each gives a target equation and the equations a student may
 * reverse, scale and combine to reach it. `solution` is the combination that reaches it;
 * the level grades on reaching the target equation itself, not on matching `solution`,
 * and `puzzles.test.ts` holds every `solution` to its target and to `targetDeltaH`.
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
}

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
    targetDeltaH: -1367,
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
        deltaH: -277.0,
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
    explanation: '2×(-393,5) + 3×(-285,8) + (+277,0) = -787 - 857,4 + 277 = -1367,4 kJ',
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
        deltaH: 90.2,
        isReversed: false,
        multiplier: 1,
      },
      {
        id: 'eq2',
        reactants: 'NO(g) + ½O₂(g)',
        products: 'NO₂(g)',
        deltaH: -57.0,
        isReversed: false,
        multiplier: 1,
      },
    ],
    solution: [
      { equationId: 'eq1', reverse: false, multiply: 1 },
      { equationId: 'eq2', reverse: false, multiply: 1 },
    ],
    hint: 'NO er millistig. Leggðu saman til að NO styttist út.',
    explanation: 'Jöfnur 1 + 2: NO styttist út. 90,2 + (-57,0) = 33,2 kJ',
  },
  {
    id: 5,
    title: 'SO₃ - Snertiferlið (Contact Process)',
    description:
      '🏭 SO₃ framleiðsla er lykilskref í snertiferlinu (Contact Process) sem framleiðir brennisteinssýru - mest framleidda efnið í heiminum!',
    targetEquation: {
      reactants: 'SO₂(g) + ½O₂(g)',
      products: 'SO₃(g)',
    },
    targetDeltaH: -99.0,
    availableEquations: [
      {
        id: 'eq1',
        reactants: 'S(s) + O₂(g)',
        products: 'SO₂(g)',
        deltaH: -297.0,
        isReversed: false,
        multiplier: 1,
      },
      {
        id: 'eq2',
        reactants: 'S(s) + 3/2O₂(g)',
        products: 'SO₃(g)',
        deltaH: -396.0,
        isReversed: false,
        multiplier: 1,
      },
    ],
    solution: [
      { equationId: 'eq1', reverse: true, multiply: 1 },
      { equationId: 'eq2', reverse: false, multiply: 1 },
    ],
    hint: 'SO₂ er hvarfefni í markmiðinu, en myndefni í jöfnu 1. Hvað þarftu að gera?',
    explanation: 'Snúa við jöfnu 1 og leggja við jöfnu 2: +297,0 + (-396,0) = -99,0 kJ',
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
    targetDeltaH: -852,
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
        deltaH: -824,
        isReversed: false,
        multiplier: 1,
      },
    ],
    solution: [
      { equationId: 'eq1', reverse: false, multiply: 1 },
      { equationId: 'eq2', reverse: true, multiply: 1 },
    ],
    hint: 'Fe₂O₃ er hvarfefni í markmiðinu (neysla), en myndefni í jöfnu 2 (myndun).',
    explanation: 'Jafna 1 + öfug jafna 2: -1676 + 824 = -852 kJ. Þetta er termít-efnahvarfið!',
  },
];
