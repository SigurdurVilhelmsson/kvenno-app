import { act, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Level2, challenges } from '../components/Level2';

/**
 * Step 2 builds N₂O₄ as `dí + nitur + tetra + oxíð`, and the textbook's naming
 * section (ch02/m68698) says a student may keep the prefix's last vowel before
 * a vowel or drop it — "geta nemendur valið að fylgja hvorri aðferðinni sem
 * er". The grader accepted only the elided `Díniturtetroxíð`, so a student who
 * followed the steps exactly and typed `Díniturtetraoxíð` was marked wrong,
 * under a summary reading `Dí + nitur + tetra + oxíð = Díniturtetroxíð`.
 */

const t = (_key: string, fallback?: string) => fallback ?? '';

const TYPE_LABELS = {
  'ionic-simple': 'Einfalt jónefni',
  'ionic-variable': 'Jónefni (breytileg hleðsla)',
  'ionic-polyatomic': 'Jónefni (fjölatóma jón)',
  molecular: 'Sameind',
} as const;

const N2O4 = challenges.findIndex((c) => c.formula === 'N₂O₄');

afterEach(() => {
  vi.useRealTimers();
});

/** Play Level 2 up to N₂O₄, answer it with `typed`, and report the verdict. */
function answerN2O4(typed: string) {
  vi.useFakeTimers();
  const onCorrectAnswer = vi.fn();
  const onIncorrectAnswer = vi.fn();
  const { container } = render(
    <Level2
      t={t}
      onComplete={vi.fn()}
      onBack={vi.fn()}
      onCorrectAnswer={onCorrectAnswer}
      onIncorrectAnswer={onIncorrectAnswer}
    />
  );
  const click = (name: RegExp) => fireEvent.click(within(container).getByRole('button', { name }));

  for (let i = 0; i <= N2O4; i++) {
    const challenge = challenges[i];
    fireEvent.click(
      within(container)
        .getAllByRole('button')
        .find((b) => b.textContent?.startsWith(TYPE_LABELS[challenge.type]))!
    );
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    click(/skrifa nafnið/);
    fireEvent.change(within(container).getByRole('textbox'), {
      target: { value: i === N2O4 ? typed : challenge.correctName },
    });
    click(/^Athuga svar$/);
    // "Næsta" ignores a press within 400 ms of appearing (the double-tap guard).
    act(() => {
      vi.advanceTimersByTime(500);
    });
    if (i < N2O4) click(/Næsta efnasamband/);
  }

  return {
    correct: onCorrectAnswer.mock.calls.length === N2O4 + 1,
    wrong: onIncorrectAnswer.mock.calls.length,
    notQuite: within(container).queryByText('Ekki alveg') !== null,
  };
}

describe('Level 2 on N₂O₄', () => {
  it('is in the level', () => {
    expect(N2O4).toBeGreaterThanOrEqual(0);
    expect(challenges[N2O4].correctName).toBe('Díniturtetroxíð');
  });

  it('accepts the name the steps build, with the prefix vowel kept', () => {
    expect(answerN2O4('Díniturtetraoxíð')).toEqual({ correct: true, wrong: 0, notQuite: false });
  });

  it('still accepts the elided name', () => {
    expect(answerN2O4('Díniturtetroxíð')).toEqual({ correct: true, wrong: 0, notQuite: false });
  });

  it('still rejects a name with the wrong prefix', () => {
    expect(answerN2O4('Díniturpentaoxíð')).toEqual({ correct: false, wrong: 1, notQuite: true });
    expect(answerN2O4('Niturtetraoxíð')).toEqual({ correct: false, wrong: 1, notQuite: true });
  });
});
