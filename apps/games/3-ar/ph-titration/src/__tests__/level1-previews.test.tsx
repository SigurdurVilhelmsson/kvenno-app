// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Level1 } from '../components/Level1';
import { indicators } from '../data/indicators';
import { LEVEL1_CHALLENGES } from '../data/level1-challenges';
import { acceptableIndicatorsFor } from '../data/level2-puzzles';
import { titrations } from '../data/titrations';
import type { MonoproticTitration } from '../types';

/**
 * Stig 1 draws a question's curve only where the curve does not answer it.
 * Question 1 asks which description is the strong-acid curve and drew that
 * curve, equivalence point marked at pH 7, beside the options; question 6 has
 * no curve of its own and drew a made-up one with its marker off the line.
 */

beforeAll(() => {
  // Stig 1 brings its feedback on screen at every width, and jsdom has no scrollBy.
  window.scrollBy = (() => {}) as never;
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

describe('Stig 1 question 1 shows three unlabelled curves', () => {
  it('draws each option as a curve and names it only to a screen reader until the result', () => {
    const { container } = render(<Level1 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText(/Byrja æfingu/));
    const options = [...container.querySelectorAll('[data-options] > button')];
    expect(options).toHaveLength(3);
    for (const option of options) {
      expect(option.querySelector('svg[aria-hidden="true"]')).toBeTruthy();
      expect(option.querySelector('.sr-only')?.textContent).toMatch(/pH byrjar/);
    }
  });
});

describe('Stig 1 question 7, a weak base titrated with a strong acid', () => {
  it("names the litvísir Stig 2 accepts for NH₃ + HCl, and the curve's falling shape", () => {
    const q = LEVEL1_CHALLENGES.find((c) => c.id === 7)!;
    const right = q.options!.find((o) => o.isCorrect)!;
    expect(right.labelIs).toMatch(/lækkar/);
    expect(right.labelIs).toMatch(/undir pH 7/);
    const nh3 = titrations.find((t) => t.type === 'strong-weak')!;
    const accepted = acceptableIndicatorsFor(nh3 as MonoproticTitration);
    const named = indicators.filter((i) =>
      right.labelIs.toLowerCase().includes(i.name.toLowerCase())
    );
    expect(named.map((i) => i.id)).toEqual(['methyl-red']);
    expect(accepted).toContain('methyl-red');
    for (const wrong of q.options!.filter((o) => !o.isCorrect)) {
      const n = indicators.filter((i) =>
        wrong.labelIs.toLowerCase().includes(i.name.toLowerCase())
      );
      // A wrong option is wrong by its curve or its litvísir, never right on both.
      expect(
        wrong.labelIs.includes('undir pH 7') &&
          wrong.labelIs.includes('lækkar') &&
          n.every((i) => accepted.includes(i.id))
      ).toBe(false);
    }
  });
});
