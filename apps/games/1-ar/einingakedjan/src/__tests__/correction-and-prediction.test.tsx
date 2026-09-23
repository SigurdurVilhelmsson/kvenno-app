import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChainBuilder } from '../components/ChainBuilder';
import { problems, problemsForPhase, type Problem } from '../data/problems';
import { ratioById } from '../data/ratios';
import { correctionPrompt, solveChain, type ChainSlot } from '../engine/chain';

/**
 * The two questions ChainBuilder asks after "Leysa": which unit survives (Æfa),
 * and how to fix a chain that broke (both phases). These tests hold what each
 * question shows and what its feedback claims.
 *
 * Queries are scoped to the rendered container, and every test cleans up after
 * itself: the repo runs vitest with retries.
 */

type View = ReturnType<typeof render>;

const tapCard = (view: View, labelPart: string) =>
  fireEvent.click(
    view.getAllByRole('button').find((b) => b.getAttribute('aria-label')?.includes(labelPart))!
  );

const press = (view: View, name: string) => fireEvent.click(view.getByRole('button', { name }));

function renderPhase(phase: 'aefa' | 'beita'): View {
  return render(
    <ChainBuilder
      problems={problemsForPhase(phase)}
      predictBeforeSolving={phase === 'aefa'}
      onComplete={() => {}}
      onBack={() => {}}
    />
  );
}

/** Run the chain on the board to the end of the worked solution (Beita, no prediction). */
function solveOnBeita(view: View) {
  press(view, 'Leysa');
  press(view, 'Sýna öll skrefin strax');
  act(() => {
    vi.advanceTimersByTime(700);
  });
}

/** The labels of the fix options, in the order they are on screen. */
function fixOptions(view: View): string[] {
  const panel = view.container.querySelector('.border-amber-400');
  expect(panel, 'the correction prompt did not appear').not.toBeNull();
  return within(panel as HTMLElement)
    .getAllByRole('button')
    .map((b) => b.textContent ?? '');
}

/**
 * B1 starts from 5,00 g Mg and asks for g MgO. Each chain below breaks in a
 * different way, and each of the three prompts has its own correct fix.
 */
const BRANCHES: { name: string; build: (view: View) => void; correct: string }[] = [
  {
    name: 'an upside-down ratio',
    build: (view) => tapCard(view, ': 24,31 g Mg'),
    correct: 'Snúa hlutfallinu við',
  },
  {
    name: 'a ratio for the wrong substance',
    build: (view) => tapCard(view, ': 32 g O₂'),
    correct: 'Fjarlægja hlutfallið og velja annað',
  },
  {
    name: 'a clean chain that stops short',
    build: (view) => {
      tapCard(view, ': 24,31 g Mg');
      press(view, 'Snúa við hlutfalli númer 1');
    },
    correct: 'Bæta við hlutfalli aftast',
  },
];

describe('the correction prompt does not give its answer away by position', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it.each(BRANCHES)(
    'after $name, the correct fix is not always in one place',
    ({ build, correct }) => {
      // Math.random steers every shuffle in the component. Under a shuffle the
      // three draws below put the correct option in different places; with the
      // options in their authored order it is first every time.
      const positions = new Set<number>();
      for (const draw of [0, 0.5, 0.99]) {
        vi.spyOn(Math, 'random').mockReturnValue(draw);
        const view = renderPhase('beita');
        build(view);
        solveOnBeita(view);

        const options = fixOptions(view);
        expect(options).toHaveLength(3);
        expect(options.filter((o) => o === correct)).toHaveLength(1);
        positions.add(options.indexOf(correct));

        cleanup();
        vi.restoreAllMocks();
      }
      expect(
        positions.size,
        `"${correct}" sat at index ${[...positions]} on every draw`
      ).toBeGreaterThan(1);
    }
  );

  it('keeps the order while the student chooses again', () => {
    const view = renderPhase('beita');
    BRANCHES[0].build(view);
    solveOnBeita(view);

    const before = fixOptions(view);
    const wrong = before.find((o) => o !== BRANCHES[0].correct)!;
    press(view, wrong);
    press(view, 'Velja aftur');

    expect(fixOptions(view)).toEqual(before);
  });
});

