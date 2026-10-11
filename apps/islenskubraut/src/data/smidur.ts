// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     content/islenskubraut/
// Regenerate: pnpm islenskubraut:build
//
// Edit the YAML, not this file. A test fails if this file drifts from it.
//
// The word forms in the sentences below come from BÍN and are released under CC BY-SA 4.0
// (https://creativecommons.org/licenses/by-sa/4.0/). Gögnin eru úr Beygingarlýsingu íslensks
// nútímamáls (BÍN) og eru í eigu Stofnunar Árna Magnússonar í íslenskum fræðum.

import type { Level } from './types';

/** One word of a built sentence; `changed` when it differs from the card as printed. */
export interface SmidurWord {
  word: string;
  changed: boolean;
}

/** Who or what the sentence is about, with the gender and number BÍN gives it. */
export interface SmidurSubject {
  text: string;
  gender: 'kk' | 'kvk' | 'hk';
  number: 'ET' | 'FT';
  person: boolean;
}

export interface SmidurFrame {
  frame: string;
  /** The card question whose answers fill the blank; null when the blank takes the subject. */
  question: string | null;
  /** The answers as the card prints them; null when there is nothing to pick. */
  options: string[] | null;
  /** `sentences[subject][option]`, with a single option slot when `options` is null. */
  sentences: SmidurWord[][][];
}

export interface SmidurLevel {
  level: Level;
  /** A teacher has checked these sentences (REVIEW-QUEUE C9); until then the card page does not link here. */
  confirmed: boolean;
  /** The card question the subject is picked from; null for a fixed subject or a person. */
  subjectQuestion: string | null;
  subjects: SmidurSubject[];
  frames: SmidurFrame[];
}

