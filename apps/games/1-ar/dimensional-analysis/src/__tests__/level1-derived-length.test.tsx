// @vitest-environment jsdom
/**
 * Stig 1 counts its challenges instead of assuming six.
 *
 * The level hardcoded six in four places — "6 áskoranir" on the intro, mastery
 * at `questionsAnswered >= 6` and `questionsCorrect >= 5`, and `maxScore` 600 —
 * while its header, progress bar and summary already read `challenges.length`.
 * Adding or removing a challenge would then have told a student who had done
 * every one that they had not mastered the level. This runs the level on the
 * first three challenges only; with the old constants that full run came out
 * not mastered, out of 600.
 */

import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level1Conceptual } from '../components/Level1Conceptual';

vi.mock('../components/challenges/challengeData', async (importOriginal) => {
  const original = await importOriginal<typeof import('../components/challenges/challengeData')>();
  return { ...original, challenges: original.challenges.slice(0, 3) };
});

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
// After the fake timers are installed, which replace `performance`.
clockPastNextGuard();

describe('a Stig 1 of three challenges', () => {
  it('says three, and a full run of three is mastered out of 300', () => {
    const onComplete = vi.fn();
    const { container } = render(<Level1Conceptual onComplete={onComplete} onBack={vi.fn()} />);
    const ui = within(container);
    const next = () => fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun|Ljúka/ }));

    expect(ui.getByText('3 áskoranir')).toBeTruthy();
    fireEvent.click(ui.getByRole('button', { name: /Byrja/ }));
    expect(container.textContent).toContain('Áskorun 1 / 3');

    fireEvent.click(ui.getByRole('button', { name: 'Bæta við 1 lítra' }));
    next();
    fireEvent.click(ui.getByRole('button', { name: '1000 mL' }));
    fireEvent.click(ui.getByRole('button', { name: '1 L' }));
    next();
    fireEvent.click(ui.getAllByRole('button').find((b) => b.textContent === '1 L1000 mL')!);
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    next();

    expect(container.textContent).toContain('Þú svaraðir 3 af 3 rétt');
    fireEvent.click(ui.getByRole('button', { name: /Halda áfram/ }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    const [progress, maxScore] = onComplete.mock.calls[0];
    expect(progress).toMatchObject({ questionsAnswered: 3, questionsCorrect: 3, mastered: true });
    expect(maxScore).toBe(300);
  });
});
