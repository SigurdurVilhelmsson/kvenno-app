// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { getQuestionsForLevel } from '../data';
import { answerText } from '../utils/gas-calculations';

/**
 * Points and streaks belong to Keppnishamur only (mobile-pass decision 1 (b), ruled
 * platform-wide). Æfingahamur used to show a running score, a streak and "+150 stig" on
 * every right answer, and both modes added to one saved score, so the menu's "Stig" and
 * "Besta röð" mixed practice with Keppnishamur.
 *
 * Now a practice round plays every question of its level once and ends with `N af M rétt`.
 * A right answer counts unless the worked solution, which prints the answer, was opened
 * before it was checked; hints never change the count. Keppnishamur keeps its points and
 * streak, starting each run from 0.
 *
 * Math.random is pinned to 0, so a round plays its level in the level's own order.
 */

const KEY = 'gas-law-challenge-progress';

/** Anything that reads as a running score or streak. */
const SCORE_TEXT = /🏆|🔥|\d+ stig\b|Stig: \d|röð/;

function settle(ms = 500) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

/** Answer the question on screen, skipping the law step where there is one. */
function answer(value: string) {
  const skip = screen.queryByRole('button', { name: /Sleppa/ });
  if (skip) {
    fireEvent.click(skip);
    settle();
  }
  fireEvent.change(screen.getByLabelText(/Svar fyrir/), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: /Athuga Svar/ }));
  settle();
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
  // jsdom has no canvas; the particle simulation copes with a missing context.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  // Næsta drops a press within 400 ms of appearing (the double-tap guard); every read of
  // the clock here is half a second after the last.
  let t = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => (t += 500));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('Æfingahamur', () => {
  it('shows no score or streak, and ends a level with N af M rétt by the counting rule', () => {
    const { container } = render(<App />);
    const level3 = getQuestionsForLevel(3);
    expect(level3).toHaveLength(4);

    fireEvent.click(screen.getByRole('button', { name: /Stig 3 — Samanburður/ }));
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));
    settle();
    expect(screen.getByText(/Spurning 1 af 4/)).toBeTruthy();

    // 1: right, unaided. Counts.
    expect(container.textContent).not.toMatch(SCORE_TEXT);
    answer(answerText(level3[0]));
    expect(container.textContent).not.toMatch(SCORE_TEXT);
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    settle();

    // 2: right, but typed after opening the worked solution. Does not count.
    fireEvent.click(screen.getByRole('button', { name: /Sleppa/ }));
    settle();
    fireEvent.click(screen.getByRole('button', { name: /Sýna lausn/ }));
    answer(answerText(level3[1]));
    expect(screen.getByText(/svarið telst ekki með/)).toBeTruthy();
    expect(container.textContent).not.toMatch(SCORE_TEXT);
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    settle();

    // 3: wrong.
    answer('999999');
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    settle();

    // 4: right after every hint. Counts: a hint never changes a count.
    fireEvent.click(screen.getByRole('button', { name: /Sleppa/ }));
    settle();
    for (let i = 0; i < level3[3].hints.length; i++) {
      fireEvent.click(screen.getByRole('button', { name: /Vísbending \(H\)/ }));
    }
    expect(container.textContent).not.toMatch(SCORE_TEXT);
    answer(answerText(level3[3]));

    expect(screen.getByText('Stigi 3 lokið')).toBeTruthy();
    expect(screen.getByText('2 af 4 rétt')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Næsta spurning/ })).toBeNull();
    expect(container.textContent).not.toMatch(SCORE_TEXT);

    // The menu shows the round, not points.
    fireEvent.click(screen.getByRole('button', { name: /📊 Valmynd/ }));
    settle(1000);
    expect(screen.getByRole('button', { name: /Stig 3 — Samanburður/ }).textContent).toContain(
      '✓ 2 af 4 rétt'
    );
    expect(screen.getByText(/1 af 3 stigum/)).toBeTruthy();
    expect(container.textContent).not.toMatch(/🏆 Stig|Met á/);
    expect(JSON.parse(localStorage.getItem(KEY)!).practice).toEqual({
      3: { correct: 2, total: 4 },
    });
  });

  it('plays the level again from the end of a round, from a fresh count', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Stig 3 — Samanburður/ }));
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));
    settle();
    for (let i = 0; i < 4; i++) {
      answer('999999');
      if (i < 3) {
        fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
        settle();
      }
    }
    expect(screen.getByText('0 af 4 rétt')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Æfa stigið aftur/ }));
    settle();
    expect(screen.getByText(/Spurning 1 af 4/)).toBeTruthy();
  });
});

describe('Keppnishamur', () => {
  it('keeps its points and streak, starting each run from 0', () => {
    const { container } = render(<App />);
    const first = getQuestionsForLevel(1)[0];

    // A practice answer first: it must not reach the Keppnishamur score.
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));
    settle();
    answer(answerText(first));
    fireEvent.click(screen.getByRole('button', { name: /📊 Valmynd/ }));
    settle(1000);

    fireEvent.click(screen.getByRole('button', { name: /Byrja Keppni/ }));
    settle();
    expect(container.textContent).toContain('🏆 0');
    expect(container.textContent).toContain('🔥 0');

    answer(answerText(first));
    // Exact (150) with more than 60 s left (+50).
    expect(screen.getByText('+200 stig')).toBeTruthy();
    expect(screen.getByText('Árangur:')).toBeTruthy();
    expect(screen.getByText('Núverandi röð')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /📊 Valmynd/ }));
    settle(1000);
    expect(screen.getByText(/Met á Stigi 1: 200 stig/)).toBeTruthy();
  });
});

describe('progress saved before the change', () => {
  it('is not read: one score both modes added to is neither a count nor a best', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        score: 4350,
        questionsAnswered: 31,
        correctAnswers: 24,
        streak: 2,
        bestStreak: 9,
        hintsUsed: 5,
      })
    );
    const { container } = render(<App />);

    expect(container.textContent).not.toMatch(/4350|Met á|Besta röð|af 3 stigum|rétt\b/);
  });
});
