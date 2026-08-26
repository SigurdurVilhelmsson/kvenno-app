// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { Level3 } from '../components/Level3';
import { challenges } from '../data/level3-questions';

/**
 * Level 3 rendered its options in data order, and the correct one is first in
 * the data on **all six** challenges — so "click the top button" scored 100%
 * without reading the mechanism. Level 1 of this same game already shuffled;
 * Level 3 never did.
 *
 * Two things have to hold, and the second is the one a careless fix breaks.
 * The options carry ids that are also the visible letters (a, b, c, d), so
 * shuffling has to reassign them by position or the letters come out jumbled —
 * and once reassigned, the id the student clicked no longer identifies the same
 * option in the original array. Grading therefore has to look the answer up in
 * the shuffled list. A fix that shuffles but keeps grading against
 * `challenge.options` silently marks the wrong answers correct.
 *
 * Every query is scoped to the container this test rendered, not to `screen`.
 * The repo runs vitest with `retry: 2` and no RTL auto-cleanup, so a failing
 * attempt leaves its DOM behind and a document-wide query would then see two
 * copies of the level and report something confusing instead of the real fault.
 */

/** Dismiss the teaching intro and land on the first challenge. */
function startLevel() {
  const onComplete = vi.fn();
  const rendered = render(<Level3 onComplete={onComplete} onBack={vi.fn()} />);
  const ui = within(rendered.container);
  fireEvent.click(ui.getByRole('button', { name: /Byrja æfingar/ }));
  return { onComplete, ui, ...rendered };
}

/** The option buttons, in the order the student sees them. */
function optionButtons(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll('button')).filter((b) =>
    /^[a-d]\./.test(b.textContent?.trim() ?? '')
  );
}

/**
 * The option's own text, with the leading letter and any result mark stripped.
 *
 * Matched exactly rather than by substring, because several options are
 * substrings of their siblings — challenge 1 offers both `NO₂` and `NO₂F`, so a
 * `includes()` match would find two buttons for one option and could click the
 * wrong one.
 */
function optionTextOf(button: HTMLElement): string {
  return button
    .textContent!.trim()
    .replace(/^[a-d]\.\s*/, '')
    .replace(/[✓✗]/g, '')
    .trim();
}

/** The button offering exactly this option text, if it is on screen. */
function buttonFor(container: HTMLElement, text: string): HTMLElement | undefined {
  return optionButtons(container).find((b) => optionTextOf(b) === text);
}

describe('the data this level draws from', () => {
  it('still puts the correct option first every time', () => {
    // Not a defect in itself — it is why the rendering must shuffle. If someone
    // ever reorders the data instead, this test says so rather than silently
    // becoming vacuous.
    expect(challenges.length).toBe(6);
    for (const challenge of challenges) {
      expect(challenge.options[0].correct, `challenge ${challenge.id}`).toBe(true);
    }
  });

  it('has exactly one correct option per challenge', () => {
    for (const challenge of challenges) {
      expect(challenge.options.filter((o) => o.correct).length, `challenge ${challenge.id}`).toBe(
        1
      );
    }
  });
});

describe('the options a student sees are shuffled', () => {
  it('does not always put the correct answer first', () => {
    // Mount repeatedly and record where the correct option lands. With four
    // options, the chance of it landing first in all 30 mounts by luck is
    // 4^-30, so a failure here means no shuffle at all.
    const positions = new Set<number>();
    for (let mount = 0; mount < 30; mount++) {
      const { container, unmount } = startLevel();
      const buttons = optionButtons(container);
      const correctText = challenges[0].options.find((o) => o.correct)!.text;
      positions.add(buttons.findIndex((b) => optionTextOf(b) === correctText));
      unmount();
    }
    expect(positions.size).toBeGreaterThan(1);
    expect([...positions].every((p) => p >= 0)).toBe(true);
  });

  it('still labels the buttons a, b, c, d in order', () => {
    // The ids double as the visible letters, so shuffling without reassigning
    // them would show "c. b. a. d." down the page.
    const { container, unmount } = startLevel();
    const letters = optionButtons(container).map((b) => b.textContent!.trim()[0]);
    expect(letters).toEqual(['a', 'b', 'c', 'd']);
    unmount();
  });

  it('offers every option exactly once', () => {
    const { container, unmount } = startLevel();
    const shown = optionButtons(container).map(optionTextOf);
    expect([...shown].sort()).toEqual(challenges[0].options.map((o) => o.text).sort());
    unmount();
  });
});

describe('grading follows the shuffle', () => {
  /**
   * The regression this is really here for: shuffle the options, reassign the
   * ids, then look the student's answer up in the *unshuffled* array. Every
   * assertion below passes with no shuffle at all and fails with a half-done
   * one, which is the combination worth guarding.
   */
  const playAllSix = (pick: 'correct' | 'wrong') => {
    const { onComplete, container, ui, unmount } = startLevel();

    for (let question = 0; question < challenges.length; question++) {
      const options = challenges[question].options;
      const target =
        pick === 'correct' ? options.find((o) => o.correct)! : options.find((o) => !o.correct)!;

      const button = buttonFor(container, target.text);
      expect(button, `${target.text} not on screen for challenge ${question + 1}`).toBeDefined();
      fireEvent.click(button!);
      fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));

      const next = ui.queryByRole('button', { name: 'Næsta þraut' });
      fireEvent.click(next ?? ui.getByRole('button', { name: 'Ljúka stigi 3' }));
    }

    expect(onComplete).toHaveBeenCalledTimes(1);
    const score = onComplete.mock.calls[0][0];
    unmount();
    return score;
  };

  it('scores every correct answer, wherever the shuffle put it', () => {
    // Six challenges at 20 points. Run it several times so more than one
    // arrangement is exercised.
    for (let run = 0; run < 5; run++) {
      expect(playAllSix('correct'), `run ${run}`).toBe(120);
    }
  });

  it('scores nothing when every answer is wrong', () => {
    // The mirror case. A grader reading the unshuffled array would award points
    // here roughly a quarter of the time.
    for (let run = 0; run < 5; run++) {
      expect(playAllSix('wrong'), `run ${run}`).toBe(0);
    }
  });
});
