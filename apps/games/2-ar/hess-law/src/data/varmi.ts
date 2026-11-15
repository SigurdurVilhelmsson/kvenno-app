/**
 * The ten problems of "Varmamælingar og tengjaorka", every one from the book and named there:
 * q = m·c·ΔT from ch05/m68724, calorimetry from ch05/m68726 and bond energies from ch07/m68741.
 *
 * Nothing here is typed as an answer: each is built from its stated quantities by
 * `engine/varmi.ts`, and so is each worked step and each slip (a wrong answer the feedback can
 * name). Where the book rounds harder than the 1 % the screen grades to (2,9 kJ for the
 * neutralisation), the game shows three figures.
 */

import { formatDecimal } from '@shared/utils';

import {
  BOND_ENERGY,
  SPECIFIC_HEAT,
  bondEnthalpy,
  finalTemperature,
  heat,
  type Bond,
} from '../engine/varmi';

export type VarmiTopic = 'mcdt' | 'varmamaelir' | 'tengi';

export interface VarmiSlip {
  value: number;
  text: string;
}

export interface VarmiProblem {
  id: string;
  topic: VarmiTopic;
  name: string;
  setting: string;
  given: string[];
  question: string;
  unit: string;
  answer: number;
  /** The answer as printed. */
  answerText: string;
  steps: string[];
  slips: VarmiSlip[];
  source: string;
}

const d = formatDecimal;
/** A value to three significant figures, with a sign where it carries meaning. */
export function fig3(value: number, signed = false): string {
  const rounded = Number(value.toPrecision(3));
  const decimals = Math.max(0, 2 - Math.floor(Math.log10(Math.abs(rounded))));
  const text = formatDecimal(rounded, decimals);
  return signed && rounded > 0 ? `+${text}` : text;
}

const C_WATER = SPECIFIC_HEAT.vatn;
const SIGN_SLIP_REL =
  'Formerkið snýst við. Varmi sem lausnin tekur til sín kom frá hvarfinu: q(hvarf) = −q(lausn).';
const SRC_5_1 = 'Kafli 5, „Grundvallaratriði orku“';
const SRC_5_2 = 'Kafli 5, „Varmamælingar“';
const SRC_7_5 = 'Kafli 7, „Styrkur jóna- og samgildra tengja“';

function pan(): VarmiProblem {
  const m = 502;
  const c = SPECIFIC_HEAT.jarn;
  const dT = 250 - 25;
  const q = heat(m, c, dT);
  return {
    id: 'ponnu',
    topic: 'mcdt',
    name: 'Steypujárnspanna',
    setting: 'Steypujárnspanna er hituð á eldavél.',
    given: [`m = ${m} g`, `c(járn) = ${d(c, 3)} J/(g·°C)`, 'hitað úr 25 °C í 250 °C'],
    question: 'Hve mikinn varma þarf, í kJ?',
    unit: 'kJ',
    answer: q / 1000,
    answerText: fig3(q / 1000),
    steps: [
      `ΔT = 250 °C − 25 °C = ${dT} °C`,
      `q = m·c·ΔT = ${m} × ${d(c, 3)} × ${dT} = ${d(Math.round(q))} J`,
      `${d(Math.round(q))} J = ${fig3(q / 1000)} kJ`,
    ],
    slips: [{ value: q, text: 'Svarið er í júlum. Deildu með 1000 til að fá kJ.' }],
    source: `${SRC_5_1}, „Prófaðu þekkingu þína“ eftir dæmið Að mæla hita`,
  };
}

function unknownMetal(): VarmiProblem {
  const m = 217;
  const qJ = 1430;
  const dT = 39.1 - 24.5;
  const c = qJ / (m * dT);
  return {
    id: 'othekktur-malmur',
    topic: 'mcdt',
    name: 'Óþekktur málmur',
    setting: 'Málmhlutur tekur til sín varma og hitnar.',
    given: [`m = ${m} g`, `q = ${d(1.43, 2)} kJ`, 'hitnar úr 24,5 °C í 39,1 °C'],
    question: 'Hver er eðlisvarmi málmsins, í J/(g·°C)?',
    unit: 'J/(g·°C)',
    answer: c,
    answerText: fig3(c),
    steps: [
      `ΔT = 39,1 °C − 24,5 °C = ${d(dT, 1)} °C, og q = 1,43 kJ = ${qJ} J`,
      `c = q / (m·ΔT) = ${qJ} / (${m} × ${d(dT, 1)}) = ${fig3(c)} J/(g·°C)`,
      `Næst í töflunni er járn, ${d(SPECIFIC_HEAT.jarn, 3)} J/(g·°C).`,
    ],
    slips: [{ value: 1.43 / (m * dT), text: 'q var í kJ. Breyttu því í J áður en þú deilir.' }],
    source: `${SRC_5_1}, „Prófaðu þekkingu þína“ eftir dæmið Að ákvarða aðrar stærðir`,
  };
}

