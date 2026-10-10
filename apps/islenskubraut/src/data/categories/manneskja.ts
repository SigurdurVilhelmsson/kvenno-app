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
      options: ['á lífi', 'látin/látinn', 'skálduð persóna'],
    },
    {
      name: 'Frægð',
      options: ['fræg/frægur', 'ekki fræg/frægur'],
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
      options: ['barn', 'unglingur', 'fullorðin/fullorðinn', 'öldruð/aldraður'],
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
        'sköllótt/sköllóttur',
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
      frames: ['Þetta er ___.', 'Hún/Hann er ___.', 'Hún/Hann ___.'],
    },
    {
      level: 'A2',
      frames: [
        'Þetta er ___ sem er ___.',
        'Hún/Hann er ___ og ___.',
        'Hún/Hann vinnur sem ___.',
        'Hún/Hann er oft ___.',
      ],
    },
    {
      level: 'B1',
      frames: [
        'Ég held að þetta sé ___ vegna þess að ___.',
        'Þessi manneskja er ___ og er þekkt/óþekkt fyrir ___.',
        'Hún/Hann er oft ___ vegna þess að ___.',
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
          options: ['barn', 'fullorðin/fullorðinn', 'gamall/gömul'],
        },
        {
          level: 'A2',
          options: [
            'barn',
            'unglingur',
            'fullorðin/fullorðinn',
            'öldruð/aldraður',
            'fræg/frægur',
            'ekki fræg/frægur',
          ],
        },
        {
          level: 'B1',
          options: [
            'barn',
            'unglingur',
            'fullorðin/fullorðinn',
            'öldruð/aldraður',
            'fræg/frægur',
            'ekki fræg/frægur',
            'á lífi',
            'látin/látinn',
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
            'sköllótt/sköllóttur',
            'með gleraugu',
            'með skegg',
            'án skeggs',
          ],
        },
      ],
    },
    {
      question: 'Hvað gerir hún/hann?',
      icon: '🎯',
      answers: [
        {
          level: 'A1',
          options: ['vinnur', 'lærir', 'leikur sér'],
        },
        {
          level: 'A2',
          options: ['vinnur', 'lærir', 'leikur sér', 'syngur', 'læknar', 'kennir'],
        },
        {
          level: 'B1',
          options: [
            'vinnur',
            'lærir',
            'leikur sér',
            'syngur',
            'læknar',
            'kennir',
            'stjórnar',
            'skapar',
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
            'á hátíðum',
            'daglega',
            'sjaldan',
            'oft',
          ],
        },
      ],
    },
  ],
};
