import type { ReactNode } from 'react';

import { formatDecimal, formatScientific } from '@shared/utils';

import {
  C_ACID,
  C_BASE,
  KA,
  KB,
  KW,
  N_ACID,
  PKA,
  V_ACID,
  V_EQ,
  V_HALF,
  pHAt,
  particleCountsAt,
  percentIonised,
  speciesAt,
  trueMinorParticles,
} from '../utils/agnasyn';

/**
 * Agnasýn's scenes, in the order a titration runs. Every number on them is
 * computed from `utils/agnasyn.ts`, so a scene cannot print a pH the curve
 * beside it does not reach.
 */

export interface Step {
  title: string;
  /** mL of NaOH at the end of the scene. */
  volume: number;
  /** Whether the NaOH arrives as drops from the previous scene's volume. */
  drip: boolean;
  /** Show the NaOH dissolving beside the flask. */
  dissolve?: boolean;
  equations: ReactNode[];
  body: ReactNode;
  /** The exaggeration note, when the scene draws a flagged pair. */
  note?: ReactNode;
}

/** An equation that breaks only at its arrow, so a phone never splits a species. */
function Eq({ left, arrow, right }: { left: ReactNode; arrow: string; right: ReactNode }) {
  return (
    <>
      <span className="whitespace-nowrap">{left}</span>{' '}
      <span className="whitespace-nowrap">
        {arrow} {right}
      </span>
    </>
  );
}

const ph = (v: number) => formatDecimal(pHAt(v), 2);
const mL = (v: number) => formatDecimal(v, 2);
const sci = (x: number) => formatScientific(x, 2);

/** Henderson-Hasselbalch's pH from the particle counts of a volume. */
export function hhPH(v: number): number {
  const c = particleCountsAt(v);
  return PKA + Math.log10(c.A / c.HA);
}

/** The first buffer scene: five drops, so the ratio is 5 to 15. */
export const FIRST_BUFFER_ML = 5 * 1.25;

/** Henderson-Hasselbalch with the particle counts of a volume put in. */
function hh(v: number): ReactNode {
  const c = particleCountsAt(v);
  return (
    <>
      pH = pK<sub>a</sub> + log
      <span className="whitespace-nowrap">([CH₃COO⁻]/[CH₃COOH])</span>{' '}
      <span className="whitespace-nowrap">
        = {formatDecimal(PKA, 2)} + log({c.A}/{c.HA})
      </span>{' '}
      <span className="whitespace-nowrap">= {formatDecimal(hhPH(v), 2)}</span>
    </>
  );
}

const eqS = speciesAt(V_EQ);
const after = 35;
const afterS = speciesAt(after);

