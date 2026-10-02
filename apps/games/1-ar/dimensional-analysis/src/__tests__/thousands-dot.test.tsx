// @vitest-environment jsdom
/**
 * A full stop typed as the book's thousands separator (decisions item 5).
 *
 * `parseStudentNumber` reads the book's unambiguous thousands forms (`1.000.000`, `2.219,2`)
 * as thousands and keeps a lone `d.ddd` a decimal, since the book also writes `1,008`. So a
 * student who writes an answer above 1000 the book's way, `1.300`, typed 1,3. Level 2 and
 * Stig 0, whose answers pass 1000, now say so (option d) rather than grade a plain wrong
 * number. The wording is a draft awaiting Siggi's.
 */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level0SigFigs } from '../components/Level0SigFigs';
import { Level2 } from '../components/Level2';
import { level2Problems } from '../data/problems';
import { COUNT_ITEMS, ROUND_ITEMS } from '../data/sigfig-items';
import { applyFactorPath, dotReadAsDecimal, isAnswerCorrect } from '../utils/grading';

clockPastNextGuard();
afterEach(cleanup);

/** An integer from 1000 to 999 999 written with the book's thousands full stop. */
const withDot = (n: number) => `${Math.floor(n / 1000)}.${String(n % 1000).padStart(3, '0')}`;

describe('dotReadAsDecimal', () => {
  it('fires only for a full stop that made the answer a thousandth', () => {
    expect(dotReadAsDecimal('1.300', 1.3, 1300, isAnswerCorrect)).toBe(true);
    expect(dotReadAsDecimal('1,300', 1.3, 1300, isAnswerCorrect)).toBe(false);
    expect(dotReadAsDecimal('1.3', 1.3, 13, isAnswerCorrect)).toBe(false);
    expect(dotReadAsDecimal('2.5', 2.5, 1300, isAnswerCorrect)).toBe(false);
  });
});

describe('Level 2', () => {
  const index = level2Problems.findIndex((p) => {
    const value = applyFactorPath(p.startValue, p.correctPath);
    return Number.isInteger(value) && value >= 1000 && value < 1_000_000;
  });

  it('has a problem whose answer is written with one thousands group', () => {
    expect(index).toBeGreaterThanOrEqual(0);
  });

  it('says a full stop was read as a decimal point', () => {
    const problem = level2Problems[index];
    const answer = applyFactorPath(problem.startValue, problem.correctPath);
    render(
      <Level2
        onComplete={vi.fn()}
        onBack={vi.fn()}
        initialProgress={{ problemsCompleted: index, finalAnswersCorrect: 0, mastered: false }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Skipta í smella-ham/ }));
    for (const factor of problem.correctPath) {
      const label = factor.split(' / ').join('');
      fireEvent.click(screen.getAllByRole('button').find((b) => b.textContent === label)!);
    }
    fireEvent.change(screen.getByPlaceholderText('Sláðu inn svar'), {
      target: { value: withDot(answer) },
    });
    fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));
    expect(document.body.textContent).toMatch(/punktur lesinn sem tugabrotskomma/);
  });
});

describe('Stig 0', () => {
  it('says a full stop was read as a decimal point on a rounding item above 1000', () => {
    const view = within(render(<Level0SigFigs onComplete={vi.fn()} onBack={vi.fn()} />).container);
    fireEvent.click(view.getByRole('button', { name: 'Áfram í æfingu' }));
    for (let i = 0; i < COUNT_ITEMS.length; i++) {
      fireEvent.click(view.getByRole('button', { name: '1' }));
      fireEvent.click(view.getByRole('button', { name: /^(Næsta|Áfram)$/ }));
    }
    // r1: 1234 to two figures is 1200, which the book would write 1.200.
    expect(ROUND_ITEMS[0].value).toBe(1234);
    fireEvent.change(view.getByLabelText('Svarið þitt'), { target: { value: '1.200' } });
    fireEvent.click(view.getByRole('button', { name: 'Svara' }));
    expect(view.getByText(/punktur lesinn sem tugabrotskomma/)).toBeTruthy();
  });
});
