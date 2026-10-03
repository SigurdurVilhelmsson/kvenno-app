// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Level1 from '../components/Level1';
import Level2 from '../components/Level2';
import Level3 from '../components/Level3';
import { LEVEL1_CHALLENGES } from '../data/level1-challenges';
import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { LEVEL3_PUZZLES } from '../data/level3-puzzles';
import { BUFFER_PROBLEMS } from '../data/problems';
import { solveBuffer, solveStockRecipe } from '../engine/buffer';

/**
 * Hints are free, and no level keeps a running score (mobile-pass decisions 2 (b)
 * and 1 (b)).
 *
 * All three levels paid 100 points times the shared HintSystem's tier multiplier
 * (1.0 / 0.8 / 0.6 / 0.4), so a student who opened every tier earned 40, and the
 * HintSystem said so with its "Stig: x / y" line; the verdict read "+40 stig" and
 * the header kept the running total. Each level is now played through twice, once
 * opening every hint tier before answering, and the two runs must end the same
 * way, with no point anywhere on screen in either.
 */

beforeEach(() => {
  vi.useFakeTimers();
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** Past the 400 ms Næsta guard and any step's fade-out. */
const settle = () => act(() => void vi.advanceTimersByTime(400));

function expectNoPoints(container: HTMLElement, where: string) {
  const text = container.textContent ?? '';
  // No running score, no award and no hint cost. The level headings ("Stig 2") are
  // not matched: neither has a colon or a number before the word.
  expect(text, where).not.toMatch(/Stig:\s*\d/);
  expect(text, where).not.toMatch(/\d+\s*stig\b/);
}

/** Opens every hint tier offered, as a student who wanted all the help would. */
function openEveryHint(container: HTMLElement) {
  for (let tier = 1; tier <= 4; tier++) {
    const button = within(container).queryByRole('button', {
      name: new RegExp(`Vísbending ${tier}/4`),
    });
    if (button) fireEvent.click(button);
  }
}

function lastButton(container: HTMLElement, name: string | RegExp) {
  const all = within(container).getAllByRole('button', { name });
  return all[all.length - 1];
}

function fillLast(container: HTMLElement, values: string[]) {
  const fields = Array.from(container.querySelectorAll('input[inputmode="decimal"]'));
  const mine = fields.slice(fields.length - values.length);
  mine.forEach((field, i) => fireEvent.change(field, { target: { value: values[i] } }));
}

const comma = (n: number, dp: number) => n.toFixed(dp).replace('.', ',');
const problemOf = (id: number) => BUFFER_PROBLEMS.find((p) => p.id === id)!;

// Base molecules to add (+) or remove (−) from the 5 : 5 start of each Stig 1 challenge.
const SOLVE_L1 = [0, 4, -2, 0, 3, 0];

function playLevel1(withHints: boolean) {
  const onLevelComplete = vi.fn();
  const { container } = render(<Level1 onLevelComplete={onLevelComplete} />);
  const tap = (name: string, times = 1) => {
    for (let i = 0; i < times; i++) {
      fireEvent.click(within(container).getByRole('button', { name }));
    }
  };
  const verdicts: string[] = [];
  expect(SOLVE_L1).toHaveLength(LEVEL1_CHALLENGES.length);
  SOLVE_L1.forEach((change, i) => {
    if (withHints) openEveryHint(container);
    expectNoPoints(container, `Stig 1, challenge ${i + 1}`);
    if (change > 0) tap('Bæta við basasameind', change);
    if (change < 0) tap('Fjarlægja basasameind', -change);
    tap('Athuga stuðpúða');
    settle();
    expectNoPoints(container, `Stig 1, feedback ${i + 1}`);
    verdicts.push(container.querySelector('[aria-live="polite"]')?.textContent ?? '');
    tap(i < SOLVE_L1.length - 1 ? 'Næsta verkefni →' : 'Ljúka stigi →');
    settle();
  });
  return { onLevelComplete, verdicts };
}

function playLevel2(withHints: boolean) {
  const onComplete = vi.fn();
  const { container } = render(<Level2 onComplete={onComplete} onBack={() => {}} />);
  const verdicts: string[] = [];
  LEVEL2_PUZZLES.forEach((puzzle, i) => {
    const p = problemOf(puzzle.problemId);
    const r = solveBuffer(p);
    if (withHints) openEveryHint(container);
    expectNoPoints(container, `Stig 2, puzzle ${puzzle.id}`);
    const diff = p.targetPH - p.pKa;
    const direction = Math.abs(diff) < 0.01 ? /Jafnt/ : diff > 0 ? /Hærra/ : /Lægra/;
    fireEvent.click(within(container).getByRole('button', { name: direction }));
    fireEvent.click(lastButton(container, 'Athuga svar'));
    settle();
    fillLast(container, [comma(r.ratio, 3)]);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    settle();
    fillLast(container, [comma(r.acidMass, 3), comma(r.baseMass, 3)]);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    expectNoPoints(container, `Stig 2, verdict ${puzzle.id}`);
    verdicts.push(container.querySelector('.bg-green-100')?.textContent ?? '');
    settle();
    expectNoPoints(container, `Stig 2, solution ${puzzle.id}`);
    fireEvent.click(lastButton(container, i < LEVEL2_PUZZLES.length - 1 ? /Næsta/ : /Ljúka/));
    settle();
  });
  return { onComplete, verdicts };
}

function playLevel3(withHints: boolean) {
  const onComplete = vi.fn();
  const { container } = render(<Level3 onComplete={onComplete} onBack={() => {}} />);
  fireEvent.click(within(container).getByRole('button', { name: /Byrja/ }));
  settle();
  const verdicts: string[] = [];
  LEVEL3_PUZZLES.forEach((puzzle, i) => {
    const r = solveStockRecipe(problemOf(puzzle.problemId), puzzle);
    if (withHints) openEveryHint(container);
    expectNoPoints(container, `Stig 3, puzzle ${puzzle.id}`);
    fillLast(container, [comma(r.ratio, 3)]);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    settle();
    fillLast(container, [comma(r.acidMoles, 6), comma(r.baseMoles, 6)]);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    settle();
    fillLast(container, [comma(r.acidVolume, 2), comma(r.baseVolume, 2)]);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    expectNoPoints(container, `Stig 3, verdict ${puzzle.id}`);
    verdicts.push(container.querySelector('.bg-green-100')?.textContent ?? '');
    settle();
    expectNoPoints(container, `Stig 3, solution ${puzzle.id}`);
    fireEvent.click(lastButton(container, i < LEVEL3_PUZZLES.length - 1 ? /Næsta/ : /Ljúka/));
    settle();
  });
  return { onComplete, verdicts };
}

describe('a hint never changes the result', () => {
  it('Stig 1 ends the same with or without every hint tier open', () => {
    const plain = playLevel1(false);
    cleanup();
    const hinted = playLevel1(true);
    // The level reports that it is done, with nothing attached: every challenge must
    // be solved to move on, so there is no count to report (decision 1 (b)).
    expect(plain.onLevelComplete).toHaveBeenCalledTimes(1);
    expect(plain.onLevelComplete).toHaveBeenCalledWith();
    expect(hinted.onLevelComplete.mock.calls).toEqual(plain.onLevelComplete.mock.calls);
    expect(hinted.verdicts).toEqual(plain.verdicts);
    expect(plain.verdicts.every((v) => v.includes('Frábært! Stuðpúðinn er tilbúinn!'))).toBe(true);
  });

  it('Stig 2 ends the same with or without every hint tier open', () => {
    const plain = playLevel2(false);
    cleanup();
    const hinted = playLevel2(true);
    expect(plain.onComplete).toHaveBeenCalledTimes(1);
    expect(plain.onComplete).toHaveBeenCalledWith();
    expect(hinted.onComplete.mock.calls).toEqual(plain.onComplete.mock.calls);
    expect(hinted.verdicts).toEqual(plain.verdicts);
    expect(plain.verdicts.every((v) => v === 'Frábært!')).toBe(true);
  });

  it('Stig 3 ends the same with or without every hint tier open', () => {
    const plain = playLevel3(false);
    cleanup();
    const hinted = playLevel3(true);
    expect(plain.onComplete).toHaveBeenCalledTimes(1);
    expect(plain.onComplete).toHaveBeenCalledWith();
    expect(hinted.onComplete.mock.calls).toEqual(plain.onComplete.mock.calls);
    expect(hinted.verdicts).toEqual(plain.verdicts);
    expect(plain.verdicts.every((v) => v === 'Frábært!')).toBe(true);
  });
});
