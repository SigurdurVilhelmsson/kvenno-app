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
      options: ['hjól', 'ekki hjól', 'með vél', 'án vélar', 'hraðskreitt', 'hægfara'],
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
        'Maður notar það ___.',
      ],
    },
    {
      level: 'A2',
      frames: [
        'Þetta er ___ sem fer ___.',
        'Það hefur ___ og er ___.',
        'Það finnst ___ við snertingu.',
        'Það er gert ___.',
        'Maður finnur það ___.',
        'Maður notar það ___.',
      ],
    },
    {
      level: 'B1',
      frames: [
        'Þetta farartæki er ___ sem er notað ___.',
        'Það getur flutt ___ og fer ___.',
        'Það er ___ að snerta vegna þess að ___.',
        'Það er gert ___ sem er ___.',
        '___ nota það oftast ___.',
      ],
    },
  ],
  examples: [
    {
      level: 'A1',
      text: 'Þetta er bíll. Hann fer á landi. Hann er stór.',
    },
    {
      level: 'A2',
      text: 'Þetta er skip sem fer á sjó. Það hefur ekki hjól og er stórt.',
    },
    {
      level: 'B1',
      text: 'Þetta farartæki er flugvél sem er notuð til að ferðast langar leiðir. Hún getur flutt marga og fer í lofti.',
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
      question: 'Hvers konar farartæki er þetta?',
      icon: '📚',
      label: 'Flokkar',
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
      label: 'Útlit',
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
            'ferkantað',
            'litríkt',
          ],
        },
      ],
    },
    {
      question: 'Hvaða hljóð gefur það frá sér?',
      icon: '🔊',
      label: 'Hljóð',
      answers: [
        {
          level: 'A1',
          options: ['hátt', 'lágt', 'þögult'],
        },
        {
          level: 'A2',
          options: ['hátt', 'lágt', 'þögult', 'suðar', 'hringir', 'öskrar'],
        },
        {
          level: 'B1',
          options: ['hátt', 'lágt', 'þögult', 'suðar', 'hringir', 'öskrar', 'hvæsir'],
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
      context: {
        kind: 'hvar',
        color: '#B91C1C',
      },
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
