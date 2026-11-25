// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     content/islenskubraut/
// Regenerate: pnpm islenskubraut:build
//
// Edit the YAML, not this file. A test fails if this file drifts from it.

import { Category } from '../types';

export const dyr: Category = {
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
      startsAt: {
        spendýr: 'A2',
        skriðdýr: 'B1',
        froskdýr: 'B1',
        skordýr: 'A2',
      },
    },
    {
      name: 'Búsvæði',
      options: ['á landi', 'í vatni', 'í lofti', 'á landi og í vatni'],
      startsAt: {
        'á landi og í vatni': 'A2',
      },
    },
    {
      name: 'Útlit',
      options: ['feld', 'fjaðrir', 'hreistur', 'hala', 'gogg', 'horn', 'fjóra fætur', 'tvo fætur'],
      startsAt: {
        gogg: 'A2',
        horn: 'A2',
      },
    },
    {
      name: 'Hreyfing',
      options: ['flýgur', 'syndir', 'hleypur'],
    },
    {
      name: 'Stærð',
      options: ['lítið', 'meðalstórt', 'stórt', 'mjög stórt'],
    },
    {
      name: 'Fæða',
      options: ['plöntur (grasæta)', 'kjöt (kjötæta)', 'bæði (alæta)'],
      startsAt: {
        'plöntur (grasæta)': 'A2',
        'kjöt (kjötæta)': 'A2',
        'bæði (alæta)': 'A2',
      },
    },
  ],
  sentenceFrames: [
    {
      level: 'A1',
      frames: [
        'Þetta er dýr.',
        'Það er ___.',
        'Það hefur ___.',
        'Það heyrist ___ í því.',
        'Það ___.',
      ],
    },
    {
      level: 'A2',
      frames: [
        'Þetta er ___ sem býr ___.',
        'Það hefur ___ og ___.',
        'Það étur ___.',
        'Það er ___ viðkomu.',
        'Maður finnur það ___.',
      ],
    },
    {
      level: 'B1',
      frames: [
        'Ég held að þetta sé ___ vegna þess að ___.',
        'Þetta dýr er ___ og ___.',
        'Það er líkt ___ en ólíkt ___.',
        'Það er ___ að snerta vegna þess að ___.',
        'Það sést oftast ___ vegna þess að ___.',
      ],
    },
  ],
  examples: [
    {
      level: 'A1',
      text: 'Þetta er dýr. Það er stórt. Það hefur feld.',
    },
    {
      level: 'A2',
      text: 'Þetta er dýr sem býr í vatni. Það hefur hreistur og syndir. Það étur plöntur.',
    },
    {
      level: 'B1',
      text: 'Ég held að þetta sé höfrungur vegna þess að hann syndir og býr í sjónum. Þetta dýr er grátt og snjallt. Það er líkt hval en ólíkt fiski.',
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
      question: 'Hvers konar dýr er þetta?',
      icon: '📚',
      label: 'Flokkar',
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
      label: 'Útlit',
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
          ],
        },
      ],
    },
    {
      question: 'Hvernig er það viðkomu?',
      icon: '✋',
      label: 'Áferð',
      answers: [
        {
          level: 'A1',
          options: ['mjúkt', 'hart'],
        },
        {
          level: 'A2',
          options: ['mjúkt', 'hart', 'slétt', 'gróft', 'blautt', 'þurrt'],
        },
        {
          level: 'B1',
          options: ['mjúkt', 'hart', 'slétt', 'gróft', 'blautt', 'þurrt', 'loðið', 'hált'],
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
          options: ['hátt', 'lágt', 'ekkert'],
        },
        {
          level: 'A2',
          options: ['hátt', 'lágt', 'ekkert', 'gelur', 'mjálmar', 'öskrar', 'suðar'],
        },
        {
          level: 'B1',
          options: ['hátt', 'lágt', 'ekkert', 'gelur', 'mjálmar', 'öskrar', 'suðar', 'hvæsir'],
        },
      ],
    },
    {
      question: 'Hvað gerir það?',
      icon: '🎯',
      context: {
        kind: 'notagildi',
        color: '#1D4ED8',
      },
      answers: [
        {
          level: 'A1',
          options: ['flýgur', 'syndir', 'hleypur'],
        },
        {
          level: 'A2',
          options: ['flýgur', 'syndir', 'hleypur'],
        },
        {
          level: 'B1',
          options: ['flýgur', 'syndir', 'hleypur'],
        },
      ],
    },
    {
      question: 'Hver hugsar um það?',
      icon: '👤',
      context: {
        kind: 'hver',
        color: '#C2410C',
      },
      answers: [
        {
          level: 'A1',
          options: ['börn', 'fullorðnir'],
        },
        {
          level: 'A2',
          options: ['börn', 'fullorðnir', 'bændur', 'dýralæknar'],
        },
        {
          level: 'B1',
          options: ['börn', 'fullorðnir', 'bændur', 'dýralæknar'],
        },
      ],
    },
    {
      question: 'Hvar er hægt að finna það?',
      icon: '📍',
      context: {
        kind: 'hvar',
        color: '#B91C1C',
      },
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
      question: 'Hvenær sést það?',
      icon: '🕐',
      context: {
        kind: 'hvenaer',
        color: '#107837',
      },
      answers: [
        {
          level: 'A1',
          options: ['á morgnana', 'á daginn', 'á kvöldin', 'alltaf', 'á veturna', 'á sumrin'],
        },
        {
          level: 'A2',
          options: ['á morgnana', 'á daginn', 'á kvöldin', 'alltaf', 'á veturna', 'á sumrin'],
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
            'daglega',
            'sjaldan',
            'oft',
          ],
        },
      ],
    },
  ],
  builder: [
    {
      level: 'A1',
      confirmed: false,
      subject: {
        kind: 'word',
        word: 'dýr',
      },
      frames: [
        {
          frame: 'Þetta er dýr.',
          agree: [],
          blank: null,
        },
        {
          frame: 'Það er ___.',
          agree: [
            {
              word: 'Það',
              role: 'NF',
            },
          ],
          blank: {
            words: 'Stærð',
            options: ['lítið', 'meðalstórt', 'stórt', 'mjög stórt'],
            form: 'agree',
          },
        },
        {
          frame: 'Það hefur ___.',
          agree: [
            {
              word: 'Það',
              role: 'NF',
            },
          ],
          blank: {
            words: 'Hvernig lítur það út?',
            options: ['feldur', 'fjaðrir', 'hreistur', 'hali'],
            form: 'ÞF',
          },
        },
        {
          frame: 'Það heyrist ___ í því.',
          agree: [],
          blank: {
            words: 'Hvaða hljóð gefur það frá sér?',
            options: ['hátt', 'lágt', 'ekkert'],
            form: 'as-is',
          },
        },
        {
          frame: 'Það ___.',
          agree: [
            {
              word: 'Það',
              role: 'NF',
            },
          ],
          blank: {
            words: 'Hvað gerir það?',
            options: ['flýgur', 'syndir', 'hleypur'],
            form: 'as-is',
          },
        },
      ],
      lemmas: {
        hali: 'hali',
      },
    },
  ],
};
