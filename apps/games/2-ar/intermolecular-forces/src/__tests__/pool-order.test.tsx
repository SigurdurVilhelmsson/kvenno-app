// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level2, problems } from '../components/Level2';

/**
 * Stig 2 asks the student to rank compounds, picking them from a pool. The pool listed them in
 * data order, and on problems 4, 5, 8, 9 and 10 the data order IS the answer, so tapping the
 * pool top to bottom was correct on half the level without reading anything. The table under
 * the slots listed them in the same order and leaked the same way.
 *
 * Both now list the compounds in a fresh order per problem. This plays the whole level many
 * times over and asserts two things: every problem is shown in more than one order (it fails
 * against no shuffle), and ranking by the compounds themselves is still graded correct every
 * time, whatever order they were offered in (it fails against a shuffle that graded positions).
 *
 * Queries are scoped to the rendered container because the repo runs vitest with `retry: 2`
 * and no RTL auto-cleanup.
 */

// Problem 6 has two compounds, so a run shows its data order half the time: twelve runs all
// agreeing by chance is 1 in 2 048, and the suite retries.
const RUNS = 12;

/** A button by its exact text. `getByRole` recomputes the accessibility tree on every call,
 * which made twelve full runs of the level take most of a minute. */
function buttonByText(container: HTMLElement, text: RegExp): HTMLElement {
  const found = [...container.querySelectorAll('button')].find((b) =>
    text.test(b.textContent?.trim() ?? '')
  );
  if (!found) throw new Error(`no button matching ${text}`);
  return found;
}

function poolButtons(container: HTMLElement): HTMLElement[] {
  const label = within(container).getByText('Tiltæk efni:');
  return [...label.parentElement!.querySelectorAll('button')] as HTMLElement[];
}

/** The bold formula line of a pool button or table row. */
function formulaOf(el: HTMLElement): string {
  return (el.querySelector('.font-bold') ?? el).firstChild!.textContent!.trim();
}

// Næsta ignores a press within 400 ms of appearing; these tests press it at once.
clockPastNextGuard();

describe('Stig 2 pool order', () => {
  it('offers each problem in varying order and grades the ranking, not the position', () => {
    const ordersSeen = problems.map(() => new Set<string>());

    for (let run = 0; run < RUNS; run++) {
      const onComplete = vi.fn();
      const { container, unmount } = render(<Level2 onComplete={onComplete} onBack={vi.fn()} />);
      problems.forEach((problem, p) => {
        const pool = poolButtons(container).map(formulaOf);
        expect([...pool].sort(), `problem ${problem.id}: pool`).toEqual(
          problem.compounds.map((c) => c.formula).sort()
        );
        ordersSeen[p].add(pool.join(' | '));

        // The information table lists the compounds in the same order as the pool.
        const rows = [...container.querySelectorAll('tbody tr td:first-child')].map((td) =>
          td.firstChild!.textContent!.trim()
        );
        expect(rows, `problem ${problem.id}: table`).toEqual(pool);

        for (const id of problem.correctOrder) {
          const formula = problem.compounds.find((c) => c.id === id)!.formula;
          const button = poolButtons(container).find((b) => formulaOf(b) === formula)!;
          fireEvent.click(button);
        }
        fireEvent.click(buttonByText(container, /^Athuga röðun$/));
        expect(container.textContent, `problem ${problem.id}`).toContain('Rétt röðun!');
        fireEvent.click(buttonByText(container, /^(Næsta verkefni|Ljúka stigi 2)$/));
      });

      expect(onComplete).toHaveBeenCalledWith(15 * problems.length);
      unmount();
    }

    problems.forEach((problem, p) => {
      expect(ordersSeen[p].size, `problem ${problem.id}: distinct pool orders`).toBeGreaterThan(1);
    });
  }, 30_000);
});
