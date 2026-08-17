// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     content/islenskubraut/
// Regenerate: pnpm islenskubraut:build
//
// Edit the YAML, not this file. A test fails if this file drifts from it.

import { Category } from '../types';

export const farartaeki: Category = {
  id: 'farartaeki',
  name: 'Farartæki',
  icon: '🚗',
  description: 'Orðaforði um farartæki — á landi, sjó og í lofti',
  color: '#264653',
  subCategories: [
    {
      name: 'Tegund',
      options: [
        'bíll',
        'rúta',
        'hjól/reiðhjól',
        'mótorhjól',
        'lest',
        'flugvél',
        'skip/bátur',
        'sleði',
        'hlaupahjól',
      ],
    },
    {
      name: 'Hvar fer það',
      options: ['á landi', 'á sjó/vatni', 'í lofti', 'á snjó'],
    },
    {
      name: 'Stærð',
      options: ['lítið', 'meðalstórt', 'stórt', 'risastórt'],
    },
    {
      name: 'Eiginleikar',
      options: ['hefur hjól', 'hefur ekki hjól', 'með vél', 'án vélar', 'hraðvirkt', 'hægvirkt'],
    },
    {
      name: 'Hvenær notað',
      options: ['á veturna', 'á sumrin', 'allt árið', 'í sérstökum tilfellum'],
    },
    {
      name: 'Fjöldi farþega',
      options: ['einn', 'fáir', 'margir'],
    },
  ],
  sentenceFrames: [
    {
      level: 'A1',
      frames: [
        'Þetta er ___.',
        'Það fer ___.',
        'Það er ___.',
        'Það hljómar ___.',
        'Maður notar það til að ___.',
      ],
    },
    {
      level: 'A2',
      frames: [
        'Þetta er ___ sem fer ___.',
        'Það hefur ___ og er ___.',
        'Það finnst ___ við snertingu.',
        'Það er gert úr ___.',
        'Maður finnur það ___.',
        'Maður notar það ___.',
      ],
    },
    {
      level: 'B1',
      frames: [
        'Þetta farartæki er ___ sem er notað til að ___.',
        'Það getur flutt ___ og fer ___.',
        'Það er ___ að snerta vegna þess að ___.',
        'Það er gert úr ___ sem er ___.',
        'Það er oftast notað af ___ til að ___.',
      ],
    },
  ],
  guidingQuestions: [
    {
      question: 'Hvers konar farartæki er þetta?',
      icon: '📚',
      answers: [
        {
          level: 'A1',
          options: ['bíll', 'rúta', 'hjól', 'flugvél', 'skip'],
        },
        {
          level: 'A2',
          options: ['bíll', 'rúta', 'hjól', 'mótorhjól', 'lest', 'flugvél', 'skip/bátur', 'sleði'],
        },
        {
          level: 'B1',
          options: [
            'bíll',
            'rúta',
            'hjól',
            'mótorhjól',
            'lest',
            'flugvél',
            'skip/bátur',
            'sleði',
            'hlaupahjól',
            'sportvagn',
            'þyrla',
          ],
        },
      ],
    },
    {
      question: 'Hvernig lítur það út?',
      icon: '👁️',
      answers: [
        {
          level: 'A1',
          options: ['stórt', 'lítið', 'með hjólum', 'án hjóla'],
        },
        {
          level: 'A2',
          options: ['stórt', 'lítið', 'með hjólum', 'án hjóla', 'langt', 'stutt', 'hátt', 'lágt'],
        },
        {
          level: 'B1',
          options: [
            'stórt',
            'lítið',
            'með hjólum',
            'án hjóla',
            'langt',
            'stutt',
            'hátt',
            'lágt',
            'straumlínulaga',
            'fernt',
            'hraðvirkt',
          ],
        },
      ],
    },
    {
      question: 'Hvaða hljóð gefur það frá sér?',
      icon: '🔊',
      answers: [
        {
          level: 'A1',
          options: ['hátt', 'lágt', 'þögult'],
        },
        {
          level: 'A2',
          options: ['hátt', 'lágt', 'þögult', 'súðar', 'hringir', 'öskrar'],
        },
        {
          level: 'B1',
          options: [
            'hátt',
            'lágt',
            'þögult',
            'súðar',
            'hringir',
            'öskrar',
            'hvæsir',
            'umar',
            'dúnar',
            'þrymir',
          ],
        },
      ],
    },
    {
      question: 'Úr hverju er það gert?',
      icon: '🧱',
      answers: [
        {
          level: 'A1',
          options: ['úr málmi', 'úr plasti', 'úr tré'],
        },
        {
          level: 'A2',
          options: ['úr málmi', 'úr plasti', 'úr tré', 'úr steini', 'úr gleri'],
        },
        {
          level: 'B1',
          options: [
            'úr málmi',
            'úr plasti',
            'úr tré',
            'úr steini',
            'úr gleri',
            'úr endurunnru efni',
            'úr náttúrulegum efnum',
            'úr gerviefnum',
          ],
        },
      ],
    },
    {
      question: 'Hvaða lögun hefur það?',
      icon: '🔷',
      answers: [
        {
          level: 'A1',
          options: ['stórt', 'lítið', 'kringlótt', 'fernt'],
        },
        {
          level: 'A2',
          options: [
            'stórt',
            'lítið',
            'kringlótt',
            'fernt',
            'langt',
            'stutt',
            'hátt',
            'lágt',
            'flatt',
            'þykkt',
          ],
        },
        {
          level: 'B1',
          options: [
            'stórt',
            'lítið',
            'kringlótt',
            'fernt',
            'langt',
            'stutt',
            'hátt',
            'lágt',
            'flatt',
            'þykkt',
            'sporöskjulaga',
            'þríhyrningslaga',
            'sívalningslaga',
            'óreglulegt',
          ],
        },
      ],
    },
    {
      question: 'Til hvers er það notað?',
      icon: '🎯',
      answers: [
        {
          level: 'A1',
          options: ['til að ferðast', 'til að flytja', 'til að leika sér'],
        },
        {
          level: 'A2',
          options: ['til að ferðast', 'til að flytja', 'til að leika sér', 'til að vinna'],
        },
        {
          level: 'B1',
          options: [
            'til að ferðast',
            'til að flytja',
            'til að leika sér',
            'til að vinna',
            'til að keppa',
            'til að bjarga',
          ],
        },
      ],
    },
    {
      question: 'Hver notar þetta?',
      icon: '👤',
      answers: [
        {
          level: 'A1',
          options: ['allir', 'börn', 'fullorðnir'],
        },
        {
          level: 'A2',
          options: ['allir', 'börn', 'fullorðnir', 'bílstjórar', 'flugmenn', 'sjómenn'],
        },
        {
          level: 'B1',
          options: [
            'allir',
            'börn',
            'fullorðnir',
            'bílstjórar',
            'flugmenn',
            'sjómenn',
            'sérfræðingar',
            'ferðamenn',
            'iðnaðarmenn',
          ],
        },
      ],
    },
    {
      question: 'Hvar er hægt að nota/finna þetta?',
      icon: '📍',
      answers: [
        {
          level: 'A1',
          options: ['á götunni', 'á sjónum', 'í loftinu'],
        },
        {
          level: 'A2',
          options: ['á götunni', 'á sjónum', 'í loftinu', 'á þjóðveginum', 'á flugvellinum'],
        },
        {
          level: 'B1',
          options: [
            'á götunni',
            'á sjónum',
            'í loftinu',
            'á þjóðveginum',
            'á flugvellinum',
            'í höfninni',
            'á lestarbraut',
          ],
        },
      ],
    },
    {
      question: 'Hvenær er þetta notað?',
      icon: '🕐',
      answers: [
        {
          level: 'A1',
          options: ['á morgnana', 'á daginn', 'á kvöldin', 'alltaf'],
        },
        {
          level: 'A2',
          options: [
            'á morgnana',
            'á daginn',
            'á kvöldin',
            'alltaf',
            'á veturna',
            'á sumrin',
            'um helgar',
            'á virkum dögum',
          ],
        },
        {
          level: 'B1',
          options: [
            'á morgnana',
            'á daginn',
            'á kvöldin',
            'alltaf',
            'á veturna',
            'á sumrin',
            'um helgar',
            'á virkum dögum',
            'í sérstökum tilvikum',
            'í hátíðum',
            'daglega',
            'sjaldan',
            'oft',
          ],
        },
      ],
    },
  ],
};
