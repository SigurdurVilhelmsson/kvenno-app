import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { clockPastNextGuard } from './next-guard-clock';
import { equilibria } from '../data/equilibria';
import type { ShiftDirection } from '../types';
import { calculateShift } from '../utils/le-chatelier';

/**
 * Points and streaks belong to Keppnishamur only (mobile-pass decision 1 (b), ruled
 * platform-wide). Lærdómshamur already showed none; it also kept a hidden score and streak,
 * and said nothing about how a sitting went.
 *
 * Now a Lærdómshamur sitting counts, and the menu shows the last one as `N af M rétt` once the
 * student goes back to it. The same stress on the same equilibrium, answered again after its
 * explanation has shown the answer, is not counted; a hint never changes the count.
 * Keppnishamur keeps its points and streak, and the gate in front of it is untouched: a
 * Lærdómshamur sitting still writes nothing to `problemsCompleted` (decision 101 is open).
 */

const STORAGE_KEY = 'kvenno-chemistry-equilibrium-shifter';

/** Anything that reads as a running score or streak. */
const SCORE_TEXT = /Stig:|stig!|röð|🔥|Heildarstig/;

const LABEL: Record<ShiftDirection, RegExp> = {
  left: /Til vinstri/,
  right: /Til hægri/,
  none: /Engin hliðrun/,
};

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

/** Put stress `i` of the first equilibrium on it and answer, rightly or not. */
function answerStress(i: number, right: boolean) {
  fireEvent.click(document.querySelectorAll('.stress-btn')[i]);
  const direction = calculateShift(equilibria[0], equilibria[0].possibleStresses[i]).direction;
  const pick = right
    ? direction
    : (['left', 'right', 'none'] as const).find((d) => d !== direction)!;
  fireEvent.click(screen.getByRole('button', { name: LABEL[pick] }));
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  // Every draw lands on the first equilibrium, N₂O₄ ⇌ 2NO₂.
  vi.spyOn(Math, 'random').mockReturnValue(0);
});
// After vi.useFakeTimers() above, which would otherwise replace the clock it spies on.
clockPastNextGuard();

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('Lærdómshamur', () => {
  it('scores nothing, and the menu shows the sitting as N af M rétt by the counting rule', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Lærdómshamur/ }));
    advance(300);

    // 1: right. Counts.
    answerStress(0, true);
    expect(container.textContent).not.toMatch(SCORE_TEXT);

    // The same stress again, after its explanation showed the answer: not counted.
    fireEvent.click(screen.getByRole('button', { name: 'Prófa annað álag' }));
    answerStress(0, true);

    // 2: wrong.
    fireEvent.click(screen.getByRole('button', { name: 'Prófa annað álag' }));
    answerStress(1, false);
    expect(container.textContent).not.toMatch(SCORE_TEXT);

    // 3: on the next equilibrium (the same one, as Math.random is pinned), right after every
    // hint. Counts: a hint never changes the count.
    fireEvent.click(screen.getByRole('button', { name: /Næsta jafnvægi/ }));
    advance(300);
    fireEvent.click(document.querySelectorAll('.stress-btn')[2]);
    for (let tier = 1; tier <= 4; tier++) {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(`Vísbending ${tier}/4`) }));
    }
    // The last tier is the worked answer.
    expect(container.textContent).toMatch(/Rétt svar:/);
    const direction = calculateShift(equilibria[0], equilibria[0].possibleStresses[2]).direction;
    fireEvent.click(screen.getByRole('button', { name: LABEL[direction] }));
    expect(container.textContent).not.toMatch(SCORE_TEXT);

    fireEvent.click(screen.getByRole('button', { name: /Til baka/ }));
    advance(300);
    expect(screen.getByText('Lærdómshamur, síðasta lota: 2 af 3 rétt')).toBeTruthy();
    expect(container.textContent).not.toMatch(SCORE_TEXT);

    // The Keppnishamur gate is as it was: a Lærdómshamur sitting writes nothing to it.
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).problemsCompleted).toBe(0);
    expect(screen.getByRole('button', { name: /Keppnishamur/ }).hasAttribute('disabled')).toBe(
      true
    );
  });

  it('shows no sitting on the menu before one is played', () => {
    render(<App />);
    expect(screen.queryByText(/síðasta lota/)).toBeNull();
  });
});

describe('Keppnishamur', () => {
  it('keeps its points', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentLevel: 0,
        problemsCompleted: 5,
        lastPlayedDate: '2026-01-01T00:00:00.000Z',
        totalTimeSpent: 0,
        levelProgress: {},
      })
    );
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Keppnishamur/ }));
    advance(300);
    expect(screen.getByText('Stig: 0')).toBeTruthy();

    const direction = calculateShift(equilibria[0], equilibria[0].possibleStresses[0]).direction;
    fireEvent.click(screen.getByRole('button', { name: LABEL[direction] }));
    expect(screen.getByText(/^\+\d+ stig!$/)).toBeTruthy();
    expect(screen.getByText(/^Stig: [1-9]\d*$/)).toBeTruthy();
  });
});
