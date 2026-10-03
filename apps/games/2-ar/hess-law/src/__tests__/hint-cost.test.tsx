// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';

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
import { gameTranslations } from '../i18n';

// Level 3 used to award 20 points for an unaided correct answer and 10 for one
// where the hint had been opened, and its button said so: "Sýna vísbendingu
// (-10 stig)". The penalty contradicts the April 2026 restructure, whose rule is
// that hint use is never penalised; it went in Aug 2026, as a flat 20.
//
// Points went altogether in Oct 2026 (mobile-pass decision 1 (b)): each level now
// reports how many it was answered right, and a hint must not change that count
// (decision 2 (b)). Each level is played through twice, once opening every hint,
// and must report the same result. This drives the real components rather than
// scanning source, so it fails if a charge comes back in any shape.

afterEach(cleanup);
clockPastNextGuard();

function playLevel1(openHints: boolean) {
  const onComplete = vi.fn();
  const { container } = render(<Level1 onComplete={onComplete} onBack={vi.fn()} />);
  const ui = within(container);
  fireEvent.click(ui.getByText('Byrja →'));
  CHALLENGES.forEach((_, i) => {
    answerLevel1(ui, level1Options(i).right, openHints);
    nextLevel1(ui);
  });
  return onComplete;
}

function playLevel2(openHints: boolean) {
  const onComplete = vi.fn();
  const { container } = render(<Level2 onComplete={onComplete} onBack={vi.fn()} />);
  const ui = within(container);
  for (const puzzle of PUZZLES) {
    solvePuzzle(ui, container, puzzle, openHints);
    nextLevel2(ui);
  }
  return onComplete;
}

/** Stig 3's six answers, read off its own feedback after a first run answering 0. */
function level3Answers() {
  const { container, unmount } = render(<Level3 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
  const ui = within(container);
  fireEvent.click(ui.getByText(/Byrja æfingar/));
  const answers: string[] = [];
  for (let i = 0; i < 6; i++) {
    answers.push(answerLevel3(ui, container, '0'));
    nextLevel3(ui);
  }
  unmount();
  return answers;
}

function playLevel3(answers: string[], openHints: boolean) {
  const onComplete = vi.fn();
  const { container } = render(<Level3 t={t} onComplete={onComplete} onBack={vi.fn()} />);
  const ui = within(container);
  fireEvent.click(ui.getByText(/Byrja æfingar/));
  for (const answer of answers) {
    answerLevel3(ui, container, answer, openHints);
    expect(ui.getByText('common.correct')).toBeTruthy();
    nextLevel3(ui);
  }
  return onComplete;
}

describe('hess-law: a hint never changes the result', () => {
  it('Stig 1 reports 6 of 6 with or without the hint open', () => {
    expect(playLevel1(false)).toHaveBeenCalledWith(6, 6);
    cleanup();
    expect(playLevel1(true)).toHaveBeenCalledWith(6, 6);
  });

  it('Stig 2 reports every puzzle solved with or without the hint open', () => {
    expect(playLevel2(false)).toHaveBeenCalledWith(PUZZLES.length, PUZZLES.length);
    cleanup();
    expect(playLevel2(true)).toHaveBeenCalledWith(PUZZLES.length, PUZZLES.length);
  });

  it('Stig 3 reports 6 of 6 with or without the hint open', () => {
    const answers = level3Answers();
    expect(playLevel3(answers, false)).toHaveBeenCalledWith(6, 6);
    cleanup();
    expect(playLevel3(answers, true)).toHaveBeenCalledWith(6, 6);
  });
});

describe('hess-law level 3 hint label', () => {
  it('offers the hint without advertising a price', () => {
    render(<Level3 t={t} onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText(/Byrja æfingar/));
    const button = screen.getByText('level3.showHint');

    // `t` here returns the key, so this asserts the call site appends nothing.
    // The locale strings themselves are covered by the i18n check below.
    expect(button.textContent).toBe('level3.showHint');
  });

  it.each(['is', 'en', 'pl'])('the %s hint label quotes no price', (locale) => {
    const label = (gameTranslations as unknown as Record<string, { level3: { showHint: string } }>)[
      locale
    ].level3.showHint;

    // Covers the three wordings this game shipped: "(-10 stig)", "(-10 points)",
    // "(-10 punktów)". A digit next to a points/grade word is the shape to catch,
    // in any of the three languages.
    expect(label).not.toMatch(/\d/);
    expect(label).not.toMatch(/stig|punkt|point|einkunn/i);
  });
});
