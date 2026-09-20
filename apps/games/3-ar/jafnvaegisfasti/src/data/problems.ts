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
  kcExpression,
  kcToKp,
  kpExpression,
  reactionQuotient,
  totalPressure,
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

/**
 * ICE in partial pressures.
 *
 * **Not the concentration problems with the units relabelled.** The algebra is
 * identical — which is the point, and the engine is unit-agnostic for exactly
 * that reason — but three things are genuinely different, and each of the
 * problems below exists for one of them:
 *
 * 1. **The constant is a Kp the book states as a Kp.** Nothing is converted.
 * 2. **A heterogeneous system loses its solid from K entirely**, so the two
 *    gases the ammonium chloride releases are all there is, and they come out
 *    equal because the equation makes them 1 : 1.
 * 3. **Total pressure is an observable.** Where Δn ≠ 0 a manometer reads the
 *    extent directly. Where Δn = 0 it reads nothing at all, however far the
 *    reaction has run, and that is worth meeting once.
 */
export interface PressureProblem {
  id: string;
  reaction: Reaction;
  difficulty: Difficulty;
  /** Partial pressures in atm. */
  initial: Amounts;
  context: string;
  /** Derived. */
  result: IceResult;
  initialTotal: number;
  /** Total pressure once it settles — `null` where Δn = 0 and it cannot move. */
  equilibriumTotal: number | null;
}

const PRESSURE_ORDER: {
  reactionId: string;
  difficulty: Difficulty;
  initial: Amounts;
  context: string;
}[] = [
  {
    reactionId: 'brennisteinsvetni',
    difficulty: 'ledd',
    initial: { 'H₂S': 0.824, 'H₂': 0, 'S₂': 0 },
    context:
      'Kennslubókardæmið, og það er valið vegna þess að Kp er örsmátt: breytingin er hverfandi á móti 0,824 atm og 5 % reglan heldur með miklum afgangi. Sama nálgun og í styrkjum — ekkert nýtt nema einingin.',
  },
  {
    reactionId: 'bromklorid',
    difficulty: 'mid',
    initial: { 'Cl₂': 0.6, 'Br₂': 0.9, BrCl: 0 },
    context:
      'Δn er núll hér, svo heildarþrýstingurinn hreyfist ekki hvað sem hvarfið gengur langt. Mælitækið segir ekkert — það er ekki bilað, það er bara ekkert að mæla.',
  },
  {
    reactionId: 'ammoniumklorid',
    difficulty: 'mid',
    // The solid gets a nominal amount because the type wants one; it is not
    // in K, gets no ICE row, and cannot move the answer — which a test checks.
    initial: { 'NH₄Cl': 1, 'NH₃': 0, HCl: 0 },
    context:
      'Fasta saltið dettur út úr Kp, svo stæðan er bara margfeldi gasþrýstinganna tveggja — og jafnan gerir þá jafna, svo hvor um sig er kvaðratrótin af Kp.',
  },
  {
    reactionId: 'nituroxidklorid',
    difficulty: 'thung',
    initial: { NO: 1.0, 'Cl₂': 1.0, NOCl: 0 },
    context:
      'Stórt Kp, svo hvarfið gengur nánast til enda og nálgunin á ekkert erindi. Δn er −1, svo heildarþrýstingurinn fellur mælanlega meðan á því stendur.',
  },
];

export const PRESSURE_PROBLEMS: PressureProblem[] = PRESSURE_ORDER.map((p, i) => {
  const reaction = reactionBy(p.reactionId);
  const k = reaction.constant?.value;
  if (k === undefined) throw new RangeError(`${p.reactionId} has no constant`);
  const result = iceTable(reaction, p.initial, k);
  const settled = Object.fromEntries(result.rows.map((r) => [r.formula, r.equilibrium]));
  // Not guarded: every gas is in K, so every gas has a row, so this cannot
  // throw for want of a pressure. Catching it would turn a data defect into a
  // silent `null` and the screen would quietly stop showing a reading.
  return {
    ...p,
    id: `p-${p.reactionId}-${i}`,
    reaction,
    result,
    initialTotal: totalPressure(reaction, p.initial),
    // Δn = 0 and the reading does not move, however far the reaction runs.
    equilibriumTotal: deltaNGas(reaction) === 0 ? null : totalPressure(reaction, settled),
  };
});

/**
 * What the Beita phase actually serves: the concentration problems, then the
 * pressure ones.
 *
 * **One list, one screen, one method.** The algebra does not change when the
 * units do, and putting the pressure problems behind a separate screen would
 * teach the opposite — that ICE in atm is a second technique to learn rather
 * than the same one with a manometer instead of a flask. What the screen has
 * to know is only what differs: the unit its columns are labelled in, the
 * symbol beside the constant, and whether a total-pressure reading exists.
 */
export interface BeitaProblem {
  id: string;
  reaction: Reaction;
  difficulty: Difficulty;
  initial: Amounts;
  context: string;
  result: IceResult;
  /** `M` for concentrations, `atm` for partial pressures. */
  unit: 'M' | 'atm';
  /** What the student is handed — `K` or `Kp`. */
  constantSymbol: 'K' | 'Kp';
  /** The expression, written in whichever of the two the problem uses. */
  expression: string;
  /**
   * The manometer, where there is one. `equilibrium` is `null` where Δn = 0:
   * the reading does not move however far the reaction runs, and saying so is
   * the whole point of that problem.
   */
  totals: { initial: number; equilibrium: number | null } | null;
}

export const BEITA_PROBLEMS: BeitaProblem[] = [
  ...ICE_PROBLEMS.map((p): BeitaProblem => ({
    ...p,
    unit: 'M',
    constantSymbol: 'K',
    expression: kcExpression(p.reaction),
    totals: null,
  })),
  ...PRESSURE_PROBLEMS.map((p): BeitaProblem => {
    const expression = kpExpression(p.reaction);
    if (expression === null) {
      throw new RangeError(`${p.id} is served in atm but has no Kp expression`);
    }
    return {
      id: p.id,
      reaction: p.reaction,
      difficulty: p.difficulty,
      initial: p.initial,
      context: p.context,
      result: p.result,
      unit: 'atm',
      constantSymbol: 'Kp',
      expression,
      totals: { initial: p.initialTotal, equilibrium: p.equilibriumTotal },
    };
  }),
];
