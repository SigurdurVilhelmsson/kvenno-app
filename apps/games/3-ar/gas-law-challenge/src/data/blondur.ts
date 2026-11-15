/**
 * The eight problems of "Gasblöndur og efnahvörf", every one from the book's module on gas
 * mixtures and gas stoichiometry, ch. 9, m68752, and named there.
 *
 * Nothing here is typed as an answer: each problem is built from its stated quantities by
 * `engine/blondur.ts`, and so is each worked step and each slip (a wrong answer the feedback
 * can name). Molar masses come from the shared atomic masses.
 *
 * Two of the book's answers differ from ours in the last figure, both within the 1 % the
 * screen grades to: 1,137 atm (it takes K = °C + 273,15; the game's rule is + 273, which gives
 * 1,136) and the dry oxygen's 0,537 L (0,560 × (764 − 30,0)/764 = 0,538).
 */

import { formatDecimal, formatScientific, molarMassOf } from '@shared/utils';

import {
  TORR_PER_ATM,
  kelvin,
  moleFractions,
  pressureOf,
  volumeOf,
  waterVapourTorr,
} from '../engine/blondur';

export type BlondurTopic = 'dalton' | 'molbrot' | 'vatn' | 'hlutfoll';

export interface BlondurSlip {
  /** The value a student who made this mistake would get. */
  value: number;
  /** What went wrong, said to the student. */
  text: string;
}

export interface BlondurProblem {
  id: string;
  topic: BlondurTopic;
  name: string;
  /** The situation, in a sentence or two. */
  setting: string;
  /** The quantities given, one per line. */
  given: string[];
  /** What to calculate. */
  question: string;
  /** The answer's unit, as printed beside the field. */
  unit: string;
  answer: number;
  /** The answer as the solution prints it, where three figures would hide a stated digit. */
  answerText?: string;
  /** The worked solution, one line per step. */
  steps: string[];
  slips: BlondurSlip[];
  /** Where in the book. */
  source: string;
}

/** A value to three significant figures, plain below 1000 and in standard form above. */
export function fig3(value: number): string {
  if (value === 0) return '0';
  if (Math.abs(value) >= 1000) return formatScientific(value, 3);
  const rounded = Number(value.toPrecision(3));
  const decimals = Math.max(0, 2 - Math.floor(Math.log10(Math.abs(rounded))));
  return formatDecimal(rounded, decimals);
}

/** The answer as printed: `answerText` where a problem sets it, else three figures. */
export function shownAnswer(p: BlondurProblem): string {
  return p.answerText ?? fig3(p.answer);
}

const d = formatDecimal;
const SOURCE = 'Kafli 9, „Hlutfallaefnafræði loftkenndra efna, blanda og efnahvarfa“';

const TEMP_SLIP = 'Hitastigið var notað í °C. Í PV = nRT er T alltaf í kelvinum: K = °C + 273.';

/** 1: Dalton's law, total pressure from three amounts. */
function heildarthrystingur(): BlondurProblem {
  const gases = [
    { f: 'N₂', n: 0.0388 },
    { f: 'CO', n: 0.147 },
    { f: 'H₂', n: 0.0803 },
  ];
  const V = 5.73;
  const c = 25;
  const T = kelvin(c);
  const nTotal = gases.reduce((a, g) => a + g.n, 0);
  const answer = pressureOf(nTotal, V, T);
  return {
    id: 'heildarthrystingur',
    topic: 'dalton',
    name: 'Þrjár lofttegundir í einni flösku',
    setting: 'Flaska inniheldur nitur, kolmónoxíð og vetni.',
    given: [`V = ${d(V)} L, t = ${c} °C`, ...gases.map((g) => `${d(g.n)} mól ${g.f}`)],
    question: 'Hver er heildarþrýstingurinn í flöskunni?',
    unit: 'atm',
    answer,
    steps: [
      `Lögmál Daltons: hver lofttegund þrýstir eins og hún væri ein, svo P(heild) = n(heild)·RT/V.`,
      `n(heild) = ${gases.map((g) => d(g.n)).join(' + ')} = ${d(Number(nTotal.toFixed(4)))} mól`,
      `T = ${c} + 273 = ${T} K`,
      `P(heild) = ${d(Number(nTotal.toFixed(4)))} × 0,08206 × ${T} / ${d(V)} = ${fig3(answer)} atm`,
    ],
    slips: [{ value: pressureOf(nTotal, V, c), text: TEMP_SLIP }],
    source: `${SOURCE}, „Skoðaðu þekkingu þína“ eftir fyrra dæmið um þrýsting gasblöndu`,
  };
}

