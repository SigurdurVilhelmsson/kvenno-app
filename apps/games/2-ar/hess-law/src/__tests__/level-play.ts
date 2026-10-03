import { fireEvent, within } from '@testing-library/react';
import { afterEach, beforeEach, vi, type MockInstance } from 'vitest';

import { CHALLENGES } from '../data/challenges';
import { type Puzzle } from '../data/puzzles';

/**
 * Plays the three levels by their buttons, for the tests that need a whole run.
 * The answers come from where the level itself gets them — Stig 1's correct
 * option and Stig 2's stored solution in the data files, Stig 3's from its own
 * feedback — so a change to the ΔH°f values does not break the runs.
 */

export type Ui = ReturnType<typeof within>;

/**
 * Næsta ignores a press within 400 ms of appearing (`useArmedAfter`). These
 * tests press it at once, so every read of the clock is half a second after the
 * last. Call once at the top of a test file.
 */
export function clockPastNextGuard(): void {
  let spy: MockInstance<() => number> | undefined;
  beforeEach(() => {
    let now = 0;
    spy = vi.spyOn(performance, 'now').mockImplementation(() => (now += 500));
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    Element.prototype.scrollIntoView = vi.fn();
  });
  afterEach(() => spy?.mockRestore());
}

/** The text of challenge `index`'s correct option, and of one wrong one, in Stig 1. */
export function level1Options(index: number) {
  const { options } = CHALLENGES[index];
  return {
    right: options.find((o) => o.correct)!.text,
    wrong: options.find((o) => !o.correct)!.text,
  };
}

/** Answer the Stig 1 challenge on screen with `option`. */
export function answerLevel1(ui: Ui, option: string, openHint = false) {
  if (openHint) fireEvent.click(ui.getByRole('button', { name: /Sýna vísbendingu/ }));
  fireEvent.click(ui.getByRole('button', { name: option }));
  fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
}

export const nextLevel1 = (ui: Ui) =>
  fireEvent.click(ui.getByRole('button', { name: /Næsta verkefni|Ljúka stigi/ }));

/** Build `puzzle`'s stored solution on the cards and check it. */
export function solvePuzzle(ui: Ui, container: HTMLElement, puzzle: Puzzle, openHint = false) {
  if (openHint) fireEvent.click(ui.getByRole('button', { name: /Sýna vísbendingu/ }));
  const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-equation-card]'));
  for (const step of puzzle.solution) {
    const element = cards[puzzle.availableEquations.findIndex((e) => e.id === step.equationId)];
    const card = within(element);
    if (step.reverse) fireEvent.click(card.getByRole('button', { name: 'Snúa við jöfnu' }));
    if (step.multiply !== 1) {
      fireEvent.click(card.getByRole('button', { name: `Margfalda með ${step.multiply}` }));
    }
    fireEvent.click(element.querySelector('[data-equation-select]') as HTMLElement);
  }
  fireEvent.click(ui.getByRole('button', { name: 'Athuga lausn' }));
}

export const nextLevel2 = (ui: Ui) =>
  fireEvent.click(ui.getByRole('button', { name: /Næsta þraut|Ljúka stigi/ }));

/** Stig 3's `t` stub: keys stay visible as text. */
export const t = (key: string, fallback?: string) => fallback ?? key;

/** Answer the Stig 3 challenge on screen with `value`; return the answer its feedback prints. */
export function answerLevel3(ui: Ui, container: HTMLElement, value: string, openHint = false) {
  if (openHint) fireEvent.click(ui.getByText('level3.showHint'));
  fireEvent.change(ui.getByPlaceholderText('level3.placeholder'), { target: { value } });
  fireEvent.click(ui.getByText('level3.check'));
  return /level3\.correctAnswer\s+(\S+)/.exec(container.textContent ?? '')![1];
}

export const nextLevel3 = (ui: Ui) =>
  fireEvent.click(ui.getByText(/^level3\.(nextChallenge|completeLevel)$/));
