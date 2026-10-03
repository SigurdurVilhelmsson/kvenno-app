// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { indicators } from '../data/indicators';
import { LEVEL1_CHALLENGES } from '../data/level1-challenges';
import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { LEVEL3_CHALLENGES } from '../data/level3-challenges';
import { getTitrationById } from '../data/titrations';
import type { MonoproticTitration } from '../types';

/**
 * No running score inside a level, and a count of right answers at its end
 * (mobile-pass decision 1 (b)). Every level showed `Stig: N` in its header and
 * `(+100 stig)` / `(+20 stig)` on the verdict; the menu showed `N stig` per
 * level and a `Heildarstig` total, and the end screen the same.
 *
 * The counting rule: a right answer counts, except one given after the game
 * had already shown it. Stig 2's result prints the equivalence volume and its
 * explanation names the good indicators, so a "Reyna aftur" after a result is
 * not counted — and a retry after a right answer no longer pays twice.
 */

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = (() => null) as never;
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as never;
});

beforeEach(() => vi.useFakeTimers());

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
});

const settle = () => act(() => vi.advanceTimersByTime(400));

function expectNoRunningScore(where: string) {
  const text = document.body.textContent ?? '';
  expect(text, where).not.toMatch(/Stig:\s*\d/);
  expect(text, where).not.toMatch(/\d+\s*stig\b/);
  expect(text, where).not.toMatch(/Heildarstig/);
}

/** Answers Stig 1 through, right on the questions `right` names (by index). */
function playLevel1(right: (i: number) => boolean) {
  const onComplete = vi.fn();
  render(<Level1 onComplete={onComplete} onBack={() => {}} />);
  fireEvent.click(screen.getByText(/Byrja æfingu/));
  settle();
  LEVEL1_CHALLENGES.forEach((challenge, i) => {
    const option = challenge.options!.find((o) => o.isCorrect === right(i))!;
    fireEvent.click(screen.getByText(option.labelIs));
    expectNoRunningScore(`Stig 1, question ${i + 1}`);
    fireEvent.click(screen.getByRole('button', { name: 'Staðfesta' }));
    settle();
    expectNoRunningScore(`Stig 1, feedback ${i + 1}`);
    fireEvent.click(screen.getByRole('button', { name: /Næsta →|Ljúka stigi →/ }));
    settle();
  });
  return onComplete;
}

/** One submission on the current Stig 2 puzzle: right, or with the volume far off. */
function submitLevel2(puzzleIndex: number, right: boolean) {
  const puzzle = LEVEL2_PUZZLES[puzzleIndex];
  const t = getTitrationById(puzzle.titrationId) as MonoproticTitration;
  const add5 = screen.getByRole('button', { name: /^Bæta við 5 mL/ });
  for (let i = 0; i <= Math.ceil(t.equivalenceVolume / 5); i++) fireEvent.click(add5);
  expectNoRunningScore(`Stig 2, puzzle ${puzzle.id}`);
  fireEvent.click(screen.getByRole('button', { name: /merkja jafngildispunkt/ }));
  settle();
  fireEvent.change(screen.getByRole('slider', { name: 'Jafngildisrúmmál' }), {
    target: { value: right ? String(t.equivalenceVolume) : '0' },
  });
  fireEvent.click(screen.getByRole('button', { name: /^Staðfesta: / }));
  settle();
  const name = indicators.find((ind) => ind.id === puzzle.acceptableIndicators[0])!.name;
  fireEvent.click(screen.getByRole('button', { name: new RegExp(name) }));
  fireEvent.click(screen.getByRole('button', { name: /Staðfesta val/ }));
  settle();
  expect(document.getElementById('ph-l2-verdict')?.textContent).toBe(
    right ? '✓ Rétt!' : '✗ Ekki rétt'
  );
  expectNoRunningScore(`Stig 2, result ${puzzle.id}`);
}

const retry = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Reyna aftur' }));
  settle();
};
const next = () => {
  fireEvent.click(screen.getByRole('button', { name: /Næsta →|Ljúka →/ }));
  settle();
};

