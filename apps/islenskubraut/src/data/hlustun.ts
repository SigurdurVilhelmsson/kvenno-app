// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     content/islenskubraut/
// Regenerate: pnpm islenskubraut:build
//
// Edit the YAML, not this file. A test fails if this file drifts from it.
//
// What the recogniser heard comes from content/islenskubraut/hljod/hlustun.json (hljod/hlustun.py).

import type { Level } from './types';

/** Where a text is on the cards; `level` is null on the vocabulary page, the same at every level. */
export interface HlustunPlace {
  category: string;
  level: Level | null;
  where: string;
}

export interface HlustunClip {
  text: string;
  file: string;
  /** A hash of the audio: a verdict given to another version is for a recording since remade. */
  v: string;
  approved: boolean;
  /** Heard as wrong (`rangt` in hljod.yaml): students never hear it. */
  rejected?: true;
  places: HlustunPlace[];
  /** What the voice was told to say, where it is not the text as printed (`Hún eða Hann er …`). */
  say?: string;
  /** What the recogniser heard, and how much it differs from the text (0 is a match). */
  heard?: string;
  score?: number;
}

export const hlustun: HlustunClip[] = [
  {
    text: 'gæludýr',
    file: 'f941ea55c17c5822.mp3',
    v: 'b39bcc495dff',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvers konar dýr er þetta?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvers konar dýr er þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvers konar dýr er þetta?',
      },
    ],
    heard: 'gæludýr',
    score: 0,
  },
  {
    text: 'villt dýr',
    file: '7d64500908952a58.mp3',
    v: 'f2d122001baf',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvers konar dýr er þetta?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvers konar dýr er þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvers konar dýr er þetta?',
      },
    ],
    heard: 'vilt dýr',
    score: 0.111,
  },
  {
    text: 'húsdýr (búfénaður)',
    file: '077ccd8b03c35104.mp3',
    v: '3aa193dd4661',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Tegund',
      },
    ],
    say: 'húsdýr, búfénaður',
    heard: 'kúsdýr búfénaður',
    score: 0.062,
  },
  {
    text: 'spendýr',
    file: '564bb810e05e9fe7.mp3',
    v: '89edf933c955',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Líffræðilegur flokkur',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvers konar dýr er þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvers konar dýr er þetta?',
      },
    ],
    heard: 'spendýr',
    score: 0,
  },
  {
    text: 'fugl',
    file: '9f8d083bbd0ddf65.mp3',
    v: '44386cf0d6d5',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Líffræðilegur flokkur',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvers konar dýr er þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvers konar dýr er þetta?',
      },
    ],
    heard: 'fugl',
    score: 0,
  },
  {
    text: 'fiskur',
    file: '4779cb4cab848560.mp3',
    v: 'd610f497d734',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Líffræðilegur flokkur',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvers konar dýr er þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvers konar dýr er þetta?',
      },
      {
        category: 'matur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvers konar matur er þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvers konar matur er þetta?',
      },
    ],
    heard: 'er fiskur',
    score: 0,
  },
  {
    text: 'skriðdýr',
    file: '5ede3657524f9663.mp3',
    v: '7770654e9a85',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Líffræðilegur flokkur',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvers konar dýr er þetta?',
      },
    ],
    heard: 'skrið dýr',
    score: 0.125,
  },
  {
    text: 'froskdýr',
    file: 'dd458c582acf5999.mp3',
    v: '468f5fa4bfd7',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Líffræðilegur flokkur',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvers konar dýr er þetta?',
      },
    ],
    heard: 'frosk dýr',
    score: 0.125,
  },
  {
    text: 'skordýr',
    file: '053e16fdcb8b7a10.mp3',
    v: 'c755ed14f3ad',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Líffræðilegur flokkur',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvers konar dýr er þetta?',
      },
    ],
    heard: 'skordýr',
    score: 0,
  },
  {
    text: 'á landi',
    file: '95187acd994d2e4c.mp3',
    v: '336a03dfa525',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Búsvæði',
      },
      {
        category: 'farartaeki',
        level: null,
        where: 'Hvar fer það',
      },
    ],
    heard: 'á landi',
    score: 0,
  },
  {
    text: 'í vatni',
    file: 'b678eff2922b2776.mp3',
    v: '08d1bbb41297',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Búsvæði',
      },
    ],
    heard: 'í vatni',
    score: 0,
  },
  {
    text: 'í lofti',
    file: '687c0b16497507eb.mp3',
    v: 'aa997cc7fc10',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Búsvæði',
      },
      {
        category: 'farartaeki',
        level: null,
        where: 'Hvar fer það',
      },
    ],
    heard: 'í lofti',
    score: 0,
  },
  {
    text: 'á landi og í vatni',
    file: 'c4870e62003e3aa5.mp3',
    v: '5fbf2d40cf08',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Búsvæði',
      },
    ],
    heard: 'frá landi og í vatni',
    score: 0,
  },
  {
    text: 'feld',
    file: '5f235bb1a2f6b7ae.mp3',
    v: '737f63ea7e31',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Útlit',
      },
    ],
    heard: 'felld',
    score: 0.25,
  },
  {
    text: 'fjaðrir',
    file: 'f622096a3f83a8fb.mp3',
    v: 'af55aec7c275',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Útlit',
      },
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'fjaðrir',
    score: 0,
  },
  {
    text: 'hreistur',
    file: '055da2537eb7c9ba.mp3',
    v: '64e12eb17a11',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Útlit',
      },
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'hreistur',
    score: 0,
  },
  {
    text: 'hala',
    file: '05cb18b8f9090923.mp3',
    v: '4d35e38a8761',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Útlit',
      },
    ],
    heard: 'um hala',
    score: 0,
  },
  {
    text: 'gogg',
    file: '4b2a4c648e3906ac.mp3',
    v: '5b4e9c5f09fe',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Útlit',
      },
    ],
    heard: 'gok',
    score: 0.5,
  },
  {
    text: 'horn',
    file: '9543098f1704584b.mp3',
    v: '025ea6bedee2',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Útlit',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'horn',
    score: 0,
  },
  {
    text: 'fjóra fætur',
    file: '87242dd05829c10a.mp3',
    v: 'def6613469e6',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Útlit',
      },
    ],
    heard: 'fjóra fætur',
    score: 0,
  },
  {
    text: 'tvo fætur',
    file: 'fe025fc1fa2db46b.mp3',
    v: 'd09cc4218e45',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Útlit',
      },
    ],
    heard: 'tvo fætur',
    score: 0,
  },
  {
    text: 'flýgur',
    file: '7c390f11b6719607.mp3',
    v: '69bdcb41e6df',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Hreyfing',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'og flýgur',
    score: 0,
  },
  {
    text: 'syndir',
    file: 'ec7d3e6eb1f82f5f.mp3',
    v: 'c7068dc1ec1d',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Hreyfing',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'stadir',
        level: null,
        where: 'Hvað gerir maður þar',
      },
    ],
    heard: 'sindir',
    score: 0.167,
  },
  {
    text: 'hleypur',
    file: 'cae0b1b1a408d30e.mp3',
    v: '18c807d64a1b',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Hreyfing',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'hleypur',
    score: 0,
  },
  {
    text: 'lítið',
    file: '21638f88a9389c4d.mp3',
    v: 'bf20a40ae7f6',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Stærð',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: null,
        where: 'Stærð',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvernig lítur þetta út?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvernig lítur þetta út?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lítur þetta út?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'lítið',
    score: 0,
  },
  {
    text: 'meðalstórt',
    file: 'f8105bfe1603a188.mp3',
    v: 'e565490ae023',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Stærð',
      },
      {
        category: 'farartaeki',
        level: null,
        where: 'Stærð',
      },
    ],
    heard: 'meðal stórt',
    score: 0.1,
  },
  {
    text: 'stórt',
    file: 'cb0dbc0459847d35.mp3',
    v: '2564f36e15f2',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Stærð',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: null,
        where: 'Stærð',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvernig lítur þetta út?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvernig lítur þetta út?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lítur þetta út?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'mög stórt',
    score: 0,
  },
  {
    text: 'mjög stórt',
    file: 'e78a66e313907ac8.mp3',
    v: 'b1ed7d375255',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Stærð',
      },
    ],
    heard: 'mjög stórt',
    score: 0,
  },
  {
    text: 'plöntur (grasæta)',
    file: 'd737d209fca3f03e.mp3',
    v: 'b0041bd1f9a2',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Fæða',
      },
    ],
    say: 'plöntur, grasæta',
    heard: 'plöntur grasæta',
    score: 0,
  },
  {
    text: 'kjöt (kjötæta)',
    file: 'aa9681417b5b7514.mp3',
    v: 'e23f3aed18d2',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Fæða',
      },
    ],
    say: 'kjöt, kjötæta',
    heard: 'kjöt kjötæta',
    score: 0,
  },
  {
    text: 'bæði (alæta)',
    file: '6bdae9e7297c2751.mp3',
    v: '9da973fc5090',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: null,
        where: 'Fæða',
      },
    ],
    say: 'bæði, alæta',
    heard: 'bæði alæta',
    score: 0,
  },
  {
    text: 'húsdýr',
    file: '3df681b76f4696c7.mp3',
    v: 'd3efe59848bc',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvers konar dýr er þetta?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvers konar dýr er þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvers konar dýr er þetta?',
      },
    ],
    heard: 'og hús dýr',
    score: 0.167,
  },
  {
    text: 'feldur',
    file: '56cabd00020f38bb.mp3',
    v: '96874e5ffb9a',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'feldur',
    score: 0,
  },
  {
    text: 'hali',
    file: '0f95cbece950c380.mp3',
    v: '1df04f261688',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'um hali',
    score: 0,
  },
  {
    text: 'goggur',
    file: '93a86ff2a53ec0b1.mp3',
    v: '71b62ca76dc1',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'bokur',
    score: 0.5,
  },
  {
    text: 'fjórir fætur',
    file: 'a6f7918efbfebb2e.mp3',
    v: '02b6deca0412',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'fjórir fætur',
    score: 0,
  },
  {
    text: 'tveir fætur',
    file: '36b94d48e64fa35e.mp3',
    v: 'd9bf66cc10a3',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'tveir fætur',
    score: 0,
  },
  {
    text: 'mjúkt',
    file: '52db7ce5279b3309.mp3',
    v: 'baea6f1e821c',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: null,
        where: 'Áferð/form',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
    ],
    heard: 'mjúkt',
    score: 0,
  },
  {
    text: 'hart',
    file: 'dd6b079f455bea52.mp3',
    v: '3fda84b40e39',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: null,
        where: 'Áferð/form',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
    ],
    heard: 'en hart',
    score: 0,
  },
  {
    text: 'slétt',
    file: 'b89b7a72751dc80c.mp3',
    v: '0c378f5b023e',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
    ],
    heard: 'og slétt',
    score: 0,
  },
  {
    text: 'gróft',
    file: 'd456ea41c1305c50.mp3',
    v: '85aeb409bc12',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
    ],
    heard: 'og gróft',
    score: 0,
  },
  {
    text: 'þungt',
    file: 'a2e78239d6fc2c53.mp3',
    v: 'ecdf1ca3918d',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
    ],
    heard: 'þungt',
    score: 0,
  },
  {
    text: 'létt',
    file: '27ba600b93a0657a.mp3',
    v: '862de5f064ba',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
    ],
    heard: 'létt',
    score: 0,
  },
  {
    text: 'blautt',
    file: 'ebb1093486528c1a.mp3',
    v: 'd467d1d14835',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
    ],
    heard: 'en blautt',
    score: 0,
  },
  {
    text: 'þurrt',
    file: '12d421e781fd02cd.mp3',
    v: 'e46e8043eaf2',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: null,
        where: 'Áferð/form',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
    ],
    heard: 'þurrt',
    score: 0,
  },
  {
    text: 'loðið',
    file: 'b74ed1042d7fc072.mp3',
    v: '294bef7b425d',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
    ],
    heard: 'loðið',
    score: 0,
  },
  {
    text: 'hált',
    file: '981b7e6fc2980cd3.mp3',
    v: '8704ec3727d5',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
    ],
    heard: 'hált',
    score: 0,
  },
  {
    text: 'stinnt',
    file: '81d9196c8dc47d4e.mp3',
    v: '1855279f81b4',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
    ],
    heard: 'ég stint',
    score: 0.167,
  },
  {
    text: 'sveigjanlegt',
    file: 'c73bcdda843c5254.mp3',
    v: '46a89202e2e7',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
    ],
    heard: 'sveigjanlegt',
    score: 0,
  },
  {
    text: 'hátt',
    file: 'ce0bfc82b89f0169.mp3',
    v: 'ad07990d537a',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvernig lítur þetta út?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvernig lítur þetta út?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lítur þetta út?',
      },
    ],
    heard: 'en hátt',
    score: 0,
  },
  {
    text: 'lágt',
    file: 'f960b2a6a87f4157.mp3',
    v: 'b75fb0a849c5',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvernig lítur þetta út?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvernig lítur þetta út?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lítur þetta út?',
      },
    ],
    heard: 'lágt',
    score: 0,
  },
  {
    text: 'þögult',
    file: '5428a6bc6787c362.mp3',
    v: '2ca71f7fec78',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
    ],
    heard: 'þögult',
    score: 0,
  },
  {
    text: 'gelur',
    file: '5ee06a1d72c4aaaf.mp3',
    v: 'f8e555c213c4',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
    ],
    heard: 'gelur',
    score: 0,
  },
  {
    text: 'mjálmar',
    file: '8b9fb36f13bd7fd3.mp3',
    v: 'f5ad7ab96b32',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
    ],
    heard: 'mjálmar',
    score: 0,
  },
  {
    text: 'öskrar',
    file: '057bb9bf9b7d8673.mp3',
    v: '138c1cfd9a31',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
    ],
    heard: 'öskrar',
    score: 0,
  },
  {
    text: 'suðar',
    file: 'ebe6e307e884b71f.mp3',
    v: '43406c21e28f',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
    ],
    heard: 'suðar',
    score: 0,
  },
  {
    text: 'hringir',
    file: '1317c39e5caf8e15.mp3',
    v: '83dc5da0c2d6',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
    ],
    heard: 'hringir',
    score: 0,
  },
  {
    text: 'hvæsir',
    file: '9aaf2e4449455129.mp3',
    v: 'eba141147add',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða hljóð gefur það frá sér?',
      },
    ],
    heard: 'hvæsir',
    score: 0,
  },
  {
    text: 'kringlótt',
    file: 'c504d7cf13aadac8.mp3',
    v: '45af4b5f0176',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
    ],
    heard: 'kring lótt',
    score: 0.111,
  },
  {
    text: 'ferkantað',
    file: 'd832d9cec74ea58a.mp3',
    v: 'ddf3a4e09c0c',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
    ],
    heard: 'og fer kantað',
    score: 0.111,
  },
  {
    text: 'ílangt',
    file: '57a4bcdf05c69899.mp3',
    v: 'b8b3126eea72',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
    ],
    heard: 'í langt',
    score: 0.167,
  },
  {
    text: 'flatt',
    file: 'd30837ff9bb91667.mp3',
    v: 'c200b4151e3d',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
    ],
    heard: 'og flatt',
    score: 0,
  },
  {
    text: 'kúlulaga',
    file: '589b0f93ec8aa621.mp3',
    v: 'fdf2fded8e09',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
    ],
    heard: 'kúlu laga',
    score: 0.125,
  },
  {
    text: 'oddhvasst',
    file: '056ffe5ba79dfb00.mp3',
    v: '43f6af2ae919',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
    ],
    heard: 'ot hvasst',
    score: 0.222,
  },
  {
    text: 'bogið',
    file: '8994eeccafbfb9ee.mp3',
    v: '8d57e67097a0',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
    ],
    heard: 'bogið',
    score: 0,
  },
  {
    text: 'beint',
    file: 'c918ec0885af5bd4.mp3',
    v: '65798ae34605',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
    ],
    heard: 'en beint',
    score: 0,
  },
  {
    text: 'sporöskjulaga',
    file: '705f452b40cf886b.mp3',
    v: 'bed7eea030c4',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
    ],
    heard: 'spora skjulaga',
    score: 0.154,
  },
  {
    text: 'þríhyrningslaga',
    file: '95185ede4fe9ef6f.mp3',
    v: 'b8a5d51ad829',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
    ],
    heard: 'þríhyrningslaga',
    score: 0,
  },
  {
    text: 'sívalningslaga',
    file: 'e228f0da5d509c13.mp3',
    v: '03342631cd8a',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
    ],
    heard: 'sívalningslaga',
    score: 0,
  },
  {
    text: 'óreglulegt',
    file: '81d41ac98cb87686.mp3',
    v: '172e615c3881',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvaða lögun hefur það?',
      },
    ],
    heard: 'sóreglulegt',
    score: 0,
  },
  {
    text: 'til að gæta',
    file: 'af8968bd6a5b7914.mp3',
    v: '16bef6c4e5ee',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að gæta',
    score: 0,
  },
  {
    text: 'til að klappa',
    file: '0f4abd5a8a4c5aa0.mp3',
    v: 'ced8624f1852',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að klappa',
    score: 0,
  },
  {
    text: 'til að borða',
    file: '10176746c8500991.mp3',
    v: '1af095153694',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að borða',
    score: 0,
  },
  {
    text: 'til að hjálpa',
    file: 'ae22ef11ea8bae8a.mp3',
    v: 'ca788192e9b8',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að hjálpa',
    score: 0,
  },
  {
    text: 'til að vinna',
    file: 'db1558d21d4aac35.mp3',
    v: 'b5372087ac3e',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Til hvers er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Til hvers er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að vinna',
    score: 0,
  },
  {
    text: 'til að leika sér',
    file: 'd111a968b6b5e5eb.mp3',
    v: 'e4b8c1ad2900',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að leika sér',
    score: 0,
  },
  {
    text: 'til að verja',
    file: 'b1b02e2e843c6efa.mp3',
    v: '54079b0bbcc5',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að verja',
    score: 0,
  },
  {
    text: 'til að rannsaka',
    file: 'bbfde75eae03c640.mp3',
    v: 'a3cda2241326',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að rannsaka',
    score: 0,
  },
  {
    text: 'allir',
    file: 'd8bab4614355b777.mp3',
    v: 'aa0cbb78d68b',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'allir',
    score: 0,
  },
  {
    text: 'börn',
    file: 'caad1f07dea7eb88.mp3',
    v: '48dcf6e014d6',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'börn',
    score: 0,
  },
  {
    text: 'fullorðnir',
    file: '3614a0740f8dc654.mp3',
    v: 'c64ef46a2530',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'fullorðnir',
    score: 0,
  },
  {
    text: 'bændur',
    file: 'e39e64fe1bbc113c.mp3',
    v: '43c8b77a6832',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'en bændur',
    score: 0,
  },
  {
    text: 'dýralæknar',
    file: '397e39efd1a194f2.mp3',
    v: '3dbdaea43bbf',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'díralæknar',
    score: 0.1,
  },
  {
    text: 'veiðimenn',
    file: '8dc831ccb21cd609.mp3',
    v: '6651a2b1422d',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'veiði menn',
    score: 0.111,
  },
  {
    text: 'sérfræðingar',
    file: 'e27c7fc2cddd460d.mp3',
    v: 'a1f3863d4807',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'sérfræðingar',
    score: 0,
  },
  {
    text: 'ferðamenn',
    file: 'bc115178062f6d3d.mp3',
    v: '4af9887f6879',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'ferðamenn',
    score: 0,
  },
  {
    text: 'heima',
    file: '900b1712dc68b7af.mp3',
    v: '7625d668137b',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'manneskja',
        level: 'A1',
        where: 'Hvar er hægt að finna þessa manneskju?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvar er hægt að finna þessa manneskju?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvar er hægt að finna þessa manneskju?',
      },
    ],
    heard: 'heima',
    score: 0,
  },
  {
    text: 'úti',
    file: 'b45739ddad5ca2bd.mp3',
    v: 'fbcb5745f6b8',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvar er hægt að nota þetta?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvar er hægt að nota þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvar er hægt að nota þetta?',
      },
    ],
    heard: 'úti',
    score: 0,
  },
  {
    text: 'á bæ',
    file: '1680973566292de4.mp3',
    v: 'cce765bb8f4c',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvar er hægt að finna þetta?',
      },
    ],
    heard: 'á bæ',
    score: 0,
  },
  {
    text: 'í dýragarðinum',
    file: '4663be1d0963272a.mp3',
    v: '1475ac09536f',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvar er hægt að finna þetta?',
      },
    ],
    heard: 'í dýragarðinum',
    score: 0,
  },
  {
    text: 'í náttúrunni',
    file: 'a9ca36380077bcd3.mp3',
    v: '17408c2b7331',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvar er hægt að finna þetta?',
      },
    ],
    heard: 'í náttúrunni',
    score: 0,
  },
  {
    text: 'í sjónum',
    file: '0845d9d8037b768b.mp3',
    v: '51052559773f',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvar er hægt að finna þetta?',
      },
    ],
    heard: 'í sjónum',
    score: 0,
  },
  {
    text: 'á hálendinu',
    file: 'bde965d958e1cd66.mp3',
    v: 'c9b73243256d',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvar er þetta?',
      },
    ],
    heard: 'á hálendinu',
    score: 0,
  },
  {
    text: 'í skóginum',
    file: '20385421219b98af.mp3',
    v: '68a19d26256a',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvar er hægt að finna þetta?',
      },
    ],
    heard: 'í skóginum',
    score: 0,
  },
  {
    text: 'á morgnana',
    file: 'b4fb6054e2a7aaa1.mp3',
    v: '07b90439a596',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'manneskja',
        level: 'A1',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvenær?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvenær?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvenær?',
      },
    ],
    heard: 'á morgnanna',
    score: 0.1,
  },
  {
    text: 'á daginn',
    file: '880866d92e1e52f4.mp3',
    v: '3e48f22b9a36',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'manneskja',
        level: 'A1',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
    ],
    heard: 'á daginn',
    score: 0,
  },
  {
    text: 'á kvöldin',
    file: 'ecc5846aad302f40.mp3',
    v: '6fcb9bc7a182',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'manneskja',
        level: 'A1',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
    ],
    heard: 'þá kvöldin',
    score: 0,
  },
  {
    text: 'alltaf',
    file: 'dce521f4dbbfc43f.mp3',
    v: '60ce395de91a',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'manneskja',
        level: 'A1',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
    ],
    heard: 'alltaf',
    score: 0,
  },
  {
    text: 'á veturna',
    file: '9b06dc5bc0162aed.mp3',
    v: '47263144b2d6',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: null,
        where: 'Hvenær notað',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: null,
        where: 'Hvenær',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
    ],
    heard: 'á veturna',
    score: 0,
  },
  {
    text: 'á sumrin',
    file: '2a2fc2a986256e72.mp3',
    v: 'd0718864daa7',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: null,
        where: 'Hvenær notað',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: null,
        where: 'Hvenær',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
    ],
    heard: 'á sumrin',
    score: 0,
  },
  {
    text: 'um helgar',
    file: 'f506a4a4e54c34b1.mp3',
    v: '93173efb7bdc',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
    ],
    heard: 'um helgar',
    score: 0,
  },
  {
    text: 'í sérstökum tilvikum',
    file: '2d2af8602386adc7.mp3',
    v: 'abc243d6d36b',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
    ],
    heard: 'í sérstökum tilvikum',
    score: 0,
  },
  {
    text: 'daglega',
    file: '156c78856e5382ca.mp3',
    v: '934de03c3800',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
    ],
    heard: 'daglega',
    score: 0,
  },
  {
    text: 'sjaldan',
    file: 'ad49518283199d69.mp3',
    v: 'a079ad49048b',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
    ],
    heard: 'sjaldan',
    score: 0,
  },
  {
    text: 'oft',
    file: '8d1290503a08cb98.mp3',
    v: 'c541cba1ff76',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'Hvenær sést þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
    ],
    heard: 'oft',
    score: 0,
  },
  {
    text: 'Þetta er dýr.',
    file: '36339216751f788b.mp3',
    v: 'bf4570669c37',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'rammi',
      },
    ],
    heard: 'en þetta er dýr',
    score: 0,
  },
  {
    text: 'Það er ___.',
    file: 'b0c5e114238c4201.mp3',
    v: 'f72498e6ebbd',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'rammi',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'rammi',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'rammi',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'rammi',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'rammi',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'rammi',
      },
    ],
    say: 'Það er ….',
    heard: 'það er',
    score: 0,
  },
  {
    text: 'Það hefur ___.',
    file: 'ae151e440049e4a3.mp3',
    v: '712957b4fe43',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'rammi',
      },
    ],
    say: 'Það hefur ….',
    heard: 'það hefur',
    score: 0,
  },
  {
    text: 'Það hljómar ___.',
    file: '2b76ac6262fa3336.mp3',
    v: '0980665c4d02',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'rammi',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'rammi',
      },
    ],
    say: 'Það hljómar ….',
    heard: 'það hljómar',
    score: 0,
  },
  {
    text: 'Maður notar það ___.',
    file: '522960000bcfa217.mp3',
    v: '936da6065eba',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'rammi',
      },
      {
        category: 'dyr',
        level: 'A2',
        where: 'rammi',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'rammi',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'rammi',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'rammi',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'rammi',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'rammi',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'rammi',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'rammi',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Maður notar það ….',
    heard: 'maður notar það',
    score: 0,
  },
  {
    text: 'Þetta er ___ sem býr ___.',
    file: 'd04464aff25f9302.mp3',
    v: 'd768bfd15620',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Þetta er … sem býr ….',
    heard: 'þetta er sem býr',
    score: 0,
  },
  {
    text: 'Það hefur ___ og ___.',
    file: '7fe9e6c1e8c235c2.mp3',
    v: 'c7f7c9c0b6d8',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Það hefur … og ….',
    heard: 'það hefur og',
    score: 0,
  },
  {
    text: 'Það étur ___.',
    file: 'c526d2897235e192.mp3',
    v: '72e363cb3a58',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Það étur ….',
    heard: 'það etur',
    score: 0.125,
  },
  {
    text: 'Það finnst ___ við snertingu.',
    file: '5975a303dcf88d2f.mp3',
    v: 'd639395f43c3',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'rammi',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'rammi',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'rammi',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Það finnst … við snertingu.',
    heard: 'það finnst við snertingu',
    score: 0,
  },
  {
    text: 'Maður finnur það ___.',
    file: '71443ab5e20a125f.mp3',
    v: '5be388f241b4',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'rammi',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'rammi',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'rammi',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'rammi',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Maður finnur það ….',
    heard: 'maður finnur það',
    score: 0,
  },
  {
    text: 'Ég held að þetta sé ___ vegna þess að ___.',
    file: 'dd8b01323981e5ad.mp3',
    v: 'bc215fb35804',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'rammi',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Ég held að þetta sé … vegna þess að ….',
    heard: 'ég held að þetta sé vegna þess að',
    score: 0,
  },
  {
    text: 'Þetta dýr er ___ og ___.',
    file: 'aa697d3507e98f87.mp3',
    v: '7165dfb287db',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Þetta dýr er … og ….',
    heard: 'þetta dýr er og',
    score: 0,
  },
  {
    text: 'Það er líkt ___ en ólíkt ___.',
    file: '00861ede6a512196.mp3',
    v: '2bf010da21ff',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Það er líkt … en ólíkt ….',
    heard: 'það er líkt en ólíkt',
    score: 0,
  },
  {
    text: 'Það er ___ að snerta vegna þess að ___.',
    file: '835b7c3c454a5da0.mp3',
    v: '264e3a2d9a13',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'rammi',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'rammi',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'rammi',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Það er … að snerta vegna þess að ….',
    heard: 'það er að snerta vegna þess að',
    score: 0,
  },
  {
    text: '___ nota það oftast ___.',
    file: '8307284765d81aa0.mp3',
    v: '0255daee988f',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'rammi',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'rammi',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'rammi',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'rammi',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: '… nota það oftast ….',
    heard: 'ég nota það oftast',
    score: 0,
  },
  {
    text: 'Þetta er dýr. Það er stórt. Það hefur feld.',
    file: '39cdf8d81a532277.mp3',
    v: '08735e04e9ba',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A1',
        where: 'dæmi',
      },
    ],
    heard: 'þetta er dýr það er stórt það hefur felld',
    score: 0.025,
  },
  {
    text: 'Þetta er dýr sem býr í vatni. Það hefur hreistur og syndir. Það étur plöntur.',
    file: '4c05a67dcaf790a4.mp3',
    v: '59d155a284b6',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'A2',
        where: 'dæmi',
      },
    ],
    heard: 'þetta er dýr sem býr í vatni það hefur hreistur og syndir það etur plöntur',
    score: 0.014,
  },
  {
    text: 'Ég held að þetta sé höfrungur vegna þess að hann syndir og býr í sjónum. Þetta dýr er grátt og snjallt. Það er líkt hval en ólíkt fiski.',
    file: '379129c18acfcb35.mp3',
    v: '62589bf922d1',
    approved: false,
    places: [
      {
        category: 'dyr',
        level: 'B1',
        where: 'dæmi',
      },
    ],
    heard:
      'ég held að þetta sé höfrungur vegna þess að hann syndir og býr í sjónum þetta dýr er grátt og snjallt það er líkt hval en ólíkt fiski',
    score: 0,
  },
  {
    text: 'ávöxtur',
    file: '6479f686699a5fe0.mp3',
    v: '385504e5b371',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvers konar matur er þetta?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvers konar matur er þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvers konar matur er þetta?',
      },
    ],
    heard: 'ávöxtur',
    score: 0,
  },
  {
    text: 'grænmeti',
    file: 'fee62507b7009f29.mp3',
    v: '0dedebdd6b4f',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvers konar matur er þetta?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvers konar matur er þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvers konar matur er þetta?',
      },
    ],
    heard: 'græn meti',
    score: 0.125,
  },
  {
    text: 'kjöt',
    file: 'e15292f7e3fcca3c.mp3',
    v: 'e66a70e35b75',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvers konar matur er þetta?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvers konar matur er þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvers konar matur er þetta?',
      },
    ],
    heard: 'kjöt',
    score: 0,
  },
  {
    text: 'mjólkurvara',
    file: '9631be280c4e60b1.mp3',
    v: 'deda6aa27946',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvers konar matur er þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvers konar matur er þetta?',
      },
    ],
    heard: 'og mjólkurvara',
    score: 0,
  },
  {
    text: 'sælgæti',
    file: 'f161938dcc95d74a.mp3',
    v: 'd281720b25d7',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvers konar matur er þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvers konar matur er þetta?',
      },
    ],
    heard: 'sæ gæti',
    score: 0.143,
  },
  {
    text: 'brauð/korn',
    file: '1d6b049f1455bec8.mp3',
    v: '3bf1937ad950',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvers konar matur er þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvers konar matur er þetta?',
      },
    ],
    say: 'brauð eða korn',
    heard: 'brauð eða korn',
    score: 0,
  },
  {
    text: 'drykkur',
    file: '9e9949d2aec9ba4e.mp3',
    v: 'b612bcff3dd6',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvers konar matur er þetta?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvers konar matur er þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvers konar matur er þetta?',
      },
    ],
    heard: 'er drykkur',
    score: 0,
  },
  {
    text: 'sætt',
    file: '20733b691d7ff346.mp3',
    v: '78dc3d1227cb',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Bragð',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvernig bragðast það?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig bragðast það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig bragðast það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lyktar þar?',
      },
    ],
    heard: 'sætt',
    score: 0,
  },
  {
    text: 'salt',
    file: '63479ad69a090b25.mp3',
    v: 'ece04ddf63ef',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Bragð',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvernig bragðast það?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig bragðast það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig bragðast það?',
      },
    ],
    heard: 'salt',
    score: 0,
  },
  {
    text: 'súrt',
    file: '341a38665b4f6e33.mp3',
    v: 'ad65d4a82dbd',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Bragð',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvernig bragðast það?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig bragðast það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig bragðast það?',
      },
    ],
    heard: 'og súrt',
    score: 0,
  },
  {
    text: 'beiskt',
    file: '69bdee580ca4cfb2.mp3',
    v: '326f93503cda',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Bragð',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvernig bragðast það?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig bragðast það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig bragðast það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lyktar þar?',
      },
    ],
    heard: 'hann beist',
    score: 0.167,
  },
  {
    text: 'kryddað/sterkt',
    file: '0da1293eedbf75b4.mp3',
    v: 'a37ac4928856',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Bragð',
      },
    ],
    say: 'kryddað eða sterkt',
    heard: 'kryddað eða sterkt',
    score: 0,
  },
  {
    text: 'fljótandi',
    file: 'b2323f056c2abd76.mp3',
    v: '0d580e0301d5',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Áferð/form',
      },
    ],
    heard: 'fljótandi',
    score: 0,
  },
  {
    text: 'hrátt',
    file: '99ecb3c9a29234ce.mp3',
    v: 'd6ed5bb5e664',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Undirbúningur',
      },
    ],
    heard: 'hrátt',
    score: 0,
  },
  {
    text: 'soðið',
    file: '0217a9e8f123f6ce.mp3',
    v: 'e26c18c8e00b',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Undirbúningur',
      },
    ],
    heard: 'soðið',
    score: 0,
  },
  {
    text: 'steikt',
    file: 'b9707b4b41206fcf.mp3',
    v: '670752d2516b',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Undirbúningur',
      },
    ],
    heard: 'steikt',
    score: 0,
  },
  {
    text: 'bakað',
    file: 'f2edefc394e7448f.mp3',
    v: 'ddc22aaaf82e',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Undirbúningur',
      },
    ],
    heard: 'n bakað',
    score: 0,
  },
  {
    text: 'heitt',
    file: 'b54f4e429abbecfb.mp3',
    v: '6409dabeac5d',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Undirbúningur',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
    ],
    heard: 'heitt',
    score: 0,
  },
  {
    text: 'kalt',
    file: 'ae5a7b6a60c2cc08.mp3',
    v: '39eba32264e9',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Undirbúningur',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig finnst það við snertingu?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig finnst það við snertingu?',
      },
    ],
    heard: 'kalt',
    score: 0,
  },
  {
    text: 'frosið',
    file: 'bce61ec49917568f.mp3',
    v: '1f6dd535de4a',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Undirbúningur',
      },
    ],
    heard: 'og frosið',
    score: 0,
  },
  {
    text: 'í eldhúsinu',
    file: '5e01de4929814a27.mp3',
    v: '00b6ca26be3c',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Hvar',
      },
    ],
    heard: 'í eldhúsinu',
    score: 0,
  },
  {
    text: 'í ísskápnum',
    file: '0c5ab4b2e660223e.mp3',
    v: 'e0907ca77e1a',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Hvar',
      },
    ],
    heard: 'í ísskápnum',
    score: 0,
  },
  {
    text: 'í búðinni',
    file: 'd8c88304190cb53d.mp3',
    v: '2d514deda361',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Hvar',
      },
    ],
    heard: 'í búðinni',
    score: 0,
  },
  {
    text: 'á veitingastað',
    file: '79cf24312df7f756.mp3',
    v: '61f06d585617',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Hvar',
      },
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvar er hægt að finna þetta?',
      },
    ],
    heard: 'á veitingastað',
    score: 0,
  },
  {
    text: 'í morgunmat',
    file: 'a2fcde0b7106f5b2.mp3',
    v: '454839ee8da8',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Hvenær',
      },
    ],
    heard: 'í morgunmat',
    score: 0,
  },
  {
    text: 'í hádegismat',
    file: '6c1926855c7aadce.mp3',
    v: 'd320b43a15b1',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Hvenær',
      },
    ],
    heard: 'ný hádegismat',
    score: 0.083,
  },
  {
    text: 'í kvöldmat',
    file: '65cd4d764ec14cb3.mp3',
    v: 'ce0191455b0e',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Hvenær',
      },
    ],
    heard: 'í kvöldmat',
    score: 0,
  },
  {
    text: 'sem millimál',
    file: '741c020180d49d69.mp3',
    v: '3ecfd7c91d3f',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Hvenær',
      },
    ],
    heard: 'sem villi mál',
    score: 0.167,
  },
  {
    text: 'alltaf/hvenær sem er',
    file: 'ae66278307886890.mp3',
    v: 'e69167d49122',
    approved: false,
    places: [
      {
        category: 'matur',
        level: null,
        where: 'Hvenær',
      },
    ],
    say: 'alltaf eða hvenær sem er',
    heard: 'alltaf eða hvenær sem er',
    score: 0,
  },
  {
    text: 'krydd',
    file: '1e44e40ec54298b8.mp3',
    v: '9de8dc3ef38d',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvers konar matur er þetta?',
      },
    ],
    heard: 'krídd',
    score: 0.2,
  },
  {
    text: 'sósa',
    file: '91593885407935f5.mp3',
    v: '90ec73ddeaa1',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvers konar matur er þetta?',
      },
    ],
    heard: 'sósa',
    score: 0,
  },
  {
    text: 'rautt',
    file: '14f0e6a37ea5cba1.mp3',
    v: '62bacc0dd310',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'rautt',
    score: 0,
  },
  {
    text: 'grænt',
    file: 'c5590e09521dc508.mp3',
    v: '4f6fa09d1cf2',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'grænt',
    score: 0,
  },
  {
    text: 'gult',
    file: 'c4cb74461ebe4c7c.mp3',
    v: '82ca0d4a1b17',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'gult',
    score: 0,
  },
  {
    text: 'hvítt',
    file: '17c229bc15c72aa6.mp3',
    v: '2f754dab9563',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'hvítt',
    score: 0,
  },
  {
    text: 'brúnt',
    file: '939a42014442723d.mp3',
    v: '844d6c968ed2',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'brúnt',
    score: 0,
  },
  {
    text: 'appelsínugult',
    file: 'e1da8f22e957a1b0.mp3',
    v: '8e897b86e522',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'appelsínu gult',
    score: 0.077,
  },
  {
    text: 'langt',
    file: '5415de79dab78beb.mp3',
    v: 'f5e7dec0c28c',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'langt',
    score: 0,
  },
  {
    text: 'kryddað',
    file: 'd0592bc8b907f5b0.mp3',
    v: '7f46141dd43c',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig bragðast það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig bragðast það?',
      },
    ],
    heard: 'kryddað',
    score: 0,
  },
  {
    text: 'sterkt',
    file: '5c32fac5957c65e0.mp3',
    v: 'b668ca879ab1',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig bragðast það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig bragðast það?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvernig lyktar þar?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lyktar þar?',
      },
    ],
    heard: 'en sterkt',
    score: 0,
  },
  {
    text: 'milt',
    file: '4851cc156b4e8041.mp3',
    v: '4f8a1f53d4a3',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig bragðast það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig bragðast það?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvernig lyktar þar?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lyktar þar?',
      },
    ],
    heard: 'milt',
    score: 0,
  },
  {
    text: 'ferskt',
    file: '055a8276d9d9038f.mp3',
    v: 'b482377ae0c6',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig bragðast það?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig bragðast það?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvernig lyktar þar?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lyktar þar?',
      },
    ],
    heard: 'ég ferst',
    score: 0.167,
  },
  {
    text: 'bragðmikið',
    file: 'd450472cfe66305e.mp3',
    v: 'ba4d1e707bfe',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig bragðast það?',
      },
    ],
    heard: 'en bragðmikið',
    score: 0,
  },
  {
    text: 'bragðlaust',
    file: '793bce4f10f5d1e0.mp3',
    v: '125053b3090b',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig bragðast það?',
      },
    ],
    heard: 'en bragðlaust',
    score: 0,
  },
  {
    text: 'mjög sætt',
    file: '765853562ef47ca4.mp3',
    v: '75647d1829fb',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig bragðast það?',
      },
    ],
    heard: 'mjög sætt',
    score: 0,
  },
  {
    text: 'náttúrulega sætt',
    file: '0ee25623437a2f57.mp3',
    v: 'd567aca35d05',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig bragðast það?',
      },
    ],
    heard: 'það er náttúrlega sætt',
    score: 0.062,
  },
  {
    text: 'gott',
    file: '894d3ccd43ee7e7f.mp3',
    v: '7946a4ebf85c',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvernig lyktar þar?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvernig lyktar þar?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lyktar þar?',
      },
    ],
    heard: 'gott',
    score: 0,
  },
  {
    text: 'vont',
    file: 'd1c2ab05bd0f9564.mp3',
    v: 'c469793ec0fe',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvernig lyktar þar?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvernig lyktar þar?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lyktar þar?',
      },
    ],
    heard: 'vont',
    score: 0,
  },
  {
    text: 'ekkert',
    file: '3a4c3a2a78baa67e.mp3',
    v: 'a03425ba4fe3',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvernig lyktar þar?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvernig lyktar þar?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lyktar þar?',
      },
    ],
    heard: 'ekkert',
    score: 0,
  },
  {
    text: 'ilmandi',
    file: '349932141f17d448.mp3',
    v: '84588a9f7d4c',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lyktar þar?',
      },
    ],
    heard: 'ilmandi',
    score: 0,
  },
  {
    text: 'stingandi',
    file: 'e015172c09c2617a.mp3',
    v: '3799766174ac',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvernig lyktar af því?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lyktar þar?',
      },
    ],
    heard: 'ég stingandi',
    score: 0,
  },
  {
    text: 'til að drekka',
    file: 'b3e736a68dc21877.mp3',
    v: '9a06ef66fa63',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A1',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að drekka',
    score: 0,
  },
  {
    text: 'til að elda með',
    file: 'dc7898a8929837db.mp3',
    v: '35d08e8a5a41',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að elda með',
    score: 0,
  },
  {
    text: 'til að baka með',
    file: '08bce99313dc6777.mp3',
    v: '37358fc5f3f8',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að baka með',
    score: 0,
  },
  {
    text: 'til að næra sig',
    file: '66d34960c7670eb0.mp3',
    v: 'fc68809060a7',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að næra sig',
    score: 0,
  },
  {
    text: 'til að njóta',
    file: '202009d04a6c88ac.mp3',
    v: '70f53b07c004',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að njóta',
    score: 0,
  },
  {
    text: 'kokkar',
    file: '34a0c96e557c09ba.mp3',
    v: '11eac0ad01cf',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'kokkar',
    score: 0,
  },
  {
    text: 'bakarar',
    file: 'd592c0448527b47b.mp3',
    v: '8cd88594e03e',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'bakarar',
    score: 0,
  },
  {
    text: 'í búð',
    file: '04dd14aad19757fa.mp3',
    v: '5f7caf2aa842',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A1',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvar er hægt að finna þetta?',
      },
    ],
    heard: 'í búð',
    score: 0,
  },
  {
    text: 'í skólanum',
    file: '47dbe434677cac88.mp3',
    v: '0239fb0937f3',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvar er hægt að finna þetta?',
      },
      {
        category: 'manneskja',
        level: 'A1',
        where: 'Hvar er hægt að finna þessa manneskju?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvar er hægt að finna þessa manneskju?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvar er hægt að finna þessa manneskju?',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvar er hægt að nota þetta?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvar er hægt að nota þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvar er hægt að nota þetta?',
      },
    ],
    heard: 'í skólanum',
    score: 0,
  },
  {
    text: 'á markaði',
    file: '132bf2ed44fa1fd7.mp3',
    v: 'e1d2a0b99933',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvar er hægt að finna þetta?',
      },
    ],
    heard: 'á markaði',
    score: 0,
  },
  {
    text: 'í garðinum',
    file: '7a73dfc0634a8d75.mp3',
    v: 'a6ea82a34321',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvar er hægt að finna þetta?',
      },
    ],
    heard: 'í garðinum',
    score: 0,
  },
  {
    text: 'á virkum dögum',
    file: '1dc9e191078b12ab.mp3',
    v: '19c59cacac91',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
    ],
    heard: 'á virkum dögum',
    score: 0,
  },
  {
    text: 'á hátíðum',
    file: 'a096fc03ed385492.mp3',
    v: 'd94ac36f6143',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvenær er hún/hann virk/virkur?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvenær er þetta notað?',
      },
    ],
    heard: 'fá hátíðum',
    score: 0,
  },
  {
    text: 'Þetta er ___.',
    file: 'aa3eead5f1903d8c.mp3',
    v: '0496537a5ba5',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A1',
        where: 'rammi',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'rammi',
      },
      {
        category: 'manneskja',
        level: 'A1',
        where: 'rammi',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'rammi',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'rammi',
      },
      {
        category: 'skolinn',
        level: 'A1',
        where: 'rammi',
      },
    ],
    say: 'Þetta er ….',
    heard: 'þetta er',
    score: 0,
  },
  {
    text: 'Maður borðar það ___.',
    file: 'f9098490687c9daa.mp3',
    v: '4bb7d021975c',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A1',
        where: 'rammi',
      },
    ],
    say: 'Maður borðar það ….',
    heard: 'maður borðar það',
    score: 0,
  },
  {
    text: 'Þetta er ___ sem er ___.',
    file: 'f2a95b678bd13406.mp3',
    v: 'd882e0bbf4c9',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A2',
        where: 'rammi',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'rammi',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'rammi',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Þetta er … sem er ….',
    heard: 'þetta er sem er',
    score: 0,
  },
  {
    text: 'Maður borðar/drekkur það ___.',
    file: '4374f9ef4d088747.mp3',
    v: '5ddddcede319',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Maður borðar eða drekkur það ….',
    heard: 'maður borðar eða drekkur það',
    score: 0,
  },
  {
    text: 'Það er gert úr ___.',
    file: '9690003544e5325a.mp3',
    v: '994e6dc13d45',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Það er gert úr ….',
    heard: 'það er gert úr',
    score: 0,
  },
  {
    text: 'Þetta er ___ sem bragðast ___.',
    file: 'd9bee2f2ee40c18d.mp3',
    v: '50323ab30b86',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Þetta er … sem bragðast ….',
    heard: 'þetta er sem bragðast',
    score: 0,
  },
  {
    text: 'Það er oft borðað/drukkið ___.',
    file: 'fbf9b0c058a07373.mp3',
    v: 'e0dd7e05f69c',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Það er oft borðað eða drukkið ….',
    heard: 'það er oft borðað eða drukkið',
    score: 0,
  },
  {
    text: 'Mér finnst ___.',
    file: '93792f45b6a958af.mp3',
    v: '4f79d28ec63e',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Mér finnst ….',
    heard: 'omér finnst',
    score: 0,
  },
  {
    text: 'Það er gert úr ___ sem er ___.',
    file: '05be89ee164601b9.mp3',
    v: 'cdfacddbc877',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Það er gert úr … sem er ….',
    heard: 'það er gert úr sem er',
    score: 0,
  },
  {
    text: 'Þetta er ávöxtur. Hann er sætur. Maður borðar hann í morgunmat.',
    file: '510baac3fe6758c6.mp3',
    v: 'c49a7b8a7cef',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A1',
        where: 'dæmi',
      },
    ],
    heard: 'þetta er ávöxtur hann er sætur maður borðar hann í morgunmat',
    score: 0,
  },
  {
    text: 'Þetta er grænmeti sem er grænt. Maður borðar það hrátt. Það er hollt.',
    file: 'a2e3fe63a69f947f.mp3',
    v: '0996c7c65fa7',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'A2',
        where: 'dæmi',
      },
    ],
    heard: 'þetta er grænmeti sem er grænt maður borðar það hrátt það er hálft',
    score: 0.03,
  },
  {
    text: 'Þetta er ávöxtur sem bragðast sætt og súrt. Hann er oft borðaður sem millimál. Mér finnst hann mjög góður.',
    file: 'abe69c1a5951e576.mp3',
    v: '91f46e4afc2e',
    approved: false,
    places: [
      {
        category: 'matur',
        level: 'B1',
        where: 'dæmi',
      },
    ],
    heard:
      'þetta er ávöxtur sem bragðast sætt og súrt hann er oft borðaður sem milli mál mér finnst hann mjög góður',
    score: 0.01,
  },
  {
    text: 'bíll',
    file: '4ad0de8b973a7df4.mp3',
    v: 'da9c7702d377',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvers konar farartæki er þetta?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvers konar farartæki er þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvers konar farartæki er þetta?',
      },
    ],
    heard: 'bíll',
    score: 0,
  },
  {
    text: 'rúta',
    file: '8e154278b3255f24.mp3',
    v: '19ba42dc7d7f',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvers konar farartæki er þetta?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvers konar farartæki er þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvers konar farartæki er þetta?',
      },
    ],
    heard: 'rúta',
    score: 0,
  },
  {
    text: 'hjól/reiðhjól',
    file: '35896e2d9b7a2251.mp3',
    v: '455df91f0270',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Tegund',
      },
    ],
    say: 'hjól eða reiðhjól',
    heard: 'hjól eða reið hjól',
    score: 0.059,
  },
  {
    text: 'mótorhjól',
    file: '973d91521f195b86.mp3',
    v: 'baddedd22b1b',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvers konar farartæki er þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvers konar farartæki er þetta?',
      },
    ],
    heard: 'mótor hjól',
    score: 0.111,
  },
  {
    text: 'lest',
    file: 'ba0b201fb157cf63.mp3',
    v: '91efc2be299b',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvers konar farartæki er þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvers konar farartæki er þetta?',
      },
    ],
    heard: 'lest',
    score: 0,
  },
  {
    text: 'flugvél',
    file: '54ff2a6f9c05bc98.mp3',
    v: 'e0d39799e09c',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvers konar farartæki er þetta?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvers konar farartæki er þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvers konar farartæki er þetta?',
      },
    ],
    heard: 'flugvél',
    score: 0,
  },
  {
    text: 'skip/bátur',
    file: '4c0db285ed403683.mp3',
    v: '7738c3ea3839',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvers konar farartæki er þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvers konar farartæki er þetta?',
      },
    ],
    say: 'skip eða bátur',
    heard: 'skip eða bátur',
    score: 0,
  },
  {
    text: 'sleði',
    file: 'd549a961685cf732.mp3',
    v: '1b29cf0ce4f0',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvers konar farartæki er þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvers konar farartæki er þetta?',
      },
    ],
    heard: 'ég sleði',
    score: 0,
  },
  {
    text: 'hlaupahjól',
    file: 'f4071b339048b29c.mp3',
    v: '9bdf9159dbe8',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvers konar farartæki er þetta?',
      },
    ],
    heard: 'hlaupa hjól',
    score: 0.1,
  },
  {
    text: 'á sjó/vatni',
    file: 'd590cd6d6f819780.mp3',
    v: '761dca0780ce',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Hvar fer það',
      },
    ],
    say: 'á sjó eða vatni',
    heard: 'á sjó eða vatni',
    score: 0,
  },
  {
    text: 'á snjó',
    file: '40d5c5736f3da1ff.mp3',
    v: '1363a486d54c',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Hvar fer það',
      },
    ],
    heard: 'ná snjó',
    score: 0,
  },
  {
    text: 'risastórt',
    file: '51f58ad10ecc56ff.mp3',
    v: '2c91d3d040b3',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Stærð',
      },
    ],
    heard: 'risa stórt',
    score: 0.111,
  },
  {
    text: 'hjól',
    file: '02dbdc829cdc08ad.mp3',
    v: '1ce91c417418',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Eiginleikar',
      },
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvers konar farartæki er þetta?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvers konar farartæki er þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvers konar farartæki er þetta?',
      },
    ],
    heard: 'hjól',
    score: 0,
  },
  {
    text: 'ekki hjól',
    file: '910380734bfad8d2.mp3',
    v: 'd805db647190',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Eiginleikar',
      },
    ],
    heard: 'ekki hjól',
    score: 0,
  },
  {
    text: 'með vél',
    file: 'f606a0cf3a724789.mp3',
    v: '834a5c151fbc',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Eiginleikar',
      },
    ],
    heard: 'var með vél',
    score: 0,
  },
  {
    text: 'án vélar',
    file: '433254bbd1e8d6fa.mp3',
    v: '8f63331213b8',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Eiginleikar',
      },
    ],
    heard: 'án vélar',
    score: 0,
  },
  {
    text: 'hraðskreitt',
    file: '6132709f02e26e58.mp3',
    v: '247e79d978b5',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Eiginleikar',
      },
    ],
    heard: 'hraðskreytt',
    score: 0.091,
  },
  {
    text: 'hægfara',
    file: '53da8520c3c938cc.mp3',
    v: '21bdede36f43',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Eiginleikar',
      },
    ],
    heard: 'um hægfara',
    score: 0,
  },
  {
    text: 'allt árið',
    file: '622aa4e7ca60a5aa.mp3',
    v: 'd543942e01c5',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Hvenær notað',
      },
      {
        category: 'klaednadur',
        level: null,
        where: 'Hvenær',
      },
    ],
    heard: 'allt árið',
    score: 0,
  },
  {
    text: 'í sérstökum tilfellum',
    file: '4cd01cdc7a257ef0.mp3',
    v: '8cf79bd7ebb3',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Hvenær notað',
      },
    ],
    heard: 'í sérstökum tilfellum',
    score: 0,
  },
  {
    text: 'einn',
    file: 'bc94ca9c38e06115.mp3',
    v: '68f9a937764f',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Fjöldi farþega',
      },
    ],
    heard: 'einn',
    score: 0,
  },
  {
    text: 'fáir',
    file: 'a8edbd5bd4c2c6af.mp3',
    v: 'b8cf501b8ddd',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Fjöldi farþega',
      },
    ],
    heard: 'fáir',
    score: 0,
  },
  {
    text: 'margir',
    file: 'c75786d449ea9c2b.mp3',
    v: '28d94a0e8252',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: null,
        where: 'Fjöldi farþega',
      },
    ],
    heard: 'margir',
    score: 0,
  },
  {
    text: 'skip',
    file: '42e93b9bb77d8a73.mp3',
    v: '72b29982ae5c',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvers konar farartæki er þetta?',
      },
    ],
    heard: 'skip',
    score: 0,
  },
  {
    text: 'sportvagn',
    file: '52fd768057da1b10.mp3',
    v: '9be29d7e341b',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvers konar farartæki er þetta?',
      },
    ],
    heard: 'sport vagn',
    score: 0.111,
  },
  {
    text: 'þyrla',
    file: '6db92076d8a75bb7.mp3',
    v: '4ec5486cb982',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvers konar farartæki er þetta?',
      },
    ],
    heard: 'þyrla',
    score: 0,
  },
  {
    text: 'með hjólum',
    file: '06b3fd8087df5d2e.mp3',
    v: '32424b861955',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'með hjólum',
    score: 0,
  },
  {
    text: 'án hjóla',
    file: 'e4ad9b61e85870ce.mp3',
    v: '913d71de3256',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'án hjóla',
    score: 0,
  },
  {
    text: 'stutt',
    file: '0400b9edb1ef3d34.mp3',
    v: '253c634f35ff',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'en stutt',
    score: 0,
  },
  {
    text: 'straumlínulaga',
    file: '17e959a92404f106.mp3',
    v: 'f9f936e3a2b6',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'straum línu laga',
    score: 0.143,
  },
  {
    text: 'litríkt',
    file: '351f429362b7584c.mp3',
    v: '010d6eb933c2',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'litríkt',
    score: 0,
  },
  {
    text: 'úr málmi',
    file: 'ecf29049c4357986.mp3',
    v: 'c256b7e9349a',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
    ],
    heard: 'úr málmi',
    score: 0,
  },
  {
    text: 'úr plasti',
    file: 'a4187d4df0b38e88.mp3',
    v: 'f5306b29ebec',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: null,
        where: 'Efni',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
    ],
    heard: 'úr plasti',
    score: 0,
  },
  {
    text: 'úr tré',
    file: '178be545ab968bba.mp3',
    v: '1ab266576d67',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
    ],
    heard: 'þúr tré',
    score: 0,
  },
  {
    text: 'úr steini',
    file: '07c3061ce75eb480.mp3',
    v: 'd8599d37cdaa',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
    ],
    heard: 'úr steini',
    score: 0,
  },
  {
    text: 'úr gleri',
    file: 'c84778d2c72ef9e2.mp3',
    v: 'ba04dfb271f9',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
    ],
    heard: 'úr gleri',
    score: 0,
  },
  {
    text: 'úr endurunnu efni',
    file: 'bd31557b91721d94.mp3',
    v: '03575699832a',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
    ],
    heard: 'úrendur unnu efni',
    score: 0.118,
  },
  {
    text: 'úr náttúrulegum efnum',
    file: '0295a96e4505bf44.mp3',
    v: 'db79c10203cd',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
    ],
    heard: 'úr náttúrlegum efnum',
    score: 0.048,
  },
  {
    text: 'úr gerviefnum',
    file: '9725ace80927026e.mp3',
    v: 'f076680134b3',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
    ],
    heard: 'úr gerviefnum',
    score: 0,
  },
  {
    text: 'til að ferðast',
    file: '2da9d1122dd6fdca.mp3',
    v: 'df5929db00af',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að ferðast',
    score: 0,
  },
  {
    text: 'til að flytja',
    file: '349223660b402764.mp3',
    v: '2bf5b0bd8e22',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að flytja',
    score: 0,
  },
  {
    text: 'til að keppa',
    file: '465d072e1267c77d.mp3',
    v: '4aa65bb0b8e8',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að keppa',
    score: 0,
  },
  {
    text: 'til að bjarga',
    file: '8b6978cf226aee77.mp3',
    v: '6f986363633d',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að bjarga',
    score: 0,
  },
  {
    text: 'bílstjórar',
    file: 'd5391aea59662bda.mp3',
    v: 'ba91b9cda2cb',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'bílstjórar',
    score: 0,
  },
  {
    text: 'flugmenn',
    file: '92605eb58935a396.mp3',
    v: 'd14d08db27c0',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'og flugmenn',
    score: 0,
  },
  {
    text: 'sjómenn',
    file: 'ff6cbefb58593e18.mp3',
    v: '2fae6a454161',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'sjómenn',
    score: 0,
  },
  {
    text: 'iðnaðarmenn',
    file: '4b5a876fe2dfcb0a.mp3',
    v: '95e909e6f1ad',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'iðnaðarmenn',
    score: 0,
  },
  {
    text: 'á götunni',
    file: '58a3baab47c01b70.mp3',
    v: '2df87b309aa7',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvar er hægt að nota/finna þetta?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvar er hægt að nota/finna þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvar er hægt að nota/finna þetta?',
      },
    ],
    heard: 'á götunni',
    score: 0,
  },
  {
    text: 'á sjónum',
    file: '38d1c1c98ab3a398.mp3',
    v: '431e2b577aff',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvar er hægt að nota/finna þetta?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvar er hægt að nota/finna þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvar er hægt að nota/finna þetta?',
      },
    ],
    heard: 'á sjónum',
    score: 0,
  },
  {
    text: 'í loftinu',
    file: 'd941cfce96874eaa.mp3',
    v: '9323999a777d',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'Hvar er hægt að nota/finna þetta?',
      },
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvar er hægt að nota/finna þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvar er hægt að nota/finna þetta?',
      },
    ],
    heard: 'í loftinu',
    score: 0,
  },
  {
    text: 'á þjóðveginum',
    file: '91b4d7fd53cf3f76.mp3',
    v: '16f39818633e',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvar er hægt að nota/finna þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvar er hægt að nota/finna þetta?',
      },
    ],
    heard: 'á þjóðveginum',
    score: 0,
  },
  {
    text: 'á flugvellinum',
    file: 'dcfba1c88f4e661f.mp3',
    v: 'c02ea9d727f4',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'Hvar er hægt að nota/finna þetta?',
      },
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvar er hægt að nota/finna þetta?',
      },
    ],
    heard: 'á flugvellinum',
    score: 0,
  },
  {
    text: 'í höfninni',
    file: '705e6a5ba57f86d4.mp3',
    v: 'abae58bf7768',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvar er hægt að nota/finna þetta?',
      },
    ],
    heard: 'í höfninni',
    score: 0,
  },
  {
    text: 'á lestarbraut',
    file: 'f4e7e2959f540668.mp3',
    v: 'ee7e18230601',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'Hvar er hægt að nota/finna þetta?',
      },
    ],
    heard: 'sá lestarbraut',
    score: 0,
  },
  {
    text: 'Það fer ___.',
    file: '40322ed24d86de8b.mp3',
    v: '3d03afa56a26',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'rammi',
      },
    ],
    say: 'Það fer ….',
    heard: 'það fer',
    score: 0,
  },
  {
    text: 'Þetta er ___ sem fer ___.',
    file: '5fd782ed6e2d0999.mp3',
    v: '3a7479d66fdc',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Þetta er … sem fer ….',
    heard: 'þetta er sem fer',
    score: 0,
  },
  {
    text: 'Það hefur ___ og er ___.',
    file: 'ac03c19980242b59.mp3',
    v: '81b9a580b385',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Það hefur … og er ….',
    heard: 'það hefur og er',
    score: 0,
  },
  {
    text: 'Það er gert ___.',
    file: '8642b59031883ee2.mp3',
    v: 'dc69bba4eef6',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'rammi',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'rammi',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Það er gert ….',
    heard: 'það er gert',
    score: 0,
  },
  {
    text: 'Þetta farartæki er ___ sem er notað ___.',
    file: '510b88ee111d0645.mp3',
    v: '2618935f8678',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Þetta farartæki er … sem er notað ….',
    heard: 'þetta farartæki er sem er notað',
    score: 0,
  },
  {
    text: 'Það getur flutt ___ og fer ___.',
    file: '54bca43ef66fffaf.mp3',
    v: '431ac86a6a49',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Það getur flutt … og fer ….',
    heard: 'en það getur flutt og fer',
    score: 0,
  },
  {
    text: 'Það er gert ___ sem er ___.',
    file: 'd95bed60a38e0973.mp3',
    v: '101b86967eda',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'rammi',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'rammi',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Það er gert … sem er ….',
    heard: 'það er gert sem er',
    score: 0,
  },
  {
    text: 'Þetta er bíll. Hann fer á landi. Hann er stór.',
    file: '446cd1ae74080ecf.mp3',
    v: '09211b66189b',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A1',
        where: 'dæmi',
      },
    ],
    heard: 'þetta er bíll hann fer á landi hann er stór',
    score: 0,
  },
  {
    text: 'Þetta er skip sem fer á sjó. Það hefur ekki hjól og er stórt.',
    file: 'e3cd6e6dff6a05b5.mp3',
    v: '456b16f5b71c',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'A2',
        where: 'dæmi',
      },
    ],
    heard: 'þetta er skip sem fer á sjó það hefur ekki hjól og er stórt',
    score: 0,
  },
  {
    text: 'Þetta farartæki er flugvél sem er notuð til að ferðast langar leiðir. Hún getur flutt marga og fer í lofti.',
    file: '05cd37ed516d1278.mp3',
    v: 'd7ba7897286a',
    approved: false,
    places: [
      {
        category: 'farartaeki',
        level: 'B1',
        where: 'dæmi',
      },
    ],
    heard:
      'þetta farartæki er flugvél sem er notuð til að ferðast langar leiðir hún getur flutt marga og fer í lofti',
    score: 0,
  },
  {
    text: 'á lífi',
    file: '2d6de696eaa9262d.mp3',
    v: '8e7fb34edc08',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Staða',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvers konar manneskja er þetta?',
      },
    ],
    heard: 'á lífi',
    score: 0,
  },
  {
    text: 'látin/látinn',
    file: '112cd750d3c2f7de.mp3',
    v: '6493bc6aa321',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Staða',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvers konar manneskja er þetta?',
      },
    ],
    say: 'látin eða látinn',
    heard: 'látin eða látin',
    score: 0.062,
  },
  {
    text: 'skálduð persóna',
    file: '928702a7267ea005.mp3',
    v: '7ccafaa4098e',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Staða',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvers konar manneskja er þetta?',
      },
    ],
    heard: 'skálduð persóna',
    score: 0,
  },
  {
    text: 'fræg/frægur',
    file: '37fa06513f095494.mp3',
    v: 'f61ca343fee7',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Frægð',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvers konar manneskja er þetta?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvers konar manneskja er þetta?',
      },
    ],
    say: 'fræg eða frægur',
    heard: 'fræg eða frægur',
    score: 0,
  },
  {
    text: 'ekki fræg/frægur',
    file: 'aab8b799a9c4d4ac.mp3',
    v: '6b2f40136547',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Frægð',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvers konar manneskja er þetta?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvers konar manneskja er þetta?',
      },
    ],
    say: 'ekki fræg eða frægur',
    heard: 'ekki fræg eða frægur',
    score: 0,
  },
  {
    text: 'leikari',
    file: 'e23c9c5157da6bf7.mp3',
    v: '8ac225bf3982',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Starf/hlutverk',
      },
    ],
    heard: 'leikari',
    score: 0,
  },
  {
    text: 'íþróttamaður',
    file: '4540ec2a2f637e50.mp3',
    v: '0d05095614b7',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Starf/hlutverk',
      },
    ],
    heard: 'íþróttamaður',
    score: 0,
  },
  {
    text: 'söngvari',
    file: '5fa36b43a39869db.mp3',
    v: 'bb53357c16c6',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Starf/hlutverk',
      },
    ],
    heard: 'söngvari',
    score: 0,
  },
  {
    text: 'stjórnmálamaður',
    file: 'b60f305cbc7e813f.mp3',
    v: '727fcf973aad',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Starf/hlutverk',
      },
    ],
    heard: 'ég stjórnmálamaður',
    score: 0,
  },
  {
    text: 'nemandi',
    file: 'dba6a637e15846b6.mp3',
    v: '84153d3a0ac1',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Starf/hlutverk',
      },
      {
        category: 'skolinn',
        level: null,
        where: 'Fólk',
      },
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hver hjálpar?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hver hjálpar?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hver hjálpar?',
      },
    ],
    heard: 'nemandi',
    score: 0,
  },
  {
    text: 'kennari',
    file: '634c32d9b760b32f.mp3',
    v: 'c99aa44b3b12',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Starf/hlutverk',
      },
      {
        category: 'skolinn',
        level: null,
        where: 'Fólk',
      },
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hver hjálpar?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hver hjálpar?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hver hjálpar?',
      },
    ],
    heard: 'kennari',
    score: 0,
  },
  {
    text: 'læknir',
    file: '5d1b8ba2531a21c9.mp3',
    v: '6a1b75d5c387',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Starf/hlutverk',
      },
    ],
    heard: 'læknir',
    score: 0,
  },
  {
    text: 'lögreglumaður',
    file: '5b35a97fa267b893.mp3',
    v: '595cb103ed41',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Starf/hlutverk',
      },
    ],
    heard: 'lögreglumaður',
    score: 0,
  },
  {
    text: 'kokkur',
    file: '49aa4111020fc00f.mp3',
    v: 'e4acbf650862',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Starf/hlutverk',
      },
    ],
    heard: 'kokkur',
    score: 0,
  },
  {
    text: 'listamaður',
    file: '3d76db9c398d05e4.mp3',
    v: '572e192f3d64',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Starf/hlutverk',
      },
    ],
    heard: 'listamaður',
    score: 0,
  },
  {
    text: 'barn',
    file: 'e43a7ece3a362be4.mp3',
    v: '2b7bcb5b2983',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Aldur',
      },
      {
        category: 'manneskja',
        level: 'A1',
        where: 'Hvers konar manneskja er þetta?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvers konar manneskja er þetta?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvers konar manneskja er þetta?',
      },
    ],
    heard: 'barn',
    score: 0,
  },
  {
    text: 'unglingur',
    file: '01968fcb7ef9c88d.mp3',
    v: '55e5b6b41744',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Aldur',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvers konar manneskja er þetta?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvers konar manneskja er þetta?',
      },
    ],
    heard: 'unglingur',
    score: 0,
  },
  {
    text: 'fullorðin/fullorðinn',
    file: 'c9b8ddd94a222964.mp3',
    v: 'a3ebb56b62b1',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Aldur',
      },
      {
        category: 'manneskja',
        level: 'A1',
        where: 'Hvers konar manneskja er þetta?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvers konar manneskja er þetta?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvers konar manneskja er þetta?',
      },
    ],
    say: 'fullorðin eða fullorðinn',
    heard: 'fullorðin eða fullorðin',
    score: 0.042,
  },
  {
    text: 'öldruð/aldraður',
    file: '03696afbdd4d323a.mp3',
    v: 'd85ffd3e4813',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Aldur',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvers konar manneskja er þetta?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvers konar manneskja er þetta?',
      },
    ],
    say: 'öldruð eða aldraður',
    heard: 'öldruð eða aldraður',
    score: 0,
  },
  {
    text: 'há/hár',
    file: 'ebdfbd3c9ee31602.mp3',
    v: 'fad20172c904',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Útlit',
      },
      {
        category: 'manneskja',
        level: 'A1',
        where: 'Hvernig lítur hún/hann út?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvernig lítur hún/hann út?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvernig lítur hún/hann út?',
      },
    ],
    say: 'há eða hár',
    heard: 'há eða hár',
    score: 0,
  },
  {
    text: 'lág/lágur',
    file: '892a9adc5263dda1.mp3',
    v: 'beac2e1763a2',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Útlit',
      },
      {
        category: 'manneskja',
        level: 'A1',
        where: 'Hvernig lítur hún/hann út?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvernig lítur hún/hann út?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvernig lítur hún/hann út?',
      },
    ],
    say: 'lág eða lágur',
    heard: 'lá eða lágur',
    score: 0.077,
  },
  {
    text: 'ung/ungur',
    file: '7e25392302fb7e1c.mp3',
    v: '53dfd33eb56c',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Útlit',
      },
      {
        category: 'manneskja',
        level: 'A1',
        where: 'Hvernig lítur hún/hann út?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvernig lítur hún/hann út?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvernig lítur hún/hann út?',
      },
    ],
    say: 'ung eða ungur',
    heard: 'ung eða ungur',
    score: 0,
  },
  {
    text: 'gömul/gamall',
    file: '15b96ba2bc65a1b0.mp3',
    v: 'd4d15950dac2',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Útlit',
      },
      {
        category: 'manneskja',
        level: 'A1',
        where: 'Hvernig lítur hún/hann út?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvernig lítur hún/hann út?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvernig lítur hún/hann út?',
      },
    ],
    say: 'gömul eða gamall',
    heard: 'gömul eða gamall',
    score: 0,
  },
  {
    text: 'með sítt hár',
    file: 'e489636f118bf0d4.mp3',
    v: 'fed37c6bf193',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Útlit',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvernig lítur hún/hann út?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvernig lítur hún/hann út?',
      },
    ],
    heard: 'er með sítt hár',
    score: 0,
  },
  {
    text: 'með stutt hár',
    file: '9cc16f553ca089f5.mp3',
    v: '19326658e731',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Útlit',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvernig lítur hún/hann út?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvernig lítur hún/hann út?',
      },
    ],
    heard: 'með stutt hár',
    score: 0,
  },
  {
    text: 'sköllótt/sköllóttur',
    file: 'f5c67e8e6e6bc513.mp3',
    v: 'b63423f9939d',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Útlit',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvernig lítur hún/hann út?',
      },
    ],
    say: 'sköllótt eða sköllóttur',
    heard: 'og skölótt eða skölóttur',
    score: 0.087,
  },
  {
    text: 'með gleraugu',
    file: '6412230d1813555d.mp3',
    v: '580229b8ec2f',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Útlit',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvernig lítur hún/hann út?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvernig lítur hún/hann út?',
      },
    ],
    heard: 'með gleraugu',
    score: 0,
  },
  {
    text: 'án gleraugna',
    file: 'f72d0de6a4605100.mp3',
    v: '9e472424e825',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Útlit',
      },
    ],
    heard: 'án gleraugna',
    score: 0,
  },
  {
    text: 'með skegg',
    file: '5e105a0ba9670ab5.mp3',
    v: '4799907268b5',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Útlit',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvernig lítur hún/hann út?',
      },
    ],
    heard: 'með skegg',
    score: 0,
  },
  {
    text: 'án skeggs',
    file: 'd72a7d0b655d70ac.mp3',
    v: 'a50174e9732c',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Útlit',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvernig lítur hún/hann út?',
      },
    ],
    heard: 'án skeggs',
    score: 0,
  },
  {
    text: 'vinnur',
    file: 'e2e45b772990a420.mp3',
    v: '9833c4b8b8a7',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Athafnir',
      },
      {
        category: 'manneskja',
        level: 'A1',
        where: 'Hvað gerir hún/hann?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvað gerir hún/hann?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvað gerir hún/hann?',
      },
      {
        category: 'stadir',
        level: null,
        where: 'Hvað gerir maður þar',
      },
    ],
    heard: 'vinnur',
    score: 0,
  },
  {
    text: 'lærir',
    file: '236688174f863edf.mp3',
    v: '5bb6828dcc69',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Athafnir',
      },
      {
        category: 'manneskja',
        level: 'A1',
        where: 'Hvað gerir hún/hann?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvað gerir hún/hann?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvað gerir hún/hann?',
      },
      {
        category: 'stadir',
        level: null,
        where: 'Hvað gerir maður þar',
      },
    ],
    heard: 'lærir',
    score: 0,
  },
  {
    text: 'syngur',
    file: 'ccf689398fb88d90.mp3',
    v: '3fc2c8eb8412',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Athafnir',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvað gerir hún/hann?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvað gerir hún/hann?',
      },
    ],
    heard: 'ég syngur',
    score: 0,
  },
  {
    text: 'spilar',
    file: 'e684e1978a5e29c8.mp3',
    v: '8530afde2306',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Athafnir',
      },
    ],
    heard: 'a spilar',
    score: 0,
  },
  {
    text: 'ferðast',
    file: '6bcc0074a355562e.mp3',
    v: 'b73956f7b990',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Athafnir',
      },
    ],
    heard: 'og ferðast',
    score: 0,
  },
  {
    text: 'eldar',
    file: '96db16b696c381f1.mp3',
    v: 'd6b01de0576e',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Athafnir',
      },
    ],
    heard: 'eldar',
    score: 0,
  },
  {
    text: 'les',
    file: '7b5454f75089acf2.mp3',
    v: 'f545705aad1b',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Athafnir',
      },
    ],
    heard: 'e',
    score: 0.667,
  },
  {
    text: 'teiknar',
    file: '2de132e4b18993a9.mp3',
    v: '129a8533e879',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: null,
        where: 'Athafnir',
      },
    ],
    heard: 'ég teiknar',
    score: 0,
  },
  {
    text: 'gamall/gömul',
    file: '95b9014a2b0e97f3.mp3',
    v: '9a48115e70bb',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'A1',
        where: 'Hvers konar manneskja er þetta?',
      },
    ],
    say: 'gamall eða gömul',
    heard: 'gamall eða gömul',
    score: 0,
  },
  {
    text: 'leikur sér',
    file: '0076b7842cc11a9d.mp3',
    v: '5a2b802071a1',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'A1',
        where: 'Hvað gerir hún/hann?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvað gerir hún/hann?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvað gerir hún/hann?',
      },
      {
        category: 'stadir',
        level: null,
        where: 'Hvað gerir maður þar',
      },
    ],
    heard: 'en leikur sér',
    score: 0,
  },
  {
    text: 'læknar',
    file: 'ab1b58c578116e55.mp3',
    v: 'bf4c404e9b21',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvað gerir hún/hann?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvað gerir hún/hann?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'læknar',
    score: 0,
  },
  {
    text: 'kennir',
    file: 'f05d336a2c1eef71.mp3',
    v: 'f5f1b44141b7',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvað gerir hún/hann?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvað gerir hún/hann?',
      },
    ],
    heard: 'ið kennir',
    score: 0,
  },
  {
    text: 'stjórnar',
    file: '38386ad3059aa048.mp3',
    v: '1d8ceb88542c',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvað gerir hún/hann?',
      },
    ],
    heard: 'mig stjórnar',
    score: 0,
  },
  {
    text: 'skapar',
    file: '8b35b94fd2eea355.mp3',
    v: '1799be949d9b',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvað gerir hún/hann?',
      },
    ],
    heard: 'hann skapar',
    score: 0,
  },
  {
    text: 'í vinnunni',
    file: 'b8f06afd0d69b98c.mp3',
    v: 'e69bd9eab93f',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'A1',
        where: 'Hvar er hægt að finna þessa manneskju?',
      },
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvar er hægt að finna þessa manneskju?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvar er hægt að finna þessa manneskju?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvar er hægt að nota þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvar er hægt að nota þetta?',
      },
    ],
    heard: 'í vinnunni',
    score: 0,
  },
  {
    text: 'á sjúkrahúsi',
    file: 'c6baa3616e3df78b.mp3',
    v: '5980346f2924',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvar er hægt að finna þessa manneskju?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvar er hægt að finna þessa manneskju?',
      },
    ],
    heard: 'sá sjúkrahúsi',
    score: 0,
  },
  {
    text: 'á leikvelli',
    file: '9d778e506fc6bc4f.mp3',
    v: '348653b4548c',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'A2',
        where: 'Hvar er hægt að finna þessa manneskju?',
      },
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvar er hægt að finna þessa manneskju?',
      },
    ],
    heard: 'á leikvelli',
    score: 0,
  },
  {
    text: 'á sviði',
    file: '5e7d5b4445d514e1.mp3',
    v: '0df7b9f2353c',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvar er hægt að finna þessa manneskju?',
      },
    ],
    heard: 'á sviði',
    score: 0,
  },
  {
    text: 'í sjónvarpi',
    file: '95e2d7d065273aa4.mp3',
    v: '59f9867ef519',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvar er hægt að finna þessa manneskju?',
      },
    ],
    heard: 'í sjónvarpi',
    score: 0,
  },
  {
    text: 'á ferðalagi',
    file: '4c5fb9be0b472dd7.mp3',
    v: '4f1147a70c7c',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'B1',
        where: 'Hvar er hægt að finna þessa manneskju?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvar er hægt að nota þetta?',
      },
    ],
    heard: 'á ferðalagi',
    score: 0,
  },
  {
    text: 'Hún/Hann er ___.',
    file: '63fb709e115c3390.mp3',
    v: 'c723dad87e85',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'A1',
        where: 'rammi',
      },
    ],
    say: 'Hún eða Hann er ….',
    heard: 'hún eða hann er',
    score: 0,
  },
  {
    text: 'Hún/Hann ___.',
    file: '46003ba532c60e5e.mp3',
    v: '5cd50307270c',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'A1',
        where: 'rammi',
      },
    ],
    say: 'Hún eða Hann ….',
    heard: 'hún eða hann',
    score: 0,
  },
  {
    text: 'Hún/Hann er ___ og ___.',
    file: '0f75da64878146cb.mp3',
    v: 'e78dbac7c8a0',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Hún eða Hann er … og ….',
    heard: 'hún eða hann er og',
    score: 0,
  },
  {
    text: 'Hún/Hann vinnur sem ___.',
    file: '821d173f49e978a5.mp3',
    v: '43113c9e9178',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Hún eða Hann vinnur sem ….',
    heard: 'hún eða hann vinnur sem',
    score: 0,
  },
  {
    text: 'Hún/Hann er oft ___.',
    file: 'e182734e96def1bf.mp3',
    v: '45b3bd1f43ad',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Hún eða Hann er oft ….',
    heard: 'hún eða hann er oft',
    score: 0,
  },
  {
    text: 'Þessi manneskja er ___ og er þekkt/óþekkt fyrir ___.',
    file: '47ef1edac316ad88.mp3',
    v: 'f7f14eeaa65e',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Þessi manneskja er … og er þekkt eða óþekkt fyrir ….',
    heard: 'þessi manneskja er og er þekkt eða óþekkt fyrir',
    score: 0,
  },
  {
    text: 'Hún/Hann er oft ___ vegna þess að ___.',
    file: '7347c7afc993eff3.mp3',
    v: '83ba8001ba58',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Hún eða Hann er oft … vegna þess að ….',
    heard: 'hún eða hann er oft vegna þess að',
    score: 0,
  },
  {
    text: 'Þetta er kennari. Hún er ung. Hún les.',
    file: '42c054980a5a5cff.mp3',
    v: '54c92dfc82b2',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'A1',
        where: 'dæmi',
      },
    ],
    heard: 'þetta er kennari hún er ung hunlu',
    score: 0.114,
  },
  {
    text: 'Þetta er kona sem er há. Hún er ung og myndarleg. Hún vinnur sem læknir.',
    file: 'f5456614b800bc18.mp3',
    v: '82d2496f960f',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'A2',
        where: 'dæmi',
      },
    ],
    heard: 'þetta er kona sem er há hún er ung og myndarleg hún vinnur sem læknir',
    score: 0,
  },
  {
    text: 'Ég held að þetta sé söngvari vegna þess að hún er fræg og syngur. Þessi manneskja er ung og er þekkt fyrir tónlist.',
    file: 'c25738b8c2efb3d5.mp3',
    v: '0925ed2a6d07',
    approved: false,
    places: [
      {
        category: 'manneskja',
        level: 'B1',
        where: 'dæmi',
      },
    ],
    heard:
      'ég held að þetta sé söngvari vegna þess að hún er fræg og syngur þessi manneskja er ung og er þekkt fyrir tónlist',
    score: 0,
  },
  {
    text: 'hús',
    file: '6a86a50a4a2a6842.mp3',
    v: '064f0b64eca3',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvers konar staður er þetta?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvers konar staður er þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvers konar staður er þetta?',
      },
    ],
    heard: 'hús',
    score: 0,
  },
  {
    text: 'íbúð',
    file: 'e70e20019391747d.mp3',
    v: '098988da2c3c',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvers konar staður er þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvers konar staður er þetta?',
      },
    ],
    heard: 'íbúð',
    score: 0,
  },
  {
    text: 'skóli',
    file: '00d8592d3699cafd.mp3',
    v: '23db74e94c1d',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvers konar staður er þetta?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvers konar staður er þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvers konar staður er þetta?',
      },
    ],
    heard: 'skóli',
    score: 0,
  },
  {
    text: 'sjúkrahús',
    file: '225c2b2c0655a994.mp3',
    v: '372b13d736d3',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvers konar staður er þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvers konar staður er þetta?',
      },
    ],
    heard: 'sjúkrahús',
    score: 0,
  },
  {
    text: 'búð/verslun',
    file: '0a876af0e32aabd4.mp3',
    v: 'bef3b40146ae',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvers konar staður er þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvers konar staður er þetta?',
      },
    ],
    say: 'búð eða verslun',
    heard: 'búð eða verslun',
    score: 0,
  },
  {
    text: 'veitingastaður',
    file: '7e362291cffda506.mp3',
    v: 'fc520f0ddd15',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvers konar staður er þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvers konar staður er þetta?',
      },
    ],
    heard: 'veitingastaður',
    score: 0,
  },
  {
    text: 'safn',
    file: '617cfbf6a458c190.mp3',
    v: '35980567acb7',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvers konar staður er þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvers konar staður er þetta?',
      },
    ],
    heard: 'safn',
    score: 0,
  },
  {
    text: 'kirkja',
    file: 'f7ad1e39a03c344f.mp3',
    v: '18892610e794',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvers konar staður er þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvers konar staður er þetta?',
      },
    ],
    heard: 'kirkja',
    score: 0,
  },
  {
    text: 'sundlaug',
    file: '0f4fab3ca07d2666.mp3',
    v: '2e5c86b7f477',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvers konar staður er þetta?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvers konar staður er þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvers konar staður er þetta?',
      },
    ],
    heard: 'sundlaug',
    score: 0,
  },
  {
    text: 'leikvöllur',
    file: '2d71542613d4d0bd.mp3',
    v: 'a39fa4213b2f',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvers konar staður er þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvers konar staður er þetta?',
      },
    ],
    heard: 'leikvöllur',
    score: 0,
  },
  {
    text: 'í bænum/borginni',
    file: '4110a553efa70b3c.mp3',
    v: '56f6f20240a5',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Staðsetning',
      },
    ],
    say: 'í bænum eða borginni',
    heard: 'í bænum eða borginni',
    score: 0,
  },
  {
    text: 'í úthverfi',
    file: 'bda81ffb3a68e35e.mp3',
    v: '676c3e559d6a',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Staðsetning',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvar er þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvar er þetta?',
      },
    ],
    heard: 'í úthverfi',
    score: 0,
  },
  {
    text: 'á landi/sveitinni',
    file: '9493f2e4c468416d.mp3',
    v: 'fa5dc6608b9c',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Staðsetning',
      },
    ],
    say: 'á landi eða sveitinni',
    heard: 'á landi eða sveitinni',
    score: 0,
  },
  {
    text: 'við sjóinn',
    file: '3fc3a34dac23ba2e.mp3',
    v: '58e249978091',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Staðsetning',
      },
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvar er þetta?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvar er þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvar er þetta?',
      },
    ],
    heard: 'við sjóinn',
    score: 0,
  },
  {
    text: 'í fjöllunum',
    file: 'd64dd3b9250db928.mp3',
    v: 'f8f0d7089c84',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Staðsetning',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvar er þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvar er þetta?',
      },
    ],
    heard: 'í fjöllunum',
    score: 0,
  },
  {
    text: 'lítill/lítil/lítið',
    file: 'c34edc2de8ccba2a.mp3',
    v: 'c1e42f952ede',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Stærð',
      },
    ],
    say: 'lítill eða lítil eða lítið',
    heard: 'lítill eða lítil eða lítið',
    score: 0,
  },
  {
    text: 'meðalstór/meðalstórt',
    file: '077a007613af2bce.mp3',
    v: 'b60e0c0283ae',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Stærð',
      },
    ],
    say: 'meðalstór eða meðalstórt',
    heard: 'er meðal stór eða meðalstórt',
    score: 0.042,
  },
  {
    text: 'stór/stórt',
    file: 'c056a525df789ff7.mp3',
    v: 'd4830dee59a0',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Stærð',
      },
    ],
    say: 'stór eða stórt',
    heard: 'stór eða stórt',
    score: 0,
  },
  {
    text: 'borðar',
    file: '24698065ff4bb967.mp3',
    v: 'b1899fd6a0c1',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Hvað gerir maður þar',
      },
    ],
    heard: 'han borðar',
    score: 0,
  },
  {
    text: 'verslar',
    file: '324d821e9d418591.mp3',
    v: '1d705b73600b',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Hvað gerir maður þar',
      },
    ],
    heard: 'verslar',
    score: 0,
  },
  {
    text: 'sefur',
    file: '61414a0a79899ab1.mp3',
    v: 'f12d6a3b5b82',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: null,
        where: 'Hvað gerir maður þar',
      },
    ],
    heard: 'sefur',
    score: 0,
  },
  {
    text: 'búð',
    file: 'fd21b32f6abc8763.mp3',
    v: 'cc2470b3e18c',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvers konar staður er þetta?',
      },
    ],
    heard: 'búð',
    score: 0,
  },
  {
    text: 'bókasafn',
    file: '7868df569565f605.mp3',
    v: '4f33e93b8df1',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvers konar staður er þetta?',
      },
      {
        category: 'skolinn',
        level: null,
        where: 'Staðir',
      },
    ],
    heard: 'bókasafn',
    score: 0,
  },
  {
    text: 'íþróttahús',
    file: '40f871b3a899ff88.mp3',
    v: 'e1e61e5ece09',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvers konar staður er þetta?',
      },
    ],
    heard: 'íþróttahús',
    score: 0,
  },
  {
    text: 'gamalt',
    file: '580fc8273a40c895.mp3',
    v: '095306627d69',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvernig lítur þetta út?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lítur þetta út?',
      },
    ],
    heard: 'gamalt',
    score: 0,
  },
  {
    text: 'nýtt',
    file: 'c96ac29579fe2480.mp3',
    v: 'aee73b55df06',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvernig lítur þetta út?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lítur þetta út?',
      },
    ],
    heard: 'nýtt',
    score: 0,
  },
  {
    text: 'fallegt',
    file: '4cb0a72c1fb5157f.mp3',
    v: '3b2c4174da26',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvernig lítur þetta út?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lítur þetta út?',
      },
    ],
    heard: 'og fallegt',
    score: 0,
  },
  {
    text: 'ljótt',
    file: 'ede6dc35a1025952.mp3',
    v: '692e307a9e50',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvernig lítur þetta út?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lítur þetta út?',
      },
    ],
    heard: 'ljótt',
    score: 0,
  },
  {
    text: 'nútímalegt',
    file: 'f82564f5db2d15f0.mp3',
    v: 'd4d057740ada',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lítur þetta út?',
      },
    ],
    heard: 'nútímalegt',
    score: 0,
  },
  {
    text: 'sögulegt',
    file: 'd7c21c3c3fc48a0b.mp3',
    v: 'c9857c3d516b',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvernig lítur þetta út?',
      },
    ],
    heard: 'sögulegt',
    score: 0,
  },
  {
    text: 'til að búa',
    file: '21a796e30083f0b9.mp3',
    v: '71718c5ab1ff',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'A1',
        where: 'Til hvers er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Til hvers er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Til hvers er þetta notað?',
      },
    ],
    heard: 'til að búa',
    score: 0,
  },
  {
    text: 'til að læra',
    file: '334633aeae327723.mp3',
    v: '10b009cd04f7',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'A1',
        where: 'Til hvers er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Til hvers er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Til hvers er þetta notað?',
      },
    ],
    heard: 'til að læra',
    score: 0,
  },
  {
    text: 'til að versla',
    file: '25f63acc38c27941.mp3',
    v: '0abfea2bf0f8',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'A1',
        where: 'Til hvers er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Til hvers er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Til hvers er þetta notað?',
      },
    ],
    heard: 'til að versla',
    score: 0,
  },
  {
    text: 'til að hvílast',
    file: '8c2298f9087eabef.mp3',
    v: '9ea0a7c765a8',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'A2',
        where: 'Til hvers er þetta notað?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Til hvers er þetta notað?',
      },
    ],
    heard: 'til að hvílast',
    score: 0,
  },
  {
    text: 'til að stunda íþróttir',
    file: 'ab210ee2be546b6f.mp3',
    v: '0979b5c23fac',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'B1',
        where: 'Til hvers er þetta notað?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að stunda íþróttir',
    score: 0,
  },
  {
    text: 'til að skemmta sér',
    file: '30add42ca5e1ed8c.mp3',
    v: 'bb093414b534',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'B1',
        where: 'Til hvers er þetta notað?',
      },
    ],
    heard: 'til að skemmta sér',
    score: 0,
  },
  {
    text: 'nemendur',
    file: 'a9f7d868241d09fb.mp3',
    v: '0d2c00431d16',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'nemendur',
    score: 0,
  },
  {
    text: 'kennarar',
    file: '0874d75c8739b2e7.mp3',
    v: '33a5e0226a76',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'kennarar',
    score: 0,
  },
  {
    text: 'listamenn',
    file: '79f4c58e79d41ab9.mp3',
    v: '8c7331aa2bde',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'listamenn',
    score: 0,
  },
  {
    text: 'í bænum',
    file: '8d9c2e22bb55b66c.mp3',
    v: 'e7aedfffd26a',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvar er þetta?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvar er þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvar er þetta?',
      },
    ],
    heard: 'í bænum',
    score: 0,
  },
  {
    text: 'úti á landi',
    file: 'd238601e2d793b0b.mp3',
    v: '9e8a72f07078',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'A1',
        where: 'Hvar er þetta?',
      },
      {
        category: 'stadir',
        level: 'A2',
        where: 'Hvar er þetta?',
      },
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvar er þetta?',
      },
    ],
    heard: 'úti á landi',
    score: 0,
  },
  {
    text: 'í miðborginni',
    file: 'b1e364aad82bf356.mp3',
    v: '0f3477e8311c',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'B1',
        where: 'Hvar er þetta?',
      },
    ],
    heard: 'í miðborginni',
    score: 0,
  },
  {
    text: 'Maður ___ þar.',
    file: '520e97ecc697163c.mp3',
    v: '431f5d137c32',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'A1',
        where: 'rammi',
      },
    ],
    say: 'Maður … þar.',
    heard: 'maður þar',
    score: 0,
  },
  {
    text: 'Maður fer þangað ___.',
    file: 'a48d11a31c4b4d30.mp3',
    v: '4d25c8fb525d',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Maður fer þangað ….',
    heard: 'maður fer þangað',
    score: 0,
  },
  {
    text: 'Þetta er ___ sem er staðsett ___.',
    file: '302a7b7c91d3e97f.mp3',
    v: '5b82136f173c',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Þetta er … sem er staðsett ….',
    heard: 'þetta er sem er staðsett',
    score: 0,
  },
  {
    text: 'Fólk fer þangað ___ og ___.',
    file: '98b649d58a7d76ae.mp3',
    v: '67fce87830b2',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Fólk fer þangað … og ….',
    heard: 'fólk fer þangað og',
    score: 0,
  },
  {
    text: 'Mér finnst þetta ___ vegna þess að ___.',
    file: 'cb8479c286193a03.mp3',
    v: '2c23eeab2533',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Mér finnst þetta … vegna þess að ….',
    heard: 'og mér finnst þetta vegna þess að',
    score: 0,
  },
  {
    text: 'Þetta er skóli. Maður lærir þar.',
    file: 'c6f7cfd6c3ce20c4.mp3',
    v: 'f90113e6ec86',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'A1',
        where: 'dæmi',
      },
    ],
    heard: 'þetta er skóli maður lærir þar',
    score: 0,
  },
  {
    text: 'Þetta er sundlaug sem er í bænum. Maður fer þangað til að synda.',
    file: '2016dbd43f4438e2.mp3',
    v: 'd086df9e1b9b',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'A2',
        where: 'dæmi',
      },
    ],
    heard: 'þetta er sundlaug sem er í bænum maður fer þangað til að synda',
    score: 0,
  },
  {
    text: 'Þetta er safn sem er staðsett í borginni. Fólk fer þangað til að læra og skoða list.',
    file: '76c643828a034807.mp3',
    v: '539325d2bf67',
    approved: false,
    places: [
      {
        category: 'stadir',
        level: 'B1',
        where: 'dæmi',
      },
    ],
    heard: 'þetta er safn sem er staðsett í borginni fólk fer þangað til að læra og skoða list',
    score: 0,
  },
  {
    text: 'bolur/stuttermabolur',
    file: '773cd437df167e2d.mp3',
    v: '81848cc19abf',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Tegund',
      },
    ],
    say: 'bolur eða stuttermabolur',
    heard: 'bolur eða stutt er bollur',
    score: 0.167,
  },
  {
    text: 'peysa',
    file: '43a19ffd3e549409.mp3',
    v: '9f4230e9a1ce',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvers konar klæðnaður er þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvers konar klæðnaður er þetta?',
      },
    ],
    heard: 'peysa',
    score: 0,
  },
  {
    text: 'skyrta',
    file: 'd96107adeb6dc7cd.mp3',
    v: '4f52e1fdbf8a',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvers konar klæðnaður er þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvers konar klæðnaður er þetta?',
      },
    ],
    heard: 'ég skyrta',
    score: 0,
  },
  {
    text: 'buxur',
    file: '404bfd37fd58dfda.mp3',
    v: '552887064257',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvers konar klæðnaður er þetta?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvers konar klæðnaður er þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvers konar klæðnaður er þetta?',
      },
    ],
    heard: 'buxur',
    score: 0,
  },
  {
    text: 'pils',
    file: '630b20986b900379.mp3',
    v: '029164cef592',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvers konar klæðnaður er þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvers konar klæðnaður er þetta?',
      },
    ],
    heard: 'pils',
    score: 0,
  },
  {
    text: 'jakki',
    file: 'c473cbf76eec89d8.mp3',
    v: '08a2b48ee6eb',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvers konar klæðnaður er þetta?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvers konar klæðnaður er þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvers konar klæðnaður er þetta?',
      },
    ],
    heard: 'jakki',
    score: 0,
  },
  {
    text: 'úlpa',
    file: 'ecd50533b6b353a5.mp3',
    v: 'c27933723287',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvers konar klæðnaður er þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvers konar klæðnaður er þetta?',
      },
    ],
    heard: 'úlpa',
    score: 0,
  },
  {
    text: 'sokkar',
    file: 'ec391a6c409daa00.mp3',
    v: 'b36b7526217d',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvers konar klæðnaður er þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvers konar klæðnaður er þetta?',
      },
    ],
    heard: 'sokkar',
    score: 0,
  },
  {
    text: 'skór',
    file: 'ffc6710796e06595.mp3',
    v: '3b3afa26ffb0',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvers konar klæðnaður er þetta?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvers konar klæðnaður er þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvers konar klæðnaður er þetta?',
      },
    ],
    heard: 'an er skór',
    score: 0,
  },
  {
    text: 'húfa',
    file: '4a96db4abe35f283.mp3',
    v: '126782c71aa7',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvers konar klæðnaður er þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvers konar klæðnaður er þetta?',
      },
    ],
    heard: 'kúfa',
    score: 0.25,
  },
  {
    text: 'hanskar',
    file: '73bb1621776188a1.mp3',
    v: 'fffa21172799',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvers konar klæðnaður er þetta?',
      },
    ],
    heard: 'hanskar',
    score: 0,
  },
  {
    text: 'trefill',
    file: 'e98ecc8f3614b163.mp3',
    v: '41f180354c7b',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Tegund',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvers konar klæðnaður er þetta?',
      },
    ],
    heard: 'trefill',
    score: 0,
  },
  {
    text: 'rauður/rauð/rautt',
    file: '5aacdbcc192ef853.mp3',
    v: 'f33792799138',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Litur',
      },
    ],
    say: 'rauður eða rauð eða rautt',
    heard: 'rauður eða rauð eða rautt',
    score: 0,
  },
  {
    text: 'blár/blá/blátt',
    file: 'd41c83460cd675d7.mp3',
    v: '86469bb60c11',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Litur',
      },
    ],
    say: 'blár eða blá eða blátt',
    heard: 'blár eða blá eða blátt',
    score: 0,
  },
  {
    text: 'grænn/græn/grænt',
    file: 'ba1537249d57643a.mp3',
    v: 'dfdae6d96048',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Litur',
      },
    ],
    say: 'grænn eða græn eða grænt',
    heard: 'grænn eða græn eða grænt',
    score: 0,
  },
  {
    text: 'gulur/gul/gult',
    file: '6d9b21baf469af70.mp3',
    v: '1bf81ac1647d',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Litur',
      },
    ],
    say: 'gulur eða gul eða gult',
    heard: 'gulur eða gul eða gult',
    score: 0,
  },
  {
    text: 'svartur/svört/svart',
    file: '83124fc9590b9aa3.mp3',
    v: '7920c332a189',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Litur',
      },
    ],
    say: 'svartur eða svört eða svart',
    heard: 'svartur eða svört eða svart',
    score: 0,
  },
  {
    text: 'hvítur/hvít/hvítt',
    file: 'af344cc3bb888a88.mp3',
    v: '87e5d40e1f2f',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Litur',
      },
    ],
    say: 'hvítur eða hvít eða hvítt',
    heard: 'hvítur eða hvít eða hvítt',
    score: 0,
  },
  {
    text: 'bleikur/bleik/bleikt',
    file: 'ee05627e7f02194e.mp3',
    v: 'a5bdd5dea1a8',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Litur',
      },
    ],
    say: 'bleikur eða bleik eða bleikt',
    heard: 'bleikur eða bleik eða bleikt',
    score: 0,
  },
  {
    text: 'brúnn/brún/brúnt',
    file: 'd1ce6f9e9f143d9e.mp3',
    v: 'aa4e8201bf9f',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Litur',
      },
    ],
    say: 'brúnn eða brún eða brúnt',
    heard: 'brúnn eða brún eða brúnt',
    score: 0,
  },
  {
    text: 'rauðir/rauðar',
    file: '00955f5c36ce3fb0.mp3',
    v: '922a62b12b06',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Litur í fleirtölu',
      },
    ],
    say: 'rauðir eða rauðar',
    heard: 'rauðir eða rauðar',
    score: 0,
  },
  {
    text: 'bláir/bláar',
    file: 'd22c53cdc9aab4f7.mp3',
    v: 'e8bf01e21009',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Litur í fleirtölu',
      },
    ],
    say: 'bláir eða bláar',
    heard: 'bláir eða bláar',
    score: 0,
  },
  {
    text: 'grænir/grænar',
    file: 'ca95193408e1081d.mp3',
    v: 'df6323cc09b2',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Litur í fleirtölu',
      },
    ],
    say: 'grænir eða grænar',
    heard: 'grænir eða grænar',
    score: 0,
  },
  {
    text: 'gulir/gular',
    file: 'cf8c927289fe3916.mp3',
    v: 'a8bd464b897d',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Litur í fleirtölu',
      },
    ],
    say: 'gulir eða gular',
    heard: 'gulir eða gular',
    score: 0,
  },
  {
    text: 'svartir/svartar',
    file: 'c225f371d2a19ac4.mp3',
    v: '9cfb561ee42d',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Litur í fleirtölu',
      },
    ],
    say: 'svartir eða svartar',
    heard: 'svartir eða svartar',
    score: 0,
  },
  {
    text: 'hvítir/hvítar',
    file: '2c003dddf5d01d92.mp3',
    v: 'b67ab0c5003a',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Litur í fleirtölu',
      },
    ],
    say: 'hvítir eða hvítar',
    heard: 'hvítir eða hvítar',
    score: 0,
  },
  {
    text: 'bleikir/bleikar',
    file: '08c5facd4574b8fc.mp3',
    v: '7e5eaa401d52',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Litur í fleirtölu',
      },
    ],
    say: 'bleikir eða bleikar',
    heard: 'bleikir eða bleikar',
    score: 0,
  },
  {
    text: 'brúnir/brúnar',
    file: 'f8ea91bbc9950f4b.mp3',
    v: '09bf3c5126a2',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Litur í fleirtölu',
      },
    ],
    say: 'brúnir eða brúnar',
    heard: 'brúnir eða brúnar',
    score: 0,
  },
  {
    text: 'úr ull',
    file: '9b39f6ccd91f3fdc.mp3',
    v: 'eb0ec06abe4e',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Efni',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
    ],
    heard: 'sú rull',
    score: 0.333,
  },
  {
    text: 'úr bómull',
    file: '9a86ae50d75e6267.mp3',
    v: '543e7db5fb3d',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Efni',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
    ],
    heard: 'þú er bómull',
    score: 0.111,
  },
  {
    text: 'úr leðri',
    file: '9c67f34bf2d0345b.mp3',
    v: 'edacd07dd93e',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Efni',
      },
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Úr hverju er það gert?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Úr hverju er það gert?',
      },
    ],
    heard: 'úr leðri',
    score: 0,
  },
  {
    text: 'þegar rignir',
    file: '9d73583c04aee05f.mp3',
    v: 'b1fe7bd16138',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Hvenær',
      },
    ],
    heard: 'þegar rignir',
    score: 0,
  },
  {
    text: 'við sérstök tilefni',
    file: 'c44667e4696a012d.mp3',
    v: '66eade71ba29',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Hvenær',
      },
    ],
    heard: 'við sérstök tilefni',
    score: 0,
  },
  {
    text: 'á höfðinu',
    file: 'b0fe28940a581871.mp3',
    v: '4b43e4600465',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Á hvaða líkamshluta',
      },
    ],
    heard: 'á höfðinu',
    score: 0,
  },
  {
    text: 'á efri hluta líkamans',
    file: '22087e1baef61979.mp3',
    v: 'e898d31677b3',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Á hvaða líkamshluta',
      },
    ],
    heard: 'sá efri hluta líkamans',
    score: 0,
  },
  {
    text: 'á neðri hluta líkamans',
    file: '3e676d7ab87d158b.mp3',
    v: '2e5dbd5279b8',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Á hvaða líkamshluta',
      },
    ],
    heard: 'á neðri hluta líkamans',
    score: 0,
  },
  {
    text: 'á fótunum',
    file: '8c1f9f665f29f0a4.mp3',
    v: 'd054d6753a7f',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Á hvaða líkamshluta',
      },
    ],
    heard: 'á fótunum',
    score: 0,
  },
  {
    text: 'á höndunum',
    file: '9b0f45ef94e3d5bb.mp3',
    v: 'd915eb76a4a3',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: null,
        where: 'Á hvaða líkamshluta',
      },
    ],
    heard: 'sá höndunum',
    score: 0,
  },
  {
    text: 'bolur',
    file: '318a201f78a49995.mp3',
    v: 'b2d8b4eebceb',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvers konar klæðnaður er þetta?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvers konar klæðnaður er þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvers konar klæðnaður er þetta?',
      },
    ],
    heard: 'bolur',
    score: 0,
  },
  {
    text: 'blátt',
    file: 'db5ff99ab7189636.mp3',
    v: 'd83b187a7dc2',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'en blátt',
    score: 0,
  },
  {
    text: 'svart',
    file: '65932a53ece1419d.mp3',
    v: 'b34053c748ad',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'og svart',
    score: 0,
  },
  {
    text: 'bleikt',
    file: '8b59ecdf709220c4.mp3',
    v: 'e10e077b02b7',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvernig lítur það út?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'eg bleikt',
    score: 0,
  },
  {
    text: 'mynstur',
    file: '157fd913305f134b.mp3',
    v: '52d8e256e1fb',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'aer mynstur',
    score: 0,
  },
  {
    text: 'einlitt',
    file: '49dba3b069dc616b.mp3',
    v: '4710fd918753',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvernig lítur það út?',
      },
    ],
    heard: 'ein litt',
    score: 0.143,
  },
  {
    text: 'til að hlýja sér',
    file: 'f325b64337d9d753.mp3',
    v: 'b80a58578797',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að hlýja sér',
    score: 0,
  },
  {
    text: 'til að verja sig',
    file: '7c9f2dbe92fd21e2.mp3',
    v: 'ef669e09443e',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að verja sig',
    score: 0,
  },
  {
    text: 'til að líta vel út',
    file: 'fe79651135e87de3.mp3',
    v: 'ea7915a21d35',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Til hvers er það notað?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að líta vel út',
    score: 0,
  },
  {
    text: 'til að líða vel',
    file: '14f0db93976fdfed.mp3',
    v: 'a87240dc6d53',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Til hvers er það notað?',
      },
    ],
    heard: 'til að líða vel',
    score: 0,
  },
  {
    text: 'íþróttamenn',
    file: '6849ea88f04ccf82.mp3',
    v: '6948cf174b54',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hver notar þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hver notar þetta?',
      },
    ],
    heard: 'íþróttamenn',
    score: 0,
  },
  {
    text: 'inni',
    file: '22243f75604b645a.mp3',
    v: 'f4ecfcd1faa6',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'Hvar er hægt að nota þetta?',
      },
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvar er hægt að nota þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvar er hægt að nota þetta?',
      },
    ],
    heard: 'inni',
    score: 0,
  },
  {
    text: 'í íþróttum',
    file: 'afab82af54c6a7c7.mp3',
    v: 'f6bdce75cfd9',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'Hvar er hægt að nota þetta?',
      },
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvar er hægt að nota þetta?',
      },
    ],
    heard: 'í íþróttum',
    score: 0,
  },
  {
    text: 'á hátíð',
    file: 'd287fbfd5255d303.mp3',
    v: '112b71087266',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'Hvar er hægt að nota þetta?',
      },
    ],
    heard: 'þá hátíð',
    score: 0,
  },
  {
    text: 'Maður klæðist því ___.',
    file: '7e9b493dc1fe1916.mp3',
    v: 'f0361e5f2f50',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Maður klæðist því ….',
    heard: 'maður klæðist því',
    score: 0,
  },
  {
    text: 'Þetta er ___ sem er ___. Maður notar það ___.',
    file: '20e349534f5dc01a.mp3',
    v: '929b828a2eb0',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Þetta er … sem er …. Maður notar það ….',
    heard: 'þetta er sem er maður notar það',
    score: 0,
  },
  {
    text: 'Það er ___ og hentar vel ___.',
    file: '4ababec58eddc067.mp3',
    v: '75b5f2829cf3',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Það er … og hentar vel ….',
    heard: 'það er og hentar vel',
    score: 0,
  },
  {
    text: 'Þetta er úlpa. Hún er blá.',
    file: 'dc81e229dead263f.mp3',
    v: '414aa376765d',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'A1',
        where: 'dæmi',
      },
    ],
    heard: 'þetta er úlpa hún er blá',
    score: 0,
  },
  {
    text: 'Þetta er peysa sem er rauð. Maður klæðist henni á veturna.',
    file: 'c884db635c2406b3.mp3',
    v: 'ebf70c097e73',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'A2',
        where: 'dæmi',
      },
    ],
    heard: 'þetta er peysa sem er rauð maður klæðist henni á veturna',
    score: 0,
  },
  {
    text: 'Þetta er jakki sem er úr leðri. Maður notar hann á veturna. Hann er svartur og hentar vel í kulda.',
    file: '41f1f95f304b15dd.mp3',
    v: '1f104d5b9671',
    approved: false,
    places: [
      {
        category: 'klaednadur',
        level: 'B1',
        where: 'dæmi',
      },
    ],
    heard:
      'þetta er jakki sem er úr leðri maður notar hana á veturna hann er svartur og hentar vel í kulda',
    score: 0.011,
  },
  {
    text: 'bók',
    file: '0253c3d11a009b41.mp3',
    v: '40ac8f2f48e9',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Hlutir',
      },
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvað er í skólatöskunni?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað er í skólatöskunni?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað er í skólatöskunni?',
      },
    ],
    heard: 'í bók',
    score: 0,
  },
  {
    text: 'penni',
    file: 'db44efcb22dded32.mp3',
    v: '1ca9a36597cc',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Hlutir',
      },
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvað er í skólatöskunni?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað er í skólatöskunni?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað er í skólatöskunni?',
      },
    ],
    heard: 'petni',
    score: 0.2,
  },
  {
    text: 'blýantur',
    file: 'f3cef931c7be84b2.mp3',
    v: '5f3878d760ca',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Hlutir',
      },
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvað er í skólatöskunni?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað er í skólatöskunni?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað er í skólatöskunni?',
      },
    ],
    heard: 'blý antur',
    score: 0.125,
  },
  {
    text: 'tölva',
    file: '141742b5b991038b.mp3',
    v: 'a9bf55053966',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Hlutir',
      },
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvað er í skólatöskunni?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað er í skólatöskunni?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað er í skólatöskunni?',
      },
    ],
    heard: 'og tölva',
    score: 0,
  },
  {
    text: 'stílabók',
    file: '4e4c6a03fde0c355.mp3',
    v: '0cc15e3d0bf5',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Hlutir',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað er í skólatöskunni?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað er í skólatöskunni?',
      },
    ],
    heard: 'stíla bók',
    score: 0.125,
  },
  {
    text: 'strokleður',
    file: 'bd6e38796420f6f7.mp3',
    v: 'e491730341dd',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Hlutir',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað er í skólatöskunni?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað er í skólatöskunni?',
      },
    ],
    heard: 'ég strokleður',
    score: 0,
  },
  {
    text: 'reglustika',
    file: '95bb7dd990d42c4b.mp3',
    v: '7678a3a7aaac',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Hlutir',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað er í skólatöskunni?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað er í skólatöskunni?',
      },
    ],
    heard: 'reglu slíka',
    score: 0.3,
  },
  {
    text: 'reiknivél',
    file: '1865a628e19d9a4b.mp3',
    v: '2468787e0065',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Hlutir',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað er í skólatöskunni?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað er í skólatöskunni?',
      },
    ],
    heard: 'reikni vél',
    score: 0.111,
  },
  {
    text: 'taska',
    file: '3151851e02cc9209.mp3',
    v: 'c1682dc2d456',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Hlutir',
      },
    ],
    heard: 'taska',
    score: 0,
  },
  {
    text: 'skólastofa',
    file: '5b8d6254bb0382c8.mp3',
    v: 'fc04fc5caf99',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Staðir',
      },
    ],
    heard: 'skólastofa',
    score: 0,
  },
  {
    text: 'matsalur',
    file: '275a49b185bfb0d2.mp3',
    v: 'cc3946d85cb5',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Staðir',
      },
    ],
    heard: 'matsalur',
    score: 0,
  },
  {
    text: 'íþróttasalur',
    file: 'b3fcb3060b5ea606.mp3',
    v: '66710d64cf62',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Staðir',
      },
    ],
    heard: 'íþróttasalur',
    score: 0,
  },
  {
    text: 'gangur',
    file: '9449920947bb8235.mp3',
    v: '3b363746df95',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Staðir',
      },
    ],
    heard: 'in gangur',
    score: 0,
  },
  {
    text: 'skrifstofa',
    file: '03a0f667c67d9106.mp3',
    v: '8007650f0f89',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Staðir',
      },
    ],
    heard: 'er skrifstofa',
    score: 0,
  },
  {
    text: 'skólastjóri',
    file: '1829fbab12ce9bb6.mp3',
    v: '1dec9350ffe5',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Fólk',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hver hjálpar?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hver hjálpar?',
      },
    ],
    heard: 'skólastjóri',
    score: 0,
  },
  {
    text: 'námsráðgjafi',
    file: '4d35f93220bffd64.mp3',
    v: 'a1cd36a069cc',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Fólk',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hver hjálpar?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hver hjálpar?',
      },
    ],
    heard: 'námsráðgjafi',
    score: 0,
  },
  {
    text: 'bekkjarfélagi',
    file: '3ff5f695a3e089a7.mp3',
    v: '3f14aa42bb7e',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Fólk',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hver hjálpar?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hver hjálpar?',
      },
    ],
    heard: 'bekkjarfélagi',
    score: 0,
  },
  {
    text: 'íslenska',
    file: 'f2af59cd2f25aa54.mp3',
    v: 'cb65ffa4b281',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Fög',
      },
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvaða fag er þetta?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvaða fag er þetta?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða fag er þetta?',
      },
    ],
    heard: 'íslenska',
    score: 0,
  },
  {
    text: 'stærðfræði',
    file: 'e513fc399641a47c.mp3',
    v: 'b72a41805558',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Fög',
      },
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvaða fag er þetta?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvaða fag er þetta?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða fag er þetta?',
      },
    ],
    heard: 'stærðfræði',
    score: 0,
  },
  {
    text: 'enska',
    file: '4d9826fd3e60a5b1.mp3',
    v: 'a86aeda20f0c',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Fög',
      },
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvaða fag er þetta?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvaða fag er þetta?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða fag er þetta?',
      },
    ],
    heard: 'enska',
    score: 0,
  },
  {
    text: 'saga',
    file: '936fccfc8fe9a540.mp3',
    v: '8315947f7c05',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Fög',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvaða fag er þetta?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða fag er þetta?',
      },
    ],
    heard: 'saga',
    score: 0,
  },
  {
    text: 'náttúrufræði',
    file: '57cb42d24d31d646.mp3',
    v: 'be7f132b9cc8',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Fög',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvaða fag er þetta?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða fag er þetta?',
      },
    ],
    heard: 'náttúrufræði',
    score: 0,
  },
  {
    text: 'íþróttir',
    file: '377e8822becba2cc.mp3',
    v: '64ba99214b59',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Fög',
      },
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvaða fag er þetta?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvaða fag er þetta?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða fag er þetta?',
      },
    ],
    heard: 'íþróttir',
    score: 0,
  },
  {
    text: 'lestu',
    file: 'f699a9df92872b86.mp3',
    v: 'edee2070b8cc',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Fyrirmæli',
      },
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvað á ég að gera?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað á ég að gera?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað á ég að gera?',
      },
    ],
    heard: 'lestu',
    score: 0,
  },
  {
    text: 'skrifaðu',
    file: '6df9ae9dbc8130d2.mp3',
    v: '9e3a4833d6ca',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Fyrirmæli',
      },
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvað á ég að gera?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað á ég að gera?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað á ég að gera?',
      },
    ],
    heard: 'en skrifaðu',
    score: 0,
  },
  {
    text: 'hlustaðu',
    file: '0381a8ec6ddc1f31.mp3',
    v: '20882f196390',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Fyrirmæli',
      },
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvað á ég að gera?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað á ég að gera?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað á ég að gera?',
      },
    ],
    heard: 'hlustaðu',
    score: 0,
  },
  {
    text: 'svaraðu',
    file: 'e5bf3bd13ff4f91c.mp3',
    v: '5cd892a726de',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Fyrirmæli',
      },
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvað á ég að gera?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað á ég að gera?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað á ég að gera?',
      },
    ],
    heard: 'ég svaraðu',
    score: 0,
  },
  {
    text: 'merktu við',
    file: '97e5304b6bd0e568.mp3',
    v: 'd73b682eed24',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Fyrirmæli',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað á ég að gera?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað á ég að gera?',
      },
    ],
    heard: 'sem ertu við',
    score: 0.2,
  },
  {
    text: 'lýstu',
    file: 'c95a95e63bdcf837.mp3',
    v: 'f84c3f1e06ca',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Fyrirmæli',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað á ég að gera?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað á ég að gera?',
      },
    ],
    heard: 'lýstu',
    score: 0,
  },
  {
    text: 'berðu saman',
    file: 'bd1335a7af904b30.mp3',
    v: 'ddce953a45a8',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Fyrirmæli',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað á ég að gera?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað á ég að gera?',
      },
    ],
    heard: 'þau berðu saman',
    score: 0,
  },
  {
    text: 'útskýrðu',
    file: '906eb5888b9591d2.mp3',
    v: 'd1311c1dfd6f',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: null,
        where: 'Fyrirmæli',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað á ég að gera?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað á ég að gera?',
      },
    ],
    heard: 'útskýrðu',
    score: 0,
  },
  {
    text: 'kennslubók',
    file: 'e42640a936eb8f18.mp3',
    v: 'bf759a0e3fe9',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað er í skólatöskunni?',
      },
    ],
    heard: 'kennslubók',
    score: 0,
  },
  {
    text: 'verkefnablað',
    file: 'ef31b2f8a35b7d8a.mp3',
    v: '53b4bb3910bf',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað er í skólatöskunni?',
      },
    ],
    heard: 'verkefnablað',
    score: 0,
  },
  {
    text: 'listir',
    file: '2fce83ea2cc06128.mp3',
    v: 'ef872e0a9365',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvaða fag er þetta?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða fag er þetta?',
      },
    ],
    heard: 'listir',
    score: 0,
  },
  {
    text: 'danska',
    file: '4579b81fa84c7700.mp3',
    v: '952a2c0b4dfc',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvaða fag er þetta?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða fag er þetta?',
      },
    ],
    heard: 'danska',
    score: 0,
  },
  {
    text: 'félagsfræði',
    file: 'c60db1cc8401a13a.mp3',
    v: 'f0657afc2bdb',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða fag er þetta?',
      },
    ],
    heard: 'félagsfræði',
    score: 0,
  },
  {
    text: 'efnafræði',
    file: '73f95e222aae710e.mp3',
    v: 'a8d85d0f75ad',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða fag er þetta?',
      },
    ],
    heard: 'sefnafræði',
    score: 0,
  },
  {
    text: 'rökstyddu',
    file: '7b3a27ce1d847c08.mp3',
    v: '5b7aa9a9151a',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað á ég að gera?',
      },
    ],
    heard: 'rökstíddu',
    score: 0.111,
  },
  {
    text: 'dragðu saman',
    file: 'd2d21cb4da5fb5d5.mp3',
    v: 'c27634431000',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað á ég að gera?',
      },
    ],
    heard: 'þau dragðu saman',
    score: 0,
  },
  {
    text: 'greindu',
    file: '8d6652ed657b341e.mp3',
    v: '99c2aa1192f3',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað á ég að gera?',
      },
    ],
    heard: 'þer greindu',
    score: 0,
  },
  {
    text: 'hluti',
    file: 'af784fa16e3a454f.mp3',
    v: '3e9b8812e789',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða námsorð notum við?',
      },
    ],
    heard: 'hluti',
    score: 0,
  },
  {
    text: 'áhrif',
    file: '698b5537756c0797.mp3',
    v: 'f022305800fc',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða námsorð notum við?',
      },
    ],
    heard: 'áhrif',
    score: 0,
  },
  {
    text: 'breyting',
    file: 'd0c60eb4ed7a99fb.mp3',
    v: '907f0a9333aa',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða námsorð notum við?',
      },
    ],
    heard: 'breyting',
    score: 0,
  },
  {
    text: 'mikilvægur',
    file: '22c92e2966109438.mp3',
    v: '228c57359cda',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða námsorð notum við?',
      },
    ],
    heard: 'mikilvægur',
    score: 0,
  },
  {
    text: 'einstaklingur',
    file: 'fcffc6be2e87a72c.mp3',
    v: '31374aad821a',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða námsorð notum við?',
      },
    ],
    heard: 'einstaklingur',
    score: 0,
  },
  {
    text: 'starf',
    file: '88b971bd1bdc3571.mp3',
    v: 'a1219c074bf0',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða námsorð notum við?',
      },
    ],
    heard: 'ég starf',
    score: 0,
  },
  {
    text: 'auka',
    file: 'b140b2416ae36d44.mp3',
    v: 'bd328e4a480f',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða námsorð notum við?',
      },
    ],
    heard: 'hauka',
    score: 0,
  },
  {
    text: 'meðferð',
    file: 'c7ac26f026526c3f.mp3',
    v: '8a0acc10aaf8',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða námsorð notum við?',
      },
    ],
    heard: 'meðferð',
    score: 0,
  },
  {
    text: 'heimild',
    file: '73ae2568d784ccb6.mp3',
    v: '1342361f5fd4',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða námsorð notum við?',
      },
    ],
    heard: 'heimild',
    score: 0,
  },
  {
    text: 'greina',
    file: '2bfbaf1660b7f1ed.mp3',
    v: '449176c9214d',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða námsorð notum við?',
      },
    ],
    heard: 'til greina',
    score: 0,
  },
  {
    text: 'tengja',
    file: 'a5364b65194238bf.mp3',
    v: '536d9af0335a',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða námsorð notum við?',
      },
    ],
    heard: 'tengja',
    score: 0,
  },
  {
    text: 'hugmynd',
    file: '5341f979870a093d.mp3',
    v: '37ebbfd1a381',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvaða námsorð notum við?',
      },
    ],
    heard: 'hugmynd',
    score: 0,
  },
  {
    text: 'lesum',
    file: '5701968d1fd98284.mp3',
    v: 'f8efa2e24108',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvað gerum við í tímanum?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað gerum við í tímanum?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað gerum við í tímanum?',
      },
    ],
    heard: 'lesum',
    score: 0,
  },
  {
    text: 'skrifum',
    file: 'e8a04790250b1a0b.mp3',
    v: '72a5732eebe6',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvað gerum við í tímanum?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað gerum við í tímanum?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað gerum við í tímanum?',
      },
    ],
    heard: 'við skrifum',
    score: 0,
  },
  {
    text: 'hlustum',
    file: 'd27e879f6a5e2c81.mp3',
    v: '18aa99e4c081',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvað gerum við í tímanum?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað gerum við í tímanum?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað gerum við í tímanum?',
      },
    ],
    heard: 'hlustum',
    score: 0,
  },
  {
    text: 'tölum',
    file: 'a46e949cb5cfeab2.mp3',
    v: 'fc8e6478a5dd',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvað gerum við í tímanum?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað gerum við í tímanum?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað gerum við í tímanum?',
      },
    ],
    heard: 'tölum',
    score: 0,
  },
  {
    text: 'reiknum',
    file: '12292d33d468607e.mp3',
    v: '4ab13199c932',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvað gerum við í tímanum?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað gerum við í tímanum?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað gerum við í tímanum?',
      },
    ],
    heard: 'reiknum',
    score: 0,
  },
  {
    text: 'svörum',
    file: 'd779bf34a1674307.mp3',
    v: '745b0457a590',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað gerum við í tímanum?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað gerum við í tímanum?',
      },
    ],
    heard: 'svörum',
    score: 0,
  },
  {
    text: 'spyrjum',
    file: '1a6cc2cc96de47f0.mp3',
    v: 'c04521ee9fd3',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað gerum við í tímanum?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað gerum við í tímanum?',
      },
    ],
    heard: 'spyrjum',
    score: 0,
  },
  {
    text: 'vinnum saman',
    file: 'ee45f1822ce4cf29.mp3',
    v: 'c008d693b231',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvað gerum við í tímanum?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað gerum við í tímanum?',
      },
    ],
    heard: 'við vinnum saman',
    score: 0,
  },
  {
    text: 'ræðum',
    file: '03e11a619ba0b20e.mp3',
    v: 'b15424f864a4',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað gerum við í tímanum?',
      },
    ],
    heard: 'ræðum',
    score: 0,
  },
  {
    text: 'kynnum',
    file: '0782b1f5650824a9.mp3',
    v: 'd6de3f414a32',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvað gerum við í tímanum?',
      },
    ],
    heard: 'kinnum',
    score: 0.167,
  },
  {
    text: 'vinur',
    file: '8ce639fdb829defb.mp3',
    v: 'c3675124237e',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hver hjálpar?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hver hjálpar?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hver hjálpar?',
      },
    ],
    heard: 'vinur',
    score: 0,
  },
  {
    text: 'umsjónarkennari',
    file: '1277f3027194613a.mp3',
    v: 'ea0b85091f77',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hver hjálpar?',
      },
    ],
    heard: 'um sjónarkennari',
    score: 0.067,
  },
  {
    text: 'túlkur',
    file: '1ed4ce5994abe49e.mp3',
    v: '9571f126634e',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hver hjálpar?',
      },
    ],
    heard: 'túlkur',
    score: 0,
  },
  {
    text: 'í skólastofunni',
    file: '349612218ed5a070.mp3',
    v: '4953265e13c1',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvar í skólanum?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvar í skólanum?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvar í skólanum?',
      },
    ],
    heard: 'í skólastofunni',
    score: 0,
  },
  {
    text: 'á bókasafninu',
    file: '2af2ce897ca7ee93.mp3',
    v: 'c5546b82f7b6',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvar í skólanum?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvar í skólanum?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvar í skólanum?',
      },
    ],
    heard: 'sá bókasafninu',
    score: 0,
  },
  {
    text: 'í íþróttasalnum',
    file: 'e97fb98464baa62e.mp3',
    v: '250889035383',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvar í skólanum?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvar í skólanum?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvar í skólanum?',
      },
    ],
    heard: 'í íþróttasalnum',
    score: 0,
  },
  {
    text: 'í matsalnum',
    file: '92054d4a8adfb2ec.mp3',
    v: 'c74186a822af',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvar í skólanum?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvar í skólanum?',
      },
    ],
    heard: 'í matsalnum',
    score: 0,
  },
  {
    text: 'á ganginum',
    file: '8cdce37b7a35a152.mp3',
    v: '6371fadbe440',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvar í skólanum?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvar í skólanum?',
      },
    ],
    heard: 'á ganginum',
    score: 0,
  },
  {
    text: 'á skrifstofunni',
    file: '59efd4cfc5cc387b.mp3',
    v: 'f19eedc5d5a3',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvar í skólanum?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvar í skólanum?',
      },
    ],
    heard: 'á skrifstofunni',
    score: 0,
  },
  {
    text: 'hjá námsráðgjafa',
    file: '0a8eeb180d8174ae.mp3',
    v: '98e8b24398b5',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvar í skólanum?',
      },
    ],
    heard: 'hjá námsráðgjafa',
    score: 0,
  },
  {
    text: 'í frímínútum',
    file: '5643e1d70464868b.mp3',
    v: '844280e84ca3',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvenær?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvenær?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvenær?',
      },
    ],
    heard: 'í frímínútum',
    score: 0,
  },
  {
    text: 'eftir skóla',
    file: '87cfced016b2d810.mp3',
    v: 'a2ac89e6e68b',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A1',
        where: 'Hvenær?',
      },
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvenær?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvenær?',
      },
    ],
    heard: 'eftir skóla',
    score: 0,
  },
  {
    text: 'í hádeginu',
    file: '007496ded6c36588.mp3',
    v: 'f31e1dab16f1',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvenær?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvenær?',
      },
    ],
    heard: 'í hádeginu',
    score: 0,
  },
  {
    text: 'á mánudögum',
    file: '30b91b2a0d857a8d.mp3',
    v: '16ee84e13b94',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvenær?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvenær?',
      },
    ],
    heard: 'á mánudögum',
    score: 0,
  },
  {
    text: 'í prófinu',
    file: 'd5c3c93ffa4239da.mp3',
    v: '553db5d7c6ea',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A2',
        where: 'Hvenær?',
      },
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvenær?',
      },
    ],
    heard: 'í prófinu',
    score: 0,
  },
  {
    text: 'fyrir próf',
    file: '6872cc1e9f0d5f1f.mp3',
    v: 'f0829b1ee234',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvenær?',
      },
    ],
    heard: 'fyrir próf',
    score: 0,
  },
  {
    text: 'í lok annar',
    file: 'fca5a844e4f3f752.mp3',
    v: '21280f1a1ac7',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'Hvenær?',
      },
    ],
    heard: 'í lok hennar',
    score: 0.182,
  },
  {
    text: 'Ég er ___.',
    file: 'c5c84992c8d83eac.mp3',
    v: '7516ca2da47c',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A1',
        where: 'rammi',
      },
    ],
    say: 'Ég er ….',
    heard: 'ég er',
    score: 0,
  },
  {
    text: 'Við ___ í tímanum.',
    file: 'eb1ed98c2c301ebc.mp3',
    v: '29bd68f88af7',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A1',
        where: 'rammi',
      },
    ],
    say: 'Við … í tímanum.',
    heard: 'við í tímanum',
    score: 0,
  },
  {
    text: 'Kennarinn segir: ___!',
    file: 'cc9c879502d069a0.mp3',
    v: '02ad6fb7872b',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A1',
        where: 'rammi',
      },
    ],
    say: 'Kennarinn segir: …!',
    heard: 'kennarinn segir',
    score: 0,
  },
  {
    text: 'Í ___ lærum við að ___.',
    file: '20ce928a7393e6aa.mp3',
    v: '3343dab48c0b',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Í … lærum við að ….',
    heard: 'því lærum við að',
    score: 0,
  },
  {
    text: 'Ég þarf ___ til að ___.',
    file: '92d334618a6ea644.mp3',
    v: '67efb32a4f15',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Ég þarf … til að ….',
    heard: 'ég þarf til að',
    score: 0,
  },
  {
    text: 'Kennarinn biður okkur að ___.',
    file: '3e0a03d1b3f7266f.mp3',
    v: 'dfdecbc291be',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Kennarinn biður okkur að ….',
    heard: 'kennarinn biður okkur að',
    score: 0,
  },
  {
    text: 'Ég skil ekki ___. Getur þú hjálpað mér?',
    file: '6ae11221a80e6af0.mp3',
    v: 'dc8ce1c32d9f',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A2',
        where: 'rammi',
      },
    ],
    say: 'Ég skil ekki …. Getur þú hjálpað mér?',
    heard: 'enég skil ekki getur þú hjálpað mér',
    score: 0,
  },
  {
    text: 'Í dag lærðum við um ___.',
    file: '6cc6c41a24b20fbb.mp3',
    v: '04a68d46c8cc',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Í dag lærðum við um ….',
    heard: 'í dag lærðum við um',
    score: 0,
  },
  {
    text: '___ skiptir máli vegna þess að ___.',
    file: 'f48ac25cd9907151.mp3',
    v: '9f4aa2aee0b5',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: '… skiptir máli vegna þess að ….',
    heard: 'að skiptir máli vegna þess að',
    score: 0,
  },
  {
    text: 'Ég er sammála/ósammála af því að ___.',
    file: '12f320b091d4888a.mp3',
    v: '9d25ad51dd07',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Ég er sammála eða ósammála af því að ….',
    heard: 'ég er sammála eða ósammála af því að',
    score: 0,
  },
  {
    text: 'Hvað finnst þér um ___?',
    file: '0f4c53815ca42310.mp3',
    v: '8bd1f82d66a5',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'rammi',
      },
    ],
    say: 'Hvað finnst þér um …?',
    heard: 'hvað finnst þér um',
    score: 0,
  },
  {
    text: 'Þetta er bók. Ég er í skólastofunni. Við lesum í tímanum.',
    file: '16bd51157bb56809.mp3',
    v: '1dc0fb4a99c9',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A1',
        where: 'dæmi',
      },
    ],
    heard: 'þetta er bók ég er í skólastofunni við lesum í tímanum',
    score: 0,
  },
  {
    text: 'Í stærðfræði lærum við að reikna. Ég þarf reiknivél til að reikna. Kennarinn biður okkur að svara.',
    file: 'f09399a86c0162d5.mp3',
    v: '28d6cb94f895',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'A2',
        where: 'dæmi',
      },
    ],
    heard:
      'því stærðfræði lærum við að reikna ég þarf reiknivél til að reikna kennarinn biður okkur að svara',
    score: 0,
  },
  {
    text: 'Í dag lærðum við um breytingar á loftslagi. Þær skipta máli vegna þess að þær hafa áhrif á alla. Hvað finnst þér um það?',
    file: '74f185e2260b737b.mp3',
    v: 'daab0dbe68fa',
    approved: false,
    places: [
      {
        category: 'skolinn',
        level: 'B1',
        where: 'dæmi',
      },
    ],
    heard:
      'í dag lærðum við um breytingar á loftslagi þær skipta máli vegna þess að þær hafa áhrif á alla hvað finnst þér um það',
    score: 0,
  },
];
