import type { ReactNode } from 'react';

import { formatDecimal } from '@shared/utils';

import {
  DISSOLVED_PRODUCT,
  DISSOLVED_VERDICT,
  IODIDE_CONCENTRATION_M,
  IODIDE_EQUIVALENCE,
  IODIDE_PER_PRECIPITATE,
  LEAD_CONCENTRATION_M,
  LEAD_START,
  LEAD_VOLUME_ML,
  NITRATE_START,
  PRECIPITATE_FORMULA,
  PRECIPITATE_VERDICT,
  REACTION,
  amountsAt,
  precipitateMass,
} from '../engine/naermynd';
import type { Term } from '../engine/precipitation';

/**
 * The scenes of this game's Nærmynd, as data (docs/particle-view-template.md).
 * Every number in the text is computed in `engine/naermynd.ts`, and every equation is
 * the one `react()` writes for the `pbno3-ki` scenario.
 */

export interface Equation {
  left: Term[];
  right: Term[];
  /** Strike the meðjónir through, as the complete ionic equation does before it is shortened. */
  strike?: boolean;
}

export interface Step {
  title: string;
  /** mmól of I⁻ added as KI; `null` gives the student the slider. */
  iodide: number | null;
  equations: Equation[];
  /** Draw the meðjónir faded, once the scene has named them. */
  dimSpectators?: boolean;
  body: ReactNode;
}

const d = (v: number, digits = 2) => formatDecimal(v, digits);
const mmol = (v: number) => `${d(v)} mmól`;

const aq = (species: string, coefficient = 1): Term => ({ species, coefficient, state: 'aq' });

const [LEAD_SALT, IODIDE_SALT] = REACTION.reactants;

/** `Pb(NO₃)₂(aq) → Pb²⁺(aq) + 2NO₃⁻(aq)`: a soluble salt splitting into its ions. */
const dissociation = (salt: typeof LEAD_SALT): Equation => ({
  left: [aq(salt.formula)],
  right: [aq(salt.cation.formula, salt.cationCount), aq(salt.anion.formula, salt.anionCount)],
});

const FIRST = 1;
const MIDDLE = 3;

export const STEPS: Step[] = [
  {
    title: 'Tvær tærar lausnir',
    iodide: 0,
    equations: [dissociation(LEAD_SALT), dissociation(IODIDE_SALT)],
    body: (
      <>
        <p>
          Í bikarnum eru {d(LEAD_VOLUME_ML, 1)} mL af {d(LEAD_CONCENTRATION_M, 3)} M blýnítratlausn:{' '}
          {mmol(LEAD_START)} af Pb²⁺ og {mmol(NITRATE_START)} af NO₃⁻, tvær nítratjónir á hverja
          blýjón. Lausnin er tær, því jónirnar eru lausar hver frá annarri í vatninu.
        </p>
        <p>
          Í hinni flöskunni er {d(IODIDE_CONCENTRATION_M, 3)} M kalíumjoðíðlausn, líka tær. Hún er
          sundruð í K⁺ og I⁻ á sama hátt.
        </p>
      </>
    ),
  },
  {
    title: 'Fyrsti skammturinn',
    iodide: FIRST,
    equations: [REACTION.molecular],
    body: (
      <>
        <p>
          {d(amountsAt(FIRST).addedMl, 1)} mL af kalíumjoðíðlausn bætast við, svo {mmol(FIRST)} af
          I⁻. Um leið og joðíðjón hittir blýjón falla þær út saman sem {PRECIPITATE_FORMULA}, gult
          botnfall: {mmol(amountsAt(FIRST).PbI2)}, eða {d(precipitateMass(FIRST))} g.
        </p>
        <p>
          Leysnireglan segir það fyrir: {PRECIPITATE_VERDICT.rule.text}{' '}
          <strong>{PRECIPITATE_VERDICT.rule.exceptionText}</strong> Hitt myndefnið,{' '}
          {DISSOLVED_PRODUCT.formula}, er leysanlegt: {DISSOLVED_VERDICT.rule.text}
        </p>
      </>
    ),
  },
  {
    title: 'Meðjónirnar',
    iodide: MIDDLE,
    dimSpectators: true,
    equations: [{ ...REACTION.complete, strike: true }, REACTION.net],
    body: (
      <>
        <p>
          Nú hafa {mmol(MIDDLE)} af I⁻ bæst við og {mmol(amountsAt(MIDDLE).PbI2)} af{' '}
          {PRECIPITATE_FORMULA} hafa fallið út. Nítratjónirnar eru enn {mmol(amountsAt(MIDDLE).NO3)}
          , jafnmargar og í upphafi, og kalíumjónirnar eru jafnmargar og joðíðjónirnar sem bættust
          við: {mmol(amountsAt(MIDDLE).K)}.
        </p>
        <p>
          K⁺ og NO₃⁻ eru <strong>meðjónir</strong>: þær eru í lausninni fyrir og eftir en taka ekki
          þátt í hvarfinu, svo þær eru dregnar daufar hér. Þær eru strikaðar út úr
          heildarjónajöfnunni, og eftir stendur nettójónajafnan: ein Pb²⁺ og{' '}
          {IODIDE_PER_PRECIPITATE} I⁻ verða að einni einingu af {PRECIPITATE_FORMULA}.
        </p>
      </>
    ),
  },
  {
    title: 'Allt blýið fallið út',
    iodide: IODIDE_EQUIVALENCE,
    dimSpectators: true,
    equations: [REACTION.net],
    body: (
      <>
        <p>
          Eftir {d(amountsAt(IODIDE_EQUIVALENCE).addedMl, 1)} mL af kalíumjoðíðlausn,{' '}
          {mmol(IODIDE_EQUIVALENCE)} af I⁻, er engin blýjón eftir. Allar {mmol(LEAD_START)} hafa
          fallið út sem {d(precipitateMass(IODIDE_EQUIVALENCE))} g af {PRECIPITATE_FORMULA}.
        </p>
        <p>
          Í lausninni eru aðeins meðjónirnar eftir, {mmol(amountsAt(IODIDE_EQUIVALENCE).K)} af K⁺ og{' '}
          {mmol(amountsAt(IODIDE_EQUIVALENCE).NO3)} af NO₃⁻: það er {DISSOLVED_PRODUCT.formula}
          -lausn. Með síun má skilja botnfallið frá henni.
        </p>
      </>
    ),
  },
  {
    title: 'Kannaðu sjálf/ur',
    iodide: null,
    dimSpectators: true,
    equations: [REACTION.net],
    body: (
      <p>
        Dragðu sleðann og fylgstu með: hverjar tvær joðíðjónir sem bætast við taka eina blýjón með
        sér í botnfallið, en kalíumjónirnar verða eftir í lausninni. Þegar blýjónirnar eru búnar
        fellur ekkert meira út, og joðíðjónirnar sem bætast við eftir það verða líka eftir í
        lausninni.
      </p>
    ),
  },
];
