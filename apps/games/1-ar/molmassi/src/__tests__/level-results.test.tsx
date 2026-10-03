// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import App from '../App';
import { Level2, generateAllProblems } from '../components/Level2';
import { DESCRIPTORS, Level3, buildProblem } from '../components/Level3';

/**
 * No running score while a student practises — mobile-pass decision 1 (b),
 * applied to this game. Stig 2 paid 10 points an answer and showed them in its
 * header twice over, then ended on `Þú fékkst {n} af 100 stigum`; Stig 3 kept
 * `{n} rétt` in its header and ended on a fraction and a percentage. Each
 * level now ends with how many the student got right, `N af M rétt`, and the
 * menu shows that per level.
 *
 * Completion is untouched (item 42 is not ruled): Stig 2 still needs six of
 * ten, as it needed 60 of 100 points, and Stig 3 is recorded at any count.
 *
 * Queries are scoped to the rendered container (the repo runs `retry: 2`).
 */

afterEach(cleanup);
clockPastNextGuard();

/** A running score: "Stig: 30", "30 stig", a tally tile headed "Stig", or "{n} rétt" while playing. */
function expectNoRunningScore(container: HTMLElement) {
  const text = container.textContent ?? '';
  expect(text).not.toMatch(/\bStig:\s*\d/);
  expect(text).not.toMatch(/\d+\s*stig(um)?\b/);
  expect(text).not.toMatch(/\d+\s*rétt\b/);
  expect(text).not.toMatch(/\d+\/100/);
  const tiles = [...container.querySelectorAll('div')].filter(
    (d) => d.children.length === 0 && d.textContent === 'Stig'
  );
  expect(tiles).toEqual([]);
}

/** A seeded Math.random, so the test can make the same problems the level makes. */
function seedRandom() {
  let state = 1;
  const reset = () => (state = 1);
  vi.spyOn(Math, 'random').mockImplementation(() => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  });
  return reset;
}

/** Writes a number the level's parser reads exactly. */
const typed = (n: number) => n.toExponential(6).replace('.', ',');

describe('Stig 2 counts right answers', () => {
  let reset: () => void;
  beforeEach(() => {
    reset = seedRandom();
  });
  afterEach(() => vi.restoreAllMocks());

  function play(rightAt: (i: number) => boolean) {
    reset();
    const problems = generateAllProblems();
    reset();
    const onComplete = vi.fn();
    const { container } = render(
      <Level2 onBack={vi.fn()} onComplete={onComplete} initialProgress />
    );
    const ui = within(container);
    problems.forEach((problem, i) => {
      expect(container.querySelector('#molmassi-l2-question')?.textContent).toBe(
        problem.questionText
      );
      expectNoRunningScore(container);
      const value = rightAt(i) ? problem.correctAnswer : problem.correctAnswer * 3;
      fireEvent.change(ui.getByRole('textbox'), { target: { value: typed(value) } });
      fireEvent.click(ui.getByRole('button', { name: 'Svara' }));
      expectNoRunningScore(container);
      fireEvent.click(ui.getByRole('button', { name: /Næsta dæmi|Sjá niðurstöður/ }));
    });
    return { onComplete, container, ui };
  }

  it('ends with "7 af 10 rétt" and reports it', () => {
    const { onComplete, container, ui } = play((i) => i < 7);
    expect(container.textContent).toContain('Þú svaraðir 7 af 10 rétt');
    expect(container.textContent).not.toMatch(/stigum/);
    fireEvent.click(ui.getByRole('button', { name: 'Ljúka stigi →' }));
    expect(onComplete).toHaveBeenCalledWith(7, 10);
  });

  it('still needs six of ten to finish the level', () => {
    const { container, ui } = play((i) => i < 5);
    expect(container.textContent).toContain('Þú svaraðir 5 af 10 rétt');
    expect(ui.queryByRole('button', { name: 'Ljúka stigi →' })).toBeNull();
  });
});

describe('Stig 3 counts right answers', () => {
  it('shows no tally while playing and ends with "N af 8 rétt"', () => {
    const all = DESCRIPTORS.map(buildProblem);
    const onComplete = vi.fn();
    const { container } = render(<Level3 onBack={vi.fn()} onComplete={onComplete} />);
    const ui = within(container);
    for (let i = 0; i < 8; i++) {
      expectNoRunningScore(container);
      const question = container.querySelector('p[data-item-start]')?.textContent;
      const problem = all.find((p) => p.question === question)!;
      expect(problem, question ?? '').toBeTruthy();
      const value = i % 2 === 0 ? problem.answer : problem.answer * 3;
      fireEvent.change(ui.getByRole('textbox'), { target: { value: typed(value) } });
      fireEvent.click(ui.getByRole('button', { name: 'Svara' }));
      expectNoRunningScore(container);
      fireEvent.click(ui.getByRole('button', { name: i < 7 ? /Næsta/ : /Sjá niðurstöðu/ }));
    }
    expect(container.textContent).toContain('Þú svaraðir 4 af 8 rétt');
    expect(container.textContent).not.toMatch(/%|Árangur/);
    expect(onComplete).toHaveBeenCalledWith(4, 8);
  });
});

describe('the menu shows each level’s count', () => {
  const KEY = 'molhugtakidProgress';
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('shows "N af M rétt" for a level played since the change', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ level2Completed: true, level2Correct: 7, level2Total: 10 })
    );
    const { container } = render(<App />);
    expect(within(container).getByRole('button', { name: /Stig 2/ }).textContent).toContain(
      '✓ 7 af 10 rétt'
    );
  });

  it('shows "Lokið" with no count for a level finished before counts were kept', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ level1Completed: true, level2Completed: true, level3Completed: false })
    );
    const { container } = render(<App />);
    const card = within(container).getByRole('button', { name: /Stig 2/ });
    expect(card.textContent).toContain('✓ Lokið');
    expect(card.textContent).not.toMatch(/\d+ af \d+/);
  });
});
