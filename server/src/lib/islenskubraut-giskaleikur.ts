// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     content/islenskubraut/
// Regenerate: pnpm islenskubraut:build
//
// Edit the YAML, not this file. A test fails if this file drifts from it.

import type { Level } from '../types/islenskubraut.js';

export interface GiskaAnswer {
  question: string;
  chips: string[];
}

export interface GiskaItem {
  name: string;
  answers: GiskaAnswer[];
}

export interface Giskaleikur {
  /** A teacher has checked the descriptions; until then the card page does not link the PDF. */
  confirmed: boolean;
  levels: Record<Level, GiskaItem[]>;
}

export const giskaleikur: Record<string, Giskaleikur> = {
  dyr: {
    confirmed: false,
    levels: {
      A1: [
        {
          name: 'hundur',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['gæludýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['feldur', 'hali'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Hvað gerir það?',
              chips: ['hleypur'],
            },
            {
              question: 'Hver hugsar um það?',
              chips: ['börn', 'fullorðnir'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['heima'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á morgnana', 'á kvöldin'],
            },
          ],
        },
        {
          name: 'köttur',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['gæludýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['feldur', 'hali'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Hver hugsar um það?',
              chips: ['börn', 'fullorðnir'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['heima'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á kvöldin'],
            },
          ],
        },
        {
          name: 'hestur',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['húsdýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['feldur', 'hali'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Hvað gerir það?',
              chips: ['hleypur'],
            },
            {
              question: 'Hver hugsar um það?',
              chips: ['fullorðnir'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['á bæ', 'úti'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á daginn'],
            },
          ],
        },
        {
          name: 'kind',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['húsdýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['feldur'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['á bæ', 'úti'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á sumrin'],
            },
          ],
        },
        {
          name: 'hæna',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['húsdýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['fjaðrir'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['á bæ'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á morgnana'],
            },
          ],
        },
        {
          name: 'þorskur',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['villt dýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['hreistur', 'hali'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['ekkert'],
            },
            {
              question: 'Hvað gerir það?',
              chips: ['syndir'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á veturna', 'á sumrin'],
            },
          ],
        },
        {
          name: 'lundi',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['villt dýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['fjaðrir'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Hvað gerir það?',
              chips: ['flýgur', 'syndir'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['úti'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á sumrin'],
            },
          ],
        },
        {
          name: 'refur',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['villt dýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['feldur', 'hali'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Hvað gerir það?',
              chips: ['hleypur'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['úti'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á kvöldin'],
            },
          ],
        },
      ],
      A2: [
        {
          name: 'hundur',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['gæludýr', 'spendýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['feldur', 'hali', 'fjórir fætur'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt', 'gelur'],
            },
            {
              question: 'Hvað gerir það?',
              chips: ['hleypur'],
            },
            {
              question: 'Hver hugsar um það?',
              chips: ['börn', 'fullorðnir'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['heima'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á morgnana', 'á kvöldin'],
            },
          ],
        },
        {
          name: 'köttur',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['gæludýr', 'spendýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['feldur', 'hali', 'fjórir fætur'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt', 'mjálmar'],
            },
            {
              question: 'Hver hugsar um það?',
              chips: ['börn', 'fullorðnir'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['heima'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á kvöldin'],
            },
          ],
        },
        {
          name: 'hestur',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['húsdýr', 'spendýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['feldur', 'hali', 'fjórir fætur'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['slétt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Hvað gerir það?',
              chips: ['hleypur'],
            },
            {
              question: 'Hver hugsar um það?',
              chips: ['fullorðnir', 'bændur'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['á bæ', 'úti'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á daginn'],
            },
          ],
        },
        {
          name: 'kind',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['húsdýr', 'spendýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['feldur', 'fjórir fætur'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Hver hugsar um það?',
              chips: ['bændur'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['á bæ', 'úti'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á sumrin'],
            },
          ],
        },
        {
          name: 'hæna',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['húsdýr', 'fugl'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['fjaðrir', 'goggur', 'tveir fætur'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Hver hugsar um það?',
              chips: ['bændur'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['á bæ'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á morgnana'],
            },
          ],
        },
        {
          name: 'þorskur',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['villt dýr', 'fiskur'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['hreistur', 'hali'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['slétt', 'blautt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['ekkert'],
            },
            {
              question: 'Hvað gerir það?',
              chips: ['syndir'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['í sjónum'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á veturna', 'á sumrin'],
            },
          ],
        },
        {
          name: 'lundi',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['villt dýr', 'fugl'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['fjaðrir', 'goggur', 'tveir fætur'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Hvað gerir það?',
              chips: ['flýgur', 'syndir'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['úti', 'í náttúrunni'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á sumrin'],
            },
          ],
        },
        {
          name: 'refur',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['villt dýr', 'spendýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['feldur', 'hali', 'fjórir fætur'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Hvað gerir það?',
              chips: ['hleypur'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['úti', 'í náttúrunni'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á kvöldin'],
            },
          ],
        },
      ],
      B1: [
        {
          name: 'hundur',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['gæludýr', 'spendýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['feldur', 'hali', 'fjórir fætur'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt', 'loðið'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt', 'gelur'],
            },
            {
              question: 'Hvað gerir það?',
              chips: ['hleypur'],
            },
            {
              question: 'Hver hugsar um það?',
              chips: ['börn', 'fullorðnir'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['heima'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á morgnana', 'á kvöldin', 'daglega'],
            },
          ],
        },
        {
          name: 'köttur',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['gæludýr', 'spendýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['feldur', 'hali', 'fjórir fætur'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt', 'loðið'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt', 'mjálmar', 'hvæsir'],
            },
            {
              question: 'Hver hugsar um það?',
              chips: ['börn', 'fullorðnir'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['heima'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á kvöldin'],
            },
          ],
        },
        {
          name: 'hestur',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['húsdýr', 'spendýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['feldur', 'hali', 'fjórir fætur'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['slétt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Hvað gerir það?',
              chips: ['hleypur'],
            },
            {
              question: 'Hver hugsar um það?',
              chips: ['fullorðnir', 'bændur'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['á bæ', 'úti'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á daginn'],
            },
          ],
        },
        {
          name: 'kind',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['húsdýr', 'spendýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['feldur', 'fjórir fætur'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt', 'loðið'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Hver hugsar um það?',
              chips: ['bændur'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['á bæ', 'úti'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á sumrin'],
            },
          ],
        },
        {
          name: 'hæna',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['húsdýr', 'fugl'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['fjaðrir', 'goggur', 'tveir fætur'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Hver hugsar um það?',
              chips: ['bændur'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['á bæ'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á morgnana'],
            },
          ],
        },
        {
          name: 'þorskur',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['villt dýr', 'fiskur'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['hreistur', 'hali'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['slétt', 'blautt', 'hált'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['ekkert'],
            },
            {
              question: 'Hvað gerir það?',
              chips: ['syndir'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['í sjónum'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á veturna', 'á sumrin'],
            },
          ],
        },
        {
          name: 'lundi',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['villt dýr', 'fugl'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['fjaðrir', 'goggur', 'tveir fætur'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Hvað gerir það?',
              chips: ['flýgur', 'syndir'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['úti', 'í náttúrunni'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á sumrin'],
            },
          ],
        },
        {
          name: 'refur',
          answers: [
            {
              question: 'Hvers konar dýr er þetta?',
              chips: ['villt dýr', 'spendýr'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['feldur', 'hali', 'fjórir fætur'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt', 'loðið'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Hvað gerir það?',
              chips: ['hleypur'],
            },
            {
              question: 'Hvar er hægt að finna það?',
              chips: ['úti', 'í náttúrunni', 'á hálendinu'],
            },
            {
              question: 'Hvenær sést það?',
              chips: ['á kvöldin', 'sjaldan'],
            },
          ],
        },
      ],
    },
  },
  matur: {
    confirmed: false,
    levels: {
      A1: [
        {
          name: 'epli',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['ávöxtur'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['rautt', 'grænt'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['sætt', 'súrt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['hart'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['góð'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['kringlótt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í búð', 'heima'],
            },
          ],
        },
        {
          name: 'banani',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['ávöxtur'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['gult'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['sætt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['góð'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir', 'börn'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í búð', 'heima'],
            },
            {
              question: 'Hvenær er það borðað eða drukkið?',
              chips: ['í morgunmat'],
            },
          ],
        },
        {
          name: 'sítróna',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['ávöxtur'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['gult'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['súrt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['hart'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í búð'],
            },
          ],
        },
        {
          name: 'gulrót',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['grænmeti'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['appelsínugult'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['sætt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['hart'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['engin'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í búð'],
            },
          ],
        },
        {
          name: 'tómatur',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['grænmeti'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['rautt'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['súrt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['kringlótt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í búð'],
            },
          ],
        },
        {
          name: 'mjólk',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['drykkur'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['hvítt'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['engin'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að drekka'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir', 'börn'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['heima', 'í búð'],
            },
            {
              question: 'Hvenær er það borðað eða drukkið?',
              chips: ['í morgunmat'],
            },
          ],
        },
        {
          name: 'kaffi',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['drykkur'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['brúnt'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['beiskt'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['góð'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að drekka'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['fullorðnir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['heima', 'á veitingastað'],
            },
            {
              question: 'Hvenær er það borðað eða drukkið?',
              chips: ['í morgunmat'],
            },
          ],
        },
      ],
      A2: [
        {
          name: 'epli',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['ávöxtur'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['rautt', 'grænt'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['sætt', 'súrt', 'ferskt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['hart', 'slétt'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['góð', 'fersk'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['kringlótt', 'kúlulaga'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða', 'til að baka með'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í búð', 'heima'],
            },
          ],
        },
        {
          name: 'banani',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['ávöxtur'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['gult'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['sætt', 'milt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['góð'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt', 'bogið'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir', 'börn'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í búð', 'heima'],
            },
            {
              question: 'Hvenær er það borðað eða drukkið?',
              chips: ['í morgunmat'],
            },
          ],
        },
        {
          name: 'sítróna',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['ávöxtur'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['gult'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['súrt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['hart', 'gróft'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['fersk'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að elda með', 'til að baka með'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['kokkar'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í búð'],
            },
          ],
        },
        {
          name: 'gulrót',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['grænmeti'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['appelsínugult'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['sætt', 'ferskt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['hart'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['engin'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt', 'oddhvasst'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða', 'til að elda með'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í búð'],
            },
          ],
        },
        {
          name: 'tómatur',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['grænmeti'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['rautt'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['súrt', 'ferskt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt', 'slétt'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['kringlótt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða', 'til að elda með'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í búð'],
            },
          ],
        },
        {
          name: 'mjólk',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['drykkur', 'mjólkurvara'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['hvítt'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['milt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['kalt', 'blautt'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['engin'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að drekka', 'til að baka með'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir', 'börn'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['heima', 'í búð', 'í skólanum'],
            },
            {
              question: 'Hvenær er það borðað eða drukkið?',
              chips: ['í morgunmat'],
            },
          ],
        },
        {
          name: 'kaffi',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['drykkur'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['brúnt'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['beiskt', 'sterkt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['heitt'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['góð', 'sterk'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að drekka'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['fullorðnir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['heima', 'á veitingastað'],
            },
            {
              question: 'Hvenær er það borðað eða drukkið?',
              chips: ['í morgunmat'],
            },
          ],
        },
        {
          name: 'ostur',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['mjólkurvara'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['gult'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['salt', 'milt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['sterk'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['ferkantað'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í búð'],
            },
            {
              question: 'Hvenær er það borðað eða drukkið?',
              chips: ['í morgunmat'],
            },
          ],
        },
      ],
      B1: [
        {
          name: 'epli',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['ávöxtur'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['rautt', 'grænt'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['sætt', 'súrt', 'ferskt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['hart', 'slétt'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['góð', 'fersk'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['kringlótt', 'kúlulaga'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða', 'til að baka með'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í búð', 'heima'],
            },
          ],
        },
        {
          name: 'banani',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['ávöxtur'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['gult'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['sætt', 'milt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['góð', 'sæt'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt', 'bogið'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir', 'börn'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í búð', 'heima'],
            },
            {
              question: 'Hvenær er það borðað eða drukkið?',
              chips: ['í morgunmat'],
            },
          ],
        },
        {
          name: 'sítróna',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['ávöxtur'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['gult'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['súrt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['hart', 'gróft'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['fersk'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['sporöskjulaga'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að elda með', 'til að baka með'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['kokkar'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í búð'],
            },
          ],
        },
        {
          name: 'gulrót',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['grænmeti'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['appelsínugult'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['sætt', 'ferskt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['hart'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['engin'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt', 'oddhvasst'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða', 'til að elda með'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í búð', 'í garðinum'],
            },
          ],
        },
        {
          name: 'tómatur',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['grænmeti'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['rautt'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['súrt', 'ferskt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt', 'slétt'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['kringlótt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða', 'til að elda með'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í búð', 'í garðinum'],
            },
          ],
        },
        {
          name: 'mjólk',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['drykkur', 'mjólkurvara'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['hvítt'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['milt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['kalt', 'blautt'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['engin'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að drekka', 'til að baka með'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir', 'börn'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['heima', 'í búð', 'í skólanum'],
            },
            {
              question: 'Hvenær er það borðað eða drukkið?',
              chips: ['í morgunmat', 'daglega'],
            },
          ],
        },
        {
          name: 'kaffi',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['drykkur'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['brúnt'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['beiskt', 'sterkt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['heitt'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['góð', 'sterk', 'ilmandi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að drekka', 'til að njóta'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['fullorðnir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['heima', 'á veitingastað'],
            },
            {
              question: 'Hvenær er það borðað eða drukkið?',
              chips: ['í morgunmat', 'daglega'],
            },
          ],
        },
        {
          name: 'ostur',
          answers: [
            {
              question: 'Hvers konar matur er þetta?',
              chips: ['mjólkurvara'],
            },
            {
              question: 'Hvernig lítur það út?',
              chips: ['gult'],
            },
            {
              question: 'Hvernig bragðast það?',
              chips: ['salt', 'milt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvernig lykt er af því?',
              chips: ['sterk'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['ferkantað'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í búð'],
            },
            {
              question: 'Hvenær er það borðað eða drukkið?',
              chips: ['í morgunmat'],
            },
          ],
        },
      ],
    },
  },
  farartaeki: {
    confirmed: false,
    levels: {
      A1: [
        {
          name: 'bíll',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['með hjólum'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi', 'úr plasti'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að ferðast'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['fullorðnir'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['á götunni'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['alltaf'],
            },
          ],
        },
        {
          name: 'rúta',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['stórt', 'með hjólum'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að ferðast'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['á götunni'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á morgnana', 'á virkum dögum'],
            },
          ],
        },
        {
          name: 'hjól',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['lítið', 'með hjólum'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['ekkert'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að ferðast', 'til að leika sér'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir', 'börn'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['á götunni'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á sumrin'],
            },
          ],
        },
        {
          name: 'flugvél',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['stórt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að ferðast', 'til að flytja'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['í loftinu'],
            },
          ],
        },
        {
          name: 'skip',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['stórt', 'án hjóla'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að flytja'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['á sjónum'],
            },
          ],
        },
      ],
      A2: [
        {
          name: 'bíll',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['með hjólum'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi', 'úr plasti'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að ferðast'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['fullorðnir', 'bílstjórar'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['á götunni', 'á þjóðveginum'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['alltaf'],
            },
          ],
        },
        {
          name: 'rúta',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['stórt', 'með hjólum', 'langt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að ferðast'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir', 'bílstjórar'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['á götunni'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á morgnana', 'á virkum dögum'],
            },
          ],
        },
        {
          name: 'hjól',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['lítið', 'með hjólum'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['ekkert'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að ferðast', 'til að leika sér'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir', 'börn'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['á götunni'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á sumrin'],
            },
          ],
        },
        {
          name: 'flugvél',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['stórt', 'langt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að ferðast', 'til að flytja'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir', 'flugmenn'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['í loftinu', 'á flugvellinum'],
            },
          ],
        },
        {
          name: 'skip',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['stórt', 'án hjóla'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að flytja', 'til að vinna'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['sjómenn'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['á sjónum'],
            },
          ],
        },
        {
          name: 'mótorhjól',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['lítið', 'með hjólum'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt', 'öskrar'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að ferðast'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['fullorðnir'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['á götunni', 'á þjóðveginum'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á sumrin', 'um helgar'],
            },
          ],
        },
        {
          name: 'lest',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['stórt', 'langt', 'með hjólum'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að ferðast', 'til að flytja'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á virkum dögum'],
            },
          ],
        },
        {
          name: 'sleði',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['lítið', 'án hjóla', 'lágt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['ekkert'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr tré', 'úr plasti'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að leika sér'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['börn'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á veturna'],
            },
          ],
        },
      ],
      B1: [
        {
          name: 'bíll',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['með hjólum'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi', 'úr plasti'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að ferðast'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['fullorðnir', 'bílstjórar'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['á götunni', 'á þjóðveginum'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['alltaf', 'daglega'],
            },
          ],
        },
        {
          name: 'rúta',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['stórt', 'með hjólum', 'langt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að ferðast'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir', 'bílstjórar'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['á götunni'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á morgnana', 'á virkum dögum'],
            },
          ],
        },
        {
          name: 'hjól',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['lítið', 'með hjólum'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['ekkert'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að ferðast', 'til að leika sér'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir', 'börn'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['á götunni'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á sumrin'],
            },
          ],
        },
        {
          name: 'flugvél',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['stórt', 'langt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að ferðast', 'til að flytja'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir', 'flugmenn'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['í loftinu', 'á flugvellinum'],
            },
          ],
        },
        {
          name: 'skip',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['stórt', 'án hjóla'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að flytja', 'til að vinna'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['sjómenn'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['á sjónum', 'í höfninni'],
            },
          ],
        },
        {
          name: 'mótorhjól',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['lítið', 'með hjólum'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt', 'öskrar'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að ferðast', 'til að keppa'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['fullorðnir'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['á götunni', 'á þjóðveginum'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á sumrin', 'um helgar'],
            },
          ],
        },
        {
          name: 'lest',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['stórt', 'langt', 'með hjólum'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að ferðast', 'til að flytja'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['á lestarbraut'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á virkum dögum'],
            },
          ],
        },
        {
          name: 'sleði',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['lítið', 'án hjóla', 'lágt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['ekkert'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr tré', 'úr plasti'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að leika sér'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['börn'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á veturna'],
            },
          ],
        },
        {
          name: 'þyrla',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['án hjóla'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt', 'suðar'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr málmi'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að bjarga', 'til að flytja'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['flugmenn'],
            },
            {
              question: 'Hvar er hægt að nota/finna þetta?',
              chips: ['í loftinu'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['í sérstökum tilvikum'],
            },
          ],
        },
      ],
    },
  },
  manneskja: {
    confirmed: false,
    levels: {
      A1: [
        {
          name: 'nemandi',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['barn'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['lærir', 'leikur sér'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['í skólanum'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á morgnana', 'á virkum dögum'],
            },
          ],
        },
        {
          name: 'kennari',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['í skólanum', 'í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á morgnana', 'á virkum dögum'],
            },
          ],
        },
        {
          name: 'læknir',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á daginn', 'á kvöldin', 'um helgar'],
            },
          ],
        },
        {
          name: 'kokkur',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á kvöldin', 'um helgar'],
            },
          ],
        },
        {
          name: 'íþróttamaður',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á daginn', 'um helgar'],
            },
          ],
        },
        {
          name: 'lögreglumaður',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['alltaf'],
            },
          ],
        },
      ],
      A2: [
        {
          name: 'nemandi',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['barn', 'unglingur'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['lærir', 'leikur sér'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['í skólanum'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á morgnana', 'á virkum dögum'],
            },
          ],
        },
        {
          name: 'kennari',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur', 'kennir'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['í skólanum', 'í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á morgnana', 'á virkum dögum'],
            },
          ],
        },
        {
          name: 'læknir',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur', 'læknar'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['í vinnunni', 'á sjúkrahúsi'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á daginn', 'á kvöldin', 'um helgar'],
            },
          ],
        },
        {
          name: 'kokkur',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur', 'eldar'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á kvöldin', 'um helgar'],
            },
          ],
        },
        {
          name: 'íþróttamaður',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn', 'fræg/frægur'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á daginn', 'um helgar'],
            },
          ],
        },
        {
          name: 'söngvari',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn', 'fræg/frægur'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['syngur'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á kvöldin', 'um helgar'],
            },
          ],
        },
        {
          name: 'leikari',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn', 'fræg/frægur'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á kvöldin'],
            },
          ],
        },
        {
          name: 'lögreglumaður',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['alltaf'],
            },
          ],
        },
      ],
      B1: [
        {
          name: 'nemandi',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['barn', 'unglingur'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['lærir', 'leikur sér'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['í skólanum'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á morgnana', 'á virkum dögum'],
            },
          ],
        },
        {
          name: 'kennari',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur', 'kennir'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['í skólanum', 'í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á morgnana', 'á virkum dögum'],
            },
          ],
        },
        {
          name: 'læknir',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur', 'læknar'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['í vinnunni', 'á sjúkrahúsi'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á daginn', 'á kvöldin', 'um helgar'],
            },
          ],
        },
        {
          name: 'kokkur',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur', 'eldar'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á kvöldin', 'um helgar'],
            },
          ],
        },
        {
          name: 'íþróttamaður',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn', 'fræg/frægur'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['í sjónvarpi'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á daginn', 'um helgar'],
            },
          ],
        },
        {
          name: 'söngvari',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn', 'fræg/frægur'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['syngur', 'skapar'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['á sviði', 'í sjónvarpi'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á kvöldin', 'um helgar'],
            },
          ],
        },
        {
          name: 'leikari',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn', 'fræg/frægur'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur', 'skapar'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['á sviði', 'í sjónvarpi'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['á kvöldin'],
            },
          ],
        },
        {
          name: 'lögreglumaður',
          answers: [
            {
              question: 'Hvers konar manneskja er þetta?',
              chips: ['fullorðin/fullorðinn'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvar er hún/hann?',
              chips: ['í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann þar?',
              chips: ['alltaf'],
            },
          ],
        },
      ],
    },
  },
  stadir: {
    confirmed: false,
    levels: {
      A1: [
        {
          name: 'hús',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['lítið', 'lágt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr tré', 'úr steini'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['býr', 'sefur'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum', 'úti á landi'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['alltaf'],
            },
          ],
        },
        {
          name: 'skóli',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['stórt'],
            },
            {
              question: 'Hvernig lykt er þar?',
              chips: ['engin'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr steini'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['lærir'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['börn'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['á morgnana', 'á virkum dögum'],
            },
          ],
        },
        {
          name: 'búð',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['lítið'],
            },
            {
              question: 'Hvernig lykt er þar?',
              chips: ['góð'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['verslar'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['á daginn'],
            },
          ],
        },
        {
          name: 'sundlaug',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['stórt', 'lágt'],
            },
            {
              question: 'Hvernig lykt er þar?',
              chips: ['vond'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['syndir'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['á morgnana', 'um helgar'],
            },
          ],
        },
      ],
      A2: [
        {
          name: 'hús',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['lítið', 'lágt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr tré', 'úr steini'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['býr', 'sefur', 'hvílir sig'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum', 'úti á landi'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['alltaf'],
            },
          ],
        },
        {
          name: 'skóli',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['stórt'],
            },
            {
              question: 'Hvernig lykt er þar?',
              chips: ['engin'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr steini'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['lærir'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['börn', 'nemendur', 'kennarar'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['á morgnana', 'á virkum dögum'],
            },
          ],
        },
        {
          name: 'búð',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['lítið'],
            },
            {
              question: 'Hvernig lykt er þar?',
              chips: ['góð'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['verslar'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['á daginn'],
            },
          ],
        },
        {
          name: 'sundlaug',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['stórt', 'lágt'],
            },
            {
              question: 'Hvernig lykt er þar?',
              chips: ['vond', 'sterk'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['syndir', 'hvílir sig'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['á morgnana', 'um helgar'],
            },
          ],
        },
        {
          name: 'sjúkrahús',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['stórt', 'hátt', 'nýtt'],
            },
            {
              question: 'Hvernig lykt er þar?',
              chips: ['sterk'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr steini', 'úr gleri'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['vinnur'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['læknar'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['alltaf'],
            },
          ],
        },
        {
          name: 'kirkja',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['hátt', 'gamalt', 'fallegt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr steini', 'úr tré'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum', 'úti á landi'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['um helgar'],
            },
          ],
        },
        {
          name: 'leikvöllur',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['lítið', 'lágt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr tré', 'úr plasti'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['leikur sér'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['börn'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum', 'í úthverfi'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['á daginn', 'um helgar'],
            },
          ],
        },
        {
          name: 'veitingastaður',
          answers: [
            {
              question: 'Hvernig lykt er þar?',
              chips: ['góð'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['borðar', 'vinnur'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['á kvöldin', 'um helgar'],
            },
          ],
        },
      ],
      B1: [
        {
          name: 'hús',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['lítið', 'lágt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr tré', 'úr steini'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['býr', 'sefur', 'hvílir sig'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum', 'úti á landi'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['alltaf'],
            },
          ],
        },
        {
          name: 'skóli',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['stórt'],
            },
            {
              question: 'Hvernig lykt er þar?',
              chips: ['engin'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr steini'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['lærir'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['börn', 'nemendur', 'kennarar'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['á morgnana', 'á virkum dögum'],
            },
          ],
        },
        {
          name: 'búð',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['lítið'],
            },
            {
              question: 'Hvernig lykt er þar?',
              chips: ['góð'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['verslar'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['á daginn', 'daglega'],
            },
          ],
        },
        {
          name: 'sundlaug',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['stórt', 'lágt'],
            },
            {
              question: 'Hvernig lykt er þar?',
              chips: ['vond', 'sterk', 'stingandi'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['syndir', 'hvílir sig', 'stundar íþróttir'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['á morgnana', 'um helgar'],
            },
          ],
        },
        {
          name: 'sjúkrahús',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['stórt', 'hátt', 'nýtt'],
            },
            {
              question: 'Hvernig lykt er þar?',
              chips: ['sterk'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr steini', 'úr gleri'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['vinnur'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['læknar'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['alltaf'],
            },
          ],
        },
        {
          name: 'kirkja',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['hátt', 'gamalt', 'fallegt', 'sögulegt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr steini', 'úr tré'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum', 'úti á landi'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['um helgar', 'á hátíðum'],
            },
          ],
        },
        {
          name: 'leikvöllur',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['lítið', 'lágt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr tré', 'úr plasti'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['leikur sér', 'skemmtir sér'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['börn'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum', 'í úthverfi'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['á daginn', 'um helgar'],
            },
          ],
        },
        {
          name: 'veitingastaður',
          answers: [
            {
              question: 'Hvernig lykt er þar?',
              chips: ['góð', 'ilmandi'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['borðar', 'vinnur', 'skemmtir sér'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum', 'í miðborginni'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['á kvöldin', 'um helgar'],
            },
          ],
        },
        {
          name: 'bókasafn',
          answers: [
            {
              question: 'Hvernig lítur þetta út?',
              chips: ['stórt', 'nútímalegt'],
            },
            {
              question: 'Hvernig lykt er þar?',
              chips: ['engin'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr steini', 'úr gleri'],
            },
            {
              question: 'Hvað gerir maður þar?',
              chips: ['lærir'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['nemendur'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í miðborginni'],
            },
            {
              question: 'Hvenær fer fólk þangað?',
              chips: ['á virkum dögum'],
            },
          ],
        },
      ],
    },
  },
  klaednadur: {
    confirmed: false,
    levels: {
      A1: [
        {
          name: 'bolur',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['hvítt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr bómull'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að líta vel út'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['inni'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á sumrin'],
            },
          ],
        },
        {
          name: 'buxur',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['blátt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr bómull'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['í skólanum'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['alltaf'],
            },
          ],
        },
        {
          name: 'jakki',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['svart'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr leðri'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að líta vel út', 'til að hlýja sér'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['fullorðnir'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['úti'],
            },
          ],
        },
        {
          name: 'skór',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['hvítt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['hart'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr leðri', 'úr plasti'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að verja sig'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['úti'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['alltaf'],
            },
          ],
        },
      ],
      A2: [
        {
          name: 'bolur',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['hvítt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr bómull'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að líta vel út'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['inni'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á sumrin'],
            },
          ],
        },
        {
          name: 'buxur',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['blátt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['gróft'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr bómull'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['í skólanum'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['alltaf'],
            },
          ],
        },
        {
          name: 'jakki',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['svart'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['slétt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr leðri'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að líta vel út', 'til að hlýja sér'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['fullorðnir'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['úti'],
            },
          ],
        },
        {
          name: 'skór',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['hvítt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['hart'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr leðri', 'úr plasti'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að verja sig', 'til að stunda íþróttir'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir', 'íþróttamenn'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['úti'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['alltaf'],
            },
          ],
        },
        {
          name: 'peysa',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['rautt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt', 'hlýtt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr ull'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að hlýja sér'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['inni', 'úti'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á veturna'],
            },
          ],
        },
        {
          name: 'úlpa',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['grænt', 'stórt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['hlýtt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að hlýja sér', 'til að verja sig'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['úti'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á veturna'],
            },
          ],
        },
        {
          name: 'húfa',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['gult', 'lítið'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt', 'hlýtt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr ull'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að hlýja sér'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['börn'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['úti'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á veturna'],
            },
          ],
        },
        {
          name: 'sokkar',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['svart', 'lítið'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr bómull'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['inni'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['alltaf'],
            },
          ],
        },
      ],
      B1: [
        {
          name: 'bolur',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['hvítt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr bómull'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að líta vel út'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['inni'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á sumrin'],
            },
          ],
        },
        {
          name: 'buxur',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['blátt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['gróft'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr bómull'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['í skólanum'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['alltaf'],
            },
          ],
        },
        {
          name: 'jakki',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['svart'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['slétt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr leðri'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að líta vel út', 'til að hlýja sér'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['fullorðnir'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['úti'],
            },
          ],
        },
        {
          name: 'skór',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['hvítt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['hart'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr leðri', 'úr plasti'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að verja sig', 'til að stunda íþróttir'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir', 'íþróttamenn'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['úti'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['alltaf'],
            },
          ],
        },
        {
          name: 'peysa',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['rautt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt', 'hlýtt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr ull'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að hlýja sér'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['inni', 'úti'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á veturna'],
            },
          ],
        },
        {
          name: 'úlpa',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['grænt', 'stórt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['hlýtt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr gerviefnum'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að hlýja sér', 'til að verja sig'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['úti'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á veturna'],
            },
          ],
        },
        {
          name: 'húfa',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['gult', 'lítið'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt', 'hlýtt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr ull'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að hlýja sér'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['börn'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['úti'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á veturna'],
            },
          ],
        },
        {
          name: 'sokkar',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['svart', 'lítið'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr bómull'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['inni'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['alltaf', 'daglega'],
            },
          ],
        },
        {
          name: 'hanskar',
          answers: [
            {
              question: 'Hvernig lítur það út?',
              chips: ['brúnt'],
            },
            {
              question: 'Hvernig er það viðkomu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr leðri'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að hlýja sér', 'til að vinna'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['iðnaðarmenn'],
            },
            {
              question: 'Hvar er hægt að nota þetta?',
              chips: ['úti'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á veturna'],
            },
          ],
        },
      ],
    },
  },
  skolinn: {
    confirmed: false,
    levels: {
      A1: [
        {
          name: 'íslenska',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['bók', 'penni'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['lesum', 'skrifum', 'tölum'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í skólastofunni', 'á bókasafninu'],
            },
          ],
        },
        {
          name: 'stærðfræði',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['blýantur', 'tölva'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['reiknum', 'skrifum'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í skólastofunni'],
            },
          ],
        },
        {
          name: 'enska',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['bók', 'tölva'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['lesum', 'hlustum', 'tölum'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í skólastofunni'],
            },
          ],
        },
        {
          name: 'íþróttir',
          answers: [
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['hlustum'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari', 'vinur'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í íþróttasalnum'],
            },
          ],
        },
      ],
      A2: [
        {
          name: 'íslenska',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['bók', 'penni', 'stílabók'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['lesum', 'skrifum', 'tölum'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í skólastofunni', 'á bókasafninu'],
            },
          ],
        },
        {
          name: 'stærðfræði',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['blýantur', 'tölva', 'reiknivél', 'reglustika'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['reiknum', 'skrifum'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í skólastofunni'],
            },
          ],
        },
        {
          name: 'enska',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['bók', 'tölva'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['lesum', 'hlustum', 'tölum'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í skólastofunni'],
            },
          ],
        },
        {
          name: 'íþróttir',
          answers: [
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['hlustum', 'vinnum saman'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari', 'vinur'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í íþróttasalnum'],
            },
          ],
        },
        {
          name: 'saga',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['bók'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['lesum', 'skrifum', 'spyrjum'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['á bókasafninu'],
            },
          ],
        },
        {
          name: 'náttúrufræði',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['tölva'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['lesum', 'spyrjum', 'vinnum saman'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í skólastofunni'],
            },
          ],
        },
        {
          name: 'listir',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['blýantur', 'penni'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['vinnum saman', 'tölum'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari', 'vinur'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í skólastofunni'],
            },
          ],
        },
        {
          name: 'danska',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['bók', 'stílabók'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['lesum', 'hlustum', 'svörum'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í skólastofunni'],
            },
          ],
        },
      ],
      B1: [
        {
          name: 'íslenska',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['bók', 'penni', 'stílabók'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['lesum', 'skrifum', 'tölum'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í skólastofunni', 'á bókasafninu'],
            },
          ],
        },
        {
          name: 'stærðfræði',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['blýantur', 'tölva', 'reiknivél', 'reglustika'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['reiknum', 'skrifum'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í skólastofunni'],
            },
          ],
        },
        {
          name: 'enska',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['bók', 'tölva'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['lesum', 'hlustum', 'tölum'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í skólastofunni'],
            },
          ],
        },
        {
          name: 'íþróttir',
          answers: [
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['hlustum', 'vinnum saman'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari', 'vinur'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í íþróttasalnum'],
            },
          ],
        },
        {
          name: 'saga',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['bók', 'kennslubók'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['lesum', 'skrifum', 'spyrjum'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['á bókasafninu'],
            },
          ],
        },
        {
          name: 'náttúrufræði',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['tölva', 'verkefnablað'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['lesum', 'spyrjum', 'vinnum saman'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í skólastofunni'],
            },
          ],
        },
        {
          name: 'listir',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['blýantur', 'penni'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['vinnum saman', 'tölum'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari', 'vinur'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í skólastofunni'],
            },
          ],
        },
        {
          name: 'danska',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['bók', 'stílabók'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['lesum', 'hlustum', 'svörum'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í skólastofunni'],
            },
          ],
        },
        {
          name: 'félagsfræði',
          answers: [
            {
              question: 'Hvað er í skólatöskunni?',
              chips: ['kennslubók', 'tölva'],
            },
            {
              question: 'Hvað gerum við í tímanum?',
              chips: ['ræðum', 'lesum', 'kynnum'],
            },
            {
              question: 'Hver hjálpar?',
              chips: ['kennari'],
            },
            {
              question: 'Hvar í skólanum?',
              chips: ['í skólastofunni'],
            },
          ],
        },
      ],
    },
  },
};
