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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að gæta', 'til að klappa'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['heima'],
            },
            {
              question: 'Hvenær sést þetta?',
              chips: ['alltaf'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að klappa'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['heima'],
            },
            {
              question: 'Hvenær sést þetta?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['slétt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að klappa'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['fullorðnir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['á bæ', 'úti'],
            },
            {
              question: 'Hvenær sést þetta?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['á bæ', 'úti'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['á bæ'],
            },
            {
              question: 'Hvenær sést þetta?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['slétt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['þögult'],
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
              question: 'Hvenær sést þetta?',
              chips: ['alltaf'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['úti'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['úti'],
            },
            {
              question: 'Hvenær sést þetta?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt', 'gelur'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að gæta', 'til að klappa', 'til að leika sér'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['heima'],
            },
            {
              question: 'Hvenær sést þetta?',
              chips: ['alltaf'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt', 'mjálmar'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að klappa'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['heima'],
            },
            {
              question: 'Hvenær sést þetta?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['slétt', 'þungt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að klappa', 'til að vinna'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['fullorðnir', 'bændur'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['á bæ', 'úti'],
            },
            {
              question: 'Hvenær sést þetta?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['bændur'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['á bæ', 'úti'],
            },
            {
              question: 'Hvenær sést þetta?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt', 'létt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['bændur'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['á bæ'],
            },
            {
              question: 'Hvenær sést þetta?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['slétt', 'blautt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['þögult'],
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
              chips: ['veiðimenn'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í sjónum'],
            },
            {
              question: 'Hvenær sést þetta?',
              chips: ['alltaf'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['úti', 'í náttúrunni'],
            },
            {
              question: 'Hvenær sést þetta?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['veiðimenn'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['úti', 'í náttúrunni'],
            },
            {
              question: 'Hvenær sést þetta?',
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
              chips: ['feldur', 'hali', 'fjórir fætur', 'hleypur'],
            },
            {
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt', 'loðið'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt', 'gelur'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að gæta', 'til að klappa', 'til að leika sér'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['heima'],
            },
            {
              question: 'Hvenær sést þetta?',
              chips: ['alltaf', 'daglega'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt', 'loðið'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt', 'mjálmar', 'hvæsir'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að klappa'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['allir'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['heima'],
            },
            {
              question: 'Hvenær sést þetta?',
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
              chips: ['feldur', 'hali', 'fjórir fætur', 'hleypur'],
            },
            {
              question: 'Hvernig finnst það við snertingu?',
              chips: ['slétt', 'þungt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að klappa', 'til að vinna'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['fullorðnir', 'bændur'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['á bæ', 'úti'],
            },
            {
              question: 'Hvenær sést þetta?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt', 'loðið'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['bændur'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['á bæ', 'úti'],
            },
            {
              question: 'Hvenær sést þetta?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt', 'létt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['hátt'],
            },
            {
              question: 'Til hvers er það notað?',
              chips: ['til að borða'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['bændur'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['á bæ'],
            },
            {
              question: 'Hvenær sést þetta?',
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
              chips: ['hreistur', 'hali', 'syndir'],
            },
            {
              question: 'Hvernig finnst það við snertingu?',
              chips: ['slétt', 'blautt', 'hált'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['þögult'],
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
              chips: ['veiðimenn'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['í sjónum'],
            },
            {
              question: 'Hvenær sést þetta?',
              chips: ['alltaf'],
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
              chips: ['fjaðrir', 'goggur', 'tveir fætur', 'flýgur', 'syndir'],
            },
            {
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['ferðamenn'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['úti', 'í náttúrunni'],
            },
            {
              question: 'Hvenær sést þetta?',
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
              chips: ['feldur', 'hali', 'fjórir fætur', 'hleypur'],
            },
            {
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt', 'loðið'],
            },
            {
              question: 'Hvaða hljóð gefur það frá sér?',
              chips: ['lágt'],
            },
            {
              question: 'Hver notar þetta?',
              chips: ['veiðimenn'],
            },
            {
              question: 'Hvar er hægt að finna þetta?',
              chips: ['úti', 'í náttúrunni', 'á hálendinu'],
            },
            {
              question: 'Hvenær sést þetta?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['hart', 'slétt'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['gott'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['gott'],
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
              question: 'Hvenær er þetta notað?',
              chips: ['á morgnana'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['hart', 'gróft'],
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
              question: 'Hvernig bragðast það?',
              chips: ['sætt'],
            },
            {
              question: 'Hvernig finnst það við snertingu?',
              chips: ['hart'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['ekkert'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt', 'slétt'],
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
              question: 'Hvernig lyktar af því?',
              chips: ['ekkert'],
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
              question: 'Hvenær er þetta notað?',
              chips: ['á morgnana'],
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
              question: 'Hvernig bragðast það?',
              chips: ['beiskt'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['gott'],
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
              question: 'Hvenær er þetta notað?',
              chips: ['á morgnana'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['hart', 'slétt'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['gott', 'ferskt'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['gott'],
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
              question: 'Hvenær er þetta notað?',
              chips: ['á morgnana'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['hart', 'gróft'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['ferskt'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['hart'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['ekkert'],
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
              question: 'Hvernig finnst það við snertingu?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['kalt', 'blautt'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['ekkert'],
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
              question: 'Hvenær er þetta notað?',
              chips: ['á morgnana'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['heitt'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['gott', 'sterkt'],
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
              question: 'Hvenær er þetta notað?',
              chips: ['á morgnana'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['sterkt'],
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
              question: 'Hvenær er þetta notað?',
              chips: ['á morgnana'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['hart', 'slétt'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['gott', 'ferskt'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['gott', 'sætt'],
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
              question: 'Hvenær er þetta notað?',
              chips: ['á morgnana'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['hart', 'gróft'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['ferskt'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['hart'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['ekkert'],
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
              question: 'Hvernig finnst það við snertingu?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['kalt', 'blautt'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['ekkert'],
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
              question: 'Hvenær er þetta notað?',
              chips: ['á morgnana', 'daglega'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['heitt'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['gott', 'sterkt', 'ilmandi'],
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
              question: 'Hvenær er þetta notað?',
              chips: ['á morgnana', 'daglega'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt'],
            },
            {
              question: 'Hvernig lyktar af því?',
              chips: ['sterkt'],
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
              question: 'Hvenær er þetta notað?',
              chips: ['á morgnana'],
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
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt'],
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
              chips: ['á morgnana'],
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
              chips: ['þögult'],
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
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt'],
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
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt'],
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
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt'],
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
              chips: ['þögult'],
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
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt'],
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
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt'],
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
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt'],
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
              chips: ['þögult'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr tré', 'úr plasti'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['flatt'],
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
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt'],
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
              chips: ['þögult'],
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
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt'],
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
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt'],
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
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt'],
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
              chips: ['þögult'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr tré', 'úr plasti'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['flatt'],
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['ung/ungur'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['lærir', 'leikur sér'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['í skólanum'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
              chips: ['á morgnana'],
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['há/hár'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['í skólanum', 'í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
              chips: ['á morgnana'],
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['gömul/gamall'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
              chips: ['alltaf'],
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['lág/lágur'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
              chips: ['á kvöldin'],
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['há/hár', 'ung/ungur'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur', 'leikur sér'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
              chips: ['á daginn'],
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['há/hár'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['ung/ungur', 'með stutt hár'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['lærir', 'leikur sér'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['í skólanum'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['há/hár', 'með gleraugu'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur', 'kennir'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['í skólanum', 'í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['gömul/gamall', 'með gleraugu'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur', 'læknar'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['í vinnunni', 'á sjúkrahúsi'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
              chips: ['alltaf'],
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['lág/lágur'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['há/hár', 'ung/ungur'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur', 'leikur sér'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['með sítt hár'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['syngur'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['með stutt hár'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['há/hár', 'með stutt hár'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['ung/ungur', 'með stutt hár'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['lærir', 'leikur sér'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['í skólanum'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['há/hár', 'með gleraugu'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur', 'kennir'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['í skólanum', 'í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['gömul/gamall', 'með gleraugu', 'sköllótt/sköllóttur'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur', 'læknar'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['í vinnunni', 'á sjúkrahúsi'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
              chips: ['alltaf'],
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['lág/lágur', 'með skegg'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur', 'skapar'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['há/hár', 'ung/ungur'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur', 'leikur sér'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['í sjónvarpi'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['með sítt hár'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['syngur', 'skapar'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['á sviði', 'í sjónvarpi'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['með stutt hár', 'án skeggs'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur', 'skapar'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['á sviði', 'í sjónvarpi'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
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
              question: 'Hvernig lítur hún/hann út?',
              chips: ['há/hár', 'með stutt hár'],
            },
            {
              question: 'Hvað gerir hún/hann?',
              chips: ['vinnur'],
            },
            {
              question: 'Hvar er hægt að finna þessa manneskju?',
              chips: ['í vinnunni'],
            },
            {
              question: 'Hvenær er hún/hann virk/virkur?',
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
              question: 'Til hvers er þetta notað?',
              chips: ['til að búa'],
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
              question: 'Hvenær er þetta notað?',
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
              question: 'Hvernig lyktar þar?',
              chips: ['ekkert'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr steini'],
            },
            {
              question: 'Til hvers er þetta notað?',
              chips: ['til að læra'],
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
              question: 'Hvenær er þetta notað?',
              chips: ['á morgnana'],
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
              question: 'Hvernig lyktar þar?',
              chips: ['gott'],
            },
            {
              question: 'Til hvers er þetta notað?',
              chips: ['til að versla'],
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
              question: 'Hvenær er þetta notað?',
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
              question: 'Hvernig lyktar þar?',
              chips: ['vont'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['ferkantað'],
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
              question: 'Hvenær er þetta notað?',
              chips: ['á morgnana'],
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
              question: 'Til hvers er þetta notað?',
              chips: ['til að búa', 'til að hvílast'],
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
              question: 'Hvenær er þetta notað?',
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
              question: 'Hvernig lyktar þar?',
              chips: ['ekkert'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr steini'],
            },
            {
              question: 'Til hvers er þetta notað?',
              chips: ['til að læra'],
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
              question: 'Hvenær er þetta notað?',
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
              question: 'Hvernig lyktar þar?',
              chips: ['gott'],
            },
            {
              question: 'Til hvers er þetta notað?',
              chips: ['til að versla'],
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
              question: 'Hvenær er þetta notað?',
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
              question: 'Hvernig lyktar þar?',
              chips: ['vont', 'sterkt'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['ferkantað'],
            },
            {
              question: 'Til hvers er þetta notað?',
              chips: ['til að hvílast'],
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
              question: 'Hvenær er þetta notað?',
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
              question: 'Hvernig lyktar þar?',
              chips: ['sterkt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr steini', 'úr gleri'],
            },
            {
              question: 'Til hvers er þetta notað?',
              chips: ['til að vinna'],
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
              question: 'Hvenær er þetta notað?',
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
              question: 'Hvaða lögun hefur það?',
              chips: ['oddhvasst'],
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
              question: 'Hvenær er þetta notað?',
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
              question: 'Hver notar þetta?',
              chips: ['börn'],
            },
            {
              question: 'Hvar er þetta?',
              chips: ['í bænum', 'í úthverfi'],
            },
            {
              question: 'Hvenær er þetta notað?',
              chips: ['á daginn', 'um helgar'],
            },
          ],
        },
        {
          name: 'veitingastaður',
          answers: [
            {
              question: 'Hvernig lyktar þar?',
              chips: ['gott'],
            },
            {
              question: 'Til hvers er þetta notað?',
              chips: ['til að vinna'],
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
              question: 'Hvenær er þetta notað?',
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
              question: 'Til hvers er þetta notað?',
              chips: ['til að búa', 'til að hvílast'],
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
              question: 'Hvenær er þetta notað?',
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
              question: 'Hvernig lyktar þar?',
              chips: ['ekkert'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr steini'],
            },
            {
              question: 'Til hvers er þetta notað?',
              chips: ['til að læra'],
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
              question: 'Hvenær er þetta notað?',
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
              question: 'Hvernig lyktar þar?',
              chips: ['gott'],
            },
            {
              question: 'Til hvers er þetta notað?',
              chips: ['til að versla'],
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
              question: 'Hvenær er þetta notað?',
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
              question: 'Hvernig lyktar þar?',
              chips: ['vont', 'sterkt', 'stingandi'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['ferkantað'],
            },
            {
              question: 'Til hvers er þetta notað?',
              chips: ['til að hvílast', 'til að stunda íþróttir'],
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
              question: 'Hvenær er þetta notað?',
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
              question: 'Hvernig lyktar þar?',
              chips: ['sterkt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr steini', 'úr gleri'],
            },
            {
              question: 'Til hvers er þetta notað?',
              chips: ['til að vinna'],
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
              question: 'Hvenær er þetta notað?',
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
              question: 'Hvaða lögun hefur það?',
              chips: ['oddhvasst'],
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
              question: 'Hvenær er þetta notað?',
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
              question: 'Til hvers er þetta notað?',
              chips: ['til að skemmta sér'],
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
              question: 'Hvenær er þetta notað?',
              chips: ['á daginn', 'um helgar'],
            },
          ],
        },
        {
          name: 'veitingastaður',
          answers: [
            {
              question: 'Hvernig lyktar þar?',
              chips: ['gott', 'ilmandi'],
            },
            {
              question: 'Til hvers er þetta notað?',
              chips: ['til að vinna', 'til að skemmta sér'],
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
              question: 'Hvenær er þetta notað?',
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
              question: 'Hvernig lyktar þar?',
              chips: ['ekkert'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr steini', 'úr gleri'],
            },
            {
              question: 'Til hvers er þetta notað?',
              chips: ['til að læra'],
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
              question: 'Hvenær er þetta notað?',
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
              question: 'Hvernig finnst það við snertingu?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['gróft'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr bómull'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt'],
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
              question: 'Hvernig finnst það við snertingu?',
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
              question: 'Hvernig finnst það við snertingu?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt', 'létt'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['gróft'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr bómull'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt'],
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
              question: 'Hvernig finnst það við snertingu?',
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
              question: 'Hvernig finnst það við snertingu?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt', 'heitt'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['heitt', 'þungt'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt', 'heitt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr ull'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['kringlótt'],
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
              question: 'Hvernig finnst það við snertingu?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt', 'létt'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['gróft'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr bómull'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['ílangt'],
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
              question: 'Hvernig finnst það við snertingu?',
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
              question: 'Hvernig finnst það við snertingu?',
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt', 'heitt'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['heitt', 'þungt'],
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
              question: 'Hvernig finnst það við snertingu?',
              chips: ['mjúkt', 'heitt'],
            },
            {
              question: 'Úr hverju er það gert?',
              chips: ['úr ull'],
            },
            {
              question: 'Hvaða lögun hefur það?',
              chips: ['kringlótt'],
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
              question: 'Hvernig finnst það við snertingu?',
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
              question: 'Hvernig finnst það við snertingu?',
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
};
