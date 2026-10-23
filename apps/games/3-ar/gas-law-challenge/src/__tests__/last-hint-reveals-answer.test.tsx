// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { getQuestionsForLevel } from '../data';
import { questions } from '../data/questions';
import { answerText } from '../utils/gas-calculations';

/**
 * The last hint states the answer, so a right answer given with it open does not count
 * (Item 1 as applied, call 3, Siggi 2026-10-23). Every question's fourth hint ends on the
 * number the grader accepts (`Reiknaðu: V = 3,82 L`): typing it back is copying the answer,
 * as it is after "Sýna lausn" or on a retry (mobile-pass decision 93). The earlier tiers stay
 * free (decision 2).
 *
 * Until this ruling a right answer counted after every hint, so a student could open four
 * hints on each question and finish a round "13 af 13 rétt" without working one.
 *
 * Math.random is pinned to 0, so a round plays its level in the level's own order.
 */

const KEY = 'gas-law-challenge-progress';
const NOT_COUNTED = 'Síðasta vísbendingin gaf svarið, svo svarið telst ekki með.';

/** The numbers written in a string, Icelandic decimal comma included. */
const numbersIn = (text: string) => text.match(/\d+(?:,\d+)?/g) ?? [];

function settle(ms = 500) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

/** Skip the law step where there is one. */
function skipLaw() {
  const skip = screen.queryByRole('button', { name: /Sleppa/ });
  if (skip) {
    fireEvent.click(skip);
    settle();
  }
}

function openHints(count: number) {
  for (let i = 0; i < count; i++) {
    fireEvent.click(screen.getByRole('button', { name: /Vísbending \(H\)/ }));
  }
}

function answer(value: string) {
  skipLaw();
  fireEvent.change(screen.getByLabelText(/Svar fyrir/), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: /Athuga Svar/ }));
  settle();
}

function next() {
  fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
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
  // Næsta drops a press within 400 ms of appearing (the double-tap guard).
  let t = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => (t += 500));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('the hints', () => {
  it.each(questions.map((q) => [q.id, q] as const))(
    'question %i: only the last hint states the answer',
    (_id, q) => {
      const ans = answerText(q);
      expect(numbersIn(q.hints[q.hints.length - 1])).toContain(ans);
      for (const hint of q.hints.slice(0, -1)) {
        expect(numbersIn(hint), hint).not.toContain(ans);
      }
    }
  );
});

describe('Æfingahamur', () => {
  it('does not count a right answer given with the last hint open; an earlier tier still counts', () => {
    const { container } = render(<App />);
    const level3 = getQuestionsForLevel(3);
    expect(level3).toHaveLength(4);

    fireEvent.click(screen.getByRole('button', { name: /Stig 3 — Samanburður/ }));
    fireEvent.click(screen.getByRole('button', { name: /Byrja að Æfa/ }));
    settle();

    // 1: right with every hint open, the last among them. Does not count.
    skipLaw();
    openHints(level3[0].hints.length);
    answer(answerText(level3[0]));
    expect(screen.getByText(NOT_COUNTED)).toBeTruthy();
    next();

    // 2: right with every hint but the last open. Counts, and says nothing.
    skipLaw();
    openHints(level3[1].hints.length - 1);
    answer(answerText(level3[1]));
    expect(container.textContent).not.toContain('telst ekki með');
    next();

    // 3 and 4: wrong, with the last hint open: a wrong answer is not told it would not count.
    skipLaw();
    openHints(level3[2].hints.length);
    answer('999999');
    expect(container.textContent).not.toContain('telst ekki með');
    next();
    answer('999999');

    expect(screen.getByText('1 af 4 rétt')).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(KEY)!).practice).toEqual({
      3: { correct: 1, total: 4 },
    });
  });
});

describe('Keppnishamur', () => {
  it('is unchanged: the last hint is on offer there and a right answer still scores', () => {
    render(<App />);
    const first = getQuestionsForLevel(1)[0];
    fireEvent.click(screen.getByRole('button', { name: /Byrja Keppni/ }));
    settle();

    openHints(first.hints.length);
    answer(answerText(first));
    expect(screen.queryByText(NOT_COUNTED)).toBeNull();
    // Exact (150) with more than 60 s left (+50).
    expect(screen.getByText('+200 stig')).toBeTruthy();
  });
});