function rebar(): VarmiProblem {
  const mFe = 360.0;
  const mW = 425;
  const tW = 24.0;
  const tf = 42.7;
  const gained = heat(mW, C_WATER, tf - tW);
  const t0 = tf + gained / (mFe * SPECIFIC_HEAT.jarn);
  return {
    id: 'steypustyrktarjarn',
    topic: 'varmamaelir',
    name: 'Heit járnstöng í vatni',
    setting:
      'Stálstöng (eðlisvarmi eins og járns) er sett í vatn. Allur varminn fer á milli hennar og vatnsins.',
    given: [
      `m(stál) = ${d(mFe, 1)} g`,
      `${mW} mL vatn við ${d(tW, 1)} °C (1,0 g/mL)`,
      `lokahitastig ${d(tf, 1)} °C`,
    ],
    question: 'Hvert var upphafshitastig stangarinnar, í °C?',
    unit: '°C',
    answer: t0,
    answerText: fig3(t0),
    steps: [
      `Vatnið tekur til sín q = ${mW} × ${d(C_WATER, 3)} × (${d(tf, 1)} − ${d(tW, 1)}) = ${d(Math.round(gained))} J`,
      `Stöngin gefur jafnmikið frá sér: ${d(mFe, 1)} × ${d(SPECIFIC_HEAT.jarn, 3)} × (T − ${d(tf, 1)}) = ${d(Math.round(gained))} J`,
      `T = ${d(tf, 1)} + ${d(Math.round(gained))} / ${d(mFe * SPECIFIC_HEAT.jarn, 1)} = ${fig3(t0)} °C`,
    ],
    slips: [
      {
        value: tf - gained / (mFe * SPECIFIC_HEAT.jarn),
        text: 'Stöngin kólnaði, svo hún var heitari en lokahitastigið: bættu við, ekki draga frá.',
      },
    ],
    source: `${SRC_5_2}, dæmið Varmaflutningur milli efna með mismunandi hitastig`,
  };
}

function copper(): VarmiProblem {
  const bodies = [
    { massG: 248, c: SPECIFIC_HEAT.kopar, t: 314 },
    { massG: 390, c: C_WATER, t: 22.6 },
  ];
  const tf = finalTemperature(bodies);
  const capCu = 248 * SPECIFIC_HEAT.kopar;
  const capW = 390 * C_WATER;
  return {
    id: 'koparstykki',
    topic: 'varmamaelir',
    name: 'Koparstykki í vatni',
    setting: 'Heitu koparstykki er sleppt ofan í vatn. Allur varminn fer á milli þeirra.',
    given: [
      `248 g kopar við 314 °C, c = ${d(SPECIFIC_HEAT.kopar, 3)} J/(g·°C)`,
      '390 mL vatn við 22,6 °C (1,0 g/mL)',
    ],
    question: 'Hvert verður lokahitastigið, í °C?',
    unit: '°C',
    answer: tf,
    answerText: fig3(tf),
    steps: [
      'Varminn sem koparinn gefur frá sér er jafn varmanum sem vatnið tekur til sín, og bæði enda við sama hitastig T.',
      `${d(capCu, 1)} × (314 − T) = ${d(capW, 1)} × (T − 22,6)`,
      `T = (${d(capCu, 1)} × 314 + ${d(capW, 1)} × 22,6) / (${d(capCu, 1)} + ${d(capW, 1)}) = ${fig3(tf)} °C`,
    ],
    slips: [
      {
        value: (314 + 22.6) / 2,
        text: 'Meðaltal hitastiganna gildir aðeins ef varmarýmdin er jöfn. Vatnið hefur miklu meiri varmarýmd en koparinn.',
      },
    ],
    source: `${SRC_5_2}, seinna „Prófaðu þekkingu þína“ eftir dæmið Varmaflutningur milli efna`,
  };
}

