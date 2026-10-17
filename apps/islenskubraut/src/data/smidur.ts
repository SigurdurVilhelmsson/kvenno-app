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

/**
 * Why a word differs from the card: a pronoun or `er` that follows the subject, an adjective that
 * agrees with it, or a noun in the accusative after the frame's `verb`.
 */
export type SmidurWhy =
  | { kind: 'fornafn'; case: 'NF' | 'ÞF'; from: string; to: string }
  | { kind: 'sögn'; from: string; to: string }
  | { kind: 'samræmi'; from: string; to: string }
  | { kind: 'þolfall'; from: string; to: string; verb: string };

/** One word of a built sentence; `changed` when it differs from the card as printed. */
export interface SmidurWord {
  word: string;
  changed: boolean;
  /** Why it changed, when the grammar changed it. */
  why?: SmidurWhy;
  /** The BÍN word an inflected word is a form of, a key of `SmidurLevel.tables`. */
  lemma?: string;
  /** The forms it could have been in its place, the right one among them, for a drill. */
  choices?: string[];
}

/** A word's forms from BÍN, for "Allar myndir orðsins". */
export interface SmidurTable {
  ord: string;
  columns: string[];
  rows: { case: 'NF' | 'ÞF' | 'ÞGF' | 'EF'; forms: string[] }[];
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
  /** Subjects the frame does not fit; the page does not offer it with them, and their slot is empty. */
  except?: string[];
}