export const STEPS: Step[] = [
  {
    title: 'Ediksýra í vatni',
    volume: 0,
    drip: false,
    equations: [
      <Eq left="CH₃COOH(aq)" arrow="⇌" right="CH₃COO⁻(aq) + H⁺(aq)" />,
      <>
        K<sub>a</sub> = <span className="whitespace-nowrap">[CH₃COO⁻][H⁺] / [CH₃COOH]</span>{' '}
        <span className="whitespace-nowrap">= {sci(KA)}</span>
      </>,
    ],
    body: (
      <>
        <p>
          Í keiluflöskunni eru {formatDecimal(V_ACID, 1)} mL af {formatDecimal(C_ACID, 3)} M
          ediksýru. Ediksýra er veik sýra: aðeins um {formatDecimal(percentIonised(), 1)} %
          sameindanna klofna í CH₃COO⁻ og H⁺, svo langflestar agnirnar eru óklofnar
          CH₃COOH-sameindir. Jafnvægið liggur langt til vinstri, eins og lítið K<sub>a</sub> segir
          til um.
        </p>
        <p>
          Jafnvægið er virkt: sameindir klofna og jónir sameinast aftur í sífellu, en hlutföllin
          haldast þau sömu.
        </p>
        <p>
          pH = −log √(K<sub>a</sub> · C) = {ph(0)}
        </p>
      </>
    ),
    note: (
      <>
        Í réttu hlutfalli væri aðeins {formatDecimal(trueMinorParticles(0), 2)} af H⁺-jón á móti 20
        sameindum, sem sæist ekki. Við sýnum eina CH₃COO⁻ og eina H⁺ með strikahring.
      </>
    ),
  },
  {
    title: 'NaOH leysist upp',
    volume: 0,
    drip: false,
    dissolve: true,
    equations: [<Eq left="NaOH(s)" arrow="→" right="Na⁺(aq) + OH⁻(aq)" />],
    body: (
      <>
        <p>
          Í búrettunni er {formatDecimal(C_BASE, 3)} M NaOH. Natríumhýdroxíð er sterkur basi og
          jónast að fullu í vatni: hver NaOH-eining verður að einni Na⁺-jón og einni OH⁻-jón.
        </p>
        <p>
          <strong>Na⁺ er meðjón.</strong> Hún hvarfast hvorki við ediksýru, asetatjónir né vatn og
          hefur engin áhrif á pH. Hún er samt í lausninni, ein Na⁺ fyrir hverja OH⁻ sem bætt er við,
          og er því sýnd í daufum gráum lit héðan í frá.
        </p>
      </>
    ),
  },
  {
    title: 'OH⁻ hvarfast við ediksýru',
    volume: FIRST_BUFFER_ML,
    drip: true,
    equations: [
      <Eq
        left={
          <>
            CH₃COOH + <s className="text-warm-400">Na⁺</s> + OH⁻
          </>
        }
        arrow="→"
        right={
          <>
            CH₃COO⁻ + <s className="text-warm-400">Na⁺</s> + H₂O
          </>
        }
      />,
      <Eq left="CH₃COOH(aq) + OH⁻(aq)" arrow="→" right="CH₃COO⁻(aq) + H₂O(l)" />,
    ],
    body: (
      <>
        <p>
          Efri jafnan er heildarjónajafna. Na⁺ stendur óbreytt báðum megin, svo hún styttist út og
          eftir stendur nettójónajafnan.
        </p>
        <p>
          OH⁻ er sterkur basi og tekur róteind af CH₃COOH. Hvarfið gengur nær alveg til enda (K = K
          <sub>a</sub>/K<sub>w</sub> = {sci(KA / KW)}), svo hver OH⁻ sem bætt er við breytir einni
          CH₃COOH í eina CH₃COO⁻. Þær fáu H⁺-jónir sem voru í lausninni hverfa líka.
        </p>
        <p>
          Nú eru bæði CH₃COOH og samoka basi hennar, CH₃COO⁻, í lausninni í mælanlegu magni: lausnin
          er orðin stuðpúði. Agnirnar eru allar í sama rúmmáli, svo hlutfall styrkjanna er hlutfall
          agnanna:
        </p>
        <p>{hh(FIRST_BUFFER_ML)}</p>
      </>
    ),
  },
  {
    title: 'Hálfjafngildispunktur',
    volume: V_HALF,
    drip: true,
    equations: [
      <Eq left="CH₃COOH(aq) + OH⁻(aq)" arrow="→" right="CH₃COO⁻(aq) + H₂O(l)" />,
      <>
        pH = pK<sub>a</sub> + log(1) = pK<sub>a</sub>
      </>,
    ],
    body: (
      <>
        <p>
          Eftir {mL(V_HALF)} mL hefur helmingi sýrunnar verið breytt í samoka basa hennar.
          CH₃COOH-sameindirnar og CH₃COO⁻-jónirnar eru jafnmargar.
        </p>
        <p>{hh(V_HALF)}</p>
        <p>
          <strong>
            Við hálfjafngildispunkt er pH = pK<sub>a</sub>.
          </strong>{' '}
          Þannig má lesa K<sub>a</sub> veikrar sýru af títrunarferli: K<sub>a</sub> = 10
          <sup>−{formatDecimal(PKA, 2)}</sup> = {sci(KA)}.
        </p>
        <p className="text-sm text-warm-600">
          pH-mælirinn sýnir {ph(V_HALF)}. Henderson-Hasselbalch gerir ráð fyrir að CH₃COOH klofni
          ekkert í stuðpúðanum; örlítil klofnun hækkar pH um {formatDecimal(pHAt(V_HALF) - PKA, 4)},
          sem sést aðeins í öðrum aukastaf.
        </p>
        <p>
          Ferillinn er flatastur hér. Stuðpúðinn stenst pH-breytingar best þegar jafnmikið er af
          sýrunni og samoka basanum: OH⁻ sem bætt er við breytir hlutfallinu minnst.
        </p>
      </>
    ),
  },
  {
    title: 'Stuðpúðinn tæmist',
    volume: 16 * 1.25,
    drip: true,
    equations: [<Eq left="CH₃COOH(aq) + OH⁻(aq)" arrow="→" right="CH₃COO⁻(aq) + H₂O(l)" />],
    body: (
      <>
        <p>
          Hver OH⁻ breytir enn einni CH₃COOH í CH₃COO⁻. Nú eru CH₃COO⁻-jónirnar orðnar fleiri en
          CH₃COOH-sameindirnar:
        </p>
        <p>{hh(20)}</p>
        <p>
          pH hækkar hægt meðan nóg er eftir af CH₃COOH til að taka við OH⁻. Þegar fáar sameindir eru
          eftir breytir hver dropi hlutfallinu mikið og ferillinn fer að rísa hratt.
        </p>
      </>
    ),
  },
  {
    title: 'Jafngildispunktur',
    volume: V_EQ,
    drip: true,
    equations: [
      <Eq left="CH₃COO⁻(aq) + H₂O(l)" arrow="⇌" right="CH₃COOH(aq) + OH⁻(aq)" />,
      <>
        K<sub>b</sub> = K<sub>w</sub> / K<sub>a</sub> ={' '}
        <span className="whitespace-nowrap">
          {sci(KW)} / {sci(KA)}
        </span>{' '}
        <span className="whitespace-nowrap">= {sci(KB)}</span>
      </>,
    ],
    body: (
      <>
        <p>
          Eftir {mL(V_EQ)} mL er mólfjöldi OH⁻ sem bætt hefur verið við jafn mólfjölda ediksýrunnar
          í upphafi ({formatDecimal(N_ACID, 2)} mmól). Öll CH₃COOH hefur hvarfast og eftir eru
          CH₃COO⁻ og Na⁺ í vatni: natríumasetatlausn.
        </p>
        <p>
          <strong>Af hverju er pH yfir 7?</strong> Asetatjónin er samoka basi veikrar sýru og þar
          með veikur basi. Hún tekur róteind frá vatni og myndar OH⁻ (basajónun asetats). Na⁺ hefur
          engin slík áhrif. Því er lausnin basísk:
        </p>
        <p>
          Rúmmálið er orðið {formatDecimal(eqS.totalVolume, 1)} mL, svo [CH₃COO⁻] ={' '}
          {formatDecimal(eqS.conc.A, 4)} M.
          <br />
          <span className="whitespace-nowrap">
            [OH⁻] = √(K<sub>b</sub> · C)
          </span>{' '}
          <span className="whitespace-nowrap">= {sci(eqS.conc.OH)} M,</span>{' '}
          <span className="whitespace-nowrap">pOH = {formatDecimal(14 - pHAt(V_EQ), 2)},</span>{' '}
          <span className="whitespace-nowrap">pH = {ph(V_EQ)}</span>
        </p>
        <p>
          Væri sýran sterk, til dæmis HCl, væri pH 7,00 hér, því Cl⁻ er ekki basi og tekur ekki
          róteind frá vatni.
        </p>
      </>
    ),
    note: (
      <>
        Í réttu hlutfalli væri ein OH⁻ á móti um {Math.round(eqS.conc.A / eqS.conc.OH / 100) * 100}{' '}
        asetatjónum, aðeins {formatDecimal(trueMinorParticles(V_EQ), 3)} af ögn hér. Við sýnum eina
        CH₃COOH og eina OH⁻ með strikahring.
      </>
    ),
  },
  {
    title: 'Eftir jafngildispunkt',
    volume: after,
    drip: true,
    equations: [
      <>
        n(OH⁻)<sub>umfram</sub> = n(NaOH) − n(CH₃COOH)<sub>0</sub>
      </>,
    ],
    body: (
      <>
        <p>
          Nú er engin CH₃COOH eftir til að taka við OH⁻. Hver OH⁻ sem bætt er við safnast upp í
          lausninni og pH rýkur upp.
        </p>
        <p>
          Umfram OH⁻ hliðrar jafnvægi asetatjónarinnar (CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻) til vinstri,
          svo framlag hennar verður hverfandi. pH ræðst nær eingöngu af umfram OH⁻:
        </p>
        <p>
          <span className="whitespace-nowrap">
            [OH⁻] = ({formatDecimal(after * C_BASE, 2)} − {formatDecimal(N_ACID, 2)}) mmól
          </span>{' '}
          <span className="whitespace-nowrap">
            / {formatDecimal(afterS.totalVolume, 1)} mL = {formatDecimal(afterS.conc.OH, 4)} M,
          </span>{' '}
          <span className="whitespace-nowrap">pH = {ph(after)}</span>
        </p>
        <p>
          Hér líkist ferillinn títrunarferli sterkrar sýru: allt ræðst af því hve miklu af sterkum
          basa hefur verið bætt við umfram.
        </p>
      </>
    ),
  },
];
