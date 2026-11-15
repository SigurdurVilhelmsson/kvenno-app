import type { ReactNode } from 'react';

import { formatDecimal } from '@shared/utils';

import { ONE_ATM_KPA, WATER_AT_100_KPA, type Liquid } from './vapour-pressure';
import { liquid, ratio, sameindir, vapourCount } from '../engine/naermynd';

/**
 * The scenes of this game's Nærmynd, as data (docs/particle-view-template.md).
 * Every number in the text comes from `data/vapour-pressure.ts` through the engine.
 */

export interface Step {
  title: string;
  /** The flasks shown, at 20 °C; `null` lets the student choose one beside water. */
  flasks: Liquid['id'][] | null;
  /** Water at 100 °C, boiling: bubbles in the liquid, not drawn to scale. */
  boil?: boolean;
  body: ReactNode;
}

const kPa = (id: Liquid['id']) => `${formatDecimal(liquid(id).kPa, liquid(id).decimals)} kPa`;

export const STEPS: Step[] = [
  {
    title: 'Vatn í lokaðri flösku',
    flasks: ['vatn'],
    body: (
      <>
        <p>
          Við 20 °C sleppa sumar vatnssameindir úr vökvanum og aðrar fara aftur inn í hann. Þegar
          jafnmargar fara í hvora átt er gufan í jafnvægi við vökvann og þrýstingur hennar er
          gufunarþrýstingur vatns, {kPa('vatn')}.
        </p>
        <p>
          Sameindirnar í gufunni eru heilar H₂O-sameindir. Það sem rofnar þegar vatn gufar upp eru
          vetnistengin <em>milli</em> sameinda, ekki tengin innan þeirra.
        </p>
      </>
    ),
  },
  {
    title: 'Metanól og vatn',
    flasks: ['vatn', 'metanol'],
    body: (
      <>
        <p>
          Bæði efnin mynda vetnistengi, en gufunarþrýstingur metanóls er {kPa('metanol')}, um{' '}
          {formatDecimal(ratio('metanol', 'vatn'), 1)} sinnum meiri en vatns. Þess vegna eru{' '}
          {sameindir(vapourCount('metanol'))} í gufunni yfir metanóli en{' '}
          {sameindir(vapourCount('vatn'))} yfir vatni.
        </p>
        <p>
          Vatnssameind getur myndað fleiri vetnistengi en metanólsameind, sem hefur aðeins einn
          −OH-hóp. Því sterkari sem kraftarnir milli sameinda eru, því færri sleppa.
        </p>
      </>
    ),
  },
  {
    title: 'Alkóhólaröðin',
    flasks: ['metanol', 'etanol', 'propanol', 'butanol'],
    body: (
      <p>
        Öll fjögur alkóhólin mynda vetnistengi með einum −OH-hóp. Eftir því sem sameindin stækkar,
        frá metanóli til bútanóls, verða London-kraftarnir sterkari og gufunarþrýstingurinn lækkar:{' '}
        {kPa('metanol')}, {kPa('etanol')}, {kPa('propanol')} og {kPa('butanol')}.
      </p>
    ),
  },
  {
    title: 'Vatn sýður',
    flasks: ['vatn'],
    boil: true,
    body: (
      <>
        <p>
          Við 100 °C er gufunarþrýstingur vatns {formatDecimal(WATER_AT_100_KPA, 1)} kPa, jafn
          loftþrýstingnum, {formatDecimal(ONE_ATM_KPA, 1)} kPa. Þá myndast gufubólur inni í vökvanum
          sjálfum: vatnið sýður.
        </p>
        <p>
          Í bólunum eru heilar H₂O-sameindir, ekki vetni og súrefni. Suða rýfur kraftana milli
          sameinda; til að kljúfa vatn í H₂ og O₂ þarf efnahvarf.
        </p>
      </>
    ),
  },
  {
    title: 'Berðu saman sjálf/ur',
    flasks: null,
    body: (
      <p>
        Veldu vökva og berðu gufuna yfir honum saman við vatn. Allar flöskurnar eru við 20 °C og
        hver sameind í gufunni stendur fyrir sama þrýsting.
      </p>
    ),
  },
];
