// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Level2 from '../components/Level2';
import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { BUFFER_PROBLEMS } from '../data/problems';
import { solveBuffer } from '../engine/buffer';

/**
 * Stig 2 played through its real buttons.
 *
 * **Why this exists.** Three things a student met in Stig 2 until 2026-09-23:
 * - The direction feedback dropped `en` from the comparison in two of its three
 *   branches: `Markmiðs-pH (7,40) er stærra pKa (7,20)`.
 * - An answered step fades out for 250 ms with its button still live, so a
 *   quick second tap on the last check awarded the puzzle twice (200 stig).
 * - After the last puzzle the counter read `6 / 5` while the level faded out.
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

/** Let an answered step finish fading out, so the next step's controls are the last ones. */
const settle = () => act(() => void vi.advanceTimersByTime(400));

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

function directionOf(index: number): RegExp {
  const p = BUFFER_PROBLEMS.find((b) => b.id === LEVEL2_PUZZLES[index].problemId)!;
  const diff = p.targetPH - p.pKa;
  return Math.abs(diff) < 0.01 ? /Jafnt/ : diff > 0 ? /Hærra/ : /Lægra/;
}

/** Answer every step of puzzle `index` correctly and stop on its completion screen. */
function solve(container: HTMLElement, index: number) {
  const p = BUFFER_PROBLEMS.find((b) => b.id === LEVEL2_PUZZLES[index].problemId)!;
  const r = solveBuffer(p);
  fireEvent.click(within(container).getByRole('button', { name: directionOf(index) }));
  fireEvent.click(lastButton(container, 'Athuga svar'));
  settle();
  fillLast(container, [comma(r.ratio, 3)]);
  fireEvent.click(lastButton(container, 'Athuga svar'));
  settle();
  fillLast(container, [comma(r.acidMass, 3), comma(r.baseMass, 3)]);
  fireEvent.click(lastButton(container, 'Athuga svar'));
  settle();
}

function next(container: HTMLElement) {
  fireEvent.click(lastButton(container, /Næsta verkefni|Ljúka stigi/));
  settle();
}

describe('Stig 2 direction feedback', () => {
  it('compares with "en" whichever wrong direction is chosen', () => {
    const { container } = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    const feedback = () => container.querySelector('.bg-red-100')?.textContent ?? '';

    // Puzzle 1: pH 7,40 above pKa 7,20.
    fireEvent.click(within(container).getByRole('button', { name: /Lægra/ }));
    fireEvent.click(lastButton(container, 'Athuga svar'));
    expect(feedback()).toContain('er stærra en pKa (7,20)');
    fireEvent.click(within(container).getByRole('button', { name: /Jafnt/ }));
    fireEvent.click(lastButton(container, 'Athuga svar'));
    expect(feedback()).toContain('er stærra en pKa (7,20)');

    // The last puzzle is the one below its pKa; reach it and choose "higher".
    for (let i = 0; i < LEVEL2_PUZZLES.length - 1; i++) {
      solve(container, i);
      next(container);
    }
    expect(directionOf(LEVEL2_PUZZLES.length - 1)).toEqual(/Lægra/);
    fireEvent.click(within(container).getByRole('button', { name: /Hærra/ }));
    fireEvent.click(lastButton(container, 'Athuga svar'));
    expect(feedback()).toContain('er minna en pKa (7,20)');
  });
});

describe('Stig 2 counts each puzzle once', () => {
  it('awards a puzzle once however fast the last check is tapped twice', () => {
    const { container } = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    const p = BUFFER_PROBLEMS.find((b) => b.id === LEVEL2_PUZZLES[0].problemId)!;
    const r = solveBuffer(p);
    fireEvent.click(within(container).getByRole('button', { name: /Hærra/ }));
    fireEvent.click(lastButton(container, 'Athuga svar'));
    settle();
    fillLast(container, [comma(r.ratio, 3)]);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    settle();
    fillLast(container, [comma(r.acidMass, 3), comma(r.baseMass, 3)]);
    const check = lastButton(container, 'Athuga svar');
    fireEvent.click(check);
    fireEvent.click(check); // still on screen while it fades out
    expect(within(container).getByText('Stig: 100')).toBeTruthy();

    const nextButton = lastButton(container, /Næsta verkefni/);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    expect(within(container).getByText('2 / 5')).toBeTruthy();
  });

  it('never shows a puzzle number past the last one', () => {
    const onComplete = vi.fn();
    const { container } = render(<Level2 onComplete={onComplete} onBack={() => {}} />);
    for (let i = 0; i < LEVEL2_PUZZLES.length; i++) {
      solve(container, i);
      next(container);
    }
    expect(onComplete).toHaveBeenCalledWith(500);
    expect(container.textContent).toContain(`${LEVEL2_PUZZLES.length} / ${LEVEL2_PUZZLES.length}`);
    expect(container.textContent).not.toContain(`${LEVEL2_PUZZLES.length + 1} / `);
  });
});
