// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     content/islenskubraut/
// Regenerate: pnpm islenskubraut:build
//
// Edit the YAML, not this file. A test fails if this file drifts from it.

import { Category } from '../types';

export const stadir: Category = {
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
      options: ['í bænum/borginni', 'í úthverfi', 'á landi/sveitinni', 'við sjóinn', 'í fjöllunum'],
    },
    {
      name: 'Stærð',
      options: ['lítill/lítil/lítið', 'meðalstór/meðalstórt', 'stór/stórt'],
    },
    {
      name: 'Hvað gerir maður þar',
      options: ['borðar', 'verslar', 'syndir', 'lærir', 'vinnur', 'sefur', 'leikur sér'],
    },
  ],
  sentenceFrames: [
    {
      level: 'A1',
      frames: ['Þetta er ___.', 'Maður ___ þar.', 'Það er ___.', 'Maður notar það ___.'],
    },
    {
      level: 'A2',
      frames: [
        'Þetta er ___ sem er ___.',
        'Maður fer þangað ___.',
        'Það er gert ___.',
        'Maður finnur það ___.',
        'Maður notar það ___.',
      ],
    },
    {
      level: 'B1',
      frames: [
        'Þetta er ___ sem er staðsett ___.',
        'Fólk fer þangað ___ og ___.',
        'Mér finnst þetta ___ vegna þess að ___.',
        'Það er gert ___ sem er ___.',
        '___ nota það oftast ___.',
      ],
    },
  ],
  examples: [
    {
      level: 'A1',
      text: 'Þetta er skóli. Maður lærir þar.',
    },
    {
      level: 'A2',
      text: 'Þetta er sundlaug sem er í bænum. Maður fer þangað til að synda.',
    },
    {
      level: 'B1',
      text: 'Þetta er safn sem er staðsett í borginni. Fólk fer þangað til að læra og skoða list.',
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
      question: 'Hvers konar staður er þetta?',
      icon: '📚',
      label: 'Flokkar',
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
      label: 'Útlit',
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
      label: 'Lykt',
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
      label: 'Efniviður',
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
      question: 'Til hvers er þetta notað?',
      icon: '🎯',
      context: {
        kind: 'notagildi',
        color: '#1D4ED8',
      },
      answers: [
        {
          level: 'A1',
          options: ['til að búa', 'til að læra', 'til að versla'],
        },
        {
          level: 'A2',
          options: ['til að búa', 'til að læra', 'til að versla', 'til að vinna', 'til að hvílast'],
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
      context: {
        kind: 'hvar',
        color: '#B91C1C',
      },
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