/** 2: mole fraction and partial pressure. */
function svaefingargas(): BlondurProblem {
  const nO2 = 2.83;
  const nN2O = 8.41;
  const P = 192;
  const [xO2, xN2O] = moleFractions([nO2, nN2O]);
  const answer = xO2 * P;
  return {
    id: 'svaefingargas',
    topic: 'molbrot',
    name: 'Svæfingargas',
    setting: 'Gasblanda sem notuð er við svæfingu inniheldur súrefni og glaðloft, N₂O.',
    given: [`${d(nO2)} mól O₂`, `${d(nN2O)} mól N₂O`, `P(heild) = ${P} kPa`],
    question: 'Hver er hlutþrýstingur súrefnisins?',
    unit: 'kPa',
    answer,
    steps: [
      `n(heild) = ${d(nO2)} + ${d(nN2O)} = ${d(nO2 + nN2O)} mól`,
      `X(O₂) = ${d(nO2)} / ${d(nO2 + nN2O)} = ${d(Number(xO2.toFixed(3)), 3)}`,
      `P(O₂) = X(O₂) · P(heild) = ${d(Number(xO2.toFixed(3)), 3)} × ${P} = ${fig3(answer)} kPa`,
    ],
    slips: [
      {
        value: xN2O * P,
        text: 'Þetta er hlutþrýstingur glaðloftsins, N₂O. Spurt var um súrefnið.',
      },
      {
        value: (nO2 / nN2O) * P,
        text: 'Mólbrot er mól efnisins deilt með heildarmólfjölda, ekki með mólum hinnar lofttegundarinnar.',
      },
    ],
    source: `${SOURCE}, síðara dæmið um þrýsting gasblöndu`,
  };
}

/** 3: Dalton's law from masses. */
function massablanda(): BlondurProblem {
  const gases = [
    { f: 'H₂', m: 0.2, digits: 3 },
    { f: 'N₂', m: 1.0, digits: 2 },
    { f: 'Ar', m: 0.82, digits: 3 },
  ];
  const V = 2.0;
  const c = 20;
  const T = kelvin(c);
  const moles = gases.map((g) => g.m / molarMassOf(g.f));
  const nTotal = moles.reduce((a, b) => a + b, 0);
  const answer = pressureOf(nTotal, V, T);
  // A student who takes hydrogen's molar mass as 1,008 (H, not H₂) doubles its moles.
  const atomicH = nTotal + moles[0];
  return {
    id: 'massablanda',
    topic: 'dalton',
    name: 'Blanda gefin í grömmum',
    setting: 'Vetni, nitur og argon eru saman í lokuðu íláti.',
    given: [`V = ${d(V, 2)} L, t = ${c} °C`, ...gases.map((g) => `${d(g.m, g.digits)} g ${g.f}`)],
    question: 'Hver er heildarþrýstingurinn í ílátinu?',
    unit: 'atm',
    answer,
    steps: [
      ...gases.map(
        (g, i) =>
          `n(${g.f}) = ${d(g.m, g.digits)} g / ${d(molarMassOf(g.f), 3)} g/mól = ${d(Number(moles[i].toFixed(4)), 4)} mól`
      ),
      `n(heild) = ${d(Number(nTotal.toFixed(4)), 4)} mól, T = ${c} + 273 = ${T} K`,
      `P(heild) = ${d(Number(nTotal.toFixed(4)), 4)} × 0,08206 × ${T} / ${d(V, 2)} = ${fig3(answer)} atm`,
    ],
    slips: [
      {
        value: pressureOf(atomicH, V, T),
        text: 'Vetnisgas er H₂, svo mólmassi þess er 2,016 g/mól, ekki 1,008.',
      },
      { value: pressureOf(nTotal, V, c), text: TEMP_SLIP },
    ],
    source: `${SOURCE}, „Skoðaðu þekkingu þína“ eftir síðara dæmið um þrýsting gasblöndu`,
  };
}

