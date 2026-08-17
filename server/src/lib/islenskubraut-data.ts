// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     apps/islenskubraut/src/data/
// Regenerate: pnpm generate:islenskubraut-data
//
// The server cannot import the Íslenskubraut SPA, so the category data is copied here.
// This copy previously drifted and shipped corrupted Icelandic onto student teaching
// cards. Edit the source above and re-run the generator; a test fails if these diverge.

import type { Category } from '../types/index.js';

export const categories: Category[] = [
  {
    id: 'dyr',
    name: 'Dýr',
    icon: '🐾',
    description: 'Orðaforði um dýr — gæludýr, villt dýr og húsdýr',
    color: '#2D6A4F',
    subCategories: [
      {
        name: 'Tegund',
        options: ['gæludýr', 'villt dýr', 'húsdýr (búfénaður)'],
      },
      {
        name: 'Líffræðilegur flokkur',
        options: ['spendýr', 'fugl', 'fiskur', 'skriðdýr', 'froskdýr', 'skordýr'],
      },
      {
        name: 'Búsvæði',
        options: ['á landi', 'í vatni', 'í lofti', 'á landi og í vatni'],
      },
      {
        name: 'Útlit',
        options: [
          'hefur feld',
          'hefur fjaðrir',
          'hefur hreistur',
          'hefur hala',
          'hefur gogg',
          'hefur horn',
          'hefur fjóra fætur',
          'hefur tvo fætur',
          'flýgur',
          'syndir',
          'hleypur',
        ],
      },
      {
        name: 'Stærð',
        options: ['lítið', 'meðalstórt', 'stórt', 'mjög stórt'],
      },
      {
        name: 'Fæða',
        options: ['étur plöntur (grasæta)', 'étur kjöt (kjötæta)', 'étur bæði (alæta)'],
      },
    ],
    sentenceFrames: [
      {
        level: 'A1',
        frames: [
          'Þetta er dýr.',
          'Það er ___.',
          'Það hefur ___.',
          'Það er ___.',
          'Það hljómar ___.',
          'Maður notar það til að ___.',
        ],
      },
      {
        level: 'A2',
        frames: [
          'Þetta er ___ sem býr ___.',
          'Það hefur ___ og ___.',
          'Það étur ___.',
          'Það finnst ___ við snertingu.',
          'Maður finnur það ___.',
          'Maður notar það ___.',
        ],
      },
      {
        level: 'B1',
        frames: [
          'Ég held að þetta sé ___ vegna þess að ___.',
          'Þetta dýr er ___ og ___.',
          'Það er líkt ___ en ólíkt ___.',
          'Það er ___ að snerta vegna þess að ___.',
          'Það er oftast notað af ___ til að ___.',
        ],
      },
    ],
    guidingQuestions: [
      {
        question: 'Hvers konar dýr er þetta?',
        icon: '📚',
        answers: [
          {
            level: 'A1',
            options: ['gæludýr', 'villt dýr', 'húsdýr'],
          },
          {
            level: 'A2',
            options: ['gæludýr', 'villt dýr', 'húsdýr', 'spendýr', 'fugl', 'fiskur'],
          },
          {
            level: 'B1',
            options: [
              'gæludýr',
              'villt dýr',
              'húsdýr',
              'spendýr',
              'fugl',
              'fiskur',
              'skriðdýr',
              'froskdýr',
              'skordýr',
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
            options: ['feldur', 'fjaðrir', 'hreistur', 'hali'],
          },
          {
            level: 'A2',
            options: [
              'feldur',
              'fjaðrir',
              'hreistur',
              'hali',
              'goggur',
              'horn',
              'fjórir fætur',
              'tveir fætur',
            ],
          },
          {
            level: 'B1',
            options: [
              'feldur',
              'fjaðrir',
              'hreistur',
              'hali',
              'goggur',
              'horn',
              'fjórir fætur',
              'tveir fætur',
              'flýgur',
              'syndir',
              'hleypur',
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
            options: ['mjúkt', 'hart', 'slétt', 'gróft', 'þungt', 'létt', 'blautt', 'þurrt'],
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
        question: 'Hvaða hljóð gefur það frá sér?',
        icon: '🔊',
        answers: [
          {
            level: 'A1',
            options: ['hátt', 'lágt', 'þögult'],
          },
          {
            level: 'A2',
            options: ['hátt', 'lágt', 'þögult', 'gelur', 'mjallar', 'öskrar', 'súðar', 'hringir'],
          },
          {
            level: 'B1',
            options: [
              'hátt',
              'lágt',
              'þögult',
              'gelur',
              'mjallar',
              'öskrar',
              'súðar',
              'hringir',
              'hvæsir',
              'umar',
              'dúnar',
              'þrymir',
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
            options: ['til að gæta', 'til að klappa', 'til að borða'],
          },
          {
            level: 'A2',
            options: [
              'til að gæta',
              'til að klappa',
              'til að borða',
              'til að hjálpa',
              'til að vinna',
              'til að leika sér',
            ],
          },
          {
            level: 'B1',
            options: [
              'til að gæta',
              'til að klappa',
              'til að borða',
              'til að hjálpa',
              'til að vinna',
              'til að leika sér',
              'til að verja',
              'til að rannsaka',
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
            options: ['allir', 'börn', 'fullorðnir', 'bændur', 'dýralæknar', 'veiðimenn'],
          },
          {
            level: 'B1',
            options: [
              'allir',
              'börn',
              'fullorðnir',
              'bændur',
              'dýralæknar',
              'veiðimenn',
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
            options: ['heima', 'úti', 'á bæ'],
          },
          {
            level: 'A2',
            options: ['heima', 'úti', 'á bæ', 'í dýragarðinum', 'í náttúrunni', 'í sjónum'],
          },
          {
            level: 'B1',
            options: [
              'heima',
              'úti',
              'á bæ',
              'í dýragarðinum',
              'í náttúrunni',
              'í sjónum',
              'á hálendinu',
              'í skóginum',
            ],
          },
        ],
      },
      {
        question: 'Hvenær er þetta sést?',
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
              'í sérstökum tilvikum',
              'daglega',
              'sjaldan',
              'oft',
            ],
          },
        ],
      },
    ],
  },
  {
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
        frames: [
          'Þetta er ___.',
          'Það er ___.',
          'Maður borðar það ___.',
          'Það er ___.',
          'Maður notar það til að ___.',
        ],
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
          'Það er oftast notað af ___ til að ___.',
        ],
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
            options: [
              'rautt',
              'grænt',
              'gult',
              'hvítt',
              'brúnt',
              'appelsínugult',
              'stórt',
              'lítið',
            ],
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
              'sælgæti-sætt',
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
              'hálkt',
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
              'í hátíðum',
              'daglega',
              'sjaldan',
              'oft',
            ],
          },
        ],
      },
    ],
  },
  {
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
            options: [
              'bíll',
              'rúta',
              'hjól',
              'mótorhjól',
              'lest',
              'flugvél',
              'skip/bátur',
              'sleði',
            ],
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
  },
  {
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
        frames: [
          'Þetta er ___.',
          'Hún/Hann er ___.',
          'Hún/Hann ___.',
          'Maður notar það til að ___.',
        ],
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
        question: 'Hvaða lögun hefur það?',
        icon: '🔷',
        answers: [
          {
            level: 'A1',
            options: ['stórt', 'lítið', 'hátt', 'lágt'],
          },
          {
            level: 'A2',
            options: ['stórt', 'lítið', 'hátt', 'lágt', 'langt', 'stutt', 'þykkt', 'mjótt'],
          },
          {
            level: 'B1',
            options: [
              'stórt',
              'lítið',
              'hátt',
              'lágt',
              'langt',
              'stutt',
              'þykkt',
              'mjótt',
              'sporöskjulaga',
              'kringlótt',
            ],
          },
        ],
      },
      {
        question: 'Til hvers er hún/hann þekktur?',
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
        question: 'Hver notar þetta?',
        icon: '👤',
        answers: [
          {
            level: 'A1',
            options: ['allir', 'börn', 'fullorðnir'],
          },
          {
            level: 'A2',
            options: [
              'allir',
              'börn',
              'fullorðnir',
              'nemendur',
              'kennarar',
              'læknar',
              'íþróttamenn',
            ],
          },
          {
            level: 'B1',
            options: [
              'allir',
              'börn',
              'fullorðnir',
              'nemendur',
              'kennarar',
              'læknar',
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
  },
  {
    id: 'stadir',
    name: 'Staðir og byggingar',
    icon: '🏠',
    description: 'Orðaforði um staði — tegundir bygginga og hvað maður gerir þar',
    color: '#C1121F',
    subCategories: [
      {
        name: 'Tegund',
        options: [
          'hús',
          'íbúð',
          'skóli',
          'sjúkrahús',
          'búð/verslun',
          'veitingastaður',
          'safn',
          'kirkja',
          'sundlaug',
          'leikvöllur',
        ],
      },
      {
        name: 'Staðsetning',
        options: [
          'í bænum/borginni',
          'í úthverfi',
          'á landi/sveitinni',
          'við sjóinn',
          'í fjöllunum',
        ],
      },
      {
        name: 'Stærð',
        options: ['lítill/lítið', 'meðalstór/meðalstórt', 'stór/stórt'],
      },
      {
        name: 'Hvað gerir maður þar',
        options: ['borðar', 'verslar', 'syndir', 'lærir', 'vinnur', 'sefur', 'leikur sér'],
      },
    ],
    sentenceFrames: [
      {
        level: 'A1',
        frames: ['Þetta er ___.', 'Maður ___ þar.', 'Það er ___.', 'Maður notar það til að ___.'],
      },
      {
        level: 'A2',
        frames: [
          'Þetta er ___ sem er ___.',
          'Maður fer þangað til að ___.',
          'Það er gert úr ___.',
          'Maður finnur það ___.',
          'Maður notar það ___.',
        ],
      },
      {
        level: 'B1',
        frames: [
          'Þetta er ___ sem er staðsett ___.',
          'Fólk fer þangað til að ___ og ___.',
          'Það er ___ að snerta vegna þess að ___.',
          'Það er gert úr ___ sem er ___.',
          'Það er oftast notað af ___ til að ___.',
        ],
      },
    ],
    guidingQuestions: [
      {
        question: 'Hvers konar staður er þetta?',
        icon: '📚',
        answers: [
          {
            level: 'A1',
            options: ['hús', 'skóli', 'búð', 'sundlaug'],
          },
          {
            level: 'A2',
            options: [
              'hús',
              'íbúð',
              'skóli',
              'sjúkrahús',
              'búð/verslun',
              'veitingastaður',
              'safn',
              'kirkja',
              'sundlaug',
              'leikvöllur',
            ],
          },
          {
            level: 'B1',
            options: [
              'hús',
              'íbúð',
              'skóli',
              'sjúkrahús',
              'búð/verslun',
              'veitingastaður',
              'safn',
              'kirkja',
              'sundlaug',
              'leikvöllur',
              'bókasafn',
              'íþróttahús',
            ],
          },
        ],
      },
      {
        question: 'Hvernig lítur þetta út?',
        icon: '👁️',
        answers: [
          {
            level: 'A1',
            options: ['stórt', 'lítið', 'hátt', 'lágt'],
          },
          {
            level: 'A2',
            options: ['stórt', 'lítið', 'hátt', 'lágt', 'gamalt', 'nýtt', 'fallegt', 'ljótt'],
          },
          {
            level: 'B1',
            options: [
              'stórt',
              'lítið',
              'hátt',
              'lágt',
              'gamalt',
              'nýtt',
              'fallegt',
              'ljótt',
              'nútímalegt',
              'sögulegt',
            ],
          },
        ],
      },
      {
        question: 'Hvernig lyktar þar?',
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
        question: 'Úr hverju er það gert?',
        icon: '🧱',
        answers: [
          {
            level: 'A1',
            options: ['úr tré', 'úr steini', 'úr málmi'],
          },
          {
            level: 'A2',
            options: ['úr tré', 'úr steini', 'úr málmi', 'úr gleri', 'úr plasti'],
          },
          {
            level: 'B1',
            options: [
              'úr tré',
              'úr steini',
              'úr málmi',
              'úr gleri',
              'úr plasti',
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
        question: 'Til hvers er þetta notað?',
        icon: '🎯',
        answers: [
          {
            level: 'A1',
            options: ['til að búa', 'til að læra', 'til að versla'],
          },
          {
            level: 'A2',
            options: [
              'til að búa',
              'til að læra',
              'til að versla',
              'til að vinna',
              'til að hvílast',
            ],
          },
          {
            level: 'B1',
            options: [
              'til að búa',
              'til að læra',
              'til að versla',
              'til að vinna',
              'til að hvílast',
              'til að stunda íþróttir',
              'til að skemmta sér',
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
            options: ['allir', 'börn', 'fullorðnir', 'nemendur', 'kennarar', 'læknar'],
          },
          {
            level: 'B1',
            options: [
              'allir',
              'börn',
              'fullorðnir',
              'nemendur',
              'kennarar',
              'læknar',
              'sérfræðingar',
              'listamenn',
              'ferðamenn',
              'iðnaðarmenn',
            ],
          },
        ],
      },
      {
        question: 'Hvar er þetta?',
        icon: '📍',
        answers: [
          {
            level: 'A1',
            options: ['í bænum', 'úti á landi', 'við sjóinn'],
          },
          {
            level: 'A2',
            options: ['í bænum', 'úti á landi', 'við sjóinn', 'í úthverfi', 'í fjöllunum'],
          },
          {
            level: 'B1',
            options: [
              'í bænum',
              'úti á landi',
              'við sjóinn',
              'í úthverfi',
              'í fjöllunum',
              'í miðborginni',
              'á hálendinu',
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
  },
  {
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
  },
];

export const categoryIds: string[] = categories.map((c) => c.id);

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
