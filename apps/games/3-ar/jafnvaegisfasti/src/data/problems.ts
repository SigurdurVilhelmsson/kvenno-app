/**
 * The problems Jafnvægisfastinn serves.
 *
 * **No answer is written down.** A problem names a reaction and the numbers a
 * student would be handed; the engine derives the expression, the quotient,
 * the extent and every ICE row. The same discipline as `1-ar/reynsluformulur`
 * and `3-ar/leysnijafnvaegi`, and for the same reason: `buffer-recipe-creator`
 * stored its Level 2 answers beside the data they came from and 13 of 29
 * disagreed with themselves, marking correct students wrong on three of the
 * six problems it served.
 */

import {
  canConvertToKp,
  deltaNGas,
  directionFromQ,
  iceTable,
  kcToKp,
  kpExpression,
  reactionQuotient,
  type Amounts,
  type Direction,
  type IceResult,
  type Reaction,
} from '@shared/engine/equilibrium';

import { REACTIONS, reactionBy } from './reactions';

export type Difficulty = 'ledd' | 'mid' | 'thung';

/** "Write the expression for this reaction." */
export interface ExpressionProblem {
  id: string;
  reaction: Reaction;
  difficulty: Difficulty;
  /** What the student should notice — the reason this one is in the set. */
  point: string;
}

export const EXPRESSION_PROBLEMS: ExpressionProblem[] = [
  {
    id: 'ozon',
    reaction: reactionBy('ozon'),
    difficulty: 'ledd',
    point: 'Stuðlarnir verða veldisvísar. Ekkert annað gerist hér.',
  },
  {
    id: 'ammoniak',
    reaction: reactionBy('ammoniak'),
    difficulty: 'ledd',
    point: 'Tvö hvarfefni, svo nefnarinn er margfeldi — ekki summa.',
  },
  {
    id: 'ammoniakbruni',
    reaction: reactionBy('ammoniakbruni'),
    difficulty: 'mid',
    point: 'Fjögur efni og stórir stuðlar. Sama regla, meiri bókhald.',
  },
  {
    id: 'kalksteinn',
    reaction: reactionBy('kalksteinn'),
    difficulty: 'thung',
    point:
      'Bæði föstu efnin detta út. Eftir stendur einn liður í nefnaranum og talan 1 í teljaranum.',
  },
  {
    id: 'kolefnistvisulfid-fast',
    reaction: reactionBy('kolefnistvisulfid-fast'),
    difficulty: 'thung',
    point: 'Kolefnið er fast efni og dettur út; brennisteinsgufan er gas og situr eftir.',
  },
  {
    id: 'brom',
    reaction: reactionBy('brom'),
    difficulty: 'thung',
    point:
      'Sama efnið beggja vegna, í sitt hvorum fasa. Vökvinn dettur út og K er einfaldlega gufuþrýstingurinn.',
  },
  {
    id: 'blyklorid',
    reaction: reactionBy('blyklorid'),
    difficulty: 'thung',
    point:
      'Saltið er fast og dettur út, svo K er margfeldi jónastyrkjanna — þetta er leysnimargfeldið úr Leysnijafnvægi, komið úr hinni áttinni.',
  },
];

/** "Here is a mixture and here is K — which way does it run?" */
export interface DirectionProblem {
  id: string;
  reaction: Reaction;
  difficulty: Difficulty;
  amounts: Amounts;
  context: string;
  /** Derived. */
  q: number;
  k: number;
  direction: Direction;
}

const DIRECTION_ORDER: {
  reactionId: string;
  difficulty: Difficulty;
  amounts: Amounts;
  context: string;
}[] = [
  // The book's own three experiments on the water-gas shift, kept as a set:
  // one mixture well below K, one well above, and one close enough that
  // reading the numbers off is not enough.
  {
    reactionId: 'vatnsgas',
    difficulty: 'ledd',
    amounts: { CO: 0.02, 'H₂O': 0.02, 'CO₂': 0.004, 'H₂': 0.004 },
    context: 'Tilraun 1 úr kennslubókinni.',
  },
  {
    reactionId: 'vatnsgas',
    difficulty: 'ledd',
    amounts: { CO: 0.011, 'H₂O': 0.0011, 'CO₂': 0.037, 'H₂': 0.046 },
    context: 'Tilraun 2 — hér er mun meira af myndefnum til staðar í upphafi.',
  },
  {
    reactionId: 'vatnsgas',
    difficulty: 'mid',
    amounts: { CO: 0.0094, 'H₂O': 0.0025, 'CO₂': 0.0015, 'H₂': 0.0076 },
    context: 'Tilraun 3 — hér dugar ekki að horfa á tölurnar, það verður að reikna Q.',
  },
  {
    reactionId: 'no2-n2o4',
    difficulty: 'ledd',
    amounts: { 'NO₂': 0.1, 'N₂O₄': 0 },
    context:
      'Ekkert myndefni enn. Q er núll, sem er minna en hvaða K sem er — svo hvarfið hlýtur að ganga áfram.',
  },
  {
    reactionId: 'ammoniak',
    difficulty: 'mid',
    amounts: { 'N₂': 0.5, 'H₂': 0.5, 'NH₃': 0.5 },
    context: 'Jafnir styrkir. Stuðullinn 3 á vetninu ræður úrslitum, ekki magnið.',
  },
  {
    reactionId: 'vetnisjodid',
    difficulty: 'mid',
    amounts: { 'H₂': 0.1, 'I₂': 0.1, HI: 2.0 },
    context: 'Mikið af vetnisjoðíði fyrir. K er 50, en Q er hærra.',
  },
];