/** 4: gas collected over water, its partial pressure. */
function argonYfirVatni(): BlondurProblem {
  const P = 750;
  const c = 26;
  const water = waterVapourTorr(c);
  const answer = P - water;
  return {
    id: 'argon-yfir-vatni',
    topic: 'vatn',
    name: 'Argoni safnað yfir vatni',
    setting:
      'Argoni er safnað í flösku yfir vatni, og vatnsborðið er jafnað svo þrýstingurinn í flöskunni er sá sami og loftþrýstingurinn.',
    given: [
      `P(heild) = ${P} torr, t = ${c} °C`,
      `Gufunarþrýstingur vatns við ${c} °C: ${d(water, 1)} torr`,
    ],
    question: 'Hver er hlutþrýstingur argonsins í flöskunni?',
    unit: 'torr',
    answer,
    answerText: d(answer, 1),
    steps: [
      'Í flöskunni er argon og vatnsgufa, svo P(heild) = P(Ar) + P(H₂O).',
      `P(Ar) = ${P} − ${d(water, 1)} = ${d(answer, 1)} torr`,
    ],
    slips: [
      {
        value: P,
        text: 'Flaskan geymir líka vatnsgufu. Dragðu gufunarþrýsting vatns frá heildarþrýstingnum.',
      },
      {
        value: P + water,
        text: 'Gufunarþrýstingurinn var lagður við. Heildarþrýstingurinn er summa beggja, svo argonið er heildin mínus vatnsgufan.',
      },
    ],
    source: `${SOURCE}, dæmið um þrýsting gass sem safnað er yfir vatni`,
  };
}

/** 5: gas collected over water, its dry volume. */
function thurtSurefni(): BlondurProblem {
  const P = 764;
  const c = 29;
  const V = 0.56;
  const water = waterVapourTorr(c);
  const dry = P - water;
  const answer = (V * dry) / P;
  return {
    id: 'thurt-surefni',
    topic: 'vatn',
    name: 'Þurrt súrefni',
    setting: 'Súrefni er safnað yfir vatni. Hvað tæki súrefnið eitt mikið pláss, án vatnsgufunnar?',
    given: [
      `V = ${d(V, 3)} L, P(heild) = ${P} torr, t = ${d(c, 1)} °C`,
      `Gufunarþrýstingur vatns við ${c} °C: ${d(water, 1)} torr`,
    ],
    question: `Hvert væri rúmmál þurra súrefnisins við ${P} torr og ${d(c, 1)} °C?`,
    unit: 'L',
    answer,
    steps: [
      `P(O₂) = ${P} − ${d(water, 1)} = ${d(dry, 1)} torr`,
      `Súrefnið eitt við ${P} torr: lögmál Boyles, V₂ = V₁ · P(O₂) / P(heild)`,
      `V₂ = ${d(V, 3)} × ${d(dry, 1)} / ${P} = ${fig3(answer)} L`,
    ],
    slips: [
      {
        value: V,
        text: 'Hluti rúmmálsins er vatnsgufa. Súrefnið eitt hefur hlutþrýstinginn P(heild) − P(H₂O), og við P(heild) tekur það minna pláss.',
      },
      {
        value: (V * P) / dry,
        text: 'Hlutfallið snerist við: þurrt gas við sama þrýsting tekur minna pláss, svo margfaldaðu með P(O₂)/P(heild).',
      },
    ],
    source: `${SOURCE}, „Prófaðu þekkingu þína“ eftir dæmið um gas yfir vatni`,
  };
}

/** 6: volume ratios at one T and P. */
function etylen(): BlondurProblem {
  const V = 17.0;
  const answer = 3 * V;
  return {
    id: 'etylen',
    topic: 'hlutfoll',
    name: 'Etýlen brennur',
    setting:
      'Etýlen brennur í súrefni og myndar koldíoxíð og vatnsgufu. Öll rúmmálin eru mæld við 25 °C og 760 torr.',
    given: ['C₂H₄(g) + 3 O₂(g) → 2 CO₂(g) + 2 H₂O(g)', `${d(V, 1)} L C₂H₄`],
    question: 'Hversu mikið rúmmál af súrefni þarf?',
    unit: 'L',
    answer,
    steps: [
      'Við sama hitastig og þrýsting er jafn fjöldi sameinda í jöfnu rúmmáli (Avogadro), svo rúmmálin fylgja stuðlunum.',
      `V(O₂) = ${d(V, 1)} L × 3/1 = ${d(answer, 1)} L`,
    ],
    slips: [
      { value: V, text: 'Rúmmálin fylgja stuðlunum: 3 O₂ á móti 1 C₂H₄.' },
      { value: 2 * V, text: 'Stuðullinn 2 tilheyrir CO₂ og H₂O. Súrefnið hefur stuðulinn 3.' },
      { value: V / 3, text: 'Hlutfallið snerist við: þrisvar sinnum meira súrefni en etýlen.' },
    ],
    source: `${SOURCE}, „Prófaðu þekkingu þína“ eftir dæmið um rúmmál hvarfefna`,
  };
}

