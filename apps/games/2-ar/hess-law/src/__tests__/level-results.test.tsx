// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import {
  answerLevel1,
  answerLevel3,
  clockPastNextGuard,
  level1Options,
  nextLevel1,
  nextLevel2,
  nextLevel3,
  solvePuzzle,
  t,
} from './level-play';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { CHALLENGES } from '../data/challenges';
import { PUZZLES } from '../data/puzzles';

/**
 * No running score (mobile-pass decision 1, ruled (b)). Stig 1 and 2 showed a
 * `Stig` tile beside a `Lokið` tally of right answers, Stig 3 showed `N stig`,
 * and the menu and the end screen added the levels up into `Heildarstig`. Now
 * each level counts its right answers and reports `N af M rétt` to the menu and
 * the end screen.
 *
 * The counting rule: a right answer counts, a solve reached after a wrong check
 * included, but not an answer the level had already shown — Stig 1 marks the
 * correct option after every check, and its challenge buttons let a student go
 * back and answer it again.
 *
 * Queries are scoped to each rendered container (the repo runs vitest with
 * `retry: 2` and no RTL auto-cleanup).
 */

const RUNNING_SCORE = [/\bStig:\s*\d/, /\d+\s*stig\b/, /\d+\s*progress\.points/];
const STORAGE_KEY = 'hess-law-progress';

clockPastNextGuard();
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

function expectNoScore(container: HTMLElement) {
  for (const pattern of RUNNING_SCORE) expect(container.textContent).not.toMatch(pattern);
  // Stig 1 and 2's header tile was a bare number over the word "Stig".
  const tiles = Array.from(container.querySelectorAll('.text-xs')).map((e) => e.textContent);
  expect(tiles).not.toContain('Stig');
  expect(tiles).not.toContain('Lokið');
}

describe('Stig 1', () => {
  function start() {
    const onComplete = vi.fn();
    const { container } = render(<Level1 onComplete={onComplete} onBack={vi.fn()} />);
    const ui = within(container);
    fireEvent.click(ui.getByText('Byrja →'));
    return { ui, container, onComplete };
  }

  it('shows no score on the way and reports right answers of 6', () => {
    const { ui, container, onComplete } = start();
    CHALLENGES.forEach((_, i) => {
      const { right, wrong } = level1Options(i);
      expectNoScore(container);
      answerLevel1(ui, i % 2 === 0 ? right : wrong);
      expectNoScore(container);
      nextLevel1(ui);
    });
    expect(onComplete).toHaveBeenCalledWith(3, 6);
  });

  it('does not count a challenge answered again after its answer was shown', () => {
    const { ui, onComplete } = start();
    answerLevel1(ui, level1Options(0).wrong);
    nextLevel1(ui);
    // Back to challenge 1, whose correct option the feedback has just marked, by the
    // challenge buttons under the level (the last buttons named 1 on the page).
    fireEvent.click(ui.getAllByRole('button', { name: '1' }).at(-1)!);
    answerLevel1(ui, level1Options(0).right);
    expect(ui.getAllByText(/Rétt/).length).toBeGreaterThan(0);
    nextLevel1(ui);
    for (let i = 1; i < CHALLENGES.length; i++) {
      answerLevel1(ui, level1Options(i).right);
      nextLevel1(ui);
    }
    expect(onComplete).toHaveBeenCalledWith(5, 6);
  });
});

describe('Stig 2', () => {
  it('counts a puzzle solved after a wrong check, and shows no score', () => {
    const onComplete = vi.fn();
    const { container } = render(<Level2 onComplete={onComplete} onBack={vi.fn()} />);
    const ui = within(container);
    PUZZLES.forEach((puzzle, i) => {
      expectNoScore(container);
      if (i === 0) {
        // One card alone is plainly wrong; the answer is never shown, so the retry counts.
        fireEvent.click(container.querySelector('[data-equation-select]') as HTMLElement);
        fireEvent.click(ui.getByRole('button', { name: 'Athuga lausn' }));
        expect(ui.getByText(/✗ Ekki rétt\./)).toBeTruthy();
        fireEvent.click(ui.getByRole('button', { name: /Byrja aftur/ }));
      }
      solvePuzzle(ui, container, puzzle);
      expect(ui.getByText(/✓ Rétt!/)).toBeTruthy();
      expectNoScore(container);
      nextLevel2(ui);
    });
    expect(onComplete).toHaveBeenCalledWith(PUZZLES.length, PUZZLES.length);
  });

  it('reports a puzzle skipped as not solved', () => {
    const onComplete = vi.fn();
    const { container } = render(<Level2 onComplete={onComplete} onBack={vi.fn()} />);
    const ui = within(container);
    PUZZLES.forEach((puzzle, i) => {
      if (i === 0) {
        fireEvent.click(container.querySelector('[data-equation-select]') as HTMLElement);
        fireEvent.click(ui.getByRole('button', { name: 'Athuga lausn' }));
      } else {
        solvePuzzle(ui, container, puzzle);
      }
      nextLevel2(ui);
    });
    expect(onComplete).toHaveBeenCalledWith(PUZZLES.length - 1, PUZZLES.length);
  });
});

describe('Stig 3', () => {
  it('shows no score on the way and counts only the right answers', () => {
    const onComplete = vi.fn();
    const { container } = render(<Level3 t={t} onComplete={onComplete} onBack={vi.fn()} />);
    const ui = within(container);
    fireEvent.click(ui.getByText(/Byrja æfingar/));
    // Every answer 0, which is wrong on all six.
    for (let i = 0; i < 6; i++) {
      expectNoScore(container);
      answerLevel3(ui, container, '0');
      expectNoScore(container);
      nextLevel3(ui);
    }
    expect(onComplete).toHaveBeenCalledWith(0, 6);
  });
});

describe('the menu and the end screen', () => {
  it('show "N af M rétt" per level and no total', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ level1Completed: true, level1Correct: 4, level1Total: 6 })
    );
    const { container } = render(<App />);
    expect(container.textContent).toContain('✓ 4 af 6 rétt');
    expect(container.textContent).not.toMatch(/Heildar ?stig|Leikir spilaðir/);
    expect(container.textContent).not.toMatch(/\d+\s*stig\b/);
  });

  it('show a level saved in points as done, with no count', () => {
    localStorage.setItem(
      STORAGE_KEY,
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
    const { container } = render(<App />);
    expect(container.textContent).toContain('✓ Lokið');
    expect(container.textContent).not.toContain('500');
  });

  it('end with each level as a count after Stig 3', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        level1Completed: true,
        level1Correct: 5,
        level1Total: 6,
        level2Completed: true,
        level2Score: 600,
      })
    );
    const { container } = render(<App />);
    const ui = within(container);
    fireEvent.click(ui.getByRole('button', { name: /Stig 3: Útreikningar/ }));
    fireEvent.click(ui.getByText(/Byrja æfingar/));
    for (let i = 0; i < 6; i++) {
      fireEvent.change(ui.getByRole('textbox'), { target: { value: '0' } });
      fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
      fireEvent.click(ui.getByRole('button', { name: /Næsta þraut|Ljúka stigi 3/ }));
    }
    expect(container.textContent).toContain('Þú hefur lokið öllum stigum!');
    expect(container.textContent).toContain('5 af 6 rétt');
    expect(container.textContent).toContain('Lokið');
    expect(container.textContent).toContain('0 af 6 rétt');
    expect(container.textContent).not.toMatch(/Heildar ?stig/);
    expect(container.textContent).not.toContain('600');
  });
});
