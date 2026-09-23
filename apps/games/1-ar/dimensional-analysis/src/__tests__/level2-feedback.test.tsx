// @vitest-environment jsdom
/**
 * Level 2: what the student reads around a submitted chain.
 *
 * - Numbers print with the Icelandic decimal comma. The feedback line read
 *   `Rétt! 500 mg = 0.5 g` and the start block `2.5 kg`, beside an answer field
 *   that reads the comma — ten of the fifteen problems printed a full stop.
 * - The misconception slot names only what the chain shows. It used to default
 *   to "the factor is upside down", so a student who built exactly the right
 *   chain and slipped on the arithmetic was told a factor was inverted.
 * - The "Stuðlar notaðir" panel is the student's chain, not a verdict on it, so
 *   nothing in it may be coloured "right" before anything has been checked.
 * - B11: the right factors in another order are the right chain. The grader
 *   compared position by position and marked a correct reordering wrong.
 */

import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { formatDecimal } from '@shared/utils';

import { Level2 } from '../components/Level2';
import { level2Problems } from '../data/problems';
import { applyFactorPath } from '../utils/grading';

/** How a `"1 g / 1000 mg"` factor reads as a button: numerator, then denominator. */
const label = (factor: string) => factor.split(' / ').join('');
const invert = (factor: string) => factor.split(' / ').reverse().join(' / ');

function usedPanel(): HTMLElement | null {
  return screen.queryByText('Stuðlar notaðir:')?.parentElement ?? null;
}
/** A click-mode factor button (not its copy in the "Stuðlar notaðir" panel). */
function clickModeButton(factor: string): HTMLButtonElement {
  const panel = usedPanel();
  const found = screen
    .getAllByRole('button')
    .find((b) => b.textContent === label(factor) && !(panel && panel.contains(b)));
  if (!found) throw new Error(`no click-mode button "${factor}"`);
  return found as HTMLButtonElement;
}
function renderProblem(index: number) {
  const onCorrect = vi.fn();
  const onIncorrect = vi.fn();
  render(
    <Level2
      onComplete={vi.fn()}
      onBack={vi.fn()}
      initialProgress={{ problemsCompleted: index, finalAnswersCorrect: 0, mastered: false }}
      onCorrectAnswer={onCorrect}
      onIncorrectAnswer={onIncorrect}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /Skipta í smella-ham/ }));
  return { onCorrect, onIncorrect };
}
function choose(factors: string[]) {
  for (const f of factors) fireEvent.click(clickModeButton(f));
}
function submit(answer: string) {
  fireEvent.change(screen.getByPlaceholderText('Sláðu inn svar'), { target: { value: answer } });
  fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));
}
const expected = (index: number) => {
  const p = level2Problems[index];
  return applyFactorPath(p.startValue, p.correctPath);
};

afterEach(cleanup);

describe('Level 2 — numbers print with a decimal comma', () => {
  it.each(level2Problems.map((p, i) => [p.id, i] as const))(
    '%s: no decimal point anywhere on the answered screen',
    (_id, index) => {
      const { onCorrect } = renderProblem(index);
      const problem = level2Problems[index];
      // The start block, before anything is chosen.
      expect(document.body.textContent).not.toMatch(/\d\.\d/);

      choose(problem.correctPath);
      submit(formatDecimal(expected(index)));
      expect(onCorrect).toHaveBeenCalledTimes(1);

      const verdict = screen.getByText(/^Rétt! /);
      expect(verdict.textContent).toBe(
        `Rétt! ${formatDecimal(problem.startValue)} ${problem.startUnit} = ${formatDecimal(
          expected(index)
        )} ${problem.targetUnit}`
      );
      expect(document.body.textContent).not.toMatch(/\d\.\d/);
    }
  );

  it('prints the start value the way the student is asked to write it', () => {
    renderProblem(level2Problems.findIndex((p) => p.startValue === 2.5));
    expect(screen.getByText('2,5')).toBeTruthy();
  });
});

describe('Level 2 — the misconception names only what the chain shows', () => {
  const L2_1 = level2Problems.findIndex((p) => p.id === 'L2-1');
  const RIGHT = level2Problems[L2_1].correctPath[0];

  it('does not call a factor upside down when the chain is right and the number is not', () => {
    const { onIncorrect } = renderProblem(L2_1);
    choose([RIGHT]);
    submit('5');
    expect(onIncorrect).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/snúinn/)).toBeNull();
    // The right chain is still shown, so the student can compare.
    expect(screen.getByText(/Rétta leiðin er:/)).toBeTruthy();
  });

  it('still names an inverted factor when there is one', () => {
    renderProblem(L2_1);
    choose([invert(RIGHT)]);
    submit('500000');
    expect(screen.getByText(/Stuðullinn er rangt snúinn/)).toBeTruthy();
  });

  it('does not blame inversion on a chain that inverts nothing', () => {
    // L2-6 (km → cm) with its first step right and a mass factor second: wrong,
    // but no factor is upside down, so the feedback may not say one is.
    const index = level2Problems.findIndex((p) => p.id === 'L2-6');
    const { onIncorrect } = renderProblem(index);
    choose([level2Problems[index].correctPath[0], '1000 g / 1 kg']);
    submit(formatDecimal(expected(index)));
    expect(onIncorrect).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/snúinn/)).toBeNull();
  });
});

describe('Level 2 — B11: the right factors in any order are right', () => {
  // Multiplying commutes, so a chain of exactly the right factors gives the
  // same value and leaves the same unit whichever comes first. Comparing
  // position by position marked these wrong (CURRICULUM_REVIEW.md, B11).
  const twoStep = level2Problems
    .map((p, i) => [p.id, i] as const)
    .filter(([, i]) => level2Problems[i].correctPath.length > 1);

  it('covers every multi-step problem', () => {
    expect(twoStep.length).toBeGreaterThan(0);
  });

  it.each(twoStep)('%s: the reversed chain is graded right', (_id, index) => {
    const { onCorrect, onIncorrect } = renderProblem(index);
    choose([...level2Problems[index].correctPath].reverse());
    submit(formatDecimal(expected(index)));
    expect(onIncorrect).not.toHaveBeenCalled();
    expect(onCorrect).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/^Rétt! /)).toBeTruthy();
  });

  it('still needs every right factor, and nothing else', () => {
    const index = level2Problems.findIndex((p) => p.id === 'L2-8');
    const [first, second] = level2Problems[index].correctPath;

    // One right factor short.
    let run = renderProblem(index);
    choose([second]);
    submit(formatDecimal(expected(index)));
    expect(run.onIncorrect).toHaveBeenCalledTimes(1);
    cleanup();

    // The right two plus an inverse that undoes one of them.
    run = renderProblem(index);
    choose([second, first, invert(first)]);
    submit(formatDecimal(expected(index)));
    expect(run.onIncorrect).toHaveBeenCalledTimes(1);
    cleanup();

    // A right factor beside the inverse of the other.
    run = renderProblem(index);
    choose([invert(second), first]);
    submit(formatDecimal(expected(index)));
    expect(run.onIncorrect).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Stuðullinn er rangt snúinn/)).toBeTruthy();
  });
});

describe('Level 2 — the chosen factors are not marked right before checking', () => {
  it('shows an inverted factor in neutral colours', () => {
    renderProblem(0);
    const wrong = invert(level2Problems[0].correctPath[0]);
    choose([wrong]);
    const shown = within(usedPanel() as HTMLElement).getByRole('button');
    expect(shown.textContent).toBe(label(wrong));
    expect(shown.className).not.toMatch(/green/);
  });
});