function neutralisation(): VarmiProblem {
  const m = 100.0;
  const dT = 28.9 - 22.0;
  const qSol = heat(m, C_WATER, dT);
  const q = -qSol / 1000;
  return {
    id: 'hlutleysing',
    topic: 'varmamaelir',
    name: 'Sýra og basi í kaffibollavarmamæli',
    setting:
      '50,0 mL af 1,00 M HCl og 50,0 mL af 1,00 M NaOH, bæði við 22,0 °C, eru blönduð í kaffibollavarmamæli.',
    given: ['hámarkshitastig 28,9 °C', 'lausnin eins og vatn: 1,0 g/mL og c = 4,184 J/(g·°C)'],
    question: 'Hvert er q(hvarf), í kJ, með formerki?',
    unit: 'kJ',
    answer: q,
    answerText: fig3(q, true),
    steps: [
      `Massi lausnarinnar: 100,0 mL × 1,0 g/mL = ${d(m, 0)} g`,
      `q(lausn) = ${d(m, 0)} × ${d(C_WATER, 3)} × ${d(dT, 1)} = ${d(Math.round(qSol))} J`,
      `q(hvarf) = −q(lausn) = ${fig3(q, true)} kJ. Neikvætt: hvarfið er útvermið.`,
    ],
    slips: [
      { value: -q, text: SIGN_SLIP_REL },
      { value: q / 2, text: 'Báðar lausnirnar hitna: massinn er 100 g, ekki 50 g.' },
    ],
    source: `${SRC_5_2}, dæmið Varmi sem myndast við útvermið hvarf`,
  };
}

function kcl(): VarmiProblem {
  const m = 3.0 + 300;
  const dT = -1.05;
  const qSol = heat(m, C_WATER, dT);
  const q = -qSol / 1000;
  return {
    id: 'kcl',
    topic: 'varmamaelir',
    name: 'KCl leyst upp',
    setting: 'Kalíumklóríð er leyst upp í vatni í kaffibollavarmamæli og lausnin kólnar.',
    given: ['3,00 g KCl', '300 g vatn', 'hitastigið lækkar um 1,05 °C', 'c = 4,184 J/(g·°C)'],
    question: 'Hvert er q(hvarf) fyrir upplausnina, í kJ, með formerki?',
    unit: 'kJ',
    answer: q,
    answerText: fig3(q, true),
    steps: [
      `Massi lausnarinnar: 300 g + 3,00 g = ${d(m, 0)} g`,
      `q(lausn) = ${d(m, 0)} × ${d(C_WATER, 3)} × (−1,05) = ${d(Math.round(qSol))} J`,
      `q(hvarf) = −q(lausn) = ${fig3(q, true)} kJ. Jákvætt: upplausnin er innvermin og tekur varma úr vatninu.`,
    ],
    slips: [{ value: -q, text: SIGN_SLIP_REL }],
    source: `${SRC_5_2}, „Kannaðu þekkingu þína“ eftir dæmið Hitastreymi í skyndikælipoka`,
  };
}

function glucose(): VarmiProblem {
  const mW = 775;
  const cBomb = 893;
  const dT = 35.6 - 23.8;
  const qW = heat(mW, C_WATER, dT);
  const qB = cBomb * dT;
  const q = -(qW + qB) / 1000;
  return {
    id: 'glukosi',
    topic: 'varmamaelir',
    name: 'Glúkósi í sprengivarmamæli',
    setting: '3,12 g af glúkósa, C₆H₁₂O₆, er brennt í sprengivarmamæli.',
    given: [
      'hitastigið hækkar úr 23,8 °C í 35,6 °C',
      `${mW} g vatn, c = ${d(C_WATER, 3)} J/(g·°C)`,
      `varmarýmd sprengjunnar ${cBomb} J/°C`,
    ],
    question: 'Hvert er q(hvarf), í kJ, með formerki?',
    unit: 'kJ',
    answer: q,
    answerText: fig3(q, true),
    steps: [
      `ΔT = 35,6 − 23,8 = ${d(dT, 1)} °C`,
      `q(vatn) = ${mW} × ${d(C_WATER, 3)} × ${d(dT, 1)} = ${d(Math.round(qW))} J`,
      `q(sprengja) = ${cBomb} × ${d(dT, 1)} = ${d(Math.round(qB))} J`,
      `q(hvarf) = −(q(vatn) + q(sprengja)) = ${fig3(q, true)} kJ`,
    ],
    slips: [
      { value: -q, text: SIGN_SLIP_REL },
      {
        value: -qW / 1000,
        text: 'Sprengjan sjálf hitnar líka: bættu við varmanum sem hún tekur til sín.',
      },
    ],
    source: `${SRC_5_2}, dæmið Varmamæling með sprengivarmamæli`,
  };
}

const bonds = (list: readonly (readonly [Bond, number])[]) =>
  list.map(([b, n]) => `${n === 1 ? '' : `${n} × `}${BOND_ENERGY[b]}`).join(' + ');
