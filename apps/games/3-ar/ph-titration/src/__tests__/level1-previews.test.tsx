// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Level1 } from '../components/Level1';
import { LEVEL1_CHALLENGES } from '../data/level1-challenges';

/**
 * Stig 1 draws a question's curve only where the curve does not answer it.
 * Question 1 asks which description is the strong-acid curve and drew that
 * curve, equivalence point marked at pH 7, beside the options; question 6 has
 * no curve of its own and drew a made-up one with its marker off the line.
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
const curveShown = () => screen.queryByLabelText('Títrunarferill') !== null;

/** Whether each question showed a curve before and after its answer. */
function curves(): Map<number, [boolean, boolean]> {
  render(<Level1 onComplete={() => {}} onBack={() => {}} />);
  fireEvent.click(screen.getByText(/Byrja æfingu/));
  settle();
  const seen = new Map<number, [boolean, boolean]>();
  for (const c of LEVEL1_CHALLENGES) {
    const before = curveShown();
    fireEvent.click(screen.getByText(c.options!.find((o) => o.isCorrect)!.labelIs));
    fireEvent.click(screen.getByRole('button', { name: 'Staðfesta' }));
    settle();
    seen.set(c.id, [before, curveShown()]);
    fireEvent.click(screen.getByRole('button', { name: /Næsta →|Ljúka stigi →/ }));
    settle();
  }
  return seen;
}

describe('Stig 1 curve previews', () => {
  it('shows a "which curve" question its curve only with the result', () => {
    const seen = curves();
    expect(seen.get(1)).toEqual([false, true]);
    expect(seen.get(2)).toEqual([false, true]);
  });

  it('shows the buffer question its curve throughout, and no curve where there is none', () => {
    const seen = curves();
    expect(seen.get(5)).toEqual([true, true]);
    for (const id of [3, 4, 6]) expect(seen.get(id), `question ${id}`).toEqual([false, false]);
  });

  it('marks the chosen option as pressed', () => {
    render(<Level1 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText(/Byrja æfingu/));
    settle();
    const option = screen.getByText(LEVEL1_CHALLENGES[0].options![0].labelIs).closest('button')!;
    expect(option.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(option);
    expect(option.getAttribute('aria-pressed')).toBe('true');
  });
});
