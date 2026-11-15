import type { ReactNode } from 'react';

import { formatDecimal, formatScientific } from '@shared/utils';

import {
  AG2CRO4,
  AGCL,
  AG_FOR_AG2CRO4,
  AG_FOR_AGCL,
  CL_GONE_AT_RED,
  COMMON_CL,
  COMMON_FACTOR,
  S_COMMON,
  S_WATER,
  WATER_PER_ION,
} from '../engine/naermynd';

/**
 * The scenes of this game's Nærmynd, as data (docs/particle-view-template.md).
 * Every number in the text is computed in `engine/naermynd.ts`.
 */

export type IonKind = 'Ag' | 'Cl' | 'Na' | 'NO3' | 'CrO4';

export interface Picture {
  /** Formula units of white AgCl and red Ag₂CrO₄ in the solid at the bottom. */
  solid: { white: number; red: number };
  ions: { kind: IonKind; count: number }[];
  /** Ions in solution keep trading places with the solid. */
  exchange: boolean;
}

export type SceneKind = 'still' | 'mix' | 'mohr';

export interface Step {
  title: string;
  kind: SceneKind;
  equations: string[];
  /** Fixed pictures; the mixing and Mohr scenes compute theirs from their control. */
  picture?: Picture;
  body: ReactNode;
}

const sci = (v: number) => formatScientific(v, 2);
const millions = formatDecimal(WATER_PER_ION / 1e6, 1);

export const STEPS: Step[] = [
  {
    title: 'Mettuð lausn',
    kind: 'still',
    equations: ['AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq)', `Ksp = [Ag⁺][Cl⁻] = ${sci(AGCL.ksp)}`],
    picture: {
      solid: { white: 24, red: 0 },
      ions: [
        { kind: 'Ag', count: 3 },
        { kind: 'Cl', count: 3 },
      ],
      exchange: true,
    },
    body: (
      <>
        <p>
          Silfurklóríð á botni glass með vatni. Svolítið af því leysist upp, og þegar lausnin er
          mettuð er styrkur hvorrar jónar {sci(S_WATER)} M, kvaðratrótin af Ksp.
        </p>
        <p>
          Upplausnin hættir ekki: jónir losna úr kristallinum og aðrar setjast á hann, jafnhratt,
          svo styrkurinn helst sá sami. Það er jafnvægið sem Ksp lýsir.
        </p>
        <p>
          Myndin ýkir jónirnar mikið. Í raun er ein Ag⁺ á hverjar {millions} milljónir
          vatnssameinda.
        </p>
      </>
    ),
  },
  {
    title: 'Samjón bætt við',
    kind: 'still',
    equations: ['AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq)', `+ NaCl: [Cl⁻] = ${formatDecimal(COMMON_CL, 3)} M`],
    picture: {
      solid: { white: 27, red: 0 },
      ions: [
        { kind: 'Ag', count: 1 },
        { kind: 'Cl', count: 10 },
        { kind: 'Na', count: 10 },
      ],
      exchange: true,
    },
    body: (
      <>
        <p>
          Nú er glasið með {formatDecimal(COMMON_CL, 3)} M natríumklóríði í stað vatns. Klóríðið er
          samjón: það er þegar í lausninni áður en silfurklóríðið leysist.
        </p>
        <p>
          Með svo mikið Cl⁻ þarf aðeins örlítið Ag⁺ til að margfeldið [Ag⁺][Cl⁻] nái Ksp.
          Mólarleysnin fellur í {sci(S_COMMON)} M, {formatDecimal(COMMON_FACTOR, 0)} sinnum minna en
          í hreinu vatni. Silfrið sem var leyst sest aftur á kristallinn. Þetta eru samjónahrif.
        </p>
        <p>
          Myndin sýnir eina Ag⁺; í raun eru þær {formatDecimal(COMMON_FACTOR, 0)} sinnum færri en
          áður.
        </p>
      </>
    ),
  },
  {
    title: 'Tvær lausnir blandaðar',
    kind: 'mix',
    equations: ['Ag⁺(aq) + Cl⁻(aq) → AgCl(s)?', 'Q = [Ag⁺][Cl⁻] á móti Ksp'],
    body: (
      <>
        <p>
          Jöfnu rúmmáli af silfurnítratlausn og natríumklóríðlausn er hellt saman. Rúmmálið
          tvöfaldast, svo styrkur hvorrar jónar helmingast áður en nokkuð annað gerist.
        </p>
        <p>
          Ef Q, reiknað úr þynntu styrkjunum, er stærra en Ksp fellur silfurklóríð út þar til Q =
          Ksp. Ef það er minna myndast ekkert botnfall, þótt efnið sé „óleysanlegt“ eftir
          leysnireglunum. Prófaðu styrkina.
        </p>
      </>
    ),
  },
  {
    title: 'Mohr-títrun',
    kind: 'mohr',
    equations: ['Ag⁺ + Cl⁻ → AgCl(s), hvítt', '2Ag⁺ + CrO₄²⁻ → Ag₂CrO₄(s), múrsteinsrautt'],
    body: (
      <>
        <p>
          Lausnin inniheldur bæði klóríð og krómat, 0,010 M af hvoru, og silfurjónum er bætt við.
          Hvítt silfurklóríð fellur út þegar [Ag⁺] nær {sci(AG_FOR_AGCL)} M; rautt silfurkrómat ekki
          fyrr en við {sci(AG_FOR_AG2CRO4)} M, þótt Ksp þess sé lægra ({sci(AG2CRO4.ksp)} á móti{' '}
          {sci(AGCL.ksp)}). Ksp silfurkrómats hefur [Ag⁺] í öðru veldi, svo það segir ekki eitt og
          sér hvort fellur fyrst.
        </p>
        <p>
          Þegar rauði liturinn birtist er {formatDecimal(CL_GONE_AT_RED * 100, 1)} % af klóríðinu
          fallið út. Þess vegna er krómatið litvísir: rauði liturinn segir að klóríðið sé búið.
        </p>
      </>
    ),
  },
];
