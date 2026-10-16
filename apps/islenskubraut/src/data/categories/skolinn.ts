// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     content/islenskubraut/
// Regenerate: pnpm islenskubraut:build
//
// Edit the YAML, not this file. A test fails if this file drifts from it.

import { Category } from '../types';

export const skolinn: Category = {
  id: 'skolinn',
  name: 'Skólinn',
  icon: '🏫',
  description: 'Orðaforði um skólann — hluti, staði, fög og fyrirmæli',
  color: '#1D4ED8',
  draft: true,
  subCategories: [
    {
      name: 'Hlutir',
      options: [
        'bók',
        'penni',
        'blýantur',
        'tölva',
        'stílabók',
        'strokleður',
        'reglustika',
        'reiknivél',
        'taska',
      ],
    },
    {
      name: 'Staðir',
      options: ['skólastofa', 'bókasafn', 'matsalur', 'íþróttasalur', 'gangur', 'skrifstofa'],
    },
    {
      name: 'Fólk',
      options: ['kennari', 'nemandi', 'skólastjóri', 'námsráðgjafi', 'bekkjarfélagi'],
    },
    {
      name: 'Fög',
      options: ['íslenska', 'stærðfræði', 'enska', 'saga', 'náttúrufræði', 'íþróttir'],
    },
    {
      name: 'Fyrirmæli',
      options: [
        'lestu',
        'skrifaðu',
        'hlustaðu',
        'svaraðu',
        'merktu við',
        'lýstu',
        'berðu saman',
        'útskýrðu',
      ],
    },
  ],
  sentenceFrames: [
    {
      level: 'A1',
      frames: ['Þetta er ___.', 'Ég er ___.', 'Við ___ í tímanum.', 'Kennarinn segir: ___!'],
    },
    {
      level: 'A2',
      frames: [
        'Í ___ lærum við að ___.',
        'Ég þarf ___ til að ___.',
        'Kennarinn biður okkur að ___.',
        'Ég skil ekki ___. Getur þú hjálpað mér?',
      ],
    },
    {
      level: 'B1',
      frames: [
        'Í dag lærðum við um ___.',
        '___ skiptir máli vegna þess að ___.',
        'Ég er sammála/ósammála af því að ___.',
        'Hvað finnst þér um ___?',
      ],
    },
  ],
  examples: [
    {
      level: 'A1',
      text: 'Þetta er bók. Ég er í skólastofunni. Við lesum í tímanum.',
    },
    {
      level: 'A2',
      text: 'Í stærðfræði lærum við að reikna. Ég þarf reiknivél til að reikna. Kennarinn biður okkur að svara.',
    },
    {
      level: 'B1',
      text: 'Í dag lærðum við um breytingar á loftslagi. Þær skipta máli vegna þess að þær hafa áhrif á alla. Hvað finnst þér um það?',
    },
  ],
  teacherNotes: [
    {
      level: 'A1',
      text: 'Nemandi bendir á hluti og staði í skólanum og nefnir þá. Æfið fyrirmælin í raun, til dæmis með því að biðja nemandann að lesa eða skrifa.',
    },
    {
      level: 'A2',
      text: 'Nemandi segir hvað gert er í hverju fagi og skilur algeng fyrirmæli. Hvetjið nemandann til að biðja um hjálp með setningunni „Ég skil ekki …“.',
    },
    {
      level: 'B1',
      text: 'Rammarnir fylgja fjórum leiðum til að nota tungumálið í námi, að segja frá, útskýra, rökstyðja og ræða. Námsorðin koma úr LÍNO-2 og eru notuð í öllum fögum.',
    },
  ],
  guidingQuestions: [
    {
      question: 'Hvað er í skólatöskunni?',
      icon: '🎒',
      label: 'Hlutir',
      answers: [
        {
          level: 'A1',
          options: ['bók', 'penni', 'blýantur', 'tölva'],
        },
        {
          level: 'A2',
          options: [
            'bók',
            'penni',
            'blýantur',
            'tölva',
            'stílabók',
            'strokleður',
            'reglustika',
            'reiknivél',
          ],
        },
        {
          level: 'B1',
          options: [
            'bók',
            'penni',
            'blýantur',
            'tölva',
            'stílabók',
            'strokleður',
            'reglustika',
            'reiknivél',
            'kennslubók',
            'verkefnablað',
          ],
        },
      ],
    },
    {
      question: 'Hvaða fag er þetta?',
      icon: '📚',
      label: 'Fög',
      answers: [
        {
          level: 'A1',
          options: ['íslenska', 'stærðfræði', 'enska', 'íþróttir'],
        },
        {
          level: 'A2',
          options: [
            'íslenska',
            'stærðfræði',
            'enska',
            'íþróttir',
            'saga',
            'náttúrufræði',
            'listir',
            'danska',
          ],
        },
        {
          level: 'B1',
          options: [
            'íslenska',
            'stærðfræði',
            'enska',
            'íþróttir',
            'saga',
            'náttúrufræði',
            'listir',
            'danska',
            'félagsfræði',
            'efnafræði',
          ],
        },
      ],
    },
    {
      question: 'Hvað á ég að gera?',
      icon: '✏️',
      label: 'Fyrirmæli',
      answers: [
        {
          level: 'A1',
          options: ['lestu', 'skrifaðu', 'hlustaðu', 'svaraðu'],
        },
        {
          level: 'A2',
          options: [
            'lestu',
            'skrifaðu',
            'hlustaðu',
            'svaraðu',
            'merktu við',
            'lýstu',
            'berðu saman',
            'útskýrðu',
          ],
        },
        {
          level: 'B1',
          options: [
            'lestu',
            'skrifaðu',
            'hlustaðu',
            'svaraðu',
            'merktu við',
            'lýstu',
            'berðu saman',
            'útskýrðu',
            'rökstyddu',
            'dragðu saman',
            'greindu',
          ],
        },
      ],
    },
    {
      question: 'Hvaða námsorð notum við?',
      icon: '🔤',
      label: 'Námsorð',
      answers: [
        {
          level: 'B1',
          options: [
            'hluti',
            'áhrif',
            'breyting',
            'mikilvægur',
            'einstaklingur',
            'starf',
            'auka',
            'meðferð',
            'heimild',
            'greina',
            'tengja',
            'hugmynd',
          ],
        },
      ],
    },
    {
      question: 'Hvað gerum við í tímanum?',
      icon: '🎯',
      context: {
        kind: 'notagildi',
        color: '#1D4ED8',
      },
      answers: [
        {
          level: 'A1',
          options: ['lesum', 'skrifum', 'hlustum', 'tölum', 'reiknum'],
        },
        {
          level: 'A2',
          options: [
            'lesum',
            'skrifum',
            'hlustum',
            'tölum',
            'reiknum',
            'svörum',
            'spyrjum',
            'vinnum saman',
          ],
        },
        {
          level: 'B1',
          options: [
            'lesum',
            'skrifum',
            'hlustum',
            'tölum',
            'reiknum',
            'svörum',
            'spyrjum',
            'vinnum saman',
            'ræðum',
            'kynnum',
          ],
        },
      ],
    },
    {
      question: 'Hver hjálpar?',
      icon: '👥',
      context: {
        kind: 'hver',
        color: '#C2410C',
      },
      answers: [
        {
          level: 'A1',
          options: ['kennari', 'nemandi', 'vinur'],
        },
        {
          level: 'A2',
          options: ['kennari', 'nemandi', 'vinur', 'skólastjóri', 'námsráðgjafi', 'bekkjarfélagi'],
        },
        {
          level: 'B1',
          options: [
            'kennari',
            'nemandi',
            'vinur',
            'skólastjóri',
            'námsráðgjafi',
            'bekkjarfélagi',
            'umsjónarkennari',
            'túlkur',
          ],
        },
      ],
    },
    {
      question: 'Hvar í skólanum?',
      icon: '📍',
      context: {
        kind: 'hvar',
        color: '#B91C1C',
      },
      answers: [
        {
          level: 'A1',
          options: ['í skólastofunni', 'á bókasafninu', 'í íþróttasalnum'],
        },
        {
          level: 'A2',
          options: [
            'í skólastofunni',
            'á bókasafninu',
            'í íþróttasalnum',
            'í matsalnum',
            'á ganginum',
            'á skrifstofunni',
          ],
        },
        {
          level: 'B1',
          options: [
            'í skólastofunni',
            'á bókasafninu',
            'í íþróttasalnum',
            'í matsalnum',
            'á ganginum',
            'á skrifstofunni',
            'hjá námsráðgjafa',
          ],
        },
      ],
    },
    {
      question: 'Hvenær?',
      icon: '🕐',
      context: {
        kind: 'hvenaer',
        color: '#107837',
      },
      answers: [
        {
          level: 'A1',
          options: ['á morgnana', 'í frímínútum', 'eftir skóla'],
        },
        {
          level: 'A2',
          options: [
            'á morgnana',
            'í frímínútum',
            'eftir skóla',
            'í hádeginu',
            'á mánudögum',
            'í prófinu',
          ],
        },
        {
          level: 'B1',
          options: [
            'á morgnana',
            'í frímínútum',
            'eftir skóla',
            'í hádeginu',
            'á mánudögum',
            'í prófinu',
            'fyrir próf',
            'í lok annar',
          ],
        },
      ],
    },
  ],
};
