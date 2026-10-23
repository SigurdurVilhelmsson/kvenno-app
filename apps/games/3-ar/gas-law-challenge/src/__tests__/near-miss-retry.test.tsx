// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { getQuestionsForLevel } from '../data';
import type { GasLawQuestion } from '../types';
import { answerText } from '../utils/gas-calculations';

/**
 * A near miss used to say "Næstum rétt! Reyndu aftur." on a screen that offered only the
 * next question (mobile-pass decision 93). Ruled 2026-10-23: (a) in Æfingahamur, a
 * `Reyna aftur` button; (b) in Keppnishamur, which has no retry, the verdict no longer says
 * to try again.
 *
 * The feedback screen prints the answer, so a right answer on the retry does not count,
 * and the retry does not add a question to the round: the first answer already did.
 *
 * Math.random is pinned to 0, so a round plays its level in the level's own order.
 */

const KEY = 'gas-law-challenge-progress';

function settle(ms = 500) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

/** Wrong by 4 %: outside the question's tolerance, inside the 5 % "Næstum rétt" band. */
function nearMiss(question: GasLawQuestion): string {
  expect(question.tolerance).toBeLessThan(question.answer * 0.04);
  return String(question.answer * 1.04).replace('.', ',');
}

function answer(value: string) {
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
  // Næsta and Reyna aftur drop a press within 400 ms of appearing (the double-tap guard).
  let t = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => (t += 500));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('Æfingahamur', () => {
  it('offers Reyna aftur on a near miss, and a right retry does not count', () => {
    render(<App />);
    const level1 = getQuestionsForLevel(1);
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));
    settle();

    answer(nearMiss(level1[0]));
    expect(screen.getByText('Næstum rétt! Reyndu aftur.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Reyna aftur' }));
    settle();

    // The same question, an empty field.
    expect(screen.getByText(new RegExp(`Spurning 1 af ${level1.length}`))).toBeTruthy();
    expect((screen.getByLabelText(/Svar fyrir/) as HTMLInputElement).value).toBe('');

    answer(answerText(level1[0]));
    expect(screen.getByText(/svarið telst ekki með/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Reyna aftur' })).toBeNull();

    // Play out the round wrong: 0 right, and the retry did not add a question.
    for (let i = 1; i < level1.length; i++) {
      fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
      settle();
      answer('999999');
    }
    expect(screen.getByText(`0 af ${level1.length} rétt`)).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(KEY)!).practice).toEqual({
      1: { correct: 0, total: level1.length },
    });
  });

  it('offers no retry on an answer that is far off', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));
    settle();
    answer('999999');
    expect(screen.getByText('Ekki rétt. Athugaðu útreikninga þína.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Reyna aftur' })).toBeNull();
  });
});

describe('Keppnishamur', () => {
  it('says the near miss is outside the tolerance, and offers no retry', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja Keppni/ }));
    settle();
    answer(nearMiss(getQuestionsForLevel(1)[0]));

    expect(screen.getByText('Næstum rétt — en utan vikmarka.')).toBeTruthy();
    expect(container.textContent).not.toContain('Reyndu aftur');
    expect(screen.queryByRole('button', { name: 'Reyna aftur' })).toBeNull();
  });
});
