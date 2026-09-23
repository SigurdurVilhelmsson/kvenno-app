// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Level3 } from '../components/Level3';

/**
 * Level 3 rendered its options in data order, and the data holds the correct
 * one second on 6 of the 8 challenges and first on the other two — so "the
 * middle one" beat reading the question, the defect `2-ar/organic-nomenclature`
 * Level 3 was fixed for at 6 of 10.
 *
 * Options now shuffle once per challenge (a `useMemo` keyed on the index, the
 * repo's idiom). Grading reads each option's own `correct` flag, which travels
 * with it, so reordering cannot mis-score; the second block plays the level
 * through to prove it.
 *
 * Queries are scoped to the rendered container: the repo runs vitest with
 * `retry: 2` and no RTL auto-cleanup.
 */

/** The correct answers, written out so the test does not grade itself. */
const CORRECT = [
  'FC = Gildisraf. - (óbundnar + ½ bundnar)',
  '0',
  '+1',
  ':C≡O: með þreföldum tengslum',
  '2 formúlur',
  '3 formúlur',
  'Sameindin er vokblendingur allra formúlanna',
  'Lágmarka formhleðslur (helst 0)',
];

function renderLevel() {
  const onComplete = vi.fn();
  const rendered = render(<Level3 onComplete={onComplete} onBack={vi.fn()} />);
  const ui = within(rendered.container);
  /** The option buttons, in the order shown — the only left-aligned buttons. */
  const options = () =>
    [...rendered.container.querySelectorAll('button')].filter((b) =>
      b.className.includes('text-left')
    );
  /** An option's own text, without the explanation shown under it once answered. */
  const textOf = (b: HTMLElement) => b.querySelector('span')?.textContent ?? '';
  return { onComplete, ui, options, textOf, unmount: rendered.unmount };
}

afterEach(() => {
  cleanup();
});

describe('the options are shuffled', () => {
  it('does not always put the correct answer in the same place', () => {
    // Question 1's answer is first in the data. Over 30 mounts it must land
    // elsewhere at least once; staying put by luck is 3^-29.
    const positions = new Set<number>();
    for (let mount = 0; mount < 30; mount++) {
      const level = renderLevel();
      positions.add(level.options().map(level.textOf).indexOf(CORRECT[0]));
      level.unmount();
    }
    expect([...positions].every((p) => p >= 0)).toBe(true);
    // Before the fix: {0}.
    expect(positions.size).toBeGreaterThan(1);
  });

  it('holds the order still while the student chooses', () => {
    const level = renderLevel();
    const before = level.options().map(level.textOf);
    fireEvent.click(level.options()[2]);
    expect(level.options().map(level.textOf)).toEqual(before);
  });
});

describe('grading follows the answer, not the position', () => {
  const playAll = (pick: 'correct' | 'wrong') => {
    const level = renderLevel();
    for (let q = 0; q < CORRECT.length; q++) {
      const shown = level.options();
      const target = shown.find((b) =>
        pick === 'correct' ? level.textOf(b) === CORRECT[q] : level.textOf(b) !== CORRECT[q]
      );
      expect(target, `question ${q + 1}: no ${pick} option`).toBeDefined();
      fireEvent.click(target!);
      fireEvent.click(level.ui.getByRole('button', { name: 'Athuga svar' }));
      expect(level.ui.getByText(pick === 'correct' ? 'Rétt!' : 'Rangt')).toBeTruthy();
      fireEvent.click(level.ui.getByRole('button', { name: /Næsta þraut|Ljúka stigi 3/ }));
    }
    return level.onComplete;
  };

  it('scores every correct answer', () => {
    expect(playAll('correct')).toHaveBeenCalledWith(8 * 15);
  });

  it('scores no wrong answer', () => {
    expect(playAll('wrong')).toHaveBeenCalledWith(0);
  });
});
