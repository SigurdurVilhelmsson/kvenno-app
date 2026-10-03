import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { VERDICT } from './play-helpers';
import App from '../App';
import { PROBLEMS } from '../data';
import { formatRounded } from '../utils/format';
import { calculateDeltaG, getSpontaneity } from '../utils/thermo-calculations';

/**
 * Points and streaks belong to Keppnishamur only (mobile-pass decision 1 (b), ruled
 * platform-wide).
 *
 * **Why this exists.** Æfingarhamur said "Rétt! +100 stig" on every right answer and added
 * it to a stored `score` that was never reset, so Keppnishamur's "Stig" started from a
 * lifetime total that included practice, and the menu's "Hæsta stig" and "Besta röð" mixed
 * the two modes. Now an Æfingarhamur round plays every problem of its difficulty once and ends
 * with `N af M rétt`; Keppnishamur keeps its points and streak, from 0 every run. Progress
 * saved before the change is not read.
 */

clockPastNextGuard();

const KEY = 'thermodynamics-predictor-progress';

/** Anything that reads as a running score or streak. (🔥 alone is not: it marks útvermið.) */
const SCORE_TEXT = /\d+ stig\b|\bStig\b|Runa|\d🔥|röð|Hæsta/;

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
  // jsdom has no canvas; the graph and the particle panels cope with a missing context.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  // A fixed draw, so a round's order repeats run to run.
  vi.spyOn(Math, 'random').mockReturnValue(0.37);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** The problem on screen, by its heading. */
function problemOnScreen() {
  const name = document.querySelector('[data-item-start]')!.textContent;
  return [...PROBLEMS.beginner, ...PROBLEMS.intermediate, ...PROBLEMS.advanced].find(
    (p) => p.name === name
  )!;
}

/** Answer the problem on screen at its default temperature, rightly or not. */
function answer(right: boolean) {
  const problem = problemOnScreen();
  const deltaG = calculateDeltaG(problem.deltaH, problem.deltaS, problem.defaultTemp);
  fireEvent.change(screen.getByLabelText(/ΔG° við/), {
    target: { value: right ? formatRounded(deltaG, 1) : '99999' },
  });
  fireEvent.click(
    screen.getByRole('radio', { name: right ? VERDICT[getSpontaneity(deltaG)] : /Jafnvægi/ })
  );
  fireEvent.click(screen.getByRole('button', { name: 'Athuga svar' }));
}

const scoreInHeader = () => screen.getByText('Stig').nextElementSibling!.textContent;

describe('Æfingarhamur', () => {
  it('scores nothing, plays each problem once and ends with N af M rétt', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Æfingarhamur/ }));

    const total = PROBLEMS.beginner.length;
    const seen = new Set<number>();
    for (let i = 0; i < total; i++) {
      expect(container.textContent, `problem ${i + 1}`).not.toMatch(SCORE_TEXT);
      seen.add(problemOnScreen().id);
      // Wrong on the second, fifth and eighth.
      answer(i % 3 !== 1);
      expect(container.textContent, `problem ${i + 1}, answered`).not.toMatch(SCORE_TEXT);
      if (i < total - 1) {
        expect(screen.queryByText(/Æfingu lokið/)).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
      }
    }
    expect(seen.size).toBe(total);
    expect(screen.getByText(`Æfingu lokið: ${total - 3} af ${total} rétt`)).toBeTruthy();

    // The menu shows the round, not points.
    fireEvent.click(screen.getByRole('button', { name: '← Til baka' }));
    expect(screen.getByText(`${total - 3} af ${total} rétt`)).toBeTruthy();
    expect(screen.queryByText(/Keppnismet/)).toBeNull();
    expect(JSON.parse(localStorage.getItem(KEY)!).practice).toEqual({
      beginner: { correct: total - 3, total },
    });
  });

  it('starts the round again from its end, from a fresh count', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Æfingarhamur/ }));
    for (let i = 0; i < PROBLEMS.beginner.length; i++) {
      answer(false);
      if (i < PROBLEMS.beginner.length - 1) {
        fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
      }
    }
    fireEvent.click(screen.getByRole('button', { name: /Æfa aftur/ }));
    expect(screen.getByRole('button', { name: 'Athuga svar' })).toBeTruthy();
    expect(screen.getByText('Spurning').nextElementSibling!.textContent).toBe(
      `1 af ${PROBLEMS.beginner.length}`
    );
  });
});

describe('Keppnishamur', () => {
  it('keeps its points and streak, from 0 every run, whatever practice or old storage held', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ score: 700, highScore: 700, bestStreak: 4, problemsCompleted: 7 })
    );
    const { container } = render(<App />);
    // Old progress mixed the modes: none of it is shown.
    expect(container.textContent).not.toMatch(/700|Hæsta stig|Besta röð/);

    // A right practice answer must not reach the Keppnishamur score.
    fireEvent.click(screen.getByRole('button', { name: /Æfingarhamur/ }));
    answer(true);
    fireEvent.click(screen.getByRole('button', { name: '← Til baka' }));

    fireEvent.click(screen.getByRole('button', { name: /Keppnishamur/ }));
    expect(scoreInHeader()).toBe('0');
    answer(true);
    expect(screen.getByRole('alert').textContent).toMatch(/^Rétt! \+100 stig/);
    expect(scoreInHeader()).toBe('100');
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    answer(true);
    expect(screen.getByRole('alert').textContent).toMatch(/^Rétt! \+110 stig/);
    expect(scoreInHeader()).toBe('210');

    fireEvent.click(screen.getByRole('button', { name: '← Til baka' }));
    expect(screen.getByText('Keppnismet: 210 stig')).toBeTruthy();
    expect(screen.getByText(/Besta röð \(Keppnishamur\): 2/)).toBeTruthy();

    // A new run starts from 0 again.
    fireEvent.click(screen.getByRole('button', { name: /Keppnishamur/ }));
    expect(scoreInHeader()).toBe('0');
  });
});