const bondNames = (list: readonly (readonly [Bond, number])[]) =>
  list.map(([b, n]) => `${n === 1 ? 'eitt' : n} ${b}`).join(', ');

function bondProblem(
  id: string,
  name: string,
  equation: string,
  broken: readonly (readonly [Bond, number])[],
  formed: readonly (readonly [Bond, number])[],
  slips: VarmiSlip[],
  source: string
): VarmiProblem {
  const dH = bondEnthalpy(broken, formed);
  const used = [...new Set([...broken, ...formed].map(([b]) => b))];
  return {
    id,
    topic: 'tengi',
    name,
    setting: equation,
    given: used.map((b) => `D(${b}) = ${BOND_ENERGY[b]} kJ/mól`),
    question: 'Hvert er ΔH, í kJ, metið út frá tengjaorku?',
    unit: 'kJ',
    answer: dH,
    answerText: dH > 0 ? `+${dH}` : `${dH}`,
    steps: [
      `Rofin tengi: ${bondNames(broken)}. Mynduð tengi: ${bondNames(formed)}.`,
      `ΔH = Σ D(rofin) − Σ D(mynduð) = (${bonds(broken)}) − (${bonds(formed)})`,
      `ΔH = ${dH > 0 ? '+' : ''}${dH} kJ`,
    ],
    slips: [
      {
        value: -dH,
        text: 'Formerkið snýst við. Að rjúfa tengi kostar orku (+), að mynda tengi losar orku (−).',
      },
      ...slips,
    ],
    source,
  };
}

function hcl(): VarmiProblem {
  return bondProblem(
    'hcl',
    'Vetnisklóríð myndast',
    'H₂(g) + Cl₂(g) → 2HCl(g)',
    [
      ['H–H', 1],
      ['Cl–Cl', 1],
    ],
    [['H–Cl', 2]],
    [
      {
        value: bondEnthalpy(
          [
            ['H–H', 1],
            ['Cl–Cl', 1],
          ],
          [['H–Cl', 1]]
        ),
        text: 'Tvær HCl-sameindir myndast, svo tvö H–Cl-tengi.',
      },
    ],
    `${SRC_7_5}, dæmið um myndun HCl`
  );
}

function methanol(): VarmiProblem {
  const formed = [
    ['C–H', 3],
    ['C–O', 1],
    ['O–H', 1],
  ] as const;
  return bondProblem(
    'metanol',
    'Metanól úr kolmónoxíði og vetni',
    'CO(g) + 2H₂(g) → CH₃OH(g)',
    [
      ['C≡O', 1],
      ['H–H', 2],
    ],
    formed,
    [
      {
        value: bondEnthalpy(
          [
            ['C=O', 1],
            ['H–H', 2],
          ],
          formed
        ),
        text: 'Í kolmónoxíði er þrítengi milli C og O, ekki tvítengi: notaðu D(C≡O).',
      },
    ],
    `${SRC_7_5}, dæmið um að reikna áætlaðar vermibreytingar út frá tengjaorku`
  );
}

function ethanol(): VarmiProblem {
  const formed = [
    ['C–C', 1],
    ['C–H', 1],
    ['C–O', 1],
  ] as const;
  return bondProblem(
    'etanol',
    'Etanól úr etýleni og vatni',
    'C₂H₄(g) + H₂O(g) → CH₃CH₂OH(g)',
    [
      ['C=C', 1],
      ['O–H', 1],
    ],
    formed,
    [
      {
        value: bondEnthalpy(
          [
            ['C–C', 1],
            ['O–H', 1],
          ],
          formed
        ),
        text: 'Í etýleni er tvítengi milli kolefnisatómanna: það er D(C=C) sem rofnar.',
      },
    ],
    `${SRC_7_5}, „Kannaðu þekkingu þína“ eftir dæmið um metanól`
  );
}

export const VARMI_PROBLEMS: VarmiProblem[] = [
  pan(),
  unknownMetal(),
  rebar(),
  copper(),
  neutralisation(),
  kcl(),
  glucose(),
  hcl(),
  methanol(),
  ethanol(),
];

/** The ungraded Kanna: a hot metal dropped into water. */
export const KANNA_METALS: { id: keyof typeof SPECIFIC_HEAT; name: string }[] = [
  { id: 'al', name: 'Ál' },
  { id: 'jarn', name: 'Járn' },
  { id: 'kopar', name: 'Kopar' },
  { id: 'bly', name: 'Blý' },
];
