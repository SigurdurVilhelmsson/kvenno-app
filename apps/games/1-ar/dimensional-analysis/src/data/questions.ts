/**
 * Level 1 conceptual questions for dimensional analysis
 */

export type QuestionType =
  | 'equivalence'
  | 'cancellation_prediction'
  | 'factor_selection'
  | 'error_identification'
  | 'conceptual';

export interface Level1Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: any[];
  factors?: { text: string; correct: boolean }[];
  correct?: number;
  correctText?: string;
  visualization?: string;
  multiSelect?: boolean;
  explanationRequired?: boolean;
  explanationOptions?: { text: string; correct: boolean }[];
}

export const level1Questions: Level1Question[] = [
  {
    id: 'L1-1',
    type: 'equivalence',
    prompt: 'Hvað af þessu jafngildir 1? (Veldu öll rétt)',
    options: [
      { text: '1000 mL / 1 L', correct: true },
      { text: '1000 g / 1 kg', correct: true },
      { text: '100 mL / 1 L', correct: false },
      { text: '60 s / 1 mín', correct: true },
      { text: '50 cm / 1 m', correct: false }
    ],
    multiSelect: true,
    explanationRequired: false
  },
  {
    id: 'L1-2',
    type: 'cancellation_prediction',
    prompt: 'Ef þú byrjar með 2000 g og margfaldar með (1 kg / 1000 g), hvað verður eftir?',
    options: ['g', 'kg', 'g·kg', 'g/kg'],
    correct: 1,
    explanationRequired: true,
    explanationOptions: [
      { text: 'Vegna þess að g strikast út og kg verður eftir', correct: true },
      { text: 'Vegna þess að kg er stærra', correct: false },
      { text: 'Vegna þess að talan minnkar', correct: false }
    ]
  },
  {
    id: 'L1-3',
    type: 'factor_selection',
    prompt: 'Þú þarft að breyta úr mL í L. Hvaða stuðul velur þú?',
    factors: [
      { text: '1000 mL / 1 L', correct: false },
      { text: '1 L / 1000 mL', correct: true }
    ],
    explanationOptions: [
      { text: 'Vegna þess að mL þarf að vera í nefnara til að strikast út', correct: true },
      { text: 'Vegna þess að L er stærri eining', correct: false },
      { text: 'Vegna þess að þetta er einfaldara', correct: false }
    ]
  },
  {
    id: 'L1-4',
    type: 'error_identification',
    prompt: 'Anna reyndi að breyta 5000 mg í g. Hún notaði (1000 mg / 1 g). Hvað fór úrskeiðis?',
    options: [
      'Hún notaði rangan stuðul',
      'Stuðullinn er rétt snúinn',
      'Hún þurfti fleiri stuðla',
      'Ekkert fór úrskeiðis'
    ],
    correct: 1,
    correctText: 'Stuðullinn er rangur snúinn - mg þarf að vera í nefnara',
    visualization: 'Útkoman yrði 5000000 mg²/g í stað 5 g'
  },
  {
    id: 'L1-5',
    type: 'conceptual',
    prompt: 'Af hverju breytist talan þegar við breytum einingum, þó magn efnisins sé það sama?',
    options: [
      'Vegna þess að mismunandi einingar mæla mismunandi magn',
      'Vegna þess að einingar af mismunandi stærð þurfa mismunandi fjölda til að tákna sama magn',
      'Vegna þess að umbreyting breytir efninu',
      'Talan breytist ekki'
    ],
    correct: 1
  },
  {
    id: 'L1-6',
    type: 'equivalence',
    prompt: 'Hvað af þessu jafngildir 1? (Veldu öll rétt)',
    options: [
      { text: '100 cm / 1 m', correct: true },
      { text: '1 km / 100 m', correct: false },
      { text: '1000 mm / 1 m', correct: true },
      { text: '24 klst / 1 dagur', correct: true },
      { text: '100 g / 1 kg', correct: false }
    ],
    multiSelect: true
  },
  {
    id: 'L1-7',
    type: 'cancellation_prediction',
    prompt: 'Ef þú byrjar með 500 mL og margfaldar með (1 L / 1000 mL), hvað verður eftir?',
    options: ['mL', 'L', 'mL·L', 'mL/L'],
    correct: 1,
    explanationRequired: true,
    explanationOptions: [
      { text: 'Vegna þess að mL strikast út og L verður eftir', correct: true },
      { text: 'Vegna þess að við deildum með 1000', correct: false },
      { text: 'Vegna þess að L er í teljaranum', correct: false }
    ]
  },
  {
    id: 'L1-8',
    type: 'factor_selection',
    prompt: 'Þú þarft að breyta úr km í m. Hvaða stuðul velur þú?',
    factors: [
      { text: '1 km / 1000 m', correct: false },
      { text: '1000 m / 1 km', correct: true }
    ],
    explanationOptions: [
      { text: 'Vegna þess að km þarf að vera í nefnara til að strikast út', correct: true },
      { text: 'Vegna þess að 1000 er stærri tala', correct: false },
      { text: 'Vegna þess að m er minni eining', correct: false }
    ]
  },
  {
    id: 'L1-9',
    type: 'error_identification',
    prompt: 'Jón reyndi að breyta 2 L í mL. Hann notaði (1 L / 1000 mL). Hvað fór úrskeiðis?',
    options: [
      'Hann notaði rangan stuðul',
      'Stuðullinn er rangur snúinn',
      'Hann þurfti fleiri stuðla',
      'Ekkert fór úrskeiðis'
    ],
    correct: 1,
    correctText: 'Stuðullinn er rangur snúinn - L þarf að vera í nefnara',
    visualization: 'Útkoman yrði 0.002 L²/mL í stað 2000 mL'
  },
  {
    id: 'L1-10',
    type: 'conceptual',
    prompt: 'Hvað gerir umbreytingarstuðul svo gagnlegan?',
    options: [
      'Hann breytir magninu',
      'Hann jafngildir 1 svo að margföldun breytir ekki raunverulegu magni',
      'Hann gerir tölurnar stærri',
      'Hann eyðir einingunum'
    ],
    correct: 1
  }
];
