// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     content/islenskubraut/
// Regenerate: pnpm islenskubraut:build
//
// Edit the YAML, not this file. A test fails if this file drifts from it.

import { Category } from '../types';

export const klaednadur: Category = {
  id: 'klaednadur',
  name: 'Föt og klæðnaður',
  icon: '👕',
  description: 'Orðaforði um föt — tegundir, litir, efni og hvenær þau eru notuð',
  color: '#F4A261',
  subCategories: [
    {
      name: 'Tegund',
      options: [
        'bolur/stuttermabolur',
        'peysa',
        'skyrta',
        'buxur',
        'pilsið/pils',
        'jakki',
        'úlpa',
        'sokkar',
        'skór',
        'húfa',
        'hanskar',
        'trefill',
      ],
    },
    {
      name: 'Litur',
      options: [
        'rauður/rautt',
        'blár/blátt',
        'grænn/grænt',
        'gulur/gult',
        'svartur/svart',
        'hvítur/hvítt',
        'bleikur/bleikt',
        'brúnn/brúnt',
      ],
    },
    {
      name: 'Efni',
      options: ['úr ull', 'úr bómull', 'úr leðri', 'úr plasti'],
    },
    {
      name: 'Hvenær',
      options: ['á veturna', 'á sumrin', 'allt árið', 'þegar rignir', 'í sérstakar tilefni'],
    },
    {
      name: 'Á hvaða líkamshluta',
      options: [
        'á höfðinu',
        'á efri hluta líkamans',
        'á neðri hluta líkamans',
        'á fótunum',
        'á höndunum',
      ],
    },
  ],
  sentenceFrames: [
    {
      level: 'A1',
      frames: ['Þetta er ___.', 'Það er ___.', 'Það er ___.', 'Maður notar það til að ___.'],
    },
    {
      level: 'A2',
      frames: [
        'Þetta er ___ sem er ___.',
        'Maður klæðist því ___.',
        'Það finnst ___ við snertingu.',
        'Það er gert úr ___.',
        'Maður finnur það ___.',
        'Maður notar það ___.',
      ],
    },
    {
      level: 'B1',
      frames: [
        'Þetta er ___ úr ___ sem maður notar ___.',
        'Það er ___ og hentar vel ___.',
        'Það er ___ að snerta vegna þess að ___.',
        'Það er gert úr ___ sem er ___.',
        'Það er oftast notað af ___ til að ___.',
      ],
    },
  ],
  guidingQuestions: [
    {
      question: 'Hvers konar klæðnaður er þetta?',
      icon: '📚',
      answers: [
        {
          level: 'A1',
          options: ['bolur', 'buxur', 'jakki', 'skór'],
        },
        {
          level: 'A2',
          options: [
            'bolur',
            'peysa',
            'skyrta',
            'buxur',
            'pilsið',
            'jakki',
            'úlpa',
            'sokkar',
            'skór',
            'húfa',
          ],
        },
        {
          level: 'B1',
          options: [
            'bolur',
            'peysa',
            'skyrta',
            'buxur',
            'pilsið',
            'jakki',
            'úlpa',
            'sokkar',
            'skór',
            'húfa',
            'hanskar',
            'trefill',
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
          options: ['rautt', 'blátt', 'grænt', 'svart', 'hvítt'],
        },
        {
          level: 'A2',
          options: [
            'rautt',
            'blátt',
            'grænt',
            'svart',
            'hvítt',
            'gult',
            'bleikt',
            'brúnt',
            'stórt',
            'lítið',
          ],
        },
        {
          level: 'B1',
          options: [
            'rautt',
            'blátt',
            'grænt',
            'svart',
            'hvítt',
            'gult',
            'bleikt',
            'brúnt',
            'stórt',
            'lítið',
            'mynstur',
            'einlitt',
          ],
        },
      ],
    },
    {
      question: 'Hvernig finnst það við snertingu?',
      icon: '✋',
      answers: [
        {
          level: 'A1',
          options: ['mjúkt', 'hart', 'slétt', 'gróft'],
        },
        {
          level: 'A2',
          options: [
            'mjúkt',
            'hart',
            'slétt',
            'gróft',
            'þungt',
            'létt',
            'heitt',
            'kalt',
            'blautt',
            'þurrt',
          ],
        },
        {
          level: 'B1',
          options: [
            'mjúkt',
            'hart',
            'slétt',
            'gróft',
            'þungt',
            'létt',
            'heitt',
            'kalt',
            'blautt',
            'þurrt',
            'loðið',
            'hálkt',
            'stinnt',
            'sveigjanlegt',
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
          options: ['úr ull', 'úr bómull', 'úr leðri', 'úr plasti'],
        },
        {
          level: 'A2',
          options: [
            'úr ull',
            'úr bómull',
            'úr leðri',
            'úr plasti',
            'úr tré',
            'úr málmi',
            'úr steini',
            'úr gleri',
          ],
        },
        {
          level: 'B1',
          options: [
            'úr ull',
            'úr bómull',
            'úr leðri',
            'úr plasti',
            'úr tré',
            'úr málmi',
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
          options: ['til að hlýja sér', 'til að verja sig', 'til að líta vel út'],
        },
        {
          level: 'A2',
          options: [
            'til að hlýja sér',
            'til að verja sig',
            'til að líta vel út',
            'til að stunda íþróttir',
          ],
        },
        {
          level: 'B1',
          options: [
            'til að hlýja sér',
            'til að verja sig',
            'til að líta vel út',
            'til að stunda íþróttir',
            'til að vinna',
            'til að vera þægilegur',
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
          options: ['allir', 'börn', 'fullorðnir', 'nemendur', 'íþróttamenn'],
        },
        {
          level: 'B1',
          options: [
            'allir',
            'börn',
            'fullorðnir',
            'nemendur',
            'íþróttamenn',
            'sérfræðingar',
            'listamenn',
            'ferðamenn',
            'iðnaðarmenn',
          ],
        },
      ],
    },
    {
      question: 'Hvar er hægt að nota þetta?',
      icon: '📍',
      answers: [
        {
          level: 'A1',
          options: ['inni', 'úti', 'í skólanum'],
        },
        {
          level: 'A2',
          options: ['inni', 'úti', 'í skólanum', 'í vinnunni', 'í íþróttum'],
        },
        {
          level: 'B1',
          options: [
            'inni',
            'úti',
            'í skólanum',
            'í vinnunni',
            'í íþróttum',
            'á hátíð',
            'á ferðalagi',
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
