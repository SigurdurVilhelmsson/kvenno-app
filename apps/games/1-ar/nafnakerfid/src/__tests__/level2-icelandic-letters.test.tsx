import { act, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Level2, challenges } from '../components/Level2';

/**
 * Decision 36 (c). The grader folds the Icelandic letters away before comparing
 * (ó to o, ð to d, æ to ae), so `Kaliumbromid` is the right name typed without
 * them. It was accepted with a plain "Rétt!", which taught the flattened form:
 * a phone keyboard types every Icelandic letter, and nothing told the student
 * theirs were missing. It is still accepted, and the reply now says how the
 * name is spelled.
 */

const t = (_key: string, fallback?: string) => fallback ?? '';

afterEach(() => {
  vi.useRealTimers();
});

/** Answer Level 2's first compound, KBr, with `typed`, and report the verdict. */
function answerFirst(typed: string) {
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
  const view = within(container);
  fireEvent.click(
    view.getAllByRole('button').find((b) => b.textContent?.startsWith('Einfalt jónefni'))!
  );
  act(() => {
    vi.advanceTimersByTime(1600);
  });
  fireEvent.click(view.getByRole('button', { name: /skrifa nafnið/ }));
  fireEvent.change(view.getByRole('textbox'), { target: { value: typed } });
  fireEvent.click(view.getByRole('button', { name: /^Athuga svar$/ }));
  return {
    counted: onCorrectAnswer.mock.calls.length === 1 && onIncorrectAnswer.mock.calls.length === 0,
    verdict: container.querySelector('#nk-l2-verdict')?.textContent ?? '',
  };
}

describe('Level 2 on a name typed without Icelandic letters', () => {
  it('starts on KBr', () => {
    expect(challenges[0].correctName).toBe('Kalíumbrómíð');
  });

  it('accepts it, and shows how it is spelled', () => {
    expect(answerFirst('Kaliumbromid')).toEqual({
      counted: true,
      verdict: 'Rétt — en skrifaðu Kalíumbrómíð',
    });
  });

  it('does so for a name missing only one of its letters', () => {
    expect(answerFirst('Kalíumbrómid').verdict).toBe('Rétt — en skrifaðu Kalíumbrómíð');
  });

  // One render per test: a second game rendered beside the first, with fake timers installed
  // again, left the second one's verdict empty in CI.
  it('says only "Rétt!" when the letters are all there', () => {
    expect(answerFirst('Kalíumbrómíð')).toEqual({ counted: true, verdict: 'Rétt!' });
  });

  it('says only "Rétt!" whatever the case and spacing', () => {
    expect(answerFirst(' kalíum brómíð ')).toEqual({ counted: true, verdict: 'Rétt!' });
  });

  it('still marks a wrong name wrong', () => {
    expect(answerFirst('Kaliumklorid')).toEqual({ counted: false, verdict: 'Ekki alveg' });
  });
});
