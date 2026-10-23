/**
 * Running a student's chain and diagnosing where it goes wrong.
 *
 * The pedagogy here is deliberate: a bad step is *not* blocked. The chain runs,
 * the nonsense unit it produces is rendered, and only then does the game ask what
 * needs fixing. Letting a student build the wrong artefact and look at it is the
 * strongest teaching moment available in Year 1 (CURRICULUM_REVIEW.md:159); an
 * up-front block tells them they are wrong before they have felt why.
 */

import {
  applyRatio,
  flip,
  formatSignature,
  orient,
  signatureMatches,
  type Equivalence,
  type Orientation,
  type Quantity,
  type StepResult,
  type UnitSignature,
} from './units';

/** One placed card: which equivalence, and which way up the student turned it. */
export interface ChainSlot {
  equivalenceId: string;
  orientation: Orientation;
}

export type SolveStatus =
  /** Every step cancelled and the final unit is the target. */
  | 'solved'
  /** A step cancelled nothing, but would have if it were the other way up. */
  | 'inverted'
  /** A step cancelled nothing in either orientation — wrong relationship entirely. */
  | 'irrelevant'
  /** Every step cancelled, but the chain does not end on the target unit. */
  | 'wrong-unit';

export interface SolveResult {
  /** Steps actually executed, including the failing one so the UI can show it. */
  steps: StepResult[];
  status: SolveStatus;
  /** Index into `slots` of the step that failed. Absent when the run was clean. */
  failedSlot?: number;
  /** The quantity the chain arrived at. */
  final: Quantity;
}

const lookup = (pool: Equivalence[], id: string): Equivalence => {
  const found = pool.find((e) => e.id === id);
  if (!found) throw new Error(`Óþekkt hlutfall: ${id}`);
  return found;
};

/**
 * Execute the chain, stopping at the first step that cancels nothing.
 *
 * Note what is *not* here: no comparison against a stored correct path. A chain
 * that reaches the target unit through an unexpected but valid route solves.
 */
export function solveChain(
  start: Quantity,
  slots: ChainSlot[],
  pool: Equivalence[],
  target: UnitSignature
): SolveResult {
  const steps: StepResult[] = [];
  let current = start;

  for (let i = 0; i < slots.length; i++) {
    const equivalence = lookup(pool, slots[i].equivalenceId);
    const step = applyRatio(current, orient(equivalence, slots[i].orientation));
    steps.push(step);

    if (step.cancelCount === 0) {
      const flipped = applyRatio(current, orient(equivalence, flip(slots[i].orientation)));
      return {
        steps,
        status: flipped.cancelCount > 0 ? 'inverted' : 'irrelevant',
        failedSlot: i,
        final: step.after,
      };
    }

    current = step.after;
  }

  return {
    steps,
    status: signatureMatches(current, target) ? 'solved' : 'wrong-unit',
    final: current,
  };
}

/* ------------------------------------------------------- correction prompting */

/** The moves a student can make to repair a broken chain. */
export type FixAction = 'flip' | 'remove' | 'addStep';

export interface FixOption {
  id: FixAction;
  label: string;
  correct: boolean;
  /** Shown after the choice, whether it was right or wrong. */
  explanation: string;
}

export interface CorrectionPrompt {
  /** What went wrong, in Icelandic, with the actual units named. */
  problem: string;
  question: string;
  options: FixOption[];
}

/**
 * The fewest cards from `pool` that take `from` to `target`, or `null` if no
 * route exists.
 *
 * A breadth-first search over the units a chain can reach, where a step counts
 * only if something cancels — the same rule `solveChain` grades by. Every card
 * can be turned either way, so from anywhere a clean chain can reach, the way
 * back to the start and on to the target is always open; `null` is defensive.
 */
export function stepsToTarget(
  from: Quantity,
  pool: Equivalence[],
  target: UnitSignature
): number | null {
  if (signatureMatches(from, target)) return 0;
  const seen = new Set([formatSignature(from)]);
  let frontier = [from];
  for (let depth = 1; frontier.length > 0; depth++) {
    const next: Quantity[] = [];
    for (const quantity of frontier) {
      for (const equivalence of pool) {
        for (const orientation of ['forward', 'flipped'] as const) {
          const step = applyRatio(quantity, orient(equivalence, orientation));
          if (step.cancelCount === 0) continue;
          if (signatureMatches(step.after, target)) return depth;
          const key = formatSignature(step.after);
          if (seen.has(key)) continue;
          seen.add(key);
          next.push(step.after);
        }
      }
    }
    frontier = next;
  }
  return null;
}

/** "eitt hlutfall", "tvö hlutföll", …: the object of `þarft … í viðbót`. */
const RATIO_COUNTS = [
  '',
  'eitt hlutfall',
  'tvö hlutföll',
  'þrjú hlutföll',
  'fjögur hlutföll',
  'fimm hlutföll',
  'sex hlutföll',
];

const ratioCount = (n: number | null): string =>
  n !== null && n > 0 && n < RATIO_COUNTS.length ? RATIO_COUNTS[n] : 'fleiri hlutföll';

