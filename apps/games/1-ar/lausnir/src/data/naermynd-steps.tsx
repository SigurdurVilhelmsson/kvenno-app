import type { ReactNode } from 'react';

import { formatDecimal } from '@shared/utils';

import { CLASSES } from './electrolytes';
import {
  ACETIC_FRACTION,
  AMOUNT_MMOL,
  CONCENTRATION_M,
  UNITS,
  VOLUME_ML,
  aceticIonised,
  beakerState,
  type NaermyndSolute,
} from '../utils/naermynd';

/**
 * The scenes of Stig 0's Nærmynd, as data (docs/particle-view-template.md). Every number in
 * the text is computed in `utils/naermynd.ts`; the equations are Stig 0's own.
 */

export interface Step {
  title: string;
  /** The beakers drawn, one large or three side by side. */
  beakers: NaermyndSolute[];
  equations: string[];
  body: ReactNode;
  /** Shown when a beaker in the scene draws an exaggerated pair. */
  note?: ReactNode;
}

const d = (v: number, digits = 2) => formatDecimal(v, digits);
const mmol = (v: number) => `${d(v)} mmól`;

const NACL = beakerState('nacl');
const ACETIC = beakerState('ch3cooh');
const GLUCOSE = beakerState('c6h12o6');

/** mmól of ions in a beaker: a cation and an anion for each unit that came apart. */
const ionsMmol = (pairs: number) => (2 * pairs) / (UNITS / AMOUNT_MMOL);
const ACETIC_IONS_MMOL = 2 * aceticIonised() * VOLUME_ML;

const solution = `${d(VOLUME_ML, 1)} mL af ${d(CONCENTRATION_M, 3)} M lausn`;

export const STEPS: Step[] = [
  {
    title: NACL.solute.name,
    beakers: ['nacl'],
    equations: [NACL.solute.dissociation ?? ''],
    body: (
      <>
        <p>
          Í bikarnum eru {solution}: {mmol(AMOUNT_MMOL)} af NaCl. Í vatninu klofnar hver einasta
          eining í Na⁺ og Cl⁻, svo í lausninni eru {mmol(ionsMmol(NACL.ionPairs))} af jónum og engin
          heil NaCl-eining.
        </p>
        <p>
          Jónirnar bera strauminn milli rafskautanna og peran logar skært. Natríumklóríð er{' '}
          <strong>{CLASSES[NACL.electrolyte].name.toLowerCase()}</strong>.
        </p>
      </>
    ),
  },
  {
    title: GLUCOSE.solute.name,
    beakers: ['c6h12o6'],
    equations: ['C₆H₁₂O₆(s) → C₆H₁₂O₆(aq)'],
    body: (
      <>
        <p>
          Sami styrkur, {solution}: {mmol(AMOUNT_MMOL)} af glúkósa. Hann leysist vel upp, en
          sameindirnar dreifast heilar um vatnið. Engin jón myndast.
        </p>
        <p>
          Án jóna ber ekkert strauminn og peran er slökkt. Glúkósi er{' '}
          <strong>{CLASSES[GLUCOSE.electrolyte].name.toLowerCase()}</strong>: að leysast upp og að
          klofna í jónir er ekki sami hluturinn.
        </p>
      </>
    ),
  },
  {
    title: ACETIC.solute.name,
    beakers: ['ch3cooh'],
    equations: [ACETIC.solute.dissociation ?? ''],
    body: (
      <>
        <p>
          Aftur {solution}: {mmol(AMOUNT_MMOL)} af ediksýru. Tvöfalda örin segir að hún klofni
          aðeins að hluta. Við þennan styrk klofna um {d(100 * ACETIC_FRACTION, 1)} % sameindanna,
          svo í lausninni eru aðeins {mmol(ACETIC_IONS_MMOL)} af jónum.
        </p>
        <p>
          Fáar jónir bera lítinn straum og peran logar dauft. Ediksýra er{' '}
          <strong>{CLASSES[ACETIC.electrolyte].name.toLowerCase()}</strong>.
        </p>
      </>
    ),
    note: (
      <>
        Eitt jónapar er teiknað með strikalínu. Í raun klofna aðeins {d(ACETIC.trueIonPairs)} af
        þeim {UNITS} sameindum sem teiknaðar eru, minna en ein; án parsins liti ediksýran út eins og
        glúkósi.
      </>
    ),
  },
  {
    title: 'Allar þrjár saman',
    beakers: ['nacl', 'ch3cooh', 'c6h12o6'],
    equations: [],
    body: (
      <>
        <p>
          Jafnmikið af hverju efni er leyst upp, {mmol(AMOUNT_MMOL)} í hverjum bikar. Það sem skilur
          á milli er hve mikið af jónum verður til: {mmol(ionsMmol(NACL.ionPairs))} úr
          natríumklóríði, {mmol(ACETIC_IONS_MMOL)} úr ediksýru og {mmol(0)} úr glúkósa.
        </p>
        <p>
          Birta perunnar fylgir jónunum, ekki því hve vel efnið leysist. Sterk sýra eins og saltsýra
          myndi lýsa jafnskært og natríumklóríð, því hún klofnar líka algjörlega.
        </p>
      </>
    ),
    note: <>Ediksýran sýnir eitt jónapar með strikalínu, eins og í skrefinu á undan.</>,
  },
];
