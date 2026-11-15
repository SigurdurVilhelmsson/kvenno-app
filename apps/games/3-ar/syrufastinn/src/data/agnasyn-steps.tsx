import type { ReactNode } from 'react';

import { formatDecimal, formatScientific } from '@shared/utils';

import {
  DILUTION,
  SCENE_ACID,
  UNITS,
  fraction,
  kaFromGlass,
  strongPH,
  weakCounts,
  weakPH,
} from '../engine/agnasyn';

/**
 * The scenes of this game's Agnasýn, as data (docs/particle-view-template.md).
 * Every number in the text is computed from `engine/agnasyn.ts`.
 */

export type GlassSpec = { strong: boolean; c: number };

export interface Step {
  title: string;
  glasses: GlassSpec[];
  equations: string[];
  body: ReactNode;
}

const pct = (c: number) => formatDecimal(fraction(SCENE_ACID, c) * 100, 1);
const ions = (c: number) => weakCounts(SCENE_ACID, c).A;
const M = (c: number) => `${formatDecimal(c, c < 0.1 ? 3 : c < 1 ? 2 : 1)} M`;

const dilution: GlassSpec[] = DILUTION.map((c) => ({ strong: false, c }));
const [C1, C2, C3] = DILUTION;

export const STEPS: Step[] = [
  {
    title: 'Sama sýra, þrír styrkir',
    glasses: dilution,
    equations: ['HF(aq) ⇌ H⁺(aq) + F⁻(aq)'],
    body: (
      <>
        <p>
          Í hverju glasi eru {UNITS} sameindir af flússýru, HF, leystar í vatni: lítið vatn í fyrsta
          glasinu ({M(C1)}), tífalt meira í öðru ({M(C2)}) og hundraðfalt meira í því þriðja (
          {M(C3)}). Vatnssameindirnar eru ekki sýndar.
        </p>
        <p>
          Í óþynntu lausninni hefur aðeins {ions(C1)} sameind af {UNITS} klofnað, {pct(C1)} %. Við
          tífalda þynningu eru það {ions(C2)}, {pct(C2)} %, og við hundraðfalda {ions(C3)},{' '}
          {pct(C3)} %. Því þynnri sem lausnin er, því stærri hluti sýrunnar klofnar.
        </p>
        <p>
          Klofnunin hættir ekki: sameindir klofna og jónir sameinast aftur í sífellu, jafnhratt, svo
          fjöldinn helst sá sami.
        </p>
      </>
    ),
  },
  {
    title: 'Af hverju klofnar meira?',
    glasses: dilution,
    equations: ['Ka = [H⁺][F⁻] / [HF]'],
    body: (
      <>
        <p>
          Þynning lækkar styrk allra efnanna jafnt. Teljarinn, [H⁺][F⁻], er margfeldi tveggja
          styrkja og lækkar því tvöfalt meira en nefnarinn, [HF]. Hvarfstuðullinn verður minni en K
          <sub>a</sub>, og kerfið jafnar það með því að kljúfa fleiri sameindir.
        </p>
        <p>
          K<sub>a</sub> sjálfur breytist ekki. Reiknaður út frá hverju glasi:{' '}
          {DILUTION.map((c, i) => (
            <span key={c}>
              {i > 0 && (i === DILUTION.length - 1 ? ' og ' : ', ')}
              {formatScientific(kaFromGlass(SCENE_ACID, c), 2)}
            </span>
          ))}
          . Sýrufastinn lýsir sýrunni; klofnunarhlutfallið lýsir lausninni.
        </p>
      </>
    ),
  },
  {
    title: 'Sterk sýra og veik',
    glasses: [
      { strong: true, c: C2 },
      { strong: false, c: C2 },
    ],
    equations: ['HCl(aq) → H⁺(aq) + Cl⁻(aq)', 'HF(aq) ⇌ H⁺(aq) + F⁻(aq)'],
    body: (
      <>
        <p>
          Bæði glösin eru {M(C2)}. Saltsýra er sterk sýra: hver einasta HCl-sameind klofnar, svo í
          glasinu eru {UNITS} H⁺ og {UNITS} Cl⁻ og engin óklofin sameind. pH ={' '}
          {formatDecimal(strongPH(C2), 2)}.
        </p>
        <p>
          Flússýra er veik: aðeins {ions(C2)} af {UNITS} hafa klofnað, og pH ={' '}
          {formatDecimal(weakPH(SCENE_ACID, C2), 2)}. Sami styrkur, sami fjöldi sameinda, en rúmlega
          tífalt færri H⁺. K<sub>a</sub> segir hversu mikið veik sýra klofnar. Sýrufasti sterkrar
          sýru er svo stór að hún klofnar öll.
        </p>
      </>
    ),
  },
];