/**
 * Build the "how do we fix this?" question from what the chain actually did.
 *
 * Everything here is interpolated from the failing step, so the wording can never
 * describe a different error than the one on screen. The pool is the one the
 * chain was built from: how many cards are still missing is counted in it, not
 * assumed.
 *
 * Which repair is right is counted in it too (decision 61 (a), ruled 2026-10-23):
 * after a wrong turn the shortest repair counts as right. A chain that went down a
 * distractor is closer to the target without its last card than with one more,
 * so there "remove" is right and "add a step" is the long way round; and an
 * upside-down card is worth flipping only if, flipped, it is on a shortest route.
 * Each explanation is chosen by the same comparison, so none of them can claim
 * the opposite of what the grading decided.
 */
export function correctionPrompt(
  result: SolveResult,
  target: UnitSignature,
  pool: Equivalence[]
): CorrectionPrompt | null {
  if (result.status === 'solved') return null;

  const goal = formatSignature(target);

  if (result.status === 'wrong-unit') {
    const here = formatSignature(result.final);
    const toGo = stepsToTarget(result.final, pool, target);
    const missing = ratioCount(toGo);
    // Where the chain stood before its last card: `null` for an empty chain,
    // which the board never runs, and which has no card to remove.
    const last = result.steps.length > 0 ? result.steps[result.steps.length - 1] : null;
    const withoutLast = last ? stepsToTarget(last.before, pool, target) : null;
    // A tie keeps "add a step", the answer before the ruling. Dropping a card
    // moves the end of the chain one step, so the two counts differ by at most
    // one either way.
    const removeIsShorter = withoutLast !== null && toGo !== null && withoutLast < toGo;
    const overshot = removeIsShorter && withoutLast === 0;

    const whatIsWrong = !removeIsShorter
      ? 'keðjan sé of stutt'
      : overshot
        ? 'keðjan sé einu hlutfalli of löng'
        : 'síðasta hlutfallið leiði frá markinu';

    let addStepExplanation = `Rétt. Þú ert kominn í ${here} og þarft ${missing} í viðbót til að komast í ${goal}.`;
    let removeExplanation =
      'Nei. Þá færirðu þig lengra frá markinu, ekki nær því. Keðjan þarf að lengjast.';
    if (removeIsShorter) {
      addStepExplanation = `Það gengi upp, en það er lengri leiðin. Þú ert kominn í ${here} og þarft ${missing} í viðbót til að komast í ${goal}, en án síðasta hlutfallsins ${
        overshot ? `endar keðjan í ${goal}` : `þarftu aðeins ${ratioCount(withoutLast)}`
      }.`;
      removeExplanation = overshot
        ? `Rétt. Keðjan fór einu hlutfalli of langt. Án síðasta hlutfallsins endar hún í ${goal}.`
        : `Rétt. Síðasta hlutfallið leiddi þig frá markinu. Án þess ertu aftur í ${formatSignature(
            last ? last.before : result.final
          )} og þarft aðeins ${ratioCount(withoutLast)} í viðbót til að komast í ${goal}.`;
    } else if (withoutLast === toGo) {
      removeExplanation =
        'Nei. Þá vantar þig jafnmörg hlutföll og nú, svo það færir þig ekki nær markinu. Keðjan þarf að lengjast.';
    }

    return {
      problem: `Keðjan gengur upp — allar einingar styttust út — en hún endar í ${here}, ekki ${goal}.`,
      question: 'Hvað þarf að gera?',
      options: [
        {
          id: 'addStep',
          label: 'Bæta við hlutfalli aftast',
          correct: !removeIsShorter,
          explanation: addStepExplanation,
        },
        {
          id: 'flip',
          label: 'Snúa síðasta hlutfallinu við',
          correct: false,
          explanation: `Nei. Ef þú snýrð því við hættir það að styttast út — þá stendur eining eftir sem á ekki að vera þar. Vandinn er ekki að hlutfall snúi öfugt heldur að ${whatIsWrong}.`,
        },
        {
          id: 'remove',
          label: 'Fjarlægja síðasta hlutfallið',
          correct: removeIsShorter,
          explanation: removeExplanation,
        },
      ],
    };
  }

  const step = result.steps[result.steps.length - 1];
  const { ratio } = step;
  const currentUnit = formatSignature(step.before);
  const garbage = formatSignature(step.after);

  if (result.status === 'inverted') {
    // Turned the other way, the card cancels: where does that leave the chain?
    // Flipping is the repair only if that is a step along a shortest route;
    // otherwise the card does not belong here at all, and removing it is shorter.
    const flipped = applyRatio(step.before, orient(ratio.equivalence, flip(ratio.orientation)));
    const toGo = stepsToTarget(step.before, pool, target);
    const afterFlip = stepsToTarget(flipped.after, pool, target);
    const flipIsOnRoute = toGo !== null && afterFlip !== null && afterFlip + 1 === toGo;
    // A card placed after the chain had already reached the target.
    const alreadyThere = toGo === 0;
    const landsIn = formatSignature(flipped.after);

    let flipExplanation = `Rétt. Til að ${currentUnit} styttist út þarf sú eining að standa í nefnaranum. Eftir að hlutfallinu er snúið við gerir hún það.`;
    let removeExplanation =
      'Hlutfallið sjálft er rétt valið — það tengir einmitt þær tvær einingar sem þú þarft. Það snýr bara öfugt.';
    let addStepExplanation =
      'Þú þarft ekkert millistig hér. Hlutfallið sem þú valdir nær beint á milli — það snýr bara öfugt.';
    if (alreadyThere) {
      flipExplanation = `Þá styttist ${currentUnit} út, en keðjan var þegar komin í mark, og þú lendir aftur í ${landsIn}.`;
      removeExplanation = `Rétt. Keðjan var þegar komin í ${goal}, svo þetta hlutfall á ekki heima í henni.`;
    } else if (!flipIsOnRoute) {
      flipExplanation = `Þá styttist ${currentUnit} út, en þú lendir í ${landsIn}, sem er ekki nær ${goal} en ${currentUnit}. Þetta hlutfall er ekki á stystu leiðinni að markinu.`;
      removeExplanation = `Rétt. Jafnvel rétt snúið færir þetta hlutfall þig ekki nær markinu. Veldu annað: frá ${currentUnit} þarftu ${ratioCount(toGo)} til að komast í ${goal}.`;
    }
    if (!flipIsOnRoute) {
      addStepExplanation = `Millistig á undan hjálpar ekki. Þá myndi þetta hlutfall bara skila þér aftur í ${currentUnit}.`;
    }

    return {
      problem: `Ekkert styttist út. Þú varst með ${currentUnit}, en ${formatSignature({
        num: [{ unit: ratio.den.unit, species: ratio.den.species }],
        den: [],
      })} stendur í nefnaranum og á sér enga samsvörun. Útkoman verður ${garbage}, sem er ekki eining sem þýðir neitt.`,
      question: 'Hvað þarf að laga?',
      options: [
        {
          id: 'flip',
          label: 'Snúa hlutfallinu við',
          correct: flipIsOnRoute,
          explanation: flipExplanation,
        },
        {
          id: 'remove',
          label: 'Fjarlægja hlutfallið',
          correct: !flipIsOnRoute,
          explanation: removeExplanation,
        },
        {
          id: 'addStep',
          label: 'Bæta öðru hlutfalli við á undan',
          correct: false,
          explanation: addStepExplanation,
        },
      ],
    };
  }

  return {
    problem: `Ekkert styttist út. Þú varst með ${currentUnit}, og þetta hlutfall fjallar hvorki um ${currentUnit} í teljara né nefnara — hvorug leiðin gengur. Útkoman verður ${garbage}.`,
    question: 'Hvað þarf að laga?',
    options: [
      {
        id: 'remove',
        label: 'Fjarlægja hlutfallið og velja annað',
        correct: true,
        explanation: `Rétt. Næsta hlutfall þarf að hafa ${currentUnit} í nefnaranum til að sú eining styttist út.`,
      },
      {
        id: 'flip',
        label: 'Snúa hlutfallinu við',
        correct: false,
        explanation: `Það dugar ekki. Hvorug hliðin á þessu hlutfalli er ${currentUnit}, svo það styttist ekkert út hvernig sem því er snúið.`,
      },
      {
        id: 'addStep',
        label: 'Bæta öðru hlutfalli við aftast',
        correct: false,
        explanation:
          'Keðjan er þegar stopp á þessu skrefi. Það þýðir ekkert að byggja ofan á skref sem gengur ekki upp.',
      },
    ],
  };
}