export const DIRECTION_PROBLEMS: DirectionProblem[] = DIRECTION_ORDER.map((p, i) => {
  const reaction = reactionBy(p.reactionId);
  const k = reaction.constant?.value;
  if (k === undefined) throw new RangeError(`${p.reactionId} has no constant to compare against`);
  const q = reactionQuotient(reaction, p.amounts);
  return {
    id: `${p.reactionId}-${i}`,
    reaction,
    difficulty: p.difficulty,
    amounts: p.amounts,
    context: p.context,
    q,
    k,
    direction: directionFromQ(q, k),
  };
});

/** "Kc is this — what is Kp?" */
export interface KpProblem {
  id: string;
  reaction: Reaction;
  difficulty: Difficulty;
  /** Derived. */
  deltaN: number;
  kc: number;
  kp: number;
  temperatureC: number;
  expression: string;
}

export const KP_PROBLEMS: KpProblem[] = REACTIONS.filter(canConvertToKp).map((reaction) => {
  const constant = reaction.constant!;
  const deltaN = deltaNGas(reaction);
  const temperatureC = constant.temperatureC!;
  return {
    id: `kp-${reaction.id}`,
    reaction,
    difficulty: deltaN === 0 ? 'ledd' : Math.abs(deltaN) === 1 ? 'mid' : 'thung',
    deltaN,
    kc: constant.value,
    kp: kcToKp(constant.value, deltaN, temperatureC),
    temperatureC,
    expression: kpExpression(reaction)!,
  };
});

/** "Start from this mixture — where does it end up?" */
export interface IceProblem {
  id: string;
  reaction: Reaction;
  difficulty: Difficulty;
  initial: Amounts;
  context: string;
  /** Derived, all of it. */
  result: IceResult;
}

const ICE_ORDER: {
  reactionId: string;
  difficulty: Difficulty;
  initial: Amounts;
  context: string;
}[] = [
  {
    reactionId: 'pcl5',
    difficulty: 'ledd',
    initial: { 'PCl₅': 1.0, 'PCl₃': 0, 'Cl₂': 0 },
    context:
      'Kennslubókardæmið. Eitt hvarfefni, tvö myndefni, allir stuðlar 1 — svo algebran er annars stigs jafna og nálgunin er ekki nógu góð.',
  },
  {
    reactionId: 'blasyra',
    difficulty: 'ledd',
    initial: { HCN: 0.15, 'H⁺': 0, 'CN⁻': 0 },
    context:
      'Hér er K örsmátt, svo x er hverfandi á móti 0,15 og nálgunin heldur með miklum afgangi. Sama dæmi og Sýrufastinn leysir sem sýru — jafnvægisfasti og sýrufasti eru sama stærðin.',
  },
  {
    reactionId: 'nituroxid',
    difficulty: 'mid',
    initial: { 'N₂': 0.781, 'O₂': 0.21, NO: 0 },
    context:
      'Loft við 2000 °C. Styrkirnir eru hlutföll andrúmsloftsins, og K er svo lítið að nituroxíðið verður hverfandi — sem er einmitt af hverju það myndast bara í vélum og eldingum.',
  },
  {
    reactionId: 'vetnisjodid',
    difficulty: 'mid',
    initial: { 'H₂': 1.0, 'I₂': 2.0, HI: 0 },
    context:
      'Ójafnir upphafsstyrkir. Hér er K stórt, svo nálgunin fellur — og það er rétt niðurstaða, ekki villa.',
  },
  {
    reactionId: 'no2-n2o4',
    difficulty: 'thung',
    initial: { 'NO₂': 0.1, 'N₂O₄': 0 },
    context: 'Stuðullinn 2 fer í veldisvísi, svo þetta er ekki línulegt í x.',
  },
  {
    reactionId: 'ammoniak',
    difficulty: 'thung',
    initial: { 'N₂': 1.0, 'H₂': 3.0, 'NH₃': 0 },
    context:
      'Haber-ferlið úr kjörhlutföllum. Algebran hér er fjórða stigs jafna — engin leið með blaði og penna, og samt nákvæmlega sama aðferð.',
  },
];

export const ICE_PROBLEMS: IceProblem[] = ICE_ORDER.map((p, i) => {
  const reaction = reactionBy(p.reactionId);
  const k = reaction.constant?.value;
  if (k === undefined) throw new RangeError(`${p.reactionId} has no constant`);
  return {
    id: `ice-${p.reactionId}-${i}`,
    reaction,
    difficulty: p.difficulty,
    initial: p.initial,
    context: p.context,
    result: iceTable(reaction, p.initial, k),
  };
});

/** Problems where the shortcut holds, and where it does not. */
export const APPROXIMATION_HOLDS = ICE_PROBLEMS.filter((p) => p.result.approximationSafe);
export const APPROXIMATION_FAILS = ICE_PROBLEMS.filter((p) => !p.result.approximationSafe);
