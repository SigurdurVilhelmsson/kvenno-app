// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     content/islenskubraut/
// Regenerate: pnpm islenskubraut:build
//
// Edit the YAML, not this file. A test fails if this file drifts from it.

import type { Level } from '../types/islenskubraut.js';

export interface Egget {
  /** A teacher has read the statements; until then the card page does not link the PDF. */
  confirmed: boolean;
  /** Three or four statements per level, each starting `Ég get`. */
  levels: Record<Level, string[]>;
}

export const egget: Record<string, Egget> = {
  dyr: {
    confirmed: false,
    levels: {
      A1: [
        'Ég get sagt hvaða dýr þetta er.',
        'Ég get sagt hvernig dýrið lítur út.',
        'Ég get sagt hvar dýrið býr.',
        'Ég get spurt: „Hvernig lítur það út?“',
      ],
      A2: [
        'Ég get lýst dýri með tveimur eða þremur orðum.',
        'Ég get sagt hvað dýrið étur og hvar það býr.',
        'Ég get sagt hvernig dýrið er við snertingu.',
        'Ég get spurt félaga minn um dýr og skilið svarið.',
      ],
      B1: [
        'Ég get giskað á dýr og sagt hvers vegna.',
        'Ég get borið saman tvö dýr og sagt hvað er líkt og hvað ólíkt.',
        'Ég get útskýrt til hvers fólk notar dýrið.',
        'Ég get skrifað stutta lýsingu á dýri.',
      ],
    },
  },
  matur: {
    confirmed: false,
    levels: {
      A1: [
        'Ég get sagt hvaða matur þetta er.',
        'Ég get sagt hvernig maturinn er á litinn.',
        'Ég get sagt hvort maturinn er sætur, saltur eða súr.',
        'Ég get sagt hvenær maður borðar matinn.',
      ],
      A2: [
        'Ég get lýst því hvernig matur lítur út og hvernig hann bragðast.',
        'Ég get sagt úr hverju maturinn er gerður.',
        'Ég get sagt hvar maður kaupir matinn.',
        'Ég get spurt félaga minn um mat og skilið svarið.',
      ],
      B1: [
        'Ég get borið saman tvo rétti.',
        'Ég get sagt hvað mér finnst um mat og hvers vegna.',
        'Ég get útskýrt hvers vegna matur er hollur eða óhollur.',
        'Ég get skrifað stutta lýsingu á mat.',
      ],
    },
  },
  farartaeki: {
    confirmed: false,
    levels: {
      A1: [
        'Ég get sagt hvaða farartæki þetta er.',
        'Ég get sagt hvort það fer á landi, á sjó eða í lofti.',
        'Ég get sagt hvort það er stórt eða lítið.',
        'Ég get spurt: „Hvar er hægt að nota þetta?“',
      ],
      A2: [
        'Ég get sagt hversu stórt farartæki er og úr hverju það er.',
        'Ég get sagt hver notar farartækið.',
        'Ég get sagt hvenær farartækið er notað.',
        'Ég get spurt félaga minn um farartæki og skilið svarið.',
      ],
      B1: [
        'Ég get útskýrt í einföldu máli hvernig farartæki virkar.',
        'Ég get borið saman tvö farartæki.',
        'Ég get sagt hvaða farartæki mér finnst best og hvers vegna.',
        'Ég get skrifað stutta lýsingu á farartæki.',
      ],
    },
  },
  manneskja: {
    confirmed: false,
    levels: {
      A1: [
        'Ég get sagt hvað manneskjan gerir.',
        'Ég get sagt hvort manneskjan er ung eða gömul.',
        'Ég get sagt hvar manneskjan er.',
        'Ég get notað hún og hann rétt.',
      ],
      A2: [
        'Ég get lýst útliti manneskju.',
        'Ég get sagt hvar manneskjan vinnur og hvað hún gerir.',
        'Ég get sagt hvenær manneskjan vinnur.',
        'Ég get spurt um starf og skilið svarið.',
      ],
      B1: [
        'Ég get lýst starfi í nokkrum setningum.',
        'Ég get giskað á starf og sagt hvers vegna.',
        'Ég get sagt frá frægri manneskju.',
        'Ég get sagt hvaða starf mér finnst áhugavert og hvers vegna.',
      ],
    },
  },
  stadir: {
    confirmed: false,
    levels: {
      A1: [
        'Ég get sagt hvaða staður þetta er.',
        'Ég get sagt hvað maður gerir þar.',
        'Ég get sagt hvort staðurinn er stór eða lítill.',
        'Ég get spurt: „Hvar er þetta?“',
      ],
      A2: [
        'Ég get lýst byggingu og sagt úr hverju hún er.',
        'Ég get sagt hvar staðurinn er.',
        'Ég get sagt hver fer þangað og til hvers.',
        'Ég get spurt félaga minn um stað og skilið svarið.',
      ],
      B1: [
        'Ég get lýst stað í nokkrum setningum.',
        'Ég get borið saman tvo staði.',
        'Ég get sagt hvað mér finnst um staðinn og hvers vegna.',
        'Ég get skrifað stutta lýsingu á stað í bænum mínum.',
      ],
    },
  },
  klaednadur: {
    confirmed: false,
    levels: {
      A1: [
        'Ég get sagt hvaða flík þetta er.',
        'Ég get sagt hvernig flíkin er á litinn.',
        'Ég get sagt hvort maður notar flíkina inni eða úti.',
        'Ég get spurt: „Hvernig lítur það út?“',
      ],
      A2: [
        'Ég get lýst lit flíkur, efni hennar og hvernig hún er við snertingu.',
        'Ég get sagt hvenær maður klæðist flíkinni.',
        'Ég get sagt hver notar flíkina.',
        'Ég get spurt félaga minn um föt og skilið svarið.',
      ],
      B1: [
        'Ég get ráðlagt öðrum hvernig best er að klæða sig í kulda og bleytu.',
        'Ég get borið saman tvær flíkur.',
        'Ég get sagt hvaða föt mér finnst þægileg og hvers vegna.',
        'Ég get skrifað stutta lýsingu á flík.',
      ],
    },
  },
  skolinn: {
    confirmed: false,
    levels: {
      A1: [
        'Ég get sagt hvað hlutirnir í skólatöskunni heita.',
        'Ég get skilið einföld fyrirmæli eins og „lestu“ og „skrifaðu“.',
        'Ég get sagt hvar ég er í skólanum.',
        'Ég get sagt í hvaða fagi ég er.',
      ],
      A2: [
        'Ég get sagt hvað við lærum í hverju fagi.',
        'Ég get skilið fyrirmælin í verkefni.',
        'Ég get beðið um hjálp þegar ég skil ekki.',
        'Ég get sagt hvað ég þarf að hafa með mér í tíma.',
      ],
      B1: [
        'Ég get sagt frá því sem við lærðum í tímanum.',
        'Ég get útskýrt hvers vegna eitthvað skiptir máli.',
        'Ég get rökstutt skoðun mína.',
        'Ég get notað námsorð eins og „áhrif“ og „breyting“.',
      ],
    },
  },
};
