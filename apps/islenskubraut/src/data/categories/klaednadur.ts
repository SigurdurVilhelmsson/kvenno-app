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
  color: '#A6500C',
  subCategories: [
    {
      name: 'Tegund',
      options: [
        'bolur/stuttermabolur',
        'peysa',
        'skyrta',
        'buxur',
        'pils',
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
        'rauður/rauð/rautt',
        'blár/blá/blátt',
        'grænn/græn/grænt',
        'gulur/gul/gult',
        'svartur/svört/svart',
        'hvítur/hvít/hvítt',
        'bleikur/bleik/bleikt',
        'brúnn/brún/brúnt',
      ],
    },
    {
      name: 'Litur í fleirtölu',
      options: [
        'rauðir/rauðar',
        'bláir/bláar',
        'grænir/grænar',
        'gulir/gular',
        'svartir/svartar',
        'hvítir/hvítar',
        'bleikir/bleikar',
        'brúnir/brúnar',
      ],
    },
    {
      name: 'Efni',
      options: ['úr ull', 'úr bómull', 'úr leðri', 'úr plasti'],
    },
    {
      name: 'Hvenær',
      options: ['á veturna', 'á sumrin', 'allt árið', 'þegar rignir', 'við sérstök tilefni'],
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
      frames: ['Þetta er ___.', 'Það er ___.', 'Maður notar það ___.'],
    },
    {
      level: 'A2',
      frames: [
        'Þetta er ___ sem er ___.',
        'Maður klæðist því ___.',
        'Það finnst ___ við snertingu.',
        'Það er gert ___.',
        'Maður finnur það ___.',
        'Maður notar það ___.',
      ],
    },
    {
      level: 'B1',
      frames: [
        'Þetta er ___ sem er ___. Maður notar það ___.',
        'Það er ___ og hentar vel ___.',
        'Það er ___ að snerta vegna þess að ___.',
        'Það er gert ___ sem er ___.',
        '___ nota það oftast ___.',
      ],
    },
  ],
  examples: [
    {
      level: 'A1',
      text: 'Þetta er úlpa. Hún er blá.',
    },
    {
      level: 'A2',
      text: 'Þetta er peysa sem er rauð. Maður klæðist henni á veturna.',
    },
    {
      level: 'B1',
      text: 'Þetta er jakki sem er úr leðri. Maður notar hann á veturna. Hann er svartur og hentar vel í kulda.',
    },
  ],
  teacherNotes: [
    {
      level: 'A1',
      text: 'Nemandi bendir á orð af spjaldinu og myndar einfaldar setningar. Hjálpið nemandanum að velja rétt orð og segja heila setningu. Fornafnið fer eftir kyni orðsins: bíll → hann, úlpa → hún, skip → það.',
    },
    {
      level: 'A2',
      text: 'Nemandi tengir saman tvær eða þrjár setningar. Hvetjið nemandann til að nota mismunandi orð úr undirflokkunum.',
    },
    {
      level: 'B1',
      text: 'Nemandi notar setningaramma sem grunn en bætir við eigin hugmyndum. Hvetjið til samanburðar og rökstuðnings.',
    },
  ],
  guidingQuestions: [
    {
      question: 'Hvers konar klæðnaður er þetta?',
      icon: '📚',
      label: 'Flokkar',
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
            'pils',
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
            'pils',
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
      label: 'Útlit',
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
      label: 'Áferð',
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
            'hált',
            'stinnt',
            'sveigjanlegt',
          ],
        },
      ],
    },
    {
      question: 'Úr hverju er það gert?',
      icon: '🧱',
      label: 'Efniviður',
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
            'úr endurunnu efni',
            'úr náttúrulegum efnum',
            'úr gerviefnum',
          ],
        },
      ],
    },
    {
      question: 'Hvaða lögun hefur það?',
      icon: '🔷',
      label: 'Lögun',
      answers: [
        {
          level: 'A1',
          options: ['kringlótt', 'ferkantað', 'ílangt', 'flatt'],
        },
        {
          level: 'A2',
          options: [
            'kringlótt',
            'ferkantað',
            'ílangt',
            'flatt',
            'kúlulaga',
            'oddhvasst',
            'bogið',
            'beint',
          ],
        },
        {
          level: 'B1',
          options: [
            'kringlótt',
            'ferkantað',
            'ílangt',
            'flatt',
            'kúlulaga',
            'oddhvasst',
            'bogið',
            'beint',
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
      context: {
        kind: 'notagildi',
        color: '#1D4ED8',
      },
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
            'til að líða vel',
          ],
        },
      ],
    },
    {
      question: 'Hver notar þetta?',
      icon: '👤',
      context: {
        kind: 'hver',
        color: '#C2410C',
      },
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
      context: {
        kind: 'hvar',
        color: '#B91C1C',
      },
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
      context: {
        kind: 'hvenaer',
        color: '#107837',
      },
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
