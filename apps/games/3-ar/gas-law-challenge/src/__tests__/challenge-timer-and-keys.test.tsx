import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';

/**
 * The challenge timer and the keyboard shortcuts, driven through the real App.
 *
 * **Why this exists.** Five defects lived here, none visible from the code at a glance:
 *
 * - When the 90 seconds ran out on an empty or unreadable field, the auto-check only
 *   printed "Vinsamlegast sláðu inn gilt númer" and the question never ended: the clock
 *   sat at 0 s and nothing was recorded.
 * - When they ran out on a typed answer, the timer effect graded it, then ran again when
 *   the screen changed and graded it a second time, so one question counted twice. From
 *   that feedback screen "Valmynd" bounced straight back, because leaving the screen re-ran
 *   the effect with the clock still at 0 and graded the answer a third time.
 * - The window's Enter handler was a closure refreshed only when the typed answer changed,
 *   so it read the clock as it stood at the last keystroke. An answer typed with 80 s left
 *   and submitted with 50 s left still took the "more than 60 s left" bonus.
 * - The same handler swallowed Enter everywhere on the game screen, so Enter on a focused
 *   button ("Sleppa", "Vísbending", a law card) checked an empty answer instead.
 * - It also took H and S typed into the answer field as shortcuts: the letter never reached
 *   the field, and S opened the worked solution.
 *
 * Math.random is pinned to 0 so each level draws its first question: question 1 on
 * Stig 1 (find V, answer 3,82 L), question 14 on Stig 2.
 */

const STATS_KEY = 'gas-law-challenge-progress';

function stats() {
  return JSON.parse(localStorage.getItem(STATS_KEY) ?? '{}') as {
    score?: number;
    questionsAnswered?: number;
    correctAnswers?: number;
  };
}

function tick(seconds: number) {
  for (let i = 0; i < seconds; i++) {
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  }
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  // jsdom has no canvas; the particle simulation copes with a missing context.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('challenge timer', () => {
  it('ends the question when time runs out on an empty field', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja Keppni/ }));

    tick(90);

    expect(screen.getByText('Tíminn rann út!')).toBeTruthy();
    expect(screen.getByText('Skref fyrir skref lausn:')).toBeTruthy();
    expect(screen.queryByText('Vinsamlegast sláðu inn gilt númer')).toBeNull();
    expect(stats().questionsAnswered).toBe(1);
    expect(stats().correctAnswers).toBe(0);
  });

  it('ends the question when time runs out on an answer it cannot read', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja Keppni/ }));
    fireEvent.change(screen.getByLabelText(/Svar fyrir/), { target: { value: 'abc' } });

    tick(90);

    expect(screen.getByText('Tíminn rann út!')).toBeTruthy();
    expect(stats().questionsAnswered).toBe(1);
  });

  it('grades a typed answer exactly once when time runs out', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja Keppni/ }));
    fireEvent.change(screen.getByLabelText(/Svar fyrir/), { target: { value: '3,82' } });

    tick(90);

    expect(screen.getByText('Skref fyrir skref lausn:')).toBeTruthy();
    expect(stats().questionsAnswered).toBe(1);
    expect(stats().correctAnswers).toBe(1);
    // Exact answer, no time bonus at 0 s left.
    expect(stats().score).toBe(150);
  });

  it('lets the student leave a timed-out feedback screen for the menu', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja Keppni/ }));
    fireEvent.change(screen.getByLabelText(/Svar fyrir/), { target: { value: '3,82' } });
    tick(90);
    act(() => {
      vi.advanceTimersByTime(500); // let the question screen finish fading out
    });

    fireEvent.click(screen.getByRole('button', { name: /📊 Valmynd/ }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('Skref fyrir skref lausn:')).toBeNull();
    expect(screen.getByRole('button', { name: /Byrja Keppni/ })).toBeTruthy();
    expect(stats().questionsAnswered).toBe(1);
  });
});

describe('Enter key', () => {
  it('reads the clock as it stands when the answer is submitted, not when it was typed', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja Keppni/ }));
    tick(10); // 80 s left
    const field = screen.getByLabelText(/Svar fyrir/);
    fireEvent.change(field, { target: { value: '3,82' } });
    tick(30); // 50 s left: no longer earns the bonus for more than 60 s

    fireEvent.keyDown(field, { key: 'Enter' });

    expect(stats().questionsAnswered).toBe(1);
    expect(stats().score).toBe(150);
  });

  it('leaves Enter on a focused button to the button', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Stig 2/ }));
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));

    const skip = screen.getByRole('button', { name: /Sleppa/ });
    // fireEvent returns false when a handler called preventDefault, which is what
    // stopped the browser turning Enter on a focused button into a click.
    expect(fireEvent.keyDown(skip, { key: 'Enter' })).toBe(true);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('does not check an empty answer while the law is still being chosen', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Stig 2/ }));
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));

    fireEvent.keyDown(document.body, { key: 'Enter' });

    expect(screen.queryByRole('alert')).toBeNull();
    expect(stats().questionsAnswered ?? 0).toBe(0);
  });

  it('leaves H and S typed into the answer field to the field', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));
    const field = screen.getByLabelText(/Svar fyrir/);

    // Not prevented, so the letter reaches the field; and neither shortcut fires.
    expect(fireEvent.keyDown(field, { key: 's' })).toBe(true);
    expect(fireEvent.keyDown(field, { key: 'h' })).toBe(true);
    expect(screen.queryByRole('button', { name: /Fela lausn/ })).toBeNull();
    expect(screen.queryByText(/💡 1:/)).toBeNull();
  });

  it('still opens the solution with S from outside the field', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));

    fireEvent.keyDown(document.body, { key: 's' });

    expect(screen.getByRole('button', { name: /Fela lausn/ })).toBeTruthy();
  });

  it('still checks the answer on Enter from outside the field once the law is chosen', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));
    fireEvent.change(screen.getByLabelText(/Svar fyrir/), { target: { value: '3,82' } });

    fireEvent.keyDown(document.body, { key: 'Enter' });

    expect(screen.getByText('Skref fyrir skref lausn:')).toBeTruthy();
    expect(stats().questionsAnswered).toBe(1);
  });
});

describe('validation message', () => {
  it('does not follow the student into the next question', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));
    fireEvent.change(screen.getByLabelText(/Svar fyrir/), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: /Athuga Svar/ }));
    expect(screen.getByRole('alert').textContent).toBe('Vinsamlegast sláðu inn gilt númer');

    fireEvent.click(screen.getByRole('button', { name: /Valmynd/ }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));

    expect(screen.queryByRole('alert')).toBeNull();
  });
});