export interface SmidurLevel {
  level: Level;
  /** A teacher has checked these sentences (REVIEW-QUEUE C9); until then the card page does not link here. */
  confirmed: boolean;
  /** The card question the subject is picked from; null for a fixed subject or a person. */
  subjectQuestion: string | null;
  subjects: SmidurSubject[];
  frames: SmidurFrame[];
  /** Every inflected word's table, by its BÍN id. */
  tables: Record<string, SmidurTable>;
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
                  why: {
                    kind: 'þolfall',
                    from: 'feldur',
                    to: 'feld',
                    verb: 'hefur',
                  },
                  lemma: 'a0111408557ede4ad0eed438d291839c',
                  choices: ['feldur', 'feld', 'feldi', 'feldar'],
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
                  why: {
                    kind: 'þolfall',
                    from: 'hali',
                    to: 'hala',
                    verb: 'hefur',
                  },
                  lemma: '5f6bd3fe8fe0794b8f5ff531ee4a8217',
                  choices: ['hali', 'hala'],
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
      tables: {
        '5f6bd3fe8fe0794b8f5ff531ee4a8217': {
          ord: 'hali',
          columns: ['eintala', 'fleirtala'],
          rows: [
            {
              case: 'NF',
              forms: ['hali', 'halar'],
            },
            {
              case: 'ÞF',
              forms: ['hala', 'hala'],
            },
            {
              case: 'ÞGF',
              forms: ['hala', 'hölum'],
            },
            {
              case: 'EF',
              forms: ['hala', 'hala'],
            },
          ],
        },
        a0111408557ede4ad0eed438d291839c: {
          ord: 'feldur',
          columns: ['eintala', 'fleirtala'],
          rows: [
            {
              case: 'NF',
              forms: ['feldur', 'feldir'],
            },
            {
              case: 'ÞF',
              forms: ['feld', 'feldi'],
            },
            {
              case: 'ÞGF',
              forms: ['feldi', 'feldum'],
            },
            {
              case: 'EF',
              forms: ['feldar', 'felda'],
            },
          ],
        },
      },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'sætur.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'sætt',
                    to: 'sætur',
                  },
                  lemma: '6f648651fb76e7f8477118a11ed0ed4a',
                  choices: ['sætur', 'sæt', 'sætt'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'saltur.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'salt',
                    to: 'saltur',
                  },
                  lemma: 'a26c2ab5ed64671ca9010ee667271846',
                  choices: ['saltur', 'sölt', 'salt'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'súr.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'súrt',
                    to: 'súr',
                  },
                  lemma: 'ecb2f66d4bd6c33711df87ce7e1eea83',
                  choices: ['súr', 'súrt'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'beiskur.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'beiskt',
                    to: 'beiskur',
                  },
                  lemma: '970595c1ee8ee4ed435e9c03d1cc9497',
                  choices: ['beiskur', 'beisk', 'beiskt'],
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'sætur.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'sætt',
                    to: 'sætur',
                  },
                  lemma: '6f648651fb76e7f8477118a11ed0ed4a',
                  choices: ['sætur', 'sæt', 'sætt'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'saltur.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'salt',
                    to: 'saltur',
                  },
                  lemma: 'a26c2ab5ed64671ca9010ee667271846',
                  choices: ['saltur', 'sölt', 'salt'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'súr.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'súrt',
                    to: 'súr',
                  },
                  lemma: 'ecb2f66d4bd6c33711df87ce7e1eea83',
                  choices: ['súr', 'súrt'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'beiskur.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'beiskt',
                    to: 'beiskur',
                  },
                  lemma: '970595c1ee8ee4ed435e9c03d1cc9497',
                  choices: ['beiskur', 'beisk', 'beiskt'],
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
            [],
          ],
          except: ['drykkur'],
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
      tables: {
        '6f648651fb76e7f8477118a11ed0ed4a': {
          ord: 'sætur',
          columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
          rows: [
            {
              case: 'NF',
              forms: ['sætur', 'sæt', 'sætt'],
            },
            {
              case: 'ÞF',
              forms: ['sætan', 'sæta', 'sætt'],
            },
            {
              case: 'ÞGF',
              forms: ['sætum', 'sætri', 'sætu'],
            },
            {
              case: 'EF',
              forms: ['sæts', 'sætrar', 'sæts'],
            },
          ],
        },
        '970595c1ee8ee4ed435e9c03d1cc9497': {
          ord: 'beiskur',
          columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
          rows: [
            {
              case: 'NF',
              forms: ['beiskur', 'beisk', 'beiskt'],
            },
            {
              case: 'ÞF',
              forms: ['beiskan', 'beiska', 'beiskt'],
            },
            {
              case: 'ÞGF',
              forms: ['beiskum', 'beiskri', 'beisku'],
            },
            {
              case: 'EF',
              forms: ['beisks', 'beiskrar', 'beisks'],
            },
          ],
        },
        a26c2ab5ed64671ca9010ee667271846: {
          ord: 'saltur',
          columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
          rows: [
            {
              case: 'NF',
              forms: ['saltur', 'sölt', 'salt'],
            },
            {
              case: 'ÞF',
              forms: ['saltan', 'salta', 'salt'],
            },
            {
              case: 'ÞGF',
              forms: ['söltum', 'saltri', 'söltu'],
            },
            {
              case: 'EF',
              forms: ['salts', 'saltrar', 'salts'],
            },
          ],
        },
        ecb2f66d4bd6c33711df87ce7e1eea83: {
          ord: 'súr',
          columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
          rows: [
            {
              case: 'NF',
              forms: ['súr', 'súr', 'súrt'],
            },
            {
              case: 'ÞF',
              forms: ['súran', 'súra', 'súrt'],
            },
            {
              case: 'ÞGF',
              forms: ['súrum', 'súrri', 'súru'],
            },
            {
              case: 'EF',
              forms: ['súrs', 'súrrar', 'súrs'],
            },
          ],
        },
      },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stór.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'stórt',
                    to: 'stór',
                  },
                  lemma: '5cbb66c54ccb1292ac69d8defa33551d',
                  choices: ['stór', 'stórt'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lítill.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'lítið',
                    to: 'lítill',
                  },
                  lemma: '5d032af5e6222d9b78041a86c2485c33',
                  choices: ['lítill', 'lítil', 'lítið'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stór.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'stórt',
                    to: 'stór',
                  },
                  lemma: '5cbb66c54ccb1292ac69d8defa33551d',
                  choices: ['stór', 'stórt'],
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lítil.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'lítið',
                    to: 'lítil',
                  },
                  lemma: '5d032af5e6222d9b78041a86c2485c33',
                  choices: ['lítill', 'lítil', 'lítið'],
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stór.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'stórt',
                    to: 'stór',
                  },
                  lemma: '5cbb66c54ccb1292ac69d8defa33551d',
                  choices: ['stór', 'stórt'],
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lítil.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'lítið',
                    to: 'lítil',
                  },
                  lemma: '5d032af5e6222d9b78041a86c2485c33',
                  choices: ['lítill', 'lítil', 'lítið'],
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'þögull.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'þögult',
                    to: 'þögull',
                  },
                  lemma: 'e2cc91a3f2d6627b8760297a68af8a2a',
                  choices: ['þögull', 'þögul', 'þögult'],
                },
              ],
            ],
            [
              [
                {
                  word: 'Hún',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'þögul.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'þögult',
                    to: 'þögul',
                  },
                  lemma: 'e2cc91a3f2d6627b8760297a68af8a2a',
                  choices: ['þögull', 'þögul', 'þögult'],
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
                },
                {
                  word: 'hljómar',
                  changed: false,
                },
                {
                  word: 'þögul.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'þögult',
                    to: 'þögul',
                  },
                  lemma: 'e2cc91a3f2d6627b8760297a68af8a2a',
                  choices: ['þögull', 'þögul', 'þögult'],
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hana',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hana',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hana',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hana',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hana',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hana',
                  },
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
      tables: {
        '5cbb66c54ccb1292ac69d8defa33551d': {
          ord: 'stór',
          columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
          rows: [
            {
              case: 'NF',
              forms: ['stór', 'stór', 'stórt'],
            },
            {
              case: 'ÞF',
              forms: ['stóran', 'stóra', 'stórt'],
            },
            {
              case: 'ÞGF',
              forms: ['stórum', 'stórri', 'stóru'],
            },
            {
              case: 'EF',
              forms: ['stórs', 'stórrar', 'stórs'],
            },
          ],
        },
        '5d032af5e6222d9b78041a86c2485c33': {
          ord: 'lítill',
          columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
          rows: [
            {
              case: 'NF',
              forms: ['lítill', 'lítil', 'lítið'],
            },
            {
              case: 'ÞF',
              forms: ['lítinn', 'litla', 'lítið'],
            },
            {
              case: 'ÞGF',
              forms: ['litlum', 'lítilli', 'litlu'],
            },
            {
              case: 'EF',
              forms: ['lítils', 'lítillar', 'lítils'],
            },
          ],
        },
        e2cc91a3f2d6627b8760297a68af8a2a: {
          ord: 'þögull',
          columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
          rows: [
            {
              case: 'NF',
              forms: ['þögull', 'þögul', 'þögult'],
            },
            {
              case: 'ÞF',
              forms: ['þöglan', 'þögla', 'þögult'],
            },
            {
              case: 'ÞGF',
              forms: ['þöglum', 'þögulli', 'þöglu'],
            },
            {
              case: 'EF',
              forms: ['þöguls', 'þögullar', 'þöguls'],
            },
          ],
        },
      },
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
      tables: {},
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stór.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'stórt',
                    to: 'stór',
                  },
                  lemma: '5cbb66c54ccb1292ac69d8defa33551d',
                  choices: ['stór', 'stórt'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lítill.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'lítið',
                    to: 'lítill',
                  },
                  lemma: '5d032af5e6222d9b78041a86c2485c33',
                  choices: ['lítill', 'lítil', 'lítið'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'hár.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'hátt',
                    to: 'hár',
                  },
                  lemma: '92c7449ecc1b839183c5d589637b99a6',
                  choices: ['hár', 'há', 'hátt'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lágur.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'lágt',
                    to: 'lágur',
                  },
                  lemma: '239a1d272af5f0f4789b8dfab26851da',
                  choices: ['lágur', 'lág', 'lágt'],
                },
              ],
            ],
            [
              [
                {
                  word: 'Hún',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stór.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'stórt',
                    to: 'stór',
                  },
                  lemma: '5cbb66c54ccb1292ac69d8defa33551d',
                  choices: ['stór', 'stórt'],
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lítil.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'lítið',
                    to: 'lítil',
                  },
                  lemma: '5d032af5e6222d9b78041a86c2485c33',
                  choices: ['lítill', 'lítil', 'lítið'],
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'há.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'hátt',
                    to: 'há',
                  },
                  lemma: '92c7449ecc1b839183c5d589637b99a6',
                  choices: ['hár', 'há', 'hátt'],
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lág.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'lágt',
                    to: 'lág',
                  },
                  lemma: '239a1d272af5f0f4789b8dfab26851da',
                  choices: ['lágur', 'lág', 'lágt'],
                },
              ],
            ],
            [
              [
                {
                  word: 'Hún',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'stór.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'stórt',
                    to: 'stór',
                  },
                  lemma: '5cbb66c54ccb1292ac69d8defa33551d',
                  choices: ['stór', 'stórt'],
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lítil.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'lítið',
                    to: 'lítil',
                  },
                  lemma: '5d032af5e6222d9b78041a86c2485c33',
                  choices: ['lítill', 'lítil', 'lítið'],
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'há.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'hátt',
                    to: 'há',
                  },
                  lemma: '92c7449ecc1b839183c5d589637b99a6',
                  choices: ['hár', 'há', 'hátt'],
                },
              ],
              [
                {
                  word: 'Hún',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hún',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'lág.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'lágt',
                    to: 'lág',
                  },
                  lemma: '239a1d272af5f0f4789b8dfab26851da',
                  choices: ['lágur', 'lág', 'lágt'],
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hana',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hana',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hana',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hana',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hana',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hana',
                  },
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
      tables: {
        '239a1d272af5f0f4789b8dfab26851da': {
          ord: 'lágur',
          columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
          rows: [
            {
              case: 'NF',
              forms: ['lágur', 'lág', 'lágt'],
            },
            {
              case: 'ÞF',
              forms: ['lágan', 'lága', 'lágt'],
            },
            {
              case: 'ÞGF',
              forms: ['lágum', 'lágri', 'lágu'],
            },
            {
              case: 'EF',
              forms: ['lágs', 'lágrar', 'lágs'],
            },
          ],
        },
        '5cbb66c54ccb1292ac69d8defa33551d': {
          ord: 'stór',
          columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
          rows: [
            {
              case: 'NF',
              forms: ['stór', 'stór', 'stórt'],
            },
            {
              case: 'ÞF',
              forms: ['stóran', 'stóra', 'stórt'],
            },
            {
              case: 'ÞGF',
              forms: ['stórum', 'stórri', 'stóru'],
            },
            {
              case: 'EF',
              forms: ['stórs', 'stórrar', 'stórs'],
            },
          ],
        },
        '5d032af5e6222d9b78041a86c2485c33': {
          ord: 'lítill',
          columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
          rows: [
            {
              case: 'NF',
              forms: ['lítill', 'lítil', 'lítið'],
            },
            {
              case: 'ÞF',
              forms: ['lítinn', 'litla', 'lítið'],
            },
            {
              case: 'ÞGF',
              forms: ['litlum', 'lítilli', 'litlu'],
            },
            {
              case: 'EF',
              forms: ['lítils', 'lítillar', 'lítils'],
            },
          ],
        },
        '92c7449ecc1b839183c5d589637b99a6': {
          ord: 'hár',
          columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
          rows: [
            {
              case: 'NF',
              forms: ['hár', 'há', 'hátt'],
            },
            {
              case: 'ÞF',
              forms: ['háan', 'háa', 'hátt'],
            },
            {
              case: 'ÞGF',
              forms: ['háum', 'hárri', 'háu'],
            },
            {
              case: 'EF',
              forms: ['hás', 'hárrar', 'hás'],
            },
          ],
        },
      },
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
                  why: {
                    kind: 'sögn',
                    from: 'er',
                    to: 'eru',
                  },
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
                  why: {
                    kind: 'sögn',
                    from: 'er',
                    to: 'eru',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'rauður.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'rautt',
                    to: 'rauður',
                  },
                  lemma: '796fb80ee05b5a2a0a2c2e0cc6268121',
                  choices: ['rauður', 'rauð', 'rautt'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'blár.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'blátt',
                    to: 'blár',
                  },
                  lemma: '31dc39020a2f5c6f0eab32860ce9846d',
                  choices: ['blár', 'blá', 'blátt'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'grænn.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'grænt',
                    to: 'grænn',
                  },
                  lemma: '822554fe7c405d599bd0268af19d3f14',
                  choices: ['grænn', 'græn', 'grænt'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'svartur.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'svart',
                    to: 'svartur',
                  },
                  lemma: 'cdea3bfdb358092fcd4dfa49413dfc03',
                  choices: ['svartur', 'svört', 'svart'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'hvítur.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'hvítt',
                    to: 'hvítur',
                  },
                  lemma: 'b6b013d4116e7ea449808e200b9ce564',
                  choices: ['hvítur', 'hvít', 'hvítt'],
                },
              ],
            ],
            [
              [
                {
                  word: 'Þær',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'þær',
                  },
                },
                {
                  word: 'eru',
                  changed: true,
                  why: {
                    kind: 'sögn',
                    from: 'er',
                    to: 'eru',
                  },
                },
                {
                  word: 'rauðar.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'rautt',
                    to: 'rauðar',
                  },
                  lemma: '796fb80ee05b5a2a0a2c2e0cc6268121',
                  choices: ['rauðir', 'rauðar', 'rauð'],
                },
              ],
              [
                {
                  word: 'Þær',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'þær',
                  },
                },
                {
                  word: 'eru',
                  changed: true,
                  why: {
                    kind: 'sögn',
                    from: 'er',
                    to: 'eru',
                  },
                },
                {
                  word: 'bláar.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'blátt',
                    to: 'bláar',
                  },
                  lemma: '31dc39020a2f5c6f0eab32860ce9846d',
                  choices: ['bláir', 'bláar', 'blá'],
                },
              ],
              [
                {
                  word: 'Þær',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'þær',
                  },
                },
                {
                  word: 'eru',
                  changed: true,
                  why: {
                    kind: 'sögn',
                    from: 'er',
                    to: 'eru',
                  },
                },
                {
                  word: 'grænar.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'grænt',
                    to: 'grænar',
                  },
                  lemma: '822554fe7c405d599bd0268af19d3f14',
                  choices: ['grænir', 'grænar', 'græn'],
                },
              ],
              [
                {
                  word: 'Þær',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'þær',
                  },
                },
                {
                  word: 'eru',
                  changed: true,
                  why: {
                    kind: 'sögn',
                    from: 'er',
                    to: 'eru',
                  },
                },
                {
                  word: 'svartar.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'svart',
                    to: 'svartar',
                  },
                  lemma: 'cdea3bfdb358092fcd4dfa49413dfc03',
                  choices: ['svartir', 'svartar', 'svört'],
                },
              ],
              [
                {
                  word: 'Þær',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'þær',
                  },
                },
                {
                  word: 'eru',
                  changed: true,
                  why: {
                    kind: 'sögn',
                    from: 'er',
                    to: 'eru',
                  },
                },
                {
                  word: 'hvítar.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'hvítt',
                    to: 'hvítar',
                  },
                  lemma: 'b6b013d4116e7ea449808e200b9ce564',
                  choices: ['hvítir', 'hvítar', 'hvít'],
                },
              ],
            ],
            [
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'rauður.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'rautt',
                    to: 'rauður',
                  },
                  lemma: '796fb80ee05b5a2a0a2c2e0cc6268121',
                  choices: ['rauður', 'rauð', 'rautt'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'blár.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'blátt',
                    to: 'blár',
                  },
                  lemma: '31dc39020a2f5c6f0eab32860ce9846d',
                  choices: ['blár', 'blá', 'blátt'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'grænn.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'grænt',
                    to: 'grænn',
                  },
                  lemma: '822554fe7c405d599bd0268af19d3f14',
                  choices: ['grænn', 'græn', 'grænt'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'svartur.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'svart',
                    to: 'svartur',
                  },
                  lemma: 'cdea3bfdb358092fcd4dfa49413dfc03',
                  choices: ['svartur', 'svört', 'svart'],
                },
              ],
              [
                {
                  word: 'Hann',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'hann',
                  },
                },
                {
                  word: 'er',
                  changed: false,
                },
                {
                  word: 'hvítur.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'hvítt',
                    to: 'hvítur',
                  },
                  lemma: 'b6b013d4116e7ea449808e200b9ce564',
                  choices: ['hvítur', 'hvít', 'hvítt'],
                },
              ],
            ],
            [
              [
                {
                  word: 'Þeir',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'þeir',
                  },
                },
                {
                  word: 'eru',
                  changed: true,
                  why: {
                    kind: 'sögn',
                    from: 'er',
                    to: 'eru',
                  },
                },
                {
                  word: 'rauðir.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'rautt',
                    to: 'rauðir',
                  },
                  lemma: '796fb80ee05b5a2a0a2c2e0cc6268121',
                  choices: ['rauðir', 'rauðar', 'rauð'],
                },
              ],
              [
                {
                  word: 'Þeir',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'þeir',
                  },
                },
                {
                  word: 'eru',
                  changed: true,
                  why: {
                    kind: 'sögn',
                    from: 'er',
                    to: 'eru',
                  },
                },
                {
                  word: 'bláir.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'blátt',
                    to: 'bláir',
                  },
                  lemma: '31dc39020a2f5c6f0eab32860ce9846d',
                  choices: ['bláir', 'bláar', 'blá'],
                },
              ],
              [
                {
                  word: 'Þeir',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'þeir',
                  },
                },
                {
                  word: 'eru',
                  changed: true,
                  why: {
                    kind: 'sögn',
                    from: 'er',
                    to: 'eru',
                  },
                },
                {
                  word: 'grænir.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'grænt',
                    to: 'grænir',
                  },
                  lemma: '822554fe7c405d599bd0268af19d3f14',
                  choices: ['grænir', 'grænar', 'græn'],
                },
              ],
              [
                {
                  word: 'Þeir',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'þeir',
                  },
                },
                {
                  word: 'eru',
                  changed: true,
                  why: {
                    kind: 'sögn',
                    from: 'er',
                    to: 'eru',
                  },
                },
                {
                  word: 'svartir.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'svart',
                    to: 'svartir',
                  },
                  lemma: 'cdea3bfdb358092fcd4dfa49413dfc03',
                  choices: ['svartir', 'svartar', 'svört'],
                },
              ],
              [
                {
                  word: 'Þeir',
                  changed: true,
                  why: {
                    kind: 'fornafn',
                    case: 'NF',
                    from: 'það',
                    to: 'þeir',
                  },
                },
                {
                  word: 'eru',
                  changed: true,
                  why: {
                    kind: 'sögn',
                    from: 'er',
                    to: 'eru',
                  },
                },
                {
                  word: 'hvítir.',
                  changed: true,
                  why: {
                    kind: 'samræmi',
                    from: 'hvítt',
                    to: 'hvítir',
                  },
                  lemma: 'b6b013d4116e7ea449808e200b9ce564',
                  choices: ['hvítir', 'hvítar', 'hvít'],
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'þær',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'þær',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'þær',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'hann',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'þá',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'þá',
                  },
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
                  why: {
                    kind: 'fornafn',
                    case: 'ÞF',
                    from: 'það',
                    to: 'þá',
                  },
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
      tables: {
        '31dc39020a2f5c6f0eab32860ce9846d': {
          ord: 'blár',
          columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
          rows: [
            {
              case: 'NF',
              forms: ['blár', 'blá', 'blátt'],
            },
            {
              case: 'ÞF',
              forms: ['bláan', 'bláa', 'blátt'],
            },
            {
              case: 'ÞGF',
              forms: ['bláum', 'blárri', 'bláu'],
            },
            {
              case: 'EF',
              forms: ['blás', 'blárrar', 'blás'],
            },
          ],
        },
        '796fb80ee05b5a2a0a2c2e0cc6268121': {
          ord: 'rauður',
          columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
          rows: [
            {
              case: 'NF',
              forms: ['rauður', 'rauð', 'rautt'],
            },
            {
              case: 'ÞF',
              forms: ['rauðan', 'rauða', 'rautt'],
            },
            {
              case: 'ÞGF',
              forms: ['rauðum', 'rauðri', 'rauðu'],
            },
            {
              case: 'EF',
              forms: ['rauðs', 'rauðrar', 'rauðs'],
            },
          ],
        },
        '822554fe7c405d599bd0268af19d3f14': {
          ord: 'grænn',
          columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
          rows: [
            {
              case: 'NF',
              forms: ['grænn', 'græn', 'grænt'],
            },
            {
              case: 'ÞF',
              forms: ['grænan', 'græna', 'grænt'],
            },
            {
              case: 'ÞGF',
              forms: ['grænum', 'grænni', 'grænu'],
            },
            {
              case: 'EF',
              forms: ['græns', 'grænnar', 'græns'],
            },
          ],
        },
        b6b013d4116e7ea449808e200b9ce564: {
          ord: 'hvítur',
          columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
          rows: [
            {
              case: 'NF',
              forms: ['hvítur', 'hvít', 'hvítt'],
            },
            {
              case: 'ÞF',
              forms: ['hvítan', 'hvíta', 'hvítt'],
            },
            {
              case: 'ÞGF',
              forms: ['hvítum', 'hvítri', 'hvítu'],
            },
            {
              case: 'EF',
              forms: ['hvíts', 'hvítrar', 'hvíts'],
            },
          ],
        },
        cdea3bfdb358092fcd4dfa49413dfc03: {
          ord: 'svartur',
          columns: ['karlkyn', 'kvenkyn', 'hvorugkyn'],
          rows: [
            {
              case: 'NF',
              forms: ['svartur', 'svört', 'svart'],
            },
            {
              case: 'ÞF',
              forms: ['svartan', 'svarta', 'svart'],
            },
            {
              case: 'ÞGF',
              forms: ['svörtum', 'svartri', 'svörtu'],
            },
            {
              case: 'EF',
              forms: ['svarts', 'svartrar', 'svarts'],
            },
          ],
        },
      },
    },
  ],
};

export function getSmidur(categoryId: string, level: Level): SmidurLevel | undefined {
  return smidur[categoryId]?.find((s) => s.level === level);
}
