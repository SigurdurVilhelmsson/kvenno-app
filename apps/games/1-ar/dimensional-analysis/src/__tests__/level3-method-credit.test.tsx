// @vitest-environment jsdom
/**
 * Level 3: where method credit comes from, and the line that ends a run.
 *
 * - **Decisions item 30 (b).** The composite (answer 40 %, method 30 %,
 *   explanation 20 %, efficiency 10 %) gave the method's 30 % to any
 *   explanation over 20 characters on an error-analysis, synthesis or
 *   derivation item. So a wrong answer read `✓ Rétt aðferð valin` under
 *   `Gott!`. Method credit now comes only from a right answer, or on an
 *   efficiency item from the path chosen.
 * - **Decisions item 31.** `Ljúka stigi` went straight back to the menu, so a
 *   student who missed mastery was never told why. The last problem's feedback
 *   now ends with one line: how many were right, and whether the run was
 *   mastered — by the same rule `onComplete` reports.
 *
 * Queries are scoped to the rendered container (the repo runs vitest with
 * `retry: 2`).
 */

import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level3 } from '../components/Level3';
import { level3Challenges, type Level3Challenge } from '../data/challenges';

clockPastNextGuard();

const run = vi.hoisted(() => ({ current: [] as Level3Challenge[] }));
vi.mock('../utils/level3Run', () => ({
  LEVEL_3_RUN_LENGTH: 12,
  buildLevel3Run: () => run.current,
}));

const STARTED = {
  problemsCompleted: 0,
  compositeScores: [],
  totalSteps: 0,
  achievements: [],
  mastered: false,
  hintsUsed: 0,
};

// Well over the 20 characters that used to buy the method's 30 %.
const EXPLANATION = 'Ég umbreytti einingunum skref fyrir skref með stuðlum.';

afterEach(cleanup);

function byId(id: string): Level3Challenge {
  const item = level3Challenges.find((c) => c.id === id);
  if (!item) throw new Error(`${id} is not in the pool`);
  return item;
}

/** A real-world item, graded on the typed answer alone; the answer is 4. */
function realWorld(n: number): Level3Challenge {
  return {
    id: `TEST-${n}`,
    type: 'real_world',
    prompt: `Dæmi ${n}: Þú átt 2 kg af hveiti og hvert deig þarf 500 g. Hversu mörg deig?`,
    startValue: 2,
    startUnit: 'kg',
    portionSize: 500,
    portionUnit: 'g',
    expectedAnswer: 4,
    requireInteger: true,
    explanation: '2000 g ÷ 500 g = 4 deig.',
  };
}

function renderRun(items: Level3Challenge[]) {
  run.current = items;
  const onComplete = vi.fn();
  const { container } = render(
    <Level3 onComplete={onComplete} onBack={vi.fn()} initialProgress={{ ...STARTED }} />
  );
  const view = within(container);
  const answer = (typed: string) => {
    fireEvent.change(view.getByPlaceholderText('Sláðu inn svar'), { target: { value: typed } });
    fireEvent.change(view.getByLabelText(/Útskýring/), { target: { value: EXPLANATION } });
    fireEvent.click(view.getByRole('button', { name: /Senda inn/ }));
  };
  const summary = () => view.queryByText(/^Stigi lokið:/);
  return { view, answer, summary, onComplete };
}

describe('method credit comes from the answer, not the explanation’s length — item 30 (b)', () => {
  it.each([
    ['L3-2', '250000'], // error analysis: María's own wrong answer
    ['L3-4', '125'], // synthesis: grams where kilograms were asked for
  ])('%s: a wrong answer with a long explanation is not "Rétt aðferð valin"', (id, typed) => {
    const { view, answer } = renderRun([byId(id)]);
    answer(typed);
    expect(view.getByText('Svarið er ekki alveg rétt')).toBeTruthy();
    expect(view.queryByText('✓ Rétt aðferð valin')).toBeNull();
    expect(view.getByText(/Athugaðu aðferðina/)).toBeTruthy();
    // 20 % for the explanation alone: under "Gott!", which needs half.
    expect(view.queryByText('Gott!')).toBeNull();
  });

  it.each([
    ['L3-2', '0,25'],
    ['L3-4', '0,125'],
  ])('%s: the right answer still credits the method', (id, typed) => {
    const { view, answer } = renderRun([byId(id)]);
    answer(typed);
    expect(view.getByText('Svarið er rétt!')).toBeTruthy();
    expect(view.getByText('✓ Rétt aðferð valin')).toBeTruthy();
  });
});

describe('the last problem ends with a one-line summary — item 31', () => {
  it('says nothing before the last problem, and counts the run on it', () => {
    const { view, answer, summary } = renderRun([realWorld(1), realWorld(2), realWorld(3)]);
    answer('4');
    expect(summary()).toBeNull();
    fireEvent.click(view.getByRole('button', { name: /Næsta áskorun/ }));
    answer('7');
    expect(summary()).toBeNull();
    fireEvent.click(view.getByRole('button', { name: /Næsta áskorun/ }));
    answer('4');
    expect(summary()?.textContent).toBe(
      'Stigi lokið: 2 af 3 rétt. Til að ná tökum á stiginu þarf rétt svar og útskýringu í flestum áskorunum.'
    );
  });

  it('says a mastered run is mastered, and agrees with what the level reports', () => {
    const { view, answer, summary, onComplete } = renderRun([realWorld(1), realWorld(2)]);
    answer('4');
    fireEvent.click(view.getByRole('button', { name: /Næsta áskorun/ }));
    answer('4');
    expect(summary()?.textContent).toBe('Stigi lokið: 2 af 2 rétt. Þú hefur náð tökum á stiginu.');
    fireEvent.click(view.getByRole('button', { name: 'Ljúka stigi' }));
    expect(onComplete.mock.calls[0][0].mastered).toBe(true);
  });

  it('says an unmastered run is not, and agrees with what the level reports', () => {
    const { view, answer, summary, onComplete } = renderRun([realWorld(1)]);
    answer('40');
    expect(summary()?.textContent).toMatch(/^Stigi lokið: 0 af 1 rétt\. Til að ná tökum/);
    fireEvent.click(view.getByRole('button', { name: 'Ljúka stigi' }));
    expect(onComplete.mock.calls[0][0].mastered).toBe(false);
  });
});
