// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     content/islenskubraut/
// Regenerate: pnpm islenskubraut:build
//
// Edit the YAML, not this file. A test fails if this file drifts from it.

import { Category } from '../types';

export const manneskja: Category = {
  id: 'manneskja',
  name: 'Manneskja',
  icon: '👤',
  description: 'Orðaforði um fólk — útlit, starf og athafnir',
  color: '#7B2CBF',
  subCategories: [
    {
      name: 'Staða',
      options: ['á lífi', 'látin', 'skálduð persóna'],
    },
    {
      name: 'Frægð',
      options: ['fræg', 'ekki fræg'],
    },
    {
      name: 'Starf/hlutverk',
      options: [
        'leikari',
        'íþróttamaður',
        'söngvari',
        'stjórnmálamaður',
        'nemandi',
        'kennari',
        'læknir',
        'lögreglumaður',
        'kokkur',
        'listamaður',
      ],
    },
    {
      name: 'Aldur',
      options: ['barn', 'unglingur', 'fullorðinn', 'aldraður/öldruð'],
    },
    {
      name: 'Útlit',
      options: [
        'há/hár',
        'lág/lágur',
        'ung/ungur',
        'gömul/gamall',
        'með sítt hár',
        'með stutt hár',
        'sköllótt',
        'með gleraugu',
        'án gleraugna',
        'með skegg',
        'án skeggs',
      ],
    },
    {
      name: 'Athafnir',
      options: ['vinnur', 'lærir', 'syngur', 'spilar', 'ferðast', 'eldar', 'les', 'teiknar'],
    },
  ],
  sentenceFrames: [
    {
      level: 'A1',
      frames: ['Þetta er ___.', 'Hún/Hann er ___.', 'Hún/Hann ___.', 'Maður notar það til að ___.'],
    },
    {
      level: 'A2',
      frames: [
        'Þetta er ___ sem er ___.',
        'Hún/Hann er ___ og ___.',
        'Hún/Hann vinnur sem ___.',
        'Maður finnur það ___.',
        'Maður notar það ___.',
      ],
    },
    {
      level: 'B1',
      frames: [
        'Ég held að þetta sé ___ vegna þess að ___.',
        'Þessi manneskja er ___ og er þekkt/óþekkt fyrir ___.',
        'Það er oftast notað af ___ til að ___.',
      ],
    },
  ],
  guidingQuestions: [
    {
      question: 'Hvers konar manneskja er þetta?',
      icon: '📚',
      answers: [
        {
          level: 'A1',
          options: ['barn', 'fullorðinn', 'gamall/gömul'],
        },
        {
          level: 'A2',
          options: ['barn', 'unglingur', 'fullorðinn', 'aldraður/öldruð', 'fræg', 'ekki fræg'],
        },
        {
          level: 'B1',
          options: [
            'barn',
            'unglingur',
            'fullorðinn',
            'aldraður/öldruð',
            'fræg',
            'ekki fræg',
            'á lífi',
            'látin',
            'skálduð persóna',
          ],
        },
      ],
    },
    {
      question: 'Hvernig lítur hún/hann út?',
      icon: '👁️',
      answers: [
        {
          level: 'A1',
          options: ['há/hár', 'lág/lágur', 'ung/ungur', 'gömul/gamall'],
        },
        {
          level: 'A2',
          options: [
            'há/hár',
            'lág/lágur',
            'ung/ungur',
            'gömul/gamall',
            'með sítt hár',
            'með stutt hár',
            'með gleraugu',
          ],
        },
        {
          level: 'B1',
          options: [
            'há/hár',
            'lág/lágur',
            'ung/ungur',
            'gömul/gamall',
            'með sítt hár',
            'með stutt hár',
            'sköllótt',
            'með gleraugu',
            'með skegg',
            'án skeggs',
          ],
        },
      ],
    },
    {
      question: 'Fyrir hvað er manneskjan þekkt?',
      icon: '🎯',
      answers: [
        {
          level: 'A1',
          options: ['til að vinna', 'til að læra', 'til að leika sér'],
        },
        {
          level: 'A2',
          options: [
            'til að vinna',
            'til að læra',
            'til að leika sér',
            'til að syngja',
            'til að lækna',
            'til að kenna',
          ],
        },
        {
          level: 'B1',
          options: [
            'til að vinna',
            'til að læra',
            'til að leika sér',
            'til að syngja',
            'til að lækna',
            'til að kenna',
            'til að stjórna',
            'til að skapa',
          ],
        },
      ],
    },
    {
      question: 'Hvar er hægt að finna þessa manneskju?',
      icon: '📍',
      answers: [
        {
          level: 'A1',
          options: ['heima', 'í vinnunni', 'í skólanum'],
        },
        {
          level: 'A2',
          options: ['heima', 'í vinnunni', 'í skólanum', 'á sjúkrahúsi', 'á leikvelli'],
        },
        {
          level: 'B1',
          options: [
            'heima',
            'í vinnunni',
            'í skólanum',
            'á sjúkrahúsi',
            'á leikvelli',
            'á sviði',
            'í sjónvarpi',
            'á ferðalagi',
          ],
        },
      ],
    },
    {
      question: 'Hvenær er hún/hann virk/virkur?',
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