describe('the prediction question', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  /** A1: 5,00 g Mg to atoms of Mg, built correctly. */
  const buildA1 = (view: View) => {
    tapCard(view, ': 24,31 g Mg');
    press(view, 'Snúa við hlutfalli númer 1');
    tapCard(view, 'atóm Mg jafngildir');
  };

  const predictionPanel = (view: View): HTMLElement =>
    view.getByRole('heading', { name: 'Áður en við reiknum' }).parentElement as HTMLElement;

  it('shows the chain it tells the student to look at', () => {
    const view = renderPhase('aefa');
    buildA1(view);
    press(view, 'Leysa');

    const panel = predictionPanel(view);
    expect(panel.textContent).toContain('Horfðu á keðjuna sem þú byggðir');
    // The starting measurement and both placed ratios, as the student built them.
    expect(panel.textContent).toContain('5,00');
    expect(panel.textContent).toContain('24,31');
    expect(panel.textContent).toContain('10²³');
  });

  it('shows the chain read-only, so it cannot be changed after the options are seen', () => {
    const view = renderPhase('aefa');
    buildA1(view);
    press(view, 'Leysa');

    const panel = predictionPanel(view);
    const names = within(panel)
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label') ?? b.textContent);
    expect(names.some((n) => n?.startsWith('Snúa við') || n?.startsWith('Fjarlægja'))).toBe(false);
  });

  it('does not promise a broken chain will work out when its outcome was predicted right', () => {
    const view = renderPhase('aefa');
    // Molar mass as written, so g Mg lands on top and nothing cancels.
    tapCard(view, ': 24,31 g Mg');
    press(view, 'Leysa');
    press(view, 'g Mg·g Mg / mol Mg');

    const panel = predictionPanel(view);
    expect(panel.textContent).toContain('Rétt lesið úr keðjunni');
    expect(panel.textContent).not.toContain('ganga upp');
  });

  it('does not tell the student a working chain veers off course', () => {
    const view = renderPhase('aefa');
    buildA1(view);
    press(view, 'Leysa');
    // The starting unit is always offered, and here it is wrong.
    press(view, 'g Mg');

    const panel = predictionPanel(view);
    expect(panel.textContent).toContain('Ekki alveg');
    expect(panel.textContent).not.toContain('sveigir af leið');
  });

  it('keeps each sentence where it is true', () => {
    const solved = renderPhase('aefa');
    buildA1(solved);
    press(solved, 'Leysa');
    press(solved, 'atóm Mg');
    expect(predictionPanel(solved).textContent).toContain(
      'Sjáum hana ganga upp skref fyrir skref.'
    );
    cleanup();

    const broken = renderPhase('aefa');
    tapCard(broken, ': 24,31 g Mg');
    press(broken, 'Leysa');
    press(broken, 'g Mg');
    expect(predictionPanel(broken).textContent).toContain('Fylgstu með hvar hún sveigir af leið.');
  });
});

describe('a chain that stops short is told how many cards it still needs', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  const WORDS = ['', 'eitt hlutfall', 'tvö hlutföll', 'þrjú hlutföll', 'fjögur hlutföll'];

  const moves = (problem: Problem): ChainSlot[] =>
    problem.poolIds.flatMap((equivalenceId) =>
      (['forward', 'flipped'] as const).map((orientation) => ({ equivalenceId, orientation }))
    );

  /**
   * The fewest cards that finish `chain`, found by trying every extension on the
   * grader itself — deliberately not by the search the prompt uses.
   */
  function fewestToFinish(problem: Problem, chain: ChainSlot[]): number {
    const pool = problem.poolIds.map(ratioById);
    const solvesWithin = (current: ChainSlot[], left: number): boolean => {
      const { status } = solveChain(problem.start, current, pool, problem.target);
      if (status === 'solved') return true;
      if (status !== 'wrong-unit' || left === 0) return false;
      return moves(problem).some((m) => solvesWithin([...current, m], left - 1));
    };
    for (let n = 1; n <= 6; n++) if (solvesWithin(chain, n)) return n;
    throw new Error(`no finish for ${problem.id} within six cards`);
  }

  /** Every clean chain of one or two cards that does not yet reach the target. */
  const shortChains = (problem: Problem): ChainSlot[][] => {
    const pool = problem.poolIds.map(ratioById);
    const ones = moves(problem).map((m) => [m]);
    const twos = ones.flatMap((a) => moves(problem).map((b) => [...a, b]));
    return [...ones, ...twos].filter(
      (chain) => solveChain(problem.start, chain, pool, problem.target).status === 'wrong-unit'
    );
  };

  it.each(problems.map((p) => [p.id, p] as const))('%s', (_id, problem) => {
    const pool = problem.poolIds.map(ratioById);
    const chains = shortChains(problem);
    expect(chains.length).toBeGreaterThan(0);
    for (const chain of chains) {
      const prompt = correctionPrompt(
        solveChain(problem.start, chain, pool, problem.target),
        problem.target,
        pool
      );
      const addStep = prompt?.options.find((o) => o.id === 'addStep');
      const n = fewestToFinish(problem, chain);
      expect(addStep?.explanation, chain.map((c) => c.equivalenceId).join(' → ')).toContain(
        `þarft ${WORDS[n]} í viðbót`
      );
    }
  });

  it('on screen: B1 after its first card needs two more, not one', () => {
    vi.useFakeTimers();
    const view = renderPhase('beita');
    tapCard(view, ': 24,31 g Mg');
    press(view, 'Snúa við hlutfalli númer 1');
    solveOnBeita(view);
    press(view, 'Bæta við hlutfalli aftast');

    const panel = view.container.querySelector('.border-amber-400') as HTMLElement;
    expect(panel.textContent).toContain('þarft tvö hlutföll í viðbót til að komast í g MgO');
  });
});
