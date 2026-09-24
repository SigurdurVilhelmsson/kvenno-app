import { act, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LEVEL1_MAX_SCORE, Level1, quizQuestions } from '../components/Level1';
import { LEVEL2_MAX_SCORE, Level2, challenges } from '../components/Level2';

/**
 * The menu shows each level's best score as `score/max`, so `max` has to be
 * what a perfect run actually scores. It used to be the question count (10 and
 * 12) under a score counted in points, so a perfect Level 1 read "100/10" and
 * a perfect Level 2 "180/12". These play a perfect run through the real
 * component and hold the exported maximum to what it produced.
 */

const t = (_key: string, fallback?: string) => fallback ?? '';

afterEach(() => {
  vi.useRealTimers();
});

function clickButton(container: HTMLElement, name: RegExp) {
  fireEvent.click(within(container).getByRole('button', { name }));
}

describe('Level 1 maximum score', () => {
  it('is what a perfect run scores', () => {
    const onComplete = vi.fn();
    const { container } = render(<Level1 t={t} onComplete={onComplete} onBack={vi.fn()} />);

    // Four rules, then the warm-up, which is not scored for the level.
    for (let i = 0; i < 3; i++) clickButton(container, /Næsta regla/);
    clickButton(container, /Hefja próf/);
    for (let i = 0; i < 8; i++) {
      clickButton(container, /^Málmur/);
      clickButton(container, i < 7 ? /Næsta frumefni/ : /Hefja próf/);
    }

    // The options are shuffled at render, so find the right one by its text.
    for (let q = 0; q < quizQuestions.length; q++) {
      const { options, correctIndex } = quizQuestions[q];
      const right = within(container)
        .getAllByRole('button')
        .find((b) => b.textContent?.replace(/^[A-D]\./, '') === options[correctIndex]);
      expect(right, `question ${q + 1}`).toBeDefined();
      fireEvent.click(right!);
      clickButton(container, q < quizQuestions.length - 1 ? /Næsta spurning/ : /Ljúka stigi/);
    }

    expect(onComplete).toHaveBeenCalledTimes(1);
    const [score, maxScore] = onComplete.mock.calls[0];
    expect(score).toBe(maxScore);
    expect(maxScore).toBe(LEVEL1_MAX_SCORE);
    expect(LEVEL1_MAX_SCORE).toBe(100);
  });
});

describe('Level 2 maximum score', () => {
  const TYPE_LABELS = {
    'ionic-simple': 'Einfalt jónefni',
    'ionic-variable': 'Jónefni (breytileg hleðsla)',
    'ionic-polyatomic': 'Jónefni (fjölatóma jón)',
    molecular: 'Sameind',
  } as const;

  it('is what a perfect run scores', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const { container } = render(<Level2 t={t} onComplete={onComplete} onBack={vi.fn()} />);

    challenges.forEach((challenge, i) => {
      const typeButton = within(container)
        .getAllByRole('button')
        .find((b) => b.textContent?.startsWith(TYPE_LABELS[challenge.type]));
      fireEvent.click(typeButton!);
      // Step 1 moves on by itself after 1.5 s.
      act(() => {
        vi.advanceTimersByTime(1600);
      });
      clickButton(container, /skrifa nafnið/);
      fireEvent.change(within(container).getByRole('textbox'), {
        target: { value: challenge.correctName },
      });
      clickButton(container, /^Athuga svar$/);
      clickButton(container, i < challenges.length - 1 ? /Næsta efnasamband/ : /Ljúka stigi/);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    const [score, maxScore] = onComplete.mock.calls[0];
    expect(score).toBe(maxScore);
    expect(maxScore).toBe(LEVEL2_MAX_SCORE);
    expect(LEVEL2_MAX_SCORE).toBe(180);
  });
});
