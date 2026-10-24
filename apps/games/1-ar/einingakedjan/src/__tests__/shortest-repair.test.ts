import { describe, expect, it } from 'vitest';

import { problems, problemsForPhase, type Problem } from '../data/problems';
import { ratioById } from '../data/ratios';
import { correctionPrompt, solveChain, type ChainSlot, type FixAction } from '../engine/chain';
import { flip, formatSignature, type Orientation } from '../engine/units';

/**
 * Decision 61 (a), ruled 2026-10-23: after a wrong turn, the shortest repair
 * counts as right.
 *
 * Until then `correctionPrompt` diagnosed from the failing step alone. A clean
 * chain that stopped short was always told to add a card, and an upside-down card
 * was always told to flip, with "remove" told the card itself was the right one.
 * Both were false when the chain had gone down a distractor: on B1,
 * g Mg → mól Mg → mól O₂ was told to add three more cards (back through mól Mg),
 * when removing the last left two to go; and an overshoot such as g MgO → kg MgO
 * was told removal moved it away from the target, when removal solves it.
 *
 * "Shortest" is counted as the cards still to place once the repair is made:
 * adding leaves what the chain's end still needs; removing leaves what the chain
 * needs without its last card; flipping leaves what the flipped card's result
 * needs. A tie in the first comparison keeps "add a step", the answer before the
 * ruling. A flip is right only on a shortest route, so a tie there goes to
 * "remove". The counts here come from trying extensions on the grader itself,
 * deliberately not from `stepsToTarget`, which the prompt uses.
 */

const ORIENTATIONS: Orientation[] = ['forward', 'flipped'];

const WORDS = [
  '',
  'eitt hlutfall',
  'tvö hlutföll',
  'þrjú hlutföll',
  'fjögur hlutföll',
  'fimm hlutföll',
  'sex hlutföll',
];

const moves = (problem: Problem): ChainSlot[] =>
  problem.poolIds.flatMap((equivalenceId) =>
    ORIENTATIONS.map((orientation) => ({ equivalenceId, orientation }))
  );

const describeChain = (problem: Problem, chain: ChainSlot[]): string =>
  `${problem.id}: ${chain
    .map((c) => `${c.equivalenceId}${c.orientation === 'flipped' ? ' (snúið)' : ''}`)
    .join(' → ')}`;

/**
 * The fewest cards that finish `chain`, 0 if it is already solved: a
 * breadth-first walk over whole chains, run through `solveChain` at every step.
 */
function fewest(problem: Problem, chain: ChainSlot[]): number {
  const pool = problem.poolIds.map(ratioById);
  let frontier = [chain];
  for (let n = 0; n <= 6; n++) {
    const next: ChainSlot[][] = [];
    for (const current of frontier) {
      const { status } = solveChain(problem.start, current, pool, problem.target);
      if (status === 'solved') return n;
      if (status !== 'wrong-unit') continue;
      for (const move of moves(problem)) next.push([...current, move]);
    }
    frontier = next;
  }
  throw new Error(`no finish for ${describeChain(problem, chain)} within six cards`);
}

/**
 * Check one broken chain: the repair marked right is a shortest one, and every
 * explanation says what is true for this chain.
 */
function checkRepair(problem: Problem, chain: ChainSlot[]): void {
  const pool = problem.poolIds.map(ratioById);
  const result = solveChain(problem.start, chain, pool, problem.target);
  const prompt = correctionPrompt(result, problem.target, pool);
  const name = describeChain(problem, chain);
  const goal = formatSignature(problem.target);
  expect(prompt, name).not.toBeNull();

  const option = (id: FixAction) => prompt!.options.find((o) => o.id === id)!;
  const correct = prompt!.options.filter((o) => o.correct);
  expect(correct, name).toHaveLength(1);
  // Only the option marked right says it is right.
  for (const o of prompt!.options) {
    expect(o.explanation.startsWith('Rétt.'), `${name}, ${o.id}`).toBe(o.correct);
  }

  if (result.status === 'wrong-unit') {
    const left = { addStep: fewest(problem, chain), remove: fewest(problem, chain.slice(0, -1)) };
    const best: 'addStep' | 'remove' = left.remove < left.addStep ? 'remove' : 'addStep';
    expect(correct[0].id, `${name} (${JSON.stringify(left)})`).toBe(best);
    expect(left[best], name).toBe(Math.min(left.addStep, left.remove));

    // Adding always works, and says how far it is.
    expect(option('addStep').explanation, name).toContain(`þarft ${WORDS[left.addStep]} í viðbót`);
    const remove = option('remove').explanation;
    const flipText = option('flip').explanation;
    if (best === 'addStep') {
      expect(flipText, name).toContain('keðjan sé of stutt');
      expect(remove.includes('lengra frá markinu'), name).toBe(left.remove > left.addStep);
    } else {
      expect(flipText, name).not.toContain('of stutt');
      expect(remove, name).not.toContain('lengra frá markinu');
      expect(remove, name).toContain(
        left.remove === 0 ? `endar hún í ${goal}` : `þarft aðeins ${WORDS[left.remove]} í viðbót`
      );
    }
    return;
  }

  expect(result.status, name).toBe('inverted');
  const at = result.failedSlot!;
  const prefix = chain.slice(0, at);
  const turned = { ...chain[at], orientation: flip(chain[at].orientation) };
  const left = { flip: fewest(problem, [...prefix, turned]), remove: fewest(problem, prefix) };
  const onRoute = left.flip + 1 === left.remove;
  const best: 'flip' | 'remove' = onRoute ? 'flip' : 'remove';
  expect(correct[0].id, `${name} (${JSON.stringify(left)})`).toBe(best);
  expect(left[best], name).toBe(Math.min(left.flip, left.remove));

  const remove = option('remove').explanation;
  if (onRoute) {
    expect(remove, name).toContain('Hlutfallið sjálft er rétt valið');
  } else {
    expect(remove, name).not.toContain('rétt valið');
    expect(remove, name).toContain(
      left.remove === 0 ? `þegar komin í ${goal}` : `þarftu ${WORDS[left.remove]} til að komast í`
    );
    // Nothing else may say the card only needs turning.
    expect(option('flip').explanation, name).not.toContain('snýr bara öfugt');
    expect(option('addStep').explanation, name).not.toContain('snýr bara öfugt');
  }
}

