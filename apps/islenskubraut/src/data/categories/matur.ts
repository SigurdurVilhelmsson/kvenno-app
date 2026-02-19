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
      options: ['ávöxtur', 'grænmeti', 'kjöt', 'fiskur', 'mjólkurvara', 'sælgæti', 'brauð/korn', 'drykkur'],
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
      options: ['í morgunmat', 'í hádegismat', 'í kvöldmat', 'sem millimál', 'alltaf/hvenær sem er'],
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
        { level: 'A1', options: ['ávöxtur', 'grænmeti', 'kjöt', 'drykkur'] },
        { level: 'A2', options: ['ávöxtur', 'grænmeti', 'kjöt', 'fiskur', 'mjólkurvara', 'sælgæti', 'brauð/korn', 'drykkur'] },
        { level: 'B1', options: ['ávöxtur', 'grænmeti', 'kjöt', 'fiskur', 'mjólkurvara', 'sælgæti', 'brauð/korn', 'drykkur', 'krydd', 'sósa'] },
      ],
    },
    {
      question: 'Hvernig lítur það út?',
      icon: '👁️',
      answers: [
        { level: 'A1', options: ['rautt', 'grænt', 'gult', 'hvítt'] },
        { level: 'A2', options: ['rautt', 'grænt', 'gult', 'hvítt', 'brúnt', 'appelsínugult', 'stórt', 'lítið'] },
        { level: 'B1', options: ['rautt', 'grænt', 'gult', 'hvítt', 'brúnt', 'appelsínugult', 'stórt', 'lítið', 'kringlótt', 'langt', 'flatt'] },
      ],
    },
    {
      question: 'Hvernig bragðast það?',
      icon: '👅',
      answers: [
        { level: 'A1', options: ['sætt', 'salt', 'súrt', 'beiskt'] },
        { level: 'A2', options: ['sætt', 'salt', 'súrt', 'beiskt', 'kryddað', 'sterkt', 'milt', 'ferskt'] },
        { level: 'B1', options: ['sætt', 'salt', 'súrt', 'beiskt', 'kryddað', 'sterkt', 'milt', 'ferskt', 'bragðmikið', 'bragðlaust', 'sælgæti-sætt', 'náttúrulega sætt'] },
      ],
    },
    {
      question: 'Hvernig finnst það við snertingu?',
      icon: '✋',
      answers: [
        { level: 'A1', options: ['mjúkt', 'hart', 'sléttt', 'gróft'] },
        { level: 'A2', options: ['mjúkt', 'hart', 'sléttt', 'gróft', 'þungt', 'létt', 'heitt', 'kalt', 'blautt', 'þurrt'] },
        { level: 'B1', options: ['mjúkt', 'hart', 'sléttt', 'gróft', 'þungt', 'létt', 'heitt', 'kalt', 'blautt', 'þurrt', 'loðið', 'hálkt', 'stinnt', 'sveigjanlegt'] },
      ],
    },
    {
      question: 'Hvernig lyktar af því?',
      icon: '👃',
      answers: [
        { level: 'A1', options: ['gott', 'vont', 'ekkert'] },
        { level: 'A2', options: ['gott', 'vont', 'ekkert', 'ferskt', 'sterkt', 'milt'] },
        { level: 'B1', options: ['gott', 'vont', 'ekkert', 'ferskt', 'sterkt', 'milt', 'ilmandi', 'stingandi', 'sætt', 'beiskt'] },
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
        { level: 'A1', options: ['til að borða', 'til að drekka'] },
        { level: 'A2', options: ['til að borða', 'til að drekka', 'til að elda með', 'til að baka með'] },
        { level: 'B1', options: ['til að borða', 'til að drekka', 'til að elda með', 'til að baka með', 'til að næra sig', 'til að njóta'] },
      ],
    },
    {
      question: 'Hver notar þetta?',
      icon: '👤',
      answers: [
        { level: 'A1', options: ['allir', 'börn', 'fullorðnir'] },
        { level: 'A2', options: ['allir', 'börn', 'fullorðnir', 'kokkar', 'bakarar'] },
        { level: 'B1', options: ['allir', 'börn', 'fullorðnir', 'kokkar', 'bakarar', 'sérfræðingar', 'ferðamenn'] },
      ],
    },
    {
      question: 'Hvar er hægt að finna þetta?',
      icon: '📍',
      answers: [
        { level: 'A1', options: ['heima', 'í búð', 'á veitingastað'] },
        { level: 'A2', options: ['heima', 'í búð', 'á veitingastað', 'í skólanum', 'úti'] },
        { level: 'B1', options: ['heima', 'í búð', 'á veitingastað', 'í skólanum', 'úti', 'á markaði', 'í garðinum'] },
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
