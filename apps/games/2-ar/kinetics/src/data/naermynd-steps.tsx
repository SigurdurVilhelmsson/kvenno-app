import type { ReactNode } from 'react';

import { formatDecimal } from '@shared/utils';

import { T_HALF, ZERO_EMPTY_AT, firstOrderAt, zeroOrderAt } from '../engine/naermynd';

/**
 * The scenes of this game's Nærmynd, as data (docs/particle-view-template.md).
 * Every number in the text is computed in `engine/naermynd.ts`.
 */

export interface Step {
  title: string;
  /** Time in klst.; `null` gives the student the slider. */
  t: number | null;
  body: ReactNode;
}

const M = (c: number) => `${formatDecimal(c, 3)} M`;
const h = (t: number) => `${formatDecimal(t, 1)} klst.`;

export const STEPS: Step[] = [
  {
    title: 'Upphaf',
    t: 0,
    body: (
      <>
        <p>
          Vinstra megin brotnar vetnisperoxíð niður, eins og í bókinni: 2H₂O₂ → 2H₂O + O₂. Það er
          fyrsta stigs hvarf og styrkurinn byrjar í {M(firstOrderAt(0).concentration)}.
        </p>
        <p>
          Hægra megin er hugsað hvarf af núllta stigi, valið svo að það byrji eins og hafi sama
          fyrsta helmingunartíma. Hver ögn stendur fyrir 1/32 af upphafsstyrknum.
        </p>
      </>
    ),
  },
  {
    title: 'Einn helmingunartími',
    t: T_HALF,
    body: (
      <>
        <p>
          Eftir {h(T_HALF)} er helmingurinn eftir í báðum flöskum,{' '}
          {M(firstOrderAt(T_HALF).concentration)}. Hingað til er enginn munur að sjá.
        </p>
        <p>
          Margir halda að seinni helmingurinn taki jafnlangan tíma og hvarfinu sé þá lokið. Sjáðu
          hvað gerist í næsta skrefi.
        </p>
      </>
    ),
  },
  {
    title: 'Tveir helmingunartímar',
    t: 2 * T_HALF,
    body: (
      <>
        <p>
          Fyrsta stigs flaskan hefur aftur misst helming þess sem var eftir:{' '}
          {M(firstOrderAt(2 * T_HALF).concentration)}, fjórðungur. Hraðinn er í réttu hlutfalli við
          styrkinn, svo hann minnkar með honum.
        </p>
        <p>
          Núllta stigs flaskan er tóm eftir {h(ZERO_EMPTY_AT)}: hraðinn er óháður styrknum, svo sami
          fjöldi agna hvarfast á hverri klukkustund þar til ekkert er eftir.
        </p>
      </>
    ),
  },
  {
    title: 'Fjórir helmingunartímar',
    t: 4 * T_HALF,
    body: (
      <p>
        Eftir {h(4 * T_HALF)} er sextándi hluti eftir, {M(firstOrderAt(4 * T_HALF).concentration)}.
        Helmingunartími fyrsta stigs hvarfs er alltaf {h(T_HALF)}, óháður styrknum: t½ = ln 2 / k.
        Fyrsta stigs hvarf klárast því aldrei alveg, það helmingast bara aftur og aftur.
      </p>
    ),
  },
  {
    title: 'Kannaðu sjálf/ur',
    t: null,
    body: (
      <p>
        Dragðu sleðann. Fylgstu með helmingunartímanum frá þeim styrk sem er eftir: hann er fastur í
        fyrsta stigs flöskunni, {h(firstOrderAt(0).halfLifeNow)}, en styttist í núllta stigs
        flöskunni, úr {h(zeroOrderAt(0).halfLifeNow)} í {h(zeroOrderAt(T_HALF).halfLifeNow)} eftir
        einn helmingunartíma.
      </p>
    ),
  },
];