function answerLevel3(right: (i: number) => boolean) {
  LEVEL3_CHALLENGES.forEach((challenge, i) => {
    fireEvent.click(screen.getByRole('button', { name: /Sýna vísbendingu/ }));
    expectNoRunningScore(`Stig 3, problem ${i + 1}`);
    const value = right(i) ? String(challenge.correctAnswer).replace('.', ',') : '999';
    fireEvent.change(screen.getByLabelText(/Svar/), { target: { value } });
    fireEvent.click(screen.getByRole('button', { name: 'Staðfesta svar' }));
    settle();
    expectNoRunningScore(`Stig 3, result ${i + 1}`);
    fireEvent.click(screen.getByRole('button', { name: /Næsta →|Ljúka stigi →/ }));
    settle();
  });
}

describe('Stig 1 counts right answers', () => {
  it('reports every question right as N of N, with no score on the way', () => {
    const n = LEVEL1_CHALLENGES.length;
    expect(playLevel1(() => true)).toHaveBeenCalledWith(n, n);
  });

  it('leaves a wrong answer out of the count', () => {
    const n = LEVEL1_CHALLENGES.length;
    expect(playLevel1((i) => i !== 0 && i !== 3)).toHaveBeenCalledWith(n - 2, n);
  });
});

describe('Stig 2 counts puzzles solved before the answer was shown', () => {
  it('counts a first-try solve once, and a solve after the result not at all', () => {
    const onComplete = vi.fn();
    render(<Level2 onComplete={onComplete} onBack={() => {}} />);

    // Puzzle 1: right first time — counts.
    submitLevel2(0, true);
    next();
    // Puzzle 2: wrong, then right after the result printed the volume — does not.
    submitLevel2(1, false);
    retry();
    submitLevel2(1, true);
    next();
    // Puzzle 3: right, then right again on a retry — counts once, not twice.
    submitLevel2(2, true);
    retry();
    submitLevel2(2, true);
    next();
    // The rest wrong.
    for (let i = 3; i < LEVEL2_PUZZLES.length; i++) {
      submitLevel2(i, false);
      next();
    }

    expect(onComplete).toHaveBeenCalledWith(2, LEVEL2_PUZZLES.length);
  });
});

describe('Stig 3 counts right answers', () => {
  it('reports the right answers out of the problems, hint or no hint', () => {
    const onComplete = vi.fn();
    render(<Level3 onComplete={onComplete} onBack={() => {}} />);
    answerLevel3((i) => i % 2 === 0);
    const n = LEVEL3_CHALLENGES.length;
    expect(onComplete).toHaveBeenCalledWith(Math.ceil(n / 2), n);
  });
});

describe('the menu and the end screen', () => {
  it('show a level finished under the old points format as Lokið, not as a count', () => {
    localStorage.setItem(
      'ph-titration-progress',
      JSON.stringify({
        level1Completed: true,
        level1Score: 500,
        level2Completed: false,
        level2Score: 0,
        level3Completed: false,
        level3Score: 0,
        totalGamesPlayed: 1,
      })
    );
    render(<App />);
    expect(screen.getByRole('button', { name: /Stig 1: Skilningur/ }).textContent).toContain(
      '✓ Lokið'
    );
    expect(document.body.textContent).toContain('Framvinda: 1 af 3 stigum lokið');
    expectNoRunningScore('menu');
  });

  it('show N af M rétt per level after Stig 3, and no total', () => {
    localStorage.setItem(
      'ph-titration-progress',
      JSON.stringify({
        level1Completed: true,
        level1Correct: 5,
        level1Total: 6,
        level2Completed: false,
        level3Completed: false,
      })
    );
    render(<App />);
    expect(screen.getByRole('button', { name: /Stig 1: Skilningur/ }).textContent).toContain(
      '✓ 5 af 6 rétt'
    );
    fireEvent.click(screen.getByRole('button', { name: /Stig 3: Útreikningar/ }));
    settle();
    const n = LEVEL3_CHALLENGES.length;
    answerLevel3((i) => i !== 1);
    settle();

    expect(screen.getByRole('heading', { name: 'Til hamingju!' })).toBeTruthy();
    const text = document.body.textContent ?? '';
    expect(text).toContain('5 af 6 rétt');
    expect(text).toContain(`${n - 1} af ${n} rétt`);
    expectNoRunningScore('end screen');
  });
});
