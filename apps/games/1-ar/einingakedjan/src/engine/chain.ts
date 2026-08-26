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
 * Build the "how do we fix this?" question from what the chain actually did.
 *
 * Everything here is interpolated from the failing step, so the wording can never
 * describe a different error than the one on screen.
 */
export function correctionPrompt(
  result: SolveResult,
  target: UnitSignature
): CorrectionPrompt | null {
  if (result.status === 'solved') return null;

  if (result.status === 'wrong-unit') {
    return {
      problem: `Keðjan gengur upp — allar einingar styttust út — en hún endar í ${formatSignature(
        result.final
      )}, ekki ${formatSignature(target)}.`,
      question: 'Hvað þarf að gera?',
      options: [
        {
          id: 'addStep',
          label: 'Bæta við hlutfalli aftast',
          correct: true,
          explanation: `Rétt. Þú ert kominn í ${formatSignature(
            result.final
          )} og þarft eitt hlutfall í viðbót til að komast í ${formatSignature(target)}.`,
        },
        {
          id: 'flip',
          label: 'Snúa síðasta hlutfallinu við',
          correct: false,
          explanation:
            'Nei. Ef þú snýrð því við hættir það að styttast út — þá stendur eining eftir sem á ekki að vera þar. Vandinn er ekki að hlutfall snúi öfugt heldur að keðjan sé of stutt.',
        },
        {
          id: 'remove',
          label: 'Fjarlægja síðasta hlutfallið',
          correct: false,
          explanation:
            'Nei. Þá færirðu þig lengra frá markinu, ekki nær því. Keðjan þarf að lengjast.',
        },
      ],
    };
  }

  const step = result.steps[result.steps.length - 1];
  const { ratio } = step;
  const currentUnit = formatSignature(step.before);
  const garbage = formatSignature(step.after);

  if (result.status === 'inverted') {
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
          correct: true,
          explanation: `Rétt. Til að ${currentUnit} styttist út þarf sú eining að standa í nefnaranum. Eftir að hlutfallinu er snúið við gerir hún það.`,
        },
        {
          id: 'remove',
          label: 'Fjarlægja hlutfallið',
          correct: false,
          explanation:
            'Hlutfallið sjálft er rétt valið — það tengir einmitt þær tvær einingar sem þú þarft. Það snýr bara öfugt.',
        },
        {
          id: 'addStep',
          label: 'Bæta öðru hlutfalli við á undan',
          correct: false,
          explanation:
            'Þú þarft ekkert millistig hér. Hlutfallið sem þú valdir nær beint á milli — það snýr bara öfugt.',
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
