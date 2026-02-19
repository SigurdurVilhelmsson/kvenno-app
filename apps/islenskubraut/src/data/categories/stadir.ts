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
      frames: [
        'Þetta er ___.',
        'Maður ___ þar.',
        'Það er ___.',
        'Maður notar það til að ___.',
      ],
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
        { level: 'A1', options: ['hús', 'skóli', 'búð', 'sundlaug'] },
        { level: 'A2', options: ['hús', 'íbúð', 'skóli', 'sjúkrahús', 'búð/verslun', 'veitingastaður', 'safn', 'kirkja', 'sundlaug', 'leikvöllur'] },
        { level: 'B1', options: ['hús', 'íbúð', 'skóli', 'sjúkrahús', 'búð/verslun', 'veitingastaður', 'safn', 'kirkja', 'sundlaug', 'leikvöllur', 'bókasafn', 'íþróttahús'] },
      ],
    },
    {
      question: 'Hvernig lítur þetta út?',
      icon: '👁️',
      answers: [
        { level: 'A1', options: ['stórt', 'lítið', 'hátt', 'lágt'] },
        { level: 'A2', options: ['stórt', 'lítið', 'hátt', 'lágt', 'gamalt', 'nýtt', 'fallegt', 'ljótt'] },
        { level: 'B1', options: ['stórt', 'lítið', 'hátt', 'lágt', 'gamalt', 'nýtt', 'fallegt', 'ljótt', 'nútímalegt', 'sögulegt'] },
      ],
    },
    {
      question: 'Hvernig lyktar þar?',
      icon: '👃',
      answers: [
        { level: 'A1', options: ['gott', 'vont', 'ekkert'] },
        { level: 'A2', options: ['gott', 'vont', 'ekkert', 'ferskt', 'sterkt', 'milt'] },
        { level: 'B1', options: ['gott', 'vont', 'ekkert', 'ferskt', 'sterkt', 'milt', 'ilmandi', 'stingandi', 'sætt', 'beiskt'] },
      ],
    },
    {
      question: 'Úr hverju er það gert?',
      icon: '🧱',
      answers: [
        { level: 'A1', options: ['úr tré', 'úr steini', 'úr málmi'] },
        { level: 'A2', options: ['úr tré', 'úr steini', 'úr málmi', 'úr gleri', 'úr plasti'] },
        { level: 'B1', options: ['úr tré', 'úr steini', 'úr málmi', 'úr gleri', 'úr plasti', 'úr endurunnru efni', 'úr náttúrulegum efnum', 'úr gerviefnum'] },
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
      question: 'Til hvers er þetta notað?',
      icon: '🎯',
      answers: [
        { level: 'A1', options: ['til að búa', 'til að læra', 'til að versla'] },
        { level: 'A2', options: ['til að búa', 'til að læra', 'til að versla', 'til að vinna', 'til að hvílast'] },
        { level: 'B1', options: ['til að búa', 'til að læra', 'til að versla', 'til að vinna', 'til að hvílast', 'til að stunda íþróttir', 'til að skemmta sér'] },
      ],
    },
    {
      question: 'Hver notar þetta?',
      icon: '👤',
      answers: [
        { level: 'A1', options: ['allir', 'börn', 'fullorðnir'] },
        { level: 'A2', options: ['allir', 'börn', 'fullorðnir', 'nemendur', 'kennarar', 'læknar'] },
        { level: 'B1', options: ['allir', 'börn', 'fullorðnir', 'nemendur', 'kennarar', 'læknar', 'sérfræðingar', 'listamenn', 'ferðamenn', 'iðnaðarmenn'] },
      ],
    },
    {
      question: 'Hvar er þetta?',
      icon: '📍',
      answers: [
        { level: 'A1', options: ['í bænum', 'úti á landi', 'við sjóinn'] },
        { level: 'A2', options: ['í bænum', 'úti á landi', 'við sjóinn', 'í úthverfi', 'í fjöllunum'] },
        { level: 'B1', options: ['í bænum', 'úti á landi', 'við sjóinn', 'í úthverfi', 'í fjöllunum', 'í miðborginni', 'á hálendinu'] },
      ],
    },
    {
      question: 'Hvenær er þetta notað?',
      icon: '🕐',
      answers: [
        { level: 'A1', options: ['á morgnana', 'á daginn', 'á kvöldin', 'alltaf'] },
        { level: 'A2', options: ['á morgnana', 'á daginn', 'á kvöldin', 'alltaf', 'á veturna', 'á sumrin', 'um helgar', 'á virkum dögum'] },
        { level: 'B1', options: ['á morgnana', 'á daginn', 'á kvöldin', 'alltaf', 'á veturna', 'á sumrin', 'um helgar', 'á virkum dögum', 'í sérstökum tilvikum', 'í hátíðum', 'daglega', 'sjaldan', 'oft'] },
      ],
    },
  ],
};
