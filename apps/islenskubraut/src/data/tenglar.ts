// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     content/islenskubraut/
// Regenerate: pnpm islenskubraut:build
//
// Edit the YAML, not this file. A test fails if this file drifts from it.

import type { Level } from './types';

export interface Tengill {
  id: string;
  name: string;
  description: string;
  audience: 'nemendur' | 'kennarar';
  levels: Level[];
  /** The link's address on each category's card; a category missing here gets no link. */
  urls: Record<string, string>;
  /** A person has opened the link and agreed with its wording. */
  approved: boolean;
}

export const tenglar: Tengill[] = [
  {
    id: 'bildetema',
    name: 'Bildetema – myndaorðabók',
    description: 'Orð flokksins með myndum og hljóði, á íslensku og mörgum öðrum tungumálum.',
    audience: 'nemendur',
    levels: ['A1', 'A2'],
    urls: {
      dyr: 'https://nybildetema.oslomet.no/is/#/isl/dyr',
      matur: 'https://nybildetema.oslomet.no/is/#/isl/matur-og-drykkur',
      farartaeki: 'https://nybildetema.oslomet.no/is/#/isl/farartaeki',
      manneskja: 'https://nybildetema.oslomet.no/is/#/isl/manneskjur-og-likami',
      stadir: 'https://nybildetema.oslomet.no/is/#/isl/hus-og-heimili',
      klaednadur: 'https://nybildetema.oslomet.no/is/#/isl/fatnaður',
      skolinn: 'https://nybildetema.oslomet.no/is/#/isl/skoli',
    },
    approved: false,
  },
  {
    id: 'leikur-ad-ordum',
    name: 'Leikur að íslenskum orðum',
    description: 'Algeng orð með mynd, ritun og framburði, á vef og í appi.',
    audience: 'nemendur',
    levels: ['A1'],
    urls: {
      dyr: 'https://vefir.mms.is/lao_is/',
      matur: 'https://vefir.mms.is/lao_is/',
      farartaeki: 'https://vefir.mms.is/lao_is/',
      manneskja: 'https://vefir.mms.is/lao_is/',
      stadir: 'https://vefir.mms.is/lao_is/',
      klaednadur: 'https://vefir.mms.is/lao_is/',
      skolinn: 'https://vefir.mms.is/lao_is/',
    },
    approved: false,
  },
  {
    id: 'polsk-ordabok',
    name: 'Íslensk-pólsk orðabók',
    description: 'Orðabók Árnastofnunar með framburði og tengingu við beygingar í BÍN.',
    audience: 'nemendur',
    levels: ['A1', 'A2', 'B1'],
    urls: {
      dyr: 'https://polska.arnastofnun.is/',
      matur: 'https://polska.arnastofnun.is/',
      farartaeki: 'https://polska.arnastofnun.is/',
      manneskja: 'https://polska.arnastofnun.is/',
      stadir: 'https://polska.arnastofnun.is/',
      klaednadur: 'https://polska.arnastofnun.is/',
      skolinn: 'https://polska.arnastofnun.is/',
    },
    approved: false,
  },
  {
    id: 'icelandic-online',
    name: 'Icelandic Online',
    description: 'Ókeypis sjálfsnám í íslensku á netinu, frá byrjendastigi og upp úr.',
    audience: 'nemendur',
    levels: ['A1', 'A2', 'B1'],
    urls: {
      dyr: 'https://icelandiconline.com/',
      matur: 'https://icelandiconline.com/',
      farartaeki: 'https://icelandiconline.com/',
      manneskja: 'https://icelandiconline.com/',
      stadir: 'https://icelandiconline.com/',
      klaednadur: 'https://icelandiconline.com/',
      skolinn: 'https://icelandiconline.com/',
    },
    approved: false,
  },
  {
    id: 'iceflash',
    name: 'IceFlash 4K',
    description:
      'Fjögur þúsund algengustu orðin á minnisspjöldum í Anki, með ensku, pólsku, kínversku eða úkraínsku. Leiðbeiningarnar eru á ensku.',
    audience: 'nemendur',
    levels: ['A2', 'B1'],
    urls: {
      dyr: 'https://www.hi.is/sites/default/files/ovr/iceflash_4k_instructions_en.pdf',
      matur: 'https://www.hi.is/sites/default/files/ovr/iceflash_4k_instructions_en.pdf',
      farartaeki: 'https://www.hi.is/sites/default/files/ovr/iceflash_4k_instructions_en.pdf',
      manneskja: 'https://www.hi.is/sites/default/files/ovr/iceflash_4k_instructions_en.pdf',
      stadir: 'https://www.hi.is/sites/default/files/ovr/iceflash_4k_instructions_en.pdf',
      klaednadur: 'https://www.hi.is/sites/default/files/ovr/iceflash_4k_instructions_en.pdf',
      skolinn: 'https://www.hi.is/sites/default/files/ovr/iceflash_4k_instructions_en.pdf',
    },
    approved: false,
  },
  {
    id: 'malid',
    name: 'Málið.is',
    description: 'Orðabækur, beygingar og stafsetning á einum stað, frá Árnastofnun.',
    audience: 'nemendur',
    levels: ['A2', 'B1'],
    urls: {
      dyr: 'https://malid.is/',
      matur: 'https://malid.is/',
      farartaeki: 'https://malid.is/',
      manneskja: 'https://malid.is/',
      stadir: 'https://malid.is/',
      klaednadur: 'https://malid.is/',
      skolinn: 'https://malid.is/',
    },
    approved: false,
  },
  {
    id: 'islex',
    name: 'ISLEX-orðabókin',
    description: 'Veforðabók frá íslensku yfir á Norðurlandamálin.',
    audience: 'nemendur',
    levels: ['B1'],
    urls: {
      dyr: 'https://islex.arnastofnun.is/',
      matur: 'https://islex.arnastofnun.is/',
      farartaeki: 'https://islex.arnastofnun.is/',
      manneskja: 'https://islex.arnastofnun.is/',
      stadir: 'https://islex.arnastofnun.is/',
      klaednadur: 'https://islex.arnastofnun.is/',
      skolinn: 'https://islex.arnastofnun.is/',
    },
    approved: false,
  },
  {
    id: 'ordasjodur',
    name: 'Orðasjóður',
    description: 'Myndaspjöld og verkefnablöð með grunnorðaforða í 28 þemum, frá MMS.',
    audience: 'kennarar',
    levels: ['A1'],
    urls: {
      dyr: 'https://mms.is/namsefni/adventure-island-english-wordsordasjodur',
      matur: 'https://mms.is/namsefni/adventure-island-english-wordsordasjodur',
      farartaeki: 'https://mms.is/namsefni/adventure-island-english-wordsordasjodur',
      manneskja: 'https://mms.is/namsefni/adventure-island-english-wordsordasjodur',
      stadir: 'https://mms.is/namsefni/adventure-island-english-wordsordasjodur',
      klaednadur: 'https://mms.is/namsefni/adventure-island-english-wordsordasjodur',
      skolinn: 'https://mms.is/namsefni/adventure-island-english-wordsordasjodur',
    },
    approved: false,
  },
  {
    id: 'hvitar-lygar',
    name: 'Hvítar lygar',
    description:
      'Kennsluleiðbeiningar og verkefni frá MMS með sjónvarpsþáttum RÚV um fimm menntaskólanema, fyrir stig A2 og B1.',
    audience: 'kennarar',
    levels: ['A2', 'B1'],
    urls: {
      dyr: 'https://vefir.mms.is/flettibaekur/namsefni/hvitar_lygar_klb/',
      matur: 'https://vefir.mms.is/flettibaekur/namsefni/hvitar_lygar_klb/',
      farartaeki: 'https://vefir.mms.is/flettibaekur/namsefni/hvitar_lygar_klb/',
      manneskja: 'https://vefir.mms.is/flettibaekur/namsefni/hvitar_lygar_klb/',
      stadir: 'https://vefir.mms.is/flettibaekur/namsefni/hvitar_lygar_klb/',
      klaednadur: 'https://vefir.mms.is/flettibaekur/namsefni/hvitar_lygar_klb/',
      skolinn: 'https://vefir.mms.is/flettibaekur/namsefni/hvitar_lygar_klb/',
    },
    approved: false,
  },
  {
    id: 'memm-namsefni',
    name: 'Námsefni á vef MEMM',
    description:
      'Yfirlit MMS yfir námsefni í íslensku sem öðru tungumáli í framhaldsskóla, raðað eftir stigum Evrópska tungumálarammans.',
    audience: 'kennarar',
    levels: ['A1', 'A2', 'B1'],
    urls: {
      dyr: 'https://memm.mms.is/menntun/namsefni/',
      matur: 'https://memm.mms.is/menntun/namsefni/',
      farartaeki: 'https://memm.mms.is/menntun/namsefni/',
      manneskja: 'https://memm.mms.is/menntun/namsefni/',
      stadir: 'https://memm.mms.is/menntun/namsefni/',
      klaednadur: 'https://memm.mms.is/menntun/namsefni/',
      skolinn: 'https://memm.mms.is/menntun/namsefni/',
    },
    approved: false,
  },
];
