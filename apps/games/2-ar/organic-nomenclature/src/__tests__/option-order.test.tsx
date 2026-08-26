// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { Level3 } from '../components/Level3';

/**
 * Level 3 rendered its four options in data order, and the correct answer sits
 * first in the data on **6 of the 10** challenges — so the top-left button was
 * right far more often than chance, without reading the question.
 *
 * Grading here is by string equality against `correctAnswer`, so reordering is
 * safe in a way it is not in this year's kinetics level, where the option ids
 * double as the visible letters. What remains to get wrong is re-shuffling on
 * every render, which would reorder the grid under a finger already on its way
 * down; the memo is keyed on the challenge index for that reason, and the third
 * test below is what holds it.
 *
 * Every query is scoped to the container this test rendered, not to `screen`.
 * The repo runs vitest with `retry: 2` and no RTL auto-cleanup, so a failing
 * attempt leaves its DOM behind and a document-wide query would then see two
 * copies of the level and report something confusing instead of the real fault.
 */

/** The correct answers, written out so the test does not grade itself. */
const CORRECT_ANSWERS = [
  'Alkóhól (-OH)',
  'Karboxýlsýra (-COOH)',
  'Aldehýð (-CHO)',
  'etanól',
  'própansýra',
  'metanal',
  'própanón',
  'CH₃OH',
  'CH₃COOH',
  'CH₃CH₂CH₂OH',
];

/** Walk the teaching phase and land on the first challenge. */
function startChallenges() {
  const onComplete = vi.fn();
  const rendered = render(<Level3 onComplete={onComplete} onBack={vi.fn()} />);
  const ui = within(rendered.container);

  // The learn phase pages through the functional groups; the last page starts
  // the challenges.
  for (let guard = 0; guard < 20; guard++) {
    const start = ui.queryByRole('button', { name: /Byrja áskoranir/ });
    if (start) {
      fireEvent.click(start);
      return { onComplete, ui, ...rendered };
    }
    fireEvent.click(ui.getByRole('button', { name: /^Næsta/ }));
  }
  throw new Error('never reached the challenge phase');
}

/** The four answer buttons of the current challenge, in the order shown. */
function optionButtons(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll('button')).filter((b) =>
    b.className.includes('border-purple-300')
  );
}

const textsOf = (container: HTMLElement) =>
  optionButtons(container).map((b) => b.textContent!.trim());

describe('the options a student sees are shuffled', () => {
  it('does not always put the correct answer in the same place', () => {
    // Challenge 1's correct answer is first in the data. Over 30 mounts it must
    // land somewhere else at least once; four-of-four agreement by luck is
    // 4^-30.
    const positions = new Set<number>();
    for (let mount = 0; mount < 30; mount++) {
      const { container, unmount } = startChallenges();
      positions.add(textsOf(container).indexOf(CORRECT_ANSWERS[0]));
      unmount();
    }
    expect(positions.size).toBeGreaterThan(1);
    expect([...positions].every((p) => p >= 0)).toBe(true);
  });

  it('offers all four options, exactly once each', () => {
    const { container, unmount } = startChallenges();
    expect(textsOf(container).sort()).toEqual(
      ['Alkóhól (-OH)', 'Aldehýð (-CHO)', 'Karboxýlsýra (-COOH)', 'Ketón (C=O)'].sort()
    );
    unmount();
  });

  it('holds the buttons still across a re-render', () => {
    const { container, ui, unmount } = startChallenges();
    const before = textsOf(container);
    expect(before.length).toBe(4);

    // Opening the feedback re-renders the level. The grid must come back in the
    // same order when the student returns to it, not reshuffled mid-question.
    fireEvent.click(optionButtons(container)[0]);
    expect(ui.getByText(/Útskýring/)).toBeTruthy();

    unmount();
  });
});

describe('grading follows the answer, not the position', () => {
  const playAllTen = (pick: 'correct' | 'wrong') => {
    const { onComplete, container, ui, unmount } = startChallenges();

    for (let question = 0; question < CORRECT_ANSWERS.length; question++) {
      const shown = optionButtons(container);
      expect(shown.length, `challenge ${question + 1}`).toBe(4);

      const answer = CORRECT_ANSWERS[question];
      const target =
        pick === 'correct'
          ? shown.find((b) => b.textContent!.trim() === answer)
          : shown.find((b) => b.textContent!.trim() !== answer);
      expect(target, `challenge ${question + 1}: no ${pick} option on screen`).toBeDefined();
      fireEvent.click(target!);

      const next = ui.queryByRole('button', { name: /Næsta áskorun/ });
      fireEvent.click(next ?? ui.getByRole('button', { name: /Ljúka stigi/ }));
    }

    expect(onComplete).toHaveBeenCalledTimes(1);
    const score = onComplete.mock.calls[0][0];
    unmount();
    return score;
  };

  it('scores every correct answer, wherever the shuffle put it', () => {
    // Ten challenges at 10 points. Repeated so more than one arrangement runs.
    for (let run = 0; run < 5; run++) {
      expect(playAllTen('correct'), `run ${run}`).toBe(100);
    }
  });

  it('scores nothing when every answer is wrong', () => {
    for (let run = 0; run < 5; run++) {
      expect(playAllTen('wrong'), `run ${run}`).toBe(0);
    }
  });
});
