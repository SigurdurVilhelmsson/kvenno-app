import type { ReactNode } from 'react';

import { formatDecimal } from '@shared/utils';

import {
  CONCENTRATION_M,
  CU_START,
  E_CELL,
  E_COPPER,
  E_ZINC,
  ELECTRONS,
  VOLUME_ML,
  amountsAt,
} from '../engine/naermynd';

/**
 * The scenes of this game's Nærmynd, as data (docs/particle-view-template.md).
 * Every number in the text is computed in `engine/naermynd.ts`.
 */

export interface Step {
  title: string;
  /** Extent of reaction in mmól; `null` gives the student the slider. */
  xi: number | null;
  equations: string[];
  /** Draw the electrons moving through the plate. */
  electrons?: boolean;
  body: ReactNode;
}

const d = (v: number, digits = 2) => formatDecimal(v, digits);
const mmol = (v: number) => `${d(v)} mmól`;

const HALF = CU_START / 2;

export const STEPS: Step[] = [
  {
    title: 'Sinkplata í koparsúlfatlausn',
    xi: 0,
    equations: ['CuSO₄(aq) → Cu²⁺(aq) + SO₄²⁻(aq)'],
    body: (
      <>
        <p>
          Í bikarnum eru {d(VOLUME_ML, 1)} mL af {d(CONCENTRATION_M, 3)} M koparsúlfatlausn, svo{' '}
          {mmol(CU_START)} af Cu²⁺ og jafnmikið af SO₄²⁻. Það eru koparjónirnar sem gera lausnina
          bláa.
        </p>
        <p>Sinkplötunni er stungið ofan í. Fylgstu með yfirborði hennar og lit lausnarinnar.</p>
      </>
    ),
  },
  {
    title: 'Rafeindir flytjast',
    xi: 1,
    electrons: true,
    equations: ['Oxun: Zn(s) → Zn²⁺(aq) + 2e⁻', 'Afoxun: Cu²⁺(aq) + 2e⁻ → Cu(s)'],
    body: (
      <>
        <p>
          Þar sem koparjón snertir plötuna gefur sinkatóm frá sér {ELECTRONS} rafeindir og fer út í
          lausnina sem Zn²⁺. Rafeindirnar fara gegnum málminn að koparjón, sem tekur við þeim og
          sest á plötuna sem koparatóm.
        </p>
        <p>
          Sinkið oxast og koparjónin afoxast. Hvert sinkatóm gefur jafn margar rafeindir og hver
          koparjón tekur við, svo margfaldarinn er 1.
        </p>
      </>
    ),
  },
  {
    title: 'Meðjónin',
    xi: HALF,
    equations: ['Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)', 'Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)'],
    body: (
      <>
        <p>
          Hálfnað: {mmol(amountsAt(HALF).Cu)} af kopar hafa sest á plötuna og{' '}
          {mmol(amountsAt(HALF).Zn2)} af Zn²⁺ eru komin í lausnina. Súlfatjónunum hefur ekkert
          fækkað: þær eru enn {mmol(amountsAt(HALF).SO4)}.
        </p>
        <p>
          SO₄²⁻ er <strong>meðjón</strong>: hún er í lausninni fyrir og eftir en tekur ekki þátt í
          hvarfinu. Þess vegna er hún strikuð út, og eftir stendur nettójónajafnan, neðri jafnan.
        </p>
      </>
    ),
  },
  {
    title: 'Hvarfinu lýkur',
    xi: CU_START,
    equations: [
      `E°ker = E°(Cu²⁺/Cu) − E°(Zn²⁺/Zn) = ${d(E_COPPER, 3)} V − (${d(E_ZINC, 3)} V) = ${d(E_CELL)} V`,
    ],
    body: (
      <>
        <p>
          Allar koparjónirnar eru farnar og lausnin er orðin litlaus. Kopar hefur sest á plötuna og{' '}
          {mmol(amountsAt(CU_START).electrons)} af rafeindum hafa farið frá sinki til kopars.
        </p>
        <p>
          Staðalkerspennan, E°ker, er jákvæð, {d(E_CELL)} V, svo hvarfið er sjálfgengt: það gengur
          af sjálfu sér þegar sinkið snertir lausnina. Settu koparplötu í sinksúlfatlausn og ekkert
          gerist, því öfuga hvarfið hefur neikvæða spennu.
        </p>
      </>
    ),
  },
  {
    title: 'Kannaðu sjálf/ur',
    xi: null,
    electrons: true,
    equations: ['Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)'],
    body: (
      <p>
        Dragðu sleðann og fylgstu með: hver koparjón sem hverfur úr lausninni verður að koparatómi á
        plötunni, og í staðinn fer sinkjón út í lausnina. Súlfatjónirnar standa í stað.
      </p>
    ),
  },
];
