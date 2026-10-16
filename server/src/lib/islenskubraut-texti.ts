// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     content/islenskubraut/
// Regenerate: pnpm islenskubraut:build
//
// Edit the YAML, not this file. A test fails if this file drifts from it.
//
// The gaps were found with BÍN's lookups (content/islenskubraut/bin/ordmyndir.json, CC BY-SA 4.0).

import type { Level } from '../types/islenskubraut.js';

/** A run of the model text, or a gap where the card's word was. */
export type TextiPart = { text: string } | { gap: string };

export interface TextiStage {
  /** The stage's name, printed beside it: `Flokkun`, `Lýsing`, … */
  name: string;
  parts: TextiPart[];
}

export interface TextiLevel {
  /** The kind of text: `Lýsing`, `Skýrsla`, `Samanburður`, … */
  genre: string;
  stages: TextiStage[];
  /** Every gap's word, in lower case and alphabetical order. */
  bank: string[];
}

export interface Texti {
  /** A teacher has read the texts; until then the card page does not link the PDF. */
  confirmed: boolean;
  levels: Record<Level, TextiLevel>;
}

export const texti: Record<string, Texti> = {
  dyr: {
    confirmed: false,
    levels: {
      A1: {
        genre: 'Lýsing',
        stages: [
          {
            name: 'Hvað er það?',
            parts: [
              {
                text: 'Þetta er hundur. Hundur er ',
              },
              {
                gap: 'gæludýr',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Útlit',
            parts: [
              {
                text: 'Hann hefur ',
              },
              {
                gap: 'feld',
              },
              {
                text: ' og ',
              },
              {
                gap: 'hala',
              },
              {
                text: '. Feldurinn er ',
              },
              {
                gap: 'mjúkur',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Hvar og hvenær?',
            parts: [
              {
                text: 'Hundurinn býr ',
              },
              {
                gap: 'heima',
              },
              {
                text: '. Hann fer út ',
              },
              {
                gap: 'á morgnana',
              },
              {
                text: ' og ',
              },
              {
                gap: 'á kvöldin',
              },
              {
                text: '.',
              },
            ],
          },
        ],
        bank: ['á kvöldin', 'á morgnana', 'feld', 'gæludýr', 'hala', 'heima', 'mjúkur'],
      },
      A2: {
        genre: 'Lýsing',
        stages: [
          {
            name: 'Hvað er það?',
            parts: [
              {
                text: 'Þetta er þorskur. Þorskur er ',
              },
              {
                gap: 'fiskur',
              },
              {
                text: ' sem býr ',
              },
              {
                gap: 'í sjónum',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Útlit',
            parts: [
              {
                text: 'Hann hefur ',
              },
              {
                gap: 'hreistur',
              },
              {
                text: ' og ',
              },
              {
                gap: 'hala',
              },
              {
                text: '. Hann finnst ',
              },
              {
                gap: 'sléttur',
              },
              {
                text: ' og ',
              },
              {
                gap: 'blautur',
              },
              {
                text: ' við snertingu.',
              },
            ],
          },
          {
            name: 'Hver og hvenær?',
            parts: [
              {
                gap: 'Veiðimenn',
              },
              {
                text: ' veiða þorsk ',
              },
              {
                gap: 'á veturna',
              },
              {
                text: ' og ',
              },
              {
                gap: 'á sumrin',
              },
              {
                text: '. Maður notar hann ',
              },
              {
                gap: 'til að borða',
              },
              {
                text: '.',
              },
            ],
          },
        ],
        bank: [
          'á sumrin',
          'á veturna',
          'blautur',
          'fiskur',
          'hala',
          'hreistur',
          'í sjónum',
          'sléttur',
          'til að borða',
          'veiðimenn',
        ],
      },
      B1: {
        genre: 'Skýrsla',
        stages: [
          {
            name: 'Flokkun',
            parts: [
              {
                text: 'Lundi er ',
              },
              {
                gap: 'fugl',
              },
              {
                text: '. Hann er ',
              },
              {
                gap: 'villt dýr',
              },
              {
                text: ' sem býr á Íslandi ',
              },
              {
                gap: 'á sumrin',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Lýsing',
            parts: [
              {
                text: 'Lundinn hefur svartar og hvítar ',
              },
              {
                gap: 'fjaðrir',
              },
              {
                text: ' og stóran, litríkan ',
              },
              {
                gap: 'gogg',
              },
              {
                text: '. Hann hefur tvo fætur og getur bæði ',
              },
              {
                gap: 'flogið',
              },
              {
                text: ' og ',
              },
              {
                gap: 'synt',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Lífshættir',
            parts: [
              {
                text: 'Lundinn býr í holum við sjóinn og veiðir litla ',
              },
              {
                gap: 'fiska',
              },
              {
                text: '. Hann er oft ',
              },
              {
                gap: 'í sjónum',
              },
              {
                text: ' ',
              },
              {
                gap: 'á daginn',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Niðurlag',
            parts: [
              {
                gap: 'Ferðamenn',
              },
              {
                text: ' koma til Íslands til að sjá lundann. ',
              },
              {
                gap: 'Sérfræðingar',
              },
              {
                text: ' rannsaka hvers vegna lundum fækkar.',
              },
            ],
          },
        ],
        bank: [
          'á daginn',
          'á sumrin',
          'ferðamenn',
          'fiska',
          'fjaðrir',
          'flogið',
          'fugl',
          'gogg',
          'í sjónum',
          'sérfræðingar',
          'synt',
          'villt dýr',
        ],
      },
    },
  },
  matur: {
    confirmed: false,
    levels: {
      A1: {
        genre: 'Lýsing',
        stages: [
          {
            name: 'Hvað er það?',
            parts: [
              {
                text: 'Þetta er epli. Epli er ',
              },
              {
                gap: 'ávöxtur',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Útlit og bragð',
            parts: [
              {
                text: 'Það er ',
              },
              {
                gap: 'rautt',
              },
              {
                text: ' eða ',
              },
              {
                gap: 'grænt',
              },
              {
                text: '. Það er ',
              },
              {
                gap: 'sætt',
              },
              {
                text: ' og ',
              },
              {
                gap: 'hart',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Hvar og hvenær?',
            parts: [
              {
                text: 'Maður borðar það ',
              },
              {
                gap: 'á morgnana',
              },
              {
                text: ' eða ',
              },
              {
                gap: 'á daginn',
              },
              {
                text: '. Maður kaupir það ',
              },
              {
                gap: 'í búð',
              },
              {
                text: '.',
              },
            ],
          },
        ],
        bank: ['á daginn', 'á morgnana', 'ávöxtur', 'grænt', 'hart', 'í búð', 'rautt', 'sætt'],
      },
      A2: {
        genre: 'Lýsing',
        stages: [
          {
            name: 'Hvað er það?',
            parts: [
              {
                text: 'Þetta er gulrót. Gulrót er ',
              },
              {
                gap: 'grænmeti',
              },
              {
                text: ' sem er ',
              },
              {
                gap: 'appelsínugult',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Útlit og bragð',
            parts: [
              {
                text: 'Hún er ',
              },
              {
                gap: 'ílöng',
              },
              {
                text: ' og ',
              },
              {
                gap: 'hörð',
              },
              {
                text: '. Hún bragðast ',
              },
              {
                gap: 'sætt',
              },
              {
                text: ' og ',
              },
              {
                gap: 'ferskt',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Notkun',
            parts: [
              {
                text: 'Maður borðar hana hráa eða eldaða. ',
              },
              {
                gap: 'Kokkar',
              },
              {
                text: ' nota hana ',
              },
              {
                gap: 'til að elda með',
              },
              {
                text: '. Hún fæst ',
              },
              {
                gap: 'í búð',
              },
              {
                text: ' allt árið.',
              },
            ],
          },
        ],
        bank: [
          'appelsínugult',
          'ferskt',
          'grænmeti',
          'hörð',
          'í búð',
          'ílöng',
          'kokkar',
          'sætt',
          'til að elda með',
        ],
      },
      B1: {
        genre: 'Samanburður',
        stages: [
          {
            name: 'Kynning',
            parts: [
              {
                text: 'Skyr og jógúrt eru bæði ',
              },
              {
                gap: 'mjólkurvörur',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Líkt',
            parts: [
              {
                text: 'Bæði eru ',
              },
              {
                gap: 'hvít',
              },
              {
                text: ', ',
              },
              {
                gap: 'mjúk',
              },
              {
                text: ' og ',
              },
              {
                gap: 'köld',
              },
              {
                text: '. Þau eru oft borðuð ',
              },
              {
                gap: 'á morgnana',
              },
              {
                text: ' eða sem millimál.',
              },
            ],
          },
          {
            name: 'Ólíkt',
            parts: [
              {
                text: 'Skyr er íslenskt og þykkara en jógúrt. Það er ',
              },
              {
                gap: 'milt',
              },
              {
                text: ' á bragðið en jógúrt er oft ',
              },
              {
                gap: 'súrari',
              },
              {
                text: ' og ',
              },
              {
                gap: 'sætari',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Niðurstaða',
            parts: [
              {
                text: 'Mér finnst skyr ',
              },
              {
                gap: 'betra',
              },
              {
                text: ' vegna þess að það er hollt og ',
              },
              {
                gap: 'bragðmikið',
              },
              {
                text: '. ',
              },
              {
                gap: 'Ferðamenn',
              },
              {
                text: ' smakka það oft á Íslandi.',
              },
            ],
          },
        ],
        bank: [
          'á morgnana',
          'betra',
          'bragðmikið',
          'ferðamenn',
          'hvít',
          'köld',
          'milt',
          'mjólkurvörur',
          'mjúk',
          'súrari',
          'sætari',
        ],
      },
    },
  },
  farartaeki: {
    confirmed: false,
    levels: {
      A1: {
        genre: 'Lýsing',
        stages: [
          {
            name: 'Hvað er það?',
            parts: [
              {
                text: 'Þetta er ',
              },
              {
                gap: 'rúta',
              },
              {
                text: '. Rútan er ',
              },
              {
                gap: 'stór',
              },
              {
                text: ' og ',
              },
              {
                gap: 'með hjólum',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Útlit',
            parts: [
              {
                text: 'Hún er ',
              },
              {
                gap: 'úr málmi',
              },
              {
                text: ' og hljómar ',
              },
              {
                gap: 'hátt',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Notkun',
            parts: [
              {
                text: 'Hún fer ',
              },
              {
                gap: 'á götunni',
              },
              {
                text: '. Allir nota hana ',
              },
              {
                gap: 'til að ferðast',
              },
              {
                text: ' ',
              },
              {
                gap: 'á morgnana',
              },
              {
                text: '.',
              },
            ],
          },
        ],
        bank: [
          'á götunni',
          'á morgnana',
          'hátt',
          'með hjólum',
          'rúta',
          'stór',
          'til að ferðast',
          'úr málmi',
        ],
      },
      A2: {
        genre: 'Lýsing',
        stages: [
          {
            name: 'Hvað er það?',
            parts: [
              {
                text: 'Þetta er ',
              },
              {
                gap: 'skip',
              },
              {
                text: ' sem fer ',
              },
              {
                gap: 'á sjónum',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Útlit',
            parts: [
              {
                text: 'Það er ',
              },
              {
                gap: 'langt',
              },
              {
                text: ' og ',
              },
              {
                gap: 'stórt',
              },
              {
                text: ' og ',
              },
              {
                gap: 'án hjóla',
              },
              {
                text: '. Það er ',
              },
              {
                gap: 'úr málmi',
              },
              {
                text: ' og vélin ',
              },
              {
                gap: 'suðar',
              },
              {
                text: ' ',
              },
              {
                gap: 'lágt',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Notkun',
            parts: [
              {
                gap: 'Sjómenn',
              },
              {
                text: ' nota það ',
              },
              {
                gap: 'til að vinna',
              },
              {
                text: ' ',
              },
              {
                gap: 'á veturna',
              },
              {
                text: ' og ',
              },
              {
                gap: 'á sumrin',
              },
              {
                text: '.',
              },
            ],
          },
        ],
        bank: [
          'á sjónum',
          'á sumrin',
          'á veturna',
          'án hjóla',
          'langt',
          'lágt',
          'sjómenn',
          'skip',
          'stórt',
          'suðar',
          'til að vinna',
          'úr málmi',
        ],
      },
      B1: {
        genre: 'Útskýring',
        stages: [
          {
            name: 'Fyrirbærið',
            parts: [
              {
                gap: 'Þyrla',
              },
              {
                text: ' er farartæki sem getur flogið án þess að hafa vængi eins og ',
              },
              {
                gap: 'flugvél',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Útskýring',
            parts: [
              {
                text: 'Ofan á þyrlunni eru ',
              },
              {
                gap: 'langir',
              },
              {
                text: ' spaðar sem snúast mjög hratt. Þegar spaðarnir snúast ýta þeir lofti niður og þá lyftist þyrlan upp. Hún er ',
              },
              {
                gap: 'úr málmi',
              },
              {
                text: ' og gleri.',
              },
            ],
          },
          {
            name: 'Afleiðing',
            parts: [
              {
                text: 'Þess vegna getur þyrla lent á ',
              },
              {
                gap: 'litlum',
              },
              {
                text: ' stöðum þar sem flugvél kemst ekki. ',
              },
              {
                gap: 'Flugmenn',
              },
              {
                text: ' nota hana ',
              },
              {
                gap: 'til að bjarga',
              },
              {
                text: ' fólki á hálendinu og ',
              },
              {
                gap: 'á sjónum',
              },
              {
                text: '.',
              },
            ],
          },
        ],
        bank: [
          'á sjónum',
          'flugmenn',
          'flugvél',
          'langir',
          'litlum',
          'til að bjarga',
          'úr málmi',
          'þyrla',
        ],
      },
    },
  },
  manneskja: {
    confirmed: false,
    levels: {
      A1: {
        genre: 'Lýsing',
        stages: [
          {
            name: 'Hver er það?',
            parts: [
              {
                text: 'Þetta er kennari. Hún er ',
              },
              {
                gap: 'ung',
              },
              {
                text: ' og ',
              },
              {
                gap: 'há',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Hvað gerir hún?',
            parts: [
              {
                text: 'Hún ',
              },
              {
                gap: 'vinnur',
              },
              {
                text: ' ',
              },
              {
                gap: 'í skólanum',
              },
              {
                text: ' ',
              },
              {
                gap: 'á daginn',
              },
              {
                text: '. ',
              },
              {
                gap: 'Á kvöldin',
              },
              {
                text: ' ',
              },
              {
                gap: 'lærir',
              },
              {
                text: ' hún ',
              },
              {
                gap: 'heima',
              },
              {
                text: '.',
              },
            ],
          },
        ],
        bank: ['á daginn', 'á kvöldin', 'há', 'heima', 'í skólanum', 'lærir', 'ung', 'vinnur'],
      },
      A2: {
        genre: 'Lýsing',
        stages: [
          {
            name: 'Hver er það?',
            parts: [
              {
                text: 'Þetta er ',
              },
              {
                gap: 'læknir',
              },
              {
                text: '. Hann er ',
              },
              {
                gap: 'fullorðinn',
              },
              {
                text: ' og ',
              },
              {
                gap: 'með gleraugu',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Hvað gerir hann?',
            parts: [
              {
                text: 'Hann ',
              },
              {
                gap: 'vinnur',
              },
              {
                text: ' ',
              },
              {
                gap: 'á sjúkrahúsi',
              },
              {
                text: ' og læknar fólk.',
              },
            ],
          },
          {
            name: 'Hvenær?',
            parts: [
              {
                text: 'Hann er oft ',
              },
              {
                gap: 'í vinnunni',
              },
              {
                text: ' ',
              },
              {
                gap: 'á kvöldin',
              },
              {
                text: ' og ',
              },
              {
                gap: 'um helgar',
              },
              {
                text: '.',
              },
            ],
          },
        ],
        bank: [
          'á kvöldin',
          'á sjúkrahúsi',
          'fullorðinn',
          'í vinnunni',
          'læknir',
          'með gleraugu',
          'um helgar',
          'vinnur',
        ],
      },
      B1: {
        genre: 'Starfslýsing',
        stages: [
          {
            name: 'Starfið',
            parts: [
              {
                text: 'Leikari er manneskja sem leikur í leikritum og kvikmyndum. Sumir leikarar eru ',
              },
              {
                gap: 'frægir',
              },
              {
                text: ' en flestir eru það ekki.',
              },
            ],
          },
          {
            name: 'Vinnan',
            parts: [
              {
                text: 'Leikarar ',
              },
              {
                gap: 'vinna',
              },
              {
                text: ' oft ',
              },
              {
                gap: 'á kvöldin',
              },
              {
                text: ' og ',
              },
              {
                gap: 'um helgar',
              },
              {
                text: ' vegna þess að þá koma flestir áhorfendur. Þeir leika ',
              },
              {
                gap: 'á sviði',
              },
              {
                text: ' eða ',
              },
              {
                gap: 'í sjónvarpi',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Hæfni',
            parts: [
              {
                text: 'Góður leikari þarf að muna langan texta og geta ',
              },
              {
                gap: 'sungið',
              },
              {
                text: ', dansað og ',
              },
              {
                gap: 'skapað',
              },
              {
                text: ' persónur.',
              },
            ],
          },
          {
            name: 'Mat',
            parts: [
              {
                text: 'Mér finnst þetta skemmtilegt starf vegna þess að það er aldrei eins.',
              },
            ],
          },
        ],
        bank: [
          'á kvöldin',
          'á sviði',
          'frægir',
          'í sjónvarpi',
          'skapað',
          'sungið',
          'um helgar',
          'vinna',
        ],
      },
    },
  },
  stadir: {
    confirmed: false,
    levels: {
      A1: {
        genre: 'Lýsing',
        stages: [
          {
            name: 'Hvað er það?',
            parts: [
              {
                text: 'Þetta er ',
              },
              {
                gap: 'sundlaug',
              },
              {
                text: '. Hún er ',
              },
              {
                gap: 'í bænum',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Útlit',
            parts: [
              {
                text: 'Hún er ',
              },
              {
                gap: 'stór',
              },
              {
                text: ' og ',
              },
              {
                gap: 'úr steini',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Notkun',
            parts: [
              {
                gap: 'Börn',
              },
              {
                text: ' og ',
              },
              {
                gap: 'fullorðnir',
              },
              {
                text: ' fara þangað ',
              },
              {
                gap: 'á morgnana',
              },
              {
                text: ' og ',
              },
              {
                gap: 'á kvöldin',
              },
              {
                text: '.',
              },
            ],
          },
        ],
        bank: [
          'á kvöldin',
          'á morgnana',
          'börn',
          'fullorðnir',
          'í bænum',
          'stór',
          'sundlaug',
          'úr steini',
        ],
      },
      A2: {
        genre: 'Lýsing',
        stages: [
          {
            name: 'Hvað er það?',
            parts: [
              {
                text: 'Þetta er ',
              },
              {
                gap: 'safn',
              },
              {
                text: ' sem er ',
              },
              {
                gap: 'í bænum',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Útlit',
            parts: [
              {
                text: 'Það er ',
              },
              {
                gap: 'gamalt',
              },
              {
                text: ' og ',
              },
              {
                gap: 'fallegt',
              },
              {
                text: ' og ',
              },
              {
                gap: 'úr steini',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Notkun',
            parts: [
              {
                text: 'Fólk fer þangað ',
              },
              {
                gap: 'til að læra',
              },
              {
                text: ' um söguna. ',
              },
              {
                gap: 'Nemendur',
              },
              {
                text: ' og ',
              },
              {
                gap: 'kennarar',
              },
              {
                text: ' koma oft ',
              },
              {
                gap: 'á virkum dögum',
              },
              {
                text: '.',
              },
            ],
          },
        ],
        bank: [
          'á virkum dögum',
          'fallegt',
          'gamalt',
          'í bænum',
          'kennarar',
          'nemendur',
          'safn',
          'til að læra',
          'úr steini',
        ],
      },
      B1: {
        genre: 'Lýsing á stað',
        stages: [
          {
            name: 'Staðurinn',
            parts: [
              {
                gap: 'Íþróttahúsið',
              },
              {
                text: ' er ',
              },
              {
                gap: 'stór',
              },
              {
                text: ' bygging við hliðina á ',
              },
              {
                gap: 'skólanum',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Útlit',
            parts: [
              {
                text: 'Það er ',
              },
              {
                gap: 'nútímalegt',
              },
              {
                text: ' og ',
              },
              {
                gap: 'hátt',
              },
              {
                text: ', ',
              },
              {
                gap: 'úr steini',
              },
              {
                text: ' og gleri. Gólfið er ',
              },
              {
                gap: 'úr tré',
              },
              {
                text: ' og veggirnir eru ljósir.',
              },
            ],
          },
          {
            name: 'Notkun',
            parts: [
              {
                gap: 'Nemendur',
              },
              {
                text: ' fara þangað ',
              },
              {
                gap: 'til að stunda íþróttir',
              },
              {
                text: ' ',
              },
              {
                gap: 'á virkum dögum',
              },
              {
                text: '. ',
              },
              {
                gap: 'Um helgar',
              },
              {
                text: ' keppa lið þar og fólk kemur til að horfa.',
              },
            ],
          },
          {
            name: 'Mat',
            parts: [
              {
                text: 'Mér finnst íþróttahúsið skemmtilegt vegna þess að þar hitti ég vini mína.',
              },
            ],
          },
        ],
        bank: [
          'á virkum dögum',
          'hátt',
          'íþróttahúsið',
          'nemendur',
          'nútímalegt',
          'skólanum',
          'stór',
          'til að stunda íþróttir',
          'um helgar',
          'úr steini',
          'úr tré',
        ],
      },
    },
  },
  klaednadur: {
    confirmed: false,
    levels: {
      A1: {
        genre: 'Lýsing',
        stages: [
          {
            name: 'Hvað er það?',
            parts: [
              {
                text: 'Þetta er ',
              },
              {
                gap: 'jakki',
              },
              {
                text: '. Hann er ',
              },
              {
                gap: 'svartur',
              },
              {
                text: ' og ',
              },
              {
                gap: 'úr leðri',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Áferð',
            parts: [
              {
                text: 'Hann er ',
              },
              {
                gap: 'mjúkur',
              },
              {
                text: ' og hlýr.',
              },
            ],
          },
          {
            name: 'Notkun',
            parts: [
              {
                text: 'Maður notar hann úti ',
              },
              {
                gap: 'til að hlýja sér',
              },
              {
                text: '.',
              },
            ],
          },
        ],
        bank: ['jakki', 'mjúkur', 'svartur', 'til að hlýja sér', 'úr leðri'],
      },
      A2: {
        genre: 'Lýsing',
        stages: [
          {
            name: 'Hvað er það?',
            parts: [
              {
                text: 'Þetta er ',
              },
              {
                gap: 'úlpa',
              },
              {
                text: ' sem er ',
              },
              {
                gap: 'blá',
              },
              {
                text: ' og ',
              },
              {
                gap: 'stór',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Áferð',
            parts: [
              {
                text: 'Hún er ',
              },
              {
                gap: 'létt',
              },
              {
                text: ' og ',
              },
              {
                gap: 'mjúk',
              },
              {
                text: ' við snertingu.',
              },
            ],
          },
          {
            name: 'Notkun',
            parts: [
              {
                gap: 'Nemendur',
              },
              {
                text: ' og ',
              },
              {
                gap: 'íþróttamenn',
              },
              {
                text: ' klæðast henni úti ',
              },
              {
                gap: 'á veturna',
              },
              {
                text: '. Maður notar hana ',
              },
              {
                gap: 'til að hlýja sér',
              },
              {
                text: '.',
              },
            ],
          },
        ],
        bank: [
          'á veturna',
          'blá',
          'íþróttamenn',
          'létt',
          'mjúk',
          'nemendur',
          'stór',
          'til að hlýja sér',
          'úlpa',
        ],
      },
      B1: {
        genre: 'Ráðlegging',
        stages: [
          {
            name: 'Vandinn',
            parts: [
              {
                text: 'Á Íslandi er oft ',
              },
              {
                gap: 'kalt',
              },
              {
                text: ', ',
              },
              {
                gap: 'blautt',
              },
              {
                text: ' og hvasst ',
              },
              {
                gap: 'á veturna',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Ráðin',
            parts: [
              {
                text: 'Best er að klæða sig í mörg lög. Fyrst ferðu í ',
              },
              {
                gap: 'bol',
              },
              {
                text: ' og ',
              },
              {
                gap: 'peysu',
              },
              {
                text: ' ',
              },
              {
                gap: 'úr ull',
              },
              {
                text: ', svo í ',
              },
              {
                gap: 'úlpu',
              },
              {
                text: ' sem er ',
              },
              {
                gap: 'létt',
              },
              {
                text: ' og vatnsheld.',
              },
            ],
          },
          {
            name: 'Rökin',
            parts: [
              {
                text: 'Ullin heldur hita þó að hún blotni og úlpan ver þig gegn vindi og rigningu.',
              },
            ],
          },
          {
            name: 'Niðurlag',
            parts: [
              {
                text: 'Gleymdu ekki ',
              },
              {
                gap: 'húfu',
              },
              {
                text: ', ',
              },
              {
                gap: 'trefli',
              },
              {
                text: ' og ',
              },
              {
                gap: 'hönskum',
              },
              {
                text: '. Í réttum fötum geta allir notið þess að vera úti allt árið.',
              },
            ],
          },
        ],
        bank: [
          'á veturna',
          'blautt',
          'bol',
          'húfu',
          'hönskum',
          'kalt',
          'létt',
          'peysu',
          'trefli',
          'úlpu',
          'úr ull',
        ],
      },
    },
  },
  skolinn: {
    confirmed: false,
    levels: {
      A1: {
        genre: 'Lýsing',
        stages: [
          {
            name: 'Hvar er ég?',
            parts: [
              {
                text: 'Þetta er skólinn minn. Ég er ',
              },
              {
                gap: 'í skólastofunni',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Hlutir',
            parts: [
              {
                text: 'Ég er með ',
              },
              {
                gap: 'bók',
              },
              {
                text: ', ',
              },
              {
                gap: 'penna',
              },
              {
                text: ' og ',
              },
              {
                gap: 'blýant',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Í tímanum',
            parts: [
              {
                text: 'Við ',
              },
              {
                gap: 'lesum',
              },
              {
                text: ' og ',
              },
              {
                gap: 'skrifum',
              },
              {
                text: ' ',
              },
              {
                gap: 'á morgnana',
              },
              {
                text: '. ',
              },
              {
                gap: 'Kennarinn',
              },
              {
                text: ' hjálpar okkur.',
              },
            ],
          },
        ],
        bank: [
          'á morgnana',
          'blýant',
          'bók',
          'í skólastofunni',
          'kennarinn',
          'lesum',
          'penna',
          'skrifum',
        ],
      },
      A2: {
        genre: 'Lýsing',
        stages: [
          {
            name: 'Dagurinn',
            parts: [
              {
                text: 'Skólinn byrjar ',
              },
              {
                gap: 'á morgnana',
              },
              {
                text: '. Fyrsti tíminn er ',
              },
              {
                gap: 'stærðfræði',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Í tímanum',
            parts: [
              {
                text: 'Í stærðfræði ',
              },
              {
                gap: 'reiknum',
              },
              {
                text: ' við og ',
              },
              {
                gap: 'vinnum saman',
              },
              {
                text: '. Ég þarf ',
              },
              {
                gap: 'reiknivél',
              },
              {
                text: ' og ',
              },
              {
                gap: 'reglustiku',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Í frímínútum',
            parts: [
              {
                gap: 'Í frímínútum',
              },
              {
                text: ' ',
              },
              {
                gap: 'tölum',
              },
              {
                text: ' við saman ',
              },
              {
                gap: 'á ganginum',
              },
              {
                text: '. ',
              },
              {
                gap: 'Eftir skóla',
              },
              {
                text: ' fer ég á bókasafnið.',
              },
            ],
          },
        ],
        bank: [
          'á ganginum',
          'á morgnana',
          'eftir skóla',
          'í frímínútum',
          'reglustiku',
          'reiknivél',
          'reiknum',
          'stærðfræði',
          'tölum',
          'vinnum saman',
        ],
      },
      B1: {
        genre: 'Frásögn',
        stages: [
          {
            name: 'Inngangur',
            parts: [
              {
                text: 'Í dag lærðum við um ',
              },
              {
                gap: 'breytingar',
              },
              {
                text: ' á loftslagi í ',
              },
              {
                gap: 'náttúrufræði',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Atburðir',
            parts: [
              {
                text: 'Fyrst ',
              },
              {
                gap: 'lásum',
              },
              {
                text: ' við texta í ',
              },
              {
                gap: 'kennslubókinni',
              },
              {
                text: ' og ',
              },
              {
                gap: 'greindum',
              },
              {
                text: ' helstu ',
              },
              {
                gap: 'hugmyndir',
              },
              {
                text: ' hans. Síðan unnum við saman í hópum og bárum saman ',
              },
              {
                gap: 'heimildir',
              },
              {
                text: '.',
              },
            ],
          },
          {
            name: 'Niðurlag',
            parts: [
              {
                text: 'Í lokin ',
              },
              {
                gap: 'kynntum',
              },
              {
                text: ' við niðurstöður okkar. Mér fannst verkefnið ',
              },
              {
                gap: 'mikilvægt',
              },
              {
                text: ' vegna þess að loftslagið hefur ',
              },
              {
                gap: 'áhrif',
              },
              {
                text: ' á alla.',
              },
            ],
          },
        ],
        bank: [
          'áhrif',
          'breytingar',
          'greindum',
          'heimildir',
          'hugmyndir',
          'kennslubókinni',
          'kynntum',
          'lásum',
          'mikilvægt',
          'náttúrufræði',
        ],
      },
    },
  },
};
