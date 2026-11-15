import type { ReactNode } from 'react';

import { formatDecimal } from '@shared/utils';

import {
  ML_PER_PARTICLE,
  PKA,
  V_CAPACITY_ACID,
  V_SAMPLE,
  countsAfter,
  pHAfter,
  type Reagent,
} from '../engine/agnasyn';

/**
 * The scenes of this game's Agnasýn, as data (docs/particle-view-template.md).
 * Every number in the text is computed from `engine/agnasyn.ts`, never typed.
 */
export interface Step {
  title: string;
  reagent: Reagent;
  /** mL of reagent in each glass when the scene ends. */
  volume: number;
  /** Drip the reagent in from the previous scene's volume. */
  drip: boolean;
  /** One line per glass. */
  equations: [string, string];
  body: ReactNode;
}

const ph = (glass: 'buffer' | 'water', reagent: Reagent, v: number) =>
  formatDecimal(pHAfter(glass, reagent, v), 2);

const ONE = ML_PER_PARTICLE;
const SOME = 6 * ML_PER_PARTICLE;
const PAST = 12 * ML_PER_PARTICLE;

const some = countsAfter('buffer', 'HCl', SOME);

export const STEPS: Step[] = [
  {
    title: 'Tvö glös',
    reagent: 'HCl',
    volume: 0,
    drip: false,
    equations: ['Stuðpúði: CH₃COOH og CH₃COO⁻, jafnmikið af hvoru', 'Vatn: hreint vatn'],
    body: (
      <>
        <p>
          Vinstra glasið geymir {V_SAMPLE} mL af stuðpúðanum úr fyrsta verkefni Stigs 2: ediksýru,
          CH₃COOH, og asetatjónir, CH₃COO⁻, jafnmikið af hvoru. Na⁺ fylgir asetatinu og er meðjón.
          pH = pK<sub>a</sub> = {formatDecimal(PKA, 2)}.
        </p>
        <p>
          Hægra glasið geymir jafnmikið af hreinu vatni, pH {ph('water', 'HCl', 0)}. Í báðum glösum
          fer sama saltsýran, 1,0 M, úr búrettu.
        </p>
      </>
    ),
  },
  {
    title: 'Einn dropi af saltsýru',
    reagent: 'HCl',
    volume: ONE,
    drip: true,
    equations: ['Stuðpúði: H⁺ + CH₃COO⁻ → CH₃COOH', 'Vatn: H⁺ verður eftir í lausninni'],
    body: (
      <>
        <p>
          Í stuðpúðanum finnur H⁺ asetatjón og binst henni: ein CH₃COO⁻ verður að CH₃COOH. pH lækkar
          aðeins úr {ph('buffer', 'HCl', 0)} í {ph('buffer', 'HCl', ONE)}.
        </p>
        <p>
          Í vatninu tekur ekkert við H⁺, svo hún verður eftir í lausninni. pH hrapar úr{' '}
          {ph('water', 'HCl', 0)} í {ph('water', 'HCl', ONE)}. Cl⁻ er meðjón í báðum glösum.
        </p>
      </>
    ),
  },
  {
    title: 'Fleiri dropar',
    reagent: 'HCl',
    volume: SOME,
    drip: true,
    equations: ['Stuðpúði: hver H⁺ breytir einni CH₃COO⁻ í CH₃COOH', 'Vatn: H⁺ safnast upp'],
    body: (
      <>
        <p>
          Hver H⁺ hefur breytt einni asetatjón í ediksýru. Nú eru {some.HA} CH₃COOH og {some.A}{' '}
          CH₃COO⁻, og pH fylgir hlutfalli þeirra:
        </p>
        <p>
          pH ≈ pK<sub>a</sub> + log({some.A}/{some.HA}) = {formatDecimal(PKA, 2)} + log({some.A}/
          {some.HA}) = {formatDecimal(PKA + Math.log10(some.A / some.HA), 2)}
        </p>
        <p>
          Vatnið er komið niður í pH {ph('water', 'HCl', SOME)}: hver dropi bætir H⁺ við og ekkert
          tekur við henni.
        </p>
      </>
    ),
  },
  {
    title: 'Stuðpúðinn þrýtur',
    reagent: 'HCl',
    volume: PAST,
    drip: true,
    equations: ['Stuðpúði: engin CH₃COO⁻ eftir, H⁺ verður eftir', 'Vatn: H⁺ safnast upp'],
    body: (
      <>
        <p>
          Eftir {formatDecimal(V_CAPACITY_ACID, 1)} mL er síðasta asetatjónin orðin að ediksýru.
          Stuðpúðinn getur tekið við jafnmiklu af sýru og hann á af basa, og þá er hann búinn.
        </p>
        <p>
          Dropar eftir það standa eftir sem H⁺, eins og í vatninu, og pH stuðpúðans hrapar í{' '}
          {ph('buffer', 'HCl', PAST)}. Þetta er stuðpúðageta: hversu mikla sýru eða basa stuðpúðinn
          tekur við áður en pH breytist mikið.
        </p>
      </>
    ),
  },
  {
    title: 'Basi í staðinn',
    reagent: 'NaOH',
    volume: SOME,
    drip: true,
    equations: ['Stuðpúði: OH⁻ + CH₃COOH → CH₃COO⁻ + H₂O', 'Vatn: OH⁻ verður eftir í lausninni'],
    body: (
      <>
        <p>
          Byrjum aftur með óbreytt glös og bætum natríumhýdroxíði, 1,0 M, við dropa fyrir dropa. Í
          stuðpúðanum tekur ediksýran við hverri OH⁻ og verður að asetatjón og vatni. pH hækkar
          aðeins í {ph('buffer', 'NaOH', SOME)}.
        </p>
        <p>
          Í vatninu safnast OH⁻ upp og pH hækkar í {ph('water', 'NaOH', SOME)}. Stuðpúðinn ver sig í
          báðar áttir, því hann á bæði sýru og basa.
        </p>
      </>
    ),
  },
];
