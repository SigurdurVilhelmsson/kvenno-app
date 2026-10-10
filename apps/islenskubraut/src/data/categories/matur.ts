// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     content/islenskubraut/
// Regenerate: pnpm islenskubraut:build
//
// Edit the YAML, not this file. A test fails if this file drifts from it.

import { Category } from '../types';

export const matur: Category = {
  id: 'matur',
  name: 'Matur og drykkur',
  icon: '🍽️',
  description: 'Orðaforði um mat og drykk — tegundir, bragð og undirbúning',
  color: '#E76F51',
  subCategories: [
    {
      name: 'Tegund',
      options: [
        'ávöxtur',
        'grænmeti',
        'kjöt',
        'fiskur',
        'mjólkurvara',
        'sælgæti',
        'brauð/korn',
        'drykkur',
      ],
    },
    {
      name: 'Bragð',
      options: ['sætt', 'salt', 'súrt', 'beiskt', 'kryddað/sterkt'],
    },
    {
      name: 'Áferð/form',
      options: ['mjúkt', 'hart', 'fljótandi', 'þurrt'],
    },
    {
      name: 'Undirbúningur',
      options: ['hrátt', 'soðið', 'steikt', 'bakað', 'heitt', 'kalt', 'frosið'],
    },
    {
      name: 'Hvar',
      options: ['í eldhúsinu', 'í ísskápnum', 'í búðinni', 'á veitingastað'],
    },
    {
      name: 'Hvenær',
      options: [
        'í morgunmat',
        'í hádegismat',
        'í kvöldmat',
        'sem millimál',
        'alltaf/hvenær sem er',
      ],
    },
  ],
  sentenceFrames: [
    {
      level: 'A1',
      frames: ['Þetta er ___.', 'Það er ___.', 'Maður borðar það ___.', 'Maður notar það ___.'],
    },
    {
      level: 'A2',
      frames: [
        'Þetta er ___ sem er ___.',
        'Maður borðar/drekkur það ___.',
        'Það er ___.',
        'Það finnst ___ við snertingu.',
        'Það er gert úr ___.',
        'Maður finnur það ___.',
        'Maður notar það ___.',
      ],
    },
    {
      level: 'B1',
      frames: [
        'Þetta er ___ sem bragðast ___.',
        'Það er oft borðað/drukkið ___.',
        'Mér finnst ___.',
        'Það er ___ að snerta vegna þess að ___.',
        'Það er gert úr ___ sem er ___.',
        '___ nota það oftast ___.',
      ],
    },
  ],
  examples: [
    {
      level: 'A1',
      text: 'Þetta er ávöxtur. Hann er sætur. Maður borðar hann í morgunmat.',
    },
    {
      level: 'A2',
      text: 'Þetta er grænmeti sem er grænt. Maður borðar það hrátt. Það er hollt.',
    },
    {
      level: 'B1',
      text: 'Þetta er ávöxtur sem bragðast sætt og súrt. Hann er oft borðaður sem millimál. Mér finnst hann mjög góður.',
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
      question: 'Hvers konar matur er þetta?',
      icon: '📚',
      answers: [
        {
          level: 'A1',
          options: ['ávöxtur', 'grænmeti', 'kjöt', 'drykkur'],
        },
        {
          level: 'A2',
          options: [
            'ávöxtur',
            'grænmeti',
            'kjöt',
            'fiskur',
            'mjólkurvara',
            'sælgæti',
            'brauð/korn',
            'drykkur',
          ],
        },
        {
          level: 'B1',
          options: [
            'ávöxtur',
            'grænmeti',
            'kjöt',
            'fiskur',
            'mjólkurvara',
            'sælgæti',
            'brauð/korn',
            'drykkur',
            'krydd',
            'sósa',
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
          options: ['rautt', 'grænt', 'gult', 'hvítt'],
        },
        {
          level: 'A2',
          options: ['rautt', 'grænt', 'gult', 'hvítt', 'brúnt', 'appelsínugult', 'stórt', 'lítið'],
        },
        {
          level: 'B1',
          options: [
            'rautt',
            'grænt',
            'gult',
            'hvítt',
            'brúnt',
            'appelsínugult',
            'stórt',
            'lítið',
            'kringlótt',
            'langt',
            'flatt',
          ],
        },
      ],
    },
    {
      question: 'Hvernig bragðast það?',
      icon: '👅',
      answers: [
        {
          level: 'A1',
          options: ['sætt', 'salt', 'súrt', 'beiskt'],
        },
        {
          level: 'A2',
          options: ['sætt', 'salt', 'súrt', 'beiskt', 'kryddað', 'sterkt', 'milt', 'ferskt'],
        },
        {
          level: 'B1',
          options: [
            'sætt',
            'salt',
            'súrt',
            'beiskt',
            'kryddað',
            'sterkt',
            'milt',
            'ferskt',
            'bragðmikið',
            'bragðlaust',
            'mjög sætt',
            'náttúrulega sætt',
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
            'hált',
            'stinnt',
            'sveigjanlegt',
          ],
        },
      ],
    },
    {
      question: 'Hvernig lyktar af því?',
      icon: '👃',
      answers: [
        {
          level: 'A1',
          options: ['gott', 'vont', 'ekkert'],
        },
        {
          level: 'A2',
          options: ['gott', 'vont', 'ekkert', 'ferskt', 'sterkt', 'milt'],
        },
        {
          level: 'B1',
          options: [
            'gott',
            'vont',
            'ekkert',
            'ferskt',
            'sterkt',
            'milt',
            'ilmandi',
            'stingandi',
            'sætt',
            'beiskt',
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
      answers: [
        {
          level: 'A1',
          options: ['til að borða', 'til að drekka'],
        },
        {
          level: 'A2',
          options: ['til að borða', 'til að drekka', 'til að elda með', 'til að baka með'],
        },
        {
          level: 'B1',
          options: [
            'til að borða',
            'til að drekka',
            'til að elda með',
            'til að baka með',
            'til að næra sig',
            'til að njóta',
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
          options: ['allir', 'börn', 'fullorðnir', 'kokkar', 'bakarar'],
        },
        {
          level: 'B1',
          options: [
            'allir',
            'börn',
            'fullorðnir',
            'kokkar',
            'bakarar',
            'sérfræðingar',
            'ferðamenn',
          ],
        },
      ],
    },
    {
      question: 'Hvar er hægt að finna þetta?',
      icon: '📍',
      answers: [
        {
          level: 'A1',
          options: ['heima', 'í búð', 'á veitingastað'],
        },
        {
          level: 'A2',
          options: ['heima', 'í búð', 'á veitingastað', 'í skólanum', 'úti'],
        },
        {
          level: 'B1',
          options: [
            'heima',
            'í búð',
            'á veitingastað',
            'í skólanum',
            'úti',
            'á markaði',
            'í garðinum',
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
