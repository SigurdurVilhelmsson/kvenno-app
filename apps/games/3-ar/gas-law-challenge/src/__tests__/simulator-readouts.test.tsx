import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { formatDecimal, parseStudentNumber } from '@shared/utils';

import { GasLawSimulator } from '../components/GasLawSimulator';
import { questions } from '../data';
import { R, type GasLawQuestion, type Variable } from '../types';
import { checkAnswer } from '../utils/gas-calculations';

/**
 * The particle simulator beside each question shows only what the question gives.
 *
 * **Why this exists.** It filled every variable it drew from somewhere, and two of the
 * sources were wrong:
 *
 * - **The unknown came from the answer key.** Before the student had answered, the
 *   volume label read `V = 3,8 L` on question 1 (answer 3,82 L, tolerance 0,08), the
 *   gauge sat at 3,7 atm on question 3, and the temperature label read `T = 305 K` on
 *   question 4 — each one a number the grader accepts. The equation line beneath printed
 *   `?` for the same variable, so the leak sat directly above its own disguise.
 * - **Variables the question never states were invented** as P = 0, n = 0 and
 *   T = 300 K. A Stig 2 or 3 question gives only the state it starts from, so every
 *   one of them printed at least one: `n = 0,00 mol` on a Boyle question,
 *   `P = 0,00 atm` with the needle on zero on an Avogadro one.
 */

const VARIABLES: Variable[] = ['P', 'V', 'T', 'n'];

function renderSimulator(question: GasLawQuestion) {
  return render(<GasLawSimulator question={question} isRunning={false} showAnswer={false} />);
}

/**
 * The gauge's needle, found by its drawing rather than by a marker attribute, so the
 * check does not depend on the markup the fix introduced: the needle is the one line in
 * the brand orange.
 */
function needle(container: HTMLElement): Element | null {
  return container.querySelector('svg line[stroke="#f36b22"]');
}

/** Everything the simulator prints, leaving out the gauge's fixed 0–10 atm scale. */
function printedText(container: HTMLElement): string {
  const clone = container.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('svg').forEach((svg) => svg.remove());
  return clone.textContent ?? '';
}

/**
 * The numbers a student could copy off the simulator. R is left out: it is a constant,
 * not a readout, and 0,08206 happens to sit within question 9's tolerance of 0,083.
 */
function printedNumbers(container: HTMLElement): number[] {
  const text = printedText(container).replaceAll(formatDecimal(R), '');
  return (text.match(/\d+(?:,\d+)?/g) ?? []).map(parseStudentNumber);
}

beforeEach(() => {
  // jsdom has no canvas; the particle simulation copes with a missing context.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const cases = questions.map((q) => [q.id, q] as const);

describe('before the student answers', () => {
  it.each(cases)('question %i prints no number the grader would accept', (_id, question) => {
    const { container } = renderSimulator(question);
    for (const value of printedNumbers(container)) {
      expect(
        checkAnswer(value, question.answer, question.tolerance),
        `question ${question.id} shows ${formatDecimal(value)}, answer ${formatDecimal(question.answer)}`
      ).toBe(false);
    }
  });

  it.each(cases.filter(([, q]) => q.find === 'P'))(
    'question %i draws no needle for the pressure it asks for',
    (_id, question) => {
      const { container } = renderSimulator(question);
      expect(needle(container)).toBeNull();
    }
  );
});

describe('variables the question does not state', () => {
  it.each(cases)('question %i prints no invented value', (_id, question) => {
    const { container } = renderSimulator(question);
    const text = printedText(container);
    const unstated = VARIABLES.filter((v) => v !== question.find && !question.given[v]);
    for (const v of unstated) {
      expect(text, `question ${question.id} invents ${v}`).not.toMatch(new RegExp(`${v} = \\d`));
    }
    if (unstated.includes('P')) {
      expect(needle(container)).toBeNull();
    }
  });

  it('are left out of the Stig 2 and 3 questions, which give only the starting state', () => {
    // A guard on the premise: every two-state question leaves at least one variable out.
    const twoState = questions.filter((q) => q.gasLaw !== 'ideal');
    expect(twoState.length).toBeGreaterThan(0);
    for (const q of twoState) {
      expect(
        VARIABLES.some((v) => v !== q.find && !q.given[v]),
        `question ${q.id}`
      ).toBe(true);
    }
  });
});

describe('variables the question gives', () => {
  it.each(cases)('question %i prints them in the equation line', (_id, question) => {
    const { container } = renderSimulator(question);
    const text = printedText(container);
    for (const v of VARIABLES) {
      const given = question.given[v];
      if (!given || v === question.find) continue;
      expect(text).toContain(`${v} = ${formatDecimal(given.value, 2)}`);
    }
  });

  it('draws the needle at a pressure the question gives', () => {
    const q1 = questions.find((q) => q.id === 1)!; // P = 1,0 atm given
    const { container } = renderSimulator(q1);
    expect(needle(container)).not.toBeNull();
  });
});
