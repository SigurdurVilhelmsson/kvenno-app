// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Level1 } from '../components/Level1';
import { LEVEL1_CHALLENGES } from '../data/level1-challenges';

/**
 * Stig 1's feedback carries a misconception note (`Algeng villa:`), the one line
 * a student who reads nothing else still sees, so it has to name a mistake the
 * question can actually diagnose — or be left out.
 *
 * Until 2026-10-23 every wrong answer showed the same note, `… pH fer ekki
 * alltaf í 7!`, so a student wrong about methyl orange's colour at pH 2 was told
 * about pH 7 at equivalence. Mobile-pass decision 112 maps the note by question:
 * strong–strong for 1, weak–strong for 2, the buffer region for 5, choosing an
 * indicator for 6, and none for 3 and 4, which read a colour off a range.
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
  vi.useRealTimers();
});

const settle = () => act(() => vi.advanceTimersByTime(400));

/** The note each question's wrong answer must show, or null for none. */
const EXPECTED: Record<number, string | null> = {
  1: 'Sterk sýra + sterkur basi gefur pH = 7 við jafngildi',
  2: 'Veik sýra + sterkur basi gefur pH > 7 við jafngildi',
  3: null,
  4: null,
  5: 'stuðpúðasvæðið þar sem pH breytist hægt',
  6: 'Litbreytingasvið litvísisins þarf að innihalda pH við jafngildi',
};

/** The text of the `Algeng villa:` note on screen, or null when there is none. */
function shownNote(): string | null {
  const label = [...document.querySelectorAll('span')].find(
    (s) => s.textContent?.trim() === 'Algeng villa:'
  );
  return label?.parentElement?.textContent ?? null;
}

/** Plays Stig 1 through, answering every question right or every question wrong. */
function playLevel1(right: boolean): Map<number, string | null> {
  render(<Level1 onComplete={() => {}} onBack={() => {}} />);
  fireEvent.click(screen.getByText(/Byrja æfingu/));
  settle();
  const notes = new Map<number, string | null>();
  for (const challenge of LEVEL1_CHALLENGES) {
    const option = challenge.options!.find((o) => o.isCorrect === right)!;
    fireEvent.click(screen.getByText(option.labelIs));
    fireEvent.click(screen.getByRole('button', { name: 'Staðfesta' }));
    settle();
    notes.set(challenge.id, shownNote());
    fireEvent.click(screen.getByRole('button', { name: /Næsta →|Ljúka stigi →/ }));
    settle();
  }
  return notes;
}

describe('Stig 1 misconception note', () => {
  it('covers every question', () => {
    expect(Object.keys(EXPECTED).map(Number)).toEqual(LEVEL1_CHALLENGES.map((c) => c.id));
  });

  it('names the mistake each question can diagnose, and nothing on 3 and 4', () => {
    const notes = playLevel1(false);
    for (const [id, expected] of Object.entries(EXPECTED)) {
      const note = notes.get(Number(id));
      if (expected === null) expect(note, `question ${id}`).toBeNull();
      else expect(note, `question ${id}`).toContain(expected);
    }
  });

  it('never shows the old pH 7 note', () => {
    for (const note of playLevel1(false).values()) {
      expect(note ?? '').not.toContain('pH fer ekki alltaf í 7');
    }
  });

  it('shows no note on a right answer', () => {
    for (const [id, note] of playLevel1(true)) expect(note, `question ${id}`).toBeNull();
  });
});
