// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

import { parseStudentNumber } from '@shared/utils';

import { Level1 } from '../components/Level1';

/**
 * Two Stig 1 defects of the kind Stig 2 had.
 *
 * - The water example added `2,016 + 16,00` and printed the total as
 *   `18,015` — the molar mass with oxygen at 15,999, not the 16,00 on the same
 *   screen. A worked sum has to add up to what it shows.
 * - An answer `parseStudentNumber` could not read (`≈ 18`, `abc`) did nothing
 *   at all when Athuga was tapped: no feedback, no message. Stig 2 and 3 say
 *   `Ógilt gildi`; Stig 1 now does too.
 *
 * Queries are scoped to the rendered container (the repo runs `retry: 2`).
 */

afterEach(cleanup);

function start() {
  const rendered = render(<Level1 onBack={vi.fn()} onComplete={vi.fn()} />);
  return { ui: within(rendered.container), ...rendered };
}

function decimals(written: string): number {
  return written.includes(',') ? written.split(',')[1].length : 0;
}

/** Every `a + b = c g/mól` on screen adds up, to the fewest decimals among its terms. */
function expectSumsAddUp(text: string) {
  // Either spelling of the unit, so this checks the arithmetic and nothing else.
  const sums = [...text.matchAll(/([\d,]+) \+ ([\d,]+) = ([\d,]+) g\/m[oó]l/g)];
  expect(sums.length, text).toBeGreaterThan(0);
  for (const [line, a, b, total] of sums) {
    const places = Math.min(decimals(a), decimals(b));
    const expected = (parseStudentNumber(a) + parseStudentNumber(b)).toFixed(places);
    expect(total.replace(',', '.'), line).toBe(expected);
  }
}

describe('Stig 1 teaching examples', () => {
  it('add up to the totals they print', () => {
    const { ui, container } = start();

    fireEvent.click(ui.getByRole('button', { name: /Sjáum dæmi/ }));
    expectSumsAddUp(container.textContent ?? '');

    fireEvent.click(ui.getByRole('button', { name: /Eitt dæmi til/ }));
    expectSumsAddUp(container.textContent ?? '');
  });
});

describe('Stig 1 answer field', () => {
  it('says so when an answer cannot be read, instead of doing nothing', () => {
    const { ui, container } = start();
    fireEvent.click(ui.getByRole('button', { name: /Sjáum dæmi/ }));
    fireEvent.click(ui.getByRole('button', { name: /Eitt dæmi til/ }));
    fireEvent.click(ui.getByRole('button', { name: /byrja æfingar/ }));

    const field = ui.getByRole('textbox');
    fireEvent.change(field, { target: { value: '≈ 18' } });
    fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));

    expect(container.textContent).toMatch(/Ógilt gildi\. Skrifaðu tölu/);
    expect(field.getAttribute('aria-invalid')).toBe('true');
    // Nothing was graded.
    expect(ui.queryByText('Útreikningur:', { exact: false })).toBeNull();

    // Typing again clears it.
    fireEvent.change(field, { target: { value: '18' } });
    expect(container.textContent).not.toContain('Ógilt gildi');
  });
});
