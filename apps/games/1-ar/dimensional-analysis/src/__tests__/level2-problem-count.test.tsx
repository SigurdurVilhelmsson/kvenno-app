// @vitest-environment jsdom
/**
 * Level 2 counts out of its own problem set.
 *
 * The header ("Verkefni n / 15"), the progress bar, the mastery check and the
 * maximum score all hardcoded 15. That held only while the set had exactly
 * fifteen problems: with any other number the header lied, the bar never
 * filled, and mastery was never even evaluated. Here the set is cut to three,
 * and every one of those must follow.
 */

import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { formatDecimal } from '@shared/utils';

vi.mock('../data/problems', async (importOriginal) => {
  const real = await importOriginal<typeof import('../data/problems')>();
  return { ...real, level2Problems: real.level2Problems.slice(0, 3) };
});

import { Level2 } from '../components/Level2';
import { level2Problems } from '../data/problems';
import { applyFactorPath } from '../utils/grading';

const label = (factor: string) => factor.split(' / ').join('');

function solveCurrent(index: number) {
  const problem = level2Problems[index];
  for (const factor of problem.correctPath) {
    const button = screen.getAllByRole('button').find((b) => b.textContent === label(factor));
    fireEvent.click(button!);
  }
  fireEvent.change(screen.getByPlaceholderText('Sláðu inn svar'), {
    target: { value: formatDecimal(applyFactorPath(problem.startValue, problem.correctPath)) },
  });
  fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));
}

afterEach(cleanup);

describe('Level 2 with a three-problem set', () => {
  it('counts, fills and scores out of three', () => {
    expect(level2Problems).toHaveLength(3);
    const onComplete = vi.fn();
    const { container } = render(
      <Level2
        onComplete={onComplete}
        onBack={vi.fn()}
        initialProgress={{ problemsCompleted: 0, finalAnswersCorrect: 0, mastered: false }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Skipta í smella-ham/ }));
    const bar = () => container.querySelector<HTMLElement>('.bg-blue-500.h-2')!;

    expect(screen.getByText(/Verkefni 1 \/ 3$/)).toBeTruthy();
    expect(bar().style.width).toBe('0%');

    for (let i = 0; i < 3; i++) {
      solveCurrent(i);
      fireEvent.click(
        screen.getByRole('button', { name: i < 2 ? /Næsta verkefni/ : /Ljúka stigi/ })
      );
      if (i < 2) {
        expect(screen.getByText(new RegExp(`Verkefni ${i + 2} \\/ 3$`))).toBeTruthy();
        expect(parseFloat(bar().style.width)).toBeCloseTo(((i + 1) / 3) * 100, 5);
      }
    }

    expect(onComplete).toHaveBeenCalledTimes(1);
    const [progress, maxScore] = onComplete.mock.calls[0];
    expect(progress).toEqual({ problemsCompleted: 3, finalAnswersCorrect: 3, mastered: true });
    expect(maxScore).toBe(300);
  });
});
