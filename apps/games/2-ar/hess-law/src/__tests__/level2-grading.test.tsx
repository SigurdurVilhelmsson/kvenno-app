// @vitest-environment jsdom
import { render, fireEvent, cleanup, within } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import { Level2 } from '../components/Level2';

/**
 * Drives the real Level 2 on puzzle 5 (SO₂ + ½O₂ → SO₃, ΔH = −99,0 kJ).
 *
 * 3 × (S + O₂ → SO₂) with 2 × (S + 3/2O₂ → SO₃) reversed also sums to −99,0 kJ, and the
 * level used to mark it correct because it compared only the sum. Queries are scoped to
 * each render's container because the repo runs vitest with `retry: 2`.
 */

afterEach(cleanup);

function openPuzzle5() {
  const view = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
  const page = within(view.container);
  fireEvent.click(page.getByRole('button', { name: '5' }));
  // The two equation cards; each holds a select button and its Snúa and ×n buttons.
  const [so2, so3] = Array.from(
    view.container.querySelectorAll<HTMLElement>('[data-equation-card]')
  );
  return { page, so2, so3 };
}

describe('hess-law level 2 grading', () => {
  it('rejects a combination that only matches the target ΔH', () => {
    const { page, so2, so3 } = openPuzzle5();
    fireEvent.click(within(so2).getByRole('button', { name: 'Margfalda með 3' }));
    fireEvent.click(within(so3).getByRole('button', { name: 'Snúa við jöfnu' }));
    fireEvent.click(within(so3).getByRole('button', { name: 'Margfalda með 2' }));
    fireEvent.click(so2);
    fireEvent.click(so3);

    // A tenth from the target's −98,9, which a grader on the number alone would pass.
    // Printed with the decimal comma.
    expect(page.getByText(/ΔH = -99,0 kJ/)).toBeTruthy();

    fireEvent.click(page.getByRole('button', { name: 'Athuga lausn' }));
    const result = page.getByText(/Ekki rétt\./).textContent ?? '';
    expect(result).toMatch(/^✗ Ekki rétt\./);
    expect(page.queryByText(/✓ Rétt!/)).toBeNull();
    // The line used to read "✗ Ekki rétt. Ekki rétt. Athugaðu …".
    expect(result).not.toMatch(/Ekki rétt\.\s*Ekki rétt/);
  });

  it('accepts the combination that builds the target equation', () => {
    const { page, so2, so3 } = openPuzzle5();
    fireEvent.click(within(so2).getByRole('button', { name: 'Snúa við jöfnu' }));
    fireEvent.click(so2);
    fireEvent.click(so3);
    fireEvent.click(page.getByRole('button', { name: 'Athuga lausn' }));
    expect(page.getByText(/✓ Rétt!/)).toBeTruthy();
    // The worked explanation prints its numbers with the decimal comma.
    expect(page.getByText(/\+296,8 \+ \(-395,7\) = -98,9 kJ/)).toBeTruthy();
  });

  it('withdraws a checked verdict when the combination is changed afterwards', () => {
    // Check a wrong answer, then fix it. The verdict line used to follow the cards live,
    // so it read "✓ Rétt! Athugaðu hvort …" — a pass beside the wrong-answer advice, with
    // no point given and the puzzle still counted open.
    const { page, so2, so3 } = openPuzzle5();
    fireEvent.click(so2);
    fireEvent.click(so3);
    fireEvent.click(page.getByRole('button', { name: 'Athuga lausn' }));
    expect(page.getByText(/✗ Ekki rétt\./)).toBeTruthy();

    fireEvent.click(within(so2).getByRole('button', { name: 'Snúa við jöfnu' }));
    expect(page.queryByText(/✓ Rétt!/)).toBeNull();
    expect(page.queryByText(/Ekki rétt/)).toBeNull();

    // Checking again grades the combination now on the cards, and counts it.
    fireEvent.click(page.getByRole('button', { name: 'Athuga lausn' }));
    expect(page.getByText(/✓ Rétt!/).textContent).toMatch(/Snúa við jöfnu 1/);
    expect(page.getByText('1/6')).toBeTruthy();
  });

  it('keeps the verdict when a multiplier already chosen is tapped again', () => {
    const { page, so2, so3 } = openPuzzle5();
    fireEvent.click(within(so2).getByRole('button', { name: 'Snúa við jöfnu' }));
    fireEvent.click(so2);
    fireEvent.click(so3);
    fireEvent.click(page.getByRole('button', { name: 'Athuga lausn' }));
    fireEvent.click(within(so3).getByRole('button', { name: 'Margfalda með 1' }));
    expect(page.getByText(/✓ Rétt!/)).toBeTruthy();
  });

  it('says "Ekki rétt" once on a wrong answer', () => {
    // Puzzle 1 with only its first equation: plainly wrong, whatever the grader.
    const view = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    const page = within(view.container);
    fireEvent.click(view.container.querySelector<HTMLElement>('button[data-equation-select]')!);
    fireEvent.click(page.getByRole('button', { name: 'Athuga lausn' }));
    const result = page.getByText(/Ekki rétt\./).textContent ?? '';
    // The line used to read "✗ Ekki rétt. Ekki rétt. Athugaðu …".
    expect(result.match(/Ekki rétt/g)).toHaveLength(1);
  });

  it('labels each equation card with its ΔH in Icelandic notation', () => {
    const { so2 } = openPuzzle5();
    expect(so2.getAttribute('aria-label')).toMatch(/ΔH = -296,8 kJ$/);
  });
});

/**
 * Each equation card was a role="button" div holding its own Snúa and ×n buttons: a button
 * a screen reader cannot present, since a button may not contain buttons (REVIEW-QUEUE D1).
 * The card is now a group, and choosing it is a real toggle button.
 */
describe('hess-law level 2 equation cards', () => {
  it('nest no button inside a button, and select through a real toggle', () => {
    const { so2 } = openPuzzle5();
    expect(document.querySelectorAll('[role="button"] button, button button')).toHaveLength(0);
    const select = within(so2).getAllByRole('button')[0];
    expect(select.getAttribute('aria-pressed')).toBe('false');
    expect(select.getAttribute('aria-label')).toMatch(/→ .*, ΔH = /);
    fireEvent.click(select);
    expect(select.getAttribute('aria-pressed')).toBe('true');
  });
});