/* ----------------------------------------------------------------- prediction */

/**
 * Candidate answers for the "which unit survives?" tap that gates Solve in the
 * practice phase.
 *
 * One tap, no typing, and it is what stops the level being beatable by shuffling
 * cards until the game turns green. The correct option is the unit the chain
 * *actually* produces, not the target — predicting the outcome of the chain you
 * built is the skill, and a student who predicts their own broken chain correctly
 * has understood something worth crediting.
 */
export function predictionOptions(
  start: Quantity,
  slots: ChainSlot[],
  pool: Equivalence[],
  target: UnitSignature
): { label: string; correct: boolean }[] {
  const actual = solveChain(start, slots, pool, target).final;

  const candidates: UnitSignature[] = [actual, target, start];

  // What the student would have got had they turned the last card the other way —
  // the most instructive near-miss available.
  if (slots.length > 0) {
    const head = slots.slice(0, -1);
    const tail = slots[slots.length - 1];
    candidates.push(
      solveChain(start, [...head, { ...tail, orientation: flip(tail.orientation) }], pool, target)
        .final
    );
  }

  const seen = new Set<string>();
  const options: { label: string; correct: boolean }[] = [];
  const actualLabel = formatSignature(actual);

  for (const candidate of candidates) {
    const label = formatSignature(candidate);
    if (seen.has(label)) continue;
    seen.add(label);
    options.push({ label, correct: label === actualLabel });
    if (options.length === 4) break;
  }

  return options;
}