/** Every shortest solution of a problem, found on the grader. */
function shortestSolutions(problem: Problem): ChainSlot[][] {
  const pool = problem.poolIds.map(ratioById);
  const found: ChainSlot[][] = [];
  const walk = (chain: ChainSlot[]) => {
    const { status } = solveChain(problem.start, chain, pool, problem.target);
    if (status === 'solved') {
      found.push(chain);
      return;
    }
    if (status !== 'wrong-unit' || chain.length >= problem.expectedSteps) return;
    for (const move of moves(problem)) walk([...chain, move]);
  };
  walk([]);
  return found;
}

describe('every Beita distractor, played: the repair marked right is a shortest one', () => {
  it.each(problemsForPhase('beita').map((p) => [p.id, p] as const))('%s', (_id, problem) => {
    const pool = problem.poolIds.map(ratioById);
    const solutions = shortestSolutions(problem);
    expect(solutions.length).toBeGreaterThan(0);
    const onSomeRoute = new Set(solutions.flatMap((s) => s.map((c) => c.equivalenceId)));
    const distractors = problem.poolIds.filter((id) => !onSomeRoute.has(id));

    // Play each distractor wherever a student on a correct route could reach for
    // it and have it cancel, the finished chain included (an overshoot), and in
    // both orientations: one is a clean wrong turn, the other upside down.
    let wrongTurns = 0;
    for (const id of distractors) {
      for (const solution of solutions) {
        for (let k = 0; k <= solution.length; k++) {
          const prefix = solution.slice(0, k);
          const chains = ORIENTATIONS.map((orientation) => [
            ...prefix,
            { equivalenceId: id, orientation },
          ]);
          const statuses = chains.map(
            (chain) => solveChain(problem.start, chain, pool, problem.target).status
          );
          if (!statuses.includes('wrong-unit')) continue;
          wrongTurns++;
          for (const chain of chains) checkRepair(problem, chain);
        }
      }
    }
    expect(wrongTurns, `${problem.id} has no distractor that cancels`).toBeGreaterThan(0);
  });

  it('B1: g Mg → mól Mg → mól O₂ is told to remove the last card, not to add three', () => {
    const problem = problems.find((p) => p.id === 'B1')!;
    const pool = problem.poolIds.map(ratioById);
    const chain: ChainSlot[] = [
      { equivalenceId: 'mm-Mg', orientation: 'flipped' },
      { equivalenceId: 'jafna-Mg-O2', orientation: 'flipped' },
    ];
    const prompt = correctionPrompt(
      solveChain(problem.start, chain, pool, problem.target),
      problem.target,
      pool
    )!;
    const remove = prompt.options.find((o) => o.id === 'remove')!;
    expect(remove.correct).toBe(true);
    expect(remove.explanation).toBe(
      'Rétt. Síðasta hlutfallið leiddi þig frá markinu. Án þess ertu aftur í mól Mg og þarft aðeins tvö hlutföll í viðbót til að komast í g MgO.'
    );
  });

  it('B1: an overshoot to kg MgO is told removal solves it', () => {
    const problem = problems.find((p) => p.id === 'B1')!;
    const pool = problem.poolIds.map(ratioById);
    const chain: ChainSlot[] = [
      { equivalenceId: 'mm-Mg', orientation: 'flipped' },
      { equivalenceId: 'jafna-Mg-MgO', orientation: 'flipped' },
      { equivalenceId: 'mm-MgO', orientation: 'forward' },
      { equivalenceId: 'metric-g-kg', orientation: 'flipped' },
    ];
    const prompt = correctionPrompt(
      solveChain(problem.start, chain, pool, problem.target),
      problem.target,
      pool
    )!;
    const remove = prompt.options.find((o) => o.id === 'remove')!;
    expect(remove.correct).toBe(true);
    expect(remove.explanation).toBe(
      'Rétt. Keðjan fór einu hlutfalli of langt. Án síðasta hlutfallsins endar hún í g MgO.'
    );
  });
});

describe('on every problem, every broken chain of up to three cards', () => {
  // Every clean chain of up to two cards, then one more card of any kind: the
  // wrong turns, the upside-down cards, and the card placed after the target.
  it.each(problems.map((p) => [p.id, p] as const))('%s', (_id, problem) => {
    const pool = problem.poolIds.map(ratioById);
    const status = (chain: ChainSlot[]) =>
      solveChain(problem.start, chain, pool, problem.target).status;
    const ones = moves(problem).map((m) => [m]);
    const twos = ones.flatMap((a) => moves(problem).map((b) => [...a, b]));
    const clean: ChainSlot[][] = [[], ...ones, ...twos].filter(
      (chain) => chain.length === 0 || status(chain) === 'wrong-unit' || status(chain) === 'solved'
    );
    let checked = 0;
    for (const prefix of clean) {
      for (const move of moves(problem)) {
        const chain = [...prefix, move];
        const s = status(chain);
        if (s !== 'wrong-unit' && s !== 'inverted') continue;
        checkRepair(problem, chain);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
});
