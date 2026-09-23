// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Level1 } from '../components/Level1';

/**
 * Level 1's number questions, played through the real component.
 *
 *  - The grader read the answer with `parseInt`, which keeps the integer part:
 *    "4.5" was graded as 4, so a non-whole count of electrons was marked right.
 *  - OH⁻'s breakdown printed the electron the charge adds, +1, under the label
 *    "Hleðsla" — telling the student the ion's charge is +1.
 *
 * Queries are scoped to the rendered container, since the suite runs with retries.
 */

function renderLevel() {
  const rendered = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
  const { container } = rendered;
  const ui = within(container);
  const answer = (value: string) => {
    fireEvent.change(ui.getByPlaceholderText('?'), { target: { value } });
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
  };
  return { ui, container, answer };
}

afterEach(() => {
  cleanup();
});

describe('a count is graded as the number typed', () => {
  it('marks 4.5 wrong where the answer is 4', () => {
    const { container, answer } = renderLevel();
    // Question 1: valence electrons of carbon, 4.
    answer('4.5');
    // A wrong answer's explanation opens with the right one. Before the fix
    // this was graded correct, and no "Rétt svar" was shown.
    expect(container.textContent).toContain('Rétt svar: 4.');
  });

  it('still marks 4 right', () => {
    const { container, answer } = renderLevel();
    answer('4');
    expect(container.textContent).not.toContain('Rétt svar:');
  });
});

describe('the charge column states the charge', () => {
  it('shows OH⁻’s −1 being subtracted, not a charge of +1', () => {
    const { ui, answer } = renderLevel();
    // Questions 1–5: C, Cl, H₂O, NH₃, CO₂.
    for (const value of ['4', '7', '8', '8', '16']) {
      answer(value);
      fireEvent.click(ui.getByRole('button', { name: 'Næsta þraut' }));
    }
    expect(ui.getByText('OH⁻')).toBeTruthy();
    const label = ui.getByText('Hleðsla');
    // Before the fix: "+1".
    expect(label.nextElementSibling?.textContent).toBe('−(−1) = +1');
  });
});
