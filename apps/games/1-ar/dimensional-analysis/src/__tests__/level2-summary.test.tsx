// @vitest-environment jsdom
/**
 * Level 2 ends with a one-line summary — Item 1 as applied, Siggi 2026-10-23.
 *
 * Level 2 returned to the menu from its last problem with no count, while
 * Level 3 gained `Stigi lokið: N af M rétt.` and a sentence on mastery
 * (decisions item 31). Level 2's mastery is 80 % of its answers right, the
 * count itself, so the summary's count and its verdict must be the numbers
 * the level then reports. Here the set is cut to five: 4 of 5 is mastered,
 * 3 of 5 is not.
 */

import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { formatDecimal } from '@shared/utils';

vi.mock('../data/problems', async (importOriginal) => {
  const real = await importOriginal<typeof import('../data/problems')>();
  return { ...real, level2Problems: real.level2Problems.slice(0, 5) };
});

import { clockPastNextGuard } from './next-guard-clock';
import { Level2 } from '../components/Level2';
import { level2Problems } from '../data/problems';
import { applyFactorPath } from '../utils/grading';

clockPastNextGuard();

const label = (factor: string) => factor.split(' / ').join('');

/** Build the right chain on problem `index`, then type the right value or a wrong one. */
function answerCurrent(index: number, right: boolean) {
  const problem = level2Problems[index];
  for (const factor of problem.correctPath) {
    const button = screen.getAllByRole('button').find((b) => b.textContent === label(factor));
    fireEvent.click(button!);
  }
  fireEvent.change(screen.getByPlaceholderText('Sláðu inn svar'), {
    target: {
      value: right
        ? formatDecimal(applyFactorPath(problem.startValue, problem.correctPath))
        : '7777',
    },
  });
  fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));
}

const summary = () => screen.queryByText(/^Stigi lokið:/);

/** Play the five problems, right where `rights` says, and read the end. */
function play(rights: boolean[]) {
  const onComplete = vi.fn();
  render(
    <Level2
      onComplete={onComplete}
      onBack={vi.fn()}
      initialProgress={{ problemsCompleted: 0, finalAnswersCorrect: 0, mastered: false }}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /Skipta í hnappalista/ }));
  for (let i = 0; i < rights.length - 1; i++) {
    answerCurrent(i, rights[i]);
    // Nothing is summed up before the last problem.
    expect(summary()).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Næsta verkefni/ }));
  }
  answerCurrent(rights.length - 1, rights[rights.length - 1]);
  const line = summary()?.textContent;
  fireEvent.click(screen.getByRole('button', { name: 'Ljúka stigi' }));
  expect(onComplete).toHaveBeenCalledTimes(1);
  return { line, progress: onComplete.mock.calls[0][0] };
}

afterEach(cleanup);

describe('Level 2 ends with a one-line summary', () => {
  it('says a mastered run is mastered, and agrees with what the level reports', () => {
    expect(level2Problems).toHaveLength(5);
    const { line, progress } = play([true, false, true, true, true]);
    expect(line).toBe('Stigi lokið: 4 af 5 rétt. Þú hefur náð tökum á stiginu.');
    expect(progress).toEqual({ problemsCompleted: 5, finalAnswersCorrect: 4, mastered: true });
  });

  it('says an unmastered run is not, how many it needs, and agrees with the level', () => {
    const { line, progress } = play([true, false, true, false, true]);
    expect(line).toBe(
      'Stigi lokið: 3 af 5 rétt. Til að ná tökum á stiginu þarf rétt svar í 4 af 5 verkefnum.'
    );
    expect(progress).toEqual({ problemsCompleted: 5, finalAnswersCorrect: 3, mastered: false });
  });
});
