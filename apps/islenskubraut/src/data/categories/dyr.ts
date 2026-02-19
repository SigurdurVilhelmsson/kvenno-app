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
        { level: 'A1', options: ['gæludýr', 'villt dýr', 'húsdýr'] },
        { level: 'A2', options: ['gæludýr', 'villt dýr', 'húsdýr', 'spendýr', 'fugl', 'fiskur'] },
        { level: 'B1', options: ['gæludýr', 'villt dýr', 'húsdýr', 'spendýr', 'fugl', 'fiskur', 'skriðdýr', 'froskdýr', 'skordýr'] },
      ],
    },
    {
      question: 'Hvernig lítur það út?',
      icon: '👁️',
      answers: [
        { level: 'A1', options: ['feldur', 'fjaðrir', 'hreistur', 'hali'] },
        { level: 'A2', options: ['feldur', 'fjaðrir', 'hreistur', 'hali', 'goggur', 'horn', 'fjórir fætur', 'tveir fætur'] },
        { level: 'B1', options: ['feldur', 'fjaðrir', 'hreistur', 'hali', 'goggur', 'horn', 'fjórir fætur', 'tveir fætur', 'flýgur', 'syndir', 'hleypur'] },
      ],
    },
    {
      question: 'Hvernig finnst það við snertingu?',
      icon: '✋',
      answers: [
        { level: 'A1', options: ['mjúkt', 'hart', 'slétt', 'gróft'] },
        { level: 'A2', options: ['mjúkt', 'hart', 'slétt', 'gróft', 'þungt', 'létt', 'blautt', 'þurrt'] },
        { level: 'B1', options: ['mjúkt', 'hart', 'slétt', 'gróft', 'þungt', 'létt', 'blautt', 'þurrt', 'loðið', 'hált', 'stinnt', 'sveigjanlegt'] },
      ],
    },
    {
      question: 'Hvaða hljóð gefur það frá sér?',
      icon: '🔊',
      answers: [
        { level: 'A1', options: ['hátt', 'lágt', 'þögult'] },
        { level: 'A2', options: ['hátt', 'lágt', 'þögult', 'gelur', 'mjallar', 'öskrar', 'súðar', 'hringir'] },
        { level: 'B1', options: ['hátt', 'lágt', 'þögult', 'gelur', 'mjallar', 'öskrar', 'súðar', 'hringir', 'hvæsir', 'umar', 'dúnar', 'þrymir'] },
      ],
    },
    {
      question: 'Hvaða lögun hefur það?',
      icon: '🔷',
      answers: [
        { level: 'A1', options: ['stórt', 'lítið', 'kringlótt', 'fernt'] },
        { level: 'A2', options: ['stórt', 'lítið', 'kringlótt', 'fernt', 'langt', 'stuttt', 'hátt', 'lágt', 'flatt', 'þykkt'] },
        { level: 'B1', options: ['stórt', 'lítið', 'kringlótt', 'fernt', 'langt', 'stuttt', 'hátt', 'lágt', 'flatt', 'þykkt', 'sporöskjulaga', 'þríhyrningslaga', 'sívalningslaga', 'óreglulegt'] },
      ],
    },
    {
      question: 'Til hvers er það notað?',
      icon: '🎯',
      answers: [
        { level: 'A1', options: ['til að gæta', 'til að klappa', 'til að borða'] },
        { level: 'A2', options: ['til að gæta', 'til að klappa', 'til að borða', 'til að hjálpa', 'til að vinna', 'til að leika sér'] },
        { level: 'B1', options: ['til að gæta', 'til að klappa', 'til að borða', 'til að hjálpa', 'til að vinna', 'til að leika sér', 'til að verja', 'til að rannsaka'] },
      ],
    },
    {
      question: 'Hver notar þetta?',
      icon: '👤',
      answers: [
        { level: 'A1', options: ['allir', 'börn', 'fullorðnir'] },
        { level: 'A2', options: ['allir', 'börn', 'fullorðnir', 'bændur', 'dýralæknar', 'veiðimenn'] },
        { level: 'B1', options: ['allir', 'börn', 'fullorðnir', 'bændur', 'dýralæknar', 'veiðimenn', 'sérfræðingar', 'ferðamenn'] },
      ],
    },
    {
      question: 'Hvar er hægt að finna þetta?',
      icon: '📍',
      answers: [
        { level: 'A1', options: ['heima', 'úti', 'á bæ'] },
        { level: 'A2', options: ['heima', 'úti', 'á bæ', 'í dýragarðinum', 'í náttúrunni', 'í sjónum'] },
        { level: 'B1', options: ['heima', 'úti', 'á bæ', 'í dýragarðinum', 'í náttúrunni', 'í sjónum', 'á hálendinu', 'í skóginum'] },
      ],
    },
    {
      question: 'Hvenær er þetta sést?',
      icon: '🕐',
      answers: [
        { level: 'A1', options: ['á morgnana', 'á daginn', 'á kvöldin', 'alltaf'] },
        { level: 'A2', options: ['á morgnana', 'á daginn', 'á kvöldin', 'alltaf', 'á veturna', 'á sumrin', 'um helgar'] },
        { level: 'B1', options: ['á morgnana', 'á daginn', 'á kvöldin', 'alltaf', 'á veturna', 'á sumrin', 'um helgar', 'í sérstökum tilvikum', 'daglega', 'sjaldan', 'oft'] },
      ],
    },
  ],
};