export const smidur: Record<string, SmidurLevel[]> = {
  dyr: [
    {
      level: 'A1',
      confirmed: false,
      subjectQuestion: null,
      subjects: [
        {
          text: 'dýr',
          gender: 'hk',
          number: 'ET',
          person: false,
        },
      ],
      frames: [
        {
          frame: 'Þetta er dýr.',
          question: null,
          options: null,
          sentences: [
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'dýr.',
                  changed: false,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Það er ___.',
          question: 'Stærð',
          options: ['lítið', 'meðalstórt', 'stórt', 'mjög stórt'],
          sentences: [
            [
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lítið.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'meðalstórt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stórt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'mjög',
                  changed: false,
                },
                {
                  word: 'stórt.',
                  changed: false,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Það hefur ___.',
          question: 'Hvernig lítur það út?',
          options: ['feldur', 'fjaðrir', 'hreistur', 'hali'],
          sentences: [
            [
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'hefur',
                  changed: false,
                },
                {
                  word: 'feld.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'hefur',
                  changed: false,
                },
                {
                  word: 'fjaðrir.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'hefur',
                  changed: false,
                },
                {
                  word: 'hreistur.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'hefur',
                  changed: false,
                },
                {
                  word: 'hala.',
                  changed: true,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Það hljómar ___.',
          question: 'Hvaða hljóð gefur það frá sér?',
          options: ['hátt', 'lágt', 'þögult'],
          sentences: [
            [
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'hátt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'lágt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'þögult.',
                  changed: false,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Maður notar það ___.',
          question: 'Til hvers er það notað?',
          options: ['til að gæta', 'til að klappa', 'til að borða'],
          sentences: [
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'gæta.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'klappa.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'borða.',
                  changed: false,
                },
              ],
            ],
          ],
        },
      ],
    },
  ],
  matur: [
    {
      level: 'A1',
      confirmed: false,
      subjectQuestion: 'Hvers konar matur er þetta?',
      subjects: [
        {
          text: 'ávöxtur',
          gender: 'kk',
          number: 'ET',
          person: false,
        },
        {
          text: 'grænmeti',
          gender: 'hk',
          number: 'ET',
          person: false,
        },
        {
          text: 'kjöt',
          gender: 'hk',
          number: 'ET',
          person: false,
        },
        {
          text: 'drykkur',
          gender: 'kk',
          number: 'ET',
          person: false,
        },
      ],
      frames: [
        {
          frame: 'Þetta er ___.',
          question: null,
          options: null,
          sentences: [
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'ávöxtur.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'grænmeti.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'kjöt.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'drykkur.',
                  changed: false,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Það er ___.',
          question: 'Hvernig bragðast það?',
          options: ['sætt', 'salt', 'súrt', 'beiskt'],
          sentences: [
            [
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'sætur.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'saltur.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'súr.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'beiskur.',
                  changed: true,
                },
              ],
            ],
            [
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'sætt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'salt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'súrt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'beiskt.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'sætt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'salt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'súrt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'beiskt.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'sætur.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'saltur.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'súr.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'beiskur.',
                  changed: true,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Maður borðar það ___.',
          question: 'Hvenær er þetta notað?',
          options: ['á morgnana', 'á daginn', 'á kvöldin', 'alltaf'],
          sentences: [
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'morgnana.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'daginn.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'kvöldin.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'alltaf.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'morgnana.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'daginn.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'kvöldin.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'alltaf.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'morgnana.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'daginn.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'kvöldin.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'alltaf.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'morgnana.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'daginn.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'kvöldin.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'alltaf.',
                  changed: false,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Maður notar það ___.',
          question: 'Til hvers er það notað?',
          options: ['til að borða', 'til að drekka'],
          sentences: [
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'borða.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'drekka.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'borða.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'drekka.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'borða.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'drekka.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'borða.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'drekka.',
                  changed: false,
                },
              ],
            ],
          ],
        },
      ],
    },
  ],
  farartaeki: [
    {
      level: 'A1',
      confirmed: false,
      subjectQuestion: 'Hvers konar farartæki er þetta?',
      subjects: [
        {
          text: 'bíll',
          gender: 'kk',
          number: 'ET',
          person: false,
        },
        {
          text: 'rúta',
          gender: 'kvk',
          number: 'ET',
          person: false,
        },
        {
          text: 'hjól',
          gender: 'hk',
          number: 'ET',
          person: false,
        },
        {
          text: 'flugvél',
          gender: 'kvk',
          number: 'ET',
          person: false,
        },
        {
          text: 'skip',
          gender: 'hk',
          number: 'ET',
          person: false,
        },
      ],
      frames: [
        {
          frame: 'Þetta er ___.',
          question: null,
          options: null,
          sentences: [
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'bíll.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'rúta.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'hjól.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'flugvél.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'skip.',
                  changed: false,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Það fer ___.',
          question: 'Hvar er hægt að nota/finna þetta?',
          options: ['á götunni', 'á sjónum', 'í loftinu'],
          sentences: [
            [
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'fer',
                  changed: false,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'götunni.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'fer',
                  changed: false,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'sjónum.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'fer',
                  changed: false,
                },
                {
                  word: 'í',
                  changed: false,
                },
                {
                  word: 'loftinu.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'fer',
                  changed: false,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'götunni.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'fer',
                  changed: false,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'sjónum.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'fer',
                  changed: false,
                },
                {
                  word: 'í',
                  changed: false,
                },
                {
                  word: 'loftinu.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'fer',
                  changed: false,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'götunni.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'fer',
                  changed: false,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'sjónum.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'fer',
                  changed: false,
                },
                {
                  word: 'í',
                  changed: false,
                },
                {
                  word: 'loftinu.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'fer',
                  changed: false,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'götunni.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'fer',
                  changed: false,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'sjónum.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'fer',
                  changed: false,
                },
                {
                  word: 'í',
                  changed: false,
                },
                {
                  word: 'loftinu.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'fer',
                  changed: false,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'götunni.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'fer',
                  changed: false,
                },
                {
                  word: 'á',
                  changed: false,
                },
                {
                  word: 'sjónum.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'fer',
                  changed: false,
                },
                {
                  word: 'í',
                  changed: false,
                },
                {
                  word: 'loftinu.',
                  changed: false,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Það er ___.',
          question: 'Hvernig lítur það út?',
          options: ['stórt', 'lítið', 'með hjólum', 'án hjóla'],
          sentences: [
            [
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stór.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lítill.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'með',
                  changed: false,
                },
                {
                  word: 'hjólum.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'án',
                  changed: false,
                },
                {
                  word: 'hjóla.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stór.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lítil.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'með',
                  changed: false,
                },
                {
                  word: 'hjólum.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'án',
                  changed: false,
                },
                {
                  word: 'hjóla.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stórt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lítið.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'með',
                  changed: false,
                },
                {
                  word: 'hjólum.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'án',
                  changed: false,
                },
                {
                  word: 'hjóla.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stór.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lítil.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'með',
                  changed: false,
                },
                {
                  word: 'hjólum.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'án',
                  changed: false,
                },
                {
                  word: 'hjóla.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stórt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lítið.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'með',
                  changed: false,
                },
                {
                  word: 'hjólum.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'án',
                  changed: false,
                },
                {
                  word: 'hjóla.',
                  changed: false,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Það hljómar ___.',
          question: 'Hvaða hljóð gefur það frá sér?',
          options: ['hátt', 'lágt', 'þögult'],
          sentences: [
            [
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'hátt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'lágt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'þögult.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'hátt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'lágt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'þögult.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'hátt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'lágt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'þögult.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'hátt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'lágt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'þögult.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'hátt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'lágt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'þögult.',
                  changed: false,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Maður notar það ___.',
          question: 'Til hvers er það notað?',
          options: ['til að ferðast', 'til að flytja', 'til að leika sér'],
          sentences: [
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'ferðast.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'flytja.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'leika',
                  changed: false,
                },
                {
                  word: 'sér.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hana',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'ferðast.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hana',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'flytja.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hana',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'leika',
                  changed: false,
                },
                {
                  word: 'sér.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'ferðast.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'flytja.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'leika',
                  changed: false,
                },
                {
                  word: 'sér.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hana',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'ferðast.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hana',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'flytja.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hana',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'leika',
                  changed: false,
                },
                {
                  word: 'sér.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'ferðast.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'flytja.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'leika',
                  changed: false,
                },
                {
                  word: 'sér.',
                  changed: false,
                },
              ],
            ],
          ],
        },
      ],
    },
  ],
  manneskja: [
    {
      level: 'A1',
      confirmed: false,
      subjectQuestion: null,
      subjects: [
        {
          text: 'hún',
          gender: 'kvk',
          number: 'ET',
          person: true,
        },
        {
          text: 'hann',
          gender: 'kk',
          number: 'ET',
          person: true,
        },
      ],
      frames: [
        {
          frame: 'Þetta er ___.',
          question: 'Starf/hlutverk',
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
          sentences: [
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'leikari.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'íþróttamaður.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'söngvari.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stjórnmálamaður.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'nemandi.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'kennari.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'læknir.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lögreglumaður.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'kokkur.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'listamaður.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'leikari.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'íþróttamaður.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'söngvari.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stjórnmálamaður.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'nemandi.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'kennari.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'læknir.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lögreglumaður.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'kokkur.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'listamaður.',
                  changed: false,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Hún/Hann er ___.',
          question: 'Hvernig lítur hún/hann út?',
          options: ['há/hár', 'lág/lágur', 'ung/ungur', 'gömul/gamall'],
          sentences: [
            [
              [
                {
                  word: 'Hún',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'há.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lág.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'ung.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'gömul.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Hann',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'hár.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lágur.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'ungur.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'gamall.',
                  changed: false,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Hún/Hann ___.',
          question: 'Hvað gerir hún/hann?',
          options: ['vinnur', 'lærir', 'leikur sér'],
          sentences: [
            [
              [
                {
                  word: 'Hún',
                  changed: false,
                },
                {
                  word: 'vinnur.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: false,
                },
                {
                  word: 'lærir.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: false,
                },
                {
                  word: 'leikur',
                  changed: false,
                },
                {
                  word: 'sér.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Hann',
                  changed: false,
                },
                {
                  word: 'vinnur.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: false,
                },
                {
                  word: 'lærir.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: false,
                },
                {
                  word: 'leikur',
                  changed: false,
                },
                {
                  word: 'sér.',
                  changed: false,
                },
              ],
            ],
          ],
        },
      ],
    },
  ],
  stadir: [
    {
      level: 'A1',
      confirmed: false,
      subjectQuestion: 'Hvers konar staður er þetta?',
      subjects: [
        {
          text: 'hús',
          gender: 'hk',
          number: 'ET',
          person: false,
        },
        {
          text: 'skóli',
          gender: 'kk',
          number: 'ET',
          person: false,
        },
        {
          text: 'búð',
          gender: 'kvk',
          number: 'ET',
          person: false,
        },
        {
          text: 'sundlaug',
          gender: 'kvk',
          number: 'ET',
          person: false,
        },
      ],
      frames: [
        {
          frame: 'Þetta er ___.',
          question: null,
          options: null,
          sentences: [
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'hús.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'skóli.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'búð.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'sundlaug.',
                  changed: false,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Maður ___ þar.',
          question: 'Hvað gerir maður þar',
          options: ['borðar', 'verslar', 'syndir', 'lærir', 'vinnur', 'sefur', 'leikur sér'],
          sentences: [
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'verslar',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'syndir',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'lærir',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'vinnur',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'sefur',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'leikur',
                  changed: false,
                },
                {
                  word: 'sér',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'verslar',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'syndir',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'lærir',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'vinnur',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'sefur',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'leikur',
                  changed: false,
                },
                {
                  word: 'sér',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'verslar',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'syndir',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'lærir',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'vinnur',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'sefur',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'leikur',
                  changed: false,
                },
                {
                  word: 'sér',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'borðar',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'verslar',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'syndir',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'lærir',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'vinnur',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'sefur',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'leikur',
                  changed: false,
                },
                {
                  word: 'sér',
                  changed: false,
                },
                {
                  word: 'þar.',
                  changed: false,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Það er ___.',
          question: 'Hvernig lítur þetta út?',
          options: ['stórt', 'lítið', 'hátt', 'lágt'],
          sentences: [
            [
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stórt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lítið.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'hátt.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Það',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lágt.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stór.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lítill.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'hár.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lágur.',
                  changed: true,
                },
              ],
            ],
            [
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stór.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lítil.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'há.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lág.',
                  changed: true,
                },
              ],
            ],
            [
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stór.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lítil.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'há.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lág.',
                  changed: true,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Maður notar það ___.',
          question: 'Til hvers er þetta notað?',
          options: ['til að búa', 'til að læra', 'til að versla'],
          sentences: [
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'búa.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'læra.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'það',
                  changed: false,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'versla.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'búa.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'læra.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'versla.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hana',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'búa.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hana',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'læra.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hana',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'versla.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hana',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'búa.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hana',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'læra.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hana',
                  changed: true,
                },
                {
                  word: 'til',
                  changed: false,
                },
                {
                  word: 'að',
                  changed: false,
                },
                {
                  word: 'versla.',
                  changed: false,
                },
              ],
            ],
          ],
        },
      ],
    },
  ],
  klaednadur: [
    {
      level: 'A1',
      confirmed: false,
      subjectQuestion: 'Hvers konar klæðnaður er þetta?',
      subjects: [
        {
          text: 'bolur',
          gender: 'kk',
          number: 'ET',
          person: false,
        },
        {
          text: 'buxur',
          gender: 'kvk',
          number: 'FT',
          person: false,
        },
        {
          text: 'jakki',
          gender: 'kk',
          number: 'ET',
          person: false,
        },
        {
          text: 'skór',
          gender: 'kk',
          number: 'FT',
          person: false,
        },
      ],
      frames: [
        {
          frame: 'Þetta er ___.',
          question: null,
          options: null,
          sentences: [
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'bolur.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'eru',
                  changed: true,
                },
                {
                  word: 'buxur.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'jakki.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Þetta',
                  changed: false,
                },
                {
                  word: 'eru',
                  changed: true,
                },
                {
                  word: 'skór.',
                  changed: false,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Það er ___.',
          question: 'Hvernig lítur það út?',
          options: ['rautt', 'blátt', 'grænt', 'svart', 'hvítt'],
          sentences: [
            [
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'rauður.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'blár.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'grænn.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'svartur.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'hvítur.',
                  changed: true,
                },
              ],
            ],
            [
              [
                {
                  word: 'Þær',
                  changed: true,
                },
                {
                  word: 'eru',
                  changed: true,
                },
                {
                  word: 'rauðar.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Þær',
                  changed: true,
                },
                {
                  word: 'eru',
                  changed: true,
                },
                {
                  word: 'bláar.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Þær',
                  changed: true,
                },
                {
                  word: 'eru',
                  changed: true,
                },
                {
                  word: 'grænar.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Þær',
                  changed: true,
                },
                {
                  word: 'eru',
                  changed: true,
                },
                {
                  word: 'svartar.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Þær',
                  changed: true,
                },
                {
                  word: 'eru',
                  changed: true,
                },
                {
                  word: 'hvítar.',
                  changed: true,
                },
              ],
            ],
            [
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'rauður.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'blár.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'grænn.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'svartur.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'hvítur.',
                  changed: true,
                },
              ],
            ],
            [
              [
                {
                  word: 'Þeir',
                  changed: true,
                },
                {
                  word: 'eru',
                  changed: true,
                },
                {
                  word: 'rauðir.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Þeir',
                  changed: true,
                },
                {
                  word: 'eru',
                  changed: true,
                },
                {
                  word: 'bláir.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Þeir',
                  changed: true,
                },
                {
                  word: 'eru',
                  changed: true,
                },
                {
                  word: 'grænir.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Þeir',
                  changed: true,
                },
                {
                  word: 'eru',
                  changed: true,
                },
                {
                  word: 'svartir.',
                  changed: true,
                },
              ],
              [
                {
                  word: 'Þeir',
                  changed: true,
                },
                {
                  word: 'eru',
                  changed: true,
                },
                {
                  word: 'hvítir.',
                  changed: true,
                },
              ],
            ],
          ],
        },
        {
          frame: 'Maður notar það ___.',
          question: 'Hvar er hægt að nota þetta?',
          options: ['inni', 'úti', 'í skólanum'],
          sentences: [
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'inni.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'úti.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'í',
                  changed: false,
                },
                {
                  word: 'skólanum.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'þær',
                  changed: true,
                },
                {
                  word: 'inni.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'þær',
                  changed: true,
                },
                {
                  word: 'úti.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'þær',
                  changed: true,
                },
                {
                  word: 'í',
                  changed: false,
                },
                {
                  word: 'skólanum.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'inni.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'úti.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'hann',
                  changed: true,
                },
                {
                  word: 'í',
                  changed: false,
                },
                {
                  word: 'skólanum.',
                  changed: false,
                },
              ],
            ],
            [
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'þá',
                  changed: true,
                },
                {
                  word: 'inni.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'þá',
                  changed: true,
                },
                {
                  word: 'úti.',
                  changed: false,
                },
              ],
              [
                {
                  word: 'Maður',
                  changed: false,
                },
                {
                  word: 'notar',
                  changed: false,
                },
                {
                  word: 'þá',
                  changed: true,
                },
                {
                  word: 'í',
                  changed: false,
                },
                {
                  word: 'skólanum.',
                  changed: false,
                },
              ],
            ],
          ],
        },
      ],
    },
  ],
};

export function getSmidur(categoryId: string, level: Level): SmidurLevel | undefined {
  return smidur[categoryId]?.find((s) => s.level === level);
}