/** 7: grams of a solid to the volume of a gas made. */
function gallin(): BlondurProblem {
  const m = 8.88;
  const c = 27;
  const torr = 723;
  const T = kelvin(c);
  const P = torr / TORR_PER_ATM;
  const nGa = m / molarMassOf('Ga');
  const nH2 = (nGa * 3) / 2;
  const answer = volumeOf(nH2, T, P);
  return {
    id: 'gallin',
    topic: 'hlutfoll',
    name: 'Vetni úr gallíni',
    setting: 'Gallín hvarfast við umframmagn af saltsýru og vetni myndast.',
    given: [
      '2 Ga(s) + 6 HCl(aq) → 2 GaCl₃(aq) + 3 H₂(g)',
      `${d(m, 2)} g Ga`,
      `Vetnið við ${c} °C og ${torr} torr`,
    ],
    question: 'Hversu mikið rúmmál af vetni myndast?',
    unit: 'L',
    answer,
    steps: [
      `n(Ga) = ${d(m, 2)} g / ${d(molarMassOf('Ga'), 2)} g/mól = ${d(Number(nGa.toFixed(4)), 4)} mól`,
      `n(H₂) = ${d(Number(nGa.toFixed(4)), 4)} × 3/2 = ${d(Number(nH2.toFixed(4)), 4)} mól`,
      `T = ${c} + 273 = ${T} K, P = ${torr} / 760 = ${d(Number(P.toFixed(4)), 4)} atm`,
      `V = nRT/P = ${d(Number(nH2.toFixed(4)), 4)} × 0,08206 × ${T} / ${d(Number(P.toFixed(4)), 4)} = ${fig3(answer)} L`,
    ],
    slips: [
      {
        value: volumeOf(nGa, T, P),
        text: 'Mólin af gallíni eru ekki mólin af vetni: 2 Ga gefa 3 H₂, svo margfaldaðu með 3/2.',
      },
      {
        value: volumeOf(nH2, T, torr),
        text: 'Þrýstingurinn var notaður í torr. Með R = 0,08206 L·atm/(mól·K) þarf hann í atm: deildu með 760.',
      },
      { value: volumeOf(nH2, c, P), text: TEMP_SLIP },
    ],
    source: `${SOURCE}, dæmið um rúmmál myndefnis í gasformi`,
  };
}

/** 8: a kilogram of sulfur burned. */
function brennisteinn(): BlondurProblem {
  const kg = 1.0;
  const c = 343;
  const P = 1.21;
  const T = kelvin(c);
  const nS = (kg * 1000) / molarMassOf('S');
  const answer = volumeOf(nS, T, P);
  return {
    id: 'brennisteinn',
    topic: 'hlutfoll',
    name: 'Brennisteinsdíoxíð í brennisteinssýruverksmiðju',
    setting:
      'Brennisteinsdíoxíð er milliefni við framleiðslu brennisteinssýru. Brennisteinn brennur í umframmagni af súrefni.',
    given: ['S(s) + O₂(g) → SO₂(g)', `${d(kg, 2)} kg S`, `SO₂ við ${c} °C og ${d(P, 2)} atm`],
    question: 'Hversu mikið rúmmál af SO₂ myndast?',
    unit: 'L',
    answer,
    steps: [
      `n(S) = 1000 g / ${d(molarMassOf('S'), 2)} g/mól = ${d(Number(nS.toFixed(2)), 2)} mól`,
      `n(SO₂) = n(S) = ${d(Number(nS.toFixed(2)), 2)} mól (1 : 1)`,
      `T = ${c} + 273 = ${T} K`,
      `V = ${d(Number(nS.toFixed(2)), 2)} × 0,08206 × ${T} / ${d(P, 2)} = ${fig3(answer)} L`,
    ],
    slips: [
      {
        value: volumeOf(nS / 1000, T, P),
        text: 'Massinn var notaður sem 1,00 g. Eitt kílógramm er 1000 g.',
      },
      { value: volumeOf(nS, c, P), text: TEMP_SLIP },
    ],
    source: `${SOURCE}, „Prófaðu þekkingu þína“ eftir dæmið um rúmmál myndefnis`,
  };
}

export const BLONDUR_PROBLEMS: readonly BlondurProblem[] = [
  heildarthrystingur(),
  svaefingargas(),
  massablanda(),
  argonYfirVatni(),
  thurtSurefni(),
  etylen(),
  gallin(),
  brennisteinn(),
];

/** Kanna's flask: three gases in 10,0 L at 25 °C. */
export const KANNA = {
  volume: 10.0,
  celsius: 25,
  gases: [
    { formula: 'N₂', name: 'Nitur', colour: '#3b82f6', start: 0.2 },
    { formula: 'O₂', name: 'Súrefni', colour: '#ef4444', start: 0.1 },
    { formula: 'Ar', name: 'Argon', colour: '#a855f7', start: 0.05 },
  ],
  maxMoles: 0.4,
  step: 0.01,
} as const;
